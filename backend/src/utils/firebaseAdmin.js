import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

export const auth = admin.auth();
export default admin;
