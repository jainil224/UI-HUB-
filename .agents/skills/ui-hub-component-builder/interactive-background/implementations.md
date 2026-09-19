# Interactive Background — Implementations

Every relevant, verified Interactive Background implementation.
Paths relative to `frontend/src/components/ui/`. Registry references
`frontend/src/data/componentData.tsx`.

Legend: Renderer (C2 = Canvas2D, WGL = raw WebGL, T3 = three.js, DOM = CSS/DOM,
SVG, TP = tsparticles) · Interaction (P = pointer/mouse, H = hover, S = scroll,
A = ambient/continuous, D = drag) · `-` = unregistered.

## Canvas 2D Group

| # | Component (slug) | File | Interaction | Technique summary |
|---|---|---|---|---|
| 1 | SpaceBackground (`space-background`) | `SpaceBackground.tsx` | P / A | Stars, nebulas (radial gradients), shooting stars, fragments; mouse lerped via two refs (`mouse`+`targetMouse`); one rAF loop; `interactive` prop (default true); `starCount=400`, `nebulaCount=6`. No libs. |
| 2 | BeamGridBackground | `BeamGridBackground.tsx` | P / A (idle drift) | Grid+beams canvas; **static grid pre-rendered to offscreen canvas** (:91-97); `mousemove` on container (:143); beams lerp toward pointer with idle-speed drift; additive composite; dark-mode detection; `interactive` default true. |
| 3 | HackerBackground (`hacker-background`) | `HackerBackground.tsx` | A | Matrix rain; `setInterval` column drops (speed `33`, font `15`); fade overlay; DPR scaling; ResizeObserver. |
| 4 | MagneticBackground (`magnetic-background` - unregistered; lazy map `componentData.tsx:2682`) | `MagneticBackground.tsx` | P / A | Purple/blue particle field; particles spring back to `baseX/baseY`, pulled by mouse; `container` or window `mousemove` (:87-90); rAF; count = area/12000. |
| 5 | MouseGravityBackground (premium) | `MouseGravityBackground.tsx` | P / A | Particles orbit/fall into pointer gravity well; `attractionRadius=300`, `attractionForce=0.05`, `enableTrail`; rAF; additive traces. |
| 6 | KineticGrid (`kinetic-grid`) | `KineticGrid.tsx` | P / A | Dot-mesh; GAP/R/PULL spring physics; pointer repulsion + faint trailing lines; `mousemove` (:183); `useIsStaticRenderer()` switch. |
| 7 | InteractiveGridBackground (premium) | `InteractiveGridBackground.tsx` | P / A | Grid cells lerp to **idle targets** when pointer leaves; glow radius 40; `mousemove` (:98); dark-mode aware. |
| 8 | BlackHole (`black-hole-3d`) | `BlackHole.tsx` | A (props position/tilt) | **Two stacked canvases** (:236-237); Z-sorted 3D-projected particle disk, relativistic speeds; trails via `destination-out`; central rim-lit sphere; DPR cap 1.5; `pointerEvents:none` (:522). |
| 9 | BlackHoleBackground (premium) | `BlackHoleBackground.tsx` | P / A | Orbiting debris + event horizon; pointer distort/drag; `mousemove` (:160); DPR `min(dpr,2)`; rAF. |
| 10 | StarBurst (`star-burst`) | `StarBurst.tsx` | A | Radial streaks (15-pulse spokes, seeded RNG), radial-gradient core; one rAF `loop` (:294-300); additive `lighter`; `isStatic` mode draws 60 frames for thumbnails; DPR cap 2. |
| 11 | spider-web (`spider-web`) | `spider-web.tsx` | P | Spring-mass web canvas; pointer pushes nearest nodes with squared falloff (:299-305); **rAF parks when `energy<0.5` and no pointer** (:329); `mousemove`-style `pointermove` (:224). |
| 12 | Chandelier (premium) | `Chandelier.tsx` | D (grab cloth) | Cloth simulation; text-phrase cells on deformed grid; `pointermove`+`pointerdown` grab (:388-393); wind/gravity/stretch props; Verlet-ish solve. |
| 13 | FrostGlassMelt (`frost-glass-melt`) | `FrostGlassMelt.tsx` | P (warmth) | Heat-cell buffer; pointer writes heat w/ inverse-square falloff (:160); drifts snow; refreezes when idle; **reduced-motion → single static frost frame** (:151-154); `touch-action:none`. |
| 14 | InfiniteTendrils (`infinite-tendrils`) | `InfiniteTendrils.tsx` | P (follow) | Motes trace noise-current ribbons; `followPointer` default true w/ quadratic grip; elliptical steering; two scrolling value-noise fields; DPR cap 2; frame-stall full clear. |
| 15 | AsciiWater (`ascii-water`) | `AsciiWater.tsx` | P / click splash | **FLIP fluid** rendered to hidden `<pre>` glyphs (:757); pointer velocity brush + click splash (:764-767); **fixed-step** substeps (:928); `aria-label` (:1079). |

## Raw WebGL Group

| # | Component (slug) | File | Interaction | Technique summary |
|---|---|---|---|---|
| 16 | WaveBackground (`wave-background`) | `WaveBackground.tsx` | A | WebGL vertex(+frag) GLSL wave shader; `iResolution/uTime/uSpeed/uIntensity`; 8-layer loop; **`useInView` gates main loop** (:68); `blurClassMap` backdrop-blur. |
| 17 | HellBackground (premium) | `HellBackground.tsx` | A | Raw WebGL fragment shader (spin/rotate facets, `iResolution/iTime/uColor`); intensity/speed props; re-runs shader on prop change; DPR capped. |
| 18 | Lightfall (premium) | `Lightfall.tsx` | A | Fullscreen-triangle raymarch of streaks (39-iter angular wrap); seeded hash streaks; `uTime`; `experimental-webgl` fallback (:272-277); premultiplied alpha. |
| 19 | ReflectShader (`reflect-shader`) | `ReflectShader.tsx` | H / P | Chromatic refraction bands; `uPointer/uHover/uReach`; UV pull `uv = s - uPointer*min(uHover,1)` (:46); `FOLLOW_RATE 8` exponential ease (:255); DPR cap 2 (`MAX_DPR`). |
| 20 | GravitationalVortex (premium) | `GravitationalVortex.tsx` | H | Log-spiral funnel streaks (~20k instanced quads, Gaussian widths); hover ramp exponent `1-exp(-dt/HOVER_RAMP)` (:463); `pointerenter/leave` (:444-446); additive. |
| 21 | MorphingRings (premium) | `MorphingRings.tsx` | H | Particle disc; **3 SDF morphs** (circle/pentagon/heart) in the void; auto-rotate + two travelling waves; `hoverMV = motionValue(0)` (:453) + `animate()` (:669); up to 5-color palette uniforms; additive premultiplied. |
| 22 | BloomingFlower (premium) | `BloomingFlower.tsx` | H | 60k-100k WebGL point sprites (petals/stamens/stem); hover open / leave closes; weather sway idle; single buffer/draw. |
| 23 | PointDNAHelix (`point-dna-helix`) | `PointDNAHelix.tsx` | H / D | Vertex-shader helix (backbones, rungs, genetic dust, camera, cursor displacement `uCursorNDC` :258); `hoverMV` (:768)+`animate` (:886); drag-to-spin flick (:1310); breathing pulse. |
| 24 | TwinGalaxyRings (premium) | `TwinGalaxyRings.tsx` | H / S / press | GPU point cloud (log-spiral arms, mulberry32 seeded); `uCursor/uCurR/uCurS/uHover` (:128-134/1298-1304); pointer un-projected to plane lifts/swells (:1030-1038); scroll drives pitch/roll tilt (:1042); press dollies camera; `hoverMV` (:990). |

## three.js Group

| # | Component (slug) | File | Interaction | Technique summary |
|---|---|---|---|---|
| 25 | GlobeMesh (`globe-mesh`) | `GlobeMesh.tsx` | H | Icosahedron Points + cage; 3 ShaderMaterials (points/cage/panels :761/:779/:794); `hoverDir` THREE.Vector3 → uniforms `uHoverDir/uHoverArc/uHoverGlow`; rAF spin; DPR cap. |
| 26 | OceanSwell (`ocean-swell`) | `OceanSwell.tsx` | D (orbit) | Ray-marched ocean ShaderMaterial (:334) on 2×2 quad; **drag orbit yaw/pitch with MAX_PITCH clamp (:392-393/482) + inertia**; `pointerdown` (:404); DPR cap **1.25**; 68-step march; filmic tonemap. |
| 27 | BlockDrift (`block-drift`) | `BlockDrift.tsx` | A | Instanced cube stack; value-noise culling; beat-synced slide (one gap/beat, noise seed advance); ShaderMaterial (:378); growth-in fog at far end; single renderer (:367). |
| 28 | Tornado (premium) | `Tornado.tsx` | P (repel) | InstancedMesh strands + sprite comets; `onBeforeCompile` displacement; pointer-repel via clip-space uniforms (`pointermove` :797); staged entrance; **custom `useReducedMotion` (:13-23); `running = !reducedMotion` (:1340)**; rebuild() without context churn (:1266). |
| 29 | ParticleSphere (`particle-sphere`) | `ParticleSphere.tsx` | D / H / click | InstancedMesh low-poly spheres (Fibonacci golden-angle); **drag-throw rotation with momentum decay (:879)**; hover-stop auto-rotate; hover scatter burst (:925-929) + click burst (:976, touch :1105-1116); cursor repulsion; oversize backbuffer (2.5×) FOV-compensated. |

## DOM / CSS / SVG / tsparticles Group

| # | Component (slug) | File | Interaction | Technique summary |
|---|---|---|---|---|
| 30 | FallBeamBackground (`fall-beam-background`) | `FallBeamBackground.tsx` | A | Injected `<style>` + `@keyframes fall`; randomized durations/delays; `--beam-glow-color` vars; GPU-composited CSS beams. |
| 31 | isometric-grid-background (premium) | `isometric-grid-background.tsx` (+ `background-boxes.tsx` `BoxesCore`) | H (per-cell flash) | DOM motion.div grid; blocks `skewX(-48deg) skewY(14deg) scale(.8)`; staggered per-cell animated flash; title overlay; framer-motion. |
| 32 | background-paths / lines-background | `background-paths.tsx` (`FloatingPaths`) | A | 36 SVG paths animate `pathLength`, `opacity`, `pathOffset`; `repeat: Infinity` durations `20+rand*10`; neon stroke + title; framer-motion. |
| 33 | sparkles-background | `sparkles-background.tsx` (+ `sparkles.tsx`) | A | `@tsparticles/react` + `loadSlim`; `particlesLoaded` control opacity; radial `maskImage` fade; framer-motion entrance. |

## Verified non-qualifiers (read to eliminate)

- `GradientOrb`, `MorphingGlow`, `GeneratingOrb`, `TradingCandles`, `AuroraBpmLoader`
  → `loader` category. `FourierFlow` → `effect` (animated SVG curve, no pointer).
- `CardsBeam` → `3d` (3D card demo), `SolarSystem` → `3d` (planet picker).
- `CloudScroll/` → present but unregistered (no data entry).
- Cursor components (`*Cursor.tsx`) → `cursor` category, out of scope.