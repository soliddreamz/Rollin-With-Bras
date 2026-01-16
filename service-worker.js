/* Base Pilot Service Worker (safe minimal cache)
   - caches core shell + content.json
   - does NOT add analytics or tracking
*/
const CACHE = "rollin-with-braz-v2";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./content.json",
  "./service-worker.js",
  "./assets/logo.png",
  "./assets/logo-wide.png",
  "./assets/apple-touch-icon.png",
  "./assets/icon-192x192.png",
  "./assets/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE ? caches.delete(k) : Promise.resolve())))
    ).then(() => self.clients.claim())
  );
});

// Network-first for content.json so updates appear fast
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.url.includes("/content.json")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
