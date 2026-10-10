import { describe, expect, it } from 'vitest';
import { isSeoNoIndexPath } from '../components/Seo';
import {
    INDEXABLE_ROBOTS,
    NOINDEX_PATHS,
    NOINDEX_PREFIXES,
    ROBOTS_BLOCKED_PATHS,
    ROBOTS_BLOCKED_PREFIXES,
    buildDetailSeoRoute,
    buildSeoManifest,
    homeSeoRoute,
    staticSeoRoute,
    templateSeoRoute,
    type BuildWithUIHubInput,
    type SeoManifestInput,
    type TemplateSeoEntry,
} from './routes';

const SITE_URL = 'https://www.uihub.codes';

const sampleTemplate: TemplateSeoEntry = {
    id: 'sample',
    title: 'Sample Template',
    description: 'A sample template used only for SEO unit tests.',
    category: 'Portfolio',
    framework: 'React',
    styling: 'Tailwind CSS',
    animation: 'Framer Motion',
    isPro: false,
    features: ['Hero section', 'Footer'],
};

const sampleBuild: BuildWithUIHubInput = {
    slug: 'sample-hero',
    title: 'Sample Hero',
    description: 'A sample build section used only for SEO unit tests.',
};

const emptyManifestInput: SeoManifestInput = {
    components: [],
    templates: [],
    buildWithUIHub: [],
    buildTemplateIds: [],
};

describe('noindex handling for client-side navigation', () => {
    it.each(NOINDEX_PATHS.map((rule) => rule.path))('marks %s as noindex', (path) => {
        expect(isSeoNoIndexPath(path)).toBe(true);
    });

    it.each(NOINDEX_PREFIXES.map((rule) => rule.prefix))('marks %s* paths as noindex', (prefix) => {
        expect(isSeoNoIndexPath(`${prefix}anything`)).toBe(true);
    });

    // The regression this guards: navigating from a private page to a public
    // page must not leak a noindex robots tag (the private page's guard never
    // runs for these paths, so the public page owns its own indexable head).
    it.each([
        '/',
        '/templates',
        '/templates/sample',
        '/build-with-ui-hub',
        '/build-with-ui-hub/sample-hero',
        '/pricing',
        '/privacy',
        '/terms',
        '/payment-policy',
        '/components/buttons',
        '/components/buttons/button-1',
    ])('keeps indexable route %s public', (path) => {
        expect(isSeoNoIndexPath(path)).toBe(false);
    });

    it('normalizes trailing slashes for private paths', () => {
        expect(isSeoNoIndexPath('/library/')).toBe(true);
        expect(isSeoNoIndexPath('/')).toBe(false);
    });
});

describe('robots.txt blocking stays limited to private routes', () => {
    // Public noindex routes must remain crawlable so Google can read the
    // noindex directive. Adding any of them to ROBOTS_BLOCKED would hide that
    // directive behind a robots.txt Disallow.
    it.each(['/login', '/signup', '/forgot-password', '/library', '/favorites', '/preview-capture'])(
        'keeps public noindex route %s crawlable',
        (path) => {
            expect(ROBOTS_BLOCKED_PATHS.some((rule) => rule.path === path)).toBe(false);
            expect(ROBOTS_BLOCKED_PREFIXES.some((rule) => rule.prefix === path)).toBe(false);
        },
    );

    it('keeps the /demo/ showcase prefix crawlable', () => {
        expect(ROBOTS_BLOCKED_PREFIXES.some((rule) => rule.prefix === '/demo/')).toBe(false);
    });

    // Private routes keep their robots.txt Disallow. That is not the security
    // boundary - the auth guard is - but blocking auth-only pages from crawl is
    // intentional, so each one must be listed in ROBOTS_BLOCKED_PATHS.
    it.each(['/dashboard', '/dashboard/mcp', '/dashboard/collections', '/admin/mcp'])(
        'keeps private route %s robots-blocked',
        (path) => {
            expect(ROBOTS_BLOCKED_PATHS.some((rule) => rule.path === path)).toBe(true);
        },
    );

    it('keeps private prefixes robots-blocked', () => {
        expect(ROBOTS_BLOCKED_PREFIXES.some((rule) => rule.prefix === '/admin/')).toBe(true);
        expect(ROBOTS_BLOCKED_PREFIXES.some((rule) => rule.prefix === '/dashboard/')).toBe(true);
    });

    it('every robots-blocked route is also noindex at runtime', () => {
        for (const rule of ROBOTS_BLOCKED_PATHS) {
            expect(isSeoNoIndexPath(rule.path)).toBe(true);
        }
        for (const rule of ROBOTS_BLOCKED_PREFIXES) {
            expect(isSeoNoIndexPath(`${rule.prefix}example`)).toBe(true);
        }
    });
});

describe('route builders shared by SSG and runtime', () => {
    it('builds the home route with one canonical, indexable robots and org + site JSON-LD', () => {
        const route = homeSeoRoute(10, 4, 3);
        expect(route.canonical).toBe(`${SITE_URL}/`);
        expect(route.robots).toBe(INDEXABLE_ROBOTS);
        expect(route.indexable).toBe(true);
        expect(route.h1).toBe('Craft the Future, of UI');
        expect(route.title.length).toBeGreaterThan(0);
        expect(route.description.length).toBeGreaterThan(0);
        expect(route.jsonLd.length).toBeGreaterThanOrEqual(2);
    });

    it('builds every public static route with an absolute canonical and indexable robots', () => {
        for (const path of ['/templates', '/build-with-ui-hub', '/pricing', '/privacy', '/terms', '/payment-policy']) {
            const route = staticSeoRoute(path);
            expect(route).toBeDefined();
            if (!route) continue;
            expect(route.canonical).toBe(`${SITE_URL}${path}`);
            expect(route.robots).toBe(INDEXABLE_ROBOTS);
            expect(route.indexable).toBe(true);
            expect(route.title.length).toBeGreaterThan(0);
            expect(route.description.length).toBeGreaterThan(0);
        }
    });

    it('returns undefined for unknown static paths', () => {
        expect(staticSeoRoute('/not-a-route')).toBeUndefined();
    });

    it('builds template detail routes with absolute canonical, self breadcrumbs and related links', () => {
        const grid = [sampleTemplate, { ...sampleTemplate, id: 'other', title: 'Other Template' }];
        const route = templateSeoRoute(sampleTemplate, grid);
        expect(route.canonical).toBe(`${SITE_URL}/templates/sample`);
        expect(route.robots).toBe(INDEXABLE_ROBOTS);
        expect(route.indexable).toBe(true);
        expect(route.title).toContain('Sample Template');
        expect(route.breadcrumbs.map((crumb) => crumb.path)).toEqual([
            '/',
            '/templates',
            '/templates/sample',
        ]);
        expect(route.related.map((item) => item.path)).toEqual(['/templates/other']);
    });

    it('builds build-detail routes with absolute canonical and a live index breadcrumb', () => {
        const route = buildDetailSeoRoute(sampleBuild, [sampleBuild, { ...sampleBuild, slug: 'other-hero' }]);
        expect(route.canonical).toBe(`${SITE_URL}/build-with-ui-hub/sample-hero`);
        expect(route.robots).toBe(INDEXABLE_ROBOTS);
        expect(route.indexable).toBe(true);
        expect(route.breadcrumbs.map((crumb) => crumb.path)).toEqual([
            '/',
            '/build-with-ui-hub',
            '/build-with-ui-hub/sample-hero',
        ]);
        expect(route.related.map((item) => item.path)).toEqual(['/build-with-ui-hub/other-hero']);
    });
});

describe('breadcrumbs stay on indexable routes', () => {
    it('keeps every breadcrumb off NOINDEX paths (/library, /favorites, auth, …)', () => {
        const manifest = buildSeoManifest(emptyManifestInput);
        const withCrumbs = manifest.filter((route) => route.breadcrumbs.length > 0);
        expect(withCrumbs.length).toBeGreaterThan(0);
        for (const route of withCrumbs) {
            for (const crumb of route.breadcrumbs) {
                expect(isSeoNoIndexPath(crumb.path), `${route.path} breadcrumb -> ${crumb.path}`).toBe(false);
            }
        }
    });

    it('builds category breadcrumbs as Home > Category with no /library middle crumb', () => {
        const manifest = buildSeoManifest(emptyManifestInput);
        const categories = manifest.filter((route) => route.type === 'category');
        expect(categories.length).toBeGreaterThan(0);
        for (const route of categories) {
            expect(route.breadcrumbs.map((crumb) => crumb.path)).toEqual(['/', route.path]);
            expect(route.breadcrumbs.some((crumb) => crumb.path === '/library')).toBe(false);
        }
    });
});