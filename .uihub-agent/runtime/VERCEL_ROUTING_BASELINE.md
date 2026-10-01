# VERCEL ROUTING BASELINE

Captured **2026-10-01** during Phase 5 (Tasks 5.6, 5.7, 5.8). The exact rewrite
contract, a local reproduction of every path class, and the one question that
cannot be answered without a real deployment.

---

## 1. Deployment shape

From `vercel.json`:

| Key | Value |
|---|---|
| `framework` | `vite` |
| `outputDirectory` | `frontend/dist` |
| `buildCommand` | `npm install && cd mcp-server && npm install && npm run build && cd ../frontend && npm install && npm run build` |
| function entry | `api/index.js`, a two-line re-export of `backend/src/server.js` |
| function payload | `backend/**`, `mcp-server/dist/**`, `mcp-server/package.json` |
| `maxDuration` | 30s |
| `env` block | **absent** |

The frontend and the API are the same Vercel project. `api/index.js` imports the
Express app directly; Vercel runs it as a serverless function.

## 2. The rewrite contract

Rewrites are evaluated **in order, first match wins**.

| # | Source | Destination | Purpose |
|---|---|---|---|
| 1 | `/api/(.*)` | `/api/index.js` | all web API traffic |
| 2 | `/health` | `/api/index.js` | **added in Phase 5** |
| 3 | `/(.*)` | `/index.html` | SPA fallback |

Ordering is load-bearing and is asserted by
`frontend/src/routing/vercelRouting.test.ts`:

```
apiIndex >= 0  and  healthIndex > apiIndex  and  spaIndex > healthIndex
```

Rule 2 must sit between 1 and 3. Placed after 3, `/health` would return the
HTML shell again.

### 2.1 Why rule 2 was added

Before Phase 5, `/health` matched rule 3 and returned **HTTP 200 with the
6,474-byte HTML shell**. Production `/api/*` was returning 500. Any health check
that reads only the status code would have reported the deployment healthy.

Phase 4 measured this. The fix routes `/health` to the function so it returns
real JSON.

### 2.2 Why rule 2 is safe

The React router owns **no** root `/health` route. Verified route table:

```
/                      HomePage
/library               LibraryPage
/favorites             FavoritesPage
/dashboard/*           DashboardLayout
  /dashboard/mcp         MCPPage
  /admin/mcp            AdminGuard
    /admin/mcp/health     HealthPage     ← nested, not /health
/login /signup /forgot-password
/demo/*
```

`HealthPage` is nested under `/admin/mcp`, so `/admin/mcp/health` is a genuine
frontend route and is **unaffected** by rule 2, while `/health` becomes an API
path. There is no collision.

The frontend also owns **no** `/api/*` route, so rule 1 can never shadow a
React route.

---

## 3. Local reproduction (Task 5.8)

Run against the real Express app with a deliberately dead Mongo URI, so a routed
request fails *inside* the app and thereby proves the route was reached.

| Path | Rewrite matched | Status | Content-Type | Bytes | Verdict |
|---|---|---|---|---|---|
| `/api/health` | `/api/(.*)` | 503 | application/json | 300 | routed to function |
| `/health` | `/health` | 503 | application/json | 300 | **routed — was the HTML trap** |
| `/api/v1/components/db` | `/api/(.*)` | 500 | application/json | 46 | routed to function |
| `/api/v1/components` | `/api/(.*)` | 404 | text/html | 156 | routed, correctly absent |
| `/api/v1/components/list` | `/api/(.*)` | 404 | text/html | 161 | routed, correctly absent |
| `/mcp` | `/(.*)` | 200 | application/json | 484 | **SPA rule — not routed** |
| `/api/admin/mcp/health` | `/api/(.*)` | 401 | application/json | 55 | routed, auth enforced |
| `/` | `/(.*)` | 200 | text/html | 130 | SPA |
| `/library` | `/(.*)` | 404 | text/html | 146 | SPA |
| `/admin/mcp/health` | `/(.*)` | 404 | text/html | 155 | SPA (React route) |

**API paths leaking the HTML shell: 0.**

Reading the table:

- `/health` returning 503 JSON confirms rule 2 works. Before Phase 5 this row
  returned 200 HTML.
- `/api/v1/components` 404 is correct, not a defect. The router is mounted at
  both `/api` and `/` but exposes no `GET /` handler, so there is no collection
  index. Phase 4 established `GET /api/v1/components/db` as the real list
  endpoint.
- Those 404s are Express's own 156-byte HTML error page, not the SPA shell. The
  SPA shell is ~6,474 bytes, which is how the two are told apart.
- `/mcp` confirms MCP is **not** routed by Vercel. The backend's own `/mcp`
  answers `200 application/json` when reached directly, so the endpoint exists
  and is simply not routed. This falsifies `MCP.md` line 55.

## 4. The unresolved question

Rule 1 rewrites `/api/(.*)` to the **file path** `/api/index.js`. Whether Vercel
then invokes the function with the *original* path (`/api/v1/components/db`) or
the *rewritten* path (`/api/index.js`) is platform behaviour that cannot be
reproduced without the platform.

Two possibilities:

- **Original path preserved** (expected): Express routes normally. Correct.
- **Rewritten path passed**: every request arrives as `/api/index.js`. Since the
  router is mounted at both `/api` and `/`, `/api/index.js` would be looked up as
  a route and would not match, producing a 404 for all API traffic.

**Current production evidence favours "function not loading at all":** every
`/api/*` returns 500, including `/api/health`, and a 500 is emitted before any
route is evaluated. That is a different failure from a 404, so the rewrite path
fidelity is probably not the current cause — but it is unproven and must be
re-checked after the module-load failure is fixed.

**Do not "fix" rule 1 speculatively.** Removing the rewrite would change routing
in a way that cannot be validated locally, and the current 500 is upstream of it.
Confirm with the deploy log in
`runtime/PRODUCTION_DEPLOYMENT_GATE.md` step 6.

## 5. Non-routing responses

| Source | Header | Value |
|---|---|---|
| `/(.*)` | `Cross-Origin-Opener-Policy` | `same-origin-allow-popups` |
| icon assets | `Cache-Control` | `public, max-age=0, must-revalidate` |

Icon caching is `must-revalidate`, so favicons are revalidated on every load.
Unusual, but harmless.

## 6. Build determinism

Rebuilding the frontend from an empty `dist` reproduces byte-identical output:
234 chunks, entry `index-_W84bvgY.js` at 319,441 bytes, before and after a full
rebuild. `vite build` exits 0. It does **not** run `tsc`, so the Phase 5
typecheck regression (see `API_ARCHITECTURE.md` 5.5) does not block a deploy.

Note: `npm run clean` in `frontend/package.json` is `rm -rf dist`, which silently
no-ops on Windows. Not deployed, so harmless, but it means a local "clean" build
needs `Remove-Item -Recurse -Force dist`. Not changed — out of scope.

## 7. Regression tests

`frontend/src/routing/vercelRouting.test.ts` (7 tests) asserts, against the real
`vercel.json`:

1. every `/api/*` path routes to the function, never the SPA
2. `/health` routes to the function
3. the three-rule ordering holds
4. real frontend routes still reach `/index.html`
5. `outputDirectory` is `frontend/dist`
6. `includeFiles` carries all three payload members
7. no `env` block exists

Test 6 was tightened in Phase 5. Commit `9cd6ab2c` changed `includeFiles` from an
array to a brace-expansion string, at which point the original `toContain`
assertions silently degraded into substring matches. It now parses the string and
asserts membership, so dropping a member actually fails the test.