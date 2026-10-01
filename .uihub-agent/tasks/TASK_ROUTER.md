# .uihub-agent/tasks/TASK_ROUTER.md
# Phase 8 Unit A — Task Router Contract

## Purpose

Turn one natural-language task into a **deterministic, explainable** routing
decision: which subsystems are involved, how sure we are, and which indexes and
knowledge documents to read first — without opening the repository.

The router never returns "read everything". Its output is a narrow, ordered set
of leads. Where it cannot decide, it says `UNKNOWN` and explains how to narrow
the task rather than guessing.

Implemented by:

| Module | Role |
|---|---|
| `.uihub-agent/scripts/lib/router-matrix.mjs` | The 18-category matrix: keywords, aliases, primary indexes, source roots. Source of truth for `ROUTING_MATRIX.json`. |
| `.uihub-agent/scripts/lib/intel.mjs` | Index access, camelCase-aware tokenization, entity resolution, token frequency, graph facade. |
| `.uihub-agent/scripts/lib/router.mjs` | `classify(task)` — the decision itself. |
| `.uihub-agent/scripts/route-task.mjs` | CLI: `npm run agent:route -- "<task>"`. |

`.uihub-agent/tasks/ROUTING_MATRIX.json` is **generated** from
`router-matrix.mjs`. Editing the JSON is not supported — `check-index.mjs`
compares the two and fails if they disagree.

## Input

```text
npm run agent:route -- "Fix WebM template preview"
npm run agent:route -- --json "Edit frontend/src/components/templates/TemplatePreview.tsx"
```

- A task string. Nothing else is required.
- `--json` emits the machine-readable route.

No network, no environment, no wall-clock. Same input ⇒ same output.

## Classification

Evidence is tiered, and a category requires **strong** evidence:

**Strong** — feature hits (`FEATURE_MAP`), role matches, MCP tool and integration
names, regex path matches, concept phrases (XSS, deployment, design tokens,
README/changelog), matrix keywords and `FEATURE_ALIASES`.

**Weak** — plain vocabulary tokens. Weak evidence alone cannot select a
category; it only strengthens an already-strong one.

A task may resolve to **several** categories, ordered strongest-first.

Two exceptions, both deliberate:

- **Overlays.** `PERFORMANCE` and `TESTING` are overlays, not surfaces. They
  attach to a real subsystem ("auth middleware" ⇒ `AUTHENTICATION` +
  `PERFORMANCE`), because "make it faster" identifies no subsystem on its own.
- **Fast path.** An explicit repository path in the task resolves directly,
  ahead of keyword scoring, and skips expansion.

Identifier resolution is shape-aware:

- camelCase and PascalCase are split into words before frequency lookup, so
  `TemplatePreview` matches `template` *and* `preview` instead of only the
  compound.
- Action words (`refactor`, `fix`, `add`, `remove`, `rename`, `update`) are
  stripped from identifier tokens before resolution. Without this, "Refactor
  ParticleSphereRefactor" resolved the component and returned it as if the user
  had named it.

## Routing

`classify()` returns:

- `categories` — ordered, strongest first
- `surface` — an **array** of `FRONTEND` / `BACKEND` / `MCP` / `DATABASE` /
  `CLI` / `DEPLOYMENT` / `DOCUMENTATION` / `INFRASTRUCTURE`, derived from
  resolved evidence rather than from the wording of the task. A payment bug
  legitimately spans both `BACKEND` and `FRONTEND`, so this is a list.
- `featureCandidates` — `FEATURE_MAP` slugs
- `entities` — components, symbols, services, hooks, routes and explicit files,
  each carrying its own `how` string and a `strength` (`exact` / `fuzzy`)
- `knowledge` — document paths to read, in priority order. The reason each was
  chosen is the category that pulled it in, available in `candidates[]`
- `protectedAreas` — protected paths touched, with tier
- `initialIndexes` — the first indexes to load, from the matched categories
- `candidates` — per-category, the `strong[]` and `weak[]` evidence that produced
  the match. This is the audit trail for the ranking table above.
- `highCaution` / `ownerActionRequired` — set when the task touches paths
  `DO_NOT_CHANGE.md` reserves for the owner, with reasons

Ranking evidence is also tiered, because "matched a token" is not the same as
"is the thing you named":

| Evidence kind | Weight | Meaning |
|---|---|---|
| `EXACT_COMPONENT_NAME` / `EXACT_SYMBOL_NAME` | highest | the user named this entity |
| partial component/symbol match | high, lower still | name contains the term |
| feature ownership, route, API, page relationship | medium-high | structural |
| `PATH_SEGMENT_RARE` | medium | a distinctive path segment was named |
| `PATH_SEGMENT` (common) | low | `components`, `utils`, `data` tell us almost nothing |
| vocabulary token | lowest | weak corroboration only |

A page relationship to the file's own page is excluded, and transitive
page-reaches-file reachability is demoted to weak non-substantive evidence.
Before this, every file looked related to every file on the same page, and
`PATH_SEGMENT_RARE` did not exist — so common directory names scored as highly
as distinctive ones.

## Confidence

Three levels, plus a reason. Never a number or percentage — a fabricated `0.87`
implies a precision the heuristic does not have.

Confidence is derived from two counts, not from vibes: how many **strong**
category confirmations the task earned, and how many **indexed entities** it
resolved.

| Level | Condition | Example `confidenceWhy` |
|---|---|---|
| `LOW` | No strong category confirmation | "only wording matched; no category rule was confirmed by the index" |
| `HIGH` | ≥1 strong category **and** ≥2 entities resolved | "2 indexed entities resolved and 2 category/categories confirmed" |
| `MEDIUM` | ≥1 strong category and exactly 1 entity resolved | "exactly one indexed entity resolved (1); a single confirmed signal" |

So "Fix a payment verification bug" is `HIGH` — it confirmed two categories and
resolved two entities — without naming a single file. Conversely, one resolved
entity alone caps at `MEDIUM`, because a single signal can be a coincidence.

`UNKNOWN` is a category, not an excuse to guess. When no category has strong
evidence the router returns `UNKNOWN` with `confidence: "LOW"`,
`unknown.why` and `unknown.suggestion[]` — for example asking whether
"comment" meant `components/comments` or a comment field.

Near-misses are offered only for PascalCase/camelCase identifiers that were not
found, and are filtered so they do not become noise. `TemplateCard` is the
worked example: no such entity exists, and the nearest symbol is the local
`CurrentTemplateCard` at `frontend/src/components/templates/TemplateSimilarRail.tsx:221`.

## Context expansion

The router proposes leads; the context builder decides what to add. Adding a
file is permitted for **seven triggers only** — `DIRECT_DEPENDENCY`,
`RELEVANT_CONSUMER`, `SHARED_SERVICE`, `API_DEPENDENCY`, `STATE_DEPENDENCY`,
`PROTECTED_RELATIONSHIP`, `TEST_DEPENDENCY` — each recorded in `expansionLog`
with the step, path, trigger and human-readable justification.

Two properties matter more than the list:

- **Candidates come from the graph, not from the relevance filter.** Expanding
  "pending files" from the filtered list could only ever reach files that had
  already been considered and rejected — the candidate universe is now the
  import graph's actual consumers and dependencies.
- **Expansion can be turned off**, and when it is, `stopReason` says so.

Full contract: `.uihub-agent/tasks/CONTEXT_BUNDLE.md`.

## Protected paths

Tiers are read from `.uihub-agent/rules/PROTECTED_PATHS.md` at runtime — the
rule file is the single source of truth, and no tier table is duplicated in
code. The parser handles parenthetical annotations, arrow-separated entries,
wildcards, directory trees and `/**`.

`CRITICAL`, `HIGH_RISK`, `GENERATED` and `NORMAL` resolution is covered by
tests. A protected path is reported with its tier and rule text; it is never
silently ranked as ordinary context.

Non-negotiable rules live in `.uihub-agent/rules/DO_NOT_CHANGE.md`.

## Output

```json
{
  "task": "Fix a payment verification bug",
  "intent": { "intent": "FIX", "why": "2 intent verb(s) matched" },
  "categories": ["PAYMENT", "COMPONENT"],
  "surface": ["BACKEND", "FRONTEND"],
  "confidence": "HIGH",
  "confidenceWhy": "2 indexed entities resolved and 2 category/categories confirmed",
  "featureCandidates": ["payment-routes"],
  "entities": { "explicitFiles": [], "components": [], "symbols": [] },
  "knowledge": [".uihub-agent/rules/DO_NOT_CHANGE.md", "…"],
  "protectedAreas": [{ "path": "backend/src/routes/paymentRoutes.js", "tier": "CRITICAL", "via": "PAYMENT", "rule": { "tier": "CRITICAL", "rule": "…", "source": ".uihub-agent/rules/PROTECTED_PATHS.md" } }],
  "evidence": ["…"],
  "initialIndexes": ["API_MAP", "SERVICE_MAP", "INTEGRATION_MAP", "COMPONENT_MAP", "SYMBOL_INDEX", "PAGE_COMPONENT_INDEX"]
}
```

Human output is a compact table; `--json` gives the above. Confidence is an
integer-ranked enum, never a percentage.

## Failure behavior

The router degrades honestly. It does not invent an answer.

| Situation | Behavior |
|---|---|
| No strong category evidence | `categories: ["UNKNOWN"]`, `surface: "UNKNOWN"`, `confidence: LOW`, plus `unknown.why` and `unknown.suggestion[]`. |
| Identifier not found, PascalCase/camelCase | Near-misses returned, clearly labelled as not-the-thing. |
| Identifier not found, ordinary word | Nothing invented; the term may still corroborate via weak evidence. |
| Task names a non-existent path | Not treated as a file hit. Reported in `unknown`/evidence; never silently substituted with a similar path. |
| Empty or whitespace task | Usage error, exit 1, via `UsageError`. |

`agent:context` adds two gates: it exits `2` when indexes are stale (unless
`--allow-stale`) and `3` when the serialized bundle trips the secret scanner.
`agent:route` uses `0` success and `1` usage error — an `UNKNOWN` route is a
successful route, not a failure, because "I could not classify this" is a
legitimate answer that a caller may want to inspect.

## Determinism

The router reads committed indexes and performs no I/O against the working tree
beyond them. There is no randomness, no clock and no ordering dependence on
filesystem enumeration in the decision path — the same task produces the same
route on any machine. The generated `ROUTING_MATRIX.json` is
freshness-checked by `npm run agent:index:check`, so the matrix the router uses
is provably the matrix that was committed.