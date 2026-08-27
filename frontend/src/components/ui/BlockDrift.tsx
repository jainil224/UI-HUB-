// Block Drift — UI HUB
// UI HUB — props baked into the default export.
"use client"

import * as React from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"

/**
 * Block Drift — sheets of cubes sliding past the camera, front or back.
 *
 * Built after a small Processing sketch: a stack of flat layers, each a square
 * grid of boxes with most of them culled by noise, the whole stack marching one
 * layer-depth per second.
 *
 * Three things make it read as continuous rather than as a loop.
 *
 * The layers move exactly one gap in exactly the time the noise seed takes to
 * advance by one, so a layer arriving where its neighbour was is also handed
 * that neighbour's pattern — the wall never restarts.
 *
 * The camera sits *inside* the stack, one gap ahead of where the cycle wraps.
 * Blocks therefore fly past the viewer and leave the frame at its edges, and
 * the wrap itself happens behind the camera where nothing can see it. Putting
 * the camera in front of the stack instead is what made blocks reach the front
 * and vanish on the spot: they had nowhere left to go.
 *
 * At the far end blocks grow in from nothing over the last stretch of their
 * travel, which at that distance is a few pixels and reads as fog rather than
 * as an appearance.
 *
 * The cull is a noise field over the grid, not a per-cell coin toss. Neighbours
 * therefore agree with each other and the survivors come out in contiguous
 * runs, so blocks meet face to face and build slabs instead of hanging in the
 * air one at a time.
 */

const DEFAULTS = {
    near: "#0012FF",
    far: "#FFFFFF",
    edge: "#FCFF00",
    grid: 9,
    blockSize: 10,
    gap: 20,
    layers: 15,
    density: 11,
    cluster: 1,
    edgeWidth: 1,
    fade: 1,
    shade: 20,
    clearCentre: 3,
    speed: 12,
    direction: "front",
}

/** Never build a sheet wider than this, however small the blocks get. */
const MAX_GRID = 41

type Config = {
    near: string
    far: string
    edge: string
    grid: number
    blockSize: number
    gap: number
    layers: number
    density: number
    cluster: number
    edgeWidth: number
    fade: number
    shade: number
    clearCentre: number
    speed: number
    direction: "front" | "back"
}

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

/** Panel values are whole numbers; the shader wants the real ones. */
function settingsFor(cfg: Config) {
    const grid = Math.round(clamp(cfg.grid, 3, 31, DEFAULTS.grid))
    /*
     * Block size sets the cell, and the lattice is the cell.
     *
     * Spacing used to be its own control with the block a fraction of it, which
     * meant anything under full size left the survivors floating apart — a grid
     * of separate cubes rather than a wall. Here the spacing *is* the block, so
     * neighbours are always flush and turning this down makes the blocks
     * smaller and the wall finer instead of opening gaps in it.
     */
    const block = 0.12 + clamp(cfg.blockSize, 1, 20, DEFAULTS.blockSize) * 0.05
    return {
        // Odd, always: the corridor is measured out from a middle cell, and a
        // grid with an even side has no middle cell.
        grid: grid % 2 === 0 ? grid + 1 : grid,
        layers: Math.round(clamp(cfg.layers, 5, 15, DEFAULTS.layers)),
        block,
        spacing: block,
        // Distance between layers, which is also how far the stack travels in
        // one beat.
        gap: 0.4 + clamp(cfg.gap, 1, 20, DEFAULTS.gap) * 0.11,
        // Share of cells that survive the cull.
        density: clamp(cfg.density, 1, 20, DEFAULTS.density) / 20,
        /*
         * Frequency of the cull noise. Low is broad continents of blocks, high
         * approaches a per-cell coin toss and the wall falls apart into
         * confetti.
         */
        cluster: 1.4 - clamp(cfg.cluster, 1, 20, DEFAULTS.cluster) * 0.055,
        edgeWidth: clamp(cfg.edgeWidth, 0, 20, DEFAULTS.edgeWidth) * 0.011,
        // How fast a layer darkens with distance.
        fade: clamp(cfg.fade, 1, 20, DEFAULTS.fade) * 0.011,
        shade: clamp(cfg.shade, 0, 20, DEFAULTS.shade) * 0.03,
        speed: clamp(cfg.speed, 0, 20, DEFAULTS.speed) * 0.09,
        heading: cfg.direction === "back" ? -1 : 1,
        /*
         * Radius, in cells, of the corridor kept empty down the middle.
         *
         * The camera flies along that axis, so anything left standing there
         * passes straight through the viewer — which fills the frame with the
         * inside of a cube for a moment and then clips through the near plane.
         * 0 clears only the single middle cell; higher opens the corridor out.
         */
        clearCentre: Math.round(clamp(cfg.clearCentre, 0, 5, DEFAULTS.clearCentre)),
    }
}

/** One cube, plus a cell and a layer index per instance. */
function buildBlocks(grid: number, layers: number): THREE.BufferGeometry {
    const cells = grid * grid
    const count = cells * layers
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const cell = new Float32Array(count)
    const layer = new Float32Array(count)

    let i = 0
    for (let l = 0; l < layers; l++) {
        for (let c = 0; c < cells; c++) {
            cell[i] = c
            layer[i] = l
            i++
        }
    }

    geometry.setAttribute("aCell", new THREE.InstancedBufferAttribute(cell, 1))
    geometry.setAttribute("aLayer", new THREE.InstancedBufferAttribute(layer, 1))
    return geometry
}

const BLOCK_VERTEX = /* glsl */ `
    attribute float aCell;
    attribute float aLayer;

    uniform float uTime;
    uniform float uGrid;
    uniform float uBlock;
    uniform float uSpacing;
    uniform float uGap;
    uniform float uDensity;
    uniform float uCluster;
    uniform float uClearCentre;
    uniform float uHeading;
    uniform float uLayers;

    varying float vDepth;
    varying vec3 vNormal;
    varying float vAlive;
    varying vec2 vFace;

    float hash(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.56);
        return fract(p.x * p.y * 95.43);
    }

    /**
     * Value noise over the grid.
     *
     * This is what connects the blocks. A per-cell hash gives every cell an
     * independent verdict, so survivors are scattered and nothing ever touches
     * anything; a smooth field makes neighbours agree, and the survivors come
     * out as contiguous runs that meet face to face.
     */
    float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
            mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
            mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
            u.y
        );
    }

    void main() {
        // Cell index unpacked into a position on the sheet, centred on the
        // origin so the stack grows around the camera axis.
        float cx = mod(aCell, uGrid);
        float cy = floor(aCell / uGrid);
        // Deliberately not named "half": that is a reserved word in GLSL, and
        // using it fails the whole shader to compile — which shows up as an
        // entirely empty canvas rather than as anything misdrawn.
        float mid = (uGrid - 1.0) * 0.5;
        vec2 cell = vec2(cx, cy) - mid;
        vec2 xy = cell * uSpacing;

        /*
         * Depth.
         *
         * The stack slides by exactly one gap per beat, and the noise seed
         * advances by exactly one at the same moment — so a layer arriving where
         * its neighbour used to be is handed that neighbour's pattern and the
         * march never visibly restarts.
         */
        float beat = floor(uTime);
        float f = fract(uTime);
        float slide = uHeading > 0.0 ? f : 1.0 - f;
        float depth = aLayer + 1.0 - slide;

        /*
         * The cull, over a noise field seeded on the beat and the layer, so the
         * pattern travels with the stack.
         *
         * Losers are collapsed to a point: an instanced draw cannot skip one,
         * and a degenerate triangle costs no fragments, which comes to the same
         * thing.
         */
        float seed = beat * uHeading + aLayer;
        float n = vnoise(vec2(cx, cy) * uCluster + seed * 19.3);
        float alive = step(n, uDensity);

        /*
         * The corridor down the middle, always empty.
         *
         * Measured as a square ring index rather than a radius, because the
         * cells are on a square lattice and a circular test leaves the corner
         * cells of the innermost ring standing — which is exactly the block
         * that then passes through the camera.
         *
         * The camera flies along this axis, so a block left here does not read
         * as a block at all: it swells to fill the frame and then clips through
         * the near plane.
         */
        float ring = max(abs(cell.x), abs(cell.y));
        alive *= step(uClearCentre + 0.5, ring);

        float dn = depth / max(1.0, uLayers);
        /*
         * Grown in over the last stretch of the run.
         *
         * Only the far end needs this — the near end passes the camera. At that
         * distance a block is a few pixels across, so it reads as arriving out
         * of fog rather than as popping into being.
         */
        float grow = smoothstep(1.0, 0.84, dn);

        vec3 p = position * uBlock * alive * grow;
        p.xy += xy;
        /*
         * One gap behind the camera at depth 0.
         *
         * The camera sits inside the stack, so blocks fly past it and leave at
         * the edges of the frame, and the wrap from the front of the cycle back
         * to the rear happens behind the viewer where it cannot be seen. This
         * single offset is the difference between a wall that flows and one
         * whose front row keeps vanishing on the spot.
         */
        p.z += uGap - depth * uGap;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vDepth = clamp(dn, 0.0, 1.0);
        vAlive = alive;
        // The box's own face coordinates, for drawing the seams.
        vFace = uv;
        gl_Position = projectionMatrix * mv;
    }
`

const BLOCK_FRAGMENT = /* glsl */ `
    uniform vec3 uNear;
    uniform vec3 uFar;
    uniform vec3 uEdge;
    uniform float uFade;
    uniform float uShade;
    uniform float uEdgeWidth;

    varying float vDepth;
    varying vec3 vNormal;
    varying float vAlive;
    varying vec2 vFace;

    void main() {
        // Collapsed boxes should never paint, even if a driver rasterises a
        // sliver of one.
        if (vAlive < 0.5) discard;

        // Depth is value: the nearest sheet is brightest and the stack falls
        // away behind it. This is what gives the wall its floor.
        vec3 col = mix(uNear, uFar, pow(vDepth, 1.0 - uFade * 8.0 + 0.9));

        /*
         * A little face shading on top.
         *
         * The original sketch drew flat fills, where boxes were told apart only
         * by their layer's value — and any two neighbours in the same layer
         * merged into one shape. Separating the faces by which way they point
         * keeps the cubes legible as cubes.
         */
        vec3 n = normalize(vNormal);
        float face = 0.5 + 0.5 * dot(n, normalize(vec3(-0.4, 0.55, 0.75)));
        col *= 1.0 - uShade + uShade * face * 2.0;

        /*
         * Seams.
         *
         * Distance to the nearest border of the box's own face, widened by its
         * screen-space derivative so the line holds its weight whether the block
         * is filling the frame or is a speck at the back. Now that neighbouring
         * blocks sit flush, this is what keeps a slab reading as the several
         * cubes it is made of rather than as one smooth wall.
         */
        if (uEdgeWidth > 0.0001) {
            float e = min(min(vFace.x, 1.0 - vFace.x), min(vFace.y, 1.0 - vFace.y));
            float aa = max(fwidth(e), 0.0001);
            float border = 1.0 - smoothstep(uEdgeWidth - aa, uEdgeWidth + aa, e);
            // Faded with distance along with everything else, so the seams do
            // not stay crisp on blocks that are otherwise nearly gone.
            col = mix(col, uEdge, border * (1.0 - vDepth * 0.65));
        }

        gl_FragColor = vec4(max(col, 0.0), 1.0);
    }
`

class BlockScene {
    private container: HTMLElement
    private cfg: Config

    private renderer: THREE.WebGLRenderer
    private scene = new THREE.Scene()
    private camera = new THREE.PerspectiveCamera(60, 1, 0.02, 400)

    private geometry: THREE.BufferGeometry
    private material: THREE.ShaderMaterial
    private mesh: THREE.InstancedMesh

    // The sheet actually built, which is the panel's Grid or whatever is needed
    // to cover the frame — whichever is larger.
    private gridUsed = 0
    private layersUsed = 0
    private time = 0
    private width = 0
    private height = 0
    private frameId = 0
    private lastT = 0
    private disposed = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg
        const S = settingsFor(cfg)

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
        this.renderer.outputColorSpace = THREE.SRGBColorSpace
        this.renderer.setClearColor(0x000000, 0)
        const el = this.renderer.domElement
        el.style.position = "absolute"
        el.style.inset = "0"
        el.style.width = "100%"
        el.style.height = "100%"
        container.appendChild(el)

        this.material = new THREE.ShaderMaterial({
            vertexShader: BLOCK_VERTEX,
            fragmentShader: BLOCK_FRAGMENT,
            uniforms: {
                uTime: { value: 0 },
                uGrid: { value: S.grid },
                uBlock: { value: S.block },
                uSpacing: { value: S.spacing },
                uGap: { value: S.gap },
                uDensity: { value: S.density },
                uCluster: { value: S.cluster },
                uClearCentre: { value: S.clearCentre },
                uHeading: { value: S.heading },
                uLayers: { value: S.layers },
                uNear: { value: new THREE.Color(cfg.near) },
                uFar: { value: new THREE.Color(cfg.far) },
                uEdge: { value: new THREE.Color(cfg.edge) },
                uFade: { value: S.fade },
                uShade: { value: S.shade },
                uEdgeWidth: { value: S.edgeWidth },
            },
        })

        // A starting sheet, replaced by the first layout pass once the frame's
        // shape is known.
        this.gridUsed = S.grid
        this.layersUsed = S.layers
        this.geometry = buildBlocks(S.grid, S.layers)
        this.mesh = this.makeMesh(S.grid * S.grid * S.layers)
        this.scene.add(this.mesh)
    }

    private makeMesh(count: number): THREE.InstancedMesh {
        const mesh = new THREE.InstancedMesh(this.geometry, this.material, count)
        // Placement is entirely in the vertex shader, but the matrix buffer
        // starts zero-filled and a zero matrix collapses every box, so it is
        // written once with the identity.
        const identity = new THREE.Matrix4()
        for (let i = 0; i < count; i++) mesh.setMatrixAt(i, identity)
        mesh.instanceMatrix.needsUpdate = true
        mesh.frustumCulled = false
        return mesh
    }

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
        this.width = width
        this.height = height
        this.renderer.setSize(width, height, false)
        this.updateCamera()
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        this.cfg = cfg
        const S = settingsFor(cfg)
        const u = this.material.uniforms

        u.uGrid.value = S.grid
        u.uBlock.value = S.block
        u.uSpacing.value = S.spacing
        u.uGap.value = S.gap
        u.uDensity.value = S.density
        u.uCluster.value = S.cluster
        u.uClearCentre.value = S.clearCentre
        u.uHeading.value = S.heading
        u.uLayers.value = S.layers
        u.uFade.value = S.fade
        u.uShade.value = S.shade
        u.uEdgeWidth.value = S.edgeWidth
        u.uNear.value.set(cfg.near || "#ffffff")
        u.uFar.value.set(cfg.far || "#000000")
        u.uEdge.value.set(cfg.edge || "#000000")

        // The sheet the layout resolves to owns the buffers, so the rebuild
        // decision lives there rather than here.
        this.updateCamera()
    }

    /**
     * How many cells across the sheet has to be to cover the frame.
     *
     * The camera has a fixed field of view, so shrinking the blocks genuinely
     * shrinks them on screen — but it also shrinks the sheet, and a sheet
     * narrower than the view cone leaves bare margins at the edges. The panel's
     * Grid is therefore a minimum, and the sheet grows past it as needed.
     *
     * Measured at the nearest visible sheet: further ones only have to fill the
     * middle of the frame, since the near ones already cover its edges.
     */
    private resolveGrid(S: ReturnType<typeof settingsFor>, aspect: number, fov: number) {
        const tanV = Math.tan((fov * Math.PI) / 360)
        const reach = tanV * S.gap * 1.25 * Math.max(1, aspect)
        const cells = 2 * Math.ceil(reach / S.block) + 1
        return Math.min(MAX_GRID, Math.max(S.grid, cells))
    }

    private updateCamera() {
        const w = Math.max(1, this.width)
        const h = Math.max(1, this.height)
        const aspect = w / h
        const S = settingsFor(this.cfg)

        /*
         * A fixed field of view, and the camera at the origin — inside the
         * stack, which is what lets blocks pass it.
         *
         * It used to solve for the angle that made the sheet fill the frame,
         * and that has to go now that the lattice follows the block size: with
         * the frame fitted to the sheet, shrinking the blocks shrinks the sheet
         * and the camera zooms in by exactly as much, so Block Size would have
         * had no visible effect at all. Holding the angle still is what makes
         * smaller blocks actually look smaller.
         */
        const fov = aspect < 1 ? 78 : 62

        // The sheet has to cover the frame on its own now, so it is sized to
        // the view rather than the view to it.
        const grid = this.resolveGrid(S, aspect, fov)
        if (grid !== this.gridUsed || S.layers !== this.layersUsed) {
            this.gridUsed = grid
            this.layersUsed = S.layers
            this.scene.remove(this.mesh)
            this.mesh.dispose()
            this.geometry.dispose()
            this.geometry = buildBlocks(grid, S.layers)
            this.mesh = this.makeMesh(grid * grid * S.layers)
            this.scene.add(this.mesh)
        }
        // The shader lays cells out from this, so it has to be the grid that was
        // actually built, not the one the panel asked for.
        this.material.uniforms.uGrid.value = grid

        this.camera.aspect = aspect
        this.camera.fov = fov
        this.camera.position.set(0, 0, 0)
        this.camera.lookAt(0, 0, -1)
        this.camera.near = 0.02
        this.camera.far = S.gap * (S.layers + 2)
        this.camera.updateProjectionMatrix()
    }

    private step() {
        if (this.disposed) return
        const now = performance.now()
        let dt = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(dt) || dt < 0) dt = 0
        if (dt > 0.05) dt = 0.05

        // One whole beat is one layer of travel, so the clock is scaled here and
        // the shader's floor/fract split does the rest.
        this.time += dt * settingsFor(this.cfg).speed
        this.material.uniforms.uTime.value = this.time
        this.renderer.render(this.scene, this.camera)
    }

    dispose() {
        this.disposed = true
        cancelAnimationFrame(this.frameId)
        this.mesh.dispose()
        this.geometry.dispose()
        this.material.dispose()
        this.renderer.dispose()
        const el = this.renderer.domElement
        if (el.parentNode === this.container) this.container.removeChild(el)
    }
}

interface BlockDriftProps {
    near?: string
    far?: string
    edge?: string
    grid?: number
    blockSize?: number
    gap?: number
    layers?: number
    density?: number
    cluster?: number
    edgeWidth?: number
    fade?: number
    shade?: number
    clearCentre?: number
    speed?: number
    direction?: "front" | "back"
    style?: React.CSSProperties
}

function __UIHUBBase_BlockDrift(props: BlockDriftProps) {
    const {
        near = DEFAULTS.near,
        far = DEFAULTS.far,
        edge = DEFAULTS.edge,
        grid = DEFAULTS.grid,
        blockSize = DEFAULTS.blockSize,
        gap = DEFAULTS.gap,
        layers = DEFAULTS.layers,
        density = DEFAULTS.density,
        cluster = DEFAULTS.cluster,
        edgeWidth = DEFAULTS.edgeWidth,
        fade = DEFAULTS.fade,
        shade = DEFAULTS.shade,
        clearCentre = DEFAULTS.clearCentre,
        speed = DEFAULTS.speed,
        direction = DEFAULTS.direction as "front" | "back",
        style,
    } = props

    const containerRef = useRef<HTMLDivElement | null>(null)
    const sceneRef = useRef<BlockScene | null>(null)

    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        near,
        far,
        edge,
        grid,
        blockSize,
        gap,
        layers,
        density,
        cluster,
        edgeWidth,
        fade,
        shade,
        clearCentre,
        speed,
        direction,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        let scene: BlockScene
        try {
            scene = new BlockScene(container, cfgRef.current)
        } catch {
            // No WebGL — render an empty frame rather than throwing.
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
        near,
        far,
        edge,
        grid,
        blockSize,
        gap,
        layers,
        density,
        cluster,
        edgeWidth,
        fade,
        shade,
        clearCentre,
        speed,
        direction,
    ])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="Block drift"
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minWidth: 120,
                minHeight: 120,
                overflow: "hidden",
                ...style,
            }}
        />
    )
}

BlockDrift.displayName = "Block Drift"
BlockDrift.defaultProps = { ...DEFAULTS }

const __uihubPresetProps = {
  "near": "#8B10B3",
  "far": "#029A00",
  "edge": "#020200",
  "grid": 17,
  "blockSize": 12,
  "density": 10,
  "cluster": 10
};

export default function BlockDrift(props: Record<string, unknown>) {
  return <__UIHUBBase_BlockDrift {...(__uihubPresetProps as Record<string, unknown>)} {...props} />;
}
