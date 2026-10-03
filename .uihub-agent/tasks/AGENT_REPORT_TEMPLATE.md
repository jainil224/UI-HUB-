# AGENT REPORT TEMPLATE

> Canonical for area **E — validation and completion**. The validation procedure
> lives in `AGENT_WORKFLOW.md` sections 6-8; this file is what is handed back.
> `TASK_EXECUTION_TEMPLATE.md` is the running record; this is the closing report.
> The difference matters: the execution record is written *during* the task, this
> is written *for* someone who was not there.

## The template

```text
TASK
  <one line: what was asked>

CLASSIFICATION
  <category, and the confidence the router assigned>
  <if routing was ambiguous: what was ambiguous, and what was assumed>

MEMORY CONSULTED
  <record IDs, or "none">
  <what each contributed>
  <what memory did NOT change, when a record was read and set aside>

CONTEXT
  <files opened, and why each was opened>
  <the size-policy outcome, when the bundle was capped or refused>

CHANGES
  <what was changed, in plain language>
  <what was deliberately not changed>

FILES
  <each file touched, one line on why>
  <"no application source changed", when that is the case>

TESTS
  <command, pass/fail counts>
  <new tests, and what they would catch>

BUILDS
  <build and typecheck results>
  <pre-existing failures, unchanged by this task>

REGRESSIONS
  <broader suites run and their results>
  <anything that degraded>

KNOWLEDGE UPDATED
  <docs changed and the claim each now makes>
  <"none">

MEMORY UPDATED
  <records added, superseded, or removed>
  <"none">

DEFERRED
  <what was deliberately left undone, and why>
  <what would need to happen to pick it up>

FINAL STATUS
  DONE | DONE WITH KNOWN GAPS | BLOCKED | PARTIAL
  <the one thing a reviewer should check first>
```

## Rules this report exists to enforce

1. **A report is not a summary of effort.** It states what is true now. "Added
   caching" is effort; "reads `/api/user` once per request instead of once per
   component render" is a result.
2. **Counts, not adjectives.** `79/79 passed`, not "tests pass". `0 drift`, not
   "docs updated". A number can be checked; "clean" cannot.
3. **Baseline failures belong in the report.** If typecheck had 61 errors before
   the task and 61 after, that is the result. Omitting it invites the reader to
   assume the task introduced or fixed them.
4. **DEFERRED is never empty by default.** If nothing was deferred, say so
   explicitly. An empty deferral list reads as "I did not think about it".
5. **MEMORY CONSULTED names IDs, not conclusions.** "Memory said the CORS fix
   was needed" is unverifiable. `DEC-004` is checkable.
6. **Status is not optimism.** `PARTIAL` with an accurate DEFERRED section is a
   better report than `DONE` with a gap discovered later. `BLOCKED` is a complete
   answer when the block is real.
7. **Never claim a check that was not run.** Every count in this report is
   copied from output, not from expectation.

## The one thing this template is not

It is not a status update. Partial progress is reported as `PARTIAL` with the
`DEFERRED` section filled in — not as a `DONE` report with a caveat appended,
and not as silence until the end.
