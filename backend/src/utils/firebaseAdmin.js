import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('[FirebaseAdmin] CRITICAL: VITE_FIREBASE_PROJECT_ID is not defined in environment variables!');
}

if (!admin.apps.length) {
  try {
    // Prefer an inline JSON service account (base64 or raw) passed as an env var.
    // This is the standard pattern for Render/Railway/Heroku deployments where
    // you cannot upload a credentials file directly.
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    let credential;
    if (serviceAccountJson) {
      let parsed;
      try {
        // Support both raw JSON string and base64-encoded JSON
        parsed = JSON.parse(
          serviceAccountJson.startsWith('{')
            ? serviceAccountJson
            : Buffer.from(serviceAccountJson, 'base64').toString('utf8')
        );
      } catch (parseErr) {
        console.error('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseErr.message);
      }
      if (parsed) {
        credential = admin.credential.cert(parsed);
        console.log('[FirebaseAdmin] Using service account credential from FIREBASE_SERVICE_ACCOUNT_JSON env var.');
      }
    }

    admin.initializeApp({
      projectId,
      ...(credential ? { credential } : {}),
    });
    console.log(`[FirebaseAdmin] Initialized for project: ${projectId} (credential: ${credential ? 'service-account' : 'application-default'})`);
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization error:', error);
  }
}

export const auth = admin.auth();
export default admin;
