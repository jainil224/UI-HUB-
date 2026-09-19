# Interactive Image — Techniques

Tactics mapped from verified implementations. Image interaction = "what makes
the image move". Each entry has what it is, proof, and usage rules.

## T-IMG-1. Scroll-progress → sequence-frame swap

Keep 60+ labeled frames (`frame_01` … `frame_60`); map `scrollYProgress` to an
index; set `img.src` (or a camera) from that index on a scrubbed timeline.

**Proof:** `Scroll3DAnimation.tsx` (scrub images; GSAP ScrollTrigger), `SpiralImages`
(radius/rotation scrub on progress).

**Usage:** preload all frames; interpolate progress→index in the scrub callback;
`will-change` on the image container.

## T-IMG-2. Window-position → per-card rotation (carousel)

For each card `i`, derive `progress` from its bounding center vs viewport; map
to `rotateY`, `opacity`, `z-index`, and `scale`.

**Proof:** `perspective-carousel.tsx`, `diagonal-carousel.tsx`,
`ThreeDSlider.tsx`.

**Usage:** use `useTransform(motionValueFromIndex(i))`; keep transforms
GPU-only; hide cards behind active with `zIndex` — never repaint on scroll.

## T-IMG-3. Pointer-rate parallax with `translate3d` layers

Track normalized pointer delta to a ref; each layer multiplies by `tier`:
`transform: translate3d(dx*tier, dy*tier, 0)`.

**Proof:** `LoveAppHero.tsx`, `PaipaiKuaishou.tsx`, `DontBeGreedyFooter.tsx`,
`MoodHero.tsx`.

**Usage:** write transforms from the rAF loop; tiers small (background push less);
clamp to `±(tier * MAX_DELTA)`.

## T-IMG-4. Image tilt pressed

`rotateX = lerp(rotateX, -normY * MAX, FACTOR)`; `rotateY` likewise; press →
`scale(0.95)` in the same loop; restore on pointerup.

**Proof:** `LumosHero.tsx` (:216-217, :246, :249).

**Usage:** keep `MAX` small (±5-7º); reduced-motion zeroes — else hero wobbles
for vestibular-sensitive users.

## T-IMG-5. Clip-path split reveal

Left half renders `inset(0 50% 0 0)`, right half `inset(0 0 0 50%)`; both
translate ±X with pointer; center seam preserved.

**Proof:** `SplitFuzzyOrbHero.tsx:30/:50`.

**Usage:** two absolutely-positioned clones of the image; `clipPath` advances
with pointer; GPU-composited.

## T-IMG-6. Trail thumbnails beneath pointer

On threshold-crossing, clone the current image, add to a list, animate spring
scale/opacity, remove on exit (`AnimatePresence`); cap count.

**Proof:** `image-trail.tsx`.

**Usage:** threshold & cap; dedup keys; `pointerEvents:none` on spawned clones.

## T-IMG-7. Canvas signature / wax-seal overlay

Canvas overlay above the photo; on click, draw seal ring + dried-ink texture on
a circular `hitArea` (radius = `Math.min(rect.width, rect.height) * 0.3`);
anoint feedback ripple.

**Proof:** `RippleSignatureLedger.tsx:152-204`.

**Usage:** set `aria-label`, wrap with `pointer-events` appropriately, honor
reduced-motion (static stamp), keep click area ≥ 44px.

## T-IMG-8. Infinite path-follow images

Use CSS `offset-path` (lemniscate) with `offset-distance` animated; the path
loops forever.

**Proof:** `infinity-image.tsx`.

**Usage:** framer `animate` on `offsetDistance`; reduced-motion pins distance.

## T-IMG-9. Hover-expanding collage

On hover, the targeted image scales & flattens its neighbors (spring layout).
Requires `AnimatePresence` + layout animations.

**Proof:** `CardCascade.tsx`, `image-collage.tsx`.

**Usage:** use framer `layoutId` to animate shared-layout moves; keep priority
`z-index` for the hovered card.

## T-IMG-10. Pinned full-screen scroll experience

Pin the next panel, scrub a transforms across it, then pin the following —
GSAP `scrollTrigger` objects; `ignoreMobileResize` avoids mobile jumps.

**Proof:** `SectionScroll.tsx` (.221 hover:scale on image, pinned panels),
spiral/carousel equivalents.

**Usage:** call `ScrollTrigger.refresh()` after `useEffect` loads images and on
resize.

## T-IMG-11. Autoplay rotation with pause

Interval/rAF advances index at `duration` ms; `mouseenter` clears, `mouseleave`
restarts; watch `visibilitychange` to not advance in background tabs.

**Proof:** `DriftwoodGallery.tsx:26-34`, `testimonials-card.tsx:81`,
`ThreeDSlider.tsx:108`.

## T-IMG-12. Lazy/eager image load split

Above-fold: `eager` + `fetchPriority="high"`; below: `loading="lazy"`.

**Proof:** `TemplateDetailPage.tsx:147-152`.

**Usage:** use with `will-change` on the container only when transform is active.