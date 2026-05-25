# Implementation Plan

This plan builds a minimal React front-end for `provenant serve` using Vite, React, TypeScript, pnpm, ESLint, Prettier, Tailwind CSS, and basic shadcn/ui components.

Project validation follows `AGENTS.md`:

1. `pnpm tsc --noEmit`
2. `pnpm lint`
3. `pnpm format:check`
4. `pnpm test`

## Commit 1 — `chore: scaffold Vite React TypeScript app`

- Initialize Vite React + TypeScript app.
- Use `pnpm`.
- Add base scripts:
  - `dev`
  - `build`
  - `preview`
  - `test`
- Add minimal placeholder app.
- Add initial TypeScript config.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

Note: if lint/format are introduced in later commits, this commit may only validate what exists, unless all tooling is included immediately.

## Commit 2 — `chore: add ESLint and Prettier`

- Add ESLint for:
  - TypeScript
  - React
  - React Hooks
  - Vite/browser globals
- Add Prettier.
- Add scripts:
  - `lint`
  - `format`
  - `format:check`
- Add config files:
  - `eslint.config.js`
  - `.prettierrc`
  - `.prettierignore`
- Ensure generated/build output is ignored.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 3 — `chore: configure Tailwind CSS and shadcn/ui`

- Add Tailwind CSS.
- Add shadcn/ui-compatible setup:
  - `components.json`
  - path aliases
  - `src/lib/utils.ts`
- Add initial shadcn/ui components:
  - `button`
  - `input`
  - `label`
  - `card`
  - `checkbox`
  - `textarea`
  - `alert`
  - `badge`
- Wire global CSS.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 4 — `feat: add Provenant API client and Vite proxy`

- Configure Vite dev proxy:
  - frontend calls `/api`
  - proxy forwards to `http://127.0.0.1:8080`
  - `/api/v1/scans:async` becomes `/v1/scans:async`
- Add typed API helpers for:
  - `GET /livez`
  - `GET /readyz`
  - `GET /version`
  - `POST /v1/scans:async`
  - `GET /v1/jobs/{id}`
  - `GET /v1/jobs/{id}/result`
- Add TypeScript types for the initial request/response shapes.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 5 — `feat: show Provenant service health`

- Add health/version panel.
- Query:
  - `/livez`
  - `/readyz`
  - `/version`
- Display:
  - liveness
  - readiness
  - API version
  - tool version
- Use shadcn/ui cards, badges, and alerts.
- Handle loading and error states.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 6 — `feat: add repository scan form`

- Add repository scan form with:
  - GitHub repository URL
  - optional ref
  - default scan option checkboxes
- Default options:
  - embedded license detection
  - packages
  - copyrights
  - emails
  - URLs
- Submit to async endpoint:

```http
POST /v1/scans:async
```

- Display accepted job ID and initial state.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 7 — `feat: poll scan jobs and fetch results`

- Poll:

```http
GET /v1/jobs/{id}
```

- Stop polling on terminal states:
  - `succeeded`
  - `failed`
- Fetch result when ready:

```http
GET /v1/jobs/{id}/result
```

- Display:
  - job state
  - result readiness
  - allocated processors
  - errors where applicable

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 8 — `feat: add minimal scan result viewer`

- Add defensive summary rendering for ScanCode-compatible output.
- Add scrollable raw JSON viewer.
- Keep UI minimal and robust against varying result shape.

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

## Commit 9 — `docs: document local development workflow`

- Add/update `README.md` with:
  - prerequisites
  - installing dependencies
  - starting `provenant serve`
  - starting the Vite frontend
  - Vite `/api` proxy behavior
  - validation commands

Validation:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```
