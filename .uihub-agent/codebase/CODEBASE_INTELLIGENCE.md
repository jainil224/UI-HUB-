# Codebase Intelligence

Generated intelligence for the UI-HUB monorepo. Everything in `codebase/` and
`generated/` is derived from source by
`.uihub-agent/scripts/generate-index.mjs`; the prose in this file describes the
pipeline and is maintained by hand.

**Rule 1: a generated file is never hand-edited.** If one is wrong, fix the
generator and regenerate. `npm run agent:index:check` fails on any drift, and a
hand-edited index fails the check even when no source file changed.

**Rule 2: when this file and a generated index disagree, the index wins on
facts.** This document may be stale; the indexes are regenerated on every commit.

**Rule 3: PROJECT_MAP.json and these indexes are different tools.**
`PROJECT_MAP.json` is the coarse Phase 1-6 overview. These indexes are the
detailed AST-derived layer. See "Relationship to PROJECT_MAP" below.

---

## Quick start

```bash
npm run agent:index          # regenerate all 17 artifacts
npm run agent:index:check    # fail if any artifact is stale (read-only)
npm run agent:index:stats    # counts and timings, no write
npm run check:index          # freshness + cross-reference agreement
npm run agent:query -- help  # every available question
```

Two independent gates:

| Gate | Question it answers | Script |
| --- | --- | --- |
| `agent:index:check` | Do the indexes still match the source tree? | `generate-index.mjs --check` |
| `check:index` | Do the indexes agree with each other? | `check-index.mjs` |

They are separate because an index can be perfectly fresh and still contradict a
sibling. `check-index.mjs` compares 17 cross-references and reports MATCH,
CONFLICT, or MISSING; CONFLICT and MISSING exit 1. WARN is informational and
does not fail the gate.

### Read-only invocations

Two flags read the source tree and write nothing. Both are genuinely read-only,
verified by comparing artifact mtimes before and after:

| Flag | Writes | Notes |
| --- | --- | --- |
| `--check` | nothing | exits 1 on drift |
| `--stats` | nothing | prints counts, drift and fingerprint |

`--stats` originally took the write path, so a flag documented as "counts only"
rewrote every artifact. Any new flag must default to not writing unless it is
explicitly a write command.

---

## Scope

Source roots, and nothing else:

```
frontend/src   backend/src   mcp-server/src   cli/src
api   scripts   backend/scripts   frontend/scripts
```

485 files, 8.5 MB. Generated output, dependencies, and build artifacts are
excluded and listed with reasons in `generated/INTELLIGENCE_MANIFEST.json`
under `exclusions`. The two exclusions that matter when reading the graph:

- `**/dist/**` — build output. `backend/src/server.js` imports
  `mcp-server/dist/routes/{mcp,dashboard,admin}.js`, which is why 3 import edges
  are unresolved. That is a build-order fact about the repo, not an index bug.
- `frontend/src/data/embeddedSourceCode.ts.bak` — a 860 KB `.bak` file holding
  embedded component source. Excluded by extension.

Embedded component source inside `frontend/src/data/componentData.tsx` is
**string data, not code**. The parser reads the AST, so imports that appear
inside those string literals are correctly not treated as module edges.

---

## Artifacts

### `codebase/` — human-oriented maps

| File | Contents |
| --- | --- |
| `FILE_ROLE_MAP.json` | every indexed file with role, how the role was decided, confidence, inbound/outbound counts |
| `COMPONENT_MAP.json` | 227 React components, page usage, lazy status, orphan status (157 HIGH, 70 MEDIUM) |
| `PAGE_MAP.json` | 74 pages with route path, direct component deps, hooks |
| `ROUTE_MAP.json` | 63 router declarations and **how** each was matched to a file |
| `FEATURE_MAP.json` | 56 features with file counts, roles, entry points, external packages |
| `HOOKS_MAP.json` | custom hooks and their consumers |
| `SERVICE_MAP.json` | 30 backend/frontend services with data reach and consumers |
| `API_MAP.json` | 69 served HTTP routes, 14 MCP tool registrations, 5 outbound client calls |
| `DATABASE_USAGE_MAP.json` | Mongo collections, mongoose models, Prisma, raw SQL |
| `STORAGE_USAGE_MAP.json` | localStorage / sessionStorage / Redis keys in use |
| `INTEGRATION_MAP.json` | external services from packages actually imported and env vars actually read |

### `generated/` — machine lookup structures

| File | Contents |
| --- | --- |
| `IMPORT_GRAPH.json` | 485 nodes; 1,098 internal, 850 external, 272 dynamic, 39 re-export, 11 asset, 3 unresolved |
| `REVERSE_DEPENDENCY_MAP.json` | target → importers, for blast-radius questions |
| `SYMBOL_INDEX.json` | 2,943 symbols by name (2,347 distinct, 378 ambiguous) |
| `FEATURE_FILE_INDEX.json` | feature → file list, inverse lookup form |
| `PAGE_COMPONENT_INDEX.json` | per page, the transitive component tree (depth ≤ 6) |
| `INTELLIGENCE_MANIFEST.json` | fingerprints, source snapshot, exclusions, timings |

Every artifact carries `schemaVersion`, `generatedBy`, `sourceRoots`, and a
`description` saying how it was derived.

---

## How facts are established

### Roles: path convention first, AST override second

A path rule proposes a role (`components/` → COMPONENT). The AST then gets the
last word:

- **a pure re-export is a barrel**, whatever its directory. `CloudScroll/constants/index.ts`
  declares nothing and only forwards `./footer`, `./projects`, `./work`, so it is
  `BARREL`, not a component. It only becomes `PAGE_SHELL` inside `pages/`, where
  a router can point `element` at it.
- **`index.*` is a filename, not a role.** By name it guesses BARREL, then
  contents decide: a barrel stays a barrel, a JSX component becomes
  `PAGE`/`COMPONENT`, and anything else (`cli/src/commands/index.ts`) becomes
  `ENTRY`.
- **JSX plus a capitalized export** is required to call something a component.
  JSX alone appears in files that render nothing they own.

Current distribution: 199 COMPONENT, 74 PAGE, 35 SCRIPT, 30 SERVICE, 26 DATA,
23 UTILITY, 23 UNKNOWN, 16 MCP_TOOL, 9 ROUTE_CONFIG, 8 CONFIG, 8 MIDDLEWARE,
7 STATE, 7 TYPE, 5 BARREL, 5 MODEL, 4 ENTRY, 2 CONTROLLER, 2 HOOK, 1 TEMPLATE,
1 TEST.

### Endpoints: three signals must agree

A served route requires **all** of:

1. the receiver looks like a router (ends in `Router`, or is `app`/`server`/`router`),
2. the method is an HTTP verb,
3. the first argument is a **string literal starting with `/`** — Express's own
   convention for a route path.

Rule 3 is what separates a served route from everything else that looks like
one. An earlier version matched any identifier receiver and accepted any string
first argument, which produced 6 phantom endpoints:

| Phantom | Reality |
| --- | --- |
| `GET id`, `GET q` | `searchParams.get('id')` in `LibraryPage.tsx` |
| `GET ids`, `GET tool` | `params.get('tool')` in `AnalyticsPage.tsx` |
| `GET user-agent` | `req.get('user-agent')` in `userRoutes.js` |
| `POST https://api.brevo.com/v3/smtp/email` | `axios.post()` in `brevoService.js` |

`Promise.all([...])` also matched, because `all` is an Express verb.

The outbound Brevo call is **not discarded** — it is in
`API_MAP.json → outboundClientCalls` (5 entries). A route whose path is computed
at runtime lands in `dynamicRoutePaths` (currently 0) so it is never silently
dropped. Current count: **69 served endpoints** (GET 34, POST 26, DELETE 5,
PATCH 3, PUT 1) plus **14 MCP tool registrations**.

### Resolution

- relative and index paths
- NodeNext `.js` → `.ts`, required because the CLI and MCP server are ESM
- Vite and tsconfig aliases, read from `frontend/vite.config.ts` and
  `frontend/tsconfig.json`, matched on path boundaries so `@/utils` does not
  swallow `@/utilsx`
- scoped npm packages distinguished from `@/`-style aliases
- dynamic `import()` recorded as dynamic edges
- asset and query imports (`?raw`, `.css`, `.svg`) recorded as asset edges
- **anything unresolved is recorded, never dropped**

### Determinism

All content is JSON-serialized with sorted keys, so two runs on unchanged source
produce byte-identical files. The manifest carries `generatedAt` and `timingsMs`,
which are stripped before comparison; `--check` therefore exits 0 immediately
after a successful write.

The manifest deliberately records **no fingerprint of the generated outputs**. A
manifest storing a hash of the previous outputs embeds run N-1's state, so the
value necessarily differs every run and `--check` could never pass. Byte
comparison is the freshness authority.

---

## Confidence

Every role and fact carries one of `HIGH`, `MEDIUM`, `LOW_CONFIDENCE`,
`UNKNOWN`, with the evidence recorded:

- `HIGH` — proven by AST syntax or a router declaration
- `MEDIUM` — path convention that the AST did not contradict
- `LOW_CONFIDENCE` — name-based guess with no AST support
- `UNKNOWN` — no rule matched

`ROUTE_MAP.json` records *how* each route matched: `lazy-import` and
`router-element` are HIGH, `directory-name` is MEDIUM. 60 of 63 routes are HIGH.

Check the current distribution any time:

```bash
npm run agent:query -- confidence
```

---

## Known findings

These are facts about the repository, not index defects. They are reported as
WARN by `check-index.mjs` and do not fail any gate.

1. **5 orphaned components** with no inbound import edge. The largest is
   `frontend/src/components/templates/TemplatePreview.tsx` at 868 lines — a
   superseded preview replaced by
   `frontend/src/components/ui/LazyTemplatePreview.tsx`. The others are
   `ui/button.tsx` (57), `CloudScroll/.../work/Timeline.tsx` (152),
   `ui/SectionHeader.tsx` (14), `ui/ViewSourceButton.tsx` (30).
2. **14 pages with no route.** Page-directory sections and shared partials that
   no router mounts directly.
3. **3 unresolved import edges**, all `backend/src/server.js` → excluded
   `mcp-server/dist/**`.
4. **Two different `useIsMobile` hooks**:
   `frontend/src/hooks/use-mobile.ts` (2 consumers) and
   `frontend/src/components/ui/CloudScroll/hooks/useIsMobile.ts` (13 consumers).
   The index keeps both and never merges by name. This is also why
   `SYMBOL_INDEX.json` reports 378 ambiguous names out of 2,943 symbols — a
   correct reflection of a monorepo, not noise to be cleaned away.

---

## Relationship to PROJECT_MAP

`PROJECT_MAP.json` is the coarse Phase 1-6 overview: directory listings and
headline file counts. These indexes are the detailed AST-derived layer, and they
are the authority for anything structural. Three known divergences, all recorded
here rather than by editing the coarse generator:

**`codeVolume` counts different things, so 481 and 501 are not comparable.**

> **Corrected during the Phase 8 final closure.** This section previously read
> "481 and 485", and the pipeline total was **485**. That number was **wrong**:
> the walker never descended into `backend/tests/`, `mcp-server/tests/` or
> `cli/tests/`, so **16 of the repository's 18 real test files were missing from
> the index entirely**. The index claimed to describe the codebase while being
> blind to every backend, MCP and CLI test.
>
> | | count | what it counts |
> | --- | --- | --- |
> | old pipeline total (Phase 7, incomplete) | 485 | omitted all 16 non-`frontend` test files |
> | **corrected pipeline total** | **501** | **485 + the 16 test files that were never walked** |
>
> The fix was discovery, not classification: `walk.mjs` now exports a
> `TEST_ROOTS` list (`backend/tests`, `mcp-server/tests`, `cli/tests`) walked
> alongside `SOURCE_ROOTS`. The test-runner globs in this repository are the
> evidence for those three paths. **No test file was moved**, and no application
> source changed.
>
> The only two test files that had been indexed were
> `frontend/src/utils/apiConfig.test.ts` and `frontend/src/routing/vercelRouting.test.ts`,
> and they were reachable purely by sitting inside `frontend/src`.
>
> Consequence: `FILE_ROLE_MAP` TEST count went **2 → 18**, and `TEST_DEPENDENCY`
> — a trigger the Phase 8 contract promises — went from effectively dead to
> firing against real edges. See `CONFLICTS.md` A24 and
> `codebase/PHASE_8_CLOSURE_TEST_INDEX.md`.

| | count | what it counts |
| --- | --- | --- |
| PROJECT_MAP `codeVolume` | 481 | every git-tracked file under the four `src/` roots |
| this pipeline | **501** | parseable code under those roots, **plus** 20 first-party scripts and 16 test files elsewhere |

The arithmetic, verified per root:

| root | tracked | indexed | why the difference |
| --- | --- | --- | --- |
| `frontend/src` | 353 | 345 | 8 non-code: 7 `.css`, 1 `.svg` |
| `backend/src` | 59 | 58 | 1 `.json` data file |
| `mcp-server/src` | 46 | 39 | 7 `.json` data files |
| `cli/src` | 23 | 23 | — |
| **total under `src/`** | **481** | **465** | 16 non-code files, all by extension |
| outside `src/` | not counted | 20 | `api/index.js`, 13 `backend/scripts/`, 5 `scripts/announcement/`, `frontend/scripts/` |
| **test directories** | not counted | **16** | `backend/tests` 6, `mcp-server/tests` 6, `cli/tests` 4 — added by the Phase 8 closure |

So: **481 tracked under `src/` − 16 non-code = 465 indexed under `src/`, + 20
scripts outside + 16 test files = 501.** Neither number is wrong. Quote which one
you mean; an AST index cannot describe a stylesheet.

`walk.mjs` also discovers 15 `ROLE_ONLY_EXT` files that are counted but never
parsed or indexed.

**Service inventory.** PROJECT_MAP lists `backend/src/services` with 18 files and
names 12 of them in `keyFiles` — `healthService.js` is among those 12. The
pipeline resolves the same **18** services there, then finds 12 more in other
roots (`frontend/src/services` 5, `mcp-server/src/services` 7), giving **30** overall. The coarse
map's per-directory `fileCount` is correct; only its `keyFiles` list is a sample.

**Depth.** `codeVolume` counts a directory; the index resolves symbol-level
edges. `accessService.js` has one static consumer according to
`REVERSE_DEPENDENCY_MAP.json`, which no directory listing can express.

Where the two disagree on a structural fact, the index wins.

---

## Rules for agents

1. **Query before grep.** `npm run agent:query --` answers structural questions
   faster and more accurately than searching file text.
2. **Read the index, not the source, for counts.** If a number matters, it comes
   from an index.
3. **Never hand-edit a generated file.** Run `npm run agent:index`.
4. **Run `npm run check:index` after any change that touches the index
   generators.** Freshness alone will not catch two indexes disagreeing.
5. **Treat LOW_CONFIDENCE and UNKNOWN as "unverified".** Confirm against source
   before relying on it.
6. **Do not report an ambiguous symbol as a single fact.** Check
   `SYMBOL_INDEX.json` occurrences before naming a definition site.