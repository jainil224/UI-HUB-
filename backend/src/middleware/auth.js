import admin from '../utils/firebaseAdmin.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  // If Firebase Admin is not initialized, gracefully bypass without throwing app/no-app
  if (!admin.apps || admin.apps.length === 0) {
    console.warn('[auth] Firebase Admin app not initialized. Passing mock user in local development.');
    req.user = { uid: 'dev-user', email: 'dev@ui-hub.com' };
    return next();
  }

  try {
    // Extract token
    const token = authHeader.split(' ')[1];
    
    // Verify token lazily
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Attach user info to request
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message || error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

