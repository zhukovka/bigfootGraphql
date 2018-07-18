const CACHE_NAME = "bigfoot-cache-v1";
const CACHED_URLS = [
    // Our HTML
    "/index.html",
    // Stylesheets
    // JavaScript
    // Images
    // JSON
];
self.addEventListener("install", function (event) {
    // Cache everything in CACHED_URLS. Installation fails if anything fails to cache
    event.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CACHED_URLS);
        })
    );
});

self.addEventListener("fetch", function (event) {
    let request = event.request;
    const requestURL = new URL(request.url);
    // Handle requests for index.html
    if (requestURL.pathname === "/" || requestURL.pathname === "/index.html") {
        let path = "/index.html";
        event.respondWith(cacheToNetwork(path));
    }
    // Handle requests for project
    else if (requestURL.pathname.includes("/api/project")) {
        event.respondWith(networkToCache(request));
    }
    // Handle requests for videos
    else if (requestURL.pathname.includes("/api/videos")) {
        event.respondWith(cacheToNetwork(request));
    }
});

/**
 * cache, falling back to network with frequent updates
 * Any changes to the resource fetched from the network
 * will be available the next time the user requests this resource
 * @param request
 * @returns {Promise<Response>}
 */
function cacheToNetwork (request) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return cache.match(request).then(function (cachedResponse) {
            const fetchPromise = fetch(request).then(function (networkResponse) {
                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
            return cachedResponse || fetchPromise;
        });
    })
}

/**
 * network, falling back to cache with frequent updates
 * attempts to fetch the latest version from the network,
 * falling back to the cached version only if the network request fails
 * @param path
 * @returns {Promise<Response>}
 */
function networkToCache (path) {
    return caches.open(CACHE_NAME).then(function (cache) {
        return fetch(path).then(function (networkResponse) {
            cache.put(path, networkResponse.clone());
            return networkResponse;
        }).catch(function () {
            return caches.match(path);
        });
    })
}