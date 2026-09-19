# Interactive Background — Patterns

Reusable structural patterns extracted from verified implementations.
Each pattern lists the components that prove it, key details, and edge-case
notes to preserve when regenerating.

## PATTERN A — Engine-class + React shell (structure)

**Shape:**
```tsx
function Component({ ...props }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MutableRefObject<Engine>>();
  useEffect(() => {
    const engine = new Engine(canvasRef.current!, props);
    engineRef.current = engine;
    return () => engine.destroy();
  }, [deps]);
  return <canvas ref={canvasRef} className={...} aria-label={...} />;
}
```
**Proof:** `OceanSwell.tsx` (Renderer class), `AsciiWater.tsx` (FlipFluid +
AsciiWaveScene), `BlockDrift.tsx`, `Tornado.tsx`, `KineticGrid.tsx`
`ParticleEngine`, `Chandelier.tsx` `ClothEngine` (class + embedded shaders).

**Why:** keeps all per-frame logic (canvas sizing, DPR, pointer mapping, loop,
dispose) inside one testable class; React component stays declarative and
StrictMode-safe (`destroy()` kills listeners + rAF).

**Regeneration note:** pass the container via ref at mount; resize in
`React.useEffect` after the engine exists (use a `useEffect` that re-renders the
engine on ref mount).

## PATTERN B — Refs-as-film-state

**Shape:** `const mouseRef = useRef({x:0, y:0, targetX:0, targetY:0});`
Loop reads `mouseRef.current`. **Never put pointer data in `useState`.**

**Proof:** `SpaceBackground.tsx` (two refs `mouse`+`targetMouse`),
`StarBurst.tsx` (single `rafRef` + all live state refs),
`BeamGridBackground.tsx` (`mouseRef`), `KineticGrid.tsx`,
`MagneticBackground.tsx`, `MouseGravityBackground.tsx`.

**Why:** React re-render per pointermove is the #1 perf killer. Canvas writing
happens per frame anyway (rAF), so we (and the loop) read mutable refs cheaply.

## PATTERN C — Pointer map + lerp follow

**Shape:** normalize pointer to container: `(clientX - rect.left) / rect.width`.
Chase with per-frame `factor` (lerp) or exponential `1 - exp(-dt * rate)`.

**Proof:** `ReflectShader.tsx` (`uPointer`, `FOLLOW_RATE = 8` :72, function at
:255 `1 - Math.exp(-dt * FOLLOW_RATE)`), `DriftwoodGallery` factor `0.09`,
`GravitationalVortex.tsx:463` `1-exp(-dt/HOVER_RAMP)`, `TwinGalaxyRings.tsx`
`uCurR/uCurS` (relative-position easing).

**Regeneration note:** cache the container rect (`getBoundingClientRect` once on
resize/init); avoid reading layout per event; use `(pointer.clientX - rect.left) * dpr`.

## PATTERN D — Scoped event binding + cleanup mirror

**Shape:** bind `pointermove/pointerdown/pointerup/pointerleave` on the scoped
`containerRef` (not `window` where avoidable); clean up every listener + rAF +
ResizeObserver on unmount.

**Proof:** `BeamGridBackground.tsx` (/143 mousemove, /242 cleanup),
`MagneticBackground.tsx` (window mousemove :87-90 + cleanup :147-150),
`PointDNAHelix.tsx:1426+` (massive cleanup list), `SpiderWeb` `pointerEvents`
listeners (:224).

**Why:** StrictMode double-mount would duplicate listeners otherwise; leaking GL
or DOM listeners burns battery.

## PATTERN E — ResizeObserver + DPR cap

**Shape:**
```ts
const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
canvas.width = Math.floor(container.clientWidth * dpr);
canvas.height = Math.floor(container.clientHeight * dpr);
```
Re-run in ResizeObserver. Re-derive dependent quantities on resize
(particle count, phone repelling radius, cell grid).

**Proof:** `BeamGridBackground.tsx:82-85`, `BlackHole.tsx:211-214`,
`KineticGrid.tsx` (sizes via `useEffect` on resize), `MouseGravityBackground.tsx`
(`ResizeObserver`), `OceanSwell` (DPR 1.25), `ReflectShader` (DPR 2),
`BlackHoleBackground` (`dpr 2`).

## PATTERN F — Idle & reduced-motion gate

**Shape:** `const reduceMotion = useReducedMotionJS()` → `running` flag; or park
loop when `energy < threshold && !pointerActive`.

**Proof:** `Tornado.tsx` custom `useReducedMotion` (matchMedia + listens) with
`running = !reducedMotion` :1340; `FrostGlassMelt.tsx:151-154` static frost frame;
`spider-web.tsx:329` energy parking.

## PATTERN G — Offscreen static-layer caching

**Shape:** pre-render static art to a hidden canvas; blit with `drawImage`
per frame (saves re-tracing grid/stars every frame).

**Proof:** `BeamGridBackground.tsx:91-97` (background grid buffer drawn once).

## PATTERN H — Additive layering & selective fade

**Shape:** `ctx.globalCompositeOperation = 'lighter'` for glow/trails;
`ctx.globalCompositeOperation = 'destination-out'` for fade/trail decay.

**Proof:** SpaceBackground (star glow), BlackHole (destination-out trail decay),
StarBurst (additive), MouseGravityBackground trails, MorphingRings
(premultiplied additive), GravitationalVortex (additive).

## PATTERN I — WebGL uniform binding once / set once per frame

**Shape:** `location = gl.getUniformLocation(...)` cached at init; per frame,
set `gl.uniform*` from host refs. No uniform lookup per frame.

**Proof:** WaveBackground, ReflectShader (:255 uniform writes), HellBackground,
GravitationalVortex (:463), TwinGalaxyRings (:1304 uniform set), GlobeMesh.

## PATTERN J — Multi-canvas layered stacking

**Shape:** 2+ stacked `<canvas>` with different tasks.

**Proof:** `BlackHole.tsx:236-237`, `TwinGalaxyRings` (stars + main),
`OceanSwell` (ocean + film layer), `GravitationalVortex` (2-canvas split for
perf), `MorphingRings` (DOM + canvas).

## PATTERN K — Scaled down UI wrapper with `useIsStaticRenderer` / preview mode

**Shape:** if running inside the library preview pane (static renderer flagged by
`useIsStaticRenderer`), render few frames then stop (thumbnails); rendering full
scene offscreen wastes battery in card previews.

**Proof:** `StarBurst.tsx` (`isStatic` draws 60 frames), `KineticGrid.tsx` switch.

## PATTERN L — Component-scoped glass surfaces

When the background contains a content panel, use UI-HUB glass recipe:
`backdrop-blur-xl bg-white/5 border-white/10` (e.g. demo wrappers / panels).

**Why:** matches brand design tokens; keeps the scene behind readable.

## PATTERN M — CSS GPU-compositing for DOM FX

**Shape:** for CSS-only backgrounds, animate `transform`/`opacity` only, use
injected `<style>` keyframes, avoid animated `left/top`.

**Proof:** `FallBeamBackground.tsx` (injected `@keyframes fall`), isometric grid
(uses transform-only), SVGs use `pathLength`+`pathOffset` (background-paths).