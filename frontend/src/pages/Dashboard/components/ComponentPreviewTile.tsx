import React from 'react';
import { ComponentItem } from '../../../data/componentData';

const NATURAL_SIZE_CATEGORIES = new Set(['button', 'text', 'effect', 'image-interaction']);

const FIT_STYLE: React.CSSProperties = { minWidth: 0, minHeight: 0, width: '100%', height: '100%' };

function fitPreview(node: React.ReactNode): React.ReactNode {
    if (!React.isValidElement(node)) return node;
    const el = node as React.ReactElement<{ style?: React.CSSProperties }>;
    return React.cloneElement<{ style?: React.CSSProperties }>(el, {
        style: { ...el.props.style, ...FIT_STYLE },
    });
}

interface ComponentPreviewTileProps {
    item: ComponentItem;
    className?: string;
}

const ComponentPreviewTile = ({ item, className = '' }: ComponentPreviewTileProps) => {
    if (typeof item.preview !== 'function') {
        return (
            <div className={`w-full h-full flex items-center justify-center bg-neutral-950 ${className}`}>
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">No preview</span>
            </div>
        );
    }

    const natural = NATURAL_SIZE_CATEGORIES.has(item.category);

    return (
        <div className={`relative overflow-hidden bg-neutral-950 pointer-events-none ${className}`}>
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
        </div>
    );
};

function PreviewFallback() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-neutral-950">
            <span className="w-5 h-5 rounded-full border-2 border-brand-blue border-t-transparent animate-spin" />
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-black animate-pulse">Loading preview…</span>
        </div>
    );
}

export default ComponentPreviewTile;