# BASELINE - Phase 2

The reference point every later phase measures against. Verified on 2026-09-30 at commit `41938a67` with Node `v24.21.0` / npm `11.19.0`.

**Rule for future agents: a regression is any movement away from the numbers below. Improvement must be stated explicitly, never assumed.**

---

## 1. Test baseline

| Package | Command | Exit | Result |
|---|---|---|---|
| backend | `npm run check:premium` | 0 | **PASS** - 41/41 premium components resolvable |
| backend | `npm test` | **1** | **BROKEN** - runner argument error, 0 tests executed |
| backend | `node --test tests/accessService.test.js tests/collectionsService.test.js` | 0 | **21 / 21 PASS** |
| mcp-server | `npx vitest run` | 0 | **69 / 69 PASS** (4 files) |
| cli | `npm test` | 0 | **30 / 30 PASS** |
| frontend | - | - | **NO TEST SCRIPT** |

**Totals: 120 tests defined · 120 passing · 0 genuinely failing · 1 broken runner script · 1 package with no tests.**

`backend` detail: `npm test` resolves `tests/` as a module path on Node 24 and dies with `MODULE_NOT_FOUND`, which the runner reports as `1 failed`. That is a **crash, not a failure** - the 21 real tests never start.

`mcp-server` detail: 4 files - `apiKey`, `auth`, `permissions`, `tools`. `auth.test.ts` covers the HTTP transport end to end against a local instance, including the `?key=` query-param fallback, `x-api-key` header fallback, valid-key initialize, `tools/list`, unknown-tool handling, the `-32001` unauthenticated rejection, and a public `/health`.

`cli` detail: 4 files - `args`, `config`, `mcp`, `output`. Covers Bearer header injection, `listTools`, TTY-aware colour, table alignment, access labels, and empty-table handling.

**All 10 test files are mock-based with zero external service imports. The suite runs fully offline with no database, network, or credentials.**

---

## 2. Typecheck baseline

| Package | Method | Exit | Errors |
|---|---|---|---|
| frontend | `tsc --noEmit` | 0 | **0** |
| mcp-server | `tsc --noEmit` | 0 | **0** |
| cli | `tsc --noEmit` | 0 | **0** |
| backend | `node --check` on 6 core modules | 0 | **0 syntax errors** |

**frontend** - 339 source files (282 `.tsx`, 57 `.ts`) confirmed present in the program via `tsc --noEmit --listFiles` (1,996 entries). The pass is genuine, not an empty program. `tsconfig.json` is **not** `strict`.

**backend** - parse-checked: `src/server.js`, `src/services/mongoService.js`, `accessService.js`, `firebaseService.js`, `pushService.js`, `src/routes/userRoutes.js`. No server was started, so this proves **parseability only - not import-time correctness.** §1.1 of `RUNTIME_VERIFICATION.md` shows import-time resolution is precisely what is broken in production.

---

## 3. Build baseline

**Not established. No build was executed**, per the agreed typecheck-only constraint.

| Package | `build` script | Would write |
|---|---|---|
| frontend | `vite build` | `frontend/dist` |
| mcp-server | `tsc && node scripts/check-source-coverage.mjs && node scripts/copy-data.mjs` | `mcp-server/dist` |
| cli | `tsc -p tsconfig.json` | `cli/dist` |
| backend | `cd ../mcp-server && npm install && npm run build` | `mcp-server/dist` (transitively) |

`mcp-server/dist` remained at **81 tracked files, unmodified**. A genuine build baseline is a Phase 3 task, and should be recorded then.

Note that `backend` has **no build of its own** - its build script exists solely to produce `mcp-server/dist` for the server to import at runtime.

---

## 4. Generated-artifact baseline

`mcp-server/dist` is **committed** and **not** git-ignored: 81 tracked files.

| Aspect | State |
|---|---|
| Tool registry in `dist` | **In sync** - all 14 tools, matching `src/tools/index.ts` |
| Routers imported by `backend/src/server.js` | All 3 present (`mcp.js`, `dashboard.js`, `admin.js`) |
| `dist/data/*.json` payload | **STALE** - see below |

| Data file | `src` | `dist` | Delta |
|---|---|---|---|
| `templates.json` | 872 KB | 807 KB | **-65 KB** |
| `templateSourceCode.json` | 368 KB | 311 KB | **-57 KB** |
| `sourceCode.json` | 1958 KB | 1937 KB | **-21 KB** |
| `componentMetadata.json` | 174 KB | 169 KB | **-5 KB** |
| `aiPrompts.json` | 117 KB | 117 KB | equal |
| `componentVibePrompts.json` | 148 KB | 148 KB | equal |

A deploy that runs `mcp-server`'s `buildCommand` regenerates this and is unaffected. A deploy that ships the committed tree without building - which is what Vercel does, since it never builds `mcp-server` - serves the **stale catalogue**.

---

## 5. Deployment baseline

| Target | Probe | Status |
|---|---|---|
| Vercel frontend | `GET /` | **200** |
| Vercel `/health` | `GET /health` | 200 (**SPA fallback, not backend**) |
| Vercel `/api/health` | `GET /api/health` | **500** `FUNCTION_INVOCATION_FAILED` |
| Vercel `/api/v1/*` | any | **500** `FUNCTION_INVOCATION_FAILED` |
| Vercel `/api/mcp` | `POST initialize` / `tools/list` | **500** `FUNCTION_INVOCATION_FAILED` |
| Vercel `/mcp` | `POST tools/list` | 405 (not rewritten) |
| `ui-hub.onrender.com` | `/health`, `/api/health`, `/` | **503** (Cloudflare managed challenge) |
| `ui-hub.onrender.com` | `POST /mcp` | **429** (Cloudflare) |
| `ui-hub-mcp.onrender.com` | all | **503** |
| `ui-hub-backend-mcp.onrender.com` | all | **404** `Not Found` |

**Working backend endpoints: 0. Working frontend endpoints: 1.**

The API base compiled into the shipped frontend is `https://ui-hub.onrender.com` - extracted from `/assets/index-DYhd2CmH.js` (HTTP 200, 322,739 bytes). It appears in **no** configuration file in the repository.

---

## 6. Data baseline

Read-only counts against `uihub` on `cluster0.<cluster-host>.mongodb.net`. No writes.

| Collection | Documents |
|---|---|
| `activity_logs` | 5,505 |
| `mcp_analytics` | 687 |
| `components` | 226 |
| `email_logs` | 100 |
| `mcp_api_keys` | 7 |
| `users` | 33 |
| `payments` | 1 |
| `mcp_audit` | 1 |
| `mcp_config` | 1 |
| `collections` | 0 |
| `favorites` | 0 |
| `payment_webhooks` | 0 |

User and entitlement shape:

| Metric | Value |
|---|---|
| Users with email `_id` | **33 / 33** |
| Users with uid-keyed `_id` | **0** |
| Users with a `uid` field | 30 (the 3 without are seeded admins) |
| Tier distribution | free 30, elite 2, pro 1 |
| Documents with `proExpiry` | 3 |
| Documents with `planExpiry` / `planDuration` / `planType` | **0 / 0 / 0** |
| Users with any push subscription | **0** |

`mcp_config.tools`: 4 keys, all the **string** `"true"`; contains the phantom `list_components`; omits 10 of the 14 real tools.

---

## 7. Security baseline

| Check | State |
|---|---|
| Mongo credential in working tree and `HEAD` | **PRESENT** (2 files, 1 value) |
| Same credential still valid | **NO** - `bad auth`, rotation confirmed |
| Credential in git history | **YES** - since `acf3005a`; 7 commits touch the file |
| History scrub performed | **NO** |
| Razorpay / Brevo / Vercel / Netlify secrets in tracked files | clean |
| MCP API keys at rest | **hashed** (`key_hash` + `key_prefix`) |
| Unrelated `sample_mflix` database on the same cluster | present |

**Credential rotation: DONE. Credential removal from the tree and history: NOT DONE.**

---

## 8. What a later phase may rely on

1. **All 120 tests pass**, and the suite needs no services - the fastest possible regression signal.
2. **All three TypeScript packages typecheck clean**; frontend coverage is genuine across 339 files.
3. **`backend` parses cleanly** but has **never been proven to import cleanly outside its own directory** - and does not on Vercel.
4. **No build baseline exists.** Do not assume `vite build` or `tsc` succeeds end to end until it is measured.
5. **No backend is reachable.** Any test that needs a live API cannot pass today.
6. **`/health` proves nothing** - it is a hardcoded literal that reports `mcp: 'online'` even when MCP failed to mount.
7. **The deployed frontend's API base is unknown to version control** and currently 503.
8. **Dist code is current; dist data is stale** - rebuild before trusting the catalogue.

---

# PHASE 3 BASELINE UPDATE (2026-09-30)

Phase 3 measured several things this file previously listed as unknown or false.
**This section supersedes section 7's credential rows and section 8 items 4 and 6.**

## Corrections to the baseline

| Baseline claim | Phase 3 reality |
|---|---|
| §7 "Credential in git history: **YES** - since `acf3005a`" | **REJECTED.** No real password was ever committed. What existed was the Atlas host + DB username, in masked examples. Password rotation is not required. The host/username are now genericised; history was deliberately not rewritten. |
| §7 "Credential removal from the tree: NOT DONE" | **DONE for the current tree.** Both `.env.example` files now use fully generic placeholders. |
| §8.4 "No build baseline exists" | **FALSE.** All three buildable packages now build clean. |
| §8.6 "`/health` proves nothing" | **FALSE.** `/health` now performs a bounded `ping` against Mongo and returns 503 when it fails. It is now a real signal, and therefore a new dependency for any deploy gate. |
| §8.1 "All 120 tests pass" | Superseded - the backend suite was never running. Real numbers below. |

## Measured Phase 3 baseline

**Test suites (all offline, no services required)**

| Package | Command | Result |
|---|---|---|
| backend | `npm test` (includes `check:premium`) | 54/54 pass, 0 fail, exit 0 |
| mcp-server | `npm test` | 78/78 pass across 5 files, exit 0 |
| cli | `npm test` | 30/30 pass, exit 0 |
| frontend | none exist | no test script; typecheck + build only |

`checkPremiumCoverage.js` reports 41/41.

**Typecheck** - `frontend` `tsc --noEmit` exit 0. `mcp-server` and `cli` typecheck
as part of their `build` step, both exit 0. All three TypeScript packages clean.

**Builds** - `frontend` `vite build` exit 0. `mcp-server` `tsc` + source-coverage
+ `copy-data` exit 0 (41/41 premium ids). `cli` `tsc -p` exit 0. `backend` has no
build step.

**Runtime, local, serverless-shaped** (`NODE_ENV=production VERCEL=1`)

| Check | Result |
|---|---|
| `api/index.js` import | Success, Express app exported. ~24 s cold. |
| `/api/health`, unreachable Mongo | **HTTP 503**, `status=unhealthy`, `mongodb=disconnected`, returned in 3113 ms |
| `/api/health`, MCP mount | Reported `mounted` from committed `mcp-server/dist` |

**Not measured** - anything requiring a dashboard, a deployment, or a live
credential. No production deploy was performed and no production data was read
or written beyond the read-only checks already recorded in Phase 2.

## What a later phase may rely on

1. All three buildable packages build clean, and all three real test suites pass.
2. `/health` is a genuine readiness signal; treat a 503 as a real database fault.
3. The three broadcast endpoints require an admin Firebase token. The four
   email-test endpoints fail closed. Both are intentional tightenings.
4. `tailwind.config.ts` is inert and will mislead you. The live theme is the
   `@theme` block in `frontend/src/index.css`.
5. `:root.light` is reachable and the toggle is mounted, but 21 `dark:` variants
   and every `@theme --color-brand-*` value ignore it. Light mode is partial, and
   that is a known, accepted state rather than a bug to rediscover.
6. `mcp_config.tools` disagrees with the registry; admin `/health` and
   `/settings` now report that drift, so check there before trusting the stored
   config.
