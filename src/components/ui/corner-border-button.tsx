"use client"

import React, { type ReactNode } from "react"
import { cn } from "../../lib/utils"

export interface CornerBorderButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    className?: string
    /**
     * The dark background color of the button in its resting state.
     */
    baseColor?: string
    /**
     * The background color of the button when hovered.
     */
    hoverColor?: string
    /**
     * The color of the animated border strokes and corners.
     */
    borderColor?: string
}

export function CornerBorderButton({
    children,
    className = "",
    baseColor = "#0b1a2a",
    hoverColor = "#ff3b4d",
    borderColor = "#60daff", // light blue glow
    style,
    ...props
}: CornerBorderButtonProps) {
    return (
        <button
            className={cn(
                "group relative inline-flex items-center justify-center p-4 min-w-[220px] min-h-[70px]",
                "font-bold uppercase tracking-widest text-white transition-colors duration-400 ease-in-out",
                className
            )}
            style={{
                backgroundColor: baseColor,
                ...style,
            } as React.CSSProperties}
            {...props}
        >
            {/* 
        Hover Background Layer 
        Using absolute positioning to overlay the base color cleanly 
      */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-in-out z-0"
                style={{ backgroundColor: hoverColor }}
            />

            <span className="relative z-10 block w-full text-center">{children}</span>

            {/* Top Left Corner Square */}
            <span
                className="absolute top-0 left-0 w-1.5 h-1.5 z-20 pointer-events-none"
                style={{ backgroundColor: borderColor }}
            />
            {/* Bottom Right Corner Square */}
            <span
                className="absolute bottom-0 right-0 w-1.5 h-1.5 z-20 pointer-events-none"
                style={{ backgroundColor: borderColor }}
            />

            {/* 
        Animated Borders
        Using multiple spans to draw the border progressively from the corners.
      */}

            {/* Top Border (from left to right) */}
            <span
                className="absolute top-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 ease-out z-10 pointer-events-none"
                style={{ backgroundColor: borderColor, boxShadow: `0 0 8px ${borderColor}` }}
            />

            {/* Right Border (from top to bottom) */}
            <span
                className="absolute top-0 right-0 w-[2px] h-0 group-hover:h-full transition-all duration-300 delay-100 ease-out z-10 pointer-events-none"
                style={{ backgroundColor: borderColor, boxShadow: `0 0 8px ${borderColor}` }}
            />

            {/* Bottom Border (from right to left) */}
            <span
                className="absolute bottom-0 right-0 h-[2px] w-0 group-hover:w-full transition-all duration-300 ease-out z-10 pointer-events-none"
                style={{ backgroundColor: borderColor, boxShadow: `0 0 8px ${borderColor}` }}
            />

            {/* Left Border (from bottom to top) */}
            <span
                className="absolute bottom-0 left-0 w-[2px] h-0 group-hover:h-full transition-all duration-300 delay-100 ease-out z-10 pointer-events-none"
                style={{ backgroundColor: borderColor, boxShadow: `0 0 8px ${borderColor}` }}
            />

        </button>
    )
}
