# UI Hub Component Forge — README (for humans)

This skill helps design and ship **new** components for the UI Hub library, but only in
two categories: **Interactive Backgrounds** (`interactive-background`) and **Image
Interaction** (`image-interaction`). It works in two modes. **ANALYZE** researches an idea
and writes a single, reviewable spec file under `/component-specs/` — it never touches
`frontend/src`. **ADD** takes one spec you have already approved and applies it to the
app through a fixed, checkpointed procedure. It does **not** design during ADD, it does
**not** touch other categories, and it does **not** fix existing components.

## How to trigger it

**ANALYZE** — describe a new effect in the two supported categories (text only, or
text **plus a reference image / inspiration file** — the attached visual is read
and used as the primary look):

- "create a sky background"
- "I want a new hover effect on images"
- "design something like a lava lamp bg"
- "make it look like this image" (+ a screenshot attached)

**ADD** — name one spec that already exists in `/component-specs/` and say an approval
word (add / ship / integrate):

- "add sky-aurora"
- "ship the ripple spec"
- "I tested it, integrate it" (when exactly one spec is being discussed)

Anything vaguer — "update the background component", "add the new one" — should get a
clarifying question, not silent action. Asking to "skip the checks" is refused: the
Stage A preflight always runs.

## Committing the baseline (please do this)

The skill folder itself, the `/component-specs/` folder, and the earlier
`componentMetadata.ts` backfill are currently uncommitted. That makes the Stage A "is the
tree clean?" check noisy: every ADD run finds unrelated changes and needs a manual
"yes I accept". Committing that scaffolding as a **baseline commit** means future ADD
runs start from a clean tree, and the check becomes meaningful instead of a rubber
stamp. The preflight already auto-accepts skill/spec paths, so after a baseline commit
only genuine app-code changes will ever ask for acceptance.

## Where specs live and how to review one

Specs are plain Markdown in `/component-specs/<slug>.md`, with 15 fixed sections
(§2.5 *Inspiration Sources* records where the look came from). Before approving
an ADD, skim:

1. **§2 Visual Intent + §2.5 Inspiration Sources** — is this the effect you want?
2. **§7 Props Contract** — the knobs and their defaults.
3. **§8 Full Implementation** — the actual component code.
4. **§9 Performance / §10 Accessibility** — DPR cap, reduced-motion handling.
5. **§12 Integration Preview** — the exact edits ADD will make.

You can verify a spec yourself with:

```
node .agents/skills/uihub-component-forge/scripts/validate-spec.mjs component-specs/<slug>.md
node .agents/skills/uihub-component-forge/scripts/preflight.mjs   component-specs/<slug>.md
```

## If a run aborts mid-Stage-C

It is safe. The run recorded a rollback manifest in Stage A, and **Stage E** reverses it
exactly — deleting files it created and restoring files it modified from copies taken
before the run. Stage C refuses to apply a partial edit set: if an anchor matches zero or
two-plus times, it stops and rolls back rather than leaving the registry half-edited. Ask
the agent to run Stage E and re-check with `npx tsc --noEmit`.

## Known limitations (plainly)

- **No automated executor.** The agent applies the §12 edits by hand every run. Only the
  validator, preflight and scanner are scripts.
- **Two categories only.** No buttons, navbars, text effects, loaders, etc.
- **One component per ADD run.**
- **The 3-attempt compile gate is documentation-enforced**, not a coded retry loop: a
  component that will not compile is deleted, never registered.
- **Dirty-tree handling is heuristic:** `A7` auto-accepts only paths under
  `.agents/skills/` and `component-specs/`; anything else needs your explicit acceptance.
- **MCP mirroring is owned by the `ui-hub-component-integration` skill** and is run
  locally only (never pushed by this skill).
- **Reviews are manual.** The validator checks structure and obvious anti-patterns, not
  whether the effect looks good.

---

This skill was built in 4 phases with Claude; see `/component-specs/` for generated specs
and `.agents/skills/uihub-component-forge/references/` for its rules.
