"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";
import { ArrowLeft, ArrowRight } from "lucide-react";

export interface TestimonialItem {
    /** Unique identifier for the card */
    id: string | number;
    /** Title displayed for the card */
    title: string;
    /** Description text for the card */
    description: string;
    /** Image URL/path for the card */
    image: string;
}

export interface TestimonialsCardProps {
    /** Array of testimonial items to display */
    items?: TestimonialItem[];
    /** Additional CSS classes for the container */
    className?: string;
    /** Width of the card stack (default: 550) */
    width?: number;
    /** Whether to show navigation arrows (default: true) */
    showNavigation?: boolean;
    /** Whether to show the counter (default: true) */
    showCounter?: boolean;
    /** Whether to enable auto-play (default: false) */
    autoPlay?: boolean;
    /** Auto-play interval in ms (default: 3000) */
    autoPlayInterval?: number;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
    {
        id: 1,
        title: "Sarah Jenkins",
        description: "The UI-HUB animation library accelerated our landing page rebuild by 300%. The depth of 3D shaders and motion physics is unmatched in modern web design.",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        title: "Alexander Wright",
        description: "Every component is drop-in ready with zero friction. The Framer Motion physics and WebGL shaders make our design systems look like a $100k studio build.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        title: "Elena Rostova",
        description: "The creative interactions, especially the carousels and spatial image cards, gave our agency's portfolio awards recognition within weeks.",
        image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        title: "Marcus Vance",
        description: "Finding production-tested React Three Fiber and Three.js scenes with complete copy-paste code prompts saved us hundreds of engineering hours.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80"
    }
];

export function TestimonialsCard({
    items = DEFAULT_TESTIMONIALS,
    className,
    width = 560,
    showNavigation = true,
    showCounter = true,
    autoPlay = false,
    autoPlayInterval = 3500,
}: TestimonialsCardProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [direction, setDirection] = useState(1);

    const activeItem = items[activeIndex] || items[0];

    // Auto-play effect
    React.useEffect(() => {
        if (!autoPlay || items.length <= 1) return;

        const interval = setInterval(() => {
            setDirection(1);
            setActiveIndex((prev) => (prev + 1) % items.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, items.length]);

    const handleNext = () => {
        if (activeIndex < items.length - 1) {
            setDirection(1);
            setActiveIndex(activeIndex + 1);
        }
    };

    const handlePrev = () => {
        if (activeIndex > 0) {
            setDirection(-1);
            setActiveIndex(activeIndex - 1);
        }
    };

    // Pre-calculate rotations for visual variety
    const rotations = useMemo(() => [4, -2, -9, 7], []);

    if (!items || items.length === 0) {
        return null;
    }

    return (
        <div className={cn("flex items-center justify-center p-6 md:p-8 w-full select-none", className)}>
            <div
                className="relative grid grid-cols-1 md:grid-cols-[1fr_1fr] md:grid-rows-[auto_auto_auto] gap-x-8 gap-y-4 w-full items-center"
                style={{ perspective: "1400px", maxWidth: `${width}px` }}
            >
                {/* Counter */}
                {showCounter && (
                    <div className="row-start-1 md:col-start-2 md:row-start-1 text-right font-mono text-xs font-bold text-brand-blue uppercase tracking-widest">
                        {activeIndex + 1} / {items.length}
                    </div>
                )}

                {/* Image Card Stack */}
                <div className="row-start-2 col-start-1 md:row-start-1 row-span-3 relative w-full aspect-square max-w-[260px] mx-auto md:max-w-none">
                    <AnimatePresence custom={direction}>
                        {items.map((item, index) => {
                            const isActive = index === activeIndex;
                            const offset = index - activeIndex;

                            return (
                                <motion.div
                                    key={item.id}
                                    className="absolute inset-0 w-full h-full overflow-hidden border-[4px] bg-neutral-900 border-white/20 shadow-2xl rounded-2xl"
                                    initial={{
                                        x: offset * 15,
                                        y: Math.abs(offset) * 6,
                                        z: -150 * Math.abs(offset),
                                        scale: 0.85 - Math.abs(offset) * 0.04,
                                        rotateZ: rotations[index % 4],
                                        opacity: isActive ? 1 : 0.5,
                                        zIndex: 10 - Math.abs(offset),
                                    }}
                                    animate={
                                        isActive
                                            ? {
                                                x: [offset * 15, direction === 1 ? -160 : 160, 0],
                                                y: [Math.abs(offset) * 6, 0, 0],
                                                z: [-200, 150, 250],
                                                scale: [0.85, 1.05, 1],
                                                rotateZ: [rotations[index % 4], -5, 0],
                                                opacity: 1,
                                                zIndex: 100,
                                            }
                                            : {
                                                x: offset * 15,
                                                y: Math.abs(offset) * 6,
                                                z: -150 * Math.abs(offset),
                                                rotateZ: rotations[index % 4],
                                                scale: 0.85 - Math.abs(offset) * 0.04,
                                                opacity: 0.55,
                                                zIndex: 10 - Math.abs(offset),
                                            }
                                    }
                                    exit={{
                                        x: direction === 1 ? -220 : 220,
                                        z: -260,
                                        scale: 0.75,
                                        rotateZ: direction === 1 ? -10 : 10,
                                        opacity: 0,
                                    }}
                                    transition={{
                                        duration: 0.75,
                                        ease: [0.22, 1, 0.36, 1],
                                    }}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Text Area */}
                <div className="col-start-1 md:col-start-2 md:row-start-2 flex flex-col justify-center min-h-[140px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeItem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.35 }}
                        >
                            <h3 className="text-xl font-black font-display tracking-tight text-white uppercase drop-shadow">
                                {activeItem.title}
                            </h3>
                            <p className="text-xs md:text-sm text-neutral-300 font-medium leading-relaxed mt-2.5">
                                "{activeItem.description}"
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                {showNavigation && items.length > 1 && (
                    <div className="col-start-1 md:col-start-2 md:row-start-3 flex gap-3 mt-2 md:mt-4">
                        <button
                            disabled={activeIndex === 0}
                            onClick={handlePrev}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900/80 text-white backdrop-blur-md transition-all cursor-pointer",
                                activeIndex === 0
                                    ? "opacity-35 cursor-not-allowed"
                                    : "hover:bg-brand-blue hover:border-brand-blue hover:scale-105"
                            )}
                            aria-label="Previous card"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button
                            disabled={activeIndex === items.length - 1}
                            onClick={handleNext}
                            className={cn(
                                "flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900/80 text-white backdrop-blur-md transition-all cursor-pointer",
                                activeIndex === items.length - 1
                                    ? "opacity-35 cursor-not-allowed"
                                    : "hover:bg-brand-blue hover:border-brand-blue hover:scale-105"
                            )}
                            aria-label="Next card"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default TestimonialsCard;
