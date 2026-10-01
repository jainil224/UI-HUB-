# Phase 8 checklist — tasks 8.1–8.56

Every task in `agent.md` with where it was satisfied and how it was verified.
"Not done" items are stated, not omitted.

## Contracts and model

| # | Task | Delivered | Verified by |
|---|---|---|---|
| 8.1 | Task router contract | `.uihub-agent/tasks/TASK_ROUTER.md` — all 9 required sections: purpose, input, classification, routing, confidence, context expansion, protected paths, output, failure behaviour | router suite; documented shapes dumped from a live route and corrected against it |
| 8.2 | Task category taxonomy | 18 categories from Phase 7, no invented extras | `router-matrix.mjs`; every declared source root exists |
| 8.3 | Task classification model | strong/weak evidence tiers; strong required for a category | `a category requires strong evidence` |
| 8.4 | Task intent | verb-led: FIX/ADD/REMOVE/UPDATE/INVESTIGATE… | `intent carries a reason` |
| 8.5 | Task surface | derived from resolved evidence, not wording | `surface follows the resolved evidence` |
| 8.6 | Router output | fixed shape, `candidates[]` carries the `strong[]`/`weak[]` audit trail | live route dumped |
| 8.7 | Routing rules | strong-before-weak; overlays attach to a real subsystem | `subsystem overlays are declared as overlays` |
| 8.8 | Routing matrix | `ROUTING_MATRIX.json`, generated from `router-matrix.mjs` | `the routing matrix is internally consistent` |
| 8.9 | File relevance engine | evidence tiers: exact name > partial > structural > rare segment > common segment > vocabulary | `every reason kind carries a defined weight`; ranking monotonicity |
| 8.10 | Relevance result | priority P0–P5, score, tier, role, `why[]` | live bundle |
| 8.11 | Initial context set | 5–15 target, capped by `initialTarget` | `a context is a small fraction of the repository` |
| 8.12 | Context expansion | exactly 7 triggers, enforced in code | `all seven permitted triggers fire against real repository data` |
| 8.13 | Context expansion limit | guidelines with reasons, not caps; caller must widen explicitly | `expansion can be disabled`; ceiling = cap + perStep × steps |
| 8.14 | Context bundle | `.uihub-agent/tasks/CONTEXT_BUNDLE.md` covering all 11 required elements including **Indexes queried** and **Dependencies** | `the bundle names the indexes it queried`; `dependencies agree exactly with the expansion log` |
| 8.15 | Context bundle JSON | generated `CONTEXT_BUNDLE_SCHEMA.json` | `the schema is generated, not hand-written`; 10/10 bundles validate |

## CLI

| # | Task | Delivered | Verified by |
|---|---|---|---|
| 8.16 | Query CLI integration | `query-index.mjs` exports `queries`, `run`, `printCommand`, `UsageError` | `query-index imports silently and returns data` |
| 8.17 | Router CLI | `npm run agent:route`, `--json`, `--explain`, `--max-files` | CI smoke step |
| 8.18 | Context CLI | `npm run agent:context`, `--json`, `--max-files`, `--expand-steps`, `--allow-stale`, `--manifest` | CI smoke step; exit codes 0/1/2/3 verified |
| 8.19 | Query result JSON | `--json` on all 19 queries | router suite |
| 8.20 | Human-readable mode | compact tables, reasons capped in human output; JSON keeps all reasons | human output review |

## Domain routing

| # | Task | Delivered | Verified by |
|---|---|---|---|
| 8.21 | Protected-path check | tiers read from `PROTECTED_PATHS.md` at runtime | `protected tiers come from PROTECTED_PATHS.md, not a copied table`; `a directory rule covers its whole subtree` |
| 8.22 | Security context routing | SECURITY category, security knowledge | S7 |
| 8.23 | Deployment context routing | DEPLOYMENT category | matrix coverage |
| 8.24 | Design context routing | DESIGN_SYSTEM, design-system knowledge | matrix coverage |
| 8.25 | API task routing | endpoint → handler via `API_MAP` | S9; `API_DEPENDENCY` fires |
| 8.26 | Database task routing | DATABASE category, corrected to real roots | `every declared source root is a real directory` |
| 8.27 | Feature name resolution | `FEATURE_MAP` + aliases | S1 |
| 8.28 | Component name resolution | camelCase-aware `splitWords()`; action words stripped | S6; `an action word is not treated as an identifier` |
| 8.29 | Route-aware resolution | page and API route entities | S9 |
| 8.30 | File-path-aware resolution | explicit-path fast path, first file, ≤5 files | S3 |
| 8.31 | Error/investigation routing | INVESTIGATE starts deliberately small and stops early | `shouldStop` INVESTIGATE branch |
| 8.32 | Change-impact preview | `REVERSE_DEPENDENCY_MAP.json` + `PROTECTED_RELATIONSHIP` | trigger fires |
| 8.33 | Context escalation log | `expansionLog`: step, path, trigger, how, reason | `every expansion has a recorded reason` |
| 8.34 | Context stop rule | `stopReason` always populated, including how many were left unopened | `expansion always reports why it stopped` |
| 8.35 | Unknown handling | `UNKNOWN` + `unknown.why` + `suggestion[]`, never a guess | S8, S10 |
| 8.36 | Multi-feature tasks | ordered multi-category output | S2 → 4 categories |
| 8.37 | Context deduplication | one entry per path; expansion re-adds nothing | S3 |
| 8.38 | Context priority | P0–P5, `P5` reserved for expansion | live bundle |
| 8.39 | Context manifest | `.uihub-agent/generated/CONTEXT_MANIFEST.json` is a **static template**; real output only via `--manifest` | both index checks tolerate it |

## Tests and metrics

| # | Task | Delivered | Verified by |
|---|---|---|---|
| 8.40 | Router test suite | `router.test.mjs`, 20 tests | 20/20 |
| 8.41 | Required real-task simulations | 10 tasks in `PHASE_8_SIMULATIONS.md` | 10/10 bundles valid |
| 8.42 | Simulation metrics | files, expanded, P0, protected, critical, % of repo | `PHASE_8_SIMULATIONS.md` |
| 8.43 | Target efficiency | mean 9.7 files; mean 2.01% of repo; max 6.4% | measured, not asserted |

## Integration and safety

| # | Task | Delivered | Verified by |
|---|---|---|---|
| 8.44 | agent.md integration | workflow appended as sections 65–66, existing rules and precedence preserved | diff review |
| 8.45 | OpenCode integration | `.uihub-agent/tasks/OPENCODE_USAGE.md` | no OpenCode API assumed |
| 8.46 | Antigravity integration | `.uihub-agent/tasks/ANTIGRAVITY_USAGE.md`, tool-agnostic | no unsupported features assumed |
| 8.47 | Context safety | bundles carry paths/names/reasons only; serialized bundle scanned with `scanText()` | `a bundle never carries a secret value`; `the secret scanner still catches a planted credential`; exit 3 verified |
| 8.48 | Documentation context | knowledge docs selected by category, never loaded wholesale | S7 returns 5 relevant docs only |
| 8.49 | Router fallback | UNKNOWN → search indexes, exact symbols, routes/features, return candidates, mark confidence | S8, S10 |
| 8.50 | Knowledge routing graph | generated `KNOWLEDGE_ROUTING_GRAPH.json`, 44 edges | `every edge points at a document that exists` |
| 8.51 | Router freshness | `agent:context` exits 2 on a stale index; `--allow-stale` is explicit | `freshness reports FRESH against the committed indexes` |
| 8.52 | Protected task escalation | payment/auth/deployment/database-mutation/MCP-auth/security set `highCaution` + `ownerActionRequired` with reasons | S1, S4, S7 |
| 8.53 | Phase 8 knowledge doc | `.uihub-agent/tasks/CONTEXT_ROUTING_GUIDE.md` — all 6 required topics | file present |
| 8.54 | Final validation | all gates re-run; baselines unchanged; no gate weakened | see `PHASE_8_CHANGES.md` §4–5 |
| 8.55 | No frontend typecheck fix | **61 errors / 23 files, unchanged** | `git diff` touches no frontend file |
| 8.56 | No production changes | no data or deployment change; nothing deployed | `git diff` touches no deployment file |

## Deliberately out of scope

**Test directories are not indexed.** `backend/tests/`, `cli/tests/` and
`mcp-server/tests/` sit outside `SOURCE_ROOTS`, so 17 of 18 test files are
invisible to the router. Adding them would change the indexed total from 485 and
invalidate the 481/485 reconciliation in `CONFLICTS.md` A24 and
`CODEBASE_INTELLIGENCE.md`. Recorded in `PHASE_8_CHANGES.md` §7 rather than
changed.

## Sign-off

| Gate | Result |
|---|---|
| `npm run agent:index:check` | 19/19 fresh |
| `npm run agent:test` | 51/51 |
| `check-index.mjs` | 20 MATCH, 3 WARN, 0 FAIL |
| Simulation bundles | 10/10 schema-valid |
| Preserved baselines | unchanged |