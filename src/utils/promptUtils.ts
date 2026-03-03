export type AISystem = 'antigravity' | 'lovable' | 'cursor';

interface PromptData {
    animationName: string;
    language: 'js' | 'ts';
    styling: 'tailwind' | 'css';
}

export const generateVibePrompt = (tool: AISystem, data: PromptData): string => {
    const { animationName, language, styling } = data;
    const langFull = language === 'ts' ? 'TypeScript' : 'JavaScript';
    const styleFull = styling === 'tailwind' ? 'Tailwind CSS' : 'Vanilla CSS';

    const baseRequirements = `
- Feature: ${animationName}
- Technology: React, ${langFull}, ${styleFull}
- Core Logic: Strictly preserve existing UI layout, theme, and spacing.
- Animation: Must be smooth, high-performance, and production-ready.
- Interactivity: Include a clear way to trigger/reset the animation.
`;

    const templates: Record<AISystem, string> = {
        antigravity: `
# GOAL: Implement ${animationName}
Develop a premium, highly-interactive text animation component.

## SYSTEM REQUIREMENTS
${baseRequirements}

## TECHNICAL SPECIFICATIONS
- Use modern best practices for ${langFull} and ${styleFull}.
- Ensure the animation logic is encapsulated and reusable.
- Provide a clean, modular implementation without external animation libraries if possible, or use framer-motion/gsap if specified in the existing codebase.

## OUTPUT RULES
- Do NOT modify the surrounding page structure.
- Return only the component code and necessary styles.
- Include a brief comment on how to integrate the component.
`,
        lovable: `
I want to add a beautiful "${animationName}" to my React project.

### Technical Details:
- Language: ${langFull}
- Styling: ${styleFull}
${baseRequirements}

### Design Vibe:
- Modern, premium, and professional.
- Smooth transitions and subtle micro-interactions.
- Must work perfectly on all screen sizes.

Please provide the complete, working code that I can drop directly into my project. Make sure it doesn't break any existing styles!
`,
        cursor: `
Implement ${animationName} component.
Stack: React, ${langFull}, ${styleFull}.

Requirements:
${baseRequirements}

Implementation Logic:
1. Create a standalone component for the animation.
2. Use ${styling === 'tailwind' ? 'Tailwind utility classes' : 'scscoped CSS'} for styling.
3. Ensure performance optimization for high-density text.
4. No extra explanations, just clean, production-ready code.
`
    };

    return templates[tool].trim();
};
