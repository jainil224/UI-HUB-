// particle-sun — UI HUB
// A sphere of ~150,000 additive-blended particles on a pure black background: a
// crisp green/teal limb, a fuzzy halo and a surface whose noise filaments glow
// yellow where the light hits. The light azimuth sweeps a full 360° over a
// seamless 9s loop — front, right limb, behind, left limb, back to front — and
// the pointer steers it while the page is idle, a click fires a shockwave that
// ripples out through the shell, and rare red/violet specks pepper the surface.
//
// Original source: standalone HTML (Three.js r128 UMD + Tailwind 4 CDN). Ported to
// React with `three` (already installed). Config, geometry generation and both
// GLSL shaders are kept byte-for-byte from the reference implementation; the
// window-based sizing became a ResizeObserver on the container so the preview
// fits its card instead of the viewport.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface ParticleSunProps {
    /** Optional class applied to the root container. */
    className?: string;
}

export const ParticleSun: React.FC<ParticleSunProps> = ({ className = "" }) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const stage = stageRef.current;
        const canvas = canvasRef.current;
        if (!stage || !canvas) return;

        /* ---------- central config (tuned from the reference video analysis) ---------- */
        const CFG = {
            loop: 9.0,                 // seconds, seamless
            count: matchMedia("(max-width:700px)").matches ? 70000 : 150000,
            shell: 0.58, rim: 0.14,    // fractions; remainder = halo
            diameterW: 0.72,           // rim diameter as fraction of width (ref: 521/720)
            // light azimuth keyframes [t, degrees] measured: front -> right limb (4s) -> behind -> left limb (5s) -> front
            light: [[0, 0], [2, 40], [4, 90], [4.5, 170], [5.05, 270], [7, 315], [9, 360]] as [number, number][],
            elevation: 0.12,
            size: 2.3,
        };
        const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* ---------- seeded RNG (deterministic layout) ---------- */
        let rngState = 1337;
        const rnd = () => (rngState = (rngState * 1664525 + 1013904223) >>> 0) / 4294967296;

        /* ---------- three setup ---------- */
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false });
        renderer.setClearColor(0x000000, 1);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.z = 8;

        /* ---------- geometry ---------- */
        const N = CFG.count,
            pos = new Float32Array(N * 3),
            seed = new Float32Array(N * 4),
            type = new Float32Array(N);
        for (let i = 0; i < N; i++) {
            const u = rnd(), v = rnd(), th = 2 * Math.PI * u, z = 2 * v - 1, q = Math.sqrt(1 - z * z);
            const dir = [q * Math.cos(th), q * Math.sin(th), z];
            const k = i / N;
            let r: number, t: number;
            if (k < CFG.shell) { t = 0; r = 1 - Math.pow(rnd(), 2.2) * 0.5; }      // volume, biased to surface
            else if (k < CFG.shell + CFG.rim) { t = 1; r = 0.985 + rnd() * 0.03; }  // crisp limb
            else { t = 2; r = 1.0 + Math.pow(rnd(), 1.8) * 0.42; }                  // fuzzy halo
            pos.set([dir[0] * r, dir[1] * r, dir[2] * r], i * 3);
            seed.set([rnd(), rnd(), rnd(), rnd()], i * 4);
            type[i] = t;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 4));
        geo.setAttribute("aType", new THREE.BufferAttribute(type, 1));

        const mat = new THREE.ShaderMaterial({
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            uniforms: {
                uTime: { value: 0 }, uLight: { value: new THREE.Vector3(0, 0, 1) }, uMouse: { value: new THREE.Vector3(9, 9, 0) },
                uMouseF: { value: 0 }, uPulse: { value: 9 }, uIntro: { value: 0 }, uSize: { value: CFG.size }, uDpr: { value: 1 }, uLoop: { value: CFG.loop }, uS: { value: 1 },
            },
            vertexShader: `
    attribute vec4 aSeed; attribute float aType;
    uniform float uTime,uMouseF,uPulse,uIntro,uSize,uDpr,uLoop,uS; uniform vec3 uLight,uMouse;
    varying vec3 vCol; varying float vA;
    float h(vec3 p){p=fract(p*0.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
    float vn(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
      return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
    void main(){
      float a = uTime*6.2831853/uLoop;                       // seamless loop phase
      vec3 loopV = vec3(cos(a), sin(a), cos(a+1.3))*0.9;
      vec3 p = position;
      vec3 n0 = normalize(p);
      // flowing displacement (periodic in time -> loops exactly)
      vec3 q = p*2.4 + loopV;
      vec3 d = vec3(vn(q)-.5, vn(q+17.3)-.5, vn(q+41.7)-.5);
      p += d * (aType==2. ? 0.16 : (aType==1. ? 0.02 : 0.10));
      // intro bloom
      p *= mix(0.2, 1.0, uIntro);
      vec3 wp = (modelMatrix*vec4(p,1.)).xyz;
      vec3 n = normalize(wp);
      // mouse repel (xy plane)
      vec2 dm = (wp.xy - uMouse.xy)/uS; float dl = length(dm)+1e-4;
      wp.xy += dm/dl * exp(-dl*dl*5.) * 0.22 * uMouseF * uS;
      // click shockwave
      float rr = length(wp)/uS; float ring = exp(-pow((rr - uPulse*2.2)*5.,2.)) * (1.-clamp(uPulse/1.4,0.,1.));
      wp += n * ring * 0.35 * uS;
      // lighting
      float lit = max(dot(n, uLight), 0.);
      float rimW = pow(1. - abs(n.z), 2.2);
      float front = smoothstep(-.2,1.,n.z);
      float cn = vn(n0*3.2 + loopV*0.7);
      float glow = pow(lit,3.)*front*2.6 + pow(lit,2.)*rimW*(aType==1.?5.0:3.0) + 0.0;
      if (aType==2.) {           // halo: radial streaks toward the lit limb
        vec2 rad = normalize(wp.xy+1e-4); float side = max(dot(rad, normalize(uLight.xy+1e-4)),0.);
        float k = pow(side,2.)*length(uLight.xy);
        wp.xy += rad * aSeed.z * 0.22 * k * uS;
        glow = 0.3 + k*2.2*(1.-aSeed.y*.5);
      }
      float ridge = 1. - abs(2.*vn(n0*4.2+loopV*.6+3.)-1.); float fil = 0.45 + 1.5*pow(ridge,3.);
      float base = (aType==1. ? 1.9 : (aType==2. ? 0.5 : 0.85)) * (aType==0. ? fil : 1.);
      float back = n.z < 0. ? 0.55 : 1.;
      // colour: green/teal base, yellow where noise & light are high, rare red/violet specks
      vec3 green = vec3(.10,.60,.32), teal = vec3(.10,.70,.66), yel = vec3(.98,.92,.28), hot = vec3(1.,.97,.62);
      vec3 col = mix(green, teal, smoothstep(.5,.85,vn(n0*5.+9.+loopV*.5)+aSeed.x*.25-.12)*.7);
      col = mix(col, yel, smoothstep(.55,.78,cn + glow*.10 + aSeed.y*.2-.1));
      col = mix(col, hot, clamp(glow*.45,0.,1.)) ;
      if (aSeed.w > .975) col = mix(vec3(.95,.15,.2), vec3(.7,.2,.95), aSeed.x);
      if (aType==2.) col = mix(vec3(.05,.45,.55), col, .6);
      vCol = col * (base + glow) * back;
      vA = (aType==2. ? .75 : 1.0) * uIntro;
      vec4 mv = viewMatrix * vec4(wp,1.);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = uSize * uDpr * (0.6 + aSeed.z*0.9) * (aType==1. ? 0.9 : 1.);
    }`,
            fragmentShader: `
    varying vec3 vCol; varying float vA;
    void main(){ vec2 c=gl_PointCoord-.5; float d=length(c); if(d>.5) discard;
      gl_FragColor = vec4(vCol, vA*smoothstep(.5,.1,d)); }`,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        /* ---------- sizing: rim diameter = 72% width (as in reference), clamped for landscape ---------- */
        let dpr = 1;
        const resize = () => {
            const w = stage.clientWidth || stage.offsetWidth;
            const h = stage.clientHeight || stage.offsetHeight;
            if (!w || !h) return;
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            const diamPx = Math.min(w * CFG.diameterW, h * 0.5);          // sphere diameter in CSS px
            const worldH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            const scale = (diamPx / h) * worldH / 2;                        // radius in world units
            points.scale.setScalar(scale);
            mat.uniforms.uDpr.value = dpr * Math.max(0.7, diamPx / 520);
            camera.updateProjectionMatrix();
            mat.userData = { s: scale };
        };
        const ro = new ResizeObserver(resize);
        ro.observe(stage);
        resize();

        /* ---------- light path (measured keyframes, smoothstep between keys) ---------- */
        const lightAt = (t: number) => {
            const K = CFG.light;
            let i = 0;
            while (i < K.length - 2 && t > K[i + 1][0]) i++;
            const [t0, a0] = K[i], [t1, a1] = K[i + 1];
            let u = Math.min(Math.max((t - t0) / (t1 - t0), 0), 1);
            u = u * u * (3 - 2 * u) * 0.6 + u * 0.4;
            const az = THREE.MathUtils.degToRad(a0 + (a1 - a0) * u);
            // az=0 -> toward the viewer (+z); az=90 -> +x (right limb)
            const el = CFG.elevation * Math.cos(az * 0.5);
            return new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).normalize();
        };

        /* ---------- interaction ---------- */
        const ptr = { x: 0, y: 0, sx: 0, sy: 0, active: false, last: -9 };
        const lightInfl = { v: 0 };
        let pulseT0 = -10;
        const setPtr = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
            ptr.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
            ptr.active = true;
            ptr.last = performance.now() / 1000;
        };
        const onPointerDown = (e: PointerEvent) => {
            setPtr(e);
            pulseT0 = performance.now() / 1000;
        };
        const onPointerLeave = () => {
            ptr.active = false;
        };
        stage.addEventListener("pointermove", setPtr);
        stage.addEventListener("pointerdown", onPointerDown);
        stage.addEventListener("pointerleave", onPointerLeave);

        /* ---------- loop ---------- */
        const clock = new THREE.Clock();
        const tmp = new THREE.Vector3();
        let intro = 0;
        let raf = 0;
        let disposed = false;
        const frame = () => {
            if (disposed) return;
            const now = performance.now() / 1000,
                dt = Math.min(clock.getDelta(), 0.05);
            const t = (clock.elapsedTime * (reduced ? 0.4 : 1)) % CFG.loop;
            intro = Math.min(intro + dt / 1.6, 1);
            const ei = 1 - Math.pow(1 - intro, 3);

            // pointer smoothing + idle fallback to the timeline
            const idle = now - ptr.last > 2.2;
            ptr.sx += (ptr.x - ptr.sx) * Math.min(dt * 6, 1);
            ptr.sy += (ptr.y - ptr.sy) * Math.min(dt * 6, 1);
            lightInfl.v += ((idle ? 0 : 1) - lightInfl.v) * Math.min(dt * (idle ? 1.2 : 5), 1);

            // light = timeline blended with pointer-driven direction
            const auto = lightAt(t);
            const mouseDir = tmp
                .set(
                    ptr.sx * 1.15,
                    ptr.sy * 1.15,
                    Math.sqrt(Math.max(0.05, 1 - ptr.sx * ptr.sx * 1.3 - ptr.sy * ptr.sy * 1.3))
                )
                .normalize();
            const L = auto.clone().lerp(mouseDir, lightInfl.v * (reduced ? 0 : 1)).normalize();

            // gentle tilt parallax
            points.rotation.y += ((reduced ? 0 : ptr.sx * 0.28) - points.rotation.y) * Math.min(dt * 3, 1);
            points.rotation.x += ((reduced ? 0 : -ptr.sy * 0.22) - points.rotation.x) * Math.min(dt * 3, 1);

            const u = mat.uniforms, scale = (mat.userData as { s: number }).s;
            u.uTime.value = t;
            u.uLight.value.copy(L);
            u.uIntro.value = ei;
            // convert pointer (ndc) to world xy at z=0
            const hh = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
            u.uMouse.value.set(ptr.sx * hh * camera.aspect, ptr.sy * hh, 0);
            u.uS.value = scale;
            u.uMouseF.value += ((ptr.active && !reduced ? 1 : 0) - u.uMouseF.value) * Math.min(dt * 6, 1);
            u.uPulse.value = Math.min(now - pulseT0, 9);

            renderer.render(scene, camera);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        /* hint fade-in/out (Web Animations API) */
        const hintAnim = hintRef.current?.animate(
            [
                { opacity: 0 },
                { opacity: 1, offset: 0.2 },
                { opacity: 1, offset: 0.8 },
                { opacity: 0 },
            ],
            { duration: 6000, delay: 1800, fill: "forwards" }
        );

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            stage.removeEventListener("pointermove", setPtr);
            stage.removeEventListener("pointerdown", onPointerDown);
            stage.removeEventListener("pointerleave", onPointerLeave);
            hintAnim?.cancel();
            geo.dispose();
            mat.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div
            ref={stageRef}
            className={
                "relative h-full w-full select-none overflow-hidden bg-black " +
                (className ? " " + className : "")
            }
        >
            <canvas ref={canvasRef} className="block h-full w-full touch-none" aria-hidden="true" />
            <p
                ref={hintRef}
                className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-xs uppercase tracking-[0.3em] text-emerald-200/50 opacity-0"
                style={{ paddingBottom: "env(safe-area-inset-bottom,0px)" }}
            >
                move to steer the light &middot; click to pulse
            </p>
        </div>
    );
};

export default ParticleSun;
