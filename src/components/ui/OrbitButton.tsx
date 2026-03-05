"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "../../lib/utils";

interface OrbitButtonProps {
    label?: string;
    className?: string;
    onClick?: () => void;
    color?: "blue" | "purple" | "cyan";
}

export const OrbitButton = ({
    label = "Orbit Button",
    className,
    onClick,
    color = "cyan",
}: OrbitButtonProps) => {
    const colorStyles = {
        blue: {
            glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
            border: "border-blue-500/50",
            particle: "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]",
            hoverGlow: "group-hover:shadow-[0_0_35px_rgba(59,130,246,0.8)]",
        },
        purple: {
            glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
            border: "border-purple-500/50",
            particle: "bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.8)]",
            hoverGlow: "group-hover:shadow-[0_0_35px_rgba(168,85,247,0.8)]",
        },
        cyan: {
            glow: "shadow-[0_0_20px_rgba(34,211,238,0.5)]",
            border: "border-cyan-500/50",
            particle: "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]",
            hoverGlow: "group-hover:shadow-[0_0_35px_rgba(34,211,238,0.8)]",
        },
    };

    const orbitParticles = [
        { initialRotate: 0, radius: 45, duration: 4, size: 6 },
        { initialRotate: 72, radius: 55, duration: 6, size: 4 },
        { initialRotate: 144, radius: 40, duration: 5, size: 5 },
        { initialRotate: 216, radius: 60, duration: 7, size: 3 },
        { initialRotate: 288, radius: 50, duration: 4.5, size: 4.5 },
    ];

    const currentStyle = colorStyles[color];

    return (
        <div className="relative flex items-center justify-center p-20">
            <motion.div className="relative group" whileHover="hover">
                {/* Orbiting Particles Container */}
                {orbitParticles.map((particle, index) => (
                    <motion.div
                        key={index}
                        className="absolute top-1/2 left-1/2 pointer-events-none"
                        style={{
                            width: particle.radius * 2,
                            height: particle.radius * 2,
                            marginLeft: -particle.radius,
                            marginTop: -particle.radius,
                        }}
                        initial={{ rotate: particle.initialRotate }}
                        animate={{ rotate: particle.initialRotate + 360 }}
                        variants={{
                            hover: {
                                transition: {
                                    duration: particle.duration * 0.5,
                                    repeat: Infinity,
                                    ease: "linear",
                                },
                            },
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            ease: "linear",
                        }}
                    >
                        <motion.div
                            className={cn(
                                "rounded-full absolute",
                                currentStyle.particle
                            )}
                            style={{
                                width: particle.size,
                                height: particle.size,
                                top: 0,
                                left: "50%",
                                marginLeft: -particle.size / 2,
                            }}
                            variants={{
                                hover: {
                                    scale: 1.5,
                                    filter: "brightness(1.5)",
                                },
                            }}
                        />
                    </motion.div>
                ))}

                {/* Main Button */}
                <button
                    onClick={onClick}
                    className={cn(
                        "relative px-8 py-3 rounded-full bg-neutral-900/80 backdrop-blur-md border",
                        "text-white font-medium transition-all duration-300",
                        "flex items-center justify-center min-w-[140px] z-10",
                        currentStyle.border,
                        currentStyle.glow,
                        currentStyle.hoverGlow,
                        "group-hover:scale-105 active:scale-95",
                        className
                    )}
                >
                    <span className="relative z-10">{label}</span>

                    {/* Inner Glow Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </button>

                {/* Diffused Background Glow */}
                <div className={cn(
                    "absolute inset-0 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-full",
                    color === "blue" ? "bg-blue-500" : color === "purple" ? "bg-purple-500" : "bg-cyan-500"
                )} />
            </motion.div>
        </div>
    );
};
