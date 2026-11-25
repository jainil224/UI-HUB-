import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown, Eye } from 'lucide-react';
import {
    buildWithUIHubTemplates,
    buildWithUIHubSlugByTemplateId,
} from '../../../data/templatesData';
import { isNewComponent } from '../../../utils/componentUtils';
import { formatViewCount } from '../../../services/templateViews';
import { useTemplateViewCounts } from '../../../hooks/useTemplateViewCounts';

const SECTION_TITLE = 'Build with UI HUB';
const SECTION_HINT = 'Section-level layouts';

/**
 * "NEW" is a library-catalog concept and `TemplateItem` carries no `addedAt`,
 * so the badge data stays a small lookup keyed by template id. Ids missing here
 * simply render no badge, which is what a new entry would do anyway.
 */
const NEW_BADGE_BY_ID: Record<string, { addedAt: string; newBadgeDays?: number }> = {
    'originkit-hero-24': { addedAt: '2026-09-28', newBadgeDays: 120 },
    'neural-kinetics-hero': { addedAt: '2026-10-08', newBadgeDays: 120 },
};

const BuildWithUIHubSection = () => {
    const navigate = useNavigate();

    const components = buildWithUIHubTemplates;
    const templateViewCounts = useTemplateViewCounts(components.map((component) => component.id));

    // Cards link to the public section slug, not the master template id, so the
    // URL stays stable if the underlying template is ever renamed.
    const handleOpenSection = (templateId: string) => {
        const slug = buildWithUIHubSlugByTemplateId[templateId];
        if (!slug) return;
        window.scrollTo(0, 0);
        navigate(`/build-with-ui-hub/${slug}`);
    };

    return (
        <section id="build-with-ui-hub" className="relative min-h-screen py-10 sm:py-14 px-3 sm:px-5 lg:px-6 bg-[#0A0A0A] overflow-hidden">
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
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    <span className="h-5 w-1.5 rounded-[2px] bg-[#3D5CFF] shadow-[2px_2px_0px_0px_#000000]" />
                    <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-neutral-200">{SECTION_TITLE}</h2>
                    <span className="px-1.5 py-0.5 bg-[#3D5CFF] text-white font-mono text-[10px] font-black border-2 border-black shadow-[2px_2px_0px_0px_#000000]">{components.length}</span>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500">— {SECTION_HINT}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {components.map((component, idx) => (
                        <motion.div
                            key={component.id}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '200px 0px' }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                            onClick={() => handleOpenSection(component.id)}
                            className="group relative flex w-full min-w-0 flex-col rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] overflow-hidden select-none transition-all duration-200 cursor-pointer hover:border-white hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000000]"
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
                                    <span className="absolute left-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-md border-2 border-black bg-[#FFC700] text-black shadow-[3px_3px_0px_0px_#000000]" aria-label="Pro component">
                                        <Crown size={15} />
                                    </span>
                                )}

                                {/* Arrow icon top-right — appears on hover (matches ComponentGrid) */}
                                <div
                                    className={`absolute top-2.5 right-2.5 z-20 w-6 h-6 rounded-md border-2 border-black bg-[#3D5CFF] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-[2px_2px_0px_0px_#000000]`}
                                >
                                    <ArrowRight size={11} className="text-white" />
                                </div>

                                {/* Bottom readability gradient (matches ComponentGrid) */}
                                <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-10" />
                            </div>

                            {/* ── Card Footer — mirrors the Templates grid footer ── */}
                            <div className="flex min-h-12 items-center justify-between gap-3 px-3 py-2.5 border-t-2 border-neutral-800">
                                <div className="min-w-0">
                                    <h3 className="font-mono font-black text-[11px] sm:text-xs uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors truncate leading-tight">
                                        {component.title}
                                    </h3>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    {isNewComponent(NEW_BADGE_BY_ID[component.id] ?? {}) && (
                                        <span className="rounded-sm border-2 border-black bg-[#FFC700] px-1 py-0.5 font-mono text-[8px] font-black uppercase leading-none text-black shadow-[2px_2px_0px_0px_#000000]">
                                            NEW
                                        </span>
                                    )}
                                    <span
                                        className="inline-flex shrink-0 items-center gap-1.5 px-2 py-1 rounded-md border border-white/10 bg-black/60 font-mono text-[10px] font-bold text-neutral-300"
                                        aria-label={`${templateViewCounts[component.id] ?? 0} views`}
                                    >
                                        <Eye size={14} className="text-[#FFC700]" aria-hidden="true" />
                                        {formatViewCount(templateViewCounts[component.id] ?? 0)}
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
