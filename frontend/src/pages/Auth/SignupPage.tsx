import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Sparkles, Mail, Lock, User, AlertCircle, Loader2, Zap, Github, ArrowRight, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const navigate = useNavigate();

    // Improved mobile detection to include touch points and viewport width
    const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                    (navigator.maxTouchPoints > 0) || 
                    (window.innerWidth < 768);

    // The AuthProvider handles Google/GitHub redirect results globally.
    // If the user is already authenticated (or becomes authenticated via the redirect result),
    // this effect will automatically navigate them to the home page.
    useEffect(() => {
        if (auth?.currentUser) {
            navigate('/');
        }
    }, [navigate]);

    const handleSocialSignIn = async (providerType: 'google' | 'github') => {
        setError('');
        setSocialLoading(providerType);
        const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

        try {
            console.log(`[Auth] Initiating popup flow for ${providerType}`);
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                navigate('/');
            }
        } catch (err: any) {
            console.error(`[Auth] ${providerType} sign-up failed:`, err);
            // If the popup is blocked, we inform the user to allow popups for authentication.
            if (err.code === 'auth/popup-blocked') {
                setError('Sign-up popup was blocked by your browser. Please allow popups for this site and try again.');
            } else {
                setError(formatAuthError(err.message) || `Failed to sign up with ${providerType}.`);
            }
        } finally {
            setSocialLoading(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, {
                displayName: name
            });
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError(formatAuthError(err.message) || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const socialButtonVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        hover: { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
        tap: { scale: 0.98 }
    };

    return (
        <main className="min-h-screen pt-20 md:pt-32 pb-10 md:pb-20 px-4 flex items-center justify-center relative overflow-hidden bg-[#020202]">
            <Link
                to="/"
                className="absolute top-8 left-8 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all group"
            >
                <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Home</span>
            </Link>
            {/* Immersive Background */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-green/10 blur-[150px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay" />

            <div className="w-full max-w-lg relative z-10">
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                    >
                        <Sparkles size={14} />
                        <span>Join the Elite Elite</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', damping: 20 }}
                        className="text-4xl md:text-6xl font-display font-black mb-4 tracking-tighter leading-tight"
                    >
                        CREATE <span className="text-brand-green text-glow">UI HUB</span> ACCOUNT
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/40 font-medium text-base md:text-lg leading-relaxed max-w-sm md:max-w-md mx-auto"
                    >
                        Secure your spot in the most advanced UI component library.
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-[2rem] md:rounded-[3rem] p-2 md:p-4 border border-white/5 bg-[#080808]/60 backdrop-blur-3xl shadow-[0_30px_80px_rgba(0,0,0,0.4)]"
                >
                    <div className="p-6 md:p-8">
                        {/* Social Buttons Container */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            <motion.button
                                variants={socialButtonVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                whileTap="tap"
                                transition={{ delay: 0.4 }}
                                onClick={() => handleSocialSignIn('google')}
                                disabled={!!socialLoading}
                                className="group relative flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 hover:border-brand-green/30 text-white font-black uppercase tracking-widest text-[10px] py-5 px-4 rounded-2xl transition-all disabled:opacity-50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-green/0 via-brand-green/5 to-brand-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {socialLoading === 'google' ? (
                                    <Loader2 size={18} className="animate-spin text-brand-green" />
                                ) : (
                                    <>
                                        <svg viewBox="0 0 24 24" width="20" height="20" className="group-hover:scale-110 transition-transform duration-300">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Continue with Google
                                    </>
                                )}
                            </motion.button>

                            <motion.button
                                variants={socialButtonVariants}
                                initial="initial"
                                animate="animate"
                                whileHover="hover"
                                whileTap="tap"
                                transition={{ delay: 0.5 }}
                                onClick={() => handleSocialSignIn('github')}
                                disabled={!!socialLoading}
                                className="group relative flex items-center justify-center gap-3 bg-white/[0.03] border border-white/10 hover:border-brand-green/30 text-white font-black uppercase tracking-widest text-[10px] py-5 px-4 rounded-2xl transition-all disabled:opacity-50 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-green/0 via-brand-green/5 to-brand-green/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {socialLoading === 'github' ? (
                                    <Loader2 size={18} className="animate-spin text-brand-green" />
                                ) : (
                                    <>
                                        <Github size={20} className="group-hover:scale-110 transition-transform duration-300" />
                                        Continue with GitHub
                                    </>
                                )}
                            </motion.button>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.55 }}
                            className="flex items-center gap-4 mb-8"
                        >
                            <div className="h-px bg-white/5 flex-1" />
                            <div className="flex items-center gap-2">
                                <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-center">Sign up with UI Hub</span>
                                <div className="px-2 py-0.5 rounded-md bg-brand-green/20 border border-brand-green/30 text-[8px] font-black text-brand-green uppercase tracking-tighter shadow-[0_0_10px_rgba(0,255,0,0.1)]">Official</div>
                            </div>
                            <div className="h-px bg-white/5 flex-1" />
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-start gap-3"
                                >
                                    <AlertCircle size={16} className="shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="space-y-3"
                            >
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Entity Name</label>
                                <div className="relative group">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={20} />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-green/30 focus:bg-[#0c0c0c] focus:ring-1 focus:ring-brand-green/20 transition-all shadow-inner"
                                    />
                                    <div className="absolute inset-0 rounded-2xl border border-brand-green/0 group-focus-within:border-brand-green/20 pointer-events-none transition-all" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.65 }}
                                className="space-y-3"
                            >
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Universal Identifier</label>
                                <div className="relative group">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={20} />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="johndoe@example.com"
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-green/30 focus:bg-[#0c0c0c] focus:ring-1 focus:ring-brand-green/20 transition-all shadow-inner"
                                    />
                                    <div className="absolute inset-0 rounded-2xl border border-brand-green/0 group-focus-within:border-brand-green/20 pointer-events-none transition-all" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-3"
                            >
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-green/30 focus:bg-[#0c0c0c] focus:ring-1 focus:ring-brand-green/20 transition-all shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <div className="absolute inset-0 rounded-2xl border border-brand-green/0 group-focus-within:border-brand-green/20 pointer-events-none transition-all" />
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.75 }}
                                className="space-y-3"
                            >
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Confirm Access Key</label>
                                <div className="relative group">
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-green transition-colors" size={20} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-[#0a0a0a] border border-white/5 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-white/10 focus:outline-none focus:border-brand-green/30 focus:bg-[#0c0c0c] focus:ring-1 focus:ring-brand-green/20 transition-all shadow-inner"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                    <div className="absolute inset-0 rounded-2xl border border-brand-green/0 group-focus-within:border-brand-green/20 pointer-events-none transition-all" />
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                type="submit"
                                disabled={loading}
                                className="group relative w-full bg-brand-green text-black font-black py-5 rounded-2xl shadow-[0_15px_40px_rgba(0,255,0,0.2)] hover:shadow-[0_0_50px_rgba(0,255,0,0.4)] hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 mt-8 uppercase tracking-widest text-xs overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                                {loading ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Authorize UI Hub Identity <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                        </form>

                        <div className="mt-12 pt-8 border-t border-white/5 text-center">
                            <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                                Already Inducted?
                            </p>
                            <Link to="/login" className="inline-flex items-center gap-2 text-brand-green hover:text-white transition-colors group px-6 py-3 rounded-xl bg-brand-green/5 border border-brand-green/10 hover:bg-brand-green/10">
                                <span className="text-[10px] font-black uppercase tracking-widest font-heading">Return to Vault</span>
                                <Zap size={14} className="group-hover:rotate-12 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
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

export default SignupPage;
