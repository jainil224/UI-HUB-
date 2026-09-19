// Sky — UI HUB
// An interactive Canvas2D sky scene: a vertical gradient horizon, a warm sun or
// pale moon with a cached glow sprite, twinkling stars, and soft cumulus clouds
// that drift and wrap around the edges. Pointer parallax eases the cloud, star
// and glow layers. One requestAnimationFrame loop with delta-time clamping, a
// devicePixelRatio cap (2, or 1.5 on very large canvases), IntersectionObserver
// parking when out of view, and a prefers-reduced-motion static frame with zero
// parallax.
//
//   Sky (React shell)      container + canvas + lifecycle + cleanup
//   scene (imperative)     gradient fill, cached sprites, stars, drift, easing
//
// Pattern: engine-in-effect + React shell, refs-as-film-state (pointer/cloud
// positions live in locals, never in React state). Decorative layer is
// pointerEvents:none so content above stays clickable.

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

type PaletteId = "day" | "dusk" | "night"

type SkyProps = {
    palette?: PaletteId
    stars?: boolean
    starCount?: number
    twinkleSpeed?: number
    clouds?: boolean
    cloudCount?: number
    cloudSpeed?: number
    parallax?: boolean
    parallaxStrength?: number
    seed?: number
    style?: React.CSSProperties
}

const COMPONENT_DEFAULTS = {
    palette: "dusk",
    stars: true,
    starCount: 130,
    twinkleSpeed: 6,
    clouds: true,
    cloudCount: 5,
    cloudSpeed: 8,
    parallax: true,
    parallaxStrength: 16,
    seed: 1,
}

const SKY_PALETTES: Record<
    PaletteId,
    {
        stops: [number, string][]
        orb: [number, number, number]
        orbAlpha: number
        starAlpha: number
        cloudTint: string
    }
> = {
    day: {
        stops: [
            [0, "#2E6FD8"],
            [0.45, "#6FB8F5"],
            [0.75, "#BDE7FF"],
            [1, "#EAF8FF"],
        ],
        orb: [255, 234, 168],
        orbAlpha: 0.95,
        starAlpha: 0.12,
        cloudTint: "255, 255, 255",
    },
    dusk: {
        stops: [
            [0, "#1F2B4E"],
            [0.4, "#5B4A8A"],
            [0.68, "#C96E8F"],
            [0.86, "#F5A966"],
            [1, "#FFE0B0"],
        ],
        orb: [255, 204, 148],
        orbAlpha: 0.92,
        starAlpha: 0.8,
        cloudTint: "255, 214, 180",
    },
    night: {
        stops: [
            [0, "#04060D"],
            [0.5, "#0B1330"],
            [1, "#16264A"],
        ],
        orb: [228, 240, 255],
        orbAlpha: 0.9,
        starAlpha: 1,
        cloudTint: "230, 240, 255",
    },
}

function clamp(v: number, lo: number, hi: number) {
    return v < lo ? lo : v > hi ? hi : v
}

const makeRng = (seed: number) => {
    let s = (seed | 0) >>> 0
    return () => {
        s = (s + 0x6d2b79f5) >>> 0
        let t = s
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function buildOrbSprite(rgb: [number, number, number], alpha: number): HTMLCanvasElement {
    const S = 560
    const c = document.createElement("canvas")
    c.width = S
    c.height = S
    const g = c.getContext("2d")
    if (!g) return c
    const mid = S / 2
    const rad = g.createRadialGradient(mid, mid, 0, mid, mid, mid)
    rad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${Math.min(1, alpha * 0.95)})`)
    rad.addColorStop(0.25, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * 0.4).toFixed(3)})`)
    rad.addColorStop(0.5, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(alpha * 0.14).toFixed(3)})`)
    rad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`)
    g.fillStyle = rad
    g.fillRect(0, 0, S, S)
    const core = g.createRadialGradient(mid - 4, mid - 6, 0, mid - 4, mid - 6, S * 0.1)
    core.addColorStop(0, "rgba(255,255,255,0.9)")
    core.addColorStop(0.5, `rgba(255,255,255,0.35)`)
    core.addColorStop(1, "rgba(255,255,255,0)")
    g.fillStyle = core
    g.fillRect(0, 0, S, S)
    return c
}

type SkySettings = {
    palette: PaletteId
    stars: boolean
    starCount: number
    twinkleSpeed: number
    clouds: boolean
    cloudCount: number
    cloudSpeed: number
    parallax: boolean
    parallaxStrength: number
    seed: number
}

type Star = {
    x: number
    y: number
    r: number
    phase: number
    speed: number
    baseAlpha: number
}

type Cloud = {
    x: number
    y: number
    scale: number
    speed: number
    alpha: number
    sprite: HTMLCanvasElement
}

const MAX_DPR = 2
const MAX_LARGE_DPR = 1.5
const LARGE_AREA = 1600 * 1000

class SkyScene {
    private container: HTMLDivElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cfg: SkySettings

    private width = 0
    private height = 0
    private dpr = 1
    private rect = { left: 0, top: 0, width: 0, height: 0 }

    private pointer = { tx: 0, ty: 0 }
    private parallax = { x: 0, y: 0 }

    private stars: Star[] = []
    private clouds: Cloud[] = []
    private orbSprite: HTMLCanvasElement | null = null
    private orbKey = ""
    private skyGradient: CanvasGradient | null = null

    private rafId = 0
    private last = 0
    private reduced = false

    constructor(container: HTMLDivElement, cfg: SkySettings) {
        this.container = container
        this.cfg = cfg

        const canvas = document.createElement("canvas")
        canvas.style.position = "absolute"
        canvas.style.inset = "0"
        canvas.style.width = "100%"
        canvas.style.height = "100%"
        canvas.style.display = "block"
        canvas.style.pointerEvents = "none"
        container.appendChild(canvas)
        this.canvas = canvas

        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("2d context unavailable")
        this.ctx = ctx

        this.reduced =
            typeof window !== "undefined" &&
            !!window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches

        this.buildStars()
        this.buildClouds()
        this.ensureOrb()
        this.bindEvents()
    }

    private bindEvents() {
        if (!this.cfg.parallax || this.reduced) return
        window.addEventListener("pointermove", this.onMove, { passive: true })
        document.addEventListener("pointerleave", this.onLeave)
    }

    private unbindEvents() {
        window.removeEventListener("pointermove", this.onMove)
        document.removeEventListener("pointerleave", this.onLeave)
    }

    private onMove = (e: PointerEvent) => {
        const rect = this.rect
        if (rect.width <= 0 || rect.height <= 0) return
        const nx = clamp((e.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5)
        const ny = clamp((e.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5)
        this.pointer.tx = nx * 2
        this.pointer.ty = ny * 2
    }

    private onLeave = () => {
        this.pointer.tx = 0
        this.pointer.ty = 0
    }

    updateConfig(cfg: SkySettings) {
        this.cfg = cfg
        this.unbindEvents()
        this.bindEvents()
        this.buildStars()
        this.buildClouds()
        this.ensureOrb()
        this.buildSkyGradient()
        if (this.reduced) this.render(0)
    }

    setSize(width: number, height: number) {
        if (width <= 0 || height <= 0) return
        this.width = width
        this.height = height
        const area = width * height
        this.dpr = Math.min(window.devicePixelRatio || 1, area > LARGE_AREA ? MAX_LARGE_DPR : MAX_DPR)
        this.canvas.width = Math.round(width * this.dpr)
        this.canvas.height = Math.round(height * this.dpr)

        const r = this.container.getBoundingClientRect()
        this.rect = { left: r.left, top: r.top, width: r.width, height: r.height }

        this.buildStars()
        this.buildClouds()
        this.ensureOrb()
        this.buildSkyGradient()

        if (this.reduced) this.render(0)
    }

    private buildSkyGradient() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.height)
        for (const [pos, color] of SKY_PALETTES[this.cfg.palette].stops) {
            g.addColorStop(pos, color)
        }
        this.skyGradient = g
    }

    private ensureOrb() {
        if (this.orbSprite && this.orbKey === this.cfg.palette) return
        const p = SKY_PALETTES[this.cfg.palette]
        this.orbSprite = buildOrbSprite(p.orb, p.orbAlpha)
        this.orbKey = this.cfg.palette
    }

    private buildStars() {
        const s = this.cfg
        if (!s.stars || s.starCount <= 0) {
            this.stars = []
            return
        }
        const rng = makeRng(s.seed)
        const count = Math.round(s.starCount)
        const stars: Star[] = []
        for (let i = 0; i < count; i++) {
            stars.push({
                x: rng() * this.width,
                y: rng() * this.height * 0.55,
                r: 0.6 + rng() * 1.4,
                phase: rng() * Math.PI * 2,
                speed: 0.6 + rng() * 1.6,
                baseAlpha: 0.35 + rng() * 0.65,
            })
        }
        this.stars = stars
    }

    private buildCloudSprite(tint: string, baseW: number, baseH: number): HTMLCanvasElement {
        const c = document.createElement("canvas")
        c.width = Math.max(1, Math.ceil(baseW))
        c.height = Math.max(1, Math.ceil(baseH))
        const g = c.getContext("2d")
        if (!g) return c
        const w = baseW
        const h = baseH
        const puffs: Array<[number, number, number, number]> = [
            [0.5, 0.55, 0.36, 0.95],
            [0.24, 0.68, 0.26, 0.8],
            [0.76, 0.66, 0.28, 0.85],
            [0.42, 0.4, 0.32, 0.85],
        ]
        for (const [px, py, pr, po] of puffs) {
            const x = px * w
            const y = py * h
            const rr = g.createRadialGradient(x, y, 0, x, y, pr * w)
            rr.addColorStop(0, `rgba(${tint}, ${(0.9 * po).toFixed(3)})`)
            rr.addColorStop(0.55, `rgba(${tint}, ${(0.5 * po).toFixed(3)})`)
            rr.addColorStop(1, `rgba(${tint}, 0)`)
            g.fillStyle = rr
            g.fillRect(x - pr * w, y - pr * w, pr * w * 2, pr * w * 2)
        }
        return c
    }

    private buildClouds() {
        const s = this.cfg
        if (!s.clouds || s.cloudCount <= 0) {
            this.clouds = []
            return
        }
        const rng = makeRng((s.seed ^ 0x9e3779b9) >>> 0)
        const count = Math.round(s.cloudCount)
        const tint = SKY_PALETTES[s.palette].cloudTint
        const baseW = this.height * 0.55
        const baseH = this.height * 0.16
        const baseSpeed = Math.max(6, (s.cloudSpeed / 20) * this.width * 0.06)
        const clouds: Cloud[] = []
        for (let i = 0; i < count; i++) {
            clouds.push({
                x: rng() * this.width,
                y: 0.12 + rng() * 0.46,
                scale: 0.6 + rng() * 0.9,
                speed: baseSpeed * (0.6 + rng() * 0.8),
                alpha: 0.3 + rng() * 0.4,
                sprite: this.buildCloudSprite(tint, baseW, baseH),
            })
        }
        this.clouds = clouds
    }

    private render(now: number) {
        const { ctx, width, height, dpr } = this
        if (width <= 0 || height <= 0) return
        const s = this.cfg

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

        const k = this.reduced ? 1 : 0.05
        this.parallax.x += (this.pointer.tx - this.parallax.x) * k
        this.parallax.y += (this.pointer.ty - this.parallax.y) * k
        const pxn = this.parallax.x
        const pyn = this.parallax.y
        const pxo = pxn * s.parallaxStrength
        const pyo = pyn * s.parallaxStrength

        if (this.skyGradient) {
            ctx.fillStyle = this.skyGradient
            ctx.fillRect(0, 0, width, height)
        }

        if (this.stars.length) {
            const starAlpha = SKY_PALETTES[s.palette].starAlpha
            ctx.fillStyle = "#ffffff"
            for (const star of this.stars) {
                const tw = 0.5 + 0.5 * Math.sin(now * 0.001 * s.twinkleSpeed * star.speed + star.phase)
                ctx.globalAlpha = star.baseAlpha * (0.25 + 0.75 * tw) * starAlpha
                ctx.beginPath()
                ctx.arc(star.x + pxo * 0.3, star.y + pyo * 0.15, star.r, 0, Math.PI * 2)
                ctx.fill()
            }
            ctx.globalAlpha = 1
        }

        if (this.orbSprite) {
            const ox = width * 0.82 + pxo * 0.12
            const oy = height * 0.24 + pyo * 0.06
            const size = Math.max(width, height) * 0.42
            ctx.globalAlpha = 1
            ctx.globalCompositeOperation = "lighter"
            ctx.drawImage(this.orbSprite, ox - size / 2, oy - size / 2, size, size)
            ctx.globalCompositeOperation = "source-over"
        }

        if (this.clouds.length) {
            for (const c of this.clouds) {
                const cw = this.height * 0.55 * c.scale
                const ch = this.height * 0.16 * c.scale
                ctx.globalAlpha = c.alpha
                ctx.globalCompositeOperation = "lighter"
                ctx.drawImage(c.sprite, c.x + pxo * (0.5 + c.scale * 0.5), c.y * height + pyo * 0.2, cw, ch)
                ctx.globalCompositeOperation = "source-over"
            }
            ctx.globalAlpha = 1
        }
    }

    private frame = (now: number) => {
        this.rafId = requestAnimationFrame(this.frame)
        const last = this.last || now
        const dt = Math.min(0.05, Math.max(0, (now - last) / 1000))
        this.last = now

        if (this.clouds.length) {
            for (const c of this.clouds) {
                c.x -= c.speed * dt
                if (c.x < -(this.height * 0.55 * c.scale) - 10) {
                    c.x = this.width + 10
                }
            }
        }

        this.render(now)
    }

    start() {
        if (this.reduced || this.rafId) return
        this.last = 0
        this.rafId = requestAnimationFrame(this.frame)
    }

    park() {
        cancelAnimationFrame(this.rafId)
        this.rafId = 0
    }

    dispose() {
        this.park()
        this.unbindEvents()
        this.canvas.remove()
    }
}

function applyDefaults(props: SkyProps): SkySettings {
    const d = COMPONENT_DEFAULTS
    return {
        palette: props.palette ?? (d.palette as PaletteId),
        stars: props.stars ?? d.stars,
        starCount: clamp(props.starCount ?? d.starCount, 0, 400),
        twinkleSpeed: clamp(props.twinkleSpeed ?? d.twinkleSpeed, 0, 20),
        clouds: props.clouds ?? d.clouds,
        cloudCount: clamp(props.cloudCount ?? d.cloudCount, 0, 12),
        cloudSpeed: clamp(props.cloudSpeed ?? d.cloudSpeed, 0, 20),
        parallax: props.parallax ?? d.parallax,
        parallaxStrength: clamp(props.parallaxStrength ?? d.parallaxStrength, 0, 80),
        seed: props.seed ?? d.seed,
    }
}

export function Sky(props: SkyProps) {
    const {
        palette,
        stars,
        starCount,
        twinkleSpeed,
        clouds,
        cloudCount,
        cloudSpeed,
        parallax,
        parallaxStrength,
        seed,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<SkyScene | null>(null)

    const cfgRef = useRef<SkySettings>(null as any)
    cfgRef.current = applyDefaults(props)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: SkyScene
        try {
            scene = new SkyScene(container, cfgRef.current)
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

        let parked = false
        const io = new IntersectionObserver((entries) => {
            const entry = entries[0]
            if (!entry) return
            if (entry.isIntersecting) {
                if (parked) {
                    parked = false
                    scene.start()
                }
            } else {
                parked = true
                scene.park()
            }
        })
        io.observe(container)

        return () => {
            io.disconnect()
            ro.disconnect()
            scene.dispose()
            sceneRef.current = null
        }
    }, [])

    useEffect(() => {
        sceneRef.current?.updateConfig(cfgRef.current)
    }, [
        palette,
        stars,
        starCount,
        twinkleSpeed,
        clouds,
        cloudCount,
        cloudSpeed,
        parallax,
        parallaxStrength,
        seed,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="A tranquil sky scene with a glowing sun or moon, twinkling stars and drifting cumulus clouds that follow the pointer"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 160,
                minHeight: 120,
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

Sky.displayName = "Sky"

export default Sky