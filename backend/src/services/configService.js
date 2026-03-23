/**
 * Config Service
 * Provides public configuration to the frontend at runtime.
 */
import dotenv from 'dotenv';
dotenv.config();

/**
 * Returns the public Firebase configuration.
 * @returns {object}
 */
export const getFirebaseConfig = () => {
    return {
        apiKey: process.env.VITE_FIREBASE_API_KEY,
        authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.VITE_FIREBASE_APP_ID,
        measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
    };
};
