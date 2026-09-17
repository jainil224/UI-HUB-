import React, { useEffect, useRef, useState } from 'react';

interface DriftwoodGalleryProps {
    images: { src: string; alt?: string; tint?: string }[];
    intervalMs?: number;
    waveAmp?: number;
}

export const DriftwoodGallery: React.FC<DriftwoodGalleryProps> = ({
    images,
    intervalMs = 5200,
    waveAmp = 6,
}) => {
    const [index, setIndex] = useState(0);
    const [motion, setMotion] = useState({ x: 0, y: 0 });
    const ref = useRef<HTMLDivElement>(null);
    const timer = useRef<number>(0);
    const motionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const id = window.setInterval(() => {
            setIndex((i) => (i + 1) % Math.max(1, images.length));
        }, intervalMs);
        timer.current = id;
        return () => window.clearInterval(id);
    }, [images.length, intervalMs]);

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            const rect = ref.current?.getBoundingClientRect();
            if (!rect) return;
            motionRef.current = {
                x: (e.clientX - rect.left) / rect.width - 0.5,
                y: (e.clientY - rect.top) / rect.height - 0.5,
            };
        };
        const onLeave = () => {
            motionRef.current = { x: 0, y: 0 };
        };
        const raf = () => {
            setMotion((prev) => {
                const nx = prev.x + (motionRef.current.x - prev.x) * 0.06;
                const ny = prev.y + (motionRef.current.y - prev.y) * 0.06;
                return { x: nx, y: ny };
            });
            requestAnimationFrame(raf);
        };
        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerleave', onLeave);
        const id = requestAnimationFrame(raf);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerleave', onLeave);
            cancelAnimationFrame(id);
        };
    }, []);

    const tiltX = motion.y * 6;
    const tiltY = motion.x * 8;
    const driftX = Math.sin(index * 1.7) * waveAmp;
    const driftY = Math.cos(index * 2.1) * (waveAmp * 0.55);

    return (
        <div
            ref={ref}
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
                style={{
                    position: 'absolute',
                    inset: '10%',
                    border: '10px solid #8a7354',
                    borderRadius: 2,
                    transform: `perspective(700px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
                    boxShadow: 'inset 0 0 0 2px rgba(60,45,25,0.5), 6px 10px 14px rgba(70,55,30,0.35)',
                    transition: 'transform 0.08s linear',
                }}
            >
                {images.map((img, i) => (
                    <img
                        key={i}
                        src={img.src}
                        alt={img.alt || `wave ${i + 1}`}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            filter: img.tint ? `sepia(0.24) saturate(0.62) ${img.tint}` : 'sepia(0.24) saturate(0.68) contrast(0.96)',
                            opacity: i === index ? 1 : 0,
                            transform: `translate(${(i - index) * 4 + driftX}px, ${driftY}px) scale(1.03)`,
                            transition: 'opacity 0.9s ease, transform 1.4s ease',
                        }}
                    />
                ))}
            </div>

            {/* tide / bottom sway line */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '4%',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
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
    );
};

export default DriftwoodGallery;