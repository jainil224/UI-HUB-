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

    const cleanEmail = email ? String(email).trim().toLowerCase() : null;
    const now = new Date();

    const col = await getCollection(ACTIVITY_COLLECTION);
    await col.insertOne({
      type,
      userId: userId || null,
      email: cleanEmail,
      level,
      metadata: safeMeta,
      createdAt: now,
    });

    // Asynchronously update user's lastActive timestamp in MongoDB users collection
    if (cleanEmail || userId) {
      try {
        const usersCol = await getCollection('users');
        const filter = cleanEmail
          ? { $or: [{ _id: cleanEmail }, { email: cleanEmail }] }
          : { $or: [{ _id: userId }, { uid: userId }] };

        await usersCol.updateOne(
          filter,
          {
            $set: {
              lastActive: now,
              updatedAt: now,
            },
          }
        );
      } catch (userErr) {
        // Non-critical: avoid failing logging if user update fails
      }
    }
  } catch (err) {
    console.error('[ActivityLog] Failed to write activity log:', err.message);
  }
};

/**
 * Query recent activity logs with pagination and optional filtering.
 */
export const getRecentActivityLogs = async ({
  page = 1,
  pageSize = 25,
  type = '',
  search = '',
} = {}) => {
  try {
    const col = await getCollection(ACTIVITY_COLLECTION);
    const filter = {};

    if (type) {
      filter.type = type;
    }

    if (search) {
      const s = String(search).trim();
      filter.$or = [
        { email: { $regex: s, $options: 'i' } },
        { type: { $regex: s, $options: 'i' } },
        { userId: { $regex: s, $options: 'i' } },
        { 'metadata.componentId': { $regex: s, $options: 'i' } },
      ];
    }

    const skip = Math.max(0, (page - 1) * pageSize);
    const [total, events] = await Promise.all([
      col.countDocuments(filter),
      col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).toArray(),
    ]);

    return {
      total,
      page,
      pageSize,
      events,
    };
  } catch (err) {
    console.error('[ActivityLog] Query failed:', err.message);
    return { total: 0, page: 1, pageSize, events: [] };
  }
};

export const activityLogs = { logActivity, getRecentActivityLogs };
export default activityLogs;
