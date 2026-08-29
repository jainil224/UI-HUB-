import { getCollection } from './mongoService.js';

const ACTIVITY_COLLECTION = 'activity_logs';

const SENSITIVE_KEYS = ['apiKey', 'api_key', 'token', 'secret', 'password', 'authorization', 'privateKey'];

/**
 * Writes a non-fatal activity/audit log document into the `activity_logs`
 * collection. Never throws — logging failures must not break the request path.
 *
 * @param {object} entry
 * @param {string} entry.type        e.g. 'user.created', 'payment.captured', 'email.sent'
 * @param {string} [entry.userId]
 * @param {string} [entry.email]
 * @param {object} [entry.metadata]  free-form context (secrets redacted)
 * @param {string} [entry.level]     'info' | 'warn' | 'error' | 'success'
 */
export const logActivity = async ({ type, userId, email, metadata = {}, level = 'info' }) => {
  try {
    const safeMeta = { ...metadata };
    for (const key of Object.keys(safeMeta)) {
      const lower = key.toLowerCase();
      if (SENSITIVE_KEYS.some((k) => lower.includes(k))) {
        safeMeta[key] = '[REDACTED]';
      }
    }

    const col = await getCollection(ACTIVITY_COLLECTION);
    await col.insertOne({
      type,
      userId: userId || null,
      email: email || null,
      level,
      metadata: safeMeta,
      createdAt: new Date(),
    });
  } catch (err) {
    console.error('[ActivityLog] Failed to write activity log:', err.message);
  }
};

export const activityLogs = { logActivity };
export default activityLogs;
