import React, { useRef, useCallback } from 'react';
import * as Animations from '../components/animations/TextAnimations';
import * as VisualEffects from '../components/animations/VisualEffects';
import { AuroraCursor } from '../components/ui/AuroraCursor';

// ── stable star positions (deterministic, no per-render Math.random) ─────────
const AURORA_DOTS = Array.from({ length: 40 }, (_, i) => ({
    top: ((i * 73 + 17) % 97).toFixed(1),
    left: ((i * 53 + 31) % 97).toFixed(1),
    size: i % 4 === 0 ? 3 : 2,
    opacity: i % 5 === 0 ? 0.28 : 0.10,
    dur: 3 + (i % 4),
    delay: (i * 0.27) % 3,
}));

// ── Aurora Cursor scoped preview (blob tracks mouse inside card) ────────────
const AuroraCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -999, y: -999 });
    const target = useRef({ x: -999, y: -999 });
    const vel = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>(0);
    const BLOB_SIZE = 160;
    const HALF = BLOB_SIZE / 2;

    const animate = useCallback(() => {
        vel.current.x += (target.current.x - pos.current.x) * 0.07;
        vel.current.y += (target.current.y - pos.current.y) * 0.07;
        vel.current.x *= 0.80;
        vel.current.y *= 0.80;
        pos.current.x += vel.current.x;
        pos.current.y += vel.current.y;
        if (blobRef.current) {
            blobRef.current.style.transform =
                `translate(${pos.current.x - HALF}px, ${pos.current.y - HALF}px)`;
        }
        rafId.current = requestAnimationFrame(animate);
    }, [HALF]);

    const onEnter = useCallback(() => { rafId.current = requestAnimationFrame(animate); }, [animate]);
    const onLeave = useCallback(() => { cancelAnimationFrame(rafId.current); }, []);
    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={onMove}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: 'radial-gradient(ellipse at 50% 55%, #080618 0%, #020208 100%)',
                overflow: 'hidden',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <style>{`
                @keyframes ac-shift  { 0%{background-position:0% 50%}  50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes ac-morph  {
                    0%  {border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
                    25% {border-radius:40% 60% 70% 30%/40% 70% 30% 60%}
                    50% {border-radius:50% 50% 40% 60%/30% 60% 40% 70%}
                    75% {border-radius:30% 70% 60% 40%/70% 40% 60% 30%}
                    100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
                }
                @keyframes ac-pulse   { 0%,100%{opacity:.60} 50%{opacity:.90} }
                @keyframes ac-twinkle { 0%,100%{opacity:.06} 50%{opacity:.30} }
            `}</style>

            {/* ── Aurora blob ── */}
            <div ref={blobRef} style={{
                position: 'absolute', top: 0, left: 0,
                width: BLOB_SIZE, height: BLOB_SIZE,
                pointerEvents: 'none', willChange: 'transform',
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    background: [
                        'radial-gradient(circle at 30% 30%,rgba(139,92,246,.95) 0%,transparent 55%)',
                        'radial-gradient(circle at 70% 60%,rgba(6,182,212,.90)  0%,transparent 55%)',
                        'radial-gradient(circle at 50% 80%,rgba(236,72,153,.80) 0%,transparent 50%)',
                        'radial-gradient(circle at 20% 70%,rgba(99,102,241,.85) 0%,transparent 50%)',
                        'radial-gradient(circle at 80% 20%,rgba(34,211,238,.70) 0%,transparent 50%)',
                    ].join(','),
                    backgroundSize: '400% 400%',
                    filter: `blur(${BLOB_SIZE * 0.24}px)`,
                    mixBlendMode: 'screen',
                    animation: 'ac-shift 8s ease infinite, ac-morph 12s ease-in-out infinite, ac-pulse 4s ease-in-out infinite',
                }} />
            </div>

            {/* ── Star field ── */}
            {AURORA_DOTS.map((d, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: d.size, height: d.size,
                    borderRadius: '50%',
                    background: `rgba(200,180,255,${d.opacity})`,
                    top: `${d.top}%`, left: `${d.left}%`,
                    animation: `ac-twinkle ${d.dur}s ease-in-out infinite`,
                    animationDelay: `${d.delay}s`,
                }} />
            ))}

            {/* ── Label ── */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase' }}>
                    Move your cursor
                </div>
                <div style={{
                    fontSize: 38, fontWeight: 900, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg,#c084fc 0%,#67e8f9 50%,#f472b6 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 28px rgba(139,92,246,0.55))',
                }}>
                    Aurora Cursor
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                    Northern lights · CSS blur · Spring physics
                </div>
            </div>
        </div>
    );
};

export type ComponentItem = {
    id: string;
    title: string;
    category: "text" | "effect" | "background" | "button" | "cursor";
    preview: () => React.ReactNode;
    code: string;
    vibePrompt: string;
};

// Lazy component resolver - returns a factory function to avoid eager initialization
const renderComponent = (id: string, _name: string): (() => React.ReactNode) => {
    return () => {
        const rawName = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        const CompName = id.endsWith('-text') ? rawName : `${rawName}Text`;

        const Comp = (Animations as any)[CompName] ||
            (VisualEffects as any)[rawName] ||
            (Animations as any)[rawName] ||
            (VisualEffects as any)[CompName];

        return Comp ? React.createElement(Comp) : (
            <div className="text-6xl md:text-9xl font-display font-bold uppercase tracking-normal opacity-20">
                PREVIEW
            </div>
        );
    };
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
        preview: () => <VisualEffects.Noise opacity={0.1} />,
        code: `import { Noise } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-64 overflow-hidden bg-black">\n    <h1 className="text-white text-4xl p-8">Noise Overlay</h1>\n    <Noise opacity={0.15} />\n  </div>\n);`,
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
        preview: () => <VisualEffects.LiquidGlass location="LONDON" temp="18" />,
        code: `import { LiquidGlass } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[300px] flex items-center justify-center bg-neutral-900">\n    <LiquidGlass location="NEW YORK" temp="22" />\n  </div>\n);`,
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
        preview: () => <VisualEffects.SpotlightCards title="Feature" description="Hover to reveal the hidden spotlight effect." />,
        code: `import { SpotlightCards } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <SpotlightCards \n    title="Service" \n    description="Innovative solutions for your modern business needs." \n  />\n);`,
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
        preview: () => <div className="w-full h-full relative overflow-hidden"><VisualEffects.GridBackground opacity={0.5} maskRadius={40} /></div>,
        code: `import { GridBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden bg-black">\n    <GridBackground opacity={0.6} maskRadius={30} />\n  </div>\n);`,
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
        preview: () => <div className="w-full h-full relative overflow-hidden"><VisualEffects.NovatrixBackground title="NEBULA" /></div>,
        code: `import { NovatrixBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden">\n    <NovatrixBackground \n      title="UI HUB" \n      colorFrom="#1a1a2e" \n      colorTo="#16213e" \n      opacity={0.8} \n    />\n  </div>\n);`,
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
        preview: () => <div className="w-full h-full relative"><VisualEffects.HellBackground intensity={1.5} speed={0.8} /></div>,
        code: `import { HellBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <HellBackground color="#DE443B" intensity={1.5} speed={1.0} />\n  </div>\n);`,
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
        preview: () => <div className="w-full h-full relative"><VisualEffects.ParticlesBackground speed={3} interactive={true} /></div>,
        code: `import { ParticlesBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <ParticlesBackground \n      colors={['#ff223e', '#5d1eb2', '#ff7300']} \n      size={3} \n      speed={2.5} \n      interactive={true} \n    />\n  </div>\n);`,
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
        preview: () => <div className="w-full h-full relative"><VisualEffects.LinesBackground title="LINES" pathColor="#9c40ff" /></div>,
        code: `import { BackgroundPaths } from '@/components/ui/background-paths';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <BackgroundPaths title="UI HUB" pathColor="rgba(255,255,255,0.2)" opacity={0.5} />\n  </div>\n);`,
        vibePrompt: "Create an animated background with SVG paths flowing smoothly behind text."
    },
    {
        id: "sparkles-background",
        title: "Sparkles Background",
        category: "background",
        preview: renderComponent("sparkles-background", "Sparkles Background"),
        code: `import { SparklesBackground } from '@/components/ui/sparkles-background';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <SparklesBackground title="Sparkles background" />\n  </div>\n);`,
        vibePrompt: "Create a beautiful twinkling sparkles background effect with high-performance WebGL particles."
    },
    {
        id: "isometric-grid-background",
        title: "Isometric Grid Background",
        category: "background",
        preview: () => <div className="w-full h-full relative"><VisualEffects.IsometricGridBackground title="ISOMETRIC" /></div>,
        code: `import { IsometricGridBackground } from '@/components/ui/isometric-grid-background';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <IsometricGridBackground \n      title="Tailwind is Awesome" \n      boxProps={{\n        rowsCount: 50,\n        colsCount: 30,\n        customColors: ["#ffaa40", "#9c40ff"]\n      }}\n    />\n  </div>\n);`,
        vibePrompt: "Create a mesmerizing, skewed isometric grid background that illuminates with random colors on hover."
    },
    {
        id: "glow-button",
        title: "Glow Button",
        category: "button",
        preview: renderComponent("glow-button", "Glow Button"),
        code: `export const GlowButton = () => (\n  <button className="px-6 py-3 rounded-full bg-green-500 text-black font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all">\n    Glow Button\n  </button>\n);`,
        vibePrompt: "Create a modern button with a glowing hover effect using Tailwind CSS."
    },
    {
        id: "border-beam",
        title: "Border Beam",
        category: "button",
        preview: renderComponent("border-beam", "Border Beam"),
        code: `import { BorderBeam } from '@/components/ui/border-beam';\n\nexport const Demo = () => (\n  <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">\n    Border Beam\n    <BorderBeam size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />\n  </button>\n);`,
        vibePrompt: "Create a button with an animated Border Beam effect around its perimeter using Framer Motion."
    },
    {
        id: "shatter-button",
        title: "Shatter Button",
        category: "button",
        preview: renderComponent("shatter-button", "Shatter Button"),
        code: `import { ShatterButton } from '@/components/ui/shatter-button';\n\nexport const Demo = () => (\n  <ShatterButton shatterColor="#00ffff" shardCount={30}>\n    Click Now\n  </ShatterButton>\n);`,
        vibePrompt: "Create a button that shatters into physics-based glass shards when clicked, using Framer Motion."
    },
    {
        id: "corner-border-button",
        title: "Corner Border",
        category: "button",
        preview: renderComponent("corner-border-button", "Corner Border Button"),
        code: `import { CornerBorderButton } from '@/components/ui/corner-border-button';\n\nexport const Demo = () => (\n  <CornerBorderButton baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">\n    BUTTON\n  </CornerBorderButton>\n);`,
        vibePrompt: "Create a button with glowing corner accents that expand into a full border on hover."
    },
    {
        id: "marquee-hover-button",
        title: "Marquee Hover",
        category: "button",
        preview: renderComponent("marquee-hover-button", "Marquee Hover Button"),
        code: `import { MarqueeHoverButton } from '@/components/ui/marquee-hover-button';\n\nexport const Demo = () => (\n  <MarqueeHoverButton label="Hover Me" />\n);`,
        vibePrompt: "Create a button that swaps its text for an infinitely scrolling marquee animation smoothly on hover."
    },
    {
        id: "payment-transaction-button",
        title: "Payment Transaction",
        category: "button",
        preview: renderComponent("payment-transaction-button", "Payment Transaction Button"),
        code: `import { PaymentTransactionButton } from '@/components/ui/payment-transaction-button';\n\nexport const Demo = () => (\n  <PaymentTransactionButton \n    label="Send Payment" \n    accentColor="#38bdf8" \n    currencySymbol="€"\n  />\n);`,
        vibePrompt: "Create a modern animated 'New Transaction Card' UI component with hover interactions where a credit card slides into a POS terminal."
    },
    {
        id: "magic-card-effect",
        title: "Magic Card Effect",
        category: "button",
        preview: renderComponent("magic-card-effect", "Magic Card Effect"),
        code: `import { MagicCard } from '@/components/ui/magic-card';\n\nexport const Demo = () => (\n  <MagicCard className="flex flex-col items-center justify-center cursor-pointer shadow-2xl" gradientColor="#262626">\n    <div className="p-12 flex flex-col items-center gap-4 text-center">\n      <p className="text-4xl font-display font-bold text-white tracking-tight">Magic Card</p>\n      <p className="text-white/50 text-sm font-medium">Hover to reveal the magic</p>\n    </div>\n  </MagicCard>\n);`,
        vibePrompt: "Create a spotlight effect that follows your mouse cursor and highlights borders on hover using framer-motion."
    },
    {
        id: "rainbow-button",
        title: "Rainbow Button",
        category: "button",
        preview: renderComponent("rainbow-button", "Rainbow Button"),
        code: `import { RainbowButton } from "@/components/ui/rainbow-button";\n\nexport const Demo = () => (\n  <RainbowButton>Rainbow Button</RainbowButton>\n);`,
        vibePrompt: "Create an animated button with a continuous rainbow border effect and a subtle glow using CSS animations."
    },
    {
        id: "social-tooltip-buttons",
        title: "Social Tooltip Hover Buttons",
        category: "button",
        preview: renderComponent("social-tooltip-buttons", "Social Tooltip Hover Buttons"),
        code: `import { SocialTooltipButtons } from "@/components/animations/SocialTooltipButtons";\n\nexport const Demo = () => (\n  <SocialTooltipButtons />\n);`,
        vibePrompt: "Create a list of social icons that reveal brand-colored tooltips with a smooth bounce animation on hover."
    },
    {
        id: "orbit-button",
        title: "Orbit Button",
        category: "button",
        preview: renderComponent("orbit-button", "Orbit Button"),
        code: `import { OrbitButton } from "@/components/ui/OrbitButton";\n\nexport const Demo = () => (\n  <OrbitButton label="Orbit Button" color="cyan" />\n);`,
        vibePrompt: "Futuristic button with planetary particles orbiting around a neon core."
    },
    {
        id: "galaxy-button",
        title: "Galaxy Button",
        category: "button",
        preview: renderComponent("galaxy-button", "Galaxy Button"),
        code: `import { GalaxyButton } from "@/components/ui/GalaxyButton";\n\nexport const Demo = () => (\n  <GalaxyButton label="Galaxy Button" />\n);`,
        vibePrompt: "Futuristic button with an animated cosmic background, moving star particles, and premium neon glows."
    },
    {
        id: "liquid-fill-button",
        title: "Liquid Fill Button",
        category: "button",
        preview: renderComponent("liquid-fill-button", "Liquid Fill Button"),
        code: `import { LiquidFillButton } from "@/components/ui/LiquidFillButton";\n\nexport const Demo = () => (\n  <LiquidFillButton label="Liquid Fill" liquidColor="#06b6d4" />\n);`,
        vibePrompt: "Premium button with a smooth SVG liquid wave filling animation that appears on hover."
    },
    {
        id: "neon-flicker-button",
        title: "Neon Flicker Button",
        category: "button",
        preview: renderComponent("neon-flicker-button", "Neon Flicker Button"),
        code: `import { NeonFlickerButton } from "@/components/ui/NeonFlickerButton";\n\nexport const Demo = () => (\n  <NeonFlickerButton label="Neon Flicker" color="red" />\n);`,
        vibePrompt: "Cyberpunk-inspired button with a smooth, randomized neon flicker effect and intense glow transitions."
    },
    {
        id: "aurora-cursor",
        title: "Aurora Cursor",
        category: "cursor",
        preview: () => <AuroraCursorPreview />,
        code: `import { AuroraCursor } from '@/components/ui/AuroraCursor';

// Drop <AuroraCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// It attaches to the window and follows the mouse at the page level.
export const Demo = () => (
  <div className="relative w-full h-[400px] bg-[#050510] rounded-2xl overflow-hidden flex items-center justify-center">
    {/* Aurora follows the real mouse — works globally */}
    <AuroraCursor size={320} />
    <p className="text-white/40 text-sm tracking-widest uppercase font-bold">
      Move your cursor around
    </p>
  </div>
);`,
        vibePrompt: "Create a premium aurora borealis cursor effect — a soft glowing gradient blob (purple, cyan, pink, indigo) that follows the mouse with spring physics, continuously morphing shape and shifting colors like northern lights. Use CSS blur + mix-blend-mode:screen on a dark background. Lightweight, no external dependencies."
    }
];
