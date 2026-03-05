import React, { useEffect, useRef, useMemo } from 'react';

interface Star {
    x: number;
    y: number;
    size: number;
    color: string;
    opacity: number;
    targetOpacity: number;
    twinkleSpeed: number;
    layer: number;
    flare: boolean;
}

interface Nebula {
    x: number;
    y: number;
    radius: number;
    color: string;
    angle: number;
    speed: number;
}

interface ShootingStar {
    x: number;
    y: number;
    vx: number;
    vy: number;
    len: number;
    opacity: number;
    active: boolean;
}

interface SpaceBackgroundProps {
    className?: string;
    starCount?: number;
    nebulaCount?: number;
    interactive?: boolean;
}

export const SpaceBackground: React.FC<SpaceBackgroundProps> = ({
    className = '',
    starCount = 400,
    nebulaCount = 6,
    interactive = true,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: 0, y: 0 });
    const targetMouse = useRef({ x: 0, y: 0 });
    const stars = useRef<Star[]>([]);
    const nebulas = useRef<Nebula[]>([]);
    const shootingStars = useRef<ShootingStar[]>([]);
    const rafId = useRef<number>(0);

    const starColors = ['#FFFFFF', '#FFE9D2', '#D2EAFF', '#FFD2D2', '#FFF4EA'];
    const nebulaColors = [
        'rgba(147, 51, 234, 0.2)', // Purple
        'rgba(79, 70, 229, 0.2)',  // Indigo
        'rgba(219, 39, 119, 0.15)', // Pink
        'rgba(37, 99, 235, 0.15)',  // Blue
    ];

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
            // Initialize Stars with clustering
            const newStars: Star[] = [];
            const clusters = Array.from({ length: 4 }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 300 + 200
            }));

            for (let i = 0; i < starCount; i++) {
                let x, y;
                // Bias some stars towards clusters
                if (Math.random() > 0.6) {
                    const cluster = clusters[Math.floor(Math.random() * clusters.length)];
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.pow(Math.random(), 0.5) * cluster.radius;
                    x = cluster.x + Math.cos(angle) * r;
                    y = cluster.y + Math.sin(angle) * r;
                } else {
                    x = Math.random() * width;
                    y = Math.random() * height;
                }

                const layer = Math.random() < 0.7 ? 0 : Math.random() < 0.9 ? 1 : 2;
                const size = Math.random() * (layer === 2 ? 1.8 : layer === 1 ? 1.2 : 0.8) + 0.2;

                newStars.push({
                    x,
                    y,
                    size,
                    color: starColors[Math.floor(Math.random() * starColors.length)],
                    opacity: Math.random(),
                    targetOpacity: Math.random(),
                    twinkleSpeed: Math.random() * 0.015 + 0.005,
                    layer,
                    flare: layer === 2 && Math.random() > 0.8
                });
            }
            stars.current = newStars;

            // Initialize Nebulas
            nebulas.current = Array.from({ length: nebulaCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * (width * 0.45) + (width * 0.2),
                color: nebulaColors[Math.floor(Math.random() * nebulaColors.length)],
                angle: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.0005,
            }));

            // Initialize Shooting Stars
            shootingStars.current = Array.from({ length: 3 }, () => ({
                x: 0, y: 0, vx: 0, vy: 0, len: 0, opacity: 0, active: false
            }));
        };

        const drawStar = (star: Star, offsetX: number, offsetY: number) => {
            ctx.fillStyle = star.color;
            ctx.globalAlpha = star.opacity;

            const px = star.x + offsetX;
            const py = star.y + offsetY;

            // Depth of Field Blur for layer 0
            if (star.layer === 0) {
                ctx.shadowBlur = 0;
            } else if (star.layer === 1) {
                ctx.shadowBlur = 2;
                ctx.shadowColor = star.color;
            } else {
                ctx.shadowBlur = 4;
                ctx.shadowColor = star.color;
            }

            ctx.beginPath();
            ctx.arc(px, py, star.size, 0, Math.PI * 2);
            ctx.fill();

            // Realistic Flare for bright/large stars
            if (star.flare && star.opacity > 0.5) {
                ctx.shadowBlur = 0;
                ctx.strokeStyle = star.color;
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = star.opacity * 0.5;

                // Vertical line
                ctx.beginPath();
                ctx.moveTo(px, py - star.size * 4);
                ctx.lineTo(px, py + star.size * 4);
                ctx.stroke();

                // Horizontal line
                ctx.beginPath();
                ctx.moveTo(px - star.size * 4, py);
                ctx.lineTo(px + star.size * 4, py);
                ctx.stroke();

                // Glow circle
                const g = ctx.createRadialGradient(px, py, 0, px, py, star.size * 3);
                g.addColorStop(0, star.color);
                g.addColorStop(1, 'transparent');
                ctx.fillStyle = g;
                ctx.globalAlpha = star.opacity * 0.3;
                ctx.beginPath();
                ctx.arc(px, py, star.size * 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        };

        const animate = () => {
            // Smooth mouse follow
            mouse.current.x += (targetMouse.current.x - mouse.current.x) * 0.05;
            mouse.current.y += (targetMouse.current.y - mouse.current.y) * 0.05;

            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            // Draw Nebulas
            ctx.globalCompositeOperation = 'screen';
            nebulas.current.forEach(n => {
                n.angle += n.speed;
                const driftX = Math.cos(n.angle) * 20;
                const driftY = Math.sin(n.angle) * 20;

                const gradient = ctx.createRadialGradient(
                    n.x + driftX, n.y + driftY, 0,
                    n.x + driftX, n.y + driftY, n.radius
                );
                gradient.addColorStop(0, n.color);
                gradient.addColorStop(0.5, n.color.replace('0.2)', '0.05)'));
                gradient.addColorStop(1, 'transparent');

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(n.x + driftX, n.y + driftY, n.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw Stars
            ctx.globalCompositeOperation = 'source-over';
            stars.current.forEach(star => {
                // Star Movement (Diagonal slow drift)
                star.y -= (star.layer + 1) * 0.02;
                star.x -= (star.layer + 1) * 0.01;

                if (star.y < -20) star.y = height + 20;
                if (star.x < -20) star.x = width + 20;

                // Mouse Parallax (Invert slightly for realism)
                const offsetX = (mouse.current.x - width / 2) * (star.layer + 1) * 0.008;
                const offsetY = (mouse.current.y - height / 2) * (star.layer + 1) * 0.008;

                // Twinkle
                star.opacity += (star.targetOpacity - star.opacity) * star.twinkleSpeed;
                if (Math.abs(star.opacity - star.targetOpacity) < 0.1) {
                    star.targetOpacity = Math.random();
                }

                drawStar(star, offsetX, offsetY);
            });

            // Shooting Stars
            if (Math.random() < 0.005) {
                const s = shootingStars.current.find(ss => !ss.active);
                if (s) {
                    s.active = true;
                    s.x = Math.random() * width;
                    s.y = Math.random() * height * 0.5;
                    const angle = Math.random() * Math.PI * 0.2 + Math.PI * 0.8;
                    const speed = Math.random() * 10 + 10;
                    s.vx = Math.cos(angle) * speed;
                    s.vy = Math.sin(angle) * speed;
                    s.len = Math.random() * 80 + 40;
                    s.opacity = 0.8;
                }
            }

            shootingStars.current.forEach(s => {
                if (!s.active) return;
                s.x += s.vx;
                s.y += s.vy;
                s.opacity *= 0.98;

                if (s.opacity < 0.01) {
                    s.active = false;
                } else {
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = s.opacity;
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(s.x - s.vx * 2, s.y - s.vy * 2);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            });

            rafId.current = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        const handleMouseMove = (e: MouseEvent) => {
            targetMouse.current = { x: e.clientX, y: e.clientY };
        };

        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId.current);
        };
    }, [starCount, nebulaCount, interactive]);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed inset-0 w-full h-full -z-10 bg-[#020617] ${className}`}
            style={{ touchAction: 'none' }}
        />
    );
};

export default SpaceBackground;
