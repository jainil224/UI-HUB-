import dotenv from 'dotenv';
dotenv.config();

import { sendWelcomeEmail, sendFreeSubscriptionEmail } from '../utils/sendEmail.js';

async function sendTestEmails() {
    const targetEmail = 'jainil11199@gmail.com';
    const targetName = 'Jainil';

    console.log(`🚀 Sending Welcome Email and FREE Subscription Email to: ${targetEmail}\n`);

    // 1. Welcome Email
    console.log('1️⃣ Sending Welcome Email...');
    const welcomeResult = await sendWelcomeEmail(targetEmail, targetName);
    console.log('   Welcome Email Result:', welcomeResult);

    await new Promise((r) => setTimeout(r, 2000));

    // 2. FREE Subscription Confirmation Email
    console.log('\n2️⃣ Sending FREE Subscription Confirmation Email (No Receipt)...');
    const freeResult = await sendFreeSubscriptionEmail({
        email: targetEmail,
        name: targetName,
        activatedAt: new Date(),
    });
    console.log('   FREE Subscription Confirmation Result:', freeResult);

    console.log('\n✨ Both test emails sent successfully!');
}

sendTestEmails().catch((err) => {
    console.error('❌ Error sending test emails:', err);
    process.exit(1);
});
