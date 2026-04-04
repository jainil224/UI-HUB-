import admin from '../utils/firebaseAdmin.js';

const db = admin.firestore();

/**
 * Saves payment details into Firestore 'payments' collection
 * @param {Object} paymentData
 * @param {string} paymentData.payment_id
 * @param {string} paymentData.order_id
 * @param {string} paymentData.email
 * @param {number|string} paymentData.amount
 * @param {string} paymentData.status
 * @param {string} paymentData.tier
 * @returns {Promise<boolean>}
 */
export const savePaymentRecord = async (paymentData) => {
  try {
    const paymentRef = db.collection('payments').doc(paymentData.payment_id);
    
    await paymentRef.set({
      payment_id: paymentData.payment_id,
      order_id: paymentData.order_id,
      email: paymentData.email,
      amount: Number(paymentData.amount),
      currency: paymentData.currency || 'USD',
      status: paymentData.status,
      tier: paymentData.tier || 'pro',
      signature: paymentData.signature,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[FirebaseService] Payment stored for order: ${paymentData.order_id}`);
    return true;
  } catch (error) {
    console.error('[FirebaseService] Error saving payment to Firestore:', error);
    throw error;
  }
};

/**
 * Also optionally upgrades user tier in 'users' collection
 * @param {string} email
 * @param {string} newTier
 */
export const updateUserTier = async (email, newTier) => {
    try {
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', email).limit(1).get();
        if(!snapshot.empty) {
            const userDoc = snapshot.docs[0];
            await userDoc.ref.update({
                planTier: newTier,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`[FirebaseService] User ${email} upgraded to ${newTier}`);
        } else {
            console.log(`[FirebaseService] User with email ${email} not found. Cannot update tier.`);
        }
    } catch(err) {
        console.error('[FirebaseService] Error updating user tier:', err);
    }
}
