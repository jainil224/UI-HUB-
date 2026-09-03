import { getCollection, executeWithRetry } from './mongoService.js';

const USERS_COLLECTION = 'users';

export const PREMIUM_AI_TOOLS = ['advance', 'antigravity', 'claude'];
export const MAX_FREE_AI_TRIALS = 2;
export const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * User Service
 * Handles server-side user logic and Pro status verification via MongoDB.
 */

const readTs = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.getTime();
  if (value._seconds) return value._seconds * 1000;
  if (typeof value === 'number') return value;
  return new Date(value).getTime();
};

/**
 * Finds a user document by email or uid.
 * Reads are flexible: matches on the `_id` (email or uid) or the stored `uid`/`email` fields.
 * @returns {Promise<{ data: object|null }>}
 */
const findUserData = async (uid, email) => {
  return executeWithRetry(async (db) => {
    const users = db.collection(USERS_COLLECTION);
    const emailKey = (email || '').trim().toLowerCase();

    if (emailKey) {
      const byEmail = await users.findOne({ $or: [{ _id: emailKey }, { email: emailKey }] });
      if (byEmail) return { data: byEmail };
    }
    if (uid) {
      const byUid = await users.findOne({ $or: [{ _id: uid }, { uid }] });
      if (byUid) return { data: byUid };
    }
    return { data: null };
  });
};

/**
 * Checks if a user has Elite status based on their email.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const checkEliteStatus = async (email) => {
  if (!email) return false;
  const userEmail = email.trim().toLowerCase();
  console.log(`[UserStatus] checkEliteStatus for: "${userEmail}"`);

  // Explicit Elite override for admin/test accounts
  if (userEmail === 'jainil11199@gmail.com' || userEmail === 'jainil224@gmail.com' || userEmail === 'jainilpatel2224@gmail.com') {
    console.log(`[UserStatus] MATCH FOUND for ${userEmail} via hardcoded ELITE override`);
    return true;
  }
  console.log(`[UserStatus] No hardcoded match for ${userEmail}`);

  try {
    const user = await executeWithRetry(async (db) => {
      return db.collection(USERS_COLLECTION).findOne({ $or: [{ _id: userEmail }, { email: userEmail }] });
    });
    if (!user) return false;
    return user.status === 'ELITE';
  } catch (error) {
    console.error('[UserStatus] Error checking Elite status from MongoDB:', error);
    return false;
  }
};

/**
 * Checks if a user has Pro status based on their email.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const checkProStatus = async (email) => {
  if (!email) {
    console.warn('[UserStatus] checkProStatus called with null/undefined email');
    return false;
  }

  const userEmail = email.trim().toLowerCase();
  console.log(`[UserStatus] checkProStatus for: "${userEmail}"`);

  // Explicit Pro override for admin/test accounts
  if (userEmail === 'jainil11199@gmail.com' || userEmail === 'jainil224@gmail.com' || userEmail === 'jainilpatel2224@gmail.com') {
    console.log(`[UserStatus] MATCH FOUND for ${userEmail} via hardcoded 1-year PRO override`);
    return true;
  }
  console.log(`[UserStatus] No hardcoded Pro match for ${userEmail}`);

  try {
    const user = await executeWithRetry(async (db) => {
      return db.collection(USERS_COLLECTION).findOne({ $or: [{ _id: userEmail }, { email: userEmail }] });
    });

    if (!user) {
      console.log(`[UserStatus] User ${userEmail} not found in MongoDB. Defaulting to free.`);
      return false;
    }

    // Elite users are automatically Pro
    if (user.status === 'ELITE') return true;
    if (user.status === 'PRO') return true;

    // Check for premium access with expiry (legacy support)
    if (user.proExpiry) {
      const expiryDate = new Date(user.proExpiry);
      if (expiryDate > new Date()) {
        console.log(`[UserStatus] ${userEmail} verified via MongoDB (expires: ${user.proExpiry})`);
        return true;
      }
      console.warn(`[UserStatus] ${userEmail} premium status EXPIRED on ${user.proExpiry}`);
    }

    return false;
  } catch (error) {
    console.error('[UserStatus] Error checking Pro status from MongoDB:', error);
    return false;
  }
};

/**
 * Reads a user's premium AI trial state.
 * @returns {Promise<{ trialCount: number, trialStartedAt: number|null }>}
 */
export const getUserTrialState = async (uid, email) => {
  try {
    const { data } = await findUserData(uid, email);
    if (!data) return { trialCount: 0, trialStartedAt: null };

    const trialCount = typeof data.premiumTrialsUsed === 'number' ? data.premiumTrialsUsed : 0;
    const trialStartedAt = readTs(data.premiumTrialStartedAt);
    return { trialCount, trialStartedAt };
  } catch (error) {
    console.error('[Trial] Error reading trial state from MongoDB:', error);
    return { trialCount: 0, trialStartedAt: null };
  }
};

/**
 * Computes whether a non-pro user may currently consume a premium AI trial.
 * @returns {Promise<{ allowed: boolean, reason: 'COUNT'|'EXPIRY'|null, remaining: number, expiresAt: number|null, trialCount: number, trialStartedAt: number|null }>}
 */
export const evaluateAiTrial = async (uid, email) => {
  const state = await getUserTrialState(uid, email);
  const { trialCount, trialStartedAt } = state;

  const now = Date.now();

  // 24h window from first trial use.
  if (trialStartedAt && now - trialStartedAt > TRIAL_WINDOW_MS) {
    const remaining = Math.max(0, MAX_FREE_AI_TRIALS - trialCount);
    return { ...state, allowed: false, reason: 'EXPIRY', remaining, expiresAt: trialStartedAt + TRIAL_WINDOW_MS };
  }

  if (trialCount >= MAX_FREE_AI_TRIALS) {
    const expiresAt = trialStartedAt ? trialStartedAt + TRIAL_WINDOW_MS : null;
    return { ...state, allowed: false, reason: 'COUNT', remaining: 0, expiresAt };
  }

  const expiresAt = trialStartedAt ? trialStartedAt + TRIAL_WINDOW_MS : null;
  return { ...state, allowed: true, reason: null, remaining: MAX_FREE_AI_TRIALS - trialCount, expiresAt };
};

/**
 * Records a premium AI trial use. First use also sets the 24h start timestamp.
 * Uses an atomic $inc + conditional update so concurrent requests can't overshoot the cap.
 * @returns {Promise<{ trialCount: number, trialStartedAt: number|null, remaining: number, expiresAt: number|null }>}
 */
export const recordPremiumTrialUse = async (uid, email) => {
  try {
    const users = await getCollection(USERS_COLLECTION);
    const emailKey = (email || '').trim().toLowerCase();

    // Resolve the target user doc id for the atomic update (prefer email key like before).
    const { data } = await findUserData(uid, email);
    const targetId = data?._id || emailKey || uid;
    if (!targetId) return { trialCount: 0, trialStartedAt: null, remaining: 0, expiresAt: null };

    const now = Date.now();

    // Atomically increment the counter only if it is below the cap.
    const updated = await users.findOneAndUpdate(
      { _id: targetId, $or: [
          { premiumTrialsUsed: { $lt: MAX_FREE_AI_TRIALS } },
          { premiumTrialsUsed: { $exists: false } },
        ] },
      [
        { $set: { updatedAt: new Date() } },
        {
          $set: {
            premiumTrialsUsed: { $min: [{ $add: [{ $ifNull: ['$premiumTrialsUsed', 0] }, 1] }, MAX_FREE_AI_TRIALS] },
            premiumTrialStartedAt: { $ifNull: ['$premiumTrialStartedAt', now] },
          },
        },
      ],
      { returnDocument: 'after', upsert: false }
    );

    const doc = updated?.value || updated;

    if (!doc) {
      // Fallback: find and update by email/uid field match.
      const filter = emailKey
        ? { $or: [{ _id: emailKey }, { email: emailKey }] }
        : { $or: [{ _id: uid }, { uid }] };
      const fallback = await users.findOneAndUpdate(
        { ...filter, $or: [
            { premiumTrialsUsed: { $lt: MAX_FREE_AI_TRIALS } },
            { premiumTrialsUsed: { $exists: false } },
          ] },
        [
          { $set: { updatedAt: new Date() } },
          {
            $set: {
              premiumTrialsUsed: { $min: [{ $add: [{ $ifNull: ['$premiumTrialsUsed', 0] }, 1] }, MAX_FREE_AI_TRIALS] },
              premiumTrialStartedAt: { $ifNull: ['$premiumTrialStartedAt', now] },
            },
          },
        ],
        { returnDocument: 'after', upsert: true }
      );
      const fDoc = fallback?.value || fallback;
      const fCount = fDoc && typeof fDoc.premiumTrialsUsed === 'number' ? fDoc.premiumTrialsUsed : 0;
      const fStarted = readTs(fDoc?.premiumTrialStartedAt) || now;
      const fExpiresAt = fStarted + TRIAL_WINDOW_MS;
      return {
        trialCount: fCount,
        trialStartedAt: fStarted,
        remaining: Math.max(0, MAX_FREE_AI_TRIALS - fCount),
        expiresAt: fExpiresAt,
      };
    }

    const count = typeof doc.premiumTrialsUsed === 'number' ? doc.premiumTrialsUsed : 0;
    const startedAt = readTs(doc.premiumTrialStartedAt) || now;
    const expiresAt = startedAt + TRIAL_WINDOW_MS;
    return { trialCount: count, trialStartedAt: startedAt, remaining: Math.max(0, MAX_FREE_AI_TRIALS - count), expiresAt };
  } catch (error) {
    console.error('[Trial] Error recording premium trial use:', error);
    throw error;
  }
};
