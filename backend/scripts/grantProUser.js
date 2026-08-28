import admin from '../src/utils/firebaseAdmin.js';

const targetEmail = 'ptlrudra21@gmail.com'.toLowerCase().trim();

async function grantPro() {
  const db = admin.firestore();
  console.log(`[GrantPro] Upgrading ${targetEmail} to PRO tier...`);

  const userDocRef = db.collection('users').doc(targetEmail);
  
  await userDocRef.set({
    email: targetEmail,
    planTier: 'PRO',
    status: 'PRO',
    isPro: true,
    proActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  console.log(`[GrantPro] Successfully granted PRO access to: ${targetEmail}`);
  process.exit(0);
}

grantPro().catch((err) => {
  console.error('[GrantPro] Error granting PRO access:', err);
  process.exit(1);
});
