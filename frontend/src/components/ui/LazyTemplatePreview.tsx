import React, { useRef, useState, useEffect, useCallback, memo } from 'react';

interface LazyTemplatePreviewProps {
    children: React.ReactNode;
    bgColor?: string;
    className?: string;
}

/**
 * Virtualized + responsive template preview:
 * - MOUNTS the heavy component when the card enters the viewport.
 * - UNMOUNTS it when the card scrolls far out of view.
 * - Dynamically computes the CSS scale so the 1280px-wide preview
 *   always fits perfectly inside the card container at any screen width.
 */
const LazyTemplatePreview = memo(({ children, bgColor = '#0C0C0E', className = '' }: LazyTemplatePreviewProps) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    // Scale factor: containerWidth / 1280
    const [scale, setScale] = useState(0.31);

    // Compute scale based on actual container width
    const computeScale = useCallback(() => {
        const el = wrapperRef.current;
        if (!el) return;
        const containerWidth = el.getBoundingClientRect().width;
        if (containerWidth > 0) {
            setScale(containerWidth / 1280);
        }
    }, []);

    useEffect(() => {
        computeScale();

        // Re-compute on resize (orientation change, window resize)
        const resizeObserver = new ResizeObserver(computeScale);
        if (wrapperRef.current) resizeObserver.observe(wrapperRef.current);
        return () => resizeObserver.disconnect();
    }, [computeScale]);

    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                setIsMounted(entry.isIntersecting);
            },
            {
                // 400px buffer: mounts before entering view, unmounts after leaving
                rootMargin: '400px 0px',
                threshold: 0,
            }
        );

        intersectionObserver.observe(el);
        return () => intersectionObserver.disconnect();
    }, []);

    return (
        <div
            ref={wrapperRef}
            className={`relative w-full h-full overflow-hidden ${className}`}
            style={{ background: bgColor }}
        >
            {isMounted ? (
                // Apply dynamic scale so 1280px wide content fits the container exactly
                <div
                    style={{
                        width: 1280,
                        height: 720,
                        transformOrigin: 'top left',
                        transform: `scale(${scale})`,
                        pointerEvents: 'none',
                        userSelect: 'none',
                    }}
                >
                    {children}
                </div>
            ) : (
                <div className="absolute inset-0" style={{ background: bgColor }} />
            )}
        </div>
    );
});

LazyTemplatePreview.displayName = 'LazyTemplatePreview';

export default LazyTemplatePreview;
