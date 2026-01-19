# Repository Guidelines

## Project Structure & Module Organization
- `app/` Laravel application code; `routes/` for route files (ingest is `routes/ingest.php`).
- `config/` app/service configuration; `tests/` Pest test suites.
- `resources/` Laravel UI assets; `public/` web root.
- `frontend/` Nuxt (Nuxt UI) app; `docker/` + `compose.yaml` for local services.

## Build, Test, and Development Commands
- Use Sail for PHP/Artisan/Composer (e.g., `./vendor/bin/sail php artisan ...`).
- `composer run setup` — initial bootstrap (.env, key, migrate, assets).
- `./vendor/bin/sail composer run dev` — Laravel server, queue, logs, Vite.
- `./vendor/bin/sail composer run test` — run tests after clearing config cache.
- `npm run dev` / `npm run build` — Laravel Vite assets.
- `cd frontend && pnpm dev|build|preview` — Nuxt dev/build/preview.
- `docker compose up -d` — local services (Laravel, MongoDB, Redis, Vector).

## Coding Style & Naming Conventions
- PHP: PSR-12, `StudlyCase` classes, `camelCase` methods.
- JS/TS/CSS: Nuxt/Vite defaults; descriptive, feature-scoped filenames.
- Format PHP with `./vendor/bin/pint` when editing PHP.

## Frontend (Nuxt) Structure
- `frontend/app/` for pages, layouts, components, composables, middleware.
- `frontend/public/` for static assets; `frontend/nuxt.config.ts` for modules/runtime config.
- Prefer Nuxt conventions for routing (`app/pages`) and auto-imports (`app/composables`).

## Frontend Reference (from `.frontend-example`)
- SPA (`ssr: false`) Nuxt 3 setup with Pinia + Pinia ORM, i18n, Naive UI, PrimeVue.
- Domain-first layout: `app/components/`, `app/stores/`, `app/pages/`, `app/composables/`, `app/types/`, `app/utils/`.
- i18n files in `i18n/locales/`; translations validated by `tools/validateTranslationFiles.js`.
- ESLint + Stylelint auto-fix during dev, lint-staged hooks for staged files.

## Testing Guidelines
- Pest in `tests/Feature` and `tests/Unit`.
- Run via `./vendor/bin/sail php artisan test` or `./vendor/bin/sail composer run test`.

## Commit & Pull Request Guidelines
- No established commit convention yet; use clear, imperative summaries.
- PRs: brief description, test results; add screenshots for UI changes.

## Security & Configuration Tips
- Secrets live in `.env`; do not commit tokens.
- Log ingest auth uses `LOG_INGEST_TOKEN` (`config/services.php`).
- Vector config is `docker/vector/vector.yaml`.

## Documentation References
- Using Nuxt documentation from `https://nuxt.com/llms.txt`.
