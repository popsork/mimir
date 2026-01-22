<?php

namespace App\Mcp\Tools;

use App\Mcp\Support\MongoHelpers;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;

class LogsFacetsTool extends Tool
{
    protected string $name = 'logs.facets';

    protected string $description = <<<'MARKDOWN'
        Return top values for a log field within an optional time range.
    MARKDOWN;

    public function handle(Request $request): Response|ResponseFactory
    {
        $field = (string) $request->get('field', '');
        $fieldMap = [
            'level' => 'level',
            'stream' => 'stream',
            'workload' => 'meta.workload',
            'logger' => 'logger',
            'host' => 'meta.host',
            'container' => 'meta.container',
            'image' => 'meta.image',
            'identifier' => 'meta.identifier',
        ];

        if (! isset($fieldMap[$field])) {
            return Response::error('Invalid field. Allowed: level, stream, workload, logger, host, container, image, identifier.');
        }

        $mongoField = $fieldMap[$field];

        $match = [
            $mongoField => ['$exists' => true, '$nin' => [null, '']],
        ];

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

        $limit = (int) $request->get('limit', 50);
        $limit = max(1, min($limit, 200));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection('log_messages');

        $pipeline = [
            ['$match' => $match],
            ['$group' => ['_id' => '$' . $mongoField, 'count' => ['$sum' => 1]]],
            ['$sort' => ['count' => -1, '_id' => 1]],
            ['$limit' => $limit],
            ['$project' => ['_id' => 0, 'value' => '$_id', 'count' => 1]],
        ];

        $cursor = $collection->aggregate($pipeline);
        $values = [];
        foreach ($cursor as $row) {
            $values[] = [
                'value' => $row['value'] ?? null,
                'count' => isset($row['count']) ? (int) $row['count'] : 0,
            ];
        }

        return Response::structured([
            'field' => $field,
            'data' => $values,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'field' => $schema->string()->description('Facet field: level, stream, workload, logger, host, container, image, identifier.'),
            'from' => $schema->string()->description('Start time (ISO 8601 or epoch ms).')->nullable(),
            'to' => $schema->string()->description('End time (ISO 8601 or epoch ms).')->nullable(),
            'limit' => $schema->integer()->description('Max values (1-200).')->default(50),
        ];
    }
}
