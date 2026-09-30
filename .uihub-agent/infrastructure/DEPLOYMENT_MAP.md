# DEPLOYMENT MAP - Phase 4

Where each piece of UI-HUB is built, served from, and configured, and what has to
happen for each to work in production. Written **2026-09-30**, Phase 4.

Purpose: stop the next agent from re-deriving which host serves which artefact,
and from proposing a fix on one host while traffic goes to another.

---

## 1. Services

| # | Service | Public hostname | Platform | Live state | Serves |
|---|---|---|---|---|---|
| S1 | Frontend | `ui-hub-design.vercel.app` | Vercel (static) | **200** | React SPA |
| S2 | Backend + MCP API | `ui-hub-design.vercel.app/api/*` | Vercel (serverless fn) | **500** | Express API |
| S3 | Frontend/API pair | `ui-hub.onrender.com` | Render behind Cloudflare | **503** | Intended production API |
| S4 | MCP server | `ui-hub-mcp.onrender.com/mcp` | Render behind Cloudflare | **503** | MCP protocol |
| S5 | Backend/MCP pair | `ui-hub-backend-mcp.onrender.com` | Render behind Cloudflare | **404** | Blueprint service |
| S6 | Database | `cluster0.<cluster-host>.mongodb.net` | MongoDB Atlas | **Reachable** | `uihub`, 12 collections |
| S7 | Frontend bundle | `https://ui-hub.onrender.com/` | Render | **503** | Static hosting per blueprint |

S2 and S3 are the important subtlety: **the same backend is deployed to two
platforms**, and the browser currently calls S3 while a fix to S2 would change
nothing user-visible. See §3.

---

## 2. How a request actually flows today

```
Browser
  |
  |-- GET /                     --> S1  200  static shell
  |
  +-- GET /health               --> S1  200  <-- SPA shell, NOT a health check
  |
  +-- XHR /api/v1/...           --> S3  503  <-- Cloudflare refuses
  |
  +-- (XHR to S2 never happens: getApiBaseUrl() returns the Render host)
```

Two consequences:

1. **Vercel's function is dead code in the browser's path.** The served bundle
   contains the Render API host, and `getApiBaseUrl()` prefers `VITE_API_URL` in
   production. Repairing S2 alone cannot restore the site.
2. **`/health` on the frontend hostname is a false signal.** It returns 200 with
   a 6474-byte HTML SPA shell, byte-identical to `/`. Anyone monitoring
   `https://ui-hub-design.vercel.app/health` to decide whether the backend is
   healthy is reading the frontend. The real endpoint is `/api/health`.

---

## 3. The two-host problem, and the one change that resolves it

Today there are two candidates for "the API". The owner has designated **S2, the
Vercel function, as canonical**, which also gives one hostname for the frontend
and the API.

To make that true, one environment variable must change on the frontend
deployment:

| `VITE_API_URL` | Browser calls | Same-origin | CORS needed |
|---|---|---|---|
| `ui-hub.onrender.com` (current) | S3 - 503 | No | Yes |
| `https://ui-hub-design.vercel.app` | S2 - 500 until redeployed | Yes | Yes |
| **unset** (recommended) | `window.location.origin` -> S2 | **Yes** | No |

**Recommendation: unset `VITE_API_URL`.** `getApiBaseUrl()` already falls back to
`window.location.origin`, so unsetting is sufficient - no code change. It also
makes every Vercel preview deployment self-contained, which matters because
previews are how this work will be verified before promotion.

CORS is already compatible. `backend/src/server.js` lists the Vercel origins, so
the explicit-value option works too if a distinct host is ever needed.

---

## 4. Deploy requirements per service

### S2 - Vercel function (the canonical API)

- Build: `vercel.json` -> `mcp-server` build, then `includeFiles` ships
  `backend/**` and `mcp-server/**` into the function bundle.
- `api/index.js` is the entrypoint and imports the backend `server.js` app.
- Root `package.json` must declare `axios`, `mongodb`, `web-push`, `zod`. Phase 3
  added these; they were the most likely cause of `FUNCTION_INVOCATION_FAILED`.
- **Not yet verified in production.** Local import under `VERCEL=1` succeeds
  (~24 s cold), but no deploy has run. A redeploy is required before the 500
  can be considered fixed.
- Cold-start cost is real. ~24 s locally is well past a default 10 s function
  timeout; confirm the configured max duration is sufficient.

### S3/S4/S5 - Render

- Defined in `render.yaml`. `MONGODB_URI` and `REDIS_URL` use `sync: false`, so
  their values live only in the Render dashboard.
- `render.yaml` declares **no `VAPID_*` variables and no `EMAIL_TEST_SECRET`**.
  Given §3 of the baseline (zero push subscriptions), push is unused.
- All three Render hostnames answer at a Cloudflare edge. Recovery requires
  Cloudflare and Render dashboard access, neither of which this phase has.
- If S2 becomes canonical, S3/S4 are redundant. Decide whether to keep them
  (fallback) or retire them (cost) - the blueprint specifies `plan: starter`,
  which **bills while active**, so an idle service is not free. This is an owner
  decision and was not acted on.

### S6 - Atlas

- Reachable. `uihub` holds 12 collections and 33 users.
- Read-only access confirmed working from a developer machine, which means
  future phases can close database unknowns without owner help.

### Build artefacts

| Path | Tracked? | Note |
|---|---|---|
| `frontend/dist/` | No (gitignored) | Rebuilt per deploy. |
| `cli/dist/` | No (gitignored) | Rebuilt per publish. |
| `mcp-server/dist/` | **Yes** | Runs in production. **Must be committed in step with `src`.** |
| `api/` | Yes | Vercel entrypoint, thin. |

`mcp-server/dist` being tracked is the single most dangerous property in the
build: it is what the server executes, yet it is easy to forget. It was stale by
three components and the entire Phase 3 config change. Fixed in this phase and
`check-source-coverage.mjs` should be extended to compare `src/data` against
`dist/data` so this cannot silently recur.

---

## 5. Environment variables by service

Never read live values; presence only. Set from the platform dashboard.

| Variable | S2 Vercel | S3 Render | Notes |
|---|---|---|---|
| `VITE_API_URL` | **build-time** | n/a | Unset to force same-origin. |
| `MONGODB_URI` | required | required | `sync: false`; live value never read. |
| `REDIS_URL` | optional | optional | Limiter degrades safely without it. |
| `EMAIL_TEST_SECRET` | optional | not declared | Unset -> email routes 503, by design. |
| `VAPID_*` | not declared | not declared | No subscriber has ever existed. |
| `RAZORPAY_*` | required | required | Placeholders only in tracked example files. |

`VITE_API_URL` is inlined **at build time**, so changing it requires a
rebuild, not just a restart. A Vercel redeploy is the mechanism.

---

## 6. CI and how these changes reach production

`.github/workflows/ci.yml` runs on pushes to `main`, PRs targeting `main`, and
manual dispatch. It has **never executed remotely** - it was added in Phase 3
and has only run locally.

Consequences:

- A push to `phase4/production-recovery` does **not** trigger CI.
- Remote validation needs a **pull request** to `main`, or a manual dispatch.
- Neither `gh` nor a browser session to GitHub is available here, so this is an
  owner action.

Deployment is not automated. Nothing in the repository promotes `main` to Vercel
or Render. Deployment is a manual dashboard or Git-push-to-provider action.

---

## 7. Owner action list, in dependency order

1. **Deploy the branch** so the Vercel function can be retested. If Vercel has
   Git integration, pushing the branch produces a preview; otherwise redeploy
   `main` after merge.
2. **Unset `VITE_API_URL`** on the frontend build, then rebuild. Without this,
   fixing the function changes nothing.
3. **Retest** `/api/health` and `/api/v1/*` on the Vercel function.
4. **Read the Vercel function logs** if step 3 still returns 500. The repository
   side is already correct, so a persistent 500 is an environment or bundling
   difference, and the log names the exact missing specifier.
5. **Decide the fate of S3/S4.** Both are down and both bill while active.
6. **Inspect Cloudflare and Render** for the 503/404 causes.
7. **Open a PR** from `phase4/production-recovery` to run CI remotely.
8. Optionally configure `EMAIL_TEST_SECRET` and VAPID keys, or remove the dead
   code paths.
