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

class MetricsSummaryTool extends Tool
{
    protected string $name = 'metrics.summary';

    protected string $description = <<<'MARKDOWN'
        Summarize metric values (min/max/avg/latest) for a host/device or host/container within a time window.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $type = (string) $request->get('type', 'machine');
        $host = $request->get('host');
        $device = $request->get('device');
        $container = $request->get('container');

        $metrics = MongoHelpers::normalizeList($request->get('metrics'));
        $metric = $request->get('metric');
        if (empty($metrics) && is_string($metric) && $metric !== '') {
            $metrics = [$metric];
        }

        if (! is_string($host) || $host === '' || empty($metrics)) {
            return Response::error('host and metrics are required.');
        }

        if (! in_array($type, ['machine', 'docker', 'proxmox'], true)) {
            return Response::error('type must be machine, docker, or proxmox.');
        }

        if ($type === 'machine' && (! is_string($device) || $device === '')) {
            return Response::error('device is required for machine metrics.');
        }

        if ($type !== 'machine' && (! is_string($container) || $container === '')) {
            return Response::error('container is required for docker/proxmox metrics.');
        }

        $from = MongoHelpers::parseDate($request->get('from'));
        $to = MongoHelpers::parseDate($request->get('to'));
        $minutes = (int) $request->get('minutes', 120);
        $minutes = max(1, min($minutes, 1440));
        if (! $from && ! $to) {
            $from = new UTCDateTime(Carbon::now()->subMinutes($minutes));
        }

        $match = [
            'metric' => ['$in' => $metrics],
            'meta.host' => $host,
        ];

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

        if ($type === 'machine') {
            $match['meta.device'] = $device;
            $match['$or'] = [
                ['meta.type' => 'machine'],
                ['meta.type' => ['$exists' => false]],
            ];
        } else {
            $match['meta.type'] = $type;
            $match['meta.container'] = $container;
        }

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $pipeline = [
            ['$match' => $match],
            ['$sort' => ['timestamp' => -1]],
            [
                '$group' => [
                    '_id' => ['metric' => '$metric'],
                    'unit' => ['$first' => '$unit'],
                    'last_value' => ['$first' => '$value'],
                    'last_timestamp' => ['$first' => '$timestamp'],
                    'min' => ['$min' => '$value'],
                    'max' => ['$max' => '$value'],
                    'avg' => ['$avg' => '$value'],
                    'count' => ['$sum' => 1],
                ],
            ],
            [
                '$project' => [
                    '_id' => 0,
                    'metric' => '$_id.metric',
                    'unit' => 1,
                    'last_value' => 1,
                    'last_timestamp' => 1,
                    'min' => 1,
                    'max' => 1,
                    'avg' => 1,
                    'count' => 1,
                ],
            ],
            ['$sort' => ['metric' => 1]],
        ];

        $cursor = $collection->aggregate($pipeline);
        $items = [];
        $found = [];

        foreach ($cursor as $row) {
            $metricName = $row['metric'] ?? null;
            if (is_string($metricName) && $metricName !== '') {
                $found[$metricName] = true;
            }

            $items[] = [
                'metric' => $metricName,
                'unit' => $row['unit'] ?? null,
                'last_value' => isset($row['last_value']) ? (float) $row['last_value'] : null,
                'last_timestamp' => MongoHelpers::formatTimestamp($row['last_timestamp'] ?? null),
                'min' => isset($row['min']) ? (float) $row['min'] : null,
                'max' => isset($row['max']) ? (float) $row['max'] : null,
                'avg' => isset($row['avg']) ? (float) $row['avg'] : null,
                'count' => isset($row['count']) ? (int) $row['count'] : 0,
            ];
        }

        $missing = array_values(array_filter($metrics, fn ($name) => ! isset($found[$name])));

        return Response::structured([
            'host' => $host,
            'type' => $type,
            'device' => $device,
            'container' => $container,
            'from' => $from ? MongoHelpers::formatTimestamp($from) : null,
            'to' => $to ? MongoHelpers::formatTimestamp($to) : null,
            'minutes' => $minutes,
            'items' => $items,
            'missing' => $missing,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'minutes' => $schema->integer()->description('Fallback window in minutes if from/to missing.')->default(120),
            'type' => $schema->string()->description('machine, docker, or proxmox.')->default('machine'),
            'host' => $schema->string()->description('Host name.'),
            'device' => $schema->string()->description('Machine device (cpu/mem/disk/etc).')->nullable(),
            'container' => $schema->string()->description('Container name for docker/proxmox.')->nullable(),
            'metrics' => $schema->array()->items($schema->string())->description('Metric names.')->nullable(),
            'metric' => $schema->string()->description('Single metric name.')->nullable(),
        ];
    }
}
