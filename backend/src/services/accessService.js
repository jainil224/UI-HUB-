import { getCollection, executeWithRetry } from './mongoService.js';
import { isPremiumComponentId } from '../config/premiumComponents.js';
import { inferCategory } from './componentSyncService.js';

const USERS_COLLECTION = 'users';
const COMPONENTS_COLLECTION = 'components';

const SPECIAL_EMAILS = new Set([
  'jainil11199@gmail.com',
  'jainil224@gmail.com',
  'jainilpatel2224@gmail.com',
]);

/**
 * Resolves premium metadata for a component.
 *
 * Source of truth is the `components` MongoDB collection (catches premium ids
 * that are not in the static set, e.g. newly added components). If Mongo is
 * unavailable we fall back to the canonical static list + inferCategory, so
 * premium components stay protected even during a DB outage.
 *
 * @param {string} id
 * @returns {Promise<{ id: string, isPro: boolean, category: string }>}
 */
export const resolveComponentMeta = async (id) => {
  const cleanId = String(id || '').trim().toLowerCase();

  try {
    const comps = await getCollection(COMPONENTS_COLLECTION);
    const doc = await comps.findOne({ _id: cleanId }, { projection: { _id: 1, isPro: 1, category: 1 } });
    if (doc) {
      return {
        id: cleanId,
        isPro: Boolean(doc.isPro),
        category: doc.category || inferCategory(cleanId),
      };
    }
  } catch (error) {
    console.warn(`[Access] Mongo lookup failed for ${cleanId}, using static fallback:`, error.message);
  }

  return {
    id: cleanId,
    isPro: isPremiumComponentId(cleanId),
    category: inferCategory(cleanId),
  };
};

/**
 * Loads a user's plan/entitlement snapshot by email or uid.
 * @returns {Promise<object|null>}
 */
export const getUserEntitlements = async (uid, email) => {
  if (!uid && !email) return null;
  const emailKey = (email || '').trim().toLowerCase();

  return executeWithRetry(async (db) => {
    const users = db.collection(USERS_COLLECTION);
    const filter = emailKey
      ? { $or: [{ _id: emailKey }, { email: emailKey }] }
      : { $or: [{ _id: uid }, { uid }] };

    const user = await users.findOne(filter, {
      projection: {
        status: 1, planType: 1, planTier: 1, selectedCategories: 1,
        entitlements: 1, proExpiry: 1,
      },
    });

    if (!user) return null;

    const proExpiry = user.proExpiry ? new Date(user.proExpiry) : null;
    return {
      status: user.status,
      planType: user.planType || user.planTier || 'free',
      selectedCategories: Array.isArray(user.selectedCategories) ? user.selectedCategories : [],
      entitlements: Array.isArray(user.entitlements) ? user.entitlements : [],
      isFullPro:
        user.status === 'PRO' ||
        user.status === 'ELITE' ||
        user.planType === 'pro' ||
        (proExpiry && proExpiry.getTime() > Date.now()),
      isCustom: user.planType === 'custom' || user.planTier === 'custom',
    };
  }).catch(() => null);
};

/**
 * Pure decision logic for whether a user may receive a component's source code.
 *
 * A user is entitled when ANY of the following hold:
 *   - the component is not premium (free for all authenticated users)
 *   - the user is a special/ELITE account, or has a full PRO plan
 *   - the user holds a custom plan whose selectedCategories includes the component
 *   - the user purchased a bundle/a-la-carte entitlement matching the id or category
 *
 * Kept as a pure function (no DB access) so it can be unit-tested in isolation;
 * `canAccessComponent` performs the DB fetch and delegates here.
 *
 * @param {object|null|undefined} reqUser - req.user from verifyToken (Firebase claims)
 * @param {object|null} meta - { id, isPro, category } from resolveComponentMeta
 * @param {object|null} plan - normalized user entitlements from getUserEntitlements
 * @returns {{ allowed: boolean, reason?: string, tier?: string }}
 */
export const decideAccess = (reqUser, meta, plan) => {
  if (!meta || !meta.isPro) {
    return { allowed: true, tier: 'free' };
  }

  // 1. Must be an authenticated user for premium content.
  if (!reqUser) {
    return { allowed: false, reason: 'AUTH_REQUIRED', tier: 'free' };
  }

  const email = (reqUser.email || '').trim().toLowerCase();

  // 2. Special/ELITE accounts always have access.
  if (SPECIAL_EMAILS.has(email)) {
    return { allowed: true, tier: 'elite' };
  }

  // 3a. Full PRO (covers Pro + legacy proExpiry + ELITE via status).
  if (!plan) {
    // No record — safest to deny premium code to a user we cannot verify.
    return { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' };
  }
  if (plan.isFullPro) {
    return { allowed: true, tier: 'pro' };
  }

  // 3b. Custom plan users only for their purchased categories.
  if (plan.isCustom) {
    if (plan.selectedCategories.includes(meta.category)) {
      return { allowed: true, tier: 'custom' };
    }
    return { allowed: false, reason: 'CATEGORY_REQUIRED', tier: 'custom' };
  }

  // 3c. Bundles / a-la-carte entitlements (id or category).
  if (
    plan.entitlements.includes(meta.id) ||
    plan.entitlements.includes(meta.category)
  ) {
    return { allowed: true, tier: 'bundle' };
  }

  return { allowed: false, reason: 'PREMIUM_REQUIRED', tier: 'free' };
};

/**
 * Decides whether a user may receive a component's source code.
 *
 * Fetches the user's plan/entitlement snapshot (when needed) and delegates the
 * decision to `decideAccess`. Behaves identically to the historical logic.
 *
 * @param {object|null|undefined} reqUser - req.user from verifyToken (Firebase claims)
 * @param {object} meta - { id, isPro, category } from resolveComponentMeta
 * @returns {Promise<{ allowed: boolean, reason?: string, tier?: string }>}
 */
export const canAccessComponent = async (reqUser, meta) => {
  if (!meta || !meta.isPro) {
    return decideAccess(reqUser, meta, null);
  }
  if (!reqUser) {
    return decideAccess(reqUser, meta, null);
  }

  const email = (reqUser.email || '').trim().toLowerCase();
  const uid = reqUser.uid || reqUser.user_id;

  // Special/ELITE accounts skip the DB lookup.
  if (SPECIAL_EMAILS.has(email)) {
    return decideAccess(reqUser, meta, null);
  }

  let plan = null;
  try {
    plan = await getUserEntitlements(uid, email);
  } catch (error) {
    console.warn('[Access] Entitlement lookup failed:', error.message);
  }

  return decideAccess(reqUser, meta, plan);
};

export const accessService = {
  resolveComponentMeta,
  getUserEntitlements,
  canAccessComponent,
  decideAccess,
  SPECIAL_EMAILS,
};

export default accessService;