const CACHE_NAME = 'athlete-os-v26';

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
  './js/services/garminTrend.js',
  './js/services/garminCoach.js',
  './js/services/campaignReview.js',
  './js/services/garminChart.js',
  './js/services/progressionCoach.js',
  './js/services/backupSnapshot.js',
  './js/services/backupScheduler.js',
  './assets/audio/rest-complete.wav',
  './assets/audio/workout%20complete/mission-accomplished.mp3',
  './assets/audio/workout%20complete/red-alert2-victory.mp3',
  './assets/audio/workout%20complete/mission-accomplished-well-done-toy-story-disney-sergeant-r-lee-ermey-good-job-success-complete.mp3',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

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
