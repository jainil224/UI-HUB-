import Razorpay from 'razorpay';
import { verifyRazorpaySignature } from '../utils/verifySignature.js';
import { savePaymentRecord, updateUserTier } from '../services/firebaseService.js';
import { sendPaymentReceipt } from '../services/emailService.js';

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
    const { amount, currency = 'USD' } = req.body;

    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in the smallest currency unit (e.g. cents, paise)
      currency,
      receipt: `receipt_order_${Date.now()}`,
    };

    const instance = getRazorpayInstance();
    const order = await instance.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: 'Failed to create Razorpay Order' });
    }

    res.json({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
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
      amount = 0
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !user_email) {
      return res.status(400).json({ error: 'Missing required parameters for verification' });
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
      return res.status(400).json({ error: 'Invalid payment signature. Payment rejected.' });
    }

    // 2. Save payment in Firebase
    await savePaymentRecord({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        email: user_email,
        amount: amount,
        currency: req.body.currency || 'USD',
        status: 'SUCCESS',
        tier: tier,
        signature: razorpay_signature
    });

    // 3. Update User Sub in Firebase
    await updateUserTier(user_email, tier);

    // 4. Send Email Receipt
    const dateStr = new Date().toLocaleString('en-US', { timeZoneName: 'short' });
    await sendPaymentReceipt({
        payment_id: razorpay_payment_id,
        order_id: razorpay_order_id,
        amount: amount,
        date: dateStr,
        user_email: user_email
    });

    // 5. Respond success
    res.json({
        success: true,
        message: 'Payment verified successfully.'
    });

  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
