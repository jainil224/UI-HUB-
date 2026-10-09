import { getCollection } from '../services/mongo.js';
import config from './env.js';
import { TOOL_NAMES } from '../tools/index.js';
const CACHE_TTL_MS = 30_000;
const CONFIG_DB_TIMEOUT_MS = 5_000;
const CONFIG_COLLECTION = 'mcp_config';
const CONFIG_DOC = 'app';
/**
 * Normalises a persisted `tools` map into a strict `Record<string, boolean>`
 * keyed only by registered tool names.
 *
 * Why this is strict:
 *  - Only keys in TOOL_NAMES are kept, so a stored key that no longer exists in
 *    the registry (for example a removed tool) can never masquerade as config.
 *  - Values are coerced from the `"true"` / `"false"` strings that a Mongo
 *    document round-trip or a hand-edited dashboard can produce, into real
 *    booleans. Previously a string `"false"` was not `=== false`, so it read as
 *    *enabled*.
 *  - Anything unrecognised is dropped rather than guessed at.
 *
 * Fail-open is deliberate and unchanged: a tool with no stored entry is enabled,
 * so adding a new tool to the registry does not require a config migration.
 */
export const coerceToolMap = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return {};
    const source = raw;
    const out = {};
    for (const name of TOOL_NAMES) {
        const value = source[name];
        if (value === undefined || value === null)
            continue;
        if (typeof value === 'boolean') {
            out[name] = value;
        }
        else if (typeof value === 'string') {
            const normalised = value.trim().toLowerCase();
            if (normalised === 'true')
                out[name] = true;
            else if (normalised === 'false')
                out[name] = false;
        }
    }
    return out;
};
/** Keys stored in the config document that are not registered tools. */
export const unknownToolKeys = (raw) => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return [];
    return Object.keys(raw).filter((key) => !TOOL_NAMES.includes(key));
};
class ConfigService {
    cache = null;
    cachedAt = 0;
    async get() {
        if (this.cache && Date.now() - this.cachedAt < CACHE_TTL_MS) {
            return this.cache;
        }
        const merged = {
            rateLimitFree: config.rateLimitFree || 150,
            rateLimitPro: config.rateLimitPro || 10000,
            authEnabled: true,
            analyticsEnabled: true,
            loggingEnabled: true,
            tools: {},
        };
        try {
            const collection = await Promise.race([
                getCollection(CONFIG_COLLECTION),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Config DB timeout')), CONFIG_DB_TIMEOUT_MS)),
            ]);
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
                    merged.tools = coerceToolMap(data.tools);
            }
        }
        catch (error) {
            console.error('[ConfigService] Error reading config (using defaults):', error?.message || error);
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
    /**
     * Reconciles the persisted config against the code registry so drift is
     * visible instead of silent.
     *
     * `unknown` lists stored keys that no longer correspond to a registered tool
     * (stale config). `implicitlyEnabled` lists registered tools with no stored
     * entry, which are enabled because fail-open is deliberate — surfacing them
     * makes that implicit decision auditable rather than hidden.
     */
    async getToolDrift() {
        const cfg = await this.get();
        const registered = [...TOOL_NAMES];
        const configuredKeys = Object.keys(cfg.tools);
        const enabled = registered.filter((name) => cfg.tools[name] !== false);
        const disabled = registered.filter((name) => cfg.tools[name] === false);
        const known = new Set(registered);
        const unknown = configuredKeys.filter((key) => !known.has(key));
        const explicitlyConfigured = new Set(configuredKeys.filter((key) => known.has(key)));
        return {
            registered: registered.length,
            configured: explicitlyConfigured.size,
            enabled,
            disabled,
            unknown,
            implicitlyEnabled: registered.filter((name) => !explicitlyConfigured.has(name)),
            inSync: unknown.length === 0 && explicitlyConfigured.size === registered.length,
        };
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