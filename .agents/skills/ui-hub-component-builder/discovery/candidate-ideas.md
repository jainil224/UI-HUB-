# Candidate Ideas

30 research-derived candidates (31 source rows; L1 is a recorded
non-candidate, kept only for duplicate avoidance). **Pool only — no selection,
no scoring, no ranking.** Each row lists the research dimensions per spec:
interaction, rendering, animation, complexity, reusability.

Saturation class: `Existing/Saturated · Emerging · Underrepresented · Novel Combination · Experimental`.
UI HUB novelty: `Existing · Variation · New interaction · New category`.
Sources in brackets `[S#]` → `research-sources.md`. UI HUB dedup against
`../interactive-background/implementations.md` and `../interactive-image/implementations.md`.

---

## Cluster T — Text (extends the existing `text` leg)

### T1. Variable-Font Axis Animator
- Saturation: **Emerging** · Novelty: `New interaction`
- Interaction: hover / pointer-velocity / scroll scrub · Rendering: DOM text
- Animation: `font-variation-settings` tweened via motion useTransform/scroll
- Complexity: Easy–Medium · Reusability: High (any headline)
- Evidence: `VariableFontText` `[S06]`, `Weight Wave` `[S10]`, variable-font trend `[S13]`.
- Absent in UI HUB (0 `font-variation-settings` animations; `text` leg = entrances only).

### T2. Cursor-Repel Text
- Saturation: **Underrepresented** (React) · Novelty: `New interaction`
- Interaction: pointer proximity (radius/falloff) · Rendering: DOM split words/chars
- Animation: motion springs per token, ease-out home · Complexity: Medium
- Reusability: High
- Evidence: Text Repel is Svelte+GSAP `[S10]`; ReactBits supplies split-text but not repel `[S01]`.
- UI HUB has per-char springs (`rolling-letters`, `random-letter-swap`) but nothing pointer-reactive.

### T3. Split-Hover Word Links
- Saturation: Existing/Saturated · Novelty: `Variation`
- Interaction: hover · Rendering: DOM · Animation: staggered axis slides
- Complexity: Easy · Reusability: Very High (nav/menu links)
- Evidence: agencies + doc-based burger-menu entries `[S12]`; ReactBits text effects `[S01]`.

### T4. Stacking Words Reveal
- Saturation: **Emerging** · Novelty: `New interaction`
- Interaction: scroll-in-view / hover · Rendering: DOM
- Animation: words stack in Z, current word pops front · Complexity: Medium · Reusability: High
- Evidence: `Stacking Words` `[S10]`.

### T5. Text-as-Content Scrub (editorial)
- Saturation: **Emerging** · Novelty: `Variation`
- Interaction: scroll scrub · Rendering: DOM · Animation: GSAP scrub (already in stack)
- Complexity: Medium · Reusability: Medium
- Evidence: Awwwards editorial typography SOTD `[S11][S12]`, gsap scrub `[S25]`.

### T6. Decode/Decrypt on Proximity (canvas semantic text)
- Saturation: Underrepresented · Novelty: `Variation` (builds on `pixel-drift`, `text-vaporize`)
- Interaction: pointer proximity · Rendering: Canvas2D over DOM text
- Animation: per-glyph cipher decode near cursor · Complexity: Experimental · Reusability: Medium
- Evidence: Canvas UI "Decrypt Reveal" `[S08]`.

---

## Cluster C — Cursor (extends the existing `cursor` leg — do NOT add more dot/ring/fluid cursors)

### C1. Stateful Brand Cursor (morphs per element target)
- Saturation: Underrepresented (paid gate) · Novelty: `New interaction`
- Interaction: element-target-aware hover · Rendering: DOM + blend modes
- Animation: morph via spring paths (SVG) · Complexity: Medium · Reusability: High
- Evidence: Motion+ Cursor (paid) `[S27]`; existing `target-cursor` snappy `[registry]`.

### C2. Velocity-Skew Cursor (already 30% owned)
- Saturation: Existing/Saturated · Novelty: `Variation`
- Interaction: pointer velocity · Rendering: DOM transform
- Animation: stretch/rotate with speed damping · Complexity: Easy · Reusability: Medium
- Evidence: `spin-cursor` (MagicCursor) exists `[registry]`; polish gap only.

### C3. Cursor With Context Label (view/drag/scroll)
- Saturation: Emerging · Novelty: `Variation`
- Interaction: pointer + element text · Rendering: DOM pill
- Animation: laggy secondary spring; shows contextual verb · Complexity: Medium · Reusability: High
- Evidence: `user-cursor` label pill `[registry]`; Motion+ Cursor `[S27]`; many agency sites `[S12]`.

### C4. Multi-Point / Co-presence Cursor
- Saturation: Experimental · Novelty: `New interaction`
- Interaction: pointer + deviceMotion/gyro co-layer · Rendering: WebGL particles
- Animation: secondary ring particle swarm offset from main · Complexity: Experimental · Reusability: Low
- Evidence: Motion+ "multi-cursor" `[S27]`.

---

## Cluster D — Data (open category)

### D1. Animated Number / Value Ticker
- Saturation: Existing/Saturated · Novelty: `New category` (entry point for `data`)
- Interaction: inView trigger + optional pointer scrub · Rendering: DOM/SVG text
- Animation: spring counter (motion) · Complexity: Easy · Reusability: Very High
- Evidence: `AnimatedNumber`/`SlidingNumber` `[S05]`.

### D2. Scroll-Scrubbed Bar / Line Chart
- Saturation: **Underrepresented** (as UI components) · Novelty: `New category`
- Interaction: scroll scrub over pinned panel · Rendering: SVG paths
- Animation: GSAP scrub draw-in (existing stack) · Complexity: Medium · Reusability: High
- Evidence: "Ai in Design Report 2026" SOTD `[S12]`; D3/Visx landscape `[S30][S31]`.

### D3. Donut / Ring Progress (scrub or numeric)
- Saturation: Existing/Saturated · Novelty: `New category`
- Interaction: inView / scroll / live value · Rendering: SVG stroke
- Animation: spring stroke-dashoffset · Complexity: Easy · Reusability: Very High
- Evidence: `S05` sliding number + ring patterns.

### D4. Timeline Stats (scrolling data-story row)
- Saturation: Emerging · Novelty: `New category`
- Interaction: scroll · Rendering: SVG + DOM · Animation: GSAP scrub stagger
- Complexity: Medium · Reusability: Medium
- Evidence: data-storytelling SOTD `[S12]`, GSAP stagger `[S25]`.

### D5. D3 Force-Graph / Network (flagged: needs `d3`)
- Saturation: Existing/Saturated (in D3 ecosystem) · Novelty: `New category`
- Interaction: drag/zoom · Rendering: SVG or canvas
- Animation: physics simulation (d3-force) · Complexity: Experimental · Reusability: Medium
- Evidence: D3 force layout is standard `[S31]`. **Requires new dependency — see feasibility.**

---

## Cluster A — Audio (open category)

### A1. Spectrum / Waveform Visualizer (native Web Audio, zero-dep)
- Saturation: Existing/Saturated (thin single-purpose libs) · Novelty: `New category`
- Interaction: mic or `<audio>` source + optional pointer params · Rendering: Canvas2D
- Animation: rAF analyser data per frame · Complexity: Easy–Medium · Reusability: High
- Evidence: react-audio-visualize (bars only) `[S26]`; No React counterpart that's premium.

### A2. Audio-Reactive Ambient (background lights to sound)
- Saturation: Emerging · Novelty: `New interaction`
- Interaction: audio RMS → gradients/particles · Rendering: Canvas2D/WebGL
- Animation: amplitude-lerped intensity · Complexity: Medium · Reusability: High
- Evidence: music SOTD `[S11]`; "sound fabric" scene `[S06]`. Pairs with `aurora-bpm-loader`.

### A3. Beat-Synced Object Scatter (canvas/Object)
- Saturation: Novel Combination · Novelty: `New interaction`
- Interaction: audio beat detection → object/particle bursts · Rendering: Canvas2D/three
- Animation: onset triggers spring bursts · Complexity: Experimental · Reusability: Medium
- Evidence: music/3D scenes `[S11][S12]`.

---

## Cluster L — Liquid / Surface / Refraction (extends `effect` + `image-interaction`)

### L1. (Non-candidate — recorded for duplicate avoidance)
- `liquid-glass` (`effect`) already exists verbatim. **Not counted** in the
  30-candidate pool. Listed so later phases never re-propose a glass card.
- Genuine surface whitespace lives in L2 (refraction) and L3 (frost/droplets),
  not in a new glass-card.
- Evidence: registry read `[componentData.tsx]`; Apple-style liquid glass `[S06]`.

### L2. Refraction Lens over Images
- Saturation: **Underrepresented** · Novelty: `New interaction`
- Interaction: pointer reticle · Rendering: Canvas2D slice refracted + backdrop-filter
- Animation: cursor-follow lens with spring · Complexity: Experimental · Reusability: High
- Evidence: Canvas UI Glass/Lens `[S08]`, codrops glass sphere `[S15]`.
- Gap: nothing refracts an `<img>` (`capability-matrix.md` notes no WebGL displacement on images).

### L3. Frost / Droplet Overlay Family (Pointer warmth/pressure)
- Saturation: **Underrepresented** · Novelty: `New interaction`
- Interaction: pointer heat/speed · Rendering: Canvas2D heat cells (already proven)
- Animation: melt/refreeze cells · Complexity: Medium · Reusability: High
- Evidence: `frost-glass-melt` background `[Phase 1]`, Canvas UI Frost/Droplets `[S08]`.

---

## Cluster S — Scroll & Gesture

### S1. CSS-Only Scroll-Driven Reveal (zero-JS, view())
- Saturation: **Underrepresented** (native technique, few shipped components) · Novelty: `New interaction`
- Interaction: scroll/view progress · Rendering: CSS only · Animation: `animation-timeline: view()` 87.22%
- Complexity: Easy · Reusability: Very High
- Evidence: `view()` support `[S16]`, spec `[S17][S18]`, codrops shine `[S15]`. No UI HUB CSS scroll-driven usage.

### S2. CSS-Only Scroll Parallax Layers (zero-JS)
- Saturation: **Underrepresented** · Novelty: `Variation`
- Interaction: scroll · Rendering: CSS transform hooks · Animation: `view()` velocity wash
- Complexity: Easy · Reusability: High · Evidence: `[S16][S17]`.

### S3. Scroll-Velocity Reaction (speed → skew/scale)
- Saturation: Emerging · Novelty: `New interaction`
- Interaction: scroll speed | Rendering: DOM transform | Animation: motion values + springs
- Complexity: Medium · Reusability: High
- Evidence: `useScrollVelocity` hook `[S06]`; gsap debounce `[S25]`.

### S4. Swipe-to-Reveal Actions
- Saturation: Existing/Saturated · Novelty: `New interaction` (nothing like it registered)
- Interaction: touch/mouse swipe · Rendering: DOM · Animation: motion springs (already the tutorial stack `[S29]`)
- Complexity: Medium · Reusability: High (lists/tables).

### S5. Drag-Sort / Pinch-Zoom Research Note
- Saturation: Emerging · Novelty: `New interaction` · Complexity: Experimental
- Note: motion gestures `[S27]` + @use-gesture `[S28]` prove feasibility; bundle is Native (current).
- Include as **helper-layer** candidates, not headline components.

---

## Cluster W — 3D / WebGPU (extends `3d`, `background`, `effect`)

### W1. 3D Product / Object Viewer (orbit, zoom, auto-tilt)
- Saturation: Emerging (registry) · Novelty: `New interaction`
- Interaction: drag-orbit + scroll dolly · Rendering: three (existing dep)
- Animation: inertia orbit + pinch · Complexity: Medium · Reusability: High
- Evidence: threecn ProductViewer `[S09]`, jaimevillegas model-viewer pattern `[S]`, Aceternity/Loom.

### W2. Dither / ASCII Shader Object Renderer
- Saturation: Emerging · Novelty: `New interaction`
- Interaction: hover/scroll seed · Rendering: raw WebGL (existing) / Canvas2D
- Animation: dither threshold by pointer · Complexity: Experimental · Reusability: Medium
- Evidence: Aceternity dither + ascii `[S03]`, Canvas UI Dithered Object `[S08]`.

### W3. WebGPU Particle Field (compute; three auto-fallback)
- Saturation: **Experimental** · Novelty: `New interaction`
- Interaction: pointer flow + idle ambient · Rendering: three `webgpu` (WebGL2 fallback)
- Animation: TSL node material compute · Complexity: Experimental · Reusability: Low–Medium
- Evidence: WebGPU baseline `[S22]`, auto-fallback `[S19]`, capability test addon `[S24]`.
- See feasibility: three ^0.183 supports `three/webgpu`; renderer documented experimental `[S19]`.

### W4. GLSL Screen Transition
- Saturation: Emerging · Novelty: `New interaction`
- Interaction: click/hash-change triggers · Rendering: WebGL texture cross-fade
- Animation: `from/to/progress/resolution` uniforms `[S33]` · Complexity: Experimental · Reusability: Medium
- Evidence: glsl-transition `[S33]`.

### W5. Gaussian-Splatting Gallery Viewer
- Saturation: **Experimental** · Novelty: `New interaction`
- Interaction: orbit/zoom · Rendering: three splat loader (merged in `dev` `[S23]`)
- Complexity: Experimental · Reusability: Low
- Note: **three ^0.183 vs splat-in-dev gap** — flagged `Experimental` only; needs renderer-level review `[S23][S21]`.

---

## Gaps log (what the pool deliberately avoids)

- No new particle/star/beam/blob backgrounds (Phase-1 legs own these; `[S01]` proves saturation).
- No new marquee/carousel (present in `image-interaction`).
- No new tilt/3D card (present in `3d`); W-cluster is object-level, not card-level.
- No third dot/ring cursor (cursor leg saturated).
- No new typography *entrance* variants (entrances saturated); only *interactions* proposed.
- No generative-AI chat UI (adjacent to identity, `[S02][S32]` noted as out-of-scope).

## Pairing notes (Novel Combinations culled during research)

- T2 (repel) × S3 (scroll velocity) — same motion-value machinery → cheap compound.
- A2 (audio ambient) × existing `aurora-bpm-loader` family → natural adjacent entry.
- L2 (refraction) × Phase-1 image-learning → the strongest "new image interaction" candidate that does not duplicate Phase 1.
- S1/S2 (CSS-zero-JS) × a11y doc (Phase-1 shared) → native alt for motion-reduced users.