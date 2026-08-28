# UI HUB MCP

Model Context Protocol (MCP) server that makes UI HUB's component library available to AI coding assistants such as **Cursor**, **Claude Code**, **VS Code / Copilot**, and other MCP-compatible clients.

With the UI HUB MCP server connected, an AI assistant can **search**, **discover**, and **retrieve** UI HUB components — including their source code, dependencies, metadata, templates, and animations — and use them directly inside your projects.

---

## What is UI HUB MCP?

- The MCP server is **owned and controlled by UI HUB** (not a third party).
- It exposes UI HUB's component catalog through standard MCP tools.
- It uses UI HUB's own API-key authentication system (no OpenAI/Anthropic keys required).
- Responses are optimized for AI agents (structured, minimal, no bulky HTML).
- Premium components are protected and require a Pro subscription.

---

## Getting Started

### 1. Create an API Key

1. Open the **[UI HUB MCP Dashboard](/dashboard/mcp)**.
2. Click **+ Create API Key**.
3. Give it a name (e.g. `Cursor`).
4. **Copy the key now** — it is shown only once for security.

API keys use the format: `uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx`

### 2. MCP Endpoint

```
https://api.ui-hub-design.com/mcp
```

Local development:

```
http://localhost:3001/mcp
```

### 3. Authentication

Send the API key in the `Authorization` header:

```
Authorization: Bearer uh_live_xxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Client Setup

### Generic / any MCP client

Add this JSON configuration (replacing `YOUR_UI_HUB_API_KEY`):

```json
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
```

### Cursor

1. Open **Settings → MCP → Add New MCP Server**.
2. Choose **command** type.
3. Paste the endpoint URL and add the `Authorization` header with your key.

### Claude Code

```
claude mcp add ui-hub --transport http https://api.ui-hub-design.com/mcp --header "Authorization: Bearer YOUR_UI_HUB_API_KEY"
```

### VS Code / Copilot

Place the generic configuration in your project's `.vscode/mcp.json`:

```json
{
  "servers": {
    "ui-hub": {
      "type": "http",
      "url": "https://api.ui-hub-design.com/mcp",
      "headers": {
        "Authorization": "Bearer YOUR_UI_HUB_API_KEY"
      }
    }
  }
}
```

---

## Available MCP Tools

### `search_components`

Search UI HUB components by name, category, framework, styling, tags, or premium status.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string (optional) | Free-text keyword, e.g. `"pricing card"` |
| `category` | string (optional) | `3d`, `background`, `button`, `cursor`, `effect`, `image-interaction`, `interactive-background`, `scroll`, `text` |
| `framework` | string (optional) | `react` |
| `styling` | string (optional) | `tailwind`, `css`, `scss` |
| `tags` | string[] (optional) | Tags to filter by |
| `isPremium` | boolean (optional) | `true` = premium only |

**Response:** array of `{ id, name, description, category, framework, styling, tags, previewUrl, isPremium, access }`.

### `get_component`

Retrieve full information about a component, including code and dependencies.

**Parameters:** `componentId` (string, required)

**Response:** `{ id, name, category, framework, styling, tags, code, dependencies, installation, usageExample, previewUrl, isPremium }`.

### `get_component_code`

Return copy-paste-ready source code.

**Parameters:** `componentId` (string, required), `framework`, `styling` (optional)

**Response:** `{ componentId, name, framework, styling, code, dependencies }`.

### `search_templates`

Search UI HUB templates.

**Parameters:** `query`, `category`, `isPremium` (all optional)

**Response:** array of template summaries.

### `get_template`

Return complete template information and code.

**Parameters:** `templateId` (string, required — prefix `template-`)

### `search_animations`

Search UI HUB animation resources.

**Parameters:** `query`, `category`, `isPremium` (all optional)

### `get_animation_code`

Return the implementation/code for an animation.

**Parameters:** `animationId` (string, required — prefix `anim-`)

### `list_categories`

Return all available UI HUB component categories with counts.

**Parameters:** none

### `get_dependencies`

Return dependencies required by a component.

**Parameters:** `componentId` (string, required)

**Response:** `{ componentId, dependencies: ["react", "framer-motion", "lucide-react", ...] }`

---

## Example MCP Request

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

## Free vs Pro Limits

| Capability | Free | Pro |
|------------|------|-----|
| MCP requests/day | 100 | 10,000+ |
| Component search | ✅ | ✅ |
| Component metadata | ✅ | ✅ |
| Premium components | ❌ | ✅ |
| Premium templates | ❌ | ✅ |
| Premium animations | ❌ | ✅ |
| Full source code | Free components only | All components |

Limits are configurable via environment variables (`MCP_RATE_LIMIT_FREE`, `MCP_RATE_LIMIT_PRO`).

---

## Security Notes

- API keys are stored as **SHA-256 hashes** — never plaintext.
- Non-essential key metadata (prefix, dates) is shown in the dashboard; the full secret is never exposed after creation.
- API keys can be **revoked** at any time from the dashboard.
- Rate limiting is enforced per API key and per plan.
- Premium content is protected server-side; free users receive `PREMIUM_ACCESS_REQUIRED`.
- Raw API keys and private database fields are never returned in MCP responses or logs.

---

## Error Handling

The MCP server returns structured JSON errors:

| Error Code | Meaning |
|------------|---------|
| `INVALID_API_KEY` | Missing or invalid API key (401) |
| `PREMIUM_ACCESS_REQUIRED` | Component requires Pro (403) |
| `RATE_LIMIT_EXCEEDED` | Daily usage limit reached (429) |
| `COMPONENT_NOT_FOUND` | Requested component/template/animation not found |
| `VALIDATION_ERROR` | Invalid parameters provided |
| `INTERNAL_ERROR` | Unexpected server error |

---

## Troubleshooting

**"INVALID_API_KEY"**
- Verify the key starts with `uh_live_` and is copied exactly.
- Ensure the key was not revoked.
- Recreate the key from the MCP dashboard.

**"RATE_LIMIT_EXCEEDED"**
- Free accounts are limited to 100 MCP requests/day. Wait for the next day or upgrade to Pro.

**"PREMIUM_ACCESS_REQUIRED"**
- The requested component is premium. Upgrade to Pro for full source access.

**"COMPONENT_NOT_FOUND"**
- Check the `componentId` spelling. Use `search_components` or `list_categories` to find valid IDs.

**Server not reachable**
- Confirm the MCP server is deployed and the endpoint URL is correct.
- Check that your client sends the `Authorization: Bearer <ui_hub_key>` header.

---

## Developer Notes

- The MCP server is a standalone TypeScript + Express service in `/mcp-server`.
- Component catalog metadata lives in `mcp-server/src/data/components.ts`.
- Embedded source code is mirrored from the backend into `mcp-server/src/data/sourceCode.json`.
- API keys are stored in the Firestore collection `mcp_api_keys`.
- MCP analytics events are stored in the Firestore collection `mcp_analytics`.
