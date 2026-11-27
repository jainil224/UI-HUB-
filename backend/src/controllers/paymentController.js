import Razorpay from 'razorpay';
import { verifyRazorpaySignature } from '../utils/verifySignature.js';
import { fulfillPayment, dispatchProSubscriptionReceipt } from '../services/firebaseService.js';
import { DURATION_DISCOUNTS, COMPONENT_PRICE, CREDIT_PACK, INR_PER_USD, LIFETIME_PRICE } from '../config/plans.js';
import { isPremiumComponentId } from '../config/premiumComponents.js';

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
    const { amount, currency = 'USD', planId, selectedCategories = [], duration = '6 Months', subscriptionMonths = 6, purchaseType = 'pro', componentId, credits = 0 } = req.body;

    let options = null;

    if (purchaseType === 'component') {
      // A user buys one premium component outright. The price is ALWAYS derived
      // server-side from COMPONENT_PRICE — the client-provided amount is never
      // trusted — and the component id must be a known premium component.
      if (!componentId || !isPremiumComponentId(componentId)) {
        return res.status(400).json({ success: false, error: 'Valid premium componentId is required for component purchase' });
      }

      const price = COMPONENT_PRICE[String(currency).toLowerCase()];
      if (!price) {
        return res.status(400).json({ success: false, error: 'Unsupported currency for component purchase' });
      }

      options = {
        amount: Math.round(Number(price) * 100), // amount in smallest currency unit (paise/cents)
        currency,
        receipt: `receipt_component_${Date.now()}`,
        notes: {
          userId: req.user?.uid || 'unknown',
          tier: 'bundle',
          purchaseType: 'component',
          componentId: componentId,
          displayName: req.user?.name || req.user?.email || 'Customer',
        },
      };
    } else if (purchaseType === 'credits') {
      // Credit packs are priced server-side from the selected quantity so the
      // client cannot set an arbitrary charge. 500 credits = $50 / ₹4,150.
      const creditQty = Math.floor(Number(credits));
      if (!Number.isFinite(creditQty) || creditQty < CREDIT_PACK.minCredits || creditQty > CREDIT_PACK.maxCredits) {
        return res.status(400).json({
          success: false,
          error: `Credit quantity must be between ${CREDIT_PACK.minCredits} and ${CREDIT_PACK.maxCredits}`,
        });
      }
      if (creditQty % CREDIT_PACK.step !== 0) {
        return res.status(400).json({
          success: false,
          error: `Credit quantity must be a multiple of ${CREDIT_PACK.step}`,
        });
      }

      const inrAmount = Math.round(creditQty * CREDIT_PACK.inrPerCredit);
      const price = String(currency).toUpperCase() === 'INR'
        ? inrAmount
        : Math.round((inrAmount / INR_PER_USD) * 100) / 100;

      options = {
        amount: Math.round(price * 100),
        currency,
        receipt: `receipt_credits_${Date.now()}`,
        notes: {
          userId: req.user?.uid || 'unknown',
          tier: 'credits',
          purchaseType: 'credits',
          credits: String(creditQty),
          displayName: req.user?.name || req.user?.email || 'Customer',
          duration: '30 Days',
          subscriptionMonths: '0',
        },
      };
    } else {
      if (!amount) {
        return res.status(400).json({ success: false, error: 'Amount is required' });
      }

      const isLifetimePurchase = planId === 'lifetime' || purchaseType === 'lifetime';
      if (isLifetimePurchase) {
        const expectedPrice = String(currency).toUpperCase() === 'INR'
          ? LIFETIME_PRICE.inr
          : LIFETIME_PRICE.usd;
        if (Math.abs(Number(amount) - expectedPrice) > 0.01) {
          return res.status(400).json({ success: false, error: `Lifetime access must be charged at ${expectedPrice} ${String(currency).toUpperCase()}` });
        }
      }

      options = {
        amount: Math.round(Number(amount) * 100), // amount in smallest currency unit (paise/cents)
        currency,
        receipt: `receipt_order_${Date.now()}`,
        notes: {
          userId: req.user?.uid || 'unknown',
          tier: planId || 'pro',
          purchaseType: purchaseType || 'pro',
          displayName: req.user?.name || req.user?.email || 'Customer',
          selectedCategories: JSON.stringify(selectedCategories || []),
          duration: isLifetimePurchase ? 'Lifetime' : (duration || '6 Months'),
          subscriptionMonths: isLifetimePurchase ? '0' : String(subscriptionMonths || 6),
        }
      };
    }

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
 * Verifies Razorpay payment signature, updates database, generates PDF receipt,
 * and sends the PRO subscription email with attached PDF receipt.
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
      planId,
      selectedCategories = [],
      duration = '6 Months',
      subscriptionMonths = 6,
      purchaseType = 'pro',
      componentId,
      credits = 0,
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

    // Credit packs must be fulfilled from the Razorpay order notes, never from
    // a client-supplied quantity. This keeps the purchased amount authoritative.
    let resolvedCredits = Math.floor(Number(credits));
    let resolvedAmount = Number(amount) || 0;
    let resolvedTier = tier;
    if (purchaseType === 'credits') {
      try {
        const order = await getRazorpayInstance().orders.fetch(razorpay_order_id);
        resolvedCredits = Math.floor(Number(order?.notes?.credits));
        if (
          !Number.isFinite(resolvedCredits) ||
          resolvedCredits < CREDIT_PACK.minCredits ||
          resolvedCredits > CREDIT_PACK.maxCredits ||
          resolvedCredits % CREDIT_PACK.step !== 0
        ) {
          return res.status(400).json({ success: false, error: 'Invalid credit quantity in payment order' });
        }
        resolvedAmount = order?.amount ? Number(order.amount) / 100 : resolvedAmount;
      } catch (orderErr) {
        console.error('[VerifyPayment] Could not fetch credit order:', orderErr.message);
        return res.status(502).json({ success: false, error: 'Unable to verify credit order details. Please try again.' });
      }
    }

    // Lifetime access is a fixed-price, one-time purchase. Resolve both the
    // tier and amount from the Razorpay order so a client cannot alter either.
    if (purchaseType === 'lifetime' || tier === 'lifetime') {
      try {
        const order = await getRazorpayInstance().orders.fetch(razorpay_order_id);
        const orderCurrency = String(order?.currency || currency).toUpperCase();
        const expectedPrice = orderCurrency === 'INR' ? LIFETIME_PRICE.inr : LIFETIME_PRICE.usd;
        const orderAmount = order?.amount ? Number(order.amount) / 100 : Number(amount);

        if (String(order?.notes?.tier || '').toLowerCase() !== 'lifetime') {
          return res.status(400).json({ success: false, error: 'Invalid lifetime plan in payment order' });
        }
        if (Math.abs(orderAmount - expectedPrice) > 0.01) {
          return res.status(400).json({ success: false, error: `Invalid lifetime amount in payment order` });
        }

        resolvedTier = 'lifetime';
        resolvedAmount = orderAmount;
      } catch (orderErr) {
        console.error('[VerifyPayment] Could not fetch lifetime order:', orderErr.message);
        return res.status(502).json({ success: false, error: 'Unable to verify lifetime order details. Please try again.' });
      }
    }

    // 2. Fulfill Payment (update Firestore, activate plan)
    try {
        const displayName = req.user?.displayName || req.user?.name || '';
        const result = await fulfillPayment({
            paymentId: razorpay_payment_id,
            orderId: razorpay_order_id,
            email: user_email,
            amount: resolvedAmount,
            currency: currency,
            tier: resolvedTier,
            signature: razorpay_signature,
            displayName,
            selectedCategories: Array.isArray(selectedCategories) ? selectedCategories : [],
            duration: duration,
            subscriptionMonths: purchaseType === 'lifetime' || resolvedTier === 'lifetime'
                ? 0
                : Number(subscriptionMonths) || 6,
            purchaseType,
            componentId,
            credits: resolvedCredits,
        });

        // 3. Dispatch the receipt email for subscriptions (idempotent).
        //    Single-component purchases skip the PRO upgrade email.
        if (purchaseType !== 'component' && purchaseType !== 'credits') {
            dispatchProSubscriptionReceipt({
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
                email: user_email,
                displayName,
                amount: resolvedAmount,
                currency,
                duration: duration || '6 Months',
            }).catch((emailErr) => {
                console.error('[VerifyPayment] Background PRO email/receipt error:', emailErr);
            });
        }

        // Replay Attack Handled via idempotency
        if (result.alreadyProcessed) {
            return res.status(200).json({ success: true, tier: resolvedTier, message: 'Payment already applied.' });
        }

        console.log(`[VerifyPayment] Payment verified & fulfilled for ${user_email}, paymentId: ${razorpay_payment_id}`);
        const welcomeMsg = purchaseType === 'component'
            ? 'Payment verified successfully. Your single-component access is now active!'
            : purchaseType === 'credits'
                ? `Payment verified successfully. ${resolvedCredits} AI credits have been added to your account for 30 days.`
                : resolvedTier === 'lifetime'
                    ? 'Payment verified successfully. Welcome to LIFETIME ACCESS! Your payment receipt has been sent to your email.'
                    : resolvedTier === 'ultimate'
                        ? 'Payment verified successfully. Welcome to ULTIMATE ACCESS! Your payment receipt has been sent to your email.'
                        : resolvedTier === 'custom'
                            ? 'Payment verified successfully. Your custom plan is now active!'
                            : 'Payment verified successfully. Welcome to PRO ACCESS! Your payment receipt has been sent to your email.';
        return res.json({
            success: true,
            tier: resolvedTier,
            message: welcomeMsg
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
