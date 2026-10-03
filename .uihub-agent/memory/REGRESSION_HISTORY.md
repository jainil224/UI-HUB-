# REGRESSION HISTORY

**Owner:** Phase 10 — durable memory
**Status:** CURRENT — R1–R8 must never reopen silently.

Eight defects that were each found, fixed, and given a guard. The guard is the
durable part; the prose here explains what would be lost if a guard silently stopped
running.

**Canonical text:** `../tasks/ROUTER_REGRESSION.md`. Each entry below points there
for the full reproduction and fixtures — this file does not restate them, because a
second copy of a regression's details is a second copy that will drift.

**Where the guards live:** `../tests/context.test.mjs` and
`../tests/precision.test.mjs`. A regression here is a *test* failure, not a
judgement call.

**Two axes, deliberately separate.** Each record's `Status` is `HISTORICAL` — the
*defect* was true at a past date and is not re-verified as a claim about the
present. Whether the defect is still fixed is a separate question, answered by the
guard test passing, and recorded per record as **Fixed by**. Conflating them would
make "still fixed" a claim that ages silently, which is the failure this whole layer
exists to prevent.

---

## Index

**Date:** 2026-10-01 · R1–R8 status snapshot

| Id | Defect | Found in | Guard asserts |
|---|---|---|---|
| R1 | Score ties decided alphabetically | Phase 8 | A genuine score tie still exists, and no equally-scoring file is ever dropped for ordering |
| R2 | Hard `maxFiles = 25` regardless of task | Phase 8 | The budget is derived; an explicit `--max-files` overrides and disables growth |
| R3 | `TEST_DEPENDENCY` could not fire for a named service | Phase 8 | An admitted test imports a file already in the bundle |
| R4 | `PROTECTED_RELATIONSHIP` treated protection as relevance | Phase 8 | The guard blocks a protected file when unconnected, and protection still appears as a caution marker |
| R5 | `TEST_DEPENDENCY` never fired for conceptual tasks | **Phase 9** | Conceptual tasks discover tests; a test is never a subject |
| R6 | A named file that does not exist returned HIGH confidence | **Phase 9** | A path that does not exist cannot produce HIGH confidence — *and* a real target must not be capped |
| R7 | Backticks around a route or path hid the entity | Phase 8 (fixed in A5) | An entity inside backticks is extracted |
| R8 | The `handlers` field was dropped from public route entities | **Phase 9** | `API_DEPENDENCY` is reachable — the trigger that lost its field had become inert |

---

## R1 — Score ties decided alphabetically

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Found in:** Phase 8

With no secondary key, the sort fell through to the path string, so a file imported
by six modules could lose to an alphabetical neighbour. Fixed by a connectivity
tie-break (`ARCHITECTURAL_DECISIONS.md` DEC-002).

**The guard asserts two things,** which is the part that matters: that no
equally-scoring file is ever dropped purely for ordering, **and** that a genuine
score tie still exists to exercise it. Without the second assertion the first
passes trivially in a repository that happens to have no ties.

---

## R2 — Hard `maxFiles = 25` regardless of task

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Found in:** Phase 8

A database migration and a button colour change were both given 25 files. Fixed by
the evidence-derived budget (`ARCHITECTURAL_DECISIONS.md` DEC-001).

**The guard also pins the override.** An explicit `--max-files` is honoured and
disables growth, because the evidence must not overrule a caller's decision.

---

## R3 — `TEST_DEPENDENCY` could not fire for a named service

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Found in:** Phase 8

The trigger required filename matching, which is prohibited by the brief. Fixed to
justify a test against a real import edge instead
(`ARCHITECTURAL_DECISIONS.md` DEC-005).

**The guard asserts the absence structurally:** an admitted test must import a file
already in the bundle, read from `IMPORT_GRAPH.json`. Asserting "no `*auth*` string"
would pass even if the trigger matched filenames by another route.

---

## R4 — `PROTECTED_RELATIONSHIP` treated protection as relevance

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Found in:** Phase 8

The trigger asked only "what does protected code depend on?", satisfiable from any
protected file. "Fix an XSS vulnerability in the comment renderer" — naming nothing
— expanded to ten payment files, each with a technically-true justification and none
related to the task. Fixed in DEC-003.

---

## R5 — `TEST_DEPENDENCY` never fired for conceptual tasks

**Date:** 2026-10-01 · **Status:** HISTORICAL · **Found in:** **Phase 9 probe**

Every canonical bundle recorded **zero** test admissions. Fixed by letting
`TEST_DEPENDENCY` justify tests against relevance-selected paths when the task named
nothing (DEC-005).

**How it was found.** Noticing an all-zero column in a benchmark. Zero is a
plausible number, so nothing flagged it. See `LESSONS_LEARNED.md` LL-006.

---

## R6 — A named file that does not exist returned HIGH confidence

**Date:** 2026-10-01 · **Status:** HISTORICAL · **Found in:** **Phase 9 probe**

The task's strongest signal was extracted, failed to resolve, and was discarded
without comment; confidence was then computed from the weakest signal that resolved.
50 files at HIGH confidence. Fixed by recording `unresolvedTargets` and capping at
MEDIUM (DEC-006). See `LESSONS_LEARNED.md` LL-007.

**How it was found.** Re-running an example from the Phase 8 specification against
the repository. The spec's own example had rotted.

**The guard has two halves,** and the second is the one that keeps the first
honest: a nonexistent path cannot produce HIGH confidence, *and* a real target must
not be capped. Without the second, every bundle becomes MEDIUM and the cap is
meaningless.

---

## R7 — Backticks around a route or path hid the entity

**Date:** 2026-09-30 · **Status:** HISTORICAL · **Found in:** Phase 8, fixed in step A5

Entities written inside backticks were not extracted, so the commonest way a person
writes a path silently failed. Fixed during Phase 8 step A5.

---

## R8 — The `handlers` field was dropped from public route entities

**Date:** 2026-10-01 · **Status:** HISTORICAL · **Found in:** **Phase 9 probe**

A route entity lost its `handlers` field, which made `API_DEPENDENCY` inert — the
trigger could not fire because the data it needed was not being emitted. Both test
suites now assert `API_DEPENDENCY` is reachable.

**The general form.** A trigger can be structurally unreachable while its code is
present and correct. Presence of the implementation is not evidence the feature
works.

---

## Why three entries are marked "found in Phase 9"

**Date:** 2026-10-01

R5, R6 and R8 were **not in the Phase 8 brief**. Two detection methods found them, and
both are worth reusing: an all-zero benchmark column, and re-running the
specification's own examples against the repository.

A phase that checks only its own brief will always pass its own brief. Two of these
were live defects in a feature Phase 8 reported as delivered.

---

## The rule that binds them

**Date:** 2026-10-01

`../tasks/ROUTER_BENCHMARK.md` §5 makes an **unrecorded bundle-size change a
forbidden regression**. Any change to the emitted bundle must either match the pinned
baseline or record a delta in `../tasks/ROUTER_DECISIONS.md`.

This is why the benchmark's task wording is fixed and why its metrics are read from
the emitted bundle rather than asserted by hand. A benchmark that can be quietly
adjusted is not a baseline.

---

## Phase 10 additions

**Date:** 2026-10-01

Phase 10 adds memory-layer regression coverage in a new `memory.test.mjs`, created by
this phase alongside the retrieval module it tests, for the properties this layer can
break:

- source precedence resolves in the documented order;
- a `SUPERSEDED` record never outranks a `CURRENT` one;
- historical claims are labelled so `check:docs` can see them;
- no secret value appears in memory output;
- retrieval returns nothing rather than something plausible when no record qualifies.

These live here rather than in `../tasks/ROUTER_REGRESSION.md` because that file is
scoped to the router and is canonically owned by Phase 9. Extending a Phase 9 file
during Phase 10 would blur which phase owns which guarantee.

**Phase 10 adds no router regression**, consistent with `ARCHITECTURAL_DECISIONS.md`
DEC-008: no behaviour change without evidence. The expansion experiment is
read-only and guarded by an assertion that admission behaviour is unchanged.

---

END — REGRESSION HISTORY