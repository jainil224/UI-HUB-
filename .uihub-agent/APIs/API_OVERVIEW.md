# UI HUB — API Overview

High-level API structure and the endpoints verified in code. **This is not an
exhaustive contract reference** — request/response schemas, error bodies and
status codes are a later phase. Endpoint lists below are *generated*; see
`../PROJECT_MAP.json → apis`.

**No secret values appear in this file.** Environment variables are named only.

---

## 0. Three separate API surfaces

| Surface | Mount | Transport | Auth |
|---|---|---|---|
| **REST** | `/api/v1/*` **and** `/v1/*` | HTTP JSON | Firebase ID token, varying per endpoint |
| **MCP** | `/mcp` | JSON-RPC 2.0 over HTTP POST | SHA-256-hashed API key (`uh_live_…`) |
| **MCP management** | `/api/dashboard/mcp`, `/api/admin/mcp` | HTTP JSON | Firebase ID token (+ admin allow-list) |

Plus six third-party integrations (§7).

---

## 1. The double-mount — read this first

`backend/src/server.js` creates **one** `express.Router()` and mounts it at
**both `/api` and `/`**. Every REST endpoint below is therefore reachable at
either prefix:

```
GET /api/v1/favorites      ≡   GET /v1/favorites
GET /health                ≡   GET /api/health
```

This is intentional — the Vercel serverless function is mounted at `/api`, while
the Render service serves the app at the root. **Do not "fix" this by removing a
prefix** without checking both deployment targets. `confidence: high`

---

## 2. REST — components

`backend/src/routes/componentRoutes.js` → mounted at `/v1/components`
→ effectively `/api/v1/components` and `/v1/components`.

| Method | Path | Auth | Purpose | Frontend caller |
|---|---|---|---|---|
| `GET` | `/v1/components/:id/prompt/:system` | optional token | AI vibe prompt for a component + AI system | `utils/promptUtils.ts:366` (3.5s timeout; 403 → `TRIAL_LIMIT` / `AUTH_REQUIRED`) |
| `GET` | `/v1/components/:id/source` | **`verifyToken` + `sourceLimiter`** | Premium component source | `utils/promptUtils.ts:423` |
| `POST` | `/v1/components/sync` | none | Background catalogue sync | `utils/componentSync.ts:22` (throttled 1×/h) |
| `POST` | `/v1/components` | none | Component submission | — (no frontend caller found) |
| `GET` | `/v1/components/db` | none | Catalogue read from the DB | — (no frontend caller found) |

**Notes**
- `/source` is the only endpoint in the app with a dedicated rate limiter.
- `optionalVerifyToken` is defined **locally** in `componentRoutes.js:18` and
  again in `userRoutes.js:883` — not shared. Editing one does not edit the other.
- `POST /v1/components` and `GET /v1/components/db` are **unauthenticated** and
  have no identified frontend caller. `confidence: medium` on their intent.

---

## 3. REST — users

`backend/src/routes/userRoutes.js` → `/v1/users`. **14 endpoints.**

### Authenticated (`verifyToken`)

| Method | Path | Purpose | Frontend caller |
|---|---|---|---|
| `POST` | `/v1/users/sync` | Create/update the user record after sign-in | `utils/syncUser.ts:45` (forced token refresh) |
| `GET` | `/v1/users/status` | **Entitlements: plan, categories, purchases** | `context/AuthContext.tsx:136` · `ComponentDetail/index.tsx:1065` |
| `POST` | `/v1/users/welcome-shown` | Mark the first-login welcome as seen | `context/AuthContext.tsx:113` |
| `POST` | `/v1/users/activate-free` | Self-service free-tier activation | `pages/PricingPage/PricingPage.tsx:44` |
| `POST` | `/v1/users/push-subscribe` | Store a Web Push subscription | `utils/pushService.ts:66` |

### Optional auth

| Method | Path | Purpose | Frontend caller |
|---|---|---|---|
| `POST` | `/v1/users/activity` | Behavioural event log (`keepalive: true`) | `utils/activityLogger.ts:37` |

### Unauthenticated — review before touching

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v1/users/check` | Existence check |
| `POST` | `/v1/users/email-test` | Send a test email |
| `POST` | `/v1/users/free-email-test` | Free-tier email test |
| `POST` | `/v1/users/pro-email-test` | Pro-tier email test |
| `POST` | `/v1/users/reengagement-email-test` | Re-engagement email test |
| `POST` | `/v1/users/broadcast-reengagement` | **Broadcast to all users** |
| `POST` | `/v1/users/broadcast-announcement` | **Broadcast to all users** |
| `POST` | `/v1/users/push-broadcast` | **Push to all subscribers** |

> **Eight unauthenticated endpoints, four of which broadcast to every user.**
> `RISK-02`. This is recorded, not fixed — see `../rules/DO_NOT_CHANGE.md`.

---

## 4. REST — config, favorites, collections, payments

### `configRoutes.js` → `/v1/config` — all public by design

| Method | Path | Returns | Frontend caller |
|---|---|---|---|
| `GET` | `/v1/config/firebase` | Firebase web config | `main.tsx:37` — **response discarded** |
| `GET` | `/v1/config/razorpay-key` | Razorpay **publishable** key | `utils/checkout.ts:71` · `PricingPage.tsx:81` |
| `GET` | `/v1/config/push-vapid` | VAPID public key | `utils/pushService.ts:50` |

Publishable keys are designed to be public. Only the publishable key is served —
never `RAZORPAY_KEY_SECRET`.

### `favoritesRoutes.js` → `/v1`

| Method | Path | Auth | Frontend caller |
|---|---|---|---|
| `GET` | `/v1/favorites` | `verifyToken` | `services/favorites.ts:162` (polled) |
| `POST` | `/v1/favorites` | `verifyToken` | `services/favorites.ts:111` |
| `DELETE` | `/v1/favorites/:componentId` | `verifyToken` | `services/favorites.ts:137` |
| `GET` | `/v1/components/community` | none | `services/community.tsx:39` |
| `GET` | `/v1/components/community/:id` | none | `services/community.tsx:48` |

### `collectionsRoutes.js` → `/v1` — **all 7 require `verifyToken`**

| Method | Path | Frontend caller |
|---|---|---|
| `GET` | `/v1/collections` | `services/collections.ts:71` |
| `POST` | `/v1/collections` | `services/collections.ts:81` |
| `GET` | `/v1/collections/:collectionId` | `services/collections.ts:76` |
| `PATCH` | `/v1/collections/:collectionId` | `services/collections.ts:92` |
| `DELETE` | `/v1/collections/:collectionId` | `services/collections.ts:99` |
| `POST` | `/v1/collections/:collectionId/items` | `services/collections.ts:109` |
| `DELETE` | `/v1/collections/:collectionId/items/:componentId` | `services/collections.ts:120` |

### Health

`GET /health` ≡ `GET /api/health` — identical payload, `backend: online`,
`mcp: online`. Used as the Render `healthCheckPath`. No auth.

---

## 5. REST — payments

`backend/src/routes/paymentRoutes.js` → `/v1/payment`. **Protected — read
`../rules/DO_NOT_CHANGE.md` before editing anything in this section.**

| Method | Path | Auth | Purpose | Frontend caller |
|---|---|---|---|---|
| `POST` | `/v1/payment/create-order` | `verifyToken` | Create a Razorpay order | `utils/checkout.ts:93` · `PricingPage.tsx:109` |
| `POST` | `/v1/payment/verify-payment` | `verifyToken` | Confirm payment → grant entitlement | `utils/checkout.ts:128` · `PricingPage.tsx:139` |
| `POST` | `/v1/payment/webhook` | **none** (Razorpay signature) | Razorpay server-to-server callback | — |
| `GET` | `/v1/payment/recover-jainil` | none | **A single named recovery route.** Unclear purpose; owner-specific naming suggests a one-off manual recovery script promoted to a route. `confidence: low` |

### The flow, and what must not change

```
1. GET  /v1/config/razorpay-key        → publishable key
2. POST /v1/payment/create-order       → { planId | tier, componentId? }
       validator constrains: planId/tier ∈ { pro }, currency ∈ { INR, USD }
3. load https://checkout.razorpay.com/v1/checkout.js   (CSP allows this host)
4. user completes checkout in the Razorpay sheet
5. POST /v1/payment/verify-payment     → { razorpay ids + signature }
6. backend: HMAC-SHA256 verify, timingSafeEqual   (utils/verifySignature.js)
7. entitlement granted server-side
8. GET /v1/users/status reflects it → AuthContext mirrors to localStorage
```

**Invariant: the client never decides whether a payment succeeded.** Step 6 is
server-side and constant-time. Any change that lets a client assert success
breaks the payment model.

**The webhook is registered on the raw body before `express.json`.** Moving it
will silently break signature verification, because the signature is computed
over the unparsed payload.

**Per-component price:** `{ usd: 1.99, inr: 49 }` (`utils/checkout.ts`).

---

## 6. MCP

### 6.1 The JSON-RPC endpoint

`mcp-server/src/routes/mcp.ts` → `POST /mcp`
Also mounted at `/api/dashboard/mcp` and `/api/admin/mcp` by
`backend/src/server.js` and by `mcp-server/src/index.ts` — the paths are
identical either way.

**Hand-implemented. `@modelcontextprotocol/sdk` is not a dependency.**
Protocol version `2025-06-18`.

| Method | Implemented | Notes |
|---|---|---|
| `initialize` | yes | |
| `ping` | yes | |
| `tools/list` | yes | 14 tools |
| `tools/call` | yes | |
| `resources/list` | **no** | Not implemented |
| `resources/read` | **no** | Not implemented |
| `prompts/list` | **no** | Not implemented |
| `prompts/get` | **no** | Not implemented |

**The server exposes tools only — zero resources, zero prompts.** A client that
requests resources gets no answer.

Also implemented: **`GET /` and `DELETE /`** — an in-memory session store.
`docs/mcp.md` and `MCP.md` both claim these return 405 in "stateless mode".
They do not. `../CONFLICTS.md` §13.

### 6.2 Authentication

`mcp-server/src/middleware/auth.ts`

```
Authorization: Bearer uh_live_…      (preferred)
?key=uh_live_…                       (for clients that cannot set headers)
x-api-key: uh_live_…                 (same)
```

Keys are stored as **SHA-256 hashes** in MongoDB `mcp_api_keys`; the prefix is
stored separately for display (`keyPrefixMask` → `prefix••••••••••••`).
**Plaintext is returned exactly once, at creation.** It is never stored and
cannot be recovered.

**Rejections return HTTP 200** with a JSON-RPC error envelope:
`-32001` auth, `-32003` internal/timeout. Deliberate — it lets clients show a
readable message — but it means **HTTP status cannot be used to detect MCP auth
failure.** DB calls are wrapped in a 7-second timeout to survive cold starts.

Rate limits: FREE **100**, PRO **10000** (`MCP_RATE_LIMIT_FREE` / `_PRO`).
Tier comes from Firebase with a FREE fallback.

### 6.3 The 14 tools

Registered in `mcp-server/src/tools/index.ts`; one file each.

| Tool | File | Purpose |
|---|---|---|
| `search_components` | `searchComponents.ts` | Search the component catalogue |
| `get_component` | `getComponent.ts` | Component metadata / preview info |
| `get_component_code` | `getComponentCode.ts` | **Full source for one component** |
| `search_templates` | `searchTemplates.ts` | Search templates |
| `get_template` | `getTemplate.ts` | Template metadata |
| `get_template_source` | `getTemplateSource.ts` | Full source for one template |
| `search_animations` | `searchAnimations.ts` | Search the text-animation set |
| `get_animation_code` | `getAnimationCode.ts` | Source for an animation |
| `list_categories` | `listCategories.ts` | All 13 categories + descriptions |
| `get_dependencies` | `getDependencies.ts` | Library dependencies for a component |
| `get_component_metadata` | `getComponentMetadata.ts` | Props / vibe metadata |
| `search_by_behavior` | `searchByBehavior.ts` | Behavioural search (e.g. "magnetic", "parallax") |
| `get_ai_prompts` | `getAiPrompts.ts` | AI vibe prompts for a component |
| `list_all_components` | `listAllComponents.ts` | The whole catalogue |

Data comes from `mcp-server/src/data/` (generated, §8).
`docs/mcp.md` documents only 11 of these. `../CONFLICTS.md` §10.

### 6.4 Dashboard API — `/api/dashboard/mcp`

`mcp-server/src/routes/dashboard.ts` · Firebase ID token
Client: `frontend/src/services/mcp.ts`

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/keys` | List the user's API keys |
| `POST` | `/keys` | **Create a key — plaintext returned once** |
| `POST` | `/keys/:id/revoke` | Revoke |
| `DELETE` | `/keys/:id` | Delete |
| `GET` | `/usage` | Usage stats |
| `GET` | `/status` | Key status |
| `GET` | `/overview` | Dashboard summary |
| `GET` | `/admin/metrics` | Admin metrics, if the account qualifies |

**Cold-start tolerant by design:** 90s timeout, 2 retries, 2s/5s backoff
(`COLD_START_OPTS`). A `401` clears the TTL caches and throws `MCP_AUTH_REQUIRED`.

### 6.5 Admin API — `/api/admin/mcp`

`mcp-server/src/routes/admin.ts` · Firebase ID token + `requireAdmin`
(`MCP_ADMIN_EMAILS` allow-list) · Client: `frontend/src/services/admin.ts` (571 L, 24 endpoints)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/status` · `/overview` · `/analytics` | Dashboard aggregates |
| `GET` | `/users` · `/users/:id` | User listing and detail |
| `POST` | `/users/:id/suspend` · `/unsuspend` | **Account suspension** |
| `GET` | `/api-keys` | All keys across users |
| `PATCH` | `/api-keys/:id` | `{ action: revoke \| disable \| enable \| restore }` |
| `GET` | `/tools` · `PATCH /tools/:name` | `{ enabled }` — enable/disable a tool globally |
| `GET` | `/components` · `/search` | Catalogue and search analytics |
| `POST` | `/playground` | Invoke a tool ad hoc |
| `GET` | `/logs` | Request logs — **registered twice; first wins** |
| `GET` | `/security` · `/health` | Security and health panels |
| `GET` | `/alerts` · `POST /alerts/:key/resolve` · `/unresolve` | Alert management |
| `GET` · `PUT` | `/settings` | MCP configuration |
| `GET` | `/audit` | Audit trail |
| `GET` | `/export?type=&format=` | Data export (30s, blob download) |

**`PATCH /tools/:name` is a live kill-switch.** Disabling a tool affects every
MCP client immediately. `PATCH /api-keys/:id` can revoke any user's key.

---

## 7. Third-party integrations

| Provider | Purpose | Where | Config (names only) |
|---|---|---|---|
| **Razorpay** | Checkout + orders | `utils/razorpayUtils.ts` (script tag) · `paymentRoutes.js` (orders + HMAC) | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `VITE_RAZORPAY_KEY_ID` |
| **Firebase** | Auth both sides; Analytics client-side | `lib/firebase.ts` · `utils/firebaseAdmin.js` · `mcp-server/src/services/firebase.ts` | `VITE_FIREBASE_*`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_PROJECT_ID` |
| **Brevo** | Transactional + lifecycle email | `services/brevoService.js` | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` |
| **Google gtag** | Web analytics, Consent Mode v2 | `frontend/index.html` | measurement id (public identifier) |
| **Web Push / VAPID** | Browser push | `services/pushService.js` · `utils/pushService.ts` | `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| **Upstash Redis** | Distributed rate limits | `middleware/rateLimiters.js` | `REDIS_URL` |

> **Note on `frontend/src/main.tsx`:** a Firebase **web** config is hardcoded as a
> literal and is the config that actually ships — the `/v1/config/firebase`
> response is discarded and the re-init call is commented out. Firebase web config
> is designed to be public and is not a server secret, but it is credential-shaped
> data in source. `RISK-03`. **Do not copy it into any file in this tree.**

---

## 8. Data sources behind the APIs

`mcp-server/src/data/` is **generated**, not hand-maintained. Regenerate with
`cd mcp-server && npm run sync:data` → `scripts/sync-frontend-data.mjs`.

| File | Contents |
|---|---|
| `components.ts` | 137-entry catalogue: `CATEGORY_MAP`, `DEPENDENCIES_MAP`, `PREMIUM_IDS`, `CATEGORY_DESCRIPTIONS` |
| `sourceCode.json` | 148 source payloads |
| `premiumComponents.json` | 41 premium ids |
| `templates.json` | 8 top-level keys |
| `templateSourceCode.json` | Template sources |
| `aiPrompts.json` · `componentVibePrompts.json` | AI prompt banks |
| `componentMetadata.json` | Prop / vibe metadata |

`mcp-server/scripts/check-source-coverage.mjs` runs as part of `npm run build` and
**fails the build** if any premium component has lost its source. That is the
safety net for the premium list — it does **not** check that `dist` matches `src`.

---

## 9. Cross-reference: frontend call sites

21 `fetch()` call sites target the backend, across 13 files:

| File | Calls |
|---|---|
| `context/AuthContext.tsx` | `GET /users/status`, `POST /users/welcome-shown` |
| `utils/syncUser.ts` | `POST /users/sync` |
| `utils/promptUtils.ts` | `GET /components/:id/source` |
| `utils/componentSync.ts` | `POST /components/sync` |
| `utils/activityLogger.ts` | `POST /users/activity` |
| `utils/pushService.ts` | `GET /config/push-vapid`, `POST /users/push-subscribe` |
| `utils/checkout.ts` | `GET /config/razorpay-key`, `POST /payment/create-order`, `POST /payment/verify-payment` |
| `services/favorites.ts` | `fetch(\`${BASE}${path}\`)` — path built by a helper |
| `services/collections.ts` | `fetch(\`${BASE}${path}\`)` — path built by a helper |
| `services/community.tsx` | `GET /components/community`, `GET /components/community/:id` |
| `pages/PricingPage/PricingPage.tsx` | `GET /config/razorpay-key`, `POST /users/activate-free`, `POST /payment/create-order`, `POST /payment/verify-payment` |
| `pages/LibraryPage/sections/ComponentDetail/index.tsx` | `GET /users/status` |
| `main.tsx` | `GET /config/firebase` |

**Axios is not a dependency.** All HTTP is hand-rolled `fetch`.

**Base URL resolution** (`utils/apiConfig.ts` → `getApiBaseUrl()`):
1. `VITE_API_URL` || `VITE_API_BASE_URL`
2. In prod: the configured URL, else `window.location.origin` (with a warning)
3. In dev: a `192.168.*` / `10.*` / `172.16-31.*` host, or localhost on any port ≠ 5000 → `http://<host>:5000`
4. Fallback `http://localhost:5000`

> **Inconsistency:** `PricingPage.tsx:42` and two siblings read
> `import.meta.env.VITE_API_URL` **directly**, bypassing `getApiBaseUrl()` and
> therefore ignoring `VITE_API_BASE_URL` and all dev-mode LAN detection.
> `../CONFLICTS.md` §17.

---

## 10. Deliberately not documented here

| Area | Why | Belongs to |
|---|---|---|
| Request/response schemas | Not yet read field-by-field | Phase 5 |
| Error bodies and status codes | Partially observed only | Phase 5 |
| MongoDB collection schemas | No declared schema exists | Phase 5 |
| Rate-limit values per endpoint | Only tier-level limits confirmed | Phase 2 |
| Tool input schemas | One file per tool, not yet read | Phase 3 |
| Firestore legacy shape | Dead code (`migrateFirestoreToMongo.js`) | Probably never |

---

# Phase 5 additions - API surface ownership (2026-10-01)

## 0.1 Phase 5: there are two API surfaces, and they have different owners

| Surface | Owner | Base | Protocol | Auth |
|---|---|---|---|---|
| Web API | Vercel function | **same origin** (`ui-hub-design.vercel.app`) | REST | Firebase ID token / session |
| MCP | Render | `https://ui-hub-mcp.onrender.com/mcp` | MCP over SSE | `Bearer uh_live_...` API key |

These must not be merged. The frontend reaches the web API same-origin and MCP
cross-origin. Any future change that points `VITE_API_URL` at the MCP host, or
`VITE_MCP_API_URL` at the web API host, is wrong. Full detail in
`API_ARCHITECTURE.md` and `MCP_DEPLOYMENT_CONTRACT.md`.

## 0.2 Phase 5: `VITE_API_URL` is optional and should be unset in production

The production default is `window.location.origin`. Setting the variable is what
**broke** production, because the value is inlined at build time and now points
at a dead Render origin.

Resolution matrix and safety behaviour:

| Environment | Configuration | Result |
|---|---|---|
| Production | unset | same origin (**correct**) |
| Production | valid external URL | that host, validated |
| Production | known-dead host | unmissable warning, still honoured |
| Production | malformed | warn, fall back to same origin |
| Development | local network IP | `protocol//ip:5000` |
| Development | other | `http://localhost:5000` |

Enforced by 20 tests in `frontend/src/utils/apiConfig.test.ts`.

## 0.3 Phase 5: the double-mount is intentional

The Phase 2 note that the router is mounted at both `/api` and `/` is correct and
deliberate — it lets `/api/v1/...` and `/v1/...` both resolve.

Two consequences that repeatedly cause confusion:

- `GET /api/v1/components` returns **404 by design**. There is no `GET /` handler
  on the router. The real list endpoint is `GET /api/v1/components/db`. Do not
  read the 404 as an outage.
- MCP is mounted **outside** the double-mount, at top-level `/mcp` plus
  `/api/dashboard/mcp` and `/api/admin/mcp`. `vercel.json` routes only `/api/*`
  and `/health` to the function, so top-level `/mcp` is **not** served by Vercel.

## 0.4 Phase 5: health endpoints

| Endpoint | Served by | Correct response |
|---|---|---|
| `/health` | the function (`/health` rewrite added in Phase 5) | JSON |
| `/api/health` | the function | JSON |
| `/mcp/health` | the MCP service | JSON |
| `/admin/mcp/health` | **the frontend SPA** | HTML — a React route, not an API path |

`/admin/mcp/health` is a nested React route (`HealthPage` under `AdminGuard`). It
is the reason the new `/health` rewrite does not shadow anything.

Never treat a 200 as healthy without checking `content-type`: `/health` used to
return the 6,474-byte HTML shell with a 200 status while every API call 500'd.

## 0.5 CORS is not enforced

`backend/src/server.js:84` calls `callback(null, true)` even in the rejection
branch, so every origin is permitted and the allowlist is inert. Recorded in
`CONFLICTS.md` A11; not fixed in Phase 5.
