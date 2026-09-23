// Ember Husk — UI HUB

"use client"

import { useEffect, useRef } from "react"
import type { CSSProperties } from "react"
import * as THREE from "three"

const DEFAULT_BACKGROUND = {
    color: "#1A0402",
    glowColor: "#FF2606",
    glow: 6,
}

const DEFAULT_STRUCTURE = {
    shards: 11,
    irregularity: 6,
    thickness: 5,
}

const DEFAULT_ROCK = {
    color: "#171512",
    weathering: 5,
    seam: 4,
}

const DEFAULT_CORE = {
    color: "#FF3B00",
    hotColor: "#FFC46A",
    intensity: 6,
    flow: 5,
}

const DEFAULT_DEBRIS = {
    count: 54,
    size: 5,
    spread: 5,
}

const DEFAULT_CROSSES = {
    count: 52,
    size: 5,
    thickness: 5,
    color: "#EDEFF5",
    spread: 5,
}

const DEFAULT_ENTRANCE = {
    scatter: 6,
    tumble: 6,
    stagger: 4,
}

const DEFAULT_RESPONSE = {
    reach: 5,
    strength: 5,
    repel: 6,
    settle: 5,
}

const DEFAULT_DRIFT = {
    spin: 3,
    bob: 4,
    sway: 4,
}

const DEFAULT_GLOW = {
    strength: 5,
    radius: 5,
    threshold: 5,
}

const DEFAULTS = {
    size: 3.7,
    beads: 5,
    quality: "high",
}

export interface EmberHuskBackground {
    color?: string

    glowColor?: string

    glow?: number
}

export interface EmberHuskStructure {
    shards?: number

    irregularity?: number

    thickness?: number
}

export interface EmberHuskRock {
    color?: string

    weathering?: number

    seam?: number
}

export interface EmberHuskCore {
    color?: string

    hotColor?: string

    intensity?: number

    flow?: number
}

export interface EmberHuskDebris {
    count?: number

    size?: number

    spread?: number
}

export interface EmberHuskCrosses {
    count?: number

    size?: number

    thickness?: number

    color?: string

    spread?: number
}

export interface EmberHuskEntrance {
    scatter?: number

    tumble?: number

    stagger?: number
}

export interface EmberHuskResponse {
    reach?: number

    strength?: number

    repel?: number

    settle?: number
}

export interface EmberHuskDrift {
    spin?: number

    bob?: number

    sway?: number
}

export interface EmberHuskGlow {
    strength?: number

    radius?: number

    threshold?: number
}

export interface EmberHuskProps {
    background?: EmberHuskBackground

    size?: number
    structure?: EmberHuskStructure
    rock?: EmberHuskRock
    core?: EmberHuskCore
    crosses?: EmberHuskCrosses
    debris?: EmberHuskDebris

    beads?: number
    entrance?: EmberHuskEntrance
    response?: EmberHuskResponse
    drift?: EmberHuskDrift
    glow?: EmberHuskGlow

    quality?: "low" | "medium" | "high"
    style?: CSSProperties
}

const R = 1

const FOV = 40

const KEY_DIR = new THREE.Vector3(2, 8, 4).normalize()
const FILL_DIR = new THREE.Vector3(0.72, -0.12, -0.62).normalize()

const BOUNCE_DIR = new THREE.Vector3(0, -4, 1).normalize()

const HULL_PLANES = 26

const PHYS_STEP = 1 / 120
const MAX_SUBSTEPS = 5

const DAMPING = 0.88

const FROZEN_TIME = 8

const MAX_SHARDS = 24
const MAX_CROSSES = 260
const MAX_DEBRIS = 160
const MAX_BEADS = 24

function randomQuat(rng: () => number): THREE.Quaternion {
    const u = rng()
    const v = rng() * Math.PI * 2
    const w = rng() * Math.PI * 2
    const a = Math.sqrt(1 - u)
    const b = Math.sqrt(u)
    return new THREE.Quaternion(
        a * Math.sin(v),
        a * Math.cos(v),
        b * Math.sin(w),
        b * Math.cos(w)
    )
}

function makeRng(seed: number): () => number {
    let a = seed >>> 0
    return () => {
        a = (a + 0x6d2b79f5) >>> 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

function randomDir(rng: () => number): THREE.Vector3 {
    const z = rng() * 2 - 1
    const a = rng() * Math.PI * 2
    const r = Math.sqrt(Math.max(0, 1 - z * z))
    return new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, z)
}

function fibonacciDirs(n: number): THREE.Vector3[] {
    const out: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < n; i++) {
        const y = 1 - (i / Math.max(1, n - 1)) * 2
        const r = Math.sqrt(Math.max(0, 1 - y * y))
        const th = golden * i
        out.push(new THREE.Vector3(Math.cos(th) * r, y, Math.sin(th) * r))
    }
    return out
}

interface Face {
    n: THREE.Vector3
    pts: THREE.Vector3[]
}

const CLIP_EPS = 1e-7

function boxFaces(h: number): Face[] {
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z)
    return [
        { n: v(1, 0, 0), pts: [v(h, -h, -h), v(h, h, -h), v(h, h, h), v(h, -h, h)] },
        { n: v(-1, 0, 0), pts: [v(-h, -h, h), v(-h, h, h), v(-h, h, -h), v(-h, -h, -h)] },
        { n: v(0, 1, 0), pts: [v(-h, h, -h), v(-h, h, h), v(h, h, h), v(h, h, -h)] },
        { n: v(0, -1, 0), pts: [v(-h, -h, h), v(-h, -h, -h), v(h, -h, -h), v(h, -h, h)] },
        { n: v(0, 0, 1), pts: [v(-h, -h, h), v(h, -h, h), v(h, h, h), v(-h, h, h)] },
        { n: v(0, 0, -1), pts: [v(h, -h, -h), v(-h, -h, -h), v(-h, h, -h), v(h, h, -h)] },
    ]
}

function clipConvex(faces: Face[], n: THREE.Vector3, d: number): Face[] {
    const out: Face[] = []
    const cut: THREE.Vector3[] = []

    for (const f of faces) {
        const pts = f.pts
        const m = pts.length
        const kept: THREE.Vector3[] = []
        for (let i = 0; i < m; i++) {
            const a = pts[i]
            const b = pts[(i + 1) % m]
            const da = a.dot(n) - d
            const db = b.dot(n) - d
            if (da <= CLIP_EPS) kept.push(a)
            if ((da < -CLIP_EPS && db > CLIP_EPS) || (da > CLIP_EPS && db < -CLIP_EPS)) {
                const t = da / (da - db)
                const p = a.clone().lerp(b, t)
                kept.push(p)
                cut.push(p)
            }
        }
        if (kept.length >= 3) out.push({ n: f.n.clone(), pts: kept })
    }

    if (cut.length >= 3) {
        const c = new THREE.Vector3()
        for (const p of cut) c.add(p)
        c.multiplyScalar(1 / cut.length)

        const helper =
            Math.abs(n.x) < 0.9
                ? new THREE.Vector3(1, 0, 0)
                : new THREE.Vector3(0, 1, 0)
        const u = new THREE.Vector3().crossVectors(n, helper).normalize()
        const w = new THREE.Vector3().crossVectors(n, u)

        const ranked = cut
            .map((p) => {
                const rel = p.clone().sub(c)
                return { p, a: Math.atan2(rel.dot(w), rel.dot(u)) }
            })
            .sort((x, y) => x.a - y.a)

        const ring: THREE.Vector3[] = []
        for (const r of ranked) {
            const last = ring[ring.length - 1]
            if (!last || last.distanceToSquared(r.p) > 1e-12) ring.push(r.p)
        }
        if (ring.length >= 3 && ring[0].distanceToSquared(ring[ring.length - 1]) < 1e-12) {
            ring.pop()
        }
        if (ring.length >= 3) out.push({ n: n.clone(), pts: ring })
    }

    return out
}

interface Slab {
    geometry: THREE.BufferGeometry

    home: THREE.Vector3

    dir: THREE.Vector3
}

function buildHusk(
    shards: number,
    irregularity: number,
    thickness: number
): { slabs: Slab[]; inner: number } {
    const rng = makeRng(0x9e3779b9)
    const count = Math.max(3, Math.min(MAX_SHARDS, Math.round(shards)))

    const inner = THREE.MathUtils.lerp(0.62, 0.28, THREE.MathUtils.clamp(thickness, 0, 10) / 10)
    const amp = 0.06 + (THREE.MathUtils.clamp(irregularity, 0, 10) / 10) * 0.42

    const hull = fibonacciDirs(HULL_PLANES).map((dir) => ({
        n: dir,
        d: R * (1 - amp * 0.5 + rng() * amp),
    }))

    const spread = 0.15 + (THREE.MathUtils.clamp(irregularity, 0, 10) / 10) * 0.45
    const seeds = fibonacciDirs(count).map((dir) => {
        const jitter = new THREE.Vector3(
            rng() - 0.5,
            rng() - 0.5,
            rng() - 0.5
        ).multiplyScalar(spread)
        const axis = dir.clone().add(jitter).normalize()
        return axis.multiplyScalar(R * (0.7 + rng() * 0.5))
    })

    const slabs: Slab[] = []

    for (let i = 0; i < seeds.length; i++) {
        const si = seeds[i]
        const axis = si.clone().normalize()

        let faces = boxFaces(R * 2.4)
        for (const h of hull) faces = clipConvex(faces, h.n, h.d)
        for (let j = 0; j < seeds.length; j++) {
            if (j === i) continue
            const n = seeds[j].clone().sub(si)
            const len = n.length()
            if (len < 1e-6) continue
            n.multiplyScalar(1 / len)
            const mid = seeds[j].clone().add(si).multiplyScalar(0.5)
            faces = clipConvex(faces, n, mid.dot(n))
        }

        faces = clipConvex(faces, axis.clone().negate(), -inner * R)
        if (faces.length < 4) continue

        const centroid = new THREE.Vector3()
        let n = 0
        for (const f of faces) {
            for (const p of f.pts) {
                centroid.add(p)
                n++
            }
        }
        if (n === 0) continue
        centroid.multiplyScalar(1 / n)

        const slabValue = rng()

        const pos: number[] = []
        const nor: number[] = []
        const rest: number[] = []
        const seed: number[] = []
        const ab = new THREE.Vector3()
        const ac = new THREE.Vector3()
        const fn = new THREE.Vector3()

        for (const f of faces) {
            const pts = f.pts
            for (let k = 1; k + 1 < pts.length; k++) {
                const a = pts[0]
                const b = pts[k]
                const c = pts[k + 1]
                ab.subVectors(b, a)
                ac.subVectors(c, a)
                fn.crossVectors(ab, ac)
                const area = fn.length()
                if (area < 1e-10) continue
                fn.multiplyScalar(1 / area)

                const mid = a.clone().add(b).add(c).multiplyScalar(1 / 3)
                const flip = fn.dot(mid.clone().sub(centroid)) < 0
                const tri = flip ? [a, c, b] : [a, b, c]
                if (flip) fn.negate()
                for (const v of tri) {
                    pos.push(v.x - centroid.x, v.y - centroid.y, v.z - centroid.z)
                    nor.push(fn.x, fn.y, fn.z)
                    rest.push(v.x, v.y, v.z)
                    seed.push(slabValue)
                }
            }
        }
        if (pos.length < 9) continue

        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
        geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3))
        geometry.setAttribute("aRest", new THREE.Float32BufferAttribute(rest, 3))
        geometry.setAttribute("aSlab", new THREE.Float32BufferAttribute(seed, 1))

        slabs.push({
            geometry,
            home: centroid.clone(),
            dir: centroid.clone().normalize(),
        })
    }

    return { slabs, inner }
}

const CROSS_ARM = 0.5
const CROSS_WAIST = 1 / 6

const CROSS_DEPTH = 1 / 15

const CROSS_BEVEL = 0.016

function buildCrossGeometry(depth: number): THREE.BufferGeometry {
    const A = CROSS_ARM
    const W = CROSS_WAIST
    const T = Math.max(0.004, depth)

    const B = Math.min(CROSS_BEVEL, T * 0.35)

    const pos: number[] = []
    const nor: number[] = []

    const tri = (
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3
    ) => {
        const ab = new THREE.Vector3().subVectors(b, a)
        const ac = new THREE.Vector3().subVectors(c, a)
        const n = new THREE.Vector3().crossVectors(ab, ac)
        if (n.lengthSq() < 1e-12) return
        n.normalize()
        const mid = a.clone().add(b).add(c).multiplyScalar(1 / 3)

        const flip = n.dot(mid) < 0
        const v = flip ? [a, c, b] : [a, b, c]
        if (flip) n.negate()
        for (const p of v) {
            pos.push(p.x, p.y, p.z)
            nor.push(n.x, n.y, n.z)
        }
    }

    const quad = (
        a: THREE.Vector3,
        b: THREE.Vector3,
        c: THREE.Vector3,
        d: THREE.Vector3
    ) => {
        tri(a, b, c)
        tri(a, c, d)
    }

    const outlineOf = (a: number, w: number): [number, number][] => [
        [w, a],
        [w, w],
        [a, w],
        [a, -w],
        [w, -w],
        [w, -a],
        [-w, -a],
        [-w, -w],
        [-a, -w],
        [-a, w],
        [-w, w],
        [-w, a],
    ]

    const ai = A - B
    const wi = W - B
    const rects: [number, number, number, number][] = [
        [-wi, wi, -ai, ai],
        [-ai, -wi, -wi, wi],
        [wi, ai, -wi, wi],
    ]
    for (const z of [T, -T]) {
        for (const [x0, x1, y0, y1] of rects) {
            quad(
                new THREE.Vector3(x0, y0, z),
                new THREE.Vector3(x1, y0, z),
                new THREE.Vector3(x1, y1, z),
                new THREE.Vector3(x0, y1, z)
            )
        }
    }

    const outer = outlineOf(A, W)
    const inner = outlineOf(ai, wi)
    const zs = T - B
    for (let i = 0; i < outer.length; i++) {
        const [x0, y0] = outer[i]
        const [x1, y1] = outer[(i + 1) % outer.length]
        quad(
            new THREE.Vector3(x0, y0, -zs),
            new THREE.Vector3(x1, y1, -zs),
            new THREE.Vector3(x1, y1, zs),
            new THREE.Vector3(x0, y0, zs)
        )

        const [u0, v0] = inner[i]
        const [u1, v1] = inner[(i + 1) % inner.length]
        quad(
            new THREE.Vector3(x0, y0, zs),
            new THREE.Vector3(x1, y1, zs),
            new THREE.Vector3(u1, v1, T),
            new THREE.Vector3(u0, v0, T)
        )
        quad(
            new THREE.Vector3(x1, y1, -zs),
            new THREE.Vector3(x0, y0, -zs),
            new THREE.Vector3(u0, v0, -T),
            new THREE.Vector3(u1, v1, -T)
        )
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    geometry.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3))
    return geometry
}

function buildDebrisGeometry(): THREE.BufferGeometry {
    const geo = new THREE.DodecahedronGeometry(1, 0)
    const pos = geo.getAttribute("position") as THREE.BufferAttribute
    const rng = makeRng(0x27d4eb2f)

    const moved = new Map<string, THREE.Vector3>()
    const v = new THREE.Vector3()
    for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i)
        const key = v.x.toFixed(4) + "|" + v.y.toFixed(4) + "|" + v.z.toFixed(4)
        let out = moved.get(key)
        if (!out) {
            out = v
                .clone()
                .multiplyScalar(0.58 + rng() * 0.62)
                .add(
                    new THREE.Vector3(
                        rng() - 0.5,
                        rng() - 0.5,
                        rng() - 0.5
                    ).multiplyScalar(0.26)
                )
            moved.set(key, out)
        }
        pos.setXYZ(i, out.x, out.y, out.z)
    }
    pos.needsUpdate = true

    geo.computeVertexNormals()
    return geo
}

const NOISE_GLSL = `
float hash31(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float vnoise(vec3 x) {
    vec3 i = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(mix(hash31(i + vec3(0.0, 0.0, 0.0)), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),
            mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
        mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),
            mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.1, 1.0)), f.x), f.y),
        f.z);
}

float fbm(vec3 p) {
    float a = 0.5;
    float s = 0.0;
    for (int i = 0; i < 5; i++) {
        s += a * vnoise(p);
        p *= 2.03;
        a *= 0.5;
    }
    return s;
}
`

const LIGHT_GLSL = `
uniform vec3 uKeyDir;
uniform vec3 uFillDir;
uniform vec3 uBounceDir;
uniform vec3 uGroundColor;
uniform vec3 uLavaColor;
uniform float uLavaPower;
uniform vec3 uCenter;

vec3 shade(vec3 P, vec3 N, vec3 V, vec3 albedo, float spec, float gloss, float ground) {
    float key = max(dot(N, uKeyDir), 0.0);
    vec3 col = albedo * key * 2.05;

    col += albedo * max(dot(N, uFillDir), 0.0) * vec3(0.2, 0.235, 0.35);

    // The bounce off the fire, as a directional rather than a second
    // hemisphere: the reference's underlight has a direction to it --
    // undersides angled toward the viewer are hotter than ones angled
    // away -- and a hemisphere cannot say that.
    col += albedo * max(dot(N, uBounceDir), 0.0) * uGroundColor * 1.55 * ground;

    // Hemisphere over the top of it, for the ambient the bounce misses.
    float up = N.y * 0.5 + 0.5;
    col += albedo * mix(uGroundColor * 0.42 * ground, vec3(0.078, 0.085, 0.108), up);

    // The melt in the hollow, as a point light. Falls off fast so the
    // slabs nearest the middle are the ones that catch it.
    vec3 toCore = uCenter - P;
    float dist = max(length(toCore), 0.0001);
    vec3 L = toCore / dist;
    float atten = 1.0 / (1.0 + dist * dist * 3.2);
    col += albedo * uLavaColor * max(dot(N, L), 0.0) * atten * uLavaPower * 5.5 * ground;

    vec3 H = normalize(uKeyDir + V);
    col += vec3(1.0) * pow(max(dot(N, H), 0.0), gloss) * spec;

    return col;
}
`

const ROCK_VERT = `
attribute vec3 aRest;
attribute float aSlab;
varying float vSlab;
varying vec3 vRest;
varying vec3 vN;
varying vec3 vW;

void main() {
    vRest = aRest;
    vSlab = aSlab;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const ROCK_FRAG = `
precision highp float;

varying float vSlab;
varying vec3 vRest;
varying vec3 vN;
varying vec3 vW;

uniform vec3 uRockColor;
uniform float uWeathering;
uniform vec3 uHotColor;
uniform float uInner;
uniform float uHeat;
uniform float uTime;

${NOISE_GLSL}
${LIGHT_GLSL}

void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);

    float grain = fbm(vRest * 9.0);
    float coarse = fbm(vRest * 1.9 + 11.0);

    float e = 0.035;
    vec3 g = vec3(
        fbm(vRest * 9.0 + vec3(e, 0.0, 0.0)) - grain,
        fbm(vRest * 9.0 + vec3(0.0, e, 0.0)) - grain,
        fbm(vRest * 9.0 + vec3(0.0, 0.0, e)) - grain
    );
    N = normalize(N - (g - N * dot(g, N)) * 5.5);

    float plate = smoothstep(0.44 + (0.5 - vSlab) * 0.28, 0.74, coarse + grain * 0.14);
    vec3 albedo = mix(uRockColor, uRockColor + vec3(0.34, 0.335, 0.325), plate * uWeathering);
    albedo *= (0.86 + grain * 0.38) * (0.42 + vSlab * 1.25);

    vec3 col = shade(vW, N, V, albedo, 0.035, 26.0, 1.0);

    float depth = length(vRest);
    float heat = 1.0 - smoothstep(uInner * 0.96, uInner * 1.55, depth);
    heat *= heat;

    float vein = smoothstep(0.34, 0.78, fbm(vRest * 5.0 + vec3(0.0, uTime * 0.35, 0.0)));
    float melt = heat * (0.35 + vein * 0.9);
    col += mix(uLavaColor, uHotColor, vein * 0.8) * melt * uHeat;

    float fis = vnoise(vRest * 1.6 + 3.7);
    float ridge = 1.0 - abs(fis - 0.5) * 22.0;
    float mask = smoothstep(0.44, 0.74, fbm(vRest * 0.9 + 9.1));
    float line = smoothstep(0.5, 1.0, ridge) * mask;

    float skirt = smoothstep(-1.6, 1.0, ridge) * mask;
    col += mix(uLavaColor, uHotColor, line * 0.8) * (line * 2.6 + skirt * skirt * 0.22) * uHeat * 0.35;

    gl_FragColor = vec4(col, 1.0);
}
`

const DEBRIS_VERT = `
attribute float aSlab;
varying float vSlab;
varying vec3 vRest;
varying vec3 vN;
varying vec3 vW;

void main() {
    vSlab = aSlab;
    vec4 lp = instanceMatrix * vec4(position, 1.0);

    vRest = lp.xyz * 2.6;
    vec4 wp = modelMatrix * lp;
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const CROSS_VERT = `
attribute vec3 aSeedColor;
varying vec3 vN;
varying vec3 vW;
varying vec3 vTint;

void main() {
    vTint = aSeedColor;
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vW = wp.xyz;

    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const CROSS_FRAG = `
precision highp float;

varying vec3 vN;
varying vec3 vW;
varying vec3 vTint;

uniform vec3 uCrossColor;

${LIGHT_GLSL}

void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);

    vec3 albedo = uCrossColor * vTint;

    vec3 col = shade(vW, N, V, albedo, 0.13, 130.0, 0.12);

    col += albedo * vec3(0.088, 0.099, 0.128);

    float rim = pow(1.0 - max(dot(N, V), 0.0), 5.0);
    col += vec3(0.42, 0.44, 0.5) * rim * 0.35;
    gl_FragColor = vec4(col, 1.0);
}
`

const BEAD_VERT = `
varying vec3 vN;
varying vec3 vW;

void main() {
    vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
    vW = wp.xyz;
    vN = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
}
`

const BEAD_FRAG = `
precision highp float;

varying vec3 vN;
varying vec3 vW;

uniform vec3 uKeyDir;
uniform vec3 uGroundColor;
uniform vec3 uLavaColor;
uniform float uLavaPower;
uniform vec3 uCenter;

void main() {
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition - vW);
    vec3 Rv = reflect(-V, N);

    vec3 env = mix(uGroundColor * 1.35, vec3(0.045, 0.05, 0.07), smoothstep(-0.35, 0.45, Rv.y));
    env += vec3(1.0) * pow(max(dot(Rv, uKeyDir), 0.0), 90.0) * 2.4;

    vec3 toCore = normalize(uCenter - vW);
    float dist = max(length(uCenter - vW), 0.0001);
    env += uLavaColor * pow(max(dot(Rv, toCore), 0.0), 8.0) * uLavaPower * 2.2 / (1.0 + dist * dist);

    float fres = pow(1.0 - max(dot(N, V), 0.0), 4.0);
    env += vec3(0.5, 0.52, 0.58) * fres * 0.5;

    gl_FragColor = vec4(env, 1.0);
}
`

const BG_VERT = `
varying vec2 vUvBg;
void main() {
    vUvBg = uv;
    gl_Position = vec4(position.xy, 1.0, 1.0);
}
`

const BG_FRAG = `
precision highp float;
varying vec2 vUvBg;

uniform vec3 uDeep;
uniform vec3 uGlowColor;
uniform float uGlow;
uniform float uAspect;

void main() {
    vec2 q = vUvBg - vec2(0.5, -0.08);

    q.x *= uAspect * 0.62;
    float d = length(q);

    float g = pow(clamp(1.0 - d * 1.02, 0.0, 1.0), 2.7);
    vec3 col = uDeep + uGlowColor * g * uGlow;

    float dither = fract(sin(dot(vUvBg, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
    col += dither * 0.0035;

    gl_FragColor = vec4(col, 1.0);
}
`

const QUAD_VERT = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
}
`

const PREFILTER_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform float uThreshold;
uniform float uKnee;
varying vec2 vUv;

void main() {
    vec3 c = texture2D(tDiffuse, vUv).rgb;
    float lum = max(c.r, max(c.g, c.b));
    float soft = clamp(lum - uThreshold + uKnee, 0.0, 2.0 * uKnee);
    soft = soft * soft / (4.0 * uKnee + 0.0001);
    gl_FragColor = vec4(c * max(soft, lum - uThreshold) / max(lum, 0.0001), 1.0);
}
`

const DOWN_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
varying vec2 vUv;

vec3 tap(float x, float y) {
    return texture2D(tDiffuse, vUv + vec2(x, y) * uTexel).rgb;
}

void main() {
    vec3 a = tap(-2.0,  2.0), b = tap( 0.0,  2.0), c = tap( 2.0,  2.0);
    vec3 d = tap(-2.0,  0.0), e = tap( 0.0,  0.0), f = tap( 2.0,  0.0);
    vec3 g = tap(-2.0, -2.0), h = tap( 0.0, -2.0), i = tap( 2.0, -2.0);
    vec3 j = tap(-1.0,  1.0), k = tap( 1.0,  1.0);
    vec3 l = tap(-1.0, -1.0), m = tap( 1.0, -1.0);

    vec3 sum = e * 0.125;
    sum += (a + c + g + i) * 0.03125;
    sum += (b + d + f + h) * 0.0625;
    sum += (j + k + l + m) * 0.125;
    gl_FragColor = vec4(sum, 1.0);
}
`

const UP_FRAG = `
precision highp float;
uniform sampler2D tDiffuse;
uniform vec2 uTexel;
uniform float uRadius;
varying vec2 vUv;

vec3 tap(float x, float y) {
    return texture2D(tDiffuse, vUv + vec2(x, y) * uTexel * uRadius).rgb;
}

void main() {
    vec3 sum = tap(-1.0,  1.0) + tap(0.0,  1.0) * 2.0 + tap(1.0,  1.0);
    sum += tap(-1.0,  0.0) * 2.0 + tap(0.0,  0.0) * 4.0 + tap(1.0,  0.0) * 2.0;
    sum += tap(-1.0, -1.0) + tap(0.0, -1.0) * 2.0 + tap(1.0, -1.0);
    gl_FragColor = vec4(sum * 0.0625, 1.0);
}
`

const COMPOSITE_FRAG = `
precision highp float;
uniform sampler2D tBase;
uniform sampler2D tBloom;
uniform float uStrength;
varying vec2 vUv;

void main() {
    vec4 base = texture2D(tBase, vUv);
    vec3 bloom = texture2D(tBloom, vUv).rgb * uStrength;
    gl_FragColor = vec4(base.rgb + bloom, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}
`

function merge<T extends object>(base: T, over?: Partial<T>): T {
    const out = { ...base }
    if (!over) return out
    for (const key of Object.keys(over) as (keyof T)[]) {
        const value = over[key]
        if (value !== undefined) out[key] = value as T[keyof T]
    }
    return out
}

const clamp01to10 = (v: number, fallback: number) =>
    Number.isFinite(v) ? THREE.MathUtils.clamp(v, 0, 10) : fallback

interface Params {
    background: Required<EmberHuskBackground>
    size: number
    structure: Required<EmberHuskStructure>
    rock: Required<EmberHuskRock>
    core: Required<EmberHuskCore>
    crosses: Required<EmberHuskCrosses>
    debris: Required<EmberHuskDebris>
    beads: number
    entrance: Required<EmberHuskEntrance>
    response: Required<EmberHuskResponse>
    drift: Required<EmberHuskDrift>
    glow: Required<EmberHuskGlow>
    quality: "low" | "medium" | "high"
}

function makeParams(p: EmberHuskProps): Params {
    const crosses = merge(DEFAULT_CROSSES, p.crosses)
    const debris = merge(DEFAULT_DEBRIS, p.debris)
    const beads = Number(p.beads)
    return {
        background: merge(DEFAULT_BACKGROUND, p.background),
        size: clamp01to10(Number(p.size), DEFAULTS.size),
        structure: merge(DEFAULT_STRUCTURE, p.structure),
        rock: merge(DEFAULT_ROCK, p.rock),
        core: merge(DEFAULT_CORE, p.core),
        crosses: {
            ...crosses,
            count: THREE.MathUtils.clamp(
                Number.isFinite(Number(crosses.count)) ? Math.round(Number(crosses.count)) : 0,
                0,
                MAX_CROSSES
            ),
        },
        debris: {
            ...debris,
            count: THREE.MathUtils.clamp(
                Number.isFinite(Number(debris.count)) ? Math.round(Number(debris.count)) : 0,
                0,
                MAX_DEBRIS
            ),
        },
        beads: THREE.MathUtils.clamp(
            Number.isFinite(beads) ? Math.round(beads) : DEFAULTS.beads,
            0,
            MAX_BEADS
        ),
        entrance: merge(DEFAULT_ENTRANCE, p.entrance),
        response: merge(DEFAULT_RESPONSE, p.response),
        drift: merge(DEFAULT_DRIFT, p.drift),
        glow: merge(DEFAULT_GLOW, p.glow),
        quality: p.quality ?? (DEFAULTS.quality as "low" | "medium" | "high"),
    }
}

const crossDepth = (thickness: number) =>
    0.015 + (THREE.MathUtils.clamp(thickness, 0, 10) / 10) * 0.1034

function cameraDistance(size: number, aspect: number): number {
    const fill = 0.36 + (size / 10) * 0.62
    const halfFov = Math.tan((FOV * Math.PI) / 360)
    const shrink = Math.min(1, aspect)
    return (R * 1.16) / Math.max(0.02, fill * halfFov * shrink)
}

const makeRT = (w: number, h: number, depth: boolean) =>
    new THREE.WebGLRenderTarget(Math.max(1, w), Math.max(1, h), {
        type: THREE.HalfFloatType,
        format: THREE.RGBAFormat,
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        depthBuffer: depth,
        stencilBuffer: false,
    })

interface Piece {
    home: THREE.Vector3
    dir: THREE.Vector3
    axis: THREE.Vector3
    tilt: number
    delay: number
    push: number
    pushVel: number
    ang: number
    angVel: number

    base: THREE.Quaternion

    spin: THREE.Vector3

    free: boolean
    scale: number

    radius: number

    lateral: THREE.Vector3
}

function __UIHUBBase_EmberHusk(props: EmberHuskProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const paramsRef = useRef<Params>(makeParams(props))
    const q = (paramsRef.current = makeParams(props))

    const apiRef = useRef<{
        invalidate: () => void
        rebuild: () => void
    } | null>(null)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        let renderer: THREE.WebGLRenderer
        try {
            renderer = new THREE.WebGLRenderer({
                antialias: true,
                alpha: false,
                powerPreference: "high-performance",
            })
        } catch (err) {
            console.error("[ember-husk] could not create a WebGL context:", err)
            return
        }

        const p0 = paramsRef.current
        const dprCap = p0.quality === "low" ? 1 : p0.quality === "medium" ? 1.5 : 2
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap))
        renderer.setClearColor(0x000000, 1)
        renderer.toneMapping = THREE.ACESFilmicToneMapping
        renderer.toneMappingExposure = 1
        renderer.autoClear = false

        const canvas = renderer.domElement
        canvas.style.position = "absolute"
        canvas.style.inset = "0"
        canvas.style.display = "block"
        container.appendChild(canvas)

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(FOV, 1, 0.05, 100)
        camera.position.set(0, 0, 4)

        const lava = new THREE.Color(DEFAULT_CORE.color)
        const hot = new THREE.Color(DEFAULT_CORE.hotColor)
        const ground = new THREE.Color(DEFAULT_BACKGROUND.glowColor)
        const centre = new THREE.Vector3()

        const shared = {
            uKeyDir: { value: KEY_DIR.clone() },
            uFillDir: { value: FILL_DIR.clone() },
            uBounceDir: { value: BOUNCE_DIR.clone() },
            uGroundColor: { value: ground },
            uLavaColor: { value: lava },
            uLavaPower: { value: 0.6 },
            uCenter: { value: centre },
        }

        const rockMat = new THREE.ShaderMaterial({
            uniforms: {
                ...shared,
                uRockColor: { value: new THREE.Color(DEFAULT_ROCK.color) },
                uWeathering: { value: 0.5 },
                uHotColor: { value: hot },
                uInner: { value: 0.45 },
                uHeat: { value: 1 },
                uTime: { value: 0 },
            },
            vertexShader: ROCK_VERT,
            fragmentShader: ROCK_FRAG,
            toneMapped: false,
        })

        const debrisMat = new THREE.ShaderMaterial({
            uniforms: rockMat.uniforms,
            vertexShader: DEBRIS_VERT,
            fragmentShader: ROCK_FRAG,
            toneMapped: false,
        })

        const crossMat = new THREE.ShaderMaterial({
            uniforms: {
                ...shared,
                uCrossColor: { value: new THREE.Color(DEFAULT_CROSSES.color) },
            },
            vertexShader: CROSS_VERT,
            fragmentShader: CROSS_FRAG,
            toneMapped: false,
        })

        const beadMat = new THREE.ShaderMaterial({
            uniforms: { ...shared },
            vertexShader: BEAD_VERT,
            fragmentShader: BEAD_FRAG,
            toneMapped: false,
        })

        const bgMat = new THREE.ShaderMaterial({
            uniforms: {
                uDeep: { value: new THREE.Color(DEFAULT_BACKGROUND.color) },
                uGlowColor: { value: ground },
                uGlow: { value: 0.6 },
                uAspect: { value: 1 },
            },
            vertexShader: BG_VERT,
            fragmentShader: BG_FRAG,
            depthTest: false,
            depthWrite: false,
            toneMapped: false,
        })

        const bgQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMat)
        bgQuad.frustumCulled = false
        bgQuad.renderOrder = -1000
        scene.add(bgQuad)

        const rig = new THREE.Group()
        scene.add(rig)

        let crossGeo = buildCrossGeometry(CROSS_DEPTH)
        const debrisGeo = buildDebrisGeometry()
        const beadGeo = new THREE.SphereGeometry(1, 18, 14)

        let slabMeshes: THREE.Mesh[] = []
        let slabPieces: Piece[] = []
        let crossMesh: THREE.InstancedMesh | null = null
        let crossPieces: Piece[] = []
        let debrisMesh: THREE.InstancedMesh | null = null
        let debrisPieces: Piece[] = []
        let beadMesh: THREE.InstancedMesh | null = null
        let beadPieces: Piece[] = []

        const disposeHusk = () => {
            for (const m of slabMeshes) {
                rig.remove(m)
                m.geometry.dispose()
            }
            slabMeshes = []
            slabPieces = []
            if (crossMesh) {
                rig.remove(crossMesh)
                crossMesh.dispose()
                crossMesh = null
            }
            crossPieces = []
            if (debrisMesh) {
                rig.remove(debrisMesh)
                debrisMesh.dispose()
                debrisMesh = null
            }
            debrisPieces = []
            if (beadMesh) {
                rig.remove(beadMesh)
                beadMesh.dispose()
                beadMesh = null
            }
            beadPieces = []
        }

        const build = () => {
            const q = paramsRef.current
            disposeHusk()

            const { slabs, inner } = buildHusk(
                q.structure.shards,
                q.structure.irregularity,
                q.structure.thickness
            )
            rockMat.uniforms.uInner.value = inner

            const rng = makeRng(0x1f123bb5)
            for (const s of slabs) {
                const mesh = new THREE.Mesh(s.geometry, rockMat)
                mesh.frustumCulled = false
                rig.add(mesh)
                slabMeshes.push(mesh)
                slabPieces.push({
                    home: s.home.clone(),
                    dir: s.dir.clone(),
                    axis: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(),
                    tilt: rng() - 0.5,
                    delay: rng(),
                    push: 0,
                    pushVel: 0,
                    ang: 0,
                    angVel: 0,
                    base: new THREE.Quaternion(),
                    spin: new THREE.Vector3(),
                    free: false,
                    scale: 1,
                    radius: 0,
                    lateral: new THREE.Vector3(),
                })
            }

            crossGeo.dispose()
            crossGeo = buildCrossGeometry(crossDepth(q.crosses.thickness))

            const n = q.crosses.count
            if (n > 0) {
                crossMesh = new THREE.InstancedMesh(crossGeo, crossMat, n)
                crossMesh.frustumCulled = false
                const tints = new Float32Array(n * 3)
                for (let i = 0; i < n; i++) {
                    const dir = randomDir(rng)

                    const radius = R * (0.45 + Math.pow(rng(), 0.62) * 1.15)
                    const t = 0.82 + rng() * 0.3
                    tints[i * 3] = t
                    tints[i * 3 + 1] = t
                    tints[i * 3 + 2] = t * (0.99 + rng() * 0.05)
                    crossPieces.push({
                        home: dir.clone().multiplyScalar(radius),
                        dir: dir.clone(),
                        axis: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(),
                        tilt: rng() - 0.5,
                        delay: rng(),
                        push: 0,
                        pushVel: 0,
                        ang: rng() * Math.PI * 2,
                        angVel: 0,

                        base: randomQuat(rng),
                        spin: new THREE.Vector3(
                            (rng() - 0.5) * 0.62,
                            (rng() - 0.5) * 0.62,
                            (rng() - 0.5) * 0.62
                        ),
                        free: true,
                        scale: 0.7 + rng() * 0.6,
                        radius,
                        lateral: new THREE.Vector3(),
                    })
                }
                crossGeo.setAttribute(
                    "aSeedColor",
                    new THREE.InstancedBufferAttribute(tints, 3)
                )
                rig.add(crossMesh)
            }

            const pebbles = q.debris.count
            if (pebbles > 0) {
                debrisMesh = new THREE.InstancedMesh(debrisGeo, debrisMat, pebbles)
                debrisMesh.frustumCulled = false
                const values = new Float32Array(pebbles)
                for (let i = 0; i < pebbles; i++) {
                    const dir = randomDir(rng)
                    const radius = R * (1.12 + Math.pow(rng(), 0.8) * 0.95)
                    values[i] = 0.4 + rng() * 0.6
                    debrisPieces.push({
                        home: dir.clone().multiplyScalar(radius),
                        dir: dir.clone(),
                        axis: randomDir(rng),
                        tilt: rng() - 0.5,
                        delay: rng(),
                        push: 0,
                        pushVel: 0,
                        ang: 0,
                        angVel: 0,
                        base: randomQuat(rng),

                        spin: new THREE.Vector3(
                            (rng() - 0.5) * 1.6,
                            (rng() - 0.5) * 1.6,
                            (rng() - 0.5) * 1.6
                        ),
                        free: true,
                        scale: 0.05 + rng() * 0.1,
                        radius,
                        lateral: new THREE.Vector3(),
                    })
                }
                debrisGeo.setAttribute(
                    "aSlab",
                    new THREE.InstancedBufferAttribute(values, 1)
                )
                rig.add(debrisMesh)
            }

            const beads = q.beads
            if (beads > 0) {
                beadMesh = new THREE.InstancedMesh(beadGeo, beadMat, beads)
                beadMesh.frustumCulled = false
                for (let i = 0; i < beads; i++) {
                    const dir = new THREE.Vector3(
                        rng() - 0.5,
                        rng() - 0.5,
                        rng() - 0.5
                    ).normalize()
                    beadPieces.push({
                        home: dir.clone().multiplyScalar(R * (0.95 + rng() * 0.65)),
                        dir: dir.clone(),
                        axis: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize(),
                        tilt: rng() - 0.5,
                        delay: rng(),
                        push: 0,
                        pushVel: 0,
                        ang: 0,
                        angVel: 0,
                        base: new THREE.Quaternion(),
                        spin: new THREE.Vector3(),
                        free: false,
                        scale: 0.016 + rng() * 0.016,
                        radius: 0,
                        lateral: new THREE.Vector3(),
                    })
                }
                rig.add(beadMesh)
            }

            resetEntrance()
        }

        const resetEntrance = () => {
            const q = paramsRef.current
            const rng = makeRng(0x85ebca6b)
            const scatter = (q.entrance.scatter / 10) * 2.9 + 0.15
            const tumble = (q.entrance.tumble / 10) * 3.4

            const seed = (list: Piece[], reach: number) => {
                for (const piece of list) {
                    piece.push = scatter * reach * (0.55 + rng() * 0.9)
                    piece.pushVel = -scatter * (0.4 + rng() * 0.5)
                    piece.ang = (rng() - 0.5) * 2 * tumble
                    piece.angVel = (rng() - 0.5) * 2 * tumble * 2.2
                }
            }
            seed(slabPieces, 1)
            seed(crossPieces, 1.35)
            seed(debrisPieces, 2.1)
            seed(beadPieces, 1.6)
            entranceClock = 0
        }

        let entranceClock = 0

        build()

        const quadScene = new THREE.Scene()
        const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
        const quadGeo = new THREE.PlaneGeometry(2, 2)
        const quad = new THREE.Mesh(quadGeo)
        quad.frustumCulled = false
        quadScene.add(quad)

        const passMat = (
            fragmentShader: string,
            extra: Record<string, THREE.IUniform>
        ) =>
            new THREE.ShaderMaterial({
                uniforms: { tDiffuse: { value: null }, ...extra },
                vertexShader: QUAD_VERT,
                fragmentShader,
                depthTest: false,
                depthWrite: false,
                blending: THREE.NoBlending,
                toneMapped: false,
            })

        const prefilterMat = passMat(PREFILTER_FRAG, {
            uThreshold: { value: 0.85 },
            uKnee: { value: 0.4 },
        })
        const downMat = passMat(DOWN_FRAG, {
            uTexel: { value: new THREE.Vector2() },
        })
        const upMat = passMat(UP_FRAG, {
            uTexel: { value: new THREE.Vector2() },
            uRadius: { value: 1.2 },
        })
        upMat.blending = THREE.AdditiveBlending

        const compositeMat = new THREE.ShaderMaterial({
            uniforms: {
                tBase: { value: null },
                tBloom: { value: null },
                uStrength: { value: 0.4 },
            },
            vertexShader: QUAD_VERT,
            fragmentShader: COMPOSITE_FRAG,
            depthTest: false,
            depthWrite: false,
            blending: THREE.NoBlending,
        })

        const blit = (
            mat: THREE.Material,
            target: THREE.WebGLRenderTarget | null,
            clear: boolean
        ) => {
            quad.material = mat
            renderer.setRenderTarget(target)
            if (clear) renderer.clear(true, true, false)
            renderer.render(quadScene, quadCam)
        }

        const rtScene = makeRT(1, 1, true)
        let mips: { rt: THREE.WebGLRenderTarget; w: number; h: number }[] = []
        let sizeW = 0
        let sizeH = 0
        let aspect = 1
        let dirty = true

        const dropMips = () => {
            for (const m of mips) m.rt.dispose()
            mips = []
        }

        const resize = () => {
            const w = Math.max(1, container.clientWidth)
            const h = Math.max(1, container.clientHeight)
            if (w === sizeW && h === sizeH) return
            sizeW = w
            sizeH = h
            aspect = w / h

            renderer.setSize(w, h)
            camera.aspect = aspect
            camera.updateProjectionMatrix()
            bgMat.uniforms.uAspect.value = aspect

            const dpr = renderer.getPixelRatio()
            const pw = Math.max(1, Math.round(w * dpr))
            const ph = Math.max(1, Math.round(h * dpr))
            rtScene.setSize(pw, ph)

            const cap = paramsRef.current.quality === "low" ? 3 : 5
            const levels = Math.max(
                2,
                Math.min(cap, Math.floor(Math.log2(Math.min(pw, ph))) - 3)
            )
            dropMips()
            let mw = Math.max(1, pw >> 1)
            let mh = Math.max(1, ph >> 1)
            for (let i = 0; i < levels; i++) {
                mips.push({ rt: makeRT(mw, mh, false), w: mw, h: mh })
                mw = Math.max(1, mw >> 1)
                mh = Math.max(1, mh >> 1)
            }
            dirty = true
        }

        resize()

        const ro = new ResizeObserver(resize)
        ro.observe(container)

        let onScreen = true
        const io = new IntersectionObserver(
            (entries) => {
                onScreen = entries.some((e) => e.isIntersecting)
            },
            { rootMargin: "200px" }
        )
        io.observe(container)

        const pointer = new THREE.Vector2(0, 0)
        let over = false
        let hoverAmount = 0

        const onPointerMove = (e: PointerEvent) => {
            const rect = canvas.getBoundingClientRect()
            if (rect.width < 1 || rect.height < 1) return
            pointer.set(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -(((e.clientY - rect.top) / rect.height) * 2 - 1)
            )
            over = true
        }
        const onPointerLeave = () => {
            over = false
        }

        canvas.addEventListener("pointermove", onPointerMove)
        canvas.addEventListener("pointerenter", onPointerMove)
        canvas.addEventListener("pointerleave", onPointerLeave)
        canvas.addEventListener("pointercancel", onPointerLeave)

        let lastQuality = p0.quality
        const parsed = {
            rock: "",
            lava: "",
            hot: "",
            cross: "",
            deep: "",
            ground: "",
        }
        const recolour = (target: THREE.Color, css: string) => {
            try {
                target.setStyle(css)
            } catch {}
        }

        const applyParams = () => {
            const q = paramsRef.current

            if (parsed.rock !== q.rock.color) {
                parsed.rock = q.rock.color
                recolour(rockMat.uniforms.uRockColor.value, q.rock.color)
            }
            if (parsed.lava !== q.core.color) {
                parsed.lava = q.core.color
                recolour(lava, q.core.color)
            }
            if (parsed.hot !== q.core.hotColor) {
                parsed.hot = q.core.hotColor
                recolour(hot, q.core.hotColor)
            }
            if (parsed.cross !== q.crosses.color) {
                parsed.cross = q.crosses.color
                recolour(crossMat.uniforms.uCrossColor.value, q.crosses.color)
            }
            if (parsed.deep !== q.background.color) {
                parsed.deep = q.background.color
                recolour(bgMat.uniforms.uDeep.value, q.background.color)
            }
            if (parsed.ground !== q.background.glowColor) {
                parsed.ground = q.background.glowColor
                recolour(ground, q.background.glowColor)
            }

            if (lastQuality !== q.quality) {
                lastQuality = q.quality
                const cap = q.quality === "low" ? 1 : q.quality === "medium" ? 1.5 : 2
                renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))

                sizeW = 0
                sizeH = 0
                resize()
            }

            bgMat.uniforms.uGlow.value = 0.14 + (q.background.glow / 10) * 1.35

            const intensity = q.core.intensity / 10

            rockMat.uniforms.uHeat.value = 0.4 + intensity * 5.2
            rockMat.uniforms.uWeathering.value = q.rock.weathering / 10
            shared.uLavaPower.value = 0.12 + intensity * 1.55

            prefilterMat.uniforms.uThreshold.value = 0.4 + (q.glow.threshold / 10) * 3.0
            prefilterMat.uniforms.uKnee.value =
                Math.max(0.05, prefilterMat.uniforms.uThreshold.value * 0.4)
            upMat.uniforms.uRadius.value = 0.55 + (q.glow.radius / 10) * 1.7
            compositeMat.uniforms.uStrength.value = 0.04 + (q.glow.strength / 10) * 0.62

            camera.position.z = cameraDistance(q.size, aspect)
            camera.lookAt(0, 0, 0)
        }

        const tmpVec = new THREE.Vector3()
        const tmpQuat = new THREE.Quaternion()
        const tmpSpin = new THREE.Quaternion()
        const tmpEuler = new THREE.Euler()
        const tmpMat = new THREE.Matrix4()
        const tmpScale = new THREE.Vector3()

        const away = new THREE.Vector2()
        const lateralWorld = new THREE.Vector3()
        const rigInv = new THREE.Quaternion()

        const proximity = (piece: Piece, reach: number): number => {
            tmpVec.copy(piece.home).applyMatrix4(rig.matrixWorld).project(camera)
            let dx = tmpVec.x - pointer.x
            const dy = tmpVec.y - pointer.y
            away.set(dx, dy)

            dx *= aspect > 1 ? aspect : 1
            const dyc = aspect < 1 ? dy / Math.max(aspect, 0.05) : dy
            const d = Math.sqrt(dx * dx + dyc * dyc)
            const f = 1 - THREE.MathUtils.clamp(d / Math.max(reach, 0.001), 0, 1)
            return f * f
        }

        const stepPieces = (
            list: Piece[],
            dt: number,
            k: number,
            c: number,
            strength: number,
            reach: number,
            released: number
        ) => {
            for (const piece of list) {
                if (released < piece.delay) continue

                const near = hoverAmount > 0.001 ? proximity(piece, reach) : 0

                if (near > 0.0001) {
                    lateralWorld.set(away.x, away.y, 0)
                    if (lateralWorld.lengthSq() < 1e-9) {
                        lateralWorld.copy(piece.dir)
                    } else {
                        lateralWorld.normalize().applyQuaternion(rigInv)
                    }
                    piece.lateral.lerp(lateralWorld, 1 - Math.exp(-dt * 11))
                    const len = piece.lateral.length()
                    if (len > 1e-6) piece.lateral.multiplyScalar(1 / len)
                }

                const targetPush = near * strength
                const targetAng = near * strength * piece.tilt * 3.4

                piece.pushVel += ((targetPush - piece.push) * k - piece.pushVel * c) * dt
                piece.push += piece.pushVel * dt

                piece.angVel += ((targetAng - piece.ang) * k - piece.angVel * c) * dt
                piece.ang += piece.angVel * dt
            }
        }

        const poseSlabs = (restGap: number, repel: number) => {
            for (let i = 0; i < slabMeshes.length; i++) {
                const piece = slabPieces[i]
                const mesh = slabMeshes[i]

                const offset = piece.push * (1 - repel) + restGap
                mesh.position
                    .copy(piece.home)
                    .addScaledVector(piece.dir, offset)
                    .addScaledVector(piece.lateral, piece.push * repel)
                mesh.quaternion.setFromAxisAngle(piece.axis, piece.ang)
            }
        }

        const poseInstances = (
            mesh: THREE.InstancedMesh | null,
            list: Piece[],
            t: number,
            baseScale: number,
            repel: number
        ) => {
            if (!mesh) return
            for (let i = 0; i < list.length; i++) {
                const piece = list[i]
                tmpVec
                    .copy(piece.home)
                    .addScaledVector(piece.dir, piece.push * (1 - repel))
                    .addScaledVector(piece.lateral, piece.push * repel)

                tmpQuat.setFromAxisAngle(piece.axis, piece.ang)
                if (piece.free) {
                    tmpEuler.set(
                        piece.spin.x * t,
                        piece.spin.y * t,
                        piece.spin.z * t
                    )
                    tmpQuat.multiply(tmpSpin.setFromEuler(tmpEuler))
                }
                tmpQuat.multiply(piece.base)
                tmpScale.setScalar(baseScale * piece.scale)
                tmpMat.compose(tmpVec, tmpQuat, tmpScale)
                mesh.setMatrixAt(i, tmpMat)
            }
            mesh.instanceMatrix.needsUpdate = true
        }

        const renderFrame = (t: number, dt: number) => {
            const q = paramsRef.current
            applyParams()

            const wanted = q.response.strength > 0 && over ? 1 : 0
            hoverAmount += (wanted - hoverAmount) * (1 - Math.exp(-dt * 9))
            if (hoverAmount < 0.002) hoverAmount = 0

            const k = 14 + (q.response.settle / 10) * 62
            const c = 2 * Math.sqrt(k) * DAMPING

            const strength =
                Math.pow(THREE.MathUtils.clamp(q.response.strength, 0, 10) / 10, 1.35) *
                1.9 *
                hoverAmount
            const reach = 0.12 + (q.response.reach / 10) * 0.9
            const repel = THREE.MathUtils.clamp(q.response.repel, 0, 10) / 10
            const stagger = (q.entrance.stagger / 10) * 0.95

            const spread = 0.5 + (q.crosses.spread / 10) * 1.1
            for (const piece of crossPieces) {
                piece.home.copy(piece.dir).multiplyScalar(piece.radius * spread)
            }
            const dust = 0.6 + (q.debris.spread / 10) * 0.8
            for (const piece of debrisPieces) {
                piece.home.copy(piece.dir).multiplyScalar(piece.radius * dust)
            }

            rig.updateMatrixWorld(true)
            rigInv.copy(rig.quaternion).invert()

            let remaining = Math.min(dt, MAX_SUBSTEPS * PHYS_STEP)
            let guard = 0
            while (remaining > 0 && guard < MAX_SUBSTEPS) {
                const step = Math.min(PHYS_STEP, remaining)
                entranceClock += step
                const released =
                    stagger <= 0 ? 1 : THREE.MathUtils.clamp(entranceClock / stagger, 0, 1)
                stepPieces(slabPieces, step, k, c, strength, reach, released)
                stepPieces(crossPieces, step, k, c, strength * 1.3, reach, released)

                stepPieces(
                    debrisPieces,
                    step,
                    k * 0.55,
                    c * 0.55,
                    strength * 2.4,
                    reach * 1.2,
                    released
                )
                stepPieces(beadPieces, step, k * 0.7, c * 0.7, strength * 1.6, reach, released)
                remaining -= step
                guard++
            }

            const spin = (q.drift.spin / 10) * 0.52
            const bob = (q.drift.bob / 10) * 0.11
            const sway = (q.drift.sway / 10) * 0.17
            rig.rotation.y = t * spin
            rig.rotation.z = Math.sin(t * 0.43) * sway
            rig.rotation.x = Math.sin(t * 0.31 + 1.1) * sway * 0.6
            rig.position.y = Math.sin(t * 0.6) * bob
            rig.updateMatrixWorld(true)

            centre.copy(rig.position)

            poseSlabs((q.rock.seam / 10) * 0.045 + 0.002, repel)
            poseInstances(
                crossMesh,
                crossPieces,
                t,
                (q.crosses.size / 10) * 0.4 + 0.08,
                repel
            )
            poseInstances(
                debrisMesh,
                debrisPieces,
                t,
                (q.debris.size / 10) * 1.4 + 0.3,
                repel
            )
            poseInstances(beadMesh, beadPieces, t, 1, repel)

            rockMat.uniforms.uTime.value = t * (0.12 + (q.core.flow / 10) * 1.3)

            renderer.setRenderTarget(rtScene)
            renderer.clear(true, true, false)
            renderer.render(scene, camera)

            prefilterMat.uniforms.tDiffuse.value = rtScene.texture
            blit(prefilterMat, mips[0].rt, true)

            for (let i = 1; i < mips.length; i++) {
                const src = mips[i - 1]
                downMat.uniforms.tDiffuse.value = src.rt.texture
                downMat.uniforms.uTexel.value.set(1 / src.w, 1 / src.h)
                blit(downMat, mips[i].rt, true)
            }

            for (let i = mips.length - 1; i > 0; i--) {
                const src = mips[i]
                upMat.uniforms.tDiffuse.value = src.rt.texture
                upMat.uniforms.uTexel.value.set(1 / src.w, 1 / src.h)
                blit(upMat, mips[i - 1].rt, false)
            }

            compositeMat.uniforms.tBase.value = rtScene.texture
            compositeMat.uniforms.tBloom.value = mips[0].rt.texture
            blit(compositeMat, null, true)
        }

        const settle = () => {
            for (const list of [slabPieces, crossPieces, debrisPieces, beadPieces]) {
                for (const piece of list) {
                    piece.push = 0
                    piece.pushVel = 0
                    piece.lateral.set(0, 0, 0)
                    piece.ang = 0
                    piece.angVel = 0
                }
            }
            hoverAmount = 0
            over = false
            entranceClock = 10
        }

        let prefersReduced = false
        try {
            prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        } catch {}

        const clock = new THREE.Clock()
        let last = 0

        const loop = () => {
            if (prefersReduced) {
                if (!dirty) return
                dirty = false
                settle()
                renderFrame(FROZEN_TIME, 0)
                return
            }
            if (!onScreen) return

            const t = clock.getElapsedTime()
            const dt = Math.min(0.1, t - last)
            last = t
            renderFrame(t, dt)
        }

        renderer.setAnimationLoop(loop)

        apiRef.current = {
            invalidate: () => {
                dirty = true
            },
            rebuild: () => {
                build()
                dirty = true
            },
        }

        return () => {
            renderer.setAnimationLoop(null)
            apiRef.current = null

            ro.disconnect()
            io.disconnect()
            canvas.removeEventListener("pointermove", onPointerMove)
            canvas.removeEventListener("pointerenter", onPointerMove)
            canvas.removeEventListener("pointerleave", onPointerLeave)
            canvas.removeEventListener("pointercancel", onPointerLeave)

            disposeHusk()
            crossGeo.dispose()
            debrisGeo.dispose()
            beadGeo.dispose()
            bgQuad.geometry.dispose()
            quadGeo.dispose()
            rockMat.dispose()
            crossMat.dispose()
            debrisMat.dispose()
            beadMat.dispose()
            bgMat.dispose()
            prefilterMat.dispose()
            downMat.dispose()
            upMat.dispose()
            compositeMat.dispose()
            rtScene.dispose()
            dropMips()

            renderer.dispose()
            renderer.forceContextLoss()
            canvas.remove()
        }

    }, [])

    const structuralKey = [
        Math.round(q.structure.shards),
        Math.round(q.structure.irregularity * 10),
        Math.round(q.structure.thickness * 10),
        q.crosses.count,
        Math.round(q.crosses.thickness * 10),
        q.debris.count,
        q.beads,
    ].join("|")
    const builtRef = useRef(structuralKey)
    useEffect(() => {
        if (builtRef.current === structuralKey) return
        builtRef.current = structuralKey
        apiRef.current?.rebuild()
    }, [structuralKey])

    useEffect(() => {
        apiRef.current?.invalidate()
    })

    return (
        <div
            ref={containerRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                overflow: "hidden",

                background: q.background.color,
                ...props.style,
            }}
        />
    )
}

const __uiHubPresetProps = {
  "size": 3.7,
  "beads": 5,
  "quality": "high"
};

export default function EmberHusk(props: Record<string, unknown>) {
  return <__UIHUBBase_EmberHusk {...(__uiHubPresetProps as Record<string, unknown>)} {...props} />;
}