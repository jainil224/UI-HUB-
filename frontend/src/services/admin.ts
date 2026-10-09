import { auth } from '../lib/firebase';
import { MCP_BASE_URL } from '../utils/mcpConfig';

/**
 * MCP Admin API client.
 * These endpoints talk to the mcp-server admin routes (mounted at /api/admin/mcp).
 * Every request is authorized server-side via Firebase ID token + ADMIN/ELITE tier.
 */

const MCP_BASE = MCP_BASE_URL;

async function authHeaders(): Promise<Record<string, string>> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const idToken = await user.getIdToken();
    return {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
    };
}

const DEFAULT_TIMEOUT_MS = 10000;
const STATUS_TTL_MS = 15000;
const OVERVIEW_TTL_MS = 10000;

let adminStatusCache: { value: AdminStatus; expiresAt: number } | null = null;
const overviewCache = new Map<string, { value: AdminOverview; expiresAt: number }>();

function isAbortError(e: unknown): boolean {
    return e instanceof DOMException && e.name === 'AbortError';
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        return await fetch(url, { ...init, signal: controller.signal });
    } finally {
        clearTimeout(timer);
    }
}

async function request<T>(path: string, init?: RequestInit, timeoutMs: number = DEFAULT_TIMEOUT_MS): Promise<T> {
    let res: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            res = await fetchWithTimeout(`${MCP_BASE}${path}`, {
                ...init,
                headers: { ...(await authHeaders()), ...(init?.headers || {}) },
            }, timeoutMs);
            if (res.status !== 502 && res.status !== 504) break;
        } catch (e) {
            if (isAbortError(e)) throw new Error('Request timed out');
            if (attempt === 1) throw e;
        }
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
    if (!res) throw new Error('MCP server unreachable');
    if (!res.ok) {
        let message = `Request failed: ${res.status}`;
        try {
            const data = await res.json();
            if (data?.error === 'FORBIDDEN') message = 'Admin access required';
            else if (data?.error === 'UNAUTHORIZED') message = 'Unauthorized';
            else if (data?.message) message = data.message;
        } catch {
            // ignore body parse errors
        }
        const err = new Error(message) as Error & { status: number };
        err.status = res.status;
        throw err;
    }
    return res.json() as Promise<T>;
}

export interface AdminStatus {
    admin: boolean;
    tier: string;
    email: string;
    uid: string;
    service: string;
    version: string;
}

export interface AdminRange {
    fromKey: string;
    toKey: string;
}

export interface ToolUsage {
    name: string;
    total: number;
    success: number;
    failed: number;
    uniqueUsers: number;
    avgResponseTimeMs: number;
    lastUsed: number;
}

export interface AdminAlert {
    key: string;
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    at: number;
    resolved?: boolean;
}

export interface OverviewStats {
    totalRequests: number;
    last24Requests: number;
    last7Requests: number;
    uniqueUsers: number;
    activeUsers24h: number;
    usersWithKeys: number;
    activeKeys: number;
    totalKeys: number;
    errorRate: number;
    failedRequests: number;
    avgResponseTimeMs: number;
    rateLimitEvents: number;
    premiumDenied: number;
    authFailures: number;
    freeUsage: number;
    proUsage: number;
}

export interface AdminOverview {
    range: AdminRange;
    dbConnected: boolean;
    uptimeSeconds: number;
    reqPerSec: number;
    activeUsers24h: number;
    stats: OverviewStats;
    topTools: ToolUsage[];
    timeseries: Array<{ date: string; requests: number }>;
    days: Array<{ date: string; requests: number; errors: number }>;
    alerts: AdminAlert[];
    alertsTotal: number;
}

export interface TopComponentUsage {
    id: string;
    count: number;
    searches: number;
    codeFetches: number;
    fetchCount: number;
    uniqueUsers: number;
    freeCount: number;
    proCount: number;
    title: string;
    category: string;
    isPremium: boolean;
}

export interface AdminAnalytics {
    range: AdminRange;
    summary: {
        requests: number;
        uniqueUsers: number;
        errorRate: number;
        avgResponseTimeMs: number;
        rateLimitEvents: number;
        premiumDenied: number;
        authFailures: number;
    };
    byDay: Array<{ date: string; requests: number }>;
    byTool: ToolUsage[];
    byTier: Record<string, number>;
    byStatus: Record<string, number>;
    topComponents: TopComponentUsage[];
}

export interface AdminUser {
    uid: string;
    email: string;
    name: string;
    plan: string;
    status: string;
    isAdmin: boolean;
    keyCount: number;
    activeKeyCount: number;
    revokedKeyCount: number;
    requests: number;
    lastActive: number | null;
    createdAt: number | null;
    keys?: Array<{
        id: string;
        keyPrefix: string;
        name: string;
        status: string;
        created_at: number | null;
        last_used_at: number | null;
        expires_at: number | null;
        revoked_at: number | null;
    }>;
}

export interface AdminUserList {
    total: number;
    page: number;
    pageSize: number;
    users: AdminUser[];
}

export interface AdminUserDetail {
    user: AdminUser;
    range: AdminRange;
    stats: {
        requests: number;
        failureCount: number;
        rateLimitEvents: number;
        premiumDenied: number;
        lastActive: number | null;
        byTool: Record<string, ToolUsage>;
        byDay: Record<string, number>;
    };
    recentEvents: McpLogEntry[];
}

export interface AdminKey {
    id: string;
    keyPrefix: string;
    name: string;
    userId: string;
    uid: string;
    email: string;
    plan: string;
    status: string;
    created_at: number | null;
    last_used_at: number | null;
    expires_at: number | null;
    revoked_at: number | null;
    keyUsage30d: number;
}

export interface AdminApiKeyList {
    total: number;
    page: number;
    pageSize: number;
    keys: AdminKey[];
}

export interface AdminTool {
    name: string;
    enabled: boolean;
    category: string;
    total: number;
    success: number;
    failed: number;
    uniqueUsers: number;
    avgResponseTimeMs: number;
    lastUsed: number;
}

export interface AdminComponents {
    range: AdminRange;
    total: number;
    premiumCount: number;
    usedComponents: number;
    requestedComponentCalls: number;
    topComponents: TopComponentUsage[];
    catalog: Array<{
        id: string;
        name: string;
        category: string;
        isPremium: boolean;
        usageCount: number;
        uniqueUsers: number;
        codeFetches: number;
    }>;
}

export interface SearchUsage {
    query: string;
    count: number;
    zeroResults: boolean;
}

export interface AdminSearch {
    range: AdminRange;
    totalSearches: number;
    uniqueSearches: number;
    zeroResultSearches: SearchUsage[];
    searchRate24h: number;
    topSearches: SearchUsage[];
    byDay: Array<{ date: string; count: number }>;
}

export interface McpLogEntry {
    event: string;
    userId?: string;
    apiKeyId?: string;
    keyPrefix?: string;
    tier?: string;
    componentId?: string;
    tool?: string;
    query?: string;
    timestamp: number;
    success?: boolean;
    errorCode?: string;
    statusCode?: number;
    responseTimeMs?: number;
    status: number;
    result: string;
}

export interface AdminLogList {
    total: number;
    page: number;
    pageSize: number;
    range: AdminRange;
    events: McpLogEntry[];
}

export interface AdminSecurity {
    authEnabled: boolean;
    rateLimitFree: number;
    rateLimitPro: number;
    summary: {
        authFailures24h: number;
        rateLimitEvents24h: number;
        premiumDenied24h: number;
        totalSecurityEvents: number;
    };
    rateLimitTopKeys: Array<{ keyPrefix: string; count: number }>;
    recentEvents: Array<{
        event: string;
        timestamp: number;
        keyPrefix: string;
        tier: string;
        tool: string;
        errorCode: string;
    }>;
}

export interface AdminHealth {
    status: string;
    dbConnected: boolean;
    uptime: number;
    timestamp: number;
    service: string;
    version: string;
    memory: { rss: number; heapUsed: number };
    collections: Array<{ name: string; count: number; lastEventAt: number | null }>;
    config: {
        authEnabled: boolean;
        analyticsEnabled: boolean;
        loggingEnabled: boolean;
        rateLimitFree: number;
        rateLimitPro: number;
        tools: {
            registered: number;
            configured: number;
            enabled: string[];
            disabled: string[];
            unknown: string[];
            implicitlyEnabled: string[];
            inSync: boolean;
        };
    };
}

export interface AdminSettings {
    rateLimitFree: number;
    rateLimitPro: number;
    authEnabled: boolean;
    analyticsEnabled: boolean;
    loggingEnabled: boolean;
    tools: Record<string, boolean>;
    settingsDoc: string;
}

export interface AdminAuditEntry {
    id: string;
    adminEmail: string;
    action: string;
    targetType: string;
    targetId?: string;
    meta?: Record<string, unknown>;
    at: number;
}

export interface AdminAudit {
    total: number;
    page: number;
    pageSize: number;
    entries: AdminAuditEntry[];
}

export interface PlaygroundResult {
    ok: boolean;
    tool: string;
    arguments?: Record<string, unknown>;
    result?: unknown;
    error?: string;
    statusCode: number;
    responseTimeMs: number;
}

export async function getAdminStatus(): Promise<AdminStatus> {
    if (adminStatusCache && Date.now() < adminStatusCache.expiresAt) {
        return adminStatusCache.value;
    }
    const status = await request<AdminStatus>('/api/admin/mcp/status');
    adminStatusCache = { value: status, expiresAt: Date.now() + STATUS_TTL_MS };
    return status;
}

export function getOverview(range?: string): Promise<AdminOverview> {
    const key = range || 'default';
    const cached = overviewCache.get(key);
    if (cached && Date.now() < cached.expiresAt) {
        return Promise.resolve(cached.value);
    }
    const q = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<AdminOverview>(`/api/admin/mcp/overview${q}`).then((data) => {
        overviewCache.set(key, { value: data, expiresAt: Date.now() + OVERVIEW_TTL_MS });
        return data;
    });
}

export function getAnalytics(range?: string): Promise<AdminAnalytics> {
    const q = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<AdminAnalytics>(`/api/admin/mcp/analytics${q}`);
}

export function getUsers(params?: { search?: string; plan?: string; status?: string; page?: number; pageSize?: number }): Promise<AdminUserList> {
    const p = new URLSearchParams();
    if (params?.search) p.set('search', params.search);
    if (params?.plan) p.set('plan', params.plan);
    if (params?.status) p.set('status', params.status);
    p.set('page', String(params?.page || 1));
    p.set('pageSize', String(params?.pageSize || 25));
    return request<AdminUserList>(`/api/admin/mcp/users?${p.toString()}`);
}

export function getUserDetail(uid: string): Promise<AdminUserDetail> {
    return request<AdminUserDetail>(`/api/admin/mcp/users/${encodeURIComponent(uid)}`);
}

export async function suspendUser(uid: string): Promise<void> {
    await request(`/api/admin/mcp/users/${encodeURIComponent(uid)}/suspend`, { method: 'POST' });
}

export async function unsuspendUser(uid: string): Promise<void> {
    await request(`/api/admin/mcp/users/${encodeURIComponent(uid)}/unsuspend`, { method: 'POST' });
}

export function listAdminKeys(params?: { status?: string; search?: string; page?: number; pageSize?: number }): Promise<AdminApiKeyList> {
    const p = new URLSearchParams();
    if (params?.status) p.set('status', params.status);
    if (params?.search) p.set('search', params.search);
    p.set('page', String(params?.page || 1));
    p.set('pageSize', String(params?.pageSize || 25));
    return request<AdminApiKeyList>(`/api/admin/mcp/api-keys?${p.toString()}`);
}

export async function patchApiKey(id: string, action: 'revoke' | 'disable' | 'enable' | 'restore'): Promise<void> {
    await request(`/api/admin/mcp/api-keys/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify({ action }),
    });
}

export async function deleteAdminApiKey(id: string): Promise<void> {
    await request(`/api/admin/mcp/api-keys/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
}

export function getTools(): Promise<{ tools: AdminTool[] }> {
    return request<{ tools: AdminTool[] }>('/api/admin/mcp/tools');
}

export async function setTool(name: string, enabled: boolean): Promise<void> {
    await request(`/api/admin/mcp/tools/${encodeURIComponent(name)}`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled }),
    });
}

export function getComponents(range?: string): Promise<AdminComponents> {
    const q = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<AdminComponents>(`/api/admin/mcp/components${q}`);
}

export function getSearchAnalytics(range?: string): Promise<AdminSearch> {
    const q = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<AdminSearch>(`/api/admin/mcp/search${q}`);
}

export function getLogs(params?: { event?: string; status?: number | string; result?: string; search?: string; page?: number; pageSize?: number }): Promise<AdminLogList> {
    const p = new URLSearchParams();
    if (params?.event) p.set('event', params.event);
    if (params?.status !== undefined && params?.status !== '') p.set('status', String(params.status));
    if (params?.result) p.set('result', params.result);
    if (params?.search) p.set('search', params.search);
    p.set('page', String(params?.page || 1));
    p.set('pageSize', String(params?.pageSize || 25));
    return request<AdminLogList>(`/api/admin/mcp/logs?${p.toString()}`);
}

export interface AdminLogDeleteResult {
    ok: boolean;
    deleted: number;
    remaining: number;
    docsTouched: number;
    range: AdminRange;
    filters: Record<string, string | number | null>;
}

export function deleteLogs(params?: { event?: string; status?: number | string; result?: string; search?: string; range?: string; confirm?: string }): Promise<AdminLogDeleteResult> {
    const p = new URLSearchParams();
    if (params?.event) p.set('event', params.event);
    if (params?.status !== undefined && params?.status !== '') p.set('status', String(params.status));
    if (params?.result) p.set('result', params.result);
    if (params?.search) p.set('search', params.search);
    if (params?.range) p.set('range', params.range);
    if (params?.confirm) p.set('confirm', params.confirm);
    return request<AdminLogDeleteResult>(`/api/admin/mcp/logs?${p.toString()}`, { method: 'DELETE' });
}

export function getSecurity(): Promise<AdminSecurity> {
    return request<AdminSecurity>('/api/admin/mcp/security');
}

export function getHealth(): Promise<AdminHealth> {
    return request<AdminHealth>('/api/admin/mcp/health');
}

export function getAlerts(): Promise<{ alerts: AdminAlert[] }> {
    return request<{ alerts: AdminAlert[] }>('/api/admin/mcp/alerts');
}

export async function resolveAlert(key: string): Promise<void> {
    await request(`/api/admin/mcp/alerts/${encodeURIComponent(key)}/resolve`, { method: 'POST' });
}

export async function unresolveAlert(key: string): Promise<void> {
    await request(`/api/admin/mcp/alerts/${encodeURIComponent(key)}/unresolve`, { method: 'POST' });
}

export function getSettings(): Promise<AdminSettings> {
    return request<AdminSettings>('/api/admin/mcp/settings');
}

export function updateSettings(patch: Partial<AdminSettings>): Promise<AdminSettings> {
    return request<AdminSettings>('/api/admin/mcp/settings', {
        method: 'PUT',
        body: JSON.stringify(patch),
    });
}

export function getAudit(page = 1, pageSize = 25): Promise<AdminAudit> {
    const p = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    return request<AdminAudit>(`/api/admin/mcp/audit?${p.toString()}`);
}

export interface PlaygroundRequest {
    tool: string;
    arguments: Record<string, unknown>;
}

export function runPlayground(payload: PlaygroundRequest): Promise<PlaygroundResult> {
    return request<PlaygroundResult>('/api/admin/mcp/playground', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

export type ExportType = 'events' | 'logs' | 'users' | 'components' | 'search' | 'stats' | 'keys';
export type ExportFormat = 'csv' | 'json';

export async function downloadExport(
    type: ExportType,
    format: ExportFormat,
    range?: string,
    filename?: string,
    params?: Record<string, string | number | undefined>,
): Promise<void> {
    const p = new URLSearchParams({ type, format });
    if (range) p.set('range', range);
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== '') p.set(k, String(v));
        }
    }
    let res: Response | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            res = await fetchWithTimeout(`${MCP_BASE}/api/admin/mcp/export?${p.toString()}`, {
                headers: await authHeaders(),
            }, 30000);
            if (res.status !== 502 && res.status !== 504) break;
        } catch (e) {
            if (isAbortError(e)) throw new Error('Export timed out');
            if (attempt === 1) throw e;
        }
        if (attempt === 0) await new Promise((r) => setTimeout(r, 1500));
    }
    if (!res) throw new Error('Export failed: server unreachable');
    if (!res.ok) {
        throw new Error(`Export failed: ${res.status}`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `ui-hub-mcp-${type}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}

/* ────────────────────────────────────────────────────────────────────────────
 * Observability (additive): Live Activity, AI Search Analytics, Diagnostics,
 * and the actionable Alerts engine. These endpoints are new; legacy admin
 * methods above are unchanged.
 * ──────────────────────────────────────────────────────────────────────────── */

export interface AdminRequestEvent {
    id: string;
    correlationId: string;
    method: string;
    toolName?: string;
    userId?: string;
    apiKeyId?: string;
    keyPrefix?: string;
    tier?: string;
    clientName?: string;
    clientVersion?: string;
    sessionId?: string;
    status: string;
    success: boolean;
    errorCode?: string;
    errorCategory?: string;
    statusCode?: number;
    latencyMs?: number;
    resultCount?: number;
    resourceType?: string;
    resourceId?: string;
    query?: string;
    timestamp: number;
}

export interface AdminActivity {
    total: number;
    page: number;
    pageSize: number;
    items: AdminRequestEvent[];
    range: AdminRange;
    summary: { byStatus: Record<string, number>; byClient: Record<string, number>; avgLatencyMs: number };
    note?: string;
}

export interface AdminSearchEvent {
    id: string;
    correlationId: string;
    resourceType: string;
    tool?: string;
    query?: string;
    queryNormalized?: string;
    resultCount: number;
    zeroResults: boolean;
    fetched?: boolean;
    codeRetrieved?: boolean;
    returnedIds?: string[];
    failureCategory?: string;
    clientName?: string;
    tier?: string;
    latencyMs?: number;
    timestamp: number;
}

export interface AdminSearchAnalytics {
    total: number;
    page: number;
    pageSize: number;
    items: AdminSearchEvent[];
    range: AdminRange;
    summary: {
        totalSearches: number;
        zeroResults: number;
        zeroResultRate: number;
        fetched: number;
        codeRetrieved: number;
        fetchThroughRate: number;
        topQueries: Array<{ query: string; count: number; zeroResults: number }>;
    };
    note?: string;
}

export interface AdminDiagnosticSample {
    at: number;
    correlationId?: string;
    method?: string;
    tool?: string;
    status?: number;
    errorCode?: string;
    latencyMs?: number;
    query?: string;
    url?: string;
}

export interface AdminDiagnostic {
    id: string;
    fingerprint: string;
    category: string;
    severity: string;
    title: string;
    tool?: string;
    method?: string;
    resourceType?: string;
    resourceId?: string;
    query?: string;
    url?: string;
    statusCode?: number;
    errorCode?: string;
    errorSummary: string;
    clientName?: string;
    userId?: string;
    apiKeyId?: string;
    occurrences: number;
    firstSeen: number;
    lastSeen: number;
    resolution: string;
    notes?: string;
    sampleEvents?: AdminDiagnosticSample[];
}

export interface AdminDiagnostics {
    total: number;
    page: number;
    pageSize: number;
    items: AdminDiagnostic[];
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
    engineState: Record<string, unknown> | null;
}

export interface AdminFixCenterItem {
    id: string;
    source: 'diagnostic' | 'signal';
    category: string;
    severity: string;
    title: string;
    summary: string;
    occurrences: number;
    lastSeen: number | null;
    firstSeen?: number | null;
    evidence: Record<string, unknown>;
    fixPrompt: string;
    href?: string | null;
}

export interface AdminFixCenter {
    range: AdminRange;
    generatedAt: number;
    totals: {
        unresolvedDiagnostics: number;
        activeSignals: number;
        items: number;
        bySource: Record<string, number>;
        bySeverity: Record<string, number>;
        byCategory: Record<string, number>;
    };
    items: AdminFixCenterItem[];
    engineState: Record<string, unknown> | null;
}

export function getFixCenter(range?: string): Promise<AdminFixCenter> {
    const q = range ? `?range=${encodeURIComponent(range)}` : '';
    return request<AdminFixCenter>(`/api/admin/mcp/fix-center${q}`);
}

export interface AdminAlertRule {
    ruleId: string;
    name: string;
    description?: string;
    enabled: boolean;
    severity: string;
    metric: string;
    comparator: string;
    threshold: number;
    windowMinutes?: number;
    cooldownMinutes?: number;
    updatedAt?: number;
    updatedBy?: string;
}

export interface AdminAlertEvent {
    id: string;
    ruleId: string;
    ruleName?: string;
    severity: string;
    status: 'open' | 'acknowledged' | 'resolved' | 'muted';
    fingerprint?: string;
    title: string;
    message: string;
    value?: number;
    threshold?: number;
    firstDetected: number;
    lastDetected: number;
    resolvedAt?: number;
    mutedUntil?: number;
    owner?: string;
    notes?: string;
}

export interface AdminAlertEventList {
    total: number;
    page: number;
    pageSize: number;
    items: AdminAlertEvent[];
    counts: Record<string, number>;
    engineState: Record<string, unknown> | null;
}

export interface ObservabilityParams {
    from?: string;
    to?: string;
    range?: string;
    page?: number;
    pageSize?: number;
    [key: string]: string | number | undefined;
}

function buildQuery(params?: ObservabilityParams): string {
    const p = new URLSearchParams();
    if (params) {
        for (const [k, v] of Object.entries(params)) {
            if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
        }
    }
    const qs = p.toString();
    return qs ? `?${qs}` : '';
}

export function getActivity(params?: ObservabilityParams): Promise<AdminActivity> {
    return request<AdminActivity>(`/api/admin/mcp/activity${buildQuery(params)}`);
}

export function getActivityEvent(eventId: string): Promise<{ item: AdminRequestEvent }> {
    return request<{ item: AdminRequestEvent }>(`/api/admin/mcp/activity/${encodeURIComponent(eventId)}`);
}

export function getAiSearchAnalytics(params?: ObservabilityParams): Promise<AdminSearchAnalytics> {
    return request<AdminSearchAnalytics>(`/api/admin/mcp/search-analytics${buildQuery(params)}`);
}

export function getDiagnostics(params?: ObservabilityParams): Promise<AdminDiagnostics> {
    return request<AdminDiagnostics>(`/api/admin/mcp/diagnostics${buildQuery(params)}`);
}

export function getDiagnostic(id: string): Promise<{ item: AdminDiagnostic }> {
    return request<{ item: AdminDiagnostic }>(`/api/admin/mcp/diagnostics/${encodeURIComponent(id)}`);
}

export function generateFixPrompt(id: string): Promise<{ id: string; fingerprint: string; category: string; prompt: string }> {
    return request(`/api/admin/mcp/diagnostics/${encodeURIComponent(id)}/generate-fix-prompt`, { method: 'POST' });
}

export function setDiagnosticStatus(id: string, status: string, notes?: string): Promise<{ item: AdminDiagnostic }> {
    return request(`/api/admin/mcp/diagnostics/${encodeURIComponent(id)}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
    });
}

export function getAlertRules(): Promise<{ rules: AdminAlertRule[]; engineState: Record<string, unknown> | null }> {
    return request(`/api/admin/mcp/alerts/rules`);
}

export function createAlertRule(patch: Partial<AdminAlertRule>): Promise<{ rule: AdminAlertRule }> {
    return request(`/api/admin/mcp/alerts/rules`, { method: 'POST', body: JSON.stringify(patch) });
}

export function updateAlertRule(ruleId: string, patch: Partial<AdminAlertRule>): Promise<{ rule: AdminAlertRule }> {
    return request(`/api/admin/mcp/alerts/rules/${encodeURIComponent(ruleId)}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
    });
}

export function getAlertEvents(params?: ObservabilityParams): Promise<AdminAlertEventList> {
    return request<AdminAlertEventList>(`/api/admin/mcp/alerts/events${buildQuery(params)}`);
}

export function getAlertEvent(id: string): Promise<{ item: AdminAlertEvent }> {
    return request<{ item: AdminAlertEvent }>(`/api/admin/mcp/alerts/events/${encodeURIComponent(id)}`);
}

export function alertAction(id: string, action: 'acknowledge' | 'resolve' | 'reopen' | 'mute', body?: { notes?: string; muteMinutes?: number }): Promise<{ item: AdminAlertEvent }> {
    return request(`/api/admin/mcp/alerts/events/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        body: JSON.stringify(body || {}),
    });
}