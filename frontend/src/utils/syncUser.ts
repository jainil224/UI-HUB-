import { User } from 'firebase/auth';
import { getApiBaseUrl } from './apiConfig';

export async function syncUserWithBackend(user: User): Promise<void> {
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
        name:  user.displayName || 'UI Challenger',
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
