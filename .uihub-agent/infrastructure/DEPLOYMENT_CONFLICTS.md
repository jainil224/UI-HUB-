# Deployment Configuration Conflicts

Created by Phase 6, task 6.13.

Phase 5 recorded that two Render blueprints exist. This document compares them
from verified file contents and asks for the owner decisions that a coding agent
cannot make. Phase 6 does not choose.

---

## 1. The two blueprints

### `render.yaml` (repository root)

Header comment: *"Render Blueprint for Unified UI-HUB Production Deployment
(Core Backend + MCP Server)"*.

What it actually declares:

| Property | Value |
|---|---|
| Service name | `ui-hub-backend-mcp` |
| `rootDir` | not set (defaults to repository root) |
| Build | `cd mcp-server && npm install && npm run build && cd ../backend && npm install` |
| Start | `cd backend && npm start` |
| Health | `/health` |
| Plan / region | starter / oregon |

**It builds `mcp-server` and then does not run it.** It compiles the MCP server
and discards the output, on a service whose start command launches the Express
backend instead. The "Unified ... (Core Backend + MCP Server)" in the title is
not what the file does.

### `mcp-server/render.yaml`

| Property | Value |
|---|---|
| Service name | `ui-hub-mcp` |
| `rootDir` | `mcp-server` |
| Build | `npm install && npm run build` |
| Start | `node dist/index.js` |
| Health | `/health` |
| Plan / region | starter / oregon |

This one does build and run the MCP server.

## 2. Difference table

| Aspect | `render.yaml` | `mcp-server/render.yaml` |
|---|---|---|
| Service name | `ui-hub-backend-mcp` | `ui-hub-mcp` |
| What actually runs | Express backend only | MCP server |
| `MCP_PORT` | absent | `3001` |
| MCP build step | yes (output unused) | yes |
| Backend install | yes | no |
| `BREVO_*`, `RAZORPAY_*` | present | absent |
| `MCP_SERVER_URL` | `https://ui-hub-mcp.onrender.com` | `https://ui-hub-mcp.onrender.com` |
| Secrets (`sync: false`) | MONGODB_URI, BREVO_API_KEY, RAZORPAY_KEY_ID/SECRET, FIREBASE_PRIVATE_KEY, REDIS_URL | MONGODB_URI, FIREBASE_PRIVATE_KEY, REDIS_URL |
| Health endpoint | `/health` | `/health` |

### Same key, different value

`MCP_ALLOWED_ORIGINS` is identical in both, so this is not currently a conflict:

```
https://ui-hub-design.vercel.app,http://localhost:5173,http://localhost:3000
```

Two observations:

1. It permits `http://localhost:5173` and `http://localhost:3000` in a
   **production** service. With Phase 6 CORS enforcement now real, that means
   production MCP accepts browser traffic from any developer's local machine.
   Nobody needs this; it is dev configuration inside a production blueprint.
2. It omits the two Vercel preview origins that the code allowlists.

`MCP_ADMIN_EMAILS` is also identical in both (three addresses, differing order
only).

## 3. Conflict: admin access is uncontrolled and has no operational owner

The root blueprint stores the **Firebase Admin private key** and the **MongoDB
URI** with `sync: false`, which means "do not put the value in git; the owner
sets it in the Render dashboard."

Render's `sync: false` cannot express "administrator access." In Render's model
there are only two outcomes per blueprint:

| Outcome | Result |
|---|---|
| Blueprints enabled for the repo | the owner is a **collaborator**, with commit, push and blueprint access |
| Blueprints not enabled | `sync: false` variables are simply **unset**, and the service fails to start |

Neither outcome is a third option. Admin access to production infrastructure,
and therefore the secrets above, is therefore managed somewhere that is not
visible in this repository — a personal account, an owner transfer, or a team
setting. Phase 5 was unable to verify Cloudflare role membership for exactly
this reason, and could not verify it here either.

This is recorded as a finding, not as a failure of either blueprint. It means:

- Production secret access is not reproducible from source.
- Continuity depends on knowledge held outside the repository.

## 4. Owner decisions required

| # | Decision | Why the agent cannot decide | Status |
|---|---|---|---|
| 1 | Which blueprint is authoritative for the MCP service: root, `mcp-server/`, or both for different services? | Determines which service name exists in Render. Cannot be inferred from source. | **UNDECIDED** |
| 2 | Is the root blueprint's unused MCP build step intentional? | Either dead configuration or a half-finished unified deployment. | **UNDECIDED** |
| 3 | Should production `MCP_ALLOWED_ORIGINS` drop the localhost entries? | Changes who can reach production MCP. | **UNDECIDED** |
| 4 | How is Render admin access assigned, and is it owned by a team or an individual? | Not expressible in a blueprint; not visible in source. | **UNDECIDED** |
| 5 | Should `MCP_SERVER_URL` remain a hard-coded literal in both blueprints? | Both hard-code `https://ui-hub-mcp.onrender.com`, while 12 references across `.uihub-agent/` (mostly `runtime/` baselines) name `ui-hub-backend-mcp.onrender.com`. Three distinct Render hostnames appear across the repository. | **UNDECIDED** |

## 5. What the coding agent must not assume

- Must not delete, merge, or "consolidate" either blueprint.
- Must not assume `render.yaml` runs the MCP server. It does not.
- Must not copy environment variables between the blueprints. They serve
  different services and intentionally differ.
- Must not treat `sync: false` as an access-control mechanism. It is not one.
- Must not infer the live Render configuration from either file. Both are
  proposals; the dashboard is the truth.
- Must not treat a localhost origin inside a production blueprint as harmless.

## 6. Machine-checkable warning (6.13)

`check:config` must report this as a **CONFLICT**, never CONSISTENT:

```
CONFLICT  render-blueprint: two Render blueprints declare different services
          render.yaml            -> ui-hub-backend-mcp (backend only)
          mcp-server/render.yaml -> ui-hub-mcp (mcp server)
          source of truth: UNDECIDED (owner decision required)
          see .uihub-agent/infrastructure/DEPLOYMENT_CONFLICTS.md
```

## 7. Related

- `CONFIGURATION_OWNERSHIP.md` — which file owns which setting
- `DEPLOYMENT_MAP.md` — hosts, services and how changes reach production
- `MCP.md` — MCP endpoints and configuration
- `../tasks/OWNER_DECISIONS.md` — the decision register
- `../security/SECURITY_VALIDATION.md` — validator catalog