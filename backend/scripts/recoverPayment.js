// scripts/recoverPayment.js
import { db } from '../src/services/firebaseService.js';

const RECOVERY = {
  email:     'hellopatel555@gmail.com',
  paymentId: 'pay_SZjrSF0Gly4acd',
  orderId:   'order_SZjqIXEkCgMRjS',
  tier:      'pro',
  amount:    99,
  currency:  'INR',
};

async function recover() {

  // Write payment record
  await db.collection('payments').doc(RECOVERY.paymentId).set({
    payment_id: RECOVERY.paymentId,
    order_id:   RECOVERY.orderId,
    email:      RECOVERY.email,
    amount:     RECOVERY.amount,
    currency:   RECOVERY.currency,
    tier:       RECOVERY.tier,
    status:    'SUCCESS',
    timestamp: new Date(),
    note:      'Manual recovery via script',
  });

  // Upgrade user tier
  await db.collection('users').doc(RECOVERY.email.toLowerCase()).set({
    planTier:       RECOVERY.tier,
    planActivatedAt: new Date(),
  }, { merge: true });

  console.log('Recovery complete. User upgraded to:', RECOVERY.tier);
  process.exit(0);
}

recover().catch(err => {
  console.error('Recovery failed:', err);
  process.exit(1);
});
