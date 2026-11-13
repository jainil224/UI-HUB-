/**
 * Redline Mars Hero — UI HUB
 *
 * A three-step, single-viewport space-travel hero for "Redline": a 3D Mars
 * swells in front of a giant white word, slides aside to light up the Tharsis
 * territory with a timeline of landing sites, then the camera dives into the
 * planet, whites out in a dust cloud and lands on a canyon with a booking bar.
 *
 * One state float `st` (0..2) drives everything, exactly like the reference:
 * every moving value is recomputed each frame in `frame(now)` from `st` alone.
 *
 * Adaptations for embedding in the UI HUB preview stage (1280x720 canvas that
 * the host page scales with a CSS transform):
 *   - The global resets (html/body) are dropped and every selector is scoped
 *     under `.rlx-hero`, so nothing leaks into the host page.
 *   - The root is a 720px stage instead of a fixed 100vh hero.
 *   - Viewport units are mirrored as container units (cqw/cqh/cqmin) so the
 *     layout measures the 1280px stage, not the browser window, at any scale.
 *   - Pointer coordinates are divided by the stage scale, so drag, click-to-land
 *     and the landing parallax stay correct when the preview is scaled down.
 *   - The four source images are vendored under /assets/build-sections/
 *     redline-mars/ (681 kB instead of 2.19 MB over a slow CDN) so the planet
 *     paints immediately. Original CDN sources:
 *       MAP    https://images.higgs.ai/?...&w=2688&q=92
 *       LAND   https://images.higgs.ai/?...&w=2400&q=88
 *       FORE   https://images.higgs.ai/?...&w=2400&q=88
 *       CARDS  https://images.higgs.ai/?...&w=1400&q=85
 */

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ASSET_ROOT = '/assets/build-sections/redline-mars/';
const MAP_SRC = ASSET_ROOT + 'mars-map.webp';
const LAND_SRC = ASSET_ROOT + 'canyon.webp';
const FORE_SRC = ASSET_ROOT + 'spires.webp';
const SHEET_SRC = ASSET_ROOT + 'sites-sheet.webp';

/** Seam-fix canvas size. 2:1 equirect; the source map is 2.33:1 and is stretched in. */
const MAP_W = 1344;
const MAP_H = 672;

/** Source photo sheet, in its own pixel units (the vendored file is a uniform 50% scale). */
const SHEET = { w: 2336, h: 1744 };

interface MarsSite {
  name: string;
  /** Map position, 0..1 from the top-left of the equirect map. */
  u: number;
  v: number;
  /** Card crop on the 2336x1744 photo sheet: x, y, w, h. */
  box: [number, number, number, number];
}

const SITES: MarsSite[] = [
  { name: 'Olympus Mons', u: 0.121, v: 0.31, box: [0, 0, 1150, 810] },
  { name: 'Valles Marineris', u: 0.45, v: 0.56, box: [1186, 0, 1150, 810] },
  { name: 'Gale Crater', u: 0.85, v: 0.75, box: [0, 900, 1150, 810] },
  { name: 'Jezero Delta', u: 0.61, v: 0.35, box: [1186, 900, 1150, 810] },
];

const THARSIS = { u: 0.15, v: 0.41 };

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const io = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const out = (k: number) => 1 - Math.pow(1 - k, 3);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Direction of a map point on the sphere, matching SphereGeometry's UV layout. */
const mapDir = (u: number, v: number) => {
  const ph = 2 * Math.PI * u;
  const th = Math.PI * v;
  return new THREE.Vector3(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th));
};

/* ------------------------------------------------------------------ *
 * Scoped stylesheet (verbatim from the reference, container units)
 * ------------------------------------------------------------------ */

const CSS = `
.rlx-hero{
  position:relative;width:100%;height:720px;overflow:hidden;
  background:radial-gradient(58% 72% at 50% 47%,#d0591f 0%,#a23f12 32%,#6b2409 62%,#3b1405 100%);
  color:#fff;font-family:Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  --red:#e8283c;--deep:#2a0d04;container-type:size;isolation:isolate;
}
.rlx-hero *,.rlx-hero *::before,.rlx-hero *::after{box-sizing:border-box;margin:0;padding:0}
.rlx-hero a{color:inherit;text-decoration:none}
.rlx-hero button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.rlx-hero>div,.rlx-hero>canvas,.rlx-hero>ul,.rlx-hero>form,.rlx-hero>header{position:absolute}

.rlx-hero .rlx-word0{left:50%;top:50%;font-weight:900;font-size:min(27vw,50vh);font-size:min(27cqw,50cqh);
  line-height:.8;letter-spacing:-.035em;white-space:nowrap;z-index:2;will-change:transform,clip-path}
.rlx-hero .rlx-eyebrow{left:50%;top:50%;z-index:3;font-weight:300;font-size:clamp(14px,1.45vw,23px);
  font-size:clamp(14px,1.45cqw,23px);letter-spacing:.1em;text-transform:uppercase;white-space:nowrap}
.rlx-hero .rlx-gl{inset:0;width:100%;height:100%;z-index:4;cursor:grab;touch-action:none}
.rlx-hero .rlx-gl.drag{cursor:grabbing}
.rlx-hero .rlx-dust{inset:0;width:100%;height:100%;z-index:5;pointer-events:none}
.rlx-hero .rlx-flare{z-index:1;width:44vmin;height:44vmin;width:44cqmin;height:44cqmin;
  margin:-22vmin;margin:-22cqmin;border-radius:50%;pointer-events:none;
  background:radial-gradient(closest-side,rgba(255,236,205,.95),rgba(255,176,96,.42) 26%,rgba(255,140,60,.1) 58%,transparent)}

.rlx-hero .rlx-pin{z-index:6;left:0;top:0;display:flex;align-items:center;gap:9px;font-weight:600;font-size:11px;
  letter-spacing:.16em;text-transform:uppercase;pointer-events:none;white-space:nowrap}
.rlx-hero .rlx-pin i{width:12px;height:12px;border-radius:50%;background:#fff;position:relative;
  box-shadow:0 0 0 4px rgba(232,40,60,.75)}
.rlx-hero .rlx-pin i::after{content:"";position:absolute;inset:-13px;border-radius:50%;border:1px solid #fff;
  animation:rlx-pulse 2s ease-out infinite}
@keyframes rlx-pulse{from{transform:scale(.4);opacity:1}to{transform:scale(1.4);opacity:0}}

.rlx-hero .rlx-word1{left:50%;top:0;z-index:6;font-weight:800;font-size:min(9.4vw,19vh);
  font-size:min(9.4cqw,19cqh);letter-spacing:-.02em;line-height:1;color:rgba(255,255,255,.74);
  pointer-events:none;white-space:nowrap}

.rlx-hero .rlx-sites{right:6.2%;top:50%;z-index:7;list-style:none;display:grid;
  gap:clamp(30px,6.6vh,62px);gap:clamp(30px,6.6cqh,62px);transform:translateY(-50%)}
.rlx-hero .rlx-sites::before{content:"";position:absolute;right:5px;top:6px;bottom:6px;width:1px;
  background:rgba(255,255,255,.5)}
.rlx-hero .rlx-sites li{position:relative;text-align:right;padding-right:30px;cursor:pointer;
  font-weight:500;font-size:11.5px;letter-spacing:.07em;text-transform:uppercase;transition:font-size .3s}
.rlx-hero .rlx-sites li::after{content:"";position:absolute;right:1px;top:50%;width:9px;height:9px;
  margin-top:-5px;border-radius:50%;background:#fff;transition:transform .3s,box-shadow .3s}
.rlx-hero .rlx-sites li.on{font-size:15px}
.rlx-hero .rlx-sites li.on::after{transform:scale(1.5);box-shadow:0 0 0 7px rgba(255,255,255,.28)}
.rlx-hero .rlx-card{right:calc(6.2% + 196px);top:0;z-index:7;width:clamp(170px,15.5vw,250px);
  width:clamp(170px,15.5cqw,250px);aspect-ratio:1.42;background-repeat:no-repeat;border-radius:3px;
  box-shadow:0 22px 44px rgba(20,4,0,.45);overflow:visible}
.rlx-hero .rlx-card a{position:absolute;left:-26px;bottom:18%;background:var(--red);font-weight:600;
  font-size:10.5px;letter-spacing:.09em;text-transform:uppercase;padding:9px 15px;border-radius:2px;
  box-shadow:0 8px 18px rgba(120,10,20,.45)}

.rlx-hero .rlx-region{left:50%;top:50%;z-index:7;transform:translate(-50%,-50%);font-weight:500;
  font-size:clamp(26px,3.4vw,54px);font-size:clamp(26px,3.4cqw,54px);letter-spacing:.04em;pointer-events:none}

.rlx-hero .rlx-land,.rlx-hero .rlx-fore{inset:0;background-size:cover;background-repeat:no-repeat}
.rlx-hero .rlx-land{z-index:8;background-position:50% 60%;will-change:transform}
.rlx-hero .rlx-dest{left:0;right:0;top:0;z-index:9;text-align:center;pointer-events:none}
.rlx-hero .rlx-dest small{display:block;font-weight:300;font-size:min(5.2vw,11vh);font-size:min(5.2cqw,11cqh);
  line-height:1;letter-spacing:.04em;text-transform:uppercase;opacity:.92}
.rlx-hero .rlx-dest b{display:block;margin-top:.04em;font-weight:900;font-size:min(9.2vw,19vh);
  font-size:min(9.2cqw,19cqh);line-height:1;letter-spacing:-.03em;text-transform:uppercase;
  white-space:nowrap;color:#fff4e6}
.rlx-hero .rlx-fore{z-index:10;background-position:50% 100%;will-change:transform}
.rlx-hero .rlx-fog{inset:0;z-index:11;pointer-events:none;
  background:radial-gradient(70% 64% at 50% 46%,#fbe6cd 0%,#f6d3ae 52%,#b36a37 100%)}

.rlx-hero .rlx-scrim{left:0;right:0;top:0;height:150px;z-index:13;pointer-events:none;
  background:linear-gradient(rgba(44,14,3,.62),rgba(44,14,3,0))}
.rlx-hero .rlx-bar{left:50%;bottom:7.5vh;bottom:7.5cqh;z-index:12;width:min(86vw,920px);
  width:min(86cqw,920px);display:grid;grid-template-columns:1fr 1fr 1fr 68px;background:#fff;
  color:#2b1a12;border-radius:3px;box-shadow:0 24px 60px rgba(30,6,0,.5)}
.rlx-hero .rlx-bar div{padding:15px 22px;border-right:1px solid #eadfd6}
.rlx-hero .rlx-bar label{display:block;font-weight:500;font-size:10px;letter-spacing:.09em;
  text-transform:uppercase;color:#9a877b}
.rlx-hero .rlx-bar input{width:100%;margin-top:5px;border:0;outline:0;font:600 15px Montserrat,sans-serif;
  color:#2b1a12;background:none}
.rlx-hero .rlx-bar button{background:var(--red);color:#fff;border-radius:0 3px 3px 0;font-size:22px;
  transition:background .25s}
.rlx-hero .rlx-bar button:hover{background:#c41426}

.rlx-hero header{left:0;right:0;top:0;z-index:20;display:flex;align-items:center;
  padding:clamp(18px,3.2vh,30px) clamp(20px,2.6vw,42px);
  padding:clamp(18px,3.2cqh,30px) clamp(20px,2.6cqw,42px);
  font-size:11.5px;font-weight:500;letter-spacing:.05em;text-transform:uppercase;pointer-events:none}
.rlx-hero header>*{pointer-events:auto}
.rlx-hero .rlx-logo{display:flex;align-items:center;gap:12px;margin-right:auto;font-weight:800;
  font-size:19px;letter-spacing:-.01em;text-transform:none}
.rlx-hero .rlx-logo svg{width:34px;height:30px}
.rlx-hero header a{margin-left:clamp(16px,2.6vw,38px);margin-left:clamp(16px,2.6cqw,38px);
  opacity:.92;transition:opacity .2s}
.rlx-hero header a:hover{opacity:1}
.rlx-hero .rlx-ico{width:42px;height:42px;margin-left:clamp(14px,2.4vw,36px);
  margin-left:clamp(14px,2.4cqw,36px);border-radius:50%;display:grid;place-items:center;
  background:rgba(255,255,255,.2);transition:background .25s}
.rlx-hero .rlx-ico:hover{background:rgba(255,255,255,.34)}
.rlx-hero .rlx-ico svg,.rlx-hero .rlx-srch svg{width:16px;height:16px;fill:none;stroke:#fff;
  stroke-width:2;stroke-linecap:round}
.rlx-hero .rlx-srch{margin-left:clamp(16px,2.6vw,38px);margin-left:clamp(16px,2.6cqw,38px)}
.rlx-hero .rlx-rail{left:clamp(20px,2.6vw,42px);left:clamp(20px,2.6cqw,42px);top:50%;z-index:20;
  display:grid;gap:15px;transform:translateY(-50%)}
.rlx-hero .rlx-rail button{width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,.45);
  transition:background .3s,transform .3s}
.rlx-hero .rlx-rail button.on{background:#fff;transform:scale(1.35)}
.rlx-hero .rlx-hint{left:50%;bottom:4.4vh;bottom:4.4cqh;transform:translateX(-50%);z-index:7;
  font-weight:400;font-size:11px;letter-spacing:.17em;text-transform:uppercase;opacity:.8;white-space:nowrap}

@container (max-width:760px){
  .rlx-hero header a{display:none}
  .rlx-hero .rlx-word0{font-size:29cqw}
  .rlx-hero .rlx-eyebrow{font-size:12px}
  .rlx-hero .rlx-word1{font-size:15cqw}
  .rlx-hero .rlx-sites{right:18px;top:auto;bottom:11cqh;transform:none;gap:22px}
  .rlx-hero .rlx-card{right:auto;left:18px;top:auto!important;bottom:11cqh;width:42cqw}
  .rlx-hero .rlx-card a{left:8px;bottom:8px}
  .rlx-hero .rlx-dest b{font-size:11cqw}
  .rlx-hero .rlx-dest small{font-size:7cqw}
  .rlx-hero .rlx-bar{grid-template-columns:1fr 1fr;width:calc(100% - 32px);bottom:4cqh}
  .rlx-hero .rlx-bar div:nth-child(2){border-right:0}
  .rlx-hero .rlx-bar div{padding:11px 14px;border-bottom:1px solid #eadfd6}
  .rlx-hero .rlx-bar button{height:46px;border-radius:0 0 3px 0}
  .rlx-hero .rlx-hint,.rlx-hero .rlx-rail{display:none}
  .rlx-hero .rlx-fore{background-size:210% auto}
}
`;

/* ------------------------------------------------------------------ *
 * GLSL — Mars surface + atmosphere (verbatim)
 * ------------------------------------------------------------------ */

const MARS_VERT = `
  varying vec2 vUv; varying vec3 vObj; varying vec3 vN;
  void main(){ vUv = uv; vObj = normalize(position); vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }
`;

const MARS_FRAG = `
    uniform sampler2D map; uniform vec2 texel; uniform vec3 sun, hiDir; uniform float hi, hiR, ready;
    varying vec2 vUv; varying vec3 vObj; varying vec3 vN;
    float luma(vec2 u){ return dot(texture2D(map, u).rgb, vec3(.3,.6,.1)); }
    void main(){
      vec3 col = texture2D(map, vUv).rgb; col = pow(col, vec3(2.6)) * vec3(1.18,.74,.56);
      vec3 n = normalize(vN);
      vec3 t = normalize(cross(vec3(0.,1.,0.), n)), b = cross(n, t);
      float dx = luma(vUv + vec2(texel.x*2.,0.)) - luma(vUv - vec2(texel.x*2.,0.));
      float dy = luma(vUv + vec2(0.,texel.y*2.)) - luma(vUv - vec2(0.,texel.y*2.));
      n = normalize(n - (t*dx + b*dy) * 1.9);
      float diff = max(dot(n, sun), 0.);
      vec3 lit = col * (vec3(1.5,1.32,1.18) * pow(diff, .85) + vec3(.2,.09,.06));
      float d = acos(clamp(dot(normalize(vObj), hiDir), -1., 1.)) + (luma(vUv) - .45) * .22;
      float m = smoothstep(hiR, hiR - .03, d), edge = smoothstep(.03, .0, abs(d - hiR + .01));
      lit = mix(lit, mix(lit, vec3(.62,.012,.07) * (.25 + diff * 1.05) * (.5 + luma(vUv) * 1.1), .9), m * hi)
            + vec3(1.,.42,.4) * edge * hi * .22;
      float fres = pow(1. - max(vN.z, 0.), 3.2);
      lit += vec3(1.,.5,.26) * fres * (.05 + diff * .5);
      lit = lit / (lit * .3 + 1.) * 1.3;
      gl_FragColor = vec4(pow(lit, vec3(1./2.2)), 1.) * ready;
    }
`;

const ATMO_VERT = `
  varying vec3 vN;
  void main(){ vN = normalize(mat3(modelMatrix)*normal);
    gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }
`;

const ATMO_FRAG = `
  uniform vec3 sun; uniform float ready; varying vec3 vN;
  void main(){ float z = clamp(-vN.z, 0., 1.), a = smoothstep(.0, .55, z);
    float s = .55 + .6 * max(dot(-vN * vec3(1.,1.,0.), normalize(sun * vec3(1.,1.,0.))), 0.);
    a = pow(a, 2.6) * s * .7; gl_FragColor = vec4(vec3(1.,.64,.36), a * ready); }
`;
/* ------------------------------------------------------------------ *
 * Engine
 * ------------------------------------------------------------------ */

function createEngine(root: HTMLDivElement): () => void {
  const q = <T extends HTMLElement>(sel: string): T => {
    const node = root.querySelector(sel);
    if (!node) throw new Error('Redline Mars: missing node ' + sel);
    return node as T;
  };

  const gl = q<HTMLCanvasElement>('.rlx-gl');
  const word0 = q<HTMLElement>('.rlx-word0');
  const eyebrow = q<HTMLElement>('.rlx-eyebrow');
  const flare = q<HTMLElement>('.rlx-flare');
  const dust = q<HTMLCanvasElement>('.rlx-dust');
  const pin = q<HTMLElement>('.rlx-pin');
  const word1 = q<HTMLElement>('.rlx-word1');
  const sites = q<HTMLElement>('.rlx-sites');
  const items = Array.from(root.querySelectorAll<HTMLElement>('.rlx-sites li'));
  const card = q<HTMLElement>('.rlx-card');
  const region = q<HTMLElement>('.rlx-region');
  const land = q<HTMLElement>('.rlx-land');
  const dest = q<HTMLElement>('.rlx-dest');
  const destSmall = dest.querySelector('small') as HTMLElement;
  const destName = q<HTMLElement>('.rlx-dest b');
  const fore = q<HTMLElement>('.rlx-fore');
  const fog = q<HTMLElement>('.rlx-fog');
  const scrim = q<HTMLElement>('.rlx-scrim');
  const bar = q<HTMLElement>('.rlx-bar');
  const hint = q<HTMLElement>('.rlx-hint');
  const railBtns = Array.from(root.querySelectorAll<HTMLButtonElement>('.rlx-rail button'));
  const homeLink = q<HTMLAnchorElement>('.rlx-home');
  const exploreLink = q<HTMLAnchorElement>('.rlx-explore');

  /* Montserrat is not loaded site-wide; one guarded <link> serves every mount. */
  const FONT_ID = 'rlx-montserrat';
  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement('link');
    link.id = FONT_ID;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;800;900&display=swap';
    document.head.appendChild(link);
  }

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: gl, alpha: true, antialias: true });
  } catch {
    // No WebGL: the CSS gradient, the word and the whole DOM story still render.
    return () => undefined;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-640, 640, 360, -360, -2e5, 2e5);

  const planet = new THREE.Group();
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  planet.add(tilt);
  tilt.add(spin);
  scene.add(planet);

  const siteDirs = SITES.map((site) => mapDir(site.u, site.v));
  const tharsisDir = mapDir(THARSIS.u, THARSIS.v);

  const placeholder = new THREE.DataTexture(new Uint8Array([18, 8, 4, 255]), 1, 1);
  placeholder.needsUpdate = true;

  const uniforms = {
    map: { value: placeholder as THREE.Texture },
    texel: { value: new THREE.Vector2(1 / MAP_W, 1 / MAP_H) },
    sun: { value: new THREE.Vector3(0.62, 0.5, 0.6).normalize() },
    hiDir: { value: tharsisDir.clone() },
    hi: { value: 0 },
    hiR: { value: 0.62 },
    ready: { value: 0 },
  };

  const surface = new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 96),
    new THREE.ShaderMaterial({ uniforms, vertexShader: MARS_VERT, fragmentShader: MARS_FRAG }),
  );
  spin.add(surface);

  const atmoUniforms = {
    sun: { value: uniforms.sun.value },
    ready: uniforms.ready,
  };
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.14, 64, 48),
    new THREE.ShaderMaterial({
      uniforms: atmoUniforms,
      vertexShader: ATMO_VERT,
      fragmentShader: ATMO_FRAG,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    }),
  );
  planet.add(atmosphere);

  /* ---- state ---- */
  let disposed = false;
  let raf = 0;
  let W = 1280;
  let H = 720;
  let portrait = false;
  let R0 = 216;
  let wordW = 0;
  let wordH = 0;
  let eyebrowW = 0;
  let sizeDirty = true;

  let st = 0;
  let from = 0;
  let to = 0;
  let t0 = 0;
  let dur = 0;

  let yaw = Math.atan2(-mapDir(0.4, 0.5).x, mapDir(0.4, 0.5).z);
  let pitch = 0.16;
  let vy = 0;
  let lastDrag = -1e9;
  let active = 0;

  let pointerX = 640;
  let pointerY = 360;
  let mouseX = 0;
  let mouseY = 0;
  let cx = 640;
  let cy = 360;
  let R = 216;

  let introAt = 0;
  let lastWheel = -1e9;
  let reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const startIntro = () => {
    if (!introAt) introAt = performance.now();
  };
  const introFallback = window.setTimeout(startIntro, 900);

  /* ---- state machine ---- */
  const spanMs = (lo: number, hi: number) => {
    let ms = 0;
    if (lo < 1 && hi > 0) ms += 1300 * (Math.min(hi, 1) - lo);
    if (lo < 2 && hi > 1) ms += 2500 * (hi - Math.max(lo, 1));
    return ms;
  };

  const go = (n: number) => {
    const target = Math.max(0, Math.min(2, n));
    if (target === to) return;
    from = st;
    to = target;
    t0 = performance.now();
    dur = reduced ? 1 : Math.max(1, spanMs(Math.min(from, to), Math.max(from, to)));
  };

  /* ---- card crop + active site ---- */
  const pick = (index: number) => {
    const site = SITES[index];
    if (!site) return;
    active = index;
    items.forEach((node, i) => node.classList.toggle('on', i === index));

    const [x, y, w, h] = site.box;
    card.style.backgroundImage = 'url(' + SHEET_SRC + ')';
    card.style.backgroundSize = (SHEET.w / w) * 100 + '% ' + (SHEET.h / h) * 100 + '%';
    card.style.backgroundPosition =
      (x / (SHEET.w - w)) * 100 + '% ' + (y / (SHEET.h - h)) * 100 + '%';

    const rootRect = root.getBoundingClientRect();
    const scale = rootRect.width / (root.offsetWidth || 1) || 1;
    const rect = items[index].getBoundingClientRect();
    const top = (rect.top - rootRect.top) / scale + rect.height / 2 / scale - card.offsetHeight / 2;
    card.style.top = top.toFixed(2) + 'px';

    region.textContent = site.name.toUpperCase();
    destName.textContent = site.name;
  };

  /* ---- map texture: seam fix + pole gradients ---- */
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    if (disposed) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = MAP_W;
      canvas.height = MAP_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('no 2d context');

      // The generated map is not seamless: stretch the left 7% across the seam.
      ctx.drawImage(img, 0, 0, MAP_W, MAP_H);
      const fw = Math.round(MAP_W * 0.07);
      const temp = document.createElement('canvas');
      temp.width = fw;
      temp.height = MAP_H;
      const tctx = temp.getContext('2d');
      if (tctx) {
        tctx.drawImage(canvas, 0, 0, fw, MAP_H, 0, 0, fw, MAP_H);
        const mask = tctx.createLinearGradient(0, 0, fw, 0);
        mask.addColorStop(0, 'rgba(0,0,0,0)');
        mask.addColorStop(1, 'rgba(0,0,0,1)');
        tctx.globalCompositeOperation = 'destination-in';
        tctx.fillStyle = mask;
        tctx.fillRect(0, 0, fw, MAP_H);
        ctx.drawImage(temp, MAP_W - fw, 0);
      }

      // Poles: pinch the top and bottom 3.5% into the map's own polar tone.
      const ph = Math.max(1, Math.round(MAP_H * 0.035));
      const topGrad = ctx.createLinearGradient(0, 0, 0, ph);
      topGrad.addColorStop(0, '#e9dfd2');
      topGrad.addColorStop(1, 'rgba(233,223,210,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, MAP_W, ph);
      const botGrad = ctx.createLinearGradient(0, MAP_H - ph, 0, MAP_H);
      botGrad.addColorStop(0, 'rgba(233,223,210,0)');
      botGrad.addColorStop(1, '#e9dfd2');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, MAP_H - ph, MAP_W, ph);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.NoColorSpace;
      texture.wrapS = THREE.RepeatWrapping;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      texture.needsUpdate = true;
      uniforms.map.value = texture;
      uniforms.texel.value.set(1 / MAP_W, 1 / MAP_H);
      uniforms.ready.value = 1;
      startIntro();
    } catch {
      startIntro();
    }
  };
  img.onerror = () => startIntro();
  img.src = MAP_SRC;

  /* ---- dust motes ---- */
  const dustCtx = dust.getContext('2d');
  const dustDpr = Math.min(window.devicePixelRatio || 1, 1.5);
  const sprite = document.createElement('canvas');
  sprite.width = 64;
  sprite.height = 64;
  const spriteCtx = sprite.getContext('2d');
  if (spriteCtx) {
    const radial = spriteCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    radial.addColorStop(0, 'rgba(255,214,170,.95)');
    radial.addColorStop(0.4, 'rgba(255,180,120,.42)');
    radial.addColorStop(1, 'rgba(255,180,120,0)');
    spriteCtx.fillStyle = radial;
    spriteCtx.fillRect(0, 0, 64, 64);
  }
  let seed = 0x1a2b3c;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const motes = Array.from({ length: 34 }, () => {
    const r1 = rnd();
    return {
      x: rnd(),
      y: rnd(),
      r: 3 + r1 * r1 * 34,
      s: 0.004 + rnd() * 0.012,
      p: rnd() * 6.28,
    };
  });

  /* ---- measurement ---- */
  const measure = () => {
    sizeDirty = false;
    W = root.clientWidth || 1280;
    H = root.clientHeight || 720;
    portrait = H > W * 1.05;
    R0 = portrait ? W * 0.36 : Math.min(H * 0.3, W * 0.19);
    wordW = word0.offsetWidth;
    wordH = word0.offsetHeight;
    eyebrowW = eyebrow.offsetWidth;

    renderer.setSize(W, H);
    camera.left = -W / 2;
    camera.right = W / 2;
    camera.top = H / 2;
    camera.bottom = -H / 2;
    camera.updateProjectionMatrix();

    dust.width = Math.max(1, Math.round(W * dustDpr));
    dust.height = Math.max(1, Math.round(H * dustDpr));
  };
  /* ---- interactions ---- */
  let dragging = false;
  let hovering = false;
  let lastX = 0;
  let lastY = 0;
  let moved = 0;

  const localPoint = (event: PointerEvent) => {
    const rect = gl.getBoundingClientRect();
    const scale = rect.width / (W || 1) || 1;
    return { x: (event.clientX - rect.left) / scale, y: (event.clientY - rect.top) / scale };
  };

  const onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const point = localPoint(event);
    dragging = true;
    lastX = point.x;
    lastY = point.y;
    moved = 0;
    vy = 0;
    pointerX = point.x;
    pointerY = point.y;
    gl.classList.add('drag');
  };

  const onPointerMove = (event: PointerEvent) => {
    const point = localPoint(event);
    pointerX = point.x;
    pointerY = point.y;
    mouseX = point.x / (W || 1) - 0.5;
    mouseY = point.y / (H || 1) - 0.5;
    if (!dragging) return;
    const dx = point.x - lastX;
    const dy = point.y - lastY;
    lastX = point.x;
    lastY = point.y;
    moved += Math.abs(dx) + Math.abs(dy);
    const k = 1.1 / (R0 || 216);
    yaw += dx * k;
    pitch = Math.max(-1, Math.min(1, pitch + dy * k));
    vy = dx * k;
    lastDrag = performance.now();
  };

  const onPointerUp = (event: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    lastDrag = performance.now();
    gl.classList.remove('drag');
    const point = localPoint(event);
    const inside = Math.hypot(point.x - cx, point.y - cy) <= R;
    if (moved < 6 && inside && to < 2) go(to + 1);
  };

  const onPointerEnter = () => {
    hovering = true;
  };
  const onPointerLeave = () => {
    hovering = false;
  };

  const onWheel = (event: WheelEvent) => {
    const target = event.target as HTMLElement | null;
    if (target && target.closest('.rlx-bar, header')) return;
    if (Math.abs(event.deltaY) < 8) return;
    if (performance.now() - lastWheel < 1400) return;
    lastWheel = performance.now();
    event.preventDefault();
    go(to + (event.deltaY > 0 ? 1 : -1));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || !hovering) return;
    go(to - 1);
  };

  const onHome = (event: MouseEvent) => {
    event.preventDefault();
    go(0);
  };
  const onExplore = (event: MouseEvent) => {
    event.preventDefault();
    go(2);
  };

  const siteHandlers = items.map((item, index) => {
    const enter = () => pick(index);
    const click = (event: Event) => {
      event.preventDefault();
      pick(index);
      go(2);
    };
    item.addEventListener('pointerenter', enter);
    item.addEventListener('click', click);
    return { item, enter, click };
  });

  const railHandlers = railBtns.map((button, index) => {
    const click = () => go(index);
    button.addEventListener('click', click);
    return { button, click };
  });

  gl.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  homeLink.addEventListener('click', onHome);
  exploreLink.addEventListener('click', onExplore);

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onMotionChange = () => {
    reduced = motionQuery.matches;
  };
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', onMotionChange);

  const observer = new ResizeObserver(() => {
    sizeDirty = true;
  });
  observer.observe(root);

  if (document.fonts && document.fonts.ready) {
    void document.fonts.ready.then(() => {
      sizeDirty = true;
    });
  }

  /* ---- frame ---- */
  let previous = performance.now();

  const frame = (now: number) => {
    if (disposed) return;
    raf = requestAnimationFrame(frame);
    if (sizeDirty) measure();

    const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
    previous = now;
    const time = now / 1000;

    if (dur > 0) {
      const k = io(seg(now, t0, t0 + dur));
      st = from + (to - from) * k;
      if (k >= 1) {
        st = to;
        from = to;
        dur = 0;
      }
    }

    const a = clamp01(st);
    const b = clamp01(st - 1);
    const age = introAt ? (now - introAt) / 1000 : 0;
    const grow = out(seg(age, 0, 1.5));
    const iw = out(seg(age, 0.75, 1.7));

    /* --- camera / planet --- */
    const bz = io(seg(b, 0, 0.62));
    const px0 = portrait ? 0.5 * W : lerp(0.5 * W, 0.36 * W, a);
    const py0 = portrait ? lerp(0.4 * H, 0.33 * H, a) : 0.5 * H;
    R = R0 * lerp(0.03, 1, grow) * (1 + a * 0.04) * Math.exp(bz * 2.5);
    cx = lerp(px0, 0.5 * W, bz);
    cy = lerp(py0, 0.5 * H, bz);

    if (!dragging && st < 0.02 && now - lastDrag > 1500) {
      yaw += dt * (0.08 + (1 - grow) * 2.4);
    }
    if (!dragging) {
      yaw += vy;
      vy *= Math.exp(-dt * 4);
    }
    if (st > 0.02) {
      const target = b > 0.02 ? siteDirs[active] : tharsisDir;
      const faceYaw = Math.atan2(-target.x, target.z);
      const faceLat = Math.asin(Math.max(-1, Math.min(1, target.y)));
      const f = 1 - Math.exp(-dt * 3.6);
      let delta = faceYaw - yaw;
      delta = ((delta + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI;
      yaw += delta * f;
      pitch += (faceLat - pitch) * f;
    } else {
      pitch += (0.16 - pitch) * (1 - Math.exp(-dt * 1.2));
    }

    planet.position.set(cx - W / 2, H / 2 - cy, 0);
    planet.scale.setScalar(Math.max(R, 0.0001));
    tilt.rotation.x = pitch;
    spin.rotation.y = yaw;

    uniforms.hiDir.value.copy(b > 0.02 ? siteDirs[active] : tharsisDir);
    uniforms.hiR.value = b > 0.02 ? lerp(0.62, 0.3, seg(b, 0, 0.1)) : 0.62;
    uniforms.hi.value = clamp01(seg(a, 0.15, 0.6) + (b > 0 ? 1 : 0));

    /* --- word 0 --- */
    const wx = portrait ? 0 : -a * 0.08 * W;
    const wy = portrait ? H * -0.1 + R * 1.08 + wordH * 0.5 : mouseY * -6;
    word0.style.transform = 'translate(-50%,-50%) translate(' + wx + 'px,' + wy + 'px)';
    const inset = (1 - iw) * 50;
    word0.style.clipPath = 'inset(-10% ' + inset + '% -10% ' + inset + '%)';
    word0.style.opacity = String(1 - seg(a, 0.1, 0.5));

    /* --- eyebrow --- */
    const wcx = W / 2 + wx;
    const wcy = H / 2 + wy;
    if (portrait) {
      eyebrow.style.left = wcx - eyebrowW / 2 + 'px';
      eyebrow.style.top = wcy + wordH / 2 + 18 + 'px';
    } else {
      eyebrow.style.left = wcx - wordW / 2 + 0.02 * wordW + 'px';
      eyebrow.style.top = wcy - wordH / 2 - 34 + 'px';
    }
    eyebrow.style.opacity = String(iw * (1 - seg(a, 0.05, 0.35)));

    /* --- flare / hint --- */
    flare.style.left = cx + R * 0.74 + 'px';
    flare.style.top = cy - R * 0.62 + 'px';
    flare.style.opacity = String(grow * (0.88 + 0.12 * Math.sin(time * 1.3)) * (1 - seg(bz, 0, 0.35)));
    hint.style.opacity = String(iw * 0.8 * (1 - seg(a, 0, 0.25)));

    /* --- Tharsis pin --- */
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);
    const pinX = tharsisDir.x * cosYaw + tharsisDir.z * sinYaw;
    const pinZ = -tharsisDir.x * sinYaw + tharsisDir.z * cosYaw;
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const pinY = tharsisDir.y * cosPitch - pinZ * sinPitch;
    const pinDepth = tharsisDir.y * sinPitch + pinZ * cosPitch;
    pin.style.transform =
      'translate(' + (cx + pinX * R - 6) + 'px,' + (cy - pinY * R - 8) + 'px)';
    pin.style.opacity = String(seg(pinDepth, 0.22, 0.42) * seg(age, 1.6, 2.1) * (1 - seg(a, 0, 0.3)));

    /* --- word 1 / sites / card --- */
    const ka = seg(a, 0.45, 1);
    word1.style.top = (portrait ? 0.46 : 0.56) * H + 'px';
    word1.style.transform =
      'translate(-50%,0) translate(' + (portrait ? 0 : 0.02 * W + (1 - out(ka)) * 40) + 'px,0)';
    word1.style.opacity = String(ka * (1 - seg(b, 0.02, 0.16)));

    const sitesOpacity = seg(a, 0.55, 1) * (1 - seg(b, 0, 0.14));
    const sitesHidden = sitesOpacity < 0.01;
    sites.style.opacity = String(sitesOpacity);
    sites.style.visibility = sitesHidden ? 'hidden' : 'visible';
    sites.style.pointerEvents = sitesOpacity > 0.6 ? 'auto' : 'none';
    card.style.opacity = String(sitesOpacity);
    card.style.visibility = sitesHidden ? 'hidden' : 'visible';
    card.style.pointerEvents = sitesOpacity > 0.6 ? 'auto' : 'none';
    card.style.transform = 'translateX(' + (1 - out(seg(a, 0.6, 1))) * 26 + 'px)';

    region.style.opacity = String(seg(b, 0.14, 0.26) * (1 - seg(b, 0.42, 0.52)));

    /* --- landing --- */
    const showLand = b > 0.5;
    land.style.visibility = showLand ? 'visible' : 'hidden';
    fore.style.visibility = showLand ? 'visible' : 'hidden';
    dest.style.visibility = showLand ? 'visible' : 'hidden';

    const lk = out(seg(b, 0.5, 1));
    const fk = out(seg(b, 0.58, 1));
    const dk = out(seg(b, 0.66, 0.98));
    const drift = 1 + 0.02 * Math.sin(time * 0.18);
    land.style.transform =
      'translate(' + mouseX * -14 + 'px,' + lerp(0.2 * H, mouseY * -8, lk) + 'px) scale(' +
      lerp(1.3, 1.05, lk) * drift + ')';
    fore.style.transform =
      'translate(' + mouseX * -46 + 'px,' + lerp(0.42 * H, 0, fk) + 'px) scale(1.06)';
    dest.style.transform =
      'translate(' + mouseX * -26 + 'px,' + lerp(0.62 * H, (portrait ? 0.3 : 0.27) * H, dk) + 'px)';
    destSmall.style.opacity = String(seg(b, 0.8, 1) * 0.92);

    const fogIn = seg(b, 0.36, 0.54);
    const fogOut = seg(b, 0.62, 0.96);
    fog.style.opacity = String(fogIn * (1 - fogOut));
    scrim.style.opacity = String(seg(b, 0.6, 0.9));

    const bk = seg(b, 0.86, 1);
    bar.style.opacity = String(bk);
    bar.style.pointerEvents = bk > 0.25 ? 'auto' : 'none';
    bar.style.transform = 'translate(-50%,' + (1 - out(bk)) * 34 + 'px)';

    gl.style.pointerEvents = st < 1.02 ? 'auto' : 'none';
    const activeStep = Math.round(st);
    railBtns.forEach((button, index) => {
      button.classList.toggle('on', index === activeStep);
    });

    /* --- dust --- */
    if (dustCtx) {
      dustCtx.setTransform(dustDpr, 0, 0, dustDpr, 0, 0);
      dustCtx.clearRect(0, 0, W, H);
      const landingFade = b > 0.5 ? 0.7 : 1;
      for (const mote of motes) {
        const x = (((mote.x + time * mote.s + 2) % 1.1) - 0.05) * W;
        const y = (mote.y + Math.sin(time * 0.3 + mote.p) * 0.02) * H;
        const alpha = (0.3 + 0.35 * Math.pow(Math.sin(time * 0.7 + mote.p), 2)) * landingFade;
        dustCtx.globalAlpha = alpha;
        dustCtx.drawImage(sprite, x - mote.r, y - mote.r, mote.r * 2, mote.r * 2);
      }
      dustCtx.globalAlpha = 1;
    }

    renderer.render(scene, camera);
  };

  measure();
  pick(0);
  raf = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(introFallback);
    observer.disconnect();
    if (motionQuery.removeEventListener) motionQuery.removeEventListener('change', onMotionChange);
    gl.removeEventListener('pointerdown', onPointerDown);
    root.removeEventListener('pointermove', onPointerMove);
    root.removeEventListener('pointerenter', onPointerEnter);
    root.removeEventListener('pointerleave', onPointerLeave);
    root.removeEventListener('wheel', onWheel);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    window.removeEventListener('keydown', onKeyDown);
    homeLink.removeEventListener('click', onHome);
    exploreLink.removeEventListener('click', onExplore);
    siteHandlers.forEach(({ item, enter, click }) => {
      item.removeEventListener('pointerenter', enter);
      item.removeEventListener('click', click);
    });
    railHandlers.forEach(({ button, click }) => button.removeEventListener('click', click));

    surface.geometry.dispose();
    (surface.material as THREE.Material).dispose();
    atmosphere.geometry.dispose();
    (atmosphere.material as THREE.Material).dispose();
    const texture = uniforms.map.value;
    if (texture && texture !== placeholder) texture.dispose();
    placeholder.dispose();
    renderer.dispose();
  };
}

/* ------------------------------------------------------------------ *
 * Component
 * ------------------------------------------------------------------ */

const RedlineMarsHero = () => {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    return createEngine(root);
  }, []);

  return (
    <div className="rlx-hero" ref={rootRef}>
      <style>{CSS}</style>

      <div className="rlx-word0">MARS</div>
      <div className="rlx-eyebrow">Book your seat to</div>
      <div className="rlx-flare" />
      <canvas className="rlx-gl" />
      <canvas className="rlx-dust" />
      <div className="rlx-pin">
        <i />
        <span>Tharsis</span>
      </div>
      <div className="rlx-word1">THARSIS</div>
      <ul className="rlx-sites">
        {SITES.map((site) => (
          <li key={site.name}>{site.name}</li>
        ))}
      </ul>
      <div className="rlx-card">
        <a href="#" className="rlx-explore">
          Explore
        </a>
      </div>
      <div className="rlx-region" style={{ opacity: 0 }}>OLYMPUS MONS</div>
      <div
        className="rlx-land"
        style={{ backgroundImage: 'url(' + LAND_SRC + ')', visibility: 'hidden' }}
      />
      <div className="rlx-dest" style={{ visibility: 'hidden' }}>
        <small style={{ opacity: 0 }}>Tharsis</small>
        <b>Olympus Mons</b>
      </div>
      <div
        className="rlx-fore"
        style={{ backgroundImage: 'url(' + FORE_SRC + ')', visibility: 'hidden' }}
      />
      <div className="rlx-fog" style={{ opacity: 0 }} />
      <div className="rlx-scrim" style={{ opacity: 0 }} />
      <form className="rlx-bar" style={{ opacity: 0 }} onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor="rlx-depart">Depart Earth</label>
          <input id="rlx-depart" defaultValue="12 Mar 2041" />
        </div>
        <div>
          <label htmlFor="rlx-return">Return</label>
          <input id="rlx-return" defaultValue="30 Sep 2042" />
        </div>
        <div>
          <label htmlFor="rlx-passengers">Passengers</label>
          <input id="rlx-passengers" defaultValue="2 adults" />
        </div>
        <button type="submit" aria-label="Search seats">
          →
        </button>
      </form>
      <header>
        <a className="rlx-logo rlx-home" href="#" style={{ marginLeft: 0, opacity: 1 }}>
          <svg viewBox="0 0 34 30" fill="none" stroke="#fff" strokeLinecap="round">
            <path strokeWidth="3.2" d="M3 27C5 13 15 4 31 3" />
            <path strokeWidth="2" d="M11 27c1.500-8 8-14 18-15" />
            <circle cx="30" cy="20" r="3.500" fill="#fff" stroke="none" />
          </svg>
          Redline
        </a>
        <a href="#">Login</a>
        <a href="#">Sign up</a>
        <span className="rlx-srch">
          <svg viewBox="0 0 24 24">
            <circle cx="10.500" cy="10.500" r="6.500" />
            <path d="m15.500 15.500 5 5" />
          </svg>
        </span>
        <button className="rlx-ico" aria-label="Menu" type="button">
          <svg viewBox="0 0 24 24">
            <path d="M5 8h14M7 12h10M5 16h14" />
          </svg>
        </button>
      </header>
      <div className="rlx-rail">
        <button aria-label="Mars" type="button" />
        <button aria-label="Tharsis" type="button" />
        <button aria-label="Destination" type="button" />
      </div>
      <div className="rlx-hint">Drag to spin · click the planet to land</div>
    </div>
  );
};

export default RedlineMarsHero;