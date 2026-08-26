"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { animate, motionValue } from "motion/react"

type Motion = {
    type?: "spring" | "tween" | "keyframes" | "inertia"
    duration?: number
    ease?: [number, number, number, number]
    delay?: number
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
    restSpeed?: number
    restDelta?: number
}

const DEFAULT_TRANSITION: Motion = {
    type: "spring",
    stiffness: 90,
    damping: 18,
    mass: 1,
}

const TAU = Math.PI * 2
const PETAL_LEN = 520
const CORE_R = 85
const FOV = 34
const DPR_CAP = 1.5
const BASE_DISTANCE = 2080
const PETAL_PER_DENSITY = 1400
const CORE_SHARE = 0.1
const STEM_SHARE = 0.26
const DOT_AT_100 = 2.4
const WIND_AT_50 = 1
const SCATTER = 9
const ROLL = 0
const STAGGER = 0.55

const VERT = `
precision highp float;

attribute vec4 aA;
attribute vec4 aB;

uniform vec2  uRes;
uniform float uFocal;
uniform float uDist;
uniform float uPitch;
uniform float uRoll;
uniform float uTime;
uniform float uDot;
uniform float uBloom;
uniform float uStagger;
uniform float uPetalLen;
uniform float uPetals;
uniform float uCoreR;
uniform float uScatter;
uniform vec3  uBase;
uniform vec3  uStem;
uniform vec3  uAccent;
uniform float uAccentMix;

varying vec3  vCol;
varying float vA;

#define PI  3.14159265
#define TAU 6.28318530

const float TH0_BUD  = 0.10;
const float TH0_OPEN = 0.42;
const float TH1_BUD  = 0.28;
const float TH1_OPEN = 1.55;

const float BUD_SCALE = 0.45;
const float BUD_LEN   = 0.72;
const float CUP       = 0.42;
const float FLUTTER   = 0.055;
const float PETAL_FILL = 0.72;

const float ATTACH_Y  = 40.0;
const float STEM_LEN  = 3000.0;
const float STEM_R    = 24.0;
const float SWAY      = 26.0;

float whorlBloom(float ln) {
    float sp = uStagger * 0.7;
    float lo = ln * sp;
    float hi = lo + (1.0 - sp);
    return smoothstep(lo, hi, uBloom);
}

vec2 swayAt(float t) {
    float amp = SWAY * (1.0 - t) * (1.0 - t);
    float ph  = uTime * 0.55 - t * 1.2;
    return vec2(sin(ph), sin(ph * 0.83 + 1.7)) * amp;
}

void main() {
    float kind = aB.z;
    float jit  = aB.x;

    float S = mix(BUD_SCALE, 1.0, uBloom) * (1.0 + sin(uTime * 0.9) * 0.012);

    vec3  P;
    vec3  col;
    float bri;
    float szv = 0.55 + jit * 1.1;

    if (kind < 0.5) {
        float u   = aA.x;
        float v   = aA.y;
        float phi = aA.z;
        float ln  = aA.w;

        float b     = whorlBloom(ln);
        float inner = 1.0 - ln * 0.32;

        float th0 = mix(TH0_BUD, TH0_OPEN, b) * (0.70 + 0.30 * inner);
        float th1 = mix(TH1_BUD, TH1_OPEN * inner, b);
        th1 += sin(uTime * 1.7 + aA.z * 3.0 + ln * 2.4) * FLUTTER;

        float L = uPetalLen * (0.42 + 0.58 * inner) * mix(BUD_LEN, 1.0, b);
        float s = u * L;

        float k   = (th1 - th0) / max(L, 1.0);
        float x   = k * s * 0.5;
        float sc  = abs(x) < 1e-4 ? 1.0 : sin(x) / x;
        float mid = th0 + x;
        float R   = s * sin(mid) * sc;
        float H   = s * cos(mid) * sc;
        float th  = th0 + k * s;

        vec3 rh = vec3(cos(phi), 0.0, sin(phi));
        vec3 tt = vec3(-sin(phi), 0.0, cos(phi));
        vec3 nh = rh * cos(th) - vec3(0.0, 1.0, 0.0) * sin(th);

        float wp = pow(max(sin(PI * pow(u, 0.85)), 0.0), 0.55);
        float radial = uCoreR * 1.10 + R;
        float halfW  = wp * PETAL_FILL * (PI / max(uPetals, 3.0)) * radial;

        P = rh * radial
          + vec3(0.0, H, 0.0)
          + tt * (v * halfW)
          - nh * (CUP * halfW * v * v)
          + nh * (aB.y * uScatter * (0.35 + wp));

        float tip  = smoothstep(0.55, 1.0, u);
        float rim  = smoothstep(0.55, 1.0, abs(v));
        float mixA = clamp(
            uAccentMix * (0.35 + tip * 0.80 + rim * 0.50)
            + step(jit, uAccentMix) * 0.25,
            0.0, 1.0);
        col = mix(uBase, uAccent, mixA);
        bri = (0.35 + jit * 0.50) * (0.55 + wp * 0.55) * (0.75 + b * 0.45);
        bri *= smoothstep(0.0, 0.22, u);
    } else if (kind < 1.5) {
        float cr = aA.x;
        float ca = aA.y;
        float el = aA.z * PI * 0.5;

        float rad = uCoreR * (0.30 + 0.70 * cr) * mix(0.72, 1.0, uBloom);
        P = vec3(cos(ca) * cos(el), sin(el) * 0.85, sin(ca) * cos(el)) * rad;
        P.y += uCoreR * 0.12;

        col = mix(uAccent, vec3(1.0), 0.35 * jit);
        bri = (0.50 + jit * 0.55) * (0.50 + uBloom * 0.60);
        szv *= 0.85;
    } else {
        float t   = aA.x;
        float az  = aA.y;
        float rr  = aA.z;
        float rad = STEM_R * (0.55 + 0.45 * t);
        vec2  sw  = swayAt(t);

        P = vec3(cos(az) * rr * rad + sw.x,
                 -t * STEM_LEN,
                 sin(az) * rr * rad + sw.y);

        col = uStem;
        bri = (0.30 + jit * 0.35) * (0.70 + 0.40 * (1.0 - t));
        bri *= 1.0 - smoothstep(0.62, 1.0, t);
        szv *= 0.75;
    }

    if (kind < 1.5) bri *= pow(S, 1.05);

    if (kind < 1.5) {
        P *= S;
        P.xz += swayAt(0.0);
    }
    P.y += ATTACH_Y;

    float c  = cos(uPitch);
    float sp = sin(uPitch);
    float ry = P.y * c + P.z * sp;
    float rz = uDist - P.y * sp + P.z * c;

    if (rz < 30.0) {
        gl_Position  = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        vA   = 0.0;
        vCol = uBase;
        return;
    }

    float cr = cos(uRoll);
    float sr = sin(uRoll);
    float sx = (P.x * cr - ry * sr) * uFocal / rz;
    float sy = (P.x * sr + ry * cr) * uFocal / rz;
    gl_Position  = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);
    gl_PointSize = clamp(uDot * uFocal / rz * szv, 1.0, 26.0);

    float dep = 1.0 - 0.50 * smoothstep(uDist * 0.55, uDist * 1.50, rz);

    vCol = col;
    vA   = clamp(bri * dep, 0.0, 3.0);
}
`

const FRAG = `
precision highp float;
varying vec3  vCol;
varying float vA;
void main() {
    vec2  c = gl_PointCoord - 0.5;
    float d = length(c) * 2.0;
    float a = vA * (1.0 - smoothstep(0.5, 1.0, d));
    gl_FragColor = vec4(vCol * a, a);
}
`

function parseColor(input: string): [number, number, number] {
    if (!input) return [0, 0, 0]
    const s = input.trim()
    const fn = s.match(/rgba?\(([^)]+)\)/i)
    if (fn) {
        const p = fn[1].split(",").map((v) => parseFloat(v.trim()))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    let h = s.replace("#", "")
    if (h.length === 3 || h.length === 4)
        h = h.split("").map((c) => c + c).join("")
    h = h.padEnd(6, "0")
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ]
}

function mulberry32(a: number) {
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function gauss(rnd: () => number) {
    const u1 = Math.max(1e-9, rnd())
    const u2 = rnd()
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2)
    return Math.max(-3, Math.min(3, g))
}

function sampleU(rnd: () => number) {
    for (let i = 0; i < 24; i++) {
        const u = rnd()
        const w = Math.pow(Math.max(0, Math.sin(Math.PI * Math.pow(u, 0.85))), 0.55)
        if (rnd() < w) return u
    }
    return rnd()
}

function compile(
    gl: WebGLRenderingContext,
    type: number,
    src: string,
    tag: string
) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("BloomingFlower shader " + tag + ":", gl.getShaderInfoLog(sh))
    }
    return sh
}

interface FlowerGroup {
    petals: number
    layers: number
}

interface Props {
    background?: string
    baseColor?: string
    stemColor?: string
    accentColor?: string
    accentMix?: number
    density?: number
    dotSize?: number
    speed?: number
    distance?: number
    tilt?: number
    flower?: Partial<FlowerGroup>
    closed?: number
    bloom?: { closed?: number; stagger?: number }
    transition?: Motion
    width?: number
    height?: number
    style?: React.CSSProperties
}

export default function BloomingFlower(props: Props) {
    const {
        background = "#07060C",
        baseColor = "#C4327E",
        stemColor = "#2F7A4F",
        accentColor = "#FFD98A",
        accentMix = 100,
        density: densityInput = 100,
        dotSize = 10,
        speed = 50,
        distance = 2820,
        tilt = 66,
        flower = { petals: 16, layers: 1 },
        bloom,
        transition = { ease: [0.44, 0, 0.56, 1], mass: 1, type: "tween", delay: 0, damping: 60, duration: 0.4, stiffness: 800 },
        style,
    } = props

    const density = Number.isFinite(densityInput)
        ? Math.max(1, Math.min(100, densityInput))
        : 100

    const { petals = 16, layers = 1 } = flower
    const closed = props.closed ?? bloom?.closed ?? 100

    const gateMV = useRef(motionValue(0)).current
    const transitionRef = useRef(transition)
    transitionRef.current = transition

    const windRate = (Math.max(0, speed) / 50) * WIND_AT_50
    const dotWorld = (Math.max(1, dotSize) / 100) * DOT_AT_100
    const closedAmt = Math.max(0, Math.min(100, closed)) / 100

    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const live = useRef({
        base: parseColor(baseColor),
        stem: parseColor(stemColor),
        accent: parseColor(accentColor),
        accentMix: Math.max(0, Math.min(100, accentMix)) / 100,
        density,
        dotWorld,
        windRate,
        distance,
        tilt,
        petals,
        layers,
        closedAmt,
    })
    live.current = {
        base: parseColor(baseColor),
        stem: parseColor(stemColor),
        accent: parseColor(accentColor),
        accentMix: Math.max(0, Math.min(100, accentMix)) / 100,
        density,
        dotWorld,
        windRate,
        distance,
        tilt,
        petals,
        layers,
        closedAmt,
    }

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            depth: false,
        }) as WebGLRenderingContext | null
        if (!gl) return

        const prog = gl.createProgram()!
        gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT, "vert"))
        gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG, "frag"))
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.warn("BloomingFlower link:", gl.getProgramInfoLog(prog))
            return
        }
        gl.useProgram(prog)

        const aA = gl.getAttribLocation(prog, "aA")
        const aB = gl.getAttribLocation(prog, "aB")
        const U = (n: string) => gl.getUniformLocation(prog, n)
        const u = {
            res: U("uRes"),
            focal: U("uFocal"),
            dist: U("uDist"),
            pitch: U("uPitch"),
            roll: U("uRoll"),
            time: U("uTime"),
            dot: U("uDot"),
            bloom: U("uBloom"),
            stagger: U("uStagger"),
            petalLen: U("uPetalLen"),
            petals: U("uPetals"),
            coreR: U("uCoreR"),
            scatter: U("uScatter"),
            base: U("uBase"),
            stem: U("uStem"),
            accent: U("uAccent"),
            accentMix: U("uAccentMix"),
        }

        const buf = gl.createBuffer()!
        let count = 0
        let builtKey = ""

        const build = (d: number, nPetals: number, nLayers: number) => {
            const P = Math.max(3, Math.round(nPetals))
            const LN = Math.max(1, Math.round(nLayers))

            const petalTotal = Math.max(600, Math.round(d * PETAL_PER_DENSITY))
            const coreTotal = Math.round(petalTotal * CORE_SHARE)
            const stemTotal = Math.round(petalTotal * STEM_SHARE)
            const petalHeadroom = P * LN
            const total = petalTotal + petalHeadroom + coreTotal + stemTotal

            const data = new Float32Array(total * 8)
            const rnd = mulberry32(0x5eed10f)
            let p = 0
            const push = (
                a0: number, a1: number, a2: number, a3: number,
                b0: number, b1: number, b2: number, b3: number
            ) => {
                const o = p * 8
                data[o] = a0; data[o + 1] = a1; data[o + 2] = a2; data[o + 3] = a3
                data[o + 4] = b0; data[o + 5] = b1; data[o + 6] = b2; data[o + 7] = b3
                p++
            }

            const weights: number[] = []
            let wSum = 0
            for (let l = 0; l < LN; l++) {
                const w = 1 - (l / Math.max(1, LN)) * 0.45
                weights.push(w)
                wSum += w
            }

            for (let l = 0; l < LN; l++) {
                const ln = LN === 1 ? 0 : l / (LN - 1)
                const offset = (l * Math.PI) / P
                const perLayer = Math.round((petalTotal * weights[l]) / wSum)
                const perPetal = Math.max(1, Math.round(perLayer / P))
                for (let k = 0; k < P; k++) {
                    const phi = offset + (k * TAU) / P
                    for (let i = 0; i < perPetal; i++) {
                        push(
                            sampleU(rnd),
                            rnd() * 2 - 1,
                            phi,
                            ln,
                            rnd(),
                            gauss(rnd),
                            0,
                            0
                        )
                    }
                }
            }

            for (let i = 0; i < coreTotal; i++) {
                push(
                    Math.cbrt(rnd()),
                    rnd() * TAU,
                    rnd(),
                    0,
                    rnd(),
                    0,
                    1,
                    0
                )
            }

            for (let i = 0; i < stemTotal; i++) {
                push(rnd(), rnd() * TAU, Math.pow(rnd(), 0.4), 0, rnd(), 0, 2, 0)
            }

            count = p
            gl.bindBuffer(gl.ARRAY_BUFFER, buf)
            gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, p * 8), gl.STATIC_DRAW)
            builtKey = `${d}|${P}|${LN}`
        }

        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE)

        let cssW = 0, cssH = 0, dpr = 1
        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
            cssW = canvas.clientWidth || host.clientWidth || 0
            cssH = canvas.clientHeight || host.clientHeight || 0
            const w = Math.max(1, Math.round(cssW * dpr))
            const h = Math.max(1, Math.round(cssH * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            gl.viewport(0, 0, w, h)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        let gate = 0
        let gateAnim: { stop: () => void } | null = null
        const gateTo = (to: number) => {
            if (gate === to) return
            gate = to
            gateAnim?.stop()
            gateAnim = animate(gateMV, to, transitionRef.current)
        }
        const onEnter = () => gateTo(1)
        const onLeave = () => gateTo(0)
        host.addEventListener("pointerenter", onEnter)
        host.addEventListener("pointerleave", onLeave)

        let raf = 0
        let last = performance.now()
        let time = 0

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now

            if (cssW <= 0 || cssH <= 0) {
                resize()
                if (cssW <= 0 || cssH <= 0) return
            }

            const L = live.current
            const key = `${L.density}|${Math.max(3, Math.round(L.petals))}|${Math.max(1, Math.round(L.layers))}`
            if (key !== builtKey) build(L.density, L.petals, L.layers)
            if (count === 0) return

            time = (time + dt * L.windRate) % 3600

            const bloomAmt = 1 - L.closedAmt * (1 - gateMV.get())

            const wDev = canvas.width
            const hDev = canvas.height
            const focal = hDev / (2 * Math.tan(((FOV / 2) * Math.PI) / 180))

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.useProgram(prog)
            gl.uniform2f(u.res, wDev, hDev)
            gl.uniform1f(u.focal, focal)
            gl.uniform1f(u.dist, Math.max(400, L.distance))
            gl.uniform1f(u.pitch, (L.tilt * Math.PI) / 180)
            gl.uniform1f(u.roll, ROLL)
            gl.uniform1f(u.time, time)
            gl.uniform1f(u.dot, L.dotWorld)
            gl.uniform1f(u.bloom, bloomAmt)
            gl.uniform1f(u.stagger, STAGGER)
            gl.uniform1f(u.petalLen, PETAL_LEN)
            gl.uniform1f(u.petals, Math.max(3, Math.round(L.petals)))
            gl.uniform1f(u.coreR, CORE_R)
            gl.uniform1f(u.scatter, SCATTER)
            gl.uniform3f(u.base, L.base[0], L.base[1], L.base[2])
            gl.uniform3f(u.stem, L.stem[0], L.stem[1], L.stem[2])
            gl.uniform3f(u.accent, L.accent[0], L.accent[1], L.accent[2])
            gl.uniform1f(u.accentMix, L.accentMix)

            gl.bindBuffer(gl.ARRAY_BUFFER, buf)
            gl.enableVertexAttribArray(aA)
            gl.vertexAttribPointer(aA, 4, gl.FLOAT, false, 32, 0)
            gl.enableVertexAttribArray(aB)
            gl.vertexAttribPointer(aB, 4, gl.FLOAT, false, 32, 16)

            gl.drawArrays(gl.POINTS, 0, count)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            gateAnim?.stop()
            host.removeEventListener("pointerenter", onEnter)
            host.removeEventListener("pointerleave", onLeave)
        }
    }, [])

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
                background,
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
    )
}
