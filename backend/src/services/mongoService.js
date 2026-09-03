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
 * Checks if the cached MongoClient instance has an open, active topology.
 * @returns {boolean}
 */
const isClientAlive = () => {
  if (!client) return false;
  if (!client.topology) return false;
  if (typeof client.topology.isClosed === 'function' && client.topology.isClosed()) {
    return false;
  }
  return true;
};

/**
 * Forcibly closes and disposes the cached MongoClient instance.
 */
export const resetClient = async () => {
  if (client) {
    try {
      await client.close(true);
    } catch (_) {}
  }
  client = null;
  db = null;
  connecting = null;
};

/**
 * Returns a shared MongoClient, reconnecting automatically if the topology was closed.
 * @returns {Promise<MongoClient>}
 */
export const getClient = async () => {
  if (isClientAlive()) return client;

  if (client) {
    await resetClient();
  }

  if (connecting) return connecting;

  connecting = (async () => {
    try {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        maxIdleTimeMS: 60000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        retryReads: true,
      });

      client.on('close', () => {
        console.warn('[MongoService] MongoDB connection closed. Will reconnect on next query.');
        client = null;
        db = null;
      });

      client.on('error', (err) => {
        console.error('[MongoService] MongoDB client error:', err?.message || err);
      });

      await client.connect();
      db = client.db(dbName);
      console.log(`[MongoService] Connected to MongoDB database: "${dbName}" @ ${hostFromUri(uri)}`);
      return client;
    } catch (error) {
      console.error(`[MongoService] MongoDB connection failed (URI host: ${hostFromUri(uri)}): ${error.message}`);
      client = null;
      db = null;
      throw error;
    } finally {
      connecting = null;
    }
  })();

  return connecting;
};

/**
 * Returns true if the shared Mongo client is currently connected and topology is active.
 * @returns {boolean}
 */
export const isMongoConnected = () => {
  return isClientAlive();
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
 * Returns a named collection, connecting / reconnecting as needed.
 * @param {string} name
 * @returns {Promise<import('mongodb').Collection>}
 */
export const getCollection = async (name) => {
  const database = await getDb();
  return database.collection(name);
};

/**
 * Executes an operation with automatic reconnection if the connection or topology was closed.
 * @template T
 * @param {(db: import('mongodb').Db) => Promise<T>} fn
 * @returns {Promise<T>}
 */
export const executeWithRetry = async (fn) => {
  try {
    const database = await getDb();
    return await fn(database);
  } catch (error) {
    const isTopologyClosed = 
      error?.name === 'MongoTopologyClosedError' ||
      error?.message?.includes('Topology is closed') ||
      error?.name === 'MongoNetworkError' ||
      error?.code === 'ECONNRESET';

    if (isTopologyClosed) {
      console.warn('[MongoService] Topology closed or socket reset. Re-establishing MongoDB connection and retrying operation...');
      await resetClient();
      const freshDb = await getDb();
      return await fn(freshDb);
    }
    throw error;
  }
};

/**
 * Convenience: ensure an index exists on a collection.
 * @param {string} collection
 * @param {object} keys
 * @param {object} [options]
 */
export const ensureIndex = async (collection, keys, options = {}) => {
  return executeWithRetry(async (database) => {
    const col = database.collection(collection);
    await col.createIndex(keys, options);
  });
};

export const mongoService = {
  getClient,
  getDb,
  getCollection,
  ensureIndex,
  isMongoConnected,
  resetClient,
  executeWithRetry,
};

export default mongoService;
