import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('[FirebaseAdmin] CRITICAL: VITE_FIREBASE_PROJECT_ID is not defined in environment variables!');
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('[FirebaseAdmin] FIREBASE_SERVICE_ACCOUNT_JSON is not set.');
  }

  let serviceAccount;
  if (raw) {
    try {
      const cleanRaw = raw.trim();
      serviceAccount = JSON.parse(
        cleanRaw.startsWith('{') ? cleanRaw : Buffer.from(cleanRaw, 'base64').toString('utf8')
      );
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
      }
    } catch (parseErr) {
      console.error('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseErr.message);
    }
  }

  if (!serviceAccount || !serviceAccount.project_id) {
    console.error('[FirebaseAdmin] Failed to extract project_id. Vercel env variable is likely malformed or missing!');
    serviceAccount = null; // Do not throw synchronously
  }

  try {
    const initPayload = {
      ...(projectId && { projectId }),
      ...(serviceAccount && { credential: admin.credential.cert(serviceAccount) }),
    };
    if (serviceAccount) {
      admin.initializeApp(initPayload);
      console.log('[FirebaseAdmin] Initialized successfully with project:', serviceAccount.project_id);
    } else {
      console.error('[FirebaseAdmin] Bypassed initialization because credentials are invalid.');
    }
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization error:', error);
  }
}

initializeFirebaseAdmin();
// Removed top-level export const auth = admin.auth(); to prevent boot crash
export default admin;
