<?php

namespace App\Mcp\Tools;

use App\Mcp\Support\MongoHelpers;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;
use MongoDB\BSON\Regex;

class LogsQueryTool extends Tool
{
    protected string $name = 'logs.query';

    protected string $description = <<<'MARKDOWN'
        Query log messages with filters such as time range, levels, hosts, containers, and free-text search.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $match = [];

        $from = MongoHelpers::parseDate($request->get('from'));
        $to = MongoHelpers::parseDate($request->get('to'));
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

        $query = trim((string) $request->get('q', ''));
        if ($query !== '') {
            $match['message'] = new Regex($query, 'i');
        }

        $levels = MongoHelpers::normalizeList($request->get('levels'));
        if ($levels) {
            $match['level'] = ['$in' => $levels];
        }

        $streams = MongoHelpers::normalizeList($request->get('streams'));
        if ($streams) {
            $match['stream'] = ['$in' => $streams];
        }

        $workloads = MongoHelpers::normalizeList($request->get('workloads'));
        if ($workloads) {
            $match['meta.workload'] = ['$in' => $workloads];
        }

        $hosts = MongoHelpers::normalizeList($request->get('hosts'));
        if ($hosts) {
            $match['meta.host'] = ['$in' => $hosts];
        }

        $containers = MongoHelpers::normalizeList($request->get('containers'));
        if ($containers) {
            $match['meta.container'] = ['$in' => $containers];
        }

        $images = MongoHelpers::normalizeList($request->get('images'));
        if ($images) {
            $match['meta.image'] = ['$in' => $images];
        }

        $identifiers = MongoHelpers::normalizeList($request->get('identifiers'));
        if ($identifiers) {
            $match['meta.identifier'] = ['$in' => $identifiers];
        }

        $loggers = MongoHelpers::normalizeList($request->get('loggers'));
        if ($loggers) {
            $match['logger'] = ['$in' => $loggers];
        }

        $limit = (int) $request->get('limit', 200);
        $limit = max(1, min($limit, 1000));

        $sortDirection = strtolower((string) $request->get('sort', 'desc')) === 'asc' ? 1 : -1;

        $cursor = $collection->find(
            $match,
            [
                'sort' => ['timestamp' => $sortDirection],
                'limit' => $limit,
                'projection' => [
                    'timestamp' => 1,
                    'level' => 1,
                    'message' => 1,
                    'stream' => 1,
                    'logger' => 1,
                    'trace_id' => 1,
                    'request_id' => 1,
                    'workload' => 1,
                    'container_id' => 1,
                    'event_id' => 1,
                    'meta' => 1,
                ],
            ]
        );

        $logs = [];
        foreach ($cursor as $doc) {
            $meta = $doc['meta'] ?? [];
            $logs[] = [
                'id' => (string) ($doc['_id'] ?? ''),
                'timestamp' => MongoHelpers::formatTimestamp($doc['timestamp'] ?? null),
                'level' => $doc['level'] ?? null,
                'message' => $doc['message'] ?? '',
                'stream' => $doc['stream'] ?? null,
                'logger' => $doc['logger'] ?? null,
                'trace_id' => $doc['trace_id'] ?? null,
                'request_id' => $doc['request_id'] ?? null,
                'workload' => $doc['workload'] ?? ($meta['workload'] ?? null),
                'container_id' => $doc['container_id'] ?? null,
                'event_id' => $doc['event_id'] ?? null,
                'host' => $meta['host'] ?? null,
                'container' => $meta['container'] ?? null,
                'image' => $meta['image'] ?? null,
                'identifier' => $meta['identifier'] ?? null,
                'meta' => MongoHelpers::normalizeBsonValue($meta),
            ];
        }

        return Response::structured([
            'data' => $logs,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'q' => $schema->string()->description('Regex or substring to match message.')->nullable(),
            'levels' => $schema->array()->items($schema->string())->description('Log levels.')->nullable(),
            'streams' => $schema->array()->items($schema->string())->description('Log streams.')->nullable(),
            'workloads' => $schema->array()->items($schema->string())->description('Workloads (meta.workload).')->nullable(),
            'hosts' => $schema->array()->items($schema->string())->description('Hosts (meta.host).')->nullable(),
            'containers' => $schema->array()->items($schema->string())->description('Containers (meta.container).')->nullable(),
            'images' => $schema->array()->items($schema->string())->description('Images (meta.image).')->nullable(),
            'identifiers' => $schema->array()->items($schema->string())->description('Identifiers (meta.identifier).')->nullable(),
            'loggers' => $schema->array()->items($schema->string())->description('Logger names.')->nullable(),
            'limit' => $schema->integer()->description('Max results (1-1000).')->default(200),
            'sort' => $schema->string()->description('Sort direction: asc or desc.')->default('desc'),
        ];
    }
}
