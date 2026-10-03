# KNOWN FIXES

**Owner:** Phase 10 — durable memory
**Shape:** [CHANGE_RECORD_SCHEMA.json](CHANGE_RECORD_SCHEMA.json)
**Status:** CURRENT as a catalogue of resolved defects.

The purpose is narrow and specific: **stop a resolved defect from being re-investigated
as if it were new.** Someone reading a phase report, or an old issue, should be able
to check here first.

This file is not a changelog. It records *what the defect was*, *what closed it*, and
*how to tell it is still closed* — the third being the part that makes the entry
worth keeping.

**Complements, does not replace.** `../CONFLICTS.md` is the Phase 1 snapshot and is
preserved unchanged; `KNOWN_FAILURES.md` KF-006 maps which of its entries these
records supersede.

---

## KFX-001 — `/health` reported `ok` unconditionally

**Date:** 2026-09-30 · **Status:** CURRENT · **Phase:** 3 · **Commit:** `0bdd0aa6` · **Original:** `CONFLICTS.md` #3 (S1)

**Was.** `/health` and `/api/health` returned a static `{ status: 'ok' }` with no
dependency awareness. A host gating a deploy on `/health` returned 200 always.

**Now.** `backend/src/services/healthService.js` performs a bounded MongoDB probe.
Mongo down → `unhealthy` (503). Mongo up, MCP not mounted → `degraded` (200), because
the REST API still serves. Both up → `healthy`.

**How to tell it is still closed.** `backend/tests/health.test.js` — 12 cases covering
status mapping and HTTP status codes. Measured: `/api/health` with Mongo unreachable
returns **503**, `status=unhealthy`, `mongodb=disconnected`, in 3113 ms.

**Residual.** `mongoService.isClientAlive()` still reports a mid-handshake client as
alive. Tracked separately as `KNOWN_FAILURES.md` KF-007 — the endpoint is fixed, one
underlying predicate is not.

---

## KFX-002 — Four unauthenticated broadcast paths

**Date:** 2026-09-30 · **Status:** CURRENT · **Phase:** 3 · **Commit:** `0bdd0aa6` · **Original:** `CONFLICTS.md` #6 (S2)

**Was.** Anyone could trigger email and push to every user. Four paths, no auth.

**Now.** Closed behind authentication. Verified independently: `GET /api/admin/mcp/health`
returns **401 unauthenticated** from the live deployment, which confirms the Phase 3
auth work holds in practice and not only in unit tests.

**How to tell it is still closed.** `backend/tests/broadcastAuth.test.js`.

---

## KFX-003 — CORS allowlist was decorative

**Date:** 2026-10-01 · **Status:** CURRENT · **Phase:** 6 · **Commit:** `2581c915`

**Was.** Inherited from Phase 5 as "CORS is not enforcing", which reads like a missing
header. Actually the origin callback returned `true` unconditionally —
`backend/src/server.js:84` logged "Blocked origin" and then returned
`callback(null, true)`. The server answered every request and simply omitted the
header, so the allowlist gated nothing.

**Now.** The origin decision is a real policy lookup against a resolvable policy
module. Origins are checked; disallowed origins are refused rather than served blind.

**How to tell it is still closed.** Both test suites drive real CORS behaviour, and
`backend/tests/cors.test.js` exists. This was the only behavioural code change in
Phase 6.

**Second-order cost.** The production blueprint allows localhost origins in production
(`KNOWN_FAILURES.md` KF-001). While CORS was decorative this was harmless; now it is
live. Correct fix, newly relevant config defect.

**Lesson.** `LESSONS_LEARNED.md` LL-002.

---

## KFX-004 — Frontend `/health` returned the SPA shell with 200

**Date:** 2026-10-01 · **Status:** CURRENT · **Phase:** 5 · **Commit:** `3d792309`

**Was.** `GET /health` on Vercel matched the SPA catch-all and returned **200 with
`text/html`** — the 6474-byte app shell. Any status-code-only check reported a healthy
deployment whose function module was not loading at all.

**Now.** An explicit `/health` → `/api/index.js` rewrite in `vercel.json`, ordered
between the `/api` rule and the SPA fallback.

**How to tell it is still closed.** `../runtime/PRODUCTION_DEPLOYMENT_GATE.md` §3
asserts `/health` returns 200 **JSON**; 200 HTML is the old trap.

**Residual.** Source is fixed; production is not redeployed, so this is unverified
against the live deployment. Tracked as `KNOWN_FAILURES.md` KF-008.

---

## KFX-005 — Frontend has no tests (`CONFLICTS.md` #24)

**Date:** 2026-10-01 · **Status:** CURRENT · **Original:** `CONFLICTS.md` #24 (S3)

**Was.** Zero frontend test files; the entry read "frontend has no tests at all — 0 test files".

**Now.** Two Vitest test files exist under `frontend/src`:
`frontend/src/utils/apiConfig.test.ts` and `frontend/src/routing/vercelRouting.test.ts`,
covering **27 tests**. They also form the only two test files the index picked up
before the Phase 8 fix below.

**How to tell it is still closed.** `npm test` in `frontend/` — part of the recorded
231-test application baseline.

---

## KFX-006 — Index walker never descended into test roots

**Date:** 2026-10-01 · **Status:** CURRENT · **Phase:** 8 closure · **Commit:** `a3e1c71c`

**Was.** The Phase 7 walker visited `SOURCE_ROOTS` only. It never descended into
`backend/tests/`, `mcp-server/tests/` or `cli/tests/`, so **16 of the repository's 18
test files were invisible to the agent layer.** Nothing errored; the index was simply
smaller than reality and looked complete.

**Now.** `TEST_ROOTS` is walked alongside `SOURCE_ROOTS`, taking the index from 485 to
501 files. All 18 test files are indexed, and their import edges are real edges in
`IMPORT_GRAPH.json`.

**How to tell it is still closed.** `npm run agent:index:check` reports all test files
indexed. `codebase/CODEBASE_INTELLIGENCE.md` §on test discovery records 18 test files.

**Why this mattered beyond the count.** Test files being invisible is why Phase 8
shipped a `TEST_DEPENDENCY` trigger that could not fire for a conceptual task. See
`LESSONS_LEARNED.md` LL-003 and LL-006.

**No file was moved.** No application source changed. The test files were always there;
the walker simply never looked.

---

## KFX-007 — No CI anywhere (`CONFLICTS.md` #25)

**Date:** 2026-10-01 · **Status:** CURRENT · **Original:** `CONFLICTS.md` #25 (S3)

**Was.** `.github/workflows/` was empty; nothing ran on push.

**Now.** `.github/workflows/ci.yml` exists and runs the suites.

**How to tell it is still closed.** `Test-Path .github/workflows/ci.yml`.

---

## KFX-008 — Root service-account.json was not ignored (`CONFLICTS.md` #19)

**Date:** 2026-10-01 · **Status:** CURRENT · **Original:** `CONFLICTS.md` #19 (S3)

**Was.** One unignored service-account path.

**Now.** `.gitignore` line 21 covers `backend/service-account.json`. No
service-account file is tracked, and no root-level `service-account.json` exists.

**How to tell it is still closed.** `git ls-files | Select-String service-account`
returns nothing.

**Not a rotation.** The entry was about ignore rules. Credential rotation itself is
still recommended and remains open — `../CONFLICTS.md` A18.

---

## KFX-009 — Eleven dead utilities removed

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Phase:** 3 · **Commit:** `0bdd0aa6`

**Was.** Token repair found 11 dead frontend utilities with roughly 97 usages removed.

**Note.** This is the one entry here recorded from a phase summary rather than
re-derived during Phase 10. It is included because `ACTIVE_TASK.md` records it as
DONE and the token-repair numbers are quoted across the Phase 3 documents; anyone
re-deriving them should start from the Phase 3 record rather than assume this entry is
independently verified.

---

END — KNOWN FIXES