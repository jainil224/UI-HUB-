import express from 'express';
import admin from '../utils/firebaseAdmin.js';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus, checkEliteStatus } from '../services/userService.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @route POST /api/v1/users/sync
 * @desc Sync user status and trigger welcome email if new
 * @access Public (with email/name) - Ideally should be Private with verifyToken
 */
router.get('/backfill-jainil', async (req, res) => {
    try {
        const auth = admin.auth();
        const db = admin.firestore();
        let nextPageToken;
        let totalProcessed = 0;
        let totalCreated   = 0;
        let totalSkipped   = 0;

        do {
            const listResult = await auth.listUsers(1000, nextPageToken);
            for (const userRecord of listResult.users) {
                totalProcessed++;
                const userDocRef = db.collection('users').doc(userRecord.email ? userRecord.email.toLowerCase() : userRecord.uid);
                const userDocSnap = await userDocRef.get();
                if (userDocSnap.exists) {
                    totalSkipped++;
                    continue;
                }
                await userDocRef.set({
                    uid:           userRecord.uid,
                    email:         userRecord.email || '',
                    displayName:   userRecord.displayName || '',
                    photoURL:      userRecord.photoURL || '',
                    planTier:      'free',
                    createdAt:     admin.firestore.Timestamp.fromDate(new Date(userRecord.metadata.creationTime)),
                    updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
                    emailVerified: userRecord.emailVerified,
                });
                totalCreated++;
            }
            nextPageToken = listResult.pageToken;
        } while (nextPageToken);

        res.json({ success: true, totalProcessed, totalCreated, totalSkipped });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post('/sync', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const userEmail = email.toLowerCase();
        let welcomeEmailSent = false;
        let userRef = null;

        try {
            userRef = admin.firestore().collection('users').doc(userEmail);
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                welcomeEmailSent = userDoc.data().welcomeEmailSent || false;
            }
        } catch (dbError) {
            console.warn('[Firestore] Warning: Could not access Firestore (likely missing credentials locally). Assuming email has not been sent.');
            // welcomeEmailSent remains false
        }

        // Only send if not already sent
        if (!welcomeEmailSent) {
            console.log(`[Auth] New user or first time sync for ${userEmail}. Sending welcome email.`);
            const result = await sendWelcomeEmail(email, name);
            
            if (result.success) {
                welcomeEmailSent = true;
                if (userRef) {
                    try {
                        await userRef.set({ 
                            welcomeEmailSent: true,
                            lastSyncedAt: admin.firestore.FieldValue.serverTimestamp(),
                            displayName: name || ''
                        }, { merge: true });
                    } catch (e) {
                         console.warn('[Firestore] Could not update Firestore status.');
                    }
                }
            } else {
                console.error(`[Auth] Failed to send welcome email to ${userEmail}:`, result.error);
                // We still want to return success for the sync itself to not block the UI
            }
        } else {
            // Just update last synced
            if (userRef) {
                try {
                    await userRef.set({ 
                        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } catch (e) {
                     console.warn('[Firestore] Could not update Firestore lastSyncedAt.');
                }
            }
        }

        res.json({ 
            success: true, 
            welcomeEmailSent,
            message: 'User sync completed'
        });
    } catch (error) {
        console.error('Error in user sync route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route POST /api/v1/users/send-welcome-email
 * @desc Manually send a welcome email to a new user
 * @deprecated Use /sync instead
 */
router.post('/send-welcome-email', async (req, res) => {
    try {
        const { email, name } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await sendWelcomeEmail(email, name);
        if (result.success) {
            res.json({ message: 'Welcome email sent successfully' });
        } else {
            res.status(500).json({ error: 'Failed to send welcome email' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * @route GET /api/v1/users/status
 * @desc Get current user's Pro and Elite status
 * @access Private
 */
router.get('/status', verifyToken, async (req, res) => {
    try {
        const email = req.user.email;
        const isElite = await checkEliteStatus(email);
        const isPro = isElite || await checkProStatus(email);
        
        res.json({
            isPro,
            isElite,
            email: req.user.email,
            uid: req.user.uid
        });
    } catch (error) {
        console.error('Error in user status route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
