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

export interface RecordComponentViewResponse {
    componentId: string;
    viewRecorded: boolean;
    views: number;
}

interface TemplateViewCountsResponse {
    counts: Record<string, number>;
}

type ViewType = 'template' | 'component';
type ViewCountRegistry = Record<ViewType, Record<string, number>>;
type LoadedViewIds = Record<ViewType, Map<string, number>>;

const VIEW_SESSION_STORAGE_KEY = 'uihub_view_session_id';
const VIEW_SESSION_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const VIEW_COUNT_CACHE_MS = 30_000;
const API_BASE = getApiBaseUrl();
let memorySessionId: string | null = null;
let viewCounts: ViewCountRegistry = { template: {}, component: {} };
let loadedViewIds: LoadedViewIds = { template: new Map(), component: new Map() };
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

export const getTemplateViewCountsSnapshot = (): Readonly<Record<string, number>> => viewCounts.template;
export const getComponentViewCountsSnapshot = (): Readonly<Record<string, number>> => viewCounts.component;

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

const setViewCounts = (type: ViewType, nextCounts: Record<string, number>) => {
    const merged = { ...viewCounts[type] };
    for (const [templateId, count] of Object.entries(nextCounts)) {
        merged[templateId] = Math.max(merged[templateId] ?? 0, count);
    }
    viewCounts = { ...viewCounts, [type]: merged };
    notifyListeners();
};

const loadViewCounts = async (type: ViewType, templateIds: readonly string[]): Promise<void> => {
    const now = Date.now();
    const ids = [...new Set(templateIds.filter(Boolean))].filter((id) => (
        now - (loadedViewIds[type].get(id) ?? 0) >= VIEW_COUNT_CACHE_MS
    ));
    if (ids.length === 0) return;

    const loadKey = `${type}:${ids.slice().sort().join(',')}`;
    const existingLoad = pendingLoads.get(loadKey);
    if (existingLoad) return existingLoad;

    const load = (async () => {
        try {
            const query = new URLSearchParams({ type, ids: ids.join(',') });
            const response = await fetch(`${API_BASE}/api/v1/templates/views?${query.toString()}`);
            if (!response.ok) throw new Error(`Template view count request failed (${response.status})`);
            const result = await response.json() as TemplateViewCountsResponse;
            const counts: Record<string, number> = {};
            for (const id of ids) {
                const count = result.counts?.[id];
                counts[id] = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
            }
            const loadedAt = Date.now();
            for (const id of ids) loadedViewIds[type].set(id, loadedAt);
            setViewCounts(type, counts);
        } catch (error) {
            console.error('[TemplateViews] Could not load persisted view counts:', error);
        } finally {
            pendingLoads.delete(loadKey);
        }
    })();

    pendingLoads.set(loadKey, load);
    return load;
};

export const loadTemplateViewCounts = (templateIds: readonly string[]): Promise<void> =>
    loadViewCounts('template', templateIds);

export const loadComponentViewCounts = (componentIds: readonly string[]): Promise<void> =>
    loadViewCounts('component', componentIds);

export const getTemplateViewCount = (templateId: string | null | undefined): number => {
    return templateId ? viewCounts.template[templateId] ?? 0 : 0;
};

export const hasTemplateViewCount = (templateId: string | null | undefined): boolean =>
    Boolean(templateId && loadedViewIds.template.has(templateId));

export const getComponentViewCount = (componentId: string | null | undefined): number =>
    componentId ? viewCounts.component[componentId] ?? 0 : 0;

export const hasComponentViewCount = (componentId: string | null | undefined): boolean =>
    Boolean(componentId && loadedViewIds.component.has(componentId));

export const getTemplateViewDisplay = (templateId: string | null | undefined): string =>
    hasTemplateViewCount(templateId) ? formatViewCount(getTemplateViewCount(templateId)) : '—';

export const getComponentViewDisplay = (componentId: string | null | undefined): string =>
    hasComponentViewCount(componentId) ? formatViewCount(getComponentViewCount(componentId)) : '—';

export const getTemplateViewAccessibleLabel = (templateId: string | null | undefined): string =>
    hasTemplateViewCount(templateId) ? `${getTemplateViewCount(templateId)} views` : 'View count unavailable';

export const getComponentViewAccessibleLabel = (componentId: string | null | undefined): string =>
    hasComponentViewCount(componentId)
        ? `${getComponentViewCount(componentId)} ${getComponentViewCount(componentId) === 1 ? 'view' : 'views'}`
        : 'View count unavailable';

const recordView = async (
    type: ViewType,
    itemId: string,
): Promise<RecordTemplateViewResponse | RecordComponentViewResponse> => {
    const sessionId = getViewSessionId();
    const requestKey = `${type}:${itemId}:${sessionId}`;
    const pending = pendingRecords.get(requestKey);
    if (pending) return pending;

    const request = (async () => {
        try {
            const idField = type === 'component' ? 'componentId' : 'templateId';
            const response = await fetch(`${API_BASE}/api/v1/templates/views`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, [idField]: itemId, sessionId }),
            });
            if (!response.ok) throw new Error(`Template view request failed (${response.status})`);

            const result = await response.json() as RecordTemplateViewResponse;
            if (!Number.isFinite(result.views) || result.views < 0) {
                throw new Error('Template view endpoint returned an invalid count');
            }
            loadedViewIds[type].set(itemId, Date.now());
            setViewCounts(type, { [itemId]: Math.floor(result.views) });
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

export const recordTemplateView = async (templateId: string): Promise<RecordTemplateViewResponse> =>
    await recordView('template', templateId) as RecordTemplateViewResponse;

export const recordComponentView = async (componentId: string): Promise<RecordComponentViewResponse> =>
    await recordView('component', componentId) as RecordComponentViewResponse;

export const resetTemplateViewState = (): void => {
    memorySessionId = null;
    viewCounts = { template: {}, component: {} };
    loadedViewIds = { template: new Map(), component: new Map() };
    pendingLoads.clear();
    pendingRecords.clear();
    notifyListeners();
};
