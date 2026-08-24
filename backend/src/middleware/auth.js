import admin, { hasCredentials } from '../utils/firebaseAdmin.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split(' ')[1];

  // If Firebase Admin does not have credentials configured (e.g. local dev without service-account.json)
  if (!hasCredentials) {
    try {
      // Decode JWT payload for local development
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
        req.user = {
          uid: payload.user_id || payload.sub || payload.uid || 'dev-user',
          email: payload.email || 'dev@ui-hub.com',
          name: payload.name || payload.displayName || '',
          ...payload
        };
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
    // If it failed because of default credentials in local development, fall back to decoding payload
    if (error.message && error.message.includes('Could not load the default credentials')) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
          req.user = {
            uid: payload.user_id || payload.sub || payload.uid || 'dev-user',
            email: payload.email || 'dev@ui-hub.com',
            name: payload.name || payload.displayName || '',
            ...payload
          };
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


