# ARCHITECTURAL DECISIONS

**Owner:** Phase 10 — durable memory
**Shape:** [DECISION_RECORD_SCHEMA.json](DECISION_RECORD_SCHEMA.json)
**Status:** CURRENT — these are live constraints on how the agent layer may change.

A decision is a statement of the form *"we chose X over Y, and Y is not to be
reintroduced without a new entry."* This file therefore mostly records refusals.

**No duplication.** DEC-001..DEC-007 are the router decisions D-01..D-07 from
Phase 9. They are **pointers**, not restatements. The full rationale, cost and
reversal condition live in `../tasks/ROUTER_DECISIONS.md` and stay there — a
second copy would drift, and a drifting decision record is worse than none.

---

## DEC-001 — Evidence-derived budget replaces the universal cap

**Date:** 2026-09-30 · **Status:** CURRENT

The numeric tiers are not restated here and are owned by the router; DEC-008
constrains how they may change. The decision itself is not superseded.

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-01.

**Surviving invariant.** There is no arbitrary universal file cap. A caller-supplied
`--max-files` outranks the derived budget and disables growth.

**Why it is recorded here.** The numeric tiers (25 / 40 / 60) belong to the router,
not to memory. Only the *principle* outlives a future refactor.

---

## DEC-002 — Connectivity reorders; it never rejects

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-02.

**Surviving invariant.** Import-edge degree is a tie-break, never a signal. If a
tie-break ever removes a file from consideration, this decision is violated and the
guarding test fails.

---

## DEC-003 — Protection is a caution marker, not relevance

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-03.

**Surviving invariant.** Protected code must have a *stated* connection to the task.
Surface is derived from path prefixes (`PATH_SURFACE`), never from roles. When
protection is not worth loading, it still surfaces as a caution marker.

---

## DEC-004 — Resolve what is unambiguous; refuse what is not

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-04.

**Surviving invariant.** A bare filename resolves only when exactly one indexed file
carries that name. Two candidates resolve to nothing, and `unresolvedTargets`
explains the refusal. An empty result with a reason beats a confident guess.

**Note.** D-04 named Phase 10 as the place to revisit whether genuine ambiguity has
become common enough that refusing is worse than asking. Phase 10 did not find it
common; the refusal stands.

---

## DEC-005 — Tests are justified against named paths, or against relevance only when nothing was named

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-05.

**Surviving invariant.** No filename matching for tests, and no chaining — a test is
never a subject, so a test cannot recruit another test.

**Why it matters to memory.** This is the one place where relevance-selected subjects
were *accepted* as expansion subjects. It is the precedent that makes DEC-009
answerable rather than merely arguable.

---

## DEC-006 — An unresolved target caps confidence, it does not discard evidence

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-06.

**Surviving invariant.** A missing target caps confidence at MEDIUM. Surrounding
evidence is kept. Candidates are structural near-misses from the same directory and
leaf name — never edit-distance guesses.

---

## DEC-007 — One candidate, one entry; most-specific trigger first

**Date:** 2026-09-30 · **Status:** CURRENT

Canonical text: `../tasks/ROUTER_DECISIONS.md` D-07.

**Surviving invariant.** Deduplication is required, and `TRIGGER_PRIORITY` is
load-bearing: trigger-major iteration let `DIRECT_DEPENDENCY` starve
`SHARED_SERVICE` into unreachability.

---

## DEC-008 — Phase 10 changes behaviour only on evidence

**Date:** 2026-10-01 · **Status:** CURRENT

**Decided.** Every Phase 10 behaviour change requires a measured per-trigger result
or a regression test. Guards may be added freely; widening may not be added on
reasoning alone.

**Rationale.** Nine phases of records show the failure mode in this repository is
not absent care — it is plausible reasoning committed at volume. Phase 3 shipped a
health probe that passed review and was wrong. Phase 5 shipped a deployment
document whose central claim was wrong in a way that pointed at code. The cheapest
defence available is mechanical: make the argument run before the change lands.

**Cost.** Slower. Phase 10 was asked to close nine open questions; measuring each
per trigger took the time that guessing would have saved and then had to give back.

**Reverses if.** Never on convenience. A behaviour change needs either a benchmark
delta recorded in `../tasks/ROUTER_BENCHMARK.md` or a failing-then-passing test.

---

## DEC-009 — Relevance-admitted files are not expansion subjects

**Date:** 2026-10-01 · **Status:** RESOLVED

**Resolved.** The question Phase 9 deferred has now been measured, not argued.
The answer is no: relevance-admitted paths stay out of expansion subjects — not
globally, and not for any individual trigger. This is settled policy, not an
open question.

**The question.** S1 coverage is 1/2. `backend/src/middleware/auth.js` is
ground-truth-relevant and absent from the bundle. Verified cause: it is one inbound
hop from `backend/src/routes/paymentRoutes.js`, but that route file was admitted by
*relevance* rather than named, so it is not an expansion subject. Only
`frontend/src/components/ui/payment-transaction-button.tsx` was named.

The fix is one line. Phase 9 declined it, and this entry records why that was
correct rather than merely convenient.

**Why one line was not enough.** Treating relevance-admitted paths as subjects makes
every trigger fireable from relevance-selected files, so expansion grows roughly with
the relevance budget. That is unbounded context growth traded for one missing file,
on the last day of the phase, against an explicit objective of not becoming blindly
restrictive.

**The standard that answers it.** DEC-005 already accepted relevance-selected
subjects in exactly one case: `TEST_DEPENDENCY` for a task that named nothing,
where the evidence is a *specific import edge*. So the question was never global.

**Measured, per trigger.** Each trigger was run with relevance-selected subjects
against the 10-task benchmark, read-only, with no production change
(`../tasks/EXPANSION_EXPERIMENT.md`):

| Trigger | Additions | False positives | Verdict |
|---|---|---|---|
| `DIRECT_DEPENDENCY` | 255 | 117 | rejected — one import edge fires from every relevance-selected file |
| `RELEVANT_CONSUMER` | 49 | 15 | rejected — proximity, not an edge the task implies |
| `PROTECTED_RELATIONSHIP` | 18 | 9 | rejected — it treated "protected" as "relevant" |
| `TEST_DEPENDENCY` | 6 | 0 | deferred — safe, but a separate question from this one |
| `STATE_DEPENDENCY` | 1 | 0 | deferred — safe, same reason |
| `API_DEPENDENCY` | 0 | 0 | no effect |
| `SHARED_SERVICE` | 0 | 0 | no effect |

Every trigger that produced any precision cost did so at a ratio worse than 5:1.
None of them is safe, so no subset is safe, so the answer is no for all of them.

**Decided.** Do not widen expansion subjects. The S1 gap stays open and recorded
in `LIMITATIONS.md` rather than closed by a flag.

**Cost, stated plainly.** One ground-truth-relevant file is still missing from S1.
That is a real, accepted precision cost, and it is cheaper than the alternative.

**Reverses if.** The stated condition was tested and did not hold:
`DIRECT_DEPENDENCY` from a relevance-admitted subject added 255 files and 117
false positives, so it does not admit only relevance-passing files. A future
reversal now needs a *new* measurement, not this one. Any single trigger that
proves a false-positive ratio under 1:5 against the current benchmark may widen
alone, with a recorded benchmark delta.

---

## DEC-010 — Superseded agent.md citations are preserved, not rewritten

**Date:** 2026-10-01 · **Status:** CURRENT

**Decided.** Earlier phases cited `agent.md` sections that Phase 10's rewrite
renumbered. Those citations stay as written. Their inaccuracy is annotated where a
reader would be misled.

**Rationale.** The citations are provenance: they record *which instruction an
earlier phase was following at the time*. Correcting them to today's numbering
destroys that evidence and makes the old phase look like it followed instructions
it never saw. A citation that is honestly stale is more useful than one that is
silently wrong.

**Cost.** A reader following an old citation lands on the wrong section. The
annotation is the mitigation, and it is a small, local edit.

---

## DEC-011 — Only the memory overview is a strict knowledge root

**Date:** 2026-10-01 · **Status:** CURRENT

**Decided.** `check-knowledge.mjs` gains exactly one `REQUIRED` entry:
`memory/MEMORY_OVERVIEW.md`. The other ten memory files are intentionally outside
the strict path/link check.

**Rationale.** `check-knowledge` assertion 4 fails on any backticked path that does
not resolve. `KNOWN_FAILURES.md`, `LIMITATIONS.md` and `REGRESSION_HISTORY.md` must
cite paths that no longer exist, or that never existed, in order to be useful — a
record of a removed file *is the point*. Forcing them to satisfy a live-path check
would force them to delete the evidence.

**Cost.** Those files are not automatically path-validated. A stale or wrong path in
them is caught by review and by the Phase 10 knowledge audit, not by the gate.

**Alternative rejected.** Making all eleven `REQUIRED`, which would have meant
either deleting historical paths or weakening assertion 4 globally. Weakening a gate
to accommodate prose is the wrong direction of travel.

---

END — ARCHITECTURAL DECISIONS