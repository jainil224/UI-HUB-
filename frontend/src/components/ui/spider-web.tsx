// Spider Web — UI HUB
// Using component defaults.

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

/**
 * Spider Web — an orb web strung across the frame whose silk gives way under
 * the pointer and springs back once it has passed.
 *
 * Every intersection is a mass on a spring anchored to where it ought to be, so
 * the web is never posed: the pointer pushes the nearest nodes outward, their
 * neighbours are dragged along by the strands drawn between them, and the whole
 * sheet rings for a moment before it settles. The outer ring is pinned beyond
 * the frame, the way a real web is guyed to whatever is around it, which is
 * what stops the sheet from sliding bodily off its mountings.
 *
 * The loop stops itself once the silk is still and nothing is hovering, so a
 * web at rest costs nothing until the pointer comes back.
 */

const DEFAULTS = {
    color: "#DCE6FF",
    opacity: 100,
    segments: 28,
    rings: 14,
    thickness: 3,
    sag: 20,
    irregularity: 0,
    hoverIntensity: 20,
    nodes: false,
    nodeColor: "#FFFFFF",
    nodeSize: 4,
}

/**
 * The spring used to be a modal of sliders. It is run at the top of its old
 * range here instead: silk that snaps back hard and rings for a while.
 *
 * Damping is a fraction of critical rather than a number of its own — a fixed
 * damping that reads as a gentle wobble on slack silk will not settle a stiff
 * web at all, so it has to be derived from the stiffness to mean anything.
 */
const STIFFNESS = 460
const DAMPING = 2 * Math.sqrt(STIFFNESS) * 0.05

/**
 * How far the pointer's influence carries, and how hard it shoves at the middle
 * of that reach.
 *
 * Reach is fixed and strength is on the panel, which is the way round that
 * behaves: widening the reach on a sprung sheet drags in nodes whose neighbours
 * are still anchored, so the silk stretches rather than moving, and the control
 * reads as "less effect" exactly where it should read as more.
 */
const REACH = 370
const PUSH = 90

type Config = {
    color: string
    opacity: number
    segments: number
    rings: number
    thickness: number
    sag: number
    irregularity: number
    hoverIntensity: number
    nodes: boolean
    nodeColor: string
    nodeSize: number
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

/** Deterministic, so a web keeps the same crooked strands frame to frame. */
function hash(a: number, b: number): number {
    const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453
    return s - Math.floor(s)
}

/**
 * Panel values are whole numbers on friendly ranges; the simulation wants the
 * real ones, so the mapping lives here only.
 */
function settingsFor(cfg: Config) {
    return {
        color: cfg.color || DEFAULTS.color,
        opacity: clamp(cfg.opacity, 0, 100, DEFAULTS.opacity) / 100,
        segments: Math.round(clamp(cfg.segments, 5, 28, DEFAULTS.segments)),
        rings: Math.round(clamp(cfg.rings, 3, 14, DEFAULTS.rings)),
        // Half a pixel at the bottom of the slider — silk, not rope.
        thickness: 0.3 + clamp(cfg.thickness, 1, 10, DEFAULTS.thickness) * 0.22,
        // How far a strand bows toward the middle, as a share of its own span.
        sag: clamp(cfg.sag, 0, 20, DEFAULTS.sag) * 0.011,
        irregularity: clamp(cfg.irregularity, 0, 20, DEFAULTS.irregularity) * 0.02,
        /*
         * How hard the pointer shoves, as a multiple of the built-in push. 10
         * on the panel is the strength the web had before this was a control,
         * so an instance already placed keeps the behaviour it was tuned with.
         */
        push: (PUSH * clamp(cfg.hoverIntensity, 0, 20, DEFAULTS.hoverIntensity)) / 10,
        nodes: !!cfg.nodes,
        nodeColor: cfg.nodeColor || DEFAULTS.nodeColor,
        nodeSize: 0.4 + clamp(cfg.nodeSize, 1, 10, DEFAULTS.nodeSize) * 0.18,
    }
}

type Node = {
    // Where the strand wants to be, and where it actually is.
    restX: number
    restY: number
    x: number
    y: number
    vx: number
    vy: number
    pinned: boolean
}

class WebScene {
    private container: HTMLElement
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private cfg: Config

    // Nodes are laid out as [ring][spoke], which is what lets the draw walk the
    // rings and the radials without an index buffer of its own.
    private grid: Node[][] = []
    private width = 0
    private height = 0
    private dpr = 1

    private pointerX = 0
    private pointerY = 0
    private pointerIn = false

    private frameId = 0
    private lastT = 0
    private running = false
    private disposed = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg

        this.canvas = document.createElement("canvas")
        const el = this.canvas
        el.style.position = "absolute"
        el.style.inset = "0"
        el.style.width = "100%"
        el.style.height = "100%"
        el.style.display = "block"
        el.style.touchAction = "none"
        container.appendChild(el)

        const ctx = el.getContext("2d")
        if (!ctx) throw new Error("No 2D context")
        this.ctx = ctx

        this.bindEvents()
    }

    /**
     * The web is rebuilt whenever its shape changes, and every node starts at
     * rest. The outer ring is placed past the corners and pinned, so the silk
     * runs off the edge of the frame rather than ending in mid air.
     */
    private build() {
        const S = settingsFor(this.cfg)
        const cx = this.width / 2
        const cy = this.height / 2
        // Past the corner, so no ring is ever visible as a closed loop.
        const outer = Math.hypot(this.width, this.height) * 0.56

        this.grid = []
        for (let i = 0; i < S.rings; i++) {
            const row: Node[] = []
            // Rings crowd toward the middle the way an orb web's do, rather
            // than dividing the radius evenly.
            const t = (i + 1) / S.rings
            const radius = outer * Math.pow(t, 1.35)
            for (let j = 0; j < S.segments; j++) {
                // A little wander on both the angle and the radius: a perfectly
                // regular web reads as a wire wheel.
                const wobbleA = (hash(i, j) - 0.5) * S.irregularity
                const wobbleR = 1 + (hash(j, i) - 0.5) * S.irregularity
                const angle = (j / S.segments) * Math.PI * 2 + wobbleA
                const r = radius * wobbleR
                const x = cx + Math.cos(angle) * r
                const y = cy + Math.sin(angle) * r
                row.push({
                    restX: x,
                    restY: y,
                    x,
                    y,
                    vx: 0,
                    vy: 0,
                    pinned: i === S.rings - 1,
                })
            }
            this.grid.push(row)
        }
    }

    private bindEvents() {
        const el = this.canvas
        const move = (e: PointerEvent) => {
            const rect = el.getBoundingClientRect()
            this.pointerX = e.clientX - rect.left
            this.pointerY = e.clientY - rect.top
            this.pointerIn = true
            // The loop parks itself when the silk is still, so a pointer
            // arriving has to wake it back up.
            this.wake()
        }
        const leave = () => {
            this.pointerIn = false
            this.wake()
        }
        el.addEventListener("pointermove", move)
        el.addEventListener("pointerleave", leave)
        el.addEventListener("pointercancel", leave)
        this.unbind = () => {
            el.removeEventListener("pointermove", move)
            el.removeEventListener("pointerleave", leave)
            el.removeEventListener("pointercancel", leave)
        }
    }

    private unbind = () => {}

    setSize(width: number, height: number) {
        if (this.disposed || width <= 0 || height <= 0) return
        this.width = width
        this.height = height
        this.dpr = Math.min(window.devicePixelRatio || 1, 2)
        this.canvas.width = Math.round(width * this.dpr)
        this.canvas.height = Math.round(height * this.dpr)
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
        this.build()
        this.wake()
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        const prev = this.cfg
        this.cfg = cfg
        // Only the layout owns the node grid; everything else is read while the
        // web is already running.
        if (
            prev.segments !== cfg.segments ||
            prev.rings !== cfg.rings ||
            prev.irregularity !== cfg.irregularity
        ) {
            this.build()
        }
        this.wake()
    }

    /** Restarts the loop if it has parked itself. */
    private wake() {
        if (this.disposed || this.running) return
        this.running = true
        this.lastT = performance.now()
        const loop = () => {
            if (!this.running) return
            this.frameId = requestAnimationFrame(loop)
            this.step()
        }
        loop()
    }

    private step() {
        if (this.disposed) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0
        // A backgrounded tab resumes with one enormous frame otherwise, and an
        // explicit spring integrated over it flies apart.
        if (dt > 0.033) dt = 0.033

        const S = settingsFor(this.cfg)
        const reach2 = REACH * REACH
        let energy = 0

        for (const row of this.grid) {
            for (const n of row) {
                if (n.pinned) continue

                // Spring back toward rest, damped.
                let ax = (n.restX - n.x) * STIFFNESS - n.vx * DAMPING
                let ay = (n.restY - n.y) * STIFFNESS - n.vy * DAMPING

                if (this.pointerIn && S.push > 0) {
                    const dx = n.x - this.pointerX
                    const dy = n.y - this.pointerY
                    const d2 = dx * dx + dy * dy
                    if (d2 < reach2) {
                        const d = Math.sqrt(d2) || 0.0001
                        // Squared falloff, so the pointer has a soft edge
                        // rather than a rim the silk snaps over.
                        const fall = 1 - d / REACH
                        const f = (S.push * fall * fall * STIFFNESS) / 40
                        ax += (dx / d) * f
                        ay += (dy / d) * f
                    }
                }

                n.vx += ax * dt
                n.vy += ay * dt
                n.x += n.vx * dt
                n.y += n.vy * dt
                energy += Math.abs(n.vx) + Math.abs(n.vy)
            }
        }

        this.draw(S)

        // Nothing moving and nothing hovering means nothing to draw next frame,
        // so the loop parks until something wakes it. A pointer that has been
        // turned down to no strength counts as nothing hovering, or the web
        // would keep redrawing an unchanging picture for as long as the cursor
        // sat over it.
        if ((!this.pointerIn || S.push <= 0) && energy < 0.5) {
            this.running = false
            cancelAnimationFrame(this.frameId)
        }
    }

    private draw(S: ReturnType<typeof settingsFor>) {
        const ctx = this.ctx
        const cx = this.width / 2
        const cy = this.height / 2
        ctx.clearRect(0, 0, this.width, this.height)
        if (!this.grid.length) return

        ctx.strokeStyle = S.color
        ctx.globalAlpha = S.opacity
        ctx.lineWidth = S.thickness
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        const rings = this.grid.length
        const segments = this.grid[0].length

        // Radials: centre out to the anchors, through every ring on the way.
        for (let j = 0; j < segments; j++) {
            ctx.beginPath()
            ctx.moveTo(cx, cy)
            for (let i = 0; i < rings; i++) {
                const n = this.grid[i][j]
                ctx.lineTo(n.x, n.y)
            }
            ctx.stroke()
        }

        /*
         * Spirals: each strand bows toward the middle instead of running
         * straight between its two nodes. A quadratic through a control point
         * pulled inward is the whole of it — real silk hangs, and a web of
         * straight chords reads as a geodesic dome.
         */
        for (let i = 0; i < rings; i++) {
            const row = this.grid[i]
            ctx.beginPath()
            for (let j = 0; j < segments; j++) {
                const a = row[j]
                const b = row[(j + 1) % segments]
                const mx = (a.x + b.x) / 2
                const my = (a.y + b.y) / 2
                const cxp = mx + (cx - mx) * S.sag
                const cyp = my + (cy - my) * S.sag
                if (j === 0) ctx.moveTo(a.x, a.y)
                ctx.quadraticCurveTo(cxp, cyp, b.x, b.y)
            }
            ctx.stroke()
        }

        if (S.nodes) {
            ctx.fillStyle = S.nodeColor
            for (const row of this.grid) {
                for (const n of row) {
                    ctx.beginPath()
                    ctx.arc(n.x, n.y, S.nodeSize, 0, Math.PI * 2)
                    ctx.fill()
                }
            }
        }

        ctx.globalAlpha = 1
    }

    dispose() {
        this.disposed = true
        this.running = false
        cancelAnimationFrame(this.frameId)
        this.unbind()
        if (this.canvas.parentNode === this.container)
            this.container.removeChild(this.canvas)
    }
}

export interface SpiderWebProps {
    color?: string
    opacity?: number
    segments?: number
    rings?: number
    thickness?: number
    sag?: number
    irregularity?: number
    hoverIntensity?: number
    nodes?: boolean
    nodeColor?: string
    nodeSize?: number
    style?: React.CSSProperties
}

export default function SpiderWeb(props: SpiderWebProps) {
    const {
        color = DEFAULTS.color,
        opacity = DEFAULTS.opacity,
        segments = DEFAULTS.segments,
        rings = DEFAULTS.rings,
        thickness = DEFAULTS.thickness,
        sag = DEFAULTS.sag,
        irregularity = DEFAULTS.irregularity,
        hoverIntensity = DEFAULTS.hoverIntensity,
        nodes = DEFAULTS.nodes,
        nodeColor = DEFAULTS.nodeColor,
        nodeSize = DEFAULTS.nodeSize,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<WebScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        color,
        opacity,
        segments,
        rings,
        thickness,
        sag,
        irregularity,
        hoverIntensity,
        nodes,
        nodeColor,
        nodeSize,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: WebScene
        try {
            scene = new WebScene(container, cfgRef.current)
        } catch {
            // No 2D context — render an empty frame rather than throwing.
            return
        }
        sceneRef.current = scene
        scene.setSize(container.clientWidth, container.clientHeight)

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
        color,
        opacity,
        segments,
        rings,
        thickness,
        sag,
        irregularity,
        hoverIntensity,
        nodes,
        nodeColor,
        nodeSize,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Spider web"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

SpiderWeb.displayName = "Spider Web"