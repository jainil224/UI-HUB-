# Anti-Patterns (risky patterns documented, not repeated)

Documented from existing source **without modifying it**. A future generator
must avoid these unless there is an explicit reason.

## 1. Clearing the whole canvas on every frame

- **Where:** `InfiniteTendrils.tsx` performs a full-canvas clear when a tab-switch
  stalls frames; `MouseGravityBackground`/trail components also clear each frame.
- **Why risky:** on slow GPUs, full-canvas clears amplify fill-rate cost.
- **Prefer:** clear only the moved region, or use `destination-out` fade on trail
  layers (BlackHole trails) and static-buffer caching (BeamGridBackground).

## 2. Heavy work in a `setInterval` instead of rAF

- **Where:** `HackerBackground.tsx:54` uses `setInterval` for column drops.
- **Why risky:** interval timers are not display-synced; heavy glyph work in a
  timer can jank. Battery-savvy but frame-accuracy suffers.
- **Prefer:** a single rAF loop with delta time, or use `useInView` to gate
  (WaveBackground:68).

## 3. Discrete state updates on every pointer event

- **Where:** template heroes use `useState` + `mousemove` and set state per event
  (SplitFuzzyOrbHero:9/:18, PortfolioClosing:536/:556, MoodHero:751+).
- **Why risky:** a React re-render per pointer event is wasteful; it is the reason
  these heroes need transitions.
- **Prefer:** refs + rAF with lerp (DriftwoodGallery:48-49 pattern) or framer
  `useMotionValue` + `animate()` (MorphingRings:453).

## 4. `getBoundingClientRect` inside event handlers

- **Where:** several pointer handlers call layout reads per event
  (AsciiWater:773 even measures once; but generic handlers often re-measure).
- **Why risky:** layout thrash on rapid `pointermove`.
- **Prefer:** measure once on resize/init; cache the rect (AsciiWater:425).

## 5. Unbounded spawned DOM nodes / trails

- **Where:** image-trail spawns `<img>` at pointer.
- **Why risky:** unbounded trails leak memory and bloat the DOM.
- **Prefer:** cap count with thresholds (image-trail uses dedup keys + exit
  transitions) and `AnimatePresence`, plus a max-queue.

## 6. Context churn / recreating GL on prop change

- **Where:** naive three components recreate renderers.
- **Why risky:** `THREE.WebGLRenderer` creation is expensive; losing a context is
  observable.
- **Prefer:** keep one renderer for the component lifetime and rebuild scene
  buffers in place (`Tornado` `rebuild()`; `GlobeMesh` panels kept in place).

## 7. Per-frame allocations

- **Where:** gradients/glow sprites created inside draw loops (`ShadowBlur`
  per-frame is discouraged).
- **Why risky:** GC pressure → frame time spikes.
- **Prefer:** pre-baked sprites (BlackHoleCursor glow sprites) and cached
  gradients.

## 8. Left-behind listeners / observers / media queries

- **Where:** components that miss cleanup.
- **Why risky:** leaks & double-binding after unmount/remount under StrictMode.
- **Prefer:** mirror-image cleanup in `useEffect` return — verified everywhere in
  the studied set (BeamGridBackground:242, MagneticBackground:147-150,
  PointDNAHelix:1426+).

## 9. Global overscan `overflow:hidden` hacks

- **Why risky:** hides overflow bugs rather than fixing layout.
- **Where:** library previews rely on container `overflow-hidden`; never ship this
  as the fix for a new component.

## 10. Claiming unused libraries

- `simplex-noise`, `@splinetool/*`, `unicornstudio-react` are installed but
  unimported. A generator must not import them "because they're installed".
- `@react-three/fiber`/drei exist in the unregistered `CloudScroll/` bundle —
  do not standardize on R3F for these categories yet.

## 11. Hover-only interactions with no keyboard/static fallback

- Several hover-scatter/ramp interactions are mouse-only. When replicating, add
  a reduced-motion or focus-safe fallback or document the limitation explicitly.

## 12. Autoplay without pause/visibility handling

- Carousels/galleries that autoplay need hover-pause (DriftwoodGallery:26-34) and
  unmount cleanup (ThreeDSlider:108). Autoplay without them annoys + leaks.

## 13. Large fullscreen ray-marching at extreme DPR

- Ray-marched scenes (OceanSwell 68-step march) are expensive. DPR cap is
  mandatory (OceanSwell 1.25). Never ship full-DPR raymarch on phones.