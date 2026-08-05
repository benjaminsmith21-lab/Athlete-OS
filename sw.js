const CACHE_NAME = 'athlete-os-v13';

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/app.css',
  './js/app.js',
  './js/db.js',
  './js/utils/datetime.js',
  './js/seed/blueprint-v1.js',
  './js/services/campaign.js',
  './js/services/mission.js',
  './js/services/coach.js',
  './js/services/integrity.js',
  './js/services/settings.js',
  './js/services/heatmap.js',
  './js/services/bodyMeasurement.js',
  './js/services/bodyTrend.js',
  './js/services/bodyCoach.js',
  './js/services/bodyChart.js',
  './js/services/backup.js',
  './js/services/garminImport.js',
  './assets/audio/rest-complete.wav',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
