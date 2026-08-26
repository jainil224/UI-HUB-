import React from 'react';

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
        variant === 'pill' ? 'rounded' : 'rounded-lg';

    return (
        <div 
            className={`skeleton-glass ${shapeClass} ${glow ? 'skeleton-glow-blue' : ''} ${className}`}
        />
    );
};

// ── 1. Navbar Skeleton ──
export const NavbarSkeleton: React.FC = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-brand-surface border-b-2 border-white pointer-events-none">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo Area */}
                <div className="flex items-center gap-2.5">
                    <Skeleton className="w-8 h-8 rounded border-2 border-white" />
                    <Skeleton className="w-24 h-6 rounded" />
                </div>

                {/* Nav Links (Desktop) */}
                <div className="hidden md:flex items-center gap-3">
                    <Skeleton className="w-16 h-7 rounded" />
                    <Skeleton className="w-32 h-7 rounded" />
                    <Skeleton className="w-20 h-7 rounded" />
                    <Skeleton className="w-24 h-7 rounded" />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-3">
                    <Skeleton className="w-48 h-9 rounded hidden lg:block" />
                    <Skeleton className="w-24 h-9 rounded bg-brand-blue border-2 border-black" glow />
                    <Skeleton className="w-9 h-9 rounded md:hidden block" />
                </div>
            </div>
        </nav>
    );
};

// ── 2. Hero Section Skeleton ──
export const HeroSkeleton: React.FC = () => {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden select-none pointer-events-none bg-brand-bg">
            <div className="text-center z-20 w-full max-w-4xl flex flex-col items-center">
                {/* Top Badge */}
                <Skeleton className="w-64 h-8 rounded border-2 border-white mb-10" />

                {/* Main Heading Placeholders */}
                <div className="w-full flex flex-col items-center mb-10 px-4">
                    {/* Line 1: CRAFT THE */}
                    <Skeleton className="w-56 sm:w-80 h-10 sm:h-14 mb-4 rounded border-2 border-neutral-700" />
                    
                    {/* Line 2: FUTURE (Large Blue Highlight) */}
                    <Skeleton className="w-72 sm:w-[480px] md:w-[600px] h-14 sm:h-20 md:h-24 mb-4 rounded border-2 border-brand-blue" glow />
                    
                    {/* Line 3: OF UI */}
                    <Skeleton className="w-48 sm:w-64 h-10 sm:h-14 rounded border-2 border-neutral-700" />
                </div>

                {/* Description paragraphs */}
                <div className="w-full max-w-lg flex flex-col items-center mb-12 px-6 gap-2">
                    <Skeleton className="w-full h-4 rounded" />
                    <Skeleton className="w-4/5 h-4 rounded" />
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
                    <Skeleton className="w-full sm:w-52 h-12 rounded border-2 border-black bg-brand-blue" glow />
                    <Skeleton className="w-full sm:w-44 h-12 rounded border-2 border-white" />
                </div>
            </div>
        </section>
    );
};

// ── 3. Component Grid Skeleton ──
export const ComponentGridSkeleton: React.FC = () => {
    const placeholders = Array.from({ length: 4 });

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 w-full max-w-7xl mx-auto px-6">
            {placeholders.map((_, index) => (
                <div 
                    key={index}
                    className="relative h-[320px] bg-brand-surface rounded-lg border-2 border-white p-5 flex flex-col justify-between pointer-events-none brutal-shadow-black"
                >
                    {/* Header with Traffic Dots Placeholder */}
                    <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                        <div className="flex gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-800" />
                        </div>
                        <Skeleton className="w-16 h-4 rounded" />
                    </div>

                    {/* Central Preview Area */}
                    <div className="flex-1 flex items-center justify-center my-4">
                        <Skeleton className="w-20 h-20 rounded-lg" glow />
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="pt-3 border-t border-neutral-800 flex items-center justify-between">
                        <Skeleton className="w-28 h-5 rounded" />
                        <Skeleton className="w-14 h-6 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
};

// ── 4. Library Preview Skeleton ──
export const PreviewSkeleton: React.FC<{ className?: string }> = ({ className = "" }) => {
    return (
        <div className={`w-full h-full flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden select-none pointer-events-none ${className}`}>
            {/* Background shimmer ambient */}
            <div className="absolute inset-0 bg-brand-surface/40 flex items-center justify-center">
                <div className="w-64 h-64 rounded-full bg-brand-blue/5 blur-3xl animate-pulse" />
            </div>

            {/* Central Preview Content Placeholder */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 max-w-sm w-full">
                {/* Visual Icon / Canvas placeholder */}
                <div className="relative flex items-center justify-center">
                    <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-2 border-white/20" glow />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
                    </div>
                </div>

                {/* Subtitle / Status bar placeholder */}
                <div className="w-full flex flex-col items-center gap-2 mt-2">
                    <Skeleton className="w-3/4 h-5 rounded border border-neutral-700" />
                    <Skeleton className="w-1/2 h-3 rounded" />
                </div>

                {/* Simulated interactive pill badges */}
                <div className="flex items-center gap-2 mt-3">
                    <Skeleton className="w-16 h-6 rounded-full border border-neutral-700" />
                    <Skeleton className="w-20 h-6 rounded-full border border-brand-blue/40" glow />
                    <Skeleton className="w-16 h-6 rounded-full border border-neutral-700" />
                </div>
            </div>
        </div>
    );
};
