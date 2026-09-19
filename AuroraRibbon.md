# AuroraRibbon (`aurora-ribbon`)

> Interactive Background — Canvas2D aurora curtains that flow and bend toward the pointer.
> Blueprint: UI HUB component-builder skill (ui-hub-component-builder, Interactive Background).

## AI Builder Prompt

Build a self-contained React 19 + TypeScript component named `AuroraRibbon`
(located at `frontend/src/components/ui/AuroraRibbon.tsx`) that renders a
full-bleed animated **aurora borealis curtain** background on a single Canvas2D.

Requirements — MUST:
- Zero new dependencies (uses `react` only). No WebGPU, no three.js, no framer-motion.
- Canvas is `position: absolute; inset: 0; width: 100%; height: 100%`,
  `pointer-events: none`, with a meaningful `aria-label`.
- N layered vertical curtain strands (default `curtainCount = 4`) sampled down the
  full height. Each curtain X-position = base column + two sinusoidal waves
  (`sin(y*freq + t*speed + phase)` + a half-frequency counter-wave), so they sway and flow.
- Pointer interaction (default `interactive = true`): listen to `pointermove` on window,
  normalize to the cached container rect (never read layout per event), and bend curtains
  toward the pointer X with a Gaussian falloff around the pointer Y
  (`bend = exp(-((y - pointerY)^2) / (2 * (height * 0.15)^2))`).
  Chase the pointer each frame with exponential lerp `1 - exp(-rate * dt)` (rate ~3.5).
- Render: one `requestAnimationFrame` loop driven through refs only (NO `useState` per
  frame). Draw each curtain as a smooth polyline (quadraticCurveTo through midpoints),
  stroked twice per curtain (a wide soft `shadowBlur` halo pass + a thin core pass),
  gradient stroke via `createLinearGradient` fading `top -> bottom` to transparent,
  `globalCompositeOperation = 'lighter'` for the additive aurora glow.
- Keep per-frame allocations minimal (one point array + one gradient per curtain per
  frame is acceptable; no per-frame gradient/sprites for particles).
- Resize: `ResizeObserver` + DPR cap `Math.min(devicePixelRatio, 2)`;
  `ctx.setTransform(dpr,0,0,dpr,0,0)`; rebuild curtain state on resize.
- Reduced motion: `matchMedia('(prefers-reduced-motion: reduce)')` — if active, draw a
  single static frame and do NOT start the loop; re-read on media-query change.
- Cleanup all listeners, the ResizeObserver, the rAF id, and the media-query listener on unmount (StrictMode-safe).
- Matches UI-HUB visual language: dark surroundings, cyan/green/violet/pink palette,
  selection accent `#3D5CFF` for the soft horizon glow.
- Props: `className?: string`, `curtainCount?: number` (default 4),
  `interactive?: boolean` (default true), `speed?: number` (default 1).
- Named export `AuroraRibbon` + default export. Works at 320px → 1440px+ and inside
  `min-h-[380px]` library preview cards. `<canvas>` fills its parent container.

Do NOT add pointer text, tooltips, or content — the canvas is a pure decorative layer.

## Reference Implementation

```tsx
import React, { useEffect, useRef } from 'react';

interface AuroraCurtain {
    baseX: number;
    phase: number;
    speed: number;
    freq: number;
    amplitude: number;
    thickness: number;
    alpha: number;
    hue: number;
    sat: number;
    lightness: number;
}

interface AuroraRibbonProps {
    className?: string;
    curtainCount?: number;
    interactive?: boolean;
    speed?: number;
}

const PALETTE = [
    { h: 190, s: 95, l: 68 },   // cyan
    { h: 155, s: 90, l: 62 },   // green
    { h: 280, s: 90, l: 68 },   // violet
    { h: 330, s: 90, l: 72 },   // pink
];

const N_POINTS = 90;

export const AuroraRibbon: React.FC<AuroraRibbonProps> = ({
    className = '',
    curtainCount = 4,
    interactive = true,
    speed = 1,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        let width = 0;
        let height = 0;
        let rafId = 0;
        let lastTime = performance.now();
        let reduced = reduceMotionQuery.matches;

        const pointer = { x: 0.5, y: 0.35, tx: 0.5, ty: 0.35 };
        let curtains: AuroraCurtain[] = [];

        const buildCurtains = () => {
            curtains = Array.from({ length: curtainCount }, (_, i) => {
                const p = PALETTE[i % PALETTE.length];
                return {
                    baseX:
                        (width * (i + 0.5)) / curtainCount +
                        (Math.random() - 0.5) * (width / curtainCount) * 0.35,
                    phase: Math.random() * Math.PI * 2,
                    speed: (0.5 + Math.random() * 0.6) * speed,
                    freq: (2.0 + Math.random() * 1.5) * ((Math.PI * 2) / Math.max(height, 1)),
                    amplitude: width * (0.05 + Math.random() * 0.06),
                    thickness: 2 + Math.random() * 2.5,
                    alpha: 0.14 + Math.random() * 0.14,
                    hue: p.h + (Math.random() - 0.5) * 16,
                    sat: p.s,
                    lightness: p.l,
                };
            });
        };

        const drawFrame = (t: number) => {
            if (width === 0 || height === 0) return;

            ctx.clearRect(0, 0, width, height);

            const xCur = pointer.x * width;
            const yCur = pointer.y * height;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (const c of curtains) {
                const pts: { x: number; y: number }[] = [];
                for (let i = 0; i <= N_POINTS; i++) {
                    const y = (i / N_POINTS) * height;
                    const wave =
                        Math.sin(y * c.freq + t * c.speed + c.phase) * c.amplitude +
                        Math.sin(y * c.freq * 0.55 - t * c.speed * 0.75 + c.phase * 1.7) *
                            c.amplitude *
                            0.35;
                    const dy = y - yCur;
                    const bend = Math.exp(-(dy * dy) / (2 * Math.pow(height * 0.15, 2)));
                    const x = c.baseX + wave + (xCur - c.baseX) * bend * 0.4;
                    pts.push({ x, y });
                }

                const grad = ctx.createLinearGradient(0, 0, 0, height);
                grad.addColorStop(0, `hsla(${c.hue}, ${c.sat}%, ${c.lightness}%, ${c.alpha})`);
                grad.addColorStop(0.55, `hsla(${c.hue}, ${c.sat}%, ${c.lightness}%, ${c.alpha * 0.6})`);
                grad.addColorStop(1, `hsla(${c.hue}, ${c.sat}%, ${c.lightness}%, 0)`);

                ctx.shadowColor = `hsla(${c.hue}, ${c.sat}%, ${c.lightness}%, 0.45)`;

                for (let pass = 0; pass < 2; pass++) {
                    ctx.strokeStyle = grad;
                    ctx.shadowBlur = pass === 0 ? 22 : 0;
                    ctx.lineWidth = pass === 0 ? c.thickness * 2.2 : c.thickness;
                    ctx.globalAlpha = pass === 0 ? c.alpha * 0.5 : 1;

                    ctx.beginPath();
                    ctx.moveTo(pts[0].x, pts[0].y);
                    for (let i = 1; i < pts.length - 1; i++) {
                        const p = pts[i];
                        const n = pts[i + 1];
                        ctx.quadraticCurveTo(p.x, p.y, (p.x + n.x) / 2, (p.y + n.y) / 2);
                    }
                    const last = pts[pts.length - 1];
                    ctx.lineTo(last.x, last.y);
                    ctx.stroke();
                }
            }

            ctx.restore();

            const horizon = ctx.createLinearGradient(0, height * 0.75, 0, height);
            horizon.addColorStop(0, 'rgba(61, 92, 255, 0)');
            horizon.addColorStop(1, 'rgba(61, 92, 255, 0.1)');
            ctx.fillStyle = horizon;
            ctx.fillRect(0, height * 0.75, width, height * 0.25);
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            if (width === 0 || height === 0) return;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(width * dpr);
            canvas.height = Math.floor(height * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildCurtains();
            drawFrame(2.4);
        };

        const loop = (now: number) => {
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            const lerp = 1 - Math.exp(-3.5 * dt);
            pointer.x += (pointer.tx - pointer.x) * lerp;
            pointer.y += (pointer.ty - pointer.y) * lerp;
            drawFrame(now / 1000);
            rafId = requestAnimationFrame(loop);
        };

        const onPointerMove = (e: PointerEvent) => {
            if (width === 0) return;
            const rect = canvas.getBoundingClientRect();
            pointer.tx = (e.clientX - rect.left) / rect.width;
            pointer.ty = (e.clientY - rect.top) / rect.height;
        };

        const onReduceMotionChange = (e: MediaQueryListEvent) => {
            cancelAnimationFrame(rafId);
            reduced = e.matches;
            if (reduced) {
                pointer.x = pointer.tx = 0.5;
                pointer.y = pointer.ty = 0.35;
                drawFrame(2.4);
                return;
            }
            lastTime = performance.now();
            rafId = requestAnimationFrame(loop);
        };

        const ro = new ResizeObserver(resize);
        ro.observe(canvas);

        if (interactive && !reduced) {
            window.addEventListener('pointermove', onPointerMove);
        }

        reduceMotionQuery.addEventListener('change', onReduceMotionChange);

        resize();

        if (!reduced) {
            lastTime = performance.now();
            rafId = requestAnimationFrame(loop);
        }

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            window.removeEventListener('pointermove', onPointerMove);
            reduceMotionQuery.removeEventListener('change', onReduceMotionChange);
        };
    }, [curtainCount, interactive, speed]);

    return (
        <canvas
            ref={canvasRef}
            aria-label="Animated aurora ribbon background"
            className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
        />
    );
};

export default AuroraRibbon;
```

## Registration notes (integration skill)

- **File:** `frontend/src/components/ui/AuroraRibbon.tsx`
- **Slug:** `aurora-ribbon` · **Category:** `Backgrounds`
- Add lazy import + entry to `componentData.tsx`, exact source to `embeddedSourceCode.ts`, props/vibeMeta to `componentMetadata.ts`
- Append `aurora-ribbon` to `scripts/announcement/capture-previews.mjs` preview list
- Validate: `npm run lint`, `npm run build`