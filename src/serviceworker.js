const CACHE_NAME = "bigfoot-cache";
const CACHED_URLS = ["/images/bigfoot-silhouette.jpg"];

console.log("serviceworker hello");

self.addEventListener("install", function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CACHED_URLS);
        })
    );
});

self.addEventListener("fetch", function (event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.match(event.request).then(function (cachedResponse) {
                const fetchPromise =
                    fetch(event.request).then(function (networkResponse) {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                return cachedResponse || fetchPromise;
            });
        })
    );
});