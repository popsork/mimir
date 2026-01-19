# MOTUS TMS front-end SPA

Built with:

* Nuxt 3 / Vue 3
* Vite
* Pinia
* TypeScript
* Pug
* SASS

## Development

Install dependencies:

```bash
npm install
```

Copy `frontend/.env.example` to `frontend/.env` and adjust values if needed.

Start the development server (use http://motus-tms-frontend.localtest.me:3000/ to access):

```bash
npm run dev
```

For backend development, to just run the frontend, use:
```bash
npm run build
npm run preview
```

## Static code analysers

Type checks, ESlint and Stylelint are set to run in auto-fix mode automatically via vite development server on each save,
and as a pre-commit hook only on staged files via husky and lint-staged.

To install the pre-commit hooks, run `npm install` in the top-level folder (not inside the `frontend` folder).

Locale translation files are also checked to ensure that their structure is identical and the format is correct.

To manually run type checks, Eslint, Stylelint on all files and also run the translation validator in one go:

```bash
npm run check-all
```

To manually run type checks on all files:

```bash
npm run typecheck
```

To manually run eslint on all files:
```bash
npm run eslint
```

or with auto-fixing:
```bash
npm run eslintfix
```

To manually run stylelint on all files:
```bash
npm run stylelint
```

or with auto-fixing:
```bash
npm run stylelintfix
```

To manually run locale translation file validator:
```bash
npm run check-translations
```
