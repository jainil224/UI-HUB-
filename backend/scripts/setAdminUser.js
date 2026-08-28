import admin from '../src/utils/firebaseAdmin.js';

const targetEmail = 'jainil11199@gmail.com'.toLowerCase().trim();

async function setAdmin() {
  const db = admin.firestore();
  console.log(`[SetAdmin] Upgrading ${targetEmail} to ADMIN tier in Firestore...`);

  const userDocRef = db.collection('users').doc(targetEmail);
  
  await userDocRef.set({
    email: targetEmail,
    planTier: 'ADMIN',
    status: 'ADMIN',
    isPro: true,
    isAdmin: true,
    role: 'admin',
    adminActivatedAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  const doc = await userDocRef.get();
  console.log('[SetAdmin] Updated Firestore user document:', doc.data());
  process.exit(0);
}

setAdmin().catch((err) => {
  console.error('[SetAdmin] Error setting ADMIN access:', err);
  process.exit(1);
});
