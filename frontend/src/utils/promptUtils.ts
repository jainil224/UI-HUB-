import { LOVABLE_PROMPTS } from '../data/lovablePrompts';
import { ANTIGRAVITY_PROMPTS } from '../data/antigravityPrompts';
import { CLAUDE_PROMPTS } from '../data/claudePrompts';

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

interface PromptData {
    id: string;
    animationName: string;
    language: 'js' | 'ts' | 'html';
    styling: 'tailwind' | 'css';
    meta: VibeMeta;
    code?: string;
    vanillaCode?: string;
}

const rawComponents: Record<string, string> = import.meta.glob(
    ['../components/ui/**/*.tsx', '../components/animations/**/*.tsx'], 
    { query: '?raw', import: 'default', eager: true }
);

const resolveTrueSourceCode = (codePlaceholder?: string): string => {
    if (!codePlaceholder) return '';
    
    // Look for imports from @/components/... to find the true underlying source file
    const match = codePlaceholder.match(/import\s+[\w{}*,\s]+\s+from\s+['"]@\/(components\/(?:ui|animations)\/[\w-]+)['"]/);
    if (match) {
        const filePath = `../${match[1]}.tsx`;
        if (rawComponents[filePath]) {
            return rawComponents[filePath];
        }
    }
    
    return codePlaceholder;
};

export const generateVibePrompt = (tool: AISystem, data: PromptData): string => {
    const { id, animationName, language, styling, meta, code, vanillaCode } = data;
    const langFull = language === 'ts' ? 'TypeScript (TSX)' : language === 'js' ? 'JavaScript (JSX)' : 'HTML/CSS';
    const styleFull = styling === 'tailwind' ? 'Tailwind CSS' : 'Vanilla CSS';

    // ── Platform Overrides ──
    if (tool === 'claude' && CLAUDE_PROMPTS[id]) {
        return CLAUDE_PROMPTS[id];
    }

    if (tool === 'lovable' && LOVABLE_PROMPTS[id]) {
        return LOVABLE_PROMPTS[id];
    }

    if (tool === 'antigravity' && ANTIGRAVITY_PROMPTS[id]) {
        let promptText = ANTIGRAVITY_PROMPTS[id];
        const resolvedCode = resolveTrueSourceCode(code);
        
        if (resolvedCode && resolvedCode.trim()) {
            const codeBlock = `\n\`\`\`tsx\n${resolvedCode}\n\`\`\`\n`;
            if (promptText.includes('CODE[RECT]')) {
                promptText = promptText.replace('CODE[RECT]', `CODE[REACT]\n${codeBlock}`);
            } else if (promptText.includes('CODE[REACT]')) {
                promptText = promptText.replace('CODE[REACT]', `CODE[REACT]\n${codeBlock}`);
            } else {
                promptText += `\n\nCODE[REACT]\n${codeBlock}`;
            }
        }
        return promptText;
    }

    // Fallback for Claude if no override exists
    if (tool === 'claude') {
        return code || '// Source code reference not available for this component.';
    }

    if (tool === 'advance') {
        const libs = meta.libraries || ['framer-motion', 'clsx', 'tailwind-merge', 'lucide-react'];
        const requirements = meta.requirements || [
            `${animationName} core logic`,
            `Fluid transitions (${meta.states.from} → ${meta.states.to})`,
            'Responsive adaptations',
            'High-fidelity aesthetic'
        ];

        const resolvedCode = resolveTrueSourceCode(code);
        const exactReactText = resolvedCode && resolvedCode.trim() ? `
# 📜 EXACT SOURCE CODE (COPY-PASTE EXACTLY)

REACT[
\`\`\`tsx
${resolvedCode}
\`\`\`
]

TYPESCRIPT[
// The TypeScript interfaces and types are integrated within the React code above.
]

TAILWIND CSS[
/* Tailwind utility classes are applied directly via className attributes in the React code above. */
]
` : '';

        return `
# ==============================================================================
# 🧠 UI HUB: ADVANCED MASTER VIBE PROMPT (ELITE EDITION)
# ==============================================================================
# Role: Creative Technologist & Principal Frontend Architect
# Project: ${animationName} (High Performance Replication)
# ==============================================================================

# 🚀 OVERVIEW
You are an Elite Creative Technologist. Your singular goal is to provide the EXACT, 100% faithful replication of the provided Master Source Code.
DO NOT alter the visual aesthetics, shapes, colors, or physics unless explicitly requested by the user.
You must output the complete component using the exact code blocks provided below. Do not hallucinate new aesthetics or fall back to simple shapes (like dots instead of custom SVG paths).

# 🎨 VISUAL ANALYSIS & VIBE
- **Animation Name**: ${animationName}
- **Visual Aesthetic**: Premium, dark-themed, ultra-smooth interaction.
- **Physics of Motion**: 
    - From State: ${meta.states.from}
    - To State: ${meta.states.to}
    - Behavior: ${meta.behavior}
- **Aesthetic Direction**: ${meta.description || 'Modern brutalism with liquid-smooth transitions.'}

# 🛠️ TECHNICAL STACK
- **Core**: React 18+ (Next.js/Vite optimized)
- **Language**: ${langFull}
- **Styling**: ${styleFull} (High-precision layout)
- **Animation**: ${libs[0]} (Mastering spring physics & keyframe orchestration)
- **Utilities**: clsx, tailwind-merge (for dynamic class orchestration)

# 🏗️ ARCHITECTURAL REQUIREMENTS
${requirements.map(req => `1. **${req}**: Implement with precision.`).join('\n')}
${libs.includes('framer-motion') ? '2. **Spring Physics**: Use high-stiffness, low-damping springs for snappy responsiveness.' : ''}
3. **Performance First**: Utilize useMemo and useCallback to minimize re-renders.
4. **Clean Disposal**: Ensure all side effects and event listeners are properly cleaned up.
${exactReactText}
# 📝 TECHNICAL ANALYSIS & MASTER EXPLAINER

1. **Architecture Breakdown**: 
   Briefly explain the component's structure and why this implementation is superior (e.g., using "transform-gpu" for hardware acceleration).

2. **Animation Physics Analysis**: 
   Analyze the ${libs[0]} logic. Explain the easing curves and how they contribute to the "Premium Vibe".

3. **State Management Logic**: 
   Explain the reactive flow and how user interaction triggers the visual transformation.

4. **Performance Tuning**: 
   Identify the critical path for performance and how we maintain 60fps.

# ⚠️ CRITICAL RULES
- Use 100% Type Safety.
- No third-party assets (SVG/CSS only) unless provided in the code.
- Perfect responsive scaling.
- Focus on the "Micro-interactions" that make this Pro-tier.

# ==============================================================================
# END OF ADVANCED MASTER PROMPT
# ==============================================================================
`.trim();
    }

    const instructions = {
        antigravity: `
# ROLE: Senior AI Coding Expert (Antigravity)
# TASK: Create premium UI Component "${animationName}"

## VISUAL SPECS
- Behavior: ${meta.behavior}
- Dynamics: ${meta.states.from} → ${meta.states.to}
- Aesthetics: High-end, clean, brutalist-tech style.

## TECH SPECS
- Framework: React (Next.js/Vite optimized)
- Core: ${langFull.replace(/ \(.*\)/, '')}, ${styleFull}
- Main Animation: Framer Motion (use variants and spring transitions)
- Dependencies: lucide-react (icons), clsx, tailwind-merge

## CODE QUALITY RULES
1. Provide a single-file, production-ready component.
2. Use absolute precision in cubic-bezier values.
3. Ensure dark mode is the primary theme (#000 background).
4. Accessibility: Proper ARIA roles and keyboard support.

## FINAL OUTPUT
- Return ONLY the TypeScript/React code block. No explanations.
`,
        lovable: '',
        cursor: `
Generate high-fidelity React component: "${animationName}"
Stack: ${langFull.replace(/ \(.*\)/, '')}, ${styleFull}, Framer Motion.

Meta Specifications:
- Animation Path: ${meta.states.from} -> ${meta.states.to}
- Interactive Logic: ${meta.behavior}
- Key Properties: ${meta.cssProperties.join(', ')}

Coding Guidelines:
- Clean, modular code using modern ${langFull.replace(/ \(.*\)/, '')} patterns.
- Self-contained implementation (no external assets).
- Use Lucide-React for any necessary iconography.
- Focus on smooth 60fps transitions and performance.

Please provide the implementation now.
`,
        advance: '' // Handled above
    };

    return instructions[tool] || '';
};

