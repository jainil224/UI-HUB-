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
    // Multi-layered star system for parallax/depth
    const layers = [
        { count: 15, size: 1, duration: 20, opacity: 0.3 },
        { count: 12, size: 1.5, duration: 15, opacity: 0.5 },
        { count: 8, size: 2, duration: 10, opacity: 0.7 },
    ];

    return (
        <div className="relative flex items-center justify-center p-20">
            <motion.button
                onClick={onClick}
                whileHover="hover"
                initial="initial"
                className={cn(
                    "relative px-12 py-5 rounded-full overflow-hidden group",
                    "bg-neutral-950 text-white font-black tracking-[0.2em] uppercase transition-all duration-500",
                    "flex items-center justify-center min-w-[220px] shadow-2xl",
                    "border border-white/5",
                    className
                )}
            >
                {/* 1. Base Cosmic Background */}
                <div className="absolute inset-0 bg-[#020205]" />

                {/* 2. Animated Conic Gradient Border (Premium Glow) */}
                <motion.div
                    className="absolute inset-[-100%] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    style={{
                        background: "conic-gradient(from 0deg, transparent 0%, #3b82f6 25%, #a855f7 50%, #ec4899 75%, transparent 100%)",
                    }}
                />

                {/* 3. Nebula Layers (Infinite Drift) */}
                <motion.div
                    className="absolute inset-x-[-50%] inset-y-[-50%] bg-gradient-to-tr from-blue-600/20 via-transparent to-pink-600/20 blur-[60px]"
                    animate={{
                        x: ["-10%", "10%"],
                        y: ["-10%", "10%"],
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                <motion.div
                    className="absolute inset-x-[-50%] inset-y-[-50%] bg-gradient-to-bl from-purple-600/10 via-transparent to-indigo-600/10 blur-[40px]"
                    animate={{
                        x: ["10%", "-10%"],
                        y: ["10%", "-10%"],
                        rotate: [360, 0],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />

                {/* 4. Multi-Layered Rotating Star Field */}
                {layers.map((layer, lIdx) => (
                    <motion.div
                        key={lIdx}
                        className="absolute inset-[-50%]"
                        animate={{ rotate: layer.duration > 0 ? 360 : 0 }}
                        transition={{
                            duration: layer.duration,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                    >
                        {Array.from({ length: layer.count }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute bg-white rounded-full shadow-[0_0_8px_white]"
                                style={{
                                    width: layer.size,
                                    height: layer.size,
                                    top: `${Math.random() * 100}%`,
                                    left: `${Math.random() * 100}%`,
                                    opacity: layer.opacity,
                                }}
                                animate={{
                                    opacity: [layer.opacity, 1, layer.opacity],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{
                                    duration: 2 + Math.random() * 3,
                                    repeat: Infinity,
                                    delay: Math.random() * 2,
                                }}
                            />
                        ))}
                    </motion.div>
                ))}

                {/* 5. Interactive Light Sweep (Shimmer) */}
                <motion.div
                    className="absolute inset-0 z-20 pointer-events-none"
                    variants={{
                        initial: { x: "-150%", skewX: -45 },
                        hover: {
                            x: "150%",
                            transition: {
                                repeat: Infinity,
                                repeatDelay: 1.5,
                                duration: 1.2,
                                ease: "easeInOut"
                            }
                        }
                    }}
                >
                    <div className="w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent blur-xl" />
                </motion.div>

                {/* 6. Button Surface Shadow Inner */}
                <div className="absolute inset-[2px] rounded-full bg-[#020205] z-10 overflow-hidden">
                    {/* Re-rendering star field inside the inner mask for crispness if desired, 
                        but here we just let the outer ones show through if we make this slightly transparent.
                        For a premium look, we'll keep the stars behind the glass mask.
                    */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                </div>

                {/* 7. Label */}
                <span className="relative z-30 mix-blend-difference font-black">
                    {label}
                </span>

                {/* 8. Premium Outer Glow (Aura) */}
                <motion.div
                    className="absolute inset-0 -z-10 rounded-full blur-2xl opacity-0 scale-90"
                    style={{
                        background: "radial-gradient(circle, rgba(168,85,247,0.6) 0%, rgba(59,130,246,0.3) 50%, transparent 100%)"
                    }}
                    variants={{
                        hover: { opacity: 0.8, scale: 1.2 }
                    }}
                    transition={{ duration: 0.5 }}
                />

                {/* Glass Polish Overlay */}
                <div className="absolute inset-0 z-40 border border-white/10 rounded-full pointer-events-none" />
            </motion.button>
        </div>
    );
};
