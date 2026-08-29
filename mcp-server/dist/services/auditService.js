import { getCollection } from './mongo.js';
const AUDIT_COLLECTION = 'mcp_audit';
export async function recordAudit(entry) {
    try {
        const collection = await getCollection(AUDIT_COLLECTION);
        await collection.insertOne({ ...entry, at: Date.now() });
    }
    catch (error) {
        console.error('[Audit] Write failed:', error);
    }
}
export async function listAudit(limit = 300) {
    try {
        const collection = await getCollection(AUDIT_COLLECTION);
        const docs = await collection.find({}).sort({ at: -1 }).limit(limit).toArray();
        return docs.map((doc) => {
            const { _id, ...rest } = doc;
            return { ...rest, id: String(_id) };
        });
    }
    catch (error) {
        console.error('[Audit] Read failed:', error);
        return [];
    }
}
//# sourceMappingURL=auditService.js.map