# KNOWN FAILURES

**Owner:** Phase 10 — durable memory
**Shape:** [CHANGE_RECORD_SCHEMA.json](CHANGE_RECORD_SCHEMA.json)
**Status:** CURRENT — these are open as of the Phase 10 baseline.

This file exists so that nobody spends a phase rediscovering a known-open problem,
and so that nobody mistakes a recorded open item for a new discovery.

**Every entry says who can close it.** A defect that only an owner can decide is not
an agent task; listing it as an agent task would be a category error. See
`../tasks/OWNER_DECISIONS.md`.

---

## KF-001 — Four configuration conflicts, all owner-owned

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S2 · **Owner:** repository owner · **Agent-fixable:** NO

`npm run check:config` reports **7 CONSISTENT, 4 CONFLICT**. The four:

| Id | Conflict |
|---|---|
| `render-blueprint-count` | Two Render blueprints declare different services (root `[ui-hub-backend-mcp]`, mcp `[ui-hub-mcp]`). Source of truth undecided. |
| `render-blueprint-coherence` | The `render.yaml` header claims a unified backend+MCP service, but `startCommand` is `cd backend && npm start`, which runs only the backend. The MCP build step produces unused output. |
| `mcp-allowed-origins-localhost-in-prod` | The production blueprint allows `http://localhost:5173` and `http://localhost:3000`. Now that CORS is genuinely enforced (KF-007's sibling fix, `LESSONS_LEARNED.md` LL-002), any local dev server on those ports can call production MCP. |
| `vercel-mcp-endpoint` | `/mcp` has no rewrite in `vercel.json`, so it resolves to the SPA catch-all. Vercel cannot serve MCP; document the Render endpoint instead. |

**Why still open.** Each is a deployment-topology decision, not a code defect. Fixing
them requires choosing where MCP runs. `npm run check` is **expected to remain
non-zero** for this reason; that is correct behaviour, not a broken gate.

**Note.** `mcp-allowed-origins-localhost-in-prod` became *more* consequential after the
Phase 6 CORS fix. Previously the allowlist was decorative and every origin was
answered; now it is enforced, so the entries in it matter. This is an honest
second-order cost of a correct fix, recorded rather than hidden.

**Evidence:** `../infrastructure/DEPLOYMENT_CONFLICTS.md`, `../tasks/OWNER_DECISIONS.md`,
`npm run check:config`.

---

## KF-002 — Frontend typecheck baseline: 61 errors across 23 files

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** product backlog · **Agent-fixable:** deliberately untouched

The frontend typecheck fails with **61 errors in 23 files**. This is the recorded
baseline, not a regression, and Phase 10 left it exactly as found.

**Why it is recorded here.** A red baseline that is *tracked* is a measurement; the
same red baseline that is *forgotten* becomes an emergency the next time anyone runs
`tsc`. Any future phase must either keep 61/23 or record a deliberate delta.

**Evidence:** `npm run typecheck` in `frontend/`; `../tasks/TASK_CATEGORY_CATALOG.md`.

---

## KF-003 — No root `npm test` script (`CONFLICTS.md` #23)

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** agent layer · **Agent-fixable:** YES

**Still true.** The root `package.json` has no `test` script. It carries
`test:cli` and `agent:test`, but not `test`.

**Verified against the current file**, not inherited: `scripts.test` is absent. The
full script list is `install-all, build:mcp, build:backend, dev:frontend, dev:backend,
dev:mcp, dev, dev:all, build, build:cli, test:cli, ui-hub, cli:dev, start,
sync:components, generate, check, check:secrets, check:secrets:all, check:tracking,
check:knowledge, check:generated, check:docs, check:config, check:index, agent:index,
agent:index:stats, agent:index:check, agent:query, agent:route, agent:context,
agent:test, check:routing`.

**Why not fixed in Phase 10.** The application suites live in four sub-projects with
different runners (`node:test`, `vitest`) and different working directories. A root
script that fans out to all of them is a real change to how the repository is tested,
and it is outside the memory scope. It is recorded rather than quietly added.

**Why it matters.** `npm test` at the root fails, which is a bad first experience for
anyone new, and it is the exact complaint Phase 1 filed.

---

## KF-004 — `frontend/tailwind.config.ts` is inert under Tailwind v4 (`CONFLICTS.md` #15)

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** product backlog · **Agent-fixable:** NO

**Still true.** `frontend/package.json` depends on `tailwindcss@^4.1.14` and
`@tailwindcss/vite@^4.1.14`. Tailwind v4 does not read a JavaScript config file, so
`frontend/tailwind.config.ts` is dead code that reads as though it configures
something.

**Not deleted, and the reason matters.** `ACTIVE_TASK.md` carries it as an open owner
question ("Is `tailwind.config.ts` safe to delete? Confirm no external tool reads it").
A file that looks authoritative and is not will mislead the next reader, but deleting
it is a decision with an unresolved dependency, so it stays recorded.

---

## KF-005 — S1 context bundle coverage is 1/2, by decision

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** agent layer · **Agent-fixable:** technically, deliberately not

`backend/src/middleware/auth.js` exists and is ground-truth-relevant to the S1 task,
but is not in the S1 bundle. Cause: it is one inbound hop from
`backend/src/routes/paymentRoutes.js`, which was admitted by *relevance* rather than
named, and expansion draws candidates only from the graph around named paths.

**The one-line fix was declined on purpose.** Widening all subjects makes every
trigger fireable from relevance-selected files, so expansion grows roughly with the
relevance budget. `ARCHITECTURAL_DECISIONS.md` DEC-009 records the per-trigger
analysis and DEC-008 forbids shipping it on reasoning alone.

**Accepted cost:** one relevant file missing from one canonical bundle.

---

## KF-006 — `CONFLICTS.md` header is stale

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** agent layer · **Agent-fixable:** NO (by decision)

`../CONFLICTS.md` still opens with:

> **Nothing here has been fixed** — Phase 1 is discovery-only.

That was true on 2026-09-30 and is **false now**. Verified supersessions:

| Entry | Claim | Status now |
|---|---|---|
| #3 | `/health` is hardcoded | **FIXED** — Phase 3 (see `KNOWN_FIXES.md`) |
| #6 | Four unauthenticated broadcasts | **FIXED** — Phase 3 |
| #19 | Root service-account.json unignored | **FIXED** — `.gitignore` line 21 covers `backend/service-account.json`; no such file is tracked |
| #24 | Frontend has no tests at all (0 test files) | **FIXED** — 2 test files, 27 tests |
| #25 | `.github/workflows/` is empty, no CI | **FIXED** — `ci.yml` present |
| #1 | Committed MongoDB credential | Unresolved; rotation recommended |
| #2 | MCP absent on Vercel | Still true, owner-owned — see KF-001 |

**Why the header is not corrected.** The file is a Phase 1 record. Rewriting the
summary would destroy the point-in-time claim that made it trustworthy, and
`ARCHITECTURAL_DECISIONS.md` DEC-010 applies the same reasoning used for stale
citations. This file is the annotation.

**Action for readers.** Treat the `CONFLICTS.md` Summary table as a 2026-09-30
snapshot. Use this table to decide what is still open. Do not quote the header.

---

## KF-007 — `mongoService.isClientAlive()` reports a mid-handshake client as alive

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** backend · **Agent-fixable:** YES, not yet done

`getClient()` assigns the module-level `client` synchronously from `new MongoClient()`
and only then awaits `connect()`. `isClientAlive()` therefore returns `true` for a
client whose handshake has not completed.

**This is currently correct for its callers** and wrong as a readiness signal. The
known callers are latency guards, where "the process is not blocked" is the correct
question. It would be wrong as a deploy gate.

**Explicitly deferred by Phase 3**, which recorded the fix: "Consider an explicit
`connected` flag in `mongoService` in a later phase." Root cause analysis in
`LESSONS_LEARNED.md` LL-001.

---

## KF-008 — Vercel `/api` module-load failure: source fixed, redeploy unverified

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S1 · **Owner:** owner/deployment · **Agent-fixable:** NO

`GET /api/health` on the Vercel deployment returns `500 FUNCTION_INVOCATION_FAILED`,
and the failure precedes middleware, routing and auth — three unrelated request
shapes fail identically, placing the fault before the router. `mongodb` is
load-bearing via `mongoService`.

**What is fixed.** The `/health` → `/api/index.js` rewrite was added to `vercel.json`
ahead of the SPA fallback, so `/health` no longer returns the HTML shell with a 200.

**What is not.** Production has not been redeployed, so the fix is unproven against
the live deployment. No Vercel build or deploy log was accessible, so the precise
failing specifier is unconfirmed — the module-resolution diagnosis is corroborated
reasoning, not proof.

**Evidence:** `../runtime/PRODUCTION_BASELINE.md`, `../runtime/CONNECTIVITY_BASELINE.md`.

---

## KF-009 — `ROUTER_BENCHMARK.md` §2.1 read as the current baseline when it is the pre-Phase-9 one

**Date:** 2026-10-01 · **Status:** CURRENT · **Severity:** S3 · **Owner:** agent documentation · **Agent-fixable:** YES (corrected in Phase 10; the drift can recur)

**Found by:** the Phase 10 expansion-subject experiment, which builds all ten
canonical bundles and compares them against the recorded baseline before trusting
it. S1 measured 9 files against a recorded 11, and S5 measured 42 against a
recorded 32.

**Cause.** `ROUTER_BENCHMARK.md` §2.1 is headed "Canonical baseline (corrected,
501-file index)" and its body does say it is the "before" state for TASK 9.42 — but
it never states what the state became. `CONTEXT_QUALITY_REPORT.md` §1 carries the
current numbers in a three-column table, so the post-Phase-9 figure for a reader
looking at the benchmark was simply absent. Nothing in either file contradicted
the other; the benchmark was incomplete rather than wrong.

**Why it matters more than a stale number.** This is the exact failure the memory
layer exists to prevent: a current fact with no freshness marker reads as
permanent. The engine was never wrong, and `check:docs` did not catch it, because
the number was internally consistent — it was a *true* statement about a superseded
state. Detection had to come from re-measuring, not from reading.

**Fix applied.** §2.1 now labels the pre-Phase-9 table as historical, states the
current default-policy figures beside it (9, 14, 2, 16, 42, 13, 0, 0, 10, 0; mean
10.6; total 106; precision 89.6%), and explains why S5 at 42 is a policy effect
(relevance budget 35 on evidence, enforced ceiling 60) rather than a regression.

**Still open.** Nothing detects this class automatically. A number in a task doc
that describes engine output can go stale silently, and no gate compares recorded
metrics against freshly measured ones. A `check:benchmark` that rebuilt the ten
bundles and diffed the recorded sizes would close it; that is not built.

**Evidence:** `../tasks/ROUTER_BENCHMARK.md` §2.1, `../runtime/CONTEXT_QUALITY_REPORT.md` §1,
`../tasks/EXPANSION_EXPERIMENT.md` §4.

---

END — KNOWN FAILURES