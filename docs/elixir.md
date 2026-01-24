# Migration Assessment: Laravel + MongoDB → Elixir + Phoenix + LiveView + PostgreSQL

## Executive Summary

**Project Size:** Medium-sized migration (4-8 weeks for experienced Elixir developer)

**Feasibility:** ✅ Highly feasible with significant architectural benefits

**Critical Decision:** MongoDB timeseries collections vs PostgreSQL (TimescaleDB recommended)

---

## 1. Current Project Snapshot

### What Mimir Does
A local observability platform that:
- Ingests logs and metrics from Docker, Proxmox, and bare-metal machines
- Streams real-time metrics via MQTT
- Stores data in MongoDB timeseries collections
- Provides REST API + MCP tools for AI-powered analysis
- Nuxt 4 SPA frontend for visualization

### Codebase Size
- **Backend:** ~3,156 PHP lines (app layer)
- **Controllers:** 3 (LogIngest, LogQuery, Metrics)
- **Models:** 3 (minimal - raw MongoDB used)
- **Console Commands:** 3 (MQTT listener, facet rebuild, pruning)
- **MCP Tools:** 8 (AI-powered observability queries)
- **Routes:** ~15 API endpoints
- **Tests:** 6 test files (Pest)
- **Frontend:** Nuxt 4 SPA (separate concern)

### Key Dependencies
- `mongodb/laravel-mongodb` - MongoDB ODM
- `php-mqtt/laravel-client` - MQTT streaming
- `laravel/mcp` - Model Context Protocol (AI integration)
- `laravel/sanctum` - API auth

---

## 2. Migration Feasibility: HIGH ✅

### Why This Migration Makes Sense

**Architectural Fit:**
- Elixir/Phoenix excels at real-time data streaming (MQTT, metrics)
- Phoenix LiveView eliminates need for separate SPA frontend
- Concurrent processing benefits (BEAM VM handles thousands of processes)
- OTP supervision trees provide fault tolerance (critical for always-on monitoring)

**Performance Gains:**
- Elixir handles concurrent MQTT connections better than PHP
- Phoenix Channels provide real-time updates natively (no polling)
- Lower memory footprint for long-running processes
- Built-in distributed system capabilities

**Developer Experience:**
- Functional programming reduces bugs in data transformations
- Pattern matching simplifies complex aggregation logic
- ExUnit testing superior to Pest/PHPUnit
- Hot code reloading in development

---

## 3. Migration Scope Breakdown

### Component Mapping

| Laravel Component | Elixir/Phoenix Equivalent | Complexity |
|-------------------|---------------------------|------------|
| **LogIngestController** | Phoenix Controller + Plug | 🟡 Medium |
| **LogQueryController** | Phoenix Controller + Ecto queries | 🟡 Medium |
| **MetricsController** | Phoenix Controller + Ecto aggregations | 🔴 High |
| **MQTT Listener** | Broadway pipeline + Tortoise | 🟡 Medium |
| **MCP Tools** | Custom JSON-RPC server | 🟡 Medium |
| **MongoDB Timeseries** | TimescaleDB (PostgreSQL extension) | 🔴 High |
| **Caching** | ETS or ConCache | 🟢 Easy |
| **Tests** | ExUnit | 🟢 Easy |
| **Authentication** | Guardian or Pow | 🟢 Easy |

### Complexity Ratings
- 🟢 **Easy:** Drop-in replacements, straightforward ports
- 🟡 **Medium:** Requires rethinking approach, but well-documented patterns exist
- 🔴 **High:** Significant architectural changes needed

---

## 4. Critical Migration Challenges

### Challenge 1: MongoDB Timeseries → PostgreSQL
**Current Setup:**
- `log_messages` collection: Timeseries with `timeField: timestamp`, `metaField: meta`, `granularity: seconds`
- `metrics` collection: Same configuration
- Automatic compression, optimized storage (10x reduction)
- Native aggregation pipeline support

**PostgreSQL Options:**

**Option A: Standard PostgreSQL + JSONB** ❌
- Use JSONB for `meta` field
- Manual partitioning by timestamp
- Loss of compression benefits
- Complex aggregation queries

**Option B: TimescaleDB (Recommended)** ✅
- PostgreSQL extension specifically for time-series data
- Automatic partitioning (hypertables)
- Compression policies
- Continuous aggregates (materialized views)
- Near-feature parity with MongoDB timeseries

**Option C: Hybrid Approach** 🤔
- Keep MongoDB for raw metrics/logs
- Use PostgreSQL for structured data (users, config)
- Complexity: managing two databases

**Recommendation:** TimescaleDB with Ecto adapter
- Ecto has TimescaleDB support via custom migrations
- Maintains time-series performance characteristics
- SQL query benefits (joins, constraints, transactions)

---

### Challenge 2: Aggregation Pipelines → Ecto/SQL

**Current MongoDB Aggregations (MetricsController.php):**
```php
$pipeline = [
    ['$match' => ['meta.type' => ['$in' => ['machine', 'docker']]]],
    ['$sort' => ['timestamp' => -1]],
    ['$group' => [
        '_id' => ['host' => '$meta.host', 'device' => '$meta.device', 'metric' => '$metric'],
        'latest_value' => ['$first' => '$value'],
        'latest_timestamp' => ['$first' => '$timestamp']
    ]],
    ['$group' => [
        '_id' => ['host' => '$_id.host', 'device' => '$_id.device'],
        'metrics' => ['$push' => [...]]
    ]]
];
```

**Ecto/PostgreSQL Equivalent:**
```elixir
query = from m in Metric,
  where: m.meta["type"] in ["machine", "docker"],
  order_by: [desc: m.timestamp],
  distinct: [m.meta["host"], m.meta["device"], m.metric],
  group_by: [m.meta["host"], m.meta["device"]],
  select: %{
    host: fragment("meta->>'host'"),
    device: fragment("meta->>'device'"),
    metrics: fragment("jsonb_agg(jsonb_build_object('metric', ?, 'value', ?))", m.metric, m.value)
  }
```

**Migration Strategy:**
- Convert pipelines incrementally
- Use Ecto fragments for JSONB operations
- Leverage PostgreSQL window functions for complex aggregations
- Add database indexes for common query patterns

**Complexity:** 🔴 High but manageable
- ~7 complex aggregation endpoints to migrate
- Well-defined input/output contracts (tests exist)
- Can verify correctness by comparing results

---

### Challenge 3: MQTT Real-time Streaming

**Current Setup:**
- `php-mqtt/laravel-client` with PCNTL signal handling
- Single long-running PHP process
- Topic pattern matching with regex
- JSON payload decoding

**Elixir Solution: Broadway + Tortoise**

**Broadway Pipeline:**
```elixir
defmodule Mimir.MetricsPipeline do
  use Broadway

  def start_link(_opts) do
    Broadway.start_link(__MODULE__,
      name: __MODULE__,
      producer: [
        module: {BroadwayTortoise.Producer, [
          connection: :mqtt_client,
          topic: "metrics/#",
          qos: 1
        ]},
        concurrency: 1
      ],
      processors: [
        default: [concurrency: 10]
      ],
      batchers: [
        insert: [concurrency: 5, batch_size: 100]
      ]
    )
  end

  def handle_message(_processor, message, _context) do
    # Parse and transform
    message
    |> Message.update_data(&decode_mqtt_payload/1)
  end

  def handle_batch(:insert, messages, _batch_info, _context) do
    # Batch insert to TimescaleDB
    Repo.insert_all(Metric, Enum.map(messages, & &1.data))
    messages
  end
end
```

**Benefits:**
- Fault tolerance: Process crashes restart automatically
- Backpressure handling: Broadway manages rate limiting
- Concurrent processing: 10+ parallel message handlers
- Batch inserts: Efficient database writes

**Complexity:** 🟡 Medium
- Broadway is well-documented
- Tortoise MQTT client is mature
- Pattern similar to Laravel command but more robust

---

### Challenge 4: MCP (Model Context Protocol) Tools

**Current Setup:**
- `laravel/mcp` package (v0.5.2)
- 8 specialized tools for AI queries
- ObservabilityServer with JSON-RPC

**Elixir Solution: Custom JSON-RPC Server**

**Implementation Approach:**
```elixir
defmodule Mimir.McpServer do
  use Plug.Router

  plug :match
  plug :dispatch

  post "/mcp/observability" do
    with {:ok, request} <- decode_json_rpc(conn.body_params),
         {:ok, result} <- handle_tool_call(request.method, request.params) do
      send_json_rpc_response(conn, result)
    end
  end

  defp handle_tool_call("logs.query", params) do
    Mimir.Logs.query(params)
  end

  defp handle_tool_call("metrics.series", params) do
    Mimir.Metrics.series(params)
  end
end
```

**Complexity:** 🟡 Medium
- No official Elixir MCP library yet (as of Jan 2025)
- JSON-RPC protocol is straightforward
- Can port existing tool logic directly

---

## 5. Database Schema Migration

### MongoDB → PostgreSQL Schema Design

**Current MongoDB Collections:**
1. `log_messages` (timeseries)
2. `log_facets` (denormalized cache)
3. `metrics` (timeseries)
4. `metrics_tree_cache` (cache)

**Proposed PostgreSQL Schema (TimescaleDB):**

```sql
-- Hypertable for log messages
CREATE TABLE log_messages (
  id BIGSERIAL,
  timestamp TIMESTAMPTZ NOT NULL,
  message TEXT,
  level VARCHAR(20),
  stream VARCHAR(20),
  logger VARCHAR(100),
  workload VARCHAR(100),
  container_id VARCHAR(100),
  event_id VARCHAR(100),
  trace_id VARCHAR(100),
  request_id VARCHAR(100),
  meta JSONB -- Flexible nested data
);

SELECT create_hypertable('log_messages', 'timestamp');

-- Indexes for common queries
CREATE INDEX idx_log_messages_timestamp ON log_messages (timestamp DESC);
CREATE INDEX idx_log_messages_level_timestamp ON log_messages (level, timestamp DESC);
CREATE INDEX idx_log_messages_meta_host ON log_messages USING gin ((meta->'host'));

-- Compression policy (similar to MongoDB timeseries)
ALTER TABLE log_messages SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'level, logger'
);

SELECT add_compression_policy('log_messages', INTERVAL '7 days');

-- Continuous aggregate for facets (replaces log_facets collection)
CREATE MATERIALIZED VIEW log_facets_mv
WITH (timescaledb.continuous) AS
SELECT
  time_bucket('1 day', timestamp) AS bucket,
  level AS type,
  level AS value,
  count(*) AS count
FROM log_messages
GROUP BY bucket, level;
```

**Migration Strategy:**
1. Export MongoDB collections to JSON
2. Transform documents to SQL INSERTs
3. Use `COPY` command for bulk loading
4. Verify data integrity with test queries
5. Update application queries incrementally

**Data Volume Estimate:**
- Assuming millions of log entries
- MongoDB export: `mongoexport --collection=log_messages --out=logs.json`
- Transform: Elixir script or Python
- Import: `COPY log_messages FROM 'logs.csv' CSV`
- Timeline: Hours to days depending on volume

---

## 6. Frontend Migration: Nuxt 4 → Phoenix LiveView

### Current Frontend Stack
- Nuxt 4 SPA (no SSR)
- Pinia state management
- Nuxt UI components
- Tailwind CSS
- TypeScript
- Unovis/Nuxt Charts for visualizations

### Migration Options

**Option A: Keep Nuxt 4 SPA** 🤔
- Phoenix serves API only
- Frontend remains independent
- No LiveView migration needed
- **Pros:** Less work, modern SPA experience
- **Cons:** Lose real-time LiveView benefits

**Option B: Full LiveView Migration** ✅
- Replace all Nuxt pages with LiveView
- Server-rendered real-time updates
- Tailwind CSS (same as Nuxt)
- **Pros:** Real-time by default, less code, one tech stack
- **Cons:** Requires learning LiveView

**Option C: Hybrid Approach**
- LiveView for real-time dashboards
- Nuxt for complex interactions
- **Pros:** Best of both worlds
- **Cons:** Maintain two frontends

**Recommendation:** Option B (Full LiveView)
- Mimir is primarily real-time dashboards (perfect fit)
- LiveView handles streaming metrics natively
- Eliminates REST polling for updates
- Simpler architecture (one codebase)

**Example LiveView Component:**
```elixir
defmodule MimirWeb.MetricsLive do
  use MimirWeb, :live_view

  def mount(_params, _session, socket) do
    if connected?(socket) do
      Phoenix.PubSub.subscribe(Mimir.PubSub, "metrics:updates")
    end

    {:ok, assign(socket, metrics: fetch_metrics())}
  end

  def handle_info({:new_metric, metric}, socket) do
    {:noreply, update(socket, :metrics, &[metric | &1])}
  end

  def render(assigns) do
    ~H"""
    <div class="metrics-dashboard">
      <%= for metric <- @metrics do %>
        <div class="metric-card">
          <span><%= metric.name %></span>
          <span><%= metric.value %></span>
        </div>
      <% end %>
    </div>
    """
  end
end
```

**Complexity:** 🟡 Medium
- ~10-15 pages/components to migrate
- LiveView syntax similar to Vue/Nuxt templates
- Charting libraries: Use Chart.js via Hooks

---

## 7. Risks Assessment: Elixir/Phoenix vs Laravel/PHP

### Performance Risks: NONE ✅

**Elixir Advantages:**
- BEAM VM designed for high-concurrency (millions of processes)
- Lightweight processes (2KB vs PHP's heavyweight threads)
- Preemptive scheduling prevents blocking
- Built-in distribution for horizontal scaling

**Benchmark Comparison (Typical Web App):**
- Laravel: 1,000-5,000 req/s (single server)
- Phoenix: 50,000-100,000 req/s (single server)
- Memory: Phoenix uses 50-70% less than Laravel

**For Mimir Specifically:**
- MQTT streaming: Elixir handles 1M+ concurrent connections
- Log ingestion: Broadway batch processing outperforms PHP
- Real-time updates: Phoenix Channels eliminate REST polling

**Verdict:** Elixir is **significantly faster** for this workload

---

### Complexity Risks: LOW 🟡

**Learning Curve:**
- Functional programming paradigm shift (vs OOP in Laravel)
- Pattern matching and immutability (initially unfamiliar)
- OTP concepts (GenServer, Supervisor) for background jobs

**Mitigation:**
- Elixir syntax is clean and readable
- Phoenix follows Rails/Laravel conventions (familiar MVC)
- Excellent documentation (hexdocs.pm, Phoenix guides)
- Active community (Elixir Forum, Discord)

**Developer Availability:**
- Smaller talent pool than PHP
- Growing ecosystem (not as mature as Laravel)

**Verdict:** 2-4 weeks ramp-up for experienced developer, **manageable complexity**

---

### Ecosystem Risks: LOW 🟢

**Library Availability:**
| Feature | Laravel Package | Elixir Equivalent |
|---------|----------------|-------------------|
| MongoDB | mongodb/laravel-mongodb | mongodb_ecto (mature) |
| PostgreSQL | Built-in | Ecto (excellent) |
| MQTT | php-mqtt/laravel-client | tortoise (mature) |
| Auth | Sanctum | Guardian (battle-tested) |
| Testing | Pest | ExUnit (built-in, superior) |
| Caching | Laravel Cache | ETS/ConCache (faster) |
| Jobs | Laravel Queue | Oban (more powerful) |
| HTTP Client | Guzzle | HTTPoison/Finch (robust) |

**Missing Pieces:**
- No official MCP library (build custom JSON-RPC server)
- TimescaleDB Ecto adapter (community-maintained but stable)

**Verdict:** Elixir ecosystem is **mature for this use case**

---

### Operational Risks: LOW 🟢

**Deployment:**
- Releases: Mix release (similar to Docker)
- Hot code upgrades: Deploy without downtime
- Monitoring: Built-in Telemetry + Phoenix LiveDashboard

**Debugging:**
- IEx REPL (similar to Tinker)
- Observer (visual process inspector)
- Flame graphs for performance profiling

**Production Stability:**
- Erlang VM powers WhatsApp, Discord, Pinterest
- 99.9999999% uptime ("nine nines")
- Fault tolerance via supervision trees

**Verdict:** Elixir is **more reliable** in production

---

## 8. Migration Timeline Estimate

### Phases

**Phase 1: Setup & Core Infrastructure** (1 week)
- Set up Phoenix project
- Configure TimescaleDB + Ecto
- Create database schema migrations
- Port authentication system
- Set up testing framework

**Phase 2: Data Migration** (3-5 days)
- Export MongoDB collections
- Transform data format
- Import to PostgreSQL
- Verify data integrity
- Create seed data for development

**Phase 3: Backend API Migration** (2-3 weeks)
- Port LogIngestController (3 days)
- Port LogQueryController (3 days)
- Port MetricsController (5 days)
- Migrate aggregation pipelines (iterative)
- Port MCP tools (3 days)
- Write tests for each endpoint

**Phase 4: MQTT Integration** (3-5 days)
- Set up Broadway pipeline
- Configure Tortoise MQTT client
- Port topic pattern matching
- Implement batch processing
- Add supervision tree

**Phase 5: Frontend Migration** (1-2 weeks)
- Create LiveView layouts
- Port metrics dashboard
- Port logs viewer
- Add real-time updates via PubSub
- Style with Tailwind (reuse CSS)

**Phase 6: Testing & Refinement** (1 week)
- End-to-end testing
- Performance benchmarking
- Fix bugs and edge cases
- Documentation

**Total Timeline:** 6-8 weeks (1 developer, full-time)

**Parallel Development Option:**
- 2 developers: 4-5 weeks
- Backend dev + Frontend dev working simultaneously

---

## 9. Cost-Benefit Analysis

### Benefits

**Performance:**
- 10-50x better concurrency handling
- Lower memory usage (50-70% reduction)
- Real-time updates without polling
- Faster response times

**Developer Experience:**
- Pattern matching reduces bugs
- Immutability prevents state issues
- Hot code reloading speeds development
- Superior testing framework

**Operations:**
- Hot code upgrades (zero downtime deployments)
- Built-in monitoring (LiveDashboard)
- Lower infrastructure costs (fewer servers)
- Better fault tolerance

**Architecture:**
- Unified real-time stack (no separate WebSocket server)
- Simplified frontend (LiveView vs SPA + API)
- Distributed system ready (horizontal scaling)

### Costs

**Development Time:**
- 6-8 weeks migration effort
- Learning curve for Elixir/Phoenix

**Risk Mitigation:**
- Feature freeze during migration
- Parallel development (keep Laravel running)

### ROI Calculation

**Scenario:** Solo developer maintaining Mimir

**Current State (Laravel):**
- Add new real-time feature: 2-3 days (implement polling, optimize)
- Scale to 10x traffic: Add caching, optimize queries (1 week)

**Post-Migration (Elixir):**
- Add new real-time feature: 1 day (LiveView built-in)
- Scale to 10x traffic: Add server (1 hour, automatic load balancing)

**Break-even:** ~3 months after migration

---

## 10. Recommended Approach

### Incremental Migration Strategy

**Step 1: Proof of Concept (1 week)**
- Build single endpoint in Phoenix (e.g., metrics overview)
- Set up TimescaleDB
- Implement Broadway MQTT pipeline
- Validate performance and developer experience

**Decision Point:** Proceed if PoC meets expectations

**Step 2: Parallel Development (4 weeks)**
- Keep Laravel running in production
- Build Phoenix backend with full API parity
- Migrate data to PostgreSQL (dev environment)
- Run both systems side-by-side

**Step 3: Gradual Cutover (1-2 weeks)**
- Deploy Phoenix to staging
- A/B test endpoints (compare results)
- Monitor performance metrics
- Cut over traffic endpoint-by-endpoint
- Keep Laravel as fallback

**Step 4: Decommission Laravel (1 week)**
- Verify all features working
- Final data sync
- Archive Laravel codebase

---

## 11. Final Recommendation

### Should You Migrate? **YES ✅**

**Reasons:**
1. **Perfect architectural fit**: Mimir's use case (real-time observability) is exactly what Elixir/Phoenix excels at
2. **Small codebase**: 3,156 PHP lines is manageable for migration
3. **Clean architecture**: Minimal Laravel magic, straightforward port
4. **Performance gains**: 10-50x improvement for concurrent workloads
5. **Future-proof**: Easier to add distributed features later

**When to Migrate:**
- If you have 6-8 weeks available
- If you're comfortable learning functional programming
- If real-time features are important (they are for observability)

**When to Stay on Laravel:**
- If you need to ship new features urgently
- If you have a large PHP team (context switching cost)
- If the current system meets all needs (no pain points)

---

## 12. Critical Files to Review

### Laravel Files to Understand Before Migrating

**High Priority:**
- `/home/patrikmalmstrom/Projects/laravel/mimir/app/Http/Controllers/MetricsController.php` - Complex aggregations
- `/home/patrikmalmstrom/Projects/laravel/mimir/app/Console/Commands/MetricsListen.php` - MQTT listener
- `/home/patrikmalmstrom/Projects/laravel/mimir/database/migrations/` - Schema definitions

**Medium Priority:**
- `/home/patrikmalmstrom/Projects/laravel/mimir/app/Mcp/Tools/` - AI tool implementations
- `/home/patrikmalmstrom/Projects/laravel/mimir/tests/` - Test coverage
- `/home/patrikmalmstrom/Projects/laravel/mimir/config/` - Configuration settings

---

## 13. Next Steps

1. **Decide on database strategy**: TimescaleDB vs MongoDB hybrid
2. **Build proof of concept**: Single LiveView page + MQTT pipeline
3. **Evaluate experience**: Is Elixir a good fit for your style?
4. **Plan migration timeline**: Align with feature roadmap
5. **Set up parallel development**: Keep both systems running

---

## Questions to Clarify

1. **Timeline flexibility**: Do you have 6-8 weeks for full migration?
2. **Database preference**: TimescaleDB (PostgreSQL) or hybrid MongoDB + PostgreSQL?
3. **Frontend approach**: Full LiveView or keep Nuxt 4 SPA?
4. **Risk tolerance**: Incremental migration or big rewrite?
