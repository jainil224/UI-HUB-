export type AISystem = 'antigravity' | 'lovable' | 'cursor';

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
`
    };

    return instructions[tool].trim();
};
