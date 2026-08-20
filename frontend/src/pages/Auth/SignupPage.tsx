import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, Lock, AlertCircle, Loader2, Github, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import { getApiBaseUrl } from '../../utils/apiConfig';

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
        const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();

        try {
            console.log(`[Auth] Attempting ${providerType} sign-up...`);
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                console.log(`[Auth] ${providerType} sign-up successful:`, result.user.email);
                
                // AuthContext will handle the sync seamlessly.

                navigate('/');
            }
        } catch (err: any) {
            console.error(`[Auth] ${providerType} sign-up failed:`, err);
            
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site to sign up.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError(`${providerType.toUpperCase()} is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.`);
            } else if (err.code === 'auth/configuration-not-found') {
                setError(`Firebase configuration for ${providerType} is missing. Please check your settings.`);
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

            // AuthContext will handle the sync seamlessly upon successful sign up.

            navigate('/');
        } catch (err: any) {
            setError(formatAuthError(err.message) || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const socialButtonVariants = {
        hover: { scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
        tap: { scale: 0.98 }
    };

    return (
        <main className="min-h-screen w-full pt-16 flex flex-col lg:flex-row bg-[#EBEBEB] text-black font-sans overflow-x-hidden select-none">
            
            {/* ========================================================
                LEFT SIDE: Bauhaus Graphic Column (50% Width) - Crimson Red
                ======================================================== */}
            <div className="w-full lg:w-1/2 min-h-[420px] lg:min-h-[calc(100vh-64px)] bg-[#E52520] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden border-b-4 lg:border-b-0 lg:border-r-4 border-black">
                
                {/* Dotted Grid Background */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-35"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #FFFFFF 1.5px, transparent 1.5px)',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Floating Bauhaus Geometric Shapes */}
                <div className="absolute top-12 right-12 w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#1F4BFF] border-2 border-black shadow-[4px_4px_0px_0px_#000000] pointer-events-none z-10" />
                <div className="absolute -bottom-6 right-20 w-24 h-24 bg-[#FFC700] border-2 border-black shadow-[4px_4px_0px_0px_#000000] rotate-45 pointer-events-none z-10 hidden sm:block" />

                {/* Top Logo & Portal Badge */}
                <div className="relative z-20 flex items-center gap-3 flex-wrap">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                    <div className="px-2.5 py-0.5 bg-[#FFC700] text-black border-2 border-black font-mono font-black text-[10px] uppercase tracking-wider shadow-[2px_2px_0px_0px_#000000]">
                        REGISTRATION PORTAL
                    </div>
                </div>

                {/* Big Bold Headline */}
                <div className="relative z-20 my-auto py-10 max-w-lg">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] mb-6">
                        CREATE YOUR<br />
                        <span className="text-[#FFC700]">ACCOUNT.</span>
                    </h1>
                    <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed max-w-md">
                        Instant onboarding for developers and creators. Zero subscription lock-in, production-ready TypeScript, and unlimited vibe coding.
                    </p>
                </div>

                {/* Bottom Navigation & Sub-badge */}
                <div className="relative z-20 pt-6 border-t border-white/20 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/80">
                    <Link to="/" className="inline-flex items-center gap-2 hover:text-[#FFC700] transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                        <span>Back to Home</span>
                    </Link>
                    <span className="font-mono text-[10px] text-white/60">SYSTEM ID // REG-2026</span>
                </div>
            </div>

            {/* ========================================================
                RIGHT SIDE: Off-white Form Column (50% Width)
                ======================================================== */}
            <div className="w-full lg:w-1/2 min-h-screen bg-[#EBEBEB] flex flex-col justify-center items-center p-6 md:p-12 lg:p-16">
                
                {/* Header */}
                <div className="w-full max-w-[440px] text-center mb-6">
                    <h2 className="text-3xl sm:text-4xl font-black text-black uppercase tracking-tight mb-1 font-heading">
                        GET STARTED
                    </h2>
                    <p className="text-[11px] font-bold text-neutral-600 uppercase tracking-widest font-mono">
                        Create your account in under 30 seconds
                    </p>
                </div>

                {/* Central High-Contrast Brutalist Card */}
                <div className="w-full max-w-[440px] bg-white border-2 border-black p-6 sm:p-8 shadow-[6px_6px_0px_0px_#000000]">
                    
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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Full Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                                FULL NAME
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Walter Gropius"
                                    className="w-full bg-white border-2 border-black py-2.5 pl-10 pr-3 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF0] focus:shadow-[2px_2px_0px_0px_#000000] transition-all"
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="user@example.com"
                                    className="w-full bg-white border-2 border-black py-2.5 pl-10 pr-3 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF0] focus:shadow-[2px_2px_0px_0px_#000000] transition-all"
                                />
                            </div>
                        </div>

                        {/* Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                                    PASSWORD
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border-2 border-black py-2.5 pl-10 pr-9 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF0] focus:shadow-[2px_2px_0px_0px_#000000] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-black block">
                                    CONFIRM
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full bg-white border-2 border-black py-2.5 pl-10 pr-9 text-sm font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:bg-[#FFFDF0] focus:shadow-[2px_2px_0px_0px_#000000] transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>
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
                                    <span>CREATE FREE ACCOUNT</span>
                                    <ArrowRight size={14} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-5 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-black" />
                        </div>
                        <span className="relative bg-white px-3 text-[10px] font-black uppercase tracking-wider text-neutral-600 font-mono">
                            OR REGISTER WITH
                        </span>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <button
                            type="button"
                            onClick={() => handleSocialSignIn('google')}
                            disabled={!!socialLoading}
                            className="w-full bg-white hover:bg-neutral-50 text-black border-2 border-black py-2.5 px-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {socialLoading === 'google' ? <Loader2 size={14} className="animate-spin text-black" /> : (
                                <>
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span className="text-[11px]">GOOGLE</span>
                                </>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => handleSocialSignIn('github')}
                            disabled={!!socialLoading}
                            className="w-full bg-white hover:bg-neutral-50 text-black border-2 border-black py-2.5 px-3 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {socialLoading === 'github' ? <Loader2 size={14} className="animate-spin text-black" /> : (
                                <>
                                    <Github className="w-4 h-4 text-black shrink-0" />
                                    <span className="text-[11px]">GITHUB</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Footer Switch Link */}
                <div className="mt-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-black">
                        ALREADY HAVE AN ACCOUNT?{' '}
                        <Link to="/login" className="text-[#1F4BFF] hover:underline font-black">
                            LOG IN HERE →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default SignupPage;
