import admin from '../utils/firebaseAdmin.js';

const getDb = () => admin.firestore();
const USERS_COLLECTION = 'users';

export const PREMIUM_AI_TOOLS = ['advance', 'antigravity', 'claude'];
export const MAX_FREE_AI_TRIALS = 2;
export const TRIAL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * User Service
 * Handles server-side user logic and Pro status verification via Firestore.
 */

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
        const db = getDb();
        const userDoc = await db.collection(USERS_COLLECTION).doc(userEmail).get();
        if (!userDoc.exists) return false;
        
        const userData = userDoc.data();
        return userData.status === 'ELITE';
    } catch (error) {
        if (error.message && error.message.includes('Could not load the default credentials')) {
            // Suppress the massive stack trace for local development without credentials
            // console.warn('[UserStatus] Missing local Firebase credentials, skipping Elite check.');
        } else {
            console.error('[UserStatus] Error checking Elite status from Firestore:', error);
        }
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
        const overrideExpiry = new Date();
        overrideExpiry.setFullYear(overrideExpiry.getFullYear() + 1); // 1 year from now
        
        console.log(`[UserStatus] MATCH FOUND for ${userEmail} via hardcoded 1-year PRO override`);
        return true;
    }
    console.log(`[UserStatus] No hardcoded Pro match for ${userEmail}`);
    
    try {
        const db = getDb();
        // Fetch user from Firestore
        const userDoc = await db.collection(USERS_COLLECTION).doc(userEmail).get();
        
        if (!userDoc.exists) {
            console.log(`[UserStatus] User ${userEmail} not found in Firestore. Defaulting to free.`);
            return false;
        }

        const userData = userDoc.data();
        
        // Elite users are automatically Pro
        if (userData.status === 'ELITE') return true;
        if (userData.status === 'PRO') return true;

        // Check for premium access with expiry (legacy support)
        if (userData.proExpiry) {
            const expiryDate = new Date(userData.proExpiry);
            if (expiryDate > new Date()) {
                console.log(`[UserStatus] ${userEmail} verified via Firestore (expires: ${userData.proExpiry})`);
                return true;
            }
            console.warn(`[UserStatus] ${userEmail} premium status EXPIRED on ${userData.proExpiry}`);
        }

        return false;
    } catch (error) {
        if (error.message && error.message.includes('Could not load the default credentials')) {
            // console.warn('[UserStatus] Missing local Firebase credentials, skipping Pro check.');
        } else {
            console.error('[UserStatus] Error checking Pro status from Firestore:', error);
        }
        return false;
    }
};

/**
 * Resolves the user document reference used for trial tracking.
 * Plan-status data is authoritative on the email-keyed doc, so we read full
 * Firestore docs by email. We also fall back to the uid-keyed doc for
 * robustness given the codebase writes user records under both keys.
 */
const findUserDoc = async (uid, email) => {
    const db = getDb();
    const emailKey = (email || '').trim().toLowerCase();

    if (emailKey) {
        const emailDoc = await db.collection(USERS_COLLECTION).doc(emailKey).get();
        if (emailDoc.exists) return { ref: emailDoc.ref, data: emailDoc.data() };
    }
    if (uid) {
        const uidDoc = await db.collection(USERS_COLLECTION).doc(uid).get();
        if (uidDoc.exists) return { ref: uidDoc.ref, data: uidDoc.data() };
    }
    // No existing doc — prefer the email key for new writes (matches fulfillPayment).
    return { ref: emailKey ? db.collection(USERS_COLLECTION).doc(emailKey) : null, data: null };
};

/**
 * Reads a user's premium AI trial state.
 * @returns {Promise<{ trialCount: number, trialStartedAt: number|null }>}
 */
export const getUserTrialState = async (uid, email) => {
    try {
        const db = getDb();
        const { ref, data } = await findUserDoc(uid, email);
        if (!ref || !data) return { trialCount: 0, trialStartedAt: null };

        const trialCount = typeof data.premiumTrialsUsed === 'number' ? data.premiumTrialsUsed : 0;
        const startedRaw = data.premiumTrialStartedAt;
        let trialStartedAt = null;
        if (startedRaw) {
            trialStartedAt = startedRaw instanceof Date
                ? startedRaw.getTime()
                : (startedRaw._seconds ? startedRaw._seconds * 1000 : new Date(startedRaw).getTime());
        }
        return { trialCount, trialStartedAt };
    } catch (error) {
        if (error.message && error.message.includes('Could not load the default credentials')) {
            // Local fallback without credentials — no enforcement source of truth.
        } else {
            console.error('[Trial] Error reading trial state from Firestore:', error);
        }
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
        // Window may not be expired yet, but count is exhausted.
        const expiresAt = trialStartedAt ? trialStartedAt + TRIAL_WINDOW_MS : null;
        return { ...state, allowed: false, reason: 'COUNT', remaining: 0, expiresAt };
    }

    const expiresAt = trialStartedAt ? trialStartedAt + TRIAL_WINDOW_MS : null;
    return { ...state, allowed: true, reason: null, remaining: MAX_FREE_AI_TRIALS - trialCount, expiresAt };
};

/**
 * Records a premium AI trial use. First use also sets the 24h start timestamp.
 * @returns {Promise<{ trialCount: number, trialStartedAt: number|null, remaining: number, expiresAt: number|null }>}
 */
export const recordPremiumTrialUse = async (uid, email) => {
    try {
        const db = getDb();
        const { ref, data } = await findUserDoc(uid, email);
        if (!ref) return { trialCount: 0, trialStartedAt: null, remaining: 0, expiresAt: null };

        const prevCount = (data && typeof data.premiumTrialsUsed === 'number') ? data.premiumTrialsUsed : 0;
        const prevStarted = data && data.premiumTrialStartedAt
            ? (data.premiumTrialStartedAt instanceof Date
                ? data.premiumTrialStartedAt.getTime()
                : (data.premiumTrialStartedAt._seconds ? data.premiumTrialStartedAt._seconds * 1000 : new Date(data.premiumTrialStartedAt).getTime()))
            : null;

        const newCount = Math.min(prevCount + 1, MAX_FREE_AI_TRIALS);
        const startedAt = prevStarted || Date.now();

        // Atomic-ish update: only bump counter if it hasn't been raised past the cap already.
        await db.runTransaction(async (transaction) => {
            const fresh = await transaction.get(ref);
            const freshData = fresh.exists ? fresh.data() : {};
            const freshCount = (freshData && typeof freshData.premiumTrialsUsed === 'number') ? freshData.premiumTrialsUsed : 0;
            const freshStarted = freshData && freshData.premiumTrialStartedAt
                ? (freshData.premiumTrialStartedAt instanceof Date
                    ? freshData.premiumTrialStartedAt.getTime()
                    : (freshData.premiumTrialStartedAt._seconds ? freshData.premiumTrialStartedAt._seconds * 1000 : new Date(freshData.premiumTrialStartedAt).getTime()))
                : null;
            const count = Math.min(freshCount + 1, MAX_FREE_AI_TRIALS);
            const started = freshStarted || startedAt;
            transaction.set(ref, {
                premiumTrialsUsed: count,
                premiumTrialStartedAt: admin.firestore.Timestamp.fromMillis(started),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            }, { merge: true });
        });

        const expiresAt = startedAt + TRIAL_WINDOW_MS;
        return { trialCount: newCount, trialStartedAt: startedAt, remaining: Math.max(0, MAX_FREE_AI_TRIALS - newCount), expiresAt };
    } catch (error) {
        if (error.message && error.message.includes('Could not load the default credentials')) {
            // No credentials — reflect a best-effort local count without persistence.
            return { trialCount: 1, trialStartedAt: Date.now(), remaining: Math.max(0, MAX_FREE_AI_TRIALS - 1), expiresAt: Date.now() + TRIAL_WINDOW_MS };
        }
        console.error('[Trial] Error recording premium trial use:', error);
        throw error;
    }
};
