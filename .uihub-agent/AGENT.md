# UI HUB — Agent Instructions

**Phase:** 1 — Codebase Discovery & Project Census
**Knowledge base:** `.uihub-agent/`
**Status:** Phase 1 complete. This file is the entry point for the next agent.

---

## 1. What UI HUB is

UI HUB is a **component and template marketplace for "vibe coding"**. It hosts a
catalogue of 137 copyable React UI components (interactive backgrounds, cursors,
text animations, buttons, loaders, navbars, footers, 3D scenes) and 19 website-section
templates, and distributes them three ways: through a browsable web UI, through a
Model Context Protocol (MCP) server for AI coding agents, and through a
zero-dependency CLI.

It is monetised through Razorpay with free / pro / custom tiers plus per-component
purchases. A companion admin console operates the MCP layer.

A non-workspace monorepo with five parts:

| Part | What it is |
|---|---|
| `frontend/` | Vite + React 19 + TypeScript SPA. The product UI. |
| `backend/` | Express 4 REST API. Plain JavaScript ESM. |
| `mcp-server/` | TypeScript MCP server. Protocol hand-implemented. |
| `cli/` | Zero-dependency Node CLI; a thin MCP client. |
| `api/index.js` | Vercel serverless wrapper re-exporting the backend. |

---

## 2. Source-of-truth rule

**The repository is the source of truth.** Prior conversation knowledge, old
documentation, file comments, filenames and assumptions never override what is
currently in the code.

When sources conflict, resolve in this order:

```
Code evidence
    > Current configuration (package.json, vercel.json, render.yaml, tsconfig)
    > Current documentation (docs/, README.md, MCP.md)
    > Old documentation
    > Assumption
```

> **The repository's own documentation is currently unreliable.** `README.md`,
> `docs/mcp.md` and `docs/runbook.md` contain at least 18 verified factual errors,
> including a claim that the MCP server lives in a different repository and a
> table of Python scripts that do not exist. **Read `CONFLICTS.md` before trusting
> any prose documentation here**, and verify anything load-bearing against code.

### 2.1 State and source precedence (Phase 6, task 6.24)

"The repository is the source of truth" is about *code*. It does not settle what
is true about **deployed** systems, and collapsing the two produces confident
wrong answers. Distinguish three kinds of claim, and never let one inherit the
precedence of another:

| Kind | Precedence | Verified by |
|---|---|---|
| **Code behaviour** | The source, as it stands | Reading and running the code |
| **Committed artifact** | The bytes in git | `git show`, `git log -p` |
| **Deployed state** | An observation, dated | A live request or dashboard, with the date |

Two rules follow, both learned from Phase 5/6 errors:

**1. The code and its tracked output are separate sources.** `mcp-server/dist` is
tracked, so "the file says X" is true of the file and false of the build.
`npm run check:generated` exists because a committed artifact can be stale while
every source file reads correctly.

**2. A past observation outranks present inference, and cannot be "corrected".**
If a measurement recorded `VITE_API_URL = https://ui-hub.onrender.com`, that
remains true of the bundle measured on that date, even after Render is renamed.
Rewriting it to the current guess would falsify evidence *and* make dependent
instructions wrong — telling an owner to delete a variable that does not hold
that value. **Correct the present, never the record.** Cite the observation with
its date and attribute the uncertainty to the *present*, not the past.

When code, tracked output and deployment disagree, that disagreement is itself a
finding. Record all three; do not pick a winner.

### 2.2 Recording a conflict (Phase 6, task 6.25)

Disagreements are not resolved by choosing the more convenient source. Each one
gets an entry in `CONFLICTS.md` with:

1. **The claim**, quoted, with `file:line`.
2. **Each competing source**, with its own `file:line`. Never only the winner.
3. **What is verifiable now**, and how — read code, ran a test, or observed.
4. **What remains unprovable from the repository**, and who could prove it.
5. **The decision**, if the owner has made one, or `OPEN` with a pointer to
   `tasks/OWNER_DECISIONS.md`.

Do not add a conflict entry by editing the losing document into agreement.
Automation must be able to detect the disagreement, so
`check:config` and `check:docs` read both sides.

### Confidence and status markers

Every claim in this knowledge base carries one:

- `confidence`: `high` (read directly from source) · `medium` (inferred from
  adjacent evidence) · `low` (structurally plausible, unverified)
- `status`: `active` · `implemented` · `partially-implemented` · `experimental`
  · `orphaned` · `declared-unused` · `UNKNOWN`

`UNKNOWN` means *not verifiable from the code as it stands*. It is never a
placeholder for something unrecorded — it is a real answer. Do not guess past it.

---

## 3. How to use `.uihub-agent/`

Load selectively. Do not read the whole tree for a small task.

| File | Read it when |
|---|---|
| `AGENT.md` | Always. This file. Rules of engagement. |
| `PROJECT_CONTEXT.md` | You need orientation and don't know which subsystem owns your task. |
| `PROJECT_MAP.json` | You need exact paths, counts, routes, endpoints or the machine-readable census. |
| `architecture/ARCHITECTURE.md` | The change crosses subsystems, or you need the data/auth/deploy topology. |
| `codebase/DIRECTORY_MAP.md` | You need to know what lives where. |
| `features/FEATURES.md` | You need to know which feature a bug or request belongs to. |
| `APIs/API_OVERVIEW.md` | You are adding, changing or debugging an endpoint or MCP tool. |
| `data/DATA_OVERVIEW.md` | You are touching persistence, collections or stored payloads. |
| `design-system/DESIGN_SYSTEM.md` | You are building UI and need the tokens, fonts and component classes. |
| `infrastructure/INFRASTRUCTURE.md` | You are deploying, configuring env vars or debugging a build. |
| `rules/DO_NOT_CHANGE.md` | **Before any edit.** Lists the protected areas and why. |
| `CONFLICTS.md` | Before trusting any existing documentation. |
| `tasks/ACTIVE_TASK.md` | To see what is in flight and what the next phase should pick up. |
| `tasks/TASK_CATEGORY_CATALOG.md` | **Starting a task.** Maps a request to its queries, file areas and gates. |
| `codebase/CODEBASE_INTELLIGENCE.md` | You need to know what an index field means or how confident it is. |
| `codebase/INTELLIGENCE_QUERIES.md` | You want a worked example before running a query. |
| `scripts/generate-map.mjs` | To regenerate the coarse `PROJECT_MAP.json`. |
| `scripts/generate-index.mjs` | To regenerate the 17 detailed intelligence artifacts. |
| `scripts/query-index.mjs` | To answer a structural question. |

### The codebase intelligence index (Phase 7)

**Query the index before searching source.** It is a TypeScript-AST parse of 485
files across 8 roots, and it answers structural questions faster and more
accurately than grep:

```bash
npm run agent:query -- help          # every available question
npm run agent:query -- component X   # who uses this component, what breaks
npm run agent:query -- impact <path> # blast radius before editing
npm run agent:query -- orphans       # dead code
npm run agent:query -- feature <slug>
npm run agent:query -- service X
npm run agent:query -- endpoint "GET /api/health"
npm run agent:query -- symbol X      # ALWAYS check occurrences, see below
npm run agent:query -- stats
```

Regenerating and validating:

```bash
npm run agent:index          # rewrite all 17 artifacts
npm run agent:index:check    # exit 1 if stale (read-only)
npm run agent:index:stats    # counts and timings, no write
npm run check:index          # freshness + do the indexes agree with each other
```

`check:index` is **not** the same as `agent:index:check`. Freshness proves the
indexes match the source; `check-index.mjs` proves they agree with *each other*.
Both are wired into `npm run check`.

**Rules for the index:**

1. **Never hand-edit anything in `codebase/*.json` or `generated/*.json`.** Fix
   `generate-index.mjs` and regenerate. A hand-edited artifact fails
   `agent:index:check` even when no source changed.
2. **Counts come from the index, not from prose.** Where this knowledge base and
   an index disagree, the index wins on facts. The prose may lag.
3. **`LOW_CONFIDENCE` and `UNKNOWN` mean unverified.** Confirm against source.
   `ROUTE_MAP.association` records *how* each route matched its component.
4. **Ambiguous names are real, not noise.** 378 of 2,943 symbols share a name
   across the four packages. Two genuinely different `useIsMobile` hooks exist.
   Never name a definition site without checking `npm run agent:query -- symbol`.
5. **An orphan proves no *static* importer.** The index cannot see string-built
   imports, runtime lookups or consumers outside the 8 roots. Confirm before
   deleting anything `orphans` reports.
6. **Embedded source strings are not modules.** `frontend/src/data/componentData.tsx`
   holds component source as strings and `embeddedSourceCode.ts.bak` is excluded.
   Imports visible in those files are text, not edges.

---

### Regenerating the coarse machine-readable map

`PROJECT_MAP.json` is **generated**, not hand-written. Its counts, routes,
endpoints, MCP tools and dependency usage are read out of the source at run time.

```bash
node .uihub-agent/scripts/generate-map.mjs          # rewrite PROJECT_MAP.json
node .uihub-agent/scripts/generate-map.mjs --check  # exit 1 if stale, for CI
```

Re-run it after any change that alters routes, endpoints, the component catalog,
the template catalog or a dependency. Its `PURPOSE` strings are curated; its
numbers are not.

It is the **coarse** overview and is superseded by the Phase 7 indexes on any
structural question. Two known divergences are documented in
`codebase/CODEBASE_INTELLIGENCE.md`: `codeVolume` omits the 14 first-party
scripts outside `src/`, and the services inventory is incomplete.

---

## 4. How to inspect code

1. **Read, then locate.** Use `glob` / `grep` to find files, then read the whole
   file before concluding anything about it. Grep hits are leads, not evidence.
2. **Confirm a dependency is real before using it.** A package in `package.json` is
   not proof of use. `PROJECT_MAP.json → stack.*.dependencies` and the
   `status: declared-unused` marker in the map answer this. Confirmed unused today:
   `@splinetool/react-spline`, `@splinetool/runtime`, `simplex-noise`,
   `unicornstudio-react`, `vite-plugin-mkcert`, `autoprefixer`.
3. **Do not trust filenames or comments.** `tailwind.config.ts` is likely inert.
   `metadata.json` names a different framework entirely. `embeddedSourceCode.ts.bak`
   is an orphan. `data/claudePrompts.ts` has no importer.
4. **Check for a mirror before assuming there is one logic.** The premium component
   id list exists in three files that must be kept in sync manually. The MCP
   catalogs are generated from the frontend by a script.
5. **Enumerate rather than sample** when documenting a set, and state the count.
   Counts come from the Phase 7 indexes, not from estimation.
6. **Mark what you could not verify as `UNKNOWN`.** Do not quietly drop it.
7. **Query the index before concluding a file is unused.**
   `npm run agent:query -- orphans` and `-- impact <path>` answer that in one
   command, and they see re-exports, dynamic imports and path aliases that grep
   misses.

---

## 5. Minimal-change principle

- Make the smallest change that fully solves the stated problem.
- Do not widen scope because something adjacent looks wrong. Record it in
  `CONFLICTS.md` and move on.
- Match the surrounding code's conventions, naming and comment density. Do not
  introduce a new library, pattern or abstraction to solve a local problem.

## 6. No unrelated refactoring

Unless the task is explicitly a refactor, do **not**:

- rewrite or restructure components, routes, services or directories
- rename files or symbols beyond what the change requires
- upgrade, add or remove dependencies
- redesign UI, change design tokens, or reformat
- reformat, re-indent or "tidy" files you are not otherwise changing
- fix unrelated bugs, dead code or warnings you happen to notice
- change the database shape, auth logic or payment logic

There is a real backlog of known issues in `CONFLICTS.md`. **It is not a work
queue.** Do not opportunistically close items from it.

## 7. Secret protection

- **Never** copy an API key, token, password, private key, service-account
  credential or `.env` value into any file in this tree, into a commit message,
  or into a chat response.
- Reference environment variables **by name only**.
- The generator enforces this: `SECRET_PATTERNS` in `scripts/generate-map.mjs`
  rewrites any credential-shaped value to `ENVIRONMENT_VARIABLE_REQUIRED`, and
  `SECRET_KEY_NAMES` blanks any value whose key name looks sensitive. Keep that
  filter intact and widen it if you find a new credential shape.
- Files that contain real secrets and must never be read into, quoted from, or
  committed: `backend/.env`, `backend/.env.local`, `backend/service-account.json`.
  They are gitignored. `frontend/.env.example`, `mcp-server/.env.example` and
  `render.yaml` contain names and public values only.
- One item to be aware of, not to fix here: `frontend/src/main.tsx` contains a
  hardcoded Firebase **web** config literal. Firebase web config is designed to be
  public and it is not a server secret — but it is credential-shaped data in
  source, and it is what actually ships. Tracked as `RISK-03`.

## 8. Testing expectation

Run the narrowest thing that proves the change. Do not run unrelated suites.

| Area | Command | Notes |
|---|---|---|
| Frontend types | `cd frontend && npm run lint` | This is `tsc --noEmit`. The only frontend check that exists. |
| Backend | `cd backend && npm test` | Runs `check:premium` then `node --test tests/`. |
| MCP server | `cd mcp-server && npm test` | Vitest. |
| MCP build gate | `cd mcp-server && npm run build` | Runs `tsc` **and** `check-source-coverage.mjs`, which fails the build if any premium component lost its source. |
| CLI | `npm run test:cli` | `node:test` via `tsx`. |
| Knowledge base | `node .uihub-agent/scripts/generate-map.mjs --check` | Fails if `PROJECT_MAP.json` is stale. |

**The frontend has no test suite and no test script.** Do not claim frontend
behaviour is covered. Do not add a test framework to fix that as a side effect of
an unrelated task.

Run a production build (`cd frontend && npm run build`) only when the change
touches bundling, code splitting, or the catalogs — it is slow, and these data
modules are large enough that build time is itself a signal.

## 9. Knowledge update expectation

**If you change the code, update this knowledge base in the same change.** Stale
knowledge is worse than none, because an agent will trust it.

| What you changed | What to update |
|---|---|
| Added/removed/changed a route | `frontend/src/App.tsx` → regenerate the map; update `codebase/DIRECTORY_MAP.md` route table if the shape changed |
| Added/removed an API endpoint or MCP tool | `APIs/API_OVERVIEW.md`; regenerate the map |
| Added/removed a component or template | `features/FEATURES.md` catalog counts; regenerate the map |
| Added a feature | `features/FEATURES.md` with a status and a confidence |
| Changed a token, font or UI primitive | `design-system/DESIGN_SYSTEM.md` |
| Changed build, deploy or env vars | `infrastructure/INFRASTRUCTURE.md` |
| Changed data access or added a collection | `data/DATA_OVERVIEW.md` |
| Touched a protected area | Re-read `rules/DO_NOT_CHANGE.md` first |
| Found a doc/code mismatch | `CONFLICTS.md` — add an entry, do not silently fix the doc |
| Changed the shape of this tree | `AGENT.md` §3 routing table |

Then run `node .uihub-agent/scripts/generate-map.mjs` and
`node .uihub-agent/scripts/generate-map.mjs --check`.

---

## 10. What is authoritative, and what to preserve

**Authoritative:** the code; `package.json` × 5; `vercel.json`; `render.yaml`;
`mcp-server/src/tools/index.ts`; `frontend/src/App.tsx`.

**Preserve — do not fold into this tree, do not delete, do not rewrite:**

- `.agents/skills/**` — three existing agent skills (`uihub-component-forge`,
  `ui-hub-component-integration`, `ui-hub-github-sync-and-push`). They are the
  authoritative workflow definitions for adding components and for git operations.
  They are also **gitignored** (local only), so they are not part of the shared
  repository. Read them; do not relocate them.
- `MCP.md` — the most accurate documentation in the repository.
- `docs/cli.md` — current.
- `agent.md` — the ten-phase plan. Leave its status field alone unless the user
  asks you to change it.
- `component-specs/**` — local design specs for the component-forge skill.
  Gitignored. Consumed only by the skill's own scripts.

---

## 11. Quick answers to the questions this phase was required to answer

| Question | Answer |
|---|---|
| What is UI HUB? | Component + template marketplace for AI-assisted ("vibe") coding. |
| Stack? | React 19 / TS 5.8 / Vite 6 / Tailwind 4 / Three.js / Firebase; Express 4 + MongoDB + Redis; hand-rolled MCP in TS. |
| Frontend? | `frontend/src` — 62 routes, all in `App.tsx`. |
| Backend? | `backend/src` — 6 routers, entry `server.js`. |
| Routes? | `frontend/src/App.tsx`. 62 `<Route>` elements. |
| Main components? | `frontend/src/components/{ui,animations,templates,admin}`. 137-entry catalog in `data/componentData.tsx`. |
| Template system? | `data/templatesData.ts` (19) + `components/templates/registry.ts` (id → preview, source, assets, background). |
| APIs? | `backend/src/routes` (38 endpoints) + `mcp-server/src/routes` (1 JSON-RPC + 2 HTTP APIs) + 14 MCP tools. |
| Authentication? | Firebase for users (`context/AuthContext.tsx`, `middleware/auth.js`); SHA-256 API keys for MCP. |
| Payment? | Razorpay. `backend/src/routes/paymentRoutes.js`, signature check in `utils/verifySignature.js`. |
| Database? | MongoDB via `backend/src/services/mongoService.js` and `mcp-server/src/services/mongo.ts`. |
| Storage? | Static assets in `frontend/public/`. No S3, no Cloudinary. |
| Deployment? | Vercel (frontend + `/api` serverless) and Render (one service: backend with MCP mounted in-process). |
| High-risk areas? | 8 protected items — see `rules/DO_NOT_CHANGE.md`. 10 flagged findings — see `CONFLICTS.md`. |
| Needs deeper analysis? | 7 open unknowns — see `PROJECT_MAP.json → unknowns` and `tasks/ACTIVE_TASK.md`. |

---

## 12. Non-goals for the current phase

Phase 1 is **discovery only**. There is deliberately no task-routing system, no
dependency graph, no component-level intelligence and no automated indexing
beyond the single map generator. Those are later-phase work. Do not build them now.
