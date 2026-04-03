import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import {
    Mail,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    KeyRound,
} from 'lucide-react';

// ─── Email format validator ───────────────────────────────────────────────────
const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Component ────────────────────────────────────────────────────────────────
const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // ── Generic message — never reveals if the email exists (security best-practice)
    const GENERIC_SUCCESS =
        'If this email is registered, a reset link has been sent. Please check your inbox.';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // ── Client-side validation
        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }
        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email.trim());
            setSuccess(true);
            setEmail(''); // clear input after success
        } catch (err: any) {
            // ── Do NOT expose whether the email exists.
            // Show generic success message even on error to prevent email enumeration.
            console.error('[ForgotPassword] Firebase error:', err.code, err.message);
            setSuccess(true);
            setEmail('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen pt-20 md:pt-32 pb-10 md:pb-20 px-4 flex items-center justify-center relative overflow-hidden bg-[#020202]">
            {/* ── Back to Login ──────────────────────────────────────────── */}
            <Link
                to="/login"
                className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
            >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Login</span>
            </Link>

            {/* ── Ambient background glows ───────────────────────────────── */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse" />
            <div
                className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse"
                style={{ animationDelay: '2s' }}
            />
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />

            {/* ── Card ───────────────────────────────────────────────────── */}
            <div className="w-full max-w-lg relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                    >
                        <ShieldCheck size={14} />
                        <span>Secure Recovery</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                        className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tighter leading-tight"
                    >
                        RESET YOUR{' '}
                        <span className="text-brand-green text-glow">PASSWORD</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 font-medium text-base md:text-lg leading-relaxed max-w-sm md:max-w-md mx-auto"
                    >
                        Enter the email linked to your account and we'll send a secure reset
                        link straight to your inbox.
                    </motion.p>
                </div>

                {/* Glass Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 border border-white/5 bg-[#080808]/60 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                >
                    <div className="p-6 md:p-8">
                        <AnimatePresence mode="wait">
                            {success ? (
                                /* ── Success State ─────────────────────────────── */
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="flex flex-col items-center text-center py-8 gap-6"
                                >
                                    {/* Animated checkmark ring */}
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', damping: 15, stiffness: 200 }}
                                        className="relative w-24 h-24 flex items-center justify-center"
                                    >
                                        <div className="absolute inset-0 rounded-full bg-brand-green/10 border border-brand-green/30 animate-ping" />
                                        <div className="relative w-20 h-20 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center">
                                            <CheckCircle2 size={40} className="text-brand-green" />
                                        </div>
                                    </motion.div>

                                    <div className="space-y-2">
                                        <h2 className="text-2xl font-display font-black text-white tracking-tight">
                                            Check Your Inbox
                                        </h2>
                                        <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                                            {GENERIC_SUCCESS}
                                        </p>
                                    </div>

                                    {/* Tips */}
                                    <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left space-y-2">
                                        {[
                                            'Check your spam / junk folder',
                                            'The link expires after 1 hour',
                                            'Request a new link if needed',
                                        ].map((tip) => (
                                            <div key={tip} className="flex items-center gap-2 text-white/30 text-xs font-medium">
                                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green/60 shrink-0" />
                                                {tip}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                                        <button
                                            onClick={() => setSuccess(false)}
                                            className="flex-1 py-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/50 hover:text-white font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            Send Again
                                        </button>
                                        <Link
                                            to="/login"
                                            className="group flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-brand-green text-black font-black text-[10px] uppercase tracking-widest hover:shadow-[0_0_40px_rgba(0,255,0,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all"
                                        >
                                            Back to Login
                                            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </motion.div>
                            ) : (
                                /* ── Form State ──────────────────────────────── */
                                <motion.form
                                    key="form"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                >
                                    {/* Icon Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.35 }}
                                        className="flex justify-center mb-2"
                                    >
                                        <div className="w-16 h-16 rounded-2xl bg-brand-green/10 border border-brand-green/20 flex items-center justify-center">
                                            <KeyRound size={28} className="text-brand-green" />
                                        </div>
                                    </motion.div>

                                    {/* Error alert */}
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-3"
                                            >
                                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                                <span>{error}</span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Email field */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 }}
                                        className="space-y-3"
                                    >
                                        <label
                                            htmlFor="forgot-email"
                                            className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1"
                                        >
                                            Registered Email Address
                                        </label>
                                        <div className="relative group">
                                            <Mail
                                                className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors"
                                                size={20}
                                            />
                                            <input
                                                id="forgot-email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value);
                                                    if (error) setError('');
                                                }}
                                                placeholder="johndoe@example.com"
                                                autoComplete="email"
                                                disabled={loading}
                                                className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-green/30 focus:bg-[#0c0c0c] focus:ring-1 focus:ring-brand-green/20 transition-all shadow-inner disabled:opacity-50"
                                            />
                                            <div className="absolute inset-0 rounded-2xl border border-brand-green/0 group-focus-within:border-brand-green/20 pointer-events-none transition-all" />
                                        </div>
                                    </motion.div>

                                    {/* Submit button */}
                                    <motion.button
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                        type="submit"
                                        disabled={loading}
                                        className="group relative w-full bg-brand-green text-black font-black py-5 rounded-2xl shadow-[0_15px_40px_rgba(0,255,0,0.2)] hover:shadow-[0_0_50px_rgba(0,255,0,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-4 uppercase tracking-widest text-xs overflow-hidden"
                                    >
                                        {/* Shimmer sweep */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                        {loading ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                <span>Sending Reset Link…</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Send Reset Link</span>
                                                <ArrowRight
                                                    size={16}
                                                    className="group-hover:translate-x-1 transition-transform"
                                                />
                                            </>
                                        )}
                                    </motion.button>

                                    {/* Footer links */}
                                    <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center">
                                        <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
                                            Remember your password?
                                        </p>
                                        <Link
                                            to="/login"
                                            className="inline-flex items-center gap-2 text-brand-green hover:text-white transition-colors group px-5 py-2.5 rounded-xl bg-brand-green/5 border border-brand-green/10 hover:bg-brand-green/10"
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-widest">
                                                Back to Login
                                            </span>
                                            <ArrowRight
                                                size={12}
                                                className="group-hover:translate-x-1 transition-transform"
                                            />
                                        </Link>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Security note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-white/15 text-[10px] font-medium mt-6 tracking-wide"
                >
                    🔒 Secured by Firebase Authentication — UI HUB never stores your password.
                </motion.p>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .text-glow {
                    text-shadow: 0 0 30px rgba(0, 255, 0, 0.3);
                }
            `}} />
        </main>
    );
};

export default ForgotPassword;
