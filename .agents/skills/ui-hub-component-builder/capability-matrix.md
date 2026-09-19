# Capability Matrix

Only capabilities supported by the repository are listed. Confidence column uses
the High/Medium/Low model from `evidence.md`.

| Capability | Interactive Background | Interactive Image | Technology | Evidence | Reusable? | Notes |
|---|---|---|---|---|---|---|
| Pointer-lerp tracking via refs | Yes | Yes | Canvas2D/DOM refs | BeamGridBackground:143, SpaceBackground (mouse/targetMouse), DriftwoodGallery:48-49 | Yes | Copy refs-as-state + lerp |
| rAF animation loop with cleanup | Yes | Yes | `requestAnimationFrame` + `cancelAnimationFrame` | SpaceBackground, OceanSwell:423, AsciiWater:912/1002 | Yes | Single loop, cancel on unmount |
| `ResizeObserver` canvas resize | Yes | Yes | ResizeObserver | BeamGridBackground, BlackHole:154-156, spiral-images, ReflectShader | Yes | DPR-aware sizing |
| DPR capping | Yes | Yes | `Math.min(devicePixelRatio, cap)` | OceanSwell (1.25), BlackHoleBackground/BlackHole (1.5-2), ReflectShader (2), InfiniteTendrils (2) | Yes | cap ≈1.25–2 |
| Raw WebGL fullscreen shader | Yes | No | `getContext('webgl')` + GLSL | WaveBackground, HellBackground, Lightfall, ReflectShader | Yes | uTime/uPointer assignments easing |
| three.js ShaderMaterial scene | Yes | No | `THREE.WebGLRenderer` + ShaderMaterial | GlobeMesh:698/761, OceanSwell:320/334, BlockDrift:367/378, Tornado:358 | Yes | GL context kept for lifetime |
| three.js InstancedMesh particles | Yes | No | InstancedMesh | Tornado, ParticleSphere:321 | Yes | Low draw calls |
| Canvas2D particle attraction/spring | Yes | No | 2d ctx | MagneticBackground, MouseGravityBackground, KineticGrid:183 | Yes | O(n), radius culling |
| Offscreen buffer caching (static layer) | Yes | No | hidden canvas | BeamGridBackground:91-97 | Yes | Avoids per-frame grid cost |
| FLIP fluid simulation (DOM glyphs) | Yes | No | DOM `<pre>` | AsciiWater:18/757/764 | Yes | single textContent write/frame |
| Physics sims: spring-mass / cloth / heat | Yes | No | Canvas2D | spider-web:299-305, Chandelier:388, FrostGlassMelt:160 | Yes | energy-based rAF parking |
| tsparticles integration | Yes | No | @tsparticles/react | sparkles.tsx, sparkles-background.tsx | Yes | `particlesLoaded` callback |
| CSS-only animated background | Yes (decor) | No | injected `<style>` keyframes | FallBeamBackground | Yes | GPU-composited |
| SVG stroked path animation | Yes | No | framer-motion path anim | background-paths.tsx | Yes | pathLength/pathOffset |
| Pointer → CSS transform parallax (per-layer multiplier) | No | Yes | `translate3d` + state | LoveAppHero:316/123/233, PaipaiKuaishou:452, DontBeGreedyFooter:27+ | Yes | discrete-state; prefers lerp for polish |
| Pointer tilt / 3D perspective on image | No | Yes | rotateX/rotateY + translate3d, preserve-3d | LumosHero:216-217/249 | Yes | respect reduced-motion (:205) |
| Clip-path split image reveal | No | Yes | `clipPath: polygon(...)` | SplitFuzzyOrbHero:30/50 | Yes | two halves, mirror transform |
| Scroll-scrubbed image sequence | No | Yes | GSAP ScrollTrigger scrub + canvas | Scroll3DAnimation:110/188 | Yes | preload frames |
| Scroll pinned full-image panels | No | Yes | GSAP ScrollTrigger pin | SectionScroll:6-7/134 | Yes | `hover:scale-105` zoom |
| Scroll parallax on image | No | Yes | framer-motion useScroll+useTransform | HaulFooter:20-21 | Yes | y range [-50,150] |
| Autoplay gallery with hover-pause | No | Yes | setInterval + state | DriftwoodGallery:26-34, testimonials-card:81, ThreeDSlider:108 | Yes | pause on hover; jump dots |
| CSS offset-path motion (lemniscate) | No | Yes | `offset-path: path()` | infinity-image | Yes | staggered negative delays |
| Pointer image trail with springs | No | Yes | framer-motion AnimatePresence | image-trail:56-57/196 | Yes | cap count, random keys |
| Mask + backdrop-filter glass on image | No | Yes | mask-image radial + backdropFilter | LoveAppHero (FrostedDistortion:114-130) | Yes | decorative layer |
| Canvas overlay drawn over an `<img>` | No | Yes | canvas z-above via `style.position:absolute` | RippleSignatureLedger:179/191-204 | Yes | dpr cap + ResizeObserver |
| Reduced-motion imperative guard | Yes | Yes | `window.matchMedia('(prefers-reduced-motion: reduce)')` | Tornado:16/1340, FrostGlassMelt:154, DriftwoodGallery:18, LumosHero:205, PaipaiKuaishou:744-774 | Yes | no global CSS rule exists |
| Touch fallback / disabling | Partial | Partial | `react-device-detect`; `pointer` events not `mouse` | CloudScroll (react-device-detect), UserCursor `(pointer: coarse)` :72 | Yes | prefer `pointer*` over `mouse*` |
| Decorative layer `pointerEvents: none` | Yes | No | inline style / CSS | BlackHole:522, AsciiWater:757, ReflectShader:318, DriftwoodGallery:146 | Yes | keeps content interactive |
| `aria-label` on canvas scene | Yes | No | `aria-label` attr | AsciiWater:1079, GlobeMesh:1224, OceanSwell:620, InfiniteTendrils:423 | Yes | describe scene meaningfully |
| Per-component data registration | Yes | Yes | `componentData.tsx` | all slugs (union :2632) | Yes | see examples/index.md |
| Full implementation code bundled for prompts | Yes | Yes | `embeddedSourceCode.ts` | all slugs | Yes | source strings are ground truth |

## Not-capable (absent, do not use)

| Capability | Status | Why |
|---|---|---|
| WebGPU compute | Absent | 0 matches in repo |
| Raw WebGL within R3F `<Canvas>` for these two categories | Absent | R3F only in CloudScroll bundle |
| `simplex-noise`-based noise | Absent | installed, unimported |
| Spline 3D backgrounds | Absent | installed, unimported |
| `unicornstudio` 3D | Absent | installed, unimported |
| GPU image displacement maps on `<img>` | Absent | not present in these categories (CSS filters only) |
| WebGL image displacement filter over images | Absent | not found (only canvas trails / three 3D scenes) |