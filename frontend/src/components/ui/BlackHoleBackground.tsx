import React, { useEffect, useRef } from 'react';

interface Particle {
    angle: number;
    distance: number;
    speed: number;
    size: number;
    color: string;
    opacity: number;
}

interface BlackHoleBackgroundProps {
    className?: string;
    particleCount?: number;
    coreColor?: string;
    accentColor?: string;
}

export const BlackHoleBackground: React.FC<BlackHoleBackgroundProps> = ({
    className = '',
    particleCount = 600,
    coreColor = 'rgba(79, 70, 229, 0.4)', // Indigo
    accentColor = '#22d3ee', // Cyan
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const targetMouse = useRef({ x: 0, y: 0 });
    const particles = useRef<Particle[]>([]);
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
            particles.current = Array.from({ length: particleCount }, () => ({
                angle: Math.random() * Math.PI * 2,
                distance: Math.random() * (Math.max(width, height) * 0.6) + 50,
                speed: Math.random() * 0.02 + 0.005,
                size: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.5 ? accentColor : '#fff',
                opacity: Math.random() * 0.5 + 0.2,
            }));
        };

        const draw = () => {
            // Smooth centering of core (mouse influence)
            mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.05;
            mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.05;

            const centerX = width / 2 + (mouse.current.x - width / 2) * 0.15;
            const centerY = height / 2 + (mouse.current.y - height / 2) * 0.15;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            // 1. Draw Core Glow (Singularity)
            const coreRadius = 60;
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius * 4);
            gradient.addColorStop(0, '#000');
            gradient.addColorStop(0.1, '#000');
            gradient.addColorStop(0.15, coreColor);
            gradient.addColorStop(0.4, coreColor.replace('0.4)', '0.05)'));
            gradient.addColorStop(1, 'transparent');

            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 2. Update and Draw Particles
            particles.current.forEach(p => {
                // Spiral Physics
                p.angle += p.speed;

                // Acceleration near core (Inverse relation to distance)
                const gravity = Math.max(0.1, 100 / p.distance);
                p.distance -= 0.5 * gravity;

                // Reset particle if it enters core
                if (p.distance < 20) {
                    p.distance = Math.random() * (Math.max(width, height) * 0.6) + 400;
                    p.opacity = 0;
                }

                // Fade in
                if (p.opacity < 0.6) p.opacity += 0.01;

                const x = centerX + Math.cos(p.angle) * p.distance;
                const y = centerY + Math.sin(p.angle) * p.distance;

                // Draw Particle
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.shadowBlur = 4;
                ctx.shadowColor = p.color;

                ctx.beginPath();
                ctx.arc(x, y, p.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            });

            rafId.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            targetMouse.current = { 
                x: e.clientX - rect.left, 
                y: e.clientY - rect.top 
            };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId.current);
        };
    }, [particleCount, coreColor, accentColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full z-0 bg-[#020617] ${className}`}
        />
    );
};

export default BlackHoleBackground;
