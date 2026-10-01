# Phase 8 — Task routing and minimal context
# Simulation report (tasks 8.52–8.56)

Ten tasks run through `npm run agent:context`, measured against the committed
indexes: **485 indexed files**, 20 roles, fingerprint `7e27afc36f0d`.

> **SUPERSEDED FIGURES — do not reuse without re-measuring.** The report below is
> the Phase 8 run and is accurate **for the 485-file index of that moment**. Two
> corrections apply to the current index:
>
> - **485 → 501.** 16 of the 18 real test files were never indexed at all, so
>   this run could not include a single test file. See `CONFLICTS.md` A24 and
>   `PHASE_8_CLOSURE_TEST_INDEX.md`.
> - **mean 9.7 → 9.8, max 31 → 32.** Re-running the same ten tasks against the
>   501-file index adds exactly one file total (S5) and two test files (S4, S5).
>   `TEST_DEPENDENCY` fires 0 / 10 here — see the closure record for why. The test
>   file that does reach S5 is `mcp-server/tests/apiKey.test.ts`, via
>   `PROTECTED_RELATIONSHIP`; `tools.test.ts` is not admitted at all. See the
>   Phase 9 correction note under "Why the numbers moved".
>
> The original numbers are left in place. They were correct for the index that
> produced them.

Every bundle below was validated against
`.uihub-agent/generated/CONTEXT_BUNDLE_SCHEMA.json`. **10/10 valid.**

## Method

Metrics are read from the emitted bundle, not asserted by hand:

- **files** — total in the bundle.
- **exp** — how many arrived via expansion rather than relevance.
- **p0** — files at P0 (the direct target).
- **prot / crit** — protected paths surfaced, and how many are `CRITICAL`.
- **kb** — `efficiency.selectionRatio` as a percentage **of the repository**,
  not of the candidate list.

## Results

| # | Task | Categories | Conf | Files | Exp | P0 | Prot | Crit | % repo |
|---|---|---|---|---|---|---|---|---|---|
| S1 | Fix a payment verification bug | PAYMENT + COMPONENT | HIGH | 11 | 10 | 0 | 3 | 2 | 2.3% |
| S2 | Fix WebM template preview performance | TEMPLATE + COMPONENT + UI + PERFORMANCE | HIGH | 14 | 10 | 1 | 2 | 0 | 2.9% |
| S3 | Edit `frontend/src/components/templates/TemplatePreview.tsx` | COMPONENT | HIGH | 2 | 1 | 1 | 0 | 0 | 0.4% |
| S4 | Fix the auth middleware | AUTHENTICATION + COMPONENT | HIGH | 16 | 10 | 0 | 3 | 3 | 3.3% |
| S5 | Add an MCP tool | MCP | HIGH | 31 | 6 | 1 | 4 | 4 | 6.4% |
| S6 | Fix TemplateCard so the similar rail shows WebM previews | TEMPLATE + COMPONENT + UI | HIGH | 13 | 10 | 0 | 2 | 0 | 2.7% |
| S7 | Fix an XSS vulnerability in the comment renderer | SECURITY | MEDIUM | 0 | 0 | 0 | 5 | 4 | 0.0% |
| S8 | Why is the site loading slowly? | UNKNOWN | LOW | 0 | 0 | 0 | 0 | 0 | 0.0% |
| S9 | Fix the `/activate-free` endpoint | API | MEDIUM | 10 | 10 | 0 | 4 | 1 | 2.1% |
| S10 | xyzzy frobnicate widget | UNKNOWN | LOW | 0 | 0 | 0 | 0 | 0 | 0.0% |

### Aggregate

| Metric | Value |
|---|---|
| Bundles valid against the schema | 10 / 10 |
| Files per bundle, mean | 9.7 |
| Files per bundle, max | 31 (S5) |
| Mean context size | 2.01% of the repository |
| Largest context | 6.4% of the repository (S5) |
| Bundles with zero files | 3 (S7, S8, S10) |
| Zero-file bundles carrying an explanation | 3 / 3 |
| Critical protected paths surfaced | 6 tasks |
| Tasks resolving to `UNKNOWN` honestly | 2 / 2 |

> **These are PRE-CORRECTION figures.** They were measured against an index of
> **485 files** in which only 2 of the repository's 18 test files were visible.
> Phase 8's final closure corrected the test index to **501 files** (18 test
> files indexed). The table above and the rows in *Results* are left exactly as
> first recorded — rewriting a measured result is not permitted — but they are
> superseded by the block immediately below.

### Corrected values (canonical for Phase 9)

Measured by the Phase 8 final closure, and independently re-measured at the start
of Phase 9 against a `FRESH` index, to confirm the numbers reproduce:

| Metric | Pre-correction (485 files) | Corrected (501 files) |
|---|---|---|
| Files per bundle, mean | 9.7 | **9.8** |
| Files per bundle, max | 31 (S5) | **32 (S5)** |
| Files per bundle, total | 97 | **98** |
| Relevant files | 85 | **88** |
| Irrelevant files | 12 | **10** |
| Bundle sizes S1–S10 | 11,14,2,16,31,13,0,0,10,0 | **11,14,2,16,32,13,0,0,10,0** |
| Indexed files | 485 | **501** |
| Test files indexed | 2 | **18** |

**Why the numbers moved.** Only S5 changed, and by exactly one file. Indexing the
16 previously-invisible test files made `mcp-server/tests/*` reachable, so an
`mcp-server/tests/*` file became a real expansion candidate for "Add an MCP tool"
and was admitted. No relevance weight, trigger, ranking rule or route resolution
changed. The aggregate therefore moved by +1 file in the largest bundle and +0.1 in
the mean; the "relevant" count rose by 3 because three previously-invisible test
files became relevant, and "irrelevant" fell by 2 because two `RELEVANT_CONSUMER`-only
files were displaced.

> **Corrected in Phase 9.** This paragraph previously named
> `mcp-server/tests/tools.test.ts` as the admitted file. Re-measured against the
> 501-file index, the test that reaches S5 is **`mcp-server/tests/apiKey.test.ts`**,
> admitted under `PROTECTED_RELATIONSHIP` — not `tools.test.ts`, and not under
> `TEST_DEPENDENCY`. Verified at three budgets (pinned 25/1, default/1, 25/4): the
> same single test file in all three.
>
> `tools.test.ts` imports `mcp-server/src/tools/index.ts`, which *is* in S5, so it
> is a legitimate `TEST_DEPENDENCY` candidate by import edge — but the trigger's
> subject set is the paths the **router named**, and for "Add an MCP tool" the only
> named path is `frontend/src/services/mcp.ts`, which no MCP test imports. Making
> S5 discover tests through relevance-selected subjects is the open Phase 10
> question recorded in `tasks/ROUTER_DECISIONS.md`.
>
> The counts in the table above are unaffected: one test file was admitted before
> and one is admitted now. Only the file's identity was wrong.

**Canonical baseline for Phase 9** is the **corrected** column: mean **9.8**,
largest **32**, smallest **0**, total **98**, relevant **88**, irrelevant **10**,
at an index of **501** files. `ROUTER_BENCHMARK.md` records it as the "before"
state that Phase 9 improvements are measured against.

**Two benchmark traps found while locking this baseline.** Both are properties of
how the benchmark was transcribed, not of the router:

1. **Markdown backticks are not task text.** `S9` is written in this document as
   `` Fix the `/activate-free` endpoint ``. Passing the backticks through to the
   router makes it resolve `UNKNOWN` with 0 files, because the literal backtick
   defeats exact endpoint-path matching. The benchmark task is
   `Fix the /activate-free endpoint`, and it resolves `API / MEDIUM` with 10
   files. The same applies to `S3`. Phase 9 fixes the underlying fragility.
2. **Never substitute a paraphrased task set.** A reworded task produced a
   plausible-looking mean of 16.3 which was mistaken for a router regression. The
   documented S1–S10 wording is the benchmark.

## What each simulation was chosen to prove

**S3 — explicit path stays minimal.** Naming one file returns 2 files, not 20.
The fast path works: 0.4% of the repository, and the named file is P0.

**S6 — a non-existent identifier is not invented.** `TemplateCard` does not
exist. The route still resolves `TEMPLATE + COMPONENT + UI` and returns 13
plausible files with a near-miss rather than a fabricated `TemplateCard.tsx`.
This was the original Phase 8 trap; the index reports no such component, and the
nearest real symbol is the local `CurrentTemplateCard` at
`frontend/src/components/templates/TemplateSimilarRail.tsx:221`.

**S7 — an empty result is the honest result.** No indexed source entity contains
"comment", so the bundle returns **0 files** and says so, while still surfacing
5 protected areas (4 `CRITICAL`) and 5 knowledge documents. This case was
actively broken earlier in the phase: `PROTECTED_RELATIONSHIP` did not check
whether the task had named anything, so it expanded to 10 files including
`paymentController.js` and `paymentRoutes.js` — each with a technically true
justification and no relation to the task. Ten files of padding is worse than
zero, because it reads as research. Fixed, with a regression test.

**S8 — "slow" names no subsystem.** `PERFORMANCE` is an overlay, not a surface,
so this resolves to `UNKNOWN` at `LOW` rather than confidently returning the
largest cluster of files that happen to be big.

**S9 — endpoints resolve to handlers.** `/activate-free` routes to
`backend/src/routes/userRoutes.js` via `API_MAP`, at `MEDIUM` confidence because
no entity name was typed.

## Expansion behaviour

All seven permitted triggers fire against real indexed relationships:

| Trigger | Task | Path added |
|---|---|---|
| `DIRECT_DEPENDENCY` | S1 | `backend/src/middleware/auth.js` |
| `RELEVANT_CONSUMER` | S1 | `frontend/src/components/animations/VisualEffects.tsx` |
| `SHARED_SERVICE` | two-file task | `backend/src/services/activityLogService.js` |
| `API_DEPENDENCY` | S9 | `backend/src/routes/userRoutes.js` |
| `STATE_DEPENDENCY` | two-file task | `frontend/src/context/ThemeContext.tsx` |
| `PROTECTED_RELATIONSHIP` | S1 | `api/index.js` |
| `TEST_DEPENDENCY` | `apiConfig.ts` task | `frontend/src/utils/apiConfig.test.ts` |

Three of these were **dead code** until the trigger-coverage tests were written.
They were present in `expandReasons`, documented in the contract, and could
never fire:

- `PROTECTED_RELATIONSHIP` read `e.from` off `inboundOf`, which stores plain path
  strings, so the comparison was always `undefined === path`.
- `API_DEPENDENCY` read `r.endpoint.handlers` off the public route entity, which
  does not carry `endpoint`.
- `SHARED_SERVICE` is a strict subset of `DIRECT_DEPENDENCY`, so iterating
  trigger-major let `DIRECT_DEPENDENCY` claim every shared service first and
  `SHARED_SERVICE` could never be the recorded trigger.

`TEST_DEPENDENCY` additionally required a classifier fix: `*.test.ts` files under
a `utils/` directory were classified `UTILITY`, because `PATH_RULES` outrank
`NAME_RULES`. A test file's role comes from its filename.

## Honest limitations

> Every limitation below was true **as first recorded against the 485-file
> index**. Phase 8's final closure corrected the test index; the
> *Corrected values* block above records which of these still stand. Two were
> closed: S5's size is now 32, and all 18 test files are indexed.

- **S5 returns 31 files (6.4%)** — the largest context in the set. "Add an MCP
  tool" spans backend, frontend and MCP-server, so this is defensible, but it is
  the weakest result here and would be the first thing to tighten. agent.md 8.13
  specifies guidelines rather than hard caps, so no ceiling was imposed.
  **[Corrected: S5 returns 32 files, for the reason given above.]**
- **Protected-path expansion hits the step limit and says so.** Several bundles
  stop at `reached the step limit (1)` with counts of justified files left
  unopened (132 for S2/S6). That is the budget working as designed — the
  alternative was admitting them.
- **Only 1 → 2 test files are indexed.** `backend/tests/`, `cli/tests/` and
  `mcp-server/tests/` are outside `SOURCE_ROOTS`, so 17 of the repository's 18
  test files are invisible to the router. Adding them would change the indexed
  total from 485 and invalidate the 481/485 reconciliation documented in
  `CONFLICTS.md` A24 and `CODEBASE_INTELLIGENCE.md`. Out of scope for Phase 8 and
  recorded here rather than silently changed.
  **[RESOLVED in the Phase 8 final closure: all 18 test files are now indexed and
  the index is 501 files. The 481/485/501 reconciliation is recorded in
  `CONFLICTS.md` A24 and `CODEBASE_INTELLIGENCE.md`.]**
- **Expansion quality was worse than the trigger list suggested.** Four of seven
  triggers were unreachable, and one admitted padding unrelated to the task. The
  counts above are the result of fixing those, not of the original design.