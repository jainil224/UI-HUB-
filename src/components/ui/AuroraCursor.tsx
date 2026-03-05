import React, { useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuroraCursorProps {
    /** Diameter of the aurora glow blob in pixels */
    size?: number;
    /** Spring stiffness (lower = more lag, higher = snappier) */
    stiffness?: number;
    /** Spring damping */
    damping?: number;
    /** Additional CSS class on the wrapper */
    className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const AuroraCursor: React.FC<AuroraCursorProps> = ({
    size = 320,
    stiffness = 0.06,
    damping = 0.82,
    className = '',
}) => {
    const blobRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);

    // Current & target positions (raw values, no state to avoid re-renders)
    const pos = useRef({ x: -999, y: -999 });
    const target = useRef({ x: -999, y: -999 });
    const vel = useRef({ x: 0, y: 0 });
    const frameId = useRef<number>(0);
    const isHovering = useRef(false);

    // Track mouse position
    const onMouseMove = useCallback((e: MouseEvent) => {
        target.current = { x: e.clientX, y: e.clientY };
    }, []);

    // Detect hoverable elements
    const onMouseOver = useCallback((e: MouseEvent) => {
        const el = e.target as HTMLElement;
        if (el.closest('a, button, [role="button"], input, textarea, select, label')) {
            isHovering.current = true;
            if (innerRef.current) {
                innerRef.current.style.transform = 'scale(1.35)';
                innerRef.current.style.opacity = '0.85';
            }
        }
    }, []);

    const onMouseOut = useCallback((e: MouseEvent) => {
        const el = e.relatedTarget as HTMLElement | null;
        if (!el?.closest('a, button, [role="button"], input, textarea, select, label')) {
            isHovering.current = false;
            if (innerRef.current) {
                innerRef.current.style.transform = 'scale(1)';
                innerRef.current.style.opacity = '0.6';
            }
        }
    }, []);

    // Spring animation loop
    const animate = useCallback(() => {
        const tx = target.current.x;
        const ty = target.current.y;

        // Spring physics
        vel.current.x += (tx - pos.current.x) * stiffness;
        vel.current.y += (ty - pos.current.y) * stiffness;
        vel.current.x *= damping;
        vel.current.y *= damping;
        pos.current.x += vel.current.x;
        pos.current.y += vel.current.y;

        if (blobRef.current) {
            const half = size / 2;
            blobRef.current.style.transform =
                `translate(${pos.current.x - half}px, ${pos.current.y - half}px)`;
        }

        frameId.current = requestAnimationFrame(animate);
    }, [size, stiffness, damping]);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseover', onMouseOver, { passive: true });
        window.addEventListener('mouseout', onMouseOut, { passive: true });
        frameId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onMouseOver);
            window.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(frameId.current);
        };
    }, [onMouseMove, onMouseOver, onMouseOut, animate]);

    return (
        <>
            {/* ── Injected keyframe styles ── */}
            <style>{`
                @keyframes aurora-shift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes aurora-morph {
                    0%   { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                    25%  { border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%; }
                    50%  { border-radius: 50% 50% 40% 60% / 30% 60% 40% 70%; }
                    75%  { border-radius: 30% 70% 60% 40% / 70% 40% 60% 30%; }
                    100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
                @keyframes aurora-pulse {
                    0%, 100% { opacity: 0.55; }
                    50%       { opacity: 0.75; }
                }
                .aurora-blob-inner {
                    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
                                opacity 0.4s ease;
                }
            `}</style>

            {/* ── Wrapper (fixed, pointer-events off so it never blocks clicks) ── */}
            <div
                className={className}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: size,
                    height: size,
                    pointerEvents: 'none',
                    zIndex: 9999,
                    willChange: 'transform',
                }}
                ref={blobRef}
            >
                {/* ── Aurora inner blob ── */}
                <div
                    ref={innerRef}
                    className="aurora-blob-inner"
                    style={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.6,
                        background: `
                            radial-gradient(circle at 30% 30%, rgba(139,92,246,0.9) 0%, transparent 55%),
                            radial-gradient(circle at 70% 60%, rgba(6,182,212,0.8) 0%, transparent 55%),
                            radial-gradient(circle at 50% 80%, rgba(236,72,153,0.7) 0%, transparent 50%),
                            radial-gradient(circle at 20% 70%, rgba(99,102,241,0.8) 0%, transparent 50%),
                            radial-gradient(circle at 80% 20%, rgba(34,211,238,0.6) 0%, transparent 50%)
                        `,
                        backgroundSize: '400% 400%',
                        filter: `blur(${size * 0.22}px)`,
                        animation: `
                            aurora-shift 8s ease infinite,
                            aurora-morph 12s ease-in-out infinite,
                            aurora-pulse 4s ease-in-out infinite
                        `,
                        mixBlendMode: 'screen',
                    }}
                />
            </div>
        </>
    );
};

export default AuroraCursor;
