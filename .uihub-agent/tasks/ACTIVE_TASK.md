# ACTIVE TASK — Phase 2 Complete → Phase 3 Handoff

**Status:** Phase 1 (discovery) **and** Phase 2 (runtime verification) complete.
**No application code has been changed in either phase.**
**This file is the entry point for the next session.**

> ### ⚠️ Read this before anything else
>
> **The product has no working backend.** Verified live on 2026-09-30: every
> reachable API endpoint returns 500 or 503. The Vercel frontend is up and
> compiles every API call to a host that returns 503.
>
> **This is not a code-quality backlog. It is an outage with a quality backlog
> attached.** Restoration is Phase 3. Start at
> [`../runtime/RUNTIME_VERIFICATION.md`](../runtime/RUNTIME_VERIFICATION.md) §0.
>
> **Phase 2's three owner decisions are recorded at the end of this file.**

Read in this order: `../PROJECT_CONTEXT.md` → `../CONFLICTS.md` (Headline
table) → `../runtime/RUNTIME_VERIFICATION.md` → the relevant reference document
→ *then* the source.

---

## What Phase 2 produced

Three new files, all inside `.uihub-agent/runtime/`, plus evidence appended to
`../CONFLICTS.md`. Phase 1's content above and below is **preserved unchanged**.

| File | Purpose |
|---|---|
| `../runtime/RUNTIME_VERIFICATION.md` | Live evidence: Vercel, Render, data layer, dist, security |
| `../runtime/UNKNOWN_REGISTER.md` | 9 questions Phase 2 could not settle, with who can answer |
| `../runtime/BASELINE.md` | 120 tests, 0 type errors, deployment and data reference numbers |

**The single most important result:** `/health` is a hardcoded literal that
reports `mcp: 'online'` even when MCP failed to mount (`server.js:136-137,
141-152`). **Nothing in the stack can report its own state**, which is why a
total outage produced no signal. Fixing observability is a prerequisite for
safely fixing anything else.

---

## What Phase 1 produced

Fourteen files, all inside `.uihub-agent/`. One generated, thirteen written.

| File | Purpose |
|---|---|
| `AGENT.md` | Rules, source precedence, selective loading, secret policy |
| `PROJECT_CONTEXT.md` | Orientation: stack, workflows, risks, unknowns |
| `PROJECT_MAP.json` | **Generated** machine-readable census |
| `scripts/generate-map.mjs` | The generator. `--check` verifies freshness |
| `architecture/ARCHITECTURE.md` | System, data, auth, deployment, flows |
| `codebase/DIRECTORY_MAP.md` | Directories and important files |
| `features/FEATURES.md` | 22 product features |
| `APIs/API_OVERVIEW.md` | 38 REST, 14 MCP tools, 6 integrations |
| `data/DATA_OVERVIEW.md` | 12 collections, entitlements, retention |
| `design-system/DESIGN_SYSTEM.md` | Tokens, Tailwind v4 reality, motion |
| `infrastructure/INFRASTRUCTURE.md` | Build, deploy, env contract |
| `rules/DO_NOT_CHANGE.md` | Protected invariants and change checklist |
| `CONFLICTS.md` | 30 verified findings, severity-ranked |
| `tasks/ACTIVE_TASK.md` | This file |

**Start here:** `../CONFLICTS.md` — its Summary table is ordered by severity and
is the fastest route to the work that matters.

---

## Phase 2 objective

**Close the `confidence: medium` and `confidence: low` findings, and get the
credential rotated.** Phase 1 read code; it did not run the product. Every
open question below needs either a live system or the owner.

**Phase 2 does not fix bugs.** It establishes facts. Fixes come in Phase 3+,
deliberately, one at a time.

---

## Task 1 — Rotate the MongoDB credential. Do this first.

**Why it is first:** it is the only finding that is actively harmful today, and
it is the only one that gets worse with delay. Everything else is a quality
problem.

`backend/.env.example` is **tracked in git** and contains a real MongoDB Atlas
connection string with an embedded username and password (plus a real Brevo SMTP
account id). Verified by parsing the string.

**Owner actions, in order:**

1. **Rotate the Atlas database password.** Nothing else matters until this is
   done. The value is in git history — editing the file does not secure it.
2. Update the new value in the Render dashboard and in local `.env`.
3. Replace the value in `.env.example` with an obvious placeholder:
   `mongodb+srv://<user>:<password>@<cluster-host>/<db>`.
4. Check Atlas **network access** — if the cluster allows access from anywhere,
   restrict it.
5. **Optional:** scrub history (`git filter-repo`, or BFG) — only *after* the
   rotation, and only if the repo's history matters to you. Rotation alone
   secures the credential.

**Do not** commit the new value anywhere, including this knowledge base.
**Do not** paste the old or new URI into any doc, log, or issue.

**Verify:** an Atlas connection using the old password fails.

**Related:** `CONFLICTS.md` #1, `infrastructure/INFRASTRUCTURE.md` §0.

---

## Task 2 — Resolve the two observability unknowns

### 2a. Is MCP actually served on Vercel? (`#2`)

The code says it should be; the `vercel.json` config says it cannot be.

```jsonc
"buildCommand": "npm install && cd frontend && npm install && npm run build",
"functions": { "api/index.js": { "includeFiles": "backend/**" } }
```

Neither builds nor includes `mcp-server`, and `server.js:128` imports
`mcp-server/dist/`.

**How to settle it — cheapest first:**

```powershell
# Does the Vercel deployment serve MCP at all?
curl -s -o NUL -w "%{http_code}" -X POST https://<your-vercel-domain>/api/mcp `
     -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Compare against the Render host. Also grep the Vercel function logs for
`[MCP] ⚠️` — a bare `404` on `/mcp` **confirms** the finding.

**If MCP is confirmed absent on Vercel:** the frontend's `services/mcp.ts` must be
pointing at Render for it to work at all. Find out how, because that determines
whether the CORS allow-list and `MCP_SERVER_URL` are correct.

### 2b. Which Render service is live? (`#20`)

`render.yaml` defines `ui-hub-backend-mcp` but sets
`MCP_SERVER_URL: https://ui-hub-mcp.onrender.com`.

- List the Render services. Does `ui-hub-mcp` still exist?
- Which one is the frontend actually calling?
- If both exist, one is idle — and if the *old* one is the live one, the "unified
  deployment" is not unified.

**Verify:** the hostname in `MCP_SERVER_URL` resolves to the service that serves
`/health`.

---

## Task 3 — Resolve the data-layer unknowns

These need database access, not code reading.

### 3a. Do uid-keyed user documents exist? (`#12`)

`users._id` is the lowercased email, but `userRoutes.js:821` has a fallback
branch querying `{ _id: uid }`. No current writer creates such a document.

```javascript
// read-only, run against a production snapshot — never production directly
db.users.countDocuments({ _id: { $regex: /@/ } })   // expect == total
db.users.countDocuments({ _id: { $not: /@/ } })     // if > 0, legacy uid docs exist
db.users.find({ _id: { $not: /@/ } }).limit(5)
```

**If the second count is 0**, the `$or` branch is dead code and can be
simplified. **If it is non-zero**, those documents need migrating to
email-keyed ids before anything else touches that query.

**Do not run write queries against production.** Take a snapshot first.

### 3b. What are the real expiry semantics? (`#14`)

`proExpiry`, `planExpiry`, and `planDuration` all exist, and the relationship
between them is undocumented. This is the **highest-risk area of the data
layer**: a bug here either grants paid access forever or revokes it from paying
customers.

**Read `accessService.js` and `firebaseService.fulfillPayment` with the owner
and answer:** which field is authoritative? What happens when it is absent? Is
`checkProStatus` independent of the expiry fields? **Do not change any of it
before these are answered.**

### 3c. Do `users.status` values disagree in practice? (`#8`)

`db.users.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }])`

Confirms the split between `'FREE'` and `'active'`, and gives the migration size
for whenever a fix is approved.

---

## Task 4 — Check the push configuration (`#21`)

`VAPID_SUBJECT` / `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` are read by
`pushService.js`, but **none appears in `render.yaml` or `.env.example`.**

- `curl -s https://<render-host>/v1/config/push-vapid` — an empty or error
  response means push is unconfigured.
- Check the Render dashboard for `VAPID_*` set outside the blueprint.

If absent, then `POST /v1/users/push-subscribe` and the three broadcast/push
paths write data nothing can ever send.

---

## Task 5 — Establish a test baseline

**Do not fix anything. Just run what exists and record the result.**

```powershell
cd backend    ; npm test    # check:premium + node --test  (2 files)
cd mcp-server ; npm test    # vitest                        (4 files)
cd cli        ; npm test    # node:test + tsx               (4 files)
cd frontend   ; npm run lint   # tsc --noEmit  (NOT a linter)
```

Record for each: pass, fail, or **cannot run** (missing install, missing env).
`mcp-server` tests may need a database or API keys — **if so, that is itself a
finding**: the test suite is not self-contained.

**There is no CI** (`#25`), so nothing has been running these automatically.
A recorded baseline is what makes a later "did I break something?" answerable.

**Related:** `#23` (no root `test`), `#24` (no frontend tests), `#25` (no CI).

---

## Task 6 — Ask the owner the questions code cannot answer

These are not research tasks. **Ask.**

| # | Question | Why code cannot answer it |
|---|---|---|
| 1 | **Is `GET /v1/payment/recover-jainil` still needed?** | Unauthenticated, owner-named, no identified caller, `confidence: low` |
| 2 | **Should the 4 broadcast endpoints require admin auth?** (`#6`) | A product decision about who may email all users |
| 3 | **Should elite remain invisible to the frontend?** (`#9`) | Tier policy |
| 4 | **Is `:root.light` wanted?** (`#16`) | 14 tokens were written deliberately — or copied and abandoned |
| 5 | **Are the 22 loaded fonts intentional?** | 19 exist for component previews; the split is undocumented |
| 6 | **What are the 90-day / 60-day retention requirements?** (`#22`) | Product/compliance, not code |
| 7 | **Is the leaked Atlas credential's cluster still in use?** | Dashboard state |
| 8 | **Why is the admin `/logs` route duplicated?** (`#27`) | Copy-paste, or two intents |
| 9 | **Is `tailwind.config.ts` safe to delete?** (`#15`) | Confirm no external tool reads it |

---

## Explicitly out of scope for Phase 2

Do **not** do these, even though they are all documented and tempting:

- Fixing any `CONFLICTS.md` finding
- Adding the `verifyToken` to the broadcast endpoints
- Rotating keys, migrating documents, or writing to any database
- Editing `tailwind.config.ts` or `index.css`
- Adding CI, ESLint, or frontend tests
- Upgrading Express or adopting the MCP SDK
- Touching `agent.md` — it is the owner's document
- Committing or pushing

---

## Phase 3 preview — when Phase 2 is done

Recommended order, **subject to the owner's decisions**:

1. **The observability fix.** Make `/health` actually check MongoDB, and report
   MCP mount status from the `try` block instead of a literal. *(Addresses
   `#3`, and is what would have caught `#2`.)*
2. **Auth on the broadcast endpoints.** `verifyToken` + an admin check. *(`#6`)*
3. **CI: build + test + typecheck on push.** The highest-leverage single change
   in the document — it is what stops the next three findings from recurring.
   *(`#25`)*
4. **Fix the Tailwind token gaps** — `--color-ring`, `--color-background`,
   `--color-foreground`, `--color-input`; then `--font-heading`. Small,
   contained, and unblocks the focus ring. *(`#4`, `#5`)*
5. **Decide the light-mode strategy**, then implement it or delete `:root.light`.
   *(`#16`)*
6. **Reconcile the premium lists** with a check that fails the build. *(`#7`)*
7. **Only then** the larger migrations: user ids, `status` vocabulary, expiry
   semantics, MCP-on-Vercel.

**Each is a separate, deliberate change with its own verification.** None should
be bundled.

---

## Working rules for the next session

1. **Regenerate the map first** if anything in the source changed:
   `node .uihub-agent/scripts/generate-map.mjs --check`
2. **Read `../rules/DO_NOT_CHANGE.md` before editing** any file in it.
3. **Read the linked evidence document**, not just this summary — the reasoning
   and the confidence levels are there.
4. **Check `confidence: low`** findings against reality before acting.
5. **One finding per change.** None of these are safe to batch.
6. **Update `CONFLICTS.md` and the linked document in the same commit** as any
   fix. A register that only accumulates is worse than none.
7. **Never write a secret value into any file**, including these.

---
---

# PHASE 2 RESULTS (2026-09-30)

Phase 2 ran against commit `41938a67`. **It fixed nothing.** It established
facts. Each Phase 2 task below is answered with the evidence that answered it.

## Task 1 — Credential: 🟡 ROTATED, removal outstanding

**Rotation is done.** The committed credential no longer authenticates
(`bad auth`). The live credential in the git-ignored `backend/.env` is a
*different* value that does authenticate — so a working credential exists and
the exposed one is dead.

**Still outstanding:** the value remains in `backend/.env.example` and
`mcp-server/.env.example`, in the working tree, at `HEAD`, and in history since
`acf3005a` (7 commits). The history scrub has **not** happened.

Also cleared, so nobody re-investigates them: `MCP.md` / `README.md` hold a
*masked* placeholder (`cluster0.xxxxx…`, unresolvable), and the `AIza` hits are
a Firebase **web** `apiKey` plus a coincidence inside a base64 PNG.

## Task 2 — Observability: 🟢 RESOLVED, and worse than expected

**2a — Is MCP served on Vercel? No, because *nothing* is.** Every `/api/*` path
and method returns 500 `FUNCTION_INVOCATION_FAILED`. The decisive probe:
`/api/v1/auth/me` sent **without a token** returns **500, not 401** — the
function dies before any middleware runs, so it cannot load its module graph.
Correlated cause: the root `package.json` is missing four backend deps
(`axios`, `mongodb`, `web-push`, `zod`), and `includeFiles: "backend/**"`
excludes `mcp-server/**`. Confidence MEDIUM — no Vercel log (`U-02`).

**2b — Which Render service is live? None of them.** A three-way mismatch:

| URL | Source | Status |
|---|---|---|
| `ui-hub-backend-mcp.onrender.com` | name in `render.yaml:4` | **404** — not deployed |
| `ui-hub-mcp.onrender.com` | `MCP_SERVER_URL`, `render.yaml:18-19` | **503** — suspended |
| `ui-hub.onrender.com` | **compiled into the live bundle** | **503** — Cloudflare challenge |

The third was found only by reading the shipped JavaScript
(`/assets/index-DYhd2CmH.js`, 322,739 bytes). It appears in **no** config file.
`MCP_ALLOWED_ORIGINS` omits it too, so CORS would reject browser MCP calls even
if the host returned.

## Task 3 — Data layer: 🟢 ALL THREE RESOLVED

**3a — uid-keyed documents? None.** 33 of 33 users are email-keyed. Zero
uid-keyed `_id`s. The 3 users lacking a `uid` field are seeded admins created
within 0.3s of each other, matching `MCP_ADMIN_EMAILS`. The dual-lookup code is
defensive but unnecessary for the current dataset.

**3b — Expiry semantics? `proExpiry`, unambiguously.** Populated on 3 users;
`planExpiry`, `planDuration`, `planType` populated on **zero**. The three-way
ambiguity is real in code and **dormant in data** — any path reading
`planExpiry` treats everyone as unentitled. All 3 share the string
`"2027-03-24"` and are not expired.

**3c — `users.status`?** Not checked — carried as `U-07`. It is the **only**
remaining unknown any agent can close alone, with one read-only `aggregate`.
Phase 1 `#8` is therefore **not** resolved.

## Task 4 — Push: 🟡 INDIRECT EVIDENCE ONLY

**Zero users** hold `pushSubscriptions`, `pushSubscription`, or `fcmTokens`, and
`render.yaml` declares no `VAPID_*` variables. Consistent with Web Push never
completing a registration — but env values were not read, so "absent" and
"present but unused" remain indistinguishable (`U-04`).

## Task 5 — Test baseline: 🟢 120/120 PASSING, one broken script

| Package | Result |
|---|---|
| backend | `npm test` **broken**; corrected invocation **21/21 pass** |
| mcp-server | **69/69 pass** |
| cli | **30/30 pass** |
| frontend | **no test script exists** |

`npm run check:premium` passes: 41/41 premium components resolvable.

`backend`'s script is `node --test tests/` — on Node 24 that resolves `tests/`
as a *module path* and dies with `MODULE_NOT_FOUND`, which the runner reports as
`1 failed`. **The 21 real tests never execute.** All 10 test files are
mock-based with no external service imports, so the suite is fully offline.

Typecheck: **0 errors** across frontend, mcp-server, and cli. The frontend pass
is genuine — 339 source files confirmed in the program via `--listFiles`, not an
empty one. Backend parse-checks clean on 6 core modules, but note this proves
**parseability only, not import-time correctness** — which is exactly what breaks
on Vercel. No `typecheck` script exists in any package, so nothing enforces it.

**No build baseline exists** — builds were deliberately skipped, so `frontend/dist`
and `mcp-server/dist` are untouched and `npm run build` remains unmeasured.

## Two findings Phase 2 did not anticipate

**A Cloudflare layer now fronts the API** (`A7`). `ui-hub.onrender.com` returns a
managed challenge for HTML and **429** for `POST /mcp`, for both curl and a
browser User-Agent. Non-browser clients cannot reach the API. Whether real users
are blocked needs the owner (`U-01`). No Cloudflare config exists in the repo.

**The committed `dist` ships a stale data payload** (`A10`). Code is current — all
14 tools, all 3 routers match `src`. Data is not: `templates.json` 807KB vs 872KB,
`templateSourceCode.json` 311KB vs 368KB. Render's `buildCommand` regenerates it;
**Vercel never builds `mcp-server`**, so it would ship the stale catalogue.

## Phase 3 — revised priority

The Phase 1 preview above assumed a working system. It is not. Reordered by
dependency, not by severity:

1. **Establish whether users are actually blocked** (`U-01`) — sets everything else.
2. **Deploy a working backend** — the Render 404/503 and the Vercel 500 are
   **three independent problems on two platforms** (`A2`, `A6`, `A7`).
3. **Add a real health check** that actually pings Mongo, Redis, and MCP. Until
   this exists, no restoration can be verified and no future outage will be seen.
4. **Get the credential out of the tree and history** (`A1`).
5. Auth on the broadcast endpoints (`#6`) — *(`#6`)*
6. **CI: build + test + typecheck on push** — still the highest-leverage
   single quality change, and note `backend`'s test script must be fixed first
   or CI reports phantom failures. *(`#23`, `#25`)*
7. Fix `configService` fail-open + the admin tool count (`A4`).
8. The Tailwind token gaps (`#4`, `#5`), light-mode decision (`#16`), premium
   list reconciliation (`#7`).
9. Only then the larger migrations: user ids, `status` vocabulary, expiry
   semantics, MCP-on-Vercel.

**Items 1–4 are outage response. Items 5–9 are the original quality backlog.**

## Phase 2 owner decisions (recorded for audit)

Three scope questions were put to the owner before execution:

| Decision | Choice | Consequence |
|---|---|---|
| Database access | Read-only queries against production, tightly scoped | Tasks 3a/3b answered from live data |
| Outage depth | Document as evidence, no deeper root-causing | Three independent causes named, none diagnosed |
| Build artifacts | Typecheck-only, no artifact-writing builds | Working tree stayed clean; **no build baseline** |

Access was `countDocuments`, `aggregate`, and `findOne` with projections only.
**Zero writes.** No secret value appears in any Phase 2 document — only SHA-256
fingerprints and hostnames.

---

# PHASE 3 RESULTS (2026-09-30)

Status: **COMPLETE**, with 4 items deliberately deferred and 3 blocked on owner
access. Per-change detail: `runtime/PHASE_3_CHANGES.md`.

## Task outcomes

| # | Task | Result |
|---|---|---|
| 3.1 | Truthful `/health` | DONE - plus a second-order false-positive fix |
| 3.2 | Fix `npm test` | DONE - 54/54, was running zero tests |
| 3.3 | Credential hygiene | DONE in tree; history deliberately untouched |
| 3.4 | MCP tool gating | DONE - coercion + fail-open preserved |
| 3.5 | MCP config vs registry | DONE - drift now visible in admin |
| 3.6 | Broadcast + email auth | DONE - 3 endpoints, hardcoded secret gone |
| 3.7 | Vercel packaging | DONE locally; deploy is owner-only |
| 3.8 | CI | DONE - 4 jobs; first remote run pending |
| 3.9 | Token repair | DONE - 11 dead utilities, ~97 usages |
| 3.10 | Light mode | DECIDED and documented - no behaviour change, by user choice |

## Verification totals

- Tests: backend 54/54, mcp-server 78/78, cli 30/30, all exit 0. Frontend has no
  tests.
- Premium source coverage 41/41.
- Typecheck: 3/3 TypeScript packages clean.
- Builds: frontend, mcp-server, cli all exit 0. Backend has no build step.
- Tracked `mcp-server/dist` restored after building. `frontend/dist` and
  `cli/dist` are gitignored.

## Owner actions still required

1. **Redeploy on Vercel.** The repository-side failure is fixed but production
   still returns 500 until someone deploys.
2. **Set `EMAIL_TEST_SECRET` on Render** if the four email-test routes are meant
   to work. They now fail closed with 503 instead of accepting a committed
   literal. Tracked as `U-10`.
3. **Reconcile `mcp_config.tools`.** Drift is reported by admin `/health` and
   `/settings`; writing the live document needs owner approval.
4. **Answer the remaining unknowns in one batch** - see
   `runtime/UNKNOWN_REGISTER.md`. Six of nine need dashboard or env access, and
   no amount of further autonomous work will close them.
5. **Review pages affected by the token repair.** ~97 usages that rendered
   unstyled will now paint. No visual check was possible here.

## Intentional behaviour changes - read before assuming a regression

All three tightenings, all deliberate:

1. `/health` returns **503** when MongoDB is unreachable. A deploy gate keyed on
   `/health` returning 200 will now correctly refuse a database-less instance.
2. The three broadcast endpoints require an **admin Firebase token**. Anything
   relying on the old shared secret gets 401. No frontend caller exists.
3. The four email-test endpoints return **503** when `EMAIL_TEST_SECRET` is
   unset. No frontend caller exists.

## Two earlier verdicts were wrong

- **"A live MongoDB credential is committed."** No real password was ever
  committed; the exposure was the Atlas host plus DB username. Password rotation
  is not required.
- **"The light theme is unreachable."** The toggle is mounted and `:root.light`
  does apply. The real, narrower defect: 21 `dark:` variants and every `@theme`
  brand colour ignore the toggle.

## Do not do these again

- Do not trust `isMongoConnected()` as a readiness signal - it reports a
  mid-handshake client as connected. Ping instead.
- Do not edit `tailwind.config.ts`. It is inert and will silently do nothing.
  The live theme is the `@theme` block in `frontend/src/index.css`.
- Do not treat the ten `UNKNOWN_REGISTER` items as research tasks. Nine are
  owner questions. The tenth, `U-07`, is now closed.

---

# PHASE 4 COMPLETE (2026-09-30)

## What Phase 4 changed

Two commits on `phase4/production-recovery`, both unpushed-until-owner-review:

| Commit | Contents |
|---|---|
| `0bdd0aa6` | All Phase 3 work (see `runtime/PHASE_3_CHANGES.md`) |
| Phase 4 commit | Rebuilt `mcp-server/dist` + this knowledge base |

The only production-relevant code change in Phase 4 is the **rebuilt
`mcp-server/dist`**. No application source, no configuration, and no
infrastructure was modified.

## The three findings that matter

1. **The tracked `mcp-server/dist` was stale and was shipping.** It was missing
   `image-compare`, `image-lens`, `matrix-rain`, `visionary-orb-hero`, and the
   entire Phase 3 config change (`coerceToolMap`, `getToolDrift`, and the admin
   routes). It is the artefact the MCP server actually executes. Rebuilt; all 7
   generated files are now byte-identical to `src/data`.

2. **Fixing the Vercel function will not restore the site.** The served frontend
   bundle contains the Render API host and `getApiBaseUrl()` prefers
   `VITE_API_URL` in production, so the browser never calls the Vercel function.
   `VITE_API_URL` must be unset (or repointed) and the frontend rebuilt. This is
   the single highest-value owner action.

3. **`https://ui-hub-design.vercel.app/health` is a false signal.** It returns 200
   with a 6474-byte HTML SPA shell, byte-identical to `/`. Anyone using it to
   judge backend health is reading the frontend. The real path is `/api/health`.

## Unknowns

`U-07` **closed**: `users.status` = `{"FREE": 30, "active": 3}` - both
vocabularies genuinely coexist in live data. `U-04` answered on the data side
(zero push subscriptions). `U-06` strongly supported (cluster fingerprint
reproduced exactly). One prior claim **corrected**: `mcp_config.tools` values are
booleans, not strings. See `runtime/UNKNOWN_REGISTER.md`.

## Owner actions, in dependency order

1. **Unset `VITE_API_URL`** on the frontend build and rebuild. Without this,
   nothing else matters.
2. **Deploy** so the Vercel function can be retested. Pushing this branch should
   produce a Vercel preview if Git integration is enabled.
3. **Retest** `/api/health` and `/api/v1/*`. If still 500, read the Vercel
   function logs - the repository side is already correct, so a persistent 500
   is an environment difference and the log names the specifier.
4. **Open a PR** to run CI remotely. The workflow does not trigger on a
   branch push, and no `gh` CLI is available here.
5. **Decide the fate of the two Render services.** Both are down; the blueprint
   specifies `plan: starter`, which bills while active.
6. **Answer the remaining nine unknowns in one batch** - all need dashboard or
   env access.

## Do not do these again

- Do not treat `mcp-server/dist` as disposable. It is tracked, it is what runs,
  and it silently drifts from `src`. `check-source-coverage.mjs` validates only
  `src/data` and reported 41/41 while dist was three components behind. Extend
  it to diff the two trees.
- Do not verify the backend through `/health` on the frontend hostname. Use
  `/api/health`.
- Do not assume a deployed fix is live. A 500 recorded before a redeploy is not
  evidence about the current code; re-probe after deploying.
