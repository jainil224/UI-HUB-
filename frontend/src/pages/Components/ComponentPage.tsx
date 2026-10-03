import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useSeo } from '../../components/Seo';
import CodeHighlighter from '../../components/ui/CodeHighlighter';
import { componentList } from '../../data/componentData';
import { DemoErrorBoundary as PreviewBoundary } from './DemoPage';
import { categorySeo } from '../../seo/taxonomy';
import { componentDescription, componentIntro, componentPath, componentTitle } from '../../seo/metadata';
import { breadcrumbJsonLd, imageObjectJsonLd, softwareSourceCodeJsonLd } from '../../seo/jsonld';
import { propRows, toComponentSeoInput, type ComponentConfig } from '../../seo/component-seo';
import { SITE_URL } from '../../seo/site';

export default function ComponentPage() {
    const { category = '', slug = '' } = useParams();
    const [config, setConfig] = useState<ComponentConfig | undefined>(undefined);

    const item = useMemo(
        () => componentList.find((entry) => entry.id === slug && entry.category === category),
        [slug, category],
    );

    useEffect(() => {
        let cancelled = false;
        if (!slug) return;
        import('../../data/componentMetadata')
            .then((module) => {
                if (!cancelled) setConfig(module.COMPONENT_CONFIG[slug]);
            })
            .catch(() => {
                /* props table is optional - the page still renders without it */
            });
        return () => {
            cancelled = true;
        };
    }, [slug]);

    const related = useMemo(() => {
        if (!item) return [];
        return componentList
            .filter((entry) => entry.category === item.category && entry.id !== item.id)
            .slice(0, 6);
    }, [item]);

    const seoInput = useMemo(() => (item ? toComponentSeoInput(item, config) : undefined), [item, config]);
    const path = componentPath({ category, id: slug });
    const seoCategory = categorySeo(category);

    const title = item ? componentTitle(seoInput!) : 'Component not found | UI Hub';
    const description = item ? componentDescription(seoInput!) : 'That component does not exist on UI Hub.';

    const breadcrumbs = useMemo(
        () => [
            { name: 'Home', path: '/' },
            { name: 'Components', path: '/library' },
            ...(seoCategory ? [{ name: seoCategory.label, path: `/components/${category}` }] : []),
            { name: item?.title ?? slug, path },
        ],
        [seoCategory, category, item, slug, path],
    );

    const jsonLd = useMemo(() => {
        if (!item) return [];
        const schemas: Record<string, unknown>[] = [breadcrumbJsonLd(breadcrumbs) as Record<string, unknown>];
        schemas.push(
            softwareSourceCodeJsonLd({
                name: item.title,
                description,
                path,
                techs: seoInput!.techs,
                dateAdded: item.addedAt,
            }) as Record<string, unknown>,
        );
        if (item.imageUrl) {
            schemas.push(imageObjectJsonLd(item.imageUrl) as Record<string, unknown>);
        }
        return schemas;
    }, [item, breadcrumbs, description, path, seoInput]);

    useSeo({
        title,
        description,
        canonicalPath: path,
        ogImage: item?.imageUrl,
        robots: item ? 'index, follow' : 'noindex, follow',
        jsonLd,
    });

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
                <h1 className="text-3xl font-black">Component not found</h1>
                <p className="text-neutral-500">
                    No component matches <code>{slug}</code> in the {category || 'UI Hub'} category.
                </p>
                <Link to="/library" className="underline">
                    Browse all components
                </Link>
            </div>
        );
    }

    const props = propRows(config);
    const introParagraphs = componentIntro(seoInput!)
        .split(/\n{2,}/)
        .filter(Boolean);
    const code = item.code || '';

    return (
        <div className="min-h-screen bg-[#0A0B0D] text-white pt-24 lg:pt-28 px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-[1400px]">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-6 flex-wrap">
                    <Link to="/" className="hover:text-white">
                        Home
                    </Link>
                    <ChevronRight size={13} />
                    <Link to="/library" className="hover:text-white">
                        Components
                    </Link>
                    <ChevronRight size={13} />
                    <Link to={`/components/${item.category}`} className="hover:text-white">
                        {seoCategory?.label ?? item.category}
                    </Link>
                    <ChevronRight size={13} />
                    <span className="text-white truncate">{item.title}</span>
                </nav>

                <header className="max-w-3xl mb-8">
                    <div className="flex items-center gap-3 mb-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{item.title}</h1>
                        {item.isPremium && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Pro</span>
                        )}
                    </div>
                    <p className="text-neutral-400 text-sm sm:text-base">{description}</p>
                    {seoInput!.techs.length > 0 && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {seoInput!.techs.map((tech) => (
                                <li
                                    key={tech}
                                    className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-neutral-400"
                                >
                                    {tech}
                                </li>
                            ))}
                        </ul>
                    )}
                </header>

                <section
                    aria-label={`${item.title} preview`}
                    className="relative w-full h-[60vh] min-h-[320px] rounded-2xl overflow-hidden border border-white/10 bg-[#0A0B0D]"
                >
                    <PreviewBoundary>
                        <Suspense
                            fallback={<div className="h-full w-full animate-pulse bg-white/5" />}
                        >
                            {item.preview({ showDemoButton: true })}
                        </Suspense>
                    </PreviewBoundary>
                </section>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-10">
                    <div className="space-y-10">
                        <section className="space-y-4 text-neutral-300 text-sm leading-relaxed">
                            {introParagraphs.map((paragraph, index) => (
                                <p key={index}>{stripMarkdown(paragraph)}</p>
                            ))}
                        </section>

                        {code && (
                            <section aria-labelledby="code-heading">
                                <h2 id="code-heading" className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">
                                    Source
                                </h2>
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <CodeHighlighter code={code} />
                                </div>
                            </section>
                        )}

                        {props.length > 0 && (
                            <section aria-labelledby="props-heading">
                                <h2 id="props-heading" className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-3">
                                    Props
                                </h2>
                                <div className="overflow-x-auto rounded-xl border border-white/10">
                                    <table className="w-full text-left text-xs">
                                        <thead className="text-neutral-500">
                                            <tr>
                                                <th scope="col" className="px-4 py-2 font-bold">Prop</th>
                                                <th scope="col" className="px-4 py-2 font-bold">Type</th>
                                                <th scope="col" className="px-4 py-2 font-bold">Default</th>
                                                <th scope="col" className="px-4 py-2 font-bold">Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {props.map((prop) => (
                                                <tr key={prop.name} className="border-t border-white/5 align-top">
                                                    <td className="px-4 py-2 font-mono text-neutral-200">{prop.name}</td>
                                                    <td className="px-4 py-2 font-mono text-neutral-500">{prop.type}</td>
                                                    <td className="px-4 py-2 font-mono text-neutral-500">{prop.default}</td>
                                                    <td className="px-4 py-2 text-neutral-400">{prop.description}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        {seoInput!.requirements.length > 0 && (
                            <section className="rounded-xl border border-white/10 p-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">
                                    Requirements
                                </h2>
                                <ul className="space-y-2 text-xs text-neutral-400 list-disc pl-4">
                                    {seoInput!.requirements.map((requirement) => (
                                        <li key={requirement}>{requirement}</li>
                                    ))}
                                </ul>
                            </section>
                        )}

                        <section className="rounded-xl border border-white/10 p-4">
                            <h2 className="text-xs font-black uppercase tracking-widest text-neutral-500 mb-3">Actions</h2>
                            <div className="flex flex-col gap-2 text-xs">
                                <a href={`${SITE_URL}${path}`} className="underline text-neutral-400 hover:text-white">
                                    Permalink
                                </a>
                                {item.liveUrl && (
                                    <a href={item.liveUrl} className="underline text-neutral-400 hover:text-white">
                                        Live demo
                                    </a>
                                )}
                                <Link to="/library" className="underline text-neutral-400 hover:text-white">
                                    Back to library
                                </Link>
                            </div>
                        </section>
                    </aside>
                </div>

                {related.length > 0 && (
                    <section className="mt-16 border-t border-white/10 pt-8">
                        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4">
                            More {seoCategory?.label.toLowerCase() ?? item.category}
                        </h2>
                        <ul className="flex flex-wrap gap-2">
                            {related.map((entry) => (
                                <li key={entry.id}>
                                    <Link
                                        to={`/components/${entry.category}/${entry.id}`}
                                        className="inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white transition-colors"
                                    >
                                        {entry.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </div>
    );
}

function stripMarkdown(value: string): string {
    return value.replace(/\*\*/g, '').replace(/`/g, '');
}