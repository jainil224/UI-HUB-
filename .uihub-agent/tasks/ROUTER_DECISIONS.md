# ROUTER DECISIONS — PHASE 9

**Owner:** Phase 9 — Router Precision, Context Optimization & Retrieval Quality
**Status:** CANONICAL — every accepted bundle-size change must have an entry here.

> `ROUTER_BENCHMARK.md` §5 makes an unrecorded size change a forbidden regression.
> This file is where a size change becomes legitimate. Each entry states what was
> decided, why, what it cost, and what would reverse it.

---

## D-01 — Remove the universal `maxFiles = 25`

**Decided.** Replace the hard 25 with an evidence-derived budget in a new module,
`scripts/lib/context-size.mjs`.

**Rationale.** The documented design said there should be no arbitrary universal
cap; the implementation had one. A database migration and a button colour change
were both given 25 files. The cap also made it impossible to tell "the task needs
35 files" apart from "the cap is 35".

**Policy.** Relevance budget 25 baseline, raised to at most 40 by named-entity
count. Expansion budget separate (1 step × 10). Safety ceiling 60 as a backstop.

**Explicit `--max-files` is honoured.** When a caller passes a number, the budget is
that number and growth is disabled — the evidence must not overrule a decision. The
original reason for the cap (a documented design requirement) is gone; the caller's
number is now the documented requirement.

**Cost.** Under the default policy S5 grows 33 → 42 files. That is the intended
consequence of removing the cap, not a regression.

**Reverses if.** The default-policy ceiling fires routinely, which would mean the
derived budget is too loose.

---

## D-02 — Connectivity breaks score ties; it never rejects

**Decided.** Add `inbound + outbound` import-edge degree as a deterministic
tie-break, after score and before path ordering.

**Rationale.** Equal scores are legitimate — two files reached by the same evidence
signals genuinely tie. With no secondary key the sort fell through to the path
string, so a file imported by six modules could lose to an alphabetical neighbour.

**Why a tie-break and not a signal.** Adding connectivity to the score would let a
well-connected but irrelevant file outrank a directly named one. Ordering within a
tie cannot change *which* files qualify, only which of two equally-qualified files
comes first. That is the property the tests assert.

**Cost.** None measurable. S5 grows by one file (`helpers.ts`, degree 18) and the
bundle remains schema-valid.

**Reverses if.** A tie-break ever rejects a file. `connectivity reorders, it never
rejects` is the standing guard.

---

## D-03 — Protection is a caution marker, not relevance

**Decided.** `PROTECTED_RELATIONSHIP` requires a stated connection to the task:
feature-scope intersection, **or** a category that declares the path protected
**and** a surface the task actually implicated.

**Rationale.** The trigger previously asked only "what does protected code depend
on?", which is satisfiable from any protected file at all. "Fix an XSS
vulnerability in the comment renderer" — a task naming nothing — expanded to
`paymentController.js` and `paymentRoutes.js`. Ten files, each with a
technically-true justification, none related to the task.

**Surface from path prefixes, not roles.** `ROLE_SURFACE` maps `MIDDLEWARE` to
`BACKEND` even for `mcp-server/src/middleware/auth.ts`, so role-based surface
judgement called MCP files backend code and let cross-subsystem leakage through.
`PATH_SURFACE` is the only unambiguous statement of which tree a file is in.

**`SCRIPT` role excluded.** Indexed maintenance scripts build and seed the
repository; they do not participate in a feature. Four payment-task scripts were
removed from S1 by this rule.

**Known cost.** See `runtime/CONTEXT_QUALITY_REPORT.md` §3. Four clearly-wrong files
left S1 and one arguably-wrong file took a freed slot; the aggregate irrelevant
count rose by one because the metric counts files rather than wrongness.

**Reverses if.** A task that genuinely needs an unconnected protected file. The
mitigation already exists: protection still surfaces as a caution marker in
`protectedAreas` even when nothing is loaded, so the information reaches the reader
without the file entering the context.

---

## D-04 — Bare filenames and extensionless paths resolve; ambiguity does not

**Decided.** `filePathTokens` recognises `accessService.js` and
`backend/src/services/healthService`. `resolveFilePath` infers a missing extension,
strips an unused one, and matches a bare filename **only when exactly one indexed
file carries that name**.

**Rationale.** `Update accessService.js` returned zero files for a real, indexed,
194-line service. Two tokenizers each dropped it: `identifierTokens` requires a
leading capital so lower-camelCase is invisible, and `filePathTokens` required both
a `/` and an extension so a bare filename is not a path.

**Index-gated, therefore safe to widen.** The router discards anything
`resolveFilePath` cannot match against a real indexed file, so widening the pattern
cannot manufacture a fast path. Version strings and `package.json` are excluded by
requiring a source extension.

**Why ambiguity refuses rather than picks.** Two indexed files sharing a basename
resolve to nothing. Guessing would be invisible in a bundle and wrong in an editor;
an empty result with `unresolvedTargets` explaining why is strictly better.

**Reverses if.** A genuine ambiguity becomes common enough that refusing is worse
than asking. That is a question for Phase 10, not something to guess at now.

---

## D-05 — Conceptual tasks discover tests; named-file tasks do not

**Decided.** `TEST_DEPENDENCY` justifies a test against the **named** paths, or —
**only when the task named nothing** — against the paths relevance independently
selected.

**Rationale.** Every canonical bundle recorded zero test admissions: the trigger
only worked when the task literally named a file, so the behaviour TASK 9.10 asks
about was never exercised anywhere. For a conceptual task the relevance selection is
the only evidence available, and the brief permits implementation "with strong
evidence". The evidence is strong — a real import edge.

**No filename matching.** `*auth*` is prohibited by the brief and absent from the
implementation. The tests assert the absence structurally: an admitted test must
import a file already in the bundle, read from `IMPORT_GRAPH.json`.

**No chaining.** A test is never a subject, so tests cannot recruit tests. This is
what stops a conceptual bundle from drifting toward "all tests".

**Scoped deliberately.** When a task names its files, the named file is the subject.
Widening to relevance-selected paths there would make the named-file fast path stop
being about what was asked.

**Reverses if.** Conceptual bundles grow test-heavy. The three measured admissions
for `Fix authentication middleware` are the reference point.

---

## D-06 — A named target that does not exist caps confidence

**Decided.** Record unresolved path and route tokens as `unresolvedTargets` and cap
confidence at MEDIUM (or LOW if already lower).

**Rationale.** `Fix frontend/src/components/templates/TemplateCard.tsx` returned
**50 files at HIGH confidence**. The token was extracted, failed to resolve, and was
discarded without comment; classification fell through to the free word "template",
legitimately resolved `TEMPLATE` + `COMPONENT` from real files, and nine resolved
entities crossed the documented HIGH threshold. The task's strongest signal had gone
unmatched and the confidence was computed from its weakest.

**The category evidence is kept.** Capping is not discarding. The surrounding
evidence may genuinely be relevant; it just cannot be called certain.

**Structural near-misses, not fuzzy.** Candidates come from the same directory and
the same leaf name elsewhere in the tree. Edit-distance guessing would produce
plausible-looking nonsense.

**The guard test matters most.** The cap must not fire on ordinary tasks, or every
bundle would be MEDIUM and the signal worthless. `a missing target is discounted,
but a real one is not` asserts exactly that against four real tasks.

**Reverses if.** Unresolved targets become common enough that capping hides real
ambiguity. That would be visible as a cluster of MEDIUM bundles and is a Phase 10
question.

---

## D-07 — Deduplicate candidates against named paths

**Decided.** `candidatesFor` runs one pass over a `Set`, and `expand` filters
against files already held.

**Rationale.** A file reachable by `DIRECT_DEPENDENCY`, `SHARED_SERVICE` **and**
`PROTECTED_RELATIONSHIP` must appear once. TASK 9.19 requires this explicitly.
Without a set, the same path appeared up to three times in a bundle.

**Also fixed.** `SHARED_SERVICE` was unreachable because iterating trigger-major let
`DIRECT_DEPENDENCY` — a strict superset of its question — claim every shared service
first. Trigger selection is now most-specific-first, which is what makes the more
informative trigger recordable at all.

**Reverses if.** A trigger stops being recordable. The ordering is load-bearing, not
cosmetic; `TRIGGER_PRIORITY` is documented as such.

---

## OPEN — Phase 10: should relevance-admitted files be expansion subjects?

**Not decided in Phase 9. Deliberately deferred.**

S1 coverage is 1/2: `backend/src/middleware/auth.js` is ground-truth-relevant and
absent. Verified cause: it is one inbound hop from `paymentRoutes.js`, but
`paymentRoutes.js` was admitted by *relevance*, not named by the router, so it is
not an expansion subject. Only
`frontend/src/components/ui/payment-transaction-button.tsx` was named.

The fix is one line — treat relevance-admitted paths as subjects — and it was not
applied because:

- every trigger would then fire from relevance-selected files, so expansion would
  grow roughly with the relevance budget;
- the phase objective is explicitly "without making it blindly restrictive";
- it would trade a real precision gain for unbounded context growth on the last day
  of the phase.

**What Phase 10 needs.** A per-trigger answer, not a global one. `TEST_DEPENDENCY`
already solved this case for conceptual tasks (D-05): relevance-selected subjects
are safe when the evidence is a *specific* edge, not when it is mere proximity. The
same test applies here — `DIRECT_DEPENDENCY` from a relevance-admitted file is a real
edge and probably safe; `RELEVANT_CONSUMER` from one is closer to "nearby", which the
category model already forbids as a justification.

**Do not resolve this by widening all subjects.** Measure per trigger.

---

END — ROUTER DECISIONS