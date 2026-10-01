# UI HUB AGENT — PHASE 6

## Security, Configuration & Agent-Governance Hardening

**Phase:** 6 of 10
**Phase Name:** Security, Configuration & Agent-Governance Hardening
**Status:** NOT STARTED

**Primary Goal:**
Harden the UI HUB repository against configuration drift, ineffective security controls, documentation drift, accidental secret exposure, and agent-generated regressions while preserving the existing application behavior and the verified test/build baseline.

---

# 1. PHASE OBJECTIVE

Phase 5 established the current production topology and identified several risks that are independent of the unresolved deployment outage:

```text
1. CORS is not actually enforcing its allowlist.
2. Documentation can advertise endpoints that the deployment cannot serve.
3. Secrets can visually resemble placeholders and evade naive scanning.
4. .uihub-agent/ and .github/ can become untracked because of ignore rules.
5. Multiple deployment descriptors can disagree.
6. Generated artifacts can become stale.
7. The agent can accidentally modify protected architectural surfaces.
```

The goal of Phase 6 is to turn these into enforceable repository-level controls.

The phase should make UI HUB safer to maintain with OpenCode, Antigravity, and future coding agents.

---

# 2. CORE PRINCIPLE

Phase 6 is a **hardening phase**, not a redesign phase.

The workflow is:

```text
Current risk
    ↓
Verify exact behavior
    ↓
Define intended invariant
    ↓
Add automated protection
    ↓
Add regression tests
    ↓
Document the rule
    ↓
Validate
```

Do not make a large architectural change merely because a smaller invariant can solve the problem.

---

# 3. IMPORTANT SCOPE BOUNDARY

## IN SCOPE

* CORS enforcement
* Security regression tests
* Secret scanning
* Documentation endpoint validation
* Deployment configuration consistency checks
* Git tracking/ignore hygiene
* Generated-artifact freshness checks
* Agent-protection rules
* Configuration validation
* CI hardening
* Knowledge-base governance
* Protected-path checks

## OUT OF SCOPE

Do NOT:

* Redeploy production
* Recreate Render services
* Change Cloudflare settings
* Change DNS
* Modify production MongoDB data
* Perform payment operations
* Modify the production environment directly
* Refactor the entire backend
* Rewrite Express
* Rewrite authentication
* Perform the full theme refactor
* Redesign the UI
* Replace MongoDB/Firebase/Razorpay/MCP
* Choose between conflicting Render blueprints without owner authorization

---

# 4. REQUIRED BASELINE

Before any code change, record:

```text
Backend tests
MCP tests
CLI tests
Frontend tests
Frontend build
MCP build
CLI build
Frontend typecheck
```

The previous baseline was:

```text
Backend: 54/54
MCP: 78/78
CLI: 30/30
Frontend: 27/27
Frontend build: PASS
MCP build: PASS
CLI build: PASS
```

If any baseline differs before modifications:

```text
STOP
RECORD DIFFERENCE
DO NOT ATTRIBUTE IT TO PHASE 6
```

---

# 5. TASK 6.1 — CORS BEHAVIOR AUDIT

Phase 5 verified that the current CORS callback logs blocked origins but still calls:

```text
callback(null, true)
```

which means the allowlist does not actually block the request.

First inspect:

```text
backend/src/server.js
MCP_ALLOWED_ORIGINS
CORS middleware
Frontend origin
MCP origin
Development origins
```

Determine:

```text
Web API CORS policy
MCP CORS policy
Development policy
Production policy
```

Do not immediately implement a generic wildcard solution.

---

# 6. TASK 6.2 — DEFINE THE CORS INVARIANT

Document the desired behavior.

At minimum:

```text
Allowed origin
→ request permitted

Disallowed origin
→ request rejected

Missing Origin
→ defined explicitly

Development localhost
→ defined explicitly

Malformed origin
→ rejected safely
```

Determine whether credentials/cookies are involved.

Do not enable:

```text
Access-Control-Allow-Origin: *
```

when credentialed requests are required.

---

# 7. TASK 6.3 — IMPLEMENT CORS ENFORCEMENT

Implement the smallest safe change that makes the existing allowlist meaningful.

Requirements:

```text
Allowed origins are accepted.
Unauthorized origins are rejected.
Existing legitimate frontend traffic continues to work.
```

Do not silently broaden the allowlist.

Do not add arbitrary origins just to make tests pass.

Do not modify MCP and Web API policies as though they were automatically identical.

---

# 8. TASK 6.4 — ADD CORS REGRESSION TESTS

Create tests covering:

```text
Allowed production origin
Allowed development origin
Unknown origin
Malformed origin
No Origin header
Multiple configured origins
Whitespace around origin
Duplicate origins
```

The exact cases should reflect the implementation.

The test suite must verify actual middleware behavior, not just the configuration string.

---

# 9. TASK 6.5 — DOCUMENT CORS CONTRACT

Create:

```text
.uihub-agent/APIs/CORS_CONTRACT.md
```

Include:

```text
API surface
Allowed origins
Development exceptions
Credential behavior
MCP behavior
Environment variables
Failure behavior
Testing method
```

Do not record secret values.

Use:

```text
PRESENT
ABSENT
CONFIGURED
NOT CONFIGURED
```

where appropriate.

---

# 10. TASK 6.6 — SECRET SCANNING SYSTEM

Phase 5 found a live-looking MongoDB password inside placeholder-shaped knowledge-base documentation. The report notes that ordinary placeholder-looking text was not sufficient to identify it, and a value-shaped scan caught it.

Create a repository-level secret scanning mechanism.

It must inspect at least:

```text
Source
Configuration
Documentation
.uihub-agent/
.github/
Examples
Markdown
JSON
YAML
```

Detect patterns such as:

```text
MongoDB connection strings
AWS-style credentials
API keys
Private keys
Firebase private credentials
Razorpay secrets
SMTP credentials
Bearer tokens
Webhook secrets
VAPID private keys
```

Do not attempt to prove that every arbitrary secret is detectable.

Document the known limitations.

---

# 11. TASK 6.7 — SECRET-SCAN FALSE-POSITIVE RULES

The scanner must avoid treating obvious safe examples as real secrets.

Classify:

```text
REAL SECRET
PLACEHOLDER
MASKED EXAMPLE
PUBLIC IDENTIFIER
TEST FIXTURE
FALSE POSITIVE
```

Examples such as:

```text
<password>
<user>
<REDACTED>
example.com
uh_live_xxxxx
```

must be handled according to explicit rules.

Do not create a scanner that simply reports every URI as a leak.

---

# 12. TASK 6.8 — CI SECRET GATE

Integrate the secret scanner into CI.

Requirements:

```text
Secret detected
→ CI fails

No secret detected
→ CI continues
```

The scanner must run before potentially publishing artifacts.

Do not print the matched secret into CI logs.

Output only:

```text
file
line/category where safe
detector
redacted fingerprint or type
```

Never print the actual value.

---

# 13. TASK 6.9 — GITIGNORE / TRACKING AUDIT

Phase 5 found that `.uihub-agent/` and `.github/` were previously ignored, which made important project knowledge and CI configuration effectively untrackable.

Audit:

```text
.gitignore
global ignore assumptions
.uihub-agent/
.github/
generated files
environment examples
CI workflows
agent files
```

The result must ensure:

```text
Agent knowledge
CI workflows
Important project rules
```

are intentionally trackable.

---

# 14. TASK 6.10 — CREATE TRACKING INVARIANTS

Create a repository validation script that verifies:

```text
.uihub-agent/ is tracked/trackable
.github/workflows/ is trackable
AGENT files are trackable
environment secrets remain ignored
build output remains ignored where appropriate
generated artifacts are handled intentionally
```

Do not force every generated file into git.

Document the intended tracking model.

---

# 15. TASK 6.11 — DOCUMENTATION ENDPOINT AUDIT

Phase 5 discovered that documentation advertised a Vercel `/mcp` endpoint even though the Vercel deployment cannot serve it.

Search all documentation:

```text
README
MCP.md
API docs
.uihub-agent/
comments
examples
deployment docs
```

for:

```text
URLs
routes
hosts
API endpoints
MCP endpoints
```

Classify:

```text
VALID
INVALID
OUTDATED
ENVIRONMENT-SPECIFIC
UNKNOWN
```

---

# 16. TASK 6.12 — DOCUMENTATION DRIFT CHECK

Build a lightweight validator for high-value deployment claims.

Examples:

```text
Documented web API endpoint
↔ vercel.json

Documented MCP endpoint
↔ MCP deployment contract

Documented frontend domain
↔ deployment configuration

Documented route
↔ actual route registration
```

Do not attempt to automatically verify every sentence in Markdown.

Focus on machine-checkable claims.

---

# 17. TASK 6.13 — DEPLOYMENT-CONFIGURATION CONSISTENCY

Phase 5 found two conflicting Render blueprints:

```text
render.yaml
mcp-server/render.yaml
```

with different services and admin lists.

Do NOT choose one automatically.

Instead create:

```text
.uihub-agent/infrastructure/DEPLOYMENT_CONFLICTS.md
```

Record:

```text
File
Service
Purpose
Difference
Conflict
Owner decision required
```

Add a machine-checkable warning so future agents cannot accidentally assume both are authoritative.

---

# 18. TASK 6.14 — DEFINE CONFIGURATION OWNERSHIP

For each major configuration source:

```text
vercel.json
render.yaml
mcp-server/render.yaml
package.json
environment variables
API config
MCP config
```

document:

```text
Owner
Scope
Environment
Source of truth
Generated or manual
```

Create:

```text
.uihub-agent/infrastructure/CONFIGURATION_OWNERSHIP.md
```

---

# 19. TASK 6.15 — GENERATED ARTIFACT GUARD

Phase 5 confirmed that `mcp-server/dist` can become stale and that the tracked generated artifact can differ from source. It also established that the normal source-coverage check alone does not prove generated-data freshness.

Create a validation step that:

```text
Builds generated artifacts
↓
Compares expected files
↓
Detects stale tracked output
↓
Fails when source and generated output diverge
```

Do not silently modify generated files during validation.

Use a clearly named generation command for actual regeneration.

---

# 20. TASK 6.16 — PREVENT MANUAL EDITS TO GENERATED MCP DATA

Document protected generated paths:

```text
mcp-server/dist/
mcp-server/src/data/
```

where appropriate.

The rule should explain:

```text
Edit source
→ regenerate
→ validate
```

not:

```text
Edit generated output manually
```

Add an agent rule in:

```text
.uihub-agent/rules/DO_NOT_CHANGE.md
```

---

# 21. TASK 6.17 — AGENT PROTECTED-PATH SYSTEM

The coding AI should know which paths require extra caution.

Create:

```text
.uihub-agent/rules/PROTECTED_PATHS.md
```

Classify paths:

```text
CRITICAL
HIGH RISK
GENERATED
DOCUMENTATION
SAFE / NORMAL
```

Potential critical areas:

```text
paymentRoutes.js
accessService.js
authentication
server.js
database mutation scripts
deployment configuration
MCP authentication
```

Use the existing Phase 1/3 protected-path knowledge as the starting point.

---

# 22. TASK 6.18 — PRE-CHANGE IMPACT CHECK

Add an agent rule requiring:

```text
Before changing a protected path:
1. Search consumers.
2. Identify dependencies.
3. Check protected invariants.
4. Run targeted tests.
5. Make the smallest change.
```

The objective is to prevent future agents from blindly modifying load-bearing code.

---

# 23. TASK 6.19 — POST-CHANGE KNOWLEDGE REQUIREMENT

Add a rule stating:

```text
Architecture change
→ update architecture knowledge

API change
→ update API knowledge

Feature change
→ update feature knowledge

Deployment change
→ update infrastructure knowledge

Protected-path change
→ update relevant safety documentation
```

This prevents `.uihub-agent/` from becoming stale.

---

# 24. TASK 6.20 — CI GOVERNANCE

Phase 5 created four CI jobs but discovered the frontend typecheck currently fails from pre-existing UI commits, even though builds pass.

Do NOT simply remove the typecheck job.

Instead ensure CI distinguishes:

```text
BUILD
TEST
TYPECHECK
SECURITY SCAN
KNOWLEDGE VALIDATION
```

A failure in one must not be mislabeled as success in another.

---

# 25. TASK 6.21 — TYPECHECK BASELINE CLARIFICATION

Document the current state:

```text
Frontend build: PASS
Frontend typecheck: FAIL
```

and record that the typecheck failure originated from earlier UI commits, not Phase 6.

Do not fix those unrelated UI errors in Phase 6 unless they directly block the CI architecture.

---

# 26. TASK 6.22 — KNOWLEDGE-BASE VALIDATION

Create a validation command that checks:

```text
PROJECT_MAP.json parses
references resolve
required knowledge files exist
no required section is missing
generated files are fresh
no prohibited secrets exist
deployment docs do not claim impossible endpoints
```

The goal is:

```text
.uihub-agent/
=
validated engineering knowledge
```

rather than a collection of unchecked Markdown files.

---

# 27. TASK 6.23 — KNOWLEDGE FILE FRESHNESS

Determine which files are:

```text
GENERATED
SEMI-AUTOMATIC
MANUAL
```

Document the update mechanism.

For example:

```text
PROJECT_MAP.json
→ generated

ARCHITECTURE.md
→ manual

DEPLOYMENT_MAP.md
→ manual + verified

BASELINE.md
→ measured

CONFLICTS.md
→ append/update with evidence
```

---

# 28. TASK 6.24 — AGENT SOURCE-PRECEDENCE RULE

Strengthen `AGENT.md` with an explicit evidence hierarchy:

```text
Current runtime evidence
>
Current source/configuration
>
Generated index
>
Current documentation
>
Historical documentation
>
Assumption
```

When two sources disagree:

```text
Do not silently choose.
Record the conflict.
```

This is important because earlier phases already corrected several false assumptions.

---

# 29. TASK 6.25 — AUTOMATED CONFLICT DETECTION

Add validation for known high-value conflicts:

```text
Frontend API host
Vercel routing
MCP endpoint
Render blueprint
MCP tool registry
Environment contract
Generated MCP data
```

The validator should report:

```text
CONSISTENT
CONFLICT
UNKNOWN
```

Do not make the validator attempt automatic fixes.

---

# 30. TASK 6.26 — OWNER-DECISION REGISTER

Create:

```text
.uihub-agent/tasks/OWNER_DECISIONS.md
```

Record decisions that cannot safely be made by the coding agent.

Current examples:

```text
Production VITE_API_URL
Vercel deployment/root cause
Render blueprint ownership
Cloudflare configuration
CORS production policy
Mongo credential rotation
Light-mode architecture
```

For each:

```text
Decision
Why required
Options discovered
What the agent must not assume
Current status
```

Do not recommend a political or business decision; these are engineering ownership decisions.

---

# 31. TASK 6.27 — SAFE CONFIGURATION EXAMPLE POLICY

Audit:

```text
.env.example
README examples
MCP docs
deployment examples
```

Every example must contain:

```text
safe placeholders
```

and never:

```text
real host credentials
real passwords
real private keys
real webhook secrets
```

Use realistic structure but fake values.

---

# 32. TASK 6.28 — SECURITY DOCUMENTATION

Create:

```text
.uihub-agent/security/
├── SECURITY_OVERVIEW.md
├── SECRET_HANDLING.md
└── SECURITY_VALIDATION.md
```

Document:

```text
Authentication
Authorization
CORS
Secret handling
MCP authentication
Payment security boundaries
Production-data rules
CI security
Agent security rules
```

Do not duplicate every technical detail already documented elsewhere.

Link to the existing knowledge files.

---

# 33. TASK 6.29 — NO PRODUCTION DATA CHANGES

Phase 6 must maintain:

```text
Production writes = 0
```

Do not:

```text
update users
update payments
update entitlements
update MCP configuration
create indexes
delete data
```

unless separately authorized by the owner.

---

# 34. TASK 6.30 — FINAL SECURITY REGRESSION

Run:

```text
tests
builds
typechecks
secret scan
documentation validation
configuration validation
generated-artifact validation
git tracking validation
```

Then inspect:

```text
git diff
git status
tracked/untracked files
CI workflow
```

No unexpected application changes should remain.

---

# 35. REQUIRED SUCCESS CRITERIA

Phase 6 is successful when:

```text
1. CORS actually enforces its configured policy.
2. CORS behavior is covered by tests.
3. Secret scanning exists and runs safely.
4. Secret scanning is integrated into CI.
5. No secret appears in repository documentation.
6. .uihub-agent/ is intentionally trackable.
7. .github/workflows is intentionally trackable.
8. Environment secrets remain ignored.
9. Documentation endpoints are checked for drift.
10. Deployment conflicts are documented.
11. Configuration ownership is documented.
12. Generated MCP artifacts have freshness validation.
13. Generated paths have explicit agent protection.
14. Protected-path rules exist.
15. Agent pre-change impact checks are documented.
16. Agent post-change knowledge updates are documented.
17. Knowledge-base validation exists.
18. Configuration conflict validation exists.
19. Owner decisions are formally tracked.
20. No production data is changed.
21. No secrets are exposed.
22. Existing test/build behavior is preserved except for explicitly documented baseline issues.
```

---

# 36. REQUIRED NEW FILE STRUCTURE

Expected additions:

```text
.uihub-agent/
│
├── APIs/
│   └── CORS_CONTRACT.md
│
├── infrastructure/
│   ├── DEPLOYMENT_CONFLICTS.md
│   └── CONFIGURATION_OWNERSHIP.md
│
├── security/
│   ├── SECURITY_OVERVIEW.md
│   ├── SECRET_HANDLING.md
│   └── SECURITY_VALIDATION.md
│
├── rules/
│   └── PROTECTED_PATHS.md
│
└── tasks/
    └── OWNER_DECISIONS.md
```

Only create additional files when required by actual implementation.

---

# 37. REQUIRED AUTOMATION / SCRIPTS

Add appropriate repository scripts for:

```text
secret scan
knowledge validation
configuration validation
deployment-doc validation
generated-artifact validation
git tracking validation
```

Use clear names.

For example:

```text
npm run check:secrets
npm run check:knowledge
npm run check:config
npm run check:generated
```

Do not invent names if the existing repository uses another convention.

---

# 38. REQUIRED FINAL REPORT

At the end of Phase 6, provide EXACTLY:

==================================================
UI HUB AGENT — PHASE 6 COMPLETION REPORT
========================================

PHASE:
6 — Security, Configuration & Agent-Governance Hardening

STATUS:
COMPLETED / PARTIAL / BLOCKED

1. TASK UNDERSTANDING

---

Explain the purpose of Phase 6.

2. CORS AUDIT

---

Current behavior:
Desired behavior:
Implementation:
Tests:

3. SECURITY CHANGES

---

List all security changes.

4. SECRET SCANNING

---

Scanner:
Patterns:
False-positive handling:
CI integration:
Result:

5. GIT / TRACKING HYGIENE

---

.uihub-agent:
.github:
Environment files:
Generated files:

6. DOCUMENTATION DRIFT

---

Endpoints checked:
Invalid/outdated claims:
Corrections:

7. CONFIGURATION OWNERSHIP

---

Summarize the final ownership map.

8. DEPLOYMENT CONFLICTS

---

List unresolved conflicts.

9. GENERATED ARTIFACT VALIDATION

---

Results.

10. AGENT PROTECTED PATHS

---

List protected categories.

11. AGENT PRE-CHANGE RULES

---

Summarize.

12. AGENT POST-CHANGE RULES

---

Summarize.

13. KNOWLEDGE VALIDATION

---

Results.

14. CONFIGURATION VALIDATION

---

Results.

15. OWNER DECISIONS

---

List unresolved decisions.

16. TEST RESULTS

---

Backend:
MCP:
CLI:
Frontend:
Security:
Knowledge:
Other:

17. TYPECHECK RESULTS

---

Frontend:
MCP:
CLI:
Backend:

18. BUILD RESULTS

---

Frontend:
MCP:
CLI:

19. PRODUCTION DATA CHANGES

---

YES / NO

20. PRODUCTION DEPLOYMENT CHANGES

---

YES / NO

21. SECRETS EXPOSED

---

YES / NO

Must be NO.

22. REGRESSIONS

---

List all.

23. FILES CREATED

---

List all.

24. FILES MODIFIED

---

List all.

25. FILES DELETED

---

NONE or exact list.

26. PHASE 5 FINDING STATUS

---

RESOLVED / PARTIAL / DEFERRED / OWNER REQUIRED / INVALID

27. REMAINING HIGH-RISK ISSUES

---

List them.

28. REMAINING UNKNOWN AREAS

---

List them.

29. KNOWLEDGE BASE UPDATED

---

List all updated files.

30. IMPORTANT SECURITY DISCOVERIES

---

List major discoveries.

31. IMPORTANT DISCOVERIES FOR PHASE 7

---

List facts that should influence Phase 7.

32. FINAL GIT / DIFF REVIEW

---

Clean / reviewed / unexpected changes.

33. FINAL STATUS

---

COMPLETED / PARTIAL / BLOCKED

==================================================
END OF PHASE 6 REPORT
=====================

---

# 39. FINAL EXECUTION INSTRUCTION

Phase 6 is a security and governance hardening phase.

Do not treat security as documentation only.

Where a control claims to exist:

```text
test the actual behavior.
```

Do not treat configuration as effective merely because a variable or allowlist exists.

Do not expose secrets while testing the secret scanner.

Do not modify production data.

Do not make deployment decisions that require owner authorization.

Do not resolve the conflicting Render blueprints by guessing.

Do not perform the light-mode refactor.

Do not perform broad application refactoring.

Do not weaken tests or CI gates to obtain green status.

The objective is to make future AI-driven development safer, more deterministic, and easier to audit.

At the end, update `.uihub-agent/` and provide the exact Phase 6 Completion Report.

END — UI HUB AGENT PHASE 6
