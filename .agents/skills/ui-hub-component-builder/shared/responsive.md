# Responsive & Mobile Rules

Rules for how interactive background/image components behave across devices.
Observed from existing source.

## 1. Breakpoints Used in UI-HUB

Tailwind v4 utility breakpoints via CSS (no custom list documented in
`tailwind.config.ts` beyond defaults):
`base` (320px) · `sm` 640 · `md` 768 · `lg` 1024 · `xl` 1280 · `2xl` 1536.

The `useIsMobile` hook uses `max-width: 768px`
(`frontend/src/hooks/use-mobile.ts`). `react-device-detect` is used only inside
CloudScroll.

## 2. Canvas Sizing Rules

- Canvas fills its container: `position: absolute; inset: 0` (SpaceBackground,
  BeamGridBackground) — no fixed pixel widths.
- Resize with `ResizeObserver`, redraw backing store with DPR cap
  (`BeamGridBackground:82-85`, `BlackHole:211-214`).
- On resize, re-derive derived quantities (particle counts, grid cells)
  (MagneticBackground, InteractiveGridBackground).
- Recompute DOM size once per frame where needed (AsciiWater:425 "measured once,
  off the first settled frame"). Avoid measuring in the event handler.

## 3. Touch / Pointer Handling

- Prefer `pointer*` events so one code path covers mouse and touch
  (`AsciiWater:764 pointermove`, `Chandelier:388 pointermove`, `FrostGlassMelt:160`).
- Canvas draw targets: `touch-action: none` (FrostGlassMelt) so the browser does
  not hijack pointer gestures.
- `pointerdown` + window `pointerup/pointercancel` for drag interactions
  (OceanSwell:404, ParticleSphere dedup, PointDNAHelix:1270/1434).
- Coarse-pointer adaptation exists (UserCursor uses `(pointer: coarse)` :72);
  `react-device-detect` precedent in CloudScroll.

## 4. Full-Bleed vs Scoped

- Full-page background demo pages render inside `w-full h-screen overflow-hidden`
  wrappers (`pages/Components/*DemoPage.tsx`).
- Library-card previews render in `min-h-[380px]` areas; interactive backgrounds
  must degrade gracefully in small cards (grid/canvas bounds = container).

## 5. RULES — MUST DO

1. `ResizeObserver` on every canvas component; never read `canvas.parentElement`
   sizes only once at mount.
2. DPR cap `1.25–2`; recompute on resize.
3. Card/`<img>` visuals: use `object-cover` (SectionScroll:221,
   diagonal-carousel:185, perspective-carousel:176).
4. Autoplay components must pause on hover and stop timers on unmount
   (DriftwoodGallery:26-34, ThreeDSlider:108).
5. If the effect needs pointer input, use `pointer*` events and add
   `touch-action` appropriately.

## 6. RULES — MUST NOT DO

- No fixed `px` canvas widths; no `overflow:hidden` masking of overflow bugs.
- Do NOT disable the component on mobile by default (no `hidden md:block` games)
  unless an explicit reduced-motion or perf decision demands it.
- Do not assume widths above 320px.
- Do not hide the interactive experience with `pointerEvents: none` on the
  element users must interact with (only decorative layers get that).

## 7. Specific Mobile Behavior Observed

| Component | Behavior |
|---|---|
| FrostGlassMelt | `touch-action:none`; pointer warmth works via touch |
| OceanSwell | drag-orbit implemented with pointer events; DPR 1.25 for perf |
| ParticleSphere | touch burst on :1105-1116 (explicit touch handler) |
| DriftwoodGallery | ref-driven parallax + hover-pause; dots for nav (buttons remain ≥44px via element size checks) |
| SectionScroll | `ScrollTrigger.config({ ignoreMobileResize: true })` (:13) |
| MagneticCursor preview | uses scoped `containerRef` so the effect stays within its card on small screens |
| infinity-image | container-scaled via CSS; embedded reduced-motion media closes motion |

## 8. Reduced Motion on Mobile

Reduced-motion is device-independent but especially relevant on mobile/battery:
render one static frame (FrostGlassMelt:151-154) or stop the loop
(Tornado:1339-1340) — same rule as desktop.