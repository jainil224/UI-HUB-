# AGENT ARCHITECTURE

**Status:** CANONICAL for the layers of the agent system
**Scope:** how the agent tooling is layered, how data moves between layers, and
where the boundaries are enforced

> **This document is about the agent, not the application.** The application
> topology — Vercel frontend, Render backend+MCP, MongoDB, Redis, Firebase — is
> [`ARCHITECTURE.md`](ARCHITECTURE.md). The two are separate systems that meet at
> one point: the agent reads the application; it never runs it.

---

## 1. The layers

```text
┌──────────────────────────────────────────────────────────────┐
│ 1. AGENT CONTRACT                                            │
│    agent.md — the rolling per-phase contract                 │
│    Rules of engagement, success criteria, required report    │
└───────────────────────────┬──────────────────────────────────┘
                            │ constrains
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. MEMORY                          .uihub-agent/memory/      │
│    Durable, dated, stamped engineering records               │
│    7 categories · 5 freshness states · P0–P5 retrieval       │
│    PRECEDENCE: cannot override current evidence              │
└───────────────────────────┬──────────────────────────────────┘
                            │ informs preparation only
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. TASK ROUTER                      scripts/lib/router.mjs   │
│    task string → categories, intent, surface, feature,       │
│                    route, file, confidence                  │
│    Deterministic · no I/O · UNKNOWN rather than a guess      │
└───────────────────────────┬──────────────────────────────────┘
                            │ resolved entities
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. CODEBASE INTELLIGENCE             .uihub-agent/codebase/ │
│    19 generated indexes: maps, import graph, symbol index    │
│    READ-ONLY INPUT to layers 3, 5 and 6                      │
│    source → generator → artifact → freshness check           │
└───────────────────────────┬──────────────────────────────────┘
                            │ evidence
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. CONTEXT BUILDER                   scripts/lib/bundle.mjs  │
│    relevance ordering → dependency expansion → stop rule     │
│    size policy: relevance budget | expansion budget | ceiling│
│    Produces the bundle. Calls NO memory.                     │
└───────────────────────────┬──────────────────────────────────┘
                            │ candidate files
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. PROTECTED RULES                .uihub-agent/rules/        │
│    PROTECTED_PATHS.md (tiers) · DO_NOT_CHANGE.md (non-neg.)  │
│    PROTECTED ≠ RELEVANT — caution without automatic loading  │
└───────────────────────────┬──────────────────────────────────┘
                            │ cleared to proceed
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. CODING / EXECUTION                                         │
│    The agent session. Current source is the only truth.      │
│    Minimal change. Protected ≠ refusal.                     │
└───────────────────────────┬──────────────────────────────────┘
                            │ edits
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. VALIDATION                                               │
│    agent:test (232) · check:* gates · application suites     │
│    Stale index and detected secret are hard stops            │
└───────────────────────────┬──────────────────────────────────┘
                            │ verified result
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 9. KNOWLEDGE UPDATE                                         │
│    The canonical doc for the area whose behaviour changed    │
│    One area, one doc. Suppressed claims get labelled,        │
│    not deleted.                                              │
└───────────────────────────┬──────────────────────────────────┘
                            │ durable facts
                            ▼
┌──────────────────────────────────────────────────────────────┐
│ 10. MEMORY UPDATE                                           │
│    Records with a date, a status and an id.                  │
│    Supersession recorded, never deletion.                   │
│    The next task reads what this one learned.                │
└──────────────────────────────────────────────────────────────┘
```

### Relationships

| Layer | Depends on | Must not |
|---|---|---|
| 1 Contract | — | Encode implementation detail that changes per phase |
| 2 Memory | 1 | Outrank current evidence |
| 3 Router | 1, 4 | Touch memory, or perform I/O beyond committed indexes |
| 4 Intelligence | — | Be hand-edited |
| 5 Context | 3, 4, 6 | Call memory, or admit a file it cannot justify |
| 6 Protected | 1 | Be duplicated into code as a tier table |
| 7 Execution | 5, 6 | Act on a historical record as if it were current |
| 8 Validation | — | Pass on stale indexes or a payload containing a secret |
| 9 Knowledge | 8 | Duplicate the current detail into memory |
| 10 Memory | 8, 9 | Store trivia, secrets, or whole files |

The critical structural property: **layer 5 does not depend on layer 2.** That is
deliberate and is what makes the memory/router boundary provable rather than
aspirational.

---

## 2. Data flow

### Task → Memory → Router → Context

```text
                        "Fix a payment verification bug"
                                      │
      ┌───────────────────────────────┴───────────────────────────────┐
      ▼                                                               │
┌───────────────────────────┐                                         │
│ 2. MEMORY RETRIEVAL      │  61 records → evidence-cited P0–P5       │
│  memory-query.mjs        │  bounded: 12 results, 4 per file,       │
│                           │  240-char snippets                      │
│  reads: task text +      │  RESOLVED · SUPERSEDED stay visible     │
│         index evidence   │                                          │
└───────────┬───────────────┘                                          │
            │  memory (informs preparation, selects nothing)           │
            ▼                                                          │
┌───────────────────────────┐                                          │
│ 3. TASK ROUTER           │  categories  PAYMENT, COMPONENT          │
│  router.mjs              │  intent      FIX                        │
│  reads: 19 indexes ONLY  │  surface     BACKEND, FRONTEND          │
│  no memory. no I/O.      │  feature     payment-routes            │
│  deterministic           │  confidence  HIGH + why                 │
└───────────┬───────────────┘                                          │
            │  ordered, justified candidates                          │
            ▼                                                          │
┌───────────────────────────┐                                          │
│ 5. CONTEXT BUILDER       │  relevance budget 25 (≤40 with evidence)  │
│  bundle.mjs              │  expansion 1 step × 10                    │
│  ranks → expands → stops │  safety ceiling 60                        │
│  every file has a why[]  │  stopReason never empty                   │
└───────────┬───────────────┘                                          │
            │                                                          │
            ▼                                                          │
┌───────────────────────────┐                                          │
│ 6. PROTECTED GATE        │  PROTECTED ≠ RELEVANT                    │
│  rules/PROTECTED_PATHS   │  unrelated protected file NOT loaded      │
│                           │  blocked path still reported in          │
│                           │  protectedAreas with tier + rule         │
└───────────────────────────┴──────────────────────────────────────────┘
```

`agent:prepare` performs all five steps in that order and reports them together.
It does not reimplement any of them.

### Context → Agent → Changes → Validation

```text
context bundle
    │
    │  paths, priorities, why[], protectedAreas, stopReason,
    │  validation commands, unknowns
    ▼
AGENT SESSION
    │
    ├─► VERIFY  memory claims against current source (§5 of AGENT_WORKFLOW)
    ├─► READ    the files the bundle selected, and no others "because adjacent"
    ├─► EDIT    minimal change
    ▼
working tree changes
    ▼
VALIDATION  ── gates that stop the task, in order:
    │
    ├─ agent:index:check     stale indexes        → refresh, or --allow-stale
    ├─ agent:test            232 agent tests      → fix the regression
    ├─ check:secrets         real secret          → STOP, do not print the value
    ├─ check:knowledge       knowledge resolvable → update the doc
    ├─ check:docs            no drift             → correct the claim
    ├─ check:generated       dist == src          → rebuild mcp
    ├─ check:tracking        nothing untracked    → stage deliberately
    ├─ check:config          config contract      → report, do not resolve
    └─ application suites    79 / 95 / 30 / 27
```

A failing gate is not a formality. Two of them are hard stops by design: a stale
index and a detected secret.

### Validation → Knowledge → Memory

```text
validation passed
    │
    ▼
DID KNOWLEDGE ACTUALLY CHANGE?
    │
    ├─ no ──► write nothing. Most tasks end here, and that is correct.
    │
    └─ yes ─► §9 of AGENT_WORKFLOW: update the ONE canonical doc for that area.
                   │
                   ▼
              DID THE WORK PRODUCE A DURABLE FACT?
                   │
                   ├─ no ──► stop. A CSS typo is not an entry.
                   │
                   └─ yes ─► write one dated, stamped, id'd record:
                              ARCHITECTURAL_DECISIONS · KNOWN_FIXES
                              KNOWN_FAILURES · LESSONS_LEARNED
                              REGRESSION_HISTORY · LIMITATIONS · TASK_HISTORY
                                     │
                                     ▼
                              check:knowledge + check:tracking
                                     │
                                     ▼
                              next task reads it at step 2
```

Rejected approaches are first-class records. The working fix is visible in current
code; the path that was tried and abandoned is visible nowhere else.

---

## 3. CURRENT versus HISTORICAL

Two different kinds of state, never mixed.

| | CURRENT | HISTORICAL |
|---|---|---|
| Lives in | source, indexes, knowledge docs | `.uihub-agent/memory/` |
| Proves | what the system does now | what was believed, decided or observed, and when |
| Authority | binding | advisory |
| Verified by | reading it | a status stamp and a date |
| Contradicted by reality | becomes a bug | becomes `SUPERSEDED` |

In the report they are separated by a hard fence:

```text
== CURRENT (repository, indexed now) ==
        ...everything read straight from the live repository...

== HISTORICAL MEMORY (durable records; may be stale — current source wins) ==
        ...memory, after the fence, never before it...
```

The historical fence appears *after* the current block, always. A reader who
stops reading at the fence has seen only current truth.

### Freshness states

| Status | Meaning | In force? |
|---|---|---|
| `CURRENT` | Verified against the repository and still holds | yes |
| `RESOLVED` | A question was asked and answered; the answer is settled policy | **yes** |
| `HISTORICAL` | Was true, not re-verified, not contradicted | no |
| `SUPERSEDED` | Was true; current evidence now says otherwise | no |
| `UNKNOWN` | Recorded without verification | no |

`RESOLVED` is in force. A decision closed by measurement still governs behaviour:
DEC-009 is resolved *against* widening expansion subjects, so treating a resolved
decision as "no longer current" would file a live ruling under the heading that
means its opposite. `isActivePolicy()` in `scripts/lib/memory.mjs` is the single
predicate; no consumer re-derives "is it current?" as `status === 'CURRENT'`.

`UNKNOWN` exists on purpose. "Someone believed this" and "this is true" are
different statements, and collapsing them is how a wrong belief becomes
infrastructure.

---

## 4. Source precedence

The implemented ladder, from `SOURCE_PRECEDENCE` in `scripts/lib/memory.mjs`
(asserted by `tests/memory.test.mjs`):

```text
RUNTIME_EVIDENCE      observed behaviour
    >
SOURCE                the file itself
    >
GENERATED_INTELLIGENCE   the indexes
    >
KNOWLEDGE_DOC           canonical documentation
    >
MEMORY                  durable records
    >
HISTORICAL_ASSUMPTION   believed, never verified
```

Two consequences that are easy to get wrong:

- **Generated intelligence sits above knowledge documentation.** An index is a
  mechanical fact extracted from source, so it is fresher than any prose written
  about it. But source still outranks the index — an index is a derived claim.
- **A stale index does not silently become current.** The ladder ranks *current*
  generated intelligence. Staleness is a separate failure with its own exit
  code, not a lower rung.

The ladder is prose in `memory/MEMORY_OVERVIEW.md` §4, code in
`scripts/lib/memory.mjs`, and a test in `tests/memory.test.mjs`. Three
representations of one rule, and the code is the one that runs.

### 4a. Freshness is four checks, not one

Staleness detection is layered, and the layers do not see the same things. This
was established by simulation (`tests/staleness.test.mjs`), not assumed:

| Layer | Mechanism | Blind to |
|---|---|---|
| Cheap pre-check | `freshness()` — path + size vs the manifest snapshot | same-size content edits |
| Content-exact | `agent:index:check` — byte comparison | `mcp-server/dist` |
| Sibling agreement | `check-index.mjs` | the working tree entirely |
| Built output | `check:generated` | anything it does not build |

The two gaps that matter in practice:

- **A same-size edit passes the cheap guard.** `agent:context` and
  `agent:prepare` will happily proceed on a file whose contents changed but whose
  length did not. That is a deliberate trade — the guard compares metadata, not
  bytes, so it cannot see an in-place edit of the same length — and it is why
  `agent:index:check`, not the exit code, is the verification command. §4b
  describes how the added-file half of this guard was made cheap without touching
  that trade.
- **`check:index` proves internal consistency, not correctness.** When a source
  file is deleted, every index still agrees with every other index, because they
  were all generated before the deletion. `check:index` returns `0`. Only the
  pre-check and the content-exact check compare an index against reality.

### 4b. The added-file walk is metadata-only

`freshness()` compares the manifest snapshot with `existsSync` and `statSync`, so
the snapshot loop itself has always been cheap. It did **not** stop there: to find
files the manifest has never seen it called `discover(ROOT)`, and `discover()`
sniffs each code-extension file for binary content while walking. That sniff is a
full `readFileSync`, so finding *new* files cost a full read of every known file
first.

The walk is therefore split, and the sniff now applies only where it can change
an answer:

| Step | Mechanism | Cost |
|---|---|---|
| Enumerate candidates | `discover(ROOT, { sniffBinary: false })` | metadata only |
| Drop already-known paths | `seen.has(f.path)` | no I/O |
| Classify genuinely new paths | `looksBinary()` | one read per new file |

`sniffBinary` defaults to `true`, so `generate-index.mjs` still refuses to index a
blob that happens to use a code extension. Only the freshness walk opts out, and
it opts out *after* removing everything the manifest already recorded — so the
sniff still runs on every path whose classification is actually undetermined.

Measured over a 501-path tree, on identical instrumentation: source content reads
`501 → 0` on a routine run, `528 → 27` total `readFileSync` calls, content read
`12.5 MB → 3.5 MB`, median wall clock `623 ms → 338 ms`. Metadata calls are
unchanged, because they are what the verdict is actually derived from.

The regression test asserts the *structure* rather than a duration
(`tests/freshness-cost.test.mjs`): zero source reads on an unchanged tree, exactly
one read per new file, and a new binary `.ts` file still excluded from `added`.
A millisecond budget would be machine-specific and would fail for reasons that
have nothing to do with this code.

---

## 5. The memory / router boundary

> **Memory can inform preparation. Memory cannot modify routing or context.**

This is the load-bearing architectural property of the agent system, and it is
mechanically enforced rather than trusted.

### Structural enforcement

```text
scripts/lib/bundle.mjs   ← buildBundle()  ·  the token "memory" does not appear
scripts/prepare-task.mjs  ← memoryQuery() · then buildBundle() · then report both
```

The context builder has no memory parameter and no memory import. Memory is
retrieved *before* routing and reported *alongside* it. There is no path by which
a memory record could reach file selection.

### The invariant

```text
memoryLimit 0  ==  default
```

for routing and context, exactly.

```bash
npm run agent:prepare -- --memory-limit 0 "Fix a payment verification bug"
npm run agent:prepare -- "Fix a payment verification bug"
```

`--memory-limit 0` surfaces zero memory records **while the memory query still
runs** — so this is not "skip the memory layer and observe no difference". The
memory path executes end to end and is then proven not to matter.

`tests/prepare-task.test.mjs` asserts, against the live memory layer:

| Assertion | What it prevents |
|---|---|
| `context` deep-equal at limit `0` vs default | Memory influencing selection |
| Candidate ranking identical | Memory reordering files |
| Context is a field-by-field superset of `buildBundle()` | Memory removing fields |
| A record naming `mongoService.js` pulls in nothing | Memory recruiting files |
| A record naming test files changes no test selection | Memory bypassing test-subject rules |

### Where memory *does* act

Preparation and judgement. A memory record legitimately changes what an agent
**reads first**, whether it **re-reads a known-trap area**, and what it
**records afterwards**. That is preparation. It is not routing.

If a future requirement genuinely needs memory to affect selection, it is a
change to the architecture, not a tweak: it requires a new decision record, a
stated contract change, and a rewritten invariant — not a quiet edit to
`bundle.mjs`.

---

## 6. Context size policy

Three separately-named numbers. They used to be one (`maxFiles: 25`) described in
prose as "no arbitrary cap", which meant the code and the documentation
disagreed.

| Number | Value | Owner | Meaning |
|---|---|---|---|
| **Relevance budget** | `25` base, raised only by evidence, max `40` | `relevanceBudgetFor()` | Soft target for what relevance alone selects |
| **Expansion budget** | `1` step × `10` files | `expand.mjs` `DEFAULT_LIMITS` | Independent budget for dependency expansion |
| **Safety ceiling** | `60` | `applySafetyCeiling()` | Runaway guard only |

The budget grows only on evidence the contract allows:

| Signal | Condition | Amount |
|---|---|---|
| Feature scope | more than one feature candidate | `+5` per extra feature |
| Validation requirements | more than `2` commands | `+5` |
| Protected relationships | more than `2` protected areas | `+5` |
| Task complexity | more than `2` surfaces | `+5` |

Then clamped to `maxRelevanceBudget = 40`. When the task **names files**, the
budget *shrinks* — `min(base, namedCount + 10)` — because the named set is the
subject.

It never grows because more files happen to be available. A larger repository, or
a task that happened to match more candidates, does not earn a larger context.

An explicit `--max-files <n>` is a caller override: honoured verbatim, growth
disabled. `npm run agent:context -- --max-files 8` means exactly 8.

If the ceiling fires, `sizePolicy.safetyCeilingApplied` is `true` and
`droppedByCeiling[]` names every path removed. Truncation preserves the ordered
list, so what survives is the strongest evidence rather than an arbitrary prefix.
Across the ten canonical benchmark tasks it never fires.

Every bundle reports its own copy of the policy in `sizePolicy`, so the numbers in
the documentation are checkable against the numbers in the output.

---

## 7. Protected paths

```text
PROTECTED  ≠  RELEVANT
```

Protection means **dangerous to touch**. It does not mean **needed by this task**.

| | Protected | Relevant |
|---|---|---|
| Means | editing is risky | this task needs it |
| Source | `.uihub-agent/rules/PROTECTED_PATHS.md` | router evidence + index evidence |
| Effect | caution, reported with tier and rule | admitted to context |
| Conflating them | would flood every bundle with auth, payment and deploy files | would make caution meaningless |

A protected path enters the context only when its feature scope intersects the
task's, or when the task resolved a category that declares it protected **and** it
lives in a surface the task actually implicated. Surface membership is read from
path prefixes, not the role table — `ROLE_SURFACE` maps `MIDDLEWARE` to `BACKEND`
even for `mcp-server/src/middleware/auth.ts`.

When the guard blocks a protected file, the **caution still reaches the reader**
through `protectedAreas`, with tier and rule text. The information is preserved
even though the file is not loaded. Nothing is silently dropped.

Tiers are parsed at runtime from the rule file; no tier table is duplicated in
code, so editing the rule file changes behaviour immediately. Full contract:
[`../tasks/TASK_ROUTER.md`](../tasks/TASK_ROUTER.md) § *Protected paths*, and
[`../rules/DO_NOT_CHANGE.md`](../rules/DO_NOT_CHANGE.md) for non-negotiables.

---

## 8. Security boundary

```text
No secrets in memory
No secrets in context
No secrets in generated indexes
No secrets in reports
```

Enforced in five independent places, so no single failure opens all of them:

| Where | Mechanism | On failure |
|---|---|---|
| Anything git can commit | `check:secrets`, scope by construction | non-zero on `REAL_SECRET` only |
| Memory query output | `redactSecrets()`, then `scanText()` before emission | `[REDACTED]`; exit `3`, nothing emitted |
| Context and prepared payloads | `scanText()` before emission | exit `3`, nothing emitted |
| Generated indexes | `generate-index.mjs` refuses to write | exit `2`, `BLOCKED` |
| Memory file location | `check:tracking` requires tracking | memory cannot hide in an ignored directory |

Detector detail is in `scripts/secret-scan.mjs` and is deliberately **not**
duplicated here. Placeholder-shaped values are classified as `PLACEHOLDER` rather
than failing, because `.env.example` is full of them and Phase 5 established that
"looks like a placeholder" is not a placeholder. Policy and the one real incident:
[`../security/SECRET_HANDLING.md`](../security/SECRET_HANDLING.md).

The former asymmetry between `agent:memory --json` and `agent:prepare` is **closed**.
`agent:memory --json` used to rely on redaction alone while `agent:prepare` scanned its
payload; both now run the canonical scanner before emission, so every command that
prints structured output shares one detector and one refusal behaviour.

### 8a. Redaction and detection are different jobs

`redactSecrets()` in `scripts/lib/memory.mjs` is a **shaping** filter. It decides
what a human reads. `secret-scan.mjs` is the **detection** system, and it decides
whether to refuse. They are deliberately not the same list, and F5 did not merge
them.

Redaction is a list of `SECRET_SHAPES` regular expressions. Detection is a list of
`DETECTORS`, each with a width, an optional file scope, and optional
`classify`/`refine` steps that decide `REAL_SECRET` versus `PUBLIC_IDENTIFIER`.

Three consequences, all load-bearing:

- **Redaction matches the bare token; detection may need context.** A memory
  record that says "the admin key is `<X>`" has no header and no `key=value` name.
  A pattern anchored to those shapes lets the value through into emitted output.
  The two shapes added in F5 are bare-token patterns for that reason.
- **Redaction is width-matched to detection, deliberately.** The Google shape is
  `\bAIza[0-9A-Za-z_\-]{35}\b` in both layers. It is *not* lengthened, because
  `RUNTIME_VERIFICATION.md` records a Firebase web `apiKey` as a real, documented
  `PUBLIC_IDENTIFIER`, and the scanner already demotes it on frontend paths.
  Redaction must not promote it.
- **The repository's own documentation stays readable.** `SECRET_HANDLING.md`,
  `PROTECTED_PATHS.md` and `RUNTIME_VERIFICATION.md` all mention `uh_live_` and
  `AIza` as prefixes, as `uh_live_...`, or as a placeholder. A pattern that
  redacted those would make the agent's record of its own rule unreadable in the
  records an operator most needs. `tests/redaction-hardening.test.mjs` quotes each
  of those lines and asserts they pass through byte-for-byte.

The two layers are complementary, and the MCP key is the worked example. F5 closed
the redaction gap and recorded that `secret-scan.mjs` had no MCP detector at all —
every shape returned *no finding*. F6 added the `mcp-api-key` detector, so a raw
`uh_live_…` is now both redacted on the way out and refused on the way in. Neither
layer stands in for the other: `tests/secret-scan-fixtures.test.mjs` asserts that a
raw credential is refused by the scanner *and* removed by `redactSecrets()`, and
that `[REDACTED]` and clean content pass through both untouched.

Per-detector verdict coverage lives in `tests/secret-scan-fixtures.test.mjs`, which
pins all sixteen detectors. Before F6 the scanner had fifteen detectors and no
per-detector fixture matrix, so a change to one could silently alter another.

---

## 9. Production boundary

```text
Agent intelligence commands   →  normally repository-local
Production actions           →  owner-controlled
```

| Agent command | Needs production? |
|---|---|
| `agent:prepare`, `agent:route`, `agent:context`, `agent:memory`, `agent:query` | No |
| `agent:index`, `agent:index:check`, `agent:index:stats` | No |
| `check:*` | No — they read committed files and compare them |

No agent intelligence command requires production access, and none should be
described as though it does. The agent may **diagnose, document and recommend**
production changes; it does not apply them. Applying them — dashboard settings,
environment variables, DNS, credential rotation, deploy triggers — is an owner
action.

The one runtime coupling worth knowing: `mcp-server/dist` is committed and loaded
by the backend at runtime. Editing MCP source without rebuilding leaves production
on the old code, and nothing detects it at runtime. `check:generated` is the
detection. **Never hand-edit `dist`**; rebuild with `npm run build:mcp`.

---

## 10. Open owner dependencies

Documented, not resolved. Register:
[`../tasks/OWNER_DECISIONS.md`](../tasks/OWNER_DECISIONS.md) (`OD-01` … `OD-12`);
ownership rules: [`../infrastructure/CONFIGURATION_OWNERSHIP.md`](../infrastructure/CONFIGURATION_OWNERSHIP.md).

```text
Vercel production configuration and the /mcp rewrite
Render blueprint authority — ui-hub-backend-mcp vs ui-hub-mcp
Render admin access and the canonical API-key host
MongoDB credential rotation
Cloudflare configuration
Production VITE_API_URL
CORS production origin policy
Light-mode architecture
```

`check:config` currently reports `7 CONSISTENT / 4 CONFLICT / 0 UNKNOWN`. Each
conflict needs an owner decision with options and evidence. The agent's job is to
report them precisely, not to pick a winner.

---

## 11. Risks and known limits

Recorded, not fixed. Fixing them is not part of documentation work.

| Risk | Consequence | Status |
|---|---|---|
| Frontend typecheck reports `61` errors across `23` files | Pre-existing; a baseline, not a regression | accepted, out of scope |
| `check:tracking` reports untracked Phase 10 files until they are staged | Gate is working as designed | expected until staging |
| ~~`agent:memory --json` does not run the scanner~~ | Closed in Phase 10: both memory and prepare payloads are scanned before emission | resolved |
| S1 bundle coverage is `1/2` for the canonical payment task | One ground-truth-relevant file is absent | accepted precision cost, `DEC-009` |
| `mcp-server/dist` can drift silently from `src` | Production serves stale MCP code | detected by `check:generated` |
| 4 configuration conflicts | Deployment behaviour is ambiguous | owner decision required |
| `import-graph` has `3` unresolved bare-`.js` specifiers | 3 edges unmodelled | known `WARN`, not `FAIL` |
| 5 components have no importer | May be dead or dynamically reached | known `WARN`, not `FAIL` |

---

## 12. Related documents

| Area | Document |
|---|---|
| Agent contract | [`../../agent.md`](../../agent.md) |
| Application architecture | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Workflow procedure | [`../tasks/AGENT_WORKFLOW.md`](../tasks/AGENT_WORKFLOW.md) |
| Commands | [`../tasks/COMMAND_REFERENCE.md`](../tasks/COMMAND_REFERENCE.md) |
| Codebase intelligence | [`../codebase/CODEBASE_INTELLIGENCE.md`](../codebase/CODEBASE_INTELLIGENCE.md) |
| Routing contract | [`../tasks/TASK_ROUTER.md`](../tasks/TASK_ROUTER.md) |
| Context contract | [`../tasks/CONTEXT_BUNDLE.md`](../tasks/CONTEXT_BUNDLE.md) |
| Memory layer | [`../memory/MEMORY_OVERVIEW.md`](../memory/MEMORY_OVERVIEW.md) |
| Security | [`../security/SECURITY_OVERVIEW.md`](../security/SECURITY_OVERVIEW.md) |
| Deployment | [`../infrastructure/INFRASTRUCTURE.md`](../infrastructure/INFRASTRUCTURE.md) |

---

END — AGENT ARCHITECTURE
