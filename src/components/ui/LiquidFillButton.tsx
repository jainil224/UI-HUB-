"use client";

import React from "react";
import { motion, useAnimation } from "motion/react";
import { cn } from "../../lib/utils";

interface LiquidFillButtonProps {
    label?: string;
    className?: string;
    onClick?: () => void;
    baseColor?: string;
    liquidColor?: string;
}

export const LiquidFillButton = ({
    label = "Liquid Fill",
    className,
    onClick,
    baseColor = "#000000",
    liquidColor = "#06b6d4", // cyan-500
}: LiquidFillButtonProps) => {
    return (
        <div className="relative flex items-center justify-center p-20">
            <motion.button
                onClick={onClick}
                whileHover="hover"
                initial="initial"
                className={cn(
                    "relative px-10 py-4 rounded-2xl overflow-hidden border-2",
                    "bg-transparent font-bold tracking-wider uppercase transition-all duration-500",
                    "flex items-center justify-center min-w-[200px] group",
                    className
                )}
                style={{ borderColor: liquidColor, color: liquidColor }}
            >
                {/* Liquid Background Container */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-0"
                    variants={{
                        initial: { y: "100%" },
                        hover: { y: "0%" },
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 40,
                        damping: 15,
                    }}
                >
                    {/* Liquid Body */}
                    <div
                        className="absolute inset-x-0 bottom-0 top-2"
                        style={{ backgroundColor: liquidColor }}
                    />

                    {/* SVG Wave */}
                    <div className="absolute top-0 left-0 w-full h-12 -translate-y-full overflow-hidden">
                        <motion.svg
                            viewBox="0 0 1200 120"
                            className="absolute bottom-0 left-0 w-[200%] h-full"
                            style={{ fill: liquidColor }}
                            animate={{
                                x: ["0%", "-50%"],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <path d="M0,0 C150,0 200,100 300,100 C400,100 450,0 600,0 C750,0 800,100 900,100 C1000,100 1050,0 1200,0 V120 H0 Z" />
                        </motion.svg>

                        {/* Secondary Wave for better depth */}
                        <motion.svg
                            viewBox="0 0 1200 120"
                            className="absolute bottom-0 left-0 w-[200%] h-full opacity-50"
                            style={{ fill: liquidColor }}
                            animate={{
                                x: ["-50%", "0%"],
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        >
                            <path d="M0,50 C150,50 200,120 300,120 C400,120 450,50 600,50 C750,50 800,120 900,120 C1000,120 1050,50 1200,50 V120 H0 Z" />
                        </motion.svg>
                    </div>
                </motion.div>

                {/* Label */}
                <motion.span
                    className="relative z-10 transition-colors duration-500"
                    variants={{
                        initial: { color: liquidColor },
                        hover: { color: "#ffffff" },
                    }}
                >
                    {label}
                </motion.span>

                {/* Subtle outer glow */}
                <motion.div
                    className="absolute inset-0 rounded-2xl opacity-0"
                    style={{
                        boxShadow: `0 0 20px ${liquidColor}80`,
                    }}
                    variants={{
                        hover: { opacity: 1 }
                    }}
                />
            </motion.button>
        </div>
    );
};
