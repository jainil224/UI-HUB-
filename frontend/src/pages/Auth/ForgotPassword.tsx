import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import Logo from '../../components/ui/Logo';
import TwinGalaxyRings from '../../components/ui/TwinGalaxyRings';
import { useIsMobile } from '../../hooks/use-mobile';

const ForgotPassword = () => {
    const isMobile = useIsMobile();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await sendPasswordResetEmail(auth, email);
            setSuccess(true);
        } catch (err: any) {
            setError(formatAuthError(err.message) || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="relative min-h-screen w-full pt-16 flex items-center justify-center bg-brand-black text-white font-sans overflow-x-hidden px-4 py-10">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <TwinGalaxyRings
                    background="#050A14"
                    colors={["#3D5CFF", "#C9D6E8"]}
                    density={isMobile ? 45 : 85}
                    dotSize={1.6}
                    speed={45}
                    hoverSpeed={70}
                    direction="cw"
                    distance={3540}
                    innerVoid={12}
                    armThickness={90}
                    armCount={4}
                    tilt={{ tilt: 26, sideTilt: -8 }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45),transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-[420px]">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="rounded-lg border-2 border-white bg-brand-surface brutal-shadow-black p-6 sm:p-8">
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-brand-yellow border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000000]">
                                    <Mail size={30} className="text-black" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight font-heading">
                                        CHECK INBOX
                                    </h3>
                                    <p className="text-xs text-neutral-400 font-medium leading-relaxed">
                                        We sent a recovery link to:
                                        <br />
                                        <span className="text-brand-blue font-mono font-bold break-all inline-block mt-1">{email}</span>
                                    </p>
                                </div>

                                <div className="p-3.5 rounded bg-brand-yellow/10 border-2 border-brand-yellow text-left text-xs text-neutral-300 space-y-1">
                                    <p className="font-black uppercase tracking-wider text-brand-yellow">Note:</p>
                                    <p className="text-neutral-400 font-medium">
                                        Please check your <strong className="text-white">SPAM / Junk</strong> folder if not received in 60 seconds.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSuccess(false)}
                                    className="brutal-btn-outline w-full py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                >
                                    SEND ANOTHER LINK
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                            >
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1.5 font-heading">
                                        PASSWORD RESET
                                    </h2>
                                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                                        We'll email you a recovery link
                                    </p>
                                </div>

                                {/* Error Banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-5 p-3 rounded bg-brand-red/10 border-2 border-brand-red text-brand-red text-xs font-bold flex items-center gap-2"
                                        >
                                            <AlertCircle size={15} className="shrink-0" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    {/* Email Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-white block">
                                            REGISTERED EMAIL ADDRESS
                                        </label>
                                        <div className="relative">
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                            <input
                                                type="email"
                                                disabled={loading}
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="user@example.com"
                                                className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Primary Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="brutal-btn-primary w-full py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <>
                                                <span>SEND RECOVERY LINK</span>
                                                <ArrowRight size={14} strokeWidth={3} />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Switch Link */}
                <div className="mt-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        REMEMBERED YOUR CREDENTIALS?{' '}
                        <Link to="/login" className="text-brand-yellow hover:underline font-black">
                            LOG IN HERE →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;