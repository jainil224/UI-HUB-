import dotenv from 'dotenv';
dotenv.config();

import { sendFreeSubscriptionEmail } from '../utils/sendEmail.js';

async function main() {
    const targetEmail = 'jainil11199@gmail.com';
    const targetName = 'Jainil';

    console.log(`🚀 Sending standalone FREE Subscription Email to: ${targetEmail}...`);
    const result = await sendFreeSubscriptionEmail({
        email: targetEmail,
        name: targetName,
        activatedAt: new Date(),
    });

    console.log('Result:', result);
}

main().catch((err) => {
    console.error('Error:', err);
    process.exit(1);
});
