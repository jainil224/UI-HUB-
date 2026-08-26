import React, { useEffect, useRef } from 'react';

interface VenomCursorProps {
    /** Color of the venom effect */
    color?: string;
    /** Whether the component follow the mouse */
    interactive?: boolean;
    /** Optional ref to the container for local tracking */
    containerRef?: React.RefObject<HTMLElement>;
    /** Optional class name */
    className?: string;
}

/**
 * Venom Cursor Animation
 * Ported from legacy JS/Canvas assets.
 * Features a point-based entity with procedural "wriggling" legs using sine-wave noise.
 */
export const VenomCursor: React.FC<VenomCursorProps> = ({
    color = '#ffffff',
    interactive = true,
    containerRef,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mousePos = useRef({ x: 0, y: 0 });

    // Track mouse + touch
    useEffect(() => {
        const getPos = (clientX: number, clientY: number) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                return { x: clientX - rect.left, y: clientY - rect.top };
            }
            return { x: clientX, y: clientY };
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos.current = getPos(e.clientX, e.clientY);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const t = e.touches[0];
                mousePos.current = getPos(t.clientX, t.clientY);
            }
        };

        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const t = e.touches[0];
                mousePos.current = getPos(t.clientX, t.clientY);
            }
        };

        const target = containerRef?.current || window;
        target.addEventListener('mousemove', handleMouseMove as any);
        target.addEventListener('touchmove', handleTouchMove as any, { passive: true });
        target.addEventListener('touchstart', handleTouchStart as any, { passive: true });
        return () => {
            target.removeEventListener('mousemove', handleMouseMove as any);
            target.removeEventListener('touchmove', handleTouchMove as any);
            target.removeEventListener('touchstart', handleTouchStart as any);
        };
    }, [containerRef]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let w: number, h: number;
        const { sin, cos, PI, hypot, min, max } = Math;

        let didInitCenter = false;
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            if (containerRef?.current) {
                w = containerRef.current.clientWidth;
                h = containerRef.current.clientHeight;
            } else {
                w = window.innerWidth;
                h = window.innerHeight;
            }
            canvas.width = Math.max(1, Math.floor(w * dpr));
            canvas.height = Math.max(1, Math.floor(h * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Start entities at the center instead of crawling to the top-left corner
            if (!didInitCenter && w > 0 && h > 0) {
                didInitCenter = true;
                mousePos.current = { x: w / 2, y: h / 2 };
            }
        };
        resize();

        window.addEventListener('resize', resize);
        let resizeObserver: ResizeObserver | undefined;
        if (containerRef?.current) {
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(containerRef.current);
        }

        // --- Logic Port ---
        function rnd(x = 1, dx = 0) { return Math.random() * x + dx; }
        function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
        function noise(x: number, y: number, t = 101) {
            let w0 = sin(0.3 * x + 1.4 * t + 2.0 + 2.5 * sin(0.4 * y + -1.3 * t + 1.0));
            let w1 = sin(0.2 * y + 1.5 * t + 2.8 + 2.3 * sin(0.5 * x + -1.2 * t + 0.5));
            return w0 + w1;
        }

        const many = (n: number, f: (i: number) => any) => Array.from({ length: n }, (_, i) => f(i));

        function spawn() {
            // Spawn tentacle points within the container bounds (not the window),
            // otherwise most points land outside a scoped preview canvas
            const pts = many(333, () => ({
                x: rnd(w),
                y: rnd(h),
                len: 0,
                r: 0
            }));

            const pts2 = many(9, (i) => ({
                x: cos((i / 9) * PI * 2),
                y: sin((i / 9) * PI * 2)
            }));

            let seed = rnd(100);
            let tx = w / 2, ty = h / 2;
            let x = w / 2, y = h / 2;
            let kx = rnd(0.5, 0.5), ky = rnd(0.5, 0.5);
            let walkRadius = { x: rnd(50, 50), y: rnd(50, 50) };
            let r = w / rnd(100, 150);

            function drawLine(x0: number, y0: number, x1: number, y1: number) {
                ctx!.beginPath();
                ctx!.moveTo(x0, y0);
                for (let i = 0; i < 100; i++) {
                    const t = (i + 1) / 100;
                    let lx = lerp(x0, x1, t);
                    let ly = lerp(y0, y1, t);
                    let k = noise(lx / 5 + x0, ly / 5 + y0) * 2;
                    ctx!.lineTo(lx + k, ly + k);
                }
                ctx!.stroke();
            }

            function paintPt(pt: any, cx: number, cy: number, cr: number) {
                pts2.forEach((pt2) => {
                    if (!pt.len) return;
                    drawLine(
                        lerp(cx + pt2.x * cr, pt.x, pt.len * pt.len),
                        lerp(cy + pt2.y * cr, pt.y, pt.len * pt.len),
                        cx + pt2.x * cr,
                        cy + pt2.y * cr
                    );
                });
                
                ctx!.beginPath();
                ctx!.ellipse(pt.x, pt.y, pt.r, pt.r, 0, 0, PI * 2);
                ctx!.fill();
            }

            return {
                follow(ex: number, ey: number) {
                    tx = ex;
                    ty = ey;
                },
                tick(t: number) {
                    const selfMoveX = cos(t * kx + seed) * walkRadius.x;
                    const selfMoveY = sin(t * ky + seed) * walkRadius.y;
                    let fx = tx + selfMoveX;
                    let fy = ty + selfMoveY;

                    x += min(w / 100, (fx - x) / 10);
                    y += min(h / 100, (fy - y) / 10);

                    let i = 0;
                    pts.forEach((pt) => {
                        const dx = pt.x - x, dy = pt.y - y;
                        const len = hypot(dx, dy);
                        let pr = min(2, w / len / 5);
                        const increasing = len < w / 10 && (i++) < 8;
                        let dir = increasing ? 0.1 : -0.1;
                        if (increasing) pr *= 1.5;
                        pt.r = pr;
                        pt.len = max(0, min(pt.len + dir, 1));
                        paintPt(pt, x, y, r);
                    });
                }
            };
        }

        const venomEntities = many(2, spawn);

        let rafId: number;
        const anim = (t: number) => {
            ctx.clearRect(0, 0, w, h);
            ctx.fillStyle = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            
            t /= 1000;
            
            venomEntities.forEach(s => {
                s.follow(mousePos.current.x, mousePos.current.y);
                s.tick(t);
            });
            
            rafId = requestAnimationFrame(anim);
        };
        rafId = requestAnimationFrame(anim);

        return () => {
            window.removeEventListener('resize', resize);
            resizeObserver?.disconnect();
            cancelAnimationFrame(rafId);
        };
    }, [color, containerRef]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: containerRef ? 1 : 9999,
            }}
        />
    );
};

export default VenomCursor;
