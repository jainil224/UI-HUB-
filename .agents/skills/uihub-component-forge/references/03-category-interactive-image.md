# Category Reference: `image-interaction` ("Image Interaction")

> Phase 1 research output for UI-HUB Component Forge. Every claim is cited to
> `frontend/` source or to `data/component-index.json`.
>
> **Registry stub:** the category slug is `image-interaction`
> (`frontend/src/data/componentData.tsx` — near `export type ComponentItem`); the display label shown on the
> library page is **"Image Interaction"**, not "Interactive Image"
> (see `LibraryPage.tsx` `CATEGORY_META`). Use `image-interaction` in code.
> **10 registered components.**

---

## 1. Definition & inclusions

`image-interaction` = content components whose primary job is interactive imagery —
trails, carousels, cascades, collages, collapsing galleries — rather than decorative
full-bleed backgrounds. Unlike `interactive-background`, these:

- render real DOM + real `<img>`/`<div>` (replaced by `item.preview` in the library
  detail page), or a 2D canvas with an image texture;
- are keyboard/drag friendly where possible;
- receive their **visual data as props** (`images`, array of `{ src, alt?, tint? }`)
  rather than self-contained palettes.

Two tiers coexist:
- **DOM + Framer Motion tier:** `infinity-image`, `card-cascade`, `image-trail`,
  `perspective-carousel`, `diagonal-carousel`, `testimonials-card`, `image-collage`.
- **2D canvas tier:** `spiral-images`, `ripple-signature-ledger`, `driftwood-gallery`.

## 2. Register facts (id → file)

| id (slug) | file | tech | lines |
|---|---|---|---|
| spiral-images | `spiral-images.tsx` | canvas+rAF | 324 |
| infinity-image | `infinity-image.tsx` | CSS keyframes | 249 |
| card-cascade | `CardCascade.tsx` | rAF+scroll | 664 |
| image-trail | `image-trail.tsx` | framer-motion | 232 |
| perspective-carousel | `perspective-carousel.tsx` | framer-motion | 250 |
| diagonal-carousel | `diagonal-carousel.tsx` | framer-motion | 247 |
| testimonials-card | `testimonials-card.tsx` | framer-motion | 245 |
| image-collage | `image-collage.tsx` | framer-motion | 98 |
| ripple-signature-ledger | `RippleSignatureLedger.tsx` | canvas+rAF | 228 |
| driftwood-gallery | `DriftwoodGallery.tsx` | rAF+interval | 205 |

Registry assignments: the `image-interaction` entries in `componentList`
(`componentData.tsx` — near `Spiral Images` through `Image Collage`), plus the
newer community additions near the end of the array.

## 3. Naming conventions

- Files are kebab-case for the motion-tier ports (`image-trail.tsx` — near
  `export function ImageTrail`, `perspective-carousel.tsx` — near
  `export function PerspectiveCarousel`, `diagonal-carousel.tsx` — near
  `export function DiagonalCarousel`, `testimonials-card.tsx` — near
  `export function TestimonialsCard`, `image-collage.tsx` — near
  `ImageCollage = React.forwardRef`, `spiral-images.tsx`, `infinity-image.tsx` —
  near `export default function InfinityImage`) and PascalCase for a few hand-built
  ones (`CardCascade.tsx` — near `export function CardCascade`,
  `RippleSignatureLedger.tsx` — near `export const RippleSignatureLedger`,
  `DriftwoodGallery.tsx` — near `export const DriftwoodGallery`).
  No strong rule — **follow the neighboring file.**
- Named export + `export default` for the motion tier (`ImageTrail`,
  `PerspectiveCarousel`, `DiagonalCarousel`, `TestimonialsCard`,
  `ImageCollage = React.forwardRef(...)`). `forwardRef` is used only by
  `image-collage.tsx` — near `ImageCollage = React.forwardRef`.
- Prop interfaces:
  - `ImageTrailProps extends React.HTMLAttributes<HTMLDivElement>`
    (`image-trail.tsx` — near `export interface ImageTrailProps`) — so className/style/aria-forwarding is free.
  - `ImageCollageProps extends React.HTMLAttributes<HTMLDivElement>`
    (`image-collage.tsx` — near `export interface ImageCollageProps`).
  - `SpiralImages(props: any)` (`spiral-images.tsx`) — **UNKNOWN typing: gap**.
  - `InfinityImageProps` (`infinity-image.tsx` — near `export interface InfinityImageProps`).
- Images arrive as **`Array<{ src; alt?; tint? }>`** including a `tint` CSS-filter
  field (e.g. `DriftwoodGallery`, `spiral-images`). Keep this contract.

## 4. Best reference components (READ THESE FIRST)

1. **`image-trail.tsx`** — cleanest Framer-Motion pointer interaction in the
   category: a `Set` of timeout ids (`timersRef`) cleared on unmount, `maxItems`
   cap, move throttling via `threshold + minDelay`, zero rAF. FCFS "first class"
   a11y (real `<img>` with alt + focusable region). Cite `:68`, `:12`,
   index `performanceNotes`.
2. **`RippleSignatureLedger.tsx`** — the canvas-tier template: DPR cap 2,
   ResizeObserver (disconnected on cleanup), single rAF cancelled on unmount,
   `prefers-reduced-motion` short-circuit, `touch-action: none` for pointer
   events, `pointerdown` listener removed on cleanup, `object-fit: cover` texture.
   Cite `:19` (default export), index `performanceNotes`.
3. **`infinity-image.tsx`** — the **pure-CSS** template: `offset-path` keyframes with
   **zero JS animation loop**; ResizeObserver scales an entire 700x320 stage below
   740px (`minScale: 0.42`); `prefers-reduced-motion` disables the animation via an
   injected `@media` rule; images `loading="eager"` with `onError` hide. Cite
   `:64`, index `performanceNotes`.

## 5. Recurring skeleton

All 10 follow: **props (images + options) → container sizing → per-frame or per-event
update → cleanup-on-unmount → pointer/keyboard affordances**.

```
images: { src, alt?, tint? }[]        // contract
options: intervalMs / count / size / speed ...
const containerRef = useRef / RO-drive size         // ResizeObserver, DPR cap
render images: <img> w/ object-fit + alt            // DOM tier
   OR <canvas> 2D drawImage                          // canvas tier
motion: framer-motion springs OR rAF loop OR css offset-path
cleanup: cancelAnimationFrame / clearTimeoutSet / disconnect RO / removeEventListener
a11y: alt on every <img>, reduced-motion, keyboard for carousels
```

`image-collage.tsx` is the smallest readable slice (98 lines): a spring toggle of
`.layout` between `'collage'` and `'row'` — use it as the "hello world" of the
category.

## 6. Props & defaults

- Shared shape: `images` (required, no default — see `DriftwoodGallery`,
  `RippleSignatureLedger`, `spiral-images`) + numeric options (interval, counts).
- `DriftwoodGallery` defaults: `intervalMs 5200`, `waveAmp 6`, `showDots true`
  (index props).
- `RippleSignatureLedger` key option: a duration/speed (`rippleSpeed` family) and
  `image`. `InfinityImage` uses `image` singular + `width/height/scale` options.
- `TestimonialsCard` defaults include a demo `{ name, quote, avatar, color }` seed in
  some variants — do **not** bake content; image components must render prop data.

## 7. Performance & lifecycle rules (from code)

- Framer tier: **no rAF** — springs & AnimatePresence only (`image-trail`,
  `perspective-carousel`, `diagonal-carousel`, `testimonials-card`, `image-collage`).
- Canvas tier: single rAF cancelled on cleanup; DPR max 2; RO disconnected; images
  `loading="lazy"` for slide galleries (`DriftwoodGallery`), `eager` only for the
  always-visible hero spiral (`spiral-images`, `infinity-image`).
- `prefers-reduced-motion`: honored by `infinity-image`, `ripple-signature-ledger`
  (skip expansion), `driftwood-gallery` (skip parallax).
- `CardCascade` throttles scroll handlers as **passive** listeners and removes them
  on cleanup; preview mode auto-advance is `cancelAnimationFrame`-managed; no
  framer-motion dependency.
- **No state-per-frame:** parallax writes `transform` directly to the DOM node ref
  (`DriftwoodGallery`) — zero re-renders.

## 8. Accessibility

- Every `<img>` in the motion tier carries `alt` (contract field). `tint` filter
  layers do not break alt text.
- Carousels are keyboard-driven: ArrowLeft/ArrowRight listeners + focusable region
  + per-slide `aria-*` (perspective + diagonal carousels).
- `image-trail`: hover-reveal is an overlay; real content remains the underlying
  card — never hide interactive content behind a trail.
- `prefers-reduced-motion` required for any continuous loop (see perf rules).

## 9. Anti-patterns observed (do NOT replicate)

- `spiral-images.tsx` types props as `any` and has **no default export name
  match** — typed, named default export expected for new builds.
- Auto-plays with no pause/`prefers-reduced-motion` guard (any future carousel).
- `tint` filter used to fake brand colors over photos without providing the
  underlying asset (`alt` must describe the photo, not the tinted look).
- Baking `Data` (demo testimonial content) as default props — content belongs in the
  `images`/`data` prop, not in defaults.

## 10. Metadata gap (Phase 3 feeding)

`frontend/src/data/componentMetadata.ts` `COMPONENT_CONFIG` (Record of
`ComponentConfig`, declared `:22`) has entries for only:
`spiral-images` (`:582`), `infinity-image` (`:606`),
`ripple-signature-ledger` (`:980`), `driftwood-gallery` (`:1013`).

**Missing for 6 components:** `card-cascade`, `image-trail`, `perspective-carousel`,
`diagonal-carousel`, `testimonials-card`, `image-collage`. The forge's Phase 3
'generate component-spec' task must backfill these configs (props, defaults,
category) before the component-specs can be generated from metadata alone.