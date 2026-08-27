// Morphing Rings — UI HUB
// UI HUB — props baked into the default export.
"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import { animate, motionValue } from "motion/react"
/**
 * framer-motion's `animate()` option bag. `AnimationOptions` is not exported by
 * the copy of framer-motion that ships inside Framer, and its `Transition` type
 * is not assignable to what `animate(value, …)` accepts, so the shape is
 * spelled out here — a type alias, not an interface, or it loses the implicit
 * index signature the intersection needs.
 */
type Motion = {
    type?: "spring" | "tween" | "keyframes" | "inertia"
    duration?: number
    ease?: [number, number, number, number]
    delay?: number
    stiffness?: number
    damping?: number
    mass?: number
    bounce?: number
    restSpeed?: number
    restDelta?: number
}


/**
 * The hover gate's settle. The scene shipped with an exponential approach at
 * rate 7/sec inside the rAF loop — ~0.43s to land — so the default reproduces
 * that timing. It is a MotionValue now, not a per-frame lerp, so a designer
 * gets native Spring physics (rule 2) and the gate can overshoot.
 */
const DEFAULT_TRANSITION: Motion = {
    type: "tween",
    duration: 0.43,
    // easeOut, as the cubic-bezier the tuple type needs.
    ease: [0, 0, 0.58, 1],
}

/**
 * MORPHING RINGS — a tilted concentric-ring particle disc.
 *
 * WHAT THIS IS: ~40k–80k particles arranged in concentric annular bands, viewed
 * from a low-angle perspective camera tilted ~30–40° above the disc plane. The
 * inner void is not a static circle — it is driven by a live SDF that morphs
 * continuously through: circle → pentagon → rounded polygon → heart → circle.
 * The morph is just a smooth interpolation between three analytic 2D SDFs,
 * evaluated per-vertex in the vertex shader against each particle's stored (r, θ).
 *
 * PARTICLE PLACEMENT: Particles are distributed across N concentric ring bands.
 * Within each band the radius is perturbed by a stored gaussian offset so the
 * band has a soft, dusty edge rather than a hard ring. Angle is random within
 * [0, TAU]. Both are baked into the GPU buffer at init and never change — the
 * motion comes entirely from per-frame uniforms.
 *
 * INNER VOID: Each particle has its stored (r, θ) checked against the morphing
 * SDF boundary in the vertex shader. Particles inside the void fade out (alpha →
 * 0); particles at the edge get a cyan brightness boost — that is the inner ring
 * glow. The SDF is 2D in the disc plane; the tilt is purely the camera.
 *
 * MORPHING SDF: Three shapes, linearly interpolated by a periodic phase:
 *   - Circle:   d = r
 *   - Pentagon: d = r / cos(mod(atan(y,x), TAU/5) - TAU/10)
 *   - Heart:    analytic polynomial SDF (Inigo Quilez formulation)
 * The phase cycles 0→1 every `morphPeriod` seconds. The three shapes are visited
 * as: circle (t=0), pentagon (t=0.25→0.75), heart (t=0.5→0.75), back to circle.
 *
 * ROTATION: The disc auto-rotates around its Y axis. No drag in the reference —
 * the camera is purely cinematic, framed by a static Tilt X (pitch) / Tilt Y
 * (roll) pair.
 *
 * ONE DRAW CALL: the disc is everything the component paints. The background is
 * the root's CSS colour — there is no starfield (it was removed) and no GL clear
 * colour, so the canvas stays transparent over it.
 *
 * Rule 6 recipe: ONE GL context built in useEffect([]); every live input read
 * from a ref inside a raw rAF loop. Never calls loseContext().
 */

/* ---------------------------------------------------------------- constants */

// Disc outer radius in world units. Camera distance is set so this fills the
// frame nicely at the default tilt.
const RMAX = 1400
const FOV  = 34
// Raymarched components cap at 1.25; point clouds can afford a little more.
const DPR_CAP = 1.5
const TAU = Math.PI * 2

/* ------------------------------------------------------------------ shaders */

// Vertex shader for the ring particles.
// Each vertex stores:
//   aRing.x = normalised radius 0..1 (within the full disc, i.e. r / RMAX)
//   aRing.y = stored angle in radians
//   aRing.z = ring band index normalised to 0..1 (0 = outermost, 1 = innermost)
//   aRing.w = per-particle random 0..1 (size / brightness jitter)
const VERT = `
precision highp float;

attribute vec4 aRing;

uniform vec2  uRes;
uniform float uFocal;
uniform float uDist;
uniform float uPitchCam;
uniform float uRoll;
uniform float uSpin;      // disc auto-rotation phase, radians
uniform float uDot;
uniform float uMorphT;    // morph phase 0..1 (circle -> pentagon -> heart -> circle)
uniform float uVoidR;     // inner void base radius, world units
uniform float uEdgeW;     // edge glow half-width, world units
uniform vec3  uCols[5];   // palette, entry 0..uColN-1
uniform int   uColN;      // live palette length (1..5)
uniform float uDepthFade;
// --- wave ---
uniform float uWaveAmp;   // peak vertical displacement, world units
uniform float uWaveFreq;  // spatial frequency (cycles across the full disc radius)
uniform float uWaveT;     // wave time accumulator

varying vec3  vCol;
varying float vA;

#define PI    3.14159265
#define TAU   6.28318530
#define RMAX  1400.0

// ---------- 2D SDFs ----------

float sdfCircle(vec2 p, float r) {
    return length(p) - r;
}

// Regular N-gon SDF via the standard sector-fold formula.
// Returns signed distance to a pentagon of circumradius r.
float sdfPentagon(vec2 p, float r) {
    float sector = TAU / 5.0;
    float a      = atan(p.y, p.x);
    float fa     = mod(a + PI / 5.0, sector) - sector * 0.5;
    // Project length onto the flat side direction.
    return length(p) * cos(fa) - r * cos(PI / 5.0);
}

// Heart SDF — Inigo Quilez exact formulation (branch-free for shader safety).
// Returns signed distance to a heart that fits in a unit box scaled by r.
float sdfHeart(vec2 p, float r) {
    vec2 q  = p / max(r, 0.001);
    q.y     = -q.y - 0.2;  // nudge the tip down so the bump centres nicely
    q.x     = abs(q.x);
    // Two tangent circles define the lobes; the cusp is the origin.
    vec2 a  = q - vec2(0.25,  0.75);
    vec2 b  = q - vec2(0.0,   1.0 );
    vec2 c2 = q - vec2(0.5,   0.0 );
    // Blend: upper region is the lobe circles; lower is the cusp.
    float region = clamp(q.y + q.x - 1.0, 0.0, 1.0);
    float da = sqrt(dot(a, a)) - sqrt(0.5) * 0.5;
    float db = min(sqrt(dot(b, b)), sqrt(dot(c2, c2))) - 0.5;
    return mix(db, da, region) * r;
}

// The morphing void SDF.
// Negative = inside the void (particle should fade/vanish),
// positive = outside (particle lives).
float voidSDF(vec2 p, float r) {
    float dC = sdfCircle (p, r);
    float dP = sdfPentagon(p, r * 0.90);
    float dH = sdfHeart  (p, r * 1.10);

    // Three equal segments: circle -> pentagon -> heart -> circle
    float t3 = uMorphT * 3.0;
    float seg = floor(t3);
    float f   = fract(t3);
    // Smoothstep eases in/out of each segment.
    float sf  = f * f * (3.0 - 2.0 * f);

    // Branch-free via mix + segment mask.
    float d01 = mix(dC, dP, sf);
    float d12 = mix(dP, dH, sf);
    float d20 = mix(dH, dC, sf);
    float d   = mix(mix(d01, d12, step(1.0, seg)), d20, step(2.0, seg));
    return d;
}

// Palette lookup. GLSL ES 1.0 only allows a uniform array to be indexed by a
// constant-index-expression, and a loop counter IS one — so the pick is a fixed
// 5-iteration compare, never uCols[idx] with a computed idx.
vec3 pickCol(float t) {
    int n   = uColN;
    int idx = int(floor(clamp(t, 0.0, 0.9999) * float(n)));
    vec3 c  = uCols[0];
    for (int i = 0; i < 5; i++) {
        if (i >= n) break;
        if (i == idx) c = uCols[i];
    }
    return c;
}

void main() {
    float normR   = aRing.x;
    float theta   = aRing.y;
    float normBnd = aRing.z;  // 0 = outermost band, 1 = innermost
    float jitter  = aRing.w;

    // Disc world-space position — still computed in the flat plane first so the
    // void SDF (which is 2D) works correctly before the wave is layered on top.
    float angle = theta + uSpin;
    float r     = normR * RMAX;
    float px    = r * cos(angle);
    float pz    = r * sin(angle);

    // ------ void masking (evaluated in flat plane) ------
    float vd    = voidSDF(vec2(px, pz), uVoidR);
    float edgeT = 1.0 - smoothstep(0.0, uEdgeW * 2.0, abs(vd));
    float maskA = smoothstep(-uEdgeW, uEdgeW, vd);

    // ------ waves (radial + X-axis) ------
    // Two travelling waves are summed, creating interference patterns:
    //   Radial wave  — phase driven by distance from centre (concentric rings).
    //   X-axis wave  — phase driven by world X position (parallel wave fronts).
    // The two propagate at slightly different rates (×0.71) so they drift in and
    // out of phase, producing a slowly shifting moiré rather than a static grid.
    float kFreq      = uWaveFreq * TAU / RMAX;
    float wavePhaseR = r  * kFreq - uWaveT;
    float wavePhaseX = px * kFreq - uWaveT * 0.71;
    float py         = (sin(wavePhaseR) * 0.65 + sin(wavePhaseX) * 0.35) * uWaveAmp;
    // Attenuate the wave near the void edge so the inner glow stays crisp.
    py *= smoothstep(0.0, uEdgeW * 3.0, vd);

    // ------ band brightness ------
    float bandBri = 0.38 + (1.0 - normBnd) * 0.62;
    float bsd     = 0.3 + jitter * 0.7;

    // ------ camera projection ------
    // General form for a world point (px, py, pz) — py is now the wave height.
    // Camera sits at world (0, dist*sin(pitch), -dist*cos(pitch)).
    //   view_x  = px
    //   view_y  = py*cos(pitch) + pz*sin(pitch)
    //   view_z  = dist - py*sin(pitch) + pz*cos(pitch)
    float c  = cos(uPitchCam);
    float s  = sin(uPitchCam);
    float ry = py * c + pz * s;
    float rz = uDist - py * s + pz * c;

    if (rz < 30.0) {
        gl_Position  = vec4(2.0, 2.0, 0.0, 1.0);
        gl_PointSize = 0.0;
        vA = 0.0;
        vCol = uCols[0];
        return;
    }

    float cr = cos(uRoll);
    float sr = sin(uRoll);
    float sx = (px * cr - ry * sr) * uFocal / rz;
    float sy = (px * sr + ry * cr) * uFocal / rz;
    gl_Position = vec4(sx / (uRes.x * 0.5), sy / (uRes.y * 0.5), 0.0, 1.0);

    float szv    = 0.5 + bsd * 1.5;
    gl_PointSize = clamp(uDot * uFocal / rz * szv, 1.0, 28.0);

    // ------ colour ------
    // Each particle takes one palette entry, chosen by its stored random. The
    // LAST entry is the highlight the void edge and the wave crests pull toward
    // — that is what the old fixed accent colour used to do.
    vec3 col = pickCol(jitter);
    vec3 hi  = pickCol(1.0);
    col      = mix(col, hi, edgeT);
    col      = mix(col, vec3(1.0), edgeT * 0.30);

    // Wave height tints particles slightly toward the highlight when they crest.
    float waveHi = max(0.0, py / max(uWaveAmp, 0.001));
    col          = mix(col, hi, waveHi * 0.25);

    float dep  = 1.0 - uDepthFade * smoothstep(uDist * 0.6, uDist * 1.6, rz);
    float bri  = (0.28 + bsd * 0.72) * bandBri * (1.0 + edgeT * 2.5);
    // Cresting particles glow slightly brighter.
    bri       *= 1.0 + waveHi * 0.40;

    vCol = col;
    vA   = clamp(bri * dep * maskA, 0.0, 3.0);
}
`

// Fragment shader: soft round dot via point-coord distance.
const FRAG = `
precision highp float;
varying vec3  vCol;
varying float vA;
void main() {
    vec2  c  = gl_PointCoord - 0.5;
    float d  = length(c) * 2.0;
    float a  = vA * (1.0 - smoothstep(0.5, 1.0, d));
    gl_FragColor = vec4(vCol * a, a);
}
`

/* ------------------------------------------------------------------- helpers */

function parseColor(input: string): [number, number, number] {
    if (!input) return [0, 0, 0]
    const s = input.trim()
    const fn = s.match(/rgba?\(([^)]+)\)/i)
    if (fn) {
        const p = fn[1].split(",").map((v) => parseFloat(v.trim()))
        return [(p[0] || 0) / 255, (p[1] || 0) / 255, (p[2] || 0) / 255]
    }
    let h = s.replace("#", "")
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("")
    h = h.padEnd(6, "0")
    return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255,
    ]
}

function mulberry32(a: number) {
    return function () {
        a |= 0
        a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function gauss(rnd: () => number) {
    const u1 = Math.max(1e-9, rnd())
    const u2 = rnd()
    const g = Math.sqrt(-2 * Math.log(u1)) * Math.cos(TAU * u2)
    return Math.max(-3, Math.min(3, g))
}

function compile(gl: WebGLRenderingContext, type: number, src: string, tag: string) {
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.warn("MorphingRings shader " + tag + ":", gl.getShaderInfoLog(sh))
    }
    return sh
}

/* --------------------------------------------------------------------- props */

interface RingGroup {
    ringBands: number
    /** 0..100 band thickness; the gap between bands follows at the shipped 65:120. */
    width: number
    /** 0..100 edge fuzz and edge glow together, off the shipped 55:38. */
    softness: number
}
interface TiltGroup {
    /** Pitch — lean forward/back, degrees above the disc plane. */
    x: number
    /** Roll — lean left/right, degrees. */
    y: number
}

// Shipped values the condensed dials reproduce at 50 — the same reading Speed,
// Scale and Amplitude already use, so every 0..100 dial on this panel means
// "50 is how it shipped".
const GAP_PER_WIDTH = 65 / 120
const BAND_WIDTH_AT_50 = 120
const FUZZ_AT_50 = 55
const EDGE_GLOW_AT_50 = 38
/**
 * Wave height in world units at Amplitude 100 — the top of the old 0..400
 * dial. RMAX is 1400 for scale. Amplitude is the one dial NOT on the panel's
 * "50 is how it shipped" reading: the shipped 55 lands at 14, because the ask
 * was to keep the old ceiling reachable rather than to recentre the range.
 */
const AMPLITUDE_AT_100 = 400
/** Particle count multiplier. Density 100 == the old dial's 300 (3 x 80). */
const COUNT_PER_DENSITY = 240

/* Cut controls, frozen at the value the scene shipped with. */
const DEPTH_FADE = 55
const WAVE_FREQUENCY = 4
/** Seconds for one full circle -> pentagon -> heart -> circle cycle. */
const MORPH_PERIOD = 30
/** Wave phase rate, radians/sec. */
const WAVE_RATE = 1.8
/**
 * Disc rotation at Speed 50, DEGREES PER SECOND — one lap every 36s.
 * The old constant was 7 fed through `(x/100) * TAU * 0.05`, i.e. 0.022 rad/s,
 * one lap every 285 seconds. The dial moved and nothing turned.
 */
const ROT_DEG_AT_50 = 10
/** Camera pullback at Scale 50 — the framing the rings shipped at. */
const BASE_DISTANCE = 2800
/** Cut dials, frozen at the value the scene shipped with. */
const INNER_VOID = 28

/** Palette ceiling — the shader's uCols array is sized to match. */
const MAX_COLORS = 5
const DEFAULT_COLORS = ["#0D3D40", "#12595A", "#2BE8C8", "#8FF6E6"]

interface ColorsGroup {
    /** 1..5 entries; the LAST one is the void-edge / wave-crest highlight. */
    items?: string[]
}

interface Props {
    background?: string
    /** The live shape is the group. A bare array is the shape before it. */
    colors?: ColorsGroup | string[]
    density?: number
    dotSize?: number
    /** 0..100; 50 is the rate the rings shipped at. Sign lives in `direction`. */
    speed?: number
    /** Which way the disc spins. */
    direction?: "cw" | "ccw"
    /** Percent of Speed while hovered. 100 = no boost. */
    hoverSpeed?: number
    /** 0..100; 50 is the framing the rings shipped at. Higher = bigger disc. */
    scale?: number
    /** 0..100 where 100 is the old dial's 400 world units. Shipped value = 14. */
    amplitude?: number
    ring?: Partial<RingGroup>
    tilt?: Partial<TiltGroup>
    transition?: Motion
    width?: number
    height?: number
    style?: React.CSSProperties
}

/* ----------------------------------------------------------------- component */

function __UIHUBBase_MorphingRings(props: Props) {
    const {
        background = "#000000",
        colors = { items: ["#FFEE00"] },
        density = 100,
        dotSize = 4,
        speed = 50,
        direction = "cw",
        hoverSpeed = 200,
        scale = 38,
        amplitude = 100,
        // a group the designer never opened arrives undefined
        ring = {"width":50,"softness":50,"ringBands":5},
        tilt = {"x":85,"y":0},
        transition = {"ease":[0,0,0.58,1],"mass":1,"type":"tween","damping":60,"duration":0.43,"stiffness":800},
        style,
    } = props

    /* The hover gate. A MotionValue read by the loop with .get(), never a
     * setState — and the Transition lives in a ref so changing it cannot land in
     * the GL effect's deps and rebuild the context (rule 6). */
    const hoverMV = useRef(motionValue(0)).current
    const transitionRef = useRef(transition)
    transitionRef.current = transition

    // The array lives inside the Colors group now; a bare array is the shape
    // before it and still reads. An emptied Array control arrives as [], and a
    // row added but never picked arrives empty — either would leave the shader
    // with no palette at all, so both drop out and the defaults stand in rather
    // than the scene going black.
    const picked = (
        Array.isArray(colors) ? colors : (colors?.items ?? [])
    ).filter((c) => !!c)
    const palette = (picked.length ? picked : DEFAULT_COLORS).slice(0, MAX_COLORS)

    const { ringBands = 5, width: ringWidth = 50, softness = 50 } = ring

    // Condensed 0..100 dials expand back into the world units the render loop
    // reads. 50 on each is the value the scene shipped with.
    const bandWidth = Math.max(1, (ringWidth / 50) * BAND_WIDTH_AT_50)
    const bandGap = bandWidth * GAP_PER_WIDTH
    const fuzz = (FUZZ_AT_50 * softness) / 50
    // Floored: the shader feeds this to smoothstep(-e, e, …) and to
    // smoothstep(0, 3e, …), both of which divide by zero at Softness 0.
    const edgeGlow = Math.max(0.5, (EDGE_GLOW_AT_50 * softness) / 50)

    // 50 is the shipped rotation rate; Direction supplies the sign.
    // NEGATIVE spin is clockwise as seen from the camera: +uSpin sends the NEAR
    // edge of the disc (bottom of frame, pz < 0) to the RIGHT, which is
    // counter-clockwise. The enum used to map cw -> +1 and rendered backwards.
    const rotSpeed =
        ((Math.max(0, speed) / 50) * ROT_DEG_AT_50 * Math.PI) /
        180 *
        (direction === "ccw" ? 1 : -1)

    // Hover boost: a multiplier on every rate the scene runs at, eased by the
    // Transition control. 100% = no boost.
    const boost = Math.max(100, hoverSpeed) / 100

    const waveAmplitude = (Math.max(0, amplitude) / 100) * AMPLITUDE_AT_100
    const waveFrequency = WAVE_FREQUENCY
    const depthFade = DEPTH_FADE
    const innerVoid = INNER_VOID

    // Scale reads forward (higher = bigger), so it is the INVERSE of the camera
    // pullback the loop actually needs. 50 reproduces the shipped framing, 100 is
    // roughly twice that; the floor keeps the division away from zero at Scale 0.
    const cameraDistance = BASE_DISTANCE / (Math.max(5, scale) / 50)
    const tiltX = tilt.x ?? 30
    const tiltY = tilt.y ?? -5

    const hostRef   = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Every live input flows through this ref: the GL context is built once
    // and must never be torn down by a control change (rule 6).
    // Palette flattened to the exact vec3[5] the shader declares. Entries past
    // the live count are left at 0 and never read (uColN bounds the loop).
    const colRGB = useRef(new Float32Array(MAX_COLORS * 3))
    for (let i = 0; i < palette.length; i++) {
        const [r, g, b] = parseColor(palette[i])
        colRGB.current[i * 3] = r
        colRGB.current[i * 3 + 1] = g
        colRGB.current[i * 3 + 2] = b
    }

    const live = useRef({
        colN: palette.length, colRGB: colRGB.current,
        density, dotSize, innerVoid, depthFade,
        ringBands, bandWidth, bandGap, fuzz, edgeGlow,
        rotSpeed, boost,
        waveAmplitude, waveFrequency,
        cameraDistance, tiltX, tiltY,
    })
    live.current = {
        colN: palette.length, colRGB: colRGB.current,
        density, dotSize, innerVoid, depthFade,
        ringBands, bandWidth, bandGap, fuzz, edgeGlow,
        rotSpeed, boost,
        waveAmplitude, waveFrequency,
        cameraDistance, tiltX, tiltY,
    }

    useEffect(() => {
        const host   = hostRef.current
        const canvas = canvasRef.current
        if (!host || !canvas) return

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            depth: false,
        }) as WebGLRenderingContext | null
        if (!gl) return

        /* ---- ring particle program ---- */
        const ringProg = gl.createProgram()!
        gl.attachShader(ringProg, compile(gl, gl.VERTEX_SHADER,   VERT, "ring-vert"))
        gl.attachShader(ringProg, compile(gl, gl.FRAGMENT_SHADER, FRAG, "ring-frag"))
        gl.linkProgram(ringProg)
        if (!gl.getProgramParameter(ringProg, gl.LINK_STATUS)) {
            console.warn("MorphingRings ring link:", gl.getProgramInfoLog(ringProg))
            return
        }

        /* ---- ring uniforms ---- */
        gl.useProgram(ringProg)
        const aRing = gl.getAttribLocation(ringProg, "aRing")
        const Ur = (n: string) => gl.getUniformLocation(ringProg, n)
        const ur = {
            res:       Ur("uRes"),
            focal:     Ur("uFocal"),
            dist:      Ur("uDist"),
            pitchCam:  Ur("uPitchCam"),
            roll:      Ur("uRoll"),
            spin:      Ur("uSpin"),
            dot:       Ur("uDot"),
            morphT:    Ur("uMorphT"),
            voidR:     Ur("uVoidR"),
            edgeW:     Ur("uEdgeW"),
            // An array uniform is addressed by its first element.
            cols:      Ur("uCols[0]"),
            colN:      Ur("uColN"),
            depthFade: Ur("uDepthFade"),
            waveAmp:   Ur("uWaveAmp"),
            waveFreq:  Ur("uWaveFreq"),
            waveT:     Ur("uWaveT"),
        }

        /* ---- ring buffer (rebuilt when density / band count change) ---- */
        const ringBuf = gl.createBuffer()!
        let ringCount = 0
        let builtKey  = ""

        const buildRings = (d: number, bands: number, bW: number, bGap: number, fz: number) => {
            const nBands  = Math.max(1, Math.round(bands))
            // Points per band proportional to its circumference (outer bands get more).
            // Base count scales with density slider — 240/unit, so Density 100
            // is the count the old 0..200 dial reached at 300.
            const baseCount = Math.max(200, Math.round(d * COUNT_PER_DENSITY))
            let total = 0
            for (let b = 0; b < nBands; b++) {
                // Outer bands are larger so they get proportionally more particles.
                const frac = (b + 1) / nBands
                total += Math.round(baseCount * (0.5 + frac * 0.8))
            }
            ringCount = total

            const data = new Float32Array(total * 4)
            const rnd  = mulberry32(0x9a1b2c3)
            let ptr    = 0

            for (let b = 0; b < nBands; b++) {
                const normBnd = b / Math.max(1, nBands - 1)
                // Band centre radius: outermost band at RMAX - fuzz, innermost well inside.
                // Innermost ring centre is at roughly (voidR + bandWidth) and they stack outward.
                // We lay them from outside inward so band 0 is the outermost.
                const bandCentre = RMAX - (bW * 0.5) - b * (bW + bGap)
                const cnt = Math.round(baseCount * (0.5 + (1 - normBnd) * 0.8))

                for (let i = 0; i < cnt; i++) {
                    const theta  = rnd() * TAU
                    // Gaussian radial scatter within the band
                    const scatter = gauss(rnd) * fz * 0.5
                    const r      = Math.max(10, bandCentre + scatter)
                    const normR  = r / RMAX
                    const jitter = rnd()
                    data[ptr * 4]     = normR
                    data[ptr * 4 + 1] = theta
                    data[ptr * 4 + 2] = normBnd      // band index normalised
                    data[ptr * 4 + 3] = jitter
                    ptr++
                }
            }
            ringCount = ptr
            gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf)
            gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, ptr * 4), gl.STATIC_DRAW)
            builtKey = `${d}|${bands}|${Math.round(bW)}|${Math.round(bGap)}|${Math.round(fz)}`
        }

        /* ---- GL state ---- */
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        // Additive on premultiplied: dense inner rings bloom to bright teal-white.
        gl.blendFunc(gl.ONE, gl.ONE)

        /* ---- sizing ---- */
        let cssW = 0, cssH = 0, dpr = 1
        const resize = () => {
            dpr  = Math.min(window.devicePixelRatio || 1, DPR_CAP)
            cssW = canvas.clientWidth  || host.clientWidth  || 0
            cssH = canvas.clientHeight || host.clientHeight || 0
            const w = Math.max(1, Math.round(cssW * dpr))
            const h = Math.max(1, Math.round(cssH * dpr))
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width  = w
                canvas.height = h
            }
            gl.viewport(0, 0, w, h)
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas)

        /* ---- pointer (hover boost) ----
         * The gate is a 0..1 amount, not a position: hovering anywhere in the
         * host speeds the whole scene up, so no screen->disc ray-cast is needed
         * and nothing has to be measured (rule G — no getBoundingClientRect).
         * `pointerenter`/`pointerleave` fire once per crossing, unlike the old
         * `pointermove`, which re-armed the gate on every single move event. */
        let gate = 0
        let hoverAnim: { stop: () => void } | null = null
        const gateTo = (to: number) => {
            if (gate === to) return
            gate = to
            hoverAnim?.stop()
            hoverAnim = animate(hoverMV, to, transitionRef.current)
        }
        const onEnter = () => gateTo(1)
        const onLeave = () => gateTo(0)
        host.addEventListener("pointerenter", onEnter)
        host.addEventListener("pointerleave", onLeave)

        /* ---- animation loop ---- */
        let raf       = 0
        let last      = performance.now()
        let spinPhase  = 0
        let morphPhase = 0
        let waveT      = 0

        const frame = (now: number) => {
            raf = requestAnimationFrame(frame)
            const dt = Math.min((now - last) / 1000, 0.05)
            last = now

            if (cssW <= 0 || cssH <= 0) { resize(); if (cssW <= 0 || cssH <= 0) return }

            const L   = live.current
            const key = `${L.density}|${L.ringBands}|${Math.round(L.bandWidth)}|${Math.round(L.bandGap)}|${Math.round(L.fuzz)}`
            if (key !== builtKey) buildRings(L.density, L.ringBands, L.bandWidth, L.bandGap, L.fuzz)
            if (ringCount === 0) return

            // Hover boost. The gate is 0..1, eased by the Transition control;
            // the loop only reads it. It multiplies EVERY rate the scene runs
            // at — spin, morph and wave together — so hovering reads as one
            // "faster", not as the disc alone speeding up.
            const hb = 1 + hoverMV.get() * (L.boost - 1)

            // rotSpeed is already radians/sec, signed by Direction.
            spinPhase  = (spinPhase  + dt * L.rotSpeed * hb) % TAU
            morphPhase = (morphPhase + (dt / MORPH_PERIOD) * hb) % 1
            waveT     += dt * WAVE_RATE * hb

            const pitchCam   = (L.tiltX * Math.PI) / 180
            const roll       = (-L.tiltY * Math.PI) / 180
            const dist       = Math.max(500, L.cameraDistance)

            const wDev  = canvas.width
            const hDev  = canvas.height
            const focal = hDev / (2 * Math.tan(((FOV / 2) * Math.PI) / 180))

            const voidR  = (L.innerVoid / 100) * RMAX
            const edgeWW = L.edgeGlow

            gl.clearColor(0, 0, 0, 0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            /* --- draw ring particles --- */
            gl.useProgram(ringProg)
            gl.uniform2f(ur.res,       wDev, hDev)
            gl.uniform1f(ur.focal,     focal)
            gl.uniform1f(ur.dist,      dist)
            gl.uniform1f(ur.pitchCam,  pitchCam)
            gl.uniform1f(ur.roll,      roll)
            gl.uniform1f(ur.spin,      spinPhase)
            gl.uniform1f(ur.dot,       L.dotSize)
            gl.uniform1f(ur.morphT,    morphPhase)
            gl.uniform1f(ur.voidR,     voidR)
            gl.uniform1f(ur.edgeW,     edgeWW)
            gl.uniform3fv(ur.cols,     L.colRGB)
            gl.uniform1i(ur.colN,      L.colN)
            gl.uniform1f(ur.depthFade, L.depthFade / 100)
            gl.uniform1f(ur.waveAmp,   L.waveAmplitude)
            gl.uniform1f(ur.waveFreq,  L.waveFrequency)
            gl.uniform1f(ur.waveT,     waveT)

            gl.bindBuffer(gl.ARRAY_BUFFER, ringBuf)
            gl.enableVertexAttribArray(aRing)
            gl.vertexAttribPointer(aRing, 4, gl.FLOAT, false, 0, 0)

            gl.drawArrays(gl.POINTS, 0, ringCount)
        }
        raf = requestAnimationFrame(frame)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
            hoverAnim?.stop()
            host.removeEventListener("pointerenter", onEnter)
            host.removeEventListener("pointerleave", onLeave)
            // No loseContext(): getContext returns the same context per canvas,
            // so StrictMode's mount/cleanup/mount would reuse a force-lost one.
        }
    }, [])

    return (
        <div
            ref={hostRef}
            style={{
                // Floor BEFORE the style spread: the canvas is absolutely
                // positioned, so the root has no in-flow content and would
                // collapse to a dot under Fit Content sizing.
                minWidth: 1200,
                minHeight: 800,
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                // Flat Background only — the frozen centre haze and vignette
                // are gone, so the colour picked in the panel is the colour
                // that renders.
                background,
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

const __uihubPresetProps = {
  "colors": {
    "items": [
      "#FFEE00",
      "#009DFF",
      "#7500FF"
    ]
  }
};

export default function MorphingRings(props: Record<string, unknown>) {
  return <__UIHUBBase_MorphingRings {...(__uihubPresetProps as Record<string, unknown>)} {...props} />;
}
