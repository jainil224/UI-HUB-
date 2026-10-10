import type { SeoConfig, SeoJsonLd } from '../components/Seo';
import { componentList } from '../data/componentData';
import {
    buildWithUIHubSlugByTemplateId,
    buildWithUIHubTemplateBySlug,
    websiteTemplates,
    type TemplateItem,
} from '../data/templatesData';
import type { TemplateSeoInput } from './metadata';
import {
    buildDetailSeoRoute,
    homeSeoRoute,
    staticSeoRoute,
    templateSeoRoute,
    type SeoRoute,
} from './routes';
import { CATEGORY_SEO } from './taxonomy';

/**
 * Builds the runtime head config for a route from the same route builders the
 * SSG manifest uses, so client-side navigation produces metadata identical to
 * what Google sees on the prerendered HTML.
 */

function routeToSeoConfig(route: SeoRoute): SeoConfig {
    return {
        title: route.title,
        description: route.description,
        canonicalPath: route.canonical,
        robots: route.robots,
        ogImage: route.ogImage,
        jsonLd: route.jsonLd as SeoJsonLd[],
    };
}

function toTemplateSeoEntry(template: TemplateItem): TemplateSeoInput {
    return {
        id: template.id,
        title: template.title,
        description: template.description,
        category: template.category,
        framework: template.framework,
        styling: template.styling,
        animation: template.animation,
        isPro: template.isPro,
        imageUrl: template.previewImage ?? template.thumbnailUrl,
        features: template.features,
    };
}

export function homeSeoConfig(): SeoConfig {
    const buildMasterIds = new Set(Object.keys(buildWithUIHubSlugByTemplateId));
    const gridTemplateCount = websiteTemplates.filter((template) => !buildMasterIds.has(template.id)).length;
    return routeToSeoConfig(homeSeoRoute(componentList.length, gridTemplateCount, CATEGORY_SEO.length));
}

export function staticPageSeoConfig(path: string): SeoConfig | undefined {
    const route = staticSeoRoute(path);
    return route ? routeToSeoConfig(route) : undefined;
}

export function templatesIndexSeoConfig(): SeoConfig {
    const config = staticPageSeoConfig('/templates');
    if (!config) throw new Error('Missing STATIC_ROUTES entry for /templates');
    return config;
}

export function buildIndexSeoConfig(): SeoConfig {
    const config = staticPageSeoConfig('/build-with-ui-hub');
    if (!config) throw new Error('Missing STATIC_ROUTES entry for /build-with-ui-hub');
    return config;
}

export function templateSeoConfig(id: string): SeoConfig | undefined {
    const template = websiteTemplates.find((item) => item.id === id);
    if (!template) return undefined;

    const gridTemplates = websiteTemplates
        .filter((item) => !buildWithUIHubSlugByTemplateId[item.id])
        .map(toTemplateSeoEntry);
    return routeToSeoConfig(templateSeoRoute(toTemplateSeoEntry(template), gridTemplates));
}

export function buildDetailSeoConfig(slug: string): SeoConfig | undefined {
    const template = buildWithUIHubTemplateBySlug[slug];
    if (!template) return undefined;

    const all = Object.values(buildWithUIHubTemplateBySlug).map((item) => ({
        slug: buildWithUIHubSlugByTemplateId[item.id] ?? item.id,
        title: item.title,
        description: item.description,
    }));
    const entry = all.find((item) => item.slug === slug);
    if (!entry) return undefined;

    return routeToSeoConfig(buildDetailSeoRoute(entry, all));
}