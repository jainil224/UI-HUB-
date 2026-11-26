import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { ComponentItem } from '../../data/componentData';
import { prefetchComponentChunk } from '../../utils/prefetchUtils';
import HoverPreviewPopover from './HoverPreviewPopover';

interface HoverState {
    item: ComponentItem;
    rect: DOMRect;
}

interface ComponentHoverPreviewProps {
    item: ComponentItem;
    children: React.ReactNode;
    className?: string;
    openDelay?: number;
    closeDelay?: number;
}

/**
 * Wraps a component name/card and opens a live animated preview popover on hover.
 * Pointer movement into the popover pauses animation and enables interaction;
 * leaving resumes it. Used on every catalog name surface.
 */
export default function ComponentHoverPreview({
    item,
    children,
    className = '',
    openDelay = 200,
    closeDelay = 150,
}: ComponentHoverPreviewProps) {
    const [hover, setHover] = useState<HoverState | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    useEffect(() => () => clearTimer(), []);

    const handleEnter = (event: React.PointerEvent<HTMLSpanElement>) => {
        // Pointer events are never synthesized by the auto-demo layer (which
        // only emits mouseover/mouseout), so this is always a real pointer.
        if (!event.isTrusted) return;
        prefetchComponentChunk(item.id);
        clearTimer();
        if (hover?.item.id === item.id) return;
        const target = event.currentTarget;
        timerRef.current = setTimeout(() => {
            setHover({ item, rect: target.getBoundingClientRect() });
        }, openDelay);
    };

    const handleLeave = (event: React.PointerEvent<HTMLSpanElement>) => {
        if (!event.isTrusted) return;
        clearTimer();
        timerRef.current = setTimeout(() => {
            const popover = document.querySelector('[data-hover-preview="true"]');
            if (popover && popover.matches(':hover')) return;
            setHover(null);
        }, closeDelay);
    };

    const handleClose = () => {
        clearTimer();
        setHover(null);
    };

    return (
        <>
            <span className={className} onPointerEnter={handleEnter} onPointerLeave={handleLeave}>
                {children}
            </span>
            <AnimatePresence>
                {hover && (
                    <HoverPreviewPopover
                        key={hover.item.id}
                        item={hover.item}
                        rect={hover.rect}
                        onClose={handleClose}
                        onKeepOpen={clearTimer}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
