import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight, Sparkles } from 'lucide-react';

// We'll pick a curated subset of components that look good in a small grid
const showcaseIds = [
    'robot-3d-background',
    'lines-background',
    'isometric-grid-background',
    'target-cursor',
    'black-hole-background',
    'stripe-mesh-background',
    'mouse-gravity-background',
    'corner-border-button',
    'orbit-button'
];

const ComponentGrid = () => {
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState<string | null>(null);

    const featuredComponents = showcaseIds
        .map(id => componentList.find(c => c.id === id))
        .filter(Boolean);

    const handleCardInteract = (id: string) => {
        // On mobile tap: toggle preview; on desktop this fires after mouseenter already set it
        setActiveId(prev => (prev === id ? null : id));
    };

    return (
        <section className="relative py-20 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[300px] bg-brand-green/10 blur-[100px] md:blur-[120px] rounded-full pointer-events-none opacity-50" />

            {/* Header */}
            <div className="relative text-center mb-14 md:mb-20 px-2 flex flex-col items-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6 shadow-sm shadow-[rgba(255,255,255,0.02)]">
                    <Sparkles className="w-4 h-4 text-brand-green" />
                    <span className="text-[10px] md:text-xs font-semibold tracking-widest text-white/80 uppercase">Component Showcase</span>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold uppercase tracking-tighter mb-5 md:mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30">
                    Explore Elements
                </h2>

                <p className="text-white/50 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                    A collection of beautifully crafted, highly interactive components built to elevate your next production-ready project.
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 relative z-10">
                {featuredComponents.map((comp) => {
                    const isActive = activeId === comp!.id;
                    return (
                        <div
                            key={comp!.id}
                            onClick={() => handleCardInteract(comp!.id)}
                            onMouseEnter={() => setActiveId(comp!.id)}
                            onMouseLeave={() => setActiveId(null)}
                            className="group relative h-[220px] sm:h-[260px] md:h-[300px] bg-[#050505] rounded-[24px] overflow-hidden flex items-center justify-center cursor-pointer select-none transition-all duration-500 hover:-translate-y-1"
                        >
                            {/* Inner border and shadow */}
                            <div className="absolute inset-0 rounded-[24px] ring-1 ring-white/[0.05] group-hover:ring-white/[0.15] group-hover:shadow-[inset_0px_0px_30px_rgba(255,255,255,0.02)] transition-all duration-500 z-30 pointer-events-none" />

                            {/* subtle gradient hover background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                            {/* Preview / Placeholder */}
                            <div className="w-full h-full flex items-center justify-center absolute inset-0 z-20 overflow-hidden">
                                {isActive ? (
                                    <div className="w-full h-full animate-in fade-in duration-500">
                                        {comp!.preview()}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 sm:gap-4 transition-all duration-500 group-hover:scale-105">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center justify-center group-hover:border-white/10 group-hover:bg-white/[0.03] transition-all duration-500 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                            <span className="text-sm md:text-base font-bold text-white/30 group-hover:text-white/60 transition-colors duration-500">
                                                {comp!.id.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 mt-1">
                                            <span className="text-[9px] md:text-[11px] uppercase tracking-[0.25em] font-medium text-white/30 group-hover:text-white/60 transition-colors duration-500">
                                                <span className="md:hidden">Tap to interact</span>
                                                <span className="hidden md:inline">Hover to interact</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom bar: title + arrow */}
                            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none translate-y-3 group-hover:translate-y-0 opacity-80 group-hover:opacity-100 transition-all duration-500">
                                <span className="text-[10px] sm:text-xs uppercase font-medium tracking-[0.15em] sm:tracking-[0.2em] text-white/50 group-hover:text-white/90 transition-colors duration-500 truncate mr-3">
                                    {comp!.title}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white/[0.03] border border-white/[0.05] flex items-center justify-center group-hover:bg-white/[0.1] group-hover:border-white/[0.2] transition-all duration-500">
                                    <ArrowUpRight
                                        size={14}
                                        className="shrink-0 text-white/40 group-hover:text-white transition-colors duration-500"
                                    />
                                </div>
                            </div>

                            {/* Active border glow */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-[24px] ring-1 ring-brand-green/30 shadow-[0_0_30px_-5px_var(--color-brand-green,rgba(255,255,255,0.1))] pointer-events-none z-40 transition-all duration-500" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile / Global CTA */}
            <div className="mt-16 md:mt-24 flex justify-center z-10 relative">
                <button
                    onClick={() => navigate('/library')}
                    className="group relative flex items-center gap-3 px-8 py-4 rounded-full bg-black border border-white/[0.08] hover:border-white/[0.2] hover:bg-[#080808] transition-all duration-500 active:scale-95 overflow-hidden shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.1)] cursor-pointer"
                >
                    {/* Button hover glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

                    <span className="text-white/70 group-hover:text-white text-xs md:text-sm font-bold uppercase tracking-[0.2em] transition-colors duration-500 relative z-10">
                        View All Components
                    </span>
                    <ArrowUpRight size={16} className="text-white/40 group-hover:text-white transition-colors duration-500 relative z-10" />
                </button>
            </div>
        </section>
    );
};

export default ComponentGrid;
