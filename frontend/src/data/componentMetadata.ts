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
    "neural-network-background": {
        props: [
            { name: "nodeCount", type: "number", default: "150", description: "Number of nodes in the network." },
            { name: "nodeColor", type: "string", default: '"#06b6d4"', description: "Color of the nodes." },
            { name: "lineColor", type: "string", default: '"#0891b2"', description: "Color of the connecting lines." },
            { name: "connectionDistance", type: "number", default: "150", description: "Max distance for node connections." }
        ],
        vibeMeta: {
            behavior: "An interactive particle network where nodes connect based on proximity. Features realistic physics with repulsion/attraction and high-performance Canvas rendering.",
            states: { from: "random nodes", to: "interconnected pulsing network" },
            cssProperties: ["canvas", "background: transparent", "pointer-events: none"],
            description: "High-performance interactive particle network background.",
            libraries: ["react"],
            requirements: ["Canvas 2D rendering loop", "Spatial partitioning for line optimization", "Mouse-repulsion physics implementation", "Dynamic opacity based on connection distance", "Clean unmount and resize handling"]
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
            description: "Elite 3D singularity visualization with premium accretion disk shaders.",
            libraries: ["three", "framer-motion"],
            requirements: ["Three.js custom ShaderMaterial", "Gravitational lensing post-processing", "Fragment shader for accretion disk glow", "Responsive camera orbit controls", "Touch and mouse interaction support"]
        }
    },
    "warp-speed-background": {
        props: [
            { name: "count", type: "number", default: "2000", description: "Number of streak particles." },
            { name: "color", type: "string", default: '"#ffffff"', description: "Color of the warp streaks." },
            { name: "speed", type: "number", default: "1.0", description: "Warp speed multiplier." }
        ],
        vibeMeta: {
            behavior: "A hyperspace jump animation with long, glowing streaks converging toward a focus point. Features speed-based field-of-view stretching and motion blur simulation.",
            states: { from: "slow star drift", to: "rapid hyperspace warp streaks" },
            cssProperties: ["canvas", "background: #000", "will-change: transform"],
            description: "High-speed cinematic warp effect with perspective stretching.",
            libraries: ["three", "gsap"],
            requirements: ["Dynamic Point Cloud generation", "Line-based streak stretching logic", "FOV-linked camera animation", "Performance-optimized WebGL context", "Infinite loop with smooth reset"]
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
    "interactive-webgl-scene": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "overlayColor", type: "string", default: '"rgba(0,0,0,0.5)"', description: "Color of the darkening overlay." },
            { name: "overlayOpacity", type: "number", default: "0.4", description: "Opacity of the overlay." },
            { name: "showDownloadLink", type: "boolean", default: "false", description: "Shows a download button for the video." }
        ],
        vibeMeta: {
            behavior: "An immersive fullscreen WebGL scene (video-backed) featuring high-end 3D environments. Combines cinematic overlays, interactive scanlines, and a premium asset delivery system.",
            states: { from: "static loading state", to: "interactive 3D WebGL environment" },
            cssProperties: ["object-cover", "mix-blend-mode", "radial-gradient", "filter: drop-shadow"],
            description: "Elite WebGL-based video background with professional cinematic post-processing.",
            libraries: ["react", "clsx", "tailwind-merge"],
            requirements: ["Cinematic video loop background", "Interactive scanline distortion overlay", "Indigo-themed radial vignette", "High-fidelity download button with glow", "Blob-based asset download system"]
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
            description: "Elite scroll-driven 3D character animation with professional GSAP scrubbing logic.",
            libraries: ["gsap", "@gsap/react", "framer-motion"],
            requirements: ["300-frame image sequence preloading", "Canvas-driven high-performance scrubbing", "GSAP ScrollTrigger master timeline", "Staggered blur-in/out text transitions", "Infinite horizontal hero marquee", "Premium percentage loader UI"]
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
    "black-box": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A high-performance cyberpunk dashboard featuring terminal emulators, glitch transitions, and real-time data visualizations.",
            states: { from: "offline terminal", to: "active holographic dashboard" },
            cssProperties: ["filter: blur(10px)", "mix-blend-mode: screen", "clip-path"],
            description: "A high-performance cyberpunk glitch-style dashboard portfolio with terminal simulation, animated charts, and system instability effects.",
            libraries: ["framer-motion", "recharts", "lucide-react"],
            requirements: ["Custom terminal command parser", "Glitch post-processing effect", "Dynamic SVG grid background", "Responsive glassmorphism layout"]
        }
    },
    "neo-brutalism-os": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A bold OS-style interface with high-contrast shadows, thick borders, and vibrant primary colors. Features Draggable windows and grid-based layouts.",
            states: { from: "static grid", to: "interactive OS environment" },
            cssProperties: ["box-shadow: 8px 8px 0px #000", "border: 4px solid #000", "font-family: Public Sans"],
            description: "A bold, Neo-Brutalism inspired Dashboard OS with high-contrast UI, interactive charts, and a custom sidebar navigation. Built with Framer Motion and Recharts for a premium interactive experience.",
            libraries: ["framer-motion", "recharts", "clsx"],
            requirements: ["Thick border 'Brutalist' design system", "Interactive windowing physics", "High-contrast color palette", "Grid-snapping layout engine"]
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
            description: "Elite Spline-powered 3D Odyssey animation with premium loader and branding removal.",
            libraries: ["@splinetool/react-spline", "framer-motion"],
            requirements: ["Spline scene loading integration", "AnimatePresence loader with rotating rings", "Programmatic findObjectByName branding removal", "CSS watermark hiding selectors", "Background color matching (#050508)"]
        }
    },
    "3d-hero-globel": {
        props: [
            { name: "className", type: "string", default: '""', description: "Additional CSS classes for the container." },
            { name: "onLoad", type: "() => void", default: "undefined", description: "Callback fired when the Spline scene loads." }
        ],
        vibeMeta: {
            behavior: "A massive interactive 3D globe with floating data points and luxury lighting, powered by Spline. Features custom premium loader and branding protection.",
            states: { from: "premium ring loader animation", to: "interactive 3D HERO GLOBEL scene" },
            cssProperties: ["transform", "opacity", "filter", "z-index"],
            description: "Premium Spline-powered 3D HERO GLOBEL with loader and branding removal.",
            libraries: ["@splinetool/react-spline", "framer-motion"],
            requirements: ["Spline scene integration", "Concentric ring loader animation", "Branding object programmatic removal", "CSS watermark hiding", "Hover-reveal '3D Asset' badge"]
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
    }
};
