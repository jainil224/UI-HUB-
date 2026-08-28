import crypto from 'crypto';
import { firebaseService } from './firebase.js';
import config from '../config/env.js';
import type { ApiKeyRecord, McpUser } from '../types/index.js';

const API_KEYS_COLLECTION = 'mcp_api_keys';

export class ApiKeyService {
  private static instance: ApiKeyService;

  static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService();
    }
    return ApiKeyService.instance;
  }

  private getDb() {
    return firebaseService.getDb();
  }

  /**
   * Generate a cryptographically secure random API key.
   * Format: uh_live_<32 bytes base64url>
   */
  generateApiKey(): string {
    const randomBytes = crypto.randomBytes(32);
    const encoded = randomBytes.toString('base64url');
    return `${config.apiKeyPrefix}${encoded}`;
  }

  /**
   * Hash an API key using SHA-256.
   * Never store the plaintext key.
   */
  hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }

  /**
   * Get the visible prefix of an API key (for display).
   * Example: uh_live_abc123... → uh_live_abc1
   */
  getKeyPrefix(apiKey: string): string {
    return apiKey.slice(0, 14);
  }

  /**
   * Create a new API key for a user.
   * Returns the plaintext key ONCE, plus the hashed record.
   */
  async createApiKey(userId: string, name: string = 'MCP Key'): Promise<{ plaintextKey: string; record: ApiKeyRecord }> {
    const db = this.getDb();
    const plaintextKey = this.generateApiKey();
    const keyHash = this.hashApiKey(plaintextKey);
    const keyPrefix = this.getKeyPrefix(plaintextKey);

    const record: Omit<ApiKeyRecord, 'id'> = {
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

    const docRef = await db.collection(API_KEYS_COLLECTION).add(record);

    return {
      plaintextKey,
      record: { ...record, id: docRef.id },
    };
  }

  /**
   * Validate an API key against the stored hash.
   * Returns the key record if valid, or null if invalid/revoked/expired.
   */
  async validateApiKey(apiKey: string): Promise<ApiKeyRecord | null> {
    if (!apiKey || !apiKey.startsWith(config.apiKeyPrefix)) {
      return null;
    }

    const keyHash = this.hashApiKey(apiKey);

    try {
      const db = this.getDb();
      const snapshot = await db
        .collection(API_KEYS_COLLECTION)
        .where('key_hash', '==', keyHash)
        .limit(1)
        .get();

      if (snapshot.empty) return null;

      const doc = snapshot.docs[0];
      const data = doc.data() as Omit<ApiKeyRecord, 'id'>;

      const record: ApiKeyRecord = { ...data, id: doc.id };

      // Check revoked
      if (record.status === 'revoked' || record.revoked_at) {
        return null;
      }

      // Check expired
      if (record.expires_at) {
        const expiryMs =
          record.expires_at instanceof Date
            ? record.expires_at.getTime()
            : typeof record.expires_at === 'number'
              ? record.expires_at
              : (record.expires_at as any)?._seconds ? (record.expires_at as any)._seconds * 1000 : Date.parse(record.expires_at as string);

        if (Date.now() > expiryMs) {
          // Mark as expired
          await doc.ref.update({ status: 'expired' });
          return null;
        }
      }

      return record;
    } catch (error: any) {
      if (error?.message?.includes('Could not load the default credentials')) {
        return null;
      }
      console.error('[ApiKeyService] Error validating API key:', error);
      return null;
    }
  }

  /**
   * Update last_used_at on an API key.
   */
  async touchApiKey(keyId: string): Promise<void> {
    try {
      const db = this.getDb();
      await db
        .collection(API_KEYS_COLLECTION)
        .doc(keyId)
        .update({ last_used_at: Date.now() });
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[ApiKeyService] Error touching API key:', error);
      }
    }
  }

  /**
   * List all API keys for a user.
   * NEVER returns key_hash or full keys - only prefixes and metadata.
   */
  async listApiKeys(userId: string): Promise<Array<Omit<ApiKeyRecord, 'key_hash'>>> {
    try {
      const db = this.getDb();
      const snapshot = await db
        .collection(API_KEYS_COLLECTION)
        .where('user_id', '==', userId)
        .orderBy('created_at', 'desc')
        .get();

      return snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<ApiKeyRecord, 'id'>;
        const { key_hash, ...safe } = data;
        return { ...safe, id: doc.id };
      });
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[ApiKeyService] Error listing API keys:', error);
      }
      return [];
    }
  }

  /**
   * Revoke an API key belonging to a user.
   */
  async revokeApiKey(keyId: string, userId: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const docRef = db.collection(API_KEYS_COLLECTION).doc(keyId);
      const doc = await docRef.get();

      if (!doc.exists) return false;
      const data = doc.data();
      if (data?.user_id !== userId) return false;

      await docRef.update({
        status: 'revoked',
        revoked_at: Date.now(),
      });
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[ApiKeyService] Error revoking API key:', error);
      }
      return false;
    }
  }

  /**
   * Delete an API key record (hard delete).
   */
  async deleteApiKey(keyId: string, userId: string): Promise<boolean> {
    try {
      const db = this.getDb();
      const docRef = db.collection(API_KEYS_COLLECTION).doc(keyId);
      const doc = await docRef.get();

      if (!doc.exists) return false;
      const data = doc.data();
      if (data?.user_id !== userId) return false;

      await docRef.delete();
      return true;
    } catch (error: any) {
      if (!error?.message?.includes('Could not load the default credentials')) {
        console.error('[ApiKeyService] Error deleting API key:', error);
      }
      return false;
    }
  }
}

export const apiKeyService = ApiKeyService.getInstance();
