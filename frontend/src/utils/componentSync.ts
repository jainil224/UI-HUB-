import { getApiBaseUrl } from './apiConfig';

const SYNC_STORAGE_KEY = 'ui-hub-components-synced-ts';
const SYNC_INTERVAL_HOURS = 1; // sync at most once per hour per browser session

/**
 * Non-blocking background sync of components from the website to MongoDB Atlas.
 */
export async function triggerBackgroundComponentSync(): Promise<void> {
  try {
    const lastSync = localStorage.getItem(SYNC_STORAGE_KEY);
    const now = Date.now();

    if (lastSync) {
      const elapsedHours = (now - parseInt(lastSync, 10)) / (1000 * 60 * 60);
      if (elapsedHours < SYNC_INTERVAL_HOURS) {
        return; // Already synced recently
      }
    }

    const apiBaseUrl = getApiBaseUrl();
    const res = await fetch(`${apiBaseUrl}/api/v1/components/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      localStorage.setItem(SYNC_STORAGE_KEY, String(now));
      console.log('[ComponentSync] Components synced to MongoDB Atlas successfully.');
    }
  } catch (err) {
    // Non-critical background task
  }
}
