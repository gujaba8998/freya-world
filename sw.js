/* sw.js — Freya's World service worker
   Strategy: stale-while-revalidate for app files + the CDN runtime
   (React/Babel/Firebase SDK). Firestore/Storage/Auth traffic is NEVER
   intercepted — it must go straight to the network or realtime sync breaks.
   Bump CACHE_VERSION when shipping a release to drop old caches. */
const CACHE_VERSION = 'freya-world-v21';

const PRECACHE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icon-192.png',
  'icon-512.png',
  'fw-styles.css',
  'fw-responsive.css',
  'fw-fun.css',
  'fw-theme.css',
  'image-slot.js',
  'fw-assets.js',
  'fw-artwork.jsx',
  'fw-icons.jsx',
  'tweaks-panel.jsx',
  'fw-music.jsx',
  'fw-cheer.jsx',
  'fw-mascot.jsx',
  'fw-curriculum.jsx',
  'fw-firebase.jsx',
  'fw-data.jsx',
  'fw-ui.jsx',
  'public/assets/freya-world/worlds/life-village.webp',
  'public/assets/freya-world/worlds/library-of-words.webp',
  'public/assets/freya-world/worlds/shape-town.webp',
  'public/assets/freya-world/worlds/sky-laboratory.webp',
  'public/assets/freya-world/worlds/wonder-garden.webp',
  'public/assets/freya-world/worlds/world-city.webp',
  'public/assets/freya-world/worlds/art-island.webp',
  'public/assets/freya-world/scenes/home-hero-background.jpg',
  'public/assets/freya-world/scenes/reward-shop-scene.jpg',
  'public/assets/freya-world/scenes/portfolio-memory-book-scene.jpg',
  'public/assets/freya-world/worlds/portal-island-locked.jpg',
  'public/assets/freya-world/worlds/portal-island-unlocked-alt-03.jpg',
  'public/assets/freya-world/characters/freya/freya-with-map.jpg',
  'public/assets/freya-world/characters/freya/freya-painting.jpg',
  'public/assets/freya-world/characters/freya/freya-science-experiment.jpg',
  'public/assets/freya-world/characters/freya/freya-watering-plants.jpg',
  'public/assets/freya-world/characters/lumi/lumi-cheerful-alt.jpg',
  'public/assets/freya-world/characters/lumi/lumi-guide.jpg',
  'public/assets/freya-world/characters/lumi/lumi-holding-star.jpg',
  'public/assets/freya-world/characters/lumi/lumi-pointing.jpg',
  'public/assets/freya-world/characters/lumi/lumi-sleeping.jpg',
  'public/assets/freya-world/missions/mindfulness.jpg',
  'public/assets/freya-world/missions/music.jpg',
  'public/assets/freya-world/missions/nature-exploration.jpg',
  'public/assets/freya-world/missions/science-experiment-alt.jpg',
  'public/assets/freya-world/missions/social-friendship.jpg',
  'public/assets/freya-world/rewards/moon-pillow.jpg',
  'public/assets/freya-world/rewards/music-box.jpg',
  'public/assets/freya-world/rewards/princess-crown.jpg',
  'public/assets/freya-world/rewards/starry-telescope.jpg',
  'fw-dashboard.jsx',
  'fw-activity.jsx',
  'fw-portfolio.jsx',
  'fw-rewards.jsx',
  'fw-parent.jsx',
  'fw-avatar.jsx',
  'fw-sar.jsx',
  'fw-parenthub.jsx',
  'fw-app.jsx',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage-compat.js',
  'https://unpkg.com/react@18.3.1/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  // allSettled: one failed URL (e.g. offline first install) must not block the rest
  e.waitUntil(
    caches.open(CACHE_VERSION).then(c => Promise.allSettled(PRECACHE.map(u => c.add(u))))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const sameOrigin = url.origin === location.origin;
  const cdnRuntime = url.host === 'unpkg.com' ||
    (url.host === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/'));
  // everything else (firestore.googleapis.com, storage, auth, evidence
  // downloadURLs) bypasses the SW entirely
  if (!sameOrigin && !cdnRuntime) return;

  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fetched = fetch(e.request).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => hit);
      // serve cache instantly when we have it; the fetch above refreshes it
      // in the background so the next load picks up new versions
      return hit || fetched;
    })
  );
});
