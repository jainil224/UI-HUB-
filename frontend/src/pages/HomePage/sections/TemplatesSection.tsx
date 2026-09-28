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
    X,
    Bot,
    Rocket
} from 'lucide-react';
import { Crown, Eye } from 'lucide-react';
import { SiClaude, SiCursor } from 'react-icons/si';
import {
    websiteTemplates,
    TemplateItem
} from '../../../data/templatesData';
import TarsHeroArena from '../../../components/templates/TarsHeroArena';
import SplitFuzzyOrbHero from '../../../components/templates/SplitFuzzyOrbHero';
import SegmintFooter from '../../../components/templates/SegmintFooter';
import HaosShowcase from '../../../components/templates/HaosShowcase';
import MentalityHero from '../../../components/templates/MentalityHero';
import InteriorDesignShowcase from '../../../components/templates/InteriorDesignShowcase';
import LumosHero from '../../../components/templates/LumosHero';
import LoveAppHero from '../../../components/templates/LoveAppHero';
import HeyoAgencyCta from '../../../components/templates/HeyoAgencyCta';
import AuCabaretPoster from '../../../components/templates/AuCabaretPoster';
import DontBeGreedyFooter from '../../../components/templates/DontBeGreedyFooter';
import PaipaiKuaishou from '../../../components/templates/PaipaiKuaishou';
import LogoHere from '../../../components/templates/LogoHere';
import SuiOverflow from '../../../components/templates/SuiOverflow';
import PortfolioClosing from '../../../components/templates/PortfolioClosing';
import GraphicDesignerPortfolio from '../../../components/templates/GraphicDesignerPortfolio';
import MoodHero from '../../../components/templates/MoodHero';
import Labs2586 from '../../../components/templates/Labs2586';
import { buildTemplatePrompt } from '../../../utils/templatePromptUtils';
import Toast from '../../../components/ui/Toast';
import LazyTemplatePreview from '../../../components/ui/LazyTemplatePreview';

const TemplatesSection = () => {
    const navigate = useNavigate();
    const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    const renderSections = [
        { category: 'Templates', hint: 'Complete pages to customize', items: websiteTemplates.filter((template) => template.id !== 'originkit-hero-24') },
    ];

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
        <section id="templates" className="relative min-h-screen py-5 sm:py-6 px-3 sm:px-5 lg:px-6 bg-[#0A0A0A] overflow-hidden">
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

            <div className="relative mx-auto max-w-[1600px]">

                {/* ── Complete template catalog ── */}
                <div>
                    <AnimatePresence mode="wait">
                        {renderSections.map((section, si) => (
                            <motion.div
                                key={section.category}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.25, delay: Math.min(si * 0.04, 0.2) }}
                                className={si > 0 ? 'mt-8 sm:mt-10' : ''}
                            >
                                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                                    <span className="h-4 w-1 rounded-full bg-[#1F4BFF]" />
                                    <h2 className="text-sm font-semibold text-neutral-200">{section.category}</h2>
                                    <span className="text-xs text-neutral-500">{section.items.length}</span>
                                    {section.hint && <span className="text-xs text-neutral-600">— {section.hint}</span>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                                    {section.items.map((template, idx) => (
                                        <motion.div
                                            key={template.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                                            onClick={() => handleOpenTemplate(template.id)}
                                            className="group relative flex flex-col rounded-xl border border-[#292a2d] bg-[#1b1c1f] overflow-hidden select-none transition-all duration-200 cursor-pointer hover:border-[#55575d] hover:bg-[#242529] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                                        >
                                            {/* ── Preview Window ── */}
                                            <div
                                                onClick={() => navigate(`/templates/${template.id}`)}
                                                className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer bg-[#101114]"
                                            >
                                                {/* ── Preview renderer ──
                                         Priority 1: static image (instant, zero CPU)
                                         Priority 2: live React component (virtualized)
                                         Priority 3: gradient fallback */}
                                                {template.previewVideo ? (
                                                    <video
                                                        src={template.previewVideo}
                                                        poster={template.previewImage}
                                                        autoPlay
                                                        muted
                                                        loop
                                                        playsInline
                                                        preload="metadata"
                                                        className="w-full h-full object-cover object-top select-none transition-transform duration-300 group-hover:scale-[1.025]"
                                                    />
                                                ) : template.previewImage ? (
                                                    <img
                                                        src={template.previewImage}
                                                        alt={`${template.title} preview`}
                                                        className="w-full h-full object-cover object-top select-none transition-transform duration-300 group-hover:scale-[1.025]"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : template.id === '2586-labs' ? (
                                                    <LazyTemplatePreview bgColor="#F8F3E5"><Labs2586 /></LazyTemplatePreview>
                                                ) : template.id === 'mood-hero' ? (
                                                    <LazyTemplatePreview bgColor="#EDE8DE"><MoodHero /></LazyTemplatePreview>
                                                ) : template.id === 'portfolio-closing' ? (
                                                    <LazyTemplatePreview bgColor="#0B1014"><PortfolioClosing /></LazyTemplatePreview>
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
                                                ) : template.id === 'sui-overflow' ? (
                                                    <LazyTemplatePreview bgColor="#F2EFE6"><SuiOverflow /></LazyTemplatePreview>
                                                ) : template.id === 'graphic-designer-portfolio' ? (
                                                    <LazyTemplatePreview bgColor="#F7F6F2"><GraphicDesignerPortfolio /></LazyTemplatePreview>
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

                                                {template.isPro && (
                                                    <span className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-lg border border-black/40 bg-[#d6a900] text-[#fff2b2] shadow-md" aria-label="Pro template">
                                                        <Crown size={15} />
                                                    </span>
                                                )}

                                                {/* Arrow icon top-right — appears on hover (matches ComponentGrid) */}
                                                <div className="absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-md border border-white/15 bg-black/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <ArrowRight size={11} className="text-white" />
                                                </div>

                                                {/* Bottom readability gradient (matches ComponentGrid) */}
                                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />

                                            </div>

                                            {/* ── Card Footer ── */}
                                            <div className="flex min-h-11 items-center justify-between gap-3 px-2.5 sm:px-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <h3
                                                            className="font-medium text-sm text-neutral-200 group-hover:text-white transition-colors truncate leading-tight"
                                                        >
                                                            {template.title}
                                                        </h3>
                                                    </div>
                                                </div>
                                                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-neutral-300">
                                                    <Eye size={14} className="text-neutral-400" />
                                                    {template.stats.downloads}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* ── Bottom Callout Banner ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="hidden"
                >
                    {/* Graph-square grid backdrop — matches section/Hero/Footer */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            backgroundImage:
                                'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
                            backgroundSize: '32px 32px',
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 45%, black 100%)',
                        }}
                    />

                    {/* ── Bauhaus Geometric Accents (mirrors Hero) ── */}
                    {/* Tilted yellow square */}
                    <div className="hidden md:block absolute -top-7 -right-7 w-24 h-24 rotate-12 bg-[#FFC700] border-4 border-black shadow-[6px_6px_0px_0px_#000000] pointer-events-none" />
                    {/* Crimson circle */}
                    <div className="hidden md:block absolute top-10 right-32 w-4 h-4 rounded-full bg-[#E52520] border-2 border-black shadow-[2px_2px_0px_0px_#000000] pointer-events-none" />
                    {/* Blue "60 SEC" pill */}
                    <div className="hidden lg:flex absolute left-20 top-1/2 -translate-y-1/2 -rotate-6 px-3 py-1.5 rounded-full bg-[#1F4BFF] border-2 border-black shadow-[3px_3px_0px_0px_#000000] items-center gap-1.5 pointer-events-none">
                        <Rocket size={11} className="text-white" />
                        <span className="text-[9px] font-black text-white uppercase tracking-wider">60 Sec</span>
                    </div>

                    <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
                        <div className="max-w-xl">
                            {/* Eyebrow chip */}
                            <div className="inline-flex items-center gap-2 px-2.5 py-1 mb-4 bg-neutral-900 border-2 border-black shadow-[2px_2px_0px_0px_#000000]">
                                <Sparkles size={12} className="text-[#FFC700]" />
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-neutral-300">AI Prompt Ready</span>
                            </div>

                            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                                Build Entire Websites{' '}
                                <span className="serif-italic text-[#3D5CFF] drop-shadow-[0_0_30px_rgba(61,92,255,0.45)]">
                                    In 60 Seconds
                                </span>
                            </h3>

                            <p className="text-neutral-400 text-xs sm:text-sm font-medium mt-3 max-w-lg leading-relaxed">
                                All templates include pre-engineered prompts for
                            </p>

                            {/* ── Tool chips (matches PRO/FREE/NEW chip pattern) ── */}
                            <div className="flex flex-wrap items-center gap-2 mt-4">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#D97757] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-mono font-bold text-[10px] uppercase tracking-wider">
                                    <SiClaude size={12} />
                                    Claude
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-mono font-bold text-[10px] uppercase tracking-wider">
                                    <SiCursor size={12} />
                                    Cursor
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#10A37F] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-mono font-bold text-[10px] uppercase tracking-wider">
                                    <Bot size={12} />
                                    ChatGPT
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#1F4BFF] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000000] font-mono font-bold text-[10px] uppercase tracking-wider">
                                    <Rocket size={12} />
                                    Antigravity
                                </span>
                            </div>
                        </div>

                        <a
                            href="/dashboard/mcp"
                            className="shrink-0 inline-flex items-center gap-2 px-6 py-3.5 bg-[#1F4BFF] text-white font-black text-xs uppercase tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000000] hover:bg-white hover:text-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000000] transition-all"
                        >
                            <span>Explore MCP</span>
                            <ArrowRight size={14} />
                        </a>
                    </div>
                </motion.div>
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
