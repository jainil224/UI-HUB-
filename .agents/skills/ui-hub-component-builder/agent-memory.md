# Agent Memory: UI HUB Interaction Rules

> Condensed, highly actionable rules a future agent must follow when building or
> studying **Interactive Background** and **Interactive Image** components.
> Every rule is backed by repository evidence (see `evidence.md`, `source-map.md`).

## What stack should I use?

- React 19 + TypeScript + Vite 6 + Tailwind CSS v4 (CSS-first) — this is the base.
- **DOM animation** → `framer-motion` / `motion` (already installed, dominant engine).
- **Scroll sequencing / scrub** → `gsap` + `ScrollTrigger` + `@gsap/react` (`useGSAP`).
- **3D / GPU** → either raw `three` (`THREE.WebGLRenderer` + `ShaderMaterial`) OR
  **Canvas 2D**. R3F exists but only in the unregistered `CloudScroll/` bundle —
  prefer raw three for these two categories.
- **Particles** → Canvas 2D, or `@tsparticles/react` (`sparkles` precedent).
- **Never add a dependency** when one of the above already covers the need.

## What interaction techniques are native to UI HUB?

- Pointer/mouse follow with **refs**, normalized coordinates, then **lerp** to a
  target (BeamGridBackground:143, SpaceBackground, DriftwoodGallery:48-49).
- Hover **ramps** on a `motionValue` with `animate()` (MorphingRings:453/:669,
  PointDNAHelix:886, TwinGalaxyRings:990).
- Drag-to-orbit with inertia for camera/yaw/pitch (OceanSwell:392-393/:404,
  ParticleSphere:879).
- Image parallax = per-depth `translate3d` multipliers (LoveAppHero ×1/×0.4/×0.25,
  PaipaiKuaishou ×0.1–×0.8, DontBeGreedyFooter ×1.5–×6.5).
- Image tilt = `rotateX/rotateY` + `translate3d` (LumosHero:216-217).
- Scroll-reactive = GSAP `ScrollTrigger` (SectionScroll, Scroll3DAnimation) or
  framer-motion `useScroll`/`useTransform` (HaulFooter:20-21).

## What animation approach is preferred?

- **One rAF loop per canvas component**, driven through refs, cancelled on unmount.
- **Lerp/interpolation** for position easing; **spring physics** (framer-motion)
  for DOM poses (image-trail:56-57, diagonal-carousel `.85s`).
- **Delta-time clamped** in physics loops (AsciiWater fixed-step; OceanSwell dt clamp).
- CSS transforms (+ `will-change`/`gpu-accelerated`) for DOM motion;
  `translate3d` for parallax — never animate `top`/`left`/`width` on image layers.

## What libraries already exist?

Pre-installed: `framer-motion` v12, `motion` v12, `gsap`, `@gsap/react`, `three`,
`@react-three/fiber`, `@react-three/drei`, `@tsparticles/*`, `lenis`,
`react-device-detect`, `lucide-react`, `react-icons`, `zustand`, `clsx/`,
`tailwind-merge`, `class-variance-authority`. See `technology-stack.md`.

## What should I avoid?

- **No WebGPU** (never introduced anywhere).
- **Do NOT import** `simplex-noise`, `@splinetool/*`, `unicornstudio-react`
  (installed but unused — no precedent).
- **Do not use React state for per-frame motion** — use refs/`useRef` film state
  (SpaceBackground, StarBurst) or framer `motionValue`; re-rendering every frame
  is an anti-pattern.
- **No layout-thrash:** don't call `getBoundingClientRect` inside `pointermove`
  handlers per event (measure once, or in the rAF frame).
- **Decorative backgrounds:** set `pointerEvents: 'none'` so content is clickable
  (BlackHole:522, AsciiWater:757, ReflectShader:318).
- **No global reduced-motion CSS exists** — you must add your own
  `matchMedia('(prefers-reduced-motion: reduce)')` guard.

## How should mobile be handled?

- Prefer `pointer*` events (`pointermove`, `pointerdown`, `pointerenter`) over
  `mouse*` so touch works (AsciiWater:764, Chandelier:388, FrostGlassMelt:160).
- For full-viewport canvas: still resize via `ResizeObserver` and cap DPR (~1.25–2).
- `touch-action: none` on canvases that receive pointer draw (FrostGlassMelt).
- Device detection with `react-device-detect` exists (CloudScroll precedent);
  `useIsMobile` hook (`frontend/src/hooks/use-mobile.ts`) uses `≤768px`.

## How should reduced motion be handled?

- Imperatively: `const rm = window.matchMedia('(prefers-reduced-motion: reduce)')`.
- Behavior: stop the rAF loop (Tornado:1339-1340), render a single static frame
  (FrostGlassMelt:151-154), or zero the parallax multiplier (PaipaiKuaishou:744-774,
  LumosHero:205).
- Re-read on change: set up `rm.addEventListener('change', …)` like Tornado's
  `useReducedMotion` (:13-23).

## What performance rules are mandatory?

1. DPR cap `1.25–2` (exact values in `shared/performance.md`).
2. One rAF loop per component; cancel on unmount.
3. Resize via `ResizeObserver`, redraw buffers on resize.
4. Static layers pre-rendered to an offscreen canvas (BeamGridBackground:91-97) —
  don't redraw them per frame.
5. O(n) per-frame work with distance culling (InteractiveGridBackground, MouseGravity).
6. Prefer `transform`/`opacity` for DOM motion; `will-change-transform`.
7. Use `InstancedMesh`/`Points` for three particle scenes (Tornado, ParticleSphere);
   keep GL context for the component lifetime — rebuild buffers in place.
8. Avoid per-frame allocations (pre-created sprites, cached gradients — BlackHoleCursor).
9. Park rAF when idle (spider-web:329 `energy < 0.5`).
10. Preview capture: background components render at 1600×900 via `/preview-capture`.

## How should new components stay consistent with UI HUB?

- **Visual language:** dark default `#0A0A0A`/`bg-neutral-950`/`bg-brand-black`;
  accent `#3D5CFF` (`brand-blue`, legacy `brand-green`); radii `rounded-2xl`/`rounded-3xl`;
  glass = `backdrop-blur-xl bg-white/5 border-white/10`; springs or ease-in-out, never harsh snaps.
- **Signature:** reuse existing CSS animation utilities from `index.css`
  (`.animate-float`, `.animate-hero-float`, `.animate-orb-*`, etc.).
- **Register** in `componentData.tsx` with a valid `category` from the union
  (`interactive-background`, `background`, `image-interaction`) — see `examples/index.md`.
- **Bundle exact source** into `embeddedSourceCode.ts` (drives AI prompts).
- **Don't rename/move/delete** existing components or entries (ADD by default).