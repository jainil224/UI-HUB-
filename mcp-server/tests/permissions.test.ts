import { describe, it, expect } from 'vitest';
import { PermissionService } from '../src/services/permissionService.js';
import { permissionService } from '../src/services/permissionService.js';
import type { McpUser } from '../src/types/index.js';

function makeUser(tier: McpUser['tier']): McpUser {
  return {
    userId: 'u1',
    email: 'test@test.com',
    tier,
    keyId: 'k1',
    keyPrefix: 'uh_live_abc',
    keyStatus: 'active',
  };
}

describe('PermissionService', () => {
  it('free users cannot access premium resources', () => {
    const auth = permissionService.authorize(makeUser('FREE'), { isPremium: true });
    expect(auth.allowed).toBe(false);
    expect(auth.error).toBe('PREMIUM_ACCESS_REQUIRED');
  });

  it('free users can access free resources', () => {
    const auth = permissionService.authorize(makeUser('FREE'), { isPremium: false });
    expect(auth.allowed).toBe(true);
  });

  it('pro users can access premium resources', () => {
    const auth = permissionService.authorize(makeUser('PRO'), { isPremium: true });
    expect(auth.allowed).toBe(true);
  });

  it('elite users can access premium resources', () => {
    const auth = permissionService.authorize(makeUser('ELITE'), { isPremium: true });
    expect(auth.allowed).toBe(true);
  });

  it('admin users can access premium resources', () => {
    const auth = permissionService.authorize(makeUser('ADMIN'), { isPremium: true });
    expect(auth.allowed).toBe(true);
  });

  it('canAccessPremium returns false for free', () => {
    expect(permissionService.canAccessPremium(makeUser('FREE'))).toBe(false);
  });

  it('canAccessPremium returns true for pro', () => {
    expect(permissionService.canAccessPremium(makeUser('PRO'))).toBe(true);
  });

  it('isAdmin returns true only for admin/elite', () => {
    expect(permissionService.isAdmin(makeUser('ADMIN'))).toBe(true);
    expect(permissionService.isAdmin(makeUser('ELITE'))).toBe(true);
    expect(permissionService.isAdmin(makeUser('PRO'))).toBe(false);
    expect(permissionService.isAdmin(makeUser('FREE'))).toBe(false);
  });
});
