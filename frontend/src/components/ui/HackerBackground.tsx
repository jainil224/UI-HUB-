"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";

export interface HackerBackgroundProps {
    className?: string;
    fontSize?: number;
    color?: string;
    speed?: number;
}

export const HackerBackground: React.FC<HackerBackgroundProps> = ({
    className = "",
    fontSize = 15,
    color = "#00ff66",
    speed = 33,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let width = container.clientWidth || 800;
        let height = container.clientHeight || 500;
        let drops: number[] = [];

        const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZアイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";

        const resize = () => {
            const rect = container.getBoundingClientRect();
            width = rect.width || container.clientWidth || window.innerWidth || 800;
            height = rect.height || container.clientHeight || window.innerHeight || 500;
            
            const dpr = window.devicePixelRatio || 1;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);

            const columns = Math.floor(width / fontSize);
            drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
        };

        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(container);

        const interval = setInterval(() => {
            ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = `bold ${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const char = chars[Math.floor(Math.random() * chars.length)];
                const x = i * fontSize;
                const y = drops[i] * fontSize;

                // Glowing head character
                if (Math.random() > 0.85) {
                    ctx.fillStyle = "#ffffff";
                    ctx.shadowColor = color;
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = color;
                    ctx.shadowBlur = 0;
                }

                ctx.fillText(char, x, y);

                if (y > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }
        }, speed);

        return () => {
            clearInterval(interval);
            ro.disconnect();
        };
    }, [fontSize, color, speed]);

    return (
        <div ref={containerRef} className={cn("relative w-full h-full min-h-[400px] overflow-hidden bg-black flex items-center justify-center", className)}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
            
            {/* Center Matrix Terminal Header */}
            <div className="relative z-10 text-center px-4 pointer-events-none">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] uppercase tracking-widest mb-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>SYSTEM ONLINE // 010101</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-black font-display text-white tracking-widest uppercase drop-shadow-[0_0_20px_rgba(0,255,102,0.8)]">
                    HACKER MATRIX
                </h1>
                <p className="text-xs uppercase tracking-[0.25em] font-mono text-emerald-400 mt-2 font-bold opacity-80">
                    Continuous 60FPS Digital Rain Canvas
                </p>
            </div>
        </div>
    );
};

export default HackerBackground;
