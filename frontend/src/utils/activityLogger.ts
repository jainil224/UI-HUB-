import { auth } from '../lib/firebase';
import { getApiBaseUrl } from './apiConfig';

export interface ActivityPayload {
  type: string;
  metadata?: Record<string, any>;
  level?: 'info' | 'warn' | 'error' | 'success';
}

/**
 * Sends a non-blocking activity event to the backend to be stored in MongoDB activity_logs.
 */
export async function logUserActivity({ type, metadata = {}, level = 'info' }: ActivityPayload): Promise<void> {
  try {
    const apiBaseUrl = getApiBaseUrl();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    let userEmail: string | undefined;
    let userId: string | undefined;

    const currentUser = auth.currentUser;
    if (currentUser) {
      userEmail = currentUser.email || undefined;
      userId = currentUser.uid;
      try {
        const token = await currentUser.getIdToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        // Continue even if token fetch fails
      }
    }

    await fetch(`${apiBaseUrl}/api/v1/users/activity`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        type,
        email: userEmail,
        userId,
        level,
        metadata: {
          ...metadata,
          path: typeof window !== 'undefined' ? window.location.pathname : '',
          timestamp: Date.now(),
        },
      }),
      // Keep request alive if page unloads
      keepalive: true,
    });
  } catch (err) {
    // Non-critical background telemetry
  }
}
