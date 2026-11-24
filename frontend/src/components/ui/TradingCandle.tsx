'use client'
/**
 * CandleFill — the "heart of candles" scroll effect as a drop-in React component.
 * Only dependency: `three` (react >= 18). No CSS file, no global state.
 *
 *   <CandleFill />                    // red (default)
 *   <CandleFill accent="blue" />      // 'red' | 'blue' | 'green' — or any hex like '#ff8a00'
 */
import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react'
import * as THREE from 'three'

/* ───────────────────────────── public API ───────────────────────────── */

export const CANDLE_COLORS = {
  red: '#ff1a1f',
  blue: '#2f7bff',
  green: '#19d46b',
} as const
export type CandleColor = keyof typeof CANDLE_COLORS

export interface CandleFillProps {
  accent?: CandleColor | (string & {}) // glow + wick colour
  trackHeight?: string // total scroll length of the pinned section
  smoothing?: number // follow speed of the scroll (0 = none)
  title?: ReactNode | null // headline behind the candles
  background?: string
  showBackground?: boolean // faint candles around the heart
  heartY?: number // 0 (top) → 1 (bottom)
  maxDpr?: number
  compact?: boolean // scroll inside a fixed preview box instead of the page
  className?: string
  style?: CSSProperties
}

/* ───────────────────────────── candle data ───────────────────────────── */
// World units: x = one candle slot, y uses the same unit. y = 0 is the heart's middle.

const COUNT = 110
const HERO_FIRST = 48
const HERO_CENTER = HERO_FIRST + 3
const HERO_TOP = 3.83
const HERO_BOTTOM = -3.83
// [top, bottom] of each of the 7 special candles' body and wick.
const HERO = [
  { body: [2.53, 0.57], wick: [3.83, -0.13] },
  { body: [1.27, -0.73], wick: [1.53, -1.0] },
  { body: [1.27, -2.23], wick: [1.87, -2.73] },
  { body: [1.27, -3.4], wick: [1.53, -3.83] },
  { body: [1.27, -2.3], wick: [1.87, -2.73] },
  { body: [1.27, -0.73], wick: [1.53, -0.93] },
  { body: [2.53, 0.57], wick: [3.83, -0.13] },
] as const
function rng(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const PATH: [number, number][] = [
  [0, -9.5], [20, -8.5], [34, -8], [41, -7], [44, -4.5], [47, 0.8],
  [55, 1.8], [62, 3.2], [75, 3.8], [90, 3.2], [109, 5],
]
const base = (i: number) => {
  for (let k = 0; k < PATH.length - 1; k++) {
    const [x0, y0] = PATH[k]
    const [x1, y1] = PATH[k + 1]
    if (i >= x0 && i <= x1) return y0 + ((y1 - y0) * (i - x0)) / (x1 - x0)
  }
  return PATH[PATH.length - 1][1]
}
function buildBackground() {
  const r = rng(7)
  const out: { i: number; o: number; c: number; h: number; l: number }[] = []
  let prev = base(0)
  for (let i = 0; i < COUNT; i++) {
    const c = base(i) + (r() - 0.5) * 2.6
    const o = prev
    prev = c
    if (i >= HERO_FIRST && i < HERO_FIRST + 7) continue
    const spike = r() < 0.16 ? 2 + r() * 4 : 0
    out.push({
      i, o, c,
      h: Math.max(o, c) + 0.4 + r() * 1.6 + spike,
      l: Math.min(o, c) - 0.4 - r() * 1.6 - (r() < 0.12 ? 2 + r() * 3 : 0),
    })
  }
  return out
}

/* ───────────────────────────── helpers ───────────────────────────── */

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

function hexToRgb(input: string): [number, number, number] {
  const hex = input in CANDLE_COLORS ? CANDLE_COLORS[input as CandleColor] : input
  let h = hex.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  const n = parseInt(h, 16)
  if (Number.isNaN(n) || h.length !== 6) return [1, 0.1, 0.12]
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

/** When (0→1 of the scroll) each stage happens. Edit these to re-time the animation. */
const TL = {
  highlight: [0.0, 0.22], // 7 candles brighten
  title: [0.08, 0.28], // headline fades in
  fill: [0.2, 0.88], // white fill + glow sweeps top → bottom
  dim: [0.0, 0.88], // background candles sink into the dark
} as const
/* ───────────────────────────── shaders ───────────────────────────── */

const VERT = /* glsl */ `
  uniform vec2 uHalf;
  uniform float uPad;
  varying vec2 vLocal;
  void main() {
    vLocal = position.xy * 2.0 * (uHalf + vec2(uPad));
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocal, 0.0, 1.0);
  }
`
// Rounded-box SDF + a fill "front" that sweeps down in WORLD y, so every candle fills
// along the same horizontal line. Glow is the SDF falloff outside the box.
const FRAG = /* glsl */ `
  uniform vec2 uHalf;
  uniform float uCenterY, uFront, uSoft, uHi, uGlow, uGlowR, uRadius, uWick;
  uniform vec3 uGray, uLight, uWhite, uRed;
  varying vec2 vLocal;
  float sdBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }
  void main() {
    float d = sdBox(vLocal, uHalf, min(uRadius, min(uHalf.x, uHalf.y)));
    float wy = uCenterY + vLocal.y;
    float w = smoothstep(uFront - uSoft, uFront, wy);
    float wg = smoothstep(uFront - uSoft * 1.6, uFront, wy);
    float aa = max(fwidth(d), 1e-4);
    float inside = 1.0 - smoothstep(-aa, aa, d);
    vec3 baseCol = mix(uGray, uLight, uHi);
    vec3 filled = mix(uWhite, uRed, uWick);
    vec3 col = mix(baseCol, filled, w);
    float rim = smoothstep(-0.12, 0.0, d) * w * (1.0 - uWick) * 0.4;
    col = mix(col, uRed, rim);
    float g = exp(-max(d, 0.0) / uGlowR) * uGlow * wg;
    float ga = g * (1.0 - inside);
    gl_FragColor = vec4(col * inside + uRed * ga, max(inside, ga));
  }
`

/* ───────────────────────────── component ───────────────────────────── */

const DEFAULT_TITLE = (
  <>
    Built For Traders
    <br />
    Not Designed For Failure.
  </>
)

export default function CandleFill({
  trackHeight = '260vh',
  smoothing = 12,
  title = DEFAULT_TITLE,
  accent = 'red',
  background = '#000',
  showBackground = true,
  heartY = 0.54,
  maxDpr = 1.75,
  compact = false,
  className,
  style,
}: CandleFillProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)

  // Latest props for the engine without tearing it down on every render.
  const live = useRef({ smoothing, showBackground, heartY, accent })
  live.current = { smoothing, showBackground, heartY, accent }
  const kickRef = useRef<() => void>(() => {})
  useEffect(() => {
    const root = rootRef.current!
    const track = trackRef.current
    const spacer = spacerRef.current
    const stage = stageRef.current!
    const canvas = canvasRef.current!

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' })
    // Colours below are plain sRGB, passed straight through – no global colour-management changes.
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(maxDpr, window.devicePixelRatio || 1))

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10)
    const geo = new THREE.PlaneGeometry(1, 1)
    const L = THREE.LinearSRGBColorSpace

    // ── faint chart candles (2 instanced meshes) ──
    const bg = buildBackground()
    const bgMat = new THREE.MeshBasicMaterial({ color: 0xffffff })
    const bodies = new THREE.InstancedMesh(geo, bgMat, bg.length)
    const wicks = new THREE.InstancedMesh(geo, bgMat, bg.length)
    bodies.frustumCulled = wicks.frustumCulled = false
    bodies.position.z = 0.1
    const dummy = new THREE.Object3D()
    const tmp = new THREE.Color()
    bg.forEach((c, k) => {
      const g = (c.c >= c.o ? 0.34 : 0.26) + ((c.i * 37) % 7) * 0.008
      tmp.setRGB(g, g, g, L)
      bodies.setColorAt(k, tmp)
      wicks.setColorAt(k, tmp)
      dummy.position.set(c.i, (c.o + c.c) / 2, 0)
      dummy.scale.set(0.6, Math.max(Math.abs(c.c - c.o), 0.18), 1)
      dummy.updateMatrix()
      bodies.setMatrixAt(k, dummy.matrix)
    })
    scene.add(wicks, bodies)
    let lastWickW = -1
    const setWickWidth = (w: number) => {
      if (Math.abs(w - lastWickW) < 1e-3) return
      lastWickW = w
      bg.forEach((c, k) => {
        dummy.position.set(c.i, (c.h + c.l) / 2, 0)
        dummy.scale.set(w, c.h - c.l, 1)
        dummy.updateMatrix()
        wicks.setMatrixAt(k, dummy.matrix)
      })
      wicks.instanceMatrix.needsUpdate = true
    }

    // ── the 7 special candles ──
    const shared = {
      uFront: { value: 99 },
      uSoft: { value: 2.6 },
      uHi: { value: 0 },
      uGlow: { value: 0 },
      uGlowR: { value: 0.2 },
      uGray: { value: new THREE.Vector3(0.3, 0.3, 0.3) },
      uLight: { value: new THREE.Vector3(0.6, 0.6, 0.6) },
      uWhite: { value: new THREE.Vector3(1, 1, 1) },
      uRed: { value: new THREE.Vector3(1, 0.1, 0.12) },
    }
    const wickMats: THREE.ShaderMaterial[] = []
    const heroMeshes: THREE.Mesh[] = []
    const heroMats: THREE.ShaderMaterial[] = []
    HERO.forEach((s, k) => {
      ;(['wick', 'body'] as const).forEach((kind) => {
        const [top, bot] = s[kind]
        const mat = new THREE.ShaderMaterial({
          vertexShader: VERT,
          fragmentShader: FRAG,
          transparent: true,
          premultipliedAlpha: true,
          depthTest: false,
          uniforms: {
            ...shared,
            uHalf: { value: new THREE.Vector2(kind === 'body' ? 0.3 : 0.05, (top - bot) / 2) },
            uPad: { value: 1.1 },
            uCenterY: { value: (top + bot) / 2 },
            uRadius: { value: kind === 'body' ? 0.07 : 0.05 },
            uWick: { value: kind === 'wick' ? 1 : 0 },
          },
        })
        const mesh = new THREE.Mesh(geo, mat)
        mesh.position.set(HERO_FIRST + k, (top + bot) / 2, kind === 'body' ? 0.3 : 0.2)
        mesh.frustumCulled = false
        mesh.renderOrder = kind === 'body' ? 3 : 2
        scene.add(mesh)
        heroMeshes.push(mesh)
        heroMats.push(mat)
        if (kind === 'wick') wickMats.push(mat)
      })
    })
    // ── sizing ──
    let W = 1, H = 1
    const resize = () => {
      W = Math.max(1, stage.clientWidth)
      H = Math.max(1, stage.clientHeight)
      renderer.setSize(W, H, false)
      if (compact && track && spacer) spacer.style.height = track.clientHeight * 4 + 'px'
      lastDrawn = -1
      kick()
    }

    // ── draw one frame for progress p ──
    let lastDrawn = -1
    const draw = (p: number) => {
      const o = live.current
      const aspect = W / H
      const V1 = Math.min(32, Math.max(13, (32 * aspect) / 2.2)) // candles visible across the width
      const V = V1 * lerp(1.15, 1, easeOut(seg(p, 0, 0.45))) // slow zoom-in
      const Vh = (V * H) / W
      const cx = HERO_CENTER + lerp(-0.7, 0.7, p) // slight parallax drift
      camera.left = cx - V / 2
      camera.right = cx + V / 2
      camera.top = o.heartY * Vh
      camera.bottom = camera.top - Vh
      camera.updateProjectionMatrix()

      // thin wicks stay ~1.15px wide at any size
      const wickW = Math.max(0.1, 1.15 / (W / V))
      setWickWidth(wickW)
      wickMats.forEach((m) => (m.uniforms.uHalf.value.x = wickW / 2))

      const hi = easeOut(seg(p, TL.highlight[0], TL.highlight[1]))
      const fill = easeInOut(seg(p, TL.fill[0], TL.fill[1]))
      shared.uHi.value = hi
      shared.uFront.value = lerp(HERO_TOP + shared.uSoft.value + 0.3, HERO_BOTTOM - 0.05, fill)
      shared.uGlow.value = fill > 0 ? 0.3 + 0.35 * fill : 0
      const [r, g, b] = hexToRgb(o.accent)
      shared.uRed.value.set(r, g, b)

      const dim = lerp(lerp(1, 0.5, seg(p, 0, 0.15)), 0.2, seg(p, TL.fill[0], TL.dim[1]))
      bgMat.color.setRGB(dim, dim, dim, L)
      bodies.visible = wicks.visible = o.showBackground
      heroMeshes.forEach((m) => (m.visible = true))

      const t = titleRef.current
      if (t) {
        const a = easeOut(seg(p, TL.title[0], TL.title[1]))
        t.style.opacity = String(a)
        t.style.transform = `translateY(${(1 - a) * 14}px)`
      }
      renderer.render(scene, camera)
    }

    // ── scroll progress (0 at the top of the section → 1 at the end) ──
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let target = 0
    let cur = 0
    let visible = true
    let raf = 0
    let last = 0

    const readTarget = () => {
      if (compact && track) {
        const total = track.scrollHeight - track.clientHeight
        target = total > 1 ? clamp01(track.scrollTop / total) : 0
        return
      }
      const r = root.getBoundingClientRect()
      const total = r.height - window.innerHeight
      target = clamp01(total > 1 ? -r.top / total : (window.innerHeight - r.top) / (window.innerHeight + r.height))
    }
    const frame = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      readTarget()
      const sm = live.current.smoothing
      const k = sm > 0 && !reduced ? 1 - Math.exp(-dt * sm) : 1
      cur += (target - cur) * k
      if (Math.abs(target - cur) < 1e-4) cur = target
      if (cur !== lastDrawn) {
        draw(cur)
        lastDrawn = cur
      }
      if (cur !== target) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf && visible) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    kickRef.current = () => {
      lastDrawn = -1 // prop changed (colour etc.): force a redraw
      kick()
    }

    // don't spend GPU time while the section is off-screen
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible) kick()
    })
    io.observe(root)

    const ro = new ResizeObserver(resize)
    ro.observe(stage)
    const onScroll = () => kick()
    const scrollPane: HTMLElement | null = compact ? track : null
    if (scrollPane) scrollPane.addEventListener('scroll', onScroll, { passive: true })
    else window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    resize()
    readTarget()
    cur = target
    kick()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      if (scrollPane) scrollPane.removeEventListener('scroll', onScroll)
      else window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      geo.dispose()
      bgMat.dispose()
      heroMats.forEach((m) => m.dispose())
      bodies.dispose()
      wicks.dispose()
      renderer.dispose()
    }
  }, [maxDpr, compact])

  // props that don't rebuild the engine still need a redraw when they change
  useEffect(() => {
    kickRef.current()
  }, [accent, showBackground, heartY])

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        position: 'relative', width: '100%',
        height: compact ? '100%' : trackHeight,
        overflow: compact ? 'hidden' : undefined,
        ...style,
      }}
    >
      {compact && <style>{'.tc-track::-webkit-scrollbar{display:none}'}</style>}
      <div
        ref={trackRef}
        className={compact ? 'tc-track' : undefined}
        style={compact ? {
          position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden',
          overscrollBehavior: 'contain', scrollbarWidth: 'none',
        } : undefined}
      >
        <div
          ref={stageRef}
          style={{
            position: 'sticky', top: 0, left: 0, width: '100%',
            height: compact ? '100%' : '100vh', overflow: 'hidden', background,
          }}
        >
        {title !== null && (
          <div
            ref={titleRef}
            style={{
              position: 'absolute', left: 0, right: 0, top: '14%', zIndex: 1, textAlign: 'center',
              fontWeight: 300, lineHeight: 1.12, color: '#d8d8d8', opacity: 0, pointerEvents: 'none',
              fontSize: 'clamp(20px, 2.3vw, 46px)', padding: '0 6vw',
            }}
          >
            {title}
          </div>
        )}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', zIndex: 2, pointerEvents: 'none' }}
        />
        </div>
        {compact && <div ref={spacerRef} data-tc-spacer="" aria-hidden="true" style={{ width: 1, pointerEvents: 'none' }} />}
      </div>
    </div>
  )
}