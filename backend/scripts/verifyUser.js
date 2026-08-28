import admin from '../src/utils/firebaseAdmin.js';

async function verify() {
  const db = admin.firestore();
  const doc = await db.collection('users').doc('ptlrudra21@gmail.com').get();
  console.log('[Verify] User Document Data:', doc.data());
  process.exit(0);
}

verify().catch((err) => {
  console.error(err);
  process.exit(1);
});
