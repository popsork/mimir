<?php

namespace App\Mcp\Tools;

use App\Mcp\Support\MongoHelpers;
use Carbon\Carbon;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;
use MongoDB\BSON\UTCDateTime;

class MetricsCatalogTool extends Tool
{
    protected string $name = 'metrics.catalog';

    protected string $description = <<<'MARKDOWN'
        List available metrics for hosts/devices/containers within a time window.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $type = (string) $request->get('type', 'machine');
        $host = $request->get('host');
        $device = $request->get('device');
        $container = $request->get('container');

        if (! in_array($type, ['machine', 'docker', 'proxmox'], true)) {
            return Response::error('type must be machine, docker, or proxmox.');
        }

        $from = MongoHelpers::parseDate($request->get('from'));
        $to = MongoHelpers::parseDate($request->get('to'));
        $minutes = (int) $request->get('minutes', 1440);
        $minutes = max(1, min($minutes, 43200));
        if (! $from && ! $to) {
            $from = new UTCDateTime(Carbon::now()->subMinutes($minutes));
        }

        $match = [];
        if ($from || $to) {
            $range = [];
            if ($from) {
                $range['$gte'] = $from;
            }
            if ($to) {
                $range['$lte'] = $to;
            }
            $match['timestamp'] = $range;
        }

        if (is_string($host) && $host !== '') {
            $match['meta.host'] = $host;
        }

        if ($type === 'machine') {
            $match['$or'] = [
                ['meta.type' => 'machine'],
                ['meta.type' => ['$exists' => false]],
            ];
            if (is_string($device) && $device !== '') {
                $match['meta.device'] = $device;
            }
        } else {
            $match['meta.type'] = $type;
            if (is_string($container) && $container !== '') {
                $match['meta.container'] = $container;
            }
        }

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $pipeline = [
            ['$match' => $match],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$meta.host',
                        'device' => '$meta.device',
                        'container' => '$meta.container',
                        'metric' => '$metric',
                    ],
                    'unit' => ['$first' => '$unit'],
                    'last_seen' => ['$first' => '$timestamp'],
                ],
            ],
            [
                '$group' => [
                    '_id' => [
                        'host' => '$_id.host',
                        'device' => '$_id.device',
                        'container' => '$_id.container',
                    ],
                    'metrics' => [
                        '$push' => [
                            'metric' => '$_id.metric',
                            'unit' => '$unit',
                            'last_seen' => '$last_seen',
                        ],
                    ],
                ],
            ],
            [
                '$project' => [
                    '_id' => 0,
                    'host' => '$_id.host',
                    'device' => '$_id.device',
                    'container' => '$_id.container',
                    'metrics' => 1,
                ],
            ],
            ['$sort' => ['host' => 1, 'device' => 1, 'container' => 1]],
        ];

        $cursor = $collection->aggregate($pipeline);
        $items = [];

        foreach ($cursor as $row) {
            $metrics = [];
            foreach ($row['metrics'] ?? [] as $metric) {
                $metrics[] = [
                    'metric' => $metric['metric'] ?? null,
                    'unit' => $metric['unit'] ?? null,
                    'last_seen' => MongoHelpers::formatTimestamp($metric['last_seen'] ?? null),
                ];
            }

            usort($metrics, fn ($a, $b) => strcmp((string) ($a['metric'] ?? ''), (string) ($b['metric'] ?? '')));

            $items[] = [
                'host' => $row['host'] ?? null,
                'device' => $row['device'] ?? null,
                'container' => $row['container'] ?? null,
                'metrics' => $metrics,
            ];
        }

        return Response::structured([
            'type' => $type,
            'host' => is_string($host) ? $host : null,
            'device' => is_string($device) ? $device : null,
            'container' => is_string($container) ? $container : null,
            'from' => $from ? MongoHelpers::formatTimestamp($from) : null,
            'to' => $to ? MongoHelpers::formatTimestamp($to) : null,
            'minutes' => $minutes,
            'items' => $items,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'minutes' => $schema->integer()->description('Fallback window in minutes if from/to missing (1-43200).')->default(1440),
            'type' => $schema->string()->description('machine, docker, or proxmox.')->default('machine'),
            'host' => $schema->string()->description('Optional host filter.')->nullable(),
            'device' => $schema->string()->description('Optional machine device filter.')->nullable(),
            'container' => $schema->string()->description('Optional container filter.')->nullable(),
        ];
    }
}
