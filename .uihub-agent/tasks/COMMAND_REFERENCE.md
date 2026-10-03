# COMMAND REFERENCE

**Status:** CANONICAL for every agent-related command in this repository
**Scope:** what each command does, what it needs, what it can change, and how it fails
**Authority:** this file is derived from `package.json` and the scripts themselves.
Where this file and `package.json` disagree, `package.json` is the implementation
and this file is the documentation error.

> **On `--help`.** Only some scripts implement it. `agent:route`, `agent:context`,
> `agent:memory` and `agent:prepare` do. `agent:index` does **not** — passing
> `--help` to it runs the generator and rewrites artifacts. This is recorded here
> rather than fixed, because changing generator CLI behaviour is outside a
> documentation change.

---

## Index

| Command | What it is |
|---|---|
| [`agent:prepare`](#agentprepare) | Memory + routing + context, one call |
| [`agent:route`](#agentroute) | Classify a task, show the evidence |
| [`agent:context`](#agentcontext) | Build the minimal necessary context bundle |
| [`agent:memory`](#agentmemory) | Query durable memory |
| [`agent:query`](#agentquery) | Read-only questions against the indexes |
| [`agent:index`](#agentindex) | Generate the intelligence indexes |
| [`agent:index:check`](#agentindexcheck) | Verify indexes are fresh |
| [`agent:index:stats`](#agentindexstats) | Index summary |
| [`agent:test`](#agenttest) | The agent test suite |
| [`agent:experiment`](#agentexperiment) | Read-only expansion-trigger measurement |
| [`check:index`](#checkindex) | Indexes agree with each other |
| [`check:knowledge`](#checkknowledge) | Durable documentation present and resolvable |
| [`check:secrets`](#checksecrets) | No secrets in anything git can commit |
| [`check:generated`](#checkgenerated) | Generated MCP dist matches its source |
| [`check:docs`](#checkdocs) | No documentation drift |
| [`check:tracking`](#checktracking) | Nothing silently untracked |
| [`check:config`](#checkconfig) | Configuration contract findings |
| [`check`](#check) | The aggregate pipeline |
| [`check:routing`](#checkrouting) | Agent tests + index agreement |

---

<a id="agentprepare"></a>
## `agent:prepare`

```bash
npm run agent:prepare -- "<task>"
npm run agent:prepare -- --json "<task>"
npm run agent:prepare -- --memory-limit 0 "<task>"
```

| | |
|---|---|
| **Purpose** | Retrieve memory, route the task, build context, and report both together |
| **Input** | A task string. Flags: `--json`, `--memory-limit <n>` (default `12`), `--max-files <n>`, `--expand-steps <n>` (default `1`), `--allow-stale` |
| **Output** | Human report, or `--json` with schema `prepared-task/1` |
| **Read-only?** | Yes, with respect to application source |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` ok · `1` usage error · `2` stale indexes · `3` secret found in the serialized payload |

Order of operations: `memory → classification → routing → context → protected →
report`. It **composes** `memory-query`, the router and `buildBundle()`; it does
not reimplement routing and does not duplicate the context builder.

`buildBundle()` receives no memory at all — the word does not appear in
`scripts/lib/bundle.mjs`. Memory is retrieved first and then reported alongside.

### `--memory-limit 0` is the router-invariant probe

```bash
npm run agent:prepare -- --memory-limit 0 "<task>"   # memory query still runs
```

`--memory-limit 0` surfaces zero memory records while the memory query still
executes. It is the operational form of the architectural invariant in
[`../architecture/AGENT_ARCHITECTURE.md`](../architecture/AGENT_ARCHITECTURE.md) §6,
and `tests/prepare-task.test.mjs` asserts that the resulting context is deep-equal
to the default run. A future change that lets memory alter routing breaks that
test.

---

<a id="agentroute"></a>
## `agent:route`

```bash
npm run agent:route -- "<task>"
npm run agent:route -- --explain "<task>"
npm run agent:route -- --json "<task>"
```

| | |
|---|---|
| **Purpose** | Classify a task and show how it was routed |
| **Input** | A task string. Flags: `--json`, `--explain`, `--max-files <n>` (preview list, default `10`), `-h/--help` |
| **Output** | Routing table, or `--json` |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` ok — **including `UNKNOWN`** · `1` usage error |

An `UNKNOWN` route is a *successful* route, not a failure: "I could not classify
this" is a legitimate answer a caller may want to inspect.

---

<a id="agentcontext"></a>
## `agent:context`

```bash
npm run agent:context -- "<task>"
npm run agent:context -- --json "<task>"
npm run agent:context -- --manifest .tmp/ctx.json "<task>"
```

| | |
|---|---|
| **Purpose** | Build the minimal necessary context for a task |
| **Input** | A task string. Flags: `--json`, `--max-files <n>`, `--expand-steps <n>` (`0` disables), `--manifest <path>`, `--allow-stale`, `-h/--help` |
| **Output** | Bundle report, or `--json` validated against `generated/CONTEXT_BUNDLE_SCHEMA.json` |
| **Read-only?** | Yes, with respect to application source |
| **Production access** | None |
| **Modifies files** | Only when `--manifest <path>` is given |
| **Failure behaviour** | `0` ok · `1` usage error · `2` stale indexes · `3` secret found in the serialized bundle |

`--max-files <n>` is honoured **verbatim** and disables evidence growth: an
explicit number is already a decision.

---

<a id="agentmemory"></a>
## `agent:memory`

```bash
npm run agent:memory -- "<question>"
npm run agent:memory -- --json "<question>"
npm run agent:memory -- --list
npm run agent:memory -- --status SUPERSEDED "<question>"
```

| | |
|---|---|
| **Purpose** | Query durable memory in `.uihub-agent/memory/` |
| **Input** | A question or task string. Flags: `--json`, `--list` (metadata only), `--limit <n>` (default `12`), `--status <s>`, `--kind <k>`, `--help` |
| **Output** | Ranked records `P0`–`P5`, each citing why it matched |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` ok — including an empty result · `1` usage error · `3` secret found in the serialized payload |

`--status` accepts `CURRENT`, `RESOLVED`, `HISTORICAL`, `SUPERSEDED`, `UNKNOWN`.
`--kind` accepts `task`, `decision`, `lesson`, `fix`, `failure`, `regression`,
`limitation`.

Secret-shaped values are redacted at retrieval (`redactSecrets()`), and the whole
serialized payload — query result and `--list` alike — is then scanned by
`scripts/secret-scan.mjs` before it is written. A finding aborts with exit `3` and
nothing is emitted, the same as `agent:prepare` and `agent:context`. The former
asymmetry between this command and `agent:prepare` is **closed**: all three share
one detector.

---

<a id="agentquery"></a>
## `agent:query`

```bash
npm run agent:query -- component TemplatePreview
npm run agent:query -- impact backend/src/middleware/auth.js
npm run agent:query -- routes
npm run agent:query -- --json stats
```

| | |
|---|---|
| **Purpose** | Read-only questions against the Phase 7 intelligence indexes |
| **Input** | A subcommand and its argument. `--json` for machine-readable output |
| **Output** | The answer, plus its evidence |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` ok · non-zero usage error on an unknown subcommand |

Subcommands: `symbol`, `component`, `hook`, `service`, `feature`,
`list-features`, `list-symbols`, `endpoint`, `database`, `storage`, `integration`,
`routes`, `route-pages`, `importers`, `impact`, `orphans`, `role`, `confidence`,
`stats`.

---

<a id="agentindex"></a>
## `agent:index`

```bash
npm run agent:index
```

| | |
|---|---|
| **Purpose** | Generate all intelligence indexes from source |
| **Input** | None |
| **Output** | `19` artifacts, one line per artifact, plus the file/fingerprint summary |
| **Read-only?** | **No** — it writes `.uihub-agent/codebase/`, `.uihub-agent/generated/` and `INTELLIGENCE_MANIFEST.json` |
| **Production access** | None |
| **Modifies files** | Yes, the generated index tree |
| **Failure behaviour** | `0` ok · `1` usage error · `2` **BLOCKED — generated output would contain a real secret** |

This is the only routinely-needed command that writes files. Run it after source
changes, then `agent:index:check`.

It does **not** implement `--help`; that argument runs the generator.

---

<a id="agentindexcheck"></a>
## `agent:index:check`

```bash
npm run agent:index:check
```

| | |
|---|---|
| **Purpose** | Verify committed indexes match what the generator would produce |
| **Input** | None. Optional `--stats` |
| **Output** | `fresh` / `stale` per artifact, `drift=<n>`, and the fingerprint |
| **Read-only?** | Yes — writes nothing |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` all fresh · `1` drift |

Byte-for-byte comparison, not a heuristic. Expected current state:
`19/19 fresh, drift=0, fingerprint=fe2be01006fe` over `505` files.

---

<a id="freshnesstiers"></a>
## Freshness tiers

Freshness is not one check. Four tiers exist, they see different things, and no
single command covers all of them. This was established by simulation against
throwaway repository copies, not inferred: `tests/staleness.test.mjs` drives each
tier through a real mutation and a real recovery.

| Tier | Command | Compares | Cost | Fails with |
|---|---|---|---|---|
| 1. Cheap pre-check | `freshness()` inside `agent:context` / `agent:prepare` | Working tree vs the manifest snapshot, on **path + size** | ~500 `stat()` calls | exit `2` unless `--allow-stale` |
| 2. Content-exact | `agent:index:check` | Every generated artifact, byte for byte | full re-read | exit `1` on drift |
| 3. Sibling agreement | `check:index` | Each index against the *other indexes* | reads only | exit `1` on CONFLICT/MISSING |
| 4. Built output | `check:generated` | Tracked `mcp-server/dist` against a fresh build | runs `tsc` | exit `1` on drift |

Three consequences worth knowing before trusting any one of them:

- **Tier 1 cannot see a same-size content edit.** It compares path and length
  only. A one-character change inside a file of unchanged length is invisible to
  it, which is why tier 2 exists and why `COMMAND_REFERENCE` points at
  `agent:index:check` rather than at the guard for verification.
- **Tier 3 does not compare anything against the working tree.** Every index can
  agree perfectly while the source has moved underneath them. A deleted source
  file leaves `check:index` at `0`; only tiers 1 and 2 notice.
- **Tier 4 is the only gate that covers `mcp-server/dist`.** `dist` is in
  `walk.mjs` `NO_INDEX_DIRS`, so it is never indexed. Tiers 1, 2, and 3 are all
  blind to drift there — a drifted `dist` reports `FRESH` everywhere else.

`UNKNOWN` is treated exactly like `STALE` by the guard. A failed filesystem walk
means "I could not check", and that must never read as "it is fine".

---

<a id="agentindexstats"></a>
## `agent:index:stats`

```bash
npm run agent:index:stats
```

| | |
|---|---|
| **Purpose** | Index summary without regenerating |
| **Input** | None |
| **Output** | Counts, sizes, fingerprints, timings |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |

---

<a id="agenttest"></a>
## `agent:test`

```bash
npm run agent:test
```

| | |
|---|---|
| **Purpose** | The agent test suite — routing, context, precision, memory, expansion, prepare |
| **Input** | None |
| **Output** | `node --test` summary |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero if any test fails |

Current baseline: **232/232**.

| File | Covers |
|---|---|
| `tests/router.test.mjs` | Classification, confidence, UNKNOWN, protected paths |
| `tests/context.test.mjs` | Bundle fields, expansion triggers, size policy |
| `tests/precision.test.mjs` | Relevance precision and the benchmark |
| `tests/memory.test.mjs` | Precedence, freshness, supersession, redaction |
| `tests/expansion-experiment.test.mjs` | The 14 expansion admission guards |
| `tests/prepare-task.test.mjs` | The prepare composition layer and the memory/router boundary |
| `tests/memory-boundaries.test.mjs` | The memory emit boundary, the full non-influence invariant, record quality |
| `tests/staleness.test.mjs` | Change intelligence: all four freshness tiers, stale-index refusal, regeneration recovery, generated drift, deleted/added sources, determinism |
| `tests/freshness-cost.test.mjs` | Freshness I/O cost: no content read of already-indexed files, one read per genuinely new file, generator still refuses a binary blob |
| `tests/redaction-hardening.test.mjs` | Bare MCP/Google shapes redacted, documentation stays readable, `[REDACTED]` idempotent, JSON CLIs emit no secret |
| `tests/secret-scan-fixtures.test.mjs` | Per-detector verdict matrix for all sixteen detectors, the Firebase public-identifier split, scanner/redaction independence |
| `tests/helpers/sim-repo.mjs` | Throwaway repository copy used by the staleness suite (not a test file) |

---

<a id="agentexperiment"></a>
## `agent:experiment`

```bash
npm run agent:experiment
```

| | |
|---|---|
| **Purpose** | Measure expansion triggers with relevance-selected subjects, read-only |
| **Input** | None; runs the 10-task benchmark internally |
| **Output** | Per-trigger additions, false positives and verdicts |
| **Read-only?** | Yes with respect to application source and indexes — it changes no trigger |
| **Production access** | None |
| **Modifies files** | Yes — it rewrites its own report, `tasks/EXPANSION_EXPERIMENT.md`, deterministically |
| **Failure behaviour** | `0` ok · `1` usage error |

Its result is recorded in [`EXPANSION_EXPERIMENT.md`](EXPANSION_EXPERIMENT.md) and
resolved `DEC-009` as **RESOLVED — do not widen expansion subjects**.

---

<a id="checkindex"></a>
## `check:index`

```bash
npm run check:index
```

| | |
|---|---|
| **Purpose** | Verify the indexes agree with each other |
| **Input** | None |
| **Output** | Cross-reference `MATCH` / `WARN` / `FAIL` counts |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero on any `FAIL` |

Runs `agent:index:check` then `scripts/check-index.mjs`. Current state:
`20 MATCH / 3 WARN / 0 FAIL`. The warnings — unresolved bare-`.js` specifiers and
component-map orphans — are known and recorded, not failures.

---

<a id="checkknowledge"></a>
## `check:knowledge`

```bash
npm run check:knowledge
```

| | |
|---|---|
| **Purpose** | Durable memory and knowledge documentation exist, and every path they cite resolves |
| **Input** | None |
| **Output** | Per-file link and source-path counts, then `VALID` / a problem list |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero on any problem |

Current state: `VALID — 4 check(s) passed, 0 problem(s)`, including
`292` in-document source path references.

---

<a id="checksecrets"></a>
## `check:secrets`

```bash
npm run check:secrets          # git-visible files
npm run check:secrets:all      # everything, including ignored paths
```

| | |
|---|---|
| **Purpose** | Detect real secrets before they are committed |
| **Input** | None |
| **Output** | Scope, files scanned, and per-finding classification |
| **Read-only?** | Yes |
| **Production access** | None — it reads files, it does not contact services |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero only on `REAL_SECRET`. `PLACEHOLDER`, `MASKED`, `PUBLIC_IDENTIFIER` and `TEST_FIXTURE` are reported, not failed |

Default scope is every file git could commit — by construction, not by directory
allowlist. Current state: `scope=git-visible files scanned=1304`.

---

<a id="checkgenerated"></a>
## `check:generated`

```bash
npm run check:generated
```

| | |
|---|---|
| **Purpose** | Prove the committed `mcp-server/dist` matches `mcp-server/src` |
| **Input** | None |
| **Output** | `tracked`, `fresh`, `common` counts, then `FRESH` or `STALE` |
| **Read-only?** | Yes — it builds to a temporary directory |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | `0` fresh · `1` drift · `2` `dist` missing or untracked · `3` the build itself failed |

`mcp-server/dist` is committed and load-bearing at runtime, so a source-only
change leaves production on the old code with nothing detecting it. This gate is
the detection. **Never hand-edit `dist`** — rebuild with `npm run build:mcp`.

This is the **only** gate that covers `dist`. `dist` is listed in `walk.mjs`
`NO_INDEX_DIRS`, so it is never indexed and the other three freshness tiers are
structurally blind to it: a drifted `dist` still reports `FRESH` from
`freshness()` and `agent:index:check`, and `check:index` still passes. A green
run of those three is not evidence that `dist` is current.

Exit `3` is distinct from exit `1` on purpose. `1` means "the comparison ran and
found drift"; `3` means the comparison could not be trusted, because `tsc` failed
and a partial build would otherwise look like a mismatch list.

---

<a id="checkdocs"></a>
## `check:docs`

```bash
npm run check:docs
```

| | |
|---|---|
| **Purpose** | Detect documentation drift and unverifiable claims |
| **Input** | None |
| **Output** | Per-rule findings, then a drift count |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero on any drift finding |

Current state: `0 drift finding(s)`. Test-count prose is explicitly skipped —
counting tests from Markdown is unreliable, and the rule says so rather than
guessing.

---

<a id="checktracking"></a>
## `check:tracking`

```bash
npm run check:tracking
```

| | |
|---|---|
| **Purpose** | Prove nothing important is silently untracked or ignored |
| **Input** | None |
| **Output** | Per-rule `ok` / `FAIL` lines and a satisfied count |
| **Read-only?** | Yes |
| **Production access** | None |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero if any rule is violated |

Includes `knowledge-tracked`, which requires every `.uihub-agent/memory/` file to
be tracked — so a memory file cannot sit in an ignored directory where it is
neither scanned nor reviewed.

Current state: `21/22 satisfied, 1 violated` — the violation is the not-yet-staged
Phase 10 file set. **This is expected while work is in progress** and is not to be
silenced by staging early or by weakening the rule.

---

<a id="checkconfig"></a>
## `check:config`

```bash
npm run check:config
```

| | |
|---|---|
| **Purpose** | Report configuration contract findings, including conflicts that need an owner |
| **Input** | None |
| **Output** | `CONSISTENT` / `CONFLICT` / `UNKNOWN` per rule, then counts |
| **Read-only?** | Yes |
| **Production access** | None — it reads committed config and compares it; it does not query dashboards |
| **Modifies files** | No |
| **Failure behaviour** | Non-zero when any rule is `CONFLICT` |

Current state: `7 CONSISTENT, 4 CONFLICT, 0 UNKNOWN`.

The four conflicts are owner decisions, not agent defects:

```text
render-blueprint-count             two Render blueprints declare different services
render-blueprint-coherence         the root blueprint claims backend+MCP but starts only the backend
mcp-allowed-origins-localhost-in-prod  production MCP allows localhost dev origins
vercel-mcp-endpoint                /mcp resolves to the SPA catch-all on Vercel
```

Each is registered in [`OWNER_DECISIONS.md`](OWNER_DECISIONS.md) as `OD-01`…`OD-12`
with options and evidence. **The agent reports these; it does not resolve them.**

---

<a id="check"></a>
## `check`

```bash
npm run check
```

The aggregate pipeline, in order:

```text
check:secrets → check:tracking → check:knowledge → check:generated
→ check:docs → check:config → check:index
```

Exits non-zero on the first failing gate. Does not include `agent:test`; run
`npm run check:routing` or `npm run agent:test` for the agent suite.

---

<a id="checkrouting"></a>
## `check:routing`

```bash
npm run check:routing
```

`npm run agent:test && node .uihub-agent/scripts/check-index.mjs` — the agent suite
plus index agreement. This is the gate to run after anything touching routing,
context, memory or the prepare layer.

---

## Commands that do not exist

Recorded so a future session does not go looking for them, and does not document
them:

```text
agent:lint
agent:expand
agent:protected
agent:memory:update
agent:report
agent:scan
check:memory
check:prepare
```

Memory updates are performed by editing `.uihub-agent/memory/*.md` directly and are
validated by `check:knowledge` and `check:tracking`. There is no write command, by
design: memory records are prose with schemas behind them, and a generator would
encourage padded entries.

---

## Boundary summary

| | |
|---|---|
| Reads application source | `agent:route`, `agent:context`, `agent:memory`, `agent:prepare`, `agent:query` |
| Reads indexes only | `agent:index:check`, `agent:index:stats`, `check:index`, `check:generated`, `check:config`, `check:knowledge`, `check:docs`, `check:tracking`, `check:secrets` |
| **Writes** files | **`agent:index`** only, plus `agent:experiment`, which rewrites its own report `tasks/EXPANSION_EXPERIMENT.md` |
| Writes only where asked | `agent:context --manifest <path>` |
| Requires production access | **none** |

---

END — COMMAND REFERENCE
