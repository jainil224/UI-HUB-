import { DEFAULT_OG_IMAGE, SITE_ALTERNATE_NAMES, SITE_NAME, SITE_URL, absoluteUrl } from './site';

export interface Breadcrumb {
    name: string;
    path: string;
}

export function organizationJsonLd(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: `${SITE_URL}/`,
        logo: {
            '@type': 'ImageObject',
            url: `${SITE_URL}/favicon.svg`,
        },
    };
}

export function webSiteJsonLd(): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALTERNATE_NAMES,
        url: `${SITE_URL}/`,
        publisher: { '@id': `${SITE_URL}/#organization` },
    };
}

export function breadcrumbJsonLd(breadcrumbs: Breadcrumb[]): object | null {
    if (breadcrumbs.length < 2) return null;
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: crumb.name,
            item: absoluteUrl(crumb.path),
        })),
    };
}

export function collectionPageJsonLd(
    name: string,
    description: string,
    path: string,
    items: { name: string; path: string }[],
): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name,
        description,
        url: absoluteUrl(path),
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
            '@type': 'ItemList',
            numberOfItems: items.length,
            itemListElement: items.slice(0, 100).map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                url: absoluteUrl(item.path),
            })),
        },
    };
}

export function softwareSourceCodeJsonLd(input: {
    name: string;
    description: string;
    path: string;
    techs: string[];
    dateAdded?: string;
}): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareSourceCode',
        name: input.name,
        description: input.description,
        url: absoluteUrl(input.path),
        codeRepository: absoluteUrl(input.path),
        programmingLanguage: 'TypeScript',
        runtimePlatform: input.techs.includes('React') ? 'React' : 'Web Browser',
        ...(input.dateAdded ? { datePublished: input.dateAdded } : {}),
    };
}

export function imageObjectJsonLd(url: string): object {
    return {
        '@context': 'https://schema.org',
        '@type': 'ImageObject',
        url: absoluteUrl(url),
        contentUrl: absoluteUrl(url),
    };
}

export { DEFAULT_OG_IMAGE };