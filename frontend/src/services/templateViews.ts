import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

export interface TemplateView {
    templateId: string;
    sessionId: string;
    userId?: string | null;
    createdAt: string;
}

export interface RecordTemplateViewResponse {
    templateId: string;
    viewRecorded: boolean;
    views: number;
}

interface TemplateViewCountsResponse {
    counts: Record<string, number>;
}

const VIEW_SESSION_STORAGE_KEY = 'uihub_view_session_id';
const VIEW_SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VIEW_COUNT_CACHE_MS = 30_000;
const API_BASE = getApiBaseUrl();
let memorySessionId: string | null = null;
let viewCounts: Record<string, number> = {};
let loadedTemplateIds = new Map<string, number>();
const pendingLoads = new Map<string, Promise<void>>();
const pendingRecords = new Map<string, Promise<RecordTemplateViewResponse>>();
const listeners = new Set<() => void>();

const notifyListeners = () => {
    for (const listener of listeners) listener();
};

export const subscribeTemplateViewCounts = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
};

export const getTemplateViewCountsSnapshot = (): Readonly<Record<string, number>> => viewCounts;

export const parseViewCount = (value: string | number | null | undefined): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.round(value));
    }
    if (typeof value !== 'string') return 0;

    const normalized = value.trim().replace(/,/g, '').replace(/\s+/g, '');
    const match = normalized.match(/^(\d*\.?\d+)([kKmM])?$/);
    if (!match) return 0;

    const valueNumber = Number(match[1]);
    const suffix = match[2]?.toLowerCase();
    const multiplier = suffix === 'm' ? 1_000_000 : suffix === 'k' ? 1_000 : 1;
    return Math.max(0, Math.round(valueNumber * multiplier));
};

export const formatViewCount = (value: number): string => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
    if (safeValue < 1000) return String(safeValue);

    const divisor = safeValue < 1_000_000 ? 1000 : 1_000_000;
    const suffix = divisor === 1000 ? 'k' : 'M';
    const compact = safeValue / divisor;
    return `${compact >= 10 ? Math.round(compact) : Number(compact.toFixed(1))}${suffix}`;
};

const createSessionId = (): string => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
        crypto.getRandomValues(bytes);
    } else {
        for (let index = 0; index < bytes.length; index += 1) {
            bytes[index] = Math.floor(Math.random() * 256);
        }
    }
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

export const getViewSessionId = (): string => {
    if (memorySessionId) return memorySessionId;

    try {
        const existingId = window.sessionStorage.getItem(VIEW_SESSION_STORAGE_KEY);
        if (existingId && VIEW_SESSION_ID_PATTERN.test(existingId)) {
            memorySessionId = existingId;
            return existingId;
        }
    } catch {
        // Use an in-memory ID when sessionStorage is unavailable.
    }

    memorySessionId = createSessionId();
    try {
        window.sessionStorage.setItem(VIEW_SESSION_STORAGE_KEY, memorySessionId);
    } catch {
        // Tracking still works for this page lifetime if browser storage is blocked.
    }
    return memorySessionId;
};

const setTemplateViewCounts = (nextCounts: Record<string, number>) => {
    const merged = { ...viewCounts };
    for (const [templateId, count] of Object.entries(nextCounts)) {
        merged[templateId] = Math.max(merged[templateId] ?? 0, count);
    }
    viewCounts = merged;
    notifyListeners();
};

export const loadTemplateViewCounts = async (templateIds: readonly string[]): Promise<void> => {
    const now = Date.now();
    const ids = [...new Set(templateIds.filter(Boolean))].filter((id) => (
        now - (loadedTemplateIds.get(id) ?? 0) >= VIEW_COUNT_CACHE_MS
    ));
    if (ids.length === 0) return;

    const loadKey = ids.slice().sort().join(',');
    const existingLoad = pendingLoads.get(loadKey);
    if (existingLoad) return existingLoad;

    const load = (async () => {
        try {
            const query = new URLSearchParams({ ids: ids.join(',') });
            const response = await fetch(`${API_BASE}/api/v1/templates/views?${query.toString()}`);
            if (!response.ok) throw new Error(`Template view count request failed (${response.status})`);
            const result = await response.json() as TemplateViewCountsResponse;
            const counts: Record<string, number> = {};
            for (const id of ids) {
                const count = result.counts?.[id];
                counts[id] = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
            }
            const loadedAt = Date.now();
            for (const id of ids) loadedTemplateIds.set(id, loadedAt);
            setTemplateViewCounts(counts);
        } catch (error) {
            console.error('[TemplateViews] Could not load persisted view counts:', error);
        } finally {
            pendingLoads.delete(loadKey);
        }
    })();

    pendingLoads.set(loadKey, load);
    return load;
};

export const getTemplateViewCount = (templateId: string | null | undefined): number => {
    return templateId ? viewCounts[templateId] ?? 0 : 0;
};

export const getTemplateViewDisplay = (templateId: string | null | undefined): string =>
    formatViewCount(getTemplateViewCount(templateId));

export const recordTemplateView = async (
    templateId: string,
): Promise<RecordTemplateViewResponse> => {
    const sessionId = getViewSessionId();
    const requestKey = `${templateId}:${sessionId}`;
    const pending = pendingRecords.get(requestKey);
    if (pending) return pending;

    const request = (async () => {
        try {
            const user = auth?.currentUser;
            const token = user ? await user.getIdToken() : null;
            const response = await fetch(`${API_BASE}/api/v1/templates/views`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ templateId, sessionId }),
            });
            if (!response.ok) throw new Error(`Template view request failed (${response.status})`);

            const result = await response.json() as RecordTemplateViewResponse;
            if (!Number.isFinite(result.views) || result.views < 0) {
                throw new Error('Template view endpoint returned an invalid count');
            }
            loadedTemplateIds.set(templateId, Date.now());
            setTemplateViewCounts({ [templateId]: Math.floor(result.views) });
            return result;
        } catch (error) {
            console.error('[TemplateViews] Could not record persisted view:', error);
            throw error;
        } finally {
            pendingRecords.delete(requestKey);
        }
    })();

    pendingRecords.set(requestKey, request);
    return request;
};

export const resetTemplateViewState = (): void => {
    memorySessionId = null;
    viewCounts = {};
    loadedTemplateIds = new Map();
    pendingLoads.clear();
    pendingRecords.clear();
    notifyListeners();
};
