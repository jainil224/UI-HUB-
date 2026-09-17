import React, { useEffect, useRef, useCallback } from 'react';

interface InkDroplet {
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    alpha: number;
    stage: 'wet' | 'bleed' | 'settled';
    age: number;
    bleedTime: number;
    settledAlpha: number;
    glossy: boolean;
}

interface InkSplatterCursorProps {
    /** Color of the ink (hex). */
    inkColor?: string;
    /** Emit an ink burst on click. */
    burstOnClick?: boolean;
    /** Base droplet radius in px. */
    dropletSize?: number;
    /** Max droplets spawned per movement sample. */
    perMove?: number;
    /** Ink opacity while wet (0-1). */
    wetOpacity?: number;
    /** Seconds a droplet stays wet/bleeding before it settles. */
    settleTime?: number;
    /** Container to track pointer within (optional — global when omitted). */
    containerRef?: React.RefObject<HTMLElement>;
    /** Hide the default browser cursor while over the frame. */
    hideDefaultCursor?: boolean;
    className?: string;
}

export const InkSplatterCursor: React.FC<InkSplatterCursorProps> = ({
    inkColor = '#050505',
    burstOnClick = true,
    dropletSize = 3,
    perMove = 2,
    wetOpacity = 0.7,
    settleTime = 0.8,
    containerRef,
    hideDefaultCursor = true,
    className = '',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);

    const pointer = useRef({ x: -999, y: -999, active: false });
    const droplets = useRef<InkDroplet[]>([]);
    const rafId = useRef(0);
    const lastSpawn = useRef(0);

    const spawn = useCallback((x: number, y: number, count: number, burst = false) => {
        const n = burst ? count : Math.min(count, perMove);
        for (let i = 0; i < n; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = burst ? 1 + Math.random() * 3.5 : Math.random() * 0.6;
            const size = burst
                ? dropletSize * (0.6 + Math.random() * 1.4)
                : dropletSize * (0.6 + Math.random() * 0.9);
            droplets.current.push({
                x,
                y,
                radius: size,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed + (burst ? 0.4 : 0),
                alpha: wetOpacity * (0.7 + Math.random() * 0.3),
                stage: 'wet',
                age: 0,
                bleedTime: settleTime * (0.6 + Math.random() * 0.8),
                settledAlpha: 0.22 + Math.random() * 0.12,
                glossy: Math.random() > 0.5,
            });
        }
        if (droplets.current.length > 600) {
            droplets.current.splice(0, droplets.current.length - 600);
        }
    }, [perMove, dropletSize, wetOpacity, settleTime]);

    const spawnSplat = useCallback((x: number, y: number) => {
        const size = dropletSize * 4.5;
        droplets.current.push({
            x: x + (Math.random() - 0.5) * 8,
            y: y + (Math.random() - 0.5) * 8,
            radius: size * 0.75,
            vx: (Math.random() - 0.5) * 1.2,
            vy: 0,
            alpha: wetOpacity * 0.95,
            stage: 'wet',
            age: 0,
            bleedTime: settleTime * 1.3,
            settledAlpha: 0.3,
            glossy: true,
        });
    }, [dropletSize, wetOpacity, settleTime]);

    const onPointerMove = useCallback((e: PointerEvent) => {
        const target = containerRef?.current;
        if (target) {
            const rect = target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const inside = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
            pointer.current = { x, y, active: inside };
        } else {
            pointer.current = { x: e.clientX, y: e.clientY, active: true };
        }

        const now = performance.now();
        if (pointer.current.active && now - lastSpawn.current > 18 && droplets.current.length < 400) {
            spawn(pointer.current.x, pointer.current.y, 3);
            lastSpawn.current = now;
        }
    }, [containerRef, spawn]);

    const onPointerDown = useCallback((e: PointerEvent) => {
        if (!burstOnClick) return;
        const target = containerRef?.current;
        let x = e.clientX;
        let y = e.clientY;
        if (target) {
            const rect = target.getBoundingClientRect();
            x -= rect.left;
            y -= rect.top;
        }
        spawn(x, y, 18 + Math.floor(Math.random() * 10), true);
        spawnSplat(x, y);
    }, [burstOnClick, containerRef, spawn, spawnSplat]);

    const draw = (ctx: CanvasRenderingContext2D, d: InkDroplet, dt: number) => {
        d.age += dt;

        if (d.stage === 'wet' || d.stage === 'bleed') {
            d.x += d.vx * dt;
            d.y += d.vy * dt;
            d.vx *= 0.98;
            d.vy *= 0.98;

            if (d.stage === 'wet') {
                // Fresh ink spreads out relatively fast
                d.radius += dt * 0.22;
                if (d.age >= d.bleedTime) {
                    d.stage = 'bleed';
                }
            } else {
                // Bleeding slows down, still absorbing into the paper
                d.radius += dt * 0.04;
                if (d.age >= d.bleedTime + d.bleedTime * 0.5) {
                    d.stage = 'settled';
                    d.alpha = d.settledAlpha;
                }
            }
        }

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);
        ctx.globalAlpha = d.alpha;
        ctx.fillStyle = inkColor;
        ctx.fill();

        // Glossy highlight while wet
        if (d.glossy && d.stage !== 'settled' && d.radius > 2) {
            ctx.globalAlpha = d.alpha * 0.55;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(d.x - d.radius * 0.25, d.y - d.radius * 0.3, d.radius * 0.18, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    };

    const animate = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frame = frameRef.current;
        if (frame && (canvas.width !== frame.clientWidth || canvas.height !== frame.clientHeight)) {
            canvas.width = frame.clientWidth;
            canvas.height = frame.clientHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const dt = 16 / 1000;
        const list = droplets.current;
        for (let i = list.length - 1; i >= 0; i--) {
            draw(ctx, list[i], dt);
            if (list[i].stage === 'settled' && list[i].age > 60) {
                list.splice(i, 1);
            }
        }

        rafId.current = requestAnimationFrame(animate);
    }, [inkColor]);

    useEffect(() => {
        const target = containerRef?.current || window;
        target.addEventListener('pointermove', onPointerMove, { passive: true });
        target.addEventListener('pointerdown', onPointerDown, { passive: true });
        rafId.current = requestAnimationFrame(animate);

        return () => {
            target.removeEventListener('pointermove', onPointerMove);
            target.removeEventListener('pointerdown', onPointerDown);
            cancelAnimationFrame(rafId.current);
        };
    }, [containerRef, onPointerMove, onPointerDown, animate]);

    return (
        <div
            ref={frameRef}
            className={`pointer-events-none z-[10000] overflow-hidden ${className}`}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
            }}
        >
            {hideDefaultCursor && (
                <style>{`
                    ${containerRef ? '' : 'body { cursor: none !important; }'}
                    ${containerRef ? '' : 'a, button, [role="button"], .interactive { cursor: none !important; }'}
                `}</style>
            )}
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
        </div>
    );
};

export default InkSplatterCursor;