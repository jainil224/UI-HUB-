import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye } from 'lucide-react';
import {
    BUILD_WITH_UI_HUB_SECTIONS,
    buildWithUIHubTemplateBySlug,
    type TemplateItem,
} from '../../data/templatesData';
import { prefetchTemplateChunk } from './registry';
import { formatViewCount } from '../../services/templateViews';
import { useTemplateViewCounts } from '../../hooks/useTemplateViewCounts';

const SECTION_PATH = '/build-with-ui-hub';

interface BuildWithUIHubRailProps {
    /** Slug of the section currently open, highlighted in the list. */
    activeSlug: string;
}

/**
 * Video-only thumbnail, loaded as it approaches the viewport.
 *
 * Same trade-off as the templates Similar rail: these previews run to megabytes
 * each, and the rail can grow without bound, so the video is only attached once
 * the card is within 200px of the viewport. The brand gradient paints first so
 * a card is never blank while it loads.
 */
const RailThumbnail: React.FC<{ template: TemplateItem }> = ({ template }) => {
    const holderRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        if (!template.previewVideo) return;

        const holder = holderRef.current;
        if (!holder) return;

        if (typeof IntersectionObserver === 'undefined') {
            setShouldLoad(true);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (!entries.some((entry) => entry.isIntersecting)) return;
                setShouldLoad(true);
                observer.disconnect();
            },
            { rootMargin: '200px' },
        );

        observer.observe(holder);
        return () => observer.disconnect();
    }, [template.previewVideo]);

    // Autoplay can still be refused (data saver, low-power mode), and a silently
    // frozen first frame is worse than no attempt at all.
    useEffect(() => {
        if (!shouldLoad) return;
        const video = videoRef.current;
        if (!video) return;
        const attempt = video.play();
        if (attempt) attempt.catch(() => {});
    }, [shouldLoad]);

    return (
        <div
            ref={holderRef}
            className={`relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br ${template.previewGradient}`}
        >
            {template.previewVideo && shouldLoad && (
                <video
                    ref={videoRef}
                    src={template.previewVideo}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover object-top"
                />
            )}
        </div>
    );
};

const SectionCard: React.FC<{
    template: TemplateItem;
    isActive: boolean;
    onNavigate: () => void;
    viewCount: number;
}> = ({ template, isActive, onNavigate, viewCount }) => {
    // Warm the preview chunk on hover/focus: several sections pull in three.js,
    // so without it every rail click stalls on a cold chunk load.
    const warm = useCallback(() => prefetchTemplateChunk(template.id), [template.id]);

    return (
        <button
            type="button"
            onClick={onNavigate}
            onMouseEnter={warm}
            onFocus={warm}
            aria-current={isActive ? 'page' : undefined}
            className={`group flex w-full flex-col overflow-hidden rounded-xl border text-left transition-colors focus-visible:outline-none ${
                isActive
                    ? 'border-[#1F4BFF] bg-[#2a2c31]'
                    : 'border-white/10 bg-[#242528] hover:border-white/25'
            }`}
        >
            <div className="relative">
                <RailThumbnail template={template} />
                {isActive && (
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-[#1F4BFF] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                        Open
                    </span>
                )}
            </div>

            <div className="min-w-0 px-3 py-2.5">
                <span className="block truncate text-sm text-neutral-200 transition-colors group-hover:text-white">
                    {template.title}
                </span>

                <span
                    className="mt-1.5 flex items-center gap-1 text-[10px] text-neutral-600"
                    aria-label={`${viewCount} views`}
                >
                    <Eye size={10} aria-hidden="true" />
                    {formatViewCount(viewCount)}
                </span>
            </div>
        </button>
    );
};

/**
 * Left navigation for the "Build with UI HUB" section.
 *
 * This is a catalog list, not a recommendation list. The templates rail ranks
 * every other template by relevance and shows a match percentage, which is
 * meaningless against a one-item pool, so the same visual language is used to
 * render a flat list of the published section URLs instead. Adding a slug to
 * BUILD_WITH_UI_HUB_SECTIONS is the only step needed to grow it.
 *
 * Two presentations from one shared card:
 *   - lg and up: a sticky 280px rail, matching the templates detail page
 *   - below lg:  a horizontally scrollable strip, because the desktop rail is
 *                `hidden lg:flex` and would otherwise be absent on phones
 */
const BuildWithUIHubRail: React.FC<BuildWithUIHubRailProps> = ({ activeSlug }) => {
    const navigate = useNavigate();

    // Static import is fine here: the rail is only ever mounted from the lazy
    // /build-with-ui-hub/:slug route, so the catalog is already a separate
    // chunk. A slug whose record is missing is simply not listed, rather than
    // rendering an empty card.
    const sections = BUILD_WITH_UI_HUB_SECTIONS.flatMap((entry) => {
        const template = buildWithUIHubTemplateBySlug[entry.slug];
        return template ? [{ slug: entry.slug, template }] : [];
    });
    const templateViewCounts = useTemplateViewCounts(sections.map((section) => section.template.id));

    const handleNavigate = useCallback(
        (slug: string, templateId: string) => {
            prefetchTemplateChunk(templateId);
            navigate(`${SECTION_PATH}/${slug}`);
        },
        [navigate],
    );

    return (
        <>
            {/* ── Desktop rail ── */}
            <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[280px] shrink-0 self-start flex-col border-r border-white/10 bg-[#191a1d] lg:flex">
                <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4">
                    <button
                        onClick={() => navigate(SECTION_PATH)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                        <ArrowLeft size={14} />
                        Go back
                    </button>
                </div>

                <div className="px-4 py-3">
                    <div className="text-sm font-semibold text-neutral-200">Build with UI HUB</div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                        {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                    <div className="space-y-2">
                        {sections.map(({ slug, template }) => (
                            <SectionCard
                                key={slug}
                                template={template}
                                isActive={slug === activeSlug}
                                viewCount={templateViewCounts[template.id] ?? 0}
                                onNavigate={() => handleNavigate(slug, template.id)}
                            />
                        ))}
                    </div>
                </div>
            </aside>

            {/* ── Mobile / tablet strip ── */}
            <div className="w-full shrink-0 border-b border-white/10 bg-[#191a1d] px-4 py-4 lg:hidden">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-200">
                        Build with UI HUB
                    </span>
                    <span className="text-[11px] text-neutral-500">
                        {sections.length} {sections.length === 1 ? 'section' : 'sections'}
                    </span>
                </div>

                <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1">
                    {sections.map(({ slug, template }) => (
                        <div key={slug} className="w-[190px] shrink-0 snap-start">
                            <SectionCard
                                template={template}
                                isActive={slug === activeSlug}
                                viewCount={templateViewCounts[template.id] ?? 0}
                                onNavigate={() => handleNavigate(slug, template.id)}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default BuildWithUIHubRail;
