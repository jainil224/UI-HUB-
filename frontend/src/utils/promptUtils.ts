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

import { getApiBaseUrl } from './apiConfig';

/**
 * Fetches the specific Vibe Prompt for a component from the backend.
 * This is the secure replacement for generateVibePrompt.
 */
export const fetchVibePrompt = async (componentId: string, system: AISystem, token ?: string): Promise<string> => {
    try {
        const headers: Record<string, string> = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const apiBaseUrl = getApiBaseUrl();
        const fullUrl = `${apiBaseUrl}/api/v1/components/${componentId}/prompt/${system}`;
        
        console.log(`[Blueprint] Fetching from: ${fullUrl}`);
        
        const response = await fetch(fullUrl, {
            headers
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Blueprint] ERROR ${response.status} for ${componentId}:`, errorText);
            throw new Error(`Failed to load blueprint (Status: ${response.status})`);
        }
        
        const data = await response.json();
        return data.prompt;
    } catch (error) {
        console.error('[Blueprint] Critical catch:', error);
        throw error;
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
