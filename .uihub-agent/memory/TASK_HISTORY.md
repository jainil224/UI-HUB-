# TASK HISTORY

**Owner:** Phase 10 — durable memory
**Shape:** [TASK_RECORD_SCHEMA.json](TASK_RECORD_SCHEMA.json)
**Status:** HISTORICAL records of completed AI work. Append-only.

Every record is `HISTORICAL` by nature: it describes a completed past event and
is never re-verified against code. A record that makes a claim about the present
is the exception and says so.

`memoryConsulted` is empty for every record below. This layer did not exist when
they ran, which is the honest answer and also the point: the first ten phases
paid for this layer's existence by rediscovering facts.

---

## task-001 — Codebase discovery

**Timestamp:** 2026-09-30
**Source:** Phase 1; conflict register `.uihub-agent/CONFLICTS.md`
**Status:** HISTORICAL

**Classification:** intent `INVESTIGATE`, categories `UNKNOWN`, surface all,
confidence LOW by design.

**Memory consulted:** none

**What was done:** Read the repository and recorded 30 findings with evidence
trails. Three are classified S1 (`#1` committed MongoDB credential, `#2` MCP absent
on Vercel, `#3` `/health` hardcoded); the register's own count line reads
"6 × S1-adjacent, 14 × S2, 12 × S3", which counts S1-adjacent entries more loosely
than the severity column does. No code was changed — Phase 1 was discovery-only,
and `CONFLICTS.md` says so at the top of the file.

**Result:** `COMPLETED` — 30 findings recorded.

**Problems:** The register's summary line "Nothing here has been fixed" is now
false for several entries. It is preserved verbatim because it was true when
written. See `KNOWN_FAILURES.md` KF-006 for which entries were superseded.

---

## task-002 — Runtime verification and controlled remediation

**Timestamp:** 2026-09-30
**Source:** Phase 3; `runtime/PHASE_3_CHANGES.md`; commit `0bdd0aa6`
**Status:** HISTORICAL

**Classification:** intent `FIX`, categories `SECURITY`, `HEALTH`, `BACKEND`.

**Memory consulted:** none

**What was done:** Replaced the hardcoded `/health` response with a
dependency-aware probe, added real backend tests, and closed four
unauthenticated broadcast paths.

**The interesting part:** the first dependency-aware health implementation was
still wrong, and the root cause was not the one expected. `mongoService.getClient()`
assigns the module-level `client` variable *synchronously* from `new MongoClient()`
and only then awaits `connect()`, so a probe that trusted a non-null client with
an open topology returned `true` for a database whose handshake was still pending.
Recorded because the first fix looked correct and passed review. See
`LESSONS_LEARNED.md` LL-001.

**Not fully closed:** `mongoService.isClientAlive()` still reports a mid-handshake
client as alive. That is correct for its latency-guard callers but wrong for a
readiness signal, and Phase 3 explicitly deferred it — "Consider an explicit
`connected` flag in `mongoService` in a later phase." Still open. See
`KNOWN_FAILURES.md` KF-007 and `LIMITATIONS.md`.

**Validation:** backend tests added and passing.

**Result:** `COMPLETED WITH DEFERRED ITEMS`, deferred list recorded in
`runtime/PHASE_3_CHANGES.md`.

---

## task-003 — Production connectivity and deployment contracts

**Timestamp:** 2026-10-01
**Source:** Phase 5; `runtime/PHASE_5_CHANGES.md`; commit `3d792309`
**Status:** HISTORICAL

**Classification:** intent `FIX`, categories `DEPLOYMENT`, `API`.

**Memory consulted:** none

**What was done:** Made the frontend's API destination deterministic and
documented the real deployment topology as an enforced contract rather than prose.
Separated code defects from dashboard misconfiguration.

**Result:** `PARTIAL` — code and contracts complete; production repair blocked on
owner dashboard access. The blocker is owner-controlled and remains open.

**Deferred:** production-side repairs requiring dashboard access.

---

## task-004 — Security and configuration hardening

**Timestamp:** 2026-10-01
**Source:** Phase 6; `runtime/PHASE_6_CHANGES.md`; commit `2581c915`
**Status:** HISTORICAL

**Classification:** intent `FIX`, categories `SECURITY`, `CONFIGURATION`.

**Memory consulted:** none

**What was done:** Corrected CORS from a header-only allowlist to an actually
enforcing origin policy, and added the five validators that still gate this
repository: secret scan, knowledge validation, config check, generated-artifact
freshness, and tracking invariants.

**The interesting part:** Phase 6 opened with four claims inherited from Phase 5
and verified all four against source first. **Three were understated.** "CORS is
not enforcing" was worse than described — the origin callback returned `true`
unconditionally, so the server answered every request and simply omitted the
header, meaning the allowlist never gated anything. Verifying before acting is
what turned that from a header tweak into a policy fix. See `LL-002`.

**Result:** `COMPLETED`. Four owner-owned configuration conflicts were deliberately
left unresolved. See `LIMITATIONS.md`.

---

## task-005 — Codebase intelligence

**Timestamp:** 2026-10-01
**Source:** Phase 7; commit `b0d5c1d8`
**Status:** HISTORICAL

**Classification:** intent `BUILD`, categories `AGENT_INFRASTRUCTURE`.

**Memory consulted:** none

**What was done:** Built AST-derived codebase intelligence — component, page,
route, feature, hook, service, API, database, storage and integration maps — plus
a query CLI and a cross-reference validator.

**Counts are point-in-time.** Phase 7's own checklist records **485 indexed files**,
and Phase 8's simulations repeat that figure. The index has since grown to **501
files across 19 artifacts** (fingerprint `b7805860f03a`). Do not read the older
number as current, and do not read the newer one as what Phase 7 measured.

**Result:** `COMPLETED`. Index freshness has been gated ever since.

---

## task-006 — Task router and context loading

**Timestamp:** 2026-10-01
**Source:** Phase 8; commit `9ccf8e3a`, correction `a3e1c71c`
**Status:** HISTORICAL

**Classification:** intent `BUILD`, categories `AGENT_INFRASTRUCTURE`.

**Memory consulted:** none

**What was done:** Built the deterministic task router and minimal context
bundles with recorded expansion evidence — every file admitted carries the trigger
that authorised it.

**The interesting part:** a closing correction commit (`a3e1c71c`) was needed to
fix test-file indexing. Phase 8 shipped a router that treated test files as
unindexed in part of the tree, and the benchmark quietly reflected that. The
baseline was re-measured rather than defended. See `LL-003`.

**Result:** `COMPLETED`. Canonical benchmark S1–S10 established.

---

## task-007 — Router precision and context optimization

**Timestamp:** 2026-10-01
**Source:** Phase 9; commit `037d3b99`; `runtime/CONTEXT_QUALITY_REPORT.md`;
`tasks/ROUTER_DECISIONS.md`
**Status:** HISTORICAL

**Classification:** intent `FIX`, categories `AGENT_INFRASTRUCTURE`.

**Memory consulted:** none

**What was done:** Fixed six router defects, removed the universal `maxFiles = 25`
in favour of an evidence-derived budget, and rebuilt the relevance and expansion
gates.

The six defects are recorded in `REGRESSION_HISTORY.md` as R1–R8. Two of them —
test discovery that could never fire for a conceptual task, and a nonexistent file
returning HIGH confidence — were not in the Phase 8 brief. They were found by
Phase 9 probes, one by noticing the benchmark recorded zero test admissions across
all ten canonical tasks, and one by re-running an example from the phase
specification against the repository and finding the file absent.

**Validation:** `agent:test` 98/98; application suites 231/231 at baseline;
`agent:index:check` 19/19 fresh; `check:index` 0 FAIL; zero application source
changes.

**Result:** `COMPLETED`.

**Problems:** One aggregate movement, analysed and accepted rather than hidden —
S1 shrank 11 → 9 files while irrelevant rose 10 → 11. Four wrong files left the
bundle and one arguably-wrong file took a freed slot, so the count of wrong files
went up even though the set got better. The precision metric counts files, not
wrongness.

**Deferred:** S1 bundle coverage remains 1/2. `backend/src/middleware/auth.js` exists
in the repository and is ground-truth-relevant, but it is absent *from the bundle*
because it is one inbound hop from a relevance-admitted file, and expansion draws
candidates only from the graph around *named* paths. Deferred with a one-line
candidate fix recorded. See `LIMITATIONS.md` and `ARCHITECTURAL_DECISIONS.md`
DEC-009.

---

## task-008 — Durable memory and end-to-end validation

**Timestamp:** 2026-10-01
**Source:** Phase 10 (this phase)
**Status:** HISTORICAL once closed

**Classification:** intent `BUILD`, categories `AGENT_INFRASTRUCTURE`.

**Memory consulted:** this layer, built during the phase.

**What was done:** Created `.uihub-agent/memory/`, implemented evidence-based
memory retrieval with explicit P0–P5 ranking and SUPERSEDED handling, added the
`agent:memory` and `agent:prepare` commands, ran the per-trigger expansion
experiment that Phase 9 deferred, and validated the whole system end to end.

**Result:** recorded in the Phase 10 completion report.

**Deferred:** four owner-owned configuration conflicts and the pre-existing
frontend typecheck baseline, both preserved unchanged by instruction.

---

END — TASK HISTORY