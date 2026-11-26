import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Loader2 } from 'lucide-react';
import { useComponentViewCounts } from '../../hooks/useTemplateViewCounts';
import { formatViewCount, getComponentViewDisplay } from '../../services/templateViews';
import { PreviewInteractionProvider } from '../../context/PreviewInteractionContext';

/**
 * "Components Used" section for the Build with UI HUB detail page.
 *
 * Renders below the section preview and displays cards with live previews of the
 * catalog components used to build this section. Each card displays the component's
 * preview, title, view count, and links to the component in the library.
 */

interface UsedComponent {
    id: string;
    title: string;
    category: string;
    description: string;
    preview?: (props?: any) => React.ReactNode;
    imageUrl?: string;
    isFullBleed?: boolean;
}

interface BuildWithUIHubUsedComponentsProps {
    /** Catalog ids from the section record. */
    componentIds: string[];
}

const NATURAL_SIZE_CATEGORIES = new Set(['button', 'text', 'effect', 'image-interaction', 'form']);

const FIT_STYLE: React.CSSProperties = {
    minWidth: 0,
    minHeight: 0,
    width: '100%',
    height: '100%',
    borderRadius: 0,
    border: 'none',
};

function fitPreview(node: React.ReactNode): React.ReactNode {
    if (!React.isValidElement(node)) return node;
    const el = node as React.ReactElement<{ style?: React.CSSProperties }>;
    return React.cloneElement<{ style?: React.CSSProperties }>(el, {
        style: { ...el.props.style, ...FIT_STYLE },
    });
}

class PreviewErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean }
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: any) {
        console.warn('Component preview failed to render:', error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-full w-full items-center justify-center bg-[#050505] font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                    Preview unavailable
                </div>
            );
        }
        return this.props.children;
    }
}

function PreviewFallback() {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050505] font-mono text-neutral-500">
            <Loader2 size={18} className="animate-spin text-[#1F4BFF]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Loading preview...</span>
        </div>
    );
}

/**
 * The catalog is a ~760 kB module, far too heavy to pull in on the detail
 * page's critical path, so it is resolved after mount.
 */
function useCatalogComponents(componentIds: string[]): {
    components: UsedComponent[];
    isLoading: boolean;
} {
    const [components, setComponents] = useState<UsedComponent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const key = componentIds.join('|');

    useEffect(() => {
        if (!componentIds.length) {
            setComponents([]);
            return;
        }

        let cancelled = false;
        setIsLoading(true);

        import('../../data/componentData').then(({ componentList }) => {
            if (cancelled) return;
            const catalogMap = new Map(componentList.map((item) => [item.id, item]));
            const resolved = componentIds
                .map((id) => catalogMap.get(id))
                .filter((item): item is NonNullable<typeof item> => Boolean(item))
                .map((item) => ({
                    id: item.id,
                    title: item.title,
                    category: item.category,
                    description: item.description ?? '',
                    preview: item.preview,
                    imageUrl: item.imageUrl,
                    isFullBleed: item.isFullBleed,
                }));
            setComponents(resolved);
            setIsLoading(false);
        });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { components, isLoading };
}

const BuildWithUIHubUsedComponents: React.FC<BuildWithUIHubUsedComponentsProps> = ({
    componentIds,
}) => {
    const navigate = useNavigate();
    const { components, isLoading } = useCatalogComponents(componentIds);
    const viewCounts = useComponentViewCounts(componentIds);

    // A section with no declared components renders nothing at all rather than
    // an empty shell, so the panel never becomes a dead heading.
    if (!componentIds.length) return null;

    const openComponent = (id: string) => navigate(`/library?id=${encodeURIComponent(id)}`);

    return (
        <section className="mt-8">
            <div className="mb-4">
                <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-neutral-200">
                    Components Used
                </h2>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    {componentIds.length === 1
                        ? 'This section is 1 UI HUB component'
                        : `This section uses ${componentIds.length} UI HUB components`}
                </p>
            </div>

            {isLoading ? (
                <div className="flex items-center gap-2 py-6 font-mono text-[10px] font-black uppercase tracking-wider text-neutral-500">
                    <Loader2 size={16} className="animate-spin text-[#1F4BFF]" />
                    <span>Loading components...</span>
                </div>
            ) : components.length === 0 ? (
                <p className="py-4 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                    Component details are unavailable right now.
                </p>
            ) : (
                <div className="flex flex-wrap gap-5">
                    {components.map((component) => {
                        const rawCount = viewCounts[component.id];
                        const displayCount =
                            rawCount !== undefined
                                ? formatViewCount(rawCount)
                                : getComponentViewDisplay(component.id);
                        const natural = NATURAL_SIZE_CATEGORIES.has(component.category) && !component.isFullBleed;

                        return (
                            <div
                                key={component.id}
                                onClick={() => openComponent(component.id)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Open ${component.title} in component library`}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        openComponent(component.id);
                                    }
                                }}
                                className="group relative flex flex-col w-full sm:w-[360px] md:w-[380px] overflow-hidden rounded-xl border-2 border-neutral-800 bg-[#0B0B0D] transition-all duration-300 hover:border-white hover:shadow-[6px_6px_0px_0px_#000000] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3D5CFF]"
                            >
                                {/* Preview Canvas / Stage */}
                                <div className="relative w-full h-[220px] sm:h-[240px] overflow-hidden border-b-2 border-neutral-800 bg-[#050505] flex items-center justify-center">
                                    {component.preview ? (
                                        <PreviewInteractionProvider className="relative w-full h-full flex items-center justify-center overflow-hidden">
                                            <PreviewErrorBoundary>
                                                <React.Suspense fallback={<PreviewFallback />}>
                                                    {natural ? (
                                                        <div className="w-full h-full flex items-center justify-center p-6">
                                                            {component.preview()}
                                                        </div>
                                                    ) : (
                                                        <div className="w-full h-full overflow-hidden flex items-center justify-center">
                                                            {fitPreview(component.preview())}
                                                        </div>
                                                    )}
                                                </React.Suspense>
                                            </PreviewErrorBoundary>
                                        </PreviewInteractionProvider>
                                    ) : component.imageUrl ? (
                                        <img
                                            src={component.imageUrl}
                                            alt={component.title}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-[#050505] font-mono text-[10px] uppercase tracking-widest text-neutral-500">
                                            No preview available
                                        </div>
                                    )}
                                </div>

                                {/* Bottom Info Bar matching reference image */}
                                <div className="flex items-center justify-between px-4 py-3 bg-[#0A0A0A] border-t-2 border-neutral-800">
                                    <span className="font-mono font-black text-[11px] uppercase tracking-wider text-neutral-300 group-hover:text-white transition-colors truncate">
                                        {component.title}
                                    </span>
                                    <div className="inline-flex shrink-0 items-center gap-1.5 px-2 py-1 rounded-sm border border-white/10 bg-black/60 font-mono text-[10px] font-bold text-neutral-300 ml-3">
                                        <Eye size={13} className="text-[#FFC700]" />
                                        <span>{displayCount !== '—' ? displayCount : '0'}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
};

export default BuildWithUIHubUsedComponents;
