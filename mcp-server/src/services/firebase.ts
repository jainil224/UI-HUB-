import admin from 'firebase-admin';
import config from '../config/env.js';
import { getCollection } from './mongo.js';

const TIER_CACHE_TTL_MS = 30_000;
const tierCache = new Map<string, { tier: 'FREE' | 'PRO' | 'ELITE' | 'ADMIN'; expiresAt: number }>();

export class FirebaseService {
  private static instance: FirebaseService;
  private app: admin.app.App | null = null;

  private constructor() {}

  static getInstance(): FirebaseService {
    if (!FirebaseService.instance) {
      FirebaseService.instance = new FirebaseService();
    }
    return FirebaseService.instance;
  }

  /**
   * Returns the Firebase Admin app, used solely for verifying Firebase ID tokens.
   */
  getAdmin(): admin.app.App {
    if (this.app) return this.app;

    // Reuse existing initialized Firebase Admin app if available
    if (admin.apps && admin.apps.length > 0) {
      this.app = admin.app();
      return this.app;
    }

    // Support FIREBASE_SERVICE_ACCOUNT_JSON if present
    const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (rawJson) {
      try {
        const cleanRaw = rawJson.trim();
        const serviceAccount = JSON.parse(
          cleanRaw.startsWith('{') ? cleanRaw : Buffer.from(cleanRaw, 'base64').toString('utf8')
        );
        if (serviceAccount.private_key) {
          serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        return this.app;
      } catch (e: any) {
        console.warn('[MCP Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:', e.message);
      }
    }

    const { projectId, clientEmail, privateKey } = config.firebase;

    if (projectId && clientEmail && privateKey) {
      this.app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      // Fallback for local dev without credentials
      this.app = admin.initializeApp({ projectId: projectId || 'ui-hub' });
    }

    return this.app;
  }

  /**
   * Looks up a user document in MongoDB by email or uid.
   * Returns the plan tier / status.
   */
  async getUserTier(userId: string, email?: string | null): Promise<'FREE' | 'PRO' | 'ELITE' | 'ADMIN'> {
    // Admin override first
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (config.adminEmails.includes(normalizedEmail)) {
      return 'ADMIN';
    }

    const cacheKey = `${userId}__${normalizedEmail}`;
    const cached = tierCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return cached.tier;
    }

    try {
      const users = await getCollection('users');
      let userData: any;

      if (normalizedEmail) {
        userData = await users.findOne({ $or: [{ _id: normalizedEmail }, { email: normalizedEmail }] });
      }

      if (!userData && userId) {
        userData = await users.findOne({ $or: [{ _id: userId }, { uid: userId }] });
      }

      if (!userData) {
        tierCache.set(cacheKey, { tier: 'FREE', expiresAt: Date.now() + TIER_CACHE_TTL_MS });
        return 'FREE';
      }

      const status = String(userData.status || userData.planTier || '').toUpperCase();

      let tier: 'FREE' | 'PRO' | 'ELITE' | 'ADMIN' = 'FREE';
      if (status === 'ELITE' || status === 'ADMIN') tier = 'ELITE';
      else if (status === 'PRO') tier = 'PRO';
      else if (userData.proExpiry) {
        const expiryDate = new Date(userData.proExpiry);
        if (expiryDate > new Date()) {
          tier = 'PRO';
        }
      }

      tierCache.set(cacheKey, { tier, expiresAt: Date.now() + TIER_CACHE_TTL_MS });
      return tier;
    } catch (error: any) {
      console.error('[FirebaseService] Error fetching user tier:', error);
      return 'FREE';
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
