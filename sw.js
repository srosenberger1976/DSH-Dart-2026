const CACHE_NAME = 'dsh-dart-v5'; // Auf v5 erhöht, damit iOS den neuen Cache lädt
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './html2canvas.min.js'
];

// Installieren des Service Workers & Offline-Speichern aller Dateien inkl. JPEG-Tool
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Cache aktivieren und alte Versionen (v4 und älter) löschen
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
  // Spielerliste und Spielplan immer frisch aus dem Netz laden (und bei Empfang als Backup merken)
  if (
    event.request.url.includes('spieler.txt') ||
    event.request.url.includes('spielplan.txt') ||
    event.request.url.includes('githubusercontent.com')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Für alle App-Dateien (HTML, Icons, html2canvas) zuerst den Offline-Cache nutzen
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});
