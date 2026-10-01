# Documentation Endpoint Audit

Created by Phase 6, task 6.11. Every claim below was checked against source or
deployment configuration in this repository. Claims that could not be checked
are marked `UNKNOWN` rather than assumed.

## Classification scheme

| Class | Meaning |
|---|---|
| `VALID` | Route or host is confirmed by configuration in this repository |
| `INVALID` | Contradicted by configuration in this repository |
| `OUTDATED` | Describes a host or route that no longer matches any configuration |
| `ENVIRONMENT-SPECIFIC` | True only in one environment |
| `UNKNOWN` | Cannot be determined from source; needs runtime or owner evidence |

---

## 1. Render hosts

Three distinct Render hostnames appear across 130+ references.

| Host | Matches a blueprint service? | Class | Basis |
|---|---|---|---|
| `https://ui-hub-mcp.onrender.com` | yes — `mcp-server/render.yaml` service `ui-hub-mcp`; also the literal in `MCP_SERVER_URL` in **both** blueprints; also the CLI's own default endpoint | `VALID` | `mcp-server/render.yaml:3`, both `MCP_SERVER_URL` values, `cli/src/config.ts:5` |
| `https://ui-hub-backend-mcp.onrender.com` | yes — root `render.yaml` service `ui-hub-backend-mcp` | `VALID` as a host | root `render.yaml:4` |
| `https://ui-hub.onrender.com` | **no** — matches neither service name | `OUTDATED` | no `name:` in either blueprint equals `ui-hub` |

### `https://ui-hub.onrender.com` — OUTDATED

Found in 10+ references. Verified occurrences in application source and
configuration:

- `cli/src/commands/login.ts:41` — a **prompt string only**:
  `promptHidden('UI HUB API key (create one at ui-hub.onrender.com/dashboard/mcp): ')`
- `README.md`, `MCP.md`, `docs/mcp.md` examples.
- 43 total references across `.uihub-agent/` baselines.

Neither blueprint declares a service named `ui-hub`. Render derives hostnames
from the service name, so this host is either a renamed service or no longer
exists.

**Severity is low in code, high in documentation.** The CLI's actual endpoint is
correct and unaffected: `cli/src/config.ts:5` sets
`DEFAULT_ENDPOINT = 'https://ui-hub-mcp.onrender.com/mcp'`, matching the
blueprint's `MCP_SERVER_URL`. Only the human-readable hint shown in the login
prompt is wrong, so a user is told to open a page that does not exist when
creating a key.

An earlier Phase 5/6 note described this as a broken CLI endpoint. That was
incorrect: it is a wrong URL inside a prompt string, not a wrong request target.
Correcting the record here because the severity difference matters for triage.

Owner confirmation is required before rewriting: if the service was renamed to
`ui-hub-backend-mcp`, the fix is a one-line change plus a documentation sweep; if
the service was deleted, the hint points at nothing at all.

---

## 2. Vercel frontend host and its routes

`vercel.json` defines exactly three rewrites. This is the ground truth for what
the frontend domain can serve.

| Rewrite | Effect |
|---|---|
| `/api/(.*)` → `/api/index.js` | all `/api/*` goes to the serverless function |
| `/health` → `/api/index.js` | health check goes to the function |
| `/(.*)` → `/index.html` | everything else is the SPA catch-all |

### Routes on the frontend domain

| Route | Class | Basis |
|---|---|---|
| `https://ui-hub-design.vercel.app/api/*` | `VALID` | rewrite `/api/(.*)`; also asserted by `frontend/src/routing/vercelRouting.test.ts:39` |
| `https://ui-hub-design.vercel.app/health` | `VALID` | explicit `/health` rewrite |
| `https://ui-hub-design.vercel.app/dashboard/mcp` | `VALID` | real SPA route: `frontend/src/App.tsx:115-117` mounts `<Route path="mcp">` under `/dashboard` |
| `https://ui-hub-design.vercel.app/mcp` | `VALID` as a URL, `INVALID` as an API | redirect only: `App.tsx:120` is `<Route path="/mcp" element={<Navigate to="/dashboard/mcp" replace />} />` |

### `https://ui-hub-design.vercel.app/mcp` — INVALID as an MCP endpoint

This is the finding Phase 5 recorded. It is still present in documentation.

- The Vercel deployment **cannot serve MCP**. Only `/api/*` and `/health` reach
  `api/index.js`; everything else falls to `index.html`.
- `/mcp` therefore returns the SPA shell with HTTP 200, not a JSON-RPC response.
- A client following this URL gets a 200 and HTML. It fails in a way that looks
  like success, which is worse than an error status.
- The correct MCP endpoint is `https://ui-hub-mcp.onrender.com/mcp`, confirmed by
  `mcp-server/src/index.ts:57` (`app.use('/mcp', mcpRouter)`).

Documentation must not present the Vercel `/mcp` URL as an API endpoint. It is a
browser redirect, and those are different things.

---

## 3. MCP server routes

Confirmed from `mcp-server/src/index.ts`:

| Route | Class | Basis |
|---|---|---|
| `https://ui-hub-mcp.onrender.com/mcp` | `VALID` | `index.ts:57` |
| `https://ui-hub-mcp.onrender.com/api/dashboard/mcp` | `VALID` | `index.ts:58` |
| `https://ui-hub-mcp.onrender.com/api/admin/mcp` | `VALID` | `index.ts:59` |
| `https://ui-hub-mcp.onrender.com/health` | `VALID` | `healthCheckPath: /health` in both blueprints |

The MCP dashboard is served by the **frontend** SPA, not by the MCP server, and
its data API lives at `/api/dashboard/mcp`. `https://ui-hub.onrender.com/dashboard/mcp`
conflates the two: that host does not exist, and even on the correct host the
dashboard UI path belongs to the frontend.

---

## 4. Firebase and payment hosts

| URL | Class | Basis |
|---|---|---|
| `https://ui-hub-3fe3d.firebaseapp.com/__/auth/:path*` | `VALID` | Firebase Auth authorised domain, project `ui-hub-3fe3d` matches `render.yaml:41` and `frontend/src/main.tsx:14` |
| `https://checkout.razorpay.com/v1/checkout.js` | `VALID` | Razorpay's published checkout script; allowed by `scriptSrc` in the CSP at `backend/src/server.js:44` |
| `https://api.razorpay.com` | `VALID` | allowed by `frameSrc` (`backend/src/server.js:45`) and `connectSrc` (`backend/src/server.js:52`) |

---

## 5. Third-party URL found during this audit

| URL | Class | Note |
|---|---|---|
| `https://capsule-render.vercel.app/api/render?type=waving&color=0:000000` | `UNKNOWN` | remote image-rendering service, 2 references. Not a UI-HUB endpoint. Verify before relying on it: the service depends on a third party's uptime and sends requests off-origin. |

---

## 6. Environment-specific endpoints

| Endpoint | Class | Note |
|---|---|---|
| `http://localhost:5173` | `ENVIRONMENT-SPECIFIC` | Vite dev server; appears in production `MCP_ALLOWED_ORIGINS` (see `DEPLOYMENT_CONFLICTS.md` §2) |
| `http://localhost:3001` | `ENVIRONMENT-SPECIFIC` | MCP server dev port; in the CORS defaults only |
| `https://ui-hub-design-git-main-jainil224s-projects.vercel.app` | `ENVIRONMENT-SPECIFIC` | preview deployment, allowlisted in code |
| `https://ui-hub-design-jainil224s-projects.vercel.app` | `ENVIRONMENT-SPECIFIC` | preview deployment, allowlisted in code |
| `https://ui-motion-studio.vercel.app` | `UNKNOWN` | unrelated host, 2 references. Purpose not established from source |

---

## 7. Findings requiring correction

| # | Claim | Where | Class | Action |
|---|---|---|---|---|
| 1 | `ui-hub.onrender.com/dashboard/mcp` used as a live key-creation page | `cli/src/commands/login.ts:41` (prompt text) + docs | `OUTDATED` | Correct after owner confirms the current service name. CLI request target is already correct. |
| 2 | Vercel `/mcp` presented as an MCP API endpoint | `MCP.md` and others | `INVALID` | Replace with `ui-hub-mcp.onrender.com/mcp`, or label as a browser redirect |
| 3 | `ui-hub-backend-mcp.onrender.com` vs `ui-hub-mcp.onrender.com` | 12 vs 79 references | `VALID` both | Not an error, but three hostnames across the repo is a maintainability hazard. Owner decision on canonical naming. |

Phase 6 changed no application source for any of these, because in every case the
correct replacement depends on an owner confirmation of the live Render service
name. The CORS changes in Phase 6 are unrelated to hostnames and required none.

---

## 8. What this audit could not determine

- Whether `ui-hub.onrender.com` resolves. Requires DNS or network evidence, not
  source evidence. Phase 6 performs no network calls.
- Whether `ui-hub-mcp.onrender.com` currently responds. Same reason.
- Whether the Render service named `ui-hub-backend-mcp` was ever created, or
  whether the root blueprint was ever applied.
- Whether Cloudflare holds any role in the current deployment.

These remain `UNKNOWN`. They are recorded in `../tasks/OWNER_DECISIONS.md`
rather than guessed at.