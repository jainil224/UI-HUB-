export type AISystem = 'antigravity' | 'lovable' | 'cursor' | 'claude' | 'advance';

export interface VibeMeta {
    behavior: string;
    states: {
        from: string;
        to: string;
    };
    cssProperties: string[];
    description?: string;
    libraries?: string[];
    requirements?: string[];
}

export interface ComponentManifest {
    componentId: string;
    displayName: string;
    category: string;
    description: string;
    sourceCode: string;
    animationEngine: string;
    interactionTriggers: string[];
    dependencies: {
        npm: Record<string, string>;
        peerNotes?: string;
    };
    props: Array<{ name: string; type: string; required?: boolean }>;
    knownGotchas?: string[];
}

export function analyzeAnimationFeatures(sourceCode: string) {
    const features: string[] = [];
    const packages: Record<string, string> = {
        'framer-motion': '^11.0.0',
        'lucide-react': '^0.400.0',
        'clsx': '^2.1.0',
        'tailwind-merge': '^2.2.0'
    };

    if (!sourceCode) return { features: ['Fluid React motion with Tailwind CSS transitions'], packages };

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

export function depsLine(deps: { npm?: Record<string, string> }): string {
    const pkgs = (deps && deps.npm) ? Object.keys(deps.npm) : ['framer-motion', 'lucide-react', 'clsx', 'tailwind-merge'];
    return pkgs.length ? `Install: \`npm install ${pkgs.join(" ")}\`` : "No extra dependencies.";
}

export function codeBlock(sourceCode: string, fileName = "Component.tsx"): string {
    return `\`\`\`tsx\n// ${fileName}\n${sourceCode ? sourceCode.trim() : '// Source code available in component studio'}\n\`\`\``;
}

/**
 * 1. ADVANCE Template (Flagship master format from vibeprompt.md)
 */
export function buildAdvancePrompt(m: ComponentManifest): string {
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

> UI HUB universal component blueprint. This prompt is tool-agnostic — it works with any AI tool (Cursor, Claude, Lovable, Antigravity, ChatGPT, GitHub Copilot, etc.). Paste it into whichever assistant you use.

# COMPONENT BLUEPRINT: ${m.displayName}

## Overview
${m.description}

## Category
${m.category}

## Animation Engine & Techniques Used
- **Engine**: ${m.animationEngine}
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

## Reference Implementation (build a faithful equivalent of this exact code)
${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

## Task
Recreate this component in the current project, matching the animation timing, easing, and visual behavior exactly. Adapt import paths and styling tokens to match this project's conventions, but do not simplify or omit any part of the interaction. Output the complete 100% working single-file React component.`;
}

/**
 * 2. Antigravity Template (Explicit Do / Don't Scoping from vibeprompt.md)
 */
export function buildAntigravityPrompt(m: ComponentManifest): string {
    const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
    const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount, hover";
    const propsList = m.props?.length ? m.props.map(p => p.name).join(", ") : "standard component props";

    return `Build a React component called "${m.displayName}".

**What it does:** ${m.description}

**Animation Techniques Used:**
${features.map(f => `- ${f}`).join("\n")}

**Reference code (do not deviate from the animation logic below):**
${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

**Requirements:**
- Animation engine: ${m.animationEngine}
- Triggers on: ${triggers}
- ${depsLine({ npm: { ...packages, ...(m.dependencies?.npm || {}) } })}
- Props: ${propsList}

**Do not:** simplify the animation, remove easing curves, or change timing values.
**Do:** adapt class names/imports to fit the host project, keep TypeScript types, and output 100% complete drop-in production code.`;
}

/**
 * 3. Claude Template (Structural Deconstruction & Single-File Mandate from vibeprompt.md)
 */
export function buildClaudePrompt(m: ComponentManifest): string {
    const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
    const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount, hover";
    const depsList = Object.keys(packages).join(", ");
    const propsList = m.props?.length ? m.props.map(p => `${p.name}: ${p.type}`).join(", ") : "standard React props";

    return `I want you to recreate the following React component exactly, then adapt it to drop into my project.

Component: ${m.displayName}
What it should look/feel like: ${m.description}

Animation & Physics Techniques Used:
${features.map(f => `- ${f}`).join("\n")}

Here is the exact reference implementation — use it as ground truth for structure, animation values, and easing:

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Please:
1. Reproduce the same visual/motion behavior (engine: ${m.animationEngine}, triggers: ${triggers}).
2. Keep it a single self-contained component if possible.
3. List any npm packages needed (expected: ${depsList}).
4. Preserve the prop interface: ${propsList}.
5. Output the complete 100% working single-file TSX component with zero placeholders.`;
}

/**
 * 4. Lovable Template (Plain-language visual behavior first from vibeprompt.md)
 */
export function buildLovablePrompt(m: ComponentManifest): string {
    const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
    const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "page load, user interaction";
    const depsList = Object.keys(packages).join(", ");

    return `Create a ${m.displayName} component for my web app.

Visual description: ${m.description}
It should react to: ${triggers}.

Animation Stack & Techniques Used:
${features.map(f => `- ${f}`).join("\n")}

Use this reference implementation as your guide for exact animation timing and structure — port the logic faithfully even if you restructure the surrounding files:

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Required packages: ${depsList}.
Make sure it's responsive and works on mobile. Output the full single-file component code.`;
}

/**
 * 5. Cursor Template (Concise, typed IDE prompt from vibeprompt.md)
 */
export function buildCursorPrompt(m: ComponentManifest): string {
    const { features, packages } = analyzeAnimationFeatures(m.sourceCode);
    const triggers = m.interactionTriggers?.length ? m.interactionTriggers.join(", ") : "mount";
    const depsList = Object.keys(packages).join(", ");
    const propsList = m.props?.length ? m.props.map(p => `${p.name} (${p.type})`).join(", ") : "none";

    return `Add a new component: ${m.displayName}

${m.description}

Animation & Physics Techniques:
${features.map(f => `- ${f}`).join("\n")}

Reference implementation (match animation values exactly, adapt paths/imports to this repo):

${codeBlock(m.sourceCode, `${m.componentId}.tsx`)}

Deps needed: ${depsList}
Props: ${propsList}

Output 100% complete single-file TypeScript code. No explanations.`;
}

