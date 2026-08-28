import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

/**
 * MCP dashboard API client.
 * These endpoints talk to the MCP server's dashboard routes.
 * The MCP server is a separate deployment (e.g. api.ui-hub-design.com).
 */

const MCP_BASE = import.meta.env.VITE_MCP_API_URL || 'http://localhost:3001';
const DEFAULT_TIMEOUT_MS = 10000;

async function authHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
}

async function mcpFetch(url: string, init?: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<Response> {
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), timeoutMs);
            let res: Response;
            try {
                res = await fetch(url, { ...init, signal: controller.signal });
            } finally {
                clearTimeout(timer);
            }
            if (res.status !== 502 && res.status !== 504) return res;
        } catch (e) {
            if (e instanceof DOMException && e.name === 'AbortError') throw new Error('Request timed out');
            if (attempt === 1) throw e;
        }
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
    throw new Error('MCP server unreachable');
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

export async function getMcpOverview(refresh = false): Promise<McpOverview> {
    if (!refresh && overviewCache && Date.now() < overviewCache.expiresAt) {
        return overviewCache.value;
    }
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/overview`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch MCP overview: ${res.status}`);
    const data = await res.json();
    overviewCache = { value: data, expiresAt: Date.now() + OVERVIEW_TTL_MS };
    return data;
}

export async function getMcpStatus(): Promise<McpStatus> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/status`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch MCP status: ${res.status}`);
    return res.json();
}

export async function listApiKeys(): Promise<McpApiKey[]> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/keys`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to list keys: ${res.status}`);
    const data = await res.json();
    return data.keys;
}

export async function createApiKey(name: string): Promise<{ key: string; record: McpApiKey }> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/keys`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create key: ${res.status}`);
    return res.json();
}

export async function revokeApiKey(id: string): Promise<void> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/keys/${id}/revoke`, {
        method: 'POST',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to revoke key: ${res.status}`);
}

export async function deleteApiKey(id: string): Promise<void> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/keys/${id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete key: ${res.status}`);
}

export async function getMcpUsage(): Promise<McpUsage> {
    const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/usage`, { headers: await authHeaders() });
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

export async function getAdminMetrics(refresh = false): Promise<McpAdminMetrics | null> {
    try {
        if (!refresh && metricsCache && Date.now() < metricsCache.expiresAt) {
            return metricsCache.value;
        }
        const res = await mcpFetch(`${MCP_BASE}/api/dashboard/mcp/admin/metrics`, { headers: await authHeaders() });
        if (!res.ok) return null;
        const data = await res.json();
        metricsCache = { value: data, expiresAt: Date.now() + METRICS_TTL_MS };
        return data;
    } catch {
        return null;
    }
}

