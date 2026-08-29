import { getCollection as mongoCollection } from './mongo.js';

export type McpEventType =
  | 'mcp_request'
  | 'component_search'
  | 'component_fetch'
  | 'code_fetch'
  | 'template_fetch'
  | 'animation_fetch'
  | 'auth_failure'
  | 'rate_limit'
  | 'premium_denied';

export interface McpEvent {
  event: McpEventType;
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
}

export interface DailySummary {
  totalRequests: number;
  requestsToday: number;
  activeKeys: number;
  topComponents: string[];
  topSearches: string[];
  freeUsage: number;
  proUsage: number;
  failedRequests: number;
  rateLimitEvents: number;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private static buffer: McpEvent[] = [];
  private static flushTimer: NodeJS.Timeout | null = null;
  private static queryCache: Map<string, { expiresAt: number; events: McpEvent[] }> = new Map();
  private static QUERY_CACHE_TTL_MS = 30000;
  private static QUERY_EVENT_CAP = 2000;
  private static dailySummaryCache: Map<string, { value: DailySummary; expiresAt: number }> = new Map();
  private static activeKeyCountCache: { value: number; expiresAt: number } | null = null;

  static invalidateQueryCache(): void {
    AnalyticsService.queryCache.clear();
    AnalyticsService.dailySummaryCache.clear();
    AnalyticsService.activeKeyCountCache = null;
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private async getDb() {
    return mongoCollection('mcp_analytics');
  }

  /**
   * Track an MCP event.
   * Events are buffered and flushed in batches to avoid Firestore write spam.
   */
  async track(event: McpEvent): Promise<void> {
    // Don't store sensitive data - no raw keys, no full queries that could be PII
    const sanitized = {
      ...event,
      query: event.query ? event.query.slice(0, 200) : undefined,
    };

    if (AnalyticsService.flushTimer) {
      AnalyticsService.buffer.push(sanitized);
      return;
    }

    // Flush after 5 seconds or 100 events, whichever comes first
    AnalyticsService.buffer.push(sanitized);
    AnalyticsService.flushTimer = setTimeout(() => {
      void this.flushBuffer();
    }, 5000);
  }

  private async flushBuffer(): Promise<void> {
    if (AnalyticsService.flushTimer) {
      clearTimeout(AnalyticsService.flushTimer);
      AnalyticsService.flushTimer = null;
    }

    const events = AnalyticsService.buffer.splice(0);
    if (events.length === 0) return;

    try {
      const { configService } = await import('../config/configService.js');
      const cfg = await configService.get();
      if (!cfg.analyticsEnabled) return;

      const db = await this.getDb();
      const now = Date.now();
      const dateKey = new Date(now).toISOString().split('T')[0];

      await db.insertOne({
        events,
        date: dateKey,
        createdAt: now,
      });
      AnalyticsService.invalidateQueryCache();
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[AnalyticsService] Error flushing events:', error);
      }
    }
  }

  /**
   * Immediately flush any buffered events to MongoDB.
   * Called on graceful shutdown so no real traffic is lost on restart.
   */
  async flushNow(): Promise<void> {
    if (AnalyticsService.flushTimer) {
      clearTimeout(AnalyticsService.flushTimer);
      AnalyticsService.flushTimer = null;
    }
    await this.flushBuffer();
  }

  /**
   * Get daily usage summary (for admin dashboard).
   */
  async getDailySummary(dateKey: string): Promise<DailySummary> {
    const cached = AnalyticsService.dailySummaryCache.get(dateKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.value;
    }

    try {
      const db = await this.getDb();
      const docs = await db.find({ date: dateKey }).toArray();

      let totalRequests = 0;
      let requestsToday = 0;
      const componentCounts: Record<string, number> = {};
      const searchCounts: Record<string, number> = {};
      let freeUsage = 0;
      let proUsage = 0;
      let failedRequests = 0;
      let rateLimitEvents = 0;

      docs.forEach((doc) => {
        const data = doc;
        if (data.events && Array.isArray(data.events)) {
          data.events.forEach((e: McpEvent) => {
            totalRequests++;
            if (e.timestamp >= Date.now() - 24 * 60 * 60 * 1000) {
              requestsToday++;
            }
            if (e.componentId) {
              componentCounts[e.componentId] = (componentCounts[e.componentId] || 0) + 1;
            }
            if (e.query) {
              const q = e.query.toLowerCase();
              searchCounts[q] = (searchCounts[q] || 0) + 1;
            }
            if (e.userId) {
              // We can't easily distinguish free/pro from the event alone,
              // but if there was an error it counts as failed
              if (e.success === false) failedRequests++;
            }
            if (e.event === 'rate_limit') rateLimitEvents++;
            if (e.event === 'premium_denied') failedRequests++;
          });
        }
      });

      const summary: DailySummary = {
        totalRequests,
        requestsToday,
        activeKeys: await this.getActiveKeyCount(),
        topComponents: Object.entries(componentCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([k]) => k),
        topSearches: Object.entries(searchCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([k]) => k),
        freeUsage,
        proUsage,
        failedRequests,
        rateLimitEvents,
      };

      AnalyticsService.dailySummaryCache.set(dateKey, {
        value: summary,
        expiresAt: Date.now() + AnalyticsService.QUERY_CACHE_TTL_MS,
      });
      return summary;
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[AnalyticsService] Error getting daily summary:', error);
      }
      return {
        totalRequests: 0,
        requestsToday: 0,
        activeKeys: 0,
        topComponents: [],
        topSearches: [],
        freeUsage: 0,
        proUsage: 0,
        failedRequests: 0,
        rateLimitEvents: 0,
      };
    }
  }

  private async getActiveKeyCount(): Promise<number> {
    if (AnalyticsService.activeKeyCountCache && Date.now() < AnalyticsService.activeKeyCountCache.expiresAt) {
      return AnalyticsService.activeKeyCountCache.value;
    }
    try {
      const keysCollection = await mongoCollection('mcp_api_keys');
      const count = await keysCollection.countDocuments({ status: 'active' });
      AnalyticsService.activeKeyCountCache = { value: count, expiresAt: Date.now() + AnalyticsService.QUERY_CACHE_TTL_MS };
      return count;
    } catch {
      return 0;
    }
  }

  async queryEvents(fromKey: string, toKey?: string, opts?: { refresh?: boolean; maxEvents?: number }): Promise<McpEvent[]> {
    try {
      const db = await this.getDb();
      const cacheKey = `${fromKey}__${toKey || ''}`;
      const cached = AnalyticsService.queryCache.get(cacheKey);
      if (!opts?.refresh && cached && Date.now() < cached.expiresAt) {
        return cached.events;
      }
      const filter: Record<string, any> = { date: { $gte: fromKey } };
      if (toKey) filter.date.$lte = toKey;
      const docs = await db.find(filter).toArray();
      const events: McpEvent[] = [];
      const max = opts?.maxEvents ?? AnalyticsService.QUERY_EVENT_CAP;
      docs.forEach((doc) => {
        if (events.length >= max) return;
        const data = doc;
        if (data.events && Array.isArray(data.events)) {
          events.push(...data.events.slice(0, max - events.length));
        }
      });
      AnalyticsService.queryCache.set(cacheKey, {
        expiresAt: Date.now() + AnalyticsService.QUERY_CACHE_TTL_MS,
        events,
      });
      return events;
    } catch (error: any) {
      console.error('[AnalyticsService] Error querying events:', error);
      return [];
    }
  }

  async getActiveKeyCountByUser(): Promise<Map<string, number>> {
    const counts = new Map<string, number>();
    try {
      const db = await mongoCollection('mcp_api_keys');
      const docs = await db.find({}).toArray();
      docs.forEach((doc) => {
        const data = doc as any;
        if (data.user_id) {
          counts.set(data.user_id, (counts.get(data.user_id) || 0) + 1);
        }
      });
    } catch {
      // dev mode
    }
    return counts;
  }
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

export interface ComponentUsage {
  id: string;
  count: number;
  searches: number;
  codeFetches: number;
  fetchCount: number;
  uniqueUsers: number;
  freeCount: number;
  proCount: number;
}

export interface SearchUsage {
  query: string;
  count: number;
  zeroResults: boolean;
}

export interface McpStats {
  requests: number;
  uniqueUsers: number;
  errorRate: number;
  failedRequests: number;
  avgResponseTimeMs: number;
  rateLimitEvents: number;
  premiumDenied: number;
  authFailures: number;
  byDay: Record<string, number>;
  byTool: Record<string, ToolUsage>;
  byTier: Record<string, number>;
  byStatus: Record<string, number>;
  topComponents: ComponentUsage[];
  topSearches: SearchUsage[];
  zeroResultSearches: SearchUsage[];
}

export function aggregateEvents(events: McpEvent[]): McpStats {
  const totalRequestEvents = events.filter((e) => e.event === 'mcp_request');
  const toolEvents = events.filter(
    (e) =>
      e.event === 'component_search' ||
      e.event === 'component_fetch' ||
      e.event === 'code_fetch' ||
      e.event === 'template_fetch' ||
      e.event === 'animation_fetch'
  );

  const byDay: Record<string, number> = {};
  const byTier: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const byTool: Record<string, ToolUsage> = {};
  const toolUsers: Record<string, Set<string>> = {};
  const componentMap: Record<string, ComponentUsage> = {};
  const componentUsers: Record<string, Set<string>> = {};
  const searchMap: Record<string, SearchUsage> = {};
  const users = new Set<string>();
  let failed = 0;
  let responseTimeSum = 0;
  let responseTimeCount = 0;
  let rateLimitEvents = 0;
  let premiumDenied = 0;
  let authFailures = 0;

  events.forEach((e) => {
    if (e.userId) users.add(e.userId);

    if (e.event === 'rate_limit') rateLimitEvents++;
    if (e.event === 'premium_denied') premiumDenied++;
    if (e.event === 'auth_failure') authFailures++;

    if (e.tier && e.tier !== 'FREE') byTier[e.tier] = (byTier[e.tier] || 0) + 1;
    else if (e.tier) byTier.FREE = (byTier.FREE || 0) + 1;

    if (e.statusCode) byStatus[String(e.statusCode)] = (byStatus[String(e.statusCode)] || 0) + 1;
    if (e.responseTimeMs != null) {
      responseTimeSum += e.responseTimeMs;
      responseTimeCount++;
    }

    if (e.event === 'mcp_request') {
      if (e.success === false) failed++;
    }

    if (e.componentId) {
      const c = componentMap[e.componentId] || {
        id: e.componentId,
        count: 0,
        searches: 0,
        codeFetches: 0,
        fetchCount: 0,
        uniqueUsers: 0,
        freeCount: 0,
        proCount: 0,
      };
      c.count++;
      c.fetchCount++;
      if (e.event === 'code_fetch') c.codeFetches++;
      if (e.tier && e.tier !== 'FREE') c.proCount++;
      else c.freeCount++;
      if (e.userId) {
        if (!componentUsers[e.componentId]) componentUsers[e.componentId] = new Set();
        componentUsers[e.componentId].add(e.userId);
      }
      componentMap[e.componentId] = c;
    }

    if (e.event === 'component_search' && e.query) {
      const q = e.query.trim().toLowerCase();
      const s = searchMap[q] || { query: q, count: 0, zeroResults: e.success === false };
      s.count++;
      if (e.success === false) s.zeroResults = true;
      searchMap[q] = s;
    }
  });

  totalRequestEvents.forEach((e) => {
    const day = new Date(e.timestamp).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  });

  toolEvents.forEach((e) => {
    const name = e.tool || 'unknown';
    const t = byTool[name] || {
      name,
      total: 0,
      success: 0,
      failed: 0,
      uniqueUsers: 0,
      avgResponseTimeMs: 0,
      lastUsed: 0,
    };
    t.total++;
    if (e.success === false || e.errorCode) t.failed++;
    else t.success++;
    if (e.userId) {
      if (!toolUsers[name]) toolUsers[name] = new Set();
      toolUsers[name].add(e.userId);
    }
    if (e.timestamp > t.lastUsed) t.lastUsed = e.timestamp;
    byTool[name] = t;
  });

  if (responseTimeCount > 0) {
    responseTimeSum = Math.round(responseTimeSum / responseTimeCount);
  }

  const sortedToolUsage = Object.values(byTool)
    .sort((a, b) => b.total - a.total)
    .map((t) => ({ ...t, avgResponseTimeMs: 0, uniqueUsers: toolUsers[t.name] ? toolUsers[t.name].size : 0 }));

  return {
    requests: totalRequestEvents.length,
    uniqueUsers: users.size,
    errorRate: totalRequestEvents.length > 0 ? failed / totalRequestEvents.length : 0,
    failedRequests: failed,
    avgResponseTimeMs: responseTimeSum,
    rateLimitEvents,
    premiumDenied,
    authFailures,
    byDay,
    byTool: Object.fromEntries(sortedToolUsage.map((t) => [t.name, t])),
    byTier: Object.fromEntries(Object.entries(byTier).sort((a, b) => b[1] - a[1])),
    byStatus: Object.fromEntries(Object.entries(byStatus).sort((a, b) => b[1] - a[1])),
    topComponents: Object.values(componentMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)
      .map((c) => ({ ...c, uniqueUsers: componentUsers[c.id] ? componentUsers[c.id].size : 0 })),
    topSearches: Object.values(searchMap).sort((a, b) => b.count - a.count).slice(0, 25),
    zeroResultSearches: Object.values(searchMap)
      .filter((s) => s.zeroResults)
      .sort((a, b) => b.count - a.count)
      .slice(0, 25),
  };
}

export const analyticsService = AnalyticsService.getInstance();
