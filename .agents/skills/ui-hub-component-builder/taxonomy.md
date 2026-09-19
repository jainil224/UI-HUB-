# Taxonomy

A taxonomy of the **only two** categories covered by this skill. Every entry is
grounded in repository source (`frontend/src/components/ui/`,
`frontend/src/components/templates/`, registry `frontend/src/data/componentData.tsx`).
Nothing below is speculative — anything "not present" is simply omitted.

---

## Category A — Interactive Background

### A1. Rendering-Technique Taxonomy

| Technique | How UI-HUB uses it | Verified examples |
|---|---|---|
| **Canvas 2D particle field** | `getContext("2d")` + rAF loop; particles stored in refs-backed arrays; pointer attraction/repulsion/springs | SpaceBackground, MagneticBackground, MouseGravityBackground, KineticGrid, BlackHoleBackground |
| **Canvas 2D grid / mesh** | cells or dots displaced near the pointer with lerp-to-home | InteractiveGridBackground, KineticGrid |
| **Canvas 2D procedural scene** | nebula gradients, Z-sorted 3D projection to 2D, additive trails | SpaceBackground, BlackHole (two stacked canvases) |
| **Canvas 2D simulation** | FLIP fluid, spring masses, Verlet cloth, heat diffusion, noise-current particles | AsciiWater, spider-web, Chandelier, FrostGlassMelt, InfiniteTendrils |
| **Raw WebGL fullscreen shader** | `getContext("webgl")` (or webgl2) + GLSL vertex/fragment; fullscreen quad/triangle; uniforms (uTime, uPointer, iResolution) | HellBackground, WaveBackground, Lightfall, ReflectShader |
| **Raw WebGL particle/GBuffer scenes** | custom shader programs, uniform blocks, additive premultiplied blending | GravitationalVortex, MorphingRings, BloomingFlower, PointDNAHelix, TwinGalaxyRings |
| **three.js + ShaderMaterial** | own `THREE.WebGLRenderer`, custom shaders on Points/InstancedMesh/quad | GlobeMesh, OceanSwell, BlockDrift, Tornado |
| **three.js + geometry + materials** | InstancedMesh, Points, sprites | Tornado, ParticleSphere |
| **tsparticles engine** | `@tsparticles/react` + `loadSlim` wrapper | sparkles-background (+ sparkles.tsx) |
| **DOM/CSS animation** | injected `<style>` keyframes, CSS transforms, Tailwind/v4 utilities | FallBeamBackground |
| **DOM/framer-motion scene** | `motion.div` grids, per-cell hover | isometric-grid-background (+ background-boxes) |
| **SVG + framer-motion** | animated `<path>` stroke/pathLength/pathOffset | background-paths (FloatingPaths) |

### A2. Interaction-Dimension Taxonomy

| Dimension | Trigger | Verified examples |
|---|---|---|
| Pointer/mouse follow | `mousemove`/`pointermove` → normalized coords → lerp | BeamGridBackground (:143), MagneticBackground (:87), MouseGravityBackground (:171), InteractiveGridBackground (:98) |
| Hover gate | `pointerenter`/`pointerleave` ramps | GravitationalVortex (:444), MorphingRings (:673), BloomingFlower, GlobeMesh (:887), TwinGalaxyRings |
| Hover + interaction boost | framer-motion `motionValue` + `animate()` | MorphingRings (:453), PointDNAHelix (:886), TwinGalaxyRings (:990) |
| Drag to orbit | `pointerdown` + window `pointermove/up` + inertia | OceanSwell (:404), ParticleSphere (:879) |
| Continuous ambient | rAF on `uTime`, no input | HackerBackground, HellBackground, WaveBackground, BlockDrift, Lightfall, StarBurst |
| Scroll-reactive | `useScroll`/ScrollTrigger/R3F `useScroll` | TwinGalaxyRings (:1042), CloudScroll bundle |
| Idle-resume simulation | rAF parks itself below energy threshold | spider-web (:329) |

---

## Category B — Interactive Image

### B1. Technique Taxonomy

| Technique | How UI-HUB uses it | Verified examples |
|---|---|---|
| **Pointer-follow trail** | spawn `<img>` at pointer, fade/shrink, spring physics | image-trail |
| **Snapshot/state transition** | click toggles two composed layouts with framer-motion | image-collage |
| **Pointer parallax (translate3d)** | normalized pointer → `translate3d` per layer with multipliers | LoveAppHero (×1.0 / ×0.4 / ×0.25), PaipaiKuaishou (×0.1–×0.8), DontBeGreedyFooter (×1.5–×6.5), Labs2586, MoodHero |
| **Pointer tilt/3D perspective** | pointer → `rotateX/rotateY` + `translate3d`, `preserve-3d`, click `scale-95` | LumosHero |
| **Clip-path split reveal** | two `<img>` halves clipped via `clipPath: polygon(...)`, mouse-offset transform | SplitFuzzyOrbHero |
| **Scroll-scrubbed image sequence** | GSAP ScrollTrigger scrub draws canvas frames from preloaded frame images | Scroll3DAnimation |
| **Scroll-triggered width/position expansion** | rAF lerp of width from scroll progress | ScrollExpand |
| **GSAP SnapScroll pinned image panels** | ScrollTrigger `pin` panels with full-bleed images (`hover:scale-105`) | SectionScroll |
| **Scroll parallax** | `useScroll` + `useTransform` on an `<img>` layer | HaulFooter |
| **Autoplay galleries/carousels** | index switching with spring physics; dot/arrow navigation; hover-pause | spiral-images (canvas), infinity-image (CSS offset-path), diagonal-carousel, perspective-carousel, testimonials-card, ThreeDSlider, ToonhubHero |
| **Canvas composition over image** | drawing overlay sprite layer on top of an `<img>` | RippleSignatureLedger |
| **Hover-parallax gallery (ref-driven)** | rAF + lerp writing styles straight to the DOM (zero re-renders) | DriftwoodGallery |
| **Mask/backdrop-filter reveal** | `mask-image: radial-gradient` + `backdropFilter` | LoveAppHero (FrostedDistortion) |

### B2. Interaction-Dimension Taxonomy

| Dimension | Trigger | Verified examples |
|---|---|---|
| Hover | `onMouseEnter/Leave`, `hover:` CSS, hover-pause of autoplay | SectionScroll (:221), DriftwoodGallery (hover-pause), infinity-image |
| Cursor-follow | `pointermove` + `translate3d` | image-trail, PaipaiKuaishou-style heroes |
| Click | toggles/selection/swaps | image-collage, PaipaiKuaishou (trick animation), AuCabaretPoster (artist swap) |
| Scroll | window/container scroll → scrub/expand/parallax | Scroll3DAnimation, ScrollExpand, SectionScroll, HaulFooter |
| Drag | pointer drag on canvas/sphere | ThreeDSlider (drag-less arrows), ParticleSphere drag-rotate |
| Autoplay | `setInterval` with pause | testimonials-card (:81), ThreeDSlider (:108), DriftwoodGallery (:29) |

---

## Relationship Between the Two Categories

- A background is **content behind content**: it rarely needs a11y semantics,
  uses `pointerEvents: none`, and is decorative.
- An image interaction is **content itself**: it is an `<img>` element that must
  keep `alt` text, stay keyboard-usable where clickable, and rarely uses
  `pointerEvents: none` on the interactive element.
- Both categories share the same engine disciplines: refs-as-state, lerp, rAF
  cleanup, ResizeObserver, DPR caps, reduced-motion. See `shared/`.

## Boundary Rules (from observations)

1. A full-bleed `position: fixed`/`inset: 0` canvas = Background.
2. A canvas that manipulates `<img>` textures or renders a picture sequence =
   Interactive Image (Scroll3DAnimation sits on this boundary; it is documented
   in the image category).
3. A card that tilts on hover but renders gradient/light only = not image
   (magic-card is a button/effect; excluded from the image category).
4. A gallery of photos = Interactive Image.