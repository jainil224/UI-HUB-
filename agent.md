# UI HUB AGENT — PHASE 5

## Production Connectivity, API Routing & Deployment Contract

**Phase:** 5 of 10
**Phase Name:** Production Connectivity, API Routing & Deployment Contract
**Status:** NOT STARTED

**Primary Goal:**
Eliminate ambiguity between Vercel, Render, Cloudflare, and the frontend API configuration; establish one documented and deterministic production API architecture; prepare and validate the repository for a safe deployment; and verify the real production connectivity after owner-controlled deployment actions.

---

# 1. PHASE OBJECTIVE

Phase 4 established several critical facts:

```text
Frontend static shell works.
Production API is not currently reachable.
Vercel /api/* has been failing.
Render API hosts are unavailable at the Cloudflare edge.
The frontend bundle contains a Render API host.
getApiBaseUrl() prefers VITE_API_URL in production.
Vercel therefore does not automatically become the browser's API destination.
```

The central problem is now:

```text
WHO SERVES THE FRONTEND?
        ↓
WHO SERVES THE WEB API?
        ↓
WHO SERVES MCP?
        ↓
WHICH URL DOES THE BROWSER USE?
        ↓
WHICH URL DOES MCP USE?
        ↓
WHICH DEPLOYMENT OWNS EACH SERVICE?
```

Phase 5 must answer these questions and make the repository behavior deterministic.

---

# 2. PHASE 5 CORE PRINCIPLE

Do not attempt to "fix production" by changing random URLs.

Instead:

```text
Map architecture
      ↓
Choose canonical ownership
      ↓
Make frontend routing deterministic
      ↓
Make deployment configuration consistent
      ↓
Validate locally
      ↓
Owner deploys
      ↓
Verify production
      ↓
Document final architecture
```

---

# 3. REQUIRED ARCHITECTURAL TARGET

The agent must determine whether the intended architecture is:

```text
OPTION A

Browser
  ↓
Vercel
  ├── Frontend
  └── /api → Backend


MCP Client
  ↓
Dedicated MCP service
  ↓
MCP Server
```

or another architecture already supported by the repository.

Do NOT select an architecture solely because it appears simpler.

Use:

```text
vercel.json
api/
frontend/src/services/
environment configuration
Render configuration
MCP configuration
backend/server.js
documentation
```

as evidence.

Once the intended architecture is verified, document it as the canonical architecture.

---

# 4. TASK 5.1 — AUDIT `getApiBaseUrl()`

Perform a complete audit of the frontend API base URL logic.

Find:

```text
getApiBaseUrl()
VITE_API_URL
API base constants
fetch wrappers
axios clients
REST service clients
hardcoded API hosts
environment-dependent API paths
```

Create a table:

```text
Source
Environment
Current behavior
Fallback
Consumer
Risk
```

Determine exactly why the production bundle contains the Render host.

---

# 5. TASK 5.2 — DEFINE THE PRODUCTION API DEFAULT

Do not blindly rely on:

```text
VITE_API_URL
```

Determine whether the normal web API should use:

```text
/api
```

as the production default.

If the repository architecture confirms that the Vercel serverless backend is intended to serve the web API, implement the smallest safe behavior:

```text
Production default
→ same-origin /api
```

Allow an external API URL only when explicitly configured.

Recommended conceptual behavior:

```text
development
→ local configured API if required

production
→ same-origin /api by default

external API
→ explicit opt-in configuration
```

Do not silently route production back to the unavailable Render service.

---

# 6. TASK 5.3 — PREVENT ENVIRONMENT OVERRIDE SURPRISES

The agent must determine whether:

```text
VITE_API_URL
```

is still needed.

Do not delete it merely because it caused the current problem.

Instead document:

```text
Why it exists
Who uses it
Which environments require it
What happens when it is absent
What happens when it is present
```

If the correct design is:

```text
VITE_API_URL = optional
```

then make that behavior explicit.

If the correct design requires the value in a particular environment, keep it and document the required value source.

---

# 7. TASK 5.4 — SEARCH FOR HARDCODED PRODUCTION HOSTS

Search the entire repository for:

```text
ui-hub.onrender.com
ui-hub-mcp.onrender.com
ui-hub-backend-mcp.onrender.com
VITE_API_URL
MCP_SERVER_URL
MCP_ALLOWED_ORIGINS
```

Classify every occurrence:

```text
ACTIVE
LEGACY
DOCUMENTATION
GENERATED
TEST
UNKNOWN
```

Do not change every occurrence automatically.

For each ACTIVE occurrence, determine whether it represents:

```text
Web API
MCP
Webhook
Monitoring
Documentation
```

---

# 8. TASK 5.5 — SEPARATE WEB API FROM MCP

Do not treat these as the same service.

Document the distinction:

```text
WEB API
→ REST endpoints used by the UI

MCP
→ MCP protocol used by AI clients
```

Determine:

```text
Who owns the web API?
Who owns MCP?
Which host serves each?
Does Vercel need MCP?
Does Render need the web API?
```

The Phase 4 report already established that the MCP deployment path and normal frontend API path are different concerns.

Do not combine them simply to reduce configuration.

---

# 9. TASK 5.6 — VERCEL ROUTING AUDIT

Phase 4 flagged a specific risk in:

```text
vercel.json
```

where:

```text
/api/(.*) → /api/index.js
```

could turn an intended API route into a 404 after deployment.

Perform a complete routing audit.

Verify:

```text
/api
/api/health
/api/v1/*
```

and the interaction among:

```text
rewrites
functions
filesystem routes
api/index.js
SPA fallback
```

Do not change routing until the actual behavior is mapped.

---

# 10. TASK 5.7 — VERIFY SPA FALLBACK DOES NOT MASK API FAILURES

The Phase 4 report discovered that:

```text
/health
```

on the frontend returns the same HTML shell as `/`.

This means SPA fallback can make a missing API endpoint look healthy.

The routing architecture must therefore clearly distinguish:

```text
Frontend route
```

from:

```text
API route
```

Ensure API requests cannot silently become the frontend HTML shell.

The desired behavior is:

```text
Unknown API route
→ API-style error / 404

Frontend route
→ SPA shell
```

Do not break legitimate React routes.

---

# 11. TASK 5.8 — LOCAL REPRODUCTION OF VERCEL ROUTING

Create a reproducible local validation procedure for the Vercel API architecture.

The procedure should verify:

```text
/api/health
/api/v1/*
frontend routes
unknown API route
unknown frontend route
```

Record the commands and expected results in:

```text
.uihub-agent/runtime/
└── VERCEL_ROUTING_BASELINE.md
```

The goal is that future changes can reproduce deployment routing behavior before pushing.

---

# 12. TASK 5.9 — MCP ENDPOINT CONTRACT

Document the canonical MCP endpoint separately.

Create:

```text
.uihub-agent/APIs/MCP_DEPLOYMENT_CONTRACT.md
```

Include:

```text
Canonical MCP service
Expected endpoint
Authentication
Allowed origins
Tool registry
Build source
Generated dist
Deployment owner
Health/verification method
```

Do not invent the final URL.

If the canonical MCP service remains unresolved because Render is unavailable:

```text
STATUS: OWNER ACTION REQUIRED
```

---

# 13. TASK 5.10 — RENDER SERVICE CONTRACT

The Render configuration must be compared against the actual expected service architecture.

Document:

```text
service name
service type
build command
start command
health path
environment requirements
MCP responsibility
backend responsibility
```

Do not create a new Render service merely because a hostname returns 404 or 503.

Do not delete an old service.

Do not rename services during this phase.

---

# 14. TASK 5.11 — CLOUDFLARE CONTRACT

Document what Cloudflare is supposed to do.

Determine:

```text
DNS
proxy
origin
TLS
challenge/security layer
API traffic
MCP traffic
```

Do not disable challenges or security controls merely to pass tests.

If the current configuration cannot be verified without dashboard access:

```text
OWNER ACTION REQUIRED
```

Record exactly what needs to be checked.

---

# 15. TASK 5.12 — ENVIRONMENT CONTRACT

Create:

```text
.uihub-agent/infrastructure/
└── ENVIRONMENT_CONTRACT.md
```

For each environment:

```text
Local
CI
Vercel
Render
```

document:

```text
Variable
Purpose
Required?
Public/private
Consumer
Status
```

Never record values.

Use:

```text
PRESENT
ABSENT
UNKNOWN
NOT REQUIRED
```

Never print secrets.

---

# 16. TASK 5.13 — FRONTEND BUILD VERIFICATION

After the API-base logic is finalized:

Run:

```text
npm run build
```

Then inspect the emitted bundle.

Verify:

```text
Old Render web API host
→ absent unless intentionally required

Unexpected production API host
→ absent

Expected API path
→ present

MCP-only host
→ only present in MCP-specific code/config where intended
```

This is important because Phase 4 proved that the actual browser bundle, rather than the source code alone, determines where the browser sends requests.

---

# 17. TASK 5.14 — GENERATED ARTIFACT VERIFICATION

The Phase 4 report found that `mcp-server/dist` had been stale and was actually what the deployed service would execute.

Phase 5 must ensure generated artifacts cannot silently diverge.

Verify:

```text
mcp-server/src
mcp-server/dist
generated JSON/data files
tool registry
```

and run:

```text
check-source-coverage
```

plus the actual MCP build.

Do not rely on `check-source-coverage` alone.

The build must regenerate what is supposed to be generated.

---

# 18. TASK 5.15 — TEST API ROUTING

Add or update tests where appropriate for:

```text
/api/health
unknown /api route
frontend fallback
production API base URL
development API base URL
explicit external API URL
missing VITE_API_URL
```

Tests must verify behavior rather than implementation details.

Do not remove existing tests.

---

# 19. TASK 5.16 — API BASE URL SAFETY TESTS

Add a focused test matrix:

```text
CASE 1
Production + no VITE_API_URL
→ same-origin /api

CASE 2
Production + explicit approved external URL
→ external API

CASE 3
Development + local API
→ local API

CASE 4
Production + stale legacy Render URL
→ behavior must be explicitly defined

CASE 5
Malformed URL
→ safe failure
```

Do not silently transform arbitrary user-provided environment values.

---

# 20. TASK 5.17 — PRODUCTION DEPLOYMENT GATE

Before deployment, create a checklist:

```text
Code build PASS
Typecheck PASS
Tests PASS
MCP build PASS
Generated data synchronized
API base URL verified
Vercel routing verified
Environment contract reviewed
No secrets exposed
No production data changes
```

Store it as:

```text
.uihub-agent/runtime/
└── PRODUCTION_DEPLOYMENT_GATE.md
```

---

# 21. TASK 5.18 — OWNER DEPLOYMENT ACTION

The agent must clearly identify actions that only the owner can perform.

At minimum:

```text
1. Configure/unset VITE_API_URL as determined by the verified architecture.
2. Deploy the current branch through the available Vercel integration.
3. Verify the Vercel deployment.
4. Restore/confirm the intended Render service if required.
5. Verify Cloudflare routing.
6. Open PR / merge according to repository workflow.
```

Do not pretend these have been completed by the coding agent.

---

# 22. TASK 5.19 — PRODUCTION VERIFICATION AFTER OWNER DEPLOYMENT

Once a real deployment exists, verify:

```text
GET /
GET /api/health
GET /api/v1/config/firebase
GET /api/v1/auth/me
```

Also verify:

```text
unknown API route
frontend route
```

Record:

```text
status
latency
response type
timestamp
```

Do not classify `/health` as successful if it returns HTML.

---

# 23. TASK 5.20 — BROWSER API DESTINATION VERIFICATION

Use a browser-level verification if available.

The goal is to observe the actual network destination of frontend API calls.

Verify:

```text
Browser
   ↓
Expected API host
   ↓
Expected endpoint
```

Make sure requests are not silently going to:

```text
old Render host
wrong MCP host
wrong environment
SPA fallback
```

This test is mandatory because Phase 4 proved that source/config inspection alone was insufficient.

---

# 24. TASK 5.21 — VERIFY AUTHENTICATION IN THE REAL DEPLOYMENT

Once the API is reachable, verify:

```text
No token
Invalid token
Expired token
Normal authenticated user
Admin
```

Verify at least:

```text
/api/v1/auth/me
protected REST route
admin route
broadcast route
```

Do not send real broadcasts.

Do not use real payment operations.

Do not expose tokens.

---

# 25. TASK 5.22 — VERIFY MCP IN THE REAL DEPLOYMENT

Once the intended MCP service is reachable:

```text
initialize
tools/list
```

Verify:

```text
14 expected tools
authentication
configuration
generated data
response correctness
```

If the MCP service remains unavailable:

```text
BLOCKED — OWNER ACTION REQUIRED
```

Do not fabricate a successful MCP verification.

---

# 26. TASK 5.23 — DO NOT MODIFY LIGHT MODE

The Phase 4 report proved that the light theme currently produces invisible text because of the interaction between:

```text
inline <style>
Vite stylesheet
html background
theme variables
dark variants
```

Do NOT fix this in Phase 5.

Do NOT introduce the full theme refactor.

Do NOT change `@custom-variant dark`.

Do NOT delete the light theme.

Record it as:

```text
DEFERRED
```

for the dedicated design-system/theme phase.

---

# 27. TASK 5.24 — DOCUMENT THE LIGHT-MODE DECISION

Update:

```text
.uihub-agent/runtime/PRODUCTION_BASELINE.md
.uihub-agent/design-system/DESIGN_SYSTEM.md
.uihub-agent/tasks/ACTIVE_TASK.md
```

State:

```text
Light mode is known to be inconsistent.
The issue is confirmed.
No Phase 5 change is made.
A future dedicated theme task is required.
```

Do not allow future agents to rediscover this as an unknown.

---

# 28. TASK 5.25 — RECHECK PRIOR FINDINGS

Before completing Phase 5:

Re-evaluate important previous findings against the new architecture.

Especially:

```text
Vercel MCP availability
Render API ownership
MCP_SERVER_URL
MCP_ALLOWED_ORIGINS
Health semantics
mcp-server/dist
Tailwind token status
Theme behavior
```

Do not preserve a finding merely because it existed in Phase 1–4.

---

# 29. TASK 5.26 — CREATE API ARCHITECTURE MAP

Create:

```text
.uihub-agent/APIs/API_ARCHITECTURE.md
```

It should show:

```text
Browser
  ↓
Canonical Web API
  ↓
Express
  ├── Authentication
  ├── MongoDB
  ├── Redis
  ├── Payments
  ├── Admin
  └── Other services

AI Client
  ↓
Canonical MCP Service
  ↓
MCP Server
  ↓
MCP Data/Registry
```

Include:

```text
canonical URL
fallback
environment
deployment owner
```

for each runtime surface.

---

# 30. TASK 5.27 — CREATE PRODUCTION CONNECTIVITY BASELINE

Create:

```text
.uihub-agent/runtime/
└── CONNECTIVITY_BASELINE.md
```

Track:

```text
Frontend
Web API
Health
Authentication
Admin
MCP
Database
Redis
Cloudflare
Vercel
Render
```

For each:

```text
Expected
Actual
Status
Evidence
Timestamp
```

---

# 31. SUCCESS CRITERIA

Phase 5 is successful when:

```text
1. The canonical web API is explicitly defined.
2. The canonical MCP service is explicitly defined or clearly marked owner-blocked.
3. getApiBaseUrl() behavior is deterministic.
4. VITE_API_URL behavior is documented and intentional.
5. No stale production API host is unintentionally embedded in the frontend.
6. Vercel routing behavior is understood and tested.
7. SPA fallback cannot masquerade as API health.
8. Environment requirements are documented.
9. MCP source/dist consistency is verified.
10. Local routing tests exist.
11. Production deployment gate exists.
12. Real production API behavior is verified after deployment.
13. Browser network behavior is verified.
14. Authentication works in the deployed environment.
15. MCP is verified or explicitly blocked by owner access.
16. Light mode remains intentionally deferred.
17. Previous findings have been reclassified using current evidence.
18. Production connectivity baseline is created.
19. No production data was modified.
20. No secrets were exposed.
```

---

# 32. STOP CONDITIONS

Stop a specific task when:

```text
Dashboard access is required.
Production environment values are unavailable.
Cloudflare behavior cannot be safely determined.
A service must be recreated.
A DNS change is required.
A production database mutation is proposed.
Payment behavior becomes involved.
An architecture decision cannot be inferred from repository evidence.
A routing change could break frontend navigation.
```

Use:

```text
OWNER ACTION REQUIRED
```

or:

```text
BLOCKED
```

rather than guessing.

---

# 33. FILES TO CREATE

Expected new files:

```text
.uihub-agent/
├── APIs/
│   ├── API_ARCHITECTURE.md
│   └── MCP_DEPLOYMENT_CONTRACT.md
│
├── infrastructure/
│   └── ENVIRONMENT_CONTRACT.md
│
└── runtime/
    ├── VERCEL_ROUTING_BASELINE.md
    ├── PRODUCTION_DEPLOYMENT_GATE.md
    └── CONNECTIVITY_BASELINE.md
```

Only create additional files when required by actual repository evidence.

---

# 34. KNOWLEDGE FILES TO UPDATE

Update where applicable:

```text
.uihub-agent/CONFLICTS.md
.uihub-agent/runtime/PRODUCTION_BASELINE.md
.uihub-agent/runtime/RUNTIME_VERIFICATION.md
.uihub-agent/runtime/UNKNOWN_REGISTER.md
.uihub-agent/tasks/ACTIVE_TASK.md
.uihub-agent/APIs/API_OVERVIEW.md
.uihub-agent/infrastructure/INFRASTRUCTURE.md
.uihub-agent/design-system/DESIGN_SYSTEM.md
.uihub-agent/PROJECT_MAP.json
```

Preserve historical findings.

Do not erase previous reports.

---

# 35. REQUIRED TEST MATRIX

At minimum:

```text
BUILD
PASS / FAIL

TYPECHECK
PASS / FAIL

UNIT TESTS
PASS / FAIL

API ROUTING
PASS / FAIL

SPA FALLBACK
PASS / FAIL

PRODUCTION API BASE URL
PASS / FAIL

MCP BUILD
PASS / FAIL

MCP REGISTRY
PASS / FAIL

GENERATED DATA
PASS / FAIL

BROWSER NETWORK TARGET
PASS / FAIL

PRODUCTION HEALTH
PASS / FAIL

AUTHENTICATION
PASS / FAIL

MCP PRODUCTION
PASS / FAIL / BLOCKED
```

---

# 36. REQUIRED FINAL SUMMARY

At the end of Phase 5, provide EXACTLY:

==================================================
UI HUB AGENT — PHASE 5 COMPLETION REPORT
========================================

PHASE:
5 — Production Connectivity, API Routing & Deployment Contract

STATUS:
COMPLETED / PARTIAL / BLOCKED

1. TASK UNDERSTANDING

---

Explain the purpose of Phase 5.

2. CANONICAL ARCHITECTURE

---

Web API:
MCP:
Frontend:
Database:
Other services:

3. API BASE URL AUDIT

---

Current behavior:
Production behavior:
Development behavior:
VITE_API_URL behavior:

4. HARDCODED HOST AUDIT

---

List production hosts found and their classifications.

5. VERCEL ROUTING

---

Explain final routing behavior.

6. SPA FALLBACK

---

Explain final frontend/API separation.

7. RENDER ARCHITECTURE

---

Verified service architecture.

8. CLOUDFLARE ARCHITECTURE

---

Verified role/status.

9. ENVIRONMENT CONTRACT

---

List variables as PRESENT / ABSENT / UNKNOWN only.

10. MCP DEPLOYMENT

---

Endpoint:
Status:
Authentication:
Tools:
Source/dist:

11. GENERATED ARTIFACTS

---

Build result and source/dist consistency.

12. API ROUTING TESTS

---

Results.

13. BROWSER NETWORK TEST

---

Actual API destination.

14. AUTHENTICATION TEST

---

Results.

15. PRODUCTION HEALTH

---

Actual result.

16. PRODUCTION STATUS

---

Frontend:
Backend:
MCP:
Database:
Redis:
Cloudflare:

17. LIGHT MODE

---

State explicitly that it was deferred.

18. OWNER ACTIONS

---

List all dashboard/deployment tasks still required.

19. BLOCKED TASKS

---

List anything that could not be verified.

20. TEST RESULTS

---

Backend:
MCP:
CLI:
Frontend:
Routing:
Other:

21. BUILD RESULTS

---

Frontend:
MCP:
CLI:
Other:

22. FILES CREATED

---

List all.

23. FILES MODIFIED

---

List all.

24. FILES DELETED

---

NONE or exact list.

25. PRODUCTION DATA CHANGES

---

YES / NO

26. SECRETS EXPOSED

---

YES / NO

Must be NO.

27. REGRESSIONS

---

List all.

28. PREVIOUS FINDINGS RECLASSIFIED

---

List important changes in status.

29. KNOWLEDGE BASE UPDATED

---

List all `.uihub-agent/` files updated.

30. IMPORTANT ARCHITECTURAL DISCOVERIES

---

Document newly verified architecture facts.

31. IMPORTANT DISCOVERIES FOR PHASE 6

---

List facts that should influence the next phase.

32. FINAL GIT / DIFF REVIEW

---

Clean / reviewed / unexpected changes.

33. FINAL STATUS

---

COMPLETED / PARTIAL / BLOCKED

==================================================
END OF PHASE 5 REPORT
=====================

---

# 37. FINAL EXECUTION INSTRUCTION

Phase 5 is about making UI HUB's production connectivity understandable and deterministic.

Do not assume that:

```text
Vercel
=
Web API

Render
=
MCP

Cloudflare
=
correctly configured
```

until evidence confirms it.

Do not rely on:

```text
HTML 200
```

as proof of API health.

Do not rely on source code alone to determine browser API destinations.

Inspect the emitted production bundle.

Do not expose secrets.

Do not modify production data.

Do not send real broadcasts.

Do not perform payment transactions.

Do not disable security controls merely to make connectivity succeed.

Do not make broad UI/theme changes.

When owner-only access is required, record the exact owner action rather than guessing.

At the end, update the `.uihub-agent/` knowledge system and provide the exact Phase 5 Completion Report.

The Phase 5 report will be reviewed before Phase 6 is designed.

END — UI HUB AGENT PHASE 5
