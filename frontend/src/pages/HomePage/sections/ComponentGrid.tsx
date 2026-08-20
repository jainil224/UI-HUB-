import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { componentList } from '../../../data/componentData';
import { ArrowUpRight, Sparkles, MonitorPlay, MousePointer2, Component as ComponentIcon } from 'lucide-react';
import ViewSourceButton from '../../../components/ui/ViewSourceButton';
import { useAuth } from '../../../context/AuthContext';

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
    '3d-scroll-animation',
    'black-hole-background',
    'fall-beam-background',
    'mouse-gravity-background',
    'corner-border-button',
    'orbit-button',
    'hacker-background',
    'beam-grid-background',
    'black-hole-cursor'
];

import { motion, Variants, AnimatePresence } from 'framer-motion';
import { useSkeleton } from '../../../context/SkeletonContext';
import { ComponentGridSkeleton } from '../../../components/ui/Skeleton';

const shadowVariants = [
    'brutal-shadow-blue',
    'brutal-shadow-red',
    'brutal-shadow-yellow',
    'brutal-shadow-white',
];

const ComponentGrid = () => {
    const { user, isPro } = useAuth();
    const { isLoading } = useSkeleton();
    const navigate = useNavigate();
    const [activeId, setActiveId] = useState<string | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = (id: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setActiveId(id);
        }, 150);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setActiveId(null);
    };

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

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08
            }
        }
    };

    const cardVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" }
        }
    };

    return (
        <section id="explore" className="relative py-24 md:py-32 px-4 sm:px-6 max-w-[1400px] mx-auto w-full bg-brand-bg">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative text-left mb-16 flex flex-col items-start z-10 max-w-4xl"
            >
                {/* Eyebrow Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-brand-surface text-white rounded-md font-black text-xs uppercase tracking-widest brutal-shadow-black">
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
                    <span>COMPONENT SHOWCASE</span>
                </div>

                <div className="border-2 border-white p-6 md:p-8 rounded-lg bg-brand-surface brutal-shadow-blue w-full">
                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight mb-4 text-white leading-none">
                        EXPLORE <span className="text-brand-blue">ELEMENTS</span>
                    </h2>
                    <p className="text-neutral-300 font-medium text-base md:text-lg max-w-2xl leading-relaxed">
                        A curated collection of beautifully crafted, highly interactive components ready for your next production project.
                    </p>
                </div>
            </motion.div>

            {/* Grid */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        key="grid-skeleton"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full relative z-10"
                    >
                        <ComponentGridSkeleton />
                    </motion.div>
                ) : (
                    <motion.div
                        key="grid-real"
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
                    >
                        {featuredComponents.map((comp, index) => {
                            const isActive = activeId === comp!.id;
                            const shadowClass = shadowVariants[index % shadowVariants.length];

                            return (
                                <motion.div
                                    key={comp!.id}
                                    variants={cardVariants}
                                    onClick={() => handleCardInteract(comp!.id)}
                                    onMouseEnter={() => handleMouseEnter(comp!.id)}
                                    onMouseLeave={handleMouseLeave}
                                    className={`group relative h-[270px] sm:h-[290px] md:h-[310px] bg-brand-surface border-2 border-white rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 ${shadowClass}`}
                                >
                                    {/* Card Top Traffic Bar */}
                                    <div className="relative z-30 flex items-center justify-between px-3.5 py-2.5 border-b-2 border-neutral-800 bg-[#0A0A0E]">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2.5 h-2.5 rounded-full bg-brand-red border border-black" />
                                            <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
                                            <span className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 ml-1 truncate max-w-[120px]">
                                                {comp?.category || 'UI'}
                                            </span>
                                        </div>

                                        {/* PRO Badge */}
                                        {comp!.isPremium && !isPro && (
                                            <div className="px-2 py-0.5 rounded border border-black bg-brand-yellow text-black text-[9px] font-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
                                                PRO
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview / Placeholder Area */}
                                    <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-transparent to-black/40">
                                        {/* Subtle Grid texture */}
                                        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                                        {isActive ? (
                                            <div
                                                className="absolute inset-0 w-full h-full animate-in fade-in duration-300 overflow-hidden"
                                                style={{ pointerEvents: 'auto' }}
                                            >
                                                <div className="w-full h-full flex items-center justify-center transform scale-[0.8] md:scale-[0.85] origin-center relative">
                                                    <React.Suspense fallback={
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                            <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    }>
                                                        {comp!.preview()}
                                                    </React.Suspense>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 transition-transform duration-150 group-hover:scale-105 z-10">
                                                <div className="w-12 h-12 rounded-lg border-2 border-white bg-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000] group-hover:border-brand-blue transition-colors">
                                                    {getCategoryIcon(comp?.category, comp?.id)}
                                                </div>
                                                <span className="text-[10px] uppercase tracking-widest font-black text-neutral-300 bg-black/60 px-2.5 py-1 rounded border border-neutral-800">
                                                    <span className="md:hidden">TAP TO INTERACT</span>
                                                    <span className="hidden md:inline">HOVER TO INTERACT</span>
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom bar: title + arrow */}
                                    <div className="relative z-30 flex items-center justify-between px-4 py-3 bg-[#0A0A0E] border-t-2 border-white">
                                        <span className="text-xs uppercase font-black tracking-wider text-white truncate mr-2">
                                            {comp!.title}
                                        </span>
                                        <div className="w-6 h-6 rounded border border-white bg-brand-surface flex items-center justify-center group-hover:bg-brand-blue group-hover:border-black transition-colors shrink-0 shadow-[1px_1px_0px_0px_#000]">
                                            <ArrowUpRight size={14} className="text-white" />
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile / Global CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16 flex justify-center z-10 relative"
            >
                <button
                    onClick={() => navigate('/library')}
                    className="brutal-btn-primary px-10 py-4 text-xs font-black tracking-widest flex items-center gap-3"
                >
                    <span>VIEW ALL COMPONENTS</span>
                    <ArrowUpRight size={16} />
                </button>
            </motion.div>
        </section>
    );
};

export default ComponentGrid;
