export type AISystem = 'antigravity' | 'lovable' | 'cursor' | 'advance';

export interface VibeMeta {
    behavior: string;
    states: {
        from: string;
        to: string;
    };
    cssProperties: string[];
}

interface PromptData {
    animationName: string;
    language: 'js' | 'ts';
    styling: 'tailwind' | 'css';
    meta: VibeMeta;
    code?: string;
}

export const generateVibePrompt = (tool: AISystem, data: PromptData): string => {
    const { animationName, language, styling, meta } = data;
    const langFull = language === 'ts' ? 'TypeScript' : 'JavaScript';
    const styleFull = styling === 'tailwind' ? 'Tailwind CSS' : 'Vanilla CSS';

    const baseContext = `
Animation: ${animationName}
Behavior: ${meta.behavior}
States:
- From: ${meta.states.from}
- To: ${meta.states.to}
Key CSS: ${meta.cssProperties.join(', ')}
Stack: React, ${langFull}, ${styleFull}
`;

    const instructions = {
        antigravity: `
# ROLE: Senior Frontend Engineer
# TASK: Implement ${animationName} component

## COMPONENT SPECIFICATIONS
${baseContext}

## IMPLEMENTATION RULES
1. **No UI Changes**: Strictly preserve the existing layout, theme, and spacing.
2. **Encapsulation**: Component must be self-contained and modular.
3. **Performance**: Use CSS transitions or framer-motion for 60fps performance.
4. **Trigger**: Implement a clear trigger mechanism (e.g., on mount or hover).
5. **Code Style**: Production-ready ${langFull} with clean architecture.

## OUTPUT FORMAT
- Return ONLY the component code.
- Ensure it is copy-paste ready into the UI-HUB project.
`,
        lovable: `
Hi! I want to add a beautiful "${animationName}" to my React site.

### What it should do:
${meta.behavior}
It moves from "${meta.states.from}" to "${meta.states.to}".

### My Tech Stack:
- Language: ${langFull}
- Styling: ${styleFull}

### Requirements:
- Make it look premium and smooth.
- It must be responsive and work well with my existing design.
- Please provide the full working code!
`,
        cursor: `
Implement ${animationName} component.
React, ${langFull}, ${styleFull}.

Meta:
- Behavior: ${meta.behavior}
- States: ${meta.states.from} -> ${meta.states.to}
- Styles: ${meta.cssProperties.join(', ')}

Guidelines:
- Modular implementation.
- Clean ${langFull} patterns.
- Direct output, no filler.
- Ensure 100% working logic.
`,
        advance: `// ==========================================
// UI HUB - AI EXPERT PROMPT
// ==========================================
// Component: ${animationName}
// Language: ${langFull} (${language.toUpperCase()}X)
// Source: https://ui-hub-design.vercel.app/
// Description: Premium, accessible, high-performance UI component.
// ==========================================

/* AI INSTRUCTION:
1. You are a Senior Frontend Engineer implementing a premium component from UI HUB (Lightswind UI).
2. INTEGRATION CHECKLIST:
   - Ensure dependencies are installed: npm i clsx tailwind-merge framer-motion
   - REQUIRED UTILITY: This component requires a 'cn' helper (lib/utils.ts):

ts
     import { clsx, type ClassValue } from "clsx";
     import { twMerge } from "tailwind-merge";
     export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

   - STYLING: Fully dark-mode compatible. Ensure Tailwind's 'dark' selector is active.
   - ACCESSIBILITY: Maintain all ARIA roles and semantic structure.
*/

// --- START OF COMPONENT CODE ---

${data.code || ''}

// --- END OF COMPONENT ---`
    };

    return instructions[tool].trim();
};
