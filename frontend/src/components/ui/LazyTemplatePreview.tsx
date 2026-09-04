import React, { useRef, useState, useEffect, memo } from 'react';

interface LazyTemplatePreviewProps {
    children: React.ReactNode;
    bgColor?: string;
    className?: string;
}

/**
 * Virtualized template preview:
 * - MOUNTS the heavy component when the card enters the viewport.
 * - UNMOUNTS it when the card scrolls far out of view (saves memory & CPU).
 * - Keeps a fixed-size placeholder so layout doesn't shift on unmount.
 *
 * rootMargin: 400px buffer above/below — prevents flicker during normal scrolling.
 * The component only unmounts after the card is >400px outside the viewport.
 */
const LazyTemplatePreview = memo(({ children, bgColor = '#0C0C0E', className = '' }: LazyTemplatePreviewProps) => {
    const ref = useRef<HTMLDivElement>(null);
    // true = in viewport (or within buffer) → render children
    // false = far off screen → render placeholder
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                // Mount when entering buffer zone, unmount when fully outside it
                setIsMounted(entry.isIntersecting);
            },
            {
                // 400px buffer: card mounts 400px before entering view,
                // unmounts 400px after leaving view — no flicker during normal scroll
                rootMargin: '400px 0px',
                threshold: 0,
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={`relative w-full h-full ${className}`}
            style={{ background: bgColor }}
        >
            {isMounted ? (
                children
            ) : (
                /* Placeholder — same bg color, no layout shift */
                <div
                    className="absolute inset-0"
                    style={{ background: bgColor }}
                />
            )}
        </div>
    );
});

LazyTemplatePreview.displayName = 'LazyTemplatePreview';

export default LazyTemplatePreview;
