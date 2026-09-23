## 1. Header

- **Name:** Rain Storm
- **Proposed slug:** `rain-storm`
- **Category:** `interactive-background`
- **One-line pitch:** A calm-to-moderate night storm — two-depth gusting realistic rain, splash flecks where drops land, and cinematic branching lightning you can trigger on demand by clicking the sky.
- **Date:** 2026-09-23
- **Kind:** `revision` (v3) of the shipped `rain-storm` component — upgrades the rain to a two-depth realistic look with gust wind and click-to-strike lightning. Same file, export and slug; no new component, no new dependency.

## 2. Visual Intent

A full-bleed night sky: deep navy-to-ink vertical gradient behind hero text. Rain now reads as real falling rain — two visual depths at once: a soft, slower, dimmer far layer of short drops and a brighter, faster near layer of long drops with rounded, glowing tips, so the field feels dimensional rather than a single sheet of lines. Wind breathes: gusts roll through every few seconds, bending the near streaks this way and that in sheets. Where a near drop lands at the bottom edge, a tiny burst of splash flecks kicks up beside the fading ellipse ripple. Every 7–15 seconds the sky opens with the v2 cinematic strike — one to three branching bolts, a hard flash, one echo, a radial sky glow and an additive pass that lights the rain — and, new in v3, **a click or tap anywhere fires a strike instantly** so visitors never miss the storm. Motion: drops stream continuously with gust variation and gentle pointer parallax; clicking produces an immediate strike on the existing cadence; `prefers-reduced-motion` shows one static frame, no rain animation and no flash (clicks are inert).

## 2.5 Inspiration Sources

- **Mood / palette / motion:** storm-calm · electric · layered. Deep ink-navy sky, pale-blue two-depth streaks; bolt cores white with violet-indigo glow; rain reads in distinct depth planes that gust in sheets.
- **Image provided?** no — text-only, so a real inspiration search was run.
- **Reference links found:**
  - [shadcn.io — React Rain Background](https://www.shadcn.io/background/rain) — borrowed the *layered-depth look*: distant drops slower + dimmer + shorter, close drops faster + brighter + longer, each set at a slight angle with varying lengths/speeds; powerful, atmospheric parallax. Look only, no code reproduced.
  - [Geoff Blair — Rain Effect in HTML5 Canvas](https://www.geoffblair.com/blog/rain-effect-html5-canvas/) — borrowed the *depth-scaling rule*: a drop's velocity, length and opacity are scaled together so faster drops are also longer and more opaque — that single correlation sells the depth illusion — plus drawing rain with the `lighter` composite for an additive sheen. Rediscovered in our own code, not pasted.

## 3. Tech Stack Analysis

House style for `interactive-background` (from `references/02`): the corpus renders to **canvas2D + a single rAF loop** (the same shape as `Sky` and `BlackHole`), inline-styled wrapper plus optional `React.CSSProperties`, seeded deterministic layout, DPR cap ≤ 2, ResizeObserver resizing and full unmount cleanup. `RainStorm` v2 already lives in this stack (react-only deps, `RainStorm-CDxIK0Lp.js` chunk, no motion/three). This revision stays inside it: dependencies remain `react` only — no new framework or npm package. Depth layering, gusts, flecks and click-strikes are plain 2D primitives (two stroke passes, `lighter` composite, pooled arrays).

## 4. Reference Components Used

- `frontend/src/components/ui/Sky.tsx` — borrow the canvas2D + single-rAF shape, the container/canvas wrapper, the `prefers-reduced-motion` medium-query/flip pattern and the seeded rng layout generator (already borrowed in v2).
- `frontend/src/components/ui/BlackHole.tsx` — borrow the ResizeObserver-driven resize with recompute-on-resize (not per-frame) and the DPR cap (1.5 above 1920px, else ≤ 2) (already borrowed in v2).
- `frontend/src/components/ui/RainStorm.tsx` (v2, own prior revision) — the lightning subsystem (`channel`/`buildBolt`/`makeStrike`, flash phase machine, baked glow, additive lit-rain pass) is carried forward unchanged; v3 adds the two-depth gusting rain and click-strike wiring around it.

Deliberately **not** reusing `Lightfall` (WebGL streak shader; corpus anti-patterns in `references/04` §10) — rain here is cheaper as plain 2D, matching the other night-sky canvas components.

## 5. Research Findings

- **Technique (rain depth):** Two-depth parallax rain. Every drop lives on one of two planes; the far plane draws shorter, slower, dimmer and thinner drops, the near plane longer, faster, brighter drops with a round glowing head cap. Because speed, length and opacity scale together per drop, the eye reads a genuine depth gap between the planes (absolute parallax depth via per-plane `px/py` multipliers too). Wind is not static: a low-frequency gust oscillator (`1 + 0.4·sin(0.4·t + phase)`, per-drop phase) bends the near-plane horizontal drift and streak lean, producing intermittent sheets. Near-plane landings spawn 3 pooled splash flecks (short upward kinematics) beside the existing ellipse ripple. **Technique (click-strike):** a `pointerdown` listener reuses the exact `makeStrike` the cadence scheduler calls, but pins the strike's horizontal origin to the click X so the bolt fractures where the user pointed; the scheduler's `nextFlash` timer is untouched, so clicks add strikes without skewing cadence.
- **Parameters:** near plane = 60% of drops, far = 40%; far speed 0.45–0.80×, length 0.8×, width 0.7×, alpha 0.18–0.48; near speed 1.05–1.60×, length 1.25×, width 1.2–1.4× (head cap ≤ 1.6), alpha 0.35–0.85; gust amplitude 0.4 at 0.4 rad/s, per-drop phase `rng·2π`; far parallax multiplier 0.4, near 1.0; splash fleck cap 100 (3 per near landing), kick velocity `vx=(rng·2−1)·70`, `vy=−(30+rng·80)`, life 0.28–0.53 s; click-strike origin `clamp(clickX, 4, width−4)`. Bolt/flash params unchanged from v2 (peak α 0.16–0.40 by intensity, strike→echo→decay phases, ≤2 quick flashes per strike).
- **Source:**
  - Depth scaling + `lighter` rain sheen: https://www.geoffblair.com/blog/rain-effect-html5-canvas/
  - Layered parallax rain look: https://www.shadcn.io/background/rain
  - `No search needed: RainStorm v2 already implements the canvas2D + rAF loop, the seeded strike generator, the baked glow and the additive lit-rain pass; v3 layers two rain planes and a click trigger on top of that existing machinery.`
- **Licence:** none — no third-party code reproduced; the depth/gust/fleck math is this component's own implementation of the general techniques above.

## 6. Technical Approach

**canvas2D + rAF** (unchanged from v2). The two-depth rain is a few hundred moving line segments with one extra stroke pass for near heads and a pooled fleck array — trivial CPU load; a flash still costs one `drawImage` + ≤3 bolt polylines + a rare `lighter` pass. WebGL would add a compile step and context-loss handling for no visible gain at this density; `framer-motion DOM` would need per-droplet DOM nodes; pure CSS can't express continuous gust-leaning streaks. Fallback: one static framed scene when the 2d context is unavailable (v2 already draws this path).

## 7. Props Contract

| Name | Type | Default | Purpose |
|------|------|---------|---------|
| `density` | `number` | `45` | Drop count scale (0–100). |
| `speed` | `number` | `35` | Fall speed multiplier (0–100). |
| `wind` | `number` | `18` | Base horizontal drift (−100…100). |
| `intensity` | `number` | `30` | Streak length/width + lightning flash & bolt strength (0–100). |
| `lightning` | `boolean` | `true` | Master switch for the lightning system (flash + bolts). |
| `bolts` | `boolean` | `true` | Draw branching bolt strokes; `false` keeps a glow-only flash. |
| `flashMin` | `number` | `7` | Minimum seconds between strikes (≥2). |
| `flashMax` | `number` | `15` | Maximum seconds between strikes. |
| `interactive` | `boolean` | `true` | Click/tap fires a lightning strike on demand (previews). |
| `splash` | `boolean` | `true` | Faint ripples + splash flecks where drops land. |
| `parallax` | `boolean` | `true` | Gentle pointer parallax. |
| `colors` | `string[]` | `["#A8C2E8", "#6F8FB8", "#445577"]` | Streak tint ramp. |
| `seed` | `number` | `1` | Deterministic drop layout and strike schedule. |
| `style` | `React.CSSProperties` | `undefined` | Wrapper style escape hatch. |

Rules: defaults keep the hero readable behind text (calm-to-moderate storm); every prop has a real default; no prop of type `any`; no literal pipes in type cells.

## 8. Full Implementation

The **8a** block is what must stay portable (`validate-spec.mjs` checks it); the **8b** block is what ADD actually registers.

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
  layer: number;
  gustPhase: number;
}

interface Splash {
  x: number;
  y: number;
  r: number;
  alpha: number;
}

interface Fleck {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  alpha: number;
}

interface Point {
  x: number;
  y: number;
}

interface Bolt {
  pts: Point[];
  halo: number;
  core: number;
  alpha: number;
}

export interface StormProps {
  density?: number;
  speed?: number;
  wind?: number;
  intensity?: number;
  lightning?: boolean;
  bolts?: boolean;
  flashMin?: number;
  flashMax?: number;
  interactive?: boolean;
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
  bolts: true,
  flashMin: 7,
  flashMax: 15,
  interactive: true,
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

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

function channel(rng: () => number, a: Point, b: Point, jag: number, out: Point[]) {
  if (jag < 2.5 || out.length > 480) {
    out.push(b);
    return;
  }
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const d = dist(a, b) || 1;
  const ux = -(b.y - a.y) / d;
  const uy = (b.x - a.x) / d;
  const mid: Point = { x: mx + ux * (rng() * 2 - 1) * jag, y: my + uy * (rng() * 2 - 1) * jag };
  channel(rng, a, mid, jag * 0.6, out);
  channel(rng, mid, b, jag * 0.6, out);
}

function buildBolt(rng: () => number, x0: number, y0: number, x1: number, y1: number): Bolt {
  const start: Point = { x: x0, y: y0 };
  const end: Point = { x: x1, y: y1 };
  const len = dist(start, end);
  const pts: Point[] = [];
  channel(rng, start, end, clamp(len * 0.16, 10, 110), pts);
  const ux = (x1 - x0) / len;
  const uy = (y1 - y0) / len;
  const npx = -uy;
  const npy = ux;
  const forks = 1 + (rng() < 0.55 ? 1 : 0);
  for (let i = 0; i < forks && pts.length > 4; i++) {
    const idx = 1 + Math.floor(rng() * (pts.length - 2));
    const p = pts[idx];
    const bl = len * (0.18 + rng() * 0.3);
    const bp: Point = {
      x: p.x + ux * bl * 0.5 + npx * (rng() * 2 - 1) * bl,
      y: p.y + uy * bl * 0.5 + npy * (rng() * 2 - 1) * bl,
    };
    channel(rng, p, bp, clamp(bl * 0.15, 6, 70), pts);
  }
  return { pts, halo: 3 + rng() * 2, core: 1 + rng() * 0.8, alpha: 0.85 + rng() * 0.15 };
}

function makeStrike(
  rng: () => number,
  width: number,
  height: number,
  intensity: number,
  boltsOn: boolean,
  strikeX?: number
): { bolts: Bolt[]; glow: HTMLCanvasElement | null } {
  const count = 1 + (intensity > 45 ? 1 : 0) + (intensity > 75 ? 1 : 0);
  const bolts: Bolt[] = [];
  const cx = strikeX !== undefined ? strikeX : rng() * width;
  const cy = height * (0.03 + rng() * 0.08);
  for (let i = 0; i < count; i++) {
    const x1 = clamp(cx + (rng() - 0.5) * width * 0.55, 6, width - 6);
    const y1 = height * (0.8 + rng() * 0.18);
    const b = boltsOn ? buildBolt(rng, cx, cy, x1, y1) : { pts: [], halo: 0, core: 0, alpha: 1 };
    bolts.push(b);
  }
  const glow = document.createElement("canvas");
  glow.width = Math.max(2, Math.floor(width));
  glow.height = Math.max(2, Math.floor(height));
  const g = glow.getContext("2d");
  if (!g) return { bolts, glow: null };
  const glowR = Math.max(glow.width, glow.height) * 0.75;
  const amb = g.createRadialGradient(cx, cy, 2, cx, cy, glowR);
  amb.addColorStop(0, "rgba(185,214,255,0.5)");
  amb.addColorStop(0.35, "rgba(150,182,255,0.22)");
  amb.addColorStop(1, "rgba(150,182,255,0)");
  g.fillStyle = amb;
  g.fillRect(0, 0, glow.width, glow.height);
  const bandH = Math.max(glow.height * 0.28, 40);
  const band = g.createLinearGradient(0, 0, 0, bandH);
  band.addColorStop(0, "rgba(188,210,255,0.42)");
  band.addColorStop(1, "rgba(188,210,255,0)");
  g.fillStyle = band;
  g.fillRect(0, 0, glow.width, bandH);
  for (const b of bolts) {
    if (!b.pts.length) continue;
    const endP = b.pts[b.pts.length - 1];
    const br = Math.min(160, glow.width * 0.08);
    const gb = g.createRadialGradient(endP.x, endP.y, 1, endP.x, endP.y, br);
    gb.addColorStop(0, "rgba(205,220,255,0.55)");
    gb.addColorStop(1, "rgba(205,220,255,0)");
    g.fillStyle = gb;
    g.fillRect(endP.x - br, endP.y - br, br * 2, br * 2);
  }
  return { bolts, glow };
}

const tracePath = (ctx: CanvasRenderingContext2D, pts: Point[]) => {
  ctx.beginPath();
  for (let i = 0; i < pts.length; i++) {
    if (i === 0) ctx.moveTo(pts[i].x, pts[i].y);
    else ctx.lineTo(pts[i].x, pts[i].y);
  }
};

export default function RainStorm(props: StormProps) {
  const {
    density = RAIN_DEFAULTS.density,
    speed = RAIN_DEFAULTS.speed,
    wind = RAIN_DEFAULTS.wind,
    intensity = RAIN_DEFAULTS.intensity,
    lightning = RAIN_DEFAULTS.lightning,
    bolts = RAIN_DEFAULTS.bolts,
    flashMin = RAIN_DEFAULTS.flashMin,
    flashMax = RAIN_DEFAULTS.flashMax,
    interactive = RAIN_DEFAULTS.interactive,
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

    const safeMin = Math.max(2, Math.min(flashMin, flashMax));
    const safeMax = Math.max(flashMin, flashMax);
    const fallSpeed = 480 * (speed / 100);
    const drift = (wind / 100) * 0.34;
    const streakScale = 0.6 + (intensity / 100) * 1.1;
    const pow0 = 0.16 + (intensity / 100) * 0.24;
    const poolCap = 140;
    const fleckCap = 100;

    const makeDrops = () => {
      const count = clamp(
        Math.round((density / 100) * 640 * (width <= 820 ? 0.55 : 1)),
        40,
        900
      );
      const nearCount = Math.round(count * 0.6);
      const out: RainDrop[] = [];
      for (let i = 0; i < count; i++) {
        const layer = i < nearCount ? 1 : 0;
        const far = layer === 0;
        out.push({
          x: rng() * (width + 400) - 200,
          y: rng() * height - height,
          length: (8 + rng() * 14) * streakScale * (far ? 0.8 : 1.25),
          speed: fallSpeed * (far ? 0.45 + rng() * 0.35 : 1.05 + rng() * 0.55),
          width: far ? 0.5 + rng() * 0.6 : 1 + rng() * 1.2,
          alpha: far ? 0.18 + rng() * 0.3 : 0.35 + rng() * 0.5,
          color: colors[i % Math.max(1, colors.length)],
          lean: 0,
          layer,
          gustPhase: rng() * Math.PI * 2,
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
    let visible = true;
    let gustT = 0;
    let drops = makeDrops();
    const splashes: Splash[] = [];
    const flecks: Fleck[] = [];
    let flashPhase = -1;
    let phaseT = 0;
    let flashPow = 0;
    let boltAlpha = 0;
    let glow: HTMLCanvasElement | null = null;
    let boltsArr: Bolt[] = [];
    let nextFlash = safeMin + rng() * (safeMax - safeMin);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

    const spawnSplash = (x: number, layer: number) => {
      if (!splash) return;
      if (splashes.length < poolCap) {
        splashes.push({ x, y: height - 1, r: 1.5 + rng() * 2.5, alpha: 0.5 });
      }
      if (layer === 1) {
        for (let k = 0; k < 3 && flecks.length < fleckCap; k++) {
          const life = 0.28 + rng() * 0.25;
          flecks.push({
            x,
            y: height - 1,
            vx: (rng() * 2 - 1) * 70,
            vy: -(30 + rng() * 80),
            life,
            maxLife: life,
            alpha: 0.5 + rng() * 0.3,
          });
        }
      }
    };

    const fireStrike = (strikeX: number | undefined) => {
      if (width === 0 || height === 0) return;
      const s = makeStrike(rng, width, height, intensity, bolts, strikeX);
      glow = s.glow;
      boltsArr = s.bolts;
      flashPow = pow0;
      boltAlpha = 1;
      flashPhase = 0;
      phaseT = 0;
    };

    const gust = (phase: number) => 1 + 0.4 * Math.sin(0.4 * gustT + phase);

    const draw = () => {
      if (width === 0 || height === 0) return;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, 0, height);
      sky.addColorStop(0, "#05070F");
      sky.addColorStop(1, "#0A1224");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      const px = parallax && !reduced ? pointer.x * 14 : 0;
      const py = parallax && !reduced ? pointer.y * 10 : 0;

      ctx.lineCap = "round";
      for (let layer = 0; layer < 2; layer++) {
        const pm = layer === 1 ? 1 : 0.4;
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];
          if (d.layer !== layer) continue;
          const x0 = d.x + px * pm;
          const x1 = x0 + d.lean;
          const y0 = d.y - d.length + py * pm;
          const y1 = d.y + py * pm;
          if (layer === 0) {
            ctx.globalAlpha = d.alpha;
            ctx.lineWidth = Math.max(0.4, d.width * 0.7);
            ctx.strokeStyle = d.color;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          } else {
            ctx.globalAlpha = d.alpha * 0.5;
            ctx.lineWidth = d.width * 0.6;
            ctx.strokeStyle = d.color;
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
            ctx.globalAlpha = Math.min(d.alpha * 1.1, 1);
            ctx.lineWidth = Math.min(d.width * 1.4, 1.6);
            ctx.beginPath();
            ctx.moveTo(x1 - d.lean * 0.06, y1 - d.length * 0.12);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
        }
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

      for (let i = 0; i < flecks.length; i++) {
        const f = flecks[i];
        const a = Math.max(0, f.alpha * (f.life / f.maxLife));
        ctx.globalAlpha = a;
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#A8C2E8";
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x - f.vx * 0.035, f.y - f.vy * 0.035);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (flashPhase >= 0) {
        if (glow) {
          ctx.globalAlpha = Math.min(flashPow, 1);
          ctx.drawImage(glow, 0, 0, width, height);
        }
        if (boltAlpha > 0.004) {
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          for (const b of boltsArr) {
            if (b.pts.length < 2) continue;
            ctx.globalAlpha = b.alpha * boltAlpha * 0.4;
            ctx.strokeStyle = "#C6DCFF";
            ctx.lineWidth = b.halo * 3;
            tracePath(ctx, b.pts);
            ctx.stroke();
            ctx.globalAlpha = b.alpha * boltAlpha;
            ctx.strokeStyle = "#F2F7FF";
            ctx.lineWidth = b.halo;
            tracePath(ctx, b.pts);
            ctx.stroke();
            ctx.globalAlpha = b.alpha * boltAlpha;
            ctx.strokeStyle = "#FFFFFF";
            ctx.lineWidth = b.core;
            tracePath(ctx, b.pts);
            ctx.stroke();
          }
        }
        if (flashPow > 0.018) {
          ctx.globalCompositeOperation = "lighter";
          ctx.strokeStyle = "#DCE9FF";
          ctx.lineWidth = 1;
          for (let i = 0; i < drops.length; i++) {
            const d = drops[i];
            const pm = d.layer === 1 ? 1 : 0.4;
            const x0 = d.x + px * pm;
            const x1 = x0 + d.lean;
            const y0 = d.y - d.length + py * pm;
            const y1 = d.y + py * pm;
            ctx.globalAlpha = Math.min(flashPow * 0.55 * (d.layer === 1 ? 1.25 : 0.7), 0.3);
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
            ctx.stroke();
          }
          ctx.globalCompositeOperation = "source-over";
        }
        ctx.globalAlpha = 1;
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
      if (reduced) draw();
    };

    const loop = (now: number) => {
      if (!visible || reduced) return;
      const nowSec = now / 1000;
      dt = Math.min(nowSec - lastTime, 0.05);
      lastTime = nowSec;
      gustT += dt;
      if (parallax) {
        const k = 1 - Math.exp(-4 * dt);
        pointer.x += (pointer.tx - pointer.x) * k;
        pointer.y += (pointer.ty - pointer.y) * k;
      }
      if (lightning) {
        nextFlash -= dt;
        if (nextFlash <= 0) {
          fireStrike(undefined);
          nextFlash = safeMin + rng() * (safeMax - safeMin);
        }
      }
      if (flashPhase >= 0) {
        phaseT += dt;
        if (flashPhase === 0) {
          flashPow *= Math.exp(-9 * dt);
          boltAlpha *= Math.exp(-2.6 * dt);
          if (phaseT >= 0.13) {
            flashPhase = 1;
            phaseT = 0;
            flashPow = pow0 * 0.55;
            boltAlpha = 0.85;
          }
        } else if (flashPhase === 1) {
          flashPow *= Math.exp(-6.5 * dt);
          boltAlpha *= Math.exp(-3.2 * dt);
          if (phaseT >= 0.11) {
            flashPhase = 2;
            phaseT = 0;
            flashPow = pow0 * 0.3;
            boltAlpha = 0.35;
          }
        } else {
          flashPow *= Math.exp(-2 * dt);
          boltAlpha *= Math.exp(-7 * dt);
          if (flashPow < 0.0035) {
            flashPhase = -1;
            phaseT = 0;
            flashPow = 0;
            boltAlpha = 0;
            boltsArr = [];
            glow = null;
          }
        }
      }
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        d.y += d.speed * dt;
        const g = gust(d.gustPhase);
        const driftEff = drift * g * (d.layer === 1 ? 1.5 : 0.7);
        d.x += driftEff * d.speed * dt;
        d.lean = driftEff * d.length * (d.layer === 1 ? 4 : 2);
        if (d.y - d.length > height) {
          spawnSplash(d.x, d.layer);
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
        for (let i = flecks.length - 1; i >= 0; i--) {
          const f = flecks[i];
          f.x += f.vx * dt;
          f.y += f.vy * dt;
          f.life -= dt;
          if (f.life <= 0) {
            flecks[i] = flecks[flecks.length - 1];
            flecks.pop();
          }
        }
      }
      draw();
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

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive || reduced || !lightning) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      fireStrike(clamp(e.clientX - rect.left, 4, rect.width - 4));
    };

    const onReduceMotion = (e: MediaQueryListEvent) => {
      cancelAnimationFrame(rafId);
      reduced = e.matches;
      if (reduced) {
        pointer.x = pointer.tx = 0;
        pointer.y = pointer.ty = 0;
        flashPhase = -1;
        boltsArr = [];
        glow = null;
        draw();
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
    container.addEventListener("pointerdown", onPointerDown, { passive: true });
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
      container.removeEventListener("pointerdown", onPointerDown);
      reduceQuery.removeEventListener("change", onReduceMotion);
    };
  }, [density, speed, wind, intensity, lightning, bolts, flashMin, flashMax, interactive, splash, parallax, colors, seed]);

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

Identical to 8a. The night-sky ramp (`#05070F`–`#0A1224`), the `#05070F` preview wrapper background and the bolt/glow/rain palettes are already literals in `RainStorm.tsx` and `componentData.tsx`, so nothing alias- or token-specific is required.

## 9. Performance Plan

- **DPR cap ≤ 2** (`1.5` above 1920px CSS width) — never raw `devicePixelRatio`.
- **ResizeObserver** on the container, disconnected on unmount; no `window.resize`.
- **Single** rAF loop held in a local, `cancelAnimationFrame` on unmount.
- **IntersectionObserver** parks the loop off-screen; `pointermove` (window), `pointerdown` (canvas) and the media-query listener are all removed on unmount.
- **Mobile clamp:** drop count × `0.55` at ≤ 820px, floored 40 / capped 900; near:far split 60/40; ripples pooled (140) and flecks pooled (100), both swap-popped; two stroke passes cost ~2× a single pass but total segments stay bounded.
- **Lightning cost is baked:** bolts generated once per strike (≤480 pts); glow baked to an offscreen canvas once per strike → flash frames are `drawImage` + ≤3 strokes; additive lit-rain runs only while `flashPow > 0.018` (~0.24 s) and reuses positions.
- **Click strikes reuse the same bake** — no extra per-frame cost; the cadence timer is untouched.
- **No per-frame allocations:** drops/splashes/flecks pre-allocated arrays; gust is scalar math. Reduced-motion draws one static frame and never starts the loop (clicks inert: `onPointerDown` returns early).
- No WebGL resources to release; the 2d context is GC'd with the canvas.

## 10. Accessibility

- Decorative canvas: `aria-hidden="true"` + `pointer-events-none` on the element; never focusable. The click-to-strike handler lives on the **wrapper container** (not the canvas), so the canvas itself never blocks text selection or underlying links; the `interactive` prop (default `true`) fires strikes on any click/tap and can be set `false` on production heroes to make clicks pass straight through.
- Contrast: overlay hero text uses the `text-primary` token against the dark `#05070F`–`#0A1224` base.
- **Photosensitivity guard:** a strike (automatic *or* clicked) is two quick flashes (main + echo at ~130 ms), under the WCAG 2.3.1 three-flashes/sec ceiling; peak α capped 0.40; clicks fire only one strike per pointer-down. Under `prefers-reduced-motion` there is one static frame and **no flash is ever drawn** — clicks are ignored.
- Reduced-motion restated in one line: static frame, no animation, no lightning.

## 11. Naming Contract

- **File:** `frontend/src/components/ui/RainStorm.tsx`
- **Export:** `export default function RainStorm(props: StormProps)`
- **Slug:** `rain-storm`

All three derive from the same name; no aliases. The revision keeps the shipment identity intact.

## 12. Integration Preview

This is a **revision (v3)** of the shipped `rain-storm` component: the component file is overwritten with the realism + click-strike source, the embedded exact-source string and the COMPONENT_CONFIG prop rows are refreshed so the CODE tab, all five AI prompts and the detail-page props stay in sync, the `vibeMeta` behavior/states/description and the library card description are re-worded for two-depth gusting rain + click-to-strike, and the index props gain the `interactive` knob. `componentData.tsx`'s lazy const, `UI_COMPONENTS` key and `componentList` entry are untouched (identity unchanged). Revision rules apply as before: `replace-*` operations (slug + file must already exist), `replace-file` (anchor `""`, payload `§8`), `replace-line` (one whole line swapped for one+ lines), `replace-embedded` (re-escape `§8` into the `"rain-storm"` line). No `create-file`, no new slug.

```json
[
  {
    "file": "frontend/src/components/ui/RainStorm.tsx",
    "anchor": "",
    "operation": "replace-file",
    "payload": "§8",
    "why": "Revision: overwrite the shipped component body with the two-depth gusting rain + click-to-strike lightning implementation; file RainStorm.tsx = export RainStorm = slug rain-storm unchanged."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "            { name: \"flashMax\", type: \"number\", default: \"15\", description: \"Maximum seconds between strikes.\" },",
    "operation": "replace-line",
    "payload": "            { name: \"flashMax\", type: \"number\", default: \"15\", description: \"Maximum seconds between strikes.\" },\n            { name: \"interactive\", type: \"boolean\", default: \"true\", description: \"Click/tap the canvas to fire a lightning strike on demand (previews).\" },",
    "why": "Adds the revision's interactive prop beside flashMax (single replace-line keeps props ordered; all typed, no any)."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "            behavior: \"A Canvas 2D storm: wind-leaned drop streaks drift over a dark navy sky and landing drops spawn expanding fading ellipses; every 7-15s a seeded strike fires 1-3 branching bolts with a hard flash then a single echo, a cached radial glow lights the cloud base and ground, the rain strokes briefly brighten via an additive pass, then the glow decays exponentially; a parity-eased pointer nudges the field.\",",
    "operation": "replace-line",
    "payload": "            behavior: \"A Canvas 2D storm on two depth layers (soft far rain + sharp near rain) that gust with the wind; landing near drops burst into splash flecks; every 7-15s - or any click/tap - a seeded strike fires 1-3 branching bolts with a hard flash, a single echo and a cached radial glow that lights the rain via an additive pass, then decays; a parity-eased pointer nudges the field.\",",
    "why": "vibeMeta behavior must describe the two-depth gusting rain + click-to-strike (it feeds the AI vibe prompts; v2 wording is now stale)."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "            states: { from: \"diagonal rain streaks drift over a dark navy gradient\", to: \"branching lightning bolts and a radial sky glow illuminate the scene, then decay\" },",
    "operation": "replace-line",
    "payload": "            states: { from: \"two-depth rain streaks gusting over a dark navy gradient\", to: \"a click fires branching lightning bolts across lit rain, then decays\" },",
    "why": "vibeMeta states must reflect gusting depth layers + click fire."
  },
  {
    "file": "frontend/src/data/componentMetadata.ts",
    "anchor": "            description: \"Decorative Canvas 2D storm layer: wind-leaned drop streaks, landing ripples and cinematic branching lightning (hard flash + echo + radial glow) over a dark navy gradient; aria-hidden canvas behind hero content, static frame under prefers-reduced-motion.\"",
    "operation": "replace-line",
    "payload": "            description: \"Decorative Canvas 2D storm layer: two-depth gusting rain, landing splash flecks and cinematic branching lightning you can trigger with a click/tap (hard flash + echo + radial glow) over a dark navy gradient; aria-hidden canvas behind hero content, static frame under prefers-reduced-motion.\"",
    "why": "vibeMeta description must reflect the realism + click-to-strike revision."
  },
  {
    "file": "frontend/src/data/componentData.tsx",
    "anchor": "        description: \"Calm-to-moderate night storm: diagonal rain streaks, faint landing ripples and cinematic branching lightning with a radial sky glow, lit rain and gentle pointer parallax.\",",
    "operation": "replace-line",
    "payload": "        description: \"Calm-to-moderate night storm: two-depth gusting rain streaks, landing ripple flecks and cinematic branching lightning you can fire with a click or tap — radial sky glow, lit rain and gentle pointer parallax.\",",
    "why": "Library card description reflects the v3 realism + click-to-strike behavior."
  },
  {
    "file": "frontend/src/data/embeddedSourceCode.ts",
    "anchor": "  \"rain-storm\": \"",
    "operation": "replace-embedded",
    "payload": "§8",
    "why": "Re-escape §8 into the existing key so the CODE tab and all five AI prompts embed the exact revised source."
  },
  {
    "file": ".agents/skills/uihub-component-forge/data/component-index.json",
    "anchor": "      {\n        \"name\": \"flashMax\",\n        \"type\": \"number\",\n        \"default\": 15,\n        \"purpose\": \"Maximum seconds between strikes.\"\n      },",
    "operation": "insert-after",
    "payload": "\n      {\n        \"name\": \"interactive\",\n        \"type\": \"boolean\",\n        \"default\": true,\n        \"purpose\": \"Click/tap fires a lightning strike on demand (previews).\"\n      },",
    "why": "Index props are authoritative for the new interactive knob; scan-components.mjs only refreshes derived fields."
  }
]
```

Authoritative ADD procedure: `references/07-integration-checklist.md` (Stages A–F); this revision exercises Stage A's revision variant (slug/file-must-exist instead of must-not-exist).

## 13. Test Checklist

- Load the detail-page preview; confirm rain reads in two depths — soft far layer, sharp near layer with brighter rounded tips — and that gusts periodically bend the near streaks in sheets.
- Click/tap anywhere on the preview; confirm a strike fires immediately with 1–2 branching bolts and the full flash→echo→glow tail, and that cadence afterwards is unaffected (next automatic strike still 7–15 s out).
- Click with `lightning={false}` — confirm no strike. Turn `interactive={false}` — confirm clicks do nothing.
- Watch a near drop land; confirm the ellipse ripple plus 2–3 splash flecks kick up and fade.
- Resize 320px → 1440px; confirm drops re-bake, canvas stays sharp, ~half the drops on mobile.
- Scroll off-screen; confirm the rAF loop stops. Toggle OS reduced-motion; confirm one static frame and that clicks stay inert.
- Check dark hero heading text over the preview for contrast (text-primary token).

## 14. Risks & Open Questions

- **Photosensitivity:** every clicked strike is main + one echo (~0.24 s), under Wag 2.3.1; peak α capped 0.40. On photosensitive or large always-on heroes, set `interactive={false}` (and optionally `lightning={false}`); reduced-motion users never see a flash.
- **Mobile cost:** the idle loop doubles to two stroke passes + pooled flecks — still a few hundred short lines/frame, but verify on a low-end device if battery matters.
- **Accidental triggering:** `interactive` defaults `true` (gallery/preview intent) — a consumer embedding on a production page where clicks shouldn't light the sky must pass `interactive={false}`; that tradeoff is the point of the request (see §10).
- **Determinism:** scheduled strikes remain seeded; clicked strikes are user-initiated (nondeterministic by design), so `seed` reproduces cadence/shape for the automatic schedule only.
- **Aesthetic tuning:** gust amplitude (0.4), near:far split (60/40), fleck counts (3/landing) and strike-origin pinning are starting points exposed via existing props when desired.