import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';
import { ComponentItem } from '../data/componentData';

const BASE = getApiBaseUrl();
const FAVORITES_POLL_MS = 30000;

const GUEST_FAVORITES_KEY = 'ui_hub_guest_favorites';

export interface FavoriteItem {
    id: string;
    userId?: string;
    componentId: string;
    componentName: string;
    componentCode?: string;
    category?: string;
    createdAt?: any;
}

export class FavoritesError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, code?: string, status?: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

export const getGuestFavorites = (): FavoriteItem[] => {
    try {
        const raw = localStorage.getItem(GUEST_FAVORITES_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
            return parsed.map(item => {
                if (typeof item === 'string') {
                    return { id: item, componentId: item, componentName: item };
                }
                return item;
            });
        }
        return [];
    } catch {
        return [];
    }
};

const setGuestFavorites = (favorites: FavoriteItem[]) => {
    try {
        localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (e) {
        console.error("Failed to save guest favorites to localStorage:", e);
    }
};

const hasAuthUser = (): boolean => {
    const user = auth.currentUser;
    return !!user;
};

async function authHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: { ...(await authHeaders()), ...(init?.headers || {}) },
    });
    if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        let code: string | undefined;
        try {
            const data = await res.json();
            if (data?.message) message = data.message;
            if (data?.error) code = data.error;
        } catch {
            // ignore body parse errors
        }
        const err = new FavoritesError(message, code, res.status);
        throw err;
    }
    return res.json() as Promise<T>;
}

export const saveToFavorites = async (userId: string | undefined | null, component: ComponentItem) => {
    const favoriteItem: FavoriteItem = {
        id: component.id,
        componentId: component.id,
        componentName: component.title || 'Untitled',
        componentCode: typeof component.code === 'string' ? component.code : '',
        category: component.category || 'custom'
    };

    // Save locally
    const currentLocal = getGuestFavorites();
    if (!currentLocal.some(f => f.componentId === component.id)) {
        setGuestFavorites([favoriteItem, ...currentLocal]);
    }

    // Save to backend if user is logged in
    if (userId && hasAuthUser()) {
        try {
            const data = await request<{ ok: boolean; favorites: FavoriteItem[] }>('/api/v1/favorites', {
                method: 'POST',
                body: JSON.stringify({
                    id: component.id,
                    title: component.title || 'Untitled',
                    category: component.category || 'custom',
                    code: typeof component.code === 'string' ? component.code : '',
                }),
            });
            setGuestFavorites(data.favorites);
        } catch (error) {
            console.error("Error saving favorite:", error);
            throw error;
        }
    }
};

export const removeFromFavorites = async (userId: string | undefined | null, componentId: string) => {
    // Remove locally
    const currentLocal = getGuestFavorites();
    setGuestFavorites(currentLocal.filter(f => f.componentId !== componentId));

    // Remove from backend if user is logged in
    if (userId && hasAuthUser()) {
        try {
            const data = await request<{ ok: boolean; favorites: FavoriteItem[] }>(
                `/api/v1/favorites/${encodeURIComponent(componentId)}`,
                { method: 'DELETE' }
            );
            setGuestFavorites(data.favorites);
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    }
};

export const getUserFavorites = (userId: string | undefined | null, callback: (favorites: FavoriteItem[]) => void) => {
    if (!userId || !hasAuthUser()) {
        const localFavs = getGuestFavorites();
        callback(localFavs);
        // Custom event listener so other tabs/components update when guest favorites change
        const handleStorage = () => callback(getGuestFavorites());
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }

    let cancelled = false;
    let timer: ReturnType<typeof setInterval> | null = null;

    const load = async () => {
        try {
            const data = await request<{ favorites: FavoriteItem[] }>('/api/v1/favorites');
            if (cancelled) return;
            const favorites = data.favorites || [];
            setGuestFavorites(favorites);
            callback(favorites);
        } catch (error) {
            if (cancelled) return;
            console.error("Error fetching user favorites:", error);
            callback(getGuestFavorites());
        }
    };

    load();
    timer = setInterval(load, FAVORITES_POLL_MS);

    return () => {
        cancelled = true;
        if (timer) clearInterval(timer);
    };
};
