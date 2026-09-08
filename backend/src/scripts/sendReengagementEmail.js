import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

import { sendReengagementEmail } from '../utils/sendEmail.js';
import { buildReengagementEmailHtml } from '../services/brevoService.js';
import { getCollection } from '../services/mongoService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const printHelp = () => {
    console.log(`
===================================================================
🎨 UI-HUB RE-ENGAGEMENT EMAIL BROADCAST UTILITY
===================================================================

Usage:
  node src/scripts/sendReengagementEmail.js [options]

Options:
  --preview              Generate HTML preview in backend/email-previews/
  --test [email]         Send a test re-engagement email to specified address
                         (defaults to jainil11199@gmail.com)
  --dry-run              List all targeted users from MongoDB without sending
  --broadcast            SEND re-engagement emails to ALL existing users in MongoDB
                         (Includes 600ms delay between emails to respect Brevo rate limits)
  --subject <text>       Override default subject line
  --help                 Show this help screen

Examples:
  node src/scripts/sendReengagementEmail.js --preview
  node src/scripts/sendReengagementEmail.js --test jainil11199@gmail.com
  node src/scripts/sendReengagementEmail.js --dry-run
  node src/scripts/sendReengagementEmail.js --broadcast
===================================================================
`);
};

async function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printHelp();
        process.exit(0);
    }

    const isPreview = args.includes('--preview');
    const isDryRun = args.includes('--dry-run');
    const isBroadcast = args.includes('--broadcast');
    const testIndex = args.indexOf('--test');
    const isTest = testIndex !== -1;

    let customSubject = null;
    const subjectIndex = args.indexOf('--subject');
    if (subjectIndex !== -1 && args[subjectIndex + 1]) {
        customSubject = args[subjectIndex + 1];
    }

    // MODE 1: Preview HTML
    if (isPreview) {
        console.log('🎨 Generating re-engagement email preview...');
        const outDir = path.join(__dirname, '..', '..', 'email-previews');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

        const html = buildReengagementEmailHtml({
            name: 'Jainil Patel',
        });

        const filePath = path.join(outDir, 'reengagement-email.html');
        fs.writeFileSync(filePath, html);
        console.log(`✅ Saved preview to: ${filePath}`);
        console.log(`\n📂 You can open this file in any web browser to preview.`);
        process.exit(0);
    }

    // MODE 2: Test Single Email
    if (isTest) {
        const targetEmail = args[testIndex + 1] && !args[testIndex + 1].startsWith('--')
            ? args[testIndex + 1]
            : 'jainil11199@gmail.com';
        const targetName = 'Jainil';

        console.log(`\n🧪 SENDING TEST RE-ENGAGEMENT EMAIL`);
        console.log(`   Recipient: ${targetEmail} (${targetName})`);
        if (customSubject) console.log(`   Custom Subject: "${customSubject}"`);
        console.log('--------------------------------------------------');

        const result = await sendReengagementEmail({
            email: targetEmail,
            name: targetName,
            customSubject,
        });

        if (result.success) {
            console.log(`✅ SUCCESS: Test email delivered!`);
            console.log(`   Message ID: ${result.messageId}`);
            console.log(`   Check your inbox at ${targetEmail}\n`);
            process.exit(0);
        } else {
            console.error(`❌ FAILED to send test email:`, result.error);
            process.exit(1);
        }
    }

    // Connect to MongoDB for Dry Run or Broadcast
    console.log('📡 Connecting to MongoDB to fetch existing users...');
    const usersCol = await getCollection('users');
    const rawUsers = await usersCol.find({}).toArray();

    // Deduplicate and filter valid emails
    const emailMap = new Map();
    for (const u of rawUsers) {
        const rawEmail = u.email || (typeof u._id === 'string' && u._id.includes('@') ? u._id : null);
        if (!rawEmail) continue;

        const email = rawEmail.trim().toLowerCase();
        if (!email.includes('@') || email.length < 5) continue;

        if (!emailMap.has(email)) {
            emailMap.set(email, {
                email,
                name: u.displayName || u.name || (email.split('@')[0] || 'Creator'),
                status: u.status || 'FREE',
                planTier: u.planTier || 'free',
                createdAt: u.createdAt || null,
            });
        }
    }

    const uniqueUsers = Array.from(emailMap.values());

    // MODE 3: Dry Run
    if (isDryRun) {
        console.log(`\n📋 DRY RUN: FOUND ${uniqueUsers.length} UNIQUE USERS IN MONGODB`);
        console.log('===================================================================');
        uniqueUsers.forEach((u, i) => {
            console.log(`  ${String(i + 1).padStart(2, ' ')}. [${u.email}] - Name: "${u.name}" | Status: ${u.status} | Plan: ${u.planTier}`);
        });
        console.log('===================================================================');
        console.log(`Total recipients: ${uniqueUsers.length}`);
        console.log('ℹ️  No emails were sent. Run with --broadcast to send to these users.\n');
        process.exit(0);
    }

    // MODE 4: Broadcast to All Users
    if (isBroadcast) {
        console.log(`\n🚀 INITIATING BROADCAST TO ${uniqueUsers.length} USERS`);
        console.log(`   Subject: "${customSubject || 'UI-HUB misses you! 🚀 New components dropped — come check what\'s new'}"`);
        console.log(`   Throttling: 600ms per email to prevent rate limits`);
        console.log('===================================================================');

        const stats = {
            total: uniqueUsers.length,
            sent: 0,
            failed: 0,
            skipped: 0,
            failures: [],
        };

        const startTime = Date.now();

        for (let i = 0; i < uniqueUsers.length; i++) {
            const user = uniqueUsers[i];
            const prefix = `[${i + 1}/${uniqueUsers.length}]`;

            try {
                process.stdout.write(`${prefix} Sending to ${user.email} (${user.name})... `);
                const res = await sendReengagementEmail({
                    email: user.email,
                    name: user.name,
                    customSubject,
                });

                if (res.success) {
                    stats.sent++;
                    process.stdout.write(`✅ Sent (id: ${res.messageId || 'ok'})\n`);
                } else {
                    stats.failed++;
                    stats.failures.push({ email: user.email, error: res.error });
                    process.stdout.write(`❌ Failed: ${res.error}\n`);
                }
            } catch (err) {
                stats.failed++;
                stats.failures.push({ email: user.email, error: err.message });
                process.stdout.write(`❌ Exception: ${err.message}\n`);
            }

            // Throttle between sends (600ms)
            if (i < uniqueUsers.length - 1) {
                await new Promise(r => setTimeout(r, 600));
            }
        }

        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('\n===================================================================');
        console.log(`🎉 BROADCAST CAMPAIGN COMPLETED in ${elapsedSec}s`);
        console.log(`   Total Users: ${stats.total}`);
        console.log(`   Successfully Sent: ${stats.sent}`);
        console.log(`   Failed: ${stats.failed}`);
        if (stats.failures.length > 0) {
            console.log('   Failures breakdown:', JSON.stringify(stats.failures, null, 2));
        }
        console.log('===================================================================\n');
        process.exit(stats.failed > 0 ? 1 : 0);
    }

    printHelp();
    process.exit(0);
}

main().catch((err) => {
    console.error('\n❌ Fatal error during script execution:', err);
    process.exit(1);
});
