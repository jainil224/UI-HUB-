# Accessibility & Reduced-Motion Rules

Observed accessibility behavior across both categories. **Do not invent
accessibility that doesn't exist** — below is what the repository actually does.

## 1. Reduced Motion (the dominant pattern)

- **No global CSS rule.** `frontend/src/index.css` has no
  `@media (prefers-reduced-motion: reduce)`. Reduced motion is checked in JS:
  `window.matchMedia('(prefers-reduced-motion: reduce)')`.
- Behavior on reduce:
  - Stop the animation loop: `Tornado.tsx:1339-1340` (`running = !reducedMotion`).
  - Render a single static frame: `FrostGlassMelt.tsx:151-154`.
  - Zero the parallax/tilt vectors: `PaipaiKuaishou.tsx:744-774`, `LumosHero.tsx:205`,
    `MoodHero.tsx:761`, `LoveAppHero.tsx:428`.
  - Halt scroll expansion: `ScrollExpand.tsx:140`.
  - Don't auto-slide / show static state: `DriftwoodGallery.tsx:18`,
    `RippleSignatureLedger.tsx:37`.
- Listen for change: Tornado's `useReducedMotion` hook uses `matchMedia` +
  `change` listener (:13-23).
- Component-owned CSS reduced-motion exists inside `infinity-image.tsx:138`
  (`@media (prefers-reduced-motion: reduce)` inside its injected/embedded CSS).

**Rule:** any new interactive background/image component MUST include a
`matchMedia('(prefers-reduced-motion: reduce)')` guard that at minimum stops the
loop / static frame / zeroes pointer-driven transforms.

## 2. Decorative vs Interactive Semantics

- **Decorative backgrounds** are commonly wrapped with `pointerEvents: 'none'`
  (BlackHole:522, AsciiWater:757, ReflectShader:318, MagneticBackground fragment,
  DriftwoodGallery layer:146). This keeps overlaying content interactive — the
  intended behavior for background layer decks.
- **Canvas-facing scenes get `aria-label`s** describing the scene:
  - `AsciiWater.tsx:1079` — "A pool of water drawn in monospace characters, stirred by the pointer"
  - `FrostGlassMelt.tsx:483` — "A pane of frost on glass that melts where the pointer hovers…"
  - `GlobeMesh.tsx:1224` — "Globe of points…"
  - `OceanSwell.tsx:620` — "Open ocean swell…"
  - `InfiniteTendrils.tsx:423`, `spider-web.tsx:501`, `BlockDrift.tsx:666`
  - `RippleSignatureLedger.tsx:168` — "Ledger photo — click to stamp a wax seal"
- **Interactive controls** get `aria-label`s:
  - carousels: `diagonal-carousel.tsx:130/175/205/219/233`, `perspective-carousel.tsx:127/166/208/222/236`,
    `testimonials-card.tsx:220/233`, `ThreeDSlider.tsx:356/359`,
    `DriftwoodGallery.tsx:172` (`Go to slide ${i+1}`).
- **Image `alt`:** real photos carry `alt` text where authored; decorative icon
  images use `alt=""` (empty) to avoid noise (image-trail thumbnails use cycling
  seeds; gallery slides accept `alt` prop — DriftwoodGallery images have `alt`).

## 3. Keyboard / Focus

- Interactive carousel controls are `<button>` elements (`nav-btn`, jump dots),
  hence tabbable and role-announced.
- **Hover-only interactions are NOT keyboard-reachable** in several components
  (e.g., hyperspace-style hover-scatter in ParticleSphere, hover ramps in
  MorphingRings/BloomingFlower). This is an observed limitation — do not claim
  keyboard parity that doesn't exist.
- tabindex/focus management is not present in the studied decorative
  backgrounds (correct — they are ambient).

## 4. Touch

- Pointer-events based interactions work on touch (see `shared/responsive.md`).
- `touch-action: none` on draw surfaces (FrostGlassMelt).

## 5. Contrast / Visibility

- Dark backgrounds use high-contrast text tokens (`text-primary #FFFFFF`,
  `text-secondary #A3A3A3`) and brand accents. Preview thumbnails darken behind
  bright scenes to keep text readable.
- Some background scenes (Lightfall streaks, HellBackground facet spin) are
  decorative and deliberately low-contrast — acceptable because they carry no
  content.

## 6. Rules for New Components

1. Add `aria-label` to a canvas/non-text scene that meaningfully describes it.
2. Give every control (`<button>`, dot, arrow) a descriptive `aria-label`.
3. Keep interactive semantics on real elements (buttons/links) so keyboard
   navigation works; don't rely only on `onPointerMove`.
4. Add `pointerEvents:none` to decorative sub-layers only.
5. Provide a `prefers-reduced-motion` stop/static path.
6. For image galleries, accept/preserve `alt` text per slide and `loading="lazy"`
   below the fold.