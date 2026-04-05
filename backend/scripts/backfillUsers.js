import admin from '../src/utils/firebaseAdmin.js';

async function backfillUsers() {
    console.log('[Backfill] Starting user synchronization from Firebase Auth to Firestore...');
    const auth = admin.auth();
    const db = admin.firestore();
    const usersCollection = 'users';

    try {
        let nextPageToken;
        let count = 0;
        let created = 0;

        do {
            const listUsersResult = await auth.listUsers(1000, nextPageToken);
            
            for (const userRecord of listUsersResult.users) {
                count++;
                const userEmail = userRecord.email?.toLowerCase();
                if (!userEmail) continue;

                const userRef = db.collection(usersCollection).doc(userEmail);
                const userDoc = await userRef.get();

                if (!userDoc.exists) {
                    console.log(`[Backfill] Syncing new user: ${userEmail}`);
                    await userRef.set({
                        email: userEmail,
                        displayName: userRecord.displayName || 'UI Challenger',
                        photoURL: userRecord.photoURL || '',
                        planTier: 'free',
                        status: 'FREE',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                        provider: userRecord.providerData[0]?.providerId || 'password',
                        uid: userRecord.uid
                    });
                    created++;
                }
            }
            nextPageToken = listUsersResult.pageToken;
        } while (nextPageToken);

        console.log(`[Backfill] Completed! Processed ${count} users. Created ${created} new Firestore documents.`);
        process.exit(0);
    } catch (error) {
        console.error('[Backfill] CRITICAL ERROR:', error);
        process.exit(1);
    }
}

backfillUsers();
