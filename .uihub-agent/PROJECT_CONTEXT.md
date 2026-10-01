# UI HUB — Project Context

High-level orientation. For exact paths and counts read `PROJECT_MAP.json`.
For rules read `AGENT.md`.

**Confidence legend** — `high` read directly from source · `medium` inferred ·
`low` unverified · `UNKNOWN` not determinable from the code.

---

## 1. What UI HUB actually does

UI HUB is a **marketplace and distribution layer for reusable UI code, aimed at
people building with AI coding agents.**

The core insight in the product: a developer using an agent like Lovable, Cursor,
Claude Code or Antigravity can get UI from a prompt — but the result is generic
and unrepeatable. UI HUB instead maintains a hand-curated catalogue of 137
components and 19 website-section templates, and serves the exact source code for
them through three channels:

1. **Web UI** — browse, live-preview, tune props, copy code, copy a tailored
   "vibe prompt" written for a specific AI tool.
2. **MCP server** — 14 JSON-RPC tools so an agent can search the catalogue and
   pull real source rather than hallucinating a similar component.
3. **CLI** — the same thing from a terminal.

Monetisation is free / pro / custom tiers plus individual component purchases via
Razorpay. A 16-page admin console operates the MCP layer specifically — it is an
operations tool for the API-key business, not a general CMS.

**Primary users:** developers working inside AI coding tools; frontend and design
engineers; the site owner operating the MCP service.

**Confidence: high.**

### What it is not

- Not a general-purpose component library — there is no published npm package.
- Not a general CMS — the admin area covers MCP operations only.
- Not a multi-tenant SaaS. It is one catalogue, one owner, monetised per user.

---

## 2. The major systems

| System | Where | What it does |
|---|---|---|
| **Catalogue** | `frontend/src/data/` | The static source of truth for what exists: components, templates, prompts, embedded source, premium list, prop metadata. |
| **Storefront** | `frontend/src/pages/` + `components/` | Browsing, preview, search, code delivery, checkout. |
| **REST API** | `backend/src/` | Users, entitlements, favorites, collections, payment, email, push, runtime config. |
| **MCP layer** | `mcp-server/src/` | JSON-RPC tool server + user dashboard API + admin API. |
| **CLI** | `cli/src/` | Terminal MCP client. |
| **Design language** | `frontend/src/index.css` | Tokens and a neo-brutalist component layer, all in CSS-first Tailwind v4. |
| **Ops** | `vercel.json`, `render.yaml` | Two deployment targets. |

The single most important structural fact: **the catalogue is duplicated across
three places** — the frontend data modules, the MCP generated data, and the
backend premium config. They are kept in sync by a script plus manual editing,
not by a single source. Changing a component id means changing it in all of them.

---

## 3. Broad organisation

```
UI-HUB/
├── frontend/          Vite + React 19 SPA          (product UI)
│   └── src/
│       ├── App.tsx        ALL 62 routes live here
│       ├── main.tsx       entry, Firebase init
│       ├── index.css      design tokens (Tailwind v4 @theme)
│       ├── data/          catalogues + embedded source  (largest files)
│       ├── pages/         one dir per route area
│       ├── components/    ui · animations · templates · admin
│       ├── context/       Auth · Theme · CookieConsent · Skeleton
│       ├── services/      API clients
│       ├── utils/         apiConfig · checkout · codeUtils · promptUtils · search
│       └── lib/           firebase init, cn()
├── backend/           Express 4 REST API          (plain JS ESM)
│   └── src/  server.js · routes/ · services/ · middleware/ · utils/ · config/ · data/ · scripts/
├── mcp-server/        TypeScript MCP server       (protocol hand-rolled)
│   └── src/  index.ts · stdio.ts · routes/ · tools/ · middleware/ · services/ · data/
├── cli/               Zero-dependency Node CLI
├── api/index.js       Vercel serverless wrapper → backend/src/server.js
├── scripts/announcement/   5 .mjs scripts
├── docs/              3 files (see CONFLICTS.md — all have drift)
├── component-specs/   local design specs (gitignored)
└── .agents/skills/    3 existing agent skills (gitignored, local only)
```

Full detail in `codebase/DIRECTORY_MAP.md`.

---

## 4. The important workflows

### 4.1 Sign in and gain entitlements

```
/login  →  firebase/auth  (email+password, or Google popup)
        →  AuthContext: getRedirectResult, then onAuthStateChanged
        →  POST /api/v1/users/sync          (once per session)
        →  GET  /api/v1/users/status        (entitlements)
        →  localStorage mirror:
             ui-hub-pro, ui-hub-plan-type,
             ui-hub-selected-categories, ui-hub-purchased-components
```

Two behaviours worth knowing before you touch this:

- **Network failure preserves cached entitlements** rather than clearing them.
  Deliberate offline-first behaviour; the consequence is that a revoked
  entitlement can persist in the browser. `RISK-10`.
- **The localStorage mirror is a cache, not an authority.** The server decides.
  Three hardcoded emails additionally bypass access checks in the UI.
  `RISK-04`.

Entitlements re-fetch on window `focus` and `visibilitychange`, throttled to 30s.

### 4.2 Browse and copy a component

```
/library
  → componentList (137 entries, data/componentData.tsx) — lazily loaded
  → hover → HoverPreviewPopover renders the live preview
  → click → ComponentDetail (the richest page in the app, ~2000 lines)
       → live preview
       → prop controls from COMPONENT_CONFIG (76 of 137 components have metadata)
       → copy code      → utils/codeUtils.getComponentCode()
       → copy vibe prompt → utils/promptUtils.fetchVibePrompt()
             Lovable is free; Advance / Antigravity / Claude / Cursor are
             Pro-only with a 24h free-trial window
       → copy ZIP       → utils/zipUtils (JSZip, fetches each public asset)
       → favourites     → services/favorites (guest localStorage fallback)
```

### 4.3 Buy access

```
/pricing
  → GET  /api/v1/config/razorpay-key      (publishable key)
  → POST /api/v1/payment/create-order     (planId/tier — validated to "pro" only)
  → load https://checkout.razorpay.com/v1/checkout.js
  → POST /api/v1/payment/verify-payment   (Razorpay response)
  → backend HMAC-SHA256 verify, timingSafeEqual
  → entitlement granted server-side
  → GET /api/v1/users/status reflects it
  → AuthContext mirrors it to localStorage
```

Plus `POST /api/v1/payment/webhook` on the **raw** body, registered before
`express.json`. Review before touching — see `rules/DO_NOT_CHANGE.md`.

Per-component purchase: `COMPONENT_PRICE = { usd: 1.99, inr: 49 }` in
`frontend/src/utils/checkout.ts`.

### 4.4 Use UI HUB from an AI coding agent

```
MCP client (Claude Desktop, an agent, or the UI HUB CLI)
  → POST /mcp            Authorization: Bearer uh_live_…   (or ?key=, or x-api-key)
  → key looked up by SHA-256 hash in MongoDB mcp_api_keys
  → JSON-RPC  initialize → tools/list → tools/call
  → 14 tools reading the generated catalogs in mcp-server/src/data/
```

Keys are created at `/dashboard/mcp` (Firebase ID token) and the plaintext is
returned **once**. Rate limits differ by tier (`MCP_RATE_LIMIT_FREE` 100,
`MCP_RATE_LIMIT_PRO` 10000).

### 4.5 Operate the service

```
/admin/mcp/*  →  AdminGuard  →  requireAdmin (email allow-list: MCP_ADMIN_EMAILS)
  → 16 pages: overview, analytics, tools, playground, components, search,
              users, api-keys, logs, security, health, alerts, settings,
              audit, export
```

---

## 5. Current technology stack

Only what is **verified as used in source** is listed. `PROJECT_MAP.json` marks
declared-but-unimported packages as `declared-unused`.

### Frontend — `frontend/`
React 19 · TypeScript 5.8 · Vite 6.2 · React Router 7 · Tailwind CSS v4 (CSS-first
`@theme`, no JS config in effect) · Firebase Auth + Analytics · framer-motion /
`motion` · GSAP + `@gsap/react` · three 0.183 + `@react-three/fiber` +
`@react-three/drei` + `three-stdlib` · Zustand (CloudScroll only) · Recharts
(admin) · Razorpay Checkout.js · JSZip · shiki · lenis · lucide-react ·
react-icons · clsx + tailwind-merge + class-variance-authority · `@radix-ui/react-slot`.

### Backend — `backend/`
Node ESM · Express 4 · MongoDB official driver (no Mongoose) · Firebase Admin ·
Redis via `ioredis` + `@upstash/redis` for rate limits · `razorpay` ·
Helmet · CORS · express-rate-limit · express-validator · Zod · Brevo +
Nodemailer + Resend · web-push · PDFKit.

### MCP server — `mcp-server/`
TypeScript 5.6 → `dist/` · Express 4 · MongoDB · Firebase Admin · Zod · Redis.
**The official `@modelcontextprotocol/sdk` is NOT a dependency.** JSON-RPC 2.0 is
hand-implemented at protocol version `2025-06-18`. Tools only — no `resources/*`
or `prompts/*` methods exist.

### CLI — `cli/`
TypeScript compiled to `dist/`. **Zero runtime dependencies.** Talks MCP, not REST.

### Confirmed not used
`@splinetool/react-spline`, `@splinetool/runtime` (only mentioned inside AI prompt
strings), `simplex-noise`, `unicornstudio-react`, `vite-plugin-mkcert`,
`autoprefixer`, `javascript-obfuscator` (plugin import present, instantiation
commented out).

**Confidence: high.**

---

## 6. Known high-risk areas

Full list in `rules/DO_NOT_CHANGE.md`. Findings in `CONFLICTS.md`. The four that
matter most:

| # | Area | Why |
|---|---|---|
| `RISK-01` | `backend/src/server.js` CORS | The origin callback logs "Blocked origin" and then still returns `callback(null, true)`. The allow-list enforces nothing. |
| `RISK-02` | `backend/src/routes/userRoutes.js` | `POST /v1/users/push-broadcast` has no `verifyToken` — nor do the sibling broadcast and email-test endpoints. |
| `RISK-06` | `.gitignore` / `mcp-server/dist` | Build output is committed and load-bearing at runtime, so it can silently drift from `src/`. The build gate (`check-source-coverage.mjs`) exists but only covers premium source coverage. |
| `RISK-10` | `context/AuthContext.tsx` | Offline-first entitlement caching means a revoked entitlement can persist in the browser. |

Two more that constrain how you work rather than what is broken:

- **The premium component id list exists in three files** that must agree:
  `backend/src/config/premiumComponents.js`, `frontend/src/data/premiumComponents.ts`
  (a hand-maintained mirror by its own header), and
  `mcp-server/src/data/premiumComponents.json`. All three currently hold 41 ids.
  Documentation claiming 43 is wrong.
- **The backend and MCP server deploy as one process.** `backend/src/server.js`
  dynamically `import()`s the MCP routers from the committed
  `mcp-server/dist`. Change MCP source without rebuilding and production keeps
  running the old code. `docs/runbook.md` states the opposite topology.

---

## 7. What is not known

Carried forward from Phase 1. Each needs a deliberate check, not a guess.

1. Test-suite results. No suite was executed. `docs/runbook.md` expects 54/15/30
   tests across MCP/backend/CLI; that is unverified and probably wrong.
2. Whether the committed `mcp-server/dist` matches current `mcp-server/src`. A
   fresh build diff was not performed.
3. Whether `frontend/tailwind.config.ts` is truly ignored. Static evidence says
   yes (Tailwind v4, no `@config`, no PostCSS config) but no build was run.
4. Whether the live `ui-hub-mcp.onrender.com` service serves the current 14 tools.
   Needs a network call.
5. The real MongoDB schema. Collection names are read from service code; there is
   no declared schema.
6. Contents of the large `frontend/public/` trees — sprite frames, `.glb` models,
   `.webm` previews, and a vendored third-party site. Directory names only.
7. Whether `vite-plugin-mkcert` / `autoprefixer` / `javascript-obfuscator` were
   used by some past ad-hoc build. No imports found.

**Confidence: high** that these are open. Do not resolve them by assumption.

---

## 8. Orientation shortcuts

| I want to… | Go to |
|---|---|
| add a route | `frontend/src/App.tsx`, then `codebase/DIRECTORY_MAP.md` § routes |
| add a component to the catalogue | `.agents/skills/uihub-component-integration/SKILL.md` — **not** this tree |
| add an endpoint | `backend/src/routes/`, then `APIs/API_OVERVIEW.md` |
| add an MCP tool | `mcp-server/src/tools/`, register in `tools/index.ts` |
| change a colour or font | `design-system/DESIGN_SYSTEM.md`, then `index.css` |
| deploy | `infrastructure/INFRASTRUCTURE.md` |
| understand why X is broken | `CONFLICTS.md` first — the docs may be lying to you |
