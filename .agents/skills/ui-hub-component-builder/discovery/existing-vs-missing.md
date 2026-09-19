# Existing vs Missing

Cross-census: what the registry already has (verified from
`frontend/src/data/componentData.tsx`) vs what the ecosystem shows is missing
in UI HUB. Registry ground truth = category union at `:2632`, plus explicit
`category:` reads below (2026-09-19).

## Registry category census (union at `componentData.tsx:2632`)

```
text | effect | background | button | cursor | 3d | custom | scroll |
image-interaction | interactive-background | loader | navbar | footer | form
```

Counts below are *minimums* from explicit `category:` reads in this run.

| Category | Entries read | Representative slugs |
|---|---|---|
| interactive-background | 18+ | SectionScroll-less full list in `../interactive-background/implementations.md` (:13–62) |
| background | 14+ | `wave-background`, `hell-background`, `star-burst`, `sparkles-background`, `kinetic-grid` … |
| image-interaction | 10+ | `spiral-images`, `infinity-image`, `card-cascade`, `image-trail`, `perspective-carousel`, `ripple-signature-ledger`, `driftwood-gallery` … |
| cursor | 12+ | `target-cursor`, `black-hole-cursor`, `magnetic-cursor`, `heart-cursor`, `lizard-cursor`, `venom-cursor`, `star-cursor`, `ascii-cursor`, `aura-cursor` (WebGL fluid), `confetti-cursor`, `spin-cursor` (velocity arrow), `user-cursor` (label pill) |
| text | 15+ | `mesh-text-hover` (WebGL2 mesh distortion), `pixel-drift` (particle assembly), `random-letter-swap`, `rolling-letters` (GSAP slot), `scramble-text` (glitch diffusion), `scroll-text-highlight` (GSAP scrub), `smoky-text`, `text-carousel`, `text-path` (SVG wave marquee), `text-vaporize`, `letter-pull-up`, `scale-letter`, `separate-away`, `wavy-text`, `word-pull-up` |
| effect | 3+ read (more exist) | `liquid-glass`, `spotlight-cards`, `image-reveal`, `fourier-flow` |
| 3d | 6+ | `3d-hero`, `3d-scroll-animation`, `3d-slider`, `3d-rubiks-cube`, `cards-beam`, `solar-system` (+ unregistered `CloudScroll/`) |
| scroll | 5+ | `section-scroll`, + 6828–6869 block |
| loader | 8+ | `gradient-orb`, `generating-orb`, `trading-candles`, `aurora-bpm-loader` … |
| custom / navbar / footer / form / button | present | — |

## Missing from the registry (measured)

| Capability class | In ecosystem (evidence) | In UI HUB | Verdict |
|---|---|---|---|
| Data visualization / animated numbers / charts | Recharts 48.9M weekly; Nivo; Visx (S30); D3 (S31); "Ai in Design Report 2026" SOTD (S12) | **Zero** data-viz entries; no `data` category in union | **Open category** |
| Audio-reactive rendering | Music SOTD (S11); Web Audio libs (S26); "sound fabric" (S06) | AuroraBpmLoader = beat-synced **loader**, not real audio analysis; no Web Audio use | **Open category** |
| Variable-font axis animation | `VariableFontText` (S06); `Weight Wave` (S10) | **Zero** `font-variation-settings` animation | Gap inside `text` |
| Cursor-reactive text (repel/stack/split-on-hover) | Text Repel/Stacking/Split Hover (S10, Svelte; page-transition ReactBits S01) | **Zero** cursor-relative text behavior | Gap inside `text` |
| Stateful / per-target cursors (brand cursor that morphs per element) | Motion+ Cursor (S27, paid); S01 | `cursor` entries are single-behavior (dot/fluid/ascii/arrow) | Gap inside `cursor` |
| CSS-only scroll-driven components (zero-JS scrub) | Spec mature (S17, S18); 85–87% support (S16); codrops CSS-only demos (S15) | Every scroll component uses GSAP/motion | **New technique entirely absent** |
| WebGPU / compute / TSL | three WebGPURenderer baseline (S19–S22); splat (S23) | No WebGPU; raw WebGL+three only | Gap inside `background` |
| Canvas overlays drawn **over** live HTML (liquid/particle/frost on content) | Canvas UI (S08); `ripple-signature-ledger` overlay (Phase 1) | 1 overlay pattern exists (ledger); no reusable overlay family | Gap (reuse pattern) |
| Refraction / glass over images | LiquidGlass (S06); Canvas UI Glass/Droplets/Frost (S08); codrops glass (S15) | `liquid-glass` effect + `frost-glass-melt` background exist; nothing refracts *an `<img>`* | Gap (`image-interaction`) |
| Shader texture-transition (GLSL cross-fade) | glsl-transition (S33) | **Zero** transitions outside galleries | Gap |
| 3D object showcases (product viewer, Text3D, globe, particle objects) | threecn ProductViewer/Text3D (S09); Aceternity globe (S03); Awwwards 3D (S11) | 3d leg = slider/rubik/cards-beam/solar; no product viewer, no globe, no Text3D | Gap inside `3d` |
| Gesture components (swipe-to-reveal, pinch, long-press) | motion swipe (S29); @use-gesture (S28); Awwwards "Gestures" tag (S12) | Drag used inside 3d/image legs only | Gap (cross-category helper) |
| Scroll choreography on top of existing pinned panels | ScrollOrchestrator (S06); GSAP scrub (S25); CardCascade (registry) | Pinning exists (`section-scroll`, `card-cascade`); master-timeline choreography not extractable | Partial |
| Generative-AI reactive UI | A2UI (S32); Framer/CopilotKit (S35); 21st AI chat (S02) | **Adjacent** — out of UI HUB's visual-effect identity; noted, not recommended for this phase | Out of scope |

## Interaction-dimension inventory (from `../taxonomy.md` + this census)

UI HUB currently drives: pointer-follow, hover, click, drag, scroll, autoplay,
idle-ambient. **Not yet used** as primary drivers: touch gesture (pinch/swipe),
device motion/orientation, microphone/audio input, realtime data input,
keyboard-driven reveals (beyond buttons), and velocity-of-scroll/pointer as a
first-class animation input.

## Narrative

The registry is deep in the two Phase-1 legs and already holds surprisingly
broad `text` and `cursor` legs. The measured whitespace is:

1. **Data-viz** (whole open category) — strongest external signal (S12, S30).
2. **Audio-reactive** (whole open category) — one loader today only.
3. **Inside `text`**: variable-font axes + cursor-relative text.
4. **Inside `cursor`**: stateful/morphing brand cursors (not new cursors).
5. **Zero-JS CSS scroll-driven**: an entire native technique with no entry.
6. **Deep 3d**: product/object showcases, globe, Text3D.
7. **Overlays over content**: turn the ledger-overlay pattern into a family.
8. **WebGPU/TSL experimental**: future-proof shader leg.

None of these duplicate the Phase-1 two legs (backgrounds/images), per the
explicit `implementations.md` dedup lists.