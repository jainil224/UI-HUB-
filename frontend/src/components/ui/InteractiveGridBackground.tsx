"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";

export interface InteractiveGridBackgroundProps
    extends React.HTMLProps<HTMLDivElement> {
    gridSize?: number;
    gridColor?: string;
    darkGridColor?: string;
    effectColor?: string;
    darkEffectColor?: string;
    trailLength?: number;
    width?: number;
    height?: number;
    idleSpeed?: number;
    glow?: boolean;
    glowRadius?: number;
    children?: React.ReactNode;
    showFade?: boolean;
    fadeIntensity?: number;
    idleRandomCount?: number; // ✅ how many random cells move during idle
}

const InteractiveGridBackground: React.FC<InteractiveGridBackgroundProps> = ({
    gridSize = 45,
    gridColor = "rgba(255, 255, 255, 0.12)",
    darkGridColor = "rgba(255, 255, 255, 0.12)",
    effectColor = "rgba(0, 255, 136, 0.85)",
    darkEffectColor = "rgba(0, 255, 136, 0.85)",
    trailLength = 4,
    width,
    height,
    idleSpeed = 0.3,
    glow = true,
    glowRadius = 40, // Increased default
    children,
    showFade = false,
    fadeIntensity = 20,
    idleRandomCount = 6,
    className,
    ...props
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const trailRef = useRef<{ x: number; y: number }[]>([]);
    const idleTargetsRef = useRef<{ x: number; y: number }[]>([]);
    const idlePositionsRef = useRef<{ x: number; y: number }[]>([]);
    const mouseActiveRef = useRef(false);
    const lastMouseTimeRef = useRef(Date.now());

    // Detect dark mode
    useEffect(() => {
        const updateDarkMode = () => {
            const prefersDark =
                window.matchMedia &&
                window.matchMedia("(prefers-color-scheme: dark)").matches;
            setIsDarkMode(
                document.documentElement.classList.contains("dark") || prefersDark
            );
        };
        updateDarkMode();
        const observer = new MutationObserver(() => updateDarkMode());
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    // Mouse tracking
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            const rawX = e.clientX - rect.left;
            const rawY = e.clientY - rect.top;

            if (rawX < 0 || rawY < 0 || rawX > rect.width || rawY > rect.height)
                return;

            mouseActiveRef.current = true;
            lastMouseTimeRef.current = Date.now();

            const snappedX = Math.floor(rawX / gridSize);
            const snappedY = Math.floor(rawY / gridSize);

            const last = trailRef.current[0];
            if (!last || last.x !== snappedX || last.y !== snappedY) {
                trailRef.current.unshift({ x: snappedX, y: snappedY });
                if (trailRef.current.length > trailLength) trailRef.current.pop();
            }
        };

        const container = containerRef.current;
        if (!container) return;

        container.addEventListener("mousemove", handleMouseMove);
        return () => container.removeEventListener("mousemove", handleMouseMove);
    }, [gridSize, trailLength]);

    // Drawing logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const draw = () => {
            const container = containerRef.current;
            if (!container) return;

            const rect = container.getBoundingClientRect();
            const canvasWidth = rect.width;
            const canvasHeight = rect.height;

            // Only resize canvas if its drawing buffer size doesn't match its displayed size
            if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
            }

            const cols = Math.floor(canvasWidth / gridSize);
            const rows = Math.floor(canvasHeight / gridSize);

            const lineColor = isDarkMode ? darkGridColor : gridColor;
            const glowColor = isDarkMode ? darkEffectColor : effectColor;

            // Initialize idle positions (only once or when canvas resized drastically)
            if (idleTargetsRef.current.length === 0) {
                idleTargetsRef.current = Array.from({ length: idleRandomCount }, () => ({
                    x: Math.floor(Math.random() * cols),
                    y: Math.floor(Math.random() * rows),
                }));
                idlePositionsRef.current = idleTargetsRef.current.map((p) => ({ ...p }));
            }

            ctx.clearRect(0, 0, canvasWidth, canvasHeight);

            // Draw grid lines
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = 1;

            ctx.beginPath();
            for (let x = 0; x <= canvasWidth; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
            }
            for (let y = 0; y <= canvasHeight; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvasWidth, y);
            }
            ctx.stroke();

            // Idle animation logic
            const idleThreshold = 2000;
            if (Date.now() - lastMouseTimeRef.current > idleThreshold) {
                mouseActiveRef.current = false;

                idlePositionsRef.current.forEach((pos, i) => {
                    const target = idleTargetsRef.current[i];
                    const dx = target.x - pos.x;
                    const dy = target.y - pos.y;

                    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
                        // new random target when reached
                        idleTargetsRef.current[i] = {
                            x: Math.floor(Math.random() * cols),
                            y: Math.floor(Math.random() * rows),
                        };
                    } else {
                        pos.x += dx * idleSpeed;
                        pos.y += dy * idleSpeed;
                    }

                    const roundedX = Math.round(pos.x);
                    const roundedY = Math.round(pos.y);
                    const last = trailRef.current[0];
                    if (!last || last.x !== roundedX || last.y !== roundedY) {
                        trailRef.current.unshift({ x: roundedX, y: roundedY });
                        if (trailRef.current.length > trailLength * idleRandomCount)
                            trailRef.current.pop();
                    }
                });
            }

            // Draw trail glow
            const currentDotCount = mouseActiveRef.current ? 1 : idleRandomCount;
            trailRef.current.forEach((cell, idx) => {
                const age = Math.floor(idx / currentDotCount);
                const alpha = Math.max(0, 1 - age * (1 / (trailLength + 1)));
                if (alpha <= 0) return;

                // Extract rgb portions for different color string formats (rgba, rgb, hex)
                let rgbaColor = glowColor;

                if (glowColor.startsWith('rgba') || glowColor.startsWith('rgb')) {
                    const match = glowColor.match(/rgba?\((\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*(?:,\s*[\d.]+\s*)?)\)/);
                    if (match && match[1]) {
                        const parts = match[1].split(',').map(s => s.trim());
                        if (parts.length >= 3) {
                            rgbaColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
                        }
                    }
                } else if (glowColor.startsWith('#')) {
                    const hex = glowColor.replace('#', '');
                    if (hex.length === 3) {
                        const r = parseInt(hex.substring(0, 1).repeat(2), 16);
                        const g = parseInt(hex.substring(1, 2).repeat(2), 16);
                        const b = parseInt(hex.substring(2, 3).repeat(2), 16);
                        rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    } else if (hex.length >= 6) {
                        const r = parseInt(hex.substring(0, 2), 16);
                        const g = parseInt(hex.substring(2, 4), 16);
                        const b = parseInt(hex.substring(4, 6), 16);
                        rgbaColor = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    }
                }

                ctx.fillStyle = rgbaColor;
                if (glow) {
                    ctx.shadowColor = rgbaColor;
                    ctx.shadowBlur = glowRadius;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fillRect(cell.x * gridSize, cell.y * gridSize, gridSize, gridSize);
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
        }
    }, [
        gridSize,
        width,
        height,
        gridColor,
        darkGridColor,
        effectColor,
        darkEffectColor,
        isDarkMode,
        trailLength,
        idleSpeed,
        glow,
        glowRadius,
        idleRandomCount,
    ]);

    return (
        <div
            ref={containerRef}
            className={cn("w-full h-full min-h-[400px] relative z-0", className)}
            style={{ width: width || "100%", height: height || "100%" }}
            {...props}
        >
            <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 z-0 pointer-events-none w-full h-full"
            />

            {showFade && (
                <div
                    className="pointer-events-none absolute inset-0 bg-black"
                    style={{
                        maskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
                        WebkitMaskImage: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, black)`,
                    }}
                />
            )}
            <div className="relative z-0 w-full h-full">{children}</div>
        </div>
    );
};

export default InteractiveGridBackground;
