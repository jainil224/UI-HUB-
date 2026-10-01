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
>   `TEST_DEPENDENCY` fires 0 / 10 here — see the closure record for why, and for
>   the ranking defect that keeps `mcp-server/tests/tools.test.ts` out of S5.
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

- **S5 returns 31 files (6.4%)** — the largest context in the set. "Add an MCP
  tool" spans backend, frontend and MCP-server, so this is defensible, but it is
  the weakest result here and would be the first thing to tighten. agent.md 8.13
  specifies guidelines rather than hard caps, so no ceiling was imposed.
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
- **Expansion quality was worse than the trigger list suggested.** Four of seven
  triggers were unreachable, and one admitted padding unrelated to the task. The
  counts above are the result of fixing those, not of the original design.