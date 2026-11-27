import { getCollection } from './mongoService.js';
import { sendProSubscriptionEmail } from '../utils/sendEmail.js';
import { logActivity } from './activityLogService.js';
import { CREDIT_PACK } from '../config/plans.js';

const PAYMENTS_COLLECTION = 'payments';
const USERS_COLLECTION = 'users';

export const fulfillPayment = async ({ paymentId, orderId, tier = 'pro', email, amount, currency = 'USD', signature, displayName, selectedCategories = [], duration = '6 Months', subscriptionMonths = 6, purchaseType = 'pro', componentId, credits = 0 }) => {
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
      selectedCategories: Array.isArray(selectedCategories) ? selectedCategories : [],
      duration: duration || '6 Months',
      subscriptionMonths: Number(subscriptionMonths) === 0 ? 0 : Number(subscriptionMonths) || 6,
      purchaseType: purchaseType || 'pro',
      componentId: componentId || null,
      credits: Math.max(0, Math.floor(Number(credits) || 0)),
      proEmailSent: false,
      invoiceEmailSent: false,
      timestamp: new Date(),
    });
    console.log(`[MongoService] Payment stored for order: ${orderId}, payment: ${paymentId}`);
  } catch (error) {
    console.error('[MongoService] Error saving payment to MongoDB:', error);
    throw error;
  }

  // 2. Update user tier / entitlements
  try {
    const users = await getCollection(USERS_COLLECTION);
    const isCreditPurchase = purchaseType === 'credits';
    const isComponentPurchase = purchaseType === 'component';
    const isLifetimePurchase = purchaseType === 'lifetime' || String(tier).toLowerCase() === 'lifetime';

    if (isCreditPurchase) {
      const creditQty = Math.floor(Number(credits));
      if (!Number.isFinite(creditQty) || creditQty < CREDIT_PACK.minCredits || creditQty > CREDIT_PACK.maxCredits) {
        throw new Error(`Invalid credit quantity: ${credits}`);
      }

      const expiresAt = new Date(Date.now() + CREDIT_PACK.expiryDays * 24 * 60 * 60 * 1000);
      await users.updateOne(
        { _id: email.toLowerCase() },
        {
          $inc: { aiCreditPurchasedBalance: creditQty },
          $set: { aiCreditPurchasedExpiry: expiresAt, updatedAt: new Date() },
          $setOnInsert: {
            email: email.toLowerCase(),
            planTier: 'free',
            status: 'FREE',
            planType: 'free',
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`[MongoService] User ${email} received ${creditQty} AI credits, valid until ${expiresAt.toISOString()}`);
      await logActivity({
        type: 'payment.credits_purchased',
        userId: undefined,
        email,
        level: 'success',
        metadata: { paymentId, orderId, credits: creditQty, amount: Number(amount), currency },
      });
      return { success: true };
    }

    if (isComponentPurchase) {
      // Single-component purchase: never touch the user's plan/status. Just
      // grant the a-la-carte entitlement (decideAccess already honors ids in
      // the `entitlements` array with tier 'bundle'). $addToSet keeps it
      // idempotent; $setOnInsert seeds brand-new user docs without clobbering
      // an existing pro/custom plan.
      await users.updateOne(
        { _id: email.toLowerCase() },
        {
          $addToSet: { entitlements: String(componentId).trim().toLowerCase() },
          $set: { updatedAt: new Date() },
          $setOnInsert: {
            email: email.toLowerCase(),
            planTier: 'free',
            status: 'FREE',
            planType: 'free',
            createdAt: new Date(),
          },
        },
        { upsert: true }
      );

      console.log(`[MongoService] User ${email} granted single-component entitlement: ${componentId}`);
      await logActivity({
        type: 'payment.component_purchased',
        userId: undefined,
        email,
        level: 'success',
        metadata: { paymentId, orderId, componentId, amount: Number(amount), currency },
      });
      return { success: true };
    }

    const newStatus = (tier || 'pro').toUpperCase();

    // Lifetime access never expires; every other plan derives expiry from months.
    const months = Number(subscriptionMonths) || (tier === 'custom' ? 6 : 12);
    const planExpiry = isLifetimePurchase ? null : new Date();
    if (planExpiry) {
      planExpiry.setMonth(planExpiry.getMonth() + months);
    }

    await users.updateOne(
      { _id: email.toLowerCase() },
      {
        $set: {
          email: email.toLowerCase(),
          planTier: tier || 'pro',
          status: newStatus,
          planType: tier || 'pro',
          selectedCategories: Array.isArray(selectedCategories) && selectedCategories.length > 0 ? selectedCategories : [],
          planDuration: duration || '6 Months',
          planExpiry: planExpiry,
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
      metadata: { paymentId, orderId, tier, amount: Number(amount), currency, selectedCategories, duration },
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
