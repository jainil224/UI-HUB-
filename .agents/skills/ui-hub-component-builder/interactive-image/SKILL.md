# Interactive Image — SKILL (instruction manual for a future coding agent)

## 1. Category definition

An **Interactive Image** is a component whose core material are **images**
(photos, artwork, cinematic frames) and whose interaction makes those images
move/responsive — parallax, transform, drag, thumbnail trails, carousels,
three-dimensional image stacks. Registered in UI-HUB under `category:
"image-interaction"` (plus a few scroll/3d/footer/custom hybrids whose core is
an image interaction).

## 2. When to use it

- Hero images that move with pointer/scroll (parallax, tilt, reveal).
- Photo galleries, carousels, stacks, image trails, cinematic scroll sequences.
- Signature/product/ledger images with interactive overlays.

## 3. Existing UI-HUB implementations

Primary `image-interaction`: spiral-images, infinity-image, card-cascade,
image-trail, perspective-carousel, diagonal-carousel, testimonials-card,
image-collage, ripple-signature-ledger, driftwood-gallery (acknowledged on the
registry at `frontend/src/data/componentData.tsx:2632`).

Cross-category hybrids carrying image interactions: SectionScroll (scroll,
GSAP pinned panels), Scroll3DAnimation (3d, scrubbed image sequence),
ThreeDSlider (3d, mouse-driven 3-carousel), ToonhubHero (3d, image stack + tilt),
HaulFooter (footer, scroll-parallax product shots).

Template heroes (exported from `templates/`) with real image techniques:
SplitFuzzyOrbHero, LoveAppHero, PaipaiKuaishou, DontBeGreedyFooter, LumosHero,
AuCabaretPoster, Labs2586, MoodHero, PortfolioClosing.

## 4. Observed patterns

1. **`useScroll` + `useTransform`** for scroll parallax (HaulFooter:20-21).
2. **`useTransform(i => xRange(x))`** per-card transforms in carousels
   (diagonal-carousel, perspective-carousel, three-d-slider).
3. **Pointer-proportional image translate** with per-layer multipliers
   (LoveAppHero ×1/×0.4/×0.25; PaipaiKuaishou ×0.1–×0.8; DontBeGreedyFooter ×1.5–×6.5).
4. **Tilt via `rotateX/rotateY` + press scale** (LumosHero :216-217/:246).
5. **Clip-path split reveal** (SplitFuzzyOrbHero :30/:50).
6. **GSAP ScrollTrigger pinned image-sequence scrub** (Scroll3DAnimation) and
   pinned panel stacks (SectionScroll).
7. **Thumbnail trail with spring cleanup** (image-trail :56-57/:196).
8. **Canvas overlay above `<img>`** for signature/wax effect
   (RippleSignatureLedger :152-204).
9. **Autoplay carousels with hover-pause + dots** (DriftwoodGallery :26-34,
   testimonials-card :81, ThreeDSlider :108).

## 5. Technology / dependency rules

Third tier mix: framer-motion (dominant — used by 10/18 listed components),
GSAP + ScrollTrigger (used by Scroll3DAnimation, SectionScroll; also
`gsap.to` in three-d-slider :133), raw CSS for clip-path/layers, Canvas2D for
signature overlay. ThreeDSlider models a 3D carousel of image cards driven by
pointer (+ GSAP autoplay); its image handling is DOM/CSS3D-style cards, not a
WebGL texture scene — validate the source before claiming otherwise.

## 6. Interaction rules

- **Scroll:** `useScroll({ target, offset })` + `useTransform`; GSAP
  ScrollTrigger pin for per-section storytelling (SectionScroll:221 pinned
  panels).
- **Pointer:** normalized cursor deltas applied into `useTransform` or inline
  `style.transform` from a rAF loop; `translate3d()` for GPU compositing.
- **Multiplier tiers:** each image/layer gets its own parallax factor — subtle
  at 0.1–0.8 for background; dramatic 1.5–6.5 for product heroes.
- **Hover-pause** autoplay so images don't fight the reader on touch/hover.
- Respect `prefers-reduced-motion` → zero transforms / stop autoplay.

## 7. Animation rules

- Animate `transform` + `opacity` ONLY (GPU compositing). Preserve the
  `will-change-transform` hint.
- `AnimatePresence` for enter/exit of trail cards and modal-like rooms.
- Springs for playful follow (card-cascade cascade, image-trail spring exit).
- GSAP pinning requires `ScrollTrigger.refresh()` on resize and
  `ScrollTrigger.config({ ignoreMobileResize: true })` (SectionScroll:13).

## 8. Responsive rules

- Images use `object-cover` with explicit `aspect` (SectionScroll:221,
  carousel rows keep fixed window height + `overflow-hidden`).
- Carousels re-center on resize; sections pinned only above `md` (scroll
  components listen to width).
- Card grids wrap; stack layouts stack (image-collage adapts via `flex-col md:flex-row`).
- Gallery nav (dots/arrows) sized ≥ 44px hit target where practical.

## 9. Accessibility rules

- Add `aria-label` to every nav control (diagonal-carousel:130/205,
  perspective-carousel, testimonials-card, DriftwoodGallery:172).
- `alt` text on real photos; `alt=""` on decorative icons/trails.
- Canvas overlays above images carry `aria-label` describing the interactive
  action (RippleSignatureLedger:168).
- Reduced motion: stop parallax + stop autoplay (PaipaiKuaishou:744-774,
  LumosHero:205, MoodHero:761, DriftwoodGallery:18, RippleSignatureLedger:37).

## 10. Performance rules

- Preload critical frames (Scroll3DAnimation imagesRef preloads; ToonhubHero:18-21).
- `eager` + `fetchPriority="high"` for above-fold previews (TemplateDetailPage:147-152);
  `loading="lazy"` below fold.
- Cap spawned DOM nodes for trails/image-trail.
- Parallax from refs/rAF, not per-event React state (DriftwoodGallery:48-49).
- Carousel rows: translate only the active region; `will-change-transform`.

## 11. Reusability rules

- Accept `images` props (HeroImages, arrays of `{src, alt, className}`) mirroring
  ToonhubHero/AuCabaretPoster patterns; accept `titleProps`, `style`, `debounce`.
- Keep gallery/stack transitions in one place — expose `activeIndex` + controls
  like the carousels.
- Register as `category: "image-interaction"` (or documented hybrid) in
  `componentData.tsx`.

## 12. Common failure cases

1. Parallax applied to a `background-attachment` CSS property (GPU redraw per
   frame) — use `transform`/`move` instead (DriftwoodGallery refs).
2. Scroll repair after images load → element heights change → pinned sections
   jump; call `ScrollTrigger.refresh()` (SectionScroll/#mention).
3. Missing reduced-motion → vestibular motion on scroll sequences.
4. Autoplay without hover-pause → relentless motion copy.
5. Trail counts unbounded → memory bloat.
6. Fixed-px width galleries → overflow on mobile.

## 13. Generation checklist

- [ ] Decide interaction driver: scroll (useScroll/ScrollTrigger) or pointer.
- [ ] Choose image source shapes (`images` prop vs static arrays).
- [ ] Apply `will-change-transform`, `object-cover`, correct aspect.
- [ ] Preload critical frames; lazy below-fold.
- [ ] Reduced-motion: zero transforms / stop autoplay.
- [ ] Controls keyboard-able + `aria-label`; photos get `alt`.
- [ ] Cap any trail/spawned node count.
- [ ] Cleanup listeners, intervals, GSAP context on unmount;
      `ScrollTrigger.refresh()` on resize/page-content change.
- [ ] Data-register with `category: "image-interaction"` (+ embedded source +
      metadata) — see `examples/index.md`.

## 14. Validation checklist

- [ ] Works at 320/768/1440; no overflow; carousels re-center on resize.
- [ ] `npm run lint`/tsc + `npm run build` pass.
- [ ] `prefers-reduced-motion: reduce` → static images.
- [ ] Keyboard can drive carousel nav.
- [ ] Preview capture renders at 1600×900; slug in
      `scripts/announcement/capture-previews.mjs`.

## 15. Evidence / source references

- image-interaction: `spiral-images.tsx` (scroll-parallax spiral), `infinity-image.tsx`
  (CSS offset-path lemniscate), `CardCascade.tsx` (Framer AnimatePresence cascade),
  `image-trail.tsx` (spring trail :56-57/:196), `perspective-carousel.tsx`,
  `diagonal-carousel.tsx`, `testimonials-card.tsx` (:81 autoplay), `image-collage.tsx`,
  `RippleSignatureLedger.tsx` (:152-204 canvas + :168 aria-label, reduced :37),
  `DriftwoodGallery.tsx` (:18 reduced, :26-34 autoplay, :48-49 lerp, :146 pointerEvents).
- Hybrids: `SectionScroll.tsx` (:6-13 gsap, :134 ScrollTrigger, :219 img1, :221 hover:scale),
  `Scroll3DAnimation.tsx` (:7-10 imports, :110/188 GSAP kill, :219 img1),
  `ThreeDSlider.tsx` (:108 autoplay, :133 gsap.to),
  `ToonhubHero.tsx` (:18-21 preload, :33 text-parallax),
  `HaulFooter.tsx` (:20-21 useScroll/useTransform y[-50,150], :107 product img).
- Templates: `SplitFuzzyOrbHero.tsx` (:9/:18 state parallax, :30/:50 clip halves),
  `LoveAppHero.tsx` (:123/:233/:316/:317 tiers, :428 reduced),
  `PaipaiKuaishou.tsx` (:211/:233/:452/:505 multipliers, :744-774 reduced),
  `DontBeGreedyFooter.tsx` (:27/:36/:45/:56/:78/:116 multipliers),
  `LumosHero.tsx` (:205 reduced, :216-217 rotateX/rotateY, :246 scale-95, :249 translate3d),
  `AuCabaretPoster.tsx`, `Labs2586.tsx`, `MoodHero.tsx` (:751 parallax, :761 reduced),
  `PortfolioClosing.tsx`.
- Registry: `frontend/src/data/componentData.tsx` union :2632.