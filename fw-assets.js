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
  const missionArtwork = [
    { test: /mindful|meditat|สมาธิ|สติ/i, file: 'mindfulness' },
    { test: /music|ดนตรี|เพลง/i, file: 'music' },
    { test: /nature|explor|ธรรมชาติ|สำรวจ/i, file: 'nature-exploration' },
    { test: /friend|social|เพื่อน|ชุมชน/i, file: 'social-friendship' },
    { test: /science|experiment|ทดลอง|วิทย/i, file: 'science-experiment-alt' },
  ];
  const missionItem = (mission) => {
    const words = `${mission && mission.th || ''} ${mission && mission.en || ''}`;
    const special = missionArtwork.find(entry => entry.test.test(words));
    return special
      ? image(`missions/${special.file}.jpg`, 512, 512, `quest-${special.file}`)
      : missions[mission && mission.group] || pending('quest');
  };
  const shopItems = {
    chair: 'fantasy-chair', plant: 'lucky-clover-pot', books: 'celestial-spellbook',
    wings: 'fairy-wings', wand: 'magic-wand', outfit: 'witch-outfit',
    treasure: 'treasure-chest', chest: 'treasure-chest', backpack: 'adventure-backpack',
    bed: 'moon-pillow.jpg', piano: 'music-box.jpg', crown: 'princess-crown.jpg', lamp: 'starry-telescope.jpg',
  };

  window.FW_ASSETS = Object.freeze({
    base: BASE,
    ready: true,
    characters: Object.freeze({
      lumi: Object.freeze({
        normal: image('characters/lumi/lumi-normal.webp', 512, 512, 'lumi-normal'),
        happy: image('characters/lumi/lumi-happy.webp', 512, 512, 'lumi-happy'),
        thinking: image('characters/lumi/lumi-thinking.webp', 512, 512, 'lumi-thinking'),
        surprised: image('characters/lumi/lumi-surprised.webp', 512, 512, 'lumi-surprised'),
        excited: image('characters/lumi/lumi-excited.webp', 512, 512, 'lumi-excited'),
        cheerful: image('characters/lumi/lumi-cheerful-alt.jpg', 512, 512, 'lumi-cheerful'),
        guide: image('characters/lumi/lumi-guide.jpg', 512, 512, 'lumi-guide'),
        pointing: image('characters/lumi/lumi-pointing.jpg', 512, 512, 'lumi-pointing'),
        sleeping: image('characters/lumi/lumi-sleeping.jpg', 512, 512, 'lumi-sleeping'),
        star: image('characters/lumi/lumi-holding-star.jpg', 512, 512, 'lumi-star'),
      }),
      freya: Object.freeze({
        wave: image('characters/freya/freya-standing-wave.webp', 640, 640, 'freya-wave'),
        reading: image('characters/freya/freya-reading.webp', 640, 640, 'freya-reading'),
        celebrating: image('characters/freya/freya-celebrating.webp', 640, 640, 'freya-celebrating'),
        treasure: image('characters/freya/freya-opening-treasure.webp', 640, 640, 'freya-treasure'),
        wand: image('characters/freya/freya-magic-wand.webp', 640, 640, 'freya-wand'),
        map: image('characters/freya/freya-with-map.jpg', 640, 640, 'freya-map'),
        painting: image('characters/freya/freya-painting.jpg', 640, 640, 'freya-painting'),
        science: image('characters/freya/freya-science-experiment.jpg', 640, 640, 'freya-science'),
        watering: image('characters/freya/freya-watering-plants.jpg', 640, 640, 'freya-watering'),
      }),
    }),
    worlds: Object.freeze(worlds),
    missions: Object.freeze(missions),
    mission: Object.freeze({ item: missionItem }),
    scenes: Object.freeze({
      home: image('scenes/home-hero-background.jpg', 1280, 720, 'home-scene'),
      shop: image('scenes/reward-shop-scene.jpg', 1280, 720, 'shop-scene'),
      memory: image('scenes/portfolio-memory-book-scene.jpg', 1280, 720, 'memory-scene'),
    }),
    portals: Object.freeze({
      locked: image('worlds/portal-island-locked.jpg', 768, 768, 'portal-locked'),
      unlocked: image('worlds/portal-island-unlocked-alt-03.jpg', 768, 768, 'portal-unlocked'),
    }),
    shop: Object.freeze({
      scene: image('scenes/reward-shop-scene.jpg', 1280, 720, 'shop-scene'),
      chest: image('rewards/treasure-chest.webp', 384, 384, 'reward-chest'),
      item: (id) => shopItems[id]
        ? image(`rewards/${shopItems[id].includes('.') ? shopItems[id] : shopItems[id] + '.webp'}`, 384, 384, `shop-item-${id}`)
        : pending(`shop-item-${id}`),
    }),
    memory: Object.freeze({
      scene: image('scenes/portfolio-memory-book-scene.jpg', 1280, 720, 'memory-scene'),
      paper: pending('memory-paper'), tape: pending('memory-tape'),
    }),
  });
})();
