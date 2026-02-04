/**
 * Service Worker for Pedro Calado's Portfolio
 * Provides offline support and performance optimization
 * @version 1.0.0
 */

const CACHE_NAME = 'portfolio-v1.0.1';
const RUNTIME_CACHE = 'portfolio-runtime-v1.0.1';

// Static assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/accessibility-enhanced.css',
    '/css/bootstrap-replacement.css',
    '/css/repo-display-options.css',
    '/js/script.js',
    '/img/drumming_server.png',
    '/img/drumming_server16x16.png',
    '/img/drumming_server32x32.png',
    '/img/pedro_tipoGhibli_passe-320.webp',
    '/img/pedro_tipoGhibli_passe-480.webp',
    '/img/pedro_tipoGhibli_passe-640.webp',
    '/manifest.json'
];

// GitHub API URLs to cache
const GITHUB_API_PATTERN = /https:\/\/api\.github\.com\/users\/SilentCaMXMF\/repos/;

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp'];

/**
 * Install event - cache static assets with individual requests
 * Continues even if some assets fail to cache
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache) => {
                console.log('[Service Worker] Caching static assets');
                
                // Cache each asset individually to prevent addAll() from failing entirely
                const cachePromises = STATIC_ASSETS.map(async (url) => {
                    try {
                        const request = new Request(url, { cache: 'reload' });
                        const response = await fetch(request);
                        if (response.ok) {
                            await cache.put(request, response.clone());
                            console.log('[Service Worker] Cached:', url);
                        }
                    } catch (error) {
                        console.warn('[Service Worker] Failed to cache:', url, error.message);
                        // Continue without failing - this asset will be fetched from network
                    }
                });
                
                // Wait for all cache attempts to complete (but don't fail if some fail)
                await Promise.all(cachePromises);
                
                console.log('[Service Worker] Static assets caching completed');
            })
            .then(() => {
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Install error:', error);
                // Continue anyway - service worker will still work for network requests
                return self.skipWaiting();
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activated');
                return self.clients.claim();
            })
    );
});

/**
 * Helper function to check if request should be skipped
 */
function shouldSkipRequest(request) {
    const url = request.url;
    
    // Skip extension requests
    if (url.startsWith('chrome-extension://') || 
        url.startsWith('moz-extension://') || 
        url.startsWith('safari-extension://') ||
        url.startsWith('edge-extension://') ||
        url.startsWith('opera-extension://')) {
        return true;
    }
    
    // Skip non-HTTP(S) requests
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return true;
    }
    
    // Skip data URLs, blob URLs, etc.
    if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('file:')) {
        return true;
    }
    
    return false;
}

/**
 * Fetch event - handle requests with cache strategies
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return; // Let browser handle these directly
    }

    // Handle GitHub API requests with stale-while-revalidate
    if (GITHUB_API_PATTERN.test(url.href)) {
        event.respondWith(handleStaleWhileRevalidate(request));
        return;
    }

    // Handle navigation requests with network-first strategy
    if (request.mode === 'navigate') {
        event.respondWith(handleNavigationRequest(request));
        return;
    }

    // Handle static assets with network-first strategy during development
    if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
        event.respondWith(handleNetworkFirstRequest(request));
        return;
    }

    // Handle images with network-first strategy during development
    if (request.destination === 'image' || isImageRequest(url)) {
        event.respondWith(handleNetworkFirstRequest(request));
        return;
    }

    // Default to network-first for everything else
    event.respondWith(handleNetworkFirstRequest(request));
});

/**
 * Helper function to check if request is an image
 */
function isImageRequest(url) {
    return IMAGE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

/**
 * Handle navigation requests with network-first strategy
 */
async function handleNavigationRequest(request) {
    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return await fetch(request);
    }
    
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache');
        
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return offline page
        return caches.match('/');
    }
}

/**
 * Handle cache-first requests for static assets
 */
async function handleCacheFirstRequest(request) {
    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return await fetch(request);
    }
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Fetch failed:', error);
        return new Response('Network error', { status: 503 });
    }
}

/**
 * Handle image requests with cache-first strategy
 */
async function handleImageRequest(request) {
    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return await fetch(request);
    }
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Image fetch failed, returning placeholder');
        return new Response('Image not available', { status: 404 });
    }
}

/**
 * Handle stale-while-revalidate for API requests
 */
async function handleStaleWhileRevalidate(request) {
    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return await fetch(request);
    }
    
    const cache = await caches.open(RUNTIME_CACHE);
    const cachedResponse = await cache.match(request);
    
    const networkPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || networkPromise;
}

/**
 * Handle network-first requests for dynamic content
 */
async function handleNetworkFirstRequest(request) {
    // Skip problematic requests
    if (shouldSkipRequest(request)) {
        return await fetch(request);
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network failed, trying cache');
        return caches.match(request);
    }
}

/**
 * Background sync for offline actions
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);
    
    if (event.tag === 'sync-github-data') {
        event.waitUntil(syncGitHubData());
    }
});

/**
 * Sync GitHub data in background
 */
async function syncGitHubData() {
    try {
        const response = await fetch('https://api.github.com/users/SilentCaMXMF/repos');
        
        if (response.ok) {
            const data = await response.json();
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(
                'https://api.github.com/users/SilentCaMXMF/repos',
                new Response(JSON.stringify(data))
            );
            console.log('[Service Worker] GitHub data synced');
        }
    } catch (error) {
        console.error('[Service Worker] Background sync failed:', error);
    }
}

/**
 * Message handling for manual cache updates
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

console.log('[Service Worker] Service worker loaded');
