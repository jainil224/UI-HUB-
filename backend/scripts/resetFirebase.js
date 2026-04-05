import admin from '../src/utils/firebaseAdmin.js';

const db = admin.firestore();

async function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, resolve).catch(reject);
  });
}

async function deleteQueryBatch(db, query, resolve) {
  const snapshot = await query.get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    // When there are no documents left, we are done
    resolve();
    return;
  }

  // Delete documents in a batch
  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, resolve);
  });
}

async function clearDatabase() {
  console.log('----------------------------------------------------');
  console.log('[Reset] Starting Firestore Database Wipe...');
  try {
      const collections = await db.listCollections();
      if (collections.length === 0) {
          console.log('[Reset] No collections found. Database is already empty.');
      }
      
      for (const collection of collections) {
          console.log(`[Reset] Deleting collection: ${collection.id}`);
          await deleteCollection(db, collection.id, 500);
      }
      console.log('[Reset] Successfully cleared all Firestore collections.');
  } catch (error) {
     console.error('[Reset] Error clearing database:', error);
  }
}

clearDatabase().then(() => {
    console.log('[Reset] Beginning Database Remake (running seed script)...');
    console.log('----------------------------------------------------');
    // Import initFirestore.js dynamically which automatically triggers seedUsers()
    import('../src/scripts/initFirestore.js').then(() => {
        // initFirestore calls process.exit()
    });
}).catch(console.error);
