# ENVIRONMENT CONTRACT

Captured **2026-10-01** during Phase 5 (Task 5.12). Every environment variable the
repository reads, where it is read, whether it is required, and — most
importantly — whether it is read at **runtime** or **baked in at build time**.

**No secret value appears in this document.** Only variable names, requirements
and hostnames are recorded.

---

## 1. The single most important rule

`VITE_*` variables are **inlined into the bundle at build time** by Vite. They
are not read at runtime.

Consequences:

- Changing a `VITE_*` variable requires a **rebuild**, not just a restart.
- A value removed from the dashboard still lives in an already-deployed
  bundle.
- Unsetting a variable does **not** affect an existing deployment until it is
  rebuilt.
- Only variables prefixed `VITE_` reach the frontend. Everything else is
  server-side only.

This rule explains the entire production API failure. See
`APIs/API_ARCHITECTURE.md` section 3.

---

## 2. Frontend (`frontend/`)

Read via `import.meta.env`. Template: `frontend/.env.example`.

| Variable | Required | Effect if unset | Read at |
|---|---|---|---|
| `VITE_API_URL` | **no** | production falls back to `window.location.origin` (**correct**) | build |
| `VITE_API_BASE_URL` | **no** | secondary name for the above; lower precedence | build |
| `VITE_MCP_API_URL` | **no** | falls back to `DEV_FALLBACK` / `PROD_FALLBACK` | build |
| `VITE_RAZORPAY_KEY_ID` | **no** | key is fetched at runtime from `/api/v1/config/razorpay-key` | build |
| `BASE_URL` | n/a | Vite built-in | build |
| `PROD` | n/a | Vite built-in, `true` in a production build | build |

### 2.1 `VITE_API_URL` — the production trap

**Recommended value in production: leave it unset.**

When unset, production resolves same-origin and no configuration is required.
It is currently **set to a dead Render origin on the Vercel dashboard**, which is
why the live bundle calls Render.

`frontend/src/utils/apiConfig.ts` guards against a repeat:

- a malformed value cannot become a request URL (warns, falls back)
- a known-dead host produces an unmissable warning naming the host
- the explicit setting is still honoured, so an intentional external API is not
  silently overridden

Behaviour is pinned by `frontend/src/utils/apiConfig.test.ts` (20 tests).

### 2.2 `VITE_MCP_API_URL`

MCP is a **separate** host. Never point this at the web API.

```ts
// frontend/src/utils/mcpConfig.ts
const DEV_FALLBACK  = 'http://localhost:3001';
const PROD_FALLBACK = 'https://ui-hub-mcp.onrender.com';
```

### 2.3 `VITE_RAZORPAY_KEY_ID`

A build-time Razorpay key is a client-visible value. The backend endpoint
`/api/v1/config/razorpay-key` is preferred so the key can be rotated without a
rebuild. Both call sites now use `getApiBaseUrl()` rather than reading
`VITE_API_URL` directly, so there is one resolution path.

---

## 3. Backend (`backend/`) — server-side only

Template: `backend/.env.example`. Nothing here reaches the browser.

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | yes | `production` |
| `PORT` | no | injected by Render; default 5000 |
| `MONGODB_URI` | yes, secret | Atlas connection string |
| `MONGODB_DB` | yes | `uihub` |
| `JWT_SECRET` | yes, secret | session signing |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | yes, secret | payments |
| `FIREBASE_PROJECT_ID` | yes | `ui-hub-3fe3d` |
| `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` | yes, secret | Admin SDK |
| `BREVO_API_KEY` | yes, secret | transactional email |
| `BREVO_SENDER_EMAIL` / `BREVO_SENDER_NAME` | yes | email identity |
| `REDIS_URL` | no | in-memory rate limiting when absent |
| `ENABLE_EMBEDDED_FALLBACK` | no | data source when Mongo is unavailable |

---

## 4. MCP service (`mcp-server/`)

Template: `mcp-server/.env.example`. See
`APIs/MCP_DEPLOYMENT_CONTRACT.md` section 5 for the MCP-specific table.

| Variable | Required | Purpose |
|---|---|---|
| `MCP_SERVER_URL` | yes | the public endpoint advertised to clients |
| `MCP_PORT` | no | blueprint sets `3001`; Render injects `PORT` |
| `MCP_API_KEY_PREFIX` | yes | must match what the dashboard mints (`uh_live_`) |
| `MCP_RATE_LIMIT_FREE` / `MCP_RATE_LIMIT_PRO` | yes | quotas |
| `MCP_ALLOWED_ORIGINS` | yes | **currently inert**, see below |
| `MCP_ADMIN_EMAILS` | yes | **conflicts between blueprints** |
| `MONGODB_URI` / `MONGODB_DB` | yes | keys and usage |
| `FIREBASE_*` | yes, secret | API-key token verification |
| `REDIS_URL` | no | in-memory rate limiting when absent |

### 4.1 `MCP_ALLOWED_ORIGINS` does not currently enforce anything

`backend/src/server.js:82-85` logs a warning for a disallowed origin and then
still calls `callback(null, true)`. Every origin is accepted. Both blueprints set
this variable as if it were a control. It is documentation of intent, not a
control. Recorded in `CONFLICTS.md`; not fixed in Phase 5.

### 4.2 `MCP_ADMIN_EMAILS` conflicts

| File | Values |
|---|---|
| `render.yaml` | three addresses |
| `mcp-server/render.yaml` | two addresses |

One address is present in only one blueprint. Must be reconciled before either
is deployed.

---

## 5. Configuration summary

| Where | Variables set in repo | Source of live values |
|---|---|---|
| `vercel.json` | build command, output dir, rewrites, function payload — **no `env` block** | Vercel dashboard (build-time) |
| `render.yaml` | ~9 non-secret values; secrets `sync: false` | Render dashboard |
| `mcp-server/render.yaml` | ~8 non-secret values; secrets `sync: false` | Render dashboard |
| `frontend/.env.example` | documentation only | Vercel dashboard |

Because `vercel.json` has no `env` block, **any** `VITE_*` value in a live
bundle came from the Vercel dashboard. That is asserted by a regression test.

---

## 6. Security and hygiene

- Never commit a `.env`. Only `.env.example` templates belong in the repository.
- Render secrets use `sync: false`, which is correct: the blueprint declares them
  without values.
- `frontend/` is fully public. Anything in a `VITE_*` variable is public,
  including anything baked into a deployed bundle. Treat a deployed bundle as a
  disclosure surface.
- A secret removed from a dashboard is still present in historical builds. Rotate
  rather than rely on unsetting.
- Phase 5 ran a secret scan over all changes; no credential value was introduced.
  `.env` files were read by local tooling during verification and no value from
  them appears in any tracked file.