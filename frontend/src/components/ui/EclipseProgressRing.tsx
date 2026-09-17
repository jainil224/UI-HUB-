import React from 'react';

interface EclipseProgressRingProps {
    progress?: number; // 0-100
    size?: number;
    sunColor?: string;
    coronaIntensity?: number;
    label?: string;
}

export const EclipseProgressRing: React.FC<EclipseProgressRingProps> = ({
    progress: controlled,
    size = 220,
    sunColor = '#b86b2e',
    coronaIntensity = 1,
    label = 'burn',
}) => {
    const p = Math.max(0, Math.min(100, controlled ?? 0));
    const done = p >= 100;
    const sunRadius = 34;

    // moon travels left->right, radius shrinks as we enter totality
    const moonRadius = sunRadius * (1 - (p / 100) * 0.7);
    const moonX = -32 + (p / 100) * 64;

    return (
        <div
            style={{
                position: 'relative',
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0908',
                fontFamily: '"Courier New", monospace',
            }}
        >
            <svg viewBox="-60 -60 120 120" style={{ width: '86%', height: '86%' }}>
                {/* sun disc */}
                <circle cx="0" cy="0" r={sunRadius} fill={sunColor} />

                {/* corona flare */}
                {done && (
                    <g style={{ animation: 'ep-flash 1.2s ease-out 1' }}>
                        <circle
                            cx="0"
                            cy="0"
                            r={sunRadius * 0.42}
                            fill="none"
                            stroke="#e8c98c"
                            strokeWidth="10"
                            style={{ filter: 'blur(5px)', fillOpacity: 0.25 }}
                            opacity={0.9 * coronaIntensity}
                        />
                        <circle
                            cx="0"
                            cy="0"
                            r={sunRadius * 0.3}
                            fill="none"
                            stroke="#fff3d0"
                            strokeWidth="1.5"
                        />
                    </g>
                )}

                {/* moon */}
                <circle
                    cx={moonX}
                    cy="0"
                    r={moonRadius}
                    fill="#070607"
                    style={{ filter: 'drop-shadow(0 0 3px rgba(0,0,0,0.6))' }}
                />

                {/* light from crescent gap when partially covered */}
                {p > 0 && p < 100 && (
                    <path
                        d="M -2,0 A 4 5 0 1 1 2,0"
                        transform={`rotate(${p * 1.4} 0 0)`}
                        fill="none"
                        stroke="#f7d9a0"
                        strokeWidth="1.2"
                        opacity="0.7"
                    />
                )}
            </svg>

            <div
                style={{
                    position: 'absolute',
                    bottom: 14,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontSize: 10,
                    letterSpacing: '0.3em',
                    color: '#6b5026',
                    textTransform: 'uppercase',
                }}
            >
                {done ? 'totality' : `${label} ${Math.round(p)}%`}
            </div>

            <style>{`@keyframes ep-flash { 0% { opacity: 0; transform: scale(1.4); } 60% { opacity: 1; transform: scale(0.95); } 100% { opacity: 0.5; transform: scale(1); } }`}</style>
        </div>
    );
};

export default EclipseProgressRing;