/**
 * Neural Kinetics Hero — UI HUB
 *
 * Full-screen blush fintech hero for the "NeuralKinetics" brand: a procedural
 * pink-and-white feather sphere rendered by a raw Three.js fragment shader
 * orbits behind a pill navbar, a thin-weight worldwide headline, glass tag
 * pills, and two working dialogs (menu + info modals).
 *
 * Fully self-contained: the standalone project's `App.tsx`, `components/
 * FeatherSphere.tsx` and `index.css` are collapsed into this one file so the
 * single-file Code tab can ship the exact production source. Two adaptations
 * for embedding in the preview stage:
 *   - The global resets (`*`, `html/body`, `#root`) are dropped; Tailwind
 *     preflight already provides them site-wide.
 *   - Every remaining selector is scoped under the `.nkx-hero` root (inline
 *     <style> below), so the hero's class names can never leak into the host
 *     page, and the root is a fixed 720px stage instead of 100vh.
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, ArrowUpRight, ShieldCheck, Zap, Globe } from 'lucide-react';
import * as THREE from 'three';

const EASING: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ------------------------------------------------------------------ *
 * FeatherSphere — procedural WebGL feather-streak sphere
 * ------------------------------------------------------------------ */

const CFG = {
  loopSec: 0.96, // reference loop: 24 frames x 40 ms
  steps: 24, // stepped like the GIF (25 fps); set 0 for smooth
  pole: [0.4866, 0.7428, 0.4598], // pole where the feather streaks converge
  K: 1.3,
  M: -3,
  J: 0.55,
  G: 0.85,
  Nt: 20, // tier density, spiral, tooth height, ramp, teeth/rev
  center: [0.008, 0.011],
  fill: 0.68,
  stars: 24,
};

const FRAG = `precision highp float;
varying vec3 vObj; varying vec3 vN;
uniform float uT, uK, uM, uJ, uG, uNt, uPh0, uOn;
uniform vec3 uLight;
uniform vec2 uMouse;

float hsh(vec3 p){
  p = fract(p * 0.3183099 + vec3(.1, .2, .3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vn(vec3 x, float per){
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  #define H(a,b,c) hsh(vec3(mod(i.x+a,per),i.y+b,i.z+c))
  return mix(mix(mix(H(0.,0.,0.),H(1.,0.,0.),f.x),mix(H(0.,1.,0.),H(1.,1.,0.),f.x),f.y),
             mix(mix(H(0.,0.,1.),H(1.,0.,1.),f.x),mix(H(0.,1.,1.),H(1.,1.,1.),f.x),f.y),f.z);
}

// PINK AND WHITE RADIANT COLOR RAMP
vec3 ramp(float l){
  // c0: deep romantic rose pink in shadows
  vec3 c0 = vec3(0.74, 0.16, 0.40);
  // c1: vibrant blossom rose pink
  vec3 c1 = vec3(0.95, 0.28, 0.54);
  // c2: glowing soft pink
  vec3 c2 = vec3(0.98, 0.54, 0.73);
  // c3: delicate pastel baby pink
  vec3 c3 = vec3(1.00, 0.82, 0.91);
  // c4: pure luminous porcelain white
  vec3 c4 = vec3(1.00, 0.99, 1.00);
  if(l < 0.25) return mix(c0, c1, l / 0.25);
  if(l < 0.50) return mix(c1, c2, (l - 0.25) / 0.25);
  if(l < 0.78) return mix(c2, c3, (l - 0.50) / 0.28);
  return mix(c3, c4, (l - 0.78) / 0.22);
}

// sawtooth tooth profile with per-tooth random height and peak position, looped in time
float teeth(float ph, float nt, float a){
  float s = ph * nt;
  float id = floor(s);
  float fr = fract(s);
  float r1 = vn(vec3(id * 0.71, cos(a) * 2.8 + 3.0, sin(a) * 2.8), nt);
  float r2 = vn(vec3(id * 0.53 + 9.0, cos(a) * 2.2, sin(a) * 2.2 + 5.0), nt);
  float pk = 0.15 + 0.7 * r2;
  float t = fr < pk ? fr / pk : (1.0 - fr) / (1.0 - pk);
  return t * (0.35 + 0.9 * r1);
}

vec3 shade(vec3 p, vec3 n){
  float th = acos(clamp(p.y, -1.0, 1.0));
  float ph = atan(p.z, p.x) / 6.2831853 + 0.5 + uPh0;
  float a = 6.2831853 * uT;
  vec2 cs = vec2(cos(a), sin(a));
  float s = ph * 96.0;
  float jag = uJ * (0.8 * teeth(ph, uNt, a) + 0.25 * teeth(ph + 0.37, uNt * 2.3, a + 1.7) + 0.08 * vn(vec3(s, cs * 2.0), 96.0));
  float f = (th + 0.12 * th * th) * uK + ph * uM - uT + jag;
  float c = fract(f);
  float st = vn(vec3(s * 0.9 + 31.0, cs * 0.8 + 5.0), 96.0 * 0.9);
  float st2 = vn(vec3(s * 2.1 + 11.0, cs * 1.1), 96.0 * 2.1);
  float streak = 0.5 * st + 0.5 * st2;
  float tierL = 0.10 + 0.90 * pow(c, uG);
  float L = tierL * (0.66 + 0.42 * streak) * 0.95;
  float pole = 1.0 - smoothstep(0.35, 1.05, th);
  L = mix(L, 0.80, pole * 0.6);
  float nd = max(dot(n, normalize(uLight)), 0.0);
  L *= 0.36 + 0.78 * pow(nd, 1.1);
  L += 0.42 * pow(nd, 4.0);
  float rim = pow(1.0 - max(n.z, 0.0), 2.2);
  L *= 1.0 - 0.82 * rim;
  vec3 col = ramp(clamp(L, 0.0, 1.0));
  // Luminous white highlight at the convergence pole
  col = mix(col, vec3(1.00, 0.96, 0.99) * (0.88 + 0.30 * L), pole * 0.85);
  return col;
}

void main(){
  vec3 n = normalize(vN);
  vec3 col = shade(normalize(vObj), n);
  gl_FragColor = vec4(col, 1.0);
}
`;

function FeatherSphere() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = containerRef.current;
    if (!stage) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent so page background blends seamlessly
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uT: { value: 0 },
        uK: { value: CFG.K },
        uM: { value: CFG.M },
        uJ: { value: CFG.J },
        uG: { value: CFG.G },
        uNt: { value: CFG.Nt },
        uPh0: { value: 0 },
        uOn: { value: 0 },
        uLight: { value: new THREE.Vector3(-0.45, 0.2, 1) },
        uMouse: { value: new THREE.Vector2() },
      },
      vertexShader: `varying vec3 vObj; varying vec3 vN;
        void main(){ vObj = position; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: FRAG,
    });

    const poleVec = new THREE.Vector3(CFG.pole[0], CFG.pole[1], CFG.pole[2]).normalize();
    const e1 = new THREE.Vector3().crossVectors(poleVec, new THREE.Vector3(0, 0, 1)).normalize();
    const e2 = new THREE.Vector3().crossVectors(poleVec, e1);

    const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 120), mat);
    sphere.matrixAutoUpdate = false;
    sphere.matrix.makeBasis(e1, poleVec, e2);

    const globe = new THREE.Group();
    globe.add(sphere);

    const holder = new THREE.Group();
    holder.add(globe);
    holder.position.set(CFG.center[0], CFG.center[1], 0);
    scene.add(holder);

    // Subtle pink & rose stardust particles floating gently
    let seed = 11;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const spos = new Float32Array(CFG.stars * 3);
    for (let i = 0; i < CFG.stars; i++) {
      const a = rnd() * 6.283;
      const r = 1.25 + rnd() * 1.35;
      spos[i * 3] = Math.cos(a) * r;
      spos[i * 3 + 1] = Math.sin(a) * r;
      spos[i * 3 + 2] = -2;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(spos, 3));
    const stars = new THREE.Points(
      sg,
      new THREE.PointsMaterial({
        color: 0xEB4888,
        size: 2.2,
        sizeAttenuation: false,
        transparent: true,
        opacity: 0.4,
      })
    );
    scene.add(stars);

    function resize() {
      if (!stage) return;
      const w = stage.clientWidth || 1280;
      const h = stage.clientHeight || 720;
      renderer.setSize(w, h);
      const isMobile = w < 768;
      const fillFactor = isMobile ? 0.78 : CFG.fill;
      const unit = (Math.min(w, h) * fillFactor) / 2;
      cam.left = -w / 2 / unit;
      cam.right = w / 2 / unit;
      cam.top = h / 2 / unit;
      cam.bottom = -h / 2 / unit;
      cam.updateProjectionMatrix();
    }

    window.addEventListener('resize', resize);
    resize();

    // Interaction handlers
    const el = renderer.domElement;
    let dragging = false;
    let lx = 0;
    let ly = 0;
    let vx = 0;
    let vy = 0;
    let lastDrag = 0;
    let zoom = 0.7; // Initial zoom for smooth opening
    let zoomT = 1.0;
    let rate = 1;
    let rateT = 1;

    const mouse = new THREE.Vector2();
    const ms = new THREE.Vector2();
    let active = 0;
    let activeT = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lx = e.clientX;
      ly = e.clientY;
      el.setPointerCapture(e.pointerId);
      rateT = 0.35;
    };

    const onPointerUp = () => {
      dragging = false;
      rateT = 1;
      lastDrag = performance.now();
    };

    const onPointerLeave = () => {
      activeT = 0;
      mouse.set(0, 0);
    };

    const onPointerMove = (e: PointerEvent) => {
      activeT = 1;
      // Normalise against the stage rect, not window, so the pointer mapping
      // stays correct inside the preview stage's scaled (transform) canvas.
      const rect = stage.getBoundingClientRect();
      const w = rect.width || 1;
      const h = rect.height || 1;
      mouse.set(((e.clientX - rect.left) / w) * 2 - 1, -((e.clientY - rect.top) / h) * 2 + 1);
      if (dragging) {
        vy += (e.clientX - lx) * 0.004;
        vx += (e.clientY - ly) * 0.004;
        lx = e.clientX;
        ly = e.clientY;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomT = THREE.MathUtils.clamp(zoomT * (1 - e.deltaY * 0.0012), 0.55, 1.85);
    };

    const onDblClick = () => {
      rateT = rateT === 1 ? 2.5 : 1;
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointerleave', onPointerLeave);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('dblclick', onDblClick);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const clock = new THREE.Clock();
    let t = 0;
    const ry = { v: 0 };
    const rx = { v: 0 };
    let animationFrameId = 0;

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.05);
      rate += (rateT - rate) * Math.min(dt * 6, 1);
      zoom += (zoomT - zoom) * Math.min(dt * 6, 1);
      active += (activeT - active) * Math.min(dt * 5, 1);
      ms.lerp(mouse, Math.min(dt * 6, 1));

      if (!reduce) t += dt * rate;
      let u = (t / CFG.loopSec) % 1;
      if (CFG.steps) u = Math.floor(u * CFG.steps) / CFG.steps;
      mat.uniforms.uT.value = u;

      ry.v += vy;
      rx.v += vx;
      vx *= 0.9;
      vy *= 0.9;

      if (!dragging) {
        const k = Math.min(dt * (performance.now() - lastDrag > 600 ? 2.2 : 0.4), 1);
        ry.v -= ry.v * k;
        rx.v -= rx.v * k;
      }

      globe.rotation.y = ry.v + ms.x * 0.2 * active;
      globe.rotation.x = rx.v - ms.y * 0.2 * active;
      mat.uniforms.uMouse.value.set(ms.x * 0.9, ms.y * 0.9);
      mat.uniforms.uOn.value = active;
      globe.scale.setScalar(zoom);

      stars.material.opacity = 0.25 + 0.4 * Math.abs(Math.sin(performance.now() * 0.003));
      renderer.render(scene, cam);
      animationFrameId = requestAnimationFrame(tick);
    }

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointerleave', onPointerLeave);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('dblclick', onDblClick);
      if (stage.contains(renderer.domElement)) {
        stage.removeChild(renderer.domElement);
      }
      renderer.dispose();
      mat.dispose();
      sphere.geometry.dispose();
      sg.dispose();
      stars.material.dispose();
    };
  }, []);

  return <div className="feather-stage" ref={containerRef} />;
}

/* ------------------------------------------------------------------ *
 * Scoped styles
 *
 * The standalone project's global resets are dropped (Tailwind preflight
 * covers them site-wide); every remaining selector is scoped under the
 * .nkx-hero root so nothing leaks into the host page. The root is a fixed
 * 720px stage instead of 100vh, and the fixed navbar / backdrops became
 * absolute so they resolve against the root rather than the viewport.
 * ------------------------------------------------------------------ */

const CSS = `
.nkx-hero {
  position: relative;
  width: 100%;
  height: 720px;
  overflow: hidden;
  isolation: isolate;
  background: radial-gradient(circle at 50% 50%, #FEE8F1 0%, #FDF2F7 50%, #F8E3EE 100%);
  color: #180C14;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Feather Sphere 3D Stage */
.nkx-hero .feather-stage {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.nkx-hero .feather-stage canvas {
  display: block;
  touch-action: none;
  cursor: grab;
}

.nkx-hero .feather-stage canvas:active {
  cursor: grabbing;
}

/* Navbar at Top */
.nkx-hero .navbar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  box-sizing: border-box;
}

.nkx-hero .nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: auto;
}

.nkx-hero .brand-container {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #000000;
  cursor: pointer;
  user-select: none;
}

.nkx-hero .brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.nkx-hero .brand-name {
  display: none;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #000000;
}

/* Menu Button */
.nkx-hero .menu-button {
  background: #000000;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  padding: 3px 12px 3px 3px;
  border: none;
  outline: none;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.nkx-hero .menu-button:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.nkx-hero .menu-button:active {
  transform: scale(0.98);
}

.nkx-hero .menu-icon-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  flex-shrink: 0;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.nkx-hero .menu-button:hover .menu-icon-circle {
  transform: rotate(90deg);
}

.nkx-hero .menu-text {
  font-size: 11px;
  font-weight: 500;
  color: #ffffff;
  letter-spacing: 0.02em;
  margin-left: 8px;
}

/* Nav Tags Pill */
.nkx-hero .nav-tags-pill {
  display: none;
  align-items: center;
  gap: 12px;
  background-color: #F8E3EE;
  border-radius: 9999px;
  padding: 0 16px;
  height: 34px;
  user-select: none;
}

.nkx-hero .nav-tag-item {
  font-size: 11px;
  font-weight: 500;
  color: #3b182b;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.nkx-hero .nav-tag-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background-color: rgba(220, 70, 130, 0.4);
}

/* Nav Right */
.nkx-hero .nav-right {
  display: flex;
  align-items: center;
  pointer-events: auto;
}

.nkx-hero .nav-adaptive-pill {
  display: flex;
  align-items: center;
  background-color: #F8E3EE;
  border-radius: 9999px;
  padding: 3px;
  cursor: pointer;
  border: none;
  outline: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
  user-select: none;
}

.nkx-hero .nav-adaptive-pill:hover {
  background-color: #F4D3E3;
  transform: scale(1.02);
}

.nkx-hero .nav-grid-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #170912;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nkx-hero .nav-adaptive-label {
  display: none;
  font-size: 11px;
  font-weight: 500;
  color: #170912;
  letter-spacing: -0.01em;
  margin-left: 8px;
  margin-right: 12px;
  white-space: nowrap;
}

/* Footer Section */
.nkx-hero .footer-section {
  position: relative;
  z-index: 30;
  margin-top: auto;
  width: 100%;
  background: linear-gradient(to top, #FDF1F6 0%, rgba(253, 241, 246, 0.90) 55%, transparent 100%);
  padding: 24px 20px 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  pointer-events: none;
}

/* Footer Left */
.nkx-hero .footer-left {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 780px;
  pointer-events: auto;
}

.nkx-hero .subtitle-line {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.nkx-hero .subtitle-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #E8367F;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(232, 54, 127, 0.5);
}

.nkx-hero .subtitle-text {
  font-size: 13px;
  font-weight: 400;
  color: rgba(35, 15, 28, 0.65);
  letter-spacing: -0.01em;
}

.nkx-hero .hero-heading {
  font-weight: 300;
  font-size: clamp(2rem, 8vw, 4.5rem);
  letter-spacing: -0.03em;
  line-height: 1;
  color: #170912;
  margin: 0;
}

.nkx-hero .hero-heading span {
  display: block;
}

.nkx-hero .button-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 4px;
}

.nkx-hero .btn-primary {
  background-color: #170912;
  color: #ffffff;
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  padding: 12px 24px;
  border: 1px solid #170912;
  cursor: pointer;
  letter-spacing: -0.01em;
  outline: none;
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.2s ease, box-shadow 0.2s ease;
  user-select: none;
}

.nkx-hero .btn-primary:hover {
  background-color: #2e1224;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(23, 9, 18, 0.25);
}

.nkx-hero .btn-primary:active {
  transform: translateY(0);
}

.nkx-hero .btn-secondary {
  background-color: rgba(255, 255, 255, 0.65);
  color: #170912;
  border: 1px solid rgba(220, 80, 135, 0.35);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 500;
  padding: 12px 24px;
  cursor: pointer;
  letter-spacing: -0.01em;
  outline: none;
  backdrop-filter: blur(8px);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, background-color 0.2s ease;
  user-select: none;
}

.nkx-hero .btn-secondary:hover {
  border-color: rgba(210, 50, 115, 0.75);
  background-color: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
}

.nkx-hero .btn-secondary:active {
  transform: translateY(0);
}

/* Footer Right */
.nkx-hero .footer-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  pointer-events: auto;
}

.nkx-hero .tag-pill {
  background-color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(225, 90, 140, 0.22);
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  color: #3b182b;
  padding: 7px 14px;
  letter-spacing: -0.01em;
  backdrop-filter: blur(8px);
  transition: all 0.2s ease;
  user-select: none;
  cursor: default;
}

.nkx-hero .tag-pill:hover {
  border-color: rgba(210, 50, 115, 0.45);
  color: #170912;
  transform: translateY(-1px);
}

/* Menu Dropdown / Modal */
.nkx-hero .menu-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  z-index: 99;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.nkx-hero .menu-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.nkx-hero .menu-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.nkx-hero .menu-card-title {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.nkx-hero .menu-close-btn {
  background: #F4F4F6;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
}

.nkx-hero .menu-items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nkx-hero .menu-nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  color: #000000;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  background-color: #fafafa;
  transition: background-color 0.15s ease, transform 0.15s ease;
}

.nkx-hero .menu-nav-link:hover {
  background-color: #f0f0f2;
  transform: translateX(3px);
}

/* Modal for Features / How it works */
.nkx-hero .info-modal {
  background: #ffffff;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.nkx-hero .info-modal h3 {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 8px;
}

.nkx-hero .info-modal p {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 20px;
}

/* Desktop Responsive Layout (768px+) */
@media (min-width: 768px) {
  .nkx-hero .navbar {
    padding: 24px 32px;
  }

  .nkx-hero .nav-left {
    gap: 14px;
  }

  .nkx-hero .brand-name {
    display: inline-block;
  }

  .nkx-hero .menu-button {
    padding: 4px 14px 4px 4px;
  }

  .nkx-hero .menu-icon-circle {
    width: 32px;
    height: 32px;
  }

  .nkx-hero .nav-tags-pill {
    display: flex;
    height: 40px;
  }

  .nkx-hero .nav-adaptive-pill {
    padding: 4px 14px 4px 4px;
  }

  .nkx-hero .nav-grid-circle {
    width: 32px;
    height: 32px;
  }

  .nkx-hero .nav-adaptive-label {
    display: inline-block;
  }

  /* Footer Layout */
  .nkx-hero .footer-section {
    padding: 32px 32px 36px 32px;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-end;
  }

  .nkx-hero .hero-heading {
    font-size: clamp(2.5rem, 5.5vw, 4.5rem);
  }

  .nkx-hero .footer-right {
    padding-bottom: 6px;
  }
}
`;

/* ------------------------------------------------------------------ *
 * Hero
 * ------------------------------------------------------------------ */

export default function NeuralKineticsHero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'features' | 'how-it-works' | null>(null);

  return (
    <main className="nkx-hero">
      <style>{CSS}</style>

      {/* 3D Pink & White Feather Sphere in Center */}
      <FeatherSphere />

      {/* Navbar (Top) */}
      <motion.nav
        className="navbar"
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASING }}
      >
        {/* Left Side */}
        <div className="nav-left">
          {/* Logo with custom rotated rectangles icon & brand name */}
          <div className="brand-container" tabIndex={0} role="button" aria-label="NeuralKinetics Home">
            <span className="brand-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="rotate(-35 12 12)">
                  <rect x="7.5" y="3" width="3.2" height="18" rx="1.6" fill="#000000" />
                  <rect x="13.3" y="3" width="3.2" height="18" rx="1.6" fill="#000000" />
                </g>
              </svg>
            </span>
            <span className="brand-name">NeuralKinetics</span>
          </div>

          {/* Menu Button */}
          <button
            className="menu-button"
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <span className="menu-icon-circle">
              <Plus size={12} strokeWidth={3} />
            </span>
            <span className="menu-text">Menu</span>
          </button>

          {/* Tags Pill (Desktop) */}
          <div className="nav-tags-pill">
            <span className="nav-tag-item">Advanced Bionics</span>
            <span className="nav-tag-dot" />
            <span className="nav-tag-item">Cognitive AI</span>
          </div>
        </div>

        {/* Right Side */}
        <div className="nav-right">
          <button
            className="nav-adaptive-pill"
            type="button"
            onClick={() => setActiveModal('features')}
            aria-label="Adaptive Systems"
          >
            <span className="nav-grid-circle">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3.5" cy="3.5" r="1.3" fill="#ffffff" />
                <circle cx="8.5" cy="3.5" r="1.3" fill="#ffffff" />
                <circle cx="3.5" cy="8.5" r="1.3" fill="#ffffff" />
                <circle cx="8.5" cy="8.5" r="1.3" fill="#ffffff" />
              </svg>
            </span>
            <span className="nav-adaptive-label">Adaptive Systems</span>
          </button>
        </div>
      </motion.nav>

      {/* Empty space filler for layout */}
      <div style={{ flex: 1, pointerEvents: 'none' }} />

      {/* Footer Section (Bottom) */}
      <motion.footer
        className="footer-section"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 1, ease: EASING }}
      >
        {/* Left Block */}
        <div className="footer-left">
          {/* Subtitle Line */}
          <motion.div
            className="subtitle-line"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASING }}
          >
            <span className="subtitle-dot" />
            <span className="subtitle-text">Best digital banking card 2026</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="hero-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8, ease: EASING }}
          >
            <span>One Card, Zero</span>
            <span>Limits. Worldwide.</span>
          </motion.h1>

          {/* Buttons */}
          <motion.div
            className="button-group"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.0, duration: 0.8, ease: EASING }}
          >
            <button
              className="btn-primary"
              type="button"
              onClick={() => setActiveModal('features')}
            >
              See Features
            </button>
            <button
              className="btn-secondary"
              type="button"
              onClick={() => setActiveModal('how-it-works')}
            >
              How It Works
            </button>
          </motion.div>
        </div>

        {/* Right Block */}
        <motion.div
          className="footer-right"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease: EASING }}
        >
          <span className="tag-pill">Neuromorphic</span>
          <span className="tag-pill">AGI</span>
          <span className="tag-pill">Cybernetics</span>
        </motion.div>
      </motion.footer>

      {/* Menu Overlay Modal */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              className="menu-card"
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: EASING }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-card-header">
                <span className="menu-card-title">Navigation</span>
                <button
                  className="menu-close-btn"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="menu-items-list">
                {[
                  { name: 'Core Architecture', tag: 'v4.2', action: () => { setMenuOpen(false); setActiveModal('features'); } },
                  { name: 'Neural Protocols', tag: 'Active', action: () => { setMenuOpen(false); setActiveModal('how-it-works'); } },
                  { name: 'Global Liquidity Engine', tag: 'Zero-latency', action: () => { setMenuOpen(false); setActiveModal('features'); } },
                  { name: 'Bionic Biometrics', tag: 'L4 Secure', action: () => { setMenuOpen(false); setActiveModal('features'); } },
                  { name: 'Institutional Access', tag: 'Direct', action: () => { setMenuOpen(false); setActiveModal('how-it-works'); } },
                ].map((item, index) => (
                  <button
                    key={index}
                    className="menu-nav-link"
                    type="button"
                    onClick={item.action}
                  >
                    <span>{item.name}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#666' }}>
                      {item.tag}
                      <ArrowUpRight size={13} />
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Modal (Features / How It Works) */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              className="info-modal"
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ duration: 0.35, ease: EASING }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-card-header">
                <span className="menu-card-title">
                  {activeModal === 'features' ? 'Architectural Capabilities' : 'Kinetic Workflow'}
                </span>
                <button
                  className="menu-close-btn"
                  onClick={() => setActiveModal(null)}
                  aria-label="Close dialog"
                >
                  <X size={18} />
                </button>
              </div>

              {activeModal === 'features' ? (
                <div>
                  <p>
                    Engineered for zero-boundary transactions powered by real-time neural edge verification and continuous cryptographic settlement.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px', marginTop: '16px' }}>
                    <div style={{ padding: '14px', borderRadius: '12px', background: '#F8F8FA', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: '#000', color: '#fff', padding: '6px', borderRadius: '8px' }}>
                        <Zap size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Sub-Millisecond Execution</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Autonomous liquidity routing without border delays.</div>
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '12px', background: '#F8F8FA', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: '#000', color: '#fff', padding: '6px', borderRadius: '8px' }}>
                        <ShieldCheck size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Neuromorphic Identity</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Physical and cognitive telemetry verified on-chip.</div>
                      </div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '12px', background: '#F8F8FA', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ background: '#000', color: '#fff', padding: '6px', borderRadius: '8px' }}>
                        <Globe size={16} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Global Universal Parity</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Supported in 190+ jurisdictions with automatic currency equilibrium.</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <p>
                    From cold-state onboarding to autonomous transaction verification across global financial networks in three steps.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>1</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Zero-Knowledge Provisioning</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Card hardware and digital clone synchronize seamlessly in 1.4 seconds.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>2</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Adaptive Dynamic Routing</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Settlements traverse optimized cross-network channels with zero markup.</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, flexShrink: 0 }}>3</div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>Cognitive Risk Neutralization</div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>Autonomous AI safeguards verify intent before state execution.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{ width: '100%', textAlign: 'center' }}
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
