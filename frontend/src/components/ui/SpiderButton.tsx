// Spider Button — UI HUB

"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"

const RenderTarget = {
    current: () => "preview",
    hasRestrictions: () => false,
    canvas: "canvas",
    export: "export",
    preview: "preview",
    thumbnail: "thumbnail",
}

const GLOVE =
    "M9 14V3.6a2.5 2.5 0 0 1 5 0V12.2a2.2 2.2 0 0 1 4.4 0.4a2.2 2.2 0 0 1 4.4 0.8a2.2 2.2 0 0 1 4.2 1.6V22c0 4-2.6 7-6 7H14.6c-3 0-5.4-1.8-6.6-4.4L4.1 18.6a2.3 2.3 0 0 1 3.6-2.8L9 17.4Z"
const GLOVE_LINES = "M18.4 12.6V17.2M22.8 13.4V17.6M14 12.2V16.6"
const CUFF = "M12.6 28.6h12.2a1.6 1.6 0 0 1 1.6 1.6v3.4a1.6 1.6 0 0 1-1.6 1.6H12.6a1.6 1.6 0 0 1-1.6-1.6v-3.4a1.6 1.6 0 0 1 1.6-1.6Z"
const CUFF_LINES = "M15.4 29.2v5.4M18.7 29.2v5.4M22 29.2v5.4"
const HOT_X = 11.5, HOT_Y = 1

const GRIPS: [number, number][] = [[11.5, 3.6], [16.2, 13.2], [20.6, 14], [24.9, 15.8], [5.6, 18], [11.5, 10], [18.5, 22], [18.7, 31.6]]

const ARROW = "M1.5 1.5V23.2L6.6 18.4L10.1 26.4L13.6 24.9L10.2 17.1H17.3Z"
const ARROW_HOT_X = 1.5, ARROW_HOT_Y = 1.5

const ARROW_GRIPS: [number, number][] = [[2.6, 4.2], [2.4, 10], [6.5, 7.5], [11.5, 12.5], [2.4, 17.5], [14.5, 16], [11.5, 24.2], [6.8, 17.5]]

const NATIVE_GRIPS: [number, number][] = [[0, 0], [5, 7], [-4, 6], [8, 13], [-2, 12], [3, 3], [6, 18], [0, 16]]

const MS = 7
const NP = 12

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `precision highp float;
uniform vec2 uRes;
uniform float uDpr;
uniform vec4 uPill;
uniform float uLean;
uniform vec3 uBase;
uniform vec3 uShine;
uniform float uRim;
uniform float uGlint;
uniform float uShadow;

vec2 field(vec2 p){
  float rr = uPill.w * 0.5;
  vec2 c = vec2(uPill.x + uPill.z * 0.5, uPill.y + rr);
  float a = max(0.0, uPill.z * 0.5 - rr);
  vec2 q = p - c;
  return vec2(length(q - vec2(clamp(q.x, -a, a), 0.0)) - rr, rr);
}
float dist(vec2 p){ return field(p).x; }

float env(vec3 R){
  R.x += uLean * 0.18;
  float up = -R.y;
  float e = 0.015;
  e += smoothstep(0.3, 0.5, up) * smoothstep(0.75, 0.55, up) * smoothstep(0.8, 0.5, abs(R.x)) * 2.6;
  e += smoothstep(0.8, 0.95, up) * 0.6;
  e += smoothstep(-0.5, -0.7, R.x) * smoothstep(0.5, 0.25, abs(R.y))
       * 1.1;
  e += smoothstep(0.6, 0.85, R.x) * smoothstep(0.6, 0.2, abs(R.y)) * 0.5;
  e += smoothstep(0.25, 0.7, R.y) * 1.25;
  return e;
}

void main(){
  vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 f = field(p);
  float d = f.x;
  float aa = clamp(0.5 - d * uDpr, 0.0, 1.0);

  float sh = 0.0;
  if (aa < 1.0 && uShadow > 0.0 && d < 30.0) {
    float ds = dist(p - vec2(2.0, 9.0));
    sh = (1.0 - smoothstep(-4.0, 16.0, ds)) * uShadow;
  }

  vec3 col = vec3(0.0);
  if (aa > 0.0) {
    float B = max(f.y, 0.8);
    float s = clamp(-d, 0.0, B);
    float z = sqrt(max(1e-3, s * (2.0 * B - s)));
    float slope = min((B - s) / z, 6.0);
    float e = 0.5;
    vec2 g = vec2(dist(p + vec2(e, 0.0)) - d, dist(p + vec2(0.0, e)) - d);
    g = length(g) > 1e-6 ? normalize(g) : vec2(0.0);
    vec3 n = normalize(vec3(g * slope, 1.0));
    vec3 R = reflect(vec3(0.0, 0.0, -1.0), n);
    float fres = 0.05 + 0.95 * pow(1.0 - max(n.z, 0.0), 3.0);
    col = uBase + min(env(R) * fres * uRim, 1.0) * uShine;
    col += pow(max(dot(R, normalize(vec3(-0.35, -0.75, 0.56))), 0.0), 70.0) * 1.2 * uGlint;
    col += pow(max(dot(R, normalize(vec3(0.55, -0.35, 0.76))), 0.0), 140.0) * 0.55 * uGlint;
  }
  float alpha = aa + (1.0 - aa) * sh;
  gl_FragColor = vec4(col * aa, alpha);
}`

const GRAIN_URL =
    "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

const ADVANCED_DEFAULTS = {
    hover: 50,
    grain: 0,
    vignette: 0,
    sense: 290,
    release: 215,
    cobwebSize: 34,
    threadBorder: true,
    senseLines: true,
    shine: "#EDF0F7",
    rim: 100,
    glint: 100,
    shadow: 20,
    gloveScale: 155,
    pressScale: 96,
    strandWidth: 100,
    stretchThin: 50,
    gravity: 65,
    damping: 92,
    snapDamping: 86,
    sway: 5,
    lungeMs: 140,
    splatInMs: 900,
    splatOutMs: 600,
    lingerMs: 1700,
    fingerLift: 52,
    ghostDelayMs: 2500,
    hairs: true,
    webs: true,
}

const MOVED_CONTROLS: { into: Record<string, string>; out: Record<string, string> } = {"into":{},"out":{"hover":"advanced"}}
const GROUP_FALLBACKS: Record<string, any> = { advanced: ADVANCED_DEFAULTS }
function withMovedControls(props: any): any {
    const out = { ...props }
    for (const [k, g] of Object.entries(MOVED_CONTROLS.into)) out[k] = props?.[g]?.[k] ?? GROUP_FALLBACKS[g]?.[k]
    for (const [k, g] of Object.entries(MOVED_CONTROLS.out)) {
        if (out[k] !== undefined) out[g] = { ...(out[g] ?? {}), [k]: out[k] }
    }
    return out
}

type Advanced = typeof ADVANCED_DEFAULTS
type RGB = [number, number, number]

const RGB_CACHE = new Map<string, RGB | null>()
function toRgb(input: unknown, fallback: RGB): RGB {
    if (typeof input !== "string") return fallback
    let hit = RGB_CACHE.get(input)
    if (hit === undefined) {
        hit = parseRgb(input)
        RGB_CACHE.set(input, hit)
    }
    return hit ?? fallback
}
function parseRgb(raw: string): RGB | null {
    let s = raw.trim()
    const v = /^var\(\s*--[^,]+,\s*(.+)\)$/.exec(s)
    if (v) s = v[1].trim()
    const hex = /^#([0-9a-f]{3,8})$/i.exec(s)
    if (hex) {
        let h = hex[1]
        if (h.length === 3 || h.length === 4) h = h.slice(0, 3).split("").map((c) => c + c).join("")
        if (h.length < 6) return null
        return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as RGB
    }
    const fn = /^rgba?\(([^)]*)\)$/i.exec(s)
    if (fn) {
        const p = fn[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat)
        if (p.length >= 3 && p.slice(0, 3).every(Number.isFinite)) return [p[0] / 255, p[1] / 255, p[2] / 255]
    }
    return null
}
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
const cssRgb = (c: RGB, a = 1) =>
    `rgba(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)},${a})`

function shadowShows(bg: unknown): boolean {
    if (typeof bg !== "string") return true
    const s = bg.trim().toLowerCase()
    if (s === "transparent") return true
    const hexA = /^#[0-9a-f]{8}$/.test(s) ? parseInt(s.slice(7, 9), 16) / 255 : /^#[0-9a-f]{4}$/.test(s) ? parseInt(s[4] + s[4], 16) / 255 : null
    const fnA = /^rgba?\(([^)]*)\)$/.exec(s)?.[1].split(/[\s,/]+/).filter(Boolean)[3]
    const alpha = hexA ?? (fnA ? (fnA.endsWith("%") ? parseFloat(fnA) / 100 : parseFloat(fnA)) : 1)
    if (!(alpha >= 0.99)) return true
    const c = parseRgb(s)
    return !c || 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 0.03
}
const num = (v: unknown, fallback: number, lo: number, hi: number) => {
    const n = typeof v === "number" && Number.isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

const SHINE_FALLBACK: RGB = [0.93, 0.94, 0.97]
const SUIT_FALLBACK: RGB = [0.78, 0.07, 0.11]
const WEB_FALLBACK: RGB = [0.96, 0.96, 0.97]

type Strand = {
    x: Float32Array; y: Float32Array; px: Float32Array; py: Float32Array
    spread: number; s: number; slack: number; width: number
    grip: [number, number]; gi: number; ex: number; ey: number; follow: number
    seg: number; phase: number; hair: boolean
}

type Cobweb = { s: number; size: number; drape: boolean }

type Props = {
    background?: string
    suitColor?: string
    webColor?: string
    cobwebs?: boolean
    textColor?: string
    font?: CSSProperties
    label?: string
    size?: number
    strands?: number
    reach?: number
    cursor?: "glove" | "arrow" | "native"
    autoplay?: boolean
    onClick?: () => void
    advanced?: Partial<Advanced>
    style?: CSSProperties
}

export default function SpiderButton(props: Props) {
    props = withMovedControls(props)
    const {
        background = "#000000",
        suitColor = "#C8121C",
        webColor = "#F5F5F7",
        cobwebs = true,
        textColor = "#F4F4F4",
        font = {"variant":"Bold","fontSize":20,"textAlign":"left","fontFamily":"Inter","fontWeight":700,"lineHeight":1,"letterSpacing":"-0.02em"} as CSSProperties,
        label = "let’s collaborate",
        size = 64,
        strands = 7,
        reach = 140,
        cursor = "arrow",
        autoplay = false,
        onClick,
        style,
    } = props
    const adv: Advanced = { ...ADVANCED_DEFAULTS, ...(props.advanced ?? {}) }

    const stageRef = useRef<HTMLDivElement>(null)
    const btnRef = useRef<HTMLButtonElement>(null)
    const glRef = useRef<HTMLCanvasElement>(null)
    const handRef = useRef<HTMLCanvasElement>(null)
    const [fallback, setFallback] = useState(false)

    const live = useRef({ background, strands, reach, cursor, autoplay, suitColor, webColor, cobwebs, adv })
    live.current = { background, strands, reach, cursor, autoplay, suitColor, webColor, cobwebs, adv }

    useEffect(() => {
        const stage = stageRef.current, btn = btnRef.current
        const glc = glRef.current, hc = handRef.current
        if (!stage || !btn || !glc || !hc) return

        const hx = hc.getContext("2d")
        if (!hx) return

        const reduced = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches

        const onCanvas = RenderTarget.current() === RenderTarget.canvas

        const gl = glc.getContext("webgl", { premultipliedAlpha: true, antialias: false, alpha: true })
        const shaders: WebGLShader[] = []
        let prog: WebGLProgram | null = null
        let quad: WebGLBuffer | null = null
        const disposeGL = () => {
            if (!gl) return
            if (quad) gl.deleteBuffer(quad)
            if (prog) gl.deleteProgram(prog)
            for (const s of shaders) gl.deleteShader(s)
            quad = null
            prog = null
            shaders.length = 0
        }
        if (gl) {
            const sh = (t: number, src: string) => {
                const s = gl.createShader(t)
                if (!s) return null
                shaders.push(s)
                gl.shaderSource(s, src)
                gl.compileShader(s)
                return s
            }
            const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG)
            const p = gl.createProgram()
            if (p) {
                if (vs && fs) {
                    gl.attachShader(p, vs)
                    gl.attachShader(p, fs)
                    gl.linkProgram(p)
                }
                if (vs && fs && gl.getProgramParameter(p, gl.LINK_STATUS)) prog = p
                else gl.deleteProgram(p)
            }
        }
        if (!gl || !prog) {
            disposeGL()
            setFallback(true)
            return
        }
        const program = prog
        const onContextLost = (e: Event) => {
            e.preventDefault()
            setFallback(true)
        }
        glc.addEventListener("webglcontextlost", onContextLost)
        gl.useProgram(program)
        const uni = (n: string) => {
            const loc = gl.getUniformLocation(program, n)
            if (!loc) throw new Error(`SpiderButton: uniform ${n} not found`)
            return loc
        }
        const U = {
            uRes: uni("uRes"), uDpr: uni("uDpr"), uPill: uni("uPill"), uLean: uni("uLean"), uBase: uni("uBase"),
            uShine: uni("uShine"), uRim: uni("uRim"), uGlint: uni("uGlint"), uShadow: uni("uShadow"),

        }
        quad = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        const aLoc = gl.getAttribLocation(program, "a")
        gl.enableVertexAttribArray(aLoc)
        gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0)
        const quadData = new Float32Array(8)

        let w = 0, h = 0, dpr = 1

        let lastGlKey = ""

        let lastOvKey = ""
        const gloveP = new Path2D(GLOVE), gloveL = new Path2D(GLOVE_LINES), cuffP = new Path2D(CUFF), cuffL = new Path2D(CUFF_LINES)
        const arrowP = new Path2D(ARROW)

        type Shape = {
            shadow: Path2D[]; fill: Path2D[]; stroke: [Path2D, number][]
            grips: [number, number][]; hot: [number, number]; mid: [number, number]; creep: [number, number]
        }
        const SHAPES: Record<"glove" | "arrow", Shape> = {
            glove: {
                shadow: [gloveP, cuffP], fill: [cuffP, gloveP], stroke: [[cuffP, 1.9], [cuffL, 1.1], [gloveP, 1.9], [gloveL, 1.1]],
                grips: GRIPS, hot: [HOT_X, HOT_Y], mid: [16, 18], creep: [17, 20],
            },
            arrow: {
                shadow: [arrowP], fill: [arrowP], stroke: [[arrowP, 1.5]],
                grips: ARROW_GRIPS, hot: [ARROW_HOT_X, ARROW_HOT_Y], mid: [7.5, 14], creep: [7, 14],
            },
        }

        let pressed = false
        let press = 1, pressV = 0

        const pill = { x: 0, y: 0, w: 0, h: 0, r: 0, ls: 0, P: 1 }
        const measure = () => {
            const bw = btn.offsetWidth, bh = btn.offsetHeight
            pill.w = bw * press; pill.h = bh * press
            pill.x = btn.offsetLeft + (bw - pill.w) / 2; pill.y = btn.offsetTop + (bh - pill.h) / 2
            pill.r = pill.h / 2
            pill.ls = Math.max(0, pill.w - pill.h)
            pill.P = 2 * pill.ls + 2 * Math.PI * pill.r || 1
        }
        const at = (s: number) => {
            const { x, y, w: W, h: H, r, ls, P } = pill
            s = ((s % P) + P) % P
            if (s < ls) return { x: x + r + s, y, nx: 0, ny: -1 }
            s -= ls
            if (s < Math.PI * r) {
                const a = -Math.PI / 2 + s / r
                return { x: x + W - r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
            }
            s -= Math.PI * r
            if (s < ls) return { x: x + W - r - s, y: y + H, nx: 0, ny: 1 }
            s -= ls
            const a = Math.PI / 2 + s / r
            return { x: x + r + Math.cos(a) * r, y: y + r + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }
        }
        const nearest = (qx: number, qy: number) => {
            const { x, w: W, r, ls } = pill
            const cy = pill.y + r
            const cx = Math.max(x + r, Math.min(x + W - r, qx))
            const dist = Math.hypot(qx - cx, qy - cy) - r
            let s: number
            if (qx > x + W - r) s = ls + (Math.atan2(qy - cy, qx - cx) + Math.PI / 2) * r
            else if (qx < x + r) {
                let a = Math.atan2(qy - cy, qx - cx)
                if (a < -Math.PI / 2) a += Math.PI * 2
                s = 2 * ls + Math.PI * r + (a - Math.PI / 2) * r
            } else s = qy < cy ? qx - (x + r) : ls + Math.PI * r + (x + W - r - qx)
            return { s, dist }
        }
        const loopDiff = (a: number, b: number) => {
            const P = pill.P
            let d = (b - a) % P
            if (d > P / 2) d -= P
            if (d < -P / 2) d += P
            return d
        }

        const fit = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1)
            w = stage.offsetWidth; h = stage.offsetHeight
            hc.width = Math.max(1, Math.round(w * dpr)); hc.height = Math.max(1, Math.round(h * dpr))
            glc.width = Math.max(1, Math.round(w * dpr)); glc.height = Math.max(1, Math.round(h * dpr))
            gl.viewport(0, 0, glc.width, glc.height)
            lastGlKey = ""
            lastOvKey = ""
            measure()
        }

        const touchOnly = !!window.matchMedia?.("(hover: none) and (pointer: coarse)").matches
        const ptr = { x: -999, y: -999, inside: false, last: 0, touch: false, down: false, upAt: 0 }
        let touched = false

        const place = (e: PointerEvent) => {
            let x: number, y: number
            if (e.target === btn) {
                const k = pill.w / (btn.offsetWidth || 1)
                x = pill.x + e.offsetX * k
                y = pill.y + e.offsetY * k
            } else if (e.target === stage) {
                x = e.offsetX
                y = e.offsetY
            } else return
            ptr.x = x
            ptr.y = y
            ptr.inside = ptr.x >= 0 && ptr.y >= 0 && ptr.x <= w && ptr.y <= h
            if (ptr.inside) { touched = true; ptr.last = performance.now() }
        }
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === "touch") {
                if (!ptr.down || !e.isPrimary) return
                ptr.touch = true
            } else ptr.touch = false
            place(e)
        }
        const onDown = (e: PointerEvent) => {
            if (e.target === btn && !reduced) pressed = true
            if (e.pointerType !== "touch" || !e.isPrimary) return
            ptr.touch = true
            ptr.down = true
            place(e)
        }
        const onUp = (e: PointerEvent) => {
            pressed = false
            if (e.pointerType !== "touch" || !e.isPrimary || !ptr.down) return
            ptr.down = false
            ptr.upAt = performance.now()

            if (e.type === "pointercancel") { ptr.inside = false; ptr.last = ptr.upAt }
        }

        const onLeave = () => { if (!ptr.touch) ptr.inside = false }
        const onKeyDown = (e: KeyboardEvent) => { if ((e.key === " " || e.key === "Enter") && !reduced) pressed = true }
        const onKeyUp = () => { pressed = false }
        stage.addEventListener("pointermove", onMove, { passive: true })
        stage.addEventListener("pointerdown", onDown, { passive: true })
        stage.addEventListener("pointerleave", onLeave)
        window.addEventListener("pointerup", onUp, { passive: true })
        window.addEventListener("pointercancel", onUp, { passive: true })
        btn.addEventListener("keydown", onKeyDown)
        btn.addEventListener("keyup", onKeyUp)
        btn.addEventListener("blur", onKeyUp)

        const GHOST: [number, number, number][] = [
            [0.5, 0.8, 1.1], [0.36, 0.74, 1.0], [0.6, 0.82, 0.9], [0.8, 0.64, 0.55], [0.98, 0.97, 1.4],
            [0.86, 0.28, 1.1], [0.7, 0.18, 1.0], [0.5, 0.12, 1.0], [0.3, 0.2, 0.55], [0.03, 0.04, 1.4],
            [0.16, 0.58, 1.1], [0.32, 0.86, 1.0],
        ]
        const ghostTotal = GHOST.reduce((a, p) => a + p[2], 0)
        const ghostAt = (t: number) => {
            let u = t % ghostTotal, i = 0
            while (u > GHOST[i][2]) { u -= GHOST[i][2]; i++ }
            const f = u / GHOST[i][2]
            const p = (k: number) => GHOST[(k + GHOST.length) % GHOST.length]
            const p0 = p(i - 1), p1 = p(i), p2 = p(i + 1), p3 = p(i + 2)
            const e = f * f * (3 - 2 * f)
            const cr = (a: number, b: number, c: number, d: number) =>
                0.5 * (2 * b + (-a + c) * e + (2 * a - 5 * b + 4 * c - d) * e * e + (-a + 3 * b - 3 * c + d) * e * e * e)
            const gw = Math.min(w, 840), gh = Math.min(h, 420)
            return { x: (w - gw) / 2 + cr(p0[0], p1[0], p2[0], p3[0]) * gw, y: (h - gh) / 2 + cr(p0[1], p1[1], p2[1], p3[1]) * gh }
        }

        let mode: "idle" | "seek" | "grow" | "hold" | "snap" = "idle"
        let violentSnap = false
        let grow = 0
        let seekF = 0
        let list: Strand[] = []
        let webs: [number, number, number, number, number][] = []
        let near = { s: 0, dist: 999 }

        let fireS = 0
        let hand = { x: -999, y: -999 }
        let anchor = { x: 0, y: 0 }
        let stretch = 0
        let lean = 0

        let sc = 1.55

        let drawn = true
        let shape = SHAPES.glove
        let grips = GRIPS

        const coat = new Float32Array(GRIPS.length)

        let splat: [number, number][] = []

        const gripAt = (g: [number, number]) =>
            drawn ? { x: hand.x + (g[0] - shape.hot[0]) * sc, y: hand.y + (g[1] - shape.hot[1]) * sc } : { x: hand.x + g[0], y: hand.y + g[1] }

        const spawn = () => {
            list = []
            const main = Math.max(2, Math.min(MS, Math.round(num(live.current.strands, 7, 2, MS))))
            const total = main * 2 - 1
            const root = at(fireS)
            for (let k = 0; k < total; k++) {
                const hair = k % 2 === 1
                const mi = Math.floor(k / 2)

                const g: [number, number] = hair
                    ? [(grips[mi % grips.length][0] + grips[(mi + 1) % grips.length][0]) / 2, (grips[mi % grips.length][1] + grips[(mi + 1) % grips.length][1]) / 2]
                    : grips[mi % grips.length]
                list.push({
                    x: new Float32Array(NP).fill(root.x), y: new Float32Array(NP).fill(root.y),
                    px: new Float32Array(NP).fill(root.x), py: new Float32Array(NP).fill(root.y),
                    spread: (k / (total - 1)) * 2 - 1 + (Math.random() - 0.5) * 0.15,
                    s: fireS,
                    slack: 1.02 + Math.random() * (hair ? 0.2 : 0.12),
                    width: hair ? 0.5 : 0.8 + Math.random() * 0.45,
                    grip: g,
                    gi: hair ? -1 : mi % grips.length,
                    ex: root.x, ey: root.y,
                    follow: 9 + Math.random() * 8,
                    seg: 0, phase: Math.random() * 10, hair,
                })
            }
            webs = []

            for (let k = 0; k < list.length - 1; k++) {
                const count = 2 + Math.floor(Math.random() * 3)
                for (let c = 0; c < count; c++) {
                    const i = 3 + Math.floor(Math.random() * (NP - 5))
                    const j = Math.max(2, Math.min(NP - 2, i + Math.round((Math.random() - 0.5) * 3)))
                    webs.push([k, k + 1, i, j, (Math.random() - 0.5) * 5])
                }
            }
            splat = Array.from({ length: 9 }, () => [(Math.random() - 0.5) * 0.35, 0.8 + Math.random() * 0.35] as [number, number])
            grow = 0
            mode = "seek"
        }

        const snap = (violent: boolean) => {
            if (mode === "idle" || mode === "snap") return
            mode = "snap"
            violentSnap = violent
        }

        const capS = (a: number) => {
            const { r, ls } = pill
            if (Math.cos(a) >= 0) return ls + (a + Math.PI / 2) * r
            const b = a < Math.PI / 2 ? a + Math.PI * 2 : a
            return 2 * ls + Math.PI * r + (b - Math.PI / 2) * r
        }
        const cobwebRing = (size: number): Cobweb[] => {
            const k = Math.min(size, pill.h * 1.05)
            return [
                { s: capS(-Math.PI * 0.75), size: k, drape: false },
                { s: capS(Math.PI * 0.22), size: k * 0.9, drape: false },
                { s: capS(Math.PI * 0.8), size: k * 0.55, drape: false },
                { s: pill.ls * 0.8, size: k * 0.7, drape: true },
            ]
        }

        const hash = (k: number, salt: number) => {
            const v = Math.sin((k + salt * 17.3) * 12.9898) * 43758.5453
            return v - Math.floor(v)
        }

        const pillPath = () => {
            const { x, y, w: W, h: H, r } = pill
            hx.beginPath()
            hx.moveTo(x + r, y)
            hx.lineTo(x + W - r, y)
            hx.arc(x + W - r, y + r, r, -Math.PI / 2, Math.PI / 2)
            hx.lineTo(x + r, y + H)
            hx.arc(x + r, y + r, r, Math.PI / 2, (Math.PI * 3) / 2)
            hx.closePath()
        }
        const drawCobwebs = (list: Cobweb[], thread: boolean, web: RGB, tingle: number) => {
            hx.save()
            pillPath()
            hx.clip()
            hx.lineCap = "round"
            hx.lineJoin = "round"
            if (thread) {
                const n = Math.max(24, Math.round(pill.P / 5))
                for (const [phase, alpha, width] of [[0, 0.85, 0.9], [Math.PI, 0.5, 0.6]] as const) {
                    hx.strokeStyle = cssRgb(web, alpha)
                    hx.lineWidth = width
                    hx.beginPath()
                    for (let k = 0; k <= n; k++) {
                        const sk = (k / n) * pill.P
                        const q = at(sk)
                        const inset = 2.6 + 0.7 * Math.sin(sk * 0.21 + phase) + 0.35 * Math.sin(sk * 0.053 + phase * 0.5)
                        const x = q.x - q.nx * inset, y = q.y - q.ny * inset
                        if (k === 0) hx.moveTo(x, y)
                        else hx.lineTo(x, y)
                    }
                    hx.closePath()
                    hx.stroke()
                }
            }
            hx.lineWidth = 0.75
            list.forEach((c, salt) => drawCobweb(c, salt, web, tingle))
            hx.restore()
        }
        const drawCobweb = (c: Cobweb, salt: number, web: RGB, tingle: number) => {
            const q = at(c.s)
            const cx = pill.x + pill.w / 2, cy = pill.y + pill.h / 2
            const facing = Math.max(0, Math.cos(Math.atan2(q.y - cy, q.x - cx) - Math.atan2(anchor.y - cy, anchor.x - cx)))
            hx.strokeStyle = cssRgb(web, Math.min(1, 0.72 + 0.28 * tingle * facing * facing))
            hx.beginPath()
            if (c.drape) {
                const loop = (s0: number, s1: number, sag: number) => {
                    const a = at(s0), b = at(s1)
                    hx.moveTo(a.x, a.y)
                    hx.quadraticCurveTo((a.x + b.x) / 2, Math.min(a.y, b.y) + sag * 2, b.x, b.y)
                }
                loop(c.s - c.size * 0.7, c.s + c.size * 0.7, c.size * 0.3)
                loop(c.s - c.size * 0.35, c.s + c.size * 1.05, c.size * 0.42)
                loop(c.s - c.size * 0.95, c.s + c.size * 0.2, c.size * 0.2)
                const b = at(c.s + c.size * 0.35)
                const lowY = b.y + c.size * 0.4
                hx.moveTo(b.x, lowY)
                hx.quadraticCurveTo(b.x + 2, lowY + c.size * 0.2, b.x - 1, lowY + c.size * 0.38)
                hx.stroke()
                return
            }

            const na = Math.atan2(-q.ny, -q.nx)
            const hubX = q.x - q.nx * 0.5, hubY = q.y - q.ny * 0.5
            const m = 7
            const spokes: [number, number][] = []
            for (let k = 0; k < m; k++) {
                const a = na + ((k / (m - 1)) * 2 - 1) * 1.25 + (hash(k, salt) - 0.5) * 0.2
                const L = c.size * (0.7 + 0.45 * hash(k, salt + 3))
                spokes.push([Math.cos(a) * L, Math.sin(a) * L])
                hx.moveTo(hubX, hubY)
                hx.lineTo(hubX + Math.cos(a) * L, hubY + Math.sin(a) * L)
            }

            const guy = (tipX: number, tipY: number, g: { x: number; y: number }) => {
                hx.moveTo(tipX, tipY)
                hx.quadraticCurveTo((tipX + g.x) / 2, Math.max(tipY, g.y) + c.size * 0.06, g.x, g.y)
            }
            guy(hubX + spokes[0][0], hubY + spokes[0][1], at(c.s - c.size * 0.6))
            guy(hubX + spokes[m - 1][0], hubY + spokes[m - 1][1], at(c.s + c.size * 0.6))

            let low = 0
            for (let k = 1; k < m; k++) if (spokes[k][1] > spokes[low][1]) low = k
            const lx = hubX + spokes[low][0], ly = hubY + spokes[low][1]
            const hang = c.size * (0.25 + 0.25 * hash(low, salt + 5))
            hx.moveTo(lx, ly)
            hx.quadraticCurveTo(lx + 2, ly + hang * 0.55, lx + 1, ly + hang)

            const rings = [0.3, 0.5, 0.7, 0.88]
            rings.forEach((f, ri) => {
                for (let k = 0; k < m - 1; k++) {
                    const ax = hubX + spokes[k][0] * f, ay = hubY + spokes[k][1] * f
                    const bx = hubX + spokes[k + 1][0] * f, by = hubY + spokes[k + 1][1] * f
                    if (hash(k * 5 + ri, salt + 11) < 0.16) {
                        const len = c.size * (0.1 + 0.14 * hash(k + ri, salt + 13))
                        hx.moveTo(ax, ay)
                        hx.quadraticCurveTo(ax + (bx - ax) * 0.2, ay + len * 0.6, ax + (bx - ax) * 0.1, ay + len)
                        continue
                    }
                    hx.moveTo(ax, ay)
                    hx.quadraticCurveTo(hubX + ((ax + bx) / 2 - hubX) * 0.8, hubY + ((ay + by) / 2 - hubY) * 0.8, bx, by)
                }
            })
            hx.stroke()
        }

        let raf = 0
        let prev = -1
        let t0 = -1
        const draw = (now: number) => {
            const dt = prev < 0 ? 0 : Math.min(0.033, (now - prev) / 1000)
            prev = now
            if (t0 < 0) t0 = now
            if (!w || !h) return
            const L = live.current
            const A = L.adv
            drawn = L.cursor !== "native" && !reduced
            shape = L.cursor === "arrow" ? SHAPES.arrow : SHAPES.glove
            grips = drawn ? shape.grips : NATIVE_GRIPS
            sc = num(A.gloveScale, 155, 50, 400) / 100
            const hk = num(A.hover, 50, 0, 100) / 50
            const suit = toRgb(L.suitColor, SUIT_FALLBACK)

            const borderOn = L.cobwebs !== false
            const cwSize = num(A.cobwebSize, 34, 10, 120)
            const cw = borderOn ? cobwebRing(cwSize) : []

            const threadOn = borderOn && A.threadBorder !== false
            const web = toRgb(L.webColor, WEB_FALLBACK)
            const shine = toRgb(A.shine, SHINE_FALLBACK)
            const thinK = num(A.stretchThin, 50, 0, 90) / 100
            const widthK = num(A.strandWidth, 100, 20, 300) / 100

            const pressTo = pressed ? num(A.pressScale, 96, 50, 100) / 100 : 1
            for (let i = 0; i < 4; i++) {
                const q = dt / 4
                pressV += (420 * (pressTo - press) - 18 * pressV) * q
                press += pressV * q
            }
            if (Math.abs(press - 1) < 1e-4 && Math.abs(pressV) < 1e-3) { press = 1; pressV = 0 }
            const transform = press === 1 ? "" : `scale(${press})`
            if (btn.style.transform !== transform) btn.style.transform = transform
            measure()
            const time = (now - t0) / 1000

            if (ptr.touch && !ptr.down && ptr.inside && now - ptr.upAt > num(A.lingerMs, 1700, 0, 10000)) { ptr.inside = false; ptr.last = now }
            const ghostOn = !!L.autoplay || onCanvas
            const ghost = ghostOn && !reduced && !ptr.down && (!touched || (!ptr.inside && now - ptr.last > num(A.ghostDelayMs, 2500, 0, 30000)))
            let present = ptr.inside
            if (ghost) { hand = ghostAt(time); present = true } else hand = { x: ptr.x, y: ptr.touch ? ptr.y - num(A.fingerLift, 52, 0, 200) : ptr.y }
            const stageCursor = drawn && !ghost && present ? "none" : ""
            if (stage.style.cursor !== stageCursor) stage.style.cursor = stageCursor
            const btnCursor = drawn ? "none" : "pointer"
            if (btn.style.cursor !== btnCursor) btn.style.cursor = btnCursor

            anchor = drawn ? { x: hand.x + (shape.mid[0] - shape.hot[0]) * sc, y: hand.y + (shape.mid[1] - shape.hot[1]) * sc } : { x: hand.x, y: hand.y }
            near = nearest(anchor.x, anchor.y)
            fireS = near.s
            const D = Math.max(0, near.dist)

            const dk = ptr.touch || (touchOnly && ghost) ? Math.max(0.55, Math.min(1, w / 560)) : 1

            const sn = num(A.sense, 290, 0, 2000) * dk * hk, rc = num(L.reach, 140, 0, 2000) * hk, rl = num(A.release, 215, 0, 2000) * hk
            const cx = pill.x + pill.w / 2
            lean += ((present ? Math.max(-1, Math.min(1, (hand.x - cx) / (pill.w * 1.5))) * Math.min(1, hk) : 0) - lean) * Math.min(1, dt * 4)

            if (!reduced) {
                if (mode === "idle" && present && D < sn) spawn()
                else if (mode === "snap" && !violentSnap && present && D < sn) mode = "seek"
                else if (mode === "seek" && (!present || D > sn + 25)) snap(false)
                else if (mode === "seek" && D < rc) { mode = "grow"; grow = 0 }
                else if ((mode === "grow" || mode === "hold") && (!present || D > rl)) snap(true)
            }
            const holding = mode === "hold" || mode === "grow"
            const seeking = mode === "seek"

            const fT = seeking ? Math.max(0, Math.min(1, (sn - D) / Math.max(1, sn - rc))) : holding ? 1 : 0
            seekF += (fT - seekF) * Math.min(1, dt * 5)
            stretch = holding ? Math.min(1, D / Math.max(1, rl)) : 0
            if (mode === "grow") {
                grow = Math.min(1, grow + dt / (num(A.lungeMs, 300, 50, 3000) / 1000))
                if (grow >= 1) mode = "hold"
            }

            const gravity = num(A.gravity, 65, 0, 2000)
            const swayAmp = num(A.sway, 5, 0, 100)
            const taut = (st: Strand) => 1 + (st.slack - 1) * 0.25

            const spreadPx = Math.max(14, Math.min(pill.w * 0.3, D * 0.4 + 14)) * (seeking ? 0.65 : 1)
            let alive = 0
            for (const st of list) {
                const target = fireS + st.spread * spreadPx
                st.s += loopDiff(st.s, target) * Math.min(1, dt * (mode === "snap" ? 1.5 : 6))
                const root = at(st.s)

                const out = -2.6
                const rx = root.x + root.nx * out, ry = root.y + root.ny * out
                let pinTip = false
                const gp = gripAt(st.grip)
                if (seeking) {
                    st.ex = rx
                    st.ey = ry
                    pinTip = true
                    st.seg = 0.01
                } else if (mode === "grow") {
                    const e = 1 - Math.pow(1 - grow, 3)
                    st.ex = rx + (gp.x - rx) * e
                    st.ey = ry + (gp.y - ry) * e
                    pinTip = true
                    st.seg = (Math.hypot(st.ex - rx, st.ey - ry) * taut(st)) / (NP - 1)
                } else if (holding) {
                    const k = 1 - Math.exp(-dt * st.follow * 1.4)
                    st.ex += (gp.x - st.ex) * k
                    st.ey += (gp.y - st.ey) * k
                    pinTip = true
                    st.seg = (Math.hypot(st.ex - rx, st.ey - ry) * taut(st)) / (NP - 1)
                } else {
                    st.seg *= Math.exp(-dt * 5.5)
                    if (st.seg * (NP - 1) > 1.5) alive++
                }
                const damp = mode === "snap" ? num(A.snapDamping, 86, 0, 99) / 100 : num(A.damping, 92, 0, 99) / 100
                for (let i = 1; i < NP; i++) {
                    const vx = (st.x[i] - st.px[i]) * damp, vy = (st.y[i] - st.py[i]) * damp
                    st.px[i] = st.x[i]; st.py[i] = st.y[i]
                    const mid = Math.sin((i / (NP - 1)) * Math.PI)
                    const wx = Math.sin(time * 1.6 + st.phase + i * 0.55) * swayAmp * mid
                    const wy = Math.cos(time * 1.3 + st.phase * 1.3 + i * 0.45) * swayAmp * mid
                    st.x[i] += vx + wx * dt * dt
                    st.y[i] += vy + (gravity + wy) * dt * dt
                }
                st.x[0] = st.px[0] = rx; st.y[0] = st.py[0] = ry
                if (pinTip) { st.x[NP - 1] = st.ex; st.y[NP - 1] = st.ey }
                const len = Math.max(0.01, st.seg)
                for (let it = 0; it < 14; it++) {
                    for (let i = 0; i < NP - 1; i++) {
                        const dx = st.x[i + 1] - st.x[i], dy = st.y[i + 1] - st.y[i]
                        const d = Math.hypot(dx, dy) || 0.0001
                        const diff = (d - len) / d
                        const a = i === 0 ? 0 : 0.5, b = pinTip && i + 1 === NP - 1 ? 0 : i === 0 ? 1 : 0.5
                        const m = a + b || 1
                        st.x[i] += dx * diff * (a / m); st.y[i] += dy * diff * (a / m)
                        st.x[i + 1] -= dx * diff * (b / m); st.y[i + 1] -= dy * diff * (b / m)
                    }
                }

                for (let pass = 0; pass < 2; pass++) {
                    for (let i = 1; i < NP - 1; i++) {
                        if (pinTip && i === NP - 1) continue
                        st.x[i] += ((st.x[i - 1] + st.x[i + 1]) / 2 - st.x[i]) * 0.22
                        st.y[i] += ((st.y[i - 1] + st.y[i + 1]) / 2 - st.y[i]) * 0.22
                    }
                }
                if (!Number.isFinite(st.x[NP - 1])) { st.x.fill(rx); st.y.fill(ry); st.px.fill(rx); st.py.fill(ry) }
            }
            if (mode === "snap" && alive === 0) { mode = "idle"; list = []; webs = [] }

            const thin = 1 - thinK * stretch

            const rim = num(A.rim, 100, 0, 300) / 100, glint = num(A.glint, 100, 0, 300) / 100
            const shadowK = shadowShows(L.background) ? num(A.shadow, 20, 0, 100) / 100 : 0
            const glKey = [w, h, pill.x, pill.y, pill.w, pill.h, lean.toFixed(3), suit, shine, rim, glint, shadowK].join("|")
            if (glKey !== lastGlKey) {
                gl.clearColor(0, 0, 0, 0)
                gl.clear(gl.COLOR_BUFFER_BIT)
                gl.uniform2f(U.uRes, glc.width, glc.height)
                gl.uniform1f(U.uDpr, dpr)
                gl.uniform4f(U.uPill, pill.x, pill.y, pill.w, pill.h)
                gl.uniform1f(U.uLean, lean)
                gl.uniform3f(U.uBase, suit[0], suit[1], suit[2])
                gl.uniform3f(U.uShine, shine[0], shine[1], shine[2])
                gl.uniform1f(U.uRim, rim)
                gl.uniform1f(U.uGlint, glint)
                gl.uniform1f(U.uShadow, shadowK)

                const pad = 34
                const x0 = Math.max(0, pill.x - pad), x1 = Math.min(w, pill.x + pill.w + pad), y0 = Math.max(0, pill.y - pad), y1 = Math.min(h, pill.y + pill.h + pad + 10)
                const X = (v: number) => (v / w) * 2 - 1, Y = (v: number) => 1 - (v / h) * 2
                quadData.set([X(x0), Y(y0), X(x1), Y(y0), X(x0), Y(y1), X(x1), Y(y1)])
                gl.bufferData(gl.ARRAY_BUFFER, quadData, gl.DYNAMIC_DRAW)
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
            }
            lastGlKey = glKey

            const splatIn = 1000 / num(A.splatInMs, 900, 100, 20000)
            const splatOut = 1000 / num(A.splatOutMs, 600, 50, 20000)
            for (let g = 0; g < coat.length; g++) {
                const caught = holding && list.some((st) => st.gi === g && Math.hypot(st.ex - gripAt(st.grip).x, st.ey - gripAt(st.grip).y) < 6)

                coat[g] = caught ? Math.min(1, coat[g] + dt * splatIn) : Math.max(0, coat[g] - dt * splatOut)
            }

            const tingle = seeking && A.senseLines !== false ? seekF : 0
            const ovMoving = list.length > 0 || (drawn && present) || tingle > 0.02
            const ovKey = ovMoving ? "" : [w, h, pill.x, pill.y, pill.w, pill.h, web, borderOn, cwSize, threadOn].join("|")
            if (ovMoving || ovKey !== lastOvKey) {
                hx.setTransform(dpr, 0, 0, dpr, 0, 0)
                hx.clearRect(0, 0, w, h)
                if (cw.length || threadOn) drawCobwebs(cw, threadOn, web, tingle)
            }
            lastOvKey = ovKey
            hx.lineCap = "round"
            hx.lineJoin = "round"
            if (tingle > 0.02) {
                const cx = pill.x + pill.w / 2, cy = pill.y + pill.h / 2
                const toward = Math.atan2(anchor.y - cy, anchor.x - cx)
                hx.strokeStyle = cssRgb(web, Math.min(1, 0.25 + 0.85 * tingle))
                hx.lineWidth = 2
                const n = 7
                for (let k = 0; k < n; k++) {
                    const a = toward + ((k / (n - 1)) * 2 - 1) * 1.22
                    const ca = Math.cos(a), sa = Math.sin(a)

                    const off = 10
                    const r0x = pill.w / 2 + off, r0y = pill.h / 2 + off
                    const flick = 0.75 + 0.25 * Math.sin(time * 31 + k * 2.3)
                    const len = (10 + 20 * tingle) * flick
                    const bx = cx + ca * r0x, by = cy + sa * r0y
                    hx.beginPath()
                    hx.moveTo(bx, by)
                    for (let z = 1; z <= 4; z++) {
                        const t = (z / 4) * len, side = (z % 2 ? 1 : -1) * 3.2 * (z < 4 ? 1 : 0)
                        hx.lineTo(bx + ca * t - sa * side, by + sa * t + ca * side)
                    }
                    hx.stroke()
                }
            }
            if (list.length && !seeking) {
                hx.strokeStyle = cssRgb(web, 0.95)
                for (const st of list) {
                    if (st.hair && A.hairs === false) continue
                    hx.lineWidth = (st.hair ? 0.7 : 1.5 * st.width) * widthK * thin
                    hx.beginPath()
                    hx.moveTo(st.x[0], st.y[0])
                    for (let i = 1; i < NP - 1; i++) hx.quadraticCurveTo(st.x[i], st.y[i], (st.x[i] + st.x[i + 1]) / 2, (st.y[i] + st.y[i + 1]) / 2)
                    hx.lineTo(st.x[NP - 1], st.y[NP - 1])
                    hx.stroke()
                }
                if (holding && A.webs !== false) {
                    hx.strokeStyle = cssRgb(web, 0.7)
                    hx.lineWidth = 0.6 * widthK
                    for (const [a, b, i, j, kink] of webs) {
                        const As = list[a], Bs = list[b]
                        if (!As || !Bs) continue
                        hx.beginPath()
                        hx.moveTo(As.x[i], As.y[i])
                        hx.quadraticCurveTo((As.x[i] + Bs.x[j]) / 2 + kink * 0.3, (As.y[i] + Bs.y[j]) / 2 + Math.abs(kink) * 0.8, Bs.x[j], Bs.y[j])
                        hx.stroke()
                    }
                }
            }

            if (drawn && present) {
                hx.save()
                hx.translate(hand.x - shape.hot[0] * sc, hand.y - shape.hot[1] * sc)
                hx.scale(sc, sc)
                hx.save()
                hx.translate(2.5, 4.5)
                hx.fillStyle = "rgba(0,0,0,0.15)"
                for (const p of shape.shadow) hx.fill(p)
                hx.restore()
                hx.fillStyle = "#ffffff"
                for (const p of shape.fill) hx.fill(p)
                hx.strokeStyle = "#0b0b0b"
                hx.lineJoin = "round"
                for (const [p, lw] of shape.stroke) { hx.lineWidth = lw; hx.stroke(p) }

                let held = 0
                for (let g = 0; g < coat.length; g++) held = Math.max(held, coat[g])
                if (held > 0.01 && splat.length) {
                    const e = held * held * (3 - 2 * held)
                    const [mx, my] = shape.creep
                    const R = 5 + e * 11
                    const spokes = splat.map(([j, l], k) => {
                        const a = (k / splat.length) * Math.PI * 2 + j
                        return [mx + Math.cos(a) * R * l, my + Math.sin(a) * R * l, a] as [number, number, number]
                    })
                    hx.lineCap = "round"
                    hx.lineJoin = "round"
                    const ink = (width: number) => {
                        hx.strokeStyle = "rgba(0,0,0,0.35)"
                        hx.lineWidth = width + 0.6
                        hx.stroke()
                        hx.strokeStyle = cssRgb(web)
                        hx.lineWidth = width
                        hx.stroke()
                    }
                    hx.beginPath()
                    for (const [x, y] of spokes) { hx.moveTo(mx, my); hx.lineTo(x, y) }
                    ink(0.6)
                    for (const f of [0.38, 0.7, 1]) {
                        if (f > 0.4 + e) continue
                        hx.beginPath()
                        spokes.forEach(([x, y], k) => {
                            const [nx, ny] = spokes[(k + 1) % spokes.length]
                            const ax = mx + (x - mx) * f, ay = my + (y - my) * f
                            const bx = mx + (nx - mx) * f, by = my + (ny - my) * f

                            const sx = mx + ((ax + bx) / 2 - mx) * 0.78, sy = my + ((ay + by) / 2 - my) * 0.78
                            if (k === 0) hx.moveTo(ax, ay)
                            hx.quadraticCurveTo(sx, sy, bx, by)
                        })
                        ink(0.45)
                    }
                }
                hx.restore()
            }
            if (holding && list.length) {
                hx.lineCap = "round"
                hx.lineJoin = "round"
                for (const st of list) {
                    const gp = gripAt(st.grip)
                    const gap = Math.hypot(st.ex - gp.x, st.ey - gp.y)
                    const on = Math.max(0, Math.min(1, 1 - gap / 14))
                    if (on <= 0) continue

                    const from = NP - 4
                    hx.globalAlpha = on

                    if (st.hair && A.hairs === false) { hx.globalAlpha = 1; continue }
                    hx.beginPath()
                    hx.moveTo(st.x[from], st.y[from])
                    for (let i = from + 1; i < NP - 1; i++) hx.quadraticCurveTo(st.x[i], st.y[i], (st.x[i] + st.x[i + 1]) / 2, (st.y[i] + st.y[i + 1]) / 2)
                    hx.lineTo(st.x[NP - 1], st.y[NP - 1])
                    const lw = (st.hair ? 0.7 : 1.5 * st.width) * widthK * thin
                    hx.strokeStyle = "rgba(0,0,0,0.35)"
                    hx.lineWidth = lw + 0.8
                    hx.stroke()
                    hx.strokeStyle = cssRgb(web)
                    hx.lineWidth = lw
                    hx.stroke()
                    hx.globalAlpha = 1
                }
            }
        }

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            draw(now)
        }
        const ro = new ResizeObserver(fit)
        ro.observe(stage)
        ro.observe(btn)
        fit()
        raf = requestAnimationFrame(frame)
        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            stage.removeEventListener("pointermove", onMove)
            stage.removeEventListener("pointerdown", onDown)
            stage.removeEventListener("pointerleave", onLeave)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
            btn.removeEventListener("keydown", onKeyDown)
            btn.removeEventListener("keyup", onKeyUp)
            btn.removeEventListener("blur", onKeyUp)
            glc.removeEventListener("webglcontextlost", onContextLost)
            stage.style.cursor = ""
            btn.style.cursor = ""
            btn.style.transform = ""
            disposeGL()
        }
    }, [])

    const suit = toRgb(suitColor, SUIT_FALLBACK)
    const pad = Math.round(num(size, 64, 24, 240) * 0.5625)
    const grain = num(adv.grain, 0, 0, 100) / 100
    const vignette = num(adv.vignette, 0, 0, 100) / 100

    return (
        <div
            ref={stageRef}
            style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                minWidth: 320,
                minHeight: 240,
                overflow: "hidden",

                touchAction: "pan-y",
                background,
                ...style,
            }}
        >
            <style>{`.spider-pill{outline:none}.spider-pill:focus-visible{outline:3px solid rgba(255,255,255,.35);outline-offset:5px}`}</style>
            <canvas ref={handRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }} aria-hidden="true" />
            <canvas ref={glRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 10 }} aria-hidden="true" />
            <button
                ref={btnRef}
                type="button"
                className="spider-pill"
                onClick={onClick}
                style={{
                    position: "relative",
                    zIndex: 20,
                    height: num(size, 64, 24, 240),
                    padding: `0 ${pad}px`,
                    borderRadius: 9999,
                    border: 0,
                    margin: 0,
                    color: textColor,
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Inter, system-ui, sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    ...font,
                    transformOrigin: "50% 50%",
                    WebkitTapHighlightColor: "transparent",
                    background: fallback
                        ? `linear-gradient(180deg,${cssRgb(mixRgb(suit, [1, 1, 1], 0.1))} 0%,${cssRgb(suit)} 42%,${cssRgb(mixRgb(suit, [0, 0, 0], 0.7))} 100%)`
                        : "transparent",
                    boxShadow: fallback
                        ? "inset 0 1px 0 rgba(255,255,255,.14), inset 0 -1.5px 0 rgba(255,255,255,.22), 0 18px 28px -14px rgba(0,0,0,.55)"
                        : "none",
                    textShadow: "0 1px 0 rgba(0,0,0,.75), 0 -0.5px 0 rgba(255,255,255,.25)",
                }}
            >
                {label}
            </button>
            {vignette > 0 && (
                <div
                    aria-hidden="true"
                    style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        zIndex: 35,
                        background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 40%, rgba(0,0,0,${0.85 * vignette}) 100%)`,
                    }}
                />
            )}
            {grain > 0 && (
                <div
                    aria-hidden="true"
                    style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 40, opacity: 0.45 * grain, backgroundImage: GRAIN_URL, backgroundSize: "180px 180px" }}
                />
            )}
        </div>
    )
}
