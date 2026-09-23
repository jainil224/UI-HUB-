# Research Playbook

> Phase 2 reference for UI-HUB Component Forge. Defines **when** the forge uses
> the internet, **how** it searches, which sources it trusts, what it costs, and
> how borrowed techniques are attributed and licensed. Load this during the
> "Research" step of the ANALYZE pipeline (`SKILL.md` §3 step 4).

---

## 1. When to search

Search only when at least one trigger is true:

1. **No codebase precedent.** The effect needs physics, math or shader techniques
   that none of the 29 indexed components (or the wider `frontend/src`) already
   implements. Example: true fluid simulation, signed-distance-field text,
   curl-noise advection.
2. **The user names a real-world reference.** "Like the Stripe gradient",
   "the Apple visionOS glass", "a Matrix rain", a specific site/artist/film.
   Use their reference to find the technique.
3. **A library API must be version-checked.** The effect needs a
   `three`/`framer-motion`/WebGL API whose current signature you are not certain
   of, and getting it wrong would break the build. Verify against the installed
   version (`frontend/package.json`), not a random blog.

### When NOT to search

- **An existing component already does ~80% of the job.** Read that component's
  source instead (it is the real precedent and matches repo conventions), borrow
  from it, and write in the spec: `No search needed: <Component> already
  implements <technique>.`
- The effect is pure layout/CSS you can express from Tailwind + the design tokens
  (`data/design-tokens.json`).
- The request is under-specified. Ask a question first; do not research a guess.

## 2. Query construction

- **3–6 words.** Long natural-language sentences return content-farm noise.
- **Search the technique, not the user's phrasing.** Translate the desired look
  into its technical name.
  - "make it look like flowing smoke" → `curl noise flow field canvas`
  - "cloudy sky background" → `fbm cloud shader glsl`
  - "images that follow the mouse" → `pointer trail image effect canvas`
  - "soft glow behind a shape" → `sdf glow shader fragment`
- **Add the platform/language** only if needed to disambiguate: `glsl`,
  `webgl`, `canvas 2d`, `three.js`, `framer-motion`.
- **Do not search the component name or "UI Hub".** No result will be relevant;
  the value is in the underlying technique.
- One technique per query. If an effect combines three techniques, run up to
  three focused queries rather than one broad one.

## 3. Source tiers (trust order)

Prefer the highest tier that answers the question. Reject anything below tier 3.

1. **Tier 1 — Primary sources.** Official docs, MDN, Khronos/WebGL specs, the
   library's own repository (source + examples + tests), the W3C/CSS spec, the
   `three.js` / `framer-motion` documentation for the installed version.
2. **Tier 2 — Technical write-ups with runnable code.** Blog posts, gist
   walkthroughs or papers that include complete, runnable snippets and explain
   the algorithm (not just "here is a shader"). Prefer those that state versions.
3. **Tier 3 — Shader galleries / reference material.** Shadertoy, Observable,
   CodePen, codesandbox demos — acceptable for understanding a visual technique
   and its parameters, but treat the code as a starting point to re-implement,
   never as production code to paste.

**Reject outright:**
- SEO listicles ("10 amazing CSS animations you must try").
- Content farms that rewrote MDN without adding substance.
- Sites that gate the actual technique behind a signup or show only screenshots.
- AI-generated tutorials with no runnable code or verifiable output.

## 4. Budget

- **3–8 searches total for technique research** (this step only). Use as few as
  resolve the uncertainty; 2–3 is normal for a well-precedented effect, 6–8 for a
  genuinely novel one.
- **Inspiration research is a separate, earlier step** (`references/09`) with its
  own 2–5 search budget. **Combined cap: 10 fetches per spec across both steps.**
- **Fetch the 2–3 best pages in full.** Read the whole page for the 2–3 highest-
  tier results; skim (snippet only) the rest to decide relevance.
- **Stop when the technique is understood well enough to implement** — meaning
  you can write the algorithm and name its parameters and failure modes in your
  own words. Stop when understanding is reached, not when more links exist.
- **Do not chain-explore.** Following citations indefinitely burns the budget.
  If a page cites another, only follow it if the first page does not actually
  explain the technique.

## 5. Attribution

- Every borrowed technique gets a **`Source:` line with the full URL** in the
  spec's `Research findings` section (see `references/06` §5). One line per
  distinct technique.
- If the spec says a technique was adapted, the `Source:` line must be present
  even when the final code shares little with the original.
- When the technique came from an existing component instead, cite the component
  `filePath` and line range, e.g. `Source: frontend/src/components/ui/Sky.tsx
  (cloud sprite baking)`.
- **Never paste more than a few lines of third-party code verbatim.** Restate
  the algorithm in our own implementation: our variable names, our structure,
  our comments, adapted to the repo's anatomy (`references/04`). The spec's
  `Full implementation` block must be original code that a reviewer could not
  diff against a tutorial.

## 6. Licence guard

- Before borrowing, note the source's licence (repo LICENSE, page footer, or
  Shadertoy's licensing toggle).
- If a technique traces to a **copyleft licence** (GPL/AGPL/CC-BY-SA) or a
  **non-commercial / "all rights reserved"** source:
  - do **not** copy code into the spec;
  - implement the technique independently from the underlying math where it is
    general knowledge, **or** choose an alternative technique;
  - always flag it in the spec's `Risks & open questions` section (see
    `references/06` §14) with the source and licence, e.g.:
    `Risk: curl-noise constants adapted from <URL> (GPL-3.0) — verify licence
    before shipping; algorithm is general but constants may be covered.`
- MIT / Apache-2.0 / BSD / CC0 / public-domain techniques are safe to adapt with
  attribution. Still restate, never paste.
- When unsure about a licence, treat it as restrictive and flag it. Never
  silently use a technique of unknown provenance.

## 7. Output of this step

By the end of research you should be able to write, without further searching:

- the **technique name** and a 2–4 sentence explanation of how it works;
- the **parameters** that drive the look, with sensible starting values;
- the **rendering tier** it implies (see `references/04`);
- any **perf/a11y caveats** (divergence, banding, motion sickness, GPU cost);
- the **`Source:` lines** (or the explicit "no search needed" note);
- any **licence flags** for `Risks`.

Put all of this in the spec's `Research findings` section and stop searching.
