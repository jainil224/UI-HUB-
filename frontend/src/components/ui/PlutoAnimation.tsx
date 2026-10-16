// ── FILE: frontend/src/components/ui/PlutoAnimation.tsx ──
// pluto-animation — UI HUB
// "Rotating Pluto": a fully procedural, endlessly rotating dwarf planet rendered
// entirely in Canvas 2D — no GPU shader, no libraries. A seeded CPU pass forges a
// 2048x1024 equirectangular surface (warm/cool grey-white nitrogen-and-water ice,
// greyish-pink southern blotches, the equatorial dark-maculae belt, the reddish
// Cthulhu Macula, the bright pink-grey west lobe of Tombaugh Regio and the cream
// Sputnik Planitia with its convection cells, rim halo and blocky water-ice
// mountains), then scatters ~4300 power-law impact craters and brown pits before
// packing a level-of-detail mip chain. A software sphere renderer raytraces the
// disc per pixel with slope-based relief, a single directional sun, limb shading
// and a thin bluish atmosphere haze. Drag in any direction to turn it through
// 360 degrees (Pluto's real retrograde spin, right to left), flick for momentum,
// double-click or 0 to reset, arrow keys to nudge and Space to pause.
//
// Original source: standalone HTML (a fixed 800x800 canvas + two inline scripts —
// a UMD "PlutoCore" terrain/renderer module and an app bootstrap). Ported to React
// with no third-party runtime and no external assets: the noise/rng helpers, the
// region-maths, the terrain generator, the software renderer and the trackball are
// kept from the reference. Only the scaffolding changed: the html/body + `#cv`/
// `#hint`/`#loading` nodes became scoped refs on a container, every fixed overlay
// became absolutely positioned inside the root, the render buffer is sized to the
// container's shorter side (capped at the original 800px) and rebuilt on an
// rAF-throttled ResizeObserver so the disc always centres, the async generator
// gained a cancellable yield (so StrictMode's mount -> cleanup -> mount aborts the
// first pass instead of leaving it burning CPU), pointer coordinates stay
// canvas-relative, and the window keyboard listener is guarded by an
// over-the-canvas pointer check (repo convention) so it never hijacks page keys.
//
// Performance: this is a CPU software renderer, so the whole loop is gated by an
// IntersectionObserver + the Page Visibility API — an off-screen tile (e.g. in the
// library grid) never burns a core, and the one-time terrain build is deferred and
// paused until the box is actually on screen. The buffer edge follows the display
// size, so a typical preview tile rasterises ~4x fewer pixels per frame than the
// reference's fixed 800x800.
//
// Teardown cancels the RAF, drops the observers, clears the hint/loading timers and
// unbinds every listener. The demo's `window.__ready` boot flag is preserved.

import * as React from "react";
import { useEffect, useRef } from "react";
import "./PlutoAnimation.css";

const TAU = Math.PI * 2, D2R = Math.PI / 180;

/* ================================================================
   PLUTO CORE — procedural terrain + software sphere renderer.
   ================================================================ */

/* ---------- seeded RNG + 3D gradient noise ---------- */
function mulberry32(a: number) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const GR = [1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1];
function makeNoise(seed: number) {
  const rnd = mulberry32(seed), p = new Uint8Array(256), perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) { const j = (rnd() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const g = (h: number, x: number, y: number, z: number) => { const k = (h % 12) * 3; return GR[k] * x + GR[k + 1] * y + GR[k + 2] * z; };
  return function (x: number, y: number, z: number) {
    const X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    const xf = x - X, yf = y - Y, zf = z - Z, xi = X & 255, yi = Y & 255, zi = Z & 255;
    const u = xf * xf * xf * (xf * (xf * 6 - 15) + 10), v = yf * yf * yf * (yf * (yf * 6 - 15) + 10),
      w = zf * zf * zf * (zf * (zf * 6 - 15) + 10);
    const A = perm[xi] + yi, AA = perm[A] + zi, AB = perm[A + 1] + zi,
      B = perm[xi + 1] + yi, BA = perm[B] + zi, BB = perm[B + 1] + zi;
    const a1 = g(perm[AA], xf, yf, zf), b1 = g(perm[BA], xf - 1, yf, zf),
      c1 = g(perm[AB], xf, yf - 1, zf), d1 = g(perm[BB], xf - 1, yf - 1, zf),
      a2 = g(perm[AA + 1], xf, yf, zf - 1), b2 = g(perm[BA + 1], xf - 1, yf, zf - 1),
      c2 = g(perm[AB + 1], xf, yf - 1, zf - 1), d2 = g(perm[BB + 1], xf - 1, yf - 1, zf - 1);
    const x1 = a1 + (b1 - a1) * u, x2 = c1 + (d1 - c1) * u, x3 = a2 + (b2 - a2) * u, x4 = c2 + (d2 - c2) * u;
    const y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
    return y1 + (y2 - y1) * w;
  };
}
function fbm(nz: any, x: number, y: number, z: number, oct: number) {
  let s = 0, a = 1, f = 1, n = 0;
  for (let i = 0; i < oct; i++) { s += a * nz(x * f, y * f, z * f); n += a; a *= 0.5; f *= 2.03; }
  s = s / n * 1.7;
  return s > 1 ? 1 : s < -1 ? -1 : s;
}
function hash3(ix: number, iy: number, iz: number, k: number) {
  let h = Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ Math.imul(iz, 1103515245) ^ Math.imul(k, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
let WF1 = 0, WF2 = 0, WID = 0;
function worley(x: number, y: number, z: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  let f1 = 9, f2 = 9, id = 0;
  for (let dz = -1; dz <= 1; dz++) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const cx = xi + dx, cy = yi + dy, cz = zi + dz;
    const px = cx + hash3(cx, cy, cz, 1) - x, py = cy + hash3(cx, cy, cz, 2) - y, pz = cz + hash3(cx, cy, cz, 3) - z;
    const d = px * px + py * py + pz * pz;
    if (d < f1) { f2 = f1; f1 = d; id = hash3(cx, cy, cz, 4); } else if (d < f2) f2 = d;
  }
  WF1 = Math.sqrt(f1); WF2 = Math.sqrt(f2); WID = id;
}
const sstep = (a: number, b: number, x: number) => { let t = (x - a) / (b - a); t = t < 0 ? 0 : t > 1 ? 1 : t; return t * t * (3 - 2 * t); };
const clamp01 = (x: number) => x < 0 ? 0 : x > 1 ? 1 : x;

/* ---------- named surface regions (ellipses on the sphere) ---------- */
function vec(lonD: number, latD: number) {
  const l = lonD * D2R, f = latD * D2R;
  return [Math.cos(f) * Math.cos(l), Math.cos(f) * Math.sin(l), Math.sin(f)];
}
function mkFeat(name: string, lon: number, lat: number, aE: number, bN: number, tiltDeg: number) {
  const l = lon * D2R, f = lat * D2R, c = vec(lon, lat);
  const E = [-Math.sin(l), Math.cos(l), 0];
  const Nn = [-Math.sin(f) * Math.cos(l), -Math.sin(f) * Math.sin(l), Math.cos(f)];
  const t = tiltDeg * D2R, ct = Math.cos(t), st = Math.sin(t);
  return {
    name, c,
    e1: [E[0] * ct + Nn[0] * st, E[1] * ct + Nn[1] * st, E[2] * ct + Nn[2] * st],
    e2: [Nn[0] * ct - E[0] * st, Nn[1] * ct - E[1] * st, Nn[2] * ct - E[2] * st],
    ia: 1 / aE, ib: 1 / bN,
  };
}
let ELX = 0;
function ell(F: any, px: number, py: number, pz: number) {
  const d = px * F.c[0] + py * F.c[1] + pz * F.c[2];
  if (d < 0) { ELX = 0; return 99; }
  const qx = px - d * F.c[0], qy = py - d * F.c[1], qz = pz - d * F.c[2];
  const x = (qx * F.e1[0] + qy * F.e1[1] + qz * F.e1[2]) * F.ia;
  const y = (qx * F.e2[0] + qy * F.e2[1] + qz * F.e2[2]) * F.ib;
  ELX = x;
  return Math.sqrt(x * x + y * y);
}
const SPUT = mkFeat('Sputnik Planitia', 177, 17, 0.35, 0.50, 12);
const WEST = mkFeat('Tombaugh Regio (west lobe)', 133, 34, 0.38, 0.32, 0);
const CTHU = mkFeat('Cthulhu Macula', 122, -14, 1.02, 0.64, 0);
const LOWL = mkFeat('Lowell Regio', 205, 72, 0.50, 0.45, 0);
const DARKE = mkFeat('Dark macula', 238, -20, 0.24, 0.16, 0);
const AXA = (() => { const l = 110 * D2R; return [-Math.sin(l), Math.cos(l), 0]; })();
const AXB = (() => {
  const l = 140 * D2R, f = 18 * D2R;
  const E = [-Math.sin(l), Math.cos(l), 0], N = [-Math.sin(f) * Math.cos(l), -Math.sin(f) * Math.sin(l), Math.cos(f)];
  const v = [E[0] + N[0] * 0.8, E[1] + N[1] * 0.8, E[2] + N[2] * 0.8], n = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / n, v[1] / n, v[2] / n];
})();

/* ================================================================
   TERRAIN GENERATION  (equirectangular, 2:1)
   ================================================================ */
async function generate(opts: any) {
  opts = opts || {};
  const TW = opts.TW || 2048, TH = TW >> 1, seed = opts.seed || 11;
  const onProgress = opts.onProgress || function () {};
  const yieldNow = opts.yield || (() => new Promise((r) => setTimeout(r, 0)));
  const nz = makeNoise(seed), nz2 = makeNoise(seed + 77);
  const N = TW * TH;
  const CR = new Float32Array(N), CG = new Float32Array(N), CB = new Float32Array(N), HH = new Float32Array(N);
  const sinL = new Float32Array(TW), cosL = new Float32Array(TW);
  for (let i = 0; i < TW; i++) { const l = (i + 0.5) / TW * TAU; sinL[i] = Math.sin(l); cosL[i] = Math.cos(l); }
  const cosP = new Float32Array(TH), sinP = new Float32Array(TH);
  for (let j = 0; j < TH; j++) { const f = Math.PI / 2 - (j + 0.5) / TH * Math.PI; cosP[j] = Math.cos(f); sinP[j] = Math.sin(f); }

  let R = 0, G = 0, B = 0;
  const mixTo = (t: number, r: number, g: number, b: number) => { R += (r - R) * t; G += (g - G) * t; B += (b - B) * t; };

  /* ---- Pass 1: base albedo + base relief, per texel ---- */
  for (let iy = 0; iy < TH; iy++) {
    const cp = cosP[iy], sp = sinP[iy], lat = Math.asin(sp) / D2R;
    const north = sstep(6, 45, lat), polar = sstep(48, 74, lat), south = sstep(-6, -42, lat);
    for (let ix = 0; ix < TW; ix++) {
      const px = cp * cosL[ix], py = cp * sinL[ix], pz = sp, k = iy * TW + ix;
      const nL = fbm(nz, px * 2.1 + 1.3, py * 2.1 + 4.1, pz * 2.1 + 2.7, 4);
      const nM = fbm(nz, px * 5.6 + 7.7, py * 5.6 + 1.9, pz * 5.6 + 3.3, 4);
      const nF = fbm(nz2, px * 16 + 2.2, py * 16 + 8.8, pz * 16 + 5.1, 3);
      const nG = nz2(px * 46 + 4.4, py * 46 + 1.7, pz * 46 + 6.2), nH = nz(px * 105 + 2.1, py * 105 + 9.4, pz * 105 + 3.8);
      let h = 0.010 * nL + 0.0035 * nM + 0.0012 * nF + 0.0011 * nG + 0.0005 * nH;

      /* base: warm/cool grey-white ice */
      const tw = clamp01(0.5 + nM * 0.9);
      R = 196 + 26 * tw; G = 200 + 2 * tw; B = 214 - 34 * tw;
      const v = 1 + 0.07 * nF + 0.04 * nM + 0.035 * nG + 0.02 * nH; R *= v; G *= v; B *= v;

      /* northern blue-grey patches */
      const blue = sstep(0.18, 0.6, fbm(nz, px * 2.6 + 11, py * 2.6 + 3, pz * 2.6 + 9, 3)) *
        sstep(16, 38, lat) * (1 - polar * 0.75);
      mixTo(blue * 0.55, 92, 142, 204);

      /* yellow-orange polar terrain (Lowell Regio + high north) */
      const dL = ell(LOWL, px, py, pz);
      const mL = 1 - sstep(0.5, 1.25, dL + 0.12 * nM);
      const yel = clamp01(mL * 0.85 + polar * (0.22 + 0.62 * nL + 0.25 * nM) + north * 0.08 * (nM + 0.4));
      mixTo(yel * 0.82, 228 + 10 * nF, 176 + 14 * nM, 104 + 18 * nF);

      /* southern greyish-pink with red blotches */
      mixTo(south * 0.5, 196, 170, 164);
      const sRed = sstep(-0.05, 0.45, nL - 0.05 + 0.3 * nM) * south;
      mixTo(sRed * 0.65, 150, 56, 46);

      /* equatorial dark maculae belt */
      const band = Math.exp(-Math.pow((lat + 6) / 20, 2));
      const mac = sstep(0.10, 0.42, fbm(nz, px * 2.2 + 23, py * 2.2 + 5, pz * 2.2 + 12, 4) + 0.28 * (band - 0.5)) * band;
      mixTo(mac * 0.9, 78 + 34 * (nM + 0.3), 20 + 14 * (nM + 0.3), 19 + 10 * (nM + 0.3));

      /* Cthulhu Macula — dark maroon -> brick red -> pinkish edge */
      const dC = ell(CTHU, px, py, pz);
      const mC = 1 - sstep(0.6, 1.0, dC + 0.14 * nM + 0.08 * nL);
      if (mC > 0.001) {
        const tr = sstep(-0.45, 0.55, nM + 0.2 * nF);
        let rr = 70 + 58 * tr, gg = 16 + 22 * tr, bb = 16 + 18 * tr;
        const li = sstep(0.45, 0.9, nL + 0.25 * nF) * (1 - mC * 0.35);
        rr += 40 * li; gg += 26 * li; bb += 22 * li;
        mixTo(mC, rr, gg, bb);
      }
      /* second dark patch lower-right of the heart */
      const dD = ell(DARKE, px, py, pz);
      const mD = 1 - sstep(0.55, 1.0, dD + 0.15 * nM);
      if (mD > 0.001) mixTo(mD * 0.92, 92 + 38 * nM, 24 + 14 * nM, 22 + 12 * nM);

      /* west lobe of the heart: bright pink-grey, mottled */
      const dW = ell(WEST, px, py, pz);
      const mW = 1 - sstep(0.65, 1.1, dW + 0.12 * nM);
      if (mW > 0.001) {
        mixTo(mW * 0.8, 226 + 12 * nF, 206 + 10 * nF, 196 + 8 * nF);
        mixTo(mW * sstep(0.15, 0.5, nM) * 0.5, 186, 150, 136);
      }

      /* Sputnik Planitia — cream nitrogen ice, convection cells */
      const dS = ell(SPUT, px, py, pz) + 0.06 * nM + 0.03 * nF, lx = ELX;
      const mS = 1 - sstep(0.93, 1.03, dS);
      const bandS = sstep(0.70, 0.96, dS) * (1 - sstep(1.06, 1.5, dS));
      if (bandS > 0.01) {
        /* brown rim halo + speckled pits */
        mixTo(bandS * 0.22, 168, 136, 118);
        const dots = sstep(0.30, 0.44, nz2(px * 70 + 9, py * 70 + 4, pz * 70 + 1));
        mixTo(dots * bandS * 0.7, 150, 98, 80);
      }
      if (mS > 0.001) {
        const west = clamp01(0.5 - lx * 0.7);
        let cr = 241 - 8 * west + 4 * nM, cg = 227 - 18 * west + 4 * nM, cb = 194 - 8 * west + 4 * nM;
        worley(px * 36 + 3, py * 36 + 5, pz * 36 + 1);
        const e1 = 1 - sstep(0.02, 0.16, WF2 - WF1), cv = (WID - 0.5) * 0.07;
        cr *= 1 + cv; cg *= 1 + cv; cb *= 1 + cv;
        cr += (204 - cr) * e1 * 0.24; cg += (176 - cg) * e1 * 0.24; cb += (146 - cb) * e1 * 0.24;
        h -= 0.0008 * e1 * mS;
        const big = sstep(0.55, 0.97, dS);
        if (big > 0.01) {
          worley(px * 15 + 8, py * 15 + 2, pz * 15 + 6);
          const e2 = 1 - sstep(0.03, 0.2, WF2 - WF1);
          cr += (176 - cr) * e2 * big * 0.45; cg += (140 - cg) * e2 * big * 0.45; cb += (112 - cb) * e2 * big * 0.45;
          h -= 0.0016 * e2 * big * mS;
        }
        mixTo(mS, cr, cg, cb);
      }

      /* blocky water-ice mountains on the west / south-west boundary */
      const zone = sstep(0.95, 1.06, dS) * (1 - sstep(1.22, 1.6, dS));
      if (zone > 0.01) {
        const wn = clamp01(0.45 - lx * 0.9);
        const W2 = zone * wn;
        if (W2 > 0.01) {
          let rg = 1 - Math.abs(fbm(nz, px * 17 + 5, py * 17 + 1, pz * 17 + 9, 3) * 1.4); rg = clamp01(rg); rg *= rg;
          h += 0.022 * W2 * rg * (0.6 + 0.4 * nM);
          mixTo(W2 * rg * 0.55, 214, 212, 216);
          mixTo(W2 * (1 - rg) * 0.4, 124, 70, 62);
        }
      }

      /* long fractures, mostly in Cthulhu / the west lobe */
      const cg0 = Math.max(mC * 0.95, mW * 0.75, north * 0.25);
      if (cg0 > 0.05) {
        const gate = sstep(0.05, 0.35, fbm(nz2, px * 2.3 + 6, py * 2.3 + 2, pz * 2.3 + 8, 3)) * cg0 * (1 - mS);
        if (gate > 0.02) {
          let da = px * AXA[0] + py * AXA[1] + pz * AXA[2];
          let wx = (px - da * AXA[0]) * 8 + AXA[0] * da * 2, wy = (py - da * AXA[1]) * 8 + AXA[1] * da * 2, wz = (pz - da * AXA[2]) * 8 + AXA[2] * da * 2;
          let nn = nz(wx + 3, wy + 7, wz + 1), cr1 = Math.exp(-(nn * nn) / 0.0004);
          da = px * AXB[0] + py * AXB[1] + pz * AXB[2];
          wx = (px - da * AXB[0]) * 9 + AXB[0] * da * 2; wy = (py - da * AXB[1]) * 9 + AXB[1] * da * 2; wz = (pz - da * AXB[2]) * 9 + AXB[2] * da * 2;
          nn = nz2(wx + 9, wy + 2, wz + 5); const cr2 = Math.exp(-(nn * nn) / 0.0004);
          const crk = Math.max(cr1, cr2 * 0.8) * gate;
          if (crk > 0.01) { h -= 0.0040 * crk; mixTo(crk * 0.42, 238, 208, 202); }
        }
      }
      CR[k] = R; CG[k] = G; CB[k] = B; HH[k] = h;
    }
    if ((iy & 31) === 31) { onProgress(0.7 * iy / TH, 'Sculpting terrain'); await yieldNow(); }
  }

  /* ---- Pass 2: impact craters + pits (power-law sizes) ---- */
  const rnd = mulberry32(seed * 7 + 3);
  const craters: any[] = [];
  const density = (px: number, py: number, pz: number) => {
    if (ell(SPUT, px, py, pz) < 1.0) return 0.04;
    let d = 1;
    if (ell(WEST, px, py, pz) < 1.0) d = 0.5;
    if (ell(CTHU, px, py, pz) < 0.9) d = 1.5;
    return d;
  };
  const rMin = 0.0046, rMax = 0.075;
  let tries = 0;
  while (craters.length < (opts.craters || 4300) && tries < 60000) {
    tries++;
    const r = rMin * Math.pow(rnd(), -0.5);
    if (r > rMax) continue;
    const z = rnd() * 2 - 1, ph = rnd() * TAU, s = Math.sqrt(1 - z * z);
    const cx = s * Math.cos(ph), cy = s * Math.sin(ph), cz = z;
    if (rnd() > density(cx, cy, cz) / 1.5) continue;
    craters.push({ cx, cy, cz, r, tint: 0, age: 0.35 + 0.65 * rnd() });
  }
  /* brown pits ringing the heart */
  for (let n = 0, t2 = 0; n < 260 && t2 < 40000; t2++) {
    const z = rnd() * 2 - 1, ph = rnd() * TAU, s = Math.sqrt(1 - z * z);
    const cx = s * Math.cos(ph), cy = s * Math.sin(ph), cz = z;
    const d = ell(SPUT, cx, cy, cz);
    if (d < 0.78 || d > 1.3) continue;
    craters.push({ cx, cy, cz, r: 0.0045 + rnd() * 0.0055, tint: 1, age: 0.8 }); n++;
  }
  const ICE = [228, 226, 230];
  for (let ci = 0; ci < craters.length; ci++) {
    const c = craters[ci], r = c.r, ext = 1.7 * r;
    const phc = Math.asin(c.cz), lamc = Math.atan2(c.cy, c.cx);
    const ag = c.age, D = (r > 0.04 ? 0.12 : 0.2) * r * (0.55 + 0.45 * ag), Rh = 0.05 * r * ag, Eh = 0.014 * r * ag;
    const j0 = Math.max(0, Math.floor((Math.PI / 2 - (phc + ext)) / Math.PI * TH)),
      j1 = Math.min(TH - 1, Math.ceil((Math.PI / 2 - (phc - ext)) / Math.PI * TH));
    for (let iy = j0; iy <= j1; iy++) {
      const cp = cosP[iy], sp = sinP[iy];
      const cmin = Math.min(cp, Math.cos(Math.min(Math.PI / 2, Math.abs(phc) + ext)));
      const half = cmin > 0.02 ? Math.min(Math.PI, ext / Math.max(cmin, 0.02) * 1.05) : Math.PI;
      let span = 0;
      if (half < Math.PI) { span = Math.ceil(half / TAU * TW) + 1; }
      const icen = Math.round((lamc / TAU + (lamc < 0 ? 1 : 0)) * TW);
      const total = half >= Math.PI ? TW : 2 * span + 1;
      for (let q = 0; q < total; q++) {
        const ix = half >= Math.PI ? q : ((icen - span + q) % TW + TW) % TW;
        const dot = cp * cosL[ix] * c.cx + cp * sinL[ix] * c.cy + sp * c.cz;
        const dd = Math.sqrt(Math.max(0, 2 - 2 * dot)), x = dd / r;
        if (x > 1.7) continue;
        const k = iy * TW + ix;
        let dh = 0;
        if (x < 1) dh -= D * (1 - x * x);
        const xr = (x - 1.02) / 0.13;
        dh += Rh * Math.exp(-xr * xr);
        if (x > 1) dh += Eh * Math.exp(-(x - 1) / 0.45);
        if (r > 0.035) { const xc = x / 0.12; dh += 0.05 * r * Math.exp(-xc * xc); }
        HH[k] += dh;
        let ice = 0.26 * ag * Math.exp(-Math.pow((x - 1.0) / 0.15, 2));
        if (x > 1) ice += 0.06 * ag * Math.exp(-(x - 1) / 0.5);
        if (x < 1) { const fl = 1 - 0.13 * (1 - x * x); CR[k] *= fl; CG[k] *= fl; CB[k] *= fl; }
        if (c.tint && x < 1.1) {
          const m = 0.6 * Math.sqrt(Math.max(0, 1 - x * x));
          CR[k] += (150 - CR[k]) * m; CG[k] += (102 - CG[k]) * m; CB[k] += (86 - CB[k]) * m;
        }
        if (ice > 0.005) {
          CR[k] += (ICE[0] - CR[k]) * ice; CG[k] += (ICE[1] - CG[k]) * ice; CB[k] += (ICE[2] - CB[k]) * ice;
        }
      }
    }
    if ((ci & 255) === 255) { onProgress(0.7 + 0.25 * ci / craters.length, 'Impacting craters'); await yieldNow(); }
  }

  /* ---- Pass 3: pack colour + slope maps, build mip chain ---- */
  const lvls: any[] = [];
  const L0 = new Uint8Array(N * 5), dl = TAU / TW;
  for (let iy = 0; iy < TH; iy++) {
    const cpl = Math.max(cosP[iy], 0.12), ja = iy > 0 ? iy - 1 : 0, jb = iy < TH - 1 ? iy + 1 : TH - 1;
    for (let ix = 0; ix < TW; ix++) {
      const k = iy * TW + ix, ia = (ix + 1) % TW, ib = (ix + TW - 1) % TW;
      const gE = (HH[iy * TW + ia] - HH[iy * TW + ib]) / (2 * dl * cpl);
      const gN = (HH[ja * TW + ix] - HH[jb * TW + ix]) / ((jb - ja) * dl);
      const o = k * 5;
      L0[o] = CR[k] < 0 ? 0 : CR[k] > 255 ? 255 : CR[k];
      L0[o + 1] = CG[k] < 0 ? 0 : CG[k] > 255 ? 255 : CG[k];
      L0[o + 2] = CB[k] < 0 ? 0 : CB[k] > 255 ? 255 : CB[k];
      L0[o + 3] = Math.max(0, Math.min(255, Math.round(128 + gE * 40)));
      L0[o + 4] = Math.max(0, Math.min(255, Math.round(128 + gN * 40)));
    }
  }
  lvls.push({ w: TW, h: TH, d: L0 });
  for (let l = 1; l < 4; l++) {
    const p = lvls[l - 1], w = p.w >> 1, h = p.h >> 1, d = new Uint8Array(w * h * 5);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 5; c++) {
      const a = ((2 * y) * p.w + 2 * x) * 5 + c, b = a + 5, e = a + p.w * 5, f = e + 5;
      d[(y * w + x) * 5 + c] = (p.d[a] + p.d[b] + p.d[e] + p.d[f] + 2) >> 2;
    }
    lvls.push({ w, h, d });
  }
  onProgress(1, 'Done');
  return { TW, TH, levels: lvls, craters };
}

/* ================================================================
   SPHERE RENDERER  (all view-dependent maths pre-computed per pixel)
   ================================================================ */
function createRenderer(o: any) {
  const W = o.W, H = o.H, Rr = o.R, tex = o.tex, TW = tex.TW, TH = tex.TH;
  const latSub = (o.latSub == null ? 33 : o.latSub) * D2R, cs = Math.cos(latSub), sn = Math.sin(latSub);
  let Lv = o.light || [-0.5, 0.34, 0.8]; { const n = Math.hypot(Lv[0], Lv[1], Lv[2]); Lv = [Lv[0] / n, Lv[1] / n, Lv[2] / n]; }
  const wrapK = o.wrap == null ? 0.24 : o.wrap, amb = o.ambient == null ? 0.045 : o.ambient;
  const bumpGain = o.bump == null ? 0.8 : o.bump, expo = o.exposure == null ? 1.18 : o.exposure;
  /* object -> view at spin 0:  M = Q * Rx(latSub) * P,  P maps (x,y,z) -> (y,z,x) */
  const mm = (a: any, b: any) => {
    const r = new Array(9);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
    return r;
  };
  const B = mm([1, 0, 0, 0, cs, -sn, 0, sn, cs], [0, 1, 0, 0, 0, 1, 1, 0, 0]);

  const NP = W * H;
  const U0 = new Float32Array(NP).fill(NaN), V0 = new Float32Array(NP).fill(NaN);
  const SX = new Float32Array(NP), SY = new Float32Array(NP), NZ = new Float32Array(NP), RR = new Float32Array(NP);
  const LAM = new Float32Array(NP), LE = new Float32Array(NP), LN = new Float32Array(NP), HZ = new Float32Array(NP), COV = new Float32Array(NP);
  const idxList: any[] = [], cx0 = W / 2, cy0 = H / 2;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let sx = (x + 0.5 - cx0) / Rr, sy = (cy0 - (y + 0.5)) / Rr;
    const rr = Math.sqrt(sx * sx + sy * sy);
    if (rr > 1 + 0.75 / Rr) continue;
    const k = y * W + x; let nzv;
    if (rr >= 1) { sx /= rr; sy /= rr; nzv = 0; } else nzv = Math.sqrt(1 - rr * rr);
    SX[k] = sx; SY[k] = sy; NZ[k] = nzv; RR[k] = rr;
    const nl = sx * Lv[0] + sy * Lv[1] + nzv * Lv[2];
    LAM[k] = clamp01((nl + wrapK) / (1 + wrapK));
    const lit = clamp01(0.35 + 0.325 * (sx * Lv[0] + sy * Lv[1]) / Math.max(1e-3, Math.hypot(Lv[0], Lv[1])) + 0.35 * 0);
    HZ[k] = 0.30 * Math.pow(1 - nzv, 3.2) * lit;
    COV[k] = rr <= 1 ? (rr > 1 - 0.5 / Rr ? clamp01((1 - rr) * Rr + 0.5) : 1) : clamp01(0.5 - (rr - 1) * Rr);
    idxList.push(k);
  }
  const NK = idxList.length, IDX = Int32Array.from(idxList);
  const LV = new Uint8Array(NK), ROWOFF = new Int32Array(NK), NT = new Uint8Array(NK), STEP = new Float32Array(NK);
  const Ldat = tex.levels.map((l: any) => l.d), Lw = tex.levels.map((l: any) => l.w), Lsc = [1, 0.5, 0.25, 0.125];
  const wrapd = (d: number) => { if (d > TW / 2) d -= TW; else if (d < -TW / 2) d += TW; return d; };

  /* Recompute view-dependent tables for a drag orientation Q (3x3 row-major). Spin is NOT part of it. */
  function setOrientation(Q: any) {
    const M = mm(Q || [1, 0, 0, 0, 1, 0, 0, 0, 1], B);
    const lox = M[0] * Lv[0] + M[3] * Lv[1] + M[6] * Lv[2], loy = M[1] * Lv[0] + M[4] * Lv[1] + M[7] * Lv[2], loz = M[2] * Lv[0] + M[5] * Lv[1] + M[8] * Lv[2];
    const kU = TW / TAU, kV = TH / Math.PI;
    for (let i = 0; i < NK; i++) {
      const k = IDX[i], sx = SX[k], sy = SY[k], nz = NZ[k];
      const dx = M[0] * sx + M[3] * sy + M[6] * nz, dy = M[1] * sx + M[4] * sy + M[7] * nz, dz = M[2] * sx + M[5] * sy + M[8] * nz;
      let rho = Math.sqrt(dx * dx + dy * dy); if (rho < 1e-6) rho = 1e-6;
      U0[k] = Math.atan2(dy, dx) * kU - 0.5;
      V0[k] = Math.acos(dz > 1 ? 1 : dz < -1 ? -1 : dz) * kV - 0.5;
      LE[k] = (-lox * dy + loy * dx) / rho;
      LN[k] = -dz * (lox * dx + loy * dy) / rho + rho * loz;
    }
    for (let i = 0; i < NK; i++) {
      const k = IDX[i], x = k % W, y = (k / W) | 0;
      let fu = 1, fv = 1;
      const kx = (x + 1 < W && !isNaN(U0[k + 1])) ? k + 1 : k - 1, ky = (y + 1 < H && !isNaN(U0[k + W])) ? k + W : k - W;
      if (kx >= 0 && !isNaN(U0[kx])) { fu = Math.max(fu, Math.abs(wrapd(U0[kx] - U0[k]))); fv = Math.max(fv, Math.abs(V0[kx] - V0[k])); }
      if (ky >= 0 && !isNaN(U0[ky])) { fu = Math.max(fu, Math.abs(wrapd(U0[ky] - U0[k]))); fv = Math.max(fv, Math.abs(V0[ky] - V0[k])); }
      /* mip level follows the v-footprint; the squeezed u-direction (poles, limb) is covered by extra taps */
      const lv = fv < 1.366 ? 0 : fv < 2.73 ? 1 : fv < 5.46 ? 2 : 3;
      let nt = Math.round(fu / (fv < 1 ? 1 : fv)); nt = nt < 1 ? 1 : nt > 14 ? 14 : nt;
      NT[i] = nt; STEP[i] = fu / nt;
      LV[i] = lv;
      const L = tex.levels[lv]; let row = Math.round(V0[k] / (1 << lv)); row = row < 0 ? 0 : row >= L.h ? L.h - 1 : row;
      ROWOFF[i] = row * L.w * 5;
    }
  }

  /* thin bluish atmosphere: bright rim plus two faint haze layers */
  function hazeAt(rr: number, dx: number, dy: number) {
    const e = Math.max(0, (rr - 1) * Rr);
    const side = 0.55 + 0.45 * clamp01((dx * Lv[0] + dy * Lv[1]) / Math.max(1e-3, Math.hypot(Lv[0], Lv[1])) * 0.5 + 0.5);
    const a = (0.34 * Math.exp(-e / 3.2) + 0.12 * Math.exp(-e / 11) +
      0.07 * Math.exp(-Math.pow((e - 10) / 1.6, 2)) + 0.045 * Math.exp(-Math.pow((e - 19) / 2.0, 2))) * side;
    return [a * 105, a * 150, a * 235];
  }
  function initBackground(data: any) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = (x + 0.5 - cx0) / Rr, sy = (cy0 - (y + 0.5)) / Rr, rr = Math.sqrt(sx * sx + sy * sy), p = (y * W + x) * 4;
      let r = 0, g = 0, b = 0;
      if (rr > 1 && rr < 1 + 40 / Rr) { const h = hazeAt(rr, sx / rr, sy / rr); r = h[0]; g = h[1]; b = h[2]; }
      data[p] = r; data[p + 1] = g; data[p + 2] = b; data[p + 3] = 255;
    }
  }

  function render(data: any, lonSub: number) {
    const shift = lonSub / TAU * TW;
    for (let i = 0; i < NK; i++) {
      const k = IDX[i], lv = LV[i], T = Ldat[lv], tw = Lw[lv], sc = Lsc[lv], nt = NT[i], ro = ROWOFF[i];
      let r = 0, gg = 0, bl = 0, ge = 0, gn = 0;
      const u00 = U0[k] + shift - (nt - 1) * 0.5 * STEP[i];
      for (let j = 0; j < nt; j++) {
        const uu = (u00 + j * STEP[i]) * sc, fl = Math.floor(uu), f = uu - fl;
        let i0 = fl % tw; if (i0 < 0) i0 += tw;
        let i1 = i0 + 1; if (i1 === tw) i1 = 0;
        const a = ro + i0 * 5, b = ro + i1 * 5, g = 1 - f;
        r += T[a] * g + T[b] * f; gg += T[a + 1] * g + T[b + 1] * f; bl += T[a + 2] * g + T[b + 2] * f;
        ge += T[a + 3] * g + T[b + 3] * f; gn += T[a + 4] * g + T[b + 4] * f;
      }
      const inv = 1 / nt; r *= inv; gg *= inv; bl *= inv;
      const gE = (ge * inv - 128) * 0.025, gN = (gn * inv - 128) * 0.025;
      const lam = LAM[k];
      let inten = amb + (1 - amb) * lam + bumpGain * (-(gE * LE[k] + gN * LN[k])) * (0.3 + 0.7 * lam);
      if (inten < 0) inten = 0;
      inten *= expo * (0.78 + 0.22 * Math.sqrt(NZ[k]));
      const hz = HZ[k];
      let or = r * inten + hz * 95, og = gg * inten + hz * 140, ob = bl * inten + hz * 225;
      const cv = COV[k], p = k * 4;
      if (cv < 1) {
        const rr = RR[k], x = k % W, y = (k / W) | 0;
        const dx = (x + 0.5 - cx0) / Rr / (rr || 1), dy = (cy0 - (y + 0.5)) / Rr / (rr || 1);
        const h = hazeAt(rr < 1 ? 1 : rr, dx, dy);
        or = or * cv + h[0] * (1 - cv); og = og * cv + h[1] * (1 - cv); ob = ob * cv + h[2] * (1 - cv);
      }
      data[p] = or; data[p + 1] = og; data[p + 2] = ob; data[p + 3] = 255;
    }
  }
  setOrientation(null);
  return { render, initBackground, setOrientation, pixelCount: NK, W, H, R: Rr };
}

const PlutoCore = { generate, createRenderer, TAU, D2R };

/* ================================================================
   SETTINGS
   ================================================================ */
const SIZE_MAX = 800;        /* max render-buffer edge, px (native detail)       */
const SIZE_MIN = 220;        /* min render-buffer edge, px                        */
const DISC_RATIO = 355 / 800;/* disc radius per unit of buffer edge              */
const DUR = 60;              /* seconds for one full spin (loops seamlessly)     */
const LAT_SUB = 33;          /* starting tilt: north pole leans toward viewer    */
const LON0 = 165;            /* starting sub-viewer longitude (heart lower right) */
const DIR = 1;               /* +1 = retrograde, Pluto's real spin (right to left) */
const INERTIA = 2.6;         /* fling decay per second                           */
const RENDER_MS = 1000 / 40; /* software-raster frame cap — the 60s spin is slow */

export interface PlutoAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
}

export const PlutoAnimation: React.FC<PlutoAnimationProps> = ({
    className = "",
    style = {},
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const cvRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);
    const loadingRef = useRef<HTMLDivElement>(null);
    const msgRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        const cv = cvRef.current;
        const hint = hintRef.current;
        const loading = loadingRef.current;
        const msg = msgRef.current;
        const fill = fillRef.current;
        if (!root || !cv || !hint || !loading || !msg || !fill) return;

        const ctx = cv.getContext("2d", { alpha: false });
        if (!ctx) return;

        const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        let cancelled = false;
        let rafId = 0, resizeRaf = 0;
        let ro: ResizeObserver | null = null;
        let io: IntersectionObserver | null = null;
        let hintShow = 0, hintHide = 0, loadDone = 0;
        const teardown: Array<() => void> = [];
        const ABORT: any = { abort: true };

        /* CPU renderer: only do work while the planet is on screen and the tab is
           visible. An off-screen tile (e.g. in the library grid) would otherwise
           keep rasterising every frame and pin a whole core. */
        let visible = typeof IntersectionObserver === "undefined";

        /* Render resolution follows the box (capped at the original 800px buffer).
           The disc is redrawn pixel by pixel every frame, so a smaller buffer is much
           cheaper while staying pixel-crisp at the size the component is shown. */
        let bufW = 0, bufH = 0, bufR = 0, texTW = 2048;
        let tex: any = null, rnd: any = null, img: any = null;

        let Q = [1, 0, 0, 0, 1, 0, 0, 0, 1];
        let dirty = false, first = true;
        let spinning = !REDUCED, drag: any = null, hovering = false;
        const vel = { x: 0, y: 0 };
        let lon = LON0 * D2R, lastTs: number | null = null, lastRender = 0;

        const mul = (a: any, b: any) => {
            const r = new Array(9);
            for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r[i * 3 + j] = a[i * 3] * b[j] + a[i * 3 + 1] * b[3 + j] + a[i * 3 + 2] * b[6 + j];
            return r;
        };
        function ortho(m: any) { /* Gram-Schmidt so repeated drags never skew the matrix */
            let a = [m[0], m[1], m[2]], b = [m[3], m[4], m[5]];
            const na = Math.hypot(...a); a = a.map((v) => v / na);
            const d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; b = [b[0] - d * a[0], b[1] - d * a[1], b[2] - d * a[2]];
            const nb = Math.hypot(...b); b = b.map((v) => v / nb);
            const c = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
            return [a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]];
        }
        /* ax: turn about the screen's vertical axis (drag left/right); ay: about the horizontal axis (drag up/down) */
        function turn(ax: number, ay: number) {
            const cy = Math.cos(ax), sy = Math.sin(ax), cx = Math.cos(ay), sx = Math.sin(ay);
            const Ry = [cy, 0, sy, 0, 1, 0, -sy, 0, cy], Rx = [1, 0, 0, 0, cx, -sx, 0, sx, cx];
            Q = ortho(mul(mul(Ry, Rx), Q)); dirty = true;
        }

        /* keep the square buffer centred and fitted to the container's shorter side */
        const applySize = () => {
            const shorter = Math.min(root.clientWidth || SIZE_MIN, root.clientHeight || SIZE_MIN);
            const s = Math.round(Math.max(SIZE_MIN, Math.min(SIZE_MAX, shorter)));
            bufW = s; bufH = s; bufR = Math.round(s * DISC_RATIO);
            cv.width = bufW; cv.height = bufH;
            cv.style.width = s + "px"; cv.style.height = s + "px";
        };
        /* (re)build the per-pixel view tables for the current buffer size */
        const build = () => {
            if (!tex) return;
            rnd = PlutoCore.createRenderer({ W: bufW, H: bufH, R: bufR, tex, latSub: LAT_SUB });
            img = ctx.createImageData(bufW, bufH);
            rnd.initBackground(img.data);
            dirty = true; first = true;
        };
        applySize();
        ro = new ResizeObserver(() => {
            if (resizeRaf) return;
            resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; applySize(); build(); });
        });
        ro.observe(root);
        teardown.push(() => { if (resizeRaf) cancelAnimationFrame(resizeRaf); });

        /* pause everything while the box is off-screen */
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

        /* ---------- pointer / touch / keyboard ---------- */
        const pxScale = () => bufW / cv.getBoundingClientRect().width;

        const onPointerDown = (e: PointerEvent) => {
            try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
            cv.classList.add('grabbing'); hint.classList.remove('show');
            drag = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now() }; vel.x = 0; vel.y = 0;
        };
        const onPointerMove = (e: PointerEvent) => {
            if (!drag || e.pointerId !== drag.id) return;
            const now = performance.now(), dt = Math.max(1, now - drag.t) / 1000, k = pxScale() / bufR;
            const dx = (e.clientX - drag.x) * k, dy = (e.clientY - drag.y) * k;
            turn(dx, dy);
            vel.x = vel.x * 0.5 + (dx / dt) * 0.5; vel.y = vel.y * 0.5 + (dy / dt) * 0.5;
            drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
        };
        const release = (e: PointerEvent) => {
            if (!drag || (e && e.pointerId !== drag.id)) return;
            if (performance.now() - drag.t > 90) { vel.x = 0; vel.y = 0; }   /* held still before letting go: no fling */
            drag = null; cv.classList.remove('grabbing');
        };
        const onDblClick = () => { Q = [1, 0, 0, 0, 1, 0, 0, 0, 1]; vel.x = 0; vel.y = 0; dirty = true; };
        const onKeyDown = (e: KeyboardEvent) => {
            const s = 6 * D2R;
            if (e.key === 'ArrowLeft') { turn(-s, 0); e.preventDefault(); }
            else if (e.key === 'ArrowRight') { turn(s, 0); e.preventDefault(); }
            else if (e.key === 'ArrowUp') { turn(0, -s); e.preventDefault(); }
            else if (e.key === 'ArrowDown') { turn(0, s); e.preventDefault(); }
            else if (e.key === ' ') { spinning = !spinning; e.preventDefault(); }
            else if (e.key === 'Escape' || e.key === '0') { Q = [1, 0, 0, 0, 1, 0, 0, 0, 1]; dirty = true; }
        };
        /* global spacebar: only while the pointer is over the canvas, so page keys are never hijacked */
        const onWinKeyDown = (e: KeyboardEvent) => {
            if (!hovering) return;
            if (e.key === ' ' && document.activeElement === document.body) { spinning = !spinning; e.preventDefault(); }
        };
        const onEnter = () => { hovering = true; };
        const onLeave = () => { hovering = false; };

        cv.addEventListener('pointerdown', onPointerDown);
        cv.addEventListener('pointermove', onPointerMove);
        cv.addEventListener('pointerup', release);
        cv.addEventListener('pointercancel', release);
        cv.addEventListener('dblclick', onDblClick);
        cv.addEventListener('keydown', onKeyDown);
        cv.addEventListener('pointerenter', onEnter);
        cv.addEventListener('pointerleave', onLeave);
        window.addEventListener('keydown', onWinKeyDown);
        teardown.push(() => {
            cv.removeEventListener('pointerdown', onPointerDown);
            cv.removeEventListener('pointermove', onPointerMove);
            cv.removeEventListener('pointerup', release);
            cv.removeEventListener('pointercancel', release);
            cv.removeEventListener('dblclick', onDblClick);
            cv.removeEventListener('keydown', onKeyDown);
            cv.removeEventListener('pointerenter', onEnter);
            cv.removeEventListener('pointerleave', onLeave);
            window.removeEventListener('keydown', onWinKeyDown);
        });

        /* ---------- clock ---------- */
        function frame(ts: number) {
            if (cancelled) return;
            if (lastTs == null) lastTs = ts;
            const dt = Math.min(0.1, (ts - lastTs) / 1000); lastTs = ts;
            if (visible && !document.hidden && rnd && img) {
                if (!drag && (Math.abs(vel.x) > 0.01 || Math.abs(vel.y) > 0.01)) {
                    turn(vel.x * dt, vel.y * dt);
                    const f = Math.exp(-INERTIA * dt); vel.x *= f; vel.y *= f;
                }
                if (spinning && !drag) lon += DIR * TAU / DUR * dt;
                if (dirty) { rnd.setOrientation(Q); dirty = false; first = true; }
                /* the spin is deliberately slow (one turn / 60s), so capping the CPU
                   raster to ~40fps is imperceptible yet roughly halves the work */
                if ((first || spinning) && (lastRender === 0 || ts - lastRender >= RENDER_MS)) {
                    rnd.render(img.data, lon); ctx.putImageData(img, 0, 0);
                    first = false; lastRender = ts;
                }
            }
            rafId = requestAnimationFrame(frame);
        }

        (window as any).__play = () => { spinning = true; };
        (window as any).__pause = () => { spinning = false; };
        (window as any).__turn = (yawDeg: number, pitchDeg: number) => { turn(yawDeg * D2R, pitchDeg * D2R); };
        (window as any).__reset = () => { Q = [1, 0, 0, 0, 1, 0, 0, 0, 1]; dirty = true; };

        (async () => {
            /* defer the one-time terrain build until the box is actually on screen */
            try { await waitVisible(); } catch (e) { if (e === ABORT) return; return; }
            if (cancelled) return;

            /* texture resolution is chosen once, from the laid-out size */
            texTW = bufW >= 560 ? 2048 : bufW >= 400 ? 1536 : 1024;
            try {
                tex = await PlutoCore.generate({
                    TW: texTW,
                    onProgress: (p: number, s: string) => {
                        fill.style.width = Math.round(p * 100) + "%";
                        msg.textContent = s + "\u2026";
                    },
                    /* pause the multi-second build whenever the box scrolls off-screen */
                    yield: () => {
                        if (cancelled) return Promise.reject(ABORT);
                        if (!visible || document.hidden) return waitVisible();
                        return new Promise<void>((r) => setTimeout(r, 0));
                    },
                });
            } catch (e) {
                if (e === ABORT) return;
                console.error(e);
                return;
            }
            if (cancelled) return;

            build();
            loading.style.opacity = "0";
            loadDone = window.setTimeout(() => { loading.style.display = "none"; }, 600);
            hintShow = window.setTimeout(() => hint.classList.add("show"), 700);
            hintHide = window.setTimeout(() => hint.classList.remove("show"), 6500);

            rafId = requestAnimationFrame(frame);
            (window as any).__ready = true;
        })();

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            if (resizeRaf) cancelAnimationFrame(resizeRaf);
            if (ro) ro.disconnect();
            if (io) io.disconnect();
            if (hintShow) clearTimeout(hintShow);
            if (hintHide) clearTimeout(hintHide);
            if (loadDone) clearTimeout(loadDone);
            for (const fn of teardown) fn();
            delete (window as any).__play;
            delete (window as any).__pause;
            delete (window as any).__turn;
            delete (window as any).__reset;
        };
    }, []);

    return (
        <div ref={rootRef} className={`pluto-root ${className}`} style={style}>
            <canvas
                ref={cvRef}
                className="pluto-canvas"
                tabIndex={0}
                aria-label="Rotating Pluto. Drag to turn it in any direction."
            />
            <div ref={hintRef} className="pluto-hint">Drag to turn Pluto in any direction &middot; double-click to reset &middot; space to pause</div>
            <div ref={loadingRef} className="pluto-loading">
                <div ref={msgRef} className="pluto-msg">Generating Pluto&rsquo;s surface&hellip;</div>
                <div className="pluto-track"><div ref={fillRef} className="pluto-fill" /></div>
            </div>
        </div>
    );
};

export default PlutoAnimation;
