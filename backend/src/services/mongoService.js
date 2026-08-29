import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.MONGODB_DB || 'uihub';

const hostFromUri = (u) => {
  try {
    const m = /@([^\/?#]+)/.exec(u);
    return m ? m[1] : (u.replace(/^mongodb(\+srv)?:\/\//, '').split('/')[0] || u);
  } catch {
    return u;
  }
};

let client = null;
let db = null;
let connecting = null;

/**
 * Returns a shared MongoClient, connecting once and reusing the pool.
 * @returns {Promise<MongoClient>}
 */
const getClient = async () => {
  if (client) return client;
  if (connecting) return connecting;

  connecting = (async () => {
    try {
      client = new MongoClient(uri, { serverSelectionTimeoutMS: 15000 });
      await client.connect();
      db = client.db(dbName);
      console.log(`[MongoService] Connected to MongoDB database: "${dbName}" @ ${hostFromUri(uri)}`);
      return client;
    } catch (error) {
      console.error(`[MongoService] MongoDB connection failed (URI host: ${hostFromUri(uri)}): ${error.message}`);
      throw error;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
};

/**
 * Returns true if the shared Mongo client is currently connected.
 * Useful for health checks / graceful 503 responses during outages.
 * @returns {boolean}
 */
export const isMongoConnected = () => {
  try {
    return !!(client && client.topology && client.topology.isConnected && client.topology.isConnected());
  } catch {
    return false;
  }
};

/**
 * Returns the connected Mongo database handle.
 * @returns {Promise<import('mongodb').Db>}
 */
export const getDb = async () => {
  const c = await getClient();
  return c.db(dbName);
};

/**
 * Returns a named collection, connecting as needed.
 * @param {string} name
 * @returns {Promise<import('mongodb').Collection>}
 */
export const getCollection = async (name) => {
  const database = await getDb();
  return database.collection(name);
};

/**
 * Convenience: ensure a unique index exists on a collection.
 * @param {string} collection
 * @param {object} keys
 * @param {object} [options]
 */
export const ensureIndex = async (collection, keys, options = {}) => {
  const col = await getCollection(collection);
  await col.createIndex(keys, options);
};

export const mongoService = { getClient, getDb, getCollection, ensureIndex, isMongoConnected };
export default mongoService;
