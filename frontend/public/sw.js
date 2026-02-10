/* eslint-disable no-restricted-globals */

const CACHE_NAME = 'smart-edu-v2';
const STATIC_CACHE = 'smart-edu-static-v2';
const API_CACHE = 'smart-edu-api-v2';

// Static assets to pre-cache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// API routes we want to cache for offline use
const CACHEABLE_API_ROUTES = [
  '/api/courses',
  '/api/materials',
  '/api/progress',
  '/api/revisions',
  '/api/gamification'
];

// Install — pre-cache shell (individual adds so one failure doesn't block others)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return Promise.all(
        PRECACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('SW: failed to precache', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [STATIC_CACHE, API_CACHE, CACHE_NAME];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => !currentCaches.includes(key))
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Network-first for API, Cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // API requests — network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    const isCacheable = CACHEABLE_API_ROUTES.some((route) =>
      url.pathname.startsWith(route)
    );

    if (isCacheable) {
      event.respondWith(
        fetch(request)
          .then((response) => {
            // Clone and cache successful responses
            if (response.ok) {
              const cloned = response.clone();
              caches.open(API_CACHE).then((cache) => cache.put(request, cloned));
            }
            return response;
          })
          .catch(() => {
            // Offline — serve from cache
            return caches.match(request).then((cached) => {
              if (cached) return cached;
              return new Response(
                JSON.stringify({ offline: true, message: 'You are offline. Showing cached data.' }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            });
          })
      );
      return;
    }
  }

  // For navigation requests (page loads/refreshes) — try network, fallback to cached index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache the navigation response as both the URL and /index.html
          const cloned1 = response.clone();
          const cloned2 = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, cloned1);
            // Also cache as /index.html so offline fallback always works
            cache.put(new Request('/index.html'), cloned2);
          });
          return response;
        })
        .catch(() => {
          // Try the exact URL first, then /index.html, then /
          return caches.match(request)
            .then((cached) => cached || caches.match('/index.html'))
            .then((cached) => cached || caches.match('/'))
            .then((cached) => {
              return cached || new Response(
                '<!DOCTYPE html><html><body><h2>You are offline</h2><p>Please connect to the internet and reload.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' }, status: 503 }
              );
            });
        })
    );
    return;
  }

  // Static assets (JS, CSS, images, fonts) — cache-first, then network
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Cache all same-origin static assets (includes hashed build files)
          if (response.ok && url.origin === self.location.origin) {
            const cloned = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, cloned));
          }
          return response;
        })
        .catch(() => {
          return new Response('Offline', { status: 503 });
        });
    })
  );
});

// Listen for messages from the app (e.g., force-cache specific content)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_URLS') {
    const urls = event.data.urls || [];
    event.waitUntil(
      caches.open(API_CACHE).then((cache) =>
        Promise.all(
          urls.map((url) =>
            fetch(url, { headers: { Authorization: event.data.token ? `Bearer ${event.data.token}` : '' } })
              .then((res) => {
                if (res.ok) cache.put(url, res);
              })
              .catch(() => {})
          )
        )
      )
    );
  }

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
