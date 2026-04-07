import admin from 'firebase-admin';
import '../src/utils/firebaseAdmin.js'; // initialize admin app properly
import { sendWelcomeEmail } from '../src/utils/sendEmail.js';

async function resendToAffectedUsers() {
  const snapshot = await admin.firestore()
    .collection('users')
    .where('welcomeEmailSent', '==', false)
    .get();

  console.log(`[RESEND] Found ${snapshot.size} users who never received welcome email`);

  for (const docSnap of snapshot.docs) {
    const { email, displayName } = docSnap.data();

    if (!email) {
      console.warn(`[RESEND] Skipping ${docSnap.id} — no email field`);
      continue;
    }

    const result = await sendWelcomeEmail(email, displayName || '');

    if (result.success) {
      await docSnap.ref.update({ welcomeEmailSent: true });
      console.log(`[RESEND] ✅ Sent to ${email}`);
    } else {
      console.error(`[RESEND] ❌ Failed for ${email}:`, result.error);
    }

    // Throttle — Brevo free tier allows 300 emails/day, ~3/sec max
    await new Promise(r => setTimeout(r, 400));
  }

  console.log('[RESEND] Complete.');
  process.exit(0);
}

resendToAffectedUsers().catch(err => {
  console.error(err);
  process.exit(1);
});
