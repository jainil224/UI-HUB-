# RUNTIME VERIFICATION - Phase 2

**Phase 2 verifies reality. Phase 2 changed no application behaviour.**

| Field | Value |
|---|---|
| Verified on | 2026-09-30 (UTC timestamps captured per probe) |
| Repository | `C:\Users\Admin\Documents\GitHub\UI-HUB-` |
| Commit under test | `41938a67` |
| Working tree | `M agent.md` (owner-edited), `?? .uihub-agent/` - no source modified |
| Tooling | Node `v24.21.0`, npm `11.19.0`, mongosh present, `curl.exe` |
| Method | Read-only HTTP probes, read-only MongoDB queries, `--noEmit` typechecks, existing test suites |

**Confidence legend:** HIGH = directly observed / repeatable · MEDIUM = observed with one inferential step · LOW = plausible, not proven.

---

## 0. Headline

**No reachable backend is serving traffic. The deployed frontend is up and points every API call at a host that returns 503.**

| Target | Status | Verdict |
|---|---|---|
| Vercel frontend `/` | 200 | UP |
| Vercel `/api/*` (all paths, all methods) | 500 `FUNCTION_INVOCATION_FAILED` | **DEAD** |
| `ui-hub.onrender.com` (API base baked into the live bundle) | 503 | **DOWN** |
| `ui-hub-mcp.onrender.com` (`MCP_SERVER_URL` value) | 503 | **SUSPENDED** |
| `ui-hub-backend-mcp.onrender.com` (name in `render.yaml`) | 404 | **NOT DEPLOYED** |

There is currently **no working health signal anywhere in production** - see §3 for why `/health` could not have told us this.

---

## 1. Vercel (Task 2)

Base: `https://ui-hub-design.vercel.app`

| Probe | Status | Content-Type | Body classification |
|---|---|---|---|
| `GET /` | **200** | `text/html` | SPA shell - **frontend UP** |
| `GET /health` | 200 | `text/html` | SPA fallback, **not** the backend |
| `GET /api/health` | **500** | `text/plain` | `FUNCTION_INVOCATION_FAILED` |
| `GET /api/v1/config/firebase` | **500** | `text/plain` | `FUNCTION_INVOCATION_FAILED` |
| `GET /api/v1/auth/me` (no token) | **500** | `text/plain` | `FUNCTION_INVOCATION_FAILED` |
| `POST /api/mcp` `initialize` | **500** | `application/json` | `FUNCTION_INVOCATION_FAILED` |
| `POST /api/mcp` `tools/list` | **500** | `application/json` | `FUNCTION_INVOCATION_FAILED` |
| `POST /mcp` `tools/list` | 405 | - | not rewritten; Vercel rejects the method |

Sample body (Vercel internal id varies per invocation):
```
A server error has occurred FUNCTION_INVOCATION_FAILED bom1::kztdv-1790753014907-80687c12bc1b
```

### 1.1 The failure is at module-load time, not request time - HIGH

`GET /api/v1/auth/me` was sent with **no `Authorization` header**. A correctly loaded function would answer **401**. It answered **500**, identically to every other route.

Because the failure is identical for an unauthenticated request, a public health route, and a JSON-RPC POST, it occurs **before any middleware, route handler, or auth check executes**. The function cannot load its module graph. (One inferential step, but a tight one: any request-time fault would have to fail identically across three unrelated paths *and* precede auth. Confidence HIGH.)

### 1.2 Correlated cause: root `package.json` cannot satisfy `backend/src/server.js` - MEDIUM

`vercel.json` builds with `npm install && cd frontend && npm install && npm run build`, and `includeFiles` is `backend/**`. The Vercel build therefore installs the **root** `package.json` plus `frontend/package.json`. Root dependencies are missing four packages that `backend/package.json` declares and the backend imports:

```
backend deps absent from root package.json: axios, mongodb, web-push, zod
```

`mongodb` is load-bearing - `mongoService` is imported by the server graph. A missing module at import time produces exactly this signature. This is **corroboration, not proof**: no Vercel build/deploy log was accessible, so the precise failing specifier is unconfirmed. Confidence MEDIUM.

Also note `includeFiles: "backend/**"` excludes `mcp-server/**` from the function bundle, so the committed `mcp-server/dist` is not even shipped to Vercel.

---

## 2. Render (Task 3)

All probes: `GET /health`, `GET /api/health`, `GET /`, `POST /mcp tools/list`.

| Host | `/health` | `/api/health` | `/` | `POST /mcp` | Body signature |
|---|---|---|---|---|---|
| `ui-hub.onrender.com` | 503 | 503 | 503 | 429 | Cloudflare managed-challenge interstitial |
| `ui-hub-mcp.onrender.com` | 503 | 503 | 503 | 429 | Cloudflare managed-challenge interstitial |
| `ui-hub-backend-mcp.onrender.com` | 404 | 404 | 404 | 404 | `Not Found` (`text/plain`) |

### 2.1 `ui-hub.onrender.com` is the real API base - HIGH

The deployed frontend bundle was fetched and scanned for host literals. The only backend host baked in is:

```
https://ui-hub.onrender.com
```

It matches **neither** value in `render.yaml`. Confirmed by HTTP 200, size 322,739 bytes on `/assets/index-DYhd2CmH.js`. This is a **production-drift finding**: the live frontend was built with a `VITE_API_URL` that no longer corresponds to any service in the blueprint.

Other host literals in the bundle are benign (`github.com`, `gsap.com`, `react.dev`, `linkedin.com`, `instagram.com`).

### 2.2 Cloudflare now fronts the API host - MEDIUM

`ui-hub.onrender.com` returns a **Cloudflare "Just a moment..." managed challenge** (`cType: 'managed'`, zone `ui-hub.onrender.com`) for HTML routes, and **429** for `POST /mcp`. A browser User-Agent and a 6-second spacing were tried; results did not change (503 / 429). No Cloudflare configuration exists anywhere in the repository, so this layer was configured outside version control.

This has two consequences:
- Non-browser clients (curl, server-to-server, some SDK transports) cannot reach the API at all.
- Real users are not proven to be blocked - a browser can solve the challenge. **Whether end users are affected is UNKNOWN and requires owner input** (see `UNKNOWN_REGISTER.md` U-01).

### 2.3 `MCP_SERVER_URL` points at a service the blueprint never creates - HIGH

`render.yaml:18-19` hardcodes:
```yaml
- key: MCP_SERVER_URL
  value: https://ui-hub-mcp.onrender.com
```
while `render.yaml:4` declares the service as `ui-hub-backend-mcp`, whose Render URL would be `https://ui-hub-backend-mcp.onrender.com`.

Three-way mismatch, all observed:
- `MCP_SERVER_URL` value -> 503 (suspended)
- blueprint service name's URL -> 404 (not deployed)
- the URL the shipped frontend actually calls -> 503 behind Cloudflare

No single URL in this repository corresponds to a live, reachable backend. This resolves Phase 1 finding `#20` with evidence and escalates its severity.

### 2.4 Related configuration drift - MEDIUM

`MCP_ALLOWED_ORIGINS` (`render.yaml:27`) lists `https://ui-hub-design.vercel.app`, `http://localhost:5173`, `http://localhost:3000` - but **not** `https://ui-hub.onrender.com`, the origin the shipped frontend actually loads from. If MCP CORS were re-enabled without updating this list, browser-originated MCP calls would be rejected.

---

## 3. Health and observability (Task 4)

`backend/src/server.js:141-152`:
```js
const healthCheck = (req, res) => {
  res.json({
    status: 'ok',
    services: { backend: 'online', mcp: 'online' },
    ...
  });
};
```

Every field is a **hardcoded literal**. There is no database ping, no Redis ping, no MCP-instance assertion, and no dependency of any kind.

Reinforcing this, `server.js:136-137`:
```js
} catch (mcpErr) {
  console.warn('[MCP] ⚠️ MCP routes could not be mounted:', mcpErr.message);
}
```

MCP mount failure is **caught and downgraded to a warning**. The process continues starting, `/health` keeps answering `mcp: 'online'`, and the only trace is a log line. **The health endpoint can report a fully healthy system while the entire MCP surface is absent.** - HIGH

### 3.1 Consequence for Phase 2 verification - HIGH

`/health` was useless as an evidence source. It returns a constant, so:
- a 200 would **not** have proven the database, Redis, or MCP were alive;
- the 503s and 404s observed on Render are produced by the **edge**, not by this handler, so they say nothing about whether the Node process was healthy.

This is why every conclusion in §1-§2 rests on status codes, error bodies, and repo configuration rather than on any health payload. Phase 1 finding `#3` ("health check is hardcoded") is **confirmed and is more consequential than Phase 1 recorded** - it is not a cosmetic issue, it is the reason this project cannot self-diagnose in production.

---

## 4. Generated artifacts (Task 5)

`mcp-server/dist` is **committed to git** and **not** ignored:
```
dist NOT ignored -> committed build output
dist tracked files: 81
```

`backend/src/server.js` imports the MCP surface from `dist`, not `src`, so the committed artifact is what any non-building deploy would execute.

### 4.1 Code in `dist` is in sync with `src` - HIGH

`dist/tools/index.js` lists all **14** tools, matching `src/tools/index.ts` exactly, including the newest: `list_all_components`, `search_by_behavior`, `get_ai_prompts`, `get_template_source`. All three routers the server imports exist: `dist/routes/mcp.js`, `dist/routes/dashboard.js`, `dist/routes/admin.js`. (`mcp-server/scripts/check-source-coverage.mjs` in the build command enforces this.)

So the mtime gap is **not** code staleness. Phase 1's staleness concern is **narrowed, not dismissed** - see 4.2.

### 4.2 Data payload in `dist` IS stale - HIGH

| File | `src/data` | `dist/data` | Delta |
|---|---|---|---|
| `templates.json` | 872 KB | 807 KB | **-65 KB** |
| `templateSourceCode.json` | 368 KB | 311 KB | **-57 KB** |
| `sourceCode.json` | 1958 KB | 1937 KB | **-21 KB** |
| `componentMetadata.json` | 174 KB | 169 KB | **-5 KB** |
| `aiPrompts.json` | 117 KB | 117 KB | equal |
| `componentVibePrompts.json` | 148 KB | 148 KB | equal |

The committed `dist` ships an **older component and template catalogue** than the source tree. The only `src` file newer than every `dist` file is `src/data/components.ts` (09-29 18:12) against `dist/data/components.js` (09-28 10:45).

**Blast radius depends on deploy path:**
- Render's documented `buildCommand` (`render.yaml:8`) runs `npm run build` in `mcp-server`, which regenerates `dist` from `src` - so a correctly deployed Render service is **not** affected.
- Any deploy that ships the committed tree without building (Vercel does not build `mcp-server` at all) would serve the **stale catalogue**.

`npm run build` was deliberately **not** executed, per the agreed typecheck-only constraint, so the size deltas above are the freshness evidence rather than a rebuild diff.

---

## 5. Data layer (Tasks 6-9)

Read-only, tightly scoped: `countDocuments`, `aggregate`, `findOne` with projections. No writes, no index creation, no setup scripts. Connection string loaded into a shell variable and never printed; all output passed through a redaction filter.

### 5.1 Database shape - HIGH

| Database | Collections |
|---|---|
| `uihub` | 12 |
| `sample_mflix` | unrelated - see 5.7 |

`uihub` contains exactly the **12** collections Phase 1 inferred from code. Phase 1's data model is **confirmed correct** against live data.

| Collection | Documents | Note |
|---|---|---|
| `activity_logs` | 5,505 | real usage |
| `mcp_analytics` | 687 | real usage |
| `components` | 226 | |
| `email_logs` | 100 | mail is being sent |
| `mcp_api_keys` | 7 | **7 live MCP keys** |
| `users` | 33 | |
| `payments` | 1 | |
| `mcp_audit` | 1 | |
| `mcp_config` | 1 | singleton |
| `collections` | **0** | empty |
| `favorites` | **0** | empty |
| `payment_webhooks` | **0** | empty - see 5.7 |

### 5.2 User identity: `_id` is the email, universally - HIGH (resolves `#12`)

| Metric | Count |
|---|---|
| Total users | 33 |
| `_id` containing `@` (i.e. email-keyed) | **33** |
| `_id` not containing `@` (uid-keyed) | **0** |
| Has `email` field | 33 |
| Has `uid` field | 30 |
| Has `userId` field | 0 |

**There are no uid-keyed user documents.** The email-as-`_id` design is applied without exception in live data. The dual-lookup code in the backend is therefore defensive but unnecessary for the current dataset.

The 3 users lacking `uid` are all `isAdmin: true`, all created within **0.3 seconds** of each other (2026-08-29T05:42:11.983Z / .102Z / .254Z), and their emails match the three addresses hardcoded in `render.yaml:29` `MCP_ADMIN_EMAILS`. These are **seeded admin accounts, not registrations**. So every genuine user has both `uid` and an email `_id`.

Verdict: risk is currently **latent, not active**. It becomes live the moment a lookup path keys on `uid` for a seeded admin.

### 5.3 Entitlement expiry: `proExpiry` is the only populated field - HIGH (resolves `#14`)

| Field | Documents carrying it |
|---|---|
| `planTier` | **33** (all) |
| `proExpiry` | **3** |
| `planExpiry` | **0** |
| `planDuration` | **0** |
| `planType` | **0** |
| `planTier` vs `planType` disagreement | 0 (moot - `planType` does not exist) |

Tier distribution: **free 30, elite 2, pro 1**.

The three-field ambiguity in `accessService` is real in code but **dormant in data**: `planExpiry` and `planDuration` are never written, so any code path reading them silently treats every user as unentitled. `proExpiry` is the de facto single source of truth.

All 3 non-free users share the identical value `proExpiry: "2027-03-24"` (a **string**, not a `Date`). At verification time (2026-09-30) they are **not expired** - roughly 5.8 months remain. Note the value is a bare date string, so any expiry comparison depends on how the reader coerces it.

### 5.4 `mcp_config.tools` - HIGH (resolves and **escalates** `#11`)

The live singleton document:
```
tools: {
  "get_component_code":     "true",
  "list_components":        "true",   <-- PHANTOM
  "search_components":      "true",
  "get_component_metadata": "true"
}
```

Three verified facts:

1. **`list_components` does not exist in the codebase.** A search across all of `mcp-server/` (both `src` and `dist`) returns **no matches**. The real tool is **`list_all_components`** (`src/tools/index.ts:15,31`). The DB key is orphaned.

2. **The real registry has 14 tools; the DB config has 4 keys.** Ten registered tools - including `list_all_components`, `search_by_behavior`, `get_ai_prompts`, `get_template_source` - have **no config row at all**.

3. **Values are strings, not booleans.** All four are the string `"true"`.

`configService.ts:63-67` gates on a **strict** comparison:
```ts
if (cfg.tools[name] === false) return false;
return true;
```
and `getToolStates()` (line 71) uses `cfg.tools[name] !== false`.

**Behavioural consequences, all derived from code plus the observed data:**
- `isToolEnabled()` is **fail-open**: a tool absent from the config is **enabled**. So all 14 tools are currently enabled, 10 of them by default rather than by decision.
- A value of the **string** `"false"` would **not** disable a tool, because `"false" === false` is false. `setTool()` (line 74-76) writes a real boolean so the API path is safe, but any direct database or seed write using strings **silently fails to disable**. Today all four values are `"true"`, so behaviour is correct **by luck**.
- `admin.ts:1030-1031` computes the dashboard's tool counts from the **raw DB object** rather than the registry:
  ```ts
  toolsEnabled: Object.values(cfg.tools).filter(Boolean).length,
  toolsTotal: Object.keys(cfg.tools).length,
  ```
  With the live data this reports **4 enabled / 4 total** while the truth is **14 / 14** - the admin dashboard under-reports by 10. `filter(Boolean)` also counts the string `"true"` as truthy.
- `admin.ts:1086` returns raw `cfg.tools` to the admin client, so any UI built from that payload renders a control for the nonexistent `list_components` and omits 11 real tools.

Phase 1 recorded this as a stale seed. Live data shows it is **live, actively mis-reporting, and fail-open**. Severity raised.

### 5.5 Push / VAPID (Task 10) - MEDIUM

VAPID values are environment-only and were **not** read from any `.env` file, per the no-secret-values rule.

Indirect evidence:
```
users with pushSubscriptions | pushSubscription | fcmTokens:  0
```
**Zero users hold any push subscription.** Combined with the absence of `VAPID_*` entries in `render.yaml` (Phase 1 `#21`), the consistent reading is that Web Push has never completed a registration for a real user. It cannot be confirmed whether VAPID keys are absent from the live environment or merely unset in the blueprint - see `UNKNOWN_REGISTER.md` U-04.

### 5.6 `mcp_api_keys` - HIGH (positive finding)

Shape: `_id, user_id, key_hash, key_prefix, name, created_at, last_used_at, expires_at, revoked_at, status`.

Keys are **hashed at rest** with a short display prefix retained. An automated plaintext-key heuristic flagged this, and on inspection it is a **false positive** - the long string is `key_hash`, not a recoverable secret. 7 keys exist, so MCP authentication is in real use.

### 5.7 Payment trail is absent - MEDIUM

`payments: 1` but `payment_webhooks: 0`, and all 3 entitled accounts share one identical expiry date and were seeded together (§5.2). The consistent reading is that entitlements were **granted directly by an admin**, not by a verified payment. Combined with Phase 1 `#18` (three uncoordinated grant paths), there is no evidence any real customer has ever been charged successfully.

Separately, `sample_mflix` on the same Atlas cluster is unrelated to UI-HUB and indicates the cluster is shared with other projects.

---

## 6. Test baseline (Task 12)

All four suites. No test was modified, skipped, or made to pass artificially.

| Package | Command | Exit | Result |
|---|---|---|---|
| backend | `npm run check:premium` | 0 | **PASS** - `41/41 premium components resolvable (34 embedded, 7 via filesystem fallback)` |
| backend | `npm test` | **1** | **BROKEN AT RUNNER LEVEL** - see 6.1 |
| backend | `node --test tests/*.test.js` (corrected) | 0 | **21 / 21 PASS** |
| mcp-server | `npx vitest run` | 0 | **69 / 69 PASS**, 4 files |
| cli | `npm test` | 0 | **30 / 30 PASS** |
| frontend | - | - | **NO TEST SCRIPT EXISTS** |

**Aggregate: 120 tests, 120 passing.** The only failing entry is the backend's own `npm test` wrapper.

All 10 test files are mock-based with **no external service imports** - the suite runs fully offline. This is a genuine strength.

### 6.1 `npm test` in `backend` is broken - HIGH

`backend/package.json` declares:
```json
"test": "npm run check:premium && node --test tests/"
```
On Node `v24.21.0` the trailing `tests/` is resolved as a **module path**, not a test directory glob:
```
Error: Cannot find module '...\backend\tests'
  code: 'MODULE_NOT_FOUND'
```
Node's runner reports this as `tests 1 / pass 0 / fail 1` - a **runner crash, not a test failure**. The 21 real tests never execute. Anyone trusting a red `npm test` here would be debugging the wrong thing, and CI wired to `npm test` would report failures that are purely a runner-argument bug.

Phase 1 `#23` ("`npm test` fails at the root") is **confirmed and made precise**: the root has no `test` script at all, and `backend`'s is broken by argument form. `node --test tests/*.test.js` (or plain `node --test`) works.

### 6.2 `cli` does not use vitest - LOW (recorded to prevent future error)

`cli/package.json` declares only `@types/node, tsx, typescript` as devDependencies; vitest is **not** a cli dependency and is not installed. Its suite is Node's built-in runner via `tsx`. Invoking `vitest` in `cli` fails at startup. `cli/node_modules` holds only 6 packages.

---

## 7. Typecheck and build baseline (Task 13)

Per the agreed constraint: **typecheck only, no artifact-writing builds.** `tsc --noEmit` was used; `vite build` and `npm run build` were **not** run, so `frontend/dist` and `mcp-server/dist` are untouched (81 tracked `dist` files, unchanged).

| Package | Method | Exit | Errors |
|---|---|---|---|
| frontend | `tsc --noEmit` | **0** | **0** |
| mcp-server | `tsc --noEmit` | **0** | **0** |
| cli | `tsc --noEmit` | **0** | **0** |
| backend | `node --check` on 6 core modules | 0 | **0 syntax errors** |

Backend validation covered `src/server.js`, `src/services/mongoService.js`, `accessService.js`, `firebaseService.js`, `pushService.js`, `src/routes/userRoutes.js`. **No server was started and no database was touched**, so this proves parseability only - not import-time correctness, which is precisely what §1.1 shows is broken on Vercel.

### 7.1 The frontend typecheck is real, not a false green - HIGH

A frontend `tsc` pass is only meaningful if the program is non-empty. Verified with `tsc --noEmit --listFiles`:

- `frontend/src` contains **282 `.tsx`** and **57 `.ts`** files.
- `--listFiles` returns **1,996** entries and explicitly includes project sources such as `frontend/src/context/ThemeContext.tsx`, `frontend/src/components/ui/PlanBadge.tsx`.

So all 339 source files are type-checked and genuinely pass. (`frontend/tsconfig.json` sets no `include`, relies on the default full-project walk, and is not `strict` - strictness is a separate matter and was not changed.)

### 7.2 No package defines a `typecheck` script

`typecheck` is absent from all four `package.json` files. Type-checking is only reachable by invoking `tsc` by hand, so it cannot be enforced by any existing script or CI. Phase 1 `#25` (no CI anywhere) is therefore compounded: there is neither a pipeline nor a script that would surface a type regression.

---

## 8. Security checkpoint (Task 1)

Full tracked-file scan for live-secret patterns. **No secret value is reproduced in this document.**

| Pattern | Result |
|---|---|
| Mongo URI with embedded credentials | 4 files (2 distinct values) |
| Razorpay live/test secret | clean |
| Brevo `xkeysib-` key | clean |
| Vercel / Netlify token | clean |
| Firebase private key | **false positive** - placeholder text |
| Google API key `AIza...` | **false positive** - see 8.3 |

### 8.1 One real credential, rotated - HIGH

| Location | Fingerprint | Auth result |
|---|---|---|
| `backend/.env.example` | `69ED364AF03D` | **`AUTH_FAIL bad auth`** |
| `mcp-server/.env.example` | `69ED364AF03D` | same value |
| `backend/.env` (git-ignored) | `AC0F414ED8C3` | **`AUTH_OK`** - live and in use |

The committed credential is **no longer valid** - rotation **has** occurred. It remains present in the working tree and at `HEAD`, and in git history since commit `acf3005a` (`feat: migrate database from Firestore to MongoDB`). The earliest commit touching the file had no embedded credential, so `acf3005a` is the introduction point.

**Status: rotation verified complete. History scrub NOT done.** 7 commits touch the file. Values were compared only by SHA-256 fingerprint; no value was printed or transmitted.

### 8.2 `MCP.md` / `README.md` are placeholders, not leaks - HIGH

Both contain a Mongo URI with an embedded credential shape, fingerprint `FE7A54514BA5`. The host is literally `cluster0.xxxxx.mongodb.net` - the cluster name is **masked**, and resolution fails:

```
MongoParseError: querySrv ENOTFOUND _mongodb._tcp.cluster0.xxxxx.mongodb.net
```

Not a live exposure. Worth flagging as a **hygiene issue**: a sanitized example that still *shaped* like a real credential will trip every future secret scanner, including the one that should be guarding this repository.

### 8.3 Two more false positives, deliberately cleared - HIGH

- `frontend/src/main.tsx:11` - `apiKey: "AIza..."` is the **Firebase web configuration key**. It is shipped to every browser by design and is not a secret; it is constrained by Firebase's authorized-domain rules.
- `frontend/public/favicon.svg:3` - the `AIza` sequence occurs by coincidence **inside a base64-encoded PNG data URI**.
- `MCP.md` / `README.md` Firebase private-key blocks contain placeholder markers, not PEM material.

Recorded so these are not re-investigated and not "fixed" by later agents.

---

## 9. Scope compliance

- No application source, configuration, dependency, or schema was modified.
- No file outside `.uihub-agent/**` was created or edited.
- `agent.md` remains exactly as the owner left it.
- No commits, no staging, no pushes. `HEAD` is still `41938a67`.
- `mcp-server/dist` unchanged (81 tracked files); no build was run.
- Database access was read-only: `countDocuments`, `aggregate`, `findOne` with projections. **Zero writes.**
- No secret value appears in this document; only SHA-256 fingerprints and hostnames.
- Owner decisions were sought and honoured on all three scope questions (database access, outage depth, build artifacts).

---

# PHASE 3 RUNTIME VERIFICATION (2026-09-30)

Phase 2 verified the outage. Phase 3 fixed repository-side causes and re-verified
locally. **No deployment was performed, so production still shows the Phase 2
symptoms.** Everything below was measured on this machine.

## Environment

| Item | Value |
|---|---|
| Node | v24.21.0 |
| npm | 11.19.0 |
| Shape | `NODE_ENV=production`, `VERCEL=1` |
| Entry | `api/index.js` -> `backend/src/server.js` |

## 1. Entrypoint import

| Check | Result |
|---|---|
| `api/index.js` imports | **PASS** - Express app exported |
| Cold import time | ~24 s (within `maxDuration: 30`, thin headroom) |
| MCP mount | `mounted` - from committed `mcp-server/dist` |

This is the check that failed on Vercel. It now passes locally. It is **not**
evidence that the deployed function works, because the deployed function still
runs the old build.

## 2. Health endpoint

Run with `MONGODB_URI=mongodb://127.0.0.1:1/nowhere` - a port nothing listens
on - so a real dependency failure is forced.

| Check | Result |
|---|---|
| Direct `getDb()` | `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:1` |
| `isMongoConnected()` before/after | `false` / `false` |
| `GET /api/health` | **HTTP 503** |
| `status` | `unhealthy` |
| `dependencies.mongodb` | `disconnected` |
| `dependencies.redis` | `{ configured: false, connected: false, required: false }` |
| `dependencies.mcp` | `mounted` |
| Probe duration | 3113 ms - bounded, does not hang |

### The false positive this uncovered

An earlier iteration of the health work reported `mongodb: connected` and
`HTTP 200` against the same dead URI. Root cause:

`mongoService.getClient()` assigns the module-level `client` **synchronously**
from `new MongoClient(...)` and only then awaits `client.connect()`.
`isClientAlive()` only checks that `client` is non-null and its topology is not
closed. A probe that trusted `isMongoConnected()` therefore reported success for a
database whose handshake was still pending or about to fail.

`dotenv` was ruled out as a cause: `dotenv.config()` returned `path=NONE` and
`MONGODB_URI` was byte-identical before and after, so no `.env` file was masking
the bad URI.

`probeMongo` now sends a real `db.command({ ping: 1 })` bounded by
`MONGO_PROBE_TIMEOUT_MS` (3000) and deliberately ignores `isMongoConnected()`,
which remains a latency guard for `collectionsRoutes` and `favoritesRoutes`.

**This is the single most important finding in Phase 3:** a "health" check that
asks a cache whether it *believes* it is connected is not a health check.

## 3. Status-to-HTTP contract

| Mongo | MCP | `status` | HTTP |
|---|---|---|---|
| up | mounted | `healthy` | 200 |
| up | not mounted | `degraded` | 200 |
| down | any | `unhealthy` | **503** |

Redis is optional and never changes status. The legacy `message` string and the
`services.backend` / `services.mcp` keys are preserved for existing consumers.

## 4. Authorization behaviour (unit-verified, not live-exercised)

| Route | Before | After |
|---|---|---|
| `/api/v1/users/broadcast-reengagement` | open, or shared secret | `verifyToken` + `requireAdmin` |
| `/api/v1/users/broadcast-announcement` | open, or shared secret | `verifyToken` + `requireAdmin` |
| `/api/v1/users/push-broadcast` | open, or shared secret | `verifyToken` + `requireAdmin` |
| 4 email-test routes | hardcoded fallback secret | fail closed; 503 if unset |

`requireAdmin` returns 401 with no identity, 403 for unknown or non-admin, 503
when the Mongo lookup itself fails. No live broadcast or email was sent, and no
production data was touched.

## 5. Design tokens (verified against emitted CSS)

| Check | Before | After |
|---|---|---|
| `.text-brand-green` (36 uses) | not generated | **generated** |
| `.bg-brand-green` (22 uses) | not generated | **generated** |
| `.ring-ring` (5 uses) | not generated | **generated** |
| `.bg-background` (10) / `.text-foreground` (6) | not generated | **generated** |
| `.bg-muted` (2) / `.text-muted-foreground` (7) | not generated | **generated** |
| `.bg-accent` (6) / `.bg-secondary` (1) | not generated | **generated** |
| `.border-input` (1) / `.ring-offset-background` (1) | not generated | **generated** |
| `"Space+Grotesk"` in CSS | present (invalid family) | **absent**; `"Space Grotesk"` present |
| `.shadow-neon`, `.shadow-brutal-blue`, `.bg-black-rgb` | absent | absent - confirms the v3 config is inert |

**Not verified:** how any of this looks. No browser check was performed. ~97
usages that previously rendered with no colour will now paint, and a designer
should review the admin, library, and pricing pages.

## 6. Production status: unchanged

| Surface | Phase 2 observation | Phase 3 |
|---|---|---|
| Vercel frontend | 200 | unchanged - no deploy |
| Vercel `/api/*` | 500 `FUNCTION_INVOCATION_FAILED` | unchanged - repository fixed, not redeployed |
| Render API | 503 via Cloudflare | unchanged |
| Render MCP | 503 | unchanged |

**Owner action required** to close the loop: redeploy on Vercel, then confirm
`/api/health` returns 200 and an authenticated MCP call succeeds.
