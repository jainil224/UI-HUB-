import { getCollection } from './mongo.js';

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
    const collection = await getCollection(AUDIT_COLLECTION);
    await collection.insertOne({ ...entry, at: Date.now() });
  } catch (error: any) {
    console.error('[Audit] Write failed:', error);
  }
}

export async function listAudit(limit = 300): Promise<AuditEntry[] & { id?: string }[]> {
  try {
    const collection = await getCollection(AUDIT_COLLECTION);
    const docs = await collection.find({}).sort({ at: -1 }).limit(limit).toArray();
    return docs.map((doc) => {
      const { _id, ...rest } = doc;
      return { ...(rest as AuditEntry), id: String(_id) };
    });
  } catch (error: any) {
    console.error('[Audit] Read failed:', error);
    return [];
  }
}
