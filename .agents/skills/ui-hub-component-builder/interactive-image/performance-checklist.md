# Interactive Image — Performance Checklist

## 1. Before writing a new component

- [ ] Driver chosen: scroll (useScroll/ScrollTrigger) vs pointer vs autoplay.
- [ ] Image budget known: how many `<img>` nodes at once? (Trail/card counts;
      carousel keeps only the visible slice.)
- [ ] Decide preload list vs lazy list.

## 2. Mandatory while implementing

### Assets
- [ ] Sequence/images preloaded once via `useRef` Image() list (Scroll3DAnimation,
      ToonhubHero:18-21).
- [ ] `eager` + `fetchPriority="high"` for above-fold previews
      (TemplateDetailPage:147-152); `loading="lazy"` below fold.
- [ ] No giant source images on `<img>` in parallax layers without
      `object-cover` + fixed aspect (otherwise layout pods collapse).

### Motion
- [ ] `transform`/`opacity` only; `will-change-transform` on moving layers.
- [ ] Pointer parallax written from rAF loop/refs (lerp 0.09 DriftwoodGallery:48-49)
      — never `useState` per pointermove (documented anti-pattern).
- [ ] GSAP: `ScrollTrigger.refresh()` after images load + on resize;
      `ignoreMobileResize: true` (SectionScroll:13); kill triggers on unmount
      (Scroll3DAnimation:188).
- [ ] Autoplay: interval/rAF cleared on unmount; hover-pause
      (DriftwoodGallery:26-34, ThreeDSlider:108); skip advance while tab hidden
      (visibilitychange).

### DOM
- [ ] Cap spawned `<img>` in trails (`image-trail` counts + dedup keys).
- [ ] Carousel rows: translate only the active slice; `zIndex` for stacking —
      no per-card `display:none` churn.
- [ ] Canvas overlays (RippleSignatureLedger) stay `canvas` small (seal-sized),
      not full image size.

### Cleanup
- [ ] Listeners, intervals, GSAP contexts, ResizeObservers removed on unmount.
- [ ] framer `useInView` gating for heavy galleries if any.

## 3. Before shipping

- [ ] Runs at 320/768/1440; carousels re-center on resize; no overflow.
- [ ] `npm run lint`/tsc + `npm run build` clean.
- [ ] Reduced motion → static images (PaipaiKuaishou:744-774, LumosHero:205,
      MoodHero:761, DriftwoodGallery:18, RippleSignatureLedger:37,
      InfinityImage reduced-motion media).
- [ ] Keyboard drives carousel nav; controls `aria-label`; photos `alt`.
- [ ] Preview capture at 1600×900; slug in `capture-previews.mjs`.

## 4. Budget guardrails (fail → reduce scope)

| Concern | Redline |
|---|---|
| Concurrent `<img>` nodes | > (viewport cards + trail caps) → lazy + cap trail |
| Parallax `useState` writes per event | any → switch to refs/useTransform |
| ScrollTrigger without refresh on load | jumpy pins → call refresh after images |
| Autoplay interval without hover-pause | relentless → add pause on hover + visibility |
| Full-res images for trail clones | >1MB per clone at 20 clones → downscale clones |