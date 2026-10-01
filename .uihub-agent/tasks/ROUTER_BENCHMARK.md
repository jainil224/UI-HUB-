# ROUTER BENCHMARK

**Owner:** Phase 9 — Router Precision, Context Optimization & Retrieval Quality
**Task:** TASK 9.1 (lock the canonical benchmark), TASK 9.41 (additional precision benchmarks)
**Status:** CANONICAL — this file is the regression benchmark for the task router.

> This is the permanent, single source of truth for router behaviour. A benchmark
> is only worth having if it cannot drift, so the task wording below is fixed.
> **Do not paraphrase it. Do not reword it to make a number look better.**

---

## 1. Ground rules

1. **Task text is reproduced verbatim.** Where this file shows a path, that path
   is part of the task text. Where it does not, no path is in the task.
2. **No markdown decoration is task content.** Backticks, bold and code fences are
   presentation. Two benchmark tasks (`S3`, `S9`) are documented elsewhere with
   backticks; passing those backticks to the router changes the result, because a
   literal backtick defeats exact path matching. That fragility is a router defect
   (recorded in `ROUTER_REGRESSESSION.md`), not a property of the benchmark.
3. **One index state.** Every bundle must be produced from the same index
   fingerprint. Comparing a bundle from one index state to another is invalid.
4. **Metrics are read from the emitted bundle**, never asserted by hand.
5. **Historical figures are preserved, not overwritten.** Where a value was
   corrected, both values appear with the reason.

---

## 2. Canonical set — S1–S10

These ten tasks are the canonical regression benchmark. They are the exact set
recorded by Phase 8 in `codebase/PHASE_8_SIMULATIONS.md`.

| ID | Task text | Expected category | Expected surface | Expected target area | Known relevant files (ground truth) |
|---|---|---|---|---|---|
| S1 | `Fix a payment verification bug` | PAYMENT (+ COMPONENT) | FRONTEND, BACKEND | payment/access | `backend/src/services/accessService.js`, `backend/src/middleware/auth.js` |
| S2 | `Fix WebM template preview performance` | TEMPLATE + COMPONENT + UI (+ PERFORMANCE overlay) | FRONTEND | templates | `frontend/src/components/templates/TemplatePreview.tsx` |
| S3 | `Edit frontend/src/components/templates/TemplatePreview.tsx` | COMPONENT | FRONTEND | templates | the named file itself, plus its reverse deps |
| S4 | `Fix the auth middleware` | AUTHENTICATION (+ COMPONENT) | BACKEND, FRONTEND | auth | `backend/src/middleware/auth.js` |
| S5 | `Add an MCP tool` | MCP | BACKEND, FRONTEND, MCP | mcp-server | `mcp-server/src/tools/index.ts`, `mcp-server/src/tools/helpers.ts` |
| S6 | `Fix TemplateCard so the similar rail shows WebM previews` | TEMPLATE + COMPONENT + UI | FRONTEND | templates | **none — `TemplateCard` does not exist**; nothing may be invented for it |
| S7 | `Fix an XSS vulnerability in the comment renderer` | SECURITY | FRONTEND | security | **none — no indexed entity contains "comment"**; a zero-file bundle is the correct answer |
| S8 | `Why is the site loading slowly?` | UNKNOWN | — | — | **none**; must return LOW confidence and ask for narrowing |
| S9 | `Fix the /activate-free` endpoint | API | BACKEND, FRONTEND | backend API | `backend/src/routes/userRoutes.js` |
| S10 | `xyzzy frobnicate widget` | UNKNOWN | — | — | **none**; must return LOW confidence |

### Ground-truth caveat (TASK 9.30)

The "known relevant" column above is **partial by construction**. It records the
file a human already knows is relevant, not an exhaustive set of everything that
must be loaded. Coverage figures computed against it are therefore a **lower
bound**, and must be reported as such. A file may legitimately be relevant
without appearing in that column. Claiming a completeness the ground truth cannot
support is prohibited.

### 2.1 Canonical baseline (corrected, 501-file index)

Recorded by the Phase 8 final closure and **independently re-measured at the start
of Phase 9** against a `FRESH` index, where it reproduced exactly. This is the
"before" state for TASK 9.42.

| Metric | Value |
|---|---|
| Index | 501 files, `FRESH` |
| Bundle sizes S1–S10 | 11, 14, 2, 16, 32, 13, 0, 0, 10, 0 |
| Mean | 9.8 |
| Largest | 32 (S5) |
| Smallest | 0 (S7, S8, S10) |
| Total | 98 |
| Relevant | 88 |
| Irrelevant | 10 |
| Zero-file bundles | 3 (S7, S8, S10) — all carry an explanation |
| Schema valid | 10 / 10 |
| `TEST_DEPENDENCY` fired | 0 of 98 expanded files |

**Metric definitions.** *Relevant* = every selected file except those admitted by
expansion on the weakest permitted trigger alone (`RELEVANT_CONSUMER`). Those are
counted *irrelevant* because the file imports something the task named but nothing
the task named depends on it — useful context, not required by the task. The
split is computed from `addedByExpansion` and `expansionTrigger` on the emitted
bundle.

**Pre-correction history.** Against the earlier 485-file index (2 of 18 test files
visible) the same set measured mean 9.7, max 31, total 97, relevant 85,
irrelevant 12. Only S5 moved, by one file, when `mcp-server/tests/*` became
reachable. Both sets are preserved in `codebase/PHASE_8_SIMULATIONS.md`.

---

## 3. Additional precision benchmarks (TASK 9.41)

These are **separate from, and must never be merged into, the canonical set.**
They exist to probe specific behaviours the canonical set does not isolate.

| ID | Task text | Probes |
|---|---|---|
| X1 | `Add an MCP tool` | connectivity tie-break, duplicate of S5 for comparison |
| X2 | `Fix backend/src/services/healthService.js` | explicit-file fast path + `TEST_DEPENDENCY` |
| X3 | `Update accessService.js` | named service without a full path |
| X4 | `Modify TemplatePreview.tsx` | named component by name only |
| X5 | `Change the templates service` | feature-level task |
| X6 | `Fix the /templates page` | route fast path (page route) |
| X7 | `Fix /api/v1/templates` | route fast path (API endpoint) |
| X8 | `Fix /admin/mcp/health` | route fast path (admin route) |
| X9 | `Fix authentication middleware` | conceptual auth task |
| X10 | `Fix the card` | ambiguous — must not scan broadly |
| X11 | `Fix config` | ambiguous — must not scan broadly |
| X12 | `Fix admin` | ambiguous — must not scan broadly |
| X13 | `Improve loading` | ambiguous — must not scan broadly |
| X14 | `Fix the template` | ambiguous |
| X15 | `Fix user issue` | ambiguous |
| X16 | `Make paid templates available in the user library` | multi-feature intersection |
| X17 | `Fix frontend/src/components/templates/TemplateCard.tsx` | explicit path that does not exist — must not invent |
| X18 | `Fix templates` | feature fast path |
| X19 | `Fix MCP` | feature fast path |
| X20 | `Fix authentication` | feature fast path |
| X21 | `Fix payments` | feature fast path |

**X10–X15 (ambiguous tasks)** must not trigger a broad repository scan. They name
generic words; a router that fills the context with everything matching "card" or
"config" is over-inclusive, and the fix is narrowing, not padding.

**X17 (non-existent path)** must resolve to nothing rather than inventing a
file. `X17` is the explicit-path form of the same honesty requirement as `S6`.

---

## 4. Measurement procedure

1. `npm run agent:index:check` must report `FRESH`. Do not proceed on stale indexes.
2. Build a bundle for each task with the shipped defaults: relevance budget 25,
   expansion steps 1. Do not pass a larger budget to make a bundle look complete.
3. Validate every bundle against the generated
   `generated/CONTEXT_BUNDLE_SCHEMA.json`.
4. Record per task: files, initial, expanded, relevant, irrelevant, protected
   areas, trigger histogram, stop reason, and the full file list with reasons.
5. Aggregate exactly as in section 2.1.
6. Compare against the section 2.1 baseline only when the index fingerprint and
   file count match. Otherwise state both.

---

## 5. What "regression" means here

A change is a **forbidden regression** if any of these becomes true:

- `S3` stops returning the named file first.
- `S6` or `S17` invents a file that does not exist.
- `S7`, `S8` or `S10` returns a non-empty bundle, or returns empty without an
  explanation.
- `S8` or `S10` claims HIGH or MEDIUM confidence.
- A zero-file bundle ever coexists with an `emptyReason` of `null`.
- Any selected file lacks at least one recorded reason.
- Any expansion file lacks the trigger that authorised it.
- A bundle's `dependencies` disagrees with its `expansionLog`.
- `S5` drops a highly-connected tool purely because of alphabetical order.
- An unrelated protected file enters a bundle merely because it is protected.
- A bundle's size changes without the reason being recorded in
  `ROUTER_DECISIONS.md`.

An **acceptable variation** is a change in bundle size, ordering, or trigger
attribution that is explained by a recorded design decision, keeps the schema
valid, keeps every file explainable, and preserves every forbidden-regression
condition above.

---

END — ROUTER BENCHMARK