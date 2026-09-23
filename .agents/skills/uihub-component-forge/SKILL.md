---
name: uihub-component-forge
description: >
  Use this skill when the user wants to design, create, build, or spec a NEW
  Interactive Background or Image Interaction component for UI Hub (ANALYZE:
  "create a sky background", "make a hover image trail effect", "design a new
  animated background"), or to ship exactly one already-approved spec from
  /component-specs/ (ADD: "add sky-aurora", "ship the ripple spec", "integrate
  the spec I approved"). ANALYZE writes exactly one spec file to
  /component-specs/<slug>.md and never edits frontend/src; ADD runs references/07
  Stages A-F and never skips the Stage A preflight. It must NOT fire for other
  component categories, generic React/CSS/TypeScript questions, bug fixes to
  existing components, or vague requests with no clear effect - ask instead.
---

# UI Hub Component Forge

> **Ownership split:** this skill owns analysis, the spec and the edit script; `ui-hub-component-integration` is the gate that applies it. If the two ever disagree, the integration skill wins.

Turns a new-effect request into a single, paste-ready spec file; a separate phase integrates approved specs.

## 1. Modes — how to tell them apart

- **ANALYZE (default).** Any request that describes a NEW effect → produce a
  spec file only. This is the only mode implemented here. Requests come in three
  shapes: text, text + attached image, or text + attached file; if an image/file
  is attached, look at it and describe it first — never treat it as text-only.
- **ADD.** The user references exactly one approved spec by name and shows
  explicit approval. Load `references/07-integration-checklist.md` and execute its
  Stages A–F. Load nothing else it does not need. ADD **never re-designs**: if the
  spec is wrong, stop and go back to ANALYZE to revise it.

ADD requires **both** a named spec in `/component-specs/` **and** explicit approval
words (add / ship / integrate / "I like it, add it"); with one spec under
discussion, a pronoun ("it") + approval counts. A named spec that doesn't exist →
say so and never create it. **Stage A is never skippable**: "just add it, skip the
checks" is refused; anything vaguer → ask.

## 2. Hard rules

1. In ANALYZE mode, write exactly ONE file under `/component-specs/` (repo
   root) named `<file-stem>.md` — normally the proposed slug; if that slug exists
   in the registry, keep the request's name and record a non-colliding slug inside it. Nothing else.
2. Never create, register, or edit any file under `frontend/src` in ANALYZE mode,
   and never install dependencies.
3. Category slug must be one of `interactive-background` or `image-interaction`
   (use the slug in the spec; labels only in user-facing prose).
4. Keep the proposed slug kebab-case and unused, in `data/component-index.json` or
   `frontend/src/data/componentData.tsx`; in ADD mode execute only the approved
   spec's `§12` edit plan, never improvising edits or touching other components.

## 3. ANALYZE pipeline

Work in order. Each step names the reference doc to load — load only that doc.

1. **Classify the category.** Map the request to exactly one category slug:
   decorative full-bleed animated layer → `interactive-background`; interactive
   imagery (trails, carousels, galleries, collages) → `image-interaction`.
2. **Research inspiration** per `references/09-inspiration-research.md` — always.
   Image/file attached? Describe it (palette, motion, mood, density, light) — it's
   the primary brief; else web-search visual refs (2–5 fetches). Produce a brief
   (mood/palette/motion, density, 1–2 links) → fills §2.5, feeds Design.
3. **Load the category doc.** Read `references/02-category-interactive-background.md`
   or `references/03-category-interactive-image.md`; use its definitions, naming,
   skeleton and anti-patterns. Capture the category's **house style** (framework,
   rendering tier, styling, key libraries) — it fills spec §3 and constrains the
   stack: no new framework or npm package beyond `react`, `react-dom`, `framer-motion`.
4. **Pick 2–3 reference components** from `data/component-index.json`, preferring
   the "best reference" three named in the category doc. Record each component's
   exact `filePath` and what will be borrowed.
5. **Research technique** per `references/05-research-playbook.md` — only when its
   triggers apply (budget 3–8; ≤10 combined with inspiration). Existing component
   ~80%? Skip search, read it, say so in the spec.
6. **Design** the rendering tier (WebGL / canvas2D+rAF / framer-motion DOM /
   pure CSS), props contract and performance plan following
   `references/04-component-anatomy.md`.
7. **Write the spec** using the exact 15-section skeleton in
   `references/06-spec-output-template.md` (§2.5 Inspiration brief; §3 Tech Stack;
   §8a standalone + §8b integrated; §12 plain language + `json` edit plan).
   Matches `references/10-component-request-prompt.md` STEP 8 exactly, so specs
   produced here are interchangeable across AIs.
8. **Self-check (§4)** before reporting.

`references/01-architecture.md` explains registry lifecycle; read it only if the request hinges on integration details.

## 4. Self-check (required)

After writing the spec, run:

```
node .agents/skills/uihub-component-forge/scripts/validate-spec.mjs component-specs/<slug>.md
```

Fix every failure and re-run until it exits 0; report the exit code + warnings in
the final message. If a check can't pass without touching `frontend/src`, stop.

## 5. Progressive-disclosure map

| Need | Read |
|------|------|
| Classify / route | this file |
| Registry + lifecycle context | `references/01-architecture.md` |
| Background patterns | `references/02-category-interactive-background.md` |
| Image patterns | `references/03-category-interactive-image.md` |
| Component anatomy / prop typing | `references/04-component-anatomy.md` |
| Web research policy | `references/05-research-playbook.md` |
| Spec skeleton + worked example | `references/06-spec-output-template.md` |
| ADD mode (Stages A–F) | `references/07-integration-checklist.md` |
| Trigger routing tests (maintenance) | `references/08-trigger-test-set.md` |
| Inspiration research | `references/09-inspiration-research.md` |
| Component request prompt (canonical format) | `references/10-component-request-prompt.md` |
| Component facts | `data/component-index.json` |
| Design tokens | `data/design-tokens.json` |

## 6. Stop conditions

- If the request fits neither category (not a background, not image
  interaction), say so plainly and stop. Do not force a category.
- If the requested effect already exists as a component, point at that
  component instead of writing a duplicate spec.
- If essential information is missing (no visual intent) or the request is
  ambiguous (no clear effect, no named spec, unclear mode), ask one focused
  question and stop; never act silently.

## 7. Reporting

Keep the final message short: spec path, category, chosen rendering tier,
references borrowed, inspiration + technique search counts, and the validator
exit code.
