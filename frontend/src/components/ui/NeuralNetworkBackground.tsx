import React, { useEffect, useRef } from 'react';

interface Node {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    pulse: number;
    pulseSpeed: number;
}

interface NeuralNetworkBackgroundProps {
    className?: string;
    nodeCount?: number;
    connectionDistance?: number;
    interactive?: boolean;
    nodeColor?: string;
    lineColor?: string;
}

export const NeuralNetworkBackground: React.FC<NeuralNetworkBackgroundProps> = ({
    className = '',
    nodeCount = 120,
    connectionDistance = 150,
    interactive = true,
    nodeColor = '#22d3ee', // Cyan-400
    lineColor = 'rgba(34, 211, 238, 0.2)',
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouse = useRef({ x: -1000, y: -1000 });
    const nodes = useRef<Node[]>([]);
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
            nodes.current = Array.from({ length: nodeCount }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                color: nodeColor,
                pulse: Math.random() * Math.PI * 2,
                pulseSpeed: Math.random() * 0.05 + 0.02,
            }));
        };

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = '#020617';
            ctx.fillRect(0, 0, width, height);

            // Update and Draw Nodes
            nodes.current.forEach((node, i) => {
                // Simple Physics
                node.x += node.vx;
                node.y += node.vy;

                // Bounce off edges
                if (node.x < 0 || node.x > width) node.vx *= -1;
                if (node.y < 0 || node.y > height) node.vy *= -1;

                // Mouse Interaction (Magnetic push)
                if (interactive) {
                    const dx = mouse.current.x - node.x;
                    const dy = mouse.current.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        const angle = Math.atan2(dy, dx);
                        const force = (150 - dist) / 150;
                        node.x -= Math.cos(angle) * force * 2;
                        node.y -= Math.sin(angle) * force * 2;
                    }
                }

                // Pulse effect
                node.pulse += node.pulseSpeed;
                const currentSize = node.size + Math.sin(node.pulse) * 0.5;

                // Draw Lines (Connections)
                for (let j = i + 1; j < nodes.current.length; j++) {
                    const node2 = nodes.current[j];
                    const dx = node.x - node2.x;
                    const dy = node.y - node2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < connectionDistance) {
                        const opacity = 1 - (dist / connectionDistance);
                        ctx.strokeStyle = lineColor.replace('0.2)', `${opacity * 0.2})`);
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(node2.x, node2.y);
                        ctx.stroke();
                    }
                }

                // Draw Mouse Connections
                if (interactive) {
                    const dx = mouse.current.x - node.x;
                    const dy = mouse.current.y - node.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance * 1.5) {
                        const opacity = 1 - (dist / (connectionDistance * 1.5));
                        ctx.strokeStyle = lineColor.replace('0.2)', `${opacity * 0.3})`);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(mouse.current.x, mouse.current.y);
                        ctx.stroke();
                    }
                }

                // Draw Node
                ctx.fillStyle = node.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = node.color;
                ctx.beginPath();
                ctx.arc(node.x, node.y, currentSize, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            rafId.current = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        };

        window.addEventListener('resize', resize);
        if (interactive) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        resize();
        draw();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(rafId.current);
        };
    }, [nodeCount, connectionDistance, interactive, nodeColor, lineColor]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 w-full h-full -z-10 bg-[#020617] ${className}`}
        />
    );
};

export default NeuralNetworkBackground;
