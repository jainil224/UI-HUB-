import React, { useEffect, useRef, useCallback } from 'react';

interface MagneticCursorProps {
    /** Radius in px within which elements feel the magnetic pull */
    magnetRadius?: number;
    /** Cursor dot diameter */
    cursorSize?: number;
    className?: string;
    /** If provided, tracks mouse relative to this container and uses absolute positioning */
    containerRef?: React.RefObject<HTMLElement>;
}

export const MagneticCursor: React.FC<MagneticCursorProps> = ({
    magnetRadius = 120,
    cursorSize = 20,
    className = '',
    containerRef,
}) => {
    const dotRef = useRef<HTMLDivElement>(null);
    const haloRef = useRef<HTMLDivElement>(null);

    // Spring state (no React state to avoid re-renders)
    const mouse = useRef({ x: -999, y: -999, absX: -999, absY: -999 });
    const dot = useRef({ x: -999, y: -999 });
    const dotVel = useRef({ x: 0, y: 0 });
    const halo = useRef({ x: -999, y: -999 });
    const haloVel = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>(0);
    const isHover = useRef(false);

    // Magnetic elements registry
    const magnets = useRef<HTMLElement[]>([]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (containerRef?.current) {
            const rect = containerRef.current.getBoundingClientRect();
            mouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                absX: e.clientX,
                absY: e.clientY
            };
        } else {
            mouse.current = {
                x: e.clientX,
                y: e.clientY,
                absX: e.clientX,
                absY: e.clientY
            };
        }
    }, [containerRef]);

    const animate = useCallback(() => {
        const mx = mouse.current.x;
        const my = mouse.current.y;
        const absX = mouse.current.absX;
        const absY = mouse.current.absY;

        // ── Dot (fast spring) ──────────────────────────────────
        dotVel.current.x += (mx - dot.current.x) * 0.22;
        dotVel.current.y += (my - dot.current.y) * 0.22;
        dotVel.current.x *= 0.72;
        dotVel.current.y *= 0.72;
        dot.current.x += dotVel.current.x;
        dot.current.y += dotVel.current.y;

        // ── Halo (slow spring) ─────────────────────────────────
        haloVel.current.x += (mx - halo.current.x) * 0.09;
        haloVel.current.y += (my - halo.current.y) * 0.09;
        haloVel.current.x *= 0.80;
        haloVel.current.y *= 0.80;
        halo.current.x += haloVel.current.x;
        halo.current.y += haloVel.current.y;

        const half = cursorSize / 2;
        const haloHalf = isHover.current ? 36 : 28;

        if (dotRef.current) {
            dotRef.current.style.transform =
                `translate(${dot.current.x - half}px, ${dot.current.y - half}px) scale(${isHover.current ? 1.7 : 1})`;
        }
        if (haloRef.current) {
            haloRef.current.style.transform =
                `translate(${halo.current.x - haloHalf}px, ${halo.current.y - haloHalf}px) scale(${isHover.current ? 1.4 : 1})`;
        }

        // ── Magnetic pull on nearby elements ───────────────────
        magnets.current.forEach(el => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = absX - cx;
            const dy = absY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < magnetRadius) {
                const strength = (1 - dist / magnetRadius);
                const tx = dx * strength * 0.38;
                const ty = dy * strength * 0.38;
                el.style.transform = `translate(${tx}px, ${ty}px) scale(${1 + strength * 0.04})`;
                el.style.boxShadow = `0 0 ${20 + strength * 30}px rgba(139,92,246,${0.2 + strength * 0.4})`;
            } else {
                el.style.transform = 'translate(0,0) scale(1)';
                el.style.boxShadow = '';
            }
        });

        rafId.current = requestAnimationFrame(animate);
    }, [cursorSize, magnetRadius]);

    const onOver = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-magnetic]')) isHover.current = true;
    }, []);

    const onOut = useCallback((e: MouseEvent) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related?.closest('[data-magnetic]')) isHover.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseover', onOver, { passive: true });
        window.addEventListener('mouseout', onOut, { passive: true });
        rafId.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover', onOver);
            window.removeEventListener('mouseout', onOut);
            cancelAnimationFrame(rafId.current);
        };
    }, [onMouseMove, onOver, onOut, animate]);

    // Public imperative handle: register/unregister magnetic elements
    const registerMagnet = useCallback((el: HTMLElement | null) => {
        if (!el) return;
        el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease';
        el.setAttribute('data-magnetic', '');
        if (!magnets.current.includes(el)) magnets.current.push(el);
        return () => {
            magnets.current = magnets.current.filter(m => m !== el);
            el.style.transform = '';
        };
    }, []);

    // expose registerMagnet via context or just return helpers
    (MagneticCursor as any)._register = registerMagnet;

    const pos = containerRef ? 'absolute' : 'fixed';

    return (
        <div className={className} style={{ position: pos, top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
            <style>{`
                .mc-dot  { transition: transform 0.08s linear, opacity 0.3s; }
                .mc-halo { transition: transform 0.25s ease, opacity 0.3s; }
            `}</style>

            {/* Dot */}
            <div ref={dotRef} className="mc-dot" style={{
                position: pos, top: 0, left: 0,
                width: cursorSize, height: cursorSize,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,150,255,1) 0%, rgba(99,102,241,0.8) 60%, transparent 100%)',
                filter: 'blur(1px)',
                willChange: 'transform',
            }} />

            {/* Halo */}
            <div ref={haloRef} className="mc-halo" style={{
                position: pos, top: 0, left: 0,
                width: 56, height: 56,
                borderRadius: '50%',
                border: '1.5px solid rgba(139,92,246,0.5)',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                filter: 'blur(0.5px)',
                willChange: 'transform',
            }} />
        </div>
    );
};

export default MagneticCursor;
