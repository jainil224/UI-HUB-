import React, { useEffect, useRef, useState } from 'react';

interface DriftwoodGalleryProps {
    images: { src: string; alt?: string; tint?: string }[];
    intervalMs?: number;
    waveAmp?: number;
    showDots?: boolean;
}

export const DriftwoodGallery: React.FC<DriftwoodGalleryProps> = ({
    images,
    intervalMs = 5200,
    waveAmp = 6,
    showDots = true,
}) => {
    const [index, setIndex] = useState(0);
    const [reduced] = useState(
        () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );
    const wrapRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLDivElement>(null);
    const deckRef = useRef<HTMLDivElement>(null);
    const motionRef = useRef({ x: 0, y: 0 });
    const hoverRef = useRef(false);

    // Slideshow — pauses while the pointer rests on the frame.
    useEffect(() => {
        const count = Math.max(1, images.length);
        const id = window.setInterval(() => {
            if (hoverRef.current) return;
            setIndex((i) => (i + 1) % count);
        }, intervalMs);
        return () => window.clearInterval(id);
    }, [images.length, intervalMs]);

    // Pointer parallax + idle tide-bob, written straight to the DOM (zero re-renders).
    useEffect(() => {
        if (reduced) return;
        let raf = 0;
        let prev = performance.now();
        let tilt = { x: 0, y: 0 };
        let t = Math.random() * 20;

        const loop = (now: number) => {
            const dt = Math.min(0.05, Math.max(0, (now - prev) / 1000));
            prev = now;
            t += dt;
            tilt.x += (motionRef.current.x - tilt.x) * 0.09;
            tilt.y += (motionRef.current.y - tilt.y) * 0.09;

            const floatX = Math.sin(t * 0.75) * waveAmp;
            const floatY = Math.cos(t * 0.5) * waveAmp * 0.5;

            if (frameRef.current) {
                frameRef.current.style.transform =
                    `perspective(900px) rotateX(${(-tilt.y * 5).toFixed(2)}deg) rotateY(${(tilt.x * 7).toFixed(2)}deg)`;
            }
            if (deckRef.current) {
                deckRef.current.style.transform =
                    `translate(${floatX.toFixed(2)}px, ${floatY.toFixed(2)}px) scale(1.03)`;
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, [reduced, waveAmp]);

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (!rect) return;
        motionRef.current = {
            x: (e.clientX - rect.left) / rect.width - 0.5,
            y: (e.clientY - rect.top) / rect.height - 0.5,
        };
    };
    const onPointerEnter = () => {
        hoverRef.current = true;
    };
    const onPointerLeave = () => {
        hoverRef.current = false;
        motionRef.current = { x: 0, y: 0 };
    };

    return (
        <div
            ref={wrapRef}
            onPointerMove={onPointerMove}
            onPointerEnter={onPointerEnter}
            onPointerLeave={onPointerLeave}
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                background: 'linear-gradient(180deg, #d9d2bd 0%, #cfc6ab 55%, #b9ad8e 100%)',
                touchAction: 'none',
                cursor: 'grab',
            }}
        >
            {/* sand grain */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage:
                        'radial-gradient(circle at 22% 40%, rgba(120,100,70,0.14) 1px, transparent 1.3px), radial-gradient(circle at 70% 60%, rgba(120,100,70,0.10) 1px, transparent 1.3px)',
                    backgroundSize: '34px 34px',
                    opacity: 0.7,
                }}
            />

            {/* driftwood frame */}
            <div
                ref={frameRef}
                style={{
                    position: 'absolute',
                    inset: '10%',
                    border: '10px solid #8a7354',
                    borderRadius: 2,
                    transform: 'perspective(900px) rotateX(0deg) rotateY(0deg)',
                    boxShadow: 'inset 0 0 0 2px rgba(60,45,25,0.5), 6px 10px 14px rgba(70,55,30,0.35)',
                    willChange: 'transform',
                }}
            >
                {/* tide-bobbed deck */}
                <div ref={deckRef} style={{ position: 'absolute', inset: -6, willChange: 'transform' }}>
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img.src}
                            alt={img.alt || `wave ${i + 1}`}
                            loading="lazy"
                            draggable={false}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                filter: img.tint
                                    ? `sepia(0.24) saturate(0.62) ${img.tint}`
                                    : 'sepia(0.24) saturate(0.68) contrast(0.96)',
                                opacity: i === index ? 1 : 0,
                                transition: 'opacity 1s ease',
                                transform: 'scale(1.03)',
                                pointerEvents: 'none',
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* tide / bottom sway line + dots */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '2.5%',
                    left: 0,
                    right: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                }}
            >
                {showDots && images.length > 1 && (
                    <div style={{ display: 'flex', gap: 7 }}>
                        {images.map((_, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`Go to slide ${i + 1}`}
                                onClick={() => setIndex(i)}
                                style={{
                                    width: 16,
                                    height: 4,
                                    padding: 0,
                                    border: 'none',
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    background: i === index ? '#4c3d26' : 'rgba(112,92,62,0.5)',
                                    transform: i === index ? 'scaleX(1.25)' : 'none',
                                    transition: 'background 0.3s ease, transform 0.3s ease',
                                }}
                            />
                        ))}
                    </div>
                )}
                <div
                    style={{
                        fontSize: 10,
                        letterSpacing: '0.3em',
                        textTransform: 'uppercase',
                        color: '#5d4a30',
                        fontFamily: '"Courier New", monospace',
                    }}
                >
                    ~ {String(index + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')} ~
                </div>
            </div>
        </div>
    );
};

export default DriftwoodGallery;