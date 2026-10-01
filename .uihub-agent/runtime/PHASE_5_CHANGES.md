# PHASE 5 — Production Connectivity, API Routing & Deployment Contract

**STATUS: PARTIAL** — code and contracts complete; production repair blocked on
owner dashboard access.

Phase 4 established that the MCP path and the frontend API path are separate
concerns. Phase 5 turned that into an enforced contract and corrected the record
of why production is broken.

---

## 1. TASK UNDERSTANDING

Make the frontend's API destination deterministic and verifiable, document the
real deployment topology, and separate code defects from dashboard
misconfiguration. Phase 5 changed code only where the defect was in source. It
did not touch any dashboard, deployment, or database.

## 2. CANONICAL ARCHITECTURE

| Surface | Owner | Base | Protocol | Auth |
|---|---|---|---|---|
| Web API | Vercel function | same origin | REST | Firebase ID token / session |
| Frontend | Vercel static | `ui-hub-design.vercel.app` | HTML/JS | Firebase web SDK |
| MCP | Render | `ui-hub-mcp.onrender.com/mcp` | MCP over SSE | `Bearer uh_live_...` |
| Database | MongoDB Atlas | cluster `uihub` | — | — |
| Redis | none | not configured | — | — |

The web API and MCP are **different surfaces with different auth**. Merging them
is a defect.

## 3. API BASE URL AUDIT

- **Production:** `window.location.origin`. Correct.
- **Development:** `http://localhost:5000`, or `protocol//ip:5000` when a LAN IP
  is passed.
- **`VITE_API_URL`:** optional, opt-in, validated. External absolute http(s) URLs
  are honoured; malformed values warn and fall back to same-origin; known-dead
  hosts (`ui-hub.onrender.com`, `ui-hub-backend-mcp.onrender.com`) warn
  loudly but are still honoured rather than silently overridden.

Resolution logic was extracted into a pure `resolveApiBaseUrl(env, loc)` so all
of it is unit-testable. 20 tests pin the matrix.

Before Phase 5, `checkout.ts` and `PricingPage.tsx` used
`import.meta.env.VITE_API_URL || getApiBaseUrl()`, which read the raw value and
bypassed validation. Now there is one resolution path.

## 4. HARDCODED HOST AUDIT

| Host | Class | In build |
|---|---|---|
| `ui-hub.onrender.com` | dead Render web API | **0 files** |
| `ui-hub-backend-mcp.onrender.com` | blueprint name, never deployed | **0 files** |
| `ui-hub-mcp.onrender.com` | MCP, correct owner | 2 files (`mcpConfig-BJTXtQ2e.js`, `LibraryPage-nB8pXJi6.js`) |
| `*.vercel.app` | production | expected |

The live bundle's Render host is **inlined at build time** from a Vercel
dashboard `VITE_API_URL`, not present in source. Proof: `vercel.json` declares no
`env` block (asserted by test), and a build of the current tree contains 0
web-API Render hosts.

## 5. VERCEL ROUTING

```
/api/(.*)   → /api/index.js      → backend/src/server.js
/health      → /api/index.js      → backend/src/server.js   [added in Phase 5]
/(mcp)       → /index.html        SPA — NOT the MCP endpoint
/(.*)        → /index.html        SPA
```

The `/health` rewrite must stay between the `/api` rule and the SPA fallback.

## 6. SPA FALLBACK

Frontend and API are separated. Previously `/health` fell through to the SPA
catch-all and returned **200 with the 6,474-byte HTML shell** while every API
call 500'd — so a status-code-only health check reported a healthy deployment.
Phase 5 fixed this and documented the trap.

`/admin/mcp/health` is a nested React route, which is why the new `/health`
rewrite shadows nothing.

## 7. RENDER ARCHITECTURE

Two blueprints both define an MCP-mounting service and **conflict**:

| File | Service | Starts | `MCP_ADMIN_EMAILS` |
|---|---|---|---|
| `render.yaml` | `ui-hub-backend-mcp` | the web API | 3 addresses |
| `mcp-server/render.yaml` | `ui-hub-mcp` | `node dist/index.js` | 2 addresses |

Both set `MCP_SERVER_URL=https://ui-hub-mcp.onrender.com`. Unresolved owner
decision. Recommended: split them.

## 8. CLOUDFLARE ARCHITECTURE

**Not verified.** No account access. Cloudflare returns 503 for
`ui-hub-mcp.onrender.com` and 404 for `ui-hub-backend-mcp.onrender.com`. Whether
it fronts Render, is misconfigured, or masks a suspended origin is unknown.

## 9. ENVIRONMENT CONTRACT

| Variable | State | Note |
|---|---|---|
| `VITE_API_URL` | **PRESENT in production**, set to a dead host | **the outage**; must be unset and rebuilt |
| `VITE_MCP_API_URL` | ABSENT | falls back to the Render MCP host |
| `VITE_RAZORPAY_KEY_ID` | ABSENT | key fetched at runtime |
| `VITE_FIREBASE_*` | ABSENT | runtime config fetch |
| `REDIS_URL` | ABSENT | in-memory rate limiting |
| `MCP_ADMIN_EMAILS` | conflicting between blueprints | |
| `MCP_ALLOWED_ORIGINS` | declared | **inert** — see §26/§30 |
| `vercel.json` `env` block | ABSENT | |

Because `VITE_*` is inlined at build time, deleting a dashboard variable **does
not** fix the live site until a rebuild occurs.

## 10. MCP DEPLOYMENT

- **Endpoint:** `https://ui-hub-mcp.onrender.com/mcp`
- **Status:** unreachable (Cloudflare 503)
- **Auth:** `Bearer uh_live_...` API key, separate from Firebase
- **Tools:** 14
- **Source/dist:** `mcp-server/src/data` and `mcp-server/dist/data` verified
  7/7 SHA-256 identical, 38/38 TS files matched, 0 orphaned artifacts
- `mcp-server/src/routes/mcp.ts:335` reads `process.env.MCP_SERVER_URL`
  directly, bypassing validated config

## 11. GENERATED ARTIFACTS

| Artifact | Result |
|---|---|
| frontend `dist` | deterministic — two clean builds, 234 chunks, identical filenames and sizes |
| entry chunk | `index-_W84bvgY.js`, 319,441 B |
| MCP `dist` | unchanged, parity verified |
| `PROJECT_MAP.json` | regenerated; 14 risks, 12 unknowns |

## 12. API ROUTING TESTS

27 frontend tests, previously no frontend test runner existed:

- `apiConfig.test.ts` (20) — full resolution matrix, dead-host warning, malformed fallback
- `vercelRouting.test.ts` (7) — rewrite ordering, function payload, `outputDirectory`, absence of an `env` block

The `includeFiles` assertion was tightened: it was `toContain` substring
matching that could not detect a dropped member.

## 13. BROWSER NETWORK TEST

**NOT RUN.** No browser session available in this environment. The bundle audit
is a static substitute and is sufficient to prove the *destination*, not the
runtime request.

## 14. AUTHENTICATION TEST

**NOT RUN.** No valid test credentials provided. `npm test` in `backend` proves
auth middleware behaviour via unit tests (54 passing), which is not equivalent
to an authenticated production request.

## 15. PRODUCTION HEALTH

Inherited from the 2026-09-30 baseline and **not retested** in Phase 5.

| Endpoint | Result |
|---|---|
| Vercel `/` | 200 |
| Vercel `/api/*` | 500, at **module load, pre-route** |
| Vercel `/health` | was 200 HTML shell; source fixed, **not deployed** |
| Render MCP host | Cloudflare 503 |
| Render web API host | 404 |

## 16. PRODUCTION STATUS

| Component | State |
|---|---|
| Frontend | LIVE, 200 |
| Backend function | BROKEN, 500 at module load |
| MCP | UNREACHABLE |
| Database | LIVE, 33 users, 183 MB, read-only |
| Redis | NOT CONFIGURED — `configured: false`, optional |
| Cloudflare | UNVERIFIED |

## 17. LIGHT MODE

**DEFERRED.** Per Task 5.23. ~20 black-on-black nodes remain, caused by an inline
background style in `index.html` and a hardcoded `html { background }` in
`index.css` — a cascade problem, not a token problem. No CSS, HTML or theme file
was touched.

## 18. OWNER ACTIONS

1. Delete `VITE_API_URL` from the Vercel **production** environment, then
   **rebuild** — the value is inlined at build time.
2. Read the Vercel function deployment log and fix the module-load 500. Leading
   suspect: the `includeFiles` payload, which changed from an array to a
   brace-expansion string in `9cd6ab2c`.
3. Choose one Render blueprint for MCP; reconcile the admin email lists.
4. **Rotate the MongoDB credential** (see §26).
5. Decide whether CORS is enforced, and against which caller list.
6. Decide whether `.github/` stays gitignored (it currently removes CI, and
   therefore the typecheck gate, from the repository).

## 19. BLOCKED TASKS

- §13 browser network test, §14 authenticated test — no browser, no credentials
- §8 Cloudflare — no account access
- §15 live re-test — no dashboard access; no `vercel`, `render`, or `gh` CLI
- Vercel rewrite path fidelity — platform behaviour, observable only post-deploy
- MCP bring-up — Render unreachable, and topology undecided
- Light-mode visual verification — needs a browser

## 20. TEST RESULTS

| Suite | Result |
|---|---|
| Backend | **54/54** |
| MCP server | **78/78** |
| CLI | **30/30** |
| Frontend | **27/27** |
| Routing | 7/7 (included above) |

## 21. BUILD RESULTS

| Build | Result |
|---|---|
| Frontend | PASS, deterministic |
| MCP server | PASS |
| CLI | PASS |
| Frontend typecheck | **FAIL — ~50 errors / 23 files** from UI commits `6c203adc`, `254ce55d`. Not Phase 5. `vite build` does not typecheck, so deploys are unaffected. Deferred by owner decision. |

## 22. FILES CREATED

```
frontend/src/utils/apiConfig.test.ts
frontend/src/routing/vercelRouting.test.ts
frontend/vitest.config.ts
.uihub-agent/APIs/API_ARCHITECTURE.md
.uihub-agent/APIs/MCP_DEPLOYMENT_CONTRACT.md
.uihub-agent/infrastructure/ENVIRONMENT_CONTRACT.md
.uihub-agent/runtime/VERCEL_ROUTING_BASELINE.md
.uihub-agent/runtime/PRODUCTION_DEPLOYMENT_GATE.md
.uihub-agent/runtime/CONNECTIVITY_BASELINE.md
```

## 23. FILES MODIFIED

```
frontend/src/utils/apiConfig.ts          rewritten
frontend/src/utils/checkout.ts           raw env read removed
frontend/src/pages/PricingPage/PricingPage.tsx   raw env read removed
frontend/src/context/AuthContext.tsx     misleading config errors
vercel.json                              /health rewrite added
frontend/package.json, package-lock.json vitest added
.gitignore                               .uihub-agent/ un-ignored
.uihub-agent/scripts/generate-map.mjs    deployment + unknowns + risks updated
```

## 24. FILES DELETED

**NONE.**

## 25. PRODUCTION DATA CHANGES

**NO.** No database write, no mutation, no deployment.

## 26. SECRETS EXPOSED

**NO.** A pre-commit scan found a **live 10-character MongoDB Atlas password**
in 3 knowledge-base files, each pasted into a placeholder-shaped documentation
URI (`INFRASTRUCTURE.md:11,25`, `rules/DO_NOT_CHANGE.md:52`,
`tasks/ACTIVE_TASK.md:97`). Redacted to `<password>` across 4 URIs.

Verified it did not escape: 0 historical occurrences across all commits
touching `.uihub-agent`, and 0 occurrences in the 631 working-tree files
(including `backend/.env`, which is gitignored and untracked).

**Rotation still recommended** — the value existed in plaintext on disk and
cannot be proven absent from backups or from whatever these documents were
copied from.

## 27. REGRESSIONS

**NONE from Phase 5.** One pre-existing regression recorded and deferred: the
frontend typecheck fails on `main` from external UI commits (§21).

## 28. PREVIOUS FINDINGS RECLASSIFIED

| Finding | Was | Now |
|---|---|---|
| U-01 users blocked? | MEDIUM, unproven | **HIGH / confirmed** — two independent causes |
| U-08 `VITE_API_URL` source | open | **ANSWERED: set to a dead host, inlined at build time** |
| RISK-01 CORS | open, high | **RE-CONFIRMED high, still unfixed** |
| Render host cause | attributed to source | **corrected: dashboard build-time injection** |
| `/health` | assumed healthy | **was returning the HTML shell with 200** |
| Tailwind config inert | open | **still open** — a hex scan cannot decide it |

## 29. KNOWLEDGE BASE UPDATED

New: the 6 documents in §22. Updated: `CONFLICTS.md` (A11–A18),
`UNKNOWN_REGISTER.md` (U-11–U-13, U-02/U-01/U-03), `runtime/BASELINE.md`,
`runtime/PRODUCTION_BASELINE.md`, `runtime/RUNTIME_VERIFICATION.md`,
`APIs/API_OVERVIEW.md`, `infrastructure/INFRASTRUCTURE.md`,
`design-system/DESIGN_SYSTEM.md`, `tasks/ACTIVE_TASK.md`,
`PROJECT_MAP.json`, `scripts/generate-map.mjs`.

`.uihub-agent/` was gitignored by `1eaaec04`, making all of the above
uncommittable. Un-ignored.

## 30. IMPORTANT ARCHITECTURAL DISCOVERIES

1. **Production is broken for two independent reasons** — the bundle targets a
   dead host *and* the function does not load. Fixing either alone is not enough.
2. **Build-time injection explains the persistence.** A deleted dashboard
   variable cannot fix a live site until a rebuild.
3. **A 200 can mean broken.** `/health` returned the SPA shell with 200 while
   every API call 500'd.
4. **CORS is not enforced at all.** `backend/src/server.js:84` logs "Blocked
   origin" and then returns `callback(null, true)`. The allowlist is decorative,
   and both blueprints declare `MCP_ALLOWED_ORIGINS` as though it were a control.
5. **The Vercel 500 is pre-route**, which rules out routing as the cause and was
   not previously established.
6. **A hex-literal bundle scan cannot test the Tailwind config.** `#0A0A0A`
   appears in JS from component arbitrary values and template prompt text.

## 31. IMPORTANT DISCOVERIES FOR PHASE 6

- `.uihub-agent/` and `.github/` were both gitignored by a tooling-hygiene
  commit. The knowledge base silently became uncommittable. Anything that
  documents intent needs to be tracked or it does not exist.
- Documentation discipline failed once already: `MCP.md:55` advertises a Vercel
  `/mcp` endpoint that cannot work. Validate documented endpoints against
  `vercel.json`, not against the backend.
- Secret scanning must be mandatory for documentation commits. This value
  looked like a placeholder in four places; only a value-shaped regex caught it.
- Phase 5 code reached `main` via external UI commits (`6c203adc`, `9cd6ab2c`,
  `254ce55d`), not a Phase 5 branch. Correct and tested, but there is no single
  commit to review or revert.
- Never trust a status-code-only health check on a SPA-hosted platform.

## 32. FINAL GIT / DIFF REVIEW

Reviewed. Commit `3d792309` on `main`, pushed, working tree clean, 28 files.
Two self-inflicted issues were caught and fixed before push: stale bundle figures
copied from a pre-branch-move build, and a BOM injected into the commit subject
by PowerShell.

## 33. FINAL STATUS

**PARTIAL**

Code, contracts and tests are complete and verified. Production remains broken
for two reasons that require dashboard access this phase did not have. Six owner
actions stand between the current state and a working deployment (§18).

---
*END OF PHASE 5 REPORT*