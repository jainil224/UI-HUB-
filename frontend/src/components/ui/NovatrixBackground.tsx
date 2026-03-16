"use client";

import React from "react";
import { cn } from "../../lib/utils";

export interface NovatrixBackgroundProps {
    colorFrom?: string;
    colorTo?: string;
    opacity?: number;
    className?: string;
    title?: string;
}

export const NovatrixBackground = ({
    colorFrom = "#1e1b4b", // indigo-950
    colorTo = "#581c87",   // purple-900
    opacity = 1,
    className = "",
    title = "NOVATRIX NEBULA"
}: NovatrixBackgroundProps) => {
    return (
        <div
            className={cn(
                "w-full h-[400px] relative overflow-hidden flex items-center justify-center bg-black rounded-3xl",
                className
            )}
            style={{ opacity }}
        >
            <div
                className="absolute inset-0 animate-pulse bg-gradient-to-br transition-colors duration-1000"
                style={{
                    backgroundImage: `linear-gradient(to bottom right, ${colorFrom}, ${colorTo})`,
                }}
            />
            {/* Subtle rotating glow */}
            <div
                className="absolute inset-0 opacity-30 animate-spin-slow"
                style={{
                    background: `radial-gradient(circle at center, ${colorTo} 0%, transparent 70%)`,
                }}
            />
            <h2 className="relative z-10 text-white/50 font-display text-2xl font-bold uppercase tracking-widest animate-in fade-in duration-1000">
                {title}
            </h2>

            <style jsx>{`
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 20s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default NovatrixBackground;
