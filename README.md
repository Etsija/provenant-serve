# Provenant Serve UI

Minimal React front-end for a locally running [`provenant serve`](https://github.com/doubleopen-io/provenant) backend.

The app lets you submit GitHub repository scans through the Provenant HTTP API, poll async jobs, and view a minimal scan result summary plus raw JSON output.

## Prerequisites

- Node.js with Corepack enabled
- pnpm
- A locally built `provenant` command available on `PATH`

If `pnpm` is not active after a Node/npm upgrade, run:

```sh
corepack enable
corepack prepare pnpm@10.33.2 --activate
```

## Install dependencies

```sh
pnpm install
```

## Start the backend

In a separate terminal, start Provenant HTTP mode on the expected local address:

```sh
provenant serve --bind 127.0.0.1:8080
```

Useful backend checks:

```sh
curl -sS http://127.0.0.1:8080/livez
curl -sS http://127.0.0.1:8080/readyz
curl -sS http://127.0.0.1:8080/version
```

## Start the frontend

```sh
pnpm dev
```

Open the Vite dev server URL, usually:

```txt
http://localhost:5173
```

## Development proxy

The browser app calls Provenant through a Vite development proxy:

```txt
/api/* -> http://127.0.0.1:8080/*
```

For example:

```txt
/api/v1/scans:async -> http://127.0.0.1:8080/v1/scans:async
```

This avoids browser CORS issues during local development.

## Scanning repositories

The UI submits async repository scans to:

```http
POST /v1/scans:async
```

Repository scans currently require a ref. The form defaults this to `main`.

Example request shape:

```json
{
  "input": {
    "type": "repository",
    "url": "https://github.com/doubleopen-io/provenant.git",
    "ref": "main"
  },
  "options": {
    "detect_license": { "type": "embedded" },
    "detect_packages": true,
    "detect_copyrights": true,
    "detect_emails": true,
    "detect_urls": true
  }
}
```

After submission, the UI polls:

```http
GET /v1/jobs/{id}
```

When the result is ready, it fetches:

```http
GET /v1/jobs/{id}/result
```

## Validation

Before considering front-end work complete, run:

```sh
pnpm tsc --noEmit
pnpm lint
pnpm format:check
pnpm test
```

For a production build check, also run:

```sh
pnpm build
```

## Tech stack

- Vite
- React
- TypeScript
- TanStack Query
- Tailwind CSS
- shadcn/ui components
- ESLint
- Prettier
