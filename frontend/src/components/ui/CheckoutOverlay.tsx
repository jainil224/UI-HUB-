import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, AlertCircle, ShieldCheck, Zap, Lock } from 'lucide-react';
import Logo from './Logo';

interface CheckoutOverlayProps {
    isOpen: boolean;
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    onClose?: () => void;
}

const LoadingDots = () => {
    return (
        <span className="inline-flex gap-1 ml-1.5 align-middle">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-none bg-brand-blue inline-block"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </span>
    );
};

// Cyberpunk Neo-Brutalist Lock & Scanner
const CyberpunkSpinner = () => (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
        {/* Background brutalist square frame */}
        <div className="absolute inset-0 border-2 border-white/20 bg-brand-bg rounded-lg" />
        
        {/* Corner accent markers */}
        <div className="absolute -top-1 -left-1 w-3 h-3 bg-brand-blue" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-yellow" />
        <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-brand-green" />
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-brand-blue" />

        {/* Outer rotating dashed ring */}
        <motion.svg
            className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)]"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
            <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="#3D5CFF"
                strokeWidth="3"
                strokeDasharray="16 12"
            />
        </motion.svg>

        {/* Inner reverse rotating ring */}
        <motion.svg
            className="absolute inset-4 w-[calc(100%-32px)] h-[calc(100%-32px)]"
            viewBox="0 0 100 100"
            animate={{ rotate: -360 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
        >
            <circle
                cx="50" cy="50" r="38"
                fill="none"
                stroke="#00FF1A"
                strokeWidth="2"
                strokeDasharray="24 16"
            />
        </motion.svg>

        {/* Center lock icon */}
        <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10 w-12 h-12 rounded border-2 border-white bg-[#1A1A24] flex items-center justify-center text-white shadow-[2px_2px_0px_#000000]"
        >
            <Lock size={22} className="text-brand-blue" />
        </motion.div>
    </div>
);

const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ isOpen, status, message, onClose }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (status !== 'loading') return;
        const timer1 = setTimeout(() => setCurrentStep(1), 600);
        const timer2 = setTimeout(() => setCurrentStep(2), 1200);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [status]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
                >
                    {/* Modal Card - Neo-Brutalist Style */}
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 350, damping: 26 }}
                        className="relative w-full max-w-lg overflow-hidden rounded-xl border-2 border-white bg-[#0E0E14] text-white shadow-[8px_8px_0px_#000000]"
                    >
                        {/* Terminal Top Window Bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-[#181822] border-b-2 border-white">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#FF3B30] border border-black inline-block" />
                                <span className="w-3 h-3 rounded-full bg-[#FFC700] border border-black inline-block" />
                                <span className="w-3 h-3 rounded-full bg-[#00FF1A] border border-black inline-block" />
                                <span className="font-mono text-[11px] font-black uppercase tracking-wider text-neutral-300 ml-2">
                                    UI-HUB // SECURE_CHECKOUT
                                </span>
                            </div>

                            {status === 'error' && onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded border border-white bg-black hover:bg-neutral-800 text-white transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                            {/* Branding Logo */}
                            <div className="mb-6">
                                <Logo showText={true} className="w-9 h-9" />
                            </div>

                            {/* ── 1. LOADING STATE ── */}
                            <AnimatePresence mode="wait">
                                {status === 'loading' && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div className="mb-6">
                                            <CyberpunkSpinner />
                                        </div>

                                        {/* Status Badge */}
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#3D5CFF]/15 border border-[#3D5CFF] text-[#3D5CFF] font-mono text-[10px] font-black uppercase tracking-widest mb-3 shadow-[2px_2px_0px_#000000]">
                                            <ShieldCheck size={12} />
                                            SECURE RAZORPAY GATEWAY
                                        </div>

                                        <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white mb-2">
                                            INITIALIZING CHECKOUT
                                        </h3>

                                        <p className="text-xs sm:text-sm font-medium text-neutral-400 mb-6 font-mono">
                                            {message || 'Connecting to payment provider'}
                                            <LoadingDots />
                                        </p>

                                        {/* Telemetry Progress Checklist */}
                                        <div className="w-full space-y-2.5 mb-6 text-left">
                                            {[
                                                { label: 'Securing encrypted 256-bit TLS connection', done: currentStep >= 0 },
                                                { label: 'Loading verified Razorpay checkout engine', done: currentStep >= 1 },
                                                { label: 'Generating payment order & receipt buffer', done: currentStep >= 2 },
                                            ].map((step, i) => (
                                                <div
                                                    key={i}
                                                    className={`flex items-center justify-between p-3 rounded-lg border-2 ${
                                                        step.done
                                                            ? 'border-white bg-[#14141E]'
                                                            : 'border-neutral-800 bg-[#0A0A0E] opacity-60'
                                                    } transition-all`}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        {step.done ? (
                                                            <div className="w-5 h-5 rounded bg-brand-green border border-black flex items-center justify-center text-black shrink-0">
                                                                <CheckCircle2 size={13} strokeWidth={3} />
                                                            </div>
                                                        ) : (
                                                            <div className="w-5 h-5 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-center shrink-0">
                                                                <div className="w-1.5 h-1.5 bg-brand-blue rounded-none animate-ping" />
                                                            </div>
                                                        )}
                                                        <span className="text-xs font-bold text-neutral-200">
                                                            {step.label}
                                                        </span>
                                                    </div>

                                                    {step.done ? (
                                                        <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black border border-[#00FF1A] text-[#00FF1A]">
                                                            DONE
                                                        </span>
                                                    ) : (
                                                        <span className="font-mono text-[9px] font-black uppercase px-2 py-0.5 rounded bg-black border border-neutral-700 text-neutral-400">
                                                            WAIT
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-2 font-mono text-[10px] text-neutral-500 uppercase tracking-wider">
                                            <Lock size={11} className="text-brand-blue" />
                                            <span>256-BIT SSL ENCRYPTION • RAZORPAY VERIFIED</span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── 2. SUCCESS STATE ── */}
                                {status === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div className="w-20 h-20 rounded-xl border-2 border-black bg-brand-green flex items-center justify-center text-black mb-5 shadow-[4px_4px_0px_#000000]">
                                            <CheckCircle2 size={42} strokeWidth={2.5} />
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#00FF1A]/20 border border-[#00FF1A] text-[#00FF1A] font-mono text-[10px] font-black uppercase tracking-widest mb-3">
                                            <Zap size={11} className="fill-current" />
                                            PAYMENT CONFIRMED & VERIFIED
                                        </div>

                                        <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
                                            PAYMENT SUCCESSFUL!
                                        </h3>

                                        <p className="text-xs sm:text-sm text-neutral-300 mb-6 leading-relaxed max-w-sm">
                                            {message || 'Your UI-HUB account has been upgraded to PRO ACCESS. Your payment receipt has been sent to your email.'}
                                        </p>

                                        <button
                                            onClick={onClose}
                                            className="brutal-btn-primary w-full py-3.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                        >
                                            <Zap size={14} className="fill-current" />
                                            <span>START EXPLORING PRO COMPONENTS →</span>
                                        </button>
                                    </motion.div>
                                )}

                                {/* ── 3. ERROR STATE ── */}
                                {status === 'error' && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div className="w-20 h-20 rounded-xl border-2 border-black bg-[#FF3B30] flex items-center justify-center text-white mb-5 shadow-[4px_4px_0px_#000000]">
                                            <AlertCircle size={42} strokeWidth={2.5} />
                                        </div>

                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FF3B30]/20 border border-[#FF3B30] text-[#FF3B30] font-mono text-[10px] font-black uppercase tracking-widest mb-3">
                                            TRANSACTION INCOMPLETE
                                        </div>

                                        <h3 className="text-2xl font-black uppercase tracking-tight text-[#FF3B30] mb-2">
                                            PAYMENT DECLINED
                                        </h3>

                                        <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed max-w-sm">
                                            {message || 'Transaction could not be completed. No charges were made to your account.'}
                                        </p>

                                        <button
                                            onClick={onClose}
                                            className="w-full py-3.5 rounded-lg border-2 border-white bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-wider shadow-[4px_4px_0px_#000000] transition-all flex items-center justify-center gap-2"
                                        >
                                            <span>TRY AGAIN</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutOverlay;
