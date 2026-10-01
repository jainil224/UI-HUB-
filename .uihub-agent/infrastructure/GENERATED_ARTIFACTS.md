# Generated Artifact Guard

Phase 6, task 6.15.

## The problem this guards

`mcp-server/dist/` is **tracked** in git — 83 files — because the Vercel
function bundles it:

```json
// vercel.json
"functions": { "api/index.js": { "includeFiles": "{backend/**,mcp-server/dist/**,mcp-server/package.json}" } }
```

Tracked output is fine *provided* it is regenerated from source. The failure
mode is silent: someone edits `mcp-server/src/data/templates.json`, the build
does not run or its output is not committed, and production serves stale data
that looks correct. Phase 5 confirmed this is a real risk here, and that the
ordinary source-coverage check does not detect it.

## How freshness is verified

`mcp-server/src/data/*.json` → `mcp-server/dist/data/*.json`, compared
**byte-for-byte**.

The JSON data files are copied verbatim by `tsc`, so byte equality is the
correct test. It is stricter and far cheaper than a semantic diff, and it cannot
be satisfied by a partial rebuild.

`components.ts` is deliberately excluded: it compiles to `components.js`, so
source and output are not byte-comparable. It is covered by `npm run build`
succeeding plus the test suite.

## Validation

Two validators cover this, at different granularity:

| Command | Checks |
|---|---|
| `npm run check:generated` | full regeneration, then compare every tracked `dist` file against a fresh build |
| `npm run check:config` → `mcp-data-freshness` | fast path: compare only the generated JSON data files, no rebuild |

`check:generated` is authoritative. `check:config` is the cheap daily check and
will not notice a stale `.js` file if the data files happen to match.

## How to regenerate

**Never edit files under `mcp-server/dist/` by hand.**

```bash
npm run generate        # build mcp-server, refresh mcp-server/dist
```

Then verify:

```bash
npm run check:generated
```

The validator never writes. It builds to a temporary location, compares, reports,
and exits non-zero on divergence. A validator that silently fixed the output
would hide the fact that someone forgot to regenerate.

## Current state

| Artifact | Tracked | Fresh |
|---|---|---|
| `mcp-server/dist/` (83 files) | yes | yes — 7/7 JSON data files match |
| `cli/dist/` (23 files) | yes | published from `dist`; guarded by its own build |
| `frontend/dist/` (726 files on disk) | **no** | n/a — ignored, Vercel builds from source |
| `backend/dist/` | no | n/a — not built in-repo |

---

# Codebase Intelligence Artifacts (Phase 7, task 7.44)

A second, independent class of generated artifact: the **intelligence indexes**
in `.uihub-agent/codebase/` and `.uihub-agent/generated/`.

## The problem this guards

They are the most-edited-looking files in the knowledge base and the easiest to
corrupt. A hand-edited index still looks plausible, still answers questions, and
will confidently disagree with the source. Worse, a stale index is invisible:
nothing crashes, and every answer is wrong in a way that is hard to notice.

Two distinct failures need two distinct gates, which is why there are two:

| Failure | Detected by | How |
|---|---|---|
| index no longer matches the source tree | `npm run agent:index:check` | regenerate in memory, byte-compare every artifact |
| indexes disagree with each other | `npm run check:index` | 17 cross-reference rules, MATCH / CONFLICT / MISSING |
| generated output would contain a real secret | inside `generate-index.mjs` | `scanText()` on the exact serialized bytes, **before** any write; exit 2 and write nothing |

The secret gate runs before the write loop, not after. An index that embedded a
live credential would be committed by any pipeline that writes first and scans
later.

## Which files are generated

**Never hand-edit any of these:**

```
.uihub-agent/codebase/API_MAP.json
.uihub-agent/codebase/COMPONENT_MAP.json
.uihub-agent/codebase/DATABASE_USAGE_MAP.json
.uihub-agent/codebase/FEATURE_MAP.json
.uihub-agent/codebase/FILE_ROLE_MAP.json
.uihub-agent/codebase/HOOKS_MAP.json
.uihub-agent/codebase/INTEGRATION_MAP.json
.uihub-agent/codebase/PAGE_MAP.json
.uihub-agent/codebase/ROUTE_MAP.json
.uihub-agent/codebase/SERVICE_MAP.json
.uihub-agent/codebase/STORAGE_USAGE_MAP.json
.uihub-agent/generated/FEATURE_FILE_INDEX.json
.uihub-agent/generated/IMPORT_GRAPH.json
.uihub-agent/generated/INTELLIGENCE_MANIFEST.json
.uihub-agent/generated/PAGE_COMPONENT_INDEX.json
.uihub-agent/generated/REVERSE_DEPENDENCY_MAP.json
.uihub-agent/generated/SYMBOL_INDEX.json
```

17 files. The 3 markdown documents beside them — `CODEBASE_INTELLIGENCE.md`,
`INTELLIGENCE_QUERIES.md`, `tasks/TASK_CATEGORY_CATALOG.md` — are **hand-written**
and legitimately lag the indexes.

## How to regenerate

```bash
npm run agent:index          # rewrite all 17
npm run agent:index:check    # exit 1 if stale
npm run agent:index:stats    # counts and timings, no write
npm run check:index          # cross-reference agreement
```

To fix a wrong fact in an index, change `generate-index.mjs` or a module in
`scripts/lib/` and regenerate. Editing the JSON would be silently reverted by
the next `--check`.

## Determinism

All artifacts serialize with sorted keys, so two runs on unchanged source produce
byte-identical files. Two deliberate consequences:

- The manifest carries `generatedAt` and `timingsMs`, both **stripped before
  comparison**. Without stripping, `--check` would fail on wall-clock drift
  immediately after a successful write.
- The manifest stores **no hash of its own outputs**, and lists the other 16
  artifacts but not itself. A manifest storing the previous outputs embeds run
  N-1 state and could never compare equal; a file cannot contain its own sha256.

## Ownership

Regeneration is fully automated and safe: `generate-index.mjs` is read-only with
respect to source, needs no database, no network and no credentials, and takes
about 2 seconds. Run it freely. It is wired into `npm run check` via
`check:index`, and into CI.

## Related

- `../codebase/CODEBASE_INTELLIGENCE.md` — how the indexes are built and what each field means
- `../codebase/INTELLIGENCE_QUERIES.md` — worked query examples
- `../tasks/TASK_CATEGORY_CATALOG.md` — which queries to run per task category
- `../rules/DO_NOT_CHANGE.md` — the agent rule for generated paths
- `../rules/PROTECTED_PATHS.md` — classification of generated paths
- `../infrastructure/CONFIGURATION_OWNERSHIP.md` — who owns regeneration
- `PROJECT_MAP.json` — the separate, coarser generated census