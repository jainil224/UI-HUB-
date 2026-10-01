# UI HUB AGENT — PHASE 7

## Codebase Intelligence, Component Mapping & Dependency Graph

**Phase:** 7 of 10
**Phase Name:** Codebase Intelligence, Component Mapping & Dependency Graph
**Status:** NOT STARTED

**Primary Goal:**
Transform the Phase 1–6 project census into a high-resolution machine-readable model of UI HUB so future AI agents can locate relevant pages, components, features, hooks, services, APIs, and dependencies without scanning the entire repository.

---

# 1. PHASE OBJECTIVE

The first six phases established:

```text
Phase 1
Project census

Phase 2
Runtime verification

Phase 3
Controlled remediation

Phase 4
Production verification

Phase 5
Deployment/API contract

Phase 6
Security + governance
```

Phase 7 now builds the **Codebase Intelligence Layer**.

The goal is:

```text
USER TASK
    ↓
RELEVANT FEATURE
    ↓
RELEVANT PAGE
    ↓
RELEVANT COMPONENT
    ↓
RELEVANT HOOK / SERVICE
    ↓
RELEVANT API / DATA
    ↓
DEPENDENCIES
    ↓
TARGET FILES
```

The future agent should be able to identify the likely impact area before opening hundreds of unrelated source files.

---

# 2. IMPORTANT PHASE BOUNDARY

Phase 7 is primarily an **intelligence/indexing phase**.

Do NOT use it to:

* Redesign UI
* Refactor components
* Rename directories
* Rewrite APIs
* Change database architecture
* Change authentication
* Change payments
* Fix production deployment
* Rewrite Render configuration
* Modify Cloudflare
* Modify production data
* Perform the full light-mode refactor
* Upgrade major dependencies

The application's source code should remain unchanged unless a tiny supporting change is absolutely required for the indexing/validation system.

Prefer:

```text
READ
→ ANALYZE
→ INDEX
→ VALIDATE
→ DOCUMENT
```

over:

```text
READ
→ REFACTOR
```

---

# 3. CORE PRINCIPLE — SOURCE PRECEDENCE

Phase 6 identified that tracked generated output can become a second source of truth.

Phase 7 must establish an explicit precedence model.

Use this hierarchy:

```text
1. LIVE RUNTIME EVIDENCE
2. CURRENT SOURCE CODE
3. CURRENT CONFIGURATION
4. GENERATED ARTIFACTS
5. GENERATED INDEXES
6. CURRENT DOCUMENTATION
7. HISTORICAL DOCUMENTATION
8. ASSUMPTION
```

However, precedence must be applied by artifact type.

For example:

```text
Application behavior
→ source + runtime

Generated MCP data
→ generator/source + generated artifact validation

Production URL
→ deployment configuration + verified runtime

Project map
→ generator output

Architecture description
→ verified source/config/runtime evidence
```

Do not blindly claim:

```text source always wins
```

or:

```text generated file always wins
```

The authoritative source depends on what is being described.

Document this in:

```text
.uihub-agent/AGENT.md
```

---

# 4. TASK 7.1 — CREATE CODEBASE INTELLIGENCE CONTRACT

Create:

```text
.uihub-agent/codebase/
└── CODEBASE_INTELLIGENCE.md
```

Document:

```text
Purpose
Inputs
Generated outputs
Source precedence
Index freshness
Supported entities
Limitations
Update process
```

The file should explain how future agents should use the intelligence layer.

---

# 5. TASK 7.2 — COMPONENT INVENTORY

Create a machine-readable component inventory.

At minimum:

```text
Component
Path
Category
Export
Type
Purpose
Props
Hooks
Imports
Used By
Route/Page usage
Feature
```

The system should distinguish:

```text
React component
Page
Layout
Hook
Utility
Service
Provider
Context
Primitive
Experimental component
Generated component
```

Do not classify based only on filenames.

Use source evidence.

---

# 6. TASK 7.3 — COMPONENT MAP

Create:

```text
.uihub-agent/codebase/
└── COMPONENT_MAP.json
```

Example conceptual structure:

```json
{
  "TemplateCard": {
    "path": "frontend/src/components/templates/TemplateCard.tsx",
    "type": "component",
    "feature": "templates",
    "usedBy": [
      "TemplatesPage",
      "FeaturedTemplates"
    ],
    "imports": [
      "TemplatePreview",
      "Badge"
    ],
    "hooks": [
      "useTemplate"
    ],
    "risk": "medium"
  }
}
```

The actual structure should reflect UI HUB.

Do not invent fields that cannot be generated reliably.

---

# 7. TASK 7.4 — PAGE MAP

Create:

```text
.uihub-agent/codebase/
└── PAGE_MAP.json
```

For every meaningful page:

```text
Route
Page file
Lazy-loaded?
Feature
Components
Hooks
Services
API calls
Auth requirement
Admin requirement
```

Example:

```text
/templates
→ TemplatesPage
→ Template marketplace
→ TemplateCard
→ TemplatePreview
→ template service
```

---

# 8. TASK 7.5 — ROUTE MAP

Create:

```text
.uihub-agent/codebase/
└── ROUTE_MAP.json
```

Separate:

```text
Frontend routes
REST routes
MCP routes
Admin routes
Webhook routes
```

Do not combine frontend and backend routing into one ambiguous list.

Each route record should include:

```text
Path
Method
Surface
Handler/page
Auth
Owner
Source
```

---

# 9. TASK 7.6 — FEATURE MAP

Create:

```text
.uihub-agent/codebase/
└── FEATURE_MAP.json
```

Every major feature should map to:

```text
Feature
Pages
Components
Hooks
Services
APIs
Database
Storage
External integrations
Related configuration
```

Use the verified feature inventory from earlier phases as the starting point.

Do not duplicate large descriptions unnecessarily.

Use references to other indexes where appropriate.

---

# 10. TASK 7.7 — HOOK MAP

Create:

```text
.uihub-agent/codebase/
└── HOOKS_MAP.json
```

For every important custom hook:

```text
Hook
Path
Purpose
Inputs
Outputs
State
Dependencies
Consumers
Feature
```

Focus on meaningful custom hooks.

Do not create unnecessary records for trivial inline React usage.

---

# 11. TASK 7.8 — SERVICE MAP

Create:

```text
.uihub-agent/codebase/
└── SERVICE_MAP.json
```

Document:

```text
Service
Path
Purpose
Consumers
API dependencies
Database dependencies
External dependencies
Auth dependency
Feature
```

This is particularly important for:

```text
Authentication
Templates
Components
Payments
Admin
MCP
Search
User library
```

---

# 12. TASK 7.9 — API MAP

Create:

```text
.uihub-agent/codebase/
└── API_MAP.json
```

For each REST endpoint:

```text
Path
Method
Router
Handler
Middleware
Frontend callers
Auth
Database usage
External service usage
```

For MCP tools include:

```text
Tool
Source
Route/transport
Auth
Data dependencies
```

Do not replace the existing API documentation.

This is the machine-readable companion.

---

# 13. TASK 7.10 — DATABASE USAGE MAP

Create:

```text
.uihub-agent/codebase/
└── DATABASE_USAGE_MAP.json
```

This should describe **code usage**, not a new schema.

Example:

```text
Collection
Read locations
Write locations
Services
Features
Criticality
```

Do not perform database writes.

Do not inspect more production data than necessary.

Use source-code evidence primarily.

---

# 14. TASK 7.11 — STORAGE USAGE MAP

Create:

```text
.uihub-agent/codebase/
└── STORAGE_USAGE_MAP.json
```

Identify:

```text
Upload paths
Download paths
Storage services
Consumers
Features
Authentication requirements
```

Do not upload/delete production assets.

---

# 15. TASK 7.12 — EXTERNAL INTEGRATION MAP

Create:

```text
.uihub-agent/codebase/
└── INTEGRATION_MAP.json
```

Map integrations such as:

```text
Firebase
Razorpay
Brevo
Redis
MongoDB
Web Push
MCP
Analytics
```

For each:

```text
Provider
Purpose
Source files
Environment variables
Consumers
Failure behavior
Feature
```

Never include credential values.

---

# 16. TASK 7.13 — IMPORT GRAPH

Create a machine-readable import/dependency graph:

```text
.uihub-agent/generated/
└── IMPORT_GRAPH.json
```

The graph should represent:

```text
File A
  ↓ imports
File B
  ↓ imports
File C
```

Include enough information for an agent to answer:

```text
What depends on this file?
What does this file depend on?
```

Do not create a graph that is so verbose that agents cannot practically use it.

---

# 17. TASK 7.14 — REVERSE DEPENDENCY MAP

Create:

```text
.uihub-agent/generated/
└── REVERSE_DEPENDENCY_MAP.json
```

This is critical for safe changes.

Example:

```text
TemplatePreview
→ used by:
  TemplateCard
  TemplateDetails
  RelatedTemplates
```

The agent can then know:

> "Changing TemplatePreview may affect three UI surfaces."

---

# 18. TASK 7.15 — SYMBOL INDEX

Create:

```text
.uihub-agent/generated/
└── SYMBOL_INDEX.json
```

Index important:

```text
Components
Functions
Hooks
Classes
Services
Constants
Types
Interfaces
Exports
```

Every symbol should have:

```text
Name
File
Line/range where available
Type
Exported?
Consumers
```

Do not index meaningless compiler/runtime symbols.

---

# 19. TASK 7.16 — FILE ROLE CLASSIFICATION

Create:

```text
.uihub-agent/codebase/
└── FILE_ROLE_MAP.json
```

Classify important files:

```text
PAGE
COMPONENT
HOOK
SERVICE
API
CONFIG
DATA
GENERATOR
TEST
SCRIPT
STYLE
DOCUMENTATION
DEPLOYMENT
SECURITY
GENERATED
```

This gives the future agent a fast way to narrow the search space.

---

# 20. TASK 7.17 — FEATURE → FILE INDEX

Create:

```text
.uihub-agent/generated/
└── FEATURE_FILE_INDEX.json
```

Example:

```text
templates
→
TemplatesPage
TemplateCard
TemplatePreview
templateService
templateData
template API
template styles
```

This should be one of the fastest indexes an AI can query.

---

# 21. TASK 7.18 — PAGE → COMPONENT INDEX

Create:

```text
.uihub-agent/generated/
└── PAGE_COMPONENT_INDEX.json
```

For each route/page:

```text
Page
→ direct components
→ indirect important components
→ hooks
→ services
```

Do not blindly include the entire recursive tree.

Distinguish:

```text
DIRECT
INDIRECT
```

---

# 22. TASK 7.19 — COMPONENT IMPACT ANALYSIS

Create a reusable process for answering:

```text
"If I change this component, what might break?"
```

The process should calculate:

```text
Direct consumers
Indirect consumers
Routes affected
Features affected
Shared services
Tests affected
Risk level
```

Do not assign an arbitrary numeric score.

Use qualitative labels:

```text
LOW
MEDIUM
HIGH
CRITICAL
```

Only where evidence justifies them.

---

# 23. TASK 7.20 — ROUTE IMPACT ANALYSIS

Create a similar mechanism for routes.

Given:

```text
/api/v1/templates
```

the agent should be able to identify:

```text
Router
Handler
Middleware
Services
Database
Frontend callers
Tests
```

This becomes important for future API modifications.

---

# 24. TASK 7.21 — FEATURE IMPACT ANALYSIS

Given:

```text
Templates
```

the system should answer:

```text
Pages
Components
Services
API
Database
Storage
Authentication
External integrations
Tests
```

This should become a reusable agent query pattern.

---

# 25. TASK 7.22 — CREATE QUERY EXAMPLES

Create:

```text
.uihub-agent/codebase/
└── INTELLIGENCE_QUERIES.md
```

Include practical examples such as:

```text
"Show all files involved in TemplatePreview."

"Who uses TemplateCard?"

"What APIs are called by the Templates page?"

"What files affect the payment flow?"

"What routes depend on accessService?"

"What components depend on Firebase auth?"

"What files are generated?"

"What files are protected?"
```

The purpose is to teach the coding agent how to use the index.

---

# 26. TASK 7.23 — TASK CATEGORY CATALOG

Create:

```text
.uihub-agent/tasks/
└── TASK_CATEGORY_CATALOG.md
```

Define categories such as:

```text
UI
Component
Template
Authentication
Payment
Admin
MCP
API
Database
Performance
Security
Deployment
Documentation
Testing
Infrastructure
```

For each category define:

```text
Relevant indexes
Relevant documentation
Likely source directories
Protected areas
Validation required
```

Do NOT implement automatic task routing yet.

That is Phase 8.

---

# 27. TASK 7.24 — CODEBASE INDEX GENERATOR

Create/update scripts to generate the maps automatically.

Suggested structure:

```text
.uihub-agent/scripts/
├── generate-map.mjs
├── generate-component-map.mjs
├── generate-page-map.mjs
├── generate-route-map.mjs
├── generate-feature-map.mjs
├── generate-service-map.mjs
├── generate-api-map.mjs
├── generate-symbol-index.mjs
└── generate-dependency-graph.mjs
```

Do not create unnecessary scripts if a single generator can safely generate multiple outputs.

Prefer one consistent indexing pipeline when practical.

---

# 28. TASK 7.25 — SINGLE INDEX COMMAND

Create a single command such as:

```text
npm run agent:index
```

or the repository's equivalent.

It should generate all supported intelligence indexes.

The command must be:

```text
Deterministic
Repeatable
Idempotent
Safe
No production writes
No network dependency unless explicitly required
```

---

# 29. TASK 7.26 — INDEX CHECK MODE

Add:

```text
npm run agent:index:check
```

or equivalent.

Behavior:

```text
Index current
→ exit 0

Index stale
→ exit 1
```

It must NOT automatically modify files in check mode.

---

# 30. TASK 7.27 — INDEX FRESHNESS

Track:

```text
Source snapshot
Generated timestamp
Generator version
Input file count
Indexed file count
```

Do not rely only on timestamps.

Prefer a deterministic fingerprint/hash of relevant source inputs where practical.

---

# 31. TASK 7.28 — EXCLUDE IRRELEVANT FILES

The indexing system must explicitly exclude:

```text
node_modules
build caches
temporary files
logs
coverage
unrelated binary assets
environment secrets
editor metadata
```

Use the repository's actual structure.

Do not accidentally index credentials.

---

# 32. TASK 7.29 — GENERATED OUTPUT SECURITY

Before writing generated JSON:

```text
Run secret validation
```

Generated indexes must not contain:

```text
API keys
Passwords
Tokens
Private credentials
Connection strings with credentials
```

A path or public identifier is not automatically a secret.

Use the Phase 6 secret scanner.

---

# 33. TASK 7.30 — CROSS-REFERENCE VALIDATION

The generated indexes must cross-check each other.

Examples:

```text
COMPONENT_MAP
↔ FILE_ROLE_MAP

PAGE_MAP
↔ ROUTE_MAP

FEATURE_MAP
↔ COMPONENT_MAP

API_MAP
↔ API_OVERVIEW

IMPORT_GRAPH
↔ SYMBOL_INDEX
```

Report:

```text
MATCH
CONFLICT
MISSING
```

Do not silently manufacture missing relationships.

---

# 34. TASK 7.31 — UNKNOWN / LOW-CONFIDENCE HANDLING

When the index cannot confidently determine something:

```text
UNKNOWN
```

or:

```text
LOW_CONFIDENCE
```

must be used.

Never turn inference into fact.

Each uncertain relationship should carry evidence where practical.

---

# 35. TASK 7.32 — GENERATED VS MANUAL KNOWLEDGE

Clearly classify every new knowledge file as:

```text
GENERATED
MANUAL
HYBRID
```

For example:

```text
COMPONENT_MAP.json
→ GENERATED

ARCHITECTURE.md
→ MANUAL

INTELLIGENCE_QUERIES.md
→ MANUAL

PROJECT_MAP.json
→ GENERATED

TASK_CATEGORY_CATALOG.md
→ MANUAL
```

Document this in:

```text
.uihub-agent/codebase/CODEBASE_INTELLIGENCE.md
```

---

# 36. TASK 7.33 — PROTECTED SOURCE RELATIONSHIPS

Teach the intelligence system about protected relationships.

Examples:

```text
paymentRoutes
→ payment verification
→ webhook
→ entitlement

accessService
→ paywall
→ plan checks
→ reason strings

server.js
→ API mount
→ MCP mount
→ health

componentData
→ catalogue
→ generated data
```

The agent must understand that these are not ordinary isolated files.

---

# 37. TASK 7.34 — DEPLOYMENT PRECEDENCE DOCUMENTATION

Do not fix production deployment in Phase 7.

Instead document:

```text
Source
Configuration
Build artifact
Deployment environment
Live runtime
```

for:

```text
Web API
Frontend
MCP
Generated MCP data
Environment variables
```

This directly addresses the Phase 6 discovery that tracked output and deployment state can differ.

---

# 38. TASK 7.35 — AGENT CONTEXT BUDGET RULE

Add a rule to `AGENT.md`:

The agent should not load every index for every task.

Use:

```text
Task
 ↓
Relevant category
 ↓
Relevant index
 ↓
Target files
 ↓
Only expand dependencies when needed
```

For example:

```text
Template UI bug
→ feature map
→ page map
→ component map
→ reverse dependency map
→ source files
```

Do NOT automatically load:

```text
Payment
Authentication
MCP
Deployment
```

unless related.

---

# 39. TASK 7.36 — "MINIMUM NECESSARY CONTEXT" RULE

Add:

```text
Before opening source files, identify the minimum relevant set.

Start narrow.
Expand only when evidence shows another file matters.
```

This is one of the most important rules for solving the original full-codebase analysis problem.

---

# 40. TASK 7.37 — CONTEXT EXPANSION RULE

Define when an agent is allowed to expand context:

```text
Direct import
Direct consumer
Shared service
Shared state
Shared API
Protected dependency
Runtime dependency
Test dependency
```

Do not recursively load the entire repository.

Stop expanding when additional files are no longer relevant to the requested task.

---

# 41. TASK 7.38 — REAL TASK SIMULATIONS

Do not modify application behavior.

Use read-only simulations with real UI HUB tasks.

Example:

```text
TASK A
"Find where TemplateCard preview is rendered."

TASK B
"Find all files affected by changing a component card."

TASK C
"Find the API and frontend callers for templates."

TASK D
"Find all files involved in authentication."

TASK E
"Find the files involved in the MCP tools list."
```

Measure:

```text
files identified
relevant files
irrelevant files
time/context cost where measurable
```

---

# 42. TASK 7.39 — FALSE-POSITIVE TESTING

The agent must be tested against ambiguous names.

Examples:

```text
"Button"
"Card"
"Config"
"Admin"
"Template"
"Index"
"User"
```

The intelligence layer should use:

```text
path
feature
imports
consumers
route
purpose
```

rather than name-only matching.

---

# 43. TASK 7.40 — INDEX PERFORMANCE

The indexing process should be practical for a large project.

Track:

```text
Total files
Source files
Indexed files
Excluded files
Generation time
Output size
```

Do not optimize prematurely.

First obtain a working baseline.

---

# 44. TASK 7.41 — NO PRODUCTION DEPENDENCY

The index generator should not require:

```text
MongoDB
Razorpay
Firebase
Render
Vercel
Cloudflare
```

to generate the normal codebase indexes.

It should work locally from repository source/configuration.

This keeps the agent's basic intelligence available even when production is down.

---

# 45. TASK 7.42 — KNOWLEDGE INTEGRATION

Connect the new codebase indexes to the existing knowledge:

```text
PROJECT_CONTEXT
ARCHITECTURE
FEATURES
API_OVERVIEW
DATA_OVERVIEW
INFRASTRUCTURE
CONFLICTS
RUNTIME BASELINE
SECURITY RULES
```

Do not duplicate large sections.

Use references.

---

# 46. TASK 7.43 — UPDATE AGENT.MD

Add a section:

```text
## Codebase Intelligence Usage
```

It should explain:

```text
1. Read project context.
2. Identify task category.
3. Query the relevant index.
4. Locate target files.
5. Inspect direct dependencies.
6. Expand context only when justified.
7. Check protected paths.
8. Make minimal changes.
```

---

# 47. TASK 7.44 — CREATE INTELLIGENCE MANIFEST

Create:

```text
.uihub-agent/generated/
└── INTELLIGENCE_MANIFEST.json
```

It should identify:

```text
Index
Type
Generated/manual
Generator
Inputs
Version
Status
Last generation
```

Example:

```json
{
  "componentMap": {
    "type": "generated",
    "status": "fresh",
    "generator": "generate-component-map.mjs"
  }
}
```

---

# 48. TASK 7.45 — FINAL INTEGRITY CHECK

Before completion run:

```text
agent:index
agent:index:check
knowledge validation
secret scan
configuration validation
generated artifact validation
tests
builds
```

Do not weaken any existing gate.

Phase 6 reported 231/231 tests passing across the four suites, while frontend typecheck remained a known pre-existing failure. Preserve that distinction.

---

# 49. TASK 7.46 — DO NOT FIX FRONTEND TYPECHECK

The Phase 6 report records approximately 61 frontend typecheck errors across 23 files and explicitly attributes them to earlier UI commits.

Do not use Phase 7 as an excuse to fix those unrelated UI errors.

Document:

```text
KNOWN BASELINE ISSUE
```

and leave it for its own deliberate phase.

---

# 50. REQUIRED SUCCESS CRITERIA

Phase 7 is successful when an AI can answer:

```text
Where is the TemplateCard?
Who uses TemplateCard?
Which pages use TemplateCard?
Which hooks does TemplateCard use?
Which feature owns TemplateCard?
What services does it depend on?
Which files would be affected if TemplateCard changes?
Which tests cover it?
```

without scanning the entire repository.

It should also answer:

```text
Where is the authentication flow?
Where is the payment flow?
Where is the MCP tool registry?
Where is the admin dashboard?
What APIs does a page call?
What database collections does a service use?
What files are generated?
What files are protected?
```

from the intelligence layer plus targeted source inspection.

---

# 51. REQUIRED NEW FILE STRUCTURE

Expected structure:

```text
.uihub-agent/
│
├── codebase/
│   ├── CODEBASE_INTELLIGENCE.md
│   ├── COMPONENT_MAP.json
│   ├── PAGE_MAP.json
│   ├── ROUTE_MAP.json
│   ├── FEATURE_MAP.json
│   ├── HOOKS_MAP.json
│   ├── SERVICE_MAP.json
│   ├── API_MAP.json
│   ├── DATABASE_USAGE_MAP.json
│   ├── STORAGE_USAGE_MAP.json
│   ├── INTEGRATION_MAP.json
│   ├── FILE_ROLE_MAP.json
│   └── INTELLIGENCE_QUERIES.md
│
├── generated/
│   ├── IMPORT_GRAPH.json
│   ├── REVERSE_DEPENDENCY_MAP.json
│   ├── SYMBOL_INDEX.json
│   ├── FEATURE_FILE_INDEX.json
│   ├── PAGE_COMPONENT_INDEX.json
│   └── INTELLIGENCE_MANIFEST.json
│
├── tasks/
│   └── TASK_CATEGORY_CATALOG.md
│
└── scripts/
    ├── generate-map.mjs
    └── additional indexing scripts as required
```

Do not create unnecessary duplicate indexes.

---

# 52. REQUIRED FINAL REPORT

At the end of Phase 7, provide EXACTLY:

==================================================
UI HUB AGENT — PHASE 7 COMPLETION REPORT
========================================

PHASE:
7 — Codebase Intelligence, Component Mapping & Dependency Graph

STATUS:
COMPLETED / PARTIAL / BLOCKED

1. TASK UNDERSTANDING

---

Explain the objective.

2. SOURCE PRECEDENCE

---

Final precedence model.

3. CODEBASE SIZE

---

Total files:
Source files:
Indexed:
Excluded:

4. COMPONENT INTELLIGENCE

---

Components indexed:
Pages indexed:
Hooks indexed:
Services indexed:

5. ROUTE INTELLIGENCE

---

Frontend routes:
REST routes:
MCP routes:
Admin routes:

6. FEATURE INTELLIGENCE

---

Features indexed.

7. API INTELLIGENCE

---

Endpoints/tools indexed.

8. DATA INTELLIGENCE

---

Database usage:
Storage usage:
External integrations:

9. DEPENDENCY GRAPH

---

Import graph:
Reverse dependencies:
Impact analysis:

10. SYMBOL INDEX

---

Symbols indexed.

11. FILE ROLE CLASSIFICATION

---

Results.

12. TASK CATEGORY CATALOG

---

Categories created.

13. INDEX GENERATOR

---

Commands:
Generation result:
Check result:

14. INDEX FRESHNESS

---

Fresh / stale.

15. SECURITY VALIDATION

---

Secret scan result.

16. KNOWLEDGE VALIDATION

---

Result.

17. CROSS-REFERENCE VALIDATION

---

Result.

18. REAL TASK SIMULATIONS

---

For each simulation:
Files inspected:
Relevant:
Irrelevant:
Result:

19. PERFORMANCE

---

Generation time:
Output sizes:
Any concerns:

20. FILES CREATED

---

List all.

21. FILES MODIFIED

---

List all.

22. FILES DELETED

---

NONE or exact list.

23. APPLICATION SOURCE CHANGES

---

YES / NO

If YES, explain exactly.

24. PRODUCTION DATA CHANGES

---

YES / NO

Must normally be NO.

25. PRODUCTION DEPLOYMENT CHANGES

---

YES / NO

Must normally be NO.

26. SECRETS EXPOSED

---

YES / NO

Must be NO.

27. TEST RESULTS

---

Backend:
MCP:
CLI:
Frontend:
Knowledge:
Security:
Other:

28. BUILD RESULTS

---

Frontend:
MCP:
CLI:
Other:

29. TYPECHECK RESULTS

---

Frontend:
MCP:
CLI:
Backend:

30. REGRESSIONS

---

List all.

31. PHASE 6 FINDING STATUS

---

RESOLVED / PARTIAL / DEFERRED / OWNER REQUIRED

32. REMAINING HIGH-RISK ISSUES

---

List them.

33. REMAINING UNKNOWN AREAS

---

List them.

34. KNOWLEDGE FILES UPDATED

---

List all.

35. IMPORTANT ARCHITECTURAL DISCOVERIES

---

List new discoveries.

36. IMPORTANT DISCOVERIES FOR PHASE 8

---

List facts that should influence task routing/context loading.

37. FINAL GIT / DIFF REVIEW

---

Clean / reviewed / unexpected changes.

38. FINAL STATUS

---

COMPLETED / PARTIAL / BLOCKED

==================================================
END OF PHASE 7 REPORT
=====================

---

# 53. FINAL EXECUTION INSTRUCTION

Phase 7 builds the intelligence layer of the UI HUB Agent.

The objective is not to make UI HUB look different.

The objective is not to repair production.

The objective is to make future AI agents understand the codebase quickly and accurately.

The agent must prefer:

```text
INDEX
→ LOCATE
→ VERIFY
→ OPEN RELEVANT SOURCE
```

instead of:

```text
OPEN ENTIRE REPOSITORY
→ SEARCH EVERYTHING
```

Do not treat generated indexes as unquestionable truth.

Always preserve the source-precedence rules.

Do not convert guesses into facts.

Do not expose secrets.

Do not touch production data.

Do not change payment/authentication behavior.

Do not perform the unresolved Render/Vercel/Cloudflare owner decisions.

Do not fix the pre-existing frontend typecheck errors.

Do not perform the light-mode refactor.

At the end, update `.uihub-agent/`, validate all indexes, and provide the exact Phase 7 Completion Report.

The Phase 7 report will be reviewed before Phase 8 is designed.

END — UI HUB AGENT PHASE 7
