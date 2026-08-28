import { auth } from '../lib/firebase';
import { getApiBaseUrl } from '../utils/apiConfig';

/**
 * MCP dashboard API client.
 * These endpoints talk to the MCP server's dashboard routes.
 * The MCP server is a separate deployment (e.g. api.ui-hub-design.com).
 */

const MCP_BASE = import.meta.env.VITE_MCP_API_URL || 'http://localhost:3001';

async function authHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
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

export async function getMcpStatus(): Promise<McpStatus> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/status`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch MCP status: ${res.status}`);
    return res.json();
}

export async function listApiKeys(): Promise<McpApiKey[]> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/keys`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to list keys: ${res.status}`);
    const data = await res.json();
    return data.keys;
}

export async function createApiKey(name: string): Promise<{ key: string; record: McpApiKey }> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/keys`, {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({ name }),
    });
    if (!res.ok) throw new Error(`Failed to create key: ${res.status}`);
    return res.json();
}

export async function revokeApiKey(id: string): Promise<void> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/keys/${id}/revoke`, {
        method: 'POST',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to revoke key: ${res.status}`);
}

export async function deleteApiKey(id: string): Promise<void> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/keys/${id}`, {
        method: 'DELETE',
        headers: await authHeaders(),
    });
    if (!res.ok) throw new Error(`Failed to delete key: ${res.status}`);
}

export async function getMcpUsage(): Promise<McpUsage> {
    const res = await fetch(`${MCP_BASE}/api/dashboard/mcp/usage`, { headers: await authHeaders() });
    if (!res.ok) throw new Error(`Failed to fetch usage: ${res.status}`);
    return res.json();
}
