"use client";
import React from "react";
import { Boxes } from "./background-boxes"
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

export function IsometricGridBackground({ title, className = "", boxProps }: IsometricGridBackgroundProps) {
    return (
        <div className={cn("h-full relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg", className)}>
            <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

            <Boxes {...boxProps} />

            {title && (
                <h1 className={cn("md:text-4xl text-xl text-white relative z-20 font-display font-bold uppercase tracking-widest")}>
                    {title}
                </h1>
            )}
        </div>
    );
}
