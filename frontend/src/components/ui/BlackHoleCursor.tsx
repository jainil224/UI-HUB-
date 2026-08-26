import React, { useEffect, useRef } from 'react';

interface BlackHoleCursorProps {
    /** Distance at which particles feel the gravitational pull */
    gravityRadius?: number;
    className?: string;
    /** Track mouse relative to this container if provided */
    containerRef?: React.RefObject<HTMLElement>;
    children?: React.ReactNode;
}

export const BlackHoleCursor: React.FC<BlackHoleCursorProps> = ({
    gravityRadius = 250,
    className = '',
    containerRef,
    children
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const coreRef = useRef<HTMLDivElement>(null);
    const mouse = useRef({ x: -999, y: -999, isActive: false, isHover: false });
    const smoothMouse = useRef({ x: -999, y: -999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: any[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;
        // Pre-rendered glow sprites keyed by hex color — created ONCE at init, reused every frame
        const glowSprites: Map<string, HTMLCanvasElement> = new Map();

        // Compact hex palette for sprite keys (avoids rgba string overhead)
        const palette = [
            '#ffffff', // A-class white
            '#c8e1ff', // B-class blue-white
            '#a5d2ff', // O-class hot blue
            '#c084fc', // Violet young star
            '#fff0d2', // F-class warm white
            '#ffd28c', // K-class orange giant
            '#ffaa5a', // Giant orange
            '#ff7850', // M-class red dwarf
            '#b4d2ff', // Distant blue cluster
            '#aaaaaa', // Far stardust
        ];

        // Build an offscreen glow sprite for a given hex color (done ONCE per color at init)
        const buildGlowSprite = (hex: string, radius: number): HTMLCanvasElement => {
            const size = radius * 2;
            const oc = document.createElement('canvas');
            oc.width = size; oc.height = size;
            const octx = oc.getContext('2d')!;
            const grad = octx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            grad.addColorStop(0, hex + 'aa');
            grad.addColorStop(0.4, hex + '44');
            grad.addColorStop(1, hex + '00');
            octx.fillStyle = grad;
            octx.fillRect(0, 0, size, size);
            return oc;
        };

        const initParticles = () => {
            particles = [];
            glowSprites.clear();
            // Build glow sprites once per palette color
            palette.forEach(hex => {
                glowSprites.set(hex, buildGlowSprite(hex, 14));
            });
            // Sweet spot: enough stars to show gravity, not so many to slow down
            const numParticles = Math.floor((width * height) / 1100);
            for (let i = 0; i < numParticles; i++) {
                particles.push(createParticle(true));
            }
        };

        const createParticle = (randomizePosition = false) => {
            let x, y;
            if (randomizePosition) {
                const r = Math.random();
                if (r < 0.25) {
                    x = width / 2 + (Math.random() - 0.5) * width * 0.25;
                    y = height / 2 + (Math.random() - 0.5) * height * 0.25;
                } else if (r < 0.55) {
                    x = width / 2 + (Math.random() - 0.5) * width * 0.7;
                    y = height / 2 + (Math.random() - 0.5) * height * 0.35;
                } else {
                    x = Math.random() * width;
                    y = Math.random() * height;
                }
            } else {
                const edge = Math.floor(Math.random() * 4);
                if (edge === 0) { x = Math.random() * width; y = -10; }
                else if (edge === 1) { x = width + 10; y = Math.random() * height; }
                else if (edge === 2) { x = Math.random() * width; y = height + 10; }
                else { x = -10; y = Math.random() * height; }
            }
            const magnitude = Math.random();
            const size = magnitude < 0.008 ? Math.random() * 2.0 + 2.2
                       : magnitude < 0.06  ? Math.random() * 1.2 + 1.0
                       : magnitude < 0.25  ? Math.random() * 0.8 + 0.4
                       : Math.random() * 0.4 + 0.1;
            const colorHex = palette[Math.floor(Math.random() * palette.length)];
            return {
                x, y,
                vx: (Math.random() - 0.5) * 0.18,
                vy: (Math.random() - 0.5) * 0.18,
                // Deterministic drift offset — replaces Math.random() in hot loop
                driftX: (Math.random() - 0.5) * 0.04,
                driftY: (Math.random() - 0.5) * 0.04,
                size,
                colorHex,
                twinkle: Math.random() * 0.04 + 0.006,
                phase: Math.random() * Math.PI * 2,
                glow: size > 1.8,
            };
        };

        let didInitCenter = false;
        const resize = () => {
            const container = containerRef?.current || window;
            width = container === window ? window.innerWidth : (container as HTMLElement).getBoundingClientRect().width;
            height = container === window ? window.innerHeight : (container as HTMLElement).getBoundingClientRect().height;
            // DPR-aware backing store for crisp stars (capped at 2x for perf)
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.max(1, Math.floor(width * dpr));
            canvas.height = Math.max(1, Math.floor(height * dpr));
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            // Start the black hole at the center, active — visible instantly (and on touch devices)
            if (!didInitCenter) {
                didInitCenter = true;
                mouse.current.x = width / 2;
                mouse.current.y = height / 2;
                smoothMouse.current.x = width / 2;
                smoothMouse.current.y = height / 2;
                mouse.current.isActive = true;
            } else {
                mouse.current.x = Math.min(mouse.current.x, width);
                mouse.current.y = Math.min(mouse.current.y, height);
            }
            initParticles();
        };

        setTimeout(resize, 0);
        window.addEventListener('resize', resize);
        let resizeObserver: ResizeObserver | undefined;
        if (containerRef?.current) {
            resizeObserver = new ResizeObserver(resize);
            resizeObserver.observe(containerRef.current);
        }

        const render = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            // Cache refs into locals — avoids repeated .current dereferences in hot loop
            const smx = smoothMouse.current.x;
            const smy = smoothMouse.current.y;
            const isActive = mouse.current.isActive;
            const isHover  = mouse.current.isHover;

            smoothMouse.current.x += (mouse.current.x - smx) * 0.12;
            smoothMouse.current.y += (mouse.current.y - smy) * 0.12;

            if (coreRef.current) {
                if (isActive) {
                    coreRef.current.style.transform = `translate(${smx}px, ${smy}px) scale(${isHover ? 1.4 : 1})`;
                    coreRef.current.style.opacity = '1';
                    coreRef.current.style.filter = isHover ? 'brightness(1.5)' : 'brightness(1)';
                } else {
                    coreRef.current.style.opacity = '0';
                }
            }

            const currentGravityRadius = isHover ? gravityRadius * 1.6 : gravityRadius;
            const gravR2 = currentGravityRadius * currentGravityRadius;
            const pullStrength = isHover ? 1.8 : 1.2;

            // Disable shadowBlur for the whole frame — we use pre-baked glow sprites instead
            ctx.shadowBlur = 0;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                const dx = smx - p.x;
                const dy = smy - p.y;
                const dist2 = dx * dx + dy * dy;

                if (isActive && dist2 < gravR2) {
                    const dist = Math.sqrt(dist2); // sqrt only when inside radius
                    if (dist < 15) {
                        particles[i] = createParticle(false);
                        continue;
                    }
                    const force = (currentGravityRadius - dist) / currentGravityRadius;
                    const angle = Math.atan2(dy, dx);
                    const sinA = Math.sin(angle);
                    const cosA = Math.cos(angle);
                    const spiral = force * 3.0;
                    p.vx = (p.vx + cosA * force * pullStrength - sinA * spiral) * 0.92;
                    p.vy = (p.vy + sinA * force * pullStrength + cosA * spiral) * 0.92;
                } else {
                    // Deterministic micro-drift — no Math.random() in hot loop
                    p.vx = (p.vx + p.driftX) * 0.99;
                    p.vy = (p.vy + p.driftY) * 0.99;
                }

                p.x += p.vx;
                p.y += p.vy;

                // Recycle out-of-bounds particles
                if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
                    particles[i] = createParticle(false);
                    continue;
                }

                const baseAlpha = 0.55 + Math.sin(time * p.twinkle + p.phase) * 0.38;
                // Fade out near the event horizon
                const alpha = dist2 < 1600 // 40px² 
                    ? baseAlpha * Math.max(0, (Math.sqrt(dist2) - 15) / 25)
                    : baseAlpha;

                if (alpha <= 0) continue;

                // ── Draw glow halo using pre-baked sprite (no gradient creation per frame) ──
                if (p.glow) {
                    const sprite = glowSprites.get(p.colorHex);
                    if (sprite) {
                        ctx.globalAlpha = alpha * 0.55;
                        ctx.drawImage(sprite, p.x - 14, p.y - 14);
                    }
                }

                // ── Draw star core ──
                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.colorHex;
                ctx.fill();
            }

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
            animationFrameId = requestAnimationFrame(render);
        };

        animationFrameId = requestAnimationFrame(render);

        const onMouseMove = (e: MouseEvent) => {
            mouse.current.isActive = true;
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mouse.current.x = e.clientX - rect.left;
                mouse.current.y = e.clientY - rect.top;
            } else {
                mouse.current.x = e.clientX;
                mouse.current.y = e.clientY;
            }
        };

        const onMouseLeave = () => {
            mouse.current.isActive = false;
        };

        const onTouch = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                const t = e.touches[0];
                mouse.current.isActive = true;
                if (containerRef?.current) {
                    const rect = containerRef.current.getBoundingClientRect();
                    mouse.current.x = t.clientX - rect.left;
                    mouse.current.y = t.clientY - rect.top;
                } else {
                    mouse.current.x = t.clientX;
                    mouse.current.y = t.clientY;
                }
            }
        };

        const onMouseOverElement = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.tagName.toLowerCase() === 'button' || target.tagName.toLowerCase() === 'a' || target.closest('button, a, [data-magnetic]')) {
                mouse.current.isHover = true;
            }
        };

        const onMouseOutElement = (e: MouseEvent) => {
            const related = e.relatedTarget as HTMLElement;
            if (!related || (!related.tagName || (related.tagName.toLowerCase() !== 'button' && related.tagName.toLowerCase() !== 'a' && !related.closest('button, a, [data-magnetic]')))) {
                mouse.current.isHover = false;
            }
        };

        const container = containerRef?.current || window;
        container.addEventListener('mousemove', onMouseMove as any, { passive: true });
        container.addEventListener('mouseleave', onMouseLeave as any, { passive: true });
        container.addEventListener('mouseover', onMouseOverElement as any, { passive: true });
        container.addEventListener('mouseout', onMouseOutElement as any, { passive: true });
        container.addEventListener('touchstart', onTouch as any, { passive: true });
        container.addEventListener('touchmove', onTouch as any, { passive: true });

        return () => {
            window.removeEventListener('resize', resize);
            resizeObserver?.disconnect();
            container.removeEventListener('mousemove', onMouseMove as any);
            container.removeEventListener('mouseleave', onMouseLeave as any);
            container.removeEventListener('mouseover', onMouseOverElement as any);
            container.removeEventListener('mouseout', onMouseOutElement as any);
            container.removeEventListener('touchstart', onTouch as any);
            container.removeEventListener('touchmove', onTouch as any);
            cancelAnimationFrame(animationFrameId);
        };
    }, [containerRef, gravityRadius]);

    const pos = containerRef ? 'absolute' : 'fixed';

    return (
        <div className={className} style={{ position: pos, top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden', background: '#01010a' }}>

            {/* ── DEEP SPACE BASE GRADIENT ── */}
            <div style={{
                position: 'absolute', inset: 0,
                background: [
                    'radial-gradient(ellipse at 50% 50%, #0c0820 0%, #01010a 65%)',
                    'radial-gradient(ellipse at 20% 30%, #130d2e 0%, transparent 55%)',
                    'radial-gradient(ellipse at 80% 70%, #0a0618 0%, transparent 55%)',
                ].join(','),
                zIndex: -5,
            }} />

            {/* ── NEBULA 1: Violet gas cloud (upper-left) ── */}
            <div className="bh-bg-nebula1" style={{
                position: 'absolute',
                top: '-10%', left: '-5%',
                width: '55%', height: '65%',
                background: 'radial-gradient(ellipse at 60% 50%, rgba(120,60,220,0.45) 0%, rgba(80,30,160,0.25) 40%, transparent 70%)',
                filter: 'blur(55px)',
                zIndex: -4,
            }} />

            {/* ── NEBULA 2: Cyan/teal cloud (upper-right) ── */}
            <div className="bh-bg-nebula2" style={{
                position: 'absolute',
                top: '-15%', right: '-10%',
                width: '50%', height: '60%',
                background: 'radial-gradient(ellipse at 40% 60%, rgba(0,200,220,0.30) 0%, rgba(0,130,180,0.15) 45%, transparent 70%)',
                filter: 'blur(65px)',
                zIndex: -4,
            }} />

            {/* ── NEBULA 3: Deep crimson/magenta cloud (lower-left) ── */}
            <div className="bh-bg-nebula3" style={{
                position: 'absolute',
                bottom: '-10%', left: '-5%',
                width: '48%', height: '55%',
                background: 'radial-gradient(ellipse at 55% 40%, rgba(180,30,120,0.35) 0%, rgba(120,20,80,0.18) 45%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -4,
            }} />

            {/* ── NEBULA 4: Electric blue cloud (lower-right) ── */}
            <div className="bh-bg-nebula4" style={{
                position: 'absolute',
                bottom: '-15%', right: '-8%',
                width: '52%', height: '58%',
                background: 'radial-gradient(ellipse at 45% 45%, rgba(40,80,255,0.28) 0%, rgba(20,50,200,0.14) 45%, transparent 70%)',
                filter: 'blur(70px)',
                zIndex: -4,
            }} />

            {/* ── NEBULA 5: Warm amber core glow (centre) ── */}
            <div className="bh-bg-nebula5" style={{
                position: 'absolute',
                top: '20%', left: '25%',
                width: '50%', height: '50%',
                background: 'radial-gradient(ellipse at 50% 50%, rgba(180,90,20,0.18) 0%, rgba(120,50,10,0.10) 45%, transparent 75%)',
                filter: 'blur(80px)',
                zIndex: -3,
            }} />

            {/* ── GALACTIC DUST LANE (diagonal sweep) ── */}
            <div className="bh-bg-dustlane" style={{
                position: 'absolute',
                top: '30%', left: '-10%',
                width: '120%', height: '28%',
                background: 'linear-gradient(135deg, transparent 0%, rgba(80,40,140,0.12) 20%, rgba(100,60,160,0.22) 45%, rgba(40,80,140,0.14) 70%, transparent 100%)',
                filter: 'blur(30px)',
                transform: 'rotate(-8deg)',
                zIndex: -3,
            }} />

            {/* ── GRAVITATIONAL LENSING PULSE (centre halo) ── */}
            <div className="bh-bg-gravity-pulse" style={{
                position: 'absolute',
                top: '50%', left: '50%',
                width: '260px', height: '260px',
                marginTop: '-130px', marginLeft: '-130px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(100,50,200,0.22) 0%, rgba(60,20,120,0.12) 45%, transparent 75%)',
                filter: 'blur(20px)',
                zIndex: -2,
            }} />

            {/* ── DARK VIGNETTE (edge darkening) ── */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(1,1,10,0.55) 70%, rgba(0,0,5,0.85) 100%)',
                zIndex: -1,
                pointerEvents: 'none',
            }} />

            <style>{`
                @keyframes bh-bg-nebula1-drift {
                    0%,100% { transform: translate(0,0) scale(1); }
                    33%     { transform: translate(3%,2%) scale(1.04); }
                    66%     { transform: translate(-2%,3%) scale(0.97); }
                }
                @keyframes bh-bg-nebula2-drift {
                    0%,100% { transform: translate(0,0) scale(1); }
                    33%     { transform: translate(-3%,-2%) scale(1.03); }
                    66%     { transform: translate(2%,-3%) scale(0.98); }
                }
                @keyframes bh-bg-nebula3-drift {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50%     { transform: translate(2%,-2%) scale(1.05); }
                }
                @keyframes bh-bg-nebula4-drift {
                    0%,100% { transform: translate(0,0) scale(1); }
                    50%     { transform: translate(-2%,2%) scale(1.04); }
                }
                @keyframes bh-bg-nebula5-breathe {
                    0%,100% { opacity: 0.7; transform: scale(1); }
                    50%     { opacity: 1.0; transform: scale(1.08); }
                }
                @keyframes bh-bg-gravity-pulse {
                    0%,100% { transform: translate(-50%,-50%) scale(1);   opacity: 0.7; }
                    50%     { transform: translate(-50%,-50%) scale(1.35); opacity: 1.0; }
                }
                @keyframes bh-bg-dustlane-shimmer {
                    0%,100% { opacity: 0.8; }
                    50%     { opacity: 1.2; }
                }
                .bh-bg-nebula1 { animation: bh-bg-nebula1-drift 20s ease-in-out infinite; }
                .bh-bg-nebula2 { animation: bh-bg-nebula2-drift 25s ease-in-out infinite; }
                .bh-bg-nebula3 { animation: bh-bg-nebula3-drift 18s ease-in-out infinite; }
                .bh-bg-nebula4 { animation: bh-bg-nebula4-drift 22s ease-in-out infinite; }
                .bh-bg-nebula5 { animation: bh-bg-nebula5-breathe 8s ease-in-out infinite; }
                .bh-bg-gravity-pulse {
                    position: absolute;
                    top: 50%; left: 50%;
                    animation: bh-bg-gravity-pulse 6s ease-in-out infinite;
                }
                .bh-bg-dustlane { animation: bh-bg-dustlane-shimmer 15s ease-in-out infinite; }
            `}</style>

            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: 0 }} />

            {/* Content Layer (Home, About etc) */}
            <div style={{ position: 'relative', zIndex: 10, width: '100%', height: '100%', pointerEvents: 'auto' }}>
                {children}
            </div>

            <div
                ref={coreRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: 0, height: 0,
                    opacity: 0,
                    transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.1s linear',
                    pointerEvents: 'none',
                }}
            >
                {/* ── Realistic Black Hole SVG ── */}
                <svg
                    className="bh-svg-root"
                    width="180" height="180"
                    viewBox="-90 -90 180 180"
                    style={{ position: 'absolute', top: -90, left: -90, overflow: 'visible', zIndex: 10 }}
                >
                    <defs>
                        {/* Outer soft gravitational glow */}
                        <radialGradient id="bhGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stopColor="#7c3aed" stopOpacity="0.0" />
                            <stop offset="55%"  stopColor="#4338ca" stopOpacity="0.08" />
                            <stop offset="80%"  stopColor="#1e1b4b" stopOpacity="0.18" />
                            <stop offset="100%" stopColor="#000"    stopOpacity="0.0" />
                        </radialGradient>

                        {/* Accretion disk outer halo – warm orange/amber */}
                        <radialGradient id="diskOuter" cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
                            <stop offset="0%"   stopColor="#ff6600" stopOpacity="0.0" />
                            <stop offset="40%"  stopColor="#ff8800" stopOpacity="0.55" />
                            <stop offset="70%"  stopColor="#ffaa00" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#ff4400" stopOpacity="0.0" />
                        </radialGradient>

                        {/* Disk inner hot streak – white-orange */}
                        <linearGradient id="diskHot" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#fff" stopOpacity="0.0" />
                            <stop offset="20%"  stopColor="#ffe0a0" stopOpacity="0.7" />
                            <stop offset="50%"  stopColor="#fffaf0" stopOpacity="1.0" />
                            <stop offset="80%"  stopColor="#ffcc44" stopOpacity="0.7" />
                            <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Photon ring glow */}
                        <radialGradient id="photonRing" cx="50%" cy="50%" r="50%">
                            <stop offset="70%"  stopColor="#fff"    stopOpacity="0.0" />
                            <stop offset="85%"  stopColor="#a5f3fc" stopOpacity="0.9" />
                            <stop offset="92%"  stopColor="#ffffff" stopOpacity="1.0" />
                            <stop offset="100%" stopColor="#a5f3fc" stopOpacity="0.0" />
                        </radialGradient>

                        {/* Shadow lensing mask - cuts out behind the event horizon */}
                        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                            <stop offset="0%"   stopColor="#000" stopOpacity="1" />
                            <stop offset="100%" stopColor="#000" stopOpacity="0" />
                        </radialGradient>

                        {/* Jet gradient */}
                        <linearGradient id="jetTop" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.8" />
                            <stop offset="60%"  stopColor="#818cf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
                        </linearGradient>
                        <linearGradient id="jetBot" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%"   stopColor="#60a5fa" stopOpacity="0.8" />
                            <stop offset="60%"  stopColor="#818cf8" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
                        </linearGradient>

                        {/* Filter: outer ambient glow render */}
                        <filter id="glowBlur" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="8" result="blur" />
                            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                        </filter>
                        <filter id="diskBlur">
                            <feGaussianBlur stdDeviation="2.5" />
                        </filter>
                        <filter id="diskBlurOuter">
                            <feGaussianBlur stdDeviation="6" />
                        </filter>
                        <filter id="jetBlur">
                            <feGaussianBlur stdDeviation="3" />
                        </filter>
                        <filter id="photonBlur">
                            <feGaussianBlur stdDeviation="1.2" />
                        </filter>
                    </defs>

                    {/* ── 1. Wide ambient gravitational glow ── */}
                    <circle cx="0" cy="0" r="75" fill="url(#bhGlow)" />

                    {/* ── 2. Relativistic jet TOP (blue) ── */}
                    <g filter="url(#jetBlur)" className="bh-jet-top">
                        <ellipse cx="0" cy="-20" rx="5" ry="55" fill="url(#jetTop)" opacity="0.7" />
                        <ellipse cx="0" cy="-20" rx="2" ry="50"  fill="url(#jetTop)" opacity="0.9" />
                    </g>

                    {/* ── 3. Relativistic jet BOTTOM (blue) ── */}
                    <g filter="url(#jetBlur)" className="bh-jet-bot">
                        <ellipse cx="0" cy="20" rx="5" ry="55" fill="url(#jetBot)" opacity="0.7" />
                        <ellipse cx="0" cy="20" rx="2" ry="50"  fill="url(#jetBot)" opacity="0.9" />
                    </g>

                    {/* ── 4. Outer accretion disk band (tilted ellipse) ── */}
                    <g className="bh-disk-outer" filter="url(#diskBlurOuter)">
                        <ellipse cx="0" cy="0" rx="58" ry="14" fill="url(#diskOuter)" opacity="0.85" />
                    </g>

                    {/* ── 5. Mid accretion band ── */}
                    <g className="bh-disk-mid" filter="url(#diskBlur)">
                        <ellipse cx="0" cy="0" rx="44" ry="9" fill="none"
                            stroke="#ff7700" strokeWidth="5" strokeOpacity="0.6" />
                        <ellipse cx="0" cy="0" rx="38" ry="7" fill="none"
                            stroke="#ffaa00" strokeWidth="3" strokeOpacity="0.5" />
                    </g>

                    {/* ── 6. Hot inner disk streak (brightest, near event horizon) ── */}
                    <g className="bh-disk-hot">
                        <ellipse cx="0" cy="0" rx="28" ry="5.5" fill="none"
                            stroke="url(#diskHot)" strokeWidth="4" strokeOpacity="0.95" />
                        <ellipse cx="0" cy="0" rx="22" ry="4" fill="none"
                            stroke="#fffaf0" strokeWidth="2" strokeOpacity="0.8" />
                    </g>

                    {/* ── 7. Gravitational lensing arcs (thin bright arcs) ── */}
                    <g className="bh-lensing" opacity="0.55">
                        {/* Top arc (lensed image of the far disk) */}
                        <path d="M -32,-18 Q 0,-32 32,-18" fill="none"
                            stroke="#ffcc66" strokeWidth="2" strokeLinecap="round" />
                        {/* Bottom arc */}
                        <path d="M -32,18 Q 0,32 32,18" fill="none"
                            stroke="#ffcc66" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
                    </g>

                    {/* ── 8. Photon ring (bright ring just outside shadow) ── */}
                    <g filter="url(#photonBlur)" className="bh-photon">
                        <circle cx="0" cy="0" r="18" fill="none"
                            stroke="#a5f3fc" strokeWidth="2.2" strokeOpacity="0.95" />
                        <circle cx="0" cy="0" r="18" fill="none"
                            stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.7" />
                    </g>

                    {/* ── 9. Schwarzschild shadow (true event horizon) ── */}
                    {/* The black hole shadow is ~2.6× the Schwarzschild radius → r=16 ≈ photon sphere */}
                    <circle cx="0" cy="0" r="15.5"
                        fill="#000"
                        style={{ filter: 'drop-shadow(0 0 6px #7c3aed)' }} />

                    {/* Subtle inner lensing highlight on the rim (bright crescent from disk behind) */}
                    <path d="M -10,-12 Q 0,-17 10,-12" fill="none"
                        stroke="#ffe0a0" strokeWidth="1.2" strokeOpacity="0.4" strokeLinecap="round" />
                </svg>
            </div>

            <style>{`
                @keyframes bh-disk-outer-rot {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                @keyframes bh-disk-hot-rot {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(-360deg); }
                }
                @keyframes bh-photon-pulse {
                    0%,100% { opacity: 0.85; }
                    50%     { opacity: 1.0; }
                }
                @keyframes bh-jet-flicker {
                    0%,100% { opacity: 0.65; transform: scaleX(1); }
                    30%     { opacity: 0.9;  transform: scaleX(1.15); }
                    60%     { opacity: 0.7;  transform: scaleX(0.9); }
                }
                @keyframes bh-lensing-shimmer {
                    0%,100% { opacity: 0.45; }
                    50%     { opacity: 0.75; }
                }
                .bh-disk-outer { animation: bh-disk-outer-rot 18s linear infinite; transform-origin: 0 0; }
                .bh-disk-mid   { animation: bh-disk-outer-rot 12s linear infinite; transform-origin: 0 0; }
                .bh-disk-hot   { animation: bh-disk-hot-rot 5s linear infinite; transform-origin: 0 0; }
                .bh-photon     { animation: bh-photon-pulse 2.5s ease-in-out infinite; }
                .bh-jet-top    { animation: bh-jet-flicker 3.5s ease-in-out infinite; }
                .bh-jet-bot    { animation: bh-jet-flicker 4.0s ease-in-out infinite 0.5s; }
                .bh-lensing    { animation: bh-lensing-shimmer 4s ease-in-out infinite; }
            `}</style>
        </div>
    );
};

export default BlackHoleCursor;
