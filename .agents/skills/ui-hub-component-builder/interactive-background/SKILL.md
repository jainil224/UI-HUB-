# Interactive Background — SKILL (instruction manual for a future coding agent)

## 1. Category definition

An **Interactive Background** is a decorative ambient scene that fills a
container or viewport and reacts to input (pointer/mouse/hover/scroll) or runs
continuous animation. It sits **behind** content, so it is almost always
`position: absolute; inset: 0` (or `fixed`) with `pointerEvents: none` on the
decor layer. In UI-HUB these are registered under `category: "background"` or
`"interactive-background"` (`frontend/src/data/componentData.tsx:2632`).

## 2. When to use it

- A hero/section/site backdrop: stars, particles, grids, meshes, gradients,
  fluid, shaders.
- An ambient decorative layer that must not block interaction.
- When the existing library needs a new `background`/`interactive-background`
  entry that matches UI-HUB's canvas/shader/particle techniques.

## 3. Existing UI-HUB implementations

32+ verified implementations — see `implementations.md` (full analysis) and
`source-map.md` (slug → file → technique). Headline examples:

- Canvas2D: SpaceBackground (stars/nebula), BeamGridBackground (grid+beams with
  offscreen buffer), MagneticBackground (spring particles), MouseGravityBackground
  (gravity wells), KineticGrid (dot mesh), BlackHole/BlackHoleBackground,
  InteractiveGridBackground, HackerBackground, StarBurst, spider-web, Chandelier,
  FrostGlassMelt, InfiniteTendrils, AsciiWater (FLIP).
- Raw WebGL: WaveBackground, HellBackground, Lightfall, ReflectShader
  (pointer-refracted bands), GravitationalVortex, MorphingRings, BloomingFlower,
  PointDNAHelix, TwinGalaxyRings.
- three.js: GlobeMesh, OceanSwell, BlockDrift, Tornado, ParticleSphere.
- DOM/CSS/SVG: FallBeamBackground, isometric-grid-background (+background-boxes),
  background-paths (SVG), sparkles-background (tsParticles).

## 4. Observed patterns

1. **Engine-class + React shell** (OceanSwell Renderer, AsciiWater FlipFluid,
   BlockDrift, Tornado): the imperative engine owns canvas/GL/rAF; React owns the
   wrapper. (Inferred - Medium)
2. **Refs-as-film-state** — pointer/particle state in refs, not state.
3. **Lerp chasing** — target mouse vs eased current.
4. **ResizeObserver + DPR cap** on canvas.
5. **Single rAF loop, cleaned up** in `useEffect` return.
6. **Additive blending** (`lighter`) for glow.
7. **Reduced-motion gate** — stop loop / static frame.
8. **Interaction scalar `motionValue`** for hover ramp (MorphingRings).

## 5. Technology / dependency rules

- Canvas2D for particle/fluid/grid FX (no external math libs).
- Raw WebGL (`getContext('webgl')`/`webgl2`) + GLSL strings for shader FX —
  works with zero extra deps; frame-sync via rAF. Use `useInView` to gate.
- three.js (`THREE.WebGLRenderer` + `ShaderMaterial`) for 3D scenes — hundreds of
  points with custom shaders. Keep ONE renderer; DPR cap; InstancedMesh/Points.
- framer-motion/motion only when driving DOM or hover `motionValue`.
- Do NOT import `simplex-noise`, `@splinetool/*`, `unicornstudio-react`
  (installed, unused). Do NOT use R3F for these two categories (CloudScroll only).

## 6. Interaction rules

- Prefer `pointer*` events; normalize coordinates against container rect, cache
  the rect (measure once).
- Hover = entry/leave ramps (GravitationalVortex:463 exponential ramp; MorphingRings
  `motionValue`); drag-orbit = `pointerdown` + window `pointermove/up` + inertia
  clamps (OceanSwell:392-393/482).
- Apply `pointerEvents: none` on the decorative canvas layer so content stays
  clickable (BlackHole:522, AsciiWater:757).
- If the interaction is a "search spotlight", respect scaled coordinates so the
  effect works inside library cards (MagneticBackground `containerRef` scoping).

## 7. Animation rules

- One rAF loop; delta-time clamp; fixed-step for physics solves (AsciiWater:928).
- Lerp/exponential smoothing for eased follows (ReflectShader:255).
- Pre-compute uniforms; set per frame; avoid per-frame allocation.
- Trail/glow: additive composite or `destination-out` fade on a low-res layer.
- Idle parking: park rAF when `energy < threshold` (spider-web:329).

## 8. Responsive rules

- Fill container (`absolute inset-0`), never fixed px.
- `ResizeObserver` → resize backing store with DPR cap `1.25–2`.
- Re-derive derived state (particle counts, grid) on resize.
- Gate to visibility with `useInView` when the loop is heavy (WaveBackground:68).
- Works at 320px→1440px+ in cards and full-screen. (See `shared/responsive.md`.)

## 9. Accessibility rules

- NO global reduced-motion CSS — add your own `matchMedia` guard:
  stop loop / static frame / zero parallax (Tornado:1339-1340, FrostGlassMelt:151-154).
- Add a meaningful `aria-label` to canvas scenes (AsciiWater:1079, GlobeMesh:1224).
- Decorative layers must not block content: `pointerEvents: 'none'`.
- If interactive (drag/click), expose keyboard-accessible controls or document
  the limitation.
- (See `shared/accessibility.md`.)

## 10. Performance rules

- DPR cap (1.25 OceanSwell → 2 others). Bound per-frame work with distance culling.
- Offscreen static-layer caching (BeamGridBackground:91-97).
- Instanced drawing for dense geometry; additive blending; no per-frame allocs.
- Clean up listeners/observers/rAF; one renderer per lifetime.
- `useInView` gating (WaveBackground), idle parking (spider-web:329).
- (See `shared/performance.md` + `performance-checklist.md`.)

## 11. Reusability rules

- Export a component with a small, typed props surface mirroring UI-HUB style
  (e.g. `radius`, `strength`, `speed`, `color` toggles as in KineticGrid,
  BeamGridBackground props like `gridColor/darkGridColor`).
- Self-contained: no global listeners on `document` unless unavoidable; use
  scoped `containerRef`.
- Register as `category: "background"` or `"interactive-background"` with the
  standard data-layer entries (see `examples/index.md`).

## 12. Common failure cases

1. Re-render per frame (using `useState` for particles) → jank.
2. Missing `pointerEvents: none` → page content unclickable.
3. No reduced-motion path → vestibular motion / battery drain.
4. Missing DPR cap → blurry or burn on high-density screens.
5. Heavy work without `useInView` → run in background tabs.
6. Context leak on unmount → duplicate loops under StrictMode.
7. Full-canvas clear each frame on large canvases → fill-rate heavy.
8. Fixed px sizes → overflow in cards/mobile.

## 13. Generation checklist

- [ ] Chose rendering tier: Canvas2D / raw WebGL / three / DOM-SVG / tsparticles.
- [ ] Refs-as-film-state; render happens inside the rAF loop.
- [ ] `ResizeObserver` + DPR cap; resize re-derives derived state.
- [ ] `pointer*` interactions (not `mouse*` only), rect cached, `touch-action` set
      when drawing.
- [ ] `pointerEvents: none` on the decorative layer.
- [ ] `useInView`/idle gating for heavy loops.
- [ ] Reduced-motion: static frame or stopped loop.
- [ ] Listeners/RAF/RO cleaned up in unmount.
- [ ] No new deps without checking `frontend/package.json` (never unused libs).
- [ ] Matches UI-HUB visual language (dark default, `brand-blue #3D5CFF`,
      glass = `backdrop-blur-xl bg-white/5 border-white/10`).
- [ ] Data-layer registration (componentData + embeddedSourceCode + metadata).

## 14. Validation checklist

- [ ] Runs in library card preview (`min-h-[380px]`, `useIsStaticRenderer`)
      and full-screen demo wrapper.
- [ ] `npm run lint` (tsc) passes; `npm run build` passes.
- [ ] Zero horizontal overflow at 320px→1440px+.
- [ ] `prefers-reduced-motion: reduce` → no animation, no crash.
- [ ] Touch: pointer events work without `click`-blocking `touch-action` issues.
- [ ] Content remains clickable above the layer.
- [ ] Preview capture renders at 1600×900 (Playwright `--enable-unsafe-swiftshader`);
      append slug to `scripts/announcement/capture-previews.mjs` list.

## 15. Evidence / source references

- SpaceBackground / BeamGridBackground / InteractiveGridBackground / KineticGrid /
  MagneticBackground / MouseGravityBackground — Canvas2D groups.
- ReflectShader (:26 uPointer, :72 FOLLOW_RATE, :255 exponential ease),
  WaveBackground (:2 useInView, :68 gate), HellBackground, Lightfall — raw WebGL.
- OceanSwell (:320 renderer, :334 ShaderMaterial, :392-393 orbit, :404 pointerdown),
  GlobeMesh (:698/:761), BlockDrift (:367/:378), Tornado (:13-23 reduced motion,
  :358 renderer), ParticleSphere (:321) — three.js.
- MorphingRings (:453 motionValue, :669 animate), PointDNAHelix (:1270 pointermove),
  TwinGalaxyRings (:990 hover, :1042 scroll) — hover motionValue ramps.
- AsciiWater (:18 FLIP, :757 pointerEvents none, :928 fixed step, :1079 aria-label),
  spider-web (:329 park), FrostGlassMelt (:151-154 reduced, :160 pointermove),
  Chandelier (:388 pointermove), InfiniteTendrils — Canvas simulations.
- FallBeamBackground, isometric-grid-background (+ background-boxes),
  background-paths (SVG), sparkles-background — DOM/SVG/tsparticles.
- Registry: `frontend/src/data/componentData.tsx` (union :2632).