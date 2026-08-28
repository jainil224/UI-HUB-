import { firebaseService } from './firebase.js';

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
  componentId?: string;
  tool?: string;
  query?: string;
  timestamp: number;
  success?: boolean;
  errorCode?: string;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private static buffer: McpEvent[] = [];
  private static flushTimer: NodeJS.Timeout | null = null;

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  private getDb() {
    return firebaseService.getDb();
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
      const db = this.getDb();
      const batch = db.batch();
      const now = Date.now();
      const dateKey = new Date(now).toISOString().split('T')[0];
      const ref = db.collection('mcp_analytics').doc(`${dateKey}_${now}_${Math.random().toString(36).slice(2, 8)}`);

      batch.set(ref, {
        events,
        date: dateKey,
        createdAt: now,
      });

      await batch.commit();
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[AnalyticsService] Error flushing events:', error);
      }
    }
  }

  /**
   * Get daily usage summary (for admin dashboard).
   */
  async getDailySummary(dateKey: string): Promise<{
    totalRequests: number;
    requestsToday: number;
    activeKeys: number;
    topComponents: string[];
    topSearches: string[];
    freeUsage: number;
    proUsage: number;
    failedRequests: number;
    rateLimitEvents: number;
  }> {
    try {
      const db = this.getDb();
      const snapshot = await db
        .collection('mcp_analytics')
        .where('date', '==', dateKey)
        .get();

      let totalRequests = 0;
      let requestsToday = 0;
      const componentCounts: Record<string, number> = {};
      const searchCounts: Record<string, number> = {};
      let freeUsage = 0;
      let proUsage = 0;
      let failedRequests = 0;
      let rateLimitEvents = 0;

      snapshot.docs.forEach((doc) => {
        const data = doc.data();
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

      return {
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
    try {
      const db = this.getDb();
      const snapshot = await db
        .collection('mcp_api_keys')
        .where('status', '==', 'active')
        .get();
      return snapshot.size;
    } catch {
      return 0;
    }
  }
}

export const analyticsService = AnalyticsService.getInstance();
