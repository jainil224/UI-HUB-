import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '../../components/Seo';
import { componentList } from '../../data/componentData';
import { categorySeo } from '../../seo/taxonomy';
import { componentDescription, componentPath, componentTitle } from '../../seo/metadata';
import { breadcrumbJsonLd, imageObjectJsonLd, softwareSourceCodeJsonLd } from '../../seo/jsonld';
import { toComponentSeoInput, type ComponentConfig } from '../../seo/component-seo';
import LibraryPage from '../LibraryPage/LibraryPage';

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

    return <LibraryPage initialComponentId={item.id} />;
}