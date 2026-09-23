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