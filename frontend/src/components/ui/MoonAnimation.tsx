// ── FILE: frontend/src/components/ui/MoonAnimation.tsx ──
// moon-animation — UI HUB
// "The Moon": a fully procedural, physically-flavoured lunar renderer. A seeded
// CPU pass forges a 2048x1024 albedo/height/mare-mask texture (real near-side
// maria + ~60 named craters + 11k random craters + bright ray systems), and a
// raw-WebGL1 fragment shader raytraces a sphere over it with Lommel-Seeliger
// shading, bump-mapped relief, level-of-detail micro-craters, earthshine on the
// night side and a cursor-following spotlight + dashed feature outline. The sky
// behind it is a hand-built Milky Way + twinkling multi-depth starfield with an
// occasional shooting star, and the Moon plays its real time-compressed motion
// (optical libration in longitude and latitude, phase cycle, parallactic roll,
// perigee-apogee size change).
//
// Original source: standalone HTML (single file, layered canvases + inline
// script). Ported to React with no third-party runtime: browser Canvas 2D for the
// sky/overlay plus a raw WebGL1 context for the sphere. The physics, the texture
// generator, the maria/crater/ray tables and the full GLSL are kept byte-for-byte
// from the reference implementation; the html/body + fixed viewport canvases
// became a scoped container, the window resize listener became a ResizeObserver
// on that container, and the pointer/keyboard listeners are bound to the
// component (plus a pointer-over guard on the keyboard) so the demo reacts only
// inside its own box. `compact` drops the generated texture to 1024x512 to keep
// library previews light; the full-screen demo uses the full 2048x1024.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./MoonAnimation.css";

export interface MoonAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** When true (library preview), forges a smaller texture for faster boot. */
    compact?: boolean;
    /** Whether to show the fading interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint. */
    hintText?: string;
}

export const MoonAnimation: React.FC<MoonAnimationProps> = ({
    className = "",
    style = {},
    compact = false,
    showHint = true,
    hintText = "Drag to rotate the Moon 360\u00b0 \u00b7 scroll or double-tap to zoom \u00b7 R to reset",
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const bgRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<HTMLCanvasElement>(null);
    const ovRef = useRef<HTMLCanvasElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const loaderRef = useRef<HTMLDivElement>(null);
    const barRef = useRef<HTMLDivElement>(null);
    const msgRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cvBg = bgRef.current;
        const cvGl = glRef.current;
        const cvOv = ovRef.current;
        const label = labelRef.current;
        const loader = loaderRef.current;
        const bar = barRef.current;
        const msg = msgRef.current;
        const hint = hintRef.current;
        if (!root || !cvBg || !cvGl || !cvOv || !label || !loader || !bar || !msg || !hint) return;

        const bgx = cvBg.getContext("2d");
        const ovx = cvOv.getContext("2d");
        if (!bgx || !ovx) return;

        let cancelled = false;
        const timers: number[] = [];
        let glCtx: WebGLRenderingContext | null = null;
        let ro: ResizeObserver | null = null;
        let rafId = 0;

        /* ===== MOON ENGINE: procedural lunar texture + rotating sphere renderer ===== */
        const MOON_TW = compact ? 1024 : 2048;
        const MOON_TH = MOON_TW / 2;
        const D2R = Math.PI / 180, R2D = 180 / Math.PI;

        function mulberry32(a: number) {
            return function () {
                a |= 0; a = a + 0x6D2B79F5 | 0;
                let t = Math.imul(a ^ a >>> 15, 1 | a);
                t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
                return ((t ^ t >>> 14) >>> 0) / 4294967296;
            };
        }
        function ihash(x: number, y: number, z: number) {
            let h = Math.imul(x, 0x27d4eb2d) ^ Math.imul(y, 0x165667b1) ^ Math.imul(z, 0x85ebca6b);
            h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
            h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
            return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
        }
        function noise3(x: number, y: number, z: number) {
            const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
            let xf = x - xi, yf = y - yi, zf = z - zi;
            xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf); zf = zf * zf * (3 - 2 * zf);
            const a = ihash(xi, yi, zi), b = ihash(xi + 1, yi, zi), c = ihash(xi, yi + 1, zi), d = ihash(xi + 1, yi + 1, zi);
            const e = ihash(xi, yi, zi + 1), f = ihash(xi + 1, yi, zi + 1), g = ihash(xi, yi + 1, zi + 1), h = ihash(xi + 1, yi + 1, zi + 1);
            const x1 = a + (b - a) * xf, x2 = c + (d - c) * xf, x3 = e + (f - e) * xf, x4 = g + (h - g) * xf;
            const y1 = x1 + (x2 - x1) * yf, y2 = x3 + (x4 - x3) * yf;
            return y1 + (y2 - y1) * zf;
        }
        function fbm3(x: number, y: number, z: number, oct: number) {
            let s = 0, a = 0.5, f = 1, n = 0;
            for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03; }
            return s / n;
        }
        const sstep = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
        const tick = (): Promise<void> => new Promise((r) => setTimeout(r, 0));

        /* Real near-side maria: [lon, lat, rx deg, ry deg, albedo tone, name] */
        const MARIA: any[] = [
            [-16, 34, 19, 15, 0.00, 'Mare Imbrium'], [18, 28, 11, 10, -0.03, 'Mare Serenitatis'], [31, 8, 14, 9, -0.05, 'Mare Tranquillitatis'],
            [59, 17, 8, 5.5, -0.06, 'Mare Crisium'], [51, -8, 11, 8, 0.01, 'Mare Fecunditatis'], [34, -15, 4.8, 4.8, 0.0, 'Mare Nectaris'],
            [-16, -21, 13, 8.5, 0.04, 'Mare Nubium'], [-39, -24, 7.5, 7, -0.02, 'Mare Humorum'], [-24, -9, 9, 5, 0.02, 'Mare Cognitum'],
            [-17, 7, 10, 6.5, 0.0, 'Mare Insularum'], [3, 14, 5, 4.5, 0.02, 'Mare Vaporum'], [0, 56, 18, 2.6, 0.06, 'Mare Frigoris'],
            [-9, 11, 3.5, 3, 0.0, 'Sinus Aestuum'], [0, 0, 3, 2.5, 0.02, 'Sinus Medii'], [-57, 10, 20, 19, 0.02, 'Oceanus Procellarum'],
            [-48, 28, 16, 12, 0.02, 'Oceanus Procellarum'], [-62, -4, 14, 14, 0.01, 'Oceanus Procellarum'], [-45, 42, 8, 6, 0.04, 'Sinus Roris'],
            [30, 38, 8, 4, -0.02, 'Lacus Somniorum'], [65, 1, 3, 2.5, 0.0, 'Mare Spumans'], [68, 7, 3, 2, 0.0, 'Mare Undarum'],
            [87, 2, 4, 4, -0.05, 'Mare Smythii'], [86, 13, 4, 3, -0.03, 'Mare Marginis'], [-93, -19, 5.5, 5.5, -0.08, 'Mare Orientale'],
            [22, 22, 2.5, 1.5, 0.0, 'Lacus Mortis'], [-30, 44, 3, 2.5, 0.0, 'Sinus Iridum'], [146, 27, 5, 5, -0.06, 'Mare Moscoviense'],
            [128, -20, 5.5, 5.5, -0.04, 'Tsiolkovskiy basin'], [95, -48, 5, 4, -0.02, 'Mare Australe'], [158, -7, 4, 3, -0.03, 'Mare Ingenii']
        ];
        /* Named craters: lon, lat, radius deg, opts, name */
        const NAMED: any[] = [
            [-11.4, -43.4, 1.4, { fresh: 0.55, peak: 1 }, 'Tycho'], [-20.1, 9.6, 1.55, { fresh: 0.5, peak: 1 }, 'Copernicus'],
            [-38.0, 8.1, 0.55, { fresh: 0.6 }, 'Kepler'], [-47.4, 23.7, 0.68, { fresh: 0.85 }, 'Aristarchus'],
            [-9.4, 51.6, 1.67, { dark: 0.8 }, 'Plato'], [-68.5, -5.5, 2.84, { dark: 0.85 }, 'Grimaldi'], [-74.3, -3.3, 2.4, { dark: 0.4 }, 'Riccioli'],
            [-14.4, -58.8, 3.7, {}, 'Clavius'], [-1.9, -9.3, 2.55, { dark: 0.35 }, 'Ptolemaeus'], [-3.2, -13.4, 1.96, { dark: 0.35, peak: 1 }, 'Alphonsus'],
            [-1.9, -18.2, 1.6, { peak: 1 }, 'Arzachel'], [4.1, -11.2, 2.24, {}, 'Albategnius'], [5.2, -5.5, 2.5, {}, 'Hipparchus'],
            [26.4, -11.4, 1.65, { peak: 1 }, 'Theophilus'], [24.0, -13.2, 1.6, {}, 'Cyrillus'], [23.4, -18.1, 1.65, {}, 'Catharina'],
            [60.9, -8.9, 2.18, { peak: 1 }, 'Langrenus'], [60.4, -25.3, 2.9, { peak: 1 }, 'Petavius'], [60.4, -35.3, 2.06, {}, 'Furnerius'],
            [29.9, 31.8, 1.57, { dark: 0.5 }, 'Posidonius'], [17.3, 50.2, 1.43, {}, 'Aristoteles'], [16.3, 44.3, 1.1, {}, 'Eudoxus'],
            [-4, 29.7, 1.37, { dark: 0.8 }, 'Archimedes'], [1.2, 33.9, 0.9, { fresh: 0.3 }, 'Aristillus'], [1.5, 30.7, 0.64, { fresh: 0.3 }, 'Autolycus'],
            [-11.3, 14.5, 0.96, { fresh: 0.15 }, 'Eratosthenes'], [-6.3, -50.1, 3.2, {}, 'Maginus'], [-21.8, -49.6, 2.4, {}, 'Longomontanus'],
            [-54.6, -44.3, 3.75, { dark: 0.2 }, 'Schickard'], [-69.1, -66.5, 5, {}, 'Bailly'], [-39, -51.8, 3.0, {}, 'Schiller'],
            [-39.9, -17.5, 1.8, { dark: 0.5 }, 'Gassendi'], [-22.2, -20.7, 1.0, { fresh: 0.3 }, 'Bullialdus'], [-13.5, -29.9, 1.75, { dark: 0.4 }, 'Pitatus'],
            [46.9, 16.1, 0.65, { fresh: 0.7 }, 'Proclus'], [-67.6, 2.2, 1.75, {}, 'Hevelius'], [55.5, 27.7, 2.1, {}, 'Cleomedes'],
            [56.4, 53.6, 2.0, { dark: 0.8 }, 'Endymion'], [44.4, 46.7, 1.43, {}, 'Atlas'], [39.1, 46.7, 1.14, {}, 'Hercules'],
            [79, 36, 2.9, {}, 'Gauss'], [81, -27, 3.3, { dark: 0.5 }, 'Humboldt'], [41.5, -45.4, 3.1, {}, 'Janssen'],
            [-5.6, -70.6, 1.9, {}, 'Moretus'], [-20, -76.7, 1.3, {}, 'Newton'], [129, -20, 3, { dark: 0.7, peak: 1 }, 'Tsiolkovskiy'],
            [-157.4, 4.4, 7, {}, 'Korolev'], [-151.8, -36.1, 8.8, {}, 'Apollo basin'], [-105, -5, 4, {}, null],
            [175, 20, 3.5, {}, null], [100, -5, 4, { dark: 0.2 }, null], [-125, 40, 4.5, {}, null], [140, 55, 4, {}, null], [-160, -55, 5, {}, null],
            [-140, 60, 4, {}, null], [110, 45, 3.5, {}, null], [160, -45, 4.5, {}, null], [-85, 70, 3.5, {}, null], [60, 75, 3, {}, null]
        ];
        const FEATURES: any[] = [];
        for (const n of NAMED) if (n[4]) FEATURES.push({ name: n[4], lon: n[0], lat: n[1], r: n[2] * 1.15, kind: n[4].indexOf('basin') >= 0 ? 'Impact basin' : 'Crater' });
        for (const m of MARIA) FEATURES.push({ name: m[5], lon: m[0], lat: m[1], r: Math.max(m[2], m[3]) * 0.7, kind: m[5].indexOf('Mare') === 0 || m[5].indexOf('Oceanus') === 0 ? 'Lunar sea (basalt plain)' : 'Bay / lake' });
        FEATURES.push({ name: 'Montes Apenninus', lon: -3, lat: 19, r: 3, kind: 'Mountain range' }, { name: 'Montes Alpes', lon: 3, lat: 46, r: 3.5, kind: 'Mountain range' },
            { name: 'Montes Caucasus', lon: 8, lat: 38, r: 3, kind: 'Mountain range' }, { name: 'Montes Carpatus', lon: -25, lat: 15, r: 3, kind: 'Mountain range' });
        /* Ringed basins (ring-only stamps): lon, lat, R, amp */
        const RINGS: any[] = [
            [-16, 34, 17, 0.5], [18, 28, 10.5, 0.4], [59, 17, 8.5, 0.4], [34, -15, 5.5, 0.3], [-39, -24, 6.5, 0.2],
            [-93, -19, 8, 0.6], [-93, -19, 13, 0.6], [-93, -19, 3.4, 0.4]
        ];
        const RAYS: any[] = [
            { lon: -11.4, lat: -43.4, R: 46, s: 0.60, n: 1.0 }, { lon: -20.1, lat: 9.6, R: 15, s: 0.38, n: 0.8 },
            { lon: -38.0, lat: 8.1, R: 9, s: 0.38, n: 0.7 }, { lon: -47.4, lat: 23.7, R: 8, s: 0.40, n: 0.7 },
            { lon: 46.9, lat: 16.1, R: 14, s: 0.35, n: 0.8 }, { lon: 1.2, lat: 33.9, R: 9, s: 0.22, n: 0.6 }, { lon: 60.9, lat: -8.9, R: 10, s: 0.2, n: 0.6 }, { lon: -11.3, lat: 14.5, R: 7, s: 0.2, n: 0.6 }
        ];

        async function buildMoonTexture(onProgress?: (p: number, m: string) => void) {
            const TW = MOON_TW, TH = MOON_TH, N = TW * TH;
            const rng = mulberry32(20261014);
            const H = new Float32Array(N), A = new Float32Array(N), Mk = new Float32Array(N);
            const sinL = new Float32Array(TW), cosL = new Float32Array(TW);
            for (let x = 0; x < TW; x++) { const l = ((x + 0.5) / TW) * 2 * Math.PI - Math.PI; sinL[x] = Math.sin(l); cosL[x] = Math.cos(l); }
            const prog = async (p: number, m: string) => { if (cancelled) throw new Error('cancelled'); if (onProgress) onProgress(p, m); await tick(); if (cancelled) throw new Error('cancelled'); };

            /* 1. base relief, maria mask, albedo */
            for (let y = 0; y < TH; y++) {
                const phi = (0.5 - (y + 0.5) / TH) * Math.PI, sp = Math.sin(phi), cp = Math.cos(phi), latD = phi * R2D;
                for (let x = 0; x < TW; x++) {
                    const px = cp * sinL[x], py = sp, pz = cp * cosL[x];
                    const lonD = (((x + 0.5) / TW) * 360 - 180);
                    let M = 0, w = -1, tone = 0;
                    for (let b = 0; b < MARIA.length; b++) {
                        const m = MARIA[b];
                        const dy = latD - m[1]; if (Math.abs(dy) > m[3] * 1.7) continue;
                        let dl = lonD - m[0]; if (dl > 180) dl -= 360; else if (dl < -180) dl += 360;
                        const dx = dl * Math.cos((latD + m[1]) * 0.5 * D2R); if (Math.abs(dx) > m[2] * 1.7) continue;
                        if (w < 0) w = fbm3(px * 3.6 + 7.1, py * 3.6 + 1.3, pz * 3.6 + 4.4, 4) * 0.6 + fbm3(px * 11, py * 11, pz * 11, 3) * 0.4;
                        const d = Math.hypot(dx / m[2], dy / m[3]) * (0.45 + 1.1 * w);
                        const v = 1 - sstep(0.55, 1.0, d);
                        if (v > M) { M = v; tone = m[4]; }
                    }
                    const g1 = fbm3(px * 2.2 + 11, py * 2.2, pz * 2.2, 4);
                    const g2 = fbm3(px * 60, py * 60, pz * 60, 2);
                    const hi = 0.60 + (g1 - 0.5) * 0.26 + (g2 - 0.5) * 0.16;
                    const mr = 0.25 + tone + (g1 - 0.5) * 0.24 + (g2 - 0.5) * 0.08;
                    const i = y * TW + x;
                    A[i] = hi * (1 - M) + mr * M; Mk[i] = M;
                    let h = (fbm3(px * 3.1, py * 3.1, pz * 3.1 + 9, 3) - 0.5) * 0.35 + (noise3(px * 40, py * 40, pz * 40) - 0.5) * 0.035;
                    h = h * (1 - 0.8 * M) - 0.10 * M;
                    if (M > 0.3) { const r = 1 - Math.abs(2 * noise3(px * 16, py * 16, pz * 16) - 1); h += 0.03 * r * r * r * M; }
                    H[i] = h;
                }
                if (y % 96 === 95) await prog(0.05 + 0.4 * y / TH, 'Shaping highlands & maria');
            }

            /* 2. crater stamping */
            function stamp(lonD: number, latD: number, Rd: number, o: any) {
                o = o || {};
                const ext = o.ring ? 1.35 : 2.6;
                const cx = (lonD + 180) / 360 * TW, cy = (90 - latD) / 180 * TH;
                const dyT = Math.ceil(Rd * ext / 180 * TH) + 1;
                const cosC = Math.max(Math.cos(latD * D2R), 0.15);
                const dxT = Math.min(TW / 2, Math.ceil(Rd * ext / cosC / 360 * TW) + 1);
                const y0 = Math.max(0, Math.floor(cy) - dyT), y1 = Math.min(TH - 1, Math.floor(cy) + dyT);
                const big = Math.min(1, Math.max(0, (Rd - 0.7) / 2.3));
                const depth = Rd * (0.24 - 0.12 * big) * (o.shallow || 1);
                const flat = 0.55 * big;
                const rimH = depth * 0.26;
                for (let y = y0; y <= y1; y++) {
                    const latRow = 90 - (y + 0.5) / TH * 180, dy = latRow - latD;
                    const cm = Math.max(Math.cos((latRow + latD) * 0.5 * D2R), 0.05);
                    for (let xx = Math.floor(cx) - dxT; xx <= Math.floor(cx) + dxT; xx++) {
                        const dx = ((xx + 0.5 - cx) / TW * 360) * cm;
                        const d = Math.hypot(dx, dy) / Rd; if (d > ext) continue;
                        const idx = y * TW + (((xx % TW) + TW) % TW);
                        if (o.ring) {
                            const g = Math.exp(-Math.pow((d - 1) / 0.09, 2));
                            H[idx] += o.amp * Rd * 0.06 * g; A[idx] += 0.05 * g * (1 - Mk[idx] * 0.5);
                            continue;
                        }
                        let h = 0;
                        if (d < 1) {
                            const t = Math.max(0, Math.min(1, (d - flat) / (1 - flat)));
                            h = -depth * (1 - t * t);
                            if (o.peak) h += depth * 0.5 * Math.exp(-Math.pow(d / 0.13, 2));
                            const wipe = 1 - sstep(0.7, 1.0, d);
                            H[idx] *= (1 - 0.85 * wipe);
                        } else {
                            h = rimH * 0.5 * Math.pow(d, -3);
                        }
                        h += rimH * Math.exp(-Math.pow((d - 1) / 0.13, 2));
                        H[idx] += h;
                        if (o.fresh) {
                            const k = d < 1 ? 1 : Math.pow(d, -2.1);
                            A[idx] += o.fresh * k * 0.55 * (d < 1 ? 0.8 + 0.2 * d : 1);
                        } else if (d > 1) {
                            A[idx] += 0.025 * Math.pow(d, -2) * (0.4 + Mk[idx]);
                        }
                        if (o.dark && d < 1) {
                            const f = o.dark * (1 - sstep(0.75, 1.0, d));
                            A[idx] += (0.24 - A[idx]) * f; Mk[idx] += (0.75 - Mk[idx]) * f * 0.8;
                        }
                    }
                }
            }

            const craters: any[] = [];
            for (const n of NAMED) craters.push({ lon: n[0], lat: n[1], R: n[2], o: n[3] });
            const Nrand = 11000;
            for (let i = 0; i < Nrand; i++) {
                const lat = Math.asin(rng() * 2 - 1) * R2D, lon = rng() * 360 - 180;
                const R = Math.min(3.6, 0.26 * Math.pow(rng(), -0.55));
                const o: any = {};
                const r = rng();
                if (R < 1.4 && r < 0.10) o.fresh = 0.3 + rng() * 0.55;
                else if (R < 0.6 && r < 0.2) o.fresh = 0.15 + rng() * 0.2;
                craters.push({ lon, lat, R, o, rand: true });
            }
            craters.sort((a, b) => b.R - a.R);
            let cnt = 0;
            for (const c of craters) {
                if (c.rand) {
                    const xi = Math.floor((c.lon + 180) / 360 * TW), yi = Math.min(TH - 1, Math.floor((90 - c.lat) / 180 * TH));
                    const m = Mk[yi * TW + xi];
                    if (rng() < m * (c.R < 1.5 ? 0.85 : 0.5)) continue;
                    if (m > 0.3) c.o.shallow = 0.6;
                }
                stamp(c.lon, c.lat, c.R, c.o);
                if (++cnt % 400 === 0) await prog(0.45 + 0.3 * cnt / craters.length, 'Carving craters');
            }
            for (const r of RINGS) stamp(r[0], r[1], r[2], { ring: true, amp: r[3] });
            await prog(0.78, 'Casting ray systems');

            /* 3. bright ray systems */
            for (const ry of RAYS) {
                const tabN = 96, tab = new Float32Array(tabN), len = new Float32Array(tabN);
                for (let i = 0; i < tabN; i++) { tab[i] = Math.pow(rng(), 2.2) * 1.4; len[i] = 0.35 + 0.65 * rng(); }
                const l0 = ry.lon * D2R, f0 = ry.lat * D2R;
                const c = [Math.cos(f0) * Math.sin(l0), Math.sin(f0), Math.cos(f0) * Math.cos(l0)];
                const E0 = [Math.cos(l0), 0, -Math.sin(l0)];
                const N0 = [-Math.sin(f0) * Math.sin(l0), Math.cos(f0), -Math.sin(f0) * Math.cos(l0)];
                const ext = ry.R;
                const cy = (90 - ry.lat) / 180 * TH, dyT = Math.ceil(ext / 180 * TH) + 1;
                const cosC = Math.max(Math.cos(f0), 0.2), dxT = Math.min(TW / 2, Math.ceil(ext / cosC / 360 * TW) + 1);
                const cx = (ry.lon + 180) / 360 * TW;
                for (let y = Math.max(0, Math.floor(cy) - dyT); y <= Math.min(TH - 1, Math.floor(cy) + dyT); y++) {
                    const phi = (0.5 - (y + 0.5) / TH) * Math.PI, sp = Math.sin(phi), cp = Math.cos(phi);
                    for (let xx = Math.floor(cx) - dxT; xx <= Math.floor(cx) + dxT; xx++) {
                        const xi = ((xx % TW) + TW) % TW;
                        const qx = cp * sinL[xi], qy = sp, qz = cp * cosL[xi];
                        const dot = qx * c[0] + qy * c[1] + qz * c[2];
                        const d = Math.acos(Math.min(1, dot)) * R2D; if (d > ext || d < 1.6) continue;
                        const bx = qx * E0[0] + qy * E0[1] + qz * E0[2], by = qx * N0[0] + qy * N0[1] + qz * N0[2];
                        let b = Math.atan2(bx, by) / (2 * Math.PI); if (b < 0) b += 1;
                        const fi = b * tabN, i0 = Math.floor(fi) % tabN, i1 = (i0 + 1) % tabN, ft = fi - Math.floor(fi);
                        const v = tab[i0] + (tab[i1] - tab[i0]) * ft;
                        const L = len[i0] * ext;
                        const fade = Math.max(0, 1 - d / L);
                        if (fade <= 0 || v <= 0.02) continue;
                        const mott = 0.35 + 1.1 * fbm3(qx * 18, qy * 18, qz * 18, 3);
                        const near = sstep(1.6, 4, d);
                        A[y * TW + xi] += ry.s * Math.min(1, v) * Math.pow(fade, 1.2) * mott * near * 0.9;
                    }
                }
                await tick();
            }
            await prog(0.88, 'Computing relief');

            /* 4. finalize: albedo clamp + slopes */
            const tex = new Float32Array(N * 4);
            const deg = 360 / TW;
            for (let y = 0; y < TH; y++) {
                const phi = (0.5 - (y + 0.5) / TH) * Math.PI, cp = Math.max(Math.cos(phi), 0.12);
                const ym = Math.max(0, y - 1), yp = Math.min(TH - 1, y + 1);
                for (let x = 0; x < TW; x++) {
                    const i = y * TW + x, xm = (x - 1 + TW) % TW, xp = (x + 1) % TW;
                    const hx = (H[y * TW + xp] - H[y * TW + xm]) / (2 * deg * cp);
                    const hy = (H[yp * TW + x] - H[ym * TW + x]) / ((yp - ym) * deg);
                    const o = i * 4;
                    tex[o] = Math.min(1.0, Math.max(0.05, A[i]));
                    tex[o + 1] = Math.max(-1.6, Math.min(1.6, hx));
                    tex[o + 2] = Math.max(-1.6, Math.min(1.6, -hy));
                    tex[o + 3] = Math.min(1, Math.max(0, Mk[i]));
                }
            }
            await prog(1, 'Ready');
            return tex;
        }

        /* ===== MOON GL: WebGL1 renderer (sphere raytrace in fragment shader) ===== */
        const MOON_VS = `
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }
`;
        const MOON_FS = `
precision highp float;
uniform vec2 uCenter;      /* moon centre in device px, y up */
uniform float uRadius;     /* moon radius in device px        */
uniform mat3 uM;           /* view -> body                    */
uniform vec3 uLb;          /* light direction in body space   */
uniform vec3 uLv;          /* light direction in view space   */
uniform float uTime;
uniform vec2 uMouse;       /* device px, y up                 */
uniform float uHover;
uniform float uTint;
uniform float uFull;       /* illuminated fraction 0..1       */
uniform sampler2D uTex;
const float PI = 3.14159265;

float h31(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.yzx + 33.33); return fract((p.x + p.y) * p.z); }
vec3 h33(vec3 p){ p = fract(p * vec3(.1031, .1030, .0973)); p += dot(p, p.yxz + 33.33); return fract((p.xxy + p.yxx) * p.zyx); }
float vnoise(vec3 p){
  vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h31(i), h31(i + vec3(1,0,0)), f.x), mix(h31(i + vec3(0,1,0)), h31(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h31(i + vec3(0,0,1)), h31(i + vec3(1,0,1)), f.x), mix(h31(i + vec3(0,1,1)), h31(i + vec3(1,1,1)), f.x), f.y), f.z);
}
/* cellular micro-craters on the sphere: returns body-space height gradient + brightness */
void cells(vec3 b, float F, float seed, out vec3 g, out float br){
  vec3 p = b * F, ip = floor(p);
  g = vec3(0.0); br = 0.0;
  for (int i = -1; i <= 1; i++) for (int j = -1; j <= 1; j++) for (int k = -1; k <= 1; k++) {
    vec3 c = ip + vec3(float(i), float(j), float(k));
    vec3 r = h33(c + seed);
    if (r.x > 0.6) continue;
    vec3 cp = c + 0.15 + 0.7 * h33(c * 1.7 + seed + 3.1);
    float rad = 0.16 + 0.34 * r.y * r.y;
    vec3 dv = p - cp; float d = length(dv); float u = d / rad;
    if (u > 2.4) continue;
    float depth = 0.30 * rad;
    float dh = 0.0;
    if (u < 1.0) dh = 2.0 * u * depth / rad;
    float e = exp(-(u - 1.0) * (u - 1.0) / 0.05);
    dh += depth * 0.45 * e * (-2.0 * (u - 1.0) / 0.05) / rad;
    g += dh * dv / (d + 1e-4);
    if (r.z > 0.86) br += 0.35 * exp(-u * u * 0.6) * (r.z - 0.86) * 7.0;
    br += 0.05 * e - 0.05 * exp(-u * u * 2.0);
  }
}

void main(){
  vec2 fc = gl_FragCoord.xy;
  vec2 p = (fc - uCenter) / uRadius;
  float r = length(p);
  float px = 1.0 / uRadius;
  float aa = clamp((1.0 - r) / px + 0.5, 0.0, 1.0);

  /* ---- soft glow around the disk (camera bloom / sky scatter) ---- */
  float rg = max(r - 1.0, 0.0);
  float glow = uFull * (0.15 * exp(-rg * 18.0) + 0.05 * exp(-rg * 5.0) + 0.022 * exp(-rg * 1.5))
             + (1.0 - uFull) * 0.012 * exp(-rg * 3.0);
  glow *= (r > 1.0 ? 1.0 : 0.35);
  vec3 glowCol = vec3(0.74, 0.82, 1.0) * glow;
  float glowA = clamp(glow * 0.85, 0.0, 1.0);

  vec3 moonC = vec3(0.0);
  if (r < 1.0 + px * 1.5) {
    float rr = min(r, 0.9995);
    vec2 q = p * (rr / max(r, 1e-4));
    float z = sqrt(max(0.0, 1.0 - dot(q, q)));
    vec3 n = vec3(q, z);
    vec3 b = uM * n;
    float cphi = max(length(b.xz), 1e-4);
    float lam = atan(b.x, b.z);
    float phi = asin(clamp(b.y, -1.0, 1.0));
    vec2 uv = vec2(lam / (2.0 * PI) + 0.5, 0.5 - phi / PI);
    vec4 t = texture2D(uTex, uv);
    float gx = (t.g - 0.5) * 1.8, gy = (t.b - 0.5) * 1.8;
    float a = t.r, mk = t.a;
    vec3 Eb = vec3(b.z, 0.0, -b.x) / cphi;
    vec3 Nb = vec3(-b.y * b.x / cphi, cphi, -b.y * b.z / cphi);

    /* ---- level-of-detail micro craters + regolith grain ---- */
    float cell1 = uRadius / 150.0, cell2 = uRadius / 340.0;
    float f1 = smoothstep(1.6, 4.5, cell1), f2 = smoothstep(1.6, 4.5, cell2);
    float bright = 0.0;
    if (f1 > 0.01) { vec3 g; float br; cells(b, 150.0, 1.0, g, br);
      gx += dot(g, Eb) * 0.9 * f1; gy += dot(g, Nb) * 0.9 * f1; bright += br * f1; }
    if (f2 > 0.01) { vec3 g; float br; cells(b, 340.0, 7.0, g, br);
      gx += dot(g, Eb) * 0.8 * f2; gy += dot(g, Nb) * 0.8 * f2; bright += br * f2; }
    float fg = smoothstep(1.5, 4.0, uRadius / 900.0);
    float grain = (vnoise(b * 900.0) - 0.5) * 0.16 * fg + (vnoise(b * 380.0) - 0.5) * 0.10 * smoothstep(1.5, 4.0, uRadius / 380.0);
    a = clamp(a * (1.0 + bright + grain), 0.03, 1.2);

    /* ---- lighting: Lommel-Seeliger with bump-mapped normal ---- */
    float S = 1.1;
    vec3 nb = normalize(b - S * (gx * Eb + gy * Nb));
    float nL0 = dot(b, uLb);
    float mu0 = max(dot(nb, uLb), 0.0) * smoothstep(-0.06, 0.04, nL0);
    float mu = max(z, 0.02);
    float ls = 2.0 * mu0 / (mu0 + mu + 1e-3);
    float alpha = acos(clamp(uLv.z, -1.0, 1.0));
    float surge = 1.0 + 0.16 * exp(-pow(alpha / 0.16, 2.0));
    float v = a * ls * surge * 0.84;
    /* earthshine on the night side */
    float earth = clamp(0.5 - 0.5 * uLv.z, 0.0, 1.0);
    v += a * 0.07 * earth * earth * (1.0 - smoothstep(0.0, 0.25, nL0)) * (0.5 + 0.5 * z);
    v = pow(max(v, 0.0), 0.93);

    vec3 col = vec3(v);
    vec3 warm = vec3(1.04, 1.0, 0.94), cool = vec3(0.90, 0.97, 1.08);
    vec3 tintc = mix(warm, cool, mk);
    col *= mix(vec3(1.0), tintc, uTint);
    float nightMix = 1.0 - smoothstep(0.0, 0.2, nL0);
    col = mix(col, col * vec3(0.78, 0.9, 1.25), nightMix * earth * 0.8);

    /* ---- hover: soft spotlight + ring that follows the cursor ---- */
    if (uHover > 0.001) {
      float dm = length(fc - uMouse) / uRadius;
      float sp = exp(-pow(dm / 0.20, 2.0));
      col *= 1.0 + 0.45 * sp * uHover;
      col += vec3(0.035, 0.05, 0.075) * sp * uHover;
      float ring = smoothstep(px * 2.2, 0.0, abs(dm - 0.075)) * uHover;
      col = mix(col, vec3(0.75, 0.9, 1.0), ring * 0.75);
      float ring2 = smoothstep(px * 1.6, 0.0, abs(dm - 0.11 - 0.012 * sin(uTime * 2.4))) * uHover;
      col = mix(col, vec3(0.7, 0.85, 1.0), ring2 * 0.25);
    }
    /* faint rim bloom inside the limb */
    col += glowCol * 0.05;
    col += (h31(vec3(fc, uTime)) - 0.5) / 255.0;
    moonC = col * aa;
  }
  vec3 outC = moonC + glowCol * (1.0 - aa);
  float outA = clamp(aa + glowA * (1.0 - aa), 0.0, 1.0);
  gl_FragColor = vec4(min(outC, vec3(outA)), outA);
}
`;

        function createMoonGL(gl: WebGLRenderingContext, texBytes: Uint8Array, TW: number, TH: number) {
            function sh(type: number, src: string) {
                const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s);
                if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
                return s;
            }
            const prog = gl.createProgram()!;
            gl.attachShader(prog, sh(gl.VERTEX_SHADER, MOON_VS));
            gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, MOON_FS));
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || 'link');
            gl.useProgram(prog);
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
            const loc = gl.getAttribLocation(prog, 'aPos');
            gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
            const tex = gl.createTexture();
            gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TW, TH, 0, gl.RGBA, gl.UNSIGNED_BYTE, texBytes);
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            const ext = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
            if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
            const U: Record<string, WebGLUniformLocation | null> = {};
            ['uCenter', 'uRadius', 'uM', 'uLb', 'uLv', 'uTime', 'uMouse', 'uHover', 'uTint', 'uFull', 'uTex'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
            gl.uniform1i(U.uTex, 0);
            gl.disable(gl.DEPTH_TEST); gl.disable(gl.BLEND);
            return {
                draw(s: any) {
                    gl.viewport(0, 0, s.pw, s.ph);
                    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
                    gl.uniform2f(U.uCenter, s.cx, s.cy); gl.uniform1f(U.uRadius, s.R);
                    const M = s.M;
                    gl.uniformMatrix3fv(U.uM, false, new Float32Array([M[0], M[3], M[6], M[1], M[4], M[7], M[2], M[5], M[8]]));
                    gl.uniform3f(U.uLb, s.Lb[0], s.Lb[1], s.Lb[2]); gl.uniform3f(U.uLv, s.Lv[0], s.Lv[1], s.Lv[2]);
                    gl.uniform1f(U.uTime, s.time % 100); gl.uniform2f(U.uMouse, s.mx, s.my); gl.uniform1f(U.uHover, s.hover);
                    gl.uniform1f(U.uTint, s.tint); gl.uniform1f(U.uFull, s.full);
                    gl.drawArrays(gl.TRIANGLES, 0, 3);
                }
            };
        }

        /* ===================== PAGE: scene, motion, background, hover ===================== */
        const REDUCED = typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let VW = 0, VH = 0, DPR = 1;
        function resize() {
            VW = root!.clientWidth || 1; VH = root!.clientHeight || 1;
            DPR = Math.min((window.devicePixelRatio || 1), 2);
            while (VW * VH * DPR * DPR > 3.4e6 && DPR > 0.75) DPR -= 0.25;
            for (const c of [cvBg, cvGl, cvOv]) { c!.width = Math.round(VW * DPR); c!.height = Math.round(VH * DPR); }
            bgx!.setTransform(DPR, 0, 0, DPR, 0, 0); ovx!.setTransform(DPR, 0, 0, DPR, 0, 0);
        }

        /* ---------- realistic night-sky background ---------- */
        const sky = (() => {
            const w = 640, h = 360, c = document.createElement('canvas'); c.width = w; c.height = h;
            const x = c.getContext('2d')!; const img = x.createImageData(w, h), d = img.data;
            const ca = Math.cos(-0.5), sa = Math.sin(-0.5);
            for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
                const u = i / w - 0.5, v = j / h - 0.5;
                const rx = u * ca - v * sa, ry = u * sa + v * ca;
                const band = Math.exp(-Math.pow((ry + 0.04 * Math.sin(rx * 5)) / 0.16, 2));
                const n1 = fbm3(i * 0.016, j * 0.016, 3.3, 5), n2 = fbm3(i * 0.05 + 40, j * 0.05, 1.1, 4);
                const dust = Math.max(0, 1 - Math.abs(2 * fbm3(i * 0.022 + 9, j * 0.03 + 2, 7.7, 4) - 1) * 2.2);
                let dens = band * (0.25 + 1.2 * n1) * (0.55 + 0.9 * n2) * (1 - 0.75 * dust * band);
                dens = Math.max(0, dens - 0.04);
                const core = Math.exp(-Math.pow(ry / 0.045, 2)) * n1;
                const o = (j * w + i) * 4;
                d[o] = 120 + 90 * core; d[o + 1] = 135 + 70 * core; d[o + 2] = 190 + 40 * core;
                d[o + 3] = Math.min(255, dens * 150 + core * 40);
            }
            x.putImageData(img, 0, 0);
            return c;
        })();
        const STARS = (() => {
            const r = mulberry32(4242), a: any[] = [];
            for (let i = 0; i < 520; i++) {
                const m = Math.pow(r(), 3.2);              /* few bright, many faint */
                const temp = r();
                const col = temp < 0.18 ? [175, 200, 255] : temp < 0.72 ? [240, 244, 255] : temp < 0.9 ? [255, 236, 205] : [255, 205, 170];
                a.push({ x: r(), y: r(), s: 0.35 + m * 1.7, a: 0.25 + 0.75 * m, c: col, ph: r() * 6.28, sp: 0.6 + r() * 2.2, z: 0.2 + r() * 0.8 });
            }
            return a;
        })();
        let shoot: any = null, nextShoot = 6 + Math.random() * 8;
        const mouse = { x: -1, y: -1, nx: 0, ny: 0, sx: 0, sy: 0, inside: false };
        function drawSky(t: number, dt: number) {
            const g = bgx!.createLinearGradient(0, 0, 0, VH);
            g.addColorStop(0, '#02030a'); g.addColorStop(0.55, '#050818'); g.addColorStop(1, '#0a1026');
            bgx!.fillStyle = g; bgx!.fillRect(0, 0, VW, VH);
            const px = mouse.sx * 14, py = mouse.sy * 9;
            /* Milky Way (very slow drift) */
            bgx!.save(); bgx!.globalAlpha = 0.55;
            const sc = Math.max(VW / 640, VH / 360) * 1.35, drift = Math.sin(t * 0.01) * 20;
            bgx!.translate(VW / 2 + px * 0.4 + drift, VH / 2 + py * 0.4); bgx!.rotate(0.08 + t * 0.0004);
            bgx!.drawImage(sky, -320 * sc, -180 * sc, 640 * sc, 360 * sc); bgx!.restore();
            /* stars with twinkle + 3-depth parallax */
            for (const s of STARS) {
                const tw = 0.78 + 0.22 * Math.sin(t * s.sp + s.ph);
                const x = ((s.x * VW + px * s.z * 1.8 + t * 0.35 * s.z) % VW + VW) % VW, y = s.y * VH + py * s.z * 1.8;
                const al = Math.min(1, s.a * tw);
                bgx!.fillStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + al.toFixed(3) + ')';
                bgx!.beginPath(); bgx!.arc(x, y, s.s * 0.62, 0, 6.2832); bgx!.fill();
                if (s.s > 1.6) {
                    bgx!.fillStyle = 'rgba(' + s.c[0] + ',' + s.c[1] + ',' + s.c[2] + ',' + (al * 0.12).toFixed(3) + ')';
                    bgx!.beginPath(); bgx!.arc(x, y, s.s * 2.6, 0, 6.2832); bgx!.fill();
                    bgx!.fillRect(x - s.s * 4, y - 0.3, s.s * 8, 0.6); bgx!.fillRect(x - 0.3, y - s.s * 4, 0.6, s.s * 8);
                }
            }
            /* occasional shooting star */
            if (!REDUCED) {
                nextShoot -= dt;
                if (!shoot && nextShoot < 0) {
                    shoot = { x: Math.random() * VW * 0.8 + VW * 0.1, y: Math.random() * VH * 0.35, vx: 520 + Math.random() * 260, vy: 200 + Math.random() * 160, life: 0 };
                    nextShoot = 14 + Math.random() * 20;
                }
                if (shoot) {
                    shoot.life += dt; shoot.x += shoot.vx * dt; shoot.y += shoot.vy * dt;
                    const a = Math.max(0, 1 - shoot.life / 0.9), L = 0.12;
                    const gr = bgx!.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * L, shoot.y - shoot.vy * L);
                    gr.addColorStop(0, 'rgba(255,255,255,' + (0.9 * a) + ')'); gr.addColorStop(1, 'rgba(255,255,255,0)');
                    bgx!.strokeStyle = gr; bgx!.lineWidth = 1.4; bgx!.beginPath();
                    bgx!.moveTo(shoot.x, shoot.y); bgx!.lineTo(shoot.x - shoot.vx * L, shoot.y - shoot.vy * L); bgx!.stroke();
                    if (shoot.life > 0.9) shoot = null;
                }
            }
            /* soft vignette */
            const vg = bgx!.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.35, VW / 2, VH / 2, Math.max(VW, VH) * 0.75);
            vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,6,0.55)');
            bgx!.fillStyle = vg; bgx!.fillRect(0, 0, VW, VH);
        }

        /* ---------- math helpers ---------- */
        const mm = (a: number[], b: number[]) => { const r = new Array(9).fill(0); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) for (let k = 0; k < 3; k++) r[i * 3 + j] += a[i * 3 + k] * b[k * 3 + j]; return r; };
        const Rz = (a: number) => [Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a), 0, 0, 0, 1];
        const Rx = (a: number) => [1, 0, 0, 0, Math.cos(a), -Math.sin(a), 0, Math.sin(a), Math.cos(a)];
        const Ry = (a: number) => [Math.cos(a), 0, Math.sin(a), 0, 1, 0, -Math.sin(a), 0, Math.cos(a)];
        const mv = (M: number[], v: number[]) => [M[0] * v[0] + M[1] * v[1] + M[2] * v[2], M[3] * v[0] + M[4] * v[1] + M[5] * v[2], M[6] * v[0] + M[7] * v[1] + M[8] * v[2]];
        const mvT = (M: number[], v: number[]) => [M[0] * v[0] + M[3] * v[1] + M[6] * v[2], M[1] * v[0] + M[4] * v[1] + M[7] * v[2], M[2] * v[0] + M[5] * v[1] + M[8] * v[2]];
        const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
        const trn = (m: number[]) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
        const I3 = () => [1, 0, 0, 0, 1, 0, 0, 0, 1];
        /* free 360-degree user rotation (trackball): U is applied on top of the real lunar motion */
        let U = I3(); const drag = { on: false, x: 0, y: 0, vx: 0, vy: 0, moved: 0 };
        function spin(dx: number, dy: number, R: number) { U = mm(mm(Rx(dy / R), Ry(dx / R)), U); }

        /* ---------- state ---------- */
        let MG: any = null, TEXDATA: Uint8Array | null = null, ready = false, zoom = 1, zoomT = 1, hov = 0;
        let cur = { M: null as any, cx: 0, cy: 0, R: 0 };
        let feat: any = null;
        const TAU = Math.PI * 2;
        let lastTap = 0;

        /* Real lunar motion, time-compressed (1 s ~ 0.5 day):
           - optical libration in longitude (+-7.9 deg) and latitude (+-6.7 deg)
           - phase cycle (new -> full -> new) with earthshine on the dark side
           - slow sky drift / parallactic tilt, and perigee-apogee size change */
        function motion(t: number) {
            const libLon = 7.9 * Math.sin(TAU * t / 55 + 0.7);
            const libLat = 6.7 * Math.sin(TAU * t / 52 + 2.1);
            const theta = 0.74 * Math.PI + TAU * t / 150;
            const roll = 12 + 14 * Math.sin(TAU * t / 120 + 0.4);
            const size = 1 + 0.03 * Math.sin(TAU * t / 55 + 2.2);
            const dx = 0.030 * Math.sin(TAU * t / 200), dy = -0.018 * Math.sin(TAU * t / 170 + 1.2);
            return { libLon, libLat, theta, roll, size, dx, dy };
        }

        let frameT = 0, lastTs = 0;
        function frame(now: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            if (document.hidden) return;
            const dtRaw = Math.min(0.05, (now - (lastTs || now)) / 1000); lastTs = now;
            const dt = REDUCED ? dtRaw * 0.15 : dtRaw;
            frameT += dt;
            const t = frameT;
            /* smooth mouse follow, zoom */
            mouse.sx = lerp(mouse.sx, mouse.inside ? mouse.nx : 0, 0.05); mouse.sy = lerp(mouse.sy, mouse.inside ? mouse.ny : 0, 0.05);
            zoom = lerp(zoom, zoomT, 0.10);
            drawSky(t, dt);
            ovx!.clearRect(0, 0, VW, VH);
            if (!ready || !MG) return;
            const m = motion(t);
            const base = Math.min(VW, VH) * 0.36;
            const R = base * m.size * zoom;
            let cx = VW / 2 + m.dx * Math.min(VW, VH) + mouse.sx * -10, cy = VH / 2 + m.dy * Math.min(VH, VW) + mouse.sy * -7;
            if (zoom > 1.02) { cx -= (mouse.x - VW / 2) * (zoom - 1) * 0.55 * (mouse.inside ? 1 : 0); cy -= (mouse.y - VH / 2) * (zoom - 1) * 0.55 * (mouse.inside ? 1 : 0); }
            const lon = (m.libLon + mouse.sx * 2.2) * D2R, lat = (m.libLat - mouse.sy * 2.2) * D2R, roll = (m.roll + mouse.sx * 1.5) * D2R;
            if (!drag.on && (Math.abs(drag.vx) > 0.02 || Math.abs(drag.vy) > 0.02)) {   /* inertia after release */
                spin(drag.vx, drag.vy, R); drag.vx *= 0.94; drag.vy *= 0.94;
            }
            const M = mm(mm(mm(Ry(lon), Rx(-lat)), Rz(-roll)), trn(U));
            const L0 = [Math.sin(m.theta), 0.03, -Math.cos(m.theta)];
            const Lv = mv(Rz(roll), L0), Lb = mv(M, Lv);
            cur = { M, cx, cy, R };
            /* hover target */
            let over = false;
            if (mouse.inside) {
                const px = (mouse.x - cx) / R, py = -(mouse.y - cy) / R, r2 = px * px + py * py;
                if (r2 < 0.985 && !drag.on) over = true;
            }
            hov = lerp(hov, over ? 1 : 0, 0.15);
            MG.draw({ pw: cvGl!.width, ph: cvGl!.height, cx: cx * DPR, cy: (VH - cy) * DPR, R: R * DPR, M, Lb, Lv, time: t,
                mx: mouse.x * DPR, my: (VH - mouse.y) * DPR, hover: hov, tint: 0.6, full: 0.5 - 0.5 * Math.cos(m.theta) });
            updateHover(over, M, cx, cy, R);
        }

        /* ---------- hover: feature lookup + label + highlight ---------- */
        function angDist(l1: number, f1: number, l2: number, f2: number) {
            const a = f1 * D2R, b = f2 * D2R, dl = (l1 - l2) * D2R;
            return Math.acos(Math.min(1, Math.max(-1, Math.sin(a) * Math.sin(b) + Math.cos(a) * Math.cos(b) * Math.cos(dl)))) / D2R;
        }
        const fmtLat = (v: number) => Math.abs(v).toFixed(1) + '\u00b0' + (v >= 0 ? 'N' : 'S');
        const fmtLon = (v: number) => Math.abs(v).toFixed(1) + '\u00b0' + (v >= 0 ? 'E' : 'W');
        function updateHover(over: boolean, M: number[], cx: number, cy: number, R: number) {
            if (!over) { label!.classList.remove('on'); feat = null; return; }
            const px = (mouse.x - cx) / R, py = -(mouse.y - cy) / R, z = Math.sqrt(Math.max(0, 1 - px * px - py * py));
            const b = mv(M, [px, py, z]);
            const lat = Math.asin(Math.max(-1, Math.min(1, b[1]))) / D2R, lon = Math.atan2(b[0], b[2]) / D2R;
            let best: any = null, bd = 1e9;
            for (const f of FEATURES) {
                const d = angDist(lon, lat, f.lon, f.lat);
                if (d <= f.r && f.r < bd) { best = f; bd = f.r; }
            }
            feat = best;
            let kind = best ? best.kind : 'Lunar surface';
            let name = best ? best.name : null;
            if (!best) {
                const u = (lon / 360 + 0.5), v = 0.5 - lat / 180;
                const xi = Math.min(MOON_TW - 1, Math.max(0, Math.floor(u * MOON_TW))), yi = Math.min(MOON_TH - 1, Math.max(0, Math.floor(v * MOON_TH)));
                const mk = TEXDATA ? TEXDATA[(yi * MOON_TW + xi) * 4 + 3] / 255 : 0;
                name = mk > 0.5 ? 'Basalt plain' : 'Southern & northern highlands';
                if (mk <= 0.5) name = 'Lunar highlands';
                kind = mk > 0.5 ? 'Dark lava plain (mare)' : 'Ancient, heavily cratered crust';
            }
            label!.innerHTML = '<b>' + name + '</b><span>' + kind + '</span><i>' + fmtLat(lat) + ' \u00b7 ' + fmtLon(lon) + '</i>';
            let lx = mouse.x + 18, ly = mouse.y + 20;
            if (lx + 190 > VW) lx = mouse.x - 190; if (ly + 70 > VH) ly = mouse.y - 76;
            label!.style.transform = 'translate(' + Math.max(6, lx) + 'px,' + Math.max(6, ly) + 'px)';
            label!.classList.add('on');
            /* outline the hovered feature on the sphere */
            if (best) {
                const fl = best.lon * D2R, fp = best.lat * D2R;
                const bf = [Math.cos(fp) * Math.sin(fl), Math.sin(fp), Math.cos(fp) * Math.cos(fl)];
                const v = mvT(M, bf);
                if (v[2] > 0.08) {
                    const sx = cx + v[0] * R, sy = cy - v[1] * R, rad = best.r / 1.15 * D2R * R;
                    ovx!.save(); ovx!.translate(sx, sy); ovx!.rotate(Math.atan2(-v[1], v[0]));
                    ovx!.strokeStyle = 'rgba(190,225,255,0.75)'; ovx!.lineWidth = 1.2; ovx!.setLineDash([5, 4]);
                    ovx!.beginPath(); ovx!.ellipse(0, 0, Math.max(5, rad * Math.max(v[2], 0.2)), Math.max(5, rad), 0, 0, TAU); ovx!.stroke();
                    ovx!.restore();
                }
            }
        }

        /* ---------- event handlers (scoped to the container) ---------- */
        function localPos(e: PointerEvent | WheelEvent) {
            const r = root!.getBoundingClientRect();
            return { x: e.clientX - r.left, y: e.clientY - r.top };
        }
        function onPointerMove(e: PointerEvent) {
            if (drag.on) {
                const p = localPos(e);
                const dx = p.x - drag.x, dy = p.y - drag.y; drag.x = p.x; drag.y = p.y;
                drag.moved += Math.abs(dx) + Math.abs(dy);
                spin(dx, dy, cur.R || 300); drag.vx = lerp(drag.vx, dx, 0.5); drag.vy = lerp(drag.vy, dy, 0.5);
            }
            const p = localPos(e);
            mouse.x = p.x; mouse.y = p.y; mouse.inside = true;
            mouse.nx = (p.x / VW - 0.5) * 2; mouse.ny = (p.y / VH - 0.5) * 2;
            hint!.classList.remove('on');
        }
        function onPointerDown(e: PointerEvent) {
            const p = localPos(e);
            drag.on = true; drag.x = p.x; drag.y = p.y; drag.vx = drag.vy = 0; drag.moved = 0;
            root!.classList.add('is-dragging');
            mouse.x = p.x; mouse.y = p.y; mouse.inside = true;
            mouse.nx = (p.x / VW - 0.5) * 2; mouse.ny = (p.y / VH - 0.5) * 2;
        }
        function onPointerUp(e: PointerEvent) {
            drag.on = false; root!.classList.remove('is-dragging');
            if (e.pointerType === 'touch') { const id = window.setTimeout(() => { mouse.inside = false; }, 1600); timers.push(id); }
            const n = performance.now(); if (drag.moved < 6 && n - lastTap < 320) zoomT = zoomT > 1.3 ? 1 : 2.4; lastTap = n;
        }
        function onPointerLeave() { mouse.inside = false; }
        function onPointerCancel() { drag.on = false; root!.classList.remove('is-dragging'); }
        function onWheel(e: WheelEvent) { e.preventDefault(); zoomT = Math.min(3, Math.max(1, zoomT * Math.exp(-e.deltaY * 0.0014))); }
        function onKeyDown(e: KeyboardEvent) {
            if (!mouse.inside) return;
            const k = e.key, step = 30;
            if (k === 'ArrowLeft') { spin(-step, 0, cur.R || 300); e.preventDefault(); }
            else if (k === 'ArrowRight') { spin(step, 0, cur.R || 300); e.preventDefault(); }
            else if (k === 'ArrowUp') { spin(0, -step, cur.R || 300); e.preventDefault(); }
            else if (k === 'ArrowDown') { spin(0, step, cur.R || 300); e.preventDefault(); }
            else if (k === 'r' || k === 'R') { U = I3(); drag.vx = drag.vy = 0; }
        }

        root.addEventListener('pointermove', onPointerMove);
        root.addEventListener('pointerdown', onPointerDown);
        root.addEventListener('pointerup', onPointerUp);
        root.addEventListener('pointerleave', onPointerLeave);
        root.addEventListener('pointercancel', onPointerCancel);
        root.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);

        ro = new ResizeObserver(() => resize());
        ro.observe(root);
        resize();

        /* ---------- boot: texture -> GPU ---------- */
        (async function boot() {
            let tex: Float32Array;
            try {
                tex = await buildMoonTexture((p, m) => { bar!.style.width = Math.round(p * 100) + '%'; msg!.textContent = m + '\u2026'; });
            } catch (e) { if (!cancelled) msg!.textContent = 'Could not build the moon surface.'; return; }
            if (cancelled) return;
            const N = MOON_TW * MOON_TH; TEXDATA = new Uint8Array(N * 4);
            const cl = (v: number) => Math.max(-0.9, Math.min(0.9, v));
            for (let i = 0; i < N; i++) {
                TEXDATA[i * 4] = Math.round(tex[i * 4] * 255);
                TEXDATA[i * 4 + 1] = Math.round((cl(tex[i * 4 + 1]) / 0.9 * 0.5 + 0.5) * 255);
                TEXDATA[i * 4 + 2] = Math.round((cl(tex[i * 4 + 2]) / 0.9 * 0.5 + 0.5) * 255);
                TEXDATA[i * 4 + 3] = Math.round(tex[i * 4 + 3] * 255);
            }
            glCtx = (cvGl!.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false }) || cvGl!.getContext('experimental-webgl')) as WebGLRenderingContext | null;
            if (!glCtx) { msg!.textContent = 'WebGL is needed to render the moon.'; return; }
            try { MG = createMoonGL(glCtx, TEXDATA, MOON_TW, MOON_TH); }
            catch (e: any) { msg!.textContent = 'Graphics error: ' + String(e.message).slice(0, 80); return; }
            if (cancelled) return;
            ready = true; frameT = 0;
            loader!.classList.add('off');
            if (showHint) {
                const t1 = window.setTimeout(() => hint!.classList.add('on'), 900);
                const t2 = window.setTimeout(() => hint!.classList.remove('on'), 9000);
                timers.push(t1, t2);
            }
        })();
        rafId = requestAnimationFrame(frame);

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (ro) ro.disconnect();
            root.removeEventListener('pointermove', onPointerMove);
            root.removeEventListener('pointerdown', onPointerDown);
            root.removeEventListener('pointerup', onPointerUp);
            root.removeEventListener('pointerleave', onPointerLeave);
            root.removeEventListener('pointercancel', onPointerCancel);
            root.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKeyDown);
            for (const id of timers) clearTimeout(id);
            if (glCtx) {
                const ext = glCtx.getExtension('WEBGL_lose_context');
                if (ext) ext.loseContext();
            }
        };
    }, [compact, showHint, hintText]);

    return (
        <div ref={rootRef} className={`moon-root ${className}`} style={style}>
            <canvas ref={bgRef} className="moon-bg" />
            <canvas ref={glRef} className="moon-gl" />
            <canvas ref={ovRef} className="moon-ov" />
            <div ref={labelRef} className="moon-label" />
            <div ref={loaderRef} className="moon-loader">
                <div ref={msgRef}>Forging lunar surface&hellip;</div>
                <div className="moon-track"><div ref={barRef} className="moon-bar" /></div>
            </div>
            <div ref={hintRef} className="moon-hint">{hintText}</div>
        </div>
    );
};

export default MoonAnimation;
