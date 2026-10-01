# Context routing guide — Phase 8

How routing works, how context is selected, how expansion works, how protected
paths work, how stale indexes are handled, and how a future agent should consume
the result.

Operational detail lives in two places; this document is the model:

- `.uihub-agent/tasks/TASK_ROUTER.md` — the routing contract.
- `.uihub-agent/tasks/CONTEXT_BUNDLE.md` — the bundle contract.

## 1. The problem this solves

An agent handed "fix a payment verification bug" has 485 source files and no
signal. The obvious moves are both bad: read everything (context that exceeds any
model's useful attention, and no priority) or guess (a plausible edit in the
wrong place, confidently).

Phase 7 built the index. Phase 8 makes it actionable: one task in, one ranked and
justified reading list out.

## 2. How routing works

```text
task string
  ↓
intent          verb-led: FIX, ADD, REMOVE, UPDATE, INVESTIGATE…
  ↓
evidence        strong: features, roles, MCP tools, regex paths, concepts,
                identifiers.  weak: vocabulary tokens only.
  ↓
categories      18-category matrix; strong evidence required
  ↓
entities        the concrete targets: components, symbols, services, hooks,
                routes, explicit file paths
  ↓
surface         derived from the resolved evidence, not from the wording
  ↓
confidence      HIGH / MEDIUM / LOW, with a stated reason
```

**Strong before weak.** Weak evidence cannot select a category; it only
strengthens an already-strong match. This is why "Why is the site loading
slowly?" returns `UNKNOWN` — `PERFORMANCE` is an overlay on a subsystem, and the
task named none.

**Identifiers are shape-aware.** `TemplatePreview` splits into `template` and
`preview` before frequency lookup. Action words (`fix`, `refactor`, `add`) are
stripped before resolution, because otherwise "Refactor ParticleSphereRefactor"
resolves a component the user never named.

**Uncertainty is reported, not hidden.** No strong evidence → `UNKNOWN` with
suggestions to narrow. `TemplateCard` does not exist in this repository, so the
route says so and offers the real near-miss rather than inventing a file.

## 3. How context is selected

Relevance ranks the indexed files against the task. Evidence is tiered, because
"contains a matching token" is not the same as "is the thing you named":

| Tier | Weight | Example |
|---|---|---|
| exact name | highest | `EXACT_COMPONENT_NAME`, `EXACT_SYMBOL_NAME` |
| partial name | high | name contains the term |
| structural | medium-high | feature ownership, route, page relationship |
| rare path segment | medium | distinctive segment named |
| common path segment | low | `components`, `utils`, `data` — says almost nothing |
| vocabulary | lowest | corroboration only |

Two corrections made this usable in practice:

- **Self page relationships are excluded.** A file and the page that renders it
  are trivially "related"; counting that made every file on a page look
  relevant. Transitive page-reaches-file is kept but demoted to weak.
- **Rare versus common path segments are separated.** Before this, `utils/`
  scored like `CloudScroll/`.

Result: "Fix a payment verification bug" returns 11 files (2.3% of the
repository), not 17, and ranks the middleware first when asked for the auth
middleware.

The default target is 5–15 files. These are guidelines with reasons, not caps —
agent.md 8.13 refuses hard limits because a database migration legitimately needs
more context than a button tweak. Widening requires an explicit `--max-files`.

## 4. How expansion works

A file may be added for **seven reasons only**:

1. `DIRECT_DEPENDENCY` — a named file imports it
2. `RELEVANT_CONSUMER` — it imports a named file
3. `SHARED_SERVICE` — two or more named files share it
4. `API_DEPENDENCY` — a named endpoint is handled there
5. `STATE_DEPENDENCY` — a context/store/provider two named files import
6. `PROTECTED_RELATIONSHIP` — a protected path depends on it
7. `TEST_DEPENDENCY` — a test imports a named file

Never for: proximity, a shared name, the same directory, or looking relevant.
Those denials are enforced in code, because a rule that exists only in prose gets
forgotten.

Three properties make expansion trustworthy:

- **Candidates come from the graph, not from the ranking.** The ranking's
  rejected list is empty by construction for a task that named one file, so
  expanding from it could never run.
- **The most specific trigger wins.** A service shared by two named files is
  recorded as `SHARED_SERVICE`, not the broader `DIRECT_DEPENDENCY`.
- **A trigger must relate to the task.** `PROTECTED_RELATIONSHIP` requires the
  task to have named something. Without that guard it admitted anything reachable
  from protected config — for an XSS-in-comment task with no matching source, it
  returned payment routes. Technically justified, entirely irrelevant.

Every addition is logged with the step, path, trigger and human-readable reason,
and `stopReason` always says why expansion stopped — including how many
justified files were left unopened.

## 5. How protected paths work

Tiers are read from `.uihub-agent/rules/PROTECTED_PATHS.md` at runtime. No tier
table is duplicated in code, so editing the rule file changes behaviour
immediately and there is no second copy to drift.

| Tier | Meaning |
|---|---|
| `CRITICAL` | Payment, auth, deployment, secrets. Read `DO_NOT_CHANGE.md` first. |
| `HIGH_RISK` | Config and entitlements. Owner review expected. |
| `GENERATED` | Build output. Never hand-edited. |
| `NORMAL` | Ordinary source. |

A protected path is always reported with its tier and the rule text. It is never
silently ranked as ordinary context, and a `CRITICAL` path sets
`highCaution` / `ownerActionRequired` with reasons.

Escalation marks a task `HIGH CAUTION` — it does not block it. Blocking is the
agent's judgement, informed by rules it has actually read.

## 6. How stale indexes are handled

The index is a snapshot. If it drifts from the source, every ranking derived from
it is a guess — confidently wrong.

```text
agent:context
  ↓
pre-check against the committed manifest
  ├─ fresh    → proceed
  └─ stale    → exit 2, "run npm run agent:index"
```

The gate is on by default and `--allow-stale` is the explicit, visible opt-out.
`agent:index:check` verifies the committed artifacts match what the generator
produces from current source, including files added since the last run.

## 7. How to consume the context

```bash
npm run agent:route -- "<task>"      # decide
npm run agent:context -- "<task>"    # read list, with reasons
```

Then:

1. **Read `categories`.** `UNKNOWN` means ask, not explore.
2. **Read `protectedAreas`.** `CRITICAL` means read `DO_NOT_CHANGE.md` first.
3. **Read `files` in `priority` order.** `P0` is the target; `P5` was pulled in
   by expansion, so treat it as background.
4. **Read `why[]`.** It is the audit trail. A reason you disagree with means the
   task wording is ambiguous.
5. **Read `knowledge`**, in order, if you need the rules.
6. **Run `validation`** before reporting success.

Two things not to do:

- Do not treat an empty bundle as a bug. Read `emptyReason` — it records what
  was searched for — then ask the user to narrow the task.
- Do not open files the bundle did not name. If one is genuinely needed, that is
  a routing gap worth reporting, not something to paper over with a wider search.

## Honest limitations

- **The strongest context in the simulation set is 6.4% of the repository**
  ("Add an MCP tool", 31 files) — defensible, since it spans three layers, but
  the weakest result and the first thing to tighten.
- **Most test files are invisible to the router.** 17 of 18 test files live
  outside `SOURCE_ROOTS`, so `TEST_DEPENDENCY` fires rarely. Fixing it would
  change the indexed total and invalidate the 481/485 reconciliation documented
  in `CONFLICTS.md` A24, so it was recorded rather than changed in Phase 8.
- **Heuristics, not a language model.** The router matches terms, paths and
  relationships. It is fast, deterministic and explainable, and it will
  mis-route a task whose vocabulary does not appear in the repository. That is
  what `UNKNOWN` and near-misses are for.