
import * as React from "react"

import { useEffect, useRef } from "react"

import { animate, motionValue } from "motion/react"



/**

 * POINT CLOUD DOUBLE DNA HELIX — bioluminescent 3D particle DNA structure.

 *

 * GEOMETRY — Two interwoven helical backbone strands (Strand A & Strand B) 180° out of phase,

 * connected by discrete base pair rungs (AT/CG ladder steps), surrounded by an ambient genetic mist field.

 *

 * SHADERS — All 3D helical parametric math, camera transform, perspective point sizing,

 * depth fade, screen-space cursor displacement and colour live in the vertex shader.

 *

 * ENDLESS — The helix runs along the screen horizontal for SPAN world units, which

 * overshoots the visible frame at EVERY Zoom, and its last stretch dissolves via

 * END_FADE. The spin is a rotation about the helix's own axis, so no camera angle

 * can ever swing an end into frame. Earlier builds ran the axis into the screen

 * and spun the camera around it, which tumbled the whole coil end-on and put two

 * hard-cut ends in the middle of the canvas.

 *

 * Rule 6 recipe: ONE GL context built in useEffect([]); every live input read from a ref

 * inside a raw rAF loop. Never calls loseContext().

 */



/**

 * motion's `animate()` option bag. `AnimationOptions` is not exported, and its

 * `Transition` type is not assignable to what `animate(value, …)` accepts, so

 * the shape is spelled out here — a type alias, not an interface, or it loses

 * the implicit index signature the intersection needs.

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



/* ---------------------------------------------------------------- constants */



const DPR_CAP = 1.5

const FOV_DEG = 38

const TAU = Math.PI * 2



/** Frozen geometry — cut from the panel to hold the 15-dial cap (rule 8b).

 *  The render path is unchanged; these are the values the controls shipped at. */

const HELIX_RADIUS = 160



/** Axis length in world units. Sized so the helix leaves the frame at the widest

 *  Zoom: at Zoom 0 the camera sits at ZOOM_FAR and the frame's world half-width

 *  is 1291, so a half-span of 1800 with the fade starting at 1350 clears it. */

const SPAN = 3600

/** Where the strands start dissolving, as a share of the half-span. The recycle

 *  of a wrapped field belongs where alpha is already gone; same idea here — the

 *  end is never a cut, it is a fade that lives outside the widest frame. */

const END_FADE_START = 0.75

/** `Turns` counts turns per this many world units, which is what it counted when

 *  the helix was 800 long — so the dial keeps its range AND its shipped default. */

const PITCH_REF = 800

/** World units between base-pair rungs. 800/24, the spacing that shipped. */

const RUNG_SPACING = PITCH_REF / 24

/** Overall gain, replacing the cut Brightness dial at its shipped default. It is

 *  above 1 because premultiplying re-applies the per-fragment falloff that the old

 *  non-premultiplied output threw away; tuned so mean frame RGB matches the look

 *  the component shipped with. */

const BRIGHTNESS = 7.0



/** Fill-rate backstop at Density 150 + Dot Size 400 %. */

const MAX_POINTS = 130000



/** Camera pullback. Zoom is a percent, reversed: 0 % parks the camera at

 *  ZOOM_FAR (more of the helix in frame), 100 % pulls in to ZOOM_NEAR (less). */

const ZOOM_FAR = 2500

const ZOOM_NEAR = 400



/** Spin Speed 50 → 0.5 rad/s ≈ 12.6 s per revolution. Signed, so −50 reverses. */

const SPIN_RATE = 0.01

/** Radians of spin per px of drag. */

const DRAG_SPIN = 0.008

/** Time constant the spin chases its target on, in seconds. Frozen, not a

 *  control: the target moves every frame, so this is a filter, not a transition. */

const SPIN_TAU = 0.158

/** Per-second decay of the flick velocity left over from a drag. */

const SPIN_VEL_DECAY = 0.92



/** The hover gate's settle. Frozen — the cursor-lift filter is micro-physics,

 *  not a design dial (rule 8b). */

const HOVER_TRANSITION: Motion = {

    type: "tween",

    duration: 0.5,

    // easeOut, as the cubic-bezier the tuple type needs.

    ease: [0, 0, 0.58, 1],

}



/* ------------------------------------------------------------------ shaders */



const VERT = `

precision highp float;



// aPosition is deliberately absent: the old attribute was never read here, so it

// compiled out and every frame threw INVALID_VALUE from enableVertexAttribArray.

attribute vec4 aInfo;     // x = type (0: strandA, 1: strandB, 2: rung, 3: dust), y = axis 0..1, z = rungFrac, w = seed

attribute vec3 aOffset;   // unit-ball scatter, scaled by uThickness into world units



uniform vec2  uRes;

uniform float uFocal;

uniform float uTime;

uniform float uRadius;

uniform float uSpan;

uniform float uEndFade;

uniform float uTurns;

uniform float uThickness;

uniform float uDotSize;

uniform float uDistance;

uniform float uTiltX;

uniform float uTiltY;

uniform float uSpin;

uniform float uPulse;



uniform vec3  uBaseColor;

uniform vec3  uAccentColor;

uniform float uAccentMix;



uniform vec2  uCursorNDC;   // pointer in clip space [-1, 1]

uniform float uHover;

uniform float uHoverActive;



varying vec3  vColor;

varying float vAlpha;



const float TAU = 6.28318530718;

const float PI  = 3.14159265359;

const float PITCH_REF = 800.0;



/* Pointer influence radius, as a share of the short screen half-axis. Frozen:

   the panel is at its cap and Hover's strength is the dial designers reach for. */

const float REACH = 0.45;

/* Screen px the field is pushed by at Hover 100 %, dead centre of the reach. */

const float HOVER_PUSH_PX = 90.0;

/* Overall gain — the Brightness dial, frozen at the value it shipped at. */

const float BRIGHTNESS = 7.0;



void main() {

    float type  = aInfo.x;

    float u     = aInfo.y;   // 0..1 along the axis

    float rungT = aInfo.z;

    float seed  = aInfo.w;



    // Every uTime term below is multiplied by pulseAmt, so Pulse 0 leaves the

    // geometry with no time dependence at all — the scene is truly static.

    float pulseAmt = clamp(uPulse * 0.01, 0.0, 1.0);

    float breathe  = 1.0 + pulseAmt * 0.22 * sin(uTime * 1.6 - u * 18.0);



    // The axis is world X — it lies across the screen, so the helix exits left

    // and right and no end is ever in frame.

    float axis = (u - 0.5) * uSpan;

    // Phase is a function of the axis position, so the strands stay one

    // continuous helix; uSpin turns the whole thing about that axis.

    float phase = (axis / PITCH_REF) * uTurns * TAU + uSpin;

    float rad   = uRadius * breathe;



    vec3 basePos;



    if (type < 0.5) {

        // Strand A

        basePos = vec3(axis, rad * sin(phase), rad * cos(phase));

    } else if (type < 1.5) {

        // Strand B (180 degrees phase shift)

        float pB = phase + PI;

        basePos = vec3(axis, rad * sin(pB), rad * cos(pB));

    } else if (type < 2.5) {

        // Base pair rungs connecting Strand A and Strand B

        float pB = phase + PI;

        vec3 pA3 = vec3(axis, rad * sin(phase), rad * cos(phase));

        vec3 pB3 = vec3(axis, rad * sin(pB), rad * cos(pB));

        basePos = mix(pA3, pB3, rungT);

    } else {

        // Ambient genetic dust sleeve around the helix

        float dustA = phase * 0.5 + seed * TAU;

        float dustR = rad * (1.2 + 0.8 * sin(seed * 17.0 + uTime * 0.4 * pulseAmt));

        basePos = vec3(axis, dustR * sin(dustA), dustR * cos(dustA));

    }



    // Tube thickness: aOffset is a unit-ball sample, so uThickness IS the radius

    // of the strand in world units.

    vec3 worldPos = basePos + aOffset * uThickness;



    // Tilt X: swing the axis into depth, about the screen vertical. One end

    // recedes and the other comes forward, which is what gives the helix its

    // perspective foreshortening.

    float ax = uTiltX * 0.01745329251;

    float cx = cos(ax), sx = sin(ax);

    vec3 swung = vec3(

        worldPos.x * cx + worldPos.z * sx,

        worldPos.y,

        -worldPos.x * sx + worldPos.z * cx

    );



    // Tilt Y: lean the axis within the screen plane, about the view axis. A

    // rotation about the screen HORIZONTAL is deliberately not offered: on a tube

    // whose axis is horizontal it is the identical rotation to uSpin, so it would

    // be a second, broken copy of the Spin dial.

    float ay = uTiltY * 0.01745329251;

    float cy = cos(ay), sy = sin(ay);

    vec3 posCam = vec3(

        swung.x * cy - swung.y * sy,

        swung.x * sy + swung.y * cy,

        swung.z

    );



    float halfWidth  = max(uRes.x * 0.5, 1.0);

    float halfHeight = max(uRes.y * 0.5, 1.0);



    // View translation along Z.

    float zProj = max(uDistance - posCam.z, 1.0);



    // Project once BEFORE the cursor test: the pointer lives on the screen, so

    // the distance to it has to be measured there too. Comparing world-space

    // positions against a z=0 cursor (what this used to do) put the swell

    // wherever the camera angle happened to send it, never under the pointer.

    vec2 ndc = vec2(

        (posCam.x * uFocal) / (zProj * halfWidth),

        (posCam.y * uFocal) / (zProj * halfHeight)

    );



    if (uHoverActive > 0.001 && uHover > 0.001) {

        vec2 dScreen = (ndc - uCursorNDC) * vec2(halfWidth, halfHeight);

        float distPx = length(dScreen);

        float reachPx = REACH * min(halfWidth, halfHeight);

        if (distPx < reachPx) {

            float f = 1.0 - distPx / reachPx;

            f = f * f * uHoverActive;

            vec2 dir = dScreen / max(distPx, 0.0001);

            float pushPx = (uHover * 0.01) * HOVER_PUSH_PX * f;

            // Screen px back into camera units at THIS point's depth, so the

            // swell reads the same size near and far. zProj is unchanged by an

            // x/y push, so the projection below stays exact.

            posCam.xy += dir * (pushPx * zProj / uFocal);

            ndc += dir * (pushPx / vec2(halfWidth, halfHeight));

        }

    }



    gl_Position = vec4(ndc.x, ndc.y, posCam.z / max(uDistance * 2.0, 1.0), 1.0);



    // Point size attenuated by perspective depth and screen height.

    float scaleFactor = halfHeight / 400.0;

    float baseSize = (uDotSize * 0.01) * 3.4 * (uFocal / zProj) * (0.75 + 0.5 * seed) * scaleFactor;

    if (type >= 2.5) { baseSize *= 0.6; }

    gl_PointSize = clamp(baseSize, 1.0, 64.0);



    // Colour mixing

    vec3 col = uBaseColor;

    float mixShare = clamp(uAccentMix * 0.01, 0.0, 1.0);

    if (type > 0.5 && type < 1.5) {

        col = mix(uBaseColor, uAccentColor, mixShare);

    } else if (type >= 1.5 && type < 2.5) {

        col = mix(uBaseColor, uAccentColor, rungT);

    } else if (type >= 2.5) {

        col = mix(uBaseColor, uAccentColor, seed);

    }



    // Front/back shading across the tube — the near half of the coil reads

    // brighter, which is what makes the double strand legible as a 3D ribbon.

    float near = clamp(posCam.z / max(uRadius + uThickness, 1.0) * 0.5 + 0.5, 0.0, 1.0);

    float depthFade = mix(0.35, 1.0, near);



    // The last stretch of the axis dissolves instead of stopping dead. It sits

    // outside the frame at every Zoom, so at rest this costs nothing; it is what

    // makes the widest Zoom read as endless rather than cut.

    float halfSpan = uSpan * 0.5;

    float endFade = 1.0 - smoothstep(halfSpan * uEndFade, halfSpan, abs(axis));



    // Near fade. Tilt X can swing the far half of the axis past the camera; those

    // points would otherwise clamp to zProj = 1 and splat as 64 px blobs. Fading

    // them by depth is what makes the whole Tilt X range safe to expose.

    float nearFade = smoothstep(0.0, uDistance * 0.25, zProj);



    vColor = col;

    vAlpha = depthFade * endFade * nearFade * (type >= 2.5 ? 0.45 : 0.85) * BRIGHTNESS * breathe;

}

`



const FRAG = `

precision highp float;



varying vec3 vColor;

varying float vAlpha;



void main() {

    vec2 coord = gl_PointCoord - vec2(0.5);

    float r2 = dot(coord, coord);

    if (r2 > 0.25) discard;



    float intensity = exp(-r2 * 8.0);

    // Premultiplied: the context is premultipliedAlpha and the blend is additive,

    // so RGB is added as-is. Emitting the unscaled colour made every alpha term

    // — depth shading, end fade, pulse — invisible.

    float a = clamp(vAlpha * intensity, 0.0, 1.0);

    gl_FragColor = vec4(vColor * a, a);

}

`



/* ------------------------------------------------------------------ helpers */



function parseHexColor(colorStr: string): [number, number, number] {

    if (!colorStr) return [0.0, 0.9, 1.0]

    let str = colorStr.trim()

    // Colour values arrive as rgb()/rgba() as often as hex.

    if (str.startsWith("rgb")) {

        const nums = str.match(/[\d.]+/g)

        if (nums && nums.length >= 3) {

            return [

                Number(nums[0]) / 255,

                Number(nums[1]) / 255,

                Number(nums[2]) / 255,

            ]

        }

        return [0.0, 0.9, 1.0]

    }

    if (str.startsWith("#")) str = str.slice(1)

    if (str.length === 3) {

        str = str[0] + str[0] + str[1] + str[1] + str[2] + str[2]

    }

    if (str.length >= 6) {

        const r = parseInt(str.substring(0, 2), 16) / 255

        const g = parseInt(str.substring(2, 4), 16) / 255

        const b = parseInt(str.substring(4, 6), 16) / 255

        return [isNaN(r) ? 0 : r, isNaN(g) ? 0.9 : g, isNaN(b) ? 1 : b]

    }

    return [0.0, 0.9, 1.0]

}



/* ---------------------------------------------------------------- component */



export interface PointDNAHelixProps {

    background?: string

    baseColor?: string

    accentColor?: string

    accentMix?: number

    glow?: string

    density?: number

    dotSize?: number

    speed?: number

    zoom?: number

    hover?: number

    tilt?: {

        x?: number

        y?: number

    }

    helix?: {

        turns?: number

        thickness?: number

        pulse?: number

    }

    style?: React.CSSProperties

}



function __OriginkitBase_PointDNAHelix({

    background = "#030712",

    baseColor = "#00E5FF",

    accentColor = "#FF007A",

    accentMix = 42,

    glow = "#00E5FF20",

    density = 31,

    dotSize = 100,

    speed = 70,

    zoom = 30,

    hover = 80,

    tilt = { x: 0, y: 90 },

    helix = { turns: 1.5, thickness: 16, pulse: 50 },

    style,

}: PointDNAHelixProps) {

    const hostRef = useRef<HTMLDivElement>(null)

    const canvasRef = useRef<HTMLCanvasElement>(null)



    /* The hover gate. A MotionValue read by the loop with .get(), never a

     * setState — so nothing here can land in the GL effect's deps and rebuild

     * the context (rule 6). */

    const hoverMV = useRef(motionValue(0)).current



    // A group the designer never opened arrives undefined, so every field keeps

    // its own fallback (rule 8b).

    const { x: tiltX = 0, y: tiltY = 15 } = tilt

    const { turns = 3, thickness = 20, pulse = 40 } = helix



    const paramsRef = useRef({

        baseColor,

        accentColor,

        accentMix,

        density,

        dotSize,

        speed,

        zoom,

        hover,

        tiltX,

        tiltY,

        turns,

        thickness,

        pulse,

    })



    paramsRef.current = {

        baseColor,

        accentColor,

        accentMix,

        density,

        dotSize,

        speed,

        zoom,

        hover,

        tiltX,

        tiltY,

        turns,

        thickness,

        pulse,

    }



    const stateRef = useRef({

        spin: 0,

        targetSpin: 0,

        spinVel: 0,

        isDragging: false,

        lastMouseX: 0,

        cursorNDC: [0, 0] as [number, number],

        hoverActive: 0,

        targetHoverActive: 0,

    })



    useEffect(() => {

        const canvas = canvasRef.current

        const host = hostRef.current

        if (!canvas || !host) return



        let hoverAnim: { stop: () => void } | null = null

        const gateHover = (to: number) => {

            if (stateRef.current.targetHoverActive === to) return

            stateRef.current.targetHoverActive = to

            hoverAnim?.stop()

            hoverAnim = animate(hoverMV, to, HOVER_TRANSITION)

        }



        const gl = canvas.getContext("webgl", {

            alpha: true,

            depth: false,

            antialias: true,

            premultipliedAlpha: true,

        })

        if (!gl) return



        gl.enable(gl.BLEND)

        gl.blendFunc(gl.ONE, gl.ONE)



        const vertShader = gl.createShader(gl.VERTEX_SHADER)!

        gl.shaderSource(vertShader, VERT)

        gl.compileShader(vertShader)



        const fragShader = gl.createShader(gl.FRAGMENT_SHADER)!

        gl.shaderSource(fragShader, FRAG)

        gl.compileShader(fragShader)



        const program = gl.createProgram()!

        gl.attachShader(program, vertShader)

        gl.attachShader(program, fragShader)

        gl.linkProgram(program)

        gl.useProgram(program)



        const uResLoc = gl.getUniformLocation(program, "uRes")

        const uFocalLoc = gl.getUniformLocation(program, "uFocal")

        const uTimeLoc = gl.getUniformLocation(program, "uTime")

        const uRadiusLoc = gl.getUniformLocation(program, "uRadius")

        const uSpanLoc = gl.getUniformLocation(program, "uSpan")

        const uEndFadeLoc = gl.getUniformLocation(program, "uEndFade")

        const uTurnsLoc = gl.getUniformLocation(program, "uTurns")

        const uThicknessLoc = gl.getUniformLocation(program, "uThickness")

        const uDotSizeLoc = gl.getUniformLocation(program, "uDotSize")

        const uDistanceLoc = gl.getUniformLocation(program, "uDistance")

        const uTiltXLoc = gl.getUniformLocation(program, "uTiltX")

        const uTiltYLoc = gl.getUniformLocation(program, "uTiltY")

        const uSpinLoc = gl.getUniformLocation(program, "uSpin")

        const uPulseLoc = gl.getUniformLocation(program, "uPulse")

        const uBaseColorLoc = gl.getUniformLocation(program, "uBaseColor")

        const uAccentColorLoc = gl.getUniformLocation(program, "uAccentColor")

        const uAccentMixLoc = gl.getUniformLocation(program, "uAccentMix")

        const uCursorNDCLoc = gl.getUniformLocation(program, "uCursorNDC")

        const uHoverLoc = gl.getUniformLocation(program, "uHover")

        const uHoverActiveLoc = gl.getUniformLocation(program, "uHoverActive")



        const aInfoLoc = gl.getAttribLocation(program, "aInfo")

        const aOffLoc = gl.getAttribLocation(program, "aOffset")



        const infoBuffer = gl.createBuffer()!

        const offBuffer = gl.createBuffer()!



        let currentDensity = -1

        let particleCount = 0



        const buildBuffers = (dens: number) => {

            currentDensity = dens



            // Points per world unit is what Density has always meant, so the

            // count scales with the (now much longer) span.

            const totalPoints = Math.min(

                Math.floor(dens * 220 * (SPAN / PITCH_REF)),

                MAX_POINTS

            )

            particleCount = totalPoints



            const strandAPoints = Math.floor(totalPoints * 0.35)

            const strandBPoints = Math.floor(totalPoints * 0.35)

            const rungPoints = Math.floor(totalPoints * 0.2)



            const infoArray = new Float32Array(totalPoints * 4)

            const offArray = new Float32Array(totalPoints * 3)



            let idx = 0



            const addPoint = (

                type: number,

                u: number,

                rungT: number,

                seed: number

            ) => {

                infoArray[idx * 4] = type

                infoArray[idx * 4 + 1] = u

                infoArray[idx * 4 + 2] = rungT

                infoArray[idx * 4 + 3] = seed



                // Rejection-sample the unit ball so Thickness is a true tube

                // radius in world units, not the corner-heavy cube the old

                // per-axis uniform gave.

                let ox = 0

                let oy = 0

                let oz = 0

                let l2 = 2

                while (l2 > 1) {

                    ox = Math.random() * 2 - 1

                    oy = Math.random() * 2 - 1

                    oz = Math.random() * 2 - 1

                    l2 = ox * ox + oy * oy + oz * oz

                }

                offArray[idx * 3] = ox

                offArray[idx * 3 + 1] = oy

                offArray[idx * 3 + 2] = oz



                idx++

            }



            for (let i = 0; i < strandAPoints; i++) {

                addPoint(0, i / strandAPoints, 0, Math.random())

            }



            for (let i = 0; i < strandBPoints; i++) {

                addPoint(1, i / strandBPoints, 0, Math.random())

            }



            // Rung spacing is in world units, so the ladder step stays the same

            // whatever the span is.

            const rungSteps = Math.max(4, Math.round(SPAN / RUNG_SPACING))

            const pointsPerStep = Math.max(2, Math.floor(rungPoints / rungSteps))

            for (let s = 0; s < rungSteps && idx < totalPoints; s++) {

                const u = s / rungSteps

                const stepCount = Math.max(pointsPerStep - 1, 1)

                for (let p = 0; p < pointsPerStep && idx < totalPoints; p++) {

                    addPoint(2, u, p / stepCount, Math.random())

                }

            }



            // Whatever budget is left over becomes the ambient genetic mist.

            while (idx < totalPoints) {

                addPoint(3, Math.random(), 0, Math.random())

            }



            gl.bindBuffer(gl.ARRAY_BUFFER, infoBuffer)

            gl.bufferData(gl.ARRAY_BUFFER, infoArray, gl.STATIC_DRAW)



            gl.bindBuffer(gl.ARRAY_BUFFER, offBuffer)

            gl.bufferData(gl.ARRAY_BUFFER, offArray, gl.STATIC_DRAW)

        }



        buildBuffers(paramsRef.current.density)



        gl.bindBuffer(gl.ARRAY_BUFFER, infoBuffer)

        gl.enableVertexAttribArray(aInfoLoc)

        gl.vertexAttribPointer(aInfoLoc, 4, gl.FLOAT, false, 0, 0)



        gl.bindBuffer(gl.ARRAY_BUFFER, offBuffer)

        gl.enableVertexAttribArray(aOffLoc)

        gl.vertexAttribPointer(aOffLoc, 3, gl.FLOAT, false, 0, 0)



        const resize = () => {

            const rect = host.getBoundingClientRect()

            const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)

            const w = Math.max(1, Math.floor(rect.width * dpr))

            const h = Math.max(1, Math.floor(rect.height * dpr))

            if (canvas.width !== w || canvas.height !== h) {

                canvas.width = w

                canvas.height = h

            }

            gl.viewport(0, 0, w, h)

        }

        resize()



        const ro = new ResizeObserver(resize)

        ro.observe(host)



        const onPointerMove = (e: PointerEvent) => {

            const rect = host.getBoundingClientRect()

            const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1

            const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1)

            stateRef.current.cursorNDC = [nx, ny]



            if (stateRef.current.isDragging) {

                const dx = e.clientX - stateRef.current.lastMouseX

                stateRef.current.targetSpin += dx * DRAG_SPIN

                stateRef.current.spinVel = dx * DRAG_SPIN

                stateRef.current.lastMouseX = e.clientX

            }

        }

        const onPointerEnter = () => gateHover(1)

        const onPointerLeave = () => gateHover(0)

        const onPointerDown = (e: PointerEvent) => {

            stateRef.current.isDragging = true

            stateRef.current.lastMouseX = e.clientX

            stateRef.current.spinVel = 0

        }

        const onPointerUp = () => {

            stateRef.current.isDragging = false

        }



        host.addEventListener("pointermove", onPointerMove)

        host.addEventListener("pointerenter", onPointerEnter)

        host.addEventListener("pointerleave", onPointerLeave)

        host.addEventListener("pointerdown", onPointerDown)

        window.addEventListener("pointerup", onPointerUp)



        let raf = 0

        let lastT: number | null = null



        const loop = (t: number) => {

            const p = paramsRef.current



            if (p.density !== currentDensity) {

                buildBuffers(p.density)

            }



            const dt = lastT === null ? 1 / 60 : Math.min((t - lastT) / 1000, 1 / 15)

            lastT = t



            // Spin: continuous auto-rotation target chased by a low-pass filter,

            // plus drag flick momentum that decays independently.

            stateRef.current.targetSpin += p.speed * SPIN_RATE * dt

            if (!stateRef.current.isDragging) {

                stateRef.current.targetSpin += stateRef.current.spinVel * dt * 60

                stateRef.current.spinVel *= Math.pow(SPIN_VEL_DECAY, dt * 60)

            }

            const chase = 1 - Math.exp(-dt / SPIN_TAU)

            stateRef.current.spin +=

                (stateRef.current.targetSpin - stateRef.current.spin) * chase



            stateRef.current.hoverActive = hoverMV.get()



            const zoomT = Math.max(0, Math.min(100, p.zoom)) / 100

            const distance = ZOOM_FAR + (ZOOM_NEAR - ZOOM_FAR) * zoomT



            const halfHeight = canvas.height * 0.5

            const focal = halfHeight / Math.tan((FOV_DEG * 0.5 * Math.PI) / 180)



            gl.uniform2f(uResLoc, canvas.width, canvas.height)

            gl.uniform1f(uFocalLoc, focal)

            gl.uniform1f(uTimeLoc, t / 1000)

            gl.uniform1f(uRadiusLoc, HELIX_RADIUS)

            gl.uniform1f(uSpanLoc, SPAN)

            gl.uniform1f(uEndFadeLoc, END_FADE_START)

            gl.uniform1f(uTurnsLoc, p.turns)

            gl.uniform1f(uThicknessLoc, p.thickness)

            gl.uniform1f(uDotSizeLoc, p.dotSize)

            gl.uniform1f(uDistanceLoc, distance)

            gl.uniform1f(uTiltXLoc, p.tiltX)

            gl.uniform1f(uTiltYLoc, p.tiltY)

            gl.uniform1f(uSpinLoc, stateRef.current.spin)

            gl.uniform1f(uPulseLoc, p.pulse)



            const [br, bg, bb] = parseHexColor(p.baseColor)

            const [ar, ag, ab] = parseHexColor(p.accentColor)

            gl.uniform3f(uBaseColorLoc, br, bg, bb)

            gl.uniform3f(uAccentColorLoc, ar, ag, ab)

            gl.uniform1f(uAccentMixLoc, p.accentMix)



            gl.uniform2f(

                uCursorNDCLoc,

                stateRef.current.cursorNDC[0],

                stateRef.current.cursorNDC[1]

            )

            gl.uniform1f(uHoverLoc, p.hover)

            gl.uniform1f(uHoverActiveLoc, stateRef.current.hoverActive)



            gl.clearColor(0, 0, 0, 0)

            gl.clear(gl.COLOR_BUFFER_BIT)

            gl.drawArrays(gl.POINTS, 0, particleCount)



            raf = requestAnimationFrame(loop)

        }

        raf = requestAnimationFrame(loop)



        return () => {

            cancelAnimationFrame(raf)

            ro.disconnect()

            hoverAnim?.stop()

            host.removeEventListener("pointermove", onPointerMove)

            host.removeEventListener("pointerenter", onPointerEnter)

            host.removeEventListener("pointerleave", onPointerLeave)

            host.removeEventListener("pointerdown", onPointerDown)

            window.removeEventListener("pointerup", onPointerUp)

            // Never call gl.getExtension("WEBGL_lose_context")?.loseContext()

        }

    }, [])



    return (

        <div

            ref={hostRef}

            style={{

                width: "100%",

                height: "100%",

                position: "relative",

                overflow: "hidden",

                background,

                boxShadow: glow ? `0 0 120px ${glow}` : undefined,

                ...style,

            }}

        >

            <canvas

                ref={canvasRef}

                style={{

                    display: "block",

                    width: "100%",

                    height: "100%",

                    touchAction: "none",

                    cursor: "grab",

                }}

            />

        </div>

    )

}



const __originkitPresetProps = {

  "tilt": {

    "x": 0,

    "y": 90

  },

  "helix": {

    "pulse": 40,

    "turns": 2,

    "thickness": 21

  }

};



export default function PointDNAHelix(props: Record<string, unknown>) {

  return <__OriginkitBase_PointDNAHelix {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;

}

