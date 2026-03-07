import React, { useState } from 'react';
import { Copy, Check, Sparkles, Cpu, Rocket, SquareTerminal } from 'lucide-react';

const prompts = [
    {
        id: 'cursor',
        tool: 'Cursor',
        icon: <SquareTerminal className="w-5 h-5 text-blue-500" />,
        color: 'bg-white/[0.02] border-white/[0.05] group-hover:bg-blue-500/10 group-hover:border-blue-500/30',
        glow: 'group-hover:shadow-[0_8px_30px_-5px_var(--color-blue-500,rgba(59,130,246,0.15))]',
        thought: 'Context is everything. Drop the UI HUB library into Cursor to build at the speed of thought.',
        prompt: `You are an expert UI engineer. I need a premium landing page section using Tailwind CSS and Framer Motion. 
Use a dark, minimalist aesthetic with glassmorphic effects (bg-black/40 backdrop-blur-xl). 
Add a glowing neon border around the main container and subtle hover animations on the buttons.`
    },
    {
        id: 'cloud-ai',
        tool: 'Cloud AI',
        icon: <Sparkles className="w-5 h-5 text-white" />,
        color: 'bg-white/[0.02] border-white/[0.05] group-hover:bg-white/10 group-hover:border-white/20',
        glow: 'group-hover:shadow-[0_8px_30px_-5px_var(--color-white,rgba(255,255,255,0.1))]',
        thought: 'Rapid prototyping. Generate fully cohesive layouts in seconds by setting the right visual boundaries.',
        prompt: `Build a highly polished, interactive "Features" grid for a high-tech SaaS product. 
The background should be deep black (#000000). Use Lucide icons. 
Each card should have a 1px border of white/10 that brightens to white/30 on hover.`
    },
    {
        id: 'lovable',
        tool: 'Lovable',
        icon: <Cpu className="w-5 h-5 text-pink-500" />,
        color: 'bg-white/[0.02] border-white/[0.05] group-hover:bg-pink-500/10 group-hover:border-pink-500/30',
        glow: 'group-hover:shadow-[0_8px_30px_-5px_var(--color-pink-500,rgba(236,72,153,0.15))]',
        thought: 'Focus on the "why", let the AI handle the "how". Describe the emotion and physics of your UI.',
        prompt: `Create a cinematic Hero section with a dark theme. 
Include a large heading with a linear-gradient text clip (brand-green to cyan). 
Make the primary Call-To-Action button glow with a soft green shadow and lift slightly (-translate-y-1) on hover.`
    },
    {
        id: 'antigravity',
        tool: 'Antigravity',
        icon: <Rocket className="w-5 h-5 text-purple-500" />,
        color: 'bg-white/[0.02] border-white/[0.05] group-hover:bg-purple-500/10 group-hover:border-purple-500/30',
        glow: 'group-hover:shadow-[0_8px_30px_-5px_var(--color-purple-500,rgba(168,85,247,0.15))]',
        thought: 'Agentic intelligence at its peak. Describe complex logic and interactive flows to get production-ready apps.',
        prompt: `Build an animated background component utilizing Canvas and Three.js. 
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

    return (
        <section className="py-24 px-4 sm:px-6 w-full max-w-[1400px] mx-auto z-10 relative isolate">
            {/* Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[600px] bg-gradient-to-r from-brand-green/5 via-brand-green/10 to-transparent blur-[120px] rounded-full pointer-events-none -z-10" />

            {/* Header Area */}
            <div className="flex flex-col items-center text-center mb-16 md:mb-20">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand-green/30 bg-brand-green/10 mb-6">
                    <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green">
                        Vibe Coding
                    </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight mb-6">
                    <span className="block text-white">Stop writing boilerplate.</span>
                    <span className="block text-white/40 mt-1">Start coding the vibe.</span>
                </h2>
                <p className="max-w-2xl text-white/50 text-sm md:text-base leading-relaxed">
                    The new paradigm of UI engineering is <span className="text-white/80 font-semibold">curation</span>, not just creation.
                    Copy these tested AI prompts to generate high-end components instantly using your favorite copilot.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                {prompts.map((item) => (
                    <div
                        key={item.id}
                        className={`group relative flex flex-col p-6 md:p-7 rounded-3xl bg-[#030303] border border-white/[0.04] transition-all duration-500 hover:-translate-y-1 ${item.glow}`}
                    >
                        {/* Subtle Card inner ring on hover */}
                        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.02] group-hover:ring-white/[0.06] transition-all duration-500 pointer-events-none" />

                        {/* Tool Header */}
                        <div className="flex items-center gap-4 mb-5 relative z-10">
                            <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center border transition-all duration-500 ${item.color}`}>
                                {item.icon}
                            </div>
                            <h3 className="text-white text-[17px] sm:text-lg font-bold tracking-tight">
                                {item.tool}
                            </h3>
                        </div>

                        {/* Thought/Philosophy */}
                        <p className="text-[#a1a1aa] font-light text-[14px] sm:text-[15px] leading-[1.6] mb-8 relative z-10 min-h-[50px]">
                            {item.thought}
                        </p>

                        {/* Prompt Snippet Terminal */}
                        <div className="relative mt-auto pt-5 border-t border-white/[0.04] isolate z-10">
                            {/* Terminal Header */}
                            <div className="flex items-center justify-between mb-4 px-1">
                                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/30 group-hover:text-white/50 transition-colors duration-500">
                                    System Prompt
                                </span>
                                <button
                                    onClick={() => handleCopy(item.id, item.prompt)}
                                    className="flex items-center gap-1.5 text-white/30 hover:text-white transition-colors p-1"
                                >
                                    {copiedId === item.id ? (
                                        <>
                                            <Check className="w-3.5 h-3.5 text-brand-green" />
                                            <span className="text-[10px] font-bold text-brand-green">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold">Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Code Area */}
                            <div className="relative p-5 rounded-2xl bg-black border border-white/[0.04] overflow-hidden group/code cursor-pointer transition-colors hover:border-white/[0.1]"
                                onClick={() => handleCopy(item.id, item.prompt)}
                            >
                                <p className="font-mono text-[12px] md:text-[13px] leading-relaxed text-[#888] group-hover:text-[#aaa] transition-colors duration-500">
                                    {item.prompt.split('\n').map((line, i) => (
                                        <React.Fragment key={i}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </p>
                            </div>
                        </div>
                    </div>
                ))
                }
            </div >
        </section >
    );
};

export default VibePrompts;
