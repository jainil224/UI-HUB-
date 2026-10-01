# ROUTER REGRESSION

**Owner:** Phase 9 — Router Precision, Context Optimization & Retrieval Quality
**Task:** TASK 9.40 (record regression cases), TASK 9.41 (additional precision benchmarks)
**Status:** CANONICAL — each case below is enforced by a test.

> A defect that is described in prose is a defect that returns. Every entry here
> states the shape of the failure, the reason it was possible, and the test that
> now fails if the behaviour comes back.

---

## Ground rules

1. **The benchmark measures; this file explains.** Numeric movement is recorded in
   `ROUTER_BENCHMARK.md` and `runtime/CONTEXT_QUALITY_REPORT.md`. This file
   records *why* a behaviour changed and what would count as its return.
2. **Every entry names a failing test.** An entry with no test is a wish.
3. **Preserve the failure shape, not a file list.** Where a defect depended on
   particular files, the test asserts the property and derives its fixtures from
   the index, so renaming a file does not silently unprove the case.
4. **A new defect found during Phase 9 is recorded here too**, whether or not the
   Phase 8 brief named it. Two of these were found by Phase 9 probes.

---

## R1 — Score ties decided alphabetically

**Shape.** Two files with equal relevance score were ordered by path, so a highly
connected file lost its place to an alphabetical neighbour.

**Why it was possible.** The relevance score is the sum of evidence signals. Two
files reached by the same signals legitimately tie, and nothing in the comparator
distinguished them, so the sort fell through to its final key — the path string.

**Fix.** A deterministic connectivity tie-break: `inbound + outbound` import-edge
degree, read from `IMPORT_GRAPH.json`, with the actual importer and import counts
cited in the reason. Connectivity *reorders*; it never rejects, so widening it can
add files but never remove an eligible one.

**Proves.** `a score tie is broken by connectivity, never by alphabetical order
alone`, `the tie-break is actually exercised`, `the most connected files of the
leading tie group reach the bundle`, `a connectivity tie-break is recorded as a
reason when it changes selection`.

---

## R2 — Hard `maxFiles = 25` regardless of the task

**Shape.** Every bundle was capped at 25 files, so a task genuinely needing more
context silently got less, and the documented "no arbitrary universal cap" was not
what shipped.

**Why it was possible.** The cap was expressed as a literal default in the ranking
entry point rather than as a policy derived from the evidence available.

**Fix.** `lib/context-size.mjs` derives the budget from the task: a relevance
budget of 25 baseline, raised to at most 40 by named-entity count, and never
raised when `--max-files` is passed explicitly — an explicit number is a decision
and the evidence must not overrule it. Expansion budget is separate (1 step × 10
by default). A safety ceiling of 60 exists as a backstop and, when it fires, drops
paths *with names* rather than truncating silently.

**Proves.** `context.test.mjs`: budget derivation, explicit-override precedence,
ceiling reporting, `sizePolicy` shape and schema validity.

**Benchmark note.** Mean 9.8 → 9.7 and S5 32 → 33 under the pinned budget; under
the default policy S5 reaches 42 and the ceiling never fires. Recorded in the
quality report rather than presented as a win: the point was to remove the
universal cap, not to shrink every bundle.

---

## R3 — `TEST_DEPENDENCY` could not fire for a named service

**Shape.** `Update accessService.js` returned **zero files**. The developer named a
real, indexed, 194-line service and got nothing.

**Why it was possible.** Two tokenizers between the task and the index each dropped
it. `identifierTokens` matches `\b[A-Z][A-Za-z0-9]*\b`, so a lower-camelCase name
was never treated as an identifier. `filePathTokens` required at least one `/` *and*
a trailing extension, so a bare filename was not a path either. The token survived
neither filter, so `resolveServices` was never asked.

**Fix.** `filePathTokens` now also recognises a bare filename with a source
extension (`accessService.js`) and a path written without one
(`backend/src/services/healthService`). Both are index-gated — the router discards
anything `resolveFilePath` cannot match against a real indexed file — so widening
the pattern cannot manufacture a fast path. `resolveFilePath` infers a missing
extension, strips an unused one, and matches a bare filename **only when exactly
one indexed file carries that name**.

**Proves.** `a bare filename resolves the same file as its full path`, `a path
written without its extension resolves to that path`, `TEST_DEPENDENCY admits the
test of a file the task named`, `extension inference refuses to guess when two
files share a name`, `filePathTokens keeps prose from being read as a path`.

**The refusal is the important half.** Two indexed files sharing a basename resolve
to *nothing* rather than to one of them. Guessing here would be invisible in a
bundle and wrong in an editor.

---

## R4 — `PROTECTED_RELATIONSHIP` treated protection as relevance

**Shape.** `Fix an XSS vulnerability in the comment renderer` expanded to
`paymentController.js` and `paymentRoutes.js` — ten files, each with a
technically-true justification and no relation to the task.

**Why it was possible.** The trigger asked "what does protected code depend on?"
with no requirement that the task have connected to the protected code first. It
was therefore satisfiable from any protected file at all, and a task that named
nothing could still satisfy it.

**Fix.** Protection is a **caution marker, not relevance**. A protected path is
loaded only when its feature scope intersects the task's, or when the task resolved
a category that declares it protected *and* it lives in a surface the task actually
implicated. Surface membership is read from path prefixes, not from the role table —
`ROLE_SURFACE` maps `MIDDLEWARE` to `BACKEND` even for `mcp-server/src/middleware/
auth.ts`, which is how MCP files were being called backend code. Indexed `SCRIPT`
maintenance files are excluded outright. Every surviving admission ends with
`which is connected to this task`, so a reader can see the connection.

**Proves.** `protection alone never admits a file: every relationship names its
connection`, `a protected relationship never reaches into a surface the task never
implicated`, `repository maintenance tooling is never application context`, `the
guard actually removes something`, `protection is still reported as a caution
marker even when nothing is loaded`.

---

## R5 — `TEST_DEPENDENCY` never fired for conceptual tasks

**Shape.** Every one of the ten canonical bundles recorded zero `TEST_DEPENDENCY`
admissions. The trigger only worked when the task literally named a file, so the
feature the Phase 8 brief asked about was never actually exercised.

**Why it was possible.** `TEST_DEPENDENCY` justified a test against `named` only —
the paths the *router* resolved. A conceptual task names no file, so the subject
set was empty and the trigger was structurally unreachable.

**Fix.** `testSubjectsFor` allows a second subject set, used **only when the task
named nothing**: the paths the relevance engine independently selected. That is the
only evidence a conceptual task has, and 9.10 asks for strong evidence or nothing.
The evidence *is* strong — a real import edge from a test to a file this task
selected — and no filename is ever pattern-matched, which is the `*auth*` approach
9.10 forbids. A test is never evidence for another test, so discovery cannot chain.

**Proves.** `a conceptual task discovers the tests of the files it selected`, `every
discovered test earns its place through a real import edge`, `test discovery never
chains`, `a task that names its own files does not also use relevance-selected
subjects`.

**Result.** `Fix authentication middleware` discovers `broadcastAuth.test.js`,
`accessService.test.js` and `emailTestSecret.test.js`. Each cites the import edge
that admitted it.

---

## R6 — A named file that does not exist returned HIGH confidence  *(found in Phase 9)*

**Shape.** `Fix frontend/src/components/templates/TemplateCard.tsx` produced **50
files at HIGH confidence**. `TemplateCard.tsx` does not exist in this repository.

**Why it was possible.** `filePathTokens` extracted the path and `resolveFilePath`
returned null, but the token was then discarded without comment. Classification
fell through to the free word "template", which legitimately resolved `TEMPLATE` +
`COMPONENT` from real files — and nine resolved entities are the documented
threshold for HIGH. The task's strongest signal had gone unmatched, and the
confidence computed from its weakest one.

**Fix.** Unresolved path and route tokens are recorded as `unresolvedTargets`,
each with what the repository actually holds nearby (same directory, same leaf name
elsewhere — structural, not fuzzy edit distance). Any unresolved target caps
confidence at MEDIUM, or LOW if it was already below HIGH, and `confidenceWhy`
states which target is missing. The category evidence is kept rather than
discarded: it may still be relevant, it just cannot be called certain.

**Proves.** `a path that does not exist is reported, not silently discarded`, `a
path that does not exist cannot produce HIGH confidence` *(and its assertion on
`classify`)*, `a route that does not exist is reported, not silently discarded`, `a
missing target is discounted, but a real one is not`.

**The last test matters most.** The cap must not fire on ordinary tasks, or every
bundle would be MEDIUM and the signal would be worthless.

---

## R7 — Backticks around a route or path hid the entity  *(fixed in A5)*

**Shape.** `Fix the `/activate-free` endpoint` resolved UNKNOWN with zero files
whereas `Fix the /activate-free endpoint` resolved API with ten.

**Why it was possible.** `routeTokens` required a boundary of `(?:^|\s)`, so a
backtick, a double quote or an open paren each defeated it. Backticks are how
developers write these in every real task.

**Fix.** The route boundary is `(?:^|[^\w/.\-])`, so a route may start directly
after any delimiter. Only the captured route is returned — the previous version
returned the whole match including the boundary character and relied on one caller
to trim it, which is one refactor away from leaking punctuation into a lookup.

**Proves.** `routeTokens returns the route itself, never the character before it`,
`a quoted route resolves exactly like a plain one`, `a decorated route produces a
context, not an empty bundle`, `file paths in backticks still resolve`.

---

## R8 — The `handlers` field was dropped from public route entities  *(found in Phase 9)*

**Shape.** `API_DEPENDENCY` could never fire. Expansion read `r.endpoint.handlers`
off the public route entity, but the entity mapping drops `endpoint`, so the lookup
was always `undefined`.

**Why it was possible.** The public shape and the internal shape diverged, and the
consumer was written against the internal one.

**Fix.** `handlers` is now an explicit field on the public entity.

**Proves.** `every bundle lists the commands that must pass` and the trigger tests
in `context.test.mjs` assert `API_DEPENDENCY` is reachable.

---

## Standing forbidden regressions

Carried from `ROUTER_BENCHMARK.md` §5 and re-asserted in the test suite:

| # | Forbidden | Enforced by |
|---|---|---|
| F1 | `S3` stops returning the named file first | `naming a real file takes the fast path` |
| F2 | `S6` / `X17` invents a file that does not exist | `a path that does not exist cannot produce HIGH confidence` |
| F3 | `S7` / `S8` / `S10` returns a non-empty bundle, or empty without explanation | `a generic word that resolves nothing is reported as such` |
| F4 | `S8` / `S10` claims HIGH or MEDIUM confidence | same |
| F5 | A zero-file bundle with `emptyReason: null` | `context.test.mjs` |
| F6 | Any selected file lacking a recorded reason | `every bundle lists the commands that must pass` |
| F7 | Any expansion file lacking its authorising trigger | `the fast path still retrieves the four documented relationships` |
| F8 | An unrelated protected file entering a bundle merely because it is protected | R4 tests |
| F9 | A bundle size change with no decision recorded | `ROUTER_DECISIONS.md` |

---

END — ROUTER REGRESSION