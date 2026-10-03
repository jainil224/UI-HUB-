# LIMITATIONS

**Owner:** Phase 10 — durable memory
**Status:** CURRENT — these boundaries are properties of the design, not defects.

Every entry here is a place where the agent layer **cannot** help. They are recorded
so that a limitation is discovered by reading this file rather than by spending a
phase rediscovering it.

The distinction that matters: `KNOWN_FAILURES.md` holds things that are broken and
could be fixed. This file holds things that are the wrong shape to fix.

---

## LIM-001 — The router is deterministic, not an LLM

**Date:** 2026-10-01 · **Status:** CURRENT

Routing is rule-based over seven documented triggers. It cannot infer intent, cannot
learn from a corrected bundle, and cannot ask what a task means when the wording is
genuinely ambiguous.

**What this buys.** The same task always produces the same bundle, every admitted
file carries the trigger that authorised it, and a wrong bundle can be traced to a
rule. `../tasks/ROUTER_BENCHMARK.md` is only meaningful because of this.

**What it costs.** Coverage is the limit of the trigger set. A task whose shape is
unrepresented gets a bundle that is technically justified and irrelevant — the
payment-XSS example in `ARCHITECTURAL_DECISIONS.md` DEC-003 is exactly that failure.

**Not revisable as a design change** without invalidating the benchmark. Intent
understanding belongs upstream, in the task wording.

---

## LIM-002 — The index is a snapshot, and freshness is mechanical

**Date:** 2026-10-01 · **Status:** CURRENT

The agent layer knows only what the index contains. Freshness is asserted by
`npm run agent:index:check` against fingerprint `fe2be01006fe` covering 19 artifacts
and 505 files.

**The trap this cannot catch.** A file can be indexed and still be wrong about its
own contents — a stale name, a deleted export, a route that no longer responds. The
index says a symbol exists; only reading the file says it still does.

**Corollary.** A green index is evidence of *completeness*, never of *correctness*.

---

## LIM-003 — S1 context coverage is 1 of 2, deliberately

**Date:** 2026-10-01 · **Status:** CURRENT

`backend/src/middleware/auth.js` is ground-truth-relevant to S1 and is not in the S1
bundle. Full reasoning in `ARCHITECTURAL_DECISIONS.md` DEC-009; tracked as
`KNOWN_FAILURES.md` KF-005.

**Why it is a limitation and not a bug.** The alternative — treating relevance-admitted
files as expansion subjects — makes every trigger fireable from relevance-selected
paths, so expansion grows roughly with the relevance budget. One missing file is
cheaper than unbounded growth.

**This is a known, accepted, measured cost.** It is stated here rather than left for
someone to discover by diffing a bundle against ground truth.

---

## LIM-004 — Four configuration conflicts cannot be resolved by an agent

**Date:** 2026-10-01 · **Status:** CURRENT

`render-blueprint-count`, `render-blueprint-coherence`,
`mcp-allowed-origins-localhost-in-prod`, `vercel-mcp-endpoint`. Each requires an
owner decision about deployment topology. Detail in `KNOWN_FAILURES.md` KF-001 and
`../infrastructure/DEPLOYMENT_CONFLICTS.md`.

**Consequence for tooling.** `npm run check` is **expected to remain non-zero**. A
green `check` would mean the conflicts were resolved or the gate was weakened; neither
has happened. Do not "fix" this by suppressing the four.

---

## LIM-005 — The frontend typecheck baseline is red by design

**Date:** 2026-10-01 · **Status:** CURRENT

61 errors across 23 files. Preserved unchanged. See `KNOWN_FAILURES.md` KF-002.

**Consequence.** A future phase may not report the typecheck as passing without
recording a delta, and may not treat it as a regression without checking whether 61/23
was the baseline. This number is a measurement, not a defect introduced by any
current phase.

---

## LIM-006 — Memory cannot record what was never written down

**Date:** 2026-10-01 · **Status:** CURRENT

The memory layer retrieves what previous phases recorded. It cannot recover a fact
that was never observed, and it cannot distinguish "we checked and it is fine" from
"nobody ever looked".

**This is why absence is never evidence here.** A query returning no result means no
record matched — not that the codebase is clean. The retrieval layer returns nothing
rather than a plausible guess, because a fabricated memory entry is worse than a
missing one: it will be trusted by the next reader and never re-derived.

**Where the real gaps are.** `../runtime/UNKNOWN_REGISTER.md` holds nine questions
Phase 2 could not settle, with named owners for each. Memory indexes what is known;
that register is what is not.

---

## LIM-007 — Nothing here is verified against production

**Date:** 2026-10-01 · **Status:** CURRENT

All repository-side work is verified locally. The Vercel `/api` module-load failure
(KF-008) is fixed in source and unverified in production, because no redeploy has
occurred and no Vercel build log was accessible. The precise failing specifier is
corroborated reasoning, not proof.

**Rule.** Local green never implies deployed green. Production verification requires
dashboard access this agent does not have.

---

## LIM-008 — Precision metrics count files, not wrongness

**Date:** 2026-10-01 · **Status:** CURRENT

An improvement can raise the "irrelevant" count. Phase 9's S1 work moved 11 → 9 files
while the metric went 10 → 11, because four wrong files left and one arguably-wrong
file took a freed slot. See `LESSONS_LEARNED.md` LL-004.

**Consequence.** The metric is a directional guard, not an objective. It is good at
detecting runaway growth and bad at ranking two bundles of equal size. Do not optimise
against it alone.

---

## LIM-009 — Ten of eleven memory files are outside the strict path check

**Date:** 2026-10-01 · **Status:** CURRENT

`check-knowledge.mjs` requires only `memory/MEMORY_OVERVIEW.md`. The other ten are
not path-validated, because a record of a removed file must be able to cite a path
that no longer exists. Rationale in `ARCHITECTURAL_DECISIONS.md` DEC-011.

**Consequence.** A stale or incorrect path in those files is caught by review and by
the Phase 10 knowledge audit — **not** by a gate. If a bad path is ever found, the fix
is the path, not the assertion.

---

END — LIMITATIONS