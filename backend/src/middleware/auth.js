import admin, { hasCredentials } from '../utils/firebaseAdmin.js';

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


