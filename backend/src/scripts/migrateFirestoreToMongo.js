import admin from '../utils/firebaseAdmin.js';
import { getCollection } from '../services/mongoService.js';

/**
 * One-off migration script: reads every document from Firestore and writes it
 * into the equivalent MongoDB collection. Idempotent (uses upsert), safe to
 * re-run. Existing Firestore doc ids are preserved as the Mongo `_id`.
 *
 * Reads are paged and retried with backoff so transient Firestore read limits
 * (RESOURCE_EXHAUSTED) do not abort the whole run. Collections are processed
 * one at a time; a failure in one collection is reported and skipped.
 *
 * Run from backend dir:
 *   node src/scripts/migrateFirestoreToMongo.js
 */

const COLLECTIONS = [
  'users',
  'payments',
  'components',
  'favorites',
  'mcp_config',
  'mcp_api_keys',
  'mcp_analytics',
  'mcp_audit',
];

const PAGE_SIZE = 300;
const MAX_ATTEMPTS = 8;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const timestampToDate = (value) => {
  if (value && typeof value.toDate === 'function') {
    return value.toDate();
  }
  return value;
};

const serialize = (value) => {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (value && typeof value.toDate === 'function') return value.toDate();
  if (Array.isArray(value)) return value.map(serialize).filter((v) => v !== undefined);
  if (typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      const s = serialize(v);
      if (s !== undefined) out[k] = s;
    }
    return out;
  }
  return value;
};

const isRetryable = (err) => {
  const msg = String(err?.message || '').toLowerCase();
  return (
    /resource_exhausted/.test(msg) ||
    /quota/.test(msg) ||
    /rate.?limit/.test(msg) ||
    /deadline/.test(msg) ||
    /429/.test(msg) ||
    /503/.test(msg) ||
    err?.code === 8 ||
    err?.code === 14
  );
};

const readPage = async (collectionRef, startAt, attempt) => {
  try {
    let query = collectionRef.orderBy('__name__').limit(PAGE_SIZE);
    if (startAt) query = query.startAfter(startAt);
    const snapshot = await query.get();
    return snapshot;
  } catch (err) {
    if (!isRetryable(err) || attempt >= MAX_ATTEMPTS) throw err;
    const delay = 1000 * 2 ** attempt + Math.floor(Math.random() * 1000);
    console.log(`[Migrate] Quota/retry hit, backing off ${delay}ms (attempt ${attempt + 1})...`);
    await sleep(delay);
    return readPage(collectionRef, startAt, attempt + 1);
  }
};

const migrateCollection = async (name) => {
  const col = await getCollection(name);
  const collectionRef = admin.firestore().collection(name);

  let upserted = 0;
  let failed = 0;
  let pages = 0;
  let lastDoc = null;

  while (true) {
    const snapshot = await readPage(collectionRef, lastDoc, 0);
    pages += 1;

    if (snapshot.empty) break;

    for (const doc of snapshot.docs) {
      try {
        const data = serialize(doc.data());
        await col.updateOne({ _id: doc.id }, { $set: { ...data, _id: doc.id } }, { upsert: true });
        upserted += 1;
      } catch (err) {
        failed += 1;
        console.error(`[Migrate] ${name} doc "${doc.id}" failed:`, err.message);
      }
    }

    lastDoc = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < PAGE_SIZE) break;
  }

  console.log(`[Migrate] ${name}: ${upserted} upserted, ${failed} failed (${pages} page(s)).`);
  return upserted;
};

const run = async () => {
  console.log('[Migrate] Starting Firestore → MongoDB migration...\n');
  try {
    const totals = {};
    for (const name of COLLECTIONS) {
      try {
        totals[name] = await migrateCollection(name);
      } catch (err) {
        console.error(`[Migrate] Collection "${name}" aborted after retries:`, err.message);
        totals[name] = 'ERROR';
      }
    }
    console.log('\n[Migrate] Summary:', totals);
    console.log('Note: refresh the Atlas Explorer to see the `uihub` DB and its collections.');
    process.exit(0);
  } catch (error) {
    console.error('[Migrate] Migration failed:', error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

run();
