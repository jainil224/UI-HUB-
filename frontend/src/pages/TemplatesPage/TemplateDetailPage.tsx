import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Copy, 
    Check, 
    ChevronDown, 
    RotateCcw, 
    ArrowLeft, 
    ArrowRight,
    ExternalLink, 
    Sparkles, 
    Monitor, 
    Tablet, 
    Smartphone
} from 'lucide-react';
import { websiteTemplates, TemplateItem } from '../../data/templatesData';
import TarsHeroArena from '../../components/templates/TarsHeroArena';
import SplitFuzzyOrbHero from '../../components/templates/SplitFuzzyOrbHero';
import SegmintFooter from '../../components/templates/SegmintFooter';
import HaosShowcase from '../../components/templates/HaosShowcase';
import MentalityHero from '../../components/templates/MentalityHero';
import LakeraHero from '../../components/templates/LakeraHero';
import InteriorDesignShowcase from '../../components/templates/InteriorDesignShowcase';
import LumosHero from '../../components/templates/LumosHero';
import LoveAppHero from '../../components/templates/LoveAppHero';
import HeyoAgencyCta from '../../components/templates/HeyoAgencyCta';
import AuCabaretPoster from '../../components/templates/AuCabaretPoster';
import DontBeGreedyFooter from '../../components/templates/DontBeGreedyFooter';
import PaipaiKuaishou from '../../components/templates/PaipaiKuaishou';
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

const TemplateDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const template: TemplateItem = websiteTemplates.find(t => t.id === id) || websiteTemplates[0];

    const [promptMenuOpen, setPromptMenuOpen] = useState(false);
    const [promptCopied, setPromptCopied] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
    const [isLoadingIframe, setIsLoadingIframe] = useState(true);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastToolLogo, setToastToolLogo] = useState<React.ReactNode | null>(null);

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
                    className={`w-4 h-4 shrink-0 object-contain ${
                        system === 'cursor' ? 'brightness-0 invert' : ''
                    }`}
                />
            );
        } else {
            setToastToolLogo(null);
        }
        setShowToast(true);
    };

    const deviceWidthClass = {
        desktop: 'w-full',
        tablet: 'w-[768px] max-w-full',
        mobile: 'w-[375px] max-w-full',
    }[deviceView];

    return (
        <div className="min-h-screen bg-black text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* ── Top Breadcrumbs & Actions ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <button
                        onClick={() => navigate('/templates')}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 border-2 border-neutral-700 text-white font-mono text-xs font-bold uppercase tracking-wider hover:border-white hover:bg-neutral-800 transition-all cursor-pointer shadow-[3px_3px_0px_0px_#000]"
                    >
                        <ArrowLeft size={14} />
                        <span>BACK TO TEMPLATES</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Device Viewport Switcher */}
                        <div className="hidden sm:flex items-center bg-[#111116] border-2 border-neutral-800 rounded-md p-1 gap-1">
                            <button
                                onClick={() => setDeviceView('desktop')}
                                className={`p-1.5 rounded transition-all cursor-pointer ${
                                    deviceView === 'desktop' ? 'bg-[#1F4BFF] text-white' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Desktop View (100%)"
                            >
                                <Monitor size={15} />
                            </button>
                            <button
                                onClick={() => setDeviceView('tablet')}
                                className={`p-1.5 rounded transition-all cursor-pointer ${
                                    deviceView === 'tablet' ? 'bg-[#1F4BFF] text-white' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Tablet View (768px)"
                            >
                                <Tablet size={15} />
                            </button>
                            <button
                                onClick={() => setDeviceView('mobile')}
                                className={`p-1.5 rounded transition-all cursor-pointer ${
                                    deviceView === 'mobile' ? 'bg-[#1F4BFF] text-white' : 'text-neutral-400 hover:text-white'
                                }`}
                                title="Mobile View (375px)"
                            >
                                <Smartphone size={15} />
                            </button>
                        </div>

                        {template.liveDemoUrl && (
                            <a
                                href={template.liveDemoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3.5 py-1.5 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFC700] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5"
                            >
                                <span>OPEN LIVE SITE</span>
                                <ExternalLink size={13} />
                            </a>
                        )}
                    </div>
                </div>

                {/* ── Browser Mockup Frame (Matching user's image exactly) ── */}
                <div className="w-full flex justify-center">
                    <div 
                        className={`transition-all duration-300 rounded-xl overflow-hidden flex flex-col bg-brand-surface border-2 border-white shadow-[8px_8px_0px_0px_#000000] ${deviceWidthClass}`}
                    >
                        {/* ── Browser Mockup Top Bar ── */}
                        <div className="w-full px-4 py-2.5 bg-black border-b-2 border-white flex items-center justify-between z-40 shrink-0 select-none">
                            {/* Left: Traffic light dots & Title */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FF3B30] border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#FFC700] border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1F4BFF] border border-black" />
                                </div>
                                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase tracking-wider ml-2">
                                    PREVIEW // {template.id.toUpperCase()}
                                </span>
                            </div>

                            {/* Right: Red Copy Prompt Button & Refresh Button */}
                            <div className="flex items-center gap-2">
                                {/* Red COPY PROMPT Button with Dropdown */}
                                <div className="relative" ref={promptMenuRef}>
                                    <button
                                        onClick={() => setPromptMenuOpen(o => !o)}
                                        className={`px-3 py-1.5 rounded bg-[#FF3B30] hover:bg-[#e0342a] border-2 border-[#FF3B30] text-white hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0px_0px_#000] ${
                                            promptMenuOpen ? 'brightness-110' : ''
                                        }`}
                                        title="Copy Prompt"
                                        aria-label="Copy Prompt"
                                    >
                                        <Copy size={13} strokeWidth={2.5} />
                                        <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
                                            COPY PROMPT
                                        </span>
                                        <ChevronDown size={13} className={`shrink-0 transition-transform ${promptMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    {/* Dropdown Options */}
                                    {promptMenuOpen && (
                                        <div className="absolute right-0 top-full mt-1.5 z-[60] w-56 rounded-lg border-2 border-white bg-[#0A0A0E] shadow-[4px_4px_0px_0px_#000000] overflow-hidden">
                                            <div className="px-3 pt-2.5 pb-2 border-b border-neutral-800 text-[9px] uppercase tracking-widest font-black text-neutral-400">
                                                Copy Prompt For AI Model
                                            </div>
                                            <div className="p-1.5 flex flex-col gap-0.5">
                                                {PROMPT_OPTIONS.map(opt => (
                                                    <button
                                                        key={opt.system}
                                                        type="button"
                                                        onClick={() => handleCopyPrompt(opt.system)}
                                                        className="w-full flex items-center justify-between px-3 py-2 rounded text-left hover:bg-neutral-900 transition-colors cursor-pointer"
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <img
                                                                src={opt.iconPath}
                                                                alt={`${opt.label} logo`}
                                                                className={`w-4 h-4 shrink-0 object-contain ${
                                                                    opt.system === 'cursor' ? 'brightness-0 invert' : ''
                                                                }`}
                                                            />
                                                            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-white">
                                                                {opt.label}
                                                            </span>
                                                        </div>
                                                        {promptCopied === opt.system && (
                                                            <Check size={14} className="text-[#00E599]" strokeWidth={3} />
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Replay / Reload Button */}
                                <button
                                    onClick={() => {
                                        setResetKey(prev => prev + 1);
                                        setIsLoadingIframe(true);
                                    }}
                                    className="p-1.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                    title="Reload Preview"
                                >
                                    <RotateCcw size={13} className={resetKey > 0 ? 'transition-transform rotate-180' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* ── Live Preview Container ── */}
                        <div 
                            data-lenis-prevent="true"
                            className="relative h-[calc(100vh-175px)] min-h-[620px] w-full bg-white overflow-hidden flex flex-col"
                        >
                            {template.id === 'tars-protocol' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-white">
                                    <TarsHeroArena key={`tars-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'split-fuzzy-orb' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#d6c0e3]">
                                    <SplitFuzzyOrbHero key={`orb-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'segmint-2026' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#E8E9EE]">
                                    <SegmintFooter key={`segmint-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'haos-tech-solutions' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#020202]">
                                    <HaosShowcase key={`haos-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'mentality' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#F0F0F0]">
                                    <MentalityHero key={`mentality-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'lakera-ai-security' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-white">
                                    <LakeraHero key={`lakera-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'interior-design' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-white">
                                    <InteriorDesignShowcase key={`interior-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'lumos' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#F1F1F0]">
                                    <LumosHero key={`lumos-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'loveapp-hero' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#D8D2F8]">
                                    <LoveAppHero key={`loveapp-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'heyo-agency-cta' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#F5F5F2]">
                                    <HeyoAgencyCta key={`heyo-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'me-019-au-cabaret' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#EDEDED]">
                                    <AuCabaretPoster key={`aucabaret-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'dont-be-greedy' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth [scrollbar-width:thin] [scrollbar-color:#888_transparent] bg-[#050505]">
                                    <DontBeGreedyFooter key={`greedy-render-${resetKey}`} />
                                </div>
                            ) : template.id === 'paipai-kuaishou' ? (
                                <div data-lenis-prevent="true" className="w-full h-full overflow-hidden bg-[#59D1EA]">
                                    <PaipaiKuaishou key={`paipai-render-${resetKey}`} />
                                </div>
                            ) : template.liveDemoUrl ? (
                                <>
                                    {isLoadingIframe && (
                                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80 gap-3">
                                            <div className="w-8 h-8 rounded-full border-2 border-[#1F4BFF] border-t-transparent animate-spin" />
                                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400">
                                                Loading Live Template Preview...
                                            </span>
                                        </div>
                                    )}
                                    <iframe
                                        key={`template-frame-${resetKey}`}
                                        src={template.liveDemoUrl}
                                        title={`${template.title} Live Preview`}
                                        className="w-full h-full border-none bg-white"
                                        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                        onLoad={() => setIsLoadingIframe(false)}
                                    />
                                </>
                            ) : (
                                <div className={`w-full h-full bg-gradient-to-br ${template.previewGradient} flex flex-col items-center justify-center p-8 text-center`}>
                                    <span className="text-3xl font-black font-heading uppercase text-white mb-2">
                                        {template.title}
                                    </span>
                                    <p className="text-sm text-neutral-300 max-w-md font-medium mb-6">
                                        {template.description}
                                    </p>
                                    <button
                                        onClick={() => handleCopyPrompt('cursor')}
                                        className="px-6 py-3 bg-[#FF3B30] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
                                    >
                                        <Copy size={15} />
                                        <span>COPY MASTER PROMPT</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── High-Impact Blue MCP Callout Banner ── */}
                <div className="mt-8 sm:mt-10 p-6 sm:p-8 rounded-xl border-4 border-black bg-[#1F4BFF] shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-6 select-none">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border border-white/20">
                            <Sparkles size={12} className="text-[#FFC700]" />
                            <span>AI PROMPT READY</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-white uppercase tracking-tight">
                            BUILD ENTIRE 3D WEBSITES IN 60 SECONDS
                        </h3>
                        <p className="text-white/95 text-xs sm:text-sm font-medium mt-1.5 max-w-2xl leading-relaxed">
                            UI HUB MCP is very powerful. Connect your AI agents to build full-stack 3D interactive websites, components, and animations in just 60 seconds.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/mcp"
                        className="px-6 py-3.5 bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-white hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:shadow-[4px_4px_0px_0px_#000000] transition-all shrink-0 flex items-center gap-2"
                    >
                        <span>EXPLORE MCP INTEGRATION</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
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
