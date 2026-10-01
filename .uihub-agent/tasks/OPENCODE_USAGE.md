# OpenCode usage — Phase 8

OpenCode should obtain **focused context before broad source inspection**. The
point is not to search less; it is to know *what to search* first.

Do not assume any OpenCode API beyond running commands in the repository. These
are `npm` scripts and Node CLIs.

## 1. Route before you search

```bash
npm run agent:route -- "Fix a payment verification bug"
```

Read this first. It costs under a second and tells you which subsystem, which
confidence, and which indexes matter.

| Field | What to do with it |
|---|---|
| `categories` | If `UNKNOWN`, stop and ask the user to narrow. Do **not** start scanning. |
| `confidence` | `LOW` means narrow first, not "guess harder". |
| `entities` | These are the real targets. Start here, not with a glob. |
| `protectedAreas` | If any are `CRITICAL`, read `DO_NOT_CHANGE.md` before editing anything. |
| `initialIndexes` | The indexes worth querying. |
| `highCaution` | The task touches owner-reserved paths. Read the rules, then proceed. |
| `unknown.suggestion[]` | Ask one of these instead of exploring. |

Add `--json` to consume it programmatically.

## 2. Get the minimal context bundle

```bash
npm run agent:context -- "Fix WebM template preview"
```

This returns ranked files with a reason for each. Use it as your reading list:

- **`files`** — open these, highest priority first. `P0` is the direct target.
- **`why[]`** — the reason each file was selected. If a reason looks wrong, that
  is signal: your task wording may be ambiguous, not that the ranker is wrong.
- **`protectedAreas`** — `CRITICAL` paths need `DO_NOT_CHANGE.md` first.
- **`knowledge`** — Markdown to read, in order.
- **`validation`** — the commands that must pass. Run them.
- **`emptyReason`** — if this is set, **nothing matched**. Ask the user to
  rephrase or narrow. Do not fall back to a repository-wide search.
- **`dependencies` / `expansionLog`** — what was pulled in and why.

Useful flags:

```bash
npm run agent:context -- --json "<task>"                  # machine-readable
npm run agent:context -- --max-files 20 "<task>"          # widen deliberately
npm run agent:context -- --expand-steps 0 "<task>"         # no expansion
npm run agent:context -- --manifest .tmp/ctx.json "<task>" # persist
```

`--max-files` and `--expand-steps` are the only ways to enlarge a bundle, and
both are recorded. If you raise them, say why in your summary.

## 3. Query the indexes directly

```bash
npm run agent:query -- --list                # every query
npm run agent:query -- feature <slug>
npm run agent:query -- component <Name>
npm run agent:query -- symbol <name>
npm run agent:query -- --json feature <slug>
```

Exit `1` with a usage error on a bad command; import
`.uihub-agent/scripts/query-index.mjs` if you need it as a module.

## 4. When the indexes are stale

```bash
npm run agent:index --stats    # what drifted
npm run agent:index            # regenerate
npm run agent:index:check      # is it fresh?
```

`agent:context` **refuses to run** on a stale index and exits `2`. Do not pass
`--allow-stale` to get past it without saying so — a stale index means the file
list and the source have diverged, and every ranking derived from it is a guess.

## What not to do

```text
Load every knowledge file      → agent:context already picked the relevant ones
Open the whole repository      → the bundle exists so you don't
Guess when confidence is LOW   → ask; the cost of asking is one turn
Treat 0 files as a bug         → read emptyReason, then narrow the task
Edit a CRITICAL path directly  → read DO_NOT_CHANGE.md, then follow it
```

## The loop

```text
route → read the route
      → context → read files by priority
                → protected path? read the rules
                → edit the minimum
                → run bundle.validation
                → regenerate indexes if you changed source
```

If the bundle was wrong, fix the **task wording** or the **routing matrix** —
not by opening more files. A bundle that is missing something is a routing bug
worth reporting.