// ── FILE: frontend/src/components/ui/MercuryAnimation.tsx ──
// mercury-animation — UI HUB
// "Mercury Rotating Globe": a realistic, endlessly spinning Mercury built with
// three.js. A full-bleed WebGL canvas holds one sphere only — no chrome, no
// readouts. The planet carries an equirectangular colour map, a grayscale
// relief (bump) map made from the colour map's fine detail, a thin blue-gold
// rim glow, ~170 twinkling glints pinned to the brightest crater rays (as
// children of the planet so they turn with it) and 2,400 background stars.
// Drag in any direction to turn it a full 360° on both axes (world-space
// quaternion), release for fading momentum; wheel or two-finger pinch zooms
// 0.6x–2.2x, double-click resets, Space pauses. prefers-reduced-motion starts
// it paused.
//
// Original source: a standalone HTML file (three.js r128 from a CDN) plus a
// Python make_textures.py that re-projects two Mercury photos into
// mercury_texture.jpg / mercury_bump.jpg / glints.json. Ported to React with
// no third-party runtime beyond the already-installed `three`: the photo
// pipeline is replaced by a self-contained CPU synthesis that forges the same
// three assets in-browser — a seamless 3D-Perlin equirectangular surface
// (heavy cratering, pale ray systems, one large basin, enhanced-colour
// blue/gold tinting, polar brightening), a high-pass relief map derived from
// it, and a glint table picked from the brightest rayed craters — then the
// original scene (sphere + standard material + rim glow + star/glint point
// shaders + quaternion drag/zoom/pause clock) is reproduced verbatim. The
// global window.__seek/__play/__pause/__duration/__fps/__count contract is
// kept for parity and cleaned up on unmount; the CDN <script> and #load
// authoring chrome become the component root + a fading loader.

import * as THREE from "three";
import { useEffect, useRef } from "react";
import "./MercuryAnimation.css";

export interface MercuryAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** When true (library preview), forges a smaller 1024x512 surface for faster boot instead of the full 2048x1024. */
    compact?: boolean;
    /** Start paused regardless of prefers-reduced-motion. */
    paused?: boolean;
}

/* ================= deterministic RNG + seamless 3D Perlin noise =================
   (module level: pure, no DOM — same across renders) */
function mulberry32(a: number) {
    return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const PERM = (() => {
    const r = mulberry32(1337), p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) { const j = (r() * (i + 1)) | 0; const t = p[i]; p[i] = p[j]; p[j] = t; }
    const P = new Uint8Array(512);
    for (let i = 0; i < 512; i++) P[i] = p[i & 255];
    return P;
})();
const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
function grad(hash: number, x: number, y: number, z: number) {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z);
    return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
}
function noise3(x: number, y: number, z: number) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    const u = fade(x), v = fade(y), w = fade(z);
    const A = PERM[X] + Y, AA = PERM[A] + Z, AB = PERM[A + 1] + Z;
    const B = PERM[X + 1] + Y, BA = PERM[B] + Z, BB = PERM[B + 1] + Z;
    return lerp(
        lerp(lerp(grad(PERM[AA], x, y, z), grad(PERM[BA], x - 1, y, z), u),
             lerp(grad(PERM[AB], x, y - 1, z), grad(PERM[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(grad(PERM[AA + 1], x, y, z - 1), grad(PERM[BA + 1], x - 1, y, z - 1), u),
             lerp(grad(PERM[AB + 1], x, y - 1, z - 1), grad(PERM[BB + 1], x - 1, y - 1, z - 1), u), v),
        w);
}
function fbm3(x: number, y: number, z: number, oct: number, gain = 0.5, lac = 2.05) {
    let a = 1, f = 1, s = 0, n = 0;
    for (let i = 0; i < oct; i++) { s += a * noise3(x * f, y * f, z * f); n += a; a *= gain; f *= lac; }
    return s / n;
}
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smoothstep = (a: number, b: number, x: number) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

interface MercuryAssets { color: HTMLCanvasElement; bump: HTMLCanvasElement; glints: number[][]; W: number; H: number; }

/* ================= forge the equirectangular surface + relief + glints =================
   Mirrors make_textures.py's output: a 2048x1024 (or 1024x512 compact) seamless
   Mercury colour map, a grayscale relief map from its fine detail, and a
   [lon, lat, brightness] glint table picked from the brightest crater rays. */
function buildMercury(compact: boolean, onProgress?: (p: number) => void): MercuryAssets {
    const W = compact ? 1024 : 2048, H = compact ? 512 : 1024;
    const BW = 1024, BH = 512;                                  // base noise pass (upscaled)
    const rand = mulberry32(20241015);

    /* ---- base albedo: seamless Perlin terrain + enhanced-colour tinting ---- */
    const base = document.createElement("canvas"); base.width = BW; base.height = BH;
    const bctx = base.getContext("2d")!;
    const bimg = bctx.createImageData(BW, BH);
    const bd = bimg.data;
    const basinDir = new THREE.Vector3(Math.cos(0.3), Math.sin(0.12), Math.sin(0.3)).normalize(); // one large pale basin
    const lowC = [56, 50, 44], midC = [112, 103, 92], hiC = [170, 160, 144];
    const blueC = [96, 138, 186], amberC = [196, 156, 92];
    for (let j = 0; j < BH; j++) {
        const lat = Math.PI / 2 - ((j + 0.5) / BH) * Math.PI;
        const cl = Math.cos(lat), sl = Math.sin(lat);
        for (let i = 0; i < BW; i++) {
            const lon = ((i + 0.5) / BW) * Math.PI * 2 - Math.PI;
            const dx = cl * Math.cos(lon), dy = sl, dz = cl * Math.sin(lon);
            const n = fbm3(dx * 3.0 + 5.2, dy * 3.0 - 1.4, dz * 3.0 + 2.9, 4);
            const h = smoothstep(-0.22, 0.42, n);
            let r, g, b;
            if (h < 0.5) { const t = h / 0.5; r = lerp(lowC[0], midC[0], t); g = lerp(lowC[1], midC[1], t); b = lerp(lowC[2], midC[2], t); }
            else { const t = (h - 0.5) / 0.5; r = lerp(midC[0], hiC[0], t); g = lerp(midC[1], hiC[1], t); b = lerp(midC[2], hiC[2], t); }
            /* enhanced-colour tint: cool ejecta vs warm fresh material */
            const tint = fbm3(dx * 1.7 - 3.1, dy * 1.7 + 4.7, dz * 1.7 - 2.2, 3);
            if (tint > 0.14) { const t = smoothstep(0.14, 0.42, tint) * 0.28; r = lerp(r, blueC[0], t); g = lerp(g, blueC[1], t); b = lerp(b, blueC[2], t); }
            else if (tint < -0.12) { const t = smoothstep(-0.12, -0.4, tint) * 0.26; r = lerp(r, amberC[0], t); g = lerp(g, amberC[1], t); b = lerp(b, amberC[2], t); }
            /* one large pale basin (Caloris-like) */
            const bd0 = dx * basinDir.x + dy * basinDir.y + dz * basinDir.z;
            const basin = smoothstep(0.94, 0.985, bd0);
            if (basin > 0) { const t = basin * 0.55; r = lerp(r, 176, t); g = lerp(g, 166, t); b = lerp(b, 150, t); }
            /* subtle polar brightening */
            const pole = smoothstep(0.72, 1.0, Math.abs(sl)) * 0.18;
            r += (255 - r) * pole; g += (255 - g) * pole; b += (255 - b) * pole;
            const k = (j * BW + i) * 4;
            bd[k] = r; bd[k + 1] = g; bd[k + 2] = b; bd[k + 3] = 255;
        }
        if ((j & 63) === 0 && onProgress) onProgress(j / BH * 0.6);
    }
    bctx.putImageData(bimg, 0, 0);

    /* ---- upscale base, then stamp craters / rays / basin at full resolution ---- */
    const color = document.createElement("canvas"); color.width = W; color.height = H;
    const ctx = color.getContext("2d")!;
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    ctx.drawImage(base, 0, 0, W, H);
    onProgress?.(0.65);

    const lon2x = (lon: number) => ((lon + Math.PI) / (Math.PI * 2)) * W;
    const lat2y = (lat: number) => ((Math.PI / 2 - lat) / Math.PI) * H;
    const pxPerRad = H / Math.PI;                               // ~ crater px from angular radius

    function stampCrater(x: number, y: number, r: number, fresh: number) {
        for (const xx of [x - W, x, x + W]) {
            if (xx < -r * 3 || xx > W + r * 3) continue;
            // bright ejecta blanket
            ctx.fillStyle = `rgba(206,197,182,${0.03 + 0.09 * fresh})`;
            ctx.beginPath(); ctx.arc(xx, y, r * (1.8 + fresh), 0, 6.2832); ctx.fill();
            // floor (darker), lit from upper-left
            const fg = ctx.createRadialGradient(xx - r * 0.28, y - r * 0.28, Math.max(0.5, r * 0.08), xx, y, r);
            fg.addColorStop(0, "rgba(26,22,19,0.34)");
            fg.addColorStop(0.72, "rgba(46,40,35,0.26)");
            fg.addColorStop(1, "rgba(126,116,100,0.10)");
            ctx.fillStyle = fg; ctx.beginPath(); ctx.arc(xx, y, r, 0, 6.2832); ctx.fill();
            // sunlit rim (upper-left)
            ctx.strokeStyle = `rgba(236,226,206,${0.34 + 0.34 * fresh})`;
            ctx.lineWidth = Math.max(0.6, r * 0.12);
            ctx.beginPath(); ctx.arc(xx, y, r, Math.PI * 0.92, Math.PI * 1.9); ctx.stroke();
            // shadowed rim (lower-right)
            ctx.strokeStyle = "rgba(8,6,5,0.42)";
            ctx.beginPath(); ctx.arc(xx, y, r, Math.PI * -0.08, Math.PI * 0.9); ctx.stroke();
            // small bright central peak
            if (r > 10 && rand() < 0.6) {
                ctx.fillStyle = "rgba(224,214,196,0.4)";
                ctx.beginPath(); ctx.arc(xx, y, Math.max(0.6, r * 0.09), 0, 6.2832); ctx.fill();
            }
        }
    }
    function stampRays(x: number, y: number, r: number, glints: number[][], lat: number, lon: number) {
        const nRays = 26 + ((rand() * 30) | 0);
        for (let i = 0; i < nRays; i++) {
            const a = rand() * 6.2832, len = r * (2.2 + rand() * 6.5);
            const ex = x + Math.cos(a) * len, ey = y + Math.sin(a) * len;
            for (const xx of [x - W, x, x + W]) {
                const exx = xx + (ex - x);
                ctx.strokeStyle = `rgba(240,232,214,${0.02 + 0.07 * rand()})`;
                ctx.lineWidth = 0.8 + rand() * 2.0;
                ctx.beginPath(); ctx.moveTo(xx, y); ctx.lineTo(exx, ey); ctx.stroke();
            }
        }
        // a few bright glints: crater centre + two ray tips
        glints.push([lon, lat, 0.72 + rand() * 0.28]);
        for (let g = 0; g < 2; g++) { const a = rand() * 6.2832, d = r * (3 + rand() * 5); glints.push([lon + Math.cos(a) * d / (W / 6.2832), lat - Math.sin(a) * d / pxPerRad, 0.6 + rand() * 0.3]); }
    }

    /* one big pale basin with a faint ring */
    {
        const bx = lon2x(0.3), by = lat2y(0.12), br = pxPerRad * 0.5;
        ctx.save();
        ctx.fillStyle = "rgba(184,174,158,0.5)";
        ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.2832); ctx.fill();
        ctx.strokeStyle = "rgba(120,110,96,0.35)"; ctx.lineWidth = br * 0.06;
        ctx.beginPath(); ctx.arc(bx, by, br * 0.92, 0, 6.2832); ctx.stroke();
        ctx.restore();
    }

    const glints: number[][] = [];
    const CRATERS = compact ? 800 : 1500;
    const RAYED = 46;
    for (let k = 0; k < CRATERS; k++) {
        const lat = Math.asin(2 * rand() - 1);
        const lon = (rand() * 2 - 1) * Math.PI;
        const r = 1.6 + Math.pow(rand(), 3.4) * (H * 0.052);
        const fresh = rand() < 0.16 ? 0.7 + rand() * 0.3 : rand() * 0.35;
        const x = lon2x(lon), y = lat2y(lat);
        stampCrater(x, y, r, fresh);
        if (k < RAYED && r > 6 && Math.abs(lat) < 1.15) stampRays(x, y, r, glints, lat, lon);
        if ((k & 127) === 0 && onProgress) onProgress(0.65 + (k / CRATERS) * 0.25);
    }

    /* ---- relief (bump) map: high-pass of the colour map's luminance, pole-faded ---- */
    const src = ctx.getImageData(0, 0, W, H).data;
    const gray = new Float32Array(W * H);
    for (let p = 0; p < W * H; p++) gray[p] = (src[p * 4] * 0.299 + src[p * 4 + 1] * 0.587 + src[p * 4 + 2] * 0.114);
    const blur = boxBlur(gray, W, H, 6);
    const bump = document.createElement("canvas"); bump.width = W; bump.height = H;
    const uctx = bump.getContext("2d")!;
    const uimg = uctx.createImageData(W, H);
    const ud = uimg.data;
    for (let j = 0; j < H; j++) {
        const latDeg = Math.abs(90 - ((j + 0.5) / H) * 180);
        const poleFade = 1 - 0.7 * smoothstep(20, 70, latDeg);
        for (let i = 0; i < W; i++) {
            const p = j * W + i;
            let v = 0.5 + (gray[p] - blur[p]) / 255 * 1.6;
            v = 0.5 + (clamp(v, 0, 1) - 0.5) * poleFade;
            const g = clamp(v, 0, 1) * 255;
            ud[p * 4] = ud[p * 4 + 1] = ud[p * 4 + 2] = g; ud[p * 4 + 3] = 255;
        }
        if ((j & 127) === 0 && onProgress) onProgress(0.9 + (j / H) * 0.1);
    }
    uctx.putImageData(uimg, 0, 0);

    glints.sort((a, b) => b[2] - a[2]);
    onProgress?.(1);
    return { color, bump, glints: glints.slice(0, 170), W, H };
}

/* fast separable box blur on a scalar field */
function boxBlur(src: Float32Array, w: number, h: number, r: number) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h);
    const win = r * 2 + 1;
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            let s = 0;
            for (let k = -r; k <= r; k++) s += src[y * w + clamp(x + k, 0, w - 1)];
            tmp[y * w + x] = s / win;
        }
    }
    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let s = 0;
            for (let k = -r; k <= r; k++) s += tmp[clamp(y + k, 0, h - 1) * w + x];
            out[y * w + x] = s / win;
        }
    }
    return out;
}

const DUR = 60;                                                 // seconds for one spin at 1x
const STARS = 2400;

export const MercuryAnimation: React.FC<MercuryAnimationProps> = ({
    className = "",
    style = {},
    compact = false,
    paused = false,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let cancelled = false;
        let rafId = 0;
        let ro: ResizeObserver | null = null;
        let renderer: THREE.WebGLRenderer | null = null;
        const disposables: Array<{ dispose: () => void }> = [];

        const canvas = document.createElement("canvas");
        canvas.className = "mercury-canvas";
        canvas.setAttribute("aria-label", "Rotating 3D globe of Mercury. Drag to turn it in any direction.");
        root.appendChild(canvas);

        const load = document.createElement("div");
        load.className = "mercury-load";
        load.textContent = "Loading surface";
        root.appendChild(load);

        const reduce = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x03040a, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
        let baseDist = 4, zoom = 1;

        /* light: a low sun from the upper left gives the crater relief and a soft shadow on the right limb */
        scene.add(new THREE.AmbientLight(0xdfe6ff, 0.42));
        const sun = new THREE.DirectionalLight(0xfff0da, 1.25);
        sun.position.set(-2.4, 1.4, 2.8);
        scene.add(sun);

        /* orientation: user quaternion on the outer group, own-axis spin on the inner mesh */
        const rootGroup = new THREE.Group(); scene.add(rootGroup);
        const planet = new THREE.Group(); rootGroup.add(planet);
        const home = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0, 0.16));
        rootGroup.quaternion.copy(home);

        const playing = { v: !reduce && !paused };
        let speed = 1, SPIN = 0;
        const uni = { uTime: { value: 0 }, uPR: { value: renderer.getPixelRatio() }, uScale: { value: 1 }, uSurf: { value: 1 } };
        const uniStar = { uTime: uni.uTime, uPR: uni.uPR, uScale: { value: 0 }, uSurf: { value: 0 } };

        const VS = [
            "attribute float aSize; attribute float aPhase; attribute float aKind; attribute float aBase;",
            "uniform float uTime,uPR,uScale,uSurf; varying float vA; varying float vK;",
            "void main(){",
            " vec4 mv=modelViewMatrix*vec4(position,1.0);",
            " vec3 wp=(modelMatrix*vec4(position,1.0)).xyz;",
            " float sp=0.7+fract(aPhase*7.31)*2.4;",
            " float t=0.5+0.5*sin(uTime*sp+aPhase);",
            " float tw=aBase+(1.0-aBase)*pow(t,3.0);",
            " float vis=1.0;",
            " if(uSurf>0.5){ vec3 n=normalize(wp); vis=smoothstep(0.1,0.4,dot(n,normalize(cameraPosition-wp))); }",
            " vA=tw*vis; vK=aKind;",
            " float s=uScale>0.0 ? uScale/(-mv.z) : 1.0;",
            " gl_PointSize=aSize*uPR*s*(0.75+0.5*tw);",
            " gl_Position=projectionMatrix*mv;",
            "}"].join("\n");
        const FS = [
            "uniform vec3 uColor; varying float vA; varying float vK;",
            "void main(){",
            " vec2 p=gl_PointCoord-0.5; float d=length(p)*2.0;",
            " float core=exp(-d*d*10.0);",
            " float spike=exp(-abs(p.x)*46.0)*exp(-abs(p.y)*5.0)+exp(-abs(p.y)*46.0)*exp(-abs(p.x)*5.0);",
            " float v=core+vK*spike*0.95;",
            " v*=1.0-smoothstep(0.78,1.0,max(abs(p.x),abs(p.y))*2.0);",
            " gl_FragColor=vec4(uColor,clamp(v*vA,0.0,1.0));",
            "}"].join("\n");
        function pointsMat(u: Record<string, { value: any }>, color: number) {
            const uu = Object.assign({}, u, { uColor: { value: new THREE.Color(color) } });
            const m = new THREE.ShaderMaterial({ uniforms: uu, vertexShader: VS, fragmentShader: FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
            disposables.push(m);
            return m;
        }
        function mkPoints(pos: number[], size: number[], phase: number[], kind: number[], base: number[], mat: THREE.Material) {
            const g = new THREE.BufferGeometry();
            g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
            g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(size), 1));
            g.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(phase), 1));
            g.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(kind), 1));
            g.setAttribute("aBase", new THREE.BufferAttribute(new Float32Array(base), 1));
            const p = new THREE.Points(g, mat); p.frustumCulled = false;
            disposables.push(g);
            return p;
        }

        /* background stars and a few 4-point sparkles */
        {
            const pos: number[] = [], size: number[] = [], ph: number[] = [], kind: number[] = [], base: number[] = [];
            const r = mulberry32(99);
            for (let i = 0; i < STARS; i++) {
                const u = r() * 2 - 1, a = r() * Math.PI * 2, rr = Math.sqrt(1 - u * u), R = 120;
                pos.push(R * rr * Math.cos(a), R * u, R * rr * Math.sin(a));
                const big = r() < 0.012;
                size.push(big ? 16 + r() * 10 : 1.6 + r() * 3.2);
                ph.push(r() * 6.283); kind.push(big ? 1 : 0); base.push(big ? 0.35 : 0.55 + r() * 0.35);
            }
            scene.add(mkPoints(pos, size, ph, kind, base, pointsMat(uniStar, 0xcfd8ff)));
        }

        let meshRef: THREE.Mesh | null = null;
        const lonlat = (l: number, p: number, rad: number) => [rad * Math.cos(l) * Math.cos(p), rad * Math.sin(p), -rad * Math.sin(l) * Math.cos(p)];

        function build(assets: MercuryAssets) {
            const aniso = renderer!.capabilities.getMaxAnisotropy();
            const map = new THREE.CanvasTexture(assets.color);
            map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = aniso; map.needsUpdate = true;
            const bump = new THREE.CanvasTexture(assets.bump);
            bump.anisotropy = aniso; bump.needsUpdate = true;
            disposables.push(map, bump);

            const mat = new THREE.MeshStandardMaterial({
                map, bumpMap: bump, bumpScale: 0.4, roughness: 0.97, metalness: 0,
                emissive: 0xffffff, emissiveMap: map, emissiveIntensity: 0.1, /* keeps colours alive on the shaded side */
            });
            const geo = new THREE.SphereGeometry(1, 192, 128);
            disposables.push(mat, geo);
            meshRef = new THREE.Mesh(geo, mat);
            planet.add(meshRef);

            /* thin glow around the edge */
            const rimGeo = new THREE.SphereGeometry(1.16, 96, 64);
            const rimMat = new THREE.ShaderMaterial({
                side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
                vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
                fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f=pow(clamp(-dot(normalize(vN),normalize(vV)),0.0,1.0),3.0); vec3 c=mix(vec3(0.95,0.72,0.35),vec3(0.35,0.5,1.0),0.55); gl_FragColor=vec4(c,f*0.34); }",
            });
            disposables.push(rimGeo, rimMat);
            scene.add(new THREE.Mesh(rimGeo, rimMat));

            /* twinkling glints on crater rays, they turn with the planet */
            const pos: number[] = [], size: number[] = [], ph: number[] = [], kind: number[] = [], base: number[] = [];
            const r = mulberry32(7);
            assets.glints.forEach((g) => {
                const q = lonlat(g[0], g[1], 1.004);
                pos.push(q[0], q[1], q[2]);
                const b = clamp((g[2] - 0.66) / 0.34, 0, 1);
                size.push(4 + b * 11); ph.push(r() * 6.283); kind.push(b > 0.55 ? 1 : 0); base.push(0.12 + r() * 0.2);
            });
            meshRef.add(mkPoints(pos, size, ph, kind, base, pointsMat(uni, 0xfff3dc)));

            load.classList.add("mercury-gone");
            resize();
            rafId = requestAnimationFrame(frame);
        }

        function resize() {
            const w = canvas.clientWidth || window.innerWidth, h = canvas.clientHeight || window.innerHeight;
            renderer!.setSize(w, h, false);
            camera.aspect = w / h;
            const asp = Math.min(1, w / h);
            baseDist = Math.min(9, 1 / (0.6 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * asp));
            applyZoom(w, h);
        }
        function applyZoom(w?: number, h?: number) {
            w = w || canvas.clientWidth; h = h || canvas.clientHeight;
            const d = baseDist / zoom;
            camera.position.set(0, 0, d); camera.updateProjectionMatrix();
            uni.uScale.value = d * Math.min(1, Math.min(w!, h!) / 820) * 1.05;
        }

        /* clock + inertia */
        let last = performance.now(), tAcc = 0, vx = 0, vy = 0, dragging = false;
        const AX = new THREE.Vector3(1, 0, 0), AY = new THREE.Vector3(0, 1, 0), dq = new THREE.Quaternion(), dq2 = new THREE.Quaternion();
        function turn(dx: number, dy: number) {
            dq.setFromAxisAngle(AY, dx); dq2.setFromAxisAngle(AX, dy);
            rootGroup.quaternion.premultiply(dq).premultiply(dq2).normalize();
        }
        function frame(now: number) {
            if (cancelled) return;
            rafId = requestAnimationFrame(frame);
            const dt = Math.min(0.1, (now - last) / 1000); last = now; tAcc += dt; uni.uTime.value = tAcc;
            if (playing.v && !dragging) SPIN += dt * speed * Math.PI * 2 / DUR;
            if (!dragging && (Math.abs(vx) > 1e-5 || Math.abs(vy) > 1e-5)) { turn(vx * dt * 60, vy * dt * 60); const k = Math.pow(0.92, dt * 60); vx *= k; vy *= k; }
            if (meshRef) meshRef.rotation.y = -Math.PI / 2 + SPIN;
            renderer!.render(scene, camera);
        }

        /* drag in any direction, flick for momentum, wheel or pinch to zoom, double-click to reset */
        const ptrs = new Map<number, [number, number]>();
        let pinch = 0, lx = 0, ly = 0, hover = false;
        const onDown = (e: PointerEvent) => {
            canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, [e.clientX, e.clientY]);
            if (ptrs.size === 1) { dragging = true; canvas.classList.add("drag"); lx = e.clientX; ly = e.clientY; vx = vy = 0; }
            if (ptrs.size === 2) { const a = Array.from(ptrs.values()); pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]); }
        };
        const onMove = (e: PointerEvent) => {
            if (!ptrs.has(e.pointerId)) return;
            ptrs.set(e.pointerId, [e.clientX, e.clientY]);
            if (ptrs.size === 2) {
                const a = Array.from(ptrs.values()), d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
                if (pinch > 0) { zoom = Math.max(0.6, Math.min(2.2, zoom * d / pinch)); applyZoom(); } pinch = d; return;
            }
            const dx = (e.clientX - lx) * 0.008, dy = (e.clientY - ly) * 0.008; lx = e.clientX; ly = e.clientY;
            turn(dx, dy);
            vx = dx * 0.6 + vx * 0.4; vy = dy * 0.6 + vy * 0.4;
        };
        const up = (e: PointerEvent) => {
            ptrs.delete(e.pointerId); pinch = 0;
            if (ptrs.size === 0) { dragging = false; canvas.classList.remove("drag"); }
        };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); zoom = Math.max(0.6, Math.min(2.2, zoom * Math.exp(-e.deltaY * 0.001))); applyZoom(); };
        const onDbl = () => { rootGroup.quaternion.copy(home); vx = vy = 0; zoom = 1; applyZoom(); };
        const onEnter = () => { hover = true; };
        const onLeave = () => { hover = false; };
        const onKey = (e: KeyboardEvent) => { if (hover && e.code === "Space") { e.preventDefault(); playing.v = !playing.v; } };

        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerup", up);
        canvas.addEventListener("pointercancel", up);
        canvas.addEventListener("wheel", onWheel, { passive: false });
        canvas.addEventListener("dblclick", onDbl);
        canvas.addEventListener("pointerenter", onEnter);
        canvas.addEventListener("pointerleave", onLeave);
        window.addEventListener("keydown", onKey);
        ro = new ResizeObserver(resize);
        ro.observe(root);

        let assetsRef: MercuryAssets | null = null;

        /* runtime API (parity with the reference; removed on unmount) */
        const w = window as any;
        w.__duration = DUR; w.__fps = 60;
        Object.defineProperty(w, "__count", { configurable: true, get: () => (assetsRef?.glints.length || 0) + STARS });
        w.__seek = (t: number) => { SPIN = (t / DUR) * Math.PI * 2; if (meshRef) { meshRef.rotation.y = -Math.PI / 2 + SPIN; renderer!.render(scene, camera); } };
        w.__play = () => { playing.v = true; };
        w.__pause = () => { playing.v = false; };

        /* forge the surface on the CPU, then build the scene */
        const idle = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 0));
        idle(() => {
            if (cancelled) return;
            try {
                const assets = buildMercury(compact);
                if (cancelled) return;
                assetsRef = assets;
                build(assets);
            } catch (err) {
                // Surface synthesis failed — leave the loader up rather than a blank canvas.
                load.textContent = "Unable to render";
                // eslint-disable-next-line no-console
                console.error("[MercuryAnimation]", err);
            }
        });

        return () => {
            cancelled = true;
            if (rafId) cancelAnimationFrame(rafId);
            ro?.disconnect();
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", up);
            canvas.removeEventListener("pointercancel", up);
            canvas.removeEventListener("wheel", onWheel);
            canvas.removeEventListener("dblclick", onDbl);
            canvas.removeEventListener("pointerenter", onEnter);
            canvas.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("keydown", onKey);
            try { delete w.__duration; delete w.__fps; delete w.__count; delete w.__seek; delete w.__play; delete w.__pause; } catch { /* ignore */ }
            disposables.forEach((d) => { try { d.dispose(); } catch { /* ignore */ } });
            renderer?.dispose();
            (renderer as any)?.forceContextLoss?.();
            renderer = null;
            canvas.remove();
            load.remove();
        };
    }, [compact, paused]);

    return <div ref={rootRef} className={`mercury-root select-none ${className}`} style={style} />;
};

export default MercuryAnimation;
