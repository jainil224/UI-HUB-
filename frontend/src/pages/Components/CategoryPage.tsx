import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSeo } from '../../components/Seo';
import { componentList } from '../../data/componentData';
import { CATEGORY_SEO, categorySeo } from '../../seo/taxonomy';
import { categoryDescription, categoryTitle } from '../../seo/metadata';
import { breadcrumbJsonLd, collectionPageJsonLd } from '../../seo/jsonld';
import { INDEXABLE_ROBOTS, NOINDEX_ROBOTS } from '../../seo/routes';
import LibraryPage from '../LibraryPage/LibraryPage';

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

    return <LibraryPage initialComponentId={items[0]?.id} />;
}
