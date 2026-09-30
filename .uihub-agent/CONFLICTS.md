# CONFLICTS — Verified Contradictions and Security Findings

Every entry was found by reading code and configuration. **Nothing here has been
fixed** — Phase 1 is discovery-only.

**How to read this file**

- **Status** — `CONFIRMED` means verified in source with two contradicting
  artifacts. `RISK` means a verified weakness, not a contradiction.
- **Severity** — `S1` blocks trust in the system. `S2` loses money, data, or
  access. `S3` degrades quality or confuses future work.
- **Confidence** — my certainty that the finding is real *as stated*.
- **Fix owner** — who decides, not who does the typing.

The full evidence trail is in the linked document for each entry. Cross-check
`../PROJECT_MAP.json → risks` for the generated summary.

---

## Summary

| ID | Finding | Status | Sev | Confidence |
|---|---|---|---|---|
| [1](#1-committed-mongodb-credential) | Live Atlas credential in a tracked file | RISK | **S1** | high |
| [2](#2-mcp-is-absent-on-vercel) | MCP not deployed to Vercel | CONFIRMED | **S1** | high |
| [3](#3-health-check-is-hardcoded) | `/health` cannot detect failure | CONFIRMED | **S1** | high |
| [4](#4-font-heading-silently-broken) | 44 elements fall back to the wrong font | CONFIRMED | S2 | high |
| [5](#5-shadcn-tokens-do-not-exist) | Button focus ring does not render | CONFIRMED | S2 | high |
| [6](#6-four-unauthenticated-broadcasts) | Anyone can email/push every user | RISK | **S2** | high |
| [7](#7-premium-lists-never-reconciled) | 3 lists, no cross-check | RISK | S2 | high |
| [8](#8-users-status-has-two-vocabularies) | `'FREE'` vs `'active'` | CONFIRMED | S2 | high |
| [9](#9-elite-is-invisible-to-the-frontend) | Admin tier folded into Pro | CONFIRMED | S2 | high |
| [10](#10-docs-document-11-of-14-tools) | MCP docs are stale | CONFIRMED | S3 | high |
| [11](#11-mcp_config-tools-seed-is-stale) | Seed names a nonexistent tool | CONFIRMED | S2 | medium |
| [12](#12-users-id-is-email-not-uid) | Legacy uid branch, unresolved | CONFIRMED | S2 | medium |
| [13](#13-mcp-session-store-is-in-memory) | Per-process, contradicts docs | CONFIRMED | S3 | high |
| [14](#14-three-expiry-fields-unreconciled) | `proExpiry`/`planExpiry`/`planDuration` | CONFIRMED | S2 | low |
| [15](#15-tailwind-config-is-dead-code) | v3 config ignored by v4 | CONFIRMED | S3 | high |
| [16](#16-light-theme-is-unreachable) | `:root.light` + 24 `dark:` elements | CONFIRMED | S3 | high |
| [17](#17-pricing-page-bypasses-api-config) | LAN detection skipped | CONFIRMED | S2 | high |
| [18](#18-three-payment-grant-paths) | No reconciliation | CONFIRMED | S2 | medium |
| [19](#19-root-service-accountjson-not-ignored) | One unignored path | RISK | S3 | medium |
| [20](#20-mcp_server_url-points-at-another-service) | Blueprint hostname mismatch | CONFIRMED | S2 | high |
| [21](#21-vapid-variables-absent-from-config) | Push may be unconfigured | CONFIRMED | S3 | low |
| [22](#22-activity-analytics-capped-at-90-days) | TTL silently truncates history | CONFIRMED | S3 | high |
| [23](#23-npm-test-fails-at-the-root) | No root test script | CONFIRMED | S3 | high |
| [24](#24-frontend-has-no-tests-at-all) | 0 test files | CONFIRMED | S3 | high |
| [25](#25-no-ci-anywhere) | `.github/workflows/` is empty | CONFIRMED | S3 | high |
| [26](#26-express-4-cannot-catch-async-errors) | Errors escape the handler | CONFIRMED | S2 | medium |
| [27](#27-admin-logs-route-registered-twice) | Second is dead code | CONFIRMED | S3 | high |
| [28](#28-firestore-migration-is-dead-code) | Only historical schema record | CONFIRMED | S3 | high |
| [29](#29-views-and-copy-counters-never-increment) | Likely dead fields | CONFIRMED | S3 | medium |
| [30](#30-hardcoded-firebase-web-config-ships) | Credential-shaped in source | RISK | S3 | high |

**Counts: 6 × S1-adjacent, 14 × S2, 12 × S3.** Two findings (#1, #2) should be
resolved before any other work is scheduled.

---

## S1 — Resolve first

### 1. Committed MongoDB credential

**Status** RISK · **Severity** S1 · **Confidence** high

`backend/.env.example` is **tracked in git** and contains a real MongoDB Atlas
connection string with an embedded username and password, plus a real Brevo SMTP
account id. Verified by parsing the string: 88 characters, credentials present,
Atlas `cluster0` host, database `uihub`.

Every other secret file in the repo is correctly ignored — `backend/.env`,
`backend/.env.local`, `backend/service-account.json`, root `.env`. **This one
file is the exception.**

**Why it is S1:** the credential is in history, so `.gitignore` cannot help. Until
the password is rotated in Atlas, anyone with repository read access holds
production database access, and rotating it requires a coordinated deploy.

**The fix is rotation, not redaction.** Replace the value with a placeholder, but
understand that the placeholder does not secure anything — the password must
change.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §0, `../rules/DO_NOT_CHANGE.md` §1.
**Fix owner: project owner — requires Atlas dashboard access.**

---

### 2. MCP is absent on Vercel

**Status** CONFIRMED · **Severity** S1 · **Confidence** high

`backend/src/server.js:128-130` imports three routers from
**`mcp-server/dist/`** — build output, not source — inside a `try`/`catch` that
only `console.warn`s.

`vercel.json` defeats this in two independent ways:

- `"includeFiles": "backend/**"` — **excludes `mcp-server/`** entirely
- `buildCommand` is `npm install && cd frontend && npm install && npm run build`
  — **never builds mcp-server**

So on Vercel the imports cannot resolve, throw, are caught, and **MCP routes are
never mounted.** The app boots and looks healthy.

The same code on Render works, because `render.yaml`'s build command *does* run
`npm run build` in mcp-server first. **The defect is invisible in the primary
environment and only appears on Vercel.**

The comment `// 6. MCP Server Integration (Unified Deployment)` describes an
intent the Vercel config does not achieve. Anything reading `server.js` alone
would conclude MCP is served on both platforms.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §4.
**Fix owner: project owner — the Vercel function bundle and build must change.**

---

### 3. Health check is hardcoded

**Status** CONFIRMED · **Severity** S1 · **Confidence** high

```js
// server.js:141-152
res.json({ status: 'ok', services: { backend: 'online', mcp: 'online' }, ... });
```

Both service strings are **literals**. Nothing probes MongoDB, nothing reflects
whether the MCP block succeeded, and the handler returns 200 as long as Express
can serialise JSON.

`render.yaml` sets `healthCheckPath: /health`, so **Render's deploy gate passes on
a process whose database is unreachable and whose MCP routes never mounted** —
exactly the state finding #2 produces.

This is what allowed #2 to go unnoticed, and it will hide the next failure of the
same kind.

**Do not fix by adding a MongoDB ping without reading the consequences** — a
health check that fails on a transient DB blip will make Render kill a healthy
process.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §3.
**Fix owner: project owner.**

---

## S2 — Money, data, or access

### 4. `font-heading` silently broken

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`--font-heading: "Space+Grotesk"` in `index.css` `@theme` — a `+` pasted from
the Google Fonts URL. No such family exists, so all **44 `font-heading` usages
render in generic `sans-serif`.**

The identical bug is in the dead `tailwind.config.ts`, so it was copied. The
`font-serif` entry in that same file quotes correctly (`'"Source Serif 4"'`),
which is why it survived: the rule was known once and missed once.

Compounding: `font-serif` (63 usages) is **not defined in `@theme` at all**, so
it resolves to Tailwind v4's default serif stack, not Source Serif 4. And
`--font-seekuw: "Seekuw"` names a font that is never loaded.

One character fixes `--font-heading` — but it visibly changes 44 elements at
once, so it needs a decision, not a drive-by fix.

Evidence: `../design-system/DESIGN_SYSTEM.md` §4.
**Fix owner: design.**

---

### 5. shadcn tokens do not exist — focus ring invisible

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`src/components/ui/button.tsx` is a faithful shadcn button, so it carries
`focus-visible:ring-ring` and `ring-offset-background`. This theme defines
**no** `--color-ring`, `--color-background`, `--color-foreground`, or
`--color-input`.

| Class | Usages | Token | Defined? |
|---|---|---|---|
| `bg-background` | 10 | `--color-background` | No |
| `text-foreground` | 6 | `--color-foreground` | No |
| `focus-visible:ring-ring` | 5 | `--color-ring` | No |
| `ring-offset-background` | 1 | `--color-background` | No |
| `border-input` | 1 | `--color-input` | No |

23 usages of undefined tokens. In Tailwind v4 each resolves to
`var(--color-…)` on an undefined property, which is invalid at computed-value
time and falls back to the initial value.

**Effect: the primary Button's keyboard focus indicator does not render.** 10
`bg-background` elements are transparent; 6 `text-foreground` elements inherit
colour.

Invisible in review, because the class names are *correct* — they are the
shadcn defaults, faithfully copied into a theme that never defined them. And
Tailwind v4 emits no warning for an unknown token.

Evidence: `../design-system/DESIGN_SYSTEM.md` §6.
**Fix owner: design.**

---

### 6. Four unauthenticated broadcasts

**Status** RISK · **Severity** S2 · **Confidence** high

Eight unauthenticated endpoints on `userRoutes.js`, four of which target every
user:

- `POST /v1/users/broadcast-reengagement` — **emails all users**
- `POST /v1/users/broadcast-announcement` — **emails all users**
- `POST /v1/users/push-broadcast` — **pushes all subscribers**
- `POST /v1/users/email-test` — sends a test email

**No authentication, no rate limit, no admin check.** Anyone who finds the URL
can email the entire user base and exhaust the Brevo quota. This is both an
abuse vector and a bill.

Compounding: route **position** in that file is the security boundary. A route
added above the `verifyToken` line is public by accident, silently.

Evidence: `../APIs/API_OVERVIEW.md` §3, `../rules/DO_NOT_CHANGE.md` §8.
**Fix owner: project owner — add `verifyToken` + an admin check.**

---

### 7. Premium lists never reconciled

**Status** RISK · **Severity** S2 · **Confidence** high

Three hand-maintained premium lists, none cross-checked:

1. `frontend/src/data/componentData.tsx` — the `isPro` flag that **renders**
2. `mcp-server/src/data/premiumComponents.json` — 41 ids, **generated**
3. `backend`'s `PREMIUM_COMPONENT_IDS` — the **fallback** when MongoDB is down

`check-source-coverage.mjs` runs on every mcp-server build and fails it if a
premium component has lost its source. **It does not compare the lists.** A
component marked premium in one place and free in another is undetectable from
the repository — it fails silently, in whichever direction is wrong.

Evidence: `../data/DATA_OVERVIEW.md` §5.4, §7.3.
**Fix owner: project owner.**

---

### 8. `users.status` has two vocabularies

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`POST /v1/users/sync` writes `status: 'FREE'` (uppercase).
`setupProductionDatabase.js` and the Razorpay sync write `status: 'active'`.

One field, two vocabularies. No index or query reads it today, so the damage is
currently cosmetic — **but any future feature filtering on `status` will
silently mis-handle roughly half the users**, and nothing would indicate why.

Evidence: `../data/DATA_OVERVIEW.md` §4.3.
**Fix owner: project owner — a data migration, not a code change.**

---

### 9. Elite is invisible to the frontend

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`GET /v1/users/status` folds elite into pro:

```js
// "so the frontend only needs Free/Pro"
const isPro = await checkProStatus(email) || await checkEliteStatus(email);
```

An `elite` admin — seeded as `planTier: 'elite'` by
`setupProductionDatabase.js` — is reported as a plain pro user. The frontend
**cannot distinguish the two**, so any feature that must treat elite differently
has no data to work with.

Three different meanings of "admin" also coexist: `users.role`/`isAdmin` in
MongoDB, the `MCP_ADMIN_EMAILS` env allow-list, and `planTier: 'elite'`.

Evidence: `../data/DATA_OVERVIEW.md` §4.4.
**Fix owner: product.**

---

### 11. `mcp_config.tools` seed is stale

**Status** CONFIRMED · **Severity** S2 · **Confidence** medium

The `mcp_config` singleton seed names `list_components` — **a tool that does not
exist**; the real one is `list_all_components` — and lists only 4 of the 14
registered tools.

The seed uses **`$setOnInsert`**, so it only ever runs when the document does not
exist. On any database where `mcp_config` already exists, **this stale entry
persists forever.**

**Confidence is medium on the consequence, high on the artifact.** I confirmed
the seed content and that the registry has no such tool, but **I could not
confirm whether any code path actually reads `mcp_config.tools`.** If one does,
it would disable the other 10 tools. `PATCH /tools/:name` is the likely writer,
and the admin dashboard may read it.

Evidence: `../data/DATA_OVERVIEW.md` §6.
**Fix owner: trace the reader before changing anything.**

---

### 12. `users._id` is the email, not the uid

**Status** CONFIRMED · **Severity** S2 · **Confidence** medium

The primary key is the **lowercased email**. Because the design changed over
time, reads defensively query two shapes:

```js
{ $or: [{ _id: userEmailKey }, { email: userEmailKey }] }
// and, when there is no email:
{ $or: [{ _id: uid }, { uid }] }
```

**No current writer creates a uid-keyed document**, so the second branch only
makes sense if legacy documents exist from before the migration — or if it is
dead code. **Which, cannot be determined from source.** `confidence: medium`.

**Never write a new query on `_id` alone.** Use the `$or` form, and never assume
`_id === uid`.

Evidence: `../data/DATA_OVERVIEW.md` §4.2.
**Fix owner: project owner — needs a live database count to resolve.**

---

### 14. Three expiry fields, unreconciled

**Status** CONFIRMED · **Severity** S2 · **Confidence** low

`proExpiry`, `planExpiry`, and `planDuration` all exist. Only `planExpiry` is
surfaced, via a defensive `instanceof Date` check with a raw-value fallback.
`checkProStatus` is a separate function from the expiry-field logic.

**The relationship between the three is not documented anywhere in code.**
`confidence: low` is deliberate — this is the highest-risk area of the data
layer, because an expiry bug either **grants paid access forever** or
**revokes it from paying customers**. It needs reading with the owner, not
inference.

Evidence: `../data/DATA_OVERVIEW.md` §5.3.
**Fix owner: project owner.**

---

### 17. PricingPage bypasses the API config helper

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`getApiBaseUrl()` (`utils/apiConfig.ts`) resolves the base URL through
`VITE_API_URL` → `VITE_API_BASE_URL` → LAN detection → localhost. It is the
documented, correct path.

`PricingPage.tsx:42` and two sibling files read `import.meta.env.VITE_API_URL`
**directly**, bypassing the helper. They therefore ignore `VITE_API_BASE_URL`
**and all dev-mode LAN detection**.

The result: on a phone or another machine on the LAN, the pricing page — the
**payment** page — builds URLs that point somewhere else, while the rest of the
app works. Payment failures that only reproduce off-localhost.

Evidence: `../APIs/API_OVERVIEW.md` §9.
**Fix owner: frontend — but verify the four call sites first.**

---

### 18. Three payment grant paths, no reconciliation

**Status** CONFIRMED · **Severity** S2 · **Confidence** medium

Paid access is granted by three independent paths:

1. `POST /v1/payment/verify-payment` — synchronous, from the browser
2. the Razorpay webhook — asynchronous, server-to-server
3. `setupProductionDatabase.js` — grants `planTier: 'pro'` in a loop over a
   Razorpay history scan

**None deduplicates against the others.** `payment_webhooks` keys on `eventId`
for idempotency — the correct pattern, and the one place it is done right — but
that protects only path 2 against itself, not against paths 1 and 3.

Evidence: `../data/DATA_OVERVIEW.md` §6, `../rules/DO_NOT_CHANGE.md` §3.
**Fix owner: project owner.**

---

### 20. `MCP_SERVER_URL` points at a different service

**Status** CONFIRMED · **Severity** S2 · **Confidence** high

`render.yaml` sets:

```yaml
MCP_SERVER_URL: https://ui-hub-mcp.onrender.com
```

but the service **defined in the same file** is named `ui-hub-backend-mcp`.

Either an older service still exists, or anything built from this blueprint
calls a hostname that is not the unified backend. This is the value a published
MCP client would use, so a wrong entry here means **a client's documented
endpoint is wrong** — which fails at the first connection attempt, in someone
else's editor.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §5.
**Fix owner: project owner.**

---

### 26. Express 4 cannot catch async errors

**Status** CONFIRMED · **Severity** S2 · **Confidence** medium

`backend` pins `express: ^4.19.2`. In Express 4, a rejected promise from an
`async` handler **does not reach the error middleware** — the request hangs
until the platform timeout.

The final handler returns a bare string:

```js
app.use((err, req, res, next) => { console.error(err.stack); res.status(500).send('Something broke!'); });
```

Most routes have internal `try`/`catch`, which limits the exposure, and the
error message is deliberately opaque in production. But **any new async route
written without an internal `try`/`catch` will hang rather than 500** — and on
Vercel that means burning the full 30-second `maxDuration`.

`confidence: medium` — I did not audit every handler.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §2.
**Fix owner: backend — adopt `express-async-errors` or a v5 upgrade as a
deliberate change.**

---

## S3 — Quality and future work

### 10. Docs document 11 of 14 tools

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`docs/mcp.md` and `MCP.md` document **11 tools**. The registry in
`mcp-server/src/tools/index.ts` registers **14** — `search_by_behavior`,
`get_dependencies`, and `list_all_components` are undocumented. A client author
working from the docs builds against an incomplete surface.

Evidence: `../APIs/API_OVERVIEW.md` §6.3.
**Fix owner: docs — this knowledge base supersedes it.**

---

### 13. MCP session store is in-memory

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`docs/mcp.md` and `MCP.md` both state that `GET /` and `DELETE /` return **405
"in stateless mode"**. They do not: an in-memory session store is implemented.

Because the app runs in **two places** (Vercel + Render, §#2) and sessions are
per-process, a session issued by one instance is invisible to the other, and
none survives a restart. The docs describe a safety property the code does not
have — which is worse than documenting nothing.

Evidence: `../APIs/API_OVERVIEW.md` §6.1.
**Fix owner: docs, or the code.**

---

### 15. `tailwind.config.ts` is dead code

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

Tailwind **4.1.14** is installed, loaded via `@tailwindcss/vite` and
`@import "tailwindcss"`. **There is no `@config` directive**, so the v3 config is
never read.

All 17 colors, all 12 `boxShadow` tokens, and the `font-display`/`heading`/`serif`
families in that file are **inert**. Editing it changes nothing and reports no
error. The live tokens are in `src/index.css` (`:root`, `@theme`).

A v3→v4 migration was started and abandoned partway, leaving the old config as a
decoy. **Anyone using it to learn the palette is reading fiction.**

Evidence: `../design-system/DESIGN_SYSTEM.md` §1.
**Fix owner: delete it, as a deliberate cleanup.**

---

### 16. Light theme is unreachable

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`:root.light` defines a complete 14-token light theme, and **nothing can
activate it**: no `classList.toggle('light')`, no `data-theme`, no
`prefers-color-scheme`, no toggle in any component.

Meanwhile **24 `dark:`-variant usages** respond to Tailwind v4's default strategy,
`prefers-color-scheme` — the **visitor's OS**.

So a visitor with a light-mode OS gets 24 elements in dark-variant styling over
an otherwise hardcoded dark page, and `:root.light` is unreachable dead CSS.

**The trap for future work:** asked to "add a light mode toggle", the obvious
move is to wire a class to the existing `:root.light` block. That ships a
half-working toggle, because the 24 `dark:` elements will not follow. **Resolve
the strategy first.**

Evidence: `../design-system/DESIGN_SYSTEM.md` §2.2, §3.
**Fix owner: design.**

---

### 19. Root `service-account.json` is not ignored

**Status** RISK · **Severity** S3 · **Confidence** medium

`backend/service-account.json` and root `.env` are correctly git-ignored.
**`service-account.json` at the repo root is covered by neither pattern**, so a
Firebase service-account key dropped there would be committed.

The file **does not currently exist**, so nothing is leaked. This is a
preventive gap, listed because the cost of fixing it is one `.gitignore` line
and the cost of missing it is a committed Google credential.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §0.
**Fix owner: one `.gitignore` line.**

---

### 21. VAPID variables absent from config

**Status** CONFIRMED · **Severity** S3 · **Confidence** low

`pushService.js` reads `VAPID_SUBJECT`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`,
and `GET /v1/config/push-vapid` serves the public key to the browser. **No
`VAPID_*` variable appears in `render.yaml` or `.env.example`.**

Push notifications may be unconfigured in production. `confidence: low` — the
variables could be set in the Render dashboard outside the blueprint, which is
exactly why this needs asking rather than assuming.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §5.
**Fix owner: project owner — check the dashboard.**

---

### 22. Activity analytics capped at 90 days

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`activity_logs` has a **90-day TTL** and `mcp_analytics` a 60-day TTL. A
dashboard built on `activity_logs` **silently loses history** with no error — the
documents simply stop existing.

`mcp_audit` has no TTL and grows unbounded, so retention is inconsistent across
the three log collections. Changing a TTL does **not** retro-apply: the index
must be dropped and recreated by hand.

Evidence: `../data/DATA_OVERVIEW.md` §3.2.
**Fix owner: product — decide retention, then migrate the index.**

---

### 23. `npm test` fails at the root

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

The root `package.json` has `test:cli` but **no `test` script**, so `npm test` at
the root fails. There is no single command that runs the whole suite.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §2.
**Fix owner: add a root `test` script.**

---

### 24. Frontend has no tests at all

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

10 test files exist: 4 CLI, 4 MCP, 2 backend. **Zero frontend.** No Vitest, no
Testing Library, no Playwright. `npm run lint` in the frontend is
`tsc --noEmit` — a typecheck, not a linter.

The 137-component catalogue and all payment UI are untested, and the frontend
holds the largest share of user-facing logic. Neither `backend` nor
`mcp-server` has an ESLint config either.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §8.
**Fix owner: project owner — a policy decision.**

---

### 25. No CI anywhere

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

**`.github/workflows/` is empty.** No build, no test, no typecheck runs on push
or pull request. Every check is manual and local.

This is the **root cause** that let #2, #3, and #15 survive: a CI run would have
caught the missing mcp-server build on Vercel, and a typecheck would have flagged
the undefined Tailwind tokens. Both are cheap to add.

Evidence: `../infrastructure/INFRASTRUCTURE.md` §8.
**Fix owner: highest-leverage single fix in this document.**

---

### 27. Admin `/logs` route registered twice

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`GET /logs` is registered **twice** in `mcp-server/src/routes/admin.ts`. Express
uses the first; the second is unreachable dead code.

Harmless, but it means a future edit to the "second" one has no effect — and
nothing indicates which is live.

Evidence: `../APIs/API_OVERVIEW.md` §6.5.
**Fix owner: MCP — but check why it was duplicated first.**

---

### 28. Firestore migration is dead code

**Status** CONFIRMED · **Severity** S3 · **Confidence** high

`migrateFirestoreToMongo.js` migrates from **Firestore**, which is no longer a
dependency. Nothing uses it.

It is, however, **the only artifact recording the Firestore→MongoDB shape
transition** — the closest thing to a historical schema record. Do not delete
casually; do not run it.

Evidence: `../data/DATA_OVERVIEW.md` §11.
**Fix owner: capture the shape here, then delete.**

---

### 29. View and copy counters never increment

**Status** CONFIRMED · **Severity** S3 · **Confidence** medium

The `components` seed writes `viewsCount: 0` and `copyCount: 0` via
`$setOnInsert`. **No verified writer increments them.** They appear to be
analytics counters that never move.

`confidence: medium` — I did not exhaustively search every write path, and a
counter could be incremented by a route I did not read.

Evidence: `../data/DATA_OVERVIEW.md` §6.
**Fix owner: verify, then wire or remove.**

---

### 30. Hardcoded Firebase web config ships

**Status** RISK · **Severity** S3 · **Confidence** high

`frontend/src/main.tsx` initialises Firebase from a **literal config object in
source**, and the `GET /v1/config/firebase` response is **discarded** with the
re-init call commented out.

Firebase web config is public by design and is **not a server secret** — this is
S3, not S1. But it is credential-shaped data in a publicly readable file, and
**rotating it requires a code change and a redeploy** rather than an env var.

It also makes `GET /v1/config/firebase` a dead endpoint, and the config is now
duplicated between the source literal and the backend.

Evidence: `../data/DATA_OVERVIEW.md` §9, `../APIs/API_OVERVIEW.md` §7.
**Fix owner: move to `VITE_*` build-time config. Never copy the values into
documentation.**

---

## Cross-cutting: what these have in common

**31. Every S1 is an *observability* failure as much as a correctness one.**
#2 (MCP missing) and #3 (health hardcoded) are the same bug seen twice: the
system cannot report its own state. The credential leak in #1 is the one
finding that does not fit this pattern, and it is the one that needs a human
today.

**32. The v3→v4 Tailwind migration produced three of these findings** (#4, #5,
#15) plus #16. A single abandoned migration left a dead config, a half-wired
shadcn token set, two broken font stacks, and an unreachable light theme.

**33. Documentation drift is a symptom, not the disease.** #10, #13, and #20 are
all docs describing a system that differs from the code. In each case the code is
fine and the doc is wrong — which is the cheapest kind of finding to fix, and the
kind most likely to have already cost someone an afternoon.

**34. Nothing here is verified at runtime.** Every entry is from reading code and
configuration. The findings most in need of a live check — #12 (uid-keyed
documents), #21 (VAPID), #14 (expiry semantics), #20 (which Render service
exists) — are exactly the ones marked `confidence: medium` or `low`. **Phase 2
exists to close them.**

**35. The build's one real safety net is narrow by design.**
`check-source-coverage.mjs` fails the build if a premium component loses its
source. It is the only invariant enforced automatically, and it checks only that
one thing — which is why #7, #11, and #29 are all invisible to it.

---

## How to use this file

1. **Read the Summary table first.** It is ordered by severity, not by file.
2. **Before touching anything listed, read the linked evidence document.** Each
   entry names the file and line, and the deeper analysis is there.
3. **Check `../rules/DO_NOT_CHANGE.md` before editing.** Several findings are
   also protected invariants — a "fix" can break an undocumented guarantee.
4. **Do not fix findings in passing.** Every S2 and S3 here changes behaviour
   that users, payments, or AI clients depend on. Each needs a decision, a
   deliberate change, and a verification step.
5. **When you fix one, update this file and the linked document in the same
   commit.** A conflict register that only accumulates is worse than none.

---
---

# PHASE 2 ADDENDUM - Runtime-Verified Status (2026-09-30)

Everything above is Phase 1: read from code and configuration, unverified at
runtime. This addendum records what live verification actually showed.

**Phase 1 content above is preserved unchanged.** Nothing was deleted or
rewritten. Evidence: [`runtime/RUNTIME_VERIFICATION.md`](runtime/RUNTIME_VERIFICATION.md) ·
Unknowns: [`runtime/UNKNOWN_REGISTER.md`](runtime/UNKNOWN_REGISTER.md) ·
Numbers: [`runtime/BASELINE.md`](runtime/BASELINE.md)

**No finding was fixed. Phase 2 verified; Phase 3 changes.**

## Headline

**No reachable backend is serving traffic.** The Vercel frontend is up and
compiles every API call to a host that returns 503. Working backend endpoints
at verification time: **0**.

| Finding | Phase 1 status | Phase 2 verdict |
|---|---|---|
| **#1** credential in git | CRITICAL, unactioned | **ROTATION DONE, REMOVAL NOT DONE** |
| **#2** MCP absent on Vercel | "MCP not mounted" | **UNDERSTATED - whole API is dead** |
| **#3** health hardcoded | cosmetic | **CAUSAL - it is why the outage went unnoticed** |
| **#11** `mcp_config.tools` stale | dormant seed | **ESCALATED - live and mis-reporting** |
| **#12** `_id` is email | medium confidence | **CONFIRMED - 33/33, zero uid-keyed docs** |
| **#14** three expiry fields | medium confidence | **CONFIRMED - `proExpiry` only, other two dead** |
| **#20** `MCP_SERVER_URL` wrong | medium confidence | **CONFIRMED and WORSE - three-way mismatch** |
| **#21** VAPID absent | medium confidence | **PARTLY - 0 push subscriptions ever** |
| **#23** `npm test` broken | root has no script | **CONFIRMED and PRECISED - backend's own script is broken** |
| **#10** docs list 11 of 14 tools | confirmed statically | **CONFIRMED - registry is 14, DB config is 4** |

## A1. #1 - Credential rotated, but still in the tree and in history

Owner action **partially complete**. The committed credential no longer
authenticates (`bad auth`), so **rotation has happened**. It remains in
`backend/.env.example` and `mcp-server/.env.example`, in the working tree, at
`HEAD`, and in history since `acf3005a`. The live credential in the git-ignored
`backend/.env` is a **different** value that does authenticate.

The git-history scrub has **not** happened. 7 commits touch the file.

Two related items cleared as **false positives** so they are not re-investigated:
`MCP.md` / `README.md` contain a *masked* placeholder (`cluster0.xxxxx...`,
unresolvable), and the `AIza` hits are a Firebase **web** `apiKey` plus a
coincidental match inside a base64 PNG in `favicon.svg`.

## A2. #2 - Understated: the entire Vercel API is dead, not just MCP

Phase 1 recorded MCP as unmounted on Vercel. Live reality is broader: **every**
`/api/*` path and method returns 500 `FUNCTION_INVOCATION_FAILED`, including the
public health route and a JSON-RPC `tools/list`.

The decisive evidence is `/api/v1/auth/me` sent **without a token** returning
**500 rather than 401**. The function therefore dies before any middleware runs:
it cannot load its module graph. Correlated cause: the Vercel build installs the
root `package.json`, which is missing four backend dependencies - `axios`,
`mongodb`, `web-push`, `zod`. `includeFiles: "backend/**"` also excludes
`mcp-server/**` entirely. Confidence MEDIUM - no Vercel log was available
(`U-02`).

## A3. #3 - The health endpoint is why this went unnoticed

`/health` returns a **hardcoded literal** with no database, Redis, or MCP check
whatsoever. And `server.js:136-137` catches MCP mount failure and downgrades it
to `console.warn`, so the process starts anyway and `/health` keeps reporting
`mcp: 'online'`.

This is not cosmetic. It is the reason no alarm fired when all three backends
went down, and it means `/health` **cannot** be used to verify a future fix
either. Any restoration must add a real dependency check.

## A4. #11 - Escalated: the stale tool config is live and mis-reporting

The live `mcp_config.tools` document:
```
get_component_code: "true"   search_components: "true"
list_components:    "true"   get_component_metadata: "true"
```
- `list_components` **does not exist anywhere** in `mcp-server/` - the real tool
  is `list_all_components`.
- The real registry has **14** tools; the config has **4** keys. Ten tools,
  including `list_all_components`, have no row at all.
- All values are **strings**, and `configService.ts:65` gates on a strict
  `=== false`, so a string `"false"` would **not** disable a tool.

`isToolEnabled()` is therefore **fail-open**: unlisted tools are enabled. And
`admin.ts:1030-1031` counts from the raw DB object, so the admin dashboard
reports **4/4** when the truth is **14/14**.

## A5. #12 and #14 - Both confirmed, both latent rather than active

**Identity:** all **33 of 33** users are email-keyed; **zero** uid-keyed
documents exist. The 3 users lacking a `uid` field are seeded admins created
within 0.3s of each other, matching `MCP_ADMIN_EMAILS` in `render.yaml`. The
dual-lookup code is defensive but unnecessary for the current dataset.

**Expiry:** `proExpiry` is populated on 3 users; `planExpiry`, `planDuration`,
and `planType` are populated on **zero**. The three-way ambiguity is real in code
and **dormant in data** - any path reading `planExpiry` treats everyone as
unentitled. All 3 entitled users share `proExpiry: "2027-03-24"` as a **string**,
and are not expired.

## A6. #20 - Confirmed and worse: a three-way URL mismatch

No single URL in this repository points at a live backend.

| URL | Where it comes from | Status |
|---|---|---|
| `ui-hub-backend-mcp.onrender.com` | service name in `render.yaml:4` | **404** - not deployed |
| `ui-hub-mcp.onrender.com` | `MCP_SERVER_URL`, `render.yaml:18-19` | **503** - suspended |
| `ui-hub.onrender.com` | **compiled into the live frontend bundle** | **503** - Cloudflare challenge |

The third was found only by reading the shipped JavaScript. It appears in **no**
configuration file. `MCP_ALLOWED_ORIGINS` also omits it, so browser-originated
MCP calls would be rejected by CORS even if the host came back.

## A7. New finding - a Cloudflare layer now fronts the API

Not anticipated in Phase 1 and invisible in version control. `ui-hub.onrender.com`
returns a **managed challenge** for HTML routes and **429** for `POST /mcp`,
for both `curl` and a browser User-Agent. Non-browser clients cannot reach the
API at all. Whether real users are affected is **U-01** and needs the owner.

## A8. #23 - The backend's own `npm test` is broken

`node --test tests/` resolves `tests/` as a module path on Node 24 and dies with
`MODULE_NOT_FOUND` - reported by the runner as `1 failed`. **The 21 real tests
never execute.** With the argument corrected, all **21 pass**.

Across the repo: **120 tests, 120 passing** (backend 21, mcp-server 69, cli 30),
all mock-based and fully offline. `frontend` has **no test script at all**.
All three TypeScript packages typecheck clean with **0 errors**.

## A9. #7 and #11 share one blind spot

`check-source-coverage.mjs` is the build's only enforced invariant and it checks
premium *source* resolution only. It is blind to entitlement *data* - which is
why #7 (premium lists never reconciled) and #11 (stale tool config) both survived
a green build.

## A10. New finding - committed `dist` ships a stale data payload

`mcp-server/dist` is **committed** (81 files, not git-ignored) and its **code**
is current - all 14 tools and all 3 routers match `src`. But its **data** is
behind: `templates.json` 807KB vs 872KB, `templateSourceCode.json` 311KB vs
368KB, `sourceCode.json` 1937KB vs 1958KB.

Render's `buildCommand` regenerates this, so a correctly deployed Render service
is unaffected. **Vercel never builds `mcp-server`**, so it would ship the stale
catalogue.

## Cross-cutting: what Phase 2 added

**36. The system's blind spot is self-diagnosis.** #3 (hardcoded health) is the
common cause behind #2 and A7: nothing in the stack can report its own state, so
a total backend outage produced no signal. Fixing observability is a
prerequisite for safely fixing anything else.

**37. Config drift has outrun code drift.** The URL the shipped frontend calls
exists in no config file, `MCP_SERVER_URL` names a service the blueprint never
creates, and `MCP_ALLOWED_ORIGINS` omits the live origin. Three deployment
descriptors, three different answers.

**38. Defensive code is masking latent schema drift.** The uid/email dual lookup
and the three-field expiry logic both look necessary and are both dead against
current data. They are not harmless - they are untested paths that will activate
the moment data changes.

**39. Data-layer unknowns are now largely closed.** #12, #14, and #11 moved from
`medium` confidence to **verified against live data**. What remains is almost
entirely owner-only: dashboards and production env values. See
`runtime/UNKNOWN_REGISTER.md`.

## How to use the addendum

1. **Read the Headline table first** - it is the fastest route to current truth.
2. **Treat a Phase 2 verdict as superseding a Phase 1 status** for the same
   finding number. The Phase 1 text is kept for reasoning and auditability.
3. **Do not treat the 500s as a single outage to restore.** A2, A6, and A7 are
   three independent problems on two platforms.
4. **Nine open questions remain in `runtime/UNKNOWN_REGISTER.md`.** Six need the
   owner. `U-07` is closable by any agent with read-only database access.

---

# PHASE 3 ADDENDUM - Remediation Status (2026-09-30)

Phase 3 changed code. The tables above are the Phase 1/2 record and are left
intact for auditability. This addendum is the current status. Per-change
detail, evidence, and rollback notes are in `runtime/PHASE_3_CHANGES.md`.

## Headline

| ID | Phase 3 status | Note |
|---|---|---|
| 1 | REJECTED WITH REASON | Re-audited. No real password was ever committed. The leak was the cluster host + DB username, now genericised. Password rotation is **not** required. History deliberately not rewritten. |
| 2 | PARTIALLY RESOLVED | Vercel build + `includeFiles` + root deps fixed. MCP is loadable from committed `dist`. **Not deployed** - no project access. |
| 3 | RESOLVED | Dependency-aware health. Mongo down => 503. Second-order fix: the probe had to stop trusting `isMongoConnected()`. |
| 4 | RESOLVED | `--font-heading: "Space+Grotesk"` => `"Space Grotesk"`. 44 usages. |
| 5 | RESOLVED | 8 shadcn tokens added. Button focus ring now renders. 39 usages. |
| 6 | RESOLVED | 3 endpoints (not 4) now `[verifyToken, requireAdmin]`. Hardcoded secret removed. |
| 7 | DEFERRED | Out of Phase 3 scope. |
| 8 | DEFERRED | Out of scope. |
| 9 | DEFERRED | Out of scope. |
| 10 | PARTIALLY RESOLVED | Admin now reports tool drift from the registry, so docs can be diffed against reality. Docs not yet rewritten. |
| 11 | RESOLVED | Coercion + fail-open + `getToolDrift()`. Stale keys still in the live doc - writing it needs owner approval. |
| 12 | DEFERRED | `requireAdmin` now handles both uid and email lookup, which retires the risk for the broadcast path. The wider `users._id` split is untouched. |
| 13 | DEFERRED | Out of scope. |
| 14 | DEFERRED | Out of scope. |
| 15 | CONFIRMED, and worse than stated | Not just inert: its absence is why `--color-brand-green` and the shadcn tokens generated **no CSS at all**. Repaired. |
| 16 | REJECTED WITH REASON, then re-scoped | `:root.light` is **reachable** - `ThemeProvider` is mounted and 16 files use `useTheme`. The real defect is partial: 21 `dark:` usages follow the **OS**, and `@theme --color-brand-*` is literal hex. Strategy change deferred by owner decision. |
| 17-18 | DEFERRED | Payment paths untouched, as required. |
| 19 | DEFERRED | Out of scope. |
| 20 | DEFERRED | Env/blueprint change, owner-only. |
| 21 | PARTIALLY RESOLVED | Redis/push state is now surfaced in `/health`; `VAPID_*` still absent from config. |
| 22 | DEFERRED | Out of scope. |
| 23 | PARTIALLY RESOLVED | Root still has no test script. `backend` + `cli` + `mcp-server` all run real suites now. |
| 24 | NOT ADDRESSED | Frontend still has no tests. CI runs its typecheck and build instead. |
| 25 | RESOLVED | `.github/workflows/ci.yml`, 4 jobs. Definition only - not yet executed on a remote. |
| 26 | DEFERRED | Out of scope. |
| 27 | DEFERRED | Out of scope. |
| 28 | DEFERRED | Out of scope. |
| 29 | DEFERRED | Out of scope. |
| 30 | DEFERRED | Out of scope. |

## Two prior verdicts were wrong

Both corrections matter more than any individual fix, because each one was
previously treated as settled.

**#1 - there is no committed credential.** Re-parsing the example files and
scanning all reachable history found no password-bearing URI. What was committed
was the Atlas host and the application database username. The earlier claim that
a live credential sat in the tree overstated the exposure, and an unnecessary
rotation was implied. The host/username are now genericised.

**#16 - the light theme is reachable, not unreachable.** `ThemeProvider` is
mounted in `App.tsx`, 16 files consume `useTheme`, and it toggles the `light`
class on `<html>`. The genuinely broken part is narrower and different: the 21
`dark:` variants respond to the OS, and the `@theme` brand colours are literal
hex. Toggling light therefore changes the hand-written layer only.

## New finding Phase 3 added

Nine utility classes were used across the app while generating **no CSS**, so
~97 usages rendered unstyled with no error anywhere: `text-brand-green` (36),
`bg-brand-green` (22), `text-muted-foreground` (7), `bg-background` (10),
`bg-accent` (6), `text-foreground` (6), `ring-ring` (5), `bg-muted` (2),
`border-input` (1), `bg-secondary` (1), `ring-offset-background` (1). Root cause
is #15 - the tokens lived in the dead v3 config. All now generate.

## How to use this addendum

1. This table supersedes the status column above for the same finding number.
2. Every deliberate behaviour change is a **tightening**, so each can present as a
   new failure to an operator relying on the old permissive default: `/health`
   now 503s without Mongo, the three broadcast endpoints need an admin Firebase
   token, and the four email-test endpoints return 503 when
   `EMAIL_TEST_SECRET` is unset.
3. Rollback notes per change are in `runtime/PHASE_3_CHANGES.md`.
