# Phase 7 Simulations and Measurements

Read-only evidence for `agent.md` tasks 7.38, 7.39, 7.40 and 7.41. Nothing here
changed application source. Every number was produced by running the shipped
scripts against the committed tree.

Reproduce with:

```bash
npm run agent:query -- stats
npm run agent:index:stats
npm run check:index
```

---

## 1. Task 7.40 — Index performance

Measured from `INTELLIGENCE_MANIFEST.json`, written on every run.

| Metric | Value |
| --- | --- |
| Source roots | 8 |
| Source files indexed | 485 |
| Parseable source size | 8.48 MB |
| Role-only files discovered, not parsed | 15 |
| Excluded entries / files | 1 / 1 |
| Artifacts written | 17 (16 listed + the manifest) |
| Total artifact size | 2,772,869 B = 2.64 MiB |
| **Generate wall time** | **~1.8–4.2 s** |
| **Check wall time** | **~2.0 s** |
| Query response | 130–200 ms |

Stage timings vary run to run; two observed runs (ms):

| Stage | cold | warm |
| --- | --- | --- |
| discover | 74 | 125 |
| parse | 855 | 1146 |
| resolve | 31 | 49 |
| build | 884 | 1248 |
| **total** | **1845** | **2568** |

Output size, largest first:

| KB | Artifact |
| --- | --- |
| 1127.2 | `generated/SYMBOL_INDEX.json` |
| 558.4 | `generated/IMPORT_GRAPH.json` |
| 244.9 | `codebase/FILE_ROLE_MAP.json` |
| 239.2 | `generated/PAGE_COMPONENT_INDEX.json` |
| 219.6 | `generated/REVERSE_DEPENDENCY_MAP.json` |
| 144.0 | `codebase/COMPONENT_MAP.json` |
| 39.8 | `codebase/FEATURE_MAP.json` |
| 28.4 | `codebase/PAGE_MAP.json` |
| 27.3 | `generated/FEATURE_FILE_INDEX.json` |
| 23.9 | `codebase/SERVICE_MAP.json` |
| 20.1 | `codebase/ROUTE_MAP.json` |
| 18.6 | `codebase/API_MAP.json` |
| 9.9 | `codebase/INTEGRATION_MAP.json` |
| 3.6 | `codebase/DATABASE_USAGE_MAP.json` |
| 2.2 | `codebase/HOOKS_MAP.json` |
| 0.8 | `codebase/STORAGE_USAGE_MAP.json` |

**Assessment: no optimization needed.** Parse and build dominate at roughly
equal cost, resolve is negligible (31–49 ms), and no stage is pathological. The
first run after a cold `node_modules` is slower (~4.2 s) because the TypeScript
compiler API must be loaded; steady state is ~1.8 s. `SYMBOL_INDEX.json` at
1.1 MB is the only artifact worth watching if the repository grows substantially,
and it is not a problem at 485 files.

---

## 2. Task 7.41 — No production dependency

The pipeline is `generate-index.mjs` plus six modules in `scripts/lib/`. Its
complete import set:

```
node:fs        node:path       node:url        node:perf_hooks
node:crypto    node:module     ./lib/*.mjs     ./secret-scan.mjs
```

`secret-scan.mjs` itself imports only `node:fs`, `node:path` and `node:url`.

| Dependency | Required to index? |
| --- | --- |
| MongoDB | no |
| Firebase | no |
| Razorpay | no |
| Render | no |
| Vercel | no |
| Cloudflare | no |
| Any network access | no |
| Any `.env` read | no — `.env*` is in the **exclusion** list |

A static scan of the nine pipeline files found no `fetch(`, `net.connect`,
`createServer`, `WebSocket` or `dgram`. `check-index.mjs` and
`query-index.mjs` are equally read-only.

The strings `firebase-admin`, `razorpay`, `axios` and `https://` **do** appear in
`generate-index.mjs`. All four are detection vocabulary, not connections:

- `CLIENT_RECEIVER = /^(?:axios|fetch|http|https|superagent|request|got)$/` —
  regex used to recognise an outbound HTTP client so its calls are not mistaken
  for served endpoints.
- `'firebase-admin': 'firebase'` and `'razorpay': 'razorpay'` — package-name
  normalisation tables for `INTEGRATION_MAP.json`.
- `process\.env\.([A-Z0-9_]+)` — a regex that records *which variable names* a
  file references. It extracts identifiers from source text and never reads an
  environment value or a `.env` file.

`.env`, `.env.local`, `.env.development`, `.env.production` and their `.local`
variants are explicitly excluded by `walk.mjs` before any read, alongside
`service-account.json` and `firebase-adminsdk.json`.

**Verified behaviour:** with production unreachable and no credentials
configured, `npm run agent:index` and `npm run check:index` both complete and
pass. The intelligence layer stays available when production is down, which is
the requirement.

---

## 3. Task 7.38 — Real task simulations

Five tasks from the specification, answered from the index alone. Ground truth
was computed **independently** by scanning source text with comments and string
literals stripped, so it does not share a code path with the index.

### Task A — "Find where the template preview is rendered"

`npm run agent:query -- impact frontend/src/components/templates/TemplatePreview.tsx`

```
level  LOW
role   COMPONENT   feature components
- no importers — nothing in the index depends on it
```

The index answers **zero renderers**. A naive grep for `TemplatePreview` returns
9 files, but **8 of the 9 are false positives** (the ninth is the component's own
file): substring matches on the comment in `VisionaryOrbHero.tsx`, on
`LazyTemplatePreview` (a different component), on `TemplatePreviewStage` (a
different component), and on type names such as `TemplatePreviewSource`.

Ground truth after stripping comments and strings: **0 real users**. The index
and the independent check agree. This is the 868-line orphan in `CONFLICTS.md`
A19, and it confirms grep would have sent an agent to eight wrong files.

### Task B — "Find all files affected by changing the component card"

Same seed, 3-hop reverse traversal: **1 file**, correctly. Impact level `LOW`.

### Task C — "Find the API and frontend callers for templates"

`npm run agent:query -- endpoint GET /api/templates` and `-- feature templates-page`

The index identifies 3 files: `mcp-server/src/tools/getTemplate.ts`,
`getTemplateSource.ts`, `searchTemplates.ts`. Ground truth found 4; the one
missed is `mcp-server/src/services/componentService.ts`, which mentions templates
without defining or importing a template-named symbol.

Precision **100%**, recall **75%**.

Note: the index reports no endpoint at `GET /api/templates` because none exists.
The MCP tool surface is the real template API in this repository, and saying so
plainly is more useful than a near-match.

### Task D — "Find all files involved in authentication"

This is the task that exposed a genuine weakness, and the fix is how an agent
should use the tool.

Naive approach — `npm run agent:query -- feature auth` — returns 3 files, the
three pages in `frontend/src/pages/Auth/`. Recall **9%**. That is a bad answer,
but it is not a wrong one: the feature slug `auth` genuinely contains 3 files.

Correct approach — seed on the auth surface, then traverse the graph:

```bash
npm run agent:query -- impact frontend/src/context/AuthContext.tsx
```

```
level  HIGH
role   STATE   feature auth-context
- 13 importers across 7 feature(s)
importers (13): App.tsx, Navbar.tsx, PushNotificationPrompt.tsx,
  AdminGuard.tsx, AdminLayout.tsx, LoginPage.tsx, SignupPage.tsx,
  CollectionsPage.tsx, FavoritesPage.tsx, MCPPage.tsx, LibraryPage.tsx,
  ComponentDetail/index.tsx, PricingPage.tsx
```

4-hop traversal from the five auth seeds gives 16 files. Ground truth is 22.
Precision **88%**, recall **64%**. The 2 irrelevant results are `ForgotPassword.tsx`
(a legitimate auth file that no longer calls `useAuth`) and `main.tsx` (the React
root, reached through `App.tsx`).

The 8 missed files are services and utils that call `getIdToken()` without
importing an auth component: `admin.ts`, `collections.ts`, `favorites.ts`,
`mcp.ts`, `activityLogger.ts`, `checkout.ts`, `pushService.ts`, `syncUser.ts`.

**The lesson, and it is worth recording:** a single `feature` slug is the wrong
unit for a cross-cutting concern. Authentication in this repository is a
provider plus 13 consumers plus 8 services that read the token. The index gives
the edges in one query; the agent has to choose the seed. Graph traversal beats
feature lookup for horizontal concerns, and `feature` beats traversal for
localised ones.

### Task E — "Find the files involved in the MCP tools list"

`npm run agent:query -- integration` / `-- routes` / `API_MAP.mcpTools`

14 files, one per registered tool, plus `mcp-server/src/tools/index.ts` as the
registry. Ground truth 15; the miss is `tools/helpers.ts`, which defines the
`createTool` wrapper every tool file uses. Precision **100%**, recall **93%**.

### Aggregate

| task | index files | ground truth | relevant | irrelevant | precision | recall |
| --- | --- | --- | --- | --- | --- | --- |
| A | 1 | 0 | 0 | 1 | n/a | n/a |
| B | 1 | 0 | 0 | 1 | n/a | n/a |
| C | 3 | 4 | 3 | 0 | 100% | 75% |
| D (feature) | 3 | 22 | 2 | 1 | 67% | 9% |
| D (traversal) | 16 | 22 | 14 | 2 | 88% | 64% |
| E | 14 | 15 | 14 | 0 | 100% | 93% |

Reading these honestly:

- **Precision is high everywhere, and that is the property that matters.** An
  agent following an index result reads a file that is genuinely relevant. It
  never reads 58 files to find one.
- **Recall varies with how the question is framed**, from 9% using a feature slug
  for a horizontal concern to 93% using the tool registry directly. The index
  does not hide that; the numbers are here.
- **Tasks A and B have no answer because the component is genuinely dead**, not
  because the index failed. Reported as `LOW` with the reason.

---

## 4. Task 7.39 — False-positive testing

Ambiguous names tested two ways: naive name matching versus structured
disambiguation by path, role, feature, importers and route.

| name | naive `\bName\b` file matches | files whose stem is exactly `Name` | roles the index assigns |
| --- | --- | --- | --- |
| Button | 58 | 1 | COMPONENT |
| Card | 33 | 0 | — |
| Config | 19 | 2 | CONFIG ×2 |
| Admin | 21 | 2 | SERVICE, ROUTE_CONFIG |
| Template | 10 | 1 | UNKNOWN |
| Index | 7 | 14 | BARREL ×5, ENTRY ×2, COMPONENT ×4, PAGE, MCP_TOOL, TYPE |
| User | 25 | 0 | — |

Naive counts are file counts over the 485 indexed files: a file matches if the
word-boundary pattern hits it anywhere, including comments and string literals.
The middle column is the same search restricted to the filename stem.

Three results worth calling out.

**`Index` is the hardest case and the index handles it.** 14 files are named
`index.*`. A name search cannot tell them apart. The index separates them by what
they actually do:

| role | feature | importers | path |
| --- | --- | --- | --- |
| BARREL | api | 0 | `api/index.js` |
| ENTRY | cli | 15 | `cli/src/commands/index.ts` |
| ENTRY | mcp | 0 | `mcp-server/src/index.ts` |
| MCP_TOOL | mcp | 4 | `mcp-server/src/tools/index.ts` |
| TYPE | mcp | 11 | `mcp-server/src/types/index.ts` |
| PAGE | library-page | 1 | `.../LibraryPage/sections/ComponentDetail/index.tsx` |
| COMPONENT | components | 1–4 | 4 CloudScroll `index.tsx` files |
| BARREL | components | 1–13 | CloudScroll `stores/`, `types/`, `work/`, `constants/` |

The four CloudScroll `index.tsx` files are classified `COMPONENT` because they
contain JSX and no re-exports. Whether each of those is a real barrel or a real
component is exactly the judgement `npm run agent:query -- role BARREL` surfaces
rather than hides.

**`Admin` resolves to two different things in two layers** — `SERVICE`
`frontend/src/services/admin.ts` and `ROUTE_CONFIG` `mcp-server/src/routes/admin.ts`.
A name search returns 21 files, most of them the 19 pages under
`frontend/src/pages/Admin/`, which the word matches but the index never
conflates with either service.

**`Template`, `Card` and `User` do not exist as files.** The index reports
nothing for them. A `symbol Card` lookup returns 8 near-misses
(`CardCascade`, `CardCascadePreview`, `CardCascadeScrollDemo`, `CardContent`,
`CardItem`, `CardLayout`, `CardsBeam`, and others) and none is named `Card`.
Reporting zero rather than eight near-misses is the correct behaviour.

---

## 5. A note on the specification's example component

`agent.md` section 50 uses `TemplateCard` throughout its success criteria. **No
such component exists in this repository.** A full-tree search finds the string
exactly once in source:

```
frontend/src/components/templates/TemplateSimilarRail.tsx:221
  const CurrentTemplateCard: React.FC<{ template: TemplateItem }> = ({ template }) => {
```

It is a **local, non-exported** component inside a shared file — one of three
card components that file defines (`RelatedCard` line 158, `RelatedThumbnail`
line 50, `CurrentTemplateCard` line 221).

This is worth recording because it exercises a real limit of the design:

- `COMPONENT_MAP.json` has one row **per file**, so a local component inside a
  shared file has no row. `npm run agent:query -- component CurrentTemplateCard`
  reports nothing.
- `SYMBOL_INDEX.json` records every declaration with its line and export status,
  so `npm run agent:query -- symbol CurrentTemplateCard` answers fully:

```
SYMBOL CurrentTemplateCard
  frontend/src/components/templates/TemplateSimilarRail.tsx:221
      role=COMPONENT  importers=1
        ← frontend/src/pages/TemplatesPage/TemplateDetailPage.tsx
```

All the success criteria are answerable — where it is, who uses it, which page
renders it, which feature owns it, what changes if it changes. The index must be
queried with `symbol` for a component that shares a file, and with `component`
for one that owns a file. `CODEBASE_INTELLIGENCE.md` documents this split.