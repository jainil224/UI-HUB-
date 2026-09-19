// Frost Glass Melt — UI HUB

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const DEFAULTS = {
    background: "",
    frost: "",
    scene: 20,
    cell: 12,
    meltRadius: 14,
    meltSpeed: 12,
    refreezeSpeed: 8,
    drift: 10,
    twinkle: 12,
}

type Config = {
    background: string
    frost: string
    scene: number
    cell: number
    meltRadius: number
    meltSpeed: number
    refreezeSpeed: number
    drift: number
    twinkle: number
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

function settingsFor(cfg: Config) {
    const cell = clamp(cfg.cell, 1, 20, DEFAULTS.cell)
    return {
        cellSize: Math.max(6, Math.round(36 - cell * 1.4)),

        heatReach: 60 + clamp(cfg.meltRadius, 1, 20, DEFAULTS.meltRadius) * 14,

        meltRate: 0.4 + clamp(cfg.meltSpeed, 1, 20, DEFAULTS.meltSpeed) * 0.35,

        refreezeRate: 0.03 + clamp(cfg.refreezeSpeed, 1, 20, DEFAULTS.refreezeSpeed) * 0.02,

        wind: clamp(cfg.drift, 0, 20, DEFAULTS.drift) * 7,

        shimmer: clamp(cfg.twinkle, 0, 20, DEFAULTS.twinkle) * 0.55,

        motes: Math.round((clamp(cfg.scene, 0, 20, DEFAULTS.scene) / 20) * 150),
    }
}

function parseHex(hex: string): number[] {
    const h = (hex || "").replace("#", "").trim()
    if (h.length === 3) {
        return [
            parseInt(h[0] + h[0], 16),
            parseInt(h[1] + h[1], 16),
            parseInt(h[2] + h[2], 16),
        ]
    }
    if (h.length >= 6) {
        return [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
        ]
    }
    return [217, 230, 255]
}

function mix(a: number[], b: number[], t: number): number[] {
    return [
        Math.round(a[0] + (b[0] - a[0]) * t),
        Math.round(a[1] + (b[1] - a[1]) * t),
        Math.round(a[2] + (b[2] - a[2]) * t),
    ]
}

function hash2(x: number, y: number, seed: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453
    return n - Math.floor(n)
}

const MAX_DPR = 2

type Motes = {
    x: number
    y: number
    speed: number
    size: number
    phase: number
    alpha: number
}

interface FrostSettings {
    cellSize: number
    heatReach: number
    meltRate: number
    refreezeRate: number
    wind: number
    shimmer: number
    motes: number
}

class FrostGlassScene {
    private container: HTMLDivElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cfg: Config
    private settings: FrostSettings

    private dpr = 1
    private width = 0
    private height = 0

    private cols = 0
    private rows = 0
    private frost: Float32Array = new Float32Array(0)
    private heat: Float32Array = new Float32Array(0)
    private heatPrev: Float32Array = new Float32Array(0)

    private pointer = { x: -1e4, y: -1e4, active: false }
    private motes: Motes[] = []

    private rafId = 0
    private last = 0
    private reduced = false

    constructor(container: HTMLDivElement, cfg: Config) {
        this.container = container
        this.cfg = cfg
        this.settings = settingsFor(cfg)

        const canvas = document.createElement("canvas")
        canvas.style.position = "absolute"
        canvas.style.inset = "0"
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.display = "block"
        container.appendChild(canvas)
        this.canvas = canvas

        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("2d context unavailable")
        this.ctx = ctx

        this.reduced =
            typeof window !== "undefined" &&
            !!window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        this.bindEvents()
    }

    private bindEvents() {
        this.container.addEventListener("pointermove", this.onMove)
        this.container.addEventListener("pointerleave", this.onLeave)
        this.container.addEventListener("pointerdown", this.onDown)
    }

    private unbindEvents() {
        this.container.removeEventListener("pointermove", this.onMove)
        this.container.removeEventListener("pointerleave", this.onLeave)
        this.container.removeEventListener("pointerdown", this.onDown)
    }

    private onMove = (e: PointerEvent) => {
        const rect = this.container.getBoundingClientRect()
        this.pointer.x = e.clientX - rect.left
        this.pointer.y = e.clientY - rect.top
        this.pointer.active = true
    }

    private onLeave = () => {
        this.pointer.active = false
        this.pointer.x = -1e4
        this.pointer.y = -1e4
    }

    private onDown = (e: PointerEvent) => {
        const rect = this.container.getBoundingClientRect()
        this.pointer.x = e.clientX - rect.left
        this.pointer.y = e.clientY - rect.top
        this.pointer.active = true
        this.burst(this.pointer.x, this.pointer.y)
    }

    updateConfig(cfg: Config) {
        this.cfg = cfg
        this.settings = settingsFor(cfg)
    }

    setSize(width: number, height: number) {
        if (width <= 0 || height <= 0) return
        this.width = width
        this.height = height
        this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
        this.canvas.width = Math.round(width * this.dpr)
        this.canvas.height = Math.round(height * this.dpr)

        const cs = this.settings.cellSize
        this.cols = Math.max(2, Math.ceil(width / cs))
        this.rows = Math.max(2, Math.ceil(height / cs))

        this.frost = new Float32Array(this.cols * this.rows).fill(1)
        this.heat = new Float32Array(this.cols * this.rows)
        this.heatPrev = new Float32Array(this.cols * this.rows)

        const count = this.settings.motes
        this.motes = new Array(count)
        for (let i = 0; i < count; i++) {
            this.motes[i] = {
                x: Math.random() * width,
                y: Math.random() * height,
                speed: 40 + Math.random() * 100,
                size: 0.6 + Math.random() * 1.8,
                phase: Math.random() * Math.PI * 2,
                alpha: 0.16 + Math.random() * 0.4,
            }
        }

        if (this.reduced) {
            this.render(0)
        }
    }

    private idx(cx: number, cy: number): number {
        return cy * this.cols + cx
    }

    private burst(x: number, y: number) {
        const s = this.settings
        const cs = s.cellSize
        const cx = Math.max(0, Math.min(this.cols - 1, Math.floor(x / cs)))
        const cy = Math.max(0, Math.min(this.rows - 1, Math.floor(y / cs)))
        const radius = Math.ceil((s.heatReach * 1.4) / cs)
        for (let gy = cy - radius; gy <= cy + radius; gy++) {
            if (gy < 0 || gy >= this.rows) continue
            for (let gx = cx - radius; gx <= cx + radius; gx++) {
                if (gx < 0 || gx >= this.cols) continue
                const dcx = (gx + 0.5) * cs - x
                const dcy = (gy + 0.5) * cs - y
                const d = Math.sqrt(dcx * dcx + dcy * dcy)
                const reach = s.heatReach * 1.4
                if (d < reach) {
                    const f = Math.pow(1 - d / reach, 2)
                    this.heat[this.idx(gx, gy)] = Math.min(2.2, this.heat[this.idx(gx, gy)] + f * 1.6)
                }
            }
        }
    }

    private injectPointerHeat(dt: number) {
        if (!this.pointer.active) return
        const s = this.settings
        const cs = s.cellSize
        const cx = Math.max(0, Math.min(this.cols - 1, Math.floor(this.pointer.x / cs)))
        const cy = Math.max(0, Math.min(this.rows - 1, Math.floor(this.pointer.y / cs)))
        const radius = Math.ceil(s.heatReach / cs)
        for (let gy = cy - radius; gy <= cy + radius; gy++) {
            if (gy < 0 || gy >= this.rows) continue
            for (let gx = cx - radius; gx <= cx + radius; gx++) {
                if (gx < 0 || gx >= this.cols) continue
                const dcx = (gx + 0.5) * cs - this.pointer.x
                const dcy = (gy + 0.5) * cs - this.pointer.y
                const d = Math.sqrt(dcx * dcx + dcy * dcy)
                if (d < s.heatReach) {
                    const f = Math.pow(1 - d / s.heatReach, 2)
                    this.heat[this.idx(gx, gy)] = Math.min(2.2, this.heat[this.idx(gx, gy)] + f * 1.15 * dt)
                }
            }
        }
    }

    private diffuseHeat(dt: number) {
        const heat = this.heat
        const prev = this.heatPrev
        prev.set(heat)
        const { cols, rows } = this
        const D = 0.16
        const decay = Math.max(0, 1 - 1.4 * dt)
        for (let i = 0; i < heat.length; i++) {
            const cx = i % cols
            const cy = (i / cols) | 0
            let sum = 0
            let n = 0
            for (let j = -1; j <= 1; j++) {
                const gy = cy + j
                if (gy < 0 || gy >= rows) continue
                for (let k = -1; k <= 1; k++) {
                    const gx = cx + k
                    if (gx < 0 || gx >= cols) continue
                    sum += prev[gy * cols + gx]
                    n++
                }
            }
            const avg = n > 0 ? sum / n : prev[i]
            heat[i] = (prev[i] + D * (avg - prev[i])) * decay
        }
    }

    private updateFrost(dt: number) {
        const s = this.settings
        const melt = s.meltRate
        const refreeze = s.refreezeRate
        for (let i = 0; i < this.frost.length; i++) {
            const h = this.heat[i]
            let f = this.frost[i] + (refreeze * (1 - this.frost[i]) - melt * h) * dt
            if (f < 0) f = 0
            else if (f > 1) f = 1
            this.frost[i] = f
        }
    }

    private render(now: number) {
        const { ctx, width, height, dpr } = this
        if (width <= 0 || height <= 0) return

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const bg = parseHex(this.cfg.background)
        const grad = ctx.createRadialGradient(
            width * 0.5, height * 0.38, 0,
            width * 0.5, height * 0.42, Math.max(width, height) * 0.85
        )
        grad.addColorStop(0, `rgb(${mix(bg, [0, 12, 34], 0.16).join(", ")})`)
        grad.addColorStop(1, `rgb(${mix(bg, [3, 6, 14], 0.5).join(", ")})`)
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, width, height)

        const s = this.settings
        const cm = ctx.createRadialGradient(width * 0.5, height * 0.42, 0, width * 0.5, height * 0.42, Math.max(width, height) * 0.6)
        cm.addColorStop(0, "rgba(70, 96, 140, 0.5)")
        cm.addColorStop(0.5, "rgba(120, 110, 70, 0.22)")
        cm.addColorStop(1, "rgba(0, 0, 0, 0)")
        ctx.fillStyle = cm
        ctx.fillRect(0, 0, width, height)

        for (const m of this.motes) {
            m.y += m.speed * 0.016
            m.x += Math.sin(now * 0.0016 + m.phase) * 26 * 0.016 - s.wind * 0.22 * 0.016
            if (m.y > height + 4) { m.y = -4; m.x = Math.random() * width }
            if (m.x > width + 4) m.x = -4
            if (m.x < -4) m.x = width + 4
            ctx.beginPath()
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(230, 240, 255, ${m.alpha})`
            ctx.fill()
        }

        const frost = parseHex(this.cfg.frost)
        const cs = s.cellSize
        const shimmer = s.shimmer
        const { cols, rows } = this
        for (let gy = 0; gy < rows; gy++) {
            for (let gx = 0; gx < cols; gx++) {
                const f = this.frost[gy * cols + gx]
                if (f <= 0.005) continue
                const grain = hash2(gx, gy, Math.floor(now * shimmer * 0.002))
                const alpha = f * (0.3 + 0.5 * grain)
                const x = gx * cs
                const y = gy * cs
                ctx.fillStyle = `rgba(${frost[0]}, ${frost[1]}, ${frost[2]}, ${alpha.toFixed(3)})`
                ctx.fillRect(x, y, cs, cs)
            }
        }
    }

    private frame = (now: number) => {
        this.rafId = requestAnimationFrame(this.frame)
        const last = this.last || now
        const dt = Math.min(0.05, (now - last) / 1000)
        this.last = now

        this.injectPointerHeat(dt)
        this.diffuseHeat(dt)
        this.updateFrost(dt)
        this.render(now)
    }

    start() {
        if (this.reduced) return
        this.last = 0
        this.rafId = requestAnimationFrame(this.frame)
    }

    dispose() {
        cancelAnimationFrame(this.rafId)
        this.unbindEvents()
        this.canvas.remove()
    }
}

export interface FrostGlassMeltProps {
    background?: string
    frost?: string
    scene?: number
    cell?: number
    meltRadius?: number
    meltSpeed?: number
    refreezeSpeed?: number
    drift?: number
    twinkle?: number
    style?: React.CSSProperties
}

function __FrostGlassMeltBase(props: FrostGlassMeltProps) {
    const {
        background = DEFAULTS.background,
        frost = DEFAULTS.frost,
        scene = DEFAULTS.scene,
        cell = DEFAULTS.cell,
        meltRadius = DEFAULTS.meltRadius,
        meltSpeed = DEFAULTS.meltSpeed,
        refreezeSpeed = DEFAULTS.refreezeSpeed,
        drift = DEFAULTS.drift,
        twinkle = DEFAULTS.twinkle,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<FrostGlassScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        background,
        frost,
        scene,
        cell,
        meltRadius,
        meltSpeed,
        refreezeSpeed,
        drift,
        twinkle,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: FrostGlassScene
        try {
            scene = new FrostGlassScene(container, cfgRef.current)
        } catch {
            return
        }
        sceneRef.current = scene
        scene.setSize(container.clientWidth, container.clientHeight)
        scene.start()

        const ro = new ResizeObserver(() => {
            scene.setSize(container.clientWidth, container.clientHeight)
        })
        ro.observe(container)
        return () => {
            ro.disconnect()
            scene.dispose()
            sceneRef.current = null
        }
    }, [])

    useEffect(() => {
        sceneRef.current?.updateConfig(cfgRef.current)
    }, [
        background,
        frost,
        scene,
        cell,
        meltRadius,
        meltSpeed,
        refreezeSpeed,
        drift,
        twinkle,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="A pane of frost on glass that melts where the pointer hovers and re-freezes when idle"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 160,
                minHeight: 120,
                overflow: "hidden",
                touchAction: "none",
                ...style,
            }}
        />
    )
}

FrostGlassMelt.displayName = "Frost Glass Melt"

const __defaultProps = {
    "background": "#060A14",
    "frost": "#D9E6FF",
    scene: 20,
    cell: 12,
    meltRadius: 14,
    meltSpeed: 12,
    refreezeSpeed: 8,
    drift: 10,
    twinkle: 12,
};

export default function FrostGlassMelt(props: Record<string, unknown>) {
    return <__FrostGlassMeltBase {...(__defaultProps as Record<string, unknown>)} {...props} />;
}