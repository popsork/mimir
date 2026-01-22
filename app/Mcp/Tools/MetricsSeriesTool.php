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

class MetricsSeriesTool extends Tool
{
    protected string $name = 'metrics.series';

    protected string $description = <<<'MARKDOWN'
        Fetch time series points for one or more metrics on a host/device or host/container.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $type = (string) $request->get('type', 'machine');
        $host = $request->get('host');
        $device = $request->get('device');
        $container = $request->get('container');
        $metrics = MongoHelpers::normalizeList($request->get('metrics'));

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

        $limit = (int) $request->get('limit', 600);
        $limit = max(10, min($limit, 5000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('metrics');

        $series = [];
        foreach ($metrics as $metric) {
            $match = [
                'metric' => $metric,
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

            $pipeline = [
                ['$match' => $match],
                ['$sort' => ['timestamp' => 1]],
                ['$limit' => $limit],
                ['$project' => ['_id' => 0, 'timestamp' => 1, 'value' => 1, 'unit' => 1]],
            ];

            $cursor = $collection->aggregate($pipeline);
            $points = [];
            $unit = null;
            foreach ($cursor as $row) {
                if ($unit === null && isset($row['unit'])) {
                    $unit = $row['unit'];
                }
                $points[] = [
                    'timestamp' => MongoHelpers::formatTimestamp($row['timestamp'] ?? null),
                    'value' => isset($row['value']) ? (float) $row['value'] : null,
                ];
            }

            $series[] = [
                'metric' => $metric,
                'unit' => $unit,
                'points' => $points,
            ];
        }

        return Response::structured([
            'host' => $host,
            'type' => $type,
            'device' => $device,
            'container' => $container,
            'series' => $series,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'minutes' => $schema->integer()->description('Fallback window in minutes if from/to missing.')->default(120),
            'limit' => $schema->integer()->description('Max points per metric (10-5000).')->default(600),
            'type' => $schema->string()->description('machine, docker, or proxmox.')->default('machine'),
            'host' => $schema->string()->description('Host name.'),
            'device' => $schema->string()->description('Machine device (cpu/mem/disk/etc).')->nullable(),
            'container' => $schema->string()->description('Container name for docker/proxmox.')->nullable(),
            'metrics' => $schema->array()->items($schema->string())->description('Metric names.'),
        ];
    }
}
