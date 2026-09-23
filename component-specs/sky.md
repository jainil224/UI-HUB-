## 1. Header

- **Name:** Aurora Sky
- **Proposed slug:** `sky-aurora`
- **Category:** `interactive-background`
- **One-line pitch:** A dark night sky with layered, slowly drifting aurora curtains and a faint twinkling starfield.
- **Date:** 2026-09-19

## 2. Visual Intent

A full-bleed night sky sits behind content: a deep navy-to-black vertical
gradient dotted with small twinkling stars. Across the upper-middle of the frame,
two to three glowing ribbons of green, cyan and violet light hang like curtains,
their lower edges tearing and reforming as they drift sideways. Motion behaviour:
the curtains drift continuously and shimmer; the pointer nudges the whole scene
with a soft parallax; nothing moves when `prefers-reduced-motion` is on.

## 2.5 Inspiration Sources

- **Mood / palette / motion:** ethereal · auroral · sci-fi-neon. Deep navy-black
  base with green, cyan and violet curtains; motion is slow lateral drift with a
  shimmer and a gentle pointer parallax.
- **Image provided?** no — the original request ("a soft animated sky with slowly
  drifting clouds…") was text-only, so a real inspiration search was run instead.
- **Reference links found:**
  - [CodeFronts — Aurora Borealis Glow Background](https://codefronts.com/motion/css-background-animations/aurora-borealis-background-animation/)
    — borrowed the *look*: fanned vertical curtain sheets that brighten where they
    cross (emissive screen blending), a vertical falloff so each ribbon dissolves
    into the sky, and a twinkling starfield over a hue-shifted night gradient. The
    technique differs (CSS conic gradients + `mix-blend-mode` vs this spec's
    baked gradient sprites composited with additive canvas `lighter`).
  - [CodeFronts — Aurora Borealis Ripple Background](https://codefronts.com/motion/css-ripple-designs/css-aurora-borealis-ripple-background/)
    — borrowed the *composition*: a few soft blurred drifting layers (not many)
    over a starfield, sized so the effect stays behind content. Nothing implemented
    was copied; both sources are CSS-only and don't transfer to our canvas tier.
  - [Tanvir-Sadi/aurora](https://github.com/Tanvir-Sadi/aurora) — borrowed the
    *interaction feel*: pointer-based scene parallax plus a
    `prefers-reduced-motion` static fallback (which we already follow as repo
    house style).

## 3. Tech Stack Analysis

House style for `interactive-background` (from `references/02`): the corpus
renders to **canvas2D + a single rAF loop** — the same shape as `Sky`,
`BlackHole` and `GravitationalVortex` — with Tailwind utility classes on a
wrapper plus a `React.CSSProperties` escape hatch, an optional seeded
`makeRng`-style layout, a DPR cap ≤ 2, ResizeObserver sizing and full cleanup on
unmount (cancel rAF, disconnect observers, remove listeners). No animation
library is used on this category. This component stays inside that stack:
dependencies are `react` only — no new framework or npm package.

## 4. Reference Components Used

- `frontend/src/components/ui/Sky.tsx` — borrow sprite-baking (offscreen gradient
  canvases drawn with `drawImage`), pointer-parallax lerp, the reduced-motion
  query/change pattern, and the container/canvas wrapper shape.
- `frontend/src/components/ui/GravitationalVortex.tsx` — borrow the single-rAF
  cleanup shape (rAF id in a ref, cancel + remove listeners on unmount) and the
  DPR cap of 2 (`references/02` §7).
- `frontend/src/components/ui/BlackHole.tsx` — borrow the ResizeObserver-driven
  resize rather than `window.resize`, and keeping the sim rebuilt on resize only.

Deliberately **not** reusing the existing `sky` component's palette/cloud logic;
this is a distinct effect (aurora curtains, not clouds).

## 5. Research Findings

- **Technique:** Layered fractal Brownian motion (FBM) curtains. Each layer samples
  a 1-D value-noise field as it marches across the screen; the noise value sets the
  curtain's height and opacity for that column. Vertical gradient sprites (bright
  near the lower edge, transparent at both ends) are stretched per column and
  composited with **additive** blending so overlapping ribbons glow instead of
  flattening. A time term advances through the noise field so the shape flows
  sideways; per-layer offsets and scales keep the ribbons from looking identical.
- **Parameters:** FBM octaves 4, frequency gain ~2.1, amplitude gain 0.5; 3 layers;
  column step ≈ width/260 (clamped ≥ 3px); curtain height ≈ 35–120% of a base
  amplitude; drift speed scales per layer.
- **Source:** https://www.dirckmulder.com/blog/soft-aurora (three-octave noise +
  band mask); https://p5js.ai/sketchdocs/s/animated-pulse-flow-xelsedai (additive
  vertical streaks, α from noise); https://21st.dev/@dhileepkumargm/components/flowing-curtains
  (self-contained noise ribbon layers). Implementation below is original; no code
  was copied.
- **Licence:** sources are technique write-ups/tutorials; no third-party code is
  reproduced. Standard library feature only (`canvas 2d`), so no licence flag.

## 6. Technical Approach

**canvas2D + rAF.** The effect is a few hundred thin columns of a pre-baked
gradient — trivially cheap on the CPU and consistent with 14 of the 19 existing
backgrounds (`references/02` §1, §7). WebGL would add a shader-compile step,
context-loss handling and a much larger file for no visual gain at this density.
Rejected `framer-motion DOM` (per-column DOM nodes are wasteful) and `pure CSS`
(no layered noise). No fallback needed beyond a static frame if the 2d context is
unavailable.

## 7. Props Contract

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `colors` | `string[]` | `AURORA_DEFAULTS.colors` | Spectral ramp for the curtains, base to tip. |
| `layers` | `number` | `3` | Number of overlapping curtain bands. |
| `speed` | `number` | `0.5` | Wind/drift speed multiplier. |
| `intensity` | `number` | `1.2` | Curtain brightness. |
| `stars` | `boolean` | `true` | Draw the starfield. |
| `starCount` | `number` | `160` | Number of stars. |
| `parallax` | `boolean` | `true` | Enable pointer parallax. |
| `parallaxStrength` | `number` | `18` | Parallax offset in CSS px. |
| `seed` | `number` | `1` | Deterministic layout seed. |
| `className` | `string` | `""` | Extra classes for the wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Wrapper style escape hatch. |

## 8. Full Implementation

### 8a. Drop-in standalone version

```tsx
"use client";

import * as React from "react";

export type AuroraSkyProps = {
  colors?: string[];
  layers?: number;
  speed?: number;
  intensity?: number;
  stars?: boolean;
  starCount?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
};

export const AURORA_DEFAULTS = {
  colors: ["#04FF3F", "#00E5FF", "#7A5CFF"],
  layers: 3,
  speed: 0.5,
  intensity: 1.2,
  stars: true,
  starCount: 160,
  parallax: true,
  parallaxStrength: 18,
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

const fract = (v: number) => v - Math.floor(v);

const valueNoise = (x: number, seed: number) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  const a = fract(Math.sin(i * 127.1 + seed) * 43758.5453);
  const b = fract(Math.sin((i + 1) * 127.1 + seed) * 43758.5453);
  return a + (b - a) * u;
};

const fbm = (x: number, t: number, seed: number) => {
  let v = 0;
  let amp = 0.5;
  let freq = 1;
  for (let o = 0; o < 4; o++) {
    v += amp * valueNoise(x * freq + t * (0.3 + o * 0.2), seed + o * 17.3);
    freq *= 2.1;
    amp *= 0.5;
  }
  return v;
};

const hexToRgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
};

const buildCurtainSprite = (color: string): HTMLCanvasElement => {
  const w = 8;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return c;
  const grad = g.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, "rgba(0,0,0,0)");
  grad.addColorStop(0.35, hexToRgba(color, 0.18));
  grad.addColorStop(0.72, hexToRgba(color, 0.75));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, w, h);
  return c;
};

interface Star {
  x: number;
  y: number;
  r: number;
  a: number;
  phase: number;
  speed: number;
}

export default function AuroraSky({
  colors = AURORA_DEFAULTS.colors,
  layers = AURORA_DEFAULTS.layers,
  speed = AURORA_DEFAULTS.speed,
  intensity = AURORA_DEFAULTS.intensity,
  stars = AURORA_DEFAULTS.stars,
  starCount = AURORA_DEFAULTS.starCount,
  parallax = AURORA_DEFAULTS.parallax,
  parallaxStrength = AURORA_DEFAULTS.parallaxStrength,
  seed = AURORA_DEFAULTS.seed,
  className = "",
  style,
}: AuroraSkyProps) {
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

    let width = 0;
    let height = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();
    let visible = true;

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const layerCount = Math.max(1, Math.min(6, Math.round(layers)));
    const sprites = Array.from({ length: layerCount }, (_, i) =>
      buildCurtainSprite(colors[i % colors.length])
    );

    const starList: Star[] = Array.from({ length: Math.max(0, Math.round(starCount)) }, () => ({
      x: rng(),
      y: Math.pow(rng(), 1.4) * 0.9,
      r: 0.5 + rng() * 1.3,
      a: 0.3 + rng() * 0.7,
      phase: rng() * Math.PI * 2,
      speed: 0.4 + rng() * 1.1,
    }));

    const draw = (time: number) => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#04060D");
      sky.addColorStop(1, "#0B1330");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const px = parallax && !reduced ? pointer.x * parallaxStrength : 0;
      const py = parallax && !reduced ? pointer.y * parallaxStrength : 0;

      if (stars) {
        for (const s of starList) {
          const twinkle = reduced
            ? 0.8
            : 0.35 + 0.65 * Math.max(0, Math.sin(time * s.speed + s.phase));
          ctx.fillStyle = `rgba(235,242,255,${(s.a * twinkle).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(s.x * width + px * 0.2, s.y * height + py * 0.2, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "lighter";
      const step = Math.max(3, Math.round(width / 260));
      for (let l = 0; l < layerCount; l++) {
        const sprite = sprites[l];
        const base = height * (0.62 - l * 0.07);
        const amp = height * 0.5;
        const drift = time * speed * (0.06 + l * 0.03);
        ctx.globalAlpha = Math.min(1, intensity / layerCount + 0.35);
        for (let x = -step; x <= width + step; x += step) {
          const n = fbm((x / Math.max(1, width)) * 4 + l * 10 + drift, time * speed * 0.25, seed + l * 31);
          const h = amp * (0.35 + n * 0.85);
          const top = base - h + py * (0.4 + l * 0.15);
          ctx.drawImage(sprite, x + px * (0.3 + l * 0.12), top, step + 1, h);
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
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
      draw(performance.now() / 1000);
    };

    const loop = (now: number) => {
      if (!visible || reduced) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (parallax) {
        const k = 1 - Math.exp(-4 * dt);
        pointer.x += (pointer.tx - pointer.x) * k;
        pointer.y += (pointer.ty - pointer.y) * k;
      }
      draw(now / 1000);
      rafId = requestAnimationFrame(loop);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!parallax || reduced) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.tx = Math.max(-1, Math.min(1, (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)));
      pointer.ty = Math.max(-1, Math.min(1, (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)));
    };

    const onReduceMotion = (e: MediaQueryListEvent) => {
      cancelAnimationFrame(rafId);
      reduced = e.matches;
      if (reduced) {
        pointer.x = pointer.tx = 0;
        pointer.y = pointer.ty = 0;
        draw(performance.now() / 1000);
        return;
      }
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        visible = entry.isIntersecting;
        if (visible && !reduced) {
          lastTime = performance.now();
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
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceMotion);
    };
  }, [colors, layers, speed, intensity, stars, starCount, parallax, parallaxStrength, seed]);

  return (
    <div ref={containerRef} style={style} className={`relative h-full w-full overflow-hidden ${className}`}>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
    </div>
  );
}
```

### 8b. Project-integrated version

Identical to 8a.

## 9. Performance Plan

- **DPR cap ≤ 2** (`1.5` above 1920px CSS width).
- **ResizeObserver** on the container, disconnected on unmount; no `window.resize`.
- **Single** rAF loop, id held in a local, `cancelAnimationFrame` on unmount.
- **IntersectionObserver** pauses the loop when off-screen; listener + observer and
  media-query listener all removed/disconnected on unmount.
- Sprite gradient is baked once per layer; each column is one `drawImage` (no
  per-column gradient allocation).
- Column step scales with width (≈ width/260, min 3px), so cost does not explode
  on large screens — the mobile density clamp.
- `prefers-reduced-motion: reduce` draws a single static frame and never starts the
  rAF loop; it resumes correctly if the query flips back.
- No WebGL GPU resources to release; the 2d context is GC'd with the canvas.

## 10. Accessibility

- Canvas is decorative: `aria-hidden="true"` plus `pointer-events-none`; it is
  never focusable and never intercepts clicks.
- The wrapper is `h-full w-full` behind content; any overlay text should use the
  `text-primary` token against the dark `#04060D`–`#0B1330` base
  (`data/design-tokens.json`).
- Reduced-motion behaviour is honoured (static frame), satisfying the
  `prefers-reduced-motion` requirement above the corpus norm.

## 11. Naming Contract

- **File:** `frontend/src/components/ui/AuroraSky.tsx`
- **Export:** `export default function AuroraSky(props: AuroraSkyProps)`
- **Slug:** `sky-aurora`

All three derive from the same name; no aliases.

## 12. Integration Preview

Adding Aurora Sky to the live site takes seven edits, all additive: create the
`AuroraSky.tsx` component file; add a `React.lazy` const, a `UI_COMPONENTS` key
and a `componentList` entry in `componentData.tsx`; add a `COMPONENT_CONFIG`
entry in `componentMetadata.ts`; add the full source to `embeddedSourceCode.ts`;
and add an entry to `data/component-index.json`. Nothing existing is removed or
rewritten. The machine-checkable plan below is what ADD mode applies (Stages
A–F); it is written here, never executed in ANALYZE mode. Machine-checked by
`scripts/validate-spec.mjs`: every edit has `file`, `anchor`, `operation`,
`payload` and `why`; `create-file` targets must not exist; every other anchor
must match exactly once in its file. No line numbers anywhere.

```json
[
  {
    "file": "frontend/src/components/ui/AuroraSky.tsx",
    "anchor": "",
    "operation": "create-file",
    "payload": "§8",
    "why": "New component; the source is the §8b project-integrated block."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "const DriftwoodGallery = React.lazy(() => import('../components/ui/DriftwoodGallery').then(m => ({ default: m.DriftwoodGallery })));",
    "operation": "insert-after",
    "payload": "\nconst AuroraSky = React.lazy(() => import('../components/ui/AuroraSky'));",
    "why": "Anti-drift: file AuroraSky.tsx = default export AuroraSky = lazy const AuroraSky = slug sky-aurora."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "'drag-drop-upload': DragDropUpload,",
    "operation": "insert-after",
    "payload": "\n    'sky-aurora': AuroraSky,",
    "why": "UI_COMPONENTS key must equal the slug so renderComponent(\"sky-aurora\") resolves the lazy component."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "        preview: () => <DriftwoodGalleryPreview />,\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "operation": "insert-after",
    "payload": "\n\n    // ── Aurora Sky ───────────────────────────────────────\n    {\n        id: \"sky-aurora\",\n        title: \"Aurora Sky\",\n        category: \"interactive-background\",\n        addedAt: \"2026-09-19\",\n        newBadgeDays: 120,\n        description: \"Layered aurora curtains drift and shimmer across a twinkling night sky with soft pointer parallax.\",\n        preview: () => (\n            <div className=\"w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#04060D]\">\n                <AuroraSky />\n            </div>\n        ),\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "why": "Append the ComponentItem at the end of the insertion-ordered array (the array is not grouped by category)."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "    \"sky\": {",
    "operation": "insert-before",
    "payload": "    \"sky-aurora\": {\n        props: [\n            { name: \"colors\", type: \"string[]\", default: \"AURORA_DEFAULTS.colors\", description: \"Spectral ramp for the curtains, base to tip.\" },\n            { name: \"layers\", type: \"number\", default: \"3\", description: \"Overlapping curtain bands (1-6).\" },\n            { name: \"speed\", type: \"number\", default: \"0.5\", description: \"Wind/drift speed multiplier.\" },\n            { name: \"intensity\", type: \"number\", default: \"1.2\", description: \"Curtain brightness.\" },\n            { name: \"stars\", type: \"boolean\", default: \"true\", description: \"Draw the starfield.\" },\n            { name: \"starCount\", type: \"number\", default: \"160\", description: \"Number of stars.\" },\n            { name: \"parallax\", type: \"boolean\", default: \"true\", description: \"Enable pointer parallax.\" },\n            { name: \"parallaxStrength\", type: \"number\", default: \"18\", description: \"Parallax offset in CSS px.\" },\n            { name: \"seed\", type: \"number\", default: \"1\", description: \"Deterministic layout seed.\" },\n            { name: \"className\", type: \"string\", default: '\"\"', description: \"Extra classes for the wrapper.\" },\n            { name: \"style\", type: \"React.CSSProperties\", default: \"undefined\", description: \"Wrapper style escape hatch.\" }\n        ],\n        vibeMeta: {\n            behavior: \"A Canvas 2D aurora: pre-baked vertical gradient curtain sprites are stretched per column along a seeded FBM value-noise field and composited with additive (lighter) blending, so overlapping ribbons glow instead of flattening; a parallax-eased pointer nudges the layers and a twinkling starfield sits behind.\",\n            states: { from: \"layered aurora curtains drift and shimmer over a twinkling starfield\", to: \"pointer parallax shifts the curtain layers and starfield at different depths\" },\n            cssProperties: [\"canvas 2d\", \"cached curtain gradient sprites\", \"seeded value-noise fbm\", \"additive lighter compositing\", \"exponential lerp pointer parallax\", \"dpr-capped resize\", \"intersection observer parking\"],\n            description: \"A dark night sky with layered, slowly drifting aurora curtains and a faint twinkling starfield.\",\n            libraries: [\"react\"],\n            requirements: [\"Canvas 2D\", \"requestAnimationFrame loop\", \"ResizeObserver\", \"IntersectionObserver parking\", \"seeded rng\", \"FBM value noise\", \"cached curtain sprites\", \"devicePixelRatio cap\", \"prefers-reduced-motion support\"]\n        }\n    },\n",
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
    "payload": "  {\n    \"category\": \"interactive-background\",\n    \"name\": \"AuroraSky\",\n    \"slug\": \"sky-aurora\",\n    \"filePath\": \"frontend/src/components/ui/AuroraSky.tsx\",\n    \"language\": \"tsx\",\n    \"dependencies\": [\"react\"],\n    \"stylingMethod\": \"inline-styles\",\n    \"animationTech\": [\"canvas\", \"requestAnimationFrame\"],\n    \"props\": [\n      { \"name\": \"colors\", \"type\": \"string[]\", \"default\": \"AURORA_DEFAULTS.colors\", \"purpose\": \"Spectral ramp for the curtains, base to tip.\" },\n      { \"name\": \"layers\", \"type\": \"number\", \"default\": 3, \"purpose\": \"Overlapping curtain bands (1-6).\" },\n      { \"name\": \"speed\", \"type\": \"number\", \"default\": 0.5, \"purpose\": \"Wind/drift speed multiplier.\" },\n      { \"name\": \"intensity\", \"type\": \"number\", \"default\": 1.2, \"purpose\": \"Curtain brightness.\" },\n      { \"name\": \"stars\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Draw the starfield.\" },\n      { \"name\": \"starCount\", \"type\": \"number\", \"default\": 160, \"purpose\": \"Number of stars.\" },\n      { \"name\": \"parallax\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Enable pointer parallax.\" },\n      { \"name\": \"parallaxStrength\", \"type\": \"number\", \"default\": 18, \"purpose\": \"Parallax offset in CSS px.\" },\n      { \"name\": \"seed\", \"type\": \"number\", \"default\": 1, \"purpose\": \"Deterministic layout seed.\" },\n      { \"name\": \"className\", \"type\": \"string\", \"default\": \"\\\"\\\"\", \"purpose\": \"Extra classes for the wrapper.\" },\n      { \"name\": \"style\", \"type\": \"React.CSSProperties\", \"default\": \"undefined\", \"purpose\": \"Wrapper style escape hatch.\" }\n    ],\n    \"responsive\": \"Wrapper h-full w-full overflow-hidden; ResizeObserver with setTransform reset; DPR cap 2 (1.5 above 1920px); column step scales with width (width/260, min 3px).\",\n    \"performanceNotes\": \"Curtain gradient sprites baked once per layer; single rAF loop parked by IntersectionObserver; prefers-reduced-motion draws one static frame and never starts the loop; pointer parallax is exponential-lerp.\"\n  },\n",
    "why": "Index entry (scan-components.mjs only refreshes derived fields and never adds entries); category/name/slug/props are authoritative here."
  }
]
```

Authoritative ADD procedure: `references/07-integration-checklist.md` (Stages A–F).

## 13. Test Checklist

- Load the component full-bleed; confirm three distinct drifting ribbons and stars.
- Move the pointer across the frame; confirm a soft parallax, no snapping.
- Resize 320px → 1440px; confirm the canvas re-bakes and stays sharp.
- Toggle OS `prefers-reduced-motion`; confirm the scene freezes and resumes.
- Scroll the background off-screen; confirm the rAF loop stops (no CPU burn).
- Check a dark overlay text sample over the curtains for contrast.

## 14. Risks & Open Questions

- **Slug collision resolved:** the registry already has a `sky` component
  (`Sky.tsx`, slug `sky`). This spec deliberately proposes `sky-aurora` so the
  validator's uniqueness check passes.
- **Overlap:** `Sky.tsx` already provides a starfield + parallax. Confirm with the
  team that "aurora curtains over a night sky" is wanted as a separate component
  rather than an option on `Sky` (`Sky.aurora?: boolean`).
- **Aesthetic tuning:** the noise constants (`4`, `0.85`, per-layer drift) are
  starting points; expect iteration on ribbon softness and base height.
- **Palette fit:** `#04FF3F`/`#00E5FF`/`#7A5CFF` follow the neon-on-dark corpus
  palette; confirm they read as aurora rather than "sci-fi neon".
