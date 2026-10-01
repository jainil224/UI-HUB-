# DO NOT CHANGE — Protected Code and Invariants

Rules for **any** future session, human or agent. Each entry states *what*, *why
it is load-bearing*, and *what breaks*. **Violating one of these does not cause
a visible error — it causes silent, delayed data or revenue loss.**

This list is Phase 1 output, revised after Phase 3. **Phase 3 changed source in
four places that were previously reported as defects**: the health handler in
`server.js` (which rule 5 still protects — the double route mount was left
alone), the broadcast and email-test auth in `routes/userRoutes.js`, the MCP tool
config in `configService.ts`, and the `@theme` block in `index.css`. Everything
else below is still an open finding awaiting the owner's decision. See
`../runtime/PHASE_3_CHANGES.md`.

---

## 0. The five rules that outrank the rest

If you remember nothing else:

1. **Never print, log, copy, or commit a secret value.** §1
2. **The client never decides that a payment succeeded.** §4
3. **`mcp-server/src/data/` is generated. Never hand-edit it.** §7
4. **The real theme is `src/index.css`, not `tailwind.config.ts`.** §6
5. **Do not "clean up" the double route mount in `server.js`.** §5

---

## 1. Secrets — absolute prohibitions

### Never do these

| Prohibition | Why |
|---|---|
| Write a secret **value** into any file under `.uihub-agent/` | This knowledge base is committed |
| Echo a secret into a log, test fixture, or error message | Logs are shipped to aggregators |
| Read `.env` / `service-account.json` and paste contents anywhere | Already handled; keep it that way |
| Add a working credential to `.env.example` | **It already happened once — see below** |
| Commit a `.env` file | Correctly ignored today; keep it that way |

### Environment variables are named, never valued

Write `MONGODB_URI`, not the URI. Write `RAZORPAY_KEY_SECRET`, not the secret.
This documentation tree follows that rule except where a leak must be reported.

### Known leak — the file is clean, the history is not

**Corrected in Phase 6 (task 6.29).** `backend/.env.example:37` today reads:

```
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster-host>/<database>?retryWrites=true&w=majority"
```

That is a placeholder and it is what the file should always contain.

However, **git history contains a real MongoDB Atlas URI with a real username
and password in this same file.** Verified in Phase 6 with
`git log --all -p -- backend/.env.example`, which returns a
`mongodb+srv://uihub_backend:…@cluster0.rynecsh.mongodb.net/` line. Editing the
file does not remove that.

**Two consequences, and they differ:**

1. **Rotation is still an owner action (OD-08).** The committed password must be
   treated as exposed to anyone who ever cloned this repository.
2. **An earlier version of this document claimed the file "is tracked and
   contains a live" credential.** That was false in the present tense and was
   corrected. Historical fact, current state, and unknown state must be stated
   separately — see `../AGENT.md` §"State and source precedence".

Full detail in `../CONFLICTS.md` §1 and `../tasks/OWNER_DECISIONS.md` OD-08.

### Firebase's web config is *not* in this category

`frontend/src/main.tsx` hardcodes a Firebase **web** config as a literal, and it
is public by design — it ships to every browser. It is credential-*shaped* but
not a secret. `RISK-03`: treat it as config to rotate through a redeploy, and
**still never copy its values into documentation.**

---

## 2. `backend/src/services/accessService.js` — the paywall

**The single file that decides whether a visitor may use a paid component.**

It is defensive by design, and the defensiveness is the point:

- reads **both** `planTier` and `planType` (§5.1 of `../data/DATA_OVERVIEW.md`)
- falls back to `inferCategory()` and the static premium list when MongoDB is
  unreachable, rather than failing closed
- returns a **machine-readable `reason`** (`CATEGORY_REQUIRED`, …) that the
  frontend branches on for its upsell prompt

### Do not

| Action | Consequence |
|---|---|
| Change the fallback to "fail closed" | A MongoDB blip locks out every paying customer |
| Add a **fourth** tier field | Reads must check all of them or paid access is denied |
| Change the `reason` strings | The frontend upsell branches silently stop matching |
| Trust `users.status` | It holds `'FREE'` and `'active'` in different code paths (§4.3) |
| Assume `_id === uid` | `_id` is the lowercased **email**; a uid branch exists only as legacy fallback (§4.2) |
| Query `users` by `_id` alone | Use the `$or: [{_id: email}, {email: email}]` form |

**`reason` is a public contract.** The frontend depends on those exact strings.

---

## 3. `backend/src/routes/paymentRoutes.js` and `paymentController.js`

### The webhook's position is load-bearing

```js
// The raw-body webhook route is registered BEFORE express.json()
```

The Razorpay signature is computed over the **unparsed** payload. If
`express.json()` is moved above it, or global body parsing is enabled, the
signature check **fails silently** — every webhook is rejected, and no payment
ever activates.

**Do not reorder the middleware in this file.** If you must add body parsing,
scope it to the specific routes that need it.

### Signature verification is correct — do not weaken it

`utils/verifySignature.js` uses **HMAC-SHA256 with `timingSafeEqual`**. The
constant-time comparison is what prevents a timing attack. Replacing it with
`===` reintroduces the vulnerability while looking like a simplification.

### The client must never assert payment success

`POST /v1/payment/verify-payment` verifies the signature **server-side** and
grants the entitlement **server-side**. The frontend's `razorpay_payment_id` is
**evidence to be verified, never proof**. A client that skips the verify call, or
that treats a client-side success as authoritative, breaks the business model.

### Three grant paths exist — do not add a fourth without reconciliation

1. `verify-payment` (synchronous)
2. the Razorpay webhook (asynchronous)
3. `setupProductionDatabase.js`, which grants `planTier: 'pro'` from a Razorpay
   history scan

**None of them deduplicate against each other.** Before adding a grant path,
read `firebaseService.fulfillPayment` and make the new path idempotent with it.

### `GET /v1/payment/recover-jainil`

Unauthenticated, named after one person. Purpose unclear — `confidence: low`.
**Do not extend it, and do not add routes in the same style.** Its existence is
a question for the owner, not a pattern to copy.

---

## 4. `mcp-server` — the AI-facing surface

### API keys are hashed and must stay that way

`mcp-server/src/middleware/auth.ts` stores **SHA-256 hashes only**
(`keyHash`, unique). The plaintext is returned exactly once, at creation, and
cannot be recovered.

- **Never** store, log, or return a plaintext key after creation.
- `keyPrefix` + `keyPrefixMask` exist so keys can be *displayed* without being
  *usable*. Do not "improve" this by storing the key itself.

### Auth failures return HTTP 200, on purpose

`-32001` (auth) and `-32003` (internal) are returned inside a **200** response
with a JSON-RPC error envelope, so clients can show a readable message.

**This means HTTP status cannot be used to detect MCP auth failure.** Any
monitoring, retry layer, or client-side check that treats a 200 as success will
treat a rejected key as a successful call. Do not "fix" this to a 4xx without
coordinating every client.

### `PATCH /api/admin/mcp/tools/:name` is a live kill-switch

Disabling a tool takes effect for **every** MCP client immediately. It requires
Firebase auth **and** the `MCP_ADMIN_EMAILS` allow-list. Treat a change here as a
production outage until proven otherwise.

### `mcp_config.tools` is seeded from a stale list

The `$setOnInsert` seed names `list_components` — **a tool that does not
exist** — and lists only 4 of the 14 real tools. Because it is `$setOnInsert`,
an existing document is never corrected. **Before trusting `mcp_config.tools` as
the authority on which tools are enabled, verify the reader actually exists.**
`../CONFLICTS.md` §11.

### The server is hand-implemented — do not assume SDK semantics

`@modelcontextprotocol/sdk` is **not a dependency**. Protocol version
`2025-06-18` is implemented by hand. Consequences:

- **Only tools exist.** No `resources/*`, no `prompts/*`. A client that
  requests them gets nothing.
- `GET /` and `DELETE /` are an **in-memory session store**, not 405s as
  `docs/mcp.md` claims. It is per-process, so a session does not survive a
  restart or a second instance.
- Do not "upgrade" to the SDK as part of an unrelated change. That is a
  migration with its own plan.

---

## 5. `backend/src/server.js` — the double mount

```js
app.use('/api', router);
app.use('/',   router);
```

One router, two mounts. `GET /v1/components` and `GET /api/v1/components` are
the same handler.

**This is deliberate and load-bearing:**

- the Vercel serverless function is reached at `/api` (`vercel.json` rewrites
  `/api/(.*)` → `api/index.js`)
- the Render service serves the app at the root

**Removing either mount breaks one entire deployment target**, and because the
`catch` on the MCP block and the lenient error handler swallow errors, it may
break with nothing more alarming than a 404 in a browser.

### The `listen` guard

```js
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL)
```

De Morgan's law in a startup condition. It currently produces the right answer
on all three platforms, but it is unusual enough that a well-meaning
simplification to `if (!process.env.VERCEL)` **starts a listener inside the
Vercel function**. If you touch this, verify all three environments.

### The MCP import block must stay optional

The `try`/`catch` at lines 109-138 is what lets the app boot without
`mcp-server/dist`. Removing the `catch` turns a missing build artifact into a
total outage — which is arguably correct, but it is a behaviour change that
belongs to the owner, not to a drive-by edit.

---

## 6. `frontend/src/index.css` — the live theme

### `frontend/tailwind.config.ts` is dead code

Tailwind **v4.1.14** is installed and loaded via `@tailwindcss/vite` +
`@import "tailwindcss"`. **There is no `@config` directive**, so the v3 config is
never read.

**Editing `tailwind.config.ts` changes nothing and reports no error.** All 17
colors, all 12 shadows, and the `font-display`/`heading`/`serif` families in
that file are inert.

**To change the theme, edit `index.css`.** `../CONFLICTS.md` §15.

### Known-broken tokens — fix deliberately, never incidentally

**Phase 3 repaired the rows marked FIXED.** The remaining rows are still true.

| Token | Problem | Usages affected | State |
|---|---|---|---|
| `--font-heading: "Space+Grotesk"` | `+` should be a space; no such family → falls back to `sans-serif` | 44 | **FIXED** → `"Space Grotesk"` |
| `--color-brand-green` | used by `text-brand-green`/`bg-brand-green` but never defined, so both utilities generated **no CSS at all** | 58 | **FIXED** → `#3D5CFF` |
| `--color-ring`, `--color-background`, `--color-foreground`, `--color-input`, `--color-muted`, `--color-muted-foreground`, `--color-accent`, `--color-secondary` | **referenced by shadcn classes but never defined** — every one a silent no-op | 39 | **FIXED** — all 8 added |
| `--font-seekuw: "Seekuw"` | font never loaded | — | open |
| `font-serif` | not defined in `@theme`; uses Tailwind's default serif, not Source Serif 4 | 63 | open |

The `brand-green` and shadcn rows are the ones to remember, because they were
invisible: the classes were written correctly, Tailwind emitted nothing, and no
build or typecheck complained. **`button.tsx` shipped a `focus-visible:ring-ring`
that never rendered — the keyboard focus ring was missing on every page.**

**Verify a token repair against the emitted CSS, never against the source that
appears to define it.** That is the whole lesson of this section.

`tailwind.config.ts` is now a second trap. It still holds 17 colors, 12 shadows,
and font families that do nothing at all — `shadow-neon`, `shadow-brutal-blue`,
`bg-black-rgb` are absent from the built stylesheet. **Consider deleting it in a
later phase**; leaving it invites the next reader to make the same no-op edit.

### `:root.light` is reachable, but only half-applies

A 14-token light theme exists **and the toggle is already wired** — `ThemeProvider`
is mounted in `App.tsx`, 16 files call `useTheme`, and it sets the `light` class
on `<html>` and persists the choice. The hand-written layer
(`.brutal-shadow-*`, `body` background/text) follows it correctly.

**An earlier phase recorded this section as "unreachable". That was wrong.**
The actual defect is narrower and different:

1. The 21 `dark:` variant usages respond to the **OS**, because Tailwind v4
   defaults to `prefers-color-scheme` and there is no `@custom-variant dark`
   anywhere in this file.
2. The `@theme --color-brand-*` values are literal hex, so every `bg-brand-*`
   utility ignores the toggle entirely.

So toggling light changes roughly half the page. Two coherent end states, both
requiring edits to this file: **class-driven** — add
`@custom-variant dark (&:where(.dark, .dark *));` and re-point `@theme` at the
`:root` / `:root.light` vars — or **delete** `:root.light` and the toggle and
accept OS-driven theming. Phase 3 chose neither by explicit owner decision, so
light mode is a known, accepted partial state. Do not "fix" it incidentally.
`../CONFLICTS.md` §16.

### The brutalist layer is hand-written CSS

`.brutal-shadow-*`, `.brutal-btn-*` are plain classes from line 237 onward, not
Tailwind utilities. **Tailwind utilities cannot cleanly override them**, and
`index.css` is the highest-blast-radius file in the frontend.

---

## 7. Generated data — never hand-edit

`mcp-server/src/data/` is produced by `npm run sync:data`
(`scripts/sync-frontend-data.mjs`) from the frontend sources.

**A hand edit is reverted by the next sync, silently.** The build's
`check-source-coverage` step will warn only if a *premium component lost its
source* — never that your edit was overwritten.

**To change component data, change the source:**

| Want to change | Edit |
|---|---|
| A component's metadata | `frontend/src/data/componentData.tsx` |
| A component's source | `EMBEDDED_SOURCE_CODE` in `backend/src/services/componentSyncService.js` |
| A template | `frontend/src/data/templatesData.ts` |
| An AI prompt | the prompt bank, then `sync:data` |

### Freshness classification (Phase 6, task 6.23)

Editing is not the only danger; **stale committed output** is. Before writing any
path, identify which class it belongs to:

| Class | Meaning | How freshness is verified |
|---|---|---|
| **Generated** | Fully derived; the repository stores no unique content | `npm run check:generated` rebuilds `mcp-server` to a temp dir and compares the whole tracked `dist` tree |
| **Semi-automatic** | Committed output of a script that can fail or skip | Same command, plus a manual confirmation the script actually ran |
| **Manual** | Hand-maintained; no generator exists | Read the file, then the tests that cover it |

Current classification:

| Path | Class | Verification |
|---|---|---|
| `mcp-server/dist/**` | **Generated** | `npm run check:generated` — never hand-edit, never commit a partial build |
| `mcp-server/src/data/**` | **Generated** | `npm run sync:data`; a hand edit is silently reverted |
| `backend/dist`, `frontend/dist` | **Generated** | gitignored, rebuilt per deploy; must never be committed |
| `.uihub-agent/PROJECT_MAP.json` | **Generated** | `npm run generate`; do not hand-patch |
| `premiumComponents.json` | **Semi-automatic** | written by sync, but three premium lists exist and are not reconciled |
| `backend/.env.example` | **Manual** | placeholder-only by contract, §1 |
| `.uihub-agent/security/**`, `rules/**` | **Manual** | reviewed, not generated |

**Phase 6 finding:** `mcp-server/dist/data/` was stale in `HEAD` — the committed
copy did not match `src/data`. A rebuild fixed it. The reason it drifted is that
`npm run build` in CI runs *after* the tracked-output check would run, and the
"Restore committed dist" step previously hid the difference. `check:generated`
now closes that gap.

### Three hand-maintained premium lists, none reconciled

`componentData.tsx` · `premiumComponents.json` (41 ids) · the backend's
`PREMIUM_COMPONENT_IDS`. **`check-source-coverage` compares only the last two,
and only for source presence.** A component marked premium in one place and free
in another is undetectable from the repo. `../data/DATA_OVERVIEW.md` §7.3.

---

## 8. Rate limiting and auth middleware

### `optionalVerifyToken` is duplicated, not shared

Defined **twice** — `componentRoutes.js:18` and `userRoutes.js:883`. They are
separate functions.

**Editing one does not change the other.** Before changing auth behaviour on
either, read both.

### Eight unauthenticated user endpoints, four of which broadcast

`GET /check`, `POST /email-test`, `/free-email-test`, `/pro-email-test`,
`/reengagement-email-test`, **`/broadcast-reengagement`**,
**`/broadcast-announcement`**, **`/push-broadcast`**.

Any of them can be called by anyone and, for the broadcasts, emails or pushes
**every user**. `RISK-02`, `../CONFLICTS.md` §6.

**Do not add a route to `userRoutes.js` above the `verifyToken` line by
habit.** Placing it in the wrong position silently makes it public. The
position of a route in that file is its security boundary.

### The free-tier vault limit is enforced in application code

`favorites` + `collections` share **one** combined cap, counted in
`collectionsService`. It is **not** a database constraint — nothing at the
MongoDB layer stops a race from exceeding it. Any new "save" surface must call
the same counter or it will bypass the limit.

---

## 9. Admin routes

`/api/admin/mcp` requires Firebase auth **and** membership of
`MCP_ADMIN_EMAILS`. Three capabilities are destructive:

- `POST /users/:id/suspend` · `/unsuspend` — account access
- `PATCH /api-keys/:id` with `action: revoke|disable|enable|restore` — **any
  user's key**
- `PATCH /tools/:name` — **global kill-switch**

`GET /logs` is registered **twice** in `mcp-server/src/routes/admin.ts`; the
first registration wins and the second is unreachable dead code. Harmless, but
do not "fix" it without knowing why it is duplicated.

---

## 10. Scripts that mutate production

### `backend/src/scripts/setupProductionDatabase.js`

Despite the name, it **creates indexes, seeds components, syncs Razorpay
payments, and grants `planTier: 'pro'` / `'elite'`** to a hardcoded email list.

**It writes to whatever `MONGODB_URI` points at.** Run against production, it
is a mutation. It prints *"YOUR MONGODB ATLAS IS FULLY PRODUCTION READY!"* and
`process.exit(0)`.

**Do not run it to "fix" indexes.** Changing an index's `expireAfterSeconds`
does not retro-apply — the index must be dropped and recreated by hand.

### `syncComponents.js`

Fire-and-forget. The frontend does not await `POST /v1/components/sync`, and
`syncComponents.js` itself is throttled to 1×/hour. **A sync failure is
completely silent** — no user-facing error, no alert.

### `migrateFirestoreToMongo.js`

**Dead code** — Firestore is no longer a dependency. But it is the only
artifact recording the Firestore→MongoDB shape transition. **Do not delete it
until that knowledge is captured here**, and do not run it.

---

## 11. Files to leave alone

| Path | Why |
|---|---|
| `mcp-server/src/data/*` | Generated — §7 |
| `frontend/tailwind.config.ts` | Dead — §6. (Delete only as a deliberate, owner-approved cleanup.) |
| `frontend/public/**` | Large binary assets; not analysed. No blind edits. |
| `backend/.env.example` | Placeholder-only by contract. A real URI is in git **history**, not in the file — §1 |
| `.agents/skills/**` | Local-only agent workflows, git-ignored. Preserved as-is. |
| `agent.md` (repo root) | The owner's plan document. **Not ours to edit.** |
| `.uihub-agent/**` | The knowledge base. Regenerate via the generator, do not hand-patch `PROJECT_MAP.json`. |

---

## 12. The change checklist

Before any change to the areas above, answer all six:

1. Which invariant does this touch, and where is it documented?
2. What is the **silent** failure mode if I get it wrong?
3. Does this change a **security boundary** (auth position, token scope, key
   handling)?
4. Does it change a **stored data shape** that already exists in production?
5. Is the value I about to write a secret, or derived from one?
6. What test would have caught a mistake here — and if the answer is "none",
   what is the manual verification step?

**If any answer is unclear, stop and ask.** Every entry in this file was found by
reading code, not by running the product; my confidence is stated per item, and
`confidence: low` means *ask before touching*.
