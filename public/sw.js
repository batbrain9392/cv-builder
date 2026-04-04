const CACHE_NAME = 'cv-builder-v2';

const PRECACHE_URLS = ['/cv-builder/', '/cv-builder/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  // Skip external API calls (e.g. Gemini)
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || fetchPromise;
      })
      .catch(
        () => new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }),
      ),
  );
});
