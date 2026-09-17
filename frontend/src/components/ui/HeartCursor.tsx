import React, { useEffect, useRef, useCallback } from 'react';

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
    const hoverRef = useRef(false);

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
            hoverRef.current = true;
        }
    }, []);

    const onMouseOut = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('button, a, [role="button"], .interactive')) {
            hoverRef.current = false;
        }
    }, []);

    const drawHeart = (
        ctx: CanvasRenderingContext2D,
        x: number,
        y: number,
        s: number,
        opacity: number,
        glow: number,
    ) => {
        const d = s / 2;
        ctx.save();
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.moveTo(0, 0.35 * d);
        ctx.bezierCurveTo(0, -0.25 * d, -d, -0.25 * d, -d, 0.35 * d);
        ctx.bezierCurveTo(-d, 0.95 * d, -0.1 * d, 1.45 * d, 0, 1.9 * d);
        ctx.bezierCurveTo(0.1 * d, 1.45 * d, d, 0.95 * d, d, 0.35 * d);
        ctx.bezierCurveTo(d, -0.25 * d, 0, -0.25 * d, 0, 0.35 * d);
        ctx.closePath();
        ctx.shadowColor = `rgba(139, 92, 246, ${opacity * 0.9})`;
        ctx.shadowBlur = glow;
        ctx.fillStyle = `rgba(180, 105, 250, ${opacity})`;
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

        // Follow easing picks up speed with trailSpeed (higher = snappier trailing)
        const easing = 0.12 + trailSpeed * 0.3;
        if (cursor.current.x === -999) {
            cursor.current.x = mouse.current.x;
            cursor.current.y = mouse.current.y;
        } else {
            cursor.current.x += (mouse.current.x - cursor.current.x) * easing;
            cursor.current.y += (mouse.current.y - cursor.current.y) * easing;
        }

        // Apply cursor style — hover scale eased smoothly each frame
        const targetScale = hoverRef.current ? hoverScale : 1;
        const curScale = parseFloat(cursorRef.current.dataset.scale || '1');
        const easedScale = curScale + (targetScale - curScale) * easing;
        cursorRef.current.dataset.scale = easedScale.toFixed(4);
        cursorRef.current.style.transform = `translate(${cursor.current.x}px, ${cursor.current.y}px) scale(${easedScale})`;
        cursorRef.current.style.opacity = mouse.current.active ? '1' : '0';

        // Periodic heart-shaped ripple while moving
        const now = Date.now();
        if (mouse.current.active && now - lastRippleTime.current > 100 &&
            Math.abs(mouse.current.x - cursor.current.x) > 2) {
            ripples.current.push({
                x: cursor.current.x,
                y: cursor.current.y,
                size: size * 1.2,
                opacity: 0.35 + glowIntensity * 0.25,
                scale: 0.5
            });
            lastRippleTime.current = now;
        }

        // Update and draw ripples — fade/expand speed driven by trailSpeed
        for (let i = ripples.current.length - 1; i >= 0; i--) {
            const r = ripples.current[i];
            r.opacity -= 0.008 + trailSpeed * 0.03;
            r.scale += 0.015 + trailSpeed * 0.04;

            if (r.opacity <= 0) {
                ripples.current.splice(i, 1);
                continue;
            }

            drawHeart(ctx, r.x, r.y, r.size * r.scale, r.opacity, 6 + glowIntensity * 14);
        }

        rafId.current = requestAnimationFrame(animate);
    }, [glowIntensity, trailSpeed, size, hoverScale]);

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

    const glowBlur = 8 + glowIntensity * 14;
    const glowAlpha = 0.5 + glowIntensity * 0.4;

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
                    0%, 100% { transform: scale(0.94); }
                    50% { transform: scale(1.06); }
                }

                .heart-main {
                    animation: heart-pulse 1.6s ease-in-out infinite;
                }

                .heart-main::after {
                    content: '';
                    position: absolute;
                    inset: -35%;
                    background: radial-gradient(circle, rgba(168, 85, 247, 0.5) 0%, rgba(168, 85, 247, 0) 70%);
                    filter: blur(12px);
                    opacity: 0.7;
                    pointer-events: none;
                }
            `}</style>

            <canvas
                ref={canvasRef}
                className="absolute inset-0 h-full w-full opacity-60 pointer-events-none"
            />

            <div
                ref={cursorRef}
                data-scale="1"
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
                    transition: 'opacity 0.25s ease',
                    zIndex: 2,
                    display: mouse.current.active ? 'block' : 'none'
                }}
            >
                <div className="heart-main relative w-full h-full">
                    <svg
                        viewBox="0 0 32 32"
                        className="w-full h-full"
                        style={{ filter: `drop-shadow(0 0 ${glowBlur}px rgba(168, 85, 247, ${glowAlpha}))` }}
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
                </div>
            </div>
        </div>
    );
};

export default HeartCursor;