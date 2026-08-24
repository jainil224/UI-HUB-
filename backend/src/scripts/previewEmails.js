import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
    buildWelcomeEmailHtml,
    buildFreeSubscriptionEmailHtml,
    buildProSubscriptionEmailHtml,
} from '../services/brevoService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, '..', '..', 'email-previews');

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const previews = [
    {
        file: 'welcome-email.html',
        html: buildWelcomeEmailHtml('Hello Patel'),
    },
    {
        file: 'free-subscription-email.html',
        html: buildFreeSubscriptionEmailHtml({
            name: 'Hello Patel',
            email: 'hellopatel555@gmail.com',
            activatedAt: new Date(),
        }),
    },
    {
        file: 'pro-subscription-email.html',
        html: buildProSubscriptionEmailHtml({
            name: 'Hello Patel',
            email: 'hellopatel555@gmail.com',
            amount: 99,
            currency: 'INR',
            paymentId: 'pay_preview_123456',
            orderId: 'order_preview_123456',
            purchaseDate: new Date(),
            duration: '6 Months',
        }),
    },
];

for (const preview of previews) {
    fs.writeFileSync(path.join(outDir, preview.file), preview.html);
    console.log(`✅ Generated: ${preview.file}`);
}

console.log(`\n📂 Open them from: ${outDir}`);
