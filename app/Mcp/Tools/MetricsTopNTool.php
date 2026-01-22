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

class MetricsTopNTool extends Tool
{
    protected string $name = 'metrics.topN';

    protected string $description = <<<'MARKDOWN'
        Return the top-N latest values for a metric grouped by host/device or host/container.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $type = (string) $request->get('type', 'machine');
        $metric = (string) $request->get('metric', '');
        $host = $request->get('host');

        if ($metric === '') {
            return Response::error('metric is required.');
        }

        if (! in_array($type, ['machine', 'docker', 'proxmox'], true)) {
            return Response::error('type must be machine, docker, or proxmox.');
        }

        $from = MongoHelpers::parseDate($request->get('from'));
        $to = MongoHelpers::parseDate($request->get('to'));
        $minutes = (int) $request->get('minutes', 60);
        $minutes = max(1, min($minutes, 1440));
        if (! $from && ! $to) {
            $from = new UTCDateTime(Carbon::now()->subMinutes($minutes));
        }

        $limit = (int) $request->get('limit', 10);
        $limit = max(1, min($limit, 200));

        $match = [
            'metric' => $metric,
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

        if (is_string($host) && $host !== '') {
            $match['meta.host'] = $host;
        }

        if ($type === 'machine') {
            $match['$or'] = [
                ['meta.type' => 'machine'],
                ['meta.type' => ['$exists' => false]],
            ];
        } else {
            $match['meta.type'] = $type;
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
                    ],
                    'value' => ['$first' => '$value'],
                    'unit' => ['$first' => '$unit'],
                    'timestamp' => ['$first' => '$timestamp'],
                ],
            ],
            ['$sort' => ['value' => -1]],
            ['$limit' => $limit],
            [
                '$project' => [
                    '_id' => 0,
                    'host' => '$_id.host',
                    'device' => '$_id.device',
                    'container' => '$_id.container',
                    'value' => 1,
                    'unit' => 1,
                    'timestamp' => 1,
                ],
            ],
        ];

        $cursor = $collection->aggregate($pipeline);
        $items = [];
        foreach ($cursor as $row) {
            $items[] = [
                'host' => $row['host'] ?? null,
                'device' => $row['device'] ?? null,
                'container' => $row['container'] ?? null,
                'value' => isset($row['value']) ? (float) $row['value'] : null,
                'unit' => $row['unit'] ?? null,
                'timestamp' => MongoHelpers::formatTimestamp($row['timestamp'] ?? null),
            ];
        }

        return Response::structured([
            'type' => $type,
            'metric' => $metric,
            'items' => $items,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'minutes' => $schema->integer()->description('Fallback window in minutes if from/to missing.')->default(60),
            'limit' => $schema->integer()->description('Max results (1-200).')->default(10),
            'type' => $schema->string()->description('machine, docker, or proxmox.')->default('machine'),
            'metric' => $schema->string()->description('Metric name.'),
            'host' => $schema->string()->description('Optional host filter.')->nullable(),
        ];
    }
}
