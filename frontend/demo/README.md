# demo

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## API Client (hey-api)

The typed API client in `src/client/` is generated from the backend's OpenAPI
schema with [`@hey-api/openapi-ts`](https://heyapi.dev/). The base URL is read at
runtime from `VITE_API_URL` (see `.env` and `src/hey-api.ts`).

### 1. Regenerate `openapi.yaml` from the backend

Run from the `backend/demo` directory (requires the backend's Poetry env):

```sh
poetry run python manage.py spectacular --file ../../frontend/demo/openapi.yaml
```

### 2. Regenerate the TypeScript client from `openapi.yaml`

Run from `frontend/demo`:

```sh
npm run generate:api
```

This also emits runtime JSON Schemas (`src/client/schemas.gen.ts`) via the
`@hey-api/schemas` plugin.

## Schema-driven forms (FormKit)

The create-product and create-order forms are not hand-written. Instead,
`src/formkit/openapi-to-formkit.ts` converts the generated JSON Schemas into a
[FormKit schema](https://formkit.com/essentials/schema), which
`<FormKitSchema>` renders. Input types and validation rules are derived from the
OpenAPI model (e.g. `maxLength` → `length`, `format: email` → email input,
enums → `select`). Relation fields (foreign keys) and the order's repeatable
line items are supplied per-field via `overrides` / `repeatableList`, since
their options and add/remove behaviour are runtime concerns.

Regenerating the client (step 2) therefore keeps the forms in sync with the API.
