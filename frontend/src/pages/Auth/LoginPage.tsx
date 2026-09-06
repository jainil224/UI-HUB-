import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { Mail, Lock, AlertCircle, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { formatAuthError } from '../../utils/authUtils';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../components/ui/Logo';
import TwinGalaxyRings from '../../components/ui/TwinGalaxyRings';
import { useIsMobile } from '../../hooks/use-mobile';

const LoginPage = () => {
    const isMobile = useIsMobile();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
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

    const handleGoogleSignIn = async () => {
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
                setError('Popup blocked! Please allow popups for this site to sign in.');
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                setError('An account already exists with the same email address but different sign-in credentials. Please sign in using the correct provider.');
            } else if (err.code === 'auth/operation-not-allowed') {
                setError('Google sign-in is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.');
            } else if (err.code === 'auth/configuration-not-found') {
                setError('Firebase configuration for Google sign-in is missing. Please check your settings.');
            } else {
                setError(formatAuthError(err.message) || 'Failed to sign in with Google.');
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
            navigate('/');
        } catch (err: any) {
            setError(formatAuthError(err.message) || 'Failed to sign in. Please check your credentials.');
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
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-1.5 font-heading">
                            SIGN IN
                        </h2>
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest font-mono">
                            Enter credentials to access your console
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

                    {/* Google Sign In */}
                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
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
                            OR SIGN IN WITH EMAIL
                        </span>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
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
                                    className="w-full bg-brand-bg border-2 border-neutral-700 hover:border-white focus:border-white rounded-lg py-2.5 pl-10 pr-10 text-sm font-mono text-white placeholder:text-neutral-600 focus:outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2.5 text-neutral-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={() => setRememberMe(!rememberMe)}
                                    className="w-4 h-4 border-2 border-white accent-brand-blue rounded-none cursor-pointer bg-brand-bg"
                                />
                                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-300">REMEMBER ME</span>
                            </label>

                            <Link to="/forgot-password" className="text-[11px] font-black uppercase tracking-wider text-brand-blue hover:underline">
                                FORGOT PASSWORD?
                            </Link>
                        </div>

                        {/* Primary Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="brutal-btn-primary w-full py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <span>SIGN IN</span>
                                    <ArrowRight size={14} strokeWidth={3} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer Switch Link */}
                <div className="mt-6 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                        DON'T HAVE AN ACCOUNT?{' '}
                        <Link to="/signup" className="text-brand-yellow hover:underline font-black">
                            CREATE ONE FREE →
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
};

export default LoginPage;