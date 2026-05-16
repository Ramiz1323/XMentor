import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

const APP_VERSION = 'v1_1_0';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/') && !url.pathname.includes('/auth/'),
  new StaleWhileRevalidate({
    cacheName: `xmentor-api-cache-${APP_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 Hours
      }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.includes('/api/user/profile'),
  new NetworkFirst({
    cacheName: `xmentor-profile-cache-${APP_VERSION}`,
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// Clean up old versioned caches from previous releases on activate
self.addEventListener('activate', (event) => {
  const currentCaches = [
    `xmentor-api-cache-${APP_VERSION}`,
    `xmentor-profile-cache-${APP_VERSION}`,
  ];
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(name => name.startsWith('xmentor-') && !currentCaches.includes(name))
          .map(name => {
            console.log('[SW] Deleting stale cache:', name);
            return caches.delete(name);
          })
      )
    )
  );
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    console.log('[SW] Push Received:', data);

    const options = {
      body: data.body || 'New Tactical assessment detected.',
      icon: '/pwa-192x192.png',
      badge: '/favicon.svg',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/'
      },
      actions: [
        {
          action: 'explore',
          title: 'ESTABLISH LINK',
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'INCOMING TRANSMISSION', options)
    );
  } catch (err) {
    console.error('[SW] Push processing failed:', err);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      const url = event.notification.data.url;
      
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_TACTICAL_CACHE') {
    console.log('[SW] Burn Protocol Initiated: Clearing all caches.');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('xmentor-'))
            .map(name => caches.delete(name))
        );
      })
    );
  }
});
