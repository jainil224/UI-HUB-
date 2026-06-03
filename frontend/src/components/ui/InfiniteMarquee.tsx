import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export interface MarqueeItem {
    text: string;
    link?: string;
    image?: string;
}

export interface InfiniteMarqueeProps {
    items?: MarqueeItem[];
    speed?: number;
    textColor?: string;
    bgColor?: string;
    marqueeTextColor?: string;
    marqueeBgColor?: string;
    borderColor?: string;
    repeats?: number;
}

const DEFAULT_ITEMS: MarqueeItem[] = [
    { text: "Grow", link: "#", image: "https://picsum.photos/600/400?random=1" },
    { text: "Learn", link: "#", image: "https://picsum.photos/600/400?random=2" },
    { text: "Build", link: "#", image: "https://picsum.photos/600/400?random=3" },
    { text: "Animmaster", link: "#", image: "https://picsum.photos/600/400?random=4" }
];

export const InfiniteMarquee: React.FC<InfiniteMarqueeProps> = ({
    items = DEFAULT_ITEMS,
    speed = 15,
    textColor = '#ffffff',
    bgColor = '#060010',
    marqueeTextColor = '#060010',
    marqueeBgColor = '#ffffff',
    borderColor = 'rgba(255, 255, 255, 0.1)',
    repeats = 5
}) => {
    return (
        <div 
            className="menu-wrap" 
            style={{ 
                backgroundColor: bgColor,
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius: '16px'
            }}
        >
            <style>{`
                .menu-wrap {
                    font-family: 'Inter', sans-serif;
                }
                .menu {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    height: 100%;
                    padding: 40px 0;
                }
                .menu__item {
                    flex: 1;
                    position: relative;
                    overflow: hidden;
                    text-align: center;
                    border-top: 1px solid var(--border-color);
                    padding-top: 24px;
                    padding-bottom: 24px;
                    transition: border-color 0.3s ease;
                }
                .menu__item:last-child {
                    border-bottom: 1px solid var(--border-color);
                }
                .menu__item-link {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    position: relative;
                    cursor: pointer;
                    text-transform: uppercase;
                    text-decoration: none;
                    white-space: nowrap;
                    font-weight: 700;
                    font-size: 5.5vh;
                    line-height: 1.2;
                    transition: color 0.3s ease;
                }
                .marquee-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    overflow: hidden;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    transform: translate3d(0, 101%, 0);
                    display: flex;
                    align-items: center;
                }
                .marquee__inner-wrap {
                    height: 100%;
                    width: 100%;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }
                .marquee__inner {
                    display: flex;
                    align-items: center;
                    position: relative;
                    height: 100%;
                    width: fit-content;
                    will-change: transform;
                }
                .marquee__part {
                    display: flex;
                    align-items: center;
                    flex-shrink: 0;
                }
                .marquee-text-span {
                    white-space: nowrap;
                    text-transform: uppercase;
                    font-weight: 800;
                    font-size: 5.5vh;
                    line-height: 1;
                    padding: 0 2vw;
                }
                .marquee__img {
                    width: 10rem;
                    height: 56px;
                    margin: 0 1vw;
                    border-radius: 28px;
                    background-size: cover;
                    background-position: 50% 50%;
                    flex-shrink: 0;
                }
                @media (max-height: 600px) {
                    .menu__item-link, .marquee-text-span {
                        font-size: 4vh;
                    }
                    .marquee__img {
                        height: 40px;
                        width: 8rem;
                    }
                    .menu__item {
                        padding-top: 16px;
                        padding-bottom: 16px;
                    }
                }
            `}</style>
            
            <nav className="menu" style={{ ['--border-color' as any]: borderColor }}>
                {items.map((item, index) => (
                    <PlaylistItem 
                        key={index}
                        item={item} 
                        speed={speed}
                        textColor={textColor}
                        marqueeTextColor={marqueeTextColor}
                        marqueeBgColor={marqueeBgColor}
                        repeats={repeats}
                    />
                ))}
            </nav>
        </div>
    );
};

interface PlaylistItemProps {
    item: MarqueeItem;
    speed: number;
    textColor: string;
    marqueeTextColor: string;
    marqueeBgColor: string;
    repeats: number;
}

const PlaylistItem: React.FC<PlaylistItemProps> = ({
    item,
    speed,
    textColor,
    marqueeTextColor,
    marqueeBgColor,
    repeats
}) => {
    const itemRef = useRef<HTMLDivElement>(null);
    const marqueeRef = useRef<HTMLDivElement>(null);
    const marqueeInnerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const marqueeInner = marqueeInnerRef.current;
        if (!marqueeInner) return;

        // Horizontally translate marquee content infinitely
        let ctx = gsap.context(() => {
            const width = marqueeInner.scrollWidth / 2;
            gsap.to(marqueeInner, {
                x: -width,
                duration: speed,
                ease: 'none',
                repeat: -1,
            });
        }, marqueeInner);

        return () => ctx.revert();
    }, [speed, repeats]);

    const handleMouseEnter = (ev: React.MouseEvent) => {
        const el = itemRef.current;
        const marquee = marqueeRef.current;
        const marqueeInner = marqueeInnerRef.current;
        if (!el || !marquee || !marqueeInner) return;

        const rect = el.getBoundingClientRect();
        const edge = ev.clientY - rect.top < rect.height / 2 ? 'top' : 'bottom';

        const animationDefaults = { duration: 0.5, ease: 'power3.out' };

        gsap.killTweensOf([marquee, marqueeInner]);
        gsap.set(marquee, { y: edge === 'top' ? '-101%' : '101%' });
        gsap.set(marqueeInner, { y: edge === 'top' ? '101%' : '-101%' });
        gsap.to([marquee, marqueeInner], { y: '0%', ...animationDefaults });
    };

    const handleMouseLeave = (ev: React.MouseEvent) => {
        const el = itemRef.current;
        const marquee = marqueeRef.current;
        const marqueeInner = marqueeInnerRef.current;
        if (!el || !marquee || !marqueeInner) return;

        const rect = el.getBoundingClientRect();
        const edge = ev.clientY - rect.top < rect.height / 2 ? 'top' : 'bottom';

        const animationDefaults = { duration: 0.5, ease: 'power3.out' };

        gsap.killTweensOf([marquee, marqueeInner]);
        gsap.to(marquee, {
            y: edge === 'top' ? '-101%' : '101%',
            ...animationDefaults,
        });
        gsap.to(marqueeInner, {
            y: edge === 'top' ? '101%' : '-101%',
            ...animationDefaults,
        });
    };

    return (
        <div 
            ref={itemRef} 
            className="menu__item"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <a href={item.link || '#'} className="menu__item-link" style={{ color: textColor }}>
                {item.text}
            </a>
            
            <div 
                ref={marqueeRef} 
                className="marquee-overlay" 
                style={{ backgroundColor: marqueeBgColor }}
            >
                <div className="marquee__inner-wrap">
                    <div ref={marqueeInnerRef} className="marquee__inner">
                        {/* Render duplicates of marquee items to fill loop width */}
                        {Array.from({ length: repeats * 2 }).map((_, i) => (
                            <div key={i} className="marquee__part">
                                <span className="marquee-text-span" style={{ color: marqueeTextColor }}>
                                    {item.text}
                                </span>
                                {item.image && (
                                    <div 
                                        className="marquee__img" 
                                        style={{ backgroundImage: `url(${item.image})` }}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InfiniteMarquee;
