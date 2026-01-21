<?php

namespace App\Http\Controllers;

use DateTimeImmutable;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use MongoDB\BSON\UTCDateTime;
use Symfony\Component\HttpFoundation\Response;

class LogIngestController extends Controller
{
    public function ingest(Request $request): Response
    {
        // 1) Super-tunn auth (statisk token)
        $expected = (string) config('services.log_ingest.token', env('LOG_INGEST_TOKEN', ''));
        if ($expected === '') {
            return response('ingest token not configured', 500);
        }

        $auth = (string) $request->header('Authorization', '');
        if (!$this->isBearerToken($auth, $expected)) {
            return response('unauthorized', 401);
        }

        $raw = $request->getContent();
        if ($raw === '' || $raw === null) {
            return response('', 204);
        }

        $lines = preg_split("/\r\n|\n|\r/", $raw);
        if (!$lines) {
            return response('', 204);
        }

        $docs = [];
        $docsCount = 0;

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '') continue;

            $event = json_decode($line, true);
            if (!is_array($event)) {
                continue;
            }

            $tsValue = $event['ts'] ?? $event['timestamp'] ?? $event['time'] ?? null;
            $meta = $event['meta'] ?? [];
            $msg = $event['message'] ?? null;

            if (!is_string($msg) || $msg === '') {
                continue;
            }

            if (!is_array($meta)) {
                $meta = [];
            }

            $ts = $this->toUtcDateTime($tsValue);
            if ($ts === null) continue;

            $meta = $this->normalizeMeta($meta, $event);

            $doc = [
                'timestamp' => $ts,
                'meta' => $meta,
                'message' => $msg,
            ];

            if (isset($event['level']) && is_string($event['level'])) {
                $doc['level'] = $event['level'];
            }
            if (isset($event['stream']) && is_string($event['stream'])) {
                $doc['stream'] = $event['stream'];
            }
            if (isset($event['workload']) && is_string($event['workload'])) {
                $doc['workload'] = $event['workload'];
            } elseif (isset($meta['workload']) && is_string($meta['workload'])) {
                $doc['workload'] = $meta['workload'];
            }
            if (isset($event['container_id']) && is_string($event['container_id'])) {
                $doc['container_id'] = $event['container_id'];
            }
            if (isset($event['event_id']) && is_string($event['event_id'])) {
                $doc['event_id'] = $event['event_id'];
            }

            foreach (['trace_id', 'request_id', 'logger'] as $k) {
                if (isset($event[$k]) && (is_string($event[$k]) || is_int($event[$k]))) {
                    $doc[$k] = $event[$k];
                }
            }

            $docs[] = $doc;
            $docsCount++;

            if (count($docs) >= 1000) {
                $this->insertMany($docs);
                $docs = [];
            }
        }

        if (!empty($docs)) {
            $this->insertMany($docs);
        }

        return response('', 204);
    }

    private function insertMany(array $docs): void
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $collection->insertMany($docs, ['ordered' => false]);
        $this->upsertFacets($docs);
    }

    private function isBearerToken(string $header, string $expected): bool
    {
        if (stripos($header, 'Bearer ') !== 0) return false;
        $token = substr($header, 7);

        return hash_equals($expected, $token);
    }

    private function toUtcDateTime(mixed $value): ?UTCDateTime
    {
        try {
            if (is_int($value) || is_float($value)) {
                $ms = $this->normalizeUnixMillis((float) $value);
                return new UTCDateTime($ms);
            }

            if (is_string($value)) {
                $value = trim($value);
                if ($value === '') {
                    return null;
                }

                if (is_numeric($value)) {
                    $ms = $this->normalizeUnixMillis((float) $value);
                    return new UTCDateTime($ms);
                }

                $dt = new DateTimeImmutable($value);
                $ms = (int) $dt->format('Uv');
                return new UTCDateTime($ms);
            }

            return null;
        } catch (\Throwable $e) {
            return null;
        }
    }

    private function normalizeUnixMillis(float $value): int
    {
        if ($value > 9999999999) {
            return (int) round($value);
        }

        return (int) round($value * 1000);
    }

    private function normalizeMeta(array $meta, array $event): array
    {
        $host = $meta['host'] ?? $meta['hostname'] ?? $event['host'] ?? $event['hostname'] ?? null;
        if (is_string($host) && $host !== '') {
            $meta['host'] = $host;
        }

        $workload = $meta['workload'] ?? $event['workload'] ?? null;
        if (is_string($workload) && $workload !== '') {
            $meta['workload'] = $workload;
        } else {
            $meta['workload'] = 'unknown';
        }

        if (!isset($meta['host']) || !is_string($meta['host']) || $meta['host'] === '') {
            $meta['host'] = 'unknown';
        }

        if (!isset($meta['container'])) {
            $container = $event['container'] ?? null;
            if (is_string($container) && $container !== '') {
                $meta['container'] = $container;
            }
        }

        if (!isset($meta['image'])) {
            $image = $event['image'] ?? null;
            if (is_string($image) && $image !== '') {
                $meta['image'] = $image;
            }
        }

        if (!isset($meta['identifier'])) {
            $identifier = $event['identifier'] ?? null;
            if (is_string($identifier) && $identifier !== '') {
                $meta['identifier'] = $identifier;
            }
        }

        return $meta;
    }

    private function upsertFacets(array $docs): void
    {
        $valuesByType = [];

        foreach ($docs as $doc) {
            if (!is_array($doc)) continue;

            $meta = $doc['meta'] ?? [];
            if (!is_array($meta)) {
                $meta = [];
            }

            $this->collectFacetValue($valuesByType, 'level', $doc['level'] ?? null);
            $this->collectFacetValue($valuesByType, 'stream', $doc['stream'] ?? null);
            $this->collectFacetValue($valuesByType, 'workload', $doc['workload'] ?? ($meta['workload'] ?? null));
            $this->collectFacetValue($valuesByType, 'logger', $doc['logger'] ?? null);

            $this->collectFacetValue($valuesByType, 'host', $meta['host'] ?? null);
            $this->collectFacetValue($valuesByType, 'container', $meta['container'] ?? null);
            $this->collectFacetValue($valuesByType, 'image', $meta['image'] ?? null);
            $this->collectFacetValue($valuesByType, 'identifier', $meta['identifier'] ?? null);
        }

        if (empty($valuesByType)) {
            return;
        }

        $now = new UTCDateTime((int) round(microtime(true) * 1000));
        $updates = [];

        foreach ($valuesByType as $type => $values) {
            foreach ($values as $value => $_) {
                $updates[] = [
                    'updateOne' => [
                        ['type' => $type, 'value' => $value],
                        [
                            '$set' => [
                                'last_seen' => $now,
                            ],
                            '$setOnInsert' => [
                                'type' => $type,
                                'value' => $value,
                                'first_seen' => $now,
                            ],
                        ],
                        ['upsert' => true],
                    ],
                ];
            }
        }

        if (empty($updates)) {
            return;
        }

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_facets');

        $collection->bulkWrite($updates, ['ordered' => false]);
    }

    private function collectFacetValue(array &$valuesByType, string $type, mixed $value): void
    {
        if (!is_string($value)) {
            return;
        }

        $value = trim($value);
        if ($value === '') {
            return;
        }

        $valuesByType[$type][$value] = true;
    }
}
