# Interactive Image — Dependencies

External packages actually used by the interactive-image code.
Rooms: primary (`image-interaction`) + hybrids (`scroll`,`3d`,`footer`) +
templates. Versions from `frontend/package.json:14-49` unless noted.

## 1. Runtime libraries

| Package | Ver | Used in | Notes |
|---|---|---|---|
| `framer-motion` / `motion` | ^12.34.4 / ^12.34.5 | spiral-images, CardCascade, image-trail, diagonal-carousel, perspective-carousel, testimonials-card, image-collage, RippleSignatureLedger (some use runtime), HaulFooter, ThreeDSlider (imports), templates | The dominant engine for image interaction (useScroll/useTransform/motionValue/AnimatePresence) |
| `gsap` | ^3.14.2 | Scroll3DAnimation, SectionScroll, ThreeDSlider (:133) | ScrollTrigger pinning + scrubbing + `gsap.to` |
| `@gsap/react` | ^2.1.2 | Scroll3DAnimation, SectionScroll (`useGSAP`) | Effect-scoped GSAP context |
| `three` | ^0.183.2 | ThreeDSlider (perspective camera + card transforms) | Only image-related three usage; NOT used by other 17 |
| `react` / `react-dom` | ^19 | everywhere | — |
| `lenis` | ^1.3.18 | SectionScroll / demo wrappers showing smooth scroll alongside ScrollTrigger | optional smoothing in demos |

No new image-processing libraries in the two categories — all image motion is
transform/compositing driven.

## 2. Anti-dependencies (do NOT use)

- `simplex-noise`, `@splinetool/*`, `unicornstudio-react` — installed, unused.
- `@react-three/fiber`, `@react-three/drei` — only in unregistered CloudScroll.
- Image-processing/SVG/Canvas libraries — none installed, none used.

## 3. CSS capability subset

Requires browser support for: `clip-path: inset()`, `offset-path`/
`offset-distance` (or `motion-path` fallback), `will-change`, `object-cover`,
`transform-style: preserve-3d` (ThreeDSlider carousel), `backdrop-blur`
(glass panels). All baseline-graded supported.

## 4. Version pinning note

Never bump. Use installed majors exactly; note product pins in
`package.json:14-49`.

## 5. Build-time

Nothing custom: scenes use Vite defaults, framer/gsap treeshake automatically.
Images live in `frontend/public` (e.g. `img1.jpg`, `frame_XX.jpg`, template
assets) referenced by string, so no import machinery needed.