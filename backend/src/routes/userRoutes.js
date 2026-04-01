import express from 'express';
import admin from '../utils/firebaseAdmin.js';
import { verifyToken } from '../middleware/auth.js';
import { checkProStatus, checkEliteStatus } from '../services/userService.js';
import { sendWelcomeEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @route POST /api/v1/users/send-welcome-email
 * @desc Manually send a welcome email to a new user
 * @access Public (or Private)
 */
router.post('/send-welcome-email', async (req, res) => {
    try {
        const { email, name } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const userEmail = email.toLowerCase();
        const userRef = admin.firestore().collection('users').doc(userEmail);
        const userDoc = await userRef.get();

        // 1. Check if we've already sent a welcome email to this user
        if (userDoc.exists && userDoc.data().welcomeEmailSent) {
            console.log(`[Auth] Welcome email already sent to ${userEmail}. Skipping.`);
            return res.json({ message: 'Welcome email already sent previously', skipped: true });
        }

        // 2. Send the email
        const result = await sendWelcomeEmail(email, name);

        if (result.success) {
            // 3. Mark as sent in Firestore so we don't send it again
            await userRef.set({ 
                welcomeEmailSent: true,
                lastWelcomeEmailAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            res.json({ message: 'Welcome email sent successfully', messageId: result.messageId });
        } else {
            res.status(500).json({ error: 'Failed to send welcome email', details: result.error });
        }
    } catch (error) {
        console.error('Error in send-welcome-email route:', error);
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
