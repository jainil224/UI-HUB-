import crypto from 'crypto';
import { fulfillPayment } from '../services/firebaseService.js';
import { sendInvoiceEmail } from '../services/emailService.js';

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
    
    try {
        const result = await fulfillPayment({
          paymentId: payment.id,
          orderId: payment.order_id,
          tier: payment.notes?.tier || 'pro',
          email: payment.email,
          amount: payment.amount ? payment.amount / 100 : 0,
          currency: payment.currency,
          signature: 'webhook_captured'
        });
        
        if (!result.alreadyProcessed && result.success) {
          // Send Email Receipt
          try {
              await sendInvoiceEmail({
                  email: payment.email,
                  displayName: payment.notes?.displayName || '',
                  planId: payment.notes?.tier || 'pro',
                  paymentId: payment.id,
                  orderId: payment.order_id,
                  purchaseDate: new Date()
              });
          } catch (e) {
              console.error('[WEBHOOK] Email sending failed: ', e.message);
          }
        }
    } catch (e) {
        console.error('[WEBHOOK] fulfillPayment failed: ', e.message);
        return res.status(500).json({ error: 'Fulfillment failed' });
    }
  }

  res.status(200).json({ received: true });
}
