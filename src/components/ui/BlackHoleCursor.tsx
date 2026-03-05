import React, { useEffect, useRef } from 'react';

interface BlackHoleCursorProps {
    /** Distance at which particles feel the gravitational pull */
    gravityRadius?: number;
    className?: string;
    /** Track mouse relative to this container if provided */
    containerRef?: React.RefObject<HTMLElement>;
}

export const BlackHoleCursor: React.FC<BlackHoleCursorProps> = ({
    gravityRadius = 250,
    className = '',
    containerRef,
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

        // Cinematic Deep Space Colors (Star temperatures)
        const colors = [
            'rgba(255, 255, 255, 0.9)', // White star
            'rgba(165, 243, 252, 0.9)', // Blue-White
            'rgba(192, 132, 252, 0.7)', // Violet-White
            'rgba(255, 230, 200, 0.8)', // Warm-White
            'rgba(255, 255, 255, 0.2)'  // Distant stardust
        ];

        const initParticles = () => {
            particles = [];
            // Cinematic Galactic Density
            const numParticles = Math.floor((width * height) / 2000);
            for (let i = 0; i < numParticles; i++) {
                particles.push(createParticle(true));
            }
        };

        const createParticle = (randomizePosition = false) => {
            let x, y;
            if (randomizePosition) {
                // Focus density towards the center for a galactic core look
                if (Math.random() < 0.4) {
                    x = width / 2 + (Math.random() - 0.5) * width * 0.4;
                    y = height / 2 + (Math.random() - 0.5) * height * 0.4;
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
            return {
                x,
                y,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.3) * 0.25,
                // Cinematic variety: very tiny dust vs occasional bright stars
                size: magnitude < 0.02 ? Math.random() * 3 + 1 : magnitude < 0.2 ? Math.random() * 1.5 + 0.5 : Math.random() * 0.8 + 0.1,
                color: colors[Math.floor(Math.random() * colors.length)],
                twinkle: Math.random() * 0.04 + 0.005,
                phase: Math.random() * Math.PI * 2
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

                let baseAlpha = 0.4 + Math.sin(time * p.twinkle + p.phase) * 0.35;
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
        <div className={className} style={{ position: pos, top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden', background: '#000' }}>
            {/* --- Deep Space Nebula Layers --- */}
            {/* Broad Ambient Nebula */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(circle at 30% 40%, rgba(67, 56, 202, 0.08) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.05) 0%, transparent 60%)',
                zIndex: -3,
            }} />

            {/* Cosmic Cloud 1 */}
            <div style={{
                position: 'absolute',
                top: '10%', left: '20%',
                width: '60%', height: '60%',
                background: 'radial-gradient(ellipse at center, rgba(6, 182, 212, 0.04) 0%, transparent 70%)',
                filter: 'blur(60px)',
                zIndex: -2,
                transform: 'rotate(-15deg)',
            }} />

            {/* Cosmic Cloud 2 */}
            <div style={{
                position: 'absolute',
                bottom: '10%', right: '15%',
                width: '50%', height: '50%',
                background: 'radial-gradient(ellipse at center, rgba(139, 92, 246, 0.03) 0%, transparent 70%)',
                filter: 'blur(50px)',
                zIndex: -2,
                transform: 'rotate(20deg)',
            }} />

            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none', position: 'absolute', inset: 0, zIndex: -1 }} />

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
                {/* Lensing Glow Layer 1 - Deep blue ambient */}
                <div style={{
                    position: 'absolute',
                    top: -150, left: -150,
                    width: 300, height: 300,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(67,56,202,0.12) 0%, rgba(67,56,202,0.03) 50%, transparent 80%)',
                    filter: 'blur(30px)',
                    zIndex: -2,
                }} />

                {/* Lensing Glow Layer 2 - Violet flare */}
                <div className="bh-flare" style={{
                    position: 'absolute',
                    top: -100, left: -100,
                    width: 200, height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.15), transparent)',
                    filter: 'blur(20px)',
                    zIndex: -1,
                }} />

                {/* Multi-layered Accretion Disk - Golden Plasma */}
                <div className="bh-accretion-plasma" style={{
                    position: 'absolute',
                    top: -70, left: -70,
                    width: 140, height: 140,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(255,170,0,0.5) 15%, rgba(255,102,0,0.8) 35%, rgba(255,170,0,0.5) 55%, transparent 100%)',
                    filter: 'blur(10px)',
                    zIndex: 0,
                }} />

                {/* Hot Inner Disk - Cyan/White */}
                <div className="bh-accretion-inner" style={{
                    position: 'absolute',
                    top: -48, left: -48,
                    width: 96, height: 96,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 90deg, transparent 0%, rgba(165,243,252,0.6) 25%, rgba(255,255,255,0.9) 50%, rgba(139,92,246,0.6) 75%, transparent 100%)',
                    filter: 'blur(3px)',
                    zIndex: 1,
                }} />

                {/* Photon Sphere High Intensity Ring */}
                <div className="bh-photon-ring" style={{
                    position: 'absolute',
                    top: -19, left: -19,
                    width: 38, height: 38,
                    borderRadius: '50%',
                    border: '1.5px solid rgba(255,255,255,0.9)',
                    boxShadow: '0 0 15px 2px rgba(165,243,252,1), inset 0 0 8px rgba(6,182,212,0.8)',
                    zIndex: 4,
                }} />

                {/* Event Horizon - Singularity Core */}
                <div style={{
                    position: 'absolute',
                    top: -16, left: -16,
                    width: 33, height: 33,
                    backgroundColor: '#000',
                    borderRadius: '50%',
                    boxShadow: '0 0 5px 2px rgba(139,92,246,0.9), 0 0 30px 10px rgba(0,0,0,1)',
                    zIndex: 5,
                }} />

                {/* Lensing Distortion Highlights */}
                <div className="bh-distort" style={{
                    position: 'absolute',
                    top: -85, left: -85,
                    width: 170, height: 170,
                    borderRadius: '50%',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 40%)',
                    filter: 'blur(5px)',
                    zIndex: 2,
                }} />
            </div>

            <style>{`
                @keyframes bh-accretion-plasma {
                    0% { transform: rotate(0deg) scaleY(0.4) scaleX(1.3) skewX(10deg); filter: blur(10px) brightness(1.2); }
                    50% { transform: rotate(180deg) scaleY(0.35) scaleX(1.4) skewX(15deg); filter: blur(12px) brightness(1.4); }
                    100% { transform: rotate(360deg) scaleY(0.4) scaleX(1.3) skewX(10deg); filter: blur(10px) brightness(1.2); }
                }
                @keyframes bh-accretion-inner {
                    0% { transform: rotate(90deg) scaleY(0.5) scaleX(1.2); }
                    100% { transform: rotate(450deg) scaleY(0.5) scaleX(1.2); }
                }
                @keyframes bh-flare {
                    0%, 100% { opacity: 0.3; transform: scaleY(0.6) rotate(-5deg); }
                    50% { opacity: 0.6; transform: scaleY(0.8) rotate(5deg); }
                }
                @keyframes bh-photon-ring {
                    0%, 100% { transform: scale(1); border-color: rgba(255,255,255,0.8); }
                    50% { transform: scale(1.04); border-color: rgba(165,243,252,1); }
                }
                @keyframes bh-distort-rot {
                    100% { transform: rotate(-360deg); }
                }
                .bh-accretion-plasma {
                    animation: bh-accretion-plasma 12s linear infinite;
                }
                .bh-accretion-inner {
                    animation: bh-accretion-inner 5s linear infinite;
                }
                .bh-flare {
                    animation: bh-flare 10s ease-in-out infinite;
                }
                .bh-photon-ring {
                    animation: bh-photon-ring 3s ease-in-out infinite;
                }
                .bh-distort {
                    animation: bh-distort-rot 20s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default BlackHoleCursor;
