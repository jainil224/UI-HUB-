import { describe, it, expect } from 'vitest';
import { componentService } from '../src/services/componentService.js';
import { permissionService } from '../src/services/permissionService.js';
import { get_component_code } from '../src/tools/getComponentCode.js';
import { get_component } from '../src/tools/getComponent.js';
import { search_components } from '../src/tools/searchComponents.js';
import type { McpUser } from '../src/types/index.js';

function makeUser(tier: McpUser['tier']): McpUser {
  return { userId: 'u1', email: '', tier, keyId: 'k1', keyPrefix: 'uh_live_test', keyStatus: 'active' };
}

async function callTool(tool: any, args: Record<string, unknown>, user: McpUser) {
  return (await tool.handler(args, { user })) as { content: Array<{ text: string }>; isError?: boolean };
}

const PREMIUM_ONLY_ID = 'black-hole';

describe('premium-only ids resolve through the unified catalog', () => {
  it('getComponentMeta now resolves premium-only ids', () => {
    const meta = componentService.getComponentMeta(PREMIUM_ONLY_ID);
    expect(meta).toBeDefined();
    expect(meta!.isPremium).toBe(true);
    expect(meta!.title).toBe('Black Hole');
  });

  it('source code is present for premium-only ids', async () => {
    const code = await componentService.getComponentCode(PREMIUM_ONLY_ID);
    expect(typeof code).toBe('string');
    expect((code || '').length).toBeGreaterThan(0);
  });

  it('catalog includes premium-only entries in the full catalog', () => {
    const full = componentService.getFullCatalog();
    expect(full.some((c) => c.id === PREMIUM_ONLY_ID && c.isPremium)).toBe(true);
  });
});

describe('premium gating: free denied, pro allowed', () => {
  it('FREE key cannot fetch premium code', async () => {
    const res = await callTool(get_component_code, { componentId: PREMIUM_ONLY_ID }, makeUser('FREE'));
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('PREMIUM_ACCESS_REQUIRED');
    expect(res.content[0].text).not.toContain('import React');
  });

  it('PRO key fetches premium code', async () => {
    const res = await callTool(get_component_code, { componentId: PREMIUM_ONLY_ID }, makeUser('PRO'));
    expect(res.isError).toBeFalsy();
    const payload = JSON.parse(res.content[0].text);
    expect(payload.componentId).toBe(PREMIUM_ONLY_ID);
    expect(typeof payload.code).toBe('string');
    expect(payload.code.length).toBeGreaterThan(0);
  });

  it('FREE key cannot fetch premium component detail', async () => {
    const res = await callTool(get_component, { componentId: PREMIUM_ONLY_ID }, makeUser('FREE'));
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain('PREMIUM_ACCESS_REQUIRED');
  });

  it('ADMIN key fetches premium component detail', async () => {
    const res = await callTool(get_component, { componentId: PREMIUM_ONLY_ID }, makeUser('ADMIN'));
    expect(res.isError).toBeFalsy();
    const payload = JSON.parse(res.content[0].text);
    expect(payload.id).toBe(PREMIUM_ONLY_ID);
    expect(payload.isPremium).toBe(true);
  });

  it('permissionService mirrors tier rules', () => {
    expect(permissionService.authorize(makeUser('FREE'), { isPremium: true }).allowed).toBe(false);
    expect(permissionService.authorize(makeUser('PRO'), { isPremium: true }).allowed).toBe(true);
    expect(permissionService.authorize(makeUser('ELITE'), { isPremium: true }).allowed).toBe(true);
  });
});

describe('search surfaces premium as locked (not hidden)', () => {
  it('FREE search returns premium matches with access: premium-required', async () => {
    const res = await callTool(search_components, { query: 'particle' }, makeUser('FREE'));
    const payload = JSON.parse(res.content[0].text);
    expect(payload.count).toBeGreaterThan(0);
    const premium = payload.components.find((c: any) => c.isPremium);
    expect(premium).toBeDefined();
    expect(premium.access).toBe('premium-required');
  });

  it('PRO search marks premium matches as premium-available', async () => {
    const res = await callTool(search_components, { query: 'particle' }, makeUser('PRO'));
    const payload = JSON.parse(res.content[0].text);
    const premium = payload.components.find((c: any) => c.isPremium);
    expect(premium).toBeDefined();
    expect(premium.access).toBe('premium-available');
  });
});
