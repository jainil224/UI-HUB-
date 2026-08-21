import dotenv from 'dotenv';
dotenv.config();

import {
    sendWelcomeEmail,
    sendFreeSubscriptionEmail,
    sendProSubscriptionEmail
} from '../utils/sendEmail.js';

async function sendAllEmails() {
    const targetEmail = 'jainil11199@gmail.com';
    const targetName = 'Jainil';

    console.log(`🚀 Sending all 3 test emails to: ${targetEmail}\n`);

    // 1. Welcome Email
    console.log('1️⃣ Sending Welcome Email...');
    const welcomeResult = await sendWelcomeEmail(targetEmail, targetName);
    console.log('   Welcome Email Result:', welcomeResult);

    // Short pause between sends to avoid rate limits
    await new Promise(r => setTimeout(r, 2000));

    // 2. FREE Subscription Email (No PDF attached)
    console.log('\n2️⃣ Sending FREE Subscription Email (No PDF)...');
    const freeResult = await sendFreeSubscriptionEmail({
        email: targetEmail,
        name: targetName,
        activatedAt: new Date()
    });
    console.log('   FREE Subscription Email Result:', freeResult);

    await new Promise(r => setTimeout(r, 2000));

    // 3. PRO Subscription Email (With PDF Payment Receipt attached)
    console.log('\n3️⃣ Sending PRO Subscription Email (With PDF Payment Receipt)...');
    const proResult = await sendProSubscriptionEmail({
        email: targetEmail,
        name: targetName,
        amount: 99,
        currency: 'INR',
        paymentId: 'pay_TEST_' + Date.now().toString().slice(-6),
        orderId: 'order_TEST_' + Date.now().toString().slice(-6),
        purchaseDate: new Date(),
        duration: '6 Months'
    });
    console.log('   PRO Subscription Email Result:', proResult);

    console.log('\n✨ All test emails processed!');
}

sendAllEmails().catch(err => {
    console.error('❌ Error executing sendAllEmails:', err);
    process.exit(1);
});
