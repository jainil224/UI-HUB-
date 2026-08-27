import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANTIGRAVITY_PROMPTS } from '../data/prompts/antigravityPrompts.js';
import { CLAUDE_PROMPTS } from '../data/prompts/claudePrompts.js';
import { LOVABLE_PROMPTS } from '../data/prompts/lovablePrompts.js';
import { EMBEDDED_SOURCE_CODE } from '../data/sourceCodeData.js';
import { COMPONENT_FULL_SOURCES } from '../data/componentFullSources.js';
import { TOOL_BUILDERS } from './vibeEngine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend components source code
const FRONTEND_COMPONENTS_PATH = path.resolve(__dirname, '../../../frontend/src/components');

/**
 * Resolves the source code of a component by its ID.
 * Maps component IDs to their file paths in the frontend.
 */
const resolveSourceCode = async (componentId) => {
  // 0. Full real source first (production-safe, no filesystem needed)
  if (COMPONENT_FULL_SOURCES[componentId]) {
    return COMPONENT_FULL_SOURCES[componentId];
  }

  // 1. Check embedded source code first (production-safe, no filesystem needed)
  if (EMBEDDED_SOURCE_CODE[componentId]) {
    return EMBEDDED_SOURCE_CODE[componentId];
  }

  // 2. Fallback: try to read from the frontend filesystem (works in local dev only)
  const mapping = {
    '3d-hero': 'ui/ToonhubHero.tsx',
    '3d-scroll-animation': 'ui/Scroll3DAnimation.tsx',
    '3d-slider': 'ui/ThreeDSlider.tsx',
    'section-scroll': 'ui/SectionScroll.tsx',
    'spotlight-cards': 'animations/VisualEffects/index.tsx',
    'hell-background': 'ui/HellBackground.tsx',
    'interactive-grid-background': 'ui/InteractiveGridBackground.tsx',
    'isometric-grid-background': 'ui/isometric-grid-background.tsx',
    'black-box': 'ui/BlackBox.tsx',
    'space-background': 'ui/SpaceBackground.tsx',
    'gravitational-vortex': 'ui/GravitationalVortex.tsx',
    'black-hole-3d': 'ui/BlackHole.tsx',
    'blooming-flower': 'ui/BloomingFlower.tsx',
    'chandelier': 'ui/Chandelier.tsx',
    'black-hole-background': 'ui/BlackHoleBackground.tsx',
    'mouse-gravity-background': 'ui/MouseGravityBackground.tsx',
    'lizard-cursor': 'ui/LizardCursor.tsx',
    '3d-tubes-cursor': 'ui/ThreeDTubesCursor.tsx',
    'aurora-cursor': 'ui/AuroraCursor.tsx',
    'magnetic-cursor': 'ui/MagneticCursor.tsx',
    'black-hole-cursor': 'ui/BlackHoleCursor.tsx',
    'target-cursor': 'ui/TargetCursor.tsx',
    'heart-cursor': 'ui/HeartCursor.tsx',
    'venom-cursor': 'ui/VenomCursor.tsx',
    'galaxy-button': 'ui/GalaxyButton.tsx',
    'liquid-fill-button': 'ui/LiquidFillButton.tsx',
    'orbit-button': 'ui/OrbitButton.tsx',
    'rainbow-button': 'ui/rainbow-button.tsx',
    'marquee-hover-button': 'ui/marquee-hover-button.tsx',
    'corner-border-button': 'ui/corner-border-button.tsx',
    'payment-transaction-button': 'ui/payment-transaction-button.tsx',
    'magic-card-effect': 'ui/magic-card.tsx',
    'border-beam': 'ui/border-beam.tsx',
    'grid-background': 'ui/background-boxes.tsx',
    'sparkles-background': 'ui/sparkles-background.tsx',
    '3d-rubiks-cube': 'ui/RubiksCube.tsx',
    '3d-landing-page': 'ui/ThreeDLandingPage.tsx',
    'interactive-hover-button': 'ui/interactive-hover-button.tsx',
  };

  const relativePath = mapping[componentId];
  if (relativePath) {
    try {
      const fullPath = path.join(FRONTEND_COMPONENTS_PATH, relativePath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (e) {
      console.error(`Failed to read component at ${relativePath}`, e);
    }
  }

  // Fallback: try common patterns
  const toPascalCase = (str) => str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join('');
  const pascalName = toPascalCase(componentId);
  const possiblePaths = [
    path.join('ui', `${pascalName}.tsx`),
    path.join('ui', `${componentId}.tsx`),
    path.join('animations', `${pascalName}.tsx`),
    path.join('animations', `${componentId}.tsx`),
    path.join('animations/VisualEffects', `${pascalName}.tsx`),
  ];

  for (const p of possiblePaths) {
    try {
      const fullPath = path.join(FRONTEND_COMPONENTS_PATH, p);
      await fs.access(fullPath);
      return await fs.readFile(fullPath, 'utf-8');
    } catch (e) {
      // Ignore and try next
    }
  }

  console.warn(`[promptService] Could not resolve source code for component: ${componentId}`);
  return null;
};

/**
 * Generates the AI Vibe Prompt based on component metadata and exact source code.
 */
export const generateVibePrompt = async (componentId, system = 'advance') => {
  const sourceCode = await resolveSourceCode(componentId);

  const baseSpec = (
    ANTIGRAVITY_PROMPTS[componentId] ||
    LOVABLE_PROMPTS[componentId] ||
    CLAUDE_PROMPTS[componentId] ||
    `Interactive React component with fluid animations and responsive styling.`
  );

  const manifest = {
    componentId,
    displayName: componentId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
    category: 'UI Component',
    description: baseSpec.split('\n')[0].replace(/^#+\s*/, '') || `High-performance ${componentId} animation component.`,
    sourceCode: sourceCode || '// Full interactive source available in component studio',
    animationEngine: sourceCode?.includes('gsap') ? 'gsap' : sourceCode?.includes('three') ? 'three.js' : 'framer-motion',
    interactionTriggers: ['mount', 'hover', 'state-change'],
    dependencies: {
      npm: {
        'framer-motion': '^11.0.0',
        'lucide-react': '^0.400.0',
        'clsx': '^2.1.0',
        'tailwind-merge': '^2.2.0'
      }
    },
    props: [],
    knownGotchas: ['Ensure parent container has relative positioning and appropriate bounding dimensions.']
  };

  const builder = TOOL_BUILDERS[system] || TOOL_BUILDERS.advance;
  return builder(manifest);
};

export const getComponentSource = async (componentId) => {
  return await resolveSourceCode(componentId);
};
