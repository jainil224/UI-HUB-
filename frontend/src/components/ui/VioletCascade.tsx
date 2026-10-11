// violet-cascade — UI HUB
// A floating violet ring of particles spins and cascades downward into a reflective
// pool of procedural light streaks. Two additive point clouds (a 14k "beam" curtain
// and a 7k "ring" halo) share one GLSL shader driven by a single flow flag; a plane
// shader renders the vertical streak reflections and a bright surface band. The
// pointer repels the particles, a click fires a pulse through the beam and the pool,
// and the whole group parallax-tilts toward the cursor. A second 2D canvas holds a
// downscaled copy of the WebGL frame that CSS blurs into a cheap bloom.
//
// Original source: standalone HTML (Three.js r128 UMD + Tailwind CDN). Ported to React
// with `three` (already installed). The CFG block, the seeded RNG, the point-cloud builder
// and all GLSL shaders are kept byte-for-byte from the reference; the DOM boot + window
// listeners became a React lifecycle bound to the component's own container, the window
// resize listener became a ResizeObserver on that container, and the render loop + bloom
// draw are torn down on unmount.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./VioletCascade.css";

export interface VioletCascadeProps {
  /** Optional class applied to the root container. */
  className?: string;
  /** Optional inline styles for the root container. */
  style?: React.CSSProperties;
  /** When true (library preview), fills a compact card instead of a full viewport. */
  compact?: boolean;
  /** Hint line shown at the bottom. */
  hint?: string;
}

// ---- central config (all tunables) ----
const CFG = {
  loop: 2.88,            // seconds, matches reference GIF loop
  extent: 4.4,           // world units visible across min(viewport)
  ringY: 1.42, radius: 0.72, poolY: -1.35, fall: 1.35,
  tilt: 0.14,            // ~8deg => ellipse ratio ~0.14 like reference
  beamCount: 14000, ringCount: 7000,
  mouseRadius: 0.35, mouseForce: 0.4,
};

// seeded RNG for deterministic layout
function rng(a: number) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---- particles (beam + ring share one shader) ----
const VERT = `
attribute vec4 aSeed; attribute float aSize;
uniform float uTime,uPx,uPulse,uAct,uFlow,uRadius,uRingY,uFall;
uniform vec3 uMouse;
varying float vA; varying vec3 vC;
void main(){
  float life = uFlow>.5 ? fract(aSeed.z + uTime*aSeed.w) : aSeed.z*.035;
  float ang = aSeed.x + uTime*.12*(.4+aSeed.y);
  float r = aSeed.y*uRadius*(1.0-.07*life);
  r *= 1.0 + uPulse*.35*life;
  vec3 p = vec3(cos(ang)*r, uRingY - life*uFall, sin(ang)*r);
  p.x += sin(uTime*1.3+aSeed.x*17.0)*.012*life;
  vec4 wp = modelMatrix*vec4(p,1.0);
  vec2 d = wp.xy - uMouse.xy;
  float f = exp(-dot(d,d)/.14)*uAct;
  wp.xy += normalize(d+1e-4)*f*.38;
  float tw = sin(uTime*(3.0+aSeed.w*14.0)+aSeed.x*40.0)*.5+.5;
  float a = uFlow>.5 ? pow(1.0-life,1.5)*(.45+.55*tw) : (.55+.45*tw);
  a *= 1.0 + uPulse*.8 + f*1.2;
  vA = a;
  vec3 hi = vec3(.93,.85,1.0), lo = vec3(.36,.2,1.0);
  vC = uFlow>.5 ? mix(hi,lo,smoothstep(.0,.55,life)) : hi;
  vec4 mv = viewMatrix*wp;
  gl_Position = projectionMatrix*mv;
  gl_PointSize = aSize*uPx*(1.0+f*1.4)*(20.0/-mv.z);
}`;

const FRAG = `
varying float vA; varying vec3 vC;
void main(){
  float d = length(gl_PointCoord-.5);
  float a = smoothstep(.5,.0,d); a *= a;
  gl_FragColor = vec4(vC, a*vA);
}`;

const POOL_VERT = `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;

const POOL_FRAG = `
      varying vec2 vUv; uniform float uTime,uAct,uPulse; uniform vec3 uMouse;
      float h(float x){return fract(sin(x*127.1)*43758.5453);}
      float n(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h(i),h(i+1.),f);}
      void main(){
        vec2 p=(vUv-.5)*vec2(2.4,1.3);
        float t=p.y+.35;                         // height above pool floor
        float col=p.x*48.0 + sin(t*9.0+uTime*2.0)*.8;
        float s=n(col)*.7+n(col*2.3+7.0)*.3;
        float fl=n(col*.5+uTime*2.2+t*3.0);
        float streak=smoothstep(.3,1.0,s)*(.45+.55*fl);
        float env=exp(-pow(abs(p.x)/.72,4.0));
        float up = t>0.0 ? exp(-t*3.2) : 0.0;
        float band=exp(-pow(t/.09,2.0))*(.7+.3*n(col*.35+uTime*1.3));
        float mx=exp(-pow(p.x-uMouse.x,2.0)/.07)*uAct;
        float I=env*(streak*up*(.55+.9*mx+uPulse*.6) + band*(.9+.5*mx+uPulse*.6));
        vec3 c=mix(vec3(.45,.3,1.0),vec3(.82,.7,1.0),clamp(band*.8,0.,1.));
        gl_FragColor=vec4(c, clamp(I,0.,1.)*.9);
      }`;

export const VioletCascade: React.FC<VioletCascadeProps> = ({
  className = "",
  style = {},
  compact = false,
  hint = "move · click",
}) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const glowRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    const gl = glRef.current;
    const glowC = glowRef.current;
    if (!stage || !gl || !glowC) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const rand = rng(1337);

    const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: false, alpha: false });
    renderer.setClearColor(0x030305, 1);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 1, 100);
    camera.position.z = 20;
    const group = new THREE.Group();
    scene.add(group);

    const U = {
      uTime: { value: 0 }, uPx: { value: 1 }, uPulse: { value: 0 },
      uMouse: { value: new THREE.Vector3(9, 9, 0) }, uAct: { value: 0 },
    };

    const disposable: Array<{ dispose: () => void }> = [];

    function makePoints(n: number, flow: number, sizeMin: number, sizeMax: number, edgeBias: number) {
      const g = new THREE.BufferGeometry();
      const seed = new Float32Array(n * 4), size = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        seed[i * 4] = rand() * Math.PI * 2;
        seed[i * 4 + 1] = Math.pow(rand(), edgeBias);
        seed[i * 4 + 2] = rand();
        seed[i * 4 + 3] = (rand() < .5 ? 1 : 2) / CFG.loop;   // integer cycles per loop => seamless
        size[i] = sizeMin + rand() * (sizeMax - sizeMin);
      }
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3));
      g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 4));
      g.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
      const m = new THREE.ShaderMaterial({
        vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: Object.assign({}, U, {
          uFlow: { value: flow }, uRadius: { value: CFG.radius }, uRingY: { value: CFG.ringY }, uFall: { value: CFG.fall }
        }),
      });
      const p = new THREE.Points(g, m); p.frustumCulled = false;
      disposable.push(g, m);
      return p;
    }
    group.add(makePoints(CFG.beamCount, 1, 1.4, 3.6, .42));
    group.add(makePoints(CFG.ringCount, 0, 2.0, 4.6, .6));
    group.rotation.x = CFG.tilt;

    // ---- reflection pool: procedural vertical streaks ----
    const poolGeo = new THREE.PlaneGeometry(2.4, 1.3);
    const poolMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uTime: U.uTime, uMouse: U.uMouse, uAct: U.uAct, uPulse: U.uPulse },
      vertexShader: POOL_VERT,
      fragmentShader: POOL_FRAG,
    });
    const pool = new THREE.Mesh(poolGeo, poolMat);
    pool.position.y = CFG.poolY + 0.35; // plane-local floor sits at y=-0.35
    scene.add(pool);
    disposable.push(poolGeo, poolMat);

    // ---- interaction ----
    const m = { x: 0, y: 0, tx: 0, ty: 0, tAct: 0, ext: { w: 1, h: 1 } };
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      m.tx = ((e.clientX - r.left) / r.width - .5) * m.ext.w;
      m.ty = -((e.clientY - r.top) / r.height - .5) * m.ext.h;
      m.tAct = 1;
    };
    const onDown = (e: PointerEvent) => { onMove(e); if (!reduce) U.uPulse.value = 1; };
    const onLeave = () => { m.tAct = 0; };
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') m.tAct = 0; };
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerdown", onDown);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerup", onUp);

    // ---- resize ----
    const gctx = glowC.getContext("2d");
    function resize() {
      const w = stage!.clientWidth, h = stage!.clientHeight, S = Math.min(w, h);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(dpr); renderer.setSize(w, h, false);
      const H = CFG.extent * h / S, W = CFG.extent * w / S;
      m.ext = { w: W, h: H };
      camera.aspect = w / h;
      camera.fov = 2 * Math.atan((H / 2) / 20) * 180 / Math.PI;
      camera.updateProjectionMatrix();
      U.uPx.value = dpr * S / 500 * 1.6;
      glowC.width = Math.max(2, w >> 2); glowC.height = Math.max(2, h >> 2);
    }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(stage);
    window.addEventListener("resize", resize);

    // ---- loop ----
    const clock = new THREE.Clock();
    let time = 0;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(clock.getDelta(), .05);
      time += dt * (reduce ? .25 : 1);
      U.uTime.value = time;
      m.x += (m.tx - m.x) * .12; m.y += (m.ty - m.y) * .12;
      U.uAct.value += (m.tAct - U.uAct.value) * .1;
      U.uPulse.value *= Math.pow(.04, dt);               // decay click pulse
      U.uMouse.value.set(m.x, m.y, 0);
      // parallax tilt toward the pointer
      group.rotation.y += ((m.x / m.ext.w) * .5 * U.uAct.value - group.rotation.y) * .06;
      group.rotation.x += (CFG.tilt - (m.y / m.ext.h) * .12 * U.uAct.value - group.rotation.x) * .06;
      renderer.render(scene, camera);
      if (gctx) {
        gctx.globalCompositeOperation = 'source-over';
        gctx.clearRect(0, 0, glowC.width, glowC.height);
        gctx.drawImage(gl, 0, 0, glowC.width, glowC.height);   // cheap bloom source, blurred via CSS
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", resize);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerdown", onDown);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerup", onUp);
      disposable.forEach((d) => d.dispose());
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={"vc-root" + (compact ? " vc-compact" : "") + (className ? " " + className : "")}
      style={style}
    >
      <canvas ref={glRef} className="vc-gl" aria-hidden="true" />
      <canvas ref={glowRef} className="vc-glow" aria-hidden="true" />
      <p className="vc-hint">{hint}</p>
    </div>
  );
};

export default VioletCascade;
