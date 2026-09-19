# Feasibility Analysis

Stack-fit and dependency decisions for the candidate pool. Ground rules per
spec: **prefer the current stack; prefer zero installs; any proposed
dependency must be flagged with rationale, bundle impact, and a no-dep
alternative.** UI HUB stack (verified `frontend/package.json`): React 19, TS,
Vite 6, Tailwind v4, `framer-motion|motion` ^12, `gsap` ^3 (+ScrollTrigger),
`three` ^0.183, Canvas2D, raw WebGL (webgl/webgl2), SVG. No WebGPU in repo;
`simplex-noise`/`@splinetool/*`/`unicornstudio-react` installed-but-unused.

## Line-by-line feasibility

### T1 Variable-Font Axis Animator — **Go (zero-dep, Easy)**
- Needs a variable-font asset (Google Fonts load or bundled woff2) — font file
  is a network asset, not a JS dep. `font-variation-settings` tweened via
  motion. Bundle: 0 kB added.

### T2 Cursor-Repel Text — **Go (zero-dep, Medium)**
- DOM token split + pointer math + motion springs. Reuses `random-letter-swap`
  spring machinery. Bundle: 0 kB. Perf: token count bounded; park when pointer
  far (`radius/falloff` props).

### T5 Scroll-Scrubbed Editorial Text — **Go (existing stack, Medium)**
- GSAP ScrollTrigger already used (`section-scroll`, `scroll-text-highlight`).
  Requires care on `ignoreMobileResize` `[S25]` consistency.

### C1 Stateful Brand Cursor — **Go (zero-dep, Medium)**
- DOM/SVG morph + blend modes; `matchMedia('(pointer:coarse)')` guard (user
  cursor precedent). Keep `cursor: none` only over a bounded frame like every
  other UI HUB cursor.

### C3 Context-Label Cursor — **Go (Variation of `user-cursor`, Easy–Medium)**
- Extends registered pill-cursor pattern; no dep.

### D1–D4 Data primitives — **Go (zero-dep)**
- Counters/donut/scrub-bars: SVG + motion + GSAP. Bundle 0 kB. **D5 (D3 force)
  is the only flagged borrow** (below).

### A1–A3 Audio — **Go (native API, zero-dep)**
- Web Audio `AnalyserNode` is browser-native; `getByteFrequencyData` per rAF.
  Needs: same-origin/CORS audio or explicit mic grant; autoplay policies —
  components should start on user gesture. Bundle 0 kB.

### L2/L3 Refraction/Frost over images — **Go (zero-dep, Experimental-class)**
- CSS filters + Canvas2D slice math (proven by `ripple-signature-ledger`);
  DPR cap 2 + ResizeObserver (Phase-1 conventions). Stylable fallback = still
  shows the `<img>`. True GPU displacement would want WebGL2 — see W-path.

### S1/S2 CSS zero-JS scroll — **Go (zero bytes, Easy)**
- `animation-timeline: view()` + `@supports` gate; fallback = motion in-view
  (existing `In View` pattern `[S05]`). Reduced-motion native. **First-mover
  window: 87.22% `[S16]`.**

### S3 Scroll-Velocity — **Go (existing stack, Medium)**
- motion `useScroll` + `useVelocity` + springs. 0 kB.

### S4 Swipe-to-Reveal — **Go (existing stack, Medium)**
- Motion gestures already in the stack; `touch-action` rule mandatory `[S27][S29]`.

### W1 Product/Object Viewer — **Go (existing dep, Medium)**
- three ^0.183 already installed. Reuse Phase-1 renderer discipline (single
  renderer lifetime, DPR cap, reduced-motion) `[Phase 1 capability-matrix]`.

### W2 Dither/ASCII Object — **Go (existing stack, Experimental)**
- raw WebGL1 fragment pass (dither threshold) over three-rendered texture or
  CSS image — feasible; dither threshold by pointer. 0 kB beyond existing three.

### W4 GLSL Screen Transition — **Go (zero-dep, Experimental)**
- A `glsl-transition`-style [S33] from/to pass is ~100 lines; keep to WebGL1
  compatible GLSL for fallback. 0 kB.

### Flagged borrows (require explicit user sanction, per spec)

| Borrow | Why | Bundle | No-dep alternative |
|---|---|---|---|
| **`d3` (D5)** | d3-force physics for network graphs `[S31]` | ~90 kB gz (d3-force ~ 22 kB gz if tree-shaken to `d3-force`+`d3-scale` only) or ~46 kB for `d3` full tree-shaken in 2026 bundles `[S30]` | Bespoke SVG force with a tiny verlet loop (~60 lines) — fewer features, zero dep |
| **`three/webgpu` (W3)** | WebGPURenderer/TSL compute particles `[S19]` | **No install** — but `three` build gets heavier via `three/webgpu` entry; renderer documented experimental `[S19]`; custom post-fx not all ported `[S21]` | plain three + GLSL fallback (WebGL2) — same visuals, no WebGPU perf path |

### Explicit non-feasible / rejected
- **Gaussian-splatting (W5)**: splat loader merged into three **`dev`** `[S23]`,
  while UI HUB pins **^0.183** `[S24]`. Research required before any build;
  classified Experimental, not actionable this phase.
- **Generative-AI / MCP UI (S-cluster)**: out of UI HUB's visual-effect
  identity and identity-proprietary `[S02][S32]`.
- Any **Spline / unicornstudio / simplex-noise** component: already installed
  but unused; adding usage would need explicit revival (Phase-1 rule).

## Performance / quality burden (Phase-1 conventions reused)
- rAF loops parked when idle/energy<δ or offscreen (`useInView` gate precedent,
  `wave-background`).
- DPR capping 1.25–2 across canvas/WebGL additions `[Phase 1 capability-matrix]`.
- `prefers-reduced-motion` → static frame for every animated component
  (existing imperative guard pattern; no global CSS rule today).
- Overlay components keep `pointer-events:none`; interactive elements keep
  keyboard semantics; canvas scenes get `aria-label` (Phase-1 rules).
- New-category components follow `addedAt` + contributor metadata shape in
  `componentData.tsx` and get `vibePrompt` strings in registry.

## Empirical go/no-go summary

| Cluster | Zero-dep feasible | Uses existing deps | Needs sanction |
|---|---|---|---|
| T1,T2,T4,T5 | ✅ | ✅ | — |
| C1,C3 | ✅ | ✅ | — |
| D1–D4 · A1–A3 · L2-L3 · S1–S4 · W1,W2,W4 | ✅ | ✅ | — |
| D5 | — | — | `d3` |
| W3 | — | ⚠️ | `three/webgpu` (no install, perf caveat) |
| W5 | — | — | **blocked: three version gap** |