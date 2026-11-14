// Earth — UI HUB

"use client"

import { useEffect, useRef, useState } from "react"
import type { CSSProperties } from "react"

export interface EarthLook {
    clouds: number

    lights: number

    atmosphere: string
}

export interface EarthProps {
    map?: string | { src?: string }
    background?: string

    stars?: number

    size?: number
    look?: Partial<EarthLook>

    drag?: boolean

    hover?: number

    sun?: "fixed" | "cursor"

    sunAngle?: number

    daylight?: number

    speed?: number
    style?: CSSProperties
}

const DEFAULTS = {
    background: "#02040A",
    stars: 5,
    drag: true,
    hover: 6.8,
    sun: "cursor",
    sunAngle: 181,
    daylight: 87,
    speed: 9.4,
}
const DEFAULT_LOOK: EarthLook = { clouds: 5, lights: 5, atmosphere: "#4F9BFF" }

const ASSETS = "https://unpkg.com/three-globe@2.31.0/example/"
const DAY_SRC = ASSETS + "img/earth-blue-marble.jpg"
const NIGHT_SRC = ASSETS + "img/earth-night.jpg"
const WATER_SRC = ASSETS + "img/earth-water.png"
const TOPO_SRC = ASSETS + "img/earth-topology.png"
const CLOUD_SRC = ASSETS + "clouds/clouds.png"
const TEX_W = 2048
const TEX_H = 1024
const NIGHT_W = 4096
const AXIAL_TILT = (23.44 * Math.PI) / 180
const PERIOD_S = 60
const CLOUD_DRIFT = 0.012
const CURSOR_SUN_Z = 0.55
const MAX_PITCH = 1.1
const INERTIA_S = 0.9
const PITCH_RETURN_S = 1.6
const HOVER_TURN = 0.2
const HOVER_SOFT = 1.4
const HOVER_LIFT = 0.025
const HOVER_K = 60
const HOVER_C = 11
const STAR_PARALLAX = 0.35
const FADE_S = 0.6
const MAX_PIXELS = 5e6
const FIT = 0.86

const TAU = Math.PI * 2
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)

type Pix = {
    state: "loading" | "ready" | "failed"
    canvas: HTMLCanvasElement | null

    chan: Uint8Array | null
}
const PIX_CACHE = new Map<string, Pix>()

function loadPix(src: string, channel: number, width = TEX_W): Pix {
    const key = src + "#" + channel + "@" + width
    const hit = PIX_CACHE.get(key)
    if (hit) return hit
    const e: Pix = { state: "loading", canvas: null, chan: null }
    PIX_CACHE.set(key, e)
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.decoding = "async"
    img.onload = () => {
        try {
            const cv = document.createElement("canvas")
            cv.width = width
            cv.height = width / 2
            const cx = cv.getContext("2d")
            if (!cx) throw new Error("no 2d")
            cx.imageSmoothingQuality = "high"
            cx.drawImage(img, 0, 0, width, width / 2)

            const data = cx.getImageData(0, 0, channel < 0 ? 1 : TEX_W, channel < 0 ? 1 : TEX_H).data
            if (channel < 0) e.canvas = cv
            else {
                const out = new Uint8Array(TEX_W * TEX_H)
                for (let i = 0; i < out.length; i++) out[i] = data[i * 4 + channel]
                e.chan = out
            }
            e.state = "ready"
        } catch {
            e.state = "failed"
        }
    }
    img.onerror = () => {
        e.state = "failed"
    }
    img.src = src
    return e
}

const imageSrc = (v: EarthProps["map"]): string =>
    typeof v === "string" ? v : v && typeof v.src === "string" ? v.src : ""

const COLOR_CACHE = new Map<string, number[]>()
function rgbOf(c: string): number[] {
    const hit = COLOR_CACHE.get(c)
    if (hit) return hit
    let out = [0, 0, 0]
    let s = (c || "").trim()
    if (s.startsWith("var(")) s = s.slice(s.indexOf(",") + 1)
    if (s[0] === "#") {
        let hx = s.slice(1)
        if (hx.length === 3 || hx.length === 4) hx = hx.split("").map((x) => x + x).join("")
        const n = parseInt(hx.slice(0, 6), 16)
        if (!isNaN(n)) out = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
    } else {
        const m = s.match(/[\d.]+/g)
        if (m && m.length >= 3) out = [+m[0], +m[1], +m[2]]
    }
    COLOR_CACHE.set(c, out)
    return out
}

type M3 = number[][]
const mul3 = (a: M3, b: M3): M3 =>
    a.map((row) => [0, 1, 2].map((j) => row[0] * b[0][j] + row[1] * b[1][j] + row[2] * b[2][j]))

const rotX = (a: number): M3 => [[1, 0, 0], [0, Math.cos(a), -Math.sin(a)], [0, Math.sin(a), Math.cos(a)]]
const rotY = (a: number): M3 => [[Math.cos(a), 0, Math.sin(a)], [0, 1, 0], [-Math.sin(a), 0, Math.cos(a)]]
const rotZ = (a: number): M3 => [[Math.cos(a), -Math.sin(a), 0], [Math.sin(a), Math.cos(a), 0], [0, 0, 1]]
const apply3 = (m: M3, v: number[]) => [0, 1, 2].map((r) => m[r][0] * v[0] + m[r][1] * v[1] + m[r][2] * v[2])

const orbit = (hx: number, hy: number): M3 => mul3(rotY(hx), rotX(-hy))

function globeFromView(yaw: number, pitch: number, view: M3, out: Float32Array) {
    const worldFromView = view[0].map((_, c) => view.map((row) => row[c]))
    const m = mul3(mul3(mul3(rotY(-yaw), rotX(-pitch)), rotZ(-AXIAL_TILT)), worldFromView)
    for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) out[c * 3 + r] = m[r][c]
}

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`

const FRAG = `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif
precision highp float;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uDpr;
uniform mat3 uRot;
uniform float uCloudRot;
uniform vec3 uLight;
uniform vec3 uAtmo;
uniform float uClouds;
uniform float uLights;
uniform float uStars;
uniform float uTime;
uniform vec2 uStarShift;
uniform vec4 uHave;
uniform sampler2D uDay;
uniform sampler2D uNight;
uniform sampler2D uAux;

const float PI = 3.14159265;
const float TAU = 6.28318531;
const float GLOW = 0.07;
const float BUMP = 2.2;
const float SHADOW_REACH = 0.012;
const float EXPOSURE = 1.7;
const vec3 MOON = vec3(0.008, 0.012, 0.024);
const float STAR_CELL = 7.0;
const float STAR_SHARE = 0.16;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec2 equi(vec3 q, float shift) {
    float u1 = fract(atan(q.x, q.z) / TAU + 0.5 + shift);
    float u2 = fract(u1 + 0.5) - 0.5;
#ifdef GL_OES_standard_derivatives
    float u = fwidth(u1) < fwidth(u2) - 0.001 ? u1 : u2;
#else
    float u = u1;
#endif
    return vec2(u, acos(clamp(q.y, -1.0, 1.0)) / PI);
}

void main() {
    vec2 frag = gl_FragCoord.xy;
    vec2 p = (frag - uCenter) / uRadius;
    float r = length(p);
    vec2 s = r > 0.999 ? p / r * 0.999 : p;
    vec3 n = vec3(s, sqrt(max(0.0, 1.0 - dot(s, s))));
    vec3 q = uRot * n;
    vec3 L = uRot * uLight;
    vec3 H = uRot * normalize(uLight + vec3(0.0, 0.0, 1.0));
    float cl = max(length(q.xz), 1e-4);
    vec3 east = vec3(q.z, 0.0, -q.x) / cl;
    vec3 north = cross(q, east);

    vec2 uv = equi(q, 0.0);
    vec2 uvc = equi(q, -uCloudRot / TAU);
    vec3 day = texture2D(uDay, uv).rgb;
    vec3 night = texture2D(uNight, uv).rgb;
    float nightGlow = texture2D(uNight, uv, 3.0).r;
    vec4 aux = texture2D(uAux, uv);
    float hE = texture2D(uAux, uv + vec2(1.5 / 2048.0, 0.0)).g;
    float hN = texture2D(uAux, uv - vec2(0.0, 1.5 / 1024.0)).g;
    vec2 toSun = vec2(dot(L, east) / (TAU * cl), -dot(L, north) / PI) * SHADOW_REACH;
    float cloud = texture2D(uAux, uvc).b;
    float shadow = texture2D(uAux, uvc + toSun).b;

    float water = aux.r * uHave.z;
    float dry = 1.0 - water;
    vec3 nb = normalize(q - BUMP * uHave.z * dry * ((hE - aux.g) * east + (hN - aux.g) * north));
    float ndlS = dot(q, L);
    float ndl = dot(nb, L);
    float mu = n.z;

    vec3 sun = mix(vec3(1.0, 0.45, 0.22), vec3(1.0), smoothstep(0.0, 0.3, ndlS));

    vec3 alb = mix(vec3(0.010, 0.016, 0.030), pow(day, vec3(2.2)), uHave.x);
    float diff = max(ndl, 0.0) * smoothstep(-0.08, 0.12, ndlS);
    vec3 col = alb * sun * diff;

    float nh = max(dot(q, H), 0.0);
    col += sun * water * (pow(nh, 240.0) * 0.22 + pow(nh, 24.0) * 0.025) * smoothstep(0.0, 0.25, ndlS);

    float cov = clamp(cloud * uClouds, 0.0, 1.0) * uHave.w;
    float shade = clamp(shadow * uClouds, 0.0, 1.0) * uHave.w;
    col *= 1.0 - 0.55 * shade;

    float dark = 1.0 - smoothstep(-0.16, 0.06, ndlS);

    col += alb * MOON * dark;

    float li = clamp((night.r - 0.035) / 0.40, 0.0, 1.0);
    float lg = clamp((nightGlow - 0.035) / 0.40, 0.0, 1.0);
    vec3 lamp = mix(vec3(1.0, 0.46, 0.13), vec3(1.0, 0.84, 0.62), smoothstep(0.35, 0.9, li));
    vec3 city = lamp * li * li * 2.4 + vec3(1.0, 0.42, 0.12) * lg * 0.45;
    col += city * uLights * dark * (1.0 - 0.85 * cov) * (0.35 + 0.65 * mu) * uHave.y;

    float cdiff = smoothstep(-0.12, 0.25, ndlS) * (0.2 + 0.8 * max(ndlS, 0.0));
    col = mix(col, vec3(0.92, 0.94, 0.97) * (sun * cdiff + MOON * dark), cov);

    float lit = smoothstep(-0.35, 0.5, ndlS);
    float rim = 1.0 - mu;
    col = mix(col, uAtmo * 0.35 * lit, pow(rim, 3.0) * 0.55);
    col += uAtmo * (pow(rim, 1.6) * 0.05 + pow(rim, 6.0) * 0.8) * lit;
    col += vec3(1.0, 0.38, 0.12) * pow(rim, 3.0) * exp(-ndlS * ndlS / 0.012) * 0.22;

    float ia = clamp((1.0 - r) * uRadius + 0.5, 0.0, 1.0);
    float t = max(r - 1.0, 0.0) / GLOW;
    float halo = exp(-t * 3.5) * (1.0 - smoothstep(0.0, 1.0, t));
    float hl = smoothstep(-0.5, 0.7, dot(vec3(p / max(r, 1e-4), 0.0), uLight));
    vec3 lin = col * ia + uAtmo * halo * hl * 0.9 * (1.0 - ia);

    vec3 x = lin * EXPOSURE;
    vec3 rgb = pow(clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0), vec3(1.0 / 2.2));

    if (uStars > 0.0) {
        vec2 sp = (frag + uStarShift) / (STAR_CELL * uDpr);
        vec2 id = floor(sp);
        float h0 = hash(id);
        if (h0 < uStars * STAR_SHARE) {
            vec2 pos = vec2(hash(id + 17.3), hash(id + 41.9)) * 0.7 + 0.15;
            float d = length(fract(sp) - pos) * STAR_CELL;
            float mag = pow(hash(id + 7.1), 5.0);
            float tw = 0.7 + 0.3 * sin(uTime * (0.6 + 2.0 * hash(id + 3.3)) + h0 * 80.0);
            float star = exp(-d * d / (0.25 + 0.6 * mag)) * (0.15 + 0.85 * mag) * tw;
            rgb += vec3(star) * (1.0 - ia) * (1.0 - clamp(halo * 1.5, 0.0, 1.0));
        }
    }

    gl_FragColor = vec4(rgb, max(ia, max(rgb.r, max(rgb.g, rgb.b))));
}`
type GLState = {
    gl: WebGLRenderingContext
    u: Record<string, WebGLUniformLocation | null>
    tex: WebGLTexture[]

    held: string[]
    prog: WebGLProgram | null

    buf: WebGLBuffer | null
}

function makeGL(canvas: HTMLCanvasElement): GLState | null {
    const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false })
    if (!gl) return null
    gl.getExtension("OES_standard_derivatives")
    const aniso = gl.getExtension("EXT_texture_filter_anisotropic")
    const shader = (type: number, src: string) => {
        const s = gl.createShader(type)
        if (!s) return null
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn("Earth:", gl.getShaderInfoLog(s))
            return null
        }
        return s
    }
    const vs = shader(gl.VERTEX_SHADER, VERT)
    const fs = shader(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vs || !fs || !prog) return null
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null
    gl.useProgram(prog)
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, "aPos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const u: Record<string, WebGLUniformLocation | null> = {}
    for (const name of [
        "uCenter", "uRadius", "uDpr", "uRot", "uCloudRot", "uLight", "uAtmo", "uClouds", "uLights",
        "uStars", "uTime", "uStarShift", "uHave", "uDay", "uNight", "uAux",
    ])
        u[name] = gl.getUniformLocation(prog, name)
    const tex: WebGLTexture[] = []
    for (let i = 0; i < 3; i++) {
        const t = gl.createTexture() as WebGLTexture
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]))
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8)
        tex.push(t)
    }
    gl.uniform1i(u.uDay, 0)
    gl.uniform1i(u.uNight, 1)
    gl.uniform1i(u.uAux, 2)
    return { gl, u, tex, held: ["", "", ""], prog, buf }
}

function upload(g: GLState, slot: number, src: TexImageSource | Uint8Array) {
    const { gl } = g
    gl.activeTexture(gl.TEXTURE0 + slot)
    gl.bindTexture(gl.TEXTURE_2D, g.tex[slot])
    if (src instanceof Uint8Array) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX_W, TEX_H, 0, gl.RGBA, gl.UNSIGNED_BYTE, src)
    else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src)
    gl.generateMipmap(gl.TEXTURE_2D)
}

const AUX_CACHE = new Map<string, Uint8Array>()
function auxFor(water: Uint8Array | null, topo: Uint8Array | null, cloud: Uint8Array | null, key: string) {
    const hit = AUX_CACHE.get(key)
    if (hit) return hit
    const out = new Uint8Array(TEX_W * TEX_H * 4)
    for (let i = 0, k = 0; i < TEX_W * TEX_H; i++, k += 4) {
        out[k] = water ? water[i] : 0
        out[k + 1] = topo ? topo[i] : 0
        out[k + 2] = cloud ? cloud[i] : 0
        out[k + 3] = 255
    }
    AUX_CACHE.clear()
    AUX_CACHE.set(key, out)
    return out
}

export default function Earth(props: EarthProps) {
    const { background = DEFAULTS.background, drag = DEFAULTS.drag, style } = props
    const rootRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const propsRef = useRef(props)
    propsRef.current = props

    // 0 = first mount. Bumping it swaps the <canvas> for a brand-new node, which is the only
    // portable way to obtain a usable context again after the GPU drops it.
    const [gen, setGen] = useState(0)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const root = rootRef.current
        const canvas = canvasRef.current
        if (!root || !canvas) return
        const g = makeGL(canvas)
        if (!g) {
            setFailed(true)
            return
        }
        setFailed(false)
        const { gl, u } = g

        let W = 0, H = 0, dpr = 1
        const resize = () => {
            W = root.offsetWidth
            H = root.offsetHeight
            dpr = Math.min(2, window.devicePixelRatio || 1)
            if (W * H * dpr * dpr > MAX_PIXELS) dpr = Math.sqrt(MAX_PIXELS / Math.max(1, W * H))
            canvas.width = Math.max(1, Math.round(W * dpr))
            canvas.height = Math.max(1, Math.round(H * dpr))
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(root)

        const mq = typeof window.matchMedia === "function" ? window.matchMedia("(prefers-reduced-motion: reduce)") : null
        let reduce = !!(mq && mq.matches)
        const onMq = () => {
            reduce = !!(mq && mq.matches)
        }
        mq?.addEventListener?.("change", onMq)

        let px = 0, py = 0, over = false, R = 1
        let dragging = false, dragId = -1, lastX = 0, lastY = 0, lastT = 0
        let yaw = 0, pitch = 0, vYaw = 0, vPitch = 0

        const local = (e: PointerEvent) => {
            const b = root.getBoundingClientRect()
            px = (e.clientX - b.left) * (b.width ? W / b.width : 1)
            py = (e.clientY - b.top) * (b.height ? H / b.height : 1)
        }
        const onMove = (e: PointerEvent) => {
            local(e)
            over = true
            if (!dragging || e.pointerId !== dragId) return
            const now = performance.now()
            const dts = Math.max(0.001, (now - lastT) / 1000)

            const dYaw = (px - lastX) / R, dPitch = (py - lastY) / R
            yaw += dYaw
            pitch = clamp(pitch + dPitch, -MAX_PITCH, MAX_PITCH)

            vYaw += (dYaw / dts - vYaw) * 0.4
            vPitch += (dPitch / dts - vPitch) * 0.4
            lastX = px
            lastY = py
            lastT = now
        }
        const onLeave = () => {
            if (!dragging) over = false
        }
        const onDown = (e: PointerEvent) => {
            local(e)
            over = true
            if (!(propsRef.current.drag ?? DEFAULTS.drag) || (e.pointerType === "mouse" && e.button !== 0)) return
            if (Math.hypot(px - W / 2, py - H / 2) > R * 1.15) return
            dragging = true
            dragId = e.pointerId
            lastX = px
            lastY = py
            lastT = performance.now()
            vYaw = 0
            vPitch = 0
            root.setPointerCapture?.(e.pointerId)
            root.style.cursor = "grabbing"
        }
        const onUp = (e: PointerEvent) => {
            if (!dragging || e.pointerId !== dragId) return
            dragging = false

            if (performance.now() - lastT > 80) {
                vYaw = 0
                vPitch = 0
            }
            root.style.cursor = ""
            if (e.type === "pointercancel") over = false
        }
        root.addEventListener("pointermove", onMove)
        root.addEventListener("pointerenter", onMove)
        root.addEventListener("pointerleave", onLeave)
        root.addEventListener("pointerdown", onDown)
        root.addEventListener("pointerup", onUp)
        root.addEventListener("pointercancel", onUp)

        const onLost = (e: Event) => {
            e.preventDefault()
            setFailed(true)
        }
        const onRestored = () => setGen((n) => n + 1)
        canvas.addEventListener("webglcontextlost", onLost)
        canvas.addEventListener("webglcontextrestored", onRestored)
        const rot = new Float32Array(9)
        const have = [0, 0, 0, 0]
        let last = -1, time = 0, cloudRot = 0, raf = 0

        const hov = { x: 0, vx: 0, y: 0, vy: 0, lift: 0, vl: 0 }
        let lx = NaN, ly = 0, lz = 0
        let auxKey = ""

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const dt = last < 0 ? 0 : Math.min(0.05, (now - last) / 1000)
            last = now
            if (W < 2 || H < 2) return
            const p = propsRef.current
            const look = { ...DEFAULT_LOOK, ...p.look }
            time += dt

            const userSrc = imageSrc(p.map)
            const user = userSrc ? loadPix(userSrc, -1) : null
            const daySrc = user && user.state !== "failed" ? userSrc : DAY_SRC
            const day = daySrc === userSrc && user ? user : loadPix(DAY_SRC, -1)
            const want: [Pix, string][] = [[day, daySrc], [loadPix(NIGHT_SRC, -1, NIGHT_W), NIGHT_SRC]]
            want.forEach(([pix, src], slot) => {
                if (pix.state === "ready" && pix.canvas && g.held[slot] !== src) {
                    upload(g, slot, pix.canvas)
                    g.held[slot] = src
                }
            })
            const water = loadPix(WATER_SRC, 0), topo = loadPix(TOPO_SRC, 0), cloud = loadPix(CLOUD_SRC, 3)
            const key = [water, topo, cloud].map((x) => (x.state === "ready" ? 1 : 0)).join("")
            if (key !== auxKey && key !== "000") {
                upload(g, 2, auxFor(water.chan, topo.chan, cloud.chan, key))
                auxKey = key
            }
            const targets = [g.held[0] ? 1 : 0, g.held[1] ? 1 : 0, water.chan ? 1 : 0, cloud.chan ? 1 : 0]
            const fk = 1 - Math.exp(-dt / FADE_S)
            for (let i = 0; i < 4; i++) have[i] += (targets[i] - have[i]) * fk

            const spd = Math.max(0, p.speed ?? DEFAULTS.speed) / 5
            const omega = reduce ? 0 : (TAU * spd) / PERIOD_S
            if (!dragging) {
                const decay = Math.exp(-dt / INERTIA_S)
                yaw += (omega + (reduce ? 0 : vYaw)) * dt
                pitch = clamp(pitch + (reduce ? 0 : vPitch) * dt, -MAX_PITCH, MAX_PITCH)
                vYaw *= decay
                vPitch *= decay
                pitch *= Math.exp(-dt / PITCH_RETURN_S)
            }
            cloudRot += dt * spd * CLOUD_DRIFT * (reduce ? 0 : 1)

            const cx = W / 2, cy = H / 2
            R = Math.max(20, (p.size ?? Math.min(W, H) * FIT) / 2)

            const hk = reduce ? 0 : Math.max(0, p.hover ?? DEFAULTS.hover) / 5
            const soft = (v: number) => Math.tanh(HOVER_SOFT * clamp(v, -1.5, 1.5)) / Math.tanh(HOVER_SOFT)
            let gx = 0, gy = 0, gl2 = 0
            if (dragging) {
                gx = hov.x
                gy = hov.y
                gl2 = 1
            } else if (over && hk > 0) {
                gx = soft((px - cx) / Math.max(1, cx)) * HOVER_TURN * hk
                gy = -soft((py - cy) / Math.max(1, cy)) * HOVER_TURN * hk
                gl2 = Math.hypot(px - cx, py - cy) < R * 1.1 ? 1 : 0
            }
            const steps = Math.ceil(dt * 120)
            for (let i = 0; i < steps; i++) {
                const h = dt / steps
                hov.vx += (HOVER_K * (gx - hov.x) - HOVER_C * hov.vx) * h
                hov.x += hov.vx * h
                hov.vy += (HOVER_K * (gy - hov.y) - HOVER_C * hov.vy) * h
                hov.y += hov.vy * h
                hov.vl += (HOVER_K * (gl2 - hov.lift) - HOVER_C * hov.vl) * h
                hov.lift += hov.vl * h
            }
            const view = orbit(hov.x, hov.y)
            globeFromView(yaw, pitch, view, rot)
            const Rd = R * (1 + HOVER_LIFT * hov.lift * Math.min(1, hk))

            const ang = ((p.sunAngle ?? DEFAULTS.sunAngle) * Math.PI) / 180
            const tz0 = clamp((p.daylight ?? DEFAULTS.daylight) / 50 - 1, -0.98, 1)
            const flat = Math.sqrt(1 - tz0 * tz0)
            let tx = Math.cos(ang) * flat, ty = Math.sin(ang) * flat, tz = tz0
            if ((p.sun ?? DEFAULTS.sun) === "cursor" && over) {
                const w = apply3(rotX(hov.y), apply3(rotY(-hov.x), [
                    clamp((px - cx) / R, -2.5, 2.5),
                    clamp(-(py - cy) / R, -2.5, 2.5),
                    CURSOR_SUN_Z,
                ]))
                tx = w[0]
                ty = w[1]
                tz = w[2]
            }
            const tl = Math.hypot(tx, ty, tz)
            if (isNaN(lx)) {
                lx = tx / tl
                ly = ty / tl
                lz = tz / tl
            } else {
                const lk = 1 - Math.exp(-dt / 0.35)
                lx += (tx / tl - lx) * lk
                ly += (ty / tl - ly) * lk
                lz += (tz / tl - lz) * lk
            }
            const ll = Math.hypot(lx, ly, lz) || 1
            const Lv = apply3(view, [lx / ll, ly / ll, lz / ll])

            const at = rgbOf(look.atmosphere)
            gl.viewport(0, 0, canvas.width, canvas.height)
            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)
            gl.uniform2f(u.uCenter, canvas.width / 2, canvas.height / 2)
            gl.uniform1f(u.uRadius, Rd * dpr)
            gl.uniform1f(u.uDpr, dpr)
            gl.uniformMatrix3fv(u.uRot, false, rot)
            gl.uniform1f(u.uCloudRot, cloudRot)
            gl.uniform3f(u.uLight, Lv[0], Lv[1], Lv[2])
            gl.uniform3f(u.uAtmo, (at[0] / 255) ** 2.2, (at[1] / 255) ** 2.2, (at[2] / 255) ** 2.2)
            gl.uniform1f(u.uClouds, Math.max(0, look.clouds) / 5)
            gl.uniform1f(u.uLights, Math.max(0, look.lights) / 5)
            gl.uniform1f(u.uStars, clamp((p.stars ?? DEFAULTS.stars) / 10, 0, 1))
            gl.uniform1f(u.uTime, reduce ? 0 : time)

            gl.uniform2f(u.uStarShift, hov.x * R * dpr * STAR_PARALLAX, hov.y * R * dpr * STAR_PARALLAX)
            gl.uniform4f(u.uHave, have[0], have[1], have[2], have[3])
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            for (const t of g.tex) gl.deleteTexture(t)
            gl.deleteBuffer(g.buf)
            gl.deleteProgram(g.prog)
            canvas.removeEventListener("webglcontextlost", onLost)
            canvas.removeEventListener("webglcontextrestored", onRestored)
            mq?.removeEventListener?.("change", onMq)
            root.removeEventListener("pointermove", onMove)
            root.removeEventListener("pointerenter", onMove)
            root.removeEventListener("pointerleave", onLeave)
            root.removeEventListener("pointerdown", onDown)
            root.removeEventListener("pointerup", onUp)
            root.removeEventListener("pointercancel", onUp)
        }
    }, [gen])

    return (
        <div
            ref={rootRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                ...style,
                overflow: "hidden",
                background,
                cursor: drag ? "grab" : undefined,

                touchAction: "pan-y",
            }}
        >
            <canvas
                key={gen}
                ref={canvasRef}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
            />
            {failed && (
                <div
                    aria-hidden
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        pointerEvents: "none",
                        background,
                    }}
                >
                    <div
                        style={{
                            width: "72%",
                            maxWidth: "100%",
                            maxHeight: "100%",
                            aspectRatio: "1 / 1",
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle at 32% 28%, #a9cbff 0%, #5b8ff5 18%, #2b5cd0 38%, #14367f 60%, #0a1b3d 82%, #050c1c 100%)",
                            boxShadow:
                                "0 0 46px 8px rgba(79,155,255,0.38), inset -20px -14px 44px rgba(0,0,0,0.72), inset 10px 8px 26px rgba(120,170,255,0.25)",
                        }}
                    />
                </div>
            )}
        </div>
    )
}