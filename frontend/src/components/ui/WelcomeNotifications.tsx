import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PartyPopper, MailCheck, X } from 'lucide-react';

interface WelcomeNotificationsProps {
    isVisible: boolean;
    name?: string;
    email?: string;
}

const FIRST_DURATION = 6000;
const SECOND_DURATION = 7000;
const SECOND_DELAY = 800;

const cardAnim = {
    initial: { opacity: 0, y: -60, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -30, scale: 0.95 },
    transition: { type: 'spring' as const, stiffness: 400, damping: 28 }
};

const WelcomeNotifications = ({ isVisible, name, email }: WelcomeNotificationsProps) => {
    const [showFirst, setShowFirst] = useState(false);
    const [showSecond, setShowSecond] = useState(false);

    useEffect(() => {
        if (!isVisible) {
            setShowFirst(false);
            setShowSecond(false);
            return;
        }

        const timers = [
            setTimeout(() => setShowFirst(true), 200),
            setTimeout(() => setShowSecond(true), SECOND_DELAY),
            setTimeout(() => setShowFirst(false), 200 + FIRST_DURATION),
            setTimeout(() => setShowSecond(false), SECOND_DELAY + SECOND_DURATION),
        ];

        return () => timers.forEach(clearTimeout);
    }, [isVisible]);

    return (
        <div
            role="status"
            className="fixed top-20 inset-x-0 z-[9999] flex flex-col items-center gap-3 px-4 pointer-events-none"
        >
            <AnimatePresence>
                {showFirst && (
                    <motion.div
                        key="welcome-thanks"
                        {...cardAnim}
                        className="relative pointer-events-auto w-full max-w-md bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden"
                    >
                        <div className="flex items-start gap-3 p-4 pr-10">
                            <div className="w-10 h-10 shrink-0 bg-[#FFC700] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center">
                                <PartyPopper size={18} className="text-black" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-1.5 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-[#E52520] border border-black" />
                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-neutral-500">
                                        MEMBERSHIP CONFIRMED
                                    </span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-black font-heading leading-tight">
                                    THANK YOU FOR JOINING UI HUB{name ? `, ${name.split(' ')[0]}` : ''}!
                                </p>
                                <p className="text-[11px] font-medium text-neutral-600 leading-snug mt-0.5">
                                    Your free account is live. Dive into 100+ production-ready components.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowFirst(false)}
                            className="absolute top-2.5 right-2.5 w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-black hover:bg-[#E52520] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
                            title="Dismiss"
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: FIRST_DURATION / 1000, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-[#E52520]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSecond && (
                    <motion.div
                        key="welcome-email"
                        {...cardAnim}
                        className="relative pointer-events-auto w-full max-w-md bg-white border-2 border-black shadow-[6px_6px_0px_0px_#000000] overflow-hidden"
                    >
                        <div className="flex items-start gap-3 p-4 pr-10">
                            <div className="w-10 h-10 shrink-0 bg-[#1F4BFF] border-2 border-black shadow-[2px_2px_0px_0px_#000000] flex items-center justify-center">
                                <MailCheck size={18} className="text-white" strokeWidth={2.5} />
                            </div>
                            <div className="min-w-0">
                                <div className="inline-flex items-center gap-1.5 mb-1">
                                    <span className="w-2 h-2 rounded-full bg-[#FFC700] border border-black" />
                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-neutral-500">
                                        INBOX UPDATE
                                    </span>
                                </div>
                                <p className="text-sm font-black uppercase tracking-tight text-black font-heading leading-tight">
                                    CONFIRMATION EMAIL SENT
                                </p>
                                <p className="text-[11px] font-medium text-neutral-600 leading-snug mt-0.5 truncate">
                                    A welcome email is on its way to {email || 'your inbox'}.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSecond(false)}
                            className="absolute top-2.5 right-2.5 w-6 h-6 bg-white border-2 border-black flex items-center justify-center text-black hover:bg-[#E52520] hover:text-white active:translate-x-0.5 active:translate-y-0.5 transition-all"
                            title="Dismiss"
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: SECOND_DURATION / 1000, ease: 'linear' }}
                            className="absolute bottom-0 left-0 h-1 bg-[#1F4BFF]"
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default WelcomeNotifications;
