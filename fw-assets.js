/* fw-assets.js — central presentation-only asset registry.
   Source sheets currently live outside the repository and must be split,
   renamed, and optimised before any src below is enabled. Business data IDs
   stay in fw-data.jsx; this file only maps those IDs to future artwork. */
(function () {
  const BASE = 'public/assets/freya-world';
  const pending = (fallback) => ({ src: null, width: 0, height: 0, fallback });
  const image = (src, width, height, fallback) => ({ src: `${BASE}/${src}`, width, height, fallback });

  const worlds = {
    life:     image('worlds/life-village.webp', 768, 768, 'world-life'),
    language: image('worlds/library-of-words.webp', 768, 768, 'world-language'),
    math:     image('worlds/shape-town.webp', 768, 768, 'world-math'),
    science:  image('worlds/sky-laboratory.webp', 768, 768, 'world-science'),
    agri:     image('worlds/wonder-garden.webp', 768, 768, 'world-nature'),
    social:   image('worlds/world-city.webp', 768, 768, 'world-social'),
    art:      image('worlds/art-island.webp', 768, 768, 'world-art'),
  };

  const missions = {
    life: image('missions/clean-room.webp', 512, 512, 'quest-life'),
    language: image('missions/read-book.webp', 512, 512, 'quest-language'),
    math: image('missions/mathematics.webp', 512, 512, 'quest-math'),
    science: image('missions/science-experiment.webp', 512, 512, 'quest-science'),
    agri: image('missions/planting.webp', 512, 512, 'quest-nature'),
    social: image('missions/help-friend.webp', 512, 512, 'quest-social'),
    art: image('missions/draw-picture.webp', 512, 512, 'quest-art'),
  };
  const shopItems = {
    chair: 'fantasy-chair', plant: 'lucky-clover-pot', books: 'celestial-spellbook',
    wings: 'fairy-wings', wand: 'magic-wand', outfit: 'witch-outfit',
    treasure: 'treasure-chest', chest: 'treasure-chest', backpack: 'adventure-backpack',
  };

  window.FW_ASSETS = Object.freeze({
    base: BASE,
    ready: true,
    characters: Object.freeze({
      lumi: image('characters/lumi/lumi-happy.webp', 512, 512, 'lumi-mark'),
      freya: image('characters/freya/freya-standing-wave.webp', 640, 640, 'freya-mark'),
    }),
    worlds: Object.freeze(worlds),
    missions: Object.freeze(missions),
    shop: Object.freeze({
      scene: pending('shop-scene'),
      chest: image('rewards/treasure-chest.webp', 384, 384, 'reward-chest'),
      item: (id) => shopItems[id]
        ? image(`rewards/${shopItems[id]}.webp`, 384, 384, `shop-item-${id}`)
        : pending(`shop-item-${id}`),
    }),
    memory: Object.freeze({ paper: pending('memory-paper'), tape: pending('memory-tape') }),
  });
})();
