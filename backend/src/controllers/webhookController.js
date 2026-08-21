import crypto from 'crypto';
import { fulfillPayment, dispatchProSubscriptionReceipt } from '../services/firebaseService.js';
import admin from '../utils/firebaseAdmin.js';

export async function handleRazorpayWebhook(req, res) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
      console.warn('[WEBHOOK] Missing RAZORPAY_WEBHOOK_SECRET. Ignoring webhook.');
      return res.status(200).json({ received: true });
  }
  
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
      return res.status(400).json({ error: 'Missing signature' });
  }

  // Verify webhook authenticity
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(req.body) // raw Buffer, NOT parsed JSON
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'hex'),
    Buffer.from(signature, 'hex')
  );

  if (!isValid) {
    console.error('[WEBHOOK] Invalid signature — possible spoofed webhook.');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
      event = JSON.parse(req.body.toString());
  } catch (e) {
      return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (event.event === 'payment.captured') {
    const payment = event.payload.payment.entity;
    const paymentId = payment.id;
    const email = payment.email;
    const displayName = payment.notes?.displayName || '';
    const tier = payment.notes?.tier || 'pro';
    const amount = payment.amount ? payment.amount / 100 : 0;
    const currency = payment.currency || 'USD';
    const orderId = payment.order_id;
    
    try {
        const db = admin.firestore();
        const paymentRef = db.collection('payments').doc(paymentId);
        let paymentDoc = await paymentRef.get();

        if (!paymentDoc.exists) {
            console.log(`[WEBHOOK] Fulfilling payment ${paymentId} for user ${email}`);
            const result = await fulfillPayment({
              paymentId,
              orderId,
              tier,
              email,
              amount,
              currency,
              signature: 'webhook_captured',
              displayName,
            });

            if (!result.success) {
                console.error(`[WEBHOOK] Fulfill payment failed for paymentId: ${paymentId}`);
                return res.status(500).json({ error: 'Fulfillment failed' });
            }
        }

        // Idempotently dispatch the PRO subscription email with attached PDF receipt
        await dispatchProSubscriptionReceipt({
          paymentId,
          orderId,
          email,
          displayName,
          amount,
          currency,
          duration: '6 Months',
        });

    } catch (e) {
        console.error('[WEBHOOK] fulfillPayment or email sending flow failed: ', e.message);
        return res.status(500).json({ error: 'Internal server error during webhook processing' });
    }
  }

  res.status(200).json({ received: true });
}
