# TASK EXECUTION TEMPLATE

> Canonical for area **A — intake and preparation**. The procedure lives in
> `AGENT_WORKFLOW.md` sections 1-5; this file is the record that procedure leaves
> behind. Do not merge the two: the contract says what must happen, this says
> what must be written down.

Every task produces one of these, in order, while the work is happening. It is
filled in as the task runs, not reconstructed afterwards — a record written from
memory at the end is a record of what the author remembers doing.

## The template

```text
Task
  <the request as given, not as interpreted>

Intent
  <what outcome the requester actually wants, in one sentence>
  <what would count as done, stated before any code is read>

Category
  <the routing category agent:route assigned>
  <why that category, if it was not obvious>

Memory consulted
  <record IDs returned by agent:memory, or "none">
  <what each one contributed, or "nothing changed my plan">

Context selected
  <files agent:context or agent:prepare put in the bundle, with the reason each earned its place>
  <files deliberately excluded, when an exclusion was a judgement call>

Protected paths
  <paths under DO_NOT_CHANGE that this task touches: none expected>
  <if any are touched: the explicit authorisation and who gave it>

Planned changes
  <what will be written, before it is written>
  <what is explicitly out of scope>

Actual changes
  <what was written>
  <every divergence from the plan, and why>

Tests
  <command, exact output summary, pass count>
  <tests added, and what each one would fail on if the change were reverted>

Build
  <build or typecheck command, and result>
  <baseline: what was already failing before this task, unchanged>

Regression
  <the broader suites run, and that they match the pre-task baseline>
  <anything that got worse, even by one assertion>

Knowledge updates
  <docs created or edited, and the claim each now makes>
  <"none - no durable claim changed">

Memory updates
  <records added, and what future session they will save>
  <records superseded, and by what>
  <"none - nothing worth remembering">

Final status
  DONE | DONE WITH KNOWN GAPS | BLOCKED | PARTIAL
  <one line on what a reviewer should check first>
```

## Rules this template exists to enforce

1. **Memory is recorded, not obeyed.** `Memory consulted` records what was read
   and what it changed. If memory changed the plan, that is a finding to report,
   not a decision to hide. Memory never decides what gets opened or edited — see
   `../memory/MEMORY_OVERVIEW.md`.
2. **Planned before actual.** Both fields exist because the gap between them is
   the useful signal. An empty `Planned changes` means the work was not
   understood before it started.
3. **The baseline is part of the result.** `Build` and `Regression` record what
   was already failing. A task that leaves a known failure and says so has
   reported honestly; a task that hides it has not.
4. **"None" is a valid, required answer.** Every field is filled. An empty
   `Memory updates` is a real claim: that this task taught the system nothing.
5. **Divergence is normal; silence about it is not.** `Actual changes` differing
   from `Planned changes` is expected and fine. Not recording the difference is
   the defect.
6. **Protected paths are named even when the answer is none.** "I did not check"
   and "I checked, there are none" are different statements.

## What this template is not

- It is not the final report. That is `AGENT_REPORT_TEMPLATE.md`, which is
  written for a reader who was not present.
- It is not a knowledge document. Knowledge docs state durable facts about the
  codebase; this states what happened during one task.
- It is not mandatory to file. Not every task warrants a permanent artifact. When
  this is filled in for a throwaway task, keep it in the session, not the repo.
