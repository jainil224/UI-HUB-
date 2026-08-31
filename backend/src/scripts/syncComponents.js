import dotenv from 'dotenv';
import { syncAllComponentsToMongo } from '../services/componentSyncService.js';
import { mongoService } from '../services/mongoService.js';

dotenv.config();

console.log('====================================================');
console.log('🔄 UI-HUB: SYNCHRONIZING ALL COMPONENTS TO MONGODB ATLAS');
console.log('====================================================');

async function main() {
  try {
    const result = await syncAllComponentsToMongo();
    if (result.success) {
      console.log('====================================================');
      console.log('🎉 SYNC COMPLETE!');
      console.log(`- Total Components Processed : ${result.totalProcessed}`);
      console.log(`- New Added                 : ${result.addedCount}`);
      console.log(`- Updated in Atlas          : ${result.updatedCount}`);
      console.log(`- Total Live in MongoDB     : ${result.totalInMongo}`);
      console.log('====================================================');
    } else {
      console.error('❌ Sync failed:', result.error);
    }
  } catch (err) {
    console.error('❌ Fatal sync error:', err.message);
  } finally {
    try {
      const client = await mongoService.getClient();
      await client.close();
    } catch (_) {}
    process.exit(0);
  }
}

main();
