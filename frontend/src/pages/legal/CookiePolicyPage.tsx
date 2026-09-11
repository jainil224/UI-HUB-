import React from 'react';
import LegalPage, { LegalContent, type LegalSection } from './LegalPage';

const sections: LegalSection[] = [
    {
        id: 'what-are-cookies',
        heading: 'What Are Cookies',
        body: [
            'Cookies are small text files placed on your device when you visit a website. They are widely used to keep websites working correctly, remember preferences, and improve the browsing experience.',
            'Cookies may be "first-party" (set by UI HUB) or "third-party" (set by services we use, such as Google Analytics).',
        ],
    },
    {
        id: 'essential',
        heading: 'Essential Cookies',
        body: [
            'These cookies are strictly necessary for the Service to work correctly. Without them, features like signing in, maintaining your session, and loading the dashboard would not function.',
            'Essential cookies cannot be disabled as they are required for core site functionality. Examples include session tokens managed by Firebase Authentication.',
        ],
    },
    {
        id: 'analytics',
        heading: 'Analytics Cookies',
        body: [
            'We use Google Analytics to collect anonymous, aggregated information about how visitors use the Service. This helps us understand which pages are popular, where users navigate, and how to improve the experience.',
            'Google Analytics uses first-party cookies (e.g., _ga, _ga_*) to distinguish unique users. No personally identifying information is stored in these cookies.',
            'Measurement ID: G-QS3XBQBLW8.',
        ],
    },
    {
        id: 'functional',
        heading: 'Functional Cookies',
        body: [
            'Functional cookies remember your preferences, such as dark mode or light mode settings and UI layout preferences, to provide a more personalized experience.',
            'These cookies are not strictly required for the Service to function but significantly improve usability.',
        ],
    },
    {
        id: 'third-party',
        heading: 'Third-Party Cookies',
        body: [
            'Google Analytics: See the "Analytics Cookies" section above. For more information, visit https://policies.google.com/privacy.',
            'Razorpay: During checkout, Razorpay may place its own cookies to facilitate secure payment processing. These are managed under Razorpay\'s privacy policy at https://razorpay.com/privacy.',
        ],
    },
    {
        id: 'managing',
        heading: 'Managing Cookies',
        body: [
            'You can control and delete cookies through your browser settings. Each browser has a different process; consult your browser\'s help documentation for instructions.',
            'If you disable all cookies, some features of UI HUB may not work as expected (e.g., staying signed in between visits).',
            'To opt out of Google Analytics specifically, you can install the Google Analytics Opt-out Browser Add-on available at https://tools.google.com/dlpage/gaoptout.',
        ],
    },
    {
        id: 'changes',
        heading: 'Changes to This Policy',
        body: [
            'We may update this Cookie Policy as we add or remove features or third-party services. Changes are reflected by updating the "Last updated" date at the top of this page.',
            'We encourage you to check this page periodically for the latest information on our cookie practices.',
        ],
    },
    {
        id: 'contact',
        heading: 'Contact',
        body: [
            'For questions about this Cookie Policy or our privacy practices in general, reach out through our GitHub repository at https://github.com/jainil224/UI-HUB- or the contact channels in the site footer.',
        ],
    },
];

const CookiePolicyPage: React.FC = () => (
    <LegalPage
        eyebrow="Legal"
        title="Cookie Settings"
        subtitle="How UI HUB uses cookies to provide and improve the Service."
        updatedLabel="Last updated"
        updatedDate="September 11, 2026"
    >
        <LegalContent sections={sections} />
    </LegalPage>
);

export default CookiePolicyPage;