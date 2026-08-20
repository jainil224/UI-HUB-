import React, { useEffect, useRef } from 'react';

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
    nodeCount = 90,
    connectionDistance = 160,
    interactive = false,
}) => {
    const canvasRef   = useRef<HTMLCanvasElement>(null);
    const wrapRef     = useRef<HTMLDivElement>(null);
    const mouse       = useRef({ x: -2000, y: -2000 });
    const rafId       = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        const wrap   = wrapRef.current;
        if (!canvas || !wrap) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width  = 0;
        let height = 0;

        // ── Spectral palette ──────────────────────────────────────────
        const PALETTES = [
            { node: '#22d3ee', glow: '#06b6d4', line: [6, 182, 212] as [number, number, number]   }, // cyan
            { node: '#a78bfa', glow: '#7c3aed', line: [139, 92, 246] as [number, number, number]  }, // violet
            { node: '#34d399', glow: '#059669', line: [52, 211, 153] as [number, number, number]  }, // emerald
            { node: '#f472b6', glow: '#db2777', line: [244, 114, 182] as [number, number, number] }, // pink (rare)
        ];

        // ── Node type ─────────────────────────────────────────────────
        interface NodeType {
            x: number; y: number;
            vx: number; vy: number;
            size: number;
            palette: typeof PALETTES[0];
            pulse: number;
            pulseSpeed: number;
            isHub: boolean;      // Hub nodes are larger, emit more connections
            energy: number;      // 0-1, drives brightness
        }

        // ── Signal pulse (travels along a connection) ─────────────────
        interface Pulse {
            fromIdx: number;
            toIdx:   number;
            t:       number;      // 0→1 progress
            speed:   number;
            color:   [number,number,number];
        }

        let nodes:  NodeType[] = [];
        let pulses: Pulse[]    = [];

        // ── Init ─────────────────────────────────────────────────────
        const init = () => {
            const w = width || wrap.offsetWidth || wrap.clientWidth || window.innerWidth || 800;
            const h = height || wrap.offsetHeight || wrap.clientHeight || window.innerHeight || 500;
            nodes = Array.from({ length: nodeCount }, (_, i) => {
                const isHub = i < Math.floor(nodeCount * 0.12); // 12% are hubs
                const pal   = PALETTES[Math.floor(Math.random() * (isHub ? 3 : PALETTES.length))];
                return {
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * (isHub ? 0.35 : 0.6),
                    vy: (Math.random() - 0.5) * (isHub ? 0.35 : 0.6),
                    size: isHub ? Math.random() * 3 + 4 : Math.random() * 2 + 1.5,
                    palette: pal,
                    pulse: Math.random() * Math.PI * 2,
                    pulseSpeed: Math.random() * 0.03 + 0.015,
                    isHub,
                    energy: Math.random(),
                };
            });
            pulses = [];
        };

        // Spawn a new signal pulse between two close nodes occasionally
        const maybePulse = () => {
            if (pulses.length > 30 || Math.random() > 0.04) return;
            const i = Math.floor(Math.random() * nodes.length);
            const ni = nodes[i];
            for (let j = 0; j < nodes.length; j++) {
                if (j === i) continue;
                const nj = nodes[j];
                const dx = ni.x - nj.x, dy = ni.y - nj.y;
                if (Math.sqrt(dx*dx + dy*dy) < connectionDistance) {
                    pulses.push({ fromIdx: i, toIdx: j, t: 0, speed: Math.random() * 0.012 + 0.006, color: ni.palette.line });
                    break;
                }
            }
        };

        // ── Resize ───────────────────────────────────────────────────
        const resize = () => {
            const rect = wrap.getBoundingClientRect();
            width  = rect.width  || wrap.offsetWidth  || wrap.clientWidth || window.innerWidth || 800;
            height = rect.height || wrap.offsetHeight || wrap.clientHeight || window.innerHeight || 500;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width  = width  * dpr;
            canvas.height = height * dpr;
            canvas.style.width  = `${width}px`;
            canvas.style.height = `${height}px`;
            if (ctx.resetTransform) ctx.resetTransform();
            ctx.scale(dpr, dpr);
            if (nodes.length === 0 || nodes.every(n => n.x === 0)) {
                init();
            }
        };

        // ── Draw loop ────────────────────────────────────────────────
        const draw = () => {
            ctx.clearRect(0, 0, width, height);

            const mx = mouse.current.x, my = mouse.current.y;

            // ── 1. Update node physics ────────────────────────────────
            nodes.forEach(node => {
                // Mouse repulsion
                if (interactive) {
                    const dx = mx - node.x, dy = my - node.y;
                    const d2 = dx*dx + dy*dy;
                    if (d2 < 22500) { // 150px radius
                        const d = Math.sqrt(d2);
                        const force = (150 - d) / 150;
                        node.vx -= (dx / d) * force * 2.5;
                        node.vy -= (dy / d) * force * 2.5;
                    }
                }
                // Speed limit
                const spd = Math.sqrt(node.vx*node.vx + node.vy*node.vy);
                if (spd > 1.2) { node.vx *= 0.96; node.vy *= 0.96; }

                node.x += node.vx;
                node.y += node.vy;

                // Soft wrap (drift back in from far off-screen)
                const pad = 40;
                if (node.x < -pad) node.x = width + pad;
                else if (node.x > width + pad) node.x = -pad;
                if (node.y < -pad) node.y = height + pad;
                else if (node.y > height + pad) node.y = -pad;

                node.pulse  += node.pulseSpeed;
                node.energy  = 0.6 + Math.sin(node.pulse) * 0.4;
            });

            // ── 2. Draw connections ───────────────────────────────────
            ctx.save();
            for (let i = 0; i < nodes.length; i++) {
                const ni = nodes[i];
                const maxConn = ni.isHub ? 10 : 5;
                let connCount = 0;

                for (let j = i + 1; j < nodes.length; j++) {
                    if (connCount >= maxConn) break;
                    const nj = nodes[j];
                    const dx = ni.x - nj.x, dy = ni.y - nj.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist >= connectionDistance) continue;
                    connCount++;

                    const opacity = (1 - dist / connectionDistance) * 0.55;
                    const [r, g, b] = ni.palette.line;
                    ctx.strokeStyle = `rgba(${r},${g},${b},${opacity})`;
                    ctx.lineWidth   = ni.isHub ? 1.2 : 0.7;
                    ctx.beginPath();
                    ctx.moveTo(ni.x, ni.y);
                    ctx.lineTo(nj.x, nj.y);
                    ctx.stroke();
                }
            }
            ctx.restore();

            // ── 3. Draw & advance signal pulses ──────────────────────
            pulses = pulses.filter(p => {
                p.t += p.speed;
                if (p.t >= 1) return false;

                const ni = nodes[p.fromIdx], nj = nodes[p.toIdx];
                if (!ni || !nj) return false;

                const px = ni.x + (nj.x - ni.x) * p.t;
                const py = ni.y + (nj.y - ni.y) * p.t;
                const [r,g,b] = p.color;
                const alpha = Math.sin(p.t * Math.PI); // fade in/out

                // Trailing glow
                ctx.save();
                ctx.shadowBlur  = 12;
                ctx.shadowColor = `rgb(${r},${g},${b})`;
                ctx.fillStyle   = `rgba(${r},${g},${b},${alpha * 0.85})`;
                ctx.beginPath();
                ctx.arc(px, py, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
                return true;
            });

            maybePulse();

            // ── 4. Draw nodes ─────────────────────────────────────────
            nodes.forEach(node => {
                const s   = node.size * (node.isHub ? (1 + Math.sin(node.pulse) * 0.25) : 1);
                const [r,g,b] = node.palette.line;
                const e   = node.energy;

                // Outer soft halo (hub only)
                if (node.isHub) {
                    ctx.save();
                    const haloGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, s * 7);
                    haloGrad.addColorStop(0,   `rgba(${r},${g},${b},${0.18 * e})`);
                    haloGrad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
                    ctx.fillStyle = haloGrad;
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, s * 7, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }

                // Node glow
                ctx.save();
                ctx.shadowBlur  = node.isHub ? 20 : 10;
                ctx.shadowColor = node.palette.glow;
                ctx.fillStyle   = node.palette.node;
                ctx.globalAlpha = 0.7 + e * 0.3;
                ctx.beginPath();
                ctx.arc(node.x, node.y, s, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();

                // Bright core
                ctx.save();
                ctx.fillStyle   = '#ffffff';
                ctx.globalAlpha = node.isHub ? 0.5 * e : 0.3 * e;
                ctx.beginPath();
                ctx.arc(node.x, node.y, s * 0.45, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // ── 5. Mouse interaction indicator ────────────────────────
            if (interactive && mx > -1000) {
                ctx.save();
                ctx.strokeStyle = 'rgba(139,92,246,0.25)';
                ctx.lineWidth   = 1;
                nodes.forEach(node => {
                    const dx = mx - node.x, dy = my - node.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < connectionDistance * 1.4) {
                        const op = (1 - dist / (connectionDistance * 1.4)) * 0.35;
                        ctx.strokeStyle = `rgba(139,92,246,${op})`;
                        ctx.lineWidth   = 1;
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(mx, my);
                        ctx.stroke();
                    }
                });
                ctx.restore();

                // Cursor ring
                ctx.save();
                ctx.strokeStyle = 'rgba(139,92,246,0.3)';
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.arc(mx, my, 8, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }

            rafId.current = requestAnimationFrame(draw);
        };

        // ── Events ───────────────────────────────────────────────────
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        };
        const handleMouseLeave = () => { mouse.current = { x: -2000, y: -2000 }; };

        const ro = new ResizeObserver(() => { resize(); });
        ro.observe(wrap);

        window.addEventListener('resize', resize);
        if (interactive) {
            canvas.addEventListener('mousemove',  handleMouseMove);
            canvas.addEventListener('mouseleave', handleMouseLeave);
        }

        setTimeout(resize, 0);
        draw();

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove',  handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafId.current);
        };
    }, [nodeCount, connectionDistance, interactive]);

    return (
        <div
            ref={wrapRef}
            className={`relative w-full h-full overflow-hidden ${className}`}
            style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #050a18 70%, #020617 100%)', cursor: 'default' }}
        >
            {/* Ambient nebula glow layers */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: [
                    'radial-gradient(ellipse at 20% 30%, rgba(6,182,212,0.07) 0%, transparent 55%)',
                    'radial-gradient(ellipse at 80% 70%, rgba(139,92,246,0.08) 0%, transparent 55%)',
                    'radial-gradient(ellipse at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 60%)',
                ].join(','),
            }} />

            <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, display: 'block' }} />

            {/* ── Overlay UI Card ── */}
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
            }}>
                {/* Glass card */}
                <div style={{
                    background: 'rgba(2,6,23,0.55)',
                    border: '1px solid rgba(34,211,238,0.20)',
                    borderRadius: 20,
                    padding: '28px 36px',
                    backdropFilter: 'blur(18px)',
                    boxShadow: '0 0 60px rgba(6,182,212,0.12), 0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                    textAlign: 'center', maxWidth: 320,
                }}>
                    {/* Top cyan bar */}
                    <div style={{
                        position: 'absolute', top: 0, left: '20%', right: '20%', height: '1.5px',
                        background: 'linear-gradient(90deg, transparent, #22d3ee, #a78bfa, #22d3ee, transparent)',
                        borderRadius: 2,
                    }} />

                    {/* Badge */}
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 6,
                        background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)',
                        borderRadius: 999, padding: '4px 12px', marginBottom: 14,
                    }}>
                        {/* Pulsing dot */}
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee',
                            boxShadow: '0 0 8px #22d3ee', animation: 'nn-dot 1.8s ease-in-out infinite' }} />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#67e8f9', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                            Active Network
                        </span>
                    </div>

                    <div style={{
                        fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8,
                        background: 'linear-gradient(135deg, #ffffff 0%, #a5f3fc 50%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 16px rgba(34,211,238,0.35))',
                    }}>
                        Neural Network<br />Background
                    </div>

                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', lineHeight: 1.6, marginBottom: 18 }}>
                        Hover to repel nodes · Watch signals pulse along connections
                    </div>

                    {/* Stats row */}
                    <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        {[
                            { label: 'Nodes',    val: nodeCount },
                            { label: 'Signals',  val: '∞'   },
                            { label: 'Layers',   val: 3     },
                        ].map((s, i) => (
                            <div key={i} style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 17, fontWeight: 800, color: i === 0 ? '#22d3ee' : i === 1 ? '#a78bfa' : '#34d399' }}>
                                    {s.val}
                                </div>
                                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes nn-dot {
                    0%,100% { opacity: 1; transform: scale(1); }
                    50%     { opacity: 0.4; transform: scale(0.7); }
                }
            `}</style>
        </div>
    );
};

export default NeuralNetworkBackground;
