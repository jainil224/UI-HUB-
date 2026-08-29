import crypto from 'crypto';
import { getCollection } from './mongo.js';
import config from '../config/env.js';
const API_KEYS_COLLECTION = 'mcp_api_keys';
const LIST_CACHE_TTL_MS = 10_000;
const listCache = new Map();
export class ApiKeyService {
    static instance;
    static getInstance() {
        if (!ApiKeyService.instance) {
            ApiKeyService.instance = new ApiKeyService();
        }
        return ApiKeyService.instance;
    }
    /**
     * Generate a cryptographically secure random API key.
     * Format: uh_live_<32 bytes base64url>
     */
    generateApiKey() {
        const randomBytes = crypto.randomBytes(32);
        const encoded = randomBytes.toString('base64url');
        return `${config.apiKeyPrefix}${encoded}`;
    }
    /**
     * Hash an API key using SHA-256.
     * Never store the plaintext key.
     */
    hashApiKey(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }
    /**
     * Get the visible prefix of an API key (for display).
     * Example: uh_live_abc123... -> uh_live_abc1
     */
    getKeyPrefix(apiKey) {
        return apiKey.slice(0, 14);
    }
    /**
     * Create a new API key for a user.
     * Returns the plaintext key ONCE, plus the hashed record.
     */
    async createApiKey(userId, name = 'MCP Key') {
        const plaintextKey = this.generateApiKey();
        const keyHash = this.hashApiKey(plaintextKey);
        const keyPrefix = this.getKeyPrefix(plaintextKey);
        const record = {
            user_id: userId,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name,
            created_at: Date.now(),
            last_used_at: null,
            expires_at: null,
            revoked_at: null,
            status: 'active',
        };
        const collection = await getCollection(API_KEYS_COLLECTION);
        const result = await collection.insertOne(record);
        listCache.delete(userId);
        return {
            plaintextKey,
            record: { ...record, id: String(result.insertedId) },
        };
    }
    /**
     * Validate an API key against the stored hash.
     * Returns the key record if valid, or null if invalid/revoked/expired.
     */
    async validateApiKey(apiKey) {
        if (!apiKey || !apiKey.startsWith(config.apiKeyPrefix)) {
            return null;
        }
        const keyHash = this.hashApiKey(apiKey);
        try {
            const collection = await getCollection(API_KEYS_COLLECTION);
            const doc = await collection.findOne({ key_hash: keyHash });
            if (!doc)
                return null;
            const data = doc;
            const record = { ...data, id: String(doc._id) };
            // Check revoked
            if (record.status === 'revoked' || record.revoked_at) {
                return null;
            }
            // Check expired
            if (record.expires_at) {
                const expiryMs = record.expires_at instanceof Date
                    ? record.expires_at.getTime()
                    : typeof record.expires_at === 'number'
                        ? record.expires_at
                        : record.expires_at?._seconds ? record.expires_at._seconds * 1000 : Date.parse(record.expires_at);
                if (Date.now() > expiryMs) {
                    // Mark as expired
                    await collection.updateOne({ _id: doc._id }, { $set: { status: 'expired' } });
                    return null;
                }
            }
            return record;
        }
        catch (error) {
            console.error('[ApiKeyService] Error validating API key:', error);
            return null;
        }
    }
    /**
     * Update last_used_at on an API key.
     */
    async touchApiKey(keyId) {
        try {
            const collection = await getCollection(API_KEYS_COLLECTION);
            await collection.updateOne({ _id: keyId }, { $set: { last_used_at: Date.now() } });
        }
        catch (error) {
            console.error('[ApiKeyService] Error touching API key:', error);
        }
    }
    /**
     * List all API keys for a user.
     * NEVER returns key_hash or full keys - only prefixes and metadata.
     */
    async listApiKeys(userId) {
        const cached = listCache.get(userId);
        if (cached && Date.now() < cached.expiresAt) {
            return cached.keys;
        }
        try {
            const collection = await getCollection(API_KEYS_COLLECTION);
            const docs = await collection.find({ user_id: userId }).sort({ created_at: -1 }).toArray();
            const keys = docs.map((doc) => {
                const data = doc;
                const { key_hash, ...safe } = data;
                return { ...safe, id: String(doc._id) };
            });
            listCache.set(userId, { keys, expiresAt: Date.now() + LIST_CACHE_TTL_MS });
            return keys;
        }
        catch (error) {
            console.error('[ApiKeyService] Error listing API keys:', error);
            return [];
        }
    }
    async revokeApiKey(keyId, userId) {
        try {
            const collection = await getCollection(API_KEYS_COLLECTION);
            const result = await collection.updateOne({ _id: keyId, user_id: userId }, {
                $set: {
                    status: 'revoked',
                    revoked_at: Date.now(),
                },
            });
            if (result.matchedCount === 0)
                return false;
            listCache.delete(userId);
            return true;
        }
        catch (error) {
            console.error('[ApiKeyService] Error revoking API key:', error);
            return false;
        }
    }
    /**
     * Delete an API key record (hard delete).
     */
    async deleteApiKey(keyId, userId) {
        try {
            const collection = await getCollection(API_KEYS_COLLECTION);
            const result = await collection.deleteOne({ _id: keyId, user_id: userId });
            if (result.deletedCount === 0)
                return false;
            listCache.delete(userId);
            return true;
        }
        catch (error) {
            console.error('[ApiKeyService] Error deleting API key:', error);
            return false;
        }
    }
}
export const apiKeyService = ApiKeyService.getInstance();
//# sourceMappingURL=apiKeyService.js.map