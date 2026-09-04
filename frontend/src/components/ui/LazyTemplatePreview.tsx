import React, { useRef, useState, useEffect, memo } from 'react';

interface LazyTemplatePreviewProps {
    children: React.ReactNode;
    bgColor?: string;
    className?: string;
}

/**
 * Renders children only when the card enters the viewport.
 * Until then shows a lightweight skeleton placeholder.
 * This prevents all heavy template components from mounting at once.
 */
const LazyTemplatePreview = memo(({ children, bgColor = '#0C0C0E', className = '' }: LazyTemplatePreviewProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // only mount once, never unmount
                }
            },
            { rootMargin: '200px 0px', threshold: 0 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={`relative w-full h-full ${className}`} style={{ background: bgColor }}>
            {isVisible ? (
                children
            ) : (
                /* Skeleton shimmer */
                <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                        background: `linear-gradient(90deg, ${bgColor} 25%, color-mix(in srgb, ${bgColor} 80%, white) 50%, ${bgColor} 75%)`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 1.4s infinite',
                    }}
                />
            )}
        </div>
    );
});

LazyTemplatePreview.displayName = 'LazyTemplatePreview';

export default LazyTemplatePreview;
