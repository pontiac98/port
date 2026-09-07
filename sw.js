const CORE_CACHE = 'gallery-core-v1';
const IMAGE_CACHE = 'gallery-images-v1';

// 1. Шрифты и страницу скачиваем СРАЗУ при установке приложения
const ASSETS = [
  '/',
  '/index.html',
  '/m-plus-1p.woff2',    // Если лежат в папке, замените на '/fonts/m-plus-1p.woff2'
  '/dotgothic16.woff2'   // Если лежат в папке, замените на '/fonts/dotgothic16.woff2'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CORE_CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Активируем новый сервис-воркер сразу
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim()); // Начинаем управлять страницей немедленно
});

// 2. ПЕРЕХВАТ ЗАПРОСОВ: выдаем файлы из кэша, а картинки сохраняем на лету
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // Если файл (страница, шрифт или уже виденная картинка) есть в кэше — отдаем сразу
      if (cachedResponse) {
        return cachedResponse;
      }

      // Если файла нет в кэше, идем в сеть
      return fetch(e.request).then((networkResponse) => {
        // Проверяем, относится ли запрос к вашим папкам с картинками
        const isGalleryImage = e.request.url.includes('/images1/') || 
                               e.request.url.includes('/images2/') || 
                               e.request.url.includes('/images3/');

        // Если это картинка и сервер ответил успешно, сохраняем её в кэш
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
