import { describe, expect, it } from 'vitest';
import { isSeoNoIndexPath } from '../components/Seo';
import { webPageJsonLd, webSiteJsonLd, softwareSourceCodeJsonLd, imageObjectJsonLd } from './jsonld';
import { COMPONENT_CONFIG } from '../data/componentMetadata';
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
            const coveredByExact = ROBOTS_BLOCKED_PATHS.some((rule) => rule.path === path);
            const coveredByPrefix = ROBOTS_BLOCKED_PREFIXES.some((rule) => path.startsWith(rule.prefix));
            expect(coveredByExact || coveredByPrefix).toBe(true);
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

describe('Phase 2 on-page SEO and structured data enhancements', () => {
    it('generates valid WebPage JSON-LD schema with correct @id and isPartOf', () => {
        const schema: any = webPageJsonLd({
            path: '/pricing',
            name: 'UI Hub Pricing',
            description: 'Simple and transparent pricing plans.',
        });
        expect(schema['@context']).toBe('https://schema.org');
        expect(schema['@type']).toBe('WebPage');
        expect(schema['@id']).toBe('https://www.uihub.codes/pricing#webpage');
        expect(schema.url).toBe('https://www.uihub.codes/pricing');
        expect(schema.name).toBe('UI Hub Pricing');
        expect(schema.description).toBe('Simple and transparent pricing plans.');
        expect(schema.isPartOf).toEqual({
            '@id': 'https://www.uihub.codes/#website',
        });
    });

    it('generates SearchAction inside WebSite JSON-LD', () => {
        const schema: any = webSiteJsonLd();
        expect(schema['@type']).toBe('WebSite');
        expect(schema.potentialAction).toBeDefined();
        expect(schema.potentialAction['@type']).toBe('SearchAction');
        expect(schema.potentialAction.target.urlTemplate).toContain('/library?q=');
        expect(schema.potentialAction['query-input']).toBe('required name=search_term_string');
    });

    it('includes @id and codeSampleType in SoftwareSourceCode JSON-LD', () => {
        const schema: any = softwareSourceCodeJsonLd({
            name: 'Test Button',
            description: 'A test button component.',
            path: '/components/button/test-button',
            techs: ['React', 'Tailwind CSS'],
        });
        expect(schema['@type']).toBe('SoftwareSourceCode');
        expect(schema['@id']).toBe('https://www.uihub.codes/components/button/test-button#software');
        expect(schema.codeSampleType).toBe('code snippet');
        expect(schema.isPartOf).toBeDefined();
    });

    it('adds WebPage schema to all static routes', () => {
        for (const path of ['/templates', '/build-with-ui-hub', '/pricing', '/privacy', '/terms', '/payment-policy']) {
            const route = staticSeoRoute(path);
            expect(route).toBeDefined();
            const webPageSchema: any = route?.jsonLd.find((s: any) => s['@type'] === 'WebPage');
            expect(webPageSchema, `Static route ${path} must have WebPage schema`).toBeDefined();
            expect(webPageSchema['@id']).toBe(`${SITE_URL}${path}#webpage`);
        }
    });

    it('adds WebPage schema to template and build detail routes', () => {
        const tRoute = templateSeoRoute(sampleTemplate, [sampleTemplate]);
        expect(tRoute.jsonLd.some((s: any) => s['@type'] === 'WebPage')).toBe(true);

        const bRoute = buildDetailSeoRoute(sampleBuild, [sampleBuild]);
        expect(bRoute.jsonLd.some((s: any) => s['@type'] === 'WebPage')).toBe(true);
    });

    it('adds ImageObject schema when component has imageUrl', () => {
        const manifestWithImage = buildSeoManifest({
            components: [
                {
                    id: 'sample-comp',
                    title: 'Sample Component',
                    category: 'button',
                    description: 'A sample button component for testing.',
                    imageUrl: 'https://images.unsplash.com/photo-sample',
                    techs: ['react', 'tailwind'],
                    propNames: [],
                    propCount: 0,
                },
            ],
            templates: [],
            buildWithUIHub: [],
            buildTemplateIds: [],
        });
        const compRoute = manifestWithImage.find((r) => r.path === '/components/button/sample-comp');
        expect(compRoute).toBeDefined();
        const imageSchema: any = compRoute?.jsonLd.find((s: any) => s['@type'] === 'ImageObject');
        expect(imageSchema).toBeDefined();
        expect(imageSchema.contentUrl).toBe('https://images.unsplash.com/photo-sample');
    });
});

describe('Phase 3 Content SEO and Component Enrichment', () => {
    it('verifies previously generic components now possess rich COMPONENT_CONFIG metadata', () => {
        const enrichedSample = [
            'mesh-text-hover',
            'pixel-drift',
            'isometric-portal',
            'gear-system',
            'point-dna-helix',
            'tornado',
            'ascii-cursor',
            'aura-cursor',
            'hacker-background',
            '3d-hero',
            'cinematic-navbar',
            'haul-footer',
            'community-newsletter',
        ];
        for (const id of enrichedSample) {
            const config = COMPONENT_CONFIG[id];
            expect(config, `Component ${id} must have a config in COMPONENT_CONFIG`).toBeDefined();
            expect(config.vibeMeta.description?.length).toBeGreaterThan(20);
            expect(config.vibeMeta.behavior?.length).toBeGreaterThan(30);
            expect(config.vibeMeta.libraries?.length).toBeGreaterThan(0);
        }
    });

    it('ensures component descriptions do not contain generic uninformative placeholders', () => {
        for (const [id, config] of Object.entries(COMPONENT_CONFIG)) {
            const desc = config.vibeMeta?.description || '';
            expect(desc).not.toContain('copy-and-paste');
            expect(desc).not.toContain('preview it live');
        }
    });

    describe('Phase 3.1 Metadata Hardening & Coverage Metrics', () => {
        it('verifies truthful animation library dependencies for hardened components', () => {
            const awwwards = COMPONENT_CONFIG['awwwards-nav'];
            expect(awwwards).toBeDefined();
            expect(awwwards.vibeMeta.libraries).toContain('gsap');
            expect(awwwards.vibeMeta.libraries).not.toContain('framer-motion');

            const textCarousel = COMPONENT_CONFIG['text-carousel'];
            expect(textCarousel).toBeDefined();
            expect(textCarousel.vibeMeta.libraries).toContain('gsap');
            expect(textCarousel.vibeMeta.libraries).not.toContain('framer-motion');

            const reelmark = COMPONENT_CONFIG['reelmark-carousel'];
            expect(reelmark).toBeDefined();
            expect(reelmark.vibeMeta.libraries).toContain('react');
            expect(reelmark.vibeMeta.libraries).not.toContain('framer-motion');
            expect(reelmark.vibeMeta.libraries).not.toContain('gsap');
        });

        it('ensures explicitly empty props array is recognized as authored metadata and not missing', () => {
            const wave = COMPONENT_CONFIG['wave-background'];
            expect(wave).toBeDefined();
            expect(Array.isArray(wave.props)).toBe(true);
            expect(wave.props.length).toBe(0);
            expect(wave.vibeMeta.description).toBeDefined();
            expect(wave.vibeMeta.description.length).toBeGreaterThan(15);
        });
    });
});
