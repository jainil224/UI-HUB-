import React, { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    baseX: number;
    baseY: number;
    size: number;
    color: string;
}

interface MagneticBackgroundProps {
    className?: string;
    containerRef?: React.RefObject<HTMLElement>;
}

export const MagneticBackground: React.FC<MagneticBackgroundProps> = ({ className = '', containerRef }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -999, y: -999 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;
        let width = 0;
        let height = 0;

        const initParticles = () => {
            particles = [];
            // Calculate number of particles based on screen size so it scales properly
            const numParticles = Math.floor((width * height) / 12000);
            const colors = ['rgba(139, 92, 246, 0.8)', 'rgba(59, 130, 246, 0.8)', 'rgba(192, 132, 252, 0.8)', 'rgba(96, 165, 250, 0.8)']; // Purples and Blues

            for (let i = 0; i < numParticles; i++) {
                const x = Math.random() * width;
                const y = Math.random() * height;
                particles.push({
                    x,
                    y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.4, // Slow drift
                    vy: (Math.random() - 0.5) * 0.4,
                    size: Math.random() * 1.5 + 0.5,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        const resize = () => {
            const container = containerRef?.current || canvas.parentElement;
            if (container) {
                const rect = container.getBoundingClientRect();
                width = rect.width;
                height = rect.height;
                canvas.width = width;
                canvas.height = height;
                initParticles();
            }
        };

        // Delay initial resize slightly to ensure container is fully rendered
        setTimeout(resize, 0);
        window.addEventListener('resize', resize);

        const onMouseMove = (e: MouseEvent) => {
            if (containerRef?.current) {
                const rect = containerRef.current.getBoundingClientRect();
                mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
            } else {
                mouse.current = { x: e.clientX, y: e.clientY };
            }
        };

        const onMouseLeave = () => {
            mouse.current = { x: -999, y: -999 };
        };

        const container = containerRef?.current || canvas.parentElement;
        if (container) {
            container.addEventListener('mousemove', onMouseMove, { passive: true });
            container.addEventListener('mouseleave', onMouseLeave, { passive: true });
        } else {
            window.addEventListener('mousemove', onMouseMove, { passive: true });
            window.addEventListener('mouseleave', onMouseLeave, { passive: true });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            particles.forEach((p) => {
                // Base slow drift
                p.baseX += p.vx;
                p.baseY += p.vy;

                // Bounce off edges softly
                if (p.baseX < 0 || p.baseX > width) p.vx *= -1;
                if (p.baseY < 0 || p.baseY > height) p.vy *= -1;

                // Magnetic pull
                const dx = mouse.current.x - p.baseX;
                const dy = mouse.current.y - p.baseY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                const magnetRadius = 180; // Distance particles feel the cursor
                let tx = p.baseX;
                let ty = p.baseY;

                if (dist < magnetRadius) {
                    const force = (magnetRadius - dist) / magnetRadius;
                    // Magnetic elasticity: particles get pulled towards mouse
                    tx += dx * force * 0.4;
                    ty += dy * force * 0.4;

                    ctx.shadowBlur = 12 * force;
                    ctx.shadowColor = p.color;
                    ctx.globalAlpha = 0.8 + (0.2 * force); // Brighten closer to mouse
                } else {
                    ctx.shadowBlur = 0;
                    ctx.globalAlpha = 0.4; // Dimmer when far from mouse
                }

                // Smoothly interpolate current position toward target (creates the fluid elastic look)
                p.x += (tx - p.x) * 0.12;
                p.y += (ty - p.y) * 0.12;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            if (container) {
                container.removeEventListener('mousemove', onMouseMove);
                container.removeEventListener('mouseleave', onMouseLeave);
            } else {
                window.removeEventListener('mousemove', onMouseMove);
                window.removeEventListener('mouseleave', onMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, [containerRef]);

    return (
        <canvas
            ref={canvasRef}
            className={className}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0 // Keep behind UI
            }}
        />
    );
};

export default MagneticBackground;
