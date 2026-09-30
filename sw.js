const CACHE = 'hoornbeeck-route-v9-lokaalkeuze';
const APP_SHELL = [
  './', './index.html', './styles.css', './app.js', './manifest.json', './sw.js',
  './styles.css?v=9-lokaalkeuze', './app.js?v=9-lokaalkeuze',
  './icons/icon-192.png', './icons/icon-512.png', './assets/plattegrond-4e-verdieping.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL.map(url => new Request(url, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('hoornbeeck-route-') && key !== CACHE).map(key => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Nieuwe code eerst online ophalen; bij offline gebruik blijft de laatste
  // versie beschikbaar. Zo houdt een oude cache geen oude routecode vast.
  if (url.origin === self.location.origin && url.href.startsWith(self.registration.scope)) {
    const freshCode = event.request.mode === 'navigate' || event.request.destination === 'script' || event.request.destination === 'style';
    event.respondWith(
      caches.open(CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached && !freshCode) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) {
            // Een volle cache mag het tonen van nieuwe online code niet blokkeren.
            try { await cache.put(event.request, response.clone()); } catch {}
            return response;
          }
          return cached || response;
        } catch {
          return cached || (event.request.mode === 'navigate' ? await cache.match('./index.html') : null) || Response.error();
        }
      })
    );
  }
});
