import type { McpUser, PlanTier } from '../types/index.js';

export class PermissionService {
  private static instance: PermissionService;

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Check if a user can access a premium resource.
   * ADMIN and ELITE always have access.
   * PRO has access to PRO resources but not necessarily all.
   */
  canAccessPremium(user: McpUser): boolean {
    return user.tier === 'PRO' || user.tier === 'ELITE' || user.tier === 'ADMIN';
  }

  /**
   * Check if a user can access an admin-only resource.
   */
  isAdmin(user: McpUser): boolean {
    return user.tier === 'ADMIN' || user.tier === 'ELITE';
  }

  /**
   * Get the rate limit for a user's tier.
   * Returns configured values based on plan.
   */
  getRateLimit(user: McpUser): number {
    switch (user.tier) {
      case 'PRO':
      case 'ELITE':
      case 'ADMIN':
        // Pro/Admin users get the higher limit (or unlimited marker)
        return Number.MAX_SAFE_INTEGER;
      case 'FREE':
      default:
        return 100; // 100 requests per day for free users
    }
  }

  /**
   * Check if a user's tier allows a given operation.
   * Returns { allowed, reason? } - reason is a premium error code if denied.
   */
  authorize(
    user: McpUser,
    resource: { isPremium?: boolean }
  ): { allowed: boolean; error?: 'PREMIUM_ACCESS_REQUIRED'; message?: string } {
    if (resource.isPremium && !this.canAccessPremium(user)) {
      return {
        allowed: false,
        error: 'PREMIUM_ACCESS_REQUIRED',
        message: 'This resource requires a UI HUB Pro subscription.',
      };
    }
    return { allowed: true };
  }
}

export const permissionService = PermissionService.getInstance();
