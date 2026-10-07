// hexa-sphere — UI HUB
// A hollow sphere of thousands of thin hexagonal tiles on a pure black background.
// The bottom glows ice-blue, the top stays almost black, and a glowing wave band of
// tiles lifts and tilts as it travels up and down the sphere. Drag for a full 360°
// trackball spin with inertia, hover to light tiles, scroll to move the wave.
//
// Original source: standalone HTML (Three.js r128 UMD + Tailwind 4 CDN). Ported to
// React with `three` (already installed). Geometry math and both GLSL shaders are
// kept byte-for-byte from the reference implementation.

import * as React from "react";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./HexaSphere.css";

export interface HexaSphereSettings {
    /** Whether the wave band travels automatically. */
    auto: boolean;
    /** Wave band position on the sphere (slider: -1..1). */
    level: number;
    /** Wave travel speed (slider: 0.05..2). */
    speed: number;
    /** Wave lift power (slider: 0..1.6). */
    amp: number;
    /** Wave frame: sphere (true) or screen (false). */
    lock?: boolean;
}

export interface HexaSphereProps {
    /** Optional class applied to the root container. */
    className?: string;
    /** Whether to show the bottom wave-control panel (default true). */
    showControls?: boolean;
    /** Emits the current Wave / Speed / Power (and Auto) settings whenever the
     *  user tweaks them in the control panel, so a host page can persist the
     *  customized values into the code / vibe prompt. */
    onSettingsChange?: (settings: HexaSphereSettings) => void;
}

export const HexaSphere: React.FC<HexaSphereProps> = ({
    className = "",
    showControls = true,
    onSettingsChange,
}) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const ringRef = useRef<HTMLDivElement>(null);
    const lvlRef = useRef<HTMLInputElement>(null);
    const spdRef = useRef<HTMLInputElement>(null);
    const ampRef = useRef<HTMLInputElement>(null);
    const autoRef = useRef<HTMLButtonElement>(null);
    const lockRef = useRef<HTMLButtonElement>(null);
    const settingsRef = useRef(onSettingsChange);
    settingsRef.current = onSettingsChange;

    useEffect(() => {
        const stage = stageRef.current;
        if (!stage) return;
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        /* ---- renderer ---- */
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000);
        stage.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
        camera.position.z = 4.6;

        /* ---- hexasphere: dual of a subdivided icosahedron ---- */
        const t = (1 + Math.sqrt(5)) / 2;
        let V = [
            [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t],
            [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
        ].map((v) => new THREE.Vector3(v[0], v[1], v[2]).normalize());
        let F = [
            [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9],
            [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2],
            [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10],
            [8, 6, 7], [9, 8, 1],
        ];
        for (let s = 0; s < 4; s++) {
            const cache: Record<string, number> = {}, nf: number[][] = [];
            const mid = (a: number, b: number) => {
                const k = a < b ? a + "_" + b : b + "_" + a;
                if (cache[k] === undefined) {
                    cache[k] = V.length;
                    V.push(V[a].clone().add(V[b]).normalize());
                }
                return cache[k];
            };
            for (const [a, b, d] of F) {
                const ab = mid(a, b), bc = mid(b, d), da = mid(d, a);
                nf.push([a, ab, da], [b, bc, ab], [d, da, bc], [ab, bc, da]);
            }
            F = nf;
        }
        const adj: number[][] = V.map(() => []);
        const cen = F.map(([a, b, c], i: number) => {
            [a, b, c].forEach((v: number) => adj[v].push(i));
            return V[a].clone().add(V[b]).add(V[c]).normalize();
        });

        const P: number[] = [], C: number[] = [], N: number[] = [], H = 0.07;
        const add = (p: THREE.Vector3, c: THREE.Vector3, n: THREE.Vector3) => {
            P.push(p.x, p.y, p.z); C.push(c.x, c.y, c.z); N.push(n.x, n.y, n.z);
        };
        V.forEach((c: THREE.Vector3, vi: number) => {
            const flat = Math.abs(c.y) < 0.99;
            const u = new THREE.Vector3(flat ? 0 : 1, flat ? 1 : 0, 0).cross(c).normalize();
            const w = c.clone().cross(u);
            const ring = adj[vi]
                .map((i) => cen[i])
                .sort(
                    (a, b) =>
                        Math.atan2(a.dot(w), a.dot(u)) - Math.atan2(b.dot(w), b.dot(u))
                )
                .map((p) => c.clone().lerp(p, 0.88).normalize());
            const top = c.clone().multiplyScalar(1 + H);
            for (let i = 0; i < ring.length; i++) {
                const a = ring[i], b = ring[(i + 1) % ring.length];
                const at = a.clone().multiplyScalar(1 + H), bt = b.clone().multiplyScalar(1 + H);
                add(top, c, c);
                add(at, c, c);
                add(bt, c, c);
                const sn = a.clone().add(b).multiplyScalar(0.5).sub(c).normalize();
                [a, b, bt, a, bt, at].forEach((p) => add(p, c, sn));
            }
        });
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
        geo.setAttribute("aCenter", new THREE.Float32BufferAttribute(C, 3));
        geo.setAttribute("aNormal", new THREE.Float32BufferAttribute(N, 3));

        const mat = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uEdge: { value: -0.5 },
                uMouse: { value: new THREE.Vector3() },
                uMouseOn: { value: 0 },
                uAmp: { value: 1 },
                uLocal: { value: 1 },
                uRot: { value: new THREE.Matrix3() },
            },
            vertexShader: `
    uniform float uTime,uEdge,uMouseOn,uAmp,uLocal; uniform vec3 uMouse; uniform mat3 uRot;
    attribute vec3 aCenter; attribute vec3 aNormal;
    varying vec3 vN; varying float vLit,vBand,vM,vH;
    vec3 rotv(vec3 v,vec3 k,float a){return v*cos(a)+cross(k,v)*sin(a)+k*dot(k,v)*(1.-cos(a));}
    void main(){
      vec3 aC=uRot*aCenter, pos=uRot*position, an=uRot*aNormal;
      vec3 wc=mix(aC,aCenter,uLocal);
      vH=fract(sin(dot(aCenter,vec3(12.9898,78.233,37.719)))*43758.5453);
      float d=wc.y-uEdge+sin(wc.x*9.+uTime)*.025+sin(wc.z*11.-uTime*.7)*.025;
      float band=exp(-d*d*55.);
      float m=uMouseOn*smoothstep(.75,0.,distance(aC,uMouse));
      float ang=band*.95*uAmp+m*1.1, lift=band*.08*uAmp+m*.18;
      vec3 k=normalize(cross(vec3(0.,1.,0.),aC)+vec3(1e-4));
      vec3 p=aC+rotv(pos-aC,k,ang)+aC*lift;
      vLit=1.-smoothstep(-.06,.1,d); vBand=band*uAmp; vM=m;
      vN=mat3(viewMatrix)*rotv(an,k,ang);
      gl_Position=projectionMatrix*viewMatrix*vec4(p,1.);
    }`,
            fragmentShader: `
    varying vec3 vN; varying float vLit,vBand,vM,vH;
    void main(){
      vec3 n=normalize(vN); float back=gl_FrontFacing?1.:.22; if(!gl_FrontFacing) n=-n;
      vec3 L=normalize(vec3(0.,-.85,.55));
      float diff=max(dot(n,L),0.);
      float rim=pow(1.-abs(n.z),2.5);
      vec3 dark=vec3(.015,.03,.05)+vec3(.12,.25,.42)*rim*.7;
      vec3 lit=mix(vec3(.12,.38,.78),vec3(.55,.92,1.),diff)*(.3+.95*diff);
      vec3 col=mix(dark,lit,vLit);
      col+=vec3(.2,.55,1.)*vBand*(.15+diff*.6);
      col+=vec3(.25,.65,1.)*vM*(.25+diff*.8);
      col*=.65+.7*vH; col+=vec3(.02,.05,.1)*vH*(1.-vLit);
      gl_FragColor=vec4(col*back,1.);
    }`,
        });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.frustumCulled = false;
        scene.add(sphere);
        const hit = new THREE.Mesh(
            new THREE.SphereGeometry(1.05, 32, 32),
            new THREE.MeshBasicMaterial({ visible: false })
        );
        scene.add(hit);

        const ray = new THREE.Raycaster(), ptr = new THREE.Vector2(-9, -9);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25, 0, 0));
        const qd = new THREE.Quaternion();
        const M4 = new THREE.Matrix4(), vel = { x: 0, y: 0 };
        const ax = new THREE.Vector3();
        const cv = renderer.domElement;
        const ring = ringRef.current;
        let dragging = false, last = { x: 0, y: 0 }, pulse = 0, on = 0;
        let edge = -0.2, phase = 0;
        const W = { auto: true, level: -0.2, speed: 0.42, amp: 1 };

        // Coalesce reports into one animation frame: a single slider drag fires
        // several `input` events per frame, and each report re-renders the host
        // page (code tab + vibe prompt). One coalesced update per frame keeps the
        // preview responsive instead of stuttering under the slider.
        let reportRaf = 0;
        let pendingLock: boolean | undefined;
        const report = (lock?: boolean) => {
            if (lock !== undefined) pendingLock = lock;
            if (reportRaf) return;
            reportRaf = requestAnimationFrame(() => {
                reportRaf = 0;
                const l = pendingLock;
                pendingLock = undefined;
                settingsRef.current?.({
                    auto: W.auto,
                    level: W.level,
                    speed: W.speed,
                    amp: W.amp,
                    lock: l,
                });
            });
        };

        const rotate = (dx: number, dy: number) => {
            const a = Math.hypot(dx, dy) * 0.011;
            if (!a) return;
            qd.setFromAxisAngle(ax.set(dy, dx, 0).normalize(), a);
            q.premultiply(qd);
        };

        const toLocal = (clientX: number, clientY: number) => {
            const r = stage.getBoundingClientRect();
            return { x: clientX - r.left, y: clientY - r.top };
        };

        const setAuto = (v: boolean, silent = false) => {
            W.auto = v;
            if (autoRef.current) autoRef.current.textContent = "Auto: " + (v ? "on" : "off");
            if (v) phase = Math.asin(Math.max(-1, Math.min(1, (edge + 0.2) / 0.55)));
            if (!silent) report();
        };

        const onPointerDown = (e: PointerEvent) => {
            dragging = true;
            last = { x: e.clientX, y: e.clientY };
            vel.x = vel.y = 0;
            cv.setPointerCapture(e.pointerId);
            pulse = 1;
        };
        const onPointerUp = () => { dragging = false; };
        const onPointerMove = (e: PointerEvent) => {
            const r = stage.getBoundingClientRect();
            ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2) + 1);
            const rel = toLocal(e.clientX, e.clientY);
            if (ring) ring.style.transform = `translate(${rel.x}px,${rel.y}px) translate(-50%,-50%)`;
            if (dragging) {
                vel.x = e.clientX - last.x;
                vel.y = e.clientY - last.y;
                last = { x: e.clientX, y: e.clientY };
                rotate(vel.x, vel.y);
            }
        };
        const onPointerLeave = () => {
            ptr.set(-9, -9);
        };

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            setAuto(false);
            W.level = Math.max(-1, Math.min(1, edge - e.deltaY * 0.001));
            if (lvlRef.current) lvlRef.current.value = String(W.level);
            report();
        };

        const onInput = (obj: { key: "level" | "speed" | "amp" }, e: Event) => {
            // Silent: turning Auto off must not report on its own, otherwise the
            // Wave slider emits two updates for one gesture and the host page
            // re-renders twice per event.
            if (obj.key === "level") setAuto(false, true);
            W[obj.key] = Number((e.target as HTMLInputElement).value);
            report();
        };

        const onAutoClick = () => setAuto(!W.auto);
        const onLockClick = () => {
            const u = mat.uniforms.uLocal;
            u.value = u.value ? 0 : 1;
            if (lockRef.current) lockRef.current.textContent = "Wave: " + (u.value ? "sphere" : "screen");
            report(u.value ? true : false);
        };

        const onLvlInput = (e: Event) => onInput({ key: "level" }, e);
        const onSpdInput = (e: Event) => onInput({ key: "speed" }, e);
        const onAmpInput = (e: Event) => onInput({ key: "amp" }, e);

        cv.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointermove", onPointerMove);
        document.addEventListener("pointerleave", onPointerLeave);
        cv.addEventListener("wheel", onWheel, { passive: false });
        if (showControls) {
            lvlRef.current?.addEventListener("input", onLvlInput);
            spdRef.current?.addEventListener("input", onSpdInput);
            ampRef.current?.addEventListener("input", onAmpInput);
            autoRef.current?.addEventListener("click", onAutoClick);
            lockRef.current?.addEventListener("click", onLockClick);
        }

        const resize = () => {
            const w = stage.clientWidth || window.innerWidth;
            const h = stage.clientHeight || window.innerHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            camera.aspect = w / h;
            camera.position.z = w / h < 0.8 ? 7.2 : 4.6;
            camera.updateProjectionMatrix();
        };
        window.addEventListener("resize", resize);
        const ro = new ResizeObserver(resize);
        ro.observe(stage);
        resize();

        const clock = new THREE.Clock(), M3 = mat.uniforms.uRot.value;
        let raf = 0;
        const loop = () => {
            raf = requestAnimationFrame(loop);
            const dt = Math.min(clock.getDelta(), 0.05);
            mat.uniforms.uTime.value += dt;
            if (!dragging) {
                if (Math.hypot(vel.x, vel.y) > 0.05) {
                    rotate(vel.x, vel.y);
                    vel.x *= 0.95;
                    vel.y *= 0.95;
                } else if (!reduceMotion) {
                    rotate(0.15, 0);
                }
            }
            M3.setFromMatrix4(M4.makeRotationFromQuaternion(q));
            if (W.auto) {
                phase += dt * W.speed;
                W.level = -0.2 + 0.55 * Math.sin(phase);
                if (lvlRef.current) lvlRef.current.value = String(W.level);
            }
            edge += (W.level - edge) * 0.12;
            mat.uniforms.uEdge.value = edge;
            pulse *= 0.93;
            mat.uniforms.uAmp.value = W.amp * (1 + pulse * 0.6);
            ray.setFromCamera(ptr, camera);
            const h = ray.intersectObject(hit)[0];
            if (h) mat.uniforms.uMouse.value.copy(h.point).normalize();
            on += ((h ? 1 : 0) - on) * 0.1;
            mat.uniforms.uMouseOn.value = on;
            if (ring) {
                ring.style.opacity = h ? "1" : "0";
                ring.style.width = ring.style.height = dragging ? "4.5rem" : "6rem";
            }
            cv.style.cursor = dragging ? "grabbing" : h ? "grab" : "default";

            renderer.render(scene, camera);
        };
        loop();

        return () => {
            cancelAnimationFrame(raf);
            if (reportRaf) { cancelAnimationFrame(reportRaf); reportRaf = 0; }
            window.removeEventListener("resize", resize);
            ro.disconnect();
            cv.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointermove", onPointerMove);
            document.removeEventListener("pointerleave", onPointerLeave);
            cv.removeEventListener("wheel", onWheel);
            if (showControls) {
                lvlRef.current?.removeEventListener("input", onLvlInput);
                spdRef.current?.removeEventListener("input", onSpdInput);
                ampRef.current?.removeEventListener("input", onAmpInput);
                autoRef.current?.removeEventListener("click", onAutoClick);
                lockRef.current?.removeEventListener("click", onLockClick);
            }
            geo.dispose();
            mat.dispose();
            renderer.dispose();
            if (cv.parentNode === stage) stage.removeChild(cv);
        };
    }, [showControls]);

    return (
        <div
            ref={stageRef}
            className={"hx-stage" + (className ? " " + className : "")}
        >
            {showControls && (
                <div
                    className="hx-panel hx-fade"
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <label className="flex items-center gap-2">
                        Wave{" "}
                        <input
                            ref={lvlRef}
                            type="range"
                            min="-1"
                            max="1"
                            step="0.01"
                            defaultValue="-0.2"
                            className="hx-lvl flex-1 min-w-0 accent-sky-400"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        Speed{" "}
                        <input
                            ref={spdRef}
                            type="range"
                            min="0.05"
                            max="2"
                            step="0.01"
                            defaultValue="0.42"
                            className="hx-spd flex-1 min-w-0 accent-sky-400"
                        />
                    </label>
                    <label className="flex items-center gap-2">
                        Power{" "}
                        <input
                            ref={ampRef}
                            type="range"
                            min="0"
                            max="1.6"
                            step="0.01"
                            defaultValue="1"
                            className="hx-amp flex-1 min-w-0 accent-sky-400"
                        />
                    </label>
                    <button
                        ref={autoRef}
                        type="button"
                        className="rounded-full border border-sky-300/40 px-3 py-1 text-sky-200 transition hover:bg-sky-400/20"
                    >
                        Auto: on
                    </button>
                    <button
                        ref={lockRef}
                        type="button"
                        className="rounded-full border border-sky-300/40 px-3 py-1 text-sky-200 transition hover:bg-sky-400/20"
                    >
                        Wave: sphere
                    </button>
                    <p className="w-full text-center text-[10px] text-sky-100/35 normal-case tracking-wider">
                        Drag anywhere to turn it 360&deg; &middot; scroll to move the wave &middot; hover to light tiles
                    </p>
                </div>
            )}

            <div
                ref={ringRef}
                aria-hidden="true"
                className="pointer-events-none absolute top-0 left-0 z-10 size-24 rounded-full border border-sky-300/70 opacity-0 shadow-[0_0_30px_rgba(80,170,255,.45),inset_0_0_20px_rgba(80,170,255,.25)] transition-[opacity,width,height] duration-300"
            />
        </div>
    );
};

export default HexaSphere;