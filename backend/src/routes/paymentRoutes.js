import express from 'express';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';
import { handleRazorpayWebhook } from '../controllers/webhookController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateCreateOrder, validateVerifyPayment } from '../middleware/validators.js';
import { createOrderLimiter, verifyPaymentLimiter, webhookLimiter } from '../middleware/rateLimiters.js';

const router = express.Router();

router.post('/create-order', createOrderLimiter, verifyToken, validateCreateOrder, createOrder);
router.post('/verify-payment', verifyPaymentLimiter, verifyToken, validateVerifyPayment, verifyPayment);
router.post('/webhook', webhookLimiter, handleRazorpayWebhook); // We expect raw body parser to run before this

export default router;
