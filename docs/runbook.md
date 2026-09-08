# UI HUB Deploy + Post-Deploy QA Runbook

Production topology:

| Service | Platform | Source | URL |
|---|---|---|---|
| Frontend (Vite/React) | Vercel | repo root via `vercel.json` | https://ui-hub-design.vercel.app |
| Backend REST API | Vercel serverless | `api/index.js` wraps `backend/src/server.js` | https://ui-hub-design.vercel.app/api |
| MCP server | Render | **UI-HUB-MCP repo** (`render.yaml`, standalone) | https://ui-hub-mcp.onrender.com/mcp |

All services auto-deploy on push to the default branch. Secrets (`MONGODB_URI`, `RAZORPAY_*`, `FIREBASE_*`, `BREVO_API_KEY`, `REDIS_URL`, `MCP_FIREBASE_*`) are `sync: false` and must be set once in the Render/Vercel dashboards.

## 0. Why the data is guarded

- **MCP** shows/reveals source via `src/data/sourceCode.json` — the ONLY source it reads
  (its Render service runs from `rootDir: mcp-server`, so it has no filesystem access to the
  frontend at runtime). Premium source is granted based on this file.
- **Backend** resolves source as `COMPONENT_FULL_SOURCES` → `EMBEDDED_SOURCE_CODE` →
  fs mapping → PascalCase fs fallback (unified Render deploy ships the whole repo).
- Coverage is enforced at **build time** so a missing premium component can never ship:
  - `mcp-server/package.json` `build`: `tsc && node scripts/check-source-coverage.mjs && node scripts/copy-data.mjs`
  - `backend/package.json` `test`: `npm run check:premium && node --test tests/`

## 1. Pre-deploy verification (run locally, all must pass)

```powershell
# MCP dataset coverage gate + build (writes dist/data/sourceCode.json)
cd mcp-server; npm run build
# MCP unit tests (54)
npm test
# Backend premium coverage gate + tests (15)
cd ../backend; npm test
# Backend probe: every premium id resolves source (43/43)
node src/scripts/checkPremiumCoverage.js
# CLI tests (30)
cd ../cli; npm test
# Frontend production build
cd ../frontend; npm run build
```

Expected: `check-source-coverage OK: 43/43 premium ids present (124 total)` and
`checkPremiumCoverage OK: 43/43 premium components resolvable (36 embedded, 7 via filesystem fallback)`.

## 2. Deploy

1. Commit and push **UI-HUB repo** to `main` (autodeploys Vercel frontend + `api/` backend).
2. Commit and push **UI-HUB-MCP repo** to `main` (autodeploys the standalone Render MCP service).
3. In Render confirm the MCP service reaches `Deploy succeeded` and healthy (`/health` returns 200).
4. In Vercel confirm the frontend build succeeded, the site is live, and `/api/health` returns 200.

> Note: the MCP server has its own GitHub repo/service. The UI-HUB repo no longer deploys the
> MCP service itself; the MCP is always consumed over HTTP at `https://ui-hub-mcp.onrender.com/mcp`.
> Backend env vars (`MONGODB_URI`, `FIREBASE_*`, `RAZORPAY_*`, `BREVO_API_KEY`, `REDIS_URL`) are
> set in the **Vercel** dashboard (the `api/` function), and MCP env vars in the **Render** dashboard.

## 3. Post-deploy QA checklist

### 3.1 Frontend (browser, logged out + free account)
- [ ] Hero/preview page for a premium component renders the demo, but the "View Source" /
      "Get Code" action is gated (locked badge / upgrade prompt), not served.
- [ ] Premium component download (ZIP) is blocked for free users.
- [ ] Logged-in as a **free** Firebase user: premium `isPremium` flag still respected; source
      endpoint for premium id returns 403 (not the code).
- [ ] Logged-in as a **Pro** user (Stripe/Razorpay purchased): ZIP + source both 200 for premium ids.

### 3.2 Backend REST (`https://ui-hub-design.vercel.app/api`)
- [ ] `GET /api/health` → 200.
- [ ] Free-token request for a premium id (`/api/.../source`) → `403 PREMIUM_ACCESS_REQUIRED`.
- [ ] Pro-token request for same id → `200` with source.
- [ ] Previously-broken ids now resolve: `black-hole`, `rubiks-cube`, `toonhub-hero`.

### 3.3 MCP (`https://ui-hub-mcp.onrender.com/mcp`)
- [ ] Request without API key → `-32001` (auth required).
- [ ] Free key (`uh_live_*` free tier) on a premium id → `PREMIUM_ACCESS_REQUIRED`.
- [ ] Pro key on a premium id → `200` with full source.
- [ ] **Regression sweep: all 43 premium ids return `200` via `getSourceCode` with a Pro key** —
      includes the three backfilled ids `black-hole`, `rubiks-cube`, `toonhub-hero`.
- [ ] Free key rate limit (100/day default) enforced via `MCP_RATE_LIMIT_FREE`.

### 3.4 CLI (smoke test with fresh keys)
- [ ] `ui-hub --version` → `0.1.0`, exit 0.
- [ ] No key + `search --term <free component>` → exit 3 with friendly "no key" message.
- [ ] Free key → premium `source` command exits with premium-required error.
- [ ] Pro key → `source <id>` prints/imports source for all 43 premium ids.

## 4. Failure runbooks

| Symptom | Cause | Fix |
|---|---|---|
| MCP returns not-found / empty source for a premium id | id missing from `sourceCode.json` | `cd mcp-server; npm run sync:data` (regenerates 124 entries), re-run `npm run build` guard, commit + deploy |
| Backend can't resolve a premium id | id neither embedded nor resolvable on disk | `cd backend; npm run sync:premium` (embeds idempotently), rerun `npm test`, commit + deploy |
| Deploy fails at `check-source-coverage` | canonical premium set has an id absent from data | run `npm run sync:data`; if the component file doesn't exist, fix the canonical list in `frontend/src/data/premiumComponents.ts` + `backend/src/config/premiumComponents.js` |
| Vercel frontend can't fetch API | CORS / allowed origins | confirm `MCP_ALLOWED_ORIGINS` (Render MCP service) + backend CORS include the prod origin |

## 5. Keeping data in sync (routine component changes)

```powershell
cd mcp-server; npm run sync:data   # regenerate sourceCode.json + metadata from frontend source
npm run build                      # guard + copy to dist
cd ../backend; npm run sync:premium
npm test
# commit all regenerated artifacts + deploy
```

Both repeatable, guarded, and idempotent by design.