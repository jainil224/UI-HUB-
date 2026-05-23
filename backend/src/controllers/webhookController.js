import crypto from 'crypto';
import { fulfillPayment } from '../services/firebaseService.js';
import { sendInvoiceEmail } from '../services/emailService.js';
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
    
    try {
        const db = admin.firestore();
        const paymentRef = db.collection('payments').doc(paymentId);
        let paymentDoc = await paymentRef.get();

        if (!paymentDoc.exists) {
            console.log(`[WEBHOOK] Fulfilling payment ${paymentId} for user ${email}`);
            const result = await fulfillPayment({
              paymentId,
              orderId: payment.order_id,
              tier: payment.notes?.tier || 'pro',
              email,
              amount: payment.amount ? payment.amount / 100 : 0,
              currency: payment.currency,
              signature: 'webhook_captured'
            });

            if (!result.success) {
                console.error(`[WEBHOOK] Fulfill payment failed for paymentId: ${paymentId}`);
                return res.status(500).json({ error: 'Fulfillment failed' });
            }

            // Fetch the newly created document
            paymentDoc = await paymentRef.get();
        }

        const paymentData = paymentDoc.data() || {};
        
        // FIX 3 & 6: Only send if not already sent
        if (!paymentData.invoiceEmailSent) {
          try {
            console.log(`[WEBHOOK] Triggering invoice email for ${paymentId} (${email}).`);
            const emailResult = await sendInvoiceEmail({
                email,
                displayName: payment.notes?.displayName || '',
                planId: payment.notes?.tier || 'pro',
                paymentId,
                orderId: payment.order_id,
                purchaseDate: new Date(),
            });

            // FIX 6: Set flag to true only if email sent successfully
            if (emailResult && emailResult.success) {
              await paymentRef.update({ invoiceEmailSent: true });
              console.log(`[WEBHOOK] ✅ Invoice email sent successfully to ${email} for payment ${paymentId}`);
            } else {
              console.error(`[WEBHOOK] ❌ Invoice email FAILED for ${email}, paymentId: ${paymentId}. Will retry on next webhook event.`);
            }

          } catch (emailError) {
            // FIX 6: Full structured error log so failures are visible in Render logs
            console.error(`[WEBHOOK] ❌ Invoice email threw an exception for paymentId: ${paymentId}`, {
              message:      emailError.message,
              code:         emailError.code,
              response:     emailError.response,
              responseCode: emailError.responseCode,
            });
            // Do not set flag — allow retry on next event
          }
        } else {
          console.log(`[WEBHOOK] Invoice email already sent for payment ${paymentId} — skipping (idempotency guard).`);
        }

    } catch (e) {
        console.error('[WEBHOOK] fulfillPayment or email sending flow failed: ', e.message);
        return res.status(500).json({ error: 'Internal server error during webhook processing' });
    }
  }

  res.status(200).json({ received: true });
}
