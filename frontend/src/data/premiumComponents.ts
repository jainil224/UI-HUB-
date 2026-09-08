/**
 * Mirrored copy of backend/src/config/premiumComponents.js.
 * The client queries this to decide "fetch premium source from the server"
 * instead of reading it from the (now stripped) local bundles.
 * Keep in sync with the backend list; both are hand-maintained.
 */
export const PREMIUM_COMPONENT_IDS = new Set<string>([
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

export const isPremiumComponentId = (id?: string | null): boolean => {
  if (!id) return false;
  return PREMIUM_COMPONENT_IDS.has(String(id).trim().toLowerCase());
};