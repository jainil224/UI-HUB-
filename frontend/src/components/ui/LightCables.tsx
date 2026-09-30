// Light Cables — UI HUB

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MAX_DPR = 2

const MAX_CABLES = 48
const GRAIN = 0.012

const VERT_SRC = `
attribute vec2 a_pos;
void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
`

const FRAG_SRC = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;
uniform float uHover;
uniform vec3  uBg;
uniform vec3  uBase;
uniform vec3  uAccent;
uniform vec3  uHigh;
uniform float uCount;
uniform float uBend;
uniform float uSpread;
uniform float uWStart;
uniform float uWEnd;
uniform float uAxis;
uniform float uDir;
uniform float uPosX;
uniform float uPosY;
uniform float uThick;
uniform float uFlow;
uniform float uPulses;
uniform float uGrab;
uniform float uGrain;

float sat(float x) { return clamp(x, 0.0, 1.0); }

float h21(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 34.56);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = h21(i), b = h21(i + vec2(1.0, 0.0));
    float c = h21(i + vec2(0.0, 1.0)), d = h21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm5(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return s;
}

float fbm3(vec2 p) {
    float s = 0.0, a = 0.5;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.07 + vec2(4.1, 2.3); a *= 0.5; }
    return s;
}

void main() {
    float ar = uRes.x / max(uRes.y, 1.0);
    vec2 uv = gl_FragCoord.xy / uRes;
    vec2 p = (uv - 0.5) * vec2(ar, 1.0);
    float t = uTime;

    vec2 pAdj = p - vec2(uPosX * ar, uPosY) * 0.5;

    vec3 col = uBg;
    vec2 sm = p - vec2(-0.05, -0.28);
    col += uBase * exp(-pow(length(sm * vec2(0.75, 1.9)) / 0.42, 1.7)) * 0.50
         * (0.6 + 0.6 * fbm3(p * 2.4 + vec2(t * 0.05, 0.0)));

    float extent = mix(ar, 1.0, uAxis);
    float along = mix(pAdj.x, pAdj.y, uAxis) * uDir;
    float across = mix(pAdj.y, pAdj.x, uAxis);

    float s01 = sat((along + extent * 0.5) / max(extent, 0.001));
    vec2 ptrRaw = (uMouse - 0.5) * vec2(ar, 1.0);
    float ptrAlong = mix(ptrRaw.x, ptrRaw.y, uAxis) * uDir;
    float ptrAcross = mix(ptrRaw.y, ptrRaw.x, uAxis);

    float kAlong = -0.18;
    float kAcross = 0.10;
    vec3 acc = vec3(0.0);
    float surge = 0.0;

    for (int i = 0; i < 48; i++) {
        if (float(i) >= uCount) break;
        float fi = float(i) / max(uCount - 1.0, 1.0);
        float o = fi - 0.5;
        float rnd = h21(vec2(fi * 7.31, 2.0));

        float kAlongi = kAlong + o * 0.10 + (rnd - 0.5) * 0.03;
        float bi = uBend * (0.88 + 0.24 * rnd);
        float spread = uSpread * mix(uWStart, uWEnd, s01) * (0.090 + 0.34 * sat((along - kAlong) * 0.85 + 0.25));
        float bendAlong = sqrt((along - kAlongi) * (along - kAlongi) + 0.0035);
        float yy = kAcross + o * spread - bi * bendAlong + 0.008 * sin(along * 3.0 + fi * 19.0);

        float gx = exp(-pow((along - ptrAlong) / max(uGrab * 0.30, 0.02), 2.0));
        yy = mix(yy, ptrAcross + o * spread * 0.55, gx * 0.60 * uHover);

        float dd = (across - yy) / (uThick * 0.0038);
        float core = 1.0 / (1.0 + dd * dd * 9.0);
        float sheath = 1.0 / (1.0 + dd * dd * 0.6);

        float ph = s01 * uPulses - t * uFlow * 0.55 - rnd * 0.22;
        float f = fract(ph);
        float pulse = exp(-pow((f - 0.55) / 0.15, 2.0));
        float w = (0.22 + 1.60 * pulse) * (0.55 + 0.45 * rnd);

        acc += (uHigh * core * 1.45 + uAccent * sheath * 0.20) * w;
        surge += core * gx;
    }

    float feed = smoothstep(0.0, 0.09, s01) * smoothstep(1.02, 0.30, s01);
    col += acc * feed * 0.20;
    col += uHigh * surge * 0.05 * uHover;
    col += (h21(gl_FragCoord.xy + fract(uTime) * 71.0) - 0.5) * uGrain;

    gl_FragColor = vec4(max(col, 0.0), 1.0);
}
`

function parseColor(input: string | undefined, fb: [number, number, number]): [number, number, number] {
    if (!input) return fb
    const str = String(input).trim()
    if (str.charAt(0) === "#") {
        let hex = str.slice(1)
        if (hex.length === 3 || hex.length === 4) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        }
        if (hex.length >= 6) {
            const r = parseInt(hex.slice(0, 2), 16)
            const g = parseInt(hex.slice(2, 4), 16)
            const b = parseInt(hex.slice(4, 6), 16)
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r / 255, g / 255, b / 255]
        }
        return fb
    }
    const m = str.match(/[\d.]+/g)
    if (m && m.length >= 3) {
        return [
            Math.min(255, parseFloat(m[0])) / 255,
            Math.min(255, parseFloat(m[1])) / 255,
            Math.min(255, parseFloat(m[2])) / 255,
        ]
    }
    return fb
}

function num(v: unknown, fb: number): number {
    return typeof v === "number" && isFinite(v) ? v : fb
}

function clampN(v: number, lo: number, hi: number): number {
    return v < lo ? lo : v > hi ? hi : v
}

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error("LightCables shader:", gl.getShaderInfoLog(sh))
        gl.deleteShader(sh)
        return null
    }
    return sh
}

export type BundleGroup = { count?: number; bend?: number; spread?: number; thickness?: number; widthStart?: number; widthEnd?: number }
export const BUNDLE_DEFAULTS: Required<BundleGroup> = { count: 34, bend: 46, spread: 100, thickness: 100, widthStart: 100, widthEnd: 100 }
export type FlowGroup = { flow?: number; pulses?: number }
export const FLOW_DEFAULTS: Required<FlowGroup> = { flow: 100, pulses: 3 }

export type LightCablesProps = {
    style?: React.CSSProperties
    background?: string
    baseColor?: string
    accentColor?: string
    highlight?: string
    speed?: number
    hover?: number
    grab?: number
    direction?: "ltr" | "rtl" | "ttb" | "btt"
    positionX?: number
    positionY?: number
    bundle?: BundleGroup
    flow?: FlowGroup
    width?: number
    height?: number
}

function __UIHubBase_LightCables(props: LightCablesProps) {
    const {
        style,
        background = "#000000",
        baseColor = "#000000",
        accentColor = "#FF7500",
        highlight = "#FFD900",
        speed = 34,
        hover = 114,
        grab = 100,
        direction = "ttb",
        positionX = -13,
        positionY = -21,
        bundle,
        flow,
        width,
        height,
    } = props

    const bundle_ = { ...BUNDLE_DEFAULTS, ...(bundle || {}) }
    const flow_ = { ...FLOW_DEFAULTS, ...(flow || {}) }

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const sizeRef = useRef({ w: 0, h: 0 })
    sizeRef.current = { w: num(width, 0), h: num(height, 0) }

    const vRef = useRef<Record<string, number | string>>({})
    vRef.current = {
        bg: background,
        base: baseColor,
        accent: accentColor,
        high: highlight,
        speed: clampN(num(speed, 50), 0, 100) / 50,
        hover: clampN(num(hover, 100), 0, 200) / 100,
        count: Math.round(clampN(num(bundle_.count, 34), 4, MAX_CABLES)),
        bend: clampN(num(bundle_.bend, 46), 0, 150) / 100,
        spread: clampN(num(bundle_.spread, 100), 10, 300) / 100,
        thickness: clampN(num(bundle_.thickness, 100), 20, 400) / 100,
        wStart: clampN(num(bundle_.widthStart, 100), 0, 300) / 100,
        wEnd: clampN(num(bundle_.widthEnd, 100), 0, 300) / 100,
        flow: clampN(num(flow_.flow, 100), 0, 300) / 100,
        pulses: clampN(num(flow_.pulses, 3), 1, 12),
        grab: clampN(num(grab, 100), 10, 300) / 100,
        axis: direction === "ttb" || direction === "btt" ? 1 : 0,
        dir: direction === "rtl" || direction === "ttb" ? -1 : 1,
        posX: clampN(num(positionX, 0), -100, 100) / 100,
        posY: clampN(num(positionY, 0), -100, 100) / 100,
    }

    const ptrRef = useRef({ x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, onTarget: 0 })

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const gl = canvas.getContext("webgl", { antialias: false, alpha: false, depth: false })
        if (!gl) {
            console.error("LightCables: WebGL unavailable")
            return
        }

        const vs = compile(gl, gl.VERTEX_SHADER, VERT_SRC)
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG_SRC)
        if (!vs || !fs) return
        const prog = gl.createProgram()
        if (!prog) return
        gl.attachShader(prog, vs)
        gl.attachShader(prog, fs)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("LightCables link:", gl.getProgramInfoLog(prog))
            return
        }
        gl.useProgram(prog)

        const buf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buf)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
        const posLoc = gl.getAttribLocation(prog, "a_pos")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const locs: Record<string, WebGLUniformLocation | null> = {}
        const u = (name: string) => {
            if (!(name in locs)) locs[name] = gl.getUniformLocation(prog, name)
            return locs[name]
        }

        let raf = 0
        let last = performance.now()
        let clock = 0

        const render = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            const v = vRef.current

            clock = (clock + dt * (v.speed as number)) % 3600

            const ptr = ptrRef.current
            const k = 1 - Math.exp(-6 * dt)
            ptr.on += (ptr.onTarget - ptr.on) * k
            ptr.x += ((ptr.onTarget > 0 ? ptr.tx : 0.5) - ptr.x) * k
            ptr.y += ((ptr.onTarget > 0 ? ptr.ty : 0.5) - ptr.y) * k

            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
            const cw = sizeRef.current.w || canvas.clientWidth || 1200
            const ch = sizeRef.current.h || canvas.clientHeight || 800
            const bw = Math.max(1, Math.round(cw * dpr))
            const bh = Math.max(1, Math.round(ch * dpr))
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
            }
            gl.viewport(0, 0, bw, bh)

            gl.uniform2f(u("uRes"), bw, bh)
            gl.uniform1f(u("uTime"), clock)
            gl.uniform2f(u("uMouse"), ptr.x, 1 - ptr.y)
            gl.uniform1f(u("uHover"), Math.min(1, ptr.on) * (v.hover as number))
            const cg = parseColor(v.bg as string, [0.008, 0.024, 0.039])
            const cb = parseColor(v.base as string, [0.184, 0.659, 0.549])
            const ca = parseColor(v.accent as string, [0.373, 0.784, 0.863])
            const ch2 = parseColor(v.high as string, [0.918, 0.984, 1.0])
            gl.uniform3f(u("uBg"), cg[0], cg[1], cg[2])
            gl.uniform3f(u("uBase"), cb[0], cb[1], cb[2])
            gl.uniform3f(u("uAccent"), ca[0], ca[1], ca[2])
            gl.uniform3f(u("uHigh"), ch2[0], ch2[1], ch2[2])
            gl.uniform1f(u("uCount"), v.count as number)
            gl.uniform1f(u("uBend"), v.bend as number)
            gl.uniform1f(u("uSpread"), v.spread as number)
            gl.uniform1f(u("uWStart"), v.wStart as number)
            gl.uniform1f(u("uWEnd"), v.wEnd as number)
            gl.uniform1f(u("uAxis"), v.axis as number)
            gl.uniform1f(u("uDir"), v.dir as number)
            gl.uniform1f(u("uPosX"), v.posX as number)
            gl.uniform1f(u("uPosY"), v.posY as number)
            gl.uniform1f(u("uThick"), v.thickness as number)
            gl.uniform1f(u("uFlow"), v.flow as number)
            gl.uniform1f(u("uPulses"), v.pulses as number)
            gl.uniform1f(u("uGrab"), v.grab as number)
            gl.uniform1f(u("uGrain"), GRAIN)
            gl.drawArrays(gl.TRIANGLES, 0, 3)
            raf = requestAnimationFrame(render)
        }

        const track = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            ptrRef.current.tx = clampN((e.clientX - r.left) / r.width, 0, 1)
            ptrRef.current.ty = clampN((e.clientY - r.top) / r.height, 0, 1)
            ptrRef.current.onTarget = 1
        }
        const onLeave = () => {
            ptrRef.current.onTarget = 0
        }

        canvas.addEventListener("pointermove", track)
        canvas.addEventListener("pointerenter", track)
        canvas.addEventListener("pointerleave", onLeave)
        raf = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(raf)
            canvas.removeEventListener("pointermove", track)
            canvas.removeEventListener("pointerenter", track)
            canvas.removeEventListener("pointerleave", onLeave)
            gl.deleteProgram(prog)
            gl.deleteShader(vs)
            gl.deleteShader(fs)
            gl.deleteBuffer(buf)
        }
    }, [])

    return (
        <div
            style={{
                position: "relative",
                overflow: "hidden",
                background,
                width: typeof width === "number" && width > 0 ? width : "100%",
                height: typeof height === "number" && height > 0 ? height : "100%",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
            />
        </div>
    )
}

const __uihubPresetProps = {
  accentColor: "#EA53CD",
  highlight: "#D62EEB",
  bundle: {
    bend: 0,
    count: 48,
    spread: 89,
    widthEnd: 300,
    thickness: 220,
    widthStart: 0
  },
  flow: {
    flow: 300,
    pulses: 1
  }
};

export function LightCables(props: LightCablesProps) {
  return <__UIHubBase_LightCables {...__uihubPresetProps} {...props} />;
}

export default LightCables;
