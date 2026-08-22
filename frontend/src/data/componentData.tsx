import { LOVABLE_PROMPTS } from './lovablePrompts';
import { ANTIGRAVITY_PROMPTS } from './antigravityPrompts';
import React, { useRef, useCallback, useState, useEffect, Suspense } from 'react';

// ── Lazy Loaded UI Components ──────────────────
const AuroraCursor = React.lazy(() => import('../components/ui/AuroraCursor').then(m => ({ default: m.AuroraCursor })));
const MagneticCursor = React.lazy(() => import('../components/ui/MagneticCursor').then(m => ({ default: m.MagneticCursor })));
const MagneticBackground = React.lazy(() => import('../components/ui/MagneticBackground').then(m => ({ default: m.MagneticBackground })));
const BlackHoleCursor = React.lazy(() => import('../components/ui/BlackHoleCursor').then(m => ({ default: m.BlackHoleCursor })));
const TargetCursor = React.lazy(() => import('../components/ui/TargetCursor').then(m => ({ default: m.TargetCursor })));
const SpaceBackground = React.lazy(() => import('../components/ui/SpaceBackground').then(m => ({ default: m.SpaceBackground })));
const NeuralNetworkBackground = React.lazy(() => import('../components/ui/NeuralNetworkBackground').then(m => ({ default: m.NeuralNetworkBackground })));
const BlackHoleBackground = React.lazy(() => import('../components/ui/BlackHoleBackground').then(m => ({ default: m.BlackHoleBackground })));
const WarpSpeedBackground = React.lazy(() => import('../components/ui/WarpSpeedBackground').then(m => ({ default: m.WarpSpeedBackground })));
const MouseGravityBackground = React.lazy(() => import('../components/ui/MouseGravityBackground').then(m => ({ default: m.MouseGravityBackground })));
const InteractiveWebGLScene = React.lazy(() => import('../components/ui/InteractiveWebGLScene').then(m => ({ default: m.InteractiveWebGLScene })));
const Scroll3DAnimation = React.lazy(() => import('../components/ui/Scroll3DAnimation'));
const ThreeDSlider = React.lazy(() => import('../components/ui/ThreeDSlider'));
export const RubiksCube = React.lazy(() => import('../components/ui/RubiksCube'));
const HeartCursor = React.lazy(() => import('../components/ui/HeartCursor').then(m => ({ default: m.HeartCursor })));
const LizardCursor = React.lazy(() => import('../components/ui/LizardCursor').then(m => ({ default: m.LizardCursor })));
const VenomCursor = React.lazy(() => import('../components/ui/VenomCursor').then(m => ({ default: m.VenomCursor })));
const StarCursor = React.lazy(() => import('../components/ui/StarCursor').then(m => ({ default: m.StarCursor })));

const Robot3DBackground = React.lazy(() => import('../components/ui/Robot3DBackground').then(m => ({ default: m.Robot3DBackground })));
const HoodieBot = React.lazy(() => import('../components/ui/HoodieBot'));
const Smilo = React.lazy(() => import('../components/ui/Smilo'));
const Tripy = React.lazy(() => import('../components/ui/Tripy'));
const Aiva = React.lazy(() => import('../components/ui/Aiva'));
const LaptopBot = React.lazy(() => import('../components/ui/LaptopBot'));
const CardsBeam = React.lazy(() => import('../components/ui/CardsBeam'));
const SolarSystem = React.lazy(() => import('../components/ui/SolarSystem'));
const ToonhubHero = React.lazy(() => import('../components/ui/ToonhubHero'));
const ParticlesBackground = React.lazy(() => import('../components/ui/ParticlesBackground'));
const FourierFlow = React.lazy(() => import('../components/ui/FourierFlow'));
const SVGPageTransition = React.lazy(() => import('../components/ui/SVGPageTransition').then(m => ({ default: m.SVGPageTransition })));
const SectionScroll = React.lazy(() => import('../components/ui/SectionScroll').then(m => ({ default: m.SectionScroll })));
const PortfolioScroll = React.lazy(() => import('../components/ui/PortfolioScroll').then(m => ({ default: m.PortfolioScroll })));
const CloudScroll = React.lazy(() => import('../components/ui/CloudScroll/CloudScroll'));
const InfiniteMarquee = React.lazy(() => import('../components/ui/InfiniteMarquee').then(m => ({ default: m.InfiniteMarquee })));
const BuyMeCoffee = React.lazy(() => import('../components/ui/BuyMeCoffee'));
const HackerBackground = React.lazy(() => import('../components/ui/HackerBackground'));
const BeamGridBackground = React.lazy(() => import('../components/ui/BeamGridBackground'));
const FallBeamBackground = React.lazy(() => import('../components/ui/FallBeamBackground'));
const HellBackground = React.lazy(() => import('../components/ui/HellBackground'));
const InteractiveGridBackground = React.lazy(() => import('../components/ui/InteractiveGridBackground'));
const WaveBackground = React.lazy(() => import('../components/ui/WaveBackground'));
const CornerBorderButton = React.lazy(() => import('../components/ui/corner-border-button').then(m => ({ default: m.CornerBorderButton })));
const InteractiveHoverButton = React.lazy(() => import('../components/ui/interactive-hover-button'));
const IsometricGridBackground = React.lazy(() => import('../components/ui/isometric-grid-background').then(m => ({ default: m.IsometricGridBackground })));
const MagicCard = React.lazy(() => import('../components/ui/magic-card').then(m => ({ default: m.MagicCard })));
const MarqueeHoverButton = React.lazy(() => import('../components/ui/marquee-hover-button').then(m => ({ default: m.MarqueeHoverButton })));
const PaymentTransactionButton = React.lazy(() => import('../components/ui/payment-transaction-button').then(m => ({ default: m.PaymentTransactionButton })));
const RainbowButton = React.lazy(() => import('../components/ui/rainbow-button').then(m => ({ default: m.RainbowButton })));
const ShatterButton = React.lazy(() => import('../components/ui/shatter-button').then(m => ({ default: m.ShatterButton })));
const SparklesBackground = React.lazy(() => import('../components/ui/sparkles-background').then(m => ({ default: m.SparklesBackground })));
const BackgroundBoxes = React.lazy(() => import('../components/ui/background-boxes').then(m => ({ default: m.BoxesCore })));
const BackgroundPaths = React.lazy(() => import('../components/ui/background-paths').then(m => ({ default: m.BackgroundPaths })));
const BorderBeam = React.lazy(() => import('../components/ui/border-beam').then(m => ({ default: m.BorderBeam })));
const GlowButton = React.lazy(() => import('../components/ui/GlowButton'));
const GalaxyButton = React.lazy(() => import('../components/ui/GalaxyButton').then(m => ({ default: m.GalaxyButton })));
const LiquidFillButton = React.lazy(() => import('../components/ui/LiquidFillButton').then(m => ({ default: m.LiquidFillButton })));
const NeonFlickerButton = React.lazy(() => import('../components/ui/NeonFlickerButton').then(m => ({ default: m.NeonFlickerButton })));
const OrbitButton = React.lazy(() => import('../components/ui/OrbitButton').then(m => ({ default: m.OrbitButton })));
const SocialTooltipButtons = React.lazy(() => import('../components/animations/SocialTooltipButtons').then(m => ({ default: m.SocialTooltipButtons })));
const ImageTrail = React.lazy(() => import('../components/ui/image-trail').then(m => ({ default: m.ImageTrail })));
const PerspectiveCarousel = React.lazy(() => import('../components/ui/perspective-carousel').then(m => ({ default: m.PerspectiveCarousel })));
const DiagonalCarousel = React.lazy(() => import('../components/ui/diagonal-carousel').then(m => ({ default: m.DiagonalCarousel })));
const TestimonialsCard = React.lazy(() => import('../components/ui/testimonials-card').then(m => ({ default: m.TestimonialsCard })));
const ImageCollage = React.lazy(() => import('../components/ui/image-collage').then(m => ({ default: m.ImageCollage })));




// ── Lazy Loaded Internal Collections ───────────
// These are handled by LazyRenderer via renderComponent


import Logo from '../components/ui/Logo';
import {
    LetterPullUpText,
    ScaleLetterText,
    SeparateAwayText,
    WavyText,
    WordPullUpText,
    MeshText,
    PixelDrift,
    RandomLetterSwap,
    RollingLetters
} from '../components/animations/TextAnimations';



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






// ── Heart Cursor scoped preview ────────────
const HeartCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    // Stable floating hearts (deterministic positions)
    const floatingHearts = [
        { top: '10%',  left: '8%',   size: 28, opacity: 0.18, dur: 6,   delay: 0   },
        { top: '25%',  left: '88%',  size: 18, opacity: 0.14, dur: 8,   delay: 1.2 },
        { top: '60%',  left: '5%',   size: 22, opacity: 0.12, dur: 7,   delay: 0.5 },
        { top: '75%',  left: '92%',  size: 30, opacity: 0.16, dur: 9,   delay: 2   },
        { top: '45%',  left: '82%',  size: 14, opacity: 0.10, dur: 6.5, delay: 3   },
        { top: '15%',  left: '55%',  size: 12, opacity: 0.08, dur: 7.5, delay: 1.8 },
        { top: '80%',  left: '30%',  size: 20, opacity: 0.12, dur: 8.5, delay: 0.8 },
        { top: '88%',  left: '65%',  size: 16, opacity: 0.09, dur: 6,   delay: 2.5 },
        { top: '35%',  left: '15%',  size: 10, opacity: 0.07, dur: 9,   delay: 4   },
        { top: '5%',   left: '72%',  size: 24, opacity: 0.13, dur: 7,   delay: 3.5 },
    ];

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                overflow: 'hidden',
                cursor: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                // Deep romantic space: violet → rose → deep pink
                background: 'radial-gradient(ellipse at 50% 0%,   #2d0a3e 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, #4a0a2a 0%, transparent 55%), radial-gradient(ellipse at 80% 90%, #1a0030 0%, transparent 55%), #0a0010',
            }}
        >
            {/* ── Rich background gradient layers ── */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
                {/* Top violet bloom */}
                <div style={{
                    position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: '80%', height: '60%',
                    background: 'radial-gradient(ellipse, rgba(180,40,220,0.30) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                }} />
                {/* Left rose glow */}
                <div style={{
                    position: 'absolute', top: '20%', left: '-15%',
                    width: '55%', height: '70%',
                    background: 'radial-gradient(ellipse, rgba(236,72,153,0.35) 0%, transparent 70%)',
                    filter: 'blur(70px)',
                }} />
                {/* Right deep pink */}
                <div style={{
                    position: 'absolute', top: '10%', right: '-15%',
                    width: '55%', height: '70%',
                    background: 'radial-gradient(ellipse, rgba(219,39,119,0.28) 0%, transparent 70%)',
                    filter: 'blur(75px)',
                }} />
                {/* Bottom crimson pool */}
                <div style={{
                    position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)',
                    width: '90%', height: '60%',
                    background: 'radial-gradient(ellipse, rgba(159,18,57,0.40) 0%, transparent 65%)',
                    filter: 'blur(60px)',
                }} />
                {/* Soft vignette */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(5,0,12,0.60) 100%)',
                }} />
            </div>

            {/* ── Floating ambient hearts ── */}
            <style>{`
                @keyframes hcp-float {
                    0%,100% { transform: translateY(0px) rotate(-10deg) scale(1); }
                    33%     { transform: translateY(-14px) rotate(5deg) scale(1.06); }
                    66%     { transform: translateY(-6px) rotate(-5deg) scale(0.96); }
                }
                @keyframes hcp-pulse-ring {
                    0%,100% { transform: scale(1);    opacity: 0.5; }
                    50%     { transform: scale(1.12);  opacity: 0.9; }
                }
                @keyframes hcp-shimmer {
                    0%   { background-position: -200% center; }
                    100% { background-position:  200% center; }
                }
                .hcp-card-btn:hover {
                    transform: scale(1.04);
                    box-shadow: 0 0 30px rgba(236,72,153,0.6), 0 12px 40px rgba(0,0,0,0.5);
                }
                .hcp-pill:hover {
                    background: rgba(255,255,255,0.12) !important;
                    border-color: rgba(236,72,153,0.5) !important;
                    transform: translateY(-2px);
                }
            `}</style>

            {floatingHearts.map((h, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    top: h.top, left: h.left,
                    opacity: h.opacity,
                    animation: `hcp-float ${h.dur}s ease-in-out infinite`,
                    animationDelay: `${h.delay}s`,
                    zIndex: 1,
                    pointerEvents: 'none',
                }}>
                    <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="#ec4899">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                    </svg>
                </div>
            ))}

            <HeartCursor containerRef={containerRef} size={30} />

            {/* ── Hero Card ── */}
            <div style={{
                position: 'relative', zIndex: 10,
                width: '88%', maxWidth: '420px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 28,
                padding: '36px 32px 28px',
                backdropFilter: 'blur(24px)',
                boxShadow: '0 0 60px rgba(236,72,153,0.18), 0 30px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
                textAlign: 'center',
            }}>
                {/* Top gradient bar */}
                <div style={{
                    position: 'absolute', top: 0, left: '15%', right: '15%', height: '2px',
                    background: 'linear-gradient(90deg, transparent, #f472b6, #e879f9, #f472b6, transparent)',
                    borderRadius: 2,
                }} />

                {/* Badge */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(236,72,153,0.12)',
                    border: '1px solid rgba(236,72,153,0.30)',
                    borderRadius: 999, padding: '5px 14px',
                }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f472b6">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                    </svg>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#f9a8d4', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                        Heart Cursor
                    </span>
                </div>

                {/* Heading */}
                <div>
                    <div style={{
                        fontSize: 30, fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15,
                        background: 'linear-gradient(135deg, #ffffff 0%, #fce7f3 40%, #f9a8d4 70%, #ec4899 100%)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.4))',
                    }}>
                        Built with love,<br />designed to delight
                    </div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginTop: 10, lineHeight: 1.6 }}>
                        Move your cursor · Watch the magic ✨
                    </div>
                </div>

                {/* Feature pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['Trail Effect', 'Smooth Physics', 'Customizable'].map((label, i) => (
                        <div key={i} className="hcp-pill" style={{
                            fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.65)',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            borderRadius: 999, padding: '5px 13px',
                            transition: 'all 0.25s ease',
                            cursor: 'none',
                        }}>
                            {label}
                        </div>
                    ))}
                </div>

                {/* CTA button with shimmer */}
                <button className="hcp-card-btn" style={{
                    width: '100%', padding: '13px 0',
                    background: 'linear-gradient(135deg, #be185d 0%, #ec4899 50%, #db2777 100%)',
                    backgroundSize: '200% auto',
                    border: 'none', borderRadius: 14,
                    fontSize: 13, fontWeight: 800,
                    color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase',
                    cursor: 'none',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    boxShadow: '0 0 20px rgba(236,72,153,0.4), 0 8px 30px rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                        <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z"/>
                    </svg>
                    Explore Components
                </button>
            </div>
        </div>
    );
};

// ── Lizard Cursor scoped preview ────────────
const LizardCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);
    // Eagerly pre-load lazy chunk so canvas is ready before first hover
    useEffect(() => { import('../components/ui/LizardCursor'); }, []);

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

            {/* Always mounted: opacity toggle = instant animation, no lazy-load delay on hover */}
            <div style={{ opacity: isInside ? 1 : 0, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Suspense fallback={null}><LizardCursor color="#22c55e" containerRef={containerRef} /></Suspense>
            </div>
        </div>
    );
};

// ── Star Cursor scoped preview ────────────
const StarCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);
    useEffect(() => { import('../components/ui/StarCursor'); }, []);

    return (
        <div
            ref={containerRef}
            onMouseEnter={() => setIsInside(true)}
            onMouseLeave={() => setIsInside(false)}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '100%',
                // Dark navy — matches the reference screenshot exactly
                background: 'linear-gradient(160deg, #0a0e1a 0%, #07101e 40%, #050c18 70%, #030810 100%)',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 24,
            }}
        >
            {/* Subtle star-field dots */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: `
                    radial-gradient(circle, rgba(200,230,255,0.9) 1px, transparent 1px),
                    radial-gradient(circle, rgba(150,200,255,0.5) 1px, transparent 1px),
                    radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: '130px 130px, 210px 210px, 85px 85px',
                backgroundPosition: '10px 20px, 65px 70px, 35px 95px',
            }} />
            {/* Very faint cyan nebula hint */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `
                    radial-gradient(ellipse at 20% 70%, rgba(0,100,180,0.10) 0%, transparent 50%),
                    radial-gradient(ellipse at 75% 25%, rgba(0,80,160,0.08) 0%, transparent 50%)
                `,
            }} />

            {/* Interactive demo elements */}
            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, width: '82%' }}>
                <div style={{ fontSize: 8, fontWeight: 900, color: 'rgba(0,220,240,0.45)', letterSpacing: '0.5em', textTransform: 'uppercase' }}>
                    ✦ STAR CURSOR ✦
                </div>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {['EXPLORE', 'NEBULA', 'COSMOS'].map((label) => (
                        <button key={label} style={{
                            padding: '9px 18px',
                            background: 'rgba(0,200,230,0.05)',
                            border: '1px solid rgba(0,200,230,0.18)',
                            borderRadius: 8,
                            color: 'rgba(100,220,240,0.70)',
                            fontSize: 9, fontWeight: 800,
                            letterSpacing: '0.22em',
                            cursor: 'none',
                            transition: 'all 0.3s ease',
                        }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(0,200,230,0.12)';
                                e.currentTarget.style.borderColor = 'rgba(0,230,255,0.45)';
                                e.currentTarget.style.boxShadow = '0 0 18px rgba(0,200,240,0.18), 0 0 40px rgba(0,180,220,0.08)';
                                e.currentTarget.style.color = 'rgba(160,240,255,0.95)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(0,200,230,0.05)';
                                e.currentTarget.style.borderColor = 'rgba(0,200,230,0.18)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.color = 'rgba(100,220,240,0.70)';
                            }}
                        >{label}</button>
                    ))}
                </div>
                <div style={{
                    padding: '12px 24px',
                    background: 'rgba(0,180,220,0.05)',
                    border: '1px solid rgba(0,180,220,0.12)',
                    borderRadius: 10,
                    color: 'rgba(80,200,225,0.40)',
                    fontSize: 8, fontWeight: 700,
                    letterSpacing: '0.28em', textAlign: 'center', cursor: 'none',
                }}>MOVE CURSOR · CLICK TO BURST · HOVER TO GLOW</div>
            </div>

            {/* Star cursor — opacity-gated for performance */}
            <div style={{ opacity: isInside ? 1 : 0, position: 'absolute', inset: 0, pointerEvents: 'none', transition: 'opacity 0.3s ease' }}>
                <Suspense fallback={null}>
                    <StarCursor containerRef={containerRef} hideDefaultCursor={true} />
                </Suspense>
            </div>
        </div>
    );
};

// ── Venom Cursor scoped preview ────────────
const VenomCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isInside, setIsInside] = useState(false);
    // Eagerly pre-load lazy chunk so canvas is ready before first hover
    useEffect(() => { import('../components/ui/VenomCursor'); }, []);

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

            {/* Always mounted: opacity toggle = instant animation, no lazy-load delay on hover */}
            <div style={{ opacity: isInside ? 1 : 0, position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Suspense fallback={null}><VenomCursor color="#ffffff" containerRef={containerRef} /></Suspense>
            </div>

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', pointerEvents: 'none' }}>
                {/* Branding text removed as per user request */}
            </div>
        </div>
    );
};

// ── 3D Tubes Cursor scoped preview ────────────

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
    category: "text" | "effect" | "background" | "button" | "cursor" | "3d" | "custom" | "3d-chatbot" | "scroll" | "image-interaction";
    preview: (props?: any) => React.ReactNode;
    code: string;
    vibePrompt: string;
    description?: string;
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

    if (!Comp) return <div className="animate-pulse opacity-10 flex items-center justify-center w-full h-full font-bold uppercase tracking-widest text-[10px]">LOADING...</div>;
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
    'heart-cursor': HeartCursor,
    'lizard-cursor': LizardCursor,
    'venom-cursor': VenomCursor,
    'star-cursor': StarCursor,

    'robot-3d-background': Robot3DBackground,
    'hoodiebot': HoodieBot,
    'smilo': Smilo,
    'tripy': Tripy,
    'aiva': Aiva,
    'laptopbot': LaptopBot,
    'cards-beam': CardsBeam,
    'solar-system': SolarSystem,
    '3d-hero': ToonhubHero,
    'particles-background': ParticlesBackground,
    'fourier-flow': FourierFlow,
    'svg-page-transition': SVGPageTransition,
    'section-scroll': SectionScroll,
    'portfolio-scroll': PortfolioScroll,
    'cloud-scroll': CloudScroll,
    'infinite-marquee': InfiniteMarquee,
    'buyme-acoffee': BuyMeCoffee,
    'hacker-background': HackerBackground,

    'beam-grid-background': BeamGridBackground,
    'fall-beam-background': FallBeamBackground,
    'hell-background': HellBackground,
    'interactive-grid-background': InteractiveGridBackground,
    'wave-background': WaveBackground,
    'corner-border-button': CornerBorderButton,
    'interactive-hover-button': InteractiveHoverButton,
    'isometric-grid-background': IsometricGridBackground,
    'magic-card-effect': MagicCard,
    'marquee-hover-button': MarqueeHoverButton,
    'payment-transaction-button': PaymentTransactionButton,
    'rainbow-button': RainbowButton,
    'shatter-button': ShatterButton,
    'sparkles-background': SparklesBackground,
    'grid-background': BackgroundBoxes,
    'lines-background': BackgroundPaths,
    'border-beam': BorderBeam,
    'glow-button': GlowButton,
    'galaxy-button': GalaxyButton,
    'liquid-fill-button': LiquidFillButton,
    'neon-flicker-button': NeonFlickerButton,
    'orbit-button': OrbitButton,
    'social-tooltip-buttons': SocialTooltipButtons,
    'image-trail': ImageTrail,
    'perspective-carousel': PerspectiveCarousel,
    'diagonal-carousel': DiagonalCarousel,
    'testimonials-card': TestimonialsCard,
    'image-collage': ImageCollage,
    'letter-pull-up': LetterPullUpText as any,
    'scale-letter': ScaleLetterText as any,
    'separate-away': SeparateAwayText as any,
    'wavy-text': WavyText as any,
    'word-pull-up': WordPullUpText as any,
    'mesh-text-hover': MeshText as any,
    'pixel-drift': PixelDrift as any,
    'random-letter-swap': RandomLetterSwap as any,
    'rolling-letters': RollingLetters as any,
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
        const isText = id.includes('text') || 
                       id.includes('cinematic') || 
                       id.includes('separate') || 
                       id.includes('wavy') || 
                       ['letter-pull-up', 'scale-letter', 'word-pull-up'].includes(id);
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
        id: "mesh-text-hover",
        title: "Mesh Text Hover",
        category: "text",
        preview: () => (
            <div className="w-full h-full min-h-[380px] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-6 relative">
                <MeshText text="HOVER" color="#ffffff" colorSplit={true} customColors={["#ff40c0", "#40ff80", "#00f0ff"]} force={18} font={{ fontFamily: "Inter", variant: "Bold", fontSize: 130, fontWeight: 800 }} />
            </div>
        ),
        code: `import React from 'react';
import { MeshText } from '@/components/animations/MeshText';

export function MeshTextHoverDemo() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-black">
      <MeshText
        text="HOVER"
        color="#ffffff"
        colorSplit={true}
        customColors={["#ff40c0", "#40ff80", "#00f0ff"]}
        force={18}
        font={{
          fontFamily: "Inter",
          variant: "Bold",
          fontSize: 160,
          fontWeight: 800
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an interactive WebGL2 "Mesh Text Hover" distortion animation in React and TypeScript.

COMPONENT FEATURES & PHYSICS:
1. Dynamic WebGL2 Grid Geometry: Generate a 96x40 vertex triangle mesh mapped with a 2D offscreen text canvas.
2. Spring-Mass Physics Simulation:
   - Each vertex experiences cursor velocity drag (DRAG = 1.8), Hooke's spring restoration (SPRING_K = 0.08), and damping (DAMPING = 0.9).
   - Dynamic vertex displacement (aDisp buffer) stretches and snaps back as the mouse sweeps over the text.
3. Multi-Spectrum Chromatic Aberration Shader:
   - Custom GLSL Fragment Shader samples horizontal texture offsets based on displacement magnitude (vMag).
   - Implements chromatic fringe splitting with customizable cycling palette pairs (uColorA, uColorB) and alpha preservation.
4. Auto-Resizing & High-DPI Support: Handles devicePixelRatio scaling with ResizeObserver and asynchronous Canvas2D font loading readiness.
5. Fully Configurable Props: Support text, color, customColors palette array, force intensity slider, font family, weight, and style.`
    },
    {
        id: "pixel-drift",
        title: "Pixel Drift",
        category: "text",
        preview: () => (
            <div className="w-full h-full min-h-[380px] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-6 relative">
                <PixelDrift
                    text="UI HUB"
                    colors={["#FFFFFF", "#F9731A", "#3D5CFF"]}
                    fontSize={90}
                    particleSize={10}
                    particleCount={45}
                    mouseEnabled={true}
                    mouseRadius={70}
                    mouseForce={28}
                    mode="onEnter"
                    replay={true}
                />
            </div>
        ),
        code: `import React from 'react';
import { PixelDrift } from '@/components/animations/PixelDrift';

export function PixelDriftDemo() {
  return (
    <div className="w-full h-[400px] flex items-center justify-center bg-black">
      <PixelDrift
        text="UI HUB"
        colors={["#FFFFFF", "#F9731A", "#3D5CFF"]}
        fontSize={90}
        particleSize={10}
        particleCount={45}
        mouseEnabled={true}
        mouseRadius={65}
        mouseForce={25}
        mode="onEnter"
        replay={true}
        transition={{ type: "tween", duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an interactive particle text assembly and cursor-repulsion animation named "Pixel Drift" (ParticleText) using HTML5 Canvas, React, and TypeScript.

COMPONENT FEATURES & PHYSICS:
1. Dynamic Text Sampling & Grid Generation:
   - Render font onto an offscreen 2D canvas with auto-fit measurement to ensure text never overflows canvas bounds.
   - Sample positive alpha pixel locations into a structured Float32Array coordinate grid (ox, oy).
2. Assembly & Dissolve Transition Animation:
   - Spawn particles randomly around an outer boundary ring beyond canvas edges.
   - Interpolate particles inward using cubic-bezier easing curves (easeIn, easeOut, easeInOut, or custom [x1, y1, x2, y2]).
   - Seamless rate-based formation value allowing interruption between appear and dissolve states without snapping.
3. Velocity-Aware Black-Hole Cursor Repulsion:
   - Compute smoothed pointer positions and cursor momentum/speed.
   - Particles within mouseRadius are displaced outward with smooth falloff and return to home position when cursor departs.
4. Triggers & Observation:
   - Supports 'onEnter' viewport sentinel intersection trigger (with optional replay) and 'onHover' interactive pointer triggers.
5. Props:
   - text: string, colors: string[], mode: "onEnter" | "onHover", replay: boolean, position: "above" | "middle" | "below", particleSize: number, particleCount: number, mouseEnabled: boolean, mouseRadius: number, mouseForce: number, fontSize: number, autoFit: boolean, transition: TransitionValue.`
    },
    {
        id: "random-letter-swap",
        title: "Random Letter Swap",
        category: "text",
        preview: () => (
            <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black select-none rounded-2xl overflow-hidden border border-white/5">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    HOVER OVER TEXT TO SWAP
                </div>
                <RandomLetterSwap
                    label="LETTER SWAP"
                    mode="pingpong"
                    reverse={false}
                    staggerDuration={0.08}
                    color="#FFFFFF"
                    font={{
                        fontFamily: "Inter, sans-serif",
                        fontWeight: 900,
                        fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
                        lineHeight: "1.1em",
                        letterSpacing: "-0.03em",
                    }}
                />
                <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-6">
                    Randomized vertical letter swap with Framer Motion spring physics
                </p>
            </div>
        ),
        code: `import React from 'react';
import { RandomLetterSwap } from '@/components/animations/RandomLetterSwap';

export function RandomLetterSwapDemo() {
  return (
    <div className="w-full min-h-[350px] flex items-center justify-center bg-black">
      <RandomLetterSwap
        label="LETTER SWAP"
        mode="pingpong"
        reverse={false}
        staggerDuration={0.08}
        color="#FFFFFF"
        font={{
          fontFamily: "Inter, sans-serif",
          fontWeight: 800,
          fontSize: "clamp(2rem, 8vw, 5rem)",
          lineHeight: "1.1em",
          letterSpacing: "-0.02em",
        }}
        ease={{
          type: "spring",
          stiffness: 400,
          damping: 28,
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an interactive typography micro-interaction named "Random Letter Swap" using React, TypeScript, and Framer Motion.

COMPONENT ARCHITECTURE & PHYSICS:
1. Randomized Vertical Swap Mechanism:
   - Split label into individual letter nodes while preserving accessible sr-only semantic markup.
   - Each letter slot contains a primary letter and an absolute secondary resting letter (placed at +100% or -100% depending on reverse prop).
   - On hover, shuffle the letter order at runtime (filtering out whitespaces so spaces do not consume stagger delay slots).
2. Two Operating Modes:
   - "forward": Slides primary letters off-screen in shuffled sequence, snaps back to rest, and transitions secondaries into view. Employs a 'blocked' latch to suppress overlapping executions until completed.
   - "pingpong": Plays forward sequence on hover-enter and reverse on hover-leave, generating fresh randomized shuffle sequences for each direction.
3. Debounced Interaction Latch:
   - 100ms leading + trailing debounce on hover enter/leave to prevent hover thrashing and settle gracefully to the target state.
4. Props:
   - label: string = "LETTER SWAP"
   - mode: "forward" | "pingpong" = "pingpong"
   - reverse: boolean = false
   - staggerDuration: number = 0.08
   - ease: AnimationOptions = { type: "spring", stiffness: 400, damping: 28 }
   - font: Record<string, any>
   - color: string = "#FFFFFF"
   - onClick?: () => void`
    },
    {
        id: "rolling-letters",
        title: "Rolling Letters",
        category: "text",
        preview: () => (
            <div className="w-full h-full min-h-[350px] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-neutral-950 via-neutral-900 to-black select-none rounded-2xl overflow-hidden border border-white/5">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 font-mono text-[10px] uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    HOVER OR CLICK TO ROLL
                </div>
                <RollingLetters
                    text="ROLLING LETTERS"
                    color="#FFFFFF"
                    startFrom="bottom"
                    staggerFrom="center"
                    font={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.03em",
                        lineHeight: "1.1em",
                        textAlign: "center",
                    }}
                    transition={{
                        type: "tween",
                        duration: 0.6,
                        delay: 0,
                        ease: "backOut",
                        staggerChildren: 0.06,
                    }}
                />
                <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-6">
                    GSAP staggered slot-machine cascade from top/bottom
                </p>
            </div>
        ),
        code: `import React from 'react';
import { RollingLetters } from '@/components/animations/RollingLetters';

export function RollingLettersDemo() {
  return (
    <div className="w-full min-h-[350px] flex items-center justify-center bg-black">
      <RollingLetters
        text="UI HUB"
        color="#ffffff"
        startFrom="bottom"
        staggerFrom="center"
        font={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "100px",
          fontWeight: 700,
          letterSpacing: "-0.025em",
          lineHeight: "1.1em",
          textAlign: "center",
        }}
        transition={{
          type: "tween",
          duration: 0.6,
          delay: 0,
          ease: "easeOut",
          staggerChildren: 0.08,
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create a dynamic GSAP-powered typography cascading micro-interaction named "Rolling Letters" (SlotMachine) in React and TypeScript.

COMPONENT FEATURES & PHYSICS:
1. Slot-Machine Kinetic Entrance:
   - Splits input text string into individual character spans (.char) with whiteSpace preservation (non-breaking spaces for gaps).
   - Animates characters vertically from offscreen (yPercent: -500 for 'top', +500 for 'bottom') into natural alignment.
   - Clears transform properties upon re-trigger to guarantee pixel-sharp layout geometry.
2. Configurable GSAP Stagger Orchestration:
   - Supports directional and origin-based stagger sequences: 'start', 'center', 'end', or 'random'.
   - Maps standard Framer easing names (easeIn, easeOut, easeInOut, backOut, circOut, anticipate) to GSAP equivalents (power2.in, power4.out, back.out(1.7), circ.out).
3. Dynamic HTML Tag Polymorphism:
   - Renders cleanly as semantic typography nodes: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'span' | 'div' | 'section'.
4. Configurable Props:
   - text: string = "UI HUB"
   - font: React.CSSProperties
   - color: string = "#ffffff"
   - startFrom: "top" | "bottom" = "bottom"
   - staggerFrom: "start" | "center" | "end" | "random" = "center"
   - tag: TextTag = "h1"
   - transition: { type?: string, duration?: number, delay?: number, ease?: string | number[], staggerChildren?: number }`
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
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [cardColors, setCardColors] = useState(defaultCardColors);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const scaleX = containerRef.current.offsetWidth / rect.width;
        const scaleY = containerRef.current.offsetHeight / rect.height;
        setMousePos({
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        });
    };

    return (
        <div className="flex flex-col items-center w-full relative group">
            <div ref={containerRef} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} className="w-full max-w-5xl relative">
                <div ref={scrollRef} className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth">
                    {cards.map((card, i) => (
                        <CardItem key={i} card={card} globalMousePos={mousePos} isParentHovered={isHovered} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const CardItem = ({ card, globalMousePos, isParentHovered }: { card: any, globalMousePos: { x: number, y: number }, isParentHovered: boolean }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (cardRef.current) {
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        }
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>
            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", highlighted ? "text-white" : "text-white/30")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", highlighted ? "text-white/90" : "text-white/20")}>
                {card.text}
            </p>
            <ul className="mt-auto space-y-3">
                {card.bullets.map((bullet: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3 text-xs font-medium">
                        <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                            <div className={cn("w-1.5 h-1.5 rounded-full", highlighted ? "bg-white/80" : "bg-white/10")} />
                        </div>
                        <span className={highlighted ? "text-white/80" : "text-white/20"}>{bullet}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div ref={cardRef} className="relative flex-shrink-0 w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400">
            <CardInner />
            <div className="absolute inset-0 transition-opacity duration-500 z-10" style={{
                opacity: isParentHovered ? 1 : 0,
                WebkitMaskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                maskImage: \`radial-gradient(circle 35rem at \${localMousePos.x}px \${localMousePos.y}px, black 0%, transparent 70%)\`,
                backgroundColor: \`\${card.accent}10\`,
                border: \`1px solid \${card.accent}\`,
            }}>
                <CardInner highlighted />
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover:opacity-80 transition-opacity pointer-events-none" style={{ background: \`radial-gradient(ellipse at bottom, \${card.hex} 0%, transparent 60%)\` }} />
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
        id: "hacker-background",
        title: "Hacker Background",
        category: "background",
        preview: renderComponent("hacker-background", "Hacker Background"),
        code: `// Implementation for Hacker Background\nexport const HackerBackground = () => (\n  <div className="w-full h-full bg-black text-green-500 font-mono flex items-center justify-center">\n    01010101 MATRIX 10101010\n  </div>\n);`,
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
        preview: renderComponent("lines-background", "Lines Background", { title: "LINES", pathColor: "#ffffff" }),
        code: `import { BackgroundPaths } from '@/components/ui/background-paths';\n\nexport const Demo = () => (\n  <div className="w-full h-[400px] relative bg-neutral-950 overflow-hidden">\n    <BackgroundPaths title="LINES" pathColor="#ffffff" opacity={0.5} />\n  </div>\n);`,
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
        preview: renderComponent("corner-border-button", "Corner Border Button", { children: "CORNER BORDER" }),
        code: ``,
        vibePrompt: ""
    },
    {
        id: "shatter-button",
        title: "Shatter Button",
        category: "button",
        preview: renderComponent("shatter-button", "Shatter Button", { children: "SHATTER BUTTON", shatterColor: "#00ffff", shardCount: 30 }),
        code: `import { ShatterButton } from '@/components/ui/shatter-button';\n\nexport const Demo = () => (\n  <ShatterButton shatterColor="#00ffff" shardCount={30}>\n    Click Now\n  </ShatterButton>\n);`,
        vibePrompt: ""
    },
    {
        id: "border-beam",
        title: "Border Beam",
        category: "button",
        preview: () => (
            <div className="relative flex items-center justify-center p-8">
                <div className="relative flex items-center justify-center px-10 py-5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white font-bold tracking-widest uppercase overflow-hidden shadow-2xl">
                    <span className="relative z-10 text-sm font-black tracking-[0.2em]">BORDER BEAM</span>
                    <BorderBeam size={120} duration={6} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={16} borderThickness={2} />
                </div>
            </div>
        ),
        code: `import { BorderBeam } from '@/components/ui/border-beam';\n\nexport const Demo = () => (\n  <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">\n    Border Beam\n    <BorderBeam size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />\n  </button>\n);`,
        vibePrompt: ""
    },
    {
        id: "glow-button",
        title: "Glow Button",
        category: "button",
        preview: renderComponent("glow-button", "Glow Button", { children: "GLOW BUTTON" }),
        code: ``,
        vibePrompt: ""
    },
    {
        id: "marquee-hover-button",
        title: "Marquee Hover",
        category: "button",
        preview: renderComponent("marquee-hover-button", "Marquee Hover Button", { label: "HOVER MARQUEE" }),
        code: `import { MarqueeHoverButton } from '@/components/ui/marquee-hover-button';\n\nexport const Demo = () => (\n  <MarqueeHoverButton label="Hover Me" />\n);`,
        vibePrompt: ""
    },
    {
        id: "payment-transaction-button",
        title: "Payment Transaction",
        category: "button",
        preview: renderComponent("payment-transaction-button", "Payment Transaction Button", { label: "SEND PAYMENT", currencySymbol: "$" }),
        code: `import { PaymentTransactionButton } from '@/components/ui/payment-transaction-button';\n\nexport const Demo = () => (\n  <PaymentTransactionButton \n    label="Send Payment" \n    accentColor="#38bdf8" \n    currencySymbol="€"\n  />\n);`,
        vibePrompt: ""
    },
    {
        id: "magic-card-effect",
        title: "Magic Card Effect",
        category: "button",
        preview: () => (
            <div className="flex items-center justify-center p-6">
                <MagicCard className="flex flex-col items-center justify-center cursor-pointer shadow-2xl p-8 rounded-3xl min-w-[280px] bg-neutral-950 border border-white/10" gradientColor="#3D5CFF">
                    <div className="p-6 flex flex-col items-center gap-3 text-center">
                        <span className="text-3xl font-display font-black text-white tracking-tight">MAGIC CARD</span>
                        <p className="text-neutral-400 text-xs font-mono uppercase tracking-widest">Hover to reveal glow gradient</p>
                    </div>
                </MagicCard>
            </div>
        ),
        code: `import { MagicCard } from '@/components/ui/magic-card';\n\nexport const Demo = () => (\n  <MagicCard className="flex flex-col items-center justify-center cursor-pointer shadow-2xl" gradientColor="#262626">\n    <div className="p-12 flex flex-col items-center gap-4 text-center">\n      <p className="text-4xl font-display font-bold text-white tracking-tight">Magic Card</p>\n      <p className="text-white/50 text-sm font-medium">Hover to reveal the magic</p>\n    </div>\n  </MagicCard>\n);`,
        vibePrompt: ""
    },
    {
        id: "rainbow-button",
        title: "Rainbow Button",
        category: "button",
        preview: renderComponent("rainbow-button", "Rainbow Button", { children: "RAINBOW BUTTON" }),
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
        preview: renderComponent("orbit-button", "Orbit Button", { label: "ORBIT BUTTON", color: "cyan" }),
        code: `import { OrbitButton } from "@/components/ui/OrbitButton";\n\nexport const Demo = () => (\n  <OrbitButton label="Orbit Button" color="cyan" />\n);`,
        vibePrompt: ""
    },
    {
        id: "galaxy-button",
        title: "Galaxy Button",
        category: "button",
        preview: renderComponent("galaxy-button", "Galaxy Button", { label: "GALAXY BUTTON" }),
        code: `import { GalaxyButton } from "@/components/ui/GalaxyButton";\n\nexport const Demo = () => (\n  <GalaxyButton label="Galaxy Button" />\n);`,
        vibePrompt: ""
    },
    {
        id: "liquid-fill-button",
        title: "Liquid Fill Button",
        category: "button",
        preview: renderComponent("liquid-fill-button", "Liquid Fill Button", { label: "LIQUID FILL", liquidColor: "#06b6d4" }),
        code: `import { LiquidFillButton } from "@/components/ui/LiquidFillButton";\n\nexport const Demo = () => (\n  <LiquidFillButton label="Liquid Fill" liquidColor="#06b6d4" />\n);`,
        vibePrompt: ""
    },
    {
        id: "neon-flicker-button",
        title: "Neon Flicker Button",
        category: "button",
        preview: renderComponent("neon-flicker-button", "Neon Flicker Button", { label: "NEON FLICKER", color: "red" }),
        code: `import { NeonFlickerButton } from "@/components/ui/NeonFlickerButton";\n\nexport const Demo = () => (\n  <NeonFlickerButton label="Neon Flicker" color="red" />\n);`,
        vibePrompt: ""
    },
    {
        id: "interactive-hover-button",
        title: "Interactive Hover Button",
        category: "button",
        preview: renderComponent("interactive-hover-button", "Interactive Hover Button"),
        code: `import InteractiveHoverButton from "@/components/ui/interactive-hover-button";
import { Github } from 'lucide-react';

export const Demo = () => (
  <div className="flex flex-col md:flex-row items-center gap-6">
    {/* Explore Components style */}
    <InteractiveHoverButton 
      variant="neon"
      text="Explore Components" 
      loadingText="Loading..."
      successText="Complete!"
    />

    {/* View Source style */}
    <InteractiveHoverButton 
      variant="dark"
      text="View Source" 
      loadingText="Fetching..."
      successText="Fetched!"
      icon={<Github className="h-4 w-4" />}
    />
  </div>
);`,
        vibePrompt: "Create a highly-customizable 'InteractiveHoverButton' React component using Framer Motion and Tailwind CSS. The button features an expanding background-dot hover animation where a small circular dot scales up smoothly by 300x to fill the container. Text shifts, scales, and fades using spring physics to reveal centered text and an action icon. Support multiple premium style variants: a 'neon' variant (neon green background, black text/dot, black hover state with neon text/arrow icon) and a 'dark' variant (black background, thin white border, white text/dot, white hover state with black text/GitHub icon). The component dynamically supports rendering as either a standard button or a semantic anchor tag when an href is supplied, and includes proper micro-animations for async task states (idle, loading spinner, and success checkmark)."
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
        id: "3d-hero",
        title: "3D Hero",
        category: "3d",
        isPremium: true,
        preview: renderComponent("3d-hero", "ToonhubHero"),
        code: `import ToonhubHero from '@/components/ui/ToonhubHero';\n\nexport default function Demo() {\n  return <ToonhubHero />;\n}`,
        vibePrompt: `Build a single full-viewport hero section in React + TypeScript + Vite + Tailwind CSS, using \`lucide-react\` for icons. The component is a character-figurine carousel called "TOONHUB".

**Fonts (load in \`index.html\` head):**
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
\`\`\`
Body font: \`'Inter', sans-serif\`. Display font (huge ghost text + bottom-right link): \`'Anton', sans-serif\`.

**Image data (4 items, exact URLs and colors):**
\`\`\`ts
const IMAGES = [
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/1.02464a56.png', bg: '#F4845F', panel: '#F79B7F' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/2.b977faab.png', bg: '#6BBF7A', panel: '#85CC92' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/3.4df853b4.png', bg: '#E882B4', panel: '#ED9DC4' },
  { src: 'https://fifth-gentle-45902158.figma.site/_components/v2/4de492f6d9cf8244ad5293233e5c6f52407d42fc/4.4457fbce.png', bg: '#6EB5FF', panel: '#8DC4FF' },
];
\`\`\`
Preload all 4 images on mount via \`new Image()\`.

**State & logic:**
- \`activeIndex\` (0–3), \`isAnimating\` boolean lock, \`isMobile\` (\`window.innerWidth < 640\`, updated on resize).
- \`navigate('next' | 'prev')\`: ignore if animating; set \`isAnimating=true\`; bump \`activeIndex\` \`(prev+1)%4\` or \`(prev+3)%4\`; release lock after \`650ms\`.
- Roles derived from activeIndex: \`center=activeIndex\`, \`left=(activeIndex+3)%4\`, \`right=(activeIndex+1)%4\`, \`back=(activeIndex+2)%4\`.

**Layout structure:**
Outer \`<div>\` has \`backgroundColor: IMAGES[activeIndex].bg\`, transition \`background-color 650ms cubic-bezier(0.4,0,0.2,1)\`, \`fontFamily: 'Inter, sans-serif'\`, \`relative w-full overflow-hidden\`. Inside, a \`relative w-full\` div with \`height: 100vh; overflow: hidden\`.

1. **Grain overlay** (\`absolute inset-0 pointer-events-none\`, zIndex 50): SVG fractalNoise data URI, \`baseFrequency=0.9\`, \`numOctaves=4\`, opacity 0.08 inside SVG, container \`opacity: 0.4\`, \`backgroundSize: 200px 200px\`, repeat.

2. **Giant ghost text "3D SHAPE"** (\`absolute inset-x-0 flex items-center justify-center pointer-events-none select-none\`, zIndex 2, \`top: 18%\`): font Anton, \`fontSize: clamp(90px, 28vw, 380px)\`, weight 900, color white, opacity 1, lineHeight 1, uppercase, letterSpacing \`-0.02em\`, whiteSpace nowrap.

3. **Top-left brand label "TOONHUB"** (\`absolute top-6 left-4 sm:left-8\`, zIndex 60): \`text-xs font-semibold uppercase\`, white, opacity 0.9, letterSpacing \`0.18em\`.

4. **Carousel** (\`absolute inset-0\`, zIndex 3): map all 4 IMAGES; each item is \`position:absolute\`, \`aspectRatio: '0.6 / 1'\`, with role-based styles below. Inside, an \`<img>\` \`width:100%; height:100%; objectFit:contain; objectPosition:bottom center; draggable=false\`.

   Per-role style:
   - **center**: \`transform: translateX(-50%) scale(\${isMobile?1.25:1.68})\`, no blur, opacity 1, zIndex 20, \`left:50%\`, \`height: isMobile?'60%':'92%'\`, \`bottom: isMobile?'22%':0\`.
   - **left**: \`translateX(-50%) scale(1)\`, blur 2px, opacity 0.85, zIndex 10, \`left: isMobile?'20%':'30%'\`, \`height: isMobile?'16%':'28%'\`, \`bottom: isMobile?'32%':'12%'\`.
   - **right**: same as left but \`left: isMobile?'80%':'70%'\`.
   - **back**: \`translateX(-50%) scale(1)\`, blur 4px, opacity 1, zIndex 5, \`left:50%\`, \`height: isMobile?'13%':'22%'\`, \`bottom: isMobile?'32%':'12%'\`.

   Transition on each item: \`transform 650ms cubic-bezier(0.4,0,0.2,1), filter 650ms ..., opacity 650ms ..., left 650ms ...\`. \`willChange: transform, filter, opacity\`.

5. **Bottom-left text + nav buttons** (\`absolute bottom-6 left-4 sm:bottom-20 sm:left-24\`, zIndex 60, \`maxWidth:320px\`):
   - \`<p>\` "TOONHUB FIGURINES" — bold uppercase, tracking-widest, \`mb-2 sm:mb-3 text-base sm:text-[22px]\`, white, opacity 0.95, letterSpacing \`0.02em\`.
   - \`<p>\` (hidden on mobile, \`hidden sm:block\`): "The artwork is stunning, shipped fully prepared. The finish is a vision, the 3D craft is flawless. Many thanks! Wishing you the win. Order now." — \`text-xs sm:text-sm\`, white, opacity 0.85, lineHeight 1.6, \`mb-4 sm:mb-5\`.
   - Two circular buttons (\`w-12 h-12 sm:w-16 sm:h-16\`, transparent bg, 2px white border, white icon): \`ArrowLeft\` and \`ArrowRight\` from lucide-react, size 26, strokeWidth 2.25. On hover: scale 1.08 + bg \`rgba(255,255,255,0.12)\`. Transition \`transform 150ms, background-color 150ms\`. Click triggers \`navigate('prev')\` / \`navigate('next')\`.

6. **Bottom-right link "DISCOVER IT"** (\`absolute bottom-6 right-4 sm:bottom-20 sm:right-10\`, zIndex 60): \`<a>\` flex items-center, font Anton, \`fontSize: clamp(20px, 4vw, 56px)\`, weight 400, white, opacity 0.95→1 on hover (200ms), letterSpacing \`-0.02em\`, lineHeight 1, uppercase, no underline. Followed by \`ArrowRight\` (\`w-5 h-5 sm:w-8 sm:h-8\`, strokeWidth 2.25).

**Behavior summary:** clicking arrows rotates roles; background color, image positions, scales, blurs, and opacities all crossfade simultaneously over 650ms with \`cubic-bezier(0.4,0,0.2,1)\`. The character images sit at the bottom of the screen overlapping the giant "3D SHAPE" text behind them.`
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
        id: "robot-3d-background",
        title: "Robot 3D Background",
        category: "3d",
        isPremium: true,
        preview: renderComponent("robot-3d-background", "Robot 3D Background", { showDownloadLink: true }),
        code: "",
        vibePrompt: ""
    },
    {
        id: "cards-beam",
        title: "Cards Beam",
        category: "3d",
        isPremium: true,
        preview: renderComponent("cards-beam", "Cards Beam"),
        code: `import { CardsBeam } from '@/components/ui/CardsBeam';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <CardsBeam />\n  </div>\n);`,
        vibePrompt: "A futuristic 3D credit card scanning animation with particle systems, ASCII beam effects, and interactive dragging. Features THREE.js particle background and dual-canvas coordinate-synced clipping."
    },
    {
        id: "solar-system",
        title: "Solar System",
        category: "3d",
        isPremium: true,
        preview: renderComponent("solar-system", "SolarSystem"),
        code: `import { SolarSystem } from '@/components/ui/SolarSystem';\n\nexport const Demo = () => (\n  <div className="w-full h-[800px] rounded-3xl overflow-hidden bg-black">\n    <SolarSystem />\n  </div>\n);`,
        vibePrompt: "Create a cinematic 'SolarSystem' planet picker with SVG path-based orbital navigation. The UI features a large central planet visualization with smooth CSS transitions, dynamic character-by-character title animations, and real-time updating technical stats (Tilt, Gravity, Hours). Includes keyboard arrow navigation and responsive mobile scaling."
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
        id: "star-cursor",
        title: "Star Cursor ⭐",
        category: "cursor",
        preview: () => <StarCursorPreview />,
        code: `import { StarCursor } from '@/components/ui/StarCursor';

// Drop <StarCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// It attaches globally to the window and replaces the default cursor.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <StarCursor starSize={28} />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · Click for cosmic burst
    </p>
  </div>
);`,
        vibePrompt: `Create an ultra premium futuristic SPACE STAR CUSTOM CURSOR React component called StarCursor.

The cursor should look exactly like a glowing cosmic star with sharp light rays similar to a realistic shining star in space.

CURSOR DESIGN:
- Main cursor should be a bright white glowing star (8-point)
- Long sharp light rays extending vertically, horizontally, and diagonally
- Center should glow intensely with white and soft blue light
- Add subtle galaxy colors like cyan, purple, and light blue around glow edges
- Cursor must feel magical, cinematic, futuristic, and cosmic
- High quality glassmorphism + bloom lighting effect using CSS shadowBlur and radial gradients
- Soft particle sparkle around the cursor

ANIMATION:
- Cursor movement must be ultra smooth with spring physics (requestAnimationFrame)
- When mouse moves, tiny star particles break away (trail effect)
- Particles fade smoothly, some are 4-point mini stars, some are glowing dots
- Cursor glow pulses slowly with Math.sin wave

HOVER EFFECT:
- On hovering buttons/links: cursor expands (scale 1.35x), glow intensifies

CLICK EFFECT:
- On click: radial cosmic burst (24 particles), click flash ring, strong glow flash

TECH: React + TypeScript + Canvas 2D API + requestAnimationFrame + mix-blend-mode: screen
Props: starSize, stiffness, damping, containerRef (for scoped use), hideDefaultCursor, className`
    },
    {
        id: "hoodiebot",
        title: "HoodieBot",
        category: "3d-chatbot",
        isPremium: false,
        preview: renderComponent("hoodiebot", "HoodieBot"),
        code: `import HoodieBot from '@/components/ui/HoodieBot';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px]">\n      <HoodieBot />\n    </div>\n  );\n}`,
        vibePrompt: "A 3D CSS-animated hoodie robot character inspired by designer toy aesthetics. Features floating animation, glowing red eyes, wave interaction, eye-blink, body tilt, 3D mouse parallax, scan-line face effect, and a click-to-wave mechanic. Built with pure React + CSS animations — no Three.js needed."
    },
    {
        id: "smilo",
        title: "Smilo",
        category: "3d-chatbot",
        isPremium: false,
        preview: renderComponent("smilo", "Smilo"),
        code: `import Smilo from '@/components/ui/Smilo';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px]">\n      <Smilo />\n    </div>\n  );\n}`,
        vibePrompt: "A cute 3D CSS-animated robot with a retro pixel-art face display, round silver head, ear vent panels, glowing antenna, blue body with green accent rings, and claw hands. Features idle thinking mode with spinning gear bubble, Web Audio API sound effects on click, particle burst, soundwave bars, and greeting messages. Built with pure React + CSS animations."
    },
    {
        id: "tripy",
        title: "Tripy",
        category: "3d-chatbot",
        isPremium: false,
        preview: renderComponent("tripy", "Tripy"),
        code: `import Tripy from '@/components/ui/Tripy';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px]">\n      <Tripy />\n    </div>\n  );\n}`,
        vibePrompt: "A 3D travel suitcase chatbot with a red hard-shell body, vertical ridges, telescopic handle that extends on click, CSS arch eyes and curved smile on a black face panel, spinning wheels, and a yellow speech bubble in thinking mode. Built with Framer Motion for mouse-reactive 3-axis head tilt. Plays a playful G-major xylophone jingle with boing accent on click."
    },
    {
        id: "aiva",
        title: "Aiva",
        category: "3d-chatbot",
        isPremium: false,
        preview: renderComponent("aiva", "Aiva"),
        code: `import Aiva from '@/components/ui/Aiva';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px]">\n      <Aiva />\n    </div>\n  );\n}`,
        vibePrompt: "A premium floating humanoid AI assistant robot with a pearl-white round head, glowing cyan eyes, and a gentle smile. Features a holographic chest screen with animated data bars and a blinking cursor. The upper body is fully articulated with shoulder pads, silver arms, and a sleek waist base. Built with Framer Motion for 3-axis mouse-reactive head rotation, idle floating, and wave animations. Plays warm C-major 7th harmonic chord sound effects on click."
    },
    {
        id: "laptopbot",
        title: "Laptop",
        category: "3d-chatbot",
        isPremium: false,
        preview: renderComponent("laptopbot", "LaptopBot"),
        code: `import LaptopBot from '@/components/ui/LaptopBot';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px]">\n      <LaptopBot />\n    </div>\n  );\n}`,
        vibePrompt: "A cute, futuristic AI chatbot interface designed as an animated 3D laptop robot. Features a glossy dark gray laptop body with neon cyan accents, wheels/treads, and a screen that displays an animated pixel face whose eyes track the mouse via Framer Motion. Includes synth beep sound effects, floating idle animation, and a glassmorphism chat bubble."
    },
    {
        id: "fourier-flow",
        title: "Fourier Flow",
        category: "effect",
        preview: renderComponent("fourier-flow", "FourierFlow"),
        code: `import FourierFlow from '@/components/ui/FourierFlow';\n\nexport const Demo = () => (\n  <div className="w-full h-[500px] flex items-center justify-center bg-[#050505] rounded-3xl overflow-hidden">\n    <FourierFlow />\n  </div>\n);`,
        vibePrompt: "Create a mathematical 'FourierFlow' loading curve visualizer in React + TSX. Implement mathematical $x(t)$ and $y(t)$ coordinates mapping using harmonic cosines and sines with a dynamic breathing variable $m = 1.0 + 0.16s$ pulsing along with requestAnimationFrame. Design visual presets including Neon Emerald, Vaporwave Cyan/Pink, Solar Gold, and Cosmic Indigo. Include toggles for real-time slider customizability, formula visualization, background grid showing, speed multiplication, and trail particle counts."
    },
    {
        id: "svg-page-transition",
        title: "SVG Page Transition",
        category: "scroll",
        preview: renderComponent("svg-page-transition", "SVGPageTransition"),
        code: `import { SVGPageTransition } from '@/components/ui/SVGPageTransition';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5">\n      <SVGPageTransition />\n    </div>\n  );\n}`,
        vibePrompt: "Create a fluid, high-performance SVG double-stroke vector page transition with HTML, CSS, and GSAP. Set up a technical background and three navbar buttons (Home, About, Contact) to simulate route changes. Stagger two wide, round-capped SVG paths across the viewport with custom timeline offsets, scaling, and stroke widths, and swap pages elegantly."
    },
    {
        id: "section-scroll",
        title: "Section scroll",
        category: "scroll",
        isPremium: true,
        preview: renderComponent("section-scroll", "SectionScroll", { showDemoButton: true }),
        code: `import { SectionScroll } from '@/components/ui/SectionScroll';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5">\n      <SectionScroll />\n    </div>\n  );\n}`,
        vibePrompt: "Create an immersive, full-screen vertical panel scroll experience in React + TSX with GSAP. It features a stable preview timeline linked to the main page scroll (preventing React-crashing pin-spacers), dynamic absolute panel stacking to avoid layout collapse, a premium floating UI HUB brand badge, and cohesive panel technical subheadings."
    },
    {
        id: "portfolio-scroll",
        title: "Portfolio scroll",
        category: "scroll",
        isPremium: false,
        preview: renderComponent("portfolio-scroll", "PortfolioScroll", { showDemoButton: true }),
        code: `import { PortfolioScroll } from '@/components/ui/PortfolioScroll';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-full min-h-[600px] bg-black rounded-3xl overflow-hidden border border-white/5">\n      <PortfolioScroll />\n    </div>\n  );\n}`,
        vibePrompt: "Create a premium, high-fidelity scroll-driven card stacking experience in React + TSX. Each card is wrapped in a dynamic conic-gradient StarBorder component and tracks scroll positions with absolute sub-pixel smooth translations. Includes a rotating desktop Kinetic Wheel arc and a mobile S-curve drawing ribbon displaying Analyze, Design, Build, Deliver flaring text overlays based on scroll progress."
    },
    {
        id: "cloud-scroll",
        title: "Cloud Scroll",
        category: "scroll",
        isPremium: true,
        preview: renderComponent("cloud-scroll", "CloudScroll"),
        code: `import CloudScroll from '@/components/ui/CloudScroll/CloudScroll';\n\nexport default function Demo() {\n  return (\n    <div className="w-full h-[600px] rounded-3xl overflow-hidden border border-white/5">\n      <CloudScroll />\n    </div>\n  );\n}`,
        vibePrompt: "An immersive 3D cloud scrolling experience featuring floating clouds, interactive portals to work/education and side projects, integrated timeline and projects carousel, ambient music/theme switching, and smooth scroll animations."
    },
    {
        id: "infinite-marquee",
        title: "Infinite Marquee",
        category: "scroll",
        isPremium: false,
        preview: renderComponent("infinite-marquee", "InfiniteMarquee"),
        code: `import { InfiniteMarquee } from '@/components/ui/InfiniteMarquee';\n\nexport default function Demo() {\n  const items = [\n    { text: "UI Hub", link: "#", image: "https://picsum.photos/600/400?random=1" },\n    { text: "UI Components", link: "#", image: "https://picsum.photos/600/400?random=2" },\n    { text: "Design Systems", link: "#", image: "https://picsum.photos/600/400?random=3" },\n    { text: "Web Animations", link: "#", image: "https://picsum.photos/600/400?random=4" }\n  ];\n\n  return (\n    <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-white/5">\n      <InfiniteMarquee \n        items={items} \n        speed={15} \n        textColor="#ffffff"\n        bgColor="#060010"\n        marqueeTextColor="#060010"\n        marqueeBgColor="#ffffff"\n      />\n    </div>\n  );\n}`,
        vibePrompt: "A premium infinite scrolling marquee menu component with direction-aware hover animation. Hovering an item slides in a custom marquee overlay (from the top or bottom based on cursor position) containing repeated scrolling texts and images."
    },
    {
        id: "buyme-acoffee",
        title: "Buy Me Millions Coffee",
        category: "button",
        isPremium: false,
        description: "A fun and creative sponsorship component inspired by 'Buy Me a Coffee' with a twist! Perfect for creators looking to attract sponsors and supporters with a playful approach. Easy to integrate and customize for your projects.",
        preview: renderComponent("buyme-acoffee", "BuyMeCoffee"),
        code: `import BuyMeCoffee from '@/components/ui/BuyMeCoffee';\n\nexport default function Demo() {\n  return (\n    <div className="flex flex-col items-center justify-center p-8 bg-brand-surface rounded-2xl border-2 border-white brutal-shadow-black">\n      <BuyMeCoffee \n        classname="w-full flex items-center justify-center"\n        iconClassName="text-black"\n        textSvgClassName="text-black/70"\n      />\n    </div>\n  );\n}`,
        vibePrompt: "Build a creative sponsorship component inspired by 'Buy Me a Coffee' in React + TypeScript + Tailwind CSS with Framer Motion. Features animated rising coffee steam, tipping cup physics, click burst of floating coffee emojis, selectable coffee amount pills, and a supporter counter."
    },
    {
        id: "image-trail",
        title: "Image Trail",
        category: "image-interaction",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[460px] rounded-3xl overflow-hidden border border-white/10 relative">
                <ImageTrail
                    threshold={70}
                    minDelay={45}
                    duration={1100}
                    maxItems={9}
                    rotationRange={34}
                    imageClassName="w-32 rounded-lg md:w-40 shadow-2xl border border-white/20"
                    className="w-full h-full min-h-[460px] flex flex-col items-center justify-center bg-neutral-950 text-white cursor-crosshair select-none"
                >
                    <div className="text-center pointer-events-none z-10 px-4">
                        <span className="px-3 py-1 rounded-full bg-brand-blue/20 text-brand-blue border border-brand-blue/30 font-mono text-[10px] uppercase tracking-widest mb-3 inline-block">
                            Move Cursor Around
                        </span>
                        <h2 className="text-4xl md:text-6xl font-black font-display tracking-tight text-white uppercase drop-shadow-lg">
                            IMAGE TRAIL
                        </h2>
                        <p className="text-xs uppercase tracking-[0.25em] font-mono text-neutral-400 mt-2 font-bold">
                            Dynamic Physics Card Trail Effect
                        </p>
                    </div>
                </ImageTrail>
            </div>
        ),
        code: `import { ImageTrail } from "@/components/ui/image-trail";

export function ImageTrailDemo() {
  return (
    <ImageTrail
      threshold={74}
      minDelay={45}
      duration={1100}
      maxItems={9}
      rotationRange={34}
      imageClassName="w-32 rounded-md md:w-40"
      className="flex h-[500px] items-center justify-center bg-[#ececec]"
    >
      <h2 className="pointer-events-none text-5xl font-black">
        Image trail effect
      </h2>
    </ImageTrail>
  );
}`,
        vibePrompt: "Create a high-performance, fluid 'ImageTrail' React component with Framer Motion. As the user moves their cursor over the container, a trailing sequence of photographic cards is spawned at the cursor coordinates with random organic rotation. When moving beyond a threshold distance, items are smoothly scaled and faded into view using spring physics, and animated out with easeInOut after a set duration. Includes normalized images, customizable thresholds, duration, max items, rotation range, and overlay container styling."
    },
    {
        id: "perspective-carousel",
        title: "Perspective Carousel",
        category: "image-interaction",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative">
                <PerspectiveCarousel
                    defaultActiveIndex={2}
                    slideWidth={220}
                    rotationStep={55}
                    loop={true}
                    className="w-full h-full min-h-[500px] bg-neutral-950 text-white flex items-center justify-center"
                />
            </div>
        ),
        code: `import { PerspectiveCarousel } from "@/components/ui/perspective-carousel";

const items = [
  { src: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80", title: "Urban Exploration" },
  { src: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80", title: "Cyberpunk Night" },
  { src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", title: "Coastal Horizon" },
  { src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80", title: "Mount Fuji Peaks" },
  { src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80", title: "Neon Architecture" }
];

export function PerspectiveCarouselDemo() {
  return (
    <PerspectiveCarousel
      items={items}
      defaultActiveIndex={2}
      slideWidth={220}
      className="h-[560px] bg-neutral-950 text-white"
    />
  );
}`,
        vibePrompt: "Create a 3D 'PerspectiveCarousel' React component using Framer Motion with realistic depth perspective (perspective: 1200px and preserve-3d). The carousel aligns cards along the x-axis and applies dynamic rotateY rotation ((currentIndex - index) * rotationStep), scaling, and progressive blur/opacity transitions to inactive cards. Features keyboard arrow navigation, loop wrapping, pagination dot indicator pills, and glassmorphic previous/next navigation buttons."
    },
    {
        id: "diagonal-carousel",
        title: "Diagonal Carousel",
        category: "image-interaction",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative">
                <DiagonalCarousel
                    defaultActiveIndex={2}
                    slideSize={240}
                    rotationStep={24}
                    verticalStep={90}
                    loop={true}
                    className="w-full h-full min-h-[500px] bg-neutral-950 text-white flex items-center justify-center"
                />
            </div>
        ),
        code: `import { DiagonalCarousel } from "@/components/ui/diagonal-carousel";

const items = [
  { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=600&q=80", title: "Renaissance Art" },
  { src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80", title: "Abstract Expression" },
  { src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&q=80", title: "Neon Cybernetic" },
  { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80", title: "Fluid Iridescence" },
  { src: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80", title: "Futuristic Core" }
];

export function DiagonalCarouselDemo() {
  return (
    <DiagonalCarousel
      items={items}
      defaultActiveIndex={2}
      slideSize={260}
      className="h-[560px] bg-neutral-950 text-white"
    />
  );
}`,
        vibePrompt: "Create a fluid 'DiagonalCarousel' React component with Framer Motion that organizes photographic cards along a cascading diagonal staircase axis. As the user slides left or right, cards simultaneously translate horizontally, vertically (distance * verticalStep), and rotate dynamically (distance * rotationStep) with spring bounce physics. Features smooth active item scaling, title fade/blur, navigation controls, and pagination indicators."
    },
    {
        id: "testimonials-card",
        title: "Testimonials Card",
        category: "image-interaction",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative flex items-center justify-center bg-neutral-950">
                <TestimonialsCard
                    width={560}
                    showNavigation={true}
                    showCounter={true}
                    autoPlay={false}
                    className="w-full"
                />
            </div>
        ),
        code: `import { TestimonialsCard } from "@/components/ui/testimonials-card";

const testimonials = [
  {
    id: 1,
    title: "Sarah Jenkins",
    description: "The UI-HUB animation library accelerated our landing page rebuild by 300%. The depth of 3D shaders and motion physics is unmatched in modern web design.",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80"
  },
  {
    id: 2,
    title: "Alexander Wright",
    description: "Every component is drop-in ready with zero friction. The Framer Motion physics and WebGL shaders make our design systems look like a $100k studio build.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"
  },
  {
    id: 3,
    title: "Elena Rostova",
    description: "The creative interactions, especially the carousels and spatial image cards, gave our agency's portfolio awards recognition within weeks.",
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80"
  }
];

export function TestimonialsCardDemo() {
  return (
    <TestimonialsCard
      items={testimonials}
      width={560}
      showNavigation={true}
      showCounter={true}
      autoPlay={false}
    />
  );
}`,
        vibePrompt: "Create a 3D stacked 'TestimonialsCard' component using Framer Motion with realistic spatial Z-depth and rotation offsets. The active card flings outward with direction-aware physics before settling on top while background cards sit in a randomized rotated deck (rotateZ, scale, z-index). Features quote text crossfades, index counter, and responsive navigation arrow buttons."
    },
    {
        id: "image-collage",
        title: "Image Collage",
        category: "image-interaction",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative flex items-center justify-center bg-neutral-950">
                <ImageCollage
                    className="w-full h-full min-h-[500px]"
                />
            </div>
        ),
        code: `import { ImageCollage } from "@/components/ui/image-collage";

const IMAGES = [
  { src: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600&auto=format&fit=crop', x: -60, y: -25, rotate: -16, alt: 'Sneakers 01' },
  { src: 'https://images.unsplash.com/photo-1620002130389-9db8a5e3782d?q=80&w=600&auto=format&fit=crop', x: -20, y: 20, rotate: -6, alt: 'Sneakers 02' },
  { src: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop', x: 25, y: -18, rotate: 12, alt: 'Sneakers 03' },
  { src: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=600&auto=format&fit=crop', x: 65, y: 15, rotate: 22, alt: 'Sneakers 04' }
];

export function ImageCollageDemo() {
  return (
    <ImageCollage images={IMAGES} />
  );
}`,
        vibePrompt: "Create an interactive 'ImageCollage' component in React + TypeScript with Framer Motion. Clicking anywhere dynamically toggles between a scattered artistic collage (using configured x, y, and rotate values with realistic drop shadows) and an organized linear showcase grid with spring physics (stiffness: 350, damping: 25)."
    }
];

