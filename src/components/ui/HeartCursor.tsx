import React, { useEffect, useRef, useCallback, useState } from 'react';

interface HeartCursorProps {
    /** Cursor size in pixels */
    size?: number;
    /** Intensity of the neon glow (0-1) */
    glowIntensity?: number;
    /** Trail fade speed (0-1, higher is faster) */
    trailSpeed?: number;
    /** Scale factor when hovering interactive elements */
    hoverScale?: number;
    /** Container to track mouse within (optional) */
    containerRef?: React.RefObject<HTMLElement>;
    className?: string;
}

interface HeartRipple {
    x: number;
    y: number;
    size: number;
    opacity: number;
    scale: number;
}

export const HeartCursor: React.FC<HeartCursorProps> = ({
    size = 24,
    glowIntensity = 0.8,
    trailSpeed = 0.05,
    hoverScale = 1.6,
    containerRef,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Physics/Position refs (no re-renders)
    const mouse = useRef({ x: -999, y: -999, active: false });
    const cursor = useRef({ x: -999, y: -999 });
    const ripples = useRef<HeartRipple[]>([]);
    const rafId = useRef<number>(0);
    const lastRippleTime = useRef<number>(0);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (containerRef?.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;

            mouse.current = { x, y, active: inside };
        } else {
            mouse.current = { x: e.clientX, y: e.clientY, active: true };
        }
    }, [containerRef]);

    const onMouseOver = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, [role="button"], .interactive')) {
            setIsHovered(true);
        }
    }, []);

    const onMouseOut = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, [role="button"], .interactive')) {
            setIsHovered(false);
        }
    }, []);

    const drawHeart = (ctx: CanvasRenderingContext2D, x: number, y: number, s: number, opacity: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        // Simple heart path
        const d = s / 2;
        ctx.moveTo(0, d / 2);
        ctx.bezierCurveTo(0, 0, -d, 0, -d, d / 2);
        ctx.bezierCurveTo(-d, d, 0, d * 1.5, 0, d * 2);
        ctx.bezierCurveTo(0, d * 1.5, d, d, d, d / 2);
        ctx.bezierCurveTo(d, 0, 0, 0, 0, d / 2);

        ctx.fillStyle = `rgba(168, 85, 247, ${opacity})`; // Purple-500
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(139, 92, 246, 0.5)';
        ctx.fill();
        ctx.restore();
    };

    const animate = useCallback(() => {
        if (!canvasRef.current || !cursorRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Sync canvas size
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update cursor position with easing
        const easing = 0.15;
        if (cursor.current.x === -999) {
            cursor.current.x = mouse.current.x;
            cursor.current.y = mouse.current.y;
        } else {
            cursor.current.x += (mouse.current.x - cursor.current.x) * easing;
            cursor.current.y += (mouse.current.y - cursor.current.y) * easing;
        }

        // Apply cursor style
        cursorRef.current.style.transform = `translate(${cursor.current.x}px, ${cursor.current.y}px) scale(${isHovered ? hoverScale : 1})`;
        cursorRef.current.style.opacity = mouse.current.active ? '1' : '0';

        // Add periodic ripples
        const now = Date.now();
        if (mouse.current.active && now - lastRippleTime.current > 100 &&
            Math.abs(mouse.current.x - cursor.current.x) > 2) {
            ripples.current.push({
                x: cursor.current.x,
                y: cursor.current.y,
                size: size * 1.2,
                opacity: 0.4,
                scale: 0.5
            });
            lastRippleTime.current = now;
        }

        // Update and draw ripples
        for (let i = ripples.current.length - 1; i >= 0; i--) {
            const r = ripples.current[i];
            r.opacity -= 0.01;
            r.scale += 0.02;

            if (r.opacity <= 0) {
                ripples.current.splice(i, 1);
                continue;
            }

            // Bloom/Blur effect via radial gradient
            const gradient = ctx.createRadialGradient(r.x, r.y + r.size / 2, 0, r.x, r.y + r.size / 2, r.size * r.scale * 2);
            gradient.addColorStop(0, `rgba(139, 92, 246, ${r.opacity})`);
            gradient.addColorStop(0.4, `rgba(124, 58, 237, ${r.opacity * 0.4})`);
            gradient.addColorStop(1, 'rgba(124, 58, 237, 0)');

            ctx.beginPath();
            ctx.arc(r.x, r.y + r.size / 2, r.size * r.scale * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.filter = 'blur(8px)';
            ctx.fill();
            ctx.filter = 'none';
        }

        rafId.current = requestAnimationFrame(animate);
    }, [isHovered, hoverScale, size]);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseover', onMouseOver, { passive: true });
        window.addEventListener('mouseout', onMouseOut, { passive: true });
        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
            window.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(rafId.current);
        };
    }, [onMouseMove, onMouseOver, onMouseOut, animate]);

    return (
        <div
            className={`pointer-events-none z-[10000] overflow-hidden ${className}`}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                inset: 0,
                width: '100%',
                height: '100%'
            }}
        >
            <style>{`
                ${containerRef ? '' : 'body { cursor: none !important; }'}
                ${containerRef ? '' : 'a, button, [role="button"], .interactive { cursor: none !important; }'}
                
                @keyframes heart-pulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.6)); }
                    50% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(168, 85, 247, 0.9)); }
                }
                
                .heart-main {
                    animation: heart-pulse 1.5s ease-in-out infinite;
                }
            `}</style>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full opacity-60 pointer-events-none"
            />

            <div
                ref={cursorRef}
                className="pointer-events-none"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: size,
                    height: size,
                    marginLeft: -size / 2,
                    marginTop: -size / 2,
                    willChange: 'transform, opacity',
                    transition: 'transform 0.2s cubic-bezier(0.17, 0.67, 0.83, 0.67)',
                    zIndex: 2,
                    display: mouse.current.active ? 'block' : 'none'
                }}
            >
                <div className="heart-main relative w-full h-full">
                    <svg
                        viewBox="0 0 32 32"
                        className="w-full h-full drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M16 28.5L14.1 26.75C7.4 20.6 3 16.55 3 11.5C3 7.42 6.22 4.2 10.3 4.2C12.62 4.2 14.83 5.28 16 7C17.17 5.28 19.38 4.2 21.7 4.2C25.78 4.2 29 7.42 29 11.5C29 16.55 24.6 20.6 17.9 26.75L16 28.5Z"
                            fill="url(#heart-gradient)"
                        />
                        <defs>
                            <linearGradient id="heart-gradient" x1="16" y1="4" x2="16" y2="28" gradientUnits="userSpaceOnUse">
                                <stop stopColor="#D8B4FE" />
                                <stop offset="1" stopColor="#7C3AED" />
                            </linearGradient>
                        </defs>
                    </svg>

                    {/* Inner Glow Bloom */}
                    <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl scale-150 -z-10" />
                </div>
            </div>
        </div>
    );
};

export default HeartCursor;
