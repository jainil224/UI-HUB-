import React from 'react';
import LegalPage, { LegalContent, type LegalSection } from './LegalPage';

const sections: LegalSection[] = [
    {
        id: 'acceptance',
        heading: 'Acceptance of Terms',
        body: [
            'By accessing or using UI HUB ("the Service") at https://ui-hub-design.vercel.app, you agree to be bound by these Terms and Conditions. If you do not agree, you must not use the Service.',
            'We may revise these terms from time to time. Continued use of the Service after updates are posted constitutes acceptance of the revised terms.',
        ],
    },
    {
        id: 'eligibility',
        heading: 'Eligibility and Accounts',
        body: [
            'You must be at least 13 years old to use the Service. By creating an account you confirm you meet this minimum age requirement.',
            'You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account.',
            'You agree to provide accurate and current information when creating your account and to update it if it changes.',
        ],
    },
    {
        id: 'subscription',
        heading: 'Pro Subscription and Payment',
        body: [
            'Free accounts allow access to the open component catalog and limited saved items. Pro accounts unlock the full catalog, exclusive premium components, and unlimited saved items.',
            'Subscriptions are billed on a recurring basis through Razorpay. By subscribing you authorize recurring charges to your payment method until you cancel.',
            'Prices and available plans are shown on the Pricing page. All prices are inclusive or exclusive of applicable taxes as stated during checkout.',
            'You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period; no partial refunds are issued.',
        ],
    },
    {
        id: 'license',
        heading: 'Component and Prompt License',
        body: [
            'Free components and prompts: Licensed under a permissive open license for personal and commercial projects. You may copy, modify, and distribute them within your projects without attribution.',
            'Pro components and prompts: Licensed exclusively for use by active Pro subscribers. You may use them in personal and commercial projects as long as your subscription remains active.',
            'You may not redistribute, resell, or repackage the source code or prompts as a standalone product, template kit, or competing library.',
            'UI HUB and its contributors retain all ownership rights in the original components, prompts, and the Service itself.',
        ],
    },
    {
        id: 'conduct',
        heading: 'Acceptable Use',
        body: [
            'You may not use the Service to distribute malware, infringe intellectual property, harass others, or violate any applicable law.',
            'You may not attempt to gain unauthorized access to any part of the Service, its servers, databases, or accounts belonging to other users.',
            'Scraping, crawling, or using automated tools to extract component source code or prompt data in bulk is prohibited unless expressly authorized in writing.',
        ],
    },
    {
        id: 'ip',
        heading: 'Intellectual Property',
        body: [
            'The Service, including its UI design, branding, website source code, and catalog structure, is the intellectual property of UI HUB and Jainil Patel.',
            'The UI HUB name, logo, and branding are trademarks. You may not use them without prior written permission.',
            'Third-party trademarks referenced on the Service (Firebase, Razorpay, Lucide, etc.) belong to their respective owners and are used for identification only.',
        ],
    },
    {
        id: 'disclaimers',
        heading: 'Disclaimers and Limitation of Liability',
        body: [
            'THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
            'UI HUB does not guarantee that the Service will be uninterrupted, error-free, or free from security vulnerabilities.',
            'To the maximum extent permitted by law, UI HUB shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service.',
        ],
    },
    {
        id: 'termination',
        heading: 'Termination',
        body: [
            'We may suspend or terminate your access to the Service at any time and without prior notice if you violate these Terms or engage in conduct we reasonably consider harmful to the Service or its users.',
            'Upon termination, your right to access and use the Service ceases immediately. Sections on IP ownership, disclaimers, and limitation of liability survive termination.',
        ],
    },
    {
        id: 'governing-law',
        heading: 'Governing Law and Disputes',
        body: [
            'These Terms are governed by the laws of India. Any dispute arising from or relating to these Terms shall be resolved in the courts of Mumbai, Maharashtra, India.',
            'You agree to attempt to resolve any dispute informally before initiating formal proceedings. We will attempt to respond to formal notice within 30 days.',
        ],
    },
    {
        id: 'contact',
        heading: 'Contact',
        body: [
            'For questions about these Terms, contact the operator of UI HUB, Jainil Patel, through our GitHub repository at https://github.com/jainil224/UI-HUB- or via the contact channels listed in the footer of the site.',
        ],
    },
];

const TermsPage: React.FC = () => (
    <LegalPage
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="The rules and rights governing your use of UI HUB."
        updatedLabel="Last updated"
        updatedDate="September 11, 2026"
    >
        <LegalContent sections={sections} />
    </LegalPage>
);

export default TermsPage;