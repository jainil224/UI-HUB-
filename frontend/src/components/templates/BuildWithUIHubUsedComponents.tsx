import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Boxes, Loader2 } from 'lucide-react';

/**
 * "Built with UI HUB" panel for the Build with UI HUB detail page.
 *
 * Renders below the section preview and names the catalog components that
 * section is made from, each linking through to that component. Lives here
 * rather than in TemplatePreviewStage because that stage is shared with
 * /templates/:id, and this panel belongs to the Build area only.
 */

interface UsedComponent {
    id: string;
    title: string;
    category: string;
    description: string;
}

interface BuildWithUIHubUsedComponentsProps {
    /** Catalog ids from the section record. */
    componentIds: string[];
}

/**
 * The catalog is a ~760 kB module, far too heavy to pull in on the detail
 * page's critical path, so it is resolved after mount. searchIndex.ts lazy
 * imports the same module for the same reason.
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
            const wanted = new Set(componentIds);
            setComponents(
                componentList
                    .filter((item) => wanted.has(item.id))
                    .map((item) => ({
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        description: item.description ?? '',
                    })),
            );
            setIsLoading(false);
        });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);

    return { components, isLoading };
}

const CATEGORY_LABEL: Record<string, string> = {
    '3d': '3D',
    text: 'Text',
    effect: 'Effect',
    background: 'Background',
    'interactive-background': 'Interactive',
    'particles-background': 'Particles',
    button: 'Button',
    cursor: 'Cursor',
    scroll: 'Scroll',
    'image-interaction': 'Image',
    loader: 'Loader',
    navbar: 'Navbar',
    footer: 'Footer',
    form: 'Form',
    custom: 'Custom',
};

const BuildWithUIHubUsedComponents: React.FC<BuildWithUIHubUsedComponentsProps> = ({
    componentIds,
}) => {
    const navigate = useNavigate();
    const { components, isLoading } = useCatalogComponents(componentIds);

    // A section with no declared components renders nothing at all rather than
    // an empty shell, so the panel never becomes a dead heading.
    if (!componentIds.length) return null;

    const openComponent = (id: string) => navigate(`/library?id=${encodeURIComponent(id)}`);

    return (
        <section className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#141519]">
            <header className="flex min-h-14 items-center justify-between gap-3 border-b border-white/10 px-3 py-3 sm:px-4">
                <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-[#25262a] text-neutral-300">
                        <Boxes size={15} />
                    </span>
                    <div className="min-w-0">
                        <h2 className="text-sm font-medium text-neutral-200">
                            Built with UI HUB
                        </h2>
                        <p className="text-[11px] text-neutral-500">
                            {componentIds.length === 1
                                ? 'This section is 1 UI HUB component'
                                : `This section uses ${componentIds.length} UI HUB components`}
                        </p>
                    </div>
                </div>
            </header>

            {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-4 text-[12px] text-neutral-500 sm:px-4">
                    <Loader2 size={14} className="animate-spin" />
                    Loading components...
                </div>
            ) : components.length === 0 ? (
                <p className="px-3 py-4 text-[12px] text-neutral-500 sm:px-4">
                    Component details are unavailable right now.
                </p>
            ) : (
                <ul className="divide-y divide-white/[0.06]">
                    {components.map((component) => (
                        <li key={component.id}>
                            <button
                                type="button"
                                onClick={() => openComponent(component.id)}
                                className="group flex w-full items-start gap-3 px-3 py-3.5 text-left transition-colors hover:bg-white/[0.04] sm:px-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-medium text-neutral-100">
                                            {component.title}
                                        </span>
                                        <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                                            {CATEGORY_LABEL[component.category] ??
                                                component.category}
                                        </span>
                                        <code className="text-[10px] text-neutral-600">
                                            {component.id}
                                        </code>
                                    </div>
                                    {component.description ? (
                                        <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-neutral-400">
                                            {component.description}
                                        </p>
                                    ) : null}
                                </div>
                                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-[#25262a] text-neutral-400 transition-colors group-hover:border-[#1F4BFF] group-hover:text-white">
                                    <ArrowUpRight size={14} />
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default BuildWithUIHubUsedComponents;
