import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight, Sparkles, MonitorPlay, MousePointer2, Component as ComponentIcon } from 'lucide-react';

const getCategoryIcon = (category?: string, id?: string) => {
    const className = "text-white/40 group-hover:text-white/90 transition-colors duration-500 group-hover:scale-110";
    if (category === 'background' || id?.includes('background')) return <MonitorPlay size={22} className={className} />;
    if (category === 'cursor' || id?.includes('cursor')) return <MousePointer2 size={22} className={className} />;
    return <ComponentIcon size={22} className={className} />;
};

// We'll pick a curated subset of components that look good in a small grid
const showcaseIds = [
    'robot-3d-background',
    'lines-background',
    'isometric-grid-background',
    'target-cursor',
    'black-hole-background',
    'fall-beam-background',
    'mouse-gravity-background',
    'corner-border-button',
    'orbit-button',
    'hacker-background',
    'beam-grid-background',
    'black-hole-cursor'
];

import { motion } from 'framer-motion';

const ComponentGrid = () => {
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState<string | null>(null);

    const featuredComponents = showcaseIds
        .map(id => componentList.find(c => c.id === id))
        .filter(Boolean);

    const handleCardInteract = (id: string) => {
        if (activeId === id) {
            navigate(`/library?id=${id}`);
            window.scrollTo(0, 0);
        } else {
            setActiveId(id);
        }
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
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: "easeOut" }
        }
    };

    return (
        <section id="explore" className="relative py-20 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto w-full">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[200px] md:h-[300px] bg-brand-green/10 blur-[100px] md:blur-[120px] rounded-full pointer-events-none opacity-50" />

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="relative text-center mb-14 md:mb-20 px-2 flex flex-col items-center z-10"
            >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#050505] border border-white/[0.05] mb-6 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                    <span className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] text-white/60 uppercase">Component Showcase</span>
                </div>

                <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[5rem] font-display font-black uppercase tracking-widest mb-4 md:mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-300 to-gray-600 drop-shadow-sm" style={{ transform: 'scaleX(1.1)' }}>
                    Explore Elements
                </h2>

                <p className="text-white/40 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-light">
                    A collection of beautifully crafted, highly interactive components built to<br className="hidden md:block" /> elevate your next production-ready project.
                </p>
            </motion.div>

            {/* Grid */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 relative z-10"
            >
                {featuredComponents.map((comp) => {
                    const isActive = activeId === comp!.id;
                    return (
                        <motion.div
                            key={comp!.id}
                            variants={cardVariants}
                            onClick={() => handleCardInteract(comp!.id)}
                            onMouseEnter={() => setActiveId(comp!.id)}
                            onMouseLeave={() => setActiveId(null)}
                            className="group relative h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px] bg-[#030303] rounded-3xl overflow-hidden flex items-center justify-center cursor-pointer select-none transition-all duration-500 hover:-translate-y-2 isolate"
                            style={{
                                WebkitMaskImage: '-webkit-radial-gradient(white, black)'
                            }}
                        >
                            {/* Inner border and shadow */}
                            <div className="absolute inset-0 rounded-3xl ring-1 ring-white/[0.03] group-hover:ring-white/[0.08] transition-all duration-500 z-30 pointer-events-none" />

                            {/* subtle gradient hover background */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

                            {/* Preview / Placeholder */}
                            <div className="w-full h-full flex items-center justify-center absolute inset-0 z-20 overflow-hidden rounded-3xl">
                                {isActive ? (
                                    <div
                                        className="absolute inset-0 w-full h-full animate-in fade-in duration-500 overflow-hidden"
                                        style={{
                                            pointerEvents: 'auto',
                                        }}
                                    >
                                        <div className="w-full h-full flex items-center justify-center transform scale-[0.8] md:scale-[0.85] origin-center">
                                            {comp!.preview()}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 transition-all duration-500 group-hover:scale-105">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-[14px] border border-white/[0.05] bg-[#050505] flex items-center justify-center group-hover:border-white/10 transition-all duration-500">
                                            {getCategoryIcon(comp?.category, comp?.id)}
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[8px] md:text-[9px] uppercase tracking-[0.3em] font-bold text-white/20 group-hover:text-brand-green/60 transition-colors duration-500">
                                                <span className="md:hidden">TAP TO INTERACT</span>
                                                <span className="hidden md:inline">HOVER TO INTERACT</span>
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Bottom bar: title + arrow */}
                            <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-5 pointer-events-none">
                                <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-white/30 group-hover:text-white/70 transition-colors duration-500 truncate mr-3">
                                    {comp!.title}
                                </span>
                                <div className="w-7 h-7 rounded-full border border-white/5 bg-[#030303] flex items-center justify-center group-hover:border-white/15 group-hover:bg-brand-green/10 transition-all duration-500">
                                    <ArrowUpRight
                                        size={12}
                                        className="shrink-0 text-white/20 group-hover:text-brand-green transition-colors duration-500"
                                    />
                                </div>
                            </div>

                            {/* Active border glow */}
                            {isActive && (
                                <div className="absolute inset-0 rounded-3xl ring-1 ring-brand-green/20 shadow-[0_0_30px_-5px_var(--color-brand-green,rgba(255,255,26,0.1))] pointer-events-none z-40 transition-all duration-500 opacity-50" />
                            )}
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Mobile / Global CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 md:mt-24 flex justify-center z-10 relative"
            >
                <button
                    onClick={() => navigate('/library')}
                    className="group relative flex items-center gap-3 px-8 py-3.5 rounded-full border border-white/[0.05] hover:border-brand-green/30 transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-md bg-black/50"
                >
                    <span className="text-white/60 group-hover:text-white text-[11px] font-bold uppercase tracking-[0.25em] transition-colors duration-500 relative z-10">
                        View All Components
                    </span>
                    <ArrowUpRight size={14} className="text-white/40 group-hover:text-brand-green transition-colors duration-500 relative z-10" />
                </button>
            </motion.div>
        </section>
    );
};

export default ComponentGrid;
