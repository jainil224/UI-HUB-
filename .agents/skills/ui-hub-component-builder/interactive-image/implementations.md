# Interactive Image — Implementations

Every relevant, verified Interactive Image implementation.
Tables 1–2: paths relative to `frontend/src/components/ui/`.
Templates (table 3): `frontend/src/components/templates/`.
Registry refs `frontend/src/data/componentData.tsx` (union :2632).

Legend: Category (img = `image-interaction`; hybrid = cross-category whose core
is an image interaction; tpl = exported template hero) · Driver (S = scroll,
P = pointer, A = autoplay, D = drag, C = click) · empty confidence = High.

## Primary — `image-interaction`

| # | Component (slug) | Driver | Technique summary |
|---|---|---|---|
| 1 | SpiralImages (`spiral-images`) | S | Scroll-driven spiral of images; rows/tiers parallax at different radii; scrub synced to scroll progress; `will-change-transform`. |
| 2 | InfinityImage (`infinity-image`) | A | Image follows an infinite lemniscate (figure-8) path via CSS `offset-path` `motion-path`; embedded `@media (prefers-reduced-motion: reduce)` closes motion (:138-region). |
| 3 | CardCascade (`card-cascade`) | P / A | Framer `AnimatePresence` cascade: hovered card expands, siblings animate to new layout; springy ease; entrance stagger. |
| 4 | ImageTrail (`image-trail`) | P | Thumbnails replicate beneath the pointer; spring exit (`AnimatePresence`); random/cycled image selection; capped count of spawned <img> via counts+dedup keys (:56-57/:196). |
| 5 | PerspectiveCarousel (`perspective-carousel`) | A / P | 3D-tilting carousel; index-derived per-card `useTransform`; arrows + autoplay; hover pauses; `aria-label`s (prev/next/dots). |
| 6 | DiagonalCarousel (`diagonal-carousel`) | A / P | Diagonal-scrolling carousel; per-card transforms from scroll container; arrows + clickable dots; `aria-label`s. |
| 7 | TestimonialsCard (`testimonials-card`) | A / P | Auto-rotating testimonial/photo card; `setInterval` autoplay :81; pause on hover; dot nav. |
| 8 | ImageCollage (`image-collage`) | A | Layered collage; images animate position/opacity on hover (subtle wrap transitions); flex-col → md:flex-row responsive. |
| 9 | RippleSignatureLedger (`ripple-signature-ledger`) | C / P | Ledger photo; hover watermark + ripple; **Canvas2D overlay above `<img>`** drawing wax seal (position ring :152/:168, dried ink :179, hit-area circle :191-204); reduced-motion → static :37. |
| 10 | DriftwoodGallery (`driftwood-gallery`) | S / A | Scrollry image gallery with rAF pointer parallax (lerp 0.09 :48-49 at :49) + autoplay :26-34 + hover-pause + dots (:172 aria-label); reduced-motion :18; `pointerEvents:none` decorative layer :146. |

## Hybrids (cross-category registrations, image-interaction core)

| # | Component (file) | Reg. cat. | Driver | Technique summary |
|---|---|---|---|---|
| 11 | SectionScroll (`SectionScroll.tsx`) | scroll | S | GSAP ScrollTrigger pinned panels; each panel features image (`img1.jpg` :219) with `hover:scale-105` :221; `ScrollTrigger.config({ignoreMobileResize:true})` :13. |
| 12 | Scroll3DAnimation (`Scroll3DAnimation.tsx`) | 3d | S | Scrubbed image sequence: 60 frames labeled `frame_XX`; GSAP ScrollTrigger scrub; `useGSAP` (:110); `ScrollTrigger.getAll().forEach(trigger => trigger.kill())` :188; images preloaded. |
| 13 | ThreeDSlider (`ThreeDSlider.tsx`) | 3d | S / P / A | 3D carousel of image cards; index-derived transforms; autoplay via rAF/interval :108 + `gsap.to` :133; keyboard arrows; `aria-label`s :356/:359. |
| 14 | ToonhubHero (`ToonhubHero.tsx`) | 3d | P | Image stack (preloaded at mount :18-21); text/props parallax; `transform-gpu` classes; depth stack of several images. |
| 15 | HaulFooter (`HaulFooter.tsx`) | footer | S | Footer product showcase; **`useScroll({target})` + `useTransform`** `y = [-50, 150]` :20-21; product shot :107 drifts via transform. |

## Template heroes (exported from `templates/`, image-technique references)

| # | Template | Driver | Technique summary |
|---|---|---|---|
| 16 | SplitFuzzyOrbHero | P | Hero split half+half; **clip-path halves**: left `inset(0 50% 0 0)`, right `inset(0 0 0 50%)` (:30/:50); pointer-driven translate on state-parallax (useState per event — documented anti-pattern in `shared/anti-patterns.md`), GPU classes. |
| 17 | LoveAppHero | P | Three parallax image tiers: **×1.0 / ×0.4 / ×0.25** (:123/:233/:316/:317); reduced-motion zeros tiers :428; `will-change-transform`; hero prompt cards. |
| 18 | PaipaiKuaishou | P / S | Product hero with strong parallax: **headline ×0.1, image ×0.4-0.8, parallax scroll-delay** (:211/:233/:452/:505); reduced-motion zeroes transforms :744-774. |
| 19 | DontBeGreedyFooter | S / P | Bottom-chaos section: stacked product cards each with **multiplicative parallax ×1.5–×6.5** (:27/:36/:45/:56/:78/:116). |
| 20 | LumosHero | P / C | Image tilt: `rotateX ±5º / rotateY ±6º` (:216-217); press → `scale-95` (:246); `translate3d` parallax (:249); reduced-motion zeros :205. |
| 21 | AuCabaretPoster | A / P | Poster-layout hero; images slot into art-deco grid; hover-card tilt. |
| 22 | Labs2586 | P | Hero text + product image parallax; scrubbed visual fields. |
| 23 | MoodHero | P | Image-collage hero; per-image parallax :751; reduced-motion zeros :761. |
| 24 | PortfolioClosing | P | Closing fold: portrait/photos + FX; state-parallax on `mousemove` (:536/:556). |

## Verified non-qualifiers (read to eliminate)

- `GradientOrb`, `GeneratingOrb`, `TradingCandles`, `AuroraBpmLoader` → `loader`
  (animated decorative screens, no images or no interaction).
- `DeezNuts` (3d BoxOverlay), `MagicLink` (link), `GhostTrail` (cursor) → not images.
- Direct `<img>` demos without interaction (static preview) → not counted.
- `CloudScroll/` → unregistered R3F ScrollControls images demo — not part of the
  two categories or the data layer.