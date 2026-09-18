// Ocean Swell — UI HUB

"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"

const TRACE_STEPS = 68

const TRACE_WAVES = 4

const DETAIL_WAVES = 7

const DEFAULTS = {
    deep: "#04222E",
    shallow: "#1E7F86",
    scatter: "#CCCFCE",
    foam: "#F2FAFF",
    zenith: "#2C5C8E",
    horizon: "#FAF5B4",
    swell: 1,
    choppy: 20,
    detail: 20,
    glitter: 20,
    subsurface: 20,
    foamAmount: 20,
    cloud: 20,
    haze: 0,
    speed: 5,
    drag: 20,
    sizePercent: 200,
}

type Config = {
    deep: string
    shallow: string
    scatter: string
    foam: string
    zenith: string
    horizon: string
    swell: number
    choppy: number
    detail: number
    glitter: number
    subsurface: number
    foamAmount: number
    cloud: number
    haze: number
    speed: number
    drag: number
    sizePercent: number
}

const MAX_PITCH = 0.5

const SUN_COLOR = "#FFF0D2"

const SUN_HEIGHT = 0.315

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

function settingsFor(cfg: Config) {
    const swell = clamp(cfg.swell, 1, 20, DEFAULTS.swell)
    return {
        swell: 0.25 + swell * 0.13,

        choppy: clamp(cfg.choppy, 0, 20, DEFAULTS.choppy) * 0.045,

        detail: 0.06 + clamp(cfg.detail, 1, 20, DEFAULTS.detail) * 0.028,
        sunHeight: SUN_HEIGHT,

        glitter: 40.0 + clamp(cfg.glitter, 1, 20, DEFAULTS.glitter) * 90.0,
        subsurface: clamp(cfg.subsurface, 0, 20, DEFAULTS.subsurface) * 0.09,
        foamAmount: clamp(cfg.foamAmount, 0, 20, DEFAULTS.foamAmount) * 0.055,
        cloud: clamp(cfg.cloud, 0, 20, DEFAULTS.cloud) * 0.05,

        haze: 0.0006 + clamp(cfg.haze, 0, 20, DEFAULTS.haze) * 0.0011,
        speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.14,
        drag: clamp(cfg.drag, 0, 20, DEFAULTS.drag) * 0.0006,
        focal: 1.35 * (100 / clamp(cfg.sizePercent, 40, 200, 100)),
    }
}

const QUAD_VERTEX =  `
varying vec2 vUv;
void main() {
    vUv = uv;

    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const OCEAN_FRAGMENT =  `
precision highp float;

varying vec2 vUv;

uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uShallow;
uniform vec3 uScatter;
uniform vec3 uFoam;
uniform vec3 uSun;
uniform vec3 uZenith;
uniform vec3 uHorizon;
uniform float uSwell;
uniform float uChoppy;
uniform float uDetail;
uniform float uSunHeight;
uniform float uGlitter;
uniform float uSubsurface;
uniform float uFoamAmount;
uniform float uCloud;
uniform float uHaze;
uniform float uFocal;
uniform float uYaw;
uniform float uPitch;
uniform float uCamY;

#define TRACE_STEPS ${TRACE_STEPS}
#define TRACE_WAVES ${TRACE_WAVES}
#define DETAIL_WAVES ${DETAIL_WAVES}

const float FAR = 900.0;

const float TURN = 2.39996323;

float hash21(vec2 p) {
    p = fract(p * vec2(127.31, 311.7));
    p += dot(p, p + 42.17);
    return fract(p.x * p.y);
}

float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
               mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x), u.y);
}

float seaHeight(vec2 p, int waveCount) {
    float amp = uSwell;
    float freq = uDetail;
    float ang = 0.6;
    float total = 0.0;
    float norm = 0.0;

    for (int i = 0; i < DETAIL_WAVES; i++) {
        if (i >= waveCount) break;
        vec2 dir = vec2(cos(ang), sin(ang));

        float x = dot(dir, p) * freq + uTime * (2.4 / sqrt(freq * 8.0 + 1.0));

        float w = exp(sin(x) - 1.0);
        total += w * amp;
        norm += amp;

        p -= dir * cos(x) * amp * uChoppy;
        amp *= 0.57;
        freq *= 1.93;
        ang += TURN;
    }

    return total - norm * 0.4658;
}

vec3 sunDir() {
    return normalize(vec3(0.62, sin(uSunHeight), -0.78));
}

vec3 sky(vec3 rd) {
    float up = clamp(rd.y, 0.0, 1.0);
    vec3 col = mix(uHorizon, uZenith, pow(up, 0.42));

    if (uCloud > 0.0 && rd.y > 0.005) {
        vec2 cp = rd.xz / rd.y * 0.55 + vec2(uTime * 0.03, 0.0);
        float n = vnoise(cp) * 0.55 + vnoise(cp * 2.3 + 4.1) * 0.3 + vnoise(cp * 5.1) * 0.15;
        float deck = smoothstep(0.48, 0.78, n) * smoothstep(0.0, 0.22, rd.y);
        col = mix(col, mix(uHorizon, vec3(1.0), 0.55), deck * uCloud * 4.0);
    }

    vec3 sd = sunDir();
    float d = max(dot(rd, sd), 0.0);

    col += uSun * pow(d, 1400.0) * 9.0;
    col += uSun * pow(d, 8.0) * 0.22;
    return col;
}

bool traceSea(vec3 ro, vec3 rd, out float tHit) {
    float crest = uSwell * 2.4;
    tHit = 0.0;
    if (rd.y >= 0.0 && ro.y > crest) return false;

    float t = 0.0;

    if (ro.y > crest && rd.y < 0.0) t = (crest - ro.y) / rd.y;

    float lastT = t;
    float lastGap = ro.y + rd.y * t - seaHeight((ro + rd * t).xz, TRACE_WAVES);

    for (int i = 0; i < TRACE_STEPS; i++) {
        vec3 p = ro + rd * t;
        float gap = p.y - seaHeight(p.xz, TRACE_WAVES);
        if (gap < 0.0) {
            tHit = lastT + (t - lastT) * lastGap / max(lastGap - gap, 1e-4);
            return true;
        }
        lastGap = gap;
        lastT = t;
        t += max(gap * 0.62, t * 0.014 + 0.05);
        if (t > FAR) return false;
    }
    return false;
}

vec3 seaNormal(vec3 p, float t) {
    float e = max(0.012, t * 0.0035);
    float h = seaHeight(p.xz, DETAIL_WAVES);
    float hx = seaHeight(p.xz + vec2(e, 0.0), DETAIL_WAVES);
    float hz = seaHeight(p.xz + vec2(0.0, e), DETAIL_WAVES);
    return normalize(vec3(h - hx, e, h - hz));
}

void main() {
    vec2 frag = (vUv * uResolution - 0.5 * uResolution) / uResolution.y;

    vec3 origin = vec3(sin(uTime * 0.11) * 12.0, uCamY, uTime * 4.0);

    float cy = cos(uYaw), sy = sin(uYaw);
    float cp = cos(uPitch), sp = sin(uPitch);
    vec3 fwd = normalize(vec3(sy * cp, sp, cy * cp));
    vec3 right = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
    vec3 up = cross(fwd, right);
    vec3 rd = normalize(frag.x * right + frag.y * up + uFocal * fwd);

    vec3 col;
    float t;

    if (traceSea(origin, rd, t)) {
        vec3 p = origin + rd * t;
        vec3 nrm = seaNormal(p, t);

        nrm = normalize(mix(nrm, vec3(0.0, 1.0, 0.0), clamp(t * 0.004, 0.0, 0.92)));

        vec3 sd = sunDir();
        vec3 refl = reflect(rd, nrm);

        refl.y = abs(refl.y);

        float facing = max(dot(-rd, nrm), 0.0);
        float fres = 0.02 + 0.98 * pow(1.0 - facing, 5.0);

        float height = clamp(p.y / max(uSwell, 0.001) * 0.5 + 0.5, 0.0, 1.0);
        vec3 body = mix(uDeep, uShallow, height * 0.7);

        float thin = pow(clamp(p.y / max(uSwell, 0.001), 0.0, 1.0), 2.0);
        body += uScatter * thin * uSubsurface * (0.3 + 0.7 * pow(1.0 - facing, 2.0));

        vec3 spec = uSun * pow(max(dot(refl, sd), 0.0), uGlitter) * 5.0;

        col = mix(body, sky(refl), fres) + spec;

        if (uFoamAmount > 0.0) {
            float steep = 1.0 - nrm.y;
            float churn = vnoise(p.xz * 1.7 + uTime * 0.6) * 0.6
                        + vnoise(p.xz * 5.3 - uTime * 0.9) * 0.4;
            float f = smoothstep(0.16, 0.42, steep * 2.4 * uFoamAmount * 2.0 + churn * 0.35 - 0.25);

            col = mix(col, uFoam * (0.72 + churn * 0.35), f * clamp(uFoamAmount * 2.4, 0.0, 1.0));
        }

        float f = 1.0 - exp(-pow(t * uHaze, 1.6));
        col = mix(col, sky(rd), clamp(f, 0.0, 1.0));
    } else {
        col = sky(rd);
    }

    col = col / (col + vec3(0.9)) * 1.45;
    col = pow(max(col, 0.0), vec3(0.92));

    gl_FragColor = vec4(col, 1.0);
}
`

class OceanSwellScene {
    private container: HTMLElement
    private cfg: Config
    private renderer: THREE.WebGLRenderer
    private scene = new THREE.Scene()
    private camera = new THREE.Camera()
    private geometry = new THREE.PlaneGeometry(2, 2)
    private material: THREE.ShaderMaterial
    private mesh: THREE.Mesh

    private time = 0
    private yaw = 0
    private pitch = -0.05
    private velYaw = 0
    private velPitch = 0
    private isDragging = false
    private lastX = 0
    private lastY = 0

    private frameId = 0
    private lastT = 0
    private disposed = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg
        const S = settingsFor(cfg)

        this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false })

        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.setClearColor(0x000000, 1)
        const el = this.renderer.domElement
        el.style.position = "absolute"
        el.style.inset = "0"
        el.style.width = "100%"
        el.style.height = "100%"
        el.style.touchAction = "none"
        el.style.cursor = S.drag > 0 ? "grab" : "default"
        container.appendChild(el)

        this.material = new THREE.ShaderMaterial({
            vertexShader: QUAD_VERTEX,
            fragmentShader: OCEAN_FRAGMENT,
            uniforms: {
                uResolution: { value: new THREE.Vector2(1, 1) },
                uTime: { value: 0 },
                uDeep: { value: new THREE.Color(cfg.deep) },
                uShallow: { value: new THREE.Color(cfg.shallow) },
                uScatter: { value: new THREE.Color(cfg.scatter) },
                uFoam: { value: new THREE.Color(cfg.foam) },

                uSun: { value: new THREE.Color(SUN_COLOR) },
                uZenith: { value: new THREE.Color(cfg.zenith) },
                uHorizon: { value: new THREE.Color(cfg.horizon) },
                uSwell: { value: S.swell },
                uChoppy: { value: S.choppy },
                uDetail: { value: S.detail },
                uSunHeight: { value: S.sunHeight },
                uGlitter: { value: S.glitter },
                uSubsurface: { value: S.subsurface },
                uFoamAmount: { value: S.foamAmount },
                uCloud: { value: S.cloud },
                uHaze: { value: S.haze },
                uFocal: { value: S.focal },
                uYaw: { value: 0 },
                uPitch: { value: this.pitch },

                uCamY: { value: 1.8 + S.swell * 2.6 },
            },
            depthTest: false,
            depthWrite: false,
        })

        this.mesh = new THREE.Mesh(this.geometry, this.material)
        this.mesh.frustumCulled = false
        this.scene.add(this.mesh)
        this.bindEvents()
    }

    private bindEvents() {
        const el = this.renderer.domElement

        const down = (e: PointerEvent) => {
            if (settingsFor(this.cfg).drag <= 0) return
            this.isDragging = true
            this.lastX = e.clientX
            this.lastY = e.clientY
            this.velYaw = 0
            this.velPitch = 0
            el.style.cursor = "grabbing"
        }
        const move = (e: PointerEvent) => {
            if (!this.isDragging) return
            const dx = e.clientX - this.lastX
            const dy = e.clientY - this.lastY
            this.lastX = e.clientX
            this.lastY = e.clientY
            const s = settingsFor(this.cfg).drag
            this.yaw -= dx * s
            this.pitch += dy * s

            this.velYaw = -dx * s
            this.velPitch = dy * s
        }
        const up = () => {
            if (!this.isDragging) return
            this.isDragging = false
            el.style.cursor = settingsFor(this.cfg).drag > 0 ? "grab" : "default"
        }

        el.addEventListener("pointerdown", down)

        window.addEventListener("pointermove", move)
        window.addEventListener("pointerup", up)
        window.addEventListener("pointercancel", up)

        this.unbind = () => {
            el.removeEventListener("pointerdown", down)
            window.removeEventListener("pointermove", move)
            window.removeEventListener("pointerup", up)
            window.removeEventListener("pointercancel", up)
        }
    }

    private unbind = () => {}

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
        this.renderer.setSize(width, height, false)
        this.material.uniforms.uResolution.value.set(width, height)
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        this.cfg = cfg
        const S = settingsFor(cfg)
        const u = this.material.uniforms

        u.uDeep.value.set(cfg.deep || DEFAULTS.deep)
        u.uShallow.value.set(cfg.shallow || DEFAULTS.shallow)
        u.uScatter.value.set(cfg.scatter || DEFAULTS.scatter)
        u.uFoam.value.set(cfg.foam || DEFAULTS.foam)
        u.uZenith.value.set(cfg.zenith || DEFAULTS.zenith)
        u.uHorizon.value.set(cfg.horizon || DEFAULTS.horizon)
        u.uSwell.value = S.swell
        u.uChoppy.value = S.choppy
        u.uDetail.value = S.detail
        u.uSunHeight.value = S.sunHeight
        u.uGlitter.value = S.glitter
        u.uSubsurface.value = S.subsurface
        u.uFoamAmount.value = S.foamAmount
        u.uCloud.value = S.cloud
        u.uHaze.value = S.haze
        u.uFocal.value = S.focal
        u.uCamY.value = 1.8 + S.swell * 2.6
        if (!this.isDragging) {
            this.renderer.domElement.style.cursor = S.drag > 0 ? "grab" : "default"
        }
    }

    private step() {
        if (this.disposed) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0

        if (dt > 0.05) dt = 0.05

        const S = settingsFor(this.cfg)
        this.time += dt * S.speed

        if (!this.isDragging) {
            const decay = Math.exp(-dt * 3)
            this.yaw += this.velYaw
            this.pitch += this.velPitch
            this.velYaw *= decay
            this.velPitch *= decay
        }
        this.pitch = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, this.pitch))

        const u = this.material.uniforms
        u.uTime.value = this.time
        u.uYaw.value = this.yaw
        u.uPitch.value = this.pitch
        this.renderer.render(this.scene, this.camera)
    }

    dispose() {
        this.disposed = true
        cancelAnimationFrame(this.frameId)
        this.unbind()
        this.geometry.dispose()
        this.material.dispose()
        this.renderer.dispose()
        const el = this.renderer.domElement
        if (el.parentNode === this.container) this.container.removeChild(el)
    }
}

export interface OceanSwellProps {
    deep?: string
    shallow?: string
    scatter?: string
    foam?: string
    zenith?: string
    horizon?: string
    swell?: number
    choppy?: number
    detail?: number
    glitter?: number
    subsurface?: number
    foamAmount?: number
    cloud?: number
    haze?: number
    speed?: number
    drag?: number
    sizePercent?: number
    style?: React.CSSProperties
}

function __OceanSwellBase(props: OceanSwellProps) {
    const {
        deep = DEFAULTS.deep,
        shallow = DEFAULTS.shallow,
        scatter = DEFAULTS.scatter,
        foam = DEFAULTS.foam,
        zenith = DEFAULTS.zenith,
        horizon = DEFAULTS.horizon,
        swell = DEFAULTS.swell,
        choppy = DEFAULTS.choppy,
        detail = DEFAULTS.detail,
        glitter = DEFAULTS.glitter,
        subsurface = DEFAULTS.subsurface,
        foamAmount = DEFAULTS.foamAmount,
        cloud = DEFAULTS.cloud,
        haze = DEFAULTS.haze,
        speed = DEFAULTS.speed,
        drag = DEFAULTS.drag,
        sizePercent = DEFAULTS.sizePercent,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<OceanSwellScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        deep,
        shallow,
        scatter,
        foam,
        zenith,
        horizon,
        swell,
        choppy,
        detail,
        glitter,
        subsurface,
        foamAmount,
        cloud,
        haze,
        speed,
        drag,
        sizePercent,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: OceanSwellScene
        try {
            scene = new OceanSwellScene(container, cfgRef.current)
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
        deep,
        shallow,
        scatter,
        foam,
        zenith,
        horizon,
        swell,
        choppy,
        detail,
        glitter,
        subsurface,
        foamAmount,
        cloud,
        haze,
        speed,
        drag,
        sizePercent,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Open ocean swell seen from just above the water"
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

OceanSwell.displayName = "Ocean Swell"

const __defaultProps = {
  "deep": "#04222E",
  "shallow": "#1E7F86",
  "scatter": "#CCCFCE",
  "foam": "#F2FAFF",
  "zenith": "#2C5C8E",
  "horizon": "#FAF5B4",
  "swell": 1,
  "choppy": 20,
  "detail": 20,
  "glitter": 20,
  "subsurface": 20,
  "foamAmount": 20,
  "cloud": 20,
  "speed": 5,
  "drag": 20,
  "sizePercent": 200
};

export default function OceanSwell(props: Record<string, unknown>) {
  return <__OceanSwellBase {...(__defaultProps as Record<string, unknown>)} {...props} />;
}