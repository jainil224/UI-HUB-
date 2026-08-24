import express from 'express';
import admin, { hasCredentials } from '../utils/firebaseAdmin.js';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus, checkEliteStatus } from '../services/userService.js';
import { sendWelcomeEmail, sendFreeSubscriptionEmail, sendProSubscriptionEmail } from '../utils/sendEmail.js';

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
 * @access Public (with secret)
 */
router.post('/email-test', async (req, res) => {
    try {
        const { email, name, secret } = req.body;

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
                message: `Test welcome email sent successfully to ${email}`,
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
 * @route POST /api/v1/users/free-email-test
 * @desc Test sending a FREE subscription email
 * @access Public (with secret)
 */
router.post('/free-email-test', async (req, res) => {
    try {
        const { email, name, secret } = req.body;
        const testSecret = process.env.EMAIL_TEST_SECRET || 'ui-hub-test-2026';
        if (secret !== testSecret) {
            return res.status(403).json({ error: 'Forbidden: invalid test secret' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        console.log(`[FreeEmailTest] Sending test FREE subscription email to: ${email}`);
        const result = await sendFreeSubscriptionEmail({
            email,
            name: name || 'Test Creator',
            activatedAt: new Date()
        });

        res.json({
            success: result.success,
            message: result.success ? `Test FREE email sent to ${email}` : 'Failed to send FREE email',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/v1/users/pro-email-test
 * @desc Test sending a PRO subscription email with attached PDF receipt
 * @access Public (with secret)
 */
router.post('/pro-email-test', async (req, res) => {
    try {
        const { email, name, amount = 4.99, currency = 'USD', secret } = req.body;
        const testSecret = process.env.EMAIL_TEST_SECRET || 'ui-hub-test-2026';
        if (secret !== testSecret) {
            return res.status(403).json({ error: 'Forbidden: invalid test secret' });
        }

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const fakePaymentId = `pay_test_${Date.now()}`;
        const fakeOrderId = `order_test_${Date.now()}`;

        console.log(`[ProEmailTest] Sending test PRO subscription email with PDF receipt to: ${email}`);
        const result = await sendProSubscriptionEmail({
            email,
            name: name || 'Test Pro Creator',
            amount,
            currency,
            paymentId: fakePaymentId,
            orderId: fakeOrderId,
            purchaseDate: new Date(),
            duration: '6 Months'
        });

        res.json({
            success: result.success,
            message: result.success ? `Test PRO email with PDF receipt sent to ${email}` : 'Failed to send PRO email',
            result
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @route POST /api/v1/users/sync
 * @desc Sync user status and trigger welcome email and/or free subscription email (idempotently)
 * @access Private (with verifyToken)
 */
router.post('/sync', verifyToken, async (req, res) => {
    try {
        console.log('[Auth] Incoming sync request body:', JSON.stringify(req.body));
        const { email, name } = req.body;

        const uid = req.user?.uid;
        if (!uid) {
            return res.status(400).json({ success: false, error: 'UID missing from token.' });
        }

        if (!email) {
            return res.status(400).json({ success: false, error: 'Email is required' });
        }

        let shouldSendWelcome = false;
        let shouldSendFreeSub = false;
        let resolvedEmail = email;
        let resolvedName = name || 'UI Challenger';

        if (hasCredentials) {
            try {
                const db = admin.firestore();
                const userDocRef = db.collection('users').doc(uid);

                await db.runTransaction(async (transaction) => {
                    const userDoc = await transaction.get(userDocRef);

                    if (!userDoc.exists) {
                        console.log(`[SYNC] Creating new Firestore document for ${uid} (${email})`);
                        transaction.set(userDocRef, {
                            uid,
                            email,
                            displayName: resolvedName,
                            planTier: 'free',
                            welcomeEmailSent: 'sending',
                            freeSubscriptionEmailSent: 'sending',
                            createdAt: admin.firestore.FieldValue.serverTimestamp(),
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        });
                        shouldSendWelcome = true;
                        shouldSendFreeSub = true;
                    } else {
                        const userData = userDoc.data() || {};
                        const welcomeFlag = userData.welcomeEmailSent;
                        const freeFlag = userData.freeSubscriptionEmailSent;
                        const planTier = userData.planTier || 'free';

                        resolvedEmail = email;
                        resolvedName  = name || userData.displayName || 'UI Challenger';

                        const updates = {
                            email,
                            displayName: resolvedName,
                            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        };

                        if (welcomeFlag !== true && welcomeFlag !== 'sending') {
                            updates.welcomeEmailSent = 'sending';
                            shouldSendWelcome = true;
                        }

                        if (planTier === 'free' && freeFlag !== true && freeFlag !== 'sending') {
                            updates.freeSubscriptionEmailSent = 'sending';
                            shouldSendFreeSub = true;
                        }

                        transaction.update(userDocRef, updates);
                    }
                });

                // Sequential Email Dispatch: Welcome Email 1st, FREE Subscription Email 2nd
                (async () => {
                    if (shouldSendWelcome) {
                        try {
                            console.log(`[Auth] 1st: Triggering Welcome Email for ${uid} (${resolvedEmail})...`);
                            const welcomeResult = await sendWelcomeEmail(resolvedEmail, resolvedName);
                            await userDocRef.update({ welcomeEmailSent: welcomeResult.success ? true : false });
                            console.log(`[Auth] ✅ Welcome email sent for ${uid}:`, welcomeResult.success ? 'Success' : 'Failed');
                        } catch (err) {
                            await userDocRef.update({ welcomeEmailSent: false });
                            console.error(`[Auth] ❌ Welcome email error for ${uid}:`, err.message);
                        }
                    }

                    if (shouldSendWelcome && shouldSendFreeSub) {
                        await new Promise((r) => setTimeout(r, 2500));
                    }

                    if (shouldSendFreeSub) {
                        try {
                            console.log(`[Auth] 2nd: Triggering FREE Subscription Email for ${uid} (${resolvedEmail})...`);
                            const freeResult = await sendFreeSubscriptionEmail({ email: resolvedEmail, name: resolvedName, activatedAt: new Date() });
                            await userDocRef.update({ freeSubscriptionEmailSent: freeResult.success ? true : false });
                            console.log(`[Auth] ✅ FREE subscription email sent for ${uid}:`, freeResult.success ? 'Success' : 'Failed');
                        } catch (err) {
                            await userDocRef.update({ freeSubscriptionEmailSent: false });
                            console.error(`[Auth] ❌ FREE subscription email error for ${uid}:`, err.message);
                        }
                    }
                })().catch((bgErr) => console.error('[Auth] Background sequential email error:', bgErr));

            } catch (firestoreErr) {
                console.warn('[SYNC] Firestore sync warning (running in local fallback mode):', firestoreErr.message);
            }
        } else {
            console.log(`[SYNC] Local dev mode without Firestore credentials — user ${email} (${uid}) synced in-memory.`);
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
 * @route POST /api/v1/users/activate-free
 * @desc Explicitly activate or confirm FREE plan
 * @access Private
 */
router.post('/activate-free', verifyToken, async (req, res) => {
    try {
        const uid = req.user.uid;
        const email = req.user.email;
        const name = req.user.displayName || req.user.name || 'Creator';

        if (hasCredentials) {
            try {
                const db = admin.firestore();
                const userDocRef = db.collection('users').doc(uid);
                const userDoc = await userDocRef.get();

                const userData = userDoc.exists ? userDoc.data() : {};
                const freeFlag = userData?.freeSubscriptionEmailSent;

                await userDocRef.set({
                    email,
                    displayName: name,
                    planTier: 'free',
                    status: 'FREE',
                    freeActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
                    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                }, { merge: true });

                // If FREE email wasn't sent yet, send it now
                if (freeFlag !== true && freeFlag !== 'sending') {
                    await userDocRef.update({ freeSubscriptionEmailSent: 'sending' });
                    sendFreeSubscriptionEmail({ email, name, activatedAt: new Date() })
                        .then(async (result) => {
                            await userDocRef.update({ freeSubscriptionEmailSent: result.success ? true : false });
                        })
                        .catch(async () => {
                            await userDocRef.update({ freeSubscriptionEmailSent: false });
                        });
                }
            } catch (fsErr) {
                console.warn('[ActivateFree] Firestore write skipped in dev mode:', fsErr.message);
            }
        } else {
            console.log(`[ActivateFree] Dev mode without Firestore credentials — user ${email} activated FREE.`);
        }

        res.json({
            success: true,
            planTier: 'free',
            message: 'FREE subscription activated successfully.'
        });
    } catch (error) {
        console.error('[ActivateFree] Error:', error);
        res.status(500).json({ success: false, error: error.message });
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
