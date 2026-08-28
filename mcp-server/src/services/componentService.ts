import { COMPONENT_METADATA, CATEGORY_LIST, ComponentMeta } from '../data/components.js';
import type { AnimationDetail, AnimationSummary, ComponentDetail, ComponentSummary, TemplateDetail, TemplateSummary } from '../types/index.js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

/**
 * Component data service.
 *
 * The source of truth for catalog metadata lives in src/data/components.ts
 * (mirrors frontend componentData.tsx). The embedded source code is mirrored
 * into src/data/sourceCode.json from backend/src/data/sourceCodeData.js —
 * kept in sync so the MCP server (deployed separately) and website share the
 * same source.
 */

type SourceCodeMap = Record<string, string>;
let sourceCodeMap: SourceCodeMap | null = null;

function loadSourceCode(): SourceCodeMap {
  if (sourceCodeMap) return sourceCodeMap;
  let map: SourceCodeMap = {};
  try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const jsonPath = path.join(__dirname, '..', 'data', 'sourceCode.json');
    map = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch {
    map = {};
  }
  sourceCodeMap = map;
  return map;
}

export class ComponentService {
  private static instance: ComponentService;

  static getInstance(): ComponentService {
    if (!ComponentService.instance) {
      ComponentService.instance = new ComponentService();
    }
    return ComponentService.instance;
  }

  private metaToSummary(c: ComponentMeta): ComponentSummary {
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

  getAllComponents(): ComponentSummary[] {
    return COMPONENT_METADATA.map((c) => this.metaToSummary(c));
  }

  searchComponents(params: {
    query?: string;
    category?: string;
    framework?: string;
    styling?: string;
    tags?: string[];
    isPremium?: boolean;
  }): ComponentSummary[] {
    let results = this.getAllComponents();

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      results = results.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          (c.description || '').toLowerCase().includes(q)
      );
    }

    if (params.category) {
      const category = params.category.toLowerCase();
      results = results.filter((c) => c.category === category);
    }

    if (params.framework) {
      const framework = params.framework.toLowerCase();
      results = results.filter((c) => c.framework === framework as ComponentSummary['framework']);
    }

    if (params.styling) {
      const styling = params.styling.toLowerCase();
      results = results.filter((c) => c.styling === styling as ComponentSummary['styling']);
    }

    if (params.tags && params.tags.length > 0) {
      results = results.filter((c) =>
        params.tags!.every((tag) => c.tags.some((t) => t.toLowerCase().includes(tag.toLowerCase())))
      );
    }

    if (params.isPremium !== undefined) {
      results = results.filter((c) => c.isPremium === params.isPremium);
    }

    return results.slice(0, 20);
  }

  async getComponent(componentId: string, includeCode = false): Promise<ComponentDetail | null> {
    const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
    if (!comp) return null;

    const code = this.getCode(componentId);
    if (!code) return null;

    return {
      ...this.metaToSummary(comp),
      code: includeCode ? code : undefined,
      dependencies: comp.dependencies,
      installation: `npm install ${comp.dependencies.join(' ')}`,
      usageExample: `<${this.componentNameToComponent(componentId)} />`,
    };
  }

  async getComponentCode(componentId: string): Promise<string | null> {
    const code = this.getCode(componentId);
    return code || null;
  }

  async getDependencies(componentId: string): Promise<string[] | null> {
    const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
    if (!comp) return null;
    return comp.dependencies;
  }

  getComponentMeta(componentId: string): ComponentMeta | undefined {
    return COMPONENT_METADATA.find((c) => c.id === componentId);
  }

  listCategories(): Array<{ slug: string; label: string; count: number }> {
    return CATEGORY_LIST.map((cat) => ({
      slug: cat.slug,
      label: cat.label,
      count: COMPONENT_METADATA.filter((c) => c.category === cat.slug).length,
    })).filter((c) => c.count > 0);
  }

  searchTemplates(params: { query?: string; category?: string; isPremium?: boolean }): TemplateSummary[] {
    let results = COMPONENT_METADATA.filter((c) =>
      ['3d', 'background', 'text', 'scroll', 'effect'].includes(c.category)
    ).map((c): TemplateSummary => ({
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
      results = results.filter(
        (t) => t.name.toLowerCase().includes(q) || (t.description || '').toLowerCase().includes(q)
      );
    }

    if (params.category) {
      results = results.filter((t) => t.category === params.category);
    }

    if (params.isPremium !== undefined) {
      results = results.filter((t) => t.isPremium === params.isPremium);
    }

    return results.slice(0, 20);
  }

  async getTemplate(templateId: string): Promise<TemplateDetail | null> {
    const componentId = templateId.replace(/^template-/, '');
    const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
    if (!comp) return null;

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

  searchAnimations(params: { query?: string; category?: string; isPremium?: boolean }): AnimationSummary[] {
    let results = COMPONENT_METADATA.filter((c) =>
      ['effect', 'text', 'scroll', 'image-interaction'].includes(c.category)
    ).map((c): AnimationSummary => ({
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
      results = results.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params.category) {
      results = results.filter((a) => a.category === params.category);
    }

    if (params.isPremium !== undefined) {
      results = results.filter((a) => a.isPremium === params.isPremium);
    }

    return results.slice(0, 20);
  }

  async getAnimationCode(animationId: string): Promise<AnimationDetail | null> {
    const componentId = animationId.replace(/^anim-/, '');
    const comp = COMPONENT_METADATA.find((c) => c.id === componentId);
    if (!comp) return null;

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

  private getCode(componentId: string): string | null {
    const map = loadSourceCode();
    return map[componentId] || null;
  }

  private componentNameToComponent(id: string): string {
    return id
      .split('-')
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join('');
  }
}

export const componentService = ComponentService.getInstance();
