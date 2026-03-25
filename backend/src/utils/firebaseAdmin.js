import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error('[FirebaseAdmin] CRITICAL: VITE_FIREBASE_PROJECT_ID is not defined in environment variables!');
}

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: projectId,
    });
    console.log(`[FirebaseAdmin] Initialized for project: ${projectId}`);
  } catch (error) {
    console.error('[FirebaseAdmin] Initialization error:', error);
  }
}

export const auth = admin.auth();
export default admin;
