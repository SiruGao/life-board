const CACHE = 'socratic-kernel-v6-2'
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './ai.css',
  './motion.css',
  './results.css',
  './model-stability.css',
  './app.js',
  './onboarding.js',
  './ai.js',
  './visual.js',
  './interactions.js',
  './results.js',
  './model-stability.js',
  './brand-symbol.svg',
  './icon.svg',
  './manifest.webmanifest',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))),
  )
  self.clients.claim()
})

async function networkFirst(request) {
  const cache = await caches.open(CACHE)
  try {
    const response = await fetch(request)
    if (response && response.status === 200 && response.type !== 'opaque') {
      await cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    if (request.mode === 'navigate') {
      return (await cache.match('./index.html')) || cache.match('./')
    }
    throw new Error('OFFLINE_ASSET_NOT_CACHED')
  }
}

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/api/')) return
  if (url.origin !== self.location.origin) return
  event.respondWith(networkFirst(event.request))
})
