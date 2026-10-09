import * as React from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";
import * as THREE from "three";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import "./WaveTunnel.css";

/* ================= CENTRAL CONFIG (edit freely) ================= */
export const CFG = {
  nu: 90,             // samples along tunnel axis
  nv: 190,            // samples around the curl
  loopSeconds: 2,     // loop period (s)
  turns: 1.0,         // how many revolutions the curl makes
  length: 12,
  rOuter: 3.4,
  rInner: 0.3,
  hole: [1.5, 0.9] as [number, number],  // camera offset from tube axis (world x,y), camera sits inside the barrel
  vp: [0.8, 0.05] as [number, number],   // vanishing point in NDC (lens shift)
  pointPx: 3.0,
  mouseRadius: 0.28,
  mouseStrength: 0.12,
  tilt: 0.12,
};

/* ================= SHADERS ================= */
const vert = /* glsl */ `
uniform float uTravel, uShrink;
uniform float uTime, uPhase, uPx, uAspect, uMR, uMS;
uniform vec2 uMouse;
uniform float uMouseOn;
uniform vec4 uC; // turns, length, rOuter, rInner
uniform vec2 uHole;
attribute vec2 aIJ;
varying float vA;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
void main(){
  float NU=${CFG.nu.toFixed(1)}, NV=${CFG.nv.toFixed(1)};
  float u = fract((aIJ.x + uPhase + uTravel)/NU);          // flows by exactly one cell per loop
  float v = aIJ.y/(NV-1.);
  float th = v*uC.x*6.28318;
  float ease = pow(u, 1.6);
  // spiral radius: curl closes in on itself with angle and tapers with depth
  float spiral = uC.z*uShrink*(1.0 - 0.10*v);
  float taper = mix(1., 0.55, smoothstep(0.35,1.0,u));
  float r = spiral*taper;
  // ripples travelling around/along the wave surface (periodic in loop time)
  float w = uTime*6.28318/${CFG.loopSeconds.toFixed(1)};
  float rip = 0.10*sin(th*3.0 + u*18. - w) + 0.06*sin(th*7. - u*30. + 2.*w)
            + 0.18*(n(vec2(th*1.3, u*9. ))-0.5);
  r *= 1. + rip*mix(1.,.4,ease);
  float z = 1.2 + ease*uC.y;
  vec3 p = vec3(cos(th)*r, sin(th)*r, -z);
  p.xy -= uHole;                                     // camera is off-axis inside the barrel
  vec4 mv = modelViewMatrix*vec4(p,1.);
  vec4 cp = projectionMatrix*mv;
  // mouse: push points away in screen space
  vec2 ndc = cp.xy/cp.w;
  vec2 d = ndc - uMouse; d.x *= uAspect;
  float dist = length(d);
  float f = exp(-dist*dist/(uMR*uMR))*uMouseOn;
  vec2 dir = d/max(dist,1e-4); dir.x/=uAspect;
  cp.xy += dir*f*uMS*cp.w;
  gl_Position = cp;
  float depth = -mv.z;
  gl_PointSize = clamp(uPx*5.0/depth, 1.0, uPx*1.15);
  float fadeEnd = smoothstep(1.0,0.82,u) * smoothstep(0.0,0.03,u);
  vA = fadeEnd*(1.0+f*0.0);
}`;

const frag = /* glsl */ `
varying float vA;
void main(){
  vec2 c = gl_PointCoord-.5; float d=length(c);
  if(d>.5) discard;
  gl_FragColor = vec4(vec3(1.), vA*smoothstep(.5,.28,d));
}`;

/* ================= SECTIONS ================= */
const SECTIONS = [
  { k: "01", t: "Into the wave", s: "Scroll to dive through the point-cloud barrel." },
  { k: "02", t: "Depth", s: "Every dot sits on a surface that curls around you." },
  { k: "03", t: "Motion", s: "Move your mouse — the field pushes back." },
  { k: "04", t: "Beyond", s: "The hole opens as you reach the other side." },
];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

function Section({ i, p, d }: { i: number; p: MotionValue<number>; d: (typeof SECTIONS)[number] }) {
  const n = SECTIONS.length, c = (i + 0.5) / n, w = 0.5 / n;
  const r = [c - w, c, c + w];
  const bigY = useTransform(p, r, [260, 0, -260]);
  const midY = useTransform(p, r, [140, 0, -140]);
  const smY = useTransform(p, r, [60, 0, -60]);
  const o = useTransform(p, [c - w, c - w * 0.45, c + w * 0.45, c + w], [0, 1, 1, 0]);
  const sc = useTransform(p, r, [0.85, 1, 1.25]);
  const blur = useTransform(p, [c - w, c - w * 0.4, c + w * 0.4, c + w], [12, 0, 0, 12]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  return (
    <motion.div className="wt-sec pointer-events-none absolute inset-0 grid place-items-center text-white" style={{ opacity: o }}>
      <motion.span style={{ y: bigY, scale: sc }} className="wt-num absolute select-none font-black leading-none text-transparent">
        {d.k}
      </motion.span>
      <motion.h2 style={{ y: midY, filter }} className="wt-title relative px-6 text-center font-semibold tracking-tight">
        {d.t}
      </motion.h2>
      <motion.p style={{ y: smY }} className="wt-tag absolute px-6 text-center text-white/70">
        {d.s}
      </motion.p>
    </motion.div>
  );
}

export interface WaveTunnelProps {
  progress?: MotionValue<number>;
  compact?: boolean;
  showDemoButton?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function WaveTunnel({ progress, compact = false, showDemoButton = false, className, style }: WaveTunnelProps) {
  const root = useRef<HTMLDivElement>(null);
  const shell = useRef<HTMLElement>(null);
  const seq = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const gl = useRef<HTMLDivElement>(null);

  const fallback = useMotionValue(0);
  const pr = progress ?? fallback;
  const progressRef = useRef(pr);
  progressRef.current = pr;

  /* cursor springs */
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 220, damping: 22 });
  const sy = useSpring(y, { stiffness: 220, damping: 22 });

  /* canvas parallax */
  const canvasY = useTransform(pr, [0, 1], ["0%", "-4%"]);
  const canvasScale = useTransform(pr, [0, 1], [1.04, 1.18]);
  const bare = useSpring(pr, { stiffness: 120, damping: 30 });
  const hint = useTransform(pr, [0, 0.06], [1, 0]);

  const setVh = () => {
    const h = compact && shell.current ? shell.current.clientHeight : window.innerHeight;
    root.current?.style.setProperty("--wt-vh", `${h / 100}px`);
  };

  useLayoutEffect(() => {
    setVh();
  }, [compact]);

  /* internal scroll progress fallback */
  useEffect(() => {
    const scroller: HTMLElement | Window = compact && shell.current ? shell.current : window;
    const update = () => {
      let v: number;
      if (compact && shell.current && seq.current) {
        const el = shell.current;
        v = el.scrollTop / Math.max(1, (seq.current.offsetHeight || 1) - el.clientHeight);
      } else {
        v = window.scrollY / Math.max(1, (document.documentElement.scrollHeight || 1) - window.innerHeight);
      }
      fallback.set(clamp01(v));
    };
    scroller.addEventListener("scroll", update, { passive: true });
    update();
    return () => scroller.removeEventListener("scroll", update);
  }, [compact, fallback]);

  /* cursor tracking (relative to sticky stage) */
  useEffect(() => {
    const m = (e: PointerEvent) => {
      const st = stage.current;
      if (!st) return;
      const r = st.getBoundingClientRect();
      x.set(e.clientX - r.left - 18);
      y.set(e.clientY - r.top - 18);
    };
    window.addEventListener("pointermove", m);
    return () => window.removeEventListener("pointermove", m);
  }, [x, y]);

  /* WebGL tunnel */
  useEffect(() => {
    const el = gl.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, preserveDrawingBuffer: true });
    renderer.setClearColor(0x000000, 1);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    el.appendChild(renderer.domElement);
    renderer.domElement.style.display = "block";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
    camera.position.set(0, 0, 0);

    const N = CFG.nu * CFG.nv;
    const ij = new Float32Array(N * 2);
    for (let i = 0, k = 0; i < CFG.nu; i++) for (let j = 0; j < CFG.nv; j++, k++) {
      ij[k * 2] = i;
      ij[k * 2 + 1] = j;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    geo.setAttribute("aIJ", new THREE.BufferAttribute(ij, 2));

    const mat = new THREE.ShaderMaterial({
      vertexShader: vert,
      fragmentShader: frag,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: { value: 0 },
        uTravel: { value: 0 },
        uShrink: { value: 1 },
        uPhase: { value: 0 },
        uPx: { value: CFG.pointPx * dpr },
        uAspect: { value: 1 },
        uMR: { value: CFG.mouseRadius },
        uMS: { value: CFG.mouseStrength },
        uMouse: { value: new THREE.Vector2(9, 9) },
        uMouseOn: { value: 0 },
        uC: { value: new THREE.Vector4(CFG.turns, CFG.length, CFG.rOuter, CFG.rInner) },
        uHole: { value: new THREE.Vector2(...CFG.hole) },
      },
    });
    const pts = new THREE.Points(geo, mat);
    pts.frustumCulled = false;
    scene.add(pts);

    const vp = CFG.vp;
    const applyLens = (sp = 0) => {
      camera.projectionMatrix.elements[8] = -(vp[0] * (1 - sp * 0.9));
      camera.projectionMatrix.elements[9] = -(vp[1] * (1 - sp));
      camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    };
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.fov = w / h < 1 ? 85 : 70;
      camera.updateProjectionMatrix();
      applyLens();
      mat.uniforms.uAspect.value = w / h;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    window.addEventListener("resize", resize);

    const target = new THREE.Vector2(), cur = new THREE.Vector2();
    const mouse = new THREE.Vector2(9, 9);
    let on = 0, onT = 0, sc = 0;
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
      onT = 1;
    };
    const leave = () => { onT = 0; };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerleave", leave);
    document.addEventListener("mouseleave", leave);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const q = new URLSearchParams(window.location.search);
    const fixed = q.has("t") ? parseFloat(q.get("t")!) : null;
    const clock = new THREE.Clock();
    let raf = 0;

    const tick = () => {
      const t = fixed ?? (reduce ? 0 : clock.getElapsedTime());
      const p = (t % CFG.loopSeconds) / CFG.loopSeconds;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uPhase.value = p;
      sc += (progressRef.current.get() - sc) * 0.07;          // smoothed scroll progress 0..1
      mat.uniforms.uTravel.value = sc * CFG.nu * 1.6;         // dive down the tunnel
      mat.uniforms.uShrink.value = 1 - sc * 0.3;
      cur.lerp(target, 0.06);
      mouse.lerp(target, 0.18);
      on += (onT - on) * 0.06;
      mat.uniforms.uMouse.value.copy(mouse);
      mat.uniforms.uMouseOn.value = on;
      camera.rotation.y = -cur.x * CFG.tilt;
      camera.rotation.x = cur.y * CFG.tilt;
      camera.rotation.z = -cur.x * 0.04 + sc * 1.4;           // roll with scroll
      applyLens(sc);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerleave", leave);
      document.removeEventListener("mouseleave", leave);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentElement === el) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={root}
      className={"wt-root" + (compact ? " wt-compact" : "") + (className ? " " + className : "")}
      style={style}
    >
      {showDemoButton && compact && (
        <Link to="/demo/wave-tunnel" className="wt-demo-btn">
          <ExternalLink size={12} /> Live Demo
        </Link>
      )}

      <main className="wt-shell" ref={shell}>
        <div className="wt-seq" ref={seq}>
          <div className="wt-stage cursor-none" ref={stage}>
            <motion.div className="wt-parallax" style={{ y: canvasY, scale: canvasScale }} aria-hidden="true">
              <div className="wt-gl" ref={gl} />
            </motion.div>

            {SECTIONS.map((d, i) => <Section key={d.k} i={i} p={pr} d={d} />)}

            <motion.div className="wt-hint pointer-events-none" style={{ opacity: hint }}>
              scroll
            </motion.div>
            <motion.div className="wt-bar pointer-events-none" style={{ scaleX: bare }} aria-hidden="true" />
            <motion.div aria-hidden className="wt-cursor pointer-events-none" style={{ x: sx, y: sy }} />
          </div>
        </div>
      </main>
    </div>
  );
}