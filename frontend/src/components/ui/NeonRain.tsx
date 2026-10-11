// neon-rain — UI HUB
// A neon downpour on a pure black stage: 175 additive-blended light-trail streaks
// fall with pointer repulsion, ~900 twinkling sparkles drift down with them, and a
// weighted floor glow hums in neon-cyan columns (per-column height, slow flicker,
// beam-trail pulses). The pointer swirls and pushes the rain and lights a soft glow
// band on the floor; a click fires an expanding shockwave ring across the floor.
//
// Original source: standalone HTML (Three.js r128 UMD + Tailwind 4 CDN). Ported to
// React with `three` (already installed). The CONFIG, seeded RNG, geometry/buffer
// generation and all five GLSL shaders are kept byte-for-byte from the reference;
// the DOM boot + window pointer listeners became a React lifecycle bound to the
// component's own container (so the card reacts only inside its area) and the
// viewport sizing became a ResizeObserver on that container.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./NeonRain.css";

export interface NeonRainProps {
  /** Optional class applied to the root container. */
  className?: string;
  /** Optional inline styles for the root container. */
  style?: React.CSSProperties;
  /** When true (library preview), fills a compact card instead of a full viewport. */
  compact?: boolean;
  /** Hint line shown briefly on mount. */
  hint?: string;
}

/* Values measured from the reference GIF (580x580, 45 frames @ 30ms).
 * All sizes are in "reference px" and scale with viewport height / 580. */
const CONFIG = {
  REF: 580,
  bg: 0x000102,
  streaks: { count: 175, speed: [40, 125], length: [9, 46], width: [1.4, 2.6], bigChance: 0.07 },
  dots: { count: 900, speed: [10, 42], size: [1.3, 2.6] },
  floor: { color: [0.0, 0.66, 0.78] },
  mouse: { radius: 150, push: 30, glowRadius: 130 },
  maxDpr: 2,
};

function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const COMMON = `
  uniform vec2 uRes; uniform float uTime; uniform float uSc; uniform float uDpr;
  uniform vec2 uMouse; uniform vec2 uVel; uniform float uActive;
  vec4 toClip(vec2 p){ return vec4(p.x/uRes.x*2.-1., 1.-p.y/uRes.y*2., 0., 1.); }
`;

/* ---- streaks ---- */
const streakVS = `
  ${COMMON}
  attribute vec4 aA; // x01, phase, speed, len
  attribute vec4 aB; // bright, width, depth, seed
  varying float vV; varying float vX; varying float vBright;
  void main(){
    float len = aA.w * uSc, travel = uRes.y + len;
    float head = mod(aA.y * travel + aA.z * uSc * uTime, travel);
    float v = position.y + 0.5;
    vec2 p = vec2(aA.x * uRes.x + position.x * max(aB.y * uSc, 1.5), head - len * (1. - v));
    vec2 d = p - uMouse; float r = ${CONFIG.mouse.radius.toFixed(1)} * uSc;
    float f = exp(-dot(d, d) / (r * r)) * uActive;
    p.x += sign(d.x + 0.001) * f * ${CONFIG.mouse.push.toFixed(1)} * uSc * (1. - v * .7);
    p.x += uVel.x * f * 0.5 * (1. - v);
    vV = v; vX = position.x * 2.; vBright = aB.x * (1. + f * 1.4);
    gl_Position = toClip(p);
  }`;
const streakFS = `
  precision highp float;
  varying float vV; varying float vX; varying float vBright;
  void main(){
    float tail = pow(vV, 2.3);
    float head = smoothstep(.9, 1., vV);
    float edge = 1. - vX * vX;
    vec3 c = mix(vec3(0., .5, .72), vec3(0., .92, 1.), vV);
    c += head * vec3(.5, .3, .2) * min(vBright, 1.4);
    gl_FragColor = vec4(c * tail * edge * vBright, 1.);
  }`;

/* ---- sparkles ---- */
const dotVS = `
  ${COMMON}
  attribute vec4 aA; // x01, y01, speed, size
  attribute vec4 aC; // r g b twinkleSeed
  varying vec3 vC; varying float vL;
  void main(){
    float y = mod(aA.y * uRes.y + aA.z * uSc * uTime, uRes.y);
    vec2 p = vec2(aA.x * uRes.x, y);
    vec2 d = p - uMouse; float r = ${CONFIG.mouse.radius.toFixed(1)} * uSc * .9;
    float f = exp(-dot(d, d) / (r * r)) * uActive;
    p += normalize(d + 0.001) * f * 22. * uSc + uVel * f * .4;
    float tw = .72 + .28 * sin(uTime * 7. + aC.w * 40.);
    vC = aC.rgb; vL = tw * (1. + f * 2.2);
    gl_PointSize = max(1., floor(aA.w * uSc * uDpr + .5));
    gl_Position = toClip(p);
  }`;
const dotFS = `
  precision highp float;
  varying vec3 vC; varying float vL;
  void main(){ gl_FragColor = vec4(vC * vL * .78, 1.); }`;

/* ---- floor glow ---- */
const floorVS = `void main(){ gl_Position = vec4(position.xy, 0., 1.); }`;
const floorFS = `
  precision highp float;
  ${COMMON}
  uniform vec3 uColor; uniform float uPulseT; uniform float uPulseX;
  float h1(float n){ return fract(sin(n * 127.1 + 311.7) * 43758.5453); }
  void main(){
    vec2 q = gl_FragCoord.xy / uDpr / uSc;
    float x = q.x, b = q.y;
    float mx = uMouse.x / uSc;
    float fm = exp(-pow((x - mx) / ${CONFIG.mouse.glowRadius.toFixed(1)}, 2.)) * uActive;
    float age = uTime - uPulseT;
    float ring = age > 0. ? exp(-pow((abs(x - uPulseX / uSc) - age * 380.) / 34., 2.)) * exp(-age * 1.8) : 0.;
    float boost = 1. + 1.5 * fm + 2.2 * ring;

    float c1 = floor(x), c3 = floor(x / 3.), c9 = floor(x / 9.);
    float fl1 = .86 + .14 * sin(uTime * 4. + h1(c1) * 40.);
    float fl3 = .8 + .2 * sin(uTime * 2.2 + h1(c3 + 7.) * 40.);
    float hh1 = (14. + 150. * pow(h1(c1), 3.)) * boost;
    float hh3 = (30. + 120. * pow(h1(c3 + 3.), 2.5)) * boost;
    float hh9 = (40. + 90. * h1(c9 + 11.)) * boost;
    float s1 = pow(clamp(1. - b / hh1, 0., 1.), 2.) * .5 * fl1;
    float s3 = pow(clamp(1. - b / hh3, 0., 1.), 2.) * .26 * fl3;
    float s9 = pow(clamp(1. - b / hh9, 0., 1.), 1.6) * .12;

    float bandNoise = .78 + .22 * sin(x * .045 + uTime * .6) * sin(x * .013 - uTime * .4);
    float base = (.72 * exp(-b / 34.) + .3 * exp(-b / 95.)) * bandNoise * (1. + .8 * fm + 1.2 * ring);
    float I = (base + s1 + s3 + s9) * .74;
    vec3 col = I * uColor + max(I - 1., 0.) * vec3(.3, .5, .45);
    col += vec3(0., .02, .085) * exp(-b / 190.);
    gl_FragColor = vec4(col, 1.);
  }`;

function createRainScene(container: HTMLElement, canvas: HTMLCanvasElement) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(CONFIG.bg, 1);

  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const timeScale = reduce ? 0.2 : 1;

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const uniforms = {
    uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 }, uSc: { value: 1 }, uDpr: { value: 1 },
    uMouse: { value: new THREE.Vector2(-9999, -9999) }, uVel: { value: new THREE.Vector2() },
    uActive: { value: 0 }, uColor: { value: new THREE.Vector3(...CONFIG.floor.color) },
    uPulseT: { value: -100 }, uPulseX: { value: 0 },
  };
  const mat = (vs: string, fs: string) =>
    new THREE.ShaderMaterial({
      uniforms, vertexShader: vs, fragmentShader: fs,
      blending: THREE.AdditiveBlending, transparent: true, side: THREE.DoubleSide, depthTest: false, depthWrite: false,
    });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat(floorVS, floorFS));
  floor.frustumCulled = false; floor.renderOrder = 0;
  scene.add(floor);

  let streakMesh: THREE.Mesh | undefined, dotMesh: THREE.Points | undefined;
  function build(w: number, h: number) {
    [streakMesh, dotMesh].forEach((m) => { if (m) { scene.remove(m); m.geometry.dispose(); (m.material as THREE.Material).dispose(); } });
    const area = (w * h) / (CONFIG.REF * CONFIG.REF);
    const R = rng(1337);
    const S = CONFIG.streaks, D = CONFIG.dots;

    const ns = Math.min(900, Math.round(S.count * area));
    const g = new THREE.InstancedBufferGeometry();
    const plane = new THREE.PlaneGeometry(1, 1);
    g.index = plane.index; g.setAttribute("position", plane.getAttribute("position"));
    const A = new Float32Array(ns * 4), B = new Float32Array(ns * 4);
    for (let i = 0; i < ns; i++) {
      const depth = R(), big = R() < S.bigChance;
      A.set([R(), R(), lerp(S.speed[0], S.speed[1], depth), lerp(S.length[0], S.length[1], depth) * (big ? 1.1 : 1)], i * 4);
      B.set([big ? 1.5 : lerp(0.6, 1.25, depth * R() + 0.1), big ? 4 : lerp(S.width[0], S.width[1], depth), depth, R()], i * 4);
    }
    g.setAttribute("aA", new THREE.InstancedBufferAttribute(A, 4));
    g.setAttribute("aB", new THREE.InstancedBufferAttribute(B, 4));
    g.instanceCount = ns;
    streakMesh = new THREE.Mesh(g, mat(streakVS, streakFS));
    streakMesh.frustumCulled = false; streakMesh.renderOrder = 1;

    const nd = Math.min(4000, Math.round(D.count * area));
    const dg = new THREE.BufferGeometry();
    const DA = new Float32Array(nd * 4), DC = new Float32Array(nd * 4), pos = new Float32Array(nd * 3);
    const palette = [[0, .95, 1], [0, .8, .95], [.1, .55, 1], [.7, 1, 1], [0, .6, .7]];
    for (let i = 0; i < nd; i++) {
      const c = palette[Math.floor(Math.pow(R(), 1.6) * palette.length)], k = lerp(.45, 1, R());
      DA.set([R(), R(), lerp(D.speed[0], D.speed[1], R()), R() < .12 ? D.size[1] : lerp(D.size[0], 2.2, R())], i * 4);
      DC.set([c[0] * k, c[1] * k, c[2] * k, R()], i * 4);
    }
    dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    dg.setAttribute("aA", new THREE.BufferAttribute(DA, 4));
    dg.setAttribute("aC", new THREE.BufferAttribute(DC, 4));
    dotMesh = new THREE.Points(dg, mat(dotVS, dotFS));
    dotMesh.frustumCulled = false; dotMesh.renderOrder = 2;
    scene.add(streakMesh, dotMesh);
  }

  function resize() {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
    uniforms.uRes.value.set(w, h); uniforms.uDpr.value = dpr;
    uniforms.uSc.value = Math.max(0.6, h / CONFIG.REF);
    build(w, h);
  }
  resize();
  const ro = new ResizeObserver(resize); ro.observe(container);

  let raf = 0, last = performance.now(), t = 0;
  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    t += Math.min(0.05, (now - last) / 1000) * timeScale; last = now;
    uniforms.uTime.value = t;
    renderer.render(scene, camera);
  };
  raf = requestAnimationFrame(loop);

  return {
    setPointer(x: number, y: number, vx: number, vy: number, active: number) {
      uniforms.uMouse.value.set(x, y);
      uniforms.uVel.value.set(vx, vy);
      uniforms.uActive.value = Math.min(1, active);
    },
    pulse(x: number) { uniforms.uPulseT.value = uniforms.uTime.value; uniforms.uPulseX.value = x; },
    dispose() {
      cancelAnimationFrame(raf); ro.disconnect();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose?.();
        const mtl = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mtl)) mtl.forEach((x) => x.dispose?.());
        else mtl?.dispose?.();
      });
      renderer.dispose();
    },
  };
}

export const NeonRain: React.FC<NeonRainProps> = ({
  className = "",
  style = {},
  compact = false,
  hint = "Move the cursor · click to pulse",
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;

    const rain = createRainScene(stage, canvas);

    // boot: fade the stage in, flash the hint, then retire it
    const onRaf = requestAnimationFrame(() => stage.classList.add("nr-on"));
    const hintEl = hintRef.current;
    const showT = window.setTimeout(() => { if (hintEl) hintEl.style.opacity = "1"; }, 1200);
    const hideT = window.setTimeout(() => { if (hintEl) hintEl.style.opacity = "0"; }, 6000);

    // spring-smoothed pointer (same idea as Framer Motion's useSpring)
    const P = { tx: -9999, ty: -9999, x: -9999, y: -9999, vx: 0, vy: 0, a: 0, ta: 0 };
    let seen = false;
    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const onMove = (e: PointerEvent) => {
      const { x, y } = local(e);
      if (!seen || P.ta < .05) { P.x = x; P.y = y; P.vx = P.vy = 0; seen = true; }
      P.tx = x; P.ty = y; P.ta = 1;
    };
    const onDown = (e: PointerEvent) => {
      const { x, y } = local(e);
      P.tx = x; P.ty = y; P.ta = 1; rain.pulse(x);
    };
    const onLeave = () => { P.ta = 0; };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointercancel", onLeave);

    let tickRaf = 0, last = performance.now();
    const tick = (now: number) => {
      tickRaf = requestAnimationFrame(tick);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      const k = 140, c = 2 * Math.sqrt(k * .6) * .85, m = .6;
      const ox = P.x, oy = P.y;
      P.vx += ((P.tx - P.x) * k - P.vx * c) / m * dt;
      P.vy += ((P.ty - P.y) * k - P.vy * c) / m * dt;
      P.x += P.vx * dt; P.y += P.vy * dt;
      P.a += (P.ta - P.a) * Math.min(1, dt * 4);
      rain.setPointer(P.x, P.y, P.x - ox, P.y - oy, P.a);
    };
    tickRaf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(onRaf);
      cancelAnimationFrame(tickRaf);
      clearTimeout(showT); clearTimeout(hideT);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointercancel", onLeave);
      rain.dispose();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={
        "nr-root" +
        (compact ? " nr-compact" : "") +
        (className ? " " + className : "")
      }
      style={style}
    >
      <canvas ref={canvasRef} className="nr-canvas" aria-hidden="true" />
      <p ref={hintRef} className="nr-hint">{hint}</p>
    </div>
  );
};

export default NeonRain;
