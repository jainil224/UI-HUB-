/**
 * UI-HUB — Multi-AI Prompt Generator & Template Engine
 * Implementation based on vibeprompt.md specification
 */

function analyzeAnimationFeatures(sourceCode) {
  const features = [];
  const packages = {
    'framer-motion': '^11.0.0',
    'lucide-react': '^0.400.0',
    'clsx': '^2.1.0',
    'tailwind-merge': '^2.2.0'
  };

  if (!sourceCode) return { features: ['Fluid React animation with Tailwind CSS transitions'], packages };

  if (sourceCode.includes('framer-motion') || sourceCode.includes('motion/react') || sourceCode.includes('motion.')) {
    features.push('Framer Motion physics engine with spring-based motion curves & AnimatePresence');
    packages['framer-motion'] = '^11.0.0';
  }
  if (sourceCode.includes('gsap') || sourceCode.includes('ScrollTrigger')) {
    features.push('GSAP Timeline & ScrollTrigger for high-precision timeline animations');
    packages['gsap'] = '^3.12.0';
  }
  if (sourceCode.includes('requestAnimationFrame') || sourceCode.includes('cancelAnimationFrame')) {
    features.push('60FPS requestAnimationFrame physics loop for continuous mathematical rendering');
  }
  if (sourceCode.includes('<canvas') || sourceCode.includes('getContext("2d")')) {
    features.push('HTML5 Canvas 2D particle simulation with dynamic coordinate physics');
  }
  if (sourceCode.includes('three') || sourceCode.includes('WebGL') || sourceCode.includes('@react-three')) {
    features.push('WebGL 3D GPU-accelerated rendering pipeline');
    packages['three'] = '^0.160.0';
  }
  if (sourceCode.includes('useMotionValue') || sourceCode.includes('useSpring')) {
    features.push('Reactive MotionValues with damped spring interpolations for cursor/hover tracking');
  }
  if (sourceCode.includes('clientX') || sourceCode.includes('clientY') || sourceCode.includes('onMouseMove')) {
    features.push('Real-time Pointer & Cursor Tracking with radial bounding-box mathematics');
  }

  if (features.length === 0) {
    features.push('Hardware-accelerated CSS3 Transitions, Keyframes, and Tailwind GPU transforms');
  }

  return { features, packages };
}

function depsLine(deps) {
  const pkgs = (deps && deps.npm) ? Object.keys(deps.npm) : ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'];
  return pkgs.length ? `Install: \`npm install ${pkgs.join(" ")}\`` : "No extra dependencies.";
}

function codeBlock(sourceCode, fileName = "Component.tsx") {
  return `\`\`\`tsx\n// ${fileName}\n${sourceCode ? sourceCode.trim() : '// Source code available in component studio'}\n\`\`\``;
}

/**
 * 1. ADVANCE Template (Flagship master/universal format)
 */
export function buildAdvancePrompt(m) {
  const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
  const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount, hover, state-transitions";
  const propsList = m.props?.length 
    ? m.props.map(p => `- \`${p.name}\`: ${p.type}${p.required ? " (required)" : " (optional)"}`).join("\n")
    : "- Standard React Component Props";
  const gotchas = m.knownGotchas?.length 
    ? m.knownGotchas.map(g => `- ${g}`).join("\n") 
    : "- Ensure parent container has proper bounding dimensions and overflow handling.";

  return `██╗   ██╗██╗    ██╗  ██╗██╗   ██╗██████╗ 
██║   ██║██║    ██║  ██║██║   ██║██╔══██╗
██║   ██║██║    ███████║██║   ██║██████╔╝
██║   ██║██║    ██╔══██║██║   ██║██╔══██╗
╚██████╔╝██║    ██║  ██║╚██████╔╝██████╔╝
 ╚═════╝ ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
===  UI HUB  •  UNIVERSAL BLUEPRINT  ===
> UI HUB universal component blueprint. This prompt is tool-agnostic — it works with any AI tool (Cursor, Claude, Lovable, Antigravity, ChatGPT, GitHub Copilot, etc.). Paste it into whichever assistant you use.

# COMPONENT BLUEPRINT: ${m.displayName || m.componentId}

## Overview
${m.description || `High-performance interactive React component with smooth physics-based animations.`}

## Category
${m.category || "UI Animation"}

## Animation Engine & Techniques Used
- **Engine**: ${m.animationEngine || "Framer Motion / Hardware-Accelerated CSS"}
- **Techniques Used**:
${features.map(f => `  - ${f}`).join("\n")}

## Interaction Triggers
${triggers}

## Dependencies
${depsLine({ npm: { ...packages, ...(m.dependencies?.npm || {}) } })}

## Props
${propsList}

## Known Gotchas
${gotchas}

## Reference Implementation (build a faithful equivalent of this)
${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

## Task
Recreate this component in the current project, matching the animation timing, easing, and visual behavior exactly. Adapt import paths and styling tokens to match this project's conventions, but do not simplify or omit any part of the interaction.`;
}

/**
 * 2. Antigravity Template (Explicit Do / Don't Scoping)
 */
export function buildAntigravityPrompt(m) {
  const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
  const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount, hover";
  const propsList = m.props?.length ? m.props.map(p => p.name).join(", ") : "standard component props";

  return `Build a React component called "${m.displayName || m.componentId}".

**What it does:** ${m.description || "Fluid interactive motion component with responsive styling."}

**Animation Techniques Used:**
${features.map(f => `- ${f}`).join("\n")}

**Reference code (do not deviate from the animation logic below):**
${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

**Requirements:**
- Animation engine: ${m.animationEngine || "Framer Motion / Motion Engine"}
- Triggers on: ${triggers}
- ${depsLine({ npm: { ...packages, ...(m.dependencies?.npm || {}) } })}
- Props: ${propsList}

**Do not:** simplify the animation, remove easing curves, or change timing values.
**Do:** adapt class names/imports to fit the host project, keep TypeScript types, and output 100% complete drop-in production code.`;
}

/**
 * 3. Claude Template (Architectural Deconstruction & Single-File Mandate)
 */
export function buildClaudePrompt(m) {
  const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
  const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount, hover";
  const depsList = Object.keys(packages).join(", ");
  const propsList = m.props?.length ? m.props.map(p => `${p.name}: ${p.type}`).join(", ") : "standard React props";

  return `I want you to recreate the following React component exactly, then adapt it to drop into my project.

Component: ${m.displayName || m.componentId}
What it should look/feel like: ${m.description || "Cinema-grade animated UI component with fluid micro-interactions."}

Animation & Physics Techniques Used to Build This:
${features.map(f => `- ${f}`).join("\n")}

Here is the exact reference implementation — use it as ground truth for structure, animation values, and easing:

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Please:
1. Reproduce the same visual/motion behavior (engine: ${m.animationEngine || "Framer Motion"}, triggers: ${triggers}).
2. Keep it a single self-contained component if possible.
3. List any npm packages needed (expected: ${depsList}).
4. Preserve the prop interface: ${propsList}.
5. Flag anything you had to change from the reference and why.`;
}

/**
 * 4. Lovable Template (Plain-language visual behavior first + full reference)
 */
export function buildLovablePrompt(m) {
  const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
  const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "page load, user interaction";
  const depsList = Object.keys(packages).join(", ");

  return `Create a ${m.displayName || m.componentId} component for my web app.

Visual description: ${m.description || "Interactive animated React component with smooth transitions and responsive styling."}
It should react to: ${triggers}.

Animation Stack & Techniques:
${features.map(f => `- ${f}`).join("\n")}

Use this reference implementation as your guide for exact animation timing and structure — port the logic faithfully even if you restructure the surrounding files:

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Required packages: ${depsList}.
Make sure it's responsive and works on mobile.`;
}

/**
 * 5. Cursor Template (Concise, typed IDE prompt)
 */
export function buildCursorPrompt(m) {
  const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
  const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount";
  const depsList = Object.keys(packages).join(", ");
  const propsList = m.props?.length ? m.props.map(p => `${p.name} (${p.type})`).join(", ") : "none";

  return `Add a new component: ${m.displayName || m.componentId}

${m.description || "High-performance React motion component."}

Animation & Physics Techniques:
${features.map(f => `- ${f}`).join("\n")}

Reference implementation (match animation values exactly, adapt paths/imports to this repo):

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Deps needed: ${depsList}
Props: ${propsList}
Triggers: ${triggers}

Create it as its own file, typed, no unused imports.`;
}

export const TOOL_BUILDERS = {
  advance: buildAdvancePrompt,
  antigravity: buildAntigravityPrompt,
  claude: buildClaudePrompt,
  lovable: buildLovablePrompt,
  cursor: buildCursorPrompt,
};
