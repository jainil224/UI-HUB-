import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface SkeletonProps {
    className?: string;
    variant?: 'rect' | 'circle' | 'pill';
    glow?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
    className = "", 
    variant = 'rect',
    glow = false
}) => {
    const shapeClass = 
        variant === 'circle' ? 'rounded-full' : 
        variant === 'pill' ? 'rounded-full' : 'rounded-[12px]';

    return (
        <div 
            className={`skeleton-glass ${shapeClass} ${glow ? 'skeleton-glow-green' : ''} ${className}`}
        />
    );
};

// ── 1. Navbar Skeleton ──
export const NavbarSkeleton: React.FC = () => {
    const { theme } = useTheme();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-0 pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {/* Logo Area */}
                <div className="flex items-center gap-2.5">
                    <Skeleton className="w-8 h-8 rounded-sm" />
                    <Skeleton className="w-20 h-5" />
                </div>

                {/* Nav Links (Desktop) */}
                <div className={`hidden md:flex items-center gap-2 border rounded-full px-3 py-1.5 ${
                    theme === 'dark' ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.05] border-black/10'
                }`}>
                    <Skeleton className="w-14 h-5 rounded-full" />
                    <Skeleton className="w-28 h-5 rounded-full" />
                    <Skeleton className="w-16 h-5 rounded-full" />
                    <Skeleton className="w-20 h-5 rounded-full" />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    {/* Search Placeholder */}
                    <div className="hidden lg:block relative">
                        <Skeleton className="w-48 xl:w-64 h-9 rounded-full" />
                    </div>

                    {/* Sign In Button Placeholder */}
                    <Skeleton className="w-24 h-9 rounded-full sm:block hidden" glow />

                    {/* Mobile menu icon placeholder */}
                    <Skeleton className="w-9 h-9 rounded-xl md:hidden block" />
                </div>
            </div>
        </nav>
    );
};

// ── 2. Hero Section Skeleton ──
export const HeroSkeleton: React.FC = () => {
    return (
        <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden select-none pointer-events-none">
            {/* Background elements to preserve layout feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/95 z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] z-10 pointer-events-none" />

            <div className="text-center z-20 w-full max-w-4xl flex flex-col items-center">
                {/* Top Badge */}
                <Skeleton className="w-60 h-8 rounded-full mb-10" />

                {/* Main Heading Placeholders */}
                <div className="w-full flex flex-col items-center mb-12 px-4">
                    {/* Craft the... */}
                    <Skeleton className="w-36 h-6 sm:h-9 mb-4" />
                    
                    {/* FUTURE (Large Glowing) */}
                    <Skeleton className="w-72 sm:w-[350px] md:w-[480px] h-16 sm:h-24 md:h-32 mb-4 rounded-2xl" glow />
                    
                    {/* of UI */}
                    <Skeleton className="w-48 sm:w-[220px] md:w-[300px] h-12 sm:h-16 md:h-20 rounded-xl" />
                </div>

                {/* Description paragraphs */}
                <div className="w-full max-w-xl flex flex-col items-center mb-14 px-6 gap-2">
                    <Skeleton className="w-full h-4 rounded-md" />
                    <Skeleton className="w-5/6 h-4 rounded-md" />
                    <Skeleton className="w-2/3 h-4 rounded-md" />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full px-4">
                    <Skeleton className="w-full sm:w-56 h-14 rounded-full" glow />
                    <Skeleton className="w-full sm:w-40 h-14 rounded-full" />
                </div>
            </div>
        </section>
    );
};

// ── 3. Component Grid Skeleton ──
export const ComponentGridSkeleton: React.FC = () => {
    // Generates an array of indices to render 8 cards
    const placeholders = Array.from({ length: 8 });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 relative z-10 w-full">
            {placeholders.map((_, index) => (
                <div 
                    key={index}
                    className="relative h-[240px] sm:h-[260px] md:h-[280px] lg:h-[300px] bg-[#030303] rounded-3xl overflow-hidden flex items-center justify-center border border-white/[0.03] p-6 pointer-events-none"
                >
                    {/* Shimmer sweep glass backdrop */}
                    <div className="absolute inset-0 rounded-3xl skeleton-glass z-10" />

                    {/* Central Preview Area Icon */}
                    <div className="relative z-20 flex flex-col items-center gap-4">
                        <Skeleton className="w-11 h-11 md:w-12 md:h-12 rounded-[14px]" />
                        <Skeleton className="w-24 h-3 rounded-full" />
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5">
                        <Skeleton className="w-28 h-4 rounded-md" />
                        <Skeleton className="w-7 h-7 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
};
