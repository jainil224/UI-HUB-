
// Ascii Water

// UI HUB — Interactive Background

// Using component defaults.



"use client"

import * as React from "react"
import { useEffect, useRef } from "react"

/**
 * Ascii Water — UI HUB
 *
 * The fluid is a FLIP simulation (particles carry the velocity, a staggered
 * grid makes it incompressible) after Matthias Müller's ten-minute-physics
 * solver, by way of javierbyte/fluid-triangle, which is where the ASCII readout
 * comes from: each cell picks a glyph from a ramp chosen by (row + column), so
 * five ramps interleave and the surface spells FLUID along its diagonals.
 *
 * The source hangs a solid triangle off the pointer and ploughs it through the
 * water. That triangle is gone here. Dragging a solid body does work, but it
 * punches a hole the shape of itself into the type — which is the shape we were
 * asked to remove. So the pointer is a velocity brush instead: particles it
 * passes over are blended toward the cursor's own velocity, which pushes waves
 * without occupying any cells, and the field of characters stays unbroken.
 *
 * Why a grid this coarse is fine: nothing is ever drawn smaller than one
 * character, so simulating below the character cell would be invisible work.
 */

const GRAVITY = -9.81

// One character of margin sideways and two top and bottom sit outside the
// readout, so the tank walls — which the solver pins to zero velocity — never
// show up as a stalled band of glyphs along the edge.
const CROP_X = 1
const CROP_Y = 2

// The tank is always two units tall; every other length derives from that.
const SIM_HEIGHT = 2.0

// Tank units per second. Below the minimum the cursor counts as parked and the
// brush is off entirely; the maximum is what one violent flick is allowed to
// hand the water, which is already several tank-heights a second.
const STIR_MIN_SPEED = 0.15
const STIR_MAX_SPEED = 15

// Tank units per second handed to a click's outward splash at 100% Click
// Intensity — roughly what a firm flick already does via the hover brush.
const CLICK_BASE_STRENGTH = 6

const PRESSURE_ITERS = 30
const PARTICLE_ITERS = 2
const OVER_RELAXATION = 1.9

const FONT_STACK =
    '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'

// Glyph, and how many lit pixels it shows at a fixed size — the ramps are
// ordered by that measured weight rather than by eye, so density reads evenly.
type Glyph = [string, number]

const BASE: Glyph[] = [
    ["~", 12198],
    [":", 6921],
    ["-", 5589],
    ["·", 3267],
    [" ", 0],
    [" ", 0],
]

const RAMPS: Glyph[][] = [
    [["F", 26574], ["F", 26574], ["f", 17490], ...BASE],
    [["L", 21327], ["L", 21327], ["l", 14019], ...BASE],
    [["U", 32973], ["U", 32973], ["u", 24093], ...BASE],
    [["I", 14883], ["I", 14883], ["i", 13638], ...BASE],
    [["D", 36198], ["D", 36198], ["d", 30762], ...BASE],
]

// Sorted once here. The original sorted inside the render loop, which re-sorted
// five arrays for every cell of every frame.
const DICTS = RAMPS.map((ramp) =>
    [...ramp]
        .sort((a, b) => a[1] - b[1])
        .map(([char]) => char)
        .join("")
)

const DEFAULTS = {
    ink: "#00E8FF",
    cell: 9,
    fill: 10,
    ripple: 20,
    push: 20,
    speed: 8,
    slosh: 16,
    clickIntensity: 58,
}

type Config = typeof DEFAULTS

function clamp(v: number, lo: number, hi: number, fallback: number): number {
    const n = typeof v === "number" && isFinite(v) ? v : fallback
    return Math.max(lo, Math.min(hi, n))
}

/** Panel values are whole numbers; the solver wants the real ones. */
function settingsFor(cfg: Config) {
    return {
        cell: clamp(cfg.cell, 4, 24, DEFAULTS.cell),
        // Fraction of the tank that holds water at rest.
        waterLevel: 0.15 + clamp(cfg.fill, 1, 20, DEFAULTS.fill) * 0.04,
        // Fixed timestep — see the note in step().
        dt: (1 / 60) * (0.05 + clamp(cfg.speed, 1, 20, DEFAULTS.speed) * 0.04),
        // How much of each particle's own velocity survives the grid solve. Low
        // is syrup that forgets its motion; high keeps the small swirls alive,
        // and past about 0.95 the surface never settles at all.
        flipRatio: 0.6 + clamp(cfg.slosh, 1, 20, DEFAULTS.slosh) * 0.018,
        // Brush radius in tank units, and the tank is 2 units tall.
        radius: 0.05 + clamp(cfg.ripple, 1, 20, DEFAULTS.ripple) * 0.02,
        push: clamp(cfg.push, 0, 20, DEFAULTS.push) * 0.05,
        // A click's outward splash, as a fraction of the base strength.
        clickPush:
            CLICK_BASE_STRENGTH *
            (clamp(cfg.clickIntensity, 0, 200, DEFAULTS.clickIntensity) *
                0.01),
    }
}

const U_FIELD = 0
const FLUID_CELL = 0
const AIR_CELL = 1
const SOLID_CELL = 2

type Stir = {
    x: number
    y: number
    r: number
    vx: number
    vy: number
    strength: number
}

class FlipFluid {
    density: number
    fNumX: number
    fNumY: number
    h: number
    fInvSpacing: number
    fNumCells: number
    u: Float32Array
    v: Float32Array
    du: Float32Array
    dv: Float32Array
    prevU: Float32Array
    prevV: Float32Array
    p: Float32Array
    s: Float32Array
    cellType: Int32Array
    cellColor: Float32Array
    maxParticles: number
    particlePos: Float32Array
    particleVel: Float32Array
    particleDensity: Float32Array
    particleRestDensity = 0
    particleRadius: number
    pInvSpacing: number
    pNumX: number
    pNumY: number
    pNumCells: number
    numCellParticles: Int32Array
    firstCellParticle: Int32Array
    cellParticleIds: Int32Array
    numParticles = 0

    constructor(
        density: number,
        width: number,
        height: number,
        spacing: number,
        particleRadius: number,
        maxParticles: number
    ) {
        this.density = density
        this.fNumX = Math.floor(width / spacing)
        this.fNumY = Math.floor(height / spacing)
        this.h = Math.max(width / this.fNumX, height / this.fNumY)
        this.fInvSpacing = 1.0 / this.h
        this.fNumCells = this.fNumX * this.fNumY

        this.u = new Float32Array(this.fNumCells)
        this.v = new Float32Array(this.fNumCells)
        this.du = new Float32Array(this.fNumCells)
        this.dv = new Float32Array(this.fNumCells)
        this.prevU = new Float32Array(this.fNumCells)
        this.prevV = new Float32Array(this.fNumCells)
        this.p = new Float32Array(this.fNumCells)
        this.s = new Float32Array(this.fNumCells)
        this.cellType = new Int32Array(this.fNumCells)
        this.cellColor = new Float32Array(3 * this.fNumCells)

        this.maxParticles = maxParticles
        this.particlePos = new Float32Array(2 * maxParticles)
        this.particleVel = new Float32Array(2 * maxParticles)
        this.particleDensity = new Float32Array(this.fNumCells)

        this.particleRadius = particleRadius
        this.pInvSpacing = 1.0 / (2.2 * particleRadius)
        this.pNumX = Math.floor(width * this.pInvSpacing) + 1
        this.pNumY = Math.floor(height * this.pInvSpacing) + 1
        this.pNumCells = this.pNumX * this.pNumY

        this.numCellParticles = new Int32Array(this.pNumCells)
        this.firstCellParticle = new Int32Array(this.pNumCells + 1)
        this.cellParticleIds = new Int32Array(maxParticles)
    }

    integrateParticles(dt: number, gravity: number) {
        for (let i = 0; i < this.numParticles; i++) {
            this.particleVel[2 * i + 1] += dt * gravity
            this.particlePos[2 * i] += this.particleVel[2 * i] * dt
            this.particlePos[2 * i + 1] += this.particleVel[2 * i + 1] * dt
        }
    }

    /**
     * The pointer, as a brush on particle velocity.
     *
     * Blending toward the cursor velocity rather than adding to it keeps a fast
     * flick from launching the water off the top of the frame: the fastest a
     * particle can end up moving is exactly as fast as the cursor did.
     */
    stirParticles(stir: Stir) {
        const r2 = stir.r * stir.r
        for (let i = 0; i < this.numParticles; i++) {
            const dx = this.particlePos[2 * i] - stir.x
            const dy = this.particlePos[2 * i + 1] - stir.y
            const d2 = dx * dx + dy * dy
            if (d2 > r2) continue
            const w = (1 - Math.sqrt(d2) / stir.r) * stir.strength
            this.particleVel[2 * i] += (stir.vx - this.particleVel[2 * i]) * w
            this.particleVel[2 * i + 1] +=
                (stir.vy - this.particleVel[2 * i + 1]) * w
        }
    }

    /**
     * A click, as a radial outward + upward kick — distinct from the hover
     * brush, which only ever blends particles toward the cursor's own
     * velocity. The upward bias is what makes it read as a splash: gravity
     * and the incompressible solve pull the kicked water back down and out
     * across the surface on their own, rather than it just shoving sideways.
     */
    splashParticles(x: number, y: number, r: number, strength: number) {
        const r2 = r * r
        for (let i = 0; i < this.numParticles; i++) {
            const dx = this.particlePos[2 * i] - x
            const dy = this.particlePos[2 * i + 1] - y
            const d2 = dx * dx + dy * dy
            if (d2 > r2 || d2 === 0) continue
            const d = Math.sqrt(d2)
            const w = (1 - d / r) * strength
            this.particleVel[2 * i] += (dx / d) * w
            this.particleVel[2 * i + 1] += (dy / d) * w + w * 0.5
        }
    }

    pushParticlesApart(numIters: number) {
        this.numCellParticles.fill(0)

        for (let i = 0; i < this.numParticles; i++) {
            const xi = clamp(
                Math.floor(this.particlePos[2 * i] * this.pInvSpacing),
                0,
                this.pNumX - 1,
                0
            )
            const yi = clamp(
                Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing),
                0,
                this.pNumY - 1,
                0
            )
            this.numCellParticles[xi * this.pNumY + yi]++
        }

        let first = 0
        for (let i = 0; i < this.pNumCells; i++) {
            first += this.numCellParticles[i]
            this.firstCellParticle[i] = first
        }
        this.firstCellParticle[this.pNumCells] = first

        for (let i = 0; i < this.numParticles; i++) {
            const xi = clamp(
                Math.floor(this.particlePos[2 * i] * this.pInvSpacing),
                0,
                this.pNumX - 1,
                0
            )
            const yi = clamp(
                Math.floor(this.particlePos[2 * i + 1] * this.pInvSpacing),
                0,
                this.pNumY - 1,
                0
            )
            const cellNr = xi * this.pNumY + yi
            this.firstCellParticle[cellNr]--
            this.cellParticleIds[this.firstCellParticle[cellNr]] = i
        }

        const minDist = 2.0 * this.particleRadius
        const minDist2 = minDist * minDist

        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 0; i < this.numParticles; i++) {
                const px = this.particlePos[2 * i]
                const py = this.particlePos[2 * i + 1]

                const pxi = Math.floor(px * this.pInvSpacing)
                const pyi = Math.floor(py * this.pInvSpacing)
                const x0 = Math.max(pxi - 1, 0)
                const y0 = Math.max(pyi - 1, 0)
                const x1 = Math.min(pxi + 1, this.pNumX - 1)
                const y1 = Math.min(pyi + 1, this.pNumY - 1)

                for (let xi = x0; xi <= x1; xi++) {
                    for (let yi = y0; yi <= y1; yi++) {
                        const cellNr = xi * this.pNumY + yi
                        const start = this.firstCellParticle[cellNr]
                        const last = this.firstCellParticle[cellNr + 1]
                        for (let j = start; j < last; j++) {
                            const id = this.cellParticleIds[j]
                            if (id === i) continue
                            let dx = this.particlePos[2 * id] - px
                            let dy = this.particlePos[2 * id + 1] - py
                            const d2 = dx * dx + dy * dy
                            if (d2 > minDist2 || d2 === 0.0) continue
                            const d = Math.sqrt(d2)
                            const s = (0.5 * (minDist - d)) / d
                            dx *= s
                            dy *= s
                            this.particlePos[2 * i] -= dx
                            this.particlePos[2 * i + 1] -= dy
                            this.particlePos[2 * id] += dx
                            this.particlePos[2 * id + 1] += dy
                        }
                    }
                }
            }
        }
    }

    handleWallCollisions() {
        const h = 1.0 / this.fInvSpacing
        const r = this.particleRadius
        const minX = h + r
        const maxX = (this.fNumX - 1) * h - r
        const minY = h + r
        const maxY = (this.fNumY - 1) * h - r

        for (let i = 0; i < this.numParticles; i++) {
            let x = this.particlePos[2 * i]
            let y = this.particlePos[2 * i + 1]

            if (x < minX) {
                x = minX
                this.particleVel[2 * i] = 0.0
            }
            if (x > maxX) {
                x = maxX
                this.particleVel[2 * i] = 0.0
            }
            if (y < minY) {
                y = minY
                this.particleVel[2 * i + 1] = 0.0
            }
            if (y > maxY) {
                y = maxY
                this.particleVel[2 * i + 1] = 0.0
            }
            this.particlePos[2 * i] = x
            this.particlePos[2 * i + 1] = y
        }
    }

    updateParticleDensity() {
        const n = this.fNumY
        const h = this.h
        const h1 = this.fInvSpacing
        const h2 = 0.5 * h
        const d = this.particleDensity
        d.fill(0.0)

        for (let i = 0; i < this.numParticles; i++) {
            const x = clamp(this.particlePos[2 * i], h, (this.fNumX - 1) * h, h)
            const y = clamp(
                this.particlePos[2 * i + 1],
                h,
                (this.fNumY - 1) * h,
                h
            )

            const x0 = Math.floor((x - h2) * h1)
            const tx = (x - h2 - x0 * h) * h1
            const x1 = Math.min(x0 + 1, this.fNumX - 2)

            const y0 = Math.floor((y - h2) * h1)
            const ty = (y - h2 - y0 * h) * h1
            const y1 = Math.min(y0 + 1, this.fNumY - 2)

            const sx = 1.0 - tx
            const sy = 1.0 - ty

            if (x0 < this.fNumX && y0 < this.fNumY) d[x0 * n + y0] += sx * sy
            if (x1 < this.fNumX && y0 < this.fNumY) d[x1 * n + y0] += tx * sy
            if (x1 < this.fNumX && y1 < this.fNumY) d[x1 * n + y1] += tx * ty
            if (x0 < this.fNumX && y1 < this.fNumY) d[x0 * n + y1] += sx * ty
        }

        // Measured once, off the first settled frame — every later frame is
        // compared against it to decide what counts as compressed.
        if (this.particleRestDensity === 0.0) {
            let sum = 0.0
            let numFluidCells = 0
            for (let i = 0; i < this.fNumCells; i++) {
                if (this.cellType[i] === FLUID_CELL) {
                    sum += d[i]
                    numFluidCells++
                }
            }
            if (numFluidCells > 0)
                this.particleRestDensity = sum / numFluidCells
        }
    }

    transferVelocities(toGrid: boolean, flipRatio = 0) {
        const n = this.fNumY
        const h = this.h
        const h1 = this.fInvSpacing
        const h2 = 0.5 * h

        if (toGrid) {
            this.prevU.set(this.u)
            this.prevV.set(this.v)
            this.du.fill(0.0)
            this.dv.fill(0.0)
            this.u.fill(0.0)
            this.v.fill(0.0)

            for (let i = 0; i < this.fNumCells; i++)
                this.cellType[i] = this.s[i] === 0.0 ? SOLID_CELL : AIR_CELL

            for (let i = 0; i < this.numParticles; i++) {
                const xi = clamp(
                    Math.floor(this.particlePos[2 * i] * h1),
                    0,
                    this.fNumX - 1,
                    0
                )
                const yi = clamp(
                    Math.floor(this.particlePos[2 * i + 1] * h1),
                    0,
                    this.fNumY - 1,
                    0
                )
                const cellNr = xi * n + yi
                if (this.cellType[cellNr] === AIR_CELL)
                    this.cellType[cellNr] = FLUID_CELL
            }
        }

        for (let component = 0; component < 2; component++) {
            const dx = component === U_FIELD ? 0.0 : h2
            const dy = component === U_FIELD ? h2 : 0.0

            const f = component === U_FIELD ? this.u : this.v
            const prevF = component === U_FIELD ? this.prevU : this.prevV
            const acc = component === U_FIELD ? this.du : this.dv

            for (let i = 0; i < this.numParticles; i++) {
                const x = clamp(
                    this.particlePos[2 * i],
                    h,
                    (this.fNumX - 1) * h,
                    h
                )
                const y = clamp(
                    this.particlePos[2 * i + 1],
                    h,
                    (this.fNumY - 1) * h,
                    h
                )

                const x0 = Math.min(Math.floor((x - dx) * h1), this.fNumX - 2)
                const tx = (x - dx - x0 * h) * h1
                const x1 = Math.min(x0 + 1, this.fNumX - 2)

                const y0 = Math.min(Math.floor((y - dy) * h1), this.fNumY - 2)
                const ty = (y - dy - y0 * h) * h1
                const y1 = Math.min(y0 + 1, this.fNumY - 2)

                const sx = 1.0 - tx
                const sy = 1.0 - ty

                const d0 = sx * sy
                const d1 = tx * sy
                const d2 = tx * ty
                const d3 = sx * ty

                const nr0 = x0 * n + y0
                const nr1 = x1 * n + y0
                const nr2 = x1 * n + y1
                const nr3 = x0 * n + y1

                if (toGrid) {
                    const pv = this.particleVel[2 * i + component]
                    f[nr0] += pv * d0
                    acc[nr0] += d0
                    f[nr1] += pv * d1
                    acc[nr1] += d1
                    f[nr2] += pv * d2
                    acc[nr2] += d2
                    f[nr3] += pv * d3
                    acc[nr3] += d3
                } else {
                    // A face only carries usable velocity if a cell on one side
                    // of it holds fluid; sampling an all-air face drags the
                    // particle toward a number nothing ever wrote.
                    const offset = component === U_FIELD ? n : 1
                    const valid0 =
                        this.cellType[nr0] !== AIR_CELL ||
                        this.cellType[nr0 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid1 =
                        this.cellType[nr1] !== AIR_CELL ||
                        this.cellType[nr1 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid2 =
                        this.cellType[nr2] !== AIR_CELL ||
                        this.cellType[nr2 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0
                    const valid3 =
                        this.cellType[nr3] !== AIR_CELL ||
                        this.cellType[nr3 - offset] !== AIR_CELL
                            ? 1.0
                            : 0.0

                    const vOld = this.particleVel[2 * i + component]
                    const d =
                        valid0 * d0 + valid1 * d1 + valid2 * d2 + valid3 * d3

                    if (d > 0.0) {
                        const picV =
                            (valid0 * d0 * f[nr0] +
                                valid1 * d1 * f[nr1] +
                                valid2 * d2 * f[nr2] +
                                valid3 * d3 * f[nr3]) /
                            d
                        const corr =
                            (valid0 * d0 * (f[nr0] - prevF[nr0]) +
                                valid1 * d1 * (f[nr1] - prevF[nr1]) +
                                valid2 * d2 * (f[nr2] - prevF[nr2]) +
                                valid3 * d3 * (f[nr3] - prevF[nr3])) /
                            d
                        const flipV = vOld + corr
                        this.particleVel[2 * i + component] =
                            (1.0 - flipRatio) * picV + flipRatio * flipV
                    }
                }
            }

            if (toGrid) {
                for (let i = 0; i < f.length; i++) {
                    if (acc[i] > 0.0) f[i] /= acc[i]
                }

                for (let i = 0; i < this.fNumX; i++) {
                    for (let j = 0; j < this.fNumY; j++) {
                        const solid = this.cellType[i * n + j] === SOLID_CELL
                        if (
                            solid ||
                            (i > 0 &&
                                this.cellType[(i - 1) * n + j] === SOLID_CELL)
                        )
                            this.u[i * n + j] = this.prevU[i * n + j]
                        if (
                            solid ||
                            (j > 0 &&
                                this.cellType[i * n + j - 1] === SOLID_CELL)
                        )
                            this.v[i * n + j] = this.prevV[i * n + j]
                    }
                }
            }
        }
    }

    solveIncompressibility(
        numIters: number,
        dt: number,
        overRelaxation: number
    ) {
        this.p.fill(0.0)
        this.prevU.set(this.u)
        this.prevV.set(this.v)

        const n = this.fNumY
        const cp = (this.density * this.h) / dt

        for (let iter = 0; iter < numIters; iter++) {
            for (let i = 1; i < this.fNumX - 1; i++) {
                for (let j = 1; j < this.fNumY - 1; j++) {
                    if (this.cellType[i * n + j] !== FLUID_CELL) continue

                    const center = i * n + j
                    const left = (i - 1) * n + j
                    const right = (i + 1) * n + j
                    const bottom = i * n + j - 1
                    const top = i * n + j + 1

                    const sx0 = this.s[left]
                    const sx1 = this.s[right]
                    const sy0 = this.s[bottom]
                    const sy1 = this.s[top]
                    const s = sx0 + sx1 + sy0 + sy1
                    if (s === 0.0) continue

                    let div =
                        this.u[right] -
                        this.u[center] +
                        this.v[top] -
                        this.v[center]

                    // Particles clump slightly on every step; without pushing
                    // back on cells denser than rest, the pool slowly collapses
                    // into one thin dark band along the floor.
                    if (this.particleRestDensity > 0.0) {
                        const compression =
                            this.particleDensity[center] -
                            this.particleRestDensity
                        if (compression > 0.0) div -= compression
                    }

                    let p = -div / s
                    p *= overRelaxation
                    this.p[center] += cp * p

                    this.u[center] -= sx0 * p
                    this.u[right] += sx1 * p
                    this.v[center] -= sy0 * p
                    this.v[top] += sy1 * p
                }
            }
        }
    }

    /**
     * Density to brightness, as a fourfold triangle wave rather than a ramp.
     * A plain ramp gives an even grey sheet; folding it four times draws the
     * contour bands that make the surface read as moving water in type.
     */
    private setBandedColor(cellNr: number, val: number, maxVal: number) {
        const v = Math.min(Math.max(val, 0), maxVal - 0.0001) / maxVal
        const m = 0.25
        const num = Math.floor(v / m)
        const s = (v - num * m) / m
        this.cellColor[3 * cellNr] = num === 0 || num === 2 ? s : 1.0 - s
    }

    updateCellColors() {
        this.cellColor.fill(0.0)
        for (let i = 0; i < this.fNumCells; i++) {
            if (this.cellType[i] === FLUID_CELL) {
                let d = this.particleDensity[i]
                if (this.particleRestDensity > 0.0)
                    d /= this.particleRestDensity
                this.setBandedColor(i, d, 2.0)
            }
        }
    }

    simulate(
        dt: number,
        gravity: number,
        flipRatio: number,
        stir: Stir | null
    ) {
        this.integrateParticles(dt, gravity)
        if (stir) this.stirParticles(stir)
        this.pushParticlesApart(PARTICLE_ITERS)
        this.handleWallCollisions()
        this.transferVelocities(true)
        this.updateParticleDensity()
        this.solveIncompressibility(PRESSURE_ITERS, dt, OVER_RELAXATION)
        this.transferVelocities(false, flipRatio)
        this.updateCellColors()
    }
}

// One shared 2D context, only ever asked how wide a character is.
let metricCtx: CanvasRenderingContext2D | null = null
function measureAdvance(size: number): number {
    if (!metricCtx)
        metricCtx = document.createElement("canvas").getContext("2d")
    if (!metricCtx) return size * 0.6
    metricCtx.font = `700 ${size}px ${FONT_STACK}`
    return metricCtx.measureText("M").width || size * 0.6
}

class AsciiWaveScene {
    private container: HTMLElement
    private pre: HTMLPreElement
    private cfg: Config
    private fluid: FlipFluid | null = null
    private width = 0
    private height = 0
    private cell = 0
    private frameId = 0
    private lastT = 0
    private disposed = false

    // Pointer state, in tank units.
    private stirX = 0
    private stirY = 0
    private stirVX = 0
    private stirVY = 0
    private stirOn = false
    private lastPointerT = 0

    // Click state, in tank units — a single-frame splash flag.
    private clickX = 0
    private clickY = 0
    private clickPending = false

    constructor(container: HTMLElement, cfg: Config) {
        this.container = container
        this.cfg = cfg

        this.pre = document.createElement("pre")
        Object.assign(this.pre.style, {
            position: "absolute",
            inset: "0",
            margin: "0",
            padding: "0",
            overflow: "hidden",
            whiteSpace: "pre",
            fontFamily: FONT_STACK,
            fontWeight: "700",
            pointerEvents: "none",
            userSelect: "none",
            color: cfg.ink,
        })
        container.appendChild(this.pre)

        container.addEventListener("pointerenter", this.onEnter)
        container.addEventListener("pointermove", this.onMove)
        container.addEventListener("pointerleave", this.onLeave)
        container.addEventListener("pointercancel", this.onLeave)
        container.addEventListener("pointerdown", this.onDown)
    }

    private toTank(e: PointerEvent) {
        const f = this.fluid
        if (!f || this.cell <= 0) return null
        const rect = this.container.getBoundingClientRect()
        // The readout is the tank minus its crop, so pixel (0,0) is the cell at
        // column CROP_X, row fNumY - CROP_Y; tank rows run up, pixels run down.
        const col = CROP_X + (e.clientX - rect.left) / this.cell
        const row = f.fNumY - CROP_Y - (e.clientY - rect.top) / this.cell
        return { x: col * f.h, y: row * f.h }
    }

    private onEnter = (e: PointerEvent) => {
        const p = this.toTank(e)
        if (!p) return
        // Entering is a jump, not a stroke — take the position but no velocity,
        // or the water gets kicked by however far away the pointer last was.
        this.stirX = p.x
        this.stirY = p.y
        this.stirVX = 0
        this.stirVY = 0
        this.stirOn = true
        this.lastPointerT = performance.now()
    }

    private onMove = (e: PointerEvent) => {
        if (!this.stirOn) {
            this.onEnter(e)
            return
        }
        const p = this.toTank(e)
        if (!p) return
        const now = performance.now()
        // Floored, because two moves inside the same millisecond would divide
        // by nearly zero and hand the brush an enormous velocity.
        const elapsed = Math.max((now - this.lastPointerT) / 1000, 0.008)
        this.lastPointerT = now
        this.stirVX = clamp(
            (p.x - this.stirX) / elapsed,
            -STIR_MAX_SPEED,
            STIR_MAX_SPEED,
            0
        )
        this.stirVY = clamp(
            (p.y - this.stirY) / elapsed,
            -STIR_MAX_SPEED,
            STIR_MAX_SPEED,
            0
        )
        this.stirX = p.x
        this.stirY = p.y
    }

    private onLeave = () => {
        this.stirOn = false
        this.stirVX = 0
        this.stirVY = 0
    }

    private onDown = (e: PointerEvent) => {
        const p = this.toTank(e)
        if (!p) return
        this.clickX = p.x
        this.clickY = p.y
        this.clickPending = true
    }

    setSize(width: number, height: number) {
        if (this.disposed) return
        if (width === this.width && height === this.height) return
        this.width = width
        this.height = height
        this.build()
    }

    updateConfig(cfg: Config) {
        if (this.disposed) return
        const prev = this.cfg
        this.cfg = cfg
        this.pre.style.color = cfg.ink
        // Only the two controls deciding how much water there is and how finely
        // it is diced own buffers; the rest are read fresh every frame.
        if (cfg.cell !== prev.cell || cfg.fill !== prev.fill) this.build()
    }

    private build() {
        if (this.width <= 0 || this.height <= 0) return
        const S = settingsFor(this.cfg)

        this.cell = S.cell
        this.pre.style.fontSize = `${S.cell}px`
        this.pre.style.lineHeight = `${S.cell}px`
        // Measure the real advance and pad it out to a full cell, so the grid
        // stays square whichever monospace face actually resolves.
        this.pre.style.letterSpacing = `${S.cell - measureAdvance(S.cell)}px`

        const cols = Math.ceil(this.width / S.cell) + CROP_X * 2
        const rows = Math.ceil(this.height / S.cell) + CROP_Y * 2

        const h = SIM_HEIGHT / rows
        const tankWidth = h * cols

        const r = 0.3 * h
        const dx = 2.0 * r
        const dy = (Math.sqrt(3.0) / 2.0) * dx

        const numX = Math.floor((tankWidth - 2.0 * h - 2.0 * r) / dx)
        const numY = Math.floor(
            (S.waterLevel * SIM_HEIGHT - 2.0 * h - 2.0 * r) / dy
        )
        if (numX <= 0 || numY <= 0) return

        const f = new FlipFluid(1000.0, tankWidth, SIM_HEIGHT, h, r, numX * numY)
        f.numParticles = numX * numY

        let p = 0
        const xOffset = (tankWidth - numX * dx) / 2
        for (let i = 0; i < numX; i++) {
            for (let j = 0; j < numY; j++) {
                // Rows staggered by half a spacing: a square lattice settles
                // into visible columns and the surface reads as corduroy.
                f.particlePos[p++] =
                    h + r + dx * i + (j % 2 === 0 ? 0.0 : r) + xOffset
                f.particlePos[p++] = h + r + dy * j
            }
        }

        const n = f.fNumY
        for (let i = 0; i < f.fNumX; i++) {
            for (let j = 0; j < f.fNumY; j++) {
                f.s[i * n + j] =
                    i === 0 || i === f.fNumX - 1 || j === 0 ? 0.0 : 1.0
            }
        }

        this.fluid = f
    }

    start() {
        this.lastT = performance.now()
        const loop = () => {
            if (this.disposed) return
            this.step()
            this.frameId = requestAnimationFrame(loop)
        }
        this.frameId = requestAnimationFrame(loop)
    }

    private step() {
        const f = this.fluid
        if (!f) return
        const S = settingsFor(this.cfg)

        const now = performance.now()
        let wall = (now - this.lastT) / 1000
        this.lastT = now
        if (!isFinite(wall) || wall < 0) wall = 0
        if (wall > 0.05) wall = 0.05

        // Fixed step, deliberately: FLIP has a stability limit, and scaling the
        // step by frame time lets one long frame push the solve past it — the
        // pool then blows apart and never recovers. Wall time is used only for
        // the brush decay below, which has no such limit.
        /*
         * The brush only exists while the cursor is actually travelling.
         *
         * It blends particle velocity toward the cursor's, and a cursor that is
         * merely sitting there has a velocity of zero — so leaving it switched
         * on turned it into a patch of infinite drag that cancelled gravity for
         * every particle under it. Water dragged upward stopped dead at the
         * pointer and hung there in mid-air instead of falling back. Below this
         * threshold there is no brush at all, and gravity has the water to
         * itself again.
         */
        if (this.clickPending) {
            if (S.clickPush > 0) {
                f.splashParticles(
                    this.clickX,
                    this.clickY,
                    S.radius * 1.6,
                    S.clickPush
                )
            }
            this.clickPending = false
        }

        const stirring =
            Math.hypot(this.stirVX, this.stirVY) > STIR_MIN_SPEED

        f.simulate(
            S.dt,
            GRAVITY,
            S.flipRatio,
            stirring && S.push > 0
                ? {
                      x: this.stirX,
                      y: this.stirY,
                      r: S.radius,
                      vx: this.stirVX,
                      vy: this.stirVY,
                      strength: S.push,
                  }
                : null
        )

        // A pointer that stops moving stops fanning the water; without this the
        // last move event keeps pushing forever.
        const decay = Math.exp(-wall * 10)
        this.stirVX *= decay
        this.stirVY *= decay

        this.render()
    }

    private render() {
        const f = this.fluid
        if (!f) return
        const rows: string[] = []
        for (let i = f.fNumY - CROP_Y; i > CROP_Y; i--) {
            let row = ""
            for (let j = CROP_X; j < f.fNumX - CROP_X; j++) {
                const dict = DICTS[(i + j + 1) % DICTS.length]
                const c = f.cellColor[3 * (j * f.fNumY + i)]
                const k = Math.floor(c * dict.length)
                row += dict[Math.min(dict.length - 1, Math.max(0, k))]
            }
            rows.push(row)
        }
        this.pre.textContent = rows.join("\n")
    }

    dispose() {
        this.disposed = true
        cancelAnimationFrame(this.frameId)
        this.container.removeEventListener("pointerenter", this.onEnter)
        this.container.removeEventListener("pointermove", this.onMove)
        this.container.removeEventListener("pointerleave", this.onLeave)
        this.container.removeEventListener("pointercancel", this.onLeave)
        this.container.removeEventListener("pointerdown", this.onDown)
        this.pre.remove()
        this.fluid = null
    }
}

export interface AsciiWaveProps {
    ink?: string
    cell?: number
    fill?: number
    ripple?: number
    push?: number
    speed?: number
    slosh?: number
    clickIntensity?: number
    style?: React.CSSProperties
}

export default function AsciiWave(props: AsciiWaveProps) {
    const {
        ink = DEFAULTS.ink,
        cell = DEFAULTS.cell,
        fill = DEFAULTS.fill,
        ripple = DEFAULTS.ripple,
        push = DEFAULTS.push,
        speed = DEFAULTS.speed,
        slosh = DEFAULTS.slosh,
        clickIntensity = DEFAULTS.clickIntensity,
        style,
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const sceneRef = useRef<AsciiWaveScene | null>(null)
    const cfgRef = useRef<Config>(null as any)
    cfgRef.current = {
        ink,
        cell,
        fill,
        ripple,
        push,
        speed,
        slosh,
        clickIntensity,
    }

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const scene = new AsciiWaveScene(container, cfgRef.current)
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
    }, [ink, cell, fill, ripple, push, speed, slosh, clickIntensity])

    return (
        <div
            ref={containerRef}
            role="img"
            aria-label="A pool of water drawn in monospace characters, stirred by the pointer"
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

AsciiWave.displayName = "Ascii Water"
AsciiWave.defaultProps = { ...DEFAULTS }
