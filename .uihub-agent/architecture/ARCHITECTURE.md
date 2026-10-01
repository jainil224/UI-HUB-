# UI HUB — Architecture

Preliminary architecture, Phase 1. **Architecture-level only.** Component-level
detail, schema detail and full API contracts belong to later phases.

Confidence markers are defined in `../AGENT.md` §2.

---

## 1. System shape

```
                        ┌───────────────────────────────┐
   Browser  ──────────► │  Vercel                       │
                        │  frontend/  (Vite SPA)        │
                        │  api/index.js (serverless fn) │
                        └───────────────┬───────────────┘
                                        │ re-exports
                        ┌───────────────▼───────────────┐
                        │  Render — ONE web service     │
                        │  backend/src/server.js        │
                        │    ├─ REST router × 6         │
                        │    ├─ mounted at /api AND /    │
                        │    └─ dynamically imports     │
                        │         mcp-server/dist        │
                        │           /mcp                 │
                        │           /api/dashboard/mcp   │
                        │           /api/admin/mcp       │
                        └──────┬────────────┬───────────┘
                               │            │
                   ┌───────────▼──┐   ┌─────▼──────────┐
                   │  MongoDB     │   │  Redis         │
                   │  (primary)   │   │  rate limits   │
                   └──────────────┘   └────────────────┘
                               │
             ┌─────────────────┼──────────────────┐
             │                 │                  │
      ┌──────▼─────┐   ┌───────▼────────┐  ┌──────▼──────┐
      │  Firebase   │   │  Razorpay      │  │  Brevo      │
      │  Auth       │   │  (payments)    │  │  (email)    │
      └─────────────┘   └────────────────┘  └─────────────┘

      ┌──────────────────────────────────────────────┐
      │  MCP clients: AI agents · UI HUB CLI         │
      │  → /mcp  (Bearer uh_live_…)                   │
      └──────────────────────────────────────────────┘
```

**The single most important fact about this topology:** the backend and the MCP
server are **one Node process**, not two services. `backend/src/server.js`
`await import()`s the three compiled MCP routers from `mcp-server/dist` and
mounts them. `docs/runbook.md` states the opposite — see `../CONFLICTS.md` §1.

---

## 2. Frontend

**Stack:** React 19 · TypeScript 5.8 · Vite 6.2 · React Router 7 · Tailwind v4.

### Entry chain
```
frontend/index.html          HTML shell, fonts, gtag, meta
  └─ src/main.tsx            initFirebase() from a hardcoded literal
                              render <App/>
                              then fetch /api/v1/config/firebase  (response discarded)
    └─ src/App.tsx           BrowserRouter, <Routes>, AppShell
```

### Provider tree (`App.tsx:194-210`)
```
BrowserRouter
└─ CookieConsentProvider     gtag consent + GA enable/disable
   └─ ThemeProvider          light | dark
      └─ AuthProvider        identity + entitlements + welcome toast
         └─ SkeletonProvider
            └─ SmoothScroll  Lenis, disabled on mobile
               └─ AppShell   TopLoader, ScrollToTop, CookieBanner,
                            PushNotificationPrompt, Navbar?, <main>, Footer?
```

### Routing
All **61** `<Route>` elements are in `App.tsx` (lines 109–174). Every component is
`React.lazy()` behind a single `Suspense` whose fallback is `HeroSkeleton`.

Three shapes:

1. **Flat public routes** — `/`, `/library`, `/templates`, `/templates/:id`, `/pricing`, `/favorites`, the three auth routes, four legal routes, `/preview-capture`.
2. **Nested dashboard** — `/dashboard` → `DashboardLayout` → `{index redirect, mcp, collections}`.
3. **Nested admin** — `/admin/mcp` → `AdminGuard` → `AdminLayout` → 17 children.

Plus 20 explicit `/demo/*` routes ahead of a `/demo/:id` catch-all, which resolves
against `componentList` first and then `getCommunityComponent(id)`.

**No 404 route exists.** An unknown path renders an empty `<main>`.
**No `useLayoutEffect` router data loaders** — there is no SSR and no data router.
This is a pure client-rendered SPA.

### Chrome visibility rules (`AppShell`)
- `<Footer>` hidden on library, auth, demo, dashboard, admin, templates, build-with-ui-hub.
- `<Navbar>` hidden only on demo and admin — so `/library` **does** render it.
  (The comment at `App.tsx:74` claims otherwise. `../CONFLICTS.md` §18.)
- Always mounted: `TopLoader`, `ScrollToTop`, `CookieBanner`, `PushNotificationPrompt`.

### State model

| Layer | Where | Scope |
|---|---|---|
| React Context × 4 | `src/context/` | auth/entitlements, theme, cookie consent, skeleton |
| Zustand × 3 | `components/ui/CloudScroll/stores/` | **CloudScroll only** — portal, scroll, theme |
| `useState`/`useRef` | everywhere else | component-local |
| `localStorage` | `context/AuthContext.tsx`, `services/favorites.ts`, `utils/*` | entitlement mirror, guest favourites, sync throttle, welcome/opt-in markers |
| Module-level caches | `utils/prefetchUtils.ts`, `services/admin.ts`, `services/mcp.ts` | prefetch Set, TTL'd response caches |
| Cookies | `utils/cookieUtils.ts` | consent status + prefs (365d, `SameSite=Lax`, no `Secure` flag) |

**No Redux / MobX / Jotai / XState.** The app is context + local state.

### Catalogue loading — the dominant performance concern
`data/componentData.tsx` (743 KB) and `data/templatesData.ts` (892 KB) are the two
largest source files. Both are loaded **lazily**:
- `SearchBox` → `utils/searchIndex.ts` `import()`s both on first query, memoised.
- `prefetchUtils.ts` holds a `PREFETCH_MAP` of ~70 hover/focus chunk loaders plus
  heuristics for `text-*` and `effect-*` prefixes, guarded by a module-level Set.
- `TemplateDetailPage` lazy-loads its code viewer with a comment citing a ~3.2 MB saving.
- `HomePage/sections/TemplatesSection.tsx` is the exception: it **eagerly** imports
  all 19 template components for live previews (lines 28–46).

**Confidence: high.**

---

## 3. Backend

**Stack:** Node ESM · Express 4 · **plain JavaScript** (no TypeScript) · MongoDB
official driver (no Mongoose) · Firebase Admin · Redis.

### Entry: `backend/src/server.js`
1. `trust proxy 1` — required for correct client IPs behind Render/Vercel.
2. Helmet with an explicit CSP that allows `checkout.razorpay.com`.
3. Global rate limiter.
4. **One** `express.Router()` is created and mounted at **both `/api` and `/`**.
   Every backend endpoint is therefore reachable with or without the `/api` prefix.
5. `/health` and `/api/health` — identical payload, `backend: online`, `mcp: online`.
6. Dynamic MCP import (§4).
7. The webhook route is registered on the **raw body**, before `express.json`.

### Layering
```
routes/        6 routers — HTTP shape, middleware chaining, no business logic
  ↓
services/      17 modules — ALL business logic and ALL data access
  ↓
MongoDB driver · Firebase Admin · Redis · Razorpay · Brevo
```
There is **no model layer**. `services/mongoService.js` holds the connection and
the collection accessors. Do not look for Mongoose schemas; there are none.

`middleware/auth.js` exports exactly **one** function, `verifyToken`. The
`optionalVerifyToken` variant is defined *locally* inside both
`componentRoutes.js:18` and `userRoutes.js:883` rather than shared — duplicated
logic in two places. `confidence: high`

### Operational scripts
`backend/src/scripts/` holds 16 modules that do **not** run at boot — Mongo and
Firestore initialisation, `migrateFirestoreToMongo.js`, premium source embedding,
coverage checks, and eight email-test/send scripts. Several are wired to npm
scripts (`sync:components`, `sync:premium`, `check:premium`).

---

## 4. MCP server

**Stack:** TypeScript 5.6 → `dist/` · Express 4 · MongoDB · Firebase Admin · Zod · Redis.

### The protocol is hand-implemented
`@modelcontextprotocol/sdk` is **not** a dependency. `routes/mcp.ts` implements
JSON-RPC 2.0 by hand at protocol version `2025-06-18`.

- **Implemented:** `initialize`, `ping`, `tools/list`, `tools/call`
- **Not implemented:** `resources/list`, `resources/read`, `prompts/list`, `prompts/get`

So the server advertises **tools only — zero resources, zero prompts**. If a
client asks for resources, there is no answer.

### Two entries, identical mounts
| Entry | Purpose |
|---|---|
| `src/index.ts` | HTTP server |
| `src/stdio.ts` | stdio transport, **implicit admin identity** for local desktop clients |

Both mount `mcp.ts` at `/mcp`, `dashboard.ts` at `/api/dashboard/mcp`, and
`admin.ts` at `/api/admin/mcp` — the same three paths `backend/src/server.js`
uses. Whichever entry point is running, the URLs are identical.

### Authentication
`middleware/auth.ts` accepts the API key three ways, for clients that cannot set
headers:
```
Authorization: Bearer uh_live_…      (preferred)
?key=uh_live_…
x-api-key: uh_live_…
```
Keys are stored as **SHA-256 hashes** in MongoDB `mcp_api_keys`; the plaintext is
returned exactly once at creation and never persisted.

**Rejections return HTTP 200 with a JSON-RPC error envelope** (`-32001` auth,
`-32003` internal/timeout) rather than 401, so that clients surface a readable
message instead of a transport error. This is deliberate — but it means HTTP
status cannot be used to detect MCP auth failure.

DB calls are wrapped in a **7-second timeout** to survive Render cold starts.
Tier comes from Firebase with a FREE fallback.

### Data
`mcp-server/src/data/` is **generated**, not hand-maintained:
| File | Contents |
|---|---|
| `components.ts` | 137-entry catalog: `CATEGORY_MAP`, `DEPENDENCIES_MAP`, `PREMIUM_IDS`, `CATEGORY_DESCRIPTIONS` |
| `sourceCode.json` | 148 source payloads |
| `premiumComponents.json` | 41 premium ids |
| `templates.json`, `templateSourceCode.json`, `aiPrompts.json`, `componentVibePrompts.json`, `componentMetadata.json` | template + prompt catalogs |

Regenerate with `npm run sync:data` → `scripts/sync-frontend-data.mjs`.

### Build coupling — the sharpest edge in the system
```
backend/src/server.js  ──await import()──►  mcp-server/dist/routes/mcp.js
```
`mcp-server/dist` is **committed to git** (`.gitignore` has `dist/` then
explicitly un-ignores `!mcp-server/dist/**`). Consequences:

1. `npm run build` in `mcp-server` must run **before** the backend starts.
   `backend/package.json` handles this via `postinstall` and its `build` script,
   and `render.yaml` orders it explicitly.
2. **Editing MCP source without rebuilding leaves production running the old
   code.** Nothing detects this at runtime. `check-source-coverage.mjs` runs during
   build but only checks that premium components have source — it is not a
   freshness check against `src/`.

**Whether the currently committed `dist` matches `src` is `UNKNOWN`** — a fresh
build diff was not performed in Phase 1.

---

## 5. Data architecture

See `../data/DATA_OVERVIEW.md` for collections and storage. Architecture-level
summary:

| Concern | System | Notes |
|---|---|---|
| Primary records | **MongoDB** | Backend and MCP server have **separate** service modules but the same database (`MONGODB_DB`). |
| Identity | **Firebase Auth** | Token verification only. Not the record store. |
| Firestore | **legacy** | Appears only in `initFirestore.js` and `migrateFirestoreToMongo.js`. The frontend does not import `firebase/firestore` at all. |
| Rate limits | **Redis** | Counters only, via `ioredis` + `@upstash/redis`. |
| Binary assets | **static filesystem** | `frontend/public/`, served by Vercel. No S3, no Cloudinary. |

The premium component id list is triplicated and must be kept in sync manually:

| File | Role |
|---|---|
| `backend/src/config/premiumComponents.js` | server authority (41 ids) |
| `frontend/src/data/premiumComponents.ts` | hand-maintained mirror, per its own header comment (41) |
| `mcp-server/src/data/premiumComponents.json` | generated; read by `check-source-coverage.mjs` (41) |

All three agree today. Documentation claiming 43 is wrong.

---

## 6. Authentication architecture

| Concern | Mechanism | Files |
|---|---|---|
| User identity | Firebase Auth, `browserLocalPersistence` | `frontend/src/lib/firebase.ts`, `context/AuthContext.tsx` |
| User session | Firebase ID token, `Authorization: Bearer` | attached by the frontend service/util layer |
| Token verification | `verifyToken` middleware | `backend/src/middleware/auth.js` |
| MCP client identity | SHA-256-hashed API keys | `mcp-server/src/middleware/auth.ts`, `services/apiKeyService.ts` |
| Dashboard API | Firebase ID token | `mcp-server/src/middleware/dashboardAuth.ts` |
| Admin API | Firebase ID token + `MCP_ADMIN_EMAILS` allow-list | `mcp-server/src/middleware/requireAdmin.ts` |
| Frontend admin guard | `AdminGuard` — also calls `getAdminStatus()` | `frontend/src/pages/Admin/AdminGuard.tsx` |

Two independent admin checks exist (client route guard, server `requireAdmin`).
The server one is the real control.

**Gap:** `/dashboard/*` has **no route guard**. `DashboardLayout.tsx` performs no
auth check, so `/dashboard/mcp` and `/dashboard/collections` mount for anonymous
visitors and rely on the API returning 401. `MCPPage` handles that case; nothing
in the router does. `confidence: high`

**Gap:** three hardcoded email addresses in `AuthContext.tsx` bypass category and
component access checks in the UI, and one forces `isPro`. Client-side only.
Server-side enforcement is unaffected. Tracked as `RISK-04`, **not modified**.

---

## 7. Storage architecture

| Kind | Location | Notes |
|---|---|---|
| Component/template source | Bundled **in the JS** as TS string modules and JSON | `data/embeddedSourceCode.ts` (85 entries), `data/componentFullSources.ts` (2), `data/templateSourceCode.ts` (19 `?raw` imports), plus the backend and MCP equivalents. Not fetched from a database. |
| Images, models, video | `frontend/public/` | ~300 sprite PNGs, `.glb` models, `.webm` previews. Some models are **duplicated** across `public/models/` and `public/assets/cloud-scroll/models/`. |
| Vendored third-party site | `frontend/public/assets/Cloud scroll/mohitvirli.github.io-master/` | A full port, also present as source under `components/ui/CloudScroll/`. |
| Announcement artefacts | `backend/tmp`, `backend/email-previews` | Written by `scripts/announcement/`. |
| Community uploads | `UNKNOWN` | `GET /v1/components/community` reads them, but the upload path was not located in Phase 1. |

**S3: not used. Cloudinary: not used.**

---

## 8. External services

| Provider | Role | Config location |
|---|---|---|
| Firebase | Auth both sides; Analytics client-side | `VITE_FIREBASE_*` (frontend), `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY` / `FIREBASE_PROJECT_ID` (backend + MCP) |
| MongoDB Atlas | Primary database | `MONGODB_URI`, `MONGODB_DB` |
| Razorpay | Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (backend), `VITE_RAZORPAY_KEY_ID` (frontend, example only) |
| Brevo | Email | `BREVO_API_KEY`, `BREVO_SENDER_EMAIL`, `BREVO_SENDER_NAME` |
| Upstash Redis | Rate limits | `REDIS_URL` |
| Vercel | Frontend + serverless function | `vercel.json` |
| Render | Backend + MCP web service | `render.yaml` |
| Google gtag | Web analytics, Consent Mode v2 | measurement id in `frontend/index.html` (public identifier) |
| Web Push / VAPID | Browser push | `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |

Env var **names only** — no values are recorded in this tree.

---

## 9. Deployment architecture

Two targets. Full detail in `../infrastructure/INFRASTRUCTURE.md`.

| | Frontend | Backend + MCP |
|---|---|---|
| Platform | Vercel | Render (`ui-hub-backend-mcp`, starter, oregon) |
| Build | `npm install && cd frontend && npm install && npm run build` | `cd mcp-server && npm install && npm run build && cd ../backend && npm install` |
| Run | static from `frontend/dist` | `cd backend && npm start` |
| API | `/api/*` → `api/index.js` (serverless, `includeFiles: backend/**`, `maxDuration: 30`) | same app in-process |
| Health | — | `GET /health` |

`vercel.json` also sets `Cross-Origin-Opener-Policy: same-origin-allow-popups`,
which exists to make Firebase's Google popup sign-in work.

---

## 10. Major flows

### 10.1 Catalogue → client
Static data modules are bundled and lazily imported. **No API call** is involved
in loading the component or template catalogue. The backend is consulted only for
premium source, vibe prompts and entitlements.

### 10.2 Entitlement read (the hottest path)
```
AuthContext mounts / user signs in
  → onAuthStateChanged
  → POST /api/v1/users/sync            once per session
  → GET  /api/v1/users/status          entitlements
  → localStorage mirror
  → also re-run on window focus / visibilitychange (30s throttle)
```
`GET /users/status` is called from exactly two places: `AuthContext.tsx:136` and
`LibraryPage/sections/ComponentDetail/index.tsx:1065`.

### 10.3 Component code delivery
```
utils/codeUtils.getComponentCode(id, { lang, styling })
  resolution order:
    1. COMPONENT_FULL_SOURCES     (data/componentFullSources.ts — 2 entries)
    2. EMBEDDED_SOURCE_CODE      (data/embeddedSourceCode.ts  — 85 entries)
    3. individual *Source string modules (haulFooterSource, soraFooterSource, …)
    4. isPremiumComponentId(id)  → decide local vs. server
    5. GET /api/v1/components/:id/source   (verifyToken + sourceLimiter)
  → withUiHubBranding() wraps the result
```
Steps 1–4 are entirely client-side. The network fetch is the **last** resort,
not the normal path.

### 10.4 AI vibe prompt delivery
```
utils/promptUtils.fetchVibePrompt(id, system)
  1. if id ∈ LOCAL_ONLY_COMPONENTS (30 hardcoded ids) → return local prompt
  2. GET /api/v1/components/:id/prompt/:system   (optional auth, 3.5s timeout)
  3. on 403 (TRIAL_LIMIT | AUTH_REQUIRED) → surface the block,
     do NOT silently fall back to a local prompt
  4. fall back to getFallbackVibePrompt() for non-premium tools only
```
Systems: `lovable` (free) · `advance` · `antigravity` · `claude` · `cursor` (Pro,
24h trial window). **The backend is authoritative for trials** — step 3 exists
specifically so a client cannot bypass the limit by degrading gracefully.

### 10.5 Payment
See `../AGENT.md` §"Important workflows" 4.3 and `../APIs/API_OVERVIEW.md` §5.
The load-bearing rule: **signature verification is server-side and uses
`timingSafeEqual`.** The client never decides whether a payment succeeded.

### 10.6 MCP request
```
POST /mcp   Authorization: Bearer uh_live_…
  → middleware/auth.ts   SHA-256 lookup in mcp_api_keys, 7s DB timeout
  → rate limit by tier   (FREE 100 / PRO 10000)
  → JSON-RPC dispatch    initialize | ping | tools/list | tools/call
  → services/componentService.ts reads the generated catalogs
  → analyticsService records the call
```

---

## 11. Explicitly unresolved

Marked for later phases, not guessed at.

| Area | Status |
|---|---|
| Detailed dependency graph between modules | `REQUIRES_PHASE_2_ANALYSIS` |
| Component-level intelligence (props, consumers, internals) | `REQUIRES_PHASE_3_ANALYSIS` |
| Full design-system rules | `REQUIRES_PHASE_4_ANALYSIS` |
| Full MongoDB schema | `REQUIRES_PHASE_5_ANALYSIS` |
| Whether committed `mcp-server/dist` matches `src` | `UNKNOWN` |
| Community component upload path | `UNKNOWN` |
| `tailwind.config.ts` inertness at build time | `UNKNOWN` (static evidence: inert) |
| Whether the 5 `.mjs` announcement scripts run in CI or manually | `UNKNOWN` — no CI config found |
| Test-suite pass state | `UNKNOWN` — not executed |

---

## 12. Architectural risks

Ranked. Nothing here was changed in Phase 1.

| # | Risk | Consequence |
|---|---|---|
| 1 | Committed `mcp-server/dist` is load-bearing but can drift silently | Production serves stale MCP code after a source-only change. |
| 2 | CORS allow-list is non-enforcing (`server.js` returns `callback(null, true)` after logging "Blocked origin") | The allow-list provides no protection. |
| 3 | Unauthenticated broadcast + email-test endpoints on `userRoutes` | Anyone who can reach the API can trigger sends. |
| 4 | Triplicated premium id list | Entitlement and unlock logic can disagree between frontend, backend and MCP. |
| 5 | Catalogue triplicated across frontend/backend/MCP | Adding a component is a multi-place edit; the skill in `.agents/skills/` exists to manage this. |
| 6 | No 404 route | Silent empty page on bad URLs. |
| 7 | Offline-first entitlement caching | Revoked access can persist client-side. |
| 8 | `/dashboard/*` unguarded | Mounts for anonymous users; relies on API 401s. |
| 9 | `optionalVerifyToken` duplicated in two route files | Divergent auth behaviour risk if one is edited. |
| 10 | `GET /logs` registered twice in `mcp-server/src/routes/admin.ts` | Second handler is dead code. |

Detail in `../CONFLICTS.md`. Protected areas in `../rules/DO_NOT_CHANGE.md`.
