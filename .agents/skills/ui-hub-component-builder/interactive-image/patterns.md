# Interactive Image — Patterns

Reusable structural patterns proven by image-interaction components plus image
hybrids/templates. Each lists proof + regeneration notes.

## PATTERN 1 — Scroll-driven track transforms (index → useTransform)

**Shape:** read scroll progress once; for each card `i`, map its window position
to a per-card `useTransform`; feed into `style` per card.

**Proof:** `diagonal-carousel.tsx` (row translateX per index),
`perspective-carousel.tsx` (per-card opacity/translate rotateY),
`spiral-images.tsx` (radius & rotation per index), `ThreeDSlider.tsx` (carousel
rotation mapped per card).

**Regeneration note:** keep the mapping function pure (`(i) => value`); the whole
transform must be GPU-compositable (`transform`, `opacity`).

## PATTERN 2 — Scroll parallax with `useScroll` + `useTransform`

**Shape:**
```tsx
const { scrollYProgress } = useScroll({ target });
const y = useTransform(scrollYProgress, [0, 1], [-50, 150]);
```
`y` is a motion value → applied via `<motion.img style={{ y }}>`. One
component/one target; hundreds of transforms stay cheap.

**Proof:** `HaulFooter.tsx:20-21` (footer product shots y −50→150),
`Scroll3DAnimation.tsx` (frame progress → image change).

## PATTERN 3 — GSAP pinned storytelling

**Shape:** `useGSAP(() => { gsap.to(panel, { scrollTrigger: {...} }) }, ...)`; pins
sections, scrubs transforms, kills via `ScrollTrigger.getAll().forEach(kill)`.

**Proof:** `SectionScroll.tsx` (pin + reveal, `ignoreMobileResize: true` :13),
`Scroll3DAnimation.tsx` (scrub a frame sequence, kill :188).

**Regeneration note:** call `ScrollTrigger.refresh()` after images load (heights
change); reserve pin spacing so content doesn't jump.

## PATTERN 4 — Per-layer parallax multipliers

**Shape:** one normalized pointer delta; each image applies `delta * tier` with a
distinct multiplier; background pushed less than foreground.

**Proof:** `LoveAppHero.tsx` (×1.0 / ×0.4 / ×0.25), `PaipaiKuaishou.tsx`
(×0.1–×0.8 on headline/image), `DontBeGreedyFooter.tsx` (×1.5–×6.5 product
cards), `MoodHero.tsx` (:751 per-image parallax).

**Regeneration note:** tiers in `style={{ transform: translate3d(...) }}` written
from the rAF loop (refs) or `useTransform` — avoid `useState` per move (see
`shared/anti-patterns.md` #3).

## PATTERN 5 — Tilt / press imaging

**Shape:** normalize cursor → `rotateX/rotateY` in degrees; `scale(0.95)` while
`pointerdown`; use `transition` for return-to-rest.

**Proof:** `LumosHero.tsx` (:216-217, :246, :249 `translate3d`).

**Regeneration note:** reduced-motion zeros the transforms (:205); consider
`will-change-transform`.

## PATTERN 6 — Trail replication wheels (sprite soup)

**Shape:** on `pointermove`, out-of-threshold → copy current `<img>` into a list
of spawned clones; cap count; animate each with spring scale/rotate and exit
opacity via `AnimatePresence`.

**Proof:** `image-trail.tsx` (+ `MouseGravityTrail` variant).

**Regeneration note:** cap with threshold `if (distance < THRESHOLD) return;` and
dedup keys; don't store trail in React state per element on the hot path.

## PATTERN 7 — Overlay canvas above `<img>`

**Shape:** `<img>` + absolutely-positioned `<canvas>` overlaid; canvas draws wax
seal / ink / ripple on click; pointer track left unclamped.

**Proof:** `RippleSignatureLedger.tsx:152-204` (seal geometry :152, dried ink
:179, pressable circle :191-204).

**Regeneration note:** `pointer-events-none` on the canvas except the hot spot,
so clicks pass to the underlying `<img>` contextual handlers; honor reduced-motion
(static seal).

## PATTERN 8 — Autoplay with hover-pause + dots

**Shape:** `setInterval`/rAF advances `activeIndex`; `onMouseEnter` pauses,
`onMouseLeave` resumes; dots render buttons with `aria-label={Go to slide i}`.

**Proof:** `DriftwoodGallery.tsx:26-34` + `:172`, `testimonials-card.tsx:81`,
`ThreeDSlider.tsx:108`.

**Regeneration note:** clear interval on unmount (no orphan pings); skip the
interval when the doc is hidden (`visibilitychange`) for battery.

## PATTERN 9 — Path-based (CSS `offset-path`) image motion

**Shape:** animate along a lemniscate with CSS `offset-path: path(...)`; add a
motion-path that holds the visual loop forever.

**Proof:** `infinity-image.tsx`.

**Regeneration note:** browsers do the math; just give `offset-distance` animated
by framer; embed a reduced-motion media query that pins the image.

## PATTERN 10 — Preloading + `eager`/lazy discipline

**Shape:** preload sequence frames at mount (`new Image(); img.src = ...`);
critical above-fold uses `eager` + `fetchPriority="high"`; below-fold carousel
images `loading="lazy"`.

**Proof:** `Scroll3DAnimation.tsx` (imagesRef preload), `ToonhubHero.tsx:18-21`,
`TemplateDetailPage.tsx:147-152` (`eager`/`fetchPriority`).

**Regeneration note:** keep the preload list in a `useRef`, trigger only once.

## PATTERN 11 — State-parallax template (documented anti-pattern)

**Shape:** `onMouseMove={setState(parallax)}` per mousemove.

**Proof:** `SplitFuzzyOrbHero.tsx:9/:18`, `PortfolioClosing.tsx:536/:556`,
`MoodHero.tsx:751`.

**Regeneration note:** classified in `shared/anti-patterns.md` (#3) as something
to AVOID in new work — use refs + rAF lerp or `useMotionValue` instead.