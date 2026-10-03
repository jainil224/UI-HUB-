# Phase 10 — Durable Codebase Intelligence System

> Closing record for Phase 10. Canonical for **area E — validation and
> completion**. `AGENT_ARCHITECTURE.md` is the design; this file is the
> measurement of what was actually built and what remains open.
>
> Every number here was copied from command output, not from expectation. Where
> a figure is deliberately unchanged, the file says so and says why.

---

## 1. What was built

| # | Capability | Where it lives | What it does |
|---|---|---|---|
| 1 | **Codebase intelligence** | `scripts/lib/walk.mjs`, `scripts/lib/intel.mjs`, `generated/` | Walks the tree to a bounded, hash-fingerprinted index: routes, APIs, features, components, pages, imports, dependencies. 19 tracked artifacts. |
| 2 | **Task router** | `scripts/lib/router.mjs`, `agent:route` | Classifies a task into a domain with a confidence score, and returns the features and services it touches. Declines rather than guessing when evidence is thin. |
| 3 | **Targeted context** | `scripts/lib/relevance.mjs`, `scripts/lib/context-size.mjs`, `agent:context` | Selects the smallest file set that covers the task, under an explicit size policy with a safety ceiling. Refuses to inflate the bundle to look thorough. |
| 4 | **Protected-path intelligence** | `scripts/lib/expand.mjs`, `scripts/lib/protected.mjs` | Knows which paths need a human decision before edit, and keeps them out of the autonomous bundle. |
| 5 | **Durable memory** | `scripts/lib/memory.mjs`, `scripts/memory-query.mjs`, `memory/` | 61 records across 7 category files, with a precedence ladder, supersession, and freshness classification. |
| 6 | **Memory security** | `scripts/secret-scan.mjs`, `redactSecrets()` | 16 detectors and an independent redaction layer. Neither one alone is trusted. |
| 7 | **Freshness / change intelligence** | `scripts/lib/intel.mjs`, `agent:index:check` | Content-exact staleness detection via a tree fingerprint, so a same-size edit cannot pass as fresh. |
| 8 | **Task preparation** | `scripts/prepare-task.mjs`, `agent:prepare` | One command that retrieves memory, routes the task, selects context, evaluates protected paths, and reports both with their suppliers named. |
| 9 | **Validation / reporting** | `check:secrets`, `check:tracking`, `check:knowledge`, `check:docs`, `check:config`, `check:index`, `check:generated`, `agent:test` | Eight gates plus a 232-test suite. Each number in this document came out of one of them. |

---

## 2. What was proven

| Claim | How it was proven | Result |
|---|---|---|
| **Memory non-influence** | `memoryLimit 0` vs default produces a byte-identical file list and classification | 3/3 sampled tasks identical; pinned by `memory-boundaries.test.mjs` E2-B1 |
| **Memory cannot outrank source** | `precedenceRank('source')=1` < `precedenceRank('memory')=4` on the 6-rung ladder | `memory outranks source = false`, `source outranks memory = true` |
| **The context bundle has no memory coupling** | `scripts/lib/bundle.mjs` imports router, relevance, expand, intel, context-size, query-index — nothing else | **Zero** occurrences of the string `memory` in the file |
| **Stale-data safety** | Tree fingerprint is content-exact, so a same-size content edit is still detected | 10/10 staleness tests; 9/9 equivalence tests |
| **Targeted context** | Canonical benchmark reproduced through three independent code paths (`agent:context`, `agent:prepare`, `buildBundle`) | S1–S10 = 9, 14, 2, 16, 42, 13, 0, 0, 10, 0 — **total 106**, unchanged |
| **Security boundary** | Scanner and redaction each proven to reject a synthetic key **with the other absent from the code path** | realistic 43-char body → `REAL_SECRET`; 20-char body → `REAL_SECRET`; bare prefix → no finding; `x`×25 → `PLACEHOLDER` |
| **No secret in any emitted payload** | `agent:memory --json` and `agent:prepare --json` scanned for 5 credential shapes | **0** matches in either; both valid JSON |
| **Deterministic indexing** | Two consecutive full scans byte-compared by SHA-256 | Identical |
| **Deterministic emission** | Two consecutive `agent:memory --json` runs byte-compared | Identical (`34771515EE5F6C44…`) |
| **Change recovery** | Simulated repositories rebuilt from scratch after deletion/mutation | Indexes regenerate to the same state; `check:generated` 83/83 fresh |
| **Fresh-session workflow** | A fresh reader can go documentation → command → evidence without prior context | 8 command entries, 2 task templates, 1 report template, all cross-referenced |

---

## 3. Final measured state

```text
agent:test                232/232 pass, 0 fail
application suites        231/231  (backend 79, mcp-server 95, cli 30, frontend 27)
frontend typecheck        61 errors / 23 files  (unchanged pre-existing baseline)
agent:index:check         19/19 fresh, drift=0
check:generated           83/83 fresh
check:index               20 MATCH / 3 WARN / 0 FAIL
check:knowledge           VALID, 4 checks, 0 problems
check:docs                0 drift findings
check:secrets             1299 files scanned, 0 REAL_SECRET
check:tracking            21/22 before staging (1 violation: untracked knowledge files),
                         cleared by the Phase 10 commit itself
check:config              7 CONSISTENT / 4 CONFLICT / 0 UNKNOWN
memory records            61 records, 61 unique IDs, 0 duplicates
memory statuses           CURRENT 43 / RESOLVED 1 / HISTORICAL 17
router benchmark          106 (S1–S10, unchanged)
```

---

## 4. Known limitations

These are **accepted properties of the design**, not unfinished work. Each one is
listed with what it would take to change, so the next reader can price it.

1. **S1 `auth.js` coverage gap.** The router does not admit
   `backend/src/middleware/auth.js` for every auth-adjacent task. The benchmark
   pins the current behaviour rather than the ideal, so the gap is visible instead
   of hidden. Not fixed: changing it would move a pinned benchmark value.
2. **Same-size freshness limitation.** Fingerprint-based staleness detection
   compares path and size in its cheap tier, so a same-size content edit passes
   that tier. `agent:index:check` is the content-exact tier and does catch it. The
   cheap tier exists because it runs on every query.
3. **Sibling index-check limitation.** `check:index` proves the indexes agree
   **with each other**, not with the working tree. After a file is deleted it still
   returns `0`, because every index was generated before the deletion. Use
   `agent:index:check` for freshness.
4. **Dist coverage ownership.** The 83 tracked `dist` artifacts are owned by the
   build, not by hand. `check:generated` verifies they match source; it does not
   decide when to rebuild them.
5. **Four configuration conflicts.** Deliberately unresolved owner decisions
   (`vercel-mcp-endpoint` and three others). They need a human owner, so
   `check:config` reports them rather than guessing.
6. **61 frontend typecheck errors / 23 files.** Pre-existing and untouched. Fixing
   them is application work, outside the agent system's scope.
7. **Context-task malformed diagnostic.** When a task string cannot be classified,
   the diagnostic is less informative than it should be. It declines safely rather
   than failing, so this is a message-quality issue, not a correctness one.
8. **Custom `MCP_API_KEY_PREFIX` not covered by the scanner.** `mcp-server`'s
   `env.ts` reads `MCP_API_KEY_PREFIX || 'uh_live_'`, so the prefix is
   configurable, but the `mcp-api-key` detector matches the literal `uh_live_`. A
   deployment using a different prefix would be uncovered. Every other prefix
   detector in the registry (`rzp_live_`, `whsec_`, `AIza`, `ghp_`) shares this
   property, so it is consistent with the existing design rather than a new gap.
9. **`apiKey:` first-pass redaction mangling.** A value shaped `apiKey: "AIza…"`
   becomes `apiKey: "A[REDACTED]"` on the first pass, because the `key=value`
   pattern captures only the first character. Repeat passes are stable, and the
   value is fully removed either way — the secret does not survive. The capture
   geometry is the defect. Untouched: it lives in the redaction layer, which F6
   was explicitly forbidden from redesigning.
10. **Secret-scan scope is working-tree only.** A credential that was committed and
    later deleted is invisible to the scanner. It does not scan history.
11. **Scan-scope count is unguarded.** The `files scanned=1299` figure in
    `COMMAND_REFERENCE.md` is maintained by hand. Nothing compares it against a
    freshly measured count, so it can silently drift — it was found stale at
    `1295` during F7, and drifted again within the same task when this summary
    file was added. Recorded here rather than fixed, because the fix is a new
    gate, not a Phase 10 requirement.

---

## 5. What Phase 10 explicitly did not do

* No production deployment. No push to any remote.
* No application source changed — `backend/`, `frontend/`, `mcp-server/` and
  `cli/` are untouched by every Phase 10 task.
* No change to DEC-009 beyond recording it as `RESOLVED` and active.
* No new security features beyond the F6 `mcp-api-key` detector, which closed a
  gap the audit proved was real.