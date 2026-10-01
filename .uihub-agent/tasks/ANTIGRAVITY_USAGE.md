# Antigravity usage — Phase 8 (tool-agnostic)

The same workflow any coding agent should follow, expressed without reference to
any specific tool, IDE or API. If a step cannot be performed, skip it and say so
— do not substitute a repository-wide search.

## The workflow

```text
Task
  ↓
Route      — what subsystem, what confidence, what is protected
  ↓
Context    — the minimal set of files, each with a stated reason
  ↓
Inspect    — open only those files, in priority order
  ↓
Execute    — the smallest change that fixes the task
  ↓
Validate   — run the commands the bundle named
```

## Route

```bash
npm run agent:route -- "<task>"
```

- `categories: ["UNKNOWN"]` → **stop and ask.** Do not explore the repository to
  work around it.
- `confidence: "LOW"` → narrow before proceeding.
- `protectedAreas` with `CRITICAL` tier → read
  `.uihub-agent/rules/DO_NOT_CHANGE.md` first.
- `highCaution: true` → owner-reserved paths are involved; proceed only within
  what the rules allow.
- `unknown.suggestion[]` → ask one of these questions.

## Context

```bash
npm run agent:context -- "<task>"
```

Treat the result as a **reading list, not a suggestion**:

- `files` — read in `priority` order. `P0` first.
- `why[]` — why each file is here. Disagree with a reason? The task wording is
  probably ambiguous.
- `knowledge` — read these Markdown files, in order.
- `dependencies` — what was pulled in and why.
- `validation` — the commands that must pass. They are not optional.
- `emptyReason` — nothing matched. Ask for a narrower task; never fall back to a
  broad search.

Raise the size of a bundle only deliberately:

```bash
--max-files <n>          # widen the ranked set
--expand-steps <n>       # allow evidence-gated expansion
--manifest <path>        # persist for another step to consume
--json                   # machine-readable
```

Record it when you do. A large context should be a decision, not a default.

## Inspect

Open the files the bundle named. If the change turns out to need something the
bundle did not list, that is a **routing gap** — note it, and prefer expanding
via the bundle's own rules over hand-picking neighbours.

## Execute

Make the smallest change that resolves the task. Respect:

- `.uihub-agent/rules/DO_NOT_CHANGE.md` — owner-reserved paths.
- `.uihub-agent/rules/PROTECTED_PATHS.md` — `CRITICAL` / `HIGH_RISK` tiers.
- Frontend typecheck baseline: **61 errors across 23 files**, unchanged. Do not
  fix them here.

## Validate

Run what `bundle.validation` lists. Then:

```bash
npm run agent:index:check   # indexes match source
npm run check:index         # indexes agree with each other
```

If you changed source, regenerate the indexes:

```bash
npm run agent:index
```

A stale index is not a formality: `agent:context` refuses to run against one
(exit `2`) because every ranking derived from a stale index is a guess.

## Safety

The context loader never includes `.env`, `.env.local`, private keys, production
connection strings or credentials, and every emitted bundle is scanned before it
is written. If the scanner trips (exit `3`), do not work around it — remove the
secret.

## Exit codes

| Code | Meaning | Response |
|---|---|---|
| 0 | Success | Continue. |
| 1 | Usage error | Fix the command. |
| 2 | Stale index | Regenerate. Do not use `--allow-stale` silently. |
| 3 | Secret detected | Stop and remove it. |

## The rule underneath all of it

**A file may be opened only if something can say why it should be.** If you
cannot state the reason, you are guessing — and the honest move is to ask, not
to widen the search.