---
name: ui-hub-component-builder
description: >
  Use this skill when working on UI-HUB components in the INTERACTIVE BACKGROUND
  and INTERACTIVE IMAGE categories ONLY. Provides the reverse-engineered
  knowledge base of how UI-HUB actually builds these two categories: real
  implementations, techniques, patterns, dependency rules, performance
  checklists, generation rules, and validation checklists. Activates the
  correct docs so a future coding agent can reproduce, register, and validate
  new interactive background/image components without re-reading the whole
  codebase. Do NOT use for cursors, buttons, text, loaders, navbars, footers,
  or other categories.
---

# UI HUB Component Builder — Interactive Background & Interactive Image

## 1. What This Skill Contains

This is a study/knowledge layer, not a component library. It documents how the
UI-HUB repository (`https://github.com/jainil224/UI-HUB-`, working copy at
`C:\Users\Admin\Documents\GitHub\UI-HUB-`) builds **Interactive Background** and
**Interactive Image** experiences today.

Every claim below is grounded in repository source. See `evidence.md` for the
confidence model and `source-map.md` for the canonical path map.

## 2. Strict Scope

This skill covers **exactly two categories**:

1. **Interactive Background** — full-bleed / section / ambient scenes that react
   to pointer, mouse, scroll, hover, or run continuous animation (Canvas2D,
   raw WebGL, three.js shaders, particles, DOM/CSS/SVG).
   → see `interactive-background/SKILL.md`
2. **Interactive Image** — `<img>` / texture components driven by hover,
   cursor-follow, reveal, mask/clip-path, zoom, tilt, parallax, drag, gallery,
   scroll-scrub, or state transitions.
   → see `interactive-image/SKILL.md`

**Out of scope (do NOT expand into):** cursors, buttons, text animations,
loaders, navbars, footers, forms, admin. The `componentData.tsx` category union
(`frontend/src/data/componentData.tsx:2632`) contains many categories; this
skill only concerns `background`, `interactive-background`, and
`image-interaction` (plus the `3d`/`scroll`/`footer` demo components that were
reverse-engineered because they contain interactive images).

## 3. How a Future Agent Should Use This Skill

1. **Read `README.md`** — purpose, scope boundaries, how the knowledge base maps
   to the repo.
2. **Read `taxonomy.md`** — the vocabulary of the two categories.
3. **Read `source-map.md`** — find which existing component already implements
   the effect you need, and where its files live.
4. **Read the category docs** for the category you are working in
   (`interactive-background/` or `interactive-image/`):
   - `SKILL.md` — the instruction manual (definition, rules, checklists).
   - `implementations.md` — every verified implementation with structure,
     rendering, interaction, animation, visual pipeline.
   - `patterns.md` — the generalized reusable patterns.
   - `techniques.md` — how each visual result is produced.
   - `dependencies.md` — dependency → feature mapping (what is already installed).
   - `performance-checklist.md` — completion checklist.
   - `generation-rules.md` — explicit rules for generating new components.
5. Read `shared/` for cross-cutting rules (principles, performance, responsive,
   accessibility, anti-patterns).
6. Read `capability-matrix.md` and `agent-memory.md` for quick decision tables.
7. Stay inside the two categories. Never invent technologies.

## 4. Non-Negotiable Rules (summary)

1. **Repository is the source of truth.** Do not invent libraries, techniques,
   or architecture. `simplex-noise`, `@splinetool/*`, and `unicornstudio-react`
   are installed but **unimported** (`frontend/package.json:14-49`) — they are
   NOT native UI-HUB techniques for these categories.
2. **Reuse the existing stack:** React 19 + TypeScript + Vite 6 + Tailwind v4.
   DOM animation → `framer-motion`/`motion`; scroll sequencing → `gsap` +
   `ScrollTrigger`; 3D/GPU → raw `three` + `THREE.ShaderMaterial` or Canvas2D.
3. **Never break production.** During documentation/analysis work, do not
   redesign, refactor, change routes/APIs/deps, or modify styling.
4. **Every conclusion carries evidence + confidence** (`evidence.md`).
5. **Clean up.** Listeners, rAF loops, and ResizeObservers must be torn down.
6. **Respect reduced motion** imperatively via `window.matchMedia` (there is no
   global CSS `prefers-reduced-motion` rule in `index.css`).
7. **Registration pipeline** (if a component is ever added): `components/ui/`
   file → `data/embeddedSourceCode.ts` → `data/componentData.tsx` entry →
   optional demo page. See `examples/index.md`.
8. **ADD by default.** Never remove or restructure existing entries.

## 5. Quick Reference — Stack Facts (High confidence)

- **Runtime deps relevant to these categories:** `framer-motion` `^12.34.4`,
  `motion` `^12.34.5`, `gsap` `^3.14.2`, `@gsap/react` `^2.1.2`, `three`
  `^0.183.2`, `@react-three/fiber` `^9.5.0`, `@react-three/drei` `^10.7.7`,
  `@tsparticles/*` `^3.x`, `react-device-detect` `^2.2.3`,
  `lucide-react`/`react-icons`, `lenis` `^1.3.18` (`frontend/package.json:14-49`).
- **No WebGPU anywhere** (0 matches for `WebGPU`/`navigator.gpu`).
- **Raw WebGL/GLSL** confirmed in `WaveBackground.tsx`, `HellBackground.tsx`,
  `Lightfall.tsx`, `ReflectShader.tsx`, `GravitationalVortex.tsx`,
  `MorphingRings.tsx`, `BloomingFlower.tsx`, `PointDNAHelix.tsx`,
  `TwinGalaxyRings.tsx`, and GLSL inside three `ShaderMaterial`s in
  `GlobeMesh.tsx`, `OceanSwell.tsx`, `BlockDrift.tsx`, `Tornado.tsx`.
- **Canvas2D** confirmed in `SpaceBackground.tsx`, `BeamGridBackground.tsx`,
  `HackerBackground.tsx`, `MagneticBackground.tsx`, `MouseGravityBackground.tsx`,
  `KineticGrid.tsx`, `InteractiveGridBackground.tsx`, `BlackHole.tsx`,
  `BlackHoleBackground.tsx`, `StarBurst.tsx`, `spider-web.tsx`, `Chandelier.tsx`,
  `FrostGlassMelt.tsx`, `AsciiWater.tsx`, `InfiniteTendrils.tsx`,
  `Scroll3DAnimation.tsx`.
- **Pure DOM/CSS/SVG:** `FallBeamBackground.tsx` (CSS keyframes),
  `isometric-grid-background.tsx` + `background-boxes.tsx` (framer-motion DOM),
  `background-paths.tsx` (SVG + framer-motion).
- **tsparticles:** only `sparkles.tsx` + `sparkles-background.tsx`.

## 6. Where Things Live (High confidence)

```
frontend/src/components/ui/            <- component source (all categories)
frontend/src/components/templates/     <- full-page template demos (image interactions)
frontend/src/components/animations/     <- text/visual FX (out of scope except noted)
frontend/src/data/componentData.tsx      <- component registry (categories at :2632)
frontend/src/data/embeddedSourceCode.ts  <- exact source strings (prompt ground truth)
frontend/src/data/componentMetadata.ts   <- props + vibe metadata
frontend/src/context/ThemeContext.tsx    <- dark/light (default dark)
frontend/src/index.css                   <- global CSS + design tokens (NO reduced-motion rule)
frontend/vite.config.ts                  <- aliases + manual chunks
frontend/tailwind.config.ts              <- tokens (brand-black, brand-blue; brand-green legacy alias)
```

## 7. Evidence Discipline

- **High** — directly verified by reading the source.
- **Medium** — supported by multiple signals (imports + greps + behavior).
- **Low** — reasonable inference, never presented as fact.

Cite `path:line` wherever possible. If a technique is not in the source, it is
not documented.