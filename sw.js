const CACHE_NAME = 'calorie-pwa-v1';
const OFFLINE_URLS = [
  './',
  './index.html',
  './manifest.webmanifest'
];

// Install: cache core files
self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(keys =>
          Promise.all(
              keys
                  .filter(key => key !== CACHE_NAME)
                  .map(key => caches.delete(key))
          )
      )
  );
  self.clients.claim();
});

// Fetch: cache-first with network fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request)
            .then(response => {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, copy);
              });
              return response;
            })
            .catch(() => {
              // fallback to main page if offline
              return caches.match('./index.html');
            });
      })
  );
});
