// pulse-lattice — UI HUB
// An infinite hexagonal lattice drawn as glowing ribbon edges on a black field. The grid
// breathes with a central gaussian bulge and a ring dip, and wakes on hover (amp + dip
// ramp). Dragging orbits, the wheel/pinch zooms, a click drops an expanding ripple, and
// double-click resets to the front view. Edge ribbons are built once from a deduplicated
// hex-edge lattice and expanded to quads in the vertex shader with a screen-space
// half-width; the fragment shader tints purple -> blue -> cyan by height.
//
// Original source: standalone HTML (Three.js r128 UMD). Ported to React with `three`
// (already installed). The CFG/VIEWS blocks, the lattice-edge builder, the cover profile
// and both GLSL shaders are kept byte-for-byte from the reference; the DOM boot + window
// listeners became a React lifecycle bound to the component's own container (with the HUD
// and hint repositioned absolutely inside it) and the window resize listener became a
// ResizeObserver on that container.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./PulseLattice.css";

export interface PulseLatticeProps {
  /** Optional class applied to the root container. */
  className?: string;
  /** Optional inline styles for the root container. */
  style?: React.CSSProperties;
  /** When true (library preview), fills a compact card instead of a full viewport. */
  compact?: boolean;
  /** Hint line shown briefly at the top. */
  hint?: string;
}

const CFG = {
  loop: 2.16, hexR: 1.6, extentX: 80, zNear: 60, zFar: -110,
  target: [0, 0.2, -16], fov: 62, R0: 22.1,
  center: [0, -5], sigma: 6.5, peak: 7.5, dipSigma: 2.6, dipDepth: 2.2, peakAt: 0.45,
  fadeNear: 22, fadeFar: 95, lineMin: 0.55, lineMax: 1.7,
  purple: [0.46, 0.0, 0.95], blue: [0.0, 0.18, 1.0], cyan: [0.0, 0.82, 1.0],
  follow: 0.22, damp: 0.12, rotSpeed: 0.0055, minR: 8, maxR: 60,
  pitchMin: -1.2, pitchMax: 1.53, rippleSpeed: 9
};

const VIEWS: Record<string, { yaw: number; pitch: number; R: number }> = {
  front: { yaw: 0, pitch: 0.095, R: 22.1 },
  angle: { yaw: 0.65, pitch: 0.5, R: 26 },
  top:   { yaw: 0, pitch: 1.52, R: 32 },
  under: { yaw: 0.35, pitch: -0.95, R: 24 }
};

const VIEW_BUTTONS: Array<[string, string]> = [
  ["front", "Front"], ["angle", "Angle"], ["top", "Top"], ["under", "Under"],
];

const VERT = `
      attribute vec3 aEnd; attribute vec2 aCorner;
      uniform vec2 uRes, uCenter, uFade, uLine;
      uniform float uAmp, uDip, uSigma, uPeak, uDipSigma, uDipDepth, uTime, uShift, uSpeed;
      uniform vec4 uRip[4];
      varying float vSide, vH, vFade;
      float height(vec3 p){
        vec2 d = p.xz - uCenter; float r2 = dot(d, d);
        float h = uAmp * uPeak * exp(-r2 / (2.0 * uSigma * uSigma)) - uDip * uDipDepth * exp(-r2 / (2.0 * uDipSigma * uDipSigma));
        for (int i = 0; i < 4; i++) {
          vec4 rp = uRip[i]; float age = uTime - rp.z;
          if (rp.w > 0.0 && age > 0.0) {
            float r = length(p.xz - rp.xy), x = r - age * uSpeed;
            h += rp.w * 2.6 * exp(-x * x / 9.0) * cos(x * 0.8) * exp(-age * 0.8) / (1.0 + 0.07 * r);
          }
        }
        return h;
      }
      void main(){
        vec3 a = position; a.y = height(a); vec3 b = aEnd; b.y = height(b);
        vec4 ca = projectionMatrix * viewMatrix * vec4(a, 1.0), cb = projectionMatrix * viewMatrix * vec4(b, 1.0);
        vec2 sa = ca.xy / ca.w * uRes * 0.5, sb = cb.xy / cb.w * uRes * 0.5, dir = sb - sa;
        dir = length(dir) > 0.0001 ? normalize(dir) : vec2(1.0, 0.0);
        vec2 nrm = vec2(-dir.y, dir.x);
        vec4 c = mix(ca, cb, aCorner.x);
        float hw = mix(uLine.x, uLine.y, clamp(14.0 / max(c.w, 0.1), 0.0, 1.0));
        c.xy += nrm * aCorner.y * hw * 2.0 / uRes * c.w;
        gl_Position = c;
        vec3 wp = mix(a, b, aCorner.x);
        vH = wp.y / uPeak; vSide = aCorner.y;
        float dist = length((viewMatrix * vec4(wp, 1.0)).xyz);
        vFade = 1.0 - smoothstep(uFade.x + uShift, uFade.y + uShift, dist);
      }`;

const FRAG = `
      uniform vec3 uPurple, uBlue, uCyan; uniform float uAmp;
      varying float vSide, vH, vFade;
      void main(){
        float t = clamp(vH * 1.15 + uAmp * 0.45, 0.0, 1.0);
        vec3 col = t < 0.5 ? mix(uPurple, uBlue, t * 2.0) : mix(uBlue, uCyan, (t - 0.5) * 2.0);
        float a = (1.0 - smoothstep(0.55, 1.0, abs(vSide))) * vFade;
        gl_FragColor = vec4(col * a * (0.85 + 0.35 * clamp(vH, 0.0, 1.0)), a);
      }`;

export const PulseLattice: React.FC<PulseLatticeProps> = ({
  className = "",
  style = {},
  compact = false,
  hint = "Hover over the grid to wake it · drag to orbit · scroll / pinch to zoom · click for ripple · double-click to reset",
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const setViewRef = useRef<(v: string) => void>(() => {});

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setClearColor(0x000000, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CFG.fov, 1, 0.1, 500);
    const target = new THREE.Vector3(...(CFG.target as [number, number, number]));

    // ---- hex lattice -> ribbon edges ----
    const R = CFG.hexR, w = Math.sqrt(3) * R, vstep = 1.5 * R;
    const A: number[] = [], B: number[] = [], seen = new Set<string>();
    const key = (x: number, z: number) => Math.round(x * 100) + ',' + Math.round(z * 100);
    const rows = Math.ceil((CFG.zNear - CFG.zFar) / vstep) + 2, cols = Math.ceil(CFG.extentX * 2 / w) + 2;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const cx = -CFG.extentX + c * w + (r % 2 ? w / 2 : 0), cz = CFG.zFar + r * vstep, pts: Array<[number, number]> = [];
      for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + k * Math.PI / 3; pts.push([cx + R * Math.cos(a), cz + R * Math.sin(a)]); }
      for (let k = 0; k < 6; k++) {
        const p = pts[k], q = pts[(k + 1) % 6], id = [key(p[0], p[1]), key(q[0], q[1])].sort().join('|');
        if (seen.has(id)) continue; seen.add(id);
        A.push(p[0], 0, p[1]); B.push(q[0], 0, q[1]);
      }
    }
    const n = A.length / 3, pos = new Float32Array(n * 12), end = new Float32Array(n * 12), cor = new Float32Array(n * 8), idx = new Uint32Array(n * 6);
    const cn = [[0, -1], [0, 1], [1, -1], [1, 1]];
    for (let i = 0; i < n; i++) {
      for (let v = 0; v < 4; v++) {
        const o = i * 4 + v;
        for (let j = 0; j < 3; j++) { pos[o * 3 + j] = A[i * 3 + j]; end[o * 3 + j] = B[i * 3 + j]; }
        cor[o * 2] = cn[v][0]; cor[o * 2 + 1] = cn[v][1];
      }
      const b = i * 4; idx.set([b, b + 1, b + 2, b + 2, b + 1, b + 3], i * 6);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aEnd', new THREE.BufferAttribute(end, 3));
    geo.setAttribute('aCorner', new THREE.BufferAttribute(cor, 2));
    geo.setIndex(new THREE.BufferAttribute(idx, 1));

    const ripples = [0, 1, 2, 3].map(() => new THREE.Vector4(0, 0, -999, 0));
    const mat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uRes: { value: new THREE.Vector2(1, 1) }, uCenter: { value: new THREE.Vector2(...(CFG.center as [number, number])) },
        uAmp: { value: 0 }, uDip: { value: 0 }, uTime: { value: 0 }, uShift: { value: 0 }, uRip: { value: ripples },
        uSigma: { value: CFG.sigma }, uPeak: { value: CFG.peak }, uDipSigma: { value: CFG.dipSigma }, uDipDepth: { value: CFG.dipDepth },
        uSpeed: { value: CFG.rippleSpeed },
        uFade: { value: new THREE.Vector2(CFG.fadeNear, CFG.fadeFar) }, uLine: { value: new THREE.Vector2(CFG.lineMin, CFG.lineMax) },
        uPurple: { value: new THREE.Vector3(...(CFG.purple as [number, number, number])) }, uBlue: { value: new THREE.Vector3(...(CFG.blue as [number, number, number])) }, uCyan: { value: new THREE.Vector3(...(CFG.cyan as [number, number, number])) }
      },
      vertexShader: VERT,
      fragmentShader: FRAG
    });
    const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; scene.add(mesh);

    // ---- timeline ----
    const ease = (x: number) => x * x * (3 - 2 * x), gauss = (x: number, s: number) => Math.exp(-(x * x) / (2 * s * s));
    function profile(u: number) {
      const p = CFG.peakAt;
      const amp = u < p ? ease(u / p) : u < 0.88 ? 1 - ease((u - p) / (0.88 - p)) : 0;
      return { amp, dip: gauss(u - 0.72, 0.09) * 0.9 };
    }

    // ---- orbit state (goal + smoothed current) ----
    const goal = { ...VIEWS.front }, cur = { ...VIEWS.front };
    const clampView = () => {
      goal.pitch = THREE.MathUtils.clamp(goal.pitch, CFG.pitchMin, CFG.pitchMax);
      goal.R = THREE.MathUtils.clamp(goal.R, CFG.minR, CFG.maxR);
    };
    const setView = (v: string) => Object.assign(goal, VIEWS[v]);
    setViewRef.current = setView;

    // ---- pointer interaction ----
    const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
    const bump = new THREE.Vector2(...(CFG.center as [number, number])), bumpGoal = new THREE.Vector2(...(CFG.center as [number, number]));
    const ptrs = new Map<number, { x: number; y: number }>();
    let down: { x: number; y: number } | null = null, moved = 0, pinch = 0, speedBoost = 0, rippleI = 0, lastT = 0, hover = 0, hoverGoal = 0, phase = 0;
    const clock = new THREE.Clock();

    function floorPoint(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      ray.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)), camera);
      return ray.ray.intersectPlane(plane, hit) ? hit : null;
    }
    function addRipple(x: number, z: number, s: number) {
      ripples[rippleI].set(x, z, clock.getElapsedTime(), s); rippleI = (rippleI + 1) % ripples.length;
    }
    const onDown = (e: PointerEvent) => {
      canvas!.setPointerCapture(e.pointerId);
      if (hoverGoal === 0) { const h = floorPoint(e); if (h) { bumpGoal.set(THREE.MathUtils.clamp(h.x, -40, 40), THREE.MathUtils.clamp(h.z, -50, 10)); bump.copy(bumpGoal); } }
      hoverGoal = 1;
      ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      down = { x: e.clientX, y: e.clientY }; moved = 0;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = Math.hypot(a.x - b.x, a.y - b.y); }
    };
    const onMove = (e: PointerEvent) => {
      const wasOff = hoverGoal === 0; hoverGoal = 1; if (hintRef.current) hintRef.current.style.opacity = "0";
      const p = ptrs.get(e.pointerId);
      if (!p) { const h = floorPoint(e); if (h) { bumpGoal.set(THREE.MathUtils.clamp(h.x, -40, 40), THREE.MathUtils.clamp(h.z, -50, 10)); if (wasOff) bump.copy(bumpGoal); } return; }
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch) goal.R *= pinch / d; pinch = d;
      } else if (moved > 4) {
        canvas!.classList.add("drag");
        goal.yaw -= dx * CFG.rotSpeed; goal.pitch += dy * CFG.rotSpeed;
      }
      clampView();
    };
    const onUp = (e: PointerEvent) => {
      if (ptrs.has(e.pointerId) && ptrs.size === 1 && moved <= 4) {
        const h = floorPoint(e);
        if (h) { addRipple(h.x, h.z, 1); bumpGoal.set(THREE.MathUtils.clamp(h.x, -40, 40), THREE.MathUtils.clamp(h.z, -50, 10)); speedBoost = 1; }
      }
      if (e.pointerType !== 'mouse') hoverGoal = 0;
      ptrs.delete(e.pointerId); pinch = 0; canvas!.classList.remove("drag");
    };
    const onLeave = () => { if (!ptrs.size) hoverGoal = 0; };
    const onDocLeave = () => { hoverGoal = 0; };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); goal.R *= Math.exp(e.deltaY * 0.0012); clampView(); };
    const onDblClick = () => setView('front');
    const onKeyDown = (e: KeyboardEvent) => {
      const kmap: Record<string, [number, number]> = { ArrowLeft: [0.15, 0], ArrowRight: [-0.15, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] };
      const k = kmap[e.key];
      if (k) { goal.yaw += k[0]; goal.pitch += k[1]; clampView(); }
      if (e.key === '0') setView('front'); if (e.key === 't') setView('top'); if (e.key === 'u') setView('under');
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("pointerleave", onLeave);
    document.addEventListener("mouseleave", onDocLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("dblclick", onDblClick);
    window.addEventListener("keydown", onKeyDown);

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2), W = root!.clientWidth || 1, H = root!.clientHeight || 1;
      renderer.setPixelRatio(dpr); renderer.setSize(W, H, false);
      mat.uniforms.uRes.value.set(W * dpr, H * dpr);
      camera.aspect = W / H; camera.fov = W / H < 1 ? CFG.fov + (1 - W / H) * 28 : CFG.fov; camera.updateProjectionMatrix();
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(root);
    window.addEventListener("resize", resize);

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    function frame() {
      raf = requestAnimationFrame(frame);
      const t = clock.getElapsedTime(), dt = Math.min(t - lastT, 0.05); lastT = t;
      hover += (hoverGoal - hover) * (1 - Math.exp(-dt * (hoverGoal ? 20 : 3.2)));
      if (hoverGoal === 0 && hover < 0.003) hover = 0;
      phase += dt;
      const amp = 1 + (reduce ? 0 : Math.sin(phase * 2.2) * 0.04);
      const dip = hoverGoal ? 0 : 3.6 * hover * (1 - hover);
      const mv = Math.hypot(bumpGoal.x - bump.x, bumpGoal.y - bump.y);
      speedBoost = Math.max(speedBoost * 0.95, Math.min(mv * 0.04, 0.5));
      mat.uniforms.uAmp.value = Math.min(1.3, (amp + speedBoost * 0.35) * hover);
      mat.uniforms.uDip.value = dip * hover; mat.uniforms.uTime.value = t;
      bump.lerp(bumpGoal, CFG.follow); mat.uniforms.uCenter.value.copy(bump);
      const k = 1 - Math.pow(1 - CFG.damp, dt * 60);
      cur.yaw += (goal.yaw - cur.yaw) * k; cur.pitch += (goal.pitch - cur.pitch) * k; cur.R += (goal.R - cur.R) * k;
      const cp = Math.cos(cur.pitch);
      camera.position.set(target.x + cur.R * Math.sin(cur.yaw) * cp, target.y + cur.R * Math.sin(cur.pitch), target.z + cur.R * Math.cos(cur.yaw) * cp);
      camera.lookAt(target);
      mat.uniforms.uShift.value = cur.R - CFG.R0;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("mouseleave", onDocLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("dblclick", onDblClick);
      window.removeEventListener("keydown", onKeyDown);
      geo.dispose(); mat.dispose(); renderer.dispose();
    };
    // profile/ease/gauss mirror the reference cover curve (retained for parity)
  }, []);

  return (
    <div
      ref={rootRef}
      className={"pl-root" + (compact ? " pl-compact" : "") + (className ? " " + className : "")}
      style={style}
    >
      <canvas ref={canvasRef} className="pl-canvas" aria-hidden="true" />
      <div ref={hintRef} className="pl-hint">{hint}</div>
      <div className="pl-hud">
        {VIEW_BUTTONS.map(([v, label]) => (
          <button key={v} type="button" onClick={() => setViewRef.current(v)}>{label}</button>
        ))}
      </div>
    </div>
  );
};

export default PulseLattice;
