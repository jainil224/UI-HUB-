import { COMPONENT_METADATA, CATEGORY_LIST } from '../data/components.js';
import { getPremiumOnlyMeta, getPremiumOnlyMetas } from './premiumCatalog.js';
import { searchCatalog } from './searchEngine.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
let sourceCodeMap = null;
let promptSets = null;
let metadataMap = null;
let vibePromptMap = null;
let templateStore = null;
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
function loadJson(fileName) {
    try {
        return JSON.parse(readFileSync(path.join(DATA_DIR, fileName), 'utf8'));
    }
    catch {
        return {};
    }
}
function loadSourceCode() {
    if (sourceCodeMap)
        return sourceCodeMap;
    sourceCodeMap = loadJson('sourceCode.json');
    return sourceCodeMap;
}
function loadPromptSets() {
    if (promptSets)
        return promptSets;
    const raw = loadJson('aiPrompts.json');
    promptSets = { claude: raw.claude || {}, antigravity: raw.antigravity || {}, lovable: raw.lovable || {} };
    return promptSets;
}
function loadMetadataMap() {
    if (metadataMap)
        return metadataMap;
    metadataMap = loadJson('componentMetadata.json');
    return metadataMap;
}
function loadVibePrompts() {
    if (vibePromptMap)
        return vibePromptMap;
    vibePromptMap = loadJson('componentVibePrompts.json');
    return vibePromptMap;
}
function loadTemplates() {
    if (templateStore)
        return templateStore;
    templateStore = {
        catalog: loadJson('templates.json'),
        sources: loadJson('templateSourceCode.json'),
    };
    return templateStore;
}
export class ComponentService {
    static instance;
    static getInstance() {
        if (!ComponentService.instance) {
            ComponentService.instance = new ComponentService();
        }
        return ComponentService.instance;
    }
    metaToSummary(c) {
        return {
            id: c.id,
            name: c.title,
            description: c.description,
            category: c.category,
            framework: c.framework,
            styling: c.styling,
            tags: c.tags,
            previewUrl: `https://www.uihub.codes/demo/${c.id}`,
            isPremium: c.isPremium,
        };
    }
    getAllComponents() {
        return COMPONENT_METADATA.map((c) => this.metaToSummary(c));
    }
    /**
     * The COMPLETE catalog: public catalog entries PLUS canonical premium-only
     * components (from premiumComponents.json, e.g. black-hole, rubiks-cube,
     * toonhub-hero) that live only in sourceCode.json. Kept separate from
     * getAllComponents() so premium-only ids remain invisible to free keys via
     * the tier filter. Obsolete/renamed source entries that are NOT canonical
     * premium ids are deliberately excluded.
     */
    getFullCatalog() {
        const catalog = this.getAllComponents();
        const catalogIds = new Set(catalog.map((c) => c.id));
        const premiumOnly = getPremiumOnlyMetas()
            .filter((m) => !catalogIds.has(m.id))
            .map((m) => this.metaToSummary(m));
        return [...catalog, ...premiumOnly];
    }
    searchComponents(params) {
        return this.searchComponentHits(params).map((h) => h.item);
    }
    /**
     * Ranked search over the full catalog (including premium-only components)
     * using the deterministic search engine. Returns score/matchedOn so callers
     * can label tier access without hiding relevant premium matches.
     */
    searchComponentHits(params) {
        let pool = this.getFullCatalog();
        if (params.category) {
            const category = params.category.toLowerCase();
            pool = pool.filter((c) => c.category === category);
        }
        if (params.framework) {
            const framework = params.framework.toLowerCase();
            pool = pool.filter((c) => c.framework === framework);
        }
        if (params.styling) {
            const styling = params.styling.toLowerCase();
            pool = pool.filter((c) => c.styling === styling);
        }
        if (params.tags && params.tags.length > 0) {
            pool = pool.filter((c) => params.tags.every((tag) => c.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))));
        }
        if (params.isPremium !== undefined) {
            pool = pool.filter((c) => c.isPremium === params.isPremium);
        }
        if (!params.query || !params.query.trim()) {
            return pool.slice(0, 50).map((item) => ({ item, score: 0, matchedTokens: 0 }));
        }
        const docs = pool.map((item) => ({
            item,
            behaviorText: this.behaviorTextFor(item.id),
        }));
        return searchCatalog(params.query, docs, { limit: 50 });
    }
    /** Combined behavior/vibe text for a component (metadata + vibe prompts). */
    behaviorTextCache = new Map();
    behaviorTextFor(id) {
        const cached = this.behaviorTextCache.get(id);
        if (cached !== undefined)
            return cached;
        const full = loadMetadataMap()[id];
        const vibe = loadVibePrompts()[id] || '';
        const parts = [
            full?.vibeMeta?.behavior,
            full?.vibeMeta?.description,
            ...(full?.vibeMeta?.requirements || []),
            vibe,
        ]
            .filter((p) => typeof p === 'string' && p.length > 0)
            .join(' ');
        this.behaviorTextCache.set(id, parts);
        return parts;
    }
    async getComponent(componentId, includeCode = false) {
        const comp = this.getComponentMeta(componentId);
        if (!comp)
            return null;
        const code = this.getCode(componentId);
        if (!code)
            return null;
        return {
            ...this.metaToSummary(comp),
            code: includeCode ? code : undefined,
            dependencies: comp.dependencies,
            installation: `npm install ${comp.dependencies.join(' ')}`,
            usageExample: `<${this.componentNameToComponent(componentId)} />`,
        };
    }
    async getComponentCode(componentId) {
        const code = this.getCode(componentId);
        return code || null;
    }
    async getDependencies(componentId) {
        const comp = this.getComponentMeta(componentId);
        if (!comp)
            return null;
        return comp.dependencies;
    }
    getComponentMeta(componentId) {
        const direct = COMPONENT_METADATA.find((c) => c.id === componentId);
        if (direct)
            return direct;
        return getPremiumOnlyMeta(componentId) ?? undefined;
    }
    /** Full AI prompts (claude/antigravity/lovable) for a component, if any exist. */
    getAiPrompts(componentId) {
        const prompts = loadPromptSets();
        const out = {};
        for (const key of ['claude', 'antigravity', 'lovable']) {
            const source = prompts[key] || {};
            if (source[componentId])
                out[key] = source[componentId];
        }
        return Object.keys(out).length > 0 ? out : null;
    }
    /** Rich metadata (props + vibe) for a component, falling back to the vibe prompt. */
    getComponentMetadata(componentId) {
        const meta = this.getComponentMeta(componentId);
        if (!meta)
            return null;
        const full = loadMetadataMap()[componentId];
        const vibePrompt = loadVibePrompts()[componentId];
        return {
            id: meta.id,
            name: meta.title,
            props: full?.props || [],
            vibe: full?.vibeMeta || {
                behavior: vibePrompt || '',
                states: { from: '', to: '' },
                cssProperties: [],
                description: vibePrompt || meta.description,
            },
            hasDetailedMetadata: !!full,
            vibePrompt: vibePrompt || undefined,
        };
    }
    /** Real website-template catalog (16 templates from templatesData.ts). */
    getTemplateCatalog() {
        return loadTemplates().catalog;
    }
    /** Real website-template source code for a template id (or null). */
    getTemplateSource(templateId) {
        const { catalog, sources } = loadTemplates();
        const template = catalog.find((t) => t.id === templateId);
        if (!template)
            return null;
        return { template, source: sources[templateId] || null };
    }
    /** Search components by behavior/vibe keywords (delegates to the ranked engine). */
    searchByBehavior(query) {
        return this.searchComponentHits({ query }).map((h) => h.item);
    }
    listCategories(excludePremium = false) {
        const pool = excludePremium ? this.getAllComponents().filter((c) => !c.isPremium) : this.getAllComponents();
        return CATEGORY_LIST.map((cat) => ({
            slug: cat.slug,
            label: cat.label,
            count: pool.filter((c) => c.category === cat.slug).length,
        })).filter((c) => c.count > 0);
    }
    searchTemplates(params) {
        let results = COMPONENT_METADATA.filter((c) => ['3d', 'background', 'text', 'scroll', 'effect'].includes(c.category)).map((c) => ({
            id: `template-${c.id}`,
            name: c.title + ' Template',
            description: c.description,
            category: c.category,
            framework: 'react',
            isPremium: c.isPremium,
            tags: c.tags,
        }));
        if (params.query) {
            const q = params.query.toLowerCase();
            results = results.filter((t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q));
        }
        if (params.category) {
            results = results.filter((t) => t.category === params.category);
        }
        if (params.isPremium !== undefined) {
            results = results.filter((t) => t.isPremium === params.isPremium);
        }
        return results.slice(0, 20);
    }
    async getTemplate(templateId) {
        const componentId = templateId.replace(/^template-/, '');
        const comp = this.getComponentMeta(componentId);
        if (!comp)
            return null;
        const code = this.getCode(componentId);
        return {
            id: templateId,
            name: comp.title + ' Template',
            description: comp.description,
            category: comp.category,
            framework: comp.framework,
            isPremium: comp.isPremium,
            tags: comp.tags,
            code: code || undefined,
            dependencies: comp.dependencies,
            structure: ['Component Preview', 'Interactive Demo', 'Full Source'],
        };
    }
    searchAnimations(params) {
        let results = COMPONENT_METADATA.filter((c) => ['effect', 'text', 'scroll', 'image-interaction'].includes(c.category)).map((c) => ({
            id: `anim-${c.id}`,
            name: c.title + ' Animation',
            description: c.description,
            category: c.category,
            framework: c.framework,
            isPremium: c.isPremium,
            tags: c.tags,
        }));
        if (params.query) {
            const q = params.query.toLowerCase();
            results = results.filter((a) => a.name.toLowerCase().includes(q) ||
                (a.description || '').toLowerCase().includes(q) ||
                a.tags.some((t) => t.toLowerCase().includes(q)));
        }
        if (params.category) {
            results = results.filter((a) => a.category === params.category);
        }
        if (params.isPremium !== undefined) {
            results = results.filter((a) => a.isPremium === params.isPremium);
        }
        return results.slice(0, 20);
    }
    async getAnimationCode(animationId) {
        const componentId = animationId.replace(/^anim-/, '');
        const comp = this.getComponentMeta(componentId);
        if (!comp)
            return null;
        const code = this.getCode(componentId);
        return {
            id: animationId,
            name: comp.title + ' Animation',
            description: comp.description,
            category: comp.category,
            framework: comp.framework,
            isPremium: comp.isPremium,
            tags: comp.tags,
            code: code || undefined,
            dependencies: comp.dependencies,
            usageExample: `<${this.componentNameToComponent(componentId)} />`,
        };
    }
    getCode(componentId) {
        const map = loadSourceCode();
        return map[componentId] || null;
    }
    componentNameToComponent(id) {
        return id
            .split('-')
            .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
            .join('');
    }
}
export const componentService = ComponentService.getInstance();
//# sourceMappingURL=componentService.js.map