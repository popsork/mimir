# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mimir is an observability platform combining Laravel (backend) and Nuxt 4 (frontend) to collect, store, and visualize logs and metrics from Docker containers, Proxmox VMs, and physical machines. It uses MongoDB for storage, Redis for caching/queues, and Vector for log shipping.

### Data Flow Architecture

**Metrics**: Published via MQTT → `metrics:listen` command → MongoDB `metrics` collection
**Logs**: Vector (Docker logs) → HTTP POST to `/api/logs/ingest` → MongoDB `log_messages` collection + facets cache

The system maintains a separate `log_facets` collection for fast filtering (values for host, container, image, level, stream, workload, logger).

### MCP Server

Laravel MCP server at `/mcp/observability` provides structured tools for LLMs to query observability data:
- `logs.query`, `logs.facets` - log querying and filtering
- `metrics.catalog`, `metrics.series`, `metrics.summary`, `metrics.topN`, `metrics.gaps` - metrics analysis
- `mongo.aggregate` - fallback for complex queries

## Commands

### Backend (Laravel)

All Laravel/PHP commands run through Sail. Use `./vendor/bin/sail` prefix for all artisan/composer/php commands.

**Initial Setup:**
```bash
composer run setup  # Bootstrap .env, generate key, migrate, install npm packages
```

**Development:**
```bash
./vendor/bin/sail composer run dev
# Runs concurrently: Laravel server, queue worker, pail logs, Vite
# Individual services on ports: APP_PORT=42100, VITE_PORT=42101
```

**Testing:**
```bash
./vendor/bin/sail composer run test    # Run Pest test suite
./vendor/bin/sail php artisan test     # Alternative test command
```

**Database:**
```bash
./vendor/bin/sail php artisan migrate
./vendor/bin/sail php artisan migrate:fresh  # Drop all and re-migrate
```

**Metrics & Logs:**
```bash
./vendor/bin/sail php artisan metrics:listen        # Start MQTT metrics listener
./vendor/bin/sail php artisan logs:rebuild-facets   # Rebuild log facets cache
./vendor/bin/sail php artisan logs:prune-facets     # Clean stale facets
```

**Code Quality:**
```bash
./vendor/bin/sail php vendor/bin/pint  # Format PHP (Laravel Pint)
```

**Assets:**
```bash
npm run dev    # Laravel Vite dev server
npm run build  # Build Laravel assets
```

### Frontend (Nuxt)

Run from `frontend/` directory.

```bash
pnpm dev        # Dev server (default port 3000)
pnpm build      # Production build
pnpm preview    # Preview built app
pnpm lint       # ESLint
pnpm typecheck  # Nuxt type checking
```

### Docker Services

```bash
docker compose up -d        # Start all services (Laravel, MongoDB, Redis, Vector)
docker compose down         # Stop all services
docker compose logs -f      # Follow logs for all services
```

Services run on custom ports (see `.env.example`):
- MongoDB: 42102
- Redis: 42103

## Architecture

### Backend Structure

```
app/
├── Console/Commands/      # Artisan commands (metrics:listen, logs:*, etc.)
├── Http/Controllers/      # API controllers (LogIngest, LogQuery, Metrics)
├── Mcp/                   # MCP server implementation
│   ├── Servers/           # ObservabilityServer (MCP endpoint)
│   ├── Tools/             # Structured MCP tools for logs/metrics queries
│   └── Support/           # Helper utilities (MongoHelpers)
└── Models/                # Eloquent models (LogMessage, Metric, User)

routes/
├── api.php     # API routes for logs/metrics queries
├── ingest.php  # High-throughput log ingestion (minimal middleware)
├── ai.php      # MCP server endpoint
└── web.php     # Web routes (minimal)

config/services.php  # LOG_INGEST_TOKEN configuration
```

**MongoDB Collections:**
- `log_messages` - Log entries with `timestamp`, `meta`, `message`, `level`, `stream`, `workload`
- `log_facets` - Cached facet values for filtering (type/value pairs with first_seen/last_seen)
- `metrics` - Time-series metrics with `timestamp`, `meta`, `metric`, `value`, `unit`

### Frontend Structure

```
frontend/
├── app/
│   ├── pages/         # Nuxt pages (routing)
│   ├── components/    # Vue components
│   ├── composables/   # Composable functions (auto-imported)
│   ├── assets/css/    # Tailwind + Nuxt UI theme
│   └── app.vue        # Root layout
├── nuxt.config.ts     # Nuxt configuration
└── app.config.ts      # Nuxt UI theme config
```

**Tech Stack:**
- Nuxt 4 with Nuxt UI (Tailwind-based component library)
- Pinia for state management
- Vue Router (Nuxt pages)
- TypeScript enabled

**Reference Example:** `.frontend-example/` contains a larger Nuxt 3 reference architecture with domain-first structure, i18n, and lint tooling. Current frontend is intentionally simpler—only adopt patterns from the reference if explicitly needed.

### Data Models

**Metrics MQTT Topics:**
```
metrics/docker/{host}/{container}/{metric}
metrics/proxmox/{host}/{container}/{metric}
metrics/containers/{host}/{container}/{metric}
metrics/{host}/{device}/{metric}
```

**Metrics Payload:**
```json
{"value": 42.5, "unit": "percent", "ts": 1234567890}
```

**Log Ingest Format (newline-delimited JSON):**
```json
{"ts": 1234567890, "message": "...", "level": "error", "meta": {"host": "...", "container": "..."}}
```

### Authentication

**Log Ingest:** Bearer token auth via `LOG_INGEST_TOKEN` (config/services.php). Vector sends `Authorization: Bearer {token}` header.

**API Endpoints:** Currently no authentication (local lab setup).

## Testing

Uses Pest (PHPUnit successor) with Feature and Unit test suites.

Test files:
- `tests/Feature/LogsTest.php` - Log ingestion and query tests
- `tests/Feature/MetricsTest.php` - Metrics API tests
- `tests/Pest.php` - Global Pest configuration
- `tests/TestCase.php` - Base test case

Run tests after clearing config cache to avoid stale configuration issues.

## Configuration

**Environment Variables:**
- `DB_CONNECTION=mongodb` - MongoDB connection (required)
- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DATABASE` - Database name
- `MQTT_HOST` - MQTT broker for metrics
- `LOG_INGEST_TOKEN` - Token for log ingestion auth
- `REDIS_HOST`, `REDIS_PORT` - Redis connection
- Custom ports: `APP_PORT`, `VITE_PORT`, `FORWARD_MONGODB_PORT`, `FORWARD_REDIS_PORT`

**Docker Vector:**
Configuration in `docker/vector/vector.yaml`. Vector ships Docker logs to Laravel's ingest endpoint with bearer token auth.

## Code Style

**PHP:**
- PSR-12 standards
- Use Laravel Pint (`./vendor/bin/sail php vendor/bin/pint`) for formatting
- `StudlyCase` for classes, `camelCase` for methods/properties

**Frontend:**
- Nuxt/Vue conventions
- ESLint via `@nuxt/eslint`
- Use Nuxt UI components (`UApp`, `UPage`, `UCard`, `UTable`, etc.)
- Prefer composables over Pinia for simple state

## Frontend Development Notes

**Current State:** Starter template with placeholder pages. The metrics/log viewing UI needs to be built.

**Key Components to Build:**
- Time range picker (absolute + relative ranges)
- Query/filter bar (level, host, container, workload)
- Log table with JSON detail view
- Metrics panels (summary cards, trend charts)

**What to Remove:**
- Starter content in `frontend/app/pages/index.vue`
- `TemplateMenu.vue` component
- Template links in `frontend/app/app.vue`

**API Integration:**
Use `useFetch`/`useAsyncData` composables to call Laravel API endpoints (`/api/logs`, `/api/metrics/*`).

## Related Documentation

See project-specific guides:
- `AGENTS.md` - Legacy guidelines (now consolidated into this file)
- `FRONTEND.md` - Detailed frontend architecture notes
- `README.md` - Standard Laravel readme
