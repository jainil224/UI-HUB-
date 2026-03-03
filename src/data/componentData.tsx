import React from 'react';
import * as Animations from '../components/animations/TextAnimations';
import * as VisualEffects from '../components/animations/VisualEffects';

export type ComponentItem = {
    id: string;
    title: string;
    category: "text" | "effect" | "background";
    preview: React.ReactNode;
    code: string;
    vibePrompt: string;
};

// Simplified component resolver based on existing logic
const renderComponent = (id: string, name: string) => {
    const rawName = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    const CompName = id.endsWith('-text') ? rawName : `${rawName}Text`;

    const Comp = (Animations as any)[CompName] ||
        (VisualEffects as any)[rawName] ||
        (Animations as any)[rawName] ||
        (VisualEffects as any)[CompName];

    return Comp ? React.createElement(Comp) : <div className="text-6xl md:text-9xl font-display font-bold uppercase tracking-normal opacity-20">PREVIEW</div>;
};

// Assuming these prompts apply as they were defined in VibeMeta
export const componentList: ComponentItem[] = [
    {
        id: "blur-text",
        title: "Blur In Text",
        category: "text",
        preview: renderComponent("blur-text", "Blur In Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const BlurText = ({ text = "BLUR IN TEXT" }) => (\n  <motion.h1\n    initial={{ opacity: 0, filter: "blur(10px)" }}\n    animate={{ opacity: 1, filter: "blur(0px)" }}\n    transition={{ duration: 0.8 }}\n  >\n    {text}\n  </motion.h1>\n);`,
        vibePrompt: "Create a smooth animated blur text effect using CSS and React. Text should fade in with blur filter transition. Use modern dark UI style."
    },
    {
        id: "fade-text",
        title: "Fade Text",
        category: "text",
        preview: renderComponent("fade-text", "Fade Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FadeText = ({ text = "FADE TEXT" }) => (\n  <motion.div\n    initial={{ opacity: 0 }}\n    animate={{ opacity: 1 }}\n    transition={{ duration: 1.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: "Create a simple opacity fade animation for text transitions using Framer Motion and React."
    },
    {
        id: "dock-text",
        title: "Dock Text",
        category: "text",
        preview: renderComponent("dock-text", "Dock Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const DockText = ({ text = "DOCK TEXT" }) => (\n  <motion.div\n    whileHover={{ scale: 1.5 }}\n    transition={{ type: "spring", duration: 0.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: "Create a fisheye scale effect on text characters based on hover/proximity using framer-motion in React."
    },
    {
        id: "font-weight",
        title: "Font Weight Text",
        category: "text",
        preview: renderComponent("font-weight", "Font Weight Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FontWeightText = ({ text = "VARIABLE WEIGHT" }) => (\n  <motion.div\n    animate={{ fontWeight: [400, 900, 400] }}\n    transition={{ duration: 1, repeat: Infinity }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: "Animate font-weight smoothly between 400 and 900 for text using framer motion and variable fonts."
    },
    {
        id: "noise",
        title: "Noise Background",
        category: "effect",
        preview: renderComponent("noise", "Noise Background"),
        code: `export const Noise = () => (\n  <div className="absolute inset-0 z-50 pointer-events-none opacity-[0.05] mix-blend-overlay">\n    <svg className="absolute inset-0 w-full h-full">\n      <filter id="noise">\n        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />\n      </filter>\n      <rect width="100%" height="100%" filter="url(#noise)" />\n    </svg>\n  </div>\n);`,
        vibePrompt: "Create a cinematic digital noise grain overlay effect using SVG turbulence and CSS mix-blend-mode."
    },
    {
        id: "gradual-spacing",
        title: "Gradual Spacing",
        category: "text",
        preview: renderComponent("gradual-spacing", "Gradual Spacing"),
        code: `import { motion } from 'framer-motion';\n\nexport const GradualSpacing = ({ text = "GRADUAL SPACING" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ letterSpacing: "-0.5em", opacity: 0 }}\n        animate={{ letterSpacing: "normal", opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Increase letter-spacing gradually for each character in a staggered sequence."
    },
    {
        id: "letter-pull-up",
        title: "Letter Pull Up",
        category: "text",
        preview: renderComponent("letter-pull-up", "Letter Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const LetterPullUp = ({ text = "LETTER PULL UP" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Characters slide up from below the baseline into their final position with a staggered offset."
    },
    {
        id: "multi-direction-slide",
        title: "Multi Direction Slide",
        category: "text",
        preview: renderComponent("multi-direction-slide", "Multi Direction Slide"),
        code: `import { motion } from 'framer-motion';\n\nexport const MultiDirectionSlide = ({ text = "MULTI DIRECTION" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: i % 2 === 0 ? -50 : 50, y: i % 2 !== 0 ? -50 : 50, opacity: 0 }}\n        animate={{ x: 0, y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Text elements slide into view from multiple directions (left, right, top, bottom) simultaneously."
    },
    {
        id: "scale-letter",
        title: "Scale Letter",
        category: "text",
        preview: renderComponent("scale-letter", "Scale Letter"),
        code: `import { motion } from 'framer-motion';\n\nexport const ScaleLetter = ({ text = "SCALE LETTER" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ scale: 0, opacity: 0 }}\n        animate={{ scale: 1, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Scale each character from zero to its natural size with a spring or ease-out effect."
    },
    {
        id: "separate-away",
        title: "Separate Away",
        category: "text",
        preview: renderComponent("separate-away", "Separate Away"),
        code: `import { motion } from 'framer-motion';\n\nexport const SeparateAway = ({ text = "SEPARATE AWAY" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: 0 }}\n        animate={{ x: i < text.length / 2 ? -15 : 15 }}\n        transition={{ duration: 0.5 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Characters move away from each other along the X-axis upon interaction or mount."
    },
    {
        id: "wavy-text",
        title: "Wavy Text",
        category: "text",
        preview: renderComponent("wavy-text", "Wavy Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const WavyText = ({ text = "WAVY TEXT" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        animate={{ y: [0, -8, 0] }}\n        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Continuous vertical wave motion applied to characters using a periodic sine function."
    },
    {
        id: "word-pull-up",
        title: "Word Pull Up",
        category: "text",
        preview: renderComponent("word-pull-up", "Word Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const WordPullUp = ({ text = "WORD PULL UP" }) => (\n  <div className="flex gap-2 overflow-hidden">\n    {text.split(' ').map((word, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.2 }}\n      >\n        {word}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: "Full words slide up from below the baseline with opacity fade-in."
    },
    {
        id: "liquid-glass",
        title: "Liquid Glass",
        category: "effect",
        preview: renderComponent("liquid-glass", "Liquid Glass"),
        code: `export const LiquidGlass = () => (\n  <div className="w-64 h-64 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>\n);`,
        vibePrompt: "Premium weather dashboard interface utilizing multiple layers of glassmorphism, backdrop-blur, and Lucide icons."
    },
    {
        id: "blur-vignette",
        title: "Blur Vignette",
        category: "effect",
        preview: renderComponent("blur-vignette", "Blur Vignette"),
        code: `export const BlurVignette = () => (\n  <div className="w-full h-full absolute inset-0 backdrop-blur-[10px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)] pointer-events-none"></div>\n);`,
        vibePrompt: "Radial mask that applies a heavy blur to the edges, focusing visual attention on the center."
    },
    {
        id: "liquid-gradient",
        title: "Liquid Gradient",
        category: "effect",
        preview: renderComponent("liquid-gradient", "Liquid Gradient"),
        code: `export const LiquidGradient = () => (\n  <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,0,0.2),_transparent_50%)] animate-pulse"></div>\n);`,
        vibePrompt: "Morphing radial gradients that shift smoothly to create a fluid, organic light effect."
    },
    {
        id: "spotlight-cards",
        title: "Spotlight Cards",
        category: "effect",
        preview: renderComponent("spotlight-cards", "Spotlight Cards"),
        code: `export const SpotlightCards = () => (\n  <div className="grid grid-cols-3 gap-4">\n    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">Card 1</div>\n    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">Card 2</div>\n    <div className="p-6 rounded-xl bg-white/5 border border-white/10 hover:border-green-500/50 transition-colors">Card 3</div>\n  </div>\n);`,
        vibePrompt: "Premium 3-card layout with individual color themes, Lucide icons, and a synchronized cursor-glow system with branding."
    },
    {
        id: "image-reveal",
        title: "Image Reveal",
        category: "effect",
        preview: renderComponent("image-reveal", "Image Reveal"),
        code: `import { motion } from 'framer-motion';\n\nexport const ImageReveal = () => (\n  <motion.div\n    whileHover={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}\n    initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}\n    className="w-full h-full bg-cover bg-center"\n    style={{ backgroundImage: "url('/placeholder.jpg')" }}\n  />\n);`,
        vibePrompt: "Reveals content behind a mask using a sliding or clip-path transition on hover."
    },
    {
        id: "blocks",
        title: "Blocks",
        category: "effect",
        preview: renderComponent("blocks", "Blocks"),
        code: `import { motion } from 'framer-motion';\n\nexport const Blocks = () => (\n  <div className="grid grid-cols-4 grid-rows-4 gap-1 w-64 h-64">\n    {Array.from({ length: 16 }).map((_, i) => (\n      <motion.div key={i} className="bg-white/10 rounded-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} />\n    ))}\n  </div>\n);`,
        vibePrompt: "Staggered grid of blocks that fade or scale into view, responding to hover states."
    },
    {
        id: "animated-beam",
        title: "Animated Beam",
        category: "effect",
        preview: renderComponent("animated-beam", "Animated Beam"),
        code: `import { motion } from 'framer-motion';\n\nexport const AnimatedBeam = () => (\n  <motion.div\n    animate={{ x: [-100, 300] }}\n    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}\n    className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent w-32"\n  />\n);`,
        vibePrompt: "High-speed linear light beam that sweeps across the container in a rhythmic loop."
    },
    {
        id: "grid-background",
        title: "Grid Background",
        category: "background",
        preview: renderComponent("grid-background", "Grid Background"),
        code: `export const GridBackground = () => (\n  <div className="w-full h-full absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>\n);`,
        vibePrompt: "Generate an animated grid background effect with a radial gradient mask."
    },
    {
        id: "hacker-background",
        title: "Hacker Background",
        category: "background",
        preview: renderComponent("hacker-background", "Hacker Background"),
        code: `// Implementation for Hacker Background\nexport const HackerBackground = () => (\n  <div className="w-full h-full bg-black text-green-500 font-mono flex items-center justify-center">\n    01010101 MATRIX 10101010\n  </div>\n);`,
        vibePrompt: "Create a digital rain matrix hacker background effect using HTML Canvas and requestAnimationFrame in React."
    },
    {
        id: "novatrix-background",
        title: "Novatrix Background",
        category: "background",
        preview: renderComponent("novatrix-background", "Novatrix Background"),
        code: `// Implementation for Novatrix Background\nexport const NovatrixBackground = () => (\n  <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-purple-900 flex items-center justify-center animate-pulse">\n    NOVATRIX NEBULA\n  </div>\n);`,
        vibePrompt: "Create a deep space nebula animated background using WebGL or layered CSS gradients with slow rotation effect."
    },
    {
        id: "beam-grid-background",
        title: "Beam Grid Background",
        category: "background",
        preview: renderComponent("beam-grid-background", "Beam Grid Background"),
        code: `// ... Beam Grid Background code is quite large, see the repo ...\nimport BeamGridBackground from '@/components/ui/BeamGridBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px]">\n    <BeamGridBackground\n      className="bg-black"\n      gridColor="rgba(255,255,255,0.05)"\n      darkGridColor="rgba(255,255,255,0.05)"\n    />\n  </div>\n);`,
        vibePrompt: "Create a premium Beam grid background that has dynamic light beams traversing a grid with glow."
    },
    {
        id: "fall-beam-background",
        title: "Fall Beam Background",
        category: "background",
        preview: renderComponent("fall-beam-background", "Fall Beam Background"),
        code: `import FallBeamBackground from '@/components/ui/FallBeamBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <FallBeamBackground\n      className="bg-transparent"\n      lineCount={30}\n      beamColorClass="cyan-400"\n    />\n  </div>\n);`,
        vibePrompt: "Create a premium Matrix-style glowing vertical falling beams animation."
    },
    {
        id: "hell-background",
        title: "Hell Background",
        category: "background",
        preview: renderComponent("hell-background", "Hell Background"),
        code: `import HellBackground from '@/components/ui/HellBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <HellBackground color="#DE443B" backdropBlurAmount="none" />\n  </div>\n);`,
        vibePrompt: "Create a WebGL background effect that simulates a chaotic inferno or hellish environment using GLSL shaders."
    },
    {
        id: "interactive-grid-background",
        title: "Interactive Grid Background",
        category: "background",
        preview: renderComponent("interactive-grid-background", "Interactive Grid Background"),
        code: `import InteractiveGridBackground from '@/components/ui/InteractiveGridBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <InteractiveGridBackground\n      className="bg-black"\n      gridColor="rgba(255,255,255,0.05)"\n      darkGridColor="rgba(255,255,255,0.05)"\n      effectColor="rgba(0,255,0,0.5)"\n      darkEffectColor="rgba(0,255,0,0.5)"\n    />\n  </div>\n);`,
        vibePrompt: "Create a premium glowing interactive grid background with trailing effect when hovered or idle."
    },
    {
        id: "particles-background",
        title: "Particles Background",
        category: "background",
        preview: renderComponent("particles-background", "Particles Background"),
        code: `import ParticlesBackground from '@/components/ui/ParticlesBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <ParticlesBackground colors={['#ff223e', '#5d1eb2', '#ff7300']} size={3} />\n  </div>\n);`,
        vibePrompt: "Create an interactive particles animation background with glowing particles that move dynamically."
    },
    {
        id: "wave-background",
        title: "Wave Background",
        category: "background",
        preview: renderComponent("wave-background", "Wave Background"),
        code: `import WaveBackground from '@/components/ui/WaveBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <WaveBackground />\n  </div>\n);`,
        vibePrompt: "Create a WebGL wave background effect."
    },
    {
        id: "lines-background",
        title: "Lines Background",
        category: "background",
        preview: renderComponent("lines-background", "Lines Background"),
        code: `import { BackgroundPaths } from '@/components/ui/background-paths';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <BackgroundPaths title="UI HUB" />\n  </div>\n);`,
        vibePrompt: "Create an animated background with SVG paths flowing smoothly behind text."
    }
];
