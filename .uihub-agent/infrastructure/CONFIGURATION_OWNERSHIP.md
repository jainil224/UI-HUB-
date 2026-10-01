# Configuration Ownership

Phase 6, task 6.14. Defines which file is authoritative for each configuration
surface, and where each one applies.

`MANUAL` means a human edits it. `GENERATED` means a command produces it and it
must never be hand-edited. `HYBRID` means source files are authoritative and
derived values are produced by a script.

## Ownership table

| Configuration | File | Owner scope | Environment | Source of truth | Manual / Generated | Notes |
|---|---|---|---|---|---|---|
| Frontend API host | `frontend/.env` (`VITE_API_URL`) | Frontend build | Build-time | `vercel.json` (production dashboard override) | MANUAL | Baked in at build time; not runtime-resolvable. Documented drift in `runtime/DOCUMENTATION_ENDPOINT_AUDIT.md`. |
| Vercel rewrites | `vercel.json` | Frontend hosting | Production | `vercel.json` | MANUAL | Three rewrites: `/api/(.*)`, `/health`, `/(.*)`. Anything else falls to the SPA shell. |
| Vercel function bundling | `vercel.json` → `functions["api/index.js"].includeFiles` | Frontend hosting | Production | `vercel.json` | MANUAL | Determines which backend/MCP files ship into the function. Currently `{backend/**,mcp-server/dist/**,mcp-server/package.json}`. |
| Unified Render blueprint | `render.yaml` | Root deployment | Production | **UNDECIDED** | MANUAL | Service `ui-hub-backend-mcp`; actually starts only the backend. See `DEPLOYMENT_CONFLICTS.md`. |
| MCP Render blueprint | `mcp-server/render.yaml` | MCP deployment | Production | **UNDECIDED** | MANUAL | Service `ui-hub-mcp`; starts `node dist/index.js`. |
| Backend CORS origins | `backend/src/config/corsPolicy.js` (+ `ALLOWED_ORIGINS`) | Web API | All | Source file, env unions additions | HYBRID | Built-in defaults in code; environment may only add. |
| MCP CORS origins | `mcp-server/src/config/corsPolicy.ts` (+ `MCP_ALLOWED_ORIGINS`) | MCP server | All | Source file, env unions additions | HYBRID | Separate policy from the web API; see `../APIs/CORS_CONTRACT.md`. |
| Backend CSP / headers | `backend/src/server.js` (helmet config) | Web API | All | `backend/src/server.js` | MANUAL | `connectSrc` and CORS must be kept in agreement; `check:config` reports divergence. |
| MCP env schema | `mcp-server/src/config/env.ts` | MCP server | All | `mcp-server/src/config/env.ts` | MANUAL | Parses and defaults. `allowedOrigins` defaults to empty, which is why the CORS policy supplies its own defaults. |
| Firebase admin credentials | `backend/service-account.json`, `FIREBASE_*` env vars | Backend | All | Environment / gitignored file | MANUAL | Never committed. `backend/.gitignore:13`. |
| MongoDB URI | `MONGODB_URI` env var | Backend + MCP | All | Environment, `sync: false` in blueprints | MANUAL | Never committed. Rotation is an owner action. |
| Razorpay keys | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Payments | Production | Environment, `sync: false` | MANUAL | Root blueprint only. |
| MCP generated data | `mcp-server/src/data/*.json` → `mcp-server/dist/data/*.json` | MCP server | All | Source JSON | GENERATED | `npm run generate`; freshness guarded by `check:generated`. Never hand-edit `dist`. |
| MCP component registry | `mcp-server/dist/data/premiumComponents.json` | MCP server | All | `src/data/premiumComponents.json` | GENERATED | 41/41 premium IDs verified by `check-source-coverage.mjs` at build. |
| CLI published artifact | `cli/dist/` | CLI | npm publish | `cli/src/` via build | GENERATED | Published from `dist`; ships its own lockfile (`cli/.gitignore` negates `dist/`). |
| Root npm scripts | `package.json` | Repo | All | `package.json` | MANUAL | Includes all `check:*` validators added in Phase 6. |
| Knowledge index | `.uihub-agent/PROJECT_MAP.json` | Docs | All | `.uihub-agent/scripts/generate-map.mjs` | GENERATED | Regenerate after structural change. |
| Knowledge base | `.uihub-agent/**` | Docs | All | Human-authored | MANUAL | Validated by `check:knowledge`. |

## Conflict rules

1. **Two blueprints, one deployment.** `render.yaml` and `mcp-server/render.yaml`
   both propose Render services. Neither is authoritative until the owner
   decides. `check:config` reports this as a permanent `CONFLICT`.
2. **CORS and CSP are separate controls.** Adding an origin to the CORS policy
   without adding it to `connectSrc` results in the browser blocking the
   request before CORS applies.
3. **Environment variables union, never replace.** Both CORS policies union
   environment additions with built-in defaults.
4. **Secrets belong in the environment, not in `sync: false` fields.** `sync:
   false` means "set this in the dashboard"; it is not an access-control
   mechanism.

## Regeneration commands

| Command | Purpose |
|---|---|
| `npm run generate` | Rebuild `mcp-server/dist` from source |
| `node .uihub-agent/scripts/generate-map.mjs` | Regenerate `PROJECT_MAP.json` |
| `npm run check:generated` | Verify tracked `dist` matches a fresh build |
| `npm run check:knowledge` | Verify the knowledge base is internally consistent |

## Related

- `DEPLOYMENT_CONFLICTS.md` — the blueprint conflict in detail
- `ENVIRONMENT_CONTRACT.md` — every environment variable
- `GENERATED_ARTIFACTS.md` — generated-file policy
- `../APIs/CORS_CONTRACT.md` — CORS policy ownership