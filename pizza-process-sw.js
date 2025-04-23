self.addEventListener('install', (event) => {
    event.waitUntil(
      caches.open('pizza-process-v1').then((cache) => {
        return cache.addAll(['/pizza-process/manifest.json']);
      })
    );
    self.skipWaiting();
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.filter((name) => name !== 'pizza-process-v1')
            .map((name) => caches.delete(name))
        );
      })
    );
    self.clients.claim();
  });

  self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    if (url.pathname.endsWith('pizza_process.html')) {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match(event.request);
        })
      );
    } else {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request).then((networkResponse) => {
            return caches.open('pizza-process-v1').then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          });
        })
      );
    }
  });