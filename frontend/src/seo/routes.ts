import {
    ComponentSeoInput,
    TemplateSeoInput,
    componentDescription,
    componentIntro,
    componentPath,
    componentTitle,
    categoryDescription,
    categoryIntro,
    categoryTitle,
    templateDescription,
    templateIntro,
    templateTitle,
} from './metadata';
import {
    Breadcrumb,
    breadcrumbJsonLd,
    collectionPageJsonLd,
    organizationJsonLd,
    softwareSourceCodeJsonLd,
    webSiteJsonLd,
} from './jsonld';
import { CATEGORY_SEO, categoryLabel } from './taxonomy';
import { DEFAULT_OG_IMAGE, SITE_NAME, absoluteUrl, clampDescription, clampTitle } from './site';
import type { ComponentAeo } from './aeo';

export type SeoRouteType =
    | 'home'
    | 'category'
    | 'component'
    | 'templates-index'
    | 'template'
    | 'build-index'
    | 'build-detail'
    | 'static';

export interface SeoRoute {
    path: string;
    type: SeoRouteType;
    title: string;
    description: string;
    h1: string;
    intro: string;
    robots: string;
    canonical: string;
    ogImage: string;
    breadcrumbs: Breadcrumb[];
    jsonLd: object[];
    related: { path: string; title: string }[];
    lastmod?: string;
    priority: number;
    changefreq: 'daily' | 'weekly' | 'monthly' | 'yearly';
    indexable: boolean;
    /** Answer-first content, present on component routes. */
    aeo?: ComponentAeo;
}

export interface BuildWithUIHubInput {
    slug: string;
    title: string;
    description?: string;
}

export type TemplateSeoEntry = TemplateSeoInput & { id: string };

export interface SeoManifestInput {
    components: (ComponentSeoInput & { aeo?: ComponentAeo })[];
    templates: TemplateSeoInput[];
    buildWithUIHub: BuildWithUIHubInput[];
    buildTemplateIds: string[];
}

export const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1';
export const NOINDEX_ROBOTS = 'noindex, follow';

const STATIC_ROUTES: { path: string; title: string; description: string; h1: string; changefreq: SeoRoute['changefreq']; priority: number }[] = [
    {
        path: '/templates',
        title: clampTitle(`Website Templates – React & Tailwind CSS | ${SITE_NAME}`),
        description: clampDescription(
            'Browse free website templates built with React, Tailwind CSS and Framer Motion. Each template ships with a live preview, feature list and animation notes so you can judge it before using it.',
        ),
        h1: 'Website Templates',
        changefreq: 'weekly',
        priority: 0.9,
    },
    {
        path: '/build-with-ui-hub',
        title: clampTitle(`Build with UI HUB – Full Page Sections | ${SITE_NAME}`),
        description: clampDescription(
            'Rebuild complete website sections with UI HUB: full page hero sections, footers and marketing blocks you can preview, inspect and copy into your own project.',
        ),
        h1: 'Build with UI HUB',
        changefreq: 'weekly',
        priority: 0.8,
    },
    {
        path: '/pricing',
        title: clampTitle(`Pricing – Plans & Credits | ${SITE_NAME}`),
        description: clampDescription(
            'UI HUB pricing, plan options and credit details for copying components, templates and full page sections.',
        ),
        h1: 'Pricing',
        changefreq: 'monthly',
        priority: 0.6,
    },
    {
        path: '/privacy',
        title: clampTitle(`Privacy Policy | ${SITE_NAME}`),
        description: clampDescription('How UI HUB collects, uses and protects your personal data.'),
        h1: 'Privacy Policy',
        changefreq: 'yearly',
        priority: 0.2,
    },
    {
        path: '/terms',
        title: clampTitle(`Terms of Service | ${SITE_NAME}`),
        description: clampDescription('The terms that apply when you use UI HUB components, templates and code.'),
        h1: 'Terms of Service',
        changefreq: 'yearly',
        priority: 0.2,
    },
    {
        path: '/payment-policy',
        title: clampTitle(`Payment Policy | ${SITE_NAME}`),
        description: clampDescription('Payments, refunds and billing questions for UI HUB plans and credits.'),
        h1: 'Payment Policy',
        changefreq: 'yearly',
        priority: 0.2,
    },
    {
        path: '/cookies',
        title: clampTitle(`Cookie Settings | ${SITE_NAME}`),
        description: clampDescription('Choose which cookies UI HUB may use, including analytics and advertising cookies.'),
        h1: 'Cookie Settings',
        changefreq: 'yearly',
        priority: 0.2,
    },
];

function homeIntro(componentCount: number, templateCount: number, categoryCount: number): string {
    return [
        `**UI HUB** is a component library for frontend developers working with React, Tailwind CSS, TypeScript and Framer Motion. Every component can be previewed in the browser and copied as production-ready code, and each one also ships with an AI-ready prompt for Lovable, Claude, Cursor and Google Antigravity, so you can generate the same component inside your own project.`,
        `The library currently holds ${componentCount} components across ${categoryCount} categories, plus ${templateCount} complete website templates. Categories cover interactive and animated backgrounds, 3D and WebGL effects, custom cursors, animated text, buttons, navbars, footers, forms, loaders, scroll animations and image interactions.`,
        `Every component page includes a live preview, a documented props table and the full source, so you can check the API before you commit to it. Search the library, filter by category, and copy the code when a component fits your design.`,
    ].join('\n\n');
}

export function homeSeoRoute(componentCount: number, templateCount: number, categoryCount: number): SeoRoute {
    return {
        path: '/',
        type: 'home',
        title: clampTitle('UI Hub – Free React UI Components & Animated Backgrounds'),
        description: clampDescription(
            'Browse free React and Tailwind CSS UI components: animated backgrounds, 3D effects, custom cursors, buttons, navbars and footers. Live preview, copy the code, or use the AI prompts for Lovable, Claude and Cursor.',
        ),
        h1: 'Craft the Future, of UI',
        intro: homeIntro(componentCount, templateCount, categoryCount),
        robots: INDEXABLE_ROBOTS,
        canonical: absoluteUrl('/'),
        ogImage: DEFAULT_OG_IMAGE,
        breadcrumbs: [{ name: 'Home', path: '/' }],
        jsonLd: [organizationJsonLd(), webSiteJsonLd()],
        related: CATEGORY_SEO.slice(0, 6).map((category) => ({
            path: `/components/${category.slug}`,
            title: category.label,
        })),
        changefreq: 'weekly',
        priority: 1.0,
        indexable: true,
    };
}

export function staticSeoRoute(path: string): SeoRoute | undefined {
    const route = STATIC_ROUTES.find((entry) => entry.path === path);
    if (!route) return undefined;

    return {
        path: route.path,
        type: route.path === '/templates' ? 'templates-index' : route.path === '/build-with-ui-hub' ? 'build-index' : 'static',
        title: route.title,
        description: route.description,
        h1: route.h1,
        intro: '',
        robots: INDEXABLE_ROBOTS,
        canonical: absoluteUrl(route.path),
        ogImage: DEFAULT_OG_IMAGE,
        breadcrumbs: [
            { name: 'Home', path: '/' },
            { name: route.h1, path: route.path },
        ],
        jsonLd: [breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: route.h1, path: route.path }])].filter(
            Boolean,
        ) as object[],
        related: [],
        changefreq: route.changefreq,
        priority: route.priority,
        indexable: true,
    };
}

export function templateSeoRoute(template: TemplateSeoEntry, gridTemplates: TemplateSeoEntry[]): SeoRoute {
    const path = `/templates/${template.id}`;
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Templates', path: '/templates' },
        { name: template.title, path },
    ];
    return {
        path,
        type: 'template',
        title: templateTitle(template),
        description: templateDescription(template),
        h1: template.title,
        intro: templateIntro(template),
        robots: INDEXABLE_ROBOTS,
        canonical: absoluteUrl(path),
        ogImage: template.imageUrl ?? DEFAULT_OG_IMAGE,
        breadcrumbs,
        jsonLd: [breadcrumbJsonLd(breadcrumbs)].filter(Boolean) as object[],
        related: gridTemplates
            .filter((other) => other.id !== template.id)
            .slice(0, 6)
            .map((other) => ({ path: `/templates/${other.id}`, title: other.title })),
        changefreq: 'monthly',
        priority: 0.7,
        indexable: true,
    };
}

export function buildDetailSeoRoute(entry: BuildWithUIHubInput, all: BuildWithUIHubInput[]): SeoRoute {
    const path = `/build-with-ui-hub/${entry.slug}`;
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Build with UI HUB', path: '/build-with-ui-hub' },
        { name: entry.title, path },
    ];
    const description =
        entry.description?.trim() ||
        `${entry.title} rebuilt as a complete UI HUB section. Preview the full page section live, then copy the code into your project.`;
    return {
        path,
        type: 'build-detail',
        title: clampTitle(`${entry.title} – Free Website Section | ${SITE_NAME}`),
        description: clampDescription(description),
        h1: entry.title,
        intro: `**${entry.title}** is available as a complete website section in UI HUB. Preview the section in the browser, review the markup and animation setup, then copy it into your own project.`,
        robots: INDEXABLE_ROBOTS,
        canonical: absoluteUrl(path),
        ogImage: DEFAULT_OG_IMAGE,
        breadcrumbs,
        jsonLd: [breadcrumbJsonLd(breadcrumbs)].filter(Boolean) as object[],
        related: all
            .filter((other) => other.slug !== entry.slug)
            .slice(0, 6)
            .map((other) => ({ path: `/build-with-ui-hub/${other.slug}`, title: other.title })),
        changefreq: 'monthly',
        priority: 0.6,
        indexable: true,
    };
}

export function buildSeoManifest(input: SeoManifestInput): SeoRoute[] {
    const routes: SeoRoute[] = [];
    const { components, templates, buildWithUIHub, buildTemplateIds } = input;

    const buildMasters = new Set(buildTemplateIds);
    const gridTemplates = templates.filter((template) => !buildMasters.has(template.id));
    const indexableComponents = components.filter((component) => component.category !== 'custom');

    routes.push(
        homeSeoRoute(components.length, gridTemplates.length, CATEGORY_SEO.length),
    );

    for (const route of STATIC_ROUTES) {
        const built = staticSeoRoute(route.path);
        if (built) routes.push(built);
    }

    for (const category of CATEGORY_SEO) {
        const items = indexableComponents.filter((component) => component.category === category.slug);
        const path = `/components/${category.slug}`;
        const breadcrumbs = [
            { name: 'Home', path: '/' },
            // No middle crumb: /library is deliberately noindex (private
            // collection/search view), so a breadcrumb pointing at it would
            // reference a non-indexable URL. There is no /components index
            // page, so the next crumb is the category itself.
            { name: category.label, path },
        ];
        const indexable = items.length >= category.minItemsForIndex;
        const collectionItems = items.map((component) => ({
            name: component.title,
            path: componentPath(component),
        }));
        routes.push({
            path,
            type: 'category',
            title: categoryTitle(category.slug, items.length),
            description: categoryDescription(category.slug, items.length),
            h1: category.label,
            intro: categoryIntro(
                category.slug,
                items.length,
                items.map((component) => component.title),
            ),
            robots: indexable ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS,
            canonical: absoluteUrl(path),
            ogImage: DEFAULT_OG_IMAGE,
            breadcrumbs,
            jsonLd: [
                breadcrumbJsonLd(breadcrumbs),
                collectionPageJsonLd(category.label, category.primaryKeyword, path, collectionItems),
            ].filter(Boolean) as object[],
            related: CATEGORY_SEO.filter((other) => other.slug !== category.slug)
                .slice(0, 6)
                .map((other) => ({ path: `/components/${other.slug}`, title: other.label })),
            changefreq: 'weekly',
            priority: indexable ? 0.8 : 0.2,
            indexable,
        });
    }

    for (const component of indexableComponents) {
        const path = componentPath(component);
        const label = categoryLabel(component.category);
        const breadcrumbs = [
            { name: 'Home', path: '/' },
            { name: label, path: `/components/${component.category}` },
            { name: component.title, path },
        ];
        const related = indexableComponents
            .filter((other) => other.category === component.category && other.id !== component.id)
            .slice(0, 6)
            .map((other) => ({ path: componentPath(other), title: other.title }));
        routes.push({
            path,
            type: 'component',
            title: componentTitle(component),
            description: componentDescription(component),
            h1: component.title,
            intro: componentIntro(component),
            robots: INDEXABLE_ROBOTS,
            canonical: absoluteUrl(path),
            ogImage: component.imageUrl ?? DEFAULT_OG_IMAGE,
            breadcrumbs,
            jsonLd: [
                breadcrumbJsonLd(breadcrumbs),
                softwareSourceCodeJsonLd({
                    name: component.title,
                    description: componentDescription(component),
                    path,
                    techs: component.techs.length > 0 ? component.techs : ['react'],
                    dateAdded: component.addedAt,
                }),
            ].filter(Boolean) as object[],
            related,
            lastmod: component.addedAt,
            changefreq: 'monthly',
            priority: 0.6,
            indexable: true,
            aeo: component.aeo,
        });
    }

    for (const template of gridTemplates) {
        routes.push(templateSeoRoute(template, gridTemplates));
    }

    for (const entry of buildWithUIHub) {
        routes.push(buildDetailSeoRoute(entry, buildWithUIHub));
    }

    return routes;
}

export const NOINDEX_PATHS: { path: string; reason: string }[] = [
    { path: '/login', reason: 'authentication' },
    { path: '/signup', reason: 'authentication' },
    { path: '/forgot-password', reason: 'authentication' },
    { path: '/library', reason: 'SPA browse/search view; component and category pages carry the indexed content' },
    { path: '/favorites', reason: 'personal collection view' },
    { path: '/dashboard', reason: 'private' },
    { path: '/dashboard/mcp', reason: 'private' },
    { path: '/dashboard/collections', reason: 'private' },
    { path: '/admin/mcp', reason: 'private' },
    { path: '/preview-capture', reason: 'internal tooling' },
];

export const NOINDEX_PREFIXES: { prefix: string; reason: string }[] = [
    { prefix: '/demo/', reason: 'showcase demo without unique content' },
    { prefix: '/admin/', reason: 'private' },
    { prefix: '/dashboard/', reason: 'private' },
];