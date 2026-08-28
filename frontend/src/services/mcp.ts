import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';
import { MCP_BASE_URL } from '../utils/mcpConfig';

/**
 * MCP dashboard API client.
 * These endpoints talk to the MCP server's dashboard routes.
 * The MCP server is a separate deployment (e.g. ui-hub-mcp.onrender.com).
 */

const BASE = MCP_BASE_URL;
const DEFAULT_TIMEOUT_MS = 10000;
const COLD_START_TIMEOUT_MS = 90000;
const COLD_START_RETRIES = 2;
const COLD_START_RETRY_DELAYS_MS = [2000, 5000];

async function authHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
}

function isAbortError(e: unknown): boolean {
    return e instanceof DOMException && e.name === 'AbortError';
}

export interface FetchWithRetryOptions {
    timeoutMs?: number;
    retries?: number;
    retryDelaysMs?: number[];
    onAttempt?: (attempt: number, error?: Error) => void;
}

async function fetchOnce(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

/**
 * Fetch with timeout + retry with backoff.
 * Retries on network errors, timeouts, and 502/504 (Render cold start / restart).
 */
async function fetchWithRetry(url: string, init?: RequestInit, opts: FetchWithRetryOptions = {}): Promise<Response> {
    const {
        timeoutMs = DEFAULT_TIMEOUT_MS,
        retries = 1,
        retryDelaysMs = [1500],
        onAttempt,
    } = opts;

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const res = await fetchOnce(url, { ...init }, timeoutMs);
            if (res.status === 502 || res.status === 504) {
                lastError = new Error(`Server not ready (${res.status})`);
                if (attempt >= retries) return res;
            } else {
                return res;
            }
        } catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e));
            if (isAbortError(e) && attempt < retries) {
                // timeout — retry (covers slow cold starts)
            } else if (attempt >= retries) {
                throw lastError;
            }
        }
        onAttempt?.(attempt + 1, lastError || undefined);
        const delay = retryDelaysMs[attempt] ?? retryDelaysMs[retryDelaysMs.length - 1];
        if (attempt < retries) await new Promise((r) => setTimeout(r, delay));
    }
    if (lastError) throw lastError;
    throw new Error('MCP server unreachable');
}

async function mcpFetch(url: string, init?: RequestInit, opts?: FetchWithRetryOptions): Promise<Response> {
    return fetchWithRetry(url, init, opts);
}

export interface McpApiKey {
    id: string;
    user_id: string;
    key_prefix: string;
    name: string;
    created_at: number;
    last_used_at?: number | null;
    expires_at?: number | null;
    revoked_at?: number | null;
    status: 'active' | 'revoked' | 'expired';
}

export interface McpStatus {
    endpoint: string;
    headerAuth: string;
    tier: 'FREE' | 'PRO' | 'ELITE' | 'ADMIN';
    keys: { total: number; active: number };
    rateLimit: { free: number; pro: number };
    features: Record<string, boolean>;
}

export interface McpUsage {
    totalKeys: number;
    activeKeys: number;
    usedToday: boolean;
    status: 'active' | 'inactive';
}

export interface McpOverview {
    endpoint: string;
    headerAuth: string;
    tier: 'FREE' | 'PRO' | 'ELITE' | 'ADMIN';
    keys: { total: number; active: number };
    items: McpApiKey[];
    rateLimit: { free: number; pro: number };
    features: Record<string, boolean>;
    usage: McpUsage;
}

const OVERVIEW_TTL_MS = 30000;
const METRICS_TTL_MS = 60000;

let overviewCache: { value: McpOverview; expiresAt: number } | null = null;
let metricsCache: { value: McpAdminMetrics; expiresAt: number } | null = null;

export async function getMcpOverview(refresh = false, onAttempt?: (attempt: number, error?: Error) => void): Promise<McpOverview> {
    if (!refresh && overviewCache && Date.now() < overviewCache.expiresAt) {
        return overviewCache.value;
    }
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/overview`, { headers: await authHeaders() }, {
        timeoutMs: COLD_START_TIMEOUT_MS,
        retries: COLD_START_RETRIES,
        retryDelaysMs: COLD_START_RETRY_DELAYS_MS,
        onAttempt,
    });
    if (!res.ok) throw new Error(`Failed to fetch MCP overview: ${res.status}`);
    const data = await res.json();
    overviewCache = { value: data, expiresAt: Date.now() + OVERVIEW_TTL_MS };
    return data;
}

export async function getMcpStatus(): Promise<McpStatus> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/status`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch MCP status: ${res.status}`);
    return res.json();
}

export async function listApiKeys(): Promise<McpApiKey[]> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/keys`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to list keys: ${res.status}`);
    const data = await res.json();
    return data.keys;
}

export async function createApiKey(name: string): Promise<{ key: string; record: McpApiKey }> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/keys`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create key: ${res.status}`);
    return res.json();
}

export async function revokeApiKey(id: string): Promise<void> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/keys/${id}/revoke`, {
        method: 'POST',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to revoke key: ${res.status}`);
}

export async function deleteApiKey(id: string): Promise<void> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/keys/${id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete key: ${res.status}`);
}

export async function getMcpUsage(): Promise<McpUsage> {
    const res = await mcpFetch(`${BASE}/api/dashboard/mcp/usage`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch usage: ${res.status}`);
    return res.json();
}

export interface McpAdminMetrics {
    date: string;
    totalRequests: number;
    requestsToday: number;
    activeKeys: number;
    topComponents: string[];
    topSearches: string[];
    freeUsage: number;
    proUsage: number;
    failedRequests: number;
    rateLimitEvents: number;
    server: {
        status: string;
        uptime: number;
        memoryUsage: string;
        environment: string;
        version: string;
    };
}

export async function getAdminMetrics(refresh = false, onAttempt?: (attempt: number, error?: Error) => void): Promise<McpAdminMetrics | null> {
    try {
        if (!refresh && metricsCache && Date.now() < metricsCache.expiresAt) {
            return metricsCache.value;
        }
        const res = await mcpFetch(`${BASE}/api/dashboard/mcp/admin/metrics`, { headers: await authHeaders() }, {
            timeoutMs: COLD_START_TIMEOUT_MS,
            retries: COLD_START_RETRIES,
            retryDelaysMs: COLD_START_RETRY_DELAYS_MS,
            onAttempt,
        });
        if (!res.ok) return null;
        const data = await res.json();
        metricsCache = { value: data, expiresAt: Date.now() + METRICS_TTL_MS };
        return data;
    } catch {
        return null;
    }
}

