// comet-trail — UI HUB
// A blue comet drifting through deep space on a pure-black stage. A fixed white
// head (271, 286) sits inside a wide radial cyan→deep-blue halo drawn with
// additive blending, trailing ~3,200 small dots that stream up-and-right along a
// 34° axis at ~240 px/s, spread by a distance-widening Gaussian and coloured
// cyan → blue → indigo by distance from the head (plus a few grey specks). An
// ~800-star field in three depth layers drifts the same way at three speeds with
// a soft twinkle. The pointer (mouse or touch) pushes tail particles and stars
// away within a 95 px radius with a smooth falloff and parallaxes the nearer
// stars; a click/tap emits an expanding 340 px/s ring that shoves particles
// outward and flares the comet head, the head glow swells near the pointer, a
// small ring cursor is drawn, and a faint hint fades out after first contact.
// Everything is periodic in a seamless 4.56 s loop (33.3 fps) off a seeded RNG.
//
// Ported verbatim from the reference 560x560 canvas template — all simulation
// math, colour stops, layer constants and per-frame easing are kept unchanged.
// The standalone authoring chrome (control bar, scrubber, legend, inspect
// tooltip, seek/play API, capture mode) is removed; the canvas is cover-fitted
// to its stage by a ResizeObserver so the scene fills any preview box edge-to-
// edge (overflow centred and clipped). No third-party runtime: browser Canvas 2D
// + React.

import * as React from "react";
import { useEffect, useRef } from "react";

export interface CometTrailProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** Whether to show the bottom interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint. */
    hintText?: string;
    /** Whether the pointer scatters the tail / stars and clicks fire a shockwave (default true). */
    interactive?: boolean;
}

/* ================================================================
   DATA — measured from the source (560x560, 38 frames @ 30 ms)
   ================================================================ */
const W = 560, H = 560;
const FPS = 1000 / 30;            /* 33.33 fps, as in the source              */
const DUR = 4.56;                 /* 152 frames = 4 source cycles, seamless   */

const BACKGROUND_COLOR = "#000000";
const TAU = Math.PI * 2;

const HEAD = { x: 271, y: 286 };                   /* comet head, fixed in frame */
const TAIL_ANGLE = 34 * Math.PI / 180;             /* tail axis, up and to the right */
const TD = [Math.cos(TAIL_ANGLE), -Math.sin(TAIL_ANGLE)];
const TP = [Math.sin(TAIL_ANGLE),  Math.cos(TAIL_ANGLE)];
const STAR_ANGLE = 37 * Math.PI / 180;             /* star drift direction */
const SD = [Math.cos(STAR_ANGLE), -Math.sin(STAR_ANGLE)];
const SP = [Math.sin(STAR_ANGLE),  Math.cos(STAR_ANGLE)];

/* ---------- deterministic helpers ---------- */
function mulberry32(seed: number) {
    return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/* ---------- star field: a periodic field in (u along drift, v across) ---------- */
const LU = 860;                                  /* field length, covers the canvas diagonal */
interface StarLayer { n: number; j: number; r: [number, number]; a: [number, number]; }
const STAR_LAYERS: StarLayer[] = [
    { n: 450, j: 1, r: [0.5, 0.85], a: [0.35, 0.65] },   /* far, slow, dim      */
    { n: 300, j: 2, r: [0.75, 1.2], a: [0.6, 0.9] },     /* mid, ~380 px/s      */
    { n: 55,  j: 3, r: [1.2, 1.9],  a: [0.8, 1.0] }      /* near, fast, bright  */
];
interface Star { u0: number; v: number; j: number; r: number; a: number; c: string; k: number; ph: number; }
const STARS: Star[] = (function () {
    const rnd = mulberry32(7), out: Star[] = [];
    const tints = ["#e6ecf8", "#dbe6ff", "#fff2dd", "#cfe3ff", "#ffffff"];
    for (const L of STAR_LAYERS) {
        for (let i = 0; i < L.n; i++) {
            out.push({ u0: rnd() * LU, v: (rnd() - 0.5) * LU, j: L.j,
                       r: L.r[0] + rnd() * (L.r[1] - L.r[0]),
                       a: L.a[0] + rnd() * (L.a[1] - L.a[0]),
                       c: tints[(rnd() * tints.length) | 0],
                       k: 1 + ((rnd() * 3) | 0), ph: rnd() });
        }
    }
    return out;
})();

/* ---------- tail particles: flow along the axis, periodic over DUR ---------- */
const LT = 547;                                  /* particle lane length */
const TAIL_SPEED_J = 2;                          /* 2 lanes per loop = 2*547/4.56 = 240 px/s */
const COLOR_STOPS: number[][] = [                /* distance from head -> rgb, from the source */
    [0, 40, 180, 235], [30, 19, 156, 219], [90, 1, 153, 214], [150, 2, 130, 212],
    [210, 7, 73, 213], [270, 23, 37, 213], [330, 25, 23, 211], [420, 30, 18, 200], [547, 30, 18, 200]
];
function tailRGB(u: number): number[] {
    for (let i = 1; i < COLOR_STOPS.length; i++) {
        const a = COLOR_STOPS[i - 1], b = COLOR_STOPS[i];
        if (u <= b[0]) { const k = (u - a[0]) / (b[0] - a[0]);
            return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k]; }
    }
    const e = COLOR_STOPS[COLOR_STOPS.length - 1]; return [e[1], e[2], e[3]];
}
interface Particle { u0: number; z: number; r: number; b: number; wk: number; wph: number; wamp: number; debris: boolean; }
const PARTICLES: Particle[] = (function () {
    const rnd = mulberry32(21), out: Particle[] = [];
    const gauss = () => { const z = Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(TAU * rnd());
                          return Math.max(-2.6, Math.min(2.6, z)); };
    for (let i = 0; i < 3200; i++) {
        out.push({ u0: rnd() * LT, z: gauss(), r: 0.6 + rnd() * 0.55, b: 0.92 + rnd() * 0.36,
                   wk: 1 + ((rnd() * 3) | 0), wph: rnd(), wamp: 0.3 + rnd() * 0.9, debris: false });
    }
    for (let i = 0; i < 10; i++) {                 /* the larger grey specks drifting inside the tail */
        out.push({ u0: 90 + rnd() * 300, z: gauss() * 0.7, r: 1.9 + rnd() * 0.8, b: 1,
                   wk: 1, wph: rnd(), wamp: 0.5, debris: true });
    }
    return out;
})();

/* ---------- mouse / touch interaction state (per instance) ---------- */
interface Wave { x: number; y: number; t0: number; }
interface Fx {
    tx: number; ty: number; sx: number; sy: number; act: number; px: number; py: number;
    now: number; waves: Wave[]; dx: number; dy: number;
    REPEL_R: number; REPEL_F: number; WAVE_SPEED: number;
    disturb(x: number, y: number, k: number): void;
}

export const CometTrail: React.FC<CometTrailProps> = ({
    className = "",
    style = {},
    showHint = true,
    hintText = "Move to scatter the tail · click or tap for a shockwave",
    interactive = true,
}) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const stage = stageRef.current;
        const cv = canvasRef.current;
        if (!stage || !cv) return;

        cv.width = W;
        cv.height = H;
        const ctx = cv.getContext("2d", { alpha: true });
        if (!ctx) return;
        ctx.imageSmoothingEnabled = true;

        /* Cover-fill: the 560x560 buffer keeps its aspect ratio but is scaled by
           the larger axis so it fills the stage edge-to-edge in any preview box.
           The overflow is centred and clipped by the root's overflow-hidden, so
           the animation always perfectly fills the preview section. */
        const fit = () => {
            const r = stage.getBoundingClientRect();
            if (!r.width || !r.height) return;
            const s = Math.max(r.width / W, r.height / H);
            cv.style.width = `${Math.ceil(W * s)}px`;
            cv.style.height = `${Math.ceil(H * s)}px`;
        };
        const ro = new ResizeObserver(fit);
        ro.observe(stage);
        fit();

        const REDUCED = typeof window.matchMedia === "function"
            ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
            : false;

        /* ---------- interaction state ----------
           sx, sy   smoothed pointer position in canvas pixels
           act      0..1, fades in when the pointer is over the canvas
           px, py   parallax offset, -1..1 across the canvas
           waves    click shockwaves { x, y, t0 }                              */
        const FX: Fx = {
            tx: 280, ty: 280, sx: 280, sy: 280, act: 0, px: 0, py: 0,
            now: 0, waves: [], dx: 0, dy: 0,
            REPEL_R: 95,            /* radius of the push around the pointer, px  */
            REPEL_F: 42,            /* max push strength, px                       */
            WAVE_SPEED: 340,        /* shockwave expansion, px/s                   */
            /* Writes the displacement for a point at (x, y) into FX.dx / FX.dy. k scales the strength. */
            disturb(x: number, y: number, k: number) {
                let dx = 0, dy = 0;
                if (this.act > 0.01) {
                    const ex = x - this.sx, ey = y - this.sy, d2 = ex * ex + ey * ey, R = this.REPEL_R;
                    if (d2 < R * R) {
                        const d = Math.sqrt(d2) || 1, q = 1 - d / R, push = q * q * this.REPEL_F * this.act * k;
                        dx += ex / d * push; dy += ey / d * push;
                    }
                }
                for (const w of this.waves) {
                    const age = this.now - w.t0, ex = x - w.x, ey = y - w.y, d = Math.sqrt(ex * ex + ey * ey) || 1;
                    const e = (d - age * this.WAVE_SPEED) / 28;
                    const push = Math.exp(-e * e) * Math.exp(-age * 2.2) * 34 * k;
                    dx += ex / d * push; dy += ey / d * push;
                }
                this.dx = dx; this.dy = dy;
            }
        };

        /* ---------- painters (f = frame number, time is f / FPS) ---------- */
        const paintStars = (f: number) => {
            const t = f / FPS;
            for (const s of STARS) {
                const u = ((s.u0 + s.j * LU * t / DUR) % LU) - LU / 2;
                let sx = 280 + u * SD[0] + s.v * SP[0] - FX.px * s.j * 7;   /* parallax: nearer stars shift more */
                let sy = 280 + u * SD[1] + s.v * SP[1] - FX.py * s.j * 7;
                FX.disturb(sx, sy, 0.5); sx += FX.dx; sy += FX.dy;
                if (sx < -3 || sx > W + 3 || sy < -3 || sy > H + 3) continue;
                const tw = 0.78 + 0.22 * Math.sin(TAU * (s.k * t / DUR + s.ph));
                ctx.globalAlpha = Math.min(1, s.a * tw);
                ctx.fillStyle = s.c;
                ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, TAU); ctx.fill();
            }
            ctx.globalAlpha = 1;
        };
        const paintTail = (f: number) => {
            const t = f / FPS;
            for (const q of PARTICLES) {
                const u = (q.u0 + TAIL_SPEED_J * LT * t / DUR) % LT;
                const lat = q.z * (2.4 + 0.075 * u) + q.wamp * Math.sin(TAU * (q.wk * t / DUR + q.wph));
                let px = HEAD.x + u * TD[0] + lat * TP[0];
                let py = HEAD.y + u * TD[1] + lat * TP[1];
                FX.disturb(px, py, 1); px += FX.dx; py += FX.dy;
                if (px < -4 || px > W + 4 || py < -4 || py > H + 4) continue;
                let a = u < 14 ? u / 14 : 1;
                if (q.debris) { ctx.fillStyle = "rgb(196,198,206)"; a *= 0.85; }
                else {
                    const c = tailRGB(u), b = q.b;
                    ctx.fillStyle = "rgb(" + Math.min(255, c[0] * b | 0) + "," + Math.min(255, c[1] * b | 0) + "," +
                                    Math.min(255, c[2] * b | 0) + ")";
                }
                ctx.globalAlpha = a * 0.95;
                ctx.beginPath(); ctx.arc(px, py, q.r, 0, TAU); ctx.fill();
            }
            ctx.globalAlpha = 1;
        };
        const paintHead = () => {
            let flare = 0;                               /* brightens after a click */
            for (const w of FX.waves) flare = Math.max(flare, Math.exp(-(FX.now - w.t0) * 2.6));
            const prox = FX.act * Math.max(0, 1 - Math.hypot(HEAD.x - FX.sx, HEAD.y - FX.sy) / 150);
            const R = 72 * (1 + 0.3 * prox + 0.7 * flare);   /* swells when the pointer is near */
            const g = ctx.createRadialGradient(HEAD.x, HEAD.y, 0, HEAD.x, HEAD.y, R);
            const stops = [[0, 247, 251, 252], [2, 208, 251, 254], [4, 126, 217, 254], [6, 82, 137, 194],
                           [9, 61, 102, 147], [13, 39, 71, 106], [18, 25, 49, 74], [25, 14, 31, 50],
                           [35, 6, 18, 30], [50, 3, 8, 15], [72, 0, 0, 0]];
            for (const s of stops) g.addColorStop(s[0] / 72, "rgb(" + s[1] + "," + s[2] + "," + s[3] + ")");
            ctx.save();
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(HEAD.x, HEAD.y, R, 0, TAU); ctx.fill();
            ctx.restore();
            ctx.fillStyle = "#ffffff";
            ctx.beginPath(); ctx.arc(HEAD.x, HEAD.y, 2.3 * (1 + 0.6 * flare), 0, TAU); ctx.fill();
        };

        /* ---------- ring cursor + shockwaves ---------- */
        const drawCursor = () => {
            ctx.save();
            for (const w of FX.waves) {                  /* expanding shockwave rings */
                const age = FX.now - w.t0;
                ctx.globalAlpha = 0.35 * Math.exp(-age * 2.2); ctx.strokeStyle = "#7fd0ff"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(w.x, w.y, age * FX.WAVE_SPEED, 0, TAU); ctx.stroke();
            }
            if (FX.act > 0.02) {                         /* pointer ring and faint push radius */
                ctx.globalAlpha = 0.55 * FX.act; ctx.strokeStyle = "#7fd0ff"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.arc(FX.sx, FX.sy, 9, 0, TAU); ctx.stroke();
                ctx.globalAlpha = 0.14 * FX.act; ctx.setLineDash([3, 5]);
                ctx.beginPath(); ctx.arc(FX.sx, FX.sy, FX.REPEL_R, 0, TAU); ctx.stroke();
            }
            ctx.restore();
        };

        /* ---------- clock + draw ---------- */
        let t = 0, playing = !REDUCED, lastTs: number | null = null;
        let rafId = 0;

        function draw() {
            const f = t * FPS;
            FX.now = performance.now() / 1000;
            FX.waves = FX.waves.filter(w => FX.now - w.t0 < 1.6);
            ctx!.fillStyle = BACKGROUND_COLOR;
            ctx!.fillRect(0, 0, W, H);
            paintStars(f);
            paintTail(f);
            paintHead();
            drawCursor();
        }
        function clock(ts: number) {
            if (lastTs == null) lastTs = ts;
            const dt = Math.min(0.1, (ts - lastTs) / 1000); lastTs = ts;
            if (playing) {
                t += dt;
                if (t >= DUR) t = t % DUR;
            }
            const k1 = 1 - Math.exp(-dt * 12), k2 = 1 - Math.exp(-dt * 5);   /* ease the pointer, fade its influence */
            FX.sx += (FX.tx - FX.sx) * k1; FX.sy += (FX.ty - FX.sy) * k1;
            FX.act += ((mouse ? 1 : 0) - FX.act) * k2;
            FX.px = FX.act * (FX.sx / W - 0.5) * 2; FX.py = FX.act * (FX.sy / H - 0.5) * 2;
            draw();
            rafId = requestAnimationFrame(clock);
        }

        /* ---------- pointer / touch (mouse + touch via Pointer Events) ---------- */
        let mouse: { x: number; y: number } | null = null;
        const setPointer = (clientX: number, clientY: number) => {
            const r = cv.getBoundingClientRect();
            if (!r.width || !r.height) return;
            mouse = { x: (clientX - r.left) * W / r.width, y: (clientY - r.top) * H / r.height };
            FX.tx = mouse.x; FX.ty = mouse.y;
            if (FX.act < 0.02) { FX.sx = FX.tx; FX.sy = FX.ty; }      /* snap on entry, no sweep across the canvas */
            if (hintRef.current) hintRef.current.style.opacity = "0";
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!interactive) return;
            setPointer(e.clientX, e.clientY);
            if (!playing) draw();
        };
        const onPointerDown = (e: PointerEvent) => {
            if (!interactive) return;
            setPointer(e.clientX, e.clientY);
            FX.waves.push({ x: mouse!.x, y: mouse!.y, t0: performance.now() / 1000 });
            if (FX.waves.length > 5) FX.waves.shift();
        };
        const onLeave = () => { mouse = null; };

        if (interactive) {
            cv.addEventListener("pointermove", onPointerMove);
            cv.addEventListener("pointerdown", onPointerDown);
            cv.addEventListener("pointerleave", onLeave);
            cv.addEventListener("pointercancel", onLeave);
        }

        const hintTimer = hintRef.current
            ? window.setTimeout(() => { if (hintRef.current) hintRef.current.style.opacity = "0"; }, 8000)
            : 0;

        draw();
        rafId = requestAnimationFrame(clock);

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            window.clearTimeout(hintTimer);
            if (interactive) {
                cv.removeEventListener("pointermove", onPointerMove);
                cv.removeEventListener("pointerdown", onPointerDown);
                cv.removeEventListener("pointerleave", onLeave);
                cv.removeEventListener("pointercancel", onLeave);
            }
        };
    }, [interactive]);

    return (
        <div
            className={`relative w-full h-full min-h-[380px] overflow-hidden select-none flex items-center justify-center ${className}`}
            style={{ backgroundColor: BACKGROUND_COLOR, ...style }}
        >
            <div ref={stageRef} className="absolute inset-0 flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    aria-label="A blue comet with a particle tail drifting through a star field"
                    className="block w-auto h-auto touch-none"
                    style={{ cursor: interactive ? "none" : "default" }}
                />
            </div>
            {showHint && (
                <p
                    ref={hintRef}
                    className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[11px] tracking-[0.3em] uppercase text-white/40 transition-opacity duration-700 select-none"
                    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                    {hintText}
                </p>
            )}
        </div>
    );
};

export default CometTrail;

/* FPS / DUR are exported for parity with the reference animation contract and
   for any host that wants to drive / document the loop timing. */
export { FPS, DUR };
