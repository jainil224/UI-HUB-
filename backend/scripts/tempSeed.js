import admin from 'firebase-admin';

admin.initializeApp({ projectId: 'ui-hub-3fe3d' });
const db = admin.firestore();

const ADMIN_USERS = [
  {
    email: 'jainil11199@gmail.com',
    status: 'ELITE',
    displayName: 'Jainil (Admin)',
    proExpiry: '2027-03-24'
  },
  {
    email: 'jainil224@gmail.com',
    status: 'PRO',
    displayName: 'Jainil 224',
    proExpiry: '2027-03-24'
  }
];

const seedUsers = async () => {
  console.log('[CLI Seed] Starting...');
  try {
    const batch = db.batch();
    ADMIN_USERS.forEach((user) => {
      const userRef = db.collection('users').doc(user.email.toLowerCase());
      batch.set(userRef, {
        ...user,
        email: user.email.toLowerCase(),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });
    await batch.commit();
    console.log('[CLI Seed] Success!');
  } catch (error) {
    console.error('[CLI Seed] Error:', error);
  }
};

seedUsers();
