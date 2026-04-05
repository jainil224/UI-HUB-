import Razorpay from 'razorpay';
import { verifyRazorpaySignature } from '../utils/verifySignature.js';
import { fulfillPayment } from '../services/firebaseService.js';
import { sendInvoiceEmail } from '../services/emailService.js';

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
 * Verifies Razorpay payment signature and updates database
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

    // 2. Fulfill Payment
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
    } catch (fbErr) {
        console.error('[VerifyPayment] Firebase Save error:', fbErr.message);
        return res.status(500).json({ success: false, error: `Payment verified but failed to save record: ${fbErr.message}` });
    }

    // 3. Send Email Receipt
    try {
        await sendInvoiceEmail({
            email: user_email,
            displayName: req.user?.name || '',
            planId: planId || tier,
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            purchaseDate: new Date()
        });
    } catch (emailErr) {
        console.error('[VerifyPayment] Email Receipt error:', emailErr.message);
    }

    // 4. Respond success
    res.json({
        success: true,
        tier: tier,
        message: 'Payment verified successfully.'
    });

  } catch (error) {
    console.error('[VerifyPayment] Unhandled fatal error:', error.message);
    res.status(500).json({ success: false, error: `Internal Server Error: ${error.message}` });
  }
};
