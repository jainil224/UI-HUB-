# UI HUB — Feature Census

Every major product feature discovered in Phase 1, with evidence-backed status.

**Status values** — `implemented` (works, evidence in code) · `partially-implemented`
(majority present, a piece missing) · `experimental` (early, small, or clearly
provisional) · `orphaned` (code exists, nothing references it) · `UNKNOWN`
(not determinable from the code).

**Confidence** — `high` read directly from source · `medium` inferred from adjacent
evidence · `low` unverified.

> Adding a component? **This is not the file to follow.** Use
> `.agents/skills/ui-hub-component-integration/SKILL.md` — it is the authoritative
> 5-step workflow, including regenerating the AI prompt banks. This file only
> records what currently exists.

---

## Inventory at a glance

| # | Feature | Status | Confidence |
|---|---|---|---|
| 1 | Component Marketplace | implemented | high |
| 2 | Template Marketplace | implemented | high |
| 3 | Build with UI HUB | experimental | high |
| 4 | Live Preview System | implemented | high |
| 5 | Code Delivery & ZIP Download | implemented | high |
| 6 | AI Vibe Prompts | implemented | high |
| 7 | User Authentication | implemented | high |
| 8 | Entitlements & Plans | implemented | high |
| 9 | Payments | implemented | high |
| 10 | Favorites | implemented | high |
| 11 | Collections | implemented | high |
| 12 | Community Components | partially-implemented | medium |
| 13 | Search | implemented | high |
| 14 | MCP Server | implemented | high |
| 15 | CLI Client | implemented | high |
| 16 | Admin Console | implemented | high |
| 17 | Push Notifications | implemented | medium |
| 18 | Email & Lifecycle | implemented | medium |
| 19 | Analytics | implemented | high |
| 20 | Cookie Consent | implemented | high |
| 21 | Theming (light/dark) | implemented | high |
| 22 | Announcement Pipeline | experimental | high |

---

## 1. Component Marketplace

| | |
|---|---|
| **Purpose** | Browse, search, preview and copy source for 137 UI components across 13 categories. |
| **Status** | `implemented` · **confidence** `high` |
| **Main pages** | `/library` (`pages/LibraryPage/LibraryPage.tsx`, 759 L) · `/demo/*` (20 explicit + `/demo/:id`) |
| **Main components** | `LibraryPage.tsx`, `sections/ComponentDetail/index.tsx` (**~2000 L — the richest page in the app**), `HoverPreviewPopover.tsx` (portal-rendered), `sections/GetStarted/*` (4 in-app docs) |
| **Data** | `data/componentData.tsx` — 137 entries, 13 categories, 24 with `isPremium: true` |
| **API** | `GET /v1/components/:id/source` (premium source, `verifyToken`), `POST /v1/components/sync`, `GET /v1/components/:id/prompt/:system` |
| **Notes** | Access is enforced **in-render** via `AuthRequiredModal` + `CheckoutOverlay` and per-tile crown overlays at 3 breakpoints — not by a route guard. Prop metadata exists for only **76 of 137** components. |

### Category breakdown (counted from `componentData.tsx`)

| Category | Count | Category | Count |
|---|---|---|---|
| interactive-background | 23 | loader | 10 |
| text | 17 | footer | 8 |
| button | 15 | navbar | 7 |
| background | 14 | 3d | 6 |
| image-interaction | 12 | scroll | 5 |
| cursor | 12 | form | 4 |
| | | effect | 4 |
| | | **Total** | **137** |

---

## 2. Template Marketplace

| | |
|---|---|
| **Purpose** | Browse 19 website-section templates, preview them full-page, read their source, see what they are built from. |
| **Status** | `implemented` · **confidence** `high` |
| **Main pages** | `/templates` · `/templates/:id` (`TemplateDetailPage.tsx`, 359 L) |
| **Main components** | `components/templates/` — 19 section components + `registry.ts` + `TemplatePreviewStage.tsx` + `TemplateSimilarRail.tsx` + `TemplatePreview.tsx` + `TemplateCodeViewer.tsx` |
| **Data** | `data/templatesData.ts` — 19 entries. `data/templateSourceCode.ts` — 19 `?raw` imports. |
| **Categories** | 4 real (`SaaS & AI`, `Agency & Portfolio`, `E-Commerce`, `Web3 & FinTech`) + an `All` sentinel |
| **Notes** | `TemplatesPage.tsx` is a **12-line re-export** of `HomePage/sections/TemplatesSection.tsx` — the same component serves both routes. The code viewer is lazy-loaded (comment cites a ~3.2 MB saving). `registry.ts` has an entry with no `websiteTemplates` record → **unreachable**. `../CONFLICTS.md` §16. |

---

## 3. Build with UI HUB

| | |
|---|---|
| **Purpose** | Curated pages that map a template to the exact UI HUB components used to build it. |
| **Status** | `experimental` · **confidence** `high` |
| **Main pages** | `/build-with-ui-hub` · `/build-with-ui-hub/:slug` (340 L) |
| **Data** | `data/buildWithUIHubSlugs.ts` — **2 sections** only (`UIHUB-hero-1` → `originkit-hero-24`, `UIHUB-hero-2` → `visionary-orb-hero`) |
| **Notes** | `BuildWithUIHubPage.tsx` is a 12-line re-export. `TemplateDetailPage` redirects here when the template is a Build-with-UI-HUB one. `SearchBox` uses this map to decide whether a template has a section URL. With 2 of 19 templates mapped, this is early-stage. |

---

## 4. Live Preview System

| | |
|---|---|
| **Purpose** | Render the actual component in-browser so users see what they are buying. |
| **Status** | `implemented` · **confidence** `high` |
| **Mechanism** | Every `componentData.tsx` entry has an inline `preview: () => <XPreview />`. Demos live in `components/ui/`, `components/animations/`, `components/templates/`. |
| **Scaling** | `ScaledTemplateScene` + `TemplatePreviewStage` scale template scenes to their container. `TEMPLATE_PREVIEW_BGS` gives each template its own background class. |
| **Hover** | `LibraryPage/HoverPreviewPopover.tsx` uses `createPortal`; content-sized categories (buttons, marquees, images) get different treatment from full-bleed ones. |
| **Chunk strategy** | `utils/prefetchUtils.ts` — `PREFETCH_MAP` with ~70 hover/focus loaders plus prefix heuristics for `text-*` and `effect-*`, guarded by a module-level Set. |
| **Dedicated harness** | `/preview-capture` (`PreviewCapturePage.tsx`) — accepts `?ids=a,b,c`, defaults to all `interactive-background` items, forces a `#0A0A0A` body. Drives `scripts/announcement/capture-previews.mjs`. Not linked in the UI. |

---

## 5. Code Delivery & ZIP Download

| | |
|---|---|
| **Purpose** | Hand the user real, copyable source — the literal product. |
| **Status** | `implemented` · **confidence** `high` |
| **Main** | `utils/codeUtils.ts` (1106 L) — `getComponentCode(id, { lang: 'js'\|'ts'\|'html', styling: 'tailwind'\|'css' })` |
| **Resolution order** | 1. `COMPONENT_FULL_SOURCES` (2) → 2. `EMBEDDED_SOURCE_CODE` (85) → 3. individual `*Source` string modules → 4. `isPremiumComponentId()` gate → 5. **`GET /v1/components/:id/source`** |
| **Key fact** | Steps 1–4 are entirely client-side. The network fetch is the **last** resort, not the normal path. |
| **Branding** | `withUiHubBranding(code, id, html?)` wraps output before display. |
| **ZIP** | `utils/zipUtils.ts` — JSZip; fetches each public asset blob into the archive. Premium only. |
| **Highlighting** | `utils/codeHighlighter.ts` — shiki, lazily importing `shiki/core`, `engine/javascript`, `themes/dark-plus.mjs` and 9 language modules. |

---

## 6. AI Vibe Prompts

| | |
|---|---|
| **Purpose** | A per-component, per-AI-tool prompt that makes an agent reproduce that specific component. The product's differentiator. |
| **Status** | `implemented` · **confidence** `high` |
| **Main** | `utils/promptUtils.ts` (440 L) — `AISystem` = `lovable` \| `advance` \| `antigravity` \| `claude` \| `cursor` |
| **Tiers** | `lovable` free. The other four are **Pro-only** with a 24-hour free-trial window. `PRO_ONLY_TOOLS` + `trialBlocked` in `ComponentDetail`. |
| **Data** | `data/lovablePrompts.ts` (9), `data/antigravityPrompts.ts` (9), `data/claudePrompts.ts` (10, **orphaned**), `mcp-server/src/data/aiPrompts.json`, `componentVibePrompts.json` |
| **Backend-authoritative** | A `403` (`TRIAL_LIMIT` / `AUTH_REQUIRED`) surfaces as a **block** — the client deliberately does *not* degrade to a local prompt. 30 ids in `LOCAL_ONLY_COMPONENTS` bypass the backend entirely. 3.5s timeout. |
| **Template variant** | `utils/templatePromptUtils.ts` builds template-level prompts from `TEMPLATE_SOURCE_CODE`. |
| **Regeneration** | When adding a component, all 5 prompt banks must be updated. The integration skill owns this workflow. |

---

## 7. User Authentication

| | |
|---|---|
| **Purpose** | Email/password and Google sign-in. |
| **Status** | `implemented` · **confidence** `high` |
| **Pages** | `/login` · `/signup` · `/forgot-password` |
| **Mechanism** | Firebase Auth, `browserLocalPersistence` (`frontend/src/lib/firebase.ts`). `signInWithPopup` + `GoogleAuthProvider` for Google. `getRedirectResult` handles the popup return. |
| **Session** | Firebase ID token, attached as `Authorization: Bearer` by the service/util layer. `getIdToken()` (cached) for reads, `getIdToken(true)` (forced) after sign-in. |
| **Backend** | `verifyToken` in `backend/src/middleware/auth.js` (Firebase Admin). |
| **Sync** | `POST /v1/users/sync` once per session, then `GET /v1/users/status`. |
| **Welcome** | Server-authoritative; falls back to comparing `creationTime` with `lastSignInTime` within 5s if sync failed. |
| **Cross-site** | `vercel.json` sets `Cross-Origin-Opener-Policy: same-origin-allow-popups` so the Google popup survives. |

---

## 8. Entitlements & Plans

| | |
|---|---|
| **Purpose** | Decide what a user may see, copy and download. |
| **Status** | `implemented` · **confidence** `high` |
| **Tiers** | `free` · `pro` · `custom` (`PlanTier` in `PlanBadge.tsx`) |
| **Mechanisms** | `hasCategoryAccess(cat)` — custom tier gets `selectedCategories`; pro gets all; free gets none. `hasComponentAccess(id)` — pro, or `purchasedComponents.includes(id)`. |
| **Storage** | Server is authoritative. `GET /v1/users/status` is the only source; `AuthContext` mirrors to `localStorage` (`ui-hub-pro`, `ui-hub-plan-type`, `ui-hub-selected-categories`, `ui-hub-purchased-components`). |
| **Refresh** | On auth-state change, on window `focus`, on `visibilitychange` — 30s budget. |
| **Known behaviour** | On **network failure** the cached values are **preserved** rather than cleared (offline-first). `RISK-10`. |
| **Pricing cards** | `CustomPricingCard.tsx` hardcodes `CATEGORIES` with an explicit `premiumComponents: string[]` per category — a **fourth** place premium ids live. |

---

## 9. Payments

| | |
|---|---|
| **Purpose** | Sell Pro plans and individual components. |
| **Status** | `implemented` · **confidence** `high` |
| **Provider** | Razorpay |
| **Page** | `/pricing` (504 L) |
| **Client** | `utils/checkout.ts` (`useRazorpayCheckout`), `utils/razorpayUtils.ts` (idempotent script tag) |
| **Server** | `routes/paymentRoutes.js` · `controllers/paymentController.js` · `controllers/webhookController.js` · `utils/verifySignature.js` |
| **Prices** | Per component `{ usd: 1.99, inr: 49 }`. Plans: `planId`/`tier` are validated to **`pro` only**; currency to `INR` or `USD` only. |
| **Free tier** | `POST /v1/users/activate-free` — self-service activation, `verifyToken`. |
| **Detail** | `../APIs/API_OVERVIEW.md` §5. **Protected — see `../rules/DO_NOT_CHANGE.md`.** |

---

## 10. Favorites

| | |
|---|---|
| **Purpose** | Save components for later. |
| **Status** | `implemented` · **confidence** `high` |
| **Page** | `/favorites` (`Dashboard/FavoritesPage.tsx`, 320 L) |
| **Service** | `services/favorites.ts` (184 L) — local-first: writes to `localStorage` (`ui_hub_guest_favorites`) first, reconciles with the backend, polls, and listens for cross-tab `storage` events. |
| **API** | `GET` / `POST` `/v1/favorites`, `DELETE` `/v1/favorites/:componentId` — all `verifyToken`. |
| **Cap** | Free users are capped at 5 favourites (enforced in `ComponentDetail`). |

---

## 11. Collections

| | |
|---|---|
| **Purpose** | Named, server-persisted user groupings of components. |
| **Status** | `implemented` · **confidence** `high` |
| **Page** | `/dashboard/collections` (720 L) |
| **Service** | `services/collections.ts` (124 L) — throws a custom `CollectionsError` carrying `code` and `status`. |
| **API** | 7 endpoints, all `verifyToken`: `GET`/`POST /v1/collections`, `GET`/`PATCH`/`DELETE /v1/collections/:collectionId`, `POST` `…/items`, `DELETE …/items/:componentId`. |
| **Extras** | Drag-to-add, merge with community components, per-item premium unlock via code or Pro. |
| **Note** | Reuses `Dashboard/components/ComponentPreviewTile.tsx`. |

---

## 12. Community Components

| | |
|---|---|
| **Purpose** | Surface user-uploaded components alongside the curated catalogue. |
| **Status** | `partially-implemented` · **confidence** `medium` |
| **Service** | `services/community.tsx` |
| **API** | `GET /v1/components/community`, `GET /v1/components/community/:id` — both **public** |
| **Read path** | `DemoPage` resolves `:id` against `componentList` first, then falls back to `getCommunityComponent(id)`, wrapped in a local `DemoErrorBoundary`. `FavoritesPage` and `CollectionsPage` also merge community entries for lookup. |
| **Gap** | **The upload path was not located in Phase 1.** Reading works; how content gets in is `UNKNOWN`. This is why confidence is `medium`, not `high`. |

---

## 13. Search

| | |
|---|---|
| **Purpose** | One search across components and templates. |
| **Status** | `implemented` · **confidence** `high` |
| **Main** | `utils/searchIndex.ts` — `searchEverything(query, { componentLimit: 6, templateLimit: 4 })` |
| **Scoring ladder** | title-starts-with 120 → title-contains 90 → category-starts-with 70 → category-contains 60 → description/extras 50 |
| **Performance** | Both catalogues are `import()`ed lazily and memoised, keeping ~1.6 MB out of first paint. |
| **Presentation** | `components/ui/SearchBox.tsx`; 13 per-category accent colours in `COMPONENT_CATEGORY_COLORS`. |
| **Surfaces** | Global (Navbar) and section-level (HomePage hero). |

---

## 14. MCP Server

| | |
|---|---|
| **Purpose** | Let AI coding agents search the catalogue and pull real source instead of hallucinating. |
| **Status** | `implemented` · **confidence** `high` |
| **Server** | `mcp-server/src/routes/mcp.ts` — JSON-RPC 2.0, protocol `2025-06-18`, **hand-implemented** (no official SDK) |
| **Methods** | `initialize` · `ping` · `tools/list` · `tools/call`. **No `resources/*` or `prompts/*`.** |
| **Tools** | **14** — `search_components`, `get_component`, `get_component_code`, `search_templates`, `get_template`, `search_animations`, `get_animation_code`, `list_categories`, `get_dependencies`, `get_component_metadata`, `search_by_behavior`, `get_ai_prompts`, `get_template_source`, `list_all_components` |
| **Data** | `mcp-server/src/data/` — generated. `components.ts` (137), `sourceCode.json` (148), `premiumComponents.json` (41), + 5 more. |
| **Auth** | `Authorization: Bearer uh_live_…` (+ `?key=`, `x-api-key`). SHA-256 hashed in MongoDB. Rejections return **HTTP 200** with a JSON-RPC error envelope, not 401. |
| **Rate limits** | FREE 100 / PRO 10000 (`MCP_RATE_LIMIT_FREE` / `_PRO`) |
| **User surface** | `/dashboard/mcp` (`MCPPage.tsx`, 818 L) — endpoint + header instructions, tier, key CRUD, usage stats. |
| **Detail** | `../APIs/API_OVERVIEW.md` §6. |

---

## 15. CLI Client

| | |
|---|---|
| **Purpose** | The same MCP access from a terminal. |
| **Status** | `implemented` · **confidence** `high` |
| **Commands** | **14** — `login` `logout` `config` `search` `show` `code` `deps` `categories` `prompt` `template` `animation` `behavior` `use` `whoami` |
| **Dependencies** | **Zero runtime deps.** devDeps only: `typescript`, `tsx`, `@types/node`. |
| **Transport** | MCP over HTTP. **Does not call the REST backend.** |
| **Auth** | Only `login`, `config`, `logout` work unauthenticated; everything else exits `3`. |
| **Config precedence** | flags → `UI_HUB_ENDPOINT` / `UI_HUB_API_KEY` → user config dir → project `.ui-hubrc.json` (API key deliberately excluded). |
| **Default endpoint** | `https://ui-hub-mcp.onrender.com/mcp` |
| **Docs** | `docs/cli.md` is **current**. |

---

## 16. Admin Console

| | |
|---|---|
| **Purpose** | Operate the MCP layer as a business. Not a general CMS. |
| **Status** | `implemented` · **confidence** `high` |
| **Route** | `/admin/mcp/*` — **there is no `/admin` route.** |
| **Guard** | `AdminGuard.tsx` → skeleton while loading; `Navigate` to `/login` if no user; `getAdminStatus()`; 403 screen; unreachable screen. |
| **Server guard** | `requireAdmin` — Firebase ID token + email in `MCP_ADMIN_EMAILS`. **This is the real control.** |
| **Layout** | `AdminLayout.tsx` (194 L) — 15-item sidebar |
| **Pages** | **16** — overview · analytics · tools · playground · components · search · users · users/:uid · api-keys · logs · security · health · alerts · settings · audit · export |
| **Shared kit** | `components/admin/AdminUi.tsx` — `Panel` `PanelHeader` `PageHeader` `StatCard` `EmptyState` `ErrorState` `SkeletonBlock` `SkeletonTable` `Table` `Th` `Td` `Pagination` `StatusBadge` `toneFor` + formatters (`formatCompact` `formatNum` `formatMs` `formatPct` `formatDate` `timeAgo` `keyPrefixMask`). `Charts.tsx` wraps Recharts. |
| **Shared hook** | `useData<T>(loader, deps, { intervalMs })` — fetch + loading + error + reload + optional polling. **Every** admin page uses it. |
| **Client** | `services/admin.ts` (571 L) — 24 endpoints, TTL caches, one retry on 502/504, `FORBIDDEN`/`UNAUTHORIZED` mapped to friendly messages. |
| **Known issue** | `GET /logs` is registered twice in `mcp-server/src/routes/admin.ts`; the first handler wins. `../CONFLICTS.md` §27. |

---

## 17. Push Notifications

| | |
|---|---|
| **Purpose** | Reach users with announcements. |
| **Status** | `implemented` · **confidence** `medium` |
| **Frontend** | `utils/pushService.ts` — SW registration, VAPID public-key fetch, subscribe. `PushNotificationPrompt.tsx` — one-time opt-in, marker `ui-hub-push-prompt-{uid}`. `public/sw.js`. |
| **Backend** | `services/pushService.js` (web-push / VAPID) |
| **API** | `GET /v1/config/push-vapid` (public) · `POST /v1/users/push-subscribe` (`verifyToken`) · **`POST /v1/users/push-broadcast` (NO auth — `RISK-02`)** |
| **Why `medium`** | The subscribe path is clear; the broadcast endpoint is reachable without a token, so the feature's access control is not established. |

---

## 18. Email & Lifecycle

| | |
|---|---|
| **Purpose** | Welcome, re-engagement and announcement email. |
| **Status** | `implemented` · **confidence** `medium` |
| **Service** | `services/brevoService.js` (primary), `services/emailLogService.js`, `utils/sendEmail.js` (Brevo + Nodemailer SMTP + Resend fallback) |
| **Templates** | `backend/src/emailTemplates/` |
| **Receipts** | `services/receiptService.js` + PDFKit |
| **API** | `GET /v1/users/check` · `POST /v1/users/welcome-shown` (`verifyToken`) · `POST /v1/users/activity` (optional token, `keepalive: true`) |
| **Concern** | 7 endpoints under `/v1/users` are unauthenticated: `email-test`, `free-email-test`, `pro-email-test`, `reengagement-email-test`, `broadcast-reengagement`, `broadcast-announcement`, `push-broadcast`. `RISK-02`. |
| **Pipeline** | `scripts/announcement/` — see §22. |
| **Why `medium`** | Flow is clear; the operational scripts are numerous and were not all traced. |

---

## 19. Analytics

| | |
|---|---|
| **Purpose** | Measure usage. |
| **Status** | `implemented` · **confidence** `high` |
| **Stack A** | Firebase Analytics (`lib/firebase.ts`) — consent-gated; deliberately **skipped on mobile** via a user-agent regex (a documented workaround for Android's "wants to access other apps" prompt). |
| **Stack B** | Google gtag.js in `index.html` — **Consent Mode v2**, all `analytics_storage`/`ad_storage`/`ad_user_data`/`ad_personalization` defaults set to **`denied`**. |
| **Coordination** | `CookieConsentContext` drives both: `acceptAll` enables, `rejectNonEssential` disables, `enableAnalytics()` / `disableAnalytics()` gate stack A. |
| **Server-side** | `POST /v1/users/activity` (optional token, `keepalive: true`) + MCP `analyticsService` for MCP request analytics. |
| **Admin view** | `/admin/mcp/analytics`, `/admin/mcp/search` (search analytics). |
| **Note** | Two parallel analytics stacks coexist. Intentional, not accidental — but worth knowing before adding a third. |

---

## 20. Cookie Consent

| | |
|---|---|
| **Purpose** | GDPR-style granular consent, driving both analytics stacks. |
| **Status** | `implemented` · **confidence** `high` |
| **Context** | `context/CookieConsentContext.tsx` — `status` `prefs` `showBanner` `acceptAll` `rejectNonEssential` `savePreference` `resetPreference` |
| **UI** | `CookieBanner.tsx`, `/cookies` → `CookieSettingsPage.tsx` |
| **Storage** | `utils/cookieUtils.ts` — `ui_hub_cookie_consent`, `ui_hub_cookie_prefs`, 365 days, `SameSite=Lax`. **No `Secure` flag.** |
| **Always mounted** | `CookieBanner` renders in `AppShell` on every route. |

---

## 21. Theming

| | |
|---|---|
| **Purpose** | Light/dark toggle. |
| **Status** | `implemented` · **confidence** `high` |
| **Context** | `context/ThemeContext.tsx` — `theme`, `toggleTheme`. Throws outside its provider. |
| **Storage** | `localStorage` key `theme`, default `dark`. |
| **Tokens** | `index.css` — `@theme` block (L206-220) + mirrored `:root` / `:root.light` (L154-203). |
| **Applied in** | `AppShell` — `isDemo` forces `bg-neutral-950`; `dark` → `bg-brand-black`; light → `bg-[#CFE6F7] text-[#0A0F14]`. |
| **Hard pin** | `index.css:150-152` forces `html { background-color: #0A0A0A }` with a documented reason: the footer is always dark, so light-theme overscroll would otherwise show through. |
| **Separate store** | `CloudScroll/stores/themeStore.ts` — its own persisted Zustand store, key `theme-storage`. Independent of the app theme. |
| **Detail** | `../design-system/DESIGN_SYSTEM.md`. |

---

## 22. Announcement Pipeline

| | |
|---|---|
| **Purpose** | Produce the marketing artefacts for a component launch. |
| **Status** | `experimental` · **confidence** `high` |
| **Scripts** | `scripts/announcement/` — 5 `.mjs`: `capture-previews.mjs` (Playwright) · `check-png.mjs` (blank-output detection) · `generate-manifest.mjs` (→ `backend/src/data/announcementManifest.json`) · `build-banner.mjs` (GIF via `gifenc`+`pngjs`) · `preview-screenshot.mjs` |
| **Coupling** | Depends on `/preview-capture` and on the frontend + MCP data files staying in sync. |
| **Why `experimental`** | No CI config exists in the repository, so these are **manual** steps. Whether they run in any automation is `UNKNOWN`. |
| **Correction** | `README.md` documents 7 `.py` scripts for this. **There are no Python files in the repository.** `../CONFLICTS.md` §7. |

---

## Not a feature, but load-bearing

| Concern | Where | Note |
|---|---|---|
| Runtime config distribution | `GET /v1/config/{firebase,razorpay-key,push-vapid}` | Lets the frontend fetch publishable keys without a rebuild. **The `firebase` response is currently fetched and discarded** (`main.tsx:37-49`). `RISK-03`. |
| Background component sync | `utils/componentSync.ts` + `triggerBackgroundComponentSync()` in `AppShell` | `POST /v1/components/sync`, throttled to 1×/hour via `ui-hub-components-synced-ts`. **Unauthenticated.** |
| Health checks | `GET /health`, `GET /api/health` | Identical payload, `backend: online`, `mcp: online`. Used by Render. |
| Lazy loading strategy | `App.tsx` + `prefetchUtils.ts` | Everything is `React.lazy` behind one `Suspense`. |
