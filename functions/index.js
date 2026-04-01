import functions from 'firebase-functions';
import admin from 'firebase-admin';
import { sendWelcomeEmail } from './utils/sendEmail.js';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function triggered when a new user is created in Firebase Authentication.
 * This sends a welcome email to the user.
 */
export const onUserSignup = functions.auth.user().onCreate(async (user) => {
  const email = user.email; // The email of the new user
  const displayName = user.displayName || 'UI Challenger'; // The display name or fallback

  console.log(`[onUserSignup] New user created: ${email} (${displayName})`);

  if (!email) {
    console.error('[onUserSignup] No email found for user! Skipping email.');
    return null;
  }

  try {
    // Send the welcome email
    const result = await sendWelcomeEmail(email, displayName);
    
    if (result.success) {
      console.log(`[onUserSignup] Welcome email successfully sent to ${email}`);
    } else {
      console.error(`[onUserSignup] Failed to send welcome email to ${email}:`, result.error);
    }
  } catch (error) {
    console.error('[onUserSignup] Unexpected error occurred during welcome email trigger:', error);
  }

  return null;
});
