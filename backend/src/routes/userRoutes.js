import express from 'express';
import admin from '../utils/firebaseAdmin.js';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus, checkEliteStatus } from '../services/userService.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();

router.get('/check', (req, res) => {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL || process.env.SMTP_FROM || process.env.BREVO_SMTP_USER;
    const smtpUser = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;

    res.json({ 
        success: true, 
        message: 'User API reachable',
        brevoApi: {
            configured: !!(brevoApiKey && brevoSenderEmail),
            senderEmail: brevoSenderEmail || 'NOT SET',
            senderName: process.env.BREVO_SENDER_NAME || 'UI-HUB',
            apiKeyLoaded: !!brevoApiKey,
        },
        smtpFallback: {
            configured: !!(smtpUser && smtpPass),
            user: smtpUser ? `${smtpUser.slice(0, 4)}****` : 'NOT SET',
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            from: process.env.SMTP_FROM || smtpUser || 'NOT SET'
        }
    });
});

/**
 * @route POST /api/v1/users/email-test
 * @desc Test Brevo email delivery — send a test welcome email
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
                messageId: result.messageId,
                data: result.data || null
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error,
                hint: 'Check BREVO_API_KEY, BREVO_SENDER_EMAIL and BREVO_SENDER_NAME env vars.'
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

router.post('/sync', verifyToken, async (req, res) => {
    try {
        console.log('[Auth] Incoming sync request body:', JSON.stringify(req.body));
        const { email, name } = req.body;

        // Use UID from the verified token — NOT email
        const uid = req.user?.uid;

        if (!uid) {
            return res.status(400).json({ success: false, error: 'UID missing from token.' });
        }

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        const db = admin.firestore();
        const userDocRef = db.collection('users').doc(uid);

        // FIX 5: Use a Firestore transaction to atomically claim the email send slot.
        // This prevents duplicate welcome emails caused by concurrent /sync calls
        // (common with React Strict Mode double-mount or rapid re-authentication).
        //
        // The 'sending' string acts as a mutex:
        //   - false / missing → this request claims it by writing 'sending'
        //   - 'sending'       → another request already claimed it, skip
        //   - true            → already sent successfully, skip
        let shouldSendEmail = false;
        let resolvedEmail = email;
        let resolvedName = name || 'UI Challenger';

        await db.runTransaction(async (transaction) => {
            const userDoc = await transaction.get(userDocRef);

            if (!userDoc.exists) {
                // Brand new user — create document and claim the email slot atomically
                console.log(`[SYNC] Creating new Firestore document for ${uid} (${email})`);
                transaction.set(userDocRef, {
                    uid,
                    email,
                    displayName: resolvedName,
                    planTier: 'free',
                    welcomeEmailSent: 'sending', // mutex — claimed by this request
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });
                shouldSendEmail = true;
            } else {
                const userData = userDoc.data();
                const flag = userData.welcomeEmailSent;

                // Sync latest email/name regardless
                resolvedEmail = email;
                resolvedName  = name || userData.displayName || 'UI Challenger';

                transaction.update(userDocRef, {
                    email,
                    displayName: resolvedName,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                });

                // Only claim the slot if flag is strictly false/missing
                // 'sending' means another concurrent request already claimed it
                // true means it was already sent successfully
                if (flag !== true && flag !== 'sending') {
                    transaction.update(userDocRef, { welcomeEmailSent: 'sending' });
                    shouldSendEmail = true;
                } else {
                    console.log(`[SYNC] Welcome email already sent or in-progress for: ${uid} — skipping (flag=${flag})`);
                }
            }
        });

        // Outside the transaction — only the one request that won the mutex will reach here
        if (shouldSendEmail) {
            console.log(`[Auth] Triggering welcome email for ${uid} (${resolvedEmail}).`);
            const result = await sendWelcomeEmail(resolvedEmail, resolvedName);

            console.log(`[Auth] Email send result for ${uid}:`, result);

            // FIX 5: Set final flag based on actual send result
            // On failure → reset to false so the next /sync can retry
            // On success → set to true permanently
            try {
                await userDocRef.update({
                    welcomeEmailSent: result.success ? true : false,
                });
                if (result.success) {
                    console.log(`[Firestore] ✅ welcomeEmailSent set to true for ${uid}`);
                } else {
                    console.error(`[Auth] ❌ Failed to send welcome email to ${uid}:`, result.error);
                    console.warn(`[Auth] welcomeEmailSent reset to false for ${uid} — will retry on next sync.`);
                }
            } catch (e) {
                console.warn('[Firestore] Could not update welcomeEmailSent flag:', e.message);
            }
        }

        res.json({ 
            success: true, 
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
        console.log(`[StatusAPI] Checking status for: ${email}`);
        const isElite = await checkEliteStatus(email);
        const isPro = isElite || await checkProStatus(email);
        
        console.log(`[StatusAPI] Result for ${email}: Elite=${isElite}, Pro=${isPro}`);
        
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
 * @route POST /api/v1/users/diagnose
 * @desc Diagnose email/firestore configuration without creating a fake account
 */
router.post('/diagnose', async (req, res) => {
    const { secret, email, name } = req.body;
    
    if (secret !== process.env.EMAIL_TEST_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const report = {
        env: {
            BREVO_SMTP_USER: process.env.BREVO_SMTP_USER 
                                ? `${process.env.BREVO_SMTP_USER.slice(0, 6)}****`
                                : '❌ NOT SET',
            BREVO_SMTP_PASS: process.env.BREVO_SMTP_PASS ? '✅ Set' : '❌ NOT SET',
            SMTP_HOST: process.env.SMTP_HOST || '❌ NOT SET',
            SMTP_PORT: process.env.SMTP_PORT || '❌ NOT SET',
        },
        firestore: null,
        emailSend: null
    };

    try {
        await admin.firestore().collection('_diag').limit(1).get();
        report.firestore = '✅ Connected';
    } catch (err) {
        report.firestore = `❌ ${err.message}`;
    }

    if (email) {
        const emailResult = await sendWelcomeEmail(email, name || 'Test User');
        report.emailSend = emailResult.success
            ? `✅ Sent — messageId: ${emailResult.messageId}`
            : `❌ Failed — ${emailResult.error}`;
    } else {
        report.emailSend = '⏭️ Skipped (no email provided)';
    }

    res.json(report);
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
