'use client'
/**
 * Acodibg - Glass Card Carousel as a drop-in React component.
 * Ported from the supplied standalone HTML/CSS/vanilla JS source.
 * Dependency: react only. No CSS file, no global state.
 */
import { useEffect, useRef, useState, type CSSProperties } from 'react'

export interface AcodibgProps {
  trackHeight?: string
  background?: string
  compact?: boolean
  autoPlay?: boolean
  showHint?: boolean
  className?: string
  style?: CSSProperties
}

const PREVIEW_INTERACTION_EVENT = 'uihub:preview-interaction'

/** Pauses embedded autoplay while the surrounding preview is being interacted with. */
function usePreviewInteraction(rootRef: { current: HTMLElement | null }) {
  const [isInteracting, setIsInteracting] = useState(false)
  useEffect(() => {
    const onInteraction = (event: Event) => {
      const target = event.target
      if (target instanceof Element && rootRef.current && target.contains(rootRef.current)) {
        setIsInteracting((event as CustomEvent<{ active: boolean }>).detail.active)
      }
    }
    document.addEventListener(PREVIEW_INTERACTION_EVENT, onInteraction)
    return () => document.removeEventListener(PREVIEW_INTERACTION_EVENT, onInteraction)
  }, [rootRef])
  return isInteracting
}

/* ---------- timeline constants (measured from source) ---------- */
const N = 6
const PITCH = 268, CW = 204, CH = 256
const HOLD = 0.16, MOVE = 0.76

const NAMES = ['Success Rate', 'B2.Score', 'Revenue Insights', 'Measure', 'Operation Performance', 'Conversion']

type Ctx = CanvasRenderingContext2D
type Stop = [number, string]
type Point = [number, number]
type Painter = (c: Ctx) => void

/* ---------- helpers ---------- */
const mk = (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c }
const rr = (c: Ctx, x: number, y: number, w: number, h: number, r: number) => { c.beginPath(); c.roundRect(x, y, w, h, r) }
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const eio = (u: number) => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2

function blob(c: Ctx, x: number, y: number, r: number, stops: Stop[]) {
  const g = c.createRadialGradient(x, y, 0, x, y, r)
  stops.forEach(([p, col]) => g.addColorStop(p, col))
  c.fillStyle = g; c.fillRect(0, 0, CW, CH)
}
function text(c: Ctx, s: string, x: number, y: number, size: number, color: string, align: CanvasTextAlign = 'left', weight: number | string = 400) {
  c.font = `${weight} ${size}px "Helvetica Neue", system-ui, sans-serif`
  c.fillStyle = color; c.textAlign = align; c.textBaseline = 'alphabetic'; c.fillText(s, x, y)
}
function pill(c: Ctx, label: string, x: number, y: number, w: number, h: number, dark = false) {
  c.fillStyle = dark ? 'rgba(255,255,255,.2)' : '#fff'
  c.shadowColor = 'rgba(0,0,0,.08)'; c.shadowBlur = 6; rr(c, x, y, w, h, h / 2); c.fill(); c.shadowBlur = 0
  text(c, label, x + 9, y + h / 2 + 3.5, 8.5, '#222')
  c.strokeStyle = '#222'; c.lineWidth = 1; c.beginPath()
  c.moveTo(x + w - 11, y + h / 2 - 1); c.lineTo(x + w - 8.5, y + h / 2 + 1.5); c.lineTo(x + w - 6, y + h / 2 - 1); c.stroke()
}
function dots(c: Ctx, active: number, dark = false) {
  for (let i = 0; i < N; i++) {
    c.fillStyle = i === active ? (dark ? '#fff' : '#222') : (dark ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.12)')
    rr(c, 62 + i * 14.5, CH - 14, i === active ? 12 : 12, 2, 1); c.fill()
  }
}
function lineChart(c: Ctx, pts: Point[], color: string, w = 2) {
  c.strokeStyle = color; c.lineWidth = w; c.lineJoin = 'round'; c.beginPath()
  pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke()
}
/* ---------- the six cards ---------- */
const PAINT: Painter[] = [
  /* 0 Success Rate */ c => {
    c.fillStyle = '#f6d9c6'; c.fillRect(0, 0, CW, CH)
    blob(c, 100, 120, 160, [[0, '#2aa5d8'], [.28, '#4cc7b0'], [.5, '#9fdc8c'], [.72, '#f1dcae'], [1, 'rgba(250,205,180,1)']])
    text(c, 'Success Rate', 12, 18, 9, '#2a2a2a'); pill(c, 'Daily', 148, 6, 44, 18)
    text(c, '82%', 108, 78, 25, '#fff', 'center', 300); text(c, 'Average weekly', 108, 90, 7, 'rgba(255,255,255,.85)', 'center')
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(135, 102, 56, 80)
    lineChart(c, [[0, 150], [34, 150], [48, 157], [70, 157], [76, 128], [92, 128], [96, 112], [110, 106], [122, 100], [128, 100]], '#fff', 1.6)
    c.setLineDash([2, 3]); lineChart(c, [[128, 100], [150, 100], [165, 112], [175, 138]], 'rgba(255,255,255,.7)', 1); c.setLineDash([])
    c.fillStyle = '#fff'; c.beginPath(); c.arc(128, 100, 3.5, 0, 7); c.fill()
    text(c, 'Weekly growth report updated remarks.', 108, 205, 6.5, 'rgba(255,255,255,.8)', 'center')
    text(c, 'Stable and healthy.', 108, 214, 6.5, 'rgba(255,255,255,.8)', 'center'); dots(c, 0, false)
  },
  /* 1 B2.Score */ c => {
    c.fillStyle = '#f5f6f8'; c.fillRect(0, 0, CW, CH)
    text(c, 'B2.Score', 12, 18, 9, '#222'); pill(c, 'Weekly', 148, 6, 44, 18)
    const g = c.createRadialGradient(102, 98, 4, 102, 98, 46)
    g.addColorStop(0, '#2f9bf0'); g.addColorStop(.45, '#7aa6f2'); g.addColorStop(.75, '#f4a3c4'); g.addColorStop(1, 'rgba(250,200,215,0)')
    c.fillStyle = g; c.beginPath(); c.arc(102, 98, 46, 0, 7); c.fill()
    c.save(); c.translate(102, 98); c.rotate(-.5); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2.2; c.shadowColor = 'rgba(120,140,200,.5)'; c.shadowBlur = 4
    c.beginPath(); c.ellipse(0, 0, 62, 36, 0, 0, 7); c.stroke(); c.restore()
    text(c, '853', 102, 108, 25, '#fff', 'center', 300); text(c, 'Score: Great 12 pts', 102, 120, 6, 'rgba(255,255,255,.9)', 'center')
    c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.07)'; c.shadowBlur = 10; rr(c, 8, 172, 188, 56, 12); c.fill(); c.shadowBlur = 0
    text(c, 'Expect your revenue to rise and shine', 102, 198, 7, '#333', 'center'); text(c, 'before this month closes.', 102, 208, 7, '#333', 'center'); dots(c, 1, false)
  },  /* 2 Revenue Insights */ c => {
    c.fillStyle = '#d9c9f6'; c.fillRect(0, 0, CW, CH)
    blob(c, 100, 120, 170, [[0, '#2a58f0'], [.35, '#3d6df0'], [.62, '#9a86f0'], [.85, '#e2a8ec'], [1, '#f2d6f2']])
    text(c, 'Revenue Insights', 12, 18, 9, 'rgba(255,255,255,.75)'); pill(c, 'Weekly', 148, 6, 44, 18, true)
    text(c, 'Revenue Growth', 102, 52, 6.5, 'rgba(255,255,255,.75)', 'center')
    text(c, '75%', 94, 75, 25, '#fff', 'center', 300); text(c, '↗', 130, 66, 9, '#fff')
    c.fillStyle = '#fff'; c.beginPath(); c.arc(102, 90, 2, 0, 7); c.fill(); c.fillRect(101.5, 92, 1, 12)
    c.fillStyle = 'rgba(30,50,170,.35)'; c.fillRect(65, 120, 76, 80); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(141, 108, 40, 92)
    lineChart(c, [[65, 120], [65, 200]], 'rgba(255,255,255,.25)', 1)
    lineChart(c, [[65, 120], [100, 106], [140, 106]], '#fff', 1.8)
    text(c, 'Expect your revenue to rise and shine', 102, 218, 6.5, 'rgba(255,255,255,.85)', 'center')
    text(c, 'before this month closes.', 102, 227, 6.5, 'rgba(255,255,255,.85)', 'center'); dots(c, 2, true)
  },
  /* 3 Measure */ c => {
    c.fillStyle = '#f5f6f8'; c.fillRect(0, 0, CW, CH)
    text(c, 'Measure', 12, 18, 9, '#222'); pill(c, 'Weekly', 148, 6, 44, 18)
    const g = c.createRadialGradient(102, 98, 4, 102, 98, 46)
    g.addColorStop(0, '#d46af0'); g.addColorStop(.5, '#ee86d8'); g.addColorStop(1, 'rgba(255,200,240,.2)')
    c.fillStyle = g; c.beginPath(); c.arc(102, 98, 46, 0, 7); c.fill()
    for (let i = 0; i < 90; i++) {
      const a = i / 90 * 6.2832, r = 46 + (i % 3) * 3.5 + Math.sin(i * 1.7) * 2
      c.fillStyle = `rgba(255,255,255,${.65 + (i % 4) * .08})`; c.beginPath(); c.arc(102 + Math.cos(a) * r, 98 + Math.sin(a) * r, 1.3 + (i % 3) * .4, 0, 7); c.fill()
    }
    text(c, '93', 102, 106, 26, '#fff', 'center', 300); text(c, 'out of 100', 102, 118, 6, 'rgba(255,255,255,.9)', 'center')
    c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.07)'; c.shadowBlur = 6; rr(c, 82, 158, 40, 12, 6); c.fill(); c.shadowBlur = 0
    text(c, 'Withings +', 102, 167, 6, '#333', 'center')
    text(c, 'Amazing! Your system growth rate improvement', 102, 196, 5.8, '#666', 'center'); text(c, 'score has increased by 5 points.', 102, 205, 5.8, '#666', 'center'); dots(c, 3, false)
  },
  /* 4 Operation Performance */ c => {
    c.fillStyle = '#cfd4fa'; c.fillRect(0, 0, CW, CH)
    blob(c, 70, 40, 190, [[0, '#6a40f2'], [.35, '#4a6af2'], [.7, '#8fb0f6'], [1, '#e8ecfb']])
    text(c, 'Operation Performance', 12, 18, 9, 'rgba(255,255,255,.85)'); pill(c, 'Create', 148, 6, 44, 18, true)
    text(c, '25', 12, 78, 30, '#fff', 'left', 300); text(c, '↗', 38, 62, 8, '#fff')
    for (let i = 0; i < 46; i++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(10 + i * 3.9, 138, 1, i % 5 === 0 ? 10 : 5) }
    c.fillStyle = '#fff'; c.fillRect(100, 128, 1.5, 28)
    text(c, 'Expect your revenue to rise and shine', 102, 212, 6.5, 'rgba(60,70,120,.75)', 'center'); dots(c, 4, false)
  },
  /* 5 Conversion */ c => {
    c.fillStyle = '#f5f6f8'; c.fillRect(0, 0, CW, CH)
    blob(c, 100, 60, 150, [[0, '#d86af0'], [.4, '#ee80de'], [.7, '#f0a8e8'], [1, 'rgba(245,246,248,0)']])
    text(c, 'Conversion', 12, 18, 9, 'rgba(255,255,255,.9)'); pill(c, 'Weekly', 148, 6, 44, 18)
    text(c, 'Conversion Rate', 100, 52, 6.5, 'rgba(255,255,255,.85)', 'center'); text(c, '250%', 98, 80, 24, '#fff', 'center', 300)
    c.strokeStyle = '#fff'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(60, 150)
    c.bezierCurveTo(80, 150, 84, 104, 104, 104); c.bezierCurveTo(124, 104, 120, 150, 146, 150); c.stroke()
    c.fillStyle = '#fff'; c.beginPath(); c.arc(104, 104, 3, 0, 7); c.fill()
    c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.07)'; c.shadowBlur = 10; rr(c, 8, 176, 188, 50, 22); c.fill(); c.shadowBlur = 0
    text(c, 'Conversions set to', 26, 197, 6.5, '#333'); text(c, 'rise this month.', 26, 206, 6.5, '#333'); text(c, '+', 176, 203, 11, '#333', 'center'); dots(c, 5, false)
  }
]

export default function Acodibg({
  trackHeight = '700vh',
  background = '#e4e7ea',
  compact = false,
  autoPlay = false,
  showHint = true,
  className,
  style,
}: AcodibgProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const isInteracting = usePreviewInteraction(rootRef)
  const effectiveAutoPlay = autoPlay && !isInteracting
  const live = useRef({ autoPlay: effectiveAutoPlay })
  live.current = { autoPlay: effectiveAutoPlay }
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    const root = rootRef.current!
    const track = trackRef.current
    const spacer = spacerRef.current
    const stage = stageRef.current!
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

    let W = 720, H = 576, R = 1, CY0 = 160
    let strip!: HTMLCanvasElement, main!: HTMLCanvasElement, mctx!: Ctx
    let blurC!: HTMLCanvasElement, bctx!: Ctx, bg!: HTMLCanvasElement
    const COPIES = N + 3, CX0 = 14

    /* ---------- layout (adapts to any screen) ---------- */
    function build() {
      const vw = Math.max(1, stage.clientWidth)
      const vh = Math.max(1, stage.clientHeight)
      const scale = Math.min(vh / 460, vw / 290)
      W = vw / scale; H = vh / scale
      R = Math.min(window.devicePixelRatio || 1, 2.5) * scale
      canvas.width = Math.round(W * R); canvas.height = Math.round(H * R)
      CY0 = (H - CH) / 2
      strip = mk(Math.round(COPIES * PITCH * R), Math.round(H * R)); const sc = strip.getContext('2d')!; sc.scale(R, R)
      for (let i = 0; i < COPIES; i++) {
        const card = mk(CW * 2, CH * 2), c = card.getContext('2d')!; c.scale(2, 2)
        c.save(); rr(c, 0, 0, CW, CH, 10); c.clip(); PAINT[(((i - 1) % N) + N) % N](c)
        const g = c.createLinearGradient(0, 0, 0, CH); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(.1, 'rgba(255,255,255,0)')
        c.fillStyle = g; c.fillRect(0, 0, CW, CH); c.restore()
        sc.save(); sc.shadowColor = 'rgba(40,50,80,.16)'; sc.shadowBlur = 16; sc.shadowOffsetY = 5
        sc.drawImage(card, i * PITCH + CX0, CY0, CW, CH); sc.restore()
      }
      main = mk(canvas.width, canvas.height); mctx = main.getContext('2d')!
      blurC = mk(canvas.width, canvas.height); bctx = blurC.getContext('2d')!
      bg = mk(canvas.width, canvas.height); const c = bg.getContext('2d')!; c.scale(R, R)
      c.fillStyle = background; c.fillRect(0, 0, W, H); c.filter = `blur(${28}px)`;
      [[.15, 0, 120, 'rgba(255,180,210,.35)'], [.5, 0, 150, 'rgba(180,240,250,.35)'], [.85, 0, 110, 'rgba(240,190,255,.3)'],
       [.3, 1, 120, 'rgba(255,200,215,.3)'], [.7, 1, 140, 'rgba(170,235,250,.35)']].forEach(([fx, fy, r, col]) => {
        c.fillStyle = col as string; c.beginPath(); c.ellipse((fx as number) * W, (fy as number) * H, r as number, 24, 0, 0, 7); c.fill()
      })
    }
    /* ---------- scene math ---------- */
    const mid = (x: number) => x
    function mapX(sx: number, pos: number, vel: number) {
      const n = (sx - W / 2) / (W / 2), nn = Math.abs(n) * n * n
      const a = 0.12 + 1.1 * vel
      const dx = (sx - W / 2) / (1 + a * Math.abs(nn) * 1.6)
      return (pos + 1) * PITCH + CX0 + CW / 2 + dx
    }
    function sv(sx: number, vel: number) { const n = (sx - W / 2) / (W / 2); return 1 + (0.1 + 0.55 * vel) * n * n * n * n + 0.03 * n * n }

    function draw(pos: number, vel: number) {
      const w = canvas.width, h = canvas.height
      mctx.setTransform(1, 0, 0, 1, 0, 0); mctx.clearRect(0, 0, w, h); mctx.drawImage(bg, 0, 0)
      const S = Math.max(1, Math.round(1.5 * R / 1))
      for (let px = 0; px < w; px += S) {
        const sx0 = px / R, sx1 = (px + S) / R, x0 = mapX(sx0, pos, vel) * R, x1 = mapX(sx1, pos, vel) * R, s = sv((sx0 + sx1) / 2, vel)
        mctx.drawImage(strip, x0, 0, Math.max(.5, x1 - x0), strip.height, px, h / 2 - h / 2 * s, S, h * s)
      }
      bctx.globalCompositeOperation = 'source-over'; bctx.clearRect(0, 0, w, h)
      bctx.filter = `blur(${(4 + vel * 16) * R}px)`; bctx.drawImage(main, 0, 0); bctx.filter = 'none'
      const m = bctx.createLinearGradient(0, 0, w, 0), e = Math.min(.36, .36 * (W > H ? 1 : 1.2))
      m.addColorStop(0, 'rgba(0,0,0,1)'); m.addColorStop(.2, 'rgba(0,0,0,.85)'); m.addColorStop(e, 'rgba(0,0,0,0)')
      m.addColorStop(1 - e, 'rgba(0,0,0,0)'); m.addColorStop(.8, 'rgba(0,0,0,.85)'); m.addColorStop(1, 'rgba(0,0,0,1)')
      bctx.globalCompositeOperation = 'destination-in'; bctx.fillStyle = m; bctx.fillRect(0, 0, w, h)
      mctx.globalAlpha = .7 + .3 * vel; mctx.drawImage(blurC, 0, 0); mctx.globalAlpha = 1
      const ir = mctx.createLinearGradient(0, 0, w, 0), ia = .1 + .22 * vel
      ir.addColorStop(0, `rgba(255,255,255,${ia * 2})`); ir.addColorStop(.1, `rgba(190,230,255,${ia})`); ir.addColorStop(.2, 'rgba(255,255,255,0)')
      ir.addColorStop(.8, 'rgba(255,255,255,0)'); ir.addColorStop(.9, `rgba(255,205,240,${ia})`); ir.addColorStop(1, `rgba(255,255,255,${ia * 2})`)
      mctx.fillStyle = ir; mctx.fillRect(0, 0, w, h)
      ctx.drawImage(main, 0, 0)
    }

    /* ---------- scroll-driven clock ---------- */
    function readUnit() {
      if (compact && track) {
        const total = track.scrollHeight - track.clientHeight
        return total > 1 ? clamp(track.scrollTop / total) : 0
      }
      const r = root.getBoundingClientRect()
      const total = r.height - window.innerHeight
      return total > 1 ? clamp(-r.top / total) : clamp((window.innerHeight - r.top) / (window.innerHeight + r.height))
    }
    function targetFromUnit(u: number) {
      const s = clamp(u) * N, k = Math.min(N - 1, Math.floor(s)), f = s - k
      return k + eio(clamp((f - HOLD) / MOVE))
    }
    function target() { return targetFromUnit(readUnit()) }

    let pos = 0, vel = 0, last = performance.now(), hinted = false
  let frozen: number | null = null
    let visible = true, raf = 0, autoT = 0

    function frame(now: number) {
      raf = 0
      if (!visible) return
      const dt = Math.min(.05, (now - last) / 1000); last = now
      const o = live.current
      let tgt: number
      if (o.autoPlay && !reduced) {
        frozen = null
        autoT += dt
        const t = autoT % 10
        const unit = t < 4.2 ? t / 4.2 : t < 5.2 ? 1 : t < 9.4 ? 1 - (t - 5.2) / 4.2 : 0
        tgt = targetFromUnit(unit)
      } else {
        if (frozen === null) frozen = pos
        tgt = frozen
      }
      const prev = pos
      pos += (tgt - pos) * (reduced ? 1 : 1 - Math.exp(-dt * 9))
      if (Math.abs(tgt - pos) < 1e-4) pos = tgt
      const v = dt > 0 ? Math.abs(pos - prev) / dt : 0
      vel += (clamp(v / 1.1) - vel) * (reduced ? 1 : 1 - Math.exp(-dt * 12))
      draw(pos, vel)
      if (!hinted && !o.autoPlay && (compact ? (track?.scrollTop ?? 0) > 8 : window.scrollY > 8)) {
        hinted = true; if (hintRef.current) hintRef.current.style.opacity = '0'
      }
      if ((o.autoPlay && !reduced) || Math.abs(tgt - pos) > 1e-4 || vel > 1e-4) raf = requestAnimationFrame(frame)
    }
    function kick() {
      if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(frame) }
    }
    kickRef.current = () => { last = performance.now(); kick() }
    const seek = (p: number) => {
      const u = clamp(p)
      if (compact && track) {
        const total = Math.max(0, track.scrollHeight - track.clientHeight)
        track.scrollTop = u * total
      } else {
        const r = root.getBoundingClientRect()
        const total = Math.max(0, r.height - window.innerHeight)
        window.scrollTo(0, window.scrollY + r.top + u * total)
      }
      frozen = target(); pos = frozen; vel = 0; draw(pos, 0); kick()
    }
    const win = window as Window & { __seek?: (p: number) => void }
    const previousSeek = win.__seek
    win.__seek = seek

    const resize = () => {
      frozen = null
      if (compact && track && spacer) spacer.style.height = `${Math.max(1, Math.round(stage.clientHeight * 6))}px`
      build(); kick()
    }
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) kick() })
    io.observe(root)
    const ro = new ResizeObserver(resize)
    ro.observe(stage)

    const onScroll = () => { frozen = target(); kick() }
    const scrollPane: HTMLElement | null = compact ? track : null
    if (scrollPane) scrollPane.addEventListener('scroll', onScroll, { passive: true })
    else window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', resize)

    resize()
    pos = target(); vel = 0; draw(pos, 0); kick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect(); ro.disconnect()
      if (scrollPane) scrollPane.removeEventListener('scroll', onScroll)
      else window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', resize)
      if (win.__seek === seek) {
        if (previousSeek === undefined) delete win.__seek
        else win.__seek = previousSeek
      }
    }
  }, [compact, background])

  useEffect(() => { kickRef.current() }, [effectiveAutoPlay, showHint])

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative', width: '100%',
        height: compact ? '100%' : trackHeight,
        overflow: compact ? 'hidden' : undefined,
        background, ...style,
      }}
    >
      {compact && <style>{'.acodibg-track::-webkit-scrollbar{display:none}'}</style>}
      <div
        ref={trackRef}
        className={compact ? 'acodibg-track' : undefined}
        style={compact ? {
          position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
          overscrollBehavior: 'contain', scrollbarWidth: 'none',
        } : { position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <div
          ref={stageRef}
          style={{
            position: compact ? 'relative' : 'sticky', top: compact ? undefined : 0, left: 0,
            width: '100%', height: compact ? '100%' : '100vh', overflow: 'hidden', background,
          }}
        >
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', touchAction: 'pan-y', pointerEvents: 'none' }}
          />
          {showHint && !compact && (
            <div
              ref={hintRef}
              aria-hidden="true"
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 'max(18px, env(safe-area-inset-bottom))',
                textAlign: 'center', font: '500 12px/1 system-ui, sans-serif', letterSpacing: '.14em',
                textTransform: 'uppercase', color: 'rgba(40,45,60,.55)', pointerEvents: 'none',
                transition: 'opacity .5s', zIndex: 1,
              }}
              className="acodibg-hint"
            >
              Scroll
            </div>
          )}
        </div>
        {compact && <div ref={spacerRef} aria-hidden="true" style={{ width: 1, height: 1, pointerEvents: 'none' }} />}
      </div>
    </div>
  )
}