const CACHE_NAME = 'dsh-dart-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './spieler.txt'
];

// 1. Dateien beim Installieren in den Cache laden
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Alten Cache löschen, wenn sich die Version ändert
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
    }).then(() => self.clients.claim())
  );
});

// 3. WICHTIG FÜR ANDROID: Anfragen abfangen und Offline-Bereitschaft signalisieren
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Gibt die Datei aus dem Cache zurück, falls vorhanden, andernfalls aus dem Netzwerk
      return cachedResponse || fetch(event.request).catch(() => {
        // Falls komplett offline und nicht im Cache
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});

