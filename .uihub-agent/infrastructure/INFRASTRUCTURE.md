# UI HUB — Infrastructure

Build, run, deploy, and the environment contract.

## 0. Read this first: a live database credential is committed to git
>
**`backend/.env.example` is tracked, and it contains a real MongoDB Atlas
connection string with an embedded username and password.**

```
mongodb+srv://<db-username>:<password>@cluster0.<redacted>.mongodb.net/uihub
```

This is not a placeholder. The password is a real 13-character credential
(verified by parsing the string; the value is deliberately not reproduced
here). The file also contains a real Brevo SMTP account id.

**Consequences, in order of urgency:**

1. **The password must be rotated in Atlas.** Adding it to `.gitignore` does
   nothing — it is already in history. Rotation is the only fix; scrubbing
   history is optional cleanup afterwards.
2. **The cluster is publicly reachable from anywhere** that has the string.
3. **`.env.example` is the wrong place for a working value.** It should hold
   `mongodb+srv://<user>:<password>@<host>/<db>` with obvious placeholders.

Every other secret file in the repo is correctly git-ignored
(`backend/.env`, `backend/.env.local`, `backend/service-account.json`,
root `.env`). **This one file is the exception.** `../CONFLICTS.md` §1,
`../rules/DO_NOT_CHANGE.md` §1.

This is recorded, not fixed — Phase 1 is discovery-only, and rotating a
production credential is the owner's decision, made deliberately.

---

## 1. Not a workspace

There is **no npm workspace** at the root. Five independent `package.json`
files, each with its own `node_modules`, its own `tsconfig`, and its own
dependency resolution. The root `package.json` exists only to hold `cd`-based
shell scripts.

| Directory | Name in `package.json` | Type | Notes |
|---|---|---|---|
| `frontend/` | **`react-example`** | ESM | **Name is a Vite-template leftover** |
| `backend/` | `ui-hub-backend` | ESM | Express 4.19 |
| `mcp-server/` | `ui-hub-mcp-server` | ESM | TypeScript → `dist/` |
| `cli/` | `ui-hub-cli` | ESM | TypeScript → `dist/` |
| `api/` | — | — | Vercel function entry, 2 lines |
| root | `ui-hub-root` | ESM | Scripts only |

`frontend/package.json` is still called **`react-example`**. Cosmetic, but it
means the frontend's real identity is not recorded anywhere, and any tooling
that keys off the package name is reading a template default.

### The build graph has a hidden dependency

```
mcp-server/src ──tsc──▶ mcp-server/dist ──┐
                                          │  server.js:128-130 imports
                                          │  ../../mcp-server/dist/routes/*.js
                                          ▼
                                      backend/src/server.js
                                          │
                    ┌─────────────────────┴──────────────┐
                    ▼                                    ▼
          api/index.js (Vercel)              backend npm start (Render)
```

**`backend` depends on `mcp-server`'s build output, not its source.** This is
the single most consequential fact about the build, and §4 shows it breaks on
one of the two deployment targets.

---

## 2. Commands

Run from the repo root. Every one is a `cd` wrapper.

| Command | Effect |
|---|---|
| `npm run install-all` | install all four sub-projects |
| `npm run dev` | frontend + backend, concurrently |
| `npm run dev:all` | + mcp-server |
| `npm run build` | **frontend only** |
| `npm run build:mcp` | install + build mcp-server |
| `npm run build:backend` | `build:mcp` + install backend |
| `npm run build:cli` | build the CLI |
| `npm start` | `cd backend && npm start` |
| `npm run sync:components` | one-off catalogue sync |
| `npm run test:cli` | CLI tests |
| `npm run ui-hub` | run the built CLI |

**There is no root `test` script**, so `npm test` at the root fails. The only
root-level test entry point is `test:cli`.

### Per-project

| Project | dev | build | test | port |
|---|---|---|---|---|
| `frontend` | `vite --port=3000 --host=0.0.0.0` | `vite build` | **none** | **3000** |
| `backend` | `node --watch-path=./src src/server.js` | *see below* | `check:premium && node --test tests/` | 5000 |
| `mcp-server` | `tsx watch src/index.ts` | `tsc && check-source-coverage && copy-data` | `vitest run` | 3001 |
| `cli` | `tsx src/cli.ts` | `tsc` | `node --import tsx --test tests/*.ts` | — |

`backend`'s `build` script is `cd ../mcp-server && npm install && npm run build`
— **backend has nothing of its own to compile.** Its `postinstall` runs
`npm install` in mcp-server but **not** its `build`, so a plain
`npm install` in `backend` leaves `mcp-server/dist` stale or absent.

---

## 3. The critical build defect

`backend/src/server.js:109-138`, in a `try`/`catch` that only warns:

```js
try {
  // symlink backend/node_modules → mcp-server/node_modules
  const { mcpRouter }    = await import('../../mcp-server/dist/routes/mcp.js');
  const { dashboardRouter } = await import('../../mcp-server/dist/routes/dashboard.js');
  const { adminRouter }  = await import('../../mcp-server/dist/routes/admin.js');
  app.use('/mcp', mcpRouter);
  app.use('/api/dashboard/mcp', dashboardRouter);
  app.use('/api/admin/mcp', adminRouter);
} catch (mcpErr) {
  console.warn('[MCP] ⚠️ MCP routes could not be mounted:', mcpErr.message);
}
```

Three compounding problems:

1. **It imports `dist/`, not `src/`.** A stale or missing build silently
   disables MCP. Source edits to `mcp-server` do nothing until `npm run build`.
2. **Failure is a warning, not a failure.** The app boots, `/health` returns
   200, and only a log line says MCP is missing.
3. **A symlink is created at import time** (`symlinkSync`, junction) pointing
   `mcp-server/node_modules` at `backend/node_modules`, with the failure
   swallowed. It exists to satisfy `mcp-server`'s own imports. It cannot work on
   a filesystem without symlinks — which is exactly the serverless case.

### And the health check cannot detect any of it

```js
// server.js:141-152
res.json({ status: 'ok', services: { backend: 'online', mcp: 'online' }, ... });
```

**`mcp: 'online'` is a hardcoded string literal.** It is not a probe, not a flag
set by the `try` block, and not derived from any check. `backend: 'online'` is
equally hardcoded — the handler returns 200 as long as Express is running and
able to serialise JSON, regardless of whether MongoDB is connected.

`render.yaml` sets `healthCheckPath: /health`, so **Render's deploy gate passes
on a process whose database is unreachable and whose MCP routes never mounted.**
`../CONFLICTS.md` §3.

---

## 4. Two deployment targets, and they disagree

### 4.1 Vercel — frontend + a full serverless copy of the backend

```jsonc
// vercel.json
"buildCommand": "npm install && cd frontend && npm install && npm run build",
"outputDirectory": "frontend/dist",
"framework": "vite",
"rewrites": [
  { "source": "/api/(.*)", "destination": "/api/index.js" },
  { "source": "/(.*)",     "destination": "/index.html" }
],
"functions": { "api/index.js": { "includeFiles": "backend/**", "maxDuration": 30 } }
```

`api/index.js` is the entire integration surface:

```js
import app from '../backend/src/server.js';
export default app;
```

So **the whole Express app runs on Vercel as a serverless function** — all 38
REST endpoints, under the `/api` prefix (which is why `server.js` mounts its
router at both `/api` and `/`).

**Two things follow, and both are defects:**

- **`includeFiles: "backend/**"` excludes `mcp-server/`.** The three
  `await import('../../mcp-server/dist/...')` calls at `server.js:128-130`
  therefore cannot resolve on Vercel. They throw, are caught, and MCP is
  **absent from Vercel** with a single warning line.
- **The build command never builds mcp-server.** No `npm run build:mcp`. So
  `dist/` does not exist on Vercel even if the files were included.

> **Conclusion: MCP runs on Render only.** The route registration
> `app.use('/mcp', …)` exists in the shared `server.js`, so the code *reads* as
> if MCP is served on both platforms. It is not. The comment
> *"Unified Deployment"* describes an intent that the Vercel config does not
> achieve. `../CONFLICTS.md` §2.

`maxDuration: 30` is the other constraint worth knowing: a 30-second ceiling on
every request that passes through this function. The frontend's own AI-prompt
timeout is 3.5s, so the app is well inside it, but a slow MongoDB cold start on
a free-tier cluster is the realistic way to hit it.

### 4.2 Render — the real backend + MCP

```yaml
buildCommand: cd mcp-server && npm install && npm run build && cd ../backend && npm install
startCommand: cd backend && npm start
healthCheckPath: /health
plan: starter
region: oregon
```

Render **does** build mcp-server before starting. This is why the §3 defect does
not bite there — and why the bug is invisible in the primary environment and
only appears on Vercel.

### 4.3 The two-instance problem

The same Express app, with the same routes, runs in **two** places. Anything
held in process memory is per-instance:

| State | Consequence |
|---|---|
| Rate-limit counters (no `REDIS_URL`) | **per-instance**, so limits multiply by instance count |
| MCP session store (`GET`/`DELETE /`) | **per-instance** — a session issued by one instance is invisible to another |
| `trust proxy` + client IP | correct on both, but see `server.js:34` |

`getApiBaseUrl()` decides which one the browser talks to, from
`VITE_API_URL`. Both are live and both serve `/v1/*`.

---

## 5. Environment variables

**Names only. No values appear in this file, and none may be added to it.**

### Declared in `render.yaml`

| Variable | Value in the blueprint | Note |
|---|---|---|
| `NODE_ENV` | `production` | literal |
| `MONGODB_URI` | `sync: false` | secret, set in the dashboard |
| `MONGODB_DB` | `uihub` | literal |
| `MCP_SERVER_URL` | `https://ui-hub-mcp.onrender.com` | **stale — see below** |
| `MCP_API_KEY_PREFIX` | `uh_live_` | literal |
| `MCP_RATE_LIMIT_FREE` | `150` | matches `mcp_config` seed |
| `MCP_RATE_LIMIT_PRO` | `10000` | matches `mcp_config` seed |
| `MCP_ALLOWED_ORIGINS` | Vercel prod + `localhost:5173`, `localhost:3000` | **5173 is stale** |
| `MCP_ADMIN_EMAILS` | **three real Gmail addresses, in plaintext** | PII in a tracked file |
| `BREVO_API_KEY` | `sync: false` | secret |
| `BREVO_SENDER_EMAIL` | `uihub.design@gmail.com` | literal |
| `BREVO_SENDER_NAME` | `UI-HUB` | literal |
| `RAZORPAY_KEY_ID` | `sync: false` | secret |
| `RAZORPAY_KEY_SECRET` | `sync: false` | **secret** |
| `FIREBASE_PROJECT_ID` | `ui-hub-3fe3d` | public identifier |
| `FIREBASE_CLIENT_EMAIL` | `sync: false` | secret |
| `FIREBASE_PRIVATE_KEY` | `sync: false` | **secret** |
| `REDIS_URL` | `sync: false` | secret |

> **`MCP_SERVER_URL` points at `ui-hub-mcp.onrender.com`, but the service
> defined in the same file is `ui-hub-backend-mcp`.** Either an older service
> still exists, or clients built from this blueprint call a hostname that is not
> the unified backend. This is the value a published MCP client would use.
> `../CONFLICTS.md` §20.

> **`MCP_ADMIN_EMAILS` commits three personal Gmail addresses to the
> repository.** Not a credential, but it is PII, it is the MCP admin
> allow-list, and it makes the admin population public. The backend equivalent
> (`SUPER_ADMINS` / `ADMINS` in `setupProductionDatabase.js`) is hardcoded in
> source too, so "admin" is public in two places.

### Declared in `backend/.env.example` — the credential leak

`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`,
`VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`,
`VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`,
`VITE_FIREBASE_MEASUREMENT_ID`, `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`,
`BREVO_SENDER_NAME`, `BREVO_SMTP_USER`, `BREVO_SMTP_PASS`, `SMTP_HOST`,
`SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `RAZORPAY_KEY_ID`,
`RAZORPAY_KEY_SECRET`, `MONGODB_URI`, `MONGODB_DB`.

**Most are empty — except `MONGODB_URI`, which is a live credential.** See the
banner at the top of this file. The same file also lists `BREVO_SMTP_*`
*and* `SMTP_*` as parallel SMTP configuration, so there are two naming
conventions for one integration.

### Referenced in code but absent from both lists

| Variable | Used by | Consequence if unset |
|---|---|---|
| `MCP_SERVER_URL` (client side) | `cli/`, MCP clients | published endpoint may be wrong |
| `VITE_API_URL`, `VITE_API_BASE_URL` | `getApiBaseUrl()` | falls back to `window.location.origin` |
| `VITE_ENABLE_GTAG` | `index.html` | analytics off |
| `PORT` | `server.js:32` | 5000 |
| `VAPID_SUBJECT` / `_PUBLIC_KEY` / `_PRIVATE_KEY` | `pushService` | push disabled |

> `backend/src/services/pushService.js` reads `VAPID_*`, and
> `GET /v1/config/push-vapid` serves the public key to the browser — but
> **no `VAPID_*` variable appears in `render.yaml` or `.env.example`.** Push
> notifications may not be configured in production at all. `confidence: low`
> — the variables could be set in the Render dashboard outside the blueprint.
> `../CONFLICTS.md` §21.

### Frontend build-time variables

`VITE_*` are **inlined at build time** by Vite. Changing one requires a
**rebuild and redeploy** — setting it in the Render dashboard does nothing for
the frontend. This is a common deployment mistake: `VITE_API_URL` lives in
Vercel's build environment, not in Render's runtime environment.

---

## 6. Ports and URLs

| Service | Dev | Production |
|---|---|---|
| frontend (Vite) | **3000** | `https://ui-hub-design.vercel.app` |
| backend (Express) | 5000 | Render + Vercel `/api` |
| mcp-server | 3001 | Render (only) |

**`localhost:5173` appears in `render.yaml` (`MCP_ALLOWED_ORIGINS`) and in
`apiConfig.ts`, but the frontend dev server is on port 3000** — 5173 is Vite's
default and is stale. 3000 is also listed, so the allow-list works by accident
rather than by being right. `confidence: high` on the staleness.

`getApiBaseUrl()` sidesteps the port problem in dev by detecting a LAN IP and
repointing to `:5000`, which is why local development mostly works despite the
drift. `PricingPage.tsx:42` and two sibling files **bypass that helper** and
read `import.meta.env.VITE_API_URL` directly, so they do *not* get the LAN
detection. See `../APIs/API_OVERVIEW.md` §9.

### CORS

`server.js:41-76` allows three hardcoded Vercel domains, plus a suffix rule
`origin.endsWith('.vercel.app')`, plus localhost. The three domains are listed
**twice** in the file (two separate arrays around lines 41-43 and 56-58).
`trust proxy` is enabled, which the rate limiters need.

---

## 7. Startup behaviour

`server.js:174-209`. The guard is:

```js
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) { app.listen(...) }
else { syncAllComponentsToMongo()... }
```

- **Render** (`NODE_ENV=production`, no `VERCEL`) → listens on `0.0.0.0:5000`,
  and inside the listen callback starts `syncAllComponentsToMongo()` **and**
  `startUserSyncWorker()`.
- **Vercel** (`NODE_ENV=production`, `VERCEL` set) → no `listen`; runs
  `syncAllComponentsToMongo()` on module load.
- **Local dev** → listens, with `--watch`.

Two consequences:

- **`startUserSyncWorker()` never runs on Vercel.** The two platforms have
  genuinely different background behaviour from the same code.
- **`syncAllComponentsToMongo()` runs on every Vercel cold start.** It is
  throttled to 1×/hour inside `syncComponents.js`, which limits the damage,
  but a cold start still pays the module-load cost of a database call path.

The `EADDRINUSE` handler (lines 185-203) probes `/health` and, if the response
matches the expected message, **silently reuses the already-running server**
instead of failing. Convenient for local dev; it means a stale process on port
5000 will be adopted without complaint, and code changes may not be what you are
actually testing. `confidence: high`.

---

## 8. Test and CI posture

### 10 test files exist. None are integration tests.

| Project | Framework | Files | Covers |
|---|---|---|---|
| `cli` | `node:test` + `tsx` | 4 | args, config, mcp, output |
| `mcp-server` | `vitest` | 4 | apiKey, auth, permissions, tools |
| `backend` | `node:test` | 2 | `accessService`, `collectionsService` |
| **frontend** | — | **0** | — |

**The frontend has no test framework at all** — not Vitest, not Testing
Library, not Playwright. `npm run lint` there is `tsc --noEmit`, which is a
typecheck, not a linter. The 137-component catalogue and all payment UI are
untested.

Neither `backend` nor `mcp-server` has an ESLint config. The only static check
in the repo is the frontend typecheck.

### There is no CI

**`.github/workflows/` is empty.** Nothing runs on push or pull request. No
build, no tests, no typecheck. Every check is manual and local, which is why the
§3 and §4 defects survived: nothing would have caught them.

### The one real safety net

```json
// mcp-server/package.json
"build": "tsc && node scripts/check-source-coverage.mjs && node scripts/copy-data.mjs"
```

`check-source-coverage.mjs` runs **on every mcp-server build** and **fails it**
if any premium component has lost its source code. This is the one place in the
project where a build step enforces a data invariant, and it is why the
premium/source relationship has not broken.

**Its limit, stated precisely:** it checks that premium components *have source*.
It does **not** check that `components.isPro` in MongoDB agrees with
`PREMIUM_COMPONENT_IDS` in code, and it does not check that `dist/` matches
`src/`. Both gaps are real — see `../data/DATA_OVERVIEW.md` §5.4.

---

## 9. What does not exist

| Missing | Consequence |
|---|---|
| **CI** | No automated build, test, or typecheck |
| **Dockerfile / docker-compose** | Render builds from `buildCommand`; no image |
| **Migration framework** | Schema changes are hand-run against production |
| **Staging environment** | `setupProductionDatabase.js` writes to whatever `MONGODB_URI` says |
| **Backend/MCP ESLint** | Only the frontend typechecks |
| **Root `test` script** | `npm test` at root fails |
| **Structured logging** | `console.log`/`warn` throughout; no log aggregation |
| **Uptime monitoring** | Only Render's deploy-time health check |
| **`components.json`** | shadcn was installed by copying, not via the CLI |

`setupProductionDatabase.js` deserves a second mention: despite the reassuring
name, it **creates indexes, seeds components, and grants paid plan tiers** in a
loop over `SUPER_ADMINS`. Run against production, it is a mutation. Its own
output ends with `process.exit(0)` and *"YOUR MONGODB ATLAS IS FULLY PRODUCTION
READY!"*. See `../rules/DO_NOT_CHANGE.md`.

---

## 10. Not documented here

| Area | Why | Phase |
|---|---|---|
| Actual live env values | Deliberately excluded — names only | Never |
| Render dashboard state | Not in the repo | 2 |
| Vercel project settings | Not in the repo | 2 |
| Atlas network ACLs / IP allowlist | Not in the repo | 2 |
| Real database contents | Requires access | 2 |
| CLI publish target | `prepublishOnly` exists; registry unknown | 5 |

---

# Phase 5 additions - Deployment topology (2026-10-01)

## Phase 5 deployment topology (authoritative)

```
ui-hub-design.vercel.app        Vercel     frontend + web API, same origin
  /            → frontend/dist (static)
  /api/*       → api/index.js → backend/src/server.js
  /health      → api/index.js → backend/src/server.js
  /mcp         → NOT ROUTED (falls through to the SPA shell)

ui-hub-mcp.onrender.com         Render     MCP service only
  /mcp, /api/dashboard/mcp, /api/admin/mcp, /health

cluster0 (uihub)                Atlas      33 users, 183 MB, read-only verified
```

Supersedes any earlier statement that the web API lives on Render.

## Phase 5: `VITE_API_URL` must be unset in production

The Phase 2 deployment notes told operators to configure `VITE_API_URL`. **That
advice caused the current outage.** The variable is inlined at build time, and the
production value points at a dead Render origin.

| Variable | Production value | Why |
|---|---|---|
| `VITE_API_URL` | **unset** | same-origin needs no configuration |
| `VITE_MCP_API_URL` | unset (uses `PROD_FALLBACK`) | MCP has its own host |
| `VITE_RAZORPAY_KEY_ID` | unset | key fetched at runtime instead |

Full table in `ENVIRONMENT_CONTRACT.md`.

## Phase 5: the Render blueprint conflict

Two blueprints each define a service mounting MCP:

| File | Service | Starts |
|---|---|---|
| `render.yaml` | `ui-hub-backend-mcp` | the web API (mounts MCP in-process) |
| `mcp-server/render.yaml` | `ui-hub-mcp` | the MCP service |

They disagree on `MCP_ADMIN_EMAILS` (three addresses vs two) and both advertise
`ui-hub-mcp.onrender.com`. Unresolved; owner decision. See `CONFLICTS.md` A13.

Recommended: split — `mcp-server/render.yaml` owns MCP, `render.yaml` owns the
web API.

## Phase 5: Vercel function configuration

| Key | Value | Note |
|---|---|---|
| `outputDirectory` | `frontend/dist` | |
| function | `api/index.js` | re-exports the Express app |
| `includeFiles` | `{backend/**,mcp-server/dist/**,mcp-server/package.json}` | **string** since `9cd6ab2c`, was an array |
| `maxDuration` | 30s | |
| `env` block | **absent** | therefore any `VITE_*` value came from the dashboard |

`includeFiles` changing shape is a live suspect for the module-load 500. See
`UNKNOWN_REGISTER.md` U-02.

## Phase 5: build and CI

| Gate | State |
|---|---|
| `cd frontend && npm run build` | PASS, exit 0, deterministic (234 chunks) |
| `cd frontend && npm test` | PASS, 27/27 (new) |
| `cd frontend && npm run lint` | **FAIL**, ~50 pre-existing errors, deferred |
| `cd backend && npm test` | PASS, 54/54 |
| `cd mcp-server && npm test` | PASS, 78/78 |
| `cd cli && npm test` | PASS, 30/30 |

`vite build` does not typecheck, so the lint failure does not block a deploy.
But `.github/` is currently **gitignored** (`1eaaec04`), so CI — which is what
enforces that gate — is not in the repository. Owner decision.

## Phase 5: `/health` no longer returns the SPA shell

`vercel.json` previously routed only `/api/*`, so `/health` fell through to
`/(.*)` → `/index.html` and returned **200 with the 6,474-byte HTML shell** while
the API was 500ing. Phase 5 added `/health → /api/index.js` ahead of the SPA
fallback. Any health check reading only the status code was previously reporting
a healthy deployment.

## Phase 5: Cloudflare

Still unverified. Cloudflare returns 503/404 for the Render hostnames. Whether it
fronts Render, is misconfigured, or is masking a suspended origin is unknown —
no account access. Recorded in `CONNECTIVITY_BASELINE.md` section 2.

## Phase 5: rollback posture

The change set is additive. Reverting the `/health` rewrite restores the old
behaviour; it does not break anything that currently works. The highest-impact
action needs no code at all: delete `VITE_API_URL` from the Vercel production
environment.
