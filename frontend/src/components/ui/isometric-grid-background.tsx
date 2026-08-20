"use client";
import React from "react";
import { BoxesCore } from "./background-boxes";
import { cn } from "../../lib/utils";

export interface IsometricGridBackgroundProps {
    title?: string;
    className?: string;
    boxProps?: {
        rowsCount?: number;
        colsCount?: number;
        customColors?: string[];
    };
}

export function IsometricGridBackground({ title = "ISOMETRIC GRID", className = "", boxProps }: IsometricGridBackgroundProps) {
    return (
        <div className={cn("h-full min-h-[420px] relative w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center rounded-lg", className)}>
            <div className="absolute inset-0 w-full h-full bg-slate-950/50 z-10 pointer-events-none" />

            <BoxesCore {...boxProps} />

            {title && (
                <div className="relative z-20 pointer-events-none text-center px-4">
                    <h1 className="md:text-4xl text-2xl text-white font-display font-black uppercase tracking-widest drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                        {title}
                    </h1>
                    <p className="text-[11px] uppercase tracking-[0.25em] font-mono text-cyan-400 mt-2 font-bold opacity-90 drop-shadow">
                        Hover over tiles to illuminate
                    </p>
                </div>
            )}
        </div>
    );
}

export default IsometricGridBackground;
