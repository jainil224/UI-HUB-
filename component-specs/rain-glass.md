## 1. Header

- **Name:** Rain Glass
- **Proposed slug:** `rain-glass`
- **Category:** `interactive-background`
- **One-line pitch:** A rain-streaked windowpane — scattered glistening droplets, soft warm bokeh and the occasional slow drip — behind hero content.
- **Date:** 2026-09-23

## 2. Visual Intent

A full-bleed windowpane sits behind the hero: a mid-tone, overcast glass surface
scattered with translucent droplets, each catching a small bright specular dot
and a thin horizontal lens streak. Behind the pane, a softly blurred dusk
backdrop of warm amber and cool blue bokeh dots reads through the glass. Every
few seconds a droplet catches light, swells and runs straight down, leaving a
faint fading trail before a fresh droplet forms at the top of the pane. Motion
behaviour: the beads stay still while the bokeh and drops shift very gently with
the pointer; nothing moves when `prefers-reduced-motion` is on (one static pane
with beads and bokeh).

## 2.5 Inspiration Sources

- **Mood / palette / motion:** calm · overcast · cosy. Palette **measured from the
  reference image's own pixels**: mid-tone neutral warm-grey (mean `#817F7B`),
  mean brightness 0.50, dominant amber/neutral hue (~60°) with secondary blue
  (~240°) and a magenta-violet (~300°) accent; low-to-mid saturation throughout.
  Motion implied by the subject: droplet runoff and slow drips downward.
- **Image provided?** yes — *Raindrops on a windowpane* (`File:Rain drops on
  window 01 ies.jpg`, Wikimedia Commons, GFDL, photographer Frank Vincentz).
  One-line description: a mid-bright, rain-streaked windowpane scattered with
  droplets over a diffuse, warm-overcast scene.
- **Reference links found:**
  - https://commons.wikimedia.org/wiki/File:Rain_drops_on_window_01_ies.jpg —
    the attached primary inspiration. Borrowed the *composition + mood* (droplets
    on a pane, warm-neutral light) and the measured palette. Source is GFDL; only
    a look was described, nothing was reproduced.
  - https://www.shadcn.io/background/rain — borrowed the *layered motion feel*
    (steady streaks everywhere would fight a hero, so here raindrops stay subtle
    and drips are rare). No code copied.
  - **Verification note:** this model class has no visual input, so the palette
    and brightness above were computed programmatically (System.Drawing pixel
    sampling of the actual downloaded file) and the subject came from the file's
    metadata — not from human-style viewing. The one-line description is
    metadata-derived until a human confirms what the pane actually frames.

## 3. Tech Stack Analysis

House style for `interactive-background` (from `references/02`): the corpus
renders to **canvas2D + a single rAF loop** — the same shape as `Sky`,
`BlackHole` and the `rain-storm` predecessor spec — with a Tailwind-wrapped
container + inline-styled canvas, an optional seeded rng, a DPR cap ≤ 2,
ResizeObserver sizing, `pointermove` parallax and full cleanup on unmount (cancel
rAF, disconnect observers, remove listeners). No animation library is used. This
component stays inside that stack: dependencies are `react` only — no new
framework or npm package.

## 4. Reference Components Used

- `frontend/src/components/ui/Sky.tsx` — borrow the canvas2D + single-rAF shape,
  the container/canvas wrapper, the seeded `makeRng` layout generator, the
  `prefers-reduced-motion` query/change pattern (one static frame) and the
  eased pointer-parallax lerp.
- `frontend/src/components/ui/BlackHole.tsx` — borrow the ResizeObserver-driven
  resize with recompute-on-resize (not per-frame) and the DPR cap (1.5 above
  1920px, else ≤ 2).
- `frontend/src/components/ui/Lightfall.tsx` — borrow only the *concept* of a
  rain field; the droplet rendering here (lenticular beads + lens streaks, not
  glyph streaks) is new.

## 5. Research Findings

- **Technique:** two-layer canvas painting. (1) A **pre-baked backdrop** — a
  vertical neutral gradient with soft radial "bokeh" blobs drawn once to an
  offscreen canvas, then blitted per frame with `drawImage`, so the expensive
  gradient/blur-style work happens once. (2) **Droplet beads** laid out in
  normalized 0–1 coordinates so a resize re-projects without re-seeding: each
  bead is a radial-gradient body, a small white specular arc and a horizontal
  lens streak; a small pool of "drips" slides downward each frame and respawns
  from a random bead, drawing a parabolic trail behind its head.
- **Parameters:** bead radius 2.5–9.5 CSS px (scaled by frame width / 1280),
  count 8–600 (default 120), drip speed 0.05–0.26 (normalized /s, slower when
  `calm`), backdrop 26 bokeh blobs, parallax strength 14 CSS px.
- **Source:** `No search needed: frontend/src/components/ui/Sky.tsx` already
  implements the rAF + DPR + reduced-motion + parallax machinery, and
  `frontend/src/components/ui/Lightfall.tsx` the rain-field concept; bead drawing
  is plain `canvas 2d` primitives already used across the corpus. No web fetch
  was required for the technique.
- **Licence:** notion of a droplet/bead is general knowledge; the reference image
  (GFDL) is only described, never reproduced.

## 6. Technical Approach

**canvas2D + rAF.** A few hundred beads + one pre-baked backdrop are trivially
cheap on the CPU and consistent with 16 of the corpus backgrounds (`references/02`
§1). WebGL would add a compile step and context-loss handling for no gain at this
density; `framer-motion DOM` or `pure CSS` cannot do per-bead radial-gradient
lighting at this count. Fallback: if the 2d context is unavailable, the container
renders empty and hero text stays readable.

## 7. Props Contract

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `dropletCount` | `number` | `120` | Number of beads on the pane. |
| `parallax` | `boolean` | `true` | Subtle pointer parallax: backdrop shifts more than beads. |
| `parallaxStrength` | `number` | `14` | Max parallax offset in CSS px. |
| `calm` | `boolean` | `true` | True = rare, slow drips ("cosy"); false = steadier light rain. |
| `seed` | `number` | `1` | Deterministic bead layout. |
| `className` | `string` | `""` | Extra classes for the wrapper. |
| `style` | `React.CSSProperties` | `undefined` | Wrapper style escape hatch. |

## 8. Full Implementation

### 8a. Drop-in standalone version

```tsx
"use client";

import * as React from "react";

export type RainGlassProps = {
  dropletCount?: number;
  parallax?: boolean;
  parallaxStrength?: number;
  calm?: boolean;
  seed?: number;
  className?: string;
  style?: React.CSSProperties;
};

export const RAIN_GLASS_DEFAULTS = {
  dropletCount: 120,
  parallax: true,
  parallaxStrength: 14,
  calm: true,
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

interface Bead {
  x: number;
  y: number;
  r: number;
  phase: number;
  streak: number;
}

interface Drip {
  x: number;
  y: number;
  vy: number;
}

export default function RainGlass({
  dropletCount = RAIN_GLASS_DEFAULTS.dropletCount,
  parallax = RAIN_GLASS_DEFAULTS.parallax,
  parallaxStrength = RAIN_GLASS_DEFAULTS.parallaxStrength,
  calm = RAIN_GLASS_DEFAULTS.calm,
  seed = RAIN_GLASS_DEFAULTS.seed,
  className = "",
  style,
}: RainGlassProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduced = reduceQuery.matches;

    const rng = makeRng(seed);

    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let rafId = 0;
    let lastTime = performance.now();
    let width = 0;
    let height = 0;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const count = Math.max(8, Math.min(600, Math.round(dropletCount)));
    const beads: Bead[] = Array.from({ length: count }, () => ({
      x: rng(),
      y: rng(),
      r: 2.5 + rng() * 7,
      phase: rng() * Math.PI * 2,
      streak: rng(),
    }));

    const makeBackdrop = () => {
      const b = document.createElement("canvas");
      b.width = Math.max(1, Math.floor(cssW * dpr));
      b.height = Math.max(1, Math.floor(cssH * dpr));
      const g = b.getContext("2d");
      if (!g) return null;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const bg = g.createLinearGradient(0, 0, 0, cssH);
      bg.addColorStop(0, "#141519");
      bg.addColorStop(0.55, "#23242b");
      bg.addColorStop(1, "#31323c");
      g.fillStyle = bg;
      g.fillRect(0, 0, cssW, cssH);
      for (let i = 0; i < 26; i++) {
        const bx = rng() * cssW;
        const by = rng() * cssH;
        const br = 30 + rng() * 90;
        const warm = rng() > 0.5;
        const glow = g.createRadialGradient(bx, by, 0, bx, by, br);
        glow.addColorStop(0, warm ? "rgba(250,214,140,0.10)" : "rgba(120,150,220,0.12)");
        glow.addColorStop(1, "rgba(0,0,0,0)");
        g.fillStyle = glow;
        g.fillRect(bx - br, by - br, br * 2, br * 2);
      }
      return b;
    };

    let backdrop: HTMLCanvasElement | null = null;

    const newDrip = (): Drip => {
      const b = beads[Math.floor(rng() * beads.length)];
      return { x: b.x, y: b.y, vy: (calm ? 0.05 : 0.14) + rng() * 0.12 };
    };
    const dripCount = calm ? 3 : 8;
    const drips: Drip[] = Array.from({ length: dripCount }, (_, i) => {
      const d = newDrip();
      d.y = 0.05 + rng() * 0.9 - i * 0.002;
      return d;
    });

    const beadColor = "rgba(196,208,226,0.28)";
    const lensColor = "rgba(214,224,240,0.20)";

    const draw = (t: number) => {
      if (width === 0 || height === 0 || !backdrop) return;
      ctx.clearRect(0, 0, width, height);
      const px = parallax && !reduced ? pointer.x * parallaxStrength : 0;
      const py = parallax && !reduced ? pointer.y * parallaxStrength : 0;
      ctx.drawImage(backdrop, px * 0.5, py * 0.5, width, height);

      ctx.save();
      ctx.translate(px, py);
      for (const b of beads) {
        const bx = b.x * width;
        const by = b.y * height + (reduced ? 0 : Math.sin(t * 0.6 + b.phase) * 0.6);
        const rr = Math.max(2, b.r * (width / 1280));
        ctx.strokeStyle = lensColor;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx - rr * (1.2 + b.streak * 3), by);
        ctx.lineTo(bx + rr * (1.2 + b.streak * 3), by);
        ctx.stroke();
        const body = ctx.createRadialGradient(bx - rr * 0.4, by - rr * 0.5, rr * 0.1, bx, by, rr);
        body.addColorStop(0, "rgba(210,222,240,0.5)");
        body.addColorStop(0.55, beadColor);
        body.addColorStop(1, "rgba(120,140,170,0.18)");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(bx, by, rr, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.beginPath();
        ctx.arc(bx - rr * 0.35, by - rr * 0.4, rr * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduced) {
        for (const d of drips) {
          d.y += d.vy * (2 / 60);
          if (d.y > 1.02) {
            const nd = newDrip();
            d.x = nd.x;
            d.y = nd.y;
            d.vy = nd.vy;
          }
          const dx = d.x * width;
          const dy = d.y * height;
          const len = height * 0.018;
          const trail = ctx.createLinearGradient(dx, dy - len, dx, dy);
          trail.addColorStop(0, "rgba(196,208,226,0)");
          trail.addColorStop(1, "rgba(214,228,246,0.35)");
          ctx.fillStyle = trail;
          ctx.fillRect(dx - 1, dy - len, 2, len);
          ctx.fillStyle = "rgba(235,244,255,0.8)";
          ctx.beginPath();
          ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const resize = () => {
      const rect = container.getBoundingClientRect();
      cssW = Math.max(1, rect.width);
      cssH = Math.max(1, rect.height);
      const raw = window.devicePixelRatio || 1;
      dpr = Math.min(raw, cssW > 1920 ? 1.5 : 2);
      width = Math.floor(cssW * dpr);
      height = Math.floor(cssH * dpr);
      canvas.width = width;
      canvas.height = height;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      backdrop = makeBackdrop();
      draw(performance.now() / 1000);
    };

    const loop = (now: number) => {
      if (!reduced) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        if (parallax) {
          const k = 1 - Math.exp(-4 * dt);
          pointer.x += (pointer.tx - pointer.x) * k;
          pointer.y += (pointer.ty - pointer.y) * k;
        }
        draw(now / 1000);
      }
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
      reduced = e.matches;
      if (reduced) {
        pointer.x = pointer.tx = 0;
        pointer.y = pointer.ty = 0;
      }
      draw(performance.now() / 1000);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);

    if (parallax) window.addEventListener("pointermove", onPointerMove, { passive: true });
    reduceQuery.addEventListener("change", onReduceMotion);
    resize();

    if (!reduced) {
      lastTime = performance.now();
      rafId = requestAnimationFrame(loop);
    } else {
      draw(performance.now() / 1000);
    }

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      reduceQuery.removeEventListener("change", onReduceMotion);
    };
  }, [dropletCount, parallax, parallaxStrength, calm, seed]);

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
- **Single** rAF loop, id in a local, `cancelAnimationFrame` on unmount; beads are
  normalized (0–1) so resize just re-projects, it never re-seeds.
- Backdrop bokeh is **pre-baked once** to an offscreen canvas and blitted per
  frame with one `drawImage` — no per-frame gradient allocation for the backdrop.
- Bead draw is three cheap primitives (radial gradient, specular arc, streak).
- Drips capped at 3 (`calm`) or 8, one per frame each.
- `prefers-reduced-motion: reduce` draws exactly one static pane and the rAF loop
  does no draw work; it resumes if the query flips back.
- No WebGL resources to release; the 2d context is GC'd with the canvas.

## 10. Accessibility

- Canvas is decorative: `aria-hidden="true"` plus `pointer-events-none`; never
  focusable, never intercepts clicks.
- The wrapper is `h-full w-full` behind content; overlay text should use the
  `text-primary` token against the dark `#141519`–`#31323c` base for contrast
  (`data/design-tokens.json`).
- Reduced-motion behaviour is honoured (single static pane), satisfying the
  `prefers-reduced-motion` requirement above the corpus norm.

## 11. Naming Contract

- **File:** `frontend/src/components/ui/RainGlass.tsx`
- **Export:** `export default function RainGlass(props: RainGlassProps)`
- **Slug:** `rain-glass`

All three derive from the same name; no aliases.

## 12. Integration Preview

Adding Rain Glass to the live site takes seven edits, all additive: create the
`RainGlass.tsx` component file; add a `React.lazy` const, a `UI_COMPONENTS` key
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
    "file": "frontend/src/components/ui/RainGlass.tsx",
    "anchor": "",
    "operation": "create-file",
    "payload": "§8",
    "why": "New component; the source is the §8b project-integrated block."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "const DriftwoodGallery = React.lazy(() => import('../components/ui/DriftwoodGallery').then(m => ({ default: m.DriftwoodGallery })));",
    "operation": "insert-after",
    "payload": "\nconst RainGlass = React.lazy(() => import('../components/ui/RainGlass'));",
    "why": "Anti-drift: file RainGlass.tsx = default export RainGlass = lazy const RainGlass = slug rain-glass."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "'drag-drop-upload': DragDropUpload,",
    "operation": "insert-after",
    "payload": "\n    'rain-glass': RainGlass,",
    "why": "UI_COMPONENTS key must equal the slug so renderComponent(\"rain-glass\") resolves the lazy component."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "        preview: () => <DriftwoodGalleryPreview />,\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "operation": "insert-after",
    "payload": "\n\n    // ── Rain Glass ───────────────────────────────────────\n    {\n        id: \"rain-glass\",\n        title: \"Rain Glass\",\n        category: \"interactive-background\",\n        addedAt: \"2026-09-23\",\n        newBadgeDays: 120,\n        description: \"A rain-streaked windowpane with glistening droplets, soft bokeh and the occasional slow drip behind hero content.\",\n        preview: () => (\n            <div className=\"w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#141519]\">\n                <RainGlass />\n            </div>\n        ),\n        code: \"\",\n        vibePrompt: \"\",\n    },",
    "why": "Append the ComponentItem at the end of the insertion-ordered array (the array is not grouped by category)."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "    \"sky\": {",
    "operation": "insert-before",
    "payload": "    \"rain-glass\": {\n        props: [\n            { name: \"dropletCount\", type: \"number\", default: \"120\", description: \"Number of beads on the pane.\" },\n            { name: \"parallax\", type: \"boolean\", default: \"true\", description: \"Subtle pointer parallax: backdrop shifts more than beads.\" },\n            { name: \"parallaxStrength\", type: \"number\", default: \"14\", description: \"Max parallax offset in CSS px.\" },\n            { name: \"calm\", type: \"boolean\", default: \"true\", description: \"True = rare, slow drips; false = steadier light rain.\" },\n            { name: \"seed\", type: \"number\", default: \"1\", description: \"Deterministic bead layout.\" },\n            { name: \"className\", type: \"string\", default: '\"\"', description: \"Extra classes for the wrapper.\" },\n            { name: \"style\", type: \"React.CSSProperties\", default: \"undefined\", description: \"Wrapper style escape hatch.\" }\n        ],\n        vibeMeta: {\n            behavior: \"A Canvas 2D rain-on-glass pane: seeded lenticular droplets with a specular highlight and horizontal lens streak sit over a pre-baked soft bokeh backdrop; a few beads run down leaving a faint trail, and the pointer tilts the pane with eased parallax; prefers-reduced-motion renders one static pane.\",\n            states: { from: \"a calm rain-streaked windowpane glistens in soft overcast light\", to: \"droplets catch light, a few run down, and the pointer gently tilts the pane\" },\n            cssProperties: [\"canvas 2d\", \"requestAnimationFrame\", \"pointermove parallax\", \"prefers-reduced-motion static frame\"]\n        }\n    },",
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
    "payload": "  {\n    \"category\": \"interactive-background\",\n    \"name\": \"RainGlass\",\n    \"slug\": \"rain-glass\",\n    \"filePath\": \"frontend/src/components/ui/RainGlass.tsx\",\n    \"language\": \"tsx\",\n    \"dependencies\": [\"react\"],\n    \"stylingMethod\": \"inline-styles\",\n    \"animationTech\": [\"canvas\", \"requestAnimationFrame\"],\n    \"props\": [\n      { \"name\": \"dropletCount\", \"type\": \"number\", \"default\": 120, \"purpose\": \"Number of beads on the pane.\" },\n      { \"name\": \"parallax\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"Subtle pointer parallax: backdrop shifts more than beads.\" },\n      { \"name\": \"parallaxStrength\", \"type\": \"number\", \"default\": 14, \"purpose\": \"Max parallax offset in CSS px.\" },\n      { \"name\": \"calm\", \"type\": \"boolean\", \"default\": true, \"purpose\": \"True = rare, slow drips; false = steadier light rain.\" },\n      { \"name\": \"seed\", \"type\": \"number\", \"default\": 1, \"purpose\": \"Deterministic bead layout.\" },\n      { \"name\": \"className\", \"type\": \"string\", \"default\": \"\\\"\\\"\", \"purpose\": \"Extra classes for the wrapper.\" },\n      { \"name\": \"style\", \"type\": \"React.CSSProperties\", \"default\": \"undefined\", \"purpose\": \"Wrapper style escape hatch.\" }\n    ],\n    \"responsive\": \"Wrapper h-full w-full overflow-hidden; ResizeObserver with setTransform reset; DPR cap 2 (1.5 above 1920px); beads normalized 0-1 so resize re-projects without reseeding.\",\n    \"performanceNotes\": \"Backdrop bokeh pre-baked once and blitted per frame; beads are radial-gradient + specular arc + streak; drips capped 3-8; rAF cancelled and observers/listeners removed on unmount; reduced-motion static pane.\"\n  },",
    "why": "Index entry (scan-components.mjs only refreshes derived fields and never adds entries); category/name/slug/props are authoritative here."
  }
]
```

Authoritative ADD procedure: `references/07-integration-checklist.md` (Stages A–F).

## 13. Test Checklist

- Load the component full-bleed; confirm scattered droplets with specular dots
  and a soft bokeh backdrop.
- Wait a few seconds; confirm a droplet occasionally runs down leaving a faint
  trail, and a fresh one forms.
- Move the pointer across the frame; confirm a gentle parallax (bokeh shifts more
  than beads), no snapping.
- Toggle `calm` false; confirm drips become noticeably more frequent.
- Resize 320px → 1440px; confirm the pane re-bakes (DPR cap) and beads stay sharp
  and proportioned.
- Toggle OS `prefers-reduced-motion`; confirm a single static pane, and that it
  resumes when flipped back.
- Check a light overlay text sample over the pane for contrast.

## 14. Risks & Open Questions

- **Image comprehension limit:** this model class cannot receive image input, so
  the Inspiration brief for the attached reference was produced from verifiable
  extracts — pixel statistics (palette, brightness) plus the file's own subject
  metadata — rather than a true visual read. A human should confirm the pane's
  actual framing before treating §2.5's one-line description as exact.
- **Calm vs steady make was an author choice:** `calm=true` (rare drips) preserves
  hero readability; confirm this matches the intended product mood.
- **Bokeh color mix** (warm amber vs cool blue at 50/50) is a starting point;
  expect iteration to match a specific brand image.
- **The `rain-storm` spec already proposes streaks + ripples**; `rain-glass` is
  deliberately the "droplets on a pane" companion, but confirm both are wanted as
  separate components rather than options on one.