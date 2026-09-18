import { getApiBaseUrl } from './apiConfig';
import { User } from 'firebase/auth';

const SW_PATH = `${import.meta.env.BASE_URL}sw.js`;
const PROMPT_PREFIX = 'ui-hub-push-prompt-';

export const pushPromptStorageKey = (uid: string) => `${PROMPT_PREFIX}${uid}`;

export const isPushSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

export const getPushPermission = (): NotificationPermission => {
  if (!isPushSupported()) return 'denied';
  return Notification.permission;
};

const detectPlatform = (ua: string): string => {
  if (/Android/i.test(ua)) return 'android';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
  if (/Windows/i.test(ua)) return 'windows';
  if (/Linux/i.test(ua)) return 'linux';
  return 'unknown';
};

const detectDevice = (ua: string): string => {
  if (/Mobi|Android|iPhone|iPad/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
};

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  try {
    const registration = await navigator.serviceWorker.register(SW_PATH);
    return registration;
  } catch (err) {
    console.warn('[Push] Service worker registration failed:', err);
    return null;
  }
}

async function getVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/config/push-vapid`);
    if (!response.ok) return null;
    const config = await response.json();
    return config?.vapidPublicKey || null;
  } catch (err) {
    console.warn('[Push] Failed to fetch VAPID key:', err);
    return null;
  }
}

async function sendSubscriptionToBackend(
  user: User,
  subscription: PushSubscription,
): Promise<boolean> {
  try {
    const idToken = await user.getIdToken();
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/push-subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        email: user.email,
        subscription: subscription.toJSON(),
        device: detectDevice(navigator.userAgent),
        platform: detectPlatform(navigator.userAgent),
      }),
    });
    return response.ok;
  } catch (err) {
    console.warn('[Push] Failed to register subscription on backend:', err);
    return false;
  }
}

/**
 * Full opt-in flow: asks permission, subscribes, and stores the subscription
 * on the backend so announcements can reach this device.
 */
export async function requestPushPermission(
  user: User,
): Promise<'granted' | 'denied' | 'unsupported' | 'unavailable'> {
  if (!isPushSupported()) return 'unsupported';

  const existing = getPushPermission();
  if (existing === 'denied') return 'denied';

  let permission: NotificationPermission = existing;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }
  if (permission !== 'granted') return 'denied';

  const vapidKey = await getVapidPublicKey();
  if (!vapidKey) return 'unavailable';

  const registration = (await registerServiceWorker()) ?? (await navigator.serviceWorker.ready);
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vaporUrlB64ToUint8Array(vapidKey),
    });

    const saved = await sendSubscriptionToBackend(user, subscription);
    if (!saved) return 'unavailable';
    return 'granted';
  } catch (err) {
    console.warn('[Push] Subscription failed:', err);
    return 'unavailable';
  }
}

function vaporUrlB64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}