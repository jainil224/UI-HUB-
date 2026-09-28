import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Copy,
    Check,
    ChevronDown,
    RotateCcw,
    ArrowLeft,
    ChevronRight,
    Code2,
    Eye,
    ExternalLink,
    FileCode2,
    FileImage,
    FolderOpen,
    Maximize2,
    Minimize2,
    Terminal
} from 'lucide-react';
import { websiteTemplates, TemplateItem } from '../../data/templatesData';
import { TEMPLATE_SOURCE_CODE } from '../../data/templateSourceCode';
import { buildTemplatePrompt } from '../../utils/templatePromptUtils';
import Toast from '../../components/ui/Toast';

type AISystem = 'advance' | 'antigravity' | 'claude' | 'cursor' | 'lovable';

const PROMPT_OPTIONS: { system: AISystem; label: string; iconPath: string }[] = [
    { system: 'advance', label: 'ADVANCE', iconPath: '/favicon.svg' },
    { system: 'antigravity', label: 'ANTIGRAVITY', iconPath: '/logos/antigravity-color.svg' },
    { system: 'claude', label: 'CLAUDE CODE', iconPath: '/logos/claude-color.svg' },
    { system: 'cursor', label: 'CURSOR', iconPath: '/logos/Cursor_Symbol_0.svg' },
    { system: 'lovable', label: 'LOVABLE', iconPath: '/logos/lovable-color.svg' },
];

const TEMPLATE_PREVIEWS: Record<string, () => Promise<{ default: React.ComponentType }>> = {
    '2586-labs': () => import('../../components/templates/Labs2586'),
    'mood-hero': () => import('../../components/templates/MoodHero'),
    'portfolio-closing': () => import('../../components/templates/PortfolioClosing'),
    'tars-protocol': () => import('../../components/templates/TarsHeroArena'),
    'split-fuzzy-orb': () => import('../../components/templates/SplitFuzzyOrbHero'),
    'segmint-2026': () => import('../../components/templates/SegmintFooter'),
    'haos-tech-solutions': () => import('../../components/templates/HaosShowcase'),
    'mentality': () => import('../../components/templates/MentalityHero'),
    'interior-design': () => import('../../components/templates/InteriorDesignShowcase'),
    'lumos': () => import('../../components/templates/LumosHero'),
    'loveapp-hero': () => import('../../components/templates/LoveAppHero'),
    'heyo-agency-cta': () => import('../../components/templates/HeyoAgencyCta'),
    'me-019-au-cabaret': () => import('../../components/templates/AuCabaretPoster'),
    'dont-be-greedy': () => import('../../components/templates/DontBeGreedyFooter'),
    'paipai-kuaishou': () => import('../../components/templates/PaipaiKuaishou'),
    'logo-here': () => import('../../components/templates/LogoHere'),
    'sui-overflow': () => import('../../components/templates/SuiOverflow'),
    'graphic-designer-portfolio': () => import('../../components/templates/GraphicDesignerPortfolio'),
    'originkit-hero-24': () => import('../../components/templates/OriginkitHero24'),
};

const TEMPLATE_SOURCE_FILES: Record<string, string> = {
    '2586-labs': 'Labs2586.tsx',
    'mood-hero': 'MoodHero.tsx',
    'portfolio-closing': 'PortfolioClosing.tsx',
    'tars-protocol': 'TarsHeroArena.tsx',
    'split-fuzzy-orb': 'SplitFuzzyOrbHero.tsx',
    'segmint-2026': 'SegmintFooter.tsx',
    'haos-tech-solutions': 'HaosShowcase.tsx',
    'mentality': 'MentalityHero.tsx',
    'interior-design': 'InteriorDesignShowcase.tsx',
    'lumos': 'LumosHero.tsx',
    'loveapp-hero': 'LoveAppHero.tsx',
    'heyo-agency-cta': 'HeyoAgencyCta.tsx',
    'me-019-au-cabaret': 'AuCabaretPoster.tsx',
    'dont-be-greedy': 'DontBeGreedyFooter.tsx',
    'paipai-kuaishou': 'PaipaiKuaishou.tsx',
    'logo-here': 'LogoHere.tsx',
    'sui-overflow': 'SuiOverflow.tsx',
    'graphic-designer-portfolio': 'GraphicDesignerPortfolio.tsx',
    'originkit-hero-24': 'UI-HUB.tsx',
};

const ORIGINKIT_HERO_24_ASSETS = [
    'avatar.png',
    'bg-desktop.png',
    'bg-ipad.png',
    'bg.png',
    'desk-mask-bottom.svg',
    'desk-mask-top.svg',
    'hand-mask-bottom.svg',
    'hand-mask-top.svg',
    'hands.png',
    'ipad-mask-bottom.svg',
    'ipad-mask-top.svg',
    'menu.svg',
];

const TEMPLATE_PREVIEW_BGS: Record<string, string> = {
    '2586-labs': 'bg-[#F8F3E5]',
    'mood-hero': 'bg-[#EDE8DE]',
    'portfolio-closing': 'bg-[#0B1014]',
    'tars-protocol': 'bg-white',
    'split-fuzzy-orb': 'bg-[#d6c0e3]',
    'segmint-2026': 'bg-[#E8E9EE]',
    'haos-tech-solutions': 'bg-[#020202]',
    'mentality': 'bg-[#F0F0F0]',
    'interior-design': 'bg-white',
    'lumos': 'bg-[#F1F1F0]',
    'loveapp-hero': 'bg-[#D8D2F8]',
    'heyo-agency-cta': 'bg-[#F5F5F2]',
    'me-019-au-cabaret': 'bg-[#EDEDED]',
    'dont-be-greedy': 'bg-[#050505]',
    'paipai-kuaishou': 'bg-[#59D1EA]',
    'logo-here': 'bg-white',
    'sui-overflow': 'bg-[#F2EFE6]',
    'graphic-designer-portfolio': 'bg-[#F7F6F2]',
    'originkit-hero-24': 'bg-[#101216]',
};

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
                    poster={t.previewImage}
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

    const template: TemplateItem = websiteTemplates.find(t => t.id === id) || websiteTemplates[0];

    const [promptMenuOpen, setPromptMenuOpen] = useState(false);
    const [promptCopied, setPromptCopied] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [isLoadingIframe, setIsLoadingIframe] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastToolLogo, setToastToolLogo] = useState<React.ReactNode | null>(null);
    const [showCode, setShowCode] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedCodeAsset, setSelectedCodeAsset] = useState<string | null>(null);

    const promptMenuRef = useRef<HTMLDivElement>(null);

    // Scroll window to top when template detail page opens or changes
    useEffect(() => {
        window.scrollTo(0, 0);
        setSelectedCodeAsset(null);
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

    const handleCopySource = () => {
        navigator.clipboard.writeText(sourceCode);
        setToastMessage(`${sourceFileName} copied to clipboard`);
        setToastToolLogo(null);
        setShowToast(true);
    };

    const relatedTemplates = websiteTemplates
        .filter((item) => item.id !== template.id)
        .sort((first, second) => Number(second.category === template.category) - Number(first.category === template.category));
    const sourceFileName = TEMPLATE_SOURCE_FILES[template.id] || `${template.id}.tsx`;
    const sourceCode = TEMPLATE_SOURCE_CODE[template.id] || '';
    const sourceLines = sourceCode.split('\n');
    const templateAssets = template.id === 'originkit-hero-24' ? ORIGINKIT_HERO_24_ASSETS : [];

    return (
        <div className="min-h-screen bg-[#101114] text-white pt-16 lg:pt-[72px]">
            <div className="flex min-h-[calc(100vh-64px)]">
                <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[280px] shrink-0 self-start flex-col border-r border-white/10 bg-[#191a1d] lg:flex">
                    <div className="h-14 shrink-0 border-b border-white/10 px-4 flex items-center">
                        <button
                            onClick={() => navigate('/templates')}
                            className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/[0.08] hover:text-white transition-colors"
                        >
                            <ArrowLeft size={14} />
                            Go back
                        </button>
                    </div>
                    <div className="px-4 py-3 text-sm font-semibold text-neutral-200">Similar Templates</div>
                    <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 space-y-2">
                        {relatedTemplates.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => navigate(`/templates/${item.id}`)}
                                className="group w-full overflow-hidden rounded-xl border border-white/10 bg-[#242528] text-left hover:border-white/25 transition-colors"
                            >
                                <div className="aspect-[16/9] overflow-hidden bg-black">
                                    {item.previewImage ? (
                                        <img src={item.previewImage} alt={`${item.title} preview`} loading="lazy" className="h-full w-full object-cover object-top" />
                                    ) : (
                                        <div className={`h-full w-full bg-gradient-to-br ${item.previewGradient}`} />
                                    )}
                                </div>
                                <span className="block truncate px-3 py-2.5 text-sm text-neutral-200 group-hover:text-white">{item.title}</span>
                            </button>
                        ))}
                    </div>
                </aside>

                <main className="min-w-0 flex-1 px-4 pb-8 sm:px-6 lg:px-9">
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
                                <div className="grid min-h-[65vh] grid-cols-[minmax(150px,220px)_minmax(0,1fr)] bg-[#202124] max-sm:grid-cols-1">
                                    <aside className="border-r border-white/10 bg-[#191a1d] py-3 text-sm max-sm:border-r-0 max-sm:border-b">
                                        <div className="flex items-center gap-2 px-3 pb-3 text-xs font-semibold text-neutral-300">
                                            <FolderOpen size={15} />
                                            <span className="truncate">{template.title}</span>
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-400">
                                                <ChevronDown size={13} /> <FolderOpen size={14} /> src
                                            </div>
                                            <div className="flex items-center gap-2 py-1.5 pl-8 text-xs text-neutral-400">
                                                <ChevronDown size={13} /> <FolderOpen size={14} /> components
                                            </div>
                                            <div className="flex items-center gap-2 py-1.5 pl-12 text-xs text-neutral-400">
                                                <ChevronDown size={13} /> <FolderOpen size={14} /> templates
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedCodeAsset(null)}
                                                className={`flex w-full items-center gap-2 py-1.5 pl-16 pr-2 text-left text-xs ${selectedCodeAsset === null ? 'bg-[#34363a] text-white' : 'text-neutral-300 hover:bg-white/[0.05]'}`}
                                            >
                                                <FileCode2 size={14} className="shrink-0 text-sky-400" />
                                                <span className="truncate">{sourceFileName}</span>
                                            </button>
                                            {templateAssets.length > 0 && (
                                                <>
                                                    <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-400">
                                                        <ChevronDown size={13} /> <FolderOpen size={14} /> public
                                                    </div>
                                                    <div className="flex items-center gap-2 py-1.5 pl-8 text-xs text-neutral-400">
                                                        <ChevronDown size={13} /> <FolderOpen size={14} /> originkit
                                                    </div>
                                                    <div className="flex items-center gap-2 py-1.5 pl-12 text-xs text-neutral-400">
                                                        <ChevronDown size={13} /> <FolderOpen size={14} /> hero-24
                                                    </div>
                                                    {templateAssets.map((asset) => (
                                                        <button
                                                            key={asset}
                                                            type="button"
                                                            onClick={() => setSelectedCodeAsset(asset)}
                                                            className={`flex w-full items-center gap-2 py-1.5 pl-16 pr-2 text-left text-xs ${selectedCodeAsset === asset ? 'bg-[#34363a] text-white' : 'text-neutral-300 hover:bg-white/[0.05]'}`}
                                                        >
                                                            <FileImage size={14} className="shrink-0 text-amber-300" />
                                                            <span className="truncate">{asset}</span>
                                                        </button>
                                                    ))}
                                                </>
                                            )}
                                        </div>
                                    </aside>
                                    <div className="flex min-w-0 flex-col overflow-hidden">
                                        <div className="flex h-10 shrink-0 items-center justify-between border-b border-white/10 bg-[#202124] px-3">
                                            <span className="flex min-w-0 items-center gap-2 text-xs text-neutral-300">
                                                {selectedCodeAsset ? <FileImage size={14} className="text-amber-300" /> : <FileCode2 size={14} className="text-sky-400" />}
                                                <span className="truncate">{selectedCodeAsset || sourceFileName}</span>
                                            </span>
                                            {!selectedCodeAsset && (
                                                <button onClick={handleCopySource} className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-xs text-neutral-300 hover:bg-white/[0.06]">
                                                    <Copy size={13} /> Copy code
                                                </button>
                                            )}
                                        </div>
                                        {selectedCodeAsset ? (
                                            <div className="flex min-h-[calc(65vh-40px)] flex-1 items-center justify-center overflow-auto bg-[#202124] p-6">
                                                <img
                                                    src={`/originkit/hero-24/${selectedCodeAsset}`}
                                                    alt={selectedCodeAsset}
                                                    className="max-h-[60vh] max-w-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="min-h-[calc(65vh-40px)] flex-1 overflow-auto bg-[#202124] py-2 font-mono text-[12px] leading-[1.65] text-[#d4d4d4] sm:text-[13px]">
                                                {sourceLines.map((line, index) => (
                                                    <div key={index} className="flex min-w-max pr-6 hover:bg-white/[0.035]">
                                                        <span className="sticky left-0 w-12 shrink-0 select-none bg-[#202124] px-3 text-right text-neutral-500">{index + 1}</span>
                                                        <span className="whitespace-pre">{line || ' '}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-[65vh] flex-1 overflow-auto bg-[#0d0e10]">
                                    {TEMPLATE_PREVIEWS[template.id] ? (
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
