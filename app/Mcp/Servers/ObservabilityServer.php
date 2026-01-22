<?php

namespace App\Mcp\Servers;

use App\Mcp\Tools\LogsFacetsTool;
use App\Mcp\Tools\LogsQueryTool;
use App\Mcp\Tools\MetricsCatalogTool;
use App\Mcp\Tools\MetricsGapsTool;
use App\Mcp\Tools\MetricsSeriesTool;
use App\Mcp\Tools\MetricsSummaryTool;
use App\Mcp\Tools\MetricsTopNTool;
use App\Mcp\Tools\MongoAggregateTool;
use Laravel\Mcp\Server;

class ObservabilityServer extends Server
{
    /**
     * The MCP server's name.
     */
    protected string $name = 'mimir-observability';

    /**
     * The MCP server's version.
     */
    protected string $version = '0.1.0';

    /**
     * The MCP server's instructions for the LLM.
     */
    protected string $instructions = <<<'MARKDOWN'
        You are an observability MCP server for a local lab.
        Prefer structured tools (logs.query, logs.facets, metrics.catalog, metrics.series, metrics.summary, metrics.topN, metrics.gaps) for common tasks.
        Use mongo.aggregate only when structured tools are insufficient.
        Logs live in `log_messages`, metrics live in `metrics`.
    MARKDOWN;

    /**
     * The tools registered with this MCP server.
     *
     * @var array<int, class-string<\Laravel\Mcp\Server\Tool>>
     */
    protected array $tools = [
        LogsQueryTool::class,
        LogsFacetsTool::class,
        MetricsCatalogTool::class,
        MetricsSeriesTool::class,
        MetricsSummaryTool::class,
        MetricsTopNTool::class,
        MetricsGapsTool::class,
        MongoAggregateTool::class,
    ];
}
