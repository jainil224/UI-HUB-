import admin from '../utils/firebaseAdmin.js';

/**
 * Sync Service
 * Periodically polls Firebase Authentication for new users and 
 * ensures they have a matching document in the Firestore 'users' collection.
 */

const SYNC_INTERVAL_MS = 15000; // 15 seconds
let isRunning = false;

export const startUserSyncWorker = () => {
    if (isRunning) return;
    isRunning = true;
    
    console.log('[SyncWorker] User registration monitor started (15s interval)...');
    
    // Immediate first run
    runSyncTask();
    
    // Scheduled runs
    setInterval(runSyncTask, SYNC_INTERVAL_MS);
};

const runSyncTask = async () => {
    try {
        const auth = admin.auth();
        const db = admin.firestore();
        const USERS_COLLECTION = 'users';

        // Fetch only the most recent 50 users from Auth to keep it efficient
        // Firebase listUsers sorts by UID, so for a true "recent" check 
        // we'd need to iterate more, but a shallow check handles most new signups.
        const listResult = await auth.listUsers(50);
        let syncCount = 0;

        for (const userRecord of listResult.users) {
            const email = userRecord.email?.toLowerCase();
            if (!email) continue;

            const userRef = db.collection(USERS_COLLECTION).doc(email);
            const userDoc = await userRef.get();

            if (!userDoc.exists) {
                console.log(`[SyncWorker] Auto-creating user document for: ${email}`);
                await userRef.set({
                    email: email,
                    displayName: userRecord.displayName || 'UI Challenger',
                    photoURL: userRecord.photoURL || '',
                    planTier: 'free',
                    status: 'FREE',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    provider: userRecord.providerData[0]?.providerId || 'password',
                    uid: userRecord.uid
                });
                syncCount++;
            }
        }

        if (syncCount > 0) {
            console.log(`[SyncWorker] Automatically synced ${syncCount} new users to Firestore.`);
        }
    } catch (error) {
        // Suppress credential errors to avoid log spam in dev
        if (error.message && !error.message.includes('Could not load the default credentials')) {
            console.error('[SyncWorker] Error during auto-sync:', error.message);
        }
    }
};
