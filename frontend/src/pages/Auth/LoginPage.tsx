import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, Lock, AlertCircle, Loader2, Github, ArrowRight, Eye, EyeOff, Sparkles } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const videoRef = React.useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Handle global body scroll lock for this page
    useEffect(() => {
        // Immediate check if video is already ready (cached)
        if (videoRef.current && videoRef.current.readyState >= 3) {
            setVideoLoaded(true);
        }
    }, []);

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSocialSignIn = async (providerType: 'google' | 'github') => {
        setError('');
        setSocialLoading(providerType);
        
        // Setup provider based on type
        let provider: any;
        if (providerType === 'google') provider = new GoogleAuthProvider();
        else if (providerType === 'github') provider = new GithubAuthProvider();

        try {
            console.log(`[Auth] Attempting ${providerType} sign-in...`);
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                console.log(`[Auth] ${providerType} sign-in successful:`, result.user.email);
                navigate('/');
            }
        } catch (err: any) {
            console.error(`[Auth] ${providerType} sign-in failed:`, err);
            
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site to sign in.');
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with the same email address but different sign-in credentials (e.g. Google). Please sign in using the correct provider.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError(`${providerType.toUpperCase()} is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.`);
            } else if (err.code === 'auth/configuration-not-found') {
                setError(`Firebase configuration for ${providerType} is missing. Please check your settings.`);
            } else {
                setError(formatAuthError(err.message) || `Failed to sign in with ${providerType}.`);
            }
        } finally {
            setSocialLoading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            sessionStorage.setItem('ui-hub-show-welcome', 'true');
            navigate('/');
        } catch (err: any) {
            setError(formatAuthError(err.message) || 'Failed to sign in. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const socialButtonVariants = {
        hover: { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
        tap: { scale: 0.98 }
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
                
                {/* Internal Scrollable Container - Independent scroll with Lenis prevention */}
                <div 
                    className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-8 py-10 md:px-14 lg:px-20"
                    data-lenis-prevent
                >
                    <div className="min-h-full flex flex-col py-12 lg:py-20">
                        {/* Header Top - Shrink Proof */}
                        <div className="flex justify-between items-center w-full mb-12 lg:mb-16 shrink-0 relative z-10">
                            <div className="flex items-center gap-6">
                                <Link to="/" className="hover:opacity-80 transition-opacity">
                                    <Logo showText={true} />
                                </Link>
                                <div className="h-4 w-px bg-white/10 hidden sm:block" />
                                <Link to="/" className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-white/40 hover:text-[#00FF88] transition-colors uppercase tracking-[0.2em]">
                                    <motion.div
                                        animate={{ x: [0, -4, 0] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                    >
                                        <ArrowRight className="w-3 h-3 rotate-180" />
                                    </motion.div>
                                    Back to Home
                                </Link>
                            </div>
                            <Link to="/signup" className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold text-white/70 hover:text-black hover:bg-[#00FF88] hover:border-[#00FF88] transition-all uppercase tracking-wider">
                                Create Account
                            </Link>
                        </div>

                        {/* Main Content Area - Center or Scroll */}
                        <div className="flex-1 flex flex-col justify-center w-full max-w-[480px] mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                            <h1 className="text-5xl lg:text-6xl font-black mb-4 tracking-tighter">
                                LOGIN TO <span className="text-[#00FF88] drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">UI HUB</span>
                            </h1>
                            <p className="text-white/40 text-base mb-12 font-medium">
                                Access your curated toolkit of high-performance components.
                            </p>

                            {/* Social Buttons (Top Priority) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSocialSignIn('google')}
                                    disabled={!!socialLoading}
                                    type="button"
                                    className="group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:from-white/10 hover:to-white/[0.02] transition-all overflow-hidden disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                                    {socialLoading === 'google' ? <Loader2 size={18} className="animate-spin text-[#00FF88]" /> : (
                                        <>
                                            <svg className="w-5 h-5 relative z-10 drop-shadow-md" viewBox="0 0 24 24">
                                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05" />
                                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                            </svg>
                                            <span className="text-sm font-semibold text-white/80 group-hover:text-white relative z-10 transition-colors">Continue with Google</span>
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleSocialSignIn('github')}
                                    disabled={!!socialLoading}
                                    type="button"
                                    className="group relative flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:from-white/10 hover:to-white/[0.02] transition-all overflow-hidden disabled:opacity-50"
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                                    {socialLoading === 'github' ? <Loader2 size={18} className="animate-spin text-[#00FF88]" /> : (
                                        <>
                                            <Github className="w-5 h-5 text-white/80 group-hover:text-white relative z-10 transition-colors drop-shadow-md" />
                                            <span className="text-sm font-semibold text-white/80 group-hover:text-white relative z-10 transition-colors">Continue with GitHub</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-white/10 flex-1" />
                                <span className="text-[10px] uppercase tracking-wider text-white/30 font-bold">Or login with email</span>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Error Message */}
                                <AnimatePresence>
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                            animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                            className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2 overflow-hidden"
                                        >
                                            <AlertCircle size={14} className="shrink-0" />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00FF88] transition-colors z-10 pointer-events-none" size={18} />
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="hello@ui-hub.com"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#00FF88]/20 transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] backdrop-blur-sm relative z-0"
                                        />
                                    </div>
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-[#00FF88] transition-colors z-10 pointer-events-none" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-2xl py-5 pl-12 pr-12 text-base text-white placeholder:text-white/20 focus:outline-none focus:border-[#00FF88]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#00FF88]/20 transition-all shadow-[inset_0_1px_2px_rgba(255,255,255,0.02)] backdrop-blur-sm relative z-0"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors z-10"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>

                                    {/* Password Strength Meter */}
                                    {password.length > 0 && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-1.5 pt-1 px-1">
                                            <div className="flex gap-1 w-full">
                                                {[0, 1, 2, 3].map((index) => {
                                                    let strength = 0;
                                                    if (password.length > 5) strength += 1;
                                                    if (password.length > 8) strength += 1;
                                                    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) strength += 1;
                                                    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
                                                    
                                                    const getColor = () => {
                                                        if (strength <= index) return 'bg-white/10';
                                                        if (strength === 1) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]';
                                                        if (strength === 2) return 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]';
                                                        if (strength === 3) return 'bg-[#00FF88]/70 shadow-[0_0_8px_rgba(0,255,136,0.3)]';
                                                        return 'bg-[#00FF88] shadow-[0_0_12px_rgba(0,255,136,0.8)]';
                                                    };
                                                    
                                                    return <div key={index} className={`h-1 flex-1 rounded-full transition-all duration-300 ${getColor()}`} />;
                                                })}
                                            </div>
                                            <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-bold">
                                                <span className="text-white/30">Password Strength</span>
                                                {(() => {
                                                    let s = 0;
                                                    if (password.length > 5) s += 1;
                                                    if (password.length > 8) s += 1;
                                                    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) s += 1;
                                                    if (/[^A-Za-z0-9]/.test(password)) s += 1;
                                                    
                                                    if (s === 0) return <span className="text-white/40">Too Short</span>;
                                                    if (s === 1) return <span className="text-red-400">Weak</span>;
                                                    if (s === 2) return <span className="text-yellow-400">Fair</span>;
                                                    if (s === 3) return <span className="text-[#00FF88]/70">Good</span>;
                                                    return <span className="text-[#00FF88]">Strong</span>;
                                                })()}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Options: Remember Me & Security & Forgot Password */}
                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className="relative w-4 h-4 rounded border border-white/20 bg-[#0A0A0A] group-hover:border-[#00FF88]/50 transition-colors flex items-center justify-center">
                                            {rememberMe && <div className="w-2 h-2 rounded-sm bg-[#00FF88]" />}
                                            <input 
                                                type="checkbox" 
                                                className="hidden" 
                                                checked={rememberMe} 
                                                onChange={() => setRememberMe(!rememberMe)} 
                                            />
                                        </div>
                                        <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors">Remember me</span>
                                    </label>

                                    {/* Security Status Badge */}
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.02] border border-white/5 mx-2">
                                        <div className="w-1 h-1 rounded-full bg-[#00FF88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,0.8)]" />
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">Secured</span>
                                    </div>

                                    <Link to="/forgot-password" className="text-xs text-white/40 hover:text-[#00FF88] transition-colors font-medium">
                                        Forgot password?
                                    </Link>
                                </div>

                                {/* Login Button */}
                                <motion.button
                                    type="submit"
                                    disabled={loading}
                                    className="group relative w-full bg-[#00FF88] text-black font-black py-4 rounded-xl shadow-[0_4px_20px_rgba(0,255,136,0.2)] hover:shadow-[0_8px_30px_rgba(0,255,136,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 mt-6 uppercase tracking-wider text-sm overflow-hidden"
                                >
                                    {/* Neon Sweep Animation */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                    
                                    {loading ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            Login to UI HUB <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </motion.button>
                            </form>

                        </motion.div>
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
                <div className="w-full h-full relative overflow-hidden group">
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
                                Access Locked — Login Required
                            </h2>
                            <p className="text-white/80 text-sm leading-snug mb-4 font-medium">
                                Stop wasting time writing UI code manually.<br/>
                                With UI HUB, you don’t build… you generate.<br/>
                                Just copy, paste, and start vibe coding like a pro.
                            </p>
                            
                            <div className="space-y-2 mb-6 text-sm text-white/60">
                                <p>Premium UI components</p>
                                <p>AI-powered prompts</p>
                                <p>Instant production-ready design</p>
                            </div>
                            
                            <p className="text-[#00FF88] text-sm font-bold mb-6">
                                Login now to unlock the experience.
                            </p>
                            
                            {/* Optional: User avatars / social proof */}
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 border-2 border-[#1E1E1E]" />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00FF88] to-cyan-500 border-2 border-[#1E1E1E]" />
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 border-2 border-[#1E1E1E] flex items-center justify-center">
                                        <span className="text-[9px] font-black">+2k</span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-1">
                                        {[1,2,3,4,5].map(i => <Sparkles key={i} size={10} className="text-[#00FF88]" />)}
                                    </div>
                                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold mt-1">Trusted by developers</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Global CSS fixes for scrollbar */}
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

export default LoginPage;
