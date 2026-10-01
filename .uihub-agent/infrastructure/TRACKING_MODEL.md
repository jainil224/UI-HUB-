# Tracking Model

Phase 6, task 6.10. What is tracked, what is ignored, and — more importantly —
**why** each decision was made. Every rule here is enforced by
`npm run check:tracking`.

---

## The rule that drives everything

> **Track a file if its content is needed to reproduce a working checkout or to
> audit a past decision. Ignore it if it is a local artifact, a credential, or a
> per-developer preference.**

Three consequences, each of which is a real disagreement in this repository:

- **CI configuration is tracked.** `.github/` was gitignored in an earlier state.
  A repository whose CI definition is not in the repository cannot be audited,
  cannot be reviewed, and cannot be restored after a force-push.
- **Credentials are ignored, and ignored files are not scanned for leaks.** The
  secret scanner examines git-visible files only. Scanning `backend/.env` would
  report the developer's own machine at them, not a leak.
- **Local tooling is ignored even when it is careful and useful.** `.agents/`,
  `.claude/`, `.opencode/` and `component-specs/` are personal workflows. They
  belong to whoever set them up, not to the shared history.

---

## Classification

### Tracked — code and configuration

| Path | Why |
|---|---|
| `backend/src/**`, `mcp-server/src/**`, `frontend/src/**`, `cli/src/**` | The product |
| `render.yaml`, `mcp-server/render.yaml`, `vercel.json` | Deployment definition; a deploy is unreproducible without it |
| `frontend/package.json`, `backend/package-lock.json`, … | Reproducible installs |
| `.github/**` | CI definition. **Phase 6 removed the ignore.** |
| `**/.env.example` | Contract for which variables exist. Placeholders only — `security/SECRET_HANDLING.md` |
| `.uihub-agent/**` | The audit trail |

### Tracked — build output (deliberate)

| Path | Why |
|---|---|
| `mcp-server/dist/**` | **81 files.** Render runs `node dist/index.js` and does **not** build. Without tracked output, a clone cannot run the MCP server, and a deploy depends entirely on the build step succeeding. |
| `cli/dist/**` | **23 files.** Same reasoning; the CLI is distributed as built output. |

The cost is real: output can go stale. That is managed, not ignored —
`npm run check:generated` rebuilds into a temporary directory and compares the
entire tracked tree, so a stale artifact fails CI. See
`GENERATED_ARTIFACTS.md`.

### Ignored — build output

| Path | Why |
|---|---|
| `backend/dist/**`, `frontend/dist/**` | Rebuilt on every deploy; committing them adds noise and no reproducibility, because both platforms build server-side. |
| `node_modules/**` | Installed |

The asymmetry is intentional and load-bearing: **MCP and CLI output is tracked
because those runtimes are not rebuilt by the host platform; backend and
frontend output is not, because those hosts rebuild.**

### Ignored — credentials

| Path | Why |
|---|---|
| `backend/.env`, `.env`, `.env.local`, … | Credentials. Gitignoring them is what makes them safe to keep on disk. |
| `backend/service-account.json` | Firebase Admin private key. Ignored at `backend/.gitignore:13`. |

### Ignored — local tooling

| Path | Why |
|---|---|
| `.agents/**`, `.claude/**`, `.opencode/**` | Per-developer agent workflows |
| `component-specs/**` | Per-developer drafts |
| `.cursor/**`, `.vscode/**` | Editor-local |

These are preserved on disk untouched and never staged. Phase 6 did not delete
or modify them.

---

## Precedence

When two files both affect the result, and one is tracked while the other is
ignored:

> **The tracked file is the authority for what other agents should do. The
> ignored file is the authority for what this machine is doing.**

A developer's `.env` may pin a database the repository never mentions. That does
not make it part of the project's contract, and a change to it must not be
documented as a project change.

---

## Why `.github/` was un-ignored

It was ignored, so `git ls-files .github` returned **nothing** while the file
existed locally. Consequences:

1. **CI was unauditable.** No one could review a change to the CI definition.
2. **CI could not be restored.** After a force-push, a clean checkout had no CI.
3. **`check:tracking` reported the workflow as missing**, because the file was
   invisible to git, not absent from disk.

`.gitignore` now carries an explicit `# .github/ must remain tracked — see
.uihub-agent/infrastructure/TRACKING_MODEL.md` comment above the removal, so the
ignore is not silently re-added by someone tidying the file.

**This was verified, not assumed.** Re-adding `.github/` to `.gitignore` made
`check:tracking` fail on `ci-trackable`, and the file was then restored
byte-identical.

---

## Changing this model

`check:tracking` encodes the table above as 22 rules. If you change it, change
the rules and this document in the same commit. If a new rule is added, prove it
fails for the right reason before relying on it — a validator that has never
failed has not been tested.

## Related

- `GENERATED_ARTIFACTS.md` — freshness enforcement for tracked output
- `../security/SECRET_HANDLING.md` — why ignored files are not scanned
- `../rules/PROTECTED_PATHS.md` — path risk classes
- `../../.gitignore`, `../../backend/.gitignore` — the rules as code
- `../../.uihub-agent/scripts/check-tracking.mjs` — the 22 rules