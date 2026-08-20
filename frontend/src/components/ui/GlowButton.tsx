import React, { useState, useRef } from 'react';

export interface GlowButtonProps {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export const GlowButton: React.FC<GlowButtonProps> = ({
    children = "Glow Button",
    onClick,
    className = "",
}) => {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePos({ x, y });
    };

    return (
        <div className={`flex items-center justify-center p-8 bg-neutral-950/80 rounded-3xl border border-white/10 w-full min-h-[260px] relative overflow-hidden group/container ${className}`}>
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.08),transparent_70%)] pointer-events-none" />

            <button
                ref={buttonRef}
                onMouseMove={handleMouseMove}
                onClick={onClick}
                className="relative px-10 py-4 rounded-2xl bg-neutral-900 border border-emerald-500/30 text-emerald-400 font-display font-black uppercase tracking-[0.2em] text-sm transition-all duration-500 hover:scale-105 hover:border-emerald-400 isolation-auto group cursor-pointer shadow-2xl"
                style={{
                    boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(16,185,129,0.05)',
                }}
            >
                {/* Interactive Surface Light */}
                <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                    style={{
                        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.25) 0%, transparent 60%)`,
                    }}
                />

                {/* Primary Neon Glow (Edge) */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-sm pointer-events-none" />

                {/* Volumetric Outer Glow */}
                <div
                    className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-all duration-700 pointer-events-none blur-2xl"
                    style={{
                        background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(16,185,129,0.4) 0%, transparent 70%)`,
                    }}
                />

                <span className="relative z-10 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:text-white transition-colors duration-300">
                    {children}
                </span>

                {/* Subtle Inner Highlight */}
                <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </button>
        </div>
    );
};

export default GlowButton;
