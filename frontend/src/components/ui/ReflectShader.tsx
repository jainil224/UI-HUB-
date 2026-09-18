// Reflect Shader — Originkit

"use client"

import * as React from "react"

const VERT = `
attribute vec2 aPosition;
void main() { gl_Position = vec4(aPosition, 0.0, 1.0); }
`

const FRAG = `
precision highp float;
#define MAXLINES 12

uniform vec2  uResolution;
uniform float uTime;
uniform float uLineWidth;
uniform float uSpread;
uniform float uBands;
uniform float uScale;
uniform float uIntensity;
uniform int   uLineCount;
uniform vec3  uTint;

uniform vec2  uPointer;
uniform float uHover;
uniform float uReach;

float channel(vec2 uv, float r, float t, float jf) {
    float sum = 0.0;
    float band = mod(uv.x + uv.y, uBands);
    for (int i = 0; i < MAXLINES; i++) {
        if (i < uLineCount) {
            float d = fract(t - uSpread * jf + float(i) * 0.01) * 5.0 - r + band;
            sum += uLineWidth * float(i * i) / max(abs(d), 1e-4);
        }
    }
    return sum;
}

void main() {
    vec2 s = (gl_FragCoord.xy * 2.0 - uResolution) / min(uResolution.x, uResolution.y);
    s *= uScale;

    vec2 uv = s - uPointer * min(uHover, 1.0);

    float reach = max(uReach, 1e-3);
    float r = length(uv);

    float t = uTime * 0.05;
    vec3 color = vec3(
        channel(uv, r, t, 0.0),
        channel(uv, r, t, 1.0),
        channel(uv, r, t, 2.0)
    );

    float dp = length(s - uPointer) / reach;
    float glow = uHover * exp(-dp * dp);

    vec3 c = min(color * uIntensity * (1.0 + glow) * uTint, vec3(1.0));
    gl_FragColor = vec4(c, clamp(max(max(c.r, c.g), c.b), 0.0, 1.0));
}
`

const MAX_DPR = 2

const BASE_RATE = 3

const LINE_COUNT = 5

const FOLLOW_RATE = 8

const HOVER_REACH_PX = 260

interface ShaderGroupSwitcherProps {
    background?: string
    tint?: string
    speed?: number
    brightness?: number
    thickness?: number
    chromatic?: number
    bandGap?: number
    zoom?: number
    hover?: number
    style?: React.CSSProperties
}

function parseColor(input: string | undefined): [number, number, number] {
    if (!input) return [1, 1, 1]
    const s = input.trim()
    if (s[0] === "#") {
        let hex = s.slice(1)
        if (hex.length === 3 || hex.length === 4) {
            hex = hex
                .slice(0, 3)
                .split("")
                .map((c) => c + c)
                .join("")
        }
        const n = parseInt(hex.slice(0, 6), 16)
        if (Number.isNaN(n)) return [1, 1, 1]
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
    }
    const m = s.match(/rgba?\(([^)]+)\)/i)
    if (m) {
        const parts = m[1].split(",").map((p) => parseFloat(p))
        return [(parts[0] || 0) / 255, (parts[1] || 0) / 255, (parts[2] || 0) / 255]
    }
    return [1, 1, 1]
}

export default function ShaderGroupSwitcher(props: ShaderGroupSwitcherProps) {
    const {
        background = "#020202",
        tint = "#ffffff",
        speed = 50,
        brightness = 100,
        thickness = 20,
        chromatic = 10,
        bandGap = 20,
        zoom = 295,
        hover = 90,
        style,
        ...rest
    } = props

    const canvasRef = React.useRef<HTMLCanvasElement | null>(null)

    const live = React.useRef({
        speed,
        brightness,
        thickness,
        chromatic,
        bandGap,
        zoom,
        tint,
        hover,
    })
    live.current = {
        speed,
        brightness,
        thickness,
        chromatic,
        bandGap,
        zoom,
        tint,
        hover,
    }

    const ptr = React.useRef({
        tx: 0,
        ty: 0,
        x: 0,
        y: 0,

        inside: 0,
        ease: 0,
    })

    const toUv = (e: React.PointerEvent) => {
        const el = e.currentTarget as HTMLElement
        const w = el.clientWidth || 1
        const h = el.clientHeight || 1
        const m = Math.min(w, h)
        const n = e.nativeEvent as PointerEvent
        return { x: (n.offsetX * 2 - w) / m, y: (h - n.offsetY * 2) / m }
    }

    React.useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const gl = canvas.getContext("webgl", {
            antialias: false,
            alpha: true,
            premultipliedAlpha: true,
        })
        if (!gl) return

        const compile = (type: number, src: string) => {
            const sh = gl.createShader(type)!
            gl.shaderSource(sh, src)
            gl.compileShader(sh)
            return sh
        }
        const program = gl.createProgram()!
        gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
        gl.useProgram(program)

        const buffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW
        )
        const aPosition = gl.getAttribLocation(program, "aPosition")
        gl.enableVertexAttribArray(aPosition)
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

        const u = {
            resolution: gl.getUniformLocation(program, "uResolution"),
            time: gl.getUniformLocation(program, "uTime"),
            lineWidth: gl.getUniformLocation(program, "uLineWidth"),
            spread: gl.getUniformLocation(program, "uSpread"),
            bands: gl.getUniformLocation(program, "uBands"),
            scale: gl.getUniformLocation(program, "uScale"),
            intensity: gl.getUniformLocation(program, "uIntensity"),
            lineCount: gl.getUniformLocation(program, "uLineCount"),
            tint: gl.getUniformLocation(program, "uTint"),
            pointer: gl.getUniformLocation(program, "uPointer"),
            hover: gl.getUniformLocation(program, "uHover"),
            reach: gl.getUniformLocation(program, "uReach"),
        }

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
            const w = Math.max(1, Math.round((canvas.clientWidth || 1) * dpr))
            const h = Math.max(1, Math.round((canvas.clientHeight || 1) * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w
                canvas.height = h
            }
            gl.viewport(0, 0, w, h)
            gl.uniform2f(u.resolution, w, h)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        let raf = 0
        let last = 0
        let t = 0
        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const dt = last ? Math.min((now - last) / 1000, 1 / 15) : 0
            last = now
            const l = live.current
            t = (t + BASE_RATE * (l.speed / 50) * dt) % 20000
            gl.uniform1f(u.time, t)
            gl.uniform1f(u.lineWidth, l.thickness / 10000)
            gl.uniform1f(u.spread, l.chromatic / 1000)
            gl.uniform1f(u.bands, Math.max(l.bandGap, 1) / 100)
            gl.uniform1f(u.scale, l.zoom / 100)
            gl.uniform1f(u.intensity, l.brightness / 100)
            gl.uniform1i(u.lineCount, LINE_COUNT)
            const [r, g, b] = parseColor(l.tint)
            gl.uniform3f(u.tint, r, g, b)

            const p = ptr.current
            const k = 1 - Math.exp(-dt * FOLLOW_RATE)
            p.x += (p.tx - p.x) * k
            p.y += (p.ty - p.y) * k
            p.ease += (p.inside - p.ease) * k

            const scale = l.zoom / 100

            const side = Math.max(
                1,
                Math.min(canvas.clientWidth || 1, canvas.clientHeight || 1)
            )
            const reachUv = ((HOVER_REACH_PX * 2) / side) * scale

            gl.uniform2f(u.pointer, p.x * scale, p.y * scale)
            gl.uniform1f(u.hover, (l.hover / 100) * p.ease)
            gl.uniform1f(u.reach, reachUv)

            gl.drawArrays(gl.TRIANGLES, 0, 3)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [])

    return (
        <div
            {...rest}
            onPointerMove={(e) => {
                const { x, y } = toUv(e)
                const p = ptr.current
                p.tx = x
                p.ty = y
                p.inside = 1
            }}
            onPointerLeave={() => {
                const p = ptr.current
                p.tx = 0
                p.ty = 0
                p.inside = 0
            }}
            style={{
                width: "100%",
                height: "100%",
                minWidth: 1200,
                minHeight: 800,
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

                    pointerEvents: "none",
                }}
            />
        </div>
    )
}

ShaderGroupSwitcher.displayName = "Shader Animation"