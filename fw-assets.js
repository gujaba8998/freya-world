/* fw-assets.js — central presentation-only asset registry.
   Source sheets currently live outside the repository and must be split,
   renamed, and optimised before any src below is enabled. Business data IDs
   stay in fw-data.jsx; this file only maps those IDs to future artwork. */
(function () {
  const BASE = 'public/assets/freya-world';
  const pending = (fallback) => ({ src: null, width: 0, height: 0, fallback });

  const worlds = {
    life:     pending('world-life'),
    language: pending('world-language'),
    math:     pending('world-math'),
    science:  pending('world-science'),
    agri:     pending('world-nature'),
    social:   pending('world-social'),
    art:      pending('world-art'),
  };

  window.FW_ASSETS = Object.freeze({
    base: BASE,
    ready: false,
    characters: Object.freeze({ lumi: pending('lumi-mark'), freya: pending('freya-mark') }),
    worlds: Object.freeze(worlds),
    shop: Object.freeze({ scene: pending('shop-scene'), chest: pending('reward-chest') }),
    memory: Object.freeze({ paper: pending('memory-paper'), tape: pending('memory-tape') }),
  });
})();
