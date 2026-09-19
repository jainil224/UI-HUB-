"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

export type PaletteId = "day" | "dusk" | "night"

export type SkyProps = {
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
    className?: string
}

export const COMPONENT_DEFAULTS = {
    palette: "dusk" as PaletteId,
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

export const SKY_PALETTES: Record<
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

function buildCloudSprite(tint: string, rng: () => number): HTMLCanvasElement {
    const w = 480
    const h = 220
    const c = document.createElement("canvas")
    c.width = w
    c.height = h
    const g = c.getContext("2d")
    if (!g) return c

    const puffCount = 8 + Math.floor(rng() * 5)
    for (let i = 0; i < puffCount; i++) {
        const px = w * 0.2 + rng() * w * 0.6
        const py = h * 0.35 + rng() * h * 0.45
        const r = 40 + rng() * 55

        const rad = g.createRadialGradient(px, py, 0, px, py, r)
        rad.addColorStop(0, `rgba(${tint}, 0.8)`)
        rad.addColorStop(0.45, `rgba(${tint}, 0.5)`)
        rad.addColorStop(0.8, `rgba(${tint}, 0.15)`)
        rad.addColorStop(1, `rgba(${tint}, 0)`)

        g.fillStyle = rad
        g.beginPath()
        g.arc(px, py, r, 0, Math.PI * 2)
        g.fill()
    }

    return c
}

interface Star {
    x: number
    y: number
    radius: number
    baseAlpha: number
    phase: number
    speed: number
}

interface Cloud {
    x: number
    y: number
    w: number
    h: number
    speed: number
    depth: number
    alpha: number
    sprite: HTMLCanvasElement
}

export const Sky: React.FC<SkyProps> = ({
    palette = COMPONENT_DEFAULTS.palette,
    stars = COMPONENT_DEFAULTS.stars,
    starCount = COMPONENT_DEFAULTS.starCount,
    twinkleSpeed = COMPONENT_DEFAULTS.twinkleSpeed,
    clouds = COMPONENT_DEFAULTS.clouds,
    cloudCount = COMPONENT_DEFAULTS.cloudCount,
    cloudSpeed = COMPONENT_DEFAULTS.cloudSpeed,
    parallax = COMPONENT_DEFAULTS.parallax,
    parallaxStrength = COMPONENT_DEFAULTS.parallaxStrength,
    seed = COMPONENT_DEFAULTS.seed,
    style,
    className = "",
}) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const container = containerRef.current
        if (!canvas || !container) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const activePalette = SKY_PALETTES[palette] || SKY_PALETTES.dusk
        const rng = makeRng(seed)

        const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        let reduced = reduceMotionQuery.matches

        let width = 0
        let height = 0
        let rafId = 0
        let lastTime = performance.now()
        let isIntersecting = true

        const pointer = { x: 0, y: 0, tx: 0, ty: 0 }
        const orbSprite = buildOrbSprite(activePalette.orb, activePalette.orbAlpha)

        const starList: Star[] = []
        for (let i = 0; i < starCount; i++) {
            starList.push({
                x: rng(),
                y: Math.pow(rng(), 1.3) * 0.85,
                radius: 0.6 + rng() * 1.3,
                baseAlpha: 0.35 + rng() * 0.65,
                phase: rng() * Math.PI * 2,
                speed: 0.4 + rng() * 1.2,
            })
        }

        const cloudList: Cloud[] = []
        for (let i = 0; i < cloudCount; i++) {
            const depth = 0.3 + rng() * 0.7
            const cw = (320 + rng() * 260) * (0.6 + depth * 0.4)
            const ch = cw * 0.45
            cloudList.push({
                x: rng() * 1200,
                y: 0.25 + rng() * 0.48,
                w: cw,
                h: ch,
                speed: (0.5 + rng() * 0.8) * depth,
                depth,
                alpha: 0.35 + depth * 0.45,
                sprite: buildCloudSprite(activePalette.cloudTint, rng),
            })
        }

        const drawScene = (timeSec: number) => {
            if (width === 0 || height === 0) return

            ctx.clearRect(0, 0, width, height)

            const grad = ctx.createLinearGradient(0, 0, 0, height)
            for (const [pos, color] of activePalette.stops) {
                grad.addColorStop(pos, color)
            }
            ctx.fillStyle = grad
            ctx.fillRect(0, 0, width, height)

            const px = parallax && !reduced ? pointer.x * parallaxStrength : 0
            const py = parallax && !reduced ? pointer.y * parallaxStrength : 0

            if (stars && activePalette.starAlpha > 0.01) {
                ctx.save()
                for (const star of starList) {
                    const sx = star.x * width + px * 0.2
                    const sy = star.y * height + py * 0.2

                    const twinkle = reduced
                        ? 0.8
                        : 0.35 + 0.65 * Math.max(0, Math.sin(timeSec * twinkleSpeed * 0.4 * star.speed + star.phase))
                    const a = star.baseAlpha * twinkle * activePalette.starAlpha

                    ctx.fillStyle = `rgba(255, 255, 255, ${a.toFixed(3)})`
                    ctx.beginPath()
                    ctx.arc(sx, sy, star.radius, 0, Math.PI * 2)
                    ctx.fill()

                    if (star.radius > 1.4 && a > 0.6) {
                        ctx.fillStyle = `rgba(255, 255, 255, ${(a * 0.35).toFixed(3)})`
                        ctx.beginPath()
                        ctx.arc(sx, sy, star.radius * 2.2, 0, Math.PI * 2)
                        ctx.fill()
                    }
                }
                ctx.restore()
            }

            const orbBaseX = palette === "day" ? width * 0.72 : palette === "dusk" ? width * 0.64 : width * 0.32
            const orbBaseY = palette === "day" ? height * 0.28 : palette === "dusk" ? height * 0.64 : height * 0.28

            const orbX = orbBaseX + px * 0.45
            const orbY = orbBaseY + py * 0.45
            const orbDrawSize = Math.min(width, height) * 0.55

            ctx.save()
            ctx.drawImage(
                orbSprite,
                orbX - orbDrawSize / 2,
                orbY - orbDrawSize / 2,
                orbDrawSize,
                orbDrawSize
            )
            ctx.restore()

            if (clouds) {
                ctx.save()
                for (const cloud of cloudList) {
                    const cx = cloud.x + px * (0.5 + cloud.depth * 0.7)
                    const cy = cloud.y * height + py * (0.5 + cloud.depth * 0.7)

                    ctx.globalAlpha = cloud.alpha
                    ctx.drawImage(cloud.sprite, cx, cy, cloud.w, cloud.h)

                    if (cx + cloud.w > width) {
                        ctx.drawImage(cloud.sprite, cx - (width + cloud.w), cy, cloud.w, cloud.h)
                    }
                }
                ctx.restore()
            }
        }

        const resize = () => {
            const rect = container.getBoundingClientRect()
            width = rect.width
            height = rect.height
            if (width === 0 || height === 0) return

            const rawDpr = window.devicePixelRatio || 1
            const dpr = Math.min(rawDpr, width > 1920 ? 1.5 : 2)

            canvas.width = Math.floor(width * dpr)
            canvas.height = Math.floor(height * dpr)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            for (let i = 0; i < cloudList.length; i++) {
                if (cloudList[i].x > width * 1.5) {
                    cloudList[i].x = (width / cloudList.length) * i
                }
            }

            drawScene(performance.now() / 1000)
        }

        const loop = (now: number) => {
            if (!isIntersecting || reduced) return

            const dt = Math.min((now - lastTime) / 1000, 0.05)
            lastTime = now

            if (parallax) {
                const lerp = 1 - Math.exp(-4.0 * dt)
                pointer.x += (pointer.tx - pointer.x) * lerp
                pointer.y += (pointer.ty - pointer.y) * lerp
            }

            if (clouds) {
                const speedMult = cloudSpeed * 2.5 + 6
                for (const cloud of cloudList) {
                    cloud.x += dt * cloud.speed * speedMult
                    if (cloud.x > width + cloud.w) {
                        cloud.x = -cloud.w
                    }
                }
            }

            drawScene(now / 1000)
            rafId = requestAnimationFrame(loop)
        }

        const onPointerMove = (e: PointerEvent) => {
            if (!parallax || reduced) return
            const rect = container.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) return
            const nx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2)
            const ny = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2)
            pointer.tx = clamp(nx, -1, 1)
            pointer.ty = clamp(ny, -1, 1)
        }

        const onReduceMotionChange = (e: MediaQueryListEvent) => {
            cancelAnimationFrame(rafId)
            reduced = e.matches
            if (reduced) {
                pointer.x = pointer.tx = 0
                pointer.y = pointer.ty = 0
                drawScene(performance.now() / 1000)
                return
            }
            lastTime = performance.now()
            rafId = requestAnimationFrame(loop)
        }

        const ro = new ResizeObserver(resize)
        ro.observe(container)

        const io = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                isIntersecting = entry.isIntersecting
                if (isIntersecting && !reduced) {
                    lastTime = performance.now()
                    cancelAnimationFrame(rafId)
                    rafId = requestAnimationFrame(loop)
                } else {
                    cancelAnimationFrame(rafId)
                }
            }
        })
        io.observe(container)

        if (parallax) {
            window.addEventListener("pointermove", onPointerMove, { passive: true })
        }

        reduceMotionQuery.addEventListener("change", onReduceMotionChange)

        resize()

        if (!reduced) {
            lastTime = performance.now()
            rafId = requestAnimationFrame(loop)
        }

        return () => {
            cancelAnimationFrame(rafId)
            ro.disconnect()
            io.disconnect()
            window.removeEventListener("pointermove", onPointerMove)
            reduceMotionQuery.removeEventListener("change", onReduceMotionChange)
        }
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
            style={style}
            className={`relative h-full w-full overflow-hidden ${className}`}
        >
            <canvas
                ref={canvasRef}
                aria-label={`Interactive sky scene (${palette} palette)`}
                className="pointer-events-none absolute inset-0 h-full w-full"
            />
        </div>
    )
}

export default Sky