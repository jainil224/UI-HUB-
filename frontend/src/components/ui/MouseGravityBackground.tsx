import React, { useEffect, useRef } from 'react';

interface GravityParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    glowColor: string;
    life?: number;
    maxLife?: number;
}

interface MouseGravityBackgroundProps {
    className?: string;
    particleCount?: number;
    attractionRadius?: number;
    attractionForce?: number;
    particleColor?: string;
    accentColor?: string;
    enableTrail?: boolean;
}

export const MouseGravityBackground: React.FC<MouseGravityBackgroundProps> = ({
    className = '',
    particleCount = 150,
    attractionRadius = 300,
    attractionForce = 0.05,
    particleColor = '#22d3ee', // Cyan
    accentColor = '#a855f7', // Purple
    enableTrail = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -1000, y: -1000, active: false });
    const particles = useRef<GravityParticle[]>([]);
    const rafId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            init();
        };

        const init = () => {
            particles.current = Array.from({ length: particleCount }, () => {
                const x = Math.random() * width;
                const y = Math.random() * height;
                return {
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1,
                    color: Math.random() > 0.3 ? particleColor : accentColor,
                    glowColor: Math.random() > 0.3 ? 'rgba(34, 211, 238, 0.3)' : 'rgba(168, 85, 247, 0.3)',
                };
            });
        };

        const draw = () => {
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            // Clean up old trail particles
            particles.current = particles.current.filter(p => p.life === undefined || p.life > 0);

            particles.current.forEach(p => {
                // Distance to mouse
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < attractionRadius && mouse.current.active) {
                    // Attraction force
                    const force = (attractionRadius - dist) / attractionRadius;
                    p.vx += dx * force * attractionForce;
                    p.vy += dy * force * attractionForce;
                }

                // Apply velocities
                p.x += p.vx;
                p.y += p.vy;

                // Friction / Damping
                p.vx *= 0.95;
                p.vy *= 0.95;

                // Floating motion
                p.vx += (Math.random() - 0.5) * 0.01;
                p.vy += (Math.random() - 0.5) * 0.01;

                // Handle life
                if (p.life !== undefined) {
                    p.life -= 1;
                }

                // Wrap persistent particles
                if (p.life === undefined) {
                    if (p.x < 0) p.x = width;
                    if (p.x > width) p.x = 0;
                    if (p.y < 0) p.y = height;
                    if (p.y > height) p.y = 0;
                }

                // Draw
                ctx.save();
                ctx.globalAlpha = p.life !== undefined ? p.life / p.maxLife! : 1;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = p.color;
                ctx.fill();
                ctx.restore();
            });

            rafId.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            mouse.current.x = x;
            mouse.current.y = y;
            
            // Only set active and spawn if inside or close to bounds
            if (x >= 0 && x <= width && y >= 0 && y <= height) {
                mouse.current.active = true;
                if (enableTrail && particles.current.length < particleCount + 200) {
                    for (let i = 0; i < 2; i++) {
                        particles.current.push({
                            x,
                            y,
                            vx: (Math.random() - 0.5) * 2,
                            vy: (Math.random() - 0.5) * 2,
                            size: Math.random() * 3 + 1,
                            color: Math.random() > 0.5 ? particleColor : accentColor,
                            glowColor: '',
                            life: 100,
                            maxLife: 100
                        });
                    }
                }
            } else {
                mouse.current.active = false;
            }
        };

        const handleMouseLeave = () => {
            mouse.current.active = false;
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafId.current);
        };
    }, [particleCount, attractionRadius, attractionForce, particleColor, accentColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-0 bg-[#020617] ${className}`}
        />
    );
};

export default MouseGravityBackground;
