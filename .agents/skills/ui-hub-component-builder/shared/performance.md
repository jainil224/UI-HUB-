# Performance Rules (both categories)

Reusable performance rules for generating new components. All rules are observed
in existing source (see `evidence.md` for anchors).

## 1. Rendering & Frame Budget

| Rule | Observed values / precedent |
|---|---|
| Cap `devicePixelRatio` | `1.25` (OceanSwell), `1.5` (BlackHole), `2` (BlackHoleBackground, ReflectShader MAX_DPR=2, InfiniteTendrils, StarBurst, spiral-images) |
| One rAF loop per component | `SpaceBackground`, `OceanSwell:423`, `BlockDrift:425`, `StarBurst:294-300` |
| Cancel rAF on unmount | `BlockDrift:546`, `AsciiWater:1002` |
| Delta-time clamped / fixed step | `AsciiWater` fixed-step FLIP (:928), `OceanSwell` dt clamp, `BlackHole` dt clamp (3×) |
| Park rAF when idle | `spider-web:329` (`energy < 0.5` and no pointer) |
| Gate rendering to visibility | `WaveBackground:68` (`useInView` gates main loop) |

## 2. GPU & Compositing

- Use `transform` / `opacity` for DOM motion; use `will-change-transform`
  (SplitFuzzyOrbHero :33/53 `will-change-transform`; `.gpu-accelerated` utility).
- Canvas2D: use additive blending (`globalCompositeOperation 'lighter'`) for glow
  debt effectively (StarBurst, MouseGravityBackground trails, BeamGridBackground).
- WebGL: pre-create uniforms; set them once per frame via `gl.uniform*`.
- three.js: keep one `WebGLRenderer` for the component lifetime; rebuild scene
  buffers in place instead of tearing contexts (`Tornado` `rebuild()`).
- Use `InstancedMesh`/`Points` for dense particle scenes (Tornado, ParticleSphere,
  GlobeMesh icosahedron Points) to keep draw calls low.
- Avoid per-frame object allocation: pre-baked glow sprites (BlackHoleCursor
  pre-rendered sprites), cached gradients.

## 3. Pixel / CPU Budgets

- Bound per-frame work: `starCount=400`, `nebulaCount=6` (SpaceBackground);
  particle count derived from area (`area/12000`, MagneticBackground);
  grid cells distance-culled (InteractiveGridBackground).
- Use offscreen buffer for static art (`BeamGridBackground:91-97`).
- For particle-text sampling, sample once at init (PixelDrift) not per-frame.

## 4. Event & DOM Update Frequency

- Listen on the container or window, not on every sub-element.
- Use `pointer*` over `mouse*` (works for both mouse/touch; avoid pointer flood
  re-renders by writing style/state to refs/DOM).
- For parallax that must update per frame, drive it from the rAF loop (DriftwoodGallery
  writes `frameRef.current.style.transform` — zero React re-renders), not from the
  event handler.
- Remove listeners in cleanup: `BeamGridBackground:242`, `InteractiveGridBackground:99`,
  `MagneticBackground:147-150`.

## 5. Image Asset Performance (Interactive Image)

- Preload critical frames: `imagesRef` preloading (Scroll3DAnimation), `new Image()`
  preload (ToonhubHero:18-21).
- `eager` + `fetchPriority="high"` for above-the-fold preview images
  (TemplateDetailPage:147-152).
- Use `loading="lazy"` for below-fold gallery images (per existing library pages).
- Scale/resample images to the canvas DPR cap; `object-fit: cover` for `<img>`
  in expanding/parallax media (ScrollExpand, SectionScroll:221).
- Cap concurrent spawned elements: image-trail uses counts + thresholds and
  random dedup keys; cap trail size.

## 6. Memory & Mount/Unmount

- Clean all listeners, intervals, rAF ids, ResizeObservers in `useEffect` return /
  component class `destroy`.
- Do not leak GL contexts (one renderer per component; `dispose` geometry when
  rebuilding).
- Rewind `setInterval` autoplay on hover-pause (DriftwoodGallery:26-34) and clear
  on unmount (ThreeDSlider:108).

## 7. Mobile / Battery

- `useInView`-style visibility gating prevents background work off-screen.
- Reduced-motion static frame eliminates the loop entirely (FrostGlassMelt).
- DPR caps prevent GPU overdraw on high-density phones.

## 8. Unnecessary Re-renders

- Keep per-frame motion out of `useState`; use `useRef` or framer `motionValue`.
- Context providers (`ThemeContext`) trigger re-renders — don't put rAF state there.
- Wrap stable sub-renderers where observed (memo not prevalent; components prefer
  ref-based DOM writes).