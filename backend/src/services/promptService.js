import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { ANTIGRAVITY_PROMPTS } from '../data/prompts/antigravityPrompts.js';
import { CLAUDE_PROMPTS } from '../data/prompts/claudePrompts.js';
import { LOVABLE_PROMPTS } from '../data/prompts/lovablePrompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to frontend components source code
const FRONTEND_COMPONENTS_PATH = path.resolve(__dirname, '../../../frontend/src/components');

/**
 * Resolves the source code of a component by its ID.
 * Maps component IDs to their file paths in the frontend.
 */
const resolveSourceCode = async (componentId) => {
  // Mapping logic similar to what was in frontend componentData or promptUtils
  // For now, we'll try to find it in ui/ or animations/
  const searchDirs = ['ui', 'animations', 'animations/VisualEffects'];
  
  // Convert kebab-case ID to PascalCase for the filename if needed
  // But many components are in directories with their ID or similar
  // Let's look at some examples from componentData.tsx
  // Robot 3D Background -> '@/components/ui/Robot3DBackground'
  // corners-border-button -> '@/components/animations/VisualEffects' (SpotlightCards?)
  
  // This mapping needs to be accurate. 
  // For simplicity, let's assume a few common patterns or just hardcode some for now.
  const mapping = {
    'robot-3d-background': 'ui/Robot3DBackground.tsx',
    'interactive-webgl-scene': 'ui/InteractiveWebGLScene.tsx',
    '3d-scroll-animation': 'ui/ScrollAnimation3D.tsx',
    '3d-slider': 'ui/ThreeDSlider.tsx',
    'spotlight-cards': 'animations/VisualEffects/index.tsx', 
    'hell-background': 'animations/VisualEffects/index.tsx',
    'interactive-grid-background': 'ui/InteractiveGridBackground.tsx',
    'isometric-grid-background': 'ui/isometric-grid-background.tsx',
    'space-background': 'ui/SpaceBackground.tsx',
    'black-hole-background': 'ui/BlackHoleBackground.tsx',
    'mouse-gravity-background': 'ui/MouseGravityBackground.tsx',
    'lizard-cursor': 'ui/LizardCursor.tsx',
    '3d-tubes-cursor': 'ui/ThreeDTubesCursor.tsx',
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
  
  return null;
};

export const generateVibePrompt = async (componentId, system) => {
  let masterPrompt = '';
  if (system === 'antigravity') masterPrompt = ANTIGRAVITY_PROMPTS[componentId];
  else if (system === 'claude') masterPrompt = CLAUDE_PROMPTS[componentId];
  else if (system === 'lovable') masterPrompt = LOVABLE_PROMPTS[componentId];
  
  if (!masterPrompt) return "Prompt not found for this component/system.";

  const sourceCode = await resolveSourceCode(componentId);
  
  if (sourceCode) {
    return `${masterPrompt}\n\n## REFERENCE CODE (FOR LOGIC AND PROPS):\n\n\`\`\`tsx\n${sourceCode}\n\`\`\``;
  }
  
  return masterPrompt;
};

export const getComponentSource = async (componentId) => {
  return await resolveSourceCode(componentId);
};
