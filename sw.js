const CACHE_NAME = 'dsh-dart-v2'; // Erhöht auf v2 gegen blockierte Updates
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installieren des Service Workers und Dateien in den Cache laden
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

// Dateien aus dem Cache laden (Mit direkter Live-Ausnahme für GitHub-Textdateien)
self.addEventListener('fetch', (event) => {
  // WICHTIG: Wenn der Aufruf an GitHub geht, lass den Service Worker komplett die Finger davon lassen!
  if (event.request.url.includes('://githubusercontent.com')) {
    return; // Lädt die Daten direkt live und unverändert aus dem Internet
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
