import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { ComponentItem } from '../../data/componentData';

const CARD_WIDTH = 480;
const CARD_HEIGHT = 340;
const PREVIEW_HEIGHT = 296;
const GAP = 12;

// These categories contain content-sized elements (buttons, marquees, images)
// that would look tiny if forced to fill the card. Render them at near-natural
// scale instead, centered.
const NATURAL_SIZE_CATEGORIES = new Set(['button', 'text', 'effect', 'image-interaction']);

// Full-screen designs (WebGL/particle/canvas backgrounds, 3D scenes) are much
// cheaper to render at the card's own small size than at their hard-coded
// intrinsic floor (e.g. 1200x800). The floors are set as style.minWidth/
// minHeight on the root and every one of them spreads `...style` last, so we
// can override them with a cloned `style` and the component's canvas then
// initialises at ~card resolution instead of 1200x800.
const FIT_STYLE: React.CSSProperties = { minWidth: 0, minHeight: 0, width: '100%', height: '100%' };

function fitPreview(node: React.ReactNode): React.ReactNode {
    if (!React.isValidElement(node)) return node;
    const el = node as React.ReactElement<{ style?: React.CSSProperties }>;
    return React.cloneElement<{ style?: React.CSSProperties }>(el, {
        style: { ...el.props.style, ...FIT_STYLE },
    });
}

interface HoverPreviewPopoverProps {
    item: ComponentItem;
    rect: DOMRect;
    onClose: () => void;
}

export default function HoverPreviewPopover({ item, rect, onClose }: HoverPreviewPopoverProps) {
    const natural = NATURAL_SIZE_CATEGORIES.has(item.category);

    let left = rect.right + GAP;
    if (left + CARD_WIDTH > window.innerWidth - GAP) {
        left = Math.max(GAP, rect.left - GAP - CARD_WIDTH);
    }
    let top = rect.top;
    if (top + CARD_HEIGHT > window.innerHeight - GAP) {
        top = Math.max(GAP, window.innerHeight - GAP - CARD_HEIGHT);
    }

    const isNew = (() => {
        if (!item.addedAt) return false;
        const added = new Date(item.addedAt).getTime();
        if (Number.isNaN(added)) return false;
        const days = (item.newBadgeDays ?? 120) * 24 * 60 * 60 * 1000;
        return Date.now() - added < days;
    })();

    return createPortal(
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="fixed z-[9999] pointer-events-none"
            style={{ left, top, width: CARD_WIDTH, maxWidth: `calc(100vw - ${GAP * 2}px)` }}
            onMouseLeave={onClose}
            aria-hidden="true"
        >
            <div className="rounded-xl overflow-hidden border-2 border-white bg-neutral-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-black border-b-2 border-neutral-800">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-brand-blue shrink-0" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                        {item.isPremium && <Lock size={10} className="text-brand-blue shrink-0" aria-label="Premium" />}
                        {isNew && (
                            <span className="px-1 py-px bg-[#FFC700] text-black text-[8px] font-black uppercase leading-none rounded-sm border border-black shrink-0">
                                New
                            </span>
                        )}
                        <span className="text-[8px] uppercase tracking-widest text-neutral-500 font-black">{item.category}</span>
                    </div>
                </div>
                <div className="relative overflow-hidden bg-neutral-950" style={{ height: PREVIEW_HEIGHT }}>
                    <React.Suspense fallback={<PreviewFallback />}>
                        {natural ? (
                            <div className="w-full h-full flex items-center justify-center p-6">
                                {item.preview()}
                            </div>
                        ) : (
                            <div className="w-full h-full overflow-hidden">
                                {fitPreview(item.preview())}
                            </div>
                        )}
                    </React.Suspense>
                    <span className="absolute bottom-1.5 right-2 text-[8px] font-mono uppercase tracking-widest text-neutral-600 bg-black/50 px-1 rounded">
                        live preview
                    </span>
                </div>
            </div>
        </motion.div>,
        document.body
    );
}

function PreviewFallback() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950">
            <span className="w-6 h-6 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black animate-pulse">
                Loading preview…
            </span>
        </div>
    );
}