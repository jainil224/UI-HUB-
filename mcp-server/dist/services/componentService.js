import { COMPONENT_METADATA, CATEGORY_LIST } from '../data/components.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
let sourceCodeMap = null;
function loadSourceCode() {
    if (sourceCodeMap)
        return sourceCodeMap;
    let map = {};
    try {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const jsonPath = path.join(__dirname, '..', 'data', 'sourceCode.json');
        map = JSON.parse(readFileSync(jsonPath, 'utf8'));
    }
    catch {
        map = {};
    }
    sourceCodeMap = map;
    return map;
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
            previewUrl: `https://ui-hub-design.vercel.app/demo/${c.id}`,
            isPremium: c.isPremium,
        };
    }
    getAllComponents() {
        return COMPONENT_METADATA.map((c) => this.metaToSummary(c));
    }
    searchComponents(params) {
        let results = this.getAllComponents();
        if (params.query) {
            const q = params.query.toLowerCase().trim();
            results = results.filter((c) => c.name.toLowerCase().includes(q) ||
                c.id.toLowerCase().includes(q) ||
                c.tags.some((t) => t.toLowerCase().includes(q)) ||
                (c.description || '').toLowerCase().includes(q));
        }
        if (params.category) {
            const category = params.category.toLowerCase();
            results = results.filter((c) => c.category === category);
        }
        if (params.framework) {
            const framework = params.framework.toLowerCase();
            results = results.filter((c) => c.framework === framework);
        }
        if (params.styling) {
            const styling = params.styling.toLowerCase();
            results = results.filter((c) => c.styling === styling);
        }
        if (params.tags && params.tags.length > 0) {
            results = results.filter((c) => params.tags.every((tag) => c.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase()))));
        }
        if (params.isPremium !== undefined) {
            results = results.filter((c) => c.isPremium === params.isPremium);
        }
        return results.slice(0, 20);
    }
    async getComponent(componentId, includeCode = false) {
        const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
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
        const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
        if (!comp)
            return null;
        return comp.dependencies;
    }
    getComponentMeta(componentId) {
        return COMPONENT_METADATA.find((c) => c.id === componentId);
    }
    listCategories() {
        return CATEGORY_LIST.map((cat) => ({
            slug: cat.slug,
            label: cat.label,
            count: COMPONENT_METADATA.filter((c) => c.category === cat.slug).length,
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
        const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
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
        const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
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