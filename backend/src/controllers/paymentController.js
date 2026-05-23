import Razorpay from 'razorpay';
import { verifyRazorpaySignature } from '../utils/verifySignature.js';
import { fulfillPayment } from '../services/firebaseService.js';
// FIX 3: sendInvoiceEmail is REMOVED from this file entirely.
// The webhook handler (webhookController.js) is the single source of truth
// for sending invoice emails. This prevents duplicate emails when both
// the /verify route and Razorpay's payment.captured webhook fire.

// Initialize Razorpay
const getRazorpayInstance = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing in environment variables.');
    }
    
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
    });
};

/**
 * Creates a new order on Razorpay
 */
export const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'USD', planId } = req.body;

    if (!amount) {
      return res.status(400).json({ success: false, error: 'Amount is required' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in the smallest currency unit
      currency,
      receipt: `receipt_order_${Date.now()}`,
      notes: {
        userId: req.user?.uid || 'unknown', 
        tier: planId || 'pro',
        displayName: req.user?.name || req.user?.email || 'Customer',
      }
    };

    const instance = getRazorpayInstance();
    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ success: false, error: 'Failed to create Razorpay Order' });
    }

    res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

/**
 * Verifies Razorpay payment signature and updates database.
 * NOTE: Invoice email is NOT sent here — it is sent exclusively by the
 * webhookController.js when the payment.captured event arrives from Razorpay.
 * This avoids duplicate invoice emails.
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      user_email,
      tier = 'pro',
      amount = 0,
      currency = 'USD',
      planId
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_email) {
      return res.status(400).json({ success: false, error: 'Missing required parameters for verification' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret';
    
    // 1. Verify Signature
    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );

    if (!isValid) {
      console.error(`[VerifyPayment] CRITICAL: Signature mismatch! Order: ${razorpay_order_id}`);
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Payment rejected.' });
    }

    // 2. Fulfill Payment (update Firestore, activate plan)
    try {
        const result = await fulfillPayment({
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            email: user_email,
            amount: amount,
            currency: currency,
            tier: tier,
            signature: razorpay_signature
        });

        // Replay Attack Handled via idempotency
        if (result.alreadyProcessed) {
            return res.status(200).json({ success: true, tier: tier, message: 'Payment already applied.' });
        }

        // 3. Respond success — invoice email will be sent by the webhook handler
        console.log(`[VerifyPayment] Payment fulfilled for ${user_email}, paymentId: ${razorpay_payment_id}. Invoice email delegated to webhook.`);
        return res.json({
            success: true,
            tier: tier,
            message: 'Payment verified successfully. Your invoice will be emailed shortly.'
        });

    } catch (fbErr) {
        console.error('[VerifyPayment] FULFILLMENT FAILED:', {
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            email: user_email,
            tier,
            error: fbErr.message
        });
        
        return res.status(500).json({ 
            success: false, 
            paymentCaptured: true,
            paymentId: razorpay_payment_id,
            error: 'Your payment was successful, but we encountered an issue activating your plan. Please contact support with your payment ID and we will resolve this immediately.'
        });
    }

  } catch (error) {
    console.error('[VerifyPayment] Unhandled fatal error:', error.message);
    res.status(500).json({ success: false, error: `Internal Server Error: ${error.message}` });
  }
};
