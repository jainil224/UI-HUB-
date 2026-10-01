# PRODUCTION DEPLOYMENT GATE

Captured **2026-10-01** during Phase 5 (Task 5.17). The checklist that must pass
before a production deploy is trusted, and the owner-only actions Phase 5 could
not perform.

**Nothing in this phase changed production.** No dashboard was accessed, no
service was redeployed, no environment variable was set or unset.

---

## 1. Current state: the gate is CLOSED

| Check | State | Evidence |
|---|---|---|
| Frontend serves | PASS | `https://ui-hub-design.vercel.app/` → 200 |
| Frontend bundle points at the API | **FAIL** | live bundle inlines `https://ui-hub.onrender.com` |
| API function loads | **FAIL** | `/api/health` → 500 before routing |
| MCP service reachable | **FAIL** | Render hosts refused at the Cloudflare edge |
| Database reachable | PASS | read-only Atlas session, 33 users, 183 MB cluster |
| Route separation correct in source | PASS | 27 frontend tests |
| Same-origin default proven in build | PASS | 0 Render hosts across 234 chunks |

The deployment is partially live: the static frontend serves, the API function
does not run, and the deployed frontend is aimed at a dead host. Every browser
API call therefore fails. Pushing to this branch does not change that.

## 2. Pre-deploy gate (already satisfied)

| # | Check | Result |
|---|---|---|
| 1 | `cd frontend && npm run lint` | **FAIL** — ~50 pre-existing errors, see 5.5 of `API_ARCHITECTURE.md`. Deferred by owner decision; does not block `vite build`. |
| 2 | `cd frontend && npm test` | PASS — 27/27 |
| 3 | `cd frontend && npm run build` | PASS — exit 0, deterministic |
| 4 | `cd backend && npm test` | PASS — 54/54 |
| 5 | `cd mcp-server && npm test` | PASS — 78/78 |
| 6 | `cd cli && npm test` | PASS — 30/30 |
| 7 | `cd mcp-server && npm run build` | PASS, `dist` byte-identical |
| 8 | `cd cli && npm run build` | PASS |
| 9 | Secret scan | PASS — no credential in any change |
| 10 | `.uihub-agent/` tracked | PASS — reverted the `1eaaec04` gitignore |

Checks 2-8 all passed at the time of writing and are reproducible from a clean
checkout.

## 3. Owner actions required (Phase 5 could not perform)

No `vercel`, `render` or `gh` CLI is available, and the repository is not linked
to a Vercel project (`.vercel/` absent). All of the following need dashboard
access.

### 3.1 Vercel — the blocking fix

1. Open the project settings → Environment Variables.
2. Find `VITE_API_URL`. **Its value is `https://ui-hub.onrender.com`.** This is
   the value baked into the live bundle.
3. **Delete it.** Do not repoint it at another host. Unset is the correct
   production state: same-origin requires no value.
4. Redeploy. The variable is inlined at build time, so **a rebuild is
   mandatory** — unsetting alone changes nothing already deployed.
5. Confirm afterwards that the new entry chunk no longer contains any
   `onrender.com` web-API host.

> If `VITE_API_URL` must be retained for a non-production environment, scope it
> to that environment only. A production-scoped variable is what broke this.

### 3.2 Vercel — diagnose the function 500

`/api/health` returns 500 at module load. Read the function's deployment/build
log. Most likely causes, in order:

1. `includeFiles` payload not included. Commit `9cd6ab2c` changed it from an
   array to the string `"{backend/**,mcp-server/dist/**,mcp-server/package.json}"`.
   Confirm the platform accepts the string form; if not, this is the cause.
2. `mcp-server/dist` missing from the function payload. `vercel.json` builds
   `mcp-server` before `frontend`, so the files should exist — verify.
3. A top-level throw in `backend/src/server.js` or its import graph — most
   likely an unguarded env access or an import that assumes a filesystem path
   absent from a read-only function bundle.

### 3.3 Render — MCP

Resolve the two-blueprint conflict first
(`APIs/MCP_DEPLOYMENT_CONTRACT.md` section 4), then follow that document's
8-step bring-up procedure.

### 3.4 Cloudflare

Unverified. Phase 4 observed Cloudflare returning 503/404 for the Render
hostnames. It is unknown whether Cloudflare fronts Render, whether it is
misconfigured, or whether the origin is simply suspended. No account access.

## 4. Post-deploy verification

Run in order. Each step must be satisfied by its own evidence; a later step is
never allowed to imply an earlier one.

| # | Check | Expected | Fails if |
|---|---|---|---|
| 1 | `GET /` | 200, HTML shell | anything else |
| 2 | Inspect the served entry chunk | **0** web-API Render hosts | any `onrender.com` API host remains |
| 3 | `GET /health` | **200 JSON** | 200 HTML (the old trap) or any 500 |
| 4 | `GET /api/health` | 200 JSON | 500 |
| 5 | `GET /api/v1/components/db` | 200 JSON, non-empty list | 404 or 500 |
| 6 | Read the function build log | no module-load error | any top-level throw |
| 7 | `GET /api/v1/components` | 404 JSON | 200 HTML — means it fell through to the SPA |
| 8 | Browser: open `/library` | loads, network tab shows same-origin `/api/*` | any cross-origin API request |
| 9 | Browser: log in | succeeds | `Connection Failure` in console |
| 10 | Browser: `GET /api/admin/mcp/health` | 401 unauthenticated | 200 |
| 11 | `GET https://ui-hub-mcp.onrender.com/health` | 200 JSON | Cloudflare 503/404 |
| 12 | `GET https://ui-hub-mcp.onrender.com/mcp` | JSON or SSE, advertising the right host | HTML shell, or a wrong advertised host |
| 13 | Real `initialize` + `tools/list` | protocol response | any HTML |

Checks 8, 9 and 13 require real credentials and are **BLOCKED** until the owner
supplies them. Checks 1-7 and 10-12 are unauthenticated.

### 4.1 Browser API destination

The definitive check is the network tab: every API call must be
`https://ui-hub-design.vercel.app/api/*` — same origin as the page. If any
request goes to an `onrender.com` host, `VITE_API_URL` is still set. Phase 4
established this is the defect being fixed; console output also states the
resolved base URL, because `getApiBaseUrl()` logs it.

## 5. Stop conditions

Deployment verification stops and reports rather than continues if:

- any step requires a credential not supplied by the owner
- a check would need a **write** against production — no deploy, env change,
  migration, data mutation, broadcast, email, push or payment is in scope
- the served bundle still contains a web-API Render host after a rebuild
- the function log shows a failure whose cause is not determinable from source
- resolving it would require changing the MCP blueprint topology, which is an
  owner decision

In every case the outcome is recorded as `BLOCKED` or `OWNER ACTION REQUIRED`
with the exact step number and the evidence gathered. It is never recorded as
passed.

## 6. Rollback

The Phase 5 change set is additive and low-risk:

- `apiConfig.ts` — new resolution logic, same production default
- `checkout.ts`, `PricingPage.tsx` — replaced `import.meta.env.VITE_API_URL ||
  getApiBaseUrl()` with `getApiBaseUrl()`, which is equivalent but validated
- `vercel.json` — one added rewrite, in front of the SPA fallback
- three new frontend files, plus a dev dependency and a `test` script

Reverting the `/health` rewrite restores the old behaviour where `/health`
returns the HTML shell. That is the pre-existing state and is not a regression
in any deployed system that already worked.

The single highest-impact action is 3.1 step 3: deleting `VITE_API_URL`. It is
worth doing even before any code change reaches production.