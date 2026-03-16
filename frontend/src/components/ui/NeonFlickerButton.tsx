"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface NeonFlickerButtonProps {
    label?: string;
    className?: string;
    onClick?: () => void;
    color?: "blue" | "pink" | "purple" | "cyan" | "red";
}

export const NeonFlickerButton = ({
    label = "Neon Flicker",
    className,
    onClick,
    color = "red",
}: NeonFlickerButtonProps) => {
    const [isClicked, setIsClicked] = React.useState(false);

    const handleClick = () => {
        setIsClicked(true);
        if (onClick) onClick();
        setTimeout(() => setIsClicked(false), 600);
    };

    const themes = {
        blue: {
            text: "#60a5fa",
            glow: "rgba(59, 130, 246, 0.6)",
            hoverGlow: "rgba(59, 130, 246, 0.9)",
            border: "rgba(59, 130, 246, 0.5)",
        },
        pink: {
            text: "#f472b6",
            glow: "rgba(236, 72, 153, 0.6)",
            hoverGlow: "rgba(236, 72, 153, 0.9)",
            border: "rgba(236, 72, 153, 0.5)",
        },
        purple: {
            text: "#c084fc",
            glow: "rgba(168, 85, 247, 0.6)",
            hoverGlow: "rgba(168, 85, 247, 0.9)",
            border: "rgba(168, 85, 247, 0.5)",
        },
        cyan: {
            text: "#22d3ee",
            glow: "rgba(34, 211, 238, 0.6)",
            hoverGlow: "rgba(34, 211, 238, 0.9)",
            border: "rgba(34, 211, 238, 0.5)",
        },
        red: {
            text: "#ff0000",
            glow: "rgba(255, 0, 0, 0.7)",
            hoverGlow: "rgba(255, 0, 0, 1)",
            border: "rgba(255, 0, 0, 0.6)",
        },
    };

    const theme = themes[color] || themes.pink;

    return (
        <div className="relative flex items-center justify-center p-8">
            <motion.button
                onClick={handleClick}
                whileHover="hover"
                whileTap="tap"
                initial="initial"
                className={cn(
                    "relative px-12 py-5 rounded-full border-2 transition-all duration-300 group overflow-hidden",
                    "bg-black/20 backdrop-blur-sm font-black tracking-[0.3em] uppercase",
                    "flex items-center justify-center min-w-[240px]",
                    "hover:scale-110 active:scale-95",
                    className
                )}
                style={{
                    borderColor: theme.border,
                    color: theme.text,
                    boxShadow: isClicked
                        ? `0 0 60px ${theme.hoverGlow}, inset 0 0 30px ${theme.hoverGlow}`
                        : `0 0 15px ${theme.glow}, inset 0 0 10px ${theme.glow}`,
                }}
                animate={{
                    boxShadow: isClicked
                        ? `0 0 70px ${theme.hoverGlow}, inset 0 0 40px ${theme.hoverGlow}`
                        : undefined
                }}
                variants={{
                    hover: {
                        boxShadow: `0 0 35px ${theme.hoverGlow}, inset 0 0 20px ${theme.hoverGlow}`,
                    },
                    tap: {
                        scale: 0.9,
                    }
                }}
            >
                {/* Random Neon Flicker Layer */}
                <motion.div
                    className="absolute inset-0 z-0"
                    animate={{
                        opacity: [1, 0.4, 1, 0.7, 1, 0.3, 1],
                    }}
                    transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 4 + 1,
                        ease: "easeInOut",
                    }}
                >
                    {/* Inner Intense Glow Overlay */}
                    <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundColor: theme.text }}
                    />
                </motion.div>

                {/* Light Sweep Effect */}
                <motion.div
                    className="absolute inset-0 z-10 pointer-events-none"
                    variants={{
                        initial: { x: "-150%", skewX: -45 },
                        hover: {
                            x: "150%",
                            transition: {
                                repeat: Infinity,
                                repeatDelay: 0.8,
                                duration: 1.2,
                                ease: "easeInOut"
                            }
                        }
                    }}
                >
                    <div className="w-20 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent blur-xl" />
                </motion.div>

                {/* Label with digital micro-flicker */}
                <motion.span
                    className="relative z-20 text-xl font-black italic tracking-[0.4em]"
                    animate={{
                        opacity: isClicked
                            ? [1, 0, 1, 0, 1, 0.5, 1]
                            : [1, 0.9, 1, 0.2, 1, 0, 1, 0.8, 1], // Enhanced random flicker
                        textShadow: isClicked
                            ? [
                                `0 0 20px ${theme.hoverGlow}`,
                                `0 0 40px ${theme.hoverGlow}`,
                                `0 0 10px ${theme.hoverGlow}`
                            ]
                            : [
                                `0 0 10px ${theme.glow}`,
                                `0 0 15px ${theme.hoverGlow}`,
                                `0 0 5px ${theme.glow}`,
                            ],
                        x: isClicked ? [0, -4, 4, -2, 2, 0] : [0, -0.5, 0.5, 0]
                    }}
                    transition={{
                        duration: isClicked ? 0.05 : 0.15,
                        repeat: Infinity,
                        repeatDelay: isClicked ? 0 : Math.random() * 2,
                        ease: "easeInOut"
                    }}
                >
                    {label}
                </motion.span>

                {/* Periodic "Power Struggle" Blink Overlay */}
                <motion.div
                    className="absolute inset-0 z-30 bg-black pointer-events-none"
                    animate={{
                        opacity: [0, 0, 1, 0, 1, 0, 0]
                    }}
                    transition={{
                        duration: 0.4,
                        repeat: Infinity,
                        repeatDelay: 6, // Blinks out every 6 seconds
                        ease: "linear"
                    }}
                />

                {/* Hacker Scanline & Digital Grain Effect */}
                <div className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,4px_100%]" />

                {/* Random Glitch Blocks (Cyber elements) */}
                <motion.div
                    className="absolute top-2 left-2 w-1 h-3 z-10"
                    style={{ backgroundColor: theme.text }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 2 }}
                />
                <motion.div
                    className="absolute bottom-2 right-2 w-3 h-1 z-10"
                    style={{ backgroundColor: theme.text }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                />

                {/* Decorative border corners (Cyberpunk ticks) */}
                <div className="absolute top-0 left-8 w-6 h-[3px]" style={{ backgroundColor: theme.text }} />
                <div className="absolute bottom-0 right-8 w-6 h-[3px]" style={{ backgroundColor: theme.text }} />

                {/* Reflection Line */}
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.button>
        </div>
    );
};
