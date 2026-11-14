export * from './promptBuilders';
import {
    AISystem,
    ComponentManifest,
    analyzeAnimationFeatures,
    depsLine,
    codeBlock,
    buildAdvancePrompt,
    buildAntigravityPrompt,
    buildClaudePrompt,
    buildLovablePrompt,
    buildCursorPrompt,
} from './promptBuilders';
import { getApiBaseUrl } from './apiConfig';
import { ANTIGRAVITY_PROMPTS } from '../data/antigravityPrompts';
import { LOVABLE_PROMPTS } from '../data/lovablePrompts';
import { componentList } from '../data/componentData';
import { getComponentCode } from './codeUtils';
import { EMBEDDED_SOURCE_CODE } from '../data/embeddedSourceCode';
import { getComponentVariant } from '../data/componentVariants';

/**
 * Constructs a Manifest from component data and generates the prompt for the target AI tool.
 */
export const getFallbackVibePrompt = (componentId: string, system: AISystem, item?: any, variantId?: string, customizedSource?: string): string => {
    const comp = item || componentList.find(c => c.id === componentId);
    const title = comp?.title || componentId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');

    // Components with declared variants get a variant-specific blueprint, so the
    // prompt describes the mode the visitor is actually looking at. The source
    // itself stays the single combined file either way.
    const variant = getComponentVariant(componentId, variantId);
    const displayTitle = variant ? `${title} (${variant.label})` : title;
    
    // Resolve 100% exact full production source code. A live customization
    // (e.g. HexaSphere Wave/Speed/Power tweaked in the preview) takes priority
    // so the prompt embeds the code exactly as the visitor tuned it.
    let exactCode = customizedSource || EMBEDDED_SOURCE_CODE[componentId];
    if (!exactCode || exactCode.trim() === '') {
        exactCode = comp?.code;
    }
    if (!exactCode || exactCode.trim() === '' || exactCode.includes('see the repo')) {
        exactCode = getComponentCode(componentId, { lang: 'ts', styling: 'tailwind' }) ?? '';
    }
    if (!exactCode || exactCode.trim() === '') {
        exactCode = getComponentCode(componentId, { lang: 'js', styling: 'tailwind' }) ?? '';
    }
    if (!exactCode || exactCode.trim() === '') {
        exactCode = comp?.vibePrompt || `// ${displayTitle} Component Implementation\nimport React from 'react';\n\nexport const ${title.replace(/[^a-zA-Z0-9]/g, '')} = () => {\n  return <div className="text-white">${displayTitle}</div>;\n};`;
    }

    // A variant's authored behaviour is the blueprint; the generic item copy is
    // only the fallback for components that declare no variants.
    const rawSpec = (
        variant?.behaviour ||
        ANTIGRAVITY_PROMPTS[componentId] || 
        LOVABLE_PROMPTS[componentId] || 
        comp?.vibePrompt || 
        comp?.description || 
        `Cinema-grade '${displayTitle}' animated React component built with Tailwind CSS and Framer Motion.`
    );

    const manifest: ComponentManifest = {
        componentId,
        displayName: displayTitle,
        category: comp?.category || "UI Animation",
        description: rawSpec.split('\n')[0].replace(/^#+\s*/, '') || `Interactive ${title} component.`,
        sourceCode: exactCode,
        animationEngine: exactCode.includes('gsap') ? 'gsap' : exactCode.includes('three') ? 'three.js' : 'framer-motion',
        interactionTriggers: ['mount', 'hover', 'click'],
        dependencies: {
            npm: {
                'framer-motion': '^11.0.0',
                'lucide-react': '^0.400.0',
                'clsx': '^2.1.0',
                'tailwind-merge': '^2.2.0'
            }
        },
        props: [],
        knownGotchas: ['Ensure parent container has relative positioning and appropriate bounding dimensions.']
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
};

/**
 * Result of fetching / recording a Vibe Prompt.
 * When ok=false the caller must decide how to surface the block (e.g. show upgrade UI)
 * and must NOT fall back to local generation for the blocked premium tool.
 */
export interface PromptFetchResult {
    ok: boolean;
    prompt: string;
    consumed?: boolean;
    trialsRemaining?: number;
    expiresAt?: number | null;
    code?: 'AUTH_REQUIRED' | 'PREMIUM_REQUIRED' | 'TRIAL_LIMIT' | 'ERROR';
    reason?: 'COUNT' | 'EXPIRY';
    status?: number;
}

export const isPremiumAITool = (system: AISystem): boolean =>
    system === 'advance' || system === 'antigravity' || system === 'claude';

/**
 * Fetches the specific Vibe Prompt for a component from the backend.
 * For premium AI tools (advance/antigravity/claude) the backend is the source
 * of truth for the free-trial limit and 24h window, so a block (TRIAL_LIMIT /
 * AUTH_REQUIRED) is surfaced to the caller instead of silently falling back to
 * local generation (which would bypass enforcement).
 */
export const fetchVibePrompt = async (
    componentId: string,
    system: AISystem,
    token?: string,
    item?: any,
    variantId?: string,
    customizedSource?: string
): Promise<PromptFetchResult> => {
    // Locally-defined components have no backend vault entry, so the backend
    // returns a generic code-less prompt. Force the local source (which embeds
    // the exact component code) for those components.
    //
    // 'cube-loader' must also stay local: its prompt is variant-aware, and a
    // server-side entry would be variant-blind and overwrite the local one.
    const LOCAL_ONLY_COMPONENTS = ['cinematic-navbar', 'floating-dark-capsule', 'minimal-ai-capsule', 'pill-navbar', 'modern-dark', 'split-navigation-nav', 'awwwards-nav', 'haul-footer', 'omniflow-footer', 'sora-footer', 'alpine-footer', 'leeuwarder-golfclub', 'community-newsletter', 'faizur-portfolio', 'sui-foundation', 'option-wheel', 'otp-code-input', 'password-strength-meter', 'signature-pad', 'drag-drop-upload', 'aurora-bpm-loader', 'crossfade-typewriter', 'reflect-shader', 'infinite-tendrils', 'ocean-swell', 'frost-glass-melt', 'star-burst', 'originkit-hero-24', 'light-cables', 'globe', 'cube-loader', 'prism-pyramid', 'hexa-sphere', 'light-beam-type', 'neon-rain', 'violet-cascade', 'pulse-lattice', 'atelier-drift', 'venom-button', 'spider-button', 'earth', 'svg-particle'];
    if (LOCAL_ONLY_COMPONENTS.includes(componentId)) {
        return { ok: true, prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource) };
    }

    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const apiBaseUrl = getApiBaseUrl();
        const fullUrl = `${apiBaseUrl}/api/v1/components/${componentId}/prompt/${system}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const response = await fetch(fullUrl, {
            headers,
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            if (data && data.prompt && data.prompt.length > 50 && !data.prompt.includes('// Source code not available')) {
                return {
                    ok: true,
                    prompt: data.prompt,
                    consumed: !!data.consumed,
                    trialsRemaining: data.trialsRemaining,
                    expiresAt: data.expiresAt != null ? data.expiresAt : null,
                };
            }
        } else if (response.status === 403) {
            let body: any = {};
            try { body = await response.json(); } catch (e) { /* ignore */ }
            const code = body?.code === 'TRIAL_LIMIT'
                ? 'TRIAL_LIMIT' as const
                : body?.code === 'PREMIUM_REQUIRED'
                    ? 'PREMIUM_REQUIRED' as const
                    : 'AUTH_REQUIRED' as const;
            return {
                ok: false,
                prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource),
                code,
                reason: body?.reason,
                expiresAt: body?.expiresAt != null ? body.expiresAt : null,
                trialsRemaining: body?.remaining != null ? body.remaining : 0,
                status: 403,
            };
        }

        // Network / server error on premium tool: do not bypass — surface as error.
        if (isPremiumAITool(system)) {
            return { ok: false, prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource), code: 'ERROR', status: response.status };
        }
        return { ok: true, prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource) };
    } catch (error) {
        if (isPremiumAITool(system)) {
            return { ok: false, prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource), code: 'ERROR' };
        }
        return { ok: true, prompt: getFallbackVibePrompt(componentId, system, item, variantId, customizedSource) };
    }
};

/**
 * Fetches the source code for a component from the backend.
 */
export const fetchComponentSource = async (componentId: string, token: string): Promise<string> => {
    try {
        const apiBaseUrl = getApiBaseUrl();
        
        const response = await fetch(`${apiBaseUrl}/api/v1/components/${componentId}/source`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch source code');
        }
        
        const data = await response.json();
        return data.source;
    } catch (error) {
        console.error('Error fetching source code:', error);
        throw error;
    }
};
