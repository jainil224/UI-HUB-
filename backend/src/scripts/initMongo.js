import { getCollection } from '../services/mongoService.js';

const USERS_COLLECTION = 'users';

const ADMIN_USERS = [
  {
    email: 'jainil11199@gmail.com',
    status: 'ELITE',
    displayName: 'Jainil (Admin)',
    proExpiry: '2027-03-24',
    isAdmin: true,
  },
  {
    email: 'jainil224@gmail.com',
    status: 'PRO',
    displayName: 'Jainil 224',
    proExpiry: '2027-03-24',
  },
  {
    email: 'jainilpatel2224@gmail.com',
    status: 'ELITE',
    displayName: 'Jainil (Elite)',
    proExpiry: '2027-03-24',
    isAdmin: true,
  },
];

/**
 * Seeds the initial users into MongoDB.
 */
const seedUsers = async () => {
  console.log('[SeedScript] Starting MongoDB seeding...');

  try {
    const users = await getCollection(USERS_COLLECTION);

    for (const user of ADMIN_USERS) {
      const email = user.email.toLowerCase();
      await users.updateOne(
        { _id: email },
        {
          $set: {
            _id: email,
            email,
            displayName: user.displayName,
            status: user.status,
            planTier: user.status.toLowerCase(),
            proExpiry: user.proExpiry,
            isAdmin: Boolean(user.isAdmin),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      console.log(`[SeedScript] Upserted user: ${email}`);
    }

    console.log('[SeedScript] Success! Initial users seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[SeedScript] Error seeding users:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seedUsers();
