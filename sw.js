/* COLOMBIA REALS — service worker actualizado para evitar versiones antiguas.
   HTML/CSS/JS/config: red primero. Imágenes y recursos estables: caché primero.
   Nunca intercepta API, Discord ni peticiones que no sean GET. */
const CACHE_VERSION = 'cr-netlify-v31-20261116';
const PRECACHE = [
  'assets/index.min.css','assets/index.min.js',
  'assets/facciones.min.css','assets/facciones.min.js',
  'assets/config.js','assets/logo-cr.webp','assets/banner.webp',
  'manifest.webmanifest','assets/icon-192.png',
  'assets/evento-navidad.css','assets/evento-navidad.js',
  'assets/arbol-navidad.webp','assets/pro.css','assets/pro.js',
  'assets/pedido.css','assets/pedido.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(PRECACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE_VERSION).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' ||
      url.origin !== self.location.origin ||
      url.pathname.startsWith('/api/') ||
      /^\/(generador|panel|admin-login|staff)(\/|$)/.test(url.pathname) ||
      request.headers.has('range')) return;

  const isNavigation = request.mode === 'navigate';
  const isMutable = isNavigation || /\.(?:html|css|js|mjs|json|webmanifest)$/i.test(url.pathname);

  if (isMutable) {
    // Evita servir HTML/CSS/JS viejos: intenta siempre la versión publicada.
    event.respondWith(
      fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => caches.match(request).then(cached => {
        if (cached) return cached;
        if (isNavigation) return caches.match('/index.html');
        return Response.error();
      }))
    );
    return;
  }

  // Imágenes y otros recursos estables: respuesta rápida desde caché y actualización.
  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
