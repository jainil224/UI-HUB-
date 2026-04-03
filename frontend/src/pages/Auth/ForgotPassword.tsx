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
        document.body.style.overflow = 'hidden';

        // Immediate check if video is already ready (cached)
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setVideoLoaded(true);
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
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
        <main className="h-[100dvh] w-full flex flex-col lg:flex-row bg-[#050505] text-white font-sans overflow-hidden relative">
            
            {/* ========================================================
                LEFT SIDE: Auth Form (40% Width) - INDEPENDENT SCROLL
                ======================================================== */}
            <div className="w-full lg:w-[40%] h-full relative z-10 bg-gradient-to-b from-[#0A0A0A] to-[#050505] flex flex-col overflow-hidden">
                
                {/* Scroll Edge Fade Masks */}
                <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-20 pointer-events-none" />

                {/* Background Accent */}
                <div className="fixed top-0 left-0 w-[400px] h-[400px] bg-[#00FF88]/5 blur-[120px] rounded-full pointer-events-none z-0" />
                
                {/* Internal Scrollable Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-8 py-10 md:px-14 lg:px-20">
                    <div className="min-h-full flex flex-col py-12 lg:py-20">
                        {/* Header Top - Shrink Proof */}
                        <div className="flex justify-between items-center w-full mb-12 lg:mb-16 shrink-0">
                            <Link to="/" className="hover:opacity-80 transition-opacity">
                                <Logo showText={true} />
                            </Link>
                            <Link to="/login" className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/70 hover:text-black hover:bg-[#00FF88] hover:border-[#00FF88] transition-all uppercase tracking-wider">
                                Remembered it? Log In
                            </Link>
                        </div>

                        {/* Main Content Area - Center or Scroll */}
                        <div className="flex-1 flex flex-col justify-center w-full max-w-[480px] mx-auto">
                            <AnimatePresence mode="wait">
                                {success ? (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center space-y-8"
                                    >
                                        <div className="relative inline-block">
                                            <div className="absolute inset-0 bg-[#00FF88]/20 blur-2xl rounded-full" />
                                            <div className="relative bg-[#00FF88] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(0,255,136,0.5)]">
                                                <Mail size={40} className="text-black" />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h2 className="text-4xl font-black text-white tracking-tight">
                                                Check Your Inbox
                                            </h2>
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                                                <p className="text-white/60 text-lg leading-relaxed">
                                                    We've sent a recovery link to:
                                                    <br />
                                                    <span className="text-[#00FF88] font-bold break-all">{email}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Guidance Box for Spam */}
                                            <div className="bg-[#00FF88]/5 border border-[#00FF88]/20 rounded-2xl p-6 text-left relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-[#00FF88]/40" />
                                                <p className="text-[#00FF88] text-sm font-bold flex items-center gap-2 mb-2">
                                                    <AlertCircle size={16} />
                                                    USER GUIDANCE
                                                </p>
                                                <p className="text-white/70 text-sm leading-relaxed">
                                                    Didn't receive the email? Make sure to check your <span className="text-white font-bold underline decoration-[#00FF88]/40">SPAM</span> folder. Sometimes these automated keys get filtered!
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => setSuccess(false)}
                                                className="w-full py-4 text-white/40 hover:text-[#00FF88] transition-colors text-sm font-bold uppercase tracking-widest"
                                            >
                                                Back to Request Access
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <div className="mb-12">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00FF88]/10 border border-[#00FF88]/20 text-[#00FF88] text-[10px] font-black uppercase tracking-widest mb-6">
                                                <Sparkles size={10} /> Password Recovery
                                            </div>
                                            <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tighter">
                                                RESET <span className="text-[#00FF88] drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">ACCESS</span>
                                            </h1>
                                            <p className="text-white/40 text-base font-medium">
                                                Enter your email and we'll transmit a secure recovery uplink.
                                            </p>
                                        </div>

                                        <form onSubmit={handleResetPassword} className="space-y-6">
                                            <AnimatePresence>
                                                {error && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3"
                                                    >
                                                        <AlertCircle size={18} />
                                                        {error}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="space-y-2">
                                                <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 ml-1">Registered Email Address</label>
                                                <div className="relative group">
                                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00FF88] transition-colors z-10 pointer-events-none" size={18} />
                                                    <input
                                                        type="email"
                                                        disabled={loading}
                                                        required
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                        placeholder="hello@ui-hub.com"
                                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#00FF88]/20 transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] backdrop-blur-sm relative z-0 disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>

                                            <motion.button
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                type="submit"
                                                disabled={loading}
                                                className="group relative w-full bg-[#00FF88] text-black font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(0,255,136,0.3)] hover:shadow-[0_15px_40px_rgba(0,255,136,0.4)] transition-all disabled:opacity-50 uppercase tracking-widest text-sm flex items-center justify-center gap-3 overflow-hidden"
                                            >
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                                {loading ? <Loader2 className="animate-spin" /> : (
                                                    <>Request Recovery <ArrowRight size={18} /></>
                                                )}
                                            </motion.button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="w-full mt-auto pt-12 text-center lg:text-left shrink-0">
                            <p className="text-[10px] text-white/20 uppercase tracking-widest">
                                &copy; 2026 UI HUB. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================================================
                RIGHT SIDE: Cinematic Video Overlay (60% Width) - LOCKED
                ======================================================== */}
            <div className="hidden lg:flex lg:w-[60%] h-full relative overflow-hidden ring-1 ring-white/10 shrink-0">
                <div className="w-full h-full relative group">
                    {/* Instant Poster Background */}
                    <div 
                        className="absolute inset-0 w-full h-full bg-cover bg-center z-0"
                        style={{ backgroundImage: 'url("/assets/images/black hol.png")' }}
                    />

                    {/* Fading Video Layer */}
                    <motion.video 
                        ref={videoRef}
                        autoPlay 
                        loop 
                        muted 
                        playsInline
                        onPlaying={() => setVideoLoaded(true)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: videoLoaded ? 1 : 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 w-full h-full object-cover z-10 transition-transform duration-[3000ms] group-hover:scale-105"
                    >
                        <source src="/assets/videos/black.mp4" type="video/mp4" />
                        <source src="/assets/videos/Black_hole_over_202604031858.mp4" type="video/mp4" />
                    </motion.video>

                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-black/60 z-20 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#00FF88]/20 via-transparent to-transparent z-20 mix-blend-overlay" />

                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                        className="absolute bottom-12 left-12 z-10 max-w-lg"
                    >
                        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                            
                            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">
                                Access Locked — Recovery Required
                            </h2>
                            <p className="text-white/80 text-sm leading-snug mb-4 font-medium">
                                Lost your credentials? No problem.<br/>
                                Our secure recovery uplink will bypass the lock and get you back into the UI HUB ecosystem instantly.
                            </p>
                            
                            <div className="space-y-2 mb-6 text-sm text-white/60">
                                <p>Encrypted recovery links</p>
                                <p>One-tap account bypass</p>
                                <p>Priority security support</p>
                            </div>
                            
                            <p className="text-[#00FF88] text-sm font-bold mb-6">
                                Request recovery to unlock your access.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }
            `}} />
        </main>
    );
};

export default ForgotPassword;
