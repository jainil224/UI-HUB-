import express from 'express';
import admin from '../utils/firebaseAdmin.js';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus, checkEliteStatus } from '../services/userService.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/check', (req, res) => {
    const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
    res.json({ 
        success: true, 
        message: 'User API reachable',
        smtp: {
            configured: !!(smtpUser && smtpPass),
            user: smtpUser ? `${smtpUser.slice(0, 4)}****` : 'NOT SET',
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            from: process.env.SMTP_FROM || smtpUser || 'NOT SET'
        }
    });
});

/**
 * @route POST /api/v1/users/email-test
 * @desc Test SMTP email delivery — send a test welcome email
 * @access Public (for deployment verification only)
 * @body { email: string, name?: string, secret?: string }
 */
router.post('/email-test', async (req, res) => {
    try {
        const { email, name, secret } = req.body;

        // Basic protection: require a known secret to prevent abuse
        const testSecret = process.env.EMAIL_TEST_SECRET || 'ui-hub-test-2026';
        if (secret !== testSecret) {
            return res.status(403).json({ error: 'Forbidden: invalid test secret' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log(`[EmailTest] Sending test welcome email to: ${email}`);
        const result = await sendWelcomeEmail(email, name || 'Test User');

        if (result.success) {
            res.json({ 
                success: true, 
                message: `Test email sent successfully to ${email}`,
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error,
                hint: 'Check BREVO_SMTP_USER, BREVO_SMTP_PASS and SMTP_FROM env vars on Render'
            });
        }
    } catch (error) {
        console.error('[EmailTest] Unexpected error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

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
        console.log('[Auth] Incoming sync request body:', JSON.stringify(req.body));
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const userEmail = email.toLowerCase();
        let welcomeEmailSent = false;
        let userData = null;
        let userRef = admin.firestore().collection('users').doc(userEmail);

        try {
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                userData = userDoc.data();
                welcomeEmailSent = userData.welcomeEmailSent || false;
            } else {
                // Initial creation if it doesn't exist at all
                console.log(`[Auth] Creating new Firestore document for ${userEmail}`);
                await userRef.set({
                    email: userEmail,
                    displayName: name || 'UI Challenger',
                    planTier: 'free',
                    status: 'FREE',
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    welcomeEmailSent: false,
                    lastSyncedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        } catch (dbError) {
            console.error('[Firestore] Error accessing/creating user document:', dbError.message);
            // Continue attempt to send email if we have enough info
        }

        // Only send if not already sent
        if (!welcomeEmailSent) {
            console.log(`[Auth] Triggering welcome email for ${userEmail}.`);
            const result = await sendWelcomeEmail(email, name);
            
            console.log(`[Auth] Email send result for ${userEmail}:`, result);
            
            if (result.success) {
                welcomeEmailSent = true;
                try {
                    console.log(`[Firestore] Updating welcomeEmailSent to true for ${userEmail}`);
                    await userRef.update({ 
                        welcomeEmailSent: true,
                        lastSyncedAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                    console.log(`[Firestore] Successfully updated welcomeEmailSent flag for ${userEmail}`);
                } catch (e) {
                     console.warn('[Firestore] Could not update welcome email status. Flag may remain false:', e.message);
                }
            } else {
                console.error(`[Auth] Failed to send welcome email to ${userEmail}:`, result.error);
                console.warn(`[Auth] welcomeEmailSent flag for ${userEmail} will NOT be set to true to prevent permanent lockout.`);
            }
        } else {
            // Just update last synced
            try {
                await userRef.update({ 
                    lastSyncedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            } catch (e) {
                 console.warn('[Firestore] Could not update lastSyncedAt.');
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

/**
 * @route POST /api/v1/users/reset-welcome-flags
 * @desc Reset welcomeEmailSent to false for users matching a cutoff timestamp (Admin only)
 */
router.post('/reset-welcome-flags', async (req, res) => {
    try {
        const { secret, cutoffTimestamp } = req.body;
        const testSecret = process.env.EMAIL_TEST_SECRET || 'ui-hub-test-2026';
        if (secret !== testSecret) {
            return res.status(403).json({ error: 'Forbidden: invalid test secret' });
        }

        if (!cutoffTimestamp) {
            return res.status(400).json({ error: 'cutoffTimestamp (ISO string or ms timestamp) is required' });
        }

        const cutoffDate = new Date(cutoffTimestamp);
        console.log(`[Admin] Resetting welcomeEmailSent flags stuck at true before ${cutoffDate.toISOString()}`);

        const db = admin.firestore();
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('welcomeEmailSent', '==', true).get();

        let updatedCount = 0;
        let skippedCount = 0;
        const batch = db.batch();

        snapshot.forEach((doc) => {
            const data = doc.data();
            // Check if document was created before the cutoff
            const createdAt = data.createdAt ? data.createdAt.toDate() : null;
            if (createdAt && createdAt < cutoffDate) {
                batch.update(doc.ref, { welcomeEmailSent: false });
                updatedCount++;
            } else {
                skippedCount++;
            }
        });

        if (updatedCount > 0) {
            await batch.commit();
        }

        res.json({ 
            success: true, 
            message: `Successfully reset flags for ${updatedCount} users. Skipped ${skippedCount} users.`
        });
    } catch (error) {
        console.error('[Admin] Error resetting flags:', error.message);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

export default router;
