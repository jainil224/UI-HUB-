import { getCollection } from '../services/mongo.js';
import config from './env.js';
import { TOOL_NAMES } from '../tools/index.js';
const CACHE_TTL_MS = 30_000;
const CONFIG_COLLECTION = 'mcp_config';
const CONFIG_DOC = 'app';
class ConfigService {
    cache = null;
    cachedAt = 0;
    async get() {
        if (this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS) {
            return this.cache;
        }
        const merged = {
            rateLimitFree: config.rateLimitFree || 100,
            rateLimitPro: config.rateLimitPro || 10000,
            authEnabled: true,
            analyticsEnabled: true,
            loggingEnabled: true,
            tools: {},
        };
        try {
            const collection = await getCollection(CONFIG_COLLECTION);
            const doc = await collection.findOne({ _id: CONFIG_DOC });
            if (doc) {
                const data = doc;
                if (typeof data.rateLimitFree === 'number')
                    merged.rateLimitFree = data.rateLimitFree;
                if (typeof data.rateLimitPro === 'number')
                    merged.rateLimitPro = data.rateLimitPro;
                if (typeof data.authEnabled === 'boolean')
                    merged.authEnabled = data.authEnabled;
                if (typeof data.analyticsEnabled === 'boolean')
                    merged.analyticsEnabled = data.analyticsEnabled;
                if (typeof data.loggingEnabled === 'boolean')
                    merged.loggingEnabled = data.loggingEnabled;
                if (data.tools && typeof data.tools === 'object')
                    merged.tools = { ...data.tools };
            }
        }
        catch (error) {
            console.error('[ConfigService] Error reading config:', error);
        }
        this.cache = merged;
        this.cachedAt = Date.now();
        return merged;
    }
    async isToolEnabled(name) {
        const cfg = await this.get();
        if (cfg.tools[name] === false)
            return false;
        return true;
    }
    async getToolStates() {
        const cfg = await this.get();
        return Object.fromEntries(TOOL_NAMES.map((name) => [name, cfg.tools[name] !== false]));
    }
    async setTool(name, enabled) {
        return this.update({ tools: { [name]: enabled } });
    }
    async update(partial) {
        try {
            const collection = await getCollection(CONFIG_COLLECTION);
            const current = await this.get();
            const next = { ...current, ...partial };
            if (partial.tools) {
                next.tools = { ...current.tools, ...partial.tools };
            }
            await collection.updateOne({ _id: CONFIG_DOC }, {
                $set: {
                    rateLimitFree: next.rateLimitFree,
                    rateLimitPro: next.rateLimitPro,
                    authEnabled: next.authEnabled,
                    analyticsEnabled: next.analyticsEnabled,
                    loggingEnabled: next.loggingEnabled,
                    tools: next.tools,
                    updatedAt: new Date().toISOString(),
                },
            }, { upsert: true });
            this.cache = null;
            return this.get();
        }
        catch (error) {
            console.error('[ConfigService] Error saving config:', error);
            this.cache = null;
            return this.get();
        }
    }
    invalidate() {
        this.cache = null;
        this.cachedAt = 0;
    }
}
export const configService = new ConfigService();
//# sourceMappingURL=configService.js.map