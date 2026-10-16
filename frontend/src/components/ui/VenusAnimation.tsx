// ── FILE: frontend/src/components/ui/VenusAnimation.tsx ──
// venus-animation — UI HUB
// "Rotating Venus": a fully procedural, endlessly rotating Venus rendered entirely
// in Canvas 2D — no GPU shader, no libraries. A seeded CPU pass forges a
// 1024x512 equirectangular surface (dark umber volcanic plains, the orange-gold
// highlands of Ishtar Terra / Lakshmi Planum, Maxwell Montes, Aphrodite Terra
// spans, Thetis Regio, Alpha / Beta / Atla Regio and Artemis, plus named volcanoes
// and craters — Maat Mons, Sapas Mons, Ozza Mons, Sif Mons, Rhea Mons, Theia Mons,
// Idunn Mons, the Mead and Cleopatra craters — over scattered impact craters and
// shield domes and a fine radar speckle). The texture is mapped onto the disc with
// a per-pixel software sphere pass (bilinear fetch, a single directional sun,
// soft terminator + limb falloff and a thin atmospheric limb glow), then blitted
// so it drifts right to left as Venus turns. Drag in any direction to turn it,
// flick for momentum, wheel or two-finger pinch to zoom 0.5x-2.2x, +/- keys or the
// on-screen buttons to zoom, and press i (while hovering) to probe the surface for
// its real Magellan geography.
//
// Original source: standalone HTML (a fixed full-viewport canvas + one inline
// script). Ported to React with no third-party runtime and no external assets:
// the noise/rng helpers, the colour ramp, the surface features, the texture
// builder, the per-pixel sphere mapping and the trackball are kept from the
// reference. Only the scaffolding changed: the html/body + `#cv`/`#load`/`#tip`/
// `#zb` nodes became scoped refs on a container, every fixed overlay became
// absolutely positioned inside the root, the display canvas is sized to the
// container (DPR capped at 2) and the disc buffer follows the container's shorter
// side (capped at the original 560px) on an rAF-throttled ResizeObserver, the
// texture build gained a cancellable yield (so StrictMode's mount -> cleanup ->
// mount aborts the first pass instead of leaving it burning CPU), pointer
// coordinates stay canvas-relative, and the window keyboard listeners are guarded
// by an over-the-canvas pointer check (repo convention) so they never hijack page
// keys. The reference hides its transport bar and inspect legend in CSS, so those
// stay out of the DOM here and the look matches the template's clean rotating disc.
//
// Performance: this is a CPU software renderer, so the whole loop is gated by an
// IntersectionObserver + the Page Visibility API — an off-screen tile (e.g. in the
// library grid) never burns a core, the one-time texture build is deferred and
// paused until the box is actually on screen, and the raster is capped at ~40fps.
//
// Teardown cancels the RAF, drops the observers, clears the loading timer and
// unbinds every listener.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./VenusAnimation.css";

const D2R = Math.PI / 180;
const TW = 1024, TH = 512;     /* equirectangular texture size */
const DUR = 60, FPS = 60;      /* one full 360° turn per 60 s, seamless loop */
const RENDER_MS = 1000 / 40;   /* software-raster frame cap */

/* ---------- lighting + surface-type palette ---------- */
const LIGHT = (() => { const v = [.5, .42, .78], m = Math.hypot(v[0], v[1], v[2]); return [v[0] / m, v[1] / m, v[2] / m]; })();
const TYPES: { n: string; c: string }[] = [
    { n: 'Volcanic caldera', c: '#ff7a45' },
    { n: 'Impact crater', c: '#ffd93d' },
    { n: 'Shield dome', c: '#7fe3ff' },
];

/* ---------- 3D value noise (seamless around the sphere) ---------- */
function H3(i: number, j: number, k: number) {
    let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ Math.imul(k, 1274126177);
    h = Math.imul(h ^ (h >>> 13), 1103515245);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function vn(x: number, y: number, z: number) {
    const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z);
    let fx = x - i, fy = y - j, fz = z - k;
    fx *= fx * (3 - 2 * fx); fy *= fy * (3 - 2 * fy); fz *= fz * (3 - 2 * fz);
    const a = H3(i, j, k), b = H3(i + 1, j, k), c = H3(i, j + 1, k), d = H3(i + 1, j + 1, k),
        e = H3(i, j, k + 1), f = H3(i + 1, j, k + 1), g = H3(i, j + 1, k + 1), h = H3(i + 1, j + 1, k + 1);
    const x1 = a + (b - a) * fx, x2 = c + (d - c) * fx, x3 = e + (f - e) * fx, x4 = g + (h - g) * fx,
        y1 = x1 + (x2 - x1) * fy, y2 = x3 + (x4 - x3) * fy;
    return y1 + (y2 - y1) * fz;
}
function fbm(x: number, y: number, z: number, oct: number) {
    let s = 0, a = .5, f = 1, n = 0;
    for (let i = 0; i < oct; i++) { s += a * vn(x * f, y * f, z * f); n += a; a *= .5; f *= 2.03; }
    return s / n;
}
function rng(s: number) {
    return () => {
        s |= 0; s = s + 0x6D2B79F5 | 0;
        let t = Math.imul(s ^ s >>> 15, 1 | s);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/* ---------- colour ramp: dark umber -> orange -> gold -> pale yellow ---------- */
const STOPS: any[] = [[0, [30, 12, 3]], [.22, [84, 38, 10]], [.42, [158, 82, 22]], [.6, [208, 128, 40]], [.8, [242, 190, 86]], [1, [255, 238, 168]]];
const LUT = new Uint8Array(256 * 3);
for (let i = 0; i < 256; i++) {
    const t = i / 255; let k = 0;
    while (k < STOPS.length - 2 && t > STOPS[k + 1][0]) k++;
    const a = STOPS[k], b = STOPS[k + 1], u = (t - a[0]) / (b[0] - a[0]);
    for (let c = 0; c < 3; c++) LUT[i * 3 + c] = a[1][c] + (b[1][c] - a[1][c]) * u;
}

/* ---------- real Venus geography: highlands (lat/lon in degrees) ---------- */
const ll = (a: number, b: number) => { a *= D2R; b *= D2R; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const HL: any[] = ([
    ['Lakshmi Planum / Ishtar Terra', 68, 340, .34, .30],
    ['Maxwell Montes', 65, 3, .13, .45],
    ['Aphrodite Terra (Ovda)', -5, 75, .2, .3],
    ['Aphrodite Terra', -8, 100, .2, .3],
    ['Thetis Regio', -11, 128, .18, .28],
    ['Aphrodite Terra (east)', -12, 152, .16, .26],
    ['Alpha Regio', -25, 4, .12, .28],
    ['Beta Regio', 25, 283, .2, .3],
    ['Atla Regio', 9, 199, .2, .28],
    ['Artemis', -35, 135, .13, .2],
] as any[]).map((row: any) => {
    const [n, a, b, R_, m] = row;
    const [x, y, z] = ll(a, b);
    return { n, x, y, z, R: R_, m, ct: Math.cos(R_) };
});
function hlName(x: number, y: number, z: number) {
    for (const H of HL) if (Math.acos(Math.min(1, x * H.x + y * H.y + z * H.z)) < H.R) return H.n + ' (highland)';
    return 'Volcanic plains';
}

/* ---------- build the fixed feature set + starfield from one seeded stream ---------- */
function buildScene() {
    const rnd = rng(7), FEAT: any[] = [];
    const addAt = (type: number, name: string, a: number, b: number, R_: number) => {
        const [x, y, z] = ll(a, b);
        FEAT.push({ type, name, lat: a * D2R, lon: b * D2R, x, y, z, R: R_, ct: Math.cos(R_ * 2.4) });
    };
    const addF = (type: number, n: number, r0: number, r1: number) => {
        for (let i = 0; i < n; i++) {
            const z = rnd() * 2 - 1, l = rnd() * Math.PI * 2, q = Math.sqrt(1 - z * z), R_ = r0 + rnd() * (r1 - r0);
            FEAT.push({ type, lat: Math.asin(z), lon: l, x: q * Math.sin(l), y: z, z: q * Math.cos(l), R: R_, ct: Math.cos(R_ * 2.4) });
        }
    };
    ([
        [0, 'Maat Mons', .9, 194.5, .04], [0, 'Sapas Mons', 8.5, 188.6, .035], [0, 'Ozza Mons', 4.5, 200, .03],
        [0, 'Sif Mons', 22, 352, .035], [0, 'Rhea Mons', 32.6, 284.5, .04], [0, 'Theia Mons', 23.5, 282, .04],
        [0, 'Idunn Mons', -46.4, 214.5, .03], [1, 'Mead crater (largest)', 12.5, 57.4, .04], [1, 'Cleopatra crater', 65.8, 7, .025],
    ] as any[]).forEach((a) => addAt(a[0], a[1], a[2], a[3], a[4]));
    addF(1, 80, .01, .025); addF(2, 45, .008, .016);
    const STARS = Array.from({ length: 230 }, () => ({ x: rnd() * 720, y: rnd() * 720, r: rnd() < .12 ? 1.6 : .9, p: rnd() * 6.28, s: .6 + rnd() * 1.8, a: .35 + rnd() * .65 }));
    return { FEAT, STARS };
}

export interface VenusAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
}

export const VenusAnimation: React.FC<VenusAnimationProps> = ({
    className = "",
    style = {},
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const ziRef = useRef<HTMLButtonElement>(null);
    const zoRef = useRef<HTMLButtonElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cv = cvRef.current;
        const tip = tipRef.current;
        const zi = ziRef.current;
        const zo = zoRef.current;
        const loading = loadingRef.current;
        if (!root || !cv || !tip || !zi || !zo || !loading) return;

        const ctx = cv.getContext("2d");
        if (!ctx) return;
        const off = document.createElement("canvas");
        const octx = off.getContext("2d");
        if (!octx) return;

        const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let cancelled = false;
        let rafId = 0, resizeRaf = 0;
        let ro: ResizeObserver | null = null;
        let io: IntersectionObserver | null = null;
        let loadDone = 0;
        const teardown: Array<() => void> = [];
        const ABORT: any = { abort: true };

        /* only do work while the disc is on screen and the tab is visible */
        let visible = typeof IntersectionObserver === "undefined";

        /* fixed feature set + starfield (deterministic, same seed as the reference) */
        const { FEAT, STARS } = buildScene();

        /* the equirectangular texture is filled once during boot */
        const tex = new Uint8ClampedArray(TW * TH * 3);

        /* ---------- variable-size disc buffer + display canvas ---------- */
        let CW = 720, CH = 560;                       /* display canvas size (device px) */
        let S = 0, R = 0;                             /* disc buffer edge + radius */
        let U0: any, V0: any, LAT: any, SH: any, RIM: any, AL: any;
        let IDX: number[] = [];
        let img: any = null, D: any = null;
        let needMap = false;

        const applySize = () => {
            const w = root.clientWidth || 720, h = root.clientHeight || 560;
            const d = Math.min(window.devicePixelRatio || 1, 2);
            CW = Math.max(1, Math.round(w * d));
            CH = Math.max(1, Math.round(h * d));
            cv.width = CW; cv.height = CH;
            const s = Math.round(Math.max(220, Math.min(560, Math.min(w, h))));
            if (s !== S) {
                S = s; R = S / 2;
                off.width = S; off.height = S;
                const n = S * S;
                U0 = new Float32Array(n); V0 = new Float32Array(n); LAT = new Float32Array(n);
                SH = new Float32Array(n); RIM = new Float32Array(n); AL = new Uint8Array(n);
                IDX = [];
                img = octx.createImageData(S, S); D = img.data;
                needMap = true;
            }
        };
        const SD0 = () => Math.min(CW, CH) * .78;

        /* ---------- per-pixel sphere mapping (recomputed only when the tilt changes) ---------- */
        function buildMap() {
            IDX = [];
            const c = Math.cos(TILT), s = Math.sin(TILT);
            for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
                const x = (i + .5 - R) / R, y = (R - j - .5) / R, rr = Math.sqrt(x * x + y * y), p = j * S + i;
                if (rr > 1.004) continue;
                const nz = Math.sqrt(Math.max(0, 1 - x * x - y * y)), m = Math.hypot(x, y, nz) || 1, nx = x / m, ny = y / m, nzz = nz / m;
                const yy = ny * c - nzz * s, zz = ny * s + nzz * c;
                U0[p] = Math.atan2(nx, zz) / (Math.PI * 2);
                LAT[p] = Math.asin(Math.max(-1, Math.min(1, yy)));
                V0[p] = (.5 - LAT[p] / Math.PI) * TH;
                const dd = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nzz * LIGHT[2]);
                SH[p] = .07 + 1.05 * Math.pow(dd, .72);
                RIM[p] = Math.pow(1 - nzz, 3.2) * .5 * Math.min(1, dd * 1.6);
                AL[p] = Math.max(0, Math.min(255, (1.004 - rr) * R * 1.4 * 255 / 1.4 | 0));
                if (rr < .99) AL[p] = 255;
                IDX.push(p);
            }
        }
        function retilt() {
            const c = Math.cos(TILT), s = Math.sin(TILT);
            for (let n = 0; n < IDX.length; n++) {
                const p = IDX[n], x = ((p % S) + .5 - R) / R, y = (R - ((p / S) | 0) - .5) / R;
                const nz = Math.sqrt(Math.max(0, 1 - x * x - y * y)), m = Math.sqrt(x * x + y * y + nz * nz) || 1, nx = x / m, ny = y / m, nzz = nz / m;
                const yy = ny * c - nzz * s, zz = ny * s + nzz * c;
                U0[p] = Math.atan2(nx, zz) / 6.2832;
                LAT[p] = Math.asin(Math.max(-1, Math.min(1, yy)));
                V0[p] = (.5 - LAT[p] / Math.PI) * TH;
            }
        }

        /* ---------- build the equirectangular texture (chunked + cancellable) ---------- */
        async function buildTexture() {
            for (let v = 0; v < TH; v++) {
                const phi = (.5 - (v + .5) / TH) * Math.PI, cp = Math.cos(phi), sp = Math.sin(phi);
                for (let u = 0; u < TW; u++) {
                    const lam = (u + .5) / TW * Math.PI * 2, x = cp * Math.sin(lam), y = sp, z = cp * Math.cos(lam);
                    const w = fbm(x * 1.6 + 5, y * 1.6, z * 1.6, 3);
                    const h = fbm(x * 3 + w * 1.5, y * 3 + w * 1.5 + 7, z * 3 + w * 1.5, 5);
                    let rg = 1 - Math.abs(2 * fbm(x * 7 + w * 2.2, y * 7 - 3 + w * 2.2, z * 7 + w * 2.2, 4) - 1); rg = rg * rg * rg;
                    const low = fbm(x * 1.2 + 20, y * 1.2, z * 1.2, 2);
                    let tt = .30 + (h - .5) * 1.6 + rg * .45 + (low - .5) * .6;
                    const jit = .8 + .4 * vn(x * 40, y * 40, z * 40);
                    for (let h2 = 0; h2 < HL.length; h2++) {
                        const hf = HL[h2], dp = x * hf.x + y * hf.y + z * hf.z;
                        if (dp > hf.ct) { const d2 = Math.acos(Math.min(1, dp)) / hf.R; tt += hf.m * (1 - d2) * (1 - d2 * .3) * (.65 + .7 * rg); }
                    }
                    tt += (vn(x * 120, y * 120, z * 120) - .5) * .12; /* radar speckle */
                    for (let f = 0; f < FEAT.length; f++) {
                        const F = FEAT[f], dp = x * F.x + y * F.y + z * F.z;
                        if (dp < F.ct) continue;
                        const r = Math.acos(Math.min(1, dp)) / F.R * jit;
                        if (F.type === 0) {
                            if (r < 1) tt *= .42 + .58 * r * r;
                            if (r < .13) tt = 1; else if (r > .85 && r < 1.25) tt += .28 * (1 - Math.abs(r - 1.05) / .2);
                        } else if (F.type === 1) {
                            if (r < .85) tt *= .62 + .3 * r; else if (r < 1.2) tt += .32 * (1 - Math.abs(r - 1) / .2);
                        } else {
                            if (r < .5) tt += .5 * (1 - r * 2);
                        }
                    }
                    tt = tt < 0 ? 0 : tt > 1 ? 1 : tt;
                    const li = (tt * 255) | 0, o = (v * TW + u) * 3;
                    tex[o] = LUT[li * 3]; tex[o + 1] = LUT[li * 3 + 1]; tex[o + 2] = LUT[li * 3 + 2];
                }
                if ((v & 15) === 15) { try { await yieldOff(); } catch (e) { if (e === ABORT) return false; } if (cancelled) return false; }
            }
            return true;
        }

        /* ---------- render one frame of the disc into the offscreen buffer ---------- */
        function renderSphere(ph: number) {
            D.fill(0);
            for (let n = 0; n < IDX.length; n++) {
                const p = IDX[n];
                let u = U0[p] + ph; u -= Math.floor(u);
                const fu = u * TW, x0 = fu | 0, wx = fu - x0, x1 = (x0 + 1) % TW;
                let fv = V0[p]; if (fv < 0) fv = 0; let y0 = fv | 0; if (y0 > TH - 2) y0 = TH - 2;
                const wy = Math.min(1, fv - y0), r0 = y0 * TW, r1 = r0 + TW;
                const a = (r0 + x0) * 3, b = (r0 + x1) * 3, c = (r1 + x0) * 3, d = (r1 + x1) * 3;
                const w00 = (1 - wx) * (1 - wy), w10 = wx * (1 - wy), w01 = (1 - wx) * wy, w11 = wx * wy;
                const sh = SH[p], rm = RIM[p], o = p * 4;
                const Rc = tex[a] * w00 + tex[b] * w10 + tex[c] * w01 + tex[d] * w11,
                    Gc = tex[a + 1] * w00 + tex[b + 1] * w10 + tex[c + 1] * w01 + tex[d + 1] * w11,
                    Bc = tex[a + 2] * w00 + tex[b + 2] * w10 + tex[c + 2] * w01 + tex[d + 2] * w11;
                D[o] = Rc * sh + rm * 255; D[o + 1] = Gc * sh + rm * 140; D[o + 2] = Bc * sh + rm * 50; D[o + 3] = AL[p];
            }
            octx.putImageData(img, 0, 0);
        }

        /* ---------- full frame: sky, glow, disc ---------- */
        function drawFrame(now: number) {
            const ph = now / DUR + yaw;                            /* surface drifts right -> left */
            ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, CW, CH);
            const sc = Math.max(1, Math.min(CW, CH) / 720), SD = SD0();
            for (const s of STARS) {
                const a = s.a * (.55 + .45 * Math.sin(now * s.s + s.p));
                ctx.fillStyle = 'rgba(255,246,230,' + a.toFixed(3) + ')';
                ctx.fillRect(s.x / 720 * CW, s.y / 720 * CH, s.r * sc, s.r * sc);
            }
            const g = ctx.createRadialGradient(CW / 2, CH / 2, SD / 2 * .96 * zoom, CW / 2, CH / 2, SD / 2 * 1.22 * zoom);
            g.addColorStop(0, 'rgba(255,150,50,.32)'); g.addColorStop(.4, 'rgba(255,110,30,.10)'); g.addColorStop(1, 'rgba(255,100,20,0)');
            ctx.fillStyle = g; ctx.fillRect(0, 0, CW, CH);
            renderSphere(ph);
            const Z = SD * zoom;
            ctx.drawImage(off, (CW - Z) / 2, (CH - Z) / 2, Z, Z);
            if (inspect && mouse) drawReticle();
        }
        function drawReticle() {
            ctx.strokeStyle = 'rgba(255,179,71,.9)'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 12, 0, 6.283); ctx.stroke();
        }

        /* ---------- state ---------- */
        let TILT = -0.12, yaw = 0, vyaw = 0, dragging = false, zoom = 1;
        const ptrs = new Map<number, [number, number]>();
        let playing = !REDUCED, loop = true, si = 1;
        const speeds = [.5, 1, 2, 4];
        let inspect = false, mouse: any = null, ready = false;
        let t = 0, last = 0, lastRender = 0, hovering = false;

        /* ---------- inspect probe ---------- */
        function probe(e: { clientX: number; clientY: number }) {
            if (dragging) return;
            const rect = cv.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (CW / (rect.width || 1)), y = (e.clientY - rect.top) * (CH / (rect.height || 1));
            mouse = { x, y };
            const SDp = SD0() * zoom;
            const i = Math.floor((x - CW / 2) / SDp * S + S / 2), j = Math.floor((y - CH / 2) / SDp * S + S / 2);
            if (!inspect || !ready || i < 0 || j < 0 || i >= S || j >= S || AL[j * S + i] < 250) { tip.style.display = 'none'; return; }
            const p = j * S + i;
            let u = U0[p] + t / DUR + yaw; u -= Math.floor(u);
            const lam = u * Math.PI * 2, phi = LAT[p], cp = Math.cos(phi);
            const px = cp * Math.sin(lam), py = Math.sin(phi), pz = cp * Math.cos(lam);
            let best: any = null, bd = 9;
            for (const F of FEAT) { const dd = Math.acos(Math.min(1, px * F.x + py * F.y + pz * F.z)); if (dd < F.R * 1.5 && dd < bd) { bd = dd; best = F; } }
            const lon = ((u * 360 + 180) % 360) - 180;
            tip.innerHTML = (best ? '<b>' + (best.name || TYPES[best.type].n) + '</b><br>\u2248 ' + Math.round(best.R * 2 * 6051.8) + ' km wide<br>' : '<b>' + hlName(px, py, pz) + '</b><br>') +
                'lat ' + (phi * 57.2958).toFixed(1) + '\u00b0 \u00b7 lon ' + lon.toFixed(1) + '\u00b0<br>true rotation: 243 Earth days (retrograde)';
            tip.style.display = 'block';
            tip.style.left = Math.max(4, Math.min((root.clientWidth || 0) - 250, (e.clientX - rect.left) + 14)) + 'px';
            tip.style.top = Math.max(4, Math.min((root.clientHeight || 0) - 70, (e.clientY - rect.top) - 10)) + 'px';
        }

        const setZoom = (z: number) => { zoom = Math.max(.5, Math.min(2.2, z)); if (ready) drawFrame(t); };
        function setInspect(v: boolean) {
            inspect = v; root.classList.toggle('inspect', v);
            if (!v) { tip.style.display = 'none'; mouse = null; }
            if (ready) drawFrame(t);
        }

        /* ---------- pointer / touch / keyboard ---------- */
        let lx = 0, ly = 0;
        const pd = () => { const a = [...ptrs.values()]; return Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); };
        const onMouseMove = (e: MouseEvent) => { probe(e); if (!playing && ready) drawFrame(t); };
        const onMouseLeave = () => { mouse = null; tip.style.display = 'none'; };
        const onPointerDown = (e: PointerEvent) => {
            ptrs.set(e.pointerId, [e.clientX, e.clientY]);
            dragging = true; lx = e.clientX; ly = e.clientY; vyaw = 0;
            try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            cv.classList.add('drag'); tip.style.display = 'none';
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!ptrs.has(e.pointerId)) return;
            if (dragging && ptrs.size === 1) {
                const rect = cv.getBoundingClientRect();
                const k = CW / (rect.width || 1);
                const dx = (e.clientX - lx) * k, dy = (e.clientY - ly) * k;
                lx = e.clientX; ly = e.clientY;
                const dz = SD0() / 2 * zoom;
                const dMove = dx / dz / 6.2832;
                yaw -= dMove; vyaw = -dMove;
                TILT = Math.max(-1.45, Math.min(1.45, TILT - dy / dz));
                retilt();
                if (ready) drawFrame(t);
            }
            if (ptrs.size === 2) { const o = pd(); ptrs.set(e.pointerId, [e.clientX, e.clientY]); setZoom(zoom * pd() / (o || 1)); }
            else ptrs.set(e.pointerId, [e.clientX, e.clientY]);
        };
        const onPointerUp = (e: PointerEvent) => { dragging = false; cv.classList.remove('drag'); ptrs.delete(e.pointerId); };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); setZoom(zoom * (e.deltaY < 0 ? 1.1 : 1 / 1.1)); };
        const onEnter = () => { hovering = true; };
        const onLeave = () => { hovering = false; };
        const onKeyDown = (e: KeyboardEvent) => {
            if (!hovering) return;
            if (e.key === 'i' || e.key === 'I') setInspect(!inspect);
            else if (e.key === 'Escape') setInspect(false);
            else if (e.key === ' ') { e.preventDefault(); playing = !playing; last = 0; if (ready) drawFrame(t); }
        };
        const onKeyDownZoom = (e: KeyboardEvent) => { if (e.key === '+' || e.key === '=') setZoom(zoom * 1.15); else if (e.key === '-') setZoom(zoom / 1.15); };

        cv.addEventListener('mousemove', onMouseMove);
        cv.addEventListener('mouseleave', onMouseLeave);
        cv.addEventListener('pointerdown', onPointerDown);
        cv.addEventListener('pointermove', onPointerMove);
        cv.addEventListener('pointerup', onPointerUp);
        cv.addEventListener('pointercancel', onPointerUp);
        cv.addEventListener('pointerenter', onEnter);
        cv.addEventListener('pointerleave', onLeave);
        cv.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keydown', onKeyDownZoom);
        teardown.push(() => {
            cv.removeEventListener('mousemove', onMouseMove);
            cv.removeEventListener('mouseleave', onMouseLeave);
            cv.removeEventListener('pointerdown', onPointerDown);
            cv.removeEventListener('pointermove', onPointerMove);
            cv.removeEventListener('pointerup', onPointerUp);
            cv.removeEventListener('pointercancel', onPointerUp);
            cv.removeEventListener('pointerenter', onEnter);
            cv.removeEventListener('pointerleave', onLeave);
            cv.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keydown', onKeyDownZoom);
        });

        const onZi = () => setZoom(zoom * 1.2);
        const onZo = () => setZoom(zoom / 1.2);
        zi.addEventListener('click', onZi);
        zo.addEventListener('click', onZo);
        teardown.push(() => { zi.removeEventListener('click', onZi); zo.removeEventListener('click', onZo); });

        /* ---------- sizing ---------- */
        applySize();
        ro = new ResizeObserver(() => {
            if (resizeRaf) return;
            resizeRaf = requestAnimationFrame(() => {
                resizeRaf = 0;
                applySize();
                if (needMap && ready) { buildMap(); needMap = false; }
                if (ready) drawFrame(t);
            });
        });
        ro.observe(root);
        teardown.push(() => { if (resizeRaf) cancelAnimationFrame(resizeRaf); if (ro) ro.disconnect(); });

        if (typeof IntersectionObserver !== "undefined") {
            io = new IntersectionObserver((entries) => { for (const en of entries) visible = en.isIntersecting; }, { rootMargin: "120px 0px" });
            io.observe(root);
        } else {
            visible = true;
        }
        const waitVisible = () => new Promise<void>((res, rej) => {
            const poll = () => { if (cancelled) return rej(ABORT); if (visible && !document.hidden) return res(); setTimeout(poll, 120); };
            poll();
        });
        const yieldOff = () => {
            if (cancelled) return Promise.reject(ABORT);
            if (!visible || document.hidden) return waitVisible();
            return new Promise<void>((r) => setTimeout(r, 0));
        };

        /* ---------- clock ---------- */
        function frame(now: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            if (!ready) return;
            if (!visible || document.hidden) { last = 0; return; }
            let need = false;
            if (playing) {
                if (last) t += (now - last) / 1000 * speeds[si];
                last = now;
                if (t >= DUR) { if (loop) t %= DUR; else { t = DUR; playing = false; } }
                need = true;
            } else last = 0;
            if (!dragging && Math.abs(vyaw) > 1e-5) { yaw += vyaw; vyaw *= .94; need = true; }
            if (need && (now - lastRender >= RENDER_MS || t === DUR)) { drawFrame(t); lastRender = now; }
        }

        (window as any).__duration = DUR; (window as any).__fps = FPS; (window as any).__count = FEAT.length;
        (window as any).__seek = (v: number) => { t = ((v % DUR) + DUR) % DUR; if (ready) drawFrame(t); };
        (window as any).__play = () => { playing = true; last = 0; };
        (window as any).__pause = () => { playing = false; };

        (async () => {
            try { await waitVisible(); } catch (e) { if (e === ABORT) return; return; }
            if (cancelled) return;
            const ok = await buildTexture();
            if (!ok || cancelled) return;
            buildMap(); needMap = false;
            ready = true;
            loading.style.opacity = "0";
            loadDone = window.setTimeout(() => { loading.style.display = "none"; }, 600);
            drawFrame(0);
            rafId = requestAnimationFrame(frame);
        })();

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            if (ro) ro.disconnect();
            if (io) io.disconnect();
            if (loadDone) clearTimeout(loadDone);
            for (const fn of teardown) fn();
            delete (window as any).__duration;
            delete (window as any).__fps;
            delete (window as any).__count;
            delete (window as any).__seek;
            delete (window as any).__play;
            delete (window as any).__pause;
        };
    }, []);

    return (
        <div ref={rootRef} className={`venus-root ${className}`} style={style}>
            <canvas
                ref={cvRef}
                className="venus-canvas"
                tabIndex={0}
                aria-label="Rotating Venus. Drag to turn it in any direction."
            />
            <div ref={tipRef} className="venus-tip" />
            <div className="venus-zoombar">
                <button ref={ziRef} className="venus-zbtn" aria-label="Zoom in">+</button>
                <button ref={zoRef} className="venus-zbtn" aria-label="Zoom out">&minus;</button>
            </div>
            <div ref={loadingRef} className="venus-loading">Forming Venus surface&hellip;</div>
        </div>
    );
};

export default VenusAnimation;
