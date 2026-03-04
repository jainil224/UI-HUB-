"use client";

import React, { useRef } from "react";
import { useInView } from "motion/react";

interface PerformanceWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    className?: string;
    threshold?: number;
}

/**
 * PerformanceWrapper
 * 
 * High-performance wrapper that only renders children when they enter the viewport.
 * Used to optimize heavy background shaders and complex animations.
 */
export const PerformanceWrapper = ({
    children,
    fallback,
    className = "w-full h-full",
    threshold = 0.1
}: PerformanceWrapperProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: false, amount: threshold });

    return (
        <div ref={ref} className={className}>
            {isInView ? children : (fallback || (
                <div className="w-full h-full flex items-center justify-center bg-black/5 rounded-xl border border-white/5">
                    <div className="flex flex-col items-center gap-2 opacity-20">
                        <div className="w-8 h-8 rounded-full border-2 border-brand-green/30 border-t-brand-green animate-spin" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Optimizing</span>
                    </div>
                </div>
            ))}
        </div>
    );
};
