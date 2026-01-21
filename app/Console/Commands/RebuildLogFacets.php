<?php

namespace App\Console\Commands;

use DateTimeInterface;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;

class RebuildLogFacets extends Command
{
    protected $signature = 'logs:rebuild-facets {--fresh : Delete existing facet values before rebuilding} {--batch=1000 : Mongo cursor batch size} {--chunk=1000 : Bulk write chunk size}';
    protected $description = 'Rebuild log facets from current log messages.';

    public function handle(): int
    {
        $batchSize = (int) $this->option('batch');
        $batchSize = max(100, min($batchSize, 5000));

        $chunkSize = (int) $this->option('chunk');
        $chunkSize = max(100, min($chunkSize, 5000));

        $db = DB::connection('mongodb')->getMongoDB();
        $messages = $db->selectCollection('log_messages');
        $facets = $db->selectCollection('log_facets');

        if ($this->option('fresh')) {
            $facets->deleteMany([]);
            $this->info('Cleared existing facets.');
        }

        $cursor = $messages->find(
            [],
            [
                'projection' => [
                    'timestamp' => 1,
                    'level' => 1,
                    'stream' => 1,
                    'workload' => 1,
                    'logger' => 1,
                    'meta' => 1,
                ],
                'sort' => ['_id' => 1],
                'batchSize' => $batchSize,
            ]
        );

        $nowMs = (int) round(microtime(true) * 1000);
        $valuesByType = [];
        $processed = 0;

        foreach ($cursor as $doc) {
            $processed++;
            $timestampMs = $this->extractTimestampMs($doc['timestamp'] ?? null, $nowMs);
            $meta = is_array($doc['meta'] ?? null) ? $doc['meta'] : [];

            $this->collectFacetValue($valuesByType, 'level', $doc['level'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'stream', $doc['stream'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'workload', $doc['workload'] ?? ($meta['workload'] ?? null), $timestampMs);
            $this->collectFacetValue($valuesByType, 'logger', $doc['logger'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'host', $meta['host'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'container', $meta['container'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'image', $meta['image'] ?? null, $timestampMs);
            $this->collectFacetValue($valuesByType, 'identifier', $meta['identifier'] ?? null, $timestampMs);
        }

        $upserts = $this->upsertFacets($facets, $valuesByType, $chunkSize);

        $this->info('Processed log messages: ' . $processed);
        $this->info('Upserted facet values: ' . $upserts);

        return Command::SUCCESS;
    }

    private function extractTimestampMs(mixed $value, int $fallback): int
    {
        if ($value instanceof UTCDateTime) {
            return (int) $value->toDateTime()->format('Uv');
        }

        if ($value instanceof DateTimeInterface) {
            return (int) $value->format('Uv');
        }

        return $fallback;
    }

    private function collectFacetValue(array &$valuesByType, string $type, mixed $value, int $timestampMs): void
    {
        if (!is_string($value)) {
            return;
        }

        $value = trim($value);
        if ($value === '') {
            return;
        }

        if (!isset($valuesByType[$type][$value])) {
            $valuesByType[$type][$value] = [
                'first' => $timestampMs,
                'last' => $timestampMs,
            ];
            return;
        }

        if ($timestampMs < $valuesByType[$type][$value]['first']) {
            $valuesByType[$type][$value]['first'] = $timestampMs;
        }
        if ($timestampMs > $valuesByType[$type][$value]['last']) {
            $valuesByType[$type][$value]['last'] = $timestampMs;
        }
    }

    private function upsertFacets($collection, array $valuesByType, int $chunkSize): int
    {
        $updates = [];
        $count = 0;

        foreach ($valuesByType as $type => $values) {
            foreach ($values as $value => $timestamps) {
                $updates[] = [
                    'updateOne' => [
                        ['type' => $type, 'value' => $value],
                        [
                            '$set' => [
                                'last_seen' => new UTCDateTime($timestamps['last']),
                                'first_seen' => new UTCDateTime($timestamps['first']),
                            ],
                        ],
                        ['upsert' => true],
                    ],
                ];

                if (count($updates) >= $chunkSize) {
                    $collection->bulkWrite($updates, ['ordered' => false]);
                    $count += count($updates);
                    $updates = [];
                }
            }
        }

        if (!empty($updates)) {
            $collection->bulkWrite($updates, ['ordered' => false]);
            $count += count($updates);
        }

        return $count;
    }
}
