import admin from '../utils/firebaseAdmin.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
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
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
