# PHASE 3 CHANGES

Phase: 3 — Controlled Remediation, Recovery & Observability
Date: 2026-09-30
Status: COMPLETE WITH DEFERRED ITEMS (see "Remaining work" per record)

One record per logical fix. No secrets are reproduced in this file.

---

## P3-001 — `/health` reported "ok" unconditionally and could not detect an unreachable database

CHANGE ID: P3-001

ISSUE:
`/health` and `/api/health` returned a static `{ status: 'ok' }` with no dependency
check. Separately, the first dependency-aware implementation still produced a
false positive.

ROOT CAUSE:
Two distinct causes.

1. `server.js` hardcoded the response. It never asked whether MongoDB, Redis, or
   the MCP mount were usable.
2. `mongoService.getClient()` assigns the module-level `client` variable
   *synchronously* from `new MongoClient(...)` and only then awaits
   `client.connect()`. `isClientAlive()` only checks that `client` is non-null and
   its topology is not closed. So a health probe that trusted
   `isMongoConnected()` returned `true` for a database whose handshake was still
   pending or was about to fail.

EVIDENCE:
- Hardcoded handler: `backend/src/server.js` returned a literal object.
- False positive reproduced end-to-end. With
  `MONGODB_URI=mongodb://127.0.0.1:1/nowhere`, `NODE_ENV=production`, `VERCEL=1`:
  - direct `getDb()` -> `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:1`
  - `isMongoConnected()` before and after -> `false`
  - full `api/index.js` import -> `HTTP 200`, `status=healthy`,
    `dependencies.mongodb="connected"`
- `dotenv` was ruled out: `dotenv.config()` reported `path=NONE` and
  `MONGODB_URI` was unchanged before/after, so no `.env` masked the bad URI.

FIX:
- Added `backend/src/services/healthService.js` with a dependency-aware report:
  - MongoDB is probed with a real round-trip: `getDb()` then
    `db.command({ ping: 1 })`, bounded by `MONGO_PROBE_TIMEOUT_MS` (3000).
  - `probeMongo` deliberately does **not** use `isMongoConnected()`. That helper
    is a latency guard for `collectionsRoutes`/`favoritesRoutes`; changing its
    semantics was out of scope and would alter their behaviour.
  - Status: Mongo down -> `unhealthy` (503). Mongo up + MCP not mounted ->
    `degraded` (200), because the REST API still serves. Both up -> `healthy`.
  - Redis is optional and never degrades health; it is reported as
    `{ configured, connected, required: false }` from a new `redisStatus` export
    in `rateLimiters.js`.
  - The existing response `message` and the `services.backend` / `services.mcp`
    keys are preserved so existing consumers keep working.

FILES:
- `backend/src/services/healthService.js` (new)
- `backend/src/server.js`
- `backend/src/middleware/rateLimiters.js`
- `backend/tests/health.test.js` (new)

TESTS:
- Added `backend/tests/health.test.js`: 12 cases covering status mapping, HTTP
  status mapping, message/services-key preservation, timeout handling, throwing
  probes, and a throwing-probe regression for the race.
- 12/12 pass. Backend suite 54/54, exit 0.

RUNTIME VALIDATION:
- Unreachable database, full serverless entrypoint: `HTTP 503`,
  `status=unhealthy`, `dependencies.mongodb="disconnected"`, probe returned in
  3113 ms — bounded, not hanging.
- MCP reported `mounted` because `mcp-server/dist` is committed and loadable.

RISK:
Low. `/health` now returns 503 when Mongo is unreachable. A host that gated
deploys on `/health` returning 200 will now correctly refuse to promote an
instance with no database. That is the intended change but it is a behaviour
change and is called out in the report as an owner-visible item.

ROLLBACK:
Revert `server.js` to the previous static handler and delete
`healthService.js`. No schema or data impact.

STATUS: RESOLVED

Remaining work:
`isClientAlive()` still reports a client that is mid-handshake as alive. That is
correct for the callers that use it as a fast guard, but it is a trap for any
future health or readiness check. Consider an explicit `connected` flag in
`mongoService` in a later phase.

---

## P3-002 — `npm test` in `backend` never ran the backend tests

CHANGE ID: P3-002

ISSUE:
`backend/package.json` used `node --test tests/`. On Node 24 that resolves `tests/`
as a module path and fails.

ROOT CAUSE:
Wrong invocation for the Node version. `node --test <dir>` requires a directory
that Node will expand as a test location; the bare relative path with trailing
slash was being treated as a module specifier.

EVIDENCE:
`node --test tests/` ->
`Cannot find module 'C:\Users\Admin\Documents\GitHub\UI-HUB-\backend\tests'`.
The real suite was never executing.

FIX:
- `"test": "npm run check:premium && node --test \"tests/**/*.test.js\""`
- Added `"test:unit": "node --test \"tests/**/*.test.js\""` for the suite without
  the premium gate.
- No existing test was weakened, skipped, or deleted.

FILES: `backend/package.json`

TESTS:
- `check:premium` -> 41/41, exit 0.
- `npm test` -> 54/54 pass, 0 fail, exit 0.

RUNTIME VALIDATION: N/A (test harness change).

RISK: None.

ROLLBACK: Revert the two script strings.

STATUS: RESOLVED

---

## P3-003 — Real cluster host and username committed in both `.env.example` files

CHANGE ID: P3-003

ISSUE:
`backend/.env.example` and `mcp-server/.env.example` carried the production Atlas
host and the application database username, masked only in part. That is enough
for an attacker to identify and target the cluster.

ROOT CAUSE:
Examples were filled in from a real environment rather than from a neutral
template.

EVIDENCE:
- Both examples leaked the real cluster hostname and the app DB username.
- The password placeholder was already `<db_password>`. A full-history scan for
  a real `mongodb+srv://` credential returned no password-bearing URI.
- Docs (`mcp-server/docs/MCP.md`, `README.md`) use a masked
  `cluster0.xxxxx` host and never contain the username.

CORRECTION TO EARLIER REPORTING:
An earlier phase asserted a real committed credential. On re-audit of HEAD and all
reachable history, no real password was found — only masked placeholders plus the
leaked host/username. This record supersedes that claim.

FIX:
Both examples now use a fully generic URI with explicit angle-bracket
placeholders for username, password, cluster host, and database. The real host
and username are gone from the current tree.

FILES:
- `backend/.env.example`
- `mcp-server/.env.example`

TESTS: N/A (no test exercises example files).
Verification: no production hostname or DB username remains in any `*.example`
file, and none appear in the knowledge base or docs.

RUNTIME VALIDATION: N/A.

RISK: None. Example files are not read at runtime.

ROLLBACK: Revert both files. Note that doing so reintroduces the leak.

SECURITY NOTE:
History was **not** rewritten, per the explicit decision to keep this
tree-only. A full clone still contains the historical host/username. Because no
password was ever committed, rotation of the DB password is not required;
removing the host/username from history would be cosmetic.

STATUS: RESOLVED (current tree) / DEFERRED (history)

---

## P3-004 — `mcp_config.tools` was stale and non-deterministic

CHANGE ID: P3-004

ISSUE:
The stored tool config disagreed with the registry. Values had been persisted as
the **string** `"true"` rather than booleans, and a key existed for a tool that is
not in the registry. A strict boolean read would treat `"true"` as not-true and
silently disable tools.

ROOT CAUSE:
Config was written and read as loosely typed values, and nothing reconciled the
stored keys against `TOOL_NAMES`.

EVIDENCE:
Live config showed 4 string-valued entries and a stale `list_components` key;
14 tools are registered. `MCP.md` documented 11.

FIX:
- `configService.ts` gained `coerceToolMap()`: accepts real booleans and the
  strings `"true"`/`"false"`, keeps only keys present in `TOOL_NAMES`, and drops
  everything else. Applied on load, so bad data is normalized in memory.
- Gating stays **fail-open** on purpose: a tool that is absent from the config is
  treated as enabled. A strict `=== true` check would have disabled the
  unconfigured tools.
- `getToolDrift()` reports registered count, configured count, enabled/disabled
  names, unknown keys, implicitly-enabled names, and an `inSync` boolean.
- Admin `/health` now returns a `tools` drift object (replacing the two
  `toolsEnabled`/`toolsTotal` numbers), and admin `/settings` returns
  `toolStates`, `toolDrift`, and the coerced `tools` map.
- The frontend `AdminHealth.config` type and `HealthPage` were updated to render
  drift, including warnings for unknown and implicitly-enabled tools.

FILES:
- `mcp-server/src/config/configService.ts`
- `mcp-server/src/routes/admin.ts`
- `frontend/src/services/admin.ts`
- `frontend/src/pages/Admin/HealthPage.tsx`
- `mcp-server/tests/configService.test.ts` (new)

TESTS:
- `mcp-server/tests/configService.test.ts`: 9 cases — string/bool coercion,
  unknown-key dropping, fail-open default, drift shape, `inSync` true and false.
- Focused run 9/9. Full MCP suite 78/78 across 5 files, exit 0.

RUNTIME VALIDATION:
Read-only inspection of the live config confirmed the precondition. No write was
issued against production.

RISK:
Low. The only functional change is that string `"true"` is now honoured as
enabled. Since gating is fail-open and absent keys are enabled, no tool can be
newly disabled by this change.

ROLLBACK:
Revert the four source files. The coerced map is computed on load and is not
persisted, so rollback is complete.

STATUS: RESOLVED

Remaining work:
The stale keys remain in the live document because Phase 3 is forbidden from
writing production data. Drift is now *visible*; reconciling the stored document
is an owner action.

---

## P3-005 — Three broadcast endpoints had no authorization

CHANGE ID: P3-005

ISSUE:
`/broadcast-reengagement`, `/broadcast-announcement`, and `/push-broadcast` were
reachable with no authentication. Any caller able to reach the service could fire
FCM and email campaigns to real users. An earlier report called these "four"
endpoints; there are three.

ROOT CAUSE:
A shared-secret fallback (`process.env.EMAIL_TEST_SECRET || '<literal>'`) was
used as the gate. A literal committed in source is not a secret.

EVIDENCE:
7 code paths used the fallback (3 broadcast + 4 email-test). 3 seeded admin
accounts exist, so an admin-authorized path was available to build on.
`users._id` is the email, not the Firebase uid, so admin lookup must handle both.

FIX:
- `auth.js` gained `createRequireAdmin(getUsers)`, a dependency-injectable
  factory, and the default `requireAdmin`:
  1. no `req.user` -> 401
  2. look up the user by `uid`, lowercased `email`, or `email`/`_id`
  3. no match -> 403
  4. lookup failure -> 503 (fail closed, DB unreachable)
  5. `isAdmin !== true` -> 403
  6. otherwise stamp `req.user.isAdmin` and continue
- The three broadcast routes are now `[verifyToken, requireAdmin]`: Firebase
  token first, then the Mongo admin check.
- The shared secret was removed from the broadcast routes entirely; they are
  operator-only and reached with a Firebase bearer token.
- A comment in `userRoutes.js` was reworded so the retired fallback value is no
  longer spelled out anywhere in source.

FILES:
- `backend/src/middleware/auth.js`
- `backend/src/routes/userRoutes.js`
- `backend/tests/broadcastAuth.test.js` (new)

TESTS:
- `backend/tests/broadcastAuth.test.js`: 12 cases against an injected fake
  collection — missing user (401), unknown user (403), non-admin (403),
  admin by uid, admin by email, admin by `_id`, case-insensitive email, database
  error (503), and `isAdmin` strict-`true` handling.
- 12/12 pass; backend suite 54/54, exit 0.

RUNTIME VALIDATION:
No live broadcast was sent. Verification is by unit test plus source review of
the middleware chain.

RISK:
Medium, and the direction is intentional: these endpoints now reject anonymous
callers. Any existing caller that relied on the shared secret will get 401 and
must present a Firebase admin token. This is a deliberate, owner-visible
behaviour change. No frontend code calls these routes (verified), so no UI
breaks.

ROLLBACK:
Revert the two files. Rollback restores unauthenticated broadcasting and should
not be done casually.

STATUS: RESOLVED

---

## P3-006 — Four email-test endpoints gated on a hardcoded fallback secret

CHANGE ID: P3-006

ISSUE:
Four email-test routes used
`process.env.EMAIL_TEST_SECRET || '<literal>'`. With the variable unset — the
default on any host that never configured it — the literal was the only gate.

ROOT CAUSE:
`||` provides a usable value precisely when the operator forgot to set one, so
the fail-safe direction was backwards.

EVIDENCE:
4 code paths, all sharing the same fallback literal.

FIX:
- Added `denyUnlessEmailTestSecret(req, res)` in `userRoutes.js`:
  - `EMAIL_TEST_SECRET` unset -> 503 (not 403: the route is not merely forbidden,
    it is not configured)
  - header missing -> 401
  - header mismatch -> 403
  - otherwise `next()` and the route proceeds
- The four routes now use the helper. The fallback literal is gone from all
  executable code. When the variable is unset the endpoints fail **closed**.

FILES:
- `backend/src/routes/userRoutes.js`
- `backend/tests/emailTestSecret.test.js` (new)

TESTS:
- `backend/tests/emailTestSecret.test.js`: 9 cases — unset (503), missing header
  (401), wrong secret (403), correct secret (next), plus independence across
  calls and refusal when the value is an empty string.
- 9/9 pass; backend suite 54/54, exit 0.

RUNTIME VALIDATION: Not exercised against a live mail provider; no mail was sent.

RISK:
Medium. These endpoints stop working on any host where `EMAIL_TEST_SECRET` is not
set — which is exactly the intended fail-closed behaviour, but it will look like
a new 503 to anyone relying on the old default. The owner must set the variable
on Render. No frontend caller exists.

ROLLBACK: Revert `userRoutes.js`. Rollback restores the hardcoded gate.

STATUS: RESOLVED

---

## P3-007 — Vercel could not import the API entrypoint

CHANGE ID: P3-007

ISSUE:
`/api/*` returned `FUNCTION_INVOCATION_FAILED`. The serverless entrypoint imports
the whole backend plus the MCP server, but the repository did not declare the
runtime modules the backend actually imports, and the Vercel build never built
`mcp-server`.

ROOT CAUSE:
Two independent packaging faults.
1. Root `package.json` did not declare `axios`, `mongodb`, or `web-push`, all of
   which the backend imports at runtime. `zod` was needed by the MCP server.
2. `vercel.json` built only the frontend, so `mcp-server/dist` was whatever was
   committed rather than a fresh build, and the `includeFiles` list was malformed
   for the bundler's expected shape.

EVIDENCE:
- Import scan of `backend/src/**` and `mcp-server/src/**` for bare specifiers
  found the four undeclared packages.
- Vercel production frontend served 200 while `/api/*` returned 500.
- React/three/gsap and similar names matched only inside embedded data strings,
  not real imports, and were correctly excluded.

FIX:
- Root `package.json` now declares `axios ^1.19.0`, `mongodb ^7.6.0`,
  `web-push ^3.6.7`, `zod ^3.23.8`. The lockfile gained 18 packages and lost 5
  nested duplicates that now hoist; `devDependencies` count and
  `lockfileVersion` are unchanged, so nothing was pruned.
- `vercel.json`:
  - `buildCommand` now installs and builds `mcp-server` before the frontend.
  - `includeFiles` is a proper array: `backend/**`, `mcp-server/dist/**`,
    `mcp-server/package.json`.
  - `maxDuration` 30.

FILES: `package.json`, `package-lock.json`, `vercel.json`

TESTS: Covered by the builds in P3-009 and the runtime import below.

RUNTIME VALIDATION:
- `api/index.js` imported successfully under `NODE_ENV=production VERCEL=1`, the
  Express app was exported, and `/api/health` responded.
- Import took ~24 s cold, which is within `maxDuration: 30` but leaves little
  headroom.
- **Not deployed.** No Vercel project access was used, so production remains as
  it was.

RISK:
Low locally. The added root dependencies are the same ones the backend already
required at runtime, so this corrects a declaration gap rather than changing
behaviour.

ROLLBACK: Revert the three files.

STATUS: RESOLVED (repository side) / BLOCKED (deployment, needs owner)

Remaining work:
Redeploy and confirm `/api/health` and an authenticated MCP call in production.
Consider trimming the 24 s import.

---

## P3-008 — No CI anywhere

CHANGE ID: P3-008

ISSUE:
The repository had no workflow files at all, so the test command defect in
P3-002 and the missing typechecks were invisible to reviewers.

ROOT CAUSE: No automation had been added.

FIX:
Added `.github/workflows/ci.yml` with four parallel jobs, on push/PR to `main`,
with `concurrency` cancellation:

- **frontend** — `npm ci`, `npm run lint` (`tsc --noEmit`), `npm run build`
- **backend** — `npm ci`, `npm test` (includes the premium-coverage gate)
- **mcp-server** — `npm ci`, `npm test`, `npm run build` (`tsc` doubles as the
  typecheck)
- **cli** — `npm ci`, `npm test`, `npm run build` (`tsc -p` doubles as the
  typecheck)

Notes: the backend job pre-installs the `mcp-server` workspace with
`--ignore-scripts` because `backend` has a `postinstall` that reaches into it.
Each job restores tracked `dist` output after building so a build never shows up
as a source diff.

FILES: `.github/workflows/ci.yml` (new)

TESTS:
- Workflow parses as valid YAML and declares 4 jobs.
- All four `package-lock.json` files exist, so `npm ci` will work.

RUNTIME VALIDATION:
Not executed — no CI provider is connected to this repository. The commands it
runs were each executed locally and pass (see the test/build records).

RISK: Low. A failing job is informative, not destructive.

ROLLBACK: Delete the file.

STATUS: RESOLVED (definition) / BLOCKED (first run needs a remote)

Remaining work:
Enable Actions on the repository and confirm the first green run on Linux, which
is the first time these jobs execute on a non-Windows runner.

---

## P3-009 — Nine design-token utilities generated no CSS at all

CHANGE ID: P3-009

ISSUE:
Several utility classes were used throughout the app but produced no CSS, so the
elements silently rendered unstyled.

ROOT CAUSE:
`tailwind.config.ts` is dead. Tailwind is v4.1.14 loaded through
`@tailwindcss/vite` with `@import "tailwindcss"`, and there is **no `@config`
directive**, so the v3 config object is never read. Editing it changes nothing
and reports no error. The live token source is the `@theme` block in
`frontend/src/index.css`, and it was missing tokens the v3 config had defined.

EVIDENCE (verified against built CSS, not inferred):
- Inert-config proof: `.shadow-neon`, `.shadow-brutal-blue`, `.shadow-glow-green`
  and `.bg-black-rgb` are absent from the built stylesheet, while
  `.bg-brand-bg` is present and resolves to `var(--color-brand-bg)`.
- `--font-seekuw` (defined only in `@theme`) was likewise absent, confirming
  `@theme` is the live path.
- Missing tokens, with usage counts:
  - `--color-brand-green` — 36 `text-brand-green` + 22 `bg-brand-green`
  - `--color-ring` — 5 `ring-ring` (from `components/ui/button.tsx`)
  - `--color-background` — 10 `bg-background` + 1 `ring-offset-background`
  - `--color-foreground` — 6 `text-foreground`
  - `--color-muted-foreground` — 7
  - `--color-accent` — 6
  - `--color-secondary` — 1
  - `--color-muted` — 2
  - `--color-input` — 1
  - Plus `--font-heading: "Space+Grotesk"` — the `+` is a Google Fonts URL
    artefact, not a family name, so the family never resolved and 44 usages fell
    back to `sans-serif`.

FIX:
Minimal, evidence-driven repair confined to the `@theme` block of
`frontend/src/index.css`. No selectors, no `:root`/`:root.light` values, and no
hand-written brutalist class were touched.

- `--font-heading: "Space Grotesk"` (removed the `+`)
- `--color-brand-green: #3D5CFF` — the v3 config's stated intent was to re-route
  the legacy brand green to primary blue
- shadcn semantic tokens: `--color-background`, `--color-foreground`,
  `--color-muted`, `--color-muted-foreground`, `--color-accent`,
  `--color-secondary`, `--color-input`, `--color-ring`

FILES: `frontend/src/index.css`

TESTS:
- Rebuilt and re-inspected the emitted stylesheet. All 11 previously-dead
  utilities now generate, and `Space+Grotesk` no longer appears anywhere while
  `Space Grotesk` does.
- `npm run lint` (`tsc --noEmit`) exit 0.

RUNTIME VALIDATION:
Static verification against the built CSS. **No visual verification was performed**
— see risk.

RISK:
Medium, and this is the one change in Phase 3 that alters appearance. ~58
elements using `brand-green` and ~39 using the shadcn utilities were previously
rendering with no colour at all; they will now paint. The intended result is that
missing styling appears, but a designer should eyeball the affected pages. The
Button keyboard focus ring — previously invisible on every page — will now
render, which is the point of the change.

No file outside the `@theme` block was edited, and this is the reason the change
was kept minimal rather than re-pointing the brand tokens at the `:root` vars
(see P3-010).

ROLLBACK: Revert the `@theme` block. The classes return to being no-ops.

STATUS: RESOLVED

Remaining work:
Visual review of the admin, library, and pricing pages. Consider deleting or
archiving `tailwind.config.ts`, since it will mislead the next reader exactly as
it misled this phase.

---

## P3-010 — Light mode is half-wired; no behaviour change made

CHANGE ID: P3-010

ISSUE:
The product exposes a light/dark toggle, but toggling it only changes part of the
UI.

ROOT CAUSE:
Two independent theme mechanisms that do not talk to each other.
1. `:root.light` defines 14 tokens and the hand-written CSS layer
   (`.brutal-shadow-*`, `body` background/text) reads them, so those do follow
   the toggle.
2. Tailwind's `dark:` variants follow the **operating system**, because Tailwind
   v4 defaults to `prefers-color-scheme` and there is no `@custom-variant dark`
   anywhere in the CSS. The `@theme --color-brand-*` values are literal hex, so
   `bg-brand-*` utilities ignore the toggle entirely.

So the 21 `dark:` usages and every `brand-*` utility stay on the OS setting while
the rest of the page flips.

EVIDENCE:
- `ThemeProvider` is genuinely mounted in `App.tsx`; 16 files call `useTheme`;
  it toggles the `light`/`dark` class on `<html>` and persists to localStorage.
- `:root.light` is present in the built CSS.
- 21 `dark:` variant usages; `@custom-variant` and `prefers-color-scheme` are
  both absent from `index.css`.

CORRECTION TO EARLIER REPORTING:
A prior phase recorded that `:root.light` was *unreachable* and that no toggle
existed. That is wrong — the toggle is wired and the light tokens do apply. The
accurate description is the one above: reachable, but only partially effective.

FIX:
Deliberately **no behaviour change.** The user was asked to choose between a
minimal token repair, a full light-mode fix, or deferral, and chose the minimal
repair, on the basis that completing light mode means editing the theme strategy
in the highest-blast-radius file in the frontend and changes appearance
application-wide.

This record is the explicit resolution of the light-mode question required by the
Phase 3 success criteria: the behaviour is now *known and documented* rather than
assumed broken.

FILES: none (documentation only)

RUNTIME VALIDATION: N/A — no behaviour was changed.

RISK: None from inaction; the inconsistency persists and is now recorded.

Two complete options for a later phase, both requiring
`frontend/src/index.css`:
- **Class-driven.** Add
  `@custom-variant dark (&:where(.dark, .dark *));` so the 21 `dark:` usages
  follow the existing toggle instead of the OS, and re-point the `@theme`
  `--color-brand-*` values at the `:root` / `:root.light` variables so
  `brand-*` utilities become theme-aware. This is the coherent fix.
- **Delete.** Remove `:root.light` and the toggle, and accept OS-driven theming.
  Fewer states, no partial theming.

Rollback: N/A — nothing changed.

STATUS: DEFERRED (with the evidence recorded, and the decision owned by the user)

---

## Cross-cutting: what Phase 3 added

- Static analysis lied in three separate places. `isMongoConnected()` reported a
  pending handshake as success; `tailwind.config.ts` reported a theme that was
  never loaded; the `mcp_config` seed disagreed with the registry. In each case
  the fix was to verify against a real artifact — an HTTP response, the emitted
  stylesheet, the tool registry — instead of against the code that claimed to
  describe it.
- Two earlier reports were wrong and are corrected above: the committed
  credential (P3-003) and the unreachable light theme (P3-010).
- Every deliberate behaviour change is a *tightening*: `/health` returns 503 when
  Mongo is down, three broadcast endpoints require an admin Firebase token, and
  four email-test endpoints fail closed when unconfigured. Any of these can look
  like a new failure to an operator who was relying on the old permissive
  default.
