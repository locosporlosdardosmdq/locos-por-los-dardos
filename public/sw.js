const CACHE_NAME = 'locos-dardos-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/logos/logo-mdq.png',
  '/logos/dardos-argentina.png',
  '/images/iceman-perfil.png',
  '/logos/logo-iceman-card.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Cache pre-fetch parcial:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => {
          console.log('[SW] Purgando caché desactualizado:', key);
          return caches.delete(key);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Solo peticiones GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cache para internals de Next.js, hot reload y endpoints API
  if (
    url.pathname.startsWith('/_next/') || 
    url.pathname.startsWith('/api/') || 
    url.pathname.includes('webpack') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // 1. ESTRATEGIA NETWORK-FIRST PARA NAVEGACIÓN (Páginas HTML):
  // Garantiza que tras cada despliegue en Vercel, el navegador reciba siempre el HTML
  // con los hashes CSS/JS actualizados y nunca un HTML viejo que cause 404 en los estilos.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Si estamos offline, usar versión cacheada
          return caches.match(event.request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // 2. STALE-WHILE-REVALIDATE PARA RECURSOS ESTÁTICOS LOCALES (imágenes, logos, sonidos)
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
