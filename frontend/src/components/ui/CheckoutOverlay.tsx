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

// ... rest of the helper components ...

const LoadingDots = () => {
    return (
        <span className="inline-flex gap-1 ml-1">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1 h-1 rounded-full bg-blue-400 inline-block"
                    animate={{ opacity: [0.2, 1, 0.2], y: [0, -3, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </span>
    );
};

// Spinning ring loader
const SpinnerRing = () => (
    <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Outer glow */}
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />

        {/* Track ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(59,130,246,0.12)"
                strokeWidth="6"
            />
        </svg>

        {/* Spinning arc */}
        <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
        >
            <defs>
                <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
                    <stop offset="100%" stopColor="#60A5FA" stopOpacity="1" />
                </linearGradient>
            </defs>
            <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="url(#spinGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="80 185"
            />
        </motion.svg>

        {/* Center icon */}
        <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative z-10"
        >
            <Lock size={26} className="text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
        </motion.div>
    </div>
);

const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ isOpen, status, message, onClose }) => {
    const [dots, setDots] = useState('');

    useEffect(() => {
        if (status !== 'loading') return;
        const interval = setInterval(() => {
            setDots(d => d.length >= 3 ? '' : d + '.');
        }, 500);
        return () => clearInterval(interval);
    }, [status]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    style={{ backdropFilter: 'blur(20px)', background: 'rgba(0,0,0,0.75)' }}
                >
                    {/* Background ambient orbs */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <motion.div
                            animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px]"
                            style={{
                                background: status === 'success'
                                    ? 'rgba(0,255,26,0.08)'
                                    : status === 'error'
                                    ? 'rgba(239,68,68,0.08)'
                                    : 'rgba(59,130,246,0.08)'
                            }}
                        />
                        <motion.div
                            animate={{ x: [0, -40, 0], y: [0, 30, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
                            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px]"
                            style={{
                                background: status === 'success'
                                    ? 'rgba(0,200,20,0.06)'
                                    : status === 'error'
                                    ? 'rgba(220,38,38,0.06)'
                                    : 'rgba(99,102,241,0.06)'
                            }}
                        />
                    </div>

                    {/* Card */}
                    <motion.div
                        initial={{ scale: 0.85, y: 30, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.85, y: 30, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                        className="relative w-full max-w-md overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)',
                            border: `1px solid ${status === 'success' ? 'rgba(0,255,26,0.25)' : status === 'error' ? 'rgba(239,68,68,0.25)' : 'rgba(59,130,246,0.25)'}`,
                            borderRadius: '28px',
                            boxShadow: status === 'success'
                                ? '0 0 60px rgba(0,255,26,0.12), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
                                : status === 'error'
                                ? '0 0 60px rgba(239,68,68,0.12), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)'
                                : '0 0 60px rgba(59,130,246,0.12), 0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.08)',
                        }}
                    >
                        {/* Top gradient bar */}
                        <div
                            className="absolute top-0 left-0 right-0 h-[2px]"
                            style={{
                                background: status === 'success'
                                    ? 'linear-gradient(90deg, transparent, #00FF1A, transparent)'
                                    : status === 'error'
                                    ? 'linear-gradient(90deg, transparent, #EF4444, transparent)'
                                    : 'linear-gradient(90deg, transparent, #60A5FA, #818CF8, transparent)',
                            }}
                        />

                        {/* Inner shimmer sweep (loading only) */}
                        {status === 'loading' && (
                            <motion.div
                                className="absolute inset-0 pointer-events-none"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ duration: 2.5, repeat: Infinity, ease: 'linear', repeatDelay: 0.5 }}
                                style={{
                                    background: 'linear-gradient(105deg, transparent 40%, rgba(96,165,250,0.06) 50%, transparent 60%)',
                                }}
                            />
                        )}

                        {/* Close button — error state only */}
                        {status === 'error' && onClose && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1, background: 'rgba(239,68,68,0.15)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            >
                                <X size={16} className="text-white/50" />
                            </motion.button>
                        )}

                        <div className="relative z-10 p-10 flex flex-col items-center text-center">
                            {/* Branding Logo */}
                            <div className="mb-10 scale-110">
                                <Logo showText={true} className="w-10 h-10" />
                            </div>

                            {/* ── LOADING STATE ── */}
                            <AnimatePresence mode="wait">
                                {status === 'loading' && (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div className="mb-7">
                                            <SpinnerRing />
                                        </div>

                                        {/* Label pill */}
                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 text-[10px] font-bold uppercase tracking-[0.2em]"
                                            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}
                                        >
                                            <ShieldCheck size={10} />
                                            Secure Checkout
                                        </div>

                                        <h3
                                            className="text-2xl font-black tracking-tight mb-2"
                                            style={{ fontFamily: 'inherit', color: '#fff' }}
                                        >
                                            Initializing Checkout
                                        </h3>

                                        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            {message || 'Initializing secure checkout'}
                                            <LoadingDots />
                                        </p>

                                        {/* Progress steps */}
                                        <div className="w-full space-y-2.5">
                                            {[
                                                { label: 'Securing connection', done: true },
                                                { label: 'Loading payment gateway', done: true },
                                                { label: 'Preparing your order', done: false },
                                            ].map((step, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.15 }}
                                                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                                                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                                                >
                                                    {step.done ? (
                                                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,255,26,0.15)', border: '1px solid rgba(0,255,26,0.35)' }}>
                                                            <CheckCircle2 size={10} className="text-green-400" />
                                                        </div>
                                                    ) : (
                                                        <motion.div
                                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                                            transition={{ duration: 1.5, repeat: Infinity }}
                                                            className="w-4 h-4 rounded-full shrink-0"
                                                            style={{ background: 'rgba(59,130,246,0.3)', border: '1px solid rgba(59,130,246,0.5)' }}
                                                        />
                                                    )}
                                                    <span className="text-xs" style={{ color: step.done ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.35)' }}>
                                                        {step.label}
                                                    </span>
                                                    {step.done && (
                                                        <span className="ml-auto text-[9px] font-bold" style={{ color: '#4ADE80' }}>Done</span>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Secured by */}
                                        <div className="mt-6 flex items-center gap-2 text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                            <Lock size={10} />
                                            256-bit SSL encrypted · Secured by Razorpay
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── SUCCESS STATE ── */}
                                {status === 'success' && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        {/* Success icon with burst */}
                                        <div className="relative mb-7">
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: [0, 1.3, 1], opacity: [0, 0.6, 0] }}
                                                transition={{ duration: 0.8, times: [0, 0.6, 1] }}
                                                className="absolute inset-0 rounded-full"
                                                style={{ background: 'rgba(0,255,26,0.4)', filter: 'blur(20px)' }}
                                            />
                                            <motion.div
                                                initial={{ scale: 0, rotate: -45 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ type: 'spring', stiffness: 280, damping: 18, delay: 0.1 }}
                                                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, rgba(0,255,26,0.2), rgba(0,180,20,0.1))', border: '2px solid rgba(0,255,26,0.4)' }}
                                            >
                                                <CheckCircle2 size={44} className="text-green-400 drop-shadow-[0_0_20px_rgba(0,255,26,0.8)]" />
                                            </motion.div>

                                            {/* Orbiting sparkles */}
                                            {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                                                    transition={{ delay: 0.3 + i * 0.07, duration: 0.8 }}
                                                    className="absolute w-2 h-2 rounded-full"
                                                    style={{
                                                        background: '#00FF1A',
                                                        top: `calc(50% + ${Math.sin(deg * Math.PI / 180) * 48}px - 4px)`,
                                                        left: `calc(50% + ${Math.cos(deg * Math.PI / 180) * 48}px - 4px)`,
                                                        boxShadow: '0 0 8px #00FF1A',
                                                    }}
                                                />
                                            ))}
                                        </div>

                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                                            style={{ background: 'rgba(0,255,26,0.1)', border: '1px solid rgba(0,255,26,0.25)', color: '#4ADE80' }}
                                        >
                                            <Zap size={10} className="fill-current" />
                                            Plan Activated
                                        </div>

                                        <h3
                                            className="text-3xl font-black tracking-tight mb-2"
                                            style={{ background: 'linear-gradient(135deg, #00FF1A, #4ADE80)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                                        >
                                            Payment Successful!
                                        </h3>

                                        <p className="text-sm mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                            {message || 'You now have premium access. Welcome to the elite tier!'}
                                        </p>

                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={onClose}
                                            className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-black relative overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, #00FF1A, #00CC15)' }}
                                        >
                                            {/* button shimmer */}
                                            <motion.div
                                                className="absolute inset-0"
                                                animate={{ x: ['-100%', '200%'] }}
                                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                                style={{ background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)' }}
                                            />
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <Zap size={14} className="fill-current" />
                                                Start Exploring
                                            </span>
                                        </motion.button>
                                    </motion.div>
                                )}

                                {/* ── ERROR STATE ── */}
                                {status === 'error' && (
                                    <motion.div
                                        key="error"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex flex-col items-center w-full"
                                    >
                                        <div className="relative mb-7">
                                            <motion.div
                                                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2.5, repeat: Infinity }}
                                                className="absolute inset-0 rounded-full blur-xl"
                                                style={{ background: 'rgba(239,68,68,0.4)' }}
                                            />
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                                                className="relative w-24 h-24 rounded-full flex items-center justify-center"
                                                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.1))', border: '2px solid rgba(239,68,68,0.35)' }}
                                            >
                                                <AlertCircle size={44} className="text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]" />
                                            </motion.div>
                                        </div>

                                        <div
                                            className="flex items-center gap-1.5 px-3 py-1 rounded-full mb-4 text-[10px] font-bold uppercase tracking-[0.2em]"
                                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
                                        >
                                            Payment Failed
                                        </div>

                                        <h3 className="text-2xl font-black tracking-tight mb-2 text-red-400">
                                            Transaction Declined
                                        </h3>

                                        <p className="text-sm mb-8 leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                                            {message || 'Something went wrong during checkout. No charges were made.'}
                                        </p>

                                        <div className="flex flex-col gap-3 w-full">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={onClose}
                                                className="w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest text-white relative overflow-hidden"
                                                style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(185,28,28,0.15))', border: '1px solid rgba(239,68,68,0.3)' }}
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    Try Again
                                                </span>
                                            </motion.button>
                                        </div>
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
