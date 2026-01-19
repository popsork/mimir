# Frontend Guide (Nuxt UI)

## Overview
The frontend lives in `frontend/` and is a Nuxt 4 application using Nuxt UI and Tailwind CSS. It will serve a **Metrics + Log-viewing** experience, so prioritize fast filtering, time‑range navigation, and readable data density.

## Stack & Tooling
- **Nuxt:** `frontend/package.json` uses Nuxt `^4.2.2`.
- **UI:** Nuxt UI (`@nuxt/ui`) with Tailwind (`@tailwindcss/vite`).
- **TypeScript:** enabled (Nuxt defaults) with `nuxt typecheck` available.
- **Linting:** ESLint via `@nuxt/eslint` and `frontend/eslint.config.mjs`.
- **Package manager:** `pnpm` (see `frontend/package.json`).

## Core Configuration
- `frontend/nuxt.config.ts`
  - Modules: `@nuxt/eslint`, `@nuxt/ui`.
  - `css: ['~/assets/css/main.css']`.
  - `routeRules: { '/': { prerender: true } }` (home is prerendered).
  - No explicit `ssr` flag; defaults to Nuxt behavior unless changed.
- `frontend/app/app.config.ts`
  - Nuxt UI theme config (primary/neutral colors).
- `frontend/app/assets/css/main.css`
  - Tailwind + Nuxt UI imports and theme CSS variables.

## Directory Layout (Current)
- `frontend/app/app.vue`: global layout wrapper (`UApp`, header/footer, `<NuxtPage />`).
- `frontend/app/pages/index.vue`: starter landing page (replace with metrics/log UI).
- `frontend/app/components/`: shared components (currently `AppLogo`, `TemplateMenu`).
- `frontend/app/assets/css/main.css`: Tailwind + Nuxt UI theme overrides.
- `frontend/public/`: static assets (icons, images).

## Development Commands (Frontend)
Run from `frontend/`:
- `pnpm dev` — local dev server.
- `pnpm build` — production build.
- `pnpm preview` — preview built app.
- `pnpm lint` — ESLint.
- `pnpm typecheck` — Nuxt type check.

## UI & Styling Conventions
- Use Nuxt UI components (`UApp`, `UPage`, `UCard`, `UTable`, `UInput`, etc.).
- Theme in `app.config.ts`; add tokens in `app/assets/css/main.css`.
- Keep layout dense but readable (logs/metrics are data‑heavy).

## Data Access & State (Planned)
Current frontend has no store configured. For this project:
- Prefer Nuxt composables (`useFetch`, `useAsyncData`) for API calls.
- Use local `ref`/`computed` for view state.
- If global state becomes necessary, add Pinia deliberately (no Pinia ORM).

## Metrics + Log UI Guidance (Project‑Specific)
Focus components should include:
- **Time range picker** (absolute + relative ranges).
- **Query/filter bar** (level, source, service, tags).
- **Log table** with column toggles and JSON detail drawer.
- **Metrics panels** (summary cards, trend charts, percentile stats).
- **Streaming mode** toggle with backpressure (pause/resume).

## Reference Architecture (from `.frontend-example`)
The copied reference (`.frontend-example/`) is a larger Nuxt 3 SPA with:
- Domain‑first structure: `app/components/`, `app/pages/`, `app/stores/`, `app/composables/`, `app/types/`, `app/utils/`.
- i18n in `i18n/locales/` with a translation validator in `tools/validateTranslationFiles.js`.
- ESLint + Stylelint with auto‑fix and lint‑staged hooks.
- Nuxt modules for i18n, UI libraries, and advanced routing hooks.

### Excluded from this project (documented for review)
We will **not** use the following pieces from `.frontend-example`:
- **Pinia ORM** (`@pinia-orm/nuxt`) — not needed for current data shapes.
- **Sylvie** (`sylviejs`) — excluded.
- **Google Maps** (`@googlemaps/*`) — excluded.
- **Authentication flows** — excluded from scope.
- **Naive UI / PrimeVue** — replaced by **Nuxt UI** in this project.

### Optional patterns from the reference (only if needed)
If requirements grow, consider selectively adopting:
- Domain‑based folder organization (mirrors `.frontend-example` structure).
- i18n with locale validation if multi‑language is required.
- Stylelint + lint‑staged if CSS scale increases.

## What to Remove from the Starter Template
Before building the metrics/log UI, replace/remove:
- Starter landing content in `frontend/app/pages/index.vue`.
- `TemplateMenu.vue` and external template links in `frontend/app/app.vue`.

## Documentation Reference
Use Nuxt docs from `https://nuxt.com/llms.txt`.
