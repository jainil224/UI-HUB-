// Streak Sphere — UI HUB
// A WebGL particle sphere with incandescent neon-purple streaks streaming down
// meridians, reflecting on a specular floor plane with distance-attenuated fade,
// rim lighting, interactive pointer tilt spring, and pulse shockwave.
// The canvas is full-bleed: the authored 500-tall logical frame is extended
// horizontally (or vertically, on portrait) to the container's aspect so there
// are never letterbox bars, and the widened margins carry an ambient dust
// starfield, a floor haze along the reflection line, and an edge vignette.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export interface StreakSphereProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Optional inline styles for the root container. */
    style?: React.CSSProperties;
    /** Number of streak lines travelling down meridians (default 1000). */
    streaks?: number;
    /** Number of ambient sparks drifting down the shell (default 900). */
    sparks?: number;
    /** Speed multiplier for rotation and streak flow (default 1). */
    speed?: number;
    /** Whether to show the bottom interaction hint (default true). */
    showHint?: boolean;
    /** Text for the interaction hint (default "move · press"). */
    hintText?: string;
}

export const StreakSphere: React.FC<StreakSphereProps> = ({
    className = "",
    style = {},
    streaks = 1000,
    sparks = 900,
    speed = 1,
    showHint = true,
    hintText = "move · press",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const hintRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        /* ---------- Config (all tunables in one place) ---------- */
        const CFG = {
            size: 500, // logical coordinate space = reference pixels
            center: [250, 75] as [number, number], // sphere centre
            radius: 178, // sphere radius
            mirrorY: 258, // floor / reflection plane
            loopSeconds: 5.76 / Math.max(0.1, speed),
            streaks,
            segments: 10,
            sparks,
            speedCycles: [1, 1, 2, 2, 3], // full top->bottom passes per loop
            trailLen: [0.15, 0.75] as [number, number], // radians
            ambient: 340, // background dust stars spread over the full frame
            seed: 1337,
            bg: [0.018, 0.018, 0.036] as [number, number, number],
            reflectFade: 52,
            reflectGain: 0.7,
            tilt: [0.55, 0.3] as [number, number], // max mouse tilt (rad)
        };

        const reduced =
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* seeded RNG -> deterministic layout */
        function rng(a: number) {
            return function () {
                a |= 0;
                a = (a + 0x6d2b79f5) | 0;
                let t = Math.imul(a ^ (a >>> 15), 1 | a);
                t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
            };
        }
        const rand = rng(CFG.seed);

        /* ---------- Renderer ---------- */
        const renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
        });
        renderer.setClearColor(
            new THREE.Color(CFG.bg[0], CFG.bg[1], CFG.bg[2]),
            1
        );

        const scene = new THREE.Scene();
        const S = CFG.size;
        // OrthographicCamera with y pointing down matching logical canvas
        const camera = new THREE.OrthographicCamera(0, S, 0, S, -10, 10);

        const U = {
            uPhase: { value: 0 },
            uC: { value: new THREE.Vector2(...CFG.center) },
            uR: { value: CFG.radius },
            uRot: { value: new THREE.Vector2() },
            uPtr: { value: new THREE.Vector2(-999, -999) },
            uPtrOn: { value: 0 },
            uPulse: { value: 0 },
            uTime: { value: 0 },
            uSize: { value: 2 },
            uDScale: { value: 2 },
            uMirror: { value: CFG.mirrorY },
            uFade: { value: CFG.reflectFade },
            uGain: { value: CFG.reflectGain },
            uBg: { value: new THREE.Vector3(...CFG.bg) },
            uL: { value: new THREE.Vector2(S, S) },
            uMotion: { value: reduced ? 0 : 1 },
        };

        /* ---------- Glow body + reflection (full-screen shader) ---------- */
        const bgMat = new THREE.ShaderMaterial({
            uniforms: U,
            depthTest: false,
            depthWrite: false,
            // the y-down ortho camera flips winding, so the fullscreen quad
            // would otherwise be backface-culled and never render
            side: THREE.DoubleSide,
            vertexShader: `
                varying vec2 vP;
                void main(){
                    vec4 wp = modelMatrix * vec4(position, 1.0);
                    vP = wp.xy;
                    gl_Position = projectionMatrix * viewMatrix * wp;
                }
            `,
            fragmentShader: `
                precision highp float;
                uniform vec2 uC, uPtr, uL;
                uniform float uR, uMirror, uFade, uGain, uPtrOn, uPulse, uTime;
                uniform vec3 uBg;
                varying vec2 vP;

                float rnd(vec2 p){
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                vec3 bowl(vec2 p, float soft, float ptrGain){
                    float d = length(p - uC) - uR;
                    float t = clamp((p.y - 100.0) / 155.0, 0.0, 1.0);
                    float a = clamp(pow(t, 2.0) * 1.25 + 0.02, 0.0, 1.0);
                    vec3 deep = vec3(0.28, 0.12, 1.0);
                    vec3 hot = vec3(0.84, 0.40, 1.0);
                    vec3 col = mix(deep, hot, smoothstep(0.3, 1.0, t)) * a;
                    float m = 1.0 - smoothstep(-soft, soft, d);
                    float rim = exp(-abs(d) / (3.5 + soft)) * 0.32 * (0.25 + t);
                    float halo = (1.0 - m) * exp(-max(d, 0.0) / (9.0 + soft)) * 0.38 * t;
                    float ptr = 1.0 + ptrGain * uPtrOn * 1.4 * exp(-dot(p - uPtr, p - uPtr) / (2.0 * 80.0 * 80.0));
                    vec3 rc = vec3(0.62, 0.35, 1.0);
                    return (col * (m + halo) + rc * rim) * ptr * (1.0 + uPulse * 0.6);
                }

                void main(){
                    vec2 p = vP;
                    vec3 c = uBg;
                    if (p.y <= uMirror) {
                        c += bowl(p, 1.5, 1.0);
                    } else {
                        float dist = p.y - uMirror;
                        vec2 q = vec2(p.x, 2.0 * uMirror - p.y);
                        float f = exp(-dist / uFade) * uGain * smoothstep(0.0, 16.0, dist);
                        c += bowl(q, 6.0 + dist * 0.14, 0.0) * f;
                    }
                    // ambient floor haze hugging the reflection line, brightest
                    // under the sphere and fading toward the widened side margins
                    float hz = exp(-pow((p.y - uMirror) / 22.0, 2.0));
                    float hx = exp(-pow((p.x - uC.x) / (uR * 2.8), 2.0));
                    c += vec3(0.30, 0.14, 0.75) * hz * (0.05 + 0.30 * hx);
                    // edge vignette so the extended frame reads as one composition
                    vec2 vq = (p - vec2(uC.x, 250.0)) / vec2(max(uL.x * 0.6, 1.0), 330.0);
                    c *= 1.0 - 0.40 * smoothstep(0.4, 1.3, length(vq));
                    c += (rnd(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.012; // film grain
                    gl_FragColor = vec4(c, 1.0);
                }
            `,
        });

        const bgGeo = new THREE.PlaneGeometry(1, 1);
        const bg = new THREE.Mesh(bgGeo, bgMat);
        bg.scale.set(S, S, 1);
        bg.position.set(S / 2, S / 2, 0);
        bg.frustumCulled = false;
        bg.renderOrder = -1;
        scene.add(bg);

        /* ---------- Streaks: particles travelling down meridians ---------- */
        const N = CFG.streaks;
        const SEG = CFG.segments;
        const lineA: number[] = [];
        const lineT: number[] = [];
        const ptA: number[] = [];
        const ptT: number[] = [];

        for (let k = 0; k < N; k++) {
            const phi = rand();
            const lam = rand();
            const seedVal = rand() * 100;
            const n = CFG.speedCycles[Math.floor(rand() * CFG.speedCycles.length)];
            const spd = (n * Math.PI) / CFG.loopSeconds;
            const len =
                CFG.trailLen[0] +
                Math.pow(rand(), 2) * (CFG.trailLen[1] - CFG.trailLen[0]);
            for (let i = 0; i < SEG; i++) {
                lineA.push(phi, lam, spd, len, phi, lam, spd, len);
                lineT.push(i / SEG, seedVal, (i + 1) / SEG, seedVal);
            }
            ptA.push(phi, lam, spd, len);
            ptT.push(0, seedVal);
        }

        for (let k = 0; k < CFG.sparks; k++) {
            const n = CFG.speedCycles[Math.floor(rand() * CFG.speedCycles.length)];
            ptA.push(rand(), rand(), ((n * Math.PI) / CFG.loopSeconds) * (0.5 + rand()), 0);
            ptT.push(0, 200 + rand() * 100);
        }

        const vert = `
            attribute vec4 aA;
            attribute vec2 aT;
            uniform float uPhase, uR, uPtrOn, uMirror, uFade, uGain, uSize, uPulse;
            uniform vec2 uC, uRot, uPtr;
            uniform float uRefl;
            varying float vA;
            const float PI = 3.14159265;

            float h(float n){
                return fract(sin(n * 91.345) * 47453.5453);
            }

            void main(){
                float base = aA.y * PI + uPhase * aA.z;
                float cyc = floor(base / PI);
                float uh = mod(base, PI);
                float phi = (aA.x + h(aT.y + cyc)) * 6.2831853; // new column every pass
                float lam = PI * 0.5 - max(uh - aT.x * aA.w, 0.0);
                vec3 P = uR * vec3(cos(lam) * cos(phi), sin(lam), cos(lam) * sin(phi));
                float ay = uRot.x, ax = uRot.y;
                P.xz = mat2(cos(ay), -sin(ay), sin(ay), cos(ay)) * P.xz;
                P.yz = mat2(cos(ax), -sin(ax), sin(ax), cos(ax)) * P.yz;
                vec2 s = vec2(uC.x + P.x, uC.y - P.y);
                float front = smoothstep(-0.4, 0.5, P.z / uR) * 0.7 + 0.3;
                float low = smoothstep(0.0, PI, uh);
                float tr = 1.0 - aT.x;
                float sp = h(aT.y * 3.1) * 0.7 + 0.3;
                float ptr = 1.0 + uPtrOn * 2.2 * exp(-dot(s - uPtr, s - uPtr) / (2.0 * 70.0 * 70.0));
                vA = tr * tr * front * smoothstep(0.0, 0.25, uh) * (1.0 - smoothstep(PI * 0.9, PI, uh)) * (0.25 + 0.95 * low) * sp * ptr * (1.0 + uPulse);
                if (uRefl > 0.5) {
                    s.y = 2.0 * uMirror - s.y;
                    float dist = s.y - uMirror;
                    vA *= exp(-dist / uFade) * uGain * 0.8 * smoothstep(0.0, 16.0, dist);
                }
                gl_PointSize = uSize;
                gl_Position = projectionMatrix * viewMatrix * vec4(s, 0.0, 1.0);
            }
        `;

        const frag = `
            precision highp float;
            varying float vA;
            uniform float uRound;

            void main(){
                if (uRound > 0.5) {
                    float r = length(gl_PointCoord - 0.5);
                    if (r > 0.5) discard;
                }
                float a = clamp(vA, 0.0, 1.5);
                vec3 col = mix(vec3(0.50, 0.30, 1.0), vec3(0.93, 0.85, 1.0), clamp(a, 0.0, 1.0));
                gl_FragColor = vec4(col * a, 1.0);
            }
        `;

        const disposables: { geo: THREE.BufferGeometry; mat: THREE.ShaderMaterial }[] = [];

        function buildMesh(refl: boolean, isPoints: boolean) {
            const g = new THREE.BufferGeometry();
            const A = isPoints ? ptA : lineA;
            const T = isPoints ? ptT : lineT;
            const cnt = A.length / 4;
            g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(cnt * 3), 3));
            g.setAttribute("aA", new THREE.BufferAttribute(new Float32Array(A), 4));
            g.setAttribute("aT", new THREE.BufferAttribute(new Float32Array(T), 2));
            const m = new THREE.ShaderMaterial({
                uniforms: Object.assign({}, U, {
                    uRefl: { value: refl ? 1 : 0 },
                    uRound: { value: isPoints ? 1 : 0 },
                }),
                vertexShader: vert,
                fragmentShader: frag,
                blending: THREE.AdditiveBlending,
                depthTest: false,
                depthWrite: false,
                transparent: true,
            });
            const obj = isPoints ? new THREE.Points(g, m) : new THREE.LineSegments(g, m);
            obj.frustumCulled = false;
            scene.add(obj);
            disposables.push({ geo: g, mat: m });
        }

        buildMesh(false, false);
        buildMesh(true, false);
        buildMesh(false, true);
        buildMesh(true, true);

        /* ---------- Ambient dust: starfield across the full logical frame ---------- */
        const NA = CFG.ambient;
        const dustPos = new Float32Array(NA * 3);
        const dustD = new Float32Array(NA * 3);
        for (let k = 0; k < NA; k++) {
            dustD[k * 3] = rand(); // x in [0,1] of the logical frame
            dustD[k * 3 + 1] = rand(); // y in [0,1]
            dustD[k * 3 + 2] = rand(); // seed
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
        dustGeo.setAttribute("aD", new THREE.BufferAttribute(dustD, 3));
        const dustMat = new THREE.ShaderMaterial({
            uniforms: Object.assign({}, U),
            vertexShader: `
                attribute vec3 aD;
                uniform vec2 uL, uC;
                uniform float uR, uTime, uDScale, uMotion;
                varying float vA;
                varying vec3 vCol;
                void main(){
                    // drift + sway are integer-period in uTime (which wraps at 100)
                    // so the motion stays seamless across the wrap
                    float y = fract(aD.y + uTime * 0.01 * uMotion);
                    float x = aD.x + sin(uTime * 0.06283 + aD.z * 40.0) * 0.004 * uMotion;
                    vec2 p = vec2(x * uL.x, y * uL.y);
                    float tw = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 0.06283 * (1.0 + floor(fract(aD.z * 7.31) * 3.0)) + aD.z * 60.0));
                    float core = mix(0.35, 1.0, smoothstep(uR * 0.7, uR * 1.3, distance(p, uC)));
                    float b = fract(aD.z * 13.7);
                    vA = (0.14 + 0.42 * b) * tw * core;
                    float hue = fract(aD.z * 3.77);
                    vCol = mix(vec3(0.50, 0.34, 1.0), vec3(0.80, 0.76, 1.0), hue);
                    if (hue > 0.85) vCol = vec3(0.40, 0.70, 1.0);
                    gl_PointSize = uDScale * (0.7 + fract(aD.z * 5.3) * 1.1);
                    gl_Position = projectionMatrix * viewMatrix * vec4(p, 0.0, 1.0);
                }
            `,
            fragmentShader: `
                precision highp float;
                varying float vA;
                varying vec3 vCol;
                void main(){
                    vec2 q = gl_PointCoord - 0.5;
                    float d = length(q);
                    if (d > 0.5) discard;
                    gl_FragColor = vec4(vCol * vA * smoothstep(0.5, 0.08, d), 1.0);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true,
        });
        const dust = new THREE.Points(dustGeo, dustMat);
        dust.frustumCulled = false;
        scene.add(dust);

        /* ---------- Layout & Sizing ---------- */
        // Full-bleed adaptive frame: the authored core is S logical units in its
        // short axis. px = CSS pixels per logical unit = min(w, h) / S, so the
        // core always fits exactly and the viewport extends past it along the
        // container's long axis (horizontally in landscape, vertically in
        // portrait) — never letterboxing. Landscape extends symmetrically via ox.
        const vp = { w: S, h: S, ox: 0, px: 1 };
        const resize = () => {
            if (!container) return;
            const w = container.clientWidth || 500;
            const h = container.clientHeight || 500;
            const px = Math.min(w, h) / S;
            vp.px = px;
            vp.w = w / px;
            vp.h = h / px;
            vp.ox = Math.max(0, (vp.w - S) / 2);
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            renderer.setPixelRatio(dpr);
            renderer.setSize(w, h, false);
            camera.left = 0;
            camera.right = vp.w;
            camera.top = 0;
            camera.bottom = vp.h;
            camera.updateProjectionMatrix();
            U.uC.value.set(vp.ox + CFG.center[0], CFG.center[1]);
            U.uL.value.set(vp.w, vp.h);
            U.uSize.value = Math.max(1.5, 2 * px) * dpr;
            U.uDScale.value = Math.max(1.2, 1.6 * px) * dpr;
            bg.scale.set(vp.w, vp.h, 1);
            bg.position.set(vp.w / 2, vp.h / 2, 0);
        };

        const ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        /* ---------- Mouse / Touch interaction ---------- */
        const tgt = { rx: 0, ry: 0, on: 0, boost: 1 };
        function toLocal(e: PointerEvent): [number, number] {
            const r = canvas.getBoundingClientRect();
            const px = r.width / vp.w || vp.px; // CSS pixels per logical unit
            return [
                (e.clientX - r.left) / px,
                (e.clientY - r.top) / px,
            ];
        }

        const onPointerMove = (e: PointerEvent) => {
            const [x, y] = toLocal(e);
            U.uPtr.value.set(x, y);
            tgt.rx = (x / vp.w - 0.5) * 2 * CFG.tilt[0];
            tgt.ry = (y / vp.h - 0.5) * 2 * CFG.tilt[1];
            const inside = x >= 0 && x <= vp.w && y >= 0 && y <= vp.h;
            tgt.on = inside ? 1 : 0;
            tgt.boost = inside ? 1.7 : 1;
        };

        const onPointerDown = () => {
            U.uPulse.value = 1;
        };

        const onPointerLeave = () => {
            tgt.on = 0;
            tgt.rx = 0;
            tgt.ry = 0;
            tgt.boost = 1;
        };

        container.addEventListener("pointermove", onPointerMove);
        container.addEventListener("pointerdown", onPointerDown);
        container.addEventListener("pointerleave", onPointerLeave);

        /* ---------- Animation Loop ---------- */
        let last = performance.now();
        let speedMul = 1;
        const tiltV = [0, 0];
        const tilt = [0, 0];
        let raf = 0;
        let disposed = false;

        function frame(now: number) {
            if (disposed) return;
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;

            speedMul += (tgt.boost - speedMul) * Math.min(1, dt * 4);

            // Critically damped spring toward target tilt
            for (const i of [0, 1]) {
                const t = i ? tgt.ry : tgt.rx;
                const k = 60;
                const c = 2 * Math.sqrt(k);
                tiltV[i] += (k * (t - tilt[i]) - c * tiltV[i]) * dt;
                tilt[i] += tiltV[i] * dt;
            }

            U.uRot.value.set(tilt[0], tilt[1]);
            U.uPtrOn.value += (tgt.on - U.uPtrOn.value) * Math.min(1, dt * 6);
            U.uPulse.value *= Math.exp(-dt * 3.2);

            const slow = reduced ? 0.25 : 1;
            U.uPhase.value += dt * speedMul * (1 + U.uPulse.value * 2.5) * slow;
            U.uTime.value = (U.uTime.value + dt) % 100;

            renderer.render(scene, camera);
            raf = requestAnimationFrame(frame);
        }

        raf = requestAnimationFrame(frame);

        /* Hint animation */
        const hintAnim = hintRef.current?.animate(
            [
                { opacity: 0 },
                { opacity: 0.7, offset: 0.2 },
                { opacity: 0.7, offset: 0.75 },
                { opacity: 0 },
            ],
            { duration: 5500, delay: 1000, fill: "forwards" }
        );

        /* ---------- Cleanup ---------- */
        return () => {
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            container.removeEventListener("pointermove", onPointerMove);
            container.removeEventListener("pointerdown", onPointerDown);
            container.removeEventListener("pointerleave", onPointerLeave);
            hintAnim?.cancel();

            bgGeo.dispose();
            bgMat.dispose();
            dustGeo.dispose();
            dustMat.dispose();
            for (const item of disposables) {
                item.geo.dispose();
                item.mat.dispose();
            }
            renderer.dispose();
        };
    }, [streaks, sparks, speed]);

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full min-h-[380px] flex items-center justify-center bg-[#05050a] select-none overflow-hidden touch-none cursor-crosshair ${className}`}
            style={style}
        >
            <canvas ref={canvasRef} className="block select-none" aria-hidden="true" />
            {showHint && (
                <p
                    ref={hintRef}
                    className="pointer-events-none absolute bottom-4 left-0 right-0 text-center text-xs uppercase tracking-[0.22em] text-[#c8b9ff]/60 opacity-0 select-none"
                    style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
                >
                    {hintText}
                </p>
            )}
        </div>
    );
};

export default StreakSphere;
