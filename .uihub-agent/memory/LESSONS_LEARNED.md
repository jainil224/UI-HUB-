# LESSONS LEARNED

**Owner:** Phase 10 — durable memory
**Status:** CURRENT — these are reusable reasoning errors, not a phase diary.

A lesson earns its place here only if acting on it would have prevented something
that actually happened in this repository. Each entry names the specific failure,
so that "we should be careful" cannot masquerade as a lesson.

---

## LL-001 — A client object is not a connection

**Date:** 2026-09-30 · **Status:** CURRENT · **Source:** Phase 3, `runtime/PHASE_3_CHANGES.md` P3-001

**What happened.** The first dependency-aware `/health` implementation probed
`mongoService.getClient()` and checked that the topology was open. It reported the
database healthy while the handshake was still in flight.

**The mechanism.** `getClient()` assigns the module-level `client` variable
*synchronously* from `new MongoClient()`, and only then awaits `connect()`. Every
lifecycle stage before `connect()` resolves looks identical to a healthy client:
non-null, non-closed, no error. The probe answered the question "has this object
been constructed?" while asking for "has this database accepted us?"

**Why the first fix passed review.** It used the service's own accessor and the
service's own liveness check. Two layers of indirection each looked authoritative,
and neither was. The bug lived in the seam between them.

**Still open.** `isClientAlive()` continues to report a mid-handshake client as
alive. That is correct for its latency-guard callers and wrong for a readiness
signal. Phase 3 deferred it — "consider an explicit `connected` flag in
`mongoService` in a later phase". See `KNOWN_FAILURES.md` KF-007.

**Transferable.** When a liveness check is assembled from an accessor and a state
predicate, verify the predicate means what the caller needs. Two authoritative-looking
layers can disagree, and the disagreement is invisible until it is the thing on the
critical path.

---

## LL-002 — Verify an inherited claim before acting on it

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 6, `runtime/PHASE_6_CHANGES.md` §1

**What happened.** Phase 6 inherited four claims from Phase 5 and checked each
against source first. Three were understated.

The CORS claim was the worst. It was reported as "CORS is not enforcing" — which
reads like a missing header. In fact the origin callback returned `true`
unconditionally: the server answered every request and merely omitted the
`Access-Control-Allow-Origin` header. Phase 5 had already noticed this
(`backend/src/server.js:84` logged "Blocked origin" and then returned
`callback(null, true)`) but classified the allowlist as "decorative" rather than as
a defect in a live security path.

**Why the verification mattered.** Acting on the inherited wording would have
produced a header change — a fix that looks like the fix and leaves the server
answering every origin. The correct fix replaced the predicate with a policy
lookup. The gap between those two outcomes is the whole lesson.

**Transferable.** When a downstream phase receives a finding as a claim rather than
as a file and line, re-derive it. Severity that was understated once is likely to be
understated again, because the person who softened it had already decided how much
it mattered.

---

## LL-003 — A silently omitted root makes a total wrong with no error

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 7 → Phase 8 closure, `codebase/CODEBASE_INTELLIGENCE.md`

**What happened.** Phase 7 reported 485 indexed files. That number was internally
consistent and wrong about the population: the walker descended `SOURCE_ROOTS` but
never `backend/tests/`, `mcp-server/tests/` or `cli/tests/`. **16 of the
repository's 18 test files were missing.** The only two indexed test files were
`frontend/src/utils/apiConfig.test.ts` and `frontend/src/routing/vercelRouting.test.ts`.

Nothing errored. No count was flagged. The index was simply smaller than reality,
and it looked complete.

**Why it survived Phase 7.** 485 was computed and reported faithfully from the roots
the walker visited. The defect was in the *definition of the universe*, which no
check examined. The test-runner globs in `package.json` were sitting in the
repository the whole time as evidence of where tests actually live.

**Resolution.** The Phase 8 closure added `TEST_ROOTS` alongside `SOURCE_ROOTS`,
taking the total to 501 = 485 + 16. **No test file was moved**, and no application
source changed — the files were always there; the walker simply never looked.

**Transferable.** When reporting a total, state the population it was computed over,
not just the number. 485 and 501 are both correct; they answer different questions,
and only one of them is about the repository.

---

## LL-004 — A metric that counts files cannot measure wrongness

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 9, `runtime/CONTEXT_QUALITY_REPORT.md` §3

**What happened.** The Phase 9 precision work improved S1 from 11 files to 9, and the
irrelevant-file count went **up**, 10 → 11. Four clearly-wrong files left the bundle
and one arguably-wrong file took a freed slot.

Both numbers are true. The headline moved the wrong way on a metric that does not
distinguish "wrong file" from "right file".

**The trap.** Reporting "irrelevant files rose" would have been accurate and
misleading. Reporting "precision improved" would have been defensible and incomplete.
The honest report states both and explains which way the set moved and which way the
count moved.

**Transferable.** Before optimising against a metric, check whether the metric can
see the thing being optimised. If it cannot, a correct change and a wrong change can
produce the same movement, and the metric will eventually reward the wrong one.

---

## LL-005 — A 200 is not evidence that anything works

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 5, `runtime/PHASE_5_CHANGES.md` §4

**What happened.** On Vercel, `GET /health` returned **HTTP 200 with `text/html`**.
The request matched the SPA catch-all and returned the 6474-byte app shell. Any
status-code-only health check reported a healthy deployment that was, in fact,
failing to load its function module at all.

`GET /api/health` returned `500 FUNCTION_INVOCATION_FAILED`, and the failure
preceded middleware, routing, and auth — three unrelated request shapes failed
identically, which is what placed the fault before the router.

**Transferable.** Assert on content type and body shape, not status. A platform that
serves a frontend from every path will cheerfully answer 200 for a backend endpoint
it has never heard of.

---

## LL-006 — A benchmark recording zero is evidence the feature never fired

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 9, `tasks/ROUTER_REGRESSION.md` R5

**What happened.** Every one of the canonical bundles recorded **zero** test
admissions. The obvious reading is that no task needed tests. The correct reading is
that the feature could not fire: `TEST_DEPENDENCY` only worked when the task
literally named a file, and the behaviour it was built for — a conceptual task
finding its own tests — was never exercised anywhere in the benchmark.

**Why it went unnoticed.** Zero is a plausible number. Nothing distinguished "the
trigger found nothing" from "the trigger never ran".

**Resolution.** `TEST_DEPENDENCY` now justifies tests against relevance-selected
paths, but only when the task named nothing (`ARCHITECTURAL_DECISIONS.md` DEC-005).
The guard test asserts structurally that an admitted test must import a file already
in the bundle, read from `IMPORT_GRAPH.json` — no filename matching.

**Transferable.** In a benchmark, an all-zero column is a finding about the benchmark.
When a metric is capable of being structurally zero, add an assertion that it is
*not* zero for at least one case.

---

## LL-007 — An unresolved target is information, not noise

**Date:** 2026-10-01 · **Status:** CURRENT · **Source:** Phase 9, `tasks/ROUTER_DECISIONS.md` D-06

**What happened.** `Fix frontend/src/components/templates/TemplateCard.tsx` returned
**50 files at HIGH confidence**. The file does not exist. The path token was
extracted, failed to resolve, and was discarded without comment. Classification then
fell through to the free word "template", legitimately resolved `TEMPLATE` and
`COMPONENT` from real files, and nine resolved entities crossed the HIGH threshold.

The task's strongest signal — the one thing the user named — vanished, and the
confidence was computed from the weakest signal that happened to resolve.

**The general form.** An unmatched strong signal is worse than no signal, because it
leaves the system confidently answering a question nobody asked. Resolution failure
must be *recorded and priced*, never silently dropped.

**Resolution.** Unresolved tokens are recorded in `unresolvedTargets` and cap
confidence at MEDIUM. Surrounding evidence is kept — capping is not discarding.

**Transferable.** Any pipeline with a resolve-or-skip step has this failure mode.
Instrument the skip.

---

END — LESSONS LEARNED