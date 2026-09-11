import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '../../context/CookieConsentContext';

const CookieBanner: React.FC = () => {
    const { showBanner, acceptAll, rejectNonEssential } = useCookieConsent();

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    role="dialog"
                    aria-live="polite"
                    aria-label="Cookie consent"
                    initial={{ opacity: 0, y: 120 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 120 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                    className="fixed bottom-0 inset-x-0 z-[10010]"
                >
                    <div className="border-t-4 border-black bg-brand-surface shadow-[0_-6px_0px_0px_#3D5CFF] [padding-bottom:env(safe-area-inset-bottom)]">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col lg:flex-row items-start lg:items-center gap-4">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                                <span className="flex items-center justify-center w-10 h-10 shrink-0 bg-brand-blue border-2 border-white rounded-sm brutal-shadow-black">
                                    <Cookie size={18} className="text-white" strokeWidth={2.5} />
                                </span>
                                <div className="min-w-0">
                                    <p className="font-black text-sm uppercase tracking-widest text-white">
                                        WE VALUE YOUR PRIVACY
                                    </p>
                                    <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed mt-0.5">
                                        We use cookies to improve your browsing experience, analyze site traffic,
                                        and keep you signed in. You can choose which cookies to allow.
                                        Read our{' '}
                                        <Link to="/cookies" className="text-brand-blue font-black uppercase tracking-wider text-[11px] hover:text-white transition-colors underline underline-offset-2">
                                            Cookie Settings
                                        </Link>{' '}
                                        for details.
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                                <button
                                    onClick={rejectNonEssential}
                                    className="inline-flex items-center justify-center px-4 py-2.5 border-2 border-white bg-brand-surface text-white text-[11px] font-black uppercase tracking-widest brutal-shadow-black hover:bg-brand-surface-alt hover:-translate-y-0.5 transition-all"
                                >
                                    Essential Only
                                </button>
                                <button
                                    onClick={acceptAll}
                                    className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-blue text-white border-2 border-black text-[11px] font-black uppercase tracking-widest brutal-shadow-white hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
                                >
                                    Accept All
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CookieBanner;