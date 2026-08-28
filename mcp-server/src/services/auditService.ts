import { firebaseService } from './firebase.js';

const AUDIT_COLLECTION = 'mcp_audit';

export interface AuditEntry {
  adminEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  meta?: Record<string, unknown>;
  at: number;
}

export async function recordAudit(entry: Omit<AuditEntry, 'at'>): Promise<void> {
  try {
    const db = firebaseService.getDb();
    await db.collection(AUDIT_COLLECTION).add({ ...entry, at: Date.now() });
  } catch (error: any) {
    if (!String(error?.message || '').includes('Could not load the default credentials')) {
      console.error('[Audit] Write failed:', error);
    }
  }
}

export async function listAudit(limit = 300): Promise<AuditEntry[]> {
  try {
    const db = firebaseService.getDb();
    const snapshot = await db.collection(AUDIT_COLLECTION).orderBy('at', 'desc').limit(limit).get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as AuditEntry) }) as AuditEntry & { id: string });
  } catch (error: any) {
    if (!String(error?.message || '').includes('Could not load the default credentials')) {
      console.error('[Audit] Read failed:', error);
    }
    return [];
  }
}