import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { TemplateItem } from '../../data/templatesData';
import { TEMPLATE_PREVIEWS, TEMPLATE_PREVIEW_BGS, resolvePreviewSource } from './registry';

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
 * The loading fallback renders inside the main preview area. The recorded WebM
 * is never used here: it is thumbnail media only, and it must not become the
 * full-size live preview under any circumstance.
 */
export const PreviewImageFallback: React.FC<{
    template: TemplateItem;
}> = ({ template }) => {
    const [imageFailed, setImageFailed] = useState(false);

    // A fresh template gets a fresh <img>, so a broken src from the previous
    // card must not keep this fallback hidden on the next one.
    useEffect(() => {
        setImageFailed(false);
    }, [template.id]);

    return (
        // Background matches the live branch so the swap to the real component
        // does not flash a different colour.
        <div
            className={`relative w-[1280px] h-[720px] overflow-hidden ${TEMPLATE_PREVIEW_BGS[template.id] ?? ''}`}
        >
            {template.previewImage && !imageFailed ? (
                <img
                    src={template.previewImage}
                    alt={`${template.title} preview`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={() => setImageFailed(true)}
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
 * Fires once when the lazy preview element actually mounts, i.e. after its chunk
 * has loaded and painted. Lets the page pause the Similar Templates WebM loading
 * until the live component is on screen, instead of both competing for bandwidth.
 */
const ReadyGate: React.FC<{ onReady?: () => void; children: React.ReactNode }> = ({ onReady, children }) => {
    useEffect(() => {
        onReady?.();
    }, [onReady]);
    return <>{children}</>;
};

/**
 * Lazy-loads ONLY the selected template's component chunk (fast first paint,
 * no more loading every preview + three.js before showing anything).
 */
export const LazyTemplateRenderer: React.FC<{
    template: TemplateItem;
    resetKey: number;
    retryKey: number;
    /** Called once the lazy component has mounted (its chunk finished loading). */
    onLiveReady?: () => void;
}> = ({ template, resetKey, retryKey, onLiveReady }) => {
    const Comp = useMemo(
        () => React.lazy(TEMPLATE_PREVIEWS[template.id]),
        [template.id, retryKey],
    );
    return (
        <React.Suspense fallback={<PreviewImageFallback template={template} />}>
            <ReadyGate onReady={onLiveReady}>
                <Comp key={`${resetKey}-${retryKey}`} />
            </ReadyGate>
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
    /** Called once the live component chunk has loaded and painted. */
    onLiveReady?: () => void;
    /** Invoked when the user clicks "Try again" after a lazy chunk load fails. */
    onRetry?: () => void;
}

type PreviewMode = 'live' | 'iframe' | 'gradient';

/**
 * Guards the live preview against a lazy chunk that fails to load.
 *
 * Without this a rejected dynamic import is thrown during render and takes the
 * whole page down with it - a 404 on a new deploy's chunk hash would blank the
 * detail page instead of just the preview. The boundary wraps only the preview
 * body so the Preview/Code/Fullscreen/Reload toolbar always stays usable.
 *
 * Its key carries (template, reload, retry), so a failed preview never follows
 * the visitor to the next template or survives a reload - each of those gets a
 * fresh boundary with a clean slate.
 */
class PreviewErrorBoundary extends React.Component<
    { children: React.ReactNode; template: TemplateItem; onRetry?: () => void },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode; template: TemplateItem; onRetry?: () => void }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('[TemplatePreview Error]:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className={`flex min-h-[65vh] flex-col items-center justify-center gap-5 bg-gradient-to-br ${this.props.template.previewGradient} p-8 text-center`}
                >
                    <div>
                        <p className="text-sm font-medium text-white">Unable to load live preview.</p>
                        <p className="mt-1.5 text-xs text-neutral-600">
                            The preview for {this.props.template.title} could not be loaded.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={this.props.onRetry}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-neutral-200 transition-colors hover:bg-white/[0.1] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                    >
                        <RotateCcw size={14} aria-hidden="true" />
                        Try again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

/**
 * The main preview, resolved once and rendered once.
 *
 * `resolvePreviewSource` owns the decision; there is deliberately no video mode
 * here. Thumbnail media (previewVideo / previewImage) is a card-level concern,
 * so a template with no live representation degrades to its brand gradient
 * rather than loading a multi-megabyte recording as if it were the template.
 */
export const TemplatePreviewStage: React.FC<TemplatePreviewStageProps> = ({
    template,
    resetKey,
    isLoadingIframe,
    onIframeLoad,
    onLiveReady,
    onRetry,
}) => {
    const [retryKey, setRetryKey] = useState(0);
    const source = resolvePreviewSource(template);
    const mode: PreviewMode =
        source.kind === 'component' ? 'live' : source.kind === 'iframe' ? 'iframe' : 'gradient';

    // React caches a rejected lazy() promise, and LazyTemplateRenderer memoises
    // the component on (template.id, retryKey). Both have to change for a retry
    // to actually re-request the chunk rather than re-throwing the old error.
    const handleRetry = useCallback(() => {
        setRetryKey((key) => key + 1);
        onRetry?.();
    }, [onRetry]);

    return (
        <div className="min-h-[65vh] flex-1 overflow-auto bg-[#0d0e10]">
            {mode === 'live' && (
                <div className={`relative w-full ${TEMPLATE_PREVIEW_BGS[template.id] ?? ''}`}>
                    <PreviewErrorBoundary
                        key={`${template.id}-${resetKey}-${retryKey}`}
                        template={template}
                        onRetry={handleRetry}
                    >
                        <ScaledTemplateScene key={`${template.id}-${resetKey}`}>
                            <LazyTemplateRenderer
                                template={template}
                                resetKey={resetKey}
                                retryKey={retryKey}
                                onLiveReady={onLiveReady}
                            />
                        </ScaledTemplateScene>
                    </PreviewErrorBoundary>
                </div>
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
                        src={source.kind === 'iframe' ? source.url : undefined}
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
                    <p className="mt-6 text-xs text-neutral-600">
                        No live preview available for this template.
                    </p>
                </div>
            )}
        </div>
    );
};
