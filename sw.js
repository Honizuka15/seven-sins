// Service worker : rend la version web installable et jouable hors connexion.
// Réseau d'abord (toujours la dernière version), cache en secours.
const CACHE = "sevensins-v1";
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
    .catch(() => caches.match(req).then(r => r || caches.match("./"))));
});
