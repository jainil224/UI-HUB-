# Ecosystem Analysis

Two distinct layers power modern interactive UI. UI HUB's differentiators live
in understanding both.

## Layer 1 — Reusable registries (commodity layer)

These libraries sell **copy-paste speed**. They converge on a small set of
formulaic components; the same ideas appear in every registry. If an idea is
here, it is *by definition* saturated — but a registry entry is often shallow
(cur only, one style, one interaction).

### Saturation matrix (Layer 1)

| Idea group | Where it appears | UI HUB status 2026-09-19 |
|---|---|---|
| Particle/canvas backgrounds | S01, S03, S04, S06 | Strong (Phase 1: 33 backgrounds) |
| Beams / borders / spotlight cards | S03, S04, S05, S06 | Present (effect/3d legs) |
| Tiltable / 3D cards | S03, S08, S09 | Present (3d leg, image leg) |
| Magnetic | S01, S03 | Present (`magnetic-cursor`, `MagneticBackground`) |
| Marquee / carousels | S01, S03, S04 | Present (image leg, text leg) |
| Text entrances (pull-up, wavy, scramble, stagger) | S01, S03, S04, S05 | **Present** (15 text entries) |
| Cursor replacements (dot, ring, fluid, ascii) | S01, S27 (Motion+ paid) | **Present** (12 cursor entries) |
| Liquid glass / glass cards | S06, S08 | Present (`liquid-glass` effect; `frost-glass-melt` background) |
| Confetti / celebration | S03, S04 | Cursor leg has confetti; no standalone |
| Icon cloud / orbiting / globe | S03, S04 | Absent as entries |
| 3D product viewer / Text3D | S09 | Absent (3d leg = slider/rubik/cards-beam/solar) |
| CSS-only scroll-driven components | S17, S18 (spec, not registry) | **Absent** |
| Audio-reactive components | S26 (small single-purpose libs) | Near-absent (1 BPM loader) |
| Data-viz / charts as UI components | S30, S31 | **Absent** |
| Canvas overlays over live HTML | S08 | Present only as `ripple-signature-ledger` overlay pattern |

### Takeaway (Layer 1)
The registry layer races downward on polish; the *formulas* are exhausted. The
open space is not "another tilt card" but (a) interactions the registries
haven't commoditized, and (b) **depth** — entries with real physics, real
audio, real data, real WebGPU — which copy-paste registries avoid because it
costs bundle size and skill.

## Layer 2 — Creative showcases (aspirational layer)

Awwwards / Godly / Codrops show what *award-winning* builds ship and what the
press next year will call a "component category." 2026 signal (S11–S15):

- **One-off WebGL/Three.js dominance** in SOTD (S11, S12): scrolling + 3D,
  gestures, typography, storytelling. Each is bespoke, impossible to copy-paste
  — the gap between Layer 1 (commodity) and Layer 2 (bespoke) is where
  rare-but-reusable components live.
- **Typographic craft as the cream of 2025–2026** (S13: variable fonts; S12:
  typography tags). Text is *the* differentiator in awards.
- **Data storytelling** becoming an award category ("Ai in Design Report 2026",
  SOTD Aug 26 2026, S12; "Alethia" data-driven SOTD Aug 5 2026).
- **Music/audio-reactive** themes recurring (Paul Kalkbrenner SOTD Sep 2 2026;
  Motion Primitives "sound fabric" scene S06).

### Takeaway (Layer 2)
The aspirational layer is rich terrain for **rare compounded interactions**
(typography × cursor × physics; audio × canvas; data × scroll) — none of which
the registry layer has made cheap. UI HUB can be the library that makes a
tasteful subset of award-grade interactions reusable.

## Trend direction (2026 signals)

| Signal | Evidence | Direction |
|---|---|---|
| WebGPU baseline | S22 (Jan 2026), S19–S21 | Shader/GPU compute becomes default-safe within 1–2 years; TSL removes WGSL anxiety |
| CSS scroll-driven animations native | S16–S18 (85–87% support) | Zero-JS scroll scrub components become viable and performant |
| Variable-font animation | S13, S06 `VariableFontText`, S10 `Weight Wave` | Typography-as-animation surface; cheap and legible |
| Liquid/glass/refraction | S06 `LiquidGlass`, S08, S15 (codrops glass scenes) | Apple-list aesthetic; "liquid" is the new "glass" |
| Canvas-over-DOM | S08 | Effects layered *over* live UI, not behind it |
| Genre-blend (audio×art, data×motion) | S12, S26, S06 sound fabric | Audio-reactive + data-viz are the two least-commoditized genres |
| Agent generation | S32, S35 | Generated UI needs *trusted primitives* — reusable components become the safe render target (A2UI least-privilege model, S32) |
| Physics/spring standards | S34 (M3 expressive), S28, S29 | Spring constants become a design token, not magic numbers |

## Scorecard vs UI HUB's identity

UI HUB already owns **the two hardest legs** (interactive background, image
interaction, with real WebGL/three physics — not copy-paste tiers). The clean
extensions that keep that identity without diluting it:

1. **Typographic interaction** (extend `text` with interactions, not just entrances).
2. **Cursor interaction** (extend saturated `cursor` with *stateful* cursors).
3. **Data & audio driven** (two open categories, see `new-categories.md`).
4. **Zero-JS CSS scroll-driven** (a first-party stack of pure-CSS components).
5. **Pass-through of current three.js maturity** (WebGPU/TSL experimental leg).

Saturated/avoid: particle backgrounds (already owned), marquees/carousels,
tilt cards, magnetic, beams, confetti, icon clouds, basic text entrances.