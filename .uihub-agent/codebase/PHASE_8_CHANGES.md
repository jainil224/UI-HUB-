# Phase 8 — Task routing and minimal context
# Completion report

Status: **COMPLETE**
Branch: `main` · local commit only, not pushed
Baseline preserved: Phase 7 commit `b0d5c1d88af1c0e46895c1a52ea2f19a2eb49869`

## 1. What was built

A task router and minimal-context loader. One natural-language task goes in; a
ranked, justified, budgeted reading list comes out.

```text
"Fix a payment verification bug"
        ↓  agent:route      intent, categories, surface, confidence, entities
        ↓  agent:context    files with reasons, protected areas, knowledge,
                           validation, expansion log, efficiency
        ↓  agent:query      targeted index lookups
        ↓  inspect          open only what was justified
```

Two properties are load-bearing:

- **Every file can say why it is there.** A file with no stated reason cannot be
  in the bundle.
- **The context stays small.** Mean 9.7 files across ten real tasks; 2.01% of
  the repository.
  - *Re-measured in the Phase 8 final closure against the 501-file index: mean
    **9.8** files, relevant 85 → 88, heuristic/irrelevant 12 → 10. No
    regression.*

## 2. Files created

| File | Purpose |
|---|---|
| `.uihub-agent/scripts/lib/router-matrix.mjs` | 18-category matrix, source of truth |
| `.uihub-agent/scripts/lib/router.mjs` | `classify(task)` |
| `.uihub-agent/scripts/lib/relevance.mjs` | evidence tiers, ranking, budgets |
| `.uihub-agent/scripts/lib/expand.mjs` | graph-driven expansion, step budget |
| `.uihub-agent/scripts/lib/expand-reasons.mjs` | the seven permitted triggers |
| `.uihub-agent/scripts/lib/protected.mjs` | tiers parsed from `PROTECTED_PATHS.md` |
| `.uihub-agent/scripts/lib/bundle.mjs` | bundle assembly + `validateBundle()` |
| `.uihub-agent/scripts/lib/cli-args.mjs` | shared CLI parser |
| `.uihub-agent/scripts/lib/intel.mjs` | tokenization, resolution, graph facade |
| `.uihub-agent/scripts/route-task.mjs` | `npm run agent:route` |
| `.uihub-agent/scripts/context-task.mjs` | `npm run agent:context` |
| `.uihub-agent/tasks/TASK_ROUTER.md` | routing contract |
| `.uihub-agent/tasks/CONTEXT_BUNDLE.md` | bundle contract |
| `.uihub-agent/tasks/CONTEXT_ROUTING_GUIDE.md` | how it works (8.53) |
| `.uihub-agent/tasks/OPENCODE_USAGE.md` | OpenCode workflow (8.45) |
| `.uihub-agent/tasks/ANTIGRAVITY_USAGE.md` | tool-agnostic workflow (8.46) |
| `.uihub-agent/tasks/ROUTING_MATRIX.json` | generated routing matrix |
| `.uihub-agent/generated/CONTEXT_BUNDLE_SCHEMA.json` | generated bundle contract |
| `.uihub-agent/generated/KNOWLEDGE_ROUTING_GRAPH.json` | category → document graph |
| `.uihub-agent/generated/CONTEXT_MANIFEST.json` | static template (8.39) |
| `.uihub-agent/tests/router.test.mjs` | 20 tests |
| `.uihub-agent/tests/context.test.mjs` | 31 tests |
| `.uihub-agent/codebase/PHASE_8_{SIMULATIONS,CHANGES,CHECKLIST}.md` | reports |

## 3. Files modified

| File | Change |
|---|---|
| `.uihub-agent/scripts/query-index.mjs` | importable API + `UsageError` (8.16/8.19/8.20) |
| `.uihub-agent/scripts/generate-index.mjs` | 19 artifacts, bundle schema, routing graph |
| `.uihub-agent/scripts/check-index.mjs` | 19-artifact list, routing sync, graph edges |
| `.uihub-agent/scripts/lib/classify.mjs` | test-file role precedence fix |
| `.uihub-agent/codebase/FILE_ROLE_MAP.json` | regenerated (`apiConfig.test.ts` → TEST) |
| `.uihub-agent/codebase/FEATURE_MAP.json` | regenerated |
| `.uihub-agent/generated/INTELLIGENCE_MANIFEST.json` | regenerated |
| `.uihub-agent/generated/REVERSE_DEPENDENCY_MAP.json` | regenerated |
| `.github/workflows/ci.yml` | added blocking `task-routing` job |
| `package.json` | `agent:route`, `agent:context`, `agent:test`, `check:routing` |
| `agent.md` | appended workflow + status (8.44) |

**No application source was modified.** `frontend/`, `backend/`, `mcp-server/`,
`cli/`, `api/` and deployment configuration are untouched.

## 4. Gates added

| Gate | Result |
|---|---|
| `npm run agent:index:check` | 19/19 fresh, fingerprint `7e27afc36f0d` |
| `npm run agent:test` | 51/51 pass |
| `node .uihub-agent/scripts/check-index.mjs` | 20 MATCH, 3 WARN, 0 FAIL |
| Bundle schema validation | 10/10 simulations valid |
| Secret scan on emitted bundles | no findings; exit 3 verified with a planted key |
| CI `task-routing` job | blocking, additive |

## 5. Preserved baselines (8.55, 8.56)

| Baseline | Status |
|---|---|
| Frontend typecheck | **61 errors / 23 files — unchanged, not fixed** |
| Backend tests | 79/79 |
| MCP tests | 95/95 |
| CLI tests | 30/30 |
| Frontend tests | 27/27 |
| Builds (frontend, MCP, CLI) | pass |
| `check:config` | red on 4 owner-owned conflicts — **not resolved** |
| `npm run check` | red **because of** the above; no gate weakened |
| Production data / deployment | none |

## 6. Bugs found and fixed during the phase

The honest part: several things were documented as working and were not.

**1. Three of seven expansion triggers were dead code.**

- `PROTECTED_RELATIONSHIP` read `e.from` off `inboundOf`, which stores plain path
  strings. The comparison was always `undefined === path`, so it could never
  fire.
- `API_DEPENDENCY` read `r.endpoint.handlers` off the public route entity, which
  does not carry `endpoint`.
- `SHARED_SERVICE` is a strict *subset* of `DIRECT_DEPENDENCY`, so iterating
  trigger-major let `DIRECT_DEPENDENCY` claim every shared service first.
  `SHARED_SERVICE` could never be the recorded trigger.

Fixed by switching to candidate-major selection with most-specific-trigger-wins,
and exposing `handlers` on the public route entity.

**2. `PROTECTED_RELATIONSHIP` admitted padding unrelated to the task.** It never
checked whether the task had named anything, so it was satisfiable by anything
reachable from protected config. "Fix an XSS vulnerability in the comment
renderer" — where no indexed entity contains "comment" — expanded to 10 files
including `paymentController.js` and `paymentRoutes.js`. Each had a technically
true justification and no relation to the task. Ten files of padding is worse
than zero because it reads as research. Fixed with a `named.size > 0` guard and a
regression test.

**3. Test files were misclassified.** `PATH_RULES` outrank `NAME_RULES`, so
`frontend/src/utils/apiConfig.test.ts` matched `utils/` and became `UTILITY`
rather than `TEST`. This silently limited `TEST_DEPENDENCY`. A test file's role
comes from its filename, so it is now checked first.

**4. The router matrix pointed at directories that did not exist.**
`AUTHENTICATION` named `frontend/src/pages/LoginPage` and
`frontend/src/pages/SignupPage`; `DATABASE` named `backend/src/models`, which
does not exist (`DATABASE_USAGE_MAP` records zero mongoose models). Every
database task was pointed at nothing. Corrected against
`DATABASE_USAGE_MAP.json` / real directories.

**5. Expansion candidates were drawn from the wrong set.** They came from the
relevance engine's *pending* list, which is empty by construction for a task that
named one file — so expansion could never run. Now drawn from the import graph's
actual consumers and dependencies.

**6. camelCase identifiers resolved as one token.** `TemplatePreview` matched only
the compound, not `template` *and* `preview`. Fixed with `splitWords()`.

**7. Action words were treated as identifiers.** "Refactor
ParticleSphereRefactor" resolved `ParticleSphereRefactor` as if the user had
named it. Action words are now stripped before resolution.

**8. Self page relationships inflated relevance.** A file and the page rendering
it are trivially related; counting that made every file on a page look relevant.
Excluded, with transitive reachability demoted.

**9. Path segments had no frequency weighting.** `utils/` scored like
`CloudScroll/`. Added `PATH_SEGMENT` (common) and `PATH_SEGMENT_RARE`.

**10. `efficiency.totalIndexedFiles` divided by the wrong denominator.** It used
the candidate count, so "12 of 12 candidates" read as a 100% context. Now
measured against the real repository total.

## 7. Deviations from the specification

**Test files are largely invisible to the router.** 17 of the repository's 18
test files live in `backend/tests/`, `cli/tests/` and `mcp-server/tests/`, which
are outside `SOURCE_ROOTS`. Adding them would change the indexed total from 485
and invalidate the 481/485 reconciliation documented in `CONFLICTS.md` A24 and
`CODEBASE_INTELLIGENCE.md`. Out of scope for Phase 8; recorded rather than
silently changed. Consequence: `TEST_DEPENDENCY` fires rarely.

> **CORRECTED IN THE PHASE 8 FINAL CLOSURE — this deviation is now resolved.**
> Both the figure and the reasoning were off.
>
> - The count is **16 of 18**, not 17. The two tests inside `frontend/src`
>   (`utils/apiConfig.test.ts`, `routing/vercelRouting.test.ts`) *were* indexed,
>   because `frontend/vitest.config.ts` colocates them under a `SOURCE_ROOT`.
> - The reasoning was wrong. "It would change 485 and invalidate the 481/485
>   reconciliation" describes a bookkeeping obstacle, not a reason to leave real
>   code unindexed — and the reconciliation it aimed to protect was reconciling
>   an *incomplete* set in the first place. Correcting it to 501 **strengthens**
>   A24 rather than invalidating it.
>
> `TEST_ROOTS` was added in the closure. 485 → 501 files, `TEST` role 2 → 18. See
> `PHASE_8_CLOSURE_TEST_INDEX.md`.

**"Add an MCP tool" returns 31 files (6.4%).** The largest context in the
simulation set. Defensible — the task spans backend, frontend and MCP-server —
and agent.md 8.13 specifies guidelines rather than hard caps, so no ceiling was
imposed. It is the weakest result and the first thing to tighten.

**Protected-path expansion hits the step limit.** Several bundles stop at
`reached the step limit (1)` with justified files left unopened (132 for S2/S6).
That is the budget working; the alternative was admitting them.

## 8. What was deliberately not done

- The 61 frontend typecheck errors were **not** fixed (8.55).
- The four owner-owned configuration conflicts were **not** resolved.
- No existing gate was weakened to make Phase 8 pass (8.54).
- No application source was refactored, and nothing was deployed (8.56).
- `SOURCE_ROOTS` was **not** changed, despite the `TEST_DEPENDENCY` limitation,
  because that would have invalidated a documented Phase 7 reconciliation.

## 9. Verification

```text
npm run agent:index        19 artifacts, 485 files, fp 7e27afc36f0d
npm run agent:index:check  19/19 fresh
npm run agent:test         51/51 pass
npm run check:index        20 MATCH, 3 WARN, 0 FAIL
```

Simulations, all schema-valid: **10/10**. Bundles with zero files: **3**, each
with an explanation: **3/3**.

## 10. Bottom line

Phase 8 delivers a router that decides *before* searching, and a context loader
that can justify every file it hands over.

The significant finding is not the feature — it is that **the feature did not
work as documented when it was first tested.** Four of seven expansion triggers
were unreachable, one admitted files unrelated to the task, the routing matrix
pointed at two directories that do not exist, and test files were classified as
utilities. Every one of those was invisible to a passing test suite because
nothing asserted that the triggers could fire at all.

The tests added here now assert behaviour against real repository data rather
than against the shape of the code. That is the durable part.