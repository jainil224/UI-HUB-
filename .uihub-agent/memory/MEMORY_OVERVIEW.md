# MEMORY OVERVIEW

**Owner:** Phase 10 — Durable Memory, Change Intelligence & End-to-End Agent Validation
**Status:** CANONICAL for the memory layer
**Scope:** what is stored here, where it comes from, and what it may never be used for

---

## 1. Purpose

This directory is the agent's durable memory: historical engineering knowledge
recorded so a future AI session does not rediscover facts this repository has
already paid for.

A future session should be able to ask "has this exact problem happened here
before, and what was the answer?" and get a ranked, sourced, dated answer instead
of a fresh repository-wide guess.

Memory is **not** a faster copy of the codebase. The codebase is the truth;
memory is the record of how that truth got that way.

---

## 2. What memory is, and what it is not

Memory is:

```text
Historical engineering knowledge
```

Memory is not:

```text
Current runtime truth
```

The rule in one line:

```text
Memory is historical context.
Memory does not override current repository evidence.
```

The distinction is load-bearing. A memory record says "on a past date, this was
observed or decided". It does not say "this is now true". Where the two differ,
current evidence wins and the memory record is marked `SUPERSEDED` rather than
deleted — deleting it would remove the evidence that the question was ever
asked and answered differently.

This is why the layer is split into dated, individually-stamped records instead
of one running document. `ARCHITECTURE.md` describes the system as it is;
`memory/ARCHITECTURAL_DECISIONS.md` describes how it came to be that way.

---

## 3. Memory categories

| File | Answers | Written when |
|---|---|---|
| `MEMORY_OVERVIEW.md` | What is this layer, and how is it used | Once, then amended |
| `TASK_HISTORY.md` | What did an AI task do, and did it work | After every completed AI task |
| `ARCHITECTURAL_DECISIONS.md` | Why does the system work this way | A verified structural decision is made |
| `LESSONS_LEARNED.md` | What should be done differently | A mistake generalises beyond its task |
| `KNOWN_FIXES.md` | How was this recurring problem solved | A fix is likely to recur |
| `KNOWN_FAILURES.md` | What broke, how it was detected, what it cost | A failure mode is worth not repeating |
| `REGRESSION_HISTORY.md` | What regressed, how it was found, what guards it now | A regression is found and fixed |
| `LIMITATIONS.md` | What is still not solved | Continuously, and never softened at phase close |

Machine-readable companions, so records can be validated and queried rather
than only read:

- `TASK_RECORD_SCHEMA.json`
- `CHANGE_RECORD_SCHEMA.json`
- `DECISION_RECORD_SCHEMA.json`

### Why these are separate files and not one `MEMORY.md`

The contract for this phase explicitly forbids a single giant memory dump. The
operational reason is retrieval: a memory system that must read everything to
answer one question will eventually be too slow to read at all, and its size will
pressure every future session toward skipping it. Separating by category means a
query can touch lessons and decisions without loading task history.

---

## 4. Source of truth and precedence

When memory disagrees with the repository, the repository wins. The full ladder:

```text
Current runtime evidence
>
Current source/configuration
>
Current generated intelligence
>
Current knowledge documentation
>
Durable memory
>
Historical assumptions
```

An example of why the top of the ladder matters: the Phase 1 conflict register
recorded "frontend has no tests at all — 0 test files" as `CONFIRMED`. That was
true when observed and is now false. The register is preserved as the Phase 1
record it is; `memory/` records the supersession. Rewriting the original finding
would have destroyed the record of what was believed at the time.

The machine-readable form of this ladder lives in `scripts/lib/memory.mjs` as
`SOURCE_PRECEDENCE`, and is asserted by `tests/memory.test.mjs`.

---

## 5. Freshness

Every record carries `timestamp`, `status`, and `source`, and is classified:

| Status | Meaning | In force? |
|---|---|---|
| `CURRENT` | Verified against the repository and still holds | yes |
| `RESOLVED` | A question was asked and answered; the answer is settled policy | **yes** |
| `HISTORICAL` | Was true, not re-verified, not contradicted | no |
| `SUPERSEDED` | Was true, current evidence says otherwise | no |
| `UNKNOWN` | Recorded without verification; never treated as fact | no |

`UNKNOWN` exists because "someone believed this at the time" and "this is true"
are different statements, and collapsing them is how a wrong belief becomes
infrastructure. A record that cannot be verified must say so.

**`RESOLVED` is active policy, not a synonym for "closed".** It marks a question
that was deliberately left open and has now been settled by evidence, as opposed
to a decision that was superseded. A settled decision still governs behaviour, so
`RESOLVED` records must not be grouped as historical or flagged as stale — which
is exactly what happened to `DEC-009`, resolved *against* widening expansion
subjects: filing it as "no longer current" would have buried a live ruling under
the heading that means its opposite.

`isActivePolicy()` in `scripts/lib/memory.mjs` is the single predicate for this,
so `RESOLVED` is correct everywhere by construction rather than by each caller
remembering to handle it.

**Never** treat an old record as current architecture. Verification is an
explicit act, recorded in the status transition, not inferred from age.

### 5a. A record's freshness is independent of the index's

Two different things can be out of date: a memory record, and the generated
indexes. They are tracked separately and must not be allowed to cover for each
other.

Simulation confirmed the failure mode that this section exists to prevent. With
a source change and a stale index, plus a `CURRENT` record asserting that
`backend/src/middleware/auth.js` must be opened for every payment fix:

- `agent:prepare` **refuses** — exit `2`, no payload.
- Under `--allow-stale` the payload is emitted, but carries
  `suppliers.indexFreshness: "STALE"`, and `auth.js` is still **not** recruited.
- `memoryLimit 0` and the default run still produce identical context and
  identical routing.

The invariant that makes this hold is **memory never substitutes for missing
current evidence**. When the indexes are stale, the honest answer is "the tree
has moved, re-run `agent:index`" — not "a record happens to describe this area".
Memory may be *shown* alongside a stale payload, but the staleness label stays
attached and the routing decision stays where it was.

Note also what `suppliers` does *not* contain: memory is not one of the
current-data suppliers, and it never appears there even when records are
retrieved. A field's absence is part of the contract.

---

## 6. Retrieval

```bash
npm run agent:memory -- "WebM template preview"
npm run agent:memory -- --json "WebM template preview"
```

Retrieval ranks results P0–P5 and cites the evidence for each rank:

```text
P0  same file or exact subsystem
P1  same feature
P2  same route or API
P3  same task category
P4  related architectural decision
P5  general lesson
```

Retrieval is evidence-based — features, components, routes, services, error
signatures, technologies, categories, file paths — not keyword-only, so that
"template preview performance" reaches `TemplatePreview` and WebM history
without also dragging in unrelated payment work.

Retrieval never returns the whole database. A memory query that answers with
everything has answered nothing, and it costs the future session more context
than it saves.

---

## 7. Update process

After meaningful work:

```text
Change
  ↓
Validate
  ↓
Decide whether knowledge actually changed
  ↓
Write memory if durable
```

"Meaningful" is the filter. A CSS typo is not an entry. An entry is warranted
when the work produced a fact that will still be true next month and that a
future session would otherwise have to re-derive. The threshold is deliberately
high: memory that is padded with trivia stops being read.

Memory records the event, decision, reason, lesson, and relationship — then points
at the current documentation for the current detail. It does not copy
`architecture/ARCHITECTURE.md`, `APIs/API_OVERVIEW.md`, or
`design-system/DESIGN_SYSTEM.md` into itself. Duplicated documentation drifts,
and a stale copy is worse than no copy because it looks authoritative.

---

## 8. Negative knowledge

Memory records what **not** to do, alongside what to do. Approaches that were
tried and rejected are recorded so a future session does not re-run the same
experiment:

```text
Do not promote connectivity into relevance scoring.
Do not globally expand from relevance-admitted subjects.
Do not force test discovery where evidence does not exist.
Do not treat a protected path as automatically relevant.
Do not treat an example in a specification as a repository fact.
```

This is often more valuable than the fixes, because the fixes are visible in the
current code while the rejected paths are only visible here.

---

## 9. Privacy and security

Memory must never store passwords, API keys, tokens, private keys, credentials,
production secrets, or connection strings containing credentials.

Enforcement is not advisory:

- `scripts/secret-scan.mjs` scopes to every file git could commit, so a memory
  file is scanned the moment it is tracked. Scope is by construction, not by an
  allowlist of directories.
- `check:tracking` requires memory files to be tracked, so a memory file cannot
  quietly sit in an ignored directory where it is neither scanned nor reviewed.
- `scripts/lib/memory.mjs` excludes secret-shaped values from query output, so a
  record that somehow acquired one is not reprinted into a transcript.

---

## 10. Historical status

Everything in this directory is Phase 10 work. The knowledge it summarises
accumulated across Phases 1–9, which are closed. Nothing in this layer is a live
service, a deployment, or a runtime authority.

The current-state documents remain authoritative for current state:
[ARCHITECTURE.md](../architecture/ARCHITECTURE.md),
[CODEBASE_INTELLIGENCE.md](../codebase/CODEBASE_INTELLIGENCE.md),
[TASK_ROUTER.md](../tasks/TASK_ROUTER.md),
[CONTEXT_BUNDLE.md](../tasks/CONTEXT_BUNDLE.md).

---

END — MEMORY OVERVIEW