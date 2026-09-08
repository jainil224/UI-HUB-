/**
 * Canonical list of premium (PRO-gated) component IDs.
 *
 * This is the single source of truth for which components require an
 * entitlement. Previously that knowledge lived in three places:
 *   - componentSyncService.js  (PREMIUM_COMPONENT_IDS)
 *   - setupProductionDatabase.js (PREMIUM_COMPONENT_IDS)
 *   - frontend componentData.tsx (isPremium: true flags)
 * All of those now import/derive from THIS set.
 *
 * NOTE: A mirrored copy lives at frontend/src/data/premiumComponents.ts so the
 * client can decide "fetch from server vs read from bundle". Keep them in sync.
 */
export const PREMIUM_COMPONENT_IDS = new Set([
  '3d-hero',
  '3d-rubiks-cube',
  '3d-scroll-animation',
  '3d-slider',
  'aura-cursor',
  'black-hole',
  'black-hole-3d',
  'black-hole-background',
  'black-hole-cursor',
  'blooming-flower',
  'card-cascade',
  'cards-beam',
  'chandelier',
  'cloud-scroll',
  'fourier-flow',
  'generating-orb',
  'gear-system',
  'gravitational-vortex',
  'hell-background',
  'hourglass',
  'infinity-image',
  'interactive-grid-background',
  'isometric-grid-background',
  'isometric-portal',
  'lightfall',
  'lizard-cursor',
  'morphing-glow',
  'morphing-rings',
  'mouse-gravity-background',
  'particle-sphere',
  'pixel-drift',
  'point-dna-helix',
  'radial-glow-button',
  'rubiks-cube',
  'section-scroll',
  'solar-system',
  'spider-web',
  'spiral-images',
  'spotlight-cards',
  'super-mario',
  'toonhub-hero',
  'tornado',
  'twin-galaxy-rings',
]);

export const isPremiumComponentId = (id) => {
  if (!id) return false;
  return PREMIUM_COMPONENT_IDS.has(String(id).trim().toLowerCase());
};