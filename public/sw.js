const CACHE = "pix-tips-v4";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/widget/")) return;

  const headers = new Headers(event.request.headers);
  headers.set("ngrok-skip-browser-warning", "1");

  event.respondWith(
    fetch(new Request(event.request, { headers })).catch(() =>
      caches.open(CACHE).then((c) => c.match(event.request)),
    ),
  );
});
