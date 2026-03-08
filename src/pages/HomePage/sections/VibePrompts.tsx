import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Sparkles, Cpu, Rocket, SquareTerminal } from 'lucide-react';

const prompts = [
    {
        id: 'cursor',
        tool: 'Cursor',
        icon: <SquareTerminal className="w-5 h-5 text-blue-500" />,
        color: 'bg-blue-500/10 border-blue-500/30',
        glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.2)]',
        thought: 'Context is everything. Drop the UI HUB library into Cursor to build at the speed of thought.',
        prompt: (
            <>
                You are an expert <span className="text-blue-400">UI engineer</span>. I need a premium landing page section using <span className="text-brand-green">Tailwind CSS</span> and <span className="text-purple-400">Framer Motion</span>. <br />
                Use a <span className="text-white/80">dark, minimalist</span> aesthetic with glassmorphic effects (bg-black/40 backdrop-blur-xl). <br />
                Add a <span className="text-brand-green">glowing neon border</span> around the main container and subtle hover animations on the buttons.
            </>
        ),
        raw: `You are an expert UI engineer. I need a premium landing page section using Tailwind CSS and Framer Motion. 
Use a dark, minimalist aesthetic with glassmorphic effects (bg-black/40 backdrop-blur-xl). 
Add a glowing neon border around the main container and subtle hover animations on the buttons.`
    },
    {
        id: 'cloud-ai',
        tool: 'Cloud AI',
        icon: <Sparkles className="w-5 h-5 text-white" />,
        color: 'bg-white/10 border-white/20',
        glow: 'shadow-[0_0_30px_-5px_rgba(255,255,255,0.1)]',
        thought: 'Rapid prototyping. Generate fully cohesive layouts in seconds by setting the right visual boundaries.',
        prompt: (
            <>
                Build a <span className="text-white/80 font-bold">highly polished</span>, interactive "Features" grid for a high-tech SaaS product. <br />
                The background should be <span className="text-brand-green">deep black (#000000)</span>. Use <span className="text-blue-400">Lucide icons</span>. <br />
                Each card should have a 1px border of <span className="text-white/50 text-[0.8em]">white/10</span> that brightens to <span className="text-white">white/30</span> on hover.
            </>
        ),
        raw: `Build a highly polished, interactive "Features" grid for a high-tech SaaS product. 
The background should be deep black (#000000). Use Lucide icons. 
Each card should have a 1px border of white/10 that brightens to white/30 on hover.`
    },
    {
        id: 'lovable',
        tool: 'Lovable',
        icon: <Cpu className="w-5 h-5 text-pink-500" />,
        color: 'bg-pink-500/10 border-pink-500/30',
        glow: 'shadow-[0_0_30px_-5px_rgba(236,72,153,0.2)]',
        thought: 'Focus on the "why", let the AI handle the "how". Describe the emotion and physics of your UI.',
        prompt: (
            <>
                Create a <span className="text-pink-400 font-bold">cinematic Hero section</span> with a dark theme. <br />
                Include a large heading with a <span className="text-brand-green">linear-gradient text clip</span> (brand-green to cyan). <br />
                Make the primary <span className="text-white/90 underline decoration-brand-green/30">CTA button</span> glow with a soft green shadow and lift slightly on hover.
            </>
        ),
        raw: `Create a cinematic Hero section with a dark theme. 
Include a large heading with a linear-gradient text clip (brand-green to cyan). 
Make the primary Call-To-Action button glow with a soft green shadow and lift slightly (-translate-y-1) on hover.`
    },
    {
        id: 'antigravity',
        tool: 'Antigravity',
        icon: <Rocket className="w-5 h-5 text-purple-500" />,
        color: 'bg-purple-500/10 border-purple-500/30',
        glow: 'shadow-[0_0_30px_-5px_rgba(168,85,247,0.2)]',
        thought: 'Agentic intelligence at its peak. Describe complex logic and interactive flows to get production-ready apps.',
        prompt: (
            <>
                Build an <span className="text-purple-400">animated background</span> component utilizing <span className="text-brand-green">Canvas and Three.js</span>. <br />
                Ensure it hits <span className="text-white font-bold tracking-widest">60FPS</span> and has a deep space aesthetic. <br />
                Include an interactive <span className="text-white/60">mouse gravity effect</span> on the stars.
            </>
        ),
        raw: `Build an animated background component utilizing Canvas and Three.js. 
Ensure it hits 60fps and has a deep space aesthetic.
Include an interactive mouse gravity effect on the stars.`
    }
];

const VibePrompts = () => {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" }
        }
    };

    return (
        <section id="prompts" className="py-32 px-4 sm:px-6 w-full max-w-[1400px] mx-auto z-10 relative isolate overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-gradient-to-r from-brand-green/10 via-brand-green/5 to-transparent blur-[160px] rounded-full pointer-events-none -z-10" />

            {/* Header Area */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center mb-20 md:mb-24"
            >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-green/30 bg-brand-green/10 mb-8">
                    <Sparkles className="w-4 h-4 text-brand-green animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-green">
                        Vibe Coding Matrix
                    </span>
                </div>
                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-black tracking-tighter mb-8 leading-[1.1]">
                    <span className="block text-white">Stop writing boilerplate.</span>
                    <span className="block text-white/30 italic">Start vibe coding.</span>
                </h2>
                <p className="max-w-3xl text-white/50 text-base md:text-xl leading-relaxed font-light">
                    The new paradigm of UI engineering is <span className="text-white/80 font-bold">curation</span>, not just creation.
                    Copy these tested AI prompts to generate high-end components instantly using your favorite copilot.
                </p>
            </motion.div>

            {/* Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
            >
                {prompts.map((item) => (
                    <motion.div
                        key={item.id}
                        variants={cardVariants}
                        whileHover={{ y: -8, transition: { duration: 0.2 } }}
                        className={`group relative flex flex-col p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-white/5 transition-all duration-500 hover:border-white/20 hover:bg-black/60 ${item.glow}`}
                    >
                        {/* Static Card inner ring */}
                        <div className="absolute inset-0 rounded-[2.2rem] ring-1 ring-white/5 pointer-events-none" />

                        {/* Tool Header */}
                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-white text-xl md:text-2xl font-display font-bold tracking-tight uppercase">
                                {item.tool}
                            </h3>
                        </div>

                        {/* Thought/Philosophy */}
                        <p className="text-white/50 font-light text-[15px] leading-relaxed mb-10 relative z-10 min-h-[60px]">
                            {item.thought}
                        </p>

                        {/* Prompt Snippet Terminal */}
                        <div className="relative mt-auto pt-6 border-t border-white/5 isolate z-10">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between mb-5 px-1 font-display">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 group-hover:text-brand-green/60 transition-colors duration-500">
                                    System Prompt
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopy(item.id, item.raw);
                                    }}
                                    className="flex items-center gap-2 text-white/30 hover:text-white transition-all bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
                                >
                                    {copiedId === item.id ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-brand-green" />
                                            <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wider">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Code Area */}
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleCopy(item.id, item.raw)}
                                className="relative p-6 rounded-2xl bg-[#080808] border border-white/5 overflow-hidden group/code cursor-pointer transition-all hover:bg-black hover:border-brand-green/30"
                            >
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                    <Sparkles className="w-3 h-3 text-brand-green/50" />
                                </div>
                                <p className="font-mono text-[11px] md:text-[12px] leading-relaxed text-white/30 group-hover:text-white/60 transition-colors duration-500">
                                    {item.prompt}
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
};

export default VibePrompts;

