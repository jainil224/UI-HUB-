# UI HUB AGENT — PHASE 9

## Router Precision, Context Optimization & Retrieval Quality

**Phase:** 9 of 10
**Phase Name:** Router Precision, Context Optimization & Retrieval Quality
**Status:** COMPLETE — all 47 tasks implemented. See `.uihub-agent/runtime/CONTEXT_QUALITY_REPORT.md`.

---

# 1. PHASE OBJECTIVE

Phase 8 successfully built the task router and context loader.

The router now turns a natural-language task into:

```text
Task
↓
Classification
↓
Relevant indexes
↓
Candidate files
↓
Context bundle
```

However, Phase 8 identified several real limitations:

1. A score tie can cause highly connected files to lose to alphabetical ordering.
2. The code has a hard `maxFiles = 25` behavior even though the documented design says there should not be an arbitrary universal cap.
3. `TEST_DEPENDENCY` works for explicit-file tasks but does not participate meaningfully in conceptual tasks.
4. `PROTECTED_RELATIONSHIP` can admit unrelated files when its guard is too broad.

These findings are recorded in the Phase 8 completion report and should be addressed before building durable memory on top of the router.

The objective of Phase 9 is therefore:

> **Make the router more precise, explainable, and context-efficient without making it blindly restrictive.**

---

# 2. CORE PRINCIPLE

Optimize for:

```text
MINIMUM NECESSARY CONTEXT
```

not:

```text
MINIMUM POSSIBLE CONTEXT
```

The router should include enough context to perform the task correctly.

It should not include unrelated files merely because they score similarly.

---

# 3. IMPORTANT PHASE BOUNDARY

Phase 9 IS about:

* Context ranking
* Tie-breaking
* Context-size policy
* Test dependency retrieval
* Protected relationship precision
* Retrieval quality
* Context relevance
* Explainability
* Router integration tests
* Context efficiency
* Regression prevention

Phase 9 is NOT about:

* Production deployment
* Vercel
* Render
* Cloudflare
* MongoDB migrations
* Payment redesign
* Authentication redesign
* Full theme refactor
* Fixing the 61 frontend typecheck errors
* Building the durable memory system yet
* Large application refactoring

Durable agent memory is Phase 10.

---

# 4. BASELINE

Before making changes, record the Phase 8 canonical baseline.

```text
Repository index:
501 current files
```

IMPORTANT:

Phase 8 documented the pre-correction index as:

```text
485 files
```

and the current corrected index as:

```text
501 files
```

Do NOT silently replace historical counts.

Record both where required.

Canonical S1–S10 context results:

```text
11
14
2
16
31
13
0
0
10
0
```

Baseline:

```text
Mean: 9.8
Largest: 32
Smallest: 0
Total: 98
Relevant: 88
Irrelevant: 10
```

Use the documented S1–S10 tasks only.

Do NOT invent a different benchmark set.

---

# 5. TASK 9.1 — LOCK THE CANONICAL BENCHMARK

Create a canonical benchmark definition:

```text
.uihub-agent/tasks/
└── ROUTER_BENCHMARK.md
```

Include the official S1–S10 task set.

Each benchmark must record:

```text
Task ID
Task text
Expected category
Expected surface
Expected target area
Expected relevant files where known
```

This becomes the permanent router regression benchmark.

---

# 6. TASK 9.2 — FIX TIE-BREAKING

Phase 8 found that all 16 files under the MCP tools directory can receive the same relevance score.

Alphabetical ordering then determines which files enter the bundle.

This can exclude highly connected files.

The router must instead prefer:

```text
Direct relevance
>
Feature relevance
>
Dependency relationship
>
Reverse dependency/connectivity
>
Protected relationship when directly relevant
>
Test relationship
>
File ordering
```

Do NOT use alphabetical order as the primary tie-break.

---

# 7. TASK 9.3 — CONNECTIVITY-AWARE TIE BREAK

When two files have equal relevance scores:

Prefer the file with stronger verified connectivity.

Possible signals:

```text
Inbound imports
Outbound imports
Direct consumers
Direct dependencies
Route connections
Feature connections
Test connections
```

Do not invent a fake score.

Use the actual Phase 7 dependency graph.

The purpose is:

```text
Highly connected relevant file
>
Weakly connected relevant file
```

---

# 8. TASK 9.4 — MCP TOOL BUNDLE TEST

Create a dedicated regression case:

```text
"Add an MCP tool"
```

Verify that:

```text
mcp-server/src/tools/index.ts
mcp-server/src/tools/helpers.ts
```

or the actual highest-connectivity relevant files are not systematically excluded merely because of an alphabetical tie-break.

Do not hardcode these exact paths into the router.

The test must validate the behavior generically.

---

# 9. TASK 9.5 — REVIEW THE `maxFiles` POLICY

Phase 8 discovered a contradiction:

Documentation says there is no arbitrary universal file cap.

Code currently passes:

```text
maxFiles = 25
```

The contradiction must now be resolved.

Do NOT simply delete the limit.

Determine the intended policy.

Possible policy:

```text
Default context target
+
Evidence-based expansion
+
Soft threshold
+
Hard safety ceiling only for runaway cases
```

The final policy must be explicit.

---

# 10. TASK 9.6 — REMOVE DOCUMENTATION/CODE CONTRADICTION

After deciding the context-size policy:

Update:

```text
.uihub-agent/tasks/TASK_ROUTER.md
.uihub-agent/tasks/CONTEXT_BUNDLE.md
.uihub-agent/codebase/CODEBASE_INTELLIGENCE.md
relevant source comments
```

The code and documentation must describe the same behavior.

Do not leave:

```text
"no arbitrary cap"
```

while silently enforcing:

```text
25
```

unless the 25 value is explicitly defined as a justified safety ceiling.

---

# 11. TASK 9.7 — CONTEXT SIZE SHOULD BE EVIDENCE-DRIVEN

A small UI task should normally produce a small context.

A complex MCP feature task may legitimately produce a larger context.

The router should expand based on:

```text
dependency necessity
task complexity
feature scope
protected relationships
validation requirements
```

not simply:

```text
number of files available
```

---

# 12. TASK 9.8 — TEST DEPENDENCY LIMITATION

Phase 8 correctly established:

```text
TEST_DEPENDENCY
→ works for explicit-file tasks
→ does not fire for conceptual S1–S10 tasks
```

Do NOT artificially force test dependencies into every conceptual bundle.

Instead determine whether the router can safely discover likely tests through:

```text
target component
target service
target API
test naming
dependency graph
existing test metadata
```

---

# 13. TASK 9.9 — TEST DEPENDENCY INTEGRATION TEST

Create realistic integration scenarios where the source file is explicitly identified.

Examples:

```text
"Fix backend/src/services/healthService.js"
"Update accessService.js"
"Modify TemplatePreview.tsx"
"Change the templates service"
```

Verify that relevant tests are discovered.

The test should verify actual graph relationships rather than checking a hard-coded expected string.

---

# 14. TASK 9.10 — OPTIONAL TEST DISCOVERY FOR CONCEPTUAL TASKS

Determine whether conceptual tasks can safely locate relevant tests.

For example:

```text
"Fix authentication middleware"
```

could discover:

```text
auth middleware
→ related source
→ related tests
```

Only implement this if it can be done with strong evidence.

Do not use weak filename matching like:

```text
*auth*
```

as proof.

---

# 15. TASK 9.11 — FIX PROTECTED RELATIONSHIP GUARDS

Phase 8 found that:

```text
PROTECTED_RELATIONSHIP
```

can admit unrelated files if `namedSet` is merely non-empty.

This must be tightened.

A protected relationship should only expand context when the protected relationship is actually connected to the task.

Valid examples:

```text
Task targets accessService
→ protected payment/access relationship
```

Invalid example:

```text
Task:
"Fix XSS in comment renderer"

Unrelated:
paymentRoutes.js
```

The second case must NOT enter the bundle merely because it is protected.

---

# 16. TASK 9.12 — PROTECTED RELATIONSHIP PRECISION TESTS

Add tests for:

```text
Relevant protected dependency
→ included

Unrelated protected dependency
→ excluded

Protected file in same feature
→ investigate evidence

Protected file in unrelated feature
→ excluded
```

The router should never use "protected" as an excuse to load unrelated application areas.

---

# 17. TASK 9.13 — PROTECTED PATH DOES NOT MEAN AUTOMATIC CONTEXT

Clarify this rule:

```text
PROTECTED
≠
RELEVANT
```

Instead:

```text
RELEVANT + PROTECTED
→ caution marker

PROTECTED + UNRELATED
→ do not load
```

Update the relevant agent rules.

---

# 18. TASK 9.14 — RETAIN EXPLAINABLE REASONS

Every selected file should still have a reason.

Example:

```text
TemplatePreview.tsx

Reasons:
- Direct task target
- Templates feature
- Consumer of preview service
```

For new ranking behavior, include:

```text
Connectivity tie-break
```

when it affects selection.

---

# 19. TASK 9.15 — NO BLACK-BOX RANKING

Do not create an opaque machine-learning ranking system.

The routing decision should remain explainable.

Use deterministic evidence:

```text
task match
feature relationship
route relationship
dependency
consumer
connectivity
test relationship
protected relationship
```

---

# 20. TASK 9.16 — FILE SELECTION CATEGORIES

Every selected file should have a role in context:

```text
DIRECT_TARGET
DIRECT_DEPENDENCY
DIRECT_CONSUMER
SHARED_SERVICE
RELATED_TEST
PROTECTED_DEPENDENCY
SUPPORTING_CONTEXT
```

Avoid vague categories such as:

```text
maybe relevant
probably useful
nearby
```

---

# 21. TASK 9.17 — CONTEXT PRIORITY

Retain the priority model:

```text
P0
Direct target

P1
Direct dependency

P2
Direct consumer

P3
Shared service

P4
Related test

P5
Supporting knowledge
```

A protected dependency should carry a caution flag instead of automatically receiving highest relevance.

---

# 22. TASK 9.18 — CONTEXT EXPANSION ORDER

Expansion should follow:

```text
1. Direct target
2. Direct dependencies
3. Direct consumers when needed
4. Required shared services
5. Relevant tests
6. Protected relationships only when directly connected
7. Supporting documentation
```

Stop when sufficient context exists.

---

# 23. TASK 9.19 — CONTEXT DEDUPLICATION

Ensure a file selected by multiple triggers appears only once.

Example:

```text
TemplateService
```

may be discovered by:

```text
FEATURE
DIRECT_DEPENDENCY
SHARED_SERVICE
```

It must remain one context entry.

---

# 24. TASK 9.20 — CONTEXT EXPANSION LOGGING

Every expansion must record:

```text
Previous context
Trigger
Reason
Added files
New context size
```

This should be machine-readable.

Use it to debug the router.

---

# 25. TASK 9.21 — STOP CONDITION

The router should stop expanding when:

```text
Target understood
Direct dependencies understood
Relevant consumers understood
Required test context found
Protected relationships evaluated
No relevant evidence requires expansion
```

Do not expand simply because the context budget allows more files.

---

# 26. TASK 9.22 — ZERO-FILE BUNDLE HANDLING

Phase 8 had three zero-file bundles.

A zero-file result is not automatically a failure.

The router should distinguish:

```text
VALID ZERO-CONTEXT
```

from:

```text
FAILED RETRIEVAL
```

For zero-file bundles, explain:

```text
Why zero files were selected
What was still resolved
What confidence exists
```

---

# 27. TASK 9.23 — LOW-CONFIDENCE FALLBACK

When the task cannot be confidently resolved:

```text
LOW CONFIDENCE
```

must be returned.

The router should provide:

```text
candidate features
candidate files
why they were considered
what evidence is missing
```

Do not scan the entire project automatically.

---

# 28. TASK 9.24 — AMBIGUOUS TASK TESTS

Test:

```text
"Fix the card"
"Fix config"
"Fix admin"
"Improve loading"
"Fix the template"
"Fix user issue"
```

The router must avoid selecting unrelated systems solely because the words are generic.

---

# 29. TASK 9.25 — MULTI-FEATURE PRECISION

Test:

```text
"Make paid templates available in the user library"
```

Ensure the context contains the relevant intersection:

```text
TEMPLATE
PAYMENT
USER_LIBRARY
```

but not unrelated:

```text
MCP
CLOUD
DEPLOYMENT
```

unless actual dependencies require them.

---

# 30. TASK 9.26 — DIRECT-FILE FAST PATH

Test explicit-file tasks:

```text
Fix frontend/src/components/templates/TemplateCard.tsx
```

The router should bypass broad task classification where possible.

Then retrieve:

```text
reverse dependencies
related services
related tests
protected dependencies
```

This should be one of the fastest routing paths.

---

# 31. TASK 9.27 — ROUTE FAST PATH

Test:

```text
Fix /templates
Fix /api/v1/templates
Fix /admin/mcp/health
```

Resolve them directly through:

```text
ROUTE_MAP
PAGE_MAP
API_MAP
```

Do not broad-search the repository first.

---

# 32. TASK 9.28 — FEATURE FAST PATH

Test:

```text
Fix templates
Fix MCP
Fix authentication
Fix payments
```

Resolve through:

```text
FEATURE_MAP
```

then expand based on dependencies.

---

# 33. TASK 9.29 — CONTEXT QUALITY METRICS

Measure:

```text
Mean bundle size
Median bundle size
Largest bundle
Smallest bundle
Relevant files
Irrelevant files
Direct targets
Dependency files
Test files
Protected files
Zero-file bundles
```

Do not optimize only for smaller context.

---

# 34. TASK 9.30 — PRECISION / RECALL MODEL

Track:

```text
Precision:
Relevant selected / all selected

Coverage:
Relevant discovered / known relevant
```

Where the benchmark has enough ground truth.

Do not claim mathematical completeness where the "known relevant" set is uncertain.

---

# 35. TASK 9.31 — ROUTING REGRESSION TEST

Create:

```text
.uihub-agent/tasks/
└── ROUTER_REGRESSION.md
```

Document:

```text
S1–S10 baseline
Expected behavior
Known acceptable variation
Forbidden regression
```

---

# 36. TASK 9.32 — ROUTER TEST SUITE

Expand the test suite for:

```text
Classification
Intent
Surface
Feature resolution
Component resolution
Route resolution
Tie-breaking
Connectivity
Test dependency
Protected relationship
Context expansion
Context stopping
Zero-context
Unknown tasks
Ambiguous tasks
Multi-feature tasks
Explicit-file fast path
Route fast path
Feature fast path
```

---

# 37. TASK 9.33 — NO SOURCE BEHAVIOR CHANGES

Except for router/indexing code required for this phase:

```text
Frontend behavior:
UNCHANGED

Backend behavior:
UNCHANGED

MCP behavior:
UNCHANGED

Database behavior:
UNCHANGED

Payment behavior:
UNCHANGED

Authentication behavior:
UNCHANGED

Production:
UNCHANGED
```

---

# 38. TASK 9.34 — KNOWLEDGE BASE UPDATE

Update:

```text
.uihub-agent/tasks/TASK_ROUTER.md
.uihub-agent/tasks/CONTEXT_BUNDLE.md
.uihub-agent/tasks/CONTEXT_ROUTING_GUIDE.md
.uihub-agent/codebase/CODEBASE_INTELLIGENCE.md
.uihub-agent/AGENT.md
```

Keep the documents synchronized with actual code.

Remember:

```text
agent.md
```

is a rolling per-phase contract.

Do not assume its section numbering remains identical between phases.

When replacing Phase 8 content:

```text
Update references
Update task citations
Update section numbers where required
```

Do not leave dead citations.

---

# 39. TASK 9.35 — UPDATE PHASE 8 ACCOUNTING

Do not rewrite history.

If index counts or benchmark results have changed:

record:

```text
Phase 8 recorded result
Current corrected result
Why
```

The current corrected index is:

```text
501 files
```

while the earlier Phase 8 baseline recorded:

```text
485 files
```

Preserve both numbers with clear labels.

---

# 40. TASK 9.36 — INDEX FRESHNESS

Before benchmarking:

```text
agent:index:check
```

must pass.

All router benchmarks must use the same index fingerprint.

Do not compare bundles generated from different index states.

---

# 41. TASK 9.37 — SECURITY

Before context generation:

```text
check:secrets
```

must pass.

The context system must never include:

```text
.env
.env.local
private keys
passwords
tokens
connection strings with credentials
```

---

# 42. TASK 9.38 — CONFIGURATION CONFLICTS

Do not resolve the existing 4 owner-owned configuration conflicts.

Do not weaken:

```text
check:config
```

to make the phase green.

Record:

```text
7 CONSISTENT
4 CONFLICT
0 UNKNOWN
```

or the actual current result.

---

# 43. TASK 9.39 — FRONTEND TYPECHECK BASELINE

Do not fix:

```text
61 errors
23 files
```

These remain outside Phase 9.

---

# 44. TASK 9.40 — REAL TASK BENCHMARK

Run exactly the canonical S1–S10 benchmark.

Do not substitute paraphrased tasks.

Record:

```text
Task ID
Task
Initial context
Final context
Relevant
Irrelevant
Expansion
Protected
Tests
Reason quality
```

---

# 45. TASK 9.41 — ADDITIONAL PRECISION BENCHMARKS

Add separate non-canonical tests for:

```text
MCP tool addition
Explicit source-file modification
API endpoint fix
Authentication middleware fix
Template preview fix
Admin health fix
Security/CORS fix
```

Keep these separate from S1–S10.

Do not use them to rewrite the canonical baseline.

---

# 46. TASK 9.42 — COMPARE BEFORE / AFTER

For each canonical benchmark:

```text
Before Phase 9
After Phase 9
```

Compare:

```text
context size
relevant files
irrelevant files
test discovery
protected relationships
ranking order
reason quality
```

---

# 47. TASK 9.43 — QUALITY TARGET

The desired result is:

```text
More relevant
No unnecessary expansion
No unrelated protected files
Better connected files selected during ties
Relevant tests found when evidence permits
No arbitrary context explosion
```

Do not require the smallest numerical context at all costs.

---

# 48. TASK 9.44 — CREATE CONTEXT QUALITY REPORT

Create:

```text
.uihub-agent/runtime/
└── CONTEXT_QUALITY_REPORT.md
```

Include:

```text
Baseline
After Phase 9
Metrics
Known limitations
Benchmark results
Routing defects fixed
Remaining limitations
```

---

# 49. TASK 9.45 — CREATE ROUTER DECISION RECORD

Create:

```text
.uihub-agent/tasks/
└── ROUTER_DECISIONS.md
```

For each important router design choice:

```text
Decision
Reason
Alternatives considered
Evidence
Impact
```

Examples:

```text
Connectivity tie-break
Context ceiling policy
TEST_DEPENDENCY behavior
Protected relationship rules
Zero-context handling
```

---

# 50. TASK 9.46 — FINAL VALIDATION

Run:

```bash
npm run agent:index:check
npm run check:index
npm run check:secrets
npm run check:knowledge
npm run check:generated
npm run check:docs
npm run check:tracking
npm run check:config
npm run agent:test
```

Then:

```text
Backend tests
MCP tests
CLI tests
Frontend tests
All builds
Router benchmark
Context benchmark
```

Do not weaken any existing gate.

---

# 51. TASK 9.47 — GIT REVIEW

Review:

```text
git diff
git status
git status -sb
```

Every change must be:

```text
Phase 9 required
Phase 9 supporting
Unexpected
```

No unexpected application behavior changes.

---

# 52. REQUIRED SUCCESS CRITERIA

Phase 9 is successful when:

```text
1. Relevant-file tie-breaking uses dependency/connectivity evidence.
2. The context-size policy is explicit and consistent with the code.
3. No unexplained arbitrary cap remains.
4. TEST_DEPENDENCY is verified on explicit-file scenarios.
5. TEST_DEPENDENCY is not artificially forced into conceptual tasks.
6. PROTECTED_RELATIONSHIP no longer admits unrelated protected files.
7. Protected files are treated as caution, not automatic relevance.
8. Zero-file bundles are classified correctly.
9. Ambiguous tasks do not trigger broad repository scans.
10. Explicit-file tasks have a fast path.
11. Route tasks have a fast path.
12. Feature tasks have a fast path.
13. Context selection remains explainable.
14. Context expansion remains evidence-driven.
15. Canonical S1–S10 benchmarks are reproduced correctly.
16. Additional precision benchmarks pass.
17. Router regressions are covered by tests.
18. Knowledge files match actual behavior.
19. Index freshness is verified.
20. Secret scanning passes.
21. Existing application tests remain green.
22. No production data changes occur.
23. No production deployment changes occur.
24. No secrets are exposed.
25. Existing frontend typecheck errors remain unchanged.
```

---

# 53. REQUIRED FILE STRUCTURE

Expected additions:

```text
.uihub-agent/
│
├── tasks/
│   ├── ROUTER_BENCHMARK.md
│   ├── ROUTER_REGRESSION.md
│   └── ROUTER_DECISIONS.md
│
└── runtime/
    └── CONTEXT_QUALITY_REPORT.md
```

Update existing router/context documentation where necessary.

Do not create duplicate systems.

---

# 54. REQUIRED FINAL REPORT

At the end of Phase 9, provide EXACTLY:

==================================================
UI HUB AGENT — PHASE 9 COMPLETION REPORT
========================================

PHASE:
9 — Router Precision, Context Optimization & Retrieval Quality

STATUS:
COMPLETED / PARTIAL / BLOCKED

1. TASK UNDERSTANDING

---

Explain the objective.

2. PHASE 8 BASELINE

---

Index:
S1–S10:
Mean:
Largest:
Smallest:
Relevant:
Irrelevant:

3. TIE-BREAKING

---

Before:
After:
Result:

4. CONNECTIVITY RANKING

---

Result.

5. CONTEXT-SIZE POLICY

---

Final rule.

6. MAX FILE POLICY

---

Explain whether a hard/soft ceiling exists and why.

7. TEST DEPENDENCY

---

Explicit-file:
Conceptual:
Integration tests:

8. PROTECTED RELATIONSHIP

---

Before:
After:
Unrelated-file test:

9. CONTEXT EXPANSION

---

Final expansion order.

10. CONTEXT STOP RULE

---

Final rule.

11. ZERO-CONTEXT HANDLING

---

Result.

12. UNKNOWN / LOW-CONFIDENCE HANDLING

---

Result.

13. FAST PATHS

---

Explicit file:
Route:
Feature:

14. ROUTER BENCHMARK

---

S1–S10 results.

15. ADDITIONAL BENCHMARKS

---

Results.

16. BEFORE / AFTER METRICS

---

Mean:
Largest:
Relevant:
Irrelevant:
Expansion:
Test discovery:

17. PRECISION / COVERAGE

---

Measured results where supported.

18. REASON QUALITY

---

Result.

19. ROUTER TESTS

---

Count and result.

20. KNOWLEDGE VALIDATION

---

Result.

21. SECURITY VALIDATION

---

Secret scan:

22. INDEX FRESHNESS

---

Result.

23. CONFIGURATION CHECK

---

Result.

24. APPLICATION TESTS

---

Backend:
MCP:
CLI:
Frontend:
Total:

25. BUILDS

---

Frontend:
MCP:
CLI:

26. TYPECHECK

---

Frontend:
MCP:
CLI:
Backend:

27. APPLICATION SOURCE CHANGES

---

NONE / DETAILS

28. PRODUCTION DATA CHANGES

---

NONE / DETAILS

29. PRODUCTION DEPLOYMENT CHANGES

---

NONE / DETAILS

30. SECRETS EXPOSED

---

NO

31. REGRESSIONS

---

List all.

32. FILES CREATED

---

List all.

33. FILES MODIFIED

---

List all.

34. FILES DELETED

---

NONE or exact list.

35. PHASE 8 FINDING STATUS

---

RESOLVED / PARTIAL / DEFERRED / OWNER REQUIRED

36. REMAINING HIGH-RISK ROUTER ISSUES

---

List them.

37. REMAINING UNKNOWN AREAS

---

List them.

38. KNOWLEDGE FILES UPDATED

---

List all.

39. IMPORTANT ARCHITECTURAL DISCOVERIES

---

List them.

40. IMPORTANT DISCOVERIES FOR PHASE 10

---

List the findings that should influence the memory/final-validation phase.

41. FINAL GIT / DIFF REVIEW

---

Clean / reviewed / unexpected.

42. FINAL STATUS

---

COMPLETED / PARTIAL / BLOCKED

==================================================
END OF PHASE 9 REPORT
=====================

---

# 55. FINAL EXECUTION INSTRUCTION

Phase 9 improves retrieval quality.

Do not add unnecessary intelligence features.

Do not replace the deterministic router with an opaque system.

Do not optimize for artificial benchmark scores.

Do not force test discovery where evidence does not exist.

Do not load protected files merely because they are protected.

Do not use arbitrary hard limits without documenting their purpose.

Do not modify production.

Do not fix unrelated application problems.

Do not fix the frontend typecheck baseline.

Do not resolve the owner-owned configuration conflicts.

The final objective is:

```text
USER TASK
   ↓
CORRECT CLASSIFICATION
   ↓
CORRECT FILES
   ↓
MINIMUM NECESSARY CONTEXT
   ↓
EXPLAINABLE DECISIONS
```

The Phase 9 report will be reviewed before Phase 10 is designed.

END — UI HUB AGENT PHASE 9
