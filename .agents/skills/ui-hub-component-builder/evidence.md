# Evidence & Confidence

## Confidence Model

Every important technical conclusion in this knowledge base uses:

- **High** — directly verified by reading the source file (path + line quoted).
- **Medium** — supported by multiple signals (imports, greps, behavior, registry).
- **Low** — reasonable inference; **never** presented as confirmed fact.

Repository is the primary source of truth. External docs are used only to explain
a mechanism the repo already uses. No competitor/trend/category research is done.

## Evidence Log

### Technology stack

| Conclusion | Confidence | Evidence |
|---|---|---|
| React 19 + TS + Vite 6 + Tailwind v4 | High | `frontend/package.json:14-62`, `frontend/vite.config.ts` |
| CSS-first Tailwind v4 with classic `.ts` tokens | High | `frontend/src/index.css` (`@import "tailwindcss"`, `@theme`), `frontend/tailwind.config.ts` |
| `framer-motion`/`motion` dominant for DOM animation | High | imports in 25 files (16 `framer-motion` + 9 `motion/react`), e.g. `image-trail.tsx:4`, `background-paths.tsx:3`, `HaulFooter.tsx:2` |
| `gsap` + `@gsap/react` + `ScrollTrigger` for scroll work | High | `Scroll3DAnimation.tsx:7-10`, `SectionScroll.tsx:6-13`, `SmoothScroll.tsx:5-8/40-41` |
| Raw three.js (`WebGLRenderer` + ShaderMaterial) present | High | `GlobeMesh.tsx:698/761`, `OceanSwell.tsx:320/334`, `BlockDrift.tsx:367/378`, `Tornado.tsx:358` |
| No WebGPU | High | grep `WebGPU`/`navigator.gpu` → 0 matches |
| `simplex-noise`, `@splinetool/*`, `unicornstudio-react` installed-but-unused | High | `frontend/package.json:14-49`; import scan → 0 imports in `src/` |
| `@tsparticles/*` used only in `sparkles.tsx`/`sparkles-background.tsx` | High | file imports |
| No global `prefers-reduced-motion` CSS rule in `index.css` | High | `index.css` scanned; only JS `matchMedia` guards found (15 files) |

### Interaction & animation

| Conclusion | Confidence | Evidence |
|---|---|---|
| rAF single-loop + refs-as-state pattern | High | `SpaceBackground.tsx`, `StarBurst.tsx:294-300`, `AsciiWater.tsx:912/1002`, `BlockDrift.tsx:425/546` |
| Pointer-lerp via refs (no re-render) | High | `BeamGridBackground.tsx:143`, `SpaceBackground.tsx` (mouse/targetMouse refs), `DriftwoodGallery.tsx:48-49` |
| Hover ramps with framer `motionValue` + `animate()` | High | `MorphingRings.tsx:453/669`, `PointDNAHelix.tsx:768/886`, `TwinGalaxyRings.tsx:990` |
| Raw WebGL uniform-driven hover (exponential ease `1-exp(-dt*k)`) | High | `ReflectShader.tsx:26/72/255`, `GravitationalVortex.tsx:463` |
| Drag-to-orbit with inertia (yaw/pitch clamp) | High | `OceanSwell.tsx:303-304/392-393/477-487`, `ParticleSphere.tsx:879` |
| Canvas2D offscreen static-buffer caching | High | `BeamGridBackground.tsx:91-97` |
| Canvas2D energy-based rAF parking | High | `spider-web.tsx:329` (`energy < 0.5`, no pointer → park) |
| FLIP fluid (staggered pressure solve, fixed step) | High | `AsciiWater.tsx:18/928` |
| Reduced-motion guards (matchMedia) | High | `Tornado.tsx:13-23/1339-1340`, `FrostGlassMelt.tsx:151-154`, `DriftwoodGallery.tsx:18`, `RippleSignatureLedger.tsx:37`, `ScrollExpand.tsx:140` |
| Reduced-motion in template heroes zeroes parallax | High | `PaipaiKuaishou.tsx:744-774`, `LumosHero.tsx:205-206`, `LoveAppHero.tsx:428`, `MoodHero.tsx:761` |
| Image parallax via per-layer `translate3d` multipliers | High | `LoveAppHero.tsx:123/233/316`, `PaipaiKuaishou.tsx:211/233/452/505`, `DontBeGreedyFooter.tsx:27/36/45/56/78/116` |
| Image tilt `rotateX/rotateY` + click press | High | `LumosHero.tsx:216-217/246/249` |
| Clip-path split image reveal | High | `SplitFuzzyOrbHero.tsx:30/50` |
| GSAP ScrollTrigger scrub image sequence | High | `Scroll3DAnimation.tsx:110/123/188` |
| GSAP pinned panels + `hover:scale-105` images | High | `SectionScroll.tsx:6-7/134/221` |
| Scroll parallax via `useScroll`+`useTransform` | High | `HaulFooter.tsx:20-21` |
| CSS `offset-path` lemniscate images | High | `infinity-image.tsx` (motion-path per card) |
| Image trail with spring exit | High | `image-trail.tsx:56-57/196` |
| Canvas overlay above `<img>` (wax seal) | High | `RippleSignatureLedger.tsx:152/168/179/191-204` |
| Autoplay + hover-pause gallery | High | `DriftwoodGallery.tsx:26-34`, `testimonials-card.tsx:81`, `ThreeDSlider.tsx:108` |
| tsparticles integration (`particlesLoaded`→opacity) | High | `sparkles-background.tsx`, `sparkles.tsx` |
| DOM flash background via injected `@keyframes` | High | `FallBeamBackground.tsx` (embedded `<style>`) |
| SVG animated paths (background) | High | `background-paths.tsx` (36 paths, pathLength/offset, Infinity repeat) |
| Isometric DOM grid (framer-motion) | High | `isometric-grid-background.tsx`, `background-boxes.tsx:3` |
| Three.js InstancedMesh scenes | High | `Tornado.tsx:358` (InstancedMesh + onBeforeCompile), `ParticleSphere.tsx:321` |

### Registry & data layer

| Conclusion | Confidence | Evidence |
|---|---|---|
| Category union incl. `background`, `interactive-background`, `image-interaction` | High | `frontend/src/data/componentData.tsx:2632` |
| Slugs/entries verified for both categories | High | entries at lines 5977-7582 (interactive-background), 6188-6213/6778-7075/14970/14996 (image-interaction / background) |
| `magnetic-background` unregistered but lazy-mapped | High | `componentData.tsx:2682` (`UI_COMPONENTS['magnetic-background']`) |
| `CloudScroll/` unregistered | Medium | exists on disk; no `componentData.tsx` entry found (only `embeddedSourceCode.ts.bak`) |
| Preview capture panel default = interactive-background | High | `PreviewCapturePage.tsx`; `capture-previews.mjs` curated list |
| Prompt pipeline reads `embeddedSourceCode.ts` | High | `utils/promptUtils.ts` |

### Classification (Observed / Inferred / Unknown)

- **Observed:** every row above marked High.
- **Inferred (Medium):** R3F preferred only inside CloudScroll; framer-motion as
  "preferred" DOM engine is inferred from usage share (25 vs 14 files) — see
  `technology-stack.md` §2.
- **Unknown:** whether `interactive-component-builder` skill will merge with this
  knowledge base (unresolved); the intended audience/release of `CloudScroll/`.

## Unknowns & Gaps

1. `CloudScroll/` is present but unregistered — its patterns (R3F Canvas, drei
   `ScrollControls`) should NOT be treated as library conventions for the two
   categories until registered.
2. Exact per-component CSS class lists are not enumerated here (see
   `componentMetadata.ts` for `cssProperties`).
3. Some template heroes (e.g. Labs2586, MoodHero) have discrete parallax values
   — treat as reference, not as authoritative UI-HUB design tokens.
4. Preview thumbnails (`frontend/public/assets/component-previews/*.png`) exist
   for many components; regeneration validity not audited here.