import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import Logo from '../../components/ui/Logo';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Handle global body scroll lock for this page
    useEffect(() => {
        // Immediate check if video is already ready (cached)
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setVideoLoaded(true);
        }
    }, []);

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
        <main className="min-h-screen w-full pt-16 flex flex-col lg:flex-row bg-[#EBEBEB] text-black font-sans overflow-x-hidden">
            
            {/* ========================================================
                LEFT SIDE: Bauhaus Graphic Column (50% Width) - Electric Blue
                ======================================================== */}
            <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-[calc(100vh-64px)] bg-[#1F4BFF] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-black">
                
                {/* Dotted Grid Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Floating Bauhaus Geometric Shapes */}
                <div className="absolute top-12 right-12 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#FFC700] border-2 border-black shadow-[4px_4px_0px_0px_#000000] pointer-events-none z-10" />
                <div className="absolute -bottom-6 right-20 w-24 h-24 bg-[#E52520] border-2 border-black shadow-[4px_4px_0px_0px_#000000] rotate-45 pointer-events-none z-10 hidden sm:block" />

                {/* Top Logo & Portal Badge */}
                <div className="relative z-20 flex items-center gap-3 flex-wrap">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                    <div className="px-2.5 py-0.5 bg-[#FFC700] text-black border-2 border-black font-mono font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
                        RECOVERY PORTAL
                    </div>
                </div>

                {/* Big Bold Headline */}
                <div className="relative z-20 my-auto py-10 max-w-lg">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
                        RECOVER<br />
                        <span className="text-[#FFC700]">ACCESS.</span>
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed max-w-md">
                        Transmit an encrypted recovery uplink directly to your verified email address to restore console permissions.
                    </p>
                </div>

                {/* Bottom Navigation & Sub-badge */}
                <div className="relative z-20 pt-6 border-t border-white/20 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/80">
                    <Link to="/login" className="inline-flex items-center gap-2 hover:text-[#FFC700] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        <span>Back to Login</span>
                    </Link>
                    <span className="font-mono text-[10px] text-white/60">SYSTEM ID // REC-2026</span>
                </div>
            </div>

            {/* ========================================================
                RIGHT SIDE: Off-white Form Column (50% Width)
                ======================================================== */}
            <div className="w-full lg:w-1/2 min-h-screen bg-[#EBEBEB] flex flex-col justify-center items-center p-6 md:p-12 lg:p-16">
                
                {/* Header */}
                <div className="w-full max-w-[420px] text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight mb-1 font-heading">
                        PASSWORD RESET
                    </h2>
                    <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest font-mono">
                        Transmit instant recovery uplink
                    </p>
                </div>

                {/* Central High-Contrast Brutalist Card */}
                <div className="w-full max-w-[420px] bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000]">
                    
                    <AnimatePresence mode="wait">
                        {success ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center space-y-6"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#FFC700] border-2 border-black flex items-center justify-center mx-auto shadow-[4px_4px_0px_0px_#000000]">
                                    <Mail size={30} className="text-black" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-black uppercase tracking-tight">
                                        CHECK INBOX
                                    </h3>
                                    <p className="text-xs text-neutral-700 font-medium leading-relaxed">
                                        We transmitted a recovery link to:
                                        <br />
                                        <span className="text-[#1F4BFF] font-mono font-bold break-all inline-block mt-1">{email}</span>
                                    </p>
                                </div>

                                <div className="p-3.5 bg-yellow-50 border-2 border-[#FFC700] text-left text-xs text-neutral-800 space-y-1">
                                    <p className="font-black uppercase tracking-wider text-black">Note:</p>
                                    <p className="text-neutral-600 font-medium">
                                        Please check your <strong className="text-black">SPAM / Junk</strong> folder if not received in 60 seconds.
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSuccess(false)}
                                    className="w-full bg-white hover:bg-neutral-50 text-black border-2 border-black py-2.5 px-4 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all"
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
                                {/* Error Banner */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-5 p-3 bg-red-100 border-2 border-[#E52520] text-[#E52520] text-xs font-bold flex items-center gap-2"
                                        >
                                            <AlertCircle size={15} className="shrink-0" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <form onSubmit={handleResetPassword} className="space-y-5">
                                    {/* Email Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-[11px] font-black uppercase tracking-wider text-black block">
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
                                                className="w-full bg-white border-2 border-black py-2.5 pl-10 pr-3 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF0] focus:shadow-[2px_2px_0px_0px_#000000] transition-all disabled:opacity-50"
                                            />
                                        </div>
                                    </div>

                                    {/* Primary Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-[#E52520] hover:bg-[#CC1E1A] text-white border-2 border-black py-3 px-4 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 mt-2"
                                    >
                                        {loading ? (
                                            <Loader2 size={16} className="animate-spin text-white" />
                                        ) : (
                                            <>
                                                <span>TRANSMIT RECOVERY LINK</span>
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
                    <p className="text-xs font-bold uppercase tracking-wider text-black">
                        REMEMBERED YOUR CREDENTIALS?{' '}
                        <Link to="/login" className="text-[#1F4BFF] hover:underline font-black">
                            LOG IN HERE →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default ForgotPassword;
