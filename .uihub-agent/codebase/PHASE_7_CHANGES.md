# Phase 7 Changes

Phase 7 — Codebase Intelligence, Component Mapping & Dependency Graph.
Spec counterpart: `../agent.md`. Contract: `../codebase/CODEBASE_INTELLIGENCE.md`.
Evidence: `../codebase/PHASE_7_SIMULATIONS.md`. Task-by-task:
`../codebase/PHASE_7_CHECKLIST.md`.

**No application source was edited. No production data, dashboard setting,
credential or Render/Vercel/Cloudflare configuration was touched. `agent.md` was
not modified.**

---

## 1. What actually shipped

A static analysis pipeline that turns the repository into 17 machine-readable
indexes, plus a read-only query tool and a cross-reference validator.

```
scripts/lib/       walk.mjs      discover files, apply exclusions, decide parseability
                   parse.mjs     TypeScript AST -> exports, imports, JSX use, symbols
                   resolve.mjs   relative / alias / NodeNext / asset / dynamic edges
                   classify.mjs  20 path+AST roles, confidence, component naming
                   confidence.mjs HIGH / MEDIUM / LOW scoring rules
                   fingerprint.mjs per-file sha256 + tree fingerprint

scripts/generate-index.mjs    writes the 17 artifacts; --check, --stats
scripts/query-index.mjs      19 read-only query commands, plus `help`
scripts/check-index.mjs      21 cross-reference rules over 19 labels
```

Nothing outside `.uihub-agent/` is written by any of these. `query-index.mjs`
and `check-index.mjs` never write at all.

### Files created (28)

| Path | Purpose |
| --- | --- |
| `codebase/API_MAP.json` | 69 served endpoints, 14 MCP tools, 5 outbound calls |
| `codebase/COMPONENT_MAP.json` | 227 components, usage, lazy and orphan status |
| `codebase/DATABASE_USAGE_MAP.json` | 16 files touching Mongo, 4 collections |
| `codebase/FEATURE_MAP.json` | 56 features with roles and entry points |
| `codebase/FILE_ROLE_MAP.json` | 485 files, 20 roles, confidence per file |
| `codebase/HOOKS_MAP.json` | 2 hooks and their consumers |
| `codebase/INTEGRATION_MAP.json` | 6 integrations, 55 env var references |
| `codebase/PAGE_MAP.json` | 74 pages, route, hooks, component deps |
| `codebase/ROUTE_MAP.json` | 63 route declarations and how each was matched |
| `codebase/SERVICE_MAP.json` | 30 services with data reach and consumers |
| `codebase/STORAGE_USAGE_MAP.json` | 2 storage files, upstash-redis |
| `generated/FEATURE_FILE_INDEX.json` | feature → file lookup |
| `generated/IMPORT_GRAPH.json` | 485 nodes, all edge classes |
| `generated/INTELLIGENCE_MANIFEST.json` | the only artifact with a timestamp |
| `generated/PAGE_COMPONENT_INDEX.json` | page → component tree with depth |
| `generated/REVERSE_DEPENDENCY_MAP.json` | who imports what |
| `generated/SYMBOL_INDEX.json` | 2,943 declarations with line and export status |
| `codebase/CODEBASE_INTELLIGENCE.md` | the contract |
| `codebase/INTELLIGENCE_QUERIES.md` | executable worked examples |
| `codebase/PHASE_7_SIMULATIONS.md` | simulations, false positives, perf, dependencies |
| `codebase/PHASE_7_CHECKLIST.md` | tasks 7.1–7.46 with evidence |
| `codebase/PHASE_7_CHANGES.md` | this file |
| `tasks/TASK_CATEGORY_CATALOG.md` | task type → query → gate |
| `scripts/check-index.mjs` | cross-reference validator |
| `scripts/generate-index.mjs` | index generator |
| `scripts/query-index.mjs` | query CLI |
| `scripts/lib/*.mjs` | 6 pipeline modules |

### Files modified (8)

| Path | Change |
| --- | --- |
| `package.json` | `typescript@^5.9.3` devDep; 5 scripts; `check:index` in `check` |
| `package-lock.json` | lock for the above |
| `scripts/check-knowledge.mjs` | 14 Phase 7 artifacts added to `REQUIRED` |
| `scripts/secret-scan.mjs` | exports `scanText()` so the generator can scan before write |
| `infrastructure/GENERATED_ARTIFACTS.md` | Phase 7 ownership and guard rules |
| `tasks/ACTIVE_TASK.md` | Phase 7 handoff |
| `AGENT.md` | intelligence usage, context budget, expansion rules |
| `CONFLICTS.md` | A19–A24 |
| `.github/workflows/ci.yml` | blocking `intelligence` job |

### Files deleted

None.

---

## 2. Source precedence

```
1. Application source            the only authority on behaviour
2. Generated AST indexes         locate only; never the final word
3. Coarse Phase 1-6 documents    orientation
4. Names and grep                last resort, never an answer
```

The generator enforces part of this mechanically: **the manifest records no hash
of its own outputs.** A manifest that stored them would embed run N-1 state, so
the value would differ every run and `--check` could never pass. The manifest
also cannot list itself, since it carries each file's sha256 — so it lists the
other 16 artifacts, and `check-index.mjs` asserts exactly that contract.

The coarse `PROJECT_MAP.json` is **kept, not replaced.** It answers a different
question (`how many tracked files exist`) than the AST index (`what does this code
do`). `CONFLICTS.md` A24 records why 481 and 485 are both correct.

---

## 3. Scale and counts

485 parseable files / 8.48 MB across 8 source roots. Excluded: 20 directory
patterns and 1 ledgered file (`frontend/src/data/embeddedSourceCode.ts.bak`,
860 KB). 15 role-only files are discovered but not parsed.

| Index | Count |
| --- | --- |
| Files indexed | 485 |
| Components | 227 (157 HIGH, 70 MEDIUM, 5 orphaned, 155 lazy) |
| Pages / routes | 74 / 63 (60 matched, 14 pages unrouted) |
| Features | 56 (21 multi-file) |
| Services / hooks | 30 / 2 |
| Served HTTP endpoints | 69 (GET 34, POST 26, DELETE 5, PATCH 3, PUT 1) |
| MCP tool registrations | 14 |
| Outbound client calls | 5 |
| Database / storage | 16 files, 4 collections / 2 files, upstash-redis |
| External integrations | 6, referencing 55 env vars |
| Symbols | 2,943 (2,347 distinct names, 378 ambiguous) |
| Import edges | 1,098 internal, 850 external, 272 dynamic, 39 re-export, 11 asset, 3 unresolved |

Role distribution: 199 COMPONENT, 74 PAGE, 35 SCRIPT, 30 SERVICE, 26 DATA,
23 UTILITY, 23 UNKNOWN, 16 MCP_TOOL, 9 ROUTE_CONFIG, 8 CONFIG, 8 MIDDLEWARE,
7 STATE, 7 TYPE, 5 BARREL, 5 MODEL, 4 ENTRY, 2 CONTROLLER, 2 HOOK, 1 TEMPLATE,
1 TEST.

**The 23 UNKNOWN files are a feature, not a gap.** They are classified, kept, and
reported by `agent:query -- role UNKNOWN` rather than dropped. 0 files are
unclassified.

---

## 4. Six defects the validator caught in this phase's own work

This is the strongest argument for having written the validator at all — every
one of these was in Phase 7 code before `check-index.mjs` existed.

1. **9 phantom endpoints.** `searchParams.get('q')`, `params.get('tool')`,
   `req.get('user-agent')`, an `axios.post()` to Brevo and `Promise.all([...])`
   were all reported as served routes. Detection now requires the receiver to
   look like a router **and** the path to be a string literal starting with `/`.
2. **Barrels reported as pages.** `^index\.tsx? -> PAGE` made the `index` ENTRY
   rule unreachable and listed pure re-export files as user-facing pages.
3. **`usedByPages` always empty.** It read a component's *outbound* edges and
   filtered for pages — the opposite of the question being asked.
4. **Every file was a component.** A shorthand property returned the helper
   *function* instead of calling it, so `isReactComponent` was truthy for all
   485 files and the orphan count jumped from 5 to 37.
5. **`INTEGRATION_MAP` inventoried `.` and `..` as npm packages.** Relative
   specifiers were reduced with `split('/')[0]`.
6. **`FEATURE_MAP` had 91 features, most with one file.** The `frontend/src`
   fallback used `split('/')[3]`, which is the *filename*, minting a feature per
   root file. Now 56 features, all 485 files covered.

Two more were found by query-level testing rather than the validator:

7. **Component names read from the wrong symbol.** `TemplateSimilarRail.tsx` was
   named after `SIMILAR_COLLAPSED_COUNT` and `AdminLayout.tsx` after `ADMIN_NAV`.
   Naming now prefers an exported `COMPONENT` symbol matching the file's basename.
8. **Nested directories classified by their parent.** `components/models/`,
   `components/types/`, `components/stores/` were all `COMPONENT` because
   `components/` matched first. Path rules are now ordered so a directory is
   classified by what it *is* before its container.

---

## 5. What the index got wrong about this repository

Documented in `CONFLICTS.md` A19–A24. Two are worth repeating here because they
change how an agent should use the tool.

- **A19 — `TemplatePreview.tsx` is 868 lines and dead.** The index reports zero
  renderers, which is correct. A grep for `TemplatePreview` returns 9 files, 8
  of them false positives (comments, `LazyTemplatePreview`,
  `TemplatePreviewStage`, and the type name `TemplatePreviewSource`).
- **The specification's example component does not exist.** `agent.md` section 50
  uses `TemplateCard` throughout. There is no such component. The string occurs
  once in source, at `TemplateSimilarRail.tsx:221`, as a **local non-exported**
  `CurrentTemplateCard`. `COMPONENT_MAP` is one row per file, so a local
  component has no row and `-- component CurrentTemplateCard` correctly returns
  nothing. `-- symbol CurrentTemplateCard` answers fully. All success criteria
  are satisfiable; the query form has to match.

---

## 6. Final gate results

Run after the last code change.

| Gate | Result |
| --- | --- |
| `agent:index` | 17 artifacts, 485 files, 2.6–2.8 s, `fp=7e27afc36f0d` |
| `agent:index:check` | **17/17 fresh, drift 0** |
| `agent:index:stats` | read-only, `wrote nothing` |
| `check:index` | **PASS** — 20 results: 17 MATCH, 3 WARN, 0 FAIL |
| `check:secrets` | **PASS** — 1235 files, 12 placeholders, 1 masked, 0 real |
| `check:knowledge` | **VALID** — 4 checks, 0 problems |
| `check:generated` | **FRESH** — 83 tracked `dist` files match a fresh build |
| `check:docs` | **0 drift findings** |
| `check:config` | **7 CONSISTENT, 4 CONFLICT** — unchanged from Phase 6, owner-owned |
| `check:tracking` | 21/22 satisfied; the 1 violation is this phase's own untracked files |

The 3 `check:index` WARNs are findings about the repository, not index defects:

| Warning | Count | Why it is a warning |
| --- | --- | --- |
| `PAGE_MAP <-> ROUTE_MAP` | 14 pages unrouted | shared/partial components, not pages |
| `IMPORT_GRAPH` unresolved | 3 edges | `mcp-server`/`backend` import `dist/routes/mcp.js`, a build output absent in a clean checkout |
| `COMPONENT_MAP` orphans | 5 components | genuinely unimported; see A19–A23 |

### Tests — 231/231, baseline preserved

| Suite | Result |
| --- | --- |
| Backend | 79 passed |
| MCP | 95 passed |
| CLI | 30 passed |
| Frontend | 27 passed |
| **Total** | **231 passed, 0 failed** |

### Builds

| Package | Result |
| --- | --- |
| Frontend | built in 21.2 s |
| MCP | compiled, data files copied |
| CLI | compiled |

### Typecheck — KNOWN BASELINE ISSUE

61 errors across 23 files, byte-for-byte the Phase 6 baseline recorded in
`runtime/TYPECHECK_BASELINE.md`. Task 7.46 forbids fixing these. **Not fixed.**

### CI

New blocking `intelligence` job: `npm ci` → `agent:index:check` →
`check:index`, gated behind `security-scan`.

---

## 7. Deviations from the brief

| Brief | Delivered | Why |
| --- | --- | --- |
| 16 artifacts | 17 | The manifest cannot hash itself, so it lists 16 others; 16 + the manifest = 17. Counting 16 silently omits the freshness record. |
| `PROJECT_MAP.json` replaced by a detailed index | **kept alongside it** | Different denominators, different questions. Removing it would have broken Phase 1–6 references. |
| "Do not create unnecessary duplicate indexes" | 17 files, no duplication | Each artifact answers a distinct question. `FILE_ROLE_MAP` holds per-file facts; `COMPONENT_MAP` holds per-component rows; `SYMBOL_INDEX` holds local symbols that have no component row. Overlap is by design and documented. |
| `TemplateCard` example component | reported as not existing | Documented in §5 rather than inventing a match. |

---

## 8. Phase 6 finding status

| Phase 6 finding | Status |
| --- | --- |
| A18 credential rotation | **OWNER REQUIRED** — recommended, not performed |
| 4 deployment/config conflicts | **OWNER REQUIRED** — unchanged, `check:config` still red by design |
| CORS policy | RESOLVED in Phase 6, untouched here |
| `dist` freshness gate | RESOLVED in Phase 6, still passing |
| `.uihub-agent/` + `.github/` tracking | RESOLVED in Phase 6, enforced again here |
| 61-error frontend typecheck | **DEFERRED** to its own phase per 7.46 |

---

## 9. Remaining risks and unknowns

**Risks**

1. `COMPONENT_MAP` is one row per file, so a file defining three components
   contributes one row. Local components are only findable via `SYMBOL_INDEX`.
2. Recall depends on seed choice. `-- feature auth` gives 9% recall; traversal
   from `AuthContext.tsx` gives 64%. This is a property of the question, not a
   bug, but it will mislead an agent that does not read the numbers.
3. Three unresolved edges mean the MCP server's real import surface is slightly
   under-represented until `mcp-server` is built.
4. `check:tracking` will fail in CI until this phase's files are committed.

**Unknown**

- Whether the 4 CloudScroll `index.tsx` files classified `COMPONENT` are real
  barrels or real components. `agent:query -- role BARREL` surfaces the question
  rather than deciding it.
- 23 `UNKNOWN`-role files. Named, listed, deliberately unclassified.
- Runtime `UNKNOWN_REGISTER.md` items that need dashboard access.

---

## 10. Discoveries that should shape Phase 8

1. **A `--depth` flag does not exist**, so `impact <path> --depth 3` is parsed
   as part of the path and reports `UNKNOWN (not indexed)`. Anyone scripting
   traversal should use `-- symbol` or read `REVERSE_DEPENDENCY_MAP.json`.
2. **Static import edges are not enough for this repository.** 272 dynamic
   import edges against 1,098 static ones means `React.lazy` code-splitting is
   the dominant pattern in the frontend. Any index that only follows static
   imports will under-report frontend impact substantially.
3. **The template API is MCP, not REST.** There is no `GET /api/templates`. A
   task phrased as "the templates endpoint" should route to `-- integration`
   or `API_MAP.mcpTools`, not to `-- endpoint`.
4. **`check:config` will stay red** until the owner resolves 4 conflicts. Phase 8
   should not treat it as a regression.
5. **The frontend typecheck baseline is 61 errors / 23 files** and is stable.
   A future phase that changes that number is doing UI work, not intelligence
   work.