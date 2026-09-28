import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { TemplateItem, websiteTemplates } from '../../data/templatesData';
import {
    getRelatedTemplates,
    toMatchPercent,
    RelatedTemplate,
} from '../../utils/templateRelevance';
import { prefetchTemplateChunk } from './registry';

/** How many matches the rail shows before "Show all" is pressed. */
export const SIMILAR_COLLAPSED_COUNT = 5;

interface TemplateSimilarRailProps {
    /** The template currently open - it is never listed among its own matches. */
    template: TemplateItem;
    /** True when the visitor asked to see the full match list. */
    expanded: boolean;
    onToggleExpanded: () => void;
}

/**
 * Video-only thumbnail, loaded lazily as it approaches the viewport.
 *
 * The rail deliberately never uses `previewImage`: of the 16 `previewImage`
 * paths in the catalogue only `logo-here.png` actually exists - the other 15
 * return the SPA's index.html, so an <img> branch rendered a broken icon on
 * almost every card. The .webm files are the only real preview assets.
 *
 * Templates with no .webm (LogoHere) fall back to their own brand gradient, so
 * a card is never blank. The gradient is the base layer rather than only a
 * fallback, which means the card paints its brand colour immediately and the
 * video fades in over it instead of flashing black.
 *
 * Videos are not attached until the card is within 200px of the viewport: six
 * autoplaying previews are up to ~5MB, and expanding to all 17 would be far
 * worse. The observer disconnects after the first hit so scrolling back past a
 * card never re-fetches it.
 */
const RelatedThumbnail: React.FC<{ template: TemplateItem }> = ({ template }) => {
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

/**
 * One related template.
 */
const RelatedCard: React.FC<{ item: RelatedTemplate; onNavigate: (id: string) => void }> = ({
    item,
    onNavigate,
}) => {
    const { template } = item;
    const matchPercent = toMatchPercent(item.score);

    const warm = useCallback(() => prefetchTemplateChunk(template.id), [template.id]);

    return (
        <button
            type="button"
            onClick={() => onNavigate(template.id)}
            onMouseEnter={warm}
            onFocus={warm}
            aria-label={`${template.title} - ${matchPercent}% match`}
            className="group flex w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-[#242528] text-left transition-colors hover:border-white/25 focus-visible:border-white/40 focus-visible:outline-none"
        >
            <div className="relative">
                <RelatedThumbnail template={template} />
                <span className="absolute right-1.5 top-1.5 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white/85 backdrop-blur-sm">
                    {matchPercent}%
                </span>
            </div>

            <div className="min-w-0 px-3 py-2.5">
                <span className="block truncate text-sm text-neutral-200 transition-colors group-hover:text-white">
                    {template.title}
                </span>

                <span className="mt-1.5 flex items-center gap-1 text-[10px] text-neutral-600">
                    <Eye size={10} aria-hidden="true" />
                    {template.stats.downloads}
                </span>
            </div>
        </button>
    );
};

/**
 * "Similar Templates" navigation for the template detail page.
 *
 * Renders two presentations from one ranked list and one shared card:
 *   - lg and up: a sticky 280px rail, top 5 with a "Show all" toggle
 *   - below lg:  a horizontally scrollable strip, because the rail used to be
 *                `hidden lg:flex` and therefore entirely absent on phones
 *
 * When expanded on a small screen the strip becomes a vertical list so the
 * `?similar=all` URL state behaves the same at every breakpoint.
 */
const TemplateSimilarRail: React.FC<TemplateSimilarRailProps> = ({
    template,
    expanded,
    onToggleExpanded,
}) => {
    const navigate = useNavigate();

    const allRelated = useMemo(() => getRelatedTemplates(template, websiteTemplates), [template]);
    const visible = useMemo(
        () => (expanded ? allRelated : allRelated.slice(0, SIMILAR_COLLAPSED_COUNT)),
        [allRelated, expanded],
    );

    const hiddenCount = allRelated.length - visible.length;

    const handleNavigate = useCallback(
        (id: string) => {
            prefetchTemplateChunk(id);
            // Carry the expansion forward so hopping through matches keeps the
            // rail open and the browser Back button lands on the same view.
            navigate({ pathname: `/templates/${id}`, search: expanded ? '?similar=all' : '' });
        },
        [navigate, expanded],
    );

    return (
        <>
            {/* ── Desktop rail ── */}
            <aside className="sticky top-[72px] hidden h-[calc(100vh-72px)] w-[280px] shrink-0 self-start flex-col border-r border-white/10 bg-[#191a1d] lg:flex">
                <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-4">
                    <button
                        onClick={() => navigate('/templates')}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.08] hover:text-white"
                    >
                        <ArrowLeft size={14} />
                        Go back
                    </button>
                </div>

                <div className="px-4 py-3">
                    <div className="text-sm font-semibold text-neutral-200">Similar Templates</div>
                    <div className="mt-0.5 text-[11px] text-neutral-500">
                        {expanded
                            ? `All ${allRelated.length} ranked by relevance`
                            : `Top ${visible.length} of ${allRelated.length} ranked by relevance`}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
                    <div className="space-y-2">
                        {visible.map((item) => (
                            <RelatedCard
                                key={item.template.id}
                                item={item}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>

                    {allRelated.length > SIMILAR_COLLAPSED_COUNT && (
                        <button
                            type="button"
                            onClick={onToggleExpanded}
                            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                        >
                            {expanded ? (
                                <>
                                    <ChevronUp size={13} />
                                    Show fewer
                                </>
                            ) : (
                                <>
                                    <ChevronDown size={13} />
                                    Show all {allRelated.length}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </aside>

            {/* ── Mobile / tablet strip ── */}
            <div className="w-full shrink-0 border-b border-white/10 bg-[#191a1d] px-4 py-4 lg:hidden">
                <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm font-semibold text-neutral-200">
                        Similar Templates
                    </span>
                    <span className="text-[11px] text-neutral-500">
                        {expanded ? `All ${allRelated.length}` : `Top ${visible.length} of ${allRelated.length}`}
                    </span>
                </div>

                {expanded ? (
                    <div className="mt-3 space-y-2">
                        {visible.map((item) => (
                            <RelatedCard
                                key={item.template.id}
                                item={item}
                                onNavigate={handleNavigate}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="-mx-4 mt-3 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1">
                        {visible.map((item) => (
                            <div
                                key={item.template.id}
                                className="w-[190px] shrink-0 snap-start"
                            >
                                <RelatedCard item={item} onNavigate={handleNavigate} />
                            </div>
                        ))}
                    </div>
                )}

                {allRelated.length > SIMILAR_COLLAPSED_COUNT && (
                    <button
                        type="button"
                        onClick={onToggleExpanded}
                        className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-neutral-300 transition-colors hover:bg-white/[0.07] hover:text-white"
                    >
                        {expanded ? (
                            <>
                                <ChevronUp size={13} />
                                Show fewer
                            </>
                        ) : (
                            <>
                                <ChevronDown size={13} />
                                Show all {allRelated.length}
                                {hiddenCount > 0 && (
                                    <span className="text-neutral-600">(+{hiddenCount})</span>
                                )}
                            </>
                        )}
                    </button>
                )}
            </div>
        </>
    );
};

export default TemplateSimilarRail;
