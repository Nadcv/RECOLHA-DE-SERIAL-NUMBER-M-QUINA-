// Guarda a aplicação no telemóvel para abrir mesmo sem rede.
// Ao mudar algum ficheiro, aumentar a versão abaixo.
const CACHE = 'seriais-v1.5.0';
const FICHEIROS = ['./', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
  './vendor/zxing.min.js', './icons/logo-cablotec.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Pedidos ao Apps Script vão sempre à rede
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Rede primeiro (para receber atualizações); sem rede usa a cópia guardada
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).then(r => {   // ignora a cache do browser (o GitHub guarda 10 min)
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put(e.request, copia));
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
