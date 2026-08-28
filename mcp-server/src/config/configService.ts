import { firebaseService } from '../services/firebase.js';
import config from './env.js';
import { TOOL_NAMES } from '../tools/index.js';

export interface McpAppConfig {
  rateLimitFree: number;
  rateLimitPro: number;
  authEnabled: boolean;
  analyticsEnabled: boolean;
  loggingEnabled: boolean;
  tools: Record<string, boolean>;
}

const CACHE_TTL_MS = 30_000;
const CONFIG_COLLECTION = 'mcp_config';
const CONFIG_DOC = 'app';

class ConfigService {
  private cache: McpAppConfig | null = null;
  private cachedAt = 0;

  async get(): Promise<McpAppConfig> {
    if (this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS) {
      return this.cache;
    }

    const merged: McpAppConfig = {
      rateLimitFree: config.rateLimitFree || 100,
      rateLimitPro: config.rateLimitPro || 10000,
      authEnabled: true,
      analyticsEnabled: true,
      loggingEnabled: true,
      tools: {},
    };

    try {
      const db = firebaseService.getDb();
      if (!db) return merged;
      const doc = await db.collection(CONFIG_COLLECTION).doc(CONFIG_DOC).get();
      if (doc.exists) {
        const data = doc.data() || {};
        if (typeof data.rateLimitFree === 'number') merged.rateLimitFree = data.rateLimitFree;
        if (typeof data.rateLimitPro === 'number') merged.rateLimitPro = data.rateLimitPro;
        if (typeof data.authEnabled === 'boolean') merged.authEnabled = data.authEnabled;
        if (typeof data.analyticsEnabled === 'boolean') merged.analyticsEnabled = data.analyticsEnabled;
        if (typeof data.loggingEnabled === 'boolean') merged.loggingEnabled = data.loggingEnabled;
        if (data.tools && typeof data.tools === 'object') merged.tools = { ...(data.tools as Record<string, boolean>) };
      }
    } catch (error: any) {
      if (!String(error?.message || '').includes('Could not load the default credentials')) {
        console.error('[ConfigService] Error reading config:', error);
      }
    }

    this.cache = merged;
    this.cachedAt = Date.now();
    return merged;
  }

  async isToolEnabled(name: string): Promise<boolean> {
    const cfg = await this.get();
    if (cfg.tools[name] === false) return false;
    return true;
  }

  async getToolStates(): Promise<Record<string, boolean>> {
    const cfg = await this.get();
    return Object.fromEntries(TOOL_NAMES.map((name) => [name, cfg.tools[name] !== false]));
  }

  async setTool(name: string, enabled: boolean): Promise<McpAppConfig> {
    return this.update({ tools: { [name]: enabled } });
  }

  async update(partial: Partial<McpAppConfig>): Promise<McpAppConfig> {
    try {
      const db = firebaseService.getDb();
      const current = await this.get();
      const next = { ...current, ...partial };
      if (partial.tools) {
        next.tools = { ...current.tools, ...partial.tools };
      }
      await db
        .collection(CONFIG_COLLECTION)
        .doc(CONFIG_DOC)
        .set(
          {
            rateLimitFree: next.rateLimitFree,
            rateLimitPro: next.rateLimitPro,
            authEnabled: next.authEnabled,
            analyticsEnabled: next.analyticsEnabled,
            loggingEnabled: next.loggingEnabled,
            tools: next.tools,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      this.cache = null;
      return this.get();
    } catch (error: any) {
      if (!String(error?.message || '').includes('Could not load the default credentials')) {
        console.error('[ConfigService] Error saving config:', error);
      }
      this.cache = null;
      return this.get();
    }
  }

  invalidate(): void {
    this.cache = null;
    this.cachedAt = 0;
  }
}

export const configService = new ConfigService();