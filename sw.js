const CACHE = 'dickkicker-v10';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './assets/foot.png',
  './assets/dick.jpg',
  './src/phaser-global.js',
  './src/main.js',
  './src/audio/AudioEngine.js',
  './src/utils/makePixelTexture.js',
  './src/config/sprites.js',
  './src/config/levels.js',
  './src/scenes/BootScene.js',
  './src/scenes/MenuScene.js',
  './src/scenes/GameScene.js',
  './src/scenes/GameOverScene.js',
  './src/entities/Player.js',
  './src/entities/FallObject.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetched = fetch(event.request).then((response) => {
        if (response && response.status === 200 && event.request.url.startsWith(self.location.origin)) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return response;
      }).catch(() => cached);

      return cached || fetched;
    })
  );
});
