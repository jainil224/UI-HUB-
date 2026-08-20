import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy, Check, Sparkles, Rocket, Zap, Brain,
    Code2, ArrowRight, Terminal, Star, TrendingUp, Users, Cpu, Atom
} from 'lucide-react';
import { ANTIGRAVITY_PROMPTS } from '../../../data/antigravityPrompts';
import { LOVABLE_PROMPTS } from '../../../data/lovablePrompts';
import { CLAUDE_PROMPTS } from '../../../data/claudePrompts';
import Toast from '../../../components/ui/Toast';

// ─── Prompt data ───────────────────────────────────────────────────────────────
const prompts = [
    {
        id: 'advance-3d',
        tool: 'Advanced AI',
        toolShort: 'Advanced',
        icon: <Atom className="w-5 h-5 text-orange-400" />,
        color: 'border-orange-500/30',
        iconBg: 'bg-orange-500/10',
        accentColor: '#f97316',
        glow: '0_0_40px_-5px_rgba(249,115,22,0.25)',
        tag: 'Advanced',
        tagColor: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
        thought: 'Precision-engineered universal prompts designed by UI HUB. Works with any AI tool — ChatGPT, Claude, Gemini, Cursor, or Copilot.',
        prompt: (
            <>
                Build a <span className="text-orange-400">3D Landing Page</span> with <span className="text-brand-green">Spline integration</span> and mouse tilt effects.<br />
                Add glassmorphic <span className="text-white font-bold">Navbar + Hero overlay</span> with interactive cards.<br />
                Fonts: <span className="text-white/60">Gruppo + Sen</span>. Mobile fallback: <span className="text-white">GIF animation</span>.
            </>
        ),
        raw: CLAUDE_PROMPTS['3d-landing-page'],
        uses: '1.2k',
    },
    {
        id: 'lovable-3d',
        tool: 'Lovable Vibe',
        toolShort: 'Lovable',
        icon: <Zap className="w-5 h-5 text-pink-400" />,
        color: 'border-pink-500/30',
        iconBg: 'bg-pink-500/10',
        accentColor: '#ec4899',
        glow: '0_0_40px_-5px_rgba(236,72,153,0.25)',
        tag: 'Lovable',
        tagColor: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
        thought: 'Ship pixel-perfect 3D landing pages with zero configuration. Just describe and deploy.',
        prompt: (
            <>
                Build a <span className="text-pink-400">3D Landing Page</span> with Spline integration and <span className="text-brand-green">mouse tilt effects</span>.<br />
                Add a glassmorphic <span className="text-white font-bold">Navbar</span> and hero overlay cards.<br />
                Fonts: <span className="text-white/60">Gruppo + Sen</span>. Mobile fallback: GIF animation.
            </>
        ),
        raw: LOVABLE_PROMPTS['3d-landing-page'],
        uses: '1.8k',
    },
    {
        id: 'antigravity-cube',
        tool: 'Antigravity Pro',
        toolShort: 'Antigravity',
        icon: <Brain className="w-5 h-5 text-cyan-400" />,
        color: 'border-cyan-500/30',
        iconBg: 'bg-cyan-500/10',
        accentColor: '#22d3ee',
        glow: '0_0_40px_-5px_rgba(34,211,238,0.25)',
        tag: '3D Physics',
        tagColor: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
        thought: 'Real 3D physics simulation with inertia, scramble logic, and an automated solver algorithm.',
        prompt: (
            <>
                Build a fully interactive <span className="text-cyan-400">Rubik's Cube</span> using <span className="text-brand-green">CSS 3D transforms</span>.<br />
                Include <span className="text-white font-bold">drag inertia</span>, layer rotation, and an auto solve engine.<br />
                Animate at <span className="text-white/60">60fps</span> with GPU-accelerated matrix transforms.
            </>
        ),
        raw: ANTIGRAVITY_PROMPTS['3d-rubiks-cube'],
        uses: '3.1k',
    },
    {
        id: 'antigravity-blackbox',
        tool: 'Claude Elite',
        toolShort: 'Claude',
        icon: <Code2 className="w-5 h-5 text-brand-green" />,
        color: 'border-brand-green/30',
        iconBg: 'bg-brand-green/10',
        accentColor: '#00ff00',
        glow: '0_0_40px_-5px_rgba(0,255,0,0.2)',
        tag: 'Dashboard',
        tagColor: 'text-brand-green bg-brand-green/10 border-brand-green/20',
        thought: 'Regenerate a full cyberpunk dashboard with glitch effects, terminal logs, and live charts — in one prompt.',
        prompt: (
            <>
                Build a <span className="text-brand-green">Cyberpunk Dashboard</span> with glitch animations and a <span className="text-white font-bold">live terminal</span> feed.<br />
                Include a <span className="text-white/60">dual-line chart</span>, stats grid, and RGB split effects.<br />
                Style: hacker aesthetic with <span className="text-white font-bold">noise overlay</span> and glitch mode toggle.
            </>
        ),
        raw: ANTIGRAVITY_PROMPTS['black-box'],
        uses: '4.2k',
    },
];

// ─── Animated live counter ─────────────────────────────────────────────────────
const LiveCounter = ({ value }: { value: number }) => {
    const [displayed, setDisplayed] = useState(value - 10);
    useEffect(() => {
        const timer = setInterval(() => {
            setDisplayed((prev) => {
                if (prev >= value) { clearInterval(timer); return value; }
                return prev + 1;
            });
        }, 60);
        return () => clearInterval(timer);
    }, [value]);
    return <span>{displayed.toLocaleString()}</span>;
};

// ─── Scrolling ticker ──────────────────────────────────────────────────────────
const TickerItem: React.FC<{ text: string; highlight?: string; isAlt?: boolean }> = ({ text, highlight, isAlt }) => (
    <span className="flex items-center gap-3 px-6 text-neutral-300 text-xs font-black uppercase tracking-wider shrink-0">
        <span className={`w-2 h-2 rounded-full ${isAlt ? 'bg-brand-yellow' : 'bg-brand-blue'} shrink-0`} />
        <span>{text}</span>
        {highlight && <span className="text-brand-blue font-black">{highlight}</span>}
    </span>
);

const tickerItems = [
    { text: 'Pixel-Perfect Components', highlight: '→ Copy & Deploy' },
    { text: 'Production-Ready Code', highlight: '→ Zero Config' },
    { text: 'AI-Powered Generation', highlight: '→ In Seconds' },
    { text: 'Enterprise-Grade Quality', highlight: '→ Always' },
    { text: '60fps Animations', highlight: '→ Guaranteed' },
    { text: 'WebGL + Three.js', highlight: '→ Supported' },
    { text: 'Claude + Antigravity', highlight: '→ Elite Models' },
    { text: 'Advanced Prompt', highlight: '→ Any AI Tool' },
    { text: 'Lovable + Cursor', highlight: '→ Free Prompts' },
];

// ─── Main component ────────────────────────────────────────────────────────────
const VibePrompts = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setToastMessage(`PROMPT COPIED`);
        setShowToast(true);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section id="prompts" className="py-24 px-4 sm:px-6 w-full max-w-[1400px] mx-auto z-10 relative isolate bg-brand-bg border-t-4 border-black">

            {/* ── Scrolling Ticker ────────────────────────────────────────── */}
            <div className="relative overflow-hidden mb-16 -mx-6 border-y-4 border-black bg-black py-4">
                <div className="flex overflow-hidden">
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
                        className="flex shrink-0"
                    >
                        {[...tickerItems, ...tickerItems].map((item, i) => (
                            <TickerItem key={i} text={item.text} highlight={item.highlight} isAlt={i % 2 === 1} />
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center mb-16"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 border-2 border-white bg-brand-surface text-white mb-6 rounded">
                    <Sparkles className="w-4 h-4 text-brand-blue" />
                    <span className="text-xs font-black uppercase tracking-widest text-white">
                        Vibe Coding Matrix
                    </span>
                </div>

                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight mb-6 leading-tight">
                    <span className="block text-white">Stop <span className="text-brand-blue">writing</span> boilerplate.</span>
                    <span className="block text-neutral-400">Start <span className="text-brand-blue">vibe</span> coding.</span>
                </h2>

                <p className="max-w-2xl text-neutral-400 text-base md:text-lg leading-relaxed font-medium mb-8">
                    The new paradigm of UI engineering is <span className="text-white font-bold">curation</span>, not just creation.
                    Copy these tested AI prompts to generate high-end components instantly using your favorite copilot.
                </p>
            </motion.div>

            {/* ── Live Stats Row ──────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            >
                {[
                    { icon: Terminal, label: 'Prompts Available', value: 330, suffix: '+', shadow: 'brutal-shadow-blue' },
                    { icon: Users, label: 'Developers Used', value: 12800, suffix: '+', shadow: 'brutal-shadow-red' },
                    { icon: TrendingUp, label: 'Avg Copy Rate', value: 94, suffix: '%', shadow: 'brutal-shadow-yellow' },
                    { icon: Cpu, label: 'AI Models Supported', value: 5, suffix: '', shadow: 'brutal-shadow-white' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={i}
                            className={`p-5 rounded-lg border-2 border-white bg-brand-surface flex items-center gap-4 ${stat.shadow}`}
                        >
                            <div className="w-10 h-10 rounded border-2 border-black bg-brand-blue flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">
                                    <LiveCounter value={stat.value} />{stat.suffix}
                                </p>
                                <p className="text-[10px] text-neutral-400 font-black uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    );
                })}
            </motion.div>

            {/* ── Prompt Cards Grid ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-16"
            >
                {prompts.map((item, idx) => (
                    <div
                        key={item.id}
                        className="group relative flex flex-col p-6 rounded-lg bg-brand-surface border-2 border-white brutal-shadow-black transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded border-2 border-white bg-black flex items-center justify-center">
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-black uppercase tracking-wider leading-none">
                                        {item.tool}
                                    </h3>
                                    <div className="inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-brand-surface-alt border border-white text-white">
                                        {item.tag}
                                    </div>
                                </div>
                            </div>
                            {/* Uses count */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Star className="w-3 h-3 text-neutral-500" />
                                <span className="text-[10px] text-neutral-400 font-bold">{item.uses}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-neutral-400 text-xs leading-relaxed mb-4 flex-shrink-0 font-medium">
                            {item.thought}
                        </p>

                        {/* Terminal Preview / Code Frame */}
                        <div className="relative mt-auto pt-3 border-t-2 border-neutral-800 isolate z-10 flex-1 flex flex-col">
                            {/* Top Bar with traffic light dots */}
                            <div className="flex items-center justify-between mb-3 px-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-red border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400 ml-2">PROMPT</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.id, item.raw);
                                    }}
                                    className="flex items-center gap-1 text-white bg-brand-blue hover:bg-brand-blue-dark border border-black px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-colors shadow-[1px_1px_0px_0px_#000]"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {copiedId === item.id ? (
                                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
                                                <Check className="w-3 h-3" />
                                                <span>COPIED</span>
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
                                                <Copy className="w-3 h-3" />
                                                <span>COPY</span>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>

                            {/* Code area */}
                            <div
                                onClick={() => handleCopy(item.id, item.raw)}
                                className="relative p-3.5 rounded bg-black border-2 border-neutral-700 overflow-hidden cursor-pointer hover:border-white transition-colors flex-1"
                            >
                                <p className="font-mono text-[11px] leading-relaxed text-neutral-300">
                                    {item.prompt}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* ── Bottom CTA Banner ───────────────────────────────────────── */}
            <div className="relative overflow-hidden rounded-lg border-2 border-white bg-brand-surface p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 brutal-shadow-black">
                <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                        <span className="w-2 h-2 rounded-full bg-brand-blue" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-blue">Upgrade for more prompts</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mb-2">
                        Unlock <span className="text-brand-blue">50+ Elite Prompts</span>
                    </h3>
                    <p className="text-neutral-400 text-sm max-w-md font-medium">
                        Pro and Elite members get access to the full Vibe Coding Matrix — Claude, Antigravity, Lovable, Cursor, and Advanced prompts.
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    <a href="/pricing">
                        <button className="brutal-btn-primary px-8 py-4 text-xs font-black tracking-widest flex items-center gap-2">
                            <span>GET PRO ACCESS</span>
                            <ArrowRight size={16} />
                        </button>
                    </a>
                </div>
            </div>

            {/* Holographic Toast Notification */}
            <Toast 
                isVisible={showToast} 
                message={toastMessage} 
                onClose={() => setShowToast(false)} 
            />
        </section>
    );
};

export default VibePrompts;
