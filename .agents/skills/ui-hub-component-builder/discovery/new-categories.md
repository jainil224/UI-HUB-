# New Categories

Category proposals **derived from evidence**, not pushed top-down. For each:
the evidence trail, why the bottom-up signal exists, and where it lands in the
existing registry.

## Proposed 1 — Data Visualization (`data`)
- **Evidence** (bottom-up): award-level data storytelling is a recurrent SOTD
  theme ("Ai in Design Report 2026" Aug 26 2026, "Alethia" Aug 5 2026 `[S12]`);
  the React chart layer is enormous (Recharts 48.9M weekly DLs, Nivo 14k★,
  Visx 20.8k★ `[S30]`) yet those are dashboards, not *animated* UI components;
  D3 positions itself as a low-level toolbox people compose with `[S31]`.
- **Registry check**: no `data` in the union `[componentData.tsx:2632]`; zero
  animated-number/chart entries.
- **Why UI HUB should enter**: the registry layer is anti-motion (static
  charts); UI HUB's differentiation is *motion-native rendering*. Entry
  candidates: D1–D5 (candidate pool).
- **Risk**: scope creep risk (a full charting suite). Mitigate by entering as
  **motion-driven primitives** (counters, scrub bars, donut) — not a chart
  engine.

## Proposed 2 — Audio Reactive (`audio`)
- **Evidence** (bottom-up): music-brand SOTD and the "sound fabric" 3D scene
  `[S11][S06]`; a whole small-niche of native-Web-Audio visualizer libs with
  premium gaps (bars/waveform only) `[S26]`.
- **Registry check**: `aurora-bpm-loader` is a beat-synced **loader**, not an
  analyser component; no Web Audio usage anywhere.
- **Why UI HUB should enter**: native API = zero dependencies; pairs naturally
  with the loader leg and with music-brand landing pages.
- **Risk**: microphone permission UX; audio element CORS. Mitigate by
  supporting both `<audio>` (same-origin/CORS-safe) and user-granted mic.

## Proposed 3 — Surface / Refraction overlays (`surface` or fold under `effect`)
- **Evidence** (bottom-up): liquid-glass is the 2025–2026 aesthetic (Apple
  iOS 26 style `[S06]`); canvas-over-DOM glass/frost/droplets library `[S08]`;
  codrops glass sphere / water scenes `[S15]`.
- **Registry check**: `effect` already owns `liquid-glass`, `spotlight-cards`,
  `image-reveal`; the **genuinely untapped sub-area is refraction/frost over
  images** (`capability-matrix.md` shows no WebGL displacement on `<img>`).
- **Proposal**: extend `effect` + `image-interaction` rather than launch a new
  category — or launch `surface` only if the family grows past ~4 components.
- **Risk**: lowest of the three; medium feasibility (needs canvas overlay
  discipline from `ripple-signature-ledger`).

## Proposed 4 — Zero-JS CSS Scroll-Driven (cross-cutting, not a category)
- **Evidence**: `view()`/`scroll()` at 87%/85% `[S16]`, spec `[S17]`, few
  packed components exist `[S15]`.
- **Proposal**: a **cross-cutting family** (reveal, parallax, priority-scan)
  tagged `scroll`; not a new category, but a new *technique tier*. No-JS is
  the a11y-native answer to every motion script (pairs with `reduced-motion`).

## Categories deliberately NOT proposed (evidence says saturated or fold-in)

| Candidate | Why rejected |
|---|---|
| Typography (`text`) | **Already exists** (15+ entries). Extend with interactions (T-cluster) instead. |
| Cursor (`cursor`) | **Already exists** (12+ entries, incl. fluid/ascii). Only stateful/morphing is open. |
| Liquid-glass card | **Already exists** (`liquid-glass` effect). Only on-image refraction is open. |
| 3D objects | `3d` leg exists — propose in-leg (W1/W2), not a category. |
| Gesture/touch | Cross-cutting helper, not a category (S4 handlable under `scroll`/`custom`). |
| Generative AI chat | Adjacent to UI HUB's visual-effect identity; out of scope `[S02][S32]`. |

## Category-move checklist (for a later Phase if approved)
1. Add the category string to the union at `componentData.tsx:2632`.
2. Update `source-map.md` + `capability-matrix.md` rows for the new leg.
3. Give the new leg its `SKILL.md` mirroring the interactive-{background,image} subfolders.
4. Ship an entry-point component per new category before any 2nd (e.g. D1 then D4).