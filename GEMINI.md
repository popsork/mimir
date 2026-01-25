# Mimir - AI-Native Observability Platform

## Project Overview
**Mimir** is a comprehensive observability platform designed to collect, store, and visualize logs and metrics. It is built as a hybrid application with a **Laravel** backend (serving as the API and MCP Server) and a **Nuxt** frontend (providing a modern, reactive dashboard). It leverages **MongoDB** for high-volume data storage and **Vector** for robust data ingestion.

Key capabilities include:
- **Log Management:** Ingestion, storage, and querying of structural logs.
- **Metrics Monitoring:** Time-series data collection for hosts, devices, and containers.
- **AI Integration:** Acts as a **Model Context Protocol (MCP)** server, allowing AI agents to directly query observability data using semantic tools.

## Technology Stack

### Backend (API & MCP Server)
- **Framework:** Laravel 12.0
- **Language:** PHP 8.2+
- **Database:**
  - **MongoDB:** Primary storage for Logs and Metrics (via `mongodb/laravel-mongodb`).
  - **SQLite:** Application state (Users, Settings) - *Default fallback*.
  - **Redis:** Queue management and Caching.
- **Protocols:**
  - **HTTP:** REST API.
  - **MQTT:** IoT/Device data ingestion (`php-mqtt/laravel-client`).
  - **MCP:** Model Context Protocol for AI agent interaction (`laravel/mcp`).
- **Testing:** Pest PHP.

### Frontend (Dashboard)
- **Framework:** Nuxt 4 (Vue.js)
- **UI Library:** Nuxt UI v4 (`@nuxt/ui`)
- **State Management:** Pinia
- **Visualization:** Unovis (`@unovis/ts`), `nuxt-charts`.
- **Language:** TypeScript

### Infrastructure
- **Ingestion:** [Vector](https://vector.dev/) (configured in `docker/vector/vector.yaml`) for collecting and transforming logs/metrics before sending them to the app/database.
- **Containerization:** Docker & Docker Compose (`compose.yaml`).

## Project Structure

```text
/
├── app/                 # Laravel Application Core (Models, Controllers, MCP Servers)
│   ├── Mcp/             # MCP Server implementation (Tools, Servers)
│   ├── Models/          # Eloquent Models (LogMessage, Metric, User)
│   └── ...
├── config/              # Laravel Configuration
├── database/            # Migrations and Seeders
├── docker/              # Infrastructure Configuration (Vector, etc.)
├── docs/                # Project Documentation (MCP, Metrics, Todo)
├── frontend/            # Nuxt 4 Frontend Application
│   ├── app/             # Nuxt App Source (Pages, Components, Composables)
│   ├── nuxt.config.ts   # Nuxt Configuration
│   └── ...
├── routes/              # Route Definitions
│   ├── api.php          # API Routes
│   ├── ai.php           # MCP/AI Routes
│   └── ingest.php       # Data Ingestion Routes
├── tests/               # Pest Test Suite
└── AGENTS.md            # Guidelines for AI Agents working on this repo
```

## Development Workflow

This project relies heavily on **Laravel Sail** (Docker wrapper) for a consistent development environment.

### Setup & Initialization
```bash
# Initialize the project (copy .env, generate keys, migrate, install dependencies)
composer run setup
```

### Running the Application
```bash
# Start the full stack (Laravel Server, Queue, Logs, Vite, etc.)
./vendor/bin/sail composer run dev

# Start only Docker services (MongoDB, Redis, Vector)
docker compose up -d
```

### Frontend Development
The frontend is a standalone Nuxt app within `frontend/`.
```bash
cd frontend
pnpm install
pnpm dev       # Start Nuxt dev server
pnpm build     # Build for production
pnpm typecheck # Run TypeScript checks
```

### Testing
```bash
# Run PHP tests (Pest)
./vendor/bin/sail composer run test
# OR
./vendor/bin/sail artisan test
```

## Model Context Protocol (MCP)

Mimir exposes an MCP server at `/mcp/observability` (via `routes/ai.php`). This allows AI agents to inspect the system using the following tools:

- `logs.query`: Query logs with filters and text search.
- `metrics.catalog`: List available metrics.
- `metrics.series`: Retrieve time-series data.
- `metrics.summary`: Get statistical summaries (min/max/avg).
- `mongo.aggregate`: Run raw MongoDB aggregation pipelines.

**Debugging MCP:**
```bash
./vendor/bin/sail artisan mcp:inspector /mcp/observability
```

## Key Files for Context
- `AGENTS.md`: Detailed rules and conventions for this codebase.
- `docs/MCP.md`: Documentation for the MCP implementation.
- `docker/vector/vector.yaml`: Configuration for data ingestion pipelines.
- `frontend/nuxt.config.ts`: Main frontend configuration.
