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
    Star, 
    Download, 
    Globe, 
    Github, 
    Plus,
    X,
    Laptop,
    ArrowRight
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
import { buildTemplatePrompt } from '../../../utils/templatePromptUtils';
import Toast from '../../../components/ui/Toast';
import LazyTemplatePreview from '../../../components/ui/LazyTemplatePreview';

const TemplatesSection = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('All');
    const [activeTemplate, setActiveTemplate] = useState<TemplateItem | null>(null);
    const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
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
        <section id="templates" className="relative py-16 sm:py-24 lg:py-32 px-3 sm:px-6 lg:px-8 bg-black border-t-4 border-black overflow-hidden">
            {/* Ambient Cyber Grid Background */}
            <div 
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #3D5CFF 1px, transparent 0)`,
                    backgroundSize: '36px 36px',
                }}
            />
            
            {/* Glowing Accent Orbs */}
            <div className="absolute top-1/4 -left-40 w-96 h-96 bg-[#1F4BFF]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-[#FFC700]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-7xl mx-auto">
                {/* ── Section Header ── */}
                <div className="flex flex-col items-center text-center mb-14">
                    {/* Eyebrow Pill */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-6 border-2 border-white bg-neutral-900 text-white rounded-md font-black text-xs uppercase tracking-widest shadow-[3px_3px_0px_0px_#1F4BFF]">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1F4BFF] animate-pulse" />
                        <span>PRODUCTION READY</span>
                    </div>

                    <h2 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white leading-none font-heading">
                        CURATED WEBSITE <span className="text-[#1F4BFF]">TEMPLATES</span>
                    </h2>

                    <p className="mt-5 text-neutral-400 font-medium text-base sm:text-lg max-w-2xl leading-relaxed">
                        Complete, responsive landing pages and web apps ready to deploy or prompt into your favorite AI tool. Crafted with Next.js, React, and Tailwind CSS.
                    </p>

                    {/* ── Filter Categories ── */}
                    <div className="flex flex-wrap items-center justify-center gap-2.5 mt-8 sm:mt-10 max-w-4xl">
                        {templateCategories.map((category) => {
                            const isActive = selectedCategory === category;
                            return (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wider border-2 transition-all cursor-pointer ${
                                        isActive
                                            ? 'bg-[#1F4BFF] text-white border-white shadow-[4px_4px_0px_0px_#FFFFFF] -translate-y-0.5'
                                            : 'bg-[#111114] text-neutral-400 border-neutral-800 hover:border-neutral-500 hover:text-white hover:-translate-y-0.5'
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
                                className="group relative flex flex-col rounded-xl border-2 border-neutral-800 bg-[#0C0C0E] overflow-hidden select-none hover:border-white hover:-translate-y-1.5 hover:shadow-[6px_6px_0px_0px_#1F4BFF] transition-all duration-300 cursor-pointer will-change-transform"
                            >

                                {/* ── Interactive Real Live Preview Window ── */}
                                <div
                                    onClick={() => navigate(`/templates/${template.id}`)}
                                    className="relative h-44 sm:h-56 lg:h-64 w-full overflow-hidden cursor-pointer"
                                >
                                    {/* Template preview — scale computed dynamically inside LazyTemplatePreview */}
                                    {template.id === 'tars-protocol' ? (
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

                                    {/* Action overlay — always visible on mobile (touch), hover on desktop */}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20
                                        opacity-0 group-hover:opacity-100
                                        sm:opacity-0 sm:group-hover:opacity-100
                                        [@media(hover:none)]:opacity-100
                                        transition-opacity duration-200">
                                        <button
                                            onClick={(e) => handleOpenTemplate(template.id, e)}
                                            className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-[#FFC700] transition-all flex items-center gap-2 cursor-pointer"
                                        >
                                            <Laptop size={13} />
                                            <span>Open Preview</span>
                                        </button>
                                    </div>
                                </div>

                                {/* ── Template Details Body ── */}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-start">
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <h3
                                            onClick={() => handleOpenTemplate(template.id)}
                                            className="font-heading font-black text-base sm:text-lg text-white group-hover:text-[#1F4BFF] transition-colors cursor-pointer truncate"
                                        >
                                            {template.title}
                                        </h3>
                                        <span
                                            className={`px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                                                template.isPro
                                                    ? 'bg-[#1F4BFF] text-white border-black shadow-[2px_2px_0px_0px_#000]'
                                                    : 'bg-[#00E599] text-black border-black shadow-[2px_2px_0px_0px_#000]'
                                            }`}
                                        >
                                            {template.isPro ? 'PRO' : 'FREE'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-neutral-400 font-medium line-clamp-1 sm:line-clamp-2 leading-relaxed">
                                        {template.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}

                        {/* ── Submit / Add New Template Card ── */}
                        <motion.div
                            onClick={() => setShowSubmitModal(true)}
                            className="group relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-950/50 hover:bg-[#111116] hover:border-[#1F4BFF] hover:shadow-[6px_6px_0px_0px_#1F4BFF] transition-all duration-300 cursor-pointer min-h-[360px] text-center select-none"
                        >
                            <div className="w-14 h-14 rounded-xl bg-neutral-900 border-2 border-neutral-700 group-hover:border-[#1F4BFF] group-hover:bg-[#1F4BFF]/20 flex items-center justify-center mb-4 transition-all group-hover:scale-110">
                                <Plus size={28} className="text-neutral-400 group-hover:text-white transition-colors" />
                            </div>

                            <span className="text-lg font-black uppercase font-heading text-white group-hover:text-[#1F4BFF] transition-colors mb-2">
                                Add Your Template
                            </span>

                            <p className="text-xs text-neutral-400 max-w-xs mb-6 font-medium leading-relaxed">
                                Built a stunning website or landing page? Add it to UI-HUB or submit it to get featured across our community.
                            </p>

                            <button className="px-4 py-2 bg-white text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] group-hover:bg-[#FFC700] group-hover:translate-x-0.5 group-hover:translate-y-0.5 transition-all">
                                Submit Template
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* ── Bottom Section Banner / Callout ── */}
                <div className="mt-16 sm:mt-20 p-6 sm:p-8 rounded-xl border-4 border-black bg-[#1F4BFF] shadow-[8px_8px_0px_0px_#000000] flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-left">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-wider mb-2 border border-white/20">
                            <Sparkles size={12} className="text-[#FFC700]" />
                            <span>AI PROMPT READY</span>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-black font-heading text-white uppercase tracking-tight">
                            Build Entire Websites In 60 Seconds
                        </h3>
                        <p className="text-white/90 text-sm font-medium mt-1 max-w-xl">
                            All templates include pre-engineered prompts tailored for Claude, Cursor, ChatGPT, and Antigravity.
                        </p>
                    </div>
                    <a
                        href="/dashboard/mcp"
                        className="px-6 py-3.5 bg-black text-white font-black text-sm uppercase tracking-wider border-2 border-white hover:bg-white hover:text-black hover:border-black shadow-[4px_4px_0px_0px_#FFFFFF] hover:shadow-[4px_4px_0px_0px_#000000] transition-all shrink-0 flex items-center gap-2"
                    >
                        <span>EXPLORE MCP INTEGRATION</span>
                        <ArrowRight size={16} />
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

            {/* ── Submit Template Modal ── */}
            <AnimatePresence>
                {showSubmitModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-lg bg-[#0C0C0E] border-4 border-black rounded-xl shadow-[10px_10px_0px_0px_#FFC700] text-white p-6 sm:p-8"
                        >
                            <button
                                onClick={() => setShowSubmitModal(false)}
                                className="absolute top-4 right-4 p-2 bg-neutral-900 border-2 border-black hover:bg-red-600 text-white transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFC700] text-black text-xs font-black uppercase mb-3 border border-black shadow-[2px_2px_0px_0px_#000]">
                                <Plus size={14} />
                                <span>COMMUNITY SUBMISSION</span>
                            </div>

                            <h3 className="text-2xl font-black font-heading uppercase text-white tracking-tight">
                                Add Your Website Template
                            </h3>

                            <p className="mt-2 text-neutral-400 text-xs font-medium leading-relaxed">
                                You can add new templates directly into the codebase in <code className="text-[#1F4BFF]">src/data/templatesData.ts</code>, or submit your GitHub repo link to get it listed.
                            </p>

                            <div className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 mb-1">
                                        Template Name
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Cyber SaaS Dashboard"
                                        className="w-full bg-black border-2 border-neutral-800 p-2.5 text-xs font-mono text-white focus:border-[#1F4BFF] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 mb-1">
                                        GitHub or Live Preview URL
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="https://github.com/..."
                                        className="w-full bg-black border-2 border-neutral-800 p-2.5 text-xs font-mono text-white focus:border-[#1F4BFF] outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-mono font-bold uppercase text-neutral-400 mb-1">
                                        Framework & Tech Stack
                                    </label>
                                    <input 
                                        type="text" 
                                        placeholder="Next.js 15, Tailwind, Framer Motion"
                                        className="w-full bg-black border-2 border-neutral-800 p-2.5 text-xs font-mono text-white focus:border-[#1F4BFF] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="px-4 py-2 bg-neutral-900 text-white font-black text-xs uppercase border border-neutral-700 hover:bg-neutral-800 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        alert('Thank you! You can add your template directly in src/data/templatesData.ts or push a pull request.');
                                        setShowSubmitModal(false);
                                    }}
                                    className="px-5 py-2 bg-[#FFC700] text-black font-black text-xs uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer"
                                >
                                    Submit
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
