import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const CURATED = {
    '3d-hero': { title: '3D Hero', category: '3d', tags: ['hero', 'landing', 'three', 'webgl', 'section'] },
    '3d-rubiks-cube': { title: "3D Rubik's Cube", category: '3d', tags: ['rubik', 'cube', 'puzzle', 'three'] },
    '3d-scroll-animation': { title: '3D Scroll Animation', category: '3d', tags: ['scroll', 'animation', 'webgl'] },
    '3d-slider': { title: '3D Slider', category: '3d', tags: ['slider', 'carousel', 'gallery'] },
    'aura-cursor': { title: 'Aura Cursor', category: 'cursor', tags: ['cursor', 'glow', 'pointer'] },
    'black-hole': { title: 'Black Hole', category: '3d', tags: ['black hole', 'space', 'galaxy', 'gravity', 'gravitational', 'singularity'] },
    'black-hole-3d': { title: 'Black Hole 3D', category: '3d', tags: ['black hole', 'space', 'galaxy', 'gravity'] },
    'black-hole-background': { title: 'Black Hole Background', category: 'background', tags: ['black hole', 'space', 'galaxy', 'background'] },
    'black-hole-cursor': { title: 'Black Hole Cursor', category: 'cursor', tags: ['black hole', 'space', 'cursor', 'pointer'] },
    'blooming-flower': { title: 'Blooming Flower', category: 'effect', tags: ['flower', 'bloom', 'particle', 'organic'] },
    'card-cascade': { title: 'Card Cascade', category: 'effect', tags: ['cards', 'cascade', 'stack', 'reveal'] },
    'cards-beam': { title: 'Cards Beam', category: 'effect', tags: ['cards', 'beam', 'light', 'glow'] },
    chandelier: { title: 'Chandelier', category: 'effect', tags: ['chandelier', 'lights', 'glow', 'luxury'] },
    'generating-orb': { title: 'Generating Orb', category: 'loader', tags: ['loader', 'orb', 'generating', 'loading', 'spinner'] },
    'gear-system': { title: 'Gear System', category: '3d', tags: ['gear', 'mechanical', 'cog', 'three'] },
    'gravitational-vortex': { title: 'Gravitational Vortex', category: '3d', tags: ['vortex', 'gravity', 'spiral', 'space'] },
    'hell-background': { title: 'Hell Background', category: 'background', tags: ['hell', 'fire', 'lava', 'dark', 'background'] },
    hourglass: { title: 'Hourglass', category: '3d', tags: ['hourglass', 'sand', 'time', 'timer'] },
    'infinity-image': { title: 'Infinity Image', category: 'image-interaction', tags: ['infinity', 'image', 'mirror', 'gallery'] },
    'interactive-grid-background': { title: 'Interactive Grid Background', category: 'interactive-background', tags: ['grid', 'interactive', 'lines', 'background'] },
    'isometric-grid-background': { title: 'Isometric Grid Background', category: 'interactive-background', tags: ['isometric', 'grid', 'tiles', 'background'] },
    'isometric-portal': { title: 'Isometric Portal', category: '3d', tags: ['isometric', 'portal', 'three'] },
    lightfall: { title: 'Lightfall', category: 'background', tags: ['light', 'rain', 'particles', 'falling', 'background'] },
    'lizard-cursor': { title: 'Lizard Cursor', category: 'cursor', tags: ['cursor', 'lizard', 'trail', 'pointer'] },
    'morphing-glow': { title: 'Morphing Glow', category: 'effect', tags: ['morph', 'glow', 'blob', 'gradient'] },
    'morphing-rings': { title: 'Morphing Rings', category: 'effect', tags: ['morph', 'rings', 'circles', 'animation'] },
    'mouse-gravity-background': { title: 'Mouse Gravity Background', category: 'interactive-background', tags: ['mouse', 'gravity', 'particles', 'interactive', 'background'] },
    'particle-sphere': { title: 'Particle Sphere', category: 'particles-background', tags: ['particle', 'sphere', 'globe', 'dots', 'orbit'] },
    'pixel-drift': { title: 'Pixel Drift', category: 'background', tags: ['pixel', 'drift', 'retro', 'background'] },
    'point-dna-helix': { title: 'Point DNA Helix', category: '3d', tags: ['dna', 'helix', 'points', 'spiral', 'particle'] },
    'radial-glow-button': { title: 'Radial Glow Button', category: 'button', tags: ['button', 'glow', 'radial', 'cta'] },
    'rubiks-cube': { title: "Rubik's Cube", category: '3d', tags: ['rubik', 'cube', 'puzzle', 'three'] },
    'section-scroll': { title: 'Section Scroll', category: 'scroll', tags: ['scroll', 'section', 'snap', 'scroll-triggered'] },
    'solar-system': { title: 'Solar System', category: '3d', tags: ['solar', 'system', 'planets', 'space', 'sun', 'orbit', 'galaxy'] },
    'spider-web': { title: 'Spider Web', category: '3d', tags: ['spider', 'web', 'network', 'lines'] },
    'spiral-images': { title: 'Spiral Images', category: 'image-interaction', tags: ['spiral', 'images', 'gallery', 'carousel'] },
    'spotlight-cards': { title: 'Spotlight Cards', category: 'effect', tags: ['spotlight', 'cards', 'hover', 'glow'] },
    'super-mario': { title: 'Super Mario', category: '3d', tags: ['mario', 'game', 'retro'] },
    'toonhub-hero': { title: 'ToonHub Hero', category: '3d', tags: ['hero', 'toon', 'cartoon', 'landing', 'section'] },
    tornado: { title: 'Tornado', category: '3d', tags: ['tornado', 'vortex', 'wind', 'spiral'] },
    'twin-galaxy-rings': { title: 'Twin Galaxy Rings', category: '3d', tags: ['galaxy', 'rings', 'space', 'orbit'] },
};
const DEPENDENCY_HINTS = {
    '3d': ['react', 'three', '@react-three/fiber', '@react-three/drei'],
    'interactive-background': ['react', 'three', '@react-three/fiber', '@react-three/drei'],
    'particles-background': ['react', 'three'],
};
const FRAMER_CATEGORIES = new Set(['effect', 'scroll', 'text', 'image-interaction']);
const DATA_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data');
function loadJson(fileName, fallback) {
    try {
        return JSON.parse(readFileSync(path.join(DATA_DIR, fileName), 'utf8'));
    }
    catch {
        return fallback;
    }
}
let premiumIds = null;
let metadataMap = null;
let vibePrompts = null;
function getPremiumIds() {
    if (!premiumIds)
        premiumIds = loadJson('premiumComponents.json', []);
    return premiumIds;
}
function getMetadataMap() {
    if (!metadataMap)
        metadataMap = loadJson('componentMetadata.json', {});
    return metadataMap;
}
function getVibePrompts() {
    if (!vibePrompts)
        vibePrompts = loadJson('componentVibePrompts.json', {});
    return vibePrompts;
}
function humanizeId(id) {
    return id
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}
function dependenciesFor(category) {
    const base = DEPENDENCY_HINTS[category] || ['react'];
    if (FRAMER_CATEGORIES.has(category) && !base.includes('framer-motion')) {
        return [...base, 'framer-motion'];
    }
    return base;
}
/** All canonical premium ids (catalog + premium-only), lower-cased. */
export function allPremiumIds() {
    return new Set(getPremiumIds().map((id) => id.toLowerCase()));
}
export function isPremiumOnlyId(id) {
    return getPremiumIds().includes(id);
}
/**
 * Synthesize a ComponentMeta for a premium-only id. Returns null when the id is
 * not a known premium-only id.
 */
export function getPremiumOnlyMeta(id) {
    if (!id || !isPremiumOnlyId(id))
        return null;
    const curated = CURATED[id];
    const title = curated?.title || humanizeId(id);
    const category = curated?.category || 'effect';
    const meta = getMetadataMap()[id];
    const vibePrompt = getVibePrompts()[id] || '';
    const vibeDescription = typeof meta?.vibeMeta?.description === 'string' ? meta.vibeMeta.description : '';
    const description = vibeDescription
        ? `${title} — premium UI HUB ${category} component. ${vibeDescription}`.slice(0, 600)
        : vibePrompt
            ? `${title} — premium UI HUB ${category} component. ${vibePrompt.slice(0, 400)}`
            : `${title} — premium UI HUB ${category} component`;
    const tags = Array.from(new Set([
        ...(curated?.tags || []),
        category,
        ...id.split('-'),
        'premium',
    ]));
    return {
        id,
        title,
        category,
        description,
        tags,
        isPremium: true,
        dependencies: dependenciesFor(category),
        framework: 'react',
        styling: 'tailwind',
    };
}
/** ComponentMeta for every premium-only id (id present in premiumComponents.json). */
export function getPremiumOnlyMetas() {
    return getPremiumIds()
        .map((id) => getPremiumOnlyMeta(id))
        .filter((m) => m !== null);
}
//# sourceMappingURL=premiumCatalog.js.map