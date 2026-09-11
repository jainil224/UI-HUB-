import React from 'react';
import LegalPage, { LegalContent, type LegalSection } from './LegalPage';

const sections: LegalSection[] = [
    {
        id: 'overview',
        heading: 'Overview',
        body: [
            'UI HUB offers a free tier and a paid Pro subscription. This Payment Policy describes how billing, payment processing, refunds, and cancellations work for Pro subscriptions on UI HUB.',
            'All payment processing is handled by Razorpay (https://razorpay.com). UI HUB does not store your full credit card number, CVV, or bank account details on our servers.',
        ],
    },
    {
        id: 'plans',
        heading: 'Plans and Pricing',
        body: [
            'Free tier: Unlimited browsing of the open component catalog. You can save a limited number of items to favorites and collections at no cost.',
            'Pro subscription: Unlocks the complete catalog, exclusive premium components and prompts, unlimited saved items, and access to future releases. Pro pricing is displayed in INR or USD depending on your region and is shown on the Pricing page.',
            'All pricing is subject to change. Existing active subscribers are not affected by price changes until their next billing cycle following written notice.',
        ],
    },
    {
        id: 'billing',
        heading: 'Billing and Charges',
        body: [
            'When you subscribe to a Pro plan, you authorize Razorpay to charge your selected payment method on a recurring basis (monthly or annual, depending on the plan you choose).',
            'If a recurring charge fails (e.g., expired card), we may attempt to re-charge or downgrade your account to the free tier. You are responsible for keeping your payment information current.',
            'Prices shown at checkout include applicable taxes where required by law. A receipt or invoice is sent to your registered email address after each successful payment.',
        ],
    },
    {
        id: 'cancellation',
        heading: 'Cancellation',
        body: [
            'You may cancel your Pro subscription at any time from your dashboard or by contacting us. Cancellation is effective at the end of the current paid billing period.',
            'After cancellation, your account reverts to the free tier and any Pro-only saved items become read-only until removed. No partial refund is provided for the unused portion of the current billing period.',
        ],
    },
    {
        id: 'refunds',
        heading: 'Refunds',
        body: [
            'Because UI HUB provides immediate digital access, subscriptions are generally non-refundable once activated.',
            'If you experience a technical issue that prevents you from using the Service during an active billing period, please contact us within 7 days of the charge and we will evaluate your request in good faith.',
            'Refund amounts, if approved, are processed back to the original payment method via Razorpay within 5–10 business days.',
        ],
    },
    {
        id: 'gst',
        heading: 'Taxes and GST',
        body: [
            'Prices displayed in INR include applicable Indian GST (Goods and Services Tax) where required. For international (USD) purchases, local taxes or VAT may be your responsibility unless otherwise stated.',
            'Razorpay automatically provides GST-compliant invoices for payments made in INR. You can download invoices from your email or through the Razorpay payment confirmation link.',
        ],
    },
    {
        id: 'disputes',
        heading: 'Payment Disputes and Chargebacks',
        body: [
            'If you believe you have been charged in error, please contact us before initiating a chargeback with your bank. We will work to resolve the issue as quickly as possible.',
            'Abuse of the chargeback process (e.g., filing a dispute after using the Service intentionally) may result in account suspension.',
        ],
    },
    {
        id: 'contact',
        heading: 'Contact',
        body: [
            'For questions about billing, refunds, or this Payment Policy, contact us through our GitHub repository at https://github.com/jainil224/UI-HUB- or the channels listed in the site footer.',
        ],
    },
];

const PaymentPolicyPage: React.FC = () => (
    <LegalPage
        eyebrow="Legal"
        title="Payment Policy"
        subtitle="How billing, refunds, and subscriptions work on UI HUB."
        updatedLabel="Last updated"
        updatedDate="September 11, 2026"
    >
        <LegalContent sections={sections} />
    </LegalPage>
);

export default PaymentPolicyPage;