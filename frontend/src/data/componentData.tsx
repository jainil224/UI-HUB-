import { LOVABLE_PROMPTS } from './lovablePrompts';
import { ANTIGRAVITY_PROMPTS } from './antigravityPrompts';
import React, { useRef, useCallback, useState, useEffect, Suspense } from 'react';
import uiHubLogo from '../Assets/webiste logo.svg';

// ── Lazy Loaded UI Components ──────────────────
const AuroraCursor = React.lazy(() => import('../components/ui/AuroraCursor').then(m => ({ default: m.AuroraCursor })));
const MagneticCursor = React.lazy(() => import('../components/ui/MagneticCursor').then(m => ({ default: m.MagneticCursor })));
const MagneticBackground = React.lazy(() => import('../components/ui/MagneticBackground').then(m => ({ default: m.MagneticBackground })));
const BlackHoleCursor = React.lazy(() => import('../components/ui/BlackHoleCursor').then(m => ({ default: m.BlackHoleCursor })));
const TargetCursor = React.lazy(() => import('../components/ui/TargetCursor').then(m => ({ default: m.TargetCursor })));
const SpaceBackground = React.lazy(() => import('../components/ui/SpaceBackground').then(m => ({ default: m.SpaceBackground })));
const GravitationalVortex = React.lazy(() => import('../components/ui/GravitationalVortex'));
const BlackHoleBackground = React.lazy(() => import('../components/ui/BlackHoleBackground').then(m => ({ default: m.BlackHoleBackground })));
const MouseGravityBackground = React.lazy(() => import('../components/ui/MouseGravityBackground').then(m => ({ default: m.MouseGravityBackground })));
const Scroll3DAnimation = React.lazy(() => import('../components/ui/Scroll3DAnimation'));
const ThreeDSlider = React.lazy(() => import('../components/ui/ThreeDSlider'));
export const RubiksCube = React.lazy(() => import('../components/ui/RubiksCube'));
const HeartCursor = React.lazy(() => import('../components/ui/HeartCursor').then(m => ({ default: m.HeartCursor })));
const LizardCursor = React.lazy(() => import('../components/ui/LizardCursor').then(m => ({ default: m.LizardCursor })));
const VenomCursor = React.lazy(() => import('../components/ui/VenomCursor').then(m => ({ default: m.VenomCursor })));
const StarCursor = React.lazy(() => import('../components/ui/StarCursor').then(m => ({ default: m.StarCursor })));
const AsciiCursor = React.lazy(() => import('../components/ui/AsciiCursor').then(m => ({ default: m.AsciiCursor })));
const AuraCursor = React.lazy(() => import('../components/ui/AuraCursor').then(m => ({ default: m.AuraCursor })));
const ParticleCursor = React.lazy(() => import('../components/ui/ParticleCursor').then(m => ({ default: m.ParticleCursor })));
const KineticGrid = React.lazy(() => import('../components/ui/KineticGrid').then(m => ({ default: m.KineticGrid })));
const MagicCursor = React.lazy(() => import('../components/ui/MagicCursor').then(m => ({ default: m.MagicCursor })));
const UserCursor = React.lazy(() => import('../components/ui/UserCursor').then(m => ({ default: m.UserCursor })));
const CardCascade = React.lazy(() => import('../components/ui/CardCascade').then(m => ({ default: m.CardCascade })));

const CardsBeam = React.lazy(() => import('../components/ui/CardsBeam'));
const SolarSystem = React.lazy(() => import('../components/ui/SolarSystem'));
const ToonhubHero = React.lazy(() => import('../components/ui/ToonhubHero'));
const FourierFlow = React.lazy(() => import('../components/ui/FourierFlow'));
const SVGPageTransition = React.lazy(() => import('../components/ui/SVGPageTransition').then(m => ({ default: m.SVGPageTransition })));
const SectionScroll = React.lazy(() => import('../components/ui/SectionScroll').then(m => ({ default: m.SectionScroll })));
const CloudScroll = React.lazy(() => import('../components/ui/CloudScroll/CloudScroll'));
const InfiniteMarquee = React.lazy(() => import('../components/ui/InfiniteMarquee').then(m => ({ default: m.InfiniteMarquee })));
const HackerBackground = React.lazy(() => import('../components/ui/HackerBackground'));
const BeamGridBackground = React.lazy(() => import('../components/ui/BeamGridBackground'));
const FallBeamBackground = React.lazy(() => import('../components/ui/FallBeamBackground'));
const HellBackground = React.lazy(() => import('../components/ui/HellBackground'));
const InteractiveGridBackground = React.lazy(() => import('../components/ui/InteractiveGridBackground'));
const WaveBackground = React.lazy(() => import('../components/ui/WaveBackground'));
const CornerBorderButton = React.lazy(() => import('../components/ui/corner-border-button').then(m => ({ default: m.CornerBorderButton })));
const CornerButton = React.lazy(() => import('../components/ui/corner-button').then(m => ({ default: m.CornerButton })));
const CreepyButton = React.lazy(() => import('../components/ui/creepy-button').then(m => ({ default: m.CreepyButton })));
const RadialGlowButton = React.lazy(() => import('../components/ui/radial-glow-button').then(m => ({ default: m.RadialGlowButton })));
const SpiderWeb = React.lazy(() => import('../components/ui/spider-web'));
const SpiralImages = React.lazy(() => import('../components/ui/spiral-images'));
const InfinityImage = React.lazy(() => import('../components/ui/infinity-image'));
const InteractiveHoverButton = React.lazy(() => import('../components/ui/interactive-hover-button'));
const IsometricGridBackground = React.lazy(() => import('../components/ui/isometric-grid-background').then(m => ({ default: m.IsometricGridBackground })));
const MagicCard = React.lazy(() => import('../components/ui/magic-card').then(m => ({ default: m.MagicCard })));
const MarqueeHoverButton = React.lazy(() => import('../components/ui/marquee-hover-button').then(m => ({ default: m.MarqueeHoverButton })));
const PaymentTransactionButton = React.lazy(() => import('../components/ui/payment-transaction-button').then(m => ({ default: m.PaymentTransactionButton })));
const RainbowButton = React.lazy(() => import('../components/ui/rainbow-button').then(m => ({ default: m.RainbowButton })));
const SparklesBackground = React.lazy(() => import('../components/ui/sparkles-background').then(m => ({ default: m.SparklesBackground })));
const BackgroundBoxes = React.lazy(() => import('../components/ui/background-boxes').then(m => ({ default: m.BoxesCore })));
const BackgroundPaths = React.lazy(() => import('../components/ui/background-paths').then(m => ({ default: m.BackgroundPaths })));
const BorderBeam = React.lazy(() => import('../components/ui/border-beam').then(m => ({ default: m.BorderBeam })));
const GlowButton = React.lazy(() => import('../components/ui/GlowButton'));
const GalaxyButton = React.lazy(() => import('../components/ui/GalaxyButton').then(m => ({ default: m.GalaxyButton })));
const OrbitButton = React.lazy(() => import('../components/ui/OrbitButton').then(m => ({ default: m.OrbitButton })));
const SocialTooltipButtons = React.lazy(() => import('../components/animations/SocialTooltipButtons').then(m => ({ default: m.SocialTooltipButtons })));
const ImageTrail = React.lazy(() => import('../components/ui/image-trail').then(m => ({ default: m.ImageTrail })));
const PerspectiveCarousel = React.lazy(() => import('../components/ui/perspective-carousel').then(m => ({ default: m.PerspectiveCarousel })));
const DiagonalCarousel = React.lazy(() => import('../components/ui/diagonal-carousel').then(m => ({ default: m.DiagonalCarousel })));
const TestimonialsCard = React.lazy(() => import('../components/ui/testimonials-card').then(m => ({ default: m.TestimonialsCard })));
const ImageCollage = React.lazy(() => import('../components/ui/image-collage').then(m => ({ default: m.ImageCollage })));
const PointDNAHelix = React.lazy(() => import('../components/ui/PointDNAHelix'));
const TwinGalaxyRings = React.lazy(() => import('../components/ui/TwinGalaxyRings'));
const Tornado = React.lazy(() => import('../components/ui/Tornado'));
const ParticleSphere = React.lazy(() => import('../components/ui/ParticleSphere'));
const BlackHole3d = React.lazy(() => import('../components/ui/BlackHole'));
const BloomingFlower = React.lazy(() => import('../components/ui/BloomingFlower'));
const Chandelier = React.lazy(() => import('../components/ui/Chandelier'));
const MorphingRings = React.lazy(() => import('../components/ui/MorphingRings'));
const BlockDrift = React.lazy(() => import('../components/ui/BlockDrift'));
const Lightfall = React.lazy(() => import('../components/ui/Lightfall'));
const IsometricPortal = React.lazy(() => import('../components/ui/IsometricPortal'));
const MorphingGlow = React.lazy(() => import('../components/ui/MorphingGlow'));
const GearSystem = React.lazy(() => import('../components/ui/GearSystem'));
const Hourglass = React.lazy(() => import('../components/ui/Hourglass'));
const GeneratingOrb = React.lazy(() => import('../components/ui/GeneratingOrb'));
const TradingCandles = React.lazy(() => import('../components/ui/TradingCandles'));
const PixelBounce = React.lazy(() => import('../components/ui/PixelBounce'));
const GradientOrb = React.lazy(() => import('../components/ui/GradientOrb'));
const SuperMario = React.lazy(() => import('../components/ui/SuperMario'));




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
    RollingLetters,
    ScrambleText,
    ScrollHighlight,
    SmokyText,
    RotatingText,
    TextPath,
    VaporizeTextCycle
} from '../components/animations/TextAnimations';

// ── Text Vaporize scoped preview ─────────────────
const VaporizeTextPreview: React.FC = () => {
    const [spread, setSpread] = useState(20);
    const [order, setOrder] = useState<"together" | "left-to-right" | "right-to-left">("left-to-right");
    const [textColor, setTextColor] = useState("#FFFFFF");
    const colors = ["#FFFFFF", "#38BDF8", "#F43F5E", "#A855F7", "#34D399", "#FBBF24"];

    return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-neutral-950 select-none rounded-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSpread(s => s === 10 ? 20 : s === 20 ? 35 : 10)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Spread: {spread}
                    </button>
                    <button
                        onClick={() => setOrder(o => o === "left-to-right" ? "together" : o === "together" ? "right-to-left" : "left-to-right")}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Order: {order}
                    </button>
                </div>
                <div className="flex items-center gap-1.5">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setTextColor(c)}
                            className="w-4 h-4 rounded-full transition-transform hover:scale-125 border border-white/20"
                            style={{ backgroundColor: c, outline: textColor === c ? '2px solid white' : 'none' }}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center pt-8">
                <VaporizeTextCycle
                    texts={["UI HUB", "VAPORIZE", "PARTICLES", "CREATIVE"]}
                    spread={spread}
                    density={10}
                    color={textColor}
                    alignment="center"
                    font={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontWeight: 700,
                        fontSize: 64,
                        letterSpacing: 1,
                    }}
                    appear={{
                        mode: "particle",
                        order,
                        transition: { duration: 1, ease: "easeOut" },
                    }}
                    disappear={{
                        mode: "particle",
                        order,
                        transition: { duration: 1.6, ease: "easeOut", delay: 0.8 },
                    }}
                />
            </div>
            <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-4">
                Off-screen buffer pixel rasterization with 60fps particle vaporization
            </p>
        </div>
    );
};

// ── Text Path scoped preview ─────────────────────
const TextPathPreview: React.FC = () => {
    const [freq, setFreq] = useState(3);
    const [waveH, setWaveH] = useState(100);
    const [speed, setSpeed] = useState(30);
    const [reversed, setReversed] = useState(true);
    const [textColor, setTextColor] = useState("#FFFFFF");
    const colors = ["#FFFFFF", "#38BDF8", "#F43F5E", "#A855F7", "#34D399", "#FBBF24"];

    return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-black select-none rounded-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setFreq(f => (f % 4) + 1)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Freq: {freq}
                    </button>
                    <button
                        onClick={() => setWaveH(h => h === 60 ? 100 : h === 100 ? 140 : 60)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Height: {waveH}px
                    </button>
                    <button
                        onClick={() => setSpeed(s => s === 15 ? 30 : s === 30 ? 60 : 15)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Speed: {speed}
                    </button>
                    <button
                        onClick={() => setReversed(r => !r)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Dir: {reversed ? "←" : "→"}
                    </button>
                </div>
                <div className="flex items-center gap-1.5">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setTextColor(c)}
                            className="w-4 h-4 rounded-full transition-transform hover:scale-125 border border-white/20"
                            style={{ backgroundColor: c, outline: textColor === c ? '2px solid white' : 'none' }}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center pt-8">
                <TextPath
                    text="UI HUB • INFINITE SINE WAVE MARQUEE"
                    separator="   ★   "
                    gap={0}
                    speed={speed}
                    reversed={reversed}
                    waveFrequency={freq}
                    waveHeight={waveH}
                    textColor={textColor}
                    textFont={{
                        fontSize: 18,
                        fontWeight: 700,
                        letterSpacing: 1,
                        fontFamily: "Inter, system-ui, sans-serif",
                    }}
                    height={220}
                />
            </div>
            <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-4">
                Procedural SVG Sine Wave with seamless rAF marquee flow
            </p>
        </div>
    );
};

// ── Text Carousel (Rotating Text) scoped preview ─
const RotatingTextPreview: React.FC = () => {
    const [splitBy, setSplitBy] = useState<"characters" | "words">("characters");
    const [badgeBg, setBadgeBg] = useState("#1EE7B3");
    const colors = ["#1EE7B3", "#3B82F6", "#EC4899", "#8B5CF6", "#F59E0B"];

    return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-neutral-950 select-none rounded-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setSplitBy(s => s === "characters" ? "words" : "characters")}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Split: {splitBy}
                    </button>
                </div>
                <div className="flex items-center gap-1.5">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setBadgeBg(c)}
                            className="w-4 h-4 rounded-full transition-transform hover:scale-125 border border-white/20"
                            style={{ backgroundColor: c, outline: badgeBg === c ? '2px solid white' : 'none' }}
                        />
                    ))}
                </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center pt-8">
                <RotatingText
                    prefix="Text"
                    texts={["components!", "interfaces!", "experiences!", "interactions!"]}
                    splitBy={splitBy}
                    staggerFrom="first"
                    badgeBackground={badgeBg}
                    color="#000000"
                    prefixColor="#ffffff"
                    badgeRadius={14}
                    badgePaddingX={18}
                    badgePaddingY={6}
                    font={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
                        fontWeight: 700,
                        letterSpacing: "-0.02em",
                        lineHeight: "1.1em",
                        textAlign: "center",
                    }}
                />
            </div>
            <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-4">
                Smooth auto-sizing badge carousel with GSAP staggered letter transitions
            </p>
        </div>
    );
};

// ── Smoky Text scoped preview ───────────────────
const SmokyTextPreview: React.FC = () => {
    const [key, setKey] = useState(0);
    const [mode, setMode] = useState<"singleLine" | "multiLine" | "inPlace">("singleLine");
    const [pos, setPos] = useState<"bottomLeft" | "topLeft">("bottomLeft");
    const [intensity, setIntensity] = useState(12);

    return (
        <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-black select-none rounded-2xl overflow-hidden relative border border-white/5">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setKey(k => k + 1)}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        ↻ Replay
                    </button>
                    <button
                        onClick={() => setMode(m => m === "singleLine" ? "multiLine" : m === "multiLine" ? "inPlace" : "singleLine")}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Mode: {mode}
                    </button>
                    <button
                        onClick={() => setPos(p => p === "bottomLeft" ? "topLeft" : "bottomLeft")}
                        className="px-3 py-1 text-[11px] font-mono rounded-lg bg-white/5 border border-white/10 hover:bg-white/15 text-white/80 transition-colors uppercase"
                    >
                        Pos: {pos}
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-white/40">Smoke: {intensity}</span>
                </div>
            </div>

            <div className="w-full flex-1 flex items-center justify-center pt-8">
                <SmokyText
                    key={`${key}-${mode}-${pos}-${intensity}`}
                    text={"SMOKY\nTEXT"}
                    color="#ffffff"
                    intensity={intensity}
                    animationMode={mode}
                    position={pos}
                    appearTrigger="default"
                    font={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "clamp(2.5rem, 6.5vw, 5rem)",
                        fontWeight: 800,
                        lineHeight: "1.05em",
                        letterSpacing: "0.02em",
                        textAlign: "center",
                    }}
                />
            </div>
            <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-4">
                Cinematic atmospheric smoke dispersion & condensation physics
            </p>
        </div>
    );
};



// ── Scroll Text Highlight scoped preview ────────
const ScrollHighlightPreview: React.FC = () => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [scrollerEl, setScrollerEl] = useState<HTMLDivElement | null>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            setScrollerEl(scrollContainerRef.current);
        }
    }, []);

    return (
        <div className="relative w-full h-full min-h-[380px] max-h-[420px] bg-black select-none rounded-2xl overflow-hidden border border-white/5 flex flex-col items-center justify-start">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 font-mono text-[10px] uppercase tracking-widest backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                SCROLL INSIDE BOX TO REVEAL
            </div>
            <div
                ref={scrollContainerRef}
                className="w-full h-full overflow-y-auto px-8 py-4 custom-scrollbar"
                style={{ scrollBehavior: 'smooth' }}
            >
                {scrollerEl && (
                    <ScrollHighlight
                        scroller={scrollerEl}
                        paddingTop="140px"
                        paddingBottom="180px"
                        splitBy="words"
                        text="Every detail matters. Small interactions shape perception, build trust, and transform ordinary experiences into memorable ones."
                        dimColor="rgba(255, 255, 255, 0.18)"
                        highlightColor="#FFFFFF"
                        font={{
                            fontFamily: "Inter, system-ui, sans-serif",
                            fontSize: "clamp(1.35rem, 3vw, 2.1rem)",
                            fontWeight: 700,
                            letterSpacing: "-0.02em",
                            lineHeight: "1.35em",
                            textAlign: "left",
                        }}
                    />
                )}
            </div>
        </div>
    );
};

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
                // Keep centered content clear of the absolute nav when it wraps on phones
                paddingTop: 'clamp(64px, 20vw, 84px)',
            }}
        >
            <MagneticBackground containerRef={containerRef} />
            <MagneticCursor cursorSize={20} magnetRadius={120} containerRef={containerRef} />

            {/* Top Navigation Bar */}
            <div style={{
                position: 'absolute', top: 'clamp(12px, 3vw, 32px)', left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 999,
                padding: '6px',
                display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4,
                width: 'max-content', maxWidth: '92%',
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
                            padding: '8px 14px',
                            fontSize: 'clamp(11px, 3vw, 13px)',
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 10, pointerEvents: 'none', textAlign: 'center', padding: '0 16px', /* Offset title down slightly */ marginTop: 40 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                    Interact Below
                </div>
                <div style={{
                    fontSize: 'clamp(28px, 8vw, 42px)', fontWeight: 900, letterSpacing: '-0.04em',
                    background: 'linear-gradient(180deg, #fff 0%, #a5b4fc 100%)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 0 32px rgba(165,180,252,0.4))',
                }}>
                    Magnetic Pull
                </div>
            </div>

            {/* Magnetic buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 16px', zIndex: 10, padding: '0 16px' }}>
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

            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24, width: '80%', minWidth: 0 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 8, borderBottom: '1px solid #1a1a1a', paddingBottom: 12 }}>
                    <div>
                        <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.2em' }}>SYSTEM_STATUS</div>
                        <div className="cursor-target" style={{ fontSize: 'clamp(15px, 5vw, 24px)', fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>UI_HUB // TARGETING_v4</div>
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
            <Suspense fallback={null}>
            <BlackHoleCursor gravityRadius={250} containerRef={containerRef}>
                {/* Mock Website Overlay */}
                <div style={{ padding: '16px 20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* Mock Nav */}
                    <nav style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 'auto' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '8px 20px' }}>
                            {['Home', 'About', 'Library'].map(link => (
                                <span key={link} style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>{link}</span>
                            ))}
                        </div>
                    </nav>

                    {/* Hero Text */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flex: 1, justifyContent: 'center', textAlign: 'center', padding: '12px 0' }}>
                        <h1 style={{
                            fontSize: 'clamp(28px, 8vw, 48px)', fontWeight: 900, letterSpacing: '-0.05em',
                            color: '#fff',
                            margin: 0,
                            textShadow: '0 0 40px rgba(139, 92, 246, 0.8)',
                        }}>
                            Black Hole
                        </h1>
                        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                            Move cursor · Touch &amp; drag · Stars follow gravity
                        </div>
                    </div>
                    {/* Interactive elements to test gravity pulse effect */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px 20px', zIndex: 10, marginTop: 'auto', paddingBottom: '16px' }}>
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
            </Suspense>
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
    const onTouch = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect || e.touches.length === 0) return;
        const t = e.touches[0];
        target.current = { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }, []);

    // Park the blob at the center and keep the loop running so it is always
    // visible — including on touch devices with no mouse events
    useEffect(() => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect && rect.width > 0) {
            const c = { x: rect.width / 2, y: rect.height / 2 };
            pos.current = { ...c };
            target.current = { ...c };
        }
        onEnter();
        return onLeave;
    }, [onEnter, onLeave]);

    return (
        <div
            ref={containerRef}
            onMouseMove={onMove}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onTouchStart={onTouch}
            onTouchMove={onTouch}
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
// MeshText renders text at a fixed px size onto a self-measuring canvas, so on
// phones we shrink the font itself (scaling the frame would shrink the canvas
// measurement too and clip the text at its own edges).
const useIsCompactViewport = (): boolean => {
    const [isCompact, setIsCompact] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
    useEffect(() => {
        const mq = window.matchMedia('(max-width: 639px)');
        const update = () => setIsCompact(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);
    return isCompact;
};

const MeshTextPreview: React.FC = () => {
    const isCompact = useIsCompactViewport();
    return (
        <div className="w-full h-full min-h-[380px] flex items-center justify-center bg-black rounded-2xl overflow-hidden p-6 relative">
            <MeshText
                text="HOVER"
                color="#ffffff"
                colorSplit={true}
                customColors={["#ff40c0", "#40ff80", "#00f0ff"]}
                force={18}
                font={{ fontFamily: "Inter", variant: "Bold", fontSize: isCompact ? 72 : 130, fontWeight: 800 }}
            />
        </div>
    );
};

const LizardCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    // Eagerly pre-load lazy chunk so canvas is ready before first paint
    useEffect(() => { import('../components/ui/LizardCursor'); }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%', height: '100%', minHeight: '400px',
                background: '#050508',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                cursor: 'none',
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

            {/* Always mounted & visible — works on desktop hover and mobile touch */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Suspense fallback={null}><LizardCursor color="#22c55e" containerRef={containerRef} /></Suspense>
            </div>
        </div>
    );
};

// ── Star Cursor scoped preview ────────────
const StarCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => { import('../components/ui/StarCursor'); }, []);

    return (
        <div
            ref={containerRef}
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

            {/* Interactive hint — keep the component's own label visible */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Suspense fallback={null}>
                    <StarCursor containerRef={containerRef} hideDefaultCursor={true} />
                </Suspense>
            </div>
        </div>
    );
};

// ── Shared cursor preview helpers ────────────
// A scoped cursor preview that strips the demo buttons/decorative text and
// leaves only the component's own centered "HOVER AROUND" label. On coarse
// (touch) pointers — where there is no hover — a small animation canvases a
// cursor-sized point around the frame by dispatching real window `pointermove`
// events, so the cursor is visible without a real pointer.
const CursorPreviewShell: React.FC<{
    containerRef: React.RefObject<HTMLDivElement | null>;
    background: string;
    children: React.ReactNode;
}> = ({ containerRef, background, children }) => {
    const [autoAnim, setAutoAnim] = useState(true);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(pointer: coarse)');
        const sync = () => setAutoAnim(!!mql.matches);
        sync();
        if (mql.addEventListener) {
            mql.addEventListener('change', sync);
            return () => mql.removeEventListener('change', sync);
        }
        const legacy = mql as MediaQueryList & {
            addListener?: (l: (e: MediaQueryListEvent) => void) => void;
            removeListener?: (l: (e: MediaQueryListEvent) => void) => void;
        };
        legacy.addListener?.(sync);
        return () => legacy.removeListener?.(sync);
    }, []);

    useEffect(() => {
        if (!autoAnim) return;
        const host = containerRef.current;
        if (!host) return;

        let raf = 0;
        const start = performance.now();

        const dispatch = (clientX: number, clientY: number) => {
            try {
                window.dispatchEvent(
                    new PointerEvent('pointermove', {
                        bubbles: true,
                        cancelable: true,
                        clientX,
                        clientY,
                        pointerType: 'mouse',
                        pointerId: 1,
                        isPrimary: true,
                        buttons: 0,
                    })
                );
            } catch {
                // Synthetic pointer events unsupported; fall through to rAF.
            }
        };

        const frame = (now: number) => {
            const rect = host.getBoundingClientRect();
            const t = (now - start) / 1000;
            const w = rect.width || 320;
            const h = rect.height || 320;
            // A Lissajous-style orbit that stays inside the frame.
            const cx = w * 0.5 + Math.sin(t * 1.2) * w * 0.32;
            const cy = h * 0.5 + Math.cos(t * 0.9) * h * 0.3;
            dispatch(rect.left + cx, rect.top + cy);
            raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);

        let suppress = false;
        const stopOnReal = () => {
            if (suppress) return;
            suppress = true;
            cancelAnimationFrame(raf);
        };
        window.addEventListener('pointermove', stopOnReal, { passive: true });
        window.addEventListener('touchstart', stopOnReal, { passive: true });

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('pointermove', stopOnReal);
            window.removeEventListener('touchstart', stopOnReal);
        };
    }, [autoAnim, containerRef]);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                minHeight: '100%',
                background,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                {children}
            </div>
        </div>
    );
};

// ── Ascii Cursor scoped preview ────────────
const AsciiCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <CursorPreviewShell
            containerRef={containerRef}
            background="linear-gradient(160deg, #101014 0%, #0a0a0e 40%, #050507 100%)"
        >
            <Suspense fallback={null}>
                <AsciiCursor label labelText="HOVER AROUND" />
            </Suspense>
        </CursorPreviewShell>
    );
};

// ── Aura Cursor scoped preview ────────────
const AuraCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <CursorPreviewShell
            containerRef={containerRef}
            background="radial-gradient(120% 120% at 50% 0%, #1a1030 0%, #0c0716 45%, #06030c 100%)"
        >
            <Suspense fallback={null}>
                <AuraCursor label labelText="HOVER AROUND" />
            </Suspense>
        </CursorPreviewShell>
    );
};

// ── Confetti Cursor scoped preview ────────────
const ParticleCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <CursorPreviewShell
            containerRef={containerRef}
            background="radial-gradient(120% 120% at 50% 0%, #14161d 0%, #0a0b10 45%, #05060a 100%)"
        >
            <Suspense fallback={null}>
                <ParticleCursor label labelText="HOVER AROUND" />
            </Suspense>
        </CursorPreviewShell>
    );
};

// ── Spin Cursor scoped preview ────────────
const MagicCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <CursorPreviewShell
            containerRef={containerRef}
            background="radial-gradient(120% 120% at 50% 0%, #121318 0%, #0a0b0f 45%, #05060a 100%)"
        >
            <Suspense fallback={null}>
                <MagicCursor label labelText="HOVER AROUND" />
            </Suspense>
        </CursorPreviewShell>
    );
};

// ── User Cursor scoped preview ────────────
const UserCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);

    return (
        <CursorPreviewShell
            containerRef={containerRef}
            background="radial-gradient(120% 120% at 50% 0%, #101418 0%, #0a0d12 50%, #05070a 100%)"
        >
            <Suspense fallback={null}>
                <UserCursor
                    name="HOVER AROUND"
                    color="#FFFFFF"
                    textColor="#000000"
                    previewMode
                />
            </Suspense>
        </CursorPreviewShell>
    );
};

// ── Card Cascade scoped preview ────────────
const CardCascadePreview: React.FC = () => {
    return (
        <div
            style={{
                position: 'relative',
                width: '100%', height: '100%',
                background: '#000000',
                overflow: 'hidden',
            }}
        >
            <Suspense fallback={null}>
                <CardCascade preview />
            </Suspense>
        </div>
    );
};

// Fullscreen demo mode: the Card Cascade must be USER-scroll-driven (never
// auto-scrolls). DemoPage renders inside a `fixed inset-0 overflow-hidden`
// container, so we provide our own internal scroll container and pass its ref
// to CardCascade, which then tracks only that container's scroll.
const CardCascadeScrollDemo: React.FC = () => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    return (
        <div
            ref={scrollerRef}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                background: '#000000',
                overflowY: 'auto',
                overflowX: 'hidden',
            }}
        >
            <Suspense fallback={null}>
                <CardCascade scrollerRef={scrollerRef} />
            </Suspense>
        </div>
    );
};

// ── Venom Cursor scoped preview ────────────
const VenomCursorPreview: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    // Eagerly pre-load lazy chunk so canvas is ready before first paint
    useEffect(() => { import('../components/ui/VenomCursor'); }, []);

    return (
        <div
            ref={containerRef}
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
                top: 24,
                left: 0, right: 0,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: '8px 24px',
                padding: '0 12px',
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

            {/* Always mounted & visible — works on desktop hover and mobile touch */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <Suspense fallback={null}><VenomCursor color="#ffffff" containerRef={containerRef} /></Suspense>
            </div>

            <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', pointerEvents: 'none', marginTop: 'auto', paddingBottom: 20, paddingInline: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                    Move cursor · Touch &amp; drag
                </div>
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













const CinematicNavbarPreview: React.FC = () => {
    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#000000',
            overflow: 'hidden',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
        }}>
            <style>{`
                .cin-nav {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 22px 40px 10px;
                    background: radial-gradient(120% 220% at 50% -60%, #232323 0%, #101010 45%, #000000 100%);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .cin-logo { display: inline-flex; align-items: center; gap: 9px; justify-self: start; font-size: 15.5px; font-weight: 600; letter-spacing: -0.03em; color: #fff; text-decoration: none; }
                .cin-logo svg { width: 22px; height: 22px; }
                .cin-suffix { font-weight: 400; }
                .cin-nav-links { display: flex; align-items: center; gap: 8px; justify-self: center; }
                .cin-pill { height: 40px; padding: 0 18px; border-radius: 7px; overflow: hidden; position: relative; display: inline-flex; align-items: center; border: 1px solid rgba(255,255,255,0.14); background: #232323; color: #e6e6e6; font-size: 14px; font-weight: 400; letter-spacing: -0.01em; white-space: nowrap; text-decoration: none; transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease; }
                .cin-pill::before { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%); transform: translateX(-120%); transition: transform 0.6s ease; }
                .cin-pill:hover::before { transform: translateX(120%); }
                .cin-pill:hover { border-color: rgba(255,255,255,0.28); background: #2e2e2e; box-shadow: 0 0 18px rgba(200,210,230,0.12); }
                .cin-cta { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; border-radius: 6px; font-size: 13.5px; font-weight: 500; letter-spacing: -0.02em; line-height: 1; white-space: nowrap; position: relative; overflow: hidden; justify-self: end; background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%); color: #111; border: 1px solid #fff; box-shadow: inset 0 1px 0 rgba(255,255,255,0.95); text-decoration: none; }
                .cin-cta::after { content: ""; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%); transform: translateX(-130%); transition: transform 0.65s ease; }
                .cin-cta:hover::after { transform: translateX(130%); }
                .cin-fill { flex: 1; background: #000; }
                @media (max-width: 820px) {
                    .cin-nav { padding: 18px 16px 8px; gap: 8px; }
                    .cin-pill { padding: 0 12px; font-size: 13px; }
                }
                @media (max-width: 640px) {
                    .cin-nav-links { display: none; }
                }
            `}</style>
            <header className="cin-nav">
                <a className="cin-logo" href="#top">
                    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <g transform="rotate(-30 12 12)">
                            <circle cx="7.3" cy="3.2" r="1.45"/>
                            <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                            <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
                            <circle cx="16.7" cy="20.8" r="1.45"/>
                        </g>
                    </svg>
                    Vesper<span className="cin-suffix">.ai</span>
                </a>
                <nav className="cin-nav-links">
                    <a className="cin-pill" href="#benefits">Benefits</a>
                    <a className="cin-pill" href="#how-it-works">How It Works</a>
                    <a className="cin-pill" href="#faqs">FAQs</a>
                </nav>
                <a className="cin-cta" href="#start">Start for Free</a>
            </header>
            <div className="cin-fill" />
        </div>
    );
};

const FloatingDarkCapsuleNavbarPreview: React.FC = () => {
    const navLinks = ["platform", "solutions", "company", "support"];

    const Logo = () => (
        <svg viewBox="0 0 256 256" className="h-5 w-5" xmlns="http://www.w3.org/2000/svg">
            <path
                fill="#ffffff"
                d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z
                   M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z
                   M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z
                   M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z"
            />
        </svg>
    );

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: 'radial-gradient(120% 160% at 50% 0%, #2a2a2e 0%, #141416 55%, #050506 100%)',
            overflow: 'hidden',
            borderRadius: '24px',
        }}>
            <nav className="absolute top-0 left-0 right-0 z-20 px-6 md:px-10 pt-6 flex items-center justify-between gap-4" style={{ position: 'absolute' }}>
                <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur rounded-full pl-4 pr-6 py-3">
                    <Logo />
                    <span className="text-white text-sm font-normal tracking-tight">securify</span>
                </div>
                <div className="hidden md:flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2">
                    {navLinks.map((link) => (
                        <a
                            key={link}
                            href="#"
                            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
                        >
                            {link}
                        </a>
                    ))}
                </div>
                <button className="bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors">
                    get started
                </button>
            </nav>
        </div>
    );
};

const MinimalAICapsuleNavbarPreview: React.FC = () => {
    const PlusIcon = (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
        </svg>
    );

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '100%',
            background: '#ffffff',
            overflow: 'hidden',
            borderRadius: '24px',
        }}>
            <style>{`
                .mn-nav {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    z-index: 50;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    pointer-events: none;
                    animation: mn-down 0.8s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .mn-nav > * { pointer-events: auto; }
                .mn-left { display: flex; align-items: center; gap: 12px; }
                .mn-right { display: flex; align-items: center; }
                .mn-logo { display: flex; align-items: center; gap: 8px; }
                .mn-brand { font-family: "Inter", system-ui, sans-serif; font-weight: 500; font-size: 14px; color: #000000; display: none; }
                .mn-menu-pill { display: flex; align-items: center; gap: 8px; background: #000000; border: none; border-radius: 999px; padding: 6px 14px 6px 6px; cursor: pointer; }
                .mn-menu-dot { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #ffffff; flex-shrink: 0; }
                .mn-menu-text { font-family: "Inter", system-ui, sans-serif; font-weight: 400; font-size: 11px; color: #ffffff; }
                .mn-tags-pill { display: none; align-items: center; gap: 4px; background: #f4f4f6; border-radius: 999px; padding: 6px; }
                .mn-tag { font-family: "Inter", system-ui, sans-serif; font-weight: 400; font-size: 11px; color: #000000; padding: 6px 12px; border-radius: 999px; white-space: nowrap; }
                .mn-right-pill { display: flex; align-items: center; gap: 8px; background: #f4f4f6; border-radius: 999px; padding: 6px; }
                .mn-right-circle { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; background: #000000; flex-shrink: 0; }
                .mn-right-label { display: none; font-family: "Inter", system-ui, sans-serif; font-weight: 400; font-size: 11px; color: #000000; padding-right: 8px; }
                @media (min-width: 768px) {
                    .mn-nav { padding: 24px 32px; }
                    .mn-brand { display: inline-block; }
                    .mn-tags-pill { display: flex; }
                    .mn-right-label { display: inline-block; }
                    .mn-menu-dot, .mn-right-circle { width: 32px; height: 32px; }
                }
                @keyframes mn-down { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <nav className="mn-nav" style={{ position: 'absolute' }}>
                <div className="mn-left">
                    <div className="mn-logo">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                            <rect x="8" y="2" width="12" height="5" rx="2.5" fill="#000000" transform="rotate(-35 14 14)" />
                            <rect x="8" y="21" width="12" height="5" rx="2.5" fill="#000000" transform="rotate(-35 14 14)" />
                        </svg>
                        <span className="mn-brand">NeuralKinetics</span>
                    </div>

                    <button className="mn-menu-pill" type="button">
                        <span className="mn-menu-dot">{PlusIcon}</span>
                        <span className="mn-menu-text">Menu</span>
                    </button>

                    <div className="mn-tags-pill">
                        <span className="mn-tag">Advanced Bionics</span>
                        <span className="mn-tag">Cognitive AI</span>
                    </div>
                </div>

                <div className="mn-right">
                    <div className="mn-right-pill">
                        <span className="mn-right-circle">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <circle cx="2.5" cy="2.5" r="1.5" fill="#ffffff" />
                                <circle cx="9.5" cy="2.5" r="1.5" fill="#ffffff" />
                                <circle cx="2.5" cy="9.5" r="1.5" fill="#ffffff" />
                                <circle cx="9.5" cy="9.5" r="1.5" fill="#ffffff" />
                            </svg>
                        </span>
                        <span className="mn-right-label">Adaptive Systems</span>
                    </div>
                </div>
            </nav>
        </div>
    );
};

const PillNavbarPreview: React.FC = () => {
    const pnItems = [
        { label: 'Home', href: '/' },
        { label: 'About', href: '/about' },
        { label: 'Services', href: '/services' },
        { label: 'Contact', href: '/contact' }
    ];

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '260px',
            background: '#f4f4f6',
            overflow: 'hidden',
            borderRadius: '24px',
        }}>
            <style>{`
                .pn-container {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 99;
                }
                .pn-nav {
                    --nav-h: 42px;
                    --logo: 36px;
                    --pill-pad-x: 18px;
                    --pill-gap: 3px;
                    width: max-content;
                    display: flex;
                    align-items: center;
                    box-sizing: border-box;
                    border-radius: 9999px;
                }
                .pn-nav-items {
                    position: relative;
                    display: flex;
                    align-items: center;
                    height: var(--nav-h);
                    background: #ffffff;
                    border-radius: 9999px;
                }
                .pn-logo {
                    width: var(--nav-h);
                    height: var(--nav-h);
                    border-radius: 50%;
                    background: #ffffff;
                    padding: 8px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    margin-right: 6px;
                }
                .pn-logo img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .pn-list {
                    list-style: none;
                    display: flex;
                    align-items: stretch;
                    gap: var(--pill-gap);
                    margin: 0;
                    padding: 3px;
                    height: 100%;
                }
                .pn-list > li {
                    display: flex;
                    height: 100%;
                }
                .pn-pill {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    padding: 0 var(--pill-pad-x);
                    background: #120f17;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 9999px;
                    box-sizing: border-box;
                    font-weight: 600;
                    font-size: 13px;
                    line-height: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.2px;
                    white-space: nowrap;
                    cursor: pointer;
                    position: relative;
                    overflow: hidden;
                    border: none;
                    font-family: "Inter", system-ui, sans-serif;
                }
                .pn-pill.active::after {
                    content: '';
                    position: absolute;
                    bottom: -6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 12px;
                    height: 12px;
                    background: #ffffff;
                    border-radius: 50px;
                    z-index: 4;
                }
                .pn-pill .hover-circle {
                    position: absolute;
                    left: 50%;
                    bottom: 0;
                    border-radius: 50%;
                    background: #ffffff;
                    z-index: 1;
                    display: block;
                    pointer-events: none;
                    will-change: transform;
                    width: 26px;
                    height: 26px;
                    transform: translateX(-50%) scale(0.4);
                    opacity: 0;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    transform-origin: 50% 100%;
                }
                .pn-pill:hover .hover-circle {
                    opacity: 1;
                    transform: translateX(-50%) scale(12);
                }
                .pn-pill .label-stack {
                    position: relative;
                    display: inline-block;
                    line-height: 1;
                    z-index: 2;
                    overflow: hidden;
                    height: 1em;
                }
                .pn-pill .pill-label {
                    position: relative;
                    z-index: 2;
                    display: inline-block;
                    line-height: 1;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), color 0.35s;
                }
                .pn-pill .pill-label-hover {
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: #120f17;
                    z-index: 3;
                    display: inline-block;
                    line-height: 1;
                    transform: translateY(130%);
                    opacity: 0;
                    transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s;
                    will-change: transform, opacity;
                }
                .pn-pill:hover .pill-label {
                    transform: translateY(-130%);
                    color: transparent;
                }
                .pn-pill:hover .pill-label-hover {
                    transform: translateY(0);
                    opacity: 1;
                }
                @media (max-width: 640px) {
                    .pn-nav { --nav-h: 36px; --logo: 30px; --pill-pad-x: 10px; --pill-gap: 2px; }
                    .pn-pill { font-size: 11.5px; }
                    .pn-container { max-width: 100%; }
                }
            `}</style>

            <div className="pn-container">
                <nav className="pn-nav" aria-label="Primary">
                    <a className="pn-logo" href="#" aria-label="Home" onClick={(e) => e.preventDefault()}>
                        <img src={uiHubLogo} alt="UI HUB Logo" />
                    </a>

                    <div className="pn-nav-items">
                        <ul className="pn-list" role="menubar">
                            {pnItems.map((item, i) => (
                                <li key={item.href} role="none">
                                    <a
                                        role="menuitem"
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        className={`pn-pill${item.href === '/' ? ' active' : ''}`}
                                        aria-label={item.label}
                                    >
                                        <span className="hover-circle" aria-hidden="true" />
                                        <span className="label-stack">
                                            <span className="pill-label">{item.label}</span>
                                            <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                                        </span>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>
        </div>
    );
};

const ModernDarkNavbarPreview: React.FC = () => {
    const [hoveredTrigger, setHoveredTrigger] = React.useState<number | null>(null);
    const [hoveredCta, setHoveredCta] = React.useState(false);

    const baseTrigger: React.CSSProperties = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '6px 12px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color .18s ease, color .18s ease',
        border: 'none',
        backgroundColor: 'transparent',
        fontFamily: '"Inter", system-ui, sans-serif',
    };

    const hoveredTriggerStyle: React.CSSProperties = {
        ...baseTrigger,
        backgroundColor: 'rgba(255,255,255,0.14)',
        color: '#ffffff',
    };

    const triggers = ['Product', 'Company', 'Pricing'];

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '260px',
            background: '#06070a',
            overflow: 'hidden',
            borderRadius: '24px',
        }}>
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                backgroundImage: 'radial-gradient(rgba(255,255,255,0.18) 2px, transparent 2px)',
                backgroundSize: '12px 12px',
            }} />
            <style>{`
                @media (max-width: 640px) {
                    .md-triggers { display: none !important; }
                }
            `}</style>

            <div style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', zIndex: 1,
                width: '92%', maxWidth: 720, borderRadius: 12,
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    height: 56, width: '100%', border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 12, padding: '0 16px', boxSizing: 'border-box',
                    background: 'rgba(18,20,26,0.85)', backdropFilter: 'blur(12px)',
                    fontFamily: '"Inter", system-ui, sans-serif',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 26, height: 26, borderRadius: 6, background: '#7c3aed',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', fontWeight: 800, fontSize: 14,
                            transition: 'background-color .2s ease',
                        }}>▦</div>
                        <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 16, fontWeight: 700, color: '#f4f4f5', letterSpacing: 0.5 }}>UI HUB</span>
                    </div>

                    <div className="md-triggers" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {triggers.map((label, i) => {
                            const hovered = hoveredTrigger === i;
                            const isDropdown = label !== 'Pricing';
                            return (
                                <button
                                    key={label}
                                    type="button"
                                    style={hovered ? hoveredTriggerStyle : baseTrigger}
                                    onMouseEnter={() => setHoveredTrigger(i)}
                                    onMouseLeave={() => setHoveredTrigger(null)}
                                >
                                    <span style={{ lineHeight: 1 }}>{label}</span>
                                    {isDropdown && (
                                        <svg
                                            width="12" height="12" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                                            style={{
                                                marginTop: 1,
                                                color: hovered ? '#ffffff' : '#71717a',
                                                transform: hovered ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform .3s ease, color .18s ease',
                                            }}
                                        >
                                            <path d="m6 9 6 6 6-6" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button
                            type="button"
                            onMouseEnter={() => setHoveredCta(true)}
                            onMouseLeave={() => setHoveredCta(false)}
                            style={{
                                background: hoveredCta ? '#ffffff' : '#f4f4f5',
                                color: '#0a0a0b', border: 'none', borderRadius: 6,
                                padding: '8px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                                transform: hoveredCta ? 'translateY(-1px)' : 'translateY(0px)',
                                transition: 'background-color .15s ease, transform .15s ease',
                                fontFamily: '"Inter", system-ui, sans-serif',
                            }}
                        >
                            Get Started
                        </button>
                        <div style={{
                            display: 'flex', width: 34, height: 34, borderRadius: '50%',
                            border: 'none', background: 'transparent', color: '#f4f4f5',
                            cursor: 'pointer', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SplitNavigationNavPreview: React.FC = () => {
    const [menuOpen, setMenuOpen] = React.useState(false);
    const links = ['Platform', 'Solutions', 'Company', 'Pricing'];

    const chevronLogo = (
        <svg width="34" height="28" viewBox="0 0 42 34" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <polygon points="12,0 30,0 33.2,3.2 15.2,3.2" />
            <polygon points="14.6,5.6 32.6,5.6 35.8,8.8 17.8,8.8" />
            <polygon points="17.2,11.2 35.2,11.2 38.4,14.4 20.4,14.4" />
            <polygon points="3.2,16.8 21.2,16.8 24.4,20 6.4,20" />
            <polygon points="5.8,22.4 23.8,22.4 27,25.6 9,25.6" />
            <polygon points="8.4,28 26.4,28 29.6,31.2 11.6,31.2" />
        </svg>
    );

    const arrowIcon = (
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" width="14" height="14">
            <path
                d="M4 10h10.2M10.4 5.6 15.2 10l-4.8 4.4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: '280px',
            background: '#ffffff',
            overflow: 'hidden',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <style>{`
                .sn-nav {
                    display: grid;
                    grid-template-columns: 1fr auto 1fr;
                    align-items: center;
                    padding: 22px 28px 0;
                    width: 100%;
                    box-sizing: border-box;
                }
                .sn-links {
                    display: flex;
                    align-items: center;
                    gap: 26px;
                    justify-self: start;
                    padding: 22px 32px;
                    background: rgba(0,0,0,0.13);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                }
                .sn-links a {
                    position: relative;
                    font-size: 14.5px;
                    font-weight: 500;
                    letter-spacing: -0.01em;
                    color: #0a0a0a;
                    line-height: 1;
                    white-space: nowrap;
                    text-decoration: none;
                    font-family: "Inter", system-ui, sans-serif;
                }
                .sn-links a::after {
                    content: "";
                    position: absolute;
                    left: 0;
                    bottom: -6px;
                    width: 100%;
                    height: 3px;
                    background: #006cd2;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.28s cubic-bezier(0.16,1,0.3,1);
                }
                .sn-links a:hover { color: #006cd2; transform: translateY(-2px); }
                .sn-links a:hover::after { transform: scaleX(1); }
                .sn-links a:nth-child(1) { animation-delay: 0.02s; }
                .sn-links a:nth-child(2) { animation-delay: 0.08s; }
                .sn-links a:nth-child(3) { animation-delay: 0.14s; }
                .sn-links a:nth-child(4) { animation-delay: 0.2s; }
                .sn-logo {
                    display: inline-flex;
                    justify-self: center;
                    color: #0a0a0a;
                    cursor: pointer;
                    transition: transform 0.35s cubic-bezier(0.16,1,0.3,1);
                }
                .sn-logo:hover { transform: scale(1.1); }
                .sn-logo polygon {
                    transform-box: fill-box;
                    transform-origin: left center;
                }
                .sn-logo polygon:nth-child(1) { animation-delay: 0.04s; }
                .sn-logo polygon:nth-child(2) { animation-delay: 0.09s; }
                .sn-logo polygon:nth-child(3) { animation-delay: 0.14s; }
                .sn-logo polygon:nth-child(4) { animation-delay: 0.19s; }
                .sn-logo polygon:nth-child(5) { animation-delay: 0.24s; }
                .sn-logo polygon:nth-child(6) { animation-delay: 0.29s; }
                .sn-right { display: flex; align-items: center; gap: 14px; justify-self: end; }
                .sn-btn {
                    position: relative;
                    display: inline-flex;
                    align-items: center;
                    height: 52px;
                    border-radius: 0;
                    padding: 12px 12px 12px 22px;
                    gap: 16px;
                    font-size: 15px;
                    font-weight: 500;
                    letter-spacing: -0.015em;
                    line-height: 1;
                    white-space: nowrap;
                    overflow: hidden;
                    cursor: pointer;
                    background: #006cd2;
                    color: #fff;
                    border: none;
                    font-family: "Inter", system-ui, sans-serif;
                }
                .sn-btn::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                    background: #004a96;
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1);
                    pointer-events: none;
                }
                .sn-btn:hover::before { transform: scaleX(1); }
                .sn-btn__label, .sn-btn__icon { position: relative; z-index: 1; }
                .sn-btn__icon {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    width: 34px;
                    height: 34px;
                    background: #0053a3;
                    color: #fff;
                }
                .sn-btn:hover .sn-btn__icon { background: #fff; color: #006cd2; }
                .sn-burger {
                    display: none;
                    width: 36px;
                    height: 36px;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 5px;
                    background: none;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.22s cubic-bezier(0.16,1,0.3,1);
                }
                .sn-burger:hover { transform: scale(1.08); }
                .sn-burger-bar {
                    width: 18px;
                    height: 1.5px;
                    background: #0a0a0a;
                    transition: width 0.22s cubic-bezier(0.16,1,0.3,1), background 0.22s cubic-bezier(0.16,1,0.3,1);
                }
                .sn-burger:hover .sn-burger-bar { background: #006cd2; }
                .sn-burger:hover .sn-burger-bar:nth-child(1),
                .sn-burger:hover .sn-burger-bar:nth-child(3) { width: 14px; }
                .sn-mobile {
                    display: flex;
                    flex-direction: column;
                    gap: 1.25rem;
                    padding: 1.25rem 28px 0.5rem;
                }
                .sn-mobile[hidden] { display: none; }
                .sn-mobile__links {
                    display: flex;
                    flex-direction: column;
                    gap: 0.9rem;
                    padding: 16px 20px;
                    background: rgba(0,0,0,0.13);
                    backdrop-filter: blur(18px);
                    -webkit-backdrop-filter: blur(18px);
                }
                .sn-mobile__links a {
                    font-size: 1.05rem;
                    font-weight: 500;
                    color: #0a0a0a;
                    text-decoration: none;
                    font-family: "Inter", system-ui, sans-serif;
                }
                @keyframes sn-link-in {
                    from { opacity: 0; transform: translate3d(-16px,0,0); }
                    to { opacity: 1; transform: translate3d(0,0,0); }
                }
                @keyframes sn-mark-in {
                    from { opacity: 0; transform: translate3d(-12px,8px,0); }
                    to { opacity: 1; transform: translate3d(0,0,0); }
                }
                @keyframes sn-wipe {
                    from { opacity: 0; clip-path: inset(0 100% 0 0); }
                    to { opacity: 1; clip-path: inset(0 0 0 0); }
                }
                @media (max-width: 820px) {
                    .sn-links, .sn-right .sn-btn { display: none; }
                    .sn-nav { grid-template-columns: auto 1fr auto; }
                    .sn-logo { justify-self: start; }
                    .sn-burger { display: flex; }
                    .sn-mobile { display: flex; }
                }
                @media (min-width: 821px) {
                    .sn-burger { display: none; }
                }
            `}</style>

            <nav className="sn-nav">
                <div className="sn-links">
                    {links.map(l => <a key={l} href="#" onClick={(e) => e.preventDefault()}>{l}</a>)}
                </div>

                <a className="sn-logo" href="#" onClick={(e) => e.preventDefault()}>{chevronLogo}</a>

                <div className="sn-right">
                    <button type="button" className="sn-btn">
                        <span className="sn-btn__label">Book Demo</span>
                        <span className="sn-btn__icon">{arrowIcon}</span>
                    </button>
                    <button
                        type="button"
                        className="sn-burger"
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen(v => !v)}
                    >
                        <span className="sn-burger-bar" />
                        <span className="sn-burger-bar" />
                        <span className="sn-burger-bar" />
                    </button>
                </div>
            </nav>

            <div className="sn-mobile" hidden={!menuOpen}>
                <div className="sn-mobile__links">
                    {links.map(l => <a key={l} href="#" onClick={(e) => { e.preventDefault(); setMenuOpen(false); }}>{l}</a>)}
                </div>
                <button type="button" className="sn-btn">
                    <span className="sn-btn__label">Book Demo</span>
                    <span className="sn-btn__icon">{arrowIcon}</span>
                </button>
            </div>
        </div>
    );
};

const AwwwardsNavPreview: React.FC = () => {
    const [expanded, setExpanded] = React.useState(false);
    const items = ['Home', 'Nominees', 'Directory', 'Collections'];
    const columns = [
        { title: 'Awards', links: ['Winners', 'Site of the Day', 'Nominees'] },
        { title: 'Inspiration', links: ['Collections', 'Elements', 'Resources'] },
        { title: 'Directory', links: ['Professionals', 'Agencies', 'Freelancers'] },
        { title: 'Market', links: ['Jobs', 'New Events', 'Products'] },
    ];
    const panelH = expanded ? 190 : 0;

    const itemLinkStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1, height: 40, borderRadius: 10, fontSize: 13,
        textAlign: 'center', textDecoration: 'none', color: '#525252',
    };

    return (
        <div style={{
            position: 'relative', width: '100%', height: '100%', minHeight: '280px',
            overflow: 'hidden', borderRadius: '24px',
            background: 'radial-gradient(120% 160% at 50% 0%, #17181c 0%, #0b0c0f 55%, #07080a 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px 16px', boxSizing: 'border-box',
            fontFamily: '"Inter", system-ui, sans-serif',
        }}>
            <nav style={{
                display: 'flex', flexDirection: 'column', overflow: 'hidden',
                borderRadius: 14, border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.92)', boxShadow: '0 18px 50px rgba(0,0,0,0.45)',
                boxSizing: 'border-box', width: '100%', maxWidth: 540,
                transition: 'height .45s cubic-bezier(.76,0,.24,1)',
                height: panelH + 60,
            }}>
                <div style={{
                    height: panelH, overflow: 'hidden', padding: '10px 10px 0 10px', boxSizing: 'border-box',
                    display: expanded ? 'block' : 'none',
                    opacity: expanded ? 1 : 0,
                    transition: 'opacity .3s ease',
                }}>
                    <div style={{
                        display: 'flex', height: '100%',
                        border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10,
                        background: 'rgba(0,0,0,0.03)', padding: 14, boxSizing: 'border-box',
                    }}>
                        {columns.map((col, ci) => (
                            <div key={col.title} style={{
                                flex: 1, display: 'flex', flexDirection: 'column', gap: 3,
                                borderLeft: ci > 0 ? '1px dashed rgba(0,0,0,0.15)' : 'none',
                                paddingLeft: ci > 0 ? 14 : 0, minWidth: 0,
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#000', flexShrink: 0 }} />
                                    <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(0,0,0,0.72)' }}>{col.title}</span>
                                </div>
                                {col.links.map(l => (
                                    <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{
                                        display: 'block', padding: '4px 0', fontSize: 12,
                                        color: '#171717', textDecoration: 'none',
                                    }}>{l}</a>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', height: 60, alignItems: 'center', gap: 6, padding: 10, boxSizing: 'border-box' }}>
                    <button
                        type="button"
                        onClick={() => setExpanded(v => !v)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            flexShrink: 0, padding: '0 16px', height: 40, borderRadius: 10,
                            border: '1px solid rgba(0,0,0,0.10)',
                            background: expanded ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.04)',
                            color: '#404040', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                        }}
                    >
                        {expanded ? (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000" strokeWidth="1.4" strokeLinecap="round"><path d="M3 12L13 4M13 12L3 4" /></svg>
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#000" strokeWidth="1.4" strokeLinecap="round"><path d="M1.5 3.5h13M1.5 8h13M1.5 12.5h13" /></svg>
                        )}
                        <span>More</span>
                    </button>

                    <div style={{ display: 'flex', flex: 4, alignItems: 'center', gap: 6, minWidth: 0 }}>
                        {items.map((it) => (
                            <a
                                key={it}
                                href="#"
                                onClick={(e) => e.preventDefault()}
                                style={{
                                    ...itemLinkStyle,
                                    border: expanded ? '1px solid transparent' : '1px solid rgba(0,0,0,0.15)',
                                    opacity: expanded ? 0 : 1, pointerEvents: expanded ? 'none' : 'auto',
                                    transition: 'opacity .12s ease, border-color .2s ease',
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.4)'; e.currentTarget.style.color = '#000'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)'; e.currentTarget.style.color = '#525252'; }}
                            >
                                {it}
                            </a>
                        ))}
                    </div>
                </div>
            </nav>
        </div>
    );
};

export type ComponentItem = {
    id: string;
    title: string;
    category: "text" | "effect" | "background" | "button" | "cursor" | "3d" | "custom" | "scroll" | "image-interaction" | "interactive-background" | "loader" | "navbar" | "footer";
    preview: (props?: any) => React.ReactNode;
    code: string;
    vibePrompt: string;
    description?: string;
    uploader?: string;
    /** Optional contributor/author displayed as a credit badge on the detail
     * page. `avatar` is an optional image path; when omitted an initials
     * avatar is rendered from the name. */
    contributor?: {
        name: string;
        avatar?: string;
    };
    imageUrl?: string;
    isPremium?: boolean;
    downloadUrl?: string;
    liveUrl?: string;
    /** ISO date the component was added — drives the auto-expiring "NEW" badge. */
    addedAt?: string;
    /** Optional badge lifetime in days (default: 120 = 4 months). */
    newBadgeDays?: number;
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
    'gravitational-vortex': GravitationalVortex,
    'black-hole-3d': BlackHole3d,
    'blooming-flower': BloomingFlower,
    'chandelier': Chandelier,
    'black-hole-background': BlackHoleBackground,
    'mouse-gravity-background': MouseGravityBackground,
    '3d-scroll-animation': Scroll3DAnimation,
    '3d-slider': ThreeDSlider,
    '3d-rubiks-cube': RubiksCube,
    'heart-cursor': HeartCursor,
    'lizard-cursor': LizardCursor,
    'venom-cursor': VenomCursor,
    'star-cursor': StarCursor,
    'ascii-cursor': AsciiCursor,
    'aura-cursor': AuraCursor,
    'confetti-cursor': ParticleCursor,
    'kinetic-grid': KineticGrid,
    'spin-cursor': MagicCursor,
    'user-cursor': UserCursor,
    'card-cascade': CardCascade,

    'cards-beam': CardsBeam,
    'solar-system': SolarSystem,
    '3d-hero': ToonhubHero,
    'fourier-flow': FourierFlow,
    'svg-page-transition': SVGPageTransition,
    'section-scroll': SectionScroll,
    'cloud-scroll': CloudScroll,
    'infinite-marquee': InfiniteMarquee,
    'hacker-background': HackerBackground,

    'beam-grid-background': BeamGridBackground,
    'fall-beam-background': FallBeamBackground,
    'hell-background': HellBackground,
    'interactive-grid-background': InteractiveGridBackground,
    'wave-background': WaveBackground,
    'corner-border-button': CornerBorderButton,
    'corner-button': CornerButton,
    'creepy-button': CreepyButton,
    'radial-glow-button': RadialGlowButton,
    'spider-web': SpiderWeb,
    'spiral-images': SpiralImages,
    'infinity-image': InfinityImage,
    'interactive-hover-button': InteractiveHoverButton,
    'isometric-grid-background': IsometricGridBackground,
    'magic-card-effect': MagicCard,
    'marquee-hover-button': MarqueeHoverButton,
    'payment-transaction-button': PaymentTransactionButton,
    'rainbow-button': RainbowButton,
    'sparkles-background': SparklesBackground,
    'grid-background': BackgroundBoxes,
    'lines-background': BackgroundPaths,
    'border-beam': BorderBeam,
    'glow-button': GlowButton,
    'galaxy-button': GalaxyButton,
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
    'scramble-text': ScrambleText as any,
    'scroll-text-highlight': ScrollHighlight as any,
    'smoky-text': SmokyText as any,
    'point-dna-helix': PointDNAHelix,
    'twin-galaxy-rings': TwinGalaxyRings,
    'tornado': Tornado,
    'particle-sphere': ParticleSphere,
    'morphing-rings': MorphingRings,
    'block-drift': BlockDrift,
    'lightfall': Lightfall,
    'isometric-portal': IsometricPortal,
    'morphing-glow': MorphingGlow,
    'gear-system': GearSystem,
    'hourglass': Hourglass,
    'generating-orb': GeneratingOrb,
    'trading-candles': TradingCandles,
    'pixel-bounce': PixelBounce,
    'gradient-orb': GradientOrb,
    'super-mario': SuperMario,
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

// ── HAUL! Footer scoped preview ─────────────────────
// Self-contained preview so it renders without pulling motion/react or
// lucide-react into the data module. Reflects the HAUL! footer design as a
// compact, fixed-height showcase inside the library preview card.
const HaulFooterPreview: React.FC = () => {
    const links = {
        Company: ["Founding", "Platform", "Testify"],
        Mobile: ["Get Apple App", "Get Google App"],
        Contracts: ["Private Data", "User Consent"],
    };

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 560,
            background: '#f8f9fa',
            overflow: 'hidden',
            fontFamily: "'Inter', system-ui, sans-serif",
        }}>
            <style>{`
                @keyframes haul-fade-in { from { opacity: 0; } to { opacity: 1; } }
                .haul-fade { animation: haul-fade-in 0.8s ease-out both; }
                @keyframes haul-card-in { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                .haul-card { animation: haul-card-in 0.8s ease-out both; }
                .haul-social { transition: all 0.3s ease; }
                .haul-social:hover { background: #f97316; color: #fff; border-color: #f97316; }
            `}</style>

            {/* Short spacer */}
            <div style={{ height: 64, background: '#FDFDFD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p className="haul-fade" style={{ fontSize: 13, color: '#d1d5db', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5em' }}>
                    View Below
                </p>
            </div>

            {/* Parallax backdrop */}
            <div style={{
                position: 'relative',
                height: 496,
                overflow: 'hidden',
                backgroundImage: 'url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                {/* Top-aligned footer card */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 32 }}>
                    <div className="haul-card" style={{
                        maxWidth: '80rem',
                        margin: '0 auto',
                        padding: '0 1rem',
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(4px)',
                            WebkitBackdropFilter: 'blur(4px)',
                            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                            borderRadius: '1rem',
                            overflow: 'hidden',
                        }}>
                            {/* Top half */}
                            <div style={{ padding: '2rem 1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: 24 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        background: '#f97316',
                                        width: 44,
                                        height: 44,
                                        borderRadius: '0.5rem',
                                        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                                        padding: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <svg viewBox="0 0 256 256" width="100%" height="100%" fill="white" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                                        </svg>
                                    </div>
                                    <span style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.05em' }}>HAUL!</span>
                                </div>

                                {/* Link columns */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, textAlign: 'left' }}>
                                    {Object.entries(links).map(([group, items]) => (
                                        <div key={group}>
                                            <p style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#111827', marginBottom: 10 }}>{group}</p>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                                                {items.map((item) => (
                                                    <a key={item} href="#" style={{ color: '#6b7280', fontWeight: 500, fontSize: 13, textDecoration: 'none' }} className="haul-link">{item}</a>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom bar */}
                            <div style={{
                                borderTop: '1px solid #f3f4f6',
                                background: '#ffffff',
                                padding: '1rem 1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 12,
                            }}>
                                <p style={{ fontSize: 14, color: '#6b7280', fontWeight: 500, margin: 0 }}>© 2026 HAUL! All Rights Reserved</p>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {["M26 3.4c-.6.3-2.2.9-2.6 1 .3.2.5.7.6 1 .3 1.0.3 1.4.3 2.2 0 6.7-3 9.3-6.6 10.8 3.4.9 6 .0 7.8-1.2 2.3-1.5 3.9-3.8 4.2-6.6.3 2.4 1.5 4.4 3.4 5.7 1.7-1 2.3-2.8.8-7.1-.2-.5-.3-1.2-.9-2.4.1 0-.1-1.4-1.3-2.4 1 .0-2.2-.5-3.1-.4 .1-1.3-.2-2.6-1.3-3.2z", 
                                        "M4 12l14-6-3 8 3 7-14-9", 
                                        "M12 2c2.5 0 2.8 1 4 1s2-.5 4-1l-1.5 4.5M12 22c-2.5 0-2.8-1-4-1s-2 .5-4 1l1.5-4.5", 
                                        "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"].map((icon, i) => (
                                        <a key={i} href="#" className="haul-social" style={{
                                            width: 40, height: 40, borderRadius: '50%', border: '1px solid #f3f4f6',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
                                        }}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d={icon} />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Truck parallax layer */}
                <div style={{ position: 'absolute', inset: '0 0 0 0', bottom: 0, zIndex: 20, pointerEvents: 'none' }}>
                    <img
                        src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
                        alt="HAUL! truck"
                        style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'bottom', transformOrigin: 'bottom', transform: 'scale(1.05)' }}
                    />
                </div>
            </div>
        </div>
    );
};

const VizeFooterPreview: React.FC = () => {
    const productLinks = ["Features", "Solutions", "Pricing", "Updates"];
    const scienceLinks = ["Approach", "Identity", "Research", "Metrics"];
    const companyLinks = ["About Us", "Partners", "Careers"];

    const logoPaths = [
        "M6.94 5a5 5 0 0 0-2.29 3.9c-.4 2.92.6 5.75 3.03 7.55 1.6 1.2 3.66 1.6 5.6 1.1.7-.2 1.4-.53 2-.9.6-.36 1.2-.8 1.2-1.53 0-.78-1.02-1.25-1.7-.9",
        "M12 2c2.5 0 2.8 1 4 1s2-.5 4-1l1.5 4.5M12 22c-2.5 0-2.8-1-4-1s-2 .5-4 1l1.5-4.5M14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"
    ];

    return (
        <div style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            minHeight: 820,
            background: '#F0F1F3',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontFamily: "'Inter', system-ui, sans-serif",
            padding: '2rem 1rem',
        }}>
            <style>{`
                @keyframes vize-glass-in { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }
                .vize-glass { animation: vize-glass-in 1.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
                @keyframes vize-fade { from { opacity: 0; } to { opacity: 1; } }
                .vize-link { transition: color 0.2s ease; }
                .vize-link:hover { color: #31A8FF; }
                .vize-social { transition: all 0.2s ease; }
                .vize-social:hover { background: #f1f5f9; }
                .vize-social:active { transform: scale(0.95); }
            `}</style>

            {/* FooterCard */}
            <div style={{ width: '100%', maxWidth: '72rem', margin: '0 auto' }}>
                <div style={{
                    background: '#E9EBEE',
                    borderRadius: '48px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    overflow: 'hidden',
                }}>
                    <div style={{
                        background: '#ffffff',
                        borderRadius: '40px',
                        margin: '0.5rem',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}>
                        <div style={{
                            padding: '2rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(1, 1fr)',
                            gap: '3rem',
                        }}>
                            {/* Brand Info */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{
                                        width: 32,
                                        height: 32,
                                        background: '#31A8FF',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        flexShrink: 0,
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 20C4 20 4 14 10 10C16 6 20 4 20 4C20 4 18 8 14 14C10 20 4 20 4 20Z" fill="white" />
                                            <path d="M4 20L10 14" stroke="white" strokeWidth="2" strokeLinecap="round" />
                                        </svg>
                                    </div>
                                    <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: '#0F172A' }}>vize</span>
                                </div>
                                <p style={{ color: '#64748B', lineHeight: 1.625, fontSize: 16, fontWeight: 400, maxWidth: 320, margin: 0 }}>
                                    Premium strategic solutions designed to elevate your brand presence through advanced marketing.
                                </p>
                                {/* Socials */}
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {logoPaths.map((d, i) => (
                                        <button key={i} type="button" className="vize-social" style={{
                                            width: 44,
                                            height: 44,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '12px',
                                            border: '1px solid #f1f5f9',
                                            background: '#ffffff',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                            cursor: 'pointer',
                                        }}>
                                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d={d} />
                                            </svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom legal bar */}
                    <div style={{
                        padding: '1.25rem 2rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1.5rem',
                        fontSize: 15,
                    }}>
                        <p style={{ color: '#64748B', fontWeight: 500, margin: 0 }}>© 2025 Vize. All rights reserved.</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', color: '#64748B', fontWeight: 500 }}>
                            <a href="#" className="vize-link" style={{ textDecoration: 'none', color: 'inherit' }}>Legal Center</a>
                            <div style={{ width: 1, height: 16, background: '#cbd5e1' }} />
                            <a href="#" className="vize-link" style={{ textDecoration: 'none', color: 'inherit' }}>User Agreement</a>
                        </div>
                    </div>
                </div>
            </div>

            {/* GlassText */}
            <div className="vize-glass" style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', paddingTop: 0, marginTop: '-2rem' }}>
                <svg className="absolute w-0 h-0" aria-hidden="true" focusable="false" style={{ position: 'absolute', width: 0, height: 0 }}>
                    <defs>
                        <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" result="outer-shadow" />
                            <feComponentTransfer in="SourceAlpha" result="alpha"><feFuncA type="linear" slope="1" /></feComponentTransfer>
                            <feOffset in="alpha" dx="0" dy="4" result="offset-white" />
                            <feGaussianBlur in="offset-white" stdDeviation="4" result="blur-white" />
                            <feComposite in="alpha" in2="blur-white" operator="out" result="inner-white-mask" />
                            <feFlood floodColor="#ffffff" floodOpacity="0.25" result="white-fill" />
                            <feComposite in="white-fill" in2="inner-white-mask" operator="in" result="inner-white-final" />
                            <feGaussianBlur in="alpha" stdDeviation="6" result="blur-black" />
                            <feComposite in="alpha" in2="blur-black" operator="out" result="inner-black-mask" />
                            <feFlood floodColor="#000000" floodOpacity="0.25" result="black-fill" />
                            <feComposite in="black-fill" in2="inner-black-mask" operator="in" result="inner-black-final" />
                            <feMerge>
                                <feMergeNode in="outer-shadow" />
                                <feMergeNode in="SourceGraphic" />
                                <feMergeNode in="inner-white-final" />
                                <feMergeNode in="inner-black-final" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>
                <h1 style={{
                    fontSize: 'min(25vw, 400px)',
                    fontWeight: 700,
                    letterSpacing: 'normal',
                    lineHeight: 1,
                    color: 'white',
                    padding: '0 1rem',
                    margin: 0,
                    filter: 'url(#glass-effect)',
                }}>vize</h1>
            </div>
        </div>
    );
};

const AlpineFooterPreview: React.FC = () => {
    const [modal, setModal] = useState<string | null>(null);

    const metadataTags = ["Font: SF Pro", "Framework: Next.js", "Last Updated: Jul 23, 2026"];
    const policyPills = ["Privacy Policy", "Manifesto", "Changelog"];

    const modalContent: Record<string, { title: string; body: string }> = {
        "Privacy Policy": {
            title: "Privacy Policy",
            body: "We respect your privacy. Information collected is used solely to improve the alpine-footer experience and is never sold to third parties. Your data stays yours.",
        },
        Manifesto: {
            title: "Manifesto",
            body: "Crafted for the love of craft. AlpineFooter celebrates the calm of mountain mornings, the precision of long-form design, and the belief that a footer can be a little landscape of its own.",
        },
        Changelog: {
            title: "Changelog",
            body: "v2.0 — Scenic alpine backdrop, vintage postage stamp cachet, system badges and policy pills. v1.0 — Initial release with attribution line and modal sheets.",
        },
    };

    const stampImage = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788246818/ChatGPT_Image_Sep_1_2026_12_43_09_PM_exqydf.png";

    return (
        <div style={{
            position: "relative",
            width: "100%",
            minHeight: 900,
            background: "#0f172a",
            overflow: "hidden",
            fontFamily: "'Inter', system-ui, sans-serif",
            color: "#1f2937",
        }}>
            <style>{`
                .alpine-pill { background: #e2e5e9; border-radius: 6px; padding: 4px 14px; font-size: 12px; color: #374151; cursor: pointer; transition: background 0.2s; border: none; }
                .alpine-pill:hover { background: #d8dce1; }
                .alpine-author { background: #dce7e1; color: #2c443b; border-radius: 5px; padding: 2px 10px; transition: background 0.2s; }
                .alpine-author:hover { background: #ceddd6; }
                .alpine-live:hover { background: #000000 !important; transform: translateY(-1px); }
                .alpine-pretzel { display: inline-block; transition: transform 0.15s; }
                .alpine-pretzel:hover { transform: scale(1.1); }
                .alpine-modal { animation: alpine-in 0.25s cubic-bezier(0.16,1,0.3,1) both; }
                @keyframes alpine-in { from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .alpine-backdrop { animation: alpine-fade 0.2s ease both; }
                @keyframes alpine-fade { from { opacity: 0; } to { opacity: 1; } }
            `}</style>

            {/* Scenic background */}
            <div style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url(${stampImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center top",
                backgroundRepeat: "no-repeat",
            }} />

            {/* Top card container */}
            <div style={{
                position: "relative",
                zIndex: 20,
                maxWidth: "80rem",
                margin: "0 auto",
                padding: "1.25rem 1rem 1rem",
                minHeight: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start",
            }}>
                <div id="alpine-footer-main-card" style={{
                    width: "100%",
                    maxWidth: "72rem",
                    background: "#C4C4C4",
                    borderRadius: 24,
                    border: "1px solid rgba(255,255,255,0.6)",
                    boxShadow: "0 10px 35px rgba(0,0,0,0.09)",
                    padding: "1.5rem",
                }}>
                    {/* Top: stamp + cachet */}
                    <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                        <div style={{ background: "#e2e5e8", padding: "0.625rem", borderRadius: 2, boxShadow: "0 1px 2px rgba(0,0,0,0.05)", display: "inline-block", position: "relative" }}>
                            {/* Inner artwork */}
                            <div style={{
                                width: 110,
                                height: 78,
                                border: "1px solid rgba(0,0,0,0.15)",
                                backgroundImage: `url(${stampImage})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                filter: "saturate(1.1) contrast(1.05)",
                            }} />
                        </div>

                        {/* Cachet sticker */}
                        <div style={{
                            position: "absolute",
                            right: 4,
                            top: 8,
                            transform: "rotate(-8deg)",
                            border: "1px solid rgba(117,149,136,0.8)",
                            background: "rgba(232,240,236,0.4)",
                            backdropFilter: "blur(0.5px)",
                            padding: "2px 8px",
                            borderRadius: 2,
                            boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
                            textAlign: "center",
                            whiteSpace: "nowrap",
                        }}>
                            <div style={{ fontFamily: "monospace", fontSize: 7, letterSpacing: "0.2em", color: "#5c7f71", textTransform: "uppercase" }}>PAR AVION</div>
                            <div style={{ fontFamily: "monospace", fontSize: 9.5, letterSpacing: "0.15em", color: "#3d5c50", textTransform: "uppercase", fontWeight: 700, borderTop: "1px solid rgba(117,149,136,0.5)", borderBottom: "1px solid rgba(117,149,136,0.5)", padding: "1px 0" }}>LUFTPOST</div>
                            <div style={{ fontFamily: "monospace", fontSize: 6.5, letterSpacing: "0.2em", color: "#5c7f71", textTransform: "uppercase" }}>PRIORITAIRE</div>
                        </div>
                    </div>

                    {/* Middle: badges + policy pills */}
                    <div style={{ maxWidth: "42rem", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {metadataTags.map((t) => (
                                <span key={t} className="alpine-pill" style={{ pointerEvents: "none" }}>{t}</span>
                            ))}
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                            {policyPills.map((p) => (
                                <button key={p} type="button" className="alpine-pill" onClick={() => setModal(p)}>{p}</button>
                            ))}
                        </div>
                    </div>

                    {/* Bottom: attribution */}
                    <div style={{ marginTop: "1.5rem", fontSize: 13, color: "#374151", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 4 }}>
                        <span>Made with</span>
                        <span className="alpine-pretzel" style={{ fontSize: 16, margin: "0 2px" }}>🥨</span>
                        <span>By</span>
                        <span className="alpine-author" style={{ margin: "0 2px", fontWeight: 500 }}>UI HUB</span>
                        <span>in California.</span>
                    </div>

                    {/* Bottom: View Live button */}
                    <div style={{ marginTop: "1.5rem", display: "flex" }}>
                        <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="alpine-live"
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 8,
                                background: "#1f2937",
                                color: "#ffffff",
                                borderRadius: 999,
                                padding: "10px 20px",
                                fontSize: 14,
                                fontWeight: 600,
                                textDecoration: "none",
                                boxShadow: "0 6px 18px rgba(15,23,42,0.18)",
                                transition: "background 0.2s, transform 0.15s",
                            }}
                        >
                            View Live
                            <span style={{ fontSize: 15, lineHeight: 1 }}>↗</span>
                        </a>
                    </div>
                </div>

                {/* Lower scenic spacer */}
                <div style={{ minHeight: 360, width: "100%" }} />
            </div>

            {/* Modal */}
            {modal && (
                <>
                    <div className="alpine-backdrop" onClick={() => setModal(null)} style={{ position: "absolute", inset: 0, zIndex: 30, background: "rgba(10,20,30,0.45)", backdropFilter: "blur(4px)" }} />
                    <div className="alpine-modal" style={{ position: "absolute", zIndex: 31, left: "50%", top: "42%", transform: "translate(-50%,-50%)", width: "min(92%, 420px)", background: "#ffffff", borderRadius: 18, boxShadow: "0 20px 50px rgba(0,0,0,0.3)", padding: "1.6rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>{modalContent[modal].title}</h3>
                            <button type="button" onClick={() => setModal(null)} style={{ border: "none", background: "#eef1f5", width: 30, height: 30, borderRadius: 8, cursor: "pointer", fontSize: 15, color: "#374151" }}>✕</button>
                        </div>
                        <p style={{ fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: 0 }}>{modalContent[modal].body}</p>
                    </div>
                </>
            )}
        </div>
    );
};

const LeeuwarderGolfclubPreview: React.FC = () => {
    const starEmblem = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788254211/ChatGPT_Image_Sep_1_2026_02_46_36_PM_gxnmtp.png";

    const Arrow = ({ color = "#004A35" }: { color?: string }) => (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const ArrowUpRight = () => (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 17L17 7M17 7H8M17 7V16" stroke="#00F27A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const Star = () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2l2.9 6.26L21.5 9.27l-4.9 4.57 1.24 7.16L12 17.77l-5.84 3.23 1.24-7.16L2.5 9.27l6.6-1.01L12 2z" />
        </svg>
    );
    const Check = () => (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 6L9 17l-5-5" stroke="#00F27A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
    const ChefHat = () => (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#FBBF24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3a4.5 4.5 0 0 0-4.5 4.5c0 .4.05.8.15 1.17A4.75 4.75 0 0 0 4 13.25 4.9 4.9 0 0 0 6 17.5v1.2a1.3 1.3 0 0 0 1.3 1.3h9.4a1.3 1.3 0 0 0 1.3-1.3v-1.2a4.9 4.9 0 0 0 2-4.25 4.75 4.75 0 0 0-3.15-4.58c.1-.37.15-.77.15-1.17A4.5 4.5 0 0 0 12 3z" />
        </svg>
    );

    const partnerStyle: React.CSSProperties = {
        aspectRatio: "1 / 1",
        borderRadius: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "#004D36",
        transition: "background .2s, transform .2s, box-shadow .2s",
        cursor: "pointer",
        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
    };

    return (
        <div style={{
            width: "100%",
            minHeight: 900,
            background: "radial-gradient(circle at 30% 20%, #39544a, #2c3f30)",
            padding: "0 0 10px",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
        }}>
            <style>{`
                .lg-pillar:hover { transform: translateY(-1px); }
                .lg-pillar:hover { transform: translateY(-1px); }
                .lg-card:hover { transform: translateY(-4px); box-shadow: 0 10px 22px rgba(0,0,0,0.22); background: #005B40; }
                .lg-link { color: rgba(255,246,199,0.85); transition: color .2s; }
                .lg-link:hover { color: #00F27A; }
                .lg-so-link { display: inline-flex; align-items: center; gap: 4px; color: #FFF6C7; text-decoration: none; transition: color .2s; }
                .lg-so-link:hover { color: #00F27A; }
                .lg-so-link span { transition: transform .2s; display: inline-block; }
                .lg-so-link:hover span { transform: translate(2px,-2px); }
                .lg-arrow-slide { transition: transform .2s; display: inline-block; }
                .lg-live:hover { transform: translateY(-1px); }
            `}</style>

            <div style={{
                width: "100%",
                maxWidth: "80rem",
                padding: "18px 0 0",
            }}>
                {/* Canvas cream inner container */}
                <div style={{
                    background: "#FAF5DF",
                    borderRadius: 48,
                    overflow: "hidden",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
                }}>

                    {/* === PARTNERS SECTION === */}
                    <div style={{ padding: "54px 32px 40px", textAlign: "center" }}>
                        <h2 style={{
                            margin: "0 0 18px",
                            fontSize: 38,
                            fontWeight: 700,
                            color: "#1e231e",
                            letterSpacing: "-0.02em",
                        }}>
                            Onze trotse partners
                        </h2>
                        {/* Word ook partner pill */}
                        <button type="button" style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            background: "#E5F7E8",
                            border: "1px solid #B3E8BC",
                            color: "#006B4F",
                            fontSize: 13,
                            fontWeight: 600,
                            padding: "6px 16px",
                            borderRadius: 999,
                            cursor: "pointer",
                            marginBottom: 28,
                        }}>
                            Word ook partner
                            <span style={{ width: 20, height: 20, borderRadius: 999, background: "#00F27A", color: "#004A35", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#004A35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                        </button>

                        {/* Partner cards */}
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(6, 1fr)",
                            gap: 16,
                            maxWidth: "72rem",
                            margin: "0 auto",
                        }}>
                            {/* e fresh */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <div style={{ width: 40, height: 40, borderRadius: 999, border: "2px solid rgba(0,242,122,0.5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00F27A", fontSize: 14, fontWeight: 800 }}>ef</div>
                                <div style={{ color: "#00F27A", fontWeight: 700, fontSize: 13 }}>e fresh</div>
                            </div>
                            {/* Heineken */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <div style={{ color: "#FF0000", width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L21.5 9.27l-4.9 4.57 1.24 7.16L12 17.77l-5.84 3.23 1.24-7.16L2.5 9.27l6.6-1.01L12 2z" /></svg>
                                </div>
                                <div style={{ color: "#64D98A", fontWeight: 700, fontSize: 15 }}>Heineken</div>
                            </div>
                            {/* 11STEDENHAL */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <div style={{ width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#F77F00" }}>
                                    <svg width="34" height="34" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="none" stroke="#00B4D8" strokeWidth="3" /><path d="M2 12a10 6 0 0 0 20 0" fill="none" stroke="#F77F00" strokeWidth="3" /></svg>
                                </div>
                                <div style={{ color: "#38BDF8", fontWeight: 800, fontSize: 12, letterSpacing: "0.04em" }}>11STEDENHAL</div>
                            </div>
                            {/* lippe wonen */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 3, marginBottom: 8 }}>
                                    <span style={{ background: "#F59E0B", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>lippe</span>
                                </div>
                                <div style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>wonen</div>
                            </div>
                            {/* NIVO */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <div style={{ color: "#C084FC", fontWeight: 900, fontSize: 24 }}>NIV</div>
                                    <Check />
                                </div>
                            </div>
                            {/* Sligro */}
                            <div className="lg-card" style={{ ...partnerStyle }}>
                                <ChefHat />
                                <div style={{ color: "#fff", fontWeight: 650, fontStyle: "italic", fontSize: 16 }}>Sligro</div>
                            </div>
                        </div>
                    </div>

                    {/* === FOOTER === */}
                    <div style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: "80rem",
                        margin: "0 auto",
                        padding: "88px clamp(24px, 6vw, 64px) 32px",
                        background: "#242424",
                        borderRadius: "48px 48px 0 0",
                    }}>
                        {/* Topographic overlay */}
                        <svg
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", color: "rgba(255,255,255,0.10)", zIndex: 0 }}
                            xmlns="http://www.w3.org/2000/svg">
                            <g fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.5">
                                <path d="M0 180 C 200 120, 400 240, 700 160 C 900 100, 1100 220, 1400 150" />
                                <path d="M0 260 C 250 200, 500 320, 800 240 C 1000 190, 1200 300, 1400 230" />
                                <path d="M0 340 C 200 280, 450 400, 750 320 C 950 270, 1200 380, 1400 310" />
                                <path d="M0 420 C 300 360, 550 480, 850 400 C 1050 350, 1300 460, 1400 390" />
                                <path d="M0 500 C 220 440, 470 560, 770 480 C 970 430, 1250 540, 1400 470" />
                                <path d="M0 580 C 260 520, 520 640, 820 560 C 1020 510, 1280 620, 1400 550" />
                            </g>
                        </svg>

                        {/* Center floating star emblem */}
                        <img
                            src={starEmblem}
                            alt="Leeuwarder Golfclub logo"
                            style={{
                                position: "absolute",
                                top: -70,
                                left: "50%",
                                transform: "translateX(-50%)",
                                zIndex: 30,
                                width: 120,
                                height: 120,
                                objectFit: "contain",
                                filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5))",
                                transition: "transform .3s",
                                cursor: "pointer",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateX(-50%) scale(1.05)")}
                            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateX(-50%)")}
                        />

                        {/* 3-column layout */}
                        <div style={{
                            position: "relative",
                            zIndex: 1,
                            display: "grid",
                            gridTemplateColumns: "repeat(12, 1fr)",
                            gap: 24,
                        }}>
                            {/* LEFT column */}
                            <div style={{ gridColumn: "span 4", textAlign: "left" }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFF6C7", margin: "0 0 12px" }}>Contact</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
                                    <div style={{ fontSize: 13.5, color: "rgba(255,246,199,0.85)", lineHeight: 1.7 }}>
                                        <div style={{ marginBottom: 6 }}>Woelwijk 101,<br />8926 XD Leeuwarden</div>
                                        <div className="lg-link" style={{ marginBottom: 6, cursor: "pointer" }}>0511 - 43 22 99</div>
                                        <div className="lg-link" style={{ cursor: "pointer" }}>info@leeuwardergolfclub.nl</div>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, fontSize: 13.5 }}>
                                        <a className="lg-so-link" href="#" onClick={(e) => e.preventDefault()}>Facebook <span><ArrowUpRight /></span></a>
                                        <a className="lg-so-link" href="#" onClick={(e) => e.preventDefault()}>Instagram <span><ArrowUpRight /></span></a>
                                        <a className="lg-so-link" href="#" onClick={(e) => e.preventDefault()}>LinkedIn <span><ArrowUpRight /></span></a>
                                    </div>
                                </div>

                                {/* Score & badges */}
                                <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-start" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ background: "#00F27A", color: "#121212", fontWeight: 900, fontSize: 11, padding: "2px 8px", borderRadius: 999 }}>7,9</span>
                                        <span style={{ color: "rgba(255,246,199,0.9)", fontSize: 12 }}>Leadingcourses score</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        {/* NGF */}
                                        <div style={{ background: "#E05A1E", width: 28, height: 32, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 900 }}>NGF</div>
                                        {/* Leadingcourses */}
                                        <div style={{ background: "#0E4A35", border: "1px solid rgba(0,242,122,0.4)", width: 46, height: 32, borderRadius: 4, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, color: "#FBBF24" }}>
                                            <Star />
                                            <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>2024</span>
                                        </div>
                                        {/* GOLF.NL */}
                                        <div style={{ background: "#009EE0", width: 56, height: 22, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>GOLF.NL</div>
                                        {/* PGA flag */}
                                        <div style={{ display: "flex", width: 10, height: 32, borderRadius: 3, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)" }}>
                                            <div style={{ flex: 1, background: "#E8380D" }} />
                                            <div style={{ flex: 1, background: "#fff" }} />
                                            <div style={{ flex: 1, background: "#244FAE" }} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CENTER column */}
                            <div style={{ gridColumn: "span 4", textAlign: "center", padding: "0 8px" }}>
                                <div style={{ fontWeight: 900, fontSize: 46, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#FFF6C7" }}>
                                    Leeuwarder<br />Golfclub
                                </div>
                                <div style={{ fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: "italic", fontSize: 21, color: "rgba(255,246,199,0.95)", margin: "10px 0 28px" }}>
                                    Waar golfgeluk begint
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="lg-live" style={{
                                        display: "inline-flex", alignItems: "center", gap: 8,
                                        background: "#00F27A", color: "#111111", fontWeight: 700, fontSize: 14,
                                        borderRadius: 999, padding: "10px 20px", textDecoration: "none",
                                        boxShadow: "0 4px 14px rgba(0,242,122,0.35)", transition: "transform .2s",
                                    }}>
                                        Starttijd reserveren
                                        <span style={{ width: 20, height: 20, borderRadius: 999, background: "#0E281C", color: "#00F27A", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#00F27A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </span>
                                    </a>
                                    <a href="#" onClick={(e) => e.preventDefault()} className="lg-live" style={{
                                        display: "inline-flex", alignItems: "center", gap: 8,
                                        background: "#006B4F", color: "#FFF6C7", fontWeight: 700, fontSize: 14,
                                        borderRadius: 999, padding: "10px 20px", textDecoration: "none",
                                        border: "1px solid rgba(0,242,122,0.2)", boxShadow: "0 6px 16px rgba(0,0,0,0.25)", transition: "transform .2s",
                                    }}>
                                        Direct lid worden
                                        <span style={{ width: 20, height: 20, borderRadius: 999, background: "#00F27A", color: "#004A35", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#004A35" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                        </span>
                                    </a>
                                </div>
                            </div>

                            {/* RIGHT column */}
                            <div style={{ gridColumn: "span 4", textAlign: "left" }}>
                                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#FFF6C7", margin: "0 0 12px" }}>Snel naar</h3>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, fontSize: 13.5, marginBottom: 24 }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>Onze club</span>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>Voor gasten</span>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>Begin met Golf</span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>De baan</span>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>Onze evenementen</span>
                                        <span className="lg-link" style={{ cursor: "pointer" }}>Contact</span>
                                    </div>
                                </div>
                                <div style={{
                                    background: "#FFF6C7", color: "#1E1E1E", fontSize: 11, fontWeight: 500,
                                    padding: "4px 14px", borderRadius: 5, boxShadow: "0 1px 3px rgba(0,0,0,0.3)", display: "inline-block",
                                }}>
                                    Cookies policy&nbsp;&nbsp;|&nbsp;&nbsp;Privacy policy&nbsp;&nbsp;|&nbsp;&nbsp;©2025
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const NewsletterCardPreview: React.FC = () => {
    const [joined, setJoined] = useState(false);
    const [email, setEmail] = useState("");
    const promoBg = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788255735/ChatGPT_Image_Sep_1_2026_03_11_12_PM_kzw430.png";
    const cardBg = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788257136/ChatGPT_Image_Sep_1_2026_03_32_14_PM_ustzc6.png";
    const avatars = [
        { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 1" },
        { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 2" },
        { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 3" },
        { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 4" },
        { url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 5" },
    ];

    const iconButton: React.CSSProperties = {
        width: 34,
        height: 34,
        borderRadius: 999,
        background: "rgba(255,255,255,0.8)",
        color: "#152038",
        border: "1px solid rgba(255,255,255,0.8)",
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        padding: 0,
    };

    const InstagramIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="5" stroke="#152038" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="4" stroke="#152038" strokeWidth="1.8" />
            <circle cx="17.2" cy="6.8" r="1.2" fill="#152038" />
        </svg>
    );
    const GithubIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#152038" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.91-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.63.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.85.09-.66.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.03-2.75-.1-.26-.45-1.3.1-2.72 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.46.1 2.72.64.71 1.03 1.63 1.03 2.75 0 3.95-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.8 0 .27.18.6.69.49A10.24 10.24 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
        </svg>
    );
    const LinkedinIcon = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#152038" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V23H.5V8zM8 8h3.84v2.05h.05c.53-1 1.83-2.05 3.77-2.05C19.78 8 21 10.34 21 13.57V23h-4v-8.4c0-2-.04-4.58-2.8-4.58-2.8 0-3.2 2.18-3.2 4.43V23H8V8z" />
        </svg>
    );

    return (
        <div style={{
            position: "relative",
            width: "100%",
            minHeight: 540,
            overflow: "hidden",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            WebkitFontSmoothing: "antialiased",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
        }}>
            {/* Full page background */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${promoBg})`, backgroundSize: "cover", backgroundPosition: "center", zIndex: 0 }} />

            {/* Card */}
            <div id="newsletter-card" style={{
                position: "relative",
                width: "100%",
                maxWidth: 1000,
                minHeight: 295,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.4)",
                overflow: "hidden",
                backdropFilter: "blur(16px)",
                background: "rgba(255,255,255,0.2)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
                zIndex: 1,
            }}>
                {/* Card internal background */}
                <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${cardBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                {/* Overlay */}
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.25)", backdropFilter: "blur(2px)", pointerEvents: "none" }} />

                {/* Inner content */}
                <div style={{
                    position: "relative",
                    zIndex: 10,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: "100%",
                    width: "100%",
                }}>
                    {/* LEFT */}
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        padding: "44px 0 40px 46px",
                        maxWidth: 460,
                    }}>
                        <h2 style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 24,
                            lineHeight: "29px",
                            letterSpacing: "-0.015em",
                            color: "#152038",
                            textShadow: "0 1px 1px rgba(255,255,255,0.8)",
                            whiteSpace: "nowrap",
                        }}>Subscribe to Our Community</h2>

                        <p style={{
                            margin: "10px 0 0",
                            fontWeight: 500,
                            fontSize: 13,
                            lineHeight: "18px",
                            maxWidth: 390,
                            color: "#2c3e55",
                            textShadow: "0 1px 1px rgba(255,255,255,0.6)",
                        }}>
                            Get exclusive access to cutting-edge tech insights, industry trends, and expert advice delivered straight to your inbox. Join our growing community today!
                        </p>

                        {/* Form */}
                        <form onSubmit={(e) => { e.preventDefault(); setJoined(true); setEmail(""); }} style={{ marginTop: 22, display: "flex", flexWrap: "wrap", gap: 12 }}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email here"
                                aria-label="Email address"
                                style={{
                                    width: 255,
                                    height: 37,
                                    padding: "0 16px",
                                    fontSize: 13,
                                    color: "#152038",
                                    background: "rgba(255,255,255,0.9)",
                                    backdropFilter: "blur(12px)",
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    borderRadius: 999,
                                    outline: "none",
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    width: 87,
                                    height: 37,
                                    background: "rgba(255,255,255,0.9)",
                                    color: "#152038",
                                    fontWeight: 600,
                                    fontSize: 13,
                                    borderRadius: 999,
                                    border: "1px solid rgba(255,255,255,0.6)",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                                    backdropFilter: "blur(12px)",
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    userSelect: "none",
                                }}
                            >
                                {joined ? "Joined!" : "Join Now"}
                            </button>
                        </form>

                        {/* Avatars */}
                        <div style={{ marginTop: 24, display: "flex", alignItems: "center", userSelect: "none" }}>
                            <div style={{ display: "flex" }}>
                                {avatars.map((a, i) => (
                                    <img
                                        key={a.url}
                                        src={a.url}
                                        alt={a.alt}
                                        width={27}
                                        height={27}
                                        style={{
                                            width: 27,
                                            height: 27,
                                            borderRadius: 999,
                                            border: "1.5px solid #fff",
                                            objectFit: "cover",
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                                            marginLeft: i === 0 ? 0 : -6,
                                        }}
                                    />
                                ))}
                            </div>
                            <span style={{ marginLeft: 12, fontWeight: 600, fontSize: 12, lineHeight: 1, color: "#152038", textShadow: "0 1px 1px rgba(255,255,255,0.7)" }}>5,000+ happy members</span>
                        </div>
                    </div>

                    {/* RIGHT social icons */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: 46 }}>
                        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#152038", textShadow: "0 1px 1px rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>SOCIAL MEDIA</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                            <button type="button" style={iconButton} aria-label="Instagram"><InstagramIcon /></button>
                            <button type="button" style={iconButton} aria-label="Github"><GithubIcon /></button>
                            <button type="button" style={iconButton} aria-label="LinkedIn"><LinkedinIcon /></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaizurPortfolioPreview: React.FC = () => {
    const services = ["Website Design", "Mobile App Design", "Sass/Dashboard", "Consultant"];
    const explore = ["All Projects", "Newsletter", "Contact"];

    return (
        <div style={{
            width: "100%",
            background: "#F8F8F8",
            padding: "24px 12px",
            fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
            display: "flex",
            justifyContent: "center",
            overflow: "hidden",
            boxSizing: "border-box",
        }}>
            <footer style={{
                width: "100%",
                maxWidth: 1240,
                background: "#E7E7E7",
                borderRadius: 40,
                overflow: "hidden",
                position: "relative",
                padding: "40px 28px 0",
                boxSizing: "border-box",
            }}>
                {/* Header row */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 16,
                }}>
                    <h2 style={{
                        margin: 0,
                        color: "#080808",
                        fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif",
                        fontWeight: 500,
                        fontSize: 27,
                        lineHeight: 1.12,
                        letterSpacing: "-0.01em",
                    }}>
                        Your product<br />design partner
                    </h2>

                    <a
                        href="https://ai.studio/apps/3a30febb-b24a-4b58-925a-0413fcf885cb"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-colors duration-200"
                        style={{
                            width: 190,
                            height: 64,
                            maxWidth: "42%",
                            flexShrink: 0,
                            borderRadius: 999,
                            border: "2px solid #080808",
                            background: "transparent",
                            color: "#080808",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 36,
                            fontWeight: 400,
                            lineHeight: 1,
                            textDecoration: "none",
                            cursor: "pointer",
                            userSelect: "none",
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#080808";
                            e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#080808";
                        }}
                    >
                        Contact
                    </a>
                </div>

                {/* 4-column navigation grid */}
                <div style={{
                    marginTop: 48,
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    columnGap: 36,
                    rowGap: 28,
                    position: "relative",
                    zIndex: 10,
                }}>
                    {/* Services */}
                    <div>
                        <h3 style={{
                            margin: "0 0 12px",
                            fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif",
                            fontSize: 17.5,
                            fontWeight: 500,
                            color: "#080808",
                        }}>
                            Services
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                            {services.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        style={{ fontSize: 13.5, lineHeight: "24px", color: "#666666", textDecoration: "none", transition: "color 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "#666666")}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Explore */}
                    <div>
                        <h3 style={{
                            margin: "0 0 12px",
                            fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif",
                            fontSize: 17.5,
                            fontWeight: 500,
                            color: "#080808",
                        }}>
                            Explore
                        </h3>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 6 }}>
                            {explore.map((item) => (
                                <li key={item}>
                                    <a
                                        href="#"
                                        onClick={(e) => e.preventDefault()}
                                        style={{ fontSize: 13.5, lineHeight: "24px", color: "#666666", textDecoration: "none", transition: "color 0.15s" }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = "#080808")}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = "#666666")}
                                    >
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Say hello */}
                    <div>
                        <h3 style={{
                            margin: "0 0 12px",
                            fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif",
                            fontSize: 17.5,
                            fontWeight: 500,
                            color: "#080808",
                        }}>
                            Say hello!
                        </h3>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                <a href="#" onClick={(e) => e.preventDefault()} style={{ height: 25, padding: "2px 10px", borderRadius: 999, background: "#F7F7F7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#080808"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#222222", whiteSpace: "nowrap" }}>@fazurrehman</span>
                                </a>
                                <a href="#" onClick={(e) => e.preventDefault()} style={{ height: 25, padding: "2px 10px", borderRadius: 999, background: "#F7F7F7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#222222", whiteSpace: "nowrap" }}>@fazurrehman</span>
                                </a>
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                <a href="#" onClick={(e) => e.preventDefault()} style={{ height: 25, padding: "2px 10px", borderRadius: 999, background: "#F7F7F7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA4C89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" /><path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" /><path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" /></svg>
                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#222222", whiteSpace: "nowrap" }}>@fazurrehman</span>
                                </a>
                                <a href="#" onClick={(e) => e.preventDefault()} style={{ height: 25, padding: "2px 10px", borderRadius: 999, background: "#F7F7F7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#222222", whiteSpace: "nowrap" }}>@faizurrehman</span>
                                </a>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <a href="#" onClick={(e) => e.preventDefault()} style={{ height: 25, padding: "2px 10px", borderRadius: 999, background: "#F7F7F7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, boxShadow: "0 1px 2px rgba(0,0,0,0.04)", cursor: "pointer" }}>
                                    <svg width="10" height="14" viewBox="0 0 38 57" fill="none"><path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" /><path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" /><path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" /><path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" /><path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" /></svg>
                                    <span style={{ fontSize: 11.5, fontWeight: 500, color: "#222222", whiteSpace: "nowrap" }}>@faizurrehman</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Creative Tools */}
                    <div style={{ cursor: "pointer" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                            <h3 style={{
                                margin: 0,
                                fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif",
                                fontSize: 17.5,
                                fontWeight: 500,
                                color: "#080808",
                            }}>
                                Creative tools
                            </h3>
                            <span style={{
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                background: "#080808",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H8M17 7V16" /></svg>
                            </span>
                        </div>

                        {/* Miniature mockup */}
                        <div style={{ width: 88, height: 64, position: "relative", marginTop: 8 }}>
                            <div style={{ width: 56, height: 52, background: "#EAEAEA", border: "1px solid #D5D5D5", borderRadius: 8, transform: "rotate(6deg)", position: "absolute", right: 4, top: 4, padding: 4, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                                <div style={{ width: 16, height: 4, background: "rgba(245,158,11,0.6)", borderRadius: 1, margin: "-6px auto 0" }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, margin: "auto auto 2px", paddingBottom: 2 }}>
                                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#3B82F6" }} />
                                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#10B981" }} />
                                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#F59E0B" }} />
                                    <span style={{ width: 6, height: 6, borderRadius: 999, background: "#EC4899" }} />
                                </div>
                            </div>
                            <div style={{ width: 42, height: 58, background: "#1E1E1E", border: "1px solid #333333", borderRadius: 6, transform: "rotate(-10deg)", position: "absolute", left: 4, top: 0, padding: 4, display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 4px 10px rgba(0,0,0,0.25)" }}>
                                <div style={{ width: 12, height: 2, background: "#525252", borderRadius: 999, margin: "0 auto" }} />
                                <div style={{ width: 16, height: 16, borderRadius: 999, background: "linear-gradient(135deg, #A855F7, #6366F1)", margin: "auto auto" }} />
                                <div style={{ width: 16, height: 2, background: "#525252", borderRadius: 999, margin: "0 auto" }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Giant Cropped Bottom Typography ("faizur") */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-end",
                    userSelect: "none",
                    pointerEvents: "none",
                    width: "100%",
                    overflow: "hidden",
                    marginTop: 32,
                }}>
                    <svg
                        viewBox="0 0 1000 200"
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            transform: "translateY(14%)",
                        }}
                    >
                        <text
                            x="50%"
                            y="180"
                            textAnchor="middle"
                            style={{
                                fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Syne', system-ui, sans-serif",
                                fontWeight: 900,
                                fontSize: "235px",
                                letterSpacing: "-0.045em",
                                fill: "#080808",
                            }}
                        >
                            faizur
                        </text>
                    </svg>
                </div>
            </footer>
        </div>
    );
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
        addedAt: "2026-08-23",
        preview: () => <MeshTextPreview />,
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
        isPremium: true,
        addedAt: "2026-08-23",
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
        addedAt: "2026-08-23",
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
        addedAt: "2026-08-23",
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
        id: "scramble-text",
        title: "Scramble Text",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => (
            <div className="w-full h-full min-h-[380px] flex flex-col items-center justify-center p-8 bg-black select-none rounded-2xl overflow-hidden relative border border-white/5">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    HOVER TO TRIGGER DIFFUSION WAVE
                </div>
                <ScrambleText
                    words="SCRAMBLE TEXT"
                    color="#FFFFFF"
                    font={{
                        fontFamily: "Inter, system-ui, sans-serif",
                        fontSize: "clamp(2.2rem, 6vw, 4.8rem)",
                        fontWeight: 800,
                        lineHeight: "1.1em",
                        letterSpacing: "0.04em",
                        textAlign: "center",
                    }}
                    enterAnimation={{
                        mode: "oneLine",
                        restState: "solid",
                        replay: true,
                        position: "above",
                        scrambleIntensity: 100,
                        ease: { type: "tween", duration: 1.8, ease: "linear" },
                        flickerEnabled: true,
                        flickerColor: "#3D5CFF",
                        flickerIntensity: 80,
                        flickerSpeed: 10,
                    }}
                    hoverAnimation={{
                        type: "diffusion",
                        lines: "oneLine",
                        radius: 3,
                        collapse: false,
                        collapseTime: 1,
                        glitchChars: "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
                        glitchShuffle: true,
                        flickerEnabled: true,
                        flickerColor: "#3D5CFF",
                        flickerIntensity: 50,
                        flickerSpeed: 10,
                        waveEase: { type: "tween", duration: 1.5, ease: "linear" },
                        waveShuffleLimitEnabled: false,
                        waveShuffleLimitValue: 10,
                    }}
                />
                <p className="text-xs font-mono text-neutral-400 tracking-wider uppercase mt-8">
                    Interactive kinetic glitch reveal • diffusion radius & wave pulse
                </p>
            </div>
        ),
        code: `import React from 'react';
import { ScrambleText } from '@/components/animations/ScrambleText';

export function ScrambleTextDemo() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center bg-black p-8">
      <ScrambleText
        words="SCRAMBLE TEXT"
        color="#ffffff"
        font={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "clamp(2rem, 5vw, 4rem)",
          fontWeight: 800,
          lineHeight: "1.1em",
          letterSpacing: "0.04em",
          textAlign: "center",
        }}
        enterAnimation={{
          mode: "oneLine",
          restState: "solid",
          replay: true,
          position: "above",
          scrambleIntensity: 100,
          ease: { type: "tween", duration: 1.8, ease: "linear" },
          flickerEnabled: true,
          flickerColor: "#3D5CFF",
          flickerIntensity: 80,
          flickerSpeed: 10,
        }}
        hoverAnimation={{
          type: "diffusion",
          lines: "oneLine",
          radius: 3,
          collapse: false,
          collapseTime: 1,
          glitchChars: "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
          glitchShuffle: true,
          flickerEnabled: true,
          flickerColor: "#3D5CFF",
          flickerIntensity: 50,
          flickerSpeed: 10,
          waveEase: { type: "tween", duration: 1.5, ease: "linear" },
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an interactive kinetic typography glitch reveal and cursor-diffusion micro-interaction named "Scramble Text" (GlitchCharReveal) in React and TypeScript.

COMPONENT SPECIFICATIONS:
1. Multi-Stage Enter Animation:
   - Supports modes: 'oneLine' | 'multiLine' | 'random' | 'none'.
   - Words and whitespace gaps are mapped dynamically with zero layout jitter.
   - Includes custom ease curves (cubicBezier, easeOut, easeInOut, circIn, circOut, backIn, backOut).
   - Scramble intensity and glitch character substitutions occur in high-speed animation frames before locking the actual character.
2. Interactive Hover Dispersion & Wave Scan:
   - Hover types: 'diffusion' (radial character scattering) and 'wave' (sequential cursor sweeps).
   - Modes: 'diffusionOneLine', 'diffusionMultiLine', 'waveOneLine', 'waveMultiLine'.
   - Independent requestAnimationFrame wave loops per measured line top with customizable cursor symbols and glitch bleed.
3. Micro-Flicker Physics:
   - Per-character flicker state tracking (flickerColor, flickerIntensity, flickerSpeed).
4. Configurable Props:
   - words: string = "SCRAMBLE TEXT"
   - enterAnimation: { mode, restState, replay, position, scrambleIntensity, ease, flickerEnabled, flickerColor, flickerIntensity, flickerSpeed }
   - hoverAnimation: { type, lines, radius, collapse, collapseTime, glitchChars, glitchShuffle, flickerEnabled, flickerColor, flickerIntensity, flickerSpeed, waveEase }
   - color: string = "#ffffff"
   - font: React.CSSProperties
   - tag: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "div" | "span"`
    },
    {
        id: "scroll-text-highlight",
        title: "Scroll Text Highlight",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => <ScrollHighlightPreview />,
        code: `import React from 'react';
import { ScrollHighlight } from '@/components/animations/ScrollHighlight';

export function ScrollHighlightDemo() {
  return (
    <div className="w-full min-h-screen bg-black px-6 py-20 flex items-center justify-center">
      <div className="max-w-4xl w-full">
        <ScrollHighlight
          text="Every detail matters. Small interactions shape perception, build trust, and transform ordinary experiences into memorable ones."
          dimColor="rgba(255, 255, 255, 0.15)"
          highlightColor="#FFFFFF"
          splitBy="words"
          scrollStart="top 80%"
          scrollEnd="bottom 30%"
          scrub={true}
          paddingTop="40vh"
          paddingBottom="40vh"
          font={{
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "clamp(2rem, 5vw, 3.8rem)",
            fontWeight: 600,
            letterSpacing: "-0.025em",
            lineHeight: "1.2em",
            textAlign: "left",
          }}
        />
      </div>
    </div>
  );
}`,
        vibePrompt: `Create a buttery smooth GSAP ScrollTrigger typography highlight effect named "Scroll Text Highlight" (ScrollHighlight / ScrollTextHighlight) in React and TypeScript.

COMPONENT SPECIFICATIONS:
1. GSAP ScrollTrigger Integration:
   - Registers ScrollTrigger plugin with GSAP.
   - Splits input text into individual words (.word) or characters (.char) with whitespace and non-breaking space preservation.
   - Sets initial text elements to dimColor (default: rgba(255, 255, 255, 0.15)).
   - Animates targets to highlightColor (default: #FFFFFF) using GSAP stagger (0.1 for words, 0.03 for characters) tied to scroll progress.
2. Scrubbing & Custom Scroller Support:
   - Supports fluid scrub (scrub: true | number) and customizable trigger start/end anchors (e.g., "top center", "bottom center").
   - Supports optional scoped scroller container element or selector for preview cards and custom overflow areas.
3. Typography & Responsiveness:
   - Responsive clamp font sizes, custom font styling (FontStyle), letter-spacing, and line-height.
4. Configurable Props:
   - text: string
   - font: React.CSSProperties
   - dimColor: string = "rgba(255, 255, 255, 0.15)"
   - highlightColor: string = "#FFFFFF"
   - splitBy: "characters" | "words" = "words"
   - scrollStart: ScrollPosition = "top center"
   - scrollEnd: ScrollPosition = "bottom center"
   - scrub: boolean | number = true
   - scroller?: HTMLElement | string | null
   - paddingTop: string = "100dvh"
   - paddingBottom: string = "100dvh"`
    },
    {
        id: "smoky-text",
        title: "Smoky Text",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => <SmokyTextPreview />,
        code: `import React from 'react';
import { SmokyText } from '@/components/animations/SmokyText';

export function SmokyTextDemo() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center bg-black p-8">
      <SmokyText
        text={"SMOKY\\nTEXT"}
        color="#ffffff"
        intensity={12}
        animationMode="singleLine"
        position="bottomLeft"
        appearTrigger="default"
        font={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
          fontWeight: 800,
          lineHeight: "1.05em",
          letterSpacing: "0.02em",
          textAlign: "center",
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an atmospheric, cinematic text condensation and smoke particle dissipation effect named "Smoky Text" in React and TypeScript.

COMPONENT SPECIFICATIONS:
1. Dynamic Smoke Keyframe Physics:
   - Dynamic blur radii and stacked text-shadow layers proportional to intensity level (1 to 20).
   - Generates multi-layered smoke shadows (text-shadow: 0 0 ...px color) to give genuine physical density and mass to the gas cloud.
   - Alternating odd/even character trajectories with skew, rotation, 3D translation, and scale contraction into crystal-clear typography.
2. Multiple Animation Modes:
   - "singleLine": Sequential character stagger across the entire string.
   - "multiLine": Automatic visual line-wrapping detection using ResizeObserver and offsetTop grouping; triggers line-by-line staggered smoke reveals.
   - "inPlace": Compresses in-place from large diffuse smoke clouds into crisp letter glyphs simultaneously without directional translation.
3. Trigger System:
   - "default": Plays automatically on mount.
   - "hover": Triggers on cursor entry over text boundary.
   - "scroll": Threshold-based scroll intersection trigger with custom trigger distance and top/bottom anchor positioning.
4. Configurable Props:
   - text: string = "SMOKY\\nTEXT"
   - font: React.CSSProperties
   - color: string = "whitesmoke"
   - appearTrigger: "default" | "hover" | "scroll"
   - scrollConfig: { position: "top" | "bottom", distance: number }
   - appearTransition: { type: "tween" | "spring", ease: string | number[], duration: number, delay: number }
   - intensity: number = 10
   - position: "bottomLeft" | "topLeft"
   - animationMode: "singleLine" | "multiLine" | "inPlace"`
    },
    {
        id: "text-carousel",
        title: "Text Carousel",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => <RotatingTextPreview />,
        code: `import React from 'react';
import { RotatingText } from '@/components/animations/RotatingText';

export function TextCarouselDemo() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center bg-neutral-950 p-8">
      <RotatingText
        prefix="Text"
        texts={["components!", "interfaces!", "experiences!", "interactions!"]}
        splitBy="characters"
        staggerFrom="first"
        badgeBackground="#1EE7B3"
        color="#000000"
        prefixColor="#ffffff"
        badgeRadius={14}
        badgePaddingX={18}
        badgePaddingY={6}
        font={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontSize: "clamp(2rem, 5.5vw, 4.2rem)",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: "1.1em",
          textAlign: "left",
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create an interactive rotating typography carousel component named "RotatingText" / "TextCarousel" in React & TypeScript.

COMPONENT SPECIFICATIONS:
1. Smooth Badge Container Auto-Sizing:
   - Dynamic width recalculation on active text changes using GSAP tween transitions on badge pill element.
   - Screen-reader accessible hidden text overlay alongside styled visual container.
2. GSAP Staggered Character/Word Splitting:
   - Supports "characters", "words", and "lines" splitting using Intl.Segmenter or fallback grapheme slicing.
   - Smooth exit animation (-120% yPercent, opacity 0) and entrance animation (+100% -> 0% yPercent, opacity 0 -> 1) with customizable stagger ("first", "last", "center", "random").
3. Configurable Props:
   - prefix: string = "Text"
   - texts: string[] = ["components!", "interfaces!", "experiences!"]
   - font: FontStyle
   - color: string = "#ffffff"
   - prefixColor: string = "#E8E8E8"
   - badgeBackground: string = "#1EE7B3"
   - badgePaddingX: number = 16
   - badgePaddingY: number = 6
   - badgeRadius: number = 14
   - gap: number = 12
   - splitBy: "characters" | "words" | "lines" = "characters"
   - staggerFrom: "first" | "last" | "center" | "random" = "first"
   - auto: boolean = true
   - rotationInterval: number = 2000
   - transition: { type: "tween", duration: 0.45, ease: "easeOut", staggerChildren: 0.03 }`
    },
    {
        id: "text-path",
        title: "Text Path",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => <TextPathPreview />,
        code: `import React from 'react';
import { TextPath } from '@/components/animations/TextPath';

export function TextPathDemo() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center bg-black p-8">
      <TextPath
        text="UI HUB • INFINITE SINE WAVE MARQUEE"
        separator="   ★   "
        gap={0}
        speed={30}
        reversed={true}
        waveFrequency={3}
        waveHeight={100}
        textColor="#FFFFFF"
        textFont={{
          fontSize: 18,
          fontWeight: 700,
          letterSpacing: 1,
          fontFamily: "Inter, system-ui, sans-serif",
        }}
        height={220}
      />
    </div>
  );
}`,
        vibePrompt: `Create an infinite wave marquee text component named "TextPath" in React and TypeScript.

COMPONENT SPECIFICATIONS:
1. Procedural SVG Sine Wave Geometry:
   - Dynamic cubic bézier sine wave path extending past both container edges with overflow margin so endpoints are never visible.
   - True peak-to-trough wave height math with glyph-preserving vertical margin clamping.
2. Seamless rAF Loop Flow:
   - Smooth continuous scrolling along the SVG <textPath> using startOffset calculation in a high-performance requestAnimationFrame loop.
   - Dual-width difference text measurement ((len4 - len2) / 2) for exact per-unit period wrapping without edge-whitespace hops.
3. Configurable Props:
   - text: string = "TEXT PATH"
   - speed: number = 30
   - reversed: boolean = true
   - textFont: { fontSize: number | string, fontWeight: number | string, fontFamily: string, letterSpacing: number | string }
   - textColor: string = "#FFFFFF"
   - waveFrequency: number = 3
   - waveHeight: number = 100
   - separator: string = "   •   "
   - gap: number = 0
   - width: string | number = "100%"
   - height: string | number = 200`
    },
    {
        id: "text-vaporize",
        title: "Text Vaporize",
        category: "text",
        addedAt: "2026-08-23",
        preview: () => <VaporizeTextPreview />,
        code: `import React from 'react';
import { VaporizeTextCycle } from '@/components/animations/VaporizeTextCycle';

export function TextVaporizeDemo() {
  return (
    <div className="w-full min-h-[380px] flex items-center justify-center bg-neutral-950 p-8">
      <VaporizeTextCycle
        texts={["UI HUB", "VAPORIZE", "PARTICLES", "CREATIVE"]}
        spread={20}
        density={10}
        color="#FFFFFF"
        alignment="center"
        font={{
          fontFamily: "Inter, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 64,
          letterSpacing: 1,
        }}
        appear={{
          mode: "particle",
          order: "left-to-right",
          transition: { duration: 1, ease: "easeOut" },
        }}
        disappear={{
          mode: "particle",
          order: "together",
          transition: { duration: 1.6, ease: "easeOut", delay: 0.8 },
        }}
      />
    </div>
  );
}`,
        vibePrompt: `Create a canvas-based particle text vaporization and reconstitution animation component named "VaporizeTextCycle" / "TextVaporize" in React and TypeScript.

COMPONENT SPECIFICATIONS:
1. High-Performance Canvas Buffer:
   - Off-screen text rasterization using getImageData() to sample pixel alpha and color values.
   - Low-overhead direct pixel manipulation using single ImageData buffer putImageData() running at buttery-smooth 60fps.
2. 3-Phase Animation Lifecycle:
   - "appear" (particle reconstitution or opacity fade) -> "hold" delay -> "disappear" (particle vaporization or opacity fade) -> loop with next text item.
   - Particle trajectories: randomized radial dispersion with sine-wave wobble and individual particle velocity spread.
   - Directional sweep ordering: "together", "left-to-right", and "right-to-left".
3. Configurable Props:
   - texts: string[] = ["TEXT", "VAPORIZE"]
   - font: { fontFamily: string, fontWeight: number | string, fontSize: number | string, letterSpacing: number }
   - color: string = "#FFFFFF"
   - spread: number = 20
   - density: number = 10
   - appear: { mode: "particle" | "opacity", order: "together" | "left-to-right" | "right-to-left", transition: { duration: number, ease: string } }
   - disappear: { mode: "particle" | "opacity", order: "together" | "left-to-right" | "right-to-left", transition: { duration: number, ease: string, delay: number } }
   - alignment: "left" | "center" | "right" = "center"
   - tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "div" | "span" = "h1"`
    },
    {
        id: "letter-pull-up",
        title: "Letter Pull Up",
        category: "text",
        addedAt: "2026-08-23",
        preview: renderComponent("letter-pull-up", "Letter Pull Up"),
        code: `import { motion } from 'framer-motion';\n\nexport const LetterPullUp = ({ text = "LETTER PULL UP" }) => (\n  <div className="flex overflow-hidden">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ y: "100%", opacity: 0 }}\n        animate={{ y: 0, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },

    {
        id: "scale-letter",
        title: "Scale Letter",
        category: "text",
        addedAt: "2026-08-23",
        preview: renderComponent("scale-letter", "Scale Letter"),
        code: `import { motion } from 'framer-motion';\n\nexport const ScaleLetter = ({ text = "SCALE LETTER" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ scale: 0, opacity: 0 }}\n        animate={{ scale: 1, opacity: 1 }}\n        transition={{ duration: 0.5, delay: i * 0.05 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "separate-away",
        title: "Separate Away",
        category: "text",
        addedAt: "2026-08-23",
        preview: renderComponent("separate-away", "Separate Away"),
        code: `import { motion } from 'framer-motion';\n\nexport const SeparateAway = ({ text = "SEPARATE AWAY" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        initial={{ x: 0 }}\n        animate={{ x: i < text.length / 2 ? -15 : 15 }}\n        transition={{ duration: 0.5 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "wavy-text",
        title: "Wavy Text",
        category: "text",
        addedAt: "2026-08-23",
        preview: renderComponent("wavy-text", "Wavy Text"),
        code: `import { motion } from 'framer-motion';\n\nexport const WavyText = ({ text = "WAVY TEXT" }) => (\n  <div className="flex">\n    {text.split('').map((char, i) => (\n      <motion.span\n        key={i}\n        animate={{ y: [0, -8, 0] }}\n        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}\n      >\n        {char === ' ' ? '\\u00A0' : char}\n      </motion.span>\n    ))}\n  </div>\n);`,
        vibePrompt: ""
    },
    {
        id: "word-pull-up",
        title: "Word Pull Up",
        category: "text",
        addedAt: "2026-08-23",
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
        id: "gravitational-vortex",
        title: "Gravitational Vortex",
        category: "interactive-background",
        isPremium: true,
        preview: renderComponent("gravitational-vortex", "Gravitational Vortex"),
        code: `import GravitationalVortex from '@/components/ui/GravitationalVortex';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <GravitationalVortex />\n  </div>\n);`,
        vibePrompt: "A premium WebGL gravitational vortex background with a logarithmic spiral accretion disc. Features ~20k motion-blurred streak particles falling into a funnel throat, rendered in real-time with additive blending. The spiral structure is generated mathematically with configurable twist and funnel depth, creating a mesmerizing cosmic whirlpool effect. Particles taper along their velocity direction with Gaussian width profiles, depth-attenuated for cinematic depth, and support interactive hover speed boost."
    },

    {
        id: "black-hole-3d",
        title: "Black Hole",
        category: "interactive-background",
        preview: renderComponent("black-hole-3d", "Black Hole"),
        code: `import BlackHole from '@/components/ui/BlackHole';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <BlackHole />\n  </div>\n);`,
        vibePrompt: "A premium 3D black hole accretion disk component. Renders an active gravitationally bound accretion disk with flowing particles leaving fading trail lines. Utilizes 3D Z-depth sorting to allow particles to pass behind and in front of the central event horizon with authentic physical occlusion. Features relativistic orbital speeds, adjustable tilt angles, and a premium 3D sphere at the center with rim lighting."
    },

    {
        id: "blooming-flower",
        title: "Blooming Flower",
        category: "interactive-background",
        isPremium: true,
        preview: renderComponent("blooming-flower", "Blooming Flower"),
        code: `import BloomingFlower from '@/components/ui/BloomingFlower';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <BloomingFlower />\n  </div>\n);`,
        vibePrompt: "A WebGL point-cloud flower of 60k-100k point sprites that opens on hover and closes to a bud when the pointer leaves. Three kinds of points share one buffer: petals on a parametric surface, stamens in a dome, and a swaying tapered stem. The head and stem share one sway expression so the flower cannot drift off its stalk. Petals use a circular-arc midrib in half-angle form for smooth curling. Weather animation keeps the scene alive at idle."
    },

    {
        id: "chandelier",
        title: "Chandelier",
        category: "interactive-background",
        isPremium: true,
        preview: renderComponent("chandelier", "Chandelier"),
        code: `import Chandelier from '@/components/ui/Chandelier';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <Chandelier />\n  </div>\n);`,
        vibePrompt: "A cloth simulation with text rendered on a deformable grid. The cloth hangs from pin points at the top and responds to gravity, wind, and mouse interaction. Characters from a configurable phrase are drawn on each quad cell, scaling and rotating with the cloth's deformation. Users can grab and drag individual cloth nodes with configurable density, speed, and cloth physics."
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
        vibePrompt: "",
        addedAt: "2026-08-30"
    },
    {
        id: "corner-button",
        title: "Corner Button",
        category: "button",
        preview: renderComponent("corner-button", "Corner Button", { children: "START DESIGNING" }),
        code: `import { CornerButton } from '@/components/ui/corner-button';\n\nexport const Demo = () => (\n  <CornerButton accentColor="#FF3B4D" children="Start designing" />\n);`,
        vibePrompt: "",
        addedAt: "2026-08-30"
    },
    {
        id: "creepy-button",
        title: "Creepy Button",
        category: "button",
        preview: renderComponent("creepy-button", "Creepy Button", { children: "HOVER ME" }),
        code: `import { CreepyButton } from '@/components/ui/creepy-button';\n\nexport const Demo = () => (\n  <CreepyButton>HOVER ME</CreepyButton>\n);`,
        vibePrompt: "",
        addedAt: "2026-08-30"
    },
    {
        id: "radial-glow-button",
        title: "Radial Glow Button",
        category: "button",
        preview: renderComponent("radial-glow-button", "Radial Glow Button", { children: "GET EXTENSION" }),
        code: `import { RadialGlowButton } from '@/components/ui/radial-glow-button';\n\nexport const Demo = () => (\n  <RadialGlowButton>Get Extension</RadialGlowButton>\n);`,
        vibePrompt: "",
        addedAt: "2026-08-30"
    },

    {
        id: "spider-web",
        title: "Spider Web",
        category: "interactive-background",
        preview: renderComponent("spider-web", "Spider Web"),
        code: `import SpiderWeb from '@/components/ui/spider-web';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden">\n    <SpiderWeb />\n  </div>\n);`,
        vibePrompt: "An interactive orb web strung across the frame whose silk gives way under the pointer and springs back once it has passed. Every intersection is a mass on a spring anchored to where it ought to be, so the web is never posed: the pointer pushes the nearest nodes outward, their neighbours are dragged along by the strands drawn between them, and the whole sheet rings for a moment before it settles. The outer ring is pinned beyond the frame so the silk runs off the edge like a real guyed web, and the animation loop parks itself when nothing is moving or hovering so an idle web costs nothing.",
        addedAt: "2026-08-30"
    },

    {
        id: "spiral-images",
        title: "Spiral Images",
        category: "image-interaction",
        addedAt: "2026-08-30",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950">
                <SpiralImages />
            </div>
        ),
        code: `import SpiralImages from '@/components/ui/spiral-images';\n\nexport const Demo = () => (\n  <div className="w-full h-[600px] rounded-3xl overflow-hidden bg-neutral-950">\n    <SpiralImages />\n  </div>\n);`,
        vibePrompt: "Images flow along an Archimedean spiral from the outer edge into the center (a vortex/whirl), each card rotating to follow the spiral's tangent and fading in and out at the ends. Cards sit at equal ARC distance along the path, reparameterized by arc length so they never bunch near the center, cycle through a small image set for a continuous infinite stream, and shrink toward the center via size attenuation. Built in self-contained Canvas 2D — no workers, no WebGL, single file. DPR-capped at 2, ResizeObserver-driven, rounded-corner clipping, configurable turns/speed/spacing/spread/sizeAttenuation/imageSize/fadeIn/fadeOut/cornerRadius."
    },

    {
        id: "infinity-image",
        title: "Infinity Image",
        category: "image-interaction",
        addedAt: "2026-08-30",
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950 flex items-center justify-center p-4">
                <InfinityImage />
            </div>
        ),
        code: `import InfinityImage from '@/components/ui/infinity-image';\n\nexport const Demo = () => (\n  <div className="w-full h-[500px] rounded-3xl overflow-hidden bg-neutral-950 flex items-center justify-center">\n    <InfinityImage />\n  </div>\n);`,
        vibePrompt: "An endless procession of photographic thumbnail cards circulating along a figure-eight infinity loop using CSS motion paths (offset-path: path(...)). Each card aligns tangentially to the lemniscate curve, evenly spaced via staggered negative animation delays with linear infinite timing. Cards feature real high-resolution images, rounded corners, specular glassmorphic overlays, and pause-on-hover interaction with auto-responsive container scaling."
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
        id: "black-hole-background",
        title: "Black Hole Background",
        category: "background",
        isPremium: true,
        preview: renderComponent("black-hole-background", "BlackHoleBackground"),
        code: "",
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
        id: "ascii-cursor",
        title: "Ascii Cursor",
        category: "cursor",
        preview: () => <AsciiCursorPreview />,
        code: `import { AsciiCursor } from '@/components/ui/AsciiCursor';

// Drop <AsciiCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// It replaces the default pointer with a scrambling ASCII trail over its frame.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <AsciiCursor label />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · Watch it scramble
    </p>
  </div>
);`,
        vibePrompt: `Create a premium CHARACTER CUSTOM CURSOR React component called AsciiCursor.
It replaces the default pointer inside its frame with a trailing scramble of ASCII characters on a canvas grid.

CURSOR DESIGN:
- A fixed grid of cells lights up as the pointer passes, filling with random alphanumeric + symbol glyphs (A-Z, 0-9, !@#$ etc.)
- Each lit cell scrambles continuously while the pointer stays near, then fades back to blank leaving a clean trail
- Decorative centered label text sits in the middle of the frame
- Cells use a bold box accent color with the glyphs in a contrasting light color, giving a raw terminal aesthetic

MOTION:
- Ultra smooth requestAnimationFrame easing that interpolates the trail toward the pointer
- Only replaces the native cursor while the pointer is over the component frame, restoring it on leave

TECH: React + TypeScript + HTML5 Canvas 2D + requestAnimationFrame
Props: label, labelText, labelColor, cellSize, radius, density, hold, boxColor, textColor, style.
UI HUB premium cursor component.`
    },
    {
        id: "aura-cursor",
        title: "Aura Cursor",
        category: "cursor",
        isPremium: true,
        addedAt: "2026-08-27",
        preview: () => <AuraCursorPreview />,
        code: `import { AuraCursor } from '@/components/ui/AuraCursor';

// Drop <AuraCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// A WebGL fluid-dye cursor that chases the pointer with colour.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <AuraCursor label />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · Click to splash
    </p>
  </div>
);`,
        vibePrompt: `Create a premium AURA FLUID CURSOR React component called AuraCursor.
It should render a GPU-driven WebGL fluid dye simulation that follows the pointer across its own frame, leaving a flowing, colourful trail.

DESIGN:
- A canvas-backed WebGL2 (falls back to WebGL1) fluid solver with velocity, pressure, divergence, curl/vorticity and advection passes
- Dye colour drifts continuously around a palette loop (purple, pink, blue) so consecutive strokes stay neighbouring hues
- A centred 'HOVER ME' label floats in the middle of the frame as a cue
- Dark backdrop default with optional light mode via a 'backdrop' prop
- Premium lighting: diffuse shading pass over the dye for depth

MOTION:
- Smooth, physically inspired fluid that follows the pointer with inertia and swirl
- Replaces the native cursor only while the pointer is over the component's own frame
- Clicking splashes a bright burst of the current palette colour
- Pauses the solver when off-screen or the tab is hidden; rebuilds cleanly on WebGL context restore

TECH: React + TypeScript + WebGL (glsl shaders) + requestAnimationFrame + ResizeObserver + IntersectionObserver
Props: label, labelText, labelColor, labelFont, paletteColors, backdrop, densityDissipation, curl, splatRadius, splatForce, style.
UI HUB premium cursor component.`
    },
    {
        id: "confetti-cursor",
        title: "Confetti Cursor",
        category: "cursor",
        addedAt: "2026-08-27",
        preview: () => <ParticleCursorPreview />,
        code: `import { ParticleCursor } from '@/components/ui/ParticleCursor';

// Drop <ParticleCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// A colourful confetti particle trail that bursts from the pointer.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <ParticleCursor label />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · Burst of confetti
    </p>
  </div>
);`,
        vibePrompt: `Create a premium CONFETTI CUSTOM CURSOR React component called ParticleCursor.
It replaces the default pointer with a colourful bursting confetti particle trail.

CURSOR DESIGN:
- A small white dot marks the pointer, gently pulsing
- As the pointer moves, bursts of tiny coloured particles (confetti) fly outward in every direction
- Particles come in a bright rainbow palette (red, teal, blue, green, yellow, pink)
- Each particle fades out over about two seconds, shrinking as it falls under gravity

MOTION:
- Smooth spawning throttled per-second for consistent density
- Particles drift with drag, fall with gravity and fade with an eased curve
- Only replaces the native cursor while the pointer is over the component's own frame, restoring it on leave
- A centred 'HOVER AROUND' label sits in the middle of the frame

TECH: React + TypeScript + HTML5 Canvas 2D + requestAnimationFrame
Props: label, labelText, labelColor, dotColor, dotSize, colors, particleCount, particleSize, particleSpeed, gravity, style.
UI HUB premium cursor component.`
    },
    {
        id: "kinetic-grid",
        title: "Kinetic Grid",
        category: "background",
        addedAt: "2026-08-27",
        preview: renderComponent("kinetic-grid", "KineticGrid"),
        code: `import { KineticGrid } from '@/components/ui/KineticGrid';

// Drop <KineticGrid /> anywhere in your app (e.g. as a full-page or card
// background). A reactive dot grid pulled toward the cursor with a trail.
export const Demo = () => (
  <div className="w-full h-[500px] rounded-2xl overflow-hidden bg-black">
    <KineticGrid />
  </div>
);`,
        vibePrompt: `Create a premium KINETIC GRID React component called KineticGrid.
It is a full-surface canvas background of dots on a grid mesh that react to the cursor.

DESIGN:
- A black (configurable) backdrop with a regular grid of small dots
- Faint lines connect neighbouring dots into a mesh
- As the pointer moves, the dots within a chosen radius are pulled toward the cursor, and the mesh brightens and thickens near it
- A smooth blue trail line follows the pointer and fades out

MOTION:
- Each dot springs back to its home position when the cursor leaves its radius
- Physics update per frame: acceleration toward home plus attraction toward the cursor, damped velocity
- requestAnimationFrame loop, throttled by ResizeObserver
- Replaces nothing; it is a background component, sets a crosshair cursor on its own frame

TECH: React + TypeScript + HTML5 Canvas 2D + requestAnimationFrame + ResizeObserver
Props: background, dotColor, lineColor, trailColor, spacing, radius, strength, trail, style.
UI HUB premium background component.`
    },
    {
        id: "spin-cursor",
        title: "Spin Cursor",
        category: "cursor",
        addedAt: "2026-08-27",
        preview: () => <MagicCursorPreview />,
        code: `import { MagicCursor } from '@/components/ui/MagicCursor';

// Drop <MagicCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// A custom arrow cursor that rotates and stretches with velocity.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <MagicCursor label />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · It spins with speed
    </p>
  </div>
);`,
        vibePrompt: `Create a premium SPIN CUSTOM CURSOR React component called MagicCursor.
It replaces the native pointer with a sleek arrow that rotates to face the direction of movement and stretches while moving fast.

CURSOR DESIGN:
- A sharp modern cursor arrow (SVG path)
- White fill with a subtle dark outline for contrast on any background
- Optional glow (drop-shadow) via enableGlow / glowColor / glowIntensity props

MOTION:
- Smooth framerate-independent easing toward the pointer with exponential follow
- Rotates to align with the current velocity vector when moving, damping back when idle
- Stretches along the direction of travel and squashes perpendicularly proportional to speed
- Slight press-in scale on click (configurable via CLICK_EFFECT)
- Native cursor is hidden only while the pointer is over the component's own frame, restored on leave
- A centred 'HOVER AROUND' label sits in the middle of the frame

TECH: React + TypeScript + requestAnimationFrame + CSS transforms
Props: label, labelText, labelColor, fillColor, cursorSize, enableStretch, enableGlow, glowColor, glowIntensity, labelFont, style.
UI HUB premium cursor component.`
    },
    {
        id: "user-cursor",
        title: "User Cursor",
        category: "cursor",
        addedAt: "2026-08-27",
        preview: () => <UserCursorPreview />,
        code: `import { UserCursor } from '@/components/ui/UserCursor';

// Drop <UserCursor /> anywhere in your app (e.g. App.tsx or a layout root).
// A custom arrow cursor with a colored label pill that trails behind on a laggier spring.
export const Demo = () => (
  <div className="relative w-full h-[500px] bg-black rounded-2xl overflow-hidden flex items-center justify-center">
    <UserCursor name="UI HUB" color="#FFFFFF" textColor="#000000" />
    <p className="text-white/30 text-sm tracking-widest uppercase font-bold">
      Move your cursor · A label pill trails behind
    </p>
  </div>
);`,
        vibePrompt: `Create a premium USER CUSTOM CURSOR React component called UserCursor.
It replaces the OS cursor inside its frame with an arrow glyph tracked by spring physics and a colored label pill that trails behind on a laggier spring, rocking with motion and scaling while pressed.

CURSOR DESIGN:
- A sharp macOS-style arrow (SVG path) anchored at its tip, fill color configurable
- A rounded label pill renders BEHIND the arrow (so the arrow tip is always on top), showing the 'name' text, colored by 'color' with dark text
- Pill padding, radius and font scale proportionally with 'size'

MOTION:
- Arrow follows the pointer with a snappy spring (stiffness 380, damping 32, mass 0.6)
- Label trails behind with a laggier spring (stiffness 220, damping 26, mass 0.7) and a fixed offset from the arrow
- Label tilts/rocks with horizontal velocity, capped at 'labelTiltStrength'
- Arrow scales down on press ('pressScale') with a spring bounce and returns on release
- Native cursor hidden only while pointer is over the frame; skipped on coarse/touch pointers

TECH: React + TypeScript + framer-motion (useMotionValue, useSpring, useTransform, motion)
Props: name, arrow, label, color, textColor, size, labelTiltStrength, showLabel, offsetX, offsetY, labelOffsetUseDefault, labelOffsetX, labelOffsetY, pressScale, style.
UI HUB premium cursor component.`
    },
    {
        id: "card-cascade",
        title: "Card Cascade",
        category: "image-interaction",
        addedAt: "2026-08-27",
        contributor: { name: "Sahil Patel" },
        preview: (props?: any) =>
            props?.showDemoButton === false
                ? <CardCascadeScrollDemo />
                : <CardCascadePreview />,
        code: `import { CardCascade } from '@/components/ui/CardCascade';

// Requires: npm install react-icons
// A scroll-driven 3D arc cascade of themed skill cards with a trailing icon rail.
export default function Demo() {
  return (
    <div className="w-full h-screen bg-black">
      <CardCascade />
    </div>
  );
}`,
        vibePrompt: `Create a premium CAROUSEL CARD CASCADE React component called CardCascade.
It is a scroll-driven, semi-circular 3D arc of four themed skill cards that cascade over each other on a sticky viewport, each with its own unique card layout and a vertical marquee icon rail on the right.

DESIGN:
- A tall scroll section (height = (cards+1) x 100vh) with the stage sticky and full-screen
- Four cards with distinct themes: 'red' (MERN Stack), 'dark' (Frontend Dev), 'light' (Backend & APIs), 'accent' (Dev Tools)
- Every card reuses one unified layout: a 0N/04 counter, skill-count pill, category eyebrow, giant black uppercase title, description, a stacked list of skill rows (icon tile + name), a huge cropped numeral in the background and a gradient accent stripe at the bottom
- Each theme has its own linear-gradient shell, border and layered box-shadow; light theme inverts black/white
- A vertical marquee 'icon rail' on the right shows the active card's skills, masked and infinitely scrolling downward
- Tech-stack brand icons via react-icons/si (React, MongoDB, Node.js, Express, HTML5, Tailwind, Git, npm, etc.)

MOTION:
- As the user scrolls, cards travel along a circle whose centre is far left of the cards (x = R·cos(a), y = R·sin(a)) so they arrange into an arc
- Cards tilt with the tangent of the curve, scale/fade/blur as they move off-centre, and the one nearest the active index sits at full opacity and scale
- On first entering view, cards cascade in from above with offsets and stagger delays
- Scroll progress is rAF-throttled; a giant glowing 'TECHNICAL SKILLS' header, left progress dots/counter, active-category label and a scroll hint complete the scene

TECH: React + TypeScript + react-icons + lucide-react + CSS 3D transforms + intersection/scroll observers
Props: none (self-contained data + scrolling). Category: image-interaction / cards.
UI HUB premium component.`
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
    },
    {
        id: "point-dna-helix",
        title: "Point DNA Helix",
        category: "interactive-background",
        addedAt: "2026-08-23",
        newBadgeDays: 21,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950">
                <PointDNAHelix />
            </div>
        ),
        code: `import PointDNAHelix from "@/components/ui/PointDNAHelix";

export function PointDNAHelixDemo() {
  return (
    <div className="relative h-screen w-full">
      <PointDNAHelix
        background="#030712"
        baseColor="#00E5FF"
        accentColor="#FF007A"
        accentMix={42}
        glow="#00E5FF20"
        density={31}
        dotSize={100}
        speed={70}
        zoom={30}
        hover={80}
        tilt={{ x: 0, y: 90 }}
        helix={{ turns: 2, thickness: 21, pulse: 40 }}
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a bioluminescent 3D point-cloud double DNA helix background in React + TypeScript using raw WebGL (single GL context, one rAF loop, all state via refs). Two interwoven helical backbone strands 180° out of phase connected by discrete base-pair rungs, surrounded by ambient genetic dust. All helical parametric math, camera transform, perspective point sizing, depth fade and screen-space cursor displacement live in the vertex shader. The helix runs horizontally past both frame edges so no end is ever visible; it auto-spins about its own axis, supports drag-to-spin with flick momentum, a cursor-proximity particle push (hover), breathing pulse, tilt X/Y, zoom, density and dot-size controls, cyan/magenta accent color mixing, additive premultiplied blending with exponential point falloff."
    },
    {
        id: "twin-galaxy-rings",
        title: "Twin Galaxy Rings",
        category: "interactive-background",
        addedAt: "2026-08-23",
        newBadgeDays: 21,
        isPremium: true,
        preview: () => (
            <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950">
                <TwinGalaxyRings />
            </div>
        ),
        code: `import TwinGalaxyRings from "@/components/ui/TwinGalaxyRings";

export function TwinGalaxyRingsDemo() {
  return (
    <div className="relative h-screen w-full overflow-hidden">
      <TwinGalaxyRings
        background="#050A14"
        colors={["#A050FF", "#C9D6E8"]}
        density={98}
        dotSize={2}
        speed={47}
        hoverSpeed={85}
        direction="cw"
        distance={3540}
        innerVoid={14}
        armThickness={100}
        armCount={5}
        tilt={{ tilt: 26, sideTilt: -8 }}
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a 'Twin Galaxy Rings' WebGL particle spiral-galaxy background in React + TypeScript (raw WebGL, single GL context, one rAF loop, all live state via refs). Logarithmic-spiral arms rendered as a GPU point cloud with gaussian-scattered arm width/height offsets, seeded mulberry32 RNG for deterministic layout. The galaxy streams endlessly along its arms with adjustable speed and cw/ccw direction, accelerating on hover. Cursor position is un-projected onto the galactic plane (planeHit ray cast) to lift and swell nearby particles; pressing boosts stream speed and dollies the camera in. Scroll progress drives camera pitch/roll tilt. Supports up to 8-color palette uploaded as a uniform array, density/dot-size/arm-count/arm-thickness/inner-void controls, radial-gradient ambient glow corners, additive premultiplied blending."
    },
    {
        id: "tornado",
        title: "Tornado",
        category: "interactive-background",
        addedAt: "2026-08-23",
        newBadgeDays: 21,
        isPremium: true,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative bg-black">
                <Tornado />
            </div>
        ),
        code: `import Tornado from "@/components/ui/Tornado";

export function TornadoDemo() {
  return (
    <div className="relative h-screen w-full">
      <Tornado
        background="#000000"
        topRadius={380}
        waistRadius={53}
        waistPosition={50}
        bottomRadius={1150}
        twist={3}
        zoom={75}
        speed={10}
        direction="right"
        lineOptions={{ count: 240, color: "#ffffff", glow: 10 }}
        dots
        dotOptions={{ count: 8000, size: 20, color: "#ffffff", glow: 10, flicker: 10 }}
        comets
        cometOptions={{ count: 10, speed: 6, color: "#F9731A", glow: 6, tail: 19, delay: 8, collide: 6 }}
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a 'Tornado' particle vortex background in React + TypeScript using three.js (single WebGLRenderer kept for the component's lifetime, settings read from a ref inside one rAF loop; rebuild() re-lays buffers within the open context instead of recreating it). Strands spiral up a pinched hyperboloid defined by three monotone-cubic (Fritsch-Carlson) baked curves for radius/height/angle with a controllable waist position and twist. Dots ride the strands as an InstancedMesh with per-dot flicker (sine^2.5 twinkle) and brightness spread; orange comets race along strands with glowing sprite heads, fading tails and delay staggering — comet-vs-dot collisions flash the dot out, pop its scale and throw an expanding shockwave ring that displaces strand vertices while shoved dots spring back (position + scale springs). Cursor proximity repels the whole form via a clip-space displacement patched into stock materials through onBeforeCompile with shared uniforms. Staged entrance (strands -> dots -> comets), prefers-reduced-motion support, Reinhard tone mapping, additive blending."
    },
    {
        id: "particle-sphere",
        title: "Particle Sphere",
        category: "interactive-background",
        addedAt: "2026-08-23",
        newBadgeDays: 21,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950">
                <ParticleSphere />
            </div>
        ),
        code: `import ParticleSphere from "@/components/ui/ParticleSphere";

export function ParticleSphereDemo() {
  return (
    <div className="relative h-[500px] w-full overflow-hidden">
      <ParticleSphere
        particlesCount={10000}
        particleScale={4}
        speed={20}
        smoothing={7}
        scale={10}
        rotationDirection="clockwise"
        drag
        dragSpeed={5}
        cursorOn
        cursorRadiusUI={75}
        cursorStrengthUI={10}
        clickForce={5}
        sphereColor="#ffffff"
      />
    </div>
  );
}`,
        vibePrompt: "Create an interactive 'Particle Sphere' background in React + TypeScript using three.js. Distribute particles evenly across a unit sphere surface with a Fibonacci golden-angle spiral, rendered as rounded instances via InstancedMesh of low-poly spheres (SphereGeometry 8x8) with additive blending and per-instance colors. The sphere auto-rotates continuously (clockwise/anticlockwise) with lerp-smoothed rotation, drag-to-rotate with time-normalized throw velocity and momentum decay, and optional stop-on-hover. HOVERING into the sphere fires a radial scatter burst (the same animation on click/touch): particles near the entry point explode outward in 3D and spring back via velocity-based scatter physics; cursor proximity also pushes front-facing particles outward in screen space (projected per-particle, camera right/up vector conversion back to local space) with friction + return-force decay. Oversized canvas (2.5x container, FOV-compensated) prevents clipping; ResizeObserver-driven resizing; frame-rate independent via delta-time normalization."
    },
    {
        id: "morphing-rings",
        title: "Morphing Rings",
        category: "interactive-background",
        addedAt: "2026-08-27",
        newBadgeDays: 21,
        isPremium: true,
        preview: () => (
            <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 relative bg-black">
                <MorphingRings />
            </div>
        ),
        code: `import MorphingRings from "@/components/ui/MorphingRings";

export function MorphingRingsDemo() {
  return (
    <div className="relative h-screen w-full">
      <MorphingRings
        background="#000000"
        colors={["#FFEE00", "#009DFF", "#7500FF"]}
        density={100}
        dotSize={4}
        speed={50}
        direction="cw"
        hoverSpeed={200}
        scale={38}
        amplitude={100}
        ring={{ width: 50, softness: 50, ringBands: 5 }}
        tilt={{ x: 85, y: 0 }}
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a 'Morphing Rings' WebGL particle-disc background in React + TypeScript using raw WebGL (single GL context, one rAF loop, all live state via refs). Tens of thousands of particles distributed across concentric annular bands with gaussian-scattered radial offsets for dusty band edges, viewed from a low-angle perspective camera tilted above the disc plane. The inner void continuously morphs between circle, pentagon, and heart shapes via three analytic 2D SDFs linearly interpolated by a periodic phase — particles inside the void fade out, particles at the edge get a cyan brightness boost forming a glowing inner ring. Two travelling waves (radial + X-axis) create interference moiré patterns with crest-tinted particles. The disc auto-rotates with adjustable speed and cw/ccw direction, accelerates on hover via a MotionValue-eased boost multiplier, supports up to 5-color palette as a uniform array, and uses additive premultiplied blending. Camera tilt X/Y, density, dot-size, scale (inverse pullback), amplitude (wave height), ring width/softness controls, and a configurable morph period govern the scene."
    },
    {
        id: "block-drift",
        title: "Block Drift",
        category: "interactive-background",
        addedAt: "2026-08-27",
        newBadgeDays: 21,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[500px] rounded-3xl overflow-hidden border border-white/10 relative bg-black">
                <BlockDrift />
            </div>
        ),
        code: `import BlockDrift from "@/components/ui/BlockDrift";

export function BlockDriftDemo() {
  return (
    <div className="relative h-screen w-full">
      <BlockDrift
        near="#8B10B3"
        far="#029A00"
        edge="#020200"
        grid={17}
        blockSize={12}
        gap={20}
        layers={15}
        density={10}
        cluster={10}
        edgeWidth={1}
        fade={1}
        shade={20}
        clearCentre={3}
        speed={12}
        direction="front"
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a 'Block Drift' WebGL animated background in React + TypeScript using three.js (single WebGLRenderer, one rAF loop, all live state via refs). Sheets of instanced cubes stacked in depth, the camera sitting inside the stack so blocks fly past and exit at the frame edges. Each layer is a square grid of box instances culled by a smooth value-noise field so survivors form contiguous slabs with face-to-face contact rather than scattered confetti. The stack slides exactly one gap per beat while the noise seed advances by one, making the pattern seamless and never restarting. A clear corridor down the middle prevents blocks from clipping through the camera. Blocks grow in from nothing at the far end over the last stretch of travel, reading as fog rather than popping. Fragment shader blends near-to-far depth colouring with per-face directional shading for cube legibility, screen-space-anti-aliased seam lines along box face borders (edge colour configurable), and noise-culled collapsed instances are discarded. Controls for near/far/edge colours, grid size, block size, gap, layers, density, cluster (noise frequency), edge width, fade, shade, clear corridor radius, speed, and front/back direction."
    },
    {
        id: "lightfall",
        title: "Lightfall",
        category: "interactive-background",
        addedAt: "2026-08-27",
        newBadgeDays: 21,
        isPremium: true,
        preview: () => (
            <div className="w-full h-full rounded-3xl overflow-hidden border border-white/10 relative bg-black">
                <Lightfall />
            </div>
        ),
        code: `import Lightfall from "@/components/ui/Lightfall";

export function LightfallDemo() {
  return (
    <div className="relative h-screen w-full">
      <Lightfall
        colors={["#A6C8FF", "#00CA9A"]}
        backgroundColor="#000000"
        speed={200}
        streakCount={7}
        streakWidth={207}
        streakLength={66}
        glow={29}
        density={111}
        twinkle={100}
        zoom={1}
        backgroundGlow={200}
        opacity={100}
      />

      {/* Your content on top */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h1 className="text-4xl font-bold text-white">Your Content</h1>
      </div>
    </div>
  );
}`,
        vibePrompt: "Create a 'Lightfall' WebGL fullscreen-shader background in React + TypeScript (single GL context, one rAF loop, all live state via refs). A raymarched scene computes per-pixel polar coordinates from a 39-iteration sphere-intersection march, producing a curved coordinate field that wraps angularly around the vertical axis. Streaks are scattered across angular rings via a seeded hash, each streak a smooth elongated SDF with configurable width and length, palette-coloured by an up-to-8-entry colour array and twinkle-modulated. The colour palette is indexed per-streak by a fractal hash, with smooth banding across the angular ring count (density control). Background is a radial vignette tinted by a configurable glow colour, composited under the streaks. Tone mapping uses tanh with a configurable glow multiplier and subtractive offset before sqrt for filmic contrast. Controls for up to 8 colours, background colour, speed, streak count (max 16), streak width/length, glow, density (angular ring count), twinkle, zoom, background glow, and opacity. Single fullscreen-triangle draw call, premultiplied-alpha canvas over a CSS background."
    },
    {
        id: "isometric-portal",
        title: "Isometric Portal",
        category: "loader",
        addedAt: "2026-08-30",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d]">
                <IsometricPortal />
            </div>
        ),
        code: `import React from 'react';

const IsometricPortal: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        @keyframes ip-bounce {
          0%, 100% { translate: 0px 36px; }
          50% { translate: 0px 46px; }
        }
        @keyframes ip-bounce2 {
          0%, 100% { translate: 0px 46px; }
          50% { translate: 0px 56px; }
        }
        @keyframes ip-umbral {
          0% { stop-color: #d3a5102e; }
          50% { stop-color: rgba(211, 165, 16, 0.519); }
          100% { stop-color: #d3a5102e; }
        }
        @keyframes ip-particles {
          0%, 100% { translate: 0px 16px; }
          50% { translate: 0px 6px; }
        }
        #particles { animation: ip-particles 4s ease-in-out infinite; }
        #animatedStop { animation: ip-umbral 4s infinite; }
        #bounce { animation: ip-bounce 4s ease-in-out infinite; translate: 0px 36px; }
        #bounce2 { animation: ip-bounce2 4s ease-in-out infinite; translate: 0px 46px; animation-delay: 0.5s; }
      \`}</style>

      <svg xmlns="http://www.w3.org/2000/svg" height={200} width={200}>
        <g style={{ order: -1 }}>
          <polygon transform="rotate(45 100 100)" strokeWidth={1} stroke="#d3a410" fill="none" points="70,70 148,50 130,130 50,150" id="bounce" />
          <polygon transform="rotate(45 100 100)" strokeWidth={1} stroke="#d3a410" fill="none" points="70,70 148,50 130,130 50,150" id="bounce2" />
          <polygon transform="rotate(45 100 100)" strokeWidth={2} fill="#414750" points="70,70 150,50 130,130 50,150" />
          <polygon strokeWidth={2} fill="url(#gradiente)" points="100,70 150,100 100,130 50,100" />
          <defs>
            <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gradiente">
              <stop style={{ stopColor: '#1e2026', stopOpacity: 1 }} offset="20%" />
              <stop style={{ stopColor: '#414750', stopOpacity: 1 }} offset="60%" />
            </linearGradient>
          </defs>
          <polygon transform="translate(20, 31)" strokeWidth={2} fill="#b7870f" points="80,50 80,75 80,99 40,75" />
          <polygon transform="translate(20, 31)" strokeWidth={2} fill="url(#gradiente2)" points="40,-40 80,-40 80,99 40,75" />
          <defs>
            <linearGradient y2="100%" x2="0%" y1="-17%" x1="10%" id="gradiente2">
              <stop style={{ stopColor: '#d3a51000', stopOpacity: 1 }} offset="20%" />
              <stop style={{ stopColor: '#d3a51054', stopOpacity: 1 }} offset="100%" id="animatedStop" />
            </linearGradient>
          </defs>
          <polygon transform="rotate(180 100 100) translate(20, 20)" strokeWidth={2} fill="#d3a410" points="80,50 80,75 80,99 40,75" />
          <polygon transform="rotate(0 100 100) translate(60, 20)" strokeWidth={2} fill="url(#gradiente3)" points="40,-40 80,-40 80,85 40,110.2" />
          <defs>
            <linearGradient y2="100%" x2="10%" y1="0%" x1="0%" id="gradiente3">
              <stop style={{ stopColor: '#d3a51000', stopOpacity: 1 }} offset="20%" />
              <stop style={{ stopColor: '#d3a51054', stopOpacity: 1 }} offset="100%" id="animatedStop" />
            </linearGradient>
          </defs>
          <polygon transform="rotate(45 100 100) translate(80, 95)" strokeWidth={2} fill="#ffe4a1" points="5,0 5,5 0,5 0,0" id="particles" />
          <polygon transform="rotate(45 100 100) translate(80, 55)" strokeWidth={2} fill="#ccb069" points="6,0 6,6 0,6 0,0" id="particles" />
          <polygon transform="rotate(45 100 100) translate(70, 80)" strokeWidth={2} fill="#fff" points="2,0 2,2 0,2 0,0" id="particles" />
          <polygon strokeWidth={2} fill="#292d34" points="29.5,99.8 100,142 100,172 29.5,130" />
          <polygon transform="translate(50, 92)" strokeWidth={2} fill="#1f2127" points="50,50 120.5,8 120.5,35 50,80" />
        </g>
      </svg>
    </div>
  );
};

export default IsometricPortal;`,
        vibePrompt: "Create a 'Isometric Portal' loader in React + TypeScript using a pure inline SVG with CSS keyframe animations (no dependencies). The mark is a neon-brutalist isometric diamond portal: a dark faceted 3D diamond shell in layered gunmetal grays sits over a smaller inner diamond filled by a subtle gray-to-slate linear gradient. Two thin golden diamond outlines wrap the figure at 45°, their planes swept 'bounce' apart and back with 4s ease-in-out (secondary frame following 0.5s later) so the portal reads like shimmering glass rings drifting vertically. Four golden isometric slabs extend from the portal's sides on mirrored offsets, with their gradient stops animated via @keyframes stop-color to pulse a warm amber glow (4s infinite). Three tiny faceted particles (champagne, gold, white) travel upward inside the portal face on a 4s ease-in-out loop, like embers rising through a vent. The loader must be centered in a full-size flexbox container, render at exactly 200x200px, loop forever with no JS, and stay crisp — every transition driven by CSS translate on SVG elements, never by re-rendering."
    },
    {
        id: "morphing-glow",
        title: "Morphing Glow",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d]">
                <MorphingGlow />
            </div>
        ),
        code: `import React from 'react';

const MorphingGlow: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .mg-loader {
          --color-one: #ffbf48;
          --color-two: #be4a1d;
          --color-three: #ffbf4780;
          --color-four: #bf4a1d80;
          --color-five: #ffbf4740;
          --time-animation: 2s;
          --size: 1;
          position: relative;
          border-radius: 50%;
          transform: scale(var(--size));
          box-shadow:
            0 0 25px 0 var(--color-three),
            0 20px 50px 0 var(--color-four);
          animation: mg-colorize calc(var(--time-animation) * 3) ease-in-out infinite;
        }
        .mg-loader::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border-top: solid 1px var(--color-one);
          border-bottom: solid 1px var(--color-two);
          background: linear-gradient(180deg, var(--color-five), var(--color-four));
          box-shadow:
            inset 0 10px 10px 0 var(--color-three),
            inset 0 -10px 10px 0 var(--color-four);
        }
        .mg-loader .mg-box {
          width: 100px;
          height: 100px;
          background: linear-gradient(180deg, var(--color-one) 30%, var(--color-two) 70%);
          mask: url(#mg-clipping);
          -webkit-mask: url(#mg-clipping);
        }
        .mg-loader svg { position: absolute; }
        .mg-loader svg #mg-clipping { filter: contrast(15); animation: mg-roundness calc(var(--time-animation) / 2) linear infinite; }
        .mg-loader svg #mg-clipping polygon { filter: blur(7px); }
        .mg-loader svg #mg-clipping polygon:nth-child(1) { transform-origin: 75% 25%; transform: rotate(90deg); }
        .mg-loader svg #mg-clipping polygon:nth-child(2) { transform-origin: 50% 50%; animation: mg-rotation var(--time-animation) linear infinite reverse; }
        .mg-loader svg #mg-clipping polygon:nth-child(3) { transform-origin: 50% 60%; animation: mg-rotation var(--time-animation) linear infinite; animation-delay: calc(var(--time-animation) / -3); }
        .mg-loader svg #mg-clipping polygon:nth-child(4) { transform-origin: 40% 40%; animation: mg-rotation var(--time-animation) linear infinite reverse; }
        .mg-loader svg #mg-clipping polygon:nth-child(5) { transform-origin: 40% 40%; animation: mg-rotation var(--time-animation) linear infinite reverse; animation-delay: calc(var(--time-animation) / -2); }
        .mg-loader svg #mg-clipping polygon:nth-child(6) { transform-origin: 60% 40%; animation: mg-rotation var(--time-animation) linear infinite; }
        .mg-loader svg #mg-clipping polygon:nth-child(7) { transform-origin: 60% 40%; animation: mg-rotation var(--time-animation) linear infinite; animation-delay: calc(var(--time-animation) / -1.5); }
        @keyframes mg-rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes mg-roundness {
          0% { filter: contrast(15); }
          20% { filter: contrast(3); }
          40% { filter: contrast(3); }
          60% { filter: contrast(15); }
          100% { filter: contrast(15); }
        }
        @keyframes mg-colorize {
          0% { filter: hue-rotate(0deg); }
          20% { filter: hue-rotate(-30deg); }
          40% { filter: hue-rotate(-60deg); }
          60% { filter: hue-rotate(-90deg); }
          80% { filter: hue-rotate(-45deg); }
          100% { filter: hue-rotate(0deg); }
        }
      \`}</style>

      <div className="mg-loader">
        <svg width={100} height={100} viewBox="0 0 100 100">
          <defs>
            <mask id="mg-clipping">
              <polygon points="0,0 100,0 100,100 0,100" fill="black" />
              <polygon points="25,25 75,25 50,75" fill="white" />
              <polygon points="50,25 75,75 25,75" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
              <polygon points="35,35 65,35 50,65" fill="white" />
            </mask>
          </defs>
        </svg>
        <div className="mg-box" />
      </div>
    </div>
  );
};

export default MorphingGlow;`,
        vibePrompt: "Create a 'Morphing Glow' loader in React + TypeScript using a pure inline SVG mask with CSS keyframe animations (no dependencies). The mark is a morphing glass diamond: a 100x100px circular glass disc with an amber-to-rust linear gradient body, a glowing edge rim (light amber top border, deep rust bottom border) and layered inset/outer box-shadows in semi-transparent amber and rust. The disc is clipped by an SVG <mask> of blurred polygon blades — a full-cover black rectangle (rotated 90deg) plus two large white triangles and four identical small white triangles — whose blur, contrast and 360deg rotation animations continuously reshape the clipped diamond silhouette. Each blade runs its own 2s spin (staggered via negative animation-delays and alternating directions) around individual transform-origins, while the mask's contrast pulses between 15 and 3 over 1s to round and sharpen the silhouette. The whole loader breathes color by hue-rotating from 0deg to -90deg and back over 6s (ease-in-out). All timing flows from CSS custom properties (--time-animation: 2s, --size: 1 for scaling). Center in a full-size flexbox container, loop forever with no JS, and keep every effect driven purely by CSS filters and transforms."
    },
    {
        id: "gear-system",
        title: "Gear System",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d]">
                <GearSystem />
            </div>
        ),
        code: `import React from 'react';

const GearSystem: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        @keyframes gs-clockwise {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes gs-counter-clockwise {
          0% {
            transform: rotate(0deg);
          }

          100% {
            transform: rotate(-360deg);
          }
        }

        .gs-gearbox {
          background: #111;
          height: 150px;
          width: 200px;
          position: relative;
          border: none;
          overflow: hidden;
          border-radius: 6px;
          box-shadow: 0px 0px 0px 1px rgba(255, 255, 255, 0.1);
        }

        .gs-gearbox .gs-overlay {
          border-radius: 6px;
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 10;
          box-shadow: inset 0px 0px 20px black;
          transition: background 0.2s;
        }

        .gs-gearbox .gs-overlay {
          background: transparent;
        }

        .gs-gear {
          position: absolute;
          height: 60px;
          width: 60px;
          box-shadow: 0px -1px 0px 0px #888888, 0px 1px 0px 0px black;
          border-radius: 30px;
        }

        .gs-gear.gs-large {
          height: 120px;
          width: 120px;
          border-radius: 60px;
        }

        .gs-gear.gs-large:after {
          height: 96px;
          width: 96px;
          border-radius: 48px;
          margin-left: -48px;
          margin-top: -48px;
        }

        .gs-gear.gs-one {
          top: 12px;
          left: 10px;
        }

        .gs-gear.gs-two {
          top: 61px;
          left: 60px;
        }

        .gs-gear.gs-three {
          top: 110px;
          left: 10px;
        }

        .gs-gear.gs-four {
          top: 13px;
          left: 128px;
        }

        .gs-gear:after {
          content: "";
          position: absolute;
          height: 36px;
          width: 36px;
          border-radius: 36px;
          background: #111;
          top: 50%;
          left: 50%;
          margin-left: -18px;
          margin-top: -18px;
          z-index: 3;
          box-shadow: 0px 0px 10px rgba(255, 255, 255, 0.1), inset 0px 0px 10px rgba(0, 0, 0, 0.1), inset 0px 2px 0px 0px #090909, inset 0px -1px 0px 0px #888888;
        }

        .gs-gear-inner {
          position: relative;
          height: 100%;
          width: 100%;
          background: #555;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gs-large .gs-gear-inner {
          border-radius: 60px;
        }

        .gs-gear.gs-one .gs-gear-inner {
          animation: gs-counter-clockwise 3s infinite linear;
        }

        .gs-gear.gs-two .gs-gear-inner {
          animation: gs-clockwise 3s infinite linear;
        }

        .gs-gear.gs-three .gs-gear-inner {
          animation: gs-counter-clockwise 3s infinite linear;
        }

        .gs-gear.gs-four .gs-gear-inner {
          animation: gs-counter-clockwise 6s infinite linear;
        }

        .gs-gear-inner .gs-bar {
          background: #555;
          height: 16px;
          width: 76px;
          position: absolute;
          left: 50%;
          margin-left: -38px;
          top: 50%;
          margin-top: -8px;
          border-radius: 2px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }

        .gs-large .gs-gear-inner .gs-bar {
          margin-left: -68px;
          width: 136px;
        }

        .gs-gear-inner .gs-bar:nth-child(2) {
          transform: rotate(60deg);
        }

        .gs-gear-inner .gs-bar:nth-child(3) {
          transform: rotate(120deg);
        }

        .gs-gear-inner .gs-bar:nth-child(4) {
          transform: rotate(90deg);
        }

        .gs-gear-inner .gs-bar:nth-child(5) {
          transform: rotate(30deg);
        }

        .gs-gear-inner .gs-bar:nth-child(6) {
          transform: rotate(150deg);
        }
      \`}</style>

      <div className="gs-gearbox">
        <div className="gs-overlay" />
        <div className="gs-gear gs-one">
          <div className="gs-gear-inner">
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
          </div>
        </div>
        <div className="gs-gear gs-two">
          <div className="gs-gear-inner">
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
          </div>
        </div>
        <div className="gs-gear gs-three">
          <div className="gs-gear-inner">
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
          </div>
        </div>
        <div className="gs-gear gs-four gs-large">
          <div className="gs-gear-inner">
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
            <div className="gs-bar" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GearSystem;`,
        vibePrompt: "Create a 'Gear System' loader in React + TypeScript with pure CSS keyframe animations (no dependencies). The mark is a mechanical gearbox: a 150px tall by 200px wide dark panel (#111) with a 1px faint white border, 6px rounded corners and an inset black vignette overlay. Inside sit four interlocking gears built from circles with radiating tooth bars: three 60px gears (top-left, center, bottom-left) plus one 120px large gear (top-right). Each gear is a centered metal disc — a #555 gear-inner with a 1px translucent white border, a 36px darker metal hub (with subtle inner/outer box-shadows and top highlight) punched through the middle, and rectangular tooth bars (76px wide, center offset 38px) with translucent edges. The large gear's teeth are 136px wide with a 68px center offset. Gears spin continuously: the three small gears rotate 360deg (two counter-clockwise, one clockwise on 3s linear loop) while the large one counter-clockwise on a slower 6s loop. Both directions come from two @keyframes (clockwise / counter-clockwise). Center the gearbox in a full-size flexbox container with a dark gradient backdrop, and never stop animating."
    },
    {
        id: "hourglass",
        title: "Hourglass",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <Hourglass />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

const Hourglass: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .hg-loader {
          --dur: 2s;
          --hue: 35;
          display: block;
          margin: auto;
          width: 14em;
          height: auto;
        }
        .hg-loader__glare-top,
        .hg-loader__glare-bottom,
        .hg-loader__model,
        .hg-loader__motion-thick,
        .hg-loader__motion-medium,
        .hg-loader__motion-thin,
        .hg-loader__sand-drop,
        .hg-loader__sand-fill,
        .hg-loader__sand-grain-left,
        .hg-loader__sand-grain-right,
        .hg-loader__sand-line-left,
        .hg-loader__sand-line-right,
        .hg-loader__sand-mound-top,
        .hg-loader__sand-mound-bottom {
          animation-duration: var(--dur);
          animation-timing-function: cubic-bezier(0.83, 0, 0.17, 1);
          animation-iteration-count: infinite;
        }
        .hg-loader__glare-top { animation-name: hg-glare-top; }
        .hg-loader__glare-bottom { animation-name: hg-glare-bottom; }
        .hg-loader__model { animation-name: hg-flip; transform-origin: 12.25px 16.75px; }
        .hg-loader__motion-thick,
        .hg-loader__motion-medium,
        .hg-loader__motion-thin { transform-origin: 26px 26px; }
        .hg-loader__motion-thick { animation-name: hg-motion-thick; }
        .hg-loader__motion-medium { animation-name: hg-motion-medium; }
        .hg-loader__motion-thin { animation-name: hg-motion-thin; }
        .hg-loader__sand-drop { animation-name: hg-sand-drop; }
        .hg-loader__sand-fill { animation-name: hg-sand-fill; }
        .hg-loader__sand-grain-left { animation-name: hg-sand-grain-left; }
        .hg-loader__sand-grain-right { animation-name: hg-sand-grain-right; }
        .hg-loader__sand-line-left { animation-name: hg-sand-line-left; }
        .hg-loader__sand-line-right { animation-name: hg-sand-line-right; }
        .hg-loader__sand-mound-top { animation-name: hg-sand-mound-top; }
        .hg-loader__sand-mound-bottom {
          animation-name: hg-sand-mound-bottom;
          transform-origin: 12.25px 31.5px;
        }

        @keyframes hg-flip {
          from { transform: translate(13.75px, 9.25px) rotate(-180deg); }
          24%, to { transform: translate(13.75px, 9.25px) rotate(0); }
        }
        @keyframes hg-glare-top {
          from { stroke: rgba(255, 255, 255, 0); }
          24%, to { stroke: white; }
        }
        @keyframes hg-glare-bottom {
          from { stroke: white; }
          24%, to { stroke: rgba(255, 255, 255, 0); }
        }
        @keyframes hg-motion-thick {
          from { animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0); stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(0.67turn); }
          20% { animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1); stroke: rgb(32, 32, 32); stroke-dashoffset: 141.11; transform: rotate(1turn); }
          40%, to { stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(1.33turn); }
        }
        @keyframes hg-motion-medium {
          from, 8% { animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0); stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(0.5turn); }
          20% { animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1); stroke: white; stroke-dashoffset: 147.53; transform: rotate(0.83turn); }
          32%, to { stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(1.17turn); }
        }
        @keyframes hg-motion-thin {
          from, 4% { animation-timing-function: cubic-bezier(0.33, 0, 0.67, 0); stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(0.33turn); }
          24% { animation-timing-function: cubic-bezier(0.33, 1, 0.67, 1); stroke: rgb(53, 53, 53); stroke-dashoffset: 134.7; transform: rotate(0.67turn); }
          44%, to { stroke: rgba(255, 255, 255, 0); stroke-dashoffset: 153.94; transform: rotate(1turn); }
        }
        @keyframes hg-sand-drop {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 1; }
          70%, to { stroke-dashoffset: -107; }
        }
        @keyframes hg-sand-fill {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 55; }
          70%, to { stroke-dashoffset: -54; }
        }
        @keyframes hg-sand-grain-left {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 29; }
          70%, to { stroke-dashoffset: -22; }
        }
        @keyframes hg-sand-grain-right {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 27; }
          70%, to { stroke-dashoffset: -24; }
        }
        @keyframes hg-sand-line-left {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 53; }
          70%, to { stroke-dashoffset: -55; }
        }
        @keyframes hg-sand-line-right {
          from, 10% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); stroke-dashoffset: 14; }
          70%, to { stroke-dashoffset: -24.5; }
        }
        @keyframes hg-sand-mound-top {
          from, 10% { animation-timing-function: linear; transform: translate(0, 0); }
          15% { animation-timing-function: cubic-bezier(0.12, 0, 0.39, 0); transform: translate(0, 1.5px); }
          51%, to { transform: translate(0, 13px); }
        }
        @keyframes hg-sand-mound-bottom {
          from, 31% { animation-timing-function: cubic-bezier(0.61, 1, 0.88, 1); transform: scale(1, 0); }
          56%, to { transform: scale(1, 1); }
        }
      \`}</style>

      <svg aria-label="loader being flipped clockwise and circled by three white curves fading in and out" role="img" height="56px" width="56px" viewBox="0 0 56 56" className="hg-loader">
        <clipPath id="hg-sand-mound-top">
          <path d="M 14.613 13.087 C 15.814 12.059 19.3 8.039 20.3 6.539 C 21.5 4.789 21.5 2.039 21.5 2.039 L 3 2.039 C 3 2.039 3 4.789 4.2 6.539 C 5.2 8.039 8.686 12.059 9.887 13.087 C 11 14.039 12.25 14.039 12.25 14.039 C 12.25 14.039 13.5 14.039 14.613 13.087 Z" className="hg-loader__sand-mound-top" />
        </clipPath>
        <clipPath id="hg-sand-mound-bottom">
          <path d="M 14.613 20.452 C 15.814 21.48 19.3 25.5 20.3 27 C 21.5 28.75 21.5 31.5 21.5 31.5 L 3 31.5 C 3 31.5 3 28.75 4.2 27 C 5.2 25.5 8.686 21.48 9.887 20.452 C 11 19.5 12.25 19.5 12.25 19.5 C 12.25 19.5 13.5 19.5 14.613 20.452 Z" className="hg-loader__sand-mound-bottom" />
        </clipPath>
        <g transform="translate(2,2)">
          <g transform="rotate(-90,26,26)" strokeLinecap="round" strokeDashoffset="153.94" strokeDasharray="153.94 153.94" stroke="hsl(0,0%,100%)" fill="none">
            <circle transform="rotate(0,26,26)" r="24.5" cy={26} cx={26} strokeWidth="2.5" className="hg-loader__motion-thick" />
            <circle transform="rotate(90,26,26)" r="24.5" cy={26} cx={26} strokeWidth="1.75" className="hg-loader__motion-medium" />
            <circle transform="rotate(180,26,26)" r="24.5" cy={26} cx={26} strokeWidth={1} className="hg-loader__motion-thin" />
          </g>
          <g transform="translate(13.75,9.25)" className="hg-loader__model">
            <path d="M 1.5 2 L 23 2 C 23 2 22.5 8.5 19 12 C 16 15.5 13.5 13.5 13.5 16.75 C 13.5 20 16 18 19 21.5 C 22.5 25 23 31.5 23 31.5 L 1.5 31.5 C 1.5 31.5 2 25 5.5 21.5 C 8.5 18 11 20 11 16.75 C 11 13.5 8.5 15.5 5.5 12 C 2 8.5 1.5 2 1.5 2 Z" fill="hsl(var(--hue),90%,85%)" />
            <g strokeLinecap="round" stroke="hsl(35,90%,90%)">
              <line y2="20.75" x2={12} y1="15.75" x1={12} strokeDasharray="0.25 33.75" strokeWidth={1} className="hg-loader__sand-grain-left" />
              <line y2="21.75" x2="12.5" y1="16.75" x1="12.5" strokeDasharray="0.25 33.75" strokeWidth={1} className="hg-loader__sand-grain-right" />
              <line y2="31.5" x2="12.25" y1={18} x1="12.25" strokeDasharray="0.5 107.5" strokeWidth={1} className="hg-loader__sand-drop" />
              <line y2="31.5" x2="12.25" y1="14.75" x1="12.25" strokeDasharray="54 54" strokeWidth="1.5" className="hg-loader__sand-fill" />
              <line y2="31.5" x2={12} y1={16} x1={12} strokeDasharray="1 107" strokeWidth={1} stroke="hsl(35,90%,83%)" className="hg-loader__sand-line-left" />
              <line y2="31.5" x2="12.5" y1={16} x1="12.5" strokeDasharray="12 96" strokeWidth={1} stroke="hsl(35,90%,83%)" className="hg-loader__sand-line-right" />
              <g strokeWidth={0} fill="hsl(35,90%,90%)">
                <path d="M 12.25 15 L 15.392 13.486 C 21.737 11.168 22.5 2 22.5 2 L 2 2.013 C 2 2.013 2.753 11.046 9.009 13.438 L 12.25 15 Z" clipPath="url(#hg-sand-mound-top)" />
                <path d="M 12.25 18.5 L 15.392 20.014 C 21.737 22.332 22.5 31.5 22.5 31.5 L 2 31.487 C 2 31.487 2.753 22.454 9.009 20.062 Z" clipPath="url(#hg-sand-mound-bottom)" />
              </g>
            </g>
            <g strokeWidth={2} strokeLinecap="round" opacity="0.7" fill="none">
              <path d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsl(0,0%,100%)" className="hg-loader__glare-top" />
              <path transform="rotate(180,12.25,16.75)" d="M 19.437 3.421 C 19.437 3.421 19.671 6.454 17.914 8.846 C 16.157 11.238 14.5 11.5 14.5 11.5" stroke="hsla(0,0%,100%,0)" className="hg-loader__glare-bottom" />
            </g>
            <rect height={2} width="24.5" fill="hsl(var(--hue),90%,50%)" />
            <rect height={1} width="19.5" y="0.5" x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
            <rect height={2} width="24.5" y="31.5" fill="hsl(var(--hue),90%,50%)" />
            <rect height={1} width="19.5" y={32} x="2.5" ry="0.5" rx="0.5" fill="hsl(var(--hue),90%,57.5%)" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default Hourglass;`,
        vibePrompt: "Create an 'Hourglass' loader in React + TypeScript with a single self-contained inline SVG and pure CSS keyframe animations (no dependencies). The mark is a sand-glass: a 56x56 viewBox ring of three trailing motion curves (2.5px thick, 1.75px medium, 1px thin) that swing clockwise around the glass while the glass model itself flips a full 180deg each cycle. The glass is a rounded hourglass silhouette (2px-wide metal top/bottom frames in amber, 1px highlight strips) filled with glowing sand: a light fill column drains down through dashed vertical sand lines and drops, while grain ticks and two clipped sand mounds (a rising top mound that sinks as the sand empties, and a bottom mound that scales from 0 to 1 as it fills). A glare band fades across the upper half when the glass is upright and across the lower half after the flip. Everything animates on a single 2s cycle with cubic-bezier timing curves and stroke-dashoffset driven currents, looping forever with zero JS. Prefix all keyframes/classes with hg- (hg-flip, hg-motion-thick, hg-sand-drop, etc.), drive the amber palette from a --hue CSS variable, render the svg at width 14em centered in a full-size flexbox container with a dark gradient backdrop."
    },
    {
        id: "generating-orb",
        title: "Generating Orb",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <GeneratingOrb />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

const GeneratingOrb: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .go-loader-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 180px;
          height: 180px;
          font-family: "Inter", sans-serif;
          font-size: 1.2em;
          font-weight: 300;
          color: white;
          border-radius: 50%;
          background-color: transparent;
          user-select: none;
        }

        .go-loader {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 50%;
          background-color: transparent;
          animation: go-loader-rotate 2s linear infinite;
          z-index: 0;
        }

        @keyframes go-loader-rotate {
          0% {
            transform: rotate(90deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
          50% {
            transform: rotate(270deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 10px 0 #d60a47 inset,
              0 40px 60px 0 #311e80 inset;
          }
          100% {
            transform: rotate(450deg);
            box-shadow:
              0 10px 20px 0 #fff inset,
              0 20px 30px 0 #ad5fff inset,
              0 60px 60px 0 #471eec inset;
          }
        }

        .go-loader-letter {
          display: inline-block;
          opacity: 0.4;
          transform: translateY(0);
          animation: go-loader-letter-anim 2s infinite;
          z-index: 1;
          border-radius: 50ch;
          border: none;
        }

        .go-loader-letter:nth-child(1) { animation-delay: 0s; }
        .go-loader-letter:nth-child(2) { animation-delay: 0.1s; }
        .go-loader-letter:nth-child(3) { animation-delay: 0.2s; }
        .go-loader-letter:nth-child(4) { animation-delay: 0.3s; }
        .go-loader-letter:nth-child(5) { animation-delay: 0.4s; }
        .go-loader-letter:nth-child(6) { animation-delay: 0.5s; }
        .go-loader-letter:nth-child(7) { animation-delay: 0.6s; }
        .go-loader-letter:nth-child(8) { animation-delay: 0.7s; }
        .go-loader-letter:nth-child(9) { animation-delay: 0.8s; }
        .go-loader-letter:nth-child(10) { animation-delay: 0.9s; }

        @keyframes go-loader-letter-anim {
          0%,
          100% {
            opacity: 0.4;
            transform: translateY(0);
          }
          20% {
            opacity: 1;
            transform: scale(1.15);
          }
          40% {
            opacity: 0.7;
            transform: translateY(0);
          }
        }
      \`}</style>

      <div className="go-loader-wrapper">
        <span className="go-loader-letter">G</span>
        <span className="go-loader-letter">e</span>
        <span className="go-loader-letter">n</span>
        <span className="go-loader-letter">e</span>
        <span className="go-loader-letter">r</span>
        <span className="go-loader-letter">a</span>
        <span className="go-loader-letter">t</span>
        <span className="go-loader-letter">i</span>
        <span className="go-loader-letter">n</span>
        <span className="go-loader-letter">g</span>
        <div className="go-loader" />
      </div>
    </div>
  );
};

export default GeneratingOrb;`,
        vibePrompt: "Create a 'Generating Orb' loader in React + TypeScript with pure CSS keyframe animations (no dependencies). The mark is an AI-style generating indicator: the word 'GENERATING' spelled across the middle of a spinning circular orb. The orb is a 180px full-circle element (.go-loader) that rotates continuously on a 2s linear loop (90deg -> 270deg -> 450deg), its surface colored by three layers of inset box-shadows layered on top of the inner edge: a thin white halo plus violet/magenta/indigo glow rings (0 10px 20px #fff, 0 20px 30px #ad5fff, 0 60px 60px #471eec) that shift to a magenta/indigo combo (#d60a47 with #311e80 at the 50% keyframe) as it turns, so the glow ripples around the ring. The ten letters (G-e-n-e-r-a-t-i-n-g, Inter, 1.2em, 300 weight, white) sit above the ring and pulse in a staggered wave: each letter animates on the same 2s loop with a 0.1s incremental delay, fading from 0.4 opacity to full opacity at 20% with a 1.15 scale pop before settling back. Center the orb in a full-size flexbox container with a dark gradient backdrop, keep a transparent background, and never stop animating."
    },
    {
        id: "trading-candles",
        title: "Trading Candles",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <TradingCandles />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

/**
 * TradingCandles
 * A trading-terminal loader: three candlestick columns (green, red, green)
 * bounce in a staggered waltz like a live market ticker. Each candle is a
 * top wick, a rounded 2px body and a bottom wick, bouncing on a 1s loop off
 * its own delay so the middle (red) candle leads the ripple.
 */
export const TradingCandles: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center gap-1 overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .tc-candle-group {
          display: flex;
          flex-direction: column;
          align-items: center;
          animation: tc-bounce 1s ease-in-out infinite;
        }

        .tc-wick {
          width: 4px;
          background: var(--tc-candle);
        }

        .tc-body {
          width: 12px;
          height: 48px;
          border-radius: 2px;
          background: var(--tc-candle);
        }

        .tc-candle-green {
          --tc-candle: #22c55e;
        }

        .tc-candle-red {
          --tc-candle: #ef4444;
        }

        @keyframes tc-bounce {
          0%,
          100% {
            transform: translateY(-20%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
          50% {
            transform: none;
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
        }
      \`}</style>

      <div className="tc-candle-group tc-candle-green" style={{ animationDelay: '0.1s' }}>
        <div className="tc-wick h-6" />
        <div className="tc-body" />
        <div className="tc-wick h-6" />
      </div>
      <div className="tc-candle-group tc-candle-red" style={{ animationDelay: '0.2s' }}>
        <div className="tc-wick h-6" />
        <div className="tc-body" />
        <div className="tc-wick h-6" />
      </div>
      <div className="tc-candle-group tc-candle-green" style={{ animationDelay: '0.1s' }}>
        <div className="tc-wick h-6" />
        <div className="tc-body" />
        <div className="tc-wick h-6" />
      </div>
    </div>
  );
};

export default TradingCandles;`,
        vibePrompt: "Create a 'Trading Candles' loader in React + TypeScript with pure CSS keyframes (no dependencies). The mark is a mini candlestick chart of three candles bouncing like a live market ticker: green, red, green columns side by side (4px gap) inside a full-size flexbox container on a dark gradient backdrop. Each candle is three stacked divs - a 4px-wide wick above and below a 12x48px rounded-2px body - and each whole column bounces on a 1s ease-in-out loop that peaks around the bottom of the swing, using the classic two-stage bounce ease (translateY -20% at 0%/100% with cubic-bezier(0.8, 0, 1, 1), resting pose at 50% with cubic-bezier(0, 0, 0.2, 1)). The outer two green candles share a 0.1s delay and the middle red candle leads at 0.2s so the ripple starts from the center. Drive the candle colors from a --tc-candle CSS variable (green #22c55e, red #ef4444) on small tc-candle-green/tc-candle-red modifier classes, prefix every keyframe/class with tc- (tc-bounce, tc-candle-group, tc-wick, tc-body) so nothing leaks, and never stop animating."
    },
    {
        id: "pixel-bounce",
        title: "Pixel Bounce",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <PixelBounce />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

/**
 * PixelBounce
 * A retro pixel-art ghost made from a CSS grid of 14x14 cells. The full body
 * bobs up and down on a 0.5s loop, its eye holds two animated pupils that
 * scan sideways, the eye area flickers between red and transparent in a
 * staggered pattern (flicker0/flicker1 alternate), and a blurred shadow under
 * the ghost pulses in sync with the bob.
 */
export const PixelBounce: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .pb-ghost {
          position: relative;
          scale: 0.8;
        }

        .pb-red {
          animation: pb-upNDown infinite 0.5s;
          position: relative;
          width: 140px;
          height: 140px;
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          grid-template-rows: repeat(14, 1fr);
          grid-column-gap: 0px;
          grid-row-gap: 0px;
          grid-template-areas:
            "a1  a2  a3  a4  a5  top0  top0  top0  top0  a10 a11 a12 a13 a14"
            "b1  b2  b3  top1 top1 top1 top1 top1 top1 top1 top1 b12 b13 b14"
            "c1 c2 top2 top2 top2 top2 top2 top2 top2 top2 top2 top2 c13 c14"
            "d1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 d14"
            "e1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 e14"
            "f1 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 top3 f14"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4 top4"
            "st0 st0 an4 st1 an7 st2 an10 an10 st3 an13 st4 an16 st5 st5"
            "an1 an2 an3 an5 an6 an8 an9 an9 an11 an12 an14 an15 an17 an18";
        }

        @keyframes pb-upNDown {
          0%,
          49% {
            transform: translateY(0px);
          }
          50%,
          100% {
            transform: translateY(-10px);
          }
        }

        .pb-top0,
        .pb-top1,
        .pb-top2,
        .pb-top3,
        .pb-top4,
        .pb-st0,
        .pb-st1,
        .pb-st2,
        .pb-st3,
        .pb-st4,
        .pb-st5 {
          background-color: red;
        }

        .pb-top0 {
          grid-area: top0;
        }

        .pb-top1 {
          grid-area: top1;
        }

        .pb-top2 {
          grid-area: top2;
        }

        .pb-top3 {
          grid-area: top3;
        }

        .pb-top4 {
          grid-area: top4;
        }

        .pb-st0 {
          grid-area: st0;
        }

        .pb-st1 {
          grid-area: st1;
        }

        .pb-st2 {
          grid-area: st2;
        }

        .pb-st3 {
          grid-area: st3;
        }

        .pb-st4 {
          grid-area: st4;
        }

        .pb-st5 {
          grid-area: st5;
        }

        .pb-an1 {
          grid-area: an1;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an18 {
          grid-area: an18;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an2 {
          grid-area: an2;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an17 {
          grid-area: an17;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an3 {
          grid-area: an3;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an16 {
          grid-area: an16;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an4 {
          grid-area: an4;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an15 {
          grid-area: an15;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an6 {
          grid-area: an6;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an12 {
          grid-area: an12;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an7 {
          grid-area: an7;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an13 {
          grid-area: an13;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an9 {
          grid-area: an9;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an10 {
          grid-area: an10;
          animation: pb-flicker1 infinite 0.5s;
        }

        .pb-an8 {
          grid-area: an8;
          animation: pb-flicker0 infinite 0.5s;
        }

        .pb-an11 {
          grid-area: an11;
          animation: pb-flicker0 infinite 0.5s;
        }

        @keyframes pb-flicker0 {
          0%,
          49% {
            background-color: red;
          }
          50%,
          100% {
            background-color: transparent;
          }
        }

        @keyframes pb-flicker1 {
          0%,
          49% {
            background-color: transparent;
          }
          50%,
          100% {
            background-color: red;
          }
        }

        .pb-eye {
          width: 40px;
          height: 50px;
          position: absolute;
          top: 30px;
          left: 10px;
        }

        .pb-eye::before {
          content: "";
          background-color: white;
          width: 20px;
          height: 50px;
          transform: translateX(10px);
          display: block;
          position: absolute;
        }

        .pb-eye::after {
          content: "";
          background-color: white;
          width: 40px;
          height: 30px;
          transform: translateY(10px);
          display: block;
          position: absolute;
        }

        .pb-eye1 {
          width: 40px;
          height: 50px;
          position: absolute;
          top: 30px;
          right: 30px;
        }

        .pb-eye1::before {
          content: "";
          background-color: white;
          width: 20px;
          height: 50px;
          transform: translateX(10px);
          display: block;
          position: absolute;
        }

        .pb-eye1::after {
          content: "";
          background-color: white;
          width: 40px;
          height: 30px;
          transform: translateY(10px);
          display: block;
          position: absolute;
        }

        .pb-pupil {
          width: 20px;
          height: 20px;
          background-color: blue;
          position: absolute;
          top: 50px;
          left: 10px;
          z-index: 1;
          animation: pb-eyesMovement infinite 3s;
        }

        .pb-pupil1 {
          width: 20px;
          height: 20px;
          background-color: blue;
          position: absolute;
          top: 50px;
          right: 50px;
          z-index: 1;
          animation: pb-eyesMovement infinite 3s;
        }

        @keyframes pb-eyesMovement {
          0%,
          49% {
            transform: translateX(0px);
          }
          50%,
          99% {
            transform: translateX(10px);
          }
          100% {
            transform: translateX(0px);
          }
        }

        .pb-shadow {
          background-color: black;
          width: 140px;
          height: 140px;
          position: absolute;
          border-radius: 50%;
          transform: rotateX(80deg);
          filter: blur(20px);
          top: 80%;
          animation: pb-shadowMovement infinite 0.5s;
        }

        @keyframes pb-shadowMovement {
          0%,
          49% {
            opacity: 0.5;
          }
          50%,
          100% {
            opacity: 0.2;
          }
        }
      \`}</style>

      <div className="pb-ghost">
        <div className="pb-red">
          <div className="pb-pupil" />
          <div className="pb-pupil1" />
          <div className="pb-eye" />
          <div className="pb-eye1" />
          <div className="pb-top0" />
          <div className="pb-top1" />
          <div className="pb-top2" />
          <div className="pb-top3" />
          <div className="pb-top4" />
          <div className="pb-st0" />
          <div className="pb-st1" />
          <div className="pb-st2" />
          <div className="pb-st3" />
          <div className="pb-st4" />
          <div className="pb-st5" />
          <div className="pb-an1" />
          <div className="pb-an2" />
          <div className="pb-an3" />
          <div className="pb-an4" />
          <div className="pb-an5" />
          <div className="pb-an6" />
          <div className="pb-an7" />
          <div className="pb-an8" />
          <div className="pb-an9" />
          <div className="pb-an10" />
          <div className="pb-an11" />
          <div className="pb-an12" />
          <div className="pb-an13" />
          <div className="pb-an14" />
          <div className="pb-an15" />
          <div className="pb-an16" />
          <div className="pb-an17" />
          <div className="pb-an18" />
        </div>
        <div className="pb-shadow" />
      </div>
    </div>
  );
};

export default PixelBounce;`,
        vibePrompt: "Create a 'Pixel Bounce' loader in React + TypeScript with pure CSS keyframes (no dependencies). The mark is a retro pixel-art red ghost drawn on a 14x14 CSS grid (.pb-red, 140x140px, grid-template-columns/rows repeat(14,1fr)) whose rows are stitched together with a grid-template-areas pattern (transparent corner cells, a solid head built from top0-top4 areas spanning the eyebrows and dome, and a scalloped bottom hem in a final row of st0/st5 and an1-an18 cells). The whole body bobs on a 0.5s loop (pb-upNDown: translateY 0->-10px at the 50% mark), while pixels across its belly flicker between red and transparent in two alternating phases - pb-flicker0 (red 0-49%, transparent 50-100%) and pb-flicker1 (inverted) - each an-cell assigned one of the two so the ghost looks like static. Two white eyes (.pb-eye/.pb-eye1, drawn with ::before/::after rectangles) hold blue pupils that scan sideways on a slow 3s loop (pb-eyesMovement: translateX 0->10px->0), and a blurred black circular shadow beneath pulses its opacity in sync with the bob (pb-shadowMovement: 0.5 <-> 0.2 on the same 0.5s cycle). All keyframes/classes prefixed pb-, drawn on a dark radial backdrop."
    },
    {
        id: "gradient-orb",
        title: "Gradient Orb",
        category: "loader",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <GradientOrb />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

/**
 * GradientOrb
 * A liquid-gradient orb loader. A glossy sphere layers two rotating animated
 * surfaces (inset-shadow blobs + a blurred color gradient behind it) while a
 * 100x100 SVG on top sculpts the orb's face with masks: an animated pair of
 * paths drives a wave ripple mask, a clipping + blur mask softens the crests,
 * and a fade mask edges the sphere into a diffused glow. All layers spin on
 * their own durations and the palette shifts through red/blue/yellow/cyan via
 * hue-rotate keyframes.
 */
export const GradientOrb: React.FC = () => {
  return (
    <div
      className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
      style={{
        background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
      }}
    >
      <style>{\`
        .gorb-loader {
          --gorb-color-one: red;
          --gorb-color-two: blue;
          --gorb-color-three: yellow;
          --gorb-color-fore: cyan;
          --gorb-color-five: white;
          --gorb-time-animation: 1s;
          --gorb-size: 100px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
          border-radius: 50%;
        }

        .gorb-loader .gorb-sphere {
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          border-radius: 50%;
          width: var(--gorb-size);
          height: var(--gorb-size);
          background: radial-gradient(
            circle at 80% 20%,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.8) 20%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(255, 255, 255, 0) 70%
          );
        }

        .gorb-loader .gorb-sphere::before {
          content: "";
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: var(--gorb-size);
          height: var(--gorb-size);
          border-radius: 50%;
          box-shadow:
            inset calc(var(--gorb-size) / -20) calc(var(--gorb-size) / -20) calc(var(--gorb-size) / 10) var(--gorb-color-fore),
            inset calc(var(--gorb-size) / 10) 0 calc(var(--gorb-size) / 5) var(--gorb-color-three);
          animation:
            gorb-rotation calc(var(--gorb-time-animation) * 2) linear infinite,
            gorb-colorize calc(var(--gorb-time-animation) * 2) ease-in-out infinite;
        }

        .gorb-loader .gorb-sphere::after {
          content: "";
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: var(--gorb-size);
          height: var(--gorb-size);
          border-radius: 50%;
          z-index: -1;
          background: radial-gradient(
              circle at 80% 20%,
              rgba(255, 255, 255, 0.7) 0%,
              rgba(255, 255, 255, 0.5) 30%,
              rgba(255, 255, 255, 0) 70%
            ),
            linear-gradient(120deg, var(--gorb-color-one) 20%, var(--gorb-color-two) 80%);
          animation:
            gorb-rotation calc(var(--gorb-time-animation) * 2) linear infinite,
            gorb-colorblur calc(var(--gorb-time-animation) * 2) ease-in-out infinite;
        }

        .gorb-loader svg {
          position: absolute;
          display: flex;
          justify-content: center;
          align-items: center;
          width: var(--gorb-size);
          height: var(--gorb-size);
          animation: gorb-rotation calc(var(--gorb-time-animation) * 3) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite;
        }

        .gorb-loader svg #gorb-shapes circle {
          fill: var(--gorb-color-five);
        }

        .gorb-loader svg #gorb-blurriness g,
        .gorb-loader svg #gorb-clipping ellipse,
        .gorb-loader svg #gorb-shapes g:nth-of-type(2),
        .gorb-loader svg #gorb-fade ellipse {
          filter: blur(7px);
        }

        .gorb-loader svg #gorb-waves g path {
          will-change: d;
          stroke-width: 7px;
        }

        .gorb-loader svg #gorb-waves g path:nth-of-type(1) {
          animation: gorb-wave-one var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite;
        }

        .gorb-loader svg #gorb-waves g path:nth-of-type(2) {
          animation: gorb-wave-two var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) calc(var(--gorb-time-animation) / -2) infinite reverse;
        }

        .gorb-loader svg #gorb-waves g path:nth-of-type(3) {
          animation: gorb-wave-one var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) calc(var(--gorb-time-animation) / -2) infinite;
        }

        .gorb-loader svg #gorb-waves g path:nth-of-type(4) {
          animation: gorb-wave-two var(--gorb-time-animation) cubic-bezier(0.7, 0.6, 0.3, 0.4) infinite reverse;
        }

        @keyframes gorb-wave-one {
          0% {
            d: path("M5,50 C10,50 15,50 20,50 C25,50 30,50 95,50");
          }
          50% {
            d: path("M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50");
          }
          100% {
            d: path("M5,50 C70,50 75,50 80,50 C85,50 90,50 95,50");
          }
        }

        @keyframes gorb-wave-two {
          0% {
            d: path("M5,50 C10,50 15,50 20,50 C25,50 30,50 95,50");
          }
          50% {
            d: path("M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50");
          }
          100% {
            d: path("M5,50 C70,50 75,50 80,50 C85,50 90,50 95,50");
          }
        }

        @keyframes gorb-rotation {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes gorb-colorize {
          0% {
            filter: hue-rotate(0deg);
          }
          20% {
            filter: hue-rotate(-30deg);
          }
          40% {
            filter: hue-rotate(-60deg);
          }
          60% {
            filter: hue-rotate(-90deg);
          }
          80% {
            filter: hue-rotate(-45deg);
          }
          100% {
            filter: hue-rotate(0deg);
          }
        }

        @keyframes gorb-colorblur {
          0% {
            filter: hue-rotate(0deg) blur(calc(var(--gorb-size) / 15));
          }
          20% {
            filter: hue-rotate(-30deg) blur(calc(var(--gorb-size) / 15));
          }
          40% {
            filter: hue-rotate(-60deg) blur(calc(var(--gorb-size) / 15));
          }
          60% {
            filter: hue-rotate(-90deg) blur(calc(var(--gorb-size) / 15));
          }
          80% {
            filter: hue-rotate(-45deg) blur(calc(var(--gorb-size) / 15));
          }
          100% {
            filter: hue-rotate(0deg) blur(calc(var(--gorb-size) / 15));
          }
        }
      \`}</style>

      <div className="gorb-loader">
        <div className="gorb-sphere" />
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <defs>
            <mask id="gorb-waves" maskUnits="userSpaceOnUse">
              <g fill="none" stroke="white" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50" />
                <path d="M5,50 C25,50 30,20 50,20 C70,20 75,50 95,50" />
                <path d="M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50" />
                <path d="M5,50 C25,50 30,80 50,80 C70,80 75,50 95,50" />
              </g>
            </mask>
            <mask id="gorb-blurriness" maskUnits="userSpaceOnUse">
              <g>
                <circle cx={50} cy={50} r={50} fill="white" />
                <ellipse cx={50} cy={50} rx={25} ry={25} fill="black" />
              </g>
            </mask>
            <mask id="gorb-clipping" maskUnits="userSpaceOnUse">
              <ellipse cx={50} cy={50} rx={25} ry={50} fill="white" />
            </mask>
            <mask id="gorb-fade" maskUnits="userSpaceOnUse">
              <ellipse cx={50} cy={50} rx={45} ry={50} fill="white" />
            </mask>
          </defs>
          <g id="gorb-shapes" mask="url(#gorb-fade)">
            <g mask="url(#gorb-clipping)">
              <circle cx={50} cy={50} r={50} fill="currentColor" mask="url(#gorb-waves)" />
            </g>
            <g mask="url(#gorb-blurriness)">
              <circle cx={50} cy={50} r={50} fill="currentColor" mask="url(#gorb-waves)" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};

export default GradientOrb;`,
        vibePrompt: "Create a 'Gradient Orb' loader in React + TypeScript with pure CSS keyframes and animated SVG masks (no dependencies). The mark is a glossy 100px liquid-gradient sphere built from three stacked layers inside a .gorb-loader (position relative, border-radius 50%, overflow hidden). Layer one is a .gorb-sphere pill with a white radial specular gradient at 80% 20%. Its ::before pseudo spins on a 2s loop (gorb-rotation) while carrying two inset box-shadows that act as colored blobs - a cyan blob inset from the top-left (-size/20,-size/20 blur size/10) and a yellow blob inset from the right (size/10,0 blur size/5) - plus a hue-rotate palette animation (gorb-colorize) sweeping 0deg -> -30 -> -60 -> -90 -> -45 -> 0 on a 2s ease-in-out. The ::after pseudo sits at z-index -1 behind it painting a blurred linear-gradient from red to blue at 120deg, and animates the same rotation but with a gorb-colorblur filter that adds a soft blur(size/15) while hue-rotating. Over the sphere an inline 100x100 SVG rotates on a slower 3s cubic-bezier(0.7,0.6,0.3,0.4) loop and sculpts the orb's face with four masks (all gorb- prefixed ids): a #gorb-waves stroke mask whose two duplicated paths animate their d attribute (gorb-wave-one bulges upward, gorb-wave-two bulges downward, each offset by half a period and the second pair running reverse) so liquid ripples cross the surface; a #gorb-clipping ellipse mask so the ripple pattern wraps a vertical band; a #gorb-blurriness mask blurring 7px; and a #gorb-fade ellipse mask that diffuses the whole mark's edges. Everything is driven off CSS variables (--gorb-size 100px, --gorb-time-animation 1s, red/blue/yellow/cyan/white palette vars) and drawn on a dark radial backdrop."
},
    {
        id: "super-mario",
        title: "Super Mario",
        category: "button",
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        isPremium: false,
        preview: () => (
            <div className="w-full h-full min-h-[380px] rounded-3xl overflow-hidden border border-white/10 relative bg-[#17181d] flex items-center justify-center">
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] uppercase tracking-widest text-white/40 pointer-events-none">hover the question block</div>
                <SuperMario />
                <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue font-mono text-[10px] uppercase tracking-widest pointer-events-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                    UI HUB
                </div>
            </div>
        ),
        code: `import React from 'react';

/**
 * SuperMario
 * A NES-style pixel tooltip. Two brick tiles frame a glassy "?" block whose
 * invisible hit area, when hovered, launches a 1-up mushroom out of the box -
 * it scales up, pops through the ceiling of the brick and lands floating above,
 * all on a CSS keyframe triggered purely by :hover.
 */
export const SuperMario: React.FC = () => {
    return (
        <div
            className="w-full h-full min-h-[380px] flex items-center justify-center overflow-hidden select-none"
            style={{
                background: 'radial-gradient(120% 120% at 50% 40%, #2a2e36 0%, #17181d 55%, #0d0e12 100%)',
            }}
        >
            <style>{\`
                .sm-brick {
                    height: 2px;
                    width: 2px;
                    box-shadow: 2px 2px 0px #ff9999, 4px 2px 0px #ff9999, 6px 2px 0px #ff9999,
                      8px 2px 0px #ff9999, 10px 2px 0px #ff9999, 12px 2px 0px #ff9999,
                      14px 2px 0px #ff9999, 16px 2px 0px #ff9999, 18px 2px 0px #ff9999,
                      20px 2px 0px #ff9999, 22px 2px 0px #ff9999, 24px 2px 0px #ff9999,
                      26px 2px 0px #ff9999, 28px 2px 0px #ff9999, 30px 2px 0px #ff9999,
                      32px 2px 0px #ff9999, 2px 4px 0px #cc3300, 4px 4px 0px #cc3300,
                      6px 4px 0px #cc3300, 8px 4px 0px #cc3300, 10px 4px 0px #cc3300,
                      12px 4px 0px #cc3300, 14px 4px 0px #cc3300, 16px 4px 0px #000,
                      18px 4px 0px #cc3300, 20px 4px 0px #cc3300, 22px 4px 0px #cc3300,
                      24px 4px 0px #cc3300, 26px 4px 0px #cc3300, 28px 4px 0px #cc3300,
                      30px 4px 0px #cc3300, 32px 4px 0px #000, 2px 6px 0px #cc3300,
                      4px 6px 0px #cc3300, 6px 6px 0px #cc3300, 8px 6px 0px #cc3300,
                      10px 6px 0px #cc3300, 12px 6px 0px #cc3300, 14px 6px 0px #cc3300,
                      16px 6px 0px #000, 18px 6px 0px #cc3300, 20px 6px 0px #cc3300,
                      22px 6px 0px #cc3300, 24px 6px 0px #cc3300, 26px 6px 0px #cc3300,
                      28px 6px 0px #cc3300, 30px 6px 0px #cc3300, 32px 6px 0px #000,
                      2px 8px 0px #000, 4px 8px 0px #000, 6px 8px 0px #000, 8px 8px 0px #000,
                      10px 8px 0px #000, 12px 8px 0px #000, 14px 8px 0px #000, 16px 8px 0px #000,
                      18px 8px 0px #000, 20px 8px 0px #000, 22px 8px 0px #000, 24px 8px 0px #000,
                      26px 8px 0px #000, 28px 8px 0px #000, 30px 8px 0px #000, 32px 8px 0px #000,
                      2px 10px 0px #cc3300, 4px 10px 0px #cc3300, 6px 10px 0px #cc3300,
                      8px 10px 0px #000, 10px 10px 0px #cc3300, 12px 10px 0px #cc3300,
                      14px 10px 0px #cc3300, 16px 10px 0px #cc3300, 18px 10px 0px #cc3300,
                      20px 10px 0px #cc3300, 22px 10px 0px #cc3300, 24px 10px 0px #000,
                      26px 10px 0px #cc3300, 28px 10px 0px #cc3300, 30px 10px 0px #cc3300,
                      32px 10px 0px #cc3300, 2px 12px 0px #cc3300, 4px 12px 0px #cc3300,
                      6px 12px 0px #cc3300, 8px 12px 0px #000, 10px 12px 0px #cc3300,
                      12px 12px 0px #cc3300, 14px 12px 0px #cc3300, 16px 12px 0px #cc3300,
                      18px 12px 0px #cc3300, 20px 12px 0px #cc3300, 22px 12px 0px #cc3300,
                      24px 12px 0px #000, 26px 12px 0px #cc3300, 28px 12px 0px #cc3300,
                      30px 12px 0px #cc3300, 32px 12px 0px #cc3300, 2px 14px 0px #cc3300,
                      4px 14px 0px #cc3300, 6px 14px 0px #cc3300, 8px 14px 0px #000,
                      10px 14px 0px #cc3300, 12px 14px 0px #cc3300, 14px 14px 0px #cc3300,
                      16px 14px 0px #cc3300, 18px 14px 0px #cc3300, 20px 14px 0px #cc3300,
                      22px 14px 0px #cc3300, 24px 14px 0px #000, 26px 14px 0px #cc3300,
                      28px 14px 0px #cc3300, 30px 14px 0px #cc3300, 32px 14px 0px #cc3300,
                      2px 16px 0px #000, 4px 16px 0px #000, 6px 16px 0px #000, 8px 16px 0px #000,
                      10px 16px 0px #000, 12px 16px 0px #000, 14px 16px 0px #000,
                      16px 16px 0px #000, 18px 16px 0px #000, 20px 16px 0px #000,
                      22px 16px 0px #000, 24px 16px 0px #000, 26px 16px 0px #000,
                      28px 16px 0px #000, 30px 16px 0px #000, 32px 16px 0px #000,
                      2px 18px 0px #cc3300, 4px 18px 0px #cc3300, 6px 18px 0px #cc3300,
                      8px 18px 0px #cc3300, 10px 18px 0px #cc3300, 12px 18px 0px #cc3300,
                      14px 18px 0px #cc3300, 16px 18px 0px #000, 18px 18px 0px #cc3300,
                      20px 18px 0px #cc3300, 22px 18px 0px #cc3300, 24px 18px 0px #cc3300,
                      26px 18px 0px #cc3300, 28px 18px 0px #cc3300, 30px 18px 0px #cc3300,
                      32px 18px 0px #000, 2px 20px 0px #cc3300, 4px 20px 0px #cc3300,
                      6px 20px 0px #cc3300, 8px 20px 0px #cc3300, 10px 20px 0px #cc3300,
                      12px 20px 0px #cc3300, 14px 20px 0px #cc3300, 16px 20px 0px #000,
                      18px 20px 0px #cc3300, 20px 20px 0px #cc3300, 22px 20px 0px #cc3300,
                      24px 20px 0px #cc3300, 26px 20px 0px #cc3300, 28px 20px 0px #cc3300,
                      30px 20px 0px #cc3300, 32px 20px 0px #000, 2px 22px 0px #cc3300,
                      4px 22px 0px #cc3300, 6px 22px 0px #cc3300, 8px 22px 0px #cc3300,
                      10px 22px 0px #cc3300, 12px 22px 0px #cc3300, 14px 22px 0px #cc3300,
                      16px 22px 0px #000, 18px 22px 0px #cc3300, 20px 22px 0px #cc3300,
                      22px 22px 0px #cc3300, 24px 22px 0px #cc3300, 26px 22px 0px #cc3300,
                      28px 22px 0px #cc3300, 30px 22px 0px #cc3300, 32px 22px 0px #000,
                      2px 24px 0px #000, 4px 24px 0px #000, 6px 24px 0px #000, 8px 24px 0px #000,
                      10px 24px 0px #000, 12px 24px 0px #000, 14px 24px 0px #000,
                      16px 24px 0px #000, 18px 24px 0px #000, 20px 24px 0px #000,
                      22px 24px 0px #000, 24px 24px 0px #000, 26px 24px 0px #000,
                      28px 24px 0px #000, 30px 24px 0px #000, 32px 24px 0px #000,
                      2px 26px 0px #cc3300, 4px 26px 0px #cc3300, 6px 26px 0px #cc3300,
                      8px 26px 0px #000, 10px 26px 0px #cc3300, 12px 26px 0px #cc3300,
                      14px 26px 0px #cc3300, 16px 26px 0px #cc3300, 18px 26px 0px #cc3300,
                      20px 26px 0px #cc3300, 22px 26px 0px #cc3300, 24px 26px 0px #000,
                      26px 26px 0px #cc3300, 28px 26px 0px #cc3300, 30px 26px 0px #cc3300,
                      32px 26px 0px #cc3300, 2px 28px 0px #cc3300, 4px 28px 0px #cc3300,
                      6px 28px 0px #cc3300, 8px 28px 0px #000, 10px 28px 0px #cc3300,
                      12px 28px 0px #cc3300, 14px 28px 0px #cc3300, 16px 28px 0px #cc3300,
                      18px 28px 0px #cc3300, 20px 28px 0px #cc3300, 22px 28px 0px #cc3300,
                      24px 28px 0px #000, 26px 28px 0px #cc3300, 28px 28px 0px #cc3300,
                      30px 28px 0px #cc3300, 32px 28px 0px #cc3300, 2px 30px 0px #cc3300,
                      4px 30px 0px #cc3300, 6px 30px 0px #cc3300, 8px 30px 0px #000,
                      10px 30px 0px #cc3300, 12px 30px 0px #cc3300, 14px 30px 0px #cc3300,
                      16px 30px 0px #cc3300, 18px 30px 0px #cc3300, 20px 30px 0px #cc3300,
                      22px 30px 0px #cc3300, 24px 30px 0px #000, 26px 30px 0px #cc3300,
                      28px 30px 0px #cc3300, 30px 30px 0px #cc3300, 32px 30px 0px #cc3300,
                      2px 32px 0px #000, 4px 32px 0px #000, 6px 32px 0px #000, 8px 32px 0px #000,
                      10px 32px 0px #000, 12px 32px 0px #000, 14px 32px 0px #000,
                      16px 32px 0px #000, 18px 32px 0px #000, 20px 32px 0px #000,
                      22px 32px 0px #000, 24px 32px 0px #000, 26px 32px 0px #000,
                      28px 32px 0px #000, 30px 32px 0px #000, 32px 32px 0px #000;
                }
                .sm-brick.one {
                    transform: translateX(-60px);
                }
                .sm-mush {
                    height: 2px;
                    width: 2px;
                    box-shadow: 14px 2px 0px #fc9838, 16px 2px 0px #fc9838, 18px 2px 0px #fc9838,
                      20px 2px 0px #fc9838, 12px 4px 0px #fc9838, 14px 4px 0px #fc9838,
                      16px 4px 0px #fc9838, 18px 4px 0px #fc9838, 20px 4px 0px #d82800,
                      22px 4px 0px #d82800, 10px 6px 0px #fc9838, 12px 6px 0px #fc9838,
                      14px 6px 0px #fc9838, 16px 6px 0px #fc9838, 18px 6px 0px #d82800,
                      20px 6px 0px #d82800, 22px 6px 0px #d82800, 24px 6px 0px #d82800,
                      8px 8px 0px #fc9838, 10px 8px 0px #fc9838, 12px 8px 0px #fc9838,
                      14px 8px 0px #fc9838, 16px 8px 0px #fc9838, 18px 8px 0px #d82800,
                      20px 8px 0px #d82800, 22px 8px 0px #d82800, 24px 8px 0px #d82800,
                      26px 8px 0px #d82800, 6px 10px 0px #fc9838, 8px 10px 0px #fc9838,
                      10px 10px 0px #fc9838, 12px 10px 0px #fc9838, 14px 10px 0px #fc9838,
                      16px 10px 0px #fc9838, 18px 10px 0px #fc9838, 20px 10px 0px #d82800,
                      22px 10px 0px #d82800, 24px 10px 0px #d82800, 26px 10px 0px #fc9838,
                      28px 10px 0px #fc9838, 4px 12px 0px #fc9838, 6px 12px 0px #fc9838,
                      8px 12px 0px #d82800, 10px 12px 0px #d82800, 12px 12px 0px #d82800,
                      14px 12px 0px #fc9838, 16px 12px 0px #fc9838, 18px 12px 0px #fc9838,
                      20px 12px 0px #fc9838, 22px 12px 0px #fc9838, 24px 12px 0px #fc9838,
                      26px 12px 0px #fc9838, 28px 12px 0px #fc9838, 30px 12px 0px #fc9838,
                      4px 14px 0px #fc9838, 6px 14px 0px #d82800, 8px 14px 0px #d82800,
                      10px 14px 0px #d82800, 12px 14px 0px #d82800, 14px 14px 0px #d82800,
                      16px 14px 0px #fc9838, 18px 14px 0px #fc9838, 20px 14px 0px #fc9838,
                      22px 14px 0px #fc9838, 24px 14px 0px #fc9838, 26px 14px 0px #fc9838,
                      28px 14px 0px #fc9838, 30px 14px 0px #fc9838, 2px 16px 0px #fc9838,
                      4px 16px 0px #fc9838, 6px 16px 0px #d82800, 8px 16px 0px #d82800,
                      10px 16px 0px #d82800, 12px 16px 0px #d82800, 14px 16px 0px #d82800,
                      16px 16px 0px #fc9838, 18px 16px 0px #fc9838, 20px 16px 0px #fc9838,
                      22px 16px 0px #fc9838, 24px 16px 0px #fc9838, 26px 16px 0px #d82800,
                      28px 16px 0px #d82800, 30px 16px 0px #fc9838, 32px 16px 0px #fc9838,
                      2px 18px 0px #fc9838, 4px 18px 0px #fc9838, 6px 18px 0px #d82800,
                      8px 18px 0px #d82800, 10px 18px 0px #d82800, 12px 18px 0px #d82800,
                      14px 18px 0px #d82800, 16px 18px 0px #fc9838, 18px 18px 0px #fc9838,
                      20px 18px 0px #fc9838, 22px 18px 0px #fc9838, 24px 18px 0px #fc9838,
                      26px 18px 0px #d82800, 28px 18px 0px #d82800, 30px 18px 0px #d82800,
                      32px 18px 0px #fc9838, 2px 20px 0px #fc9838, 4px 20px 0px #fc9838,
                      6px 20px 0px #fc9838, 8px 20px 0px #d82800, 10px 20px 0px #d82800,
                      12px 20px 0px #d82800, 14px 20px 0px #fc9838, 16px 20px 0px #fc9838,
                      18px 20px 0px #fc9838, 20px 20px 0px #fc9838, 22px 20px 0px #fc9838,
                      24px 20px 0px #fc9838, 26px 20px 0px #fc9838, 28px 20px 0px #d82800,
                      30px 20px 0px #d82800, 32px 20px 0px #fc9838, 2px 22px 0px #fc9838,
                      4px 22px 0px #fc9838, 6px 22px 0px #fc9838, 8px 22px 0px #fc9838,
                      10px 22px 0px #fc9838, 12px 22px 0px #fc9838, 14px 22px 0px #fc9838,
                      16px 22px 0px #fc9838, 18px 22px 0px #fc9838, 20px 22px 0px #fc9838,
                      22px 22px 0px #fc9838, 24px 22px 0px #fc9838, 26px 22px 0px #fc9838,
                      28px 22px 0px #fc9838, 30px 22px 0px #fc9838, 32px 22px 0px #fc9838,
                      4px 24px 0px #fc9838, 6px 24px 0px #d82800, 8px 24px 0px #d82800,
                      10px 24px 0px #d82800, 12px 24px 0px #fff, 14px 24px 0px #fff,
                      16px 24px 0px #fff, 18px 24px 0px #fff, 20px 24px 0px #fff,
                      22px 24px 0px #fff, 24px 24px 0px #d82800, 26px 24px 0px #d82800,
                      28px 24px 0px #d82800, 30px 24px 0px #fc9838, 10px 26px 0px #fff,
                      12px 26px 0px #fff, 14px 26px 0px #fff, 16px 26px 0px #fff,
                      18px 26px 0px #fff, 20px 26px 0px #fff, 22px 26px 0px #fff,
                      24px 26px 0px #fff, 10px 28px 0px #fff, 12px 28px 0px #fff,
                      14px 28px 0px #fff, 16px 28px 0px #fff, 18px 28px 0px #fff,
                      20px 28px 0px #fff, 22px 28px 0px #fc9838, 24px 28px 0px #fff,
                      10px 30px 0px #fff, 12px 30px 0px #fff, 14px 30px 0px #fff,
                      16px 30px 0px #fff, 18px 30px 0px #fff, 20px 30px 0px #fff,
                      22px 30px 0px #fc9838, 24px 30px 0px #fff, 12px 32px 0px #fff,
                      14px 32px 0px #fff, 16px 32px 0px #fff, 18px 32px 0px #fff,
                      20px 32px 0px #fc9838, 22px 32px 0px #fff;
                    transform: translate(-0px, -0px);
                    z-index: -1;
                    opacity: 0;
                }
                .sm-box {
                    position: absolute;
                    background-color: rgba(46, 37, 37, 0);
                    z-index: 3;
                    width: 34px;
                    height: 34px;
                }
                .sm-box:hover + .sm-mush {
                    animation: sm-mush 0.5s linear forwards;
                    opacity: 1;
                }
                @keyframes sm-mush {
                    0% {
                        transform: scale(0.8) translate(-0px, -0px);
                    }
                    50% {
                        transform: scale(1.1) translate(-0px, -80px);
                    }
                    100% {
                        transform: scale(1.1) translate(-0px, -35px);
                    }
                }
                .sm-container {
                    height: 2px;
                    width: 2px;
                    box-shadow: 4px 2px 0px #ce3100, 6px 2px 0px #ce3100, 8px 2px 0px #ce3100,
                      10px 2px 0px #ce3100, 12px 2px 0px #ce3100, 14px 2px 0px #ce3100,
                      16px 2px 0px #ce3100, 18px 2px 0px #ce3100, 20px 2px 0px #ce3100,
                      22px 2px 0px #ce3100, 24px 2px 0px #ce3100, 26px 2px 0px #ce3100,
                      28px 2px 0px #ce3100, 30px 2px 0px #ce3100, 2px 4px 0px #ce3100,
                      4px 4px 0px #ff9c31, 6px 4px 0px #ff9c31, 8px 4px 0px #ff9c31,
                      10px 4px 0px #ff9c31, 12px 4px 0px #ff9c31, 14px 4px 0px #ff9c31,
                      16px 4px 0px #ff9c31, 18px 4px 0px #ff9c31, 20px 4px 0px #ff9c31,
                      22px 4px 0px #ff9c31, 24px 4px 0px #ff9c31, 26px 4px 0px #ff9c31,
                      28px 4px 0px #ff9c31, 30px 4px 0px #ff9c31, 32px 4px 0px #000,
                      2px 6px 0px #ce3100, 4px 6px 0px #ff9c31, 6px 6px 0px #000,
                      8px 6px 0px #ff9c31, 10px 6px 0px #ff9c31, 12px 6px 0px #ff9c31,
                      14px 6px 0px #ff9c31, 16px 6px 0px #ff9c31, 18px 6px 0px #ff9c31,
                      20px 6px 0px #ff9c31, 22px 6px 0px #ff9c31, 24px 6px 0px #ff9c31,
                      26px 6px 0px #ff9c31, 28px 6px 0px #000, 30px 6px 0px #ff9c31,
                      32px 6px 0px #000, 2px 8px 0px #ce3100, 4px 8px 0px #ff9c31,
                      6px 8px 0px #ff9c31, 8px 8px 0px #ff9c31, 10px 8px 0px #ff9c31,
                      12px 8px 0px #ce3100, 14px 8px 0px #ce3100, 16px 8px 0px #ce3100,
                      18px 8px 0px #ce3100, 20px 8px 0px #ce3100, 22px 8px 0px #ff9c31,
                      24px 8px 0px #ff9c31, 26px 8px 0px #ff9c31, 28px 8px 0px #ff9c31,
                      30px 8px 0px #ff9c31, 32px 8px 0px #000, 2px 10px 0px #ce3100,
                      4px 10px 0px #ff9c31, 6px 10px 0px #ff9c31, 8px 10px 0px #ff9c31,
                      10px 10px 0px #ce3100, 12px 10px 0px #ce3100, 14px 10px 0px #000,
                      16px 10px 0px #000, 18px 10px 0px #000, 20px 10px 0px #ce3100,
                      22px 10px 0px #ce3100, 24px 10px 0px #ff9c31, 26px 10px 0px #ff9c31,
                      28px 10px 0px #ff9c31, 30px 10px 0px #ff9c31, 32px 10px 0px #000,
                      2px 12px 0px #ce3100, 4px 12px 0px #ff9c31, 6px 12px 0px #ff9c31,
                      8px 12px 0px #ff9c31, 10px 12px 0px #ce3100, 12px 12px 0px #ce3100,
                      14px 12px 0px #000, 16px 12px 0px #ff9c31, 18px 12px 0px #ff9c31,
                      20px 12px 0px #ce3100, 22px 12px 0px #ce3100, 24px 12px 0px #000,
                      26px 12px 0px #ff9c31, 28px 12px 0px #ff9c31, 30px 12px 0px #ff9c31,
                      32px 12px 0px #000, 2px 14px 0px #ce3100, 4px 14px 0px #ff9c31,
                      6px 14px 0px #ff9c31, 8px 14px 0px #ff9c31, 10px 14px 0px #ce3100,
                      12px 14px 0px #ce3100, 14px 14px 0px #000, 16px 14px 0px #ff9c31,
                      18px 14px 0px #ff9c31, 20px 14px 0px #ce3100, 22px 14px 0px #ce3100,
                      24px 14px 0px #000, 26px 14px 0px #ff9c31, 28px 14px 0px #ff9c31,
                      30px 14px 0px #ff9c31, 32px 14px 0px #000, 2px 16px 0px #ce3100,
                      4px 16px 0px #ff9c31, 6px 16px 0px #ff9c31, 8px 16px 0px #ff9c31,
                      10px 16px 0px #ff9c31, 12px 16px 0px #000, 14px 16px 0px #000,
                      16px 16px 0px #ff9c31, 18px 16px 0px #ce3100, 20px 16px 0px #ce3100,
                      22px 16px 0px #ce3100, 24px 16px 0px #000, 26px 16px 0px #ff9c31,
                      28px 16px 0px #ff9c31, 30px 16px 0px #ff9c31, 32px 16px 0px #000,
                      2px 18px 0px #ce3100, 4px 18px 0px #ff9c31, 6px 18px 0px #ff9c31,
                      8px 18px 0px #ff9c31, 10px 18px 0px #ff9c31, 12px 18px 0px #ff9c31,
                      14px 18px 0px #ff9c31, 16px 18px 0px #ce3100, 18px 18px 0px #ce3100,
                      20px 18px 0px #000, 22px 18px 0px #000, 24px 18px 0px #000,
                      26px 18px 0px #ff9c31, 28px 18px 0px #ff9c31, 30px 18px 0px #ff9c31,
                      32px 18px 0px #000, 2px 20px 0px #ce3100, 4px 20px 0px #ff9c31,
                      6px 20px 0px #ff9c31, 8px 20px 0px #ff9c31, 10px 20px 0px #ff9c31,
                      12px 20px 0px #ff9c31, 14px 20px 0px #ff9c31, 16px 20px 0px #ce3100,
                      18px 20px 0px #ce3100, 20px 20px 0px #000, 22px 20px 0px #ff9c31,
                      24px 20px 0px #ff9c31, 26px 20px 0px #ff9c31, 28px 20px 0px #ff9c31,
                      30px 20px 0px #ff9c31, 32px 20px 0px #000, 2px 22px 0px #ce3100,
                      4px 22px 0px #ff9c31, 6px 22px 0px #ff9c31, 8px 22px 0px #ff9c31,
                      10px 22px 0px #ff9c31, 12px 22px 0px #ff9c31, 14px 22px 0px #ff9c31,
                      16px 22px 0px #ff9c31, 18px 22px 0px #000, 20px 22px 0px #000,
                      22px 22px 0px #ff9c31, 24px 22px 0px #ff9c31, 26px 22px 0px #ff9c31,
                      28px 22px 0px #ff9c31, 30px 22px 0px #ff9c31, 32px 22px 0px #000,
                      2px 24px 0px #ce3100, 4px 24px 0px #ff9c31, 6px 24px 0px #ff9c31,
                      8px 24px 0px #ff9c31, 10px 24px 0px #ff9c31, 12px 24px 0px #ff9c31,
                      14px 24px 0px #ff9c31, 16px 24px 0px #ce3100, 18px 24px 0px #ce3100,
                      20px 24px 0px #ff9c31, 22px 24px 0px #ff9c31, 24px 24px 0px #ff9c31,
                      26px 24px 0px #ff9c31, 28px 24px 0px #ff9c31, 30px 24px 0px #ff9c31,
                      32px 24px 0px #000, 2px 26px 0px #ce3100, 4px 26px 0px #ff9c31,
                      6px 26px 0px #ff9c31, 8px 26px 0px #ff9c31, 10px 26px 0px #ff9c31,
                      12px 26px 0px #ff9c31, 14px 26px 0px #ff9c31, 16px 26px 0px #ce3100,
                      18px 26px 0px #ce3100, 20px 26px 0px #000, 22px 26px 0px #ff9c31,
                      24px 26px 0px #ff9c31, 26px 26px 0px #ff9c31, 28px 26px 0px #ff9c31,
                      30px 26px 0px #ff9c31, 32px 26px 0px #000, 2px 28px 0px #ce3100,
                      4px 28px 0px #ff9c31, 6px 28px 0px #000, 8px 28px 0px #ff9c31,
                      10px 28px 0px #ff9c31, 12px 28px 0px #ff9c31, 14px 28px 0px #ff9c31,
                      16px 28px 0px #ff9c31, 18px 28px 0px #000, 20px 28px 0px #000,
                      22px 28px 0px #ff9c31, 24px 28px 0px #ff9c31, 26px 28px 0px #ff9c31,
                      28px 28px 0px #000, 30px 28px 0px #ff9c31, 32px 28px 0px #000,
                      2px 30px 0px #ce3100, 4px 30px 0px #ff9c31, 6px 30px 0px #ff9c31,
                      8px 30px 0px #ff9c31, 10px 30px 0px #ff9c31, 12px 30px 0px #ff9c31,
                      14px 30px 0px #ff9c31, 16px 30px 0px #ff9c31, 18px 30px 0px #ff9c31,
                      20px 30px 0px #ff9c31, 22px 30px 0px #ff9c31, 24px 30px 0px #ff9c31,
                      26px 30px 0px #ff9c31, 28px 30px 0px #ff9c31, 30px 30px 0px #ff9c31,
                      32px 30px 0px #000, 2px 32px 0px #000, 4px 32px 0px #000, 6px 32px 0px #000,
                      8px 32px 0px #000, 10px 32px 0px #000, 12px 32px 0px #000,
                      14px 32px 0px #000, 16px 32px 0px #000, 18px 32px 0px #000,
                      20px 32px 0px #000, 22px 32px 0px #000, 24px 32px 0px #000,
                      26px 32px 0px #000, 28px 32px 0px #000, 30px 32px 0px #000,
                      32px 32px 0px #000;
                    position: absolute;
                    transform: translate(-30px);
                    z-index: 3;
                }
            \`}</style>

            <div>
                <div className="sm-brick one" />
                <div className="sm-container">
                    <div className="sm-box" />
                    <div className="sm-mush" />
                </div>
                <div className="sm-brick two" />
            </div>
        </div>
    );
};

export default SuperMario;`,
        vibePrompt: "Create a 'Super Mario' hover tooltip in React + TypeScript with pure CSS (no dependencies). The mark is a NES-style pixel scene inspired by Super Mario: two brick tiles frame a glassy '?' block, and hovering the block's invisible hit area launches a 1-up mushroom out of the box. Everything is drawn with 2x2px divs whose art comes entirely from huge comma-separated box-shadow stacks (each shadow is an Xpx Ypx 0px #color pixel), replicating the classic block/brick/mushroom pixel art pixel-for-pixel. Sprites: .sm-container renders the 34x34 '?' block (border #ce3100, face #ff9c31, black hinges and rivets at the seams) and is position absolute translateX(-30px) z-index 3; .sm-brick draws the 34x34 brick tile (#cc3300 fill, #ff9999 highlight top row, #000 mortar/outline) with .sm-brick.one translateX(-60px) and .sm-brick.two at neutral so the two tiles flank the block; .sm-mush draws the 34x34 1-up mushroom (#fc9838 cap with #d82800 gills and spots, #fff eyes/mushroom spots on the lower stem rows) hidden below the block (opacity 0, z-index -1). Interaction: .sm-box is an invisible 34x34 absolute hit-zone (z-index 3) sitting over the '?' block; on .sm-box:hover the adjacent .sm-mush is revealed (opacity 1) and runs sm-mush 0.5s linear forwards, which scales the mushroom 0.8 -> 1.1 while translating it -80px (pop up through the brick) and settling at -35px above the block, frozen by fill-mode forwards until the cursor leaves. All keyframes/classes prefixed sm-, drawn on a dark radial backdrop."
    },
    {
        id: "cinematic-navbar",
        title: "Cinematic Nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A dark cinematic navbar with a liquid-glass logo, sheen-sweep nav pills, a gradient CTA, and a responsive mobile burger menu.",
        preview: () => (<CinematicNavbarPreview />),
        code: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>UI HUB — Cinematic Navbar</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root{
    --bg:#000000;
    --border: rgba(255,255,255,0.16);
    --logo:15.5px;
    --logo-mark:22px;
    --nav:14px;
    --nav-h:40px;
    --btn:13.5px;
    --btn-h:40px;
    --header-y:22px;
    --header-x:40px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family:"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #000;
    color: #fff;
    -webkit-font-smoothing: antialiased;
    overflow-x: hidden;
  }
  a { color: inherit; text-decoration: none; }

  /* Grain texture */
  .grain{
    position: fixed;
    inset: 0;
    z-index: 0;
    pointer-events: none;
    opacity: 0.5;
    mix-blend-mode: screen;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }

  /* Header */
  .header{
    display:grid;
    grid-template-columns: 1fr auto 1fr;
    align-items:center;
    padding: var(--header-y) var(--header-x) 10px;
    z-index:50;
    position:relative;
    background: radial-gradient(120% 220% at 50% -60%, #232323 0%, #101010 45%, #000000 100%);
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }

  /* UI HUB Logo */
  .logo{ display:inline-flex; align-items:center; gap:9px; justify-self:start; font-size: var(--logo); font-weight:600; letter-spacing:-0.03em; color:#fff; }
  .logo svg{ width:var(--logo-mark); height:var(--logo-mark); }
  .logo-suffix{ font-weight:400; }

  /* Nav */
  .site-nav{ display:flex; align-items:center; gap:8px; justify-self:center; }
  .nav-pill{
    height: var(--nav-h);
    padding: 0 18px;
    border-radius: 7px;
    overflow: hidden;
    position: relative;
    display:inline-flex;
    align-items:center;
    border: 1px solid rgba(255,255,255,0.14);
    background: #232323;
    color: #e6e6e6;
    font-size: var(--nav);
    font-weight:400;
    letter-spacing:-0.01em;
    white-space:nowrap;
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
  }
  .nav-pill::before{
    content:"";
    position:absolute;
    inset:0;
    background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.16) 50%, transparent 70%);
    transform: translateX(-120%);
    transition: transform 0.6s ease;
  }
  .nav-pill:hover::before{ transform: translateX(120%); }
  .nav-pill:hover{
    border-color: rgba(255,255,255,0.28);
    background: #2e2e2e;
    box-shadow: 0 0 18px rgba(200,210,230,0.12);
  }

  /* CTA Button (liquid-glass language) */
  .btn{
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: var(--btn-h);
    padding: 0 16px;
    border-radius: 6px;
    font-size: var(--btn);
    font-weight: 500;
    letter-spacing: -0.02em;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease, color 0.35s ease;
  }
  .btn::after{
    content:"";
    position:absolute;
    inset:0;
    background: linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.45) 48%, transparent 76%);
    transform: translateX(-130%);
    transition: transform 0.65s ease;
  }
  .btn:hover::after{ transform: translateX(130%); }

  .btn-solid{
    background: linear-gradient(180deg, #ffffff 0%, #e7e7e7 48%, #cfcfcf 100%);
    color:#111;
    border:1px solid #fff;
    justify-self:end;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.95);
  }
  .btn-solid:hover{
    background: linear-gradient(180deg, #fff 0%, #f3f6ff 42%, #d5def2 100%);
    border-color:#f2f6ff;
    box-shadow: inset 0 1px 0 #fff, 0 0 22px rgba(186,208,255,0.35), 0 8px 18px rgba(255,255,255,0.12);
  }

  /* Burger (mobile) */
  .burger{
    display:none;
    width:42px;
    height:42px;
    border-radius:6px;
    border:1px solid var(--border);
    background: rgba(8,8,8,0.55);
    z-index:60;
    align-items:center;
    justify-content:center;
    cursor:pointer;
    position:relative;
    flex-direction:column;
    gap:5px;
    transition: border-color 0.25s ease, background 0.25s ease;
  }
  .burger .bar{ width:16px; height:1.5px; background:#fff; border-radius:1px; transition: transform 0.25s ease, opacity 0.2s ease; }
  body.menu-open .burger .bar:nth-child(1){ transform: translateY(6.5px) rotate(45deg); }
  body.menu-open .burger .bar:nth-child(2){ opacity: 0; }
  body.menu-open .burger .bar:nth-child(3){ transform: translateY(-6.5px) rotate(-45deg); }

  /* Full-screen mobile menu */
  .menu-backdrop{
    display:block;
    position:fixed;
    inset:0;
    z-index:40;
    background: rgba(8,8,8,0.42);
    opacity:0;
    visibility:hidden;
    transition: opacity 0.28s ease, backdrop-filter 0.28s ease;
  }
  body.menu-open .menu-backdrop{ opacity:1; visibility:visible; backdrop-filter: blur(24px); }
  body.menu-open{ overflow:hidden; }

  @media (max-width: 900px){
    .burger{ display:flex; }
    .header{ grid-template-columns: 1fr auto auto; gap:8px; padding: 16px 16px 10px; }
    .logo, .burger{ z-index:80; position:relative; }
    .btn-solid{ display:none; }
    .site-nav{
      display: none;
      position: fixed;
      inset:0;
      z-index:45;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      gap:12px;
      padding: 96px 22px 32px;
    }
    body.menu-open .site-nav{ display:flex; }
    .nav-pill{ width:auto; min-width:200px; height:56px; font-size:19px; border-radius:10px; justify-content:center; }
  }
</style>
</head>
<body>
<div class="grain"></div>
<div class="menu-backdrop" id="menuBackdrop"></div>

<header class="header">
  <a class="logo" href="#top" aria-label="Vesper.ai">
    <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(-30 12 12)">
        <circle cx="7.3" cy="3.2" r="1.45"/>
        <rect x="5.5" y="4.7" width="3.6" height="14.6" rx="1.8"/>
        <rect x="14.9" y="4.7" width="3.6" height="14.6" rx="1.8"/>
        <circle cx="16.7" cy="20.8" r="1.45"/>
      </g>
    </svg>
    Vesper<span class="logo-suffix">.ai</span>
  </a>

  <nav class="site-nav" id="site-nav" aria-label="Primary">
    <a class="nav-pill" href="#benefits">Benefits</a>
    <a class="nav-pill" href="#how-it-works">How It Works</a>
    <a class="nav-pill" href="#faqs">FAQs</a>
    <a class="nav-pill" href="#pricing">Pricing</a>
  </nav>

  <a class="btn btn-solid" href="#start">Start for Free</a>

  <button class="burger" id="burger" aria-controls="site-nav" aria-expanded="false" aria-label="Open menu">
    <span class="bar"></span>
    <span class="bar"></span>
    <span class="bar"></span>
  </button>
</header>

<script>
(function(){
  var burger = document.getElementById('burger');
  var backdrop = document.getElementById('menuBackdrop');
  var navLinks = document.querySelectorAll('#site-nav a');

  function closeMenu(){
    document.body.classList.remove('menu-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
  }
  function openMenu(){
    document.body.classList.add('menu-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
  }

  burger.addEventListener('click', function(){
    document.body.classList.contains('menu-open') ? closeMenu() : openMenu();
  });

  navLinks.forEach(function(link){ link.addEventListener('click', closeMenu); });

  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', function(){
    if (window.matchMedia('(min-width: 901px)').matches) closeMenu();
  });
})();
</script>
</body>
</html>`,
        vibePrompt: "Create a 'Cinematic Navbar' for the Vesper.ai brand in HTML/CSS/JS with zero external dependencies. Design language: a black cinematic site header. Layout is a 3-column grid (1fr auto 1fr) so the logo sits left, centered nav, and a CTA button right. Logo: a white 'Vesper.ai' wordmark with a unique mark — an SVG shape of a vertical bar/capsule with end dots (circle cx 7.3 cy 3.2 r 1.45, rounded rect 5.5 4.7 3.6x14.6 rx1.8, and a second rounded rect 14.9 4.7 3.6x14.6 rx1.8, circle cx 16.7 cy 20.8 r 1.45) inside a <g transform=rotate(-30 12 12)>, filled currentColor, sized 22px; 'Vesper' in 600 weight followed by '.ai' in 400 weight, letter-spacing -0.03em. Background: radial-gradient(120% 220% at 50% -60%, #232323 0%, #101010 45%, #000000 100%) with a subtle white bottom border, plus an optional film-grain overlay (.grain) using a feTurbulence SVG data-URI at opacity 0.5, mix-blend-mode screen. Nav links: 'nav-pill' ghosts — #232323 fill, 1px rgba(255,255,255,0.14) border, 7px radius, height 40px, font 14px #e6e6e6; a :before sheen sweeps across on hover (linear-gradient 115deg transparent->rgba(255,255,255,0.16)->transparent, translateX -120% -> 120%) and the pill lights up (bg #2e2e2e, border 0.28 alpha, glow box-shadow). CTA: '.btn btn-solid' — white-to-#cfcfcf vertical gradient, #111 text, inset top highlight; a :after diagonal light sweep animates on hover. Mobile (<900px): a 3-bar burger toggles a full-screen menu; body gets .menu-open which morphs links to an X; nav links become large centered pills; the CTA hides; Escape and resize >900px close it. Shared liquid-glass motion: all sheens/glows transition 0.35s ease, reduced-motion disables them. Keep everything responsive with CSS variables for sizing."
    },
    {
        id: "floating-dark-capsule",
        title: "Floating Dark Capsule nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A floating dark glass capsule navbar with a custom logo, center pill navigation, a white get-started button, and mobile-responsive links.",
        preview: () => (<FloatingDarkCapsuleNavbarPreview />),
        code: `import React from "react";

const navLinks = ["platform", "solutions", "company", "support"];

const Logo = () => (
  <svg
    viewBox="0 0 256 256"
    className="h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#ffffff"
      d="M 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 128 L 64 128 Z
         M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z
         M 128 64 L 128 128 L 64.5 128 L 32 95 L 0 64 L 0 0 L 64 0 Z
         M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 128 0 L 192 0 Z"
    />
  </svg>
);

const Navbar: React.FC = () => {
  return (
    <nav className="absolute z-20 top-0 left-0 right-0 px-6 md:px-10 pt-6 flex items-center justify-between gap-4">
      {/* Left pill: logo + brand */}
      <div className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur rounded-full pl-4 pr-6 py-3">
        <Logo />
        <span className="text-white text-sm font-normal tracking-tight">
          securify
        </span>
      </div>

      {/* Center pill: nav links (hidden on mobile) */}
      <div className="hidden md:flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2">
        {navLinks.map((link) => (
          <a
            key={link}
            href="#"
            className="text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full"
          >
            {link}
          </a>
        ))}
      </div>

      {/* Right button */}
      <button className="bg-white text-black text-sm font-normal rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors">
        get started
      </button>
    </nav>
  );
};

export default Navbar;`,
        vibePrompt: "Create a 'Floating Dark Capsule' navbar in React and TypeScript styled with Tailwind CSS. It is an absolutely-positioned top bar (absolute z-20 top-0 left-0 right-0, padding px-6 md:px-10 pt-6) laid out with flex items-center justify-between gap-4 above a dark radial hero (radial-gradient 120% 160% at 50% 0%, #2a2a2e -> #141416 -> #050506). Three floating capsules separated by a soft drop shadow: (1) Left brand pill - rounded-full with bg-neutral-900/90 and backdrop-blur, pl-4 pr-6 py-3, containing a white 20x20 SVG 'securify' logo (four-part geometric mark built from M/L/Z path segments on a 256 viewBox, fill #ffffff) plus a white 'securify' wordmark (text-sm font-normal tracking-tight); (2) Center nav pill - hidden md:flex, also bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2, mapping over const navLinks = ['platform','solutions','company','support'] to render <a> links with text-neutral-300 hover:text-white transition-colors text-sm px-5 py-2 rounded-full; (3) Right CTA button - bg-white text-black rounded-full px-6 py-3 hover:bg-neutral-200 transition-colors labelled 'get started' in lowercase. Keep all three pills glassy, dark rounded-full capsules that float over a dark surface; nav links collapse away on mobile (hidden md:flex) while logo and CTA remain. The exact production source used to build this component is embedded below - preserve it verbatim.",
    },
    {
        id: "minimal-ai-capsule",
        title: "Minimal AI Capsule nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A minimal floating AI navbar built with Framer Motion: a circular menu pill, logo wordmark, status pills, sliding in on load.",
        preview: () => (<MinimalAICapsuleNavbarPreview />),
        code: `// Navbar.tsx
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import "./Navbar.css";

const ease = [0.16, 1, 0.3, 1] as const;

const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <rect
      x="8"
      y="2"
      width="12"
      height="5"
      rx="2.5"
      fill="#000000"
      transform="rotate(-35 14 14)"
    />
    <rect
      x="8"
      y="21"
      width="12"
      height="5"
      rx="2.5"
      fill="#000000"
      transform="rotate(-35 14 14)"
    />
  </svg>
);

const GridIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <circle cx="2.5" cy="2.5" r="1.5" fill="#ffffff" />
    <circle cx="9.5" cy="2.5" r="1.5" fill="#ffffff" />
    <circle cx="2.5" cy="9.5" r="1.5" fill="#ffffff" />
    <circle cx="9.5" cy="9.5" r="1.5" fill="#ffffff" />
  </svg>
);

export default function Navbar() {
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <div className="navbar__left">
        <div className="navbar__logo">
          <LogoIcon />
          <span className="navbar__brand">NeuralKinetics</span>
        </div>

        <button className="navbar__menu-pill" type="button">
          <span className="navbar__menu-dot">
            <Plus size={12} strokeWidth={3} color="#000000" />
          </span>
          <span className="navbar__menu-text">Menu</span>
        </button>

        <div className="navbar__tags-pill">
          <span className="navbar__tag">Advanced Bionics</span>
          <span className="navbar__tag">Cognitive AI</span>
        </div>
      </div>

      <div className="navbar__right">
        <div className="navbar__right-pill">
          <span className="navbar__right-circle">
            <GridIcon />
          </span>
          <span className="navbar__right-label">Adaptive Systems</span>
        </div>
      </div>
    </motion.nav>
  );
}

// ============================================================
// Navbar.css
// ============================================================
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  pointer-events: none;
}

.navbar > * {
  pointer-events: auto;
}

.navbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.navbar__right {
  display: flex;
  align-items: center;
}

/* Logo */
.navbar__logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar__brand {
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #000000;
  display: none;
}

/* Menu pill */
.navbar__menu-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #000000;
  border: none;
  border-radius: 999px;
  padding: 6px 14px 6px 6px;
  cursor: pointer;
}

.navbar__menu-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffff;
  flex-shrink: 0;
}

.navbar__menu-text {
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: #ffffff;
}

/* Tags pill */
.navbar__tags-pill {
  display: none;
  align-items: center;
  gap: 4px;
  background: #f4f4f6;
  border-radius: 999px;
  padding: 6px 6px;
}

.navbar__tag {
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: #000000;
  padding: 6px 12px;
  border-radius: 999px;
  white-space: nowrap;
}

/* Right pill */
.navbar__right-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f4f6;
  border-radius: 999px;
  padding: 6px 6px 6px 6px;
}

.navbar__right-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #000000;
  flex-shrink: 0;
}

.navbar__right-label {
  display: none;
  font-family: "Inter", system-ui, sans-serif;
  font-weight: 400;
  font-size: 11px;
  color: #000000;
  padding-right: 8px;
}

/* Desktop (768px+) */
@media (min-width: 768px) {
  .navbar {
    padding: 24px 32px;
  }

  .navbar__brand {
    display: inline-block;
  }

  .navbar__tags-pill {
    display: flex;
  }

  .navbar__right-label {
    display: inline-block;
  }

  .navbar__menu-dot,
  .navbar__right-circle {
    width: 32px;
    height: 32px;
  }
}`,
        vibePrompt: "Create a 'Minimal AI Capsule' navbar as a React + TypeScript component using motion/react (Framer Motion) and lucide-react. Two files. Navbar.tsx imports { motion } from 'motion/react' and { Plus } from 'lucide-react', plus './Navbar.css'. Easing const ease = [0.16, 1, 0.3, 1] as const. Two inline SVG icon components: LogoIcon (28x28, two rotated 12x5 rounded rects #000000, the NeuralKinetics diagonal mark) and GridIcon (12x12, four white 1.5r dots). The exported Navbar renders <motion.nav className='navbar' initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease }}> laid out with flex space-between; nav is pointer-events none, children auto. Left group (.navbar__left, gap 12px): logo (LogoIcon + 'NeuralKinetics' .navbar__brand, Inter 500 14px #000000, hidden until desktop 768px), a black (#000000) 999px 'Menu' pill (.navbar__menu-pill, padding 6px 14px 6px 6px) holding a white 28px circle (.navbar__menu-dot) with a black Plus (lucide size 12 strokeWidth 3) and white Inter 400 11px 'Menu' label, plus a grey tags pill (.navbar__tags-pill, #f4f4f6, 999px, hidden until desktop) with two .navbar__tag chips 'Advanced Bionics' and 'Cognitive AI' (Inter 11px #000000, padding 6px 12px). Right group (.navbar__right): .navbar__right-pill (#f4f4f6, 999px, gap 8px) with a black 28px circle (.navbar__right-circle) containing GridIcon and a 'Adaptive Systems' label (.navbar__right-label, Inter 400 11px, padding-right 8px, hidden until desktop). In Navbar.css the nav is fixed, top 0 left 0 right 0, z-index 50. At min-width 768px: nav padding 24px 32px and brand, tags pill and right label become visible; menu dot and right circle grow to 32px. Reproduce the exact production source embedded below verbatim.",
    },
    {
        id: "pill-navbar",
        title: "Pill Navbar nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A GSAP-powered pill navbar with a spinning circular logo and rounded capsules that expand on hover, driven by per-pill timelines.",
        preview: () => (<PillNavbarPreview />),
        code: `// PillNav.tsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach(circle => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = \`\${D}px\`;
        circle.style.height = \`\${D}px\`;
        circle.style.bottom = \`-\${delta}px\`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: \`50% \${originY}px\`
        });

        const label = pill.querySelector('.pill-label');
        const white = pill.querySelector('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts?.ready) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  const handleEnter = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = i => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = href =>
    href.startsWith('http://') ||
    href.startsWith('https://') ||
    href.startsWith('//') ||
    href.startsWith('mailto:') ||
    href.startsWith('tel:') ||
    href.startsWith('#');

  const isRouterLink = href => href && !isExternalLink(href);

  const cssVars = {
    ['--base']: baseColor,
    ['--pill-bg']: pillColor,
    ['--hover-text']: hoveredPillTextColor,
    ['--pill-text']: resolvedPillTextColor
  };

  return (
    <div className="pill-nav-container">
      <nav className={\`pill-nav \${className}\`} aria-label="Primary" style={cssVars}>
        {isRouterLink(items?.[0]?.href) ? (
          <Link
            className="pill-logo"
            to={items[0].href}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            role="menuitem"
            ref={el => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </Link>
        ) : (
          <a
            className="pill-logo"
            href={items?.[0]?.href || '#'}
            aria-label="Home"
            onMouseEnter={handleLogoEnter}
            ref={el => {
              logoRef.current = el;
            }}
          >
            <img src={logo} alt={logoAlt} ref={logoImgRef} />
          </a>
        )}

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list" role="menubar">
            {items.map((item, i) => (
              <li key={item.href || \`item-\${i}\`} role="none">
                {isRouterLink(item.href) ? (
                  <Link
                    role="menuitem"
                    to={item.href}
                    className={\`pill\${activeHref === item.href ? ' is-active' : ''}\`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                ) : (
                  <a
                    role="menuitem"
                    href={item.href}
                    className={\`pill\${activeHref === item.href ? ' is-active' : ''}\`}
                    aria-label={item.ariaLabel || item.label}
                    onMouseEnter={() => handleEnter(i)}
                    onMouseLeave={() => handleLeave(i)}
                  >
                    <span
                      className="hover-circle"
                      aria-hidden="true"
                      ref={el => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span className="pill-label">{item.label}</span>
                      <span className="pill-label-hover" aria-hidden="true">
                        {item.label}
                      </span>
                    </span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>

        <button
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div className="mobile-menu-popover mobile-only" ref={mobileMenuRef} style={cssVars}>
        <ul className="mobile-menu-list">
          {items.map((item, i) => (
            <li key={item.href || \`mobile-item-\${i}\`}>
              {isRouterLink(item.href) ? (
                <Link
                  to={item.href}
                  className={\`mobile-menu-link\${activeHref === item.href ? ' is-active' : ''}\`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className={\`mobile-menu-link\${activeHref === item.href ? ' is-active' : ''}\`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;

// ============================================================
// PillNav.css
// ============================================================
.pill-nav-container {
  position: absolute;
  top: 1em;
  z-index: 99;
}

@media (max-width: 768px) {
  .pill-nav-container {
    width: 100%;
    left: 0;
  }
}

.pill-nav {
  --nav-h: 42px;
  --logo: 36px;
  --pill-pad-x: 18px;
  --pill-gap: 3px;
  width: max-content;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .pill-nav {
    width: 100%;
    justify-content: space-between;
    padding: 0 1rem;
    background: transparent;
  }
}

.pill-nav-items {
  position: relative;
  display: flex;
  align-items: center;
  height: var(--nav-h);
  background: var(--base, #000);
  border-radius: 9999px;
}

.pill-logo {
  width: var(--nav-h);
  height: var(--nav-h);
  border-radius: 50%;
  background: var(--base, #000);
  padding: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pill-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pill-list {
  list-style: none;
  display: flex;
  align-items: stretch;
  gap: var(--pill-gap);
  margin: 0;
  padding: 3px;
  height: 100%;
}

.pill-list > li {
  display: flex;
  height: 100%;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 var(--pill-pad-x);
  background: var(--pill-bg, #fff);
  color: var(--pill-text, var(--base, #000));
  text-decoration: none;
  border-radius: 9999px;
  box-sizing: border-box;
  font-weight: 600;
  font-size: 16px;
  line-height: 0;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  white-space: nowrap;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.pill .hover-circle {
  position: absolute;
  left: 50%;
  bottom: 0;
  border-radius: 50%;
  background: var(--base, #000);
  z-index: 1;
  display: block;
  pointer-events: none;
  will-change: transform;
}

.pill .label-stack {
  position: relative;
  display: inline-block;
  line-height: 1;
  z-index: 2;
}

.pill .pill-label {
  position: relative;
  z-index: 2;
  display: inline-block;
  line-height: 1;
  will-change: transform;
}

.pill .pill-label-hover {
  position: absolute;
  left: 0;
  top: 0;
  color: var(--hover-text, #fff);
  z-index: 3;
  display: inline-block;
  will-change: transform, opacity;
}

.pill.is-active::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: var(--base, #000);
  border-radius: 50px;
  z-index: 4;
}

.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .mobile-only {
    display: block;
  }
}

.mobile-menu-button {
  width: var(--nav-h);
  height: var(--nav-h);
  border-radius: 50%;
  background: var(--base, #000);
  border: none;
  display: none;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  padding: 0;
  position: relative;
}

@media (max-width: 768px) {
  .mobile-menu-button {
    display: flex;
  }
}

.hamburger-line {
  width: 16px;
  height: 2px;
  background: var(--pill-bg, #fff);
  border-radius: 1px;
  transition: all 0.01s ease;
  transform-origin: center;
}

.mobile-menu-popover {
  position: absolute;
  top: 3em;
  left: 1rem;
  right: 1rem;
  background: var(--base, #f0f0f0);
  border-radius: 27px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 998;
  opacity: 0;
  transform-origin: top center;
  visibility: hidden;
}

.mobile-menu-list {
  list-style: none;
  margin: 0;
  padding: 3px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mobile-menu-popover .mobile-menu-link {
  display: block;
  padding: 12px 16px;
  color: var(--pill-text, #fff);
  background-color: var(--pill-bg, #fff);
  text-decoration: none;
  font-size: 16px;
  font-weight: 500;
  border-radius: 50px;
  transition: all 0.2s ease;
}

.mobile-menu-popover .mobile-menu-link:hover {
  cursor: pointer;
  background-color: var(--base);
  color: var(--hover-text, #fff);
}`,
        vibePrompt: "Add a pill-based navigation bar to the UI. Implement the <PillNav /> component from React Bits (https://reactbits.dev) as a single PillNav.tsx file with a matching PillNav.css, using GSAP (gsap) for all animations. dependencies: gsap, react-router-dom. PillNav props: logo (string URL for the logo image), logoAlt (default 'Logo'), items (PillNavItem[] each with label, href, optional ariaLabel), activeHref (href of the currently active item), className (additional classes, default ''), ease (GSAP easing string, default 'power3.easeOut'), baseColor (nav base background, default '#fff'), pillColor (pill background, default '#120F17'), hoveredPillTextColor (text color on hover, default '#120F17'), pillTextColor (pill text color, defaults to baseColor), onMobileMenuClick (callback), initialLoadAnimation (boolean, default true, enables logo scale + nav items width reveal on load). The component wires CSS variables --base, --pill-bg, --hover-text, --pill-text onto the <nav> so PillNav.css colors them. Markup: <nav className='pill-nav' a11y label 'Primary'> with a circular .pill-logo (containing the logo <img>, rotates 360 on hover via gsap) then a .pill-nav-items pill row (.desktop-only) with an unordered .pill-list of .pill links. Each .pill is a rounded capsule with a .hover-circle (an absolutely positioned circle behind the label that expands from the bottom on hover) and a .label-stack containing two stacked label spans: .pill-label (base text) and .pill-label-hover (the text slid up on hover). The active pill shows a small dot under it via .pill.is-active::after. On hover the underlying base-colored circle is revealed by animating the label up and the white hover text label down into view, all driven by a layout() function that computes the circle geometry (R, D, delta, originY) from each capsule's bounding rect and builds a paused gsap timeline per pill, started by tweenTo on mouse enter (0.3s) and tweenTo 0 on leave (0.2s). A mobile hamburger button (.mobile-menu-button, circles to an X when open) toggles a .mobile-menu-popover dropdown using gsap opacity/transform animations and calls onMobileMenuClick. CSS: .pill-nav-container is position absolute top 1em; .pill-nav width max-content with --nav-h 42px, gap 3px, 18px pill padding; .pill-nav-items has the white (base) pill background border-radius 9999px; pills are 16px uppercase 600 weight. In PillNav.css add responsive styles: below 768px the .pill-nav spans full width, .desktop-only hides, .mobile-only shows. Reproduce the exact production source for both PillNav.tsx and PillNav.css verbatim (embedded below), and use the website/app main logo as the 'logo' prop value.",
    },
    {
        id: "modern-dark",
        title: "Modern Dark nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A modern dark navbar with a sticky blurred header, mega-menu dropdowns, a Pricing link, and a get-started button.",
        preview: () => (<ModernDarkNavbarPreview />),
        code: `// navigation-menu.tsx
import * as React from 'react';
import * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu';
import { ArrowRightIcon, ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { GridCard } from '@/components/ui/grid-card';

type NavItemType = {
	title: string;
	href: string;
	description?: string;
	icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

function NavigationMenu({
	className,
	children,
	viewport = true,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Root> & {
	viewport?: boolean;
}) {
	return (
		<NavigationMenuPrimitive.Root
			data-slot="navigation-menu"
			data-viewport={viewport}
			className={cn(
				'group/navigation-menu flex max-w-max flex-1 items-center justify-center',
				className,
			)}
			{...props}
		>
			{children}
			{viewport && <NavigationMenuViewport />}
		</NavigationMenuPrimitive.Root>
	);
}

function NavigationMenuList({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.List>) {
	return (
		<NavigationMenuPrimitive.List
			data-slot="navigation-menu-list"
			className={cn(
				'group flex flex-1 list-none items-center justify-center gap-1',
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuItem({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Item>) {
	return (
		<NavigationMenuPrimitive.Item
			data-slot="navigation-menu-item"
			className={cn('relative', className)}
			{...props}
		/>
	);
}

function NavigationMenuTrigger({
	className,
	children,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Trigger>) {
	return (
		<NavigationMenuPrimitive.Trigger
			data-slot="navigation-menu-trigger"
			className={cn(
				'group hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[state=open]:hover:bg-accent data-[state=open]:text-accent-foreground data-[state=open]:focus:bg-accent data-[state=open]:bg-accent/50 focus-visible:ring-ring/50 inline-flex w-max items-center justify-center rounded-md px-4 py-1 text-sm font-medium transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50',
				className,
			)}
			{...props}
		>
			{children}{' '}
			<ChevronDownIcon
				className="relative top-[1px] ml-1 size-3 transition duration-300 group-data-[state=open]:rotate-180"
				aria-hidden="true"
			/>
		</NavigationMenuPrimitive.Trigger>
	);
}

function NavigationMenuContent({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Content>) {
	return (
		<NavigationMenuPrimitive.Content
			data-slot="navigation-menu-content"
			className={cn(
				'data-[motion^=from-]:animate-in data-[motion^=to-]:animate-out data-[motion^=from-]:fade-in data-[motion^=to-]:fade-out data-[motion=from-end]:slide-in-from-right-52 data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-end]:slide-out-to-right-52 data-[motion=to-start]:slide-out-to-left-52 top-0 left-0 w-full md:absolute md:w-auto',
				'group-data-[viewport=false]/navigation-menu:bg-background/80 group-data-[viewport=false]/navigation-menu:text-foreground group-data-[viewport=false]/navigation-menu:data-[state=open]:animate-in group-data-[viewport=false]/navigation-menu:data-[state=closed]:animate-out group-data-[viewport=false]/navigation-menu:data-[state=closed]:zoom-out-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:zoom-in-95 group-data-[viewport=false]/navigation-menu:data-[state=open]:fade-in-0 group-data-[viewport=false]/navigation-menu:data-[state=closed]:fade-out-0 group-data-[viewport=false]/navigation-menu:top-full group-data-[viewport=false]/navigation-menu:mt-1.5 group-data-[viewport=false]/navigation-menu:overflow-hidden group-data-[viewport=false]/navigation-menu:rounded-md group-data-[viewport=false]/navigation-menu:border group-data-[viewport=false]/navigation-menu:shadow group-data-[viewport=false]/navigation-menu:duration-300 **:data-[slot=navigation-menu-link]:focus:ring-0 **:data-[slot=navigation-menu-link]:focus:outline-none',
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuViewport({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Viewport>) {
	return (
		<div className="absolute top-full left-0 isolate z-50 flex justify-center">
			<NavigationMenuPrimitive.Viewport
				data-slot="navigation-menu-viewport"
				className={cn(
					'origin-top-center bg-background/95 supports-[backdrop-filter]:bg-background/60 text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow backdrop-blur-xl md:w-[var(--radix-navigation-menu-viewport-width)]',
					className,
				)}
				{...props}
			/>
		</div>
	);
}

function NavigationMenuLink({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Link>) {
	return (
		<NavigationMenuPrimitive.Link
			data-slot="navigation-menu-link"
			className={cn(
				"data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground flex flex-col justify-center gap-1 rounded-sm px-4 py-1 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		/>
	);
}

function NavigationMenuIndicator({
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuPrimitive.Indicator>) {
	return (
		<NavigationMenuPrimitive.Indicator
			data-slot="navigation-menu-indicator"
			className={cn(
				'data-[state=visible]:animate-in data-[state=hidden]:animate-out data-[state=hidden]:fade-out data-[state=visible]:fade-in top-full z-[1] flex h-1.5 items-end justify-center overflow-hidden',
				className,
			)}
			{...props}
		>
			<div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
		</NavigationMenuPrimitive.Indicator>
	);
}

function NavGridCard({
	link,
	...props
}: React.ComponentProps<'div'> & {
	link: NavItemType;
}) {
	return (
		<NavigationMenuPrimitive.Link asChild>
			<GridCard {...props}>
				{link.icon && (
					<link.icon className="text-foreground/80 relative size-5" />
				)}
				<div className="relative">
					<span className="text-foreground/80 text-sm font-medium">
						{link.title}
					</span>
					{link.description && (
						<p className="text-muted-foreground mt-2 text-xs">
							{link.description}
						</p>
					)}
				</div>
			</GridCard>
		</NavigationMenuPrimitive.Link>
	);
}

function NavSmallItem({
	item,
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & {
	item: Omit<NavItemType, 'description'>;
}) {
	return (
		<NavigationMenuLink
			className={cn(
				'group relative h-max flex-row items-center gap-x-3 px-2 py-2',
				className,
			)}
			{...props}
		>
			{item.icon && <item.icon />}
			<p className="text-sm">{item.title}</p>
			<div className="relative ml-auto flex h-full w-4 items-center">
				<ArrowRightIcon className="size-4 -translate-x-2 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
			</div>
		</NavigationMenuLink>
	);
}

function NavLargeItem({
	link,
	className,
	...props
}: React.ComponentProps<typeof NavigationMenuLink> & {
	link: NavItemType;
}) {
	return (
		<NavigationMenuLink
			className={cn(
				'bg-background group relative flex flex-col justify-center border p-0',
				className,
			)}
			{...props}
		>
			<div className="flex items-center justify-between px-5 py-4">
				<div className="space-y-1">
					<span className="text-sm leading-none font-medium">{link.title}</span>
					{link.description && (
						<p className="text-muted-foreground line-clamp-1 text-xs">
							{link.description}
						</p>
					)}
				</div>
				{link.icon && <link.icon className="text-muted-foreground size-6" />}
			</div>
		</NavigationMenuLink>
	);
}

function NavItemMobile({
	item,
	className,
	...props
}: React.ComponentProps<'a'> & {
	item: NavItemType;
}) {
	return (
		<a
			className={cn(
				"data-[active=true]:focus:bg-accent data-[active=true]:hover:bg-accent data-[active=true]:bg-accent/50 data-[active=true]:text-accent-foreground hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus-visible:ring-ring/50 [&_svg:not([class*='text-'])]:text-muted-foreground group relative flex gap-1 gap-x-2 rounded-sm p-2 text-sm transition-all outline-none focus-visible:ring-[3px] focus-visible:outline-1 [&_svg:not([class*='size-'])]:size-4",
				className,
			)}
			{...props}
		>
			<div
				className={cn(
					'bg-muted/20 flex size-10 items-center justify-center rounded-lg border',
				)}
			>
				{item.icon && <item.icon />}
			</div>
			<div className={cn('flex h-10 flex-col justify-center')}>
				<p className="text-sm">{item.title}</p>
				<span className="text-muted-foreground line-clamp-1 text-xs leading-snug">
					{item.description}
				</span>
			</div>
		</a>
	);
}

export {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuContent,
	NavigationMenuTrigger,
	NavigationMenuLink,
	NavigationMenuIndicator,
	NavigationMenuViewport,
	NavGridCard,
	NavSmallItem,
	NavLargeItem,
	NavItemMobile,
	type NavItemType,
};

// ============================================================
// demo.tsx
// ============================================================
import React from 'react';
import {
	CodeIcon,
	Grid2x2PlusIcon,
	GlobeIcon,
	LayersIcon,
	UserPlusIcon,
	Users,
	Star,
	FileText,
	Shield,
	RotateCcw,
	Handshake,
	Leaf,
	HelpCircle,
	DollarSign,
	BarChart,
	PlugIcon,
	MenuIcon,
	XIcon,
} from 'lucide-react';
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuTrigger,
	NavigationMenuLink,
	type NavItemType,
	NavGridCard,
	NavSmallItem,
	NavLargeItem,
	NavItemMobile,
} from '@/components/ui/navigation-menu';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export const productLinks: NavItemType[] = [
	{
		title: 'Website Builder',
		href: '#',
		description: 'Create responsive websites with ease',
		icon: GlobeIcon,
	},
	{
		title: 'Cloud Platform',
		href: '#',
		description: 'Deploy and scale apps in the cloud',
		icon: LayersIcon,
	},
	{
		title: 'Team Collaboration',
		href: '#',
		description: 'Tools to help your teams work better together',
		icon: UserPlusIcon,
	},
	{
		title: 'Analytics',
		href: '#',
		icon: BarChart,
	},
	{
		title: 'Integrations',
		href: '#',
		icon: PlugIcon,
	},
	{
		title: 'E-Commerce',
		href: '#',
		icon: DollarSign,
	},
	{
		title: 'Security',
		href: '#',
		icon: Shield,
	},
	{
		title: 'API',
		href: '#',
		icon: CodeIcon,
	},
];

export const companyLinks: NavItemType[] = [
	{
		title: 'About Us',
		href: '#',
		description: 'Learn more about our story and team',
		icon: Users,
	},
	{
		title: 'Customer Stories',
		href: '#',
		description: 'See how we’ve helped our clients succeed',
		icon: Star,
	},
	{
		title: 'Terms of Service',
		href: '#',
		description: 'Understand how we operate',
		icon: FileText,
	},
	{
		title: 'Privacy Policy',
		href: '#',
		description: 'How we protect your information',
		icon: Shield,
	},
	{
		title: 'Refund Policy',
		href: '#',
		description: 'Details about refunds and cancellations',
		icon: RotateCcw,
	},
	{
		title: 'Partnerships',
		href: '#',
		icon: Handshake,
		description: 'Collaborate with us for mutual growth',
	},
	{
		title: 'Blog',
		href: '#',
		icon: Leaf,
		description: 'Insights, tutorials, and company news',
	},
	{
		title: 'Help Center',
		href: '#',
		icon: HelpCircle,
		description: 'Find answers to your questions',
	},
];

export default function NavigationMenuDemo() {
	return (
		<div className="relative min-h-screen w-full px-4">
			<div
				aria-hidden="true"
				className={cn(
					'absolute inset-0 -z-10 size-full',
					'bg-[radial-gradient(color-mix(in_oklab,--theme(--color-foreground/.2)30%,transparent)_2px,transparent_2px)]',
					'bg-[size:12px_12px]',
				)}
			/>

			<div className="bg-background sticky top-1/4 z-50 mx-auto h-14 w-full max-w-4xl border px-4  rounded-lg">
				<div className="flex h-full items-center justify-between">
					<div className="flex items-center gap-2">
						<Grid2x2PlusIcon className="size-6" />
						<p className="font-mono text-lg font-bold">UI HUB</p>
					</div>
					<DesktopMenu />

					<div className="flex items-center gap-2">
						<Button>Get Started</Button>
						<MoileNav />
					</div>
				</div>
			</div>
		</div>
	);
}

function DesktopMenu() {
	return (
		<NavigationMenu className="hidden lg:block">
			<NavigationMenuList>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Product</NavigationMenuTrigger>
					<NavigationMenuContent>
						<div className="grid w-full md:w-4xl md:grid-cols-[1fr_.30fr]">
							<ul className="grid grow gap-4 p-4 md:grid-cols-3 md:border-r">
								{productLinks.slice(0, 3).map((link) => (
									<li key={link.href}>
										<NavGridCard link={link} />
									</li>
								))}
							</ul>
							<ul className="space-y-1 p-4">
								{productLinks.slice(3).map((link) => (
									<li key={link.href}>
										<NavSmallItem
											item={link}
											href={link.href}
											className="gap-x-1"
										/>
									</li>
								))}
							</ul>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuTrigger>Company</NavigationMenuTrigger>
					<NavigationMenuContent>
						<div className="grid w-full md:w-4xl md:grid-cols-[1fr_.40fr]">
							<ul className="grid grow grid-cols-2 gap-4 p-4 md:border-r">
								{companyLinks.slice(0, 2).map((link) => (
									<li key={link.href}>
										<NavGridCard link={link} className="min-h-36" />
									</li>
								))}
								<div className="col-span-2 grid grid-cols-3 gap-x-4">
									{companyLinks.slice(2, 5).map((link) => (
										<li key={link.href}>
											<NavLargeItem href={link.href} link={link} />
										</li>
									))}
								</div>
							</ul>
							<ul className="space-y-2 p-4">
								{companyLinks.slice(5, 10).map((link) => (
									<li key={link.href}>
										<NavLargeItem href={link.href} link={link} />
									</li>
								))}
							</ul>
						</div>
					</NavigationMenuContent>
				</NavigationMenuItem>
				<NavigationMenuItem>
					<NavigationMenuLink className="cursor-pointer">
						Pricing
					</NavigationMenuLink>
				</NavigationMenuItem>
			</NavigationMenuList>
		</NavigationMenu>
	);
}

function MoileNav() {
	const sections = [
		{
			id: 'product',
			name: 'Product',
			list: productLinks,
		},
		{
			id: 'company',
			name: 'Company',
			list: companyLinks,
		},
	];

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button size="icon" variant="ghost" className="rounded-full lg:hidden">
					<MenuIcon className="size-5" />
				</Button>
			</SheetTrigger>
			<SheetContent
				className="bg-background/95 supports-[backdrop-filter]:bg-background/80 w-full gap-0 backdrop-blur-lg"
				showClose={false}
			>
				<div className="flex h-14 items-center justify-end border-b px-4">
					<SheetClose asChild>
						<Button size="icon" variant="ghost" className="rounded-full">
							<XIcon className="size-5" />
							<span className="sr-only">Close</span>
						</Button>
					</SheetClose>
				</div>
				<div className="container grid gap-y-2 overflow-y-auto px-4 pt-5 pb-12">
					<Accordion type="single" collapsible>
						{sections.map((section) => (
							<AccordionItem key={section.id} value={section.id}>
								<AccordionTrigger className="capitalize hover:no-underline">
									{section.id}
								</AccordionTrigger>
								<AccordionContent className="space-y-1">
									<ul className="grid gap-1">
										{section.list.map((link) => (
											<li key={link.href}>
												<SheetClose asChild>
													<NavItemMobile item={link} href={link.href} />
												</SheetClose>
											</li>
										))}
									</ul>
								</AccordionContent>
							</AccordionItem>
						))}
					</Accordion>
				</div>
			</SheetContent>
		</Sheet>
	);
}`,
        vibePrompt: "Build a 'Modern Dark' shadcn-style navigation bar (navbar) for a dark-themed site. This is a Radix UI based navigation menu project. The setup requires a shadcn project structure, Tailwind CSS, and TypeScript; if not present, scaffold via the shadcn CLI, install Tailwind and TypeScript), and copy components into /components/ui which must import { cn } from '@/lib/utils' (set up the path alias accordingly). Two files. navigation-menu.tsx: imports * as React, * as NavigationMenuPrimitive from '@radix-ui/react-navigation-menu', { ArrowRightIcon, ChevronDownIcon } from lucide-react, { cn } from '@/lib/utils', and { GridCard } from '@/components/ui/grid-card'. Define type NavItemType { title, href, description?, icon?: React.ComponentType<React.SVGProps<SVGSVGElement>> }. Export shadcn-style primitives: NavigationMenu (Root, optional viewport prop), NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger (shows a ChevronDownIcon that rotates 180deg when open, list triggers have hover/focus accent styling and data-[state=open] accent/50 bg), NavigationMenuContent (with tw-animate-css enter/exit animations, slide/fade/zoom, and a viewport=false variant that is absolutely positioned below the trigger with mt-1.5, border, shadow, rounded-md, duration-300), NavigationMenuViewport (absolute full-width dropdown region using --radix-navigation-menu-viewport-* variables, bg-background/95 with backdrop-blur-xl), NavigationMenuLink, NavigationMenuIndicator (rotated diamond), and helper cards: NavGridCard (a button-like GridCard from a grid-card component with icon + title + description), NavSmallItem (icon + title with an ArrowRightIcon that slides in on group-hover), NavLargeItem (bordered background card with title, optional description, right icon), NavItemMobile (mobile row: 40px rounded icon tile + title + description). Export all plus the NavItemType type. demo.tsx: exports productLinks and companyLinks arrays (Website Builder, Cloud Platform, Team Collaboration, Analytics, Integrations, E-Commerce, Security, API; About Us, Customer Stories, Terms of Service, Privacy Policy, Refund Policy, Partnerships, Blog, Help Center — each with lucide icon and optional description) and default export NavigationMenuDemo. The shell is a full-screen page with a subtle radial dot grid background (bg-[radial-gradient(...) 2px transparent 2px] at 12px) and a sticky centered max-w-4xl h-14 rounded-lg nav bar (bg-background border) containing: left brand group (Grid2x2PlusIcon + monospace bold title) — use 'UI HUB' as the brand wordmark (remove any placeholder like Acme), a large-screen DesktopMenu (NavigationMenu with 'Product' and 'Company' triggers that open mega-menus via NavigationMenuContent, plus a plain 'Pricing' NavigationMenuLink), and a right group with a 'Get Started' Button and a mobile MoileNav Sheet (MenuIcon trigger opening a SheetContent with accordions per section using Accordion/AccordionTrigger/AccordionContent and NavItemMobile rows, with a XIcon close). Dependencies to install: lucide-react, @radix-ui/react-navigation-menu, @radix-ui/react-accordion, plus sheet/button/accordion/grid-card shadcn components. Add Tailwind 4 keyframes in index.css (@theme inline { --animate-accordion-down/up } with @keyframes accordion-down { from { height: 0 } to { height: var(--radix-accordion-content-height) } } and accordion-up reverse) so the mobile accordion animates. Reproduce the exact production source of navigation-menu.tsx and demo.tsx verbatim (embedded below), with the brand set to UI HUB.",
    },
    {
        id: "split-navigation-nav",
        title: "Split Navigation Nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A clean split navigation header with a left glass-pill of links, a centered logo mark, a blue Book Demo button, and a responsive mobile menu.",
        preview: () => (<SplitNavigationNavPreview />),
        code: `// index.html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Meridian — Nav</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
  rel="stylesheet"
/>

<link rel="stylesheet" href="styles.css" />
</head>
<body>

<div class="page">

  <nav class="nav">
    <!-- Left: glass pill of links -->
    <div class="nav__links" aria-label="Primary">
      <a href="#">Platform</a>
      <a href="#">Solutions</a>
      <a href="#">Company</a>
      <a href="#">Pricing</a>
    </div>

    <!-- Center: logo -->
    <a class="logo" href="#" aria-label="Meridian">
      <svg viewBox="0 0 42 34" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12,0 30,0 33.2,3.2 15.2,3.2" style="--i:0" />
        <polygon points="14.6,5.6 32.6,5.6 35.8,8.8 17.8,8.8" style="--i:1" />
        <polygon points="17.2,11.2 35.2,11.2 38.4,14.4 20.4,14.4" style="--i:2" />
        <polygon points="3.2,16.8 21.2,16.8 24.4,20 6.4,20" style="--i:3" />
        <polygon points="5.8,22.4 23.8,22.4 27,25.6 9,25.6" style="--i:4" />
        <polygon points="8.4,28 26.4,28 29.6,31.2 11.6,31.2" style="--i:5" />
      </svg>
    </a>

    <!-- Right: Book Demo + burger -->
    <div class="nav__right">
      <button class="btn btn--nav" type="button">
        <span class="btn__label">Book Demo</span>
        <span class="btn__icon">
          <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4 10h10.2M10.4 5.6 15.2 10l-4.8 4.4"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>

      <button
        class="nav__burger"
        type="button"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="mobile-menu"
      >
        <span class="nav__burger-bar"></span>
        <span class="nav__burger-bar"></span>
        <span class="nav__burger-bar"></span>
      </button>
    </div>
  </nav>

  <!-- Mobile menu -->
  <div id="mobile-menu" class="mobile-menu" hidden>
    <div class="mobile-menu__links">
      <a href="#">Platform</a>
      <a href="#">Solutions</a>
      <a href="#">Company</a>
      <a href="#">Pricing</a>
    </div>
    <button class="btn btn--nav" type="button">
      <span class="btn__label">Book Demo</span>
      <span class="btn__icon">
        <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 10h10.2M10.4 5.6 15.2 10l-4.8 4.4"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </button>
  </div>

</div>

<script src="main.js"></script>
</body>
</html>
// styles.css
:root {
  --bg: #ffffff;
  --text: #0a0a0a;
  --muted: #1a1a1a;
  --blue: #006cd2;
  --blue-dark: #0053a3;
  --headline-muted: #6b7378;
  --glass: rgba(0, 0, 0, 0.13);
  --glass-blur: 18px;
  --glass-light: rgba(255, 255, 255, 0.28);
  --radius: 0;
  --font: "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --pad-x: clamp(20px, 3.52vw, 64px);
  --nav-top: clamp(16px, 2.05vw, 28px);
  --btn-icon: 36px;
  --btn-pad-y: 12px;
  --btn-pad-x: 22px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  overflow: hidden;
}

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font-family: inherit;
  border: none;
  background: none;
  cursor: pointer;
}

/* ---------- Page shell ---------- */
.page {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: var(--nav-top) var(--pad-x) clamp(28px, 4.9vw, 48px);
}

.nav,
.mobile-menu {
  position: relative;
  z-index: 1;
}

/* ---------- Nav grid ---------- */
.nav {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

/* Left: glass links pill */
.nav__links {
  display: flex;
  align-items: center;
  gap: clamp(22px, 2.6vw, 32px);
  justify-self: start;
  padding: 24px 34px;
  background: var(--glass);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border-radius: var(--radius);
}

.nav__links a {
  position: relative;
  font-size: clamp(13px, 1.37vw, 15px);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: #0a0a0a;
  line-height: 1;
  white-space: nowrap;
  padding-bottom: 2px;
  transition: color 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  transform: translate3d(-16px, 0, 0);
  animation: link-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.nav__links a:nth-child(1) { animation-delay: 0.02s; }
.nav__links a:nth-child(2) { animation-delay: 0.08s; }
.nav__links a:nth-child(3) { animation-delay: 0.14s; }
.nav__links a:nth-child(4) { animation-delay: 0.2s; }

.nav__links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -6px;
  width: 100%;
  height: 3px;
  background: #006cd2;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav__links a:hover {
  color: #006cd2;
  transform: translateY(-2px);
}

.nav__links a:hover::after {
  transform: scaleX(1);
}

@keyframes link-in {
  from {
    opacity: 0;
    transform: translate3d(-16px, 0, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Center: logo */
.logo {
  display: inline-flex;
  justify-self: center;
  color: #0a0a0a;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.logo:hover {
  transform: scale(1.1);
}

.logo svg {
  width: clamp(30px, 3.2vw, 38px);
  height: auto;
  fill: currentColor;
}

.logo svg polygon {
  transform-box: fill-box;
  transform-origin: left center;
  opacity: 0;
  transform: translate3d(-12px, 8px, 0);
  animation: mark-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.logo svg polygon:nth-child(1) { animation-delay: 0.04s; }
.logo svg polygon:nth-child(2) { animation-delay: 0.09s; }
.logo svg polygon:nth-child(3) { animation-delay: 0.14s; }
.logo svg polygon:nth-child(4) { animation-delay: 0.19s; }
.logo svg polygon:nth-child(5) { animation-delay: 0.24s; }
.logo svg polygon:nth-child(6) { animation-delay: 0.29s; }

@keyframes mark-in {
  from {
    opacity: 0;
    transform: translate3d(-12px, 8px, 0);
  }
  to {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

/* Right: Book Demo + burger */
.nav__right {
  display: flex;
  align-items: center;
  gap: 14px;
  justify-self: end;
}

/* ---------- Buttons (shared) ---------- */
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 58px;
  border-radius: var(--radius);
  padding: var(--btn-pad-y) 10px var(--btn-pad-y) var(--btn-pad-x);
  gap: 18px;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: -0.015em;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
}

.btn::before {
  content: "";
  position: absolute;
  inset: 0;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
}

.btn:hover::before {
  transform: scaleX(1);
}

.btn__label,
.btn__icon {
  position: relative;
  z-index: 1;
}

.btn__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--btn-icon);
  height: var(--btn-icon);
  border-radius: var(--radius);
}

.btn__icon svg {
  width: 14px;
  height: 14px;
}

/* Nav Book Demo variant */
.btn--nav {
  background: #006cd2;
  color: #ffffff;
  opacity: 0;
  clip-path: inset(0 100% 0 0);
  animation: wipe-right 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.16s backwards;
}

.btn--nav .btn__icon {
  background: #0053a3;
  color: #ffffff;
}

.btn--nav:hover .btn__icon {
  background: #ffffff;
  color: #006cd2;
}

.btn--nav::before {
  background: #004a96;
}

@keyframes wipe-right {
  from {
    opacity: 0;
    clip-path: inset(0 100% 0 0);
  }
  to {
    opacity: 1;
    clip-path: inset(0 0 0 0);
  }
}

/* ---------- Burger ---------- */
.nav__burger {
  display: none;
  width: 36px;
  height: 36px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0;
  animation: link-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.16s backwards;
}

.nav__burger-bar {
  width: 18px;
  height: 1.5px;
  background: #0a0a0a;
  transition: width 0.22s cubic-bezier(0.16, 1, 0.3, 1),
    background 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav__burger:hover {
  transform: scale(1.08);
}

.nav__burger:hover .nav__burger-bar {
  background: #006cd2;
}

.nav__burger:hover .nav__burger-bar:nth-child(1),
.nav__burger:hover .nav__burger-bar:nth-child(3) {
  width: 14px;
}

/* ---------- Mobile menu ---------- */
.mobile-menu {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 0 0.5rem;
}

.mobile-menu[hidden] {
  display: none;
}

.mobile-menu__links {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  padding: 16px 20px;
  background: var(--glass);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.mobile-menu__links a {
  font-size: 1.05rem;
  font-weight: 500;
  color: #0a0a0a;
}

/* ---------- prefers-reduced-motion ---------- */
@media (prefers-reduced-motion: reduce) {
  .nav__links a,
  .logo svg polygon,
  .btn--nav,
  .nav__burger {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    clip-path: inset(0 0 0 0) !important;
  }
}

/* ---------- Responsive ≤820px ---------- */
@media (max-width: 820px) {
  html,
  body {
    overflow: auto;
  }

  .page {
    height: auto;
    min-height: 100vh;
    min-height: 100dvh;
  }

  .nav__links,
  .nav .btn--nav {
    display: none;
  }

  .nav {
    grid-template-columns: auto 1fr auto;
  }

  .logo {
    justify-self: start;
  }

  .nav__burger {
    display: flex;
  }

  .mobile-menu {
    display: flex;
  }
}

@media (min-width: 821px) {
  .nav__burger {
    display: none;
  }
}
// main.js
(function () {
  var burger = document.querySelector(".nav__burger");
  var menu = document.getElementById("mobile-menu");

  if (!burger || !menu) return;

  function openMenu() {
    menu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
  }

  function closeMenu() {
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
  }

  function toggleMenu() {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  }

  burger.addEventListener("click", toggleMenu);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
    }
  });

  menu.querySelectorAll("a, button").forEach(function (el) {
    el.addEventListener("click", closeMenu);
  });
})();`,
        vibePrompt: "Build a split navigation header (navbar) called \"Meridian\" for a clean, light-themed site. This is a plain HTML / vanilla CSS / vanilla JavaScript component (no framework, no build step). Three files:\nindex.html: includes the Google Fonts Inter stylesheet (weights 300,400,500,600,700) with a preconnect to fonts.googleapis.com and fonts.gstatic.com, links styles.css and main.js. Markup inside a .page wrapper: a <nav class=\"nav\"> laid out as a 3-column grid (1fr auto 1fr) — left is a .nav__links div (aria-label=\"Primary\") with four <a> links (Platform, Solutions, Company, Pricing); center is an <a class=\"logo\" aria-label=\"Meridian\"> containing an inline SVG (viewBox 0 0 42 34) built from six <polygon> elements forming a diagonal chevron/mark (each with style=\"--i:0\" through --i:5\"); right is a .nav__right with a <button class=\"btn btn--nav\"> (a Book Demo button: a .btn__label span + a .btn__icon span with an inline arrow SVG using a stroke on a path d=\"M4 10h10.2M10.4 5.6 15.2 10l-4.8 4.4\") plus a <button class=\"nav__burger\" aria-label=\"Open menu\" aria-expanded=\"false\" aria-controls=\"mobile-menu\"> with three .nav__burger-bar spans. After the nav, include a <div id=\"mobile-menu\" class=\"mobile-menu\" hidden> with a .mobile-menu__links column of the same four links and a Book Demo button. Then <script src=\"main.js\"></script> before </body>.\nstyles.css: define :root variables (--bg:#ffffff, --text:#0a0a0a, --blue:#006cd2, --blue-dark:#0053a3, --glass:rgba(0,0,0,0.13), --glass-blur:18px, --radius:0, --font:\"Inter\",... and spacing --pad-x, --nav-top, --btn-icon:36px, --btn-pad-y:12px, --btn-pad-x:22px). Reset (* box-sizing, margin 0, padding 0), html/body height 100% overflow hidden, body uses the font and background. .page is position relative, 100vh/100dvh, flex column, padding var(--nav-top) var(--pad-x). .nav is a grid 1fr auto 1fr aligned center. .nav__links is a glass pill: flex, gap clamp(22px,2.6vw,32px), justify-self start, padding 24px 34px, background var(--glass), backdrop-filter blur(var(--glass-blur)). Each link starts hidden (opacity 0, translate3d(-16px,0,0)) and animates in with a staggered @keyframes link-in (animation-delay 0.02s/0.08s/0.14s/0.2s); each link has a ::after 3px underline in #006cd2 that scaleX(0)->1 on hover, and hover turns the link #006cd2 and translateY(-2px). .logo is inline-flex justify-self center with the SVG sized clamp(30px,3.2vw,38px); each polygon starts hidden/offset and animates in via @keyframes mark-in with staggered delays (0.04/0.09/0.14/0.19/0.24/0.29s), and .logo:hover scale(1.1). .nav__right is flex gap 14px justify-self end. Buttons: .btn is inline-flex height 58px padding var(--btn-pad-y) 10px var(--btn-pad-y) var(--btn-pad-x) gap 18px, with a ::before overlay that scaleX(0)->1 on hover; .btn--nav is the blue variant (background #006cd2, white text) that starts hidden with clip-path inset(0 100% 0 0) and animates via @keyframes wipe-right (0.16s delay), .btn__icon bg #0053a3 switching to white bg + blue icon on hover, ::before background #004a96. .nav__burger hidden by default (display none) with three 18px bars that shrink to 14px on hover (bars 1 and 3) and turn blue; shown flex only at <=820px via media query. .mobile-menu is a flex column gap 1.25rem that is hidden when [hidden], with .mobile-menu__links a glass column of links (padding 16px 20px, font-size 1.05rem). Include a @media (prefers-reduced-motion: reduce) rule turning off all entrance animations. Responsive: @media (max-width:820px) collapses the grid to auto 1fr auto, hides .nav__links and the nav .btn--nav, shows the .nav__burger, and reveals the mobile menu; @media (min-width:821px) hides the burger.\nmain.js: an IIFE that queries .nav__burger and #mobile-menu, defines openMenu/closeMenu/toggleMenu (toggling menu.hidden and syncing aria-expanded/aria-label on the burger), listens for burger click, closes on Escape, and closes when any link/button inside the menu is clicked.",
    },
    {
        id: "awwwards-nav",
        title: "Awwwards Nav",
        category: "navbar",
        isPremium: false,
        addedAt: "2026-08-31",
        newBadgeDays: 120,
        description: "A glassmorphic bottom navigation pill that expands into a four-column mega-menu with a 'More' button.",
        preview: () => (<AwwwardsNavPreview />),
        code: `// awwwards-nav.tsx
"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { List, X } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

/**
 * Awwwards Nav
 *
 * A glassmorphic bottom navigation pill with inline links and a "More" button.
 * Tapping "More" expands the bar upward with a smooth \`power4.inOut\` motion:
 * the inline links fade out, the button grows to full width, its icon flips to
 * an X, and a multi-column mega-menu reveals inside the expanded panel.
 *
 * Ported from the vanilla "CodeGrid Awwwards Nav" (GSAP) into a single,
 * self-contained, prop-driven React component. Positioning is left to the
 * consumer via \`className\`, so it works fixed to the viewport or absolutely
 * inside a positioned container.
 */

export interface AwwwardsNavLink {
  label: string;
  href: string;
}

export interface AwwwardsNavColumn {
  /** Column heading shown above its links. */
  title: string;
  /** Links listed under the heading. */
  links: AwwwardsNavLink[];
}

export interface AwwwardsNavProps {
  /** Inline links shown in the collapsed bar. Defaults to a sample set. */
  items?: AwwwardsNavLink[];
  /** Columns revealed in the expanded mega-menu. Defaults to a sample set. */
  columns?: AwwwardsNavColumn[];
  /** Label on the expand/collapse button. Defaults to "More". */
  moreLabel?: string;
  /** Called whenever the panel opens (true) or closes (false). */
  onOpenChange?: (open: boolean) => void;
  /**
   * Extra class names for the root nav. Use this to position it —
   * e.g. \`fixed bottom-6 left-1/2 -translate-x-1/2\` (default) or
   * \`absolute\` inside a positioned parent.
   */
  className?: string;
}

const DEFAULT_ITEMS: AwwwardsNavLink[] = [
  { label: "Home", href: "#" },
  { label: "Nominees", href: "#" },
  { label: "Directory", href: "#" },
  { label: "Collections", href: "#" },
];

const DEFAULT_COLUMNS: AwwwardsNavColumn[] = [
  {
    title: "Awards",
    links: [
      { label: "Winners", href: "#" },
      { label: "Site of the Day", href: "#" },
      { label: "Nominees", href: "#" },
    ],
  },
  {
    title: "Inspiration",
    links: [
      { label: "Collections", href: "#" },
      { label: "Elements", href: "#" },
      { label: "Resources", href: "#" },
    ],
  },
  {
    title: "Directory",
    links: [
      { label: "Professionals", href: "#" },
      { label: "Agencies", href: "#" },
      { label: "Freelancers", href: "#" },
    ],
  },
  {
    title: "Market",
    links: [
      { label: "Jobs", href: "#" },
      { label: "New Events", href: "#" },
      { label: "Products", href: "#" },
    ],
  },
];

const COLLAPSED_HEIGHT = 60;
const EXPANDED_HEIGHT = 370;

export function AwwwardsNav({
  items = DEFAULT_ITEMS,
  columns = DEFAULT_COLUMNS,
  moreLabel = "More",
  onOpenChange,
  className,
}: AwwwardsNavProps) {
  const navRef = useRef<HTMLElement>(null);
  const navTopRef = useRef<HTMLDivElement>(null);
  const navItemsRef = useRef<HTMLDivElement>(null);
  const navHomeRef = useRef<HTMLDivElement>(null);

  const openRef = useRef(false);
  const animatingRef = useRef(false);
  const [showClose, setShowClose] = useState(false);

  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  // Establish the collapsed baseline imperatively (matches the source's gsap.set).
  useEffect(() => {
    const nav = navRef.current;
    const navTop = navTopRef.current;
    const navItems = navItemsRef.current;
    const navHome = navHomeRef.current;
    if (!nav || !navTop || !navItems || !navHome) return;

    gsap.set(nav, { height: COLLAPSED_HEIGHT });
    gsap.set(navTop, { opacity: 0, scale: 0.9, display: "none" });
    gsap.set(navItems, { opacity: 1, display: "flex" });
    gsap.set(navHome, { flexGrow: 0 });

    return () => {
      gsap.killTweensOf([nav, navTop, navItems, navHome]);
    };
  }, []);

  const toggle = () => {
    const nav = navRef.current;
    const navTop = navTopRef.current;
    const navItems = navItemsRef.current;
    const navHome = navHomeRef.current;
    if (!nav || !navTop || !navItems || !navHome || animatingRef.current) return;

    animatingRef.current = true;
    const opening = !openRef.current;
    openRef.current = opening;
    onOpenChangeRef.current?.(opening);

    if (opening) {
      gsap.to(nav, { height: EXPANDED_HEIGHT, duration: 0.75, ease: "power4.inOut" });
      gsap.to(navItems, {
        opacity: 0,
        duration: 0.1,
        onComplete: () => gsap.set(navItems, { display: "none" }),
      });
      gsap.to(navHome, {
        flexGrow: 1,
        duration: 0.2,
        ease: "power4.inOut",
        onComplete: () => setShowClose(true),
      });
      gsap.to(navTop, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        delay: 0.5,
        onStart: () => gsap.set(navTop, { display: "block" }),
        onComplete: () => {
          animatingRef.current = false;
        },
      });
    } else {
      gsap.to(nav, { height: COLLAPSED_HEIGHT, duration: 0.75, ease: "power4.inOut", delay: 0.2 });
      gsap.to(navTop, {
        opacity: 0,
        scale: 0.9,
        duration: 0.2,
        onComplete: () => gsap.set(navTop, { display: "none" }),
      });
      gsap.to(navHome, {
        flexGrow: 0,
        duration: 0.2,
        ease: "power4.inOut",
        onComplete: () => setShowClose(false),
      });
      gsap.to(navItems, {
        opacity: 1,
        duration: 0.2,
        delay: 0.5,
        onStart: () => gsap.set(navItems, { display: "flex" }),
        onComplete: () => {
          animatingRef.current = false;
        },
      });
    }
  };

  return (
    <nav
      ref={navRef}
      className={cn(
        "fixed bottom-6 left-1/2 z-50 -translate-x-1/2",
        "h-[60px] w-[min(680px,92vw)] overflow-hidden rounded-xl border backdrop-blur-xl",
        "border-black/10 bg-white/70 dark:border-white/25 dark:bg-black/75",
        className,
      )}
    >
      {/* Expanded mega-menu, fills the space above the bottom row */}
      <div ref={navTopRef} className="absolute inset-x-0 top-0 bottom-[60px] hidden p-2.5">
        <div className="flex h-full w-full gap-0 rounded-[10px] border border-black/[0.06] bg-black/[0.03] p-5 dark:border-white/[0.06] dark:bg-white/[0.04]">
          {columns.map((col, ci) => (
            <div
              key={col.title}
              className={cn(
                "flex flex-1 flex-col gap-1",
                ci > 0 && "border-l border-dashed border-black/15 pl-4 dark:border-white/20",
              )}
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1 w-1 shrink-0 rounded-full bg-black dark:bg-white" />
                <p className="text-sm text-black/70 dark:text-white/75">{col.title}</p>
              </div>
              {col.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block py-2 text-sm text-black transition-colors hover:text-black/50 dark:text-white dark:hover:text-white/60"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Collapsed bottom row: More button + inline items */}
      <div className="absolute inset-x-0 bottom-0 flex h-[60px] gap-1.5 p-2.5">
        <div
          ref={navHomeRef}
          role="button"
          tabIndex={0}
          aria-expanded={showClose}
          aria-label={showClose ? "Close menu" : "Open menu"}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggle();
            }
          }}
          className={cn(
            "flex shrink-0 cursor-pointer select-none items-center justify-center gap-2.5 rounded-[10px] border px-5 text-sm transition-colors",
            "border-black/10 bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08] hover:text-black",
            "dark:border-white/10 dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.12] dark:hover:text-white",
            showClose && "bg-black/[0.08] text-black dark:bg-white/[0.12] dark:text-white",
          )}
        >
          {showClose ? (
            <X weight="light" className="h-4 w-4 text-black dark:text-white" />
          ) : (
            <List weight="light" className="h-4 w-4 text-black dark:text-white" />
          )}
          <span>{moreLabel}</span>
        </div>

        <div ref={navItemsRef} className="flex min-w-0 flex-[4] items-center gap-1.5">
          {items.map((item) => (
            <div
              key={item.label}
              className="flex h-full flex-1 items-center justify-center rounded-[10px] border border-black/15 transition-colors hover:border-black/40 dark:border-white/20 dark:hover:border-white/50"
            >
              <a
                href={item.href}
                className="px-2 text-center text-sm text-neutral-600 transition-colors hover:text-black dark:text-neutral-400 dark:hover:text-white"
              >
                {item.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default AwwwardsNav;
// demo.tsx
import { AwwwardsNav } from "@/components/ui/awwwards-nav"

export function AwwwardsNavDemo() {
  return (
    <AwwwardsNav
      items={[
        { label: "Home", href: "#" },
        { label: "Nominees", href: "#" },
        { label: "Directory", href: "#" },
        { label: "Collections", href: "#" },
      ]}
    />
  )
}`,
        vibePrompt: "Build an \"Awwwards Nav\" — a glassmorphic bottom navigation pill (navbar) that sits fixed to the bottom center of the viewport and expands upward into a mega-menu when its 'More' button is tapped. Two files: awwwards-nav.tsx and demo.tsx.\nawwwards-nav.tsx: a single self-contained, prop-driven React + TypeScript + GSAP component. Top: \"use client\";. Imports: * as React, { useEffect, useRef, useState } from react, gsap from 'gsap', { List, X } from '@phosphor-icons/react', and { cn } from '@/lib/utils' (set up the path alias accordingly). Export interfaces: AwwwardsNavLink { label, href }, AwwwardsNavColumn { title, links: AwwwardsNavLink[] }, AwwwardsNavProps { items?: AwwwardsNavLink[] (inline links, default sample set Home/Nominees/Directory/Collections), columns?: AwwwardsNavColumn[] (default 4 columns: Awards, Inspiration, Directory, Market each with sample links), moreLabel?: string (default 'More'), onOpenChange?: (open: boolean) => void, className?: string }. Default constants DEFAULT_ITEMS and DEFAULT_COLUMNS. Constants COLLAPSED_HEIGHT=60 and EXPANDED_HEIGHT=370. Export function AwwwardsNav({ items, columns, moreLabel, onOpenChange, className }): uses refs navRef (HTMLElement), navTopRef, navItemsRef, navHomeRef; refs openRef/animationRef; state showClose (boolean). On mount (useEffect), a gsap.set baseline: nav height COLLAPSED_HEIGHT, navTop opacity 0 scale 0.9 display none, navItems opacity 1 display flex, navHome flexGrow 0; cleanup kills tweens. toggle() opens/closes: opening -> gsap.to nav height EXPANDED_HEIGHT (0.75s, ease power4.inOut), navItems opacity 0 then display none, navHome flexGrow 1 (0.2s) then setShowClose(true), navTop opacity 1 scale 1 (0.3s, delay 0.5) then display block; closing reverses (nav to COLLAPSED_HEIGHT with 0.2s delay, navTop fade out, navHome flexGrow 0 then setShowClose(false), navItems fade in). Markup: a <nav ref={navRef}> with className built from cn('fixed bottom-6 left-1/2 z-50 -translate-x-1/2','h-[60px] w-[min(680px,92vw)] overflow-hidden rounded-xl border backdrop-blur-xl','border-black/10 bg-white/70 dark:border-white/25 dark:bg-black/75', className). Inside: an expanded mega-menu div (ref navTopRef, absolute inset-x-0 top-0 bottom-[60px] hidden p-2.5) containing a flex row of 4 columns, each a flex-col with a small dot + column title and its links (each an <a>, column separators via border-l for ci>0); and a collapsed bottom row (absolute inset-x-0 bottom-0 flex h-[60px] gap-1.5 p-2.5) with the More button (ref navHomeRef, a role=button div with aria-expanded=showClose, aria-label, onClick toggle, onKeyDown Enter/Space, cn styling, icon flips between <X> and <List> from @phosphor-icons/react weight='light' based on showClose, plus {moreLabel} span) and the inline navItems container (ref navItemsRef, flex flex-[4] gap-1.5) mapping items to bordered rounded cells each containing an <a> link.\ndemo.tsx: import { AwwwardsNav } from '@/components/ui/awwwards-nav' and export function AwwwardsNavDemo() that returns <AwwwardsNav items={[{label:'Home'},{label:'Nominees'},{label:'Directory'},{label:'Collections'}]} /> (each with href '#'). No other deps needed beyond gsap, @phosphor-icons/react, and shadcn's cn utility.",
    },

    {
        id: "haul-footer",
        title: "HAUL!",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        description: "A bold orange 'HAUL! footer' with a top-aligned glass card, company/mobile/contracts links, a parallax truck foreground, and hoverable circular social icons.",
        preview: () => (<HaulFooterPreview />),
        code: `import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

const linkGroups = {
  Company: ["Founding", "Platform", "Testify"],
  Mobile: ["Get Apple App", "Get Google App"],
  Contracts: ["Private Data", "User Consent"],
};

const socials = [
  { Icon: Facebook, label: "Facebook" },
  { Icon: Twitter, label: "Twitter" },
  { Icon: Instagram, label: "Instagram" },
  { Icon: Linkedin, label: "LinkedIn" },
];

export default function HaulFooter() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [-50, 150]);

  return (
    <div className="bg-[#f8f9fa] font-sans">
      {/* Top spacer - 50vh on mobile/lg, 30vh on md */}
      <div className="flex h-[50vh] items-center justify-center bg-[#FDFDFD] md:h-[30vh] lg:h-[50vh]">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[13px] font-bold uppercase tracking-[0.5em] text-gray-300"
        >
          View Below
        </motion.p>
      </div>

      {/* Main full-viewport parallax container */}
      <section
        ref={containerRef}
        className="relative h-screen overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url(https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260430_115327_3f256636-9e63-4885-8d0b-09317dc2b0a5.png&w=1280&q=85)",
        }}
      >
        {/* Top-aligned footer card */}
        <div className="absolute top-0 w-full pt-12 md:pt-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="overflow-hidden rounded-2xl bg-white/95 shadow-xl backdrop-blur-sm md:rounded-3xl"
            >
              {/* Footer content - top half */}
              <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-start md:justify-between">
                {/* Logo area */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 p-2 shadow-inner md:h-12 md:w-12">
                    <svg viewBox="0 0 256 256" fill="white" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                      <path d="M 228 0 C 172.772 0 128 44.772 128 100 L 128 0 L 0 0 L 0 28 C 0 83.228 44.772 128 100 128 L 0 128 L 0 256 L 28 256 C 83.228 256 128 211.228 128 156 L 128 256 L 256 256 L 256 228 C 256 172.772 211.228 128 156 128 L 256 128 L 256 0 Z" />
                    </svg>
                  </div>
                  <span className="text-2xl font-bold tracking-tighter text-gray-900 md:text-3xl">HAUL!</span>
                </div>

                {/* Links area */}
                <div className="flex flex-1 flex-col gap-8 md:flex-row md:justify-end md:gap-16">
                  {Object.entries(linkGroups).map(([group, items]) => (
                    <div key={group}>
                      <h3 className="text-sm font-bold uppercase tracking-widest text-gray-900">{group}</h3>
                      <ul className="mt-4 space-y-3">
                        {items.map((item) => (
                          <li key={item}>
                            <a href="#" className="text-sm font-medium text-gray-500 transition-colors hover:text-orange-600">
                              {item}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer content - bottom bar */}
              <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 sm:px-8">
                <p className="text-sm font-medium text-gray-500">© 2026 HAUL! All Rights Reserved</p>
                <div className="flex gap-2">
                  {socials.map(({ Icon, label }) => (
                    <a
                      key={label}
                      href="#"
                      aria-label={label}
                      className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-100 text-gray-500 transition-all duration-300 hover:border-orange-500 hover:bg-orange-500 hover:text-white"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Truck foreground parallax layer */}
        <motion.div style={{ y }} className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-full">
          <img
            src="https://roof-wish-40038865.figma.site/_components/v2/f31fd17907ce60745d45e83a61d44fd3810d5f25/truck_1.8c4bff83.png"
            alt="HAUL! truck"
            className="h-full w-full origin-bottom object-contain object-bottom scale-[1.5] sm:scale-110 md:scale-[2.0] lg:scale-105"
          />
        </motion.div>
      </section>
    </div>
  );
}`,
        vibePrompt: "Build a React functional component using Tailwind CSS, `motion/react` for animations, and `lucide-react` for icons.\n\n1. Typography & Setup: Import the \"Inter\" font from Google Fonts (weights 400, 500, 600, 700) and set it as the default sans-serif font in the Tailwind config/CSS. The overall background of the page should be #f8f9fa.\n\n2. Top Spacer Section: Create a section at the top of the page. Height should be 50vh (on mobile/lg) and 30vh (on md screens). Background color: #FDFDFD. Center a text element that says \"View Below\". The text should be text-gray-300, small font, bold, uppercase, with wide tracking-[0.5em]. Animate this text with Framer Motion to fade in from opacity: 0 to opacity: 1.\n\n3. Main Parallax Container: Below the spacer, create a main full-viewport-height (h-screen) section. Set its background image to the provided cloudfront/higgs.ai URL. Make sure the background covers the container (bg-cover bg-center) and set overflow-hidden with relative positioning. Set up a Framer Motion useScroll target on this container. Map the scrollYProgress from [0, 1] to [-50, 150] using useTransform. Apply this transformed y-value to the foreground truck image layer (described below).\n\n4. The Top-Aligned Footer Card: Position a container absolute top-0 w-full inside the main parallax section. Give it top padding (pt-12 mobile/lg, pt-24 tablet). Inside, create a card constrained to max-w-7xl mx-auto. Card Styling: bg-white/95, backdrop-blur-sm, shadow-xl, rounded corners (rounded-2xl mobile, rounded-3xl desktop), overflow-hidden. Animation: The card should slide down and fade in (initial={{ opacity: 0, y: -20 }}, animate={{ opacity: 1, y: 0 }}, duration 0.8s easeOut). Footer Content (Top Half): Use a flex row layout (flex-col on mobile, flex-row on md+) with spread space. Logo Area: Include an orange square (bg-orange-500, 40x40px mobile, 48x48px desktop, rounded-lg, shadow-inner, p-2). Inside the square, place an SVG with viewBox \"0 0 256 256\" and the exact white path provided (M 228 0 C 172.772 0 ... Z). Next to the logo block, add the text \"HAUL!\" (text-gray-900, 2xl/3xl, font-bold, tracking-tighter). Links Area: Display 3 columns of links using flex. Layout: Company (Founding, Platform, Testify), Mobile (Get Apple App, Get Google App), Contracts (Private Data, User Consent). Section headers should be uppercase, tracking-widest, text-sm, bold. Link items should be gray-500, font-medium, and hover to orange-600 with transition. Footer Content (Bottom Bar): Add a top border (border-gray-100) and use a solid white background (bg-white). Layout: flex, space between, aligning text to the left and social icons to the right. Text: \"© 2026 HAUL! All Rights Reserved\" (text-sm, gray-500, medium). Social Icons: Map through an array of icons imported from lucide-react: Facebook, Twitter, Instagram, Linkedin (w-5 h-5). Wrap them in a tags shaped as 40x40px circles with border-gray-100. On hover, they should turn bg-orange-500 with white text and an orange-500 border (transition all duration-300).\n\n5. Background Truck Parallax Layer: Add a motion.div placed absolutely at the bottom of the container (absolute inset-x-0 bottom-0 h-full). Add standard pointer-events-none and z-20. Ensure the y axis style is tied to the useTransform created in step 3 so it scrolls at a different speed than the background. Inside, place an image with the provided truck PNG URL. Image styling: w-full h-full object-contain object-bottom origin-bottom. Add scale responsive classes (scale-[1.5] mobile, scale-110 sm, scale-[2.0] md, scale-105 lg) to ensure the truck fits properly on various screen widths.",
    },

    {
        id: "vize-footer",
        title: "VIZE",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        description: "A premium 'VIZE' footer with a layered glass-card layout, brand info, Product/Science/Company link columns, a legal bar, and a massive handcrafted-SVG glass-filter 'vize' text element.",
        preview: () => (<VizeFooterPreview />),
        code: `import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen md:h-screen bg-[#F0F1F3] flex flex-col items-center justify-start md:justify-center overflow-y-auto md:overflow-hidden pt-8 md:pt-0 p-4">
      <Footer />
    </div>
  );
}`,
        vibePrompt: `Build a highly polished, responsive VIZE footer using React, Vite, Tailwind CSS, lucide-react for icons, and motion/react for animations, with a premium layered-card aesthetic and a massive background-blended glass text element using a handcrafted SVG filter.

STRUCTURE (src/components/Footer.tsx) with these inner components:

1. LogoIcon: a square box w-8 h-8 bg-[#31A8FF] rounded-[8px] flex items-center justify-center containing this SVG: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20C4 20 4 14 10 10C16 6 20 4 20 4C20 4 18 8 14 14C10 20 4 20 4 20Z" fill="white"/><path d="M4 20L10 14" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>.

2. FooterCard: a massive layered card holding the footer directories:
   - Main wrapper: w-full max-w-6xl mx-auto.
   - Outer gray body: bg-[#E9EBEE] rounded-[48px] border border-slate-200 shadow-sm overflow-hidden.
   - Inner white box: bg-white rounded-[40px] m-2 shadow-sm.
   - Content grid inside white box: p-8 md:p-10 lg:p-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12.
   - Brand Info column (lg:col-span-2 space-y-8): a row (flex items-center gap-2.5) with <LogoIcon /> and <span className="text-[26px] font-bold tracking-tight text-[#0F172A]">vize</span>; a description <p className="text-[#64748B] leading-relaxed text-[16px] font-normal max-w-[320px]">Premium strategic solutions designed to elevate your brand presence through advanced marketing.</p>; and a socials group mapping Linkedin, Twitter, Instagram from lucide-react into buttons w-[44px] h-[44px] flex items-center justify-center rounded-xl border border-slate-100 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-all active:scale-95 group, each containing its icon with className="w-5 h-5 text-slate-800".
   - Product column (space-y-6): header <h4 className="text-[14px] font-medium text-[#94A3B8]">Product</h4> and a <ul className="space-y-4"> of links (Features, Solutions, Pricing, Updates) styled text-[15px] font-medium text-[#1E293B] hover:text-[#31A8FF] transition-colors.
   - Science column (space-y-6): header Science; links Approach, Identity, Research, Metrics; same link styling.
   - Company column (space-y-6): header Company; links About Us, Partners, Careers; same link styling.
   - Bottom legal bar (inside the gray outer wrap, OUTSIDE the white box): container px-6 sm:px-12 md:px-16 lg:px-20 py-5 flex flex-col md:flex-row justify-between items-center gap-6 text-[15px]; left <p className="text-[#64748B] font-medium">© 2025 Vize. All rights reserved.</p>; right a flex row gap-8 text-[#64748B] font-medium items-center featuring a Legal Center link (hover:text-[#1E293B] transition-colors), a vertical separator <div className="w-[1px] h-4 bg-slate-300" />, and a User Agreement link.

3. GlassText: a relative w-full flex items-center justify-center select-none pt-0 container holding an absolute hidden zero-size SVG (className="absolute w-0 h-0" aria-hidden focusable false) that defines a <filter id="glass-effect" x="-50%" y="-50%" width="200%" height="200%"> with feDropShadow (dx 0 dy 4 stdDeviation 6 floodColor #000000 0.25), feComponentTransfer/feFuncA slope 1 producing alpha, feOffset dy 4, feGaussianBlur stdDeviation 4, feComposite operator out, feFlood #ffffff 0.25, and matching black flood, all merged via feMerge in the order outer-shadow, SourceGraphic, inner-white-final, inner-black-final. Then a motion.div (initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }} className="relative") wrapping an <h1 className="text-[min(25vw,400px)] font-bold tracking-normal leading-none select-none text-white px-4" style={{ filter: 'url(#glass-effect)' }}>vize</h1>.

FINAL EXPORT:
export default function Footer() {
  return (
    <footer className="w-full flex flex-col items-center gap-0">
      <FooterCard />
      <GlassText />
    </footer>
  );
}

ALSO GLOBAL CSS (src/index.css): import the Inter font and 'tailwindcss'; in @theme set --font-sans to Inter; define utilities glass-card, text-glass, and liquid-glass (glass-card: rgba(255,255,255,0.4) background, blur 20px, 1px rgba(255,255,255,0.5) border, shadow 0 8px 32px rgba(31,38,135,0.05); text-glass: linear-gradient text with backdrop blur and background-clip text transparent color; liquid-glass: rgba(255,255,255,0.01) with luminosity blend, blur 4px, inset highlight shadow, relative overflow hidden, plus ::before gradient ring border using mask-composite). body: bg #F9F9FB text #141414 font-sans antialiased.`
    },

    {
        id: "alpine-footer",
        title: "AlpineFooter",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        description: "A scenic 'AlpineFooter' with a full-viewport alpine landscape background, a vintage postage stamp with an overlapping 'PAR AVION / LUFTPOST / PRIORITAIRE' cachet sticker, system metadata badges, policy pills with animated modal sheets, and a pretzel-attribution line.",
        preview: () => (<AlpineFooterPreview />),
        code: `import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

const ALPINE_BG = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788246818/ChatGPT_Image_Sep_1_2026_12_43_09_PM_exqydf.png";

const metadataTags = ["Font: SF Pro", "Framework: Next.js", "Last Updated: Jul 23, 2026"];
const policyPills = ["Privacy Policy", "Manifesto", "Changelog"];

const modalContent: Record<string, { title: string; body: string }> = {
  "Privacy Policy": {
    title: "Privacy Policy",
    body: "We respect your privacy. Information collected is used solely to improve the alpine-footer experience and is never sold to third parties.",
  },
  Manifesto: {
    title: "Manifesto",
    body: "Crafted for the love of craft. AlpineFooter celebrates the calm of mountain mornings and the precision of long-form design.",
  },
  Changelog: {
    title: "Changelog",
    body: "v2.0 - Scenic alpine backdrop, vintage postage stamp cachet, system badges and policy pills. v1.0 - Initial release.",
  },
};

export default function AlpineFooter() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <footer
      id="alpine-footer"
      className="relative w-full min-h-screen flex flex-col justify-start overflow-hidden font-sans select-text bg-[#0f172a]"
    >
      {/* Scenic background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: \`url(\${ALPINE_BG})\`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Top card container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-7 pb-4 z-20 w-full">
        <div
          id="alpine-footer-main-card"
          className="relative bg-[#C4C4C4] rounded-[24px] sm:rounded-[32px] border border-white/60 shadow-[0_10px_35px_rgba(0,0,0,0.09)] p-6 sm:p-8 md:p-10"
        >
          {/* Top: vintage postage stamp + cachet */}
          <div className="relative mb-6 sm:mb-8">
            <div className="inline-block relative bg-[#e2e5e8] p-2.5 rounded-[2px] shadow-sm">
              {/* Perforation teeth */}
              <div className="absolute -top-1 left-0 right-0 flex justify-between px-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#f1f3f5]" />
                ))}
              </div>
              <div className="absolute -bottom-1 left-0 right-0 flex justify-between px-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-[#f1f3f5]" />
                ))}
              </div>
              {/* Stamp artwork */}
              <div
                className="w-[110px] sm:w-[124px] h-[78px] sm:h-[88px] border border-black/15 object-cover saturate-[1.1] contrast-[1.05]"
                style={{ backgroundImage: \`url(\${ALPINE_BG})\`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            </div>

            {/* Cachet / cancellation sticker */}
            <div className="absolute right-1 top-2 rotate-[-8deg] border border-[#759588]/80 bg-[#e8f0ec]/40 backdrop-blur-[0.5px] px-2 py-0.5 rounded-[2px] shadow-xs text-center">
              <div className="font-mono text-[7px] sm:text-[7.5px] tracking-widest text-[#5c7f71] uppercase">PAR AVION</div>
              <div className="font-mono text-[9.5px] sm:text-[10.5px] tracking-wider text-[#3d5c50] uppercase font-bold border-y border-[#759588]/50 py-0.5">LUFTPOST</div>
              <div className="font-mono text-[6.5px] sm:text-[7px] tracking-widest text-[#5c7f71] uppercase">PRIORITAIRE</div>
            </div>
          </div>

          {/* Middle: badges + policy pills */}
          <div className="space-y-2 sm:space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap gap-2">
              {metadataTags.map((tag) => (
                <span key={tag} className="bg-[#e2e5e9] hover:bg-[#d8dce1] rounded-[6px] px-3.5 py-1 text-[12px] sm:text-[13px] text-[#374151] font-normal">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {policyPills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => setActiveModal(pill)}
                  className="bg-[#e2e5e9] hover:bg-[#d8dce1] rounded-[6px] px-3.5 py-1 text-[12px] sm:text-[13px] text-[#374151] font-normal cursor-pointer"
                >
                  {pill}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom: attribution */}
          <div className="mt-6 sm:mt-8 text-[13px] text-[#374151] font-normal flex items-center flex-wrap gap-1">
            <span>Made with</span>
            <span className="mx-0.5 text-base sm:text-lg select-none hover:scale-110 transition-transform">🥨</span>
            <span>By</span>
            <span className="bg-[#dce7e1] hover:bg-[#ceddd6] text-[#2c443b] rounded-[5px] px-2.5 py-0.5 mx-0.5">UI HUB</span>
            <span>in California.</span>
          </div>

          {/* Bottom: View Live button */}
          <div className="mt-6 sm:mt-8">
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="inline-flex items-center gap-2 bg-[#1f2937] hover:bg-black text-white rounded-full px-5 py-2.5 text-[14px] font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.18)] transition-colors"
            >
              View Live
              <span className="text-[15px] leading-none">↗</span>
            </a>
          </div>
        </div>

        {/* Lower scenic spacer */}
        <div className="min-h-[360px]" />
      </div>

      {/* Modal sheets */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/45 backdrop-blur-sm"
              onClick={() => setActiveModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-[#0f172a]">{modalContent[activeModal].title}</h3>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef1f5] text-[#374151] hover:bg-[#e2e5e9] cursor-pointer"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-[#4b5563] leading-relaxed">{modalContent[activeModal].body}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}`,
        vibePrompt: `Create a responsive React (TypeScript) + Tailwind CSS website footer component called 'AlpineFooter' that replicates a scenic alpine-landscape design.

1. OVERALL LAYOUT & SCENIC BACKGROUND:
Root element: <footer id="alpine-footer" class="relative w-full min-h-screen flex flex-col justify-start overflow-hidden font-sans select-text bg-[#0f172a]">. Background image URL: https://res.cloudinary.com/chhwhdhk/image/upload/v1788246818/ChatGPT_Image_Sep_1_2026_12_43_09_PM_exqydf.png, with background-size cover, background-position center top, background-repeat no-repeat. Top card container: max-w-7xl mx-auto with padding px-4 sm:px-6 pt-5 sm:pt-7 pb-4 z-20 (w-full). Below the card, a flexible spacer div with min-h-[360px] so the lower scenic alpine landscape, wildflower meadows, and chalet houses remain visible.

2. MAIN FOREGROUND CARD: target id alpine-footer-main-card. Background #C4C4C4, border-radius rounded-[24px] (sm:rounded-[32px]), border 1px solid rgba(255,255,255,0.6), box-shadow 0 10px 35px rgba(0,0,0,0.09), padding p-6 sm:p-8 md:p-10.

3. TOP SECTION - VINTAGE POSTAGE STAMP & CANCELLATION STICKER: margin-bottom mb-6 sm:mb-8. Postage stamp outer frame: background #e2e5e8, padding p-2.5, rounded-[2px], shadow-sm. Perforation teeth: top & bottom rows of 12 circles each (w-1.5 h-1.5 rounded-full bg-[#f1f3f5]); left & right 8 each. Stamp inner artwork container: w-[110px] sm:w-[124px], h-[78px] sm:h-[88px], alpine mountain lake photo (the background URL) with object-cover saturate-[1.1] contrast-[1.05], border 1px solid rgba(0,0,0,0.15). Postal cancellation/cachet sticker: absolute, rotated -8deg, positioned so it overlays the small stamp image on its right-side corner (right-1 top-2), sitting on top of the artwork rather than hanging off it; border 1px solid rgba(117,149,136,0.8), background rgba(232,240,236,0.4), backdrop-blur-[0.5px], padding px-2 py-0.5, rounded-[2px], shadow-xs, centered text. Lines: 'PAR AVION' (font-mono text-[7px] sm:text-[7.5px] tracking-widest #5c7f71), 'LUFTPOST' (font-mono text-[9.5px] sm:text-[10.5px] tracking-wider bold #3d5c50, border-y border-[#759588]/50 py-0.5), 'PRIORITAIRE' (font-mono text-[6.5px] sm:text-[7px] tracking-widest #5c7f71), all uppercase.

4. MIDDLE SECTION - SYSTEM BADGES & POLICY PILLS: container space-y-2 sm:space-y-2.5 max-w-2xl. All pills: background #e2e5e9 hover #d8dce1, rounded-[6px], padding px-3.5 py-1, text-[12px] sm:text-[13px] text-[#374151] font-normal. Row 1 metadata tags: 'Font: SF Pro', 'Framework: Next.js', 'Last Updated: Jul 23, 2026'. Row 2 policy pills (buttons that open modals): 'Privacy Policy', 'Manifesto', 'Changelog'.

5. BOTTOM SECTION - ATTRIBUTION LINE: margin-top mt-6 sm:mt-8, text-[13px] text-[#374151] font-normal flex items-center flex-wrap gap-1. 'Made with' + pretzel icon 🥨 (mx-0.5 text-base sm:text-lg select-none hover:scale-110 transition-transform) + 'By' + author pill badge 'UI HUB' (background #dce7e1 hover #ceddd6, text #2c443b, rounded-[5px], padding px-2.5 py-0.5 mx-0.5) + 'in California.' Then, in a separate row below (margin-top mt-6 sm:mt-8), add a 'View Live' button: an anchor <a> that is non-navigating (href="#" with onClick={(e) => e.preventDefault()} so clicking or hovering never redirects and the footer stays in place), styled as a dark pill (inline-flex items-center gap-2 bg-[#1f2937] hover:bg-black text-white rounded-full px-5 py-2.5 text-[14px] font-semibold shadow-[0_6px_18px_rgba(15,23,42,0.18)] transition-colors) with label 'View Live' and a ↗ arrow glyph.

6. INTERACTIVE MODAL SHEETS: accessible popover/modal for Privacy Policy, Manifesto, and Changelog with a close button (✕), backdrop blur, and smooth entrance animation using motion/react (import { AnimatePresence, motion } from 'motion/react'). Use useState to track the active modal. Each modal shows a title and a short body. Use AnimatePresence for exit animations; backdrop is a clickable div that closes the modal. Ensure the footer root is min-h-screen with the scenic background filling it and the card stacked near the top.`
    },

    {
        id: "leeuwarder-golfclub",
        title: "Leeuwarder Golfclub",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        description: "A modern luxury golf club footer for 'Leeuwarder Golfclub' with a polished partner section above it, a dark charcoal footer shell, topographic contour overlay, centered floating star emblem, three-column contact/brand/nav layout, and a live 'Starttijd reserveren' CTA.",
        preview: () => (<LeeuwarderGolfclubPreview />),
        code: `import { ArrowRight } from "lucide-react";

const STAR_EMBLEM = "https://res.cloudinary.com/chhwhdhk/image/upload/v1788254211/ChatGPT_Image_Sep_1_2026_02_46_36_PM_gxnmtp.png";

const partners = [
  { name: "e fresh", color: "#00F27A", icon: "ring" },
  { name: "Heineken", color: "#64D98A", icon: "star" },
  { name: "11STEDENHAL", color: "#38BDF8", icon: "oval" },
  { name: "lippe wonen", color: "#ffffff", icon: "badge" },
  { name: "NIVO", color: "#C084FC", icon: "check" },
  { name: "Sligro", color: "#ffffff", icon: "chef" },
];

export default function LeeuwarderGolfclub() {
  return (
    <div className="w-full bg-[radial-gradient(circle_at_30%_20%,#39544a,#2c3f30)] flex justify-center overflow-hidden font-sans">
      <div className="w-full max-w-[80rem] py-4">
        <div className="bg-[#FAF5DF] rounded-[48px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
          {/* PARTNERS SECTION */}
          <section className="px-8 sm:px-12 pt-14 pb-10 text-center">
            <h2 className="text-[34px] sm:text-[38px] font-bold text-[#1e231e] tracking-tight mb-5">Onze trotse partners</h2>
            <button type="button" className="inline-flex items-center gap-2 bg-[#E5F7E8] border border-[#B3E8BC] text-[#006B4F] text-[13px] font-semibold px-4 py-1.5 rounded-full mb-7 group cursor-pointer">
              Word ook partner
              <span className="w-5 h-5 bg-[#00F27A] text-[#004A35] rounded-full flex items-center justify-center transition-transform group-hover:translate-x-0.5">
                <ArrowRight size={12} strokeWidth={3} />
              </span>
            </button>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4 max-w-6xl mx-auto">
              {partners.map((p) => (
                <div key={p.name} className="aspect-square rounded-[22px] sm:rounded-[24px] bg-[#004D36] hover:bg-[#005B40] flex flex-col items-center justify-center gap-2 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer">
                  {p.icon === "ring" && (
                    <div className="w-10 h-10 rounded-full border-2 border-[#00F27A]/50 flex items-center justify-center" style={{ color: p.color }}>
                      <span className="font-black text-sm">ef</span>
                    </div>
                  )}
                  {p.icon === "star" && (
                    <svg className="w-6 h-6 text-[#FF0000]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L21.5 9.27l-4.9 4.57 1.24 7.16L12 17.77l-5.84 3.23 1.24-7.16L2.5 9.27l6.6-1.01L12 2z" /></svg>
                  )}
                  {p.icon === "oval" && (
                    <svg className="w-10 h-10" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="none" stroke="#00B4D8" strokeWidth="3" /><path d="M2 12a10 6 0 0 0 20 0" fill="none" stroke="#F77F00" strokeWidth="3" /></svg>
                  )}
                  {p.icon === "badge" && (
                    <span className="bg-[#F59E0B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[4px]">lippe</span>
                  )}
                  {p.icon === "check" && (
                    <div className="flex items-center gap-1">
                      <span className="font-black text-2xl" style={{ color: p.color }}>NIV</span>
                      <svg className="w-4 h-4 text-[#00F27A]" viewBox="0 0 24 24" fill="none"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  )}
                  {p.icon === "chef" && (
                    <svg className="w-6 h-6 text-[#FBBF24]" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3a4.5 4.5 0 0 0-4.5 4.5c0 .4.05.8.15 1.17A4.75 4.75 0 0 0 4 13.25 4.9 4.9 0 0 0 6 17.5v1.2a1.3 1.3 0 0 0 1.3 1.3h9.4a1.3 1.3 0 0 0 1.3-1.3v-1.2a4.9 4.9 0 0 0 2-4.25 4.75 4.75 0 0 0-3.15-4.58c.1-.37.15-.77.15-1.17A4.5 4.5 0 0 0 12 3z" /></svg>
                  )}
                  {p.icon !== "badge" && p.icon !== "check" && p.icon !== "ring" && (
                    <span className="font-bold text-sm" style={{ color: p.color, fontStyle: p.icon === "chef" ? "italic" : "normal" }}>{p.name}</span>
                  )}
                  {p.icon === "ring" && <span className="font-bold text-[13px] text-[#00F27A]">{p.name}</span>}
                  {p.icon === "badge" && <span className="font-bold text-base text-white">{p.name.replace("lippe ", "")}</span>}
                </div>
              ))}
            </div>
          </section>

          {/* FOOTER */}
          <footer className="relative w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-20 sm:pt-24 pb-8 bg-[#242424] rounded-t-[32px] sm:rounded-t-[48px] md:rounded-t-[52px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65)] border border-white/5 overflow-hidden">
            {/* Topographic overlay */}
            <svg className="absolute inset-0 w-full h-full text-white/10" style={{ opacity: 0.5 }} xmlns="http://www.w3.org/2000/svg">
              <g fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.5">
                <path d="M0 180 C 200 120, 400 240, 700 160 C 900 100, 1100 220, 1400 150" />
                <path d="M0 260 C 250 200, 500 320, 800 240 C 1000 190, 1200 300, 1400 230" />
                <path d="M0 340 C 200 280, 450 400, 750 320 C 950 270, 1200 380, 1400 310" />
              </g>
            </svg>

            {/* Center floating star emblem */}
            <img
              src={STAR_EMBLEM}
              alt="Leeuwarder Golfclub logo"
              className="absolute -top-14 sm:-top-16 md:-top-20 left-1/2 -translate-x-1/2 z-30 w-[110px] h-[110px] sm:w-[135px] sm:h-[135px] md:w-[150px] md:h-[150px] object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer"
            />

            {/* 3-column layout */}
            <div className="relative z-10 grid grid-cols-12 gap-6">
              {/* LEFT: Contact */}
              <div className="col-span-12 md:col-span-4">
                <h3 className="text-[18px] font-bold text-[#FFF6C7] mb-3">Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:block xl:grid">
                  <div className="text-[13.5px] text-[#FFF6C7]/85 leading-relaxed">
                    <p className="mb-1.5">Woelwijk 101,<br />8926 XD Leeuwarden</p>
                    <p className="mb-1.5 hover:text-[#00F27A] transition-colors">0511 - 43 22 99</p>
                    <p className="hover:text-[#00F27A] transition-colors">info@leeuwardergolfclub.nl</p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2 text-[13.5px]">
                    {["Facebook", "Instagram", "LinkedIn"].map((s) => (
                      <a key={s} href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-1 text-[#FFF6C7] hover:text-[#00F27A] transition-colors group">
                        {s}
                        <svg className="w-3.5 h-3.5 text-[#00F27A] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H8M17 7V16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </a>
                    ))}
                  </div>
                </div>
                {/* Score & badges */}
                <div className="mt-5 flex flex-col gap-2 items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#00F27A] text-[#121212] font-black text-[11px] px-2 py-0.5 rounded-full">7,9</span>
                    <span className="text-[#FFF6C7]/90 text-[12px]">Leadingcourses score</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="bg-[#E05A1E] w-6 h-7 rounded-[4px] flex items-center justify-center text-white text-[8px] font-black">NGF</div>
                    <div className="bg-[#0E4A35] border border-[#00F27A]/40 px-2 py-0.5 rounded-[4px] flex flex-col items-center">
                      <svg className="w-4 h-4 text-[#FBBF24]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L21.5 9.27l-4.9 4.57 1.24 7.16L12 17.77l-5.84 3.23 1.24-7.16L2.5 9.27l6.6-1.01L12 2z" /></svg>
                      <span className="text-white text-[8px] font-bold">2024</span>
                    </div>
                    <div className="bg-[#009EE0] w-7 h-5 rounded-[4px] flex items-center justify-center text-white text-[8px] font-black">GOLF.NL</div>
                    <div className="flex w-2.5 h-7 rounded-[3px] overflow-hidden border border-white/15">
                      <div className="flex-1 bg-[#E8380D]" />
                      <div className="flex-1 bg-white" />
                      <div className="flex-1 bg-[#244FAE]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* CENTER: Brand */}
              <div className="col-span-12 md:col-span-4 text-center px-2 pt-4 md:pt-0">
                <div className="font-display font-black text-[38px] sm:text-[46px] md:text-[50px] leading-[1.05] tracking-tight text-[#FFF6C7]">
                  Leeuwarder<br />Golfclub
                </div>
                <div className="font-serif italic text-[19px] sm:text-[21px] text-[#FFF6C7]/95 mt-2.5 mb-7 font-normal tracking-wide">
                  Waar golfgeluk begint
                </div>
                <div className="flex flex-col items-center gap-3">
                  <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 bg-[#00F27A] hover:bg-[#05FF83] text-[#111111] font-bold text-[13.5px] sm:text-[14px] rounded-full px-5 py-2.5 shadow-[0_4px_14px_rgba(0,242,122,0.35)] transition-colors">
                    Starttijd reserveren
                    <span className="w-5 h-5 bg-[#0E281C] text-[#00F27A] rounded-full flex items-center justify-center">
                      <ArrowRight size={12} strokeWidth={3} />
                    </span>
                  </a>
                  <a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 bg-[#006B4F] hover:bg-[#007E5C] text-[#FFF6C7] font-bold text-[13.5px] sm:text-[14px] rounded-full px-5 py-2.5 border border-[#00F27A]/20 shadow-md transition-colors">
                    Direct lid worden
                    <span className="w-5 h-5 bg-[#00F27A] text-[#004A35] rounded-full flex items-center justify-center">
                      <ArrowRight size={12} strokeWidth={3} />
                    </span>
                  </a>
                </div>
              </div>

              {/* RIGHT: Snel naar */}
              <div className="col-span-12 md:col-span-4">
                <h3 className="text-[18px] font-bold text-[#FFF6C7] mb-3">Snel naar</h3>
                <div className="grid grid-cols-2 gap-6 text-[13.5px] text-[#FFF6C7]/85 space-y-2 mb-6">
                  <div className="flex flex-col gap-2">
                    {["Onze club", "Voor gasten", "Begin met Golf"].map((l) => (
                      <span key={l} className="hover:text-[#00F27A] transition-colors cursor-pointer">{l}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    {["De baan", "Onze evenementen", "Contact"].map((l) => (
                      <span key={l} className="hover:text-[#00F27A] transition-colors cursor-pointer">{l}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-[#FFF6C7] text-[#1E1E1E] text-[11px] font-medium px-3.5 py-1 rounded-[5px] shadow-sm inline-block">
                  Cookies policy&nbsp;&nbsp;|&nbsp;&nbsp;Privacy policy&nbsp;&nbsp;|&nbsp;&nbsp;©2025
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}`,
        vibePrompt: `Create a pixel-perfect, responsive React/HTML/Tailwind CSS web component recreating the modern luxury golf club footer for "Leeuwarder Golfclub" with the partner section above it. Follow the exact specifications below:

1. OVERALL COLOR PALETTE & TYPOGRAPHY: Canvas/Page Background: Deep scenic forest green #2c3f30 with subtle radial lighting. Main App Container Background: Warm ivory / soft cream #FAF5DF with rounded corners (rounded-[40px] to rounded-[56px]). Footer Container Background: Very dark charcoal/black #242424. Primary Text Color: Warm pale cream #FFF6C7. Primary Accent / Neon Green: #00F27A. Secondary Dark Green: #006B4F. Fonts: Main Display Brand = geometric modern display sans (Syne or Plus Jakarta Sans bold/extrabold); Tagline = elegant italic serif (Instrument Serif or Fraunces, italic, font-normal); Body & Links = clean sans (Plus Jakarta Sans, weights 400/500/700).

2. TOP SECTION "ONZE TROTSE PARTNERS": Heading centered text-[34px] sm:text-[38px] font-bold color #1e231e tracking-tight "Onze trotse partners". Pill Button "Word ook partner": style bg-[#E5F7E8] border border-[#B3E8BC] text-[#006B4F] text-[13px] font-semibold px-4 py-1.5 rounded-full; right icon = small circular neon-green badge (w-5 h-5 bg-[#00F27A] text-[#004A35] rounded-full) with ArrowRight that slides translate-x-0.5 on hover. Partner Cards Grid (6 cards): container grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4 max-w-6xl mx-auto. Card: aspect-square rounded-[22px] sm:rounded-[24px] bg-[#004D36] hover:bg-[#005B40] hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-pointer. Card content: (1 e fresh) neon ring w-10 h-10 rounded-full border-2 border-[#00F27A]/50 with "ef" + text "e fresh" in #00F27A; (2 Heineken) red 5-point star w-6 h-6 text-[#FF0000] + bold serif "Heineken" #64D98A; (3 11STEDENHAL) cyan/orange oval speed-skating track icon border-2 border-[#00B4D8] border-t-[#F77F00] + "11STEDENHAL" #38BDF8 bold; (4 lippe wonen) amber badge bg-[#F59E0B] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] + white "wonen"; (5 NIVO) purple bold "NIV" with neon-green checkmark #00F27A; (6 Sligro) golden chef hat icon #FBBF24 + italic bold serif "Sligro" #FFFFFF.

3. FOOTER CONTAINER & TOPOGRAPHIC CONTOURS: Footer Shell: relative w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 pt-20 sm:pt-24 pb-8, rounded-[32px] sm:rounded-[48px] md:rounded-[52px], shadow-[0_25px_50px_-12px_rgba(0,0,0,0.65)], border border-white/5, background #242424. Topographic Background Pattern: full-coverage organic elevation/golf-course contour curves via SVG overlay with stroke=currentColor strokeWidth=1.25 opacity text-white/10, low contrast.

4. CENTER FLOATING STAR EMBLEM (overlapping top border): absolute -top-14 sm:-top-16 md:-top-20 left-1/2 -translate-x-1/2 z-30. Asset image https://res.cloudinary.com/chhwhdhk/image/upload/v1788254211/ChatGPT_Image_Sep_1_2026_02_46_36_PM_gxnmtp.png. Sizing w-[110px] h-[110px] sm:w-[135px] sm:h-[135px] md:w-[150px] md:h-[150px]. Effects drop-shadow-2xl hover:scale-105 transition-transform duration-300 cursor-pointer object-contain.

5. THREE-COLUMN DESKTOP CONTENT LAYOUT (12-col grid): A. LEFT COLUMN (4 cols): "Contact" heading text-[18px] font-bold text-[#FFF6C7] mb-3; contact text-[13.5px] text-[#FFF6C7]/85 leading-relaxed: "Woelwijk 101,", "8926 XD Leeuwarden", "0511 - 43 22 99" (hover #00F27A), "info@leeuwardergolfclub.nl" (hover #00F27A); right social links "Facebook ↗", "Instagram ↗", "LinkedIn ↗" text-[#FFF6C7] with w-3.5 h-3.5 text-[#00F27A] arrow that moves translate-x-0.5 -translate-y-0.5 on hover. Left-Bottom badges: score pill bg-[#00F27A] text-[#121212] font-black text-[11px] px-2 py-0.5 rounded-full "7,9" + "Leadingcourses score" text-[#FFF6C7]/90 text-[12px]; NGF orange badge bg-[#E05A1E] w-6 h-7 rounded-[4px]; Leadingcourses dark pine bg-[#0E4A35] border border-[#00F27A]/40 with gold star + "2024"; GOLF.NL blue bg-[#009EE0] w-7 h-5 rounded-[4px]; PGA Holland tricolor flag (Red/White/Blue). B. CENTER COLUMN (4 cols): Brand "Leeuwarder" above "Golfclub", font-display font-black text-[38px] sm:text-[46px] md:text-[50px] leading-[1.05] tracking-tight text-[#FFF6C7] text-center; tagline "Waar golfgeluk begint" font-serif italic text-[19px] sm:text-[21px] text-[#FFF6C7]/95 mt-2.5 mb-7 text-center. Two CTA pills: (1 "Starttijd reserveren") bg-[#00F27A] hover:bg-[#05FF83] text-[#111111] font-bold text-[13.5px] sm:text-[14px] rounded-full px-5 py-2.5 shadow-[0_4px_14px_rgba(0,242,122,0.35)] with dark circle badge w-5 h-5 bg-[#0E281C] text-[#00F27A] ArrowRight icon; (2 "Direct lid worden") bg-[#006B4F] hover:bg-[#007E5C] text-[#FFF6C7] font-bold text-[13.5px] sm:text-[14px] rounded-full px-5 py-2.5 border border-[#00F27A]/20 shadow-md with neon circle badge w-5 h-5 bg-[#00F27A] text-[#004A35] ArrowRight. Both CTA buttons are anchor links to the live URL https://ai.studio/apps/54435c8b-0890-4430-9b21-d8ca1aaeced3 with target="_blank" rel="noopener noreferrer". C. RIGHT COLUMN (4 cols): "Snel naar" heading text-[18px] font-bold text-[#FFF6C7] mb-3; 2-column nav grid text-[13.5px] text-[#FFF6C7]/85 space-y-2 hover:#00F27A: col1 "Onze club", "Voor gasten", "Begin met Golf"; col2 "De baan", "Onze evenementen", "Contact". Bottom-right legal bar: bg-[#FFF6C7] text-[#1E1E1E] text-[11px] font-medium px-3.5 py-1 rounded-[5px] shadow-sm containing "Cookies policy | Privacy policy | ©2025".

6. RESPONSIVE BEHAVIOR: Desktop >=1024px crisp 3-column layout; Tablet 768-1023 proportional scaling; Mobile <768 stacked vertical with center-aligned brand/CTAs followed by contact and navigation without horizontal overflow. Use lucide-react ArrowRight for arrow icons. The two center CTA buttons ('Starttijd reserveren' and 'Direct lid worden') must be non-navigating: clicking or hovering them must never redirect — use href="#" with onClick={(e) => e.preventDefault()} so the footer stays in place.`,

    },

    {
        id: "community-newsletter",
        title: "Community Newsletter",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        description: "An ultra-high-fidelity Community Newsletter subscription card with a scenic glassmorphic card, email signup form with a 'Join Now'/'Joined!' state, 5,000+ member avatar proof, and floating social media icons.",
        preview: () => (<NewsletterCardPreview />),
        code: `import { useState } from "react";
import { Instagram, Github, Linkedin } from "lucide-react";

export default function CommunityNewsletter() {
  const [joined, setJoined] = useState(false);
  const [email, setEmail] = useState("");

  const avatars = [
    { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 1" },
    { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 2" },
    { url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 3" },
    { url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 4" },
    { url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&auto=format&fit=crop&crop=faces&q=80", alt: "Member 5" },
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setJoined(true);
    setEmail("");
  };

  const socialBtn =
    "w-[34px] h-[34px] rounded-full bg-white/80 hover:bg-white hover:scale-110 active:scale-95 text-[#152038] border border-white/80 shadow-[0_2px_6px_rgba(0,0,0,0.05)] flex items-center justify-center transition-all cursor-pointer";

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-8 lg:p-12 font-sans antialiased">
      {/* Full Page Background Image */}
      <img
        src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788255735/ChatGPT_Image_Sep_1_2026_03_11_12_PM_kzw430.png"
        alt=""
        className="fixed inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0"
      />

      {/* Card */}
      <div
        id="newsletter-card"
        className="relative w-full max-w-[1000px] min-h-[295px] rounded-[16px] border border-white/40 overflow-hidden backdrop-blur-md bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
      >
        {/* Card internal background */}
        <img
          src="https://res.cloudinary.com/chhwhdhk/image/upload/v1788257136/ChatGPT_Image_Sep_1_2026_03_32_14_PM_ustzc6.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-white/25 backdrop-blur-[2px] pointer-events-none" />

        {/* Inner flex wrapper */}
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center h-full w-full">
          {/* LEFT: content */}
          <div className="flex flex-col justify-start h-full pt-[44px] pb-[40px] px-[24px] sm:px-[36px] md:pl-[46px] md:pr-0 max-w-[460px]">
            <h2 className="font-bold text-[22px] sm:text-[24px] leading-[29px] tracking-[-0.015em] text-[#152038] drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)] whitespace-nowrap">
              Subscribe to Our Community
            </h2>
            <p className="mt-[10px] font-medium text-[13px] leading-[18px] max-w-[390px] text-[#2c3e55] drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)]">
              Get exclusive access to cutting-edge tech insights, industry trends, and expert advice delivered straight to your inbox. Join our growing community today!
            </p>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="mt-[22px] flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email here"
                aria-label="Email address"
                className="px-[16px] text-[13px] text-[#152038] placeholder:text-[#7d8b9e] rounded-full bg-white/90 backdrop-blur-md border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] focus:outline-none focus:ring-2 focus:ring-[#8d7cd6]/50"
                style={{ width: "100%", maxWidth: 255, height: 37 }}
              />
              <button
                type="submit"
                className="bg-white/90 hover:bg-white active:scale-[0.98] text-[#152038] font-semibold text-[13px] rounded-full border border-white/60 shadow-[0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-md flex items-center justify-center cursor-pointer transition-all duration-200"
                style={{ width: "100%", maxWidth: 87, height: 37 }}
              >
                {joined ? "Joined!" : "Join Now"}
              </button>
            </form>

            {/* Social proof */}
            <div className="mt-[24px] flex items-center select-none">
              <div className="flex">
                {avatars.map((a, i) => (
                  <img
                    key={a.url}
                    src={a.url}
                    alt={a.alt}
                    width={27}
                    height={27}
                    className="w-[27px] h-[27px] rounded-full border-[1.5px] border-white object-cover shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
                    style={{ marginLeft: i === 0 ? 0 : -6 }}
                  />
                ))}
              </div>
              <span className="ml-[12px] font-semibold text-[12px] leading-none text-[#152038] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">
                5,000+ happy members
              </span>
            </div>
          </div>

          {/* RIGHT: social media */}
          <div className="hidden md:flex flex-col items-end pr-[46px] self-center">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#152038] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]">SOCIAL MEDIA</span>
            <div className="flex items-center gap-[10px] mt-2">
              <button type="button" className={socialBtn} aria-label="Instagram"><Instagram className="w-[16px] h-[16px]" /></button>
              <button type="button" className={socialBtn} aria-label="Github"><Github className="w-[16px] h-[16px]" /></button>
              <button type="button" className={socialBtn} aria-label="LinkedIn"><Linkedin className="w-[16px] h-[16px]" /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
        vibePrompt: `Create an ultra-high-fidelity, pixel-accurate React + Tailwind CSS Community Newsletter / Footer subscription card component matching these exact specifications:

1. GLOBAL PAGE LAYOUT & BACKGROUND: Viewport: Full screen (min-h-screen w-full relative overflow-hidden flex items-center justify-center p-4 sm:p-8 lg:p-12). Font Family: 'Plus Jakarta Sans', system-ui, sans-serif with antialiasing (-webkit-font-smoothing: antialiased). Full Page Background Image: URL "https://res.cloudinary.com/chhwhdhk/image/upload/v1788255735/ChatGPT_Image_Sep_1_2026_03_11_12_PM_kzw430.png", styling fixed inset-0 w-full h-full object-cover object-center pointer-events-none select-none z-0. No dark/heavy overlay; keep the artwork clear.

2. CARD CONTAINER: Selector/ID #newsletter-card. Dimensions: max-width 1000px, min-height 295px, aspect-ratio 1000 / 295, width 100%. Shape & Borders: rounded-[16px], border border-white/40, overflow-hidden. Glassmorphism & Shadow: backdrop-blur-md bg-white/20, box-shadow 0 8px 32px rgba(0,0,0,0.06). Card Internal Background Image: URL "https://res.cloudinary.com/chhwhdhk/image/upload/v1788257136/ChatGPT_Image_Sep_1_2026_03_32_14_PM_ustzc6.png", styling absolute inset-0 w-full h-full object-cover pointer-events-none select-none. Overlay: absolute inset-0 bg-white/25 backdrop-blur-[2px] pointer-events-none. Inner Flex Wrapper: relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center h-full w-full.

3. LEFT-SIDE CONTENT & TYPOGRAPHY: Container flex flex-col justify-start h-full pt-[44px] pb-[40px] px-[24px] sm:px-[36px] md:pl-[46px] md:pr-0 max-w-[420px]. Main Heading "Subscribe to Our Community": font-bold text-[22px] sm:text-[24px] line-height [29px] tracking-[-0.015em] color #152038 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)], single line on desktop. Description mt-[10px] "Get exclusive access to cutting-edge tech insights, industry trends, and expert advice delivered straight to your inbox. Join our growing community today!" font-medium text-[13px] line-height [18px] max-w-[390px] color #2c3e55 drop-shadow-[0_1px_1px_rgba(255,255,255,0.6)], exactly 3 lines on desktop.

4. EMAIL INPUT & SUBMISSION BUTTON ROW: Form Container mt-[22px] flex flex-col sm:flex-row items-stretch sm:items-center gap-[12px]. Email Input width 100% on mobile / sm:w-[255px], height 37px, px-[16px], text-[13px], text-[#152038], placeholder text-[#7d8b9e] "Enter your email here", fully rounded pill rounded-full, bg-white/90, backdrop-blur-md, border border-white/60, shadow-[0_2px_8px_rgba(0,0,0,0.06)], focus:outline-none focus:ring-2 focus:ring-[#8d7cd6]/50. Submit Button width 100% on mobile / sm:w-[87px], height 37px, text "Join Now" (or "Joined!" upon submit), bg-white/90 hover:bg-white active:scale-[0.98], text-[#152038], font-semibold, text-[13px], rounded-full, border border-white/60, shadow-[0_2px_8px_rgba(0,0,0,0.06)], backdrop-blur-md, flex items-center justify-center cursor-pointer transition-all duration-200. Handle form submit with a controlled state (useState), briefly switching the button label to "Joined!" and clearing the input; submission must never redirect.

5. SOCIAL PROOF / MEMBER AVATARS: Container mt-[24px] flex items-center select-none. Avatars group: flex row with -ml-[6px] overlap between 5 circular avatars. Each avatar w-[27px] h-[27px] rounded-full border-[1.5px] border-white object-cover shadow-[0_1px_3px_rgba(0,0,0,0.12)]. Image URLs (Unsplash faces): (1) https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&auto=format&fit=crop&crop=faces&q=80 (2) https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&auto=format&fit=crop&crop=faces&q=80 (3) https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&auto=format&fit=crop&crop=faces&q=80 (4) https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&auto=format&fit=crop&crop=faces&q=80 (5) https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&auto=format&fit=crop&crop=faces&q=80. Member Text ml-[12px] "5,000+ happy members" font-semibold text-[12px] leading-none color #152038 drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)].

6. RIGHT-SIDE FLOATING SOCIAL MEDIA ICONS: Container hidden md:flex flex-col items-end pr-[46px] self-center. Group flex flex-col items-end gap-[8px]. Label text-[11px] uppercase tracking-wider font-bold text-[#152038] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)] "SOCIAL MEDIA". Icon Row flex items-center gap-[10px]: 3 circular buttons for Instagram, GitHub, and LinkedIn — w-[34px] h-[34px] rounded-full bg-white/80 hover:bg-white hover:scale-110 active:scale-95 text-[#152038] border border-white/80 shadow-[0_2px_6px_rgba(0,0,0,0.05)] flex items-center justify-center transition-all cursor-pointer. Icons: Lucide React icons <Instagram className="w-[16px] h-[16px]" />, <Github className="w-[16px] h-[16px]" />, <Linkedin className="w-[16px] h-[16px]" />. The social buttons must be non-navigating (buttons, not links) so clicking never redirects.

7. INTERACTIVITY & ANIMATIONS: Email State: handle form submit with a controlled state, briefly switching the button label to "Joined!" and clearing the input. Hover Transitions: smooth transition-all duration-200 across button active scale (active:scale-[0.98]), social icon hover zoom (hover:scale-110), and input focus rings. Responsiveness: fluid width scaling down seamlessly on mobile with vertical form stacking and preserved legibility. Non-navigating behavior: no buttons, links, or hover elements should redirect anywhere or leave the component; everything stays in place.`,

    },

    {
        id: "faizur-portfolio",
        title: "Faizur Portfolio",
        category: "footer",
        isPremium: false,
        addedAt: "2026-09-01",
        newBadgeDays: 120,
        liveUrl: "https://ai.studio/apps/3a30febb-b24a-4b58-925a-0413fcf885cb",
        description: "A pixel-perfect, highly editorial website footer component in React and Tailwind CSS featuring an editorial serif brand tagline, a large outlined pill 'Contact' button, 4-column navigation with custom brand social pills, creative tools mockup, and giant cropped bottom typography 'faizur'.",
        preview: () => (<FaizurPortfolioPreview />),
        code: `import React from "react";
import { ArrowUpRight } from "lucide-react";

export default function FaizurPortfolio() {
  const services = [
    "Website Design",
    "Mobile App Design",
    "Sass/Dashboard",
    "Consultant",
  ];

  const explore = ["All Projects", "Newsletter", "Contact"];

  return (
    <div className="w-full bg-[#F8F8F8] py-8 sm:py-12 md:py-16 px-4 sm:px-8 lg:px-12 flex justify-center font-sans antialiased select-text">
      {/* Outer Footer Container */}
      <footer className="w-full max-w-[1240px] bg-[#E7E7E7] rounded-[40px] overflow-hidden relative pt-12 sm:pt-16 px-6 sm:px-12 md:px-16 lg:px-20 pb-0">
        {/* Top Header Row (Brand & Contact Button) */}
        <div className="flex justify-between items-start gap-4">
          <h2
            className="text-[#080808] font-medium text-[26px] sm:text-[28px] leading-[1.12] tracking-[-0.01em]"
            style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
          >
            Your product<br />design partner
          </h2>

          <a
            href="https://ai.studio/apps/3a30febb-b24a-4b58-925a-0413fcf885cb"
            target="_blank"
            rel="noopener noreferrer"
            className="w-[170px] sm:w-[210px] md:w-[230px] h-[58px] sm:h-[68px] md:h-[76px] rounded-full border-[2px] border-[#080808] bg-transparent text-[#080808] hover:bg-[#080808] hover:text-white transition-colors duration-200 flex items-center justify-center text-[32px] sm:text-[38px] md:text-[44px] font-normal leading-none -translate-y-[1px] cursor-pointer no-underline select-none"
            style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
          >
            Contact
          </a>
        </div>

        {/* Four-Column Navigation & Interaction Grid */}
        <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-x-8 lg:gap-x-10 gap-y-8 relative z-10">
          {/* Column 1 — Services */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Services
            </h3>
            <ul className="space-y-[4px]">
              {services.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[13px] leading-[25px] text-[#666666] hover:text-[#080808] transition-colors duration-150 block"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2 — Explore */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Explore
            </h3>
            <ul className="space-y-[4px]">
              {explore.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[13px] leading-[25px] text-[#666666] hover:text-[#080808] transition-colors duration-150 block"
                    style={{ fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Say Hello! (Social Pills) */}
          <div>
            <h3
              className="text-[17px] font-medium text-[#080808] mb-3"
              style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
            >
              Say hello!
            </h3>
            <div className="flex flex-col gap-1.5">
              {/* Row 1: 𝕏 & Instagram */}
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#080808">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#E1306C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
              </div>

              {/* Row 2: Dribbble & YouTube */}
              <div className="flex flex-wrap items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EA4C89" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M19.13 5.09C15.22 9.14 10 10.44 2.25 10.94" />
                    <path d="M21.75 12.84c-6.62-1.41-12.14 1-16.38 6.32" />
                    <path d="M8.56 2.75c4.37 6 6 9.42 8 17.72" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @fazurrehman
                  </span>
                </a>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @faizurrehman
                  </span>
                </a>
              </div>

              {/* Row 3: Figma */}
              <div className="flex items-center gap-1.5">
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-full min-h-[25px] h-[25px] px-2.5 py-0.5 bg-[#F7F7F7] hover:bg-white transition-colors duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)] inline-flex items-center gap-1.5 select-none no-underline cursor-pointer"
                >
                  <svg width="10" height="14" viewBox="0 0 38 57" fill="none">
                    <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
                    <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
                    <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
                    <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
                    <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
                  </svg>
                  <span className="text-[11.5px] font-medium text-[#222222] whitespace-nowrap" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
                    @faizurrehman
                  </span>
                </a>
              </div>
            </div>
          </div>

          {/* Column 4 — Creative Tools */}
          <div className="group cursor-pointer">
            <div className="flex items-center gap-1.5 mb-3">
              <h3
                className="text-[17px] font-medium text-[#080808]"
                style={{ fontFamily: "'Newsreader', 'Playfair Display', 'Instrument Serif', Georgia, serif" }}
              >
                Creative tools
              </h3>
              <span className="w-4 h-4 rounded-full bg-[#080808] text-white flex items-center justify-center transition-transform group-hover:scale-110">
                <ArrowUpRight size={10} strokeWidth={2.5} />
              </span>
            </div>

            {/* Miniature Illustrated Mockup Artifact */}
            <div className="w-[88px] h-[64px] relative mt-2 select-none pointer-events-none">
              {/* Back Card: Light folder / sticker mockup */}
              <div className="w-[56px] h-[52px] bg-[#EAEAEA] border border-[#D5D5D5] rounded-lg rotate-[6deg] absolute right-1 top-1 shadow-sm p-1.5 flex flex-col justify-between">
                <div className="w-4 h-1 bg-[#F59E0B]/60 rounded-[1px] mx-auto -mt-2" />
                <div className="grid grid-cols-2 gap-1 mt-auto mx-auto pb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899]" />
                </div>
              </div>

              {/* Front Card: Tilted dark mobile mockup */}
              <div className="w-[42px] h-[58px] bg-[#1E1E1E] border border-[#333333] rounded-md -rotate-[10deg] absolute left-1 top-0 shadow-md p-1 flex flex-col justify-between">
                <div className="w-3 h-0.5 bg-neutral-600 rounded-full mx-auto" />
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-400 mx-auto my-auto" />
                <div className="w-4 h-0.5 bg-neutral-600 rounded-full mx-auto" />
              </div>
            </div>
          </div>
        </div>

        {/* Giant Cropped Bottom Typography ("faizur") */}
        <div className="w-full overflow-hidden flex justify-center items-end select-none pointer-events-none mt-8 sm:mt-12 lg:mt-16">
          <span
            className="text-[clamp(110px,19vw,280px)] font-black leading-[0.74] tracking-[-0.045em] text-[#080808] transform translate-y-[14%] whitespace-nowrap block"
            style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', 'Syne', system-ui, sans-serif" }}
          >
            faizur
          </span>
        </div>
      </footer>
    </div>
  );
}`,
        vibePrompt: `Recreate the uploaded reference image as a pixel-accurate website footer.

IMPORTANT:
The uploaded image is the ONLY visual reference. Reproduce the same design, layout, proportions, typography, spacing, colors, shapes, and positioning. Do NOT redesign or modernize it.

========================
OVERALL FOOTER
========================

Create a large centered footer container.

- Background: #E7E7E7 approximately.
- Page background: very light/off-white, approximately #F8F8F8.
- Footer has large rounded corners: approximately 40px.
- Footer width: approximately 85% of the viewport.
- Footer is horizontally centered.
- Footer should have a fixed visual proportion similar to the reference.
- No shadow.
- Overflow hidden.

The bottom of the footer contains extremely large black typography that is intentionally cropped by the bottom edge.

========================
TOP LEFT BRAND
========================

At the upper-left area place:

"Your product
design partner"

- Two lines.
- Black text.
- Serif font.
- Approximately 26–28px.
- Medium/bold weight.
- Tight line-height.
- Position approximately 130px from the left edge.
- Position approximately 65px from the top.

========================
TOP RIGHT CONTACT BUTTON
========================

Create a very large outlined pill button:

"Contact"

- Position near the upper-right.
- Width approximately 230px.
- Height approximately 76px.
- Border: 2px solid black.
- Border-radius: 999px.
- Background transparent.
- Text black.
- Font size approximately 44px.
- Font weight: regular/medium.
- Center the text perfectly.

Do NOT use a filled button.

========================
MAIN NAVIGATION
========================

Below the top section create four columns.

Keep the columns horizontally aligned exactly like the reference.

COLUMN 1 — SERVICES

Heading:
"Services"

Links:
"Website Design"
"Mobile App Design"
"Sass/Dashboard"
"Consultant"

Style:
- Heading: black serif font, approximately 17px.
- Links: gray sans-serif font, approximately 13px.
- Line height approximately 25px.
- Links should have subtle vertical spacing.

COLUMN 2 — EXPLORE

Heading:
"Explore"

Links:
"All Projects"
"Newsletter"
"Contact"

Same typography and spacing as Services.

COLUMN 3 — SAY HELLO!

Heading:
"Say hello!"

Create small pill-shaped social buttons.

Include:
- X
- Instagram
- Dribbble
- YouTube
- Figma

Each social item should look like a small white/off-white pill.

- Rounded pill shape.
- Small social icon on the left.
- Small username text.
- Very subtle/no border.
- Approximately 90–100px wide depending on content.
- Height approximately 25px.
- Arrange the pills in multiple rows as shown in the reference.

Use:
"@fazurrehman"

as the username.

Keep the social buttons compact.

COLUMN 4 — CREATIVE TOOLS

Heading:
"Creative tools"

Place a small circular arrow icon next to the heading.

Below it place the small creative-tools illustration/image shown in the reference.

The illustration should appear approximately 80–100px wide.

Position and scale it exactly like the reference.

========================
LARGE TYPOGRAPHY
========================

This is one of the MOST IMPORTANT parts.

At the bottom of the footer place enormous black text:

"faizur"

The text must be extremely large and cropped by the bottom edge.

The reference shows only the upper portion of the giant word.

Requirements:

- Black: approximately #080808.
- Very large font size, approximately 300–360px depending on viewport.
- Extremely bold.
- Sans-serif.
- Tight letter spacing.
- Position horizontally so the word extends beyond both sides of the visible footer.
- The letters must be partially hidden by the footer's bottom edge.
- Do NOT allow the complete word to become visible.
- It should look intentionally oversized and editorial.

The giant typography is behind/under the upper footer content and should visually dominate the bottom section.

========================
EXACT VISUAL STRUCTURE
========================

The hierarchy should be:

┌─────────────────────────────────────────────┐
│ Brand                         CONTACT       │
│                                             │
│ Services   Explore   Say hello!  Creative   │
│ links      links     social       tools     │
│                                             │
│                                             │
│                                             │
│        HUGE CROPPED "faizur"               │
└─────────────────────────────────────────────┘

Do not change this structure.

========================
COLORS
========================

Use only colors visually present in the reference:

Page:
#F8F8F8

Footer:
#E7E7E7

Primary text:
#080808

Secondary text:
#666666

Social pill:
#F7F7F7

Avoid gradients.

Avoid unnecessary accent colors.

========================
TYPOGRAPHY
========================

The reference combines:

1. Serif typography for:
- "Your product design partner"
- Section headings

2. Clean sans-serif typography for:
- Navigation links
- Social usernames
- Contact button
- Giant bottom typography

Choose fonts that visually match the reference as closely as possible.

If the project already contains suitable fonts, use those instead of introducing unnecessary external fonts.

========================
SPACING
========================

Match the reference carefully.

Pay special attention to:

- Footer outer margins
- Footer corner radius
- Top padding
- Left/right padding
- Distance between brand and Contact button
- Distance between top area and navigation
- Column spacing
- Social pill spacing
- Position of creative tools
- Vertical position of giant typography

Do not use arbitrary evenly spaced columns if they don't match the reference.

========================
RESPONSIVE
========================

DESKTOP:
Reproduce the reference as closely as possible.

TABLET:
Scale the footer proportionally while maintaining the same hierarchy.

MOBILE:
Stack the navigation sections vertically.

Keep:
- Brand at top
- Contact button below/near brand
- Services
- Explore
- Say hello
- Creative tools
- Giant cropped typography at bottom

The giant typography should remain intentionally oversized and cropped.

========================
PIXEL-PERFECT REQUIREMENT
========================

After implementing the footer, compare the rendered result against the uploaded reference image.

Iteratively adjust:

- Width
- Height
- Border radius
- Background color
- Brand position
- Contact button dimensions
- Contact font size
- Column positions
- Typography
- Social pill dimensions
- Creative-tools image size
- Giant "faizur" font size
- Giant typography position
- Bottom cropping
- All spacing

Do not settle for a generic footer.

The final result should visually look like the uploaded reference.

IMPORTANT:
Do NOT add:
- gradients
- shadows
- extra sections
- extra buttons
- animations
- decorative elements
- cards
- borders that aren't visible in the reference

Only recreate what exists in the reference.

Use clean production-quality HTML/CSS/React code according to the existing project.
Do not modify unrelated parts of the website.

Live Link: https://ai.studio/apps/3a30febb-b24a-4b58-925a-0413fcf885cb`,
    },

];
