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
});
