const CACHE_NAME = "adminnoapp-static-v2";
const STATIC_ASSETS = [
  "/",
  "/icons/icon-adminnoapp-192.png",
  "/icons/icon-adminnoapp-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/")));
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then((cachedResponse) => cachedResponse || fetch(request)),
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data ? event.data.text() : "" };
  }

  const title = payload.title || "Nova loja cadastrada";
  const options = {
    body: payload.body || "Um novo lojista acabou de criar uma conta.",
    icon: "/icons/icon-adminnoapp-192.png",
    badge: "/icons/icon-adminnoapp-192.png",
    data: { url: payload.url || "/dashboard?section=lojas&storeOrder=new&storePage=1" },
    tag: "nova-loja-cadastrada",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const destination = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (existing) return existing.focus();
      return clients.openWindow(destination);
    }),
  );
});
