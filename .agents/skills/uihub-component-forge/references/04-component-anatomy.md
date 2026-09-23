# Component Anatomy: The Forge Blueprint

> Phase 1 research output for UI-HUB Component Forge. This is the canonical
> blueprint distilled from Tasks 2+5: how a production-ready forge component is
> structured so that every Phase-3 generated component matches the existing corpus
> and passes the integration skill's checks. Pattern citations point to the
> strongest living examples; deviations below the line are documented exceptions
> that new components must NOT copy.

---

## 1. The shape (in order)

```
1.  // Optional decorative ASCII banner + doc comment (see §2)
2.  imports                              // react, [three], [motion/react], helpers
3.  const { useRef, useEffect, ... } = React;   // or named imports
4.  DEFAULT/PROPS object + type Props     // shallow, typed
5.  export default function <Name>(props: Props) {
6.      const wrapperRef  = useRef<HTMLDivElement>(null);
7.      const canvasRef   = useRef<HTMLCanvasElement>(null);   // canvas tier
8.      const stateRef    = useRef<SimState>(...);             // sim/GL state
9.      const animRef     = useRef<number>();                  // rAF id
10.     // ═ props normalization (aliases/merges) ═
11.     // ═ effect: resize (ResizeObserver → sizeRef; setSizeVersion) ═
12.     // ═ effect: init GL/canvas + buffers, compiled shaders ═
13.     // ═ effect: main rAF loop [less DPR-capped]   ═
14.     // ═ cleanup: cancel anim; remove listeners; RO.disconnect(); gl.delete* ═
15.     // ═ handlers: onPointerMove/Enter/Leave/Down/Click, on*KeyDown ═
16.     return (
17.         <div ref={wrapperRef} style={{ width:'100%', height:'100%', background, ...style }}>
18.             <canvas ref={canvasRef} />        // canvas tier
19.             {/* or DOM/images for motion tier */}
20.         </div>
21.     );
22. }
```

## 2. Header comment style (match the corpus)

Use a short banner + prop-table comment in the **newest**, verified style. Example
pattern seen in `GravitationalVortex.tsx` (which documents `defaultProps` and
aliases inline) and in component metadata (`componentMetadata.ts`). Required
content: one-line purpose, a props table (name / type / default / purpose), and a
"Known quirks" line listing any alias mappings.

```tsx
// ─────────────────────────────────────────────
// <Name>  —  one-line purpose
// Props:  name: type (default) — purpose
// ...
// Aliases: legacyProp→newProp (kept for back-compat)
// ─────────────────────────────────────────────
```

## 3. Imports (whitelisted)

- `react` (always)
- `three` — only for WebGL-geometry components (Tornado, BlockDrift, GlobeMesh,
  OceanSwell). Do NOT pull three for 2D canvas.
- `motion/react` (or `framer-motion`) — only for springs/motion-value interop
  (BloomingFlower). Do NOT pull it if a raw rAF loop suffices.
- icons: `lucide-react` only in DOM-tier carousels/testimonials (see index).

## 4. Props contract

- Prefer a local `interface Props` / `type Props = { ... }` adjacent to the
  component. `Record<string, unknown>` + internal cast is a legacy antipattern —
  the corpus is modernizing toward typed props (GravitationalVortex,
  BlackHole, image-trail, infinity-image are the templates).
- **Shallow flat props + max one options-object.** Examples: `vortex`,
  `flower`, `tilt`, `ring` in backgrounds; `images` / `image` in image category.
- Number, string, boolean, string[] for palette arrays. **Never** accept
  unbounded nested objects or `any`.
- Reserved: `style?: React.CSSProperties` flows to the wrapper; do not also invent
  `className` unless following the `extends HTMLAttributes` pattern
  (`image-trail.tsx` — near `export interface ImageTrailProps`).
- Keep legacy aliases but merge them AFTER the canonical prop so flat wins
  (`GravitationalVortex`'s `vortexTwist`/`funnelDepth` over `vortex`).

## 5. Lifecycle / cleanup (non-negotiable)

Every canvas/rAF component MUST:

- store the rAF id in a **ref** and `cancelAnimationFrame` on cleanup;
- cap DPR at **≤2** (BlackHole 1.5, GravitationalVortex/others 2);
- resize via **ResizeObserver**, `.disconnect()` in cleanup; re-init the sim on
  resize via a `sizeVersion` revision counter, not a rebuild each frame;
- remove every `addEventListener` (pointer/mouse/key/touch/timeout) in cleanup —
  `image-trail` even tracks timeouts in a Set and clears them all;
- delete GPU resources on unmount (`gl.deleteBuffer/program`) — GravitationalVortex;
- write per-frame visuals in **shaders** when possible, and update DOM/CSS via refs
  or `motion` values — **zero `setState` in the loop**.

## 6. Interaction handlers

- Pointer: `onPointerEnter/Leave/Move/Down` + removal on cleanup; `touch-action:
  none` for pointer-driven touch (RippleSignatureLedger). Avoid `onMouse*` when the
  API surface is pointer events.
- Hover: keep a `hoverStrength`/`hoverSpeed` scalar so both enter and leave animate
  smoothly (GravitationalVortex hoverSpeed; spider-web hoverIntensity).
- Keyboard: carousels expose ArrowLeft/ArrowRight + focusable region + per-slide
  aria (perspective/diagonal carousels).

## 7. Reduced motion (required for loops)

- `prefers-reduced-motion` must gate any continuous animation:
  InfinityImage (CSS `@media`), RippleSignatureLedger (skip expansion),
  DriftwoodGallery (skip parallax). If a WebGL sim can't be "paused", document the
  gap in the spec's a11y section (Phase 2 gap flagged for backgrounds).

## 8. Styling

- Backgrounds/canvas tiers: inline styles (the norm) — `inline-styles` in the
  index for 19/21 backgrounds. Canvas can't take classes meaningfully.
- DOM/motion tiers: Tailwind v4 utilities follow breakpoint prefixes; keep tokens
  from `data/design-tokens.json` (brutal shadows `2px/4px`, `rounded-*`, color
  vars) so they match the library's design system.
- Never hard-code hexes that contradict the token file (e.g. a `brand-blue`
  should be `#3D5CFF` from `index.css` — near `--color-blue`).

## 9. The two final exports

- **One default export** named after the registered component. Named export is fine
  in addition (image tier), but `export default <Name>` is what `componentData`'s
  lazy map and `renderComponent` resolve.
- Don't export extra conflicting defaults (see anti-pattern list below).

## 10. Known corpus deviations — NEW components must NOT copy

| File | Deviation | Why it hurts |
|---|---|---|
| `Tornado.tsx` | exports `Vortex` | breaks slug→export name assumptions |
| `GlobeMesh.tsx` | exports `Globe` | detail page shows GlobeMesh |
| `ReflectShader.tsx` | exports `ShaderGroupSwitcher` | id `reflect-shader` ≠ export |
| `AsciiWater.tsx` | exports `AsciiWave` | id `ascii-water` ≠ export |
| `ParticleSphere.tsx` | exports `ParticleSphereRefactor` | suffix clutter |
| `componentData.tsx` — near the `'black-hole-3d'` map entry | `'black-hole-3d': BlackHole3d` is a local `React.lazy` alias (near the `BlackHole3d` lazy const) over a file that exports `BlackHole` (`BlackHole.tsx` — near `export default function BlackHole`) | id ≠ export name; alias hides the mismatch |
| `spiral-images.tsx` | `props: any` | loses type safety + metadata gen |

**Canonical counter-examples to copy instead:** `GravitationalVortex.tsx`,
`BlackHole.tsx`, `BloomingFlower.tsx` (backgrounds); `image-trail.tsx`,
`infinity-image.tsx`, `RippleSignatureLedger.tsx` (images).