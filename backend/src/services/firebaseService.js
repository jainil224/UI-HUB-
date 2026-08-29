import { getCollection } from './mongoService.js';
import { sendProSubscriptionEmail } from '../utils/sendEmail.js';
import { logActivity } from './activityLogService.js';

const PAYMENTS_COLLECTION = 'payments';
const USERS_COLLECTION = 'users';

export const fulfillPayment = async ({ paymentId, orderId, tier = 'pro', email, amount, currency = 'USD', signature, displayName }) => {
  const payments = await getCollection(PAYMENTS_COLLECTION);
  const existing = await payments.findOne({ _id: paymentId });

  if (existing) {
    console.warn(`[REPLAY] Payment ${paymentId} already processed. Rejecting duplicate set.`);
    return { alreadyProcessed: true };
  }

  // 1. Save payment record
  try {
    await payments.insertOne({
      _id: paymentId,
      payment_id: paymentId,
      order_id: orderId,
      email: email,
      displayName: displayName || '',
      amount: Number(amount),
      currency: currency || 'USD',
      status: 'SUCCESS',
      tier: tier || 'pro',
      signature: signature,
      proEmailSent: false,
      invoiceEmailSent: false,
      timestamp: new Date(),
    });
    console.log(`[MongoService] Payment stored for order: ${orderId}, payment: ${paymentId}`);
  } catch (error) {
    console.error('[MongoService] Error saving payment to MongoDB:', error);
    throw error;
  }

  // 2. Update user tier
  try {
    const users = await getCollection(USERS_COLLECTION);
    const newStatus = (tier || 'pro').toUpperCase();

    await users.updateOne(
      { _id: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          planTier: tier || 'pro',
          status: newStatus,
          proActivatedAt: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`[MongoService] User ${email} upgraded to ${newStatus}`);
    await logActivity({
      type: 'payment.captured',
      userId: undefined,
      email,
      level: 'success',
      metadata: { paymentId, orderId, tier, amount: Number(amount), currency },
    });
  } catch (err) {
    console.error('[MongoService] Error updating user tier:', err);
    throw err;
  }

  return { success: true };
};

/**
 * Idempotently generates the PDF receipt and sends the PRO subscription email.
 * Guarantees that whether client verification or webhook arrives first,
 * the email with receipt is sent exactly once.
 */
export const dispatchProSubscriptionReceipt = async ({
  paymentId,
  orderId,
  email,
  displayName,
  amount,
  currency = 'USD',
  duration = '6 Months',
}) => {
  const payments = await getCollection(PAYMENTS_COLLECTION);

  // Atomically claim the send mutex. `findOneAndUpdate` with the `proEmailSent: { $ne: 'sending' }`
  // condition ensures only one caller can transition to 'sending' (idempotency guard).
  let paymentRecord = null;
  let shouldSend = false;

  try {
    const claim = await payments.findOneAndUpdate(
      { _id: paymentId, $or: [{ proEmailSent: { $ne: 'sending' } }, { proEmailSent: { $exists: false } }] },
      { $set: { proEmailSent: 'sending', invoiceEmailSent: 'sending' } },
      { returnDocument: 'after' }
    );

    const doc = claim?.value || claim;
    if (!doc) {
      console.log(`[DispatchReceipt] Payment ${paymentId} doc does not exist yet.`);
      return { success: true, skipped: true };
    }

    paymentRecord = doc;

    if (doc.proEmailSent === true || doc.invoiceEmailSent === true) {
      console.log(`[DispatchReceipt] PRO email & receipt already sent for payment: ${paymentId} — skipping.`);
      return { success: true, skipped: true };
    }

    // If it returned an already-true value, another caller finished first.
    if (doc.proEmailSent === true) {
      return { success: true, skipped: true };
    }

    shouldSend = true;
  } catch (error) {
    console.error(`[DispatchReceipt] Exception claiming mutex for ${paymentId}:`, error.message);
    try {
      await payments.updateOne({ _id: paymentId }, { $set: { proEmailSent: false, invoiceEmailSent: false } });
    } catch (_) {}
    return { success: false, error: error.message };
  }

  if (!shouldSend) {
    return { success: true, skipped: true };
  }

  console.log(`[DispatchReceipt] Triggering PRO email & PDF receipt generation for ${paymentId} (${email})...`);

  try {
    const result = await sendProSubscriptionEmail({
      email,
      name: displayName || paymentRecord?.displayName || '',
      amount: amount || paymentRecord?.amount || (currency === 'INR' ? 99 : 4.99),
      currency: currency || paymentRecord?.currency || 'USD',
      paymentId,
      orderId: orderId || paymentRecord?.order_id,
      purchaseDate: new Date(),
      duration,
    });

    if (result && result.success) {
      await payments.updateOne(
        { _id: paymentId },
        {
          $set: {
            proEmailSent: true,
            invoiceEmailSent: true,
            receiptNumber: result.receiptNumber || `UIHUB-${String(paymentId).slice(-8).toUpperCase()}`,
            receiptSentAt: new Date(),
          },
        }
      );
      console.log(`[DispatchReceipt] ✅ PRO email and receipt marked as sent for ${paymentId}`);
      return { success: true, messageId: result.messageId };
    } else {
      // Reset mutex on failure so retry can happen
      await payments.updateOne({ _id: paymentId }, { $set: { proEmailSent: false, invoiceEmailSent: false } });
      console.error(`[DispatchReceipt] ❌ PRO email dispatch failed for ${paymentId}:`, result?.error);
      return { success: false, error: result?.error };
    }
  } catch (error) {
    console.error(`[DispatchReceipt] Exception in dispatchProSubscriptionReceipt for ${paymentId}:`, error.message);
    try {
      await payments.updateOne({ _id: paymentId }, { $set: { proEmailSent: false, invoiceEmailSent: false } });
    } catch (_) {}
    return { success: false, error: error.message };
  }
};
