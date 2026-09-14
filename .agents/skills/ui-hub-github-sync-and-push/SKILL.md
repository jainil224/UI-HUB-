---
name: ui-hub-github-sync-and-push
description: >
  ONLY activate when the user explicitly requests a Git or GitHub push, commit, sync,
  or publish action for UI-HUB (jainil224/UI-HUB-) or UI-HUB-MCP (jainil224/UI-HUB-MCP-).
  STRICT ISOLATION: No other vibe, skill, or coding workflow is permitted to invoke or
  auto-trigger this skill. Enforces repository separation, cross-repo contract validation,
  secret safety, and mandatory user permission before executing git push.
---

# UI-HUB GitHub Sync & Push Skill

## 1. Purpose & Repository Scope

This skill governs all Git and GitHub operations for the two distinct UI-HUB repositories:

| Repository | GitHub Remote | Responsibility |
|---|---|---|
| **MAIN_UI_HUB** | `jainil224/UI-HUB-` | Main UI-HUB application (React frontend, backend, public assets) |
| **MCP_SERVER** | `jainil224/UI-HUB-MCP-` | UI-HUB MCP server tools, schemas, and service layer |

> **CRITICAL SEPARATION RULE**
> The two repositories are completely independent projects. They MUST be treated as separate working trees, separate commit histories, and separate GitHub remotes. Never mix files, branches, or commits across them.

---

## 2. Activation Rule — Strict User-Invoked Isolation

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
- *"push my code"* / *"push to GitHub"*
- *"commit and push"*
- *"sync the MCP repo"* / *"sync UI-HUB and UI-HUB-MCP"*
- *"push both repositories"*
- *"publish these changes to GitHub"*
- *"update remote repository"*

If the user request is about building or changing code, complete that task and **STOP**. Do not push.

---

## 3. Repository Identity Verification

Before running any Git commands, determine and verify the repository's identity dynamically. Never rely on assumptions.

### Pre-Operation Verification Checklist:
For each target repository, run and verify:
```bash
git rev-parse --is-inside-work-tree    # Confirm it is a valid git repository
git remote -v                          # Confirm 'origin' matches expected GitHub URL
git branch --show-current              # Confirm current branch (never assume 'main')
git status --short                     # Inspect working tree status
git status -sb                         # Check ahead/behind counts relative to upstream
```

### Safety Stop:
If `git remote -v` does not match `jainil224/UI-HUB-` or `jainil224/UI-HUB-MCP-`, **STOP IMMEDIATELY**. Report the mismatch and refuse to push.

---

## 4. Mandatory User Permission Gate

> **NEVER PUSH WITHOUT EXPLICIT USER APPROVAL.**
> The AI may inspect Git state, stage files, run validation, and prepare commits locally, but MUST STOP and request confirmation immediately before running `git push`.

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

### Response Handling:
- **If User Approves ("Yes", "Proceed", "Push")**: Execute `git push origin <branch>` and verify remote state.
- **If User Declines or Postpones ("No", "Wait", "Don't push")**: Keep all local commits and files untouched. Report that the push was canceled.
- **Scope of Approval**: One explicit approval covers only the specific push operation and repositories listed in that confirmation.

---

## 5. MCP ↔ Main UI-HUB Cross-Repository Contract Analysis

When changes involve both the MCP server and the main application, ensure contract compatibility before committing or pushing.

### 5.1 CROSS-REPO CHANGE RULE

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
> - Do **NOT** modify `MAIN_UI_HUB`.
> - Do **NOT** create an empty commit.
> - Push `MCP_SERVER` only.

### 5.2 When MCP Changes DO Affect Main UI-HUB
If at least one item from the contract list above changed:
1. Inspect the consumer code in `MAIN_UI_HUB`.
2. Update the main UI-HUB code to maintain full compatibility.
3. Validate both repositories locally.
4. Prepare separate, focused commits for both repositories.
5. Push in dependency order (see §5.4).

### 5.3 Internal-Only MCP Changes
If the MCP modification is internal (e.g. logging refactoring, test adjustments, internal helper cleanup):
- Do **NOT** make cosmetic or empty commits in `MAIN_UI_HUB`.
- Push only `MCP_SERVER` after validation and user approval.

### 5.4 Coordinated Push Order
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
6. Push MAIN_UI_HUB -->  Verify remote update
```
*Reason: The remote contract/API must exist on the server before the consuming app is published against it.*

---

## 6. Staging & Diff Safety

### Change Analysis
Inspect `git diff` and `git status` thoroughly before staging:
- Stage **only** files directly relevant to the user's explicit request.
- Prefer explicit file staging: `git add <file1> <file2>`.
- **NEVER** run `git add .` blindly when untracked or unrelated files exist.

### Protecting Uncommitted User Work:
- Do NOT overwrite unrelated pre-existing files.
- **NEVER** run `git clean -fd`.
- **NEVER** run `git reset --hard`.
- If uncommitted unrelated changes conflict with the files to stage, **STOP** and explain the situation to the user.

---

## 7. Remote Synchronization & Conflict Prevention

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

## 8. Secret & Credential Guard

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

## 9. Pre-Push Validation

Always run project validation scripts before requesting push approval.

### For MAIN_UI_HUB:
Inside `frontend/`:
```bash
npm run lint     # TypeScript check (tsc --noEmit)
npm run build    # Vite production bundle validation
```

### For MCP_SERVER:
Inside the MCP server directory:
```bash
npm run lint     # (if defined)
npm test         # (if defined)
npm run build    # (if defined)
```

> If a validation script fails, diagnose whether it was caused by the current changes. Do not push broken builds without explicit user acknowledgment.

---

## 10. Step-by-Step Push Execution Procedure

Follow this exact sequence when a push is requested:

```
[START: Explicit User Push Request]
  │
  ├─ Step 1: Verify Repository Identity
  │   - Run git remote -v and git branch --show-current
  │   - Confirm remote URL matches expected repository
  │
  ├─ Step 2: Fetch & State Inspection
  │   - Run git fetch origin
  │   - Check ahead / behind counts
  │   - Check for uncommitted / unrelated files
  │
  ├─ Step 3: Diff Analysis & Secret Scan
  │   - Run git diff to review modifications
  │   - Scan for API keys, tokens, or credential leaks
  │
  ├─ Step 4: Run Validation
  │   - Execute lint / build checks
  │   - Verify cross-repo compatibility if MCP changed
  │
  ├─ Step 5: Stage & Commit Locally
  │   - Explicitly stage intended files (git add <files>)
  │   - Commit with clear semantic message: feat(...), fix(...), chore(...)
  │
  ├─ Step 6: USER APPROVAL GATE
  │   - Display repository, branch, commit, file list, ahead status
  │   - Ask: "Do you want me to push these commits to GitHub?"
  │   - [WAIT FOR EXPLICIT USER CONFIRMATION]
  │
  ├─ Step 7: Push & Verify
  │   - Run git push origin <branch> (standard, no force)
  │   - Re-check git status -sb to confirm 0 ahead, clean branch
  │
  └─ Step 8: Final Report
      - Provide structured summary of what was pushed
```

---

## 11. Manual Push Support

If the user prefers to execute the final push command themselves:
1. Prepare the commit locally following all safety checks.
2. Provide the exact, safe push command with verified remote and branch:
   ```bash
   # In repository: [path] (remote: jainil224/UI-HUB-)
   git push origin [verified-branch]
   ```
3. Mark in the final report that the push was left for manual execution. Do not claim the remote was updated until confirmed.

---

## 12. Final Report Format

When a push or sync operation concludes, report the status using this structure:

```markdown
## GitHub Sync Complete

### MAIN_UI_HUB
- **Repository**: `jainil224/UI-HUB-`
- **Branch**: `[branch-name]`
- **Commit**: `[commit-hash]` - `[commit-message]`
- **Push Status**: `SUCCESS` | `NOT PUSHED` | `MANUAL`
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
- **MAIN_UI_HUB**: `PASS (lint + build)`
- **MCP_SERVER**: `PASS` | `NOT APPLICABLE`

### Secrets Check
- **Status**: `PASS (no secrets or credentials detected)`

### Files Pushed
- `[file1]`
- `[file2]`
```

---

## 13. Non-Negotiable Rules

1. **STRICT ACTIVATION**: Activate ONLY on explicit user push/sync commands. Never run after normal code edits.
2. **ISOLATED SKILL**: No other vibe, prompt generator, or skill is allowed to trigger a push.
3. **NEVER MIX REPOSITORIES**: Always verify remote URL. Treat `UI-HUB-` and `UI-HUB-MCP-` as completely separate.
4. **MANDATORY APPROVAL GATE**: Never execute `git push` without asking for and receiving explicit user approval.
5. **NEVER FORCE PUSH**: Never use `--force` or `--force-with-lease` unless explicitly ordered with accepted risk.
6. **NEVER DISCARD DATA**: Never use `git clean -fd` or `git reset --hard` to bypass conflicts or clean work.
7. **FETCH FIRST**: Always fetch and inspect upstream status before pushing.
8. **SELECTIVE STAGING**: Stage only relevant files. Never run blind `git add .`.
9. **ZERO SECRETS**: Never stage or commit tokens, keys, passwords, or credentials.
10. **CROSS-REPO PROOF RULE (§5.1)**: Never assume an MCP change requires a MAIN_UI_HUB change. Prove at least one public contract item changed before modifying MAIN_UI_HUB. Never create empty or dummy commits.
11. **ORDERED PUBLISHING**: For coordinated contract changes, publish `MCP_SERVER` before `MAIN_UI_HUB`.
12. **VERIFY AFTER PUSH**: Check `git status -sb` after push to verify the remote updated successfully.
13. **ACCURATE REPORTING**: Report the exact commands run, commits created, and actual push status.

---
*End of UI-HUB GitHub Sync & Push Skill*
