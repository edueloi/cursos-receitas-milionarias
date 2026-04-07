/* RM Academy Service Worker — v2 */
const CACHE_NAME = 'rm-academy-cache-v2';

// Só faz cache dos arquivos base (não JS com hash — esses mudam a cada build)
const PRECACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', (event) => {
  // Ativa imediatamente sem esperar aba fechar
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
});

self.addEventListener('activate', (event) => {
  // Remove caches antigos de versões anteriores
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network first: sempre busca da rede, usa cache só se offline
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET ou que sejam de API
  if (event.request.method !== 'GET') return;
  if (event.request.url.includes('/api/')) return;

  // Para JS/CSS com hash no nome, nunca usa cache (podem mudar a cada build)
  const url = new URL(event.request.url);
  const isHashed = /\.[a-f0-9]{8,}\.(js|css)$/.test(url.pathname);
  if (isHashed) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para o resto: network first, fallback no cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
