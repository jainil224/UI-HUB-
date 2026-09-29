import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown, Eye } from 'lucide-react';
import {
    buildWithUIHubTemplates,
    buildWithUIHubSlugByTemplateId,
} from '../../../data/templatesData';
import { isNewComponent } from '../../../utils/componentUtils';

const SECTION_TITLE = 'Build with UI HUB';
const SECTION_HINT = 'Section-level layouts';

/**
 * "NEW" is a library-catalog concept and `TemplateItem` carries no `addedAt`,
 * so the badge data stays a small lookup keyed by template id. Ids missing here
 * simply render no badge, which is what a new entry would do anyway.
 */
const NEW_BADGE_BY_ID: Record<string, { addedAt: string; newBadgeDays?: number }> = {
    'originkit-hero-24': { addedAt: '2026-09-28', newBadgeDays: 120 },
};

const BuildWithUIHubSection = () => {
    const navigate = useNavigate();

    const components = buildWithUIHubTemplates;

    // Cards link to the public section slug, not the master template id, so the
    // URL stays stable if the underlying template is ever renamed.
    const handleOpenSection = (templateId: string) => {
        const slug = buildWithUIHubSlugByTemplateId[templateId];
        if (!slug) return;
        window.scrollTo(0, 0);
        navigate(`/build-with-ui-hub/${slug}`);
    };

    return (
        <section id="build-with-ui-hub" className="relative min-h-screen py-5 sm:py-6 px-3 sm:px-5 lg:px-6 bg-[#0A0A0A] overflow-hidden">
            {/* Graph-square grid backdrop — matches TemplatesSection */}
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

            <div className="relative mx-auto w-full max-w-[1600px]">
                <div className="mb-3 flex flex-wrap items-center gap-2.5">
                    <span className="h-4 w-1 rounded-full bg-[#1F4BFF]" />
                    <h2 className="text-sm font-semibold text-neutral-200">{SECTION_TITLE}</h2>
                    <span className="text-xs text-neutral-500">{components.length}</span>
                    <span className="text-xs text-neutral-600">— {SECTION_HINT}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {components.map((component, idx) => (
                        <motion.div
                            key={component.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '200px 0px' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                            onClick={() => handleOpenSection(component.id)}
                            className="group relative flex w-full min-w-0 flex-col rounded-xl border border-[#292a2d] bg-[#1b1c1f] overflow-hidden select-none transition-all duration-200 cursor-pointer hover:border-[#55575d] hover:bg-[#242529] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                        >
                            {/* ── Preview Window ── */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer bg-[#101114]">
                                {component.previewVideo ? (
                                    <video
                                        src={component.previewVideo}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        aria-label={`${component.title} preview`}
                                        className="w-full h-full object-cover object-top select-none transition-transform duration-300 group-hover:scale-[1.025]"
                                    />
                                ) : component.previewImage ? (
                                    <img
                                        src={component.previewImage}
                                        alt={`${component.title} preview`}
                                        loading="lazy"
                                        decoding="async"
                                        className="w-full h-full object-cover object-top select-none transition-transform duration-300 group-hover:scale-[1.025]"
                                    />
                                ) : (
                                    <div className={`relative h-full w-full bg-gradient-to-br ${component.previewGradient} p-5 flex flex-col justify-between overflow-hidden`}>
                                        <span className="text-xl font-black text-white">{component.title}</span>
                                    </div>
                                )}

                                {component.isPro && (
                                    <span className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-lg border border-black/40 bg-[#d6a900] text-[#fff2b2] shadow-md" aria-label="Pro component">
                                        <Crown size={15} />
                                    </span>
                                )}

                                {/* Arrow icon top-right — appears on hover (matches ComponentGrid) */}
                                <div
                                    className={`absolute top-2.5 ${component.isPro ? 'right-11' : 'right-2.5'} z-20 w-6 h-6 rounded-md border border-white/15 bg-black/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                                >
                                    <ArrowRight size={11} className="text-white" />
                                </div>

                                {/* Bottom readability gradient (matches ComponentGrid) */}
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />
                            </div>

                            {/* ── Card Footer — mirrors the Templates grid footer ── */}
                            <div className="flex min-h-11 items-center justify-between gap-3 px-2.5 sm:px-3">
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm text-neutral-200 group-hover:text-white transition-colors truncate leading-tight">
                                        {component.title}
                                    </h3>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {isNewComponent(NEW_BADGE_BY_ID[component.id] ?? {}) && (
                                        <span className="rounded-sm bg-[#FFC700] px-1 py-0.5 text-[8px] font-black uppercase leading-none text-black">
                                            NEW
                                        </span>
                                    )}
                                    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-300">
                                        <Eye size={14} className="text-neutral-400" />
                                        {component.stats.downloads}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

BuildWithUIHubSection.displayName = 'BuildWithUIHubSection';

export default BuildWithUIHubSection;
