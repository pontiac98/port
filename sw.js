const CORE_CACHE = 'gallery-core-v1';
const IMAGE_CACHE = 'gallery-images-v1';

// 1. Øðèôòû è ñòðàíèöó ñêà÷èâàåì ÑÐÀÇÓ ïðè óñòàíîâêå ïðèëîæåíèÿ
const ASSETS = [
  './',
  './index.html',
  './m-plus-1p.woff2',    // Åñëè ëåæàò â ïàïêå, çàìåíèòå íà '/fonts/m-plus-1p.woff2'
  './dotgothic16.woff2'   // Åñëè ëåæàò â ïàïêå, çàìåíèòå íà '/fonts/dotgothic16.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Àêòèâèðóåì íîâûé ñåðâèñ-âîðêåð ñðàçó
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // Íà÷èíàåì óïðàâëÿòü ñòðàíèöåé íåìåäëåííî
});

// 2. ÏÅÐÅÕÂÀÒ ÇÀÏÐÎÑÎÂ: âûäàåì ôàéëû èç êýøà, à êàðòèíêè ñîõðàíÿåì íà ëåòó
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Åñëè ôàéë (ñòðàíèöà, øðèôò èëè óæå âèäåííàÿ êàðòèíêà) åñòü â êýøå — îòäàåì ñðàçó
      if (cachedResponse) {
        return cachedResponse;
      }

      // Åñëè ôàéëà íåò â êýøå, èäåì â ñåòü
      return fetch(e.request).then((networkResponse) => {
        // Ïðîâåðÿåì, îòíîñèòñÿ ëè çàïðîñ ê âàøèì ïàïêàì ñ êàðòèíêàìè
        const isGalleryImage = e.request.url.includes('/images1/') || 
                               e.request.url.includes('/images2/') || 
                               e.request.url.includes('/images3/');

        // Åñëè ýòî êàðòèíêà è ñåðâåð îòâåòèë óñïåøíî, ñîõðàíÿåì å¸ â êýø
        if (isGalleryImage && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }

        return networkResponse;
      });
    })
  );
});
