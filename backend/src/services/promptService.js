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
    '3d-scroll-animation': 'ui/Scroll3DAnimation.tsx',
    '3d-slider': 'ui/ThreeDSlider.tsx',
    'spotlight-cards': 'animations/VisualEffects/index.tsx', 
    'hell-background': 'ui/HellBackground.tsx',
    'interactive-grid-background': 'ui/InteractiveGridBackground.tsx',
    'isometric-grid-background': 'ui/isometric-grid-background.tsx',
    'space-background': 'ui/SpaceBackground.tsx',
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
    'neon-flicker-button': 'ui/NeonFlickerButton.tsx',
    'orbit-button': 'ui/OrbitButton.tsx',
    'rainbow-button': 'ui/rainbow-button.tsx',
    'shatter-button': 'ui/shatter-button.tsx',
    'marquee-hover-button': 'ui/marquee-hover-button.tsx',
    'corner-border-button': 'ui/corner-border-button.tsx',
    'payment-transaction-button': 'ui/payment-transaction-button.tsx',
    'magic-card-effect': 'ui/magic-card.tsx',
    'border-beam': 'ui/border-beam.tsx',
    'grid-background': 'ui/background-boxes.tsx', // Example guess
    'sparkles-background': 'ui/sparkles-background.tsx',
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
      return await fs.readFile(fullPath, 'utf-8');
    } catch (e) {
      // Ignore and try next
    }
  }
  
  return null;
};

export const generateVibePrompt = async (componentId, system) => {
  let masterPrompt = '';
  const sourceCode = await resolveSourceCode(componentId);

  if (system === 'antigravity') {
    const basePrompt = ANTIGRAVITY_PROMPTS[componentId] || '';
    const header = '# UI HUB • ANTIGRAVITY MASTER PROMPT';
    const rulesTitle = '## 3. MASTER PERFORMANCE RULES';
    const performanceRules = `- **Smooth 60fps**: Use requestAnimationFrame and optimized calculations.
- **Resource Cleanup**: Properly clean up all listeners and observers on unmount.
- **Device Precision**: Handle window resize and high-DPI screens correctly.
- **Strict Logic**: Do not simplify or bypass complex physics or animation solvers.`;

    masterPrompt = `${header}

## 1. COMPONENT ANALYSIS (MANDATORY FIRST STEP)
Before writing any code, you MUST analyze the provided reference source code. 
- Identify the core animation logic, physics solvers, and state management.
- Understand the prop structure and styling patterns.
- Plan the reconstruction for 100% functional parity and visual excellence.

## 2. REFERENCE SOURCE CODE
Use this exact code as your blueprint for logic, props, and structure:

\`\`\`tsx
${sourceCode || '// Source code not available, please use component objectives.'}
\`\`\`

${rulesTitle}
${performanceRules}

## 4. COMPONENT OBJECTIVES & SPECIFICATIONS
${basePrompt.replace(/# UI HUB • (ANTIGRAVITY|ADVANCED) (MASTER|ELITE) PROMPT/, '').trim()}

## 5. FINAL INSTRUCTION
Ensure the final output is a SINGLE, complete file without any explanations or markdown outside the code block.
`;
  } else if (system === 'advance') {
    const basePrompt = ANTIGRAVITY_PROMPTS[componentId] || '';
    
    masterPrompt = `# UI HUB • ADVANCED ELITE COMPONENT ARCHITECT

## PHASE 1: COMPONENT DECONSTRUCTION & LOGIC AUDIT
Perform a recursive analysis of the provided reference source code below. You MUST identify:
- **Mathematical Foundations**: Core algorithms, physics solvers, or geometric computations.
- **State Architecture**: Internal reactive dependencies and complex lifecycle hooks.
- **Performance Geometry**: GPU-accelerated transform patterns and rendering optimizations.
- **Style DNA**: Precise Tailwind utility patterns and CSS-in-JS logic.

## PHASE 2: TECHNICAL STACK & DEPENDENCY ENFORCEMENT
The output MUST adhere to these industrial standards:
- **Language**: Strict TypeScript (Define all Interfaces and Types).
- **Core**: React 18+ (Functional Components with hooks).
- **Styling**: Tailwind CSS (Utility-first, responsive-ready).
- **Icons**: Lucide React.
- **Motion**: Framer Motion / Three.js / Canvas API (Mirror the reference's engine).

## PHASE 3: GROUND TRUTH BLUEPRINT (SOURCE CODE)
Use this exact code as the absolute authority for logic and structure:

\`\`\`tsx
${sourceCode || '// Source code not available, please use component objectives.'}
\`\`\`

## PHASE 4: REALITY & COMPLETENESS MANDATE
- **100% Real Component**: NO pseudo-code. NO placeholders. NO "rest of code here" comments.
- **Production-Ready**: The file must be ready to be dropped into a production environment and work immediately.
- **Full Parity**: Match every feature, prop, and animation frame of the original.
- **Responsive & Accessible**: Implement mobile-first responsiveness and ARIA best practices.

## PHASE 5: COMPONENT SPECIFICATIONS
${basePrompt.replace(/# UI HUB • (ANTIGRAVITY|ADVANCED) (MASTER|ELITE) PROMPT/, '').trim()}

## PHASE 6: FINAL EXECUTION COMMAND
Return ONLY the complete, single-file TSX code within a markdown block. NO preamble. NO post-commentary.
`;
  } else if (system === 'claude') {
    const basePrompt = CLAUDE_PROMPTS[componentId] || '';
    masterPrompt = `[ ARCHITECTURAL BLUEPRINT: CLAUDE ]

== PHASE 1: COMPONENT DECONSTRUCTION ==
Before proceeding to implementation, perform a deep structural analysis of the reference code:
- Map all internal states, reactive dependencies, and lifecycle effects.
- Audit the prop interface, event handlers, and TypeScript definitions.
- Identify critical performance bottlenecks and synchronization points.
- Align with the specific functional objectives and visual intent outlined below.

== PHASE 1.1: TECHNOLOGY AUDIT ==
The original component was built using the following stack. You MUST adhere to these technologies exactly:
- **Core**: React 18+ (Functional Components)
- **Language**: TypeScript (Strict Typing)
- **Styling**: Tailwind CSS (Utility-first)
- **Animations**: Framer Motion / CSS Transitions (as applicable in reference)
- **Icons**: Lucide React
- **Utilities**: clsx, tailwind-merge

== PHASE 2: BLUEPRINT REFERENCE ==
Use the following source as the absolute ground-truth for architecture and logic:

\`\`\`tsx
${sourceCode || '// Source code not available, please use component objectives.'}
\`\`\`

== PHASE 3: IMPLEMENTATION GUIDELINES ==
- **Rigorous Typing**: All props, states, and refs must be strictly typed. Avoid 'any' at all costs.
- **Hook Integrity**: Maintain perfect hook dependency arrays and exhaustive effect cleanup.
- **Responsive Design**: Ensure the component is fully responsive using Tailwind breakpoints.
- **Refined Styling**: Match the exact aesthetic, spacing, and timing of the reference code.

== PHASE 4: COMPONENT SPECIFICATIONS ==
${basePrompt.replace(/# UI HUB • CLAUDE PROMPT/, '').trim()}

== PHASE 5: EXECUTION MANDATE ==
Deliver a **100% working, production-ready React component**. 
- The output MUST be a perfect, drop-in replacement for the reference system.
- Return ONLY the complete TSX file within a markdown code block.
- NO preamble, NO post-commentary, NO conversational filler.
- Ensure all imports (React, Lucide, Framer Motion) are correctly placed at the top.
`;
  } else if (system === 'lovable') {
    const basePrompt = LOVABLE_PROMPTS[componentId] || '';
    masterPrompt = `# UI HUB • LOVABLE VISUAL RECONSTRUCTION

>> INTERFACE DYNAMICS
Replicate the exact aesthetic and interaction feel described in the following concept. Focus on smooth transitions, precise spacing, and visual high-fidelity.

>> COMPONENT ARCHITECTURE
- Follow the React component structure defined in the specifications.
- Ensure all Tailwind classes align with the premium design intent.
- Maintain strict functional parity with the described objectives.

>> REPLICATION MANDATE
${basePrompt.replace(/# UI HUB • LOVABLE PROMPT/, '').trim()}

Deliver a **100% working, single-file React component**. NO markdown outside the code block.
`;
  } else if (system === 'cursor') {
    const basePrompt = CLAUDE_PROMPTS[componentId] || ANTIGRAVITY_PROMPTS[componentId] || '';
    if (basePrompt) {
      masterPrompt = `### UI HUB • CURSOR LOGIC MASTER

[ LOGIC & STATE FLOW ]
Engineer a high-performance React component by meticulously implementing the underlying logic and state transitions described below.

[ DESIGN SYSTEM ALIGNMENT ]
- Use professional Tailwind CSS patterns for layout and styling.
- Ensure 100% functional parity with the technical specifications.
- Optimize all hooks and effects for maximum rendering efficiency.

[ FINAL IMPLEMENTATION RULES ]
${basePrompt.replace(/# UI HUB • (ANTIGRAVITY|CLAUDE) MASTER PROMPT/, '').trim()}

Return ONLY the complete TSX file. NO explanation. NO preamble.
`;
    }
  }
  
  if (!masterPrompt) return `Prompt not found for this component (${componentId}) / system (${system}).`;

  return masterPrompt;
};

export const getComponentSource = async (componentId) => {
  return await resolveSourceCode(componentId);
};
