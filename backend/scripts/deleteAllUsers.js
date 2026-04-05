import admin from "../src/utils/firebaseAdmin.js";

const deleteEverything = async () => {
    try {
        console.log('[Wipe] Starting full wipe of Auth and Firestore users...');
        
        // 1. Delete all Firestore Users
        console.log('[Wipe] Wiping Firestore Users collection...');
        const db = admin.firestore();
        
        // It's safer to get all collections just in case
        const collections = await db.listCollections();
        for (const col of collections) {
            console.log(`[Wipe] Dropping Firestore collection: ${col.id}`);
            const docs = await db.collection(col.id).listDocuments();
            for (const doc of docs) { 
                await doc.delete(); 
            }
        }
        console.log('[Wipe] Firestore wiped.');

        // 2. Delete all Auth Users via deleteUsers batch
        console.log('[Wipe] Deleting Firebase Authentication users...');
        const auth = admin.auth();
        let nextPageToken;
        let count = 0;
        do {
            const listResult = await auth.listUsers(1000, nextPageToken);
            const uids = listResult.users.map(u => u.uid);
            
            if (uids.length > 0) {
                await auth.deleteUsers(uids);
                count += uids.length;
            }
            
            nextPageToken = listResult.pageToken;
        } while (nextPageToken);
        
        console.log(`[Wipe] Successfully deleted ${count} users from Firebase Authentication.`);
        console.log('[Wipe] All users have been completely eradicated.');
        process.exit(0);
    } catch (error) {
        console.error('[Wipe] Error during deletion:', error);
        process.exit(1);
    }
}

deleteEverything();
