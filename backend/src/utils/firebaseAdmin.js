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

  try {
    const initPayload = {
      ...(projectId && { projectId }),
      ...(serviceAccount && { credential: admin.credential.cert(serviceAccount) }),
    };
    admin.initializeApp(initPayload);
    console.log(`[FirebaseAdmin] Initialized for project: ${projectId} (credential: ${serviceAccount ? 'service-account' : 'application-default'})`);
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization error:', error);
  }
}

initializeFirebaseAdmin();

export const auth = admin.auth();
export default admin;
