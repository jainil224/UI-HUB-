import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  let serviceAccount;

  if (raw) {
    try {
      const cleanRaw = raw.trim();
      serviceAccount = JSON.parse(
        cleanRaw.startsWith('{') ? cleanRaw : Buffer.from(cleanRaw, 'base64').toString('utf8')
      );
    } catch (parseErr) {
      console.error('[FirebaseAdmin] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', parseErr.message);
    }
  } else {
    // Attempt to load from local service-account.json for local development
    try {
      const __dirname = fileURLToPath(new URL('.', import.meta.url));
      const filePath = join(__dirname, '../../service-account.json');
      const fileData = readFileSync(filePath, 'utf8');
      serviceAccount = JSON.parse(fileData);
      console.log('[FirebaseAdmin] Loaded credentials from local service-account.json');
    } catch (fileErr) {
      // Silently fail if file doesn't exist, as we might be in production
      if (fileErr.code !== 'ENOENT') {
        console.error('[FirebaseAdmin] Error reading local service-account.json:', fileErr.message);
      }
    }
  }

  if (serviceAccount && serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  if (!serviceAccount || !serviceAccount.project_id) {
    console.error('[FirebaseAdmin] Failed to extract project_id. Vercel env variable/local file is likely malformed or missing!');
    serviceAccount = null; 
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
      admin.initializeApp({ projectId: projectId || 'ui-hub-dev' });
      console.log('[FirebaseAdmin] Initialized in local dev mode with project ID:', projectId || 'ui-hub-dev');
    }
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization error:', error);
  }
}

initializeFirebaseAdmin();
// Removed top-level export const auth = admin.auth(); to prevent boot crash
export default admin;
