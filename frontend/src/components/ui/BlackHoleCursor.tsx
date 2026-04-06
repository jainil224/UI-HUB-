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

        // Realistic stellar spectral colors (O/B/A/F/G/K/M classes + nebula dust)
        const colors = [
            'rgba(255, 255, 255, 1.0)',   // A-class: Pure white
            'rgba(200, 225, 255, 0.95)',  // B-class: Blue-white
            'rgba(165, 210, 255, 0.90)',  // O-class: Hot blue
            'rgba(192, 132, 252, 0.80)',  // Violet: young hot star
            'rgba(255, 240, 210, 0.85)',  // F-class: Warm white
            'rgba(255, 210, 140, 0.75)',  // K-class: Orange giant
            'rgba(255, 170, 90,  0.65)',  // Giant orange
            'rgba(255, 120, 80,  0.55)',  // M-class: Red dwarf
            'rgba(180, 210, 255, 0.50)',  // Distant blue cluster
            'rgba(255, 255, 255, 0.25)',  // Far stardust
            'rgba(200, 180, 255, 0.20)',  // Purple nebula haze
        ];

        const initParticles = () => {
            particles = [];
            // Dense galactic star field — 3× more stars than before
            const numParticles = Math.floor((width * height) / 600);
            for (let i = 0; i < numParticles; i++) {
                particles.push(createParticle(true));
            }
        };

        const createParticle = (randomizePosition = false) => {
            let x, y;
            if (randomizePosition) {
                // Layered density: galactic core cluster + mid band + scattered field
                const r = Math.random();
                if (r < 0.25) {
                    // Dense galactic core — tightly packed centre
                    x = width / 2 + (Math.random() - 0.5) * width * 0.25;
                    y = height / 2 + (Math.random() - 0.5) * height * 0.25;
                } else if (r < 0.55) {
                    // Mid galactic band — slight horizontal spread
                    x = width / 2 + (Math.random() - 0.5) * width * 0.7;
                    y = height / 2 + (Math.random() - 0.5) * height * 0.35;
                } else {
                    // Scattered outer field
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
            // Size tiers: rare giants (4px) → mediums → fine dust
            const size = magnitude < 0.008 ? Math.random() * 2.5 + 2.5   // rare bright giant
                       : magnitude < 0.06  ? Math.random() * 1.5 + 1.2   // medium bright
                       : magnitude < 0.25  ? Math.random() * 0.9 + 0.5   // small
                       : Math.random() * 0.5 + 0.1;                       // fine dust
            return {
                x, y,
                vx: (Math.random() - 0.5) * 0.20,
                vy: (Math.random() - 0.5) * 0.20,
                size,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkle: Math.random() * 0.05 + 0.008,
                phase: Math.random() * Math.PI * 2,
                // Bright stars get a glow halo
                glow: size > 2.0,
            };
        };

        const resize = () => {
            const container = containerRef?.current || window;
            width = container === window ? window.innerWidth : (container as HTMLElement).getBoundingClientRect().width;
            height = container === window ? window.innerHeight : (container as HTMLElement).getBoundingClientRect().height;
            canvas.width = width;
            canvas.height = height;
            initParticles();
        };

        setTimeout(resize, 0);
        window.addEventListener('resize', resize);

        const render = (time: number) => {
            ctx.clearRect(0, 0, width, height);

            smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.12;
            smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.12;

            if (coreRef.current) {
                if (mouse.current.isActive) {
                    coreRef.current.style.transform = `translate(${smoothMouse.current.x}px, ${smoothMouse.current.y}px) scale(${mouse.current.isHover ? 1.4 : 1})`;
                    coreRef.current.style.opacity = '1';
                    coreRef.current.style.filter = mouse.current.isHover ? 'brightness(1.5)' : 'brightness(1)';
                } else {
                    coreRef.current.style.opacity = '0';
                }
            }

            const currentGravityRadius = mouse.current.isHover ? gravityRadius * 1.6 : gravityRadius;

            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                if (mouse.current.isActive) {
                    const dx = smoothMouse.current.x - p.x;
                    const dy = smoothMouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < currentGravityRadius) {
                        const force = (currentGravityRadius - dist) / currentGravityRadius;
                        const angle = Math.atan2(dy, dx);
                        const pull = force * (mouse.current.isHover ? 1.8 : 1.2);
                        const spiral = force * 3.2;

                        p.vx += Math.cos(angle) * pull - Math.sin(angle) * spiral;
                        p.vy += Math.sin(angle) * pull + Math.cos(angle) * spiral;

                        p.vx *= 0.92;
                        p.vy *= 0.92;

                        ctx.shadowBlur = force * 15;
                        ctx.shadowColor = p.color;

                        if (dist < 15) {
                            particles[i] = createParticle(false);
                            continue;
                        }
                    } else {
                        ctx.shadowBlur = 0;
                        p.vx += (Math.random() - 0.5) * 0.05;
                        p.vy += (Math.random() - 0.5) * 0.05;
                        p.vx *= 0.99;
                        p.vy *= 0.99;
                    }
                } else {
                    ctx.shadowBlur = 0;
                    p.vx += (Math.random() - 0.5) * 0.02;
                    p.vy += (Math.random() - 0.5) * 0.02;
                    p.vx *= 0.99;
                    p.vy *= 0.99;
                }

                p.x += p.vx;
                p.y += p.vy;

                let baseAlpha = 0.55 + Math.sin(time * p.twinkle + p.phase) * 0.40;
                let alpha = baseAlpha;

                if (mouse.current.isActive) {
                    const dx = smoothMouse.current.x - p.x;
                    const dy = smoothMouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 40) {
                        alpha *= Math.max(0, (dist - 15) / 25);
                    }
                }

                ctx.globalAlpha = Math.max(0, alpha);

                // Draw glow halo for bright stars
                if (p.glow && alpha > 0.1) {
                    const glowSize = p.size * 4;
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowSize);
                    gradient.addColorStop(0, p.color.replace(/[\d.]+\)$/, `${(alpha * 0.6).toFixed(2)})`) );
                    gradient.addColorStop(1, p.color.replace(/[\d.]+\)$/, '0)'));
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
                    ctx.fillStyle = gradient;
                    ctx.fill();
                }

                // Draw the star core
                ctx.globalAlpha = Math.max(0, alpha);
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
                    particles[i] = createParticle(false);
                }
            }

            ctx.globalAlpha = 1;
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

        return () => {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousemove', onMouseMove as any);
            container.removeEventListener('mouseleave', onMouseLeave as any);
            container.removeEventListener('mouseover', onMouseOverElement as any);
            container.removeEventListener('mouseout', onMouseOutElement as any);
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
