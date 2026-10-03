# AGENT WORKFLOW

**Status:** CANONICAL for the end-to-end agent operating procedure
**Scope:** what a future agent session does, in order, from a task string to a final report
**Authority:** this document describes *procedure*. The contracts it invokes are
canonical elsewhere and are cited rather than restated:

| Question | Authoritative document |
|---|---|
| What may memory influence? | [`../memory/MEMORY_OVERVIEW.md`](../memory/MEMORY_OVERVIEW.md) |
| How is a task routed? | [`TASK_ROUTER.md`](TASK_ROUTER.md) |
| What enters a bundle, and how much? | [`CONTEXT_BUNDLE.md`](CONTEXT_BUNDLE.md) |
| Which paths are protected? | [`../rules/PROTECTED_PATHS.md`](../rules/PROTECTED_PATHS.md), [`../rules/DO_NOT_CHANGE.md`](../rules/DO_NOT_CHANGE.md) |
| What commands exist? | [`COMMAND_REFERENCE.md`](COMMAND_REFERENCE.md) |
| How is the system layered? | [`../architecture/AGENT_ARCHITECTURE.md`](../architecture/AGENT_ARCHITECTURE.md) |
| What are the layers of the app itself? | [`../architecture/ARCHITECTURE.md`](../architecture/ARCHITECTURE.md) |

---

## The workflow

```text
USER TASK
    ↓
MEMORY RETRIEVAL
    ↓
TASK ROUTING
    ↓
CONTEXT PREPARATION
    ↓
PROTECTED-PATH CHECK
    ↓
SOURCE INSPECTION
    ↓
IMPLEMENTATION
    ↓
VALIDATION
    ↓
KNOWLEDGE UPDATE
    ↓
MEMORY UPDATE
    ↓
FINAL REPORT
```

One command performs steps 1–5 and reports them together:

```bash
npm run agent:prepare -- "Fix a payment verification bug"
```

`agent:prepare` composes existing layers. It does not reimplement routing, and it
does not duplicate the context builder — see §3.

---

## 1. Task intake

The agent receives a **task string** and nothing else. No structured input, no
environment variables, no network.

```bash
npm run agent:prepare -- "<task string>"
```

A task string may be any of these, and the system resolves them differently:

| Form | Example | Resolution |
|---|---|---|
| Conceptual | `Fix authentication middleware` | Broad classification; no explicit subject |
| Named entity | `Refactor TemplatePreview` | Shape-aware identifier resolution |
| Explicit path | `frontend/src/components/templates/TemplatePreview.tsx` | Explicit-file fast path — see §3 |
| Bare filename | `Update accessService.js` | Resolved only if unique in the index |
| Route | `/api/dashboard/mcp` | Route resolution |

If the task is empty or whitespace-only, the command is a usage error and exits
`1`. There is no default task and no "read everything" fallback.

### Before starting: is the index fresh?

Index state is checked before a bundle is built, not after. If indexes are stale
the command **refuses** with exit `2` and emits no prepared context, because a
bundle assembled from a stale index would look authoritative while describing a
repository state that no longer exists.

```bash
npm run agent:index:check      # 0 = fresh, 1 = drift
npm run agent:prepare -- --allow-stale "<task>"   # proceed anyway, deliberately
```

`--allow-stale` is an explicit override, not a fix. It is appropriate when the
task is genuinely about the change that made the index stale.

Three things to know before trusting the exit code, all confirmed by simulation
against throwaway repository copies (`tests/staleness.test.mjs`):

- **A `0` from `agent:index:check` is the real check.** The exit-`2` guard
  compares path and size only, so a same-size content edit passes it. The
  content-exact tier is `agent:index:check`.
- **A green `check:index` does not mean the indexes match the tree.** It means
  they agree with each other. After a source file is deleted it still returns
  `0`, because every index was generated before the deletion.
- **`--allow-stale` keeps the label.** The emitted payload carries
  `suppliers.indexFreshness: "STALE"`, and memory records retrieved alongside it
  do not fill the gap — memory never substitutes for missing current evidence.
  See `MEMORY_OVERVIEW.md` §5a.

---

## 2. Memory retrieval

Memory is retrieved **before** routing, but retrieval order is not influence. The
record is read early so it can be *reported* next to the decision; it is never an
input to it. A routing decision is byte-identical whether memory retrieved 5
records or 0 — see §3 for the `memoryLimit 0` invariant that proves it.

```bash
npm run agent:memory -- "payment verification"
```

### The rule

```text
Memory is historical context.
Memory does not override current repository evidence.
```

The full ladder, from `SOURCE_PRECEDENCE` in `scripts/lib/memory.mjs`:

```text
RUNTIME_EVIDENCE         observed behaviour
    >
SOURCE                   the file itself
    >
GENERATED_INTELLIGENCE   the indexes
    >
KNOWLEDGE_DOC            canonical documentation
    >
MEMORY                   durable records
    >
HISTORICAL_ASSUMPTION    believed, never verified
```

Note the third rung: **generated intelligence outranks knowledge documentation**,
because an index is a mechanical fact extracted from source and is therefore
fresher than prose written about it. Source still outranks the index — an index is
a derived claim about the file, not the file.

Memory may influence **how thoroughly an agent prepares**. It may not influence
**what gets selected**. The distinction is enforced mechanically, not by
convention — see §3 for the `memoryLimit 0` invariant that proves it.

### What is consulted

| File | Answers |
|---|---|
| `ARCHITECTURAL_DECISIONS.md` | Why does the system work this way |
| `KNOWN_FIXES.md` | How was this recurring problem solved |
| `KNOWN_FAILURES.md` | What broke, how it was detected, what it cost |
| `LESSONS_LEARNED.md` | What should be done differently |
| `REGRESSION_HISTORY.md` | What regressed, how it was found, what guards it |
| `LIMITATIONS.md` | What is still not solved |
| `TASK_HISTORY.md` | What did an AI task do, and did it work |

Retrieval is evidence-cited and bounded — ranked `P0`–`P5`, at most `12` results,
at most `4` per file, snippets capped at `240` characters. Every result states
which tier matched and why. An empty result is a real answer: it means this
problem is not recorded.

### Freshness, and why `RESOLVED` matters

| Status | Meaning |
|---|---|
| `CURRENT` | Verified against the repository and still holds |
| `RESOLVED` | A question was asked and answered; the answer is settled policy |
| `HISTORICAL` | Was true, not re-verified, not contradicted |
| `SUPERSEDED` | Was true; current evidence now says otherwise |
| `UNKNOWN` | Recorded without verification; never treated as fact |

`RESOLVED` is **active policy**. A decision closed by measurement still governs
behaviour — DEC-009 is resolved *against* widening expansion subjects, so filing
it as "no longer current" would bury a live ruling under the heading that means
its opposite. `isActivePolicy()` in `scripts/lib/memory.mjs` is the single
predicate, so `RESOLVED` records are not grouped as historical and are not marked
stale.

A record that is contradicted becomes `SUPERSEDED` rather than being deleted.
Deletion would destroy the evidence that the question was ever asked.

---

## 3. Task routing

`npm run agent:route -- "<task>"` resolves six things. Each carries its own
evidence; none is inferred from the wording alone.

| Dimension | Resolved from | Example |
|---|---|---|
| **category** | 18-category matrix, strong evidence only | `PAYMENT`, `COMPONENT` |
| **intent** | Action verbs in the task | `FIX` |
| **surface** | Roles and path prefixes of resolved entities | `["BACKEND","FRONTEND"]` |
| **feature** | `FEATURE_MAP` | `payment-routes` |
| **route** | `ROUTE_MAP` | `/api/dashboard/mcp` |
| **file** | Explicit path resolution, index-gated | `backend/src/routes/paymentRoutes.js` |

Confidence is `HIGH` / `MEDIUM` / `LOW` with a separate `confidenceWhy` string —
never a number, because a fabricated `0.87` implies a precision the heuristic does
not have. When no category earns strong evidence the result is `categories:
["UNKNOWN"]` plus `unknown.why` and `unknown.suggestion[]`. **UNKNOWN is a
successful route, not a failure**: it exits `0` so a caller can inspect why.

Full contract: [`TASK_ROUTER.md`](TASK_ROUTER.md).

### Fast paths

The router has one true fast path and two resolution shortcuts. They are
different, and the distinction is load-bearing.

**Explicit-file fast path.** When the task names a real indexed path:

```text
Exact file/path
    ↓
resolve file                 (index-gated; extension and basename forms allowed)
    ↓
feature from that file       (no keyword search)
    ↓
reverse dependencies         (importers)
    ↓
related tests                (TEST_DEPENDENCY)
    ↓
protected relationships      (PROTECTED_RELATIONSHIP)
```

Broad classification is deliberately **not** run. `distinctiveTerms`, term pairs
and the general term list are all set to empty, so naming a real file is treated
as a decision, not as a hint. Because the resolution is index-gated, a spelling
matching no indexed file resolves to nothing — the fast path cannot be widened
into a guess. When two indexed files share a basename, every spelling resolves to
nothing and the reason is reported.

**Route resolution.** A route named in the task resolves through `ROUTE_MAP` to
its page or API handler, whose dependencies then follow. This is normal entity
resolution, not a separate flag — classification still runs, because "fix the
route" says nothing about which subsystem.

**Feature resolution.** A feature slug resolves through `FEATURE_MAP` to its
pages, components and services, and dependencies follow. Also normal resolution.
On the explicit-file path the feature is instead derived from the named file
itself.

---

## 4. Context preparation

```bash
npm run agent:context -- "<task>"          # bundle only
npm run agent:prepare -- "<task>"          # memory + bundle + gates, together
```

`buildBundle()` produces the context. Fields include `task`, `categories`,
`surface`, `entities`, `files`, `dependencies`, `protectedAreas`, `validation`,
`expansionLog`, `stopReason`, `sizePolicy`, `efficiency`, and `emptyReason`.
Full field list: [`CONTEXT_BUNDLE.md`](CONTEXT_BUNDLE.md).

### Initial context

Relevance selection, ordered by score. Ordering is total and deterministic:

1. **Priority** — `P0` before `P1`, and so on.
2. **Connectivity** — real import-edge counts from `IMPORT_GRAPH.json`.
   Connectivity **reorders, it never rejects**.
3. **Path** — so output is byte-identical across runs.

### Dependency expansion

Adding a file is permitted for **seven triggers only**, each recorded in
`expansionLog` with its trigger and a human-readable justification:

```text
DIRECT_DEPENDENCY     RELEVANT_CONSUMER    SHARED_SERVICE
API_DEPENDENCY        STATE_DEPENDENCY     PROTECTED_RELATIONSHIP
TEST_DEPENDENCY
```

Most-specific-first ordering is load-bearing: `SHARED_SERVICE` is a strict subset
of `DIRECT_DEPENDENCY`, so trigger-major iteration let the broader trigger claim
every shared service and the narrower one could never fire.

### Stop rule

Expansion always stops for a stated reason — `stopReason` is never empty:

```text
nothing left with real evidence  → stop
step limit reached                → stop, ask for a larger budget
--expand-steps 0                  → stop; context is exactly what the task named
```

### Context size

Three separately-named numbers, not one hidden limit. Every bundle reports its own
copy in `sizePolicy`.

| Number | Value | Meaning |
|---|---|---|
| Relevance budget | `25` baseline, raised only by task evidence, max `40` | Soft target for relevance alone. Derived per task. |
| Expansion budget | `1` step × `10` files | Independent, so "relevance wanted 35" and "expansion added 8" are never conflated |
| Safety ceiling | `60` | Runaway guard only. Not a target |

The budget grows only on evidence — feature scope, validation requirements,
protected relationships, task complexity — and **shrinks** when the task names
files, because the named set is the subject. It never grows because more files
happen to be available.

An explicit `--max-files <n>` is a caller decision and is honoured verbatim with
growth disabled.

### Validation context

`validation` carries the commands that must pass before the work counts as done,
derived from the matched categories. These are suggestions from the router's
category rules; §7 is where the agent actually runs them.

---

## 5. Protected-path check

```text
PROTECTED  ≠  RELEVANT
```

Protection means **dangerous to touch**, not **needed by this task**. An
unrelated protected file is not loaded just because it is protected.

A protected path enters the context only when its feature scope intersects the
task's, or when the task resolved a category that declares it protected **and** it
lives in a surface the task actually implicated. Surface membership is read from
path prefixes, not the role table — `ROLE_SURFACE` maps `MIDDLEWARE` to `BACKEND`
even for `mcp-server/src/middleware/auth.ts`.

Tiers (`CRITICAL`, `HIGH_RISK`, `GENERATED`, `NORMAL`) are parsed at runtime from
[`../rules/PROTECTED_PATHS.md`](../rules/PROTECTED_PATHS.md); the rule file is the
single source of truth and no tier table is duplicated in code.

When the guard blocks a protected file, **the caution still reaches the reader**
through `protectedAreas` — with tier and rule text. The information is preserved
even though the file is not loaded. Maintenance scripts (`SCRIPT` role) are
excluded from features entirely.

Non-negotiable rules are in [`../rules/DO_NOT_CHANGE.md`](../rules/DO_NOT_CHANGE.md).

---

## 6. Source verification

**A memory record is a claim about the past. Current source is the present.**

Before acting on any historical record, verify against current source, current
indexes and current runtime:

```text
Memory:     "TemplatePreview uses implementation A."
Current:    uses implementation B.
Agent:      trust B. Mark A SUPERSEDED/HISTORICAL. Record the supersession.
```

Three sources, in this order:

1. **Current source** — read the file. It is the ground truth.
2. **Current indexes** — `npm run agent:query -- impact <path>`, `npm run agent:index:check`.
   An index is a derived claim about source; source outranks it.
3. **Current runtime** — actual behaviour. Outranks everything, and is the only
   source that can settle a question about deployed behaviour.

When memory and source disagree, the disagreement is itself worth recording: it
is the evidence that the memory layer needs maintenance.

---

## 7. Implementation

**Minimal change.** The smallest edit that makes the task correct.

- Change what the task requires. Nothing else.
- Do not reformat, rename or restructure code that was not part of the task. A
  reviewer must be able to see which lines belong to the request.
- Do not widen scope because something nearby looks wrong. Record it in
  `KNOWN_FAILURES.md` or `LIMITATIONS.md` instead — that is what those files are for.
- When a task touches a protected path, the caution is a reason to read carefully,
  not a reason to refuse. Refusing an owner-authorised task is its own failure.

---

## 8. Validation

Run what the router said the task requires (`validation` from the bundle), plus
the agent gates:

```bash
npm run agent:test            # 232 tests across routing, context, memory, prepare
npm run agent:index:check     # indexes fresh
npm run check:index           # indexes agree with each other
npm run check:secrets         # no secrets in anything git can commit
npm run check:knowledge       # durable documentation is present and resolvable
npm run check:docs            # no documentation drift
npm run check:generated       # generated MCP dist matches its source
npm run check:tracking        # nothing silently untracked
npm run check:config          # configuration contract findings
```

Then the application baseline for whatever subsystem was touched:

```bash
npm test --prefix backend     # 79
npm test --prefix mcp-server  # 95
npm run test:cli              # 30
npm test --prefix frontend    # 27
```

`check:tracking` is **expected** to report the not-yet-staged Phase 10 files while
work is in progress. That is the gate working, not a failure to hide.

Known, accepted, out of scope: frontend typecheck reports `61` errors across `23`
files. It is a pre-existing baseline, recorded in
[`../architecture/AGENT_ARCHITECTURE.md`](../architecture/AGENT_ARCHITECTURE.md) §
risks. Do not "fix" it as part of an unrelated task.

---

## 9. Knowledge update

Update the canonical document for the area whose behaviour actually changed. Do
not spread a change across every document that mentions it — duplicated
documentation drifts, and a stale copy is worse than no copy because it looks
authoritative.

| Change | Update |
|---|---|
| System topology, layering, data flow | `../architecture/ARCHITECTURE.md` |
| How the agent system itself is layered | `../architecture/AGENT_ARCHITECTURE.md` |
| API shape, endpoints, contracts | `../APIs/API_OVERVIEW.md` |
| Collections, storage | `../data/DATA_OVERVIEW.md` |
| Deployment, hosting, environment | `../infrastructure/INFRASTRUCTURE.md` |
| Component API and visual rules | `../design-system/DESIGN_SYSTEM.md` |
| Routing or context behaviour | `TASK_ROUTER.md`, `CONTEXT_BUNDLE.md` |
| Memory layer behaviour | `../memory/MEMORY_OVERVIEW.md` |
| Commands | `COMMAND_REFERENCE.md` |

A statement that was true and no longer is gets **labelled historical, not
deleted** — unless it is a fact about the current system, in which case it is
corrected.

---

## 10. Memory update

Write memory only when the work produced a fact that will still be true next month
and that a future session would otherwise have to re-derive.

### Worth storing

| Store it in | When |
|---|---|
| `ARCHITECTURAL_DECISIONS.md` | A verified structural decision was made, and the alternative was considered |
| `KNOWN_FIXES.md` | A fix is likely to recur |
| `KNOWN_FAILURES.md` | A failure mode is worth not repeating |
| `LESSONS_LEARNED.md` | A mistake generalises beyond its own task |
| `REGRESSION_HISTORY.md` | Something regressed, was found, and now has a guard |
| `LIMITATIONS.md` | Something remains unsolved — never softened at phase close |
| `TASK_HISTORY.md` | An AI task completed, with an outcome |

**Rejected approaches are the highest-value entries.** The working fix is visible
in current code; the path that was tried and abandoned is visible nowhere else.

### Never store

```text
trivial formatting changes
temporary debugging output
secrets, credentials, tokens, connection strings
entire source files
entire conversations
copies of canonical documentation
```

Records are dated and individually stamped, and validated against
`TASK_RECORD_SCHEMA.json` / `CHANGE_RECORD_SCHEMA.json` /
`DECISION_RECORD_SCHEMA.json`. Memory records the event, decision, reason and
relationship, then points at the current documentation for current detail.

A secret is never stored in the first place — that is a hard boundary, not a
review step. See §11.

---

## 11. Security boundaries

```text
No secrets in memory
No secrets in context
No secrets in generated indexes
No secrets in reports
```

Enforcement, in four independent places:

| Boundary | Mechanism |
|---|---|
| Anything git can commit | `npm run check:secrets` — scope is by construction, not an allowlist |
| Memory query output | `redactSecrets()` in `scripts/lib/memory.mjs`, then `scanText()` before emission |
| Context / prepared payloads | `scanText()` before emission; a finding aborts with exit `3` |
| Generated indexes | `generate-index.mjs` refuses to write output containing a real secret (exit `2`) |

Placeholder-shaped values are classified as `PLACEHOLDER` rather than failing,
because `.env.example` is full of them and Phase 5 established that "looks like a
placeholder" is not a placeholder. Detector detail lives in
`scripts/secret-scan.mjs`; this document deliberately does not duplicate it.

`check:tracking` requires memory files to be tracked, so a memory file cannot
quietly sit in an ignored directory where it is neither scanned nor reviewed.

---

## 12. Failure and unknown handling

**Do not guess.** Every one of these has a defined honest answer.

| Situation | Correct behaviour |
|---|---|
| Task is ambiguous | Report `UNKNOWN` with `unknown.why` and `unknown.suggestion[]`. Ask. |
| Target file does not exist | Record in `evidence.unresolvedTargets`; confidence caps at `MEDIUM`. Offer structural near-misses (same directory, same leaf name elsewhere) — never edit distance. Never silently substitute a similar path. |
| Two files share a basename | Every spelling resolves to nothing; report why. Guessing which was meant is invisible in a bundle and wrong in an editor. |
| Index is stale | Exit `2`, emit no context. Refresh with `npm run agent:index`, or pass `--allow-stale` deliberately. |
| Memory is empty | An answer, not a failure: this problem is not recorded. Say so and continue. |
| Protected path is involved | Report tier and rule. Treat as caution, not refusal. |
| Configuration conflict exists | Report it and stop. Do not pick a winner. See §13. |
| Owner access required | Report what is needed and who must decide. `OWNER_DECISIONS.md` is the register. |
| Secret detected | Stop. Do not print the value, not even truncated. |

An empty result explains itself: `emptyReason` carries `why`, `searchedTerms[]`
and `note`, and it never coexists with a non-empty `files` list.

---

## 13. Open owner dependencies

The following are **not the agent's to resolve**. They are recorded in
[`OWNER_DECISIONS.md`](OWNER_DECISIONS.md) as `OD-01` … `OD-12` and reported, never
decided:

```text
Vercel production configuration and the /mcp rewrite
Render blueprint authority (ui-hub-backend-mcp vs ui-hub-mcp)
Render admin access and the canonical API-key host
MongoDB credential rotation
Cloudflare configuration
Production VITE_API_URL
CORS production origin policy
Light-mode architecture
```

`npm run check:config` currently reports `7 CONSISTENT / 4 CONFLICT / 0 UNKNOWN`.
The four conflicts are `render-blueprint-count`, `render-blueprint-coherence`,
`mcp-allowed-origins-localhost-in-prod` and `vercel-mcp-endpoint`. Each requires an
owner decision; each is documented, none is resolved by the agent.

---

## 14. Production boundary

```text
Agent intelligence commands  →  normally repository-local
Production actions          →  owner-controlled
```

`agent:prepare`, `agent:route`, `agent:context`, `agent:memory`, `agent:query` and
`agent:index` read the working tree and committed indexes. **None requires
production access, and none should be described as though it does.**

Actual production changes — dashboard settings, environment variables, DNS,
credential rotation, deploy triggers — are owner actions. The agent may diagnose,
document and recommend; it does not apply them.

---

## 15. Knowledge freshness

```text
source changes
    ↓
index refresh          npm run agent:index
    ↓
index validation       npm run agent:index:check  →  npm run check:index
    ↓
task preparation       npm run agent:prepare
```

A stale index must never be silently treated as current. That is why
`agent:context` and `agent:prepare` refuse with exit `2` before building anything.

Generated artifacts follow the same discipline:

```text
source → generator → generated artifact → freshness check
```

`mcp-server/dist` is committed and load-bearing at runtime. **Never hand-edit it.**
Rebuild with `npm run build:mcp` and verify with `npm run check:generated`.

---

## 16. Final report

A completed task reports:

```text
What changed                     files, and why each
How it was verified              commands run, and their real results
What was left undone             explicitly, with reasons
What was learned                 the durable fact worth remembering
What memory records were written which file, which id
Open questions                   what needs an owner or a decision
```

The report must state actual command output, not an intention to run something.
"Validation passed" without the numbers is not a validation report.

---

END — AGENT WORKFLOW
