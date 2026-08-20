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

        let width = 800;
        let height = 500;

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            width = rect.width || canvas.parentElement?.clientWidth || window.innerWidth || 800;
            height = rect.height || canvas.parentElement?.clientHeight || window.innerHeight || 500;
            
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            if (ctx.resetTransform) ctx.resetTransform();
            ctx.scale(dpr, dpr);
            if (particles.current.length === 0) {
                init();
            }
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

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 4, 0, Math.PI * 2);
            ctx.fill();

            // 2. Draw Accretion Disk (Inner Ring)
            const diskGradient = ctx.createRadialGradient(centerX, centerY, coreRadius * 0.8, centerX, centerY, coreRadius * 1.6);
            diskGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
            diskGradient.addColorStop(0.3, accentColor);
            diskGradient.addColorStop(0.7, coreColor);
            diskGradient.addColorStop(1, 'transparent');

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.scale(1, 0.35); // Elliptical tilt
            ctx.rotate(Date.now() * 0.0005);
            ctx.fillStyle = diskGradient;
            ctx.beginPath();
            ctx.arc(0, 0, coreRadius * 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();

            // 3. Draw Event Horizon (Pure Black Hole center)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 0.85, 0, Math.PI * 2);
            ctx.fill();

            // Thin bright photonic ring
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(centerX, centerY, coreRadius * 0.85, 0, Math.PI * 2);
            ctx.stroke();

            // 4. Update & Draw Orbiting Particles
            particles.current.forEach((p) => {
                p.angle += p.speed;
                // Spiral inward slowly
                p.distance -= 0.15;
                if (p.distance < coreRadius * 0.8) {
                    p.distance = Math.random() * (Math.max(width, height) * 0.6) + coreRadius;
                    p.angle = Math.random() * Math.PI * 2;
                }

                // Elliptical coordinate calculation
                const px = centerX + Math.cos(p.angle) * p.distance;
                const py = centerY + Math.sin(p.angle) * (p.distance * 0.5);

                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.opacity;
                ctx.beginPath();
                ctx.arc(px, py, p.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1.0;
            });

            rafId.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouse.current = { x: e.clientX, y: e.clientY };
        };

        const ro = new ResizeObserver(() => { resize(); });
        if (canvas.parentElement) {
            ro.observe(canvas.parentElement);
        } else {
            ro.observe(canvas);
        }

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        resize();
        init();
        draw();

        return () => {
            ro.disconnect();
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
