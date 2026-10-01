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

## Related

- `../rules/DO_NOT_CHANGE.md` — the agent rule for generated paths
- `../rules/PROTECTED_PATHS.md` — classification of generated paths
- `../infrastructure/CONFIGURATION_OWNERSHIP.md` — who owns regeneration
- `../runtime/PROJECT_MAP.json` — generated index