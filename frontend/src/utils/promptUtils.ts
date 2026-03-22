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
    const { id, animationName, language, styling, meta, code } = data;
    const langFull = language === 'ts' ? 'TypeScript (TSX)' : language === 'js' ? 'JavaScript (JSX)' : 'HTML/CSS';
    const styleFull = styling === 'tailwind' ? 'Tailwind CSS' : 'Vanilla CSS';
    const resolvedCode = resolveTrueSourceCode(code);

    // ── Claude Master Reconstruction Logic ──
    if (tool === 'claude') {
        const baseOverride = CLAUDE_PROMPTS[id] || '';
        const extractedInfo = baseOverride.match(/## Component Info\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedTech = baseOverride.match(/## Tech Stack\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedReqs = baseOverride.match(/## Requirements\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedProps = baseOverride.match(/## Props\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedPerf = baseOverride.match(/## Performance\s+([\s\S]*?)$|## Performance\s+([\s\S]*?)\s+---/)?.[1] || baseOverride.match(/## Performance\s+([\s\S]*?)$/)?.[1];

        const finalInfo = extractedInfo || `Name: ${animationName}\nType: ${meta.behavior.split(' ')[0]} / Interactive Component`;
        const finalTech = extractedTech || `* React 18+\n* TypeScript (TSX)\n* Tailwind CSS\n* Framer Motion (Main)\n* lucide-react (icons)\n* clsx / tailwind-merge (cn utility)`;
        const finalReqs = extractedReqs || (meta.requirements || ['Dynamic physics/animation loop', 'Interactive mouse interaction', 'High-fidelity aesthetics']).map(req => `* ${req}`).join('\n');
        const finalProps = extractedProps || `* children: React.ReactNode — wrapper content.\n* className: string — layout context.`;
        const finalPerf = (extractedPerf || `* GPU-accelerated transforms.\n* Minimal re-renders.\n* Efficient cleanup.`).trim();

        return `
# UI HUB • CLAUDE PROMPT

## Role
You are an expert frontend engineer.

## Task
Generate a production-ready React component based on the specifications below.

## Rules
* Follow all instructions strictly
* Return ONLY the final code
* Do NOT include explanations
* Ensure clean, optimized, and maintainable code

---

## Component Info
${finalInfo}

---

## Tech Stack
${finalTech}

---

## Requirements
${finalReqs}

---

## CODE REFERENCE
### Architecture & Motion Analysis
1. **Behavioral Logic**: ${meta.behavior}
2. **Motion Sequence**: [${meta.states.from}] → [${meta.states.to}] over precise easing curves.
3. **Interactive Dynamics**: Real-time response to user interaction (hover/click) using hardware-accelerated transforms.

### Master Source Code (Fidelity: 100%)
${resolvedCode ? `
\`\`\`tsx
${resolvedCode}
\`\`\`
` : '// Source code available upon request.'}

---

## Props
${finalProps}

---

## Performance
${finalPerf}
`.trim();
    }

    // ── Antigravity Master Reconstruction Logic ──
    if (tool === 'antigravity') {
        const baseOverride = ANTIGRAVITY_PROMPTS[id] || '';
        const extractedGoal = baseOverride.match(/## GOAL\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedFeatures = baseOverride.match(/## FEATURES \(STRICT – DO NOT SKIP\)\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedProps = baseOverride.match(/## PROPS \(with defaults\):\s+([\s\S]*?)\s+---/)?.[1]?.trim();
        const extractedRequirements = baseOverride.match(/## IMPLEMENTATION REQUIREMENTS\s+([\s\S]*?)\s+---/)?.[1]?.trim();

        const finalGoal = extractedGoal || meta.description || meta.behavior;
        const finalFeatures = extractedFeatures || (meta.requirements || ['Dynamic physics loop', 'Interactive influence', 'Aesthetic precision']).map(req => `* **${req}**: Implement with precision.`).join('\n');
        const finalProps = extractedProps || `- className: string = '' — layout context.\n- interactive: boolean = true — responds to mouse.`;

        return `
# UI HUB • ANTIGRAVITY MASTER PROMPT

## SYSTEM (DO NOT IGNORE)
- You are a senior frontend engineer and WebGL/animation expert.
- Your task is to generate a **fully working, production-ready React component**.
- Return ONLY code. One single complete file. Do NOT explain.
- Follow structure exactly.

---

## TASK
Build a high-performance React component with "${animationName}" logic.

---

## COMPONENT INFO
- Name: ${animationName}
- Type: ${meta.behavior.split(' ')[0]} / High-Fidelity Interaction

---

## GOAL
${finalGoal}
- Dynamics: [${meta.states.from}] → [${meta.states.to}]
- Behavior: ${meta.behavior}

---

## TECH STACK
- React 18+ (Next.js/Vite optimized)
- TypeScript (TSX)
- Styling: ${styleFull}
- Main Animation: ${meta.libraries?.join(', ') || 'Framer Motion (Main)'}
- Utilities: lucide-react (icons), clsx, tailwind-merge

---

## FEATURES (STRICT – DO NOT SKIP)
${finalFeatures}

---

## CODE[REACT]
${resolvedCode ? `
\`\`\`tsx
${resolvedCode}
\`\`\`
` : '```tsx\n// Source code reference requested.\n```'}

---

## PROPS (with defaults):
${finalProps}

---

## IMPLEMENTATION REQUIREMENTS
${extractedRequirements || `1. Physics Loop: Hardware-accelerated.\n2. Optimization: Sustain 60fps.\n3. Cleanup: Proper disposal.`}

---

## PERFORMANCE RULES
* Keep the complexity balanced (60fps on mobile/desktop).
* Zero external assets; rely on local logic.

---

## FINAL OUTPUT
* Provide the complete, single-file code block under the CODE[REACT] tag.
`.trim();
    }

    // ── Advance Master Prompt Logic ──
    if (tool === 'advance') {
        const libs = meta.libraries || ['framer-motion', 'clsx', 'tailwind-merge', 'lucide-react'];
        const requirements = meta.requirements || [`${animationName} core logic`, `Fluid transitions`, 'High-fidelity aesthetic'];
        const exactReactText = resolvedCode && resolvedCode.trim() ? `
# 📜 EXACT SOURCE CODE (COPY-PASTE EXACTLY)

REACT[
\`\`\`tsx
${resolvedCode}
\`\`\`
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
You are an Elite Creative Technologist. Your goal is to provide a 100% faithful replication.

# 🎨 VISUAL ANALYSIS & VIBE
- **Animation Name**: ${animationName}
- **Behavior**: ${meta.behavior}
- **Dynamics**: [${meta.states.from}] → [${meta.states.to}]

# 🛠️ TECHNICAL STACK
- **Core**: React 18+
- **Styling**: ${styleFull}
- **Animation**: ${libs[0]}

# 🏗️ ARCHITECTURAL REQUIREMENTS
${requirements.map((req, i) => `${i + 1}. **${req}**: Implement with precision.`).join('\n')}
${exactReactText}

# 📝 TECHNICAL ANALYSIS
1. Architecture Breakdown: Structure analysis.
2. Animation Physics: Easing and vibe.
3. State Management: Reactive flow.
4. Performance: Maintain 60fps.

# ⚠️ CRITICAL RULES
- Use 100% Type Safety.
- Focus on micro-interactions.
`.trim();
    }

    // ── Cursor Master Prompt Logic ──
    if (tool === 'cursor') {
        return `
# ROLE: Senior UI Engineer & Creative Technologist
# TASK: Replicate UI Component "${animationName}" with 100% Fidelity

## PHASE 1: DEEP COMPONENT ANALYSIS
- **Logical Behavior**: ${meta.behavior}
- **Motion Dynamics**: Transitioning from [${meta.states.from}] to [${meta.states.to}].
- **Visual Identity**: High-fidelity, premium aesthetics using ${styleFull}.

## PHASE 2: ARCHITECTURAL DESIGN
- **State Strategy**: Use modern React hooks for optimal reactivity.
- **Animation Orchestration**: Leverage hardware-accelerated transforms.
- **Performance**: Minimize re-renders; ensure 60fps interaction.

## PHASE 3: PRODUCTION IMPLEMENTATION
- **Requirement**: Provide a single-file, 100% ready-to-use React component.
- **Dependencies**: React 18+, lucide-react, clsx, tailwind-merge.
- **Standard**: Clean, modular, and type-safe ${langFull.replace(/ \(.*\)/, '')}.

## PHASE 4: CODING GUIDELINES
- **Clean Code**: Use intuitive variable naming and follows modern best practices.
- **Accessibility**: Include proper ARIA roles and labels.
- **Dark Mode**: Optimize for deep-black (#000) backgrounds.
- **Responsiveness**: Ensure adaptation to screen sizes.

Please analyze the above specifications and provide the complete implementation now.
`.trim();
    }

    // ── Lovable Master Prompt Logic ──
    if (tool === 'lovable') {
        return LOVABLE_PROMPTS[id] || `
# ROLE: Senior AI Coding Expert (Lovable)
# TASK: Create premium UI Component "${animationName}"
# SPECS: ${meta.behavior} | ${styleFull} | ${langFull}
# RULES: Return ONLY code. Single file. High fidelity.
`.trim();
    }

    return '';
};


