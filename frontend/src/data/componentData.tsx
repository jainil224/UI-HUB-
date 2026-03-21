import React, { useRef, useCallback, useState, useEffect } from 'react';
import * as Animations from '../components/animations/TextAnimations';
import * as VisualEffects from '../components/animations/VisualEffects';
import { AuroraCursor } from '../components/ui/AuroraCursor';
import { MagneticCursor } from '../components/ui/MagneticCursor';
import { MagneticBackground } from '../components/ui/MagneticBackground';
import BlackHoleCursor from '../components/ui/BlackHoleCursor';
import { TargetCursor } from '../components/ui/TargetCursor';
import { SpaceBackground } from '../components/ui/SpaceBackground';
import { NeuralNetworkBackground } from '../components/ui/NeuralNetworkBackground';
import { BlackHoleBackground } from '../components/ui/BlackHoleBackground';
import { WarpSpeedBackground } from '../components/ui/WarpSpeedBackground';
import { MouseGravityBackground } from '../components/ui/MouseGravityBackground';
import { HeartCursor } from '../components/ui/HeartCursor';
import { LizardCursor } from '../components/ui/LizardCursor';
import { VenomCursor } from '../components/ui/VenomCursor';
import { ThreeDTubesCursor } from '../components/ui/ThreeDTubesCursor';
import { InteractiveWebGLScene } from '../components/ui/InteractiveWebGLScene';
import Scroll3DAnimation from '../components/ui/Scroll3DAnimation';
import { ThreeDSlider } from '../components/ui/ThreeDSlider';
import { OdysseySpline } from '../components/ui/OdysseySpline';
import { HeroGlobelSpline } from '../components/ui/HeroGlobelSpline';
import { OrbitalExperienceSpline } from '../components/ui/OrbitalExperienceSpline';
import { ThreeDBlockMovement } from '../components/ui/ThreeDBlockMovement';
import { LOVABLE_PROMPTS } from './lovablePrompts';
import { ANTIGRAVITY_PROMPTS } from './antigravityPrompts';



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

// ── Target Cursor scoped preview ────────────
const TargetCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <div
            ref={containerRef}
            className="target-cursor-area"
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                background: '#0a0a0c',
                overflow: 'hidden',
                isolation: 'isolate',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 24,
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            <TargetCursor containerRef={containerRef} targetSelector=".cursor-target" />

            <div style={{ textAlign: 'center', zIndex: 1, pointerEvents: 'none' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '8px' }}>
                    Targeting System
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Hover to lock
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', zIndex: 10 }}>
                {['HUB', 'COMPONENTS', 'READY'].map((text, i) => (
                    <button
                        key={i}
                        className="cursor-target"
                        style={{
                            padding: '12px 18px',
                            background: 'transparent',
                            border: '1px solid rgba(255,255,255,0.1)',
                            color: '#fff',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            letterSpacing: '0.1em',
                            transition: 'all 0.3s ease',
                            borderRadius: '4px',
                            cursor: 'none'
                        }}
                    >
                        {text}
                    </button>
                ))}
            </div>

            <style>{`.cursor-target:hover { border-color: #6366f1; background: rgba(99, 102, 241, 0.05); }`}</style>
        </div>
    );
};

// ── Space Background scoped preview ────────────
const SpaceBackgroundPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <SpaceBackground interactive={true} />
        </div>
    );
};

const NeuralNetworkPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <NeuralNetworkBackground interactive={false} />
        </div>
    );
};

const BlackHolePreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <BlackHoleBackground />
        </div>
    );
};

// ── Warp Speed Background scoped preview ────────────
const WarpSpeedPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <WarpSpeedBackground />
        </div>
    );
};

// ── Mouse Gravity Background scoped preview ────────────
const MouseGravityPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <MouseGravityBackground />
        </div>
    );
};
const InteractiveWebGLScenePreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%', height: '100%', minHeight: '100%',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#fff',
            fontFamily: 'Inter, sans-serif'
        }}>
            <InteractiveWebGLScene showDownloadLink={true} overlayOpacity={0.2} />
        </div>
    );
};

const Scroll3DAnimationPreview: React.FC = () => {
    return (
        <div
            className="overflow-y-auto custom-scrollbar"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                color: '#fff',
                fontFamily: 'Inter, sans-serif'
            }}
        >
            <Scroll3DAnimation showDemoButton={true} />
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
                width: '100%', height: '100%', minHeight: '100%',
                background: '#050508',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 20
            }}
        >
            {/* Immersive Background */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `
                    radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 70%),
                    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
                `,
                backgroundSize: '100% 100%, 40px 40px, 40px 40px',
                pointerEvents: 'none',
            }} />

            {/* Subtle Noise/Grain Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                opacity: 0.1,
                pointerEvents: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
                            color: 'rgba(255, 255, 255, 0.4)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#fff';
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            e.currentTarget.style.boxShadow = '0 0 15px rgba(255, 255, 255, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)';
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.borderColor = 'transparent';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {item}
                    </button>
                ))}
            </div>


            {isInside && <LizardCursor color="#ffffff" containerRef={containerRef} />}
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

// ── Odyssey Spline scoped preview ────────────
const OdysseySplinePreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#050508',
            overflow: 'hidden',
        }}>
            <OdysseySpline />
        </div>
    );
};

const HeroGlobelSplinePreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#050508',
            overflow: 'hidden',
        }}>
            <HeroGlobelSpline />
        </div>
    );
};

const OrbitalExperienceSplinePreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#050508',
            overflow: 'hidden',
        }}>
            <OrbitalExperienceSpline />
        </div>
    );
};







export type ComponentItem = {
    id: string;
    title: string;
    category: "text" | "effect" | "background" | "button" | "cursor" | "3d" | "custom";
    preview: () => React.ReactNode;
    code: string;
    vibePrompt: string;
    uploader?: string;
    imageUrl?: string;
};

// Lazy component resolver - returns a factory function to avoid eager initialization
const renderComponent = (id: string, _name: string): (() => React.ReactNode) => {
    return () => {
        const rawName = id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
        const CompName = id.endsWith('-text') ? rawName : `${rawName}Text`;

        const Comp = (Animations as any)[CompName] ||
            (VisualEffects as any)[rawName] ||
            (Animations as any)[rawName] ||
            (VisualEffects as any)[CompName];

        return Comp ? React.createElement(Comp) : (
            <div className="text-6xl md:text-9xl font-display font-bold uppercase tracking-normal opacity-20">
                PREVIEW
            </div>
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
        code: `import React, { useEffect, useRef, useState, useCallback } from 'react';

interface TargetCursorProps {
    /** CSS selector for elements the cursor should snap to */
    targetSelector?: string;
    /** Duration of the spinning animation in idle state */
    spinDuration?: number;
    /** Transition duration for snapping/hover effects */
    hoverDuration?: number;
    /** Whether to hide the default browser cursor */
    hideDefaultCursor?: boolean;
    /** Enable subtle parallax movement when hovering elements */
    parallaxOn?: boolean;
    /** Container to track mouse within (optional) */
    containerRef?: React.RefObject<HTMLElement>;
    className?: string;
}

export const TargetCursor: React.FC<TargetCursorProps> = ({
    targetSelector = '.cursor-target',
    spinDuration = 2000,
    hoverDuration = 0.2, // seconds
    hideDefaultCursor = true,
    parallaxOn = true,
    containerRef,
    className = '',
}) => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [isLocked, setIsLocked] = useState(false);
    
    // Internal state for tracking without triggering re-renders
    const mouse = useRef({ x: -100, y: -100, absX: -100, absY: -100 });
    const cursor = useRef({ x: -100, y: -100, scale: 1, rotate: 0, opacity: 1 });
    const isVisible = useRef(false);
    const targetElement = useRef<HTMLElement | null>(null);
    const targetRect = useRef<DOMRect | null>(null);
    const rafId = useRef<number>(0);

    const updateMouse = useCallback((e: MouseEvent) => {
        let inside = true;
        
        if (containerRef?.current) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            inside = (
                e.clientX >= rect.left && 
                e.clientX <= rect.right && 
                e.clientY >= rect.top && 
                e.clientY <= rect.bottom
            );
            
            mouse.current = { x, y, absX: e.clientX, absY: e.clientY };
        } else {
            mouse.current = {
                x: e.clientX,
                y: e.clientY,
                absX: e.clientX,
                absY: e.clientY,
            };
        }

        isVisible.current = inside;

        // Check for target elements
        const elementUnderMouse = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement;
        const target = elementUnderMouse?.closest(targetSelector) as HTMLElement;
        
        if (target && inside) {
            targetElement.current = target;
            targetRect.current = target.getBoundingClientRect();
            if (!isLocked) setIsLocked(true);
        } else {
            targetElement.current = null;
            targetRect.current = null;
            if (isLocked) setIsLocked(false);
        }
    }, [containerRef, targetSelector, isLocked]);

    const animate = useCallback(() => {
        if (!cursorRef.current) return;

        let targetX = mouse.current.x;
        let targetY = mouse.current.y;
        let targetRotate = (Date.now() / spinDuration) * 360;
        let width = 24;
        let height = 24;

        if (targetElement.current && targetRect.current) {
            const rect = targetRect.current;
            const containerRect = containerRef?.current?.getBoundingClientRect();
            
            let centerX, centerY;
            let scaleFactor = 1;

            if (containerRect) {
                // If scaled via CSS transform, the bounding rect is physically smaller
                // than the offset dimensions. We calculate the scale ratio to adjust.
                if (containerRef.current) {
                    scaleFactor = containerRect.width / containerRef.current.offsetWidth;
                }

                // Calculate center relative to the scaled container
                centerX = (rect.left - containerRect.left) / scaleFactor + (rect.width / scaleFactor) / 2;
                centerY = (rect.top - containerRect.top) / scaleFactor + (rect.height / scaleFactor) / 2;
            } else {
                centerX = rect.left + rect.width / 2;
                centerY = rect.top + rect.height / 2;
            }

            if (parallaxOn) {
                // Mouse coordinates are already relative to container when containerRef exists
                const mouseDx = (mouse.current.x / scaleFactor) - centerX;
                const mouseDy = (mouse.current.y / scaleFactor) - centerY;
                targetX = centerX + mouseDx * 0.15;
                targetY = centerY + mouseDy * 0.15;
            } else {
                targetX = centerX;
                targetY = centerY;
            }
            
            // Reduced padding and divided by scale to draw the brackets at the true unscaled DOM sizing
            width = (rect.width / scaleFactor) + 8;
            height = (rect.height / scaleFactor) + 8;
            targetRotate = 0;
        }

        // Smoothly interpolate cursor position
        cursor.current.x += (targetX - cursor.current.x) * 0.2;
        cursor.current.y += (targetY - cursor.current.y) * 0.2;

        const el = cursorRef.current;
        el.style.transform = \`translate(\${cursor.current.x}px, \${cursor.current.y}px)\`;
        el.style.opacity = isVisible.current ? '1' : '0';
        el.style.visibility = isVisible.current ? 'visible' : 'hidden';
        
        const inner = el.querySelector('.cursor-inner') as HTMLElement;
        if (inner) {
            inner.style.width = \`\${width}px\`;
            inner.style.height = \`\${height}px\`;
            inner.style.transform = \`translate(-50%, -50%) rotate(\${targetRotate}deg)\`;
        }

        rafId.current = requestAnimationFrame(animate);
    }, [spinDuration, parallaxOn, containerRef]);

    useEffect(() => {
        window.addEventListener('mousemove', updateMouse, { passive: true });
        rafId.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', updateMouse);
            cancelAnimationFrame(rafId.current);
        };
    }, [updateMouse, animate]);

    const cornerStyle: React.CSSProperties = {
        position: 'absolute',
        width: '8px',
        height: '8px',
        borderColor: '#6366f1',
        borderStyle: 'solid',
        transition: \`all \${hoverDuration}s cubic-bezier(0.23, 1, 0.32, 1)\`,
        pointerEvents: 'none',
    };

    const containerSelector = containerRef ? '.target-cursor-area' : 'body';

    return (
        <div 
            ref={cursorRef}
            className={\`target-cursor \${className}\`}
            style={{
                position: containerRef ? 'absolute' : 'fixed',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference',
                transition: 'opacity 0.2s ease, visibility 0.2s ease',
                visibility: 'hidden',
            }}
        >
            <style>{\`
                \${hideDefaultCursor ? \`
                \${containerSelector} { cursor: none !important; }
                \${containerSelector} button, 
                \${containerSelector} a, 
                \${containerSelector} .cursor-target { cursor: none !important; }
                \` : ''}
                
                .cursor-inner {
                    position: relative;
                    transition: width 0.3s cubic-bezier(0.23, 1, 0.32, 1), 
                                height 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                    will-change: width, height, transform;
                }
            \`}</style>
            
            <div className="cursor-inner" style={{ width: 24, height: 24, transform: 'translate(-50%, -50%)' }}>
                {/* Top Left */}
                <div style={{ ...cornerStyle, top: 0, left: 0, borderWidth: '2px 0 0 2px' }} />
                {/* Top Right */}
                <div style={{ ...cornerStyle, top: 0, right: 0, borderWidth: '2px 2px 0 0' }} />
                {/* Bottom Left */}
                <div style={{ ...cornerStyle, bottom: 0, left: 0, borderWidth: '0 0 2px 2px' }} />
                {/* Bottom Right */}
                <div style={{ ...cornerStyle, bottom: 0, right: 0, borderWidth: '0 2px 2px 0' }} />
                
                {/* Center Dot (Visible when not locked) */}
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: '4px',
                    height: '4px',
                    background: '#6366f1',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    opacity: isLocked ? 0 : 1,
                    transition: 'opacity 0.2s ease',
                }} />
            </div>
        </div>
    );
};

export default TargetCursor;`,
        vibePrompt: LOVABLE_PROMPTS["target-cursor"]
    },
    {
        id: "black-hole-cursor",
        title: "Black Hole Cursor",
        category: "cursor",
        preview: () => <BlackHoleCursorPreview />,
        code: `import React, { useEffect, useRef } from 'react';

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

        // Premium deep space cosmic colors
        const colors = [
            'rgba(139, 92, 246, 0.9)', // Violet
            'rgba(67, 56, 202, 0.9)',  // Indigo
            'rgba(6, 182, 212, 0.9)',  // Cyan
            'rgba(192, 132, 252, 0.9)', // Light Purple
            'rgba(255, 255, 255, 0.8)'  // White star
        ];

        const initParticles = () => {
            particles = [];
            const numParticles = Math.floor((width * height) / 11000);
            for (let i = 0; i < numParticles; i++) {
                particles.push(createParticle(true));
            }
        };

        const createParticle = (randomizePosition = false) => {
            let x, y;
            if (randomizePosition) {
                x = Math.random() * width;
                y = Math.random() * height;
            } else {
                // Spawn continuously at the edges
                const edge = Math.floor(Math.random() * 4);
                if (edge === 0) { x = Math.random() * width; y = -20; }
                else if (edge === 1) { x = width + 20; y = Math.random() * height; }
                else if (edge === 2) { x = Math.random() * width; y = height + 20; }
                else { x = -20; y = Math.random() * height; }
            }
            return {
                x,
                y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.5,
                color: colors[Math.floor(Math.random() * colors.length)]
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

        // Delay initial resize slightly to ensure container is fully rendered
        setTimeout(resize, 0);
        window.addEventListener('resize', resize);

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            // Smooth interpolation for the cursor core itself
            smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.12;
            smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.12;

            if (coreRef.current) {
                if (mouse.current.isActive) {
                    coreRef.current.style.transform = \`translate(\${smoothMouse.current.x}px, \${smoothMouse.current.y}px) scale(\${mouse.current.isHover ? 1.3 : 1})\`;
                    coreRef.current.style.opacity = '1';
                    if (mouse.current.isHover) {
                        coreRef.current.style.filter = 'brightness(1.5)';
                    } else {
                        coreRef.current.style.filter = 'brightness(1)';
                    }
                } else {
                    coreRef.current.style.opacity = '0';
                }
            }

            const currentGravityRadius = mouse.current.isHover ? gravityRadius * 1.5 : gravityRadius;

            // Update & draw particles
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];

                if (mouse.current.isActive) {
                    const dx = smoothMouse.current.x - p.x;
                    const dy = smoothMouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < currentGravityRadius) {
                        const force = (currentGravityRadius - dist) / currentGravityRadius;
                        const angle = Math.atan2(dy, dx);

                        // Vector mathematics for spiraling inward:
                        // Pull directly towards center
                        const pull = force * (mouse.current.isHover ? 1.5 : 1.0);
                        // Tangential velocity creates the spiral
                        const spiral = force * 2.5;

                        p.vx += Math.cos(angle) * pull - Math.sin(angle) * spiral;
                        p.vy += Math.sin(angle) * pull + Math.cos(angle) * spiral;

                        // Add friction inside the gravity well so they actually fall in
                        p.vx *= 0.94;
                        p.vy *= 0.94;

                        // Visual warp effect when caught in gravity well
                        ctx.shadowBlur = force * 15;
                        ctx.shadowColor = p.color;

                        // If sucked into event horizon, recycle particle
                        if (dist < 15) {
                            particles[i] = createParticle(false);
                            continue;
                        }
                    } else {
                        // mild friction / drift out in deep space
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

                // Fade particles naturally as they approach the absolute center (Event Horizon)
                let alpha = 1;
                if (mouse.current.isActive) {
                    const dx = smoothMouse.current.x - p.x;
                    const dy = smoothMouse.current.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 40) {
                        alpha = Math.max(0, (dist - 15) / 25);
                    }
                }

                ctx.globalAlpha = alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();

                // Recycle if out of bounds
                if (p.x < -100 || p.x > width + 100 || p.y < -100 || p.y > height + 100) {
                    particles[i] = createParticle(false);
                }
            }

            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(render);
        };

        render();

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

        // Detect hover over interactive elements (buttons, links)
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
        <div className={className} style={{ position: pos, top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999, overflow: 'hidden' }}>
            <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%', pointerEvents: 'none' }} />

            {/* Black Hole Core DOM Element */}
            <div
                ref={coreRef}
                style={{
                    position: 'absolute',
                    top: 0, left: 0,
                    width: 0, height: 0,
                    opacity: 0,
                    transition: 'opacity 0.5s ease, transform 0.1s linear, filter 0.3s ease',
                    pointerEvents: 'none',
                }}
            >
                {/* Center Pitch Black */}
                <div style={{
                    position: 'absolute',
                    top: -16, left: -16,
                    width: 32, height: 32,
                    backgroundColor: '#000',
                    borderRadius: '50%',
                    boxShadow: '0 0 20px 10px rgba(0,0,0,0.9), 0 0 40px 15px rgba(67, 56, 202, 0.4)',
                    zIndex: 2,
                }} />

                {/* Primary Accretion Disk (Spinning) */}
                <div className="bh-spin-fast" style={{
                    position: 'absolute',
                    top: -45, left: -45,
                    width: 90, height: 90,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, transparent 0%, rgba(139,92,246,0.3) 20%, rgba(6,182,212,0.9) 50%, rgba(139,92,246,0.3) 80%, transparent 100%)',
                    filter: 'blur(6px)',
                    zIndex: 1,
                }} />

                {/* Secondary Accretion Disk (Reverse Spin for distortion effect) */}
                <div className="bh-spin-slow-reverse" style={{
                    position: 'absolute',
                    top: -60, left: -60,
                    width: 120, height: 120,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 180deg, transparent 0%, rgba(76,29,149,0.2) 20%, rgba(26,10,60,0.4) 50%, transparent 80%)',
                    filter: 'blur(10px)',
                    zIndex: 0,
                }} />
            </div>

            <style>{\`
                @keyframes bh-spin-fast {
                    100% { transform: rotate(360deg) scaleY(0.7); }
                }
                @keyframes bh-spin-slow-reverse {
                    100% { transform: rotate(-360deg) scaleY(0.8); }
                }
                .bh-spin-fast {
                    animation: bh-spin-fast 2s linear infinite;
                transform: scaleY(0.7); 
                }
                .bh-spin-slow-reverse {
                    animation: bh-spin-slow-reverse 4s linear infinite;
                transform: scaleY(0.8);
                }
            \`}</style>
        </div>
    );
};

export default BlackHoleCursor;
`,
        vibePrompt: LOVABLE_PROMPTS["black-hole-cursor"]
    },
    {
        id: "magnetic-cursor",
        title: "Magnetic Cursor",
        category: "cursor",
        preview: () => <MagneticCursorPreview />,
        code: `import React, { useEffect, useRef, useCallback } from 'react';

interface MagneticCursorProps {
    magnetRadius?: number;
    cursorSize?: number;
    className?: string;
    /** If provided, tracks mouse relative to this container and uses absolute positioning */
    containerRef?: React.RefObject<HTMLElement>;
}

export const MagneticCursor: React.FC<MagneticCursorProps> = ({
    magnetRadius = 120,
    cursorSize = 20,
    className = '',
    containerRef,
}) => {
    const dotRef  = useRef<HTMLDivElement>(null);
    const haloRef = useRef<HTMLDivElement>(null);

    // Spring state (no React state to avoid re-renders)
    const mouse   = useRef({ x: -999, y: -999 });
    const dot     = useRef({ x: -999, y: -999 });
    const dotVel  = useRef({ x: 0, y: 0 });
    const halo    = useRef({ x: -999, y: -999 });
    const haloVel = useRef({ x: 0, y: 0 });
    const rafId   = useRef<number>(0);
    const isHover = useRef(false);

    // Magnetic elements registry
    const magnets = useRef<HTMLElement[]>([]);

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (containerRef?.current) {
            const rect = containerRef.current.getBoundingClientRect();
            mouse.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
        } else {
            mouse.current = { x: e.clientX, y: e.clientY };
        }
    }, [containerRef]);

    const animate = useCallback(() => {
        const mx = mouse.current.x;
        const my = mouse.current.y;

        // ── Dot (fast spring) ──────────────────────────────────
        dotVel.current.x  += (mx - dot.current.x) * 0.22;
        dotVel.current.y  += (my - dot.current.y) * 0.22;
        dotVel.current.x  *= 0.72;
        dotVel.current.y  *= 0.72;
        dot.current.x     += dotVel.current.x;
        dot.current.y     += dotVel.current.y;

        // ── Halo (slow spring) ─────────────────────────────────
        haloVel.current.x += (mx - halo.current.x) * 0.09;
        haloVel.current.y += (my - halo.current.y) * 0.09;
        haloVel.current.x *= 0.80;
        haloVel.current.y *= 0.80;
        halo.current.x    += haloVel.current.x;
        halo.current.y    += haloVel.current.y;

        const half = cursorSize / 2;
        const haloHalf = isHover.current ? 36 : 28;

        if (dotRef.current) {
            dotRef.current.style.transform = \`translate(\${dot.current.x - half}px, \${dot.current.y - half}px) scale(\${isHover.current ? 1.7 : 1})\`;
        }
        if (haloRef.current) {
            haloRef.current.style.transform = \`translate(\${halo.current.x - haloHalf}px, \${halo.current.y - haloHalf}px) scale(\${isHover.current ? 1.4 : 1})\`;
        }

        // ── Magnetic pull on nearby elements ───────────────────
        magnets.current.forEach(el => {
            const rect   = el.getBoundingClientRect();
            const cx     = rect.left + rect.width  / 2;
            const cy     = rect.top  + rect.height / 2;
            const dx     = mx - cx;
            const dy     = my - cy;
            const dist   = Math.sqrt(dx * dx + dy * dy);

            if (dist < magnetRadius) {
                const strength = (1 - dist / magnetRadius);
                const tx = dx * strength * 0.38;
                const ty = dy * strength * 0.38;
                el.style.transform  = \`translate(\${tx}px, \${ty}px) scale(\${1 + strength * 0.04})\`;
                el.style.boxShadow  = \`0 0 \${20 + strength * 30}px rgba(139,92,246,\${0.2 + strength * 0.4})\`;
            } else {
                el.style.transform = 'translate(0,0) scale(1)';
                el.style.boxShadow = '';
            }
        });

        rafId.current = requestAnimationFrame(animate);
    }, [cursorSize, magnetRadius]);

    const onOver = useCallback((e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.closest('[data-magnetic]')) isHover.current = true;
    }, []);

    const onOut = useCallback((e: MouseEvent) => {
        const related = e.relatedTarget as HTMLElement | null;
        if (!related?.closest('[data-magnetic]')) isHover.current = false;
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseover',  onOver,     { passive: true });
        window.addEventListener('mouseout',   onOut,      { passive: true });
        rafId.current = requestAnimationFrame(animate);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseover',  onOver);
            window.removeEventListener('mouseout',   onOut);
            cancelAnimationFrame(rafId.current);
        };
    }, [onMouseMove, onOver, onOut, animate]);

    // Public imperative handle: register/unregister magnetic elements
    const registerMagnet = useCallback((el: HTMLElement | null) => {
        if (!el) return;
        el.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease';
        el.setAttribute('data-magnetic', '');
        if (!magnets.current.includes(el)) magnets.current.push(el);
        return () => {
            magnets.current = magnets.current.filter(m => m !== el);
            el.style.transform = '';
        };
    }, []);

    (MagneticCursor as any)._register = registerMagnet;

    const pos = containerRef ? 'absolute' : 'fixed';

    return (
        <div className={className} style={{ position: pos, top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}>
            <style>{\`
                .mc-dot  { transition: transform 0.08s linear, opacity 0.3s; }
                .mc-halo { transition: transform 0.25s ease, opacity 0.3s; }
            \`}</style>
            {/* Dot */}
            <div ref={dotRef} className="mc-dot" style={{
                position: pos, top: 0, left: 0,
                width: cursorSize, height: cursorSize,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(200,150,255,1) 0%, rgba(99,102,241,0.8) 60%, transparent 100%)',
                filter: 'blur(1px)',
                willChange: 'transform',
            }} />
            {/* Halo */}
            <div ref={haloRef} className="mc-halo" style={{
                position: pos, top: 0, left: 0,
                width: 56, height: 56,
                borderRadius: '50%',
                border: '1.5px solid rgba(139,92,246,0.5)',
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                filter: 'blur(0.5px)',
                willChange: 'transform',
            }} />
        </div>
    );
};

export default MagneticCursor;
`,
        vibePrompt: LOVABLE_PROMPTS["magnetic-cursor"]
    },
    {
        id: "blur-text",
        title: "Blur In Text",
        category: "text",
        preview: renderComponent("blur-text", "Blur In Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const BlurText = ({ text = "BLUR IN TEXT" }) => (\n  <motion.h1\n    initial={{ opacity: 0, filter: "blur(10px)" }}\n    animate={{ opacity: 1, filter: "blur(0px)" }}\n    transition={{ duration: 0.8 }}\n  >\n    {text}\n  </motion.h1>\n);`,
        vibePrompt: LOVABLE_PROMPTS["blur-text"]
    },
    {
        id: "fade-text",
        title: "Fade Text",
        category: "text",
        preview: renderComponent("fade-text", "Fade Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FadeText = ({ text = "FADE TEXT" }) => (\n  <motion.div\n    initial={{ opacity: 0 }}\n    animate={{ opacity: 1 }}\n    transition={{ duration: 1.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["fade-text"]
    },
    {
        id: "dock-text",
        title: "Dock Text",
        category: "text",
        preview: renderComponent("dock-text", "Dock Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const DockText = ({ text = "DOCK TEXT" }) => (\n  <motion.div\n    whileHover={{ scale: 1.5 }}\n    transition={{ type: "spring", duration: 0.5 }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["dock-text"]
    },
    {
        id: "font-weight",
        title: "Font Weight Text",
        category: "text",
        preview: renderComponent("font-weight", "Font Weight Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const FontWeightText = ({ text = "VARIABLE WEIGHT" }) => (\n  <motion.div\n    animate={{ fontWeight: [400, 900, 400] }}\n    transition={{ duration: 1, repeat: Infinity }}\n  >\n    {text}\n  </motion.div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["font-weight"]
    },
    {
        id: "noise",
        title: "Noise Background",
        category: "effect",
        preview: () => <VisualEffects.Noise opacity={0.1} />,
        code: `import { Noise } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-64 overflow-hidden bg-black">\n    <h1 className="text-white text-4xl p-8">Noise Overlay</h1>\n    <Noise opacity={0.15} />\n  </div>\n);`,
        vibePrompt: "Create a cinematic digital noise grain overlay effect using SVG turbulence and CSS mix-blend-mode."
    },
    {
        id: "gradual-spacing",
        title: "Gradual Spacing",
        category: "text",
        preview: renderComponent("gradual-spacing", "Gradual Spacing"),
        code: `import { motion } from 'framer-motion';\n\nexport const GradualSpacing = ({ text = "GRADUAL SPACING" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ letterSpacing: "-0.5em", opacity: 0 }}\n        animate={{ letterSpacing: "normal", opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["gradual-spacing"]
    },
    {
        id: "letter-pull-up",
        title: "Letter Pull Up",
        category: "text",
        preview: renderComponent("letter-pull-up", "Letter Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const LetterPullUp = ({ text = "LETTER PULL UP" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["letter-pull-up"]
    },
    {
        id: "multi-direction-slide",
        title: "Multi Direction Slide",
        category: "text",
        preview: renderComponent("multi-direction-slide", "Multi Direction Slide"),
        code: `import { motion } from 'framer-motion';\n\nexport const MultiDirectionSlide = ({ text = "MULTI DIRECTION" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: i % 2 === 0 ? -50 : 50, y: i % 2 !== 0 ? -50 : 50, opacity: 0 }}\n        animate={{ x: 0, y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["multi-direction-slide"]
    },
    {
        id: "scale-letter",
        title: "Scale Letter",
        category: "text",
        preview: renderComponent("scale-letter", "Scale Letter"),
        code: `import { motion } from 'framer-motion';\n\nexport const ScaleLetter = ({ text = "SCALE LETTER" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ scale: 0, opacity: 0 }}\n        animate={{ scale: 1, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["scale-letter"]
    },
    {
        id: "separate-away",
        title: "Separate Away",
        category: "text",
        preview: renderComponent("separate-away", "Separate Away"),
        code: `import { motion } from 'framer-motion';\n\nexport const SeparateAway = ({ text = "SEPARATE AWAY" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: 0 }}\n        animate={{ x: i < text.length / 2 ? -15 : 15 }}\n        transition={{ duration: 0.5 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["separate-away"]
    },
    {
        id: "wavy-text",
        title: "Wavy Text",
        category: "text",
        preview: renderComponent("wavy-text", "Wavy Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const WavyText = ({ text = "WAVY TEXT" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        animate={{ y: [0, -8, 0] }}\n        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["wavy-text"]
    },
    {
        id: "word-pull-up",
        title: "Word Pull Up",
        category: "text",
        preview: renderComponent("word-pull-up", "Word Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const WordPullUp = ({ text = "WORD PULL UP" }) => (\n  <div className="flex gap-2 overflow-hidden">\n    {text.split(' ').map((word, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.2 }}\n      >\n        {word}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["word-pull-up"]
    },
    {
        id: "liquid-glass",
        title: "Liquid Glass",
        category: "effect",
        preview: () => <VisualEffects.LiquidGlass location="LONDON" temp="18" />,
        code: `import { LiquidGlass } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[300px] flex items-center justify-center bg-neutral-900">\n    <LiquidGlass location="NEW YORK" temp="22" />\n  </div>\n);`,
        vibePrompt: "Premium weather dashboard interface utilizing multiple layers of glassmorphism, backdrop-blur, and Lucide icons."
    },
    {
        id: "blur-vignette",
        title: "Blur Vignette",
        category: "effect",
        preview: renderComponent("blur-vignette", "Blur Vignette"),
        code: `export const BlurVignette = () => (\n  <div className="w-full h-full absolute inset-0 backdrop-blur-[10px] [mask-image:radial-gradient(ellipse_at_center,transparent_30%,black_100%)] pointer-events-none"></div>\n);`,
        vibePrompt: "Radial mask that applies a heavy blur to the edges, focusing visual attention on the center."
    },
    {
        id: "liquid-gradient",
        title: "Liquid Gradient",
        category: "effect",
        preview: renderComponent("liquid-gradient", "Liquid Gradient"),
        code: `export const LiquidGradient = () => (\n  <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(0,255,0,0.2),_transparent_50%)] animate-pulse"></div>\n);`,
        vibePrompt: "Morphing radial gradients that shift smoothly to create a fluid, organic light effect."
    },
    {
        id: "spotlight-cards",
        title: "Spotlight Cards",
        category: "effect",
        preview: () => <VisualEffects.SpotlightCards title="Feature" description="Hover to reveal the hidden spotlight effect." />,
        code: `import { SpotlightCards } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <SpotlightCards \n    title="Service" \n    description="Innovative solutions for your modern business needs." \n  />\n);`,
        vibePrompt: "Premium 3-card layout with individual color themes, Lucide icons, and a synchronized cursor-glow system with branding."
    },
    {
        id: "image-reveal",
        title: "Image Reveal",
        category: "effect",
        preview: renderComponent("image-reveal", "Image Reveal"),
        code: `import { motion } from 'framer-motion';\n\nexport const ImageReveal = () => (\n  <motion.div\n    whileHover={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}\n    initial={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}\n    className="w-full h-full bg-cover bg-center"\n    style={{ backgroundImage: "url('/placeholder.jpg')" }}\n  />\n);`,
        vibePrompt: "Reveals content behind a mask using a sliding or clip-path transition on hover."
    },
    {
        id: "blocks",
        title: "Blocks",
        category: "effect",
        preview: renderComponent("blocks", "Blocks"),
        code: `import { motion } from 'framer-motion';\n\nexport const Blocks = () => (\n  <div className="grid grid-cols-4 grid-rows-4 gap-1 w-64 h-64">\n    {Array.from({ length: 16 }).map((_, i) => (\n      <motion.div key={i} className="bg-white/10 rounded-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} />\n    ))}\n  </div>\n);`,
        vibePrompt: "Staggered grid of blocks that fade or scale into view, responding to hover states."
    },
    {
        id: "animated-beam",
        title: "Animated Beam",
        category: "effect",
        preview: renderComponent("animated-beam", "Animated Beam"),
        code: `import { motion } from 'framer-motion';\n\nexport const AnimatedBeam = () => (\n  <motion.div\n    animate={{ x: [-100, 300] }}\n    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}\n    className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent w-32"\n  />\n);`,
        vibePrompt: "High-speed linear light beam that sweeps across the container in a rhythmic loop."
    },
    {
        id: "grid-background",
        title: "Grid Background",
        category: "background",
        preview: () => <div className="w-full h-full relative overflow-hidden"><VisualEffects.GridBackground opacity={0.5} maskRadius={40} /></div>,
        code: `import { GridBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden bg-black">\n    <GridBackground opacity={0.6} maskRadius={30} />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["grid-background"]

    },
    {
        id: "hacker-background",
        title: "Hacker Background",
        category: "background",
        preview: renderComponent("hacker-background", "Hacker Background"),
        code: `// Implementation for Hacker Background\nexport const HackerBackground = () => (\n  <div className="w-full h-full bg-black text-green-500 font-mono flex items-center justify-center">\n    01010101 MATRIX 10101010\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["hacker-background"]

    },
    {
        id: "novatrix-background",
        title: "Novatrix Background",
        category: "background",
        preview: () => <div className="w-full h-full relative overflow-hidden"><VisualEffects.NovatrixBackground title="NEBULA" /></div>,
        code: `import { NovatrixBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[400px] overflow-hidden">\n    <NovatrixBackground \n      title="UI HUB" \n      colorFrom="#1a1a2e" \n      colorTo="#16213e" \n      opacity={0.8} \n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["novatrix-background"]

    },
    {
        id: "beam-grid-background",
        title: "Beam Grid Background",
        category: "background",
        preview: renderComponent("beam-grid-background", "Beam Grid Background"),
        code: `// ... Beam Grid Background code is quite large, see the repo ...\nimport BeamGridBackground from '@/components/ui/BeamGridBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px]">\n    <BeamGridBackground\n      className="bg-black"\n      gridColor="rgba(255,255,255,0.05)"\n      darkGridColor="rgba(255,255,255,0.05)"\n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["beam-grid-background"]

    },
    {
        id: "fall-beam-background",
        title: "Fall Beam Background",
        category: "background",
        preview: renderComponent("fall-beam-background", "Fall Beam Background"),
        code: `import FallBeamBackground from '@/components/ui/FallBeamBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <FallBeamBackground\n      className="bg-transparent"\n      lineCount={30}\n      beamColorClass="cyan-400"\n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["fall-beam-background"]

    },
    {
        id: "hell-background",
        title: "Hell Background",
        category: "background",
        preview: () => <div className="w-full h-full relative"><VisualEffects.HellBackground intensity={1.5} speed={0.8} /></div>,
        code: `import { HellBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <HellBackground color="#DE443B" intensity={1.5} speed={1.0} />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["hell-background"]

    },
    {
        id: "interactive-grid-background",
        title: "Interactive Grid Background",
        category: "background",
        preview: renderComponent("interactive-grid-background", "Interactive Grid Background"),
        code: `import InteractiveGridBackground from '@/components/ui/InteractiveGridBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <InteractiveGridBackground\n      className="bg-black"\n      gridColor="rgba(255,255,255,0.05)"\n      darkGridColor="rgba(255,255,255,0.05)"\n      effectColor="rgba(0,255,0,0.5)"\n      darkEffectColor="rgba(0,255,0,0.5)"\n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["interactive-grid-background"]

    },
    {
        id: "particles-background",
        title: "Particles Background",
        category: "background",
        preview: () => <div className="w-full h-full relative"><VisualEffects.ParticlesBackground speed={3} interactive={true} /></div>,
        code: `import { ParticlesBackground } from '@/components/animations/VisualEffects';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <ParticlesBackground \n      colors={['#ff223e', '#5d1eb2', '#ff7300']} \n      size={3} \n      speed={2.5} \n      interactive={true} \n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["particles-background"]

    },
    {
        id: "robot-3d-background",
        title: "Robot 3D Background",
        category: "3d",
        preview: () => <div className="w-full h-full relative overflow-hidden"><VisualEffects.Robot3DBackground showDownloadLink={true} /></div>,
        code: `import { Robot3DBackground } from '@/components/ui/Robot3DBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-black shadow-2xl">\n    <Robot3DBackground \n      overlayOpacity={0.4} \n    />\n    <div className="relative z-20 flex h-full items-center justify-center p-12 text-center">\n      <h1 className="text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">\n        ROBOTIC CORE\n      </h1>\n    </div>\n  </div>\n);\n\n// Video Resource: Robots_sliding_on_neon_platform_16a422a842.mp4
// Download Link: /assets/videos/Robots_sliding_on_neon_platform_16a422a842.mp4`,
        vibePrompt: LOVABLE_PROMPTS["robot-3d-background"]
    },
    {
        id: "wave-background",
        title: "Wave Background",
        category: "background",
        preview: renderComponent("wave-background", "Wave Background"),
        code: `import WaveBackground from '@/components/ui/WaveBackground';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <WaveBackground />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["wave-background"]

    },
    {
        id: "lines-background",
        title: "Lines Background",
        category: "background",
        preview: () => <div className="w-full h-full relative"><VisualEffects.LinesBackground title="LINES" pathColor="#9c40ff" /></div>,
        code: `import { BackgroundPaths } from '@/components/ui/background-paths';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <BackgroundPaths title="UI HUB" pathColor="rgba(255,255,255,0.2)" opacity={0.5} />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["lines-background"]

    },
    {
        id: "sparkles-background",
        title: "Sparkles Background",
        category: "background",
        preview: renderComponent("sparkles-background", "Sparkles Background"),
        code: `import { SparklesBackground } from '@/components/ui/sparkles-background';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <SparklesBackground title="Sparkles background" />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["sparkles-background"]

    },
    {
        id: "isometric-grid-background",
        title: "Isometric Grid Background",
        category: "background",
        preview: () => <div className="w-full h-full relative"><VisualEffects.IsometricGridBackground title="ISOMETRIC" /></div>,
        code: `import { IsometricGridBackground } from '@/components/ui/isometric-grid-background';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <IsometricGridBackground \n      title="Tailwind is Awesome" \n      boxProps={{\n        rowsCount: 50,\n        colsCount: 30,\n        customColors: ["#ffaa40", "#9c40ff"]\n      }}\n    />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["isometric-grid-background"]

    },
    {
        id: "corner-border-button",
        title: "Corner Border",
        category: "button",
        preview: renderComponent("corner-border-button", "Corner Border Button"),
        code: `import { CornerBorderButton } from '@/components/ui/corner-border-button';\n\nexport const Demo = () => (\n  <CornerBorderButton baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">\n    BUTTON\n  </CornerBorderButton>\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["corner-border-button"]
    },
    {
        id: "shatter-button",
        title: "Shatter Button",
        category: "button",
        preview: renderComponent("shatter-button", "Shatter Button"),
        code: `import { ShatterButton } from '@/components/ui/shatter-button';\n\nexport const Demo = () => (\n  <ShatterButton shatterColor="#00ffff" shardCount={30}>\n    Click Now\n  </ShatterButton>\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["shatter-button"]
    },
    {
        id: "border-beam",
        title: "Border Beam",
        category: "button",
        preview: renderComponent("border-beam", "Border Beam"),
        code: `import { BorderBeam } from '@/components/ui/border-beam';\n\nexport const Demo = () => (\n  <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">\n    Border Beam\n    <BorderBeam size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />\n  </button>\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["border-beam"]
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
        vibePrompt: ANTIGRAVITY_PROMPTS["glow-button"]
    },
    {
        id: "marquee-hover-button",
        title: "Marquee Hover",
        category: "button",
        preview: renderComponent("marquee-hover-button", "Marquee Hover Button"),
        code: `import { MarqueeHoverButton } from '@/components/ui/marquee-hover-button';\n\nexport const Demo = () => (\n  <MarqueeHoverButton label="Hover Me" />\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["marquee-hover-button"]
    },
    {
        id: "payment-transaction-button",
        title: "Payment Transaction",
        category: "button",
        preview: renderComponent("payment-transaction-button", "Payment Transaction Button"),
        code: `import { PaymentTransactionButton } from '@/components/ui/payment-transaction-button';\n\nexport const Demo = () => (\n  <PaymentTransactionButton \n    label="Send Payment" \n    accentColor="#38bdf8" \n    currencySymbol="€"\n  />\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["payment-transaction-button"]
    },
    {
        id: "magic-card-effect",
        title: "Magic Card Effect",
        category: "button",
        preview: renderComponent("magic-card-effect", "Magic Card Effect"),
        code: `import { MagicCard } from '@/components/ui/magic-card';\n\nexport const Demo = () => (\n  <MagicCard className="flex flex-col items-center justify-center cursor-pointer shadow-2xl" gradientColor="#262626">\n    <div className="p-12 flex flex-col items-center gap-4 text-center">\n      <p className="text-4xl font-display font-bold text-white tracking-tight">Magic Card</p>\n      <p className="text-white/50 text-sm font-medium">Hover to reveal the magic</p>\n    </div>\n  </MagicCard>\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["magic-card-effect"]
    },
    {
        id: "rainbow-button",
        title: "Rainbow Button",
        category: "button",
        preview: renderComponent("rainbow-button", "Rainbow Button"),
        code: `import { RainbowButton } from "@/components/ui/rainbow-button";\n\nexport const Demo = () => (\n  <RainbowButton>Rainbow Button</RainbowButton>\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["rainbow-button"]
    },
    {
        id: "social-tooltip-buttons",
        title: "Social Tooltip Hover Buttons",
        category: "button",
        preview: renderComponent("social-tooltip-buttons", "Social Tooltip Hover Buttons"),
        code: `import { SocialTooltipButtons } from "@/components/animations/SocialTooltipButtons";\n\nexport const Demo = () => (\n  <SocialTooltipButtons />\n);`,
        vibePrompt: ANTIGRAVITY_PROMPTS["social-tooltip-buttons"]
    },
    {
        id: "orbit-button",
        title: "Orbit Button",
        category: "button",
        preview: renderComponent("orbit-button", "Orbit Button"),
        code: `import { OrbitButton } from "@/components/ui/OrbitButton";\n\nexport const Demo = () => (\n  <OrbitButton label="Orbit Button" color="cyan" />\n);`,
        vibePrompt: LOVABLE_PROMPTS["orbit-button"]
    },
    {
        id: "galaxy-button",
        title: "Galaxy Button",
        category: "button",
        preview: renderComponent("galaxy-button", "Galaxy Button"),
        code: `import { GalaxyButton } from "@/components/ui/GalaxyButton";\n\nexport const Demo = () => (\n  <GalaxyButton label="Galaxy Button" />\n);`,
        vibePrompt: LOVABLE_PROMPTS["galaxy-button"]
    },
    {
        id: "liquid-fill-button",
        title: "Liquid Fill Button",
        category: "button",
        preview: renderComponent("liquid-fill-button", "Liquid Fill Button"),
        code: `import { LiquidFillButton } from "@/components/ui/LiquidFillButton";\n\nexport const Demo = () => (\n  <LiquidFillButton label="Liquid Fill" liquidColor="#06b6d4" />\n);`,
        vibePrompt: LOVABLE_PROMPTS["liquid-fill-button"]
    },
    {
        id: "neon-flicker-button",
        title: "Neon Flicker Button",
        category: "button",
        preview: renderComponent("neon-flicker-button", "Neon Flicker Button"),
        code: `import { NeonFlickerButton } from "@/components/ui/NeonFlickerButton";\n\nexport const Demo = () => (\n  <NeonFlickerButton label="Neon Flicker" color="red" />\n);`,
        vibePrompt: LOVABLE_PROMPTS["neon-flicker-button"]
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
        vibePrompt: LOVABLE_PROMPTS["aurora-cursor"]
    },
    {
        id: "space-background",
        title: "Space Background",
        category: "background",
        preview: () => <SpaceBackgroundPreview />,
        code: `import { SpaceBackground } from '@/components/ui/SpaceBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#020617]">\n    <SpaceBackground \n      starCount={400} \n      nebulaCount={6} \n      interactive={true} \n    />\n    <div className="relative z-10 flex h-full items-center justify-center">\n      <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">\n        COSMIC VOYAGE\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["space-background"]

    },
    {
        id: "neural-network-background",
        title: "Neural Network Background",
        category: "background",
        preview: () => <NeuralNetworkPreview />,
        code: `import { NeuralNetworkBackground } from '@/components/ui/NeuralNetworkBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#020617]">\n    <NeuralNetworkBackground \n      nodeCount={120} \n      connectionDistance={150} \n      interactive={false} \n    />\n    <div className="relative z-10 flex h-full items-center justify-center">\n      <h1 className="text-4xl font-bold text-cyan-400 tracking-widest uppercase">\n        Neural Core\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["neural-network-background"]

    },
    {
        id: "black-hole-background",
        title: "Black Hole Background",
        category: "background",
        preview: () => <BlackHolePreview />,
        code: `import { BlackHoleBackground } from '@/components/ui/BlackHoleBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#020617]">\n    <BlackHoleBackground \n      particleCount={600} \n      coreColor="rgba(79, 70, 229, 0.4)" \n      accentColor="#22d3ee" \n    />\n    <div className="relative z-10 flex h-full items-center justify-center">\n      <h1 className="text-4xl font-black text-white tracking-widest uppercase opacity-80">\n        Gravitational Core\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["black-hole-background"]

    },
    {
        id: "warp-speed-background",
        title: "Warp Speed Background",
        category: "background",
        preview: () => <WarpSpeedPreview />,
        code: `import { WarpSpeedBackground } from '@/components/ui/WarpSpeedBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#020617]">\n    <WarpSpeedBackground \n      starCount={800} \n      speed={15} \n    />\n    <div className="relative z-10 flex h-full items-center justify-center">\n      <h1 className="text-4xl font-bold text-white tracking-[0.3em] uppercase italic opacity-70">\n        Light Speed\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["warp-speed-background"]

    },
    {
        id: "mouse-gravity-background",
        title: "Mouse Gravity Background",
        category: "background",
        preview: () => <MouseGravityPreview />,
        code: `import { MouseGravityBackground } from '@/components/ui/MouseGravityBackground';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#020617]">\n    <MouseGravityBackground \n      particleCount={150} \n      attractionForce={0.06} \n    />\n    <div className="relative z-10 flex h-full items-center justify-center">\n      <h1 className="text-4xl font-bold text-cyan-400/50 tracking-widest uppercase pointer-events-none">\n        Gravity Field\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["mouse-gravity-background"]

    },
    {
        id: "heart-cursor",
        title: "Heart Cursor 💜",
        category: "cursor",
        preview: () => <HeartCursorPreview />,
        code: `import { HeartCursor } from '@/components/ui/HeartCursor';\n\n// Wrap your content with the HeartCursor component.\n// It tracks the mouse smoothly and leaves trailing ripples.\nexport const Demo = () => (\n  <div className="relative w-full h-[500px] overflow-hidden rounded-xl bg-[#0a0a0f] flex items-center justify-center">\n    <HeartCursor \n      size={24} \n      glowIntensity={0.8} \n      trailSpeed={0.05}\n    />\n    <p className="text-white/20 text-sm tracking-widest uppercase font-bold">\n      Move your cursor to experience the love\n    </p>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["heart-cursor"]
    },
    {
        id: "interactive-webgl-scene",
        title: "Interactive WebGL Scene",
        category: "3d",
        preview: () => <InteractiveWebGLScenePreview />,
        code: `import { InteractiveWebGLScene } from '@/components/ui/InteractiveWebGLScene';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-black shadow-2xl">\n    <InteractiveWebGLScene \n      overlayOpacity={0.4} \n      showDownloadLink={true}\n    />\n    <div className="relative z-20 flex h-full items-center justify-center p-12 text-center">\n      <h1 className="text-7xl font-extrabold text-white tracking-tight drop-shadow-2xl">\n        WEBGL EXPERIENCE\n      </h1>\n    </div>\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["interactive-webgl-scene"]
    },
    {
        id: "3d-scroll-animation",
        title: "3D Scroll Animation",
        category: "3d",
        preview: () => <Scroll3DAnimationPreview />,
        code: `import Scroll3DAnimation from '@/components/ui/Scroll3DAnimation';\n\nexport const Demo = () => (\n  <div className="relative w-full h-[800px] overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100">\n    <Scroll3DAnimation />\n  </div>\n);`,
        vibePrompt: LOVABLE_PROMPTS["3d-scroll-animation"]
    },
    {
        id: "3d-slider",
        title: "3D Slider",
        category: "3d",
        preview: () => <ThreeDSliderPreview />,
        code: `import React, { useState, useCallback, useEffect } from 'react';

interface Slide {
  id: number;
  title: string;
  description: string;
  image: string;
  accentColor: string;
}

interface ThreeDSliderProps {
  slides?: Slide[];
  autoPlay?: boolean;
  interval?: number;
  className?: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1, title: "Wuthering Waves",
    description: "Experience a story-rich open-world action RPG with a high degree of freedom.",
    image: "https://4kwallpapers.com/images/walls/thumbs_3t/24686.jpg",
    accentColor: "#00f2ff"
  },
  {
    id: 2, title: "Solo Leveling",
    description: "A world where hunters with magical abilities must battle deadly monsters.",
    image: "https://4kwallpapers.com/images/walls/thumbs_3t/24719.jpg",
    accentColor: "#a855f7"
  },
  {
    id: 3, title: "Where Winds Meet",
    description: "An epic open-world action-adventure RPG set in the twilight of the Ten Kingdoms.",
    image: "https://4kwallpapers.com/images/walls/thumbs_3t/24534.jpg",
    accentColor: "#fbbf24"
  },
  {
    id: 4, title: "Battlefield 2042",
    description: "A first-person shooter that marks the return to the iconic all-out warfare of the franchise.",
    image: "https://4kwallpapers.com/images/walls/thumbs_3t/24204.jpg",
    accentColor: "#f97316"
  }
];

export const ThreeDSlider: React.FC<ThreeDSliderProps> = ({
  slides = DEFAULT_SLIDES, autoPlay = false, interval = 5000, className = ''
}) => {
  const [activeSlides, setActiveSlides] = useState<Slide[]>(slides);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlides(prev => { const n = [...prev]; const f = n.shift(); if (f) n.push(f); return n; });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setActiveSlides(prev => { const n = [...prev]; const l = n.pop(); if (l) n.unshift(l); return n; });
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  useEffect(() => {
    if (!autoPlay) return;
    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, nextSlide]);

  return (
    <div className={\\\`relative w-full h-full overflow-hidden bg-[#0a0a0f] \\\${className}\\\`}>
      <style>{\\\`
        .hero-track { position: relative; width: 100%; height: 100%; }
        .slide-card { width: 200px; height: 300px; position: absolute; top: 50%; transform: translateY(-50%); border-radius: 20px; box-shadow: 0 30px 50px rgba(0,0,0,0.5); background-position: 50% 50%; background-size: cover; transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1); }
        .slide-card:nth-child(1), .slide-card:nth-child(2) { top: 0; left: 0; transform: translateY(0); border-radius: 0; width: 100%; height: 100%; box-shadow: none; }
        .slide-card:nth-child(3) { left: 50%; } .slide-card:nth-child(4) { left: calc(50% + 230px); } .slide-card:nth-child(5) { left: calc(50% + 460px); } .slide-card:nth-child(n+6) { left: calc(50% + 690px); opacity: 0; }
        .slide-card:nth-child(2)::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%); z-index: 1; pointer-events: none; }
        .slide-info { position: absolute; top: 50%; left: 10%; width: 500px; text-align: left; color: #fff; transform: translateY(-50%); display: none; z-index: 5; }
        .slide-card:nth-child(2) .slide-info { display: block; }
        .slide-title { font-size: 64px; text-transform: uppercase; font-weight: 900; opacity: 0; line-height: 1; filter: drop-shadow(0 0 20px var(--accent, #fff)); animation: slideUpFade 0.8s ease-out 0.2s forwards; }
        .slide-desc { margin-top: 15px; margin-bottom: 30px; font-size: 16px; line-height: 1.6; opacity: 0; color: rgba(255,255,255,0.85); text-shadow: 0 2px 4px rgba(0,0,0,0.5); animation: slideUpFade 0.8s ease-out 0.4s forwards; }
        .slide-info button { padding: 12px 30px; border: none; cursor: pointer; opacity: 0; border-radius: 50px; background: var(--accent, #fff); color: #000; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; font-size: 11px; box-shadow: 0 10px 20px rgba(0,0,0,0.3); animation: slideUpFade 0.8s ease-out 0.6s forwards; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(40px); filter: blur(10px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        .slider-controls { position: absolute; bottom: 50px; left: 50%; transform: translateX(-50%); display: flex; gap: 20px; z-index: 20; }
        .nav-btn { width: 54px; height: 54px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease; }
        .nav-btn:hover { background: #fff; color: #000; transform: scale(1.1); }
      \\\`}</style>
      <div className="hero-track">
        {activeSlides.map((slide, i) => (
          <div key={\\\`\\\${slide.id}-\\\${i}\\\`} className="slide-card" style={{ backgroundImage: \\\`url(\\\${slide.image})\\\`, ['--accent' as any]: slide.accentColor }}>
            <div className="slide-info">
              <h2 className="slide-title">{slide.title}</h2>
              <p className="slide-desc">{slide.description}</p>
              <button>Explore Now</button>
            </div>
          </div>
        ))}
      </div>
      <div className="slider-controls">
        <button className="nav-btn" onClick={prevSlide}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <button className="nav-btn" onClick={nextSlide}><svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div>
    </div>
  );
};

// Usage:
// <div className="relative w-full h-[600px] overflow-hidden rounded-3xl bg-[#0a0a0f] shadow-2xl">
//   <ThreeDSlider autoPlay={true} interval={5000} />
// </div>`,
        vibePrompt: LOVABLE_PROMPTS["3d-slider"]
    },

    {
        id: "lizard-cursor",
        title: "Lizard Cursor",
        category: "cursor",
        preview: () => <LizardCursorPreview />,
        code: `import { useRef } from 'react';
import { LizardCursor } from '@/components/ui/LizardCursor';

export const ScorpioDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden rounded-3xl bg-[#050508] border border-white/5 flex items-center justify-center cursor-none group"
    >
      {/* Immersive background for the demo */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />
      
      {/* The Lizard Component (with Click-to-Strike) */}
      <LizardCursor 
        color="#ffffff" 
        size={2.5} 
        containerRef={containerRef} 
      />

      <div className="relative z-10 text-center pointer-events-none">
          <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold">
            Click to Strike
          </p>
      </div>
    </div>
  );
};`,
        vibePrompt: LOVABLE_PROMPTS["lizard-cursor"]
    },
    {
        id: "venom-cursor",
        title: "Venom Cursor",
        category: "cursor",
        preview: () => <VenomCursorPreview />,
        code: `import { useRef } from 'react';
import { VenomCursor } from '@/components/ui/VenomCursor';

export const SpiderDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden rounded-3xl bg-[#020205] border border-white/5 flex items-center justify-center cursor-none group"
    >
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* The Venom Component (with Procedural Swarm) */}
      <VenomCursor 
        color="#ffffff" 
        containerRef={containerRef} 
      />

      <VenomCursor 
        color="#ffffff" 
        containerRef={containerRef} 
      />

      <div className="relative z-10 text-center pointer-events-none">
          {/* Custom branding or navigation goes here */}
      </div>
    </div>
  );
};`,
        vibePrompt: LOVABLE_PROMPTS["venom-cursor"]
    },
    {
        id: "3d-tubes-cursor",
        title: "3D Tubes Cursor",
        category: "cursor",
        preview: () => <ThreeDTubesCursorPreview />,
        code: `import { useRef } from 'react';
import { ThreeDTubesCursor } from '@/components/ui/ThreeDTubesCursor';

export const TubesDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[500px] overflow-hidden rounded-3xl bg-[#0a0a0f] border border-white/5 flex items-center justify-center cursor-none group"
    >
      {/* Atmosphere background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(105,88,213,0.15)_0%,transparent_70%)]" />
      
      <ThreeDTubesCursor 
        colors={["#f967fb", "#53bc28", "#6958d5"]}
        lightIntensity={200}
        containerRef={containerRef} 
      />

      <div className="relative z-10 text-center pointer-events-none">
          <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase font-bold">
            Interactive 3D Tubes
          </p>
      </div>
    </div>
  );
};`,
        vibePrompt: LOVABLE_PROMPTS["3d-tubes-cursor"]
    },
    {
        id: "odyssey-spline",
        title: "Odyssey 3D Animation",
        category: "3d",
        preview: () => <OdysseySplinePreview />,
        code: `import { OdysseySpline } from '@/components/ui/OdysseySpline';

export const OdysseyDemo = () => {
  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <OdysseySpline />
    </div>
  );
};`,
        vibePrompt: LOVABLE_PROMPTS["odyssey-spline"]
    },
    {
        id: "3d-block-movement",
        title: "3D block movement",
        category: "3d",
        preview: () => (
            <div className="w-full h-full rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                <ThreeDBlockMovement />
            </div>
        ),
        code: `import { ThreeDBlockMovement } from '@/components/ui/ThreeDBlockMovement';

export const Demo = () => {
  return (
    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
      <ThreeDBlockMovement />
    </div>
  );
};`,
        vibePrompt: LOVABLE_PROMPTS["3d-block-movement"]
    },
    {
        id: "3d-hero-globel",
        title: "3D HERO GLOBEL",
        category: "3d",
        preview: () => <HeroGlobelSplinePreview />,
        code: `import { HeroGlobelSpline } from '@/components/ui/HeroGlobelSpline';\n\nexport const Demo = () => {\n  return (\n    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">\n      <HeroGlobelSpline />\n    </div>\n  );\n};`,
        vibePrompt: LOVABLE_PROMPTS["3d-hero-globel"]
    },
    {
        id: "3d-orbital-experience",
        title: "3D Orbital Experience",
        category: "3d",
        preview: () => <OrbitalExperienceSplinePreview />,
        code: `import { OrbitalExperienceSpline } from '@/components/ui/OrbitalExperienceSpline';\n\nexport const Demo = () => {\n  return (\n    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5 shadow-2xl">\n      <OrbitalExperienceSpline />\n    </div>\n  );\n};`,
        vibePrompt: LOVABLE_PROMPTS["3d-orbital-experience"]
    },
];

