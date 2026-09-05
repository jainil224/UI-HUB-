import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
    ExternalLink, 
    Copy, 
    Check, 
    Sparkles, 
    Code, 
    Layers, 
    Globe, 
    Github, 
    Laptop,
    ArrowRight,
    X
} from 'lucide-react';
import { 
    websiteTemplates, 
    templateCategories, 
    TemplateCategory, 
    TemplateItem 
} from '../../../data/templatesData';
import TarsHeroArena from '../../../components/templates/TarsHeroArena';
import SplitFuzzyOrbHero from '../../../components/templates/SplitFuzzyOrbHero';
import SegmintFooter from '../../../components/templates/SegmintFooter';
import HaosShowcase from '../../../components/templates/HaosShowcase';
import MentalityHero from '../../../components/templates/MentalityHero';
import LakeraHero from '../../../components/templates/LakeraHero';
import InteriorDesignShowcase from '../../../components/templates/InteriorDesignShowcase';
import LumosHero from '../../../components/templates/LumosHero';
import LoveAppHero from '../../../components/templates/LoveAppHero';
import HeyoAgencyCta from '../../../components/templates/HeyoAgencyCta';
import AuCabaretPoster from '../../../components/templates/AuCabaretPoster';
import DontBeGreedyFooter from '../../../components/templates/DontBeGreedyFooter';
import PaipaiKuaishou from '../../../components/templates/PaipaiKuaishou';
import LogoHere from '../../../components/templates/LogoHere';
import Partify from '../../../components/templates/Partify';
import { buildTemplatePrompt } from '../../../utils/templatePromptUtils';
import Toast from '../../../components/ui/Toast';
import LazyTemplatePreview from '../../../components/ui/LazyTemplatePreview';

const TemplatesSection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
    const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const categoryMatches = websiteTemplates.filter(t => t.category === selectedCategory);
    const filteredTemplates = (selectedCategory === 'All' || categoryMatches.length === 0)
        ? websiteTemplates
        : categoryMatches;

    const handleCopyPrompt = (template: TemplateItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const text = buildTemplatePrompt(template, 'advance');
        navigator.clipboard.writeText(text);
        setCopiedPromptId(template.id);
        setToastMessage(`ADVANCE PROMPT COPIED TO CLIPBOARD`);
        setShowToast(true);
        setTimeout(() => setCopiedPromptId(null), 2500);
    };

    const handleOpenTemplate = (templateId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        window.scrollTo(0, 0);
        navigate(`/templates/${templateId}`);
    };

    return (
        <section id="templates" className="relative py-16 sm:py-24 lg:py-32 px-3 sm:px-6 lg:px-8 bg-[#0A0A0A] border-t-4 border-black overflow-hidden">
            {/* Graph-square grid backdrop — matches Hero & Footer */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
                }}
            />

            {/* Subtle color accents */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-[#1F4BFF]/8 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-[#FFC700]/6 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                {/* ── Section Header ── */}
                <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 mb-5">
                        <span className="w-2 h-2 rounded-full bg-[#E52520] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-mono font-black uppercase tracking-[0.25em] text-neutral-400">
                            Production-Ready Templates
                        </span>
                        <Sparkles size={12} className="text-[#FFC700]" />
                    </div>

                    <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
                        Curated Website{' '}
                        <span className="text-[#1F4BFF]">Templates.</span>
                    </h2>

                    <p className="mt-4 text-neutral-400 font-medium text-sm sm:text-base max-w-xl leading-relaxed">
                        Full landing pages ready to deploy or paste into any AI tool.
                        Built with React, Next.js &amp; Tailwind CSS.
                    </p>

                    {/* ── Filter Categories ── */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-7 sm:mt-9 max-w-3xl">
                        {templateCategories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs font-black uppercase tracking-wider border-2 transition-all duration-150 cursor-pointer ${
                                        isActive
                                            ? 'bg-[#1F4BFF] text-white border-[#1F4BFF] shadow-[3px_3px_0px_0px_#FFFFFF] -translate-y-0.5'
                                            : 'bg-transparent text-neutral-500 border-neutral-800 hover:border-neutral-500 hover:text-neutral-200'
                                    }`}
                                >
                                    {category}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* ── Templates Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <AnimatePresence mode="wait">
                        {filteredTemplates.map((template, idx) => (
                            <motion.div
                                key={template.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                                onClick={() => handleOpenTemplate(template.id)}
                                className="group relative flex flex-col rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] overflow-hidden select-none hover:border-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000] transition-all duration-200 cursor-pointer will-change-transform"
                            >
                                {/* ── Preview Window ── */}
                                <div
                                    onClick={() => navigate(`/templates/${template.id}`)}
                                    className="relative h-44 sm:h-52 lg:h-60 w-full overflow-hidden cursor-pointer"
                                >
                                    {/* ── Preview renderer ──
                                         Priority 1: static image (instant, zero CPU)
                                         Priority 2: live React component (virtualized)
                                         Priority 3: gradient fallback */}
                                    {template.previewImage ? (
                                        <img
                                            src={template.previewImage}
                                            alt={`${template.title} preview`}
                                            className="w-full h-full object-cover object-top select-none"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    ) : template.id === 'tars-protocol' ? (
                                        <LazyTemplatePreview bgColor="#ffffff"><TarsHeroArena /></LazyTemplatePreview>
                                    ) : template.id === 'split-fuzzy-orb' ? (
                                        <LazyTemplatePreview bgColor="#d6c0e3"><SplitFuzzyOrbHero /></LazyTemplatePreview>
                                    ) : template.id === 'segmint-2026' ? (
                                        <LazyTemplatePreview bgColor="#0755CE"><SegmintFooter /></LazyTemplatePreview>
                                    ) : template.id === 'haos-tech-solutions' ? (
                                        <LazyTemplatePreview bgColor="#020202"><HaosShowcase /></LazyTemplatePreview>
                                    ) : template.id === 'mentality' ? (
                                        <LazyTemplatePreview bgColor="#F0F0F0"><MentalityHero /></LazyTemplatePreview>
                                    ) : template.id === 'lakera-ai-security' ? (
                                        <LazyTemplatePreview bgColor="#ffffff"><LakeraHero /></LazyTemplatePreview>
                                    ) : template.id === 'interior-design' ? (
                                        <LazyTemplatePreview bgColor="#ffffff"><InteriorDesignShowcase /></LazyTemplatePreview>
                                    ) : template.id === 'lumos' ? (
                                        <LazyTemplatePreview bgColor="#F1F1F0"><LumosHero /></LazyTemplatePreview>
                                    ) : template.id === 'loveapp-hero' ? (
                                        <LazyTemplatePreview bgColor="#D8D2F8"><LoveAppHero /></LazyTemplatePreview>
                                    ) : template.id === 'heyo-agency-cta' ? (
                                        <LazyTemplatePreview bgColor="#F5F5F2"><HeyoAgencyCta /></LazyTemplatePreview>
                                    ) : template.id === 'me-019-au-cabaret' ? (
                                        <LazyTemplatePreview bgColor="#EDEDED"><AuCabaretPoster /></LazyTemplatePreview>
                                    ) : template.id === 'dont-be-greedy' ? (
                                        <LazyTemplatePreview bgColor="#050505"><DontBeGreedyFooter /></LazyTemplatePreview>
                                    ) : template.id === 'paipai-kuaishou' ? (
                                        <LazyTemplatePreview bgColor="#59D1EA"><PaipaiKuaishou /></LazyTemplatePreview>
                                    ) : template.id === 'logo-here' ? (
                                        <LazyTemplatePreview bgColor="#ffffff"><LogoHere /></LazyTemplatePreview>
                                    ) : template.id === 'partify' ? (
                                        <LazyTemplatePreview bgColor="#FBFBFB"><Partify /></LazyTemplatePreview>
                                    ) : template.liveDemoUrl ? (
                                        <iframe
                                            src={template.liveDemoUrl}
                                            title={template.title}
                                            className="w-full h-full border-0 select-none"
                                            sandbox="allow-scripts allow-same-origin"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className={`relative h-full w-full bg-gradient-to-br ${template.previewGradient} p-5 flex flex-col justify-between overflow-hidden`}>
                                            <span className="text-xl font-black text-white">{template.title}</span>
                                        </div>
                                    )}

                                    {/* Floating category chip — top-left (matches ComponentGrid label) */}
                                    <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5">
                                        <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-sm border border-white/15 text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-widest text-white">
                                            {template.category}
                                        </span>
                                        {template.isPro && (
                                            <span className="px-1.5 py-0.5 bg-[#1F4BFF] text-white text-[8px] font-black uppercase leading-none rounded-sm border border-black/50 shadow-[1px_1px_0px_0px_#000000]">
                                                PRO
                                            </span>
                                        )}
                                    </div>

                                    {/* Arrow icon top-right — appears on hover (matches ComponentGrid) */}
                                    <div className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-md border border-white/15 bg-black/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                        <ArrowRight size={11} className="text-white" />
                                    </div>

                                    {/* Bottom readability gradient (matches ComponentGrid) */}
                                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />

                                    {/* Hover overlay with CTA */}
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20
                                        opacity-0 group-hover:opacity-100
                                        [@media(hover:none)]:opacity-100
                                        transition-opacity duration-200">
                                        <button
                                            onClick={(e) => handleOpenTemplate(template.id, e)}
                                            className="px-3.5 py-2 bg-white text-black font-black text-[11px] uppercase tracking-widest border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFC700] transition-colors flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <Laptop size={12} />
                                            <span>Open Preview</span>
                                        </button>
                                    </div>
                                </div>

                                {/* ── Card Footer ── */}
                                <div className="px-4 py-3 sm:px-5 sm:py-4 flex items-center justify-between gap-3 border-t border-neutral-800">
                                    <div className="min-w-0">
                                        <h3
                                            className="font-black text-sm sm:text-base text-white group-hover:text-[#1F4BFF] transition-colors truncate leading-tight"
                                        >
                                            {template.title}
                                        </h3>
                                        <p className="text-[11px] text-neutral-500 font-mono mt-0.5 truncate">
                                            {template.framework} · {template.styling}
                                        </p>
                                    </div>
                                    <span
                                        className={`shrink-0 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider border shadow-[2px_2px_0px_0px_#000] ${
                                            template.isPro
                                                ? 'bg-[#1F4BFF] text-white border-black'
                                                : 'bg-[#00E599] text-black border-black'
                                        }`}
                                    >
                                        {template.isPro ? 'PRO' : 'FREE'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* ── Bottom Callout Banner ── */}
                <div className="mt-12 sm:mt-16 p-5 sm:p-8 rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 hover:border-neutral-600 transition-colors">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={13} className="text-[#FFC700]" />
                            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-400">AI Prompt Ready</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                            Build Entire Websites In 60 Seconds
                        </h3>
                        <p className="text-neutral-500 text-xs sm:text-sm font-medium mt-1 max-w-md">
                            All templates include pre-engineered prompts for Claude, Cursor, ChatGPT &amp; Antigravity.
                        </p>
                    </div>
                    <a
                        href="/dashboard/mcp"
                        className="shrink-0 px-5 py-2.5 bg-[#1F4BFF] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-white hover:text-black transition-all flex items-center gap-2"
                    >
                        <span>Explore MCP</span>
                        <ArrowRight size={14} />
                    </a>
                </div>
            </div>

            {/* ── Template Details / AI Prompt Modal ── */}
            <AnimatePresence>
                {activeTemplate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#0C0C0E] border-4 border-black rounded-xl shadow-[12px_12px_0px_0px_#1F4BFF] text-white p-6 sm:p-8"
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setActiveTemplate(null)}
                                className="absolute top-4 right-4 p-2 bg-neutral-900 border-2 border-black hover:bg-red-600 text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            {/* Header info */}
                            <div className="flex flex-wrap items-center gap-2.5 mb-3">
                                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#1F4BFF] text-white border border-black uppercase">
                                    {activeTemplate.category}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                                    {activeTemplate.framework}
                                </span>
                                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                                    {activeTemplate.styling}
                                </span>
                            </div>

                            <h3 className="text-2xl sm:text-4xl font-black font-heading uppercase text-white tracking-tight">
                                {activeTemplate.title}
                            </h3>

                            <p className="mt-3 text-neutral-300 text-sm sm:text-base font-medium leading-relaxed">
                                {activeTemplate.description}
                            </p>

                            {/* Features list */}
                            <div className="mt-6">
                                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 mb-3">
                                    KEY ARCHITECTURE FEATURES
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {activeTemplate.features.map((feat, i) => (
                                        <div key={i} className="flex items-center gap-2 p-2.5 rounded bg-neutral-900/80 border border-neutral-800 text-xs font-mono text-neutral-200">
                                            <span className="w-2 h-2 rounded-full bg-[#1F4BFF]" />
                                            <span>{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* AI Prompt Box */}
                            <div className="mt-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#FFC700] flex items-center gap-1.5">
                                        <Sparkles size={14} />
                                        <span>AI PROMPT (CURSOR / CLAUDE / ANTIGRAVITY)</span>
                                    </h4>
                                    <button
                                        onClick={() => handleCopyPrompt(activeTemplate)}
                                        className="px-2.5 py-1 bg-white text-black font-black text-xs uppercase tracking-wider border border-black hover:bg-[#FFC700] transition-colors flex items-center gap-1 cursor-pointer"
                                    >
                                        {copiedPromptId === activeTemplate.id ? (
                                            <>
                                                <Check size={12} className="text-green-600" />
                                                <span>COPIED!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={12} />
                                                <span>COPY PROMPT</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="p-4 bg-black border-2 border-neutral-800 rounded font-mono text-xs text-neutral-300 leading-relaxed max-h-40 overflow-y-auto select-all whitespace-pre-wrap">
                                    {buildTemplatePrompt(activeTemplate, 'advance')}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-8 pt-6 border-t-2 border-neutral-800 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    {activeTemplate.githubUrl && (
                                        <a
                                            href={activeTemplate.githubUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2.5 bg-neutral-900 text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-neutral-800 transition-all flex items-center gap-2"
                                        >
                                            <Github size={14} />
                                            <span>Source Code</span>
                                        </a>
                                    )}
                                </div>

                                <button
                                    onClick={() => setActiveTemplate(null)}
                                    className="px-6 py-2.5 bg-[#1F4BFF] text-white font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#183ec9] transition-all cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Bottom Center Toast Notification on Prompt Copy */}
            <Toast
                isVisible={showToast}
                message={toastMessage}
                position="bottom-center"
                onClose={() => setShowToast(false)}
            />
        </section>
    );
};

export default TemplatesSection;
