import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

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
    const [pathLen, setPathLen] = useState(0);
    const pathRef = useRef<SVGPathElement>(null);
    const [reduced] = useState(
        () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    );

    const progress = controlled !== undefined ? controlled : internal;
    const done = progress >= 100;

    useEffect(() => {
        if (!autoPlay || reduced) return;
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
    }, [autoPlay, onComplete, reduced]);

    // Measure the real path length so the dash fill is exact for every viewBox.
    useLayoutEffect(() => {
        const el = pathRef.current;
        if (el) setPathLen(el.getTotalLength());
    }, []);

    // Travelling pulse dot at the current progress point on the trace.
    const pulse = useMemo(() => {
        if (pathLen <= 0 || progress <= 0) return null;
        const el = pathRef.current;
        if (!el) return null;
        try {
            const p = el.getPointAtLength((pathLen * Math.min(100, progress)) / 100);
            return { x: p.x, y: p.y };
        } catch {
            return null;
        }
    }, [progress, pathLen]);

    const dashLen = pathLen || 200;

    return (
        <div
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={label}
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
            {/* aurora ribbons — continuously swaying */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    overflow: 'hidden',
                    opacity: done ? 1 : 0.9,
                    transition: 'opacity 0.6s ease',
                }}
            >
                {ribbonColors.map((c, i) => (
                    <div
                        key={i}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: `${34 + i * 14}%`,
                            width: '130%',
                            height: 18,
                            background: `radial-gradient(ellipse at center, ${c} 0%, transparent 70%)`,
                            transform: 'translateY(0) scaleX(1.04)',
                            animation: `aurora-sway ${3.2 + i * 0.9}s ease-in-out ${-i * 0.7}s infinite alternate`,
                            opacity: done ? 0.85 - i * 0.14 : 0.42 - i * 0.1,
                            filter: done ? 'brightness(1.35) saturate(1.15)' : 'brightness(0.95)',
                            transition: 'opacity 0.5s ease, filter 0.6s ease',
                        }}
                    />
                ))}
            </div>

            {/* heartbeat trace */}
            <svg viewBox="0 0 100 100" style={{ position: 'relative', width: '82%', height: '56%' }}>
                <path
                    d={HEARTBEAT}
                    fill="none"
                    stroke="#3a3f33"
                    strokeWidth={1}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    ref={pathRef}
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
                {pulse && !reduced && (
                    <g>
                        <circle cx={pulse.x} cy={pulse.y} r={2.2} fill="#d8cd7e" />
                        <circle cx={pulse.x} cy={pulse.y} r={5.5} fill="none" stroke="#d8cd7e" strokeWidth={0.7} opacity={0.5}>
                            <animate attributeName="r" values="3;9" dur="0.9s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.5;0" dur="0.9s" repeatCount="indefinite" />
                        </circle>
                    </g>
                )}
            </svg>

            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.3em', color: done ? '#c9c27a' : '#8a8550', textTransform: 'uppercase', transition: 'color 0.4s ease' }}>
                    {label}
                </span>
                <span style={{ fontSize: 12, color: done ? '#a9a35c' : '#5f5a3a', letterSpacing: '0.2em', transition: 'color 0.4s ease' }}>
                    {Math.min(100, Math.round(progress)).toString().padStart(3, '0')} bpm
                </span>
            </div>

            <style>{`
                @keyframes aurora-sway {
                    from { transform: translateY(-7px) scaleX(1.02); }
                    to { transform: translateY(7px) scaleX(1.06); }
                }
            `}</style>
        </div>
    );
};

export default AuroraBpmLoader;