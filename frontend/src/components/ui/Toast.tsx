import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Code2, Sparkles } from 'lucide-react';

export type CopyItemKind = 'component' | 'template' | 'build';
export type CopiedContentType = 'code' | 'prompt';

export interface CopyNotification {
    itemTitle: string;
    itemKind: CopyItemKind;
    copiedType: CopiedContentType;
    aiTool?: string;
    previewImage?: string;
    previewVideo?: string;
    /** Live component preview used when no static media is available. */
    previewNode?: React.ReactNode;
    toolLogo?: React.ReactNode;
    copiedFileName?: string;
}

export interface ToastController {
    isVisible: boolean;
    message: string;
    copy: CopyNotification | null;
    showStatus: (message: string) => void;
    showCopy: (copy: CopyNotification, message: string) => void;
    hide: () => void;
}

/**
 * One toast controller per surface. Copy notifications always carry the item
 * identity and AI tool, while status messages stay on the legacy simple toast.
 */
export const useToastController = (): ToastController => {
    const [isVisible, setIsVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [copy, setCopy] = useState<CopyNotification | null>(null);

    const showStatus = useCallback((nextMessage: string) => {
        setCopy(null);
        setMessage(nextMessage);
        setIsVisible(true);
    }, []);

    const showCopy = useCallback((nextCopy: CopyNotification, nextMessage: string) => {
        setCopy(nextCopy);
        setMessage(nextMessage);
        setIsVisible(true);
    }, []);

    const hide = useCallback(() => setIsVisible(false), []);

    return { isVisible, message, copy, showStatus, showCopy, hide };
};

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    image?: string;
    imageAlt?: string;
    logo?: React.ReactNode;
    position?: 'bottom-center' | 'bottom-right';
    copy?: CopyNotification | null;
}

const ITEM_KIND_LABEL: Record<CopyItemKind, string> = {
    component: 'Component',
    template: 'Template',
    build: 'Build with UI HUB',
};

const LIVE_STAGE_WIDTH = 400;
const LIVE_STAGE_HEIGHT = 240;

const LiveCopyPreview = ({ node }: { node: React.ReactNode }) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const stageRef = React.useRef<HTMLDivElement>(null);
    const [scale, setScale] = React.useState(0.38);
    const scaleRef = React.useRef(scale);
    scaleRef.current = scale;

    React.useLayoutEffect(() => {
        const container = containerRef.current;
        const stage = stageRef.current;
        if (!container || !stage) return;

        const updateScale = () => {
            const cw = container.clientWidth;
            const ch = container.clientHeight;
            if (!cw || !ch) return;

            const fallbackScale = Math.min(cw / LIVE_STAGE_WIDTH, ch / LIVE_STAGE_HEIGHT);
            const target = stage.firstElementChild as HTMLElement | SVGElement | null;
            if (!target) {
                if (Math.abs(fallbackScale - scaleRef.current) > 0.01) {
                    setScale(fallbackScale);
                }
                return;
            }

            const rect = target.getBoundingClientRect();
            const current = scaleRef.current || fallbackScale;
            const unscaledW = rect.width / current;
            const unscaledH = rect.height / current;
            if (unscaledW < 4 || unscaledH < 4) return;

            const isFullBleed =
                unscaledW >= LIVE_STAGE_WIDTH * 0.88 && unscaledH >= LIVE_STAGE_HEIGHT * 0.88;
            const pad = isFullBleed ? 0 : 14;
            const availW = Math.max(cw - pad, 40);
            const availH = Math.max(ch - pad, 40);
            const nextScale = Math.min(availW / unscaledW, availH / unscaledH, isFullBleed ? 1 : 0.95);

            if (Number.isFinite(nextScale) && nextScale > 0.05 && Math.abs(nextScale - scaleRef.current) > 0.01) {
                setScale(nextScale);
            }
        };

        updateScale();
        const resizeObserver = new ResizeObserver(updateScale);
        resizeObserver.observe(container);
        const mutationObserver = new MutationObserver(updateScale);
        mutationObserver.observe(stage, { childList: true, subtree: true });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [node]);

    return (
        <div ref={containerRef} className="absolute inset-0 flex items-center justify-center overflow-hidden bg-[#08090c]">
            <div
                ref={stageRef}
                className="flex shrink-0 origin-center items-center justify-center overflow-hidden [&_*]:pointer-events-none"
                style={{
                    width: LIVE_STAGE_WIDTH,
                    height: LIVE_STAGE_HEIGHT,
                    transform: `scale(${scale})`,
                }}
            >
                <React.Suspense fallback={null}>{node}</React.Suspense>
            </div>
        </div>
    );
};

const CopyPreview = ({ copy }: { copy: CopyNotification }) => {
    const [mediaFailed, setMediaFailed] = React.useState(false);
    const hasVideo = Boolean(copy.previewVideo) && !mediaFailed;
    const hasImage = Boolean(copy.previewImage) && !mediaFailed && !hasVideo;
    const hasLivePreview = Boolean(copy.previewNode) && !hasVideo && !hasImage;

    return (
        <div className="relative h-[84px] w-[132px] shrink-0 overflow-hidden rounded-lg border-2 border-black bg-[#08090c] shadow-[3px_3px_0px_0px_#000000] sm:h-[96px] sm:w-[160px]">
            {hasVideo && (
                <video
                    src={copy.previewVideo}
                    poster={copy.previewImage}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    onError={() => setMediaFailed(true)}
                    className="absolute inset-0 z-10 h-full w-full object-contain object-center"
                />
            )}
            {hasImage && (
                <img
                    src={copy.previewImage}
                    alt={`${copy.itemTitle} preview`}
                    onError={() => setMediaFailed(true)}
                    className="absolute inset-0 z-10 h-full w-full object-contain object-center"
                />
            )}
            {hasLivePreview && <LiveCopyPreview node={copy.previewNode} />}
            {!hasVideo && !hasImage && !hasLivePreview && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-1 text-brand-yellow">
                    {copy.copiedType === 'code' ? (
                        <Code2 size={28} strokeWidth={2.5} />
                    ) : (
                        <Sparkles size={28} strokeWidth={2.5} />
                    )}
                    <span className="font-mono text-[8px] font-black uppercase tracking-[0.14em] text-white/75">
                        Preview
                    </span>
                </div>
            )}
        </div>
    );
};

const Toast = ({
    message,
    isVisible,
    onClose,
    duration = 3600,
    image,
    imageAlt,
    logo,
    position = 'bottom-right',
    copy,
}: ToastProps) => {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    const hasRichContent = Boolean(image || logo);
    const isCenter = Boolean(copy) || position === 'bottom-center';

    return (
        <AnimatePresence>
            {isVisible && (
                <div
                    role="status"
                    aria-live="polite"
                    className={
                        isCenter
                            ? 'fixed bottom-6 left-1/2 z-[9999] flex w-auto max-w-[92vw] -translate-x-1/2 items-center justify-center pointer-events-none sm:bottom-8'
                            : 'fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-[9999] pointer-events-none flex sm:justify-end justify-center'
                    }
                >
                    <motion.div
                        key={`${message}-${copy?.itemTitle ?? ''}-${copy?.copiedFileName ?? ''}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30,
                        }}
                        className="relative pointer-events-auto"
                    >
                        {copy ? (
                            <div className="relative w-[min(94vw,32rem)] overflow-hidden rounded-xl border-2 border-white bg-[#101114] p-2.5 brutal-shadow-blue">
                                <div className="flex items-center gap-2 pb-2">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 border-black bg-brand-yellow shadow-[2px_2px_0px_0px_#000000]">
                                        <Check size={13} strokeWidth={4} className="text-black" />
                                    </div>
                                    <span className="min-w-0 flex-1 truncate font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white">
                                        {message}
                                    </span>
                                    {copy.toolLogo && (
                                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-white/15 bg-white/5">
                                            {copy.toolLogo}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-2">
                                    <CopyPreview
                                        key={`${copy.itemTitle}-${copy.copiedType}-${copy.previewVideo || copy.previewImage || 'live'}`}
                                        copy={copy}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-brand-blue">
                                            Copied {ITEM_KIND_LABEL[copy.itemKind]}
                                        </p>
                                        <p className="truncate text-base font-black uppercase tracking-wide text-white">
                                            {copy.itemTitle}
                                        </p>
                                        <p className="mt-1 truncate font-mono text-[10px] text-neutral-300">
                                            {copy.copiedType === 'prompt'
                                                ? copy.aiTool
                                                    ? `Prompt ready for ${copy.aiTool}`
                                                    : 'AI prompt ready to paste'
                                                : copy.copiedFileName
                                                    ? `${copy.copiedFileName} copied`
                                                    : 'Source ready to paste'}
                                        </p>
                                        <div className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded border border-white/15 bg-white/5 px-2 py-1">
                                            <span className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-brand-yellow">
                                                {copy.copiedType === 'prompt' ? 'AI tool' : 'File'}
                                            </span>
                                            <span className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-white/85">
                                                {copy.copiedType === 'prompt'
                                                    ? copy.aiTool || 'AI prompt'
                                                    : copy.copiedFileName || 'Source file'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <motion.div
                                    className="absolute inset-x-0 bottom-0 h-[3px] origin-left bg-brand-yellow"
                                    initial={{ scaleX: 1 }}
                                    animate={{ scaleX: 0 }}
                                    transition={{ duration: duration / 1000, ease: 'linear' }}
                                />
                            </div>
                        ) : hasRichContent ? (
                            <div className="relative flex items-center gap-3 pr-5 py-2 pl-2.5 bg-brand-surface border-2 border-white rounded-lg brutal-shadow-blue max-w-full sm:max-w-sm">
                                {image && (
                                    <img
                                        src={image}
                                        alt={imageAlt || 'preview'}
                                        className="w-11 h-11 rounded-md border-2 border-black object-cover shrink-0"
                                    />
                                )}
                                <div className="flex flex-col gap-1 min-w-0">
                                    {logo && <div className="flex items-center">{logo}</div>}
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest font-heading break-words min-w-0">
                                        {message}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-3 pl-2.5 pr-5 py-2.5 bg-brand-surface border-2 border-white rounded-lg brutal-shadow-blue max-w-full sm:max-w-sm">
                                <div className="w-6 h-6 rounded-md bg-brand-yellow border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] shrink-0">
                                    <Check size={12} strokeWidth={4} className="text-black" />
                                </div>

                                <span className="text-[11px] font-black text-white uppercase tracking-widest font-heading break-words min-w-0">
                                    {message}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
