# UI HUB — PHASE 10 / F7

## Final Audit → Stage → Commit → Verify Clean Tree

F6 is closed.

This is the FINAL Phase 10 task.

The purpose of F7 is to package the completed agent system into one clean repository state, perform the final validation, create the Phase 10 commit, and verify the repository is clean.

Do NOT:

* introduce new features;
* redesign the architecture;
* modify routing/relevance/context policy;
* change memory ranking;
* change DEC-009;
* fix the S1 gap;
* fix the 61 frontend typecheck errors;
* resolve the 4 config conflicts;
* implement the two remaining F6 follow-ups;
* perform production deployment;
* push to remote unless explicitly requested.

---

# 1. READ THE FINAL CONTRACT

Read:

* `agent.md`
* `.uihub-agent/architecture/AGENT_ARCHITECTURE.md`
* `.uihub-agent/tasks/AGENT_WORKFLOW.md`
* `.uihub-agent/tasks/COMMAND_REFERENCE.md`
* `.uihub-agent/tasks/TASK_EXECUTION_TEMPLATE.md`
* `.uihub-agent/tasks/AGENT_REPORT_TEMPLATE.md`
* `.uihub-agent/tasks/TASK_ROUTER.md`
* `.uihub-agent/tasks/CONTEXT_BUNDLE.md`
* `.uihub-agent/tasks/ROUTER_BENCHMARK.md`
* `.uihub-agent/tasks/ROUTER_DECISIONS.md`
* `.uihub-agent/memory/MEMORY_OVERVIEW.md`
* `.uihub-agent/memory/ARCHITECTURAL_DECISIONS.md`
* `.uihub-agent/memory/SECRET_HANDLING.md`
* all Phase 10 memory records

Confirm that the final repository documentation describes the implementation as it actually exists.

---

# 2. FINAL CURRENT-STATE AUDIT

Record:

```text
git status --short
git diff --stat
git diff --name-only
git branch --show-current
git rev-parse HEAD
```

Current expected state:

```text
branch: main
HEAD: 037d3b99
staged: 0
application source: untouched
```

Do not assume the exact modified/untracked count. Measure it.

---

# 3. REVIEW ALL PHASE 10 CHANGES

Identify every file introduced or modified during:

```text
C1
D1
D2
E1
E2
F1
F2
F3
F4
F5
F6
```

Classify every file:

```text
INTENTIONAL PHASE 10 CHANGE
PRE-EXISTING PHASE 10 WORKING-TREE CHANGE
UNINTENTIONAL
```

There must be no unexplained file.

Do not discard a legitimate Phase 10 file merely because it is untracked.

Do not include unrelated application changes.

---

# 4. CHECK FOR ACCIDENTAL FILES

Search for:

* temporary files;
* simulation directories;
* debug traces;
* logs;
* `.env` changes;
* temporary fixtures;
* duplicate canonical documents;
* superseded documents accidentally recreated;
* generated artifacts that are not intended to be committed.

Confirm all F2/F4/F5/F6 temporary environments are gone.

---

# 5. VERIFY FINAL COUNTS

The current agent-test baseline is:

```text
232/232
```

because F6 added the final security coverage.

Verify all current references use the correct current number where appropriate.

Historical counts may remain only when explicitly historical.

Do not rewrite historical reports just to change their numbers.

---

# 6. FINAL VALIDATION — AGENT

Run:

```text
npm run agent:test
```

Expected:

```text
232/232
```

or a larger count only if this final phase legitimately added tests.

Record exact result.

---

# 7. FINAL VALIDATION — FRESHNESS / GENERATED

Run:

```text
npm run agent:index:check
npm run check:generated
npm run check:index
```

Expected:

```text
agent:index:check = 19/19 fresh
check:generated = 83/83 fresh
check:index = 20 MATCH / 3 WARN / 0 FAIL
```

Do not regenerate unless a legitimate Phase 10 change requires it.

If regeneration is required, verify the resulting diff is intentional.

---

# 8. FINAL VALIDATION — KNOWLEDGE / DOCS / SECURITY

Run:

```text
npm run check:knowledge
npm run check:docs
npm run check:secrets
```

Expected:

```text
knowledge = VALID
docs = 0 drift
secrets = 0 violations
```

Confirm the security scanner and redaction architecture are consistent with F6.

Do not implement the two intentionally-open follow-ups:

* custom `MCP_API_KEY_PREFIX` coverage;
* pre-existing `apiKey:` first-pass mangling.

They must remain documented as open issues.

---

# 9. FINAL VALIDATION — TRACKING / CONFIG

Run:

```text
npm run check:tracking
npm run check:config
```

Expected:

```text
tracking = violation only until staging
config = 7 CONSISTENT / 4 CONFLICT
```

Do not fix the four owner configuration conflicts.

The tracking violation should disappear after intended Phase 10 files are staged.

---

# 10. FINAL APPLICATION REGRESSION

Run the established application suites.

Expected:

```text
backend 79/79
mcp-server 95/95
cli 30/30
frontend 27/27

TOTAL 231/231
```

Also run:

```text
frontend: npx tsc --noEmit
```

Expected accepted baseline:

```text
61 errors / 23 files
```

Do not fix those type errors.

---

# 11. FINAL MEMORY VALIDATION

Run the strict memory validator.

Confirm:

```text
61 records
61 unique IDs
0 future dates
0 dangling references
0 invalid statuses
0 duplicate IDs
```

Confirm:

```text
CURRENT 43
RESOLVED 1
HISTORICAL 17
```

DEC-009 must remain RESOLVED and active.

---

# 12. FINAL ROUTER / CONTEXT REGRESSION

Verify the pinned router benchmark:

```text
S1  9
S2 14
S3  2
S4 16
S5 42
S6 13
S7  0
S8  0
S9 10
S10 0
```

Total:

```text
106
```

Do not change these values.

Verify:

```text
memoryLimit 0 == default
```

for routing/context.

Verify `bundle.mjs` still has no memory dependency.

---

# 13. VERIFY SECURITY BOUNDARY

Run:

```text
agent:memory --json
agent:prepare --json
```

Confirm:

* valid JSON;
* no secret emitted;
* `[REDACTED]` idempotent;
* scanner boundary intact.

Do not add the open F6 MCP scanner enhancement.

---

# 14. FINAL DOCUMENTATION SWEEP

Search for stale current claims such as:

```text
189/189
199/199
210/210
171/171
1287 scanned
1293 scanned
```

Only replace values that are intended to represent CURRENT state.

Do not destroy historical evidence.

Also verify there are no stale claims that:

```text
memory informs routing
agent:memory relies on redaction alone
check:index proves the working tree is fresh
agent:index is read-only
```

The existing documentation should remain consistent with the final architecture.

---

# 15. BUILD FINAL PHASE 10 SUMMARY

Create or update the final Phase 10 completion report under the canonical agent documentation area.

It must summarize:

### What was built

* codebase intelligence;
* task router;
* targeted context;
* protected-path intelligence;
* durable memory;
* memory security;
* freshness/change intelligence;
* task preparation;
* validation/reporting.

### What was proven

* memory non-influence;
* stale-data safety;
* targeted context;
* security boundary;
* deterministic indexing;
* change recovery;
* fresh-session workflow.

### Known limitations

Include only current legitimate limitations:

* S1 auth.js coverage gap;
* same-size freshness limitation;
* sibling index-check limitation;
* dist coverage ownership;
* four configuration conflicts;
* 61 frontend typecheck errors;
* context-task malformed diagnostic;
* open F6 security follow-ups;
* any other explicitly documented limitation.

Do not describe limitations as failures when the architecture intentionally accepts them.

---

# 16. FINAL DIFF REVIEW

Before staging, inspect:

```text
git diff --check
git diff --stat
git diff --name-status
```

For every modified file ask:

```text
Is this an intentional Phase 10 change?
```

For every untracked file ask:

```text
Is this a legitimate Phase 10 artifact?
```

Remove only actual accidental files.

Do not remove legitimate Phase 10 work.

---

# 17. STAGE ONLY INTENDED PHASE 10 FILES

Once the final audit is clean:

Stage all legitimate Phase 10 files.

Do NOT stage:

* application-source changes;
* `.env`;
* unrelated repository changes;
* temporary/debug artifacts.

Then run:

```text
git status --short
git diff --cached --stat
git diff --cached --name-status
```

Review the staged manifest carefully.

---

# 18. RUN FINAL GATES AFTER STAGING

Run:

```text
npm run check:tracking
npm run check:knowledge
npm run check:docs
npm run check:secrets
npm run check:generated
npm run check:index
npm run agent:index:check
npm run agent:test
```

Tracking should now be clean.

Other known expected config conflicts remain outside staging scope.

Confirm application tests remain:

```text
231/231
```

---

# 19. CREATE ONE FINAL COMMIT

Create ONE commit containing the complete Phase 10 agent-system work.

Suggested commit message:

```text
feat(agent): complete durable codebase intelligence system
```

Do not create multiple cleanup commits.

Do not amend older commits.

Do not push.

Record the resulting commit hash.

---

# 20. VERIFY COMMIT

Immediately after committing:

```text
git status --short
git log -1 --oneline
git show --stat --oneline --summary HEAD
```

The worktree must be clean.

Expected:

```text
git status --short
```

produces no output.

If anything remains:

* investigate;
* classify;
* do not blindly commit it.

Do not push.

---

# 21. FINAL COMPLETION CRITERIA

Phase 10 is COMPLETE only when:

```text
1. All intended Phase 10 work is staged.
2. No application source is staged.
3. All final agent tests pass.
4. Application baseline remains 231/231.
5. Security passes.
6. Knowledge passes.
7. Documentation has 0 drift.
8. Generated intelligence is fresh.
9. Tracking is clean after staging.
10. Router benchmark remains pinned and unchanged.
11. Memory non-influence remains proven.
12. Memory validator is clean.
13. One final commit exists.
14. Working tree is clean.
15. Nothing has been pushed.
```

---

# 22. FINAL REPORT FORMAT

Return exactly:

## F7 STATUS

COMPLETE / PARTIAL / BLOCKED

## FINAL PHASE 10 SCOPE

What is included.

## FILE MANIFEST

Exact number and list of files committed, grouped by:

* scripts
* tests
* memory
* tasks
* architecture
* generated
* root metadata

## FINAL TEST RESULTS

Agent tests.

## APPLICATION TEST RESULTS

Backend/MCP/CLI/frontend = 231/231.

## INTEGRITY GATES

Complete table.

## SECURITY

Final scanner/redaction state.

## MEMORY

61-record final state.

## ROUTER

S1–S10 final values.

## KNOWN LIMITATIONS

Only intentional/open items.

## COMMIT

Commit hash and message.

## GIT STATUS

Confirm clean working tree.

## PUSH

Confirm NOT PUSHED.

Then stop.

Do not make any further changes after the final clean-tree verification.
