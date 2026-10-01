# CONTEXT QUALITY REPORT — PHASE 9

**Phase:** 9 — Router Precision, Context Optimization & Retrieval Quality
**Index:** 501 files, `FRESH`, fingerprint `b7805860f03affe05b0f987ded7b4816f715af0ae3144b12a74f686635bd21ed`
**Suites:** `npm run agent:test` 98 / 98 pass · `npm run agent:index:check` 19 / 19 fresh, drift 0
**Reproduce:** `node "%TEMP%\opencode\p9-bench.mjs"` — writes outside the repository.

---

## 1. Headline

| Metric | Before (Phase 9 start) | After (pinned 25 / 1 step) | After (default policy) |
|---|---|---|---|
| Bundle sizes S1–S10 | 11, 14, 2, 16, 32, 13, 0, 0, 10, 0 | 9, 14, 2, 16, 33, 13, 0, 0, 10, 0 | 9, 14, 2, 16, 42, 13, 0, 0, 10, 0 |
| Mean | 9.8 | 9.7 | 10.6 |
| Median | — | 9.5 | — |
| Largest | 32 (S5) | 33 (S5) | 42 (S5) |
| Smallest | 0 | 0 | 0 |
| Total | 98 | 97 | 106 |
| Relevant | 88 | 86 | 95 |
| Irrelevant | 10 | 11 | 11 |
| Precision | 89.8% | 88.7% | 89.6% |
| Zero-file bundles | 3 (S7, S8, S10) | 3 (S7, S8, S10) | 3 |
| Schema valid | 10 / 10 | 10 / 10 | 10 / 10 |
| `TEST_DEPENDENCY` fired | 0 | 0 | 0 |

**The honest summary is that the aggregate numbers barely moved, and the phase was
not about moving them.** Six defects were fixed that the aggregate is blind to —
a developer naming a real file got zero files, a task naming a file that does not
exist got fifty files at HIGH confidence, and a security task pulled in payment
code. None of those show up in a mean. A benchmark that only tracked size would
have called this phase a null result, which is the correct reading of the *numbers*
and a misleading one of the *work*.

Where the numbers did move, both directions are stated. Precision fell 1.1 points
(pinned) and irrelevant rose by one file; that is the cost of the D1 work, analysed
in §3.

---

## 2. Per-task detail (pinned budget: `maxFiles: 25`, `expandSteps: 1`)

| ID | files | initial | expanded | relevant | irrelevant | direct | dep | test | prot | precision | coverage (lower bound) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| S1 | 9 | 1 | 8 | 6 | 3 | 1 | 1 | 0 | 4 | 66.7% | 1/2 = 50% |
| S2 | 14 | 4 | 10 | 12 | 2 | 4 | 4 | 0 | 4 | 85.7% | 1/1 = 100% |
| S3 | 2 | 1 | 1 | 2 | 0 | 1 | 1 | 0 | 0 | 100.0% | 1/1 = 100% |
| S4 | 16 | 6 | 10 | 14 | 2 | 6 | 1 | 0 | 7 | 87.5% | 1/1 = 100% |
| S5 | 33 | 25 | 8 | 31 | 2 | 25 | 4 | 0 | 2 | 93.9% | 2/2 = 100% |
| S6 | 13 | 3 | 10 | 11 | 2 | 3 | 4 | 0 | 4 | 84.6% | n/a — no ground truth |
| S7 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | n/a — no ground truth |
| S8 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | n/a — no ground truth |
| S9 | 10 | 0 | 10 | 10 | 0 | 0 | 8 | 0 | 1 | 100.0% | 1/1 = 100% |
| S10 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | — | n/a — no ground truth |

Aggregate: mean 9.7 · median 9.5 · total 97 · relevant 86 · irrelevant 11 ·
**precision 88.7%** · test files 0 · protected-relationship admissions 22.

**Metric definitions.** *Relevant* = every selected file except those admitted on
`RELEVANT_CONSUMER` alone: those import something the task named, but nothing the
task named depends on them. Useful context, not required by the task. Read from
`addedByExpansion` / `expansionTrigger` on the emitted bundle, never asserted by
hand.

**Coverage is a lower bound** and must not be read as a miss rate. The ground-truth
column in `ROUTER_BENCHMARK.md` §2 records the file a human already knew about, not
an exhaustive set; TASK 9.30 prohibits claiming completeness the ground truth
cannot support. S6–S8 and S10 have no ground truth at all and are excluded from the
coverage figure rather than counted as failures.

---

## 3. The one regression, and why it is acceptable

S1 shrank 11 → 9 and irrelevant rose 10 → 11 overall.

D1 removed four files from S1 at larger expansion budgets — `payment-task-data.js`,
`payment-task-setup.js` and two sibling scripts under `.uihub-agent/scripts/`. They
were admitted as `PROTECTED_RELATIONSHIP` because they sit next to payment code, and
they are genuine `SCRIPT`-role maintenance tooling: they build and seed the
repository, they do not participate in the payment feature. Removing them is
correct.

The four freed expansion slots were then filled by `frontend/src/utils/prefetchUtils.ts`,
which the harness classifies as irrelevant. That file was *already eligible* before
D1 — expansion admits the most strongly-justified candidates first, and the scripts
had outranked it on justification count. The change did not make an ineligible file
eligible; it changed which eligible file won a freed slot.

So the aggregate moved from "3 clearly wrong files" to "1 arguably-wrong file", and
the recorded number of wrong files rose by one because the metric counts files, not
wrongness. **This is a known limitation of the harness's precision proxy, and it is
reported here rather than smoothed away.**

### The S1 coverage gap (1/2)

`backend/src/middleware/auth.js` is recorded as ground-truth-relevant to S1 and is
**not** in the bundle. Verified cause: `auth.js` is one inbound hop from
`paymentRoutes.js`, but `paymentRoutes.js` was admitted by *relevance*, not by the
router naming it — the router's only named path for "Fix a payment verification bug"
is `frontend/src/components/ui/payment-transaction-button.tsx`. Expansion draws its
candidates from the graph around **named** paths, so a relevance-admitted file is not
a subject.

This is the same subject-set question the D4 work answered for tests. It was
deliberately **not** widened here: doing so would make every relevance-admitted file
an expansion subject, and expansion would grow roughly with the relevance budget.
Given that the phase objective is explicitly "without making it blindly
restrictive", trading a real precision gain for unbounded context growth on the last
day of the phase is the wrong trade. **Recorded as an open decision for Phase 10** in
`tasks/ROUTER_DECISIONS.md`.

---

## 4. What the aggregate cannot see — six fixed defects

Each is documented in full in `tasks/ROUTER_REGRESSION.md` with the test that fails
if the behaviour returns. Summarised here because this is the actual result.

| ID | Defect | Before | After |
|---|---|---|---|
| R1 | Score ties decided alphabetically | A connected file could lose its place to a path-string neighbour | Deterministic connectivity tie-break, citing real graph counts |
| R2 | Hard `maxFiles = 25` for every task | A migration task silently got the same 25 files as a button tweak | Evidence-derived budget, explicit override honoured, ceiling reports what it dropped |
| R3 | `Update accessService.js` returned **zero files** | A real, indexed, 194-line service was invisible to the router | Bare filenames and extensionless paths resolve, index-gated, refusing ambiguity |
| R4 | `PROTECTED_RELATIONSHIP` treated protection as relevance | An XSS task in the comment renderer expanded to paymentController and paymentRoutes | Feature-scope + surface + role guard; every admission states its connection |
| R5 | `TEST_DEPENDENCY` never fired for conceptual tasks | 0 of 98 across the whole benchmark | Import-edge discovery for tasks that name nothing |
| R6 | A **nonexistent** file returned HIGH confidence | `TemplateCard.tsx` → 50 files, HIGH | Reported as `unresolvedTargets`; confidence capped and the reason stated |

Two of these (R5, R6) were not in the Phase 8 brief. They were found by Phase 9
probes: R5 by noticing the benchmark recorded zero test admissions, R6 by
re-running an `agent.md` example against the repository and finding the file
absent. **An example in a specification is a hypothesis, not a fact.**

---

## 5. Task 9.9 — test dependency, the named-file scenarios

Three of the four example spellings were broken at the token layer, not the ranking
layer:

| Task text | Before | After |
|---|---|---|
| `Fix backend/src/services/healthService.js` | 4 files, test found | unchanged — this spelling always worked |
| `Update accessService.js` | **0 files** | 11 files, `backend/tests/accessService.test.js` admitted |
| `Modify TemplatePreview.tsx` | 2 files | unchanged (already resolved as a component) |
| `Change the templates service` | 18 files, no test | unchanged — conceptual, handled by R5 |

Verified against graph relationships, not a hardcoded string: the fixture is derived
from the index (a `backend/src/services/*` file whose own test imports it), and the
assertion is that a real inbound edge exists.

The refusal case is tested explicitly: where two indexed files share a basename,
every spelling resolves to **nothing**. Guessing there would be invisible in a
bundle and wrong in an editor.

---

## 6. Task 9.10 — conceptual test discovery, the verdict

The brief said implement only if strong evidence exists. It does, and the
implementation rests on it: a real import edge from a test to a file the task
selected.

```
Fix authentication middleware
  → backend/src/middleware/auth.js          (relevance)
  → backend/tests/broadcastAuth.test.js     (TEST_DEPENDENCY: imports auth.js)
  → backend/tests/accessService.test.js    (TEST_DEPENDENCY: imports accessService.js)
  → backend/tests/emailTestSecret.test.js  (TEST_DEPENDENCY: imports userRoutes.js)
```

Three properties are enforced, and each is the failure mode the design has:

1. **No filename matching.** The tests contain no pattern comparison at all. They
   assert that the admitted test imports a file already in the bundle, read from
   `IMPORT_GRAPH.json`. This is the `*auth*` approach the brief forbids, stated as
   an absence of evidence rather than a promise.
2. **No chaining.** A test is never a subject, so a bundle of tests cannot drag in
   more tests. Verified on the real three-test result.
3. **Scoped to conceptual tasks only.** When a task names its own files, the named
   file is the subject; widening to relevance-selected paths there would make the
   named-file fast path stop being about what was asked.

The benchmark still records **0** `TEST_DEPENDENCY` admissions across S1–S10, and
that is correct rather than disappointing: S1–S10 name features and files, so they
are not conceptual tasks, so R5 does not apply. The discovery is proven by
`X9 Fix authentication middleware` and by five tests.

---

## 7. Context-size policy (TASK 9.6 – 9.8)

**No universal cap.** The hard 25 is gone; the budget is derived from evidence and
an explicit `--max-files` is honoured as a decision.

- Relevance budget: 25 baseline, raised to at most 40 by named-entity count.
- Expansion budget: separate, 1 step × 10 by default.
- Safety ceiling: 60, a backstop that **names the paths it dropped** rather than
  truncating silently.
- Default budgets observed: S1=35 S2=35 S3=11 S4=40 S5=35 S6=35 S7=40 S8=25 S9=30 S10=25.
- The ceiling **never fires** on any canonical or default-policy bundle.

Every bundle now carries a `sizePolicy` object stating its budget, whether the
budget was explicit, the evidence behind it, and anything the ceiling dropped.

---

## 8. Reproducing this report

```
npm run agent:index:check     # must report FRESH, 19/19, drift=0
npm run agent:test            # 98/98
node "%TEMP%\opencode\p9-bench.mjs"
```

The harness writes to the OS temp directory. An earlier version wrote
`p9-bench.json` (577 KB) to the repository root; that artifact was deleted and is
not part of the change.

---

END — CONTEXT QUALITY REPORT