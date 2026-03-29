/**
 * User Service
 * Handles server-side user logic and Pro status verification.
 */

const ELITE_EMAILS = [
    'jainil11199@gmail.com',
];

const PRO_EMAILS = [
    'jainil11199@gmail.com',
    'jainil111199@gmail.com'
];

/**
 * Promo access with expiration dates.
 * Format: { email: expiryDateString (YYYY-MM-DD) }
 */
const PROMO_USERS = {
    'jainil11199@gmail.com': '2027-03-24', // 1-year free pro granted on 2026-03-24
};

/**
 * Checks if a user has Elite status based on their email.
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
export const checkEliteStatus = async (email) => {
    if (!email) return false;
    const userEmail = email.toLowerCase();
    return ELITE_EMAILS.some(e => e.toLowerCase() === userEmail);
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
    
    const userEmail = email.toLowerCase();
    
    // Elite users are automatically Pro
    if (await checkEliteStatus(userEmail)) {
        return true;
    }

    console.log(`[UserStatus] Checking Pro status for: ${userEmail}`);

    // Check promo users with expiry
    if (PROMO_USERS[userEmail]) {
        const expiryDate = new Date(PROMO_USERS[userEmail]);
        if (expiryDate > new Date()) {
            console.log(`[UserStatus] ${userEmail} verified via PROMO (expires: ${PROMO_USERS[userEmail]})`);
            return true;
        }
        console.warn(`[UserStatus] ${userEmail} PROMO EXPIRED on ${PROMO_USERS[userEmail]}`);
    }

    // Fallback to legacy pro email list (indefinite)
    const isLegacyPro = PRO_EMAILS.some(e => e.toLowerCase() === userEmail);
    if (isLegacyPro) {
        console.log(`[UserStatus] ${userEmail} verified via LEGACY WHITELIST`);
    }

    return isLegacyPro;
};
