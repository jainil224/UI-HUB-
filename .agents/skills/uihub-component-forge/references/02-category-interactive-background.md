# Category Reference: `interactive-background`

> Phase 1 research output for UI-HUB Component Forge. Every claim is cited to
> `frontend/` source or to `.agents/skills/uihub-component-forge/data/component-index.json`
> (the verified index). Citations use `file — near <unique string>` anchors, never
> line numbers, so they survive file edits.
>
> **Registry stub:** categories allow `interactive-background`
> (`frontend/src/data/componentData.tsx` — near `export type ComponentItem`).
> **21 registered components.**

---

## 1. Definition & inclusions

`interactive-background` = full-bleed, self-contained decorative layers that react to
pointer (hover / drag / click), auto-animate, and sit behind content. In this repo
they are homogeneous:

- Every one of the 21 is a **single self-contained `.tsx` file** in
  `frontend/src/components/ui/`.
- 16 are canvas-based (raw-rAF loops; 4 of them wire `motion/react` motion values
  around the loop); 5 use raw three.js (Tornado, BlockDrift, GlobeMesh, OceanSwell,
  EmberHusk).
- ZERO of them depend on each other or on shared UI primitives; the only shared
  deps are `react`, `three`, and `motion/`(framer-motion).
- All take a `background`/color family prop and a `style` escape hatch; most take
  `width`/`height` legacy props that are ignored in modern versions.

Source: `data/component-index.json` (dependencies + stylingMethod fields).

## 2. Register facts (id → file)

| id (slug) | file | lines |
|---|---|---|
| gravitational-vortex | `GravitationalVortex.tsx` | 558 |
| black-hole-3d | `BlackHole.tsx` | 528 |
| blooming-flower | `BloomingFlower.tsx` | 640 |
| chandelier | `Chandelier.tsx` | 440 |
| spider-web | `spider-web.tsx` | 513 |
| point-dna-helix | `PointDNAHelix.tsx` | 1530 |
| twin-galaxy-rings | `TwinGalaxyRings.tsx` | 1420 |
| tornado | `Tornado.tsx` | 1485 |
| particle-sphere | `ParticleSphere.tsx` | 1403 |
| morphing-rings | `MorphingRings.tsx` | 805 |
| block-drift | `BlockDrift.tsx` | 696 |
| lightfall | `Lightfall.tsx` | 409 |
| ascii-water | `AsciiWater.tsx` | 1095 |
| globe-mesh | `GlobeMesh.tsx` | 1253 |
| reflect-shader | `ReflectShader.tsx` | 325 |
| infinite-tendrils | `InfiniteTendrils.tsx` | 452 |
| ocean-swell | `OceanSwell.tsx` | 657 |
| frost-glass-melt | `FrostGlassMelt.tsx` | 514 |
| sky | `Sky.tsx` | 453 |
| rain-storm | `RainStorm.tsx` | 629 |
| ember-husk | `EmberHusk.tsx` | 1978 |

Registry assignments live in `frontend/src/data/componentData.tsx`:
`interactive-background` blocks at `:5988-6017`, `:6189`, `:7104-7622`,
`:15071-15137`.

## 3. Naming conventions (critical)

Observed patterns — new components MUST follow the "modern" rows, not the legacy ones:

- **File name:** PascalCase (`GravitationalVortex.tsx`) for modern builds,
  kebab-case (`spider-web.tsx`, `image-trail.tsx`) for ported/older ones.
  PascalCase only for files that match their export.
- **Default export name == title-case component:** the norm.
- **Known export/file mismatches (do NOT copy):**
  - `Tornado.tsx:?` → `export default function Vortex(...)` (file ≠ export ≠ slug).
  - `GlobeMesh.tsx` (near `export default function Globe`) exports `Globe` but
    registry id and Detail page render `GlobeMesh` (seen in `componentData.tsx`
    renderers).
  - `AsciiWater.tsx` (near `export default function AsciiWave`) exports `AsciiWave`.
  - `ReflectShader.tsx:?` → `export default function ShaderGroupSwitcher(...)`
    while id/slug is `reflect-shader`.
  - `BlackHole.tsx` (near `export default function BlackHole`) exports `BlackHole` (NOT `BlackHole3d`).
  - `ParticleSphere.tsx:?` → `export default function ParticleSphereRefactor(...)`.
- **Slug is the registry id**, not derived from the file. The `componentData.tsx`
  lazy map keys on slug and `renderComponent` picks the lazily-loaded default
  (`componentData.tsx` — near the `UI_COMPONENTS` lazy map). Slug and default-export name must match the
  component intended for preview.
- **Props interface:** legacy components use `props: Record<string, unknown>` and
  do `const { ... } = props as Props` internally (e.g. `Chandelier.tsx` — near
  `export default function Chandelier`, `BlockDrift.tsx` — near
  `export default function BlockDrift`). Modern ones use a `Props` interface next to the component
  (`BlackHole.tsx` — near `export default function BlackHole`, `GravitationalVortex.tsx` — near
  `GravitationalVortexProps`).

## 4. Best reference components (READ THESE FIRST)

1. **`GravitationalVortex.tsx`** — cleanest WebGL skeleton. Demonstrates: named
   `GravitationalVortexProps` interface + typed defaults; back-compat **prop
   aliases** (`backgroundColor`→`background`, `particleColor`→`baseColor`,
   `vortexTwist`/`funnelDepth`→`vortex.twist/funnel`) merged with overrides; single
   rAF loop; pointerenter/leave/cancel handlers; canvas DPR cap (2); full cleanup
   (cancel rAF, remove listeners, `gl.deleteBuffer/program`). Cite: `:264-289`,
   wrapper CSS min 1200x800 in index (`responsive` field).
2. **`BloomingFlower.tsx`** — best example of WebGL + Framer Motion interop. Uses
   `motion/react` `useMotionValue` for the interactive bloom (`BloomProgress`) and a
   `transition` prop (`{ type: 'tween', ease: [0.44,0,0.56,1] }`). Demonstrates
   separating GL lifecycle from the rAF from motion values. Cite: `:320`
   (default export), deps `motion` (index).
3. **`BlackHole.tsx`** — dual-canvas (bg + fg) with `destination-out` trail
   compositing; **ResizeObserver**-driven resize; DPR cap 1.5; rAF stored in an
   `animRef` and cancelled on unmount; particle re-init keyed on a `sizeVersion`
   counter so resizes don't rebuild the sim every frame. Cite: `:99`, index
   `performanceNotes`.
4. **`EmberHusk.tsx`** — WebGL-scene tier reference (the densest three.js rebuild).
   Demonstrates: a **fixed-timestep physics loop** (`PHYS_STEP` 1/120, up to 5
   substeps, 0.88 damping) integrated into the single rAF render loop; **glow via
   down/up-sampled render targets** (PREFILTER/DOWN/UP/COMPOSITE chain) instead of
   a full-res composite; polyhedral `HULL_PLANES` shard clipping on a cracked rock
   shell with noise-lit fragment shaders; staggered per-shard entrance
   choreography; pointer `response.{reach,strength,repel,settle}` mapping pointer
   distance into a repel force with spring-back; every control group is a typed
   object of **normalized 0–10 sliders**, plus a `quality: "low"|"medium"|"high"`
   tier that scales DPR cap + render-target resolution. Cite: `:1528`
   (IntersectionObserver parking), `:73` (`DEFAULTS`), index `performanceNotes`.

Use these four whenever you need to prove a pattern; the other 17 follow the same
shape with more/less custom math.

## 5. Recurring skeleton

Almost every one matches this layout (verified in `GravitationalVortex`, `BloomingFlower`,
`BlackHole`, `spider-web`, `MorphingRings`, `Lightfall`, `GlobeMesh`, `AsciiWater`):

```
imports (react + optional [three | motion])
interface Props | type Props = { ... }          // most use a local Props interface
const DEFAULT_PROPS / destructure with defaults   // e.g. Vortex twist:{28,54}
export default function X(props) {
  const wrapperRef = useRef
  const canvasRef / containerRef                 // WebGL or 2D
  const stateRef = useRef (sim objects, particle arrays)
  const animRef = useRef<number>()               // rAF id
  // props merging: projections/aliases (GravitationalVortex aliases)
  // effect 1: resize (ResizeObserver or window resize; DPR cap)
  // effect 2: init GL context + buffers + uniform locations
  // effect 3: rAF loop = update(dt) + draw()
  // cleanup: cancelAnimationFrame; disconnect RO; removeEventListeners; deleteGL
  // pointer & interaction handlers (hoverStrength, drag pull, click burst)
  return <div ref style={{width:100%,height:100%}}><canvas … /></div>
}
```

Canvases are **full-bleed** (`width/height: 100%`); content lives in CSS `background`
behind them; a `background` prop sets that CSS color. No wrapper padding.

## 6. Props & defaults conventions

- Props are **number | string | boolean | short objects | string[]** — no nested
  component props, no children.
- Objects like `vortex`, `flower`, `tilt`, `cloth`, `ring` are partial-merged over a
  DEFAULT object (**not** spread over raw user input — union objects are validated).
- Legacy flat aliases (e.g. `vortexTwist`) are kept for API stability and merged
  AFTER the object, so flat wins (`GravitationalVortex` index props list).
- Default palettes are neon-on-dark (`background` ~`#000000`–`#0B0C0E`;
  accents like `#04FF3F`, `#00E5FF`, `#FF007A`, `#3D5CFF`). Matches the brutalist
  token system (`data/design-tokens.json`, groups `colors`).
- Newest components normalize controls: **every tweakable is a 0–10 slider**
  grouped in typed objects (`EmberHusk` `structure`/`rock`/`core`/`response`/…),
  `0–100` or boolean toggles in canvas sims (`RainStorm` `density`/`speed`).
  Avoid arbitrary units — pick one scale per object and reuse it.
- A `quality: "low" | "medium" | "high"` tier prop (EmberHusk) scales DPR cap and
  internal render-target resolution — better than a single hidden DPR number.
- Every modern component passes `style?: React.CSSProperties` through to the wrapper.

## 7. Performance & lifecycle rules (from code, not theory)

- **Single** rAF loop per component; loop id stored in a ref; cancelled in cleanup.
- **DPR caps:** `min(devicePixelRatio, 1.5–2)` everywhere
  (`BlackHole` 1.5, `GravitationalVortex` 2). Never raw `devicePixelRatio`.
- **ResizeObserver** over `window.resize` (BlackHole, and most canvas rewrites);
  disconnected on cleanup.
- Recompute sim on resize via a **revision counter** (`sizeVersion`) rather than on
  every frame.
- Heavy math lives in **vertex shaders** where possible (GravitationalVortex motion)
  — next generation builds move simulation to GPU. EmberHusk is the current
  reference for that direction: a **fixed-timestep physics update (120 Hz, up to 5
  substeps, 0.88 damping)** keeps the shard sim deterministic, and the **glow pass
  runs through down/up-sampled render targets** rather than a full-res composite.
  An **IntersectionObserver** parks the GL loop while off-screen (`:1528`), on top
  of the standard `visibilitychange` cleanup.
- Framer Motion values replace React state where the value updates at 60fps
  (`BloomingFlower` bloom progress) — no re-renders.
- **No** Redux/context/zustand in any background component; no component-to-component
  messaging. (Source: grep of all 21 files — see `dependencies` in index.)

## 8. Accessibility

- `prefers-reduced-motion` is honored by scene content where pause is cheap
  (e.g. DriftwoodGallery parallax skip — see image ref; Sky twinkle toggle via
  `data/component-index.json` `responsive`/`performanceNotes`). For raw WebGL,
  `performanceNotes` documents motion-as-shader; pause not yet standardized —
  treat reduced-motion as a Phase 2/3 gap.
- Interaction is decorative-ambient; pointer handlers do not block focus or click.
  Canvas is non-interactive chrome (no keyboard tab stop required), but any
  clickable control added later must render real DOM, not canvas hit-testing.
- Color contrast: backgrounds default dark-under-lit-accents; keep overlays on these
  using `text-primary` tokens (see `data/design-tokens.json` `colors`).

## 9. Anti-patterns observed (do NOT replicate)

- File name ≠ export name ≠ registry id (Tornado/Vortex, GlobeMesh/Globe,
  AsciiWater/AsciiWave, ReflectShader/ShaderGroupSwitcher, ParticleSphere/Suffix).
  These break `componentData.tsx` lazy resolution heuristics for the forge tools;
  new components must keep one name.
- Numeric-string props or half-baked aliases (`width`/`height` accepted but unused in
  GravitationalVortex legacy branch).
- Unbounded particle counts on mobile without a `density` metric clamp.
- Prop objects defined as `any` or nested deep — keep shallow and typed.
- Using `useState` inside a rAF-driven visual update (causes full re-renders) —
  use refs or `motion` values.