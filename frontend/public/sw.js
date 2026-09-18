/* UI-HUB Service Worker — Web Push notifications for new component announcements */
const VERSION = 'uihub-push-v1';
const ICON = '/android-chrome-192x192.png';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((name) => name !== VERSION && name.startsWith('uihub-'))
          .map((name) => caches.delete(name))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = event.data ? { body: event.data.text() } : {};
  }

  const title = data.title || 'UI-HUB';
  const url = data.url || '/library';

  const options = {
    body: data.body || 'New components dropped — come check what’s new!',
    icon: data.icon || ICON,
    badge: data.badge || '/favicon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      url,
      ...(data.data || {}),
    },
    actions: [
      {
        action: 'open',
        title: 'Explore new components',
      },
      {
        action: 'close',
        title: 'Dismiss',
      },
    ],
  };

  if (data.image) options.image = data.image;

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/library';
  const action = event.action;

  if (action === 'close') return;

  event.waitUntil(
    (async () => {
      const url = new URL(targetUrl, self.location.origin);
      const allClients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      for (const client of allClients) {
        if ('focus' in client) {
          await client.navigate(url.toString());
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(url.toString());
      }
    })()
  );
});

self.addEventListener('notificationclose', (event) => {
  // Fired when the user dismisses the notification on purpose.
});