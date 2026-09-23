# UI Hub — Interactive Background Component Request

> Copy this whole file (or the "THE PROMPT" section) and give it to your coding AI
> whenever you want a NEW component for the **Interactive Background** category.
> Fill in the `[EFFECT NAME]` and `[EFFECT DESCRIPTION]` lines before sending.

---

## WHEN TO USE THIS

Use this prompt any time you want to say things like:
- "create a sky background"
- "make a rain/storm effect"
- "design something like a lava lamp background"
- "I want a new animated background with floating particles"

It is for the **Interactive Background** category only. For hover/image effects
(Image Interaction category), use the equivalent Image Interaction prompt instead.

---

## THE PROMPT (copy from here down)

```
TASK: Design a new Interactive Background component for UI Hub.

EFFECT NAME: [EFFECT NAME — e.g. "Sky"]
EFFECT DESCRIPTION: [EFFECT DESCRIPTION — e.g. "a soft animated sky with slowly
drifting clouds, a subtle day/night gradient, and gentle parallax on mouse move"]

Do NOT write the component directly. Do NOT edit any file in frontend/src.
This is an ANALYZE-only task. Output is exactly one file: a spec markdown file.
Follow these steps in order.

--- STEP 1: SCOPE ---
Work only within the "interactive-background" category. Ignore every other
category in the component library (image-interaction, buttons, cursors, 3d,
loaders, navbars, footers, forms, text, scroll, effect, custom).

--- STEP 2: LOCATE ---
Find every existing component that belongs to the interactive-background category:
- the folder/files where these components live
- the registry entry that lists them (component array / config / metadata file)
- how one of them gets rendered in a live preview
State the exact file paths you found.

--- STEP 3: ANALYZE THE TECH STACK ---
Open and read EVERY existing component in this category (not just one). For each,
record:
  - Rendering technique: raw <canvas> 2D, WebGL/shaders, SVG, CSS-only/keyframes,
    or a library (e.g. framer-motion, three.js)
  - Animation loop: requestAnimationFrame, CSS animation, library-driven
  - Styling method: Tailwind classes, CSS module, inline styles, styled-components
  - Interactivity: does it react to mouse position, scroll, click, hover? How is
    the listener attached and removed?
  - Responsiveness: how it adapts to mobile — does it reduce particle/element count,
    disable effects, or resize a canvas via ResizeObserver / devicePixelRatio cap?
  - Performance safeguards: is there animation-frame cancellation on unmount, a
    prefers-reduced-motion check, a cap on device pixel ratio, memory cleanup?
  - Props: what props does it accept, with what types and defaults?
  - Colors/tokens: does it use hard-coded colors or the project's design tokens
    (CSS variables, Tailwind theme, a tokens file)? Name the source if tokens exist.

Summarize this as a short "house style" — the pattern that MOST existing components
in this category follow, and note any components that deviate from it.

--- STEP 4: PICK REFERENCES ---
From everything you just read, choose the 2-3 components CLOSEST in spirit or
technique to [EFFECT NAME]. Explain in one line each why they're the best fit
(e.g. shares the canvas+rAF pattern, similar organic motion, similar color-layering
approach).

--- STEP 5: INSPIRATION (always) ---
Before any technical research, decide what the effect should LOOK and FEEL like:
- If the user attached an image or a moodboard file, LOOK at it and describe it in
  concrete visual terms (palette, implied motion, mood, density, light source).
  That description is the PRIMARY brief — everything else supports it.
- If no image/file: search the web for visual references matching the prompt's
  mood/subject (e.g. "sky background animation inspiration", "codepen aurora
  effect", "dreamy pastel gradient ui examples"). Look at 3-5 results, preferring
  CodePen/CodeSandbox/Dribbble/Awwwards-style galleries over stock-photo sites.
- Spend 2-5 searches/fetches here. Combined with technique research below, cap
  total at 10 fetches.
- Output: a short Inspiration brief — mood/palette/motion words, density level,
  and 1-2 links that best match, noting only what LOOK was borrowed (palette,
  layout, motion style — never code). This fills section 2.5 of the spec.
- Never copy an implementation from a gallery result verbatim — inspiration
  informs the LOOK; the technique step and house-style analysis govern the CODE.

--- STEP 6: TECHNIQUE RESEARCH (only if needed) ---
If the requested effect needs a technique none of the existing components use
(e.g. a specific noise function, a physics behavior, a shader trick), search the
web for it. Prefer official docs, MDN, or technical articles with runnable code
over generic tutorials. Skip this step entirely if the existing codebase already
covers ~80% of what's needed — just say so.

--- STEP 7: DESIGN ---
Decide, and justify in one line each:
  - Which rendering tier fits best (canvas2D+rAF / WebGL / CSS-only / framer-motion)
    given what the "house style" and the effect itself need
  - The prop contract (name, type, default, purpose) — no `any` types
  - How this component will handle mobile, reduced motion, and cleanup, matching
    the patterns you found in Step 3

--- STEP 8: WRITE THE OUTPUT FILE ---
Create exactly one file: a spec named after the effect (kebab-case, e.g. `sky.md`).
It must contain these sections, in this order:

  1. Header — name, proposed slug, category, one-line pitch, date
  2. Visual intent — 3-5 sentences describing what the user will see and how it moves
  2.5 Inspiration sources — mood/palette/motion words; "image provided? yes/no"
      (+ one line describing it); reference links found and what specifically was
      borrowed (palette, layout, motion style — never code)
  3. Tech stack analysis — the "house style" summary from Step 3
  4. Reference components used — which ones, exact file paths, what's borrowed from each
  5. Research findings — technique + source URL, or "not needed: existing code covers this"
  6. Technical approach — chosen rendering tier + why, over the alternatives
  7. Props contract — table: name | type | default | purpose
  8. Implementation — TWO versions:
     8a. Standalone drop-in version — fully self-contained, only uses plain
         React + named npm packages (with version), all colors as literal values,
         zero references to this project's file paths, aliases, or types. This is
         the version safe to paste into a different AI or a fresh project.
     8b. Project-integrated version — the version that matches this codebase's
         conventions (design tokens, path aliases) exactly, ready to register.
  9. Performance plan — device pixel ratio cap, resize handling, animation-frame
     cleanup on unmount, prefers-reduced-motion behavior, mobile density reduction
  10. Accessibility — aria-hidden, pointer-events, contrast considerations
  11. Naming contract — file name, exported component name, and slug — all three
      must match/agree
  12. Integration preview — plain-language description of what would need to change
      to add this live (do not perform these changes)
  13. Test checklist — what to click/resize/toggle to verify it works
  14. Risks & open questions

--- STEP 9: SELF-CHECK ---
Before finishing, verify: no `any` types anywhere, cleanup logic is present,
prefers-reduced-motion is addressed, the naming contract in §11 is internally
consistent, §8a truly has zero project-specific dependencies, and §2.5 names the
inspiration honestly (or says none was found).

--- OUTPUT ---
Print a short summary: category confirmed, tech stack found, references chosen,
whether research was needed, and the path to the spec file you created.
```

---

## AFTER YOU GET THE SPEC

1. Open the generated `.md` file and read sections 2 (and 2.5 for the look's
   provenance), 6, and 8 first — that tells you what it looks like and how it's
   built.
2. If you want to test it in a totally separate AI tool first, copy just section
   **8a (Standalone drop-in version)** — that one has no dependency on this project.
3. If you like it and want it added to the live site, reply to your AI with
   something like: **"I tested [effect-name] and I like it, add it."**
   That's a separate step — this prompt only produces the spec, it never edits
   your live site.

---

## QUICK EXAMPLE (filled in)

```
EFFECT NAME: Sky
EFFECT DESCRIPTION: a soft animated sky with slowly drifting clouds, a subtle
day-to-dusk gradient, and gentle parallax when the mouse moves
```