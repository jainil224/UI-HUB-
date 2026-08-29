import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { mongoService } from '../services/mongoService.js';
import { EMBEDDED_SOURCE_CODE } from '../data/sourceCodeData.js';

dotenv.config();

const SUPER_ADMINS = [
  'jainil11199@gmail.com',
  'jainilpatel2224@gmail.com',
];

const ADMINS = [
  'jainil224@gmail.com',
];

const PREMIUM_COMPONENT_IDS = new Set([
  'black-hole-cursor', 'pixel-drift', 'spotlight-cards', 'gravitational-vortex',
  'blooming-flower', 'chandelier', 'hell-background', 'interactive-grid-background',
  'isometric-grid-background', 'black-hole-background', 'mouse-gravity-background',
  '3d-hero', '3d-scroll-animation', '3d-slider', '3d-rubiks-cube', 'cards-beam',
  'solar-system', 'lizard-cursor', 'aura-cursor', 'section-scroll', 'cloud-scroll',
  'twin-galaxy-rings', 'tornado', 'morphing-rings', 'lightfall',
]);

const inferCategory = (id) => {
  if (id.includes('cursor')) return 'cursor';
  if (id.includes('text') || id.includes('letter') || id.includes('scramble') || id.includes('rolling')) return 'text';
  if (id.includes('background') || id.includes('starfield') || id.includes('galaxy') || id.includes('rings') || id.includes('tornado') || id.includes('lightfall')) return 'background';
  if (id.includes('button')) return 'button';
  if (id.includes('card') || id.includes('hover') || id.includes('flower') || id.includes('chandelier')) return 'card';
  if (id.includes('scroll')) return 'scroll';
  if (id.includes('3d') || id.includes('rubik') || id.includes('slider') || id.includes('cube')) return '3d';
  return 'component';
};

const formatTitle = (id) => {
  return id
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
};

async function setupDatabase() {
  console.log('====================================================');
  console.log('🚀 UI-HUB: PRODUCTION MONGODB ATLAS INITIALIZATION');
  console.log('====================================================');

  const db = await mongoService.getDb();
  console.log(`[Setup] Connected to database: "${db.databaseName}"`);

  // ─────────────────────────────────────────────────────────
  // 1. USERS COLLECTION & ROLES
  // ─────────────────────────────────────────────────────────
  console.log('\n[1/7] Initializing "users" collection & indexes...');
  const users = await mongoService.getCollection('users');
  await users.createIndex({ email: 1 }, { unique: true, background: true });
  await users.createIndex({ role: 1 }, { background: true });
  await users.createIndex({ planTier: 1 }, { background: true });
  await users.createIndex({ firebaseUid: 1 }, { sparse: true, background: true });

  // Update super admin privileges
  for (const adminEmail of SUPER_ADMINS) {
    await users.updateOne(
      { _id: adminEmail.toLowerCase() },
      {
        $set: {
          _id: adminEmail.toLowerCase(),
          email: adminEmail.toLowerCase(),
          role: 'SUPER_ADMIN',
          isAdmin: true,
          planTier: 'elite',
          status: 'active',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date(),
          displayName: 'Super Admin'
        }
      },
      { upsert: true }
    );
    console.log(`  ✓ Super Admin secured: ${adminEmail}`);
  }

  for (const adminEmail of ADMINS) {
    await users.updateOne(
      { _id: adminEmail.toLowerCase() },
      {
        $set: {
          _id: adminEmail.toLowerCase(),
          email: adminEmail.toLowerCase(),
          role: 'ADMIN',
          isAdmin: true,
          planTier: 'pro',
          status: 'active',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date(),
          displayName: 'Admin'
        }
      },
      { upsert: true }
    );
    console.log(`  ✓ Admin secured: ${adminEmail}`);
  }

  // Normalize remaining existing users
  await users.updateMany(
    { role: { $exists: false } },
    { $set: { role: 'USER', planTier: 'free', isAdmin: false, updatedAt: new Date() } }
  );
  console.log('  ✓ User roles normalized');

  // ─────────────────────────────────────────────────────────
  // 2. PAYMENTS & RAZORPAY SYNC
  // ─────────────────────────────────────────────────────────
  console.log('\n[2/7] Initializing "payments" & syncing Razorpay data...');
  const payments = await mongoService.getCollection('payments');
  await payments.createIndex({ orderId: 1 }, { unique: true, background: true });
  await payments.createIndex({ paymentId: 1 }, { unique: true, sparse: true, background: true });
  await payments.createIndex({ userId: 1, createdAt: -1 }, { background: true });
  await payments.createIndex({ status: 1 }, { background: true });

  const webhooks = await mongoService.getCollection('payment_webhooks');
  await webhooks.createIndex({ eventId: 1 }, { unique: true, sparse: true, background: true });
  await webhooks.createIndex({ receivedAt: -1 }, { background: true });

  // Sync Razorpay Payments
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    try {
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      const rzpPayments = await rzp.payments.all({ count: 100 });
      let syncedCount = 0;

      for (const item of (rzpPayments.items || [])) {
        if (!item.id) continue;
        const pEmail = (item.email || '').toLowerCase();
        await payments.updateOne(
          { orderId: item.order_id || item.id },
          {
            $set: {
              orderId: item.order_id || item.id,
              paymentId: item.id,
              userId: pEmail || 'guest',
              email: pEmail,
              amount: item.amount,
              currency: item.currency,
              status: item.status,
              method: item.method,
              description: item.description,
              contact: item.contact,
              receiptNumber: `UIHUB-REC-${item.id.slice(-8).toUpperCase()}`,
              createdAt: new Date(item.created_at * 1000),
              updatedAt: new Date()
            }
          },
          { upsert: true }
        );

        // If payment was captured, ensure user has PRO access
        if (pEmail && item.status === 'captured') {
          await users.updateOne(
            { email: pEmail },
            {
              $set: {
                planTier: 'pro',
                status: 'active',
                lastPaymentId: item.id,
                updatedAt: new Date()
              }
            }
          );
        }
        syncedCount++;
      }
      console.log(`  ✓ Synced ${syncedCount} payment(s) from Razorpay Live into MongoDB Atlas!`);
    } catch (err) {
      console.warn(`  ⚠️ Razorpay sync notice: ${err.message}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. EMAIL LOGS (BREVO) & TTL
  // ─────────────────────────────────────────────────────────
  console.log('\n[3/7] Initializing "email_logs" with 90-Day TTL auto-purge...');
  const emailLogs = await mongoService.getCollection('email_logs');
  await emailLogs.createIndex({ recipientEmail: 1, sentAt: -1 }, { background: true });
  await emailLogs.createIndex({ status: 1 }, { background: true });
  await emailLogs.createIndex({ templateType: 1 }, { background: true });
  // Auto-clean emails older than 90 days (7,776,000 seconds)
  await emailLogs.createIndex({ sentAt: 1 }, { expireAfterSeconds: 90 * 86400, background: true });
  console.log('  ✓ email_logs collection indexed with TTL: 90 days');

  // ─────────────────────────────────────────────────────────
  // 4. ACTIVITY & AUDIT LOGS WITH TTL
  // ─────────────────────────────────────────────────────────
  console.log('\n[4/7] Initializing "activity_logs" with 90-Day TTL auto-purge...');
  const activityLogs = await mongoService.getCollection('activity_logs');
  await activityLogs.createIndex({ email: 1, createdAt: -1 }, { background: true });
  await activityLogs.createIndex({ type: 1 }, { background: true });
  await activityLogs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 90 * 86400, background: true });
  console.log('  ✓ activity_logs collection indexed with TTL: 90 days');

  // ─────────────────────────────────────────────────────────
  // 5. MCP SERVER COLLECTIONS (KEYS, ANALYTICS, AUDIT, CONFIG)
  // ─────────────────────────────────────────────────────────
  console.log('\n[5/7] Initializing MCP collections ("mcp_api_keys", "mcp_analytics", "mcp_audit", "mcp_config")...');
  
  // API Keys
  const mcpKeys = await mongoService.getCollection('mcp_api_keys');
  await mcpKeys.createIndex({ keyHash: 1 }, { unique: true, background: true });
  await mcpKeys.createIndex({ userId: 1, status: 1 }, { background: true });
  await mcpKeys.createIndex({ keyPrefix: 1 }, { background: true });
  console.log('  ✓ mcp_api_keys indexed');

  // Analytics (High-Volume) - Auto Purge after 60 Days
  const mcpAnalytics = await mongoService.getCollection('mcp_analytics');
  await mcpAnalytics.createIndex({ userId: 1, timestamp: -1 }, { background: true });
  await mcpAnalytics.createIndex({ tool: 1, timestamp: -1 }, { background: true });
  await mcpAnalytics.createIndex({ keyPrefix: 1 }, { background: true });
  await mcpAnalytics.createIndex({ timestamp: 1 }, { expireAfterSeconds: 60 * 86400, background: true });
  console.log('  ✓ mcp_analytics indexed with 60-Day TTL');

  // Audit
  const mcpAudit = await mongoService.getCollection('mcp_audit');
  await mcpAudit.createIndex({ adminEmail: 1, at: -1 }, { background: true });
  await mcpAudit.createIndex({ action: 1 }, { background: true });
  console.log('  ✓ mcp_audit indexed');

  // Config Singleton
  const mcpConfig = await mongoService.getCollection('mcp_config');
  await mcpConfig.updateOne(
    { _id: 'app' },
    {
      $setOnInsert: {
        _id: 'app',
        rateLimitFree: 100,
        rateLimitPro: 10000,
        authEnabled: true,
        analyticsEnabled: true,
        loggingEnabled: true,
        maintenanceMode: false,
        tools: {
          get_component_code: true,
          list_components: true,
          search_components: true,
          get_component_metadata: true
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    },
    { upsert: true }
  );
  console.log('  ✓ mcp_config singleton document initialized');

  // ─────────────────────────────────────────────────────────
  // 6. COMPONENTS & FAVORITES SEEDING
  // ─────────────────────────────────────────────────────────
  console.log('\n[6/7] Initializing "components" & seeding 77 UI components...');
  const components = await mongoService.getCollection('components');
  await components.createIndex({ category: 1, isPro: 1 }, { background: true });
  try {
    await components.createIndex({ title: 'text', tags: 'text' }, { background: true });
  } catch {
    // text index might already exist
  }

  const favorites = await mongoService.getCollection('favorites');
  await favorites.createIndex({ userId: 1, componentId: 1 }, { unique: true, background: true });

  const rawEntries = Object.entries(EMBEDDED_SOURCE_CODE || {});
  let seededComponents = 0;

  for (const [id, code] of rawEntries) {
    const isPro = PREMIUM_COMPONENT_IDS.has(id);
    const category = inferCategory(id);
    const title = formatTitle(id);
    const tags = [category, isPro ? 'pro' : 'free', 'react', 'tailwind', ...id.split('-')];

    await components.updateOne(
      { _id: id },
      {
        $set: {
          _id: id,
          title,
          category,
          framework: 'react',
          styling: 'tailwind',
          isPro,
          code: typeof code === 'string' ? { react: code } : code,
          tags,
          updatedAt: new Date()
        },
        $setOnInsert: {
          viewsCount: 0,
          copyCount: 0,
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    seededComponents++;
  }
  console.log(`  ✓ Seeded & updated ${seededComponents} components in MongoDB Atlas!`);

  // ─────────────────────────────────────────────────────────
  // 7. VERIFICATION
  // ─────────────────────────────────────────────────────────
  console.log('\n[7/7] Database collections summary:');
  const allCols = await db.listCollections().toArray();
  for (const col of allCols) {
    const c = db.collection(col.name);
    const count = await c.countDocuments();
    console.log(`  📁 ${col.name.padEnd(20)} : ${count} document(s)`);
  }

  console.log('\n====================================================');
  console.log('🎉 SUCCESS! YOUR MONGODB ATLAS IS FULLY PRODUCTION READY!');
  console.log('====================================================');
  process.exit(0);
}

setupDatabase().catch(err => {
  console.error('\n❌ Fatal Setup Error:', err);
  process.exit(1);
});
