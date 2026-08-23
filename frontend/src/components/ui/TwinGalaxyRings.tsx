
// Twin Galaxy Rings

// UI HUB — Interactive Background

// Using component defaults.



import * as React from "react";

import { useEffect, useRef } from "react";

import { animate, motionValue } from "framer-motion";



type Motion = {

    type?: "spring" | "tween" | "keyframes" | "inertia";

    duration?: number;

    ease?: [number, number, number, number];

    delay?: number;

    stiffness?: number;

    damping?: number;

    mass?: number;

    bounce?: number;

    restSpeed?: number;

    restDelta?: number;

};



const DEFAULT_TRANSITION: Motion = {

    type: "tween",

    stiffness: 800,

    damping: 60,

    mass: 1,

    ease: [0.44, 0, 0.56, 1],

    delay: 0,

    duration: 0.8,

};



/* ---------------------------------------------------------------- constants */



const RMAX = 1560;

const FOV = 35;

const DPR_CAP = 1.5;

const TAU = Math.PI * 2;



/* ------------------------------------------------------------------ shaders */



const VERT = `

precision highp float;



attribute vec2 aPath;

attribute vec3 aOff;

attribute float aHue;



uniform vec2  uRes;

uniform float uFocal;

uniform float uStream;

uniform float uSpin;

uniform float uArms;

uniform float uB;

uniform float uThetaMax;

uniform float uRMin;

uniform float uArmW;

uniform float uArmH;

uniform float uDot;

uniform float uDist;

uniform float uPitchCam;

uniform float uRoll;

uniform vec3  uCols[8];

uniform float uCount;

uniform vec3  uCursor;

uniform float uCurR;

uniform float uCurS;

uniform float uHover;



varying vec3  vCol;

varying float vA;



void main() {

    float gIn = aOff.x;

    float gOut = aOff.y;

    float bsd = aOff.z;



    float p = fract(aPath.x + uStream);



    float th = p * uThetaMax;

    float r = uRMin * exp(uB * th);



    float a = th + aPath.y * (6.2831853 / uArms) + uSpin;

    float ca = cos(a);

    float sa = sin(a);



    float inv = 1.0 / sqrt(1.0 + uB * uB);

    vec2 nrm = vec2(-(uB * sa + ca), uB * ca - sa) * inv;



    vec2 pos = vec2(r * ca, r * sa) + nrm * gIn * uArmW * mix(0.40, 1.70, p);

    float y = gOut * uArmH;



    float cd = length(pos - uCursor.xy);

    float g = exp(-(cd * cd) / (uCurR * uCurR)) * uCursor.z;

    y += g * uCurS;



    float g2 = g * g; g2 = g2 * g2; g2 = g2 * g2;



    float c = cos(uPitchCam);

    float s = sin(uPitchCam);

    float ry = y * c + pos.y * s;

    float rz = uDist - y * s + pos.y * c;



    if (rz < 30.0) {

        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);

        gl_PointSize = 0.0;

        vCol = uCols[0];

        vA = 0.0;

        return;

    }



    float cr = cos(uRoll);

    float sr = sin(uRoll);

    float sx = (pos.x * cr - ry * sr) * uFocal / rz;

    float sy = (pos.x * sr + ry * cr) * uFocal / rz;

    gl_Position = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);



    float szv = 0.55 + bsd * 1.70;

    gl_PointSize = clamp(uDot * uFocal / rz * szv * (1.0 + g2 * uHover * 0.35),

                         1.0, 40.0);



    float fade = smoothstep(0.0, 0.10, p) * (1.0 - smoothstep(0.86, 1.0, p));



    float dep = 1.0 - smoothstep(uDist * 1.1, uDist * 2.1, rz) * 0.55;



    float bri = (0.32 + bsd * 0.68) * mix(1.30, 0.80, p);



    float cn = max(uCount, 1.0);

    float idx = min(floor(aHue * cn), cn - 1.0);

    vec3 pal = uCols[0];

    for (int i = 1; i < 8; i++) {

        if (abs(idx - float(i)) < 0.5) pal = uCols[i];

    }

    vCol = mix(pal, vec3(1.0), pow(bri, 5.0) * 0.55);

    vA = bri * fade * dep * (1.0 + g2 * uHover * 0.60);

}

`;



const FRAG = `

precision highp float;

varying vec3  vCol;

varying float vA;

void main() {

    gl_FragColor = vec4(vCol * vA, vA);

}

`;



/* ------------------------------------------------------------------- helpers */



function parseColor(input: string): [number, number, number] {

    if (!input) return [0, 0, 0];

    const s = input.trim();

    const fn = s.match(/rgba?\(([^)]+)\)/i);

    if (fn) {

        const p = fn[1].split(",").map((v) => parseFloat(v.trim()));

        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255];

    }

    let h = s.replace("#", "");

    if (h.length === 3 || h.length === 4) {

        h = h

            .split("")

            .map((c) => c + c)

            .join("");

    }

    h = h.padEnd(6, "0");

    return [

        parseInt(h.slice(0, 2), 16) / 255,

        parseInt(h.slice(2, 4), 16) / 255,

        parseInt(h.slice(4, 6), 16) / 255,

    ];

}



function mulberry32(a: number) {

    return function () {

        a |= 0;

        a = (a + 0x6d2b79f5) | 0;

        let t = Math.imul(a ^ (a >>> 15), 1 | a);

        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;

    };

}



function gauss(rnd: () => number) {

    const u1 = Math.max(1e-9, rnd());

    const u2 = rnd();

    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2);

    return Math.max(-3, Math.min(3, g));

}



function compile(gl: WebGLRenderingContext, type: number, src: string) {

    const sh = gl.createShader(type)!;

    gl.shaderSource(sh, src);

    gl.compileShader(sh);

    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {

        console.warn("TwinGalaxyRings shader:", gl.getShaderInfoLog(sh));

    }

    return sh;

}



/* --------------------------------------------------------------------- props */



interface TiltGroup {

    tilt: number;

    sideTilt: number;

}



const ARM_W_AT_100 = 34;

const ARM_H_AT_100 = 16;

const LIFT_REF = 90;

const GLOW_AT_REF = 120;

const PRESS_BOOST_AT_REF = 4;

const PRESS_ZOOM_AT_REF = 22;



const SPIN = 0;

const CURSOR_RADIUS = 22;

const CURSOR_LIFT = 90;

const GLOW = "rgba(120, 150, 210, 0.10)";

const ARM_PITCH = 9;

const STREAM_AT_50 = 8;



const MAX_POINTS = 400000;



const MAX_COLORS = 8;

const DEFAULT_COLORS = ["#A050FF", "#C9D6E8"];



interface Props {

    background?: string;

    colors?: string[];

    density?: number;

    dotSize?: number;

    speed?: number;

    hoverSpeed?: number;

    direction?: "ccw" | "cw";

    distance?: number;

    innerVoid?: number;

    armThickness?: number;

    armCount?: number;

    tilt?: Partial<TiltGroup>;

    transition?: Motion;

    style?: React.CSSProperties;

}



/* ----------------------------------------------------------------- component */



export default function TwinGalaxyRings(props: Props) {

    const {

        background = "#050A14",

        colors = DEFAULT_COLORS,

        density = 98,

        dotSize = 2,

        speed = 47,

        hoverSpeed = 85,

        direction = "cw",

        distance = 3540,

        innerVoid = 14,

        armThickness = 100,

        armCount = 5,

        tilt = { tilt: 26, sideTilt: -8 },

        transition = DEFAULT_TRANSITION,

        style,

    } = props;



    const hoverMV = useRef(motionValue(0)).current;

    const pressMV = useRef(motionValue(0)).current;

    const transitionRef = useRef(transition);

    transitionRef.current = transition;



    const palette =

        colors && colors.length ? colors.slice(0, MAX_COLORS) : DEFAULT_COLORS;



    const speedDial = Math.max(0, speed);

    const hoverSpeedDial = Math.max(0, hoverSpeed);

    const dirSign = direction === "cw" ? -1 : 1;

    const spin = SPIN;

    const cameraDistance = distance;



    const armPitch = ARM_PITCH;



    const tiltStart = tilt.tilt ?? 26;

    const rollStart = tilt.sideTilt ?? -8;

    const cursorRadius = CURSOR_RADIUS;

    const cursorLift = CURSOR_LIFT;



    const armW = (ARM_W_AT_100 * armThickness) / 100;

    const armH = (ARM_H_AT_100 * armThickness) / 100;

    const tiltEnd = tiltStart;

    const rollEnd = rollStart;

    const cs = Math.min(3, Math.abs(cursorLift) / LIFT_REF);

    const hoverGlow = GLOW_AT_REF * cs;

    const pressBoost = 1 + (PRESS_BOOST_AT_REF - 1) * cs;

    const pressZoom = Math.min(60, PRESS_ZOOM_AT_REF * cs);



    const hostRef = useRef<HTMLDivElement>(null);

    const canvasRef = useRef<HTMLCanvasElement>(null);



    const live = useRef({

        palette,

        density,

        dotSize,

        armWidth: armW,

        armHeight: armH,

        armCount,

        armPitch,

        innerVoid,

        speedDial,

        hoverSpeedDial,

        dirSign,

        spin,

        cameraDistance,

        tiltStart,

        tiltEnd,

        rollStart,

        rollEnd,

        cursorRadius,

        cursorLift,

        hoverGlow,

        pressBoost,

        pressZoom,

    });

    live.current = {

        palette,

        density,

        dotSize,

        armWidth: armW,

        armHeight: armH,

        armCount,

        armPitch,

        innerVoid,

        speedDial,

        hoverSpeedDial,

        dirSign,

        spin,

        cameraDistance,

        tiltStart,

        tiltEnd,

        rollStart,

        rollEnd,

        cursorRadius,

        cursorLift,

        hoverGlow,

        pressBoost,

        pressZoom,

    };



    const pointer = useRef({

        x: 0,

        y: 0,

        active: 0,

        target: 0,

        press: 0,

        pressTarget: 0,

    });



    useEffect(() => {

        const host = hostRef.current;

        const canvas = canvasRef.current;

        if (!host || !canvas) return;



        const gl = canvas.getContext("webgl", {

            alpha: true,

            antialias: false,

            premultipliedAlpha: true,

            depth: false,

        }) as WebGLRenderingContext | null;

        if (!gl) return;



        const prog = gl.createProgram()!;

        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));

        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));

        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {

            console.warn("TwinGalaxyRings link:", gl.getProgramInfoLog(prog));

            return;

        }

        gl.useProgram(prog);



        const aPath = gl.getAttribLocation(prog, "aPath");

        const aOff = gl.getAttribLocation(prog, "aOff");

        const aHue = gl.getAttribLocation(prog, "aHue");

        const U = (n: string) => gl.getUniformLocation(prog, n);

        const u = {

            res: U("uRes"),

            focal: U("uFocal"),

            stream: U("uStream"),

            spin: U("uSpin"),

            arms: U("uArms"),

            b: U("uB"),

            thetaMax: U("uThetaMax"),

            rMin: U("uRMin"),

            armW: U("uArmW"),

            armH: U("uArmH"),

            dot: U("uDot"),

            dist: U("uDist"),

            pitchCam: U("uPitchCam"),

            roll: U("uRoll"),

            cols: U("uCols[0]"),

            colCount: U("uCount"),

            cursor: U("uCursor"),

            curR: U("uCurR"),

            curS: U("uCurS"),

            hover: U("uHover"),

        };



        const pathBuf = gl.createBuffer()!;

        const offBuf = gl.createBuffer()!;

        const hueBuf = gl.createBuffer()!;



        const colBuf = new Float32Array(MAX_COLORS * 3);

        let colKey = "";

        let colCount = 1;

        const uploadPalette = (list: string[]) => {

            const key = list.join("|");

            if (key === colKey) return;

            colKey = key;

            colCount = Math.max(1, Math.min(MAX_COLORS, list.length));

            for (let i = 0; i < MAX_COLORS; i++) {

                const [r, g, b] = parseColor(list[Math.min(i, colCount - 1)]);

                colBuf[i * 3] = r;

                colBuf[i * 3 + 1] = g;

                colBuf[i * 3 + 2] = b;

            }

        };



        let builtKey = "";

        let count = 0;



        const buildArms = (d: number, arms: number) => {

            const nArms = Math.max(1, Math.round(arms));

            const across = 8;

            const samples = Math.max(

                24,

                Math.min(

                    Math.round(d * 8),

                    Math.floor(MAX_POINTS / (nArms * across))

                )

            );

            count = nArms * samples * across;



            const pathA = new Float32Array(count * 2);

            const offA = new Float32Array(count * 3);

            const hueA = new Float32Array(count);

            const rnd = mulberry32(0x9a1a1);

            let i = 0;

            for (let arm = 0; arm < nArms; arm++) {

                for (let sIdx = 0; sIdx < samples; sIdx++) {

                    const p = sIdx / samples;

                    for (let k = 0; k < across; k++) {

                        pathA[i * 2] = p;

                        pathA[i * 2 + 1] = arm;

                        offA[i * 3] = gauss(rnd);

                        offA[i * 3 + 1] = gauss(rnd);

                        offA[i * 3 + 2] = rnd();

                        hueA[i] = rnd();

                        i++;

                    }

                }

            }

            gl.bindBuffer(gl.ARRAY_BUFFER, pathBuf);

            gl.bufferData(gl.ARRAY_BUFFER, pathA, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, offBuf);

            gl.bufferData(gl.ARRAY_BUFFER, offA, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, hueBuf);

            gl.bufferData(gl.ARRAY_BUFFER, hueA, gl.STATIC_DRAW);

            builtKey = `${d}|${arms}`;

        };



        gl.disable(gl.DEPTH_TEST);

        gl.enable(gl.BLEND);

        gl.blendFunc(gl.ONE, gl.ONE);



        let cssW = 0;

        let cssH = 0;

        let dpr = 1;

        const resize = () => {

            dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);

            cssW = canvas.clientWidth || host.clientWidth || 0;

            cssH = canvas.clientHeight || host.clientHeight || 0;

            const w = Math.max(1, Math.round(cssW * dpr));

            const h = Math.max(1, Math.round(cssH * dpr));

            if (canvas.width !== w || canvas.height !== h) {

                canvas.width = w;

                canvas.height = h;

            }

            gl.viewport(0, 0, w, h);

        };

        resize();

        const ro = new ResizeObserver(resize);

        ro.observe(canvas);



        let hoverAnim: { stop: () => void } | null = null;

        let pressAnim: { stop: () => void } | null = null;

        const gateHover = (to: number) => {

            if (pointer.current.target === to) return;

            pointer.current.target = to;

            hoverAnim?.stop();

            hoverAnim = animate(hoverMV, to, transitionRef.current);

        };

        const gatePress = (to: number) => {

            if (pointer.current.pressTarget === to) return;

            pointer.current.pressTarget = to;

            pressAnim?.stop();

            pressAnim = animate(pressMV, to, transitionRef.current);

        };

        const onMove = (e: PointerEvent) => {

            const r = host.getBoundingClientRect();

            pointer.current.x = e.clientX - r.left;

            pointer.current.y = e.clientY - r.top;

            gateHover(1);

        };

        const onLeave = () => {

            gateHover(0);

            gatePress(0);

        };

        const onDown = () => gatePress(1);

        const onUp = () => gatePress(0);

        host.addEventListener("pointermove", onMove);

        host.addEventListener("pointerleave", onLeave);

        host.addEventListener("pointerdown", onDown);

        host.addEventListener("pointercancel", onUp);

        window.addEventListener("pointerup", onUp);



        const scrollProgress = () => {

            const r = host.getBoundingClientRect();

            const vh = window.innerHeight || 1;

            const span = r.height + vh;

            if (span <= 0) return 0;

            const p = (vh - r.top) / span;

            return p < 0 ? 0 : p > 1 ? 1 : p;

        };



        let raf = 0;

        let last = performance.now();

        let stream = 0;

        let spinPhase = 0;



        const planeHit = (

            mx: number,

            my: number,

            wDev: number,

            hDev: number,

            focal: number,

            pitch: number,

            roll: number,

            dist: number

        ) => {

            const px = mx * dpr - wDev / 2;

            const py = -(my * dpr - hDev / 2);

            const cr = Math.cos(roll);

            const sr = Math.sin(roll);

            const sx = px * cr + py * sr;

            const sy = -px * sr + py * cr;

            const dx = sx / focal;

            const dy = sy / focal;

            const c = Math.cos(pitch);

            const s = Math.sin(pitch);

            const wy = dy * c - s;

            const wz = dy * s + c;

            if (wy > -1e-4) return null;

            const t = (-dist * s) / wy;

            return { x: dx * t, z: -dist * c + wz * t };

        };



        const frame = (now: number) => {

            raf = requestAnimationFrame(frame);

            const dt = Math.min((now - last) / 1000, 0.05);

            last = now;



            if (cssW <= 0 || cssH <= 0) {

                resize();

                if (cssW <= 0 || cssH <= 0) return;

            }



            const L = live.current;

            const key = `${L.density}|${L.armCount}`;

            if (key !== builtKey) buildArms(L.density, L.armCount);

            if (count === 0) return;



            const p = pointer.current;

            p.active = hoverMV.get();

            p.press = pressMV.get();



            const pressMul = 1 + p.press * (Math.max(1, L.pressBoost) - 1);

            const zoomMul = 1 - p.press * (L.pressZoom / 100);



            const dial =

                L.speedDial + (L.hoverSpeedDial - L.speedDial) * p.active;

            const rate = ((dial / 50) * STREAM_AT_50 * L.dirSign) / 100;



            stream = (stream + dt * rate * pressMul) % 1;

            spinPhase = (spinPhase + dt * ((L.spin * Math.PI) / 180)) % TAU;



            const prog01 = scrollProgress();



            const pitch =

                ((L.tiltStart + (L.tiltEnd - L.tiltStart) * prog01) * Math.PI) /

                180;

            const roll =

                (-(L.rollStart + (L.rollEnd - L.rollStart) * prog01) *

                    Math.PI) /

                180;

            const minDist = RMAX * Math.cos(pitch) + 400;

            const dist = Math.max(minDist, L.cameraDistance * zoomMul);



            const b = Math.max(0.02, Math.tan((L.armPitch * Math.PI) / 180));

            const voidFrac = Math.min(0.9, Math.max(0.01, L.innerVoid / 100));

            const thetaMax = Math.min(Math.log(1 / voidFrac) / b, 24 * Math.PI);

            const rMin = RMAX * Math.exp(-b * thetaMax);



            const wDev = canvas.width;

            const hDev = canvas.height;

            const focal = hDev / (2 * Math.tan(((FOV / 2) * Math.PI) / 180));



            let hx = 0;

            let hz = -1e7;

            if (p.active > 0.001) {

                const hit = planeHit(

                    p.x,

                    p.y,

                    wDev,

                    hDev,

                    focal,

                    pitch,

                    roll,

                    dist

                );

                if (hit) {

                    hx = hit.x;

                    hz = hit.z;

                }

            }



            uploadPalette(L.palette);



            gl.uniform2f(u.res, wDev, hDev);

            gl.uniform1f(u.focal, focal);

            gl.uniform1f(u.stream, stream);

            gl.uniform1f(u.spin, spinPhase);

            gl.uniform1f(u.arms, Math.max(1, Math.round(L.armCount)));

            gl.uniform1f(u.b, b);

            gl.uniform1f(u.thetaMax, thetaMax);

            gl.uniform1f(u.rMin, rMin);

            gl.uniform1f(u.armW, L.armWidth);

            gl.uniform1f(u.armH, L.armHeight);

            gl.uniform1f(u.dot, L.dotSize);

            gl.uniform1f(u.dist, dist);

            gl.uniform1f(u.pitchCam, pitch);

            gl.uniform1f(u.roll, roll);

            gl.uniform3fv(u.cols, colBuf);

            gl.uniform1f(u.colCount, colCount);

            gl.uniform3f(u.cursor, hx, hz, p.active);

            gl.uniform1f(u.curR, Math.max(1, (L.cursorRadius / 100) * RMAX));

            gl.uniform1f(u.curS, L.cursorLift);

            gl.uniform1f(u.hover, L.hoverGlow / 100);



            gl.bindBuffer(gl.ARRAY_BUFFER, pathBuf);

            gl.enableVertexAttribArray(aPath);

            gl.vertexAttribPointer(aPath, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, offBuf);

            gl.enableVertexAttribArray(aOff);

            gl.vertexAttribPointer(aOff, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, hueBuf);

            gl.enableVertexAttribArray(aHue);

            gl.vertexAttribPointer(aHue, 1, gl.FLOAT, false, 0, 0);



            gl.clearColor(0, 0, 0, 0);

            gl.clear(gl.COLOR_BUFFER_BIT);

            gl.drawArrays(gl.POINTS, 0, count);

        };

        raf = requestAnimationFrame(frame);



        return () => {

            cancelAnimationFrame(raf);

            ro.disconnect();

            hoverAnim?.stop();

            pressAnim?.stop();

            host.removeEventListener("pointermove", onMove);

            host.removeEventListener("pointerleave", onLeave);

            host.removeEventListener("pointerdown", onDown);

            host.removeEventListener("pointercancel", onUp);

            window.removeEventListener("pointerup", onUp);

        };

    }, []);



    return (

        <div

            ref={hostRef}

            style={{

                minWidth: 1200,

                minHeight: 800,

                width: "100%",

                height: "100%",

                position: "relative",

                overflow: "hidden",

                background: `radial-gradient(46% 40% at 6% 4%, ${GLOW} 0%, transparent 72%), radial-gradient(52% 44% at 96% 6%, ${GLOW} 0%, transparent 74%), radial-gradient(44% 38% at 92% 96%, ${GLOW} 0%, transparent 72%), ${background}`,

                ...style,

            }}

        >

            <canvas

                ref={canvasRef}

                style={{

                    position: "absolute",

                    inset: 0,

                    width: "100%",

                    height: "100%",

                    display: "block",

                }}

            />

        </div>

    );

}

