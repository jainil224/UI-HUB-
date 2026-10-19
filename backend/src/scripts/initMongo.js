import { getCollection } from '../services/mongoService.js';

const USERS_COLLECTION = 'users';

const ADMIN_USERS = [
  {
    email: 'jainil11199@gmail.com',
    status: 'ELITE',
    username: 'Jainil1',
    displayName: 'Jainil (Admin)',
    proExpiry: '2027-03-24',
    isAdmin: true,
  },
  {
    email: 'jainil224@gmail.com',
    status: 'PRO',
    username: 'Jainil2',
    displayName: 'Jainil 224',
    proExpiry: '2027-03-24',
  },
  {
    email: 'jainilpatel2224@gmail.com',
    status: 'ELITE',
    username: 'Jainil3',
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

    // Usernames are unique case-insensitively but optional — a sparse index on
    // the lowercased key lets existing users without a handle coexist until
    // they claim one on the profile page.
    await users.dropIndex('username_1').catch(() => {});
    await users.createIndex({ usernameLower: 1 }, { unique: true, sparse: true, name: 'usernameLower_1' });
    console.log('[SeedScript] Ensured unique sparse index on users.usernameLower');

    // Display names are unique case-insensitively but optional (sparse).
    await users
      .createIndex({ displayNameLower: 1 }, { unique: true, sparse: true, name: 'displayNameLower_1' })
      .catch((error) => console.warn('[SeedScript] Could not create display-name index:', error.message));
    console.log('[SeedScript] Ensured unique sparse index on users.displayNameLower');

    for (const user of ADMIN_USERS) {
      const email = user.email.toLowerCase();
      await users.updateOne(
        { _id: email },
        {
          $set: {
            _id: email,
            email,
            displayName: user.displayName,
            ...(user.username ? { username: user.username, usernameLower: user.username.toLowerCase() } : {}),
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
