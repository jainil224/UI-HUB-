# Whitespace Analysis

Quadrant view across UI HUB categories. "Open" = few/no registry entries +
external demand signal. "Saturated" = many entries or exhausted formula.
"White space" is scored as **demand signal × competition absence × UI HUB
fit**, broken out per cluster.

## Quadrant map (2026-09-19)

| | Open (few entries) | Crowded (many entries) |
|---|---|---|
| **High external demand** | **Data viz** (D1–D5) · **Audio-reactive** (A1–A3) · **Refraction-over-image** (L2/L3) · **CSS zero-JS scroll** (S1/S2) | Backgrounds (Phase-1), Cursor basics, Text entrances, Marquee/sliders |
| **Low/moderate external demand** | **Stateful cursor** (C1/C3) · **Variable-font** (T1) · **Cursor-repel text** (T2) · **GLSL transitions** (W4) · **Product viewer / globe** (W1) | Card tilt, Beams/spotlight, Magnetic, Confetti, Icon cloud |

## By-UI-HUB-leg findings

### `text` — high value whitespace, inside the leg
- Entries: entrances + gimmicks (pull-up, wavy, scramble, sparkle-cards).
- **Open interactions**: variable-font axes (T1 · 0 occurrences), cursor-repel
  (T2 · 0), stacking-words (T4 · 0). All three are *interactions*, not new
  entrances — the leg's formulas are exhausted, the interaction space isn't.
- Demand signal: typography is the top award rec and variable-font trend
  `[S12][S13]`.

### `cursor` — crouded core, two narrow gaps
- Entries: 12 single-behavior cursors (dot, ring, black-hole, star, ascii,
  venom/lizard/heart, spin, user-label, aura-fluid, confetti).
- **Open**: per-target state intelligence (C1/C3) — the "smart" cursor.
- Deliberately NOT proposed: a 13th cosmetic cursor.

### `effect` / `image-interaction` — one genuine gap: refraction over images
- `liquid-glass` (card) and `frost-glass-melt` (background) exist; nothing
  refracts/frosts an `<img>` (capability-matrix: no WebGL displacement on
  images). L2/L3 are the strongest non-duplicating image additions.

### `3d` — object-level empty
- Entries are showcase objects (rubik, slider, cards-beam, solar). Missing:
  **product/object viewer** (W1 — biggest 3d whitespace), globe, Text3D.
  These reuse existing three ^0.183 (no new dep).

### `background` — intentionally saturated (owned)
- Phase-1 leg owns particles/fluid/WebGL scenes. Only whitespace = **WebGPU/TSL
  tier** (W3, Experimental) and CSS-zero-JS parallax (S2) which belongs to
  `scroll`.

### `scroll` — technique whitespace, not component whitespace
- Entries pin/scrub via GSAP/motion only. **Zero CSS scroll-driven** usage.
  S1/S2 are pure-CSS firsts with 85–87% support `[S16]`.

### Full registry — two open *categories*
- `data` (D-cluster) and `audio` (A-cluster) — zero entries today (verified
  against union `:2632` and per-entry reads).

## Priority of whitespace (opportunity signal, NOT a selection)

1. `data` + `audio` categories — biggest externally-signalled open space `[S12][S30][S26]`.
2. Refraction-over-image (L2/L3) — uses Phase-1 discipline, zero dep.
3. Variable-font + cursor-repel text (T1/T2) — cheap, differentiated, on-trend.
4. CSS zero-JS scroll (S1/S2) — first-mover native technique.
5. Stateful cursor (C1/C3) — cuts against a saturated leg but adds category value.
6. Product/object viewer (W1) — high reusability, existing dep.
7. WebGPU/TSL (W3) + GLSL transitions (W4) — **Experimental**, flagged.

## Anti-whitespace (best avoided, evidence of saturation)
- More canvas particle/star/beam/blob backgrounds (Phase-1 owns; `[S01]` mirrors every style).
- More text entrances; more cosmetic cursors; more marquees; more tilt-cards;
  another confetti/dock/icon-cloud.
- Generative-AI chat UI (adjacent; `[S02][S32]`).