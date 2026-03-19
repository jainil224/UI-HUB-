import React, { useState, useCallback, useEffect, useRef } from 'react';

interface Slide {
    id: number;
    title: string;
    description: string;
    image: string;
    accentColor: string;
}

interface ThreeDSliderProps {
    /** Custom slides data */
    slides?: Slide[];
    /** Whether to auto-play (default false) */
    autoPlay?: boolean;
    /** Auto-play interval in ms (default 5000) */
    interval?: number;
    /** Optional class name */
    className?: string;
}

const DEFAULT_SLIDES: Slide[] = [
    {
        id: 1,
        title: "Wuthering Waves",
        description: "Experience a story-rich open-world action RPG with a high degree of freedom.",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/24686.jpg",
        accentColor: "#00f2ff" // Cyan
    },
    {
        id: 2,
        title: "Solo Leveling",
        description: "A world where hunters, humans with magical abilities, must battle deadly monsters.",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/24719.jpg",
        accentColor: "#a855f7" // Purple
    },
    {
        id: 3,
        title: "Where Winds Meet",
        description: "An epic open-world action-adventure RPG set in the twilight of the Ten Kingdoms.",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/24534.jpg",
        accentColor: "#fbbf24" // Amber/Gold
    },
    {
        id: 4,
        title: "Battlefield 2042",
        description: "Battlefield™ 2042 is a first-person shooter that marks the return to the iconic all-out warfare of the franchise.",
        image: "https://4kwallpapers.com/images/walls/thumbs_3t/24204.jpg",
        accentColor: "#f97316" // Orange
    },
    {
        id: 5,
        title: "Elden Ring",
        description: "Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.",
        image: "https://images.wallpapersden.com/image/download/elden-ring-game-2022_bWlsam6UmZqaraWkpJRmbmdlrWZnZ2U.jpg",
        accentColor: "#eab308" // Golden
    },
    {
        id: 6,
        title: "Black Myth: Wukong",
        description: "An action RPG rooted in Chinese mythology. The story is based on Journey to the West.",
        image: "https://images.wallpapersden.com/image/download/black-myth-wukong-warrior_bmVpZ2uUmZqaraWkpJRmbmdlrWZnZ2U.jpg",
        accentColor: "#ef4444" // Crimson
    }
];

/**
 * 3D Slider Component
 * A premium perspective-based slider where the active slide is full-screen 
 * while upcoming slides appear as smaller cards on the right.
 */
export const ThreeDSlider: React.FC<ThreeDSliderProps> = ({
    slides = DEFAULT_SLIDES,
    autoPlay = false,
    interval = 5000,
    className = ''
}) => {
    const [activeSlides, setActiveSlides] = useState<Slide[]>(slides);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const touchStartX = useRef(0);

    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveSlides(prev => {
            const newSlides = [...prev];
            const first = newSlides.shift();
            if (first) newSlides.push(first);
            return newSlides;
        });
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveSlides(prev => {
            const newSlides = [...prev];
            const last = newSlides.pop();
            if (last) newSlides.unshift(last);
            return newSlides;
        });
        setTimeout(() => setIsTransitioning(false), 500);
    }, [isTransitioning]);

    useEffect(() => {
        if (!autoPlay) return;
        const timer = setInterval(nextSlide, interval);
        return () => clearInterval(timer);
    }, [autoPlay, interval, nextSlide]);

    // Touch swipe handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        const diff = touchStartX.current - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextSlide();
            else prevSlide();
        }
    }, [nextSlide, prevSlide]);

    return (
        <div className={`relative w-full h-full overflow-hidden bg-[#0a0a0f] ${className}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <style>{`
                .hero-track {
                    position: relative;
                    width: 100%;
                    height: 100%;
                }

                .slide-card {
                    width: 200px;
                    height: 300px;
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    border-radius: 20px;
                    box-shadow: 0 30px 50px rgba(0,0,0,0.5);
                    background-position: 50% 50%;
                    background-size: cover;
                    display: inline-block;
                    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
                }

                /* Active Slide (Full Background) */
                .slide-card:nth-child(1),
                .slide-card:nth-child(2) {
                    top: 0;
                    left: 0;
                    transform: translateY(0);
                    border-radius: 0;
                    width: 100%;
                    height: 100%;
                    box-shadow: none;
                }

                /* Next Perspective Cards */
                .slide-card:nth-child(3) { left: 50%; opacity: 1; }
                .slide-card:nth-child(4) { left: calc(50% + 230px); opacity: 1; }
                .slide-card:nth-child(5) { left: calc(50% + 460px); opacity: 1; }
                .slide-card:nth-child(n + 6) { left: calc(50% + 690px); opacity: 0; }

                /* Overlay for legibility */
                .slide-card:nth-child(2)::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 40%, transparent 100%);
                    z-index: 1;
                    pointer-events: none;
                    animation: fadeIn 0.8s ease-out forwards;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                /* Text Content Animation */
                .slide-info {
                    position: absolute;
                    top: 50%;
                    left: 10%;
                    width: 500px;
                    text-align: left;
                    color: #fff;
                    transform: translateY(-50%);
                    font-family: 'Inter', sans-serif;
                    display: none;
                    z-index: 5;
                }

                /* Only show info for the 2nd child (current active) */
                .slide-card:nth-child(2) .slide-info {
                    display: block;
                }

                .slide-title {
                    font-size: 64px;
                    text-transform: uppercase;
                    font-weight: 900;
                    opacity: 0;
                    letter-spacing: -0.02em;
                    line-height: 1;
                    color: #fff;
                    filter: drop-shadow(0 0 20px var(--accent, #fff));
                    animation: slideUpFade 0.8s ease-out 0.2s 1 forwards;
                }

                .slide-desc {
                    margin-top: 15px;
                    margin-bottom: 30px;
                    font-size: 16px;
                    line-height: 1.6;
                    opacity: 0;
                    color: rgba(255,255,255,0.85);
                    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                    animation: slideUpFade 0.8s ease-out 0.4s 1 forwards;
                }

                .slide-info button {
                    padding: 12px 30px;
                    border: none;
                    cursor: pointer;
                    opacity: 0;
                    border-radius: 50px;
                    background: var(--accent, #fff);
                    color: #000;
                    font-weight: 800;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-size: 11px;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.3);
                    animation: slideUpFade 0.8s ease-out 0.6s 1 forwards;
                }

                .slide-info button:hover {
                    transform: scale(1.05);
                    box-shadow: 0 10px 20px rgba(255,255,255,0.2);
                }

                @keyframes slideUpFade {
                    from {
                        opacity: 0;
                        transform: translateY(40px);
                        filter: blur(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }

                /* Navigation Controls */
                .slider-controls {
                    position: absolute;
                    bottom: 30px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 15px;
                    z-index: 20;
                }

                .nav-btn {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.2);
                    background: rgba(255,255,255,0.1);
                    backdrop-filter: blur(10px);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    -webkit-tap-highlight-color: transparent;
                }

                .nav-btn:hover {
                    background: #fff;
                    color: #000;
                    transform: scale(1.1);
                }

                .nav-btn:active {
                    transform: scale(0.95);
                    background: rgba(255,255,255,0.3);
                }

                @media screen and (min-width: 641px) {
                    .slider-controls { bottom: 50px; gap: 20px; }
                    .nav-btn { width: 54px; height: 54px; }
                }

                @media screen and (max-width: 1024px) {
                    .slide-info { left: 5%; width: 80%; }
                    .slide-title { font-size: 42px; }
                    .slide-card { width: 160px; height: 240px; }
                    .slide-card:nth-child(3) { left: 60%; }
                    .slide-card:nth-child(4) { left: calc(60% + 180px); }
                    .slide-card:nth-child(5) { left: calc(60% + 360px); }
                }

                @media screen and (max-width: 640px) {
                    .slide-title { font-size: 32px; }
                    .slide-desc { font-size: 14px; }
                    .slide-card { display: none; } /* Hide cards on very small screens to focus on active content */
                    .slide-card:nth-child(1), .slide-card:nth-child(2) { display: block; }
                }
            `}</style>

            <div className="hero-track">
                {activeSlides.map((slide, index) => (
                    <div
                        key={`${slide.id}-${index}`}
                        className="slide-card"
                        style={{ 
                            backgroundImage: `url(${slide.image})`,
                            ['--accent' as any]: slide.accentColor 
                        }}
                    >
                        <div className="slide-info">
                            <h2 className="slide-title">{slide.title}</h2>
                            <p className="slide-desc">{slide.description}</p>
                            <button>Explore Now</button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="slider-controls">
                <button className="nav-btn" onClick={prevSlide} aria-label="Previous Slide">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                </button>
                <button className="nav-btn" onClick={nextSlide} aria-label="Next Slide">
                    <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                </button>
            </div>
        </div>
    );
};

export default ThreeDSlider;
