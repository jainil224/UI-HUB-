# Task Category Catalog

Maps a task request to the intelligence queries that answer it first, the files
that usually change, and the gates that must pass afterwards.

This catalog **does not route tasks automatically**. It exists so an agent can
answer a structural question from the indexes instead of guessing, and so it
knows which check proves the work did not break anything.

Read `codebase/CODEBASE_INTELLIGENCE.md` first for how the indexes are built and
what their confidence levels mean.

---

## How to use this catalog

1. Find the category below that matches the request.
2. Run the listed `npm run agent:query --` commands **before** reading source.
3. Work only in the listed file areas unless the queries show otherwise.
4. Run the listed gates before declaring the task done.

If a query contradicts your expectation, believe the query, then verify against
the file. A stale index is the only case where the query is wrong, and
`npm run agent:index:check` settles that.

---

## 1. UI component work

**Queries first**

```bash
npm run agent:query -- component <Name>
npm run agent:query -- impact <path/to/component>
npm run agent:query -- orphans
```

**Where components live** — 227 indexed components, 199 of them with role
COMPONENT.

| Area | Feature | Notes |
| --- | --- | --- |
| `frontend/src/components/ui/` | `components` | 182 files, the shared UI kit |
| `frontend/src/components/ui/CloudScroll/` | `components` | self-contained Three.js experience, its own hooks and stores |
| `frontend/src/components/templates/` | `components` | marketplace template previews |
| `frontend/src/components/animations/` | `animations` | 13 files |
| `frontend/src/pages/*/sections/` | page feature | page-local sections |

**Gates** — `npm run build`, frontend `npm test`, and
`npm run agent:index` if files were added or deleted.

**Watch for** — `frontend/src/data/componentData.tsx` and
`embeddedSourceCode.ts.bak` hold embedded component source as **strings**. They
are not modules and not indexed as such.

---

## 2. Page and routing work

**Queries first**

```bash
npm run agent:query -- routes
npm run agent:query -- route-pages
npm run agent:query -- feature <page-slug>
```

All routing is declared in exactly one file: `frontend/src/App.tsx`
(`ROUTE_MAP.json → routerFiles`). 63 routes, 60 HIGH confidence.

**Where pages live** — `frontend/src/pages/<Name>/`, one directory per page.

**Gates** — `npm run build`, and confirm route count with
`npm run agent:query -- routes`.

**Watch for** — `ROUTE_MAP.association` records *how* each route matched its
component. A `LOW_CONFIDENCE` association (3 of 63) is a directory-name guess,
not a router declaration. Check it before assuming a component is routed.

---

## 3. Backend API work

**Queries first**

```bash
npm run agent:query -- endpoint GET /api/health
npm run agent:query -- routes
npm run agent:query -- service <name>
npm run agent:query -- integration
```

69 served endpoints (GET 34, POST 26, DELETE 5, PATCH 3, PUT 1).

**Where things live** — `backend/src/`

| Directory | Role | Count |
| --- | --- | --- |
| `routes/` | ROUTE_CONFIG | 9 |
| `services/` | SERVICE | 18 |
| `controllers/` | CONTROLLER | 2 |
| `middleware/` | MIDDLEWARE | 8 |
| `config/` | CONFIG | 8 |
| `models/` | data layer | see DATABASE_USAGE_MAP |

`backend/src/server.js` is the ENTRY file and mounts routers directly on `app`;
it declares real endpoints (`app.get('/health')`, `app.get('/api/health')`).

**Gates** — `npm run build:backend`, `npm run build:mcp`, backend tests,
`npm run check:secrets`, `npm run check:config`.

**Watch for** — an endpoint is only recorded when the receiver looks like a
router **and** the path is a string literal starting with `/`. A path computed at
runtime lands in `API_MAP.dynamicRoutePaths`. Outbound calls (`axios.post(...)`)
are in `API_MAP.outboundClientCalls`, separate from served endpoints.

---

## 4. Data layer work

**Queries first**

```bash
npm run agent:query -- database
npm run agent:query -- storage
```

**What actually exists** — 16 files reach Mongo, 4 collections (`users`,
`payments`, and 2 more), **0 mongoose models**. The backend uses the native
`mongodb` driver with collection literals, not an ORM.

Redis: 2 files (`mcp-server/src/middleware/rateLimiter.ts`,
`mcp-server/src/routes/mcp.ts`) via `@upstash/redis`.

**Gates** — `npm run build:backend`, `npm run check:config`.

**Watch for** — `DATABASE_USAGE_MAP` reports literal collection names. It does
not know a collection is written unless the code path is visible.

---

## 5. Authentication, users and access control

**Queries first**

```bash
npm run agent:query -- service accessService
npm run agent:query -- service userService
npm run agent:query -- feature auth
npm run agent:query -- endpoint POST /api/user/login
```

**Where it lives** — `backend/src/services/accessService.js` (194 lines, single
consumer `componentRoutes.js`), `userService.js`, and `frontend/src/context` +
`frontend/src/utils` for the client side. 3 files, 695 lines in feature `auth`.

**Gates** — `npm run check:secrets`, `npm run check:config`, backend tests,
`npm run build:backend`.

**Watch for** — this is the highest-risk area in the repo. See
`security/SECURITY_OVERVIEW.md` and `infrastructure/CONFIGURATION_OWNERSHIP.md`.
`frontend/src/utils` (23 files) is a utility grab-bag; confirm a symbol's real
home with `npm run agent:query -- symbol <name>` before editing.

---

## 6. Payments and monetisation

**Queries first**

```bash
npm run agent:query -- integration razorpay
npm run agent:query -- service accessService
npm run agent:query -- endpoint POST /api/payment/create-order
npm run agent:query -- feature payment-routes
```

**Where it lives** — `backend/src/routes/paymentRoutes.js` (feature
`payment-routes`), `backend/src/controllers/paymentController.js`,
`backend/src/controllers/webhookController.js`, `backend/src/middleware/validators.js`,
`frontend/src/utils/razorpayUtils.ts`, `frontend/src/utils/checkout.ts`,
`frontend/src/pages/PricingPage/PricingPage.tsx`.

Note there is no backend-side `razorpayUtils` module. The backend is plain JS and
keeps Razorpay logic in its controllers and in `backend/src/middleware/validators.js`.

Integration `razorpay` is proven by the `razorpay` package appearing as a real
import, and the env vars actually read.

**Gates** — `npm run check:secrets`, `npm run check:config`, backend tests.

**Watch for** — Razorpay key handling is an owner decision recorded in
`tasks/OWNER_DECISIONS.md`. Never introduce a key literal; `INTEGRATION_MAP.envVars`
lists what is read, and the secret scanner runs over generated output before
anything is written.

---

## 7. MCP server work

**Queries first**

```bash
npm run agent:query -- integration
npm run agent:query -- feature mcp
npm run agent:query -- role MCP_TOOL
```

39 files in feature `mcp`; 16 with role MCP_TOOL; **14 `createTool()`
registrations**.

**Where it lives** — `mcp-server/src/`, with `routes/`, `tools/`, and `middleware/`.

**Gates** — `npm run build:mcp`, CLI tests, `npm run check:secrets`.

**Watch for** — the MCP server does not use `server.tool(...)`. Each tool is built
by a `createTool(name, description, zodSchema, handler)` factory, which is what
the index probes for. Server config lives in `mcp-server/src/config`.

---

## 8. CLI work

**Queries first**

```bash
npm run agent:query -- feature cli
npm run agent:query -- role ENTRY
```

23 files in feature `cli`; `cli/src/commands/index.ts` is a command registry and
classifies as ENTRY, not as a barrel.

**Gates** — `npm run build:cli`, `npm run test:cli`.

**Watch for** — the CLI is ESM, so its relative imports end in `.js` while the
files are `.ts`. NodeNext resolution is what makes those edges resolve; a
hand-written import list will get them wrong.

---

## 9. Documentation and governance

**Queries first** — none needed; this category changes no source.

**Where** — everything under `.uihub-agent/`.

**Gates** — `npm run check:docs`, `npm run check:knowledge`, and
`npm run check:index` if you touched anything under `codebase/` or `generated/`.

**Watch for** — `codebase/*.json` and `generated/*.json` are **generated**. Never
hand-edit them; fix the generator and run `npm run agent:index`. The hand-written
docs beside them (`CODEBASE_INTELLIGENCE.md`, `INTELLIGENCE_QUERIES.md`, this
catalog) are maintained by hand and may legitimately lag the indexes.

---

## 10. Dead code and cleanup

**Queries first**

```bash
npm run agent:query -- orphans
npm run agent:query -- confidence
```

**Current state** — 5 orphaned components (largest:
`frontend/src/components/templates/TemplatePreview.tsx`, 868 lines), 14 isolated
files, 3 unresolved import edges (all `backend/src/server.js` → excluded
`mcp-server/dist/**`).

**Gates** — after deleting anything: `npm run build`, all test suites, and
`npm run agent:index` (the fingerprint changes when files disappear).

**Watch for** — an orphan is not automatically safe to delete. Check
`usedByPages` and `importsInternal` first; the index proves no *static* importer
exists, and it cannot see string-built imports or runtime lookups.

---

## 11. Environment, deployment and configuration

**Queries first**

```bash
npm run agent:query -- integration
npm run agent:query -- role CONFIG
```

`INTEGRATION_MAP.envVars` lists every `process.env.X` actually read, with the
files that read it. That is the honest answer to "what config does this need".

**Gates** — `npm run check:config`, `npm run check:secrets`.

**Watch for** — 4 configuration conflicts are open and owner-owned
(`infrastructure/DEPLOYMENT_CONFLICTS.md`). `npm run check` is expected to remain
red on `check:config` until those are resolved. Deployment changes are out of
scope and must not be made by an agent.

---

## 12. Testing

**Queries first** — none structural; use the area-specific queries above.

**Suites** — 231 tests across 4 suites: frontend, backend, MCP server, CLI.

| Suite | Command |
| --- | --- |
| frontend | `cd frontend && npm test` |
| backend | `cd backend && npm test` |
| mcp-server | `cd mcp-server && npm test` |
| cli | `npm run test:cli` |

**Gates** — all four must stay green. The frontend typecheck is
`cd frontend && npm run lint` (which runs `tsc --noEmit`); it is **expected to
stay red at 61 errors across 23 files**. That is the recorded baseline in
`runtime/TYPECHECK_BASELINE.md`, not a regression, and an agent should not
attempt to fix it. There is no root `typecheck` script.

---

## Universal gates

Run these for any task that changes source:

```bash
npm run check          # secrets, tracking, knowledge, generated, docs, config, index
npm run build
npm run test:cli
```

Expected results: `check:secrets`, `check:tracking`, `check:knowledge`,
`check:generated`, `check:docs`, `check:index` all pass; `check:config` reports
the 4 known owner conflicts and fails. Do not "fix" the config conflicts without
an owner decision.

If source files were added, removed, or moved:

```bash
npm run agent:index    # then commit the regenerated artifacts
```