# Intelligence Queries

Every structural question about this repo should be answerable without grepping.
All examples below are real output from the current index.

```bash
npm run agent:query -- <command> [args]
```

The CLI is read-only. It never writes, never regenerates, and never touches
source. If an answer looks wrong, run `npm run agent:index:check` before
trusting it — a stale index will confidently answer a stale question.

---

## Command surface

| Command | Answers |
| --- | --- |
| `symbol <name>` | where a symbol lives, and who imports that file |
| `component <name\|path>` | component, its imports, pages using it, impact |
| `hook <name>` | hook and its consumers |
| `service <name>` | service, its data reach, its consumers, impact |
| `feature <slug>` | everything inside one feature |
| `list-features` | every feature with file and line counts |
| `list-symbols [filter]` | symbol names, optionally filtered |
| `endpoint <METHOD /path>` | endpoint handlers and their impact |
| `database [path]` | files touching Mongo / Prisma / SQL |
| `storage [path]` | localStorage / Redis / Firebase Storage usage |
| `integration [name]` | external services, or all of them |
| `routes` | every declared route and its component |
| `route-pages` | component tree reachable from each page |
| `importers <path>` | who imports this file |
| `impact <path>` | qualitative blast radius + evidence |
| `orphans` | components and files with no inbound edge |
| `role <ROLE>` | files with a given role |
| `confidence` | confidence distribution + unresolved edges |
| `stats` | manifest, fingerprints, timings |

---

## The eight questions that come up most

### 1. Is this component dead code?

```bash
npm run agent:query -- component TemplatePreview
```

```
COMPONENT TemplatePreview
  path      frontend/src/components/templates/TemplatePreview.tsx
  feature   components   868 lines   lazy=false
  confidence HIGH
  impact    LOW
            - no importers — nothing in the index depends on it
  exported  TemplatePreview
  imports   1 internal
            → frontend/src/data/templatesData.ts
  used by pages   0
  ORPHANED  no file imports this component.
```

868 lines with zero importers, and the live preview is
`frontend/src/components/ui/LazyTemplatePreview.tsx`. Confirmed dead.

### 2. What breaks if I change this endpoint?

```bash
npm run agent:query -- endpoint GET /api/health
```

```
ENDPOINT GET /api/health
  feature backend-root
  handler backend/src/server.js
  impact  MEDIUM
          - 1 importer (api/index.js)
```

Note the routing decision: `app.get(...)` declared directly in
`backend/src/server.js` counts as a real endpoint even though the file's role is
ENTRY, because the entrypoint is where the router is mounted.

### 3. What can I safely refactor inside a service?

```bash
npm run agent:query -- service accessService
```

```
SERVICE accessService
  path      backend/src/services/accessService.js   (backend)
  feature   access-service   194 lines
  database  false   storage false
  externals (none)
  used by   1
           ← backend/src/routes/componentRoutes.js
  impact    MEDIUM
           - 1 importer (backend/src/routes/componentRoutes.js)
```

Single consumer, no database or storage reach, no external packages. A contained
refactor.

### 4. What is in this feature?

```bash
npm run agent:query -- feature home-page
```

```
FEATURE home-page
  files       8  (1675 lines)
  roles       PAGE=8
  entryPoints 8
               frontend/src/pages/HomePage/HomePage.tsx
               frontend/src/pages/HomePage/sections/BuildWithUIHubSection.tsx
               frontend/src/pages/HomePage/sections/CategoryShowcase.tsx
               frontend/src/pages/HomePage/sections/ComponentGrid.tsx
               frontend/src/pages/HomePage/sections/FAQ.tsx
               frontend/src/pages/HomePage/sections/Hero.tsx
               frontend/src/pages/HomePage/sections/Stats.tsx
               frontend/src/pages/HomePage/sections/TemplatesSection.tsx
```

### 5. Where does this repo read and write data?

```bash
npm run agent:query -- database
```

```
DATABASE USAGE — 16 files, 4 collections, 0 models
  backend/scripts/grantProUser.js
     collections: users
  backend/scripts/recoverPayment.js
     collections: payments, users
  ...
```

0 mongoose models: the backend talks to Mongo through the native driver and
collection literals, not through `mongoose.Schema`. The index reports what the
source actually contains rather than assuming an ORM.

### 6. What is the blast radius of touching this file?

```bash
npm run agent:query -- impact frontend/src/components/templates/TemplatePreview.tsx
```

```
IMPACT frontend/src/components/templates/TemplatePreview.tsx
  level  LOW
  role   COMPONENT   feature components
  - no importers — nothing in the index depends on it
```

`impact` gives a qualitative level plus the evidence that produced it, so the
level can be argued with rather than trusted blindly.

### 7. What is unused?

```bash
npm run agent:query -- orphans
```

```
ORPHANED COMPONENTS (5 of 227) — no importer in the index
      868 lines  frontend/src/components/templates/TemplatePreview.tsx
      152 lines  frontend/src/components/ui/CloudScroll/components/experience/work/Timeline.tsx
       57 lines  frontend/src/components/ui/button.tsx
       30 lines  frontend/src/components/ui/ViewSourceButton.tsx
       14 lines  frontend/src/components/ui/SectionHeader.tsx

ISOLATED FILES (14) — no edges in either direction
  SCRIPT       backend/scripts/check_prompts.js
  ...
```

Two different questions, deliberately separated: an **orphan** has outgoing
edges but no importer (something else in it is reachable), an **isolated** file
has no edges at all (often a standalone script).

### 8. What is the whole surface, and how much do I trust it?

```bash
npm run agent:query -- stats
npm run agent:query -- confidence
```

---

## Ambiguity is preserved, not resolved by guessing

```bash
npm run agent:query -- hook useIsMobile
```

Two real hooks share this name:

| Path | Consumers |
| --- | --- |
| `frontend/src/hooks/use-mobile.ts` | 2 |
| `frontend/src/components/ui/CloudScroll/hooks/useIsMobile.ts` | 13 |

The index never merges them by name. Before you name a definition site, check
`npm run agent:query -- symbol <name>` — it lists every occurrence.
`SYMBOL_INDEX.json` reports 378 ambiguous names out of 2,943 symbols, which is
accurate for a monorepo containing `backend/`, `frontend/`, `mcp-server/` and
`cli/`.

---

## Reading impact levels

| Level | Meaning |
| --- | --- |
| `HIGH` | many importers, or a widely used service/hook/store |
| `MEDIUM` | a small number of known importers |
| `LOW` | no importers, or a single consumer |

Levels are derived from the graph. Treat them as a starting point for
investigation, not as a guarantee — an index cannot know about runtime
`React.lazy` boundaries, string-built imports, or consumers outside these six
roots.

---

## When the answer looks wrong

1. `npm run agent:index:check` — if it fails, the index is stale and every answer
   is unreliable. Run `npm run agent:index`.
2. `npm run check:index` — catches indexes that disagree with each other, which
   freshness alone will not.
3. If both pass, the source is probably doing something the AST cannot see —
   `frontend/src/data/embeddedSourceCode.ts.bak` and the embedded source strings
   in `componentData.tsx` are the usual suspects. Confirm against the file.