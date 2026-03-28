import { LOVABLE_PROMPTS } from './lovablePrompts';
import { ANTIGRAVITY_PROMPTS } from './antigravityPrompts';
import React, { useRef, useCallback, useState, useEffect, Suspense } from 'react';

// ── Lazy Loaded UI Components ──────────────────
const AuroraCursor = React.lazy(() => import('../components/ui/AuroraCursor').then(m => ({ default: m.AuroraCursor })));
const MagneticCursor = React.lazy(() => import('../components/ui/MagneticCursor').then(m => ({ default: m.MagneticCursor })));
const MagneticBackground = React.lazy(() => import('../components/ui/MagneticBackground').then(m => ({ default: m.MagneticBackground })));
const BlackHoleCursor = React.lazy(() => import('../components/ui/BlackHoleCursor'));
const TargetCursor = React.lazy(() => import('../components/ui/TargetCursor').then(m => ({ default: m.TargetCursor })));
const SpaceBackground = React.lazy(() => import('../components/ui/SpaceBackground').then(m => ({ default: m.SpaceBackground })));
const NeuralNetworkBackground = React.lazy(() => import('../components/ui/NeuralNetworkBackground').then(m => ({ default: m.NeuralNetworkBackground })));
const BlackHoleBackground = React.lazy(() => import('../components/ui/BlackHoleBackground').then(m => ({ default: m.BlackHoleBackground })));
const WarpSpeedBackground = React.lazy(() => import('../components/ui/WarpSpeedBackground').then(m => ({ default: m.WarpSpeedBackground })));
const MouseGravityBackground = React.lazy(() => import('../components/ui/MouseGravityBackground').then(m => ({ default: m.MouseGravityBackground })));
const InteractiveWebGLScene = React.lazy(() => import('../components/ui/InteractiveWebGLScene').then(m => ({ default: m.InteractiveWebGLScene })));
const Scroll3DAnimation = React.lazy(() => import('../components/ui/Scroll3DAnimation'));
const ThreeDSlider = React.lazy(() => import('../components/ui/ThreeDSlider').then(m => ({ default: m.ThreeDSlider })));
export const RubiksCube = React.lazy(() => import('../components/ui/RubiksCube').then(m => ({ default: m.default })));
const BlackBox = React.lazy(() => import('../components/ui/BlackBox'));
const NeoBrutalism = React.lazy(() => import('../components/ui/NeoBrutalism'));
const HeartCursor = React.lazy(() => import('../components/ui/HeartCursor').then(m => ({ default: m.HeartCursor })));
const LizardCursor = React.lazy(() => import('../components/ui/LizardCursor').then(m => ({ default: m.LizardCursor })));
const VenomCursor = React.lazy(() => import('../components/ui/VenomCursor').then(m => ({ default: m.VenomCursor })));
const ThreeDTubesCursor = React.lazy(() => import('../components/ui/ThreeDTubesCursor').then(m => ({ default: m.ThreeDTubesCursor })));
export const GalaxyAnimation = React.lazy(() => import('../components/ui/GalaxyAnimation').then(m => ({ default: m.default })));
const ThreeDLandingPage = React.lazy(() => import('../components/ui/ThreeDLandingPage').then(m => ({ default: m.ThreeDLandingPage })));
/* const SolarSystem = React.lazy(() => import('../components/ui/SolarSystem')); */


// ── Lazy Loaded Internal Collections ───────────
// These are handled by LazyRenderer via renderComponent


import Logo from '../components/ui/Logo';



// ── Magnetic Cursor scoped preview ────────────
const MagneticCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [activeNav, setActiveNav] = useState(0);

    useEffect(() => {
        // Register the buttons as magnetic elements
        const buttons = document.querySelectorAll('.mc-demo-btn, .mc-nav-btn');
        let unregisters: (() => void)[] = [];
        const register = (window as any)._magneticCursorRegister;
        if (register) {
            buttons.forEach(btn => {
                const unreg = register(btn as HTMLElement);
                if (unreg) unregisters.push(unreg);
            });
        }
        return () => unregisters.forEach(fn => fn());
    }, []);

    return (
        <div
            ref={containerRef}
            className="group"
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#020204',
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.03) 0%, transparent 80%), radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.02) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.03) 0%, transparent 50%), radial-gradient(circle at 50% 50%, #0b0b1a 0%, #020204 100%)',
                overflow: 'hidden',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 40,
            }}
        >
            <MagneticBackground containerRef={containerRef} />
            <MagneticCursor cursorSize={20} magnetRadius={120} containerRef={containerRef} />

            {/* Top Navigation Bar */}
            <div style={{
                position: 'absolute', top: 32, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 999,
                padding: '6px',
                display: 'flex', gap: 4,
                backdropFilter: 'blur(24px)',
                zIndex: 20,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
                {['Home', 'Components', 'Backgrounds', 'Text Animations', 'Effects', 'Contact'].map((label, i) => (
                    <button
                        key={i}
                        className="mc-nav-btn"
                        onClick={() => setActiveNav(i)}
                        style={{
                            padding: '8px 16px',
                            fontSize: 13,
                            fontWeight: 500,
                            color: activeNav === i ? '#fff' : 'rgba(255,255,255,0.5)',
                            background: activeNav === i ? 'rgba(255,255,255,0.1)' : 'transparent',
                            borderRadius: 999,
                            border: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                            transition: 'color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
                            boxShadow: activeNav === i ? 'inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
                        }}
                    >
                        <span className="mc-content" style={{ display: 'inline-block', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', pointerEvents: 'none' }}>
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 10, pointerEvents: 'none', /* Offset title down slightly */ marginTop: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                    Interact Below
                </div>
                <div style={{
                    fontSize: 42, fontWeight: 900, letterSpacing: '-0.04em',
                    background: 'linear-gradient(180deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 32px rgba(165,180,252,0.4))',
                }}>
                    Magnetic Pull
                </div>
            </div>

            {/* Magnetic buttons */}
            <div style={{ display: 'flex', gap: 16, zIndex: 10 }}>
                {['Projects', 'About', 'Contact'].map((label, i) => (
                    <button
                        key={i}
                        className="mc-demo-btn"
                        style={{
                            padding: '12px 28px',
                            fontSize: 14,
                            fontWeight: 600,
                            color: 'rgba(255,255,255,0.95)',
                            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 999,
                            cursor: 'pointer',
                            outline: 'none',
                            backdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                        }}
                        onMouseEnter={(e) => {
                            setIsHovered(true);
                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)';
                        }}
                        onMouseLeave={(e) => {
                            setIsHovered(false);
                            e.currentTarget.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)';
                        }}
                    >
                        <span className="mc-content" style={{ display: 'inline-block', transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)', pointerEvents: 'none' }}>
                            {label}
                        </span>
                    </button>
                ))}
            </div>

            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.15em', textTransform: 'uppercase', zIndex: 10 }}>
                Hover buttons to snap · Magnetic Physics
            </div>
        </div>
    );
};

const MagneticElement: React.FC<{ children: React.ReactNode, className?: string, strength?: number }> = ({ children, className, strength = 15 }) => {
    const ref = useRef<HTMLDivElement>(null);
    const x = React.useRef(0);
    const y = React.useRef(0);
    const [style, setStyle] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (e.clientX - centerX) / strength;
        const dy = (e.clientY - centerY) / strength;
        setStyle({ x: dx, y: dy });
    };

    const handleMouseLeave = () => {
        setStyle({ x: 0, y: 0 });
    };

    return (
        <div
            ref={ref}
            className={className}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                transform: `translate(${style.x}px, ${style.y}px)`,
                transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                willChange: 'transform'
            }}
        >
            {children}
        </div>
    );
};

// ── Target Cursor scoped preview ─────────────────
const TargetCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [stats, setStats] = useState({ cpu: 42, mem: 68 });

    useEffect(() => {
        const interval = setInterval(() => {
            setStats({
                cpu: Math.floor(Math.random() * 20) + 30,
                mem: Math.floor(Math.random() * 10) + 60
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div
            ref={containerRef}
            className="target-cursor-area group"
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '400px',
                background: '#050505',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                cursor: 'none',
                fontFamily: "'Share Tech Mono', monospace",
            }}
        >
            {/* Background Grid */}
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'radial-gradient(#111 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                opacity: 0.5
            }} />

            {/* Scanline */}
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
                background: 'rgba(79, 70, 229, 0.1)',
                boxShadow: '0 0 10px rgba(79, 70, 229, 0.5)',
                animation: 'scanline-anim 4s linear infinite',
                pointerEvents: 'none',
                zIndex: 5
            }} />
            <style>{`
                @keyframes scanline-anim {
                    0% { transform: translateY(-400px); }
                    100% { transform: translateY(400px); }
                }
            `}</style>

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24, width: '80%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #1a1a1a', paddingBottom: 12 }}>
                    <div>
                        <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.2em' }}>SYSTEM_STATUS</div>
                        <div className="cursor-target" style={{ fontSize: 24, fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>UI_HUB // TARGETING_v4</div>
                    </div>
                    <div style={{ textAlign: 'right', fontSize: 10, color: '#fff' }}>
                        CPU: {stats.cpu}% <br />
                        MEM: {stats.mem}%
                    </div>
                </div>

                <div style={{ gridTemplateColumns: 'repeat(3, 1fr)', display: 'grid', gap: 16 }}>
                    {[1, 2, 3].map(i => (
                        <MagneticElement key={i} strength={10}>
                            <div 
                                className="cursor-target group/node"
                                style={{ 
                                    height: 100, 
                                    background: '#0a0a0a', 
                                    border: '1px solid #1a1a1a',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 10,
                                    color: '#333',
                                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                }}
                            >
                                <div style={{ transition: 'all 0.4s' }} className="group-hover/node:text-white group-hover/node:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">NODE_0{i}</div>
                                <style>{`
                                    .group\\/node:hover {
                                        border-color: #ffffff !important;
                                        box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
                                        background: #0d0d12 !important;
                                    }
                                `}</style>
                            </div>
                        </MagneticElement>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <MagneticElement className="flex-1" strength={20}>
                        <button 
                            className="cursor-target" 
                            style={{ 
                                width: '100%', padding: '12px', background: '#ffffff', color: '#000', fontSize: 11, fontWeight: 'bold', border: 'none', letterSpacing: '0.1em',
                                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                boxShadow: '0 4px 12px rgba(255, 255, 255, 0.2)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.02)';
                                e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 255, 255, 0.5)';
                                e.currentTarget.style.background = '#f0f0f0';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.background = '#ffffff';
                            }}
                        >
                            INITIALIZE_SCAN
                        </button>
                    </MagneticElement>
                    <MagneticElement className="flex-1" strength={20}>
                        <button 
                            className="cursor-target" 
                            style={{ 
                                width: '100%', padding: '12px', background: 'transparent', border: '1px solid #333', color: '#666', fontSize: 11, fontWeight: 'bold', letterSpacing: '0.1em',
                                transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ffffff';
                                e.currentTarget.style.color = '#fff';
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#333';
                                e.currentTarget.style.color = '#666';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.background = 'transparent';
                            }}
                        >
                            REBOOT
                        </button>
                    </MagneticElement>
                </div>
            </div>

            <TargetCursor containerRef={containerRef} hideDefaultCursor={true} />
        </div>
    );
};



// ── Black Hole Cursor scoped preview ────────────
const BlackHoleCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="group"
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#000',
                overflow: 'hidden',
                cursor: 'none',
            }}
        >
            <BlackHoleCursor gravityRadius={250} containerRef={containerRef}>
                {/* Mock Website Overlay */}
                <div style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Mock Nav */}
                    <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 'auto' }}>
                        <div style={{ display: 'flex', gap: 24 }}>
                            {['Home', 'About', 'Library'].map(link => (
                                <span key={link} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>{link}</span>
                            ))}
                        </div>
                    </nav>

                    {/* Hero Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: '20%' }}>
                        <h1 style={{
                            fontSize: 48, fontWeight: 900, letterSpacing: '-0.05em',
                            color: '#fff',
                            margin: 0,
                            textShadow: '0 0 40px rgba(139, 92, 246, 0.8)',
                        }}>
                            Black Hole
                        </h1>
                    </div>
                    {/* Interactive elements to test gravity pulse effect */}
                    <div style={{ display: 'flex', gap: 24, zIndex: 10, marginTop: 'auto', alignSelf: 'center', paddingBottom: '20px' }}>
                        {['Singularity', 'Wormhole', 'Nebula'].map((label, i) => (
                            <button
                                key={i}
                                className="bh-demo-btn group/btn"
                                style={{
                                    position: 'relative',
                                    padding: '10px 24px',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: '0.1rem',
                                    textTransform: 'uppercase',
                                    color: '#fff',
                                    background: 'transparent',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    pointerEvents: 'auto',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Inner Black Hole Effect */}
                                <div className="btn-bh-core" style={{
                                    position: 'absolute',
                                    top: '50%', left: '50%',
                                    width: '0%', height: '0%',
                                    background: '#000',
                                    borderRadius: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                                    zIndex: 0,
                                    boxShadow: '0 0 0 0 rgba(139, 92, 246, 0)',
                                }} />

                                <span className="relative z-10 transition-transform duration-300 inline-block group-hover/btn:scale-110 group-hover/btn:tracking-[0.2em]">{label}</span>
                            </button>
                        ))}
                    </div>

                    <style>{`
                        .bh-demo-btn {
                            overflow: hidden;
                            position: relative;
                            isolation: isolate;
                        }
                        .bh-demo-btn:hover {
                            border-color: rgba(165, 243, 252, 0.6);
                            transform: scale(1.05);
                            box-shadow: 
                                0 0 20px rgba(139, 92, 246, 0.3),
                                0 0 40px rgba(6, 182, 212, 0.15),
                                inset 0 0 12px rgba(165, 243, 252, 0.1);
                        }
                        .bh-demo-btn:hover .btn-bh-core {
                            width: 140%;
                            padding-bottom: 140%;
                            box-shadow: 
                                0 0 50px 15px #000,
                                0 0 20px 2px rgba(165, 243, 252, 0.8),
                                0 0 40px 10px rgba(139, 92, 246, 0.4);
                        }
                        .bh-demo-btn span {
                            transition: all 0.4s ease;
                        }
                        .bh-demo-btn:hover span {
                            letter-spacing: 0.25em;
                            text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                        }
                    `}</style>
                </div>
            </BlackHoleCursor>
        </div>
    );
};

// ── stable star positions (deterministic, no per-render Math.random) ─────────
const AURORA_DOTS = Array.from({ length: 40 }, (_, i) => ({
    top: ((i * 73 + 17) % 97).toFixed(1),
    left: ((i * 53 + 31) % 97).toFixed(1),
    size: i % 4 === 0 ? 3 : 2,
    opacity: i % 5 === 0 ? 0.28 : 0.10,
    dur: 3 + (i % 4),
    delay: (i * 0.27) % 3,
}));

// ── Aurora Cursor scoped preview (blob tracks mouse inside card) ────────────
const AuroraCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const blobRef = useRef<HTMLDivElement>(null);
    const pos = useRef({ x: -999, y: -999 });
    const target = useRef({ x: -999, y: -999 });
    const vel = useRef({ x: 0, y: 0 });
    const rafId = useRef<number>(0);
    const [activeNav, setActiveNav] = React.useState(0);
    const BLOB_SIZE = 160;
    const HALF = BLOB_SIZE / 2;

    const animate = useCallback(() => {
        vel.current.x += (target.current.x - pos.current.x) * 0.07;
        vel.current.y += (target.current.y - pos.current.y) * 0.07;
        vel.current.x *= 0.80;
        vel.current.y *= 0.80;
        pos.current.x += vel.current.x;
        pos.current.y += vel.current.y;
        if (blobRef.current) {
            blobRef.current.style.transform =
                `translate(${pos.current.x - HALF}px, ${pos.current.y - HALF}px)`;
        }
        rafId.current = requestAnimationFrame(animate);
    }, [HALF]);

    const onEnter = useCallback(() => { rafId.current = requestAnimationFrame(animate); }, [animate]);
    const onLeave = useCallback(() => { cancelAnimationFrame(rafId.current); }, []);
    const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        target.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }, []);

    return (
        <div
            ref={containerRef}
            onMouseMove={onMove}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: 'radial-gradient(ellipse at 50% 55%, #080618 0%, #020208 100%)',
                overflow: 'hidden',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            <style>{`
                @keyframes ac-shift  { 0%{background-position:0% 50%}  50%{background-position:100% 50%} 100%{background-position:0% 50%} }
                @keyframes ac-morph  {
                    0%  {border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
                    25% {border-radius:40% 60% 70% 30%/40% 70% 30% 60%}
                    50% {border-radius:50% 50% 40% 60%/30% 60% 40% 70%}
                    75% {border-radius:30% 70% 60% 40%/70% 40% 60% 30%}
                    100%{border-radius:60% 40% 30% 70%/60% 30% 70% 40%}
                }
                @keyframes ac-pulse   { 0%,100%{opacity:.60} 50%{opacity:.90} }
                @keyframes ac-twinkle { 0%,100%{opacity:.06} 50%{opacity:.30} }
                .ac-nav-btn { transition: background 0.22s, color 0.22s, box-shadow 0.22s; }
                .ac-nav-btn:hover { background: rgba(255,255,255,0.10) !important; color: rgba(255,255,255,0.9) !important; }
            `}</style>

            {/* ── Aurora blob ── */}
            <div ref={blobRef} style={{
                position: 'absolute', top: 0, left: 0,
                width: BLOB_SIZE, height: BLOB_SIZE,
                pointerEvents: 'none', willChange: 'transform', zIndex: 1,
            }}>
                <div style={{
                    width: '100%', height: '100%',
                    background: [
                        'radial-gradient(circle at 30% 30%,rgba(139,92,246,.95) 0%,transparent 55%)',
                        'radial-gradient(circle at 70% 60%,rgba(6,182,212,.90)  0%,transparent 55%)',
                        'radial-gradient(circle at 50% 80%,rgba(236,72,153,.80) 0%,transparent 50%)',
                        'radial-gradient(circle at 20% 70%,rgba(99,102,241,.85) 0%,transparent 50%)',
                        'radial-gradient(circle at 80% 20%,rgba(34,211,238,.70) 0%,transparent 50%)',
                    ].join(','),
                    backgroundSize: '400% 400%',
                    filter: `blur(${BLOB_SIZE * 0.24}px)`,
                    mixBlendMode: 'screen',
                    animation: 'ac-shift 8s ease infinite, ac-morph 12s ease-in-out infinite, ac-pulse 4s ease-in-out infinite',
                }} />
            </div>

            {/* ── Star field ── */}
            {AURORA_DOTS.map((d, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    width: d.size, height: d.size,
                    borderRadius: '50%',
                    background: `rgba(200,180,255,${d.opacity})`,
                    top: `${d.top}%`, left: `${d.left}%`,
                    animation: `ac-twinkle ${d.dur}s ease-in-out infinite`,
                    animationDelay: `${d.delay}s`,
                }} />
            ))}

            {/* ── Navbar — pinned to top ── */}
            <div style={{
                position: 'absolute', top: 20, left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                display: 'flex', alignItems: 'center',
                background: 'rgba(10,8,24,0.70)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 999,
                padding: '5px 6px',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
                whiteSpace: 'nowrap',
            }}>
                {['Home', 'About', 'Services'].map((label, i) => (
                    <button
                        key={i}
                        className="ac-nav-btn"
                        onClick={() => setActiveNav(i)}
                        style={{
                            padding: '8px 22px',
                            fontSize: 13,
                            fontWeight: 600,
                            color: activeNav === i ? 'rgba(255,255,255,0.97)' : 'rgba(255,255,255,0.45)',
                            borderRadius: 999,
                            background: activeNav === i ? 'rgba(255,255,255,0.09)' : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: '0.02em',
                            outline: 'none',
                            boxShadow: activeNav === i ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : 'none',
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ── Center title ── */}
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase' }}>
                    Move your cursor
                </div>
                <div style={{
                    fontSize: 36, fontWeight: 900, letterSpacing: '-0.03em',
                    background: 'linear-gradient(135deg,#c084fc 0%,#67e8f9 50%,#f472b6 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 24px rgba(139,92,246,0.5))',
                }}>
                    Aurora Cursor
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.14)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: 4 }}>
                    Northern lights · CSS blur · Spring physics
                </div>
            </div>
        </div>
    );
};






// ── Heart Cursor scoped preview (Lovable Style) ────────────
const HeartCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#000',
                overflow: 'hidden',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Lovable-style Background Gradients */}
            <div style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
            }}>
                {/* Blue blobs (sides) */}
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '-10%',
                    width: '50%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />
                <div style={{
                    position: 'absolute',
                    top: '20%',
                    right: '-10%',
                    width: '50%',
                    height: '60%',
                    background: 'radial-gradient(circle, rgba(59, 130, 246, 0.45) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                }} />

                {/* Pink Bottom Area */}
                <div style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '0',
                    width: '100%',
                    height: '70%',
                    background: 'radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.5) 0%, transparent 75%)',
                    filter: 'blur(60px)',
                }} />

                {/* Vignette to keep top dark */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 40%, transparent 70%, rgba(236, 72, 153, 0.1) 100%)',
                }} />
            </div>

            <HeartCursor containerRef={containerRef} size={28} />

            {/* Lovable Content Mockup */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                {/* Branding Badge */}
                <div
                    className="interactive"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: -8,
                        cursor: 'none'
                    }}
                >
                    <Logo className="w-9 h-9" />
                    <span style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: '#fff',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase'
                    }}>UI HUB</span>
                </div>

                <h2
                    className="interactive"
                    style={{
                        fontSize: 32,
                        fontWeight: 600,
                        color: '#fff',
                        letterSpacing: '-0.02em',
                        cursor: 'none'
                    }}
                >
                    Ready to build, Hello?
                </h2>

                <div
                    className="interactive"
                    style={{
                        width: '90%',
                        background: 'rgba(28, 28, 28, 0.95)',
                        borderRadius: 24,
                        padding: '16px 20px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 12,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        backdropFilter: 'blur(10px)',
                        cursor: 'none'
                    }}
                >
                    <div style={{ textAlign: 'left', color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 500 }}>
                        Search UI components, animations, and backgrounds.
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="interactive" style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.6)', cursor: 'none' }}>
                            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            {/* Branding Icons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 20, height: 20, background: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#fff' }}>H</div>
                                <div style={{ width: 22, height: 22, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: '#fff' }}>U</div>
                            </div>
                            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em' }}>Plan</span>
                            <div className="interactive" style={{ color: 'rgba(255,255,255,0.5)', cursor: 'none' }}>
                                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" /><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
                            </div>
                            <div className="interactive" style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'none' }}>
                                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .interactive:hover {
                    filter: brightness(1.3);
                    transform: scale(1.05);
                }
            `}</style>
        </div>
    );
};

// ── Lizard Cursor scoped preview ────────────
const LizardCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsInside(true)}
            onMouseLeave={() => setIsInside(false)}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '400px',
                background: '#050508',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: isInside ? 'none' : 'default',
            }}
        >
            {/* Immersive Lab Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(34, 197, 94, 0.05) 0%, transparent 70%),
                    linear-gradient(rgba(34, 197, 94, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(34, 197, 94, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                pointerEvents: 'none',
            }} />

            {/* Content Layer */}
            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', width: '90%', maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32 }}>
                
                {/* Header Section */}
                <div style={{ borderBottom: '1px solid rgba(34, 197, 94, 0.1)', paddingBottom: 24, width: '100%' }}>
                    <div style={{ 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12,
                        fontSize: 10, color: '#22c55e', letterSpacing: '0.5em', fontWeight: 'bold' 
                    }}>
                        <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 10px #22c55e' }} />
                        UI_HUB // ADAPTIVE_BIOME
                    </div>
                    <h2 className="interactive" style={{ fontSize: 32, fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
                        WE BUILD NEXT-GEN UI EXPERIENCES
                    </h2>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 12, maxWidth: '500px', marginInline: 'auto', lineHeight: 1.6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        Designing Next-Gen UI Systems That Make Brands Unforgettable.
                    </p>
                </div>

                {/* Interactive Grid */}
                <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                    {[1, 2, 3].map(i => (
                        <MagneticElement key={i} strength={15} className="flex-1">
                            <div 
                                className="interactive"
                                style={{ 
                                    height: 120, 
                                    background: 'rgba(255, 255, 255, 0.02)', 
                                    border: '1px solid rgba(34, 197, 94, 0.1)',
                                    borderRadius: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 12,
                                    transition: 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
                                    cursor: 'none',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                                    e.currentTarget.style.background = 'rgba(34, 197, 94, 0.05)';
                                    e.currentTarget.style.boxShadow = '0 0 30px rgba(34, 197, 94, 0.15)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.1)';
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div style={{ fontSize: 24 }}>{i === 1 ? '🦎' : i === 2 ? '🧬' : '🔬'}</div>
                                <div style={{ fontSize: 9, color: '#22c55e', fontWeight: 'bold', letterSpacing: '0.2em' }}>NODE_0{i}</div>
                            </div>
                        </MagneticElement>
                    ))}
                </div>

                {/* Primary & Secondary CTAs */}
                <div style={{ display: 'flex', gap: 16, width: '100%' }}>
                    <MagneticElement className="flex-1" strength={25}>
                        <button 
                            className="interactive" 
                            style={{ 
                                width: '100%', padding: '16px', background: '#fff', 
                                color: '#000', fontSize: 12, fontWeight: '900', border: 'none', letterSpacing: '0.2em',
                                borderRadius: '12px', transition: 'all 0.3s ease', cursor: 'none',
                                boxShadow: '0 8px 32px rgba(255,255,255,0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 12px 48px rgba(255,255,255,0.25)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,255,255,0.1)';
                            }}
                        >
                            INITIALIZE_BIOME
                        </button>
                    </MagneticElement>

                    <MagneticElement className="flex-1" strength={25}>
                        <button 
                            className="interactive" 
                            style={{ 
                                width: '100%', padding: '16px', background: 'rgba(34, 197, 94, 0.03)', 
                                color: '#fff', fontSize: 12, fontWeight: '900', border: '1px solid rgba(34, 197, 94, 0.2)', 
                                letterSpacing: '0.2em', borderRadius: '12px', transition: 'all 0.3s ease', cursor: 'none',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.08)';
                                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.5)';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(34, 197, 94, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(34, 197, 94, 0.03)';
                                e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.2)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            RESET_BIOME
                        </button>
                    </MagneticElement>
                </div>
            </div>

            {isInside && <LizardCursor color="#22c55e" containerRef={containerRef} />}
        </div>
    );
};

// ── Venom Cursor scoped preview ────────────
const VenomCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsInside(true)}
            onMouseLeave={() => setIsInside(false)}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#040406',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Visual Web Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 80%),
                    repeating-radial-gradient(circle at 50% 50%, transparent 0, transparent 40px, rgba(255, 255, 255, 0.02) 40px, rgba(255, 255, 255, 0.02) 41px),
                    linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 20px 20px, 20px 20px',
                pointerEvents: 'none',
            }} />

            {/* Subtle Noise/Grain Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.15,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                mixBlendMode: 'overlay'
            }} />

            {/* Navigation Demo Buttons */}
            <div style={{
                position: 'absolute',
                top: 40,
                display: 'flex',
                gap: 30,
                zIndex: 50,
            }}>
                {['HOME', 'ABOUT', 'PROJECTS', 'CONTACT'].map((item) => (
                    <button
                        key={item}
                        style={{
                            border: '1px solid transparent',
                            color: 'rgba(255, 255, 255, 0.3)',
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: '0.15em',
                            transition: 'all 0.3s ease',
                            background: 'transparent',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)';
                            e.currentTarget.style.textShadow = 'none';
                        }}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {isInside && <VenomCursor color="#ffffff" containerRef={containerRef} />}

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                {/* Branding text removed as per user request */}
            </div>
        </div>
    );
};

// ── 3D Tubes Cursor scoped preview ────────────
const ThreeDTubesCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsInside(true)}
            onMouseLeave={() => setIsInside(false)}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#050508',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
            }}
        >
            {/* Deep Space Neon Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 20% 30%, rgba(249, 103, 251, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 80% 70%, rgba(83, 188, 40, 0.08) 0%, transparent 50%),
                    radial-gradient(circle at 50% 50%, rgba(105, 88, 213, 0.12) 0%, transparent 80%),
                    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px',
                pointerEvents: 'none',
            }} />

            {/* Glassmorphic Navigation Buttons */}
            <div style={{
                position: 'absolute',
                top: 40,
                display: 'flex',
                gap: 20,
                zIndex: 50,
            }}>
                {[
                    { name: 'HOME', color: '#f967fb' },
                    { name: 'ABOUT', color: '#53bc28' },
                    { name: 'PROJECTS', color: '#6958d5' },
                    { name: 'CONTACT', color: '#ff008a' }
                ].map((item) => (
                    <button
                        key={item.name}
                        style={{
                            padding: '8px 16px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            color: 'rgba(255, 255, 255, 0.4)',
                            fontSize: 10,
                            fontWeight: 800,
                            letterSpacing: '0.2em',
                            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.currentTarget.style.borderColor = item.color;
                            e.currentTarget.style.boxShadow = `0 0 25px ${item.color}66`;
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                        }}
                    >
                        {item.name}
                    </button>
                ))}
            </div>

            {isInside && <ThreeDTubesCursor containerRef={containerRef} />}

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                <div style={{
                    fontSize: 8,
                    fontWeight: 800,
                    letterSpacing: '0.5em',
                    color: 'rgba(255,255,255,0.15)',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    padding: '10px 40px',
                    borderRadius: '100px'
                }}>
                    Dimensional Flux
                </div>
            </div>
        </div>
    );
};

// ── 3D Slider scoped preview ────────────
const ThreeDSliderPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#0a0a0f',
            overflow: 'hidden',
            borderRadius: '24px'
        }}>
            <ThreeDSlider autoPlay={true} interval={6000} />
            
            {/* Library Themed Overlay */}
            <div style={{
                position: 'absolute',
                top: 30,
                left: 30,
                zIndex: 50,
                pointerEvents: 'none'
            }}>
                <div style={{
                    fontSize: 10,
                    fontWeight: 900,
                    color: 'rgba(255,255,255,0.2)',
                    letterSpacing: '0.5em',
                    textTransform: 'uppercase'
                }}>
                    3D UI HUB Component
                </div>
            </div>
        </div>
    );
};













export type ComponentItem = {
    id: string;
    title: string;
    category: "text" | "effect" | "background" | "button" | "cursor" | "3d" | "custom" | "portfolios";
    preview: (props?: any) => React.ReactNode;
    code: string;
    vibePrompt: string;
    uploader?: string;
    imageUrl?: string;
    isPremium?: boolean;
    downloadUrl?: string;
};

// Helper to render lazy text/effect components
const LazyRenderer: React.FC<{ type: 'animation' | 'effect', name: string, rawName: string, componentProps?: any }> = ({ type, name, rawName, componentProps = {} }) => {
    const [Comp, setComp] = useState<any>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const module = type === 'animation' 
                    ? await import('../components/animations/TextAnimations')
                    : await import('../components/animations/VisualEffects');
                
                const component = module[name] || module[rawName];
                setComp(() => component);
            } catch (err) {
                console.error(`Failed to load ${type} ${name}:`, err);
            }
        };
        load();
    }, [type, name, rawName]);

    if (!Comp) return <div className="animate-pulse opacity-10 flex items-center justify-center w-full h-full font-bold uppercase tracking-widest text-[10px]">LODING...</div>;
    return <Comp {...componentProps} />;
};

// Map of UI components for direct lazy loading
const UI_COMPONENTS: Record<string, React.LazyExoticComponent<any>> = {
    'aurora-cursor': AuroraCursor,
    'magnetic-cursor': MagneticCursor,
    'magnetic-background': MagneticBackground,
    'black-hole-cursor': BlackHoleCursor,
    'target-cursor': TargetCursor,
    'space-background': SpaceBackground,
    'neural-network-background': NeuralNetworkBackground,
    'black-hole-background': BlackHoleBackground,
    'warp-speed-background': WarpSpeedBackground,
    'mouse-gravity-background': MouseGravityBackground,
    'interactive-webgl-scene': InteractiveWebGLScene,
    '3d-scroll-animation': Scroll3DAnimation,
    '3d-slider': ThreeDSlider,
    '3d-rubiks-cube': RubiksCube,
    'black-box': BlackBox,
    'neo-brutalism-os': NeoBrutalism,
    'heart-cursor': HeartCursor,
    'lizard-cursor': LizardCursor,
    'venom-cursor': VenomCursor,
    '3d-tubes-cursor': ThreeDTubesCursor,
    '3d-galaxy-animation': GalaxyAnimation,
    '3d-landing-page': ThreeDLandingPage,
};

// Lazy component resolver - returns a factory function to avoid eager initialization
const renderComponent = (id: string, _name: string, props: any = {}): (() => React.ReactNode) => {
    return () => {
        // First check if it's in our UI components map
        const UIComp = UI_COMPONENTS[id];
        if (UIComp) {
            return <UIComp {...props} />;
        }

        const rawName = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        // If it's a text category, it might need 'Text' suffix if it's not already in the ID
        const isText = id.includes('text') || id.includes('cinematic') || id.includes('separate') || id.includes('wavy');
        const CompName = isText ? (id.endsWith('-text') ? rawName : `${rawName}Text`) : rawName;

        return (
            <LazyRenderer 
                type={isText ? 'animation' : 'effect'} 
                name={CompName} 
                rawName={rawName} 
                componentProps={props}
            />
        );
    };
};

// Assuming these prompts apply as they were defined in VibeMeta
export const componentList: ComponentItem[] = [

    {
        id: "target-cursor",
        title: "Target Cursor",
        category: "cursor",
        preview: () => <TargetCursorPreview />,
        code: "",
        vibePrompt: "Create a precision 'TargetCursor' React component with Framer Motion that implements a 'snap-to-target' behavior using the 'cursor-target' CSS selector. Use a technical white bracket-style aesthetic with an animated spinning center dot. Ensure the cursor supports parallax effects when hovering targets and includes a glassmorphic/difference blend mode for high visibility on 'UI HUB' branding elements. Supports responsiveness and specific container-based tracking."
    },
    {
        id: "black-hole-cursor",
        title: "Black Hole Cursor",
        category: "cursor",
        isPremium: true,
        preview: () => <BlackHoleCursorPreview />,
        code: "",
        vibePrompt: ""
    },
    {
        id: "magnetic-cursor",
        title: "Magnetic Cursor",
        category: "cursor",
        preview: () => <MagneticCursorPreview />,
        code: "",
        vibePrompt: ""
    },
    {
        id: "blur-text",
        title: "Blur In Text",
        category: "text",
        preview: renderComponent("blur-text", "Blur In Text"),
        code: ``,
        vibePrompt: ""
    },
    {
        id: "fade-text",
        title: "Fade Text",
        category: "text",
        preview: renderComponent("fade-text", "Fade Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FadeText = ({ text = "FADE TEXT" }) => (\n  <motion.div\n    initial={{ opacity: 0 }}\n    animate={{ opacity: 1 }}\n    transition={{ duration: 1.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: ""
    },
    {
        id: "dock-text",
        title: "Dock Text",
        category: "text",
        preview: renderComponent("dock-text", "Dock Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const DockText = ({ text = "DOCK TEXT" }) => (\n  <motion.div\n    whileHover={{ scale: 1.5 }}\n    transition={{ type: "spring", duration: 0.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: ""
    },
    {
        id: "font-weight",
        title: "Font Weight Text",
        category: "text",
        preview: renderComponent("font-weight", "Font Weight Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FontWeightText = ({ text = "VARIABLE WEIGHT" }) => (\n  <motion.div\n    animate={{ fontWeight: [400, 900, 400] }}\n    transition={{ duration: 1, repeat: Infinity }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: ""
    },
    {
        id: "noise",
        title: "Noise Background",
        category: "effect",
        preview: renderComponent("noise", "Noise", { opacity: 0.1 }),
        code: `import { Noise } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-64 overflow-hidden bg-black">\n    <h1 className="text-white text-4xl p-8">Noise Overlay</h1>\n    <Noise opacity={0.15} />\n  </div>\n);`,
        vibePrompt: `export const Noise = ({
    opacity = 0.05,
    baseFrequency = "0.65",
    numOctaves = "3",
    className = ""
}: NoiseProps) => {
    const [noiseOpacity, setNoiseOpacity] = useState(opacity);

    return (
        <div className={cn('relative border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden bg-neutral-950', className)}>
            <div className='absolute top-4 right-4 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10'>
                <label htmlFor='opacity-slider' className='text-[10px] font-bold uppercase tracking-wider text-white/60'>
                    Noise:
                </label>
                <input
                    id='opacity-slider'
                    type='range'
                    min='0'
                    max='0.2'
                    step='0.01'
                    value={noiseOpacity}
                    onChange={(e) => setNoiseOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400"
                />
                <span className='text-[10px] font-mono text-cyan-400 w-8'>{noiseOpacity.toFixed(2)}</span>
            </div>

            <div
                className="absolute inset-0 z-10 pointer-events-none mix-blend-overlay"
                style={{
                    opacity: noiseOpacity,
                    backgroundImage: \`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='\${baseFrequency}' numOctaves='\${numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")\`
                }}
            ></div>

            <div className='h-[300px] flex flex-col items-center justify-center text-white relative z-0'>
                <div className='absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]'></div>
                <h1 className='text-3xl font-display font-bold text-center tracking-tight leading-tight uppercase'>
                    Noise Overlay<br />
                    <span className="text-cyan-400">Effect</span>
                </h1>
            </div>
        </div>
    );
};`
    },
    {
        id: "gradual-spacing",
        title: "Gradual Spacing",
        category: "text",
        preview: renderComponent("gradual-spacing", "Gradual Spacing"),
        code: `import { motion } from 'framer-motion';\n\nexport const GradualSpacing = ({ text = "GRADUAL SPACING" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ letterSpacing: "-0.5em", opacity: 0 }}\n        animate={{ letterSpacing: "normal", opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "letter-pull-up",
        title: "Letter Pull Up",
        category: "text",
        preview: renderComponent("letter-pull-up", "Letter Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const LetterPullUp = ({ text = "LETTER PULL UP" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "multi-direction-slide",
        title: "Multi Direction Slide",
        category: "text",
        preview: renderComponent("multi-direction-slide", "Multi Direction Slide"),
        code: `import { motion } from 'framer-motion';\n\nexport const MultiDirectionSlide = ({ text = "MULTI DIRECTION" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: i % 2 === 0 ? -50 : 50, y: i % 2 !== 0 ? -50 : 50, opacity: 0 }}\n        animate={{ x: 0, y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "scale-letter",
        title: "Scale Letter",
        category: "text",
        preview: renderComponent("scale-letter", "Scale Letter"),
        code: `import { motion } from 'framer-motion';\n\nexport const ScaleLetter = ({ text = "SCALE LETTER" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ scale: 0, opacity: 0 }}\n        animate={{ scale: 1, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "separate-away",
        title: "Separate Away",
        category: "text",
        preview: renderComponent("separate-away", "Separate Away"),
        code: `import { motion } from 'framer-motion';\n\nexport const SeparateAway = ({ text = "SEPARATE AWAY" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: 0 }}\n        animate={{ x: i < text.length / 2 ? -15 : 15 }}\n        transition={{ duration: 0.5 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "wavy-text",
        title: "Wavy Text",
        category: "text",
        preview: renderComponent("wavy-text", "Wavy Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const WavyText = ({ text = "WAVY TEXT" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        animate={{ y: [0, -8, 0] }}\n        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "word-pull-up",
        title: "Word Pull Up",
        category: "text",
        preview: renderComponent("word-pull-up", "Word Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const WordPullUp = ({ text = "WORD PULL UP" }) => (\n  <div className="flex gap-2 overflow-hidden">\n    {text.split(' ').map((word, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.2 }}\n      >\n        {word}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "liquid-glass",
        title: "Liquid Glass",
        category: "effect",
        preview: renderComponent("liquid-glass", "Liquid Glass", { location: "SURAT", temp: "18" }),
        code: `import { LiquidGlass } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[300px] flex items-center justify-center bg-neutral-900">\n    <LiquidGlass location="NEW YORK" temp="22" />\n  </div>\n);`,
        vibePrompt: `export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: \`\${backgroundImage} center / cover no-repeat\`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                <LiquidGlassCard className='col-span-2 p-6 text-white bg-white/5'>
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        {/* Weather Forecast content... */}
                    </div>
                </LiquidGlassCard>
                {/* Current Weather & Time Cards... */}
            </div>
        </div>
    );
};`
    },
    {
        id: "blur-vignette",
        title: "Blur Vignette",
        category: "effect",
        preview: renderComponent("blur-vignette", "Blur Vignette"),
        code: `export const BlurVignette = () => (\n  <div className="w-full h-full absolute inset-0 backdrop-blur-[10px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)] pointer-events-none"></div>\n);`,
        vibePrompt: `export const BlurVignetteEffect = ({
    blur = "12px",
    radius = "16px",
    image1 = 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop',
    image2 = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
    title1 = "Cosmos",
    title2 = "Abstract",
    className = ""
}: BlurVignetteEffectProps) => {
    return (
        <div className={cn('w-full max-w-2xl mx-auto flex gap-4 justify-center p-4 bg-neutral-900/50 rounded-2xl border border-white/5', className)}>
            <BlurVignette radius={radius} blur={blur} className="flex-1 aspect-square">
                <img src={image1} className='w-full h-full object-cover' />
                <BlurVignetteArticle classname='absolute inset-x-2 bottom-2 p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md text-white'>
                    <h3 className='text-lg font-bold'>{title1}</h3>
                </BlurVignetteArticle>
            </BlurVignette>
        </div>
    );
};`
    },
    {
        id: "liquid-gradient",
        title: "Liquid Gradient",
        category: "effect",
        preview: renderComponent("liquid-gradient", "Liquid Gradient"),
        code: `export const LiquidGradient = () => (\n  <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,0,0.2),_transparent_50%)] animate-pulse"></div>\n);`,
        vibePrompt: `export const LiquidGradient = ({
    color = "#ff0080",
    opacity = 0.3,
    duration = 10,
    className = ""
}: LiquidGradientProps) => (
    <div className={cn("w-64 h-64 rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950", className)}>
        <motion.div
            animate={{
                background: [
                    \`radial-gradient(at 0% 0%, \${color} 0px, transparent 50%)\`,
                    \`radial-gradient(at 100% 100%, \${color} 0px, transparent 50%)\`,
                    \`radial-gradient(at 0% 100%, \${color} 0px, transparent 50%)\`,
                    \`radial-gradient(at 0% 0%, \${color} 0px, transparent 50%)\`,
                ]
            }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
            style={{ opacity }}
        />
        <div className="flex items-center justify-center h-full relative z-10 text-white/50 font-display text-xl font-bold uppercase pointer-events-none">
            LIQUID GRADIENT
        </div>
    </div>
);`
    },
    {
        id: "spotlight-cards",
        title: "Spotlight Cards",
        category: "effect",
        isPremium: true,
        preview: renderComponent("spotlight-cards", "Spotlight Cards", { title: "Feature", description: "Hover to reveal the hidden spotlight effect." }),
        code: "",
        vibePrompt: `export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    // ... logic for mouse tracking and scroll sync ...
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        
        // Account for CSS scaling (essential for library previews)
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            <div ref={containerRef} onMouseMove={handleMouseMove} className="w-full max-w-5xl relative group">
                <div ref={scrollRef} onScroll={handleScroll} className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory">
                    {cards.map((card, i) => (
                        <div key={i} className="relative flex-shrink-0 w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
                            {/* Card content with text-white/70 for base state */}
                        </div>
                    ))}
                </div>
                {/* Spotlight Overlay Layer - Reveals full brightness content */}
                <div className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-500" style={{
                    opacity: isHovered ? 1 : 0,
                    WebkitMaskImage: \`radial-gradient(circle 35rem at \${mousePos.x}px \${mousePos.y}px, black 0%, transparent 70%)\`
                }}>
                    <div ref={overlayScrollRef} className="flex gap-6 p-6 overflow-x-hidden w-full h-full">
                        {/* High-intensity "glow" versions of cards... */}
                    </div>
                </div>
            </div>
        </div>
    );
};`
    },
    {
        id: "image-reveal",
        title: "Image Reveal",
        category: "effect",
        preview: renderComponent("image-reveal", "Image Reveal"),
        code: ``,
        vibePrompt: `export const ImageReveal = ({
    items = visualData,
    hoverText = "REVEAL",
    className = ""
}: ImageRevealProps & { hoverText?: string }) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothX = useSpring(cursorX, { stiffness: 300, damping: 40 });
    const smoothY = useSpring(cursorY, { stiffness: 300, damping: 40 });

    useEffect(() => {
        const updateScreen = () => {
            setIsLargeScreen(window.innerWidth >= 768);
        };
        updateScreen();
        window.addEventListener("resize", updateScreen);
        return () => window.removeEventListener("resize", updateScreen);
    }, []);

    const onMouseTrack = (e: React.MouseEvent) => {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={() => setFocusedItem(null)}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => setFocusedItem(item)}
                >
                    <h2 className="font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold text-white/60 hover:text-white transition-colors">
                        {item.label}
                    </h2>
                    <ArrowIcon className="w-8 h-8 text-white/20" />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl"
                    style={{ left: smoothX, top: smoothY, x: "-50%", y: "-50%" }}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                />
            )}
        </div>
    );
};`
    },
    {
        id: "blocks",
        title: "Blocks",
        category: "effect",
        preview: renderComponent("blocks", "Blocks"),
        code: `import { motion } from 'framer-motion';\n\nexport const Blocks = () => (\n  <div className="grid grid-cols-4 grid-rows-4 gap-1 w-64 h-64">\n    {Array.from({ length: 16 }).map((_, i) => (\n      <motion.div key={i} className="bg-white/10 rounded-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} />\n    ))}\n  </div>\n);`,
        vibePrompt: `export const Blocks = ({
    className = "",
    hoverColor = "hover:bg-violet-500/20",
    gridSize = 16
}: BlocksProps) => (
    <div className={cn("w-64 h-64 rounded-3xl border border-white/10 overflow-hidden grid grid-cols-4 grid-rows-4 bg-neutral-950", className)}>
        {Array.from({ length: gridSize }).map((_, i) => (
            <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className={cn("border-[0.5px] border-white/5 bg-white/5 transition-colors", hoverColor)}
            />
        ))}
    </div>
);`
    },
    {
        id: "animated-beam",
        title: "Animated Beam",
        category: "effect",
        preview: renderComponent("animated-beam", "Animated Beam"),
        code: `import { motion } from 'framer-motion';\n\nexport const AnimatedBeam = () => (\n  <motion.div\n    animate={{ x: [-100, 300] }}\n    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}\n    className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent w-32"\n  />\n);`,
        vibePrompt: `export const AnimatedBeam = ({
    color = "sky-400",
    duration = 2,
    className = ""
}: AnimatedBeamProps) => (
    <div className={cn("w-64 h-64 rounded-3xl bg-neutral-900 border border-white/10 relative overflow-hidden flex items-center justify-center", className)}>
        <motion.div
            animate={{ x: [-100, 300] }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            className={cn("absolute h-[2px] w-24 bg-gradient-to-r from-transparent to-transparent", \`via-\${color}\`)}
            style={{ transform: 'rotate(-45deg)' }}
        />
        <div className={cn("font-display text-2xl font-bold uppercase", \`text-\${color}\`)}>BEAM</div>
    </div>
);`
    },
    {
        id: "grid-background",
        title: "Grid Background",
        category: "background",
        preview: renderComponent("grid-background", "Grid Background", { opacity: 0.5, maskRadius: 40 }),
        code: `import { GridBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden bg-black">\n    <GridBackground opacity={0.6} maskRadius={30} />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "hacker-background",
        title: "Hacker Background",
        category: "background",
        preview: renderComponent("hacker-background", "Hacker Background"),
        code: `// Implementation for Hacker Background\nexport const HackerBackground = () => (\n  <div className="w-full h-full bg-black text-green-500 font-mono flex items-center justify-center">\n    01010101 MATRIX 10101010\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "novatrix-background",
        title: "Novatrix Background",
        category: "background",
        preview: renderComponent("novatrix-background", "Novatrix Background", { title: "NEBULA" }),
        code: `import { NovatrixBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden">\n    <NovatrixBackground \n      title="UI HUB" \n      colorFrom="#1a1a2e" \n      colorTo="#16213e" \n      opacity={0.8} \n    />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "beam-grid-background",
        title: "Beam Grid Background",
        category: "background",
        preview: renderComponent("beam-grid-background", "Beam Grid Background"),
        code: `// ... Beam Grid Background code is quite large, see the repo ...\nimport BeamGridBackground from '@/components/ui/BeamGridBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px]">\n    <BeamGridBackground\n      className="bg-black"\n      gridColor="rgba(255,255,255,0.05)"\n      darkGridColor="rgba(255,255,255,0.05)"\n    />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "fall-beam-background",
        title: "Fall Beam Background",
        category: "background",
        preview: renderComponent("fall-beam-background", "Fall Beam Background"),
        code: `import FallBeamBackground from '@/components/ui/FallBeamBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <FallBeamBackground\n      className="bg-transparent"\n      lineCount={30}\n      beamColorClass="cyan-400"\n    />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "hell-background",
        title: "Hell Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("hell-background", "Hell Background", { intensity: 1.5, speed: 0.8 }),
        code: "",
        vibePrompt: ""

    },
    {
        id: "interactive-grid-background",
        title: "Interactive Grid Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("interactive-grid-background", "Interactive Grid Background"),
        code: "",
        vibePrompt: ""

    },
    {
        id: "particles-background",
        title: "Particles Background",
        category: "background",
        preview: renderComponent("particles-background", "Particles Background", { speed: 3, interactive: true }),
        code: ``,
        vibePrompt: ""

    },
    {
        id: "robot-3d-background",
        title: "Robot 3D Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("robot-3d-background", "Robot 3D Background", { showDownloadLink: true }),
        code: "",
        vibePrompt: ""
    },
    {
        id: "wave-background",
        title: "Wave Background",
        category: "background",
        preview: renderComponent("wave-background", "Wave Background"),
        code: ``,
        vibePrompt: ""

    },
    {
        id: "lines-background",
        title: "Lines Background",
        category: "background",
        preview: renderComponent("lines-background", "Lines Background", { title: "LINES", pathColor: "#9c40ff" }),
        code: `import { BackgroundPaths } from '@/components/ui/background-paths';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <BackgroundPaths title="UI HUB" pathColor="rgba(255,255,255,0.2)" opacity={0.5} />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "sparkles-background",
        title: "Sparkles Background",
        category: "background",
        preview: renderComponent("sparkles-background", "Sparkles Background"),
        code: `import { SparklesBackground } from '@/components/ui/sparkles-background';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <SparklesBackground title="Sparkles background" />\n  </div>\n);`,
        vibePrompt: ""

    },
    {
        id: "isometric-grid-background",
        title: "Isometric Grid Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("isometric-grid-background", "Isometric Grid Background", { title: "ISOMETRIC" }),
        code: "",
        vibePrompt: ""

    },
    {
        id: "corner-border-button",
        title: "Corner Border",
        category: "button",
        preview: renderComponent("corner-border-button", "Corner Border Button"),
        code: ``,
        vibePrompt: ""
    },
    {
        id: "shatter-button",
        title: "Shatter Button",
        category: "button",
        preview: renderComponent("shatter-button", "Shatter Button"),
        code: `import { ShatterButton } from '@/components/ui/shatter-button';\n\nexport const Demo = () => (\n  <ShatterButton shatterColor="#00ffff" shardCount={30}>\n    Click Now\n  </ShatterButton>\n);`,
        vibePrompt: ""
    },
    {
        id: "border-beam",
        title: "Border Beam",
        category: "button",
        preview: renderComponent("border-beam", "Border Beam"),
        code: `import { BorderBeam } from '@/components/ui/border-beam';\n\nexport const Demo = () => (\n  <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">\n    Border Beam\n    <BorderBeam size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />\n  </button>\n);`,
        vibePrompt: ""
    },
    {
        id: "glow-button",
        title: "Glow Button",
        category: "button",
        preview: renderComponent("glow-button", "Glow Button"),
        code: `import React, { useState, useRef } from 'react';

/**
 * GlowButton - A premium interactive button with multi-layered neon emerald glows
 * and a dynamic light surface that tracks the mouse cursor.
 */
export const GlowButton = () => {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div className="flex items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full h-80 relative overflow-hidden group/container">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
      
      <button
        ref={buttonRef}
        onMouseMove={handleMouseMove}
        className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group"
        style={{
          boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
        }}
      >
        {/* Interactive Surface Light */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)\`,
          }}
        />

        {/* Primary Neon Glow (Edge) */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

        {/* Volumetric Outer Glow */}
        <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
          style={{
            background: \`radial-gradient(circle at \${mousePos.x}% \${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)\`,
          }}
        />

        <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
          Glow Button
        </span>

        {/* Subtle Inner Highlight */}
        <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </button>

      {/* Floating Particle Orbs for additional atmosphere */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500/10 blur-[80px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-teal-500/10 blur-[100px] rounded-full animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
    </div>
  );
};`,
        vibePrompt: ""
    },
    {
        id: "marquee-hover-button",
        title: "Marquee Hover",
        category: "button",
        preview: renderComponent("marquee-hover-button", "Marquee Hover Button"),
        code: `import { MarqueeHoverButton } from '@/components/ui/marquee-hover-button';\n\nexport const Demo = () => (\n  <MarqueeHoverButton label="Hover Me" />\n);`,
        vibePrompt: ""
    },
    {
        id: "payment-transaction-button",
        title: "Payment Transaction",
        category: "button",
        preview: renderComponent("payment-transaction-button", "Payment Transaction Button"),
        code: `import { PaymentTransactionButton } from '@/components/ui/payment-transaction-button';\n\nexport const Demo = () => (\n  <PaymentTransactionButton \n    label="Send Payment" \n    accentColor="#38bdf8" \n    currencySymbol="€"\n  />\n);`,
        vibePrompt: ""
    },
    {
        id: "magic-card-effect",
        title: "Magic Card Effect",
        category: "button",
        preview: renderComponent("magic-card-effect", "Magic Card Effect"),
        code: `import { MagicCard } from '@/components/ui/magic-card';\n\nexport const Demo = () => (\n  <MagicCard className="flex flex-col items-center justify-center cursor-pointer shadow-2xl" gradientColor="#262626">\n    <div className="p-12 flex flex-col items-center gap-4 text-center">\n      <p className="text-4xl font-display font-bold text-white tracking-tight">Magic Card</p>\n      <p className="text-white/50 text-sm font-medium">Hover to reveal the magic</p>\n    </div>\n  </MagicCard>\n);`,
        vibePrompt: ""
    },
    {
        id: "rainbow-button",
        title: "Rainbow Button",
        category: "button",
        preview: renderComponent("rainbow-button", "Rainbow Button"),
        code: `import { RainbowButton } from "@/components/ui/rainbow-button";\n\nexport const Demo = () => (\n  <RainbowButton>Rainbow Button</RainbowButton>\n);`,
        vibePrompt: ""
    },
    {
        id: "social-tooltip-buttons",
        title: "Social Tooltip Hover Buttons",
        category: "button",
        preview: renderComponent("social-tooltip-buttons", "Social Tooltip Hover Buttons"),
        code: `import { SocialTooltipButtons } from "@/components/animations/SocialTooltipButtons";\n\nexport const Demo = () => (\n  <SocialTooltipButtons />\n);`,
        vibePrompt: ""
    },
    {
        id: "orbit-button",
        title: "Orbit Button",
        category: "button",
        preview: renderComponent("orbit-button", "Orbit Button"),
        code: `import { OrbitButton } from "@/components/ui/OrbitButton";\n\nexport const Demo = () => (\n  <OrbitButton label="Orbit Button" color="cyan" />\n);`,
        vibePrompt: ""
    },
    {
        id: "galaxy-button",
        title: "Galaxy Button",
        category: "button",
        preview: renderComponent("galaxy-button", "Galaxy Button"),
        code: `import { GalaxyButton } from "@/components/ui/GalaxyButton";\n\nexport const Demo = () => (\n  <GalaxyButton label="Galaxy Button" />\n);`,
        vibePrompt: ""
    },
    {
        id: "liquid-fill-button",
        title: "Liquid Fill Button",
        category: "button",
        preview: renderComponent("liquid-fill-button", "Liquid Fill Button"),
        code: `import { LiquidFillButton } from "@/components/ui/LiquidFillButton";\n\nexport const Demo = () => (\n  <LiquidFillButton label="Liquid Fill" liquidColor="#06b6d4" />\n);`,
        vibePrompt: ""
    },
    {
        id: "neon-flicker-button",
        title: "Neon Flicker Button",
        category: "button",
        preview: renderComponent("neon-flicker-button", "Neon Flicker Button"),
        code: `import { NeonFlickerButton } from "@/components/ui/NeonFlickerButton";\n\nexport const Demo = () => (\n  <NeonFlickerButton label="Neon Flicker" color="red" />\n);`,
        vibePrompt: ""
    },
    {
        id: "aurora-cursor",
        title: "Aurora Cursor",
        category: "cursor",
        preview: () => <AuroraCursorPreview />,
        code: `import { AuroraCursor } from '@/components/ui/AuroraCursor';

// Drop <AuroraCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// It attaches to the window and follows the mouse at the page level.
export const Demo = () => (
  <div className="relative w-full h-[400px] bg-[#050510] rounded-2xl overflow-hidden flex items-center justify-center">
    {/* Aurora follows the real mouse — works globally */}
    <AuroraCursor size={320} />
    <p className="text-white/40 text-sm tracking-widest uppercase font-bold">
      Move your cursor around
    </p>
  </div>
);`,
        vibePrompt: ""
    },
    {
        id: "space-background",
        title: "Space Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("space-background", "SpaceBackground", { interactive: true }),
        code: "",
        vibePrompt: ""

    },
    {
        id: "neural-network-background",
        title: "Neural Network Background",
        category: "background",
        preview: renderComponent("neural-network-background", "NeuralNetworkBackground"),
        code: ``,
        vibePrompt: ""

    },
    {
        id: "black-hole-background",
        title: "Black Hole Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("black-hole-background", "BlackHoleBackground"),
        code: "",
        vibePrompt: ""

    },
    {
        id: "warp-speed-background",
        title: "Warp Speed Background",
        category: "background",
        preview: renderComponent("warp-speed-background", "WarpSpeedBackground"),
        code: ``,
        vibePrompt: ""

    },
    {
        id: "mouse-gravity-background",
        title: "Mouse Gravity Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("mouse-gravity-background", "MouseGravityBackground"),
        code: "",
        vibePrompt: ""

    },
    {
        id: "heart-cursor",
        title: "Heart Cursor 💜",
        category: "cursor",
        preview: () => <HeartCursorPreview />,
        code: ``,
        vibePrompt: ""
    },
    {
        id: "interactive-webgl-scene",
        title: "Interactive WebGL Scene",
        category: "3d",
        isPremium: true,
        preview: renderComponent("interactive-webgl-scene", "InteractiveWebGLScene", { showDownloadLink: true, overlayOpacity: 0.2 }),
        code: "",
        vibePrompt: ""
    },
    {
        id: "3d-scroll-animation",
        title: "3D Scroll Animation",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-scroll-animation", "Scroll3DAnimation", { showDemoButton: true }),
        code: "",
        vibePrompt: ""
    },
    {
        id: "3d-slider",
        title: "3D Slider",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-slider", "ThreeDSlider"),
        code: ``,
        vibePrompt: ""
    },
    {
        id: "3d-rubiks-cube",
        title: "3D Rubiks Cube",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-rubiks-cube", "RubiksCube"),
        code: `import { RubiksCube } from '@/components/ui/RubiksCube';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] flex items-center justify-center bg-[#08080f]">\n    <RubiksCube />\n  </div>\n);`,
        vibePrompt: "Interactive 3D Rubiks Cube with scramble and solve logic.",
        downloadUrl: "/assets/3d-rubiks-cube/Rubiks-Cube-UI-HUB-bundle.zip"
    },
    {
        id: "3d-galaxy-animation",
        title: "Interactive 3D Galaxy",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-galaxy-animation", "GalaxyAnimation"),
        code: `import { GalaxyAnimation } from '@/components/ui/GalaxyAnimation';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <GalaxyAnimation />\n  </div>\n);`,
        vibePrompt: "A stunning interactive 3D galaxy with multiple themes, orbital physics, and post-processing bloom effects."
    },
    {
        id: "3d-landing-page",
        title: "3D Landing Page",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-landing-page", "ThreeDLandingPage"),
        code: `import { ThreeDLandingPage } from '@/components/ui/ThreeDLandingPage';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <ThreeDLandingPage />\n  </div>\n);`,
        vibePrompt: "Create a 'ThreeDLandingPage' React component utilizing Tailwind CSS, 'lucide-react', '@splinetool/react-spline', and 'motion/react'. Build a responsive container (h-[600px] rounded-3xl) that tracks mouse movement to apply a smooth 3D tilt effect (rotateX, rotateY) to the content. The desktop view renders <Spline scene='https://prod.spline.design/WNmhHpS4PLU16Rji/scene.splinecode' /> inside a motion.div with spring-loaded rotations for a premium feel. Use a fallback <img src='/assets/3d-landing-animation.gif' /> on mobile. Overlay a glassmorphic Navbar (branding 'UI HUB') and a mobile hamburger menu. At the bottom, implement a hero overlay with glassmorphic cards. The main title is 'We Build Next-Gen UI Experiences'. The second description is 'Designing Next-Gen UI Systems That Make Brands Unforgettable' and the buttons are 'Explore Work' and 'Get Started'. Use 'Gruppo' and 'Sen' fonts imported via CSS. Ensure an exact, high-fidelity reproduction with fully functional, mouse-reactive React code."
    },

    {
        id: "lizard-cursor",
        title: "Lizard Cursor",
        category: "cursor",
        isPremium: true,
        preview: () => <LizardCursorPreview />,
        code: "",
        vibePrompt: "Create a precision 'LizardCursor' React component..."
    },
    {
        id: "venom-cursor",
        title: "Venom Cursor",
        category: "cursor",
        preview: () => <VenomCursorPreview />,
        code: "",
        vibePrompt: ""
    },
    {
        id: "3d-tubes-cursor",
        title: "3D Tubes Cursor",
        category: "cursor",
        isPremium: true,
        preview: () => <ThreeDTubesCursorPreview />,
        code: "",
        vibePrompt: ""
    },
    {
        id: "black-box",
        title: "Black Box",
        category: "portfolios",
        isPremium: true,
        preview: renderComponent("black-box", "BlackBox"),
        code: `import BlackBox from '@/components/ui/BlackBox';\n\nexport default function Demo() {\n  return <BlackBox />;\n}`,
        vibePrompt: "Create a high-performance cyberpunk glitch-style dashboard portfolio ('BlackBox') using React, Tailwind CSS, 'motion/react', 'recharts', and 'lucide-react'. Implement a 'Share Tech Mono' and 'Rubik Glitch' font aesthetic. The header should feature 'UI HUB' branding and the subtitle 'Next-Gen UI Experiences'. Include a terminal simulation logs array with 'ESTABLISHING NEXT-GEN UI SYSTEMS...'. The hero section must feature the title 'WE BUILD NEXT-GEN UI EXPERIENCES' and the description 'Designing Next-Gen UI Systems That Make Brands Unforgettable'. Buttons should be labeled 'GET STARTED' and 'EXPLORE WORK'. Include animated line charts, system stats cards with icons, and a custom 'TargetCursor' that snaps to elements with the 'cursor-target' class."
    },
    {
        id: "neo-brutalism-os",
        title: "Neo Brutalism",
        category: "portfolios",
        isPremium: true,
        preview: renderComponent("neo-brutalism-os", "NeoBrutalism"),
        code: `import NeoBrutalism from '@/components/ui/NeoBrutalism';\n\nexport default function Demo() {\n  return <NeoBrutalism />;\n}`,
        vibePrompt: "A bold, Neo-Brutalism inspired Dashboard OS with high-contrast UI, interactive charts, and a custom sidebar navigation. Built with Framer Motion and Recharts for a premium interactive experience."
    },
];

