import admin from '../utils/firebaseAdmin.js';

/**
 * Sync Service
 * Periodically polls Firebase Authentication for new users and 
 * ensures they have a matching document in the Firestore 'users' collection.
 */

const SYNC_INTERVAL_MS = 3600000; // 1 hour (was 15s — exhausted the free Firestore read quota)
let isRunning = false;
let taskRunning = false;
let quotaPauseUntil = 0;

export const startUserSyncWorker = () => {
    if (isRunning) return;
    isRunning = true;

    if (!admin.apps || admin.apps.length === 0) {
        console.warn('[SyncWorker] Firebase Admin is not initialized (no service account credentials found). Background sync worker paused.');
        return;
    }
    
    console.log('[SyncWorker] User registration monitor started (1h interval)...');
    
    // Immediate first run
    runSyncTask();
    
    // Scheduled runs
    setInterval(runSyncTask, SYNC_INTERVAL_MS);
};

const runSyncTask = async () => {
    if (!admin.apps || admin.apps.length === 0) {
        return;
    }

    if (Date.now() < quotaPauseUntil) {
        return;
    }

    if (taskRunning) {
        return;
    }
    taskRunning = true;

    try {
        const auth = admin.auth();
        const db = admin.firestore();
        const USERS_COLLECTION = 'users';

        // Fetch only the most recent 20 users from Auth to keep it efficient
        // Firebase listUsers sorts by UID, so for a true "recent" check 
        // we'd need to iterate more, but a shallow check handles most new signups.
        const listResult = await auth.listUsers(20);
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
        // Suppress uninitialized / credential errors to avoid log spam
        if (
            error.message &&
            !error.message.includes('Could not load the default credentials') &&
            !error.message.includes('The default Firebase app does not exist')
        ) {
            const quotaExhausted =
                error.code === 8 ||
                /resource exhausted/i.test(error.message || '') ||
                /quota exceeded/i.test(error.message || '');

            if (quotaExhausted) {
                quotaPauseUntil = Date.now() + 60 * 60 * 1000;
                console.error('[SyncWorker] Firestore quota exhausted (free tier). Pausing sync for 1 hour to avoid hammering the quota.');
            } else {
                console.error('[SyncWorker] Error during auto-sync:', error.message);
            }
        }
    } finally {
        taskRunning = false;
    }
};
