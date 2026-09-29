import React, { useState, useRef, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';
import { useParams, useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import {
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
import { websiteTemplates, buildWithUIHubSlugByTemplateId, TemplateItem } from '../../data/templatesData';
import TemplateSimilarRail from '../../components/templates/TemplateSimilarRail';
import { TemplatePreviewStage } from '../../components/templates/TemplatePreviewStage';
import Toast from '../../components/ui/Toast';

// The Code tab is behind a click, but a static import cost this page ~3.2 MB of
// JavaScript before the preview could paint anything: TemplateCodeViewer pulls
// data/templateSourceCode, which embeds the full text of all 19 template
// components as ?raw strings, and templatePromptUtils pulls the component
// library catalog through utils/promptUtils. Neither is needed to show a preview,
// so both are loaded on demand instead.
const TemplateCodeViewer = lazy(
    () => import('../../components/templates/TemplateCodeViewer'),
);

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
    // False while the main live preview chunk is still loading: it suspends the
    // Similar Templates WebM cards so they do not compete for bandwidth, and is
    // lifted the moment the live component paints (see handleLiveReady).
    const [mainPreviewReady, setMainPreviewReady] = useState(false);

    const promptMenuRef = useRef<HTMLDivElement>(null);

    // Scroll window to top when template detail page opens or changes, and
    // rebuild the preview from scratch. The Similar rail is a same-route
    // navigation, so without this the previous template's component instance is
    // reused. ScaledTemplateScene remounts on template.id (see TemplatePreview
    // Stage), which is what clears the previous template's measured height
    // instead of inheriting it while the new chunk is still in flight.
    useEffect(() => {
        window.scrollTo(0, 0);
        setResetKey(0);
        setMainPreviewReady(false);
    }, [id]);

    // If the live chunk never reports ready (load error, blocked request, ...),
    // do not let the sidebar WebM cards stay frozen forever - release the gate
    // after a few seconds so the rail resumes its normal lazy loading.
    useEffect(() => {
        if (mainPreviewReady) return;
        const timer = setTimeout(() => setMainPreviewReady(true), 6000);
        return () => clearTimeout(timer);
    }, [id, mainPreviewReady]);

    const handleLiveReady = useCallback(() => setMainPreviewReady(true), []);

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
    // redirects and the unknown-id bail-out have to come after them all.
    //
    // A template that has been promoted to a "Build with UI HUB" section keeps
    // its id in websiteTemplates, so this route still matches it. Redirecting
    // here gives each template exactly one canonical page no matter whether the
    // visitor arrived from a stale link, a search result or a Similar rail.
    const buildWithSlug = template ? buildWithUIHubSlugByTemplateId[template.id] : undefined;
    if (buildWithSlug) {
        return <Navigate to={`/build-with-ui-hub/${buildWithSlug}`} replace />;
    }

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

    // Async because the prompt builder is no longer part of the page's static
    // graph: it drags in the component library catalog, which is far larger than
    // the preview the visitor actually came for. Cached by the module system, so
    // only the first copy pays for it.
    const [isBuildingPrompt, setIsBuildingPrompt] = useState(false);

    const handleCopyPrompt = async (system: AISystem = 'cursor') => {
        setIsBuildingPrompt(true);
        try {
            const { buildTemplatePrompt } = await import('../../utils/templatePromptUtils');
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
                        className={`h-4 w-4 shrink-0 object-contain ${system === 'cursor' ? 'brightness-0 invert' : ''
                            }`}
                    />
                );
            } else {
                setToastToolLogo(null);
            }
            setShowToast(true);
        } finally {
            setIsBuildingPrompt(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#101114] text-white pt-16 lg:pt-[72px]">
            <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
                <TemplateSimilarRail
                    template={template}
                    expanded={similarExpanded}
                    onToggleExpanded={toggleSimilarExpanded}
                    suspendVideos={!mainPreviewReady}
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
                                            <div className="border-b border-white/10 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                                                {isBuildingPrompt ? 'Preparing prompt...' : 'Copy prompt for'}
                                            </div>
                                            {PROMPT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.system}
                                                    type="button"
                                                    disabled={isBuildingPrompt}
                                                    onClick={() => handleCopyPrompt(option.system)}
                                                    className="flex w-full items-center justify-between px-3 py-2.5 text-left text-xs hover:bg-white/[0.06] disabled:opacity-50 disabled:hover:bg-transparent"
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
                                            setMainPreviewReady(false);
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
                                <Suspense
                                    fallback={
                                        <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#0d0e10] text-neutral-400">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#1F4BFF] border-t-transparent" />
                                            <span className="text-xs">Loading source code...</span>
                                        </div>
                                    }
                                >
                                    <TemplateCodeViewer
                                        templateId={template.id}
                                        title={template.title}
                                        isFullscreen={isFullscreen}
                                        onNotify={(message) => {
                                            setToastMessage(message);
                                            setShowToast(true);
                                        }}
                                    />
                                </Suspense>
                            ) : (
                                <TemplatePreviewStage
                                    template={template}
                                    resetKey={resetKey}
                                    isLoadingIframe={isLoadingIframe}
                                    onIframeLoad={() => setIsLoadingIframe(false)}
                                    onLiveReady={handleLiveReady}
                                    onRetry={() => setIsLoadingIframe(true)}
                                />
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
