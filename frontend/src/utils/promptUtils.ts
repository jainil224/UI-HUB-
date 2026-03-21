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
}

export const generateVibePrompt = (tool: AISystem, data: PromptData): string => {
    const { id, animationName, language, styling, meta, code } = data;
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
        return ANTIGRAVITY_PROMPTS[id];
    }

    // Fallback for Claude if no override exists
    if (tool === 'claude') {
        return code || '// Source code reference not available for this component.';
    }

    if (tool === 'advance') {
        const libs = meta.libraries || ['framer-motion', 'clsx', 'tailwind-merge', 'lucide-react'];
        const requirements = meta.requirements || [
            `${animationName} animation logic`,
            `Smooth transitions (${meta.states.from} → ${meta.states.to})`,
            'Responsive design',
            'Dark mode compatibility',
            'Clean TypeScript implementation'
        ];

        return `
# ==========================================
# UI HUB – ADVANCED AI PROMPT
# ==========================================

# Component: ${animationName.toLowerCase().replace(/\s+/g, '-')}
# Language: ${langFull}
# Source: https://ui-hub-design.vercel.app/
# Description: ${meta.description || 'Premium, accessible, high-performance UI component.'}
# Framework: React / Next.js
# Libraries: ${libs.join(', ')}

# ==========================================
# AI INSTRUCTION
# ==========================================

You are a Senior Frontend Engineer implementing a premium UI component for a modern website.

Your task is to build an advanced ${animationName} using ${libs[0]} with optimized performance, accessibility, and smooth interaction.

The component must follow modern React and TypeScript best practices.

# ==========================================
# INSTALL REQUIRED DEPENDENCIES
# ==========================================

npm install ${libs.join(' ')}

# ==========================================
# CREATE REQUIRED UTILITY
# ==========================================

File: lib/utils.ts

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

# ==========================================
# COMPONENT REQUIREMENTS
# ==========================================

Component Name:
${animationName.replace(/\s+/g, '')}.tsx

Required Features:

${requirements.map(req => `• ${req}`).join('\n')}
• Smooth animation using requestAnimationFrame or Framer Motion
• Dark mode compatibility
• Responsive full-screen rendering (if applicable)

# ==========================================
# PERFORMANCE REQUIREMENTS
# ==========================================

• Maintain smooth 60fps animation
• Properly dispose resources if using Canvas/WebGL
• Handle responsive window resize
• Avoid memory leaks
• Optimize rendering performance

# ==========================================
# OUTPUT REQUIREMENT
# ==========================================

Return the complete working component:

${animationName.replace(/\s+/g, '')}.tsx

The code must be:

• Production-ready  
• Fully typed with TypeScript  
• Clean and maintainable  
• Optimized for performance  


# ==========================================
# SOURCE CODE REFERENCE
# ==========================================

${code || '// Source code reference not available for this component.'}


# ==========================================
# IMPORTANT
# ==========================================

Do not modify layout structure.

Follow modern frontend best practices.

Use the SOURCE CODE REFERENCE as the primary blueprint to ensure 100% accuracy.

Return only the full working component code.
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
