import admin, { hasCredentials } from '../utils/firebaseAdmin.js';
import { getCollection } from '../services/mongoService.js';

const IS_PRODUCTION = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

/**
 * Decodes the JWT payload without verification. LOCAL DEV ONLY.
 * Never runs in production — see guards below.
 */
const decodeDevToken = (token, req) => {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
  req.user = {
    uid: payload.user_id || payload.sub || payload.uid || 'dev-user',
    email: payload.email || 'dev@ui-hub.com',
    name: payload.name || payload.displayName || '',
    ...payload,
  };
  return req.user;
};

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // If Firebase Admin does not have credentials configured (local dev without
  // service-account.json). In production this path is FORBIDDEN — a token that
  // cannot be verified must be rejected, never silently trusted.
  if (!hasCredentials && !IS_PRODUCTION) {
    try {
      const user = decodeDevToken(token, req);
      if (user) {
        console.log(`[auth] Dev mode: decoded token for ${req.user.email} (${req.user.uid})`);
        return next();
      }
    } catch (parseErr) {
      console.warn('[auth] Could not decode dev token:', parseErr.message);
    }
  }

  try {
    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    // Fall back to decoding payload for local development ONLY (no production credentials).
    if (
      !IS_PRODUCTION &&
      error.message &&
      error.message.includes('Could not load the default credentials')
    ) {
      try {
        const user = decodeDevToken(token, req);
        if (user) {
          console.warn(`[auth] Dev mode fallback: decoded token for ${req.user.email} (${req.user.uid})`);
          return next();
        }
      } catch (fallbackErr) {
        // Continue to error return
      }
    }

    console.error('Error verifying token:', error.message || error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

/**
 * Builds the `requireAdmin` middleware.
 *
 * Admin status is read from the database rather than from the token, so a
 * revoked admin loses access immediately instead of at token expiry.
 *
 * Responds 401 when there is no verified identity and 403 when the caller is
 * authenticated but not an admin. The collection resolver is injectable so the
 * middleware can be tested offline without a database.
 *
 * @param {() => Promise<import('mongodb').Collection>} [getUsers]
 */
export const createRequireAdmin = (getUsers = () => getCollection('users')) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }

    try {
      const uid = req.user.uid;
      const email = typeof req.user.email === 'string' ? req.user.email.toLowerCase() : null;

      // Matches the lookup used elsewhere in userRoutes.js, since documents may
      // be keyed by uid, by email, or by email as the _id.
      const clauses = [];
      if (uid) clauses.push({ uid });
      if (email) clauses.push({ email }, { _id: email });
      if (clauses.length === 0) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      const users = await getUsers();
      const doc = await users.findOne(
        { $or: clauses },
        { projection: { isAdmin: 1, email: 1, uid: 1 } }
      );

      if (!doc || doc.isAdmin !== true) {
        return res.status(403).json({ error: 'Forbidden: Admin access required' });
      }

      req.user = { ...req.user, isAdmin: true };
      return next();
    } catch (err) {
      // Fail closed: if the admin lookup itself breaks, do not let the request
      // through on the assumption that it is harmless.
      console.error('[auth] requireAdmin lookup failed:', err?.message || err);
      return res.status(503).json({ error: 'Service unavailable: admin check failed' });
    }
  };
};

/** Requires a verified Firebase token whose Mongo user document is an admin. */
export const requireAdmin = createRequireAdmin();


