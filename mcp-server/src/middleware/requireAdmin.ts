import { NextFunction, Request, Response } from 'express';
import { firebaseService } from '../services/firebase.js';
import { verifyFirebaseToken } from './dashboardAuth.js';

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await verifyFirebaseToken(req as Request, res, async () => {
    try {
      const { uid, email } = req as any;
      const tier = await firebaseService.getUserTier(uid, email);
      if (tier !== 'ADMIN' && tier !== 'ELITE') {
        return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin access required' });
      }
      (req as any).tier = tier;
      next();
    } catch (error: any) {
      console.error('[requireAdmin] Error:', error?.message);
      return res.status(500).json({ error: 'INTERNAL', message: 'Failed to verify admin access' });
    }
  });
}