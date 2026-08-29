import { firebaseService } from '../services/firebase.js';
import { verifyFirebaseToken } from './dashboardAuth.js';
export async function requireAdmin(req, res, next) {
    await verifyFirebaseToken(req, res, async () => {
        try {
            const { uid, email } = req;
            const tier = await firebaseService.getUserTier(uid, email);
            if (tier !== 'ADMIN' && tier !== 'ELITE') {
                return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
            }
            req.tier = tier;
            next();
        }
        catch (error) {
            console.error('[requireAdmin] Error:', error?.message);
            return res.status(500).json({ error: 'INTERNAL', message: 'Failed to verify admin access' });
        }
    });
}
//# sourceMappingURL=requireAdmin.js.map