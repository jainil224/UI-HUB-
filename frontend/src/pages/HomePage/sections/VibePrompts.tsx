import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Copy, Check, Sparkles, Rocket, Zap, Brain,
    Code2, ArrowRight, Terminal, Star, TrendingUp, Users, Cpu, Atom
} from 'lucide-react';
import { ANTIGRAVITY_PROMPTS } from '../../../data/antigravityPrompts';
import { LOVABLE_PROMPTS } from '../../../data/lovablePrompts';
import { CLAUDE_PROMPTS } from '../../../data/claudePrompts';

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
        thought: 'Precision-engineered prompts for the Advance model. Full-stack 3D apps with zero configuration drift.',
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
const TickerItem: React.FC<{ text: string; highlight?: string }> = ({ text, highlight }) => (
    <span className="flex items-center gap-3 px-6 text-white/30 text-[11px] font-bold uppercase tracking-widest shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shrink-0" />
        {text}
        {highlight && <span className="text-brand-green">{highlight}</span>}
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

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <section id="prompts" className="py-32 px-4 sm:px-6 w-full max-w-[1400px] mx-auto z-10 relative isolate overflow-hidden">

            {/* Ambient background glows */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-brand-green/8 via-purple-500/5 to-cyan-500/5 blur-[180px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-pink-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* ── Scrolling Ticker ────────────────────────────────────────── */}
            <div className="relative overflow-hidden mb-20 -mx-6">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
                <div className="flex border-y border-white/[0.08] py-3.5 overflow-hidden">
                    <motion.div
                        animate={{ x: ['0%', '-50%'] }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="flex shrink-0"
                    >
                        {[...tickerItems, ...tickerItems].map((item, i) => (
                            <TickerItem key={i} text={item.text} highlight={item.highlight} />
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center mb-12"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/30 bg-brand-green/10 mb-8">
                    <Sparkles className="w-4 h-4 text-brand-green animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-green">
                        Vibe Coding Matrix
                    </span>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter mb-8 leading-[1.05]">
                    <span className="block text-white">Stop <span className="text-brand-green">writing </span>boilerplate.</span>
                    <span className="block text-white/30 italic">Start <span className="text-brand-green">vibe </span>coding.</span>
                </h2>

                <p className="max-w-3xl text-white/50 text-base md:text-xl leading-relaxed font-light mb-10">
                    The new paradigm of UI engineering is <span className="text-white/80 font-bold">curation</span>, not just creation.
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
                    { icon: Terminal, label: 'Prompts Available', value: 330, suffix: '+', color: 'text-brand-green' },
                    { icon: Users, label: 'Developers Used', value: 12800, suffix: '+', color: 'text-purple-400' },
                    { icon: TrendingUp, label: 'Avg Copy Rate', value: 94, suffix: '%', color: 'text-cyan-400' },
                    { icon: Cpu, label: 'AI Models Supported', value: 5, suffix: '', color: 'text-pink-400' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08 }}
                            className="glass p-5 rounded-2xl flex items-center gap-4 group hover:border-white/20 transition-all"
                        >
                            <div className={`w-10 h-10 rounded-xl ${stat.color.replace('text-', 'bg-').replace('4', '4/10')} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                            </div>
                            <div>
                                <p className={`text-2xl font-display font-black ${stat.color}`}>
                                    <LiveCounter value={stat.value} />{stat.suffix}
                                </p>
                                <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">{stat.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* ── Prompt Cards Grid ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 mb-16"
            >
                {prompts.map((item, idx) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: idx * 0.08 }}
                        whileHover={{ y: -10 }}
                        onHoverStart={() => setActiveTab(item.id)}
                        onHoverEnd={() => setActiveTab(null)}
                        className={`group relative flex flex-col p-7 rounded-3xl bg-black/50 backdrop-blur-xl border border-white/5 transition-all duration-500 hover:border-white/15 cursor-default`}
                        style={{
                            boxShadow: activeTab === item.id ? item.glow : 'none',
                        }}
                    >
                        {/* Ambient inner glow on hover */}
                        <div
                            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                            style={{ background: `radial-gradient(ellipse at top left, ${item.accentColor}08 0%, transparent 60%)` }}
                        />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-12 h-12 rounded-2xl ${item.iconBg} border ${item.color} flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                                    {item.icon}
                                </div>
                                <div>
                                    <h3 className="text-white text-base font-display font-black uppercase tracking-tight leading-none">
                                        {item.tool}
                                    </h3>
                                    <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${item.tagColor}`}>
                                        {item.tag}
                                    </div>
                                </div>
                            </div>
                            {/* Uses count */}
                            <div className="flex items-center gap-1 shrink-0">
                                <Star className="w-3 h-3 text-white/20" />
                                <span className="text-[10px] text-white/20 font-bold">{item.uses}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-white/45 font-light text-[13px] leading-relaxed mb-6 relative z-10 flex-shrink-0">
                            {item.thought}
                        </p>

                        {/* Terminal Preview */}
                        <div className="relative mt-auto pt-5 border-t border-white/[0.05] isolate z-10 flex-1 flex flex-col">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500/60" />
                                    <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                                    <div className="w-2 h-2 rounded-full bg-green-500/60" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/15 ml-2">system prompt</span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.id, item.raw);
                                    }}
                                    className="flex items-center gap-1.5 text-white/30 hover:text-white transition-all bg-white/[0.04] hover:bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-white/15"
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        {copiedId === item.id ? (
                                            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                                                <Check className="w-3 h-3 text-brand-green" />
                                                <span className="text-[9px] font-black text-brand-green uppercase tracking-wider">Copied!</span>
                                            </motion.span>
                                        ) : (
                                            <motion.span key="copy" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1.5">
                                                <Copy className="w-3 h-3" />
                                                <span className="text-[9px] font-black uppercase tracking-wider">Copy</span>
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>
                            </div>

                            {/* Code area */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCopy(item.id, item.raw)}
                                className="relative p-5 rounded-2xl bg-[#050505] border border-white/[0.04] overflow-hidden group/code cursor-pointer transition-all hover:border-white/10 flex-1"
                                style={{ borderColor: activeTab === item.id ? `${item.accentColor}20` : undefined }}
                            >
                                <p className="font-mono text-[11px] leading-relaxed text-white/25 group-hover/code:text-white/50 transition-colors duration-500">
                                    {item.prompt}
                                </p>
                                {/* Scanline shimmer on hover */}
                                <motion.div
                                    animate={activeTab === item.id ? { y: ['0%', '100%'] } : { y: '0%' }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-x-0 h-8 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent pointer-events-none"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* ── Bottom CTA Banner ───────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8"
            >
                {/* Glow blob */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-green/5 via-transparent to-purple-500/5 pointer-events-none" />
                <div className="absolute -top-1/2 left-1/4 w-[400px] h-[400px] bg-brand-green/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 text-center md:text-left">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
                        <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse shadow-[0_0_8px_#00FF00]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-green/80">Upgrade for more prompts</span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
                        Unlock <span className="text-brand-green">50+ Elite Prompts</span>
                    </h3>
                    <p className="text-white/40 text-sm max-w-md">
                        Pro and Elite members get access to the full Vibe Coding Matrix — Claude, Antigravity, Lovable, Cursor, and <span className="text-white/70 font-semibold">Advanced</span> (works with any AI tool).
                    </p>
                </div>

                <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        {['A', 'C', 'L', 'G'].map((letter, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-white/50"
                                style={{ marginLeft: i > 0 ? '-8px' : 0, zIndex: 4 - i }}
                            >
                                {letter}
                            </div>
                        ))}
                        <span className="text-white/30 text-xs font-bold ml-2">+46 more</span>
                    </div>
                    <a href="/pricing" className="flex items-center gap-2 bg-brand-green text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs green-glow hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,0,0.5)] transition-all group/cta">
                        Get Pro Access
                        <ArrowRight size={16} className="group-hover/cta:translate-x-1 transition-transform" />
                    </a>
                </div>
            </motion.div>
        </section>
    );
};

export default VibePrompts;
