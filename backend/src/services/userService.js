/**
 * User Service
 * Handles server-side user logic and Pro status verification.
 */

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
 * Checks if a user has Pro status based on their email.
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
export const checkProStatus = async (email) => {
    if (!email) return false;
    
    // Check promo users with expiry
    const userEmail = email.toLowerCase();
    if (PROMO_USERS[userEmail]) {
        const expiryDate = new Date(PROMO_USERS[userEmail]);
        if (expiryDate > new Date()) {
            return true;
        }
    }

    // Fallback to legacy pro email list (indefinite)
    return PRO_EMAILS.includes(userEmail);
};
