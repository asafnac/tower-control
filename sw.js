/* sw.js — offline play.
 *
 * THE SHAPE, AND WHY
 * Two caches with opposite policies, because the two kinds of file have
 * opposite properties:
 *
 *   shell (html/css/js/vendor, ~800 KB) — network first.
 *     These change when the game is updated, and a stale copy means a fix that
 *     never arrives. Online, the network wins and the cache is refreshed behind
 *     it; offline, the cache answers. The child gets the newest game whenever
 *     there is a connection and yesterday's game when there is not.
 *
 *   audio (309 clips, ~16 MB) — cache first, forever.
 *     Every clip is named after a hash of the sentence it speaks, so a given
 *     filename's contents can never change. Re-validating them would be pure
 *     waste, and re-downloading 16 MB on a tablet is worse than waste.
 *
 * The 16 MB is never downloaded behind anyone's back. By default clips are kept
 * as they are heard; taking the whole set offline is a button in the parent
 * screen with a progress bar.
 *
 * Anything cross-origin — the sync server — is passed straight through and
 * never cached. A stale save is the one thing worse than no save.
 */

const VERSION      = 'v1';
const SHELL_CACHE  = 'tower-shell-' + VERSION;
const AUDIO_CACHE  = 'tower-audio-v1';   // deliberately not versioned: see above
const NET_TIMEOUT  = 4000;

const SHELL = [
  './',
  './index.html',
  './css/style.css',
  './js/curriculum.js',
  './js/speech.js',
  './js/sfx.js',
  './js/scene3d.js',
  './js/analytics.js',
  './js/sync.js',
  './js/offline.js',
  './js/progress.js',
  './js/game.js',
  './vendor/three.min.js',
  './manifest.webmanifest',
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // One at a time and forgiving: a single 404 must not abandon the whole
    // install and leave the game with no offline copy at all.
    await Promise.all(SHELL.map(url =>
      cache.add(new Request(url, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names
      .filter(n => n.startsWith('tower-shell-') && n !== SHELL_CACHE)
      .map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

/** Cache first. Used only for content-addressed files. */
async function fromCacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res && res.ok) cache.put(request, res.clone());
  return res;
}

/** Network first, with a short leash so a flaky connection is not a hang. */
async function fromNetworkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), NET_TIMEOUT);
    const res = await fetch(request, { signal: ctrl.signal });
    clearTimeout(timer);
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(request);
    if (hit) return hit;
    // A navigation with nothing cached still has to render something.
    if (request.mode === 'navigate') {
      const shell = await cache.match('./index.html');
      if (shell) return shell;
    }
    throw e;
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // The sync server lives somewhere else and must never be answered from a
  // cache — that would hand back a save older than the one on the device.
  if (url.origin !== self.location.origin) return;

  if (url.pathname.includes('/audio/') && url.pathname.endsWith('.mp3')) {
    event.respondWith(fromCacheFirst(request, AUDIO_CACHE));
    return;
  }

  event.respondWith(fromNetworkFirst(request, SHELL_CACHE));
});

// ===== MESSAGES FROM THE PAGE =====
self.addEventListener('message', event => {
  const msg = event.data || {};

  if (msg.type === 'PRECACHE_AUDIO') {
    event.waitUntil(precacheAudio(msg.urls || [], event.source));
  }

  if (msg.type === 'CLEAR') {
    event.waitUntil((async () => {
      const names = await caches.keys();
      await Promise.all(names.filter(n => n.startsWith('tower-')).map(n => caches.delete(n)));
      if (event.source) event.source.postMessage({ type: 'CLEARED' });
    })());
  }

  if (msg.type === 'AUDIO_COUNT') {
    event.waitUntil((async () => {
      const cache = await caches.open(AUDIO_CACHE);
      const keys = await cache.keys();
      if (event.source) event.source.postMessage({ type: 'AUDIO_COUNT', cached: keys.length });
    })());
  }
});

/**
 * Fetch every clip into the cache, reporting progress.
 *
 * Six at a time: enough to saturate a home connection, few enough that a phone
 * on a weak signal is not fighting 309 sockets. Failures are counted, not
 * thrown — one missing clip should not fail an otherwise complete download.
 */
async function precacheAudio(urls, client) {
  const cache = await caches.open(AUDIO_CACHE);
  let done = 0, failed = 0;
  const CONCURRENCY = 6;

  const queue = urls.slice();
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        if (!(await cache.match(url))) {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res && res.ok) await cache.put(url, res.clone());
          else failed++;
        }
      } catch (e) {
        failed++;
      }
      done++;
      if (client && done % 5 === 0) {
        client.postMessage({ type: 'PRECACHE_PROGRESS', done, total: urls.length, failed });
      }
    }
  };

  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (client) client.postMessage({ type: 'PRECACHE_DONE', done, total: urls.length, failed });
}
