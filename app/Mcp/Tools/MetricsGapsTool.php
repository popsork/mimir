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

class MetricsGapsTool extends Tool
{
    protected string $name = 'metrics.gaps';

    protected string $description = <<<'MARKDOWN'
        Identify hosts/devices/containers that have not reported metrics within a time window.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $type = (string) $request->get('type', 'machine');
        $host = $request->get('host');

        if (! in_array($type, ['machine', 'docker', 'proxmox'], true)) {
            return Response::error('type must be machine, docker, or proxmox.');
        }

        $minutes = (int) $request->get('minutes', 15);
        $minutes = max(1, min($minutes, 1440));
        $cutoff = new UTCDateTime(Carbon::now()->subMinutes($minutes));

        $match = [];
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
                    'last_seen' => ['$first' => '$timestamp'],
                ],
            ],
            ['$match' => ['last_seen' => ['$lt' => $cutoff]]],
            ['$sort' => ['last_seen' => 1]],
            [
                '$project' => [
                    '_id' => 0,
                    'host' => '$_id.host',
                    'device' => '$_id.device',
                    'container' => '$_id.container',
                    'last_seen' => 1,
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
                'last_seen' => MongoHelpers::formatTimestamp($row['last_seen'] ?? null),
            ];
        }

        return Response::structured([
            'type' => $type,
            'minutes' => $minutes,
            'items' => $items,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'minutes' => $schema->integer()->description('Gap window in minutes.')->default(15),
            'type' => $schema->string()->description('machine, docker, or proxmox.')->default('machine'),
            'host' => $schema->string()->description('Optional host filter.')->nullable(),
        ];
    }
}
