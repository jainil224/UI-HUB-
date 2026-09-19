# Interactive Background — Performance Checklist

## 1. Before writing a new component

- [ ] Could this be Canvas2D instead of three/WebGL? If yes, default to Canvas2D
      (the most common tier in the category).
- [ ] If it needs hundreds of textured/quads or instanced particles → raw WebGL
      or three instanced.
- [ ] If it's a DOM/SVG scene → confirm it only animates `transform`/`opacity`.
- [ ] Count your particles → estimate fill rate at 1440×900 @ 2x ≠ acceptable.
      Known budgets: SpaceBackground 400 stars + 6 nebulas; MagneticBackground
      `area/12000`; BloomingFlower 60k-100k points (WebGL, instanced).

## 2. Mandatory while implementing

### Frame / loop
- [ ] One rAF loop per component (singleton start/stop; id stored in ref).
- [ ] `cancelAnimationFrame` in cleanup (BlockDrift:546, AsciiWater:1002).
- [ ] dt clamped (e.g. `Math.min(elapsed, 32ms)`); fixed-step for physics solves.
- [ ] Idle parking: `energy < threshold && !pointerActive → stop loop`
      (spider-web:329).
- [ ] Skip when hidden: `useInView` gate for heavy loops (WaveBackground:68).

### Canvas sizing
- [ ] Container-sized (`inset:0`), never fixed px.
- [ ] `ResizeObserver` re-sizes backing store.
- [ ] DPR cap applied (`Math.min(devicePixelRatio, max)`); re-apply on resize.
      Maxes seen: 1.25 (OceanSwell, ray-march), 1.5 (BlackHole), 2 (most).

### Drawing
- [ ] Static layers pre-rendered to offscreen canvas (BeamGridBackground:91-97).
- [ ] No per-frame allocations (pre-baked sprites/radial gradients).
- [ ] Additive (`lighter`) for glows; `destination-out` for trail fade.
- [ ] Cull offscreen particles / distance check before draw.
- [ ] Avoid full-canvas clear every frame for large canvases; clear only moved
      regions or rely on destination-out fade.
- [ ] WebGL: pre-cache uniform locations; set once per frame. Use InstancedMesh
      or Points for dense geometry (single draw call amortized).

### Events & state
- [ ] Pointer written into refs, read inside loop. No `useState` per frame.
- [ ] Listeners bound to scoped container (or window with cleanup).
- [ ] All listeners / ResizeObserver / media-query change listeners removed in
      cleanup (BeamGridBackground:242, MagneticBackground:147-150,
      PointDNAHelix:1426+).

### Reduced motion & idle
- [ ] `matchMedia('(prefers-reduced-motion: reduce)')` guard → stop loop /
      static frame (Tornado:1339-1340, FrostGlassMelt:151-154).
- [ ] `useIsStaticRenderer()`/preview mode → render fixed frames only for
      thumbnails (StarBurst 60-frame static).

## 3. Before shipping

- [ ] Run at 320px, 768px, 1440px widths; DPR 1× and 2× — no jank, no blur.
- [ ] Run in full-screen demo AND library card preview wrapper.
- [ ] Verify `npm run lint`/tsc and `npm run build` clean.
- [ ] Preview capture at 1600×900 (Playwright with `--enable-unsafe-swiftshader`);
      slug appended to `scripts/announcement/capture-previews.mjs`.
- [ ] No new dependency introduced without checking `package.json` (never un-used
      libs like `simplex-noise`).
- [ ] Zero horizontal overflow; content remains clickable above the layer
      (`pointerEvents:none`).

## 4. Budget guardrails (fail → reduce scope)

| Concern | Redline |
|---|---|
| Particle count | >100k DOM/2D ops/frame → use WebGL instanced or drop count |
| Ray-march steps | step count > 128 at DPR>1 → cap DPR to 1.25 |
| full-canvas clears | more than 1/frame on >1080p canvas → stop |
| setInterval-heavy loads | prefer single rAF (HackerBackground is legacy) |
| useState writes per event | any frame-layer state written from pointer event → refactor to refs |