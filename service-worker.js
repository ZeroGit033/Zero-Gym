const CACHE_NAME = 'louis-workout-v1';
const assets = [
  './',
  './index.html',
  './style.css',
  './script.js',
  'https://cdn-icons-png.flaticon.com/512/2554/2554032.png'
];

// Install Service Worker
self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(assets);
    })
  );
});

// Fetching assets
self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(cacheRes => {
      return cacheRes || fetch(evt.request);
    })
  );
});