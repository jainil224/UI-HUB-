// Lightfall — Originkit
// Using component defaults.

"use client"

import React, { useEffect, useRef } from "react"

type RGB = [number, number, number]

const MAX_COLORS = 8

const hexToRGB = (input: string): RGB => {
    if (!input) return [0, 0, 0]
    const s = input.trim()
    const rgb = s.match(/rgba?\(([^)]+)\)/i)
    if (rgb) {
        const p = rgb[1].split(",").map((v) => parseFloat(v.trim()))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    let h = s.replace("#", "")
    if (h.length === 3 || h.length === 4) {
        h = h
            .split("")
            .map((c) => c + c)
            .join("")
    }
    h = h.padEnd(6, "0")
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ]
}

const prepColors = (input?: string[]) => {
    const base = (
        input && input.length ? input : ["#A6C8FF", "#5227FF", "#FF9FFC"]
    ).slice(0, MAX_COLORS)
    const count = base.length
    const arr: RGB[] = []
    for (let i = 0; i < MAX_COLORS; i++)
        arr.push(hexToRGB(base[Math.min(i, base.length - 1)]))
    const avg: RGB = [0, 0, 0]
    for (let i = 0; i < count; i++) {
        avg[0] += arr[i][0]
        avg[1] += arr[i][1]
        avg[2] += arr[i][2]
    }
    avg[0] /= count
    avg[1] /= count
    avg[2] /= count
    return { arr, count, avg }
}

const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragment = `
precision highp float;

uniform vec3  iResolution;
uniform float iTime;

uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

uniform vec3  uBgColor;
uniform float uSpeed;
uniform int   uStreakCount;
uniform float uStreakWidth;
uniform float uStreakLength;
uniform float uGlow;
uniform float uDensity;
uniform float uTwinkle;
uniform float uZoom;
uniform float uBgGlow;
uniform float uOpacity;

varying vec2 vUv;

vec3 palette(float h) {
  int count = uColorCount;
  if (count < 1) count = 1;
  int idx = int(floor(clamp(h, 0.0, 0.999999) * float(count)));
  if (idx <= 0) return uColor0;
  if (idx == 1) return uColor1;
  if (idx == 2) return uColor2;
  if (idx == 3) return uColor3;
  if (idx == 4) return uColor4;
  if (idx == 5) return uColor5;
  if (idx == 6) return uColor6;
  return uColor7;
}

vec3 tanhv(vec3 x) {
  vec3 e = exp(-2.0 * x);
  return (1.0 - e) / (1.0 + e);
}

vec2 sceneC(vec2 frag, vec2 r) {
  vec2 P = (frag + frag - r) / r.x;
  float z = 0.0;
  float d = 1e3;
  vec4 O = vec4(0.0);
  for (int k = 0; k < 39; k++) {
    if (d <= 1e-4) break;
    O = z * normalize(vec4(P, uZoom, 0.0)) - vec4(0.0, 4.0, 1.0, 0.0) / 4.5;
    d = 1.0 - sqrt(length(O * O));
    z += d;
  }
  return vec2(O.x, atan(O.z, O.y));
}

void mainImage(out vec4 o, vec2 C) {
  vec2 r = iResolution.xy;
  vec2 uv0 = (C + C - r) / r.x;
  float T = 0.1 * iTime * uSpeed + 9.0;
  float angRings = max(1.0, floor(6.28318530718 * max(uDensity, 0.05) + 0.5));
  vec2 Y = vec2(5e-3, 6.28318530718 / angRings);

  vec2 c0 = sceneC(C, r);
  vec2 cdx = sceneC(C + vec2(1.0, 0.0), r);
  vec2 cdy = sceneC(C + vec2(0.0, 1.0), r);
  vec2 dCx = cdx - c0;
  vec2 dCy = cdy - c0;
  dCx.y -= 6.28318530718 * floor(dCx.y / 6.28318530718 + 0.5);
  dCy.y -= 6.28318530718 * floor(dCy.y / 6.28318530718 + 0.5);
  vec2 fw = abs(dCx) + abs(dCy);
  C = c0;

  vec2 P = vec2(2.0, 1.0) * uv0 - (r / r.x) * vec2(0.0, 1.0);
  vec4 O = vec4(uBgColor * 90.0 * uBgGlow / (1e3 * dot(P, P) + 6.0), 0.0);

  float zr = 5e-4 * uStreakWidth;
  vec2 rr = vec2(max(length(fw), 1e-5));
  float tail = 19.0 / max(uStreakLength, 0.05);

  for (int m = 0; m < 16; m++) {
    if (m >= uStreakCount) break;
    float jf = float(m) + 1.0;
    float ic = fract(sin(dot(vec2(jf, floor(C.x / Y.x + 0.5)), vec2(7.0, 11.0)) * 73.0));
    vec2 Pp = C - (T + T * ic) * vec2(0.0, 1.0);
    Pp -= floor(Pp / Y + 0.5) * Y;
    float h = fract(8663.0 * ic);
    vec3 col = palette(h);
    float weight = mix(1.5, 1.0 + sin(T + 7.0 * h + 4.0), uTwinkle);
    vec2 inner = vec2(length(max(Pp, vec2(-1.0, 0.0))), length(Pp) - zr) - zr;
    vec2 sm = vec2(1.0) - smoothstep(-rr, rr, inner);
    O.rgb += dot(sm, vec2(exp(tail * Pp.y), 3.0)) * col * weight;
    C.x += Y.x / 8.0;
  }

  vec3 colr = sqrt(tanhv(max(O.rgb * uGlow - vec3(0.04, 0.08, 0.02), 0.0)));
  o = vec4(colr, uOpacity);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`

const compile = (
    gl: WebGLRenderingContext,
    type: number,
    src: string
): WebGLShader | null => {
    const sh = gl.createShader(type)
    if (!sh) return null
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh))
        gl.deleteShader(sh)
        return null
    }
    return sh
}

interface LightfallProps {
    width?: number
    height?: number
    colors?: string[]
    backgroundColor?: string
    speed?: number
    streakCount?: number
    streakWidth?: number
    streakLength?: number
    glow?: number
    density?: number
    twinkle?: number
    zoom?: number
    backgroundGlow?: number
    opacity?: number
    style?: React.CSSProperties
}

export default function Lightfall(props: LightfallProps) {
    const {
        width,
        height,
        colors = ["#A6C8FF", "#00CA9A"],
        backgroundColor = "#000000",
        speed = 200,
        streakCount = 7,
        streakWidth = 207,
        streakLength = 66,
        glow = 29,
        density = 111,
        twinkle = 100,
        zoom = 1,
        backgroundGlow = 200,
        opacity = 100,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)

    // All live inputs live here — read inside the loop, never re-init the GL.
    // Computed on every render (pure, cheap) so the loop always sees latest.
    const paramsRef = useRef<any>(null)
    {
        const { arr, count, avg } = prepColors(colors)
        paramsRef.current = {
            colors: arr,
            count,
            avg,
            bg: hexToRGB(backgroundColor),
            speed: speed / 100,
            streakCount: Math.max(1, Math.min(16, Math.round(streakCount))),
            streakWidth: streakWidth / 100,
            streakLength: streakLength / 100,
            glow: glow / 100,
            density: density / 100,
            twinkle: twinkle / 100,
            zoom,
            bgGlow: backgroundGlow / 100,
            opacity: opacity / 100,
        }
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const dpr = Math.min(
            typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
            2
        )

        const canvas = document.createElement("canvas")
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.display = "block"
        container.appendChild(canvas)

        const gl = (canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
        }) ||
            canvas.getContext("experimental-webgl", {
                alpha: true,
            })) as WebGLRenderingContext | null
        if (!gl) return

        const vs = compile(gl, gl.VERTEX_SHADER, vertex)
        const fs = compile(gl, gl.FRAGMENT_SHADER, fragment)
        if (!vs || !fs) return
        const program = gl.createProgram()!
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)
        gl.linkProgram(program)
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(program))
            return
        }
        gl.useProgram(program)

        // Fullscreen triangle (matches ogl Triangle: uv 0..1 over visible area).
        const posBuf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuf)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW
        )
        const posLoc = gl.getAttribLocation(program, "position")
        gl.enableVertexAttribArray(posLoc)
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

        const uvBuf = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf)
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([0, 0, 2, 0, 0, 2]),
            gl.STATIC_DRAW
        )
        const uvLoc = gl.getAttribLocation(program, "uv")
        gl.enableVertexAttribArray(uvLoc)
        gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0)

        const u = (name: string) => gl.getUniformLocation(program, name)
        const loc = {
            iResolution: u("iResolution"),
            iTime: u("iTime"),
            colors: Array.from({ length: MAX_COLORS }, (_, i) =>
                u(`uColor${i}`)
            ),
            uColorCount: u("uColorCount"),
            uBgColor: u("uBgColor"),
            uSpeed: u("uSpeed"),
            uStreakCount: u("uStreakCount"),
            uStreakWidth: u("uStreakWidth"),
            uStreakLength: u("uStreakLength"),
            uGlow: u("uGlow"),
            uDensity: u("uDensity"),
            uTwinkle: u("uTwinkle"),
            uZoom: u("uZoom"),
            uBgGlow: u("uBgGlow"),
            uOpacity: u("uOpacity"),
        }

        let bufW = 1
        let bufH = 1

        const resize = () => {
            const rect = container.getBoundingClientRect()
            bufW = Math.max(1, Math.round(rect.width * dpr))
            bufH = Math.max(1, Math.round(rect.height * dpr))
            canvas.width = bufW
            canvas.height = bufH
            gl.viewport(0, 0, bufW, bufH)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(container)

        let raf = 0
        const loop = (t: number) => {
            raf = requestAnimationFrame(loop)
            const p = paramsRef.current
            if (!p) return

            gl.uniform3f(loc.iResolution, bufW, bufH, 1)
            gl.uniform1f(loc.iTime, t * 0.001)
            for (let i = 0; i < MAX_COLORS; i++) {
                const c = p.colors[i]
                gl.uniform3f(loc.colors[i], c[0], c[1], c[2])
            }
            gl.uniform1i(loc.uColorCount, p.count)
            gl.uniform3f(loc.uBgColor, p.bg[0], p.bg[1], p.bg[2])
            gl.uniform1f(loc.uSpeed, p.speed)
            gl.uniform1i(loc.uStreakCount, p.streakCount)
            gl.uniform1f(loc.uStreakWidth, p.streakWidth)
            gl.uniform1f(loc.uStreakLength, p.streakLength)
            gl.uniform1f(loc.uGlow, p.glow)
            gl.uniform1f(loc.uDensity, p.density)
            gl.uniform1f(loc.uTwinkle, p.twinkle)
            gl.uniform1f(loc.uZoom, p.zoom)
            gl.uniform1f(loc.uBgGlow, p.bgGlow)
            gl.uniform1f(loc.uOpacity, p.opacity)

            gl.drawArrays(gl.TRIANGLES, 0, 3)
        }
        raf = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            // Never loseContext() — StrictMode remount would reuse a dead one.
            if (canvas.parentElement === container)
                container.removeChild(canvas)
        }
    }, [])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                overflow: "hidden",
                minWidth: 1200,
                minHeight: 800,
                width: typeof width === "number" ? width : "100%",
                height: typeof height === "number" ? height : "100%",
                ...style,
            }}
        />
    )
}

Lightfall.displayName = "Lightfall"
