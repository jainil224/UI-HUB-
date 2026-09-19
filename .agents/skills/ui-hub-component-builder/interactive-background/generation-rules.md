# Interactive Background — Generation Rules

Rules enforced when a future agent generates a new Interactive Background
component. Sources: `SKILL.md`, `patterns.md`, `techniques.md`,
`shared/*.md`, `evidence.md`. Ranked: **MUST / SHOULD / MUST NOT**.

## MUST

1. **Render tier** — choose from: Canvas2D (default), raw WebGL (GLSL strings),
   three.js (only if genuine 3D geometry), DOM/SVG/tsParticles (decor-only). Use
   `frontend/package.json` as the source of truth for libraries.
2. **Refs-as-film-state** — pointer/particle/loop state in `useRef`, loop body
   does all frame writes. Never `useState` for per-frame data.
3. **Pointer normalized, rect cached** — `(clientX - rect.left) / rect.width`,
   rect cached on resize (P2/P3 in `shared/principles.md`).
4. **ResizeObserver + DPR cap** (`min(devicePixelRatio, 1.25–2)`) on every canvas.
5. **One rAF loop + full cleanup** in `useEffect` return (listeners, RAF,
   ResizeObserver, media-query change listeners, GL disposal).
6. **Reduced motion guard** — `matchMedia('(prefers-reduced-motion: reduce)')`:
   at minimum stop loop / render static frame / zero parallax.
7. **`pointerEvents:none`** on the decorative canvas/layer so page content stays
   interactive.
8. **Meaningful `aria-label`** on canvas scenes (see `shared/accessibility.md`).
9. **Container-sized** (`absolute inset-0`); works at 320px and in library
   preview cards.
10. **Data-layer registration** so the component appears in
    `componentData.tsx` under `category: "background" | "interactive-background"`
    + `embeddedSourceCode.ts` + any metadata; trust `examples/index.md`.
11. **Preview capture list** — append slug to `scripts/announcement/capture-previews.mjs`.

## SHOULD

1. Match UI-HUB visual language: dark default, `brand-blue #3D5CFF`, glass =
   `backdrop-blur-xl bg-white/5 border-white/10`, text tokens from
   `index.css`.
2. Prefer interactive variants of existing archetypes (pointer-driven over pure
   ambient) because the category is "interactive background".
3. Use additive layering (`lighter`/`destination-out`) for glow/trails.
4. Cache static art in an offscreen canvas when drawing it every frame
   (BeamGridBackground:91-97); park loop when idle (spider-web:329).
5. Gate heavy loops with `useInView` (WaveBackground:68).
6. Keep derived quantities (particle count, grid, radius) derived from container
   size on `ResizeObserver`.
7. Use scoped `containerRef` listeners, not `window`, where possible
   (MagneticBackground scoping precedent).
8. Provide typed props with descriptions (observe existing component props like
   KineticGrid GAP/PULL/R, BeamGridBackground gridColor/darkGridColor, SpaceBackground
   interactive).
9. For DOM FX, animate only `transform`/`opacity`; `will-change-transform`.

## MUST NOT

1. **No** new dependencies without a written justification checked against
   `frontend/package.json` — never use installed-but-unused libs
   (`simplex-noise`, `@splinetool/*`, `unicornstudio-react`).
2. **No** R3F/drei for these two categories (CloudScroll-only; unregistered).
3. **No** WebGPU claims anywhere (0 occurrences in repo).
4. **No** per-frame allocations (gradients/sprites) or layout reads
   (`getBoundingClientRect`) inside `pointermove`.
5. **No** full-canvas clears every frame on large canvases.
6. **No** `setInterval` as the only animation driver (prefer one rAF).
7. **No** fixed pixel canvas sizing.
8. **No** shipping without a reduced-motion path or without `pointerEvents:none`
   on the decorative layer.
9. **No** unbounded counted loops for spawned DOM nodes (`image-trail` caps).
10. **No** hiding the interaction on mobile by default (`hidden md:block`),
    unless reduced-motion/performance explicitly requires it.
11. **No** modifying production pages/routes/data beyond the intended
    registration + preview list (Phase-1 rule: never touch runtime code).

## CROSS-CHECK

- [ ] Every `file:line` cited in this doc corresponds to an actual source line
      (see `evidence.md`).
- [ ] Approved entry names match `taxonomy.md` and `componentData.tsx` union.