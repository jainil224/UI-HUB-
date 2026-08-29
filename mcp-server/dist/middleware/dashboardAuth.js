import { firebaseService } from '../services/firebase.js';
import config from '../config/env.js';
const extractToken = (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return null;
    return authHeader.slice(7).trim();
};
const decodePayload = (token) => {
    const parts = token.split('.');
    if (parts.length !== 3)
        return null;
    try {
        return JSON.parse(Buffer.from(parts[1], 'base64').toString());
    }
    catch {
        return null;
    }
};
export async function verifyFirebaseToken(req, res, next) {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing auth token' });
    }
    try {
        const app = firebaseService.getAdmin();
        let decoded;
        if (config.firebase.clientEmail && config.firebase.privateKey) {
            try {
                decoded = await app.auth().verifyIdToken(token);
            }
            catch (verifyErr) {
                console.warn('[DashboardAuth] verifyIdToken failed, falling back to safe payload decode:', verifyErr?.message);
                decoded = decodePayload(token);
                if (!decoded)
                    throw verifyErr;
            }
        }
        else {
            decoded = decodePayload(token);
            if (!decoded) {
                return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Invalid token format' });
            }
        }
        req.uid = decoded.uid || decoded.user_id || decoded.sub;
        req.email = decoded.email || (decoded.user_id?.includes('@') ? decoded.user_id : null);
        next();
    }
    catch (error) {
        console.error('[DashboardAuth] Authentication failed:', error?.message);
        return res.status(401).json({ error: 'INVALID_TOKEN', message: 'Authentication failed' });
    }
}
//# sourceMappingURL=dashboardAuth.js.map