# Security Overview

Phase 6, task 6.28. Orientation document. It links to the detailed contracts
rather than restating them, so there is one authoritative place for each control.

## Trust boundaries

```
Browser (UI-HUB SPA, Vercel)
   │  Authorization: Firebase ID token
   ▼
/api/*  ──────────────► Vercel serverless function  (api/index.js)
                          │  bundled with backend/** + mcp-server/dist/**
                          ▼
                        backend (Express, MongoDB, Firebase Admin, Razorpay)

Browser (MCP dashboard)  ──►  MCP server (Render)  ──►  MongoDB, MCP data
   │                          Authorization: Bearer uh_live_... API key
CLI (ui-hub) ─────────────────► same MCP server, no Origin header
```

## Controls by surface

| Control | Where | Contract |
|---|---|---|
| Authentication (web) | `backend/src/middleware/auth.js` — Firebase ID token | `../APIs/API_ARCHITECTURE.md` |
| Authentication (MCP) | `mcp-server/src/middleware/auth.ts` — API key | `../APIs/MCP_DEPLOYMENT_CONTRACT.md` |
| Authorization | `accessService.js`, `permissionService.ts`, `requireAdmin.ts` | `../APIs/API_ARCHITECTURE.md` |
| CORS (web) | `backend/src/config/corsPolicy.js` | `../APIs/CORS_CONTRACT.md` |
| CORS (MCP) | `mcp-server/src/config/corsPolicy.ts` | `../APIs/CORS_CONTRACT.md` |
| Security headers | `backend/src/server.js` — helmet, CSP | below |
| Rate limiting | `backend/src/middleware/rateLimiters.js`, `mcp-server/src/middleware/rateLimiter.ts` | `../APIs/API_ARCHITECTURE.md` |
| Payment integrity | `backend/src/routes/paymentRoutes.js`, `verifySignature.js` | `../APIs/API_ARCHITECTURE.md` |
| Secret handling | environment + gitignored files | `SECRET_HANDLING.md` |
| Secret detection | `.uihub-agent/scripts/secret-scan.mjs` | `SECRET_VALIDATION.md` |
| Deployment config | `render.yaml`, `mcp-server/render.yaml`, `vercel.json` | `../infrastructure/DEPLOYMENT_CONFLICTS.md` |

## CORS: what Phase 6 changed

Both API surfaces logged a blocked origin and then **allowed it anyway**
(`callback(null, true)` in the rejection branch). Two additional bypasses —
`origin.endsWith('.vercel.app')` and `origin.includes('localhost')` — made the
allowlists decorative.

Reconstructed against the Phase 5 code, **7 of 7** hostile origins were accepted,
including `https://attacker.vercel.app` and `https://evil.example/?localhost`.
Both policies now require exact origin matches. Full detail, evidence and the
reason missing `Origin` is still permitted are in `../APIs/CORS_CONTRACT.md`.

## Credentials and cookies

There are **no cookies and no server-side sessions**. Every authenticated request
carries an explicit `Authorization` header:

- web API: Firebase ID token
- MCP: `Bearer uh_live_...` API key

`credentials: true` is set on both CORS policies, so `Access-Control-Allow-Origin: *`
is never valid and never emitted. It governs whether the browser will expose the
response; it is not evidence of ambient cookie auth.

## Security headers

`backend/src/server.js` sets helmet with an explicit CSP. Two exemptions are
deliberate and documented in-line:

- `crossOriginEmbedderPolicy: false` — Razorpay's checkout iframe.
- `frameSrc: ["https://api.razorpay.com"]` — Razorpay payment frames.

`connectSrc` and the CORS allowlist are **separate controls that must agree**.
An origin allowed by CORS but absent from `connectSrc` is blocked by the browser
before CORS ever applies. `npm run check:config` reports divergence as a
CONFLICT; currently it reports `http://localhost:5173` and
`http://localhost:3000` in that state, which is harmless for local development
and worth recording rather than silently "fixing".

## Payment security boundaries

- Order creation and signature verification are separate steps.
- Webhook verification uses `timingSafeEqual`, not `===`, in
  `backend/src/utils/verifySignature.js`.
- `RAZORPAY_KEY_SECRET`, `RAZORPAY_KEY_ID`, `MONGODB_URI`,
  `FIREBASE_PRIVATE_KEY`, `BREVO_API_KEY` and `REDIS_URL` are all `sync: false`
  in both blueprints: values live in the Render/Vercel dashboards, never in git.

**`sync: false` is not access control.** Render's blueprint model has two
outcomes — blueprints enabled (owner is a collaborator with blueprint and commit
access) or not enabled (variables unset, service fails to start). Admin access
therefore lives outside this repository. See
`../infrastructure/DEPLOYMENT_CONFLICTS.md` §3.

## Production data rules

Phase 6 performed **zero production writes**. No users, payments, entitlements or
MCP configuration were updated; no indexes created; no data deleted. Any future
protected-path change requires separate owner authorisation. See
`../rules/PROTECTED_PATHS.md`.

## CI security

`.github/workflows/ci.yml` is now trackable (Phase 6 removed `.github/` from
`.gitignore`). It defines **9 jobs across 4 dependency tiers**, so a failure in
one concern is never reported as success in another:

| Tier | Job | Command | Fails on | Blocking |
|---|---|---|---|---|
| 1 | `security-scan` | `check:secrets` then `check:tracking` | any REAL_SECRET; untracked knowledge/CI; an unignored secret | **yes — gates everything** |
| 2 | `knowledge` | `check:knowledge` | missing/inconsistent knowledge files | yes |
| 2 | `config-drift` | `check:config`, `check:docs` | deployment/config CONFLICT | no — `continue-on-error` |
| 2 | `generated` | `check:generated` | stale tracked `mcp-server/dist` | yes |
| 2 | `build-frontend`, `build-mcp`, `build-cli` | per package | compile failure | yes |
| 2 | `test-backend`, `test-mcp`, `test-cli`, `test-frontend` | per package | test failure | yes |
| 2 | `typecheck-frontend` | `npm run lint` (`tsc --noEmit`) | 61 pre-existing errors | no — `continue-on-error` |

Every tier-2 job declares `needs: [security-scan]`, so a commit containing a
secret cannot be built, tested or published on the strength of a passing test
run. `needs:` is used rather than steps within one job, because a sequential job
cannot express "the secret scan gates the build".

Two jobs are deliberately non-blocking, and neither is a way of hiding a
failure:

- **`config-drift`** reports **4 real CONFLICTs** awaiting owner decisions.
  Making it blocking would mean silencing true findings until an owner acts.
  Output is still published on every run.
- **`typecheck-frontend`** fails with **61 errors across 23 files**, all from
  earlier UI commits. Phase 6 changed no frontend source. The job is kept
  visible so the count can be tracked rather than deleted; see
  `../runtime/TYPECHECK_BASELINE.md`.

Scanner output contains only file, line, detector, type and a redacted
fingerprint — **never the matched value**.

## Agent security rules

- Never commit a credential. See `SECRET_HANDLING.md`.
- Never document a real endpoint as live unless a configuration in this
  repository supports it.
- Never resolve a conflict between documentation and source by editing the
  documentation to match an assumption. Record it in `../CONFLICTS.md`.
- When two sources disagree, follow the precedence order in `../AGENT.md` and
  record the disagreement rather than silently choosing.
- Never edit generated artifacts under `mcp-server/dist/` or `cli/dist/`.

## Known open items

| Item | Why it is still open |
|---|---|
| Two Render blueprints | Owner must choose; see `../infrastructure/DEPLOYMENT_MAP.md` conflicts and OD-01 |
| `ui-hub.onrender.com` referenced as live | Owner must confirm the current Render service name; OD-05 |
| `VITE_API_URL` baked into the shipped bundle | Requires a Vercel dashboard change and rebuild; OD-06 |
| Vercel `/api/*` 500 | Module-load failure, needs dashboard logs; OD-07 |
| Frontend typecheck failing (61 errors / 23 files) | Pre-existing, from earlier UI commits; documented, not fixed; `../runtime/TYPECHECK_BASELINE.md` |
| MongoDB credential rotation | Owner action; the value is in git **history** for `.env.example` but was never in the file at HEAD; OD-08 |
| Localhost origins in the production MCP allowlist | Owner must confirm production policy; OD-03 |

## Related

- `SECRET_HANDLING.md` — where secrets live, how they are handled
- `SECRET_VALIDATION.md` — how to verify a security change
- `../APIs/CORS_CONTRACT.md` — the CORS invariant
- `../rules/PROTECTED_PATHS.md` — path classification and change checklists
- `../tasks/OWNER_DECISIONS.md` — decisions requiring an owner
- `../CONFLICTS.md` — the conflict register