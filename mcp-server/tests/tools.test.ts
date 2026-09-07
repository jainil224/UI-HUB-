import { describe, it, expect, beforeEach, vi } from 'vitest';
import { componentService } from '../src/services/componentService.js';
import { TOOLS } from '../src/tools/index.js';
import type { McpUser } from '../src/types/index.js';

// Mock analytics to avoid Firestore writes during tool tests
vi.mock('../src/services/analyticsService.js', () => ({
  analyticsService: {
    track: vi.fn().mockResolvedValue(undefined),
  },
}));

const freeUser: McpUser = { userId: 'free', email: 'free@test.com', tier: 'FREE', keyId: 'k', keyPrefix: 'uh_live_', keyStatus: 'active' };
const proUser: McpUser = { userId: 'pro', email: 'pro@test.com', tier: 'PRO', keyId: 'k', keyPrefix: 'uh_live_', keyStatus: 'active' };

function tool(name: string) {
  const t = TOOLS.find((x) => x.name === name);
  if (!t) throw new Error(`tool ${name} not found`);
  return t;
}

function parse(result: any) {
  return JSON.parse(result.content[0].text);
}

describe('ComponentService', () => {
  it('returns all components', () => {
    const all = componentService.getAllComponents();
    expect(all.length).toBeGreaterThan(50);
  });

  it('searches components by keyword', () => {
    const results = componentService.searchComponents({ query: 'cursor' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.id.includes('cursor') || c.tags.some((t) => t.includes('cursor')))).toBe(true);
  });

  it('searches components by category', () => {
    const results = componentService.searchComponents({ category: 'button' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.category === 'button')).toBe(true);
  });

  it('searches components by premium', () => {
    const results = componentService.searchComponents({ isPremium: true });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((c) => c.isPremium === true)).toBe(true);
  });

  it('gets a component', async () => {
    const detail = await componentService.getComponent('target-cursor', true);
    expect(detail).not.toBeNull();
    expect(detail!.code).toBeTruthy();
    expect(detail!.dependencies.length).toBeGreaterThan(0);
  });

  it('gets component code', async () => {
    const code = await componentService.getComponentCode('target-cursor');
    expect(code).toBeTruthy();
    expect(code!.includes('import React')).toBe(true);
  });

  it('returns null for unknown component', async () => {
    const detail = await componentService.getComponent('does-not-exist', true);
    expect(detail).toBeNull();
  });

  it('lists categories with counts', () => {
    const cats = componentService.listCategories();
    expect(cats.length).toBeGreaterThan(0);
  });

  it('gets dependencies', async () => {
    const deps = await componentService.getDependencies('target-cursor');
    expect(deps).toBeTruthy();
  });
});

describe('MCP Tools', () => {
  it('search_components works for free users', async () => {
    const result = await tool('search_components').handler({ query: 'cursor' }, { user: freeUser });
    const data = parse(result);
    expect(data.count).toBeGreaterThan(0);
  });

  it('get_component returns premium error for free user on premium component', async () => {
    const result = await tool('get_component').handler({ componentId: 'black-hole-cursor' }, { user: freeUser });
    expect(result.isError).toBe(true);
    const data = parse(result);
    expect(data.error).toBe('PREMIUM_ACCESS_REQUIRED');
  });

  it('get_component_code returns premium error for free user on premium component', async () => {
    const result = await tool('get_component_code').handler({ componentId: 'black-hole-cursor' }, { user: freeUser });
    const data = parse(result);
    expect(data.error).toBe('PREMIUM_ACCESS_REQUIRED');
  });

  it('get_component returns premium code for pro user', async () => {
    const result = await tool('get_component').handler({ componentId: 'black-hole-cursor' }, { user: proUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.code).toBeTruthy();
  });

  it('get_component returns not found error', async () => {
    const result = await tool('get_component').handler({ componentId: 'nope' }, { user: freeUser });
    const data = parse(result);
    expect(data.error).toBe('COMPONENT_NOT_FOUND');
  });

  it('search_templates returns results', async () => {
    const result = await tool('search_templates').handler({ query: 'background' }, { user: freeUser });
    const data = parse(result);
    expect(data.count).toBeGreaterThan(0);
  });

  it('get_template returns template details', async () => {
    const result = await tool('get_template').handler({ templateId: 'template-target-cursor' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.id).toBe('template-target-cursor');
  });

  it('search_animations returns results', async () => {
    const result = await tool('search_animations').handler({ query: 'text' }, { user: freeUser });
    const data = parse(result);
    expect(data.count).toBeGreaterThan(0);
  });

  it('get_animation_code returns code', async () => {
    const result = await tool('get_animation_code').handler({ animationId: 'anim-target-cursor' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.id).toBe('anim-target-cursor');
  });

  it('list_categories returns categories', async () => {
    const result = await tool('list_categories').handler({}, { user: freeUser });
    const data = parse(result);
    expect(data.categories.length).toBeGreaterThan(0);
  });

  it('get_dependencies returns deps', async () => {
    const result = await tool('get_dependencies').handler({ componentId: 'target-cursor' }, { user: freeUser });
    const data = parse(result);
    expect(data.dependencies.length).toBeGreaterThan(0);
  });

  it('get_component_metadata returns props and vibe for known component', async () => {
    const result = await tool('get_component_metadata').handler({ componentId: 'target-cursor' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.id).toBe('target-cursor');
    expect(Array.isArray(data.props)).toBe(true);
    expect(data.hasDetailedMetadata).toBe(true);
  });

  it('get_component_metadata falls back to vibe prompt when no detailed metadata exists', async () => {
    const result = await tool('get_component_metadata').handler({ componentId: 'mesh-text-hover' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.id).toBe('mesh-text-hover');
    expect(data.hasDetailedMetadata).toBe(false);
    expect(data.vibePrompt).toBeTruthy();
  });

  it('get_component_metadata returns not found', async () => {
    const result = await tool('get_component_metadata').handler({ componentId: 'nope' }, { user: freeUser });
    const data = parse(result);
    expect(data.error).toBe('COMPONENT_NOT_FOUND');
  });

  it('search_by_behavior finds components by vibe keywords', async () => {
    const result = await tool('search_by_behavior').handler({ query: 'magnetic' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.count).toBeGreaterThan(0);
    expect(data.components.some((c: any) => c.id === 'magnetic-cursor')).toBe(true);
  });

  it('search_by_behavior supports category filter', async () => {
    const result = await tool('search_by_behavior').handler({ query: 'particle', category: 'interactive-background' }, { user: freeUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.components.every((c: any) => c.category === 'interactive-background')).toBe(true);
  });

  it('get_ai_prompts returns premium error for free users', async () => {
    const result = await tool('get_ai_prompts').handler({ componentId: 'target-cursor' }, { user: freeUser });
    expect(result.isError).toBe(true);
    const data = parse(result);
    expect(data.error).toBe('PREMIUM_ACCESS_REQUIRED');
  });

  it('get_ai_prompts returns prompts for pro users', async () => {
    const result = await tool('get_ai_prompts').handler({ componentId: 'target-cursor' }, { user: proUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.componentId).toBe('target-cursor');
    expect(data.prompts.claude).toBeTruthy();
  });

  it('get_ai_prompts supports a single system filter', async () => {
    const result = await tool('get_ai_prompts').handler({ componentId: 'target-cursor', system: 'claude' }, { user: proUser });
    const data = parse(result);
    expect(Object.keys(data.prompts)).toEqual(['claude']);
  });

  it('get_ai_prompts returns prompts-not-found for components without prompts', async () => {
    const result = await tool('get_ai_prompts').handler({ componentId: 'alpine-footer' }, { user: proUser });
    expect(result.isError).toBe(true);
    const data = parse(result);
    expect(data.error).toBe('PROMPTS_NOT_FOUND');
  });

  it('get_template_source returns premium error for free users', async () => {
    const result = await tool('get_template_source').handler({ templateId: 'tars-protocol' }, { user: freeUser });
    expect(result.isError).toBe(true);
    const data = parse(result);
    expect(data.error).toBe('PREMIUM_ACCESS_REQUIRED');
  });

  it('get_template_source returns full source for pro users', async () => {
    const result = await tool('get_template_source').handler({ templateId: 'tars-protocol' }, { user: proUser });
    expect(result.isError).toBeFalsy();
    const data = parse(result);
    expect(data.id).toBe('tars-protocol');
    expect(data.hasSource).toBe(true);
    expect(data.source).toBeTruthy();
    expect(data.features.length).toBeGreaterThan(0);
  });

  it('get_template_source returns not found for unknown template', async () => {
    const result = await tool('get_template_source').handler({ templateId: 'nope-template' }, { user: proUser });
    expect(result.isError).toBe(true);
    const data = parse(result);
    expect(data.error).toBe('TEMPLATE_NOT_FOUND');
  });
});
