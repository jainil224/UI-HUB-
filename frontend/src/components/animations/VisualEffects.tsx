import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { SocialTooltipButtons } from './SocialTooltipButtons';
export { SocialTooltipButtons };
import { LiquidGlassCard } from '../ui/LiquidGlassCard';
import {
    Cloud,
    CloudSun,
    CloudRain,
    Sun,
    MapPin,
    CloudSunRain,
    Zap,
    Sparkles,
    Crown,
    ChevronLeft,
    ChevronRight,
    MoveUpRight as ArrowIcon
} from 'lucide-react';
import { PaymentTransactionButton as PaymentTransactionButtonUI } from '../ui/payment-transaction-button';
import { MagicCard as MagicCardUI } from '../ui/magic-card';
import { RainbowButton as RainbowButtonUI } from '../ui/rainbow-button';
import { OrbitButton as OrbitButtonUI } from '../ui/OrbitButton';
import { GalaxyButton as GalaxyButtonUI } from '../ui/GalaxyButton';
import { LiquidFillButton as LiquidFillButtonUI } from '../ui/LiquidFillButton';
import { NeonFlickerButton as NeonFlickerButtonUI } from '../ui/NeonFlickerButton';
import { Robot3DBackground as Robot3DBackgroundUI } from '../ui/Robot3DBackground';

export { OrbitButtonUI as OrbitButton };
export { GalaxyButtonUI as GalaxyButton };
export { LiquidFillButtonUI as LiquidFillButton };
export { NeonFlickerButtonUI as NeonFlickerButton };
export { Robot3DBackgroundUI as Robot3DBackground };

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    location?: string;
    temp?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
    location = "Surat",
    temp = "+18°C",
    className = ""
}: LiquidGlassProps) => {
    return (
        <div
            className={cn('p-4 relative z-30 w-full max-w-2xl gap-8 py-8 rounded-xl overflow-hidden', className)}
            style={{
                background: `${backgroundImage} center / cover no-repeat`,
            }}
        >
            <div className='grid w-full grid-cols-2 gap-4 mx-auto'>
                {/* Hourly Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 p-6 text-white bg-white/5'
                >
                    <div className='flex justify-between relative z-30 text-sm font-medium'>
                        <div className='flex flex-col items-center gap-2'>
                            <span>16:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>17:00</span>
                            <Cloud className='h-6 w-6 fill-white' />
                            <span>+18°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>18:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+16°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>19:00</span>
                            <CloudRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>20:00</span>
                            <CloudSun className='h-6 w-6 fill-white' />
                            <span>+15°</span>
                        </div>
                        <div className='flex flex-col items-center gap-2'>
                            <span>21:00</span>
                            <CloudSunRain className='h-6 w-6' />
                            <span>+14°</span>
                        </div>
                    </div>
                </LiquidGlassCard>

                {/* Current Weather Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5 '
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>{temp}</div>
                        <div className='text-sm opacity-70'>Cloudy {temp}/+5°</div>
                    </div>
                </LiquidGlassCard>

                {/* Time and Location Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='rounded-3xl p-6 text-white bg-white/5'
                >
                    <div className='relative z-30 flex flex-col items-start justify-center h-full w-full'>
                        <div className='text-4xl font-semibold'>17:32</div>
                        <div className='text-sm opacity-70'>Sun, Nov 19</div>
                        <button className='mt-2 inline-flex items-center gap-1 rounded-full bg-black/20 backdrop-blur-xl px-2 py-0.5 text-xs font-medium'>
                            <MapPin className='h-3 w-3' />
                            {location}
                        </button>
                    </div>
                </LiquidGlassCard>

                {/* Daily Forecast Card */}
                <LiquidGlassCard
                    shadowIntensity='xs'
                    borderRadius='8px'
                    glowIntensity='none'
                    className='col-span-2 rounded-3xl bg-white/5 p-6 text-white'
                >
                    <div className='relative z-30 flex flex-col gap-3 h-full w-full'>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Sun className='h-5 w-5 fill-white' />
                                <span>Tue, 7 Sep</span>
                            </div>
                            <span className='font-medium'>+18°/+4°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <Cloud className='h-5 w-5 fill-white' />
                                <span>Wed, 8 Sep</span>
                            </div>
                            <span className='font-medium'>+20°/+6°</span>
                        </div>
                        <div className='flex items-center justify-between text-sm'>
                            <div className='flex items-center gap-2'>
                                <CloudRain className='h-5 w-5' />
                                <span>Thu, 9 Sep</span>
                            </div>
                            <span className='font-medium'>+17°/+3°</span>
                        </div>
                    </div>
                </LiquidGlassCard>
            </div>
        </div>
    );
};







// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
    title?: string;
    description?: string;
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b'],
    title = "Platform Features",
    description = "Discover the power of our high-performance component library."
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);

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

    const scrollLeft = () => {
        scrollRef.current?.scrollBy({ left: -350, behavior: 'smooth' });
    };

    const scrollRight = () => {
        scrollRef.current?.scrollBy({ left: 350, behavior: 'smooth' });
    };

    const cards = [
        {
            title: "Performance",
            text: "Lightning-fast components built for modern web applications.",
            icon: Zap,
            hex: cardColors[0] + "66",
            accent: cardColors[0],
            bg: cardColors[0] + "1a",
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66",
            accent: cardColors[1],
            bg: cardColors[1] + "1a",
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66",
            accent: cardColors[2],
            bg: cardColors[2] + "1a",
            bullets: ["Enterprise support", "Advanced features"]
        },
    ];

    return (
        <div className="flex flex-col items-center w-full relative z-30">
            {/* Live Playground Controls */}
            <div className="w-full max-w-5xl mb-8 p-8 rounded-[2rem] bg-neutral-900 border border-white/5 backdrop-blur-sm shadow-xl">
                <div className="flex flex-col gap-6">
                    <h3 className="text-2xl font-display font-bold text-white tracking-tight">Live Playground</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((num, i) => (
                            <div key={num} className="space-y-3">
                                <label className="text-xs font-bold uppercase tracking-wider text-white/50">Card {num} Glow Color</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div
                ref={containerRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className="w-full max-w-5xl relative group"
            >
                {/* Arrows */}
                <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft size={24} />
                </button>
                <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        <CardItem 
                            key={i} 
                            card={card} 
                            globalMousePos={mousePos} 
                            isParentHovered={isHovered}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Internal Helper Card Component for 100% Alignment Consistency
const CardItem: React.FC<{ 
    card: any; 
    globalMousePos: { x: number; y: number }; 
    isParentHovered: boolean;
}> = ({ card, globalMousePos, isParentHovered }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [localMousePos, setLocalMousePos] = useState({ x: -1000, y: -1000 });

    useEffect(() => {
        if (!cardRef.current) return;
        const updateLocalPos = () => {
            if (!cardRef.current) return;
            const cardRect = cardRef.current.getBoundingClientRect();
            const containerRect = cardRef.current.closest('.group')?.getBoundingClientRect();
            if (containerRect) {
                setLocalMousePos({
                    x: globalMousePos.x - (cardRect.left - containerRect.left),
                    y: globalMousePos.y - (cardRect.top - containerRect.top)
                });
            }
        };
        updateLocalPos();
    }, [globalMousePos]);

    const CardInner = ({ highlighted = false }: { highlighted?: boolean }) => (
        <div className={cn("relative z-20 flex flex-col h-full", highlighted ? "pointer-events-none" : "")}>
            <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                    <card.icon size={24} style={{ color: card.accent }} />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
            </div>

            <h3 className={cn("text-3xl font-display font-black mb-3 tracking-tight transition-colors", 
                highlighted ? "text-white" : "text-white/30 group-hover/card:text-white/40")}>
                {card.title}
            </h3>
            <p className={cn("text-sm leading-relaxed mb-6 font-medium transition-colors", 
                highlighted ? "text-white/90" : "text-white/20 group-hover/card:text-white/30")}>
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
        <div ref={cardRef} className="relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] bg-neutral-900 border border-white/5 overflow-hidden group/card shadow-xl transition-all duration-400 ease-out">
            <CardInner />
            <div 
                className="absolute inset-0 transition-opacity duration-500 z-10"
                style={{
                    opacity: isParentHovered ? 1 : 0,
                    WebkitMaskImage: `radial-gradient(circle 35rem at ${localMousePos.x}px ${localMousePos.y}px, black 0%, transparent 70%)`,
                    maskImage: `radial-gradient(circle 35rem at ${localMousePos.x}px ${localMousePos.y}px, black 0%, transparent 70%)`,
                    backgroundColor: `${card.accent}10`,
                    padding: '2rem',
                    border: `1px solid ${card.accent}`,
                    borderRadius: '2.5rem',
                }}
            >
                <CardInner highlighted />
            </div>
            {/* Ambient Base Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity pointer-events-none" style={{ background: `radial-gradient(ellipse at bottom, ${card.hex} 0%, transparent 60%)` }} />
        </div>
    );
};

// 6. Image Reveal
// 6. Image Reveal
interface VisualItem {
    key: number;
    url: string;
    label: string;
}
const visualData: VisualItem[] = [
    {
        key: 1,
        url: "https://images.pexels.com/photos/9002742/pexels-photo-9002742.jpeg",
        label: "Pinky Island",
    },
    {
        key: 2,
        url: "https://images.pexels.com/photos/31622979/pexels-photo-31622979.jpeg",
        label: "Greedy Model",
    },
    {
        key: 3,
        url: "https://images.pexels.com/photos/12187128/pexels-photo-12187128.jpeg",
        label: "Sigma Connect",
    },
    {
        key: 4,
        url: "https://images.pexels.com/photos/28168248/pexels-photo-28168248.jpeg",
        label: "Futuristic Gamma",
    },
];

export interface ImageRevealProps {
    items?: VisualItem[];
    className?: string;
}

export const ImageReveal = ({
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

    const onHoverActivate = (item: VisualItem) => {
        setFocusedItem(item);
    };

    const onHoverDeactivate = () => {
        setFocusedItem(null);
    };

    return (
        <div
            className={cn("relative mx-auto w-full max-w-2xl min-h-fit bg-neutral-950 rounded-xl border border-white/10 overflow-hidden", className)}
            onMouseMove={onMouseTrack}
            onMouseLeave={onHoverDeactivate}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className="p-6 cursor-pointer relative sm:flex items-center justify-between border-b border-white/5 last:border-0"
                    onMouseEnter={() => onHoverActivate(item)}
                >
                    {!isLargeScreen && (
                        <img
                            src={item.url}
                            className="sm:w-32 sm:h-20 w-full h-52 object-cover rounded-md mb-4"
                            alt={item.label}
                        />
                    )}
                    <h2
                        className={`font-display uppercase md:text-5xl sm:text-2xl text-xl font-bold sm:py-6 py-2 leading-[100%] relative transition-colors duration-300 ${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 text-white"
                            : "text-white/60"
                            }`}
                    >
                        {item.label}
                    </h2>
                    <button
                        className={`sm:block hidden p-4 rounded-full transition-all duration-300 ease-out border border-transparent ${focusedItem?.key === item.key
                            ? "mix-blend-difference z-20 bg-white text-black border-white"
                            : "text-white/20 border-white/10"
                            }`}
                    >
                        <ArrowIcon className="w-8 h-8" />
                    </button>
                    <div
                        className={`h-[2px] bg-white absolute bottom-0 left-0 transition-all duration-300 ease-linear ${focusedItem?.key === item.key ? "w-full" : "w-0"
                            }`}
                    />
                </div>
            ))}

            {isLargeScreen && focusedItem && (
                <motion.img
                    src={focusedItem.url}
                    alt={focusedItem.label}
                    className="fixed z-30 object-cover w-[300px] h-[400px] rounded-2xl pointer-events-none shadow-2xl bg-neutral-900 border border-white/10"
                    style={{
                        left: smoothX,
                        top: smoothY,
                        x: "-50%",
                        y: "-50%",
                    }}
                    initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            )}
        </div>
    );
};





// 10. Hacker Background (Matrix Rain)
export interface HackerBackgroundProps {
    color?: string;
    fontSize?: number;
    className?: string;
    speed?: number;
}

export const HackerBackground = ({
    color = '#0F0',
    fontSize = 15,
    className = "",
    speed = 1
}: HackerBackgroundProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.width = canvas.parentElement?.clientWidth || 400;
        let height = canvas.height = canvas.parentElement?.clientHeight || 400;

        const columns = Math.floor(width / 20);
        const drops: number[] = new Array(columns).fill(1);
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{ }<>[]^~";

        let animationFrameId: number;

        const draw = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = color;
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const text = chars[Math.floor(Math.random() * chars.length)];
                ctx.fillText(text, i * 20, drops[i] * 20);

                if (drops[i] * 20 > height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i] += speed;
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        const handleResize = () => {
            width = canvas.width = canvas.parentElement?.clientWidth || 400;
            height = canvas.height = canvas.parentElement?.clientHeight || 400;
        };

        window.addEventListener('resize', handleResize);
        draw();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className={cn("w-full h-full bg-black relative overflow-hidden", className)}>
            <canvas ref={canvasRef} className="absolute inset-0" />
        </div>
    );
};



export { default as BeamGridBackground } from '../ui/BeamGridBackground';

export { default as FallBeamBackground } from '../ui/FallBeamBackground';
export { default as HellBackground } from '../ui/HellBackground';
export { default as InteractiveGridBackground } from '../ui/InteractiveGridBackground';
export { default as ParticlesBackground } from '../ui/ParticlesBackground';
export { default as WaveBackground } from '../ui/WaveBackground';
export { default as LinesBackground } from '../ui/background-paths';
export { default as SparklesBackground } from '../ui/sparkles-background';
export { IsometricGridBackground } from '../ui/isometric-grid-background';

// Button Previews
import { BorderBeam as BorderBeamUI } from '../ui/border-beam';
import InteractiveHoverButtonUI from '../ui/interactive-hover-button';
import { Github } from 'lucide-react';

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
                        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.2) 0%, transparent 60%)`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)`,
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
};

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);


import { CornerBorderButton as CornerBorderButtonUI } from '../ui/corner-border-button';

export const CornerBorderButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <CornerBorderButtonUI baseColor="#0b1a2a" hoverColor="#ff3b4d" borderColor="#60daff">
            BUTTON
        </CornerBorderButtonUI>
    </div>
);

import { MarqueeHoverButton as MarqueeHoverButtonUI } from '../ui/marquee-hover-button';

export const MarqueeHoverButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <MarqueeHoverButtonUI label="Hover Me" />
    </div>
);

export const PaymentTransactionButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[300px]">
        <PaymentTransactionButtonUI label="Send Payment" accentColor="#38bdf8" currencySymbol="€" />
    </div>
);

export const MagicCardEffect = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-full min-h-[400px]">
        <MagicCardUI
            className="flex flex-col items-center justify-center cursor-pointer shadow-2xl bg-neutral-900/80 border-white/10"
            gradientColor="rgba(255, 255, 255, 0.15)"
            gradientFrom="#38bdf8"
            gradientTo="#818cf8"
            gradientSize={300}
        >
            <div className="p-16 flex flex-col items-center gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                    <Sparkles className="text-white w-8 h-8" />
                </div>
                <div>
                    <h3 className="text-4xl font-display font-bold text-white tracking-tight mb-2">Magic Card</h3>
                    <p className="text-white/60 text-base font-medium">Move your mouse to reveal the glow</p>
                </div>
            </div>
        </MagicCardUI>
    </div>
);

export const RainbowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <RainbowButtonUI>Rainbow Button</RainbowButtonUI>
    </div>
);

export const InteractiveHoverButton = () => (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-950 rounded-[3rem] border border-white/5 w-full min-h-[350px] gap-8 relative overflow-hidden group/container">
        {/* Ambient Background Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,159,0.02),transparent_70%)] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 z-10">
            {/* Neon variant (Explore Components style from image) */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Neon Green Variant</span>
                <InteractiveHoverButtonUI 
                    variant="neon"
                    text="Explore Components" 
                    loadingText="Loading..."
                    successText="Complete!"
                />
            </div>

            {/* Dark variant (View Source style from image) */}
            <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase">Dark GitHub Variant</span>
                <InteractiveHoverButtonUI 
                    variant="dark"
                    text="View Source" 
                    loadingText="Fetching..."
                    successText="Fetched!"
                    icon={<Github className="h-4 w-4" />}
                />
            </div>
        </div>
        
        {/* Background elements */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-brand-green/5 blur-[100px] rounded-full animate-pulse pointer-events-none" />
    </div>
);
