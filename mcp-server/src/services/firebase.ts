import admin from 'firebase-admin';
import config from '../config/env.js';

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

  getAdmin(): admin.app.App {
    if (this.app) return this.app;

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

  getDb() {
    return this.getAdmin().firestore();
  }

  /**
   * Looks up a user document in Firestore by email or uid.
   * Returns the plan tier / status.
   */
  async getUserTier(userId: string, email?: string | null): Promise<'FREE' | 'PRO' | 'ELITE' | 'ADMIN'> {
    // Admin override first
    const normalizedEmail = (email || '').trim().toLowerCase();
    if (config.adminEmails.includes(normalizedEmail)) {
      return 'ADMIN';
    }

    try {
      const db = this.getDb();
      let userData: admin.firestore.DocumentData | undefined;

      if (normalizedEmail) {
        const emailDoc = await db.collection('users').doc(normalizedEmail).get();
        if (emailDoc.exists) {
          userData = emailDoc.data();
        }
      }

      if (!userData && userId) {
        const uidDoc = await db.collection('users').doc(userId).get();
        if (uidDoc.exists) {
          userData = uidDoc.data();
        }
      }

      if (!userData) return 'FREE';

      const status = (userData.status || userData.planTier || '').toUpperCase();

      if (status === 'ELITE') return 'ELITE';
      if (status === 'PRO') return 'PRO';

      // Legacy expiry check
      if (userData.proExpiry) {
        const expiryDate = new Date(userData.proExpiry);
        if (expiryDate > new Date()) {
          return 'PRO';
        }
      }

      return 'FREE';
    } catch (error: any) {
      if (error?.message?.includes('Could not load the default credentials')) {
        return 'FREE';
      }
      console.error('[FirebaseService] Error fetching user tier:', error);
      return 'FREE';
    }
  }
}

export const firebaseService = FirebaseService.getInstance();
