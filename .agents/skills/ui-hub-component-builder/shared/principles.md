# Shared Design & Engineering Principles

Patterns found across BOTH categories. Classification rules:
**Observed** = directly verified in source · **Inferred** = strongly supported by
multiple signals · **Unknown** = insufficient evidence (never assume).

## Observed Patterns

### P1. Refs-as-state (film state lives outside React render)
Modern high-performance components keep per-frame mutable state in `useRef`
objects, never in `useState`. React renders once; the rAF loop mutates refs.
Evidence: `SpaceBackground.tsx` (mouse + targetMouse refs), `StarBurst.tsx`
(`rafRef`, all live state via refs), `BeamGridBackground.tsx` (`mouseRef`,
`lastMouseMoveRef`), `KineticGrid.tsx` (pointer `{-9999,-9999,active:false}`),
`MouseGravityBackground.tsx` (mouse `{x:-1000,...}`), `PixelDrift.tsx`
(`pointerRef`).

### P2. Pointer coordinate normalization
Pointer/mouse events are converted to normalized offsets before use:
`(clientX - rect.left) / rect.width`, with rects measured once (not per event).
Evidence: `ReflectShader.tsx` (uPointer), `AsciiWater.tsx:773`
(`getBoundingClientRect`), `LumosHero.tsx:216-217` (normY/normX → rotate).

### P3. Lerp / exponential smoothing for eased motion
Follow targets are chased with `current += (target - current) * factor` or
`current += (target - current) * (1 - exp(-dt * rate))`.
Evidence: `DriftwoodGallery.tsx:48-49` (factor 0.09), `ReflectShader.tsx:255`
(`1 - Math.exp(-dt * FOLLOW_RATE)`), `GravitationalVortex.tsx:463`
(`1-exp(-dt/HOVER_RAMP)`), `CursorLizard`/`StarCursor` lerp factors.

### P4. Single rAF loop + full cleanup
One `requestAnimationFrame` loop per component; every listener/observer/RAF
cancelled on unmount (owners are the components themselves).
Evidence: `BlockDrift.tsx:425/546`, `AsciiWater.tsx:912/1002`, `OceanSwell.tsx:423`,
`InfiniteTendrils.tsx (frame-stall clear)`, `PointDNAHelix.tsx:1426+` (heavy cleanup).

### P5. ResizeObserver + DPR scaling, done once
Canvas components observe their container and re-size backing store with a DPR
cap. Evidence: `BeamGridBackground.tsx:82-85` (`canvas.width = rect.width * dpr`),
`BlackHole.tsx:211-214`, `MagneticBackground.tsx` (particles re-derived on resize),
`SpiralImages` (DPR cap 2).

### P6. Idle / reduced-motion degradation
Loops park themselves or render one static frame when idle or reduced-motion.
Evidence: `spider-web.tsx:329` (parks when `energy < 0.5`), `FrostGlassMelt.tsx:151-154`
(static frost frame), `Tornado.tsx:1339-1340` (`running = !reducedMotion`).

### P7. Decorative layers set `pointerEvents: none`
Backgrounds let the content above them receive input.
Evidence: `BlackHole.tsx:522`, `AsciiWater.tsx:757`, `ReflectShader.tsx:318`,
`DriftwoodGallery.tsx:146`, `LazyTemplatePreview.tsx:74`.

### P8. Offscreen static-layer caching
Expensive static art is pre-rendered to a hidden canvas, then blitted per frame.
Evidence: `BeamGridBackground.tsx:91-97` (background grid buffer).

### P9. Layered DOM for depth (translate3d multipliers)
Image interactions stack depth by multiplying one normalized pointer vector by
per-layer factors. Evidence: `LoveAppHero.tsx` (×1.0/×0.4/×0.25),
`PaipaiKuaishou.tsx` (×0.1–×0.8), `DontBeGreedyFooter.tsx` (×1.5–×6.5).

### P10. Hover interaction encoded as a scalar `motionValue`
Hover state feeds `animate(mv, to)` so the render loop reads `mv.get()` — keeps
React out of the interaction path. Evidence: `MorphingRings.tsx:453/669`,
`PointDNAHelix.tsx:886`, `TwinGalaxyRings.tsx:990`.

### P11. `useGSAP` for ScrollTrigger lifecycle
`@gsap/react` `useGSAP` handles effect-scoped GSAP context and cleanup.
Evidence: `Scroll3DAnimation.tsx:110` (kill via `ScrollTrigger.getAll()` at :188),
`SectionScroll.tsx:41`.

### P12. Imperative reduced-motion (matchMedia)
No global CSS rule; each component checks `window.matchMedia('(prefers-reduced-motion: reduce)')`.
Evidence: `Tornado.tsx:13-23`, `FrostGlassMelt.tsx:154`, `DriftwoodGallery.tsx:18`,
`RippleSignatureLedger.tsx:37`, `ScrollExpand.tsx:140`.

## Inferred Patterns

### I1. Framer Motion is the default DOM-animation engine
25 files import `framer-motion`/`motion/react` vs 14 for `gsap`. Inferred engine
choice for new DOM UI animation. (Medium)

### I2. Canvas 2D is the default for unshaded particle/fluid visuals
More Canvas2D category components than raw WebGL. Infers a "2D first, shaders
when needed" rule. (Medium)

### I3. one component = one animation context
Each of the studied components owns exactly one WebGL renderer/context or one
2D context for its whole life (no context churn). (Medium — `Tornado.tsx`
"single renderer kept for lifetime", `BlockDrift.tsx`, `GlobeMesh.tsx`.)

### I4. component wrappers mirror an "engine class" + React shell
Backgrounds often structure React as a thin wrapper around a self-contained
class engine (`OceanSwell` Renderer class, `AsciiWater` FlipFluid/AsciiWaveScene,
`BlockDrift`, `Tornado`). (Medium)

## Unknown

- Audience/registration status of `CloudScroll/` (present, unregistered; its R3F
  patterns are not yet project conventions for these categories).
- Whether `interactive-component-builder` and this skill will merge.