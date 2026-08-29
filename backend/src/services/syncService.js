import admin from '../utils/firebaseAdmin.js';
import { getCollection } from './mongoService.js';
import { logActivity } from './activityLogService.js';

/**
 * Sync Service
 * Periodically polls Firebase Authentication for new users and
 * ensures they have a matching document in the MongoDB 'users' collection.
 */

const SYNC_INTERVAL_MS = 3600000; // 1 hour
const USERS_COLLECTION = 'users';
let isRunning = false;
let taskRunning = false;

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

  if (taskRunning) {
    return;
  }
  taskRunning = true;

  try {
    const auth = admin.auth();
    const users = await getCollection(USERS_COLLECTION);

    // Fetch only the most recent 20 users from Auth to keep it efficient
    const listResult = await auth.listUsers(20);
    let syncCount = 0;

    for (const userRecord of listResult.users) {
      const email = userRecord.email?.toLowerCase();
      if (!email) continue;

      const existing = await users.findOne({ $or: [{ _id: email }, { email }] });

      if (!existing) {
        console.log(`[SyncWorker] Auto-creating user document for: ${email}`);
        await users.updateOne(
          { _id: email },
          {
            $set: {
              _id: email,
              email: email,
              displayName: userRecord.displayName || 'UI Challenger',
              photoURL: userRecord.photoURL || '',
              planTier: 'free',
              status: 'FREE',
              createdAt: new Date(),
              updatedAt: new Date(),
              provider: userRecord.providerData[0]?.providerId || 'password',
              uid: userRecord.uid,
            },
          },
          { upsert: true }
        );
        syncCount++;
        await logActivity({
          type: 'user.created',
          userId: userRecord.uid,
          email,
          level: 'success',
          metadata: { source: 'sync_worker', provider: userRecord.providerData[0]?.providerId || 'password' },
        });
      }
    }

    if (syncCount > 0) {
      console.log(`[SyncWorker] Automatically synced ${syncCount} new users to MongoDB.`);
    }
  } catch (error) {
    if (
      error.message &&
      !error.message.includes('Could not load the default credentials') &&
      !error.message.includes('The default Firebase app does not exist')
    ) {
      console.error('[SyncWorker] Error during auto-sync:', error.message);
    }
  } finally {
    taskRunning = false;
  }
};
