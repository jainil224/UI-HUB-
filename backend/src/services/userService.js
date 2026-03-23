/**
 * User Service
 * Handles server-side user logic and Pro status verification.
 */

const PRO_EMAILS = [
    'jainil11199@gmail.com',
    'jainil111199@gmail.com' // Supporting both variants found in codebase/request
];

/**
 * Checks if a user has Pro status based on their email.
 * @param {string} email 
 * @returns {Promise<boolean>}
 */
export const checkProStatus = async (email) => {
    if (!email) return false;
    
    // In a real app, this would query a database (MongoDB/PostgreSQL/Firebase DB)
    // For now, we maintain the existing logic but keep it SECURED on the backend.
    return PRO_EMAILS.includes(email.toLowerCase());
};
