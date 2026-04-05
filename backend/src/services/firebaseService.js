import admin from '../utils/firebaseAdmin.js';

const db = admin.firestore();

export const fulfillPayment = async ({ paymentId, orderId, tier, email, amount, currency, signature }) => {
  // Idempotency guard — check if paymentId already exists
  const paymentRef = db.collection('payments').doc(paymentId);
  const existing = await paymentRef.get();
  
  if (existing.exists) {
    console.warn(`[REPLAY] Payment ${paymentId} already processed. Rejecting.`);
    return { alreadyProcessed: true };
  }

  // 1. Save payment record
  try {
    await paymentRef.set({
      payment_id: paymentId,
      order_id: orderId,
      email: email,
      amount: Number(amount),
      currency: currency || 'USD',
      status: 'SUCCESS',
      tier: tier || 'pro',
      signature: signature,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`[FirebaseService] Payment stored for order: ${orderId}`);
  } catch (error) {
    console.error('[FirebaseService] Error saving payment to Firestore:', error);
    throw error;
  }

  // 2. Update user tier
  try {
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', email).limit(1).get();
      if(!snapshot.empty) {
          const userDoc = snapshot.docs[0];
          await userDoc.ref.update({
              planTier: tier,
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`[FirebaseService] User ${email} upgraded to ${tier}`);
      } else {
          console.log(`[FirebaseService] User with email ${email} not found. Cannot update tier.`);
      }
  } catch(err) {
      console.error('[FirebaseService] Error updating user tier:', err);
      throw err;
  }
  
  return { success: true };
};
