# Technology Stack (verified)

Everything below comes from `frontend/package.json` (versions), `frontend/vite.config.ts`,
`frontend/tailwind.config.ts`, `frontend/src/index.css`, and actual imports in
`frontend/src/`. **Do not invent dependencies.** Anything marked "installed but
unused" must NOT be treated as a UI-HUB technique.

## 1. Base Platform

| Layer | Value | Source |
|---|---|---|
| Framework | React 19 (`react` `^19.0.0`) | package.json |
| Language | TypeScript (`~5.8.2`) | package.json (dev) |
| Build | Vite 6 (`vite` `^6.2.0`) + `@vitejs/plugin-react` `^5.0.4` + `@tailwindcss/vite` `^4.1.14` | package.json, vite.config.ts |
| Routing | `react-router-dom` `^7.13.1` | package.json |
| Styling | Tailwind CSS v4 (CSS-first `@import "tailwindcss"` + `@theme`), PLUS classic `tailwind.config.ts` tokens honored together | index.css, tailwind.config.ts |
| State | `zustand` `^5.0.14` (used in CloudScroll) | package.json |
| CSS helper | `cn = twMerge(clsx(...))` | `frontend/src/lib/utils.ts` |

## 2. Animation & Rendering Libraries (counted by real imports)

| Library | Version | Files importing it | Role |
|---|---|---|---|
| `framer-motion` | `^12.34.4` | ~16 | DOM animation: motion components, `useInView`, `useScroll`, `useTransform`, `AnimatePresence`, `motionValue`, `animate` |
| `motion` (`motion/react`) | `^12.34.5` | ~9 | Same engine as framer-motion; some components import from `motion/react` |
| `gsap` | `^3.14.2` | ~14 | Timelines, `ScrollTrigger`, `useGSAP` (@gsap/react in 5), pinned panels, scrub |
| `three` | `^0.183.2` | 17 | Raw three.js: `WebGLRenderer`, `ShaderMaterial`, `InstancedMesh`, `Points` |
| `@react-three/fiber` | `^9.5.0` | 11 (all in `CloudScroll/`) | R3F renderer |
| `@react-three/drei` | `^10.7.7` | 10 (CloudScroll) | `Text`, `useScroll`, `ScrollControls`, `Image`, `Cloud`, `Stars`, `AdaptiveDpr`, `useCursor` |
| `three-stdlib` | `^2.36.1` | 3 (CloudScroll models) | GLTF types |
| `@tsparticles/engine` | `^3.9.1` | via `sparkles.tsx` | Particle engine v3 |
| `@tsparticles/react` | `^3.0.0` | `sparkles.tsx` | React wrapper |
| `@tsparticles/slim` | `^3.9.1` | `sparkles.tsx` | Slim preset |
| `lenis` | `^1.3.18` | `SmoothScroll.tsx` | Smooth scroll, ticker-synced with GSAP `ScrollTrigger.update` (:41) |
| `react-device-detect` | `^2.2.3` | CloudScroll only | device detection |
| `lucide-react` / `react-icons` | `^0.546.0` / `^5.7.0` | traffic UI components | icons |
| `class-variance-authority`, `clsx`, `tailwind-merge` | — | | styling helpers |

### Installed but NOT imported in `src/` — do NOT claim as native

- `simplex-noise` `^4.0.3`
- `@splinetool/react-spline` `^4.1.0`, `@splinetool/runtime` `^1.12.69`
- `unicornstudio-react` `^2.1.1`

*(Verified by import scan; these exist only in data/prompt strings, not in component code.)*

## 3. Rendering Tiers Actually Used by the Two Categories

```
Tier 1 · Canvas 2D   → getContext("2d"), refs-backed state, rAF loop
        SpaceBackground, BeamGridBackground, HackerBackground, MagneticBackground,
        MouseGravityBackground, KineticGrid, InteractiveGridBackground, BlackHole,
        BlackHoleBackground, StarBurst, spider-web, Chandelier, FrostGlassMelt,
        AsciiWater, InfiniteTendrils, Scroll3DAnimation (image seq)

Tier 2 · Raw WebGL   → getContext("webgl"/"webgl2") + GLSL shader source strings
        HellBackground, WaveBackground, Lightfall, ReflectShader, GravitationalVortex,
        MorphingRings, BloomingFlower, PointDNAHelix, TwinGalaxyRings

Tier 3 · three.js     → new THREE.WebGLRenderer + ShaderMaterial / InstancedMesh / Points
        GlobeMesh, OceanSwell, BlockDrift, Tornado, ParticleSphere

Tier 4 · DOM / CSS / SVG
        FallBeamBackground (CSS keyframes), isometric-grid (framer-motion DOM),
        background-paths (SVG), infinity-image (CSS offset-path)

Tier 5 · tsparticles
        sparkles-background
```

## 4. Design Tokens (from `tailwind.config.ts` + `index.css`)

- Colors: `brand-bg #0A0A0A`, `brand-surface #141414`, `brand-surface-alt #1C1C1C`,
  `brand-blue #3D5CFF`, `brand-blue-dark #2540D6`, `brand-red #FF3B30`,
  `brand-yellow #FFC700`, `brand-black #000000`, `brand-green #3D5CFF`
  (**legacy alias for the blue**), `neon-*` → same blue family.
- Text: `text-primary #FFFFFF`, `text-secondary #A3A3A3`, `text-muted #6B6B6B`.
- Fonts: `display: Orbitron`, `heading: Space Grotesk`, `serif: Source Serif 4`;
  index.css adds Inter/Plus Jakarta Sans/DM Serif Display utilities
  (`.font-sans-clean`, `.font-serif-heading`, `.hero-title`, `.serif-italic`).
- Hard shadows: `.brutal-shadow-*`, `.brutal-card`, `.brutal-btn-*`.
- Glass/glow legacy: `.glass`, `.green-glow[-medium|-strong]`, `.green-border`.
- GPU/rendering: `.gpu-accelerated`, `.sharp-rendering`.

## 5. Global Animation Utilities (index.css — exhaustive keyframes)

| Utility class | Keyframe | Duration |
|---|---|---|
| `.animate-hero-float` | `heroFloat` | 7s ease-in-out infinite |
| `.animate-float` | `float` | 4s infinite |
| `.animate-float-slow` | `floatSlow` | 8s infinite |
| `.animate-ribbon-drift` | `ribbonDrift` | 9s infinite |
| `.animate-float-left` | `floatLeft` | 5s infinite |
| `.animate-float-right` | `floatRight` | 4.2s infinite |
| `.animate-orb-spin` | `orbCircularMotion` | 45s linear infinite |
| `.animate-orb-orbit` | `orbCircularFloat` | 12s infinite |
| `.animate-spin-once` | `spin-once` | 0.5s |
| `.animate-lightning-blink[-purple]` | `lightning-blink` | 4s infinite |
| `.animate-terminal-*-blink` | terminal blinks | 4s infinite |
| `.animate-shine` | `shine` | 5s infinite |
| `.animate-flicker` | `flicker` | 2s infinite |
| `.animate-white-blink` | `white-blink` | 4s infinite |
| `.skeleton-*` | shimmer/pulse | internal |

> **Important:** there is **NO `@media (prefers-reduced-motion: reduce)` rule in
> `index.css`.** Reduced-motion is handled imperatively via
> `window.matchMedia('(prefers-reduced-motion: reduce)')` in ~15 components
> (Tornado :16, FrostGlassMelt :154, DriftwoodGallery :18, RippleSignatureLedger :37,
> ScrollExpand :140, LoveAppHero :428, LumosHero :205, PaipaiKuaishou :98, MoodHero :755…).
> One embedded `@media (prefers-reduced-motion: reduce)` block exists inside
> `infinity-image.tsx:138` (component-owned CSS). A future generator that needs
> global reduced-motion CSS must add its own.

## 6. Theming

- `ThemeContext.tsx`: default `dark`; sets `<html class="dark">` (or `light`);
  persists to `localStorage['theme']`; exposes `theme`, `toggleTheme`, `useTheme()`.
- Components gate on `.dark/.light` classes or `theme === 'dark'`.

## 7. App Wiring

- `main.tsx`: `initFirebase(...)` then `<StrictMode><App/></StrictMode>`.
- `App.tsx`: `BrowserRouter > CookieConsentProvider > ThemeProvider > AuthProvider >
  SkeletonProvider > SmoothScroll(lenis) > AppShell`; all pages via `React.lazy`.
- Demo routes `/demo/*` exist for section-scroll, 3d-scroll-animation, 3d-slider,
  tars-hero-arena, split-fuzzy-orb, lumos, loveapp-hero, paipai-kuaishou, etc.

## 8. Component Data Layer

| File | Role |
|---|---|
| `data/componentData.tsx` | master registry; `category` union at :2632; lazy `preview` renderers |
| `data/embeddedSourceCode.ts` | exact full source strings keyed by slug (prompts read from here) |
| `data/componentMetadata.ts` | props + vibeMeta |
| `data/antigravityPrompts.ts`, `lovablePrompts.ts`, `claudePrompts.ts` | optional prompt overrides |
| `data/premiumComponents.ts` | premium-gated slugs |
| `utils/promptUtils.ts` | builds ADVANCE/ANTIGRAVITY/CLAUDE/CURSOR/LOVABLE prompts from embedded source |
| `utils/codeUtils.ts` | `getComponentCode(id, opts)` |

## 9. Preview / Screenshot Infra (background-relevant)

- `src/pages/PreviewCapturePage/PreviewCapturePage.tsx` — hidden route; renders
  `?ids=...` at fixed 1600×900; **defaults to the entire `interactive-background` category**.
- `scripts/announcement/capture-previews.mjs` — Playwright screenshotter; curated id list;
  uses `--enable-unsafe-swiftshader` for headless WebGL.
- No `html2canvas`/`dom-to-image` in the frontend (canvas screenshots are Playwright-side).

## 10. Anti-Facts (do not repeat)

1. **No WebGPU** anywhere.
2. **`simplex-noise`, `@splinetool/*`, `unicornstudio-react` are not used.**
3. **`magic-card`** has no `<img>`; it is cursor-spotlight gradient → excluded.
4. **`CloudScroll/`** is unregistered (no `componentData.tsx` entry).
5. **`magnetic-background`** is unregistered as a component but lazy-mapped at :2682.
6. **`sora-footer`** is static ribbon art, no interaction → not an interactive image.