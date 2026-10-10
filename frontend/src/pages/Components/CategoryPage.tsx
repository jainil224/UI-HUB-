import React, { Suspense, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useSeo } from '../../components/Seo';
import ComponentPreviewTile from '../Dashboard/components/ComponentPreviewTile';
import { componentList } from '../../data/componentData';
import { CATEGORY_SEO, categorySeo } from '../../seo/taxonomy';
import { categoryDescription, categoryIntro, categoryTitle } from '../../seo/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '../../seo/jsonld';
import { SITE_URL } from '../../seo/site';
import { INDEXABLE_ROBOTS, NOINDEX_ROBOTS } from '../../seo/routes';

export default function CategoryPage() {
    const { category = '' } = useParams();
    const seoCategory = categorySeo(category);

    const items = useMemo(
        () => componentList.filter((item) => item.category === category),
        [category],
    );
    const title = seoCategory ? categoryTitle(category, items.length) : 'Category not found | UI Hub';
    const description = seoCategory
        ? categoryDescription(category, items.length)
        : 'That component category does not exist on UI Hub.';
    const canonicalPath = `/components/${category}`;
    const indexable = seoCategory ? items.length >= seoCategory.minItemsForIndex : false;

    const breadcrumbs = useMemo(
        () => [
            { name: 'Home', path: '/' },
            { name: 'Components', path: '/library' },
            { name: seoCategory?.label ?? category, path: canonicalPath },
        ],
        [seoCategory, category, canonicalPath],
    );

    useSeo({
        title,
        description,
        canonicalPath,
        robots: seoCategory ? (indexable ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS) : 'noindex, follow',
        jsonLd: seoCategory
            ? [
                  breadcrumbJsonLd(breadcrumbs) as Record<string, unknown>,
                  collectionPageJsonLd(
                      seoCategory.label,
                      seoCategory.primaryKeyword,
                      canonicalPath,
                      items.slice(0, 100).map((item) => ({
                          name: item.title,
                          path: `/components/${item.category}/${item.id}`,
                      })),
                  ) as Record<string, unknown>,
              ]
            : [],
    });

    if (!seoCategory) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
                <h1 className="text-3xl font-black">Category not found</h1>
                <p className="text-neutral-500">
                    There is no <code>{category}</code> category in the UI Hub library.
                </p>
                <Link to="/library" className="underline">
                    Browse all components
                </Link>
            </div>
        );
    }

    const introParagraphs = categoryIntro(
        category,
        items.length,
        items.map((item) => item.title),
    )
        .split(/\n{2,}/)
        .filter(Boolean);

    return (
        <div className="min-h-screen bg-[#0A0B0D] text-white pt-24 lg:pt-28 px-4 pb-16 sm:px-6">
            <div className="mx-auto max-w-[1400px]">
                <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
                    <Link to="/" className="hover:text-white">
                        Home
                    </Link>
                    <ChevronRight size={13} />
                    <Link to="/library" className="hover:text-white">
                        Components
                    </Link>
                    <ChevronRight size={13} />
                    <span className="text-white truncate">{seoCategory.label}</span>
                </nav>

                <header className="max-w-3xl mb-10">
                    <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">{seoCategory.label}</h1>
                    <p className="text-neutral-400 text-sm sm:text-base">{description}</p>
                </header>

                <section className="max-w-3xl mb-12 space-y-4 text-neutral-300 text-sm leading-relaxed">
                    {introParagraphs.map((paragraph, index) => (
                        <p key={index} dangerouslySetInnerHTML={{ __html: renderInlineMarkdown(paragraph) }} />
                    ))}
                </section>

                <section aria-label={`${seoCategory.label} components`}>
                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4">
                        {items.length} {items.length === 1 ? 'component' : 'components'}
                    </h2>

                    {items.length === 0 ? (
                        <p className="text-neutral-500 text-sm">
                            This category has no published components yet.
                        </p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/components/${item.category}/${item.id}`}
                                    className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#111318] hover:border-white/25 transition-colors"
                                >
                                    <div className="h-48 w-full overflow-hidden bg-[#0A0B0D]">
                                        <Suspense
                                            fallback={
                                                <div className="h-full w-full animate-pulse bg-white/5" />
                                            }
                                        >
                                            <ComponentPreviewTile item={item} />
                                        </Suspense>
                                    </div>
                                    <div className="flex items-center justify-between gap-2 px-4 py-3">
                                        <span className="truncate text-sm font-bold">{item.title}</span>
                                        {item.isPremium && (
                                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                                                Pro
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                <section className="mt-14 border-t border-white/10 pt-8">
                    <h2 className="text-sm font-black uppercase tracking-widest text-neutral-500 mb-4">
                        Other categories
                    </h2>
                    <ul className="flex flex-wrap gap-2">
                        {CATEGORY_SEO.filter((entry) => entry.slug !== category).map((entry) => (
                            <li key={entry.slug}>
                                <Link
                                    to={`/components/${entry.slug}`}
                                    className="inline-block rounded-full border border-white/10 px-3 py-1.5 text-xs text-neutral-300 hover:border-white/30 hover:text-white transition-colors"
                                >
                                    {entry.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </section>

                <p className="mt-10 text-xs text-neutral-600">
                    <a href={`${SITE_URL}/sitemap.xml`}>Sitemap</a>
                </p>
            </div>
        </div>
    );
}

function renderInlineMarkdown(value: string): string {
    const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
    return escaped;
}