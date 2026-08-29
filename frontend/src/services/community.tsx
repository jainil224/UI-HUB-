import { ComponentItem } from '../data/componentData';
import { getApiBaseUrl } from '../utils/apiConfig';

const BASE = getApiBaseUrl();

interface RawCommunityComponent {
    id: string;
    title?: string;
    componentName?: string;
    description?: string;
    category?: string;
    code?: string;
    vibePrompt?: string;
    uploader?: string;
}

const toComponentItem = (c: RawCommunityComponent): ComponentItem => {
    const name = c.title || c.componentName || 'Untitled';
    const desc = c.description || 'Community contributed component';
    return {
        id: c.id,
        title: name,
        description: desc,
        category: 'custom',
        preview: () => (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                <h3 className="text-xl font-bold text-white mb-2">{name}</h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-4">{desc}</p>
            </div>
        ),
        code: c.code || '// No code available',
        isPremium: false,
        vibePrompt: c.vibePrompt || desc,
        uploader: c.uploader || 'Anonymous',
    };
};

export const fetchCommunityComponents = async (): Promise<ComponentItem[]> => {
    const res = await fetch(`${BASE}/api/v1/components/community`);
    if (res.status === 503) return []; // DB unavailable — caller keeps polling
    if (!res.ok) throw new Error('Failed to load community components');
    const data = await res.json();
    const list = (data.components || []) as RawCommunityComponent[];
    return list.map(toComponentItem);
};

export const getCommunityComponent = async (id: string): Promise<ComponentItem | null> => {
    const res = await fetch(`${BASE}/api/v1/components/community/${encodeURIComponent(id)}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to load community component');
    const data = await res.json();
    if (!data.component) return null;
    return toComponentItem(data.component);
};
