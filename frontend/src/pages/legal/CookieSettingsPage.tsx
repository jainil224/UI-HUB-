import React, { useState, useEffect, useRef } from 'react';
import LegalPage, { LegalContent, type LegalSection } from './LegalPage';
import { useCookieConsent } from '../../context/CookieConsentContext';
import type { CookiePreferences } from '../../utils/cookieUtils';
import { ALLOW_ALL, ESSENTIAL_ONLY } from '../../utils/cookieUtils';
import { Cookie, RotateCcw, Check, ChevronDown, ShieldCheck, BarChart3, SlidersHorizontal, Share2 } from 'lucide-react';

const policySections: LegalSection[] = [
    {
        id: 'what-are-cookies',
        heading: 'What Are Cookies',
        body: [
            'Cookies are small text files placed on your device when you visit a website. They are widely used to keep websites working correctly, remember preferences, and improve the browsing experience.',
            'Cookies may be "first-party" (set by UI HUB) or "third-party" (set by services we use, such as Google Analytics).',
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

interface ToggleProps {
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, disabled, onChange }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={onChange}
        className={`relative flex items-center w-16 h-8 border-2 border-black rounded-full transition-all ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-0.5'} ${checked ? 'bg-brand-blue brutal-shadow-white' : 'bg-brand-surface brutal-shadow-black'}`}
    >
        <span
            className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-black text-white text-[9px] font-black transition-all duration-200 ${
                checked ? 'translate-x-8 bg-white' : 'translate-x-0.5 bg-neutral-500'
            }`}
        >
            {checked ? <Check size={12} className="text-black" strokeWidth={4} /> : ''}
        </span>
    </button>
);

interface CategoryCardProps {
    icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
    dot: string;
    title: string;
    description: string;
    checked: boolean;
    locked?: boolean;
    onToggle: () => void;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ icon: Icon, dot, title, description, checked, locked, onToggle }) => (
    <div className={`bg-brand-surface border-2 border-white rounded-lg p-5 sm:p-6 brutal-shadow-black ${locked ? 'opacity-90' : ''}`}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                    <span className={`flex items-center justify-center w-8 h-8 shrink-0 border-2 border-black rounded ${checked ? 'bg-brand-blue text-white' : 'bg-brand-surface-alt text-neutral-400'}`}>
                        <Icon size={16} strokeWidth={2.5} />
                    </span>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${dot} border border-black`} />
                        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">{title}</h3>
                    </div>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed">{description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
                <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${checked ? 'text-[#00FF88]' : 'text-neutral-500'}`}>
                    {locked ? 'Always On' : checked ? 'Enabled' : 'Disabled'}
                </span>
                <Toggle checked={checked} disabled={locked} onChange={onToggle} />
            </div>
        </div>
    </div>
);

const CookieSettingsPage: React.FC = () => {
    const { status, prefs, acceptAll, rejectNonEssential, savePreference, resetPreference } = useCookieConsent();
    const [draft, setDraft] = useState<CookiePreferences>({ ...prefs });
    const [showPolicy, setShowPolicy] = useState(false);
    const [saved, setSaved] = useState(false);
    const savedTimerRef = useRef<number | null>(null);

    useEffect(() => {
        setDraft({ ...prefs });
    }, [prefs]);

    useEffect(() => {
        return () => {
            if (savedTimerRef.current !== null) {
                clearTimeout(savedTimerRef.current);
            }
        };
    }, []);

    const hasChanges =
        draft.analytics !== prefs.analytics ||
        draft.functional !== prefs.functional ||
        draft.thirdParty !== prefs.thirdParty;

    const statusLabel =
        status === 'accepted'
            ? 'You have accepted all cookies.'
            : status === 'custom'
                ? 'You have a custom cookie preference.'
                : status === 'essential'
                    ? 'You have chosen essential cookies only.'
                    : 'You have not chosen a cookie preference yet.';

    const handleAcceptAll = () => {
        setDraft({ ...ALLOW_ALL });
        acceptAll();
    };

    const handleEssentialOnly = () => {
        setDraft({ ...ESSENTIAL_ONLY });
        rejectNonEssential();
    };

    const handleSave = () => {
        savePreference(draft);
        setSaved(true);
        if (savedTimerRef.current !== null) {
            clearTimeout(savedTimerRef.current);
        }
        savedTimerRef.current = window.setTimeout(() => setSaved(false), 2000);
    };

    const handleReset = () => {
        setDraft({ ...ESSENTIAL_ONLY });
        resetPreference();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <LegalPage
            eyebrow="Legal"
            title="Cookie Settings"
            subtitle="Choose which cookies UI HUB may use. Essential cookies are always required."
            updatedLabel="Last updated"
            updatedDate="September 11, 2026"
        >
            {/* Current consent choice */}
            <div className="bg-brand-surface border-2 border-white rounded-lg p-6 sm:p-8 brutal-shadow-black flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1">
                    <h2 className="flex items-center gap-3 text-lg sm:text-xl font-black uppercase tracking-wider text-white mb-2">
                        <span className="flex items-center justify-center w-8 h-8 shrink-0 bg-brand-yellow border-2 border-black rounded text-white">
                            <Cookie size={16} className="text-black" strokeWidth={2.5} />
                        </span>
                        Your Consent Choice
                    </h2>
                    <p className="text-neutral-400 text-sm leading-relaxed font-medium">{statusLabel}</p>
                </div>
                <button
                    onClick={handleReset}
                    className="group inline-flex items-center justify-center gap-2 shrink-0 px-5 py-2.5 bg-brand-surface-alt text-white border-2 border-white text-[11px] font-black uppercase tracking-widest brutal-shadow-black hover:-translate-y-0.5 transition-all"
                >
                    <RotateCcw size={13} className="group-hover:-rotate-90 transition-transform" />
                    Reset Cookie Choice
                </button>
            </div>

            {/* Category toggles */}
            <div className="flex flex-col gap-4">
                <CategoryCard
                    icon={ShieldCheck}
                    dot="bg-brand-blue"
                    title="Essential Cookies"
                    description="Strictly necessary for the Service to work. Required for signing in, maintaining your session, and loading the dashboard. Cannot be disabled."
                    checked={true}
                    locked
                    onToggle={() => {}}
                />
                <CategoryCard
                    icon={BarChart3}
                    dot="bg-[#00FF88]"
                    title="Analytics Cookies"
                    description="Google Analytics (G-QS3XBQBLW8) collects anonymous, aggregated usage data so we can improve the experience. No personally identifying information is stored."
                    checked={draft.analytics}
                    onToggle={() => setDraft({ ...draft, analytics: !draft.analytics })}
                />
                <CategoryCard
                    icon={SlidersHorizontal}
                    dot="bg-brand-yellow"
                    title="Functional Cookies"
                    description="Remember your preferences such as dark mode, light mode, and UI layout choices for a more personalized experience."
                    checked={draft.functional}
                    onToggle={() => setDraft({ ...draft, functional: !draft.functional })}
                />
                <CategoryCard
                    icon={Share2}
                    dot="bg-brand-red"
                    title="Third-Party Cookies"
                    description="Set by partner services such as Razorpay during checkout to facilitate secure payment processing."
                    checked={draft.thirdParty}
                    onToggle={() => setDraft({ ...draft, thirdParty: !draft.thirdParty })}
                />
            </div>

            {/* Action bar */}
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={handleAcceptAll}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-blue text-white border-2 border-black text-[11px] font-black uppercase tracking-widest brutal-shadow-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                >
                    <Check size={13} strokeWidth={3} />
                    Accept All
                </button>
                <button
                    onClick={handleEssentialOnly}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-surface text-white border-2 border-white text-[11px] font-black uppercase tracking-widest brutal-shadow-black hover:-translate-y-0.5 transition-all"
                >
                    <ShieldCheck size={13} />
                    Essential Only
                </button>
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-[11px] font-black uppercase tracking-widest transition-all ${
                        hasChanges
                            ? 'bg-[#00FF88] text-black border-2 border-black brutal-shadow-black hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none cursor-pointer'
                            : 'bg-neutral-800 text-neutral-500 border-2 border-neutral-700 cursor-not-allowed'
                    }`}
                >
                    {saved ? <Check size={13} strokeWidth={3} /> : <SlidersHorizontal size={13} />}
                    {saved ? 'Saved!' : 'Save Preferences'}
                </button>
            </div>

            {hasChanges && (
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-500 border border-neutral-800 px-3 py-1.5 rounded w-fit">
                    Note: your changes are applied when you hit "Save Preferences".
                </p>
            )}

            {/* Collapsible full policy */}
            <div className="bg-brand-surface border-2 border-white rounded-lg brutal-shadow-black overflow-hidden">
                <button
                    onClick={() => setShowPolicy((v) => !v)}
                    aria-expanded={showPolicy}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-brand-surface-alt transition-colors"
                >
                    <span className="flex items-center gap-3 text-sm font-black uppercase tracking-wider text-white">
                        <span className="flex items-center justify-center w-8 h-8 shrink-0 bg-brand-blue border-2 border-black rounded text-sm font-mono text-white">
                            <Cookie size={16} strokeWidth={2.5} />
                        </span>
                        Read the Full Cookie Policy
                    </span>
                    <ChevronDown
                        size={18}
                        className={`text-brand-blue transition-transform duration-300 ${showPolicy ? 'rotate-180' : ''}`}
                    />
                </button>
                {showPolicy && (
                    <div className="px-6 pb-6 flex flex-col gap-6 border-t-2 border-neutral-800 pt-6">
                        <LegalContent sections={policySections} />
                    </div>
                )}
            </div>
        </LegalPage>
    );
};

export default CookieSettingsPage;