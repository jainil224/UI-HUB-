import React from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight } from 'lucide-react';

// We'll pick a curated subset of components that look good in a small grid
const showcaseIds = [
    'sparkles-background',
    'lines-background',
    'wave-background',
    'particles-background',
    'interactive-grid-background',
    'hell-background',
    'liquid-glass',
    'spotlight-cards',
    'beam-grid-background',
    'wavy-text',
    'isometric-grid-background',
    'blocks'
];

const ComponentGrid = () => {
    const navigate = useNavigate();
    const [activeId, setActiveId] = React.useState<string | null>(null);

    const featuredComponents = showcaseIds.map(id => componentList.find(c => c.id === id)).filter(Boolean);

    const handleCardInteract = (id: string) => {
        // On mobile tap: toggle preview; on desktop this fires after mouseenter already set it
        setActiveId(prev => (prev === id ? null : id));
    };

    return (
        <section className="py-16 md:py-24 px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-10 md:mb-16 px-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-3 md:mb-4">
                    Explore Elements
                </h2>
                <p className="text-white/60 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
                    A collection of beautifully crafted, highly interactive components built to elevate your next project.
                </p>
            </div>

            {/* Grid — 2 cols on mobile, 3 on md, 4 on lg */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {featuredComponents.map((comp) => {
                    const isActive = activeId === comp!.id;
                    return (
                        <div
                            key={comp!.id}
                            onClick={() => handleCardInteract(comp!.id)}
                            onMouseEnter={() => setActiveId(comp!.id)}
                            onMouseLeave={() => setActiveId(null)}
                            className="group relative h-[180px] sm:h-[240px] md:h-[280px] lg:h-[320px] bg-[#0A0A0A] rounded-2xl md:rounded-3xl border border-white/[0.05] overflow-hidden flex items-center justify-center active:scale-[0.98] hover:bg-[#111111] hover:border-white/[0.1] transition-all duration-300 cursor-pointer select-none"
                        >
                            {/* Preview / Placeholder */}
                            <div className="w-full h-full flex items-center justify-center absolute inset-0 z-10 overflow-hidden">
                                {isActive ? (
                                    <div className="w-full h-full">
                                        {comp!.preview()}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 sm:gap-3 opacity-30 transition-opacity duration-300">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl border border-white/20 flex items-center justify-center">
                                            <span className="text-xs sm:text-sm font-bold">{comp!.id.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="text-[8px] sm:text-[10px] uppercase tracking-widest font-medium text-center px-2">
                                            {/* Show "tap" on touch devices, "hover" on desktop */}
                                            <span className="md:hidden">Tap to preview</span>
                                            <span className="hidden md:inline">Hover to preview</span>
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Bottom bar: title + arrow */}
                            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none">
                                <span className="text-[8px] sm:text-[10px] uppercase font-bold tracking-[0.15em] sm:tracking-[0.2em] text-white/60 group-hover:text-white/90 transition-colors duration-300 truncate mr-2">
                                    {comp!.title}
                                </span>
                                <ArrowUpRight
                                    size={12}
                                    className="shrink-0 text-white/30 group-hover:text-brand-green transition-colors duration-300"
                                />
                            </div>

                            {/* Active ring */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-2xl md:rounded-3xl ring-1 ring-brand-green/20 pointer-events-none z-30" />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile CTA */}
            <div className="mt-8 md:mt-12 flex justify-center">
                <button
                    onClick={() => navigate('/library')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-xs font-bold uppercase tracking-widest transition-all duration-300 active:scale-95"
                >
                    View All Components
                    <ArrowUpRight size={14} />
                </button>
            </div>
        </section>
    );
};

export default ComponentGrid;
