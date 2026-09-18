// Star Burst — UI HUB

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
const RenderTarget = {
    current: () => "preview",
    canvas: "canvas",
    export: "export",
    thumbnail: "thumbnail",
    preview: "preview",
}

export default function StarBurst(props: Props) {
    props = { ...COMPONENT_DEFAULTS, ...props }
    const {
        speed,
        starCount,
        color,
        centerX,
        centerY,
        starSize,
        opacity,
        flowerIntensity,
        twinkleSpeed,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef = useRef<number | null>(null)
    const sizeRef = useRef({ w: 0, h: 0, dpr: 1 })

    const renderTarget = RenderTarget.current()
    const isStatic =
        renderTarget === RenderTarget.export ||
        renderTarget === RenderTarget.thumbnail

    const parseColor = (input: string): [number, number, number] => {
        if (!input) return [255, 255, 255]
        const s = input.trim()
        if (s.startsWith("#")) {
            let hex = s.slice(1)
            if (hex.length === 3) {
                hex = hex
                    .split("")
                    .map((c) => c + c)
                    .join("")
            }
            const num = parseInt(hex, 16)
            return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
        }
        const m = s.match(/rgba?\(([^)]+)\)/i)
        if (m) {
            const parts = m[1].split(",").map((p) => parseFloat(p.trim()))
            return [parts[0] || 0, parts[1] || 0, parts[2] || 0]
        }
        return [255, 255, 255]
    }

    useEffect(() => {
        const container = containerRef.current
        const canvas = canvasRef.current
        if (!container || !canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const cStar = parseColor(color)

        const safeSpeed = Math.max(0, (speed ?? 10) / 10)
        const safeCenterX = Math.max(0, Math.min(1, (centerX ?? 50) / 100))
        const safeCenterY = Math.max(0, Math.min(1, (centerY ?? 100) / 100))
        const safeStarSize = Math.max(0.01, (starSize ?? 6) / 20)
        const safeOpacity = Math.max(0, Math.min(1, (opacity ?? 100) / 100))
        const safeFlowerIntensity = Math.max(0, (flowerIntensity ?? 10) / 20)
        const safeTwinkleSpeed = Math.max(0, (twinkleSpeed ?? 4) / 20)

        const makeRng = (seed: number) => {
            let s = seed >>> 0
            return () => {
                s = (s + 0x6d2b79f5) >>> 0
                let t = s
                t = Math.imul(t ^ (t >>> 15), t | 1)
                t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
                return ((t ^ (t >>> 14)) >>> 0) / 4294967296
            }
        }
        const rng = makeRng(0xbadf00d)

        const sCount = Math.max(0, Math.floor(starCount))
        const pulsesPerSpoke = 15
        const MAX_TOTAL = 5000
        let nSpokes = sCount
        let perSpoke = pulsesPerSpoke
        if (nSpokes * perSpoke > MAX_TOTAL) {
            perSpoke = Math.max(1, Math.floor(MAX_TOTAL / Math.max(1, nSpokes)))
        }
        const particleCount = nSpokes * perSpoke

        const spokeAngle = new Float32Array(nSpokes)
        const spokeCos = new Float32Array(nSpokes)
        const spokeSin = new Float32Array(nSpokes)
        for (let i = 0; i < nSpokes; i++) {
            const baseAngle = (i / Math.max(1, nSpokes)) * Math.PI * 2
            const jitter = (rng() - 0.5) * 0.02
            spokeAngle[i] = baseAngle + jitter
            spokeCos[i] = Math.cos(spokeAngle[i])
            spokeSin[i] = Math.sin(spokeAngle[i])
        }

        const pSpokeIdx = new Uint16Array(particleCount)
        const pT = new Float32Array(particleCount)
        const pSpeed = new Float32Array(particleCount)
        const pSize = new Float32Array(particleCount)
        const pPhase = new Float32Array(particleCount)

        for (let i = 0; i < particleCount; i++) {
            pSpokeIdx[i] = i % nSpokes

            pT[i] = -0.05 + rng() * 1.1

            pSpeed[i] = (0.5 + rng() * 1.0) * 0.25
            pSize[i] = 0.7 + rng() * 0.8
            pPhase[i] = rng() * Math.PI * 2
        }

        const SPRITE_LEN = 64
        const streak = document.createElement("canvas")
        streak.width = SPRITE_LEN
        streak.height = 2
        const sctx = streak.getContext("2d")
        if (sctx) {
            const g = sctx.createLinearGradient(0, 0, SPRITE_LEN, 0)
            g.addColorStop(0, `rgba(${cStar[0]},${cStar[1]},${cStar[2]},0)`)
            g.addColorStop(0.7, `rgba(${cStar[0]},${cStar[1]},${cStar[2]},0.6)`)
            g.addColorStop(1, `rgba(${cStar[0]},${cStar[1]},${cStar[2]},1)`)
            sctx.fillStyle = g
            sctx.fillRect(0, 0, SPRITE_LEN, 2)
        }

        const resize = (entry?: ResizeObserverEntry) => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2)

            const cr = entry?.contentRect
            const rectW =
                cr?.width ||
                container.clientWidth ||
                container.getBoundingClientRect().width
            const rectH =
                cr?.height ||
                container.clientHeight ||
                container.getBoundingClientRect().height
            const w = Math.max(1, Math.floor(rectW) || 800)
            const h = Math.max(1, Math.floor(rectH) || 600)
            sizeRef.current = { w, h, dpr }
            canvas.width = Math.floor(w * dpr)
            canvas.height = Math.floor(h * dpr)
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        }

        resize()
        const ro = new ResizeObserver((entries) => resize(entries[0]))
        ro.observe(container)

        let timeSec = 0

        const drawFrame = (deltaSec: number) => {
            const { w, h, dpr } = sizeRef.current
            const dt = Math.max(0.001, Math.min(0.05, deltaSec))
            timeSec += dt

            if (w < 2 || h < 2) return

            const cx = safeCenterX * w
            const cy = safeCenterY * h

            const R = Math.sqrt(w * w + h * h)

            ctx.globalCompositeOperation = "source-over"
            ctx.fillStyle = "rgb(0,0,0)"
            ctx.fillRect(0, 0, w, h)

            ctx.globalCompositeOperation = "lighter"

            const bloomAlpha = safeFlowerIntensity * safeOpacity
            if (bloomAlpha > 0.001) {
                const minDim = Math.min(w, h)
                const bloomR = Math.max(
                    8,
                    minDim *
                        0.18 *
                        (safeFlowerIntensity * 0.5 + 0.5) *
                        (0.6 + safeStarSize * 0.4)
                )
                const a = Math.min(1, bloomAlpha)
                const fGrad = ctx.createRadialGradient(
                    cx,
                    cy,
                    0,
                    cx,
                    cy,
                    bloomR
                )
                fGrad.addColorStop(
                    0,
                    `rgba(${cStar[0]},${cStar[1]},${cStar[2]},${a})`
                )
                fGrad.addColorStop(
                    0.3,
                    `rgba(${cStar[0]},${cStar[1]},${cStar[2]},${a * 0.5})`
                )
                fGrad.addColorStop(
                    0.7,
                    `rgba(${cStar[0]},${cStar[1]},${cStar[2]},${a * 0.15})`
                )
                fGrad.addColorStop(
                    1,
                    `rgba(${cStar[0]},${cStar[1]},${cStar[2]},0)`
                )
                ctx.fillStyle = fGrad
                ctx.fillRect(cx - bloomR, cy - bloomR, bloomR * 2, bloomR * 2)
            }

            for (let i = 0; i < particleCount; i++) {
                pT[i] += pSpeed[i] * safeSpeed * dt
                if (pT[i] > 1.1) {
                    pT[i] = -0.05 - rng() * 0.05
                    pSize[i] = 0.7 + rng() * 0.8
                    pPhase[i] = rng() * Math.PI * 2
                }

                const t = pT[i]
                if (t < 0) continue
                if (t >= 1.0) continue

                const twinkle =
                    0.7 +
                    0.3 * Math.sin(timeSec * safeTwinkleSpeed * 6 + pPhase[i])

                let fade: number
                if (t < 0.06) {
                    fade = t / 0.06
                } else if (t < 0.85) {
                    fade = 1
                } else {
                    fade = 1 - (t - 0.85) / 0.15
                }

                const a = Math.min(
                    1,
                    twinkle * fade * (1 + 0.5 * t) * safeOpacity
                )
                if (a < 0.005) continue

                const dist = t * R
                const sIdx = pSpokeIdx[i]
                const cosA = spokeCos[sIdx]
                const sinA = spokeSin[sIdx]

                const px = cx + cosA * dist
                const py = cy + sinA * dist
                const speedFactor = pSpeed[i] / 0.25
                const lineLen =
                    (8 + 12 * speedFactor) *
                    (0.7 + 0.6 * pSize[i] * safeStarSize)

                ctx.setTransform(
                    dpr * cosA,
                    dpr * sinA,
                    -dpr * sinA,
                    dpr * cosA,
                    dpr * px,
                    dpr * py
                )
                ctx.globalAlpha = a
                ctx.drawImage(streak, -lineLen, -0.5, lineLen, 1)
            }

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.globalAlpha = 1
        }

        if (isStatic) {
            for (let i = 0; i < 60; i++) drawFrame(1 / 60)
            return () => {
                ro.disconnect()
            }
        }

        let lastT = performance.now()
        const loop = (t: number) => {
            const deltaSec = (t - lastT) / 1000
            lastT = t
            drawFrame(deltaSec)
            rafRef.current = requestAnimationFrame(loop)
        }
        rafRef.current = requestAnimationFrame(loop)

        return () => {
            if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
            ro.disconnect()
        }
    }, [
        speed,
        starCount,
        color,
        centerX,
        centerY,
        starSize,
        opacity,
        flowerIntensity,
        twinkleSpeed,
        isStatic,
    ])

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "#000",
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

type Props = {
    speed: number
    starCount: number
    color: string
    centerX: number
    centerY: number
    starSize: number
    opacity: number
    flowerIntensity: number
    twinkleSpeed: number
    style?: React.CSSProperties
}

const COMPONENT_DEFAULTS = {
    speed: 10,
    starCount: 100,
    color: "#FFFFFF",
    centerX: 50,
    centerY: 100,
    starSize: 12,
    opacity: 50,
    flowerIntensity: 10,
    twinkleSpeed: 4,
}