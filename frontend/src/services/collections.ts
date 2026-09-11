import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

const BASE = getApiBaseUrl();

export interface CollectionItem {
    componentId: string;
    title: string;
    category: string;
    code: string;
    addedAt?: any;
}

export interface Collection {
    id: string;
    name: string;
    description: string;
    icon: string;
    itemCount: number;
    items: CollectionItem[];
    createdAt?: number | null;
    updatedAt?: number | null;
}

export interface CollectionsResponse {
    collections: Collection[];
    limit?: number;
}

export class CollectionsError extends Error {
    code?: string;
    status?: number;
    constructor(message: string, code?: string, status?: number) {
        super(message);
        this.code = code;
        this.status = status;
    }
}

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
        throw new CollectionsError(message, code, res.status);
    }
    return res.json() as Promise<T>;
}

export const listCollections = async (): Promise<Collection[]> => {
    const data = await request<CollectionsResponse>('/api/v1/collections');
    return data.collections || [];
};

export const getCollection = async (collectionId: string): Promise<Collection | null> => {
    const data = await request<{ collection: Collection }>(`/api/v1/collections/${encodeURIComponent(collectionId)}`);
    return data.collection || null;
};

export const createCollection = async (input: { name: string; description?: string; icon?: string }): Promise<Collection> => {
    const data = await request<{ ok: boolean; collection: Collection }>('/api/v1/collections', {
        method: 'POST',
        body: JSON.stringify(input),
    });
    return data.collection;
};

export const updateCollection = async (
    collectionId: string,
    input: { name?: string; description?: string; icon?: string }
): Promise<void> => {
    await request<{ ok: boolean }>(`/api/v1/collections/${encodeURIComponent(collectionId)}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
    });
};

export const deleteCollection = async (collectionId: string): Promise<void> => {
    await request<{ ok: boolean }>(`/api/v1/collections/${encodeURIComponent(collectionId)}`, {
        method: 'DELETE',
    });
};

export const addToCollection = async (
    collectionId: string,
    item: { id: string; title?: string; category?: string; code?: string }
): Promise<Collection> => {
    const data = await request<{ ok: boolean; collection: Collection }>(
        `/api/v1/collections/${encodeURIComponent(collectionId)}/items`,
        {
            method: 'POST',
            body: JSON.stringify(item),
        }
    );
    return data.collection;
};

export const removeFromCollection = async (collectionId: string, componentId: string): Promise<Collection> => {
    const data = await request<{ ok: boolean; collection: Collection }>(
        `/api/v1/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(componentId)}`,
        { method: 'DELETE' }
    );
    return data.collection;
};