# Build UI HUB MCP Admin Dashboard

I already have an existing product called **UI HUB** with:

* Existing frontend
* Existing backend
* Existing authentication
* Existing database
* Existing user dashboard
* Existing admin authentication
* Deployed MCP server
* MCP API-key system
* Super Admin account

The UI HUB website is:

https://ui-hub-design.vercel.app/

I now want you to build a complete **MCP Admin Dashboard** for UI HUB.

The Super Admin account is:

[jainil11199@gmail.com](mailto:jainil11199@gmail.com)

This dashboard is ONLY for authorized administrators.

IMPORTANT:

* Do NOT rebuild the existing UI HUB website.
* Do NOT replace the existing dashboard.
* Do NOT change the existing authentication system unnecessarily.
* Do NOT create a second authentication system.
* Do NOT create fake analytics.
* Use real data from the existing backend/database/MCP server.
* Reuse existing UI components and design system wherever possible.
* Follow the current UI HUB visual language.
* Make the dashboard responsive.
* Desktop should be the primary experience.
* Tablet/mobile must remain usable.
* All sensitive admin operations must be protected by backend authorization.
* Never expose API secrets in the frontend.

---

# 1. MCP ADMIN DASHBOARD ROUTE

Create a dedicated admin section:

/admin/mcp

If the existing application uses another admin routing structure, integrate with it instead of creating a conflicting route.

The dashboard must only be accessible to:

SUPER_ADMIN / authorized administrators.

The backend must independently verify admin permissions.

---

# 2. DESIGN DIRECTION

The dashboard should feel like a modern SaaS developer platform.

Design characteristics:

* Clean
* Premium
* Professional
* Minimal
* Developer-focused
* Data-rich
* Modern
* Fast
* Easy to scan

Use the existing UI HUB:

* Colors
* Typography
* Border radius
* Shadows
* Cards
* Buttons
* Icons
* Spacing
* Dark/light mode if already supported

Do not introduce a completely different visual identity.

Use subtle animations only where useful.

Avoid excessive gradients, glassmorphism, or unnecessary decoration.

---

# 3. ADMIN SIDEBAR

Create a dedicated MCP Admin navigation.

Sidebar:

UI HUB

MCP ADMIN

├── Overview
├── Analytics
├── MCP Users
├── API Keys
├── Tools
├── Playground
├── Components
├── Search Analytics
├── Logs
├── Security
├── Server Health
├── Alerts
└── Settings

Include:

* Active page indicator
* Icons
* Collapsible sidebar
* Responsive mobile navigation
* Admin profile section

Admin profile:

Jainil Patel
Super Admin
[jainil11199@gmail.com](mailto:jainil11199@gmail.com)

---

# 4. MCP OVERVIEW

Create:

/admin/mcp

The Overview page should provide a complete snapshot of the MCP system.

Top KPI cards:

### Total Requests

Total MCP requests.

### Requests Today

Number of requests today.

### Active Users

Users who have recently used MCP.

### Active API Keys

Currently active API keys.

### Error Rate

Percentage of failed MCP requests.

### Average Response Time

Average MCP response latency.

### Server Status

Show:

● Operational

or:

● Degraded

or:

● Offline

Use real health data.

---

# 5. OVERVIEW CHARTS

Add:

### MCP Requests

Line chart:

Requests over time.

Allow:

* 24 hours
* 7 days
* 30 days
* 90 days

### Users

Show:

* Active users
* New MCP users
* Returning users

### Free vs Pro

Chart comparing MCP usage between:

Free users
Pro users

### Error Rate

Show MCP errors over time.

Use real backend data.

---

# 6. LIVE ACTIVITY

Add a real-time/recent MCP activity panel.

Example:

```text
Recent Activity

● 2 sec ago
Pro user searched "pricing card"

● 14 sec ago
Component code requested

● 31 sec ago
API key created

● 1 min ago
Rate limit exceeded

● 2 min ago
Premium access denied
```

Do not show sensitive information.

Allow:

[View All Logs]

---

# 7. MCP TOOLS PAGE

Create:

/admin/mcp/tools

Display every MCP tool.

Example:

```text
search_components
Search UI HUB components

Status: ● Enabled
Requests: 48,291
Avg Response: 124ms

[View Analytics]
[Disable]
```

Tools should include:

* search_components
* get_component
* get_component_code
* search_templates
* get_template
* search_animations
* get_animation_code
* list_categories
* get_dependencies

For each tool show:

* Name
* Description
* Status
* Total requests
* Requests today
* Error rate
* Average response time
* Last used

Allow Super Admin to:

* Enable
* Disable
* View usage

A disabled tool must actually be disabled at the backend/MCP level.

Do not implement a frontend-only toggle.

---

# 8. MCP ANALYTICS

Create:

/admin/mcp/analytics

Include detailed analytics.

Metrics:

* Requests
* Unique users
* API key usage
* Tool usage
* Response time
* Error rate
* Rate limits
* Premium requests
* Free requests
* Pro requests

Filters:

* Date range
* Tool
* User plan
* Status
* Component
* Template
* Animation

---

# 9. TOOL ANALYTICS

Show a ranking:

```text
Tool                     Requests

search_components         48,291
get_component             32,821
get_component_code        28,932
search_templates            8,421
get_template                4,821
search_animations           1,921
```

Add charts for tool usage.

---

# 10. MCP USERS

Create:

/admin/mcp/users

Display:

* User
* Email
* Plan
* MCP requests
* API keys
* Last activity
* Status

Search:

* Name
* Email
* User ID

Filters:

* Free
* Pro
* Suspended
* Active

User detail page:

```text
User

Name
Email
Plan
MCP Requests
API Keys
Last Activity

Tools Used

Top Components

Recent Activity
```

Admin actions:

* View activity
* Revoke API keys
* Suspend MCP access

All actions must call protected backend APIs.

---

# 11. API KEY MANAGEMENT

Create:

/admin/mcp/api-keys

Display:

* Key prefix
* User
* Plan
* Created
* Last used
* Status
* Request count

Example:

```text
uh_live_••••••••

User: John
Plan: Pro
Created: Aug 28
Last Used: 2 minutes ago
Status: Active
```

Actions:

* Revoke
* Disable
* View usage

IMPORTANT:

Never display complete API keys.

Never expose API-key secrets through frontend API responses.

---

# 12. COMPONENT ANALYTICS

Create:

/admin/mcp/components

Show the most requested UI HUB components.

Example:

```text
#1 Pricing Card
8,921 requests

#2 Hero Section
7,321 requests

#3 Dashboard Sidebar
6,821 requests

#4 Login Form
5,421 requests
```

Show:

* Search count
* Code retrieval count
* Unique users
* Free requests
* Pro requests
* Premium requests
* Conversion-related metrics if available

Add:

Most Popular
Most Searched
Most Code Retrieved
Least Used

---

# 13. SEARCH ANALYTICS

Create:

/admin/mcp/search

Show what developers search for.

Example:

```text
Search Query                Requests

pricing card                  8,291
modern dashboard              6,921
animated hero                 5,821
login page                    4,821
glassmorphism card            3,921
```

Show:

* Search volume
* Zero-result searches
* Popular categories
* Popular tags
* Search trends

IMPORTANT:

Do not store unnecessary private user information.

---

# 14. ZERO-RESULT SEARCHES

Create a section:

### What developers can't find

Example:

```text
Search query                 Searches

"3D pricing section"            821
"AI dashboard"                  712
"animated checkout"             621
```

This helps the UI HUB team understand what components to build next.

Add:

[Create Component]

button if the existing component management system supports it.

---

# 15. MCP PLAYGROUND

Create:

/admin/mcp/playground

This is an important feature.

Build an interactive MCP testing interface.

Layout:

```text
MCP Playground

Tool:
[ search_components ▼ ]

Input:

{
  "query": "pricing card"
}

[ Run Tool ]

────────────────────────

Response

{
  "results": [...]
}
```

Allow admins to:

* Select MCP tool
* Enter parameters
* Execute tool
* View response
* View execution time
* View status
* Copy response
* Format JSON

Use the actual MCP server/API.

Do not fake responses.

---

# 16. MCP LOGS

Create:

/admin/mcp/logs

Display:

* Timestamp
* Tool
* User
* API key prefix
* Status
* Response time
* Error

Example:

```text
12:31:21
search_components
Pro User
200
142ms

12:31:25
get_component_code
Free User
403
Premium Access Required

12:31:29
search_components
User
429
Rate Limit
```

Filters:

* Success
* 400
* 401
* 403
* 404
* 429
* 500

Search logs by:

* User
* Tool
* Component
* API key prefix

Do not show API secrets.

---

# 17. SECURITY DASHBOARD

Create:

/admin/mcp/security

Show:

### Authentication failures

Invalid API keys.

### Rate-limit events

Users exceeding limits.

### Unauthorized premium access

Attempts to access premium components without permission.

### Suspicious activity

Unusual request patterns.

Provide actions:

* Revoke API key
* Suspend MCP access
* View user activity

Do not automatically ban users without a clearly defined backend rule.

---

# 18. SERVER HEALTH

Create:

/admin/mcp/health

Show:

```text
MCP SERVER

● ONLINE

Uptime
99.98%

Response Time
142ms

Requests/sec
28.4

CPU
31%

Memory
42%

Database Latency
38ms
```

Use real monitoring data where available.

Also show:

* Server version
* Deployment version
* Last deployment
* Environment
* Database status
* MCP endpoint

Health endpoint:

/health

MCP endpoint:

/mcp

---

# 19. ALERTS

Create:

/admin/mcp/alerts

Show alerts such as:

```text
🚨 MCP error rate exceeded 5%

⚠️ Response time above 1 second

⚠️ Unusual request spike

🚨 MCP server unavailable

⚠️ Repeated authentication failures
```

Allow:

* Mark as resolved
* View details
* Filter alerts

---

# 20. MCP SETTINGS

Create:

/admin/mcp/settings

Settings:

### MCP Endpoint

Show current endpoint.

### Rate Limits

Free:

[ 100 ] requests/day

Pro:

[ 10000 ] requests/day

### Authentication

Enabled/Disabled

### Analytics

Enabled/Disabled

### Logging

Enabled/Disabled

### Tool Access

Configure which tools are available.

All configuration changes must be persisted to the backend.

Do not store settings only in localStorage.

---

# 21. FREE VS PRO ANALYTICS

Create a clear comparison.

```text
                    Free       Pro

Users               2,921      1,821
Requests            32,821     92,821
Avg/user             11.2       51.0
Premium Requests       0        17,470
```

Show charts and trends.

---

# 22. AUDIT LOGS

Create:

/admin/mcp/audit

Track administrative actions:

* API key revoked
* API key disabled
* User suspended
* MCP tool disabled
* Rate limit changed
* MCP settings changed
* Admin role changed

Example:

```text
Admin:
jainil11199@gmail.com

Action:
Disabled MCP tool

Tool:
search_templates

Time:
12:31 PM
```

---

# 23. EXPORT

Allow admins to export analytics.

Supported:

* CSV
* JSON

Export:

* MCP logs
* Usage analytics
* User analytics
* Component analytics
* Search analytics

Exports must be generated through the backend.

---

# 24. RESPONSIVE DESIGN

Desktop:

Full sidebar + dashboard.

Tablet:

Collapsible sidebar.

Mobile:

Drawer navigation.

Tables should become:

* horizontally scrollable
  OR
* responsive cards

Charts should resize correctly.

---

# 25. LOADING STATES

Every data-heavy section must have:

* Skeleton loading
* Empty state
* Error state
* Retry action

Example:

```text
Loading MCP analytics...
```

Do not show blank screens.

---

# 26. EMPTY STATES

For example:

"No MCP requests yet."

"No API keys found."

"No security events."

"No search data available."

Make empty states visually consistent with UI HUB.

---

# 27. PERFORMANCE

Optimize the dashboard.

Do not fetch every log/request on initial page load.

Use:

* Pagination
* Server-side filtering
* Server-side sorting
* Date-range queries
* Lazy loading
* Caching where appropriate

For logs, never load thousands of records into the browser at once.

---

# 28. REAL DATA ONLY

IMPORTANT:

Do not use fake/random numbers such as:

Math.random()

for analytics.

All displayed metrics must come from:

* Existing backend
* Database
* MCP server
* Real monitoring system

If a metric is not currently available, show:

"Data unavailable"

and clearly identify what backend data source needs to be added.

---

# 29. API DESIGN

Create/reuse admin APIs such as:

GET /api/admin/mcp/overview

GET /api/admin/mcp/analytics

GET /api/admin/mcp/users

GET /api/admin/mcp/api-keys

GET /api/admin/mcp/tools

GET /api/admin/mcp/logs

GET /api/admin/mcp/security

GET /api/admin/mcp/health

GET /api/admin/mcp/components

GET /api/admin/mcp/search

GET /api/admin/mcp/audit

GET /api/admin/mcp/settings

POST /api/admin/mcp/tools/:id/enable

POST /api/admin/mcp/tools/:id/disable

POST /api/admin/mcp/api-keys/:id/revoke

POST /api/admin/mcp/users/:id/suspend

Adapt these to the existing API architecture.

Every endpoint must verify Super Admin/admin permissions.

---

# 30. SECURITY RULE

NEVER rely only on frontend route protection.

This is NOT sufficient:

```text
if (user.isAdmin) {
   showAdminDashboard();
}
```

The backend must independently enforce:

```text
Authenticated
     ↓
User exists
     ↓
Role check
     ↓
SUPER_ADMIN / authorized ADMIN
     ↓
Allow request
```

Unauthorized users must receive:

403 Forbidden

---

# 31. ADMIN USER

The primary Super Admin is:

[jainil11199@gmail.com](mailto:jainil11199@gmail.com)

Display the authenticated admin's actual profile information.

Do not hardcode the name/email into the UI.

Use the authenticated user data.

---

# 32. DESIGN QUALITY

The final dashboard should look like a real production SaaS platform.

Take inspiration from the information density and usability patterns of modern developer dashboards, but do not copy another company's design.

Prioritize:

* Clear hierarchy
* Excellent spacing
* Consistent cards
* Strong typography
* Useful charts
* Clear status indicators
* Fast navigation
* Minimal clutter

---

# 33. IMPLEMENTATION ORDER

Build in this order:

PHASE 1:
Inspect existing admin dashboard and design system.

PHASE 2:
Create MCP admin navigation.

PHASE 3:
Build Overview.

PHASE 4:
Build Analytics.

PHASE 5:
Build Users.

PHASE 6:
Build API Keys.

PHASE 7:
Build Tools.

PHASE 8:
Build Components + Search Analytics.

PHASE 9:
Build Playground.

PHASE 10:
Build Logs + Security.

PHASE 11:
Build Server Health.

PHASE 12:
Build Alerts + Settings.

PHASE 13:
Build Audit Logs.

PHASE 14:
Connect everything to real backend data.

PHASE 15:
Test authorization and responsiveness.

---

# 34. TESTING

Test:

### Authorization

* Super Admin can access dashboard.
* Authorized admin can access permitted sections.
* Normal user cannot access dashboard.
* Direct API requests from normal users return 403.

### Data

* Metrics match backend data.
* Filters work.
* Pagination works.
* Charts use real data.
* Logs are accurate.

### MCP

* Tool status reflects actual MCP server.
* Disabled tool cannot be called.
* Playground calls the real MCP tool.
* Server health reflects actual server status.

### Security

* API keys are never exposed.
* Admin actions are logged.
* Sensitive information is not displayed.

### Responsive

Test:

* Desktop
* Tablet
* Mobile

---

# 35. FINAL RESULT

I want a complete production-quality:

**UI HUB MCP Admin Dashboard**

with:

* Overview
* Analytics
* Users
* API Keys
* MCP Tools
* Component Analytics
* Search Analytics
* MCP Playground
* Logs
* Security
* Server Health
* Alerts
* Settings
* Audit Logs
* Export

The dashboard must use the existing UI HUB architecture and real MCP/backend data.

Do not create fake data just to make the dashboard look complete.

If a required backend metric does not exist, first identify the missing data source and implement the minimum backend/API changes necessary to provide it.

Do not break existing UI HUB functionality.

At the end, provide:

1. Files created
2. Files modified
3. New backend APIs
4. Database changes
5. MCP integrations
6. Admin permissions
7. Tests performed
8. Security checks
9. Environment variables added
10. Any remaining limitations
