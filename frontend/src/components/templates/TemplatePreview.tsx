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

        case 'loveapp-hero':
            return (
                <div className="relative w-full h-full bg-[#E6E2FF] overflow-hidden flex flex-col justify-between p-3 select-none pointer-events-none border border-[#CBC4EC]">
                    {/* Ambient Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-[#F34B83]/20 rounded-full blur-2xl pointer-events-none" />

                    {/* Top Future™ Logo + Pills summary */}
                    <div className="relative z-10 flex items-center justify-between">
                        <span className="text-[9px] font-sans font-semibold tracking-[0.2em] text-neutral-500 uppercase">
                            FUTURE™
                        </span>
                        <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full border border-neutral-400/40 text-[8px] text-neutral-800">
                                Smart AI
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-black text-white text-[8px] font-medium">
                                Log in →
                            </span>
                        </div>
                    </div>

                    {/* Center Artwork with LOVEAPP Giant Typography */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto text-center">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                            <span className="text-4xl sm:text-5xl font-black text-black/90 uppercase tracking-tight scale-y-125">
                                LOVEAPP
                            </span>
                        </div>
                        <img
                            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788462111/74ce5ea8-d47d-4de3-a636-7411198f4b28_hi8xrw.png"
                            alt="LoveApp 3D Glass Heart"
                            className="h-16 w-auto object-contain relative z-10 drop-shadow-[0_8px_16px_rgba(180,40,90,0.25)]"
                            loading="lazy"
                            decoding="async"
                        />
                        <p className="mt-1 text-[9px] text-[#1A1820] font-normal z-10">
                            Find the love of your life in <span className="underline font-medium">one click</span>
                        </p>
                    </div>

                    {/* Bottom CTA Pill */}
                    <div className="relative z-10 flex items-center justify-center pt-1 border-t border-[#CBC3EE]/70">
                        <span className="px-3.5 py-0.5 rounded-full bg-black text-white text-[9px] font-medium">
                            Find love
                        </span>
                    </div>
                </div>
            );

        case 'heyo-agency-cta':
            return (
                <div className="relative w-full h-full bg-[#F5F5F2] overflow-hidden flex flex-col justify-end select-none pointer-events-none p-2">
                    {/* Dark Footer Bottom Strip */}
                    <div className="relative w-full h-[55%] bg-[#171719] rounded-t-[16px] px-3 pt-6 pb-2 flex flex-col justify-between">
                        {/* Waving Hand SVG Logo + Mini Nav */}
                        <div className="flex items-center justify-between text-[8px] text-neutral-400">
                            <span className="font-semibold text-white">HEYO AGENCY</span>
                            <div className="flex items-center gap-1.5">
                                <span>Work</span>
                                <span>About</span>
                                <span>Contact</span>
                            </div>
                        </div>

                        {/* Bottom Copyright */}
                        <div className="flex items-center justify-between text-[7px] text-neutral-500 border-t border-white/10 pt-1">
                            <span>© 2024 Heyo</span>
                            <span>Privacy</span>
                        </div>
                    </div>

                    {/* Overlapping Canary Yellow Card */}
                    <div className="absolute left-3 top-3 right-12 bg-[#FFE83B] rounded-[14px] p-3 shadow-sm z-20">
                        <span className="text-[13px] font-serif font-normal text-[#111111] leading-tight block">
                            Let’s get started.
                        </span>
                        <span className="text-[8px] text-[#4A4B3A] block mt-1 line-clamp-1">
                            We want to hear from you to get an awesome project started!
                        </span>
                        <div className="mt-2">
                            <span className="inline-block px-2.5 py-1 rounded-full bg-[#171719] text-white text-[7.5px] font-medium">
                                Let's Chat
                            </span>
                        </div>
                    </div>

                    {/* Mascot Illustration Breakthrough */}
                    <img
                        src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788463693/972ea88b-93ad-4bdc-93ae-2095741274ee_swtdmz.png"
                        alt="Heyo Mascot Character"
                        className="absolute right-1 top-2 w-28 h-auto object-contain z-30 drop-shadow-md pointer-events-none"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            );

        case 'me-019-au-cabaret':
            return (
                <div className="relative w-full h-full bg-[#EDEDED] overflow-hidden flex flex-col justify-between select-none pointer-events-none p-3 border border-neutral-300 font-sans">
                    {/* Airbrush Neon Glow */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-80"
                        style={{
                            background: 'radial-gradient(circle at 25% 45%, rgba(255, 24, 218, 0.75) 0%, rgba(185, 70, 248, 0.55) 35%, rgba(252, 95, 175, 0.3) 60%, transparent 75%)'
                        }}
                    />

                    {/* Top Micro Nav */}
                    <div className="relative z-10 flex items-center justify-between text-[8px] font-bold tracking-widest text-[#111111]">
                        <span>HERONDIR PRODUCTION ME</span>
                        <div className="flex items-center gap-3 text-neutral-600">
                            <span>HOME</span>
                            <span>ABOUT</span>
                            <span>ENG</span>
                        </div>
                    </div>

                    {/* Middle Stage: 019 + Central Model + Cross Mark */}
                    <div className="relative z-10 flex-1 flex items-center justify-between my-auto">
                        {/* 019 Headline */}
                        <div className="flex flex-col">
                            <span className="text-4xl sm:text-5xl font-black tracking-tighter text-[#0A0A0A] leading-none">
                                019
                            </span>
                            <span className="text-[7px] font-bold tracking-[0.2em] text-[#111111] uppercase mt-0.5">
                                AU CABARET SAUVAGE
                            </span>
                        </div>

                        {/* Central Model */}
                        <img
                            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788462734/fe3a66ef-196e-4220-acfd-7f5f170bdce9_y5ggt9.png"
                            alt="Featured Artist Model"
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 h-28 w-auto object-contain object-bottom drop-shadow-md z-20 pointer-events-none"
                            loading="lazy"
                            decoding="async"
                        />

                        {/* Right Cross Mark */}
                        <div className="relative w-8 h-8 flex items-center justify-center text-[7px] font-bold text-[#111111]">
                            <svg className="absolute inset-0 w-full h-full text-[#111111]" viewBox="0 0 54 54" fill="none">
                                <line x1="6" y1="6" x2="48" y2="48" stroke="currentColor" strokeWidth="2" />
                                <line x1="48" y1="6" x2="6" y2="48" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            <span className="absolute top-0 text-[6px]">MAI</span>
                            <span className="absolute left-0.5 text-[8px] font-black">0</span>
                            <span className="absolute right-0.5 text-[8px] font-black">2</span>
                            <span className="absolute bottom-0 text-[6px]">2014</span>
                        </div>
                    </div>

                    {/* Bottom Artist Strip */}
                    <div className="relative z-10 flex items-center justify-between text-[8px] font-black tracking-tight text-[#111111] border-t border-neutral-300 pt-1.5 uppercase">
                        <span>CARL CRAIG</span>
                        <span className="text-[#FF1CD6]">DJEBALI</span>
                        <span>NINA KRAVIZ</span>
                    </div>
                </div>
            );

        case 'dont-be-greedy':
            return (
                <div className="relative w-full h-full bg-[#050505] overflow-hidden flex flex-col justify-between select-none pointer-events-none p-2 sm:p-3 border border-[#161616] font-sans">
                    {/* Ambient Radial Spotlight */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-40"
                        style={{
                            background: 'radial-gradient(circle at 50% 35%, rgba(255,255,255,0.12) 0%, transparent 60%)',
                        }}
                    />
                    {/* Ambient Neon Lime Glow */}
                    <div className="absolute bottom-6 right-1/4 w-32 h-20 rounded-full bg-[#B8F500]/20 blur-2xl pointer-events-none" />

                    {/* Top Headline Typography: DON'T BE GREED */}
                    <div className="relative z-10 flex justify-between items-start w-full leading-[0.82] px-1 pt-1">
                        <div className="flex flex-col items-start">
                            <span
                                className="font-black tracking-[-0.035em] text-white uppercase text-[15px] sm:text-[18px]"
                                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                            >
                                DON'T
                            </span>
                            <span
                                className="font-black tracking-[-0.02em] text-white uppercase text-[6px] sm:text-[7px] leading-tight"
                                style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                            >
                                FOR THE KID
                            </span>
                        </div>
                        <span
                            className="font-black tracking-[-0.035em] text-white uppercase text-[15px] sm:text-[18px]"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                            BE
                        </span>
                        <span
                            className="font-black tracking-[-0.035em] text-white uppercase text-[15px] sm:text-[18px]"
                            style={{ fontFamily: "'Barlow Condensed', sans-serif" }}
                        >
                            GREED
                        </span>
                    </div>

                    {/* Center Stage: Dual 3D Vinyl Mascots */}
                    <div className="relative z-20 flex-1 flex items-end justify-center w-full min-h-0 -mb-2">
                        {/* Floor Contact Shadow */}
                        <div
                            className="absolute bottom-1 w-[70%] h-4 rounded-full opacity-90 blur-[6px] pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse 75% 35% at 50% 50%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.7) 45%, transparent 75%)',
                            }}
                        />

                        {/* Mascots Group */}
                        <div className="relative flex items-end justify-center h-full max-h-[145px]">
                            {/* Left Mascot */}
                            <img
                                src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788466181/349937f6-856e-4cab-a0da-92f91b81728c_iqhncx.png"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/char_left.png';
                                }}
                                alt="Horned Mascot"
                                className="h-[92%] w-auto object-contain object-bottom -mr-4 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-10 filter contrast-[1.05]"
                                loading="eager"
                                decoding="async"
                            />
                            {/* Right Mascot */}
                            <img
                                src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788466146/7f8c6e5b-5b63-4aaf-8478-805e391b879c_ntow6a.png"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/assets/char_right.png';
                                }}
                                alt="Streetwear Mascot"
                                className="h-[80%] w-auto object-contain object-bottom drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] z-10 filter contrast-[1.05]"
                                loading="eager"
                                decoding="async"
                            />
                        </div>
                    </div>

                    {/* Bottom Deckled Torn Paper Edge SVG */}
                    <div className="relative z-30 -mx-3 -mb-3 overflow-hidden">
                        <svg
                            viewBox="0 0 1440 100"
                            className="w-full h-5 filter drop-shadow-[0_-3px_6px_rgba(0,0,0,0.9)]"
                            preserveAspectRatio="none"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M0,100 L1440,100 L1440,35 Q1380,55 1320,30 Q1260,10 1200,40 Q1140,65 1080,35 Q1020,8 960,30 Q900,55 840,40 Q780,20 720,45 Q660,65 600,35 Q540,10 480,30 Q420,55 360,35 Q300,15 240,40 Q180,65 120,30 Q60,8 0,35 Z"
                                fill="#FFFFFF"
                            />
                        </svg>
                        {/* Micro Footnote Below Torn Edge */}
                        <div className="bg-[#FFFFFF] text-[#111111] px-2 py-0.5 flex items-center justify-between font-mono text-[6.5px] uppercase font-bold tracking-wider">
                            <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-[#B8F500] border border-black" />
                                <span>AKCB // VINYL 01</span>
                            </span>
                            <span className="text-[#666666]">EXHIBITION 2026</span>
                        </div>
                    </div>
                </div>
            );

        case 'paipai-kuaishou':
            return (
                <div 
                    className="relative w-full h-full overflow-hidden flex flex-col justify-between p-3 select-none pointer-events-none"
                    style={{
                        background: 'linear-gradient(180deg, #4CCBE8 0%, #59D1EA 30%, #D4F4FA 80%, #F2FAFC 100%)',
                    }}
                >
                    {/* Atmospheric Diffused Light */}
                    <div className="absolute top-[10%] left-[20%] w-36 h-36 rounded-full bg-white/25 blur-xl pointer-events-none" />

                    {/* Giant Ghost Watermark */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span 
                            className="text-white font-[900] uppercase tracking-tighter opacity-75 blur-[4px] select-none leading-none"
                            style={{ fontSize: '72px' }}
                        >
                            PAIPAI
                        </span>
                    </div>

                    {/* Top Bar Details */}
                    <div className="relative z-20 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/80 rounded-full border border-white/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#59D1EA] animate-pulse" />
                            <span className="text-[7.5px] font-mono font-bold tracking-widest text-white uppercase">
                                PAIPAI CULTURE
                            </span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-white text-black font-black text-[7.5px] uppercase tracking-wider border border-black shadow-[1px_1px_0px_0px_#000]">
                            #04
                        </span>
                    </div>

                    {/* Center Artwork: Mascot & Platform */}
                    <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                        <img
                            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788509773/4ede3e25-0ad7-46eb-95dd-06495341141b_zzgvpi.png"
                            alt="PAIPAI Snowboard Mascot"
                            className="w-32 h-auto object-contain filter drop-shadow-[0_8px_16px_rgba(15,45,70,0.2)] -mb-7 z-20"
                            loading="lazy"
                        />
                        <img
                            src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788509700/c0cfd993-d10d-4283-a9cf-6b3b2fbc29dd_j7ie6k.png"
                            alt="Island Platform"
                            className="w-28 h-auto object-contain filter drop-shadow-[0_6px_12px_rgba(10,50,75,0.2)] z-10"
                            loading="lazy"
                        />
                    </div>

                    {/* Bottom Editorial row */}
                    <div className="relative z-20 flex items-center justify-between font-mono text-[7px] font-bold text-[#050505] bg-white/75 backdrop-blur-xs px-2 py-1 rounded border border-black/20">
                        <span className="uppercase tracking-wider">KUAISHOU // 3D HERO</span>
                        <span className="text-[#1A1A1A] font-black tracking-widest">KID DESIGN</span>
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
