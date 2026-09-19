# Interactive Background — Dependencies

Exact external packages actually used by the Interactive Background codebase.

## 1. Runtime libraries (verified)

| Package | Ver (frontend/package.json) | Used in | Notes |
|---|---|---|---|
| `framer-motion` / `motion` | ^12.34.4 / ^12.34.5 | Sparkles, isometric-grid, background-paths (DOM decisions, hover mv) | The default DOM-motion choice (see `technology-stack.md` §2) |
| `@tsparticles/react` + `@tsparticles/slim` | ^3.x | `sparkles-background.tsx`, `sparkles.tsx` | Only tsparticles usage in repo |

Everything else runs **zero-dependency**: Cookie-Cutter rAF + Canvas2D relies only
on Web APIs (no math lib). Raw WebGL/ShaderMaterial and three.js are `three`:

| Package | Ver | Used in |
|---|---|---|
| `three` | ^0.183.2 | GlobeMesh, OceanSwell, BlockDrift, Tornado, ParticleSphere |

three.js adds no global types — helpers (`THREE.Color`, `THREE.Vector3`) enter
module imports only. `three/examples/jsm/*` is NOT used (no OrbitControls;
custom orbit in OceanSwell/ParticleSphere).

## 2. Overview of rendering tier choice

| Tier | Zero deps? | Library | Cost | When |
|---|---|---|---|---|
| Canvas2D | ✅ (Web APIs) | rAF + 2D context | 1 particle field ~ few MB | particle/grid/ring scenes, trails, economic |
| Raw WebGL | ✅ (WebGL API + GLSL strings) | none | shader programs | refract/funnel/helix/ring shader scenes, hover morphs |
| three.js | adds `three` | three | draw calls via InstancedMesh/Points | 3D scenes (globe, ocean, blocks, tornado, sphere) |
| DOM/SVG/tsParticles | adds framer + tsparticles | framer-motion + tsparticles | GPU-heavy but simple DOM | background-paths, isometric grid, sparkles |

## 3. Anti-dependencies (do NOT use)

- `simplex-noise` — installed (`3.0.3`) but **0 imports** in `src/`. Do not import
  for technique needs; noise is emulated via hash functions (stimulus-hash /
  mulberry32) or custom value-noise fields in the components.
- `@splinetool/loader`, `@splinetool/runtime`, `@splinetool/react-spline` —
  installed, unused.
- `unicornstudio-react` — installed, unused.
- `@react-three/fiber`, `@react-three/drei` — only present in the unregistered
  `CloudScroll/` bundle; not a project convention for these two categories.

## 4. Version pinning note

Use the exact already-installed majors. Do NOT bump unless a task explicitly
requires it; product dependencies are pinned in `frontend/package.json:14-49`.

## 5. Build-time (`devDependencies`)

Canvas/WebGL components add nothing; skip extra plugins/config. Vite handles
GLSL by keeping shaders as JS template strings (per convention).