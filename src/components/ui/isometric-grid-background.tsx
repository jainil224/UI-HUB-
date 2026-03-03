"use client";
import React from "react";
import { Boxes } from "./background-boxes"
import { cn } from "../../lib/utils";

export function IsometricGridBackground({ title }: { title?: string }) {
    return (
        <div className="h-full relative w-full overflow-hidden bg-slate-900 flex flex-col items-center justify-center rounded-lg">
            <div className="absolute inset-0 w-full h-full bg-slate-900 z-20 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

            <Boxes />

            {title && (
                <h1 className={cn("md:text-4xl text-xl text-white relative z-20 font-display font-bold uppercase tracking-widest")}>
                    {title}
                </h1>
            )}
        </div>
    );
}
