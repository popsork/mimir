# MCP Observability Server

This project exposes a local MCP server that provides direct access to logs and metrics stored in MongoDB.

## Endpoint

- Web transport: `/mcp/observability` (defined in `routes/ai.php`)

## Tools

- `logs.query` — query log messages by time range, filters, and text search.
- `logs.facets` — top values for a log field in a time window.
- `metrics.series` — time series for one or more metrics on a host/device or host/container.
- `metrics.topN` — top-N latest values for a metric grouped by host/device or host/container.
- `metrics.gaps` — find hosts/devices/containers that stopped reporting metrics.
- `mongo.aggregate` — run a raw MongoDB aggregation pipeline against allowed collections.

## Testing / Debugging

Use the Laravel MCP inspector to test locally:

```bash
./vendor/bin/sail artisan mcp:inspector /mcp/observability
```

If you run into route cache issues after changes:

```bash
./vendor/bin/sail artisan route:clear
```
