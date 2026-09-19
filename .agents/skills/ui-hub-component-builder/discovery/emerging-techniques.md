# Emerging Techniques

Nine techniques observed in the 2025–2026 ecosystem that will shape the next
wave of reusable components. Maturity is *my interpretation* of the cited
facts; never claim more than the sources support.

## 1. WebGPU baseline + three.js WebGPURenderer / TSL
- **What**: WebGPU reached Baseline in major browsers (Jan 2026, `[S22]`).
  three.js ships `WebGPURenderer` with automatic WebGL2 fallback; TSL writes
  one node-based material that compiles to WGSL (WebGPU) or GLSL (WebGL2)
  `[S19]`. `three/webgpu` is a separate import entry; `WebGPU.js`
  capability-test addon exists `[S24]`. `WebGPURenderer` is documented as
  experimental `[S19]`.
- **Maturity**: Emerging → mainstream-ready with fallback; custom
  post-processing must be WebGPU-compatible `[S21]`.
- **UI HUB fit**: three ^0.183 already present. Experimental window for one
  WebGPU/TSL component (data-parallel particles / splat) that gracefully falls
  back to WebGL2.

## 2. CSS scroll-driven animations (native, zero-JS)
- **What**: `animation-timeline: scroll()` at **85.43%** and `view()` at
  **87.22%** global support `[S16]`; spec in Editor's Draft (14 May 2026)
  `[S17]`; MDN property set `[S18]`. Enables scrub-by-scroll, view-entrance,
  and named per-scroller timelines *without script*.
- **Maturity**: Now mainstream-supportable; few reusable components ship it —
  this is a first-mover window for pure-CSS UI components `[S15][S16]`.
- **UI HUB fit**: zero-dep; `@supports (animation-timeline: view())` gate with
  a motion fallback preserves Phase-1 standards (reduced-motion, a11y).

## 3. Variable-font axis animation
- **What**: per-character / per-word tweening of `font-variation-settings`
  (weight, width, slant, wght axis) — `VariableFontText` `[S06]`, `Weight Wave`
  `[S10]`, variable-font trend article `[S13]`. Cheap, legible, GPU-composited.
- **Maturity**: Emerging; clear component formula (font loaded → axis map →
  per-token animation).
- **UI HUB fit**: fits existing `text` leg with **zero new deps**; needs a
  variable-font asset or Google Fonts load (document in feasibility).

## 4. Cursor-reactive text (repel / stacking / proximity)
- **What**: text tokens displaced by pointer proximity (radius + falloff),
  currently seen in Svelte-first `Text Repel` / `Stacking Words` `[S10]`.
  React registries supply split text but not repel `[S01]`.
- **Maturity**: Underrepresented in React; proven interaction class in
  award-level sites `[S12]`.
- **UI HUB fit**: natural compound of existing per-char spring machinery
  (`rolling-letters`, `random-letter-swap`).

## 5. Liquid / glass / refraction surfaces
- **What**: Apple-style "liquid glass" (SVG refraction, specular highlights,
  backdrop blur) `[S06]`; canvas-over-DOM glass/frost/droplets `[S08]`; TSL
  vortex glass sphere and stylized water (codrops) `[S15]`.
- **Maturity**: Emerging aesthetic → "liquid is the new glass".
- **UI HUB fit**: `liquid-glass` effect exists; the gap is **refraction over
  `<img>` content** (`capability-matrix.md`: no WebGL displacement on images).

## 6. Canvas overlays over live HTML
- **What**: a whole library genre (Canvas UI `[S08]`) renders simulation/shader
  surfaces *over* the page, not behind it (flame rings, ink strokes, force
  fields, decrypt text, particle reveal) — `pointer-events:none` overlays.
- **Maturity**: Emerging library genre (framework-agnostic single-source);
  ripple-ledger overlay already proves the pattern in UI HUB `[Phase 1]`.
- **UI HUB fit**: formalize a "overlay family" (wrapper + overlay canvas +
  DPR/ResizeObserver) instead of one-off overlays.

## 7. Physics / spring-driven micro-interactions
- **What**: Material 3 "Expressive" stiffness/damping constants proposed as
  reusable tokens (react-spring issue `[S34]`); motion springs are the
  default vocabulary of gestures and swipe actions `[S27][S29]`.
- **Maturity**: Mainstream; spring constants becoming design tokens.
- **UI HUB fit**: Phase-1 uses springs/tweens ad hoc — a shared spring-token
  helper would standardize feel across new components.

## 8. Audio-reactive rendering (Web Audio API)
- **What**: native `AnalyserNode`/time-frequency data drives canvas (38-mode
  hook libs `[S26]`); music-brand SOTD and "sound fabric" 3D scenes `[S11][S06]`.
- **Maturity**: Capability is mature; *premium reusable component* form is
  underrepresented (existing libs are bars/waveform singles `[S26]`).
- **UI HUB fit**: zero-dep category opener (A1–A3 in candidate pool).

## 9. GLSL texture transitions
- **What**: shader-based cross-fades between textures using `from/to/progress/
  resolution` uniforms (`glsl-transition`, hundreds of patterns `[S33]`).
- **Maturity**: Mature technique; little used as a packaged React component.
- **UI HUB fit**: pairs with image leg (slide/wipe/dissolve upgraded to
  shader cross-fade); keep WebGL1-compatible for the fallback.

## 10. (Adjacent, monitored not pursued)
- **Generative/agent-driven UI** (`[S32]`, `[S35]`): agents select/render
  trusted components (A2UI least-privilege). Implication: *reusable
  first-party components become the safest render target* — long-term
  tailwind signal for UI HUB's catalog model, not a Phase-2 build item.
- **3D Gaussian splatting** in three `dev` `[S23]` — doors open when three
  ^0.18x ships it; flagged Experimental only.

## Support table snapshot (from `[S16]`)

| Technique | Chrome | Edge | Firefox | Safari | Global |
|---|---|---|---|---|---|
| `animation-timeline: scroll()` | 115+ | 115+ | 157 | 26 | 85.43% |
| `animation-timeline: view()` | 115+ | 115+ | 158 | 26 | 87.22% |
| WebGPU (Baseline) | stable | stable | Win/macOS | 26 | Baseline `[S22]` |