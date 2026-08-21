import { generatePaymentReceiptPdf } from '../services/receiptService.js';
import {
    buildWelcomeEmailHtml,
    buildFreeSubscriptionEmailHtml,
    buildProSubscriptionEmailHtml,
} from '../services/brevoService.js';

async function runTests() {
    console.log('🧪 Starting Subscription Email & Payment Receipt Tests...\n');

    // 1. Test PDF Generation
    console.log('1️⃣ Testing PDF Payment Receipt Generation...');
    try {
        const pdfBuffer = await generatePaymentReceiptPdf({
            receiptNumber: 'UIHUB-2026-TEST1234',
            userName: 'Alex Dev',
            userEmail: 'alex@example.com',
            planName: 'PRO ACCESS',
            duration: '6 Months',
            amount: 4.99,
            currency: 'USD',
            paymentId: 'pay_test_998877',
            orderId: 'order_test_112233',
            paymentDate: new Date(),
            status: 'PAID',
        });

        if (!Buffer.isBuffer(pdfBuffer)) {
            throw new Error('PDF output is not a Buffer');
        }

        const isPdfHeader = pdfBuffer.slice(0, 4).toString() === '%PDF';
        if (!isPdfHeader) {
            throw new Error('PDF output missing %PDF magic header');
        }

        console.log(`✅ PDF Receipt Generated successfully: ${pdfBuffer.length} bytes. Header check passed!`);
    } catch (err) {
        console.error('❌ PDF Generation failed:', err);
        process.exit(1);
    }

    // 2. Test Welcome Email HTML
    console.log('\n2️⃣ Testing Welcome Email HTML...');
    const welcomeHtml = buildWelcomeEmailHtml('Alex Dev');
    if (!welcomeHtml.includes('WELCOME TO UI-HUB, ALEX DEV!') || !welcomeHtml.includes('UI-HUB // SYSTEM_VERIFIED')) {
        throw new Error('Welcome Email HTML missing essential elements');
    }
    console.log('✅ Welcome Email HTML generated successfully!');

    // 3. Test Free Subscription Email HTML
    console.log('\n3️⃣ Testing FREE Subscription Email HTML...');
    const freeHtml = buildFreeSubscriptionEmailHtml({
        name: 'Alex Dev',
        email: 'alex@example.com',
        activatedAt: new Date(),
    });
    if (!freeHtml.includes('FREE PLAN ACTIVE') || !freeHtml.includes('50+ Essential UI Components')) {
        throw new Error('FREE Subscription HTML missing essential elements');
    }
    if (freeHtml.includes('PDF PAYMENT RECEIPT ATTACHED')) {
        throw new Error('CRITICAL: Free subscription email MUST NOT contain receipt attachment notice!');
    }
    console.log('✅ FREE Subscription Email HTML verified! (No receipt notice present).');

    // 4. Test Pro Subscription Email HTML
    console.log('\n4️⃣ Testing PRO Subscription Email HTML...');
    const proHtml = buildProSubscriptionEmailHtml({
        name: 'Alex Dev',
        email: 'alex@example.com',
        amount: 4.99,
        currency: 'USD',
        paymentId: 'pay_test_12345',
        orderId: 'order_test_67890',
        purchaseDate: new Date(),
        duration: '6 Months',
    });
    if (!proHtml.includes("YOU'RE PRO NOW!") || !proHtml.includes('PDF PAYMENT RECEIPT ATTACHED')) {
        throw new Error('PRO Subscription HTML missing essential elements');
    }
    console.log('✅ PRO Subscription Email HTML verified! (Receipt notice correctly present).');

    console.log('\n🎉 ALL SUBSCRIPTION & RECEIPT TESTS PASSED PERFECTLY!');
}

runTests().catch((e) => {
    console.error('Fatal test error:', e);
    process.exit(1);
});
