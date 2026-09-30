# PRODUCTION BASELINE - Phase 4

Ground truth for the deployed estate, captured **2026-09-30T09:13:45Z** by
read-only HTTP probes and a read-only database session. Nothing in this phase
changed production.

This document supersedes the deployment sections of `BASELINE.md` and
`RUNTIME_VERIFICATION.md`, which were written before Phase 3 and therefore
describe code that is not deployed.

---

## 1. Method and limits

All evidence here is read-only:

- **HTTP** - unauthenticated `GET` against public hostnames, status and headers
  only. No authenticated call, no mutation, no credential was sent.
- **Database** - one `MongoClient` session that issued only `countDocuments`,
  `aggregate`, `find` with projection, `listCollections`, and `listDatabases`.
  **Zero writes.** No connection-string value, username, or password was printed
  or recorded in this repository.
- **Browser** - not required for the facts below.

What this baseline **cannot** contain, and why:

| Not captured | Reason |
|---|---|
| Function-level stack traces | Needs Vercel build logs (owner) |
| Render service state and logs | Needs Render dashboard (owner) |
| Cloudflare zone configuration | Needs Cloudflare dashboard (owner) |
| Live environment variable values | Out of scope by standing rule |
| Razorpay order/payment state | Needs Razorpay dashboard (owner) |

---

## 2. Live endpoint status

| Endpoint | Status | Content-Type | Server | Interpretation |
|---|---|---|---|---|
| `ui-hub-design.vercel.app/` | **200** | `text/html` | Vercel | Frontend static shell serves. 6474 b. |
| `ui-hub-design.vercel.app/health` | **200** | `text/html` | Vercel | **Not the backend.** Byte-identical 6474 b SPA shell, contains `<div id="root">`. |
| `ui-hub-design.vercel.app/api/health` | **500** | `text/plain` | Vercel | `FUNCTION_INVOCATION_FAILED`. |
| `ui-hub-design.vercel.app/api/v1/components` | **500** | `text/plain` | Vercel | 500 where the correct answer is **404** (see §2.3). |
| `ui-hub.onrender.com/` | **503** | `text/html` | cloudflare | Cloudflare-generated, not the application. |
| `ui-hub.onrender.com/health` | **503** | `text/html` | cloudflare | As above. |
| `ui-hub.onrender.com/api/health` | **503** | `text/html` | cloudflare | As above. |
| `ui-hub-mcp.onrender.com/mcp` | **503** | `text/html` | cloudflare | As above. |
| `ui-hub-backend-mcp.onrender.com/` | **404** | `text/plain` | cloudflare | Bare 404 on `/`, not a 503. |

### 2.1 The single most important negative finding

**There is no reachable production API.** Every candidate API surface is down:

- The Vercel function fails to load on **all** `/api/*` paths.
- Both Render hostnames are refused at the Cloudflare edge.

The frontend therefore cannot reach a backend. Any statement that the site is
"live" refers only to the static shell being served.

### 2.2 Vercel 500 - narrowed, not closed

Measured locally against the real `server.js` with Mongo deliberately
unreachable, so that a **5xx means "route matched, dependency dead"** and a
**404 means "no such route"**:

| Path | Local result | Meaning |
|---|---|---|
| `/api/health` | 503 | Routed; correctly reports `unhealthy`. |
| `/health` | 503 | Routed. Health exists at both prefixes. |
| `/api/v1/components/db` | 500 | Routed; Mongo dead. |
| `/v1/components/db` | 500 | Routed. The dual `app.use('/api')` + `app.use('/')` mount works. |
| `/api/v1/components` | **404** | **Correct.** `componentRoutes` has no `GET /`; the list lives at `/db`. |
| `/mcp` | 200 | MCP mounted and serving from the rebuilt `mcp-server/dist`. |
| `/api/admin/mcp/health` | 401 | Correctly requires a token - the Phase 3 auth work holds. |

On Vercel, `/api/v1/components` returns **500 where the correct answer is 404**.
A 404 that has been replaced by a 500 is a stronger signal than an expected-401
turned-500: routing demonstrably never happened. The fault is in module
loading, before Express, before CORS, and before any middleware.

This is consistent with the Phase 3 hypothesis: the function bundles the
backend and the MCP server but their runtime dependencies were undeclared in
the root manifest, so the bundle cannot resolve them. Phase 3 fixed the
repository side and `api/index.js` now imports cleanly under `VERCEL=1`
(~24 s cold). **The deployed function has not been redeployed**, so the observed
500 is expected to persist until an owner deploys.

### 2.2.1 One risk that only a deploy can settle

`vercel.json` rewrites `/api/(.*)` to the **file path** `/api/index.js`. Whether
the function then receives the *original* sub-path (`/api/v1/components`) or the
*rewritten* one (`/api/index.js/v1/components`) is platform behaviour that
cannot be reproduced locally. If the rewritten path wins, every API route 404s
even after a successful deploy, and this would be masked today by the existing
500.

The rewrite is correctly ordered ahead of the SPA catch-all, so `/api/*` cannot
be swallowed by `-> /index.html` - that much is verified statically. Path
fidelity is not. **Check this first if a redeploy turns 500 into 404.**

The cloudflare-served 503s carry `cf-ray` headers from a `BOM` edge location and
**no `x-render-origin-server` header**, indicating the request was not answered
by the Render origin. The 404 on `ui-hub-backend-mcp` is `text/plain`, which is
Cloudflare's "no such host/route" shape rather than a stopped Node service. Both
point at the edge, not the application - but only the dashboards can confirm it.

### 2.3 The frontend currently points at Render, not Vercel

`getApiBaseUrl()` in `frontend/src/utils/apiConfig.ts` returns
`VITE_API_URL` in production when set. The served production bundle contains
the literal Render API host. With `VITE_API_URL` set to Render, the browser
calls Render, so **the Vercel function is not in the browser's request path at
all** and fixing the Vercel function alone would not restore the site.

To move the browser onto the Vercel function, the owner must either:

- **unset** `VITE_API_URL` - the helper already falls back to
  `window.location.origin`, which makes the deployment same-origin, or
- set it to `https://ui-hub-design.vercel.app`.

**Recommend unset.** Same-origin removes the CORS dependency and makes preview
deployments work without a rebuild. `backend/src/server.js` already lists the
Vercel origins in its CORS allow-list, so either choice is permitted server-side.

---

## 3. Production database (read-only)

Connected with the credential in `backend/.env`. Server version **8.0.32**,
database **`uihub`**, **12 collections**.

`activity_logs`, `collections`, `components`, `email_logs`, `favorites`,
`mcp_analytics`, `mcp_api_keys`, `mcp_audit`, `mcp_config`, `payment_webhooks`,
`payments`, `users`.

### 3.1 `users` - 33 documents

`status` aggregate - **this closes U-07**:

| `status` | Count |
|---|---|
| `"FREE"` | 30 |
| `"active"` | 3 |

Both vocabularies Phase 1 predicted from code genuinely coexist in live data.
The uppercase/lowercase split is real, not theoretical. Of the 33 users, 3 are
non-free and 23 carry `isAdmin`. `proExpiry` is present on exactly the 3
non-free accounts. No `plan`, `planType`, `planDuration`, or `planExpiry` field
exists on any user.

### 3.2 Push - zero uptake

No user document contains `pushSubscriptions`, `pushSubscription`, or
`fcmTokens`. Web Push has never been used by a real user, which makes it dead
weight rather than a silent outage.

### 3.3 Cluster identity

`listDatabases` on the connected cluster returns `sample_mflix` (183 582 720 b),
`uihub` (4 521 984 b), `admin` (0 b), `local` (0 b). The `sample_mflix` database
is unrelated to this product and is **40x larger** than `uihub`.

The Phase 2 observation that "the same cluster holds `uihub` plus an unrelated
`sample_mflix`" is **reproduced exactly**. That materially raises confidence
that `backend/.env` addresses the production database, since the unrelated
database is a strong identifying fingerprint - but it does not prove which
Render service uses the credential. See U-06.

### 3.4 MCP tool configuration - and a correction

`mcp_config` holds exactly **1** document. Its `tools` object has **4 keys**, and
**all four values are booleans**:

```
get_component_code   = true
list_components      = true
search_components    = true
get_component_metadata = true
```

**Correction to the Phase 2 and Phase 3 record.** Both earlier phases described
these as "4 string-valued entries". They are booleans. The Phase 3 fix is
unaffected - `coerceToolMap` accepts booleans, boolean strings, and arrays, so
it was correct - but the stated justification was wrong and is corrected here.

Two real defects are now measurable, which is what the Phase 3
`getToolDrift()` surfaces:

1. **`list_components` is a stale key.** It is not in the 14-tool registry. It is
   silently dropped on load, so whatever it claims to control is not controlled.
2. **10 of 14 tools are unconfigured.** Only 4 tools are named. Under the
   fail-open policy agreed with the owner, all 10 unconfigured tools are
   **enabled**. The effective state is therefore "all 14 tools on", reached
   accidentally rather than by decision.

`db.components` holds **226** documents, against 148 in `src/data/sourceCode.json`
and 145 in the stale committed `dist`. The database is not the source of truth
for the catalogue; the tracked JSON is.

---

## 4. Repository state at this baseline

| Item | State |
|---|---|
| Branch | `phase4/production-recovery` |
| Base commit | `41938a67` |
| Phase 3 commit | `0bdd0aa6` - local, not deployed |
| `mcp-server/dist` | Rebuilt from source; all 7 generated files byte-identical to `src/data` |
| `mcp-server/dist` before this phase | **Stale** - missing `image-compare`, `image-lens`, `matrix-rain`, `visionary-orb-hero`, and every Phase 3 config change |
| Test suites | backend 54/54, mcp-server 78/78 (5 files), cli 30/30 |
| Frontend tests | None exist in the repository |

The stale `dist` is the more serious of the two problems: `dist` is tracked and
is what the MCP server actually runs, so the repository was shipping a component
catalogue three components behind its own source, while
`check-source-coverage.mjs` still reported 41/41 because it validates only
`src/data/sourceCode.json` and never compares the two trees.

---

## 5. What this baseline does and does not establish

Established:

- The complete live HTTP surface, with status codes and edge attribution.
- The exact `users.status` vocabulary distribution.
- That no user has a push subscription.
- The precise shape and drift of production MCP tool configuration.
- That the served frontend bundle targets the Render host.

Not established, and deliberately not guessed:

- Why the Vercel function fails (needs Vercel logs).
- Why Cloudflare returns 503 and 404 (needs Cloudflare and Render dashboards).
- Whether Render services exist, are stopped, or were never created.
- Whether the VAPID, `EMAIL_TEST_SECRET`, or `REDIS_URL` variables are set.
- Whether the 3 non-free accounts correspond to real payments.

---

## 6. UI baseline - light mode is worse than previously recorded

Phase 3 characterised light mode as "reachable but partial: 21 `dark:` variants
follow the OS, and the `@theme` brand colours ignore the toggle." That
understated it. Measured in headless Chrome, light mode produces **invisible
text**.

Evidence is from computed styles, not screenshots.

### 6.1 What the token system does correctly

Setting `localStorage.theme = "light"` puts `class="light"` on `<html>`, and the
token block applies:

| Variable | Dark | Light |
|---|---|---|
| `--color-bg` on `<html>` | `#0a0a0a` | **`#f5f5f7`** |
| `--color-text-primary` on `<html>` | `#ffffff` | **`#000000`** |

The token layer is correct and responsive. `frontend/src/index.css:184-204`
does its job.

### 6.2 What overrides it

Two hardcoded rules, both unlayered, both with specificity equal to or above the
token-driven rules:

1. **`frontend/index.html`** carries an inline `<style>`:

   ```css
   body { background-color: #000000; color: #ffffff; margin: 0;
          font-family: Inter, system-ui, sans-serif; }
   ```

   Vite injects the bundled stylesheet `<link>` at character 4310 of the built
   `index.html`; this inline `<style>` lands at character 5379 - **after** it.
   Same specificity, later in document order, so it wins. It silently defeats
   the `body` rule at `index.css:239-243` that would otherwise be theme-aware.

2. **`frontend/src/index.css:150-152`** hardcodes `html { background-color: #0A0A0A }`
   with no `.light` counterpart.

### 6.3 The measured consequence

| | Dark | Light |
|---|---|---|
| `<html>` background | `rgb(10,10,10)` | `rgb(10,10,10)` - unchanged |
| `<body>` background | `rgb(0,0,0)` | `rgb(0,0,0)` - unchanged |
| `<body>` colour | `rgb(255,255,255)` | `rgb(255,255,255)` - unchanged |
| Leaf text nodes coloured `rgb(0,0,0)` | 36 | **56** |
| Leaf text nodes coloured `rgb(255,255,255)` | 62 | **42** |

**20 leaf text elements flip to black text while the background stays black.**
Those 20 are invisible. Light mode does not merely "fail to fully apply" - it
makes part of the page unreadable, which is worse than having no light mode at
all.

Note also that `index.css:239-243` is itself redundant with the inline style,
and that `index.css` sets no `body { margin: 0 }`, so the inline block cannot be
deleted wholesale without moving `margin` first.

### 6.4 The fix, not applied

This was **left unchanged on purpose**. The owner scoped Phase 3 light mode to
documentation only, and enabling it is a behaviour change to the theme rather
than a defect repair. The precise minimal fix, should the owner authorise it:

1. In `frontend/index.html`, reduce the inline `<style>` to `body { margin: 0 }`
   so the token-driven rule at `index.css:239-243` applies. To keep the
   pre-CSS anti-flash, move the dark paint into `index.css` and drive it off
   the existing class rather than hardcoding it.
2. In `frontend/src/index.css:151`, change `#0A0A0A` to `var(--color-bg)`.

That restores the background and text colour. It does **not** fix the 21
`dark:` variants that follow the OS rather than the toggle, nor the hardcoded
`@theme` brand colours, so light mode would still be inconsistent. A complete fix
is a larger theme refactor and should be scoped separately.

### 6.5 Token audit - one real defect found and fixed

Every `brand-*` and shadcn colour class used in `frontend/src` (33 distinct
classes across 339 files) was cross-checked against the tokens declared in
`@theme` and against the built stylesheet.

**31 resolved cleanly. One genuine defect found and repaired:**

- `border-brand-dark` was used three times in
  `frontend/src/components/ui/PushNotificationPrompt.tsx` (lines 66, 99, 105),
  but `--color-brand-dark` is **not declared** in `@theme`. The utilities
  generated no CSS, so those elements had no border colour at all. Remapped to
  `border-brand-black`, which *is* declared (`--color-brand-black: #000000`) and
  is the dark-neutral the component was clearly reaching for. Now generates.

Two further classes (`bg-brand-blue-dark`, `ring-brand-blue`) initially looked
unresolvable but are used as `hover:` and `focus-visible:` variants; the emitted
selectors `.hover\:bg-brand-blue-dark` and `.focus-visible\:ring-brand-blue` are
present. Final state is **33/33 resolvable**.

A caution for the next agent: a naive audit that greps for `.class-name` will
report false positives for any variant-prefixed utility, and
`data/embeddedSourceCode.ts` contains component source as *strings*, so classes
inside it are not real usages.

