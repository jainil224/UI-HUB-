# UI HUB MCP Server

The **Model Context Protocol (MCP)** server that makes UI HUB's 117+ component library available to AI coding
assistants such as **Cursor**, **Claude Code**, **VS Code / Copilot**, **ChatGPT**, **Windsurf**, and any other
MCP-compatible client.

With the UI HUB MCP server connected, an AI assistant can **search**, **discover**, and **retrieve** UI HUB
components — including their source code, dependencies, metadata, templates, animations, and AI generation prompts —
and use them directly inside your projects. The same server also powers the official [UI HUB CLI](/docs/cli.md).

---

## Table of Contents

- [What is UI HUB MCP?](#what-is-ui-hub-mcp)
- [Transport & Deployment](#transport--deployment)
- [Getting Started](#getting-started)
- [Client Setup](#client-setup)
- [Available MCP Tools](#available-mcp-tools)
- [Raw JSON-RPC Examples](#raw-json-rpc-examples)
- [Auth, Tiers & Rate Limits](#auth-tiers--rate-limits)
- [Error Codes](#error-codes)
- [Dashboard & Admin API](#dashboard--admin-api)
- [Analytics, Audit & Logging](#analytics-audit--logging)
- [Security Notes](#security-notes)
- [Data Pipeline & Keeping Data in Sync](#data-pipeline--keeping-data-in-sync)
- [Developer Notes](#developer-notes)
- [Testing & Troubleshooting](#testing--troubleshooting)
- [Architecture](#architecture)

---

## What is UI HUB MCP?

- The MCP server is **owned and controlled by UI HUB** (not a third party).
- It exposes UI HUB's component catalog through **standard MCP tools** over JSON-RPC 2.0.
- It uses UI HUB's own **API-key authentication** (`uh_live_…`) — no OpenAI/Anthropic keys required.
- Responses are optimized for AI agents (structured, minimal, no bulky HTML).
- Premium components are protected and require a **Pro subscription** — enforced server-side.
- Every tool call is tracked into the `mcp_analytics` collection so you can see exactly what your agents do.

---

## Transport & Deployment

The server ships with two transports:

### 1. Streamable HTTP (production, remote)

```
Endpoint: https://ui-hub-mcp.onrender.com/mcp
Protocol: MCP Streamable HTTP (JSON-RPC 2.0 over POST)
```

Also reachable through the unified deployment at `https://ui-hub-design.vercel.app/mcp` when mounted via the backend.

### 2. Stdio (local, offline, zero latency)

```
cd mcp-server
npm run stdio
```

`src/stdio.ts` serves the **same 13 tools** over standard input/output with an implicit **ADMIN** user
(`uh_local` prefix) — perfect for local `claude mcp add --transport stdio`, Cursor local mode, or CI scripts that
should not depend on the network.

### Endpoints that define the service

| Method | Path | Purpose |
|:---|:---|:---|
| GET | `/` | Service info (name, status, endpoints) |
| GET | `/health` | Health check **with Mongo connectivity probe** (`db: connected/disconnected`) |
| POST | `/mcp` | MCP Streamable HTTP — the main endpoint clients connect to |
| GET / DELETE | `/mcp` | 405 (session streaming/termination not supported — stateless mode) |
| GET | `/api/dashboard/mcp` | Dashboard API (API keys, usage, analytics) |
| GET | `/api/admin/mcp` | Admin API (metrics, users, audit) |

---

## Getting Started

### 1. Create an API Key

1. Open the **[UI HUB MCP Dashboard](https://ui-hub-design.vercel.app/dashboard/mcp)** (or `ui-hub.onrender.com/dashboard/mcp`).
2. Click **+ Create API Key**.
3. Give it a name (e.g. `Cursor`).
4. **Copy the key now** — it is shown only once for security.

API keys use the format: **`uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx`**

### 2. MCP Endpoint

Production:

```
https://ui-hub-mcp.onrender.com/mcp
```

Local development (via `npm run dev:mcp`):

```
http://localhost:3001/mcp
```

### 3. Authentication

Send the API key in the `Authorization` header:

```
Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Keys are resolved as **SHA-256 hashes** server-side; the plaintext is never stored, logged, or returned after
creation.

---

## Client Setup

### Generic / any MCP client

Add this JSON configuration (replacing `YOUR_UI_HUB_API_KEY`):

```json
{
  "mcpServers": {
    "ui-hub": {
      "url": "https://ui-hub-mcp.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"
      }
    }
  }
}
```

### Cursor

1. Open **Settings → MCP → Add New MCP Server**.
2. Choose **command** type.
3. Paste the endpoint URL and add the `Authorization` header with your key.
   (Alternatively, use stdio transport pointing at `node mcp-server/dist/stdio.js` for local mode.)

### Claude Code

```bash
claude mcp add ui-hub --transport http https://ui-hub-mcp.onrender.com/mcp \
  --header "Authorization: Bearer YOUR_UI_HUB_API_KEY"
```

Local (stdio) mode:

```bash
claude mcp add ui-hub --transport stdio -- node mcp-server/dist/stdio.js
```

### VS Code / Copilot

Place this in your project's `.vscode/mcp.json`:

```json
{
  "servers": {
    "ui-hub": {
      "type": "http",
      "url": "https://ui-hub-mcp.onrender.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"
      }
    }
  }
}
```

### CLI

The CLI is a thin client of this exact server — no separate backend. After `login`, it reuses your stored
`uh_live_…` key. See [docs/cli.md](docs/cli.md).

---

## Available MCP Tools

The server registers **13 tools**. Every tool validates its arguments with **Zod** schemas, returns structured JSON,
and records an analytics event.

### `search_components`

Search UI HUB components by name, category, framework, styling, tags, keyword, or premium status.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string (optional) | Free-text keyword, e.g. `"pricing card"` |
| `category` | string (optional) | One of `3d`, `background`, `button`, `cursor`, `effect`, `footer`, `image-interaction`, `interactive-background`, `loader`, `navbar`, `scroll`, `text` |
| `framework` | string (optional) | `react` |
| `styling` | string (optional) | `tailwind`, `css`, `scss` |
| `tags` | string[] (optional) | Tags to filter by |
| `isPremium` | boolean (optional) | `true` = premium only |

**Response:** `{ count, components: [{ id, name, description, category, framework, styling, tags, previewUrl, isPremium, access }] }`

`access` is permission-aware: `free`, `premium-available` (your key can fetch it), or `premium-required`.

### `get_component`

Retrieve complete information about a component — metadata, code, dependencies, and usage.

**Parameters:** `componentId` (string, required, e.g. `"aurora-cursor"`)

**Response:** `{ id, name, category, framework, styling, tags, code, dependencies, installation, usageExample, previewUrl, isPremium }`

Premium components require a **Pro key**; free keys get `PREMIUM_ACCESS_REQUIRED`.

### `get_component_code`

Return copy-paste-ready source code for a component.

**Parameters:** `componentId` (string, required), `framework`, `styling` (optional)

**Response:** `{ componentId, name, framework, styling, code, dependencies }`

### `get_component_metadata`

Return just the metadata (no heavy source) for a component — great for cheap "is this premium?" checks.

**Parameters:** `componentId` (string, required)

**Response:** structured metadata without the code payload.

### `get_dependencies`

Return the dependencies required by a component.

**Parameters:** `componentId` (string, required)

**Response:** `{ componentId, dependencies: ["react", "framer-motion", "lucide-react", …] }`

### `list_categories`

Return all available component categories with counts.

**Parameters:** none

**Response:** `[{ category, count }, …]`

### `search_by_behavior`

Search components by **visual behavior / vibe** descriptions rather than keywords — e.g. `"magnetic pull"`,
`"accretion disk"`, `"glow on hover"`, `"scroll reveal parallax"`. Matches behavior descriptions, requirements, and
AI vibe prompts.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string (required) | Behavior/vibe keyword, e.g. `"particle swirl"` |
| `category` | string (optional) | Restrict to a single category (e.g. `"cursor"`) |
| `limit` | number (optional) | Max results, 1–50, default 20 |

**Response:** `{ count, query, components }`

### `search_templates`

Search UI HUB full-page templates.

**Parameters:** `query`, `category`, `isPremium` (all optional)

**Response:** array of template summaries.

### `get_template`

Return complete template information.

**Parameters:** `templateId` (string, required — templates use the `template-` prefix)

**Response:** template metadata + data (premium templates gated).

### `get_template_source`

Return the actual source code of a template. **Requires Pro.**

**Parameters:** `templateId` (string, required — `template-` prefix)

**Response:** `{ templateId, name, code, dependencies }` — templates such as `sui-overflow` land whole `.tsx` projects.

### `search_animations`

Search UI HUB animation resources.

**Parameters:** `query`, `category`, `isPremium` (all optional)

### `get_animation_code`

Return the implementation/code for an animation.

**Parameters:** `animationId` (string, required — animations use the `anim-` prefix)

### `get_ai_prompts`

Return ready-to-use AI generation prompts (Claude, Antigravity, Lovable) for a component. **Requires Pro.**

**Parameters:** `componentId` (string, required), `system` (optional — `claude`, `antigravity`, or `lovable`)

**Response:** `{ componentId, name, prompts: { claude?, antigravity?, lovable? }, availableSystems }`

---

## Raw JSON-RPC Examples

### `initialize` handshake (Streamable HTTP)

```bash
curl -i -X POST https://ui-hub-mcp.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{
    "jsonrpc":"2.0","id":1,"method":"initialize",
    "params":{
      "protocolVersion":"2025-06-18",
      "capabilities":{},
      "clientInfo":{"name":"curl-test","version":"1.0"}
    }
  }'
```

Expected: `200` with a JSON-RPC `result` containing `serverInfo: { name: "ui-hub", version: "1.0.0" }` and
`capabilities`.

### `tools/list`

```bash
curl -s -X POST https://ui-hub-mcp.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}'
```

### `tools/call`

```
tools/call
{
  "name": "search_components",
  "arguments": {
    "query": "cursor background",
    "category": "cursor",
    "isPremium": false
  }
}
```

---

## Auth, Tiers & Rate Limits

| Capability | Free key | Pro / Elite key |
|:---|:---|:---|
| Component search / metadata / categories / deps / behavior search | ✅ | ✅ |
| Free component source (`get_component_code`, `get_component`) | ✅ | ✅ |
| **Premium** component source | ❌ `PREMIUM_ACCESS_REQUIRED` | ✅ |
| AI prompts (`get_ai_prompts`) | ❌ | ✅ |
| Template source (`get_template_source`) | ❌ | ✅ |
| MCP requests / day | **100** (default) | **10,000+** |
| API key creation | ✅ | ✅ |

- Limits are configurable via environment variables **`MCP_RATE_LIMIT_FREE`** and **`MCP_RATE_LIMIT_PRO`**.
- Rate limiting is enforced **per API key** (and per plan), backed by Redis when `REDIS_URL` is set.
- A missing or invalid key is rejected with `-32001` (auth required) before any tool runs.
- `search_components` keeps showing metadata for premium items to free keys, but marks them `premium-required`
  and the premium `get_component`/`get_component_code` calls are denied server-side.

---

## Error Codes

| Error Code | HTTP | Meaning |
|:---|:---|:---|
| `INVALID_API_KEY` | 401 | Missing or invalid API key |
| `PREMIUM_ACCESS_REQUIRED` | 403 | Component/template requires a Pro subscription |
| `RATE_LIMIT_EXCEEDED` | 429 | Daily usage limit reached |
| `COMPONENT_NOT_FOUND` | 404 | Requested component/template/animation not found |
| `PROMPTS_NOT_FOUND` | 404 | Component has no AI prompts (try `get_component_code`) |
| `VALIDATION_ERROR` | 422 | Invalid parameters provided (Zod schema failure) |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

JSON-RPC-level errors (`-32001` auth required, `-32603` internal, `-32700` parse, `-32601` method not found) are
also used for transport-level failures.

---

## Dashboard & Admin API

### Dashboard (`/api/dashboard/mcp`) — authenticated with Firebase ID tokens

| Method | Path | Description |
|:---|:---|:---|
| GET | `/keys` | List the user's API keys (metadata only, never plaintext) |
| POST | `/keys` | Create a new key → returns `{ key, record }` (plaintext shown **once**) |
| POST | `/keys/:id/revoke` | Revoke a key |
| DELETE | `/keys/:id` | Delete a key |
| GET | `/usage` | Current user's MCP usage summary (calls today, per tool, per tier) |
| GET | `/analytics` | User-scoped analytics over time |

### Admin (`/api/admin/mcp`) — ADMIN/ELITE only

| Method | Path | Description |
|:---|:---|:---|
| GET | `/metrics` | Global usage metrics across all keys |
| GET | `/users` | Registered API-key users |
| GET | `/audit` | Audit trail of key + analytics events |
| POST | `/config` | Toggle runtime config (e.g. logging) |

`MCP_ADMIN_EMAILS` (comma-separated) controls admin elevation; tier is resolved through Firebase via the
`firebaseService.getUserTier()` check (ADMIN or ELITE).

---

## Analytics, Audit & Logging

Every tool call is recorded to **MongoDB `mcp_analytics`** with:

```json
{
  "event": "component_search | component_fetch | behavior_search | ai_prompt_fetch | premium_denied | ...",
  "userId": "...",
  "apiKeyId": "...",
  "tier": "free | pro | elite | admin",
  "keyPrefix": "uh_live_abc…",
  "tool": "search_components",
  "componentId": "aurora-cursor",
  "timestamp": 1760000000000,
  "success": true
}
```

- **`mcp_audit`** — immutable audit trail for key lifecycle events (create/revoke/delete) and config changes.
- **`mcp_config`** — runtime-configurable settings (e.g. `loggingEnabled`).
- **Request logging** can be toggled via the config service; when enabled, only the **first 20 characters** of the
  `Authorization` header are logged (`uh_live_abc…`), never the full key.

---

## Security Notes

- API keys are stored as **SHA-256 hashes** — never plaintext.
- The full key is shown **only once** at creation time.
- Keys can be **revoked** at any time from the dashboard.
- Rate limiting is enforced per API key and per plan.
- Premium content is protected server-side; free users receive `PREMIUM_ACCESS_REQUIRED`.
- Raw API keys and private database fields are never returned in MCP responses or logs.
- Helmet sets security headers with `crossOriginEmbedderPolicy` and `crossOriginResourcePolicy` disabled so the
  dashboard on `ui-hub-design.vercel.app` is never blocked by CORP.
- CORS allows no-origin requests (curl, Node clients) and any configured origin; request logging redacts secrets.

---

## Data Pipeline & Keeping Data in Sync

The MCP server is deployed with **`rootDir: mcp-server`**, so it has **no runtime access** to
`frontend/src/components`. All catalog + source data must be committed under `mcp-server/src/data/`:

- **`components.ts`** — catalog metadata (name, category, framework, styling, tags, premium flag)
- **`sourceCode.json`** — the ONLY source of source code the MCP server reads at runtime

After any frontend data/component change, regenerate and rebuild:

```bash
cd mcp-server
npm run sync:data   # regenerates src/data/* from the frontend (components.ts, sourceCode.json, …)
npm run build       # tsc + coverage guard + copy data into dist/
```

- `sync:data` merges source from the frontend `embeddedSourceCode.ts`, backend data maps, dedicated `*Source.ts`
  files, and a PascalCase disk scan of `frontend/src/components/ui` (including canonical premium ids that aren't in
  the public catalog).
- The build runs **`scripts/check-source-coverage.mjs`**, which **fails the build** if any canonical premium id is
  missing from `sourceCode.json`. This guarantees premium components (e.g. `black-hole`, `rubiks-cube`,
  `toonhub-hero`) can never 404 via MCP/CLI.
- Expected on a healthy build: `check-source-coverage OK: 43/43 premium ids present (124 total)`.

---

## Developer Notes

- The MCP server is a standalone **TypeScript + Express** service in `/mcp-server`.
- **MongoDB** (`mcp-server/src/services/mongo.ts`) is the primary store for keys, analytics, audit, and config.
- Component catalog metadata lives in `mcp-server/src/data/components.ts`.
- Embedded source code is mirrored from the frontend into `mcp-server/src/data/sourceCode.json`.
- API keys live in the MongoDB collection `mcp_api_keys` (with Firebase UID ownership).
- Analytics events live in `mcp_analytics`; audit events in `mcp_audit`; runtime config in `mcp_config`.

### Local development

```bash
cd mcp-server
npm install
npm run dev          # tsx watch src/index.ts  → http://localhost:3001
npm run stdio        # local stdio transport with ADMIN access
npm test             # vitest — 54 unit tests
npm run build        # tsc + coverage guard + copy data
```

### Env reference (`mcp-server/.env`)

```env
PORT=3001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/uihub?appName=Cluster0
MONGODB_DB=uihub
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
MCP_ADMIN_EMAILS=you@example.com
MCP_ALLOWED_ORIGINS=http://localhost:3000,https://ui-hub-design.vercel.app
MCP_RATE_LIMIT_FREE=100
MCP_RATE_LIMIT_PRO=10000
MCP_API_KEY_PREFIX=uh_live_
```

---

## Testing & Troubleshooting

### Test with MCP Inspector (official debugging tool)

```bash
npx @modelcontextprotocol/inspector
```

Point it at `https://ui-hub-mcp.onrender.com/mcp` with Streamable HTTP transport. Confirm:
1. `initialize` succeeds
2. `tools/list` returns all 13 tools with valid Zod-derived schemas
3. At least one real `tools/call` (e.g. `search_components` with `query: "cursor"`) returns expected content

### Test with raw curl

```bash
curl -i -X POST https://ui-hub-mcp.onrender.com/mcp \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl-test","version":"1.0"}}}'
```

You should get a `200` with JSON-RPC `result` + `serverInfo` — not a 404, empty body, or hang.

### Common failure modes

| Symptom | Cause | Fix |
|:---|:---|:---|
| `INVALID_API_KEY` | Key copied partially, revoked, or wrong prefix | Recreate the key; verify `uh_live_` prefix |
| `RATE_LIMIT_EXCEEDED` | Free daily limit (100) reached | Wait for reset or upgrade to Pro |
| `PREMIUM_ACCESS_REQUIRED` | Free key asked for premium source/prompts | Upgrade to Pro |
| `COMPONENT_NOT_FOUND` | Misspelled ID, or premium id missing from `sourceCode.json` | `list_categories` / `search_components` first; run `npm run sync:data` if legitimately missing |
| "could not connect" (cold) | Free Render instance slept (~15 min idle) | Paid instance, or a health-ping warmer; retry after boot |
| Browser client silently blocked | CORS misconfiguration | Confirm `/mcp` CORS allows the client origin + MCP headers |
| Handshake fails instantly | Protocol version mismatch / missing JSON body parser | Update `@modelcontextprotocol/sdk`; ensure `express.json()` before `/mcp` |
| Two clients corrupt each other | Single global server/transport reused per request | Use stateless mode (fresh `McpServer` + transport per request) |

### Production regression sweep

With a Pro key, verify **all 43 premium IDs** return `200` via `get_component_code`/`get_component`, including the
backfilled ids `black-hole`, `rubiks-cube`, and `toonhub-hero`. Free keys must get `PREMIUM_ACCESS_REQUIRED` for the
same ids, and the request without any key must get `-32001`.

---

## Architecture

```
                   ┌──────────────────────────────────────────────┐
                   │            AI Assistant / CLI               │
                   │   (Cursor, Claude Code, Copilot, ui-hub)    │
                   └──────────────────────────────────────────────┘
                                        │  JSON-RPC 2.0
                                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                    UI HUB MCP Server (Express)                   │
│  /mcp  (Streamable HTTP, stateless per-request server)          │
│  /api/dashboard/mcp   /api/admin/mcp   /health                  │
│                                                                  │
│  Tools (13): search/get/list behavior prompts templates         │
│  Middleware: Firebase auth → tier, API-key hash check,          │
│              per-key rate limiting, analytics tracking          │
├──────────────────────────────────────────────────────────────────┤
│  Data layer                                                     │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────┐   │
│  │ src/data/*    │  │ MongoDB        │  │ Firestore /      │   │
│  │ catalog +     │  │ mcp_api_keys,  │  │ Firebase auth    │   │
│  │ sourceCode.json│ │ mcp_analytics, │  │ (admin SDK)      │   │
│  └───────────────┘  │ mcp_audit,     │  └──────────────────┘   │
│                     │ mcp_config     │                          │
│                     └────────────────┘                          │
└──────────────────────────────────────────────────────────────────┘
```

UI HUB is the official developer gateway into the UI HUB catalog — both for humans via the
[dashboard](https://ui-hub-design.vercel.app/dashboard/mcp) and for agents via MCP. Start by creating a key, connect
your editor, and let your AI assistant pull production-grade UI right into your project.