import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TemplateItem } from '../../data/templatesData';
import { TEMPLATE_PREVIEWS, TEMPLATE_PREVIEW_BGS } from './registry';

/**
 * Shared preview stage for the template-style detail pages.
 *
 * `/templates/:id` and `/build-with-ui-hub/:slug` render the same thing, so the
 * scaling, lazy-loading and fallback ladder live here once instead of being
 * forked per page.
 *
 * Desktop-only preview: renders on a fixed 1280px desktop canvas and scales it
 * down to fit the container, so the full desktop layout is always visible
 * (never tablet/mobile responsive variants, no raw overflow).
 */
const CANVAS_WIDTH = 1280;

export const ScaledTemplateScene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [canvasHeight, setCanvasHeight] = useState(0);

    // Scale the 1280px canvas to the container width (never upscale beyond 1)
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const update = () => {
            const w = el.clientWidth;
            if (w > 0) setScale(Math.min(1, w / CANVAS_WIDTH));
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // Track the template's natural (unscaled) height so the outer wrapper
    // keeps the scroll container at the correct scaled height
    useEffect(() => {
        const el = canvasRef.current;
        if (!el) return;
        const update = () => {
            if (el.clientHeight > 0) setCanvasHeight(el.clientHeight);
        };
        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative w-full overflow-hidden"
            style={{ height: canvasHeight * scale }}
        >
            <div
                ref={canvasRef}
                style={{
                    width: CANVAS_WIDTH,
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                }}
            >
                {children}
            </div>
        </div>
    );
};

/**
 * Instant visual: shows the static template screenshot while the live component
 * chunk loads.
 *
 * With `preferLive` the recorded video is suppressed here too. The live chunks
 * are heavy (the 3D ones pull vendor-three), so this fallback is on screen long
 * enough to be noticed - playing the video for a beat and then swapping to the
 * component reads as a glitch rather than a load.
 */
export const PreviewImageFallback: React.FC<{
    template: TemplateItem;
    preferLive?: boolean;
}> = ({ template, preferLive = false }) => {
    const showVideo = !preferLive && !!template.previewVideo;

    return (
        // Background matches the live branch so the swap to the real component
        // does not flash a different colour.
        <div
            className={`relative w-[1280px] h-[720px] overflow-hidden ${TEMPLATE_PREVIEW_BGS[template.id] ?? ''}`}
        >
            {showVideo ? (
                <video
                    src={template.previewVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-top"
                />
            ) : template.previewImage ? (
                <img
                    src={template.previewImage}
                    alt={`${template.title} preview`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-top"
                />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${template.previewGradient}`} />
            )}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/85 border border-white/20 text-white text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 border-2 border-[#1F4BFF] border-t-transparent rounded-full animate-spin" />
                <span>Loading preview...</span>
            </div>
        </div>
    );
};

/**
 * Lazy-loads ONLY the selected template's component chunk (fast first paint,
 * no more loading every preview + three.js before showing anything).
 */
export const LazyTemplateRenderer: React.FC<{
    template: TemplateItem;
    resetKey: number;
    preferLive?: boolean;
}> = ({ template, resetKey, preferLive = false }) => {
    const Comp = useMemo(() => React.lazy(TEMPLATE_PREVIEWS[template.id]), [template.id]);
    return (
        <React.Suspense fallback={<PreviewImageFallback template={template} preferLive={preferLive} />}>
            <Comp key={resetKey} />
        </React.Suspense>
    );
};

interface TemplatePreviewStageProps {
    template: TemplateItem;
    /** Bumped by the reload button to remount the preview from scratch. */
    resetKey: number;
    /** Only used by the live-iframe branch, which shows a spinner until load. */
    isLoadingIframe: boolean;
    onIframeLoad: () => void;
    /**
     * Render the live React component even when a recorded preview video exists.
     *
     * The templates catalog prefers the video because it is far cheaper to paint
     * across 17 cards and pages. "Build with UI HUB" sections are the opposite
     * case: a section is a single full-screen layout, so the visitor expects to
     * see the actual running component rather than a recording of it.
     */
    preferLive?: boolean;
}

type PreviewMode = 'live' | 'video' | 'iframe' | 'gradient';

/**
 * The full preview ladder, resolved once and rendered once.
 *
 * Default order (video first) keeps /templates/:id unchanged. With `preferLive`
 * the live component moves ahead of the video, but only when the registry
 * actually has a chunk for the item - otherwise it falls through to the same
 * video / iframe / gradient ladder rather than rendering an empty canvas.
 */
export const TemplatePreviewStage: React.FC<TemplatePreviewStageProps> = ({
    template,
    resetKey,
    isLoadingIframe,
    onIframeLoad,
    preferLive = false,
}) => {
    const hasLiveComponent = !!TEMPLATE_PREVIEWS[template.id];

    const mode: PreviewMode =
        preferLive && hasLiveComponent ? 'live'
            : template.previewVideo ? 'video'
                : hasLiveComponent ? 'live'
                    : template.liveDemoUrl ? 'iframe'
                        : 'gradient';

    return (
        <div className="min-h-[65vh] flex-1 overflow-auto bg-[#0d0e10]">
            {mode === 'live' && (
                <div className={`relative w-full ${TEMPLATE_PREVIEW_BGS[template.id] ?? ''}`}>
                    <ScaledTemplateScene>
                        <LazyTemplateRenderer
                            template={template}
                            resetKey={resetKey}
                            preferLive={preferLive}
                        />
                    </ScaledTemplateScene>
                </div>
            )}

            {mode === 'video' && (
                <video
                    key={`template-video-${resetKey}`}
                    src={template.previewVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    aria-label={`${template.title} preview`}
                    className="block min-h-[65vh] w-full bg-[#101216] object-cover object-top"
                />
            )}

            {mode === 'iframe' && (
                <div className="relative h-[78dvh] min-h-[65vh] w-full bg-white">
                    {isLoadingIframe && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/80">
                            <div className="h-8 w-8 rounded-full border-2 border-[#1F4BFF] border-t-transparent animate-spin" />
                            <span className="text-xs text-neutral-300">Loading live preview...</span>
                        </div>
                    )}
                    <iframe
                        key={`template-frame-${resetKey}`}
                        src={template.liveDemoUrl}
                        title={`${template.title} live preview`}
                        className="h-full w-full border-none bg-white"
                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                        onLoad={onIframeLoad}
                    />
                </div>
            )}

            {mode === 'gradient' && (
                <div className={`flex min-h-[65vh] flex-col items-center justify-center bg-gradient-to-br ${template.previewGradient} p-8 text-center`}>
                    <span className="mb-2 text-3xl font-black">{template.title}</span>
                    <p className="max-w-md text-sm text-neutral-200">{template.description}</p>
                </div>
            )}
        </div>
    );
};
