import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateCreateOrder, validateVerifyPayment } from '../middleware/validators.js';
import { createOrderLimiter, verifyPaymentLimiter, webhookLimiter } from '../middleware/rateLimiters.js';

import { fulfillPayment } from '../services/firebaseService.js';

const router = express.Router();

router.get('/recover-jainil', async (req, res) => {
    try {
        const result = await fulfillPayment({
            paymentId: 'pay_SZjrSF0Gly4acd',
            orderId: 'order_SZjqIXEkCgMRjS',
            email: 'hellopatel555@gmail.com',
            amount: 99,
            currency: 'INR',
            tier: 'pro'
        });
        res.json({ success: true, message: 'Recovery fixed!', result });
    } catch (err) {
        res.json({ success: false, error: err.message });
    }
});

router.post('/create-order', createOrderLimiter, verifyToken, validateCreateOrder, createOrder);
router.post('/verify-payment', verifyPaymentLimiter, verifyToken, validateVerifyPayment, verifyPayment);
router.post('/webhook', webhookLimiter, handleRazorpayWebhook); // We expect raw body parser to run before this

export default router;
