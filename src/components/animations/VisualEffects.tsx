import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring } from 'motion/react';
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

// 1. Liquid-Glass (Weather Dashboard Example)
export interface LiquidGlassProps {
    backgroundImage?: string;
    className?: string;
}

export const LiquidGlass = ({
    backgroundImage = "url('https://images.unsplash.com/photo-1590867286251-8e26d9f255c0?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
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
                        <div className='text-4xl font-semibold'>+18°C</div>
                        <div className='text-sm opacity-70'>Cloudy +18°/+5°</div>
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
                            Surat
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

// 2. Noise
export interface NoiseProps {
    initialOpacity?: number;
    baseFrequency?: string;
    numOctaves?: string;
    className?: string;
}

export const Noise = ({
    initialOpacity = 0.05,
    baseFrequency = "0.65",
    numOctaves = "3",
    className = ""
}: NoiseProps) => {
    const [opacity, setOpacity] = useState(initialOpacity);

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
                    value={opacity}
                    onChange={(e) => setOpacity(parseFloat(e.target.value))}
                    className="w-20 accent-cyan-400"
                />
                <span className='text-[10px] font-mono text-cyan-400 w-8'>{opacity.toFixed(2)}</span>
            </div>

            <div
                className="absolute inset-0 z-10 pointer-events-none opacity-[0.05] mix-blend-overlay"
                style={{
                    opacity: opacity,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='${baseFrequency}' numOctaves='${numOctaves}' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
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
};

// 3. Blur Vignette
import { BlurVignette, BlurVignetteArticle } from '../ui/blur-vignette';

export interface BlurVignetteEffectProps {
    blur?: string;
    radius?: string;
    className?: string;
}

export const BlurVignetteEffect = ({
    blur = "12px",
    radius = "16px",
    className = ""
}: BlurVignetteEffectProps) => {
    return (
        <div className={cn('w-full max-w-2xl mx-auto flex gap-4 justify-center p-4 bg-neutral-900/50 rounded-2xl border border-white/5', className)}>
            <BlurVignette
                radius={radius}
                inset='0px'
                transitionLength='100px'
                blur={blur}
                className="flex-1 aspect-square"
            >
                <img
                    src='https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000&auto=format&fit=crop'
                    alt='abstract'
                    className='w-full h-full object-cover'
                />
                <BlurVignetteArticle classname='absolute inset-x-2 bottom-2 p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md text-white'>
                    <h3 className='text-lg font-bold'>Cosmos</h3>
                    <p className='text-xs text-white/60 line-clamp-2'>
                        Deep space explorations and mesmerizing cosmic patterns.
                    </p>
                </BlurVignetteArticle>
            </BlurVignette>

            <BlurVignette
                radius='16px'
                inset='0px'
                transitionLength='100px'
                blur='12px'
                className="flex-1 aspect-square hidden sm:block"
            >
                <img
                    src='https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop'
                    alt='abstract'
                    className='w-full h-full object-cover'
                />
                <BlurVignetteArticle classname='absolute inset-x-2 bottom-2 p-4 border border-white/10 rounded-xl bg-black/20 backdrop-blur-md text-white'>
                    <h3 className='text-lg font-bold'>Abstract</h3>
                    <p className='text-xs text-white/60 line-clamp-2'>
                        Flowing gradients and organic shapes in motion.
                    </p>
                </BlurVignetteArticle>
            </BlurVignette>
        </div>
    );
};

// 4. Liquid Gradient
export interface LiquidGradientProps {
    color?: string;
    opacity?: number;
    duration?: number;
    className?: string;
}

export const LiquidGradient = ({
    color = "#ff0080",
    opacity = 0.3,
    duration = 10,
    className = ""
}: LiquidGradientProps) => (
    <div className={cn("w-64 h-64 rounded-3xl overflow-hidden border border-white/10 relative bg-neutral-950", className)}>
        <motion.div
            animate={{
                background: [
                    `radial-gradient(at 0% 0%, ${color} 0px, transparent 50%)`,
                    `radial-gradient(at 100% 100%, ${color} 0px, transparent 50%)`,
                    `radial-gradient(at 0% 100%, ${color} 0px, transparent 50%)`,
                    `radial-gradient(at 0% 0%, ${color} 0px, transparent 50%)`,
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
);

// 5. Spotlight Cards
export interface SpotlightCardsProps {
    className?: string;
    defaultCardColors?: string[];
}

export const SpotlightCards = ({
    className = "",
    defaultCardColors = ['#10b981', '#6366f1', '#f59e0b']
}: SpotlightCardsProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const overlayScrollRef = useRef<HTMLDivElement>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    // Playground State
    const [cardColors, setCardColors] = useState(defaultCardColors);


    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    const handleScroll = () => {
        if (scrollRef.current && overlayScrollRef.current) {
            overlayScrollRef.current.scrollLeft = scrollRef.current.scrollLeft;
        }
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
            hex: cardColors[0] + "66", // 40% opacity
            border: cardColors[0] + "cc", // 80% opacity
            accent: cardColors[0],
            bg: cardColors[0] + "1a", // 10% opacity
            bullets: ["Optimized rendering", "Minimal bundle size"]
        },
        {
            title: "Design",
            text: "Beautiful, accessible components with smooth animations.",
            icon: Sparkles,
            hex: cardColors[1] + "66", // 40% opacity
            border: cardColors[1] + "cc", // 80% opacity
            accent: cardColors[1],
            bg: cardColors[1] + "1a", // 10% opacity
            bullets: ["Elegant animations", "Accessibility first"]
        },
        {
            title: "Premium",
            text: "Enterprise-grade components with advanced features.",
            icon: Crown,
            hex: cardColors[2] + "66", // 40% opacity
            border: cardColors[2] + "cc", // 80% opacity
            accent: cardColors[2],
            bg: cardColors[2] + "1a", // 10% opacity
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
                                        className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-lg"
                                    />
                                    <input
                                        type="text"
                                        value={cardColors[i]}
                                        onChange={e => {
                                            const newColors = [...cardColors];
                                            newColors[i] = e.target.value;
                                            setCardColors(newColors);
                                        }}
                                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white w-full font-mono focus:outline-none focus:border-white/30 focus:bg-white/10 transition-colors"
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
                <button
                    onClick={scrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-xl"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={scrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:-translate-x-8 z-30 p-3 bg-neutral-900/80 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-neutral-800 transition-colors backdrop-blur-md opacity-0 group-hover:opacity-100 shadow-xl"
                >
                    <ChevronRight size={24} />
                </button>

                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-6 p-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden scroll-smooth"
                >
                    {cards.map((card, i) => (
                        {/* Minimal Bottom Glow */ }
                        < div
                                className = "absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 opacity-30 group-hover/card:opacity-80 transition-opacity duration-500 pointer-events-none"
                                style = {{
                        background: `radial-gradient(ellipse at bottom, ${card.hex} 0%, transparent 60%)`
                    }}
                            />
                    <div
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] opacity-50 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
                        style={{
                            background: `linear-gradient(to right, transparent, ${card.accent}, transparent)`
                        }}
                    />

                    <div className="relative z-20 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                                <card.icon size={24} style={{ color: card.accent }} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
                        </div>

                        <h3 className="text-3xl font-display font-black mb-3 text-white tracking-tight">
                            {card.title}
                        </h3>
                        <p className="text-sm text-white/50 leading-relaxed mb-6 font-medium">
                            {card.text}
                        </p>

                        <ul className="mt-auto space-y-3">
                            {card.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-xs text-white/40 font-medium">
                                    <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                    </div>
                                    {bullet}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                    ))}
            </div>

            {/* Global Overlay for Perfectly Synchronized Border Glow & Illumination */}
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-500 z-10"
                style={{
                    opacity: isHovered ? 1 : 0,
                    WebkitMaskImage: `radial-gradient(25rem 25rem at ${mousePos.x}px ${mousePos.y}px, black 1%, transparent 50%)`,
                    maskImage: `radial-gradient(25rem 25rem at ${mousePos.x}px ${mousePos.y}px, black 1%, transparent 50%)`,
                }}
            >
                <div
                    ref={overlayScrollRef}
                    className="flex gap-6 p-6 overflow-x-hidden w-full h-full"
                >
                    {cards.map((card, i) => (
                        <div
                            key={`glow-${i}`}
                            className={`flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] snap-center p-8 rounded-[2.5rem] relative transition-all duration-400 ease-out`}
                            style={{
                                border: `1px solid ${card.accent}`,
                                backgroundColor: `${card.accent}15`,
                                boxShadow: `0 0 0 1px inset ${card.accent}`,
                            }}
                        >
                            <div className="relative z-20 flex flex-col h-full pointer-events-none">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/5" style={{ backgroundColor: card.bg }}>
                                        <card.icon size={24} style={{ color: card.accent }} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40">UILAYOUT</span>
                                </div>

                                <h3 className="text-3xl font-display font-black mb-3 text-white tracking-tight">
                                    {card.title}
                                </h3>
                                <p className="text-sm text-white/50 leading-relaxed mb-6 font-medium">
                                    {card.text}
                                </p>

                                <ul className="mt-auto space-y-3">
                                    {card.bullets.map((bullet, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-xs text-white/40 font-medium">
                                            <div className="w-4 h-4 rounded-full border border-white/10 flex items-center justify-center">
                                                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                                            </div>
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        </div >
    );
};

// 6. Image Reveal
import { useMotionValue, useSpring } from "framer-motion";

// 6. Image Reveal
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
    className = ""
}: ImageRevealProps) => {
    const [focusedItem, setFocusedItem] = useState<VisualItem | null>(null);
    const [isLargeScreen, setIsLargeScreen] = useState(true);

    const cursorX = useMotionValue(0);
    const cursorY = useMotionValue(0);
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

// 7. Blocks
export interface BlocksProps {
    className?: string;
    hoverColor?: string;
    gridSize?: number;
}

export const Blocks = ({
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
);

// 8. Animated Beam
export interface AnimatedBeamProps {
    color?: string;
    duration?: number;
    className?: string;
}

export const AnimatedBeam = ({
    color = "sky-400",
    duration = 2,
    className = ""
}: AnimatedBeamProps) => (
    <div className={cn("w-64 h-64 rounded-3xl bg-neutral-900 border border-white/10 relative overflow-hidden flex items-center justify-center", className)}>
        <motion.div
            animate={{
                x: [-100, 300],
            }}
            transition={{ duration, repeat: Infinity, ease: "linear" }}
            className={cn("absolute h-[2px] w-24 bg-gradient-to-r from-transparent to-transparent", `via-${color}`)}
            style={{ transform: 'rotate(-45deg)' }}
        />
        <div className={cn("font-display text-2xl font-bold uppercase", `text-${color}`)}>BEAM</div>
    </div>
);

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

// 11. Grid Background
export interface GridBackgroundProps {
    gridSize?: number;
    gridColor?: string;
    className?: string;
    label?: string;
}

export const GridBackground = ({
    gridSize = 24,
    gridColor = "#80808012",
    className = "",
    label = "GRID ALIVE"
}: GridBackgroundProps) => (
    <div className={cn("w-full h-64 rounded-3xl border border-white/10 overflow-hidden relative bg-neutral-950 flex items-center justify-center isolate", className)}>
        <div
            className="absolute inset-0 z-[-1] h-full w-full bg-[linear-gradient(to_right,var(--grid-color)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"
            style={{
                backgroundSize: `${gridSize}px ${gridSize}px`,
                // @ts-ignore
                "--grid-color": gridColor
            }}
        ></div>
        <div className="text-white/40 font-display text-2xl font-bold uppercase tracking-widest">{label}</div>
    </div>
);

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

export const GlowButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="px-6 py-3 rounded-full bg-green-500 text-black font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all">
            Glow Button
        </button>
    </div>
);

export const BorderBeam = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <button className="relative px-8 py-3 rounded-xl bg-black text-white font-bold tracking-widest uppercase overflow-hidden transition-all hover:bg-neutral-900">
            Border Beam
            <BorderBeamUI size={100} duration={8} delay={0} colorFrom="#ffaa40" colorTo="#9c40ff" beamBorderRadius={12} borderThickness={2} />
        </button>
    </div>
);

import { ShatterButton as ShatterButtonUI } from '../ui/shatter-button';

export const ShatterButton = () => (
    <div className="flex items-center justify-center p-8 bg-neutral-900 rounded-3xl border border-white/5 w-full h-64">
        <ShatterButtonUI shatterColor="#00ffff" shardCount={30}>
            Click Now
        </ShatterButtonUI>
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
        <PaymentTransactionButtonUI />
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

