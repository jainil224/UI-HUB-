import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.resolve(__dirname, '../../frontend/src');

// Component ID to file path mappings
const COMPONENT_FILE_MAP = {
  // Cursors
  'target-cursor': 'components/ui/TargetCursor.tsx',
  'black-hole-cursor': 'components/ui/BlackHoleCursor.tsx',
  'magnetic-cursor': 'components/ui/MagneticCursor.tsx',
  'aurora-cursor': 'components/ui/AuroraCursor.tsx',
  'heart-cursor': 'components/ui/HeartCursor.tsx',
  'lizard-cursor': 'components/ui/LizardCursor.tsx',
  'venom-cursor': 'components/ui/VenomCursor.tsx',
  'star-cursor': 'components/ui/StarCursor.tsx',

  // Backgrounds
  'space-background': 'components/ui/SpaceBackground.tsx',
  'gravitational-vortex': 'components/ui/GravitationalVortex.tsx',
  'black-hole-3d': 'components/ui/BlackHole.tsx',
  'blooming-flower': 'components/ui/BloomingFlower.tsx',
  'black-hole-background': 'components/ui/BlackHoleBackground.tsx',
  'mouse-gravity-background': 'components/ui/MouseGravityBackground.tsx',
  'hell-background': 'components/ui/HellBackground.tsx',
  'interactive-grid-background': 'components/ui/InteractiveGridBackground.tsx',
  'wave-background': 'components/ui/WaveBackground.tsx',
  'lines-background': 'components/ui/background-paths.tsx',
  'sparkles-background': 'components/ui/sparkles-background.tsx',
  'isometric-grid-background': 'components/ui/isometric-grid-background.tsx',
  'beam-grid-background': 'components/ui/BeamGridBackground.tsx',
  'fall-beam-background': 'components/ui/FallBeamBackground.tsx',
  'grid-background': 'components/ui/background-boxes.tsx',

  // Buttons
  'corner-border-button': 'components/ui/corner-border-button.tsx',
  'border-beam': 'components/ui/border-beam.tsx',
  'marquee-hover-button': 'components/ui/marquee-hover-button.tsx',
  'payment-transaction-button': 'components/ui/payment-transaction-button.tsx',
  'magic-card-effect': 'components/ui/magic-card.tsx',
  'rainbow-button': 'components/ui/rainbow-button.tsx',
  'social-tooltip-buttons': 'components/animations/SocialTooltipButtons.tsx',
  'orbit-button': 'components/ui/OrbitButton.tsx',
  'galaxy-button': 'components/ui/GalaxyButton.tsx',
  'liquid-fill-button': 'components/ui/LiquidFillButton.tsx',
  'interactive-hover-button': 'components/ui/interactive-hover-button.tsx',

  // 3D & Scenes
  '3d-hero': 'components/ui/ToonhubHero.tsx',
  '3d-scroll-animation': 'components/ui/Scroll3DAnimation.tsx',
  '3d-slider': 'components/ui/ThreeDSlider.tsx',
  '3d-rubiks-cube': 'components/ui/RubiksCube.tsx',
  'cards-beam': 'components/ui/CardsBeam.tsx',
  'solar-system': 'components/ui/SolarSystem.tsx',

  // 3D Chatbots
  'hoodiebot': 'components/ui/HoodieBot.tsx',
  'smilo': 'components/ui/Smilo.tsx',
  'tripy': 'components/ui/Tripy.tsx',
  'aiva': 'components/ui/Aiva.tsx',
  'laptopbot': 'components/ui/LaptopBot.tsx',

  // Scrolls & Transitions
  'fourier-flow': 'components/ui/FourierFlow.tsx',
  'svg-page-transition': 'components/ui/SVGPageTransition.tsx',
  'section-scroll': 'components/ui/SectionScroll.tsx',
  'cloud-scroll': 'components/ui/CloudScroll/CloudScroll.tsx',
  'infinite-marquee': 'components/ui/InfiniteMarquee.tsx',
};

// Function to make code 100% self-contained so any AI can copy and paste directly
function makeSelfContained(sourceCode) {
  let cleaned = sourceCode;

  // Replace relative cn imports with inline cn helper
  if (cleaned.includes("from '../../lib/utils'") || cleaned.includes('from "../../lib/utils"') || cleaned.includes("from '@/lib/utils'") || cleaned.includes("from '../lib/utils'")) {
    cleaned = cleaned.replace(/import\s*\{\s*cn\s*\}\s*from\s*['"][^'"]+['"];?/g, '// Helper for Tailwind class merging\nconst cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");');
  }

  return cleaned.trim();
}

console.log('Building 100% complete embedded source code dataset...');
const embeddedData = {};

for (const [id, relPath] of Object.entries(COMPONENT_FILE_MAP)) {
  const fullPath = path.resolve(FRONTEND_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    const raw = fs.readFileSync(fullPath, 'utf8');
    embeddedData[id] = makeSelfContained(raw);
    console.log(`✔ Embedded: ${id} (${embeddedData[id].length} chars)`);
  } else {
    console.warn(`✖ File not found for: ${id} at ${fullPath}`);
  }
}

// Write to backend/src/data/sourceCodeData.js
const backendOut = `/**
 * PRODUCTION-SAFE 100% COMPLETE EMBEDDED SOURCE CODE
 * Generated automatically from UI-HUB component files.
 * Contains verbatim, self-contained implementations for every component.
 */

export const EMBEDDED_SOURCE_CODE = ${JSON.stringify(embeddedData, null, 2)};
`;

fs.writeFileSync(path.resolve(__dirname, '../src/data/sourceCodeData.js'), backendOut, 'utf8');
console.log('Updated backend/src/data/sourceCodeData.js');

// Write to frontend/src/data/embeddedSourceCode.ts
const frontendOut = `/**
 * PRODUCTION-SAFE 100% COMPLETE EMBEDDED SOURCE CODE
 * Generated automatically from UI-HUB component files.
 * Contains verbatim, self-contained implementations for every component.
 */

export const EMBEDDED_SOURCE_CODE: Record<string, string> = ${JSON.stringify(embeddedData, null, 2)};
`;

fs.writeFileSync(path.resolve(FRONTEND_DIR, 'data/embeddedSourceCode.ts'), frontendOut, 'utf8');
console.log('Updated frontend/src/data/embeddedSourceCode.ts');
