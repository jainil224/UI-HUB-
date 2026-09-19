# Research Sources

Every source consulted during Phase 2 discovery, with access date, what was
actually verified, and a confidence rating. Confidence: **High** = page read
and claims verified against the primary document; **Medium** = verified via
the page description/search excerpt, primary not exhaustively read;
**Low** = snippet/secondhand only, use with care.

Accessed between 2026-09-19 (this session). Dates in *italics* are publication
dates stated by the source.

## Layer A — Reusable component registries / libraries

| ID | Source | Access | Verified / notes | Confidence |
|---|---|---|---|---|
| S01 | ReactBits — `reactbits.dev` · repo `github.com/DavidHDev/reactbits` | 2026-09-19 | 130+ components, 46.8k★. Categories observed: Backgrounds, Text Effects, Animations, CursorEffects, Magnets, Components, UI patterns. Tools: Background Studio, Shape Magic, Texture Lab. | High |
| S02 | 21st.dev — `21st.dev` | 2026-09-19 | 12,000+ crafted components; ships as copy-paste prompts, `npx shadcn` installs, MCP pull into Cursor/Claude Code. Categories observed incl. shaders, liquid & metal, AI chat, heroes. | Medium |
| S03 | Aceternity UI — `ui.aceternity.com/categories` | 2026-09-19 | Category index incl. 3d-card, ascii-art, globe, dither shader, aurora/beams backgrounds, tiltable cards, marquee, parallax, canvas. | High |
| S04 | Magic UI — `v3.magicui.design/docs` | 2026-09-19 | 150+ components. Observed: Marquee, Globe, Orbiting Circles, Icon Cloud, Dock, Scroll Progress, Lens Pointer, Beams, Confetti, Scratch To Reveal, text animations, buttons, backgrounds. | High |
| S05 | Motion Primitives — `motion-primitives.com/docs` (ibelick) | 2026-09-19 | 35+ components on docs: Animated Number, Sliding Number, Animated Background, Animated Group, In View, text effects (Loop/Morph/Roll/Scramble/Shimmer/Shimmer Wave), toolbar, dock, progressive blur. | High |
| S06 | Motion Primitives fork — `github.com/itsjwill/motion-primitives-website` | 2026-09-19 | README: "155+", Next.js-style cur only. Observed components: LiquidGlass (Apple iOS 26 SVG refraction), SpotlightCard, VariableFontText, SVG stroke reveal / particle explosion / glitch filter, Animated Chat UI (ScrollOrchestrator/ScrollStage), 6 experimental R3F scenes incl. sound fabric + ferrofluid. Zero paid deps. | Medium |
| S07 | Hover.dev — `hover.dev` | 2026-09-19 | Search surfaced a Medium Tailwind-hover article instead of the site; direct evidence not strong. Claimed ~36 components, no-framework binary lib (vanilla + React + Vue ports). | Low — verify before use |
| S08 | Canvas UI — `canvasui.dev/components` · repo `github.com/DavidHDev/canvas-ui` | 2026-09-19 | Framework-agnostic creative canvas overlays rendered **over live HTML**: Canvas, Cloth, Clouds, Decrypt Reveal, Dithered Object, Displacement, Droplets, Flame Wrap, Force Field, Frost, Glass, Glass Object, Glitch Broadcast, Glyph Rain, Grid, Hex Float, Ink Object, Laser, Liquid, Magnify, Particle Object, Particle Reveal, Particle Scroll. | High |
| S09 | threecn — `threecn.dev` · repo `github.com/ln-dev7/threecn` | 2026-09-19 | R3F scenes installable via shadcn CLI; `useShadcnTheme()` bridges CSS vars → `THREE.Color` via MutationObserver (dark-mode aware). Components: SceneContainer, ParticleField, ProductViewer, FloatingCard3D, Text3D, ProductShowcase. | Medium |
| S10 | Motion Core — `motion-core.dev/docs/text-repel` | 2026-09-19 | Svelte-first (GSAP-powered) text components. **Text Repel**: splits into words or chars, pushes each token away from the cursor with Strength/Radius/Falloff props. Also Split Hover, Split Reveal, Stacking Words, Text Loop, Text Scramble, Weight Wave. | Medium |

## Layer B — Creative-copy showcases & awards

| ID | Source | Access | Verified / notes | Confidence |
|---|---|---|---|---|
| S11 | Awwwards SOTD — `awwwards.com/websites` · feed `feeds.feedburner.com/awwwards` | 2026-09-19 | Sep 2026 feed. Recurring stack: WebGL/Three.js + GSAP + Webflow. Examples: "The Watch" (`awwwards.com/sites/the-watch`, Aug 18 2026, real-time WebGL), "Decathlon Yestalgia" `:sites/...` (typography + GSAP, Aug 28 2026), "Squarespace Foundations" (Three.js + GSAP + Vue). | High |
| S12 | Awwwards archive — `awwwards.withseismic.com` | 2026-09-19 | 29,868 sites; tag histogram incl. WebGL, GSAP, Typography, Gestures/Interaction, 3D, Storytelling, Data Visualization. SOTD examples: "The Tuscan Journey Begins" (Sep 13 2026, Gestures/Music), "Aardvark Book Club" (3D + Typography + Gestures), "Ai in Design Report 2026" (Aug 26 2026, Data Visualization + Storytelling). | High |
| S13 | Awwwards blog trends — `awwwards.com/` (blog) | 2026-09-19 | "100 Best Free Fonts in 2025" — variable fonts / CSS shapes push on typography; multicolor gradients trend article. | Medium |
| S14 | Godly — `godly.design/websites` (301 from `godly.website`) | 2026-09-19 | Curated landing-page gallery (scroll, 3D, typography heavy). Used as saturation signal only. | Medium |
| S15 | Codrops hub — `tympanus.net/codrops/hub/all/page/5` | 2026-09-19 | *Mar–Apr 2025*: ScrollSynced Carousel (GSAP, Apr 23), Glitchify Image v4 (Apr 7), WebGL Scroll Sync (Edan Kwan, Apr 5), WebGPU Scanning w/ Depth Maps (Mar 31), Interactive Text Three.js+GLSL (Mar 24), CSS `view-timeline` shine (CSS-only, Mar 20), Interactive Image Grid R3F (Mar 13), Vortex Glass Sphere w/ TSL (Mar 10), Stylized Water R3F (Mar 4). | High |

## Layer C — Standards & platform documentation

| ID | Source | Access | Verified / notes | Confidence |
|---|---|---|---|---|
| S16 | Can I Use — `caniuse.com/mdn-css_properties_animation-timeline_scroll` / `…_view` | 2026-09-19 | `animation-timeline: scroll()` 85.43% global; `view()` 87.22%. Chrome/Edge 115+; Firefox 157–158+; Safari 26+. | High |
| S17 | W3C Scroll-driven Animations L1 — `drafts.csswg.org/scroll-animations-1` (Editor's Draft *14 May 2026*) + `w3.org/TR/scroll-animations-1` | 2026-09-19 | Two timeline types (scroll-progress, view-progress); `scroll()`/`view()`, `animation-range`, named timelines. | High |
| S18 | MDN — `developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations` (last modified *Apr 22 2026*) + `Web/API/ViewTimeline` | 2026-09-19 | Index of properties (`animation-range`, `scroll-timeline-*`, `view-timeline-*`, `timeline-scope`) and the `ViewTimeline` API. | High |
| S19 | three.js WebGPURenderer — `threejs.org/docs/pages/WebGPURenderer.html` + `threejs.org/manual/en/webgpurenderer.html` | 2026-09-19 | WebGPURenderer: WebGPU backend default, **automatic WebGL2 fallback**; TSL transpiles WGSL↔GLSL; new node material system; **renderer documented as experimental**; `three/webgpu` import entry. | High |
| S20 | Three.js Roadmap (WebGL vs WebGPU) — `threejsroadmap.com/blog/webgl-vs-webgpu-explained` | 2026-09-19 | *Apr 15 2026*. TSL introduced r166; WebGL still the safe universal choice; WebGPU where support exists. | Medium |
| S21 | Three.js Resources — `threejsresources.com/webgpu/vs-webgl` (*Sep 4 2026*, r181) + `…/webgpu/three-js` (*Sep 5 2026*) | 2026-09-19 | WebGPU now Baseline; start new projects on WebGPURenderer (auto-fallback); TSL = one shader, both backends; custom post-processing must be WebGPU-compatible; some WebGLRenderer-internal community libs break. | Medium |
| S22 | VR.org — `vr.org/articles/webgpu-baseline-2026-three-js-webxr-default` | 2026-09-19 | *May 6 2026*. "WebGPU just hit Baseline (Jan 2026) in every major browser." Cites (secondary) 2025 Web Almanac: 65% of new 3D web apps shipped with WebGPU (~8% two years before). Treat % as secondhand. | Medium |
| S23 | three.js forum — `discourse.threejs.org/t/native-gaussian-splatting-in-three-js-for-webgpu-renderer/93509` | 2026-09-19 | *Aug 15 2026*. Native Gaussian Splatting (SPZ v3/v4, SPLAT, KSPLAT, PLY, glTF) merged into three `dev` via TSL + GPU count-sort; SH1–SH3 view-dependent. | Medium |
| S24 | three (npm) — `npmjs.com/package/three` | 2026-09-19 | 0.185.1 published ~2 months prior; addons `examples/jsm/capabilities/WebGPU.js` (`isAvailable`). | High |
| S25 | GSAP ScrollTrigger — `gsap.com/docs/v3/Plugins/ScrollTrigger` | 2026-09-19 | scrub/pin/snap; debounced scroll; `anticipatePin`; horizontal scroll sections. | High |

## Layer D — Audio, data-viz, gestures, generative

| ID | Source | Access | Verified / notes | Confidence |
|---|---|---|---|---|
| S26 | Audio visualizers — `npmjs.com/package/react-audio-visualize` (samhirtarif, 184★, *2024-09-07*), `github.com/tkhdev/react-audio-visualizer` (38 visualization modes, "zero React re-renders per frame" hook), `npmjs.com/package/waviz`, `github.com/hu-ke/react-audio-spectrum` (99★, *2017*) | 2026-09-19 | Category is real but mostly bar/waveform-shaped singles. Web Audio API is native (no dep needed). | High |
| S27 | Motion gestures — `motion.dev/docs/react-gestures` | 2026-09-19 | motion components support hover/tap/pan/drag/focus/inView; note `touch-action` requirement for pan/drag. Motion+ (paid) advertises Cursor components (target-snapping, morphing, multi-cursor). | High |
| S28 | @use-gesture — `npmjs.com/package/@use-gesture/react` | 2026-09-19 | useDrag/useMove/useHover/useScroll/useWheel/usePinch/useGesture; pairs with react-spring. | High |
| S29 | Motion swipe tutorial — `motion.dev/examples/react-swipe-actions` (*2025-01-28*) | 2026-09-19 | iOS-style swipe-to-reveal-actions built with motion values + springs (Motion+). | Medium |
| S30 | React chart landscape — `usedatabrain.com/blog/react-chart-libraries` (*2026-05-09*) | 2026-09-19 | Recharts 48.9M weekly DLs (built on D3 primitives), Nivo (SVG/Canvas, 14k★, design-forward), Visx (Airbnb, D3 primitives, 20.8k★), Chart.js 10.4M weekly (Canvas), Apache ECharts, Victory, MUI X Charts. | Medium |
| S31 | D3 — `d3js.org/what-is-d3` (Observable) | 2026-09-19 | Low-level toolbox: no chart concept; data join; SVG/Canvas/WebGL render targets; pairs with React ("render with React, compute with D3"). | High |
| S32 | Generative UI spec — `cloud.google.com/discover/generative-ui` (Google A2UI: declarative JSONL UI stream; least-privilege rendering), `github.com/CopilotKit/OpenGenerativeUI`, `github.com/narrowin/awesome-generative-ui` | 2026-09-19 | Agent-driven UI is a 2026 theme; charts/ascii/3D AI render in sandboxed iframes. Adjacent to UI HUB scope; noted, not pursued. | Medium |
| S33 | glsl-transition — `gre.github.io/glsl-transition` | 2026-09-19 | Reusable GLSL texture→texture transitions via `from/to/progress/resolution` uniforms; classic WP-style cross-fade primitive with hundreds of shader patterns. | Medium |
| S34 | react-spring — `github.com/pmndrs/react-spring/issues/2403` | 2026-09-19 | *Oct 2025* issue: M3 Expressive (Material 3) stiffness/damping constants integration request — physics-spring groundwork discussion. | Low |
| S35 | Framer 3.0 / Figma Config / Paper Shaders — `designtools.fyi/news/canvas-goes-generative-july-2026` | 2026-09-19 | *Jul 13 2026*. Paper Shaders went open-source (Apache 2.0, 30+ mesh-gradient/noise/halftone effects, zero-dep, React+vanilla); Framer put agents on canvas; Figma Motion = keyframe timeline. Config-order signal: generated shader libraries are becoming commodities. | Medium |

## Search-quality caveats (documented per spec)

1. **S07 (Hover.dev)** — search returned a Medium article, not `hover.dev`
   itself. Treated as **Low** confidence; not used in conclusions.
2. **S22** — the "65% of new 3D web apps use WebGPU" figure is secondhand
   (Web Almanac 2025 cited by an article). Used only as "the ecosystem is
   moving", not as a hard statistic.
3. Publication gap: several components exist in web versions (Next.js) and
   Svelte (Motion Core) before React ports; treat "no React component found"
   as "no React component found in the surveyed registries", never as an
   absolute.

## Fact vs interpretation

- **Fact (documented)**: union of categories at `componentData.tsx:2632`;
  `scroll()` 85.43% / `view()` 87.22% global support (S16); WebGPURenderer
  auto-fallback existence (S19); splat loading merged into three `dev` (S23);
  `react-audio-visualize` 184★ bars/waveform only (S26).
- **Interpretation (mine, hedged)**: "cursor-repel text is underrepresented in
  React registries" (S01/S10 only expose svelte/paid variants);
  "data-viz is the biggest open UI HUB category" (S12 SOTD + S30 landscape +
  zero data-viz entries in UI HUB). Any numerical claim not from the primary
  document is labelled appropriately.