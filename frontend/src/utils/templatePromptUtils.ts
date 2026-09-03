import { TemplateItem } from '../data/templatesData';
import { TEMPLATE_SOURCE_CODE } from '../data/templateSourceCode';
import {
    AISystem,
    ComponentManifest,
    buildAdvancePrompt,
    buildAntigravityPrompt,
    buildClaudePrompt,
    buildLovablePrompt,
    buildCursorPrompt
} from './promptUtils';

/**
 * Builds a prompt for a website template using the exact prompt structure
 * from the component library (Advance, Antigravity, Claude Code, Lovable, Cursor)
 * and embeds the exact production code used to build the website/template.
 */
export function buildTemplatePrompt(template: TemplateItem, system: AISystem): string {
    const exactCode = TEMPLATE_SOURCE_CODE[template.id] || template.promptPreview;

    const manifest: ComponentManifest = {
        componentId: template.id,
        displayName: template.title,
        category: template.category,
        description: template.description,
        sourceCode: exactCode,
        animationEngine: template.animation || (
            exactCode.includes('three') 
                ? 'Three.js / WebGL GPU Pipeline' 
                : exactCode.includes('framer-motion') 
                    ? 'Framer Motion physics engine with spring-based curves' 
                    : 'HTML5 Canvas & Hardware-accelerated CSS3'
        ),
        interactionTriggers: ['mount', 'scroll', 'pointer tracking', 'hover state', 'responsive breakpoints'],
        dependencies: {
            npm: {
                'lucide-react': '^0.400.0',
                ...(exactCode.includes('framer-motion') ? { 'framer-motion': '^11.0.0' } : {}),
                ...(exactCode.includes('canvas-confetti') ? { 'canvas-confetti': '^1.9.0' } : {}),
                ...(exactCode.includes('three') ? { 'three': '^0.160.0' } : {}),
                'clsx': '^2.1.0',
                'tailwind-merge': '^2.2.0'
            }
        },
        props: [
            { name: 'className', type: 'string', required: false }
        ],
        knownGotchas: [
            'Ensure Google Fonts and Tailwind CSS utility classes specified in the component are available in your root layout.',
            'Ensure parent containers provide full viewport height and proper bounding dimensions for hero animations.'
        ]
    };

    switch (system) {
        case 'advance':
            return buildAdvancePrompt(manifest);
        case 'antigravity':
            return buildAntigravityPrompt(manifest);
        case 'claude':
            return buildClaudePrompt(manifest);
        case 'lovable':
            return buildLovablePrompt(manifest);
        case 'cursor':
            return buildCursorPrompt(manifest);
        default:
            return buildAdvancePrompt(manifest);
    }
}
