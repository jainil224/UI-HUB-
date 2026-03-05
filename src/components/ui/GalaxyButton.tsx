"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface GalaxyButtonProps {
    label?: string;
    className?: string;
    onClick?: () => void;
}

export const GalaxyButton = ({
    label = "Galaxy Button",
    className,
    onClick,
}: GalaxyButtonProps) => {
    // Generate random stars for the background
    const stars = Array.from({ length: 30 }).map((_, i) => ({
        id: i,
        size: Math.random() * 2 + 1,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
    }));

    return (
        <div className="relative flex items-center justify-center p-20">
            <motion.button
                onClick={onClick}
                whileHover="hover"
                initial="initial"
                className={cn(
                    "relative px-10 py-4 rounded-full overflow-hidden border border-white/10",
                    "bg-neutral-950 text-white font-bold tracking-wider uppercase transition-all duration-300",
                    "flex items-center justify-center min-w-[180px] shadow-2xl",
                    className
                )}
            >
                {/* Cosmic Background Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-purple-900 to-black opacity-80" />

                {/* Animated Nebula Glows */}
                <motion.div
                    className="absolute inset-x-[-50%] inset-y-[-50%] bg-gradient-to-r from-blue-500/20 via-pink-500/20 to-purple-500/20 blur-3xl"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* Star Particles */}
                <div className="absolute inset-0 z-0">
                    {stars.map((star) => (
                        <motion.div
                            key={star.id}
                            className="absolute bg-white rounded-full opacity-40"
                            style={{
                                width: star.size,
                                height: star.size,
                                top: star.top,
                                left: star.left,
                            }}
                            animate={{
                                opacity: [0.2, 0.8, 0.2],
                                scale: [1, 1.5, 1],
                                x: [0, (Math.random() - 0.5) * 20],
                                y: [0, (Math.random() - 0.5) * 20],
                            }}
                            variants={{
                                hover: {
                                    transition: {
                                        duration: star.duration * 0.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    },
                                },
                            }}
                            transition={{
                                duration: star.duration,
                                repeat: Infinity,
                                delay: star.delay,
                                ease: "easeInOut",
                            }}
                        />
                    ))}
                </div>

                {/* Label */}
                <span className="relative z-20 mix-blend-difference">{label}</span>

                {/* Outer Glow Effect on Hover */}
                <motion.div
                    className="absolute inset-0 rounded-full border border-white/30 z-10"
                    variants={{
                        initial: { opacity: 0, scale: 0.9 },
                        hover: { opacity: 1, scale: 1.05 },
                    }}
                    transition={{ duration: 0.3 }}
                />

                {/* Diffused Outer Glow Shadow */}
                <motion.div
                    className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-xl"
                    variants={{
                        initial: { opacity: 0, scale: 0.8 },
                        hover: { opacity: 0.5, scale: 1.1 },
                    }}
                    transition={{ duration: 0.4 }}
                />

                {/* Glassy Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-10" />
            </motion.button>
        </div>
    );
};
