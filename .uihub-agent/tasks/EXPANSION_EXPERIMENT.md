# Expansion-subject experiment (DEC-009)

*Generated 2026-10-03 by `agent:experiment`. Read-only: no engine module was changed.*

## 1. The question

Expansion grows from one seed set. `namedPaths()` in `expand.mjs` is **only
the explicit files** when the developer named any, and otherwise the resolved
components, services, hooks and route handlers. Files the relevance engine
admitted on its own are in the bundle but are **not** expansion subjects:
expansion never walks out from them.

The proposal is to also treat relevance-admitted files as subjects, buying one
more hop out. DEC-009 deferred it rather than rejecting it, because the stated
worry - re-admitting the whole feature through the back door, the over-broad
context the 8.30 fast path exists to prevent - was an argument, not a
measurement. This is the measurement.

## 2. Method

For each of the ten canonical tasks: build the real bundle, derive the proposed
subject set (current seeds + relevance-admitted non-test files), re-derive the
candidate universe with `candidatesFor()`, and for each trigger in
`TRIGGER_PRIORITY` ask `reasonsForPath()` which files that trigger would newly
admit. Only files the current bundle does not already contain are counted, so
the number is the *cost of widening*, not what the trigger can see.

The experiment re-uses the shipped `candidatesFor()` and `reasonsForPath()`
rather than a re-implementation, so it cannot drift from the engine it measures.
`runExperiment()` asserts the bundle is byte-identical before and after, so
"read-only" is a checked invariant and not a promise.

## 3. How the answer is judged

Most canonical tasks have no enumerable ground truth. Four do: **S6, S7, S8 and
S10 are tasks whose correct answer is nothing.** S6 names a component that does
not exist, S7 names an entity that is not in the index, S8 and S10 are unknown.
The benchmark states a zero-file bundle is correct and that nothing may be
invented.

For those four, every file a trigger would newly admit is a **provable false
positive** - not a judgement about relevance, a contradiction of a stated
requirement. A trigger that widens them is disqualified regardless of what it
does elsewhere. For the six tasks with known relevant files, an addition counts
as `ground-truth-relevant` only if it is in the benchmark's list; anything else
is `unverified` and is never counted as a win.

| Expectation | Tasks | Basis |
|---|---|---|
| `empty` | S6, S7, S8, S10 | the benchmark states the correct bundle is empty and that nothing may be invented |
| `known` | S1, S2, S4, S5, S9 | the benchmark enumerates the known relevant files |
| `structural` | S3 | the benchmark describes the ground truth qualitatively, so it can only measure growth |

## 4. Per-task result

Bold marks a cell containing invented files; `!n` is how many.

| ID | Ground truth | Bundle now | Expanded now | Relevance subjects | TEST | API | STATE | PROTECTED | SHARED_SERVICE | DIRECT | RELEVANT |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | known | 9 | 8 | 1 | 0 | 0 | 0 | 0 | 0 | 5 | 0 |
| S2 | known | 14 | 10 | 3 | 0 | 0 | 0 | 8 | 0 | 119 | 15 |
| S3 | structural | 2 | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| S4 | known | 16 | 10 | 6 | 0 | 0 | 1 | 0 | 0 | 11 | 11 |
| S5 | known | 42 | 7 | 34 | 5 | 0 | 0 | 0 | 0 | 3 | 7 |
| S6 | empty | 13 | 10 | 3 | 0 | 0 | 0 | **9** (!9) | 0 | **117** (!117) | **15** (!15) |
| S7 | empty | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| S8 | empty | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| S9 | known | 10 | 10 | 0 | 1 | 0 | 0 | 1 | 0 | 0 | 1 |
| S10 | empty | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |

S6 is where the answer becomes unambiguous. Its shipped bundle is
13 files, and the widening would add 141 more on
top of it - every one of them invented for a task whose correct answer is
nothing. (The 13-file baseline is itself worth reading against
the benchmark's "none"; that is a separate question, recorded in
`KNOWN_FAILURES.md`, and it is *not* what this experiment decides.)

## 5. Per-trigger verdict

| Trigger | Tasks widened | Files added | False positives | Ground-truth hits | Unverified | Verdict |
|---|---|---|---|---|---|---|
| TEST_DEPENDENCY | 2 | 6 | 0 | 0 | 6 | DEFER |
| API_DEPENDENCY | 0 | 0 | 0 | 0 | 0 | NO EFFECT |
| STATE_DEPENDENCY | 1 | 1 | 0 | 0 | 1 | DEFER |
| PROTECTED_RELATIONSHIP | 3 | 18 | 9 | 0 | 9 | REJECT |
| SHARED_SERVICE | 0 | 0 | 0 | 0 | 0 | NO EFFECT |
| DIRECT_DEPENDENCY | 5 | 255 | 117 | 1 | 137 | REJECT |
| RELEVANT_CONSUMER | 5 | 49 | 15 | 0 | 34 | REJECT |

## 6. The invented files

### PROTECTED_RELATIONSHIP - 9 invented file(s)

  - `frontend/src/components/templates/TemplateCodeViewer.tsx` (via S6)
  - `frontend/src/components/templates/TemplatePreview.tsx` (via S6)
  - `frontend/src/components/ui/SearchBox.tsx` (via S6)
  - `frontend/src/pages/BuildWithUIHubPage/BuildWithUIHubDetailPage.tsx` (via S6)
  - `frontend/src/pages/HomePage/sections/BuildWithUIHubSection.tsx` (via S6)
  - `frontend/src/pages/HomePage/sections/TemplatesSection.tsx` (via S6)
  - `frontend/src/utils/searchIndex.ts` (via S6)
  - `frontend/src/utils/templatePromptUtils.ts` (via S6)
  - `frontend/src/utils/templateRelevance.ts` (via S6)

### DIRECT_DEPENDENCY - 117 invented file(s)

  - `frontend/src/components/templates/TemplateCodeViewer.tsx` (via S6)
  - `frontend/src/components/ui/AsciiCursor.tsx` (via S6)
  - `frontend/src/components/ui/AsciiWater.tsx` (via S6)
  - `frontend/src/components/ui/AuraCursor.tsx` (via S6)
  - `frontend/src/components/ui/AuroraBpmLoader.tsx` (via S6)
  - `frontend/src/components/ui/background-boxes.tsx` (via S6)
  - `frontend/src/components/ui/background-paths.tsx` (via S6)
  - `frontend/src/components/ui/BeamGridBackground.tsx` (via S6)
  - `frontend/src/components/ui/BlackHole.tsx` (via S6)
  - `frontend/src/components/ui/BlackHoleBackground.tsx` (via S6)
  - `frontend/src/components/ui/BlackHoleCursor.tsx` (via S6)
  - `frontend/src/components/ui/BlockDrift.tsx` (via S6)
  - ... and 105 more

### RELEVANT_CONSUMER - 15 invented file(s)

  - `frontend/src/App.tsx` (via S6)
  - `frontend/src/components/ui/SearchBox.tsx` (via S6)
  - `frontend/src/pages/BuildWithUIHubPage/BuildWithUIHubDetailPage.tsx` (via S6)
  - `frontend/src/pages/Components/DemoPage.tsx` (via S6)
  - `frontend/src/pages/Dashboard/CollectionsPage.tsx` (via S6)
  - `frontend/src/pages/Dashboard/components/ComponentPreviewTile.tsx` (via S6)
  - `frontend/src/pages/Dashboard/FavoritesPage.tsx` (via S6)
  - `frontend/src/pages/HomePage/sections/ComponentGrid.tsx` (via S6)
  - `frontend/src/pages/HomePage/sections/TemplatesSection.tsx` (via S6)
  - `frontend/src/pages/LibraryPage/HoverPreviewPopover.tsx` (via S6)
  - `frontend/src/pages/LibraryPage/sections/ComponentDetail/index.tsx` (via S6)
  - `frontend/src/services/community.tsx` (via S6)
  - ... and 3 more

## 7. Conclusion

- **Rejected outright: PROTECTED_RELATIONSHIP, DIRECT_DEPENDENCY, RELEVANT_CONSUMER.** Each invents
  files for a task whose correct answer is nothing, so the 8.30 concern is
  confirmed and measured rather than argued. `DIRECT_DEPENDENCY` is the worst:
  255 files, of which
  117 are on S6 alone.
- **No measurable effect: API_DEPENDENCY, SHARED_SERVICE.** They fire
  on no canonical task even with the wider subject set, so widening buys nothing
  for them. Widening them is a pure risk with no measured upside.
- **Deferred: TEST_DEPENDENCY, STATE_DEPENDENCY.** These add
  7 file(s) and break no empty-answer
  task, but none of the additions is evidenced as relevant by the benchmark, so
  there is no reason to admit them yet either.

**Recommendation: keep the DEC-009 deferral, and record this measurement as its
justification.** The per-trigger split does not identify a safe subset to widen -
the two triggers that are safe in isolation add nothing, and the two that would
add something are exactly the two that invent context. Behaviour is unchanged;
this file is evidence for a future decision, not a change.

## 8. Reproduce

```
npm run agent:experiment          # this report
npm run agent:experiment -- --json
node --test .uihub-agent/tests/expansion-experiment.test.mjs
```
