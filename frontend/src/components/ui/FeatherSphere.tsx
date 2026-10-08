// feather-sphere — UI HUB
// A procedural feather sphere: one fragment shader on a 160x120 sphere builds
// sawtooth feather tiers with per-tooth random heights, a five-stop deep-rose to
// porcelain-white radiant ramp, a luminous pole convergence highlight and a
// starfield, looped at a stepped 25 fps over a 0.96s reference cycle. The
// pointer eases a subtle tilt and steers the specular light; drag to spin with
// throw momentum, scroll to zoom, double-click to toggle 2.5x loop speed.
//
// Original source: standalone HTML (Three.js r128 UMD + Motion CDN + Tailwind 4
// CDN). Ported to React with `three` and `motion` (both already installed). CFG,
// the full GLSL and the interaction math are kept byte-for-byte from the
// reference implementation; the window-based sizing became a ResizeObserver on
// the stage so the preview fits its card instead of the viewport.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { animate } from "motion";

export interface FeatherSphereProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** Whether to show the bottom interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint. */
    hintText?: string;
}

export const FeatherSphere: React.FC<FeatherSphereProps> = ({
    className = "",
    style = {},
    showHint = true,
    hintText = "move to tilt & light · drag to spin · scroll to zoom",
}) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;

        const CFG = {
            loopSec: 0.96,                 // reference loop: 24 frames x 40 ms
            steps: 24,                     // stepped like the GIF (25 fps); set 0 for smooth
            pole: [0.4866, 0.7428, 0.4598],// pole where the feather streaks converge (screen-space unit vector)
            K: 1.3, M: -3, J: 0.55, G: 0.85, Nt: 20, // tier density, spiral, tooth height, ramp, teeth/rev
            center: [0.008, 0.011], fill: 0.724, stars: 16
        };

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor(0x050202);
        stage.appendChild(renderer.domElement);
        const el = renderer.domElement;
        el.style.display = "block";
        el.style.touchAction = "none";
        el.style.cursor = "grab";

        const scene = new THREE.Scene();
        const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);

        const FRAG = `precision highp float;
varying vec3 vObj; varying vec3 vN;
uniform float uT,uK,uM,uJ,uG,uNt,uPh0,uOn; uniform vec3 uLight; uniform vec2 uMouse;
float hsh(vec3 p){p=fract(p*0.3183099+vec3(.1,.2,.3));p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float vn(vec3 x,float per){
  vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);
  #define H(a,b,c) hsh(vec3(mod(i.x+a,per),i.y+b,i.z+c))
  return mix(mix(mix(H(0.,0.,0.),H(1.,0.,0.),f.x),mix(H(0.,1.,0.),H(1.,1.,0.),f.x),f.y),
             mix(mix(H(0.,0.,1.),H(1.,0.,1.),f.x),mix(H(0.,1.,1.),H(1.,1.,1.),f.x),f.y),f.z);
}
float hh(float a,float b){return fract(sin(a*127.1+b*311.7)*43758.5453);}
vec3 ramp(float l){
  vec3 c0=vec3(.075,.012,.004),c1=vec3(.40,.04,.04),c2=vec3(.88,.10,.20),c3=vec3(.98,.30,.52),c4=vec3(.99,.72,.96);
  if(l<.25)return mix(c0,c1,l/.25); if(l<.5)return mix(c1,c2,(l-.25)/.25);
  if(l<.78)return mix(c2,c3,(l-.5)/.28); return mix(c3,c4,(l-.78)/.22);
}
// sawtooth tooth profile with per-tooth random height and peak position, looped in time
float teeth(float ph,float nt,float a){
  float s=ph*nt, id=floor(s), fr=fract(s);
  float r1=vn(vec3(id*0.71,cos(a)*2.8+3.0,sin(a)*2.8),nt);
  float r2=vn(vec3(id*0.53+9.0,cos(a)*2.2,sin(a)*2.2+5.0),nt);
  float pk=0.15+0.7*r2;
  float t=fr<pk?fr/pk:(1.0-fr)/(1.0-pk);
  return t*(0.35+0.9*r1);
}
vec3 shade(vec3 p, vec3 n){
  float th=acos(clamp(p.y,-1.,1.));
  float ph=atan(p.z,p.x)/6.2831853+0.5+uPh0;
  float a=6.2831853*uT; vec2 cs=vec2(cos(a),sin(a));
  float s=ph*96.0;
  float jag=uJ*(0.8*teeth(ph,uNt,a)+0.25*teeth(ph+0.37,uNt*2.3,a+1.7)+0.08*vn(vec3(s,cs*2.0),96.0));
  float f=(th+0.12*th*th)*uK+ph*uM-uT+jag;
  float c=fract(f);
  float st=vn(vec3(s*0.9+31.0,cs*0.8+5.0),96.0*0.9);
  float st2=vn(vec3(s*2.1+11.0,cs*1.1),96.0*2.1);
  float streak=0.5*st+0.5*st2;
  float tierL=0.10+0.90*pow(c,uG);
  float L=tierL*(0.66+0.42*streak)*0.95;
  float pole=1.0-smoothstep(0.35,1.05,th);
  L=mix(L,0.80,pole*0.6);
  float nd=max(dot(n,normalize(uLight)),0.0);
  L*=0.36+0.78*pow(nd,1.1);
  L+=0.42*pow(nd,4.0);
  float rim=pow(1.0-max(n.z,0.0),2.2);
  L*=1.0-0.82*rim;
  vec3 col=ramp(clamp(L,0.,1.));
  col=mix(col,vec3(.58,.86,1.0)*(0.88+0.30*L),pole*0.85);
  return col;
}

void main(){
  vec3 n=normalize(vN);
  vec3 col=shade(normalize(vObj),n);
  vec3 L=normalize(vec3(uMouse,0.9));
  col+=uOn*pow(max(dot(n,L),0.0),14.0)*vec3(.50,.26,.40);
  gl_FragColor=vec4(col,1.0);
}`;
        const mat = new THREE.ShaderMaterial({
            uniforms: { uT: { value: 0 }, uK: { value: CFG.K }, uM: { value: CFG.M }, uJ: { value: CFG.J }, uG: { value: CFG.G }, uNt: { value: CFG.Nt },
                uPh0: { value: 0 }, uOn: { value: 0 }, uLight: { value: new THREE.Vector3(-0.45, 0.2, 1) }, uMouse: { value: new THREE.Vector2() } },
            vertexShader: `varying vec3 vObj; varying vec3 vN;
    void main(){ vObj=position; vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);} `,
            fragmentShader: FRAG
        });
        // object space: +Y is the feather pole. Basis (e1, pole, e2) makes the pole point at the reference screen position.
        const pole = new THREE.Vector3(...CFG.pole).normalize();
        const e1 = new THREE.Vector3().crossVectors(pole, new THREE.Vector3(0, 0, 1)).normalize();
        const e2 = new THREE.Vector3().crossVectors(pole, e1);
        const sphereGeo = new THREE.SphereGeometry(1, 160, 120);
        const sphere = new THREE.Mesh(sphereGeo, mat);
        sphere.matrixAutoUpdate = false; sphere.matrix.makeBasis(e1, pole, e2);
        const globe = new THREE.Group(); globe.add(sphere);
        const holder = new THREE.Group(); holder.add(globe); holder.position.set(CFG.center[0], CFG.center[1], 0); scene.add(holder);

        let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        const spos = new Float32Array(CFG.stars * 3);
        for (let i = 0; i < CFG.stars; i++) { const a = rnd() * 6.283, r = 1.3 + rnd() * 1.25; spos[i * 3] = Math.cos(a) * r; spos[i * 3 + 1] = Math.sin(a) * r; spos[i * 3 + 2] = -2; }
        const starsGeo = new THREE.BufferGeometry(); starsGeo.setAttribute('position', new THREE.BufferAttribute(spos, 3));
        const starsMat = new THREE.PointsMaterial({ color: 0xfff0e8, size: 2, sizeAttenuation: false, transparent: true });
        const stars = new THREE.Points(starsGeo, starsMat);
        scene.add(stars);

        function resize() {
            const w = stage.clientWidth, h = stage.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h);
            const unit = Math.min(w, h) * CFG.fill / 2;
            cam.left = -w / 2 / unit; cam.right = w / 2 / unit; cam.top = h / 2 / unit; cam.bottom = -h / 2 / unit; cam.updateProjectionMatrix();
        }
        const ro = new ResizeObserver(resize);
        ro.observe(stage);
        resize();

        // ---- interaction ----
        let dragging = false, lx = 0, ly = 0, vx = 0, vy = 0, lastDrag = 0, zoom = 1, zoomT = 1, rate = 1, rateT = 1;
        const mouse = new THREE.Vector2(), ms = new THREE.Vector2(); let active = 0, activeT = 0;
        const onDown = (e: PointerEvent) => { dragging = true; lx = e.clientX; ly = e.clientY; el.setPointerCapture(e.pointerId); rateT = 0.35; el.style.cursor = "grabbing"; };
        const onUp = () => { dragging = false; rateT = 1; lastDrag = performance.now(); el.style.cursor = "grab"; };
        const onLeave = () => { activeT = 0; mouse.set(0, 0); };
        const onMove = (e: PointerEvent) => {
            activeT = 1;
            // normalise against the stage rect, not the window: the preview card
            // is a scaled canvas of the viewport
            const r = stage.getBoundingClientRect();
            mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
            if (dragging) { vy += (e.clientX - lx) * 0.004; vx += (e.clientY - ly) * 0.004; lx = e.clientX; ly = e.clientY; }
        };
        const onWheel = (e: WheelEvent) => { e.preventDefault(); zoomT = THREE.MathUtils.clamp(zoomT * (1 - e.deltaY * 0.0012), 0.55, 1.9); };
        const onDbl = () => { rateT = rateT === 1 ? 2.5 : 1; };
        el.addEventListener('pointerdown', onDown);
        el.addEventListener('pointerup', onUp);
        el.addEventListener('pointerleave', onLeave);
        el.addEventListener('pointermove', onMove);
        el.addEventListener('wheel', onWheel, { passive: false });
        el.addEventListener('dblclick', onDbl);

        const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
        const clock = new THREE.Clock(); let t = 0; const ry = { v: 0 }, rx = { v: 0 };
        let rafId = 0;
        function tick() {
            const dt = Math.min(clock.getDelta(), 0.05);
            rate += (rateT - rate) * Math.min(dt * 6, 1); zoom += (zoomT - zoom) * Math.min(dt * 6, 1); active += (activeT - active) * Math.min(dt * 5, 1);
            ms.lerp(mouse, Math.min(dt * 6, 1));
            if (!reduce) t += dt * rate;
            let u = (t / CFG.loopSec) % 1; if (CFG.steps) u = Math.floor(u * CFG.steps) / CFG.steps;
            mat.uniforms.uT.value = u;
            ry.v += vy; rx.v += vx; vx *= 0.9; vy *= 0.9;
            if (!dragging) { const k = Math.min(dt * (performance.now() - lastDrag > 600 ? 2.2 : 0.4), 1); ry.v -= ry.v * k; rx.v -= rx.v * k; }
            globe.rotation.y = ry.v + ms.x * 0.2 * active; globe.rotation.x = rx.v - ms.y * 0.2 * active;
            mat.uniforms.uMouse.value.set(ms.x * 0.9, ms.y * 0.9); mat.uniforms.uOn.value = active;
            globe.scale.setScalar(zoom);
            stars.material.opacity = 0.35 + 0.65 * Math.abs(Math.sin(performance.now() * 0.004));
            renderer.render(scene, cam); rafId = requestAnimationFrame(tick);
        }
        tick();

        let hintAnim: { stop: () => void } | null = null;
        let zoomAnim: { stop: () => void } | null = null;
        try {
            if (showHint && hintRef.current) {
                hintAnim = animate(hintRef.current, { opacity: [0, 1] }, { delay: 1.2, duration: 1.2 });
            }
            zoomAnim = animate(0.7, 1, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: v => { zoomT = v; zoom = v; } });
        } catch {
            if (hintRef.current) hintRef.current.style.opacity = "1";
        }

        return () => {
            cancelAnimationFrame(rafId);
            ro.disconnect();
            el.removeEventListener('pointerdown', onDown);
            el.removeEventListener('pointerup', onUp);
            el.removeEventListener('pointerleave', onLeave);
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('wheel', onWheel);
            el.removeEventListener('dblclick', onDbl);
            hintAnim?.stop();
            zoomAnim?.stop();
            sphereGeo.dispose();
            mat.dispose();
            starsGeo.dispose();
            starsMat.dispose();
            renderer.dispose();
            if (el.parentNode) el.parentNode.removeChild(el);
        };
    }, [showHint]);

    return (
        <div
            className={`relative w-full h-full min-h-[380px] bg-[#050505] text-white overflow-hidden select-none ${className}`}
            style={style}
        >
            <div ref={stageRef} className="absolute inset-0" />
            {showHint && (
                <p
                    ref={hintRef}
                    className="pointer-events-none absolute bottom-6 left-0 right-0 text-center text-[11px] tracking-[0.3em] uppercase text-white/45 opacity-0 select-none"
                    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                    {hintText}
                </p>
            )}
        </div>
    );
};

export default FeatherSphere;
