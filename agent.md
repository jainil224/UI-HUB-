# UI HUB AGENT — PHASE 8

## Task Router, Context Loader & Minimal-Context Execution

**Phase:** 8 of 10
**Phase Name:** Task Router, Context Loader & Minimal-Context Execution
**Status:** NOT STARTED

---

# 1. PHASE OBJECTIVE

Phase 7 created the Codebase Intelligence Layer.

Phase 8 must now make that intelligence **actionable**.

The objective is to build a system that can receive a natural-language development task and determine:

```text
What type of task is this?
        →
Which feature is involved?
        →
Which knowledge should be loaded?
        →
Which indexes should be queried?
        →
Which files are likely relevant?
        →
Which dependencies must be inspected?
        →
Which protected rules apply?
        →
What is the minimum context required?
```

The target behavior is:

```text
User Task
   →
Task Router
   →
Task Category
   →
Relevant Knowledge
   →
Relevant Indexes
   →
Target Files
   →
Dependency Expansion
   →
Protected-Path Check
   →
Context Bundle
   →
AI Execution
```

---

# 2. THE ORIGINAL PROBLEM THIS PHASE SOLVES

The current problem is:

```text
Large UI HUB repository
        →
AI receives a task
        →
AI scans many files
        →
AI discovers unrelated systems
        →
AI spends large context/time
        →
Task becomes slow
```

The desired behavior is:

```text
Large UI HUB repository
        →
AI receives a task
        →
Router identifies relevant subsystem
        →
Indexes locate likely files
        →
Only relevant source is opened
        →
AI expands context only when evidence requires it
        →
Task becomes faster and safer
```

---

# 3. IMPORTANT PHASE BOUNDARY

Phase 8 is about:

* Task classification
* Context selection
* Knowledge routing
* Index querying
* Relevant-file discovery
* Dependency expansion
* Protected-path detection
* Context bundle generation
* Read-only task planning
* Measuring context efficiency

Phase 8 is NOT about:

* Redesigning UI
* Fixing production
* Fixing the 61 frontend typecheck errors
* Resolving the 4 owner configuration conflicts
* Full light-mode implementation
* Large backend refactoring
* Database migrations
* Payment redesign
* Authentication redesign
* Replacing MCP
* Changing deployment architecture

Do not use Phase 8 to fix unrelated application bugs.

---

# 4. CORE DESIGN PRINCIPLE

The router must follow:

```text
START NARROW
       →
IDENTIFY
       →
QUERY
       →
VERIFY
       →
EXPAND ONLY IF NECESSARY
```

Never:

```text
User task
   →
Load every knowledge file
   →
Load every index
   →
Open entire repository
```

---

# 5. TASK 8.1 — CREATE TASK ROUTER CONTRACT

Create:

```text
.uihub-agent/tasks/
─── TASK_ROUTER.md
```

Document:

```text
Purpose
Input
Classification
Routing
Confidence
Context expansion
Protected paths
Output
Failure behavior
```

The router must be deterministic where possible.

---

# 6. TASK 8.2 — TASK CATEGORY TAXONOMY

Use the Phase 7 task categories as the initial taxonomy.

At minimum:

```text
UI
COMPONENT
TEMPLATE
AUTHENTICATION
PAYMENT
ADMIN
MCP
API
DATABASE
STORAGE
SECURITY
PERFORMANCE
DEPLOYMENT
DOCUMENTATION
TESTING
INFRASTRUCTURE
DESIGN_SYSTEM
```

Do not create dozens of unnecessary categories.

A task may have multiple categories.

Example:

```text
"Fix WebM template preview performance"

Primary:
TEMPLATE

Secondary:
PERFORMANCE

Surface:
UI
```

---

# 7. TASK 8.3 — TASK CLASSIFICATION MODEL

The router must classify a task using evidence from:

```text
Task wording
Feature names
Route names
Component names
Service names
Index metadata
Protected-path metadata
```

Do NOT classify purely by keyword.

For example:

```text
"Improve admin template loading"
```

should not become simply:

```text
TEMPLATE
```

It may require:

```text
ADMIN
TEMPLATE
PERFORMANCE
```

---

# 8. TASK 8.4 — TASK INTENT

Determine intent separately from category.

Suggested intents:

```text
FIX
ADD
MODIFY
REMOVE
REFACTOR
OPTIMIZE
DEBUG
INVESTIGATE
DOCUMENT
TEST
AUDIT
```

Example:

```text
"Why is template preview loading slowly?"

Category:
TEMPLATE + PERFORMANCE

Intent:
INVESTIGATE
```

---

# 9. TASK 8.5 — TASK SURFACE

Determine which application surface is involved:

```text
FRONTEND
BACKEND
MCP
DATABASE
DEPLOYMENT
DOCUMENTATION
MULTI_SURFACE
UNKNOWN
```

Example:

```text
"Change TemplateCard styling"

Surface:
FRONTEND
```

Example:

```text
"Fix template API response"

Surface:
BACKEND + FRONTEND
```

---

# 10. TASK 8.6 — TASK ROUTER OUTPUT

The router should produce structured output.

Example:

```json
{
  "task": "Fix WebM template preview performance",
  "intent": "FIX",
  "categories": [
    "TEMPLATE",
    "PERFORMANCE"
  ],
  "surface": [
    "FRONTEND"
  ],
  "confidence": "HIGH",
  "featureCandidates": [
    "templates"
  ],
  "initialIndexes": [
    "FEATURE_MAP",
    "PAGE_MAP",
    "COMPONENT_MAP",
    "SERVICE_MAP"
  ]
}
```

Do not invent a format that becomes unnecessarily large.

---

# 11. TASK 8.7 — ROUTING RULES

Create rules that map task categories to relevant knowledge.

Example:

```text
TEMPLATE
→ features/FEATURES.md
→ FEATURE_MAP
→ COMPONENT_MAP
→ PAGE_MAP
→ SERVICE_MAP

AUTHENTICATION
→ AUTH knowledge
→ SERVICE_MAP
→ API_MAP
→ protected paths

PAYMENT
→ payment knowledge
→ API_MAP
→ SERVICE_MAP
→ protected paths

MCP
→ MCP documentation
→ API_MAP
→ INTEGRATION_MAP
→ generated indexes

DESIGN_SYSTEM
→ DESIGN_SYSTEM.md
→ COMPONENT_MAP
```

Keep routing selective.

---

# 12. TASK 8.8 — ROUTING MATRIX

Create:

```text
.uihub-agent/tasks/
─── ROUTING_MATRIX.json
```

Each category should define:

```text
Category
Primary indexes
Secondary indexes
Knowledge files
Likely source roots
Protected areas
Required validation
```

Example:

```json
{
  "TEMPLATE": {
    "primaryIndexes": [
      "FEATURE_MAP",
      "COMPONENT_MAP"
    ],
    "secondaryIndexes": [
      "PAGE_MAP",
      "SERVICE_MAP"
    ],
    "knowledge": [
      "features/FEATURES.md"
    ],
    "protected": [
      "componentData.tsx"
    ]
  }
}
```

---

# 13. TASK 8.9 — FILE RELEVANCE ENGINE

Build a relevance engine that ranks candidate files.

Possible evidence:

```text
Direct name match
Feature ownership
Route relationship
Import relationship
Reverse dependency
API relationship
Task category
Path relationship
Protected dependency
```

Do not use a fake precision such as:

```text
97.43% relevant
```

unless there is a real measurable basis.

Use explainable relevance factors.

---

# 14. TASK 8.10 — RELEVANCE RESULT

For each candidate file, the system should explain:

```text
Why was this file selected?
```

Example:

```text
TemplatePreview.tsx

Reasons:
- Task mentions template preview
- Component belongs to templates feature
- Directly consumed by TemplateCard
- Called by TemplatesPage
```

This is extremely important for debugging the agent itself.

---

# 15. TASK 8.11 — INITIAL CONTEXT SET

The router should produce a small initial file set.

Example:

```text
Task:
"Fix WebM template preview"

Initial context:
TemplatePreview.tsx
TemplateCard.tsx
TemplatesPage.tsx
template service
relevant preview utility
TEMPLATES knowledge
```

Do not automatically open unrelated files.

---

# 16. TASK 8.12 — CONTEXT EXPANSION

Define rules for when the agent can add more files.

Expand context only when:

```text
Direct dependency discovered
Relevant consumer discovered
Shared service discovered
API dependency discovered
State dependency discovered
Protected relationship discovered
Test dependency discovered
Runtime behavior requires it
```

Do NOT expand because:

```text
The directory is nearby.
The file name looks related.
The file contains generic code.
It is convenient.
```

---

# 17. TASK 8.13 — CONTEXT EXPANSION LIMIT

Add guardrails.

For example:

```text
Initial context:
5–15 files where practical

Normal expansion:
+5–10 files at a time

Large expansion:
requires explicit evidence
```

These are guidelines, not hard-coded universal limits.

A database migration task may legitimately require more context than a button-style change.

---

# 18. TASK 8.14 — CONTEXT BUNDLE

Create:

```text
.uihub-agent/tasks/
─── CONTEXT_BUNDLE.md
```

Document the concept of a task context bundle:

```text
Task
Intent
Categories
Relevant knowledge
Indexes queried
Selected files
Why each file was selected
Protected paths
Dependencies
Unknowns
Validation required
```

---

# 19. TASK 8.15 — CONTEXT BUNDLE JSON

Create:

```text
.uihub-agent/generated/
─── CONTEXT_BUNDLE_SCHEMA.json
```

Define a machine-readable structure for future generated task contexts.

Example:

```json
{
  "task": {},
  "classification": {},
  "knowledge": [],
  "indexes": [],
  "files": [],
  "dependencies": [],
  "protectedPaths": [],
  "validation": [],
  "unknowns": []
}
```

---

# 20. TASK 8.16 — QUERY CLI INTEGRATION

Phase 7 created a query CLI.

Phase 8 must use it as the routing foundation rather than duplicating index logic.

The flow should be:

```text
Task Router
   →
Query CLI
   →
Phase 7 indexes
   →
Candidates
```

Do not create a second independent indexing engine.

---

# 21. TASK 8.17 — ROUTER CLI

Create a command such as:

```text
npm run agent:route -- "Fix WebM template preview performance"
```

The exact command syntax may follow existing project conventions.

Output:

```text
Task:
Intent:
Categories:
Surface:
Confidence:

Primary knowledge:
...

Indexes queried:
...

Candidate files:
...

Protected paths:
...

Next recommended inspection:
...
```

The command must be read-only.

---

# 22. TASK 8.18 — CONTEXT CLI

Create a command such as:

```text
npm run agent:context -- "Fix WebM template preview performance"
```

It should produce:

```text
Classification
→
Relevant knowledge
→
Relevant indexes
→
Candidate files
→
Dependencies
→
Protected paths
→
Context bundle
```

The output should be concise enough to be consumed by another AI process.

---

# 23. TASK 8.19 — QUERY RESULT JSON

Provide a machine-readable output mode:

```text
--json
```

Example:

```bash
npm run agent:context -- --json "Fix WebM template preview"
```

Do not include source code in the default JSON.

Return metadata and paths first.

---

# 24. TASK 8.20 — HUMAN-READABLE MODE

Provide a normal readable mode.

Example:

```text
TASK
Fix WebM template preview performance

CLASSIFICATION
Template + Performance

PRIMARY FILES
TemplatePreview.tsx
TemplateCard.tsx
SimilarTemplates.tsx

DEPENDENCIES
preview utility
template service

PROTECTED
componentData.tsx

REASON
...
```

This lets the developer inspect what the AI is about to do.

---

# 25. TASK 8.21 — PROTECTED-PATH CHECK

Before a context bundle is finalized, check:

```text
PROTECTED_PATHS.md
DO_NOT_CHANGE.md
```

If a protected path is involved:

```text
PROTECTED PATH DETECTED
```

and explain why.

Do not automatically block every legitimate change.

Instead classify:

```text
NORMAL
CAUTION
REQUIRES EXPLICIT TASK INTENT
```

---

# 26. TASK 8.22 — SECURITY CONTEXT ROUTING

Security-sensitive tasks should automatically load:

```text
security/SECURITY_OVERVIEW.md
security/SECRET_HANDLING.md
security/SECURITY_VALIDATION.md
```

and relevant protected-path rules.

Examples:

```text
"CORS issue"
→ SECURITY + API

"Fix authentication bug"
→ SECURITY + AUTHENTICATION

"Change payment verification"
→ SECURITY + PAYMENT
```

---

# 27. TASK 8.23 — DEPLOYMENT CONTEXT ROUTING

Deployment tasks should automatically include:

```text
infrastructure/INFRASTRUCTURE.md
infrastructure/DEPLOYMENT_MAP.md
infrastructure/ENVIRONMENT_CONTRACT.md
```

plus relevant indexes.

Do not load payment/database knowledge unless dependencies show that they matter.

---

# 28. TASK 8.24 — DESIGN CONTEXT ROUTING

UI/design tasks should automatically include:

```text
design-system/DESIGN_SYSTEM.md
```

plus:

```text
COMPONENT_MAP
PAGE_MAP
FEATURE_MAP
```

Do not automatically load backend/API/database context.

---

# 29. TASK 8.25 — API TASK ROUTING

API tasks should start with:

```text
API_OVERVIEW
API_MAP
SERVICE_MAP
ROUTE_MAP
```

then expand into:

```text
DATABASE_USAGE_MAP
INTEGRATION_MAP
COMPONENT_MAP
```

only when required.

---

# 30. TASK 8.26 — DATABASE TASK ROUTING

Database tasks should start with:

```text
DATA_OVERVIEW
DATABASE_USAGE_MAP
SERVICE_MAP
API_MAP
```

If the task requires production access:

```text
OWNER ACTION REQUIRED
```

must be surfaced.

The routing system itself must remain read-only.

---

# 31. TASK 8.27 — FEATURE NAME RESOLUTION

The same feature may be described with different language.

Examples:

```text
Templates
Template marketplace
Template gallery
Template cards
Template previews
```

The router should use Phase 7 feature metadata to associate related terms.

Do not build a huge manually maintained synonym dictionary.

Prefer:

```text
feature metadata
component ownership
route relationships
```

---

# 32. TASK 8.28 — COMPONENT NAME RESOLUTION

Support:

```text
TemplateCard
template card
template-card
card for templates
```

Use:

```text
exact name
normalized name
path
feature
purpose
```

Do not treat every generic "card" task as one specific component.

---

# 33. TASK 8.29 — ROUTE-AWARE RESOLUTION

Support tasks containing routes:

```text
"Fix /templates page"
"/admin/mcp/health is wrong"
"/api/v1/templates returns an error"
```

Resolve route → page/handler → dependencies.

This should use:

```text
ROUTE_MAP
PAGE_MAP
API_MAP
```

---

# 34. TASK 8.30 — FILE-PATH-AWARE RESOLUTION

If the user directly provides:

```text
frontend/src/components/templates/TemplateCard.tsx
```

the router should not perform broad classification.

It should:

```text
Recognize exact file
→
Query reverse dependencies
→
Find consumers
→
Load relevant knowledge
```

This creates a fast path for experienced developers.

---

# 35. TASK 8.31 — ERROR / INVESTIGATION ROUTING

Support tasks such as:

```text
"Why is this component broken?"
"Why does this API return 500?"
"Why is this preview slow?"
```

The router should classify the task as:

```text
INVESTIGATE
```

rather than assuming a specific fix.

Initial context should remain small.

---

# 36. TASK 8.32 — CHANGE-IMPACT PREVIEW

Before coding, the context system should optionally provide:

```text
Likely affected files
Likely affected features
Likely affected routes
Relevant tests
Protected dependencies
```

Example:

```text
Potential impact:
3 components
1 page
1 service
2 tests
```

Do not claim certainty.

Use:

```text
LIKELY
DIRECT
INDIRECT
UNKNOWN
```

where appropriate.

---

# 37. TASK 8.33 — CONTEXT ESCALATION LOG

Every expansion should be explainable.

Create a structured log format:

```text
Initial files
        →
Expansion reason
        →
New files
        →
Reason
```

Example:

```text
Added templateService.ts
Reason:
TemplatePreview receives preview URL from service.
```

This is useful for measuring whether the router is working correctly.

---

# 38. TASK 8.34 — CONTEXT STOP RULE

Define when the router should stop expanding.

Stop when:

```text
Task can be understood
Target files identified
Direct dependencies understood
Relevant validation known
No unresolved dependency blocks investigation
```

Do NOT keep expanding simply because more files are available.

---

# 39. TASK 8.35 — UNKNOWN HANDLING

When classification confidence is low:

```text
UNKNOWN
```

must be returned.

Example:

```text
"Improve the weird loading thing"

Category:
UNKNOWN

Confidence:
LOW
```

The router should then request a narrower search using available repository evidence rather than pretending it knows the target.

---

# 40. TASK 8.36 — MULTI-FEATURE TASKS

Support tasks involving more than one feature.

Example:

```text
"Add a paid template to the user library"
```

Possible categories:

```text
TEMPLATE
PAYMENT
USER_LIBRARY
```

The router should build a combined context without loading the entire project.

---

# 41. TASK 8.37 — CONTEXT DEDUPLICATION

If several routing paths select the same file:

```text
include once
```

Do not duplicate context.

Example:

```text
TemplateCard selected via:
Template feature
Page relationship
Performance dependency
```

still appears once.

---

# 42. TASK 8.38 — CONTEXT PRIORITY

Order selected files:

```text
P0 — direct target
P1 — direct dependency
P2 — direct consumer
P3 — shared service
P4 — supporting knowledge
P5 — optional context
```

The AI should inspect higher-priority context first.

---

# 43. TASK 8.39 — CONTEXT MANIFEST

Create:

```text
.uihub-agent/generated/
─── CONTEXT_MANIFEST.json
```

Track:

```text
Task
Generated time
Router version
Indexes used
Files selected
Expansion steps
Protected paths
Validation
```

Do not include secret values.

---

# 44. TASK 8.40 — ROUTER TEST SUITE

Create dedicated tests for:

```text
Task classification
Intent classification
Surface classification
Feature resolution
Component resolution
Route resolution
Protected-path detection
Context expansion
Context stopping
Deduplication
Unknown handling
Multi-feature handling
```

---

# 45. TASK 8.41 — REQUIRED REAL-TASK SIMULATIONS

Run at least these read-only tasks:

```text
1.
"Fix WebM preview loading in Similar Templates"

2.
"Change the TemplateCard design"

3.
"Fix authentication problem on user profile"

4.
"Fix MCP tools list"

5.
"Fix an admin dashboard health issue"

6.
"Optimize template search"

7.
"Fix a payment verification bug"

8.
"Change the homepage hero section"

9.
"Fix API /api/v1/templates"

10.
"Why is the site loading slowly?"
```

Do not actually modify the application.

The purpose is to test routing.

---

# 46. TASK 8.42 — SIMULATION METRICS

For each simulated task record:

```text
Task
Classification
Files selected initially
Files after expansion
Relevant files
Irrelevant files
Protected paths detected
Indexes queried
Expansion count
Unknowns
```

Where practical, measure:

```text
Total files in repository
Files selected
Selection ratio
```

Do not claim a speed improvement unless actually measured.

---

# 47. TASK 8.43 — TARGET EFFICIENCY

The intelligence system should aim for:

```text
Task
→ small relevant context
→ targeted source inspection
```

Do not define an arbitrary universal maximum such as:

```text
never inspect more than 10 files
```

Complex tasks legitimately require more.

The objective is:

```text
MINIMUM NECESSARY CONTEXT
```

not:

```text
MINIMUM POSSIBLE CONTEXT
```

---

# 48. TASK 8.44 — AGENT.MD INTEGRATION

Update:

```text
agent.md
```

with the final workflow:

```text
1. Read project context.
2. Classify task.
3. Route task.
4. Query relevant indexes.
5. Build initial context.
6. Check protected paths.
7. Inspect source.
8. Expand only when evidence requires it.
9. Make minimal changes.
10. Validate.
11. Update knowledge.
```

Do not overwrite existing rules.

Preserve the established precedence model.

---

# 49. TASK 8.45 — OPENCODE INTEGRATION

Create documentation:

```text
.uihub-agent/tasks/
─── OPENCODE_USAGE.md
```

Explain how OpenCode should use:

```text
agent:route
agent:context
agent:index
```

The purpose is to allow OpenCode to obtain focused context before broad source inspection.

Do not assume a specific OpenCode API unless the repository already has one.

---

# 50. TASK 8.46 — ANTIGRAVITY INTEGRATION

Create:

```text
.uihub-agent/tasks/
─── ANTIGRAVITY_USAGE.md
```

Explain the same workflow in a tool-agnostic way:

```text
Task
→ Route
→ Context
→ Inspect
→ Execute
→ Validate
```

Do not assume unsupported Antigravity features.

---

# 51. TASK 8.47 — CONTEXT SAFETY

The context loader must never include:

```text
.env
.env.local
private credentials
secrets
production connection strings
private keys
```

Use the Phase 6 secret-scanning/exclusion rules.

The context system should be safe even when the user asks:

```text
"Load everything related to this backend"
```

---

# 52. TASK 8.48 — DOCUMENTATION CONTEXT

Documentation should be included only when relevant.

Examples:

```text
Template bug
→ TEMPLATES documentation

Deployment bug
→ deployment documentation

Security bug
→ security documentation

Component styling
→ design-system documentation
```

Do not load all documentation automatically.

---

# 53. TASK 8.49 — ROUTER FALLBACK

When the router cannot confidently classify the task:

```text
Do not scan the whole repository.
```

Instead:

```text
1. Search the indexes.
2. Search exact symbols.
3. Search routes/features.
4. Return candidate areas.
5. Mark confidence.
```

Example:

```text
Could not confidently classify.

Possible areas:
Templates
Preview
Performance

Confidence:
LOW
```

This is much safer than blindly opening everything.

---

# 54. TASK 8.50 — KNOWLEDGE ROUTING GRAPH

Create:

```text
.uihub-agent/generated/
─── KNOWLEDGE_ROUTING_GRAPH.json
```

It should connect:

```text
Task Category
    →
Knowledge
    →
Index
    →
Source Roots
    →
Protected Paths
    →
Validation
```

This becomes the machine-readable routing map.

---

# 55. TASK 8.51 — ROUTER FRESHNESS

The router must detect stale indexes.

Before producing a context bundle:

```text
agent:index:check
```

must be considered.

If indexes are stale:

```text
WARNING:
Codebase intelligence is stale.
```

Where safe, instruct the agent to refresh the index.

Do not silently use stale intelligence for critical tasks.

---

# 56. TASK 8.52 — PROTECTED TASK ESCALATION

If a task touches:

```text
Payment
Authentication
Production deployment
Database mutation
MCP authentication
Security
```

the router should mark:

```text
HIGH CAUTION
```

and include the relevant rules.

This does not automatically block the task.

---

# 57. TASK 8.53 — CREATE PHASE 8 KNOWLEDGE DOC

Create:

```text
.uihub-agent/tasks/
─── CONTEXT_ROUTING_GUIDE.md
```

This should explain:

```text
How routing works
How context is selected
How expansion works
How protected paths work
How stale indexes are handled
How future agents should consume the context
```

---

# 58. TASK 8.54 — FINAL VALIDATION

Run:

```text
agent:index:check
check:index
check:secrets
check:knowledge
check:generated
check:docs
check:tracking
check:config
```

Then:

```text
all existing tests
all builds
router tests
context tests
simulation suite
```

Do not weaken any existing gate.

---

# 59. TASK 8.55 — NO FRONTEND TYPECHECK FIX

The existing frontend typecheck baseline must remain unchanged.

Current known baseline:

```text
61 errors
23 files
```

Do not fix these during Phase 8.

If the router/indexer touches any of those files for analysis, that does not authorize modifying them.

---

# 60. TASK 8.56 — NO PRODUCTION CHANGES

Phase 8 must remain:

```text
Production data changes:
NONE

Production deployment changes:
NONE
```

Do not deploy anything as part of this phase.

---

# 61. PHASE 8 SUCCESS CRITERIA

Phase 8 is successful when the agent can take:

```text
"Fix WebM template preview loading"
```

and produce something approximately like:

```text
CLASSIFICATION
TEMPLATE + PERFORMANCE

SURFACE
FRONTEND

PRIMARY CONTEXT
TemplatePreview.tsx
TemplateCard.tsx
SimilarTemplates.tsx

SECONDARY CONTEXT
template service
preview utility

KNOWLEDGE
TEMPLATES documentation
Performance rules

PROTECTED
componentData.tsx

VALIDATION
frontend build
relevant tests

CONFIDENCE
HIGH
```

without scanning the entire UI HUB repository.

The system should also correctly handle:

```text
UI tasks
API tasks
Authentication tasks
Payment tasks
Admin tasks
MCP tasks
Database tasks
Deployment tasks
Security tasks
Multi-feature tasks
Unknown tasks
```

---

# 62. REQUIRED FILE STRUCTURE

Expected additions:

```text
.uihub-agent/
├
└── tasks/
├   └── TASK_ROUTER.md
├   └── ROUTING_MATRIX.json
├   └── CONTEXT_BUNDLE.md
├   └── TASK_CATEGORY_CATALOG.md
├   └── CONTEXT_ROUTING_GUIDE.md
├   └── OPENCODE_USAGE.md
├   ─── ANTIGRAVITY_USAGE.md
├
─── generated/
    └── CONTEXT_BUNDLE_SCHEMA.json
    └── CONTEXT_MANIFEST.json
    ─── KNOWLEDGE_ROUTING_GRAPH.json
```

Use the existing Phase 7 query/index infrastructure.

Do not duplicate the indexing system.

---

# 63. REQUIRED FINAL REPORT

At the end of Phase 8, provide EXACTLY:

==================================================
UI HUB AGENT — PHASE 8 COMPLETION REPORT
========================================

PHASE:
8 — Task Router, Context Loader & Minimal-Context Execution

STATUS:
COMPLETED / PARTIAL / BLOCKED

1. TASK UNDERSTANDING

---

Explain the objective.

2. TASK CATEGORIES

---

List supported categories.

3. TASK INTENTS

---

List supported intents.

4. TASK SURFACE MODEL

---

Frontend / Backend / MCP / etc.

5. ROUTER

---

How it works.

6. ROUTING MATRIX

---

Summary.

7. RELEVANCE ENGINE

---

How files are selected.

8. CONTEXT LOADER

---

How the initial context is built.

9. CONTEXT EXPANSION

---

Expansion rules.

10. CONTEXT STOP RULE

---

How expansion ends.

11. PROTECTED-PATH HANDLING

---

Result.

12. SECURITY ROUTING

---

Result.

13. DESIGN ROUTING

---

Result.

14. API ROUTING

---

Result.

15. DATABASE ROUTING

---

Result.

16. DEPLOYMENT ROUTING

---

Result.

17. ROUTER CLI

---

Command and result.

18. CONTEXT CLI

---

Command and result.

19. JSON OUTPUT

---

Result.

20. ROUTING GRAPH

---

Result.

21. KNOWLEDGE ROUTING

---

Result.

22. INDEX FRESHNESS

---

Result.

23. REAL TASK SIMULATIONS

---

For each simulation:

Task:
Classification:
Initial files:
Final files:
Relevant:
Irrelevant:
Expansion:
Protected:
Result:

24. SIMULATION METRICS

---

Summary metrics.

25. CONTEXT EFFICIENCY

---

Repository size:
Typical context size:
Selection ratio:
Measured improvement if available:

26. SECURITY VALIDATION

---

Secret scan:
Context exclusions:

27. KNOWLEDGE VALIDATION

---

Result.

28. CONFIGURATION VALIDATION

---

Result.

29. TEST RESULTS

---

Backend:
MCP:
CLI:
Frontend:
Router:
Context:

30. BUILD RESULTS

---

Frontend:
MCP:
CLI:

31. TYPECHECK RESULTS

---

Frontend:
MCP:
CLI:
Backend:

32. PRODUCTION DATA CHANGES

---

NO / YES

33. PRODUCTION DEPLOYMENT CHANGES

---

NO / YES

34. SECRETS EXPOSED

---

NO / YES

35. FILES CREATED

---

List all.

36. FILES MODIFIED

---

List all.

37. FILES DELETED

---

NONE or exact list.

38. REGRESSIONS

---

List all.

39. PHASE 7 FINDING STATUS

---

RESOLVED / PARTIAL / DEFERRED / OWNER REQUIRED

40. REMAINING HIGH-RISK ISSUES

---

List them.

41. REMAINING UNKNOWN AREAS

---

List them.

42. KNOWLEDGE BASE UPDATED

---

List all updated files.

43. IMPORTANT ARCHITECTURAL DISCOVERIES

---

List new discoveries.

44. IMPORTANT DISCOVERIES FOR PHASE 9

---

List facts that should influence the memory/change-intelligence phase.

45. FINAL GIT / DIFF REVIEW

---

Clean / reviewed / unexpected changes.

46. FINAL STATUS

---

COMPLETED / PARTIAL / BLOCKED

==================================================
END OF PHASE 8 REPORT
=====================

---

# 64. FINAL EXECUTION INSTRUCTION

Phase 8 is the core task-routing phase of the UI HUB Agent.

The system must optimize for:

```text
RELEVANT CONTEXT
```

not:

```text
ALL CONTEXT
```

Always start narrow.

Use the Phase 7 intelligence indexes.

Do not create a second codebase parser when existing indexes can answer the question.

Do not treat relevance as certainty.

Explain why a file was selected.

Expand context only when evidence requires it.

Respect protected paths.

Never load secrets.

Never modify production.

Never fix unrelated frontend typecheck errors.

Never resolve the owner-owned configuration conflicts.

Never deploy.

Do not perform application refactoring.

At the end, validate the router against real UI HUB tasks and provide the exact Phase 8 Completion Report.

The Phase 8 report will be reviewed before Phase 9 is designed.

END — UI HUB AGENT PHASE 8

---

# 65. PHASE 8 WORKFLOW (TASK 8.44 INTEGRATION)

The working sequence for any task, using the router and context loader. This
**adds** to the rules above; it does not replace them. The precedence model is
unchanged: `DO_NOT_CHANGE.md` still outranks every instruction here, and no step
below authorises touching a protected path.

```text
1. Read project context.
2. Classify task.
3. Route task.
4. Query relevant indexes.
5. Build initial context.
6. Check protected paths.
7. Inspect source.
8. Expand only when evidence requires it.
9. Make minimal changes.
10. Validate.
11. Update knowledge.
```

## The same workflow as commands

| Step | Command |
|---|---|
| 2–3. Classify and route | `npm run agent:route -- "<task>"` |
| 4. Query indexes | `npm run agent:query -- feature <slug>` |
| 5. Build context | `npm run agent:context -- "<task>"` |
| 6. Check protected paths | read `bundle.protectedAreas`; then `DO_NOT_CHANGE.md` |
| 7. Inspect source | read `bundle.files` in `priority` order |
| 8. Expand | `--expand-steps <n>`, each addition justified in `expansionLog` |
| 10. Validate | run `bundle.validation` |
| 11. Update knowledge | `npm run agent:index` if source changed |

## The three rules that matter

**Start narrow.** A bundle is a reading list, not a suggestion. If a file is not
in it, do not open it because it looked related.

**Explain, always.** Every file in a bundle carries `why[]`. If you cannot state
why a file should be opened, you are guessing.

**Ask instead of expanding.** `UNKNOWN` confidence or an `emptyReason` is a
legitimate answer. Ask the user to narrow the task; do not fall back to a
repository-wide search.

## Guides

```text
.uihub-agent/tasks/TASK_ROUTER.md         routing contract
.uihub-agent/tasks/CONTEXT_BUNDLE.md      bundle contract
.uihub-agent/tasks/CONTEXT_ROUTING_GUIDE.md  how routing and selection work
.uihub-agent/tasks/OPENCODE_USAGE.md      OpenCode-specific workflow
.uihub-agent/tasks/ANTIGRAVITY_USAGE.md   tool-agnostic workflow
```

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success |
| 1 | Usage error |
| 2 | Index stale — regenerate with `npm run agent:index` |
| 3 | Secret detected in the emitted bundle |

---

# 66. PHASE 8 STATUS

Status: COMPLETE

Phase 8 report: `.uihub-agent/codebase/PHASE_8_CHANGES.md`
Simulations: `.uihub-agent/codebase/PHASE_8_SIMULATIONS.md`
Checklist: `.uihub-agent/codebase/PHASE_8_CHECKLIST.md`
END — UI HUB AGENT PHASE 8
