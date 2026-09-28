import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Crown } from 'lucide-react';
import { componentList } from '../../../data/componentData';
import OriginkitHero24 from '../../../components/templates/OriginkitHero24';
import LazyTemplatePreview from '../../../components/ui/LazyTemplatePreview';
import { isNewComponent } from '../../../utils/componentUtils';

/**
 * Live React preview for every component allowed in this section.
 * Membership is driven by this map, so a component only appears once it can
 * actually be rendered here — add an entry to surface a new one.
 */
const SECTION_PREVIEWS: Record<string, () => React.ReactNode> = {
    'originkit-hero-24': () => <OriginkitHero24 />,
};

const SECTION_TITLE = 'Build with UI HUB';
const SECTION_HINT = 'Section-level layouts';

const BuildWithUIHubSection = () => {
    const navigate = useNavigate();

    const components = componentList.filter((component) => component.id in SECTION_PREVIEWS);

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

            <div className="relative mx-auto max-w-[1600px]">
                <div className="mb-4 flex flex-wrap items-center gap-2.5">
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
                            onClick={() => navigate(`/library?id=${component.id}`)}
                            className="group relative flex flex-col rounded-xl border border-[#292a2d] bg-[#1b1c1f] overflow-hidden select-none transition-all duration-200 cursor-pointer hover:border-[#55575d] hover:bg-[#242529] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                        >
                            {/* ── Preview Window ── */}
                            <div className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer bg-[#101216]">
                                <LazyTemplatePreview bgColor="#101216">
                                    {SECTION_PREVIEWS[component.id]()}
                                </LazyTemplatePreview>

                                {component.isPremium && (
                                    <span className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-lg border border-black/40 bg-[#d6a900] text-[#fff2b2] shadow-md" aria-label="Premium component">
                                        <Crown size={15} />
                                    </span>
                                )}

                                {/* Arrow icon top-right — appears on hover (matches ComponentGrid) */}
                                <div
                                    className={`absolute top-2.5 ${component.isPremium ? 'right-11' : 'right-2.5'} z-20 w-6 h-6 rounded-md border border-white/15 bg-black/75 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
                                >
                                    <ArrowRight size={11} className="text-white" />
                                </div>

                                {/* Bottom readability gradient (matches ComponentGrid) */}
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-10" />
                            </div>

                            {/* ── Card Footer ── */}
                            <div className="flex min-h-11 items-center justify-between gap-3 px-2.5 sm:px-3">
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm text-neutral-200 group-hover:text-white transition-colors truncate leading-tight">
                                        {component.title}
                                    </h3>
                                </div>
                                {isNewComponent(component) && (
                                    <span className="shrink-0 rounded-sm bg-[#FFC700] px-1 py-0.5 text-[8px] font-black uppercase leading-none text-black">
                                        NEW
                                    </span>
                                )}
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
