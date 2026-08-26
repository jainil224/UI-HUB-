"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

/**
 * GRAVITATIONAL VORTEX — an accretion disc of motion-blurred streaks falling
 * into a funnel throat.
 *
 * ~20k streaks, each a two-triangle quad stretched along the direction its
 * particle is actually travelling. Every particle's position, velocity,
 * projection, streak extent, depth attenuation and colour are computed in the
 * vertex shader; the CPU uploads two seed buffers once and then only advances
 * two wrapped scalars per frame.
 */

/* ---------------------------------------------------------------- constants */

const TAU = Math.PI * 2
const MAX_PARTICLES = 40000
const MIN_PARTICLES = 2000
const CANVAS_FPS = 30
const FRAME_SLACK = 4
const DPR_CAP = 2

const RADIAL_AT_50 = 0.1
const SPIN_AT_50 = 0.15
const EXPOSURE = 1 / 90 + 0.51 / 12
const HOVER_RAMP = 0.45

const R_IN = 0.15
const R_OUT = 4.2
const Z_FLOOR = 2.5
const NEAR_PLANE = 0.6
const FOV = 45
const ROLL = -0.25
const FUNNEL_AT_100 = 4.5
const TWIST_AT_100 = 20.0
const DOT_RADIUS_AT_100 = 0.0051
const DIST_AT_100 = 6.2
const GLOW = "rgba(0,0,0,0)"
const ARMS = 5
const ARM_SPREAD = 0.85

/* ------------------------------------------------------------------ shaders */

const VS_SOURCE = `
precision highp float;

attribute vec3 aSeed;
attribute vec2 aCorner;

uniform float uPhase;
uniform float uSpin;
uniform float uDu;
uniform float uDSpin;
uniform float uTwist;
uniform float uFunnel;
uniform float uHalfWidth;
uniform float uTilt;
uniform float uOrbit;
uniform float uDist;
uniform float uFocal;
uniform float uAspect;
uniform float uAccentMix;
uniform vec2  uShift;

varying float vAlpha;
varying vec2  vCorner;
varying float vAcc;

#define TAU 6.28318530718
#define R_IN 0.15
#define R_OUT 4.2
#define Z_FLOOR 2.5
#define NEAR_PLANE 0.6
#define ROLL -0.25

float radiusOf(float u){ return mix(float(R_IN), float(R_OUT), clamp(u, 0.0, 1.0)); }

float spiralOf(float u){
    return uTwist * log((float(R_OUT) + 0.35) / (radiusOf(u) + 0.35));
}

vec3 surf(float u, float seedV, float spin){
    float uc = fract(u);
    float r  = radiusOf(uc);
    float a  = seedV * TAU + spiralOf(uc) + spin;
    float well = uFunnel / (r + 0.12);
    float z = float(Z_FLOOR) * (1.0 - exp(-well / float(Z_FLOOR))) - 0.6;
    return vec3(r * cos(a), r * sin(a), z);
}

mat3 rotX(float t){ float c = cos(t), s = sin(t); return mat3(1.0, 0.0, 0.0,  0.0, c, s,  0.0, -s, c); }
mat3 rotY(float t){ float c = cos(t), s = sin(t); return mat3(c, 0.0, -s,  0.0, 1.0, 0.0,  s, 0.0, c); }
mat3 rotZ(float t){ float c = cos(t), s = sin(t); return mat3(c, s, 0.0,  -s, c, 0.0,  0.0, 0.0, 1.0); }

void main(){
    vCorner = aCorner;
    vAcc = step(1.0 - uAccentMix, aSeed.z);

    float u0 = fract(aSeed.x - uPhase);

    vec3 p0 = surf(u0,        aSeed.y, uSpin);
    vec3 p1 = surf(u0 + uDu,  aSeed.y, uSpin + uDSpin);

    mat3 cam = rotX(1.5707963 - uTilt) * rotY(uOrbit) * rotZ(float(ROLL));
    vec3 pivot = vec3(0.0, 0.15, 0.0);
    vec3 e0 = cam * (p0 - pivot);
    vec3 e1 = cam * (p1 - pivot);

    float zd0 = e0.z + uDist;
    float zd1 = e1.z + uDist;

    if (zd0 < float(NEAR_PLANE) || zd1 < float(NEAR_PLANE)) {
        vAlpha = 0.0;
        gl_Position = vec4(2.0, 2.0, 0.0, 1.0);
        return;
    }

    vec2 sp0 = e0.xy * uFocal / zd0;
    vec2 sp1 = e1.xy * uFocal / zd1;

    vec2 d = sp1 - sp0;
    float len = length(d);
    vec2 tg = len > 1e-6 ? d / len : vec2(1.0, 0.0);
    vec2 nm = vec2(-tg.y, tg.x);

    float W = uHalfWidth * uFocal / zd0;
    float L = max(len, 2.0 * W);

    vec2 sp = sp0 + tg * (aCorner.y * L) + nm * (aCorner.x * W);
    vec2 ndc = vec2((sp.x - uShift.x) / uAspect, sp.y - uShift.y);

    gl_Position = vec4(ndc * zd0, 0.0, zd0);

    float edge = smoothstep(0.0, 0.20, u0) * (1.0 - smoothstep(0.62, 1.0, u0));
    float depthAtt = pow(clamp(uDist / zd0, 0.0, 1.0), 3.0);
    vAlpha = edge * mix(0.35, 1.0, aSeed.z) * mix(0.05, 1.0, depthAtt);
}
`

const FS_SOURCE = `
precision highp float;

uniform vec3 uBase;
uniform vec3 uAccent;

varying float vAlpha;
varying vec2  vCorner;
varying float vAcc;

void main(){
    float cd = abs(vCorner.x * 2.0);
    float glow = exp(-8.0 * cd * cd);
    float taper = smoothstep(0.0, 0.25, vCorner.y);

    float a = vAlpha * glow * taper;
    if (a < 0.004) discard;

    vec3 col = mix(uBase, uAccent, vAcc);
    gl_FragColor = vec4(col * a, a);
}
`

/* -------------------------------------------------------------- gl helpers */

function compileShader(
    gl: WebGLRenderingContext,
    type: number,
    src: string,
    label: string
): WebGLShader | null {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn(`GravitationalVortex ${label}:`, gl.getShaderInfoLog(sh))
        gl.deleteShader(sh)
        return null
    }
    return sh
}

function createProgram(gl: WebGLRenderingContext): WebGLProgram | null {
    const vs = compileShader(gl, gl.VERTEX_SHADER, VS_SOURCE, "vert")
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FS_SOURCE, "frag")
    if (!vs || !fs) return null
    const prog = gl.createProgram()
    if (!prog) return null
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    gl.deleteShader(vs)
    gl.deleteShader(fs)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        console.warn("GravitationalVortex link:", gl.getProgramInfoLog(prog))
        gl.deleteProgram(prog)
        return null
    }
    return prog
}

function eyeShift(
    tiltRad: number,
    orbitRad: number,
    dist: number,
    funnel: number,
    focal: number
): [number, number] {
    const well = funnel / (R_IN + 0.12)
    const z = Z_FLOOR * (1 - Math.exp(-well / Z_FLOOR)) - 0.6

    const px = 0
    const py = -0.15

    const cz = Math.cos(ROLL)
    const sz = Math.sin(ROLL)
    const x1 = cz * px - sz * py
    const y1 = sz * px + cz * py

    const cy = Math.cos(orbitRad)
    const sy = Math.sin(orbitRad)
    const x2 = cy * x1 + sy * z
    const z2 = -sy * x1 + cy * z

    const t = Math.PI / 2 - tiltRad
    const ct = Math.cos(t)
    const st = Math.sin(t)
    const ey = ct * y1 - st * z2
    const ez = st * y1 + ct * z2

    const zd = ez + dist
    if (!(zd >= NEAR_PLANE)) return [0, 0]
    return [(x2 * focal) / zd, (ey * focal) / zd]
}

function parseColor(input?: string): [number, number, number] {
    if (!input) return [1, 1, 1]
    const s = input.trim()
    if (s[0] === "#") {
        let h = s.slice(1)
        if (h.length === 3 || h.length === 4)
            h = h.split("").map((c) => c + c).join("")
        const n = parseInt(h.slice(0, 6), 16)
        if (isNaN(n)) return [1, 1, 1]
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }
    const m = s.match(/rgba?\(([^)]+)\)/i)
    if (m) {
        const p = m[1].split(",").map((x) => parseFloat(x))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    return [1, 1, 1]
}

/* -------------------------------------------------------------------- props */

type VortexGroup = { twist: number; funnel: number }

const VORTEX_DEFAULTS: VortexGroup = { twist: 13, funnel: 32 }

export interface GravitationalVortexProps {
    background?: string
    baseColor?: string
    accentColor?: string
    accentMix?: number
    density?: number
    dotSize?: number
    speed?: number
    direction?: "inward" | "outward"
    hoverSpeed?: number
    scale?: number
    tiltX?: number
    tiltY?: number
    vortex?: Partial<VortexGroup>
    backgroundColor?: string
    particleColor?: string
    vortexTwist?: number
    funnelDepth?: number
    width?: number
    height?: number
    style?: React.CSSProperties
}

/* ---------------------------------------------------------------- component */

export default function GravitationalVortex(props: GravitationalVortexProps) {
    const {
        background = "#000000",
        backgroundColor,
        baseColor = "#04FF3F",
        particleColor,
        accentColor = "#FCFF00",
        accentMix = 50,
        density = 16,
        dotSize = 400,
        speed = 16,
        direction = "inward",
        hoverSpeed = 100,
        scale = 79,
        tiltX = 35,
        tiltY = 0,
        vortex = { twist: 28, funnel: 54 },
        vortexTwist,
        funnelDepth,
        style,
    } = props

    const vx: VortexGroup = {
        ...VORTEX_DEFAULTS,
        ...(vortexTwist !== undefined ? { twist: vortexTwist } : {}),
        ...(funnelDepth !== undefined ? { funnel: funnelDepth } : {}),
        ...(vortex ?? {}),
    }

    const bgCss = background ?? backgroundColor ?? "#000000"
    const baseCss = baseColor ?? particleColor ?? "#ffffff"

    const hostRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const live = useRef({
        count: 0,
        speed,
        hoverSpeed,
        dir: 1,
        twist: vx.twist,
        funnel: vx.funnel,
        dotSize,
        tilt: tiltX,
        orbit: tiltY,
        distance: DIST_AT_100,
        accentMix,
        base: [1, 1, 1] as [number, number, number],
        accent: [1, 1, 1] as [number, number, number],
    })
    live.current = {
        count: Math.round(
            MIN_PARTICLES +
                (Math.min(100, Math.max(0, density)) / 100) *
                    (MAX_PARTICLES - MIN_PARTICLES)
        ),
        speed: Math.max(0, speed),
        hoverSpeed: Math.max(0, hoverSpeed),
        dir: direction === "outward" ? -1 : 1,
        twist: vx.twist,
        funnel: vx.funnel,
        dotSize,
        tilt: tiltX,
        orbit: tiltY,
        distance: (DIST_AT_100 * 100) / Math.max(1, scale),
        accentMix,
        base: parseColor(baseCss),
        accent: parseColor(accentColor),
    }

    useEffect(() => {
        const host = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            depth: false,
            powerPreference: "high-performance",
        }) as WebGLRenderingContext | null
        if (!gl) return

        const program = createProgram(gl)
        if (!program) return
        gl.useProgram(program)

        const aSeedLoc = gl.getAttribLocation(program, "aSeed")
        const aCornerLoc = gl.getAttribLocation(program, "aCorner")
        const U = (n: string) => gl.getUniformLocation(program, n)
        const u = {
            phase: U("uPhase"),
            spin: U("uSpin"),
            du: U("uDu"),
            dspin: U("uDSpin"),
            twist: U("uTwist"),
            funnel: U("uFunnel"),
            halfWidth: U("uHalfWidth"),
            tilt: U("uTilt"),
            orbit: U("uOrbit"),
            dist: U("uDist"),
            focal: U("uFocal"),
            aspect: U("uAspect"),
            accentMix: U("uAccentMix"),
            shift: U("uShift"),
            base: U("uBase"),
            accent: U("uAccent"),
        }

        const VERTS = 6
        const seeds = new Float32Array(MAX_PARTICLES * VERTS * 3)
        const corners = new Float32Array(MAX_PARTICLES * VERTS * 2)

        let s = 1337
        const rng = () => {
            s = (s * 16807) % 2147483647
            return (s - 1) / 2147483646
        }
        const QUAD = [
            [-0.5, 0.0], [0.5, 0.0], [-0.5, 1.0],
            [0.5, 0.0], [0.5, 1.0], [-0.5, 1.0],
        ]
        for (let i = 0; i < MAX_PARTICLES; i++) {
            const u0 = rng()
            const v0 = (Math.floor(rng() * ARMS) + (rng() - 0.5) * ARM_SPREAD) / ARMS
            const jit = rng()
            for (let k = 0; k < VERTS; k++) {
                const a = (i * VERTS + k) * 3
                seeds[a] = u0
                seeds[a + 1] = v0
                seeds[a + 2] = jit
                const c = (i * VERTS + k) * 2
                corners[c] = QUAD[k][0]
                corners[c + 1] = QUAD[k][1]
            }
        }

        const vboSeed = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, vboSeed)
        gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW)

        const vboCorner = gl.createBuffer()!
        gl.bindBuffer(gl.ARRAY_BUFFER, vboCorner)
        gl.bufferData(gl.ARRAY_BUFFER, corners, gl.STATIC_DRAW)

        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE)
        gl.clearColor(0, 0, 0, 0)

        const focal = 1 / Math.tan(((FOV * Math.PI) / 180) * 0.5)

        const hover = { on: false, k: 0 }
        const onEnter = () => { hover.on = true }
        const onLeave = () => { hover.on = false }
        host.addEventListener("pointerenter", onEnter)
        host.addEventListener("pointerleave", onLeave)
        host.addEventListener("pointercancel", onLeave)

        let raf = 0
        let lastDraw = 0
        let phase = 0
        let spin = 0

        const render = (now: number) => {
            raf = requestAnimationFrame(render)

            const onCanvas = false
            if (onCanvas && lastDraw && now - lastDraw < 1000 / CANVAS_FPS - FRAME_SLACK) return
            const dt = lastDraw ? Math.min(0.05, (now - lastDraw) / 1000) : 1 / 60
            lastDraw = now

            const L = live.current

            hover.k += ((hover.on ? 1 : 0) - hover.k) * (1 - Math.exp(-dt / HOVER_RAMP))

            const dial = L.speed + (L.hoverSpeed - L.speed) * hover.k
            const rate = (dial / 50) * RADIAL_AT_50 * L.dir
            const spinRate = (dial / 50) * SPIN_AT_50 * L.dir
            phase += dt * rate
            phase -= Math.floor(phase)
            spin += dt * spinRate
            spin -= Math.floor(spin / TAU) * TAU

            const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
            const cw = canvas.clientWidth || host.clientWidth || 0
            const ch = canvas.clientHeight || host.clientHeight || 0
            const w = Math.max(1, Math.floor(cw * dpr))
            const h = Math.max(1, Math.floor(ch * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            gl.viewport(0, 0, w, h)
            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.useProgram(program)
            gl.bindBuffer(gl.ARRAY_BUFFER, vboSeed)
            gl.enableVertexAttribArray(aSeedLoc)
            gl.vertexAttribPointer(aSeedLoc, 3, gl.FLOAT, false, 0, 0)
            gl.bindBuffer(gl.ARRAY_BUFFER, vboCorner)
            gl.enableVertexAttribArray(aCornerLoc)
            gl.vertexAttribPointer(aCornerLoc, 2, gl.FLOAT, false, 0, 0)

            gl.uniform1f(u.phase, phase)
            gl.uniform1f(u.spin, spin)
            gl.uniform1f(u.du, -rate * EXPOSURE)
            gl.uniform1f(u.dspin, spinRate * EXPOSURE)
            const funnel = (L.funnel / 100) * FUNNEL_AT_100
            const tiltRad = (L.tilt * Math.PI) / 180
            const orbitRad = (L.orbit * Math.PI) / 180
            const dist = Math.max(NEAR_PLANE + 1, L.distance)

            gl.uniform1f(u.twist, (L.twist / 100) * TWIST_AT_100)
            gl.uniform1f(u.funnel, funnel)
            gl.uniform1f(u.halfWidth, (L.dotSize / 100) * DOT_RADIUS_AT_100)
            gl.uniform1f(u.tilt, tiltRad)
            gl.uniform1f(u.orbit, orbitRad)
            gl.uniform1f(u.dist, dist)
            gl.uniform1f(u.focal, focal)
            gl.uniform1f(u.aspect, w / Math.max(1, h))
            gl.uniform1f(u.accentMix, L.accentMix / 100)
            const sh = eyeShift(tiltRad, orbitRad, dist, funnel, focal)
            gl.uniform2f(u.shift, sh[0], sh[1])
            gl.uniform3fv(u.base, L.base)
            gl.uniform3fv(u.accent, L.accent)

            gl.drawArrays(gl.TRIANGLES, 0, L.count * VERTS)
        }
        raf = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(raf)
            host.removeEventListener("pointerenter", onEnter)
            host.removeEventListener("pointerleave", onLeave)
            host.removeEventListener("pointercancel", onLeave)
            gl.deleteBuffer(vboSeed)
            gl.deleteBuffer(vboCorner)
            gl.deleteProgram(program)
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
                background: `radial-gradient(60% 50% at 50% 50%, ${GLOW} 0%, transparent 72%), ${bgCss}`,
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
