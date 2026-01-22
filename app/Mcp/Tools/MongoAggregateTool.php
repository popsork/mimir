<?php

namespace App\Mcp\Tools;

use App\Mcp\Support\MongoHelpers;
use Illuminate\Contracts\JsonSchema\JsonSchema;
use Illuminate\Support\Facades\DB;
use Laravel\Mcp\Request;
use Laravel\Mcp\Response;
use Laravel\Mcp\ResponseFactory;
use Laravel\Mcp\Server\Tool;

class MongoAggregateTool extends Tool
{
    protected string $name = 'mongo.aggregate';

    protected string $description = <<<'MARKDOWN'
        Run a raw MongoDB aggregation pipeline against an allowed collection.
    MARKDOWN;

    /**
     * @var array<int, string>
     */
    private array $allowedCollections = [
        'log_messages',
        'log_facets',
        'metrics',
        'metrics_tree_cache',
    ];

    public function handle(Request $request): Response|ResponseFactory
    {
        $collectionName = (string) $request->get('collection', '');
        if (! in_array($collectionName, $this->allowedCollections, true)) {
            return Response::error('Invalid collection.');
        }

        $pipeline = $request->get('pipeline', []);
        if (! is_array($pipeline)) {
            return Response::error('pipeline must be an array.');
        }

        $options = $request->get('options', []);
        $options = is_array($options) ? $options : [];

        $allowDiskUse = $options['allowDiskUse'] ?? false;
        $maxTimeMs = isset($options['maxTimeMs']) ? (int) $options['maxTimeMs'] : 30000;
        $batchSize = isset($options['batchSize']) ? (int) $options['batchSize'] : null;

        $aggregateOptions = [
            'allowDiskUse' => (bool) $allowDiskUse,
            'maxTimeMS' => $maxTimeMs,
        ];
        if ($batchSize !== null && $batchSize > 0) {
            $aggregateOptions['batchSize'] = $batchSize;
        }

        $limit = (int) $request->get('limit', 5000);
        $limit = max(1, min($limit, 10000));

        $collection = DB::connection('mongodb')
            ->getMongoDB()
            ->selectCollection($collectionName);

        $cursor = $collection->aggregate($pipeline, $aggregateOptions);

        $data = [];
        foreach ($cursor as $row) {
            $data[] = MongoHelpers::normalizeBsonValue($row);
            if (count($data) >= $limit) {
                break;
            }
        }

        return Response::structured([
            'collection' => $collectionName,
            'count' => count($data),
            'data' => $data,
        ]);
    }

    public function schema(JsonSchema $schema): array
    {
        return [
            'collection' => $schema->string()->description('Collection name.'),
            'pipeline' => $schema->array()->description('Aggregation pipeline array.'),
            'options' => $schema->object()->description('Aggregate options (allowDiskUse, maxTimeMs, batchSize).')->nullable(),
            'limit' => $schema->integer()->description('Max returned docs (1-10000).')->default(5000),
        ];
    }
}
