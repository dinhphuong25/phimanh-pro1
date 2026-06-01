// Service Worker for PWA and Offline Support
const CACHE_NAME = 'rap-phim-chill-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const IMAGE_CACHE = 'images-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            console.log('Service Worker: Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE && cache !== IMAGE_CACHE) {
                        console.log('Service Worker: Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') return;

    // Skip external requests (except images from phimimg.com)
    if (url.origin !== location.origin && !url.hostname.includes('phimimg.com')) {
        return;
    }

    // Image caching strategy - Cache first, then network
    if (request.destination === 'image' || url.hostname.includes('phimimg.com')) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(request).then((response) => {
                    // Don't cache if not successful
                    if (!response || response.status !== 200) {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(IMAGE_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                });
            }).catch(() => {
                // Return placeholder image if offline
                return new Response(
                    '<svg width="400" height="600" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="600" fill="#1a1a2e"/><text x="50%" y="50%" fill="#fff" text-anchor="middle">Offline</text></svg>',
                    { headers: { 'Content-Type': 'image/svg+xml' } }
                );
            })
        );
        return;
    }

    // Page caching strategy - Network first, fallback to cache
    event.respondWith(
        fetch(request)
            .then((response) => {
                // Don't cache if not successful
                if (!response || response.status !== 200) {
                    return response;
                }

                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE).then((cache) => {
                    cache.put(request, responseClone);
                });

                return response;
            })
            .catch(() => {
                return caches.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    // Return offline page
                    if (request.mode === 'navigate') {
                        return caches.match('/offline');
                    }
                });
            })
    );
});

// Background sync for failed requests
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync', event.tag);
    if (event.tag === 'sync-views') {
        event.waitUntil(syncViewHistory());
    }
});

async function syncViewHistory() {
    // Sync view history when back online
    console.log('Syncing view history...');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
    const data = event.data ? event.data.json() : {};
    const title = data.title || 'Phim mới cập nhật!';
    const options = {
        body: data.body || 'Xem ngay các bộ phim mới nhất',
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        vibrate: [200, 100, 200],
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
