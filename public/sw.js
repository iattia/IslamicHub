const VERSION = "islamichub-v2";
const APP_SHELL = ["/", "/offline"];
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(APP_SHELL)),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== VERSION)
            .map((key) => caches.delete(key)),
        ),
      ),
  ),
);
self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.pathname.startsWith("/api/reader/surahs")) {
    event.respondWith(
      caches.open(VERSION).then(async (cache) => {
        try {
          const fresh = await fetch(request);
          cache.put(request, fresh.clone());
          return fresh;
        } catch {
          return (
            (await cache.match(request)) ||
            new Response(
              JSON.stringify({
                error: "This chapter is not available offline.",
              }),
              { status: 503, headers: { "content-type": "application/json" } },
            )
          );
        }
      }),
    );
  }
});
