import React, { useState, useRef, useEffect, useMemo, lazy, Suspense } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import {
    ArrowLeft,
    Check,
    ChevronDown,
    ChevronRight,
    RotateCcw,
    Code2,
    Eye,
    Maximize2,
    Minimize2,
    Sparkles,
    Terminal
} from 'lucide-react';
import {
    buildWithUIHubTemplateBySlug,
    buildWithUIHubSlugByTemplateId,
    TemplateItem,
} from '../../data/templatesData';
import { TemplatePreviewStage } from '../../components/templates/TemplatePreviewStage';
import BuildWithUIHubRail from '../../components/templates/BuildWithUIHubRail';
import BuildWithUIHubUsedComponents from '../../components/templates/BuildWithUIHubUsedComponents';
import { buildWithUIHubSectionBySlug } from '../../data/buildWithUIHubSlugs';
import Toast, { useToastController } from '../../components/ui/Toast';
import { formatViewCount, recordTemplateView } from '../../services/templateViews';
import { useTemplateViewCounts } from '../../hooks/useTemplateViewCounts';
import { useSeo } from '../../components/Seo';
import { buildDetailSeoConfig } from '../../seo/runtime';

// Both of these sit behind a click - the Code tab and the AI prompt dropdown -
// but a static import cost the page ~3.2 MB of JavaScript before the preview
// could paint. TemplateCodeViewer embeds the full text of all 19 template
// components via ?raw, and templatePromptUtils pulls the component library
// catalog through utils/promptUtils. Loaded on demand instead.
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

const SECTION_PATH = '/build-with-ui-hub';

/** Components exposed as a shortcut beside the Preview toolbar button. */
const COMPONENT_SHORTCUT_BY_SLUG: Record<string, { id: string; label: string }> = {
    'redline-mars': { id: 'mars-animation', label: 'Mars Animation' },
    distill: { id: 'cards-beam', label: 'Cards Beam' },
};

/**
 * Detail page for a "Build with UI HUB" section.
 *
 * Deliberately the same experience as /templates/:id - breadcrumb, AI prompt
 * dropdown, Preview | Code tabs, fullscreen and reload - so the two catalogs
 * feel identical once you open a card. Two things differ:
 *
 *   1. The left rail is a flat list of published section URLs rather than a
 *      relevance-ranked "Similar Templates" panel.
 *   2. The preview renders the live component. A section is one full-screen
 *      layout, so the visitor expects the real thing rather than a recording of
 *      it, and the recorded video is only the loading state.
 *
 * It is routed by public slug (`/build-with-ui-hub/UIHUB-hero-1`), which is kept
 * separate from the master template id.
 */
const BuildWithUIHubDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();

    const sectionItem: TemplateItem | undefined = useMemo(
        () => buildWithUIHubTemplateBySlug[slug],
        [slug],
    );
    const templateViewCounts = useTemplateViewCounts(sectionItem ? [sectionItem.id] : []);

    // The full section record, which carries the componentIds the "Built with
    // UI HUB" panel below the preview lists. Read from the dependency-free slug
    // module rather than the template catalog.
    const sectionRecord = useMemo(() => buildWithUIHubSectionBySlug[slug], [slug]);
    const componentShortcut = slug ? COMPONENT_SHORTCUT_BY_SLUG[slug] : undefined;

    const [promptMenuOpen, setPromptMenuOpen] = useState(false);
    const [promptCopied, setPromptCopied] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [isLoadingIframe, setIsLoadingIframe] = useState(true);
    const {
        isVisible: showToast,
        message: toastMessage,
        copy: toastCopy,
        showCopy: showCopyToast,
        hide: hideToast,
    } = useToastController();
    const [showCode, setShowCode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const promptMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    useEffect(() => {
        if (!isFullscreen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isFullscreen]);

    useEffect(() => {
        if (!sectionItem) return;
        void recordTemplateView(sectionItem.id).catch(() => {
            // Tracking failure is reported by the service and does not block the preview.
        });
    }, [sectionItem?.id]);

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

    // Runtime head must match the prerendered document for this slug.
    const seoConfig = useMemo(() => (slug ? buildDetailSeoConfig(slug) : undefined), [slug]);
    useSeo(
        seoConfig ?? {
            title: 'Section Not Found | UI Hub',
            description:
                'That Build with UI HUB section could not be found. Browse all free page sections on UI HUB instead.',
            canonicalPath: '/404',
            robots: 'noindex, follow',
            jsonLd: [],
        },
    );

    // Canonical URL guard. A slug that is actually a master template id - an old
    // link, or the id before the section was given a slug of its own - is sent
    // to its real URL. Runs for every slug, so future renames are covered too.
    const canonicalSlug = buildWithUIHubSlugByTemplateId[slug];
    if (canonicalSlug) {
        return <Navigate to={`${SECTION_PATH}/${canonicalSlug}`} replace />;
    }

    // Every hook above runs unconditionally so hook order stays stable; the
    // unknown-slug bail-out has to come after them all.
    if (!sectionItem) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-[#101114] px-6 text-center text-white">
                <div className="text-2xl font-semibold">Section layout not found</div>
                <p className="max-w-md text-sm text-neutral-400">
                    We could not find a Build with UI HUB section at{' '}
                    <code className="text-neutral-200">{slug}</code>. It may have been renamed or removed.
                </p>
                <button
                    onClick={() => navigate(SECTION_PATH)}
                    className="rounded-lg border border-white/15 bg-white/[0.05] px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                    Back to all sections
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
            const text = buildTemplatePrompt(sectionItem, system);
            navigator.clipboard.writeText(text);
            setPromptCopied(system);
            setTimeout(() => setPromptCopied(null), 2500);
            setPromptMenuOpen(false);

            const selectedOption = PROMPT_OPTIONS.find((o) => o.system === system);
            const label = selectedOption?.label || system.toUpperCase();
            showCopyToast(
                {
                    itemTitle: sectionItem.title,
                    itemKind: 'build',
                    copiedType: 'prompt',
                    aiTool: label,
                    previewImage: sectionItem.previewImage || sectionItem.thumbnailUrl,
                    previewVideo: sectionItem.previewVideo,
                    toolLogo: selectedOption ? (
                        <img
                            src={selectedOption.iconPath}
                            alt={selectedOption.label}
                            className={`h-4 w-4 shrink-0 object-contain ${system === 'cursor' ? 'brightness-0 invert' : ''
                                }`}
                        />
                    ) : undefined,
                },
                `${label} PROMPT COPIED`,
            );
        } finally {
            setIsBuildingPrompt(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pt-16 lg:pt-[72px]">
            <div className="flex min-h-[calc(100vh-64px)] flex-col lg:flex-row">
                <BuildWithUIHubRail activeSlug={slug} />

                <main className="w-full min-w-0 flex-1 px-4 pb-8 sm:px-6 lg:px-9">
                    <div className="mx-auto max-w-[1500px]">
                        <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 py-3">
                            <div className="flex min-w-0 items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                                <button
                                    onClick={() => navigate(SECTION_PATH)}
                                    className="font-mono font-bold uppercase tracking-wider text-neutral-400 hover:text-white"
                                >
                                    Build with UI HUB
                                </button>
                                <ChevronRight size={15} className="hidden sm:block" />
                                <span className="hidden sm:inline truncate">{sectionItem.category}</span>
                                <ChevronRight size={15} className="hidden sm:block" />
                                <span className="truncate text-white">{sectionItem.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative" ref={promptMenuRef}>
                                    <button
                                        onClick={() => setPromptMenuOpen((open) => !open)}
                                        className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-[#1C1C1C] px-3 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-white shadow-[3px_3px_0px_0px_#000000] hover:bg-[#3D5CFF] transition-colors"
                                        title="Copy a prompt for an AI coding tool"
                                    >
                                        <Terminal size={15} />
                                        <span>AI Prompt</span>
                                        <ChevronDown size={13} className={`transition-transform ${promptMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {promptMenuOpen && (
                                        <div className="absolute right-0 top-full z-[60] mt-2 w-56 overflow-hidden rounded-md border-2 border-black bg-[#141414] shadow-[6px_6px_0px_0px_#000000]">
                                            <div className="border-b-2 border-neutral-800 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                                {isBuildingPrompt ? 'Preparing prompt...' : 'Copy prompt for'}
                                            </div>
                                            {PROMPT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.system}
                                                    type="button"
                                                    disabled={isBuildingPrompt}
                                                    onClick={() => handleCopyPrompt(option.system)}
                                                    className="flex w-full items-center justify-between px-3 py-2.5 text-left font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-200 hover:bg-white/[0.06] disabled:opacity-50 disabled:hover:bg-transparent"
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
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (!isFullscreen) setShowCode(false);
                                        setIsFullscreen((fullscreen) => !fullscreen);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-4 py-2 font-mono text-[11px] font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000] transition-colors hover:bg-[#FFC700]"
                                    title={isFullscreen ? 'Exit fullscreen' : 'Open preview in fullscreen'}
                                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Open in Full Screen'}
                                >
                                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                    <span>{isFullscreen ? 'Exit Full Screen' : 'Open in Full Screen'}</span>
                                </button>
                            </div>
                        </div>

                        <div className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                            <Eye size={14} className="text-[#FFC700]" aria-hidden="true" />
                            <span aria-label={`${templateViewCounts[sectionItem.id] ?? 0} views`}>
                                {formatViewCount(templateViewCounts[sectionItem.id] ?? 0)} views
                            </span>
                            <span className="text-neutral-600">•</span>
                            <span>{sectionItem.framework}</span>
                        </div>

                        <section
                            className={`${isFullscreen ? 'fixed inset-0 z-[100] flex min-h-0 flex-col bg-[#0A0A0A]' : 'relative overflow-hidden rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] shadow-[6px_6px_0px_0px_#000000]'}`}
                        >
                            {!isFullscreen && (
                            <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b-2 border-neutral-800 bg-[#0A0A0A] px-3 sm:px-4">
                                <div className="flex items-center gap-1 rounded-md border-2 border-black bg-[#141414] p-1 shadow-[3px_3px_0px_0px_#000000]">
                                    <button onClick={() => setShowCode(false)} className={`inline-flex items-center gap-2 rounded-sm px-3 py-1.5 font-mono text-[11px] font-black uppercase tracking-wider ${!showCode ? 'border-2 border-black bg-[#3D5CFF] text-white shadow-[2px_2px_0px_0px_#000000]' : 'border-2 border-transparent text-neutral-400 hover:text-white'}`}>
                                        <Eye size={15} /> Preview
                                    </button>
                                    <button onClick={() => setShowCode(true)} className={`rounded-sm p-1.5 ${showCode ? 'border-2 border-black bg-[#FFC700] text-black shadow-[2px_2px_0px_0px_#000000]' : 'border-2 border-transparent text-neutral-400 hover:text-white'}`} title="View source code" aria-label="View source code">
                                        <Code2 size={16} />
                                    </button>
                                </div>
                                {componentShortcut && (
                                    <button
                                        type="button"
                                        onClick={() => navigate(`/library?id=${encodeURIComponent(componentShortcut.id)}`)}
                                        title={`Open ${componentShortcut.label} in the UI HUB component library`}
                                        aria-label={`Open ${componentShortcut.label} in the UI HUB component library`}
                                        className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border-2 border-black bg-[#FFC700] px-2 py-1.5 font-mono text-[9px] font-black uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_#000000] transition-colors hover:bg-white sm:text-[10px]"
                                    >
                                        <Sparkles size={13} aria-hidden="true" />
                                        <span className="whitespace-nowrap">{componentShortcut.label}</span>
                                    </button>
                                )}
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            if (!isFullscreen) setShowCode(false);
                                            setIsFullscreen((fullscreen) => !fullscreen);
                                        }}
                                        className="rounded-sm border-2 border-black bg-[#1C1C1C] p-2 text-neutral-400 shadow-[2px_2px_0px_0px_#000000] hover:bg-[#3D5CFF] hover:text-white"
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
                                        className="rounded-sm border-2 border-black bg-[#1C1C1C] p-2 text-neutral-400 shadow-[2px_2px_0px_0px_#000000] hover:bg-[#3D5CFF] hover:text-white"
                                        title="Reload preview"
                                        aria-label="Reload preview"
                                    >
                                        <RotateCcw size={16} />
                                    </button>
                                </div>
                            </div>
                            )}

                            {isFullscreen && (
                                <button
                                    type="button"
                                    onClick={() => setIsFullscreen(false)}
                                    className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-black shadow-[3px_3px_0px_0px_#000000] transition-colors hover:bg-[#FFC700] sm:text-[11px]"
                                    title="Exit fullscreen"
                                    aria-label="Exit fullscreen"
                                >
                                    <ArrowLeft size={14} aria-hidden="true" />
                                    <span>Exit Full Screen</span>
                                </button>
                            )}
                            {showCode ? (
                                <Suspense
                                    fallback={
                                        <div className="flex min-h-[65vh] items-center justify-center gap-3 bg-[#0B0B0D] font-mono text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#3D5CFF] border-t-transparent" />
                                            <span className="font-mono text-[11px] font-black uppercase tracking-widest">Loading source code...</span>
                                        </div>
                                    }
                                >
                                    <TemplateCodeViewer
                                        templateId={sectionItem.id}
                                        title={sectionItem.title}
                                        isFullscreen={isFullscreen}
                                        notificationKind="build"
                                        previewImage={sectionItem.previewImage || sectionItem.thumbnailUrl}
                                        previewVideo={sectionItem.previewVideo}
                                        onNotify={(copy) => {
                                            showCopyToast(copy, 'CODE COPIED');
                                        }}
                                    />
                                </Suspense>
                            ) : (
                                <TemplatePreviewStage
                                    template={sectionItem}
                                    resetKey={resetKey}
                                    isLoadingIframe={isLoadingIframe}
                                    onIframeLoad={() => setIsLoadingIframe(false)}
                                    fillFullscreen={isFullscreen}
                                />
                            )}
                        </section>

                        {/* Which UI HUB components this section is built from. A
                            sibling of the preview, not a child: the preview turns
                            into a fixed fullscreen overlay, and a panel inside it
                            would either be covered or orphaned. */}
                        <BuildWithUIHubUsedComponents
                            componentIds={sectionRecord?.componentIds ?? []}
                        />
                    </div>
                </main>
            </div>

            {/* Bottom Center Toast Notification on Prompt Copy */}
            <Toast
                isVisible={showToast}
                message={toastMessage}
                copy={toastCopy}
                position="bottom-center"
                onClose={hideToast}
            />
        </div>
    );
};

export default BuildWithUIHubDetailPage;
