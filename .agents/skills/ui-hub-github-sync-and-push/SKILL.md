---
name: ui-hub-github-sync-and-push
description: >
  ONLY activate when the user explicitly requests a Git or GitHub push, commit, sync,
  or publish action for UI-HUB (jainil224/UI-HUB-) or UI-HUB-MCP (jainil224/UI-HUB-MCP-).
  Common trigger phrases: "use UI HUB GITHUB SYNC AND PUSH skill", "push the code using AI",
  "push my code", "sync the MCP repo", "push both repositories". ROUTES EVERY CHANGE TO THE
  RIGHT REPO: MCP server changes go to UI-HUB-MCP-, main website changes go to UI-HUB-.
  STRICT ISOLATION: No other vibe, skill, or coding workflow is permitted to invoke or
  auto-trigger this skill. Enforces repository separation, MCP mirror/publish procedure,
  cross-repo contract validation, secret safety, and mandatory user permission before git push.
---

# UI-HUB GitHub Sync & Push Skill

## 1. Purpose & Repository Map

This skill governs all Git and GitHub operations for the two UI-HUB repositories. It exists to
answer ONE question: **"where does this change go?"** and then push the right code to the right repo.

| Repo Alias | GitHub Remote | Local Working Tree | What Lives There |
|---|---|---|---|
| **MAIN_UI_HUB** | `jainil224/UI-HUB-` | `C:\Users\Admin\Documents\GitHub\UI-HUB-\` | Main website: `frontend/`, `backend/`, `api/`, `cli/`, `docs/`, `public/`, root config (package.json, README.md, vercel.json, render.yaml, .vercelignore, .gitignore, MCP.md), `.agents/` — **PLUS the MCP server working copy under `mcp-server/`** |
| **MCP_SERVER** | `jainil224/UI-HUB-MCP-` | `C:\Users\Admin\Documents\GitHub\UI-HUB-MCP-\` | Standalone MCP server: `src/`, `scripts/`, `tests/`, `dist/`, Dockerfile, package.json, tsconfig.json, vitest.config.ts, render.yaml, `.env.example`, `.gitignore` + repo-only files: `README.md`, `MCP.md`, `KEEPALIVE.md`, `.github/workflows/keep-alive.yml` |

> **IMPORTANT — READ THIS FIRST: The MCP code has TWO homes**
>
> The MCP server source code is **edited inside the `mcp-server/` subfolder of the UI-HUB- repo**
> (it must live there so the frontend ↔ MCP data sync scripts can run). But its **official,
> published home is the UI-HUB-MCP- repo**. When the user invokes this skill, MCP changes made in
> `UI-HUB-\mcp-server\` are **mirrored into `UI-HUB-MCP-\`** and pushed there. See §3.

---

## 2. Change → Repository Router (Classify First, Always)

> **This is the most important section. Before ANY git operation, classify the changed files
> and decide which repository owns them. Never mix the two repositories in one commit.**

### 2.1 Classification Table

| If the user's changes touch... | The change belongs to... | Publish action |
|---|---|---|
| `mcp-server/**` (src, scripts, tests, dist, Dockerfile, package.json, etc.) | **MCP_SERVER** (`UI-HUB-MCP-`) | AI mirrors + commits + pushes `UI-HUB-MCP-` (after approval). ALSO committed in `UI-HUB-` working tree. |
| `frontend/**`, `backend/**`, `api/**`, `cli/**`, `docs/**`, `public/**` | **MAIN_UI_HUB** (`UI-HUB-`) | AI commits in `UI-HUB-` only. Push is left to the user (manual) unless the user explicitly asks AI to push `UI-HUB-` too. |
| Root config files in `UI-HUB-` (package.json, README.md, vercel.json, render.yaml, .vercelignore, .gitignore, MCP.md) | **MAIN_UI_HUB** | Same as website changes. |
| `.agents/**` (skills, agents) | **MAIN_UI_HUB** | Same as website changes. |
| Mixed: MCP **and** website | **BOTH** | Handle separately — separate commits, separate repos. Never merge them. |

### 2.2 The Routing Decision Flow

Run this every time the skill is invoked:

```
[START]
  │
  ├─ 1. git status (in C:\Users\Admin\Documents\GitHub\UI-HUB-\)  ← always inspect the UI-HUB- tree first
  │
  ├─ 2. Bucket every changed file using §2.1
  │
  ├─ 3. Is there an MCP bucket (mcp-server/**)?
  │        YES → follow §3 "MCP Mirror & Publish" for UI-HUB-MCP-
  │        NO  → skip MCP handling entirely (DO NOT touch UI-HUB-MCP-)
  │
  ├─ 4. Is there a WEBSITE bucket (everything else)?
  │        YES → prepare commit in UI-HUB- (push = manual unless user opts in)
  │        NO  → skip UI-HUB- handling
  │
  └─ 5. Report per §12 (separate status for each repo)
```

> **Golden rule:** `mcp-server/**` → `UI-HUB-MCP-`. Everything else → `UI-HUB-`.
> When in doubt, ask the user which repo they mean rather than guessing.

---

## 3. MCP Server Mirror & Publish Procedure (MCP changes only)

When the user wants MCP server changes pushed, the code must travel from the working copy
(`UI-HUB-\mcp-server\`) into the published repo (`UI-HUB-MCP-\`).

### 3.1 Mirror the changed files

From `C:\Users\Admin\Documents\GitHub\UI-HUB-\mcp-server\` → `C:\Users\Admin\Documents\GitHub\UI-HUB-MCP-\`:

1. Compare the two trees and identify exactly which files changed/new:
   - `git diff --no-index --stat <UI-HUB-MCP-> <UI-HUB-\mcp-server>` (or `git status` on the working copy)
2. Copy the **content-changed** files under the same relative path:
   - `src/**`, `scripts/**`, `tests/**` (e.g. new tool files MUST be copied — they are brand-new files in `UI-HUB-MCP-`)
   - Root files only if they have REAL content changes: `package.json`, `package-lock.json`, `tsconfig.json`, `vitest.config.ts`, `Dockerfile`, `.env.example`, `.gitignore`
   - `dist/**` — do NOT copy manually; it is regenerated by `npm run build` (§3.4)
3. **Files in `UI-HUB-MCP-` you must NEVER overwrite or delete:**
   - `README.md`, `MCP.md`, `KEEPALIVE.md`, `.github/workflows/keep-alive.yml`
4. **`render.yaml` — special case:** the `mcp-server/render.yaml` contains `rootDir: mcp-server`
   (needed because Render runs it as a subfolder). **DO NOT copy it** — keep the `UI-HUB-MCP-`
   version unchanged (it points at the repo root).

### 3.2 Default commit location note

Because `mcp-server/` is tracked inside the UI-HUB- repo:
- The working copy changes are committed to **UI-HUB-** as well (the user's choice — see §13 rule).
- If the working copy changes are not yet committed in UI-HUB-, commit them there with a clear
  `feat(mcp-server)...` / `fix(mcp)...` message and the same file set that you mirror.

### 3.3 Validate in UI-HUB-MCP-

Inside `C:\Users\Admin\Documents\GitHub\UI-HUB-MCP-\`:

```bash
npm install        # only if node_modules is missing or package.json changed
npm test           # vitest run — must pass
npm run build      # tsc + coverage check + copy-data — regenerates dist/ and syncs dist/data
```

- `npm run build` REGENERATES `dist/` — expect `dist/**` to show as modified/new in git status.
  Stage those regenerated files; they are part of the publish.
- Ignore/verify line-ending-only noise with `git status`: if a file shows modified but has no
  real content change, `git add` normalizes it away automatically. Confirm with
  `git hash-object <file>` vs `git rev-parse HEAD:<file>` if unsure.
- Do not commit unrelated `package-lock.json` churn caused by `npm install` (revert it with
  `git checkout -- package-lock.json` if `package.json` itself didn't change).

### 3.4 Order of operations

```
1. Confirm source = UI-HUB-\mcp-server, dest = UI-HUB-MCP-
2. Mirror changed/new files (§3.1)
3. npm install (if needed) → npm test → npm run build in UI-HUB-MCP-
4. Commit in UI-HUB-MCP-  (message: feat(mcp)/fix(mcp), matching UI-HUB- commit)
5. Commit the same mcp-server changes in UI-HUB- if not already committed (§3.2)
6. Approval gate (§5) → push UI-HUB-MCP- → verify (§8/§10)
7. UI-HUB- push: manual by default — only push if the user explicitly asks
```

---

## 4. Activation Rule — Strict User-Invoked Isolation

> **NO OTHER VIBE OR SKILL CAN USE THIS SKILL.**
> This skill is strictly quarantined from all other workflows. It MUST NEVER run automatically.

### Prohibited Auto-Triggers:
Do NOT activate or execute this skill merely because files were created or modified during:
- Adding or editing a UI component (component integration vibe)
- Updating vibe prompts, AI prompts, or embedded source code
- Fixing CSS, layout, or responsiveness issues
- Refactoring internal code
- Modifying MCP tools or backend services
- Running builds, lints, or tests
- Resolving bugs or errors

### Permitted Trigger Conditions:
This skill activates **ONLY** when the user explicitly issues a direct command requesting a Git or GitHub publishing action:
- *"use UI HUB GITHUB SYNC AND PUSH skill"* / *"use the UI HUB sync and push skill and push the code"*
- *"push the code using AI"* / *"push my code"* / *"push to GitHub"*
- *"commit and push"*
- *"sync the MCP repo"* / *"sync UI-HUB and UI-HUB-MCP"*
- *"push both repositories"*
- *"publish these changes to GitHub"*
- *"update remote repository"*

If the user request is only about building or changing code, complete that task and **STOP**. Do not push. The AI may suggest the skill, but must not push on its own.

---

## 5. Mandatory User Permission Gate

> **NEVER PUSH WITHOUT EXPLICIT USER APPROVAL.**
> The AI may inspect Git state, stage files, mirror code, run validation, and prepare commits locally, but MUST STOP and request confirmation immediately before running `git push`.

### Confirmation Modal Format:
Present the following summary to the user before requesting approval:

```markdown
### GitHub Push Confirmation Required

Ready to push the following changes:

- **Repository**: `[MAIN_UI_HUB | MCP_SERVER]`
- **Remote**: `origin` (`jainil224/...`)
- **Branch**: `[branch-name]`
- **Ahead / Behind**: `ahead [N], behind 0`
- **Force Push**: **NO** (standard non-destructive push)
- **Commit(s)**:
  - `[commit-hash]` - `[commit-message]`
- **Files Included**:
  - `path/to/file1`
  - `path/to/file2`

**Do you want me to push these commits to GitHub?**
```

### Push-behavior defaults:
- **MCP_SERVER (`UI-HUB-MCP-`)**: AI pushes after approval. This is the primary auto-push path.
- **MAIN_UI_HUB (`UI-HUB-`)**: AI prepares the local commit but does **NOT** push. The user pushes
  manually. AI only pushes `UI-HUB-` when the user explicitly requests that specific repo in the same
  request.

### Response Handling:
- **If User Approves ("Yes", "Proceed", "Push")**: Execute `git push origin <branch>` for each approved repo and verify remote state.
- **If User Declines or Postpones ("No", "Wait", "Don't push")**: Keep all local commits and files untouched. Report that the push was canceled.
- **Scope of Approval**: One explicit approval covers only the specific push operation and repositories listed in that confirmation.

---

## 6. MCP ↔ Main UI-HUB Cross-Repository Contract Analysis

When changes involve both the MCP server and the main application, ensure contract compatibility before committing or pushing.

### 6.1 CROSS-REPO CHANGE RULE

> **NEVER ASSUME THAT AN MCP CHANGE REQUIRES A MAIN_UI_HUB CHANGE.**
>
> Before modifying `MAIN_UI_HUB`, you MUST **prove** that at least one of these changed:
> - MCP tool name
> - MCP parameters
> - MCP request schema
> - MCP response schema
> - MCP endpoint
> - authentication contract
> - exported/shared type
> - environment/config contract
> - generated client/API contract
>
> **If none changed:**
> - Do **NOT** modify `MAIN_UI_HUB` code beyond the `mcp-server/` working copy.
> - Do **NOT** create an empty commit.
> - Push `MCP_SERVER` only.

### 6.2 When MCP Changes DO Affect Main UI-HUB
If at least one item from the contract list above changed:
1. Inspect the consumer code in `MAIN_UI_HUB`.
2. Update the main UI-HUB code to maintain full compatibility.
3. Validate both repositories locally.
4. Prepare separate, focused commits for both repositories.
5. Push in dependency order (see §6.4).

### 6.3 Internal-Only MCP Changes
If the MCP modification is internal (e.g. logging refactoring, test adjustments, internal helper cleanup):
- Do **NOT** make cosmetic or empty commits in `MAIN_UI_HUB`.
- Push only `MCP_SERVER` after validation and user approval.

### 6.4 Coordinated Push Order
When both repositories require updates:
```
1. Validate MCP_SERVER
        ↓
2. Validate MAIN_UI_HUB
        ↓
3. Commit MCP_SERVER & MAIN_UI_HUB locally (separately)
        ↓
4. Obtain user push permission
        ↓
5. Push MCP_SERVER  -->  Verify remote update
        ↓
6. Push MAIN_UI_HUB -->  Verify remote update (only if user opted in; otherwise manual)
```
*Reason: The remote contract/API must exist on the server before the consuming app is published against it.*

---

## 7. Staging & Diff Safety

### Change Analysis
Inspect `git diff` and `git status` thoroughly before staging:
- Stage **only** files directly relevant to the user's explicit request.
- Prefer explicit file staging: `git add <file1> <file2>`.
- **NEVER** run `git add .` blindly when untracked or unrelated files exist.
- For the MCP mirror: stage the mirrored files in `UI-HUB-MCP-` (source files first, then the regenerated `dist/`).

### Protecting Uncommitted User Work:
- Do NOT overwrite unrelated pre-existing files.
- **NEVER** run `git clean -fd`.
- **NEVER** run `git reset --hard`.
- If uncommitted unrelated changes conflict with the files to stage, **STOP** and explain the situation to the user.

---

## 8. Remote Synchronization & Conflict Prevention

Before pushing, ensure the local branch is not behind upstream:

1. **Always Fetch First:**
   ```bash
   git fetch origin <branch>
   git status -sb
   ```
2. **If Local is Behind Remote:**
   - **Do NOT push.**
   - Analyze the incoming commits (`git log HEAD..origin/<branch> --oneline`).
   - If clean fast-forward or non-conflicting merge is possible, explain to the user and integrate safely.
   - If conflicts exist, **STOP** and present the conflicting files. Never silently overwrite remote work.
3. **Strict Prohibition on Force Push:**
   - **NEVER** use `git push --force` or `git push --force-with-lease` unless the user explicitly commands a force push and confirms understanding of data loss risks.
   - Never delete remote commits to force a local push through.

---

## 9. Secret & Credential Guard

Before staging or committing any file, verify that no sensitive data is included:

### Prohibited Content:
- API keys, access tokens, secret keys (Firebase private keys, AI tokens, GitHub tokens)
- Passwords or credentials
- Service account JSON files
- Local `.env` or `.env.local` files containing secrets
- Unsanitized logs or debug dumps

### Action on Secret Detection:
If a secret is detected in `git status` or `git diff`:
1. **STOP IMMEDIATELY**.
2. Do not stage or commit the file.
3. Ensure `.gitignore` properly excludes the file.
4. Notify the user without printing the secret value.

---

## 10. Pre-Push Validation

Always run project validation scripts before requesting push approval.

### For MAIN_UI_HUB (website code only):
Inside `frontend/`:
```bash
npm run lint     # TypeScript check (tsc --noEmit)
npm run build    # Vite production bundle validation
```

### For MCP_SERVER:
Inside `C:\Users\Admin\Documents\GitHub\UI-HUB-MCP-\` (the published repo — NOT the mcp-server/ folder):
```bash
npm test         # vitest run — must pass
npm run build    # tsc + coverage check + copy-data (regenerates dist/)
```
Even if `mcp-server/` in UI-HUB- already passed, always re-run validation in `UI-HUB-MCP-` after mirroring,
because the final push comes from that tree.

> If a validation script fails, diagnose whether it was caused by the current changes. Do not push broken builds without explicit user acknowledgment.

---

## 11. Step-by-Step Push Execution Procedure

Follow this exact sequence when a push is requested:

```
[START: Explicit User Push Request]
  │
  ├─ Step 1: Route the change (§2) — MCP bucket? Website bucket? Both?
  │
  ├─ Step 2: Verify Repository Identity (§1)
  │   - Run git remote -v and git branch --show-current in the target repo
  │   - Confirm remote URL matches the routed repository
  │
  ├─ Step 3: Fetch & State Inspection
  │   - Run git fetch origin
  │   - Check ahead / behind counts
  │   - Check for uncommitted / unrelated files
  │
  ├─ Step 4: Diff Analysis & Secret Scan
  │   - Run git diff to review modifications
  │   - Scan for API keys, tokens, or credential leaks
  │
  ├─ Step 5: Mirror (MCP only) — copy mcp-server/** → UI-HUB-MCP-\ (§3.1)
  │
  ├─ Step 6: Run Validation (§10)
  │   - MCP_SERVER: npm test + npm run build in UI-HUB-MCP-
  │   - MAIN_UI_HUB: npm run lint + npm run build in frontend/
  │   - Verify cross-repo compatibility if MCP changed
  │
  ├─ Step 7: Stage & Commit Locally (§7)
  │   - UI-HUB-MCP-: commit mirrored files (feat(mcp)/fix(mcp))
  │   - UI-HUB-: commit mcp-server/ working copy + any website changes
  │   - Explicitly stage intended files (git add <files>)
  │
  ├─ Step 8: USER APPROVAL GATE (§5)
  │   - Display repository, branch, commit, file list, ahead status
  │   - Ask: "Do you want me to push these commits to GitHub?"
  │   - [WAIT FOR EXPLICIT USER CONFIRMATION]
  │
  ├─ Step 9: Push & Verify
  │   - Push MCP_SERVER: git push origin <branch> (standard, no force)
  │   - Push MAIN_UI_HUB ONLY if user opted in (else leave manual)
  │   - Re-check git status -sb to confirm 0 ahead, clean branch
  │
  └─ Step 10: Final Report (§12)
      - Structured summary per repo with actual push status
```

---

## 12. Final Report Format

When a push or sync operation concludes, report the status using this structure:

```markdown
## GitHub Sync Complete

### MAIN_UI_HUB
- **Repository**: `jainil224/UI-HUB-`
- **Branch**: `[branch-name]`
- **Commit**: `[commit-hash]` - `[commit-message]`
- **Push Status**: `COMMIT ONLY (manual push)` | `SUCCESS` | `NOT PUSHED`
- **Remote Verified**: `YES` | `NO`

### MCP_SERVER
- **Repository**: `jainil224/UI-HUB-MCP-`
- **Branch**: `[branch-name]`
- **Commit**: `[commit-hash]` - `[commit-message]`
- **Push Status**: `SUCCESS` | `NOT PUSHED` | `MANUAL`
- **Remote Verified**: `YES` | `NO`

### Cross-Repository Contract Check
- **Contract Impact**: `YES` | `NO` | `NOT APPLICABLE`
- **Consumer Compatibility**: `VERIFIED` | `NOT REQUIRED`

### Pre-Push Validation
- **MAIN_UI_HUB**: `PASS (lint + build)` | `NOT APPLICABLE`
- **MCP_SERVER**: `PASS (test + build in UI-HUB-MCP-)` | `NOT APPLICABLE`

### Secrets Check
- **Status**: `PASS (no secrets or credentials detected)`

### Files Pushed
- `[file1]`
- `[file2]`
```

---

## 13. Non-Negotiable Rules

1. **STRICT ACTIVATION**: Activate ONLY on explicit user push/sync commands (see §4). Never run after normal code edits.
2. **ROUTING IS MANDATORY (§2)**: Classify every change first. `mcp-server/**` → `UI-HUB-MCP-`; website/app code → `UI-HUB-`. Never push the wrong code to the wrong repo.
3. **ISOLATED SKILL**: No other vibe, prompt generator, or skill is allowed to trigger a push.
4. **NEVER MIX REPOSITORIES**: Always verify remote URL. Treat `UI-HUB-` and `UI-HUB-MCP-` as completely separate commit histories.
5. **MCP MIRROR (§3)**: MCP pushes come from `UI-HUB-MCP-` after mirroring from the `mcp-server/` working copy. Never overwrite `README.md`/`MCP.md`/`KEEPALIVE.md`/`.github` in `UI-HUB-MCP-`, and never copy the `render.yaml` with `rootDir`.
6. **MANDATORY APPROVAL GATE**: Never execute `git push` without explicit user approval.
7. **MANUAL BY DEFAULT FOR WEBSITE**: AI does not push `UI-HUB-` unless the user explicitly asks to push that repo.
8. **NEVER FORCE PUSH**: Never use `--force` or `--force-with-lease` unless explicitly ordered with accepted risk.
9. **NEVER DISCARD DATA**: Never use `git clean -fd` or `git reset --hard` to bypass conflicts or clean work.
10. **FETCH FIRST**: Always fetch and inspect upstream status before pushing.
11. **SELECTIVE STAGING**: Stage only relevant files. Never run blind `git add .`.
12. **ZERO SECRETS**: Never stage or commit tokens, keys, passwords, or credentials.
13. **CROSS-REPO PROOF RULE (§6.1)**: Never assume an MCP change requires a MAIN_UI_HUB change. Prove at least one public contract item changed before modifying MAIN_UI_HUB. Never create empty or dummy commits.
14. **ORDERED PUBLISHING**: For coordinated contract changes, publish `MCP_SERVER` before `MAIN_UI_HUB`.
15. **VERIFY AFTER PUSH**: Check `git status -sb` after push to verify the remote updated successfully.
16. **ACCURATE REPORTING**: Report the exact commands run, commits created, and actual push status.

---
*End of UI-HUB GitHub Sync & Push Skill*