import { readFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import { findArrayStart, scanArrayEntries, scanObjectProps, collectStrings } from './js-lex.mjs';

const FRONTEND_ROOT = join(import.meta.dirname, '..', '..');
const SRC = join(FRONTEND_ROOT, 'src', 'data');

function readDataFile(name) {
    return readFileSync(join(SRC, name), 'utf8');
}

function stringProp(props, key) {
    const prop = props.get(key);
    return prop && prop.kind === 'string' ? prop.value : undefined;
}

function booleanProp(props, key) {
    const prop = props.get(key);
    return prop && prop.kind === 'boolean' ? prop.value : undefined;
}

export function extractComponents() {
    const source = readDataFile('componentData.tsx');
    const arrayStart = findArrayStart(source, 'export const componentList');
    const entries = scanArrayEntries(source, arrayStart);

    const components = [];
    for (const entry of entries) {
        const props = scanObjectProps(entry.text);
        const id = stringProp(props, 'id');
        const title = stringProp(props, 'title');
        const category = stringProp(props, 'category');
        if (!id || !title || !category) continue;
        components.push({
            id,
            title,
            category,
            description: stringProp(props, 'description'),
            imageUrl: stringProp(props, 'imageUrl'),
            isPremium: booleanProp(props, 'isPremium') ?? false,
            addedAt: stringProp(props, 'addedAt'),
        });
    }

    if (components.length < 50) {
        throw new Error(`Component extraction looks wrong: only ${components.length} entries parsed from componentList`);
    }

    const duplicates = components.filter((item, index) => components.findIndex((other) => other.id === item.id) !== index);
    if (duplicates.length > 0) {
        throw new Error(`Duplicate component ids in componentList: ${duplicates.map((item) => item.id).join(', ')}`);
    }

    return components;
}

export function extractTemplates() {
    const source = readDataFile('templatesData.ts');
    const arrayStart = findArrayStart(source, 'export const websiteTemplates');
    const entries = scanArrayEntries(source, arrayStart);

    const templates = [];

    for (const entry of entries) {
        const props = scanObjectProps(entry.text);
        const id = stringProp(props, 'id');
        const title = stringProp(props, 'title');
        if (!id || !title) continue;

        templates.push({
            id,
            title,
            description: stringProp(props, 'description') ?? '',
            category: stringProp(props, 'category') ?? 'Other',
            framework: stringProp(props, 'framework') ?? 'React',
            styling: stringProp(props, 'styling') ?? 'Tailwind CSS',
            animation: stringProp(props, 'animation') ?? 'CSS transitions',
            isPro: booleanProp(props, 'isPro') ?? false,
            imageUrl: stringProp(props, 'previewImage') ?? stringProp(props, 'thumbnailUrl'),
            features: collectStrings(entry.text, props.get('features')).filter(
                (item) => item.trim().length > 0,
            ),
        });
    }

    if (templates.length < 5) {
        throw new Error(`Template extraction looks wrong: only ${templates.length} entries parsed from websiteTemplates`);
    }

    const ids = templates.map((template) => template.id);
    if (new Set(ids).size !== ids.length) {
        throw new Error('Duplicate template ids in websiteTemplates');
    }

    const missingFeatures = templates.filter((template) => template.features.length === 0);
    if (missingFeatures.length > 0) {
        console.warn(
            `[seo] templates without a features list: ${missingFeatures.map((template) => template.id).join(', ')}`,
        );
    }

    return templates;
}

export function extractBuildWithUIHub(templates) {
    const source = readDataFile('buildWithUIHubSlugs.ts');
    const arrayStart = findArrayStart(source, 'export const BUILD_WITH_UI_HUB_SECTIONS');
    const entries = scanArrayEntries(source, arrayStart);
    const templateById = new Map(templates.map((template) => [template.id, template]));

    const sections = [];
    for (const entry of entries) {
        const props = scanObjectProps(entry.text);
        const slug = stringProp(props, 'slug');
        const templateId = stringProp(props, 'templateId');
        if (!slug) continue;

        const template = templateId ? templateById.get(templateId) : undefined;
        sections.push({
            slug,
            templateId,
            title: template?.title ?? slug,
            description: template?.description,
            imageUrl: template?.imageUrl,
            components: collectStrings(entry.text, props.get('componentIds')),
        });
    }

    if (sections.length === 0) {
        throw new Error('No Build with UI HUB sections found');
    }

    return sections;
}

export async function extractComponentConfig() {
    const entryPath = join(SRC, 'componentMetadata.ts');
    const source = readFileSync(entryPath, 'utf8');

    const imports = source.match(/^\s*import\s[^\n]*from\s+['"][^'"]+['"];?/gm);
    if (imports && imports.length > 0) {
        throw new Error(
            `componentMetadata.ts now imports other modules (${imports.length} found); the SEO bundler entry needs updating`,
        );
    }

    const bundlePath = join(import.meta.dirname, '.component-metadata.bundle.mjs');
    await build({
        entryPoints: [entryPath],
        bundle: true,
        format: 'esm',
        platform: 'node',
        target: 'node20',
        outfile: bundlePath,
        logLevel: 'silent',
    });

    try {
        const module = await import(`${pathToFileURL(bundlePath).href}?t=${Date.now()}`);
        const config = module.COMPONENT_CONFIG;
        const slugs = Object.keys(config ?? {});
        if (slugs.length < 20) {
            throw new Error(`COMPONENT_CONFIG extraction looks wrong: only ${slugs.length} slugs found`);
        }
        return { config, slugs };
    } finally {
        rmSync(bundlePath, { force: true });
    }
}

export function extractBuildWithUIHubTemplateIds(sections) {
    return sections.map((section) => section.templateId).filter(Boolean);
}