import { User } from 'firebase/auth';
import { getApiBaseUrl } from './apiConfig';

const DISPLAY_NAME_WAIT_TIMEOUT_MS = 4000;
const DISPLAY_NAME_POLL_INTERVAL_MS = 250;

/**
 * Email/password signups fire onAuthStateChanged before updateProfile() lands,
 * so displayName can still be null right after account creation. Poll briefly
 * until the real name appears so the backend welcome emails use the correct name.
 */
async function waitForDisplayName(user: User): Promise<string | null> {
  if (user.displayName) return user.displayName;

  const deadline = Date.now() + DISPLAY_NAME_WAIT_TIMEOUT_MS;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, DISPLAY_NAME_POLL_INTERVAL_MS));
    try {
      await user.reload();
    } catch {
      // Transient token/network errors — keep polling until the deadline
    }
    if (user.displayName) return user.displayName;
  }

  return user.displayName || null;
}

export async function syncUserWithBackend(user: User): Promise<void> {
  // Email/password signups: wait briefly for updateProfile to provide the real name
  const resolvedName = (await waitForDisplayName(user)) || 'UI Challenger';

  // Wait for a fresh token — do NOT use cached token
  let idToken: string;
  try {
    idToken = await user.getIdToken(true); // force refresh
  } catch (err) {
    console.error('[SYNC] Failed to get ID token:', err);
    return;
  }

  const apiBaseUrl = getApiBaseUrl();

  try {
    const response = await fetch(`${apiBaseUrl}/api/v1/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email: user.email,
        name:  resolvedName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[SYNC] Backend sync failed:', response.status, errorData);
      return;
    }

    const data = await response.json();
    console.log('[SYNC] User synced successfully:', data);

  } catch (err) {
    // Network error or CORS — log but don't crash the app
    console.error('[SYNC] Network error during sync:', err);
  }
}
