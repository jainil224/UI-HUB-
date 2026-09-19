# Shortlist

8 concepts for a future build phase. **Unranked, unscored, no "best".**
Grouped by what they share, per spec. No selection, no component decision —
this list only marks "worth a deeper look" territory. Each references cluster
ids from `candidate-ideas.md`.

> Rule reminder: this is the **end of discovery**. Nothing here is approved to
> build; the next phase is a decision, not an implementation.

**The 8:** A1 · D2 · L2 · T1 · S2 · S4 · W1 · W3

## Group 1 — Category expansion (opens `data` and `audio`)
- **A1 Spectrum/Waveform Visualizer** (audio, native Web Audio, zero-dep) —
  real category opener; `aurora-bpm-loader` already touches beat-syncing.
- **D2 Scroll-Scrubbed Timeline Chart** (data, SVG + motion/GSAP, zero-dep) —
  motion-native data primitive, entered as a chart *story*, not a chart engine.

Why grouped: both open a genuinely empty registry category (union `:2632`);
both are zero-dep; both pair with premium landing-page/portfolio assets.

## Group 2 — Technically advanced (zero-dep and existing-dep)
- **L2 Refraction Lens over Images** (zero-dep) — strongest non-duplicating
  image addition; capability-matrix shows no WebGL displacement on `<img>`;
  reuses Phase-1 canvas-overlay discipline (`ripple-signature-ledger`).
- **W1 3D Product / Object Viewer** (three ^0.183 already installed) — the
  biggest `3d`-leg whitespace (orbit / zoom / auto-tilt / spin-to-theme).

Why grouped: high craft ceiling, no new dependencies, overlaps what 2026 award
sites ship `[S08][S12]`.

## Group 3 — Highly reusable, low complexity
- **T1 Variable-Font Axis Animator** — text-leg differentiator, near-zero cost,
  on the 2025–26 variable-font trend `[S13]`; needs a font asset only.
- **S2 CSS-Only Scroll Parallax Layers** — first-mover pure-CSS,
  `view()` at 87.22% `[S16]`, zero bytes, `@supports` gated with motion
  fallback; reduced-motion native.

Why grouped: one component each can serve every page; cheapest on the list.

## Group 4 — Low-dependency DOM/CSS (immediate, low risk)
- **S4 Swipe-to-Reveal Actions** — DOM work on existing motion/gesture APIs
  `[S27][S29]`; `touch-action` rule mandatory; directly testable in a preview card.

Why grouped: cheapest to de-risk, unlocks reuse (swipe lists) across the catalog.

## Group 5 — Experimental (flag-and-hold)
- **W3 WebGPU Particle Field** (three `webgpu` + TSL, WebGL2 auto-fallback
  `[S19]`) — only justified once the experimental renderer is re-checked;
  must meet a fallback confidence bar before leaving "Experimental".

Why grouped: one explicit unlock — WebGPURenderer maturity `[S19]` — stands
between it and a normal build gate.

## Parked this phase (not in the 8 — locked behind an unlock)
| Id | Unlock required |
|---|---|
| W5 Gaussian-Splatting Gallery | three ^0.183 vs splat-in-`dev` version gap `[S23][S24]` |
| D5 D3 Force Graph | explicit `d3` dependency sanction |
| C4 Multi-Point Cursor | deviceMotion permission-UX design |
| D1/D3, A2/A3, C1/C3, L3, W4, S1, S3, T2/T4–T6 | none — viable alternatives already represented by the 8; not slots |

## What this shortlist deliberately does NOT include
- New particle/star/beam/blob backgrounds (Phase-1 owned, saturated).
- A 13th cosmetic cursor (leg saturated; only stateful C1/C3 were retained).
- New marquee/carousel/tilt-card/confetti entries.
- Generative-AI chat UI (identity-adjacent, out of scope).

## Deliberately-split pairs (should not ship together as one component)
- T1 (variable font) ≠ T2 (repel) — separate concerns (axis motion vs pointer physics).
- L2 (refraction) ≠ L3 (frost) — different renderers (blur/backdrop vs heat-cells).
- S1 (no-JS) ≠ S3 (script velocity) — different audiences (CSS-capped vs JS-full).
- A1 (visualizer) ≠ A2 (ambient) — different layouts (inline vs background).