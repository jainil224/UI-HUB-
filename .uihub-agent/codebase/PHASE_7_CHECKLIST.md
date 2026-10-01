# Phase 7 Checklist

`agent.md` tasks 7.1–7.46. Each row is marked only against a command that was
actually run in this phase. Reproduce any row with the command in the Evidence
column.

Legend: `[x]` done and verified, `[~]` done with a documented limitation,
`[-]` deliberately not done, with the reason.

---

## Contract and inventories (7.1–7.12)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.1 | Codebase intelligence contract | [x] | `codebase/CODEBASE_INTELLIGENCE.md` |
| 7.2 | Component inventory | [x] | `agent:query -- orphans` → 227 rows, 5 orphaned |
| 7.3 | Component map | [x] | `codebase/COMPONENT_MAP.json`, 227 rows |
| 7.4 | Page map | [x] | `codebase/PAGE_MAP.json`, 74 pages, 60 routed |
| 7.5 | Route map | [x] | `codebase/ROUTE_MAP.json`, 63 routes, 60 matched |
| 7.6 | Feature map | [x] | `codebase/FEATURE_MAP.json`, 56 features |
| 7.7 | Hook map | [x] | `codebase/HOOKS_MAP.json`, 2 hooks |
| 7.8 | Service map | [x] | `codebase/SERVICE_MAP.json`, 30 services |
| 7.9 | API map | [x] | `codebase/API_MAP.json`, 69 endpoints + 14 MCP tools |
| 7.10 | Database usage map | [x] | `codebase/DATABASE_USAGE_MAP.json`, 16 files, 4 collections |
| 7.11 | Storage usage map | [x] | `codebase/STORAGE_USAGE_MAP.json`, 2 files, upstash-redis |
| 7.12 | External integration map | [x] | `codebase/INTEGRATION_MAP.json`, 6 integrations, 55 env vars |

## Graph and symbol layer (7.13–7.18)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.13 | Import graph | [x] | `generated/IMPORT_GRAPH.json`, 485 nodes, 1098 internal edges |
| 7.14 | Reverse dependency map | [x] | `generated/REVERSE_DEPENDENCY_MAP.json` |
| 7.15 | Symbol index | [x] | `generated/SYMBOL_INDEX.json`, 2943 symbols |
| 7.16 | File role classification | [x] | `codebase/FILE_ROLE_MAP.json`, 20 roles, 0 unclassified |
| 7.17 | Feature → file index | [x] | `generated/FEATURE_FILE_INDEX.json` |
| 7.18 | Page → component index | [x] | `generated/PAGE_COMPONENT_INDEX.json` |

## Impact analysis (7.19–7.21)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.19 | Component impact analysis | [x] | `agent:query -- component \| impact` |
| 7.20 | Route impact analysis | [x] | `agent:query -- endpoint`, `routes` |
| 7.21 | Feature impact analysis | [x] | `agent:query -- feature` |

Levels are qualitative only. No numeric risk score was invented; each level
prints the evidence that produced it.

## Agent-facing surface (7.22–7.27)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.22 | Query examples | [x] | `codebase/INTELLIGENCE_QUERIES.md`, all commands executable |
| 7.23 | Task category catalog | [x] | `tasks/TASK_CATEGORY_CATALOG.md` |
| 7.24 | Codebase index generator | [x] | `scripts/generate-index.mjs` |
| 7.25 | Single index command | [x] | `npm run agent:index` → 17 artifacts |
| 7.26 | Index check mode | [x] | `npm run agent:index:check` → 17/17 fresh |
| 7.27 | Index freshness | [x] | `sourceFingerprint 7e27afc36f0d…`, byte comparison |

`--check` and `--stats` are read-only. Both report `wrote nothing`.

## Hygiene and safety (7.28–7.34)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.28 | Exclude irrelevant files | [x] | manifest `exclusions`: 20 dirs, 1 ledgered `.bak` |
| 7.29 | Generated output security | [x] | `secret-scan.mjs` exports `scanText`; generator scans before write |
| 7.30 | Cross-reference validation | [x] | `npm run check:index` → 17 MATCH, 3 WARN, 0 FAIL |
| 7.31 | Unknown / low-confidence handling | [x] | 23 UNKNOWN kept, never dropped; `agent:query -- confidence` |
| 7.32 | Generated vs manual knowledge | [x] | `infrastructure/GENERATED_ARTIFACTS.md` |
| 7.33 | Protected source relationships | [x] | `rules/PROTECTED_PATHS.md`, `runtime/TYPECHECK_BASELINE.md` |
| 7.34 | Deployment precedence docs | [x] | `infrastructure/DEPLOYMENT_MAP.md` (Phase 6, unchanged) |

## Agent context discipline (7.35–7.37)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.35 | Context budget rule | [x] | `.uihub-agent/AGENT.md` |
| 7.36 | Minimum necessary context | [x] | INDEX → LOCATE → VERIFY → OPEN SOURCE |
| 7.37 | Context expansion rule | [x] | `.uihub-agent/AGENT.md` |

## Verification (7.38–7.41)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.38 | Real task simulations | [x] | `codebase/PHASE_7_SIMULATIONS.md` §3 |
| 7.39 | False-positive testing | [x] | `codebase/PHASE_7_SIMULATIONS.md` §4 |
| 7.40 | Index performance | [x] | manifest `timingsMs`, ~1.8–4.2 s |
| 7.41 | No production dependency | [x] | `codebase/PHASE_7_SIMULATIONS.md` §2 |

## Integration and closing (7.42–7.46)

| # | Task | State | Evidence |
| --- | --- | --- | --- |
| 7.42 | Knowledge integration | [x] | `check:knowledge` → VALID, 4 passed |
| 7.43 | Update AGENT.md | [x] | intelligence usage section added |
| 7.44 | Create intelligence manifest | [x] | `generated/INTELLIGENCE_MANIFEST.json` |
| 7.45 | Final integrity check | [x] | see `PHASE_7_CHANGES.md` §6 |
| 7.46 | Do not fix frontend typecheck | [-] | 61 errors / 23 files preserved as baseline |

---

## Documented limitations

These are real limits of the delivered layer, not unfinished tasks.

- **Recall depends on the seed.** A `feature` slug is the wrong unit for a
  horizontal concern. Authentication needs graph traversal from
  `AuthContext.tsx` (64% recall) rather than `-- feature auth` (9%).
- **A local component has no component row.** `CurrentTemplateCard` shares a
  file with two other components, so `COMPONENT_MAP` has no row for it. Use
  `agent:query -- symbol`. Documented in `CODEBASE_INTELLIGENCE.md`.
- **Three edges stay unresolved.** `mcp-server` and `backend` import
  `../../dist/routes/mcp.js`, a build output that does not exist in a clean
  checkout. Reported as WARN, never silently dropped. 1,098 internal edges do
  resolve.
- **14 pages have no route.** They are shared or partial components. Reported
  as WARN rather than force-matched.
- **The coarse map and the AST index use different denominators.** 481 tracked
  files under the four `src/` roots versus 485 indexed files. Explained in
  `CONFLICTS.md` A24.
  - **Corrected in the Phase 8 final closure: 485 → 501.** This reconciliation
    was arithmetically correct but described an **incomplete** index — 16 of 18
    real test files were never walked, because no `SOURCE_ROOTS` entry covered
    `backend/tests/`, `mcp-server/tests/` or `cli/tests/`. `TEST` role count is
    18, not 1. A number that reconciles is not the same as a number that is
    complete. See `CONFLICTS.md` A24 and
    `codebase/PHASE_8_CLOSURE_TEST_INDEX.md`.

## Deliberately not done

- The 4 open configuration conflicts. Owner-owned, unchanged from Phase 6.
- The 61 frontend typecheck errors. Explicitly out of scope per task 7.46.
- Any application source edit, production data change, deployment change, or
  credential operation.
- `agent.md`. User-owned and unmodified by this phase.