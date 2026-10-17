// ── FILE: frontend/src/components/ui/MarsAnimation.tsx ──
// mars-animation — UI HUB
// "Mars": a fully procedural, endlessly rotating Mars rendered entirely in
// Canvas 2D — no WebGL, no libraries. A seeded CPU pass forges a seamless
// equirectangular surface (broad albedo features — Syrtis Major, Acidalia
// Planitia, Solis Lacus, the Mare belts; the bright Hellas / Argyre basins,
// Arabia Terra and Tharsis; the five great shield volcanoes — Olympus Mons and
// the Ascraeus / Pavonis / Arsia group; the Valles Marineris, Ius Chasma,
// Kasei Valles and Noctis Labyrinthus canyons; the bright spiral-capped polar
// ice caps; the 71°N rings; plus ~2,300 power-law craters with ejecta rays and
// wind streaks), packs it into albedo / east-north slope / dust-hue / cloud
// channels at 2048x1024, and raytraces the disc per pixel with bump-mapped
// relief, a dust-laned Milky Way behind it and two moons (Phobos and Deimos).
// Drag in any direction to turn the planet, flick for momentum, double-click or
// r to reset, arrow keys to nudge and Space to pause. A Sun slider re-lights the
// scene, and pressing i reveals the rotation axis, a graticule and a live probe
// that names the hovered feature, canyon, crater or moon.
//
// Original source: standalone HTML (a fixed full-viewport square canvas plus
// inline overlays and an inline script). Ported to React with no third-party
// runtime and no external assets: the noise, the albedo-hue colour table, the
// feature tables, the texture generator, the per-pixel sphere map sets, the
// trackball and the whole render loop are kept verbatim from the reference.
// Only the scaffolding changed: the html/body + `#stage`/`#cv`/`#legend`/`#tip`/
// `#boot`/`#sunbox` nodes became scoped refs on a container, every
// `innerWidth`/`innerHeight` became the container's box (so Mars centres and
// scales inside whatever area it is placed in), the window `resize` listener
// became a ResizeObserver on that container, pointer coordinates became
// container-relative, the `position:fixed` overlays became absolutely
// positioned inside the root, the window keyboard listener is guarded by an
// over-the-canvas pointer check (repo convention) so it never hijacks page
// keys, the external IBM Plex Mono webfont link was dropped in favour of the
// host font stack, and the `window.__*` harness hooks plus the `?capture` flag
// were removed. Rendering is gated by an IntersectionObserver + the Page
// Visibility API so an off-screen tile never burns CPU, and every listener,
// observer, timer and rAF is torn down on unmount. `compact` drops the
// generated surface to 1024x1024 for lighter library previews.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./MarsAnimation.css";

/* ================================================================
   Pure data + helpers (constant across instances)
   ================================================================ */
const D2R = Math.PI / 180, TAU = Math.PI * 2;

/* Named features (east longitude, latitude, size in degrees) */
const DARK: [string, number, number, number, number][] = [
  ['Syrtis Major', 69, 8, 8, 1.0], ['Acidalia Planitia', 340, 47, 13, .8], ['Solis Lacus', 270, -26, 6, .9],
  ['Mare Sirenum', 190, -35, 10, .85], ['Mare Cimmerium', 213, -22, 9, .85], ['Mare Tyrrhenum', 105, -15, 9, .75],
  ['Sinus Meridiani', 0, -2, 6, .6], ['Mare Erythraeum', 325, -25, 8, .65], ['Cerberus Palus', 170, 10, 9, .5],
  ['Aonia Terra', 265, -52, 7, .45], ['Utopia Planitia', 110, 47, 10, .4], ['Mare Acidalium', 20, 42, 9, .5]
];
const BRIGHT: [string, number, number, number, number][] = [
  ['Hellas Planitia', 70, -42, 10, .95], ['Argyre Planitia', 316, -50, 6, .75], ['Arabia Terra', 20, 22, 13, .5],
  ['Elysium Planitia', 150, 20, 10, .4], ['Tharsis', 240, 5, 16, .5], ['Chryse Planitia', 320, 25, 8, .4],
  ['Amazonis Planitia', 195, 25, 10, .5], ['Isidis Planitia', 88, 13, 6, .55], ['Noachis Terra', 340, -45, 12, .4]
];
const VOLCANOES: [string, number, number, number, number][] = [
  ['Olympus Mons', 226, 18, 2.8, .045], ['Ascraeus Mons', 255.5, 11.5, 1.9, .03], ['Pavonis Mons', 247, 1.5, 1.9, .028],
  ['Arsia Mons', 240, -9, 2.1, .03], ['Elysium Mons', 147, 25, 2.4, .03]
];
/* Canyons: lon range, start lat, lat slope per degree of lon, wobble, width, depth, albedo drop */
const TRENCH = [
  { l0: 262, l1: 330, lat: -6, s: -.075, wob: 1.1, w: 1.35, d: .03, al: 60 },    /* Valles Marineris */
  { l0: 274, l1: 293, lat: -1.5, s: -.19, wob: .6, w: .7, d: .02, al: 42 },      /* Ius Chasma */
  { l0: 286, l1: 322, lat: 23, s: .12, wob: 1.2, w: .55, d: .012, al: 32 },      /* Kasei Valles */
  { l0: 250, l1: 268, lat: -7, s: .06, wob: .9, w: .5, d: .014, al: 30 }         /* Noctis Labyrinthus */
];
const NAMED: [string, number, number, number][] = [['Valles Marineris', 295, -10, 26], ['Planum Boreum (north polar cap)', 0, 88, 12], ['Planum Australe (south polar cap)', 0, -89, 10]]
  .concat(DARK.map(f => [f[0], f[1], f[2], f[3] * 1.15]), BRIGHT.map(f => [f[0], f[1], f[2], f[3] * 1.15]),
          VOLCANOES.map(f => [f[0], f[1], f[2], f[3] * 2.4])) as [string, number, number, number][];

const MOONS = [
  { id: 'Phobos', a: 1.27, r: 5.2, cyc: 6, d: '22 km across, circles Mars every 7 h 39 min (sped up here)', col: [214, 140, 116] },
  { id: 'Deimos', a: 1.62, r: 3.8, cyc: 2, d: '12 km across, circles Mars every 30 h 18 min (sped up here)', col: [226, 184, 160] }
];

function mulberry32(a: number) {
  return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
const clamp = (v: number, a: number, b: number) => v < a ? a : v > b ? b : v;
const sstep = (a: number, b: number, v: number) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const mod = (v: number, m: number) => ((v % m) + m) % m;
function unit(lonDeg: number, latDeg: number) { const lo = lonDeg * D2R, la = latDeg * D2R;
  return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)] as number[]; }
const cross = (a: number[], b: number[]) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a: number[], b: number[]) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: number[]) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function makeNoise(seed: number) {
  const r = mulberry32(seed), pm = new Uint8Array(512), p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) pm[i] = p[i & 255];
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10), lerp = (t: number, a: number, b: number) => a + t * (b - a);
  const grad = (h: number, x: number, y: number, z: number) => { h &= 15; const u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); };
  return (x: number, y: number, z: number) => {
    let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x -= X; y -= Y; z -= Z; X &= 255; Y &= 255; Z &= 255;
    const u = fade(x), v = fade(y), w = fade(z);
    const A = pm[X] + Y, AA = pm[A] + Z, AB = pm[A + 1] + Z, B = pm[X + 1] + Y, BA = pm[B] + Z, BB = pm[B + 1] + Z;
    return lerp(w,
      lerp(v, lerp(u, grad(pm[AA], x, y, z), grad(pm[BA], x - 1, y, z)), lerp(u, grad(pm[AB], x, y - 1, z), grad(pm[BB], x - 1, y - 1, z))),
      lerp(v, lerp(u, grad(pm[AA + 1], x, y, z - 1), grad(pm[BA + 1], x - 1, y, z - 1)), lerp(u, grad(pm[AB + 1], x, y - 1, z - 1), grad(pm[BB + 1], x - 1, y - 1, z - 1))));
  };
}

const RAMP = [[0, 22, 12, 10], [40, 70, 30, 22], [85, 130, 52, 28], [120, 178, 66, 34], [150, 206, 92, 48],
              [180, 226, 128, 76], [210, 238, 170, 120], [235, 246, 208, 172], [255, 255, 250, 245]];
/* colour table: 256 albedo steps x 32 hue steps (0 grey basalt ... 12 red ... 31 yellow ochre dust) */
const CR = new Float32Array(8192), CG = new Float32Array(8192), CB = new Float32Array(8192);
(function () {
  for (let a = 0; a < 256; a++) {
    let s = 0; while (s < RAMP.length - 2 && a > RAMP[s + 1][0]) s++;
    const p = RAMP[s], q = RAMP[s + 1], t = clamp((a - p[0]) / (q[0] - p[0]), 0, 1);
    const r0 = p[1] + (q[1] - p[1]) * t, g0 = p[2] + (q[2] - p[2]) * t, b0 = p[3] + (q[3] - p[3]) * t, keep = 1 - sstep(225, 250, a);
    for (let h = 0; h < 32; h++) {
      let r = r0, g = g0, b = b0;
      if (h < 12) { const k = (12 - h) / 12 * keep, l = .3 * r + .55 * g + .15 * b, sat = 1 - .55 * k;
        r = l + (r - l) * sat - 6 * k; g = l + (g - l) * sat; b = l + (b - l) * sat + 8 * k; }
      else if (h > 12) { const k = (h - 12) / 19 * keep; r *= 1 + .05 * k; g *= 1 + .2 * k; b *= 1 - .15 * k; }
      const i = (a << 5) | h; CR[i] = r; CG[i] = g; CB[i] = b;
    }
  }
})();

export interface MarsAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** When true (library preview), forges a smaller surface for faster boot. */
    compact?: boolean;
}

export const MarsAnimation: React.FC<MarsAnimationProps> = ({
    className = "",
    style = {},
    compact = false,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const tipRef = useRef<HTMLDivElement>(null);
    const legendRef = useRef<HTMLDivElement>(null);
    const bootRef = useRef<HTMLDivElement>(null);
    const pctRef = useRef<HTMLSpanElement>(null);
    const sunRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cv = cvRef.current;
        const tip = tipRef.current;
        const legend = legendRef.current;
        const boot = bootRef.current;
        const pct = pctRef.current;
        const sunEl = sunRef.current;
        if (!root || !cv || !tip || !legend || !boot || !pct || !sunEl) return;
        const ctx = cv.getContext("2d");
        if (!ctx) return;

        let cancelled = false;
        let rafId = 0;
        let ro: ResizeObserver | null = null;
        let io: IntersectionObserver | null = null;
        let bootTimer = 0;

        /* ================================================================
           DATA: timeline and scene constants
           ================================================================ */
        const DUR = 48;                          /* one planet turn per loop (seamless) */
        const TILT_ROLL = 25.2, TILT_VIEW = 14;  /* starting axis lean (deg)            */
        const HI = !compact && (navigator.hardwareConcurrency || 8) >= 6;
        const TW = HI ? 2048 : 1024, TH = TW / 2;  /* surface detail texture            */
        const LW = 1024, LH = 512;               /* broad-feature layers + clouds     */
        /* W = reference scale (buffer shorter side) for planet/moon size; U,V = full-bleed buffer dims */
        let W = 720, U = 720, V = 720, CX = 360, CY = 360, RP = 205;

        /* ================================================================
           Orientation. View space is right-handed: x right, y up, z toward viewer.
           AX = north axis, XP = lon 0, YP = east, all expressed in view space.
           Dragging rotates these three vectors like a trackball.
           ================================================================ */
        const AX0 = norm([Math.sin(TILT_ROLL * D2R) * Math.cos(TILT_VIEW * D2R), Math.cos(TILT_ROLL * D2R) * Math.cos(TILT_VIEW * D2R), Math.sin(TILT_VIEW * D2R)]);
        const XP0 = norm([-AX0[0] * AX0[2], -AX0[1] * AX0[2], 1 - AX0[2] * AX0[2]]);
        const YP0 = cross(AX0, XP0);
        let AX = AX0.slice(), XP = XP0.slice(), YP = YP0.slice(), orientVer = 1;
        function rotView(phi: number, th: number) {   /* phi: about view Y (drag right), th: about view X (drag down) */
          const cp = Math.cos(phi), sp = Math.sin(phi), ct = Math.cos(th), st = Math.sin(th);
          const rot = (v: number[]) => { let x = v[0] * cp + v[2] * sp, z = -v[0] * sp + v[2] * cp;
            const y = v[1] * ct - z * st; z = v[1] * st + z * ct; return [x, y, z]; };
          AX = norm(rot(AX)); let x = rot(XP); const d = dot(x, AX); x = norm([x[0] - d * AX[0], x[1] - d * AX[1], x[2] - d * AX[2]]);
          XP = x; YP = cross(AX, XP); orientVer++;
        }
        function resetView() { AX = AX0.slice(); XP = XP0.slice(); YP = YP0.slice(); orientVer++; }

        /* ================================================================
           Surface textures (procedural, seamless on the sphere), built in slices
           TA albedo, TGE/TGN slopes east/north, TY dust hue, TC clouds (lower res)
           ================================================================ */
        let TA: Uint8Array | null = null, TGE: Int8Array | null = null, TGN: Int8Array | null = null,
            TY: Uint8Array | null = null, TC: Uint8Array | null = null;
        const CRATERS: any[] = [];

        function* buildTexture(): Generator<number, void, void> {
          const noise = makeNoise(11);
          const fbm = (x: number, y: number, z: number, oct: number) => { let s = 0, a = 1, t = 0, f = 1;
            for (let i = 0; i < oct; i++) { s += a * noise(x * f, y * f, z * f); t += a; a *= .5; f *= 2.03; } return s / t; };
          const LN = LW * LH, lowA = new Float32Array(LN), lowH = new Float32Array(LN), lowY = new Float32Array(LN);
          TC = new Uint8Array(LN);
          const cosLl = new Float32Array(LW), sinLl = new Float32Array(LW);
          for (let u = 0; u < LW; u++) { const lo = (u + .5) / LW * TAU; cosLl[u] = Math.cos(lo); sinLl[u] = Math.sin(lo); }
          const mk = (list: any[]) => list.map(f => { const v = unit(f[1], f[2]), s = f[3] * 1.35 * D2R, k = 1 / (1 - Math.cos(s));
            return { x: v[0], y: v[1], z: v[2], k, cut: Math.cos(s * 3.2), s: f[4] }; });
          const dk = mk(DARK), br = mk(BRIGHT), vo = VOLCANOES.map(f => { const v = unit(f[1], f[2]), s = f[3] * D2R;
            return { x: v[0], y: v[1], z: v[2], k: 1 / (1 - Math.cos(s)), cut: Math.cos(s * 3.2), h: f[4] }; });
          const hellas = unit(70, -42), argyre = unit(316, -50), kH = 1 / (1 - Math.cos(10 * D2R)), kA = 1 / (1 - Math.cos(5.5 * D2R));
          const oly = unit(226, 18), tharsis = unit(244, 3), kOly = 1 / (1 - Math.cos(3.4 * D2R)), kTh = 1 / (1 - Math.cos(11 * D2R));

          /* ---- pass 1: broad features at 1024 x 512 ---- */
          for (let v = 0; v < LH; v++) {
            const lat = (.5 - (v + .5) / LH) * Math.PI, sl = Math.sin(lat), cl = Math.cos(lat), latD = lat / D2R, aLat = Math.abs(latD);
            const rough = latD < 0 ? 1.25 : .7;
            for (let u = 0; u < LW; u++) {
              const i = v * LW + u, x = cl * cosLl[u], y = cl * sinLl[u], z = sl, lonD = (u + .5) / LW * 360;
              const wx = noise(x * 1.4 + 5.2, y * 1.4 + 1.3, z * 1.4 + 9.1) * .22, wy = noise(x * 1.4 + 11.7, y * 1.4 + 3.9, z * 1.4 + 2.2) * .22,
                    wz = noise(x * 1.4 + 2.9, y * 1.4 + 8.4, z * 1.4 + 6.6) * .22;
              const xw = x + wx, yw = y + wy, zw = z + wz, inv = 1 / Math.sqrt(xw * xw + yw * yw + zw * zw);
              const n1 = fbm(x * 3.2 + 13.1, y * 3.2 + 7.7, z * 3.2 + 3.3, 3), n0 = fbm(x * 1.3 + 21.3, y * 1.3 + 4.1, z * 1.3 + 15.7, 2);
              let Dsum = 0, Bsum = 0;
              for (let k = 0; k < dk.length; k++) { const f = dk[k], dt = (xw * f.x + yw * f.y + zw * f.z) * inv; if (dt > f.cut) Dsum += f.s * Math.exp(-(1 - dt) * f.k); }
              for (let k = 0; k < br.length; k++) { const f = br[k], dt = (xw * f.x + yw * f.y + zw * f.z) * inv; if (dt > f.cut) Bsum += f.s * Math.exp(-(1 - dt) * f.k); }
              const Dm = sstep(.1, .6, Dsum + .22 * n1), Bm = Bsum * (.7 + .5 * n1);
              let a = 152 + 46 * n0 + 24 * n1 - 100 * Dm + 42 * Bm, hue = 12 + 8 * n0 + 4 * n1 + 10 * Bm - 12 * Dm;
              let h = .010 * n1 * rough;
              const ring = Math.exp(-Math.pow((latD - 71) / 5, 2)) * (.5 + .5 * n1);
              a -= 45 * ring; hue -= 6 * ring;
              for (let k = 0; k < vo.length; k++) { const f = vo[k], dt = x * f.x + y * f.y + z * f.z;
                if (dt > f.cut) { const g = Math.exp(-(1 - dt) * f.k); h += f.h * g; a += 26 * g; hue += 3 * g; if (k === 0) a -= 30 * g * g * g * g; } }
              const dH = x * hellas[0] + y * hellas[1] + z * hellas[2]; if (dH > .9) { const g = Math.exp(-(1 - dH) * kH); h -= .045 * g; a += 14 * g; hue += 4 * g; }
              const dA = x * argyre[0] + y * argyre[1] + z * argyre[2]; if (dA > .95) { const g = Math.exp(-(1 - dA) * kA); h -= .02 * g; a += 10 * g; hue += 3 * g; }
              const dO = x * oly[0] + y * oly[1] + z * oly[2]; if (dO > .98) a += 8 * Math.exp(-(1 - dO) * kOly * .3);
              const dT = x * tharsis[0] + y * tharsis[1] + z * tharsis[2]; if (dT > .7) h += .012 * Math.exp(-(1 - dT) * kTh);
              for (let q = 0; q < TRENCH.length; q++) { const T = TRENCH[q];
                if (lonD < T.l0 - 2 || lonD > T.l1 + 2) continue;
                const t01 = (lonD - T.l0) / (T.l1 - T.l0), latv = T.lat + T.s * (lonD - T.l0) + T.wob * Math.sin(lonD * .21 + q * 2);
                const wv = T.w * Math.sqrt(Math.max(0, Math.sin(clamp(t01, 0, 1) * Math.PI))) + .2;
                const m = Math.exp(-Math.pow((latD - latv) / wv, 2)) * (.65 + .6 * n1) * sstep(0, .06, t01) * sstep(1.02, .94, t01);
                h -= T.d * m; a -= T.al * m; hue -= 5 * m; }
              const capN = Math.sin(lonD * .09) * .8 + noise(x * 6 + 3.3, y * 6 + 1.7, z * 6 + 8.8) * 4;
              const snowN = sstep(80 + capN - 1.2, 80 + capN + .7, latD), snowS = sstep(-84 - capN * .6 + 1.2, -84 - capN * .6 - .7, latD);
              const snow = Math.max(snowN, snowS * .95);
              const spir = Math.pow(Math.abs(Math.sin(lonD * D2R - (90 - aLat) * .62 + capN * .15)), 14);
              a = a + (252 - a) * snow - 34 * spir * snow * (aLat > 84 ? 1 : .6); h += .004 * snow; hue += (12 - hue) * snow;
              lowA[i] = a; lowH[i] = h; lowY[i] = hue;
              const cn = fbm(x * 1.6 + 31, y * 1.6 + 17, z * 1.6 + 5, 3), ridge = Math.pow(Math.max(0, 1 - Math.abs(cn) * 2.7), 2);
              const hood = sstep(55, 76, aLat) * .95, oro = Math.exp(-(1 - dT) * kTh * .8) * .7 + Math.exp(-(1 - dO) * kOly * .8) * .8;
              TC[i] = clamp(ridge * (.1 + hood + oro) * .8 * 255, 0, 215);
            }
            if ((v & 7) === 7) yield v / LH * .35;
          }

          /* ---- pass 2: resample to full resolution and add fine grain ---- */
          const N = TW * TH, Hf = new Float32Array(N), Af = new Float32Array(N), Yf = new Float32Array(N), SCL = TW / LW;
          const cosL = new Float32Array(TW), sinL = new Float32Array(TW);
          for (let u = 0; u < TW; u++) { const lo = (u + .5) / TW * TAU; cosL[u] = Math.cos(lo); sinL[u] = Math.sin(lo); }
          for (let v = 0; v < TH; v++) {
            const lat = (.5 - (v + .5) / TH) * Math.PI, sl = Math.sin(lat), cl = Math.cos(lat), rough = lat < 0 ? 1.25 : .7;
            const fy = (v + .5) / SCL - .5, y0 = Math.floor(fy), ty = fy - y0, ya = clamp(y0, 0, LH - 1) * LW, yb = clamp(y0 + 1, 0, LH - 1) * LW;
            for (let u = 0; u < TW; u++) {
              const fx = (u + .5) / SCL - .5, x0 = Math.floor(fx), tx = fx - x0, xa = (x0 + LW) % LW, xb = (x0 + 1 + LW) % LW;
              const w00 = (1 - tx) * (1 - ty), w10 = tx * (1 - ty), w01 = (1 - tx) * ty, w11 = tx * ty;
              const i00 = ya + xa, i10 = ya + xb, i01 = yb + xa, i11 = yb + xb;
              const x = cl * cosL[u], y = cl * sinL[u], z = sl, i = v * TW + u;
              const f1 = fbm(x * 14 + 2.5, y * 14 + 9.1, z * 14 + 4.4, 2), f2 = noise(x * 46 + 7.7, y * 46 + 1.2, z * 46 + 5.5);
              Af[i] = lowA[i00] * w00 + lowA[i10] * w10 + lowA[i01] * w01 + lowA[i11] * w11 + 13 * f1 + 6 * f2;
              Hf[i] = lowH[i00] * w00 + lowH[i10] * w10 + lowH[i01] * w01 + lowH[i11] * w11 + (.0022 * f1 + .0009 * f2) * rough;
              Yf[i] = lowY[i00] * w00 + lowY[i10] * w10 + lowY[i01] * w01 + lowY[i11] * w11 + 3 * f1;
            }
            if ((v & 15) === 15) yield .35 + v / TH * .4;
          }

          /* ---- craters: power-law sizes, denser in the old southern highlands; ejecta rays, wind streaks ---- */
          const rnd = mulberry32(2024);
          let tries = 0;
          while (CRATERS.length < 2300 && tries < 14000) {
            tries++;
            const lat = Math.asin(rnd() * 2 - 1);
            if (lat > 0 && rnd() > .4) continue;
            const lon = rnd() * TAU, rd = clamp(.42 / Math.pow(rnd() + 1e-4, .46), .42, 7), old = rnd() < .4;
            const c: any = { lon, lat, rr: rd * D2R, rd, x: Math.cos(lat) * Math.cos(lon), y: Math.cos(lat) * Math.sin(lon), z: Math.sin(lat),
                        fresh: (.6 + rnd() * .8) * (old ? .6 : 1), old, ray: 0, streak: 0, sk: 1, ph: rnd() * TAU };
            if (!old && rd > 1 && rd < 3 && rnd() < .16) c.ray = 1;
            else if (rd > 1 && rd < 2.6 && rnd() < .3) { c.streak = rnd() < .8 ? 1 : -1; c.sk = rnd() < .5 ? 1 : -1; }
            CRATERS.push(c);
          }
          for (let ci = 0; ci < CRATERS.length; ci++) {
            const c = CRATERS[ci], spanK = c.ray ? 6 : c.streak ? 7 : 2.6;
            const depth = (c.rr < .03 ? .15 * c.rr : .13 * c.rr * .6 + .0015) * (c.rd > 2 ? .55 : c.rd < 1 ? .75 : 1) * (c.old ? .55 : 1), span = spanK * c.rd;
            const v0 = clamp(Math.floor((.5 - (c.lat / Math.PI + span * D2R / Math.PI)) * TH), 0, TH - 1),
                  v1 = clamp(Math.ceil((.5 - (c.lat / Math.PI - span * D2R / Math.PI)) * TH), 0, TH - 1);
            const cs = Math.max(.1, Math.cos(c.lat)), halfLon = span / cs, u0 = Math.floor((c.lon / TAU - halfLon / 360) * TW), u1 = Math.ceil((c.lon / TAU + halfLon / 360) * TW);
            const cosX = Math.cos(Math.min(spanK * c.rr, 1.2)), special = c.ray || c.streak;
            for (let v = v0; v <= v1; v++) {
              const lat = (.5 - (v + .5) / TH) * Math.PI, sl = Math.sin(lat), cl = Math.cos(lat), dyy = (lat - c.lat) / c.rr;
              for (let uu = u0; uu <= u1; uu++) {
                const u = ((uu % TW) + TW) % TW, lo = (u + .5) / TW * TAU;
                const dt = cl * Math.cos(lo) * c.x + cl * Math.sin(lo) * c.y + sl * c.z;
                if (dt < cosX) continue;
                const th = Math.acos(dt > 1 ? 1 : dt), x = th / c.rr, i = v * TW + u;
                let h = 0, a = 0;
                if (x < 1) { h -= depth * (1 - x * x); a -= 17 * c.fresh * (1 - x * x * .5); if (c.rd > 2.6) h += depth * .32 * Math.exp(-Math.pow(x / .12, 2)); }
                if (x < 2.6) { h += depth * .38 * Math.exp(-Math.pow((x - 1.04) / .17, 2));
                  if (x > 1) { h += depth * .1 * Math.exp(-(x - 1) / .7); a += 12 * c.fresh * Math.exp(-(x - 1) / .55); } }
                if (special) {
                  let dl = lo - c.lon; dl -= TAU * Math.round(dl / TAU); const dxx = dl * cl / c.rr;
                  if (c.ray && x > 1.1) { const ang = Math.atan2(dyy, dxx), ray = Math.pow(Math.max(0, Math.cos(ang * 7 + c.ph)), 10);
                    a += 24 * c.fresh * ray * Math.exp(-(x - 1) / 3.2) * sstep(1.1, 1.6, x); }
                  if (c.streak) { const dd = dxx * c.streak;
                    if (dd > .9 && dd < 7) a += c.sk * 12 * Math.exp(-Math.pow(dyy / .55, 2)) * sstep(.9, 1.6, dd) * sstep(7, 3.5, dd); }
                }
                if (h !== 0) Hf[i] += h; if (a !== 0) Af[i] += a;
              }
            }
            if ((ci % 120) === 119) yield .75 + ci / CRATERS.length * .17;
          }

          /* ---- slopes -> quantised bump channels; baked occlusion in hollows; bytes ---- */
          const kAO = 40000 * (TW / 1024) * (TW / 1024);
          TA = new Uint8Array(N); TGE = new Int8Array(N); TGN = new Int8Array(N); TY = new Uint8Array(N);
          for (let v = 0; v < TH; v++) {
            const lat = (.5 - (v + .5) / TH) * Math.PI, dx = (TAU / TW) * Math.max(.12, Math.cos(lat)), dy = Math.PI / TH;
            const vn = Math.max(0, v - 1) * TW, vs = Math.min(TH - 1, v + 1) * TW, row = v * TW;
            for (let u = 0; u < TW; u++) {
              const i = row + u, hl = Hf[row + ((u - 1) & (TW - 1))], hr = Hf[row + ((u + 1) & (TW - 1))], hn = Hf[vn + u], hs = Hf[vs + u];
              TGE![i] = clamp(Math.round((hr - hl) / (2 * dx) * 60), -127, 127);
              TGN![i] = clamp(Math.round((hn - hs) / (2 * dy) * 60), -127, 127);
              const lap = hl + hr + hn + hs - 4 * Hf[i];
              TA![i] = clamp(Math.round(Af[i] - clamp(lap * kAO, -9, 18)), 0, 255);
              TY![i] = clamp(Math.round(Yf[i]), 0, 31);
            }
            if ((v & 31) === 31) yield .92 + v / TH * .08;
          }
        }

        /* ================================================================
           Sphere map sets. Static per-pixel data is built once per size; the
           orientation-dependent part is refreshed only while the user turns the planet.
           ================================================================ */
        const AMB = .1, SH = new Float32Array(1024);
        for (let i = 0; i < 1024; i++) SH[i] = AMB + (1 - AMB) * Math.pow(i / 1023, .8);
        const LV = (function () { const p = 140 * D2R, s = Math.sqrt(1 - .72 * .72); return [Math.cos(p) * s, Math.sin(p) * s, .72]; })();
        const BUMP = 1.1 / 60;

        interface MarsSet {
            S: number; n: number; out: Int32Array; cov: Uint8Array;
            px: Float32Array; py: Float32Array; pz: Float32Array;
            qx: Float32Array; qy: Float32Array; qz: Float32Array;
            PL: Float32Array; hzL: Float32Array; csh: Float32Array;
            uB: Float32Array; EL: Float32Array; NL: Float32Array;
            vRow: Int32Array; cRow: Int32Array; ver: number;
            cv: HTMLCanvasElement; ctx: CanvasRenderingContext2D; img: ImageData;
        }

        function makeSet(S: number): MarsSet {
          const R = S / 2, lim = 1 + 1.2 / R, cnt: number[] = [];
          for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
            const nx = (px + .5 - R) / R, ny = (R - py - .5) / R; if (nx * nx + ny * ny <= lim * lim) cnt.push(py * S + px);
          }
          const n = cnt.length, f = () => new Float32Array(n);
          const ms: MarsSet = { S, n, out: Int32Array.from(cnt), cov: new Uint8Array(n), px: f(), py: f(), pz: f(), qx: f(), qy: f(), qz: f(),
                       PL: f(), hzL: f(), csh: f(), uB: f(), EL: f(), NL: f(), vRow: new Int32Array(n), cRow: new Int32Array(n), ver: 0,
                       cv: document.createElement('canvas'), ctx: null as any, img: null as any };
          for (let k = 0; k < n; k++) {
            const idx = cnt[k], px = idx % S, py = (idx - px) / S;
            let nx = (px + .5 - R) / R, ny = (R - py - .5) / R; const r = Math.hypot(nx, ny); let nz: number;
            ms.cov[k] = Math.round(clamp((1 + .7 / R - r) * R, 0, 1) * 255);
            if (r > 1) { nx /= r; ny /= r; nz = 0; } else nz = Math.sqrt(1 - r * r);
            ms.px[k] = nx; ms.py[k] = ny; ms.pz[k] = nz;
          }
          lightSet(ms);
          ms.cv.width = ms.cv.height = S; ms.ctx = ms.cv.getContext('2d')!; ms.img = ms.ctx.createImageData(S, S);
          return ms;
        }
        /* light-dependent per-pixel values; re-run whenever the Sun slider moves */
        function lightSet(ms: MarsSet) {
          for (let k = 0; k < ms.n; k++) {
            const nx = ms.px[k], ny = ms.py[k], nz = ms.pz[k];
            ms.qx[k] = ny * LV[2] - nz * LV[1]; ms.qy[k] = nz * LV[0] - nx * LV[2]; ms.qz[k] = nx * LV[1] - ny * LV[0];
            const pl = nx * LV[0] + ny * LV[1] + nz * LV[2]; ms.PL[k] = pl;
            ms.hzL[k] = Math.pow(1 - nz, 3) * .55 * clamp(pl + .35, 0, 1);
            ms.csh[k] = SH[(clamp(pl, 0, 1) * 1023) | 0];
          }
          ms.ver = -1;
        }
        function setSun(deg: number) {
          const p = deg * D2R, s = Math.sqrt(1 - .72 * .72);
          LV[0] = Math.cos(p) * s; LV[1] = Math.sin(p) * s; LV[2] = .72;
          if (full) lightSet(full); if (coarse && coarse !== full) lightSet(coarse);
          needDraw = true;
        }
        function orient(ms: MarsSet) {
          const ax = AX[0], ay = AX[1], az = AX[2], xx = XP[0], xy = XP[1], xz = XP[2], yx = YP[0], yy = YP[1], yz = YP[2];
          const al = ax * LV[0] + ay * LV[1] + az * LV[2], iT = 1 / TAU;
          for (let k = 0; k < ms.n; k++) {
            const px = ms.px[k], py = ms.py[k], pz = ms.pz[k];
            let s = ax * px + ay * py + az * pz; s = s > 1 ? 1 : s < -1 ? -1 : s;
            const v = .5 - Math.asin(s) / Math.PI;
            let rr = (v * TH) | 0; ms.vRow[k] = (rr < 0 ? 0 : rr > TH - 1 ? TH - 1 : rr) * TW;
            rr = (v * LH) | 0; ms.cRow[k] = (rr < 0 ? 0 : rr > LH - 1 ? LH - 1 : rr) * LW;
            ms.uB[k] = Math.atan2(yx * px + yy * py + yz * pz, xx * px + xy * py + xz * pz) * iT;
            const c2 = 1 - s * s;
            if (c2 < 1e-5) { ms.EL[k] = 0; ms.NL[k] = 0; }
            else { const ic = 1 / Math.sqrt(c2); ms.EL[k] = (ax * ms.qx[k] + ay * ms.qy[k] + az * ms.qz[k]) * ic; ms.NL[k] = (al - s * ms.PL[k]) * ic; }
          }
          ms.ver = orientVer;
        }
        function renderPlanet(ms: MarsSet, tSec: number) {
          const data = ms.img.data, out = ms.out, uB = ms.uB, vR = ms.vRow, cR = ms.cRow, PL = ms.PL, EL = ms.EL, NL = ms.NL, hz = ms.hzL, csh = ms.csh, cov = ms.cov;
          const rotT = tSec / DUR, rotC = rotT + .0068 * Math.sin(TAU * tSec / DUR) + .004 * Math.sin(TAU * 3 * tSec / DUR);
          const MASK = TW - 1, CMASK = LW - 1, n = ms.n;
          for (let k = 0; k < n; k++) {
            const ub = uB[k], row = vR[k];
            let xs = ub - rotT; xs -= Math.floor(xs);
            const pos = xs * TW, i0 = pos | 0, fr = pos - i0, w0 = 1 - fr, a0 = row + i0, a1 = row + ((i0 + 1) & MASK);
            const a = TA![a0] * w0 + TA![a1] * fr, ge = TGE![a0] * w0 + TGE![a1] * fr, gn = TGN![a0] * w0 + TGN![a1] * fr, hy = TY![a0] * w0 + TY![a1] * fr;
            let d = PL[k] - (ge * EL[k] + gn * NL[k]) * BUMP; d = d < 0 ? 0 : d > 1 ? 1 : d;
            const sh = SH[(d * 1023) | 0], ci = ((a | 0) << 5) | (hy | 0);
            let r = CR[ci] * sh, g = CG[ci] * sh, b = CB[ci] * sh;
            let xc = ub - rotC; xc -= Math.floor(xc);
            const pc = xc * LW, c0 = pc | 0, fc = pc - c0, cr = cR[k];
            const ca = (TC![cr + c0] * (1 - fc) + TC![cr + ((c0 + 1) & CMASK)] * fc) * (.78 / 255);
            if (ca > .01) { const cs = csh[k]; r += (244 * cs - r) * ca; g += (222 * cs - g) * ca; b += (212 * cs - b) * ca; }
            const h = hz[k]; r += h * 210; g += h * 100; b += h * 62;
            const o = out[k] * 4; data[o] = r; data[o + 1] = g; data[o + 2] = b; data[o + 3] = cov[k];
          }
          ms.ctx.putImageData(ms.img, 0, 0);
        }

        /* ================================================================
           Background: dust-laned Milky Way band and stars (rebuilt on resize)
           ================================================================ */
        const bg = document.createElement('canvas');
        let TWINK: { x: number; y: number; s: number; k: number; ph: number; al: number }[] = [];
        function buildBg() {
          bg.width = U; bg.height = V; TWINK = [];
          const c = bg.getContext('2d')!, rnd = mulberry32(99), k = W / 720;
          c.fillStyle = '#04040a'; c.fillRect(0, 0, U, V);
          c.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 44; i++) {
            const t = i / 43, bx = U * (1.0 - t * .42) + (rnd() - .5) * 90 * k, by = V * (.02 + t * .3) + (rnd() - .5) * 70 * k, rad = (80 + rnd() * 110) * k;
            const gr = c.createRadialGradient(bx, by, 0, bx, by, rad);
            gr.addColorStop(0, 'rgba(140,84,58,' + (.07 + rnd() * .05).toFixed(3) + ')'); gr.addColorStop(1, 'rgba(140,84,58,0)');
            c.fillStyle = gr; c.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
          }
          c.globalCompositeOperation = 'source-over';
          for (let i = 0; i < 26; i++) {
            const t = rnd(), bx = U * (1.04 - t * .44) + (rnd() - .5) * 60 * k, by = V * (-.02 + t * .34) + (rnd() - .5) * 50 * k, rad = (18 + rnd() * 34) * k;
            const gr = c.createRadialGradient(bx, by, 0, bx, by, rad); gr.addColorStop(0, 'rgba(2,2,6,.5)'); gr.addColorStop(1, 'rgba(2,2,6,0)');
            c.fillStyle = gr; c.fillRect(bx - rad, by - rad, rad * 2, rad * 2);
          }
          for (let i = 0; i < 560; i++) {
            let x, y;
            if (i < 170) { const t = rnd(); x = U * (1.04 - t * .44) + (rnd() - .5) * 150 * k; y = V * (-.02 + t * .34) + (rnd() - .5) * 110 * k; }
            else { x = rnd() * U; y = rnd() * V; }
            const m = rnd(), s = (m > .985 ? 1.5 : m > .93 ? 1 : .55) * Math.max(.8, k), al = .25 + rnd() * .65, tint = rnd();
            c.fillStyle = tint > .8 ? 'rgba(255,220,190,' + al + ')' : tint < .15 ? 'rgba(190,210,255,' + al + ')' : 'rgba(255,255,255,' + al + ')';
            c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill();
            if (s > 1.4) { const gl = c.createRadialGradient(x, y, 0, x, y, 7 * k); gl.addColorStop(0, 'rgba(255,255,255,.28)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gl; c.fillRect(x - 7 * k, y - 7 * k, 14 * k, 14 * k); }
            if (s >= 1 && TWINK.length < 70) TWINK.push({ x, y, s, k: 4 + ((rnd() * 7) | 0), ph: rnd(), al });
          }
        }

        /* ================================================================
           Main canvas, clock, interaction
           ================================================================ */
        const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let t = 0, spinning = !REDUCED, last: number | null = null, dragging = false, inspect = false, mouse: { x: number; y: number } | null = null;
        let ready = false, needDraw = true, slow = 0, tier = 0, velX = 0, velY = 0, full: MarsSet | null = null, coarse: MarsSet | null = null;
        let hovering = false, visible = typeof IntersectionObserver === 'undefined';
        const TIERS = [1, .8, .64];

        function moonVec(m: any, ph: number) {
          const c = Math.cos(ph) * m.a, s = Math.sin(ph) * m.a;
          return [c * XP[0] + s * YP[0] + .05 * s * AX[0], c * XP[1] + s * YP[1] + .05 * s * AX[1], c * XP[2] + s * YP[2] + .05 * s * AX[2]];
        }
        const toScreen = (v: number[]) => [CX + RP * v[0], CY - RP * v[1]];
        function surfaceAt(mx: number, my: number, theta: number) {
          const nx = (mx - CX) / RP, ny = (CY - my) / RP, r2 = nx * nx + ny * ny;
          if (r2 > 1) return null;
          const P = [nx, ny, Math.sqrt(1 - r2)], lat = Math.asin(clamp(dot(P, AX), -1, 1));
          const lon = mod(Math.atan2(dot(P, YP), dot(P, XP)) - theta, TAU);
          return { lat: lat / D2R, lon: lon / D2R, vec: unit(lon / D2R, lat / D2R) };
        }
        function describe(sf: any) {
          const v = sf.vec; let name: string | null = null, best = 1e9;
          for (const f of NAMED) { const u = unit(f[1], f[2]), ang = Math.acos(clamp(dot(u, v), -1, 1)) / D2R; if (ang < f[3] && ang / f[3] < best) { best = ang / f[3]; name = f[0]; } }
          if (!name) name = sf.lat > 22 ? 'Northern lowlands' : 'Southern highlands';
          let cr: any = null;
          for (const c of CRATERS) { const dt = c.x * v[0] + c.y * v[1] + c.z * v[2]; if (dt > Math.cos(c.rr)) { if (!cr || c.rr < cr.rr) cr = c; } }
          return { name, crater: cr };
        }
        const fmtLat = (l: number) => Math.abs(l).toFixed(1) + '\u00b0' + (l >= 0 ? 'N' : 'S'), fmtLon = (l: number) => l.toFixed(1) + '\u00b0E';

        function drawGraticule(theta: number) {
          ctx.save(); ctx.lineWidth = 1; ctx.strokeStyle = 'rgba(255,214,176,.38)'; ctx.setLineDash([2, 4]);
          const seg = (lonF: (f: number) => number, latF: (f: number) => number, n: number) => { ctx.beginPath(); let pen = false;
            for (let i = 0; i <= n; i++) { const lo = lonF(i / n), la = latF(i / n), cl = Math.cos(la * D2R), a = lo * D2R + theta, sl = Math.sin(la * D2R);
              const ca = cl * Math.cos(a), sa = cl * Math.sin(a), v = [ca * XP[0] + sa * YP[0] + sl * AX[0], ca * XP[1] + sa * YP[1] + sl * AX[1], ca * XP[2] + sa * YP[2] + sl * AX[2]];
              if (v[2] > 0) { const p = toScreen(v); pen ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }
            ctx.stroke(); };
          for (let lo = 0; lo < 360; lo += 30) seg(() => lo, f => -90 + 180 * f, 60);
          for (let la = -60; la <= 60; la += 30) seg(f => 360 * f, () => la, 120);
          ctx.setLineDash([]); ctx.strokeStyle = 'rgba(255,122,69,.85)'; ctx.lineWidth = 1.5; ctx.beginPath();
          ctx.moveTo(CX - AX[0] * RP * 1.3, CY + AX[1] * RP * 1.3); ctx.lineTo(CX + AX[0] * RP * 1.3, CY - AX[1] * RP * 1.3); ctx.stroke();
          ctx.fillStyle = 'rgba(255,122,69,.95)'; ctx.font = '600 13px ' + getComputedStyle(root).fontFamily;
          ctx.fillText('N', CX + AX[0] * RP * 1.3 + 6, CY - AX[1] * RP * 1.3 - 2);
          ctx.restore();
        }
        function drawOrbits() {
          ctx.save(); ctx.setLineDash([3, 5]); ctx.lineWidth = 1;
          for (const m of MOONS) { ctx.strokeStyle = 'rgba(' + m.col.join(',') + ',.35)'; ctx.beginPath();
            for (let i = 0; i <= 120; i++) { const p = toScreen(moonVec(m, i / 120 * TAU)); i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } ctx.stroke(); }
          ctx.restore();
        }
        function drawMoon(m: any, ph: number, front: boolean) {
          const v = moonVec(m, ph);
          if ((v[2] > 0) !== front) return;
          const p = toScreen(v), r = m.r * (W / 720) * (1 + .18 * v[2] / m.a), lx = LV[0], ly = -LV[1], c = m.col;
          const g = ctx.createRadialGradient(p[0] + lx * r * .45, p[1] + ly * r * .45, 0, p[0], p[1], r * 1.1);
          g.addColorStop(0, 'rgb(' + c.join(',') + ')'); g.addColorStop(.6, 'rgb(' + c.map((x: number) => x * .5 | 0).join(',') + ')'); g.addColorStop(1, 'rgb(' + c.map((x: number) => x * .16 | 0).join(',') + ')');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, TAU); ctx.fill();
        }

        function draw() {
          needDraw = false;
          const theta = TAU * t / DUR;
          ctx.drawImage(bg, 0, 0);
          for (const s of TWINK) { const a = s.al * (.55 + .45 * Math.sin(TAU * (s.k * t / DUR + s.ph)));
            ctx.fillStyle = 'rgba(255,240,225,' + a.toFixed(3) + ')'; ctx.beginPath(); ctx.arc(s.x, s.y, s.s, 0, TAU); ctx.fill(); }
          if (!ready) return;
          /* atmosphere: dusty orange limb glow, thicker toward the sun, with a thin pale-blue ice haze at the very edge */
          const ll = Math.hypot(LV[0], LV[1]) || 1, gx = CX + LV[0] / ll * RP * .07, gy = CY - LV[1] / ll * RP * .07;
          const gl = ctx.createRadialGradient(gx, gy, RP * .93, gx, gy, RP * 1.22);
          gl.addColorStop(0, 'rgba(255,112,64,.5)'); gl.addColorStop(.17, 'rgba(240,96,56,.3)'); gl.addColorStop(.3, 'rgba(150,170,255,.2)');
          gl.addColorStop(.42, 'rgba(210,90,60,.1)'); gl.addColorStop(1, 'rgba(200,50,30,0)');
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = gl; ctx.fillRect(0, 0, U, V); ctx.restore();
          for (const m of MOONS) drawMoon(m, TAU * m.cyc * t / DUR + .6, false);
          const moving = dragging || Math.abs(velX) > .01 || Math.abs(velY) > .01;
          const ms = (moving ? coarse : full) as MarsSet;
          const t0 = performance.now();
          if (ms.ver !== orientVer) orient(ms);
          renderPlanet(ms, t);
          ctx.drawImage(ms.cv, CX - RP, CY - RP, RP * 2, RP * 2);
          if (spinning && !moving && tier < TIERS.length - 1) { slow = performance.now() - t0 > 13 ? slow + 1 : Math.max(0, slow - 1);
            if (slow > 45) { slow = 0; tier++; rebuildSets(); } }
          for (const m of MOONS) drawMoon(m, TAU * m.cyc * t / DUR + .6, true);
          if (inspect) { drawOrbits(); drawGraticule(theta); hover(theta); }
        }

        function hover(theta: number) {
          if (!mouse) { tip!.style.display = 'none'; return; }
          let html: string | null = null;
          for (const m of MOONS) { const p = toScreen(moonVec(m, TAU * m.cyc * t / DUR + .6));
            if (Math.hypot(mouse.x - p[0], mouse.y - p[1]) < 11 * W / 720) { html = '<b>' + m.id + '</b><br><span>' + m.d + '</span>'; ctx.save(); ctx.strokeStyle = '#fff'; ctx.setLineDash([3, 2]);
              ctx.beginPath(); ctx.arc(p[0], p[1], 9 * W / 720, 0, TAU); ctx.stroke(); ctx.restore(); break; } }
          if (!html) { const sf = surfaceAt(mouse.x, mouse.y, theta);
            if (sf) { const d = describe(sf);
              html = '<b>' + d.name + '</b><br><span>' + fmtLat(sf.lat) + ', ' + fmtLon(sf.lon) + '</span>';
              if (d.crater) html += '<br>Impact crater, about ' + Math.round(2 * d.crater.rr * 3389).toLocaleString() + ' km wide';
              ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 5, 0, TAU); ctx.stroke(); ctx.restore(); } }
          if (!html) { tip!.style.display = 'none'; return; }
          tip!.innerHTML = html;
          const cr = cv!.getBoundingClientRect(), rr = root!.getBoundingClientRect(), sc = cr.width / U;
          let tx = (cr.left - rr.left) + (mouse.x + 14) * sc, ty = (cr.top - rr.top) + (mouse.y + 16) * sc;
          tip!.style.display = 'block';
          if (tx + tip!.offsetWidth > root!.clientWidth - 8) tx = (cr.left - rr.left) + (mouse.x - 14) * sc - tip!.offsetWidth;
          if (ty + tip!.offsetHeight > root!.clientHeight - 8) ty = (cr.top - rr.top) + (mouse.y - 12) * sc - tip!.offsetHeight;
          tip!.style.left = Math.max(4, tx) + 'px'; tip!.style.top = Math.max(4, ty) + 'px';
        }

        function renderLegend() {
          const items: [string, string][] = [['Surface albedo', '#c4552a'], ['Craters ' + CRATERS.length.toLocaleString(), '#7a3a26'], ['Canyons', '#4a2218'], ['Polar caps', '#fff4ec'],
                         ['Cloud filaments', '#e9d8d0'], ['Phobos', '#c4866e'], ['Deimos', '#d2ac96'], ['Rotation axis', '#ff7a45']];
          legend!.innerHTML = items.map(i => '<span class="mars-chip"><i style="background:' + i[1] + '"></i>' + i[0] + '</span>').join('');
        }
        function setInspect(v?: boolean) {
          inspect = v === undefined ? !inspect : v; root!.classList.toggle('inspect', inspect);
          legend!.style.display = inspect ? 'flex' : 'none'; if (!inspect) tip!.style.display = 'none'; needDraw = true;
        }

        function frame(ts: number) {
          if (cancelled) return;
          rafId = requestAnimationFrame(frame);
          if (!visible || document.hidden) { last = null; return; }
          if (last == null) last = ts; let dt = (ts - last) / 1000; last = ts; if (dt > .1) dt = .1;
          if (ready) {
            if (spinning && !dragging) { t += dt; if (t >= DUR) t -= DUR; needDraw = true; }
            if (!dragging && (Math.abs(velX) > .01 || Math.abs(velY) > .01)) {   /* glide after release */
              rotView(velX * dt, velY * dt); const k = Math.exp(-dt * 2.6); velX *= k; velY *= k;
              if (Math.abs(velX) <= .01 && Math.abs(velY) <= .01) { velX = velY = 0; }
              needDraw = true;
            } else if (!dragging && needDraw === false && full && full.ver !== orientVer) needDraw = true;
          }
          if (needDraw) draw();
        }

        /* ---- drag to turn the planet in any direction (mouse, pen or touch) ---- */
        let px0 = 0, py0 = 0, pt0 = 0;
        const pt = (e: PointerEvent) => { const r = cv!.getBoundingClientRect(); return { x: (e.clientX - r.left) * U / r.width, y: (e.clientY - r.top) * V / r.height }; };
        function onPointerDown(e: PointerEvent) { dragging = true; const p = pt(e); px0 = p.x; py0 = p.y; pt0 = performance.now(); velX = velY = 0;
          cv!.classList.add('dragging'); try { cv!.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ } mouse = p; needDraw = true; }
        function onPointerMove(e: PointerEvent) {
          const p = pt(e); mouse = p;
          if (dragging) {
            const now = performance.now(), dts = Math.max(.008, (now - pt0) / 1000), phi = (p.x - px0) / RP, th = (p.y - py0) / RP;
            rotView(phi, th); velX = velX * .6 + (phi / dts) * .4; velY = velY * .6 + (th / dts) * .4; px0 = p.x; py0 = p.y; pt0 = now;
          }
          needDraw = true;
        }
        function endDrag() { if (!dragging) return; dragging = false; cv!.classList.remove('dragging');
          if (performance.now() - pt0 > 90) velX = velY = 0;           /* held still before release: no glide */
          const cap = 6; velX = clamp(velX, -cap, cap); velY = clamp(velY, -cap, cap); last = null; needDraw = true; }
        function onPointerLeave() { hovering = false; if (!dragging) { mouse = null; tip!.style.display = 'none'; needDraw = true; } }
        function onPointerEnter() { hovering = true; }
        function onDblClick() { velX = velY = 0; resetView(); needDraw = true; }
        function onSunInput(e: Event) { setSun(+(e.target as HTMLInputElement).value); }
        function onKeyDown(e: KeyboardEvent) {
          if (!hovering) return;   /* only while the pointer is over the canvas, so page keys are never hijacked */
          if (e.target && (e.target as HTMLElement).tagName === 'INPUT') return;
          const step = 12 * D2R;
          if (e.code === 'Space') { e.preventDefault(); spinning = !spinning; last = null; }
          else if (e.key === 'i' || e.key === 'I') setInspect();
          else if (e.key === 'r' || e.key === 'R' || e.key === 'Home') { velX = velY = 0; resetView(); }
          else if (e.key === 'ArrowRight') rotView(step, 0); else if (e.key === 'ArrowLeft') rotView(-step, 0);
          else if (e.key === 'ArrowDown') rotView(0, step); else if (e.key === 'ArrowUp') rotView(0, -step);
          else if (e.key === 'Escape') { mouse = null; tip!.style.display = 'none'; }
          else return;
          needDraw = true;
        }

        cv.addEventListener('pointerdown', onPointerDown);
        cv.addEventListener('pointermove', onPointerMove);
        cv.addEventListener('pointerup', endDrag);
        cv.addEventListener('pointercancel', endDrag);
        cv.addEventListener('pointerleave', onPointerLeave);
        cv.addEventListener('pointerenter', onPointerEnter);
        cv.addEventListener('dblclick', onDblClick);
        sunEl.addEventListener('input', onSunInput);
        window.addEventListener('keydown', onKeyDown);

        /* ---- sizing: the canvas is full-bleed (fills the container); disc stays
           centred on the shorter side. The backing store follows the box at a uniform
           scale so the planet never distorts. ---- */
        function rebuildSets() {
          if (!ready) return;
          const S = (Math.min(Math.round(2 * RP), 480) * TIERS[tier]) | 0;
          full = makeSet(S); coarse = S > 300 ? makeSet(Math.round(S * .62)) : full; needDraw = true;
        }
        let lastW = 0, lastH = 0;
        function fit() {
          const cw = Math.max(1, root!.clientWidth), ch = Math.max(1, root!.clientHeight);
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          const shortCss = Math.min(cw, ch);
          const shortBuf = clamp(Math.round(shortCss * dpr), 360, 900);
          const k = shortBuf / shortCss;                       /* uniform px-per-css-px scale */
          const nu = Math.max(1, Math.round(cw * k)), nv = Math.max(1, Math.round(ch * k));
          cv!.style.width = cw + 'px'; cv!.style.height = ch + 'px';
          if (nu !== lastW || nv !== lastH) {
            lastW = nu; lastH = nv; U = nu; V = nv; W = Math.min(U, V);
            CX = U / 2; CY = V / 2; RP = W * .285; cv!.width = U; cv!.height = V; buildBg(); rebuildSets();
          }
          needDraw = true;
        }

        ro = new ResizeObserver(function () { fit(); });
        ro.observe(root);

        if (typeof IntersectionObserver !== 'undefined') {
          io = new IntersectionObserver(function (entries) { for (const en of entries) visible = en.isIntersecting; }, { rootMargin: '120px 0px' });
          io.observe(root);
        } else {
          visible = true;
        }

        /* ---- boot: build the surface in short slices so the page never freezes ---- */
        fit(); rafId = requestAnimationFrame(frame);
        (function boot0() {
          const gen = buildTexture();
          (function step() {
            if (cancelled) return;
            const t0 = performance.now(); let done = false;
            while (performance.now() - t0 < 14) { const r = gen.next(); if (r.done) { done = true; break; } if (r.value != null) pct!.textContent = Math.round((r.value as number) * 100) + '%'; }
            if (!done) { bootTimer = window.setTimeout(step, 0); return; }
            ready = true; rebuildSets(); renderLegend(); needDraw = true;
            boot!.style.display = 'none';
          })();
        })();

        return () => {
          cancelled = true;
          if (rafId) cancelAnimationFrame(rafId);
          if (bootTimer) window.clearTimeout(bootTimer);
          if (ro) ro.disconnect();
          if (io) io.disconnect();
          cv.removeEventListener('pointerdown', onPointerDown);
          cv.removeEventListener('pointermove', onPointerMove);
          cv.removeEventListener('pointerup', endDrag);
          cv.removeEventListener('pointercancel', endDrag);
          cv.removeEventListener('pointerleave', onPointerLeave);
          cv.removeEventListener('pointerenter', onPointerEnter);
          cv.removeEventListener('dblclick', onDblClick);
          sunEl.removeEventListener('input', onSunInput);
          window.removeEventListener('keydown', onKeyDown);
        };
    }, [compact]);

    return (
        <div ref={rootRef} className={`mars-root ${className}`} style={style}>
            <canvas
                ref={cvRef}
                className="mars-canvas"
                width={720}
                height={720}
                tabIndex={0}
                aria-label="Rotating Mars. Drag to turn the planet in any direction."
            />
            <label className="mars-sunbox">Sun <input ref={sunRef} type="range" min={0} max={359} defaultValue={140} step={1} aria-label="Sun direction" /></label>
            <div ref={legendRef} className="mars-legend" />
            <div ref={tipRef} className="mars-tip" role="status" />
            <div ref={bootRef} className="mars-boot">Forming Mars <span ref={pctRef}>0%</span></div>
        </div>
    );
};

export default MarsAnimation;
