# Source Map

Canonical map of: **component slug → file path → source files → dependencies →
technique → category**. Confidence: High (paths verified). Line anchors are
representative, not exhaustive.

## Interactive Background — `background` + `interactive-background` (registry: `frontend/src/data/componentData.tsx`)

| Slug | File (`frontend/src/components/ui/`) | Deps | Technique | Category |
|---|---|---|---|---|
| `space-background` | `SpaceBackground.tsx` | React only | Canvas2D stars/nebula/shooting stars; mouse-lerp via refs; rAF | background |
| `hacker-background` | `HackerBackground.tsx` | React only | Canvas2D matrix rain; `setInterval` column drops; DPR scaling | background |
| `beam-grid-background` | `BeamGridBackground.tsx` | React only | Canvas2D grid + beams; offscreen buffer caches static grid (bgCanvasRef :91-97); `mousemove` (:143); rAF; additive composite | background |
| `wave-background` | `WaveBackground.tsx` | framer-motion (`useInView` :2) | Raw WebGL GLSL wave shader; `iResolution/uTime/uSpeed/uIntensity`; view-gated rAF (:68) | background |
| `fall-beam-background` | `FallBeamBackground.tsx` | React only | DOM `<style>` + `@keyframes fall`; CSS gradient beams | background |
| `hell-background` | `HellBackground.tsx` | React only | Raw WebGL fragment shader (`iResolution/iTime/uColor`); `blurClassMap` backdrop-blur | background |
| `interactive-grid-background` | `InteractiveGridBackground.tsx` | React only | Canvas2D grid cells lerp to idle targets; `mousemove` (:98); glow radius 40 | background (premium) |
| `star-burst` | `StarBurst.tsx` | React only | Canvas2D radial streaks; one rAF `loop` (:294-300); `isStatic` export mode | background |
| `lines-background` | `background-paths.tsx` (`FloatingPaths`) | framer-motion | SVG paths animate `pathLength/opacity/pathOffset` (repeat Infinity) | background |
| `sparkles-background` | `sparkles-background.tsx` + `sparkles.tsx` | `@tsparticles/react`, `@tsparticles/slim`, framer-motion | tsparticles engine; radial mask; framer-motion opacity | background |
| `isometric-grid-background` | `isometric-grid-background.tsx` + `background-boxes.tsx` (`BoxesCore`) | framer-motion, `cn` | DOM motion.div iso grid; skewX(-48) skewY(14) scale(.8); per-cell hover flash | background (premium) |
| `black-hole-background` | `BlackHoleBackground.tsx` | React only | Canvas2D debris + event horizon; `mousemove` (:160); DPR cap 2 | background |
| `mouse-gravity-background` | `MouseGravityBackground.tsx` | React only | Canvas2D particles + gravity well; `mousemove` (:171); trail alpha decay | background (premium) |
| `kinetic-grid` | `KineticGrid.tsx` | React only | Canvas2D dot-mesh springs; `mousemove` (:183); R/PULL physics; trail | background |
| `gravitational-vortex` | `GravitationalVortex.tsx` | React only | Raw WebGL log-spiral streaks; hover ramp (:463); rAF `uTime` | interactive-background (premium) |
| `black-hole-3d` | `BlackHole.tsx` | React only | Canvas2D, **two stacked canvases** (:236-237), Z-sorted 3D→2D projection | interactive-background |
| `blooming-flower` | `BloomingFlower.tsx` | React only | Raw WebGL point cloud (60k-100k sprites); hover opens/closes | interactive-background (premium) |
| `chandelier` | `Chandelier.tsx` | React only | Canvas2D cloth sim with text-phrase cells; pointer grab (:388); wind | interactive-background (premium) |
| `spider-web` | `spider-web.tsx` | React only | Canvas2D spring-mass web; squared-falloff node push (:299-305); rAF parks when idle (:329) | interactive-background |
| `point-dna-helix` | `PointDNAHelix.tsx` | framer-motion + React | Raw WebGL vertex-shader helix; `uCursorNDC` (:258); hoverMV (:768); drag-to-spin (:1310) | interactive-background |
| `twin-galaxy-rings` | `TwinGalaxyRings.tsx` | framer-motion + React | Raw WebGL GPU point cloud; `uCursor/uCurR/uCurS/uHover` (:128-134); scroll tilt (:1042) | interactive-background (premium) |
| `tornado` | `Tornado.tsx` | three | three.js InstancedMesh + onBeforeCompile displacement; pointer repel (:797); custom `useReducedMotion` (:13-16); rAF (:1134) → stops if reduced motion (:1340) | interactive-background (premium) |
| `particle-sphere` | `ParticleSphere.tsx` | three | three.js InstancedMesh spheres; drag-throw rotation (:879); hover scatter + click burst; rAF (:807) | interactive-background |
| `morphing-rings` | `MorphingRings.tsx` | framer-motion (`motionValue`/`animate` :453) + React | Raw WebGL disc; SDF morph (circle/pentagon/heart); hoverMV (:669); two travelling waves | interactive-background (premium) |
| `block-drift` | `BlockDrift.tsx` | three | three.js + ShaderMaterial (:378); instanced cube stack; noise culling; beat-synced slide | interactive-background |
| `lightfall` | `Lightfall.tsx` | React only | Raw WebGL raymarched streak field; `uTime`; no pointer | interactive-background (premium) |
| `ascii-water` | `AsciiWater.tsx` | React only | DOM FLIP fluid rendered to hidden `<pre>` glyphs; pointer velocity brush (:764); `aria-label` (:1079) | interactive-background |
| `globe-mesh` | `GlobeMesh.tsx` | three | three.js icosahedron Points + 3 ShaderMaterials (:761/:779/:794); hoverDir (:669); rAF spin | interactive-background |
| `reflect-shader` | `ReflectShader.tsx` | React only | Raw WebGL refracted bands; `uPointer/uHover` (:26); `FOLLOW_RATE 8` (:72); exponential smoothing (:255) | interactive-background |
| `infinite-tendrils` | `InfiniteTendrils.tsx` | React only | Canvas2D noise-current ribbons; `followPointer` grip; rAF; DPR cap 2 | interactive-background |
| `ocean-swell` | `OceanSwell.tsx` | three | three.js ray-marched ocean ShaderMaterial (:334); drag-orbit yaw/pitch (:392-393); DPR cap 1.25; rAF (:423) | interactive-background |
| `frost-glass-melt` | `FrostGlassMelt.tsx` | React only | Canvas2D heat-cell frost; pointer warmth (:160); reduced-motion static frame (:151-154); `touch-action:none` | interactive-background |
| `magnetic-background` *(not in componentData; registered via `UI_COMPONENTS` lazy map, componentData.tsx:2682)* | `MagneticBackground.tsx` | React only | Canvas2D particles attracted/spring to base + mouse | interactive-background |

## Interactive Image — `image-interaction` + reverse-engineered cases

| Slug | File | Deps | Technique | Category |
|---|---|---|---|---|
| `spiral-images` | `spiral-images.tsx` | React only | Canvas2D Archimedean-spiral slide stream; rAF; DPR cap 2 | image-interaction |
| `infinity-image` | `infinity-image.tsx` | React only | CSS `offset-path` figure-eight lemniscate; staggered negative animation-delay; hover-pause; embedded reduced-motion `@media` (:138) | image-interaction |
| `image-trail` | `image-trail.tsx` | framer-motion | `<img>` trail spawning at pointer; `AnimatePresence` (:196); spring `stiffness:260 damping:22` (:56-57) | image-interaction |
| `image-collage` | `image-collage.tsx` | framer-motion | click toggles scattered/organized layouts; spring `bounce:0.4` (:71) | image-interaction |
| `diagonal-carousel` | `diagonal-carousel.tsx` | framer-motion | diagonal stack `<img>`; index switching; spring `bounce:.16 duration:.85` | image-interaction |
| `perspective-carousel` | `perspective-carousel.tsx` | framer-motion | perspective-transformed `<img>`; spring `bounce:.14 duration:.9` | image-interaction |
| `testimonials-card` | `testimonials-card.tsx` | framer-motion | avatar `<img>`; autoplay `setInterval` (:81) + arrows + dots; AnimatePresence | image-interaction |
| `card-cascade` | `CardCascade.tsx` | framer-motion, react-icons, lucide | CSS maskImage fade cascade of skill icons (no `<img>`; marginal) | image-interaction |
| `ripple-signature-ledger` | `RippleSignatureLedger.tsx` | React only | Canvas2D ink/seal overlay over `<img>` (:179); pointer draw (:152); reduced-motion (:37) | image-interaction |
| `driftwood-gallery` | `DriftwoodGallery.tsx` | React only | `<img>` slideshow; ref-driven rAF lerp tilt (×0.09 :48-49); hover-pause (:26-34); reduced-motion (:18) | image-interaction |
| `scroll-expand` | `ScrollExpand.tsx` (+ `ScrollExpand.css`) | React only | scroll width-expansion on `<img>`/`<video>`; rAF lerp; reduced-motion (:140) | scroll |
| `section-scroll` | `SectionScroll.tsx` | gsap + `@gsap/react` | ScrollTrigger pinned panels; `img1/2/3.jpg` (:219/257/271); `hover:scale-105` (:221) | scroll (premium) |
| `3d-scroll-animation` | `Scroll3DAnimation.tsx` | gsap + `@gsap/react` | canvas-scrubbed image sequence via ScrollTrigger scrub; `useGSAP` (:110) | 3d |
| `3d-slider` | `ThreeDSlider.tsx` | React only | CSS-transform 3D carousel `<img>`; autoplay 5000ms (:108) + arrows; `toggleUpsideDown`/`vertical` | 3d (premium) |
| `3d-hero` | `ToonhubHero.tsx` | React only | character PNG `<img>` figurine carousel; arrow nav; preloaded `new Image()` (:18-21) | 3d (premium) |
| `haul-footer` | `HaulFooter.tsx` | framer-motion | scroll parallax truck `<img>` via `useScroll`+`useTransform` `y:[-50,150]` (:20-21, :107) | footer |

## Interactive Image — template/demo-page evidence (`frontend/src/components/templates/`)

| Component | File | Technique (evidence) |
|---|---|---|
| SplitFuzzyOrbHero | `SplitFuzzyOrbHero.tsx` | mouse-offset state (:9), `clipPath: polygon` halves (:30, :50), `animate-orb-orbit/spin` (:33, :36, :53, :56) |
| LoveAppHero | `LoveAppHero.tsx` | pointer parallax tiers ×1.0/:0.4/:0.25 `translate3d` (:316/:123/:233), 0.12s ease (:317), mask radial + backdropFilter (FrostedDistortion :114-130), reduced-motion (:428) |
| PaipaiKuaishou | `PaipaiKuaishou.tsx` | layered parallax ×0.1–×0.8 (:211/:233/:452/:505), trick animation, reduced-motion zeroes parallax (:744-774) |
| DontBeGreedyFooter | `DontBeGreedyFooter.tsx` | multi-layer parallax ×1.5–×6.5 + rotateY (:27/:36/:45/:56/:78/:116) |
| LumosHero | `LumosHero.tsx` | pointer tilt `rotateX ±5°/rotateY ±6°` (:216-217), `translate3d` (:249), click `scale-95` (:246), reduced-motion (:205) |
| AuCabaretPoster | `AuCabaretPoster.tsx` | model `<img>` swaps on artist selection (:253/:280), arrow prev (:266) |
| Labs2586 | `Labs2586.tsx` | parallax ×1.5–×4 (:38/:88/:225), spring tilt rotateX/Y (:310-320) |
| MoodHero | `MoodHero.tsx` | pointer parallax `translate3d` ×2 (:780), reduced-motion (:761) |
| PortfolioClosing | `PortfolioClosing.tsx` | mouseOffset `mousemove` (:556), reduced-motion (:537-558) |

## Shared infra referenced by both categories

| Purpose | File |
|---|---|
| Component registry + categories | `frontend/src/data/componentData.tsx` (union :2632) |
| Exact source strings (prompts) | `frontend/src/data/embeddedSourceCode.ts` |
| Props + vibe metadata | `frontend/src/data/componentMetadata.ts` |
| Class helper `cn` | `frontend/src/lib/utils.ts` |
| Theme (dark default) | `frontend/src/context/ThemeContext.tsx` |
| Mobile detection `useIsMobile` | `frontend/src/hooks/use-mobile.ts` |
| Global CSS/tokens/keyframes | `frontend/src/index.css` |
| Build/aliases | `frontend/vite.config.ts` |

## Verification notes

- `magnetic-background` has **no** entry in `componentData.tsx`; it is lazy-mapped in
  `UI_COMPONENTS['magnetic-background']` (componentData.tsx:2682) and used inside the
  MagneticCursor preview.
- `CloudScroll/` (R3F scroll scene) exists on disk and in `embeddedSourceCode.ts.bak`
  but has **no** registry entry — treat as unregistered.
- Line numbers above were re-verified 2026-09-19; if a line drifts, grep the file
  for the anchor symbol instead.