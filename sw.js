const CACHE_NAME = 'dsh-dart-v3'; // Erhöht auf v3, um den alten Fehler-Cache zu überschreiben
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installieren des Service Workers
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Cache aktivieren und alte Versionen löschen
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Dateien abfangen und laden
self.addEventListener('fetch', (event) => {
  // KORREKTUR: Wenn es ein GitHub-Raw-Link ist, jage ihn direkt und ohne Cache live ins Internet!
  if (event.request.url.includes('raw.githubusercontent.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Für alle normalen App-Dateien (HTML, Icons) nimm den Cache
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
