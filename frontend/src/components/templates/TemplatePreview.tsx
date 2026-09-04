import React from 'react';
import { TemplateItem } from '../../data/templatesData';
import { Shield, Box, LayoutGrid } from 'lucide-react';

interface TemplatePreviewProps {
    template: TemplateItem;
}

/**
 * Ultra-optimized static visual preview component for template cards.
 * Delivers 100% visual fidelity matching each template's exact theme, typography,
 * and aesthetics with ZERO continuous requestAnimationFrame loops or heavy canvas blur filters.
 */
export const TemplatePreview: React.FC<TemplatePreviewProps> = ({ template }) => {
    // 1. If an explicit thumbnail image is provided, render high-performance lazy image
    if (template.thumbnailUrl) {
        return (
            <img
                src={template.thumbnailUrl}
                alt={template.title}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-top select-none pointer-events-none"
            />
        );
    }

    // 2. High-performance static visual representations for each template
    switch (template.id) {
        case 'tars-protocol':
            return (
                <div className="relative w-full h-full bg-[#080511] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none">
                    {/* SVG Perspective Grid Background */}
                    <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 400 240" fill="none">
                        <path d="M0 200 L400 200 M0 170 L400 170 M0 145 L400 145 M0 125 L400 125 M0 110 L400 110" stroke="#8B42FF" strokeWidth="0.8" />
                        <path d="M200 80 L0 240 M200 80 L60 240 M200 80 L130 240 M200 80 L200 240 M200 80 L270 240 M200 80 L340 240 M200 80 L400 240" stroke="#8B42FF" strokeWidth="0.8" />
                    </svg>

                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#8B42FF]/25 rounded-full blur-2xl" />

                    {/* Top Bar Details */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#BFA0FF] uppercase border border-[#8B42FF]/40 px-1.5 py-0.5 rounded bg-black/40">
                            SOLANA // AI ARENA
                        </span>
                        <span className="w-2 h-2 rounded-full bg-[#00FFA3] shadow-[0_0_8px_#00FFA3]" />
                    </div>

                    {/* Center Sculpture Graphic */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4B8FF] via-[#7928CA] to-[#4301C2] border-2 border-[#BFA0FF]/50 shadow-[0_0_25px_rgba(139,66,255,0.6)] flex items-center justify-center">
                            <Box size={24} className="text-white opacity-90" />
                        </div>
                        <h4 className="mt-2.5 text-xs font-black uppercase tracking-wider text-white">
                            TARS ARENA
                        </h4>
                    </div>

                    {/* Bottom Metadata */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-400">
                        <span>SYS.v4 // ONLINE</span>
                        <span className="text-[#00FFA3]">ECOSYSTEM VERIFIED</span>
                    </div>
                </div>
            );

        case 'split-fuzzy-orb':
            return (
                <div className="relative w-full h-full bg-[#d6c0e3] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none">
                    {/* Editorial Watermark */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#241b35] uppercase">
                            CREATIVE STUDIO
                        </span>
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#241b35]/60">
                            2026 // EDITION
                        </span>
                    </div>

                    {/* Center Torus Graphic */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7B2CBF] via-[#9D4EDD] to-[#E0AAFF] opacity-80 blur-md" />
                            <div className="relative w-16 h-16 rounded-full border-4 border-[#241b35] bg-gradient-to-br from-[#C77DFF] to-[#5A189A] flex items-center justify-center shadow-lg">
                                <div className="w-6 h-6 rounded-full bg-[#d6c0e3] border-2 border-[#241b35]" />
                            </div>
                        </div>
                        <h4 className="mt-2 text-xs font-black uppercase tracking-tight text-[#241b35]">
                            SPLIT FUZZY ORB
                        </h4>
                    </div>

                    {/* Bottom Split Graphic Indicator */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono font-bold text-[#241b35]/70">
                        <span>[ LEFT: GAUSSIAN BLUR ]</span>
                        <span>[ RIGHT: RAZOR CRISP ]</span>
                    </div>
                </div>
            );

        case 'segmint-2026':
            return (
                <div className="relative w-full h-full bg-[#0755CE] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none text-white">
                    {/* Top Monospace Label */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-black tracking-widest uppercase bg-black text-white px-1.5 py-0.5 border border-white/20">
                            SEGMINT.SYS
                        </span>
                        <span className="text-[9px] font-mono font-bold tracking-wider opacity-80">
                            GENESIS 2026
                        </span>
                    </div>

                    {/* Center Brutalist Typography */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter leading-none">
                            SEGMINT
                        </h3>
                        <div className="mt-1 flex items-center gap-1">
                            <span className="h-1.5 w-6 bg-white" />
                            <span className="text-[9px] font-mono font-bold tracking-widest text-[#FFC700]">
                                WEB3 FOOTER ARCHITECTURE
                            </span>
                            <span className="h-1.5 w-6 bg-white" />
                        </div>
                    </div>

                    {/* Bottom Grid Detail */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono opacity-80 border-t border-white/20 pt-1.5">
                        <span>ETHEREUM L2</span>
                        <span>READY TO DEPLOY</span>
                    </div>
                </div>
            );

        case 'haos-tech-solutions':
            return (
                <div className="relative w-full h-full bg-[#020202] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none">
                    {/* Ambient Neon Atmosphere */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-[#98FF68]/15 rounded-full blur-2xl" />

                    {/* Top Metadata */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-widest text-[#98FF68] uppercase">
                            HAOS TECH SOLUTIONS
                        </span>
                        <span className="text-[9px] font-mono font-bold text-neutral-500">
                            [01/07]
                        </span>
                    </div>

                    {/* Center Split Sliced Green Sphere Graphic */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* Static Sliced Semicircles */}
                            <div className="absolute left-0 w-10 h-20 overflow-hidden flex items-center justify-end pr-0.5">
                                <div className="w-20 h-20 rounded-full border-2 border-[#98FF68]/60 bg-gradient-to-r from-transparent to-[#98FF68]/20 shadow-[0_0_15px_#98FF68]" />
                            </div>
                            <div className="absolute right-0 w-10 h-20 overflow-hidden flex items-center justify-start pl-0.5">
                                <div className="w-20 h-20 rounded-full border-2 border-[#98FF68] bg-[#98FF68]/30 shadow-[0_0_20px_#98FF68]" />
                            </div>
                            <div className="w-1 h-14 bg-black z-20" />
                        </div>
                        <h4 className="mt-2 text-xs font-black uppercase tracking-wider text-white">
                            OPTICAL NEON SLICING
                        </h4>
                    </div>

                    {/* Bottom Monospace Coordinates */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-500">
                        <span>X: 104.22 // Y: 92.10</span>
                        <span className="text-[#98FF68]">VOLUMETRIC 3D</span>
                    </div>
                </div>
            );

        case 'mentality':
            return (
                <div className="relative w-full h-full bg-[#F0F0F0] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none text-black">
                    {/* Top Bauhaus Tag */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-mono font-bold tracking-widest uppercase bg-black text-white px-1.5 py-0.5">
                            MENTALITY
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase text-neutral-500">
                            BAUHAUS EDITORIAL
                        </span>
                    </div>

                    {/* Center Graphic */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center mb-1.5 bg-white shadow-[2px_2px_0px_0px_#000]">
                            <LayoutGrid size={18} className="text-black" />
                        </div>
                        <h4 className="text-sm font-black uppercase tracking-tight text-black max-w-[220px] leading-tight">
                            EXPERT MENTAL PROGRAMS
                        </h4>
                        <p className="text-[9px] text-neutral-600 font-medium mt-1">
                            Architecture, typography & character art
                        </p>
                    </div>

                    {/* Bottom Line */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-600 border-t border-black/10 pt-1.5">
                        <span>GRID SYSTEM: 12-COL</span>
                        <span className="font-bold text-black">CURATED READY</span>
                    </div>
                </div>
            );

        case 'lakera-ai-security':
            return (
                <div className="relative w-full h-full bg-white overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none text-neutral-900">
                    {/* Top Minimal Navbar */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-xs font-black tracking-tight text-black">
                            lakera<span className="text-[#1F4BFF]">.ai</span>
                        </span>
                        <span className="text-[8px] font-mono font-bold tracking-wider px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded border border-neutral-200">
                            ENTERPRISE
                        </span>
                    </div>

                    {/* Center Slit-Scan Circle Artwork */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#3D5CFF] via-[#00E599] to-[#FFC700] p-0.5 shadow-md flex items-center justify-center">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                                <Shield size={20} className="text-[#1F4BFF]" />
                            </div>
                        </div>
                        <h4 className="mt-2 text-xs font-black uppercase tracking-tight text-black font-heading">
                            AI SECURITY HERO
                        </h4>
                        <p className="text-[9px] text-neutral-500 max-w-[200px] line-clamp-1 mt-0.5">
                            Protecting LLMs against prompt injection
                        </p>
                    </div>

                    {/* Bottom Logos Indicator */}
                    <div className="relative z-10 flex items-center justify-between text-[8px] font-mono text-neutral-400 border-t border-neutral-100 pt-1.5">
                        <span>TRUSTED BY TOP LABS</span>
                        <span className="text-[#1F4BFF] font-bold">1:1 REPLICA</span>
                    </div>
                </div>
            );

        case 'interior-design':
            return (
                <div className="relative w-full h-full bg-white overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none text-neutral-900">
                    {/* Top Bar */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-serif italic tracking-wider text-[#252525]">
                            Studio Noir
                        </span>
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#B2C951] bg-[#B2C951]/10 px-1.5 py-0.5 rounded">
                            LUXURY SHOWCASE
                        </span>
                    </div>

                    {/* Center Artwork with Olive Accent */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <div className="relative w-20 h-16 rounded-lg bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center mb-1 shadow-sm">
                            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#B2C951]/30" />
                            <img
                                src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788399032/013ede30-542d-4a45-a9f1-5a48fad37592_wvscrb.png"
                                alt="Armchair"
                                className="h-12 w-auto object-contain relative z-10"
                                loading="lazy"
                                decoding="async"
                            />
                        </div>
                        <h4 className="text-xs font-black uppercase tracking-tight text-neutral-900">
                            EDITORIAL INTERIOR
                        </h4>
                        <p className="text-[9px] text-neutral-500 font-serif italic mt-0.5">
                            Curated furniture & bottom footer card
                        </p>
                    </div>

                    {/* Bottom Status */}
                    <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-neutral-400 border-t border-neutral-100 pt-1.5">
                        <span>MINIMALIST GRID</span>
                        <span className="text-[#B2C951] font-bold">TAILWIND CSS</span>
                    </div>
                </div>
            );

        case 'lumos':
            return (
                <div className="relative w-full h-full bg-[#F1F1F0] overflow-hidden flex flex-col justify-between p-4 select-none pointer-events-none text-[#111111]">
                    {/* Top Bar */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[10px] font-black tracking-widest text-[#111111] uppercase">
                            LUMOS
                        </span>
                        <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-[#111111] text-white text-[8px] font-mono font-bold flex items-center justify-center">
                                01+
                            </span>
                            <span className="px-2 py-0.5 bg-[#F54D92] text-white text-[8px] font-black uppercase tracking-wider">
                                GET STARTED
                            </span>
                        </div>
                    </div>

                    {/* Center Artwork with Background Ghost Typography */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                            <span className="text-5xl font-black text-[#E5E5E3] uppercase tracking-tighter">
                                LUMOS
                            </span>
                        </div>
                        <img
                            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788461532/964ef29e-b274-436f-8f56-dbff69f2a55d_rbp0io.png"
                            alt="Lumos 3D Eye Artwork"
                            className="h-20 w-auto object-contain relative z-10 drop-shadow-md"
                            loading="lazy"
                            decoding="async"
                        />
                        <h4 className="mt-1 text-[11px] font-black uppercase tracking-tight text-[#111111] z-10">
                            FUTURISTIC EDITORIAL HERO
                        </h4>
                    </div>

                    {/* Bottom Barcode Strip */}
                    <div className="relative z-10 flex items-center justify-between text-[8px] font-sans font-black tracking-wider text-[#111111] border-t border-neutral-300 pt-1.5 uppercase">
                        <span>ILLUMINATE POTENTIAL</span>
                        <div className="flex items-center gap-[1px] h-2.5 opacity-80">
                            {[2, 1, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1, 2].map((w, i) => (
                                <div key={i} className="h-full bg-[#111111]" style={{ width: `${w * 0.8}px` }} />
                            ))}
                        </div>
                        <span>COMMERCIAL POWER</span>
                    </div>
                </div>
            );

        default:
            return (
                <div className={`relative h-full w-full bg-gradient-to-br ${template.previewGradient} p-5 flex flex-col justify-between overflow-hidden select-none pointer-events-none`}>
                    <span className="text-xl font-black text-white">{template.title}</span>
                    <span className="text-xs font-mono text-white/70 uppercase tracking-wider">
                        {template.category}
                    </span>
                </div>
            );
    }
};

export default React.memo(TemplatePreview);
