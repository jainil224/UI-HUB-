# UI Hub MCP Server — Diagnostic & Fix Guide

**Purpose of this file:** Give an AI coding assistant (or a developer) full context to
diagnose and permanently fix the "copy MCP URL → paste into any AI tool → doesn't work"
flow for the UI Hub MCP server.

---

## 1. System Overview

| Component | URL | Status (checked from outside) |
|---|---|---|
| UI Hub frontend/backend | `https://ui-hub.onrender.com` | Separate Render service |
| UI Hub MCP server | `https://ui-hub-mcp.onrender.com` | Deployed, root path responds |

Root path (`GET /`) currently returns:
```json
{
  "service": "ui-hub-mcp",
  "status": "ok",
  "endpoints": {
    "mcp": "/mcp",
    "health": "/health",
    "dashboard": "/api/dashboard/mcp"
  }
}
```

**Intended user flow:**
1. User visits `ui-hub.onrender.com`, generates a personal MCP connection (likely an API
   key + the `/mcp` URL, shown via the `/api/dashboard/mcp` endpoint).
2. User pastes that URL/config into Claude, Cursor, Claude Code, Windsurf, ChatGPT, etc.
3. That AI tool opens a **Streamable HTTP** connection to `https://ui-hub-mcp.onrender.com/mcp`
   and expects standard MCP JSON-RPC handshake + tool list + tool calls to work from a
   cold, unauthenticated (until auth handshake) client, from an arbitrary origin.

Because the server responds fine on `/` but "doesn't work" when pasted into an AI tool,
the bug is almost certainly in how `/mcp` itself is implemented, not in whether the
service is up. The sections below are ordered by likelihood.

---

## 2. Most Likely Root Causes (check in this order)

### 2.1 `/mcp` isn't a valid Streamable HTTP endpoint

The current MCP spec's HTTP transport requires a **single endpoint that accepts POST**
(and optionally GET for server-initiated streams / DELETE to close a session). If your
`/mcp` route:
- only accepts GET, or
- returns HTML/404 for POST, or
- isn't mounted at all (typo in route path, router not registered, mounted under a
  different base path like `/api/mcp`)

...every external AI tool will fail immediately, usually with a generic "could not
connect" or "failed to fetch tools" error and no useful detail shown to the user.

**Action:** Confirm the exact route registration in your server code. It must be:
```js
app.post("/mcp", async (req, res) => { ... });
```
Not `app.get`, not `router.use("/mcp/tools", ...)`, not nested under Express routers that
never get mounted on the main app.

### 2.2 CORS is blocking cross-origin requests

AI tools like Claude.ai (web), Claude Desktop, Cursor, and browser-based MCP clients
make the request **from their own origin**, not from `ui-hub.onrender.com`. If your
Express app only allows `ui-hub.onrender.com` in CORS, or has no CORS middleware at all,
the browser-based clients will be silently blocked (Node-based clients like Claude
Desktop/Claude Code aren't blocked by CORS, but any browser-hosted MCP client will be).

**Action:** Add permissive CORS on the `/mcp` route specifically, allowing the headers
MCP clients send:
```js
import cors from "cors";

app.use(
  "/mcp",
  cors({
    origin: "*", // or an allowlist if you need to restrict it
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "mcp-session-id",
      "mcp-protocol-version",
    ],
    exposedHeaders: ["mcp-session-id"],
  })
);
```
Make sure this middleware runs **before** your `/mcp` handler, and that you're not
relying on a global CORS config that excludes this path.

### 2.3 Missing/incorrect `Accept` and `Content-Type` handling

Streamable HTTP clients send `Accept: application/json, text/event-stream` and
`Content-Type: application/json`. If your route:
- doesn't call `express.json()` before the handler (so `req.body` is undefined), or
- rejects requests that don't have a JSON `Content-Type`, or
- doesn't set the response `Content-Type` correctly for the SSE stream case

...the JSON-RPC handshake (`initialize` method) will fail before any tool is even
listed.

**Action:** Confirm `app.use(express.json())` (or an equivalent) is registered globally
or specifically ahead of the `/mcp` route, with no size limit that's too small for
larger tool-call payloads.

### 2.4 A new `StreamableHTTPServerTransport`/`McpServer` isn't created correctly per request (Node SDK)

If you're using `@modelcontextprotocol/sdk`, the common **stateless** pattern is to
create a fresh `McpServer` + `StreamableHTTPServerTransport` **per incoming request**,
connect them, then hand off the request:

```js
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

app.post("/mcp", async (req, res) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless mode
  });

  const server = buildMcpServer(); // your function that registers all tools
  await server.connect(transport);

  res.on("close", () => {
    transport.close();
    server.close();
  });

  await transport.handleRequest(req, res, req.body);
});
```

A common bug: creating **one global `McpServer`/transport at startup** and reusing it
across requests. This breaks under concurrent users (two AI tools/users hitting the
server at once corrupt each other's session), and can produce hangs or 500s that look
like "the MCP server is broken" from the client's perspective.

If you instead want **stateful** sessions (session ID reused across calls), you need to
track transports by `mcp-session-id` in a map and route subsequent requests to the same
transport instance — and handle `GET /mcp` (server-to-client stream) and
`DELETE /mcp` (session termination) as well, not just `POST`.

**Action:** Decide stateless vs. stateful deliberately; stateless is simpler and works
fine for most tool-calling servers with no per-session memory needs. Don't mix the two
patterns.

### 2.5 Protocol version mismatch

MCP clients send an `MCP-Protocol-Version` header (or negotiate it in `initialize`). If
your server/SDK version is old and rejects the version the client sends (or vice versa),
the handshake fails. This usually shows up as an "unsupported protocol version" error in
the client, or a silent failure.

**Action:** Update `@modelcontextprotocol/sdk` (or `fastmcp` if Python) to the latest
version. Confirm in your `package.json` you're not pinned to a version older than
2025-06 spec support.

### 2.6 Render free-tier cold starts causing client-side timeouts

If the MCP service is on Render's **free** instance type, it spins down after ~15
minutes of inactivity. The first request after idle can take 30–60+ seconds to respond
while the container boots. Many MCP clients have a much shorter connection timeout and
will report "failed to connect" or "server not responding" even though the server is
fine — it just wasn't awake yet.

**Action, in order of cost:**
1. Upgrade the MCP service to a paid instance type so it never sleeps (most reliable).
2. If staying on free tier, add a lightweight external uptime pinger (e.g. a cron job or
   a service like UptimeRobot) that hits `/health` every 10 minutes to keep it warm —
   note this only helps if there's *some* traffic; long idle windows overnight will
   still cold-start.
3. Make sure your `/health` endpoint responds instantly and doesn't itself depend on a
   slow cold dependency (e.g. a Firebase Admin SDK re-init on every request).

### 2.7 Auth/API key flow breaks the copy-paste config

If the MCP URL your dashboard generates embeds a per-user API key (e.g.
`https://ui-hub-mcp.onrender.com/mcp?key=...` or expects an `Authorization: Bearer ...`
header the user has to paste separately), check:
- Does the generated snippet match what your `/mcp` route actually expects
  (query param vs. header vs. both)?
- Does your server correctly read the key from **both** places if you support both
  config UIs (raw URL entry vs. JSON config block with a `headers` field)?
- Do invalid/missing keys return a proper `401`/`403` with a JSON-RPC error body,
  rather than crashing the process or hanging? A silent hang looks identical to "MCP
  server not working" from the user's side.

**Action:** Log every incoming request to `/mcp` (method, headers present, whether a key
was found and validated) during testing so you can see exactly what real AI tools send
when a user pastes your config.

### 2.8 Tool schemas fail validation

If any registered tool has an invalid JSON Schema (e.g. a Zod schema that doesn't
serialize cleanly, or a missing `description`), some clients will fail the entire
`tools/list` call, not just that one tool — the user sees "no tools available" or a
generic error with zero tools loaded.

**Action:** Validate each tool definition individually against the MCP tool schema spec.
Test with the MCP Inspector (see Section 4) to see the raw `tools/list` response and
confirm every tool is well-formed.

---

## 3. Recommended Correct Reference Implementation (Node/Express)

```js
import express from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
app.use(express.json({ limit: "2mb" }));

app.use(
  "/mcp",
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Accept",
      "Authorization",
      "mcp-session-id",
      "mcp-protocol-version",
    ],
    exposedHeaders: ["mcp-session-id"],
  })
);

function buildMcpServer() {
  const server = new McpServer({ name: "ui-hub-mcp", version: "1.0.0" });

  server.tool(
    "search_components",
    { query: z.string().describe("Search term for UI components") },
    async ({ query }) => {
      // ... call your actual UI Hub backend here, e.g.
      // const res = await fetch(`https://ui-hub.onrender.com/api/components?q=${encodeURIComponent(query)}`);
      // const data = await res.json();
      return {
        content: [{ type: "text", text: `Results for "${query}": ...` }],
      };
    }
  );

  // register remaining tools here (get_component, get_component_prompt, etc.)

  return server;
}

app.post("/mcp", async (req, res) => {
  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless: simplest, scales horizontally
    });
    const server = buildMcpServer();
    await server.connect(transport);

    res.on("close", () => {
      transport.close();
      server.close();
    });

    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("MCP request failed:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// Streamable HTTP clients may also probe GET/DELETE on the same path.
// If you don't support server-initiated streams or session termination,
// respond with 405 rather than letting Express 404 the whole route.
app.get("/mcp", (req, res) => res.status(405).json({ error: "Method not supported" }));
app.delete("/mcp", (req, res) => res.status(405).json({ error: "Method not supported" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));

const port = parseInt(process.env.PORT || "8080", 10);
app.listen(port, "0.0.0.0", () => {
  console.log(`UI Hub MCP server listening on port ${port}`);
});
```

Key points this reference encodes:
- CORS scoped to `/mcp` with the exact headers MCP clients use.
- A **new server + transport per request** (stateless), so concurrent users never
  collide.
- Explicit `try/catch` so a bug in a tool handler returns a proper JSON-RPC error
  instead of hanging the connection until the client times out.
- `GET`/`DELETE` on `/mcp` return a clean `405` instead of Express's default 404 HTML
  page, which is a common cause of "AI tool shows a weird error" reports.

---

## 4. How to Test Before Trusting a "Copy MCP" Button

1. **MCP Inspector** — the official debugging tool:
   ```bash
   npx @modelcontextprotocol/inspector
   ```
   Point it at `https://ui-hub-mcp.onrender.com/mcp` with Streamable HTTP transport.
   Confirm: `initialize` succeeds, `tools/list` returns every tool with valid schemas,
   and at least one real `tools/call` returns the expected content.

2. **Raw curl handshake** (sanity check independent of any SDK):
   ```bash
   curl -i -X POST https://ui-hub-mcp.onrender.com/mcp \
     -H "Content-Type: application/json" \
     -H "Accept: application/json, text/event-stream" \
     -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl-test","version":"1.0"}}}'
   ```
   You should get a `200` with a JSON-RPC `result` containing `serverInfo` and
   `capabilities` — not a `404`, not an empty body, not a hang.

3. **Cold-start test** — leave the service idle for 20+ minutes (or manually suspend/
   resume on Render), then immediately run the curl test above and time it. If it takes
   longer than ~10 seconds, that's the timeout most AI tool clients will hit in real
   usage — go back to Section 2.6.

4. **Real client test** — after Inspector and curl both pass, test the actual copy-paste
   flow end to end in at least one real tool (e.g. Claude Desktop's MCP connector
   settings, or Cursor's MCP config) using the exact snippet your dashboard generates at
   `/api/dashboard/mcp`, not a hand-written one.

5. **Two concurrent clients** — run the Inspector and a real client against the server
   at the same time. If one breaks the other, you have the stateless/global-server bug
   from Section 2.4.

---

## 5. Checklist Summary

- [ ] `/mcp` accepts `POST` and is mounted on the running app (not an unmounted router)
- [ ] CORS allows `*` (or your intended origins) on `/mcp` with MCP-specific headers
- [ ] `express.json()` (or equivalent) runs before the `/mcp` handler
- [ ] A fresh `McpServer` + `StreamableHTTPServerTransport` is created per request
      (stateless) — or a correctly tracked session map (stateful), not a single shared
      global instance
- [ ] `@modelcontextprotocol/sdk` (or `fastmcp`) is up to date
- [ ] MCP service is on a paid Render instance, or has a documented cold-start warning
      to users, or is kept warm via periodic health pings
- [ ] Auth key flow matches exactly what the dashboard's generated snippet sends
      (query param vs. header)
- [ ] Every tool schema is validated and passes `tools/list` in MCP Inspector
- [ ] Errors inside tool handlers return proper JSON-RPC error responses, never a hang
- [ ] `GET`/`DELETE /mcp` return clean 405s instead of falling through to a 404 page
- [ ] Full flow tested with MCP Inspector, curl, and a real AI tool using the exact
      copy-paste snippet from `ui-hub.onrender.com`

---

## 6. What To Send Back If You Want a Precise (Not General) Fix

This document covers the standard failure modes for a Render-hosted Streamable HTTP MCP
server. To get an exact, line-level fix rather than general guidance, share:
1. The actual `server.js`/`app.js` (or equivalent) source for `ui-hub-mcp`.
2. The exact error message/behavior the AI tool shows when you paste the MCP config.
3. The exact snippet your `/api/dashboard/mcp` endpoint currently generates for users.
4. Render logs from the MCP service around the time of a failed connection attempt.