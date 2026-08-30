import { MongoClient } from 'mongodb';
import config from '../config/env.js';
let client = null;
let database = null;
let connecting = null;
/**
 * Returns a shared MongoClient, connecting once and reusing the pool.
 */
export async function getClient() {
    if (client)
        return client;
    if (connecting)
        return connecting;
    connecting = (async () => {
        try {
            client = new MongoClient(config.mongoUri, {
                serverSelectionTimeoutMS: 5000,
                connectTimeoutMS: 5000,
                socketTimeoutMS: 8000,
            });
            await client.connect();
            database = client.db(config.mongoDbName);
            console.log(`[Mongo] Connected to MongoDB database: "${config.mongoDbName}"`);
            return client;
        }
        catch (error) {
            console.error('[Mongo] MongoDB connection failed:', error?.message);
            throw error;
        }
        finally {
            connecting = null;
        }
    })();
    return connecting;
}
/**
 * Returns the connected database handle.
 */
export async function getDb() {
    const c = await getClient();
    return c.db(config.mongoDbName);
}
/**
 * Returns a named collection handle.
 */
export async function getCollection(name) {
    const db = await getDb();
    return db.collection(name);
}
export const mongoService = { getClient, getDb, getCollection };
export default mongoService;
//# sourceMappingURL=mongo.js.map