const CACHE_NAME = 'chai-catcher-v1';
const ASSETS = [
  '/',
  'index.html',
  'styles.css',
  'manifest.webmanifest',
  'js/app.js',
  'js/game.js',
  'js/renderer.js',
  'js/input.js',
  'js/objects.js',
  'js/storage.js',
  'js/audio.js',
  'js/ui.js',
  'js/settings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(ASSETS);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});