import { getCollection, executeWithRetry } from './mongoService.js';
import { isOwnCloudinaryUrl } from './cloudinaryService.js';

const USERS_COLLECTION = 'users';

export const PREMIUM_AI_TOOLS = ['advance', 'antigravity', 'claude'];
export const MAX_FREE_AI_TRIALS = 2;
export const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export const USERNAME_RE = /^(?=.*[A-Z])[A-Za-z0-9._-]{3,30}$/;
export const USERNAME_RULE_MESSAGE =
  'Username must be 3-30 characters using letters, numbers, dot, underscore or hyphen, and include at least one capital letter.';
export const DISPLAY_NAME_MAX = 60;

/** Legacy unique index on the (formerly lowercased) username field. */
const LEGACY_USERNAME_INDEX = 'username_1';

/** Thrown by profile mutations so routes can map a cause to an HTTP status. */
export class ProfileError extends Error {
  constructor(message, code, status = 400) {
    super(message);
    this.name = 'ProfileError';
    this.code = code;
    this.status = status;
  }
}

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
    // Custom plan users are also considered Pro (have some paid access)
    if (user.planType === 'custom' || user.planTier === 'custom') return true;

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

/* ==========================================================================
 * Profile
 * ======================================================================== */

/** Lowercases and trims a raw username so uniqueness is case-insensitive. */
export const normalizeUsername = (value) => String(value ?? '').trim().toLowerCase();

/**
 * Reduces a stored user document to the subset that is safe to expose.
 * @param {object|null} doc
 * @param {{ uid?: string, email?: string }} [fallback]
 */
const sanitizeProfile = (doc, fallback = {}) => ({
  uid: doc?.uid || fallback.uid || null,
  email: doc?.email || fallback.email || null,
  username: doc?.username || null,
  displayName: doc?.displayName || fallback.displayName || null,
  avatarUrl: doc?.avatarUrl || null,
  avatarPublicId: doc?.avatarPublicId || null,
  planTier: doc?.planTier || (doc?.status ? String(doc.status).toLowerCase() : 'free'),
  status: doc?.status || 'FREE',
  createdAt: doc?.createdAt || null,
  profileUpdatedAt: doc?.profileUpdatedAt || null,
});

/**
 * Creates the unique (sparse) index that enforces case-insensitive username
 * uniqueness. Migrates away from the legacy index on the raw `username` field
 * and backfills `usernameLower` for pre-existing documents.
 * Idempotent; safe to call on every boot.
 * @returns {Promise<boolean>}
 */
export const ensureProfileIndexes = async () => {
  try {
    const users = await getCollection(USERS_COLLECTION);

    await users.dropIndex(LEGACY_USERNAME_INDEX).catch(() => {});

    await users
      .createIndex({ usernameLower: 1 }, { unique: true, sparse: true, name: 'usernameLower_1' })
      .catch(async (error) => {
        if (error?.code === 85) return;
        throw error;
      });

    await backfillUsernameLower(users);
    return true;
  } catch (error) {
    console.warn('[Profile] Could not ensure username index:', error.message);
    return false;
  }
};

/** Populates `usernameLower` on documents saved before case-insensitive keys. */
const backfillUsernameLower = async (users) => {
  const missing = await users
    .find(
      { username: { $type: 'string' }, usernameLower: { $exists: false } },
      { projection: { _id: 1, username: 1 } }
    )
    .toArray()
    .catch(() => []);

  for (const doc of missing) {
    await users
      .updateOne({ _id: doc._id }, { $set: { usernameLower: normalizeUsername(doc.username) } })
      .catch(() => {});
  }
};

/**
 * Reads a user's profile.
 * @returns {Promise<object>}
 */
export const getUserProfile = async (uid, email) => {
  const { data } = await findUserData(uid, email);
  return sanitizeProfile(data, { uid, email: (email || '').toLowerCase() });
};

/**
 * Checks whether a username can be claimed. A user may "keep" their own handle.
 * @returns {Promise<{ available: boolean, reason?: string }>}
 */
export const isUsernameAvailable = async (handle, { uid, email } = {}) => {
  const username = String(handle ?? '').trim();
  if (!USERNAME_RE.test(username)) return { available: false, reason: 'INVALID' };

  const users = await getCollection(USERS_COLLECTION);
  const existing = await users.findOne(
    { usernameLower: normalizeUsername(username) },
    { projection: { _id: 1 } }
  );
  if (!existing) return { available: true };

  const { data } = await findUserData(uid, email);
  if (data && String(existing._id) === String(data._id)) return { available: true };
  return { available: false, reason: 'TAKEN' };
};

/**
 * Applies validated profile changes and returns the fresh profile.
 * Only `displayName`, `username` and `avatarUrl`/`avatarPublicId` are writable.
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (uid, email, updates = {}) => {
  const emailKey = (email || '').trim().toLowerCase();
  const { data } = await findUserData(uid, email);
  const targetId = data?._id || emailKey || uid;
  if (!targetId) throw new ProfileError('Could not resolve the user account', 'NO_USER', 400);

  const users = await getCollection(USERS_COLLECTION);
  const now = new Date();
  const set = { updatedAt: now, profileUpdatedAt: now };

  if (updates.displayName !== undefined) {
    const displayName = String(updates.displayName || '').trim();
    if (!displayName) throw new ProfileError('Name cannot be empty', 'INVALID_NAME');
    if (displayName.length > DISPLAY_NAME_MAX) {
      throw new ProfileError(`Name must be ${DISPLAY_NAME_MAX} characters or fewer`, 'INVALID_NAME');
    }
    set.displayName = displayName;
  }

  if (updates.username !== undefined && updates.username !== null && String(updates.username).trim() !== '') {
    const username = String(updates.username).trim();
    if (!USERNAME_RE.test(username)) {
      throw new ProfileError(USERNAME_RULE_MESSAGE, 'INVALID_USERNAME');
    }
    const usernameLower = normalizeUsername(username);
    const clash = await users.findOne({ usernameLower }, { projection: { _id: 1 } });
    if (clash && String(clash._id) !== String(targetId)) {
      throw new ProfileError('That username is already taken', 'USERNAME_TAKEN', 409);
    }
    set.username = username;
    set.usernameLower = usernameLower;
  }

  if (updates.avatarUrl !== undefined) {
    if (updates.avatarUrl === null || updates.avatarUrl === '') {
      set.avatarUrl = null;
      set.avatarPublicId = null;
    } else if (isOwnCloudinaryUrl(updates.avatarUrl)) {
      set.avatarUrl = updates.avatarUrl;
      set.avatarPublicId =
        typeof updates.avatarPublicId === 'string' && updates.avatarPublicId
          ? updates.avatarPublicId
          : data?.avatarPublicId || null;
    } else {
      throw new ProfileError('Avatar must be an image hosted by Cloudinary', 'INVALID_AVATAR_URL');
    }
  }

  if (!data) {
    await users.updateOne(
      { _id: targetId },
      { $set: { _id: targetId, email: emailKey, uid, planTier: 'free', status: 'FREE', createdAt: now, ...set } },
      { upsert: true }
    );
  } else {
    await users.updateOne({ _id: targetId }, { $set: set });
  }

  const fresh = await users.findOne({ _id: targetId });
  return sanitizeProfile(fresh, { uid, email: emailKey });
};
