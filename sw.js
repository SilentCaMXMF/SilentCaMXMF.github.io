const CACHE_NAME = 'portfolio-v2';
const STATIC_CACHE = 'static-v2';
const CDN_CACHE = 'cdn-v2';
const IMAGES_CACHE = 'images-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/script.js',
  '/.nojekyll',
  '/AGENTS.md',
  '/README.md'
];

const CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => cache.addAll(STATIC_ASSETS)),
      caches.open(CDN_CACHE).then((cache) => cache.addAll(CDN_ASSETS))
    ])
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (isImageRequest(url)) {
    event.respondWith(handleImageRequest(event));
  } else if (isCDNRequest(url)) {
    event.respondWith(handleCDNRequest(event));
  } else {
    event.respondWith(handleStaticRequest(event));
  }
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      deleteOldCaches([CACHE_NAME, STATIC_CACHE, CDN_CACHE, IMAGES_CACHE]),
      self.clients.claim()
    ])
  );
});

function isImageRequest(url) {
  return IMAGE_EXTENSIONS.some(ext => url.pathname.endsWith(ext));
}

function isCDNRequest(url) {
  return url.hostname.includes('cdn.jsdelivr.net') || 
         url.hostname.includes('cdnjs.cloudflare.com');
}

async function handleStaticRequest(event) {
  try {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(event.request);
    
    if (!response || response.status !== 200) {
      return response;
    }

    const cache = await caches.open(STATIC_CACHE);
    cache.put(event.request, response.clone());
    
    return response;
  } catch (error) {
    console.error('Fetch failed:', error);
    return await caches.match('/index.html') || 
           new Response('Offline - Please check your connection', { 
             status: 503, 
             statusText: 'Service Unavailable' 
           });
  }
}

async function handleCDNRequest(event) {
  try {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(event.request);
    
    if (!response || response.status !== 200) {
      return response;
    }

    const cache = await caches.open(CDN_CACHE);
    cache.put(event.request, response.clone());
    
    return response;
  } catch (error) {
    console.error('CDN fetch failed:', error);
    const cachedResponse = await caches.match(event.request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

async function handleImageRequest(event) {
  try {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await fetch(event.request);
    
    if (!response || response.status !== 200) {
      return response;
    }

    const cache = await caches.open(IMAGES_CACHE);
    cache.put(event.request, response.clone());
    
    return response;
  } catch (error) {
    console.error('Image fetch failed:', error);
    return await caches.match(event.request) || new Response('Image unavailable', { status: 503 });
  }
}

async function deleteOldCaches(allowedCaches) {
  const cacheNames = await caches.keys();
  return Promise.all(
    cacheNames
      .filter(cacheName => !allowedCaches.includes(cacheName))
      .map(cacheName => caches.delete(cacheName))
  );
}
