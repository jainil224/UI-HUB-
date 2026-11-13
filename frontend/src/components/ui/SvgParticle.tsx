// SVG Particle — UI HUB

// @ts-nocheck
"use client"

import { useEffect, useRef } from "react"

function containRect(iW, iH, cW, cH) {
    const a = iW / iH,
        b = cW / cH
    return a > b
        ? {
              x: 0,
              y: Math.round((cH - cW / a) / 2),
              w: cW,
              h: Math.round(cW / a),
          }
        : {
              x: Math.round((cW - cH * a) / 2),
              y: 0,
              w: Math.round(cH * a),
              h: cH,
          }
}
function parseColor(c) {
    if (!c) return { r: 200, g: 200, b: 200, a: 255 }
    const m = c.match(
        /rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/
    )
    if (m)
        return {
            r: +m[1] | 0,
            g: +m[2] | 0,
            b: +m[3] | 0,
            a: m[4] != null ? Math.round(+m[4] * 255) : 255,
        }
    const h = c.replace("#", "")
    if (h.length >= 6)
        return {
            r: parseInt(h.slice(0, 2), 16),
            g: parseInt(h.slice(2, 4), 16),
            b: parseInt(h.slice(4, 6), 16),
            a: h.length === 8 ? parseInt(h.slice(6, 8), 16) : 255,
        }
    return { r: 200, g: 200, b: 200, a: 255 }
}
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[a[i], a[j]] = [a[j], a[i]]
    }
}

function randomInShape(shape, bx, by, bw, bh) {
    const cx = bx + bw / 2,
        cy = by + bh / 2
    if (shape === "circle") {
        const r = bw / 2
        const a = Math.random() * Math.PI * 2
        const d = Math.sqrt(Math.random()) * r
        return [cx + Math.cos(a) * d, cy + Math.sin(a) * d]
    }
    if (shape === "oval") {
        const rx = bw / 2,
            ry = bh / 2
        const a = Math.random() * Math.PI * 2
        const d = Math.sqrt(Math.random())
        return [cx + d * rx * Math.cos(a), cy + d * ry * Math.sin(a)]
    }

    return [bx + Math.random() * bw, by + Math.random() * bh]
}

const EASE = {
    easeOut: (t) => 1 - (1 - t) * (1 - t),
    easeInOut: (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t)),
    easeIn: (t) => t * t,
    backOut: (t) => {
        const c = 1.70158 + 1
        return 1 + c * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2
    },
    circOut: (t) => Math.sqrt(1 - (t - 1) * (t - 1)),
    linear: (t) => t,
}

function getTransitionParams(tr) {
    if (!tr) return { easeFn: EASE.easeOut, durMs: 800 }
    if (tr.type === "spring") {
        const k = tr.stiffness ?? 100,
            d = tr.damping ?? 15,
            m = tr.mass ?? 1
        const durMs = Math.min(
            3000,
            Math.max(300, (d / (2 * Math.sqrt(k * m))) * 2000)
        )
        return { easeFn: EASE.backOut, durMs }
    }
    return {
        easeFn: EASE[tr.ease] || EASE.easeOut,
        durMs: (tr.duration ?? 0.8) * 1000,
    }
}
const DAMPING = 0.65

// Module-level caches. The default art is served from the app itself, and both the decoded
// image and the sampled pixel set survive unmount/remount, so a second mount (React
// StrictMode, a hover popover opening, a route round-trip) paints on the first frame.
const IMG_CACHE = new Map()
const SAMPLE_CACHE = new Map()
const MAX_PARTICLES = 24000

function loadImage(url) {
    const hit = IMG_CACHE.get(url)
    if (hit) return hit
    const pending = new Promise((resolve, reject) => {
        const attempt = (cors) => {
            const img = new Image()
            if (cors) img.crossOrigin = "anonymous"
            img.onload = () => resolve(img)
            img.onerror = () => {
                if (cors) attempt(false)
                else reject(new Error("image failed to load"))
            }
            img.src = url
        }
        attempt(true)
    })
    IMG_CACHE.set(url, pending)
    pending.catch(() => IMG_CACHE.delete(url))
    return pending
}

function sampleImage(img, W, H, cfg) {
    const { md, sU, wPx, hPx, wPct, hPct, sc, count } = cfg
    let rect
    if (md === "fit") {
        const base = containRect(
            img.naturalWidth || img.width,
            img.naturalHeight || img.height,
            W,
            H
        )
        const f = Math.max(1, Math.min(20, sc)) / 10
        const w = base.w * f
        const h = base.h * f
        rect = { x: (W - w) / 2, y: (H - h) / 2, w, h }
    } else if (sU === "px") {
        const w = Math.min(wPx, W)
        const h = Math.min(hPx, H)
        rect = { x: (W - w) / 2, y: (H - h) / 2, w, h }
    } else {
        const w = (W * wPct) / 100
        const h = (H * hPct) / 100
        rect = { x: (W - w) / 2, y: (H - h) / 2, w, h }
    }
    const off = document.createElement("canvas")
    off.width = W
    off.height = H
    const oc = off.getContext("2d", { willReadFrequently: true })
    if (!oc) return null
    oc.drawImage(img, rect.x, rect.y, rect.w, rect.h)
    let px
    try {
        px = oc.getImageData(0, 0, W, H).data
    } catch (_) {
        return null
    }
    let gap = Math.max(2, Math.round(150 / Math.max(1, count)))
    while (gap < 40 && Math.ceil(W / gap) * Math.ceil(H / gap) > MAX_PARTICLES) gap++
    const src = []
    for (let y = 0; y < H; y += gap)
        for (let x = 0; x < W; x += gap) {
            const i = (y * W + x) * 4
            if (px[i + 3] >= 20)
                src.push({
                    homeX: x,
                    homeY: y,
                    r: px[i],
                    g: px[i + 1],
                    b: px[i + 2],
                    a: px[i + 3],
                })
        }
    shuffle(src)
    return src
}

// If the art can never be read (missing file, blocked network, tainted canvas) the stage still
// shows a dot cloud instead of staying blank.
function fallbackDots(W, H) {
    const src = []
    const total = 1100
    const cx = W / 2
    const cy = H / 2
    const radius = Math.max(24, Math.min(W, H) * 0.33)
    for (let i = 0; i < total; i++) {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.sqrt(Math.random()) * radius
        const t = 1 - dist / radius
        src.push({
            homeX: Math.round(cx + Math.cos(angle) * dist),
            homeY: Math.round(cy + Math.sin(angle) * dist),
            r: Math.round(61 + 194 * t),
            g: Math.round(92 + 163 * t),
            b: 255,
            a: 255,
        })
    }
    return src
}

function mkParticle(src, x, y, idleX, idleY, isExtra = false) {
    return {
        x,
        y,
        vx: 0,
        vy: 0,
        startX: x,
        startY: y,
        repX: 0,
        repY: 0,
        repVX: 0,
        repVY: 0,
        homeX: src.homeX,
        homeY: src.homeY,
        idleX,
        idleY,
        r: src.r,
        g: src.g,
        b: src.b,
        a: src.a,
        totalDist: Math.max(
            1,
            Math.sqrt((src.homeX - x) ** 2 + (src.homeY - y) ** 2)
        ),
        isPadding: false,
        isExtra,
        inZone: false,
        roamTargetX: 0,
        roamTargetY: 0,
        colorIdx: Math.floor(Math.random() * 10),
        repTargetX: 0,
        repTargetY: 0,
    }
}

function SvgParticleBase(__props) {
    const {
        imageConfig,
        particleCount,
        particleSize,
        particleShape = "circle",
        particleColor = "original",
        singleColor = "#ffffff",
        multiColors = [],
        hoverEnabled = true,
        hoverConfig = {},
        repulsionEnabled = true,
        repulsionConfig = {},
        width,
        height,
        style,
        ...props
    } = { ...COMPONENT_DEFAULTS, ...__props }
    const hover = hoverEnabled
    const {
        hoverType = "roam",
        transition,
        roamWidth = 0,
        roamHeight = 0,
        roamOpacity = 0.5,
        roamShape = "rectangle",
        hideType = "scatter",
    } = (hoverConfig as any) || {}
    const repulsion = repulsionEnabled
    const {
        repulsionForce = 6,
        repulsionRadius = 80,
        repulsionMode = "outside",
    } = repulsionConfig || {}
    const DEFAULT_IMAGE = "/assets/svg-particle/particle-art.jpg"
    const {
        image: rawImage,
        mode = "fill",
        sizeUnit = "%",
        widthPx = 400,
        heightPx = 400,
        widthPct = 100,
        heightPct = 100,
        scale = 5,
    } = (imageConfig as any) || {}
    const image = rawImage || DEFAULT_IMAGE
    const containerRef = useRef(null)
    const canvasRef = useRef(null)
    const mouseRef = useRef({ x: -99999, y: -99999, active: false })
    const prevMouseRef = useRef({ x: -99999, y: -99999 })
    const mouseSpeedRef = useRef(0)

    const smoothMouseRef = useRef({ x: -99999, y: -99999 })
    const physicsRef = useRef({})
    physicsRef.current = {
        hover,
        hoverType,
        transition,
        roamWidth,
        roamHeight,
        roamOpacity,
        roamShape,
        hideType,
        repulsion,
        repulsionForce,
        repulsionRadius,
        repulsionMode,
        particleSize,
        particleShape,
        particleColor,
        singleColor,
        multiColors,
    }
    const sceneRef = useRef({ particles: [] })
    const dimsRef = useRef({ W: 0, H: 0 })
    const samplingRef = useRef({})
    samplingRef.current = {
        image,
        mode,
        sizeUnit,
        widthPx,
        heightPx,
        widthPct,
        heightPct,
        scale,
        particleCount,
        hover,
        hoverType,
        roamWidth,
        roamHeight,
        roamShape,
        hideType,
    }
    const animStateRef = useRef("active")
    const animRef = useRef(null)
    const animStartTimeRef = useRef(0)
    const animTimerRef = useRef(null)
    const roamFadeStartRef = useRef(0)
    const roamFadeFromRef = useRef(1)
    const roamFadeToRef = useRef(1)
    const loadTokenRef = useRef(0)

    const startAnimRef = useRef(null)
    startAnimRef.current = (newState) => {
        const { particles } = sceneRef.current
        const { W, H } = dimsRef.current
        const {
            hoverType: ht,
            roamWidth: rw,
            roamHeight: rh,
            roamShape: rs,
            roamOpacity: rOp,
            transition: tr,
        } = physicsRef.current as any
        const { durMs: _dur } = getTransitionParams(tr)
        const bw = Math.max(80, rw || W),
            bh = Math.max(80, rh || H)
        const bx = (W - bw) / 2,
            by = (H - bh) / 2
        particles.forEach((p) => {
            if (p.isPadding) return
            p.startX = p.x
            p.startY = p.y
            if (newState === "scattering" && ht === "roam") {
                const [tx, ty] = randomInShape(rs, bx, by, bw, bh)
                p.roamTargetX = tx
                p.roamTargetY = ty
                p.idleX = tx
                p.idleY = ty
            }
        })

        const _rOp = rOp ?? 0.5
        if (ht === "roam") {
            if (newState === "scattering") {
                roamFadeStartRef.current = Date.now()
                roamFadeFromRef.current = 1
                roamFadeToRef.current = _rOp
            } else if (newState === "assembling") {
                roamFadeStartRef.current = Date.now()
                roamFadeFromRef.current = _rOp
                roamFadeToRef.current = 1
            }
        }

        if (newState === "scattering" && ht === "roam") {
            clearTimeout(animTimerRef.current)
            animStateRef.current = "idle"
            return
        }
        animStartTimeRef.current = Date.now()
        animStateRef.current = newState
        clearTimeout(animTimerRef.current)
        const next = newState === "assembling" ? "active" : "idle"
        animTimerRef.current = setTimeout(() => {
            if (animStateRef.current === newState) animStateRef.current = next
        }, _dur)
    }

    const initParticles = () => {
        const {
            image: url,
            mode: md,
            sizeUnit: sU,
            widthPx: wPx,
            heightPx: hPx,
            widthPct: wPct,
            heightPct: hPct,
            scale: sc,
            particleCount: count,
            hover: hOn,
            hoverType: ht,
            roamWidth: rw,
            roamHeight: rh,
            roamShape: rs,
            hideType: hT,
        } = samplingRef.current as any
        const { W, H } = dimsRef.current
        if (!url || !W || !H) return
        const canvas = canvasRef.current
        if (!canvas) return
        clearTimeout(animTimerRef.current)
        const dpr = window.devicePixelRatio || 1
        const cw = Math.round(W * dpr)
        const ch = Math.round(H * dpr)
        if (canvas.width !== cw || canvas.height !== ch) {
            canvas.width = cw
            canvas.height = ch
        }
        mouseRef.current = { x: -99999, y: -99999, active: false }

        const spawn = (src) => {
            if (!src || !src.length) return
            let particles = []
            const hidePos = (homeX, homeY) => {
                const range = hT === "in-place" ? 1 : 10
                const maxD = Math.max(W, H)
                const d = (range / 10) * 0.5 * maxD
                const angle = Math.random() * Math.PI * 2
                return [homeX + Math.cos(angle) * d, homeY + Math.sin(angle) * d]
            }
            if (!hOn) {
                animStateRef.current = "active"
                particles = src.map((p) =>
                    mkParticle(p, p.homeX, p.homeY, p.homeX, p.homeY)
                )
            } else if (ht === "roam") {
                const bw = Math.max(80, rw || W)
                const bh = Math.max(80, rh || H)
                const bx = (W - bw) / 2
                const by = (H - bh) / 2
                particles = src.map((p) => {
                    const [rx, ry] = randomInShape(rs, bx, by, bw, bh)
                    const pt = mkParticle(p, rx, ry, rx, ry)
                    const [tx, ty] = randomInShape(rs, bx, by, bw, bh)
                    pt.roamTargetX = tx
                    pt.roamTargetY = ty
                    pt.vx = (Math.random() - 0.5) * 1.2
                    pt.vy = (Math.random() - 0.5) * 1.2
                    return pt
                })
                animStateRef.current = "idle"
            } else {
                particles = src.map((p) => {
                    const [ox, oy] = hidePos(p.homeX, p.homeY)
                    return mkParticle(p, ox, oy, ox, oy)
                })
                animStateRef.current = "idle"
            }
            sceneRef.current = { particles }
        }

        const key = [url, W, H, md, sU, wPx, hPx, wPct, hPct, sc, Math.max(1, count)].join("|")
        const cached = SAMPLE_CACHE.get(key)
        if (cached) {
            spawn(cached)
            return
        }

        const token = ++loadTokenRef.current
        loadImage(url)
            .then((img) => {
                if (token !== loadTokenRef.current) return
                const src = sampleImage(img, W, H, {
                    md,
                    sU,
                    wPx,
                    hPx,
                    wPct,
                    hPct,
                    sc,
                    count,
                })
                if (!src) {
                    spawn(fallbackDots(W, H))
                    return
                }
                SAMPLE_CACHE.set(key, src)
                if (SAMPLE_CACHE.size > 16) {
                    const oldest = SAMPLE_CACHE.keys().next()
                    if (!oldest.done) SAMPLE_CACHE.delete(oldest.value)
                }
                spawn(src)
            })
            .catch(() => {
                if (token === loadTokenRef.current) spawn(fallbackDots(W, H))
            })
    }
    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const r = entries[0]?.contentRect
            if (!r) return
            const W = Math.round(r.width),
                H = Math.round(r.height)
            if (!W || !H) return
            dimsRef.current = { W, H }
            initParticles()
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])
    useEffect(() => {
        initParticles()
    }, [
        image,
        mode,
        sizeUnit,
        widthPx,
        heightPx,
        widthPct,
        heightPct,
        scale,
        particleCount,
        hover,
        hoverType,
        roamWidth,
        roamHeight,
        roamShape,
        hideType,
    ])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        let idata = null,
            bW = 0,
            bH = 0
        const draw = () => {
            animRef.current = requestAnimationFrame(draw)
            const PW = canvas.width,
                PH = canvas.height
            if (!PW || !PH) return
            const dpr = window.devicePixelRatio || 1
            const { particles } = sceneRef.current
            if (!particles.length) return
            if (!idata || PW !== bW || PH !== bH) {
                idata = ctx.createImageData(PW, PH)
                bW = PW
                bH = PH
            }
            idata.data.fill(0)
            const buf = idata.data
            const {
                hover: hOn,
                hoverType: ht,
                transition: tr,
                roamWidth: rw,
                roamHeight: rh,
                roamOpacity: rOp,
                roamShape: rs,
                repulsion: repOn,
                repulsionForce: rF,
                repulsionRadius: rR,
                repulsionMode: rMode,
                particleSize: pSz,
                particleShape: pShape,
                particleColor: pColor,
                singleColor: scColor,
                multiColors: mcColors,
            } = physicsRef.current as any
            const state = animStateRef.current
            const { x: rawMx, y: rawMy, active } = mouseRef.current

            const hitSpeed = mouseSpeedRef.current
            mouseSpeedRef.current *= 0.88

            const sm = smoothMouseRef.current
            if (active) {
                const lerpFactor = Math.max(0.08, 0.3 - hitSpeed * 0.006)
                if (sm.x < -9000) {
                    sm.x = rawMx
                    sm.y = rawMy
                } else {
                    sm.x += (rawMx - sm.x) * lerpFactor
                    sm.y += (rawMy - sm.y) * lerpFactor
                }
            } else {
                sm.x = -99999
                sm.y = -99999
            }
            const mx = sm.x
            const my = sm.y
            const ps = Math.max(1, Math.ceil((pSz / 4) * dpr))
            const { easeFn, durMs } = getTransitionParams(tr)
            const elapsed = Date.now() - animStartTimeRef.current
            const animT = easeFn(Math.min(1, elapsed / durMs))
            const { W: DW, H: DH } = dimsRef.current
            const bw = Math.max(80, rw || DW),
                bh = Math.max(80, rh || DH)
            const bx = (DW - bw) / 2,
                by = (DH - bh) / 2

            const half = ps / 2
            const drawParticle = (cx, cy, r, g, b, a, isCircle) => {
                const px0 = Math.round(cx) - (ps >> 1)
                const py0 = Math.round(cy) - (ps >> 1)
                for (let dy = 0; dy < ps; dy++) {
                    const iy = py0 + dy
                    if (iy < 0 || iy >= PH) continue
                    const row = iy * PW
                    for (let dx = 0; dx < ps; dx++) {
                        if (isCircle) {
                            const ddx = dx - half + 0.5,
                                ddy = dy - half + 0.5
                            if (ddx * ddx + ddy * ddy > half * half) continue
                        }
                        const ix = px0 + dx
                        if (ix < 0 || ix >= PW) continue
                        const i = (row + ix) * 4
                        buf[i] = r
                        buf[i + 1] = g
                        buf[i + 2] = b
                        buf[i + 3] = a
                    }
                }
            }
            const repCutoff = Math.max(1, rR)
            const repCutoffSq = repCutoff * repCutoff
            let pIdx = 0
            for (const p of particles) {
                const isCircle =
                    pShape === "circle" || (pShape === "both" && pIdx % 2 === 1)
                pIdx++
                if (p.isPadding) continue

                let baseX = p.x,
                    baseY = p.y
                if (state === "assembling") {
                    baseX = p.startX + (p.homeX - p.startX) * animT
                    baseY = p.startY + (p.homeY - p.startY) * animT
                } else if (state === "scattering") {
                    baseX = p.startX + (p.idleX - p.startX) * animT
                    baseY = p.startY + (p.idleY - p.startY) * animT
                } else if (state === "active") {
                    baseX = p.homeX
                    baseY = p.homeY
                } else if (state === "idle") {
                    if (ht === "roam") {
                        const dtx = p.roamTargetX - p.x,
                            dty = p.roamTargetY - p.y
                        if (Math.sqrt(dtx * dtx + dty * dty) < 3) {
                            const [tx, ty] = randomInShape(rs, bx, by, bw, bh)
                            p.roamTargetX = tx
                            p.roamTargetY = ty
                        }
                        p.vx =
                            (p.vx || 0) * 0.98 + (p.roamTargetX - p.x) * 0.003
                        p.vy =
                            (p.vy || 0) * 0.98 + (p.roamTargetY - p.y) * 0.003
                        const sp2 = Math.sqrt(p.vx ** 2 + p.vy ** 2)
                        if (sp2 > 1.5) {
                            p.vx = (p.vx / sp2) * 1.5
                            p.vy = (p.vy / sp2) * 1.5
                        }
                        p.x += p.vx
                        p.y += p.vy
                        baseX = p.x
                        baseY = p.y
                    } else {
                        baseX = p.idleX
                        baseY = p.idleY
                    }
                }

                if (repOn) {
                    if (rMode === "random") {
                        const dx = baseX - rawMx
                        const dy = baseY - rawMy
                        const dist = Math.sqrt(dx * dx + dy * dy)
                        if (dist < repCutoff) {
                            if (!p.inZone) {
                                const angle = Math.random() * Math.PI * 2
                                const d = Math.random() * rF * 5
                                p.repTargetX = Math.cos(angle) * d
                                p.repTargetY = Math.sin(angle) * d
                                p.inZone = true
                            }
                            p.repX += (p.repTargetX - p.repX) * 0.15
                            p.repY += (p.repTargetY - p.repY) * 0.15
                        } else {
                            p.inZone = false
                        }
                    } else {
                        if (active) {
                            const dx = baseX - mx
                            const dy = baseY - my
                            const distSq = dx * dx + dy * dy
                            if (distSq > 0 && distSq < repCutoffSq) {
                                const dist = Math.sqrt(distSq)
                                const nx = dx / dist
                                const ny = dy / dist
                                const falloff = 1 - dist / repCutoff
                                const push = falloff * hitSpeed * rF * 0.05
                                p.repX += nx * push
                                p.repY += ny * push
                                const targetRepX = nx * (repCutoff - dist)
                                const targetRepY = ny * (repCutoff - dist)
                                p.repX += (targetRepX - p.repX) * 0.06
                                p.repY += (targetRepY - p.repY) * 0.06
                                p.inZone = true
                            } else {
                                p.inZone = false
                            }
                        } else {
                            p.inZone = false
                        }
                    }
                } else {
                    p.inZone = false
                }

                if (!p.inZone) {
                    p.repX *= 0.97
                    p.repY *= 0.97
                }
                p.x = baseX + p.repX
                p.y = baseY + p.repY

                let dr, dg, db, da
                if (state === "active") {
                    dr = p.r
                    dg = p.g
                    db = p.b
                    da = p.a
                } else if (p.isExtra) {
                    dr = p.r
                    dg = p.g
                    db = p.b
                    if (state === "assembling") da = Math.round(p.a * animT)
                    else if (state === "scattering")
                        da = Math.round(p.a * (1 - animT))
                    else da = 0
                } else if (ht === "roam" && hOn) {
                    let alphaMul: number
                    if (roamFadeStartRef.current === 0) {
                        alphaMul = rOp ?? 0.5
                    } else {
                        const fadeElapsed =
                            Date.now() - roamFadeStartRef.current
                        const fadeT = Math.min(
                            1,
                            Math.max(0, fadeElapsed / durMs)
                        )
                        const easedFadeT = easeFn(fadeT)
                        alphaMul =
                            roamFadeFromRef.current +
                            (roamFadeToRef.current - roamFadeFromRef.current) *
                                easedFadeT
                    }
                    const pp: any = p
                    dr = pp.r
                    dg = pp.g
                    db = pp.b
                    da = Math.round(pp.a * alphaMul)
                } else if (ht === "hide" && hOn) {
                    let alphaMul: number
                    if (state === "idle") alphaMul = 0
                    else if (state === "assembling") alphaMul = animT
                    else if (state === "scattering") alphaMul = 1 - animT
                    else alphaMul = 1
                    const pp: any = p
                    dr = pp.r
                    dg = pp.g
                    db = pp.b
                    da = Math.round(pp.a * alphaMul)
                } else {
                    const pp: any = p
                    dr = pp.r
                    dg = pp.g
                    db = pp.b
                    da = pp.a
                }
                if (da < 1) continue

                if (pColor === "single") {
                    const sc = parseColor(scColor)
                    dr = sc.r
                    dg = sc.g
                    db = sc.b
                } else if (pColor === "multi") {
                    const cols = (mcColors || []).filter(Boolean)
                    if (cols.length > 0) {
                        const mc = parseColor(cols[p.colorIdx % cols.length])
                        dr = mc.r
                        dg = mc.g
                        db = mc.b
                    }
                }

                drawParticle(p.x * dpr, p.y * dpr, dr, dg, db, da, isCircle)
            }
            ctx.putImageData(idata, 0, 0)
        }
        draw()
        return () => {
            if (animRef.current) cancelAnimationFrame(animRef.current)
        }
    }, [])
    const onMouseMove = (e) => {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        const { W, H } = dimsRef.current
        const scaleX = rect.width > 0 ? W / rect.width : 1
        const scaleY = rect.height > 0 ? H / rect.height : 1
        const mx = (e.clientX - rect.left) * scaleX
        const my = (e.clientY - rect.top) * scaleY
        const prev = prevMouseRef.current
        if (prev.x > -9999) {
            const ddx = mx - prev.x,
                ddy = my - prev.y
            mouseSpeedRef.current = Math.sqrt(ddx * ddx + ddy * ddy)
        }
        prevMouseRef.current = { x: mx, y: my }
        mouseRef.current = { x: mx, y: my, active: true }
        if (physicsRef.current.hover) {
            const s = animStateRef.current
            if (s === "idle" || s === "scattering")
                startAnimRef.current("assembling")
        }
    }
    const onMouseLeave = () => {
        mouseRef.current = { x: -99999, y: -99999, active: false }
        if (physicsRef.current.hover) {
            const s = animStateRef.current
            if (s === "assembling" || s === "active")
                startAnimRef.current("scattering")
        }
    }
    return (
        <div
            ref={containerRef}
            {...props}
            style={{
                position: "relative",
                width,
                height,
                overflow: "hidden",
                ...style,
            }}
        >
            <canvas
                ref={canvasRef}
                style={{ display: "block", width: "100%", height: "100%" }}
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
            />
            {!image && (
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(0,0,0,0.3)",
                        fontSize: 13,
                        fontFamily: "monospace",
                        border: "1px dashed rgba(0,0,0,0.15)",
                        borderRadius: 4,
                        background: "rgba(0,0,0,0.04)",
                        pointerEvents: "none",
                    }}
                >
                    Upload image in panel →
                </div>
            )}
        </div>
    )
}
const COMPONENT_DEFAULTS = {
    imageConfig: {
        image: "/assets/svg-particle/particle-art.jpg",
        mode: "fit",
        sizeUnit: "%",
        widthPx: 400,
        heightPx: 400,
        widthPct: 100,
        heightPct: 100,
        scale: 5,
    },
    particleShape: "circle",
    particleColor: "original",
    singleColor: "#ffffff",
    multiColors: ["#ffffff", "#aaaaaa", "#555555"],
    particleCount: 20,
    particleSize: 5,
    hoverEnabled: true,
    hoverConfig: {
        hoverType: "roam",
        transition: { duration: 0.8, ease: "easeInOut" },
        roamWidth: 0,
        roamHeight: 0,
        roamShape: "rectangle",
        roamOpacity: 0.5,
        hideType: "scatter",
    },
    repulsionEnabled: true,
    repulsionConfig: {
        repulsionMode: "outside",
        repulsionForce: 10,
        repulsionRadius: 50,
    },
}

const SVG_PARTICLE_PRESET = {
  particleCount: 50
};

export default function SvgParticle(props: Record<string, unknown>) {
  return <SvgParticleBase {...(SVG_PARTICLE_PRESET as Record<string, unknown>)} {...props} />;
}