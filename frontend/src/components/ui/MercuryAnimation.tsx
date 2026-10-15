// ── FILE: frontend/src/components/ui/MercuryAnimation.tsx ──
// mercury-animation — UI HUB
// "Mercury Rotating Globe": a realistic, endlessly spinning Mercury built with
// three.js. One sphere on a full-bleed WebGL canvas — no chrome, no readouts.
// The planet carries a 2048x1024 equirectangular colour map and a grayscale
// relief (bump) map, a thin blue-gold rim glow, 170 twinkling glints pinned to
// the brightest crater rays (children of the planet, so they turn with it) and
// 2,400 background stars. Drag in any direction to turn it a full 360° on both
// axes (world-space quaternion), release for fading momentum; wheel or
// two-finger pinch zooms 0.6x-2.2x, double-click resets, Space pauses.
// prefers-reduced-motion starts it paused.
//
// Source: the standalone "mercury-react" Vite + React + three.js app
// (`src/MercuryGlobe.jsx`) that ships the real photo-derived textures
// `mercury_texture.jpg` / `mercury_bump.jpg` and the crater-ray table
// `glints.json`. Ported faithfully here: the shaders, lights, camera framing,
// drag/inertia/zoom math, spin clock and the whole planet build are kept
// intact; the two textures are served from /assets/mercury-animation/ and the
// 170 glints are inlined below so the component holds no loose data files.
// Adapted for the library: the fixed full-viewport canvas becomes a
// ResizeObserver-sized canvas inside the component's own box, the Spacehandler
// is scoped to a pointer-over guard, and the three.js r128 colour API
// (`outputEncoding` / `texture.encoding` = sRGBEncoding) is migrated to the
// installed three (`outputColorSpace` / `texture.colorSpace` = SRGBColorSpace).

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./MercuryAnimation.css";

export interface MercuryAnimationProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
}

/* textures ship in frontend/public/assets/mercury-animation/ */
const TEX_URL = "/assets/mercury-animation/mercury_texture.jpg"; // colour map, 2048x1024
const BUMP_URL = "/assets/mercury-animation/mercury_bump.jpg";   // relief map, 2048x1024

const DUR = 60;      // seconds for one spin at 1x
const STARS = 2400;

/* [lon, lat, brightness] of the brightest crater rays */
const GLINTS: number[][] = [[-2.441, 0.637, 1.0], [-3.011, 0.505, 1.0], [-3.008, 0.502, 1.0], [-3.011, 0.502, 1.0], [-3.008, 0.505, 1.0], [-3.011, 0.508, 1.0], [-3.014, 0.505, 1.0], [2.339, 0.603, 1.0], [2.293, 0.591, 1.0], [0.781, 0.649, 1.0], [0.514, -0.112, 0.99], [0.765, -0.545, 0.98], [0.815, -0.437, 0.98], [-0.413, -0.686, 0.98], [-0.207, 0.44, 0.98], [-0.155, -0.44, 0.98], [0.64, 0.673, 0.98], [0.646, -0.235, 0.98], [0.314, -0.796, 0.98], [2.674, 0.176, 0.97], [-2.852, 0.624, 0.97], [-0.176, -0.397, 0.97], [0.726, 0.584, 0.97], [0.928, -0.453, 0.97], [0.704, 0.64, 0.97], [0.25, 0.673, 0.97], [0.505, 0.339, 0.97], [-2.545, 0.719, 0.97], [0.195, 0.462, 0.97], [0.845, -0.649, 0.96], [-2.652, 0.388, 0.96], [0.67, 0.514, 0.96], [0.434, -0.449, 0.96], [2.885, 0.164, 0.96], [-0.219, -0.489, 0.96], [-0.094, -0.425, 0.96], [-2.376, 0.124, 0.96], [-0.183, -0.63, 0.96], [0.173, -0.759, 0.95], [0.173, 0.256, 0.95], [0.272, -0.235, 0.95], [-2.306, 0.207, 0.95], [-0.161, -0.575, 0.95], [0.416, 0.787, 0.95], [0.327, 0.894, 0.95], [-2.8, 0.557, 0.95], [0.216, 0.296, 0.95], [0.569, 0.431, 0.95], [0.351, -1.026, 0.95], [2.695, -0.189, 0.95], [-2.29, 0.637, 0.95], [2.312, 0.287, 0.95], [-0.517, 0.357, 0.95], [-0.376, 0.324, 0.95], [-2.413, -0.318, 0.95], [-2.738, -0.164, 0.94], [-0.373, 0.83, 0.94], [-0.026, 0.765, 0.94], [2.64, 0.511, 0.94], [-0.189, 0.314, 0.94], [0.348, -0.683, 0.94], [0.118, 0.723, 0.94], [0.581, 0.707, 0.94], [2.226, 0.198, 0.94], [2.796, -0.357, 0.94], [-0.71, 0.462, 0.94], [0.56, 0.545, 0.94], [0.394, 0.428, 0.94], [-2.962, 0.446, 0.94], [0.453, -0.161, 0.94], [0.373, 0.775, 0.94], [0.854, -0.216, 0.94], [2.416, 0.6, 0.93], [0.716, 0.474, 0.93], [0.597, 0.603, 0.93], [-1.005, -0.351, 0.93], [2.536, 0.459, 0.93], [-1.069, -0.048, 0.93], [2.349, 0.434, 0.93], [-0.962, -0.428, 0.93], [0.425, 0.729, 0.93], [0.514, 0.64, 0.93], [0.723, 0.514, 0.93], [-0.462, 0.462, 0.93], [0.023, 0.33, 0.93], [0.247, 0.526, 0.93], [-2.901, 0.262, 0.93], [2.763, 0.471, 0.93], [-2.643, -0.195, 0.92], [-0.112, 0.603, 0.92], [0.394, 0.535, 0.92], [-2.704, -0.075, 0.92], [2.732, -0.477, 0.92], [0.545, 0.594, 0.92], [-0.253, -0.775, 0.92], [2.447, 0.397, 0.92], [2.52, 0.569, 0.92], [-0.29, -0.535, 0.92], [-2.474, 0.802, 0.92], [0.723, -0.465, 0.92], [0.1, 0.505, 0.92], [2.376, -0.008, 0.92], [-0.615, 0.517, 0.92], [0.578, -0.287, 0.91], [0.919, 0.584, 0.91], [0.219, 0.345, 0.91], [0.321, 0.158, 0.91], [-0.069, 0.109, 0.91], [-0.75, -0.762, 0.91], [-2.551, 0.63, 0.91], [0.308, 0.578, 0.91], [2.545, 0.621, 0.91], [2.668, 0.103, 0.91], [0.278, 0.302, 0.91], [-0.084, 0.354, 0.91], [2.278, -0.25, 0.9], [0.403, -0.538, 0.9], [0.388, -0.192, 0.9], [2.824, -0.179, 0.9], [2.456, 0.192, 0.9], [-0.354, 0.247, 0.9], [2.619, 0.115, 0.9], [-0.222, 0.655, 0.9], [0.124, -0.097, 0.9], [-0.17, 0.262, 0.9], [0.483, 0.514, 0.9], [0.296, -0.698, 0.9], [0.081, -0.287, 0.9], [-2.542, -0.919, 0.9], [0.146, 0.364, 0.9], [-2.818, 0.827, 0.9], [-0.449, 0.287, 0.9], [0.726, 0.765, 0.9], [0.164, 0.698, 0.89], [0.167, 1.054, 0.89], [2.839, 0.25, 0.89], [0.204, -0.882, 0.89], [0.318, 0.808, 0.89], [2.088, 0.081, 0.89], [-0.13, -0.808, 0.89], [-2.938, 0.388, 0.89], [3.036, -0.069, 0.89], [-3.042, 0.121, 0.89], [-2.428, 0.265, 0.89], [-0.876, 0.759, 0.89], [0.25, -0.106, 0.89], [2.781, -0.081, 0.89], [-2.502, -0.149, 0.89], [2.453, 0.468, 0.88], [-0.146, 0.066, 0.88], [2.8, 0.735, 0.88], [-0.4, -0.505, 0.88], [0.79, -0.318, 0.88], [0.79, 0.495, 0.88], [1.097, -0.066, 0.88], [0.609, 0.95, 0.88], [2.502, 0.612, 0.88], [0.765, 0.253, 0.88], [0.133, -0.538, 0.88], [0.618, 0.824, 0.88], [-2.704, 0.741, 0.88], [2.536, -0.529, 0.88], [0.336, 0.333, 0.88], [0.112, -0.17, 0.88], [0.367, 1.026, 0.87], [-2.695, -0.143, 0.87], [2.557, 0.268, 0.87], [2.686, 0.354, 0.87], [0.983, 0.575, 0.87], [2.79, 0.314, 0.87]];

/* ---------- shaders for the twinkling points (glints and stars) ---------- */
const VS = `
attribute float aSize; attribute float aPhase; attribute float aKind; attribute float aBase;
uniform float uTime,uPR,uScale,uSurf; varying float vA; varying float vK;
void main(){
 vec4 mv=modelViewMatrix*vec4(position,1.0);
 vec3 wp=(modelMatrix*vec4(position,1.0)).xyz;
 float sp=0.7+fract(aPhase*7.31)*2.4;
 float t=0.5+0.5*sin(uTime*sp+aPhase);
 float tw=aBase+(1.0-aBase)*pow(t,3.0);
 float vis=1.0;
 if(uSurf>0.5){ vec3 n=normalize(wp); vis=smoothstep(0.1,0.4,dot(n,normalize(cameraPosition-wp))); }
 vA=tw*vis; vK=aKind;
 float s=uScale>0.0 ? uScale/(-mv.z) : 1.0;
 gl_PointSize=aSize*uPR*s*(0.75+0.5*tw);
 gl_Position=projectionMatrix*mv;
}`
const FS = `
uniform vec3 uColor; varying float vA; varying float vK;
void main(){
 vec2 p=gl_PointCoord-0.5; float d=length(p)*2.0;
 float core=exp(-d*d*10.0);
 float spike=exp(-abs(p.x)*46.0)*exp(-abs(p.y)*5.0)+exp(-abs(p.y)*46.0)*exp(-abs(p.x)*5.0);
 float v=core+vK*spike*0.95;
 v*=1.0-smoothstep(0.78,1.0,max(abs(p.x),abs(p.y))*2.0);
 gl_FragColor=vec4(uColor,clamp(v*vA,0.0,1.0));
}`

function pointsMaterial(uniforms: Record<string, { value: any }>, color: number): THREE.ShaderMaterial {
    return new THREE.ShaderMaterial({
        uniforms: { ...uniforms, uColor: { value: new THREE.Color(color) } },
        vertexShader: VS,
        fragmentShader: FS,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    });
}

function makePoints(pos: number[], size: number[], phase: number[], kind: number[], base: number[], material: THREE.Material): THREE.Points {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(size), 1));
    g.setAttribute("aPhase", new THREE.BufferAttribute(new Float32Array(phase), 1));
    g.setAttribute("aKind", new THREE.BufferAttribute(new Float32Array(kind), 1));
    g.setAttribute("aBase", new THREE.BufferAttribute(new Float32Array(base), 1));
    const p = new THREE.Points(g, material);
    p.frustumCulled = false;
    return p;
}

const lonlat = (l: number, p: number, r: number): [number, number, number] => [
    r * Math.cos(l) * Math.cos(p),
    r * Math.sin(p),
    -r * Math.sin(l) * Math.cos(p),
];

const loadImage = (src: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

export const MercuryAnimation: React.FC<MercuryAnimationProps> = ({ className = "", style = {} }) => {
    const rootRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const root = rootRef.current;
        if (!root) return;

        let disposed = false;
        let raf = 0;
        const cleanups: Array<() => void> = [];
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

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.setClearColor(0x03040a, 1);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 400);
        let baseDist = 4;
        let zoom = 1;

        /* light: a low sun from the upper left gives the crater relief and a soft shadow on the right edge */
        scene.add(new THREE.AmbientLight(0xdfe6ff, 0.42));
        const sun = new THREE.DirectionalLight(0xfff0da, 1.25);
        sun.position.set(-2.4, 1.4, 2.8);
        scene.add(sun);

        /* orientation: user quaternion on `root`, own-axis spin on the mesh */
        const rootGroup = new THREE.Group();
        scene.add(rootGroup);
        const planet = new THREE.Group();
        rootGroup.add(planet);
        const home = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.1, 0, 0.16));
        rootGroup.quaternion.copy(home);

        let spin = 0;
        let playing = !reduce;
        const speed = 1;

        const uni = {
            uTime: { value: 0 },
            uPR: { value: renderer.getPixelRatio() },
            uScale: { value: 1 },
            uSurf: { value: 1 },
        };
        const uniStar = { uTime: uni.uTime, uPR: uni.uPR, uScale: { value: 0 }, uSurf: { value: 0 } };

        /* background stars and a few 4-point sparkles */
        {
            const pos: number[] = [], size: number[] = [], ph: number[] = [], kind: number[] = [], base: number[] = [];
            for (let i = 0; i < STARS; i++) {
                const u = Math.random() * 2 - 1;
                const a = Math.random() * Math.PI * 2;
                const r = Math.sqrt(1 - u * u);
                const R = 120;
                pos.push(R * r * Math.cos(a), R * u, R * r * Math.sin(a));
                const big = Math.random() < 0.012;
                size.push(big ? 16 + Math.random() * 10 : 1.6 + Math.random() * 3.2);
                ph.push(Math.random() * 6.283);
                kind.push(big ? 1 : 0);
                base.push(big ? 0.35 : 0.55 + Math.random() * 0.35);
            }
            scene.add(makePoints(pos, size, ph, kind, base, pointsMaterial(uniStar, 0xcfd8ff)));
        }

        let mesh: THREE.Mesh | null = null;

        const applyZoom = () => {
            const w = canvas.clientWidth;
            const h = canvas.clientHeight;
            const d = baseDist / zoom;
            camera.position.set(0, 0, d);
            camera.updateProjectionMatrix();
            uni.uScale.value = d * Math.min(1, Math.min(w, h) / 820) * 1.05;
        };
        const resize = () => {
            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            const asp = Math.min(1, w / h);
            baseDist = Math.min(9, 1 / (0.6 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * asp));
            applyZoom();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(root);
        cleanups.push(() => ro.disconnect());

        /* ---------- drag, inertia, zoom ---------- */
        let vx = 0, vy = 0, dragging = false;
        const AX = new THREE.Vector3(1, 0, 0);
        const AY = new THREE.Vector3(0, 1, 0);
        const dq = new THREE.Quaternion();
        const dq2 = new THREE.Quaternion();
        const turn = (dx: number, dy: number) => {
            dq.setFromAxisAngle(AY, dx);
            dq2.setFromAxisAngle(AX, dy);
            rootGroup.quaternion.premultiply(dq).premultiply(dq2).normalize();
        };

        const ptrs = new Map<number, [number, number]>();
        let pinch = 0, lx = 0, ly = 0, hover = false;
        const onDown = (e: PointerEvent) => {
            canvas.setPointerCapture(e.pointerId);
            ptrs.set(e.pointerId, [e.clientX, e.clientY]);
            if (ptrs.size === 1) {
                dragging = true;
                canvas.classList.add("drag");
                lx = e.clientX; ly = e.clientY; vx = vy = 0;
            }
            if (ptrs.size === 2) {
                const a = Array.from(ptrs.values());
                pinch = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
            }
        };
        const onMove = (e: PointerEvent) => {
            if (!ptrs.has(e.pointerId)) return;
            ptrs.set(e.pointerId, [e.clientX, e.clientY]);
            if (ptrs.size === 2) {
                const a = Array.from(ptrs.values());
                const d = Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1]);
                if (pinch > 0) {
                    zoom = Math.max(0.6, Math.min(2.2, (zoom * d) / pinch));
                    applyZoom();
                }
                pinch = d;
                return;
            }
            const dx = (e.clientX - lx) * 0.008;
            const dy = (e.clientY - ly) * 0.008;
            lx = e.clientX; ly = e.clientY;
            turn(dx, dy);
            vx = dx * 0.6 + vx * 0.4;
            vy = dy * 0.6 + vy * 0.4;
        };
        const onUp = (e: PointerEvent) => {
            ptrs.delete(e.pointerId);
            pinch = 0;
            if (ptrs.size === 0) {
                dragging = false;
                canvas.classList.remove("drag");
            }
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            zoom = Math.max(0.6, Math.min(2.2, zoom * Math.exp(-e.deltaY * 0.001)));
            applyZoom();
        };
        const onDbl = () => {
            rootGroup.quaternion.copy(home);
            vx = vy = 0;
            zoom = 1;
            applyZoom();
        };
        const onKey = (e: KeyboardEvent) => {
            if (hover && e.code === "Space") {
                e.preventDefault();
                playing = !playing;
            }
        };
        const onEnter = () => { hover = true; };
        const onLeave = () => { hover = false; };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerup", onUp);
        canvas.addEventListener("pointercancel", onUp);
        canvas.addEventListener("wheel", onWheel, { passive: false });
        canvas.addEventListener("dblclick", onDbl);
        canvas.addEventListener("pointerenter", onEnter);
        canvas.addEventListener("pointerleave", onLeave);
        window.addEventListener("keydown", onKey);
        cleanups.push(() => {
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerup", onUp);
            canvas.removeEventListener("pointercancel", onUp);
            canvas.removeEventListener("wheel", onWheel);
            canvas.removeEventListener("dblclick", onDbl);
            canvas.removeEventListener("pointerenter", onEnter);
            canvas.removeEventListener("pointerleave", onLeave);
            window.removeEventListener("keydown", onKey);
        });

        /* ---------- clock ---------- */
        let last = performance.now();
        let tAcc = 0;
        const frame = (now: number) => {
            if (disposed) return;
            const dt = Math.min(0.1, (now - last) / 1000);
            last = now;
            tAcc += dt;
            uni.uTime.value = tAcc;
            if (playing && !dragging) spin += (dt * speed * Math.PI * 2) / DUR;
            if (!dragging && (Math.abs(vx) > 1e-5 || Math.abs(vy) > 1e-5)) {
                turn(vx * dt * 60, vy * dt * 60);
                const k = Math.pow(0.92, dt * 60);
                vx *= k; vy *= k;
            }
            if (mesh) mesh.rotation.y = -Math.PI / 2 + spin;
            renderer.render(scene, camera);
            raf = requestAnimationFrame(frame);
        };

        /* ---------- planet ---------- */
        Promise.all([loadImage(TEX_URL), loadImage(BUMP_URL)]).then(([texImg, bumpImg]) => {
            if (disposed) return;
            const aniso = renderer.capabilities.getMaxAnisotropy();
            const map = new THREE.Texture(texImg);
            map.colorSpace = THREE.SRGBColorSpace;
            map.anisotropy = aniso;
            map.needsUpdate = true;
            const bump = new THREE.Texture(bumpImg);
            bump.anisotropy = aniso;
            bump.needsUpdate = true;

            const mat = new THREE.MeshStandardMaterial({
                map,
                bumpMap: bump,
                bumpScale: 0.4,
                roughness: 0.97,
                metalness: 0,
                emissive: 0xffffff,
                emissiveMap: map,
                emissiveIntensity: 0.1, // keeps colours alive on the shaded side
            });
            const geo = new THREE.SphereGeometry(1, 192, 128);
            mesh = new THREE.Mesh(geo, mat);
            planet.add(mesh);
            disposables.push(map, bump, mat, geo);

            /* thin glow around the edge */
            const rimMat = new THREE.ShaderMaterial({
                side: THREE.BackSide,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending,
                vertexShader:
                    "varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.0); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
                fragmentShader:
                    "varying vec3 vN; varying vec3 vV; void main(){ float f=pow(clamp(-dot(normalize(vN),normalize(vV)),0.0,1.0),3.0); vec3 c=mix(vec3(0.95,0.72,0.35),vec3(0.35,0.5,1.0),0.55); gl_FragColor=vec4(c,f*0.34); }",
            });
            const rimGeo = new THREE.SphereGeometry(1.16, 96, 64);
            scene.add(new THREE.Mesh(rimGeo, rimMat));
            disposables.push(rimMat, rimGeo);

            /* twinkling glints on crater rays, they turn with the planet */
            const pos: number[] = [], size: number[] = [], ph: number[] = [], kind: number[] = [], base: number[] = [];
            GLINTS.forEach((g) => {
                const q = lonlat(g[0], g[1], 1.004);
                pos.push(q[0], q[1], q[2]);
                const b = Math.max(0, Math.min(1, (g[2] - 0.66) / 0.34));
                size.push(4 + b * 11);
                ph.push(Math.random() * 6.283);
                kind.push(b > 0.55 ? 1 : 0);
                base.push(0.12 + Math.random() * 0.2);
            });
            mesh.add(makePoints(pos, size, ph, kind, base, pointsMaterial(uni, 0xfff3dc)));

            load.classList.add("mercury-gone");
            resize();
            raf = requestAnimationFrame(frame);
        }).catch((err) => {
            load.textContent = "Unable to load";
            // eslint-disable-next-line no-console
            console.error("[MercuryAnimation]", err);
        });

        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            cleanups.forEach((fn) => fn());
            disposables.forEach((d) => { try { d.dispose(); } catch { /* ignore */ } });
            renderer.dispose();
            (renderer as any).forceContextLoss?.();
            canvas.remove();
            load.remove();
        };
    }, []);

    return <div ref={rootRef} className={`mercury-root select-none ${className}`} style={style} />;
};

export default MercuryAnimation;
