import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff, User } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import KineticGrid from '../../components/ui/KineticGrid';
import { useIsMobile } from '../../hooks/use-mobile';

const SignupPage = () => {
    const isMobile = useIsMobile();
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
    const { user } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleSignUp = async () => {
        setError('');
        setSocialLoading('google');

        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            if (result.user) {
                navigate('/');
            }
        } catch (err: any) {
            if (err.code === 'auth/popup-blocked') {
                setError('Popup blocked! Please allow popups for this site to sign up.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google sign-up is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.');
            } else if (err.code === 'auth/configuration-not-found') {
                setError('Firebase configuration for Google sign-up is missing. Please check your settings.');
            } else {
                setError(formatAuthError(err.message) || 'Failed to sign up with Google.');
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
            setError(formatAuthError(err.message) || 'Failed to create account. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const GoogleIcon = (
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.15v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.15C1.43 8.55 1 10.22 1 12s.43 3.45 1.15 4.93l3.69-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.15 7.07l3.69 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
    );

    return (
        <main className="relative min-h-screen w-full pt-16 flex items-center justify-center bg-brand-black text-white font-sans overflow-x-hidden px-4 py-10">
            {/* Animated Background */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <KineticGrid
                    background="#050A14"
                    dotColor="#C9D6E8"
                    lineColor="#3D5CFF"
                    trailColor="#2664EB"
                    spacing={isMobile ? 44 : 64}
                    radius={isMobile ? 180 : 320}
                    strength={4}
                    trail
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.45),transparent_70%)] pointer-events-none" />
            </div>

            <div className="relative z-10 w-full max-w-[440px]">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <Logo showText={true} />
                    </Link>
                </div>

                {/* Auth Card */}
                <div className="rounded-lg border-2 border-white bg-brand-surface brutal-shadow-black p-6 sm:p-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1.5 font-heading">
                            GET STARTED
                        </h2>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                            Create your account in under 30 seconds
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

                    {/* Google Sign Up */}
                    <button
                        type="button"
                        onClick={handleGoogleSignUp}
                        disabled={!!socialLoading}
                        className="w-full bg-white hover:bg-neutral-100 text-black border-2 border-black rounded-lg py-3 px-4 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {socialLoading === 'google' ? <Loader2 size={16} className="animate-spin text-black" /> : (
                            <>
                                {GoogleIcon}
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="relative my-6 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-neutral-800" />
                        </div>
                        <span className="relative bg-brand-surface px-3 text-[10px] font-black uppercase tracking-wider text-neutral-500 font-mono">
                            OR SIGN UP WITH EMAIL
                        </span>
                    </div>

                    {/* Sign Up Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-white block">
                                FULL NAME
                            </label>
                            <div className="relative">
                                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" size={16} />
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-white block">
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
                                    className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-3 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Password & Confirm Password */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-white block">
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
                                        className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-9 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-white block">
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
                                        className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-9 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-neutral-500 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
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
                                    <span>CREATE FREE ACCOUNT</span>
                                    <ArrowRight size={14} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Switch Link */}
                <div className="mt-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        ALREADY HAVE AN ACCOUNT?{' '}
                        <Link to="/login" className="text-brand-yellow hover:underline font-black">
                            LOG IN HERE →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default SignupPage;