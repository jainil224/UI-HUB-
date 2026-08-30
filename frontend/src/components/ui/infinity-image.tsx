// Infinity Image — UI HUB
// High-performance figure-8 infinity loop thumbnail gallery

"use client"

import * as React from "react"
import { useEffect, useRef, useState, useMemo } from "react"

// Curated aesthetic image thumbnails
const DEFAULT_IMAGES = [
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80", alt: "Portrait 1" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80", alt: "Portrait 2" },
    { src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80", alt: "Fashion 3" },
    { src: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80", alt: "Urban 4" },
    { src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500&auto=format&fit=crop&q=80", alt: "Editorial 5" },
    { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80", alt: "Portrait 6" },
    { src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500&auto=format&fit=crop&q=80", alt: "Fashion 7" },
    { src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80", alt: "Portrait 8" },
    { src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=500&auto=format&fit=crop&q=80", alt: "Golden Hour 9" },
    { src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop&q=80", alt: "Model 10" },
    { src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80", alt: "Minimalist 11" },
    { src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80", alt: "Monochrome 12" },
    { src: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80", alt: "Art Concept 13" },
    { src: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=500&auto=format&fit=crop&q=80", alt: "Iridescence 14" },
    { src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&auto=format&fit=crop&q=80", alt: "Cyberpunk 15" },
    { src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80", alt: "Fluid 3D 16" },
]

const PALETTES = [
    ["#4b2a6b", "#8f4fb0"],
    ["#1f6f78", "#33c6b0"],
    ["#7a2e3a", "#e0637a"],
    ["#2b3a67", "#5a7fd6"],
    ["#8a4b1f", "#e0a13a"],
    ["#5c1f4d", "#c14fa0"],
    ["#1f4d3a", "#3fa87a"],
    ["#6b2020", "#d9583f"],
    ["#2a2a5c", "#6f6fd6"],
]

// Figure-eight loop path: two circles meeting at (350, 160)
const INFINITY_PATH =
    "M 350,160 C 350,90 280,60 210,60 C 140,60 70,90 70,160 C 70,230 140,260 210,260 C 280,260 350,230 350,160 C 350,90 420,60 490,60 C 560,60 630,90 630,160 C 630,230 560,260 490,260 C 420,260 350,230 350,160 Z"

export interface InfinityImageProps {
    images?: Array<{ src: string; alt?: string; title?: string }>
    count?: number
    duration?: number
    cardWidth?: number
    cardHeight?: number
    cardRadius?: number
    label?: string
    pauseOnHover?: boolean
    showTrack?: boolean
    className?: string
    style?: React.CSSProperties
}

/**
 * InfinityImage
 * An infinite figure-eight loop of photographic thumbnail cards flowing seamlessly
 * along a lemniscate path via CSS offset-path.
 */
export default function InfinityImage(props: InfinityImageProps) {
    const {
        images = DEFAULT_IMAGES,
        count = 26,
        duration = 16,
        cardWidth = 56,
        cardHeight = 78,
        cardRadius = 12,
        label = "Infinity Gallery",
        pauseOnHover = true,
        showTrack = true,
        className = "",
        style = {},
    } = props

    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)
    const [isHovered, setIsHovered] = useState(false)

    const items = useMemo(() => (images && images.length > 0 ? images : DEFAULT_IMAGES), [images])

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleResize = () => {
            const w = el.clientWidth
            if (w < 740) {
                setScale(Math.max(0.42, (w - 24) / 700))
            } else {
                setScale(1)
            }
        }

        handleResize()
        const ro = new ResizeObserver(handleResize)
        ro.observe(el)

        return () => ro.disconnect()
    }, [])

    const cards = useMemo(() => {
        const result = []
        for (let i = 0; i < count; i++) {
            const palette = PALETTES[i % PALETTES.length]
            const imgItem = items[i % items.length]
            const delay = -(i * (duration / count))
            result.push({
                i,
                palette,
                imgItem,
                delay,
            })
        }
        return result
    }, [count, duration, items])

    return (
        <div
            ref={containerRef}
            className={`relative w-full h-full flex items-center justify-center overflow-hidden select-none ${className}`}
            style={{ minHeight: "360px", ...style }}
            onMouseEnter={() => pauseOnHover && setIsHovered(true)}
            onMouseLeave={() => pauseOnHover && setIsHovered(false)}
        >
            <style>{`
                @keyframes infinity-flow {
                    0% {
                        offset-distance: 0%;
                    }
                    100% {
                        offset-distance: 100%;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .infinity-card {
                        animation: none !important;
                    }
                }
            `}</style>

            <div
                className="infinity-gallery relative overflow-hidden rounded-3xl border border-white/10"
                style={{
                    width: "700px",
                    height: "320px",
                    flexShrink: 0,
                    transform: `scale(${scale})`,
                    transformOrigin: "center center",
                    background: "radial-gradient(120% 100% at 50% 50%, #141416 0%, #0b0b0d 70%)",
                    boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.65)",
                }}
            >
                {/* Background Infinity Track Guideline */}
                {showTrack && (
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none z-0"
                        viewBox="0 0 700 320"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d={INFINITY_PATH}
                            stroke="rgba(255,255,255,0.06)"
                            strokeWidth="2"
                            strokeDasharray="4 6"
                        />
                        <path
                            d={INFINITY_PATH}
                            stroke="rgba(99,102,241,0.12)"
                            strokeWidth="8"
                            strokeLinecap="round"
                            style={{ filter: "blur(6px)" }}
                        />
                    </svg>
                )}

                {/* Cards circulating the infinity loop */}
                <div className="relative w-full h-full z-10">
                    {cards.map(({ i, palette, imgItem, delay }) => (
                        <div
                            key={i}
                            className="infinity-card absolute"
                            style={{
                                top: 0,
                                left: 0,
                                width: `${cardWidth}px`,
                                height: `${cardHeight}px`,
                                borderRadius: `${cardRadius}px`,
                                boxShadow:
                                    "0 8px 22px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.12)",
                                offsetPath: `path("${INFINITY_PATH}")`,
                                offsetAnchor: "50% 50%",
                                offsetRotate: "auto",
                                animationName: "infinity-flow",
                                animationTimingFunction: "linear",
                                animationIterationCount: "infinite",
                                animationDuration: `${duration}s`,
                                animationDelay: `${delay}s`,
                                animationPlayState: isHovered ? "paused" : "running",
                                background: `linear-gradient(155deg, ${palette[0]}, ${palette[1]})`,
                                overflow: "hidden",
                                willChange: "offset-distance, transform",
                            } as React.CSSProperties}
                        >
                            {/* Real Image thumbnail in the ring */}
                            <img
                                src={imgItem.src}
                                alt={imgItem.alt || `Infinity item ${i + 1}`}
                                className="w-full h-full object-cover select-none pointer-events-none block"
                                loading="eager"
                                decoding="async"
                                onError={(e) => {
                                    (e.currentTarget as HTMLElement).style.display = "none"
                                }}
                            />

                            {/* Glossy lighting overlay and border highlight */}
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    borderRadius: "inherit",
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 40%, rgba(0,0,0,0.3) 80%, rgba(0,0,0,0.55) 100%)",
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Subtle corner label */}
                {label && (
                    <div className="absolute left-5 bottom-4 z-20 flex items-center gap-2 pointer-events-none">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-white/70 text-xs font-mono tracking-widest uppercase font-semibold">
                            {label}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}

InfinityImage.displayName = "Infinity Image"
