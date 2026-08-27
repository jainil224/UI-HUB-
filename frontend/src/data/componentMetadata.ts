export interface PropDefinition {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface VibeMeta {
  behavior: string;
  states: { from: string; to: string };
  cssProperties: string[];
  description?: string;
  libraries?: string[];
  requirements?: string[];
}

export interface ComponentConfig {
  props: PropDefinition[];
  vibeMeta: VibeMeta;
}

export const COMPONENT_CONFIG: Record<string, ComponentConfig> = {
    "gravitational-vortex": {
        props: [
            { name: "background", type: "string", default: '"#000000"', description: "CSS background color behind the canvas." },
            { name: "baseColor", type: "string", default: '"#04FF3F"', description: "Primary particle color." },
            { name: "accentColor", type: "string", default: '"#FCFF00"', description: "Accent particle color for highlight streaks." },
            { name: "accentMix", type: "number", default: "50", description: "Percentage of particles that use the accent color." },
            { name: "density", type: "number", default: "16", description: "Particle density 10-100 (maps to 2000-40000 particles)." },
            { name: "dotSize", type: "number", default: "400", description: "Particle radius as percent of base size." },
            { name: "speed", type: "number", default: "16", description: "Rotation and inward slide speed 0-100." },
            { name: "direction", type: '"inward" | "outward"', default: '"inward"', description: "Particle flow direction." },
            { name: "hoverSpeed", type: "number", default: "100", description: "Speed while pointer hovers over the component." },
            { name: "scale", type: "number", default: "79", description: "Camera zoom as percent (reciprocal of pullback)." },
            { name: "tiltX", type: "number", default: "35", description: "Camera elevation above disc plane in degrees." },
            { name: "tiltY", type: "number", default: "0", description: "Camera yaw about Y axis in degrees." },
            { name: "vortex", type: "{ twist: number; funnel: number }", default: "{ twist: 28, funnel: 54 }", description: "Spiral twist winding and funnel depth." }
        ],
        vibeMeta: {
            behavior: "A WebGL gravitational vortex with a logarithmic spiral accretion disc of ~20k motion-blurred streaks falling into a funnel throat. Features real velocity-based motion blur, additive blending, and interactive hover speed boost.",
            states: { from: "static disc plane", to: "spiraling vortex with depth attenuation" },
            cssProperties: ["webgl", "canvas", "additive-blend", "radial-gradient"],
            description: "Premium WebGL gravitational vortex with logarithmic spiral accretion disc and real motion-blurred streaks.",
            libraries: ["react"],
            requirements: ["WebGL vertex/fragment shaders", "Logarithmic spiral math", "Additive blending with premultiplied alpha", "Per-frame phase and spin advancement", "Eye-shift lens correction", "Hover speed easing with dt-correct ramp"]
        }
    },
    "black-hole-3d": {
        props: [
            { name: "showCenter", type: "boolean", default: "true", description: "Whether to show the central event horizon sphere." },
            { name: "particleCount", type: "number", default: "1000", description: "Number of particles in the accretion disk." },
            { name: "particleSize", type: "number", default: "4", description: "Particle size from 1-100 (mapped to 0.5-4.5 effective px)." },
            { name: "colors", type: "string[]", default: '["#ffffff"]', description: "Array of particle colors." },
            { name: "outerRadius", type: "number", default: "70", description: "Outer disk radius as percentage of half-width." },
            { name: "tilt", type: "number", default: "20", description: "Main inclination tilt angle in degrees." },
            { name: "tiltSideway", type: "number", default: "160", description: "Sideway roll tilt in degrees." },
            { name: "trail", type: "number", default: "50", description: "Trail persistence 0-50 (0 = no trail, 50 = max trail)." },
            { name: "orbitSpeed", type: "number", default: "4", description: "Orbital rotation speed of particles." },
            { name: "pullSpeed", type: "number", default: "0", description: "Inward pull speed 0-20 (particles fall toward center)." },
            { name: "centre", type: "{ voidRadius?: number; voidX?: number; voidY?: number }", default: "{ voidRadius: 40, voidX: 50, voidY: 50 }", description: "Center event horizon configuration." }
        ],
        vibeMeta: {
            behavior: "A 3D black hole accretion disk with particles orbiting in a disk plane, sorted by Z-depth for authentic occlusion behind and in front of the central event horizon.",
            states: { from: "static accretion disk", to: "orbiting particles with trail and optional pull" },
            cssProperties: ["canvas-2d", "z-depth-sorting", "perspective-projection", "dual-canvas"],
            description: "Premium 3D black hole accretion disk with Z-depth sorted particles, relativistic orbital speeds, and 3D sphere center with rim lighting.",
            libraries: ["react"],
            requirements: ["HTML5 Canvas 2D", "ResizeObserver", "requestAnimationFrame", "Z-depth sorting"]
        }
    },
    "blooming-flower": {
        props: [
            { name: "background", type: "string", default: '"#07060C"', description: "CSS background color behind the canvas." },
            { name: "baseColor", type: "string", default: '"#C4327E"', description: "Primary petal color." },
            { name: "stemColor", type: "string", default: '"#2F7A4F"', description: "Stem color." },
            { name: "accentColor", type: "string", default: '"#FFD98A"', description: "Accent color for stamen and petal tips." },
            { name: "accentMix", type: "number", default: "100", description: "Percentage of accent color influence." },
            { name: "density", type: "number", default: "100", description: "Point cloud density 1-100 (controls total particle count)." },
            { name: "dotSize", type: "number", default: "10", description: "Point radius as percent of reference size." },
            { name: "speed", type: "number", default: "50", description: "Wind rate 0-100 (0 = dead still, 50 = default, 100 = fast)." },
            { name: "distance", type: "number", default: "2820", description: "Camera pullback in world units." },
            { name: "tilt", type: "number", default: "66", description: "Camera pitch above the flower in degrees." },
            { name: "closed", type: "number", default: "100", description: "How far the flower closes at idle 0-100 (100 = full bud)." },
            { name: "flower", type: "{ petals?: number; layers?: number }", default: "{ petals: 16, layers: 1 }", description: "Flower structure: petals per whorl and concentric whorls." },
            { name: "transition", type: "Motion", default: "{ type: 'tween', duration: 0.4 }", description: "Framer Motion animation options for bloom gate." }
        ],
        vibeMeta: {
            behavior: "A WebGL point-cloud flower of 60k-100k point sprites that opens on hover and closes to a bud when the pointer leaves. Three kinds of points share one buffer: petals on a parametric surface, stamens in a dome, and a swaying tapered stem. The head and stem share one sway expression so the flower cannot drift off its stalk.",
            states: { from: "closed bud (idle)", to: "fully bloomed (hover)" },
            cssProperties: ["webgl", "canvas", "point-sprites", "additive-blend", "premultiplied-alpha"],
            description: "Premium WebGL point-cloud flower with parametric petal surface, hover bloom gate, swaying stem, and weather animation.",
            libraries: ["react", "motion/react"],
            requirements: ["WebGL vertex/fragment shaders", "Parametric petal surface math", "motion/react for bloom animation", "Additive blending", "ResizeObserver"]
        }
    },
    "chandelier": {
        props: [
            { name: "background", type: "string", default: '"#0B0C0E"', description: "CSS background color behind the canvas." },
            { name: "baseColor", type: "string", default: '"#00F9AC"', description: "Text and peg color (hex or rgb)." },
            { name: "phrase", type: "string", default: '"thefabricremembersthelineitwasgivenandkeepsonsayingitwhilethewindpullsatthecorners"', description: "Text rendered on each cloth quad cell." },
            { name: "density", type: "number", default: "24", description: "Number of columns in the cloth grid (6-40)." },
            { name: "speed", type: "number", default: "50", description: "Simulation speed 0-100." },
            { name: "hover", type: "number", default: "100", description: "Mouse brush strength 0-200." },
            { name: "cloth", type: "ClothGroup", default: "{ gravity: 300, wind: 100, grab: 100, stretch: 114 }", description: "Cloth physics parameters." }
        ],
        vibeMeta: {
            behavior: "A cloth simulation with text rendered on a deformable grid. The cloth hangs from pin points at the top and responds to gravity, wind, and mouse interaction. Characters from a configurable phrase are drawn on each quad cell, scaling and rotating with the cloth's deformation.",
            states: { from: "static hanging cloth", to: "interactive grabbed cloth" },
            cssProperties: ["canvas", "2d-context", "cloth-simulation", "constraint-solver", "pointer-events"],
            description: "Premium cloth simulation with text glyphs rendered on deformable grid cells, gravity, wind, and grab interaction.",
            libraries: ["react"],
            requirements: ["Canvas 2D", "Verlet integration", "Constraint solver", "Pointer events", "requestAnimationFrame"]
        }
    },
    "3d-galaxy-animation": {
        props: [
            { name: "theme", type: "'Inferno' | 'Veridian' | 'Celestial'", default: "'Inferno'", description: "Color palette of the galaxy." },
            { name: "particleCount", type: "number", default: "3000", description: "Number of stars in the scene." },
            { name: "speed", type: "number", default: "1.0", description: "Base rotation speed of the orrery." }
        ],
        vibeMeta: {
            behavior: "A high-fidelity 3D galaxy simulation using custom GLSL shaders. Features realistic star drift, interactive resonance ripples, and cinematic post-processing effects.",
            states: { from: "cold stellar dust", to: "vibrant interactive galaxy" },
            cssProperties: ["canvas", "background: #050508", "mix-blend-mode: screen"],
            description: "A stunning interactive 3D galaxy with multiple themes, orbital physics, and post-processing bloom effects.",
            libraries: ["three", "framer-motion"],
            requirements: ["Custom fragment shaders for star glow", "Interactive resonance physics", "Dynamic theme engine (Inferno/Veridian/Celestial)", "Responsive camera FOV adjustment"]
        }
    },
    "space-background": {
        props: [
            { name: "starCount", type: "number", default: "1000", description: "Number of stars in the scene." },
            { name: "nebulaColor", type: "string", default: '"#4f46e5"', description: "Primary color of the nebula glow." },
            { name: "speed", type: "number", default: "0.2", description: "Base rotation speed." }
        ],
        vibeMeta: {
            behavior: "An immersive 3D space environment with depth-based star layering and volumetric gas clouds. Reacts to scroll with subtle parallax and mouse with gentle rotation.",
            states: { from: "static dark void", to: "animated volumetric nebula" },
            cssProperties: ["canvas", "background: black", "z-index: -1"],
            description: "Cinematic 3D space background with smooth GSAP-driven transitions.",
            libraries: ["three", "gsap"],
            requirements: ["Three.js Points primitive for stars", "Volumetric shader for nebula effects", "Mouse-parallax camera controller", "Window resize listener with aspect-ratio management"]
        }
    },
    "black-hole-background": {
        props: [
            { name: "interactive", type: "boolean", default: "true", description: "Enable mouse gravity interaction." },
            { name: "warpSpeed", type: "number", default: "1.0", description: "Rotation speed of the accretion disk." },
            { name: "singularitySize", type: "number", default: "2.0", description: "Relative size of the event horizon." }
        ],
        vibeMeta: {
            behavior: "A scientifically-inspired 3D black hole with a glowing accretion disk and gravitational lensing effects. Event horizon distorts surrounding light on interaction.",
            states: { from: "simple singularity", to: "radiant glowing black hole" },
            cssProperties: ["canvas", "filter: blur", "mix-blend-mode"],
            description: "Premium 3D singularity visualization with premium accretion disk shaders.",
            libraries: ["three", "framer-motion"],
            requirements: ["Three.js custom ShaderMaterial", "Gravitational lensing post-processing", "Fragment shader for accretion disk glow", "Responsive camera orbit controls", "Touch and mouse interaction support"]
        }
    },
    "mouse-gravity-background": {
        props: [
            { name: "particleCount", type: "number", default: "500", description: "Number of particles." },
            { name: "gravityStrength", type: "number", default: "1.0", description: "Strength of attractor." },
            { name: "interactive", type: "boolean", default: "true", description: "Enable mouse following." }
        ],
        vibeMeta: {
            behavior: "Organic particles floating in space that respond to mouse gravity. Particles form complex swarming patterns and orbits around the cursor with inertia.",
            states: { from: "floating particles", to: "swarming around cursor" },
            cssProperties: ["canvas", "background: #020617"],
            description: "Organic particle swarm background with gravity-based physics.",
            libraries: ["react", "framer-motion"],
            requirements: ["Inverse-square law gravity implementation", "Inertia and friction physics system", "Canvas-based high-performance rendering", "Particle life-cycle management", "Touch support for mobile interaction"]
        }
    },
    "3d-scroll-animation": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the scroll container." },
            { name: "showDemoButton", type: "boolean", default: "false", description: "Shows a 'View Full Demo' button overlay." }
        ],
        vibeMeta: {
            behavior: "A scroll-linked 3D experience with 300 pre-rendered frames. Features GSAP-powered image sequence scrubbing, progressive text reveals, and high-performance Canvas rendering.",
            states: { from: "loading screen with progress bar", to: "fully scrubbable 3D sequence with blur-in text" },
            cssProperties: ["canvas", "background-size: cover", "filter: blur", "z-index"],
            description: "Premium scroll-driven 3D character animation with professional GSAP scrubbing logic.",
            libraries: ["gsap", "@gsap/react", "framer-motion"],
            requirements: ["300-frame image sequence preloading", "Canvas-driven high-performance scrubbing", "GSAP ScrollTrigger master timeline", "Staggered blur-in/out text transitions", "Infinite horizontal hero marquee", "Premium percentage loader UI"]
        }
    },
    "cloud-scroll": {
        props: [],
        vibeMeta: {
            behavior: "An immersive 3D cloud scrolling experience featuring floating clouds, interactive portals to work/education and side projects, integrated timeline and projects carousel, ambient music/theme switching, and smooth scroll animations.",
            states: { from: "floating clouds", to: "3D portal experience on scroll" },
            cssProperties: ["canvas", "background-size: cover", "filter: blur", "z-index"],
            description: "Immersive 3D cloud scrolling experience featuring floating clouds, interactive portals, and projects carousel.",
            libraries: ["three", "@react-three/fiber", "@react-three/drei", "gsap", "zustand", "react-device-detect"],
            requirements: ["Three.js custom ShaderMaterial", "Portal navigation with MeshPortalMaterial", "Zustand state management", "Interactive R3F text layout", "GSAP camera movement animations", "Vercetti and Soria font styles"]
        }
    },
    "3d-slider": {
        props: [
            { name: "slides", type: "Slide[]", default: "default slides", description: "Array of slide objects with title, subtitle, image, and accentColor." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A high-end 3D cylindrical carousel where slides are arranged in 3D perspective space. Features smooth spring physics, floor reflections, and staggered text animations.",
            states: { from: "flat stack of cards", to: "cylindrical 3D perspective carousel" },
            cssProperties: ["perspective", "transform-style: preserve-3d", "rotateY", "translateZ", "box-shadow"],
            description: "Premium 3D perspective slider with high-end spring physics and reflections.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["CSS 3D perspective architecture", "Cylindrical angle trigonometry", "Framer Motion spring transitions", "Glassmorphic UI controls", "Touch/swipe gesture support", "Active card floor reflection effect"]
        }
    },
    "3d-rubiks-cube": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." }
        ],
        vibeMeta: {
            behavior: "Interactive 3D Rubik's Cube with inertia-based rotation, layer-specific logic, and automated solver.",
            states: { from: "solved state", to: "scrambled or animating layers" },
            cssProperties: ["transform", "matrix3d", "perspective", "preserve-3d"],
            description: "Interactive 3D Rubiks Cube with scramble and solve logic.",
            libraries: ["react", "tailwind-merge"],
            requirements: ["27-cubie 3D coordinate system", "DOMMatrix rotation management", "Layer-specific slice grouping", "Inertia and friction physics", "Safe history-based reversal for solving"]
        }
    },

    "odyssey-spline": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "onLoad", type: "() => void", default: "undefined", description: "Callback fired when the Spline scene loads." }
        ],
        vibeMeta: {
            behavior: "An immersive 3D animated scene powered by Spline with premium loading overlay featuring rotating concentric rings. Includes programmatic Spline branding removal and CSS watermark hiding.",
            states: { from: "animated ring loader", to: "interactive 3D Odyssey scene" },
            cssProperties: ["transform", "opacity", "filter", "z-index"],
            description: "Premium Spline-powered 3D Odyssey animation with premium loader and branding removal.",
            libraries: ["@splinetool/react-spline", "framer-motion"],
            requirements: ["Spline scene loading integration", "AnimatePresence loader with rotating rings", "Programmatic findObjectByName branding removal", "CSS watermark hiding selectors", "Background color matching (#050508)"]
        }
    },
    "3d-orbital-experience": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "onLoad", type: "() => void", default: "undefined", description: "Callback fired when the Spline scene loads." }
        ],
        vibeMeta: {
            behavior: "Abstract 3D orbital rings animation powered by Spline that reacts to mouse movement. Features premium loader and branding protection.",
            states: { from: "premium ring loader", to: "interactive 3D Orbital Experience" },
            cssProperties: ["transform", "opacity", "filter", "z-index"],
            description: "Premium Spline-powered 3D Orbital Experience.",
            libraries: ["@splinetool/react-spline", "framer-motion"],
            requirements: ["Spline scene loading", "AnimatePresence transitions", "Branding removal logic", "CSS watermark hiding", "Dark immersive theme"]
        }
    },
    "star-cursor": {
        props: [
            { name: "starSize", type: "number", default: "28", description: "Size of the main star cursor in pixels." },
            { name: "stiffness", type: "number", default: "0.12", description: "Spring stiffness for cursor following (0–1). Lower = more lag, higher = snappier." },
            { name: "damping", type: "number", default: "0.80", description: "Spring damping coefficient for inertia." },
            { name: "containerRef", type: "React.RefObject<HTMLElement>", default: "undefined", description: "If provided, scopes the cursor to this container element only." },
            { name: "hideDefaultCursor", type: "boolean", default: "true", description: "Hides the browser's default system cursor." },
            { name: "className", type: "string", default: '""', description: "Additional CSS class on the canvas wrapper." }
        ],
        vibeMeta: {
            behavior: "An ultra-premium cosmic star cursor rendered on a Canvas 2D layer. Features an 8-point glowing white star with long light rays, a pulsing bloom aura, and a particle system that spawns shooting-star trails on movement and a 24-particle radial burst on click. Expands and intensifies on hovering interactive elements.",
            states: { from: "idle pulsing star", to: "expanded hover glow + click cosmic burst" },
            cssProperties: ["canvas", "mix-blend-mode: screen", "position: fixed", "pointer-events: none", "shadowBlur", "radial-gradient"],
            description: "Cinematic space star cursor with spring physics, particle trails, hover glow expansion, and click burst effects.",
            libraries: ["react"],
            requirements: [
                "Canvas 2D rendering with requestAnimationFrame loop",
                "Spring physics position smoothing (stiffness + damping)",
                "8-point star drawn with drawStar helper (alternating outer/inner radius)",
                "Long directional light rays via roundRect + linear gradients",
                "Diagonal rays at 45° offset",
                "Multi-layer radial gradient glow (outer halo + center core)",
                "Math.sin pulse animation for ambient glow breathing",
                "Particle system: trail particles on movement, 4-point mini-stars + glowing dots",
                "24-particle radial click burst with randomized velocities and lifetimes",
                "Click flash decay ring animation",
                "Hover scale spring animation (targetStarScale 1.35x on interactive elements)",
                "ResizeObserver for canvas sizing",
                "Scoped container mode via containerRef",
                "Default cursor hiding via injected <style> tag"
            ]
        }
    },
    "target-cursor": {
        props: [
            { name: "color", type: "string", default: '"#22d3ee"', description: "Primary color of the cursor frame and corners." },
            { name: "size", type: "number", default: "32", description: "Size of the cursor frame in pixels." },
            { name: "sensitivity", type: "number", default: "0.15", description: "How quickly the cursor follows the mouse (0-1)." }
        ],
        vibeMeta: {
            behavior: "A precision crosshair cursor with corner brackets that snaps to and parallax-scales with interactive elements. Rotates slowly when idle, expands on hover.",
            states: { from: "idle spinning crosshair", to: "snapped expanded frame around target element" },
            cssProperties: ["transform", "border", "position: fixed", "z-index"],
            description: "Precision-focused custom cursor with element snap targeting.",
            libraries: ["react"],
            requirements: ["requestAnimationFrame position smoothing", "Interactive element snap detection (getBoundingClientRect)", "Corner bracket rotation animation", "Click scale feedback", "Default cursor hiding and restoration on unmount"]
        }
    },
    "black-hole-cursor": {
        props: [
            { name: "particleCount", type: "number", default: "120", description: "Number of orbiting particles around the singularity." },
            { name: "coreSize", type: "number", default: "12", description: "Radius of the black hole core in pixels." },
            { name: "glowColor", type: "string", default: '"#6366f1"', description: "Color of the accretion disk glow." },
            { name: "particleColor", type: "string", default: '"#a78bfa"', description: "Color of the orbiting particles." }
        ],
        vibeMeta: {
            behavior: "A gravitational singularity cursor with particles orbiting and spiraling inward. On click, particles implode then explode outward. Multi-layered accretion disk glow rings.",
            states: { from: "orbiting particles", to: "implode/explode on click" },
            cssProperties: ["canvas", "radial-gradient", "shadowBlur"],
            description: "Cinematic black hole cursor with particle physics and accretion disk.",
            libraries: ["react"],
            requirements: ["Canvas 2D particle simulation", "Polar coordinate orbital physics", "Spiral inward gravity (distance *= 0.998)", "Click implode/explode effect", "Multi-layer radial gradient core rendering", "Trail effect via semi-transparent fillRect"]
        }
    },
    "magnetic-cursor": {
        props: [
            { name: "dotSize", type: "number", default: "6", description: "Size of the inner cursor dot in pixels." },
            { name: "haloSize", type: "number", default: "40", description: "Size of the outer halo circle in pixels." },
            { name: "magneticRange", type: "number", default: "100", description: "Range in pixels for magnetic pull on data-magnetic elements." }
        ],
        vibeMeta: {
            behavior: "A dual-layer cursor with a snappy dot (high stiffness spring) and a lagging hollow halo (low stiffness). Elements with data-magnetic attribute are pulled toward the cursor when in range.",
            states: { from: "idle dot + halo", to: "magnetic pull on data-magnetic elements" },
            cssProperties: ["transform", "position: fixed", "border-radius", "backdrop-filter"],
            description: "Elegant magnetic cursor with dual-layer spring physics and element attraction.",
            libraries: ["react"],
            requirements: ["requestAnimationFrame spring physics loop", "Dual spring constants (dot vs halo)", "data-magnetic attribute element scanning", "Element transform application on proximity", "Default cursor hiding and cleanup on unmount"]
        }
    },
    "aurora-cursor": {
        props: [
            { name: "size", type: "number", default: "150", description: "Size of the aurora blob in pixels." },
            { name: "blur", type: "number", default: "40", description: "Blur filter amount in pixels." },
            { name: "colors", type: "string[]", default: '["#06b6d4", "#8b5cf6", "#ec4899"]', description: "Aurora gradient colors for the morphing blob." }
        ],
        vibeMeta: {
            behavior: "A large, morphing blob of colorful light that follows the mouse with spring physics. CSS animations drive background shifting, border-radius morphing, and opacity pulsing simultaneously. Scales down on interactive element hover.",
            states: { from: "large diffused aurora blob", to: "compact focused blob on interactive hover" },
            cssProperties: ["filter: blur", "border-radius", "background", "mix-blend-mode", "transform"],
            description: "Fluid aurora light cursor with organic CSS morphing animations.",
            libraries: ["react"],
            requirements: ["Spring physics position following", "CSS @keyframes for background-position shift (8s)", "CSS @keyframes for border-radius morphing (20s)", "CSS @keyframes for opacity pulsing (4s)", "Interactive element hover detection with scale change"]
        }
    },
    "heart-cursor": {
        props: [
            { name: "color", type: "string", default: '"#ff4d6a"', description: "Color of the heart cursor." },
            { name: "size", type: "number", default: "24", description: "Size of the heart in pixels." },
            { name: "rippleColor", type: "string", default: '"rgba(255,77,106,0.3)"', description: "Color of expanding ripple circles." },
            { name: "trailInterval", type: "number", default: "100", description: "Milliseconds between ripple spawns." }
        ],
        vibeMeta: {
            behavior: "An SVG heart cursor that pulses gently and leaves expanding circular ripples on a transparent canvas. On click, spawns a burst of mini hearts. Scales up on interactive element hover.",
            states: { from: "pulsing heart with ripple trail", to: "burst of mini hearts on click" },
            cssProperties: ["canvas", "svg", "transform: scale", "opacity"],
            description: "Animated heart cursor with ripple trails and click burst effects.",
            libraries: ["react"],
            requirements: ["SVG heart path rendering", "Canvas ripple system (expanding circles with fade)", "Periodic ripple spawning every trailInterval ms", "Click burst effect (5 mini hearts with random velocities)", "requestAnimationFrame animation loop", "Hybrid SVG + Canvas approach"]
        }
    },
    "lizard-cursor": {
        props: [
            { name: "segmentCount", type: "number", default: "25", description: "Number of body segments in the creature." },
            { name: "color", type: "string", default: '"#22c55e"', description: "Primary color of the creature." },
            { name: "legCount", type: "number", default: "4", description: "Number of leg pairs." }
        ],
        vibeMeta: {
            behavior: "A segmented creature (lizard/centipede) that follows the mouse using Inverse Kinematics. Each segment trails the previous maintaining fixed distance. Legs step periodically with bezier arcs. Click triggers a quick strike lunge.",
            states: { from: "idle following creature", to: "strike lunge on click" },
            cssProperties: ["canvas"],
            description: "IK-based segmented creature cursor with leg stepping and strike animation.",
            libraries: ["react"],
            requirements: ["Inverse Kinematics chain (atan2 + distance constraint)", "Leg stepping system with cubic bezier foot arcs", "Head easing toward mouse with configurable speed", "Tapering body segments (head larger, tail smaller)", "Click strike effect (increased easing speed)", "Canvas resize and cleanup handling"]
        }
    },
    "venom-cursor": {
        props: [
            { name: "tentacleCount", type: "number", default: "8", description: "Number of tentacles trailing the cursor." },
            { name: "color", type: "string", default: '"#1a1a2e"', description: "Primary tentacle color." },
            { name: "length", type: "number", default: "200", description: "Maximum tentacle length in pixels." }
        ],
        vibeMeta: {
            behavior: "Multiple dark, writhing tentacles that follow the mouse using IK joints with Perlin Noise for organic wriggling. Tentacles taper from thick base to sharp tip.",
            states: { from: "idle wriggling tentacles", to: "accelerated tracking on fast mouse movement" },
            cssProperties: ["canvas"],
            description: "Dark organic tentacle cursor with Perlin Noise wriggling.",
            libraries: ["react"],
            requirements: ["Inline Perlin/Simplex noise function", "IK joint chain per tentacle (15-20 joints)", "Noise-based perpendicular offset for organic motion", "Quadratic bezier curve drawing for smooth tentacles", "Tapered line width (base to tip)", "Gradient color opacity (solid to transparent)"]
        }
    },
    "3d-tubes-cursor": {
        props: [
            { name: "tubeColor1", type: "string", default: '"#00ffff"', description: "First tube color (cyan)." },
            { name: "tubeColor2", type: "string", default: '"#ff00ff"', description: "Second tube color (magenta)." },
            { name: "lightIntensity", type: "number", default: "1.5", description: "Point light intensity following the cursor." }
        ],
        vibeMeta: {
            behavior: "A 3D scene where neon-glowing tubes form a trailing path in 3D space behind the mouse cursor. A PointLight follows the cursor, illuminating tubes dynamically. Tubes taper and fade at the tail.",
            states: { from: "empty 3D scene", to: "glowing tube trail following cursor" },
            cssProperties: ["canvas (WebGL)", "z-index", "pointer-events: none"],
            description: "Three.js powered neon tube cursor trail in 3D perspective space.",
            libraries: ["three"],
            requirements: ["Three.js PerspectiveCamera + Scene + WebGLRenderer", "CatmullRomCurve3 from mouse position history", "TubeGeometry generation from curve", "PointLight following cursor position", "Dynamic script loading from CDN", "Canvas resize and Three.js disposal on unmount"]
        }
    },
    "wave-background": {
        props: [],
        vibeMeta: {
            behavior: "A rhythmic, flowing wave animation that creates a sense of fluid motion. Uses SVG paths with animated offsets.",
            states: { from: "static curve", to: "flowing wave animation" },
            cssProperties: ["svg", "fill", "animation"],
            description: "Smooth SVG-based wave animation background.",
            libraries: ["react", "framer-motion"],
            requirements: ["SVG path animation", "CSS transitions for fluid movement"]
        }
    },
    "lines-background": {
        props: [
            { name: "title", type: "string", default: '"LINES"', description: "Text to display in the background." },
            { name: "pathColor", type: "string", default: '"#ffffff"', description: "Color of the animated lines." }
        ],
        vibeMeta: {
            behavior: "Abstract animated lines that create a dynamic, tech-inspired background. Features customizable text and line colors.",
            states: { from: "empty background", to: "animated line field" },
            cssProperties: ["canvas", "z-index: -1"],
            description: "Tech-inspired animated lines background.",
            libraries: ["react"],
            requirements: ["Canvas 2D rendering", "Text rendering with shadow", "Animated path generation"]
        }
    },
    "sparkles-background": {
        props: [
            { name: "title", type: "string", default: '"Sparkles background"', description: "Text to display over sparkles." }
        ],
        vibeMeta: {
            behavior: "A magical glittering field of sparkles that adds a premium feel to sections. Features a shimmering effect with variable particle sizes.",
            states: { from: "dark background", to: "glittering sparkle field" },
            cssProperties: ["canvas", "mix-blend-mode: screen"],
            description: "High-end shimmering sparkle field background.",
            libraries: ["react"],
            requirements: ["Particle system with shimmering logic", "Text overlay integration"]
        }
    },
    "isometric-grid-background": {
        props: [
            { name: "title", type: "string", default: '"ISOMETRIC"', description: "Text to display in the grid." }
        ],
        vibeMeta: {
            behavior: "A 3D isometric grid with perspective depth and interactive lighting. Perfect for modern, structured layouts.",
            states: { from: "flat grid", to: "3D isometric environment" },
            cssProperties: ["perspective", "transform-style: preserve-3d"],
            description: "Modern 3D isometric grid background.",
            libraries: ["react", "framer-motion"],
            requirements: ["CSS 3D perspective", "Grid generation logic", "Text perspective transformation"]
        }
    },
    "grid-background": {
        props: [
            { name: "gridSize", type: "number", default: "24", description: "Size of each grid cell in pixels." },
            { name: "gridColor", type: "string", default: '"#80808012"', description: "Color of the grid lines." },
            { name: "label", type: "string", default: '"GRID ALIVE"', description: "Text to display in the background." },
            { name: "opacity", type: "number", default: "1", description: "Overall opacity of the background." }
        ],
        vibeMeta: {
            behavior: "A clean, modern grid background with an optional text overlay. Uses CSS gradients for high performance.",
            states: { from: "empty space", to: "structured grid" },
            cssProperties: ["background-image: linear-gradient", "mask-image: radial-gradient"],
            description: "High-performance CSS grid background with radial masking.",
            libraries: ["react"],
            requirements: ["CSS linear-gradient for grid lines", "Radial gradient masking for focus", "Text overlay support"]
        }
    },
    "novatrix-background": {
        props: [
            { name: "title", type: "string", default: '"NEBULA"', description: "Title text to display." },
            { name: "colorFrom", type: "string", default: '"#1a1a2e"', description: "Starting color of the nebula gradient." },
            { name: "colorTo", type: "string", default: '"#16213e"', description: "Ending color of the nebula gradient." },
            { name: "opacity", type: "number", default: "0.8", description: "Overall opacity of the effect." }
        ],
        vibeMeta: {
            behavior: "A stunning nebula-like background with flowing colors and deep atmospheric depth. Perfect for high-end landing pages.",
            states: { from: "solid background", to: "ethereal nebula field" },
            cssProperties: ["radial-gradient", "blur", "animate-pulse"],
            description: "Ethereal nebula background with organic flowing gradients.",
            libraries: ["react", "framer-motion"],
            requirements: ["Multi-stop radial gradients", "Animated opacity oscillations", "Backdrop-blur for glassmorphism"]
        }
    },
    "hell-background": {
        props: [
            { name: "intensity", type: "number", default: "1.5", description: "Brightness of the hellish glow." },
            { name: "speed", type: "number", default: "0.8", description: "Speed of the fire/lava movement." }
        ],
        vibeMeta: {
            behavior: "An aggressive, high-contrast background with fire and lava-like animations. Features intense glows and rapid motion.",
            states: { from: "darkness", to: "hellish inferno" },
            cssProperties: ["filter: drop-shadow", "mix-blend-mode: screen", "canvas"],
            description: "Intense high-contrast fire/lava background effect.",
            libraries: ["react", "framer-motion"],
            requirements: ["Canvas-based noise generation", "Intense color-dodge blends", "Animated distortion filters"]
        }
    },

    // ── Button Components ────────────────────────────────────────────────────────

    "corner-border-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Click Me"', description: "Button label or content rendered inside the button." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes to extend the button's style." },
            { name: "cornerSize", type: "number", default: "8", description: "Size of the animated corner brackets in pixels." },
            { name: "cornerColor", type: "string", default: '"#00ff9f"', description: "Color of the corner border brackets." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler fired when the button is pressed." },
            { name: "disabled", type: "boolean", default: "false", description: "Disables the button and applies reduced opacity styling." }
        ],
        vibeMeta: {
            behavior: "A button with animated corner brackets that expand outward on hover, creating a targeting / crosshair framing effect.",
            states: { from: "collapsed corner brackets", to: "expanded corner frame on hover" },
            cssProperties: ["border", "transform", "transition", "opacity"],
            description: "Precision-styled button with animated corner brackets.",
            libraries: ["framer-motion"],
            requirements: ["Four absolute-positioned corner elements", "CSS transform expand on hover", "Configurable corner color and size"]
        }
    },

    "border-beam": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "size", type: "number", default: "300", description: "Size of the glowing beam in pixels." },
            { name: "duration", type: "number", default: "15", description: "Seconds for one full orbit of the beam." },
            { name: "anchor", type: "number", default: "90", description: "Starting angle of the beam on the border (0–360 degrees)." },
            { name: "borderWidth", type: "number", default: "1.5", description: "Width of the border in pixels." },
            { name: "colorFrom", type: "string", default: '"#ffaa40"', description: "Start color of the beam gradient." },
            { name: "colorTo", type: "string", default: '"#9c40ff"', description: "End color of the beam gradient." },
            { name: "delay", type: "number", default: "0", description: "Delay in seconds before the beam animation starts." }
        ],
        vibeMeta: {
            behavior: "A glowing light beam that orbits continuously around the border of any container element. Uses a conic gradient mask to create a traveling spotlight effect.",
            states: { from: "static border", to: "continuously orbiting glow beam" },
            cssProperties: ["background: conic-gradient", "mask", "border-radius", "animation"],
            description: "Magical orbiting border glow beam for any container.",
            libraries: ["framer-motion"],
            requirements: ["CSS conic-gradient for beam shape", "Continuous rotation animation", "Configurable speed, anchor, and colors", "Responsive border-radius inheritance"]
        }
    },

    "glow-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Glow"', description: "Button content." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "glowColor", type: "string", default: '"#00ff9f"', description: "Color of the glow halo effect." },
            { name: "glowSize", type: "number", default: "40", description: "Spread radius of the glow in pixels." },
            { name: "glowOpacity", type: "number", default: "0.6", description: "Opacity of the glow (0–1)." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." },
            { name: "disabled", type: "boolean", default: "false", description: "Disables the button and suppresses glow." }
        ],
        vibeMeta: {
            behavior: "A button with a radial glow that intensifies on hover. The glow tracks the mouse within the button for a liquid-light feel.",
            states: { from: "subtle ambient glow", to: "intense mouse-tracked radial glow" },
            cssProperties: ["box-shadow", "radial-gradient", "transition", "filter"],
            description: "Premium glow-on-hover button with mouse-tracking light.",
            libraries: ["framer-motion"],
            requirements: ["Mouse position tracking relative to button", "Radial gradient that follows cursor", "Configurable glow color and radius", "Smooth opacity transition"]
        }
    },

    "interactive-hover-button": {
        props: [
            { name: "text", type: "string", default: '"Button"', description: "Label text shown in the idle button." },
            { name: "loadingText", type: "string", default: '"Processing..."', description: "Text shown during the loading state." },
            { name: "successText", type: "string", default: '"Complete!"', description: "Text shown during the success state." },
            { name: "variant", type: "'default' | 'neon' | 'dark' | 'sparkle'", default: "'default'", description: "Styling variant of the button (matches Explore Components, View Source, Sign In from user design)." },
            { name: "icon", type: "React.ReactNode", default: "undefined", description: "Custom icon displayed next to the text on hover." },
            { name: "classes", type: "string", default: "undefined", description: "Additional tailwind classes for custom positioning or sizing." }
        ],
        vibeMeta: {
            behavior: "An interactive button featuring a dot-scaling hover animation. On hover, the background dot scales up to fill the container, while text shifts and fades to reveal centered text and an action icon with smooth transition springs.",
            states: { from: "pill button with colored dot", to: "solid colored button with shifting text + sliding icon" },
            cssProperties: ["transform", "opacity", "scale", "overflow: hidden", "transition-all"],
            description: "High-performance interactive hover button with expandable dot background and sliding icon animations.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Spring physics layout constraints", "AnimatePresence client transitions", "Overflow hidden button container", "Dynamic icon support"]
        }
    },

    "marquee-hover-button": {
        props: [
            { name: "label", type: "string", default: '"Hover Me"', description: "The text shown at rest." },
            { name: "marqueeText", type: "string", default: '"★ Marquee Text ★"', description: "The scrolling text revealed on hover." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "speed", type: "number", default: "20", description: "Marquee scroll speed in pixels per second." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." }
        ],
        vibeMeta: {
            behavior: "At rest the button shows a static label. On hover, the label slides up and a continuously scrolling marquee of text slides in from below.",
            states: { from: "static label", to: "scrolling marquee text on hover" },
            cssProperties: ["overflow: hidden", "transform: translateY", "animation: marquee"],
            description: "Hover-reveal marquee text button.",
            libraries: ["framer-motion"],
            requirements: ["Overflow hidden container", "Framer Motion y-axis translate on hover", "Looping CSS marquee animation", "Configurable speed and text"]
        }
    },

    "payment-transaction-button": {
        props: [
            { name: "amount", type: "string | number", default: '"$99.00"', description: "The payment amount to display on the button." },
            { name: "currency", type: "string", default: '"USD"', description: "Currency code shown alongside the amount." },
            { name: "onSuccess", type: "() => void", default: "undefined", description: "Callback fired when the simulated payment succeeds." },
            { name: "onError", type: "() => void", default: "undefined", description: "Callback fired when the simulated payment fails." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "loadingDuration", type: "number", default: "2000", description: "Milliseconds the loading spinner shows before resolving." }
        ],
        vibeMeta: {
            behavior: "A multi-phase button that transitions through idle, loading (spinner), success (checkmark), and error states. Each phase has dedicated micro-animations.",
            states: { from: "idle payment button", to: "loading → success / error state" },
            cssProperties: ["transform", "opacity", "border", "transition"],
            description: "Multi-state animated payment button with success/error feedback.",
            libraries: ["framer-motion"],
            requirements: ["State machine: idle → loading → success/error", "Spinner animation during loading", "AnimatePresence for icon transitions", "Color shift per state (neutral → green / red)"]
        }
    },

    "magic-card-effect": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the card container." },
            { name: "gradientSize", type: "number", default: "200", description: "Size of the radial gradient spotlight in pixels." },
            { name: "gradientColor", type: "string", default: '"#262626"', description: "Color of the mouse-tracked gradient spotlight." },
            { name: "gradientOpacity", type: "number", default: "0.8", description: "Opacity of the spotlight gradient (0–1)." },
            { name: "children", type: "React.ReactNode", default: "undefined", description: "Content rendered inside the card." }
        ],
        vibeMeta: {
            behavior: "A card with a radial gradient spotlight that follows the mouse cursor. Creates a premium 'magic' lighting effect that reveals depth beneath the card surface.",
            states: { from: "flat card", to: "mouse-tracked radial light reveal" },
            cssProperties: ["background: radial-gradient", "mask", "transition"],
            description: "Mouse-tracking spotlight card with premium depth effect.",
            libraries: ["framer-motion"],
            requirements: ["onMouseMove event with rect-relative coordinates", "CSS radial-gradient positioned at mouse", "Configurable gradient size and color", "Smooth transition on mouse leave"]
        }
    },

    "rainbow-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Rainbow"', description: "Button label or inner content." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "speed", type: "number", default: "3", description: "Seconds for one full rotation of the rainbow gradient." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." },
            { name: "disabled", type: "boolean", default: "false", description: "Disables button and pauses rainbow animation." }
        ],
        vibeMeta: {
            behavior: "A button with a continuously rotating conic-gradient halo border that cycles through all hues of the rainbow. On hover, the halo intensifies.",
            states: { from: "slow rainbow rotation", to: "faster / brighter on hover" },
            cssProperties: ["background: conic-gradient", "animation: spin", "border-radius", "filter"],
            description: "Continuously rotating full-spectrum rainbow border button.",
            libraries: ["framer-motion"],
            requirements: ["CSS conic-gradient rainbow halo", "Rotation keyframe animation", "Pseudo-element or wrapper technique for inner background", "Hover speed/brightness increase"]
        }
    },

    "social-tooltip-buttons": {
        props: [
            { name: "buttons", type: "SocialButton[]", default: "default socials", description: "Array of {icon, label, color, href} objects for each social link." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "tooltipPosition", type: '"top" | "bottom"', default: '"top"', description: "Direction the tooltip appears relative to the button." },
            { name: "size", type: "number", default: "44", description: "Size of each icon button in pixels." }
        ],
        vibeMeta: {
            behavior: "A row of social icon buttons. On hover, a branded color tooltip fades in above/below with the platform name. Each button has a unique background color on hover.",
            states: { from: "neutral icons", to: "branded colored hover + tooltip reveal" },
            cssProperties: ["transform: translateY", "opacity", "background-color", "border-radius"],
            description: "Social icon row with branded hover color and animated tooltip labels.",
            libraries: ["framer-motion", "lucide-react"],
            requirements: ["tooltip AnimatePresence fade/slide", "Per-button branding color", "Configurable tooltip position", "Link wrapper support (href)"]
        }
    },

    "orbit-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Orbit"', description: "Button label." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "orbitColor", type: "string", default: '"#00ff9f"', description: "Color of the orbiting particle beam." },
            { name: "orbitSize", type: "number", default: "6", description: "Size of the orbiting particle dot in pixels." },
            { name: "speed", type: "number", default: "2", description: "Seconds for one full orbit cycle." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." }
        ],
        vibeMeta: {
            behavior: "A button with a glowing particle that orbits its border in a continuous loop. On hover, the orbit speed doubles and a secondary particle appears.",
            states: { from: "single slow orbit", to: "dual fast orbit on hover" },
            cssProperties: ["transform: rotate", "border-radius", "box-shadow", "animation"],
            description: "Button with a glowing satellite particle orbiting its border.",
            libraries: ["framer-motion"],
            requirements: ["Absolute positioned particle on border path", "CSS/Framer rotation animation", "Hover-triggered speed and count change", "Configurable orbit color and dot size"]
        }
    },

    "galaxy-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Galaxy"', description: "Button label." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "starCount", type: "number", default: "80", description: "Number of star particles rendered on the button surface." },
            { name: "nebulaColor", type: "string", default: '"#6366f1"', description: "Primary nebula glow color inside the button." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." }
        ],
        vibeMeta: {
            behavior: "A button whose surface is filled with a miniature starfield and nebula glow that drifts slowly. On hover, stars increase brightness and the nebula pulses.",
            states: { from: "dim drifting starfield", to: "brightened pulsing galaxy on hover" },
            cssProperties: ["canvas", "background: radial-gradient", "opacity", "filter"],
            description: "Button with an embedded living galaxy particle effect.",
            libraries: ["framer-motion"],
            requirements: ["Canvas or DOM particle system inside button", "Star drift physics (slow floaty movement)", "Nebula radial gradient on hover", "Click ripple from center"]
        }
    },

    "liquid-fill-button": {
        props: [
            { name: "children", type: "React.ReactNode", default: '"Fill"', description: "Button label." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." },
            { name: "fillColor", type: "string", default: '"#00ff9f"', description: "Color of the liquid fill that rises on hover." },
            { name: "textColor", type: "string", default: '"#000000"', description: "Text color after fill covers the button." },
            { name: "waveHeight", type: "number", default: "8", description: "Amplitude of the wave in pixels." },
            { name: "fillSpeed", type: "number", default: "0.5", description: "Duration of the fill animation in seconds." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Click handler." }
        ],
        vibeMeta: {
            behavior: "On hover, a liquid wave rises from the bottom of the button until it fully covers the background. A wavy SVG path sits at the waterline for an organic fill effect.",
            states: { from: "transparent / outlined button", to: "fully filled with liquid wave on hover" },
            cssProperties: ["clip-path", "transform: translateY", "SVG path", "transition"],
            description: "Liquid wave fill button with organic SVG waterline animation.",
            libraries: ["framer-motion"],
            requirements: ["SVG sinusoidal wave path at fill boundary", "Y-axis translate for fill rise", "Color transition for text when covered", "Configurable wave height and fill speed"]
        }
    },

};


