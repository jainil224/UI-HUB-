# API ARCHITECTURE - Production Connectivity Contract

Captured **2026-10-01** during Phase 5 (Task 5.26). This document is the single
authority on which host owns which API surface, how a request travels from the
browser to the database, and which parts of the production estate are verified
versus assumed.

It supersedes the routing sections of `runtime/PRODUCTION_BASELINE.md`,
`infrastructure/DEPLOYMENT_MAP.md` and `infrastructure/INFRASTRUCTURE.md`, all
of which predate the deterministic same-origin contract established in Phase 5.

---

## 1. The canonical architecture

```
                    ┌──────────────────────────────────────────┐
 Browser  ────────► │  Vercel  ui-hub-design.vercel.app         │
                    │                                          │
                    │   /            → frontend/dist (static)  │
                    │   /api/*       → /api/index.js function  │
                    │   /health      → /api/index.js function  │
                    │            │                              │
                    │            │ same Express app             │
                    │            ▼                              │
                    │   backend/src/server.js                   │
                    └────────────┬─────────────────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────────────────┐
                    │  MongoDB Atlas  cluster  uihub           │
                    │  (same-cluster cluster fingerprint:      │
                    │   sample_mflix + uihub)                   │
                    └──────────────────────────────────────────┘

 Browser  ────────► ┌──────────────────────────────────────────┐
  (MCP only)       │  Render  ui-hub-mcp.onrender.com          │
                    │   /mcp                 → mcpRouter       │
                    │   /api/dashboard/mcp   → dashboardRouter  │
                    │   /api/admin/mcp       → adminRouter      │
                    │   /health              → health           │
                    └────────────┬─────────────────────────────┘
                                 ▼
                          same Atlas cluster
```

**Ownership, decided and verified in Phase 5:**

| Surface | Owner | Origin | Status |
|---|---|---|---|
| Frontend (React SPA) | Vercel | `ui-hub-design.vercel.app` | **LIVE, 200** |
| Web API (`/api/*`) | Vercel function, same origin | `ui-hub-design.vercel.app` | **BROKEN, 500 pre-route** |
| Health (`/health`) | Vercel function, same origin | `ui-hub-design.vercel.app` | **BROKEN, 500 pre-route** |
| MCP protocol (`/mcp`) | Render | `ui-hub-mcp.onrender.com` | **UNREACHABLE, Cloudflare edge** |
| Database | MongoDB Atlas | cluster `uihub` | **LIVE, read-only verified** |
| CDN in front of Render | Cloudflare | — | **NOT VERIFIED, no account access** |

The web API and the MCP service are deliberately **separate owners**. The
frontend calls the web API same-origin, so the browser makes zero cross-origin
requests to the API. MCP is reached at a different host with a different
protocol and a different auth model (bearer API keys).

---

## 2. Why the web API must be same-origin

`frontend/src/utils/apiConfig.ts` resolves the API base URL in this order:

| Environment | Resolution | Result |
|---|---|---|
| Production, `VITE_API_URL` set | validated configured URL | that host |
| Production, nothing set | `window.location.origin` | **same origin** |
| Production, malformed value | warn, fall back | same origin |
| Development, local network IP | `protocol//host:5000` | local backend |
| Development, other | `http://localhost:5000` | local backend |

Same-origin is the default because the Vercel deployment serves the frontend and
`/api` from one host. That makes the deployment self-contained: no dashboard
configuration is required for it to function, and there is no cross-origin
request to fail.

`VITE_API_URL` is therefore **optional**. It exists only for the case where the
API genuinely lives elsewhere.

---

## 3. Correction: the Render host in the production bundle

Phase 4 recorded that the live frontend bundle contained
`https://ui-hub.onrender.com` and reported that the frontend therefore targeted
Render. **That attribution was wrong**, and this section replaces it.

The live entry chunk was inspected directly. The minified resolver reads:

```js
Wa=()=>{const o="https://ui-hub.onrender.com";
        return console.log(`[API Config] Using configured Production API: ${o}`),o}
```

The value is **inlined at build time**. Evidence that it is a dashboard value
and not source code:

1. `vercel.json` declares **no `env` block**, so the repository cannot supply it.
   This is asserted by a test: `frontend/src/routing/vercelRouting.test.ts`
   ("declares no env block").
2. A build of the current tree contains **zero** occurrences of any web-API
   Render host across all 234 emitted chunks.
3. The minifier constant-folds the resolver in that build down to
   `return window.location.origin`, because Vite replaced `import.meta.env.PROD`
   with `true` and both `VITE_*` reads with `undefined`, making every
   configured-host branch statically unreachable. The shipped resolver
   **provably cannot** reference an external host.

So the source is correct; a stale `VITE_API_URL` in the Vercel dashboard is what
bakes the Render host in. The fix is to unset that variable and rebuild
(Task 5.18, owner-only).

---

## 4. Request flows

### 4.1 Web API (intended)

```
GET https://ui-hub-design.vercel.app/api/v1/components/db
 → rewrite /api/(.*) → /api/index.js
 → backend Express app
 → GET /api/v1/components/db  (router mounted at both /api and /)
 → MongoDB Atlas
 → JSON
```

### 4.2 What production actually does today

```
GET https://ui-hub-design.vercel.app/api/v1/components/db
 → 500 before any route executes
```

The 500 occurs at module load, not at routing, so no request path is ever
evaluated. `/api/health` behaves identically. Root cause is not established
(this phase had no Vercel dashboard or build-log access). See
`runtime/PRODUCTION_DEPLOYMENT_GATE.md`.

### 4.3 The `/health` trap (fixed)

`vercel.json` previously sent only `/api/*` to the function, so `/health` fell
through to the SPA catch-all and returned **HTTP 200 with the 6,474-byte HTML
shell**. A health check reading only the status code would conclude the service
was healthy while every API call was broken.

Phase 5 adds an explicit `/health → /api/index.js` rewrite ahead of the SPA
fallback. This is safe: the frontend owns **no** root `/health` route. The
library health page is the nested route `/admin/mcp/health`.

---

## 5. Findings carried forward

### 5.1 CORS is effectively unrestricted — OPEN, not fixed

`backend/src/server.js` lines 82-85:

```js
if (!isAllowed) {
  console.warn(...);
}
callback(null, true);   // ← returns true even in the "blocked" branch
```

Every origin is permitted. The `allowedOrigins` array, the `.vercel.app`
wildcard and the `localhost` check are all inert, because the rejection branch
never rejects. This is a security defect, not a connectivity defect.

**Deliberately not fixed in Phase 5.** Enforcing the allowlist would require
enumerating every legitimate caller (the Vercel production domain, preview
domains, the MCP dashboard, and the CLI), which cannot be done from source
alone. Same-origin routing reduces the web API's exposure, but the backend
still serves cross-origin and MCP still needs `MCP_ALLOWED_ORIGINS` to be
meaningful. Owner decision required.

### 5.2 Two Render blueprints both claim MCP

| File | Service name | Start command | Implied host |
|---|---|---|---|
| `render.yaml` | `ui-hub-backend-mcp` | `cd backend && npm start` | `ui-hub-backend-mcp.onrender.com` |
| `mcp-server/render.yaml` | `ui-hub-mcp` | `node dist/index.js` | `ui-hub-mcp.onrender.com` |

Both set `MCP_SERVER_URL=https://ui-hub-mcp.onrender.com`. Both set
`healthCheckPath: /health`. See `APIs/MCP_DEPLOYMENT_CONTRACT.md`.

### 5.3 MCP is not reachable through the Vercel deployment

The backend mounts MCP at top-level `/mcp`, but `vercel.json` routes only
`/api/*` and `/health` to the function. `/mcp` therefore matches the SPA
catch-all and returns the HTML shell.

`MCP.md` line 55 claims the unified deployment serves MCP at
`https://ui-hub-design.vercel.app/mcp`. **That claim is false** for the current
routing configuration. This was verified locally: `/mcp` matches `/(.*)`, and
the backend's own `/mcp` endpoint answers `200 application/json` when reached
directly, proving the endpoint exists and is simply not routed by Vercel.

No `/mcp` rewrite was added. Serving MCP from Vercel would contradict the
single-owner decision in section 1 and would require the function to stay warm
for a stateful SSE transport. The documentation claim is the thing that is
wrong.

### 5.4 MCP reads `process.env` directly

`mcp-server/src/routes/mcp.ts:335` builds the advertised endpoint as
`` `${process.env.MCP_SERVER_URL || ''}/mcp` `` instead of using the validated
config in `mcp-server/src/config/env.ts`. If the variable is unset in a given
runtime the discovery response advertises `/mcp` with no host. Low severity,
recorded, not changed.

### 5.5 Frontend typecheck is broken on `main` — DEFERRED

`npm run lint` (`tsc --noEmit`) reports roughly 50 errors across 23 files,
introduced by UI commits `6c203adc` and `254ce55d`, not by Phase 5. The pattern
is React 19 typing: `key` passed to components whose props do not declare it,
and class components typed without `state`, `props` or `setState`.

`tsconfig.json` was not modified and typecheck passed at `3fc33f91`.
`vite build` does not typecheck, so **Vercel deployments are unaffected**. Only
the lint gate and the "Frontend typecheck and build" CI job would fail.
Deferred by owner decision.

---

## 6. What must not regress

- The production bundle must contain **zero** web-API Render hosts.
- `/api/*` and `/health` must route to the function, never to the HTML shell.
- The frontend must own no root `/health` route, so the `/health` rewrite can
  never shadow a React route.
- MCP and the web API stay on separate owners.
- `.uihub-agent/` stays tracked. It was briefly gitignored by `1eaaec04`; Phase 5
  reverted that because the knowledge base must live with the code.

## 7. Regression tests that enforce this

| Test | File | Enforces |
|---|---|---|
| CASE 1-5 | `frontend/src/utils/apiConfig.test.ts` | the whole resolution matrix of section 2 |
| rewrite ordering | `frontend/src/routing/vercelRouting.test.ts` | section 4.3 and 6 |
| function payload | `frontend/src/routing/vercelRouting.test.ts` | `includeFiles` members, `outputDirectory` |
| no env block | `frontend/src/routing/vercelRouting.test.ts` | section 3 premise |

Run with `cd frontend && npm test` (27 tests).