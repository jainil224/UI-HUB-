# Discovery Report

Phase 2 of the Ui-Hub Component Builder skill — **research complete, no code
written, no deps added, no registry entry created, no selection made.** This
report is the executive summary; `../` holds the knowledge base it builds on.

## Executive summary

The 2025–2026 ecosystem splits into a **commodity registry layer** (ReactBits,
21st, Aceternity, Magic UI, Motion Primitives — copy-paste speed, convergent
formulas) and an **aspirational showcase layer** (Awwwards, Godly, Codrops —
bespoke WebGL/Three.js, typographic craft, data storytelling, music-reactive
scenes). UI HUB's differentiators live in the gap: **rare compounded
interactions made reusable**, plus **motion-native depth** that copy-paste
registries avoid.

A full registry census (`componentData.tsx:2632` + per-entry `category:` reads)
corrected three early assumptions:
1. `text` (15+ entries) and `cursor` (12+ entries) legs **already exist and are
   saturated** in entrances/single-behavior cursors — the open space is
   *interactions* (variable-font axes, cursor-relative text, stateful cursors),
   not new categories.
2. `liquid-glass` already exists in `effect`; the real gap is **refraction/frost
   over images**, not glass cards.
3. Two whole categories are genuinely open: **Data Visualization** and
   **Audio-Reactive** (zero entries, externally strong signals).

### Primary whitespace (opportunity signal, not selection)
1. `data` + `audio` categories (zero entries; award + library demand `[S12][S30][S26]`).
2. Refraction/frost over images (no WebGL displacement on `<img>` in `capability-matrix.md`).
3. Variable-font + cursor-repel text (inside `text`, 0 occurrences, on-trend `[S13]`).
4. CSS scroll-driven components (zero-JS; `view()` at 87.22% `[S16]`).
5. Stateful brand cursor (inside saturated `cursor`, one narrow gap).
6. Product/object viewer (inside `3d`, existing three dep).
7. WebGPU/TSL + GLSL transitions (**Experimental**, flagged).

### Feasibility verdict
27 of 30 candidates need no new dependency. The three exceptions: `d3`
(D5 force graph — sanctioned borrow), `three/webgpu` (W3 particles — no
install, renderer documented experimental `[S19]`), and Gaussian splatting
(W5 — **blocked** by the three ^0.183 vs splat-in-`dev` gap `[S23][S24]`).

### Shortlist (8 concepts, unranked, grouped in `shortlist.md`)
A1 audio + D2 data (category expansion) · L2 image-refraction + W1 product
viewer (technically advanced) · T1 variable-font + S2 CSS zero-JS parallax
(highly reusable) · S4 swipe-to-reveal (low-dep DOM/CSS) · W3 WebGPU particle
field (experimental).

---
## Phase 2 Completion Report A–K

**A. Sources researched** — 35 citations (`research-sources.md`): registries
(S01–S10), showcases (S11–S15), standards (S16–S25), audio/data-viz/gesture/
generative (S26–S35). All accessed 2026-09-19; each rated High/Medium/Low
confidence with fact-vs-interpretation marked.

**B. Existing UI HUB coverage** — full category census equal to the union at
`componentData.tsx:2632`; text 15+, cursor 12+, effect incl. `liquid-glass`,
3d 6+, scroll 5+, Phase-1 legs 33 backgrounds / 24 image+hybrid components.
Nothing below duplicates the Phase-1 two legs (dedup lists re-read).

**C. New interaction patterns discovered** — variable-font axis animation;
pointer-proximity repel/stack text; stateful/morphing cursors; refraction/
frost over `<img>`; scroll-velocity reaction; cursor-context labels; canvas
overlays over live HTML; context-aware decode-on-proximity.

**D. New technical techniques discovered** — WebGPU baseline + three
`WebGPURenderer`/TSL with WebGL2 fallback (Jan 2026); CSS `scroll()`/`view()`
at 85–87% global; GLSL texture transitions (`from/to/progress`); native
Web-Audio analysis without deps; liquid-glass SVG refraction; gaussian
splatting in three `dev`.

**E. Candidate ideas count** — 30 (`candidate-ideas.md`; 31 rows, L1 a recorded
non-candidate for duplicate avoidance), each with saturation
class, UI HUB novelty (Existing/Variation/New interaction/New category), and
interaction·rendering·animation·complexity·reusability dimensions.

**F. Potential new categories** — proposed **Data Visualization (`data`)** and
**Audio Reactive (`audio`)**, plus an `effect`/`image-interaction` surface
extension — all evidence-derived (`new-categories.md`); text/cursor correctly
identified as existing legs, not new categories.

**G. Main whitespace opportunities** — the 7-point list in the executive
summary; full quadrant map in `whitespace-analysis.md`.

**H. Shortlist created** — 8 concepts, unranked, grouped by characteristic
(category expansion / technically advanced / highly reusable-low-complexity /
low-dependency DOM-CSS / experimental), with a parked-table of id-locked
alternatives, in `shortlist.md`.

**I. Files created** — 11: `README.md`, `research-sources.md`,
`ecosystem-analysis.md`, `existing-vs-missing.md`, `candidate-ideas.md`,
`emerging-techniques.md`, `new-categories.md`, `whitespace-analysis.md`,
`feasibility-analysis.md`, `shortlist.md`, `discovery-report.md`
(under `.agents/skills/ui-hub-component-builder/discovery/`).

**J. Important unknowns**
  1. three ^0.183 vs splat-in-`dev`: W5 blocked until three ships splats
     `[S23][S24]`.
  2. `three/webgpu` production maturity in 0.18x — re-check before any W3 build
     `[S19]`.
  3. Hover.dev data quality is Low (`[S07]`); conclusions do not rest on it.
  4. Web Almanac "65% WebGPU adoption" figure is secondhand `[S22]` — trend
     signal only.
  5. Exact registry counts for `custom/navbar/footer/form/button` not
     enumerated — not relevant to the pools, but noted.
  6. CORS/permission UX for audio + deviceMotion candidates untested in UI HUB
     context.

**K. Readiness status** — **READY FOR NEXT PHASE.**

All 11 files are complete and internally consistent. Source validation (URLs,
dates, support figures) is recorded per-citation in `research-sources.md` and
`emerging-techniques.md`. No code, dependency, registry entry, or component
selection was made. **STOP — §24 stop condition met: no component lookup, no
registry creation, no install, no implementation, no final selection. Waiting
for the next instruction.**