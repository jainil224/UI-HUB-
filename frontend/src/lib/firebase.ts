import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAnalytics, Analytics } from "firebase/analytics";

let app: FirebaseApp;
export let auth: Auth;
export let storage: FirebaseStorage;
export let analytics: Analytics;

/**
 * Initializes Firebase with a provided configuration.
 * @param config {object}
 */
export const initFirebase = (config: any) => {
    if (app) return; // Already initialized
    
    app = initializeApp(config);
    auth = getAuth(app);
    
    // Set local persistence to ensure user session survives redirects and browser reloads
    if (typeof window !== 'undefined') {
        setPersistence(auth, browserLocalPersistence).catch(err => {
            console.error('[Auth] Failed to set persistence:', err);
        });
    }

    storage = getStorage(app);
    
    if (typeof window !== 'undefined') {
        // Skip Analytics on mobile to avoid Android's "wants to access other apps" popup
        const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        if (!isMobile) {
            try {
                analytics = getAnalytics(app);
            } catch (e) {
                console.warn('Analytics initialization failed:', e);
            }
        }
    }
};

// For backward compatibility while we refactor main.tsx
// It will be initialized correctly in main.tsx before rest of app runs
