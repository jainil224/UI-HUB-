// ── FILE: frontend/src/components/ui/SaturnAnimation.tsx ──
// saturn-animation — UI HUB
// "Saturn": a physically-flavoured ringed-planet renderer. A fixed 608x1080
// stage holds a true spinning sphere (a per-pixel CPU raytrace of an oblate
// latitude field with differential rotation, banded albedo, a pale storm oval
// and a dark spot, limb-darkened and lit from one direction), 15,000 ring
// particles orbiting with real Keplerian differential speeds behind and in
// front of the planet (Cassini/Encke gaps, C/B/A tone bands, the planet's
// shadow cast on the far ring), a small moon on an equatorial orbit and a
// twinkling starfield. The ring opening angle and roll sweep slowly, the pole
// tilts to match, and the pointer offsets/rolls the whole scene, adds a spin
// boost on drag and a size "burst" on click.
//
// Original source: standalone HTML (single canvas + inline script, fixed
// viewport, cursor-grab). Ported to React with no third-party runtime: browser
// Canvas 2D only. Every constant, the seeded RNG, the noise lattice, the ring
// particle builder, the planet raytrace and the closed-form motion are kept
// byte-for-byte from the reference; the html/body + fixed stage became a scoped
// container (the canvas keeps its intrinsic 608x1080 buffer and is CSS
// contain-fitted to any preview box), the pointer listeners are bound to the
// canvas, and the global window verification hooks (__seek/__play/__ready/
// __freeze) and the authoring chrome are removed.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./SaturnAnimation.css";

export interface SaturnAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** Whether to show the fading interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint. */
    hintText?: string;
}

export const SaturnAnimation: React.FC<SaturnAnimationProps> = ({
    className = "",
    style = {},
    showHint = true,
    hintText = "move \u00b7 drag \u00b7 click",
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cv = cvRef.current;
        const hint = hintRef.current;
        const stage = stageRef.current;
        if (!cv || !hint || !stage) return;
        const ctx = cv.getContext("2d");
        if (!ctx) return;

        let cancelled = false;
        let rafId = 0;
        let hintTimer = 0;

        /* ================= constants ================= */
        const W = 608, H = 1080;
        const PR = 63;                                   /* planet radius (px) */
        const BASE = { cx: 305, cy: 540 };
        const RING_SPEED = 0.14;                         /* rad/s at r=150, Keplerian: w ~ r^-1.5 */
        const SPIN_SPEED = 0.35;                         /* planet spin, rad/s (equator) */
        const MOON_SPEED = 0.22, MOON_R = 238;
        const TILT_PERIOD = 22;                          /* seconds for one slow ring-tilt cycle */
        const REDUCED = typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* ================= cover-fit =================
           The 608x1080 buffer keeps its aspect ratio but is scaled by the larger
           axis so the scene fills the preview box edge-to-edge; the overflow is
           centred and clipped by the root's overflow-hidden. */
        cv.width = W;
        cv.height = H;
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

        /* live state (all motion derives from these) */
        const S = { cx: BASE.cx, cy: BASE.cy, theta: -0.33, rho: .34, e: .35,
                    spin: 0, phase: 0, moonA: 2.4, burst: 0, px: 0, py: 0,
                    ox: 0, oy: 0, dTheta: 0, dRatio: 0, bPhase: 0, bSpin: 0 };

        /* ================= helpers ================= */
        const rng = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
        const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
        const smooth = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
        const NS = 256, GRID = (() => { const r = rng(7), g = new Float32Array(NS * NS); for (let i = 0; i < g.length; i++) g[i] = r(); return g; })();
        function vnoise(x: number, y: number) {
            const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
            const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
            const a = GRID[((yi & 255) << 8) + (xi & 255)], b = GRID[((yi & 255) << 8) + ((xi + 1) & 255)];
            const c = GRID[(((yi + 1) & 255) << 8) + (xi & 255)], d = GRID[(((yi + 1) & 255) << 8) + ((xi + 1) & 255)];
            return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
        }

        /* ================= stars ================= */
        const STARS = (() => { const r = rng(42), a: any[] = [];
            for (let i = 0; i < 340; i++) a.push({ x: r() * W, y: r() * H, s: .7 + r() * r() * 1.9, a: .45 + r() * .55, p: r() * 6.28 });
            return a; })();
        function drawStars(c: CanvasRenderingContext2D, tt: number) {
            c.fillStyle = '#fff';
            for (const s of STARS) {
                c.globalAlpha = s.a * (.8 + .2 * Math.sin(tt * 1.6 + s.p));
                c.fillRect((s.x - S.px * 16 * s.s + W * 2) % W, (s.y - S.py * 16 * s.s + H * 2) % H, s.s, s.s);
            }
            c.globalAlpha = 1;
        }

        /* ================= ring particles (structured like Saturn's rings) ================= */
        const RING = (() => {
            const r = rng(2024), N = 15000;
            const dens = (q: number) => {
                let d;
                if (q < 104) d = .22; else if (q < 142) d = .55 + .45 * smooth(104, 116, q);
                else if (q < 148) d = .05; else if (q < 168) d = .72; else if (q < 171) d = .08; else d = .55;
                return d * (.82 + .18 * Math.sin(q * 2.3 + 1));
            };
            const tones: Record<string, string[]> = { C: ['rgba(138,124,104,.55)', 'rgba(110,98,84,.5)'],
                            B: ['rgba(255,247,230,.95)', 'rgba(240,226,200,.9)', 'rgba(218,200,170,.85)'],
                            A: ['rgba(210,200,184,.85)', 'rgba(184,172,154,.8)', 'rgba(158,146,128,.7)'] };
            const keys: string[] = []; for (const z in tones) tones[z].forEach(c => keys.push(c));
            const buckets = keys.map(c => ({ c, p: [] as any[] })), idx: Record<string, number> = {}; keys.forEach((c, i) => idx[c] = i);
            let n = 0;
            while (n < N) {
                const rad = Math.sqrt(92 * 92 + r() * (180 * 180 - 92 * 92));
                if (r() > dens(rad)) continue;
                const zt = tones[rad < 104 ? 'C' : rad < 148 ? 'B' : 'A'], c = zt[(r() * zt.length) | 0];
                buckets[idx[c]].p.push({ a: r() * 6.2832, r: rad, w: Math.pow(150 / rad, 1.5),
                                         sz: [.8, 1.1, 1.5, 2][(r() * r() * 4) | 0], j: (r() - .5) * 2.4 });
                n++;
            }
            return { buckets };
        })();

        function drawRing(c: CanvasRenderingContext2D, front: boolean) {
            const ct = Math.cos(S.theta), st = Math.sin(S.theta), rho = S.rho, sc = 1 + S.burst * .10;
            for (const bk of RING.buckets) {
                c.fillStyle = bk.c;
                for (const p of bk.p) {
                    const a = p.a + S.phase * p.w;                          /* differential (Keplerian) orbit */
                    const v = p.r * Math.sin(a);
                    if ((v > 0) !== front) continue;                        /* v>0 = near side of the ring */
                    const X = p.r * Math.cos(a) * sc, Y = v * rho * sc + p.j;
                    const sx = X * ct - Y * st, sy = X * st + Y * ct;
                    if (!front && sx > 0 && Math.abs(sy - sx * .28) < PR * .97) {   /* planet shadow on ring */
                        c.globalAlpha = .3; c.fillRect(S.cx + sx, S.cy + sy, p.sz, p.sz); c.globalAlpha = 1;
                    } else c.fillRect(S.cx + sx, S.cy + sy, p.sz, p.sz);
                }
            }
        }

        /* ================= planet: true spinning sphere ================= */
        const PLS = 2, PLW = PR * 2 + 2, SZ = PLW * PLS;
        const PL = document.createElement('canvas'); PL.width = PL.height = SZ;
        const PLX = PL.getContext('2d')!;
        const PLD = PLX.createImageData(SZ, SZ);
        const LIGHT = (() => { const l = [-.5, -.34, .8], m = Math.hypot(l[0], l[1], l[2]); return l.map(v => v / m); })();
        /* per-pixel constants (computed once) */
        const PX = new Float32Array(SZ * SZ), PY = new Float32Array(SZ * SZ), PZ = new Float32Array(SZ * SZ),
              PSH = new Float32Array(SZ * SZ), PA = new Uint8ClampedArray(SZ * SZ);
        (() => {
            const c = SZ / 2, R = PR * PLS;
            for (let j = 0; j < SZ; j++) for (let i = 0; i < SZ; i++) {
                const k = j * SZ + i, x = (i + .5 - c) / R, y = (j + .5 - c) / R, rr = x * x + y * y;
                if (rr > 1) { PA[k] = 0; continue; }
                const z = Math.sqrt(1 - rr);
                PX[k] = x; PY[k] = y; PZ[k] = z;
                const dif = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
                PSH[k] = (.52 + .48 * Math.pow(z, .55)) * (.46 + .54 * Math.pow(dif, .85));     /* limb darkening + light */
                PA[k] = rr > .985 ? 255 * (1 - (rr - .985) / .015) : 255;
            }
        })();
        const LAT_N = 64, cosT = new Float32Array(LAT_N), sinT = new Float32Array(LAT_N);
        function renderPlanet() {
            const ct = Math.cos(S.theta), st = Math.sin(S.theta), ce = Math.cos(S.e), se = Math.sin(S.e);
            const shadowAmt = .4 * smooth(.1, .35, S.rho);
            /* differential rotation: equator spins faster than the poles */
            for (let k = 0; k < LAT_N; k++) {
                const s = (k / (LAT_N - 1)) * 2 - 1, psi = S.spin * (1 + .30 * (1 - s * s));
                cosT[k] = Math.cos(psi); sinT[k] = Math.sin(psi);
            }
            const d = PLD.data, n = SZ * SZ;
            const sC = Math.cos(.55), sS = Math.sin(.55), s2C = Math.cos(2.6), s2S = Math.sin(2.6);
            for (let k = 0; k < n; k++) {
                if (!PA[k]) { d[k * 4 + 3] = 0; continue; }
                const x = PX[k], y = PY[k], z = PZ[k];
                const xr = x * ct + y * st, yr = -x * st + y * ct;            /* ring-aligned frame */
                const s = -yr * ce + z * se, zc = yr * se + z * ce;            /* sin(latitude), depth along equator */
                const inv = 1 / (Math.sqrt(xr * xr + zc * zc) + 1e-6), cl = zc * inv, sl = xr * inv;
                const li = ((s + 1) * .5 * (LAT_N - 1) + .5) | 0, cp = cosT[li], sp = sinT[li];
                const cL = cl * cp + sl * sp, sL = sl * cp - cl * sp;          /* longitude minus spin -> eastward drift */
                const n1 = vnoise(cL * 2.4 + s * 6.1 + 11, sL * 2.4 + s * 3.7);
                const n2 = vnoise(cL * 5.6 + s * 13 + 3, sL * 5.6 + s * 9 + 4);
                let b = .5 + .20 * Math.sin(s * 8.3 + .4) + .12 * Math.sin(s * 17 + 1.7) + .07 * Math.sin(s * 31 + .3)
                          + .22 * (n1 - .5) + .10 * (n2 - .5);
                const ds = (s + .30) / .06, stm = Math.exp(-(1 - (cL * sC + sL * sS)) / .02 - ds * ds);   /* pale storm oval */
                const dk = (s - .38) / .05, dsp = Math.exp(-(1 - (cL * s2C + sL * s2S)) / .012 - dk * dk); /* dark spot */
                b = clamp(b + .38 * stm - .26 * dsp, 0, 1);
                const R = 168 + 76 * b + 6 * Math.sin(s * 3), G = 140 + 84 * b, B = 92 + 98 * b - 8 * Math.sin(s * 3);
                const pole = 1 - .30 * Math.pow(Math.abs(s), 2.6);
                const rs = Math.exp(-Math.pow((s + .28) / .05, 2));            /* ring shadow band (southern side) */
                const sh = PSH[k] * pole * (1 - shadowAmt * rs);
                d[k * 4] = R * sh; d[k * 4 + 1] = G * sh; d[k * 4 + 2] = B * sh; d[k * 4 + 3] = PA[k];
            }
            PLX.putImageData(PLD, 0, 0);
        }

        /* ================= moon: equatorial orbit in the ring plane ================= */
        function drawMoon(c: CanvasRenderingContext2D) {
            const ct = Math.cos(S.theta), st = Math.sin(S.theta);
            const u = MOON_R * Math.cos(S.moonA), v = MOON_R * Math.sin(S.moonA);
            const X = u * (1 + S.burst * .10), Y = v * S.rho * (1 + S.burst * .10);
            const mx = S.cx + X * ct - Y * st, my = S.cy + X * st + Y * ct, near = v > 0;
            const r = 7 + 1.3 * (v / MOON_R);                                   /* a touch larger when nearer */
            c.save();
            if (!near) { c.beginPath(); c.rect(0, 0, W, H); c.arc(S.cx, S.cy, PR, 0, 6.2832, true); c.clip('evenodd'); }  /* behind planet */
            const g = c.createRadialGradient(mx - r * .35, my - r * .3, 1, mx, my, r);
            g.addColorStop(0, '#b3c0d4'); g.addColorStop(.55, '#65738a'); g.addColorStop(1, '#232a38');
            c.fillStyle = g; c.beginPath(); c.arc(mx, my, r, 0, 6.2832); c.fill();
            c.restore();
        }

        /* ================= scene ================= */
        function drawScene(tt: number) {
            ctx!.fillStyle = '#000'; ctx!.fillRect(0, 0, W, H);
            drawStars(ctx!, tt);
            drawRing(ctx!, false);                                               /* far side of the ring */
            const gl = ctx!.createRadialGradient(S.cx, S.cy, PR * .96, S.cx, S.cy, PR * 1.4);
            gl.addColorStop(0, 'rgba(235,214,160,.14)'); gl.addColorStop(1, 'rgba(235,214,160,0)');
            ctx!.fillStyle = gl; ctx!.beginPath(); ctx!.arc(S.cx, S.cy, PR * 1.4, 0, 6.2832); ctx!.fill();   /* atmosphere */
            ctx!.fillStyle = '#000'; ctx!.beginPath(); ctx!.arc(S.cx, S.cy, PR - 1, 0, 6.2832); ctx!.fill();  /* occluder */
            renderPlanet();
            ctx!.imageSmoothingQuality = 'high';
            ctx!.drawImage(PL, S.cx - PLW / 2, S.cy - PLW / 2, PLW, PLW);
            drawRing(ctx!, true);                                                /* near side of the ring */
            drawMoon(ctx!);
        }

        /* ================= pointer interaction ================= */
        const ptr = { nx: 0, ny: 0, down: false, lx: 0 };
        let tgtOx = 0, tgtOy = 0, tgtTheta = 0, tgtRatio = 0, boost = 0, hintGone = false;
        const hideHint = () => { if (!hintGone) { hintGone = true; hint.style.opacity = "0"; } };
        if (showHint) hintTimer = window.setTimeout(hideHint, 6000); else hideHint();
        function setPointer(e: PointerEvent) {
            const r = cv!.getBoundingClientRect();
            ptr.nx = clamp(((e.clientX - r.left) / r.width * W - W / 2) / (W / 2), -1, 1);
            ptr.ny = clamp(((e.clientY - r.top) / r.height * H - H / 2) / (H / 2), -1, 1);
        }
        function aim() { tgtOx = ptr.nx * 46; tgtOy = ptr.ny * 46; tgtTheta = ptr.nx * 14; tgtRatio = -ptr.ny * .14; }
        function onPointerMove(e: PointerEvent) {
            setPointer(e); aim();
            if (ptr.down) { boost += (e.clientX - ptr.lx) * .004; ptr.lx = e.clientX; }
            hideHint();
        }
        function onPointerDown(e: PointerEvent) {
            cv!.setPointerCapture(e.pointerId); ptr.down = true; ptr.lx = e.clientX; cv!.classList.add('drag');
            setPointer(e); aim(); S.burst = Math.min(1, S.burst + .9); boost += .5; hideHint();
        }
        const up = () => { ptr.down = false; cv!.classList.remove('drag'); };
        function onPointerLeave() { if (!ptr.down) { ptr.nx = 0; ptr.ny = 0; aim(); } }

        cv.addEventListener('pointermove', onPointerMove);
        cv.addEventListener('pointerdown', onPointerDown);
        cv.addEventListener('pointerup', up);
        cv.addEventListener('pointercancel', up);
        cv.addEventListener('pointerleave', onPointerLeave);

        /* ================= clock ================= */
        let tt = 0, last: number | null = null;
        function step(dt: number) {
            const k = 1 - Math.pow(.001, dt);
            S.px += (ptr.nx - S.px) * k; S.py += (ptr.ny - S.py) * k;
            S.ox += (tgtOx - S.ox) * k;  S.oy += (tgtOy - S.oy) * k;
            S.dTheta += (tgtTheta - S.dTheta) * k; S.dRatio += (tgtRatio - S.dRatio) * k;
            S.burst *= Math.pow(.35, dt); boost *= Math.pow(.25, dt);
            const b = Math.min(boost, 3);
            S.bPhase += b * 1.2 * dt; S.bSpin += b * .8 * dt;                   /* gentle interactive spin boost */
        }
        function pose() {
            /* closed-form motion so any time can be rendered (seekable) */
            const osc = Math.sin(tt * 6.2832 / TILT_PERIOD);
            S.rho = clamp(.32 + .14 * osc + S.dRatio, .05, .62);                 /* ring opening: slow, smooth sweep */
            S.theta = (-19 + 6 * osc + S.dTheta) * Math.PI / 180;                 /* ring roll follows the tilt */
            S.e = Math.asin(S.rho);                                              /* pole tilts toward viewer with the ring */
            S.phase = RING_SPEED * tt + S.bPhase;
            S.spin = SPIN_SPEED * tt + S.bSpin;
            S.moonA = 2.4 + MOON_SPEED * tt;
            S.cx = BASE.cx + S.ox; S.cy = BASE.cy + S.oy;
        }
        function frame(ts: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            if (last == null) last = ts;
            const dt = Math.min(.05, (ts - last) / 1000); last = ts;
            if (!REDUCED) { tt += dt; step(dt); }
            pose(); drawScene(tt);
        }
        rafId = requestAnimationFrame(frame);

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (hintTimer) clearTimeout(hintTimer);
            ro.disconnect();
            cv.removeEventListener('pointermove', onPointerMove);
            cv.removeEventListener('pointerdown', onPointerDown);
            cv.removeEventListener('pointerup', up);
            cv.removeEventListener('pointercancel', up);
            cv.removeEventListener('pointerleave', onPointerLeave);
        };
    }, [showHint, hintText]);

    return (
        <div ref={rootRef} className={`relative w-full h-full min-h-[380px] overflow-hidden select-none flex items-center justify-center ${className}`} style={{ backgroundColor: '#000', ...style }}>
            <div ref={stageRef} className="absolute inset-0 flex items-center justify-center">
                <canvas ref={cvRef} className="block w-auto h-auto touch-none" width={608} height={1080} />
            </div>
            <div ref={hintRef} className="pointer-events-none absolute bottom-5 left-0 right-0 text-center text-[11px] tracking-[0.3em] uppercase text-white/40 transition-opacity duration-700 select-none" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', ...(showHint ? null : { opacity: 0 }) }}>
                {hintText}
            </div>
        </div>
    );
};

export default SaturnAnimation;
