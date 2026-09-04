# FIX SPEC — Template Gallery Live Preview Performance

## Context (read first)
This is the **Templates section** of UI Hub (Next.js + React + Tailwind CSS). Each card in the grid shows a **live embedded preview** of a real deployed template (e.g. `uihub.dev/tars-protocol`, `uihub.dev/split-fuzzy-orb`, `uihub.dev/segmint-2026`) inside a fake browser-chrome frame (traffic-light dots + URL bar + "NEW"/"FREE" badges), followed by a title and description below the frame.

**Hard constraint — do not violate this while fixing performance:**
> The preview inside each card must remain a real, live, interactive rendering of the actual template (not a static screenshot, not a video loop, not a permanently frozen frame). When a card is on-screen, the user must see the actual live site rendering exactly as it does today. Any optimization that replaces the live preview with a fake substitute *while it is visible to the user* is not acceptable.

The problem: the section is severely laggy — scrolling stutters, tab switching (ALL / SAAS & AI / AGENCY & PORTFOLIO / E-COMMERCE / WEB3 & FINTECH) freezes the page, and the browser fan spins up. This is almost certainly caused by rendering many simultaneous live iframes, several of which contain heavy WebGL/Three.js/Canvas animations (the 3D metallic sculpture, the fuzzy torus orb, the pixel-dust footer), all running full animation loops at once regardless of whether they're visible.

---

## Part 1 — Root Cause Diagnosis

Have the AI verify each of these against the actual codebase before fixing, in this order of likelihood:

1. **All cards render their `<iframe>` (or embedded component) immediately on mount**, with no lazy-loading. If the grid has 12–30+ templates, that means 12–30+ full webpages — several running WebGL — are all loaded and animating simultaneously, even the ones far below the fold.
2. **No visibility-based pausing.** Even for iframes that *are* lazy-loaded, once mounted they likely keep running `requestAnimationFrame` loops forever, including when scrolled completely out of view. Browsers do not pause iframe rendering automatically just because it's off-screen.
3. **Too many concurrent WebGL contexts.** Browsers cap the number of live WebGL contexts (commonly ~8–16 depending on browser/GPU). Exceeding this causes silent context loss, forced re-initialization, and stutter — this alone can produce exactly the kind of lag described.
4. **No unmounting/cleanup on scroll-away or tab switch.** Switching category tabs (ALL → WEB3 & FINTECH, etc.) likely triggers a full re-render of the grid, remounting a new batch of iframes, while the old ones may not be properly destroyed — orphaned WebGL contexts and rAF loops keep consuming GPU/CPU in the background.
5. **Uncapped devicePixelRatio inside the embedded templates.** If the Three.js/Canvas renderers inside TARS Protocol, Split-Canvas, Segmint, etc. render at full device pixel ratio (e.g. 2–3x on Retina/high-DPI screens) even though the preview is displayed at a tiny thumbnail size (~380×280px), that's 4–9x more pixels being rendered than are ever visible — pure waste.
6. **No `content-visibility` / containment on off-screen card DOM.** The browser is likely doing full layout/paint/style work for every card in the grid on every scroll frame, not just the visible ones.
7. **Hover or state-driven re-renders cascading across the whole grid.** If hover state, "NEW" badge animation, or category filtering is managed by a single parent state variable that re-renders all sibling cards (instead of each card being isolated/memoized), one interaction can trigger a full-grid re-render.
8. **Scroll listeners not throttled/passive**, compounding jank from the above.

---

## Part 2 — Fix Strategy (in priority order)

### Fix 1: Viewport-based mount/unmount (IntersectionObserver pooling)
- Wrap each card's live preview in an `IntersectionObserver` (with `rootMargin: "200px 0px"` so it preloads just before entering the viewport, avoiding pop-in).
- **Mount** the real `<iframe>` only when the card enters this observed range.
- **Unmount** the `<iframe>` entirely (remove from DOM, don't just `display:none`) when the card scrolls far enough outside the viewport (e.g. `rootMargin: "-600px 0px"` on a second, wider observer, or a distance threshold) — this fully destroys its WebGL context, canvas, and animation loop, freeing GPU/CPU.
- On unmount, immediately swap in a lightweight placeholder occupying identical dimensions (same aspect ratio box, e.g. a blurred low-res poster derived from the template's own first frame, or simply the last successfully rendered frame captured via `canvas.toDataURL()`/`html2canvas` at unmount time) so there is no layout shift and no visible flash — the swap only ever happens while the card is off-screen and invisible to the user, so it never violates the "must be live when seen" constraint.
- Re-mounting on re-entry should feel instant: keep the previous poster visible until the iframe's `onLoad` fires, then crossfade (150–200ms) from poster to live iframe.

### Fix 2: Hard cap on concurrent live previews
- Maintain a global pool limit (start with **6 concurrent live iframes**, tune after testing — should stay comfortably under the browser's WebGL context ceiling).
- If more than 6 cards are simultaneously "in range" per Fix 1, prioritize by proximity to viewport center; the rest wait in the poster state until a slot frees up (LRU: oldest-entered card gets evicted first when a new one needs a slot).
- This guarantees WebGL context count never spikes uncontrollably regardless of grid size or fast scrolling.

### Fix 3: Pause instead of destroy for near-viewport cards (optional refinement)
- For cards just outside the viewport but within a "warm" buffer zone, instead of fully unmounting, send a `postMessage({ type: "PAUSE_ANIMATION" })` into the iframe and have the embedded template listen for it and stop its `requestAnimationFrame` loop (`cancelAnimationFrame`) while keeping the DOM/WebGL context alive. Resume on re-entry with `postMessage({ type: "RESUME_ANIMATION" })`.
- This requires a small change inside each template's own code (each deployed template needs to opt into a shared `usePreviewPauseListener()` hook or equivalent). If modifying every template's source is out of scope right now, skip this and rely on Fix 1's full mount/unmount instead — it achieves the same performance goal at the cost of a slightly heavier remount when scrolling back.

### Fix 4: Cap render resolution inside embedded templates for thumbnail context
- Add a query parameter the gallery appends when embedding, e.g. `?embed=1&perf=low`.
- Inside each template's renderer setup (Three.js `WebGLRenderer`, canvas 2D, etc.), detect this param and:
  - Clamp `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1))` instead of the device's native ratio.
  - Reduce particle counts / geometry subdivision / post-processing passes by ~50% when `perf=low` is present.
  - Disable non-essential background scripts (analytics, chat widgets, font-loading of unused weights) when `embed=1`.
- Visually this is imperceptible at thumbnail card size but meaningfully cuts GPU load per preview.

### Fix 5: CSS containment on the grid
- Add `content-visibility: auto; contain-intrinsic-size: 380px 480px;` (match actual card dimensions) to each card wrapper. This tells the browser to skip layout/paint work for cards far outside the viewport, independent of the JS-level mount/unmount work above — a cheap, complementary win.
- Add `contain: layout paint;` to the grid container.

### Fix 6: Isolate re-renders per card
- Wrap each card component in `React.memo`.
- Ensure hover/active state is local to the card (`useState` inside the card component), never lifted to a parent that re-renders the whole grid.
- Category filtering should **not** remount all cards from scratch: keep the full card list mounted in a stable order and toggle visibility/filtering via CSS (`display:none` won't stop iframe execution, so combine with Fix 1's observer — an iframe hidden by a filter should also be treated as "out of range" and unmounted/pooled, not just visually hidden) or, cleaner, filter the array driving the map but give each card a **stable `key`** (e.g. the template slug, not array index) so React reconciles instead of destroying/recreating DOM nodes for templates that remain visible across a filter change.

### Fix 7: Lazy + async iframe loading hygiene
- Add `loading="lazy"` on all `<iframe>` elements as a browser-native backstop (belt-and-suspenders with Fix 1).
- Add `sandbox="allow-scripts allow-same-origin"` (only the permissions actually needed) to limit what each embedded page can do and reduce main-thread overhead from unnecessary iframe capabilities.
- Use `next/dynamic(() => import(...), { ssr: false })` for the card/preview component so it isn't part of the initial server-rendered payload and doesn't block first paint of the rest of the page.

### Fix 8: Scroll/observer hygiene
- Ensure any scroll listeners involved are `{ passive: true }` and, if any manual scroll math is needed (vs. relying purely on IntersectionObserver, which is preferred), throttle via `requestAnimationFrame`, not `setTimeout`.

---

## Part 3 — Acceptance Criteria (how to verify the fix worked)

1. Open the Templates section with browser DevTools Performance tab recording. Scroll through the full grid at a normal pace.
   - **Target:** stays at 50–60fps during scroll; no long tasks over 50ms attributable to the preview cards.
2. Open DevTools → check `chrome://gpu` or the Rendering tab's WebGL context count while scrolling through 20+ cards.
   - **Target:** concurrent live WebGL contexts never exceed the pool cap set in Fix 2 (e.g. 6), regardless of total template count on the page.
3. Switch between category tabs (ALL → WEB3 & FINTECH → back to ALL) rapidly several times.
   - **Target:** no visible freeze/jank; previews that were already loaded and still match the filter should not flicker or reload from scratch (stable `key` working correctly).
4. Scroll a card fully out of view, wait 2 seconds, scroll back to it.
   - **Target:** poster placeholder shows instantly with no layout shift, live iframe crossfades in within ~200–400ms with no visible pop or flash of blank content.
5. While any card is in the viewport and its preview is live, it must be pixel-for-pixel the same live, interactive template as before this fix — confirm no card ever shows a static image while scrolled into view.
6. Check GPU/CPU usage in the OS-level activity monitor before and after the fix under identical scroll test — should show a clear reduction, especially with 10+ templates on the page.

---

## Part 4 — Implementation Notes for Antigravity

- Tech stack: Next.js, React, Tailwind CSS.
- Create a reusable `<LiveTemplatePreview>` component that encapsulates Fixes 1, 2, 5, 6, 7 internally (IntersectionObserver + pool management + containment + memoization + lazy iframe), so every card in the grid just does:
  ```
  <LiveTemplatePreview slug="tars-protocol" url="https://uihub.dev/tars-protocol" aspectRatio="380/280" />
  ```
- Centralize the pool-limit logic (Fix 2) in a single context/hook (e.g. `usePreviewPool()`) shared across all `<LiveTemplatePreview>` instances so the cap is enforced globally, not per-card.
- Fix 4 (the `?embed=1&perf=low` query param handling) requires touching the source of each individual template — treat this as a separate, lower-priority follow-up task rather than blocking the gallery-side fix; Fixes 1, 2, 5, 6, 7 alone (all gallery-side, no template changes needed) should resolve the majority of the lag on their own.
- Test with the actual current template count in production, not just 3–4 sample cards — the lag reported is likely proportional to total template count, so the fix must be verified at real scale.