import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft, RotateCcw, Eye, Code,
    Check, Copy, Zap, ChevronDown, Brain
} from 'lucide-react';
import CodeHighlighter from '../../../../components/ui/CodeHighlighter';
import * as Animations from '../../../../components/animations/TextAnimations';
import * as VisualEffects from '../../../../components/animations/VisualEffects';
import { getComponentCode } from '../../../../utils/codeUtils';
import { generateVibePrompt, AISystem, VibeMeta } from '../../../../utils/promptUtils';

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
            cssProperties: ["filter", "opacity", "transition"]
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
            cssProperties: ["transform", "transition-timing-function"]
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
            cssProperties: ["opacity", "transition"]
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
            cssProperties: ["font-weight", "font-variation-settings"]
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
            cssProperties: ["letter-spacing", "opacity", "transition"]
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
            cssProperties: ["transform", "opacity", "transition"]
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
            cssProperties: ["transform", "opacity", "transition"]
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
            cssProperties: ["transform", "opacity", "transition"]
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
            cssProperties: ["transform", "transition"]
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
            cssProperties: ["transform", "transition"]
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
            cssProperties: ["transform", "opacity", "transition"]
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
            cssProperties: ["backdrop-filter", "background", "border", "grid-layout"]
        }
    },
    "noise": {
        props: [
            { name: "opacity", type: "number", default: "0.05", description: "Visibility of the noise grain" }
        ],
        vibeMeta: {
            behavior: "Subtle animated grain effect using SVG turbulence for a cinematic digital aesthetic.",
            states: { from: "static", to: "animated turbulence overlay" },
            cssProperties: ["filter", "mix-blend-mode", "opacity"]
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
            cssProperties: ["backdrop-filter", "mask-image", "WebkitMaskImage"]
        }
    },
    "liquid-gradient": {
        props: [
            { name: "color", type: "string", default: '"#00FF00"', description: "Primary glow color" }
        ],
        vibeMeta: {
            behavior: "Morphing radial gradients that shift smoothly to create a fluid, organic light effect.",
            states: { from: "static gradient", to: "shifting radial-gradient loop" },
            cssProperties: ["background", "transform", "transition"]
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
            cssProperties: ["mask-image", "background", "backdrop-filter"]
        }
    },
    "image-reveal": {
        props: [
            { name: "duration", type: "number", default: "0.5", description: "Reveal speed" }
        ],
        vibeMeta: {
            behavior: "Reveals content behind a mask using a sliding or clip-path transition on hover.",
            states: { from: "clipped/hidden", to: "full polygon reveal" },
            cssProperties: ["clip-path", "transform", "transition"]
        }
    },
    "blocks": {
        props: [
            { name: "count", type: "number", default: "16", description: "Number of blocks in the grid" }
        ],
        vibeMeta: {
            behavior: "Staggered grid of blocks that fade or scale into view, responding to hover states.",
            states: { from: "empty grid", to: "staggered block appear" },
            cssProperties: ["display: grid", "scale", "opacity"]
        }
    },
    "animated-beam": {
        props: [
            { name: "speed", type: "number", default: "2", description: "Seconds per loop" }
        ],
        vibeMeta: {
            behavior: "High-speed linear light beam that sweeps across the container in a rhythmic loop.",
            states: { from: "off-screen", to: "infinite linear sweep" },
            cssProperties: ["background-image", "transform", "animation"]
        }
    },
    "grid-background": {
        props: [
            { name: "color", type: "string", default: '"#00FF00"', description: "Grid line color" }
        ],
        vibeMeta: {
            behavior: "A subtle animated grid background with a radial gradient mask.",
            states: { from: "static grid", to: "animated moving grid lines" },
            cssProperties: ["background-image", "mask-image", "animation"]
        }
    },
    "hacker-background": {
        props: [],
        vibeMeta: {
            behavior: "A matrix-style digital rain background using HTML Canvas.",
            states: { from: "black", to: "animated green rain" },
            cssProperties: ["canvas", "font-family: mono"]
        }
    },
    "novatrix-background": {
        props: [],
        vibeMeta: {
            behavior: "A deep space nebula effect using slow-moving gradients and pulse animations.",
            states: { from: "static gradient", to: "pulsing nebula" },
            cssProperties: ["background-image", "animation: pulse"]
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
            cssProperties: ["mask-image", "background-image"]
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
            cssProperties: ["animation: fall", "background: linear-gradient"]
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
            cssProperties: ["gl_FragColor", "canvas", "backdrop-filter"]
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
            cssProperties: ["canvas", "shadowBlur", "fillRect"]
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
            cssProperties: ["canvas", "filter: blur", "svg: feGaussianBlur"]
        }
    },
    "wave-background": {
        props: [
            { name: "backdropBlurAmount", type: "BlurSize", default: '"sm"', description: "Blur intensity on top" }
        ],
        vibeMeta: {
            behavior: "Flowing WebGL waves using multi-sine GLSL distortion.",
            states: { from: "flat color", to: "moving color waves" },
            cssProperties: ["sin()", "gl_FragCoord", "canvas"]
        }
    },
    "lines-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Smooth SVG path flow animation creating a dynamic liquid-like background.",
            states: { from: "static paths", to: "flowing paths" },
            cssProperties: ["svg", "path", "animation"]
        }
    },
    "sparkles-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Twinkling starfield/sparkles using high-performance particles.",
            states: { from: "dark sky", to: "twinkling sparkles" },
            cssProperties: ["canvas", "particle-system", "opacity-flicker"]
        }
    },
    "isometric-grid-background": {
        props: [
            { name: "title", type: "string", default: '""', description: "Optional title to display" }
        ],
        vibeMeta: {
            behavior: "Skewed isometric grid that illuminates random cells on hover.",
            states: { from: "flat grid", to: "illuminated isometric grid" },
            cssProperties: ["transform: skew", "grid-layout", "glow"]
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
                <h2 className="text-4xl md:text-8xl font-display uppercase tracking-tighter text-white mb-8">
                    {item.title}
                </h2>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setTab('preview')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'preview' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                        >
                            <Eye size={14} className="md:w-4 md:h-4" />
                            Preview
                        </button>
                        <button
                            onClick={() => setTab('code')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'code' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'}`}
                        >
                            <Code size={14} className="md:w-4 md:h-4" />
                            Code
                        </button>
                        <button
                            onClick={() => setTab('vibe')}
                            className={`flex items-center gap-2 px-6 md:px-8 py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'vibe' ? 'bg-brand-green text-black border border-brand-green shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'bg-brand-green/10 text-brand-green border border-brand-green/30 hover:bg-brand-green/20 hover:border-brand-green/60 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]'}`}
                        >
                            <Zap size={14} className={`${tab === 'vibe' ? 'fill-black' : ''} md:w-4 md:h-4`} />
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

            <AnimatePresence mode="wait">
                {tab === 'preview' ? (
                    <motion.div
                        key="preview-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <div className="aspect-[4/3] md:aspect-video w-full glass rounded-[2rem] md:rounded-[3rem] relative overflow-hidden flex items-center justify-center group bg-black/20 border border-white/5">
                            <div className={`text-center w-full ${item.category === 'background' ? 'h-full' : 'px-4 md:px-8'}`}>
                                <div className={`flex justify-center ${item.category === 'background' ? 'h-full w-full' : 'scale-75 md:scale-100'}`} key={resetKey}>
                                    {item.preview}
                                </div>
                            </div>
                        </div>

                        {/* Props Table */}
                        {componentConfig.props.length > 0 && (
                            <section className="space-y-6 md:space-y-8">
                                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white px-2">Props</h3>
                                <div className="glass rounded-[1.5rem] md:rounded-[2rem] border border-white/5 overflow-hidden bg-black/20 p-2 md:p-4">
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
                            <div className="flex flex-wrap gap-2 md:gap-4 mb-6 md:mb-8">
                                <button
                                    onClick={() => setInstallMethod('cli')}
                                    className={`px-5 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all ${installMethod === 'cli' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white'}`}
                                >CLI</button>
                                <button
                                    onClick={() => setInstallMethod('manual')}
                                    className={`px-5 md:px-6 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest border transition-all ${installMethod === 'manual' ? 'bg-white/10 border-white/20 text-white' : 'border-white/5 text-white/40 hover:text-white'}`}
                                >Manual</button>
                            </div>

                            <div className="glass rounded-2xl md:rounded-3xl overflow-hidden border border-white/5 bg-black/20">
                                <AnimatePresence mode="wait">
                                    {installMethod === 'manual' && (
                                        <motion.div
                                            key="manual-tabs"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex border-b border-white/5 bg-black/20"
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
                                <div className="p-8 flex items-center justify-between bg-black/40">
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
                            <div className="glass rounded-3xl overflow-hidden border border-white/5 relative bg-black/40">
                                <button
                                    onClick={() => handleCopy(usageCode, 'usage')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'usage' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'usage' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-8 leading-relaxed overflow-auto">
                                    <pre className="font-sans"><CodeHighlighter code={usageCode} /></pre>
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

                            <div className="glass rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-black/40">
                                <button
                                    onClick={() => handleCopy(getComponentCode(item.id, { lang, styling }), 'source')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'source' ? 'bg-brand-green/20 text-brand-green' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                                >
                                    {copied === 'source' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-8 text-xs leading-relaxed max-h-[600px] overflow-auto">
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
                        <section className="space-y-6 md:space-y-8">
                            <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white px-2">Select AI Tool</h3>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {(['antigravity', 'lovable', 'cursor', 'advance'] as const).map(tool => (
                                    <button
                                        key={tool}
                                        onClick={() => setAiSystem(tool)}
                                        className={`p-4 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all text-left relative overflow-hidden group h-[140px] md:h-[180px] flex flex-col justify-between ${aiSystem === tool ? 'bg-brand-green/10 border-brand-green/30 shadow-[0_0_30px_rgba(0,255,0,0.1)]' : 'bg-white/5 border-white/10 hover:border-brand-green/30 hover:shadow-[0_0_30px_rgba(0,255,0,0.1)] hover:scale-[1.03] duration-300'}`}
                                    >
                                        <div className="relative z-10 w-full">
                                            <div className="flex items-center justify-between mb-2 md:mb-4">
                                                <p className={`text-[8px] md:text-[10px] uppercase tracking-widest font-bold ${aiSystem === tool ? 'text-brand-green' : 'text-white/40'}`}>
                                                    {tool === 'antigravity' ? 'UI Hub' : tool === 'lovable' ? 'Platform' : tool === 'cursor' ? 'IDE' : 'SYSTEM'}
                                                </p>
                                                <div className={`transition-all duration-300 ${aiSystem === tool ? 'text-brand-green scale-110' : 'text-white/20 group-hover:text-brand-green'}`}>
                                                    {tool === 'antigravity' ? (
                                                        <Zap size={18} className="md:w-6 md:h-6" />
                                                    ) : tool === 'lovable' ? (
                                                        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                        </svg>
                                                    ) : tool === 'cursor' ? (
                                                        <svg className="w-4 h-4 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M13 3l-2 3H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5l2-3H13z" />
                                                            <path d="M11 11v4M9 13h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                    ) : (
                                                        <Brain size={18} className="md:w-6 md:h-6" />
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="text-sm md:text-2xl font-display uppercase tracking-tight text-white w-full pr-2">
                                                {tool === 'advance' ? 'Advance' : tool.charAt(0).toUpperCase() + tool.slice(1)}
                                            </h4>
                                        </div>
                                        {aiSystem === tool && (
                                            <motion.div layoutId="tool-glow" className="absolute inset-0 bg-brand-green/2 blur-2xl pointer-events-none" />
                                        )}
                                        <div className={`mt-auto flex items-center gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest transition-all duration-500 ${aiSystem === tool ? 'text-brand-green opacity-100' : 'text-brand-green opacity-0 group-hover:opacity-100'}`}>
                                            <div className={`w-1 h-1 rounded-full ${aiSystem === tool ? 'bg-brand-green animate-pulse' : 'bg-brand-green'}`} />
                                            {tool === 'advance' ? 'Pro' : 'Active'}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Prompt Display */}
                        <section className="space-y-6 md:space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-white">Vibe Prompt</h3>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(fullVibePrompt);
                                        setCopied('vibe');
                                        setTimeout(() => setCopied(null), 2000);
                                    }}
                                    className={`flex items-center justify-center gap-3 px-6 md:px-8 py-3 rounded-xl transition-all text-[10px] md:text-sm font-bold uppercase tracking-widest ${copied === 'vibe' ? 'bg-brand-green text-black' : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'}`}
                                >
                                    {copied === 'vibe' ? <Check size={18} /> : <Copy size={18} />}
                                    {copied === 'vibe' ? 'Copied!' : 'Copy Prompt'}
                                </button>
                            </div>
                            <div className="glass rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 relative bg-black/40">
                                <div className="p-6 md:p-8 text-[10px] md:text-xs leading-relaxed max-h-[400px] md:max-h-[600px] overflow-auto">
                                    <pre className="font-sans whitespace-pre-wrap"><CodeHighlighter code={fullVibePrompt} /></pre>
                                </div>
                            </div>
                        </section>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ComponentDetail;
