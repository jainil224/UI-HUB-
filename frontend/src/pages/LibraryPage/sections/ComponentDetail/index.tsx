import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft, RotateCcw, Eye, Code,
    Check, Copy, Zap, ChevronDown, Brain, Cpu, Heart
} from 'lucide-react';
import CodeHighlighter from '../../../../components/ui/CodeHighlighter';
import * as Animations from '../../../../components/animations/TextAnimations';
import * as VisualEffects from '../../../../components/animations/VisualEffects';
import { getComponentCode } from '../../../../utils/codeUtils';
import { generateVibePrompt, AISystem, VibeMeta } from '../../../../utils/promptUtils';
import { useAuth } from '../../../../context/AuthContext';
import { saveToFavorites, removeFromFavorites, getUserFavorites } from '../../../../services/favorites';
import AuthRequiredModal from '../../../../components/ui/AuthRequiredModal';

interface ComponentConfig {
    props: { name: string; type: string; default: string; description: string }[];
    vibeMeta: VibeMeta;
}

const COMPONENT_CONFIG: Record<string, ComponentConfig> = {
    // ... text animations (already present in the file, keeping logic same)
    "blur-text": {
        props: [
            { name: "text", type: "string", default: '"BLUR IN TEXT"', description: "The text content to display with blur-in effect" },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes to apply to the component" },
            { name: "delay", type: "number", default: "0", description: "Delay before animation starts in seconds" },
            { name: "duration", type: "number", default: "0.8", description: "Animation duration in seconds" }
        ],
        vibeMeta: {
            behavior: "Animate characters by blurring them from a high value to zero while increasing opacity.",
            states: { from: "opacity: 0, filter: blur(10px)", to: "opacity: 1, filter: blur(0px)" },
            cssProperties: ["filter", "opacity", "transition"],
            description: "A premium character-by-character blur-in reveal effect.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Per-character staggered animation", "Blur-to-sharp transition", "Opacity fade-in", "Smooth cubic-bezier easing"]
        }
    },
    // ... (rest of text animations would be here, skipping for brevity but assuming they stay)
    "dock-text": {
        props: [
            { name: "text", type: "string", default: '"DOCK TEXT"', description: "Text content for the dock animation" },
            { name: "className", type: "string", default: '""', description: "Custom classes for the container" },
            { name: "duration", type: "number", default: "0.5", description: "Spring transition duration" },
            { name: "delay", type: "number", default: "0", description: "Start delay" }
        ],
        vibeMeta: {
            behavior: "Scale text characters based on proximity to the cursor, creating a fisheye effect.",
            states: { from: "scale: 1", to: "scale: 1.5 (proximity-based)" },
            cssProperties: ["transform", "transition-timing-function"],
            description: "Interactive fisheye dock effect for text characters.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Mouse proximity detection", "Dynamic scaling per character", "Smooth spring physics", "Performance-optimized hover handling"]
        }
    },
    "fade-text": {
        props: [
            { name: "text", type: "string", default: '"FADE TEXT"', description: "Content to fade in" },
            { name: "duration", type: "number", default: "1.5", description: "Fade duration" },
            { name: "className", type: "string", default: '""', description: "Custom styling classes" }
        ],
        vibeMeta: {
            behavior: "Simple and elegant fade-in animation for text transitions.",
            states: { from: "opacity: 0", to: "opacity: 1" },
            cssProperties: ["opacity", "transition"],
            description: "Clean and professional text fade-in component.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Smooth opacity transition", "Adjustable duration and delay", "Direct DOM mounting reveal"]
        }
    },
    "font-weight": {
        props: [
            { name: "text", type: "string", default: '"VARIABLE WEIGHT"', description: "Text for weight animation" },
            { name: "duration", type: "number", default: "1", description: "Transition speed between weights" },
            { name: "weights", type: "number[]", default: "[400, 900]", description: "Range of weights to animate" }
        ],
        vibeMeta: {
            behavior: "Animate font-weight smoothly between two specified numerical values.",
            states: { from: "font-weight: 400", to: "font-weight: 900" },
            cssProperties: ["font-weight", "font-variation-settings"],
            description: "Dynamic variable font weight animation.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Variable font support", "Numeric font-weight interpolation", "Smooth weight shifting loop or trigger"]
        }
    },
    "gradual-spacing": {
        props: [
            { name: "text", type: "string", default: '"GRADUAL SPACING"', description: "Text content to animate" },
            { name: "duration", type: "number", default: "1.5", description: "Animation speed per character" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay between characters" }
        ],
        vibeMeta: {
            behavior: "Increase letter-spacing gradually for each character in a staggered sequence.",
            states: { from: "letter-spacing: -0.5em, opacity: 0", to: "letter-spacing: normal, opacity: 1" },
            cssProperties: ["letter-spacing", "opacity", "transition"],
            description: "Cinematic text expansion with staggered letter spacing.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Staggered character reveal", "Letter-spacing interpolation", "Opacity fade-in", "Expansive motion feel"]
        }
    },
    "letter-pull-up": {
        props: [
            { name: "text", type: "string", default: '"LETTER PULL UP"', description: "Text content" },
            { name: "duration", type: "number", default: "0.6", description: "Pull up duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ],
        vibeMeta: {
            behavior: "Characters slide up from below the baseline into their final position with a staggered offset.",
            states: { from: "transform: translateY(100%), opacity: 0", to: "transform: translateY(0), opacity: 1" },
            cssProperties: ["transform", "opacity", "transition"],
            description: "Modern slide-up character reveal effect.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Vertical slide-in from Y-offset", "Staggered letter timing", "Smooth spring reveal", "Overflow-hidden container clipping"]
        }
    },
    "multi-direction-slide": {
        props: [
            { name: "text", type: "string", default: '"MULTI DIRECTION"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Slide duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ],
        vibeMeta: {
            behavior: "Text elements slide into view from multiple directions (left, right, top, bottom) simultaneously.",
            states: { from: "transform: translate(±50px), opacity: 0", to: "transform: translate(0), opacity: 1" },
            cssProperties: ["transform", "opacity", "transition"],
            description: "Dynamic multi-directional entrance animation for text.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Dynamic direction calculation", "Simultaneous staggered reveals", "Elastic exit/entrance feel"]
        }
    },
    "scale-letter": {
        props: [
            { name: "text", type: "string", default: '"SCALE LETTER"', description: "Text content" },
            { name: "duration", type: "number", default: "0.5", description: "Scale animation duration" },
            { name: "delay", type: "number", default: "0.05", description: "Stagger delay" }
        ],
        vibeMeta: {
            behavior: "Scale each character from zero to its natural size with a spring or ease-out effect.",
            states: { from: "transform: scale(0), opacity: 0", to: "transform: scale(1), opacity: 1" },
            cssProperties: ["transform", "opacity", "transition"],
            description: "Playful character-by-character scaling reveal.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Spring physics for scale", "Staggered letter reveal", "Transform-origin centering", "Opacity fade-in"]
        }
    },
    "separate-away": {
        props: [
            { name: "text", type: "string", default: '"SEPARATE AWAY"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Separation duration" },
            { name: "delay", type: "number", default: "0.2", description: "Initial delay" }
        ],
        vibeMeta: {
            behavior: "Characters move away from each other along the X-axis upon interaction or mount.",
            states: { from: "transform: translateX(0)", to: "transform: translateX(±15px)" },
            cssProperties: ["transform", "transition"],
            description: "Interactive character separation effect.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["X-axis displacement animation", "Symmetrical separation logic", "Interactive hover triggers", "Smooth return-to-original-state transition"]
        }
    },
    "wavy-text": {
        props: [
            { name: "text", type: "string", default: '"WAVY TEXT"', description: "Text content" },
            { name: "duration", type: "number", default: "1.5", description: "Wave loop duration" },
            { name: "delay", type: "number", default: "0.1", description: "Wave propagation delay" }
        ],
        vibeMeta: {
            behavior: "Continuous vertical wave motion applied to characters using a periodic sine function.",
            states: { from: "transform: translateY(0)", to: "transform: translateY(±8px) loop" },
            cssProperties: ["transform", "transition"],
            description: "Hypnotic continuous wavy text animation.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Sine-wave vertical oscillation", "Seamless looping animation", "Per-character phase offset", "Smooth 60fps motion"]
        }
    },
    "word-pull-up": {
        props: [
            { name: "text", type: "string", default: '"WORD PULL UP"', description: "Text content" },
            { name: "duration", type: "number", default: "0.8", description: "Pull up duration per word" },
            { name: "delay", type: "number", default: "0.2", description: "Stagger delay between words" }
        ],
        vibeMeta: {
            behavior: "Full words slide up from below the baseline with opacity fade-in.",
            states: { from: "transform: translateY(20px), opacity: 0", to: "transform: translateY(0), opacity: 1" },
            cssProperties: ["transform", "opacity", "transition"],
            description: "Modern word-by-word reveal effect.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Word-level splitting and mapping", "Staggered slide-up animation", "Opacity reveal", "Container clipping (overflow-hidden)"]
        }
    },
    // Visual Effects
    "liquid-glass": {
        props: [
            { name: "location", type: "string", default: '"Surat"', description: "The city name to display" },
            { name: "temperature", type: "string", default: '"+18°"', description: "Current temperature display" },
            { name: "backgroundImage", type: "string", default: '"unsplash-url"', description: "Source URL for the dashboard background" },
            { name: "glassOpacity", type: "number", default: "0.05", description: "Transparency of the glass layers" }
        ],
        vibeMeta: {
            behavior: "Premium weather dashboard interface utilizing multiple layers of glassmorphism, backdrop-blur, and Lucide icons.",
            states: { from: "transparent overlays", to: "vivid glassmorphism with high-contrast content" },
            cssProperties: ["backdrop-filter", "background", "border", "grid-layout"],
            description: "A state-of-the-art glassmorphism weather dashboard layout.",
            libraries: ["framer-motion", "lucide-react", "clsx", "tailwind-merge"],
            requirements: ["Multi-layered glassmorphism", "Dynamic backdrop-blur intensity", "Smooth entry animations for weather cards", "Responsive grid architecture"]
        }
    },
    "noise": {
        props: [
            { name: "opacity", type: "number", default: "0.05", description: "Visibility of the noise grain" }
        ],
        vibeMeta: {
            behavior: "Subtle animated grain effect using SVG turbulence for a cinematic digital aesthetic.",
            states: { from: "static", to: "animated turbulence overlay" },
            cssProperties: ["filter", "mix-blend-mode", "opacity"],
            description: "Animated cinematic noise grain effect for depth and texture.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["SVG feTurbulence base", "Dynamic opacity mapping", "Optimized animation performance", "Seamless grain looping"]
        }
    },
    "blur-vignette": {
        props: [
            { name: "radius", type: "string", default: '"24px"', description: "Border radius of the container" },
            { name: "inset", type: "string", default: '"0px"', description: "Inset distance for the vignette" },
            { name: "transitionLength", type: "string", default: '"40px"', description: "Length of the blur transition" },
            { name: "blur", type: "string", default: '"10px"', description: "Blur intensity" }
        ],
        vibeMeta: {
            behavior: "Radial mask that applies a heavy blur to the edges, focusing visual attention on the center.",
            states: { from: "clear", to: "blurred edges via radial-mask" },
            cssProperties: ["backdrop-filter", "mask-image", "WebkitMaskImage"],
            description: "Professional radial blur vignette effect for focus.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["Linear/Radial mask implementation", "Dynamic blur intensity", "Responsive vignette scaling", "High-performance backdrop filtering"]
        }
    },
    "liquid-gradient": {
        props: [
            { name: "color", type: "string", default: '"#00FF00"', description: "Primary glow color" }
        ],
        vibeMeta: {
            behavior: "Morphing radial gradients that shift smoothly to create a fluid, organic light effect.",
            states: { from: "static gradient", to: "shifting radial-gradient loop" },
            cssProperties: ["background", "transform", "transition"],
            description: "Hyper-smooth morphing mesh gradients for a premium feel.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Multiple animated radial gradients", "Smooth color interpolation", "Organic movement patterns", "Luminescent glow effect"]
        }
    },
    "spotlight-cards": {
        props: [
            { name: "cards", type: "CardItem[]", default: "3 items", description: "Array of card data including title, icon, and colors" },
            { name: "branding", type: "string", default: '"UiLayout"', description: "Branding text displayed on cards" },
            { name: "layout", type: "string", default: '"grid-cols-3"', description: "Grid layout configuration" }
        ],
        vibeMeta: {
            behavior: "Premium 3-card layout with individual color themes, Lucide icons, and a synchronized cursor-glow system with branding.",
            states: { from: "dark", to: "active glow and border highlight" },
            cssProperties: ["mask-image", "background", "backdrop-filter"],
            description: "Interactive spotlight grid with cursor-tracking luminosity.",
            libraries: ["framer-motion", "lucide-react", "clsx", "tailwind-merge"],
            requirements: ["Real-time mouse tracking", "Synchronized glow effect across multiple cards", "Dynamic color themes per card", "Premium border highlight logic"]
        }
    },
    "image-reveal": {
        props: [
            { name: "duration", type: "number", default: "0.5", description: "Reveal speed" }
        ],
        vibeMeta: {
            behavior: "Reveals content behind a mask using a sliding or clip-path transition on hover.",
            states: { from: "clipped/hidden", to: "full polygon reveal" },
            cssProperties: ["clip-path", "transform", "transition"],
            description: "Cinematic image reveal effect using SVG clip-paths.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Custom clip-path polygon animation", "Hover-triggered masking", "Smooth ease-in-out transition", "Responsive container fitting"]
        }
    },
    "blocks": {
        props: [
            { name: "count", type: "number", default: "16", description: "Number of blocks in the grid" }
        ],
        vibeMeta: {
            behavior: "Staggered grid of blocks that fade or scale into view, responding to hover states.",
            states: { from: "empty grid", to: "staggered block appear" },
            cssProperties: ["display: grid", "scale", "opacity"],
            description: "Staggered block entrance animation for grid layouts.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Dynamic grid block generation", "Staggered entrance timing", "Scale-up or opacity-fade reveal", "High-performance CSS grid usage"]
        }
    },
    "animated-beam": {
        props: [
            { name: "speed", type: "number", default: "2", description: "Seconds per loop" }
        ],
        vibeMeta: {
            behavior: "High-speed linear light beam that sweeps across the container in a rhythmic loop.",
            states: { from: "off-screen", to: "infinite linear sweep" },
            cssProperties: ["background-image", "transform", "animation"],
            description: "Futuristic high-speed scanning beam animation.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Infinite linear translation loop", "Luminescent linear gradient", "Synchronized sweep speed", "Dark mode glow optimization"]
        }
    },
    "grid-background": {
        props: [
            { name: "color", type: "string", default: '"#00FF00"', description: "Grid line color" }
        ],
        vibeMeta: {
            behavior: "A subtle animated grid background with a radial gradient mask.",
            states: { from: "static grid", to: "animated moving grid lines" },
            cssProperties: ["background-image", "mask-image", "animation"],
            description: "Premium technical grid background with movement.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["Repetitive background-image grid", "Radial gradient masking", "Subtle translate animation", "Responsive scaling"]
        }
    },
    "hacker-background": {
        props: [
            { name: "color", type: "string", default: '"#0F0"', description: "The hexadecimal color of the falling digital rain." },
            { name: "fontSize", type: "number", default: "15", description: "The size in pixels of the monospace characters." },
            { name: "speed", type: "number", default: "1", description: "Multiplier for the falling speed of the characters." }
        ],
        vibeMeta: {
            behavior: "A matrix-style digital rain background using HTML Canvas.",
            states: { from: "black", to: "animated green rain" },
            cssProperties: ["canvas", "font-family: mono"],
            description: "Iconic matrix digital rain canvas effect.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["Direct Canvas API rendering", "Character rain stream logic", "Fading tail effect", "Performance-optimized draw loop"]
        }
    },
    "novatrix-background": {
        props: [
            { name: "colorFrom", type: "string", default: '"#1e1b4b"', description: "The starting gradient color of the nebula pulse." },
            { name: "colorTo", type: "string", default: '"#581c87"', description: "The ending/radial glow color of the nebula pulse." },
            { name: "opacity", type: "number", default: "1", description: "The overall opacity of the background scene." },
            { name: "title", type: "string", default: '"NOVATRIX NEBULA"', description: "The glowing text displayed in the center of the background." }
        ],
        vibeMeta: {
            behavior: "A deep space nebula effect using slow-moving gradients and pulse animations.",
            states: { from: "static gradient", to: "pulsing nebula" },
            cssProperties: ["background-image", "animation: pulse"],
            description: "Slow-moving organic atmospheric nebula background.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Animated mesh gradients", "Slow-pulse opacity loops", "Subtle transform drifting", "Dark mode aesthetic focus"]
        }
    },
    "beam-grid-background": {
        props: [
            { name: "gridColor", type: "string", default: '"rgba(255,255,255,0.05)"', description: "Color of the static grid" },
            { name: "beamIntensity", type: "number", default: "0.5", description: "Bightness of the beams" }
        ],
        vibeMeta: {
            behavior: "Dynamic light beams traversing a grid with glow.",
            states: { from: "grid", to: "moving beams" },
            cssProperties: ["mask-image", "background-image"],
            description: "High-tech beam grid with light propagation.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Grid background pattern", "Staggered beam translations", "Glow-on-movement intensity", "Seamless infinite loops"]
        }
    },
    "fall-beam-background": {
        props: [
            { name: "lineCount", type: "number", default: "20", description: "Number of falling beams" },
            { name: "beamColorClass", type: "string", default: "'cyan-400'", description: "Tailwind color class for the beam" }
        ],
        vibeMeta: {
            behavior: "Matrix-style glowing vertical falling beams animation.",
            states: { from: "static lines", to: "falling glowing beams" },
            cssProperties: ["animation: fall", "background: linear-gradient"],
            description: "Advanced glowing digital fall effect with vertical beams.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Dynamic vertical translation loops", "Tailwind-based color themes", "Glow intensity pulsing", "Responsive line count distribution"]
        }
    },
    "hell-background": {
        props: [
            { name: "color", type: "string", default: '"#DE443B"', description: "Primary hellfire color" },
            { name: "backdropBlurAmount", type: "BlurSize", default: '"none"', description: "Amount of blur applied" }
        ],
        vibeMeta: {
            behavior: "A chaotic WebGL inferno effect using GLSL shaders.",
            states: { from: "still fire", to: "swirling hellfire" },
            cssProperties: ["gl_FragColor", "canvas", "backdrop-filter"],
            description: "High-performance WebGL shader background featuring chaotic fluid fire dynamics.",
            libraries: ["three", "clsx", "tailwind-merge"],
            requirements: ["Custom GLSL fragment shaders", "WebGL canvas integration", "Simplex noise distortion", "Frame-buffer based fluid dynamics", "Performance-optimized fragment calculations"]
        }
    },
    "interactive-grid-background": {
        props: [
            { name: "gridSize", type: "number", default: "50", description: "Size of the grid cells" },
            { name: "effectColor", type: "string", default: '"rgba(0, 255, 0, 0.5)"', description: "Color of the hover glow effect" }
        ],
        vibeMeta: {
            behavior: "Glow-on-hover interactive grid with trailing effects.",
            states: { from: "dark grid", to: "glowing trailing cells" },
            cssProperties: ["canvas", "shadowBlur", "fillRect"],
            description: "Interactive reactive grid using Canvas for responsive mouse feedback.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["Real-time mouse position tracking", "Proximity-based cell illumination", "Fading cell trails logic", "High-performance Canvas draw loop"]
        }
    },
    "particles-background": {
        props: [
            { name: "colors", type: "string[]", default: "['#ff223e', '#5d1eb2', '#ff7300']", description: "Theme colors for particles" },
            { name: "size", type: "number", default: "3", description: "Base size of particles" }
        ],
        vibeMeta: {
            behavior: "Floating interactive particle system with glow and movement.",
            states: { from: "still particles", to: "moving floating particles" },
            cssProperties: ["canvas", "filter: blur", "svg: feGaussianBlur"],
            description: "Sophisticated interactive particle field with organic motion.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["Canvas 2D particle simulation", "Mouse repelling/attracting logic", "Dynamic particle color interpolation", "Blur-filter based glow effects"]
        }
    },
    "wave-background": {
        props: [
            { name: "backdropBlurAmount", type: "BlurSize", default: '"sm"', description: "Blur intensity on top" }
        ],
        vibeMeta: {
            behavior: "Flowing WebGL waves using multi-sine GLSL distortion.",
            states: { from: "flat color", to: "moving color waves" },
            cssProperties: ["sin()", "gl_FragCoord", "canvas"],
            description: "Ultra-smooth WebGL wave background using procedural noise and sine-summation.",
            libraries: ["three", "simplex-noise", "clsx", "tailwind-merge"],
            requirements: ["Three.js Scene and Camera setup", "Vertex disruption logic via Simplex Noise", "Interactive mouse distortion on waves", "Adjustable amplitude and frequency parameters", "Resource disposal for optimized memory management"]
        }
    },
    "lines-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Smooth SVG path flow animation creating a dynamic liquid-like background.",
            states: { from: "static paths", to: "flowing paths" },
            cssProperties: ["svg", "path", "animation"],
            description: "Elegant liquid-style SVG path animations.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Dynamic SVG path generation", "Bezier curve interpolation", "Staggered wave motion along paths", "Responsive SVG viewport scaling"]
        }
    },
    "sparkles-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Twinkling starfield/sparkles using high-performance particles.",
            states: { from: "dark sky", to: "twinkling sparkles" },
            cssProperties: ["canvas", "particle-system", "opacity-flicker"],
            description: "Mesmerizing twinkling sparkle/star field animation.",
            libraries: ["clsx", "tailwind-merge"],
            requirements: ["High-density particle simulation", "Individual particle opacity flickering", "Subtle drift motion", "Performance-optimized dot rendering"]
        }
    },
    "isometric-grid-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Skewed isometric grid that illuminates random cells on hover.",
            states: { from: "flat grid", to: "illuminated isometric grid" },
            cssProperties: ["transform: skew", "grid-layout", "glow"],
            description: "Future-tech isometric grid with reactive cell lighting.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Isometric CSS transform (skew/rotate)", "Reactive cell-level mouse tracking", "Luminescent glow transitions", "Perspective-aware layout scaling"]
        }
    },
    // Buttons
    "glow-button": {
        props: [
            { name: "label", type: "string", default: '"Glow Button"', description: "The text to display on the button." },
            { name: "color", type: "string", default: '"#22c55e"', description: "The base color of the button which also defines the glow shadow color." }
        ],
        vibeMeta: {
            behavior: "A solid colored button that emits a vibrant, matching neon drop-shadow when the user hovers over it.",
            states: { from: "flat background", to: "active glowing shadow" },
            cssProperties: ["box-shadow", "transition", "transform"],
            description: "A minimal, modern button utilizing Tailwind for an intense glowing drop shadow on hover.",
            libraries: ["tailwindcss"],
            requirements: ["Hover state pseudo-classes", "Custom intense drop shadow", "Smooth transition duration", "High-contrast text"]
        }
    },
    "payment-transaction-button": {
        props: [
            { name: "label", type: "string", default: '"New Transaction"', description: "The text to display inside the button." },
            { name: "accentColor", type: "string", default: '"#5de2a3"', description: "The primary accent color used for the left banner gradient." },
            { name: "posColor", type: "string", default: '"#1f1f1f"', description: "The color of the animated POS terminal illustration." },
            { name: "cardColor", type: "string", default: '"#2b2b2b"', description: "The color of the animated credit card illustration." },
            { name: "currencySymbol", type: "string", default: '"$"', description: "The currency symbol displayed on the POS screen." }
        ],
        vibeMeta: {
            behavior: "An interactive button containing a miniature 3D-like illustration of a credit card being inserted into a POS terminal. The animation triggers smoothly on hover.",
            states: { from: "static illustration", to: "animated card insertion sequence" },
            cssProperties: ["transform", "box-shadow", "transition", "absolute positioning"],
            description: "A highly interactive payment transaction button with CSS-based micro-illustrations.",
            libraries: ["No external libraries required"],
            requirements: ["Complex CSS illustration techniques", "Staggered sub-animations (card, POS, text)", "Smooth cubic-bezier transitions", "Responsive layout scaling"]
        }
    },
    "magic-card-effect": {
        props: [
            { name: "gradientSize", type: "number", default: "200", description: "The radius (in pixels) of the interactive glow following the cursor." },
            { name: "gradientColor", type: "string", default: '"#262626"', description: "The base color of the radial glow masking the background." },
            { name: "gradientOpacity", type: "number", default: "0.8", description: "The maximum opacity of the hover glow effect." },
            { name: "gradientFrom", type: "string", default: '"#9E7AFF"', description: "The starting color of the animated border gradient." },
            { name: "gradientTo", type: "string", default: '"#FE8BBB"', description: "The ending color of the animated border gradient." }
        ],
        vibeMeta: {
            behavior: "A card element where the border and inner background illuminate with a radial gradient that smoothly tracks the user's mouse pointer position.",
            states: { from: "dark themed card", to: "interactive pointer-tracked illumination" },
            cssProperties: ["radial-gradient", "background-attachment", "opacity"],
            description: "An interactive glassmorphic card where gradients follow the mouse cursor.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Mouse position event tracking", "Dynamic CSS gradient updates", "Smooth opacity transitions", "Frameloop optimization for performance"]
        }
    },
    "rainbow-button": {
        props: [
            { name: "variant", type: '"default"', default: '"default"', description: "The visual style variant of the button." },
            { name: "size", type: '"default" | "sm" | "lg" | "icon"', default: '"default"', description: "The size configuration of the button." }
        ],
        vibeMeta: {
            behavior: "A sleek dark button bordered by a continuously scrolling, multicolored neon gradient strip.",
            states: { from: "static button", to: "continuous animated rainbow border" },
            cssProperties: ["background-image", "animation", "background-clip"],
            description: "A premium button featuring a continuously spinning rainbow border animation.",
            libraries: ["class-variance-authority", "tailwindcss"],
            requirements: ["Linear gradient animation loops", "CSS background clipping techniques", "Performance-optimized keyframes", "CVA-based styling variants"]
        }
    },
    "social-tooltip-buttons": {
        props: [
            { name: "icons", type: "SocialIconProps[]", default: "Default platforms", description: "An array of objects defining the social network name, brand color, and SVG icon." }
        ],
        vibeMeta: {
            behavior: "A row of minimal white social icons. On hover, the button fills with the brand's specific color, and a heavily stylized 3D tooltip springs up from the button.",
            states: { from: "minimal white icons", to: "branded colored icons with 3D tooltips" },
            cssProperties: ["transform", "opacity", "background-color", "transition"],
            description: "A set of premium social media links featuring highly interactive 3D springing tooltips and brand colors.",
            libraries: ["tailwindcss"],
            requirements: ["Spring physics using CSS cubic-bezier", "Dynamic CSS variables for brand colors", "Absolute positioned tooltip geometry", "Hover-state chaining across elements"]
        }
    },
    "border-beam": {
        props: [
            { name: "size", type: "number", default: "50", description: "The width dimension of the sweeping animated beam." },
            { name: "duration", type: "number", default: "6", description: "The total duration of the animation loop in seconds." },
            { name: "colorFrom", type: "string", default: '"#7400ff"', description: "The starting hex color of the beam's gradient." },
            { name: "colorTo", type: "string", default: '"#9b41ff"', description: "The ending hex color of the beam's gradient." },
            { name: "beamBorderRadius", type: "number", default: "undefined", description: "Optional border radius applied to the beam element itself." },
            { name: "glowIntensity", type: "number", default: "0", description: "Multiplication factor for a luminescent drop-shadow effect." }
        ],
        vibeMeta: {
            behavior: "Animates a continuous, masked linear gradient beam of light sweeping endlessly across the horizontal axis.",
            states: { from: "off-screen left", to: "sweeping right" },
            cssProperties: ["mask-image", "background-gradient", "transform: left", "box-shadow"],
            description: "Premium animated linear beam of light sweeping horizontally.",
            libraries: ["framer-motion", "clsx", "tailwind-merge"],
            requirements: ["Transparent clip-box masking", "Infinite linear-timing animation loops", "Smooth directional gradient interpolation"]
        }
    },
    "shatter-button": {
        props: [
            { name: "shardCount", type: "number", default: "20", description: "Number of geometric glass shards generated upon clicking." },
            { name: "shatterColor", type: "string", default: '"#00ffff"', description: "Base HEX color determining the overall accent color, explosion ring, and shard geometry." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Optional callback fired when the shatter animation initializes." }
        ],
        vibeMeta: {
            behavior: "Explodes the core button into dynamic, randomly-generated physics-based vector polygons when clicked, alongside an expanding sonic ring.",
            states: { from: "solid glowing state", to: "dispersed shards and expanding ring" },
            cssProperties: ["clip-path: polygon", "transform", "box-shadow", "background: linear-gradient"],
            description: "Interactive physics-based shattering glass button with exit sequences.",
            libraries: ["framer-motion"],
            requirements: ["Dynamic SVG polygon generation math", "Randomized radial explosion physics per shard", "Staggered exit animations", "Expanding pulse ring effect"]
        }
    },
    // Adding CornerBorderButton properties 
    "corner-border-button": {
        props: [
            { name: "baseColor", type: "string", default: '"#0b1a2a"', description: "The button background color in resting state." },
            { name: "hoverColor", type: "string", default: '"#ff3b4d"', description: "The background color applied to the overlay upon hover." },
            { name: "borderColor", type: "string", default: '"#60daff"', description: "Controls the hex color code for the animated linear SVG edges and glowing corner points." }
        ],
        vibeMeta: {
            behavior: "On hover, four independent border strokes animate simultaneously from opposite direction corner nodes to draw a seamless full rectangle enclosure.",
            states: { from: "static corners", to: "active rectangle frame" },
            cssProperties: ["width, height", "absolute positioning", "box-shadow"],
            description: "A 60fps responsive button frame expanding directly from fixed corner joints.",
            libraries: ["tailwindcss"],
            requirements: ["Top/bottom horizontal line expansion", "Left/right vertical propagation sequence", "Opposing directional flow", "Staggered sub-pixel transition delays for fluid continuous tracking"]
        }
    },
    // Adding MarqueeHoverButton properties
    "marquee-hover-button": {
        props: [
            { name: "label", type: "string", default: '"Button"', description: "The text to display inside the button and on the scrolling marquee." },
            { name: "disabled", type: "boolean", default: "false", description: "Disables interaction and applies lowered opacity." }
        ],
        vibeMeta: {
            behavior: "A button that displays a scrolling marquee of text when hovered.",
            states: { from: "static text", to: "continuous scrolling text" },
            cssProperties: ["animation: marquee", "overflow: hidden", "white-space: nowrap"],
            description: "Attention-grabbing button with infinite text scrolling animation.",
            libraries: ["tailwindcss"],
            requirements: ["CSS infinite translation loops", "Duplicated span tags for seamless wrapping", "Overflow hiding masks"]
        }
    },
    "space-background": {
        props: [
            { name: "starCount", type: "number", default: "400", description: "The total number of scattered stars to render in the scene." },
            { name: "nebulaCount", type: "number", default: "6", description: "The number of slow-drifting colored nebula gas clouds." },
            { name: "interactive", type: "boolean", default: "true", description: "Enables parallax shifting of stars based on mouse position." }
        ],
        vibeMeta: {
            behavior: "A rich cosmic backdrop featuring multi-layered starry depth, twinkling points, and subtle nebula gas clouds using Canvas.",
            states: { from: "flat background", to: "3D parallax starfield" },
            cssProperties: ["canvas", "globalCompositeOperation", "shadowBlur"],
            description: "Premium immersive space scene with depth and interaction.",
            libraries: ["react"],
            requirements: ["Canvas 2D context", "Parallax layered motion", "Randomized geometric shard explosions on unstable stars"]
        }
    },
    "neural-network-background": {
        props: [
            { name: "nodeCount", type: "number", default: "120", description: "The number of floating data nodes." },
            { name: "connectionDistance", type: "number", default: "150", description: "The maximum pixel distance threshold for nodes to draw connecting lines." },
            { name: "interactive", type: "boolean", default: "true", description: "Enables cursor magnetic repulsion and direct cursor connections." },
            { name: "nodeColor", type: "string", default: '"#22d3ee"', description: "The hex color of the nodes." },
            { name: "lineColor", type: "string", default: '"rgba(34, 211, 238, 0.2)"', description: "The base color of the connecting lines." }
        ],
        vibeMeta: {
            behavior: "An AI-themed network of floating nodes that connect via vector lines based on proximity to each other and the user's cursor.",
            states: { from: "floating dots", to: "connected neural web" },
            cssProperties: ["canvas", "shadowBlur"],
            description: "Futuristic interactive data web.",
            libraries: ["react"],
            requirements: ["Proximity distance checks (O(n^2))", "Mouse repulsion physics", "Sine-based pulsing opacity"]
        }
    },
    "black-hole-background": {
        props: [
            { name: "particleCount", type: "number", default: "600", description: "The number of dust particles orbiting the singularity." },
            { name: "coreColor", type: "string", default: '"rgba(79, 70, 229, 0.4)"', description: "The underlying glow color of the central vortex." },
            { name: "accentColor", type: "string", default: '"#22d3ee"', description: "The color of the high-energy orbital particles." }
        ],
        vibeMeta: {
            behavior: "A central glowing singularity that draws in swirling particles with simulated radial gravity and inverse quadratic acceleration.",
            states: { from: "still particles", to: "swirling vortex" },
            cssProperties: ["canvas", "radial-gradient", "globalCompositeOperation: screen"],
            description: "Cinematic black hole accretion disk simulation.",
            libraries: ["react"],
            requirements: ["Polar coordinate tracking", "Inverse gravity simulation", "Core-collision respawning logic"]
        }
    },
    "warp-speed-background": {
        props: [
            { name: "starCount", type: "number", default: "800", description: "Total number of stars in the hyperspace tunnel." },
            { name: "speed", type: "number", default: "15", description: "The velocity factor at which stars rush toward the viewer." },
            { name: "starColor", type: "string", default: '"#fff"', description: "The base color of the streaking stars." }
        ],
        vibeMeta: {
            behavior: "A high-speed 3D tunnel effect where points stretch into long streaks originating from a central vanishing point.",
            states: { from: "static stars", to: "rushing light streaks" },
            cssProperties: ["canvas"],
            description: "Classic sci-fi hyperspace warp drive effect.",
            libraries: ["react"],
            requirements: ["3D to 2D perspective projection", "Frame-buffer line drawing for trails", "Z-index wrapping"]
        }
    },
    "mouse-gravity-background": {
        props: [
            { name: "particleCount", type: "number", default: "150", description: "The baseline number of persistent floating particles." },
            { name: "attractionRadius", type: "number", default: "300", description: "The distance at which particles begin moving toward the cursor." },
            { name: "attractionForce", type: "number", default: "0.05", description: "The multiplier dictating acceleration speed toward the cursor." },
            { name: "particleColor", type: "string", default: '"#22d3ee"', description: "The primary theme color of half the particles." },
            { name: "accentColor", type: "string", default: '"#a855f7"', description: "The secondary theme color of the remaining particles." },
            { name: "enableTrail", type: "boolean", default: "true", description: "Enables spawning temporary particle trails directly behind the cursor." }
        ],
        vibeMeta: {
            behavior: "Floating motes of light that aggressively accelerate toward the user's cursor when within range, mimicking a gravity well.",
            states: { from: "drifting motes", to: "swarming cursor followers" },
            cssProperties: ["canvas", "shadowBlur"],
            description: "Responsive interactive particle swarm that tracks the cursor.",
            libraries: ["react"],
            requirements: ["Damping/Friction physics", "Mouse enter/leave lifecycle handling", "Temporary particle garbage collection"]
        }
    },
    "stripe-mesh-background": {
        props: [
            { name: "intensity", type: "number", default: "0.8", description: "The global opacity of the underlying gradient blobs." },
            { name: "speed", type: "number", default: "1", description: "A mutiplier that affects the duration of the CSS animation loops." }
        ],
        vibeMeta: {
            behavior: "A vibrant, flowing aesthetic background combining heavily blurred CSS shapes, SVG visual noise, and a white vignette.",
            states: { from: "static blobs", to: "fluid intermixing colors" },
            cssProperties: ["filter: blur", "mix-blend-mode: multiply", "animation: linear infinite", "perspective"],
            description: "Ultra-premium static/flow mesh gradient styled after modern SaaS landing pages.",
            libraries: ["react"],
            requirements: ["3D transforms (rotateX/Y)", "SVG fractalNoise filtering", "Multi-axis translation keyframes"]
        }
    },
    "orbit-button": {
        props: [
            { name: "label", type: "string", default: '"Orbit Button"', description: "The text to display inside the button." },
            { name: "color", type: '"blue" | "purple" | "cyan"', default: '"cyan"', description: "The neon color theme for the button and particles." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Optional click handler." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A central neon button with multiple particles orbiting it at different speeds and radii. Hovering increases rotation speed and glow intensity.",
            states: { from: "gentle slow orbit", to: "fast orbit with intense neon glow" },
            cssProperties: ["transform", "box-shadow", "backdrop-filter", "filter"],
            description: "Futuristic planetary orbit animation for a premium button component.",
            libraries: ["framer-motion", "tailwindcss"],
            requirements: ["Continuous rotation loops", "Speed scaling on hover", "Neon box-shadow glows", "Glassmorphic button base"]
        }
    },
    "galaxy-button": {
        props: [
            { name: "label", type: "string", default: '"Galaxy Button"', description: "The text to display inside the button." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Optional click handler." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A multi-layered cosmic button featuring parallax rotating star fields, drifting nebulas, and an animated conic-gradient border. Hovering triggers a high-end light sweep and intensifies the outer neon aura.",
            states: { from: "gentle cosmic rotation", to: "bright galactic bloom with interactive shimmer" },
            cssProperties: ["background", "transform", "box-shadow", "filter", "conic-gradient"],
            description: "Premium state-of-the-art celestial animation for futuristic high-end UIs.",
            libraries: ["framer-motion", "tailwindcss"],
            requirements: ["Multi-layer parallax star fields", "Conic-gradient border rotation", "Interactive light sweep geometry", "Advanced neon aura interpolation"]
        }
    },
    "liquid-fill-button": {
        props: [
            { name: "label", type: "string", default: '"Liquid Fill"', description: "The text to display inside the button." },
            { name: "liquidColor", type: "string", default: '"#06b6d4"', description: "The color of the liquid filling the button." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Optional click handler." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A button that fills with a smooth SVG wave animation when hovered. The liquid rises from the bottom, and the text color changes for contrast.",
            states: { from: "empty outlined button", to: "filled button with organic wave motion" },
            cssProperties: ["transform", "fill", "color", "box-shadow"],
            description: "Organic liquid fill animation for modern UI components.",
            libraries: ["framer-motion", "tailwindcss"],
            requirements: ["SVG path wave math", "Continuous horizontal wave translation", "Stiffness and damping spring for fill level", "High-contrast text color interpolation"]
        }
    },
    "neon-flicker-button": {
        props: [
            { name: "label", type: "string", default: '"Neon Flicker"', description: "The text to display inside the button." },
            { name: "color", type: '"blue" | "pink" | "purple" | "cyan" | "red"', default: '"red"', description: "The neon color theme for the button." },
            { name: "onClick", type: "() => void", default: "undefined", description: "Optional click handler." },
            { name: "className", type: "string", default: '""', description: "Additional CSS classes." }
        ],
        vibeMeta: {
            behavior: "A cyberpunk button with a random flickering neon light effect and a pulsing glow. Hovering intensifies the flicker and glow, while triggering a high-end light sweep.",
            states: { from: "subtle steady flicker", to: "bright intense neon with interactive light sweep" },
            cssProperties: ["opacity", "box-shadow", "transform", "filter"],
            description: "Futuristic cyberpunk neon interaction with randomized flicker physics.",
            libraries: ["framer-motion", "tailwindcss"],
            requirements: ["Randomized flicker timing loops", "Gaussian blur glow layers", "Linear light sweep geometry", "High-frequency opacity transitions"]
        }
    }
};

const PropsTable = ({ props }: { props: { name: string; type: string; default: string; description: string }[] }) => (
    // ... (rest of the file stays same, only updating resolution logic)
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-[0.2em] text-white/40">
                    <th className="py-6 px-4 font-bold">Prop</th>
                    <th className="py-6 px-4 font-bold">Type</th>
                    <th className="py-6 px-4 font-bold">Default</th>
                    <th className="py-6 px-4 font-bold">Description</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {props.map((p, i) => (
                    <tr key={i} className="border-b border-white/5 group hover:bg-white/[0.02] transition-colors">
                        <td className="py-6 px-4 font-mono">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-brand-green border border-white/10">{p.name}</span>
                        </td>
                        <td className="py-6 px-4 font-mono">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-blue-400 border border-white/10">{p.type}</span>
                        </td>
                        <td className="py-6 px-4 font-mono text-white/60">
                            <span className="px-2 py-1 rounded-md bg-white/5 text-white/40 border border-white/10">{p.default}</span>
                        </td>
                        <td className="py-6 px-4 text-white/60 leading-relaxed">{p.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CustomSelect = ({
    value,
    onChange,
    options,
    label
}: {
    value: string;
    onChange: (val: any) => void;
    options: { id: string; name: string }[];
    label: string;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-white/5 border transition-all text-xs font-bold uppercase tracking-widest ${isOpen ? 'border-brand-green/50 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
            >
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[10px] text-white/40">{label}</span>
                    <span>{selectedOption?.name}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-green' : 'text-white/40'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-2 left-0 w-full min-w-[160px] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-6 py-4 text-left text-xs font-bold uppercase tracking-widest transition-all ${value === opt.id ? 'bg-brand-green text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { ComponentItem } from '../../../../data/componentData';

const ComponentDetail = ({ item, onBack }: { item: ComponentItem; onBack: () => void }) => {
    const [tab, setTab] = React.useState<'preview' | 'code' | 'vibe'>('preview');
    const [copied, setCopied] = React.useState<string | null>(null);
    const [resetKey, setResetKey] = React.useState(0);

    // Dynamic states
    const [installMethod, setInstallMethod] = React.useState<'cli' | 'manual'>('cli');
    const [pkgManager, setPkgManager] = React.useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
    const [lang, setLang] = React.useState<'js' | 'ts' | 'html'>('ts');
    const [styling, setStyling] = React.useState<'tailwind' | 'css'>('tailwind');
    const [aiSystem, setAiSystem] = React.useState<AISystem>('antigravity');
    const { user } = useAuth();
    const [isFavorited, setIsFavorited] = React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);


    React.useEffect(() => {
        if (!user) {
            setIsFavorited(false);
            return;
        }
        const unsubscribe = getUserFavorites(user.uid, (favorites) => {
            const found = favorites.find(f => f.componentId === item.id);
            setIsFavorited(!!found);
        });
        return unsubscribe;
    }, [user, item.id]);

    const toggleFavorite = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (isFavorited) {
            await removeFromFavorites(user.uid, item.id);
        } else {
            await saveToFavorites(user.uid, item);
        }
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const getInstallCommand = (mgr: string, method: string) => {
        if (method === 'cli') return `npx ui-hub add ${item.id}`;
        const cmd: Record<string, string> = {
            npm: 'npm install gsap @gsap/react framer-motion',
            pnpm: 'pnpm add gsap @gsap/react framer-motion',
            yarn: 'yarn add gsap @gsap/react framer-motion',
            bun: 'bun add gsap @gsap/react framer-motion'
        };
        return cmd[mgr];
    };

    const usageCode = `// Usage for ${item.title}
<${item.title.replace(/\s+/g, '')} />`;

    const componentConfig = COMPONENT_CONFIG[item.id] || {
        props: [],
        vibeMeta: { behavior: item.vibePrompt, states: { from: "default", to: "animated" }, cssProperties: ["transition", "transform", "opacity"] }
    };

    const fullVibePrompt = generateVibePrompt(aiSystem, {
        animationName: item.title,
        language: lang,
        styling: styling,
        meta: componentConfig.vibeMeta,
        code: item.code
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-8 pb-24"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-white/40 hover:text-brand-green transition-colors text-sm font-bold uppercase tracking-widest"
                >
                    <ChevronLeft size={16} />
                    Back to Library
                </button>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-5 md:mb-8">
                    <h2 className="text-2xl sm:text-4xl md:text-7xl lg:text-8xl font-display uppercase tracking-tighter text-white leading-none">
                        {item.title}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative group/heart">
                            {/* Persistent Glow Aura */}
                            <div className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-700 ${isFavorited ? 'bg-red-500/20 opacity-100' : 'bg-white/5 opacity-0 group-hover/heart:opacity-100'}`} />

                            <motion.button
                                onClick={toggleFavorite}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className={`relative z-10 p-5 rounded-full border-2 transition-all duration-300 ${isFavorited
                                    ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                                    : 'bg-white/5 border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/10 shadow-2xl'
                                    }`}
                            >
                                <motion.div
                                    animate={isFavorited ? {
                                        scale: [1, 1.15, 1],
                                        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                                    } : {}}
                                >
                                    <Heart
                                        size={28}
                                        fill={isFavorited ? "currentColor" : "transparent"}
                                        className={isFavorited ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'transition-colors'}
                                    />
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
                            <div className="flex flex-wrap gap-2 md:gap-4">
                                <button
                                    onClick={() => setTab('preview')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'preview' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                                >
                                    <Eye size={13} className="md:w-4 md:h-4" />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setTab('code')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                                >
                                    <Code size={13} className="md:w-4 md:h-4" />
                                    Code
                                </button>
                                <button
                                    onClick={() => setTab('vibe')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'vibe' ? 'bg-brand-green text-black border border-brand-green shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'bg-brand-green/10 text-brand-green border border-brand-green/30 hover:bg-brand-green/20 hover:border-brand-green/60 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]'}`}
                                >
                                    <Zap size={13} className={`${tab === 'vibe' ? 'fill-black' : ''} md:w-4 md:h-4`} />
                                    Vibe Prompt
                                </button>
                            </div>

                            <AnimatePresence>
                                {tab === 'preview' && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => setResetKey(prev => prev + 1)}
                                        className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-black transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] shrink-0 group"
                                    >
                                        <RotateCcw key={resetKey} size={14} className={`${resetKey > 0 ? 'animate-spin-once' : ''} transition-transform group-hover:-rotate-90 md:w-4 md:h-4`} />
                                        Replay
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'preview' ? (
                    <motion.div
                        key="preview-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <div className="flex flex-wrap items-center gap-6 px-2 mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green font-bold text-[10px]">
                                    <Check size={10} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-brand-green font-bold">Verified Asset</p>
                                    <p className="text-[11px] font-bold text-white/40 leading-tight">UI Hub Curated</p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/5" />

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Build Stack</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-bold text-white/60">React 18</span>
                                        <span className="px-2 py-0.5 rounded-md bg-white/[0.03] border border-white/10 text-[10px] font-bold text-white/60">Tailwind CSS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-white/5" />

                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-1">Category</p>
                                <span className="text-[11px] font-bold text-brand-green uppercase tracking-wider">{item.category}</span>
                            </div>
                        </div>

                        {item.imageUrl && (
                            <div className="mb-12">
                                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white px-2 mb-6">Preview Image</h3>
                                <div className="aspect-video w-full glass rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/5 bg-black/40">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <div className="min-h-[220px] sm:min-h-[280px] md:min-h-0 aspect-[4/3] md:aspect-video w-full glass rounded-2xl md:rounded-[3rem] relative overflow-hidden flex items-center justify-center bg-black/20 border border-white/5">
                            <div
                                className={`text-center w-full ${item.category === 'background' || item.category === 'cursor' || item.category === '3d' ? 'h-full' : 'px-2 md:px-8'}`}
                            >
                                <div className={`flex justify-center ${item.category === 'background' || item.category === 'cursor' || item.category === '3d' ? 'h-full w-full' : 'scale-[0.65] sm:scale-75 md:scale-100'}`} key={resetKey}>
                                    {item.preview()}
                                </div>
                            </div>
                        </div>

                        {/* Props Table */}
                        {componentConfig.props.length > 0 && (
                            <section className="space-y-6 md:space-y-8">
                                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white px-2">Props</h3>
                                <div className="rounded-[1.5rem] md:rounded-[2rem] border border-white/10 overflow-hidden bg-[#09090b] p-2 md:p-4 shadow-2xl">
                                    <PropsTable props={componentConfig.props} />
                                </div>
                            </section>
                        )}
                    </motion.div>
                ) : tab === 'code' ? (
                    <motion.div
                        key="code-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-16"
                    >
                        {/* Install Section */}
                        <section>
                            <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white mb-6 md:mb-8">Install</h3>
                            <div className="inline-flex glass p-1.5 rounded-full mb-6 md:mb-8 border border-white/5 bg-black/20">
                                <button
                                    onClick={() => setInstallMethod('cli')}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all border ${installMethod === 'cli' ? 'bg-[#09090b] text-white border-white/20 shadow-lg' : 'bg-transparent text-white/40 border-transparent hover:text-white'}`}
                                >CLI</button>
                                <button
                                    onClick={() => setInstallMethod('manual')}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all border ${installMethod === 'manual' ? 'bg-[#09090b] text-white border-white/20 shadow-lg' : 'bg-transparent text-white/40 border-transparent hover:text-white'}`}
                                >Manual</button>
                            </div>

                            <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#09090b] shadow-2xl">
                                <AnimatePresence mode="wait">
                                    {installMethod === 'manual' && (
                                        <motion.div
                                            key="manual-tabs"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex border-b border-white/5"
                                        >
                                            {(['npm', 'pnpm', 'yarn', 'bun'] as const).map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPkgManager(m)}
                                                    className={`px-8 py-4 text-xs font-bold uppercase tracking-widest relative ${pkgManager === m ? 'text-white' : 'text-white/40 hover:text-white'}`}
                                                >
                                                    {m}
                                                    {pkgManager === m && (
                                                        <motion.div layoutId="pkg-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="p-8 flex items-center justify-between">
                                    <code className="text-brand-green font-mono text-sm">{getInstallCommand(pkgManager, installMethod)}</code>
                                    <button
                                        onClick={() => handleCopy(getInstallCommand(pkgManager, installMethod), 'install')}
                                        className={`flex items-center gap-2 p-3 rounded-xl transition-all ${copied === 'install' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {copied === 'install' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Usage Section */}
                        <section>
                            <h3 className="text-3xl font-display uppercase tracking-tight text-white mb-2">Usage <span className="text-sm font-sans tracking-normal text-white/30 lowercase">(with your settings)</span></h3>
                            <div className="rounded-3xl overflow-hidden border border-white/10 relative bg-[#09090b] shadow-2xl">
                                <button
                                    onClick={() => handleCopy(usageCode, 'usage')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'usage' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'usage' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-6 md:p-8 leading-relaxed overflow-auto custom-scrollbar">
                                    <pre className="font-sans text-xs md:text-sm"><CodeHighlighter code={usageCode} /></pre>
                                </div>
                            </div>
                        </section>

                        {/* Code Section */}
                        <section>
                            <h3 className="text-3xl font-display uppercase tracking-tight text-white mb-8">Code</h3>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <CustomSelect
                                    label="Language"
                                    value={lang}
                                    onChange={setLang}
                                    options={[
                                        { id: 'ts', name: 'TypeScript' },
                                        { id: 'js', name: 'JavaScript' },
                                        { id: 'html', name: 'HTML' }
                                    ]}
                                />

                                <CustomSelect
                                    label="Styling"
                                    value={styling}
                                    onChange={setStyling}
                                    options={[
                                        { id: 'tailwind', name: 'Tailwind' },
                                        { id: 'css', name: 'CSS' }
                                    ]}
                                />
                            </div>

                            <div className="rounded-[2.5rem] overflow-hidden border border-white/10 relative bg-[#09090b] shadow-2xl">
                                <button
                                    onClick={() => handleCopy(getComponentCode(item.id, { lang, styling }), 'source')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'source' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'source' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-6 md:p-8 text-xs leading-relaxed max-h-[600px] overflow-auto custom-scrollbar">
                                    <pre className="font-sans"><code><CodeHighlighter code={getComponentCode(item.id, { lang, styling })} /></code></pre>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <motion.div
                        key="vibe-content"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-12"
                    >
                        {/* Tool Selector */}
                        <section className="space-y-6 md:space-y-10">
                            <h3 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-white/90 px-2 lg:px-4">Select AI Tool</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 lg:px-4">
                                {(['antigravity', 'lovable', 'cursor', 'claude', 'advance'] as const).map(tool => (
                                    <button
                                        key={tool}
                                        onClick={() => setAiSystem(tool)}
                                        className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border transition-all text-left relative overflow-hidden group min-h-[130px] md:min-h-[160px] flex flex-col justify-between ${aiSystem === tool ? 'bg-[#050505] border-brand-green/50 shadow-[0_0_40px_rgba(0,255,0,0.1)] ring-1 ring-brand-green/30' : 'bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/10 hover:scale-[1.01] duration-500'}`}
                                    >
                                        {/* Scanline/Texture Overlay */}
                                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                                        {/* Animated Border for Active Tool */}
                                        {aiSystem === tool && (
                                            <motion.div
                                                layoutId="active-border"
                                                className="absolute inset-0 border border-brand-green/60 z-20 pointer-events-none rounded-[inherit]"
                                                initial={{ opacity: 0 }}
                                                animate={{
                                                    opacity: [0.7, 1, 0.7],
                                                    boxShadow: [
                                                        "0 0 15px rgba(0,255,0,0.1), inset 0 0 10px rgba(0,255,0,0.1)",
                                                        "0 0 35px rgba(0,255,0,0.3), inset 0 0 20px rgba(0,255,0,0.2)",
                                                        "0 0 15px rgba(0,255,0,0.1), inset 0 0 10px rgba(0,255,0,0.1)"
                                                    ]
                                                }}
                                                transition={{
                                                    opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                                                    boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                                                }}
                                            />
                                        )}

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                                            <div className="absolute inset-x-[-150%] top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
                                        </div>

                                        <div className="relative z-10 w-full flex flex-col gap-6">
                                            <div className="flex items-center justify-between">
                                                <p className={`text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-black transition-colors duration-500 ${aiSystem === tool ? 'text-brand-green' : 'text-white/20'}`}>
                                                    {item.id === 'robot-3d-background' ? (
                                                        tool === 'antigravity' ? 'NEON ENGINE' :
                                                            tool === 'lovable' ? 'ROBOTIC HUB' :
                                                                tool === 'cursor' ? 'CYBER CORE' :
                                                                    tool === 'claude' ? 'PHANTOM MODEL' : 'VOID SYSTEM'
                                                    ) : (
                                                        tool === 'antigravity' ? 'VIBE ENGINE' :
                                                            tool === 'lovable' ? 'PLATFORM HUB' :
                                                                tool === 'cursor' ? 'SMART LDE' :
                                                                    tool === 'claude' ? 'INTELLIGENT MODEL' : 'ADVANCED SYSTEM'
                                                    )}
                                                </p>
                                                <div className={`transition-all duration-700 ease-out ${aiSystem === tool ? 'text-brand-green scale-110' : 'text-white/10 group-hover:text-white/30'}`}>
                                                    {tool === 'antigravity' ? (
                                                        <Zap size={20} className="md:w-6 md:h-6" />
                                                    ) : tool === 'lovable' ? (
                                                        <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                        </svg>
                                                    ) : tool === 'cursor' ? (
                                                        <div className="relative w-5 h-5 md:w-6 md:h-6">
                                                            <div className="absolute inset-0 border-2 border-current rounded-sm flex items-center justify-center">
                                                                <div className="w-1.5 h-1.5 border-r border-b border-current" />
                                                            </div>
                                                            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#0A0A0A] flex items-center justify-center">
                                                                <div className="text-[10px] font-bold">+</div>
                                                            </div>
                                                        </div>
                                                    ) : tool === 'claude' ? (
                                                        <Cpu size={20} className="md:w-6 md:h-6" />
                                                    ) : (
                                                        <Brain size={20} className="md:w-6 md:h-6" />
                                                    )}
                                                </div>
                                            </div>

                                            <h4 className={`text-lg md:text-xl lg:text-2xl font-display uppercase tracking-[-0.05em] transition-all duration-500 leading-none whitespace-nowrap ${aiSystem === tool ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                                                {tool}
                                            </h4>
                                        </div>

                                        <div className={`flex items-center gap-2 mt-4 transition-all duration-700 ${aiSystem === tool ? 'opacity-100' : 'opacity-0 translate-y-1'}`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.6)]" />
                                            <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/90">Active</span>
                                        </div>

                                        {aiSystem === tool && (
                                            <motion.div
                                                layoutId="active-tool-glow"
                                                className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.08] via-transparent to-transparent pointer-events-none"
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Vibe Prompt Section - AI Terminal UI */}
                        <section className="space-y-6 md:space-y-8">
                            <div className="flex items-end justify-between px-2">
                                <div className="space-y-1">
                                    <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white">Vibe Prompt</h3>
                                    <p className="text-[10px] uppercase tracking-[0.3em] text-brand-green/50 font-black">AI Generation Blueprint</p>
                                </div>
                            </div>

                            <div className="relative group/terminal">
                                {/* Terminal Container */}
                                <div className="glass rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-white/10 relative bg-[#050505]/80 backdrop-blur-3xl shadow-2xl">
                                    {/* Scanline/Texture Overlay */}
                                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay z-10" />

                                    {/* Terminal Header / Toolbar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/[0.02] relative z-20 gap-3 sm:gap-0">

                                        <div className="flex items-center justify-between w-full sm:w-auto">
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                {/* OS Dots */}
                                                <div className="flex gap-1.5">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
                                                </div>
                                                <div className="h-4 w-px bg-white/10 mx-1 sm:mx-2" />
                                                {/* System Path/Label — hide verbose path on mobile */}
                                                <div className="hidden sm:flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">{aiSystem}</span>
                                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">//</span>
                                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">engine_output.log</span>
                                                </div>
                                                {/* On mobile: just show the AI system name */}
                                                <span className="sm:hidden text-[9px] font-black text-brand-green uppercase tracking-widest">{aiSystem}</span>
                                            </div>

                                            {/* Mobile Copy Button */}
                                            <div className="relative group/copybtn sm:hidden">
                                                {/* Glow aura */}
                                                <div className={`absolute -inset-[1px] rounded-lg blur-sm transition-all duration-300 ${copied === 'vibe' ? 'bg-[#00FF00]/60' : 'bg-[#00FF00]/0'}`} />
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(fullVibePrompt);
                                                        setCopied('vibe');
                                                        setTimeout(() => setCopied(null), 2000);
                                                    }}
                                                    className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all duration-200 ${copied === 'vibe'
                                                        ? 'bg-[#00FF00] text-black border border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.4)]'
                                                        : 'bg-black/60 border border-[#00FF00]/30 text-[#00FF00]/70 active:bg-[#00FF00]/10'
                                                        }`}
                                                >
                                                    {copied === 'vibe' ? <Check size={10} strokeWidth={2.5} /> : <Copy size={10} />}
                                                    <span>{copied === 'vibe' ? 'Saved' : 'Copy'}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Center Label - Made with love - properly flows on mobile, absolute center on desktop */}
                                        <div className="flex justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 items-center gap-1 pointer-events-none">
                                            <span className="text-[8px] font-black uppercase tracking-[0.15em] sm:tracking-widest animate-terminal-purple-blink-delay whitespace-nowrap text-white/50 sm:text-white">Made with ❤️ by Jainil Patel</span>
                                        </div>

                                        {/* Desktop Copy Button */}
                                        <div className="relative group/copybtn hidden sm:block">
                                            {/* Glow aura */}
                                            <div className={`absolute -inset-[1px] rounded-lg blur-sm transition-all duration-300 ${copied === 'vibe' ? 'bg-[#00FF00]/60' : 'bg-[#00FF00]/0 group-hover/copybtn:bg-[#00FF00]/20'}`} />
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(fullVibePrompt);
                                                    setCopied('vibe');
                                                    setTimeout(() => setCopied(null), 2000);
                                                }}
                                                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${copied === 'vibe'
                                                    ? 'bg-[#00FF00] text-black border border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.4)]'
                                                    : 'bg-black/60 border border-[#00FF00]/30 text-[#00FF00]/70 hover:text-[#00FF00] hover:border-[#00FF00]/70 hover:bg-[#00FF00]/5 hover:shadow-[0_0_12px_rgba(0,255,0,0.15)]'
                                                    }`}
                                            >
                                                {copied === 'vibe' ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                                                <span>{copied === 'vibe' ? 'Saved to Buffer' : 'Copy Blueprint'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Terminal Content */}
                                    <div className="p-6 md:p-10 text-[10px] md:text-sm leading-relaxed max-h-[500px] md:max-h-[700px] overflow-auto custom-scrollbar relative z-20">
                                        <pre className="font-mono whitespace-pre-wrap"><CodeHighlighter code={fullVibePrompt} /></pre>
                                    </div>

                                    {/* Bottom Status Bar */}
                                    <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between relative z-20">
                                        {/* Left */}
                                        <div className="flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-brand-green animate-pulse" />
                                            <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">Terminal Active</span>
                                        </div>

                                        {/* Center - UI HUB */}
                                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                            <img src="/logo.png" alt="UI HUB" className="w-3 h-3 object-contain opacity-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                            <span className="text-[8px] uppercase tracking-widest font-bold animate-terminal-green-blink">UI HUB</span>
                                        </div>

                                        {/* Right */}
                                        <span className="text-[8px] uppercase tracking-widest text-white/10 font-bold">UTF-8 // LN: {fullVibePrompt.split('\n').length}</span>
                                    </div>
                                </div>

                                {/* Decorative Background Glow */}
                                <div className="absolute -inset-4 bg-brand-green/5 blur-3xl rounded-[4rem] group-hover/terminal:bg-brand-green/10 transition-colors duration-1000 -z-10" />
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>

            <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Save to Vault"
                description="Sign in to your account to save this elite component to your personal collection."
            />
        </motion.div>
    );
};

export default ComponentDetail;
