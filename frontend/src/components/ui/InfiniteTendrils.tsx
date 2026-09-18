// Infinite Tendrils — UI HUB

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

const DEFAULTS = {
    colorA: "",
    colorB: "",
    count: 18,
    scale: 14,
    size: 5,
    trail: 20,
    speed: 100,
    followPointer: true,
    strength: 13,
}

type Config = {
    colorA: string
    colorB: string
    count: number
    scale: number
    size: number
    trail: number
    speed: number
    followPointer: boolean
    strength: number
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

function settingsFor(cfg: Config) {
    const trail = clamp(cfg.trail, 1, 20, DEFAULTS.trail)
    return {
        count: Math.round(90 + clamp(cfg.count, 1, 20, DEFAULTS.count) * 65),

        scale: 0.09 + clamp(cfg.scale, 1, 20, DEFAULTS.scale) * 0.055,
        size: 0.4 + clamp(cfg.size, 1, 20, DEFAULTS.size) * 0.16,

        fade: Math.max(0.02, 0.18 * Math.pow(0.8907, trail - 1)),
        speed: 12 + clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 9,
        reach: 90 + clamp(cfg.strength, 1, 20, DEFAULTS.strength) * 26,

        whirl: 0.35 + clamp(cfg.strength, 1, 20, DEFAULTS.strength) * 0.032,
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
    return [128, 128, 128]
}

function mix(a: number[], b: number[], t: number, alpha: number) {
    const r = Math.round(a[0] + (b[0] - a[0]) * t)
    const g = Math.round(a[1] + (b[1] - a[1]) * t)
    const bl = Math.round(a[2] + (b[2] - a[2]) * t)
    return "rgba(" + r + "," + g + "," + bl + "," + alpha + ")"
}

function hash(x: number, y: number): number {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
    return s - Math.floor(s)
}

function noise2(x: number, y: number): number {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const xf = x - xi
    const yf = y - yi
    const u = xf * xf * (3 - 2 * xf)
    const v = yf * yf * (3 - 2 * yf)
    const a = hash(xi, yi)
    const b = hash(xi + 1, yi)
    const c = hash(xi, yi + 1)
    const d = hash(xi + 1, yi + 1)
    return (a + (b - a) * u) * (1 - v) + (c + (d - c) * u) * v
}

type Mote = {
    x: number
    y: number
    life: number
    span: number
    tint: number
    weight: number
    pace: number
}

class FlowScene {
    private container: HTMLElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cfg: Config

    private motes: Mote[] = []
    private width = 0
    private height = 0
    private dpr = 1
    private time = 0
    private frameId = 0
    private lastT = 0
    private disposed = false

    private px = -1
    private py = -1
    private tx = -1
    private ty = -1
    private grip = 0
    private gripTarget = 0

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg

        this.canvas = document.createElement("canvas")
        this.canvas.style.position = "absolute"
        this.canvas.style.inset = "0"
        this.canvas.style.width = "100%"
        this.canvas.style.height = "100%"
        container.appendChild(this.canvas)

        const ctx = this.canvas.getContext("2d")
        if (!ctx) throw new Error("no 2d context")
        this.ctx = ctx

        container.addEventListener("pointerenter", this.onEnter)
        container.addEventListener("pointerleave", this.onLeave)
        container.addEventListener("pointercancel", this.onLeave)
        container.addEventListener("pointermove", this.onMove)
    }

    private onEnter = () => {
        this.gripTarget = 1
    }
    private onLeave = () => {
        this.gripTarget = 0
    }
    private onMove = (e: PointerEvent) => {
        const rect = this.container.getBoundingClientRect()
        if (!rect.width || !rect.height) return
        this.tx = e.clientX - rect.left
        this.ty = e.clientY - rect.top
        if (this.px < 0) {
            this.px = this.tx
            this.py = this.ty
        }
    }

    private spawn(m: Mote) {
        m.x = Math.random() * this.width
        m.y = Math.random() * this.height

        m.span = 2 + Math.random() * 6
        m.life = m.span
        m.tint = Math.random()

        m.weight = 0.35 + Math.random() * Math.random() * 1.9
        m.pace = 0.6 + Math.random() * 0.8
    }

    private build() {
        const S = settingsFor(this.cfg)
        this.motes = []
        for (let i = 0; i < S.count; i++) {
            const m: Mote = {
                x: 0,
                y: 0,
                life: 0,
                span: 1,
                tint: 0,
                weight: 1,
                pace: 1,
            }
            this.spawn(m)

            m.life = Math.random() * m.span
            this.motes.push(m)
        }
    }

    start() {
        this.lastT = performance.now()
        const loop = () => {
            this.frameId = requestAnimationFrame(loop)
            this.step()
        }
        loop()
    }

    setSize(width: number, height: number) {
        if (this.disposed || width <= 0 || height <= 0) return
        this.dpr = Math.min(window.devicePixelRatio || 1, 2)
        const first = this.width === 0
        this.width = width
        this.height = height
        this.canvas.width = Math.round(width * this.dpr)
        this.canvas.height = Math.round(height * this.dpr)
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        if (first || this.motes.length === 0) this.build()
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        const prev = this.cfg
        this.cfg = cfg

        if (prev.count !== cfg.count) this.build()
    }

    private step() {
        if (this.disposed || this.width <= 0 || this.motes.length === 0) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0
        const stalled = dt > 0.4
        if (dt > 0.05) dt = 0.05

        const S = settingsFor(this.cfg)
        const ctx = this.ctx
        this.time += dt

        if (stalled) ctx.clearRect(0, 0, this.width, this.height)

        if (this.px >= 0) {
            const k = 1 - Math.exp(-dt * 12)
            this.px += (this.tx - this.px) * k
            this.py += (this.ty - this.py) * k
        }
        const want = this.cfg.followPointer && this.px >= 0 ? this.gripTarget : 0
        this.grip += (want - this.grip) * (1 - Math.exp(-dt * 4))

        const fade = Math.min(0.6, S.fade * dt * 60)
        ctx.globalCompositeOperation = "destination-out"
        ctx.fillStyle = "rgba(0,0,0," + fade + ")"
        ctx.fillRect(0, 0, this.width, this.height)
        ctx.globalCompositeOperation = "source-over"

        ctx.lineCap = "round"
        const reach = S.reach
        const reach2 = reach * reach
        const a = parseHex(this.cfg.colorA || DEFAULTS.colorA)
        const b = parseHex(this.cfg.colorB || DEFAULTS.colorB)

        for (let i = 0; i < this.motes.length; i++) {
            const m = this.motes[i]

            const swell = noise2(
                m.x * S.scale * 0.01 + this.time * 0.12,
                m.y * S.scale * 0.01 - this.time * 0.09
            )
            const fray = noise2(
                m.x * S.scale * 0.031 - this.time * 0.2,
                m.y * S.scale * 0.031 + this.time * 0.16
            )
            let ang = (swell * 0.78 + fray * 0.22) * Math.PI * 4
            const pace = S.speed * m.pace

            if (this.grip > 0.01) {
                const dx = this.px - m.x
                const dy = this.py - m.y
                const d2 = dx * dx + dy * dy
                if (d2 < reach2 && d2 > 1) {
                    const dist = Math.sqrt(d2)

                    const f = (1 - dist / reach) * (1 - dist / reach) * this.grip

                    const swing = Math.PI * (0.5 - 0.16 * (dist / reach))
                    const target = Math.atan2(dy, dx) - swing
                    let delta = target - ang

                    while (delta > Math.PI) delta -= Math.PI * 2
                    while (delta < -Math.PI) delta += Math.PI * 2
                    ang += delta * Math.min(1, f * S.whirl * 2.2)
                }
            }

            const px = m.x
            const py = m.y
            m.x += Math.cos(ang) * pace * dt
            m.y += Math.sin(ang) * pace * dt
            m.life -= dt

            if (
                m.life <= 0 ||
                m.x < -10 ||
                m.x > this.width + 10 ||
                m.y < -10 ||
                m.y > this.height + 10
            ) {
                this.spawn(m)
                continue
            }

            const t = m.life / m.span
            const ends = Math.min(1, Math.min(t, 1 - t) * 6)
            ctx.strokeStyle = mix(a, b, m.tint, 0.2 + ends * 0.55)
            ctx.lineWidth = S.size * m.weight
            ctx.beginPath()
            ctx.moveTo(px, py)
            ctx.lineTo(m.x, m.y)
            ctx.stroke()
        }
    }

    dispose() {
        this.disposed = true
        cancelAnimationFrame(this.frameId)
        this.container.removeEventListener("pointerenter", this.onEnter)
        this.container.removeEventListener("pointerleave", this.onLeave)
        this.container.removeEventListener("pointercancel", this.onLeave)
        this.container.removeEventListener("pointermove", this.onMove)
        if (this.canvas.parentNode === this.container) {
            this.container.removeChild(this.canvas)
        }
    }
}

interface InfiniteTendrilsProps {
    colorA?: string
    colorB?: string
    count?: number
    scale?: number
    size?: number
    trail?: number
    speed?: number
    followPointer?: boolean
    strength?: number
    style?: React.CSSProperties
}

function __InfiniteTendrilsBase(props: InfiniteTendrilsProps) {
    const {
        colorA = DEFAULTS.colorA,
        colorB = DEFAULTS.colorB,
        count = DEFAULTS.count,
        scale = DEFAULTS.scale,
        size = DEFAULTS.size,
        trail = DEFAULTS.trail,
        speed = DEFAULTS.speed,
        followPointer = DEFAULTS.followPointer,
        strength = DEFAULTS.strength,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<FlowScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        colorA,
        colorB,
        count,
        scale,
        size,
        trail,
        speed,
        followPointer,
        strength,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: FlowScene
        try {
            scene = new FlowScene(container, cfgRef.current)
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
        colorA,
        colorB,
        count,
        scale,
        size,
        trail,
        speed,
        followPointer,
        strength,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Particles tracing ribbons through a field of angles"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 120,
                minHeight: 120,
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

InfiniteTendrils.displayName = "Infinite Tendrils"

const __defaultProps = {
  "colorA": "",
  "colorB": "",
  "count": 18,
  "scale": 14,
  "size": 5,
  "trail": 20,
  "speed": 100,
  "strength": 13
};

export default function InfiniteTendrils(props: Record<string, unknown>) {
  return <__InfiniteTendrilsBase {...(__defaultProps as Record<string, unknown>)} {...props} />;
}