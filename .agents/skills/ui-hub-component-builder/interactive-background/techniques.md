# Interactive Background — Techniques

Tactics mapped from verified implementations. Each entry has: what to write,
seen proof, and "usage rules" to apply verbatim when generating.

## T1. Particle field with spring-return to base

Every particle has `baseX/baseY`; when pointer enters radius, repulse; loop
returns toward base with spring. Pointer vector stored in refs, not state.

**Proof:** `MagneticBackground.tsx` (particles spring to base), `KineticGrid`,
`MouseGravityBackground`.

**Rules:** count from area (`particleCount = area / 12000`); repulsion radius and
spring constant as props (`PULL`, `R`); render additive for glow.

## T2. Normalized 3D projection disk (pseudo-3D background)

Common: rotate a flat particle cloud by Z, project via perspective `scale =
1 / (1 + depth*focal)`; paint sorted. 

**Proof:** `BlackHole.tsx` (relativistic speeds + `scale(focal/(focal+depth))`).

**Rules:** sort by depth each frame (done in Array) OR sort only near changes;
keep `pointerEvents:none`; DPR cap `min(dpr, 1.5)`.

## T3. Rendered spot-light pointer glow / chamber spotlight

Draw a soft radial gradient centered on pointer with additive blend; let it fade
via `destination-out` on trail layer.

**Proof:** InteractiveGridBackground glow, BeamGridBackground beams toward
pointer, MouseGravityBackground trails.

## T4. Verlet / spring physics on springs + fixed substeps

Grid of masses connected by springs (cloth, web); integrate with fixed dt
substeps to avoid explosion; update positions, then constrain.

**Proof:** `spider-web.tsx` (spring network, squared falloff repel),
`Chandelier.tsx` (Verlet-ish cloth).

**Rules:** fixed-step render (not `accumTime += dt` inline), cap substeps,
park rAF at rest (`energy < threshold`).

## T5. Heat/signal cell buffer

Grid buffer stores per-cell "energy"; pointer deposits heat with falloff; each
frame decays + advects. Render read-grid | write-grid ping-pong.

**Proof:** `FrostGlassMelt.tsx` (temperature matrix mapped to frost alpha).
`AsciiWater` FLIP is the fluid version of the same ping-pong idea.

## T6. Grass/strand noise-current

Motes sample a scrolling value-noise field; each mote has `time`/`speed`,
sample `noise(x+time, y+time)` for displacement; ease silhouette via quadratic
grip on pointer.

**Proof:** `InfiniteTendrils.tsx`.

**Rules:** 2 value-noise fields; scroll fields with `t`; cap particle count;
route follow via `followPointer` prop (default true).

## T7. FLIP fluid

Puck the classic "Fluid Layout" (FLIP) implementation: double-buffered grids for
dye/velocity/pressure; Gauss–Seidel solve `p += (div - p) / 4` iterations; blend
both directions with `dissolve`; `ctx.putImageData` per cell.

**Proof:** `AsciiWater.tsx` (`FLIP` const :18, fixed-step substeps :928, glyph
render via `<pre>` hidden element :757).

**Rules:** clamp accum | fixed step | substeps < 8 to stay realtime:
```
while (accumulated >= dt) { ctx.step(dt); accumulated -= dt; }
```

## T8. Ray-marched ocean / volumetric

Fullscreen triangle; march a ray through heightfield density; shade with depth;
log-space steps clamp.

**Proof:** `OceanSwell.tsx` (68-step march :338, NOISE_INTENSITY, film layer).

**Rules:** DPR 1.25 max; `dprMax` prop; too expensive → fall back density to
`fbm` 4 octaves (OceanSwell NOISE_OCTAVES 4).

## T9. Raw WebGL with GLSL shaders

Use `canvas.getContext('webgl', {antialias:false})`; fragment shader as string;
get uniform locations once; set once per frame; call `gl.drawArrays` with a
fullscreen triangle (3 verts). No external deps; works in all targeted browsers.

**Proof:** `ReflectShader.tsx` (styles HTML canvas + GL), `HellBackground`,
`Lightfall` (39-iter), `WaveBackground` (vertex + frag), `GravitationalVortex`,
`MorphingRings`, `BloomingFlower`, `PointDNAHelix`, `TwinGalaxyRings`.

## T10. three.js InstancedMesh/Points lovers

Use `THREE.InstancedMesh` + `setMatrixAt` per frame (Tornado, ParticleSphere);
`THREE.Points` for billboarded point clouds (GlobeMesh icosahedron);
`ShaderMaterial` uniforms for per-element styling.

**Rules:** one renderer per component; DPR cap; dispose on unmount; cull via
`instanceMatrix` update only (no per-face buffer destroy).

## T11. Beat-synced vml-waves (InfoMedia-like band sweep)

Size the wave function to loop on a beat: shift harmonics by `uTime` on a
periodic saw; add second frequency; keep everything additive.

**Proof:** `BlockDrift.tsx` slide per gap/beat; `GravitationalVortex` log spiral,
`TwinGalaxyRings` log spiral arms.

## T12. Mouse position → shader unproject (three.js)

Convert pointer to NDC → `raycaster.setFromCamera` → intersect plane at
`y = CAM_HEIGHT` → write into uniform. Enables pointer-grass / pointer-push in
3D spaces with zero DOM layout reads.

**Proof:** `TwinGalaxyRings.tsx:1030-1038` (unproject to ground plane),
`Tornado.tsx` (clip-space pointer repel).

## T13. Hover-driven scalar via framer `motionValue`

`const hover = useMotionValue(0)`; `animate(hover, 1, {duration})` on enter of a
wrapper div; feed into canvas via `hover.get()` each frame. Keeps React off the
per-frame path.

**Proof:** `MorphingRings.tsx:453/669`, `PointDNAHelix.tsx:886`,
`TwinGalaxyRings.tsx:990`, `GlobeMesh` (hover arc).

## T14. Drag-to-spin with inertia

Drag: origin at pointerdown, delta to pivot → update yaw/pitch with clamp
(`MAX_PITCH`); release → damp momentum `velocity *= decay` until rest.

**Proof:** `OceanSwell.tsx:392-393/482` + inertia, `ParticleSphere.tsx:879`
(drag-throw with momentum decay).

## T15. DOM grid with per-cell flash on hover

Map (row, col) → motion.div; on hover, flash the hovered cell + neighbors.

**Proof:** `isometric-grid-background.tsx` + `background-boxes.tsx`.

**Rules:** use `transform`-only; `will-change-transform`; stagger delays for
motion-sequences (framer `transition`).

## T16. SVG animated path backgrounds

`pathLength`, `strokeDasharray="1"` + `strokeDashoffset`, animate with
`repeat: Infinity`, durations `20+rand*10`, per-path delays.

**Proof:** `background-paths.tsx` (FloatingPaths, 36 paths).

## T17. tsParticles drop-in

`loadSlim` + `<Particles id={id} options={...} particlesLoaded={...}>`. Control
opacity from mount (render after `particlesLoaded`).

**Proof:** `sparkles-background.tsx`, `sparkles.tsx` (radius/maskImage fade).

## T18. Hidden `<pre>` glyph grid for ASCII render

Render numeric/ASCII art by writing textContent into a hidden single `<pre>`
(browser won't reflow); paint it each frame with fixed color cells.

**Proof:** `AsciiWater.tsx:757`.

## T19. DPR-aware blur vignette overlay

DOM overlay with CSS radial gradients + backdrop blur for cinematic frame of
shader/gl effects. Style from component CSS (matching brand glass).

**Proof:** WaveBackground `blurClassMap` backdrop-blur; GlassMorph premium
(backdrop layer + noise).

## T20. Premultiplied additive scattering for performance

Use `ONE, ONE_MINUS_SRC_ALPHA` blend with precomputed alpha from radius/density
(Gaussian widths in instanced quads). This is what lets 20k-100k points run
smoothly (GravitationalVortex ~20k instanced quads, BloomingFlower 60-100k).

**Rules:** precompute per-particle `size/alpha` at init; fade with `uOpacity`;
multiply final alpha.

## T21. Staged entrance / scrubbed scene loading

Fade the canvas in after `pointerdown`-free startup OR delay start until the
scene's initial pose has been built (entrance animation on `mount`). Prevents
white-flash on library cards.

**Proof:** `Tornado.tsx` staged entrance; `OceanSwell` fade in; StarBurst
static-frames for thumbnails.