import admin from '../utils/firebaseAdmin.js';
import { sendProSubscriptionEmail } from '../utils/sendEmail.js';

const getDb = () => admin.firestore();

export const fulfillPayment = async ({ paymentId, orderId, tier = 'pro', email, amount, currency = 'USD', signature, displayName }) => {
  const db = getDb();
  const paymentRef = db.collection('payments').doc(paymentId);
  const existing = await paymentRef.get();
  
  if (existing.exists) {
    console.warn(`[REPLAY] Payment ${paymentId} already processed. Rejecting duplicate set.`);
    return { alreadyProcessed: true };
  }

  // 1. Save payment record
  try {
    await paymentRef.set({
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
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[FirebaseService] Payment stored for order: ${orderId}, payment: ${paymentId}`);
  } catch (error) {
    console.error('[FirebaseService] Error saving payment to Firestore:', error);
    throw error;
  }

  // 2. Update user tier
  try {
      const userDocRef = db.collection('users').doc(email.toLowerCase());
      const newStatus = (tier || 'pro').toUpperCase();
      
      await userDocRef.set({
          email: email.toLowerCase(),
          planTier: tier || 'pro',
          status: newStatus,
          proActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      
      console.log(`[FirebaseService] User ${email} upgraded to ${newStatus}`);
  } catch(err) {
      console.error('[FirebaseService] Error updating user tier:', err);
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
  const db = getDb();
  const paymentRef = db.collection('payments').doc(paymentId);

  let shouldSend = false;
  let paymentRecord = null;

  try {
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(paymentRef);
      if (!doc.exists) {
        console.warn(`[DispatchReceipt] Payment ${paymentId} doc does not exist yet.`);
        return;
      }

      const data = doc.data() || {};
      paymentRecord = data;

      if (data.proEmailSent === true || data.invoiceEmailSent === true) {
        console.log(`[DispatchReceipt] PRO email & receipt already sent for payment: ${paymentId} — skipping.`);
        return;
      }

      if (data.proEmailSent === 'sending') {
        console.log(`[DispatchReceipt] PRO email currently in-flight for payment: ${paymentId} — skipping.`);
        return;
      }

      // Claim the send mutex
      transaction.update(paymentRef, {
        proEmailSent: 'sending',
        invoiceEmailSent: 'sending',
      });
      shouldSend = true;
    });

    if (!shouldSend) {
      return { success: true, skipped: true };
    }

    console.log(`[DispatchReceipt] Triggering PRO email & PDF receipt generation for ${paymentId} (${email})...`);

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
      await paymentRef.update({
        proEmailSent: true,
        invoiceEmailSent: true,
        receiptNumber: result.receiptNumber || `UIHUB-${paymentId.slice(-8).toUpperCase()}`,
        receiptSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`[DispatchReceipt] ✅ PRO email and receipt marked as sent for ${paymentId}`);
      return { success: true, messageId: result.messageId };
    } else {
      // Reset mutex on failure so retry can happen
      await paymentRef.update({
        proEmailSent: false,
        invoiceEmailSent: false,
      });
      console.error(`[DispatchReceipt] ❌ PRO email dispatch failed for ${paymentId}:`, result?.error);
      return { success: false, error: result?.error };
    }

  } catch (error) {
    console.error(`[DispatchReceipt] Exception in dispatchProSubscriptionReceipt for ${paymentId}:`, error.message);
    try {
      await paymentRef.update({ proEmailSent: false, invoiceEmailSent: false });
    } catch (_) {}
    return { success: false, error: error.message };
  }
};
