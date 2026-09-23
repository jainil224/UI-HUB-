## 1. Header

- **Name:** Rain Storm
- **Proposed slug:** `rain-storm`
- **Category:** `interactive-background`
- **One-line pitch:** A calm-to-moderate night storm — diagonal rain streaks, faint landing ripples and a soft, infrequent lightning flash behind hero content.
- **Date:** 2026-09-22

## 2. Visual Intent

A full-bleed night sky backdrop sits behind the hero: a deep navy-to-ink vertical
gradient, faint enough that heading text stays readable. Thin pale-blue rain
streaks fall diagonally from the top edge, leaning slightly with the wind; here and
there a drop lands and blooms into a faint, quickly fading ripple at the bottom
edge. Every few seconds a soft pale flash lightens the whole scene for a moment,
then decays. Motion behaviour: drops stream continuously and drift with a subtle
wind; the pointer nudges the field with a very gentle parallax; nothing moves when
`prefers-reduced-motion` is on (one static frame).

## 2.5 Inspiration Sources

- **Mood / palette / motion:** calm-to-moderate storm · moody · cinematic.
  Deep navy-to-ink sky with pale-blue diagonal streaks; motion is continuous
  wind-blown fall with a slight sway and an occasional soft lightning bloom.
- **Image provided?** no — the request was text-only ("rain/storm background
  effect for the hero"), so a real inspiration search was run instead.
- **Reference links found:**
  - [shadcn.io — React Rain Background](https://www.shadcn.io/background/rain)
    — borrowed the *look and feel*: depth-layered droplets — distant drops slower
    and dimmer, near drops fast and bright — angled streaks with varying length and
    speed, and optional lightning flashes that briefly illuminate the scene. This
    is the closest match to the spec's chosen calm-to-moderate mood and its layered
    default palette (`#A8C2E8` / `#6F8FB8` / `#445577`). No code was copied.
  - [21st.dev — Rain and Lightning Hero Section](https://21st.dev/@ravikatiyar162/components/rain-and-lightening-hero-section)
    — borrowed the *composition*: a dark, animated rain-and-lightning backdrop kept
    readable behind a centered hero headline, i.e. restraint — the effect stays
    behind content rather than competing with it. Concept only; nothing implemented
    was taken.
  - [CrazyGL — Digital Rain Curtain](https://crazygl.com/hero/digital-rain)
    — borrowed the *depth idea* (stacked layers with parallax and a soft leading
    edge), but NOT the glyph aesthetic; drops here are plain streaks.

## 3. Tech Stack Analysis

House style for `interactive-background` (from `references/02`): the corpus
renders to **canvas2D + a single rAF loop** — the same shape as `Sky` and
`BlackHole` — with an inline-styled wrapper plus a `React.CSSProperties` escape
hatch, an optional seeded rng for deterministic layout, a DPR cap ≤ 2,
ResizeObserver sizing and full cleanup on unmount (cancel rAF, disconnect
observers, remove listeners). No animation library is used on this category. This
component stays inside that stack: dependencies are `react` only — no new
framework or npm package.

## 4. Reference Components Used

- `frontend/src/components/ui/Sky.tsx` — borrow the canvas2D + single-rAF shape,
  the container/canvas wrapper, the `prefers-reduced-motion` query/change pattern
  (single static frame, resumed when the query flips back) and the seeded
  `makeRng`-style layout generator.
- `frontend/src/components/ui/BlackHole.tsx` — borrow the ResizeObserver-driven
  resize with a recompute-on-resize (not per-frame) and the DPR cap (1.5 above
  1920px, else ≤ 2).
- `frontend/src/components/ui/Lightfall.tsx` — borrow only the *concept* of
  falling, palette-tinted streaks; NOT its implementation (WebGL, `any` ref,
  dynamic canvas, no GL cleanup, no reduced-motion — corpus anti-patterns in
  `references/04` §10). Rain is cheaper as plain 2D.

Deliberately **not** reusing `Lightfall`'s shader; this is a distinct, quieter
effect tuned for hero readability.

## 5. Research Findings

- **Technique:** Per-droplet streak rendering. Each drop is two line segments — a
  long faint tail and a short brighter tip — translated with per-drop speed and a
  wind-influenced diagonal lean; drops wrap to the top with a scatter offset.
  Landing ripples are ellipse strokes that expand and fade. Lightning is a
  full-screen pale fill whose alpha decays exponentially with time; the next flash
  is scheduled a random 8–14s ahead, so flashes are soft and infrequent.
- **Parameters:** ~640 drop slots × `density/100` (40–900, ×0.55 on ≤820px); fall
  ≈ 480 × `speed/100` px/s with ±70% variance; streak length 10–30px scaled by
  `intensity`; wind lean from `wind/100`; flash peak alpha ≈ 0.05–0.15 by
  `intensity`, decay ≈ `exp(-5.2·dt)`; ripple pool capped at 140.
- **Source:** `No search needed: Sky.tsx already implements canvas2D + rAF +
  reduced-motion; streak, ripple and flash rendering are plain 2D primitives.`
- **Licence:** none — no third-party code reproduced; standard `canvas 2d` API.

## 6. Technical Approach

**canvas2D + rAF.** At the default the scene is a few hundred line segments and a
few dozen ripple strokes per frame — trivially cheap on CPU, so WebGL (as in
`Lightfall`) would add a shader-compile step, context-loss handling and a much
larger file for no visual gain at this density. Rejected `framer-motion DOM`
(per-droplet DOM nodes are wasteful) and `pure CSS` (no way to express continuous
wind-leaned streaks + stochastic lightning). No fallback needed beyond a single
static frame if the 2d context is unavailable.

## 7. Props Contract

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `density` | `number` | `45` | Drop count scale (0–100). |
| `speed` | `number` | `35` | Fall speed multiplier (0–100). |
| `wind` | `number` | `18` | Horizontal drift (−100…100). |
| `intensity` | `number` | `30` | Streak length/width + flash strength (0–100). |
| `lightning` | `boolean` | `true` | Soft, infrequent lightning flashes. |
| `splash` | `boolean` | `true` | Faint ripples where drops land. |
| `parallax` | `boolean` | `true` | Gentle pointer parallax. |
| `colors` | `string[]` | `["#A8C2E8", "#6F8FB8", "#445577"]` | Streak tint ramp. |
| `seed` | `number` | `1` | Deterministic drop layout. |
| `style` | `React.CSSProperties` | `undefined` | Wrapper style escape hatch. |

Rules: defaults are tuned so the hero stays readable behind text (calm-to-moderate
storm). No prop of type `any`; every prop has a real default. No literal pipes in
the type cells, so the 4-column table is stable.

## 8. Full Implementation

The **8a** block is what must stay portable (`validate-spec.mjs` checks it); the
**8b** block is what ADD actually registers.

### 8a. Drop-in standalone version

The complete component in one fenced `tsx` block, written to compile in a **fresh
project** that has never seen this repo:

- **Imports** resolve to bare `react` only — no `@/`, `../` or `./` paths.
- **No design tokens by reference:** every colour/value is a literal.
- **All types are declared in the block**; React + DOM globals are fine.

```tsx
"use client";

import * as React from "react";

interface RainDrop {
  x: number;
  y: number;
  length: number;
  speed: number;
  width: number;
  alpha: number;
  color: string;
  lean: number;
}

interface Splash {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

export interface StormProps {
  density?: number;
  speed?: number;
  wind?: number;
  intensity?: number;
  lightning?: boolean;
  splash?: boolean;
  parallax?: boolean;
  colors?: string[];
  seed?: number;
  style?: React.CSSProperties;
}

export const RAIN_DEFAULTS: Required<Omit<StormProps, "style">> = {
  density: 45,
  speed: 35,
  wind: 18,
  intensity: 30,
  lightning: true,
  splash: true,
  parallax: true,
  colors: ["#A8C2E8", "#6F8FB8", "#445577"],
  seed: 1,
};

const makeRng = (seed: number) => {
  let s = (seed | 0) >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function RainStorm(props: StormProps) {
  const {
    density = RAIN_DEFAULTS.density,
    speed = RAIN_DEFAULTS.speed,
    wind = RAIN_DEFAULTS.wind,
    intensity = RAIN_DEFAULTS.intensity,
    lightning = RAIN_DEFAULTS.lightning,
    splash = RAIN_DEFAULTS.splash,
    parallax = RAIN_DEFAULTS.parallax,
    colors = RAIN_DEFAULTS.colors,
    seed = RAIN_DEFAULTS.seed,
    style,
  } = props;

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rng = makeRng(seed);
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceQuery.matches;

    const fallSpeed = 480 * (speed / 100);
    const drift = (wind / 100) * 0.34;
    const streakScale = 0.6 + (intensity / 100) * 1.1;
    const flashPeak = 0.05 + (intensity / 100) * 0.1;
    const poolCap = 140;

    const makeDrops = () => {
      const count = clamp(
        Math.round((density / 100) * 640 * (width <= 820 ? 0.55 : 1)),
        40,
        900
      );
      const out: RainDrop[] = [];
      for (let i = 0; i < count; i++) {
        out.push({
          x: rng() * (width + 400) - 200,
          y: rng() * height - height,
          length: (10 + rng() * 20) * streakScale,
          speed: fallSpeed * (0.8 + rng() * 0.7),
          width: 0.8 + rng() * 0.9,
          alpha: 0.25 + rng() * 0.55,
          color: colors[i % Math.max(1, colors.length)],
          lean: 0,
        });
      }
      return out;
    };

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();
    let dt = 1 / 60;
    let flash = 0;
    let nextFlash = 8 + rng() * 6;
    let visible = true;
    let drops = makeDrops();
    const splashes: Splash[] = [];

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const spawnSplash = (x: number) => {
      if (!splash || splashes.length >= poolCap) return;
      splashes.push({ x, y: height - 2, r: 1.5 + rng() * 2.5, alpha: 0.5 });
    };

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#05070F");
      sky.addColorStop(1, "#0A1224");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const px = parallax && !reduced ? pointer.x * 14 : 0;
      const py = parallax && !reduced ? pointer.y * 10 : 0;

      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        const x0 = d.x + px * 0.4;
        const x1 = x0 + d.lean;
        const y0 = d.y - d.length + py * 0.4;
        const y1 = d.y + py * 0.4;

        ctx.globalAlpha = d.alpha * 0.4;
        ctx.lineWidth = d.width;
        ctx.strokeStyle = d.color;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.moveTo(x1 - d.lean * 0.08, y1 - d.length * 0.15);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < splashes.length; i++) {
        const s = splashes[i];
        ctx.globalAlpha = s.alpha * 0.5;
        ctx.strokeStyle = "#A8C2E8";
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (flash > 0) {
        ctx.fillStyle = `rgba(203,220,255,${flash.toFixed(3)})`;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = `rgba(203,220,255,${(flash * 0.45).toFixed(3)})`;
        ctx.fillRect(0, 0, width, height * 0.4);
        flash *= Math.exp(-5.2 * dt);
      }
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width === 0 || height === 0) return;
      const raw = window.devicePixelRatio || 1;
      dpr = Math.min(raw, width > 1920 ? 1.5 : 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drops = makeDrops();
      if (reduced) draw(0);
    };

    const loop = (now: number) => {
      if (!visible || reduced) return;
      const nowSec = now / 1000;
      dt = Math.min(nowSec - lastTime, 0.05);
      lastTime = nowSec;
      if (parallax) {
        const k = 1 - Math.exp(-4 * dt);
        pointer.x += (pointer.tx - pointer.x) * k;
        pointer.y += (pointer.ty - pointer.y) * k;
      }
      if (lightning) {
        nextFlash -= dt;
        if (nextFlash <= 0) {
          flash = flashPeak;
          nextFlash = 8 + rng() * 6;
        }
      }
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        d.x += drift * d.speed * dt;
        d.lean = drift * d.length * 4;
        if (d.y - d.length > height) {
          spawnSplash(d.x);
          d.y = -d.length - rng() * 40;
          d.x = rng() * (width + 400) - 200;
        }
      }
      if (splash) {
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          s.r += 22 * dt;
          s.alpha -= 1.1 * dt;
          if (s.alpha <= 0) {
            splashes[i] = splashes[splashes.length - 1];
            splashes.pop();
          }
        }
      }
      draw(nowSec);
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!parallax || reduced) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.tx = clamp(
        (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2),
        -1,
        1
      );
      pointer.ty = clamp(
        (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2),
        -1,
        1
      );
    };

    const onReduceMotion = (e: MediaQueryListEvent) => {
      cancelAnimationFrame(rafId);
      reduced = e.matches;
      if (reduced) {
        pointer.x = pointer.tx = 0;
        pointer.y = pointer.ty = 0;
        draw(0);
        return;
      }
      lastTime = performance.now() / 1000;
      rafId = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible && !reduced) {
          lastTime = performance.now() / 1000;
          cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(loop);
        } else {
          cancelAnimationFrame(rafId);
        }
      }
    });
    io.observe(container);

    if (parallax) window.addEventListener("pointermove", onPointerMove, { passive: true });
    reduceQuery.addEventListener("change", onReduceMotion);
    resize();

    if (!reduced) {
      lastTime = performance.now() / 1000;
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceMotion);
    };
  }, [density, speed, wind, intensity, lightning, splash, parallax, colors, seed]);

  return (
    <div
      ref={containerRef}
      style={style}
      className="relative h-full w-full overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
      />
    </div>
  );
}
```

### 8b. Project-integrated version

Identical to 8a. When dialled to the corpus conventions, the only difference would
be swapping the literal gradient hexes for the `--color-*` tokens
(`data/design-tokens.json`); the default spec keeps 8a and 8b identical because the
night-sky ramp (`#05070F`–`#0A1224`) is already a literal in `Sky`-style
components and nothing alias- or token-specific is required.

## 9. Performance Plan

- **DPR cap ≤ 2** (`1.5` above 1920px CSS width) — never raw `devicePixelRatio`.
- **ResizeObserver** on the container, disconnected on unmount; no `window.resize`.
- **Single** rAF loop, id held in a local, `cancelAnimationFrame` on unmount.
- **IntersectionObserver** pauses the loop when off-screen; the observer, the
  `pointermove` listener and the media-query listener are all removed/disconnected
  on unmount.
- **Mobile density clamp:** drop count × `0.55` when the container is ≤ 820px wide,
  floored at 40 and capped at 900; ripples pool capped at 140 and swap-popped.
- **No per-frame allocations:** drops and splashes are pre-allocated arrays; each
  drop is two `stroke` calls; the sky gradient is rebuilt per frame (cheap) and the
  flash is a single full-rect fill with exponential decay.
- `prefers-reduced-motion: reduce` draws a single static frame and never starts the
  rAF loop; it resumes correctly if the query flips back.
- No WebGL GPU resources to release; the 2d context is GC'd with the canvas.

## 10. Accessibility

- Canvas is decorative: `aria-hidden="true"` plus `pointer-events-none`; it is
  never focusable and never intercepts clicks or pointer input.
- The wrapper is `h-full w-full` behind content; overlaid hero text should use the
  `text-primary` token against the dark `#05070F`–`#0A1224` base
  (`data/design-tokens.json`).
- The lightning flash is deliberately soft (peak alpha ≤ 0.15) and infrequent to
  limit flicker for photosensitive users; it is fully disabled when
  `prefers-reduced-motion` is on (the scene renders one static frame).
- Reduced-motion behaviour restated in one line: static frame, no animation.

## 11. Naming Contract

- **File:** `frontend/src/components/ui/RainStorm.tsx`
- **Export:** `export default function RainStorm(props: StormProps)`
- **Slug:** `rain-storm`

All three derive from the same name; no aliases.

## 12. Integration Preview

Adding Rain Storm to the live site takes seven edits, all additive: create the
`RainStorm.tsx` component file; add a `React.lazy` const, a `UI_COMPONENTS` key
and a `componentList` entry in `componentData.tsx`; add a `COMPONENT_CONFIG` entry
in `componentMetadata.ts`; add the full source to `embeddedSourceCode.ts`; and add
an entry to `data/component-index.json`. Nothing existing is removed or rewritten.
The machine-checkable plan below is what ADD mode applies (Stages A–F); it is
written here, never executed in ANALYZE mode. Machine-checked by
`scripts/validate-spec.mjs`: every edit has `file`, `anchor`, `operation`,
`payload` and `why`; `create-file` targets must not exist; every other anchor must
match exactly once in its file. No line numbers anywhere.

```json
[
  {
    "file": "frontend/src/components/ui/RainStorm.tsx",
    "anchor": "",
    "operation": "create-file",
    "payload": "§8",
    "why": "New component; the source is the section 8 block."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "const DriftwoodGallery = React.lazy(() => import('../components/ui/DriftwoodGallery').then(m => ({ default: m.DriftwoodGallery })));",
    "operation": "insert-after",
    "payload": "\nconst RainStorm = React.lazy(() => import('../components/ui/RainStorm'));",
    "why": "Anti-drift: file RainStorm.tsx = default export RainStorm = lazy const RainStorm = slug rain-storm."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "'drag-drop-upload': DragDropUpload,",
    "operation": "insert-after",
    "payload": "\n    'rain-storm': RainStorm,",
    "why": "UI_COMPONENTS key must equal the slug so renderComponent(\"rain-storm\") resolves the lazy component."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "        preview: () => <DriftwoodGalleryPreview />,\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "operation": "insert-after",
    "payload": "\n\n    // ── Rain Storm ───────────────────────────────────────\n    {\n        id: \"rain-storm\",\n        title: \"Rain Storm\",\n        category: \"interactive-background\",\n        addedAt: \"2026-09-22\",\n        newBadgeDays: 120,\n        description: \"Calm-to-moderate night storm: diagonal rain streaks, faint landing ripples and a soft, infrequent lightning flash with gentle pointer parallax.\",\n        preview: () => (\n            <div className=\"w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#05070F]\">\n                <RainStorm />\n            </div>\n        ),\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "why": "Append the ComponentItem at the end of the insertion-ordered array (the array is not grouped by category)."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "    \"sky\": {",
    "operation": "insert-before",
    "payload": "    \"rain-storm\": {\n        props: [\n            { name: \"density\", type: \"number\", default: \"45\", description: \"Drop count scale (0-100).\" },\n            { name: \"speed\", type: \"number\", default: \"35\", description: \"Fall speed multiplier (0-100).\" },\n            { name: \"wind\", type: \"number\", default: \"18\", description: \"Horizontal drift, -100..100.\" },\n            { name: \"intensity\", type: \"number\", default: \"30\", description: \"Streak length/width + flash strength (0-100).\" },\n            { name: \"lightning\", type: \"boolean\", default: \"true\", description: \"Soft, infrequent lightning flashes.\" },\n            { name: \"splash\", type: \"boolean\", default: \"true\", description: \"Faint ripples where drops land.\" },\n            { name: \"parallax\", type: \"boolean\", default: \"true\", description: \"Gentle pointer parallax.\" },\n            { name: \"colors\", type: \"string[]\", default: '[\"#A8C2E8\", \"#6F8FB8\", \"#445577\"]', description: \"Streak tint ramp.\" },\n            { name: \"seed\", type: \"number\", default: \"1\", description: \"Deterministic drop layout.\" },\n            { name: \"style\", type: \"React.CSSProperties\", default: \"undefined\", description: \"Wrapper style escape hatch.\" }\n        ],\n        vibeMeta: {\n            behavior: \"A Canvas 2D storm: each rain droplet is drawn as a faint tail line and a brighter tip line leaning with the wind; landing drops spawn expanding, fading ellipses; a full-scene pale fill flashes occasionally and decays exponentially while a parity-eased pointer nudges the field.\",\n            states: { from: \"diagonal rain streaks drift over a dark navy gradient\", to: \"a soft lightning flash illuminates the scene and fades\" },\n            cssProperties: [\"canvas 2d\", \"animation\", \"requestAnimationFrame\", \"pointermove\", \"intersection observer\", \"resize observer\", \"prefers-reduced-motion\"],\n            stylingMethod: \"inline-styles\",\n            animationTech: \"canvas + requestAnimationFrame\",\n            behaviorNotes: \"Decorative layer only; aria-hidden canvas with pointer-events none; static frame under prefers-reduced-motion; mobile drop-count clamp; rAF suspended off-screen.\"\n        }\n    },",
    "why": "COMPONENT_CONFIG entry matching the section 7 props contract; feeds props + vibeMeta lookups by slug."
  },
  {
    "file": "frontend/src/data/embeddedSourceCode.ts",
    "anchor": "  \"sky\": \"",
    "operation": "insert-before",
    "payload": "§8",
    "why": "Canonical full source keyed by slug; drives the CODE tab and all five AI prompts."
  },
  {
    "file": ".agents/skills/uihub-component-forge/data/component-index.json",
    "anchor": "  {\n    \"category\": \"image-interaction\",\n    \"name\": \"SpiralImages\",",
    "operation": "insert-before",
    "payload": "  {\n    \"category\": \"interactive-background\",\n    \"name\": \"RainStorm\",\n    \"slug\": \"rain-storm\",\n    \"filePath\": \"frontend/src/components/ui/RainStorm.tsx\",\n    \"language\": \"tsx\",\n    \"dependencies\": [\"react\"],\n    \"stylingMethod\": \"inline-styles\",\n    \"animationTech\": [\"canvas\", \"requestAnimationFrame\"],\n    \"props\": [\n      { \"name\": \"density\", \"type\": \"number\", \"default\": 45, \"purpose\": \"Drop count scale (0-100).\" },\n      { \"name\": \"speed\", \"type\": \"number\", \"default\": 35, \"purpose\": \"Fall speed multiplier (0-100).\" },\n      { \"name\": \"wind\", \"type\": \"number\", \"default\": 18, \"purpose\": \"Horizontal drift, -100..100.\" },\n      { \"name\": \"intensity\", \"type\": \"number\", \"default\": 30, \"purpose\": \"Streak length/width + flash strength (0-100).\" },\n      { \"name\": \"lightning\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Soft, infrequent lightning flashes.\" },\n      { \"name\": \"splash\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Faint ripples where drops land.\" },\n      { \"name\": \"parallax\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Gentle pointer parallax.\" },\n      { \"name\": \"colors\", \"type\": \"string[]\", \"default\": [\"#A8C2E8\", \"#6F8FB8\", \"#445577\"], \"purpose\": \"Streak tint ramp.\" },\n      { \"name\": \"seed\", \"type\": \"number\", \"default\": 1, \"purpose\": \"Deterministic drop layout.\" },\n      { \"name\": \"style\", \"type\": \"React.CSSProperties\", \"default\": \"undefined\", \"purpose\": \"Wrapper style escape hatch.\" }\n    ],\n    \"responsive\": \"Wrapper h-full w-full overflow-hidden; ResizeObserver with setTransform reset; DPR cap 2 (1.5 above 1920px); drop count x0.55 at <=820px (40-900).\",\n    \"performanceNotes\": \"Single rAF with id cancelled on unmount; IntersectionObserver pauses off-screen; ripples capped at 140 with swap-pop; two strokes per drop, no per-frame allocations.\",\n    \"accessibility\": \"aria-hidden canvas + pointer-events none; static frame under prefers-reduced-motion; soft + infrequent lightning flash limited to 0.15 alpha.\"\n  },",
    "why": "Index entry (scan-components.mjs only refreshes derived fields and never adds entries); category/name/slug/props are authoritative here."
  }
]
```

Authoritative ADD procedure: `references/07-integration-checklist.md` (Stages A–F).

## 13. Test Checklist

- Load full-bleed in the hero; confirm a steady diagonal rain with a subtle wind lean and no stutter.
- Move the pointer across the frame; confirm a soft parallax, no snapping, no click interception.
- Watch 45–60s; confirm a lightning flash appears, fades fully, and recurs on an 8–14s cadence.
- Resize 320px → 1440px; confirm drops re-bake, the canvas stays sharp, and mobile gets ~half the drops.
- Scroll the background off-screen; confirm the rAF loop stops (no CPU burn).
- Toggle OS `prefers-reduced-motion`; confirm one static frame renders and animation stays off.
- Set `lightning={false}` / `splash={false}`; confirm those systems disappear cleanly.
- Check dark hero heading text over the flash moment for contrast (text-primary token).

## 14. Risks & Open Questions

- **Flicker / motion sensitivity:** the lightning flash is alpha-capped at 0.15 and
  8–14s apart; if it still disturbs, set `lightning={false}`. Reduced-motion users
  get a static frame, never a flash.
- **Mobile cost:** at the default the loop is a few hundred strokes; the drop
  count ×0.55 clamp on ≤820px keeps it light. Verify on a low-end device in the
  hero if battery is a concern.
- **Overlap:** `Sky.tsx` already provides a night sky + stars. Confirm with the
  team that "rain storm" is wanted as a separate hero background rather than a
  `Sky` variant (`Sky.rain?: boolean`). This spec deliberately keeps it standalone
  (different rendering core: streaks vs clouds).
- **Aesthetic tuning:** streak length/width (`streakScale`), wind lean (`drift *
  length * 4`) and flash cadence are starting points; expect iteration on realism
  vs readability for a hero.