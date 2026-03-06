import React from 'react';

interface StripeMeshBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    /** Intensity of the colors (0 to 1) */
    intensity?: number;
    /** Speed of the flow animation (0.5 to 5) */
    speed?: number;
}

export const StripeMeshBackground: React.FC<StripeMeshBackgroundProps> = ({
    className = '',
    children,
    intensity = 0.8,
    speed = 1,
}) => {
    return (
        <div className={`relative w-full h-full min-h-screen bg-white overflow-hidden isolate ${className}`}>
            <style>{`
                @keyframes mesh-flow-1 {
                    0% { transform: translate(0%, 0%) rotate(0deg) scale(2); }
                    33% { transform: translate(15%, 5%) rotate(120deg) scale(1.5); }
                    66% { transform: translate(-5%, 20%) rotate(240deg) scale(2.5); }
                    100% { transform: translate(0%, 0%) rotate(360deg) scale(2); }
                }
                @keyframes mesh-flow-2 {
                    0% { transform: translate(5%, 5%) rotate(0deg) scale(1.5); }
                    33% { transform: translate(-20%, -10%) rotate(-120deg) scale(2); }
                    66% { transform: translate(10%, 15%) rotate(-240deg) scale(1.2); }
                    100% { transform: translate(5%, 5%) rotate(-360deg) scale(1.5); }
                }
                @keyframes mesh-flow-3 {
                    0% { transform: translate(-10%, 10%) rotate(0deg) scale(2.2); }
                    50% { transform: translate(20%, -15%) rotate(180deg) scale(1.8); }
                    100% { transform: translate(-10%, 10%) rotate(360deg) scale(2.2); }
                }
                @keyframes grain {
                    0%, 100% { transform: translate(0, 0); }
                    10% { transform: translate(-5%, -10%); }
                    20% { transform: translate(-15%, 5%); }
                    30% { transform: translate(7%, -25%); }
                    40% { transform: translate(-5%, 25%); }
                    50% { transform: translate(-15%, 10%); }
                    60% { transform: translate(15%, 0%); }
                    70% { transform: translate(0%, 15%); }
                    80% { transform: translate(3%, 35%); }
                    90% { transform: translate(-10%, 10%); }
                }

                .mesh-scene {
                    position: absolute;
                    inset: -50%;
                    perspective: 1500px;
                    z-index: 0;
                    pointer-events: none;
                }

                .mesh-container {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    filter: blur(80px);
                    opacity: ${intensity};
                    transform-style: preserve-3d;
                    transform: rotateX(25deg) rotateY(-10deg) rotateZ(-5deg);
                    will-change: transform;
                    mix-blend-mode: multiply;
                }

                .mesh-blob {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    mix-blend-mode: soft-light;
                    will-change: transform;
                }

                .blob-orange {
                    top: -10%;
                    right: -5%;
                    background: radial-gradient(circle at 70% 30%, #ff5f00 0%, transparent 60%);
                    animation: mesh-flow-1 ${50 / speed}s linear infinite;
                }

                .blob-purple {
                    bottom: -5%;
                    left: -5%;
                    background: radial-gradient(circle at 30% 70%, #6366f1 0%, transparent 60%);
                    animation: mesh-flow-2 ${55 / speed}s linear infinite;
                }

                .blob-pink {
                    top: 15%;
                    left: 15%;
                    background: radial-gradient(circle at 40% 40%, #ec4899 0%, transparent 55%);
                    animation: mesh-flow-3 ${60 / speed}s linear infinite;
                }

                .blob-blue {
                    bottom: 15%;
                    right: 15%;
                    background: radial-gradient(circle at 60% 60%, #3b82f6 0%, transparent 55%);
                    animation: mesh-flow-1 ${70 / speed}s reverse infinite;
                }

                .blob-yellow {
                    top: 50%;
                    left: 50%;
                    background: radial-gradient(circle at 50% 50%, #f59e0b 0%, transparent 45%);
                    animation: mesh-flow-2 ${45 / speed}s infinite;
                    opacity: 0.4;
                }

                .noise-overlay {
                    position: absolute;
                    inset: -100%;
                    z-index: 1;
                    opacity: 0.04;
                    pointer-events: none;
                    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
                    animation: grain 8s steps(10) infinite;
                }

                .white-vignette {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(255,255,255,0.6) 100%);
                    z-index: 2;
                    pointer-events: none;
                }
            `}</style>

            <div className="mesh-scene">
                <div className="mesh-container">
                    <div className="mesh-blob blob-orange" />
                    <div className="mesh-blob blob-purple" />
                    <div className="mesh-blob blob-pink" />
                    <div className="mesh-blob blob-blue" />
                    <div className="mesh-blob blob-yellow" />
                </div>
            </div>

            <div className="noise-overlay" />
            <div className="white-vignette" />

            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};

export default StripeMeshBackground;
