# Interactive Image — Generation Rules

Rules enforced when a future agent generates a new Interactive Image component.
Sources: `SKILL.md`, `patterns.md`, `techniques.md`, `shared/*.md`, `evidence.md`.

## MUST

1. **Interaction driver explicit** — pick scroll (`useScroll`/ScrollTrigger) or
   pointer or autoplay; do not mix unclear gestures (a gallery needs a single,
   documented interaction).
2. **GPU-composited transforms only** — animate `transform`/`opacity`; add
   `will-change-transform`; never animate `left/top/width/height`.
3. **Refs/rAF for per-frame parallax** — lerp pointer in refs (DriftwoodGallery
   factor 0.09); `useMotionValue`/`useTransform` for framer-driven motion; never
   `useState` writes from pointermove (anti-pattern #3).
4. **`prefers-reduced-motion` guard** — zero transforms / stop autoplay / static
   stamp (precedent: PaipaiKuaishou:744-774, LumosHero:205, DriftwoodGallery:18).
5. **Image loading discipline** — `eager`+`fetchPriority="high"` above fold;
   `loading="lazy"` below; preload sequence frames once (Scroll3DAnimation,
   ToonhubHero:18-21).
6. **Hover-pause + unmount cleanup for autoplay** — clear interval/rAF;
   pause on mouseenter; visibilitychange guard.
7. **Accessibility** — `aria-label` on every nav control (prev/next/dots) and on
   canvas overlays; `alt` on real photos, `alt=""` decorative; keyboard-able
   controls.
8. **Cap spawned DOM nodes** — trails/cards bounded; dedup keys.
9. **Data-layer registration** — `category: "image-interaction"` (or documented
   hybrid) in `componentData.tsx` + `embeddedSourceCode.ts` + metadata; see
   `examples/index.md`.
10. **Preview capture list** — slug appended to
    `scripts/announcement/capture-previews.mjs`.

## SHOULD

1. Accept `images`/hero-media props (arrays of `{src, alt}`) mirroring
   ToonhubHero/AuCabaretPoster; accept `titleProps`, `style`, `debounce`.
2. Reuse per-layer parallax multipliers: background ×0.1–0.4, mid ×0.4–0.8,
   foreground/product ×1–6.5 (LoveAppHero/PaipaiKuaishou/DontBeGreedyFooter).
3. For scroll story components, call `ScrollTrigger.refresh()` after images load
   and on resize; use `useGSAP` for lifecycle (Scroll3DAnimation, SectionScroll).
4. Keep transitions in one place: expose `activeIndex` + controls (dots/arrows),
   consistent with diagonal/perspective carousels.
5. Use `AnimatePresence` for enter/exit of trail cards and layout cascades.
6. Match UI-HUB visual language (glass = `backdrop-blur-xl bg-white/5
   border-white/10`, brand-blue accents, dark default).

## MUST NOT

1. **No** parallax via `background-attachment: fixed` or `top/left` animation.
2. **No** `useState` for per-frame pointer parallax.
3. **No** unbounded trails / unlimited autoplay.
4. **No** missing `alt` / unseen `aria-label`s on interactive regions.
5. **No** new dependencies without checking `package.json`; never use
   `simplex-noise`, `@splinetool/*`, `unicornstudio-react`, or R3F/drei
   (CloudScroll-only, unregistered).
6. **No** shipping a scroll-story without `ScrollTrigger.refresh()` on image
   load — pinned sections jump otherwise.
7. **No** hiding interaction on mobile by default (use reduced-motion/perf
   decision explicitly).
8. **No** production code changes beyond the intended registration +
   preview list (Phase-1 rule).
9. **No** claims about WebGPU or unverified renderers.

## CROSS-CHECK

- [ ] `file:line` citations match `evidence.md` anchors.
- [ ] Category strings match union at `componentData.tsx:2632`.
- [ ] Reduced-motion + keyboard paths documented.