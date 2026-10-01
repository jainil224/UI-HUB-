# Protected Paths

Created by Phase 6, task 6.17. Classifies paths by the care they require.

This file answers "how careful should I be here?" before you edit. It does not
replace `DO_NOT_CHANGE.md`, which lists things that must not change at all.

---

## CRITICAL — load-bearing; a mistake is a security, money, or data incident

| Path | Why critical |
|---|---|
| `backend/src/routes/paymentRoutes.js` | Razorpay order creation, payment verification, signature checks. A flaw here can accept unpaid orders or reject paid ones. |
| `backend/src/services/accessService.js` | Entitlement and access decisions. Determines who may download premium assets. |
| `backend/src/middleware/auth.js` | Firebase ID token verification. Weakening it authenticates anyone. |
| `backend/src/middleware/rateLimiters.js` | Backend rate limiting (the backend has a single pluralised file, not `rateLimiter.js`). |
| `backend/src/utils/verifySignature.js` | Webhook signature verification via `timingSafeEqual`. |
| `mcp-server/src/middleware/auth.ts` | MCP API-key authentication (`Bearer uh_live_...`). |
| `mcp-server/src/middleware/dashboardAuth.ts` | MCP dashboard authentication. |
| `mcp-server/src/middleware/requireAdmin.ts` | MCP admin gate. |
| `mcp-server/src/services/apiKeyService.ts` | API key creation, hashing, verification. |
| `mcp-server/src/services/permissionService.ts` | MCP permission resolution. |
| `mcp-server/src/services/mongo.ts` | MCP database connection. (Named `mongo.ts`, not `mongoService.ts`.) |
| `mcp-server/src/config/corsPolicy.ts` | CORS enforcement for MCP. Removing enforcement re-opens the Phase 6 fix. |
| `backend/src/config/corsPolicy.js` | CORS enforcement for the web API. Same. |
| `backend/src/server.js` | Middleware order. CORS before helmet/auth changes behaviour; see `../APIs/CORS_CONTRACT.md`. |
| `backend/src/services/mongoService.js` | Database connection and writes. |
| `render.yaml`, `mcp-server/render.yaml` | Deployment topology and secrets wiring. Conflicts unresolved — see `../infrastructure/DEPLOYMENT_CONFLICTS.md`. |
| `vercel.json` | Routing. A bad rewrite silently breaks API or MCP availability. |
| Any `*.pem`, `*.key`, `service-account.json` | Credentials. Never commit; never paste into docs. |

## HIGH RISK — behaviour is subtle; tests may not cover the change

| Path | Why high risk |
|---|---|
| `backend/src/routes/` (other than payments) | Route surface consumed by the frontend and CLI. |
| `backend/src/config/premiumComponents.js` | Premium component entitlement list. |
| `backend/src/middleware/validators.js` | Request validation. |
| `mcp-server/src/middleware/rateLimiter.ts` | MCP rate limiting. |
| `mcp-server/src/middleware/errorHandler.ts` | Error shape and status codes; changing it alters API contracts. |
| `mcp-server/src/config/env.ts` | Environment parsing; silent defaults can disable a required value. `allowedOrigins` already defaults to empty. |
| `mcp-server/src/services/auditService.ts` | Audit trail recording. |
| `mcp-server/src/services/firebase.ts` | Firebase admin init for MCP. |
| `mcp-server/src/routes/dashboard.ts`, `mcp-server/src/routes/admin.ts` | MCP dashboard and admin APIs. |
| `mcp-server/src/routes/mcp.ts` | MCP JSON-RPC tool surface. |
| `mcp-server/src/tools/` | Individual MCP tool implementations. |
| `mcp-server/src/services/componentService.ts` | Component lookup used by MCP tools. |
| `backend/src/services/firebaseService.js` | Firebase admin init for the backend. |
| `backend/src/services/brevoService.js` | Outbound transactional email. |
| `frontend/src/routing/` | SPA routing and Vercel rewrite assumptions; covered by `vercelRouting.test.ts`. |
| `frontend/src/lib/firebase.ts` | Client Firebase init. |
| `frontend/src/utils/apiConfig.ts` | API base resolution. |
| `cli/src/config.ts` | CLI endpoint default (`DEFAULT_ENDPOINT`). |
| `frontend/src/index.css` | The live theme. See `DO_NOT_CHANGE.md` §6. |

## GENERATED — edit the source, then regenerate

| Path | Source | Regenerate |
|---|---|---|
| `mcp-server/dist/**` (83 tracked files) | `mcp-server/src/**` | `npm run generate` |
| `mcp-server/src/data/*.json` → `dist/data/*.json` | the `src/data` JSON itself | `npm run generate` |
| `cli/dist/**` (23 tracked files) | `cli/src/**` | `npm run build:cli` |
| `.uihub-agent/PROJECT_MAP.json` | repository tree | `node .uihub-agent/scripts/generate-map.mjs` |

**Never hand-edit a file under `mcp-server/dist/`.** Correct workflow:

```
edit source → npm run generate → npm run check:generated → commit both source and dist
```

Tracked output exists because `vercel.json` bundles `mcp-server/dist/**` into the
serverless function. The consequence is that a source edit without regeneration
ships stale data to production while every test still passes. `check:generated`
is what prevents that; see `../infrastructure/GENERATED_ARTIFACTS.md`.

## DOCUMENTATION — must match reality

| Path | Rule |
|---|---|
| `.uihub-agent/**` | Update when behaviour changes. `check:knowledge` verifies internal consistency. |
| `README.md`, `MCP.md`, `docs/**` | Endpoints must match deployment config. `check:docs` verifies the high-value claims. |
| `agent.md` | The phase contract itself. |
| `.github/workflows/*.yml` | CI is configuration; changes affect every push. |

Never document an endpoint that no configuration supports, and never document a
secret value — see `../security/SECRET_HANDLING.md`.

## SAFE / NORMAL

| Path | Note |
|---|---|
| `frontend/src/components/` presentational components | Verify visually after changes. |
| `frontend/src/pages/` non-dashboard pages | Route changes need care; content changes are low risk. |
| `frontend/src/hooks/`, `frontend/src/utils/` (non-auth) | |
| `backend/tests/`, `mcp-server/tests/`, `frontend/src/**/*.test.ts`, `cli/tests/` | Test code. |
| `mcp-server/src/services/analyticsService.ts` | Non-authoritative analytics. |

---

## Pre-change checklist (6.18)

Before changing a **CRITICAL** or **HIGH RISK** path:

1. **Search consumers.** `grep -rn "<symbol>" --include=*.ts --include=*.js`
   across `backend`, `mcp-server`, `frontend`, `cli`.
2. **Identify dependencies.** What does this file import, and what imports it?
3. **Check protected invariants.** Does the change affect auth, CORS, payments,
   entitlements, routing, or secret handling? If yes, name the invariant
   explicitly before editing.
4. **Run targeted tests first.** Establish that the tests pass *before* the
   change, so a later failure is attributable.
5. **Make the smallest change that works.** Do not refactor adjacent code.
6. **Re-run the full suite**, not just the targeted tests.

## Post-change checklist (6.19)

After any behaviour-affecting change:

| Change type | Must update |
|---|---|
| Architecture | `architecture/ARCHITECTURE.md`, `PROJECT_MAP.json` |
| API route, request or response shape | `APIs/API_OVERVIEW.md`, `APIs/API_ARCHITECTURE.md` |
| CORS, auth, secret handling | `APIs/CORS_CONTRACT.md`, `security/SECURITY_OVERVIEW.md` |
| Feature behaviour | `features/FEATURES.md` |
| Deployment, env var, blueprint | `infrastructure/INFRASTRUCTURE.md`, `ENVIRONMENT_CONTRACT.md`, `DEPLOYMENT_MAP.md`, `CONFIGURATION_OWNERSHIP.md` |
| Protected-path behaviour | this file and `DO_NOT_CHANGE.md` |
| Source-precedence rule | `../AGENT.md` |
| Known conflict or contradiction | `../CONFLICTS.md` |

Then run:

```bash
npm run check          # all six validators
```

## Production data (6.29)

**Phase 6 performed zero production writes.** This remains true for any change
to a protected path unless the owner separately authorises data operations.
Specifically do not, without explicit authorisation: update users, payments,
entitlements, or MCP configuration; create indexes; delete data.

## Related

- `DO_NOT_CHANGE.md` — absolute prohibitions
- `../infrastructure/GENERATED_ARTIFACTS.md` — generated-file policy
- `../APIs/CORS_CONTRACT.md` — the CORS invariant
- `../security/SECURITY_VALIDATION.md` — how to verify a security change