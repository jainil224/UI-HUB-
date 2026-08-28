# Integrate MCP into Existing UI HUB Website

I already have a fully built website called **UI HUB**.

Website:
https://ui-hub-design.vercel.app/

I want you to integrate a new feature called **MCP (Model Context Protocol)** into the existing project.

IMPORTANT:

* Do NOT rebuild the website from scratch.
* Do NOT replace my existing UI/UX.
* Do NOT remove or break any existing functionality.
* First inspect the existing project structure, frontend, backend/API, database, authentication, component system, and deployment configuration.
* Reuse the existing architecture wherever possible.
* Keep the current design system, colors, typography, spacing, animations, responsive behavior, and overall branding.
* Make the MCP integration feel like a native part of UI HUB.

## MAIN GOAL

Turn UI HUB into an **AI-accessible UI component platform**.

Users should be able to connect UI HUB to MCP-compatible AI coding tools such as Cursor, Claude Code, VS Code/Copilot, and other compatible clients.

The AI assistant should be able to discover UI HUB components and retrieve their code, dependencies, styles, metadata, templates, and animations through MCP.

The MCP server should be owned and controlled by UI HUB.

Do NOT depend on an external third-party MCP server.

---

# 1. CREATE A UI HUB MCP SERVER

Create a dedicated MCP server for UI HUB.

Recommended architecture:

Frontend:
Existing UI HUB frontend

Backend:
Existing backend if available, otherwise create a separate Node.js + TypeScript MCP service

MCP endpoint:

https://ui-hub-design.vercel.app/mcp

Use **Streamable HTTP** for the production MCP transport.

The MCP server must be designed for production use and should be modular and scalable.

Suggested structure:

/mcp
/src
/server
/tools
/resources
/auth
/services
/db
/utils
package.json
tsconfig.json
.env

Adapt this structure to the existing project instead of blindly creating duplicate systems.

---

# 2. MCP TOOLS

Create MCP tools for UI HUB.

At minimum implement:

### search_components

Search UI HUB components by:

* name
* category
* framework
* styling
* tags
* keyword
* free/premium status

Example:

search_components({
query: "pricing card",
framework: "react",
styling: "tailwind"
})

Return useful structured information such as:

* component ID
* component name
* description
* category
* framework
* styling
* tags
* preview URL
* premium/free status

---

### get_component

Retrieve complete information about a specific component.

Example:

get_component({
componentId: "pricing-card-pro"
})

Return:

* metadata
* description
* code
* styles
* dependencies
* installation instructions
* usage example
* preview URL

---

### get_component_code

Return copy-paste-ready source code.

Example:

get_component_code({
componentId: "pricing-card-pro",
framework: "react",
styling: "tailwind"
})

Return clean production-ready code.

---

### search_templates

Allow AI tools to search UI HUB templates.

Example:

search_templates({
query: "SaaS dashboard"
})

---

### get_template

Return complete template information and code.

---

### search_animations

Search UI HUB animation resources.

Example:

search_animations({
query: "scroll reveal"
})

---

### get_animation_code

Return the implementation/code for a selected animation.

---

### list_categories

Return all available UI HUB component categories.

Examples:

* Hero
* Navbar
* Pricing
* Cards
* Forms
* Dashboard
* Authentication
* Buttons
* Modals
* Tables
* Footer
* Animations
* etc.

---

### get_dependencies

Return dependencies required by a component.

Example response:

{
"dependencies": [
"lucide-react",
"framer-motion"
]
}

---

# 3. USE THE EXISTING UI HUB DATA

Do NOT duplicate component data manually if the project already has a database/API/content system.

Inspect the current application and identify where UI HUB currently stores:

* components
* component code
* templates
* animations
* categories
* tags
* dependencies
* pricing information
* user information

The MCP server should reuse the existing source of truth.

Create a service/repository layer if necessary so both the website and MCP server can access the same data.

Do NOT create two independent databases containing duplicate component data unless absolutely necessary.

---

# 4. API KEY AUTHENTICATION

I want UI HUB to use **its own API key system** for MCP authentication.

Do NOT require users to provide an OpenAI API key.

Do NOT depend on Anthropic API keys.

Do NOT depend on another company's API key.

Create a UI HUB API key system.

API key format:

uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx

Each user should be able to create/manage their own MCP API keys from their UI HUB account/dashboard.

Add functionality for:

* Create API key
* Show newly generated key once
* Copy API key
* Revoke API key
* Delete/revoke old keys
* View created date
* View last used date
* View key status
* Optional expiration date

IMPORTANT SECURITY REQUIREMENTS:

* Never store plaintext API keys in the database.
* Store a secure hash of the API key.
* Show the full secret only once when it is created.
* Use secure random key generation.
* Support key revocation.
* Validate keys on every MCP request.
* Add rate limiting.
* Never expose secret keys to the public frontend.
* Never log raw API keys.

Use:

Authorization: Bearer <UI_HUB_API_KEY>

for MCP authentication.

---

# 5. FREE VS PREMIUM ACCESS

Integrate MCP with the existing UI HUB subscription system.

The MCP server must understand whether a user is:

* Free
* Pro/Premium
* Admin

Example:

FREE:

* Limited MCP requests
* Free components only
* Limited code access

PRO:

* Higher/unlimited MCP usage according to subscription rules
* Premium components
* Premium templates
* Premium animations
* Full source code

ADMIN:

* Full access

Do not hardcode subscription logic in multiple places.

Create a reusable permission/authorization service.

---

# 6. MCP DASHBOARD UI

Add a new page/section to the existing UI HUB dashboard:

**MCP**

Possible URL:

/dashboard/mcp

Design it using the current UI HUB visual language.

The page should contain:

## MCP Overview

Explain:

"Connect UI HUB to your AI coding assistant and use UI HUB components directly inside your development workflow."

Show:

* MCP status
* MCP endpoint
* API key status
* Usage
* Connected clients if available

---

## API Keys

Create a professional API key management interface.

Example:

API Keys

+--------------------------------------+
| UI HUB MCP API Key                   |
|                                      |
| uh_live_••••••••••••••••             |
| Created: Aug 28, 2026                |
| Last used: Today                     |
| Status: Active                       |
|                                      |
| [Copy] [Revoke]                      |
+--------------------------------------+

Button:

[ + Create API Key ]

---

# 7. CONNECTION GUIDE

Add a section called:

## Connect UI HUB to your AI

Explain how users can configure MCP clients.

Example configuration:

{
"mcpServers": {
"ui-hub": {
"url": "https://api.ui-hub-design.com/mcp",
"headers": {
"Authorization": "Bearer YOUR_UI_HUB_API_KEY"
}
}
}
}

Add a copy button.

Also provide separate instructions/cards for:

* Cursor
* Claude Code
* VS Code/Copilot
* Generic MCP clients

Do not claim support for a client unless the actual configuration is compatible.

---

# 8. WEBSITE COMPONENT PAGE INTEGRATION

On every component detail page, add a new section:

## Use with AI

Example:

┌──────────────────────────────────────┐
│ ✦ Use with AI                       │
│                                      │
│ Use this UI HUB component directly   │
│ from your AI coding assistant.       │
│                                      │
│ [ Connect MCP ]                      │
│ [ Copy MCP Setup ]                   │
└──────────────────────────────────────┘

When clicked, users should be taken to the MCP setup/dashboard page.

For premium components, clearly indicate that premium MCP access may require a Pro subscription.

---

# 9. MCP RESPONSE DESIGN

The MCP tools should return structured, AI-friendly information.

Do NOT return huge unnecessary HTML pages or irrelevant website content.

For example:

{
"id": "pricing-card-pro",
"name": "Pro Pricing Card",
"category": "pricing",
"framework": "react",
"styling": "tailwind",
"description": "Modern SaaS pricing card",
"tags": [
"pricing",
"saas",
"modern"
],
"code": "...",
"dependencies": [
"lucide-react"
],
"installation": "...",
"previewUrl": "...",
"isPremium": true
}

Responses should be optimized for AI agents.

---

# 10. DATABASE CHANGES

Inspect the current database first.

Only add new tables/fields when required.

Possible new table:

mcp_api_keys

Example fields:

* id
* user_id
* key_hash
* key_prefix
* name
* created_at
* last_used_at
* expires_at
* revoked_at
* status

If the project already has a suitable API-key/auth table, reuse it.

---

# 11. RATE LIMITING

Implement MCP API rate limiting.

Rate limits should depend on the user's plan.

Example:

Free:
100 MCP requests/day

Pro:
Higher/unlimited according to business rules

Make the values configurable using environment variables.

Do not hardcode limits throughout the application.

Return proper errors such as:

401 Unauthorized
403 Forbidden
429 Too Many Requests

---

# 12. SECURITY

Follow production security best practices.

Implement:

* API key authentication
* secure key hashing
* rate limiting
* request validation
* input validation
* authorization
* subscription checks
* CORS configuration
* safe error responses
* request logging without secrets
* protection against unauthorized component access
* protection against premium content leakage

Do not expose private database fields through MCP.

Do not return API keys in MCP responses.

---

# 13. ERROR HANDLING

Create clean MCP error responses.

Examples:

Invalid API key:

{
"error": "INVALID_API_KEY",
"message": "The provided UI HUB API key is invalid."
}

Premium component:

{
"error": "PREMIUM_ACCESS_REQUIRED",
"message": "This component requires a UI HUB Pro subscription."
}

Rate limit:

{
"error": "RATE_LIMIT_EXCEEDED",
"message": "You have exceeded your current MCP usage limit."
}

Component not found:

{
"error": "COMPONENT_NOT_FOUND",
"message": "The requested UI HUB component was not found."
}

---

# 14. ADMIN PANEL

If the existing project has an admin dashboard, add MCP analytics.

Show:

* Total MCP requests
* Requests today
* Active API keys
* Top components requested
* Top searches
* Free vs Pro usage
* Failed requests
* Rate-limit events

This should use the existing admin architecture where possible.

---

# 15. ANALYTICS

Track MCP events such as:

* mcp_request
* component_search
* component_fetch
* code_fetch
* template_fetch
* animation_fetch
* auth_failure
* rate_limit
* premium_denied

Do not store sensitive data unnecessarily.

---

# 16. ENVIRONMENT VARIABLES

Create/update environment variables appropriately.

Example:

MCP_SERVER_URL=
MCP_API_KEY_PREFIX=uh_live_
MCP_RATE_LIMIT_FREE=
MCP_RATE_LIMIT_PRO=
DATABASE_URL=

Do NOT commit secrets.

Update `.env.example`.

---

# 17. DEPLOYMENT

The MCP server must be deployable independently from the UI frontend.

Recommended architecture:

UI HUB frontend:
https://ui-hub-design.vercel.app

MCP API:
https://api.ui-hub-design.com/mcp

Use a deployment platform appropriate for a long-running Node.js service.

Configure:

* production environment variables
* HTTPS
* custom domain
* CORS
* authentication
* health endpoint
* logging
* monitoring

Add:

GET /health

which returns something like:

{
"status": "ok",
"service": "ui-hub-mcp"
}

---

# 18. TESTING

Before finishing, create tests for:

* API key creation
* API key hashing
* API key authentication
* revoked key
* expired key
* invalid key
* Free user permissions
* Pro user permissions
* premium component protection
* rate limiting
* search_components
* get_component
* get_component_code
* search_templates
* get_template
* search_animations
* get_animation_code

Also test that the existing UI HUB website still works.

Do not introduce breaking changes.

---

# 19. DOCUMENTATION

Create documentation for developers.

Add:

/docs/mcp.md

Documentation should explain:

* What UI HUB MCP is
* How to create an API key
* MCP endpoint
* Authentication
* Cursor setup
* Claude Code setup
* VS Code setup
* Available MCP tools
* Tool parameters
* Example MCP requests
* Free vs Pro limitations
* Security notes
* Troubleshooting

---

# 20. FINAL USER EXPERIENCE

The final experience should be:

User opens UI HUB

↓

User opens Dashboard

↓

User opens MCP

↓

User creates UI HUB API key

↓

User copies MCP configuration

↓

User adds UI HUB MCP to Cursor/Claude/etc.

↓

AI can search UI HUB

↓

AI finds components

↓

AI retrieves source code

↓

AI retrieves dependencies

↓

AI uses the UI HUB component inside the user's project

Example:

User tells Cursor:

"Create a modern SaaS pricing section. Use a pricing card from UI HUB."

Cursor:

search_components("modern SaaS pricing card")

↓

UI HUB MCP

↓

returns matching component

↓

Cursor:

get_component_code(componentId)

↓

UI HUB MCP

↓

returns code

↓

Cursor generates the page using the UI HUB component.

---

# IMPORTANT IMPLEMENTATION RULES

1. Inspect the existing codebase before making changes.
2. Reuse existing authentication/database/API systems.
3. Do not rebuild the existing website.
4. Do not change the current visual design unnecessarily.
5. Do not break existing pages or functionality.
6. Keep MCP code modular.
7. Keep frontend and MCP backend responsibilities separate.
8. Use TypeScript where possible.
9. Use proper input validation.
10. Use secure API-key authentication.
11. Never store plaintext API keys.
12. Protect premium components.
13. Add rate limiting.
14. Add tests.
15. Update documentation.
16. Add `.env.example`.
17. Add proper production error handling.
18. Make the implementation scalable for thousands of users.
19. Keep the MCP API response optimized for AI agents.
20. Do not use an external AI API unless it is actually required.

---

# FIRST STEP

Before writing code, inspect the entire existing project and produce a short technical audit containing:

* Current frontend framework
* Current backend
* Database
* Authentication
* Component storage
* Existing API routes
* Existing subscription/payment system
* Existing dashboard structure
* Existing deployment configuration
* Best location for the MCP server
* Any architecture conflicts or risks

Then implement the MCP feature directly into the existing project based on that audit.

After implementation, provide:

1. Files created
2. Files modified
3. Database changes
4. Environment variables required
5. MCP endpoint
6. API key setup
7. Deployment steps
8. Test results
9. Example MCP client configuration
10. Any remaining limitations

The final implementation must be production-ready, secure, maintainable, and integrated naturally into the existing UI HUB website.
