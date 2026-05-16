import admin from '../utils/firebaseAdmin.js';

const getDb = () => admin.firestore();
const USERS_COLLECTION = 'users';

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
