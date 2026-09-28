import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Copy,
    Check,
    ChevronDown,
    ChevronRight,
    RotateCcw,
    Code2,
    Eye,
    ExternalLink,
    Maximize2,
    Minimize2,
    Terminal
} from 'lucide-react';
import { websiteTemplates, TemplateItem } from '../../data/templatesData';
import { buildTemplatePrompt } from '../../utils/templatePromptUtils';
import {
    TEMPLATE_PREVIEWS,
    TEMPLATE_PREVIEW_BGS,
} from '../../components/templates/registry';
import TemplateCodeViewer from '../../components/templates/TemplateCodeViewer';
import TemplateSimilarRail from '../../components/templates/TemplateSimilarRail';
import Toast from '../../components/ui/Toast';

type AISystem = 'advance' | 'antigravity' | 'claude' | 'cursor' | 'lovable';

const PROMPT_OPTIONS: { system: AISystem; label: string; iconPath: string }[] = [
    { system: 'advance', label: 'ADVANCE', iconPath: '/favicon.svg' },
    { system: 'antigravity', label: 'ANTIGRAVITY', iconPath: '/logos/antigravity-color.svg' },
    { system: 'claude', label: 'CLAUDE CODE', iconPath: '/logos/claude-color.svg' },
    { system: 'cursor', label: 'CURSOR', iconPath: '/logos/Cursor_Symbol_0.svg' },
    { system: 'lovable', label: 'LOVABLE', iconPath: '/logos/lovable-color.svg' },
];

/** Query param that keeps the Similar Templates rail fully expanded. */
const SIMILAR_PARAM = 'similar';

// Desktop-only preview: renders the template on a fixed 1280px desktop canvas
// and scales it down to fit the preview container, so the full desktop layout
// is always visible (never tablet/mobile responsive variants, no raw overflow).
const CANVAS_WIDTH = 1280;

const ScaledTemplateScene: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

// Instant visual: shows the static template screenshot while the live component chunk loads.
const PreviewImageFallback: React.FC<{ id: string }> = ({ id }) => {
    const t = websiteTemplates.find((x) => x.id === id);
    if (!t) return null;
    return (
        <div className="relative w-[1280px] h-[720px] overflow-hidden">
            {t.previewVideo ? (
                <video
                    src={t.previewVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover object-top"
                />
            ) : t.previewImage ? (
                <img
                    src={t.previewImage}
                    alt={`${t.title} preview`}
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-top"
                />
            ) : (
                <div className={`w-full h-full bg-gradient-to-br ${t.previewGradient}`} />
            )}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/85 border border-white/20 text-white text-[9px] font-mono font-bold uppercase tracking-widest flex items-center gap-1.5 select-none">
                <span className="w-2 h-2 border-2 border-[#1F4BFF] border-t-transparent rounded-full animate-spin" />
                <span>Loading preview...</span>
            </div>
        </div>
    );
};

// Lazy-loads ONLY the selected template's component chunk (fast first paint,
// no more loading all 16 previews + three.js before showing anything).
const LazyTemplateRenderer: React.FC<{ id: string; resetKey: number }> = ({ id, resetKey }) => {
    const Comp = useMemo(() => React.lazy(TEMPLATE_PREVIEWS[id]), [id]);
    return (
        <React.Suspense fallback={<PreviewImageFallback id={id} />}>
            <Comp key={resetKey} />
        </React.Suspense>
    );
};

const TemplateDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Unknown ids used to silently fall back to websiteTemplates[0], so a typo
    // or a removed template rendered an unrelated page as if it were the real one.
    const template: TemplateItem | undefined = useMemo(
        () => websiteTemplates.find((t) => t.id === id),
        [id],
    );

    const similarExpanded = searchParams.get(SIMILAR_PARAM) === 'all';

    const toggleSimilarExpanded = useCallback(() => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (next.get(SIMILAR_PARAM) === 'all') {
                    next.delete(SIMILAR_PARAM);
                } else {
                    next.set(SIMILAR_PARAM, 'all');
                }
                return next;
            },
            // Push a history entry so the browser Back button collapses the rail
            // again instead of only leaving the page.
            { replace: false },
        );
    }, [setSearchParams]);

    const [promptMenuOpen, setPromptMenuOpen] = useState(false);
    const [promptCopied, setPromptCopied] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [isLoadingIframe, setIsLoadingIframe] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastToolLogo, setToastToolLogo] = useState<React.ReactNode | null>(null);
    const [showCode, setShowCode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const promptMenuRef = useRef<HTMLDivElement>(null);

    // Scroll window to top when template detail page opens or changes
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (promptMenuRef.current && !promptMenuRef.current.contains(e.target as Node)) {
                setPromptMenuOpen(false);
            }
        };
        if (promptMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [promptMenuOpen]);

    // Every hook above runs unconditionally so hook order stays stable; the
    // unknown-id bail-out has to come after them all.
    if (!template) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#101114] px-6 text-center text-white">
                <div className="text-2xl font-semibold">Template not found</div>
                <p className="max-w-md text-sm text-neutral-400">
                    We could not find a template with the id <code className="text-neutral-200">{id}</code>.
                    It may have been renamed or removed.
                </p>
                <button
                    onClick={() => navigate('/templates')}
                    className="rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                    Back to all templates
                </button>
            </div>
        );
    }

    const handleCopyPrompt = (system: AISystem = 'cursor') => {
        const text = buildTemplatePrompt(template, system);
        navigator.clipboard.writeText(text);
        setPromptCopied(system);
        setTimeout(() => setPromptCopied(null), 2500);
        setPromptMenuOpen(false);

        const selectedOption = PROMPT_OPTIONS.find(o => o.system === system);
        const label = selectedOption?.label || system.toUpperCase();
        setToastMessage(`${label} PROMPT COPIED TO CLIPBOARD`);
        if (selectedOption) {
            setToastToolLogo(
                <img
                    src={selectedOption.iconPath}
                    alt={selectedOption.label}
                    className={`w-4 h-4 shrink-0 object-contain ${system === 'cursor' ? 'brightness-0 invert' : ''
                        }`}
                />
            );
        } else {
            setToastToolLogo(null);
        }
        setShowToast(true);
    };

    return (
        <div className="min-h-screen bg-[#101114] text-white pt-16 lg:pt-[72px]">
            <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
                <TemplateSimilarRail
                    template={template}
                    expanded={similarExpanded}
                    onToggleExpanded={toggleSimilarExpanded}
                />

                <main className="w-full min-w-0 px-4 pb-8 sm:px-6 lg:flex-1 lg:px-9">
                    <div className="mx-auto max-w-[1500px]">
                        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-3">
                            <div className="flex min-w-0 items-center gap-2 text-sm text-neutral-400">
                                <button onClick={() => navigate('/templates')} className="hover:text-white">Templates</button>
                                <ChevronRight size={15} />
                                <span className="hidden sm:inline truncate">{template.category}</span>
                                <ChevronRight size={15} className="hidden sm:block" />
                                <span className="truncate text-white">{template.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative" ref={promptMenuRef}>
                                    <button
                                        onClick={() => setPromptMenuOpen((open) => !open)}
                                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-[#34363a] px-3 py-2 text-sm text-white hover:bg-[#414348] transition-colors"
                                        title="Copy a prompt for an AI coding tool"
                                    >
                                        <Terminal size={15} />
                                        <span>CLI</span>
                                        <ChevronDown size={13} className={`transition-transform ${promptMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {promptMenuOpen && (
                                        <div className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-[#202124] shadow-xl">
                                            <div className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Copy prompt for</div>
                                            {PROMPT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.system}
                                                    type="button"
                                                    onClick={() => handleCopyPrompt(option.system)}
                                                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-white/[0.06]"
                                                >
                                                    <span className="flex items-center gap-2.5">
                                                        <img src={option.iconPath} alt="" className={`h-4 w-4 object-contain ${option.system === 'cursor' ? 'brightness-0 invert' : ''}`} />
                                                        {option.label}
                                                    </span>
                                                    {promptCopied === option.system && <Check size={14} className="text-emerald-400" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {template.liveDemoUrl && (
                                    <a
                                        href={template.liveDemoUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#17181a] hover:bg-neutral-200 transition-colors"
                                    >
                                        Live Link <ExternalLink size={14} />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-neutral-400">
                            <Eye size={14} />
                            <span>{template.stats.downloads} downloads</span>
                            <span className="text-neutral-600">•</span>
                            <span>{template.framework}</span>
                        </div>

                        <section
                            className={`${isFullscreen ? 'fixed inset-0 z-[100] flex flex-col bg-[#101114] p-4 sm:p-6' : 'relative'} overflow-hidden rounded-xl border border-white/15 bg-[#141519]`}
                        >
                            <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-white/10 px-3 sm:px-4">
                                <div className="flex items-center gap-1 rounded-lg bg-[#25262a] p-1">
                                    <button onClick={() => setShowCode(false)} className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm ${!showCode ? 'bg-[#414348] text-white' : 'text-neutral-400 hover:text-white'}`}>
                                        <Eye size={15} /> Preview
                                    </button>
                                    <button onClick={() => setShowCode(true)} className={`rounded-md p-1.5 ${showCode ? 'bg-[#414348] text-white' : 'text-neutral-400 hover:text-white'}`} title="View source code" aria-label="View source code">
                                        <Code2 size={16} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setIsFullscreen((fullscreen) => !fullscreen)}
                                        className="rounded-md p-2 text-neutral-400 hover:bg-white/[0.07] hover:text-white"
                                        title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
                                        aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen preview'}
                                    >
                                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setResetKey((previous) => previous + 1);
                                            setIsLoadingIframe(true);
                                        }}
                                        className="rounded-md p-2 text-neutral-400 hover:bg-white/[0.07] hover:text-white"
                                        title="Reload preview"
                                        aria-label="Reload preview"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>

                            {showCode ? (
                                <TemplateCodeViewer
                                    templateId={template.id}
                                    title={template.title}
                                    isFullscreen={isFullscreen}
                                    onNotify={(message) => {
                                        setToastMessage(message);
                                        setShowToast(true);
                                    }}
                                />
                            ) : (
                                <div className="min-h-[65vh] flex-1 overflow-auto bg-[#0d0e10]">
                                    {template.previewVideo ? (
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
                                    ) : TEMPLATE_PREVIEWS[template.id] ? (
                                        <div className={`relative w-full ${TEMPLATE_PREVIEW_BGS[template.id]}`}>
                                            <ScaledTemplateScene>
                                                <LazyTemplateRenderer id={template.id} resetKey={resetKey} />
                                            </ScaledTemplateScene>
                                        </div>
                                    ) : template.liveDemoUrl ? (
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
                                                onLoad={() => setIsLoadingIframe(false)}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`flex min-h-[65vh] flex-col items-center justify-center bg-gradient-to-br ${template.previewGradient} p-8 text-center`}>
                                            <span className="mb-2 text-3xl font-black">{template.title}</span>
                                            <p className="max-w-md text-sm text-neutral-200">{template.description}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>
                    </div>
                </main>
            </div>

            {/* Bottom Center Toast Notification on Prompt Copy */}
            <Toast
                isVisible={showToast}
                message={toastMessage}
                logo={toastToolLogo}
                position="bottom-center"
                onClose={() => setShowToast(false)}
            />
        </div>
    );
};

export default TemplateDetailPage;
