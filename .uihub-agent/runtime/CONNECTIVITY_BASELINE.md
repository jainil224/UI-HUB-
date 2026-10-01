# CONNECTIVITY BASELINE

Captured **2026-10-01** during Phase 5 (Task 5.27). End-to-end connectivity for
the UI-HUB estate: who can reach what, verified how, and where the chain breaks.

---

## 1. Method and limits

Everything here is **read-only**.

- **HTTP** — unauthenticated `GET` against public hostnames. Status, headers and
  content-type only. No credential was sent. No mutation.
- **Bundle inspection** — the served entry chunk was fetched and its minified
  `getApiBaseUrl()` read directly.
- **Local HTTP** — the real Express app was started with a deliberately dead
  Mongo URI on an ephemeral port, so a routed request fails *inside* the app and
  thereby proves the route was reached. No real database was touched.
- **Database** — Phase 3/4 read-only session. **Zero writes.**
- **Not available** — Vercel and Render dashboards, Cloudflare account, browser
  authenticated flows, MCP protocol handshake. No `vercel`, `render` or `gh` CLI.

## 2. Connectivity matrix

| # | From | To | State | Evidence |
|---|---|---|---|---|
| 1 | Internet | Vercel `/` | **LIVE** | 200, HTML shell |
| 2 | Vercel `/` | Vercel `/api/health` | **BROKEN** | 500 at module load, pre-route |
| 3 | Vercel `/` | Vercel `/health` | **BROKEN** | 500 at module load |
| 4 | Browser | Render `ui-hub.onrender.com` | **DEAD** | Cloudflare 503/404 |
| 5 | Browser | Render `ui-hub-mcp.onrender.com` | **DEAD** | Cloudflare 503/404 |
| 6 | Render service | Atlas `uihub` | **LIVE** | read-only, 33 users, 183 MB |
| 7 | Express app | Atlas (local repro) | **REACHABLE, deliberately dead** | ECONNREFUSED to `127.0.0.1:1` — proves routing reaches the DB layer |
| 8 | Vercel `/mcp` | MCP | **NOT ROUTED** | matches the SPA catch-all, returns HTML |
| 9 | MCP service `/mcp` | (direct) | **WORKS** | 200 JSON when reached directly |

The chain breaks twice, independently:

- **A.** The frontend is aimed at a dead host (row 4). Fixed by deleting
  `VITE_API_URL`.
- **B.** Even aimed correctly, the Vercel API function does not load (rows 2-3).
  Fixed by reading the function build log.

Fixing A alone still leaves B. Both are required.

## 3. The dead-host chain

```
Browser loads https://ui-hub-design.vercel.app/          → 200
  bundle: getApiBaseUrl() === "https://ui-hub.onrender.com"
    fetch("https://ui-hub.onrender.com/api/v1/...")
      → Cloudflare 503/404
        → every API call fails
```

The origin string is **inlined at build time** from a Vercel dashboard variable,
not read from repository source. Proven three ways:

1. `vercel.json` has no `env` block (asserted by test).
2. A build of the current tree contains **0** web-API Render hosts across all
   234 chunks.
3. The minifier folds the resolver to `return window.location.origin` in that
   build, so the shipped code *provably cannot* reference an external host.

The source is correct. The deployment is not.

## 4. Routing separation, verified

From the local reproduction in `VERCEL_ROUTING_BASELINE.md` section 3:

| Path class | Routed to | Verified |
|---|---|---|
| `/api/*` | function | yes — 503/500/404 JSON from inside the app |
| `/health` | function | yes — 503 JSON; **was 200 HTML before Phase 5** |
| `/mcp` | SPA fallback | yes — not routed |
| frontend routes | SPA | yes |

**API paths leaking the HTML shell: 0.** The largest API-path response is a
156-byte Express 404 page; the SPA shell is 6,474 bytes. That size difference is
how the two failure modes are told apart, and it is why status-code-only health
checks were misleading.

## 5. Build-level connectivity guarantee

A production build of the current tree:

| Check | Result |
|---|---|
| entry chunk (per `index.html`) | `index-_W84bvgY.js`, 319,441 bytes |
| total `.js` chunks | 234 |
| `ui-hub.onrender.com` in bundle | **0 files** |
| `ui-hub-backend-mcp.onrender.com` in bundle | **0 files** |
| `ui-hub-mcp.onrender.com` in bundle | 2 files: `mcpConfig-BJTXtQ2e.js`, `LibraryPage-nB8pXJi6.js` |
| rebuilt from empty `dist` | identical filenames and sizes, twice |
| literal `VITE_API_URL` in bundle | present, **only inside log/warning strings** |

### Two things that look like findings and are not

**The `VITE_API_URL` literal is benign.** It survives in the bundle because
`apiConfig.ts` builds operator-facing warning strings that name the variable
(`"...UNSET VITE_API_URL in the deployment environment and rebuild."`). That is
deliberate guidance, not a config read. The only live read is
`import.meta.env.VITE_API_URL` at `apiConfig.ts:165`, which Vite inlines — and
it inlined to nothing, since no Render host appears anywhere.

**`#0A0A0A` in JS is not a Tailwind leak.** The dark background hex appears in
many chunks, from component-level arbitrary values (`bg-[#0A0A0A]` in `Hero.tsx`,
`TemplatesSection.tsx`, `BuildWithUIHubSection.tsx`), inline styles
(`MatrixRainDemoPage.tsx`, `PreviewCapturePage.tsx`, `codeUtils.ts`) and template
prompt *text* in `templatesData.ts`. None of it comes from `tailwind.config.ts`.
Do not use a hex scan to decide whether that config is inert.

### Two `index-*` chunks, only one of which is the entry

`index.html` loads exactly three `index-*`-named assets, and there are three
files matching `index-*.js`: the real entry (`index-_W84bvgY.js`, 319,441 B), plus
`index-BoZIh3x8.js` (19,626 B) and `index-C0HLbxZD.js` (1,080 B), which are
lazy-loaded route chunks. **Sorting by name or taking the first `index-*` match
reports the wrong entry size.** Read the `<script src>` in `dist/index.html`.

The resolver in the shipped entry chunk is, in full:

```js
function ey(o,u){return u?(console.log(`[API Config] Production: using same-origin API at ${u.origin} (no VITE_API_URL set).`),u.origin):""}
const Wa=()=>{const o=typeof window<"u"?{origin:window.location.origin}:void 0;return ey({},o)}
```

Every configured-host branch was statically eliminated. The dead-host warning
text is absent for the same reason — it is unreachable when no host is
configured. Those paths are covered by unit tests instead, since a production
bundle cannot contain them.

## 6. Verified database facts

From the Phase 3/4 read-only session, unchanged in Phase 5:

- 33 users; `status = {"FREE": 30, "active": 3}`; U-07 closed
- no push-subscription or device-token fields exist
- same-cluster cluster fingerprint: `sample_mflix` 183,582,720 bytes alongside
  `uihub` 4,521,984 bytes
- `mcp_config.tools` holds four boolean flags; `list_components` is a stale key
  and 10 tools are unconfigured

## 7. Blocked verifications

| Verification | Blocked by |
|---|---|
| Production authentication flow | no valid test identity |
| MCP `initialize` / `tools/list` | MCP host unreachable |
| Vercel function build log | no dashboard / CLI |
| Cloudflare configuration | no account access |
| Vercel rewrite path fidelity | only observable after deploy |

None of these may be recorded as passed. The procedure for each is in
`PRODUCTION_DEPLOYMENT_GATE.md` section 4.

## 8. The one change with the largest effect

Delete `VITE_API_URL` from the Vercel production environment and rebuild.

It is a dashboard action, needs no code change, and removes an entire failure
class. It does not fix the 500 in row 2, but it eliminates the misrouting that
makes the symptom total rather than partial.