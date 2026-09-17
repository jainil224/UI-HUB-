import React, { useEffect, useRef, useCallback, useState } from 'react';

interface GhostTrailCursorProps {
    /** Number of echoing ghosts behind the live dot. */
    ghostCount?: number;
    /** How tightly the chain is drawn toward the pointer (0-1, higher = tighter). */
    trailIntensity?: number;
    /** Diameter of the live cursor dot in px. */
    size?: number;
    /** Accent color of the live dot. */
    color?: string;
    /** Echo ghost fill color. */
    ghostColor?: string;
    /** Container to track pointer within (optional — global when omitted). */
    containerRef?: React.RefObject<HTMLElement>;
    /** Hide the default browser cursor while over the frame. */
    hideDefaultCursor?: boolean;
    className?: string;
}

interface Sample {
    x: number;
    y: number;
}

export const GhostTrailCursor: React.FC<GhostTrailCursorProps> = ({
    ghostCount = 6,
    trailIntensity = 0.85,
    size = 14,
    color = '#3D5CFF',
    ghostColor = 'rgba(255, 255, 255, 0.6)',
    containerRef,
    hideDefaultCursor = true,
    className = '',
}) => {
    const frameRef = useRef<HTMLDivElement>(null);
    const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
    const [enabled, setEnabled] = useState(false);

    // Total chain = live dot (index 0) + `ghostCount` echoes.
    const total = ghostCount + 1;
    const points = useRef<Sample[]>([]);
    const rafId = useRef(0);
    // Per-link ease factor, progressively looser further back the chain.
    const ease = useRef<number[]>([]);

    useEffect(() => {
        ease.current = Array.from({ length: total }, (_, k) => {
            // k=0 is the live dot tracking the pointer directly (1 = instant).
            if (k === 0) return 1;
            return Math.max(0.04, trailIntensity * (0.9 - (k - 1) * 0.115));
        });
        points.current = Array.from({ length: total }, () => ({ x: -999, y: -999 }));
    }, [total, trailIntensity]);

    const onPointerEnter = useCallback(() => setEnabled(true), []);
    const onPointerLeave = useCallback(() => {
        setEnabled(false);
        dotRefs.current.forEach((el) => {
            if (el) el.style.opacity = '0';
        });
    }, []);

    const onPointerMove = useCallback((e: PointerEvent) => {
        const frame = frameRef.current;
        if (!frame) return;
        const rect = frame.getBoundingClientRect();
        points.current[0] = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    const animate = useCallback(() => {
        // Chain: link k eases toward link k-1.
        for (let k = 1; k < total; k++) {
            const target = points.current[k - 1];
            const cur = points.current[k];
            const t = ease.current[k];
            cur.x += (target.x - cur.x) * t;
            cur.y += (target.y - cur.y) * t;
        }

        for (let k = 0; k < total; k++) {
            const el = dotRefs.current[k];
            if (!el) continue;
            const p = points.current[k];
            if (p.x === -999 || p.y === -999) continue;

            if (k === 0) {
                el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
                el.style.opacity = enabled ? '1' : '0';
            } else {
                const depth = (k - 1) / Math.max(1, ghostCount);
                const opacity = enabled ? Math.max(0.05, 0.55 * (1 - depth)) : 0;
                const scale = 1 - depth * 0.55;
                el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${scale})`;
                el.style.opacity = String(opacity);
            }
        }

        rafId.current = requestAnimationFrame(animate);
    }, [total, ghostCount, enabled]);

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) return;
        frame.addEventListener('pointerenter', onPointerEnter);
        frame.addEventListener('pointerleave', onPointerLeave);
        frame.addEventListener('pointermove', onPointerMove, { passive: true });
        rafId.current = requestAnimationFrame(animate);

        return () => {
            frame.removeEventListener('pointerenter', onPointerEnter);
            frame.removeEventListener('pointerleave', onPointerLeave);
            frame.removeEventListener('pointermove', onPointerMove);
            cancelAnimationFrame(rafId.current);
        };
    }, [onPointerEnter, onPointerLeave, onPointerMove, animate]);

    return (
        <div
            ref={frameRef}
            className={`pointer-events-none z-[10000] overflow-hidden ${className}`}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                inset: 0,
                width: '100%',
                height: '100%',
                mixBlendMode: 'difference',
            }}
        >
            {hideDefaultCursor && (
                <style>{`
                    ${containerRef ? '' : 'body { cursor: none !important; }'}
                    ${containerRef ? '' : 'a, button, [role="button"], .interactive { cursor: none !important; }'}
                `}</style>
            )}

            {/* Echo ghosts (drawn first, so the live dot paints on top) */}
            {Array.from({ length: ghostCount }).map((_, k) => (
                <div
                    key={`g${k}`}
                    ref={(el) => {
                        dotRefs.current[k + 1] = el;
                    }}
                    className="absolute left-0 top-0 rounded-full will-change-transform"
                    style={{
                        width: size,
                        height: size,
                        background: ghostColor,
                        opacity: 0,
                        transition: 'opacity 0.25s ease',
                    }}
                />
            ))}

            {/* Live brand-blue dot */}
            <div
                ref={(el) => {
                    dotRefs.current[0] = el;
                }}
                className="absolute left-0 top-0 rounded-full will-change-transform"
                style={{
                    width: Math.max(8, size * 0.55),
                    height: Math.max(8, size * 0.55),
                    background: color,
                    opacity: 0,
                    transition: 'opacity 0.25s ease',
                    boxShadow: `0 0 12px ${color}`,
                }}
            />
        </div>
    );
};

export default GhostTrailCursor;