import React, { useEffect, useRef } from 'react';

interface WarpStar {
    x: number;
    y: number;
    z: number;
    px: number;
    py: number;
    size: number;
    color: string;
}

interface WarpSpeedBackgroundProps {
    className?: string;
    starCount?: number;
    speed?: number;
    starColor?: string;
}

export const WarpSpeedBackground: React.FC<WarpSpeedBackgroundProps> = ({
    className = '',
    starCount = 800,
    speed = 15,
    starColor = '#fff',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const targetMouse = useRef({ x: 0, y: 0 });
    const stars = useRef<WarpStar[]>([]);
    const rafId = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * window.devicePixelRatio;
            canvas.height = height * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            init();
        };

        const init = () => {
            stars.current = Array.from({ length: starCount }, () => ({
                x: (Math.random() - 0.5) * width * 2,
                y: (Math.random() - 0.5) * height * 2,
                z: Math.random() * width,
                px: 0,
                py: 0,
                size: Math.random() * 1.5 + 0.5,
                color: Math.random() > 0.8 ? '#A5B4FC' : starColor, // Occasional blue-ish stars
            }));
        };

        const draw = () => {
            // Smooth camera tilt influence from mouse
            mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.05;
            mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.05;

            const vanishingX = width / 2 + (mouse.current.x - width / 2) * 0.1;
            const vanishingY = height / 2 + (mouse.current.y - height / 2) * 0.1;

            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = '#fff';
            ctx.lineCap = 'round';

            stars.current.forEach(star => {
                // Project 3D to 2D
                const k = 128 / star.z;
                const sx = star.x * k + vanishingX;
                const sy = star.y * k + vanishingY;

                // Move star closer to viewer
                star.z -= speed;

                // Reset star if it passes the viewer
                if (star.z <= speed) {
                    star.z = width;
                    star.x = (Math.random() - 0.5) * width * 2;
                    star.y = (Math.random() - 0.5) * height * 2;
                    star.px = sx;
                    star.py = sy;
                }

                // Only draw if within bounds and have a previous position
                if (star.px !== 0) {
                    // Stretch length based on speed and proximity
                    ctx.beginPath();
                    ctx.strokeStyle = star.color;
                    ctx.lineWidth = star.size * k;
                    ctx.globalAlpha = Math.min(1, (width - star.z) / 500); // Fade in as they approach
                    ctx.moveTo(sx, sy);
                    ctx.lineTo(star.px, star.py);
                    ctx.stroke();
                }

                // Store current position as previous for next frame's trail
                star.px = sx;
                star.py = sy;
            });

            ctx.globalAlpha = 1;

            rafId.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            targetMouse.current = { x: e.clientX, y: e.clientY };
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
    }, [starCount, speed, starColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 w-full h-full -z-10 bg-[#020617] ${className}`}
            style={{ touchAction: 'none' }}
        />
    );
};

export default WarpSpeedBackground;
