# UI HUB — Data Overview

Where data lives, how it is shaped, and where the shapes are implied rather
than declared.

**No secret values appear in this file.** Environment variables are named only.

---

## 1. The honest headline: there is no schema

The project has **no schema definitions anywhere** — no Mongoose models, no JSON
Schema, no Zod, no TypeScript types for documents, no migration runner.
Every collection is reached through raw `db.collection(name)`.

What *does* exist is
**`backend/src/scripts/setupProductionDatabase.js`** — a one-shot script that
creates every index. Index definitions are the closest thing this codebase has
to a schema declaration, because an index both names a field and asserts that
the field is required and how it is queried.

**This file is therefore built from three evidence sources, in priority order:**

1. Index definitions in `setupProductionDatabase.js` — authoritative, because a
   missing index breaks a live query.
2. Field writes in services and routes — authoritative for values, unverified
   for types.
3. Read projections — authoritative for what the code depends on.

Anything not visible in those three is marked `not verified`. **Document shapes
here are inferred, not guaranteed.** Confirm against live data before changing
a query. Full field-by-field validation belongs to Phase 5.

---

## 2. Four datastores, four very different jobs

| Store | Job | Durable? | Loss impact |
|---|---|---|---|
| **MongoDB Atlas** | System of record. Users, entitlements, catalogue, money | Yes | **Severe** |
| **Firebase Auth** | Identity. The token issuer | Yes | Severe (login) |
| **Upstash Redis** | Distributed rate limits | No — cache | Annoying |
| **Static files in git** | The catalogue's *actual* source of truth | Yes | Severe |

The fourth row is the one to internalise.

> **The component catalogue is defined in this repository, not in MongoDB.**
> `frontend/src/data/componentData.tsx` and `EMBEDDED_SOURCE_CODE` are the
> inputs. The `components` collection is a *seeded mirror* that the setup
> script fills from those same embedded sources. **Editing a Mongo document
> does not change what the site serves, and editing a frontend file does not
> update MongoDB until the sync runs.** See §7 and `../CONFLICTS.md` §6.

---

## 3. MongoDB Atlas

Accessed through `backend/src/services/mongoService.js` — a lazy singleton
exposing `getDb()` and `getCollection(name)`. **12 collections** are referenced
in code.

### 3.1 Collection inventory

| Collection | Purpose | Key indexes | TTL |
|---|---|---|---|
| `users` | Identity + entitlements | `email` **unique**; `role`; `planTier`; `firebaseUid` sparse | — |
| `components` | Catalogue mirror | `{category, isPro}`; text `{title, tags}` | — |
| `favorites` | Saved components | `{userId, componentId}` **unique** | — |
| `collections` | User-curated groups | `_id` = `collectionKey(userId, collectionId)` | — |
| `payments` | Razorpay orders + captures | `orderId` **unique**; `paymentId` unique sparse; `{userId, createdAt:-1}`; `status` | — |
| `payment_webhooks` | Webhook idempotency | `eventId` unique sparse; `receivedAt:-1` | — |
| `email_logs` | Brevo delivery log | `{recipientEmail, sentAt:-1}`; `status`; `templateType` | **90 days** |
| `activity_logs` | Behavioural events | `{email, createdAt:-1}`; `type` | **90 days** |
| `mcp_api_keys` | MCP API keys | `keyHash` **unique**; `{userId, status}`; `keyPrefix` | — |
| `mcp_analytics` | Per-call MCP telemetry | `{userId, timestamp:-1}`; `{tool, timestamp:-1}`; `keyPrefix` | **60 days** |
| `mcp_audit` | Admin actions | `{adminEmail, at:-1}`; `action` | — |
| `mcp_config` | MCP config singleton, `_id: 'app'` | — | — |

### 3.2 Retention

Only three collections are set to expire. **`mcp_audit` has no TTL**, and
`activity_logs` and `email_logs` do — so activity analytics are permanently
limited to a 90-day window, and a dashboard built on `activity_logs` will
silently lose history. If a retention requirement changes, the index must be
dropped and recreated; a new `createIndex` with a different `expireAfterSeconds`
does not retro-apply. `confidence: medium` on that MongoDB detail.

---

## 4. The `users` collection

### 4.1 Field shape

Assembled from `userRoutes.js` (`POST /sync`, `GET /status`),
`firebaseService.js`, `accessService.js`, and the setup script.

| Field | Written by | Notes |
|---|---|---|
| `_id` | sync, setup | **Lowercased email** — see §4.2 |
| `email` | sync, setup | `unique: true` |
| `uid` | sync | Firebase UID |
| `firebaseUid` | — | `sparse` index exists; **no verified writer** |
| `displayName` | sync | |
| `role` | setup, normalize | `USER` \| `ADMIN` \| `SUPER_ADMIN` |
| `isAdmin` | setup, normalize | Boolean mirror of `role` |
| `planTier` | setup, status | `free` \| `pro` \| `elite` \| `custom` |
| `planType` | `fulfillPayment`, status | Overlaps `planTier` — see §5 |
| `status` | sync, setup | **`'FREE'` (uppercase) on sync, `'active'` in setup** — see §4.3 |
| `selectedCategories` | `fulfillPayment` | Category names, custom plans |
| `entitlements` | `fulfillPayment` | Lowercased component ids, a-la-carte |
| `planDuration` · `planExpiry` · `proExpiry` | payment flow | Three expiry fields — see §5.3 |
| `lastPaymentId` | Razorpay sync | |
| `createdAt` · `updatedAt` · `lastLogin` · `lastActive` | various | |
| `lastPaymentAt` | payment flow | |

### 4.2 `_id` is the email — but not always

This is the single most important thing to know before writing a users query.

The primary key is the **lowercased email address**, not the Firebase UID:

```js
const userEmailKey = (email || '').toLowerCase();
// $setOnInsert: { _id: userEmailKey, email: userEmailKey, ... }
```

Because the design changed over time, reads defensively query **two** shapes:

```js
// userRoutes.js:821
{ $or: [{ _id: userEmailKey }, { email: userEmailKey }] }
// ...and when there is no email at all:
{ $or: [{ _id: uid }, { uid }] }
```

That second branch only makes sense if some documents are keyed by **uid**.
No writer in the current code creates a uid-keyed document. So either legacy
documents exist from before the migration, or the branch is dead code.
**Which of the two is true cannot be determined from source alone.**
`confidence: medium`. **Do not write a new query on `_id` alone** — use the
`$or` form, and never assume `_id === uid`.

### 4.3 `status` is inconsistent

`POST /v1/users/sync` writes `status: 'FREE'`.
`setupProductionDatabase.js` writes `status: 'active'`.
The Razorpay sync writes `status: 'active'`.

Two vocabularies for one field. Because no index, query, or grant decision
reads `users.status`, the damage today is cosmetic — but any future feature
that filters on `status` will silently mis-handle half the users. Do not "fix"
this in Phase 2; record it. `../CONFLICTS.md` §8.

### 4.4 Roles

`setupProductionDatabase.js` seeds two hardcoded email lists, `SUPER_ADMINS`
and `ADMINS`, with `planTier: 'elite'` and `'pro'` respectively, and then
normalizes everything else lacking a `role` to
`role: 'USER', planTier: 'free', isAdmin: false`.

The **MCP admin route uses a different mechanism entirely**:
`MCP_ADMIN_EMAILS` as an environment allow-list
(`mcp-server/src/routes/admin.ts`). So "admin" means three different things:

| Mechanism | Where | Meaning |
|---|---|---|
| `users.role` / `isAdmin` | MongoDB | Backend admin surfaces |
| `MCP_ADMIN_EMAILS` | env var | MCP `/api/admin/mcp` allow-list |
| `planTier: 'elite'` | MongoDB | Folded into Pro at read time |

`GET /v1/users/status` **folds elite into pro** — "so the frontend only needs
Free/Pro" — which means the frontend cannot distinguish elite from pro. A
frontend feature that must treat them differently has no data to work with.
`../CONFLICTS.md` §9.

---

## 5. The entitlement model

The most intricate part of the data layer, and the easiest to break. Read
`backend/src/services/accessService.js` before touching any of it.

### 5.1 Two overlapping tier fields

`planTier` and `planType` hold the same concept and both are read:

```js
isCustom: user.planType === 'custom' || user.planTier === 'custom',
planType: user.planType || user.planTier || 'free',
```

`planTier` is set by the setup script and by free activation; `planType` is set
by `fulfillPayment`. A user who upgraded without a setup-script run can have
`planTier: 'free'` and `planType: 'pro'` simultaneously. **Every read checks
both — and a new feature must too.**

### 5.2 Three ways to be entitled

`canAccessComponent` returns allowed if **any** of these hold:

1. **Global tier** — the plan grants everything (`pro`, `elite`).
2. **Category grant** — `plan.selectedCategories.includes(meta.category)`.
   A custom plan scoped to chosen categories.
3. **A-la-carte** — `plan.entitlements.includes(meta.id)`, a single component
   bought by id, stored lowercased.

Otherwise the response carries a machine-readable reason: `CATEGORY_REQUIRED`,
and the tier `'custom'`. **The `reason` field is the contract** — the frontend
branches on it to choose an upsell prompt.

### 5.3 Three expiry fields

`proExpiry`, `planExpiry`, and `planDuration` all exist. Only `planExpiry` is
surfaced through `GET /v1/users/status`, as an ISO string, with a defensive
`instanceof Date` check that falls back to the raw value. `checkProStatus` is a
separate function from the expiry-field logic. **The relationship between the
three is not documented in code.** `confidence: low`. This is the highest-risk
area of the data layer — an expiry bug grants or revokes paid access.

### 5.4 Where access decisions actually come from

```
  token ──► verifyToken ──► accessService
                              │
      users.planTier/planType ├─ global?
      users.selectedCategories ├─ category?
      users.entitlements      └─ a-la-carte?
                              │
                              ▼
                   components.isPro / category
                          (MongoDB mirror,
                        inferCategory fallback)
```

`resolveComponentMeta` reads `components.findOne({_id}, {isPro, category})` —
a **projection with no try/catch** — and falls back to `inferCategory()` and the
canonical static list when the DB is unavailable. So the free/premium decision
degrades to static inference rather than failing closed.

> **Consequence: the pricing boundary has two independent sources of truth**
> (`components.isPro` in MongoDB and `PREMIUM_COMPONENT_IDS` in code) and no
> reconciliation job. `mcp-server/scripts/check-source-coverage.mjs` verifies
> only that premium components *have source code* — it does not compare the two
> lists. A component marked premium in one place and free in the other is
> undetectable from the repo. `../CONFLICTS.md` §7.

---

## 6. The other collections

### `components`
`_id` is the component slug. Seeded with `title` (derived from the id by
`formatTitle`), `category` (by `inferCategory`), `framework: 'react'`,
`styling: 'tailwind'`, `isPro`, `code`, `tags`, `viewsCount`, `copyCount`.
`viewsCount` and `copyCount` are written `$setOnInsert` and **have no verified
incrementer** — analytics counters that appear to never move.
`confidence: medium`.

### `favorites`
One document per `(userId, componentId)`, enforced unique. **The free tier
applies one vault limit across favorites *and* collections combined** —
`collectionsService` counts both to enforce a single global cap. The limit
value is defined in the service; it is not in the index, and is therefore not
enforced at the database level.

### `collections`
`_id` is a deterministic `collectionKey(userId, collectionId)` composite, so a
user cannot be made to collide by choosing a collection name. Ids are truncated
to 40 characters or replaced with `collection-<timestamp>`. No index is
declared for this collection in the setup script.

### `payments` and `payment_webhooks`
`payments` is the Razorpay mirror: `orderId` unique, `paymentId` unique sparse,
`amount` in **minor units** (paise) as returned by Razorpay. `contact` and
`description` are copied from Razorpay verbatim. `payment_webhooks` keys on
`eventId` (unique sparse) for **idempotency** — the correct pattern for
at-least-once webhook delivery, and one of the better decisions in the
codebase.

**Two independent grant paths exist:** the synchronous `verify-payment` route
and the asynchronous webhook. Both can call `fulfillPayment`. The setup script
contains a *third* path that grants `planTier: 'pro'` directly from a Razorpay
history scan. No deduplication between them. `../CONFLICTS.md` §18.

### `email_logs` and `activity_logs`
Write-through logs of Brevo sends and user events, both 90-day TTL.
`activity_logs` entries are written by `logActivity` with
`type: 'user.created' | 'user.login' | …`. No schema is declared, so an event
type is a bare string in a `type` field.

### `mcp_api_keys`
`keyHash` unique. Stores the **SHA-256 hash only** — plaintext exists solely in
the creation response. `keyPrefix` (with a mask) for display, `userId`,
`status`. This is the correct pattern and the strongest security decision in the
project.

### `mcp_analytics`
Per-call telemetry with a 60-day TTL, indexed by `userId`, `tool`, and
`keyPrefix`. The `keyPrefix` index is what makes per-key usage attribution
possible without storing the key.

### `mcp_audit`
Admin actions: `adminEmail`, `action`, `at`. **No TTL — it grows without bound.**
For an audit trail that is arguably correct, and it is the only log in the
system intended to be permanent.

### `mcp_config` — a verified bug waiting to happen

A singleton document, `_id: 'app'`, seeded with:
`rateLimitFree: 100`, `rateLimitPro: 10000`, `authEnabled: true`,
`analyticsEnabled: true`, `loggingEnabled: true`, `maintenanceMode: false`, and:

```js
tools: {
  get_component_code: true,
  list_components: true,          // ← no such tool exists
  search_components: true,
  get_component_metadata: true,
}
```

> **`list_components` is not a registered tool.** The registry in
> `mcp-server/src/tools/index.ts` contains `list_all_components` and 13 others.
> The seed also names only 4 of the 14 real tools.
>
> Because the seed uses **`$setOnInsert`**, it only ever runs on a document that
> does not exist yet. So: on a database where `mcp_config` already exists,
> this stale entry persists **forever**, and any code that gates tools by
> consulting `mcp_config.tools` would disable the other 10 tools.
>
> **I could not confirm whether any code path actually reads
> `mcp_config.tools`** — `PATCH /tools/:name` in the admin route is the likely
> writer, and the dashboard may read it. Recorded as `CONFIRMED` conflict with
> `confidence: medium` on the *consequence*. `../CONFLICTS.md` §11.

---

## 7. Static data — the real source of truth

### 7.1 Frontend

`frontend/src/data/componentData.tsx` — **137 components, 13 categories**,
each with `isPro`, `isNew`, `tags`, `preview`, `author`. The premium list is a
**Set literal maintained by hand** in the same file.

This is what renders on screen. Nothing in MongoDB affects the component grid.

### 7.2 Backend

`EMBEDDED_SOURCE_CODE` in `backend/src/services/componentSyncService.js`, plus a
static `PREMIUM_COMPONENT_IDS` set and `inferCategory()`. **The free/premium
decision and the category assignment both fall back to these when the database
is unreachable.**

### 7.3 MCP — generated, not hand-maintained

`mcp-server/src/data/` is produced by
`mcp-server/scripts/sync-frontend-data.mjs` (`npm run sync:data`) from the
frontend files. Never edit these by hand: **the next sync silently overwrites
your change**, and the build's `check-source-coverage` step will not warn you
that the edit was reverted — only that a premium component lost its source.

| Generated file | Contents |
|---|---|
| `components.ts` | `CATEGORY_MAP`, `DEPENDENCIES_MAP`, `PREMIUM_IDS`, `CATEGORY_DESCRIPTIONS` |
| `sourceCode.json` | 148 source payloads |
| `premiumComponents.json` | 41 premium ids |
| `templates.json` | 8 top-level keys (19 templates) |
| `templateSourceCode.json` | Template sources |
| `aiPrompts.json`, `componentVibePrompts.json` | AI prompt banks |
| `componentMetadata.json` | Prop and vibe metadata |

> **Three premium lists, all hand-maintained, none reconciled:**
> `componentData.tsx` (137 components), `premiumComponents.json` (41 ids), and
> the backend `PREMIUM_COMPONENT_IDS`. `check-source-coverage` compares only
> the last two, and only for *source presence*. `../CONFLICTS.md` §12.

---

## 8. Upstash Redis — ephemeral by design

`backend/src/middleware/rateLimiters.js`. `REDIS_URL` only.

Holds distributed rate-limit counters for the AI prompt, source-download, auth,
and MCP paths. **Loss is acceptable**: a counter reset means a briefly more
permissive limit, not broken data. This is the only store where wiping is a
legitimate recovery action.

If `REDIS_URL` is unset the limiters fall back to in-process counters, which
means limits are **per-instance** — and the backend runs as a single Render
process, so this is currently safe. It would not be under any scale-out.

---

## 9. Firebase

### Auth — the identity provider
Both sides verify the same tokens: the frontend signs in with
`frontend/src/lib/firebase.ts`; the backend verifies with
`backend/src/utils/firebaseAdmin.js`; the MCP server verifies independently via
`mcp-server/src/services/firebase.ts`. Firebase owns identity; **MongoDB owns
everything else about a user.**

> **Firebase's own user record is not the app's user record.** Profile fields,
> plan, and entitlements live only in MongoDB, keyed by email. Renaming an
> email in Firebase creates a new MongoDB user with a fresh free plan, and the
> old document is orphaned. This is a real, unhandled data-loss path.
> `../CONFLICTS.md` §14.

### Analytics
`gtag` in `frontend/index.html`, Consent Mode v2, with a
`VITE_ENABLE_GTAG` gate. Events are sent **client-side to Google** and are
**not** stored in MongoDB. So the `activity_logs` collection and Google
Analytics are **two independent analytics systems with different shapes and no
reconciliation**.

### The hardcoded web config
`frontend/src/main.tsx` initialises Firebase from a **literal config object in
source**, and the `GET /v1/config/firebase` response is discarded with the
re-init call commented out. Firebase web config is designed to be public and is
**not a server secret** — but it is credential-shaped data in a source file
that is publicly readable, and rotating it requires a code change plus a
redeploy. `RISK-03`. **Never copy its values into this documentation tree.**

---

## 10. Data flow: catalogue sync

```
frontend/src/data/componentData.tsx   ← authored by hand
        │
        │  npm run sync:data
        ▼
mcp-server/src/data/*                 ← GENERATED, do not hand-edit
        │
        │  served from
        ▼
14 MCP tools  ─────────────►  AI clients
        │
        │  EMBEDDED_SOURCE_CODE (separate copy, in backend)
        ▼
POST /v1/components/sync  ──►  components collection
                               (throttled to 1×/hour, caller does not await)
```

**The two copies are not linked.** The backend's `EMBEDDED_SOURCE_CODE` and the
MCP server's generated `sourceCode.json` are produced by different processes
from different inputs. They can drift, and nothing detects it.

`syncComponents.js` (throttled hourly) and `setupProductionDatabase.js`
(full reseed from embedded sources) both write `components`. Whichever ran last
wins. The sync is **fire-and-forget** — the frontend does not await it, so a
sync failure is silent.

---

## 11. Migration and dead code

`backend/src/scripts/migrateFirestoreToMongo.js` migrates from **Firestore**,
which is no longer a dependency. There is no remaining Firestore usage.

**It is dead code, and it is the only artifact describing the Firestore→MongoDB
shape transition** — so it is also the closest thing to a historical schema
record. Do not delete it casually; do not run it. If a future phase removes it,
capture the shape knowledge here first.

There is **no migration framework**. Schema evolution is done by hand, ad hoc,
against a live production database. There is no staging database in the repo,
and `setupProductionDatabase.js` — despite the name — writes to whatever
`MONGODB_URI` points at and **grants paid entitlements** while doing so.
Running it against production is a mutation, not a setup. `../rules/DO_NOT_CHANGE.md`.

---

## 12. Not documented here

| Area | Why | Phase |
|---|---|---|
| Full field-by-field document shapes | Not read for every writer | 5 |
| MongoDB type validators | None exist | — |
| `mcp_config` actual consumers | Not traced end to end | 3 |
| `mcp_analytics` event schema | No schema declared | 5 |
| Firestore legacy shape | Dead code | Never |
| Live data volumes, index usage | Requires a live cluster | 2 |
| `viewsCount` / `copyCount` writers | None found — possibly dead | 5 |
