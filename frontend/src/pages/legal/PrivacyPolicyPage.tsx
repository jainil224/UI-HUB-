import React from 'react';
import LegalPage, { LegalContent, type LegalSection } from './LegalPage';

const sections: LegalSection[] = [
    {
        id: 'introduction',
        heading: 'Introduction',
        body: [
            'UI HUB ("we", "us", or "our") operates the website at https://ui-hub-design.vercel.app and provides a curated library of UI components, templates, and AI-ready prompts (the "Service").',
            'This Privacy Policy explains what information we collect, how we use it, with whom we share it, and the choices and rights you have regarding your data. By using the Service, you agree to the practices described in this policy.',
        ],
    },
    {
        id: 'information-we-collect',
        heading: 'Information We Collect',
        body: [
            'Account information: When you create an account, we collect your name, email address, profile image (if provided), and authentication identifiers via Firebase Authentication. If you sign in with a third-party provider (such as Google), we receive basic profile information from that provider.',
            'Usage data: We automatically collect information about how you interact with the Service, including pages visited, components viewed or copied, search queries, device and browser type, approximate location derived from IP address, and referral source.',
            'Payment information: When you purchase a Pro subscription, payment is processed by Razorpay. We do not store your full card details on our servers. We receive limited transaction metadata such as payment status, order ID, and subscription tier.',
            'Saved content: If you use favorites and collections, we store the components and folders you save to your account.',
        ],
    },
    {
        id: 'how-we-use',
        heading: 'How We Use Your Information',
        body: [
            'To provide, operate, and maintain the Service, including authenticating your account and syncing your saved components.',
            'To process payments and manage Pro subscriptions.',
            'To send transactional emails such as welcome messages, receipts, and subscription confirmations via our email service provider.',
            'To analyze usage trends and improve the catalog, performance, and user experience.',
            'To detect, prevent, and address fraud, abuse, or security incidents and to comply with legal obligations.',
        ],
    },
    {
        id: 'cookies',
        heading: 'Cookies and Analytics',
        body: [
            'We use cookies and similar technologies to keep you signed in, remember preferences, and understand how the Service is used.',
            'We use Google Analytics (measurement ID G-QS3XBQBLW8) to collect aggregated usage statistics. You can learn more in our Cookie Settings page and disable non-essential cookies in your browser.',
        ],
    },
    {
        id: 'third-parties',
        heading: 'Third-Party Services',
        body: [
            'Firebase (Google) — authentication, account management, and secure token handling.',
            'Razorpay — payment processing and subscription billing.',
            'Brevo — transactional and marketing email delivery.',
            'Google Analytics — anonymous usage measurement.',
            'Vercel — website hosting and content delivery.',
            'Each provider processes data under its own privacy policy. We only share the minimum information necessary for the provider to perform its function.',
        ],
    },
    {
        id: 'data-retention',
        heading: 'Data Retention',
        body: [
            'We retain account and saved-content data for as long as your account remains active. If you delete your account, we will delete or anonymize your personal data within a reasonable period, except where we are required to retain it for legal, tax, or fraud-prevention purposes.',
            'Aggregated analytics data that cannot identify you may be retained indefinitely.',
        ],
    },
    {
        id: 'your-rights',
        heading: 'Your Rights and Choices',
        body: [
            'Depending on your location, you may have the right to access, correct, export, or delete your personal data, to object to or restrict certain processing, and to withdraw consent.',
            'You can update your account information from your dashboard or contact us for assistance. To exercise any privacy right, email us at the address below.',
        ],
    },
    {
        id: 'children',
        heading: "Children's Privacy",
        body: [
            'The Service is not directed to children under 13 (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us so we can delete it.',
        ],
    },
    {
        id: 'changes',
        heading: 'Changes to This Policy',
        body: [
            'We may update this Privacy Policy from time to time. When we make material changes, we will update the "Last updated" date and, where appropriate, notify you by email or through the Service. Continued use after changes take effect constitutes acceptance of the revised policy.',
        ],
    },
    {
        id: 'contact',
        heading: 'Contact Us',
        body: [
            'If you have questions about this Privacy Policy or how your data is handled, contact Jainil Patel, the operator of UI HUB, via our GitHub repository at https://github.com/jainil224/UI-HUB- or the contact channels listed in the footer.',
        ],
    },
];

const PrivacyPolicyPage: React.FC = () => (
    <LegalPage
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How UI HUB collects, uses, and protects your personal information."
        updatedLabel="Last updated"
        updatedDate="September 11, 2026"
    >
        <LegalContent sections={sections} />
    </LegalPage>
);

export default PrivacyPolicyPage;