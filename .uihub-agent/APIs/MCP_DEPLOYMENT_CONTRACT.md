# MCP DEPLOYMENT CONTRACT

Captured **2026-10-01** during Phase 5 (Task 5.9, 5.10). This document defines
what the MCP service is, where it must run, which blueprint owns it, and the
exact procedure to bring it up and verify it.

---

## 1. What the MCP service is

A standalone Node/TypeScript HTTP service (`mcp-server/`) that exposes the
UI-HUB component library to external AI agents over the Model Context Protocol.
It is **not** a route on the web API. It has its own process, its own
authentication model and its own host.

- Protocol transport: HTTP with SSE at `/mcp`
- Auth: `Authorization: Bearer uh_live_...` API keys minted in the dashboard
- Session state: in-memory, keyed by `sessionId`
- Data source: the same MongoDB Atlas cluster as the web API
- Component/template payloads: generated JSON in `mcp-server/src/data`, copied
  into `mcp-server/dist/data` at build time

## 2. Canonical endpoint

```
https://ui-hub-mcp.onrender.com/mcp
```

This is the value hardcoded as `PROD_FALLBACK` in
`frontend/src/utils/mcpConfig.ts` and as `MCP_SERVER_URL` in both Render
blueprints. It is overridable in the frontend by `VITE_MCP_API_URL`.

Supporting endpoints on the same host:

| Path | Purpose |
|---|---|
| `GET /mcp` | SSE transport, or JSON discovery |
| `DELETE /mcp` | session termination |
| `GET /mcp/health` | MCP-scoped health |
| `GET /health` | service health (Render `healthCheckPath`) |
| `GET /api/dashboard/mcp/*` | authenticated user dashboard (keys, usage, status) |
| `GET /api/admin/mcp/*` | admin-only (`requireAdmin`) |

`GET /` returns a JSON index listing these paths.

## 3. Owner decision

**MCP runs on Render, not Vercel.** This is now explicit and enforced by
documentation, replacing the ambiguous state found in Phase 4.

Reasons:

1. `docs/runbook.md` places the MCP service on Render.
2. `mcp-server/render.yaml` is the blueprint that starts the MCP process.
3. MCP maintains stateful SSE sessions and its own rate limits; sharing the web
   API's serverless function would couple their lifecycles.
4. The frontend already resolves MCP to a separate host
   (`mcpConfig.ts`), so there is no same-origin requirement to collapse.

**Explicitly rejected:** serving MCP through Vercel. `MCP.md` line 55 claims
`https://ui-hub-design.vercel.app/mcp` works. It does not. `vercel.json` routes
only `/api/*` and `/health` to the function, so `/mcp` matches the SPA
catch-all and returns the HTML shell. That documentation claim is recorded as
incorrect in `CONFLICTS.md`; no `/mcp` rewrite was added.

## 4. The blueprint conflict — unresolved, owner decision required

Two blueprints both define a Render service that mounts MCP. Both are valid
files; only one can be the source of truth.

### `mcp-server/render.yaml` — the MCP-specific blueprint

| Field | Value |
|---|---|
| Service name | `ui-hub-mcp` |
| `rootDir` | `mcp-server` |
| build | `npm install && npm run build` |
| start | `node dist/index.js` |
| health check | `/health` |
| `MCP_PORT` | `3001` |

This starts the MCP service directly. **This is the intended production MCP
owner.**

### `render.yaml` (repo root) — the unified blueprint

| Field | Value |
|---|---|
| Service name | `ui-hub-backend-mcp` |
| build | builds `mcp-server`, then installs `backend` |
| start | `cd backend && npm start` |
| health check | `/health` |
| `MCP_SERVER_URL` | `https://ui-hub-mcp.onrender.com` |

This starts the **web API**, which happens to mount MCP in-process
(`backend/src/server.js` mounts `/mcp`, `/api/dashboard/mcp`, `/api/admin/mcp`).
So the unified service is a valid *alternative* topology: one process serving
both the web API and MCP.

### The conflict

Both blueprints set `MCP_SERVER_URL=https://ui-hub-mcp.onrender.com`, so if the
unified service were deployed as `ui-hub-backend-mcp`, it would advertise an
endpoint pointing at a *different* service. Meanwhile the frontend targets
`ui-hub-mcp`, and the backend's CORS allowlist is inert (see
`API_ARCHITECTURE.md` section 5.1).

Also note: both blueprints declare the same `MCP_ADMIN_EMAILS` intent but with
different lists (the root blueprint has three addresses, the MCP blueprint two).
Divergent admin configuration is a privilege concern and must be reconciled
before either is deployed.

### Required owner decision

Choose exactly one topology and delete or archive the other:

- **Option A — split (recommended).** `mcp-server/render.yaml` owns MCP;
  `render.yaml` owns the web API. Consistent with section 3.
- **Option B — unified.** `render.yaml` owns both in one process; delete
  `mcp-server/render.yaml` and change the frontend's `PROD_FALLBACK` to the
  unified host.

Phase 5 made no change to either file. Deleting a deployment blueprint is a
production-affecting decision.

## 5. Environment contract

Required for the MCP service (full table in
`infrastructure/ENVIRONMENT_CONTRACT.md`):

| Variable | Requirement | Notes |
|---|---|---|
| `MONGODB_URI` | required, secret | keys and usage live here |
| `MONGODB_DB` | `uihub` | |
| `MCP_SERVER_URL` | required | the advertised public endpoint; a wrong value produces a wrong discovery payload |
| `MCP_API_KEY_PREFIX` | `uh_live_` | must match what the dashboard mints |
| `MCP_RATE_LIMIT_FREE` / `_PRO` | set | `150` / `10000` |
| `MCP_ALLOWED_ORIGINS` | set | currently inert; see `API_ARCHITECTURE.md` 5.1 |
| `MCP_ADMIN_EMAILS` | set | reconcile the two lists before deploy |
| `FIREBASE_*` | required, secret | token verification |
| `REDIS_URL` | optional | in-memory rate limiting when absent |

`MCP_PORT=3001` is set by the blueprint but the process must not depend on it
being externally reachable; Render injects `PORT`.

## 6. Generated artifacts

`mcp-server/dist/data` must be byte-identical to `mcp-server/src/data`. Phase 5
verified all seven generated JSON files by SHA-256 and found **0 differences**,
**0** source modules missing from `dist`, and **0** orphaned `dist/*.js`
artifacts. A rebuild leaves `dist` byte-identical, so drift is detectable in CI
via `git status --porcelain mcp-server/dist`.

`types/sourceCodeData.d.ts` is a declaration file and correctly has no compiled
counterpart.

## 7. Bring-up and verification procedure

Currently the Render hosts are unreachable at the Cloudflare edge (Phase 4
baseline: 503/404). These steps require owner dashboard access and are blocked
until then.

1. **Owner: resolve the blueprint conflict** (section 4). Deploy exactly one.
2. **Owner: confirm `MCP_SERVER_URL`** equals the deployed service's public host.
3. **Verify the service is up:**
   ```
   GET https://ui-hub-mcp.onrender.com/health
   → 200 application/json
   ```
   A 503/404 from the Cloudflare edge means the service is not deployed or is
   suspended, not that the endpoint is wrong.
4. **Verify discovery:**
   ```
   GET https://ui-hub-mcp.onrender.com/mcp
   → JSON (or an SSE `endpoint` event)
   → must advertise endpoint https://ui-hub-mcp.onrender.com/mcp
   ```
   If the advertised host is wrong, `mcp.ts:335` read `MCP_SERVER_URL` as unset.
5. **Verify auth rejects an anonymous call:**
   ```
   GET https://ui-hub-mcp.onrender.com/api/dashboard/mcp/keys   (no Authorization)
   → 401
   ```
6. **Verify a real key works** (owner supplies a test key; never record it):
   ```
   GET .../api/dashboard/mcp/status
   Authorization: Bearer <test key>
   → 200 with usage data
   ```
7. **Verify the protocol** with a real `initialize` + `tools/list` exchange over
   `/mcp`.
8. **Verify the frontend** resolves `MCP_BASE_URL` to the deployed host and that
   the dashboard's Tools tab connects.

No step in this procedure may be marked passed on the basis of a `200` from the
frontend HTML shell. Phase 4 proved a `200` on `/mcp` from the Vercel host is
the SPA, not MCP.

## 8. Known MCP defects carried forward

| Issue | Location | Severity | Status |
|---|---|---|---|
| Advertised endpoint bypasses validated config | `src/routes/mcp.ts:335` | low | recorded, unfixed |
| `MCP_ALLOWED_ORIGINS` has no effect | `backend/src/server.js:84` | medium | recorded, unfixed |
| Duplicate admin email lists across blueprints | both `render.yaml` files | medium | owner decision |
| Stale endpoint keys, 10 unconfigured tools | `mcp_config.tools` in Atlas | medium | recorded, unfixed (Phase 3) |