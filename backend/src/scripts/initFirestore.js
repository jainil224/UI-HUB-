import admin from '../utils/firebaseAdmin.js';

const db = admin.firestore();
const { FieldValue } = admin.firestore;
const USERS_COLLECTION = 'users';

const ADMIN_USERS = [
  {
    email: 'jainil11199@gmail.com',
    status: 'ELITE',
    displayName: 'Jainil (Admin)',
    proExpiry: '2027-03-24'
  },
  {
    email: 'jainil224@gmail.com', // Added this based on other logs
    status: 'PRO',
    displayName: 'Jainil 224',
    proExpiry: '2027-03-24'
  }
];

/**
 * Seeds the initial users into Firestore.
 */
const seedUsers = async () => {
  console.log('[SeedScript] Starting Firestore seeding...');

  try {
    const batch = db.batch();

    ADMIN_USERS.forEach((user) => {
      try {
        const userRef = db.collection(USERS_COLLECTION).doc(user.email.toLowerCase());
        batch.set(userRef, {
          ...user,
          email: user.email.toLowerCase(),
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true });
        console.log(`[SeedScript] Added job for user: ${user.email}`);
      } catch (loopError) {
        console.error(`[SeedScript] Error processing user ${user.email}:`, loopError);
        throw loopError;
      }
    });

    await batch.commit();
    console.log('[SeedScript] Success! Initial users seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedScript] Error seeding users during batch commit:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seedUsers();
