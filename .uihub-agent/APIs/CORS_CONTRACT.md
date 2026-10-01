# CORS Contract

**Surface owner:** `backend/src/config/corsPolicy.js` (web API) and
`mcp-server/src/config/corsPolicy.ts` (MCP). Two separate policies.
**Enforced since:** Phase 6.
**Tests:** `backend/tests/cors.test.js` (25), `mcp-server/tests/cors.test.ts` (17).

---

## 1. Why this document exists

Before Phase 6, **both** API surfaces logged a blocked origin and then allowed
it anyway.

`backend/src/server.js`:

```js
if (isAllowed) {
  return callback(null, true);
} else {
  console.warn(`[CORS] Blocked origin: ${origin}`);
  return callback(null, true);   // <-- allowed anyway
}
```

`mcp-server/src/index.ts`:

```js
const allowed = config.allowedOrigins.some((o) => origin === o || origin.includes('localhost'));
if (allowed) return callback(null, true);
callback(null, true);            // <-- allowed anyway
```

Two bypasses made the allowlist decorative even before that:

| Expression | Problem |
|---|---|
| `origin.endsWith('.vercel.app')` | Every Vercel deployment on the internet, including attacker-controlled ones. |
| `origin.includes('localhost')` | Substring, not equality. `https://evil.example/?localhost` matched. |

Measured against the reconstructed Phase 5 policy, **7 of 7** hostile origins
were accepted:

```
ACCEPTED  unknown origin                   -> https://attacker.example
ACCEPTED  any other *.vercel.app           -> https://attacker.vercel.app
ACCEPTED  host containing localhost        -> https://localhost.attacker.example
ACCEPTED  query containing localhost       -> https://evil.example/?localhost
ACCEPTED  typosquat of localhost           -> http://notlocalhost:5173
ACCEPTED  malformed origin                 -> not-a-url
ACCEPTED  suffix-extension attack          -> https://ui-hub-design.vercel.app.evil.example
```

Both `render.yaml` files declared `MCP_ALLOWED_ORIGINS` as though it were a
control. It was documentation of intent.

Phase 5 recorded this as `RISK-01` / `CONFLICTS.md` A11 for the **backend only**.
The MCP copy was found during the Phase 6 audit.

## 2. Invariant

| Condition | Behaviour |
|---|---|
| Origin in the allowlist | permitted, echoed in `Access-Control-Allow-Origin` |
| Origin not in the allowlist | **rejected** — no ACAO header |
| No `Origin` header | permitted (CLI, curl, server-to-server) |
| Malformed origin | rejected (cannot exact-match) |
| Development localhost | permitted, explicit entries only |
| Origin containing `localhost` as a substring | rejected |
| Any `*.vercel.app` not explicitly listed | rejected |

## 3. Allowed origins

Web API (`backend/src/config/corsPolicy.js`):

| Origin | Why |
|---|---|
| `http://localhost:5173` | local Vite dev server |
| `http://localhost:3000` | local dev / proxy |
| `https://ui-hub-design.vercel.app` | production frontend |
| `https://ui-hub-design-git-main-jainil224s-projects.vercel.app` | known preview |
| `https://ui-hub-design-jainil224s-projects.vercel.app` | known preview |

MCP (`mcp-server/src/config/corsPolicy.ts`) additionally allows
`http://localhost:3001`, because the MCP server's own dev port serves the
dashboard.

### Adding an origin

`ALLOWED_ORIGINS` (web API) and `MCP_ALLOWED_ORIGINS` (MCP) are comma-separated.
They are **unioned with** the built-in defaults, never substituted for them.

Union rather than replace is deliberate: a replacement list lets one variable
set in staging silently remove the production origin from production, which
surfaces as a confusing runtime breakage instead of a configuration error. With
union, widening the policy is always explicit and narrowing it requires a code
change.

Entries wrapped in angle brackets (`<your-origin>`) are ignored, so copying a
`.env.example` line cannot silently disable enforcement.

**Vercel preview deployments.** Random per-PR preview domains are **not** allowed
by default. Add the exact origin to the environment variable. This was an
explicit owner decision: a wildcard would re-open the hole Phase 6 closed.

## 4. Credentials

`credentials: true` is set on both surfaces, so `Access-Control-Allow-Origin: *`
is never valid and is never emitted. A test asserts the literal `*` never appears.

There are no cookies or server-side sessions in this codebase. Authentication is
an `Authorization` header everywhere:

- web API: Firebase ID token
- MCP: `Bearer uh_live_...` API key

`credentials: true` is retained for the browser's benefit (it governs whether
the response is readable), not because ambient cookie auth exists. Turning it off
is a separate decision and would break `fetch` calls that send credentials.

## 5. Missing Origin is permitted — deliberately

A request with no `Origin` header is not a browser request. It comes from the
`ui-hub` CLI, `curl`, or another server.

CORS is not the control that protects these callers. They carry an explicit API
key or no credentials at all, and they are validated by authentication and rate
limiting. Blocking them would break the CLI with no security benefit.

**Do not "fix" this by rejecting missing origins.** That would break the CLI and
all server-to-server traffic.

## 6. Relationship to Helmet CSP

`backend/src/server.js` sets a Content-Security-Policy with an explicit
`connectSrc` list. **CSP and CORS are separate controls and this is a known
coupling.**

Adding an origin to `ALLOWED_ORIGINS` alone will NOT make it work in a browser:
CSP `connectSrc` would still block the request. A browser reports the CSP
violation; the request never reaches CORS.

Both lists currently name the same frontend origins. An origin added to one
should be added to the other. This is a manual coupling, not a validated
invariant — `check:config` reports it as `UNKNOWN` rather than pretending to
verify it.

## 7. Environment variables

| Variable | Surface | State | Purpose |
|---|---|---|---|
| `ALLOWED_ORIGINS` | web API | **NOT CONFIGURED** | additional browser origins |
| `MCP_ALLOWED_ORIGINS` | MCP | **CONFIGURED** in both Render blueprints | additional browser origins |
| `NODE_ENV` | both | CONFIGURED | not read by the policy |

Neither variable is a secret. No values are recorded in this tree.

## 8. Failure behaviour

A rejected origin receives **no** `Access-Control-Allow-Origin` header. The
browser blocks the response before the application sees it. The server still
processes the request; CORS is a response-header policy, not an authorisation
layer.

This is why the tests assert on the absence of the header rather than on a
status code: a rejected CORS preflight still returns `204`, and a rejected
simple request still returns `200`. Only the missing header reveals the decision.

Every rejection logs `[CORS] Blocked origin: <origin>`.

## 9. Testing method

Tests assert **real middleware behaviour** over a real socket, not the shape of
the configuration object. This matters: a test that only inspected the options
object would have passed against the Phase 5 code, because the defect was a
runtime decision inside the callback, not a missing config value.

- `backend/tests/cors.test.js` — the real `cors` middleware on a throwaway
  Express app, listening on an ephemeral port, driven by real `fetch` requests
  with real `Origin` headers. No new dependencies.
- `mcp-server/tests/cors.test.ts` — the real middleware via the already-installed
  `supertest`.

One test's premise was corrected during Phase 6: a padded `Origin` cannot be
tested over the wire, because HTTP header field parsing strips optional
whitespace (RFC 9110 OWS) before the value reaches the middleware. The behaviour
is asserted at the policy layer instead, and the test documents why.

## 10. What Phase 6 did not do

- Did not change the CSP `connectSrc` list.
- Did not add wildcard support.
- Did not choose which origins production needs beyond the documented five.
- Did not add `Access-Control-Max-Age`, so browsers re-preflight. Acceptable
  while cross-origin traffic shrinks as the frontend moves same-origin.

## 11. Related

- `infrastructure/ENVIRONMENT_CONTRACT.md` — every variable
- `infrastructure/DEPLOYMENT_CONFLICTS.md` — which blueprint is authoritative
- `security/SECURITY_OVERVIEW.md` — where CORS sits in the wider model
- `../CONFLICTS.md` A11 — the original finding