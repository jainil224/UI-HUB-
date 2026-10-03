import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { rmSync } from 'node:fs';
import { build } from 'esbuild';
import {
    extractBuildWithUIHub,
    extractBuildWithUIHubTemplateIds,
    extractComponentConfig,
    extractComponents,
    extractTemplates,
} from './extract-content.mjs';

const FRONTEND_ROOT = join(import.meta.dirname, '..', '..');
const ENTRY = join(import.meta.dirname, 'seo-bundle.entry.ts');
const BUNDLE = join(import.meta.dirname, '.seo.bundle.mjs');

async function loadSeoBundle() {
    await build({
        entryPoints: [ENTRY],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node20',
        outfile: BUNDLE,
        logLevel: 'silent',
    });
    try {
        return await import(`${pathToFileURL(BUNDLE).href}?t=${Date.now()}`);
    } finally {
        rmSync(BUNDLE, { force: true });
    }
}

/**
 * Single source of truth for the SEO manifest. Both the postbuild generator and
 * the validator call this so they can never disagree about routes or metadata.
 */
export async function loadSeoManifest() {
    const seo = await loadSeoBundle();

    const rawComponents = extractComponents();
    const templates = extractTemplates();
    const buildWithUIHub = extractBuildWithUIHub(templates);
    const buildTemplateIds = extractBuildWithUIHubTemplateIds(buildWithUIHub);
    const { config: componentConfig } = await extractComponentConfig();

    // Uses the same helper the React routes use, so the prerendered HTML and the
    // client-rendered page can never drift apart.
    const components = rawComponents.map((component) => {
        const config = componentConfig[component.id];
        return {
            ...component,
            ...seo.toComponentSeoInput(component, config),
            propCount: Array.isArray(config?.props) ? config.props.length : 0,
            aeo: seo.componentAeo(seo.toComponentAeoInput(component, config)),
        };
    });

    const orphanMetadata = Object.keys(componentConfig).filter(
        (slug) => !components.some((component) => component.id === slug),
    );

    const categorySlugs = seo.CATEGORY_SEO.map((category) => category.slug);

    const routes = seo.buildSeoManifest({
        components,
        templates,
        buildWithUIHub: buildWithUIHub.map((section) => ({
            slug: section.slug,
            title: section.title,
            description: section.description,
        })),
        buildTemplateIds,
    });

    return {
        seo,
        routes,
        componentConfig,
        stats: {
            components: components.length,
            templates: templates.length,
            buildSections: buildWithUIHub.length,
            orphanMetadata,
            componentsWithMetadata: components.filter((component) => component.propCount > 0).length,
            aeoLowConfidence: components
                .filter((component) => component.aeo?.confidence === 'low')
                .map((component) => component.id),
            componentById: new Map(components.map((component) => [component.id, component])),
            categoryCounts: new Map(
                categorySlugs.map((slug) => [
                    slug,
                    components.filter((component) => component.category === slug).length,
                ]),
            ),
        },
    };
}

export { FRONTEND_ROOT };