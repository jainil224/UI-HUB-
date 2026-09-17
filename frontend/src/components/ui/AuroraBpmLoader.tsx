import React, { useEffect, useRef, useState } from 'react';

interface AuroraBpmLoaderProps {
    progress?: number; // 0-100
    size?: number;
    label?: string;
    ribbonColors?: string[];
    autoPlay?: boolean;
    onComplete?: () => void;
}

const HEARTBEAT =
    'M0,50 L8,50 L12,50 L14,10 L16,55 L18,62 L20,45 L22,50 L30,50 L34,30 L36,60 L38,50 L50,50 L58,52 L60,20 L62,58 L64,64 L66,48 L70,50 L80,50 L84,40 L86,60 L88,50 L100,50';

export const AuroraBpmLoader: React.FC<AuroraBpmLoaderProps> = ({
    progress: controlled,
    size = 240,
    label = 'Loading',
    ribbonColors = ['#5a6a52', '#6f7a50', '#7d7352'],
    autoPlay = false,
    onComplete,
}) => {
    const [internal, setInternal] = useState(0);
    const progress = controlled !== undefined ? controlled : internal;

    useEffect(() => {
        if (!autoPlay) return;
        let v = 0;
        const id = window.setInterval(() => {
            v = Math.min(100, v + 1.2);
            setInternal(v);
            if (v >= 100) {
                window.clearInterval(id);
                onComplete?.();
            }
        }, 48);
        return () => window.clearInterval(id);
    }, [autoPlay, onComplete]);

    const done = progress >= 100;
    const dashLen = useRef(200).current;

    return (
        <div
            style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                background: '#08090b',
                borderRadius: 8,
                fontFamily: '"Courier New", monospace',
            }}
        >
            {/* aurora ribbons */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: done ? 0.75 : 1 }}>
                {ribbonColors.map((c, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: `${34 + i * 14}%`,
                            width: '120%',
                            height: 16,
                            background: `radial-gradient(ellipse at center, ${c} 0%, transparent 70%)`,
                            transform: `translateY(${Math.sin(progress * 0.035 + i * 1.1) * 5}px) scaleX(1.04)`,
                            transition: 'transform 0.3s linear',
                            opacity: 0.5 - i * 0.12,
                        }}
                    />
                ))}
            </div>

            {/* heartbeat trace */}
            <svg
                viewBox="0 0 100 100"
                style={{ position: 'relative', width: '82%', height: '56%' }}
            >
                <path
                    d={HEARTBEAT}
                    fill="none"
                    stroke="#3a3f33"
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d={HEARTBEAT}
                    fill="none"
                    stroke="#a9a35c"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={dashLen}
                    strokeDashoffset={dashLen - (dashLen * progress) / 100}
                    style={{
                        filter: done ? 'brightness(1.5)' : 'none',
                        transition: 'stroke-dashoffset 0.08s linear, filter 0.4s ease',
                    }}
                />
            </svg>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.3em', color: '#8a8550', textTransform: 'uppercase' }}>
                    {label}
                </span>
                <span style={{ fontSize: 12, color: '#5f5a3a', letterSpacing: '0.2em' }}>
                    {Math.min(100, Math.round(progress)).toString().padStart(3, '0')} bpm
                </span>
            </div>
        </div>
    );
};

export default AuroraBpmLoader;