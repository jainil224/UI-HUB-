# UI HUB — Directory Map

What lives where, and why. Read `../architecture/ARCHITECTURE.md` for how the
parts relate. Machine-readable directory census: `../PROJECT_MAP.json → directories`.

**Rule:** do not document every file. Generated output, vendored third-party code
and node_modules are excluded deliberately.

---

## Excluded from this map

| Path | Why |
|---|---|
| `node_modules/**` | Dependencies. 4 separate trees. |
| `dist/`, `build/` | Build output. **Exception:** `mcp-server/dist` is committed and load-bearing — see below. |
| `frontend/public/**` | ~600 static assets: sprite frames, `.glb` models, `.webm` previews, icons, and a **vendored third-party site**. Asset inventory is Phase-2 work. |
| `.agents/`, `component-specs/`, `.claude/`, `.opencode/` | Local-only and **gitignored**. Agent skills and design specs, not application code. |
| `*.md` documentation | Covered by `../CONFLICTS.md` and the documentation audit in `../PROJECT_MAP.json → documentation`. |

---

## Root

| Path | Purpose | Notes |
|---|---|---|
| `package.json` | Monorepo task runner | **Not a workspace root.** No `workspaces` field — each sub-project installs independently. `install-all`, `build:mcp`, `build:backend`, `dev`, `dev:all`, `dev:frontend`, `dev:backend`, `dev:mcp`, `build`, `build:cli`, `test:cli`, `ui-hub`, `cli:dev`, `start`, `sync:components`. Also carries a **duplicated copy of the backend dependency set** — a trap for anyone assuming this is just a task runner. |
| `vercel.json` | Vercel config | `buildCommand`, `outputDirectory: frontend/dist`, `framework: vite`, SPA rewrite, `/api/(.*)` → `/api/index.js`, COOP header, `functions` with `includeFiles: backend/**`. |
| `render.yaml` | Render blueprint | One web service running **backend + MCP together**. Declares every production env var. |
| `api/index.js` | Vercel serverless entry | Two lines: imports the Express app from `backend/src/server.js`, default-exports it. |
| `.vercelignore` | Upload trimming | Excludes local-only dirs. |
| `.gitignore` | Exclusions | Notable: ignores `dist/` then **un-ignores `!mcp-server/dist/**`**; ignores `*.py`; ignores `.agents/` and `component-specs/`. |
| `README.md` | Product + architecture + API | **Materially outdated.** See `../CONFLICTS.md`. |
| `MCP.md` | MCP deep reference | Most accurate doc in the repo. Minor drift. |
| `MCP.md` vs `docs/mcp.md` | Two MCP docs | Different accuracy. `MCP.md` (root) is better. |
| `agent.md` | The ten-phase plan | Phase 1 of 10. Do not edit without being asked. |

---

## `frontend/`

The customer-facing product. Vite + React 19 + TypeScript.

| Path | Purpose | Notes |
|---|---|---|
| `index.html` | HTML shell | Title, OG/Twitter/Schema.org meta, Google site-verification, Google Fonts, gtag.js with **Consent Mode v2 defaults all `denied`**. |
| `vite.config.ts` | Build config | React + `@tailwindcss/vite`, `manualChunks` vendor splitting. The `vite-plugin-javascript-obfuscator` **import** is present but its instantiation is **commented out** — obfuscation is off. |
| `tailwind.config.ts` | Tailwind config | **Likely inert.** Tailwind v4 is loaded via `@import "tailwindcss"` + the Vite plugin; there is no `@config` directive in the CSS and no PostCSS config. Tokens are duplicated in `index.css @theme`, which is the live source. |
| `metadata.json` | Starter metadata | **Stale.** Names Remix and an orange theme. The real app is Vite with a black/blue palette. |
| `.env.example` | Env template | `VITE_API_URL`, `VITE_RAZORPAY_KEY_ID`, `VITE_MCP_API_URL`. No real values. |
| `public/` | Static assets | Large. Duplicated `.glb` models across two subtrees. Vendored third-party site. |
| `scripts/generate-favicons.mjs` | Favicon generation | `npm run favicons`. |
| `src/` | Application source | See below. |

### `frontend/src/`

| Path | Purpose | Key files |
|---|---|---|
| `main.tsx` | Entry | `initFirebase()` with a hardcoded fallback literal; fetches `/api/v1/config/firebase` and **discards** it (re-init commented out). `RISK-03`. |
| `App.tsx` | Router + shell | **All 61 `<Route>` elements.** Provider tree, chrome visibility, `AppShell`, mount-time `triggerBackgroundComponentSync()`. |
| `index.css` | **Design tokens** | Tailwind v4 `@theme` (L206-220), mirrored `:root` / `:root.light` (L154-203), neo-brutalist component layer (L241-449), 48 keyframe groups. See `../design-system/DESIGN_SYSTEM.md`. |
| `Assets/` | Logo | `webiste logo.svg` — filename typo is real. |
| `context/` | Global state | `AuthContext.tsx` (the entitlement authority), `ThemeContext.tsx`, `CookieConsentContext.tsx`, `SkeletonContext.tsx`. |
| `data/` | **Catalogues + embedded source** | Largest files in the app. See table below. |
| `pages/` | Route components | One directory per area. See table below. |
| `components/` | Reusable UI | `ui/` · `animations/` · `templates/` · `admin/`. See table below. |
| `services/` | API clients | `admin.ts` (571 L, 24 endpoints), `mcp.ts` (258 L), `favorites.ts`, `collections.ts`, `community.tsx`. |
| `utils/` | Cross-cutting | 19 modules. See table below. |
| `hooks/` | Shared hooks | `use-mobile.ts` only. |
| `lib/` | Firebase + `cn()` | `firebase.ts` (88 L), `utils.ts`. |

### `frontend/src/data/` — the catalogue

| File | Size | Entries | Consumed by |
|---|---|---|---|
| `componentData.tsx` | 743 KB | **137** components, 13 categories, 24 flagged `isPremium` | `LibraryPage`, `DemoPage`, `HomePage/ComponentGrid`, `SearchBox`, `ComponentPreviewTile`, `FavoritesPage`, `CollectionsPage`, `PreviewCapturePage` |
| `templatesData.ts` | 892 KB | **19** templates, 4 real categories (+ an `All` sentinel) | `TemplatesSection`, `TemplateDetailPage`, `BuildWithUIHubDetailPage`, `registry.ts` |
| `buildWithUIHubSlugs.ts` | 3.2 KB | **2** sections | `SearchBox`, `TemplatesSection`, `BuildWithUIHubDetailPage` |
| `componentMetadata.ts` | 151 KB | 76 of 137 have prop/vibe metadata | `ComponentDetail` **only** |
| `embeddedSourceCode.ts` | 864 KB | 85 source strings | `utils/codeUtils.ts`, `utils/promptUtils.ts` |
| `componentFullSources.ts` | 86 KB | 2 (`globe-mesh`, `ascii-water`) | `componentData.tsx`, `utils/codeUtils.ts` |
| `templateSourceCode.ts` | 2.5 KB | 19 via Vite `?raw` imports | `TemplateCodeViewer`, `TemplateDetailPage` |
| `premiumComponents.ts` | 1.3 KB | 41 ids | `utils/codeUtils.ts` **only** — a hand-maintained mirror by its own header |
| `componentData.tsx.bak` equivalent | 881 KB | — | **`embeddedSourceCode.ts.bak` — orphaned, no importer. `RISK-08`.** |
| `claudePrompts.ts` | 95 KB | 10 | **Orphaned — no importer anywhere. `RISK-08`.** |
| `antigravityPrompts.ts` | 17 KB | 9 | `componentData.tsx`, `promptUtils.ts` |
| `lovablePrompts.ts` | 8 KB | 9 | `componentData.tsx`, `promptUtils.ts` |
| `haulFooterSource.ts` · `omniflowFooterSource.ts` · `soraFooterSource.ts` · `suiFoundationSource.ts` · `cinematicNavbarSource.ts` | 5–14 KB each | 1 each | `codeUtils.ts` |

### `frontend/src/pages/`

| Directory | Routes | Notes |
|---|---|---|
| `HomePage/` | `/` | 5 rendered sections. `BuildWithUIHubSection` lives here but is **not** rendered on `/` — it serves `/build-with-ui-hub` only. `TemplatesSection` **eagerly** imports all 19 template components. |
| `LibraryPage/` | `/library` | 759 L. Category tree, search, hover previews, crown overlays, chunk prefetch. `sections/ComponentDetail/index.tsx` is **~2000 L — the richest page in the app.** |
| `Dashboard/` | `/dashboard/*` | `MCPPage.tsx` (818 L), `CollectionsPage.tsx` (720 L), `FavoritesPage.tsx` (320 L), `DashboardLayout.tsx`. **Layout performs no auth check.** |
| `Admin/` | `/admin/mcp/*` | 16 pages + `AdminGuard.tsx` + `AdminLayout.tsx` (194 L, 15-item sidebar). |
| `Auth/` | `/login` `/signup` `/forgot-password` | Shared `AuthBrandPanel.tsx` + `WaveBackground.tsx`. |
| `TemplatesPage/` | `/templates` `/templates/:id` | `TemplatesPage.tsx` is a 12-line re-export of the home section. |
| `BuildWithUIHubPage/` | `/build-with-ui-hub*` | Also thin re-exports + a 340 L detail page. |
| `PricingPage/` | `/pricing` | 504 L. Razorpay checkout + free activation. |
| `legal/` | 4 routes | `LegalPage.tsx` shared layout + 4 content pages. |
| `Components/` | — | `CloudScrollPage.tsx` is fully written but **registered in no route. `status: orphaned`.** |
| `PreviewCapturePage/` | `/preview-capture` | Internal screenshot harness for `scripts/announcement/capture-previews.mjs`. Not linked in the UI. |
| `LibraryPage/sections/GetStarted/` | — | 4 in-app docs (`introduction`, `getting-started`, `mcp`, `why-ui-hub`) from `getStartedData.ts`. |

### `frontend/src/components/`

| Directory | Files | Purpose |
|---|---|---|
| `ui/` | **141** top-level + `CloudScroll/` (39) | Site chrome, the component library, and the CloudScroll R3F experience. |
| `animations/` | 13 | `TextAnimations.tsx` and `VisualEffects.tsx` are **barrels** re-exporting the individual components. |
| `templates/` | 27 | 19 template section components + `registry.ts` + preview/code-viewer infrastructure. |
| `admin/` | 2 | `AdminUi.tsx` (the shared kit incl. `useData`), `Charts.tsx` (Recharts). |

`components/templates/registry.ts` is the single place that maps a template id to
its preview component, source filename, public assets and preview background. It
contains an entry (`graphic-designer-portfolio`) with no matching
`websiteTemplates` record — nothing can navigate to it. `../CONFLICTS.md`.

### `frontend/src/utils/` — 19 modules

| Module | Purpose |
|---|---|
| `apiConfig.ts` | `getApiBaseUrl()` — env → `window.location.origin` in prod → LAN host heuristics in dev → `localhost:5000`. |
| `mcpConfig.ts` | `MCP_BASE_URL` from `VITE_MCP_API_URL`, else `localhost:3001` (dev) / `ui-hub-mcp.onrender.com` (prod). |
| `checkout.ts` | `useRazorpayCheckout`. `COMPONENT_PRICE = { usd: 1.99, inr: 49 }`. |
| `razorpayUtils.ts` | Idempotent Razorpay script tag. |
| `codeUtils.ts` | 1106 L. `getComponentCode()` resolution ladder + `withUiHubBranding()`. |
| `promptUtils.ts` | 440 L. `fetchVibePrompt()` with the 30-id `LOCAL_ONLY_COMPONENTS` bypass and backend-authoritative trial enforcement. |
| `templatePromptUtils.ts` | Template-level prompt assembly. |
| `codeHighlighter.ts` | 202 L. Lazy `shiki` language + theme imports. |
| `searchIndex.ts` | Scored cross-catalog search (120/90/70/60/50 ladder) + 13 category accent colours. |
| `prefetchUtils.ts` | `PREFETCH_MAP` (~70 loaders) + heuristics for `text-*`, `effect-*`. |
| `zipUtils.ts` | JSZip premium download; fetches each asset blob. |
| `authUtils.ts` | Brands Firebase error strings as "UI Hub:". |
| `syncUser.ts` | `POST /users/sync` with a forced token refresh. |
| `componentSync.ts` | `POST /components/sync`, throttled to 1×/hour. |
| `activityLogger.ts` | `POST /users/activity` with `keepalive: true`. |
| `pushService.ts` | SW registration, VAPID fetch, subscribe. |
| `componentUtils.ts` | `isNewComponent()` with `NEW_BADGE_DEFAULT_DAYS = 120`. |
| `templateRelevance.ts` | 417 L. Powers the "similar templates" rail. |
| `cookieUtils.ts` | Consent cookies, 365d, `SameSite=Lax`, **no `Secure` flag**. |

---

## `backend/`

Express 4 REST API. **Plain JavaScript ESM** — no TypeScript.

| Path | Purpose |
|---|---|
| `src/server.js` | Entry. See `../architecture/ARCHITECTURE.md` §3. |
| `src/routes/` | 6 routers: `componentRoutes.js` (5), `userRoutes.js` (14), `configRoutes.js` (3), `paymentRoutes.js` (4), `favoritesRoutes.js` (5), `collectionsRoutes.js` (7). **38 endpoints.** |
| `src/services/` | 17 modules. **All** business logic and **all** data access. No model layer. |
| `src/middleware/` | `auth.js` (exports **only** `verifyToken`), `rateLimiters.js`, `validators.js`. |
| `src/utils/` | `firebaseAdmin.js`, `sendEmail.js`, `verifySignature.js`. |
| `src/config/` | `plans.js`, `premiumComponents.js` (**canonical** 41-id list). |
| `src/data/` | `announcementManifest.json` (generated), `componentFullSources.js`, `sourceCodeData.js`. |
| `src/controllers/` | `paymentController.js`, `webhookController.js`. |
| `src/emailTemplates/` | Email HTML. |
| `src/scripts/` | 16 operational/migration/email-test modules. **Not run at boot.** Includes `initMongo.js`, `initFirestore.js`, `migrateFirestoreToMongo.js`, `setupProductionDatabase.js`. |
| `tests/` | `node:test` — `accessService`, `collectionsService`. |
| `.env`, `.env.local`, `service-account.json` | **Contain real secrets. Gitignored. Never read into, quoted from, or committed.** |

---

## `mcp-server/`

TypeScript MCP server. Protocol hand-implemented — the official SDK is not a dependency.

| Path | Purpose |
|---|---|
| `src/index.ts` | HTTP entry. Mounts the 3 routers. |
| `src/stdio.ts` | stdio entry, **implicit admin identity**. |
| `src/routes/mcp.ts` | JSON-RPC. `initialize` · `ping` · `tools/list` · `tools/call`. Also implements `GET /` and `DELETE /`. |
| `src/routes/dashboard.ts` | `/api/dashboard/mcp` — Firebase-authenticated key CRUD + usage. |
| `src/routes/admin.ts` | `/api/admin/mcp` — `requireAdmin`. 24 operations. **`GET /logs` registered twice.** |
| `src/tools/` | **14 tools, one file each**, aggregated by `index.ts`. |
| `src/middleware/` | `auth.ts` (API keys), `dashboardAuth.ts`, `requireAdmin.ts`, `rateLimiter.ts`, `errorHandler.ts`. |
| `src/services/` | `mongo.ts`, `firebase.ts`, `apiKeyService.ts`, `analyticsService.ts`, `auditService.ts`, `permissionService.ts`, `componentService.ts`. |
| `src/data/` | **Generated** catalogues. `components.ts` (137), `sourceCode.json` (148), `premiumComponents.json` (41), `templates.json`, `aiPrompts.json`, + 3 more. |
| `src/config/env.ts` | Reads 15 env vars. |
| `src/types/` | Shared types. |
| `tests/` | Vitest — `apiKey`, `auth`, `permissions`, `tools`. |
| `scripts/` | `check-source-coverage.mjs` (build gate), `copy-data.mjs`, `sync-frontend-data.mjs`. |
| `dist/` | **Committed and load-bearing.** `backend/src/server.js` imports from here. |
| `render.yaml` | Standalone deploy for running MCP alone. |
| `Dockerfile` | Node 20. |

---

## `cli/`

Zero-runtime-dependency Node CLI. A thin MCP client — it does **not** call the REST backend.

| Path | Purpose |
|---|---|
| `src/cli.ts` | Entry. Only `login`, `config`, `logout` are exempt from the API-key requirement; everything else exits `3` when unauthenticated. |
| `src/commands/` | 14 commands: `login` `logout` `config` `search` `show` `code` `deps` `categories` `prompt` `template` `animation` `behavior` `use` `whoami`. |
| `src/args.ts` `config.ts` `ctx.ts` `errors.ts` `help.ts` `mcp.ts` `output.ts` | Support modules. |
| `tests/` | `node:test` via `tsx` — `config`, `mcp`, `args`, `output`. |
| `dist/` | Build output, gitignored (unlike `mcp-server/dist`). |

Config precedence: **CLI flags → env (`UI_HUB_ENDPOINT`, `UI_HUB_API_KEY`) → user
config dir → project `.ui-hubrc.json`.** The API key is deliberately excluded from
the project file. Default endpoint `https://ui-hub-mcp.onrender.com/mcp`.

---

## `scripts/`

| Path | Purpose |
|---|---|
| `announcement/build-banner.mjs` | Composes curated component PNGs into `announcement-banner.gif` (`gifenc` + `pngjs`). |
| `announcement/capture-previews.mjs` | Screenshots components with Playwright. Drives `/preview-capture`. |
| `announcement/check-png.mjs` | Analyses preview PNG luminance/colour spread to detect blank output. |
| `announcement/generate-manifest.mjs` | Reads frontend + MCP data → writes `backend/src/data/announcementManifest.json`. |
| `announcement/preview-screenshot.mjs` | Screenshots the announcement email HTML. |
| `templates/frames/` | **19 empty, untracked placeholder directories.** No scripts. |

Root `devDependencies` exist to serve these: `playwright`, `pngjs`, `gifenc`,
`firebase-tools`.

> **There are no Python scripts in this repository.** `README.md` documents a table
> of seven `.py` files. `.gitignore` ignores `*.py`, so they were most likely
> deleted. `../CONFLICTS.md` §7.

---

## `docs/`

Three files. All have drift. Read `../CONFLICTS.md` before trusting any of them.

| File | Classification | Status |
|---|---|---|
| `docs/cli.md` | technical / user-facing | **Current.** Commands, options, JSON mode, exit codes and tier limits all match `cli/src`. |
| `docs/mcp.md` | technical / user-facing | **Partially outdated.** Documents 11 of 14 tools; says Firestore where the code uses MongoDB; claims a stateless 405. |
| `docs/runbook.md` | deployment / QA | **Materially outdated.** Wrong topology (claims a separate MCP repo), wrong env var names, references a non-existent tool `getSourceCode`. Test counts unverified. |

Plus root `README.md` and `MCP.md`. **Authority order:** `MCP.md` > `docs/cli.md` >
`README.md` > `docs/mcp.md` > `docs/runbook.md`. And all of them lose to code.

---

## `component-specs/` and `.agents/skills/`

Both **gitignored — local only, never pushed**.

| Path | Purpose |
|---|---|
| `component-specs/` | 8 markdown design specs for the component-forge skill: `image-compare` `image-lens` `matrix-rain` `quantum-lattice` `rain-storm` `sky` `sky-calm-night` `shader-category`. Fixed 15-section format defined by the skill's `references/06-spec-output-template.md`. **Consumed by nothing at runtime** — the only references in the repo are inside the skill's own scripts. |
| `.agents/skills/uihub-component-forge/` | The authoritative workflow for designing a new component. `SKILL.md` + 13 numbered `references/*.md` + 3 `scripts/*.mjs` + `assets/` + `data/` (`brand-profile.json`, `component-index.json`, `design-tokens.json`). |
| `.agents/skills/ui-hub-component-integration/` | The authoritative 5-step workflow for **adding** a component to the app, including regenerating the 5 AI vibe prompt banks. **Use this instead of improvising when adding a component.** |
| `.agents/skills/ui-hub-github-sync-and-push/` | Git/GitHub workflow with strict repo separation (UI-HUB vs UI-HUB-MCP) and mandatory user permission before push. |
| `.claude/agents/` | **Empty.** |

**Do not relocate or duplicate these into `.uihub-agent/`.** They are the
authoritative AI workflow layer. See `../AGENT.md` §10.
