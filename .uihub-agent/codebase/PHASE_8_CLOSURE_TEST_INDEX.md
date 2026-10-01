# PHASE 8 FINAL CLOSURE — TEST INDEX CORRECTION

Recorded during the Phase 8 final closure, after the Phase 8 implementation commit
and before Phase 9. This document exists because the closure changed a number that
several Phase 7 records had already published, and hiding that would have left the
knowledge base quietly wrong.

## Summary

| | before | after |
| --- | --- | --- |
| Indexed files | 485 | **501** |
| Files with role `TEST` | 2 | **18** |
| `TEST_DEPENDENCY` trigger | reachable only for 2 frontend tests | reachable across 17 test files |
| `check-index` cross-references | 20 MATCH, 3 WARN, 0 FAIL | 20 MATCH, 3 WARN, 0 FAIL |

No application source was touched. No test file was moved. No production data or
deployment changed.

## Step 2 — the audit

Read-only, before any change. Repository evidence only.

**All test files: 18.** Found by enumerating `*.test.*` / `*.spec.*` across
`frontend`, `backend`, `mcp-server`, `cli`, `api` and `scripts`, excluding
`node_modules`, `dist` and `public`.

| path | in a `SOURCE_ROOT`? |
| --- | --- |
| `backend/tests/accessService.test.js` | no |
| `backend/tests/broadcastAuth.test.js` | no |
| `backend/tests/collectionsService.test.js` | no |
| `backend/tests/cors.test.js` | no |
| `backend/tests/emailTestSecret.test.js` | no |
| `backend/tests/health.test.js` | no |
| `cli/tests/args.test.ts` | no |
| `cli/tests/config.test.ts` | no |
| `cli/tests/mcp.test.ts` | no |
| `cli/tests/output.test.ts` | no |
| `mcp-server/tests/apiKey.test.ts` | no |
| `mcp-server/tests/auth.test.ts` | no |
| `mcp-server/tests/configService.test.ts` | no |
| `mcp-server/tests/cors.test.ts` | no |
| `mcp-server/tests/permissions.test.ts` | no |
| `mcp-server/tests/tools.test.ts` | no |
| `frontend/src/routing/vercelRouting.test.ts` | **yes** |
| `frontend/src/utils/apiConfig.test.ts` | **yes** |

**Indexed at the time: 2 of 18.**

Note on the earlier report: Phase 8's closure report said "17 of 18 test files sit
outside `SOURCE_ROOTS`". The audited figure is **16 of 18**. The two colocated
`frontend/src` tests were reachable; the sixteen in sibling `tests/` directories
were not. The original Phase 8 report had counted one of the two frontend files
as excluded.

### Why they were excluded

`walk.mjs` exported a single `SOURCE_ROOTS` list:

```js
export const SOURCE_ROOTS = [
  'frontend/src', 'backend/src', 'mcp-server/src', 'cli/src',
  'api', 'scripts', 'backend/scripts', 'frontend/scripts',
];
```

Every test directory in the repository is a *sibling* of `src`, not a child of it.
Nothing in that list reaches `backend/tests`. The walker was never offered the
files, so nothing downstream could classify them.

### Were they intentionally excluded?

**No.** The evidence:

- The exclusion came from a list of *application source* roots, not from a
  deliberate test-exclusion decision. There was no `TEST_ROOTS`, no test-specific
  exclusion reason in the ledger, and no documented rationale.
- The two tests that *were* indexed were not included by policy either. They were
  reachable purely because `frontend/vitest.config.ts` uses `src/**/*.test.ts`
  and colocates tests inside the root.
- `PROTECTED_PATHS.md` line 96 lists `backend/tests/`, `mcp-server/tests/`,
  `frontend/src/**/*.test.ts` and `cli/tests/` as a protected area — the project
  treats these files as first-class and worth protecting.
- Phase 7's own `CONFLICTS.md` A24 reconciled 481 against 485 and called the
  result complete.

So this was an unnoticed gap, not a decision.

## Step 3 — the indexing model chosen

Neither of the two suggested approaches was needed in full.

**Rejected: dedicated `TEST_ROOTS` as a separate index or store.** That would have
required a second discovery pass, a second set of artifacts, and a merge step —
all to re-serve files that the existing pipeline already knows how to parse,
resolve and classify.

**Chosen: `TEST_ROOTS` walked alongside `SOURCE_ROOTS`, in the same store.**

```js
export const TEST_ROOTS = ['backend/tests', 'mcp-server/tests', 'cli/tests'];
export const ALL_ROOTS = [...SOURCE_ROOTS, ...TEST_ROOTS];
```

`discover()` iterates `ALL_ROOTS`. Everything downstream — parsing, import
resolution, classification, the graph, reverse dependencies — is unchanged code
operating on more files. Both root lists are recorded separately in every
generated artifact (`sourceRoots`, `testRoots`, `allRoots`) so provenance is
readable rather than inferred.

This is the smallest change that produces both directions of the relationship
from real graph edges:

| question | answered by |
| --- | --- |
| which source files does this test cover? | `IMPORT_GRAPH` outbound edge |
| which tests cover this component/service/API? | `REVERSE_DEPENDENCY_MAP.importers` |

**No test file was moved.** The repository's architecture does not require it.

## Step 4 — test classification

The classifier was **not** the bug, which is worth stating plainly. `classify.mjs`
already returned `TEST` for both `(^|/)tests?/` and `*.test.*`. Two changes were
still needed:

1. **Directory evidence is now explicit and reachable.** Previously `tests/`
   classified a file correctly but only if the walker supplied it. The
   test-directory branch is now a named, documented case rather than an
   incidental path rule, with `roleSource: 'test-directory'` so a reader can tell
   which evidence fired.
2. **The filename pattern was incomplete.** `/\.(test|spec)\.[tj]sx?$/` covered
   `.ts/.tsx/.js/.jsx` but not `.mjs/.cjs`, which `walk.mjs` declares as code
   extensions. It now mirrors `CODE_EXT`. No file in the repository was affected
   today (`.uihub-agent/tests/*.test.mjs` are the only such files and that
   directory is not indexed), so this is hardening rather than a live fix.

**The rule is anchored and evidence-based.** It is not a substring search for
"test". Verified against three real files that contain "test" and are not tests:

| file | role | why it is not a test |
| --- | --- | --- |
| `backend/src/scripts/sendAllTestEmails.js` | SCRIPT | no `.test.` infix |
| `backend/src/scripts/testEmailRequest.js` | SCRIPT | `test` is a prefix, not an infix |
| `frontend/src/components/ui/testimonials-card.tsx` | COMPONENT | `testimonials` is one word |

`isTestPath()` is exported from `classify.mjs` and used by the generator, so the
generator and classifier cannot disagree about what counts as a test.

## Step 5 — two further defects found and fixed

### 5a. A test fixture route was published as real API surface

Indexing the tests immediately surfaced a CONFLICT in `check-index`:

```
CONFLICT API_MAP -> FILE_ROLE_MAP
  2 endpoint(s) declared outside a router/controller/entrypoint:
  GET /probe -> backend/tests/cors.test.js, mcp-server/tests/cors.test.ts (TEST,TEST)
  POST /probe -> backend/tests/cors.test.js (TEST)
```

Both CORS tests build a throwaway express app:

```js
app.get('/probe', (_req, res) => res.json({ ok: true }));
app.post('/probe', (_req, res) => res.json({ ok: true }));
```

`app` matches the router-receiver pattern, so `GET /probe` and `POST /probe`
entered `API_MAP` as real endpoints owned by files classified TEST. A fixture
route is reachable by no client. `probeEndpoints()` now returns early for test
paths. Route harvesting is suppressed; **outbound client-call harvesting is
deliberately not**, because a test asserting against a real service is a genuine
caller and `API_DEPENDENCY` wants it.

### 5b. `TEST_DEPENDENCY` was shadowed by `PROTECTED_RELATIONSHIP`

Even with tests indexed, the trigger did not fire for the obvious cases:

```
Fix backend/src/services/accessService.js
  backend/tests/accessService.test.js  trigger=PROTECTED_RELATIONSHIP
```

`TRIGGER_PRIORITY` evaluated `PROTECTED_RELATIONSHIP` first. A test importing a
protected file satisfies that trigger, so it always won and `TEST_DEPENDENCY`
could never be the recorded reason for a test file — the one case it exists for.

The ordering is documented as most-specific-first, and `PROTECTED_RELATIONSHIP`
was simply in the wrong place. Reordered to:

```
TEST_DEPENDENCY → API_DEPENDENCY → STATE_DEPENDENCY → PROTECTED_RELATIONSHIP
→ SHARED_SERVICE → DIRECT_DEPENDENCY → RELEVANT_CONSUMER
```

This changes which justification is *recorded*, not which files are admitted. The
same class of bug already fixed once in Phase 8, where `SHARED_SERVICE` was
shadowed by `DIRECT_DEPENDENCY`.

## Steps 6–7 — regeneration and historical accounting

All 19 artifacts regenerated by the existing pipeline. `check-index` returns to
**20 MATCH, 3 WARN, 0 FAIL**, with the same three warnings as before (14 pages
without routes, 3 unresolved bare `.js` specifiers, 5 orphan components) — all
pre-existing.

| artifact | change |
| --- | --- |
| `FILE_ROLE_MAP` | 485 → 501 files; `TEST` 2 → 18 |
| `REVERSE_DEPENDENCY_MAP` | 501 file entries (+16 tests); import-edge entries 567 |
| `IMPORT_GRAPH` | 1,098 → 1,123 internal edges; 850 → 882 external; 272 → 292 dynamic; re-export 39 and unresolved 3 unchanged |
| `API_MAP` | `/probe` fixtures removed |
| all others | recomputed; no manual edits |

Records updated, preserving the original numbers rather than rewriting them:

- `CONFLICTS.md` **A24** — original reconciliation kept verbatim under a heading
  marking it superseded; correction appended with the new arithmetic and the
  reason. Severity raised **S3 → S2**.
- `codebase/CODEBASE_INTELLIGENCE.md` — count table corrected with the same note.
- `codebase/PHASE_7_CHANGES.md` — correction notice added at the reconciliation
  reference and at the count table.
- `codebase/PHASE_7_CHECKLIST.md` — correction added to the denominator note.
- `this file` — the full audit and rationale.

Every "485" in those documents is left in place and explicitly marked. Phase 7
was not wrong to report what its pipeline found; it was wrong to present that
number as complete.

## Steps 8–9 — routing revalidation and context efficiency

All ten tasks from `codebase/PHASE_8_SIMULATIONS.md` re-run, before and after.

> **Measurement error, caught and corrected.** The first attempt at this section
> used a paraphrased task set that was *not* the documented one — invented
> phrasings such as "Change TemplateCard design" and "Why is the site slow?".
> That produced a mean of 16.3, which did not match Phase 8's recorded 9.7, and
> the mismatch was initially written up as a Phase 8 defect. It was not. The
> documented S1–S10 set reproduces Phase 8 **exactly** (11, 14, 2, 16, 31, 13,
> 0, 0, 10, 0 → mean 9.7) when run against the committed Phase 8 code, which
> also reproduces its fingerprint `7e27afc36f0d` at 485 files. The tables below
> are the corrected measurement.

The "before" column is measured, not asserted: the four changed scripts were
checked out at `9ccf8e3a`, the index regenerated (485 files, fp `7e27afc36f0d`),
the same ten tasks re-run, then `079963ea` restored and the index regenerated
(501 files, fp `b7805860f03a`).

| # | task | before | after | Δ | tests before | tests after |
|---|---|---|---|---|---|---|
| S1 | Fix a payment verification bug | 11 | 11 | 0 | 0 | 0 |
| S2 | Fix WebM template preview performance | 14 | 14 | 0 | 0 | 0 |
| S3 | Edit TemplatePreview.tsx | 2 | 2 | 0 | 0 | 0 |
| S4 | Fix the auth middleware | 16 | 16 | 0 | 0 | **2** |
| S5 | Add an MCP tool | 31 | 32 | **+1** | 0 | **1** |
| S6 | Fix TemplateCard … WebM previews | 13 | 13 | 0 | 0 | 0 |
| S7 | Fix an XSS vulnerability … | 0 | 0 | 0 | 0 | 0 |
| S8 | Why is the site loading slowly? | 0 | 0 | 0 | 0 | 0 |
| S9 | Fix the `/activate-free` endpoint | 10 | 10 | 0 | 0 | 0 |
| S10 | xyzzy frobnicate widget | 0 | 0 | 0 | 0 | 0 |

| metric | before | after | delta |
| --- | --- | --- | --- |
| files, mean | 9.7 | 9.8 | +0.1 |
| files, largest | 31 | 32 | +1 |
| files, smallest | 0 | 0 | 0 |
| files, total | 97 | 98 | +1 |
| directly matched (non-expansion), total | 40 | 40 | 0 |
| expansion, total | 57 | 58 | +1 |
| **relevant** (direct + expansion via a concrete trigger) | 85 | 88 | **+3** |
| **irrelevant** (expansion solely via `RELEVANT_CONSUMER`) | 12 | 10 | **−2** |
| bundles containing a test file | 0 | 2 | +2 |
| `TEST_DEPENDENCY` fired | 0 | 0 | 0 |

**Efficiency verdict: no regression, and a net gain in precision.** Total context
moved by a single file (+1 of 98), but the *composition* improved: 3 more relevant
files, 2 fewer heuristic ones. S4 ("Fix the auth middleware") stayed at 16 files
while two `RELEVANT_CONSUMER` files were replaced by two real test files,
`backend/tests/broadcastAuth.test.js` and `backend/tests/accessService.test.js`,
arriving via `PROTECTED_RELATIONSHIP`. S5 grew by exactly one file. No bundle
lost relevant context and none grew beyond +1.

### `TEST_DEPENDENCY` fired zero times across all ten

This is the most important negative result in the closure, and it was not
anticipated. Across the ten documented tasks the trigger never fires, because
every one of them is phrased in concepts rather than files, so `namedSet` — the
set of files the task actually names — never contains a source file that a test
imports. Test files still enter the bundle, but through
`PROTECTED_RELATIONSHIP`.

The priority reorder is still correct and is still needed: it fixes the
explicit-file case, which is the case the trigger is written for.

```
Fix backend/src/services/healthService.js   →  TEST_DEPENDENCY → backend/tests/health.test.js
Fix backend/src/services/accessService.js   →  TEST_DEPENDENCY → backend/tests/accessService.test.js
```

### Two real defects this exposed

**(a) The obvious test for "Add an MCP tool" is the one that is missing.**
`mcp-server/tests/tools.test.ts` imports `mcp-server/src/tools/index.ts`. Neither
is in the S5 bundle, and `apiKey.test.ts` is admitted in its place — a test for
API keys, unrelated to MCP tools. Cause, measured:

- all 16 files under `mcp-server/src/tools/` score **exactly 80** — identical
  evidence, so their ranks 23–38 are a tie broken by file order;
- `bundle.mjs:43` defaults to `maxFiles: 25`, cutting at rank 25, which keeps
  only the first three tied tools files (`getAiPrompts`, `getAnimationCode`,
  `getComponent`);
- `index.ts` (`inbound: 6`) and `helpers.ts` (`inbound: 14`) — the two most
  connected files in the directory — lose purely on the tie-break;
- `tools.test.ts` scores **0**, so relevance cannot supply it; it can only arrive
  via `TEST_DEPENDENCY`, which needs its parent already in the bundle.

One alphabetical tie-break therefore decides whether a test is ever visible.
`relevance.mjs:363` claims `maxFiles` is "deliberately NOT a fixed cap" because
8.43 forbids an arbitrary universal maximum, but `buildBundle` passes a fixed 25.
**Not fixed here** — changing scoring or the cap is a ranking redesign, which
this closure was explicitly told not to do. Carried to Phase 9 as finding 5.

**(b) `PROTECTED_RELATIONSHIP` evidence stated the import backwards.** The
justification read `<test> is depended on by a protected file (<service>)`. The
code asks `inboundOf(area).includes(path)`, i.e. *this file imports the protected
one* — the exact reverse of the sentence. No source file imports a test, so the
claim was false in every bundle it appeared in, and expansion evidence is
worthless if it is merely true-sounding. Now reads
`<test> imports the protected file (<service>)`, matching the wording
`TEST_DEPENDENCY` already used. A new test asserts the direction against the
import graph itself rather than against a sample string.

`agent:test` 56 → 57.

## Important discoveries for Phase 9

1. **A reconciling count is not a complete count.** A24 proved 481 and 485 agreed
   and that agreement was treated as completeness. The gap was only visible by
   asking "what does the walker never look at?", not by checking the arithmetic.
   Any future audit should enumerate what is *excluded*, not only reconcile what
   is included.

2. **Shadowed triggers are invisible until they have data.** `TEST_DEPENDENCY`
   was implemented, unit-shaped, and promised by the contract. With only 2 test
   files indexed it could not fire, and with `PROTECTED_RELATIONSHIP` ahead of it
   in priority it still could not fire once the data arrived. Two independent
   causes for one dead trigger.

3. **A trigger can be correct and still never fire.** After fixing both causes,
   `TEST_DEPENDENCY` fired **0 / 10** on the documented suite. The trigger only
   activates when the task names a file, and ten concept-level tasks never do.
   "It is tested" is not the same as "the test reached the bundle"; a trigger
   needs an integration test on a realistic task, not only a unit test on a
   hand-picked one.

4. **Adding data to an index can create new false positives.** Indexing the CORS
   tests immediately published `/probe` as real API surface. Widening discovery
   is not automatically safe; it needs the same scrutiny as any new source.

5. **A score tie broken by file order can hide a test suite.** Sixteen MCP tool
   files all score 80; the 25-file cap keeps three of them alphabetically, and
   the test for the module that matters is excluded with them. Candidate work:
   tie-break on connectivity (`inbound`) before file order, and let the caller
   pass a budget rather than a hardcoded 25, so 8.43's "no arbitrary universal
   maximum" is actually true.

6. **Loose trigger guards admit unrelated files.** `PROTECTED_RELATIONSHIP` only
   checks that `namedSet` is non-empty; it does not check that the protected file
   the test imports is one the task named. That is how `apiKey.test.ts` reached
   an MCP-tools bundle. Tightening it is an expansion-behaviour change, so it is
   out of scope for this closure.

7. **Re-verify any figure you did not measure yourself.** The one defect in this
   closure that was *not* pre-existing was introduced by me: a paraphrased task
   set produced a plausible-looking 16.3, and the gap against the recorded 9.7
   was initially misread as a Phase 8 defect rather than as a measurement
   mistake. Re-run the documented set before comparing anything.