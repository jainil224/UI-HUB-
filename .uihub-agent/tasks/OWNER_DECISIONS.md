# Owner Decision Register

Phase 6, task 6.26. Decisions that require the repository owner and that a
coding agent must not make, guess, or work around.

Status values: **OPEN**, **BLOCKED** (needs external access), **ANSWERED**.

---

## OD-01 — Which Render blueprint is authoritative?

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Choose one blueprint for the MCP service: `render.yaml`, `mcp-server/render.yaml`, or both for distinct services. |
| **Why required** | The root blueprint declares `ui-hub-backend-mcp` and starts only the backend; `mcp-server/render.yaml` declares `ui-hub-mcp` and starts the MCP server. Neither can be removed without knowing which service actually exists in Render. |
| **Options** | (a) `mcp-server/render.yaml` is authoritative; delete or archive the root file. (b) Root is authoritative; rewrite it to run MCP, or split its intent. (c) Both are intentional: root for the backend, `mcp-server/` for MCP — then name and document that explicitly. |
| **Agent must not assume** | That the root blueprint runs MCP (it does not); that the file with the more MCP-specific content is the live one; that deleting the unused-looking file is safe. |
| **Evidence** | `../infrastructure/DEPLOYMENT_CONFLICTS.md`; `npm run check:config` → `render-blueprint-count`, `render-blueprint-coherence` |

---

## OD-02 — Is the root blueprint's unused MCP build step intentional?

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Keep the `cd mcp-server && npm run build` step in the root blueprint, or remove it. |
| **Why required** | It compiles the MCP server and discards the output on a service that runs the backend. Either dead configuration or a half-finished unified deployment. |
| **Options** | (a) Remove the step. (b) Keep it and make the service actually run MCP. |
| **Agent must not assume** | That the step is harmless because it costs only build time; it also makes the rendered blueprint misleading to the next reader. |
| **Evidence** | Root `render.yaml:8` build vs `:9` start command |

---

## OD-03 — Should production MCP drop localhost origins?

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Remove `http://localhost:5173` and `http://localhost:3000` from the production `MCP_ALLOWED_ORIGINS` value. |
| **Why required** | Now that Phase 6 CORS enforcement is real, production MCP accepts browser traffic from any developer's local machine on those ports. No production workflow needs this. |
| **Options** | (a) Remove both from both blueprints. (b) Keep localhost and rely on API-key authentication to limit impact. |
| **Agent must not assume** | That development origins in a production blueprint are harmless now that enforcement exists — the opposite is true. |
| **Evidence** | `npm run check:config` → `mcp-allowed-origins-localhost-in-prod` |

---

## OD-04 — How is Render admin access assigned?

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | State who administers the Render services, and whether that is a team or an individual. |
| **Why required** | Both blueprints mark MongoDB, Firebase private key, Razorpay and Brevo credentials `sync: false`. Render's model offers only two outcomes: blueprints enabled (owner is a collaborator with commit and blueprint access) or not enabled (variables unset, service fails to start). Admin access is therefore managed somewhere not visible in this repository. |
| **Options** | (a) Document the current owner in `INFRASTRUCTURE.md`. (b) Move to a Render team with named members. |
| **Agent must not assume** | That `sync: false` is an access-control mechanism; it is not. Do not assume continuity if an individual leaves. |
| **Evidence** | `../infrastructure/DEPLOYMENT_CONFLICTS.md` §3 |

---

## OD-05 — What is the correct Render host for API key creation?

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Confirm whether `ui-hub.onrender.com` still exists, or whether the live host is `ui-hub-backend-mcp.onrender.com`. Then correct `cli/src/commands/login.ts:41` and the affected documentation. |
| **Why required** | No blueprint declares a service named `ui-hub`. Ten documentation files and one source prompt reference it. Choosing a replacement requires knowing the real service. |
| **Options** | (a) Service renamed to `ui-hub-backend-mcp` → update the prompt and docs. (b) Service no longer exists → remove the hint or point at the dashboard. (c) Both hosts valid for different purposes → document which is which. |
| **Agent must not assume** | That the CLI is broken: `cli/src/config.ts:5` correctly defaults to `https://ui-hub-mcp.onrender.com/mcp`. Only the human-readable prompt string is wrong. |
| **Evidence** | `../runtime/DOCUMENTATION_ENDPOINT_AUDIT.md` §1 |

---

## OD-06 — Production `VITE_API_URL`

| Field | Value |
|---|---|
| **Status** | **BLOCKED** — requires Vercel dashboard access |
| **Decision** | Unset or correct the production `VITE_API_URL` in the Vercel project settings and redeploy. |
| **Why required** | The shipped bundle inlines `https://ui-hub.onrender.com`, extracted from `/assets/index-DYhd2CmH.js`. `VITE_*` values are baked in at build time, so this cannot be fixed in code — only by rebuilding with the correct value. |
| **Options** | (a) Unset it, letting `apiConfig` use same-origin `/api`. (b) Set it to the correct absolute host. (c) Leave as-is if a Render frontend really serves the API. |
| **Agent must not assume** | That clearing the variable is harmless: the same-origin path depends on the Vercel rewrite working, which is currently broken by a separate 500. |
| **Evidence** | `../runtime/PRODUCTION_DEPLOYMENT_GATE.md`, `../runtime/PRODUCTION_BASELINE.md` |

---

## OD-07 — Vercel function 500 root cause

| Field | Value |
|---|---|
| **Status** | **BLOCKED** — requires Vercel dashboard access |
| **Decision** | Diagnose and fix the `api/index.js` module-load 500. |
| **Why required** | Every `/api/*` request on the Vercel deployment fails at module load. Until this is fixed, no same-origin API path works, and OD-06 cannot be verified. |
| **Options** | Requires dashboard logs; the cause is not determinable from source. |
| **Agent must not assume** | That the bundled include-files glob is sufficient; `vercel.json` includes `{backend/**,mcp-server/dist/**,mcp-server/package.json}` but nothing from `backend/node_modules` or `mcp-server/node_modules`. |
| **Evidence** | `../runtime/PRODUCTION_DEPLOYMENT_GATE.md` |

---

## OD-08 — MongoDB credential rotation

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Rotate the MongoDB Atlas password that was found in documentation during Phase 5. |
| **Why required** | A live-looking 10-character password appeared in placeholder-shaped `.uihub-agent/` content. It was redacted from four URIs and never committed, but a value that was once valid should be treated as exposed to anyone with repository access. |
| **Options** | (a) Rotate immediately in Atlas, update Render and Vercel dashboards, redeploy. (b) Defer, accepting the risk, and record the decision. |
| **Agent must not assume** | That removal from the working tree removes the exposure. It does not remove it from any prior clone or from the reader's memory of the pattern. |
| **Evidence** | `SECRET_HANDLING.md` §"The one real incident" |

---

## OD-09 — CORS production origin policy

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Confirm the final production allowlist for both the web API and MCP. |
| **Why required** | Phase 6 implemented enforcement and documented five production origins, but two are Vercel *preview* deployments and production `MCP_ALLOWED_ORIGINS` still contains localhost entries (OD-03). |
| **Options** | (a) Keep exactly the five documented origins. (b) Drop the preview origins. (c) Add specific new deployments individually — random per-PR previews are **not** permitted; a wildcard would re-open the hole Phase 6 closed. |
| **Agent must not assume** | That env additions replace the built-in list; they **union** with it, deliberately, so one environment cannot silently strip the production origin from another. |
| **Evidence** | `../APIs/CORS_CONTRACT.md` |

---

## OD-10 — Light-mode architecture

| Field | Value |
|---|---|
| **Status** | **OPEN** — out of Phase 6 scope |
| **Decision** | Whether to support light mode at all, and if so whether via a second theme or token overrides. |
| **Why required** | Phase 5 measured that light mode is worse than previously recorded: the token system is correct but the theme overrides defeat it. Fixing this is a design decision, not a hardening task. |
| **Options** | (a) Remove light-mode overrides. (b) Rebuild the theme on tokens. (c) Declare dark-only and delete light tokens. |
| **Agent must not assume** | That this is a small CSS fix, or that it belongs in a security phase. Phase 6 explicitly excluded it. |
| **Evidence** | `../runtime/PRODUCTION_BASELINE.md` §6 |

---

## OD-11 — Canonical Render hostname across documentation

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Choose one canonical Render hostname and standardise documentation on it. |
| **Why required** | Three hostnames coexist: `ui-hub-mcp.onrender.com` (79 references), `ui-hub.onrender.com` (43), `ui-hub-backend-mcp.onrender.com` (12). Both valid blueprint services are referenced, plus one that matches no service. |
| **Options** | (a) Document both live services distinctly and remove the dead host. (b) Consolidate on one. |
| **Agent must not assume** | That the most-referenced host is canonical. Reference counts record history, not authority. |
| **Evidence** | `../runtime/DOCUMENTATION_ENDPOINT_AUDIT.md` |

---

## OD-12 — Cloudflare configuration

| Field | Value |
|---|---|
| **Status** | **OPEN** |
| **Decision** | Determine whether Cloudflare fronts any production service, and if so record its role. |
| **Why required** | `DEPLOYMENT_MAP.md` describes a Render-behind-Cloudflare topology, and Phase 5 observed a Cloudflare managed challenge on `ui-hub.onrender.com`. Role membership could not be verified. |
| **Options** | (a) Confirm the topology and document it. (b) Remove Cloudflare from the description if it no longer applies. |
| **Agent must not assume** | That Cloudflare is or is not in the path; it is not observable from this repository. |
| **Evidence** | `../infrastructure/DEPLOYMENT_MAP.md`, `../runtime/UNKNOWN_REGISTER.md` |

---

## Summary

| ID | Topic | Status |
|---|---|---|
| OD-01 | Render blueprint authority | OPEN |
| OD-02 | Unused MCP build step | OPEN |
| OD-03 | Localhost origins in production | OPEN |
| OD-04 | Render admin access | OPEN |
| OD-05 | Correct Render host | OPEN |
| OD-06 | Production `VITE_API_URL` | BLOCKED |
| OD-07 | Vercel function 500 | BLOCKED |
| OD-08 | MongoDB rotation | OPEN |
| OD-09 | CORS production policy | OPEN |
| OD-10 | Light-mode architecture | OPEN (out of scope) |
| OD-11 | Canonical hostname | OPEN |
| OD-12 | Cloudflare configuration | OPEN |

## Related

- `../CONFLICTS.md` — recorded conflicts
- `../infrastructure/DEPLOYMENT_CONFLICTS.md` — blueprint conflict detail
- `../infrastructure/CONFIGURATION_OWNERSHIP.md` — what owns what
- `../runtime/DOCUMENTATION_ENDPOINT_AUDIT.md` — endpoint classification
- `../runtime/UNKNOWN_REGISTER.md` — questions that remain unanswered