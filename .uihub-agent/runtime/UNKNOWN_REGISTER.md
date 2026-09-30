# UNKNOWN REGISTER - Phase 2

Questions Phase 2 could **not** settle from code or from permitted observation. Each entry states what was tried, what remains unknown, who can answer, and a confidence level on the likely answer so a future agent can act without re-deriving it.

**Resolved in Phase 2 and no longer listed:** uid-vs-email keying (`#12`), expiry-field semantics (`#14`), `mcp_config.tools` contents (`#11`), which Render service is live (`#20`), whether the Mongo credential is rotated (`#1`).

---

## U-01 - Are real end users currently blocked? (Severity: HIGH, Confidence in likely answer: MEDIUM)

**Unknown.** Whether production traffic from actual users fails, or whether the Cloudflare challenge in §2.2 lets browsers through while only non-browser clients are refused.

**Evidence gathered.** `ui-hub.onrender.com` returns a Cloudflare **managed challenge** for HTML routes and **429** for `POST /mcp`, for both `curl` and a browser User-Agent, at 6-second spacing. A browser can solve a managed challenge; a server-side SDK or CLI cannot.

**Why it stays open.** Resolving this needs a real browser session against the live origin, or the Cloudflare dashboard. Both are outside Phase 2's boundary.

**Who can answer.** Owner, from the Cloudflare dashboard and Render logs.

**Blocks.** Prioritisation of every restoration task. This determines whether the product is "down for everyone" or "down for integrations only".

---

## U-02 - Why exactly does the Vercel function fail to load? (Severity: HIGH, Confidence in likely answer: MEDIUM)

**Unknown.** The precise failing module specifier. §1.2 correlates the 500 with four backend dependencies missing from the root `package.json` (`axios`, `mongodb`, `web-push`, `zod`), but correlation is not proof.

**Evidence gathered.** Every `/api/*` route and method fails identically with `FUNCTION_INVOCATION_FAILED`; an unauthenticated request that should return 401 returns 500, placing the fault before any middleware. `includeFiles: "backend/**"` also excludes `mcp-server/**`.

**Why it stays open.** Vercel build and function logs were not accessible. Nothing in the repository records the deployed resolution result.

**Who can answer.** Owner, from Vercel project logs for the failing function.

**Blocks.** The minimal Phase 3 fix, and whether `includeFiles` also needs changing.

---

## U-03 - Is `ui-hub-backend-mcp` deployed at all? (Severity: HIGH, Confidence in likely answer: LOW)

**Unknown.** Whether the blueprint service exists and is stopped, or was never created.

**Evidence gathered.** Every path on `ui-hub-backend-mcp.onrender.com` returns **404 `Not Found`** with `text/plain` - including `/`, `/health`, and `POST /mcp`. A running Node service that fails to boot would typically answer 503, not a bare 404 on `/`.

**Why it stays open.** Render's dashboard distinguishes "service does not exist" from "service stopped"; that distinction is not observable over HTTP. The blueprint also specifies `plan: starter`, which bills when active, so the answer has cost implications.

**Who can answer.** Owner, from the Render service list.

**Blocks.** Whether restoration is a redeploy or a first-time create. Also relevant to U-01 and U-04.

---

## U-04 - Are VAPID keys present in the live environment? (Severity: MEDIUM, Confidence in likely answer: MEDIUM)

**Unknown.** Whether `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` are set in the real deployment.

**Evidence gathered.** Zero users hold `pushSubscriptions`, `pushSubscription`, or `fcmTokens`. `render.yaml` declares no `VAPID_*` variables at all. No env value was read, by rule.

**Why it stays open.** Env values are deliberately not inspected, and the Render/Vercel dashboards were not accessible.

**Who can answer.** Owner, from Render environment variables.

**Blocks.** Whether Web Push is a Phase 3 feature or dead code to remove. Note that "0 subscriptions" is consistent with both "never configured" and "configured but never used".

---

## U-05 - Were the 3 entitled accounts ever paid for? (Severity: MEDIUM, Confidence in likely answer: MEDIUM)

**Unknown.** Whether the single `payments` document corresponds to a real transaction.

**Evidence gathered.** `payments: 1`, `payment_webhooks: 0`. All 3 non-free users share the identical `proExpiry: "2027-03-24"` string, were created within 0.3 seconds of each other, lack `uid`, are all `isAdmin: true`, and match the three addresses in `render.yaml` `MCP_ADMIN_EMAILS`. Entitlement grants and webhook logging were not correlated per-user, to avoid touching payment data.

**Why it stays open.** Confirming requires correlating a Razorpay payment id against the account, which needs the payment record and the Razorpay dashboard.

**Who can answer.** Owner, from Razorpay and the Render logs.

**Blocks.** Phase 1 `#18` (three grant paths) cannot be closed until it is known whether the automated path has ever run.

---

## U-06 - Does the production database match `cluster0.<cluster-host>`? (Severity: MEDIUM, Confidence in likely answer: LOW)

**Unknown.** Whether production uses the same Atlas cluster the local `backend/.env` points at, or a different one.

**Evidence gathered.** `render.yaml:14-15` sets `MONGODB_URI` with `sync: false`, so the blueprint does not record the value. The observed database is `uihub` on `cluster0.<cluster-host>.mongodb.net`, holding `uihub` (12 collections) plus an unrelated `sample_mflix`.

**Why it stays open.** Reading the Render environment is out of scope, and there is no second connection string available to compare.

**Who can answer.** Owner, from Render environment variables.

**Blocks.** Confidence that the data-layer findings in §5 describe production and not a staging or abandoned environment. **All §5 findings inherit this dependency.**

---

## U-07 - Is `users.status` actually inconsistent in practice? (Severity: LOW, Confidence in likely answer: LOW)

**Unknown.** Whether both vocabularies coexist in live data. Phase 1 found two vocabularies in code (`active`/`inactive` vs `enabled`/`disabled`) but did not check live values.

**Evidence gathered.** A count of distinct `status` values was **not** taken in this phase. The field exists on all users (`users.status` appears in the observed field set).

**Why it stays open.** An oversight in scoping - it is a single `aggregate` and was not run. Carried forward deliberately rather than silently dropped.

**Who can answer.** Any agent with read-only database access: `db.users.aggregate([{$group:{_id:"$status",n:{$sum:1}}}])`.

**Blocks.** Nothing immediately. Listed so Phase 1 `#8` is not treated as resolved.

---

## U-08 - Do MCP sessions survive a restart? (Severity: LOW, Confidence in likely answer: MEDIUM)

**Unknown.** Whether the in-memory session store causes real user-visible failures. Phase 1 `#13` established the store is in-process.

**Evidence gathered.** Not measured. No live MCP service was reachable (§2), so no session could be exercised end to end.

**Why it stays open.** Requires a running MCP server, which does not currently exist at any known URL.

**Who can answer.** Any agent, once a backend is reachable.

**Blocks.** Nothing. Elevated automatically if multi-session MCP usage is a stated goal.

---

## U-09 - Is Redis configured, and does the rate limiter depend on it? (Severity: LOW, Confidence in likely answer: MEDIUM)

**Unknown.** Whether `REDIS_URL` is set in the live environment, and whether the global rate limiter degrades safely without it.

**Evidence gathered.** `render.yaml:46-47` declares `REDIS_URL` with `sync: false`. The 429s observed in §2.2 were served by **Cloudflare**, not by the application, so they say nothing about the in-app limiter.

**Why it stays open.** Env not inspected; no application running to observe.

**Who can answer.** Owner, from Render environment variables; then any agent, by reading the limiter's fallback branch.

**Blocks.** Nothing. Relevant to restoring service, because a missing Redis must not take the API down.

---

## Summary

| ID | Severity | Answerable by | Blocks restoration? |
|---|---|---|---|
| U-01 | HIGH | Owner (Cloudflare/Render) | **Yes** - sets priority |
| U-02 | HIGH | Owner (Vercel logs) | **Yes** |
| U-03 | HIGH | Owner (Render dashboard) | **Yes** |
| U-04 | MEDIUM | Owner (Render env) | No |
| U-05 | MEDIUM | Owner (Razorpay) | No |
| U-06 | MEDIUM | Owner (Render env) | No - but qualifies all §5 |
| U-07 | LOW | **Any agent, read-only DB** | No |
| U-08 | LOW | Any agent, once reachable | No |
| U-09 | LOW | Owner (Render env) | No |

**U-07 is the only item resolvable without the owner.** It needs one read-only `aggregate` and should be closed first in Phase 3.

**Six of nine require owner-only information** - chiefly dashboard access and production environment variables. No amount of further autonomous investigation will close them; they should be asked as a single batch rather than re-derived by successive agents.

---

# PHASE 3 UPDATE (2026-09-30)

## Status of the nine Phase 2 unknowns

None of the nine could be closed. Phase 3 had no dashboard or environment access,
and per the Phase 3 rules no production environment value was read.

| ID | Phase 3 status |
|---|---|
| U-01 Cloudflare layer | OPEN - unchanged. Still the reason the Render API appears 503. |
| U-02 Vercel function failure | OPEN, but **narrowed**. The repository-side causes are fixed and the entrypoint now imports cleanly under `VERCEL=1`. The deployed function has not been redeployed, so the observed 500 stands until an owner deploys. |
| U-03 Render backend unreachable | OPEN - unchanged. |
| U-04 VAPID keys | OPEN. Push is now visible in `/health` as optional state, which gives an owner a direct check without reading env values. |
| U-05 Payment reconciliation | OPEN - deliberately untouched. |
| U-06 Production cluster identity | OPEN - unchanged. |
| U-07 `users.status` vocabulary | OPEN. Would close with one read-only `aggregate`; still the cheapest item on this list. |
| U-08 MCP session durability | OPEN - no reachable service to test. |
| U-09 Redis configured? | **PARTIALLY ANSWERED.** `rateLimiters.js` now exports `redisStatus = { configured, connected }`, computed from whether `REDIS_URL` is present, and `/health` reports it as `{ required: false }`. The limiter degrades safely without Redis by design. The live value is still unknown. |

## U-10 - Is `EMAIL_TEST_SECRET` set in the live environment? (Severity: MEDIUM, NEW in Phase 3)

**Unknown.** Whether `EMAIL_TEST_SECRET` exists on Render. Previously this
could not be detected, because the code fell back to a hardcoded literal.

**Why Phase 3 raised the severity.** The four email-test endpoints no longer
inherit a usable default. If the variable is unset they now return **503**, where
before they accepted a value committed in source. This is the intended fail-closed
behaviour, but it converts a silent misconfiguration into a visible outage for
anyone still using those routes.

**Evidence gathered.** `render.yaml` does not declare `EMAIL_TEST_SECRET`. The
variable is not present in either tracked example file. Its value on the live
service was not read, by rule.

**Who can answer.** Owner, from the Render environment variables. The check is a
single variable's presence, not its value.

**Blocks.** Nothing in restoration. The four routes have no frontend caller, so
no UI depends on them. Set the variable if those routes are meant to work.

## New unknown recorded for honesty

Phase 3 also established that `mongoService.isClientAlive()` reports a client
that is mid-handshake as alive. This is correct for the latency-guard callers
that use it, but it is a trap for any future readiness check, and it is the
direct cause of the original false-positive health report. Whether to add an
explicit connected flag is a Phase 4 decision.

---

# PHASE 4 UPDATE (2026-09-30)

Phase 4 had read-only HTTPS and a **read-only database session**, so the three
items that Phase 2 and Phase 3 both flagged as "any agent with read-only DB
access" were closable. One is now closed, two are substantially answered, and one
prior claim is corrected.

## U-07 - `users.status` vocabulary - **CLOSED**

Phase 2 called this the cheapest item on the list and it was: one aggregate.

```
db.users.aggregate([{$group:{_id:"$status", n:{$sum:1}}}])
  -> [ { _id: "FREE",   n: 30 },
       { _id: "active", n: 3  } ]
```

**Answer: yes, the vocabularies genuinely coexist.** 30 users are `"FREE"`, 3 are
`"active"`. Phase 1 finding `#8` is confirmed against live data - the
uppercase/lowercase split is real, not merely latent in code. A `status`-based
query written against either convention silently returns 30 or 3 of 33 users
instead of 33, which makes this a live correctness hazard rather than a tidy-up
item.

Supporting facts, all read-only: 33 users total; 3 are non-free; 23 carry
`isAdmin`; `proExpiry` is present on exactly the 3 non-free accounts; no `plan`,
`planType`, `planDuration`, or `planExpiry` field exists on any user.

## U-04 - VAPID keys - **ANSWERED on the data side, still OPEN on the env side**

Phase 2 recorded "0 subscriptions" but correctly noted this is consistent with
both "never configured" and "configured but never used". Phase 4 cannot separate
those without reading env values, which remains out of scope.

What is now established: **no user document contains `pushSubscriptions`,
`pushSubscription`, or `fcmTokens`.** The push surface has zero uptake.

Practical effect: Web Push is dead weight, not a silent outage. No user is
missing notifications, so there is no urgency. The decision is whether to
configure VAPID or delete the code path. `render.yaml` declares no `VAPID_*`
variables, which tilts this toward "never configured".

Owner can close the env half from Render environment variables.

## U-06 - Production cluster identity - **STRONGLY SUPPORTED, still OPEN**

`listDatabases` on the cluster reached through `backend/.env`:

| Database | Size |
|---|---|
| `sample_mflix` | 183 582 720 b |
| `uihub` | 4 521 984 b |
| `admin`, `local` | 0 b |

This **exactly reproduces** the Phase 2 fingerprint: same database name, same
unrelated `sample_mflix` companion, same 12-collection shape. An unrelated
40x-larger database is a strong identifying marker, so confidence that
`backend/.env` addresses the production database is now high.

Still unproven: which Render service actually uses this credential. Only the
Render dashboard can tie the two together. Every data-layer finding in the
Phase 1 and Phase 2 reports inherits this, and they are all now high-confidence
rather than provisional.

## Correction - `mcp_config.tools` values are booleans, not strings

Phase 2 and Phase 3 both described the 4 configured tool entries as
"string-valued". **They are booleans.** Read-only inspection of the single
`mcp_config` document:

```
get_component_code       = true
list_components          = true
search_components        = true
get_component_metadata   = true
```

The Phase 3 fix is unaffected - `coerceToolMap` accepts booleans, boolean
strings, and arrays - so the code was right and only the written justification
was wrong. Corrected here and in `PRODUCTION_BASELINE.md` so no future agent
relies on the string assumption.

This inspection also produced the first **measured** MCP drift, which is what
Phase 3's `getToolDrift()` was built to surface:

1. `list_components` is a **stale key** - not in the 14-tool registry, silently
   dropped on load.
2. **10 of 14 tools are unconfigured.** Under the owner-approved fail-open
   policy all 10 are **enabled**, so the effective state is "all 14 tools on",
   reached by accident rather than decision.

No write was issued. Production `mcp_config` is untouched.

## Status of all ten unknowns after Phase 4

| ID | Phase 4 status |
|---|---|
| U-01 Cloudflare layer | OPEN - unchanged. Still the reason Render appears 503. |
| U-02 Vercel function failure | OPEN, **narrowed further**. `/api/health` and unauthenticated `/api/v1/components` fail identically, placing the fault before middleware - consistent with a module-resolution failure. Repository side fixed; needs redeploy + Vercel logs. |
| U-03 Render backend unreachable | OPEN - unchanged. 404 on `/` is a Cloudflare shape, not a stopped-service shape. |
| U-04 VAPID keys | **DATA SIDE ANSWERED** - zero subscriptions, zero uptake. Env presence still open. |
| U-05 Payment reconciliation | OPEN - deliberately untouched. |
| U-06 Production cluster identity | **STRONGLY SUPPORTED** - fingerprint reproduced exactly. Render-side link still open. |
| U-07 `users.status` vocabulary | **CLOSED.** `{"FREE": 30, "active": 3}`. |
| U-08 MCP session durability | OPEN - no reachable service to test. |
| U-09 Redis configured? | OPEN on the live value. `redisStatus` is now reported by `/health`. |
| U-10 `EMAIL_TEST_SECRET` | OPEN on the live value. Absence from `render.yaml` and both example files is suggestive, not conclusive. |

**Net: 1 closed, 2 substantially answered, 1 prior claim corrected, 6 unchanged.**
Every remaining item still needs dashboard or environment access. The single
cheapest item on this list has been spent, so Phase 5 should not expect further
progress from autonomous read-only investigation alone.

## New unknown recorded for honesty

The served production frontend bundle contains the Render API host, and
`getApiBaseUrl()` prefers `VITE_API_URL` in production. Therefore **the browser
does not call the Vercel function at all**, and repairing that function cannot
restore the site on its own. The unknown is whether `VITE_API_URL` is set
explicitly or the host is embedded by other means; either way it is an owner
action in the Vercel dashboard. See `DEPLOYMENT_MAP.md` §3.
