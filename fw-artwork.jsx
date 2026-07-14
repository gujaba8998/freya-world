/* fw-artwork.jsx — production illustration registry
   Curated, individually-cropped art (not full reference sheets) resized to
   web weight. Everything here is presentation-only: every consumer keeps its
   existing emoji/CSS fallback when an id has no matching file, so a missing
   or renamed asset never breaks a screen. Source PNGs (F:\Claude\freya-world)
   stay outside the repo; only the optimized copies under assets/ ship. */
const FW_ART = {
  world: {
    life: 'assets/worlds/life.jpg',
    language: 'assets/worlds/language.jpg',
    math: 'assets/worlds/math.jpg',
    science: 'assets/worlds/science.jpg',
    agri: 'assets/worlds/agri.jpg',
    social: 'assets/worlds/social.jpg',
    art: 'assets/worlds/art.jpg',
  },
  scene: {
    hero: 'assets/scenes/home-hero-background.jpg',
    shop: 'assets/scenes/reward-shop-scene.jpg',
    journal: 'assets/scenes/portfolio-memory-book-scene.jpg',
  },
  reward: {
    bed: 'assets/rewards/moon-pillow.jpg',
    piano: 'assets/rewards/music-box.jpg',
    lamp: 'assets/rewards/starry-telescope.jpg',
    rainbow: 'assets/rewards/rainbow.jpg',
    stars: 'assets/rewards/sparkling-stars.jpg',
    crown: 'assets/rewards/princess-crown.jpg',
    wand: 'assets/rewards/magic-wand.jpg',
    chair: 'assets/rewards/fantasy-chair.jpg',
    plant: 'assets/rewards/lucky-clover-pot.jpg',
    books: 'assets/rewards/celestial-spellbook.jpg',
  },
  character: {
    freya: 'assets/characters/freya-map.jpg',
    lumiStar: 'assets/characters/lumi-star.jpg',
  },
};

function fwArt(category, id) {
  return (FW_ART[category] && FW_ART[category][id]) || null;
}

Object.assign(window, { FW_ART, fwArt });
