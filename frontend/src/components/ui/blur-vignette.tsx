import React from 'react';
import { cn } from '@/src/lib/utils';

interface BlurVignetteProps {
    children: React.ReactNode;
    className?: string;
    radius?: string;
    inset?: string;
    transitionLength?: string;
    blur?: string;
}

export const BlurVignette: React.FC<BlurVignetteProps> = ({
    children,
    className,
    radius = '24px',
    inset = '0px',
    transitionLength = '40px',
    blur = '10px',
}) => {
    return (
        <div
            className={cn("relative overflow-hidden", className)}
            style={{
                borderRadius: radius,
                '--vignette-inset': inset,
                '--vignette-transition': transitionLength,
                '--vignette-blur': blur,
            } as React.CSSProperties}
        >
            {children}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    boxShadow: `inset 0 0 var(--vignette-blur) var(--vignette-inset) rgba(0,0,0,0.5)`,
                    backdropFilter: `blur(var(--vignette-blur))`,
                    maskImage: `radial-gradient(circle, transparent calc(100% - var(--vignette-transition)), black 100%)`,
                    WebkitMaskImage: `radial-gradient(circle, transparent calc(100% - var(--vignette-transition)), black 100%)`,
                }}
            />
        </div>
    );
};

interface BlurVignetteArticleProps {
    children: React.ReactNode;
    classname?: string;
}

export const BlurVignetteArticle: React.FC<BlurVignetteArticleProps> = ({
    children,
    classname,
}) => {
    return (
        <div className={cn("relative z-10", classname)}>
            {children}
        </div>
    );
};
