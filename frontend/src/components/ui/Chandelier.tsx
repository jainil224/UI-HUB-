"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const MAX_DPR = 2
const FACE = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
const QA = Math.PI / 36
const H = 1 / 120

type Node = {
    x: number
    y: number
    px: number
    py: number
    pin: { x: number; y: number } | null
}

function num(v: unknown, fb: number): number {
    return typeof v === "number" && isFinite(v) ? v : fb
}

function clampN(v: number, lo: number, hi: number): number {
    return v < lo ? lo : v > hi ? hi : v
}

function parseRGB(input: string | undefined, fb: [number, number, number]): [number, number, number] {
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
            if (!isNaN(r) && !isNaN(g) && !isNaN(b)) return [r, g, b]
        }
        return fb
    }
    const m = str.match(/[\d.]+/g)
    if (m && m.length >= 3) return [+m[0], +m[1], +m[2]]
    return fb
}

type ClothGroup = { gravity?: number; wind?: number; grab?: number; stretch?: number }
const CLOTH_DEFAULTS: Required<ClothGroup> = { gravity: 100, wind: 100, grab: 100, stretch: 114 }

interface Props {
    style?: React.CSSProperties
    width?: number
    height?: number
    background?: string
    baseColor?: string
    phrase?: string
    density?: number
    speed?: number
    hover?: number
    cloth?: ClothGroup
}

function __OriginkitBase_ClothStudy(props: Props) {
    const {
        style,
        background = "#0B0C0E",
        baseColor = "#00F9AC",
        phrase = "thefabricremembersthelineitwasgivenandkeepsonsayingitwhilethewindpullsatthecorners",
        density = 24,
        speed = 50,
        hover = 100,
        cloth,
        width,
        height,
    } = props

    const cloth_ = { ...CLOTH_DEFAULTS, ...(cloth || {}) }

    const canvasRef = useRef<HTMLCanvasElement>(null)
    const sizeRef = useRef({ w: 0, h: 0 })
    sizeRef.current = { w: num(width, 0), h: num(height, 0) }

    const ptrRef = useRef({ on: 0, x: -1e9, y: -1e9, down: 0, up: 0 })

    const vRef = useRef<Record<string, number | string>>({})
    vRef.current = {
        base: baseColor,
        phrase: String(phrase || "").length ? String(phrase) : "cloth",
        density: Math.round(clampN(num(density, 19), 6, 40)),
        speed: clampN(num(speed, 50), 0, 100) / 50,
        hover: clampN(num(hover, 100), 0, 200) / 100,
        gravity: clampN(num(cloth_.gravity, 100), 0, 300) / 100,
        wind: clampN(num(cloth_.wind, 100), 0, 400) / 100,
        grab: clampN(num(cloth_.grab, 100), 20, 300) / 100,
        stretch: clampN(num(cloth_.stretch, 114), 101, 200) / 100,
    }

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) {
            console.error("ClothStudy: 2D context unavailable")
            return
        }

        let GX = 0
        let GY = 0
        let pts: Node[] = []
        let rest = 0
        let builtKey = ""
        let held: Node | null = null
        let heldX = 0
        let heldY = 0

        const P = (i: number, j: number) => pts[j * GX + i]

        const build = (cols: number, cw: number, ch: number) => {
            GX = cols
            GY = Math.max(4, Math.round(cols * 1.105))
            const u = Math.min(cw, ch)
            rest = (u * 0.58) / (GX - 1)
            const x0 = cw / 2 - (rest * (GX - 1)) / 2
            const y0 = ch * 0.185
            pts = []
            for (let j = 0; j < GY; j++) {
                for (let i = 0; i < GX; i++) {
                    const x = x0 + i * rest
                    const y = y0 + j * rest
                    pts.push({
                        x,
                        y,
                        px: x,
                        py: y,
                        pin: j === 0 && (i % 5 === 0 || i === GX - 1) ? { x, y } : null,
                    })
                }
            }
            held = null
            builtKey = cols + "|" + Math.round(cw) + "x" + Math.round(ch)
        }

        const solve = (a: Node, b: Node, len: number) => {
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy) || 1e-4
            const diff = ((d - len) / d) * 0.5
            const ox = dx * diff
            const oy = dy * diff
            a.x += ox
            a.y += oy
            b.x -= ox
            b.y -= oy
        }

        const clampLink = (a: Node, b: Node, lim: number) => {
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d = Math.hypot(dx, dy)
            if (d <= lim || d < 1e-4) return
            const f = ((d - lim) / d) * 0.5
            const ox = dx * f
            const oy = dy * f
            if (a !== held && !a.pin) {
                a.x += ox
                a.y += oy
            }
            if (b !== held && !b.pin) {
                b.x -= ox
                b.y -= oy
            }
        }

        let wind = 0
        let acc = 0

        const substep = (h: number, cw: number, ch: number, v: Record<string, number | string>) => {
            const u = Math.min(cw, ch)
            const g = u * 1.6 * (v.gravity as number)
            wind += h
            const hh = h * h
            const damp = 0.992
            const ptr = ptrRef.current
            const brushOn = ptr.on && !held && (v.hover as number) > 0

            for (let k = 0; k < pts.length; k++) {
                const p = pts[k]
                if (p === held) {
                    p.px = p.x
                    p.py = p.y
                    p.x += (heldX - p.x) * 0.45
                    p.y += (heldY - p.y) * 0.45
                    continue
                }
                if (p.pin) {
                    p.x = p.pin.x
                    p.y = p.pin.y
                    p.px = p.x
                    p.py = p.y
                    continue
                }
                const vx = (p.x - p.px) * damp
                const vy = (p.y - p.py) * damp
                p.px = p.x
                p.py = p.y
                const breeze =
                    (Math.sin(wind * 1.9 + p.y * 0.035) * 0.55 + Math.sin(wind * 0.7) * 0.45) *
                    u *
                    0.55 *
                    (v.wind as number)
                p.x += vx + breeze * hh
                p.y += vy + g * hh
                if (brushOn) {
                    const dx = p.x - ptr.x
                    const dy = p.y - ptr.y
                    const d = Math.hypot(dx, dy)
                    const rr = u * 0.13 * (v.grab as number)
                    if (d < rr && d > 0.001) {
                        const push = (1 - d / rr) * (1 - d / rr) * u * 0.008 * (v.hover as number)
                        p.x += (dx / d) * push
                        p.y += (dy / d) * push
                    }
                }
            }

            const iters = held ? 12 : 6
            for (let it = 0; it < iters; it++) {
                for (let j = 0; j < GY; j++) {
                    for (let i = 0; i < GX; i++) {
                        if (i < GX - 1) solve(P(i, j), P(i + 1, j), rest)
                        if (j < GY - 1) solve(P(i, j), P(i, j + 1), rest)
                    }
                }
                for (let m = 0; m < pts.length; m++) {
                    const q = pts[m]
                    if (q === held) {
                        q.x = heldX
                        q.y = heldY
                        continue
                    }
                    if (q.pin) {
                        q.x = q.pin.x
                        q.y = q.pin.y
                    }
                }
            }

            const lim = rest * (v.stretch as number)
            for (let j = 0; j < GY; j++) {
                for (let i = 0; i < GX; i++) {
                    if (i < GX - 1) clampLink(P(i, j), P(i + 1, j), lim)
                    if (j < GY - 1) clampLink(P(i, j), P(i, j + 1), lim)
                }
            }
        }

        let raf = 0
        let last = performance.now()
        let seenDown = 0

        const render = (now: number) => {
            const dt = Math.min(0.05, (now - last) / 1000)
            last = now
            const v = vRef.current
            const sp = v.speed as number

            const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
            const cw = sizeRef.current.w || canvas.clientWidth || 1200
            const ch = sizeRef.current.h || canvas.clientHeight || 800
            const bw = Math.max(1, Math.round(cw * dpr))
            const bh = Math.max(1, Math.round(ch * dpr))
            if (canvas.width !== bw || canvas.height !== bh) {
                canvas.width = bw
                canvas.height = bh
            }
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.clearRect(0, 0, cw, ch)

            const key = (v.density as number) + "|" + Math.round(cw) + "x" + Math.round(ch)
            if (key !== builtKey) build(v.density as number, cw, ch)

            const ptr = ptrRef.current
            if (ptr.down !== seenDown) {
                seenDown = ptr.down
                let best: Node | null = null
                let bd = 1e9
                const u = Math.min(cw, ch)
                for (let k = 0; k < pts.length; k++) {
                    const q = pts[k]
                    if (q.pin) continue
                    const d = (q.x - ptr.x) * (q.x - ptr.x) + (q.y - ptr.y) * (q.y - ptr.y)
                    if (d < bd) {
                        bd = d
                        best = q
                    }
                }
                const reach = u * 0.24 * (v.grab as number)
                if (best && bd < reach * reach && (v.hover as number) > 0) {
                    held = best
                    heldX = ptr.x
                    heldY = ptr.y
                }
            }
            if (!ptr.on || ptr.up === ptr.down) held = held
            if (held) {
                heldX = ptr.x
                heldY = ptr.y
            }

            acc += Math.min(0.05, dt * sp)
            let guard = 0
            while (acc >= H && guard++ < 2) {
                acc -= H
                substep(H, cw, ch, v)
            }

            const ink = parseRGB(v.base as string, [226, 228, 233])
            const rgb = ink[0] + "," + ink[1] + "," + ink[2]
            const fs = rest * 0.86
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.font = "bold " + fs.toFixed(2) + "px " + FACE

            const text = v.phrase as string
            let idx = 0
            for (let j = 0; j < GY - 1; j++) {
                for (let i = 0; i < GX - 1; i++) {
                    const a = P(i, j)
                    const b = P(i + 1, j)
                    const c = P(i, j + 1)
                    const d2 = P(i + 1, j + 1)
                    const mx = (a.x + b.x + c.x + d2.x) / 4
                    const my = (a.y + b.y + c.y + d2.y) / 4
                    const ex = (b.x - a.x + (d2.x - c.x)) / 2
                    const ey = (b.y - a.y + (d2.y - c.y)) / 2
                    const fx = (c.x - a.x + (d2.x - b.x)) / 2
                    const fy = (c.y - a.y + (d2.y - b.y)) / 2
                    const sx = Math.hypot(ex, ey) / rest
                    const sy = Math.hypot(fx, fy) / rest
                    const area = Math.abs(ex * fy - ey * fx) / (rest * rest)
                    const a2 = 0.2 + 0.75 * Math.min(1, area)
                    ctx.save()
                    ctx.translate(mx, my)
                    ctx.rotate(Math.round(Math.atan2(ey, ex) / QA) * QA)
                    ctx.scale(Math.max(0.15, Math.min(1.7, sx)), Math.max(0.15, Math.min(1.7, sy)))
                    ctx.fillStyle = "rgba(" + rgb + "," + a2.toFixed(3) + ")"
                    ctx.fillText(text.charAt(idx++ % text.length), 0, 0)
                    ctx.restore()
                }
            }

            for (let i = 0; i < GX; i++) {
                const q = P(i, 0)
                if (!q.pin) continue
                ctx.beginPath()
                ctx.arc(q.pin.x, q.pin.y, Math.min(cw, ch) * 0.006, 0, Math.PI * 2)
                ctx.fillStyle = "rgba(" + rgb + ",0.62)"
                ctx.fill()
            }

            raf = requestAnimationFrame(render)
        }

        const localPoint = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect()
            if (r.width <= 0 || r.height <= 0) return
            const cw = sizeRef.current.w || canvas.clientWidth || 1200
            const ch = sizeRef.current.h || canvas.clientHeight || 800
            ptrRef.current.x = ((e.clientX - r.left) / r.width) * cw
            ptrRef.current.y = ((e.clientY - r.top) / r.height) * ch
            ptrRef.current.on = 1
        }
        const track = (e: PointerEvent) => localPoint(e)
        const onLeave = () => {
            ptrRef.current.on = 0
            held = null
        }
        const onDown = (e: PointerEvent) => {
            localPoint(e)
            ptrRef.current.down++
        }
        const onUp = () => {
            ptrRef.current.up = ptrRef.current.down
            held = null
        }

        canvas.addEventListener("pointermove", track)
        canvas.addEventListener("pointerenter", track)
        canvas.addEventListener("pointerleave", onLeave)
        canvas.addEventListener("pointerdown", onDown)
        window.addEventListener("pointerup", onUp)
        window.addEventListener("pointercancel", onUp)
        raf = requestAnimationFrame(render)

        return () => {
            cancelAnimationFrame(raf)
            canvas.removeEventListener("pointermove", track)
            canvas.removeEventListener("pointerenter", track)
            canvas.removeEventListener("pointerleave", onLeave)
            canvas.removeEventListener("pointerdown", onDown)
            window.removeEventListener("pointerup", onUp)
            window.removeEventListener("pointercancel", onUp)
        }
    }, [])

    return (
        <div
            style={{
                position: "relative",
                overflow: "hidden",
                background,
                minWidth: 1200,
                minHeight: 800,
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

const __originkitPresetProps = {
  "cloth": {
    "grab": 100,
    "wind": 100,
    "gravity": 300,
    "stretch": 114
  }
};

export default function Chandelier(props: Record<string, unknown>) {
  return <__OriginkitBase_ClothStudy {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}
