const CACHE_NAME = 'locos-dardos-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/anotador',
  '/torneos',
  '/perfil',
  '/tienda',
  '/ranking',
  '/manifest.json',
  '/logos/logo-mdq.png',
  '/logos/dardos-argentina.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('Cache pre-fetch partial failure', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  // Bypass cache para Next.js internals, hot reload y endpoints API
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('webpack') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Stale-while-revalidate for local static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
