import { getCollection } from './mongo.js';
import { configService } from '../config/configService.js';
import { normalizeQuery, redactText, sanitizeText } from './redaction.js';
import type { FailureCategory } from './failureClassifier.js';

export const REQUEST_EVENTS_COLLECTION = 'mcp_request_events';
export const SEARCH_EVENTS_COLLECTION = 'mcp_search_events';

export type RequestStatus =
  | 'success'
  | 'no_results'
  | 'validation_error'
  | 'authorization_denied'
  | 'rate_limited'
  | 'server_error';

export type ResourceType = 'component' | 'template' | 'animation' | 'category' | 'other';

export interface RequestEvent {
  correlationId: string;
  method: string;
  protocolTool?: string;
  toolName?: string;
  userId?: string;
  apiKeyId?: string;
  keyPrefix?: string;
  tier?: string;
  clientName?: string;
  clientVersion?: string;
  sessionId?: string;
  transport?: string;
  status: RequestStatus;
  success: boolean;
  errorCode?: string;
  errorCategory?: FailureCategory;
  statusCode?: number;
  latencyMs?: number;
  resultCount?: number;
  resourceType?: ResourceType;
  resourceId?: string;
  query?: string;
  ipHash?: string;
  timestamp: number;
}

export interface SearchEvent {
  correlationId: string;
  resourceType: ResourceType;
  query?: string;
  queryNormalized?: string;
  filters?: Record<string, unknown>;
  resultCount: number;
  zeroResults: boolean;
  fetched?: boolean;
  codeRetrieved?: boolean;
  returnedIds?: string[];
  failureCategory?: FailureCategory;
  clientName?: string;
  tool?: string;
  tier?: string;
  userId?: string;
  apiKeyId?: string;
  latencyMs?: number;
  timestamp: number;
}

export interface ToolTelemetry {
  kind: 'search' | 'fetch' | 'code' | 'other';
  resourceType: ResourceType;
}

/** Mapping of registered tools to their telemetry semantics. */
export const TOOL_TELEMETRY: Record<string, ToolTelemetry> = {
  search_components: { kind: 'search', resourceType: 'component' },
  get_component: { kind: 'fetch', resourceType: 'component' },
  get_component_code: { kind: 'code', resourceType: 'component' },
  search_templates: { kind: 'search', resourceType: 'template' },
  get_template: { kind: 'fetch', resourceType: 'template' },
  get_template_source: { kind: 'code', resourceType: 'template' },
  search_animations: { kind: 'search', resourceType: 'animation' },
  get_animation_code: { kind: 'code', resourceType: 'animation' },
  search_by_behavior: { kind: 'search', resourceType: 'component' },
  get_component_metadata: { kind: 'fetch', resourceType: 'component' },
  get_dependencies: { kind: 'fetch', resourceType: 'component' },
  get_ai_prompts: { kind: 'fetch', resourceType: 'component' },
  list_categories: { kind: 'other', resourceType: 'category' },
  list_all_components: { kind: 'search', resourceType: 'component' },
};

export function toolTelemetry(toolName?: string): ToolTelemetry | undefined {
  if (!toolName) return undefined;
  return TOOL_TELEMETRY[toolName];
}

const FLUSH_DELAY_MS = 5000;
const MAX_BUFFER = 250;

export interface RequestQuery {
  fromTs?: number;
  toTs?: number;
  userId?: string;
  client?: string;
  method?: string;
  toolName?: string;
  status?: string;
  resourceType?: string;
  errorCategory?: string;
  page?: number;
  pageSize?: number;
  sortDir?: 1 | -1;
}

export interface SearchQuery {
  fromTs?: number;
  toTs?: number;
  userId?: string;
  resourceType?: string;
  zeroResults?: boolean;
  query?: string;
  page?: number;
  pageSize?: number;
}

export class TelemetryService {
  private static instance: TelemetryService;
  private requestBuffer: RequestEvent[] = [];
  private searchBuffer: SearchEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private flushing = false;

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  private async enabled(): Promise<boolean> {
    try {
      const cfg = await configService.get();
      return cfg.analyticsEnabled !== false;
    } catch {
      return true;
    }
  }

  private schedule(): void {
    if (this.flushTimer) return;
    this.flushTimer = setTimeout(() => {
      void this.flushBuffer();
    }, FLUSH_DELAY_MS);
    if (typeof this.flushTimer.unref === 'function') this.flushTimer.unref();
  }

  /** Record a protocol/tool request. Buffered; never blocks the caller. */
  recordRequest(event: RequestEvent): void {
    this.requestBuffer.push({ ...event, query: event.query ? normalizeQuery(event.query) : undefined });
    if (this.requestBuffer.length + this.searchBuffer.length >= MAX_BUFFER) {
      void this.flushBuffer();
    } else {
      this.schedule();
    }
  }

  /** Record a search-class event. */
  recordSearch(event: SearchEvent): void {
    const normalized = event.queryNormalized ?? (event.query ? normalizeQuery(event.query) : undefined);
    this.searchBuffer.push({ ...event, queryNormalized: normalized });
    if (this.requestBuffer.length + this.searchBuffer.length >= MAX_BUFFER) {
      void this.flushBuffer();
    } else {
      this.schedule();
    }
  }

  /**
   * Cross-request correlation: mark the most recent search by the same user that
   * returned `resourceId` as subsequently fetched / code-retrieved. Best-effort;
   * if no correlation is found the search simply stays unmarked.
   */
  async markSearchFetched(userId: string | undefined, resourceId: string | undefined, codeRetrieved: boolean): Promise<void> {
    if (!userId || !resourceId) return;
    const patch: Record<string, unknown> = { fetched: true };
    if (codeRetrieved) patch.codeRetrieved = true;

    // Prefer the in-memory buffer (not yet flushed).
    for (let i = this.searchBuffer.length - 1; i >= 0; i--) {
      const ev = this.searchBuffer[i];
      if (ev.userId === userId && Array.isArray(ev.returnedIds) && ev.returnedIds.includes(resourceId)) {
        this.searchBuffer[i] = { ...ev, ...patch } as SearchEvent;
        return;
      }
    }

    try {
      const col = await getCollection(SEARCH_EVENTS_COLLECTION);
      await col.findOneAndUpdate(
        { userId, returnedIds: resourceId, timestamp: { $gte: Date.now() - 24 * 60 * 60 * 1000 } },
        { $set: patch },
        { sort: { timestamp: -1 } },
      );
    } catch (error: any) {
      console.error('[Telemetry] markSearchFetched failed:', redactText(error?.message || error));
    }
  }

  async flushNow(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flushBuffer();
  }

  private async flushBuffer(): Promise<void> {
    if (this.flushing) return;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    if (this.requestBuffer.length === 0 && this.searchBuffer.length === 0) return;

    this.flushing = true;
    const requests = this.requestBuffer.splice(0);
    const searches = this.searchBuffer.splice(0);

    try {
      if (await this.enabled()) {
        if (requests.length > 0) {
          const col = await getCollection(REQUEST_EVENTS_COLLECTION);
          await col.insertMany(requests as any[]);
        }
        if (searches.length > 0) {
          const col = await getCollection(SEARCH_EVENTS_COLLECTION);
          await col.insertMany(searches as any[]);
        }
      }
    } catch (error: any) {
      // Never let telemetry failures break tool responses. Drop the batch.
      console.error('[Telemetry] flush failed:', redactText(error?.message || error));
    } finally {
      this.flushing = false;
      if (this.requestBuffer.length > 0 || this.searchBuffer.length > 0) this.schedule();
    }
  }

  async queryRequests(q: RequestQuery): Promise<{ total: number; page: number; pageSize: number; items: RequestEvent[] }> {
    const page = Math.max(1, q.page || 1);
    const pageSize = Math.min(200, Math.max(1, q.pageSize || 50));
    try {
      const col = await getCollection(REQUEST_EVENTS_COLLECTION);
      const filter: Record<string, any> = {};
      if (q.fromTs || q.toTs) {
        filter.timestamp = {};
        if (q.fromTs) filter.timestamp.$gte = q.fromTs;
        if (q.toTs) filter.timestamp.$lte = q.toTs;
      }
      if (q.userId) filter.userId = q.userId;
      if (q.client) filter.clientName = q.client;
      if (q.method) filter.method = q.method;
      if (q.toolName) filter.toolName = q.toolName;
      if (q.status) filter.status = q.status;
      if (q.resourceType) filter.resourceType = q.resourceType;
      if (q.errorCategory) filter.errorCategory = q.errorCategory;

      const sortDir = q.sortDir ?? -1;
      const total = await col.countDocuments(filter);
      const docs = await col
        .find(filter)
        .sort({ timestamp: sortDir })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      return { total, page, pageSize, items: docs.map(toPlain) as unknown as RequestEvent[] };
    } catch (error: any) {
      console.error('[Telemetry] queryRequests failed:', redactText(error?.message || error));
      return { total: 0, page, pageSize, items: [] };
    }
  }

  async getRequest(id: string): Promise<RequestEvent | null> {
    try {
      const col = await getCollection(REQUEST_EVENTS_COLLECTION);
      const { ObjectId } = await import('mongodb');
      if (!ObjectId.isValid(id)) {
        const byCorrelation = await col.find({ correlationId: id }).sort({ timestamp: -1 }).limit(1).toArray();
        if (byCorrelation.length === 0) return null;
        return toPlain(byCorrelation[0]) as unknown as RequestEvent;
      }
      const doc = await col.findOne({ _id: new ObjectId(id) as any });
      return doc ? (toPlain(doc) as unknown as RequestEvent) : null;
    } catch (error: any) {
      console.error('[Telemetry] getRequest failed:', redactText(error?.message || error));
      return null;
    }
  }

  async querySearches(q: SearchQuery): Promise<{ total: number; page: number; pageSize: number; items: SearchEvent[] }> {
    const page = Math.max(1, q.page || 1);
    const pageSize = Math.min(200, Math.max(1, q.pageSize || 50));
    try {
      const col = await getCollection(SEARCH_EVENTS_COLLECTION);
      const filter: Record<string, any> = {};
      if (q.fromTs || q.toTs) {
        filter.timestamp = {};
        if (q.fromTs) filter.timestamp.$gte = q.fromTs;
        if (q.toTs) filter.timestamp.$lte = q.toTs;
      }
      if (q.userId) filter.userId = q.userId;
      if (q.resourceType) filter.resourceType = q.resourceType;
      if (q.zeroResults !== undefined) filter.zeroResults = q.zeroResults;
      if (q.query) filter.queryNormalized = { $regex: escapeRegex(normalizeQuery(q.query)), $options: 'i' };

      const total = await col.countDocuments(filter);
      const docs = await col
        .find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .toArray();
      return { total, page, pageSize, items: docs.map(toPlain) as unknown as SearchEvent[] };
    } catch (error: any) {
      console.error('[Telemetry] querySearches failed:', redactText(error?.message || error));
      return { total: 0, page, pageSize, items: [] };
    }
  }

  /** Aggregate counts for the alert engine over a recent window. */
  async aggregateWindow(fromTs: number): Promise<{
    total: number;
    failed: number;
    errorRate: number;
    avgLatencyMs: number;
    authFailures: number;
    rateLimited: number;
    zeroResults: number;
    searches: number;
    byToolFailures: Record<string, number>;
    byClient: Record<string, number>;
  }> {
    const empty = {
      total: 0,
      failed: 0,
      errorRate: 0,
      avgLatencyMs: 0,
      authFailures: 0,
      rateLimited: 0,
      zeroResults: 0,
      searches: 0,
      byToolFailures: {} as Record<string, number>,
      byClient: {} as Record<string, number>,
    };
    try {
      const reqCol = await getCollection(REQUEST_EVENTS_COLLECTION);
      const searchCol = await getCollection(SEARCH_EVENTS_COLLECTION);
      const docs = await reqCol.find({ timestamp: { $gte: fromTs } }).limit(20000).toArray();
      let failed = 0;
      let latencySum = 0;
      let latencyCount = 0;
      let authFailures = 0;
      let rateLimited = 0;
      const byToolFailures: Record<string, number> = {};
      const byClient: Record<string, number> = {};
      for (const raw of docs) {
        const e = toPlain(raw) as unknown as RequestEvent;
        if (e.success === false) {
          failed++;
          const key = e.toolName || e.method || 'unknown';
          byToolFailures[key] = (byToolFailures[key] || 0) + 1;
        }
        if (typeof e.latencyMs === 'number') {
          latencySum += e.latencyMs;
          latencyCount++;
        }
        if (e.status === 'authorization_denied') authFailures++;
        if (e.status === 'rate_limited') rateLimited++;
        const client = e.clientName || 'Unknown MCP client';
        byClient[client] = (byClient[client] || 0) + 1;
      }
      const zeroResults = await searchCol.countDocuments({ timestamp: { $gte: fromTs }, zeroResults: true });
      const searches = await searchCol.countDocuments({ timestamp: { $gte: fromTs } });
      return {
        total: docs.length,
        failed,
        errorRate: docs.length > 0 ? failed / docs.length : 0,
        avgLatencyMs: latencyCount > 0 ? Math.round(latencySum / latencyCount) : 0,
        authFailures,
        rateLimited,
        zeroResults,
        searches,
        byToolFailures,
        byClient,
      };
    } catch (error: any) {
      console.error('[Telemetry] aggregateWindow failed:', redactText(error?.message || error));
      return empty;
    }
  }
}

function toPlain(doc: any): Record<string, unknown> {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return { id: String(_id), ...rest };
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const telemetryService = TelemetryService.getInstance();

/** Convenience helper used by admin search-analytics aggregation. */
export function buildRequestStatus(opts: {
  isError: boolean;
  errorCode?: string;
  errorCategory?: FailureCategory;
  zeroResults?: boolean;
}): RequestStatus {
  if (!opts.isError && !opts.zeroResults) return 'success';
  if (opts.zeroResults) return 'no_results';
  const cat = opts.errorCategory;
  if (cat === 'validation_error') return 'validation_error';
  if (cat === 'premium_denied' || cat === 'auth_failure') return 'authorization_denied';
  if (cat === 'rate_limit') return 'rate_limited';
  return 'server_error';
}
