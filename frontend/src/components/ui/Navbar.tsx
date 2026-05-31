import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Github, Menu, X, Sparkles, LogOut, User as UserIcon, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from './Logo';
import PlanBadge, { PlanTier } from './PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import Toast from './Toast';
import { useSkeleton } from '../../context/SkeletonContext';
import { NavbarSkeleton } from './Skeleton';

const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const center = { x: left + width / 2, y: top + height / 2 };
        const distance = { x: clientX - center.x, y: clientY - center.y };

        // Only pull if mouse is close enough
        const pullFactor = 0.4;
        x.set(distance.x * pullFactor);
        y.set(distance.y * pullFactor);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className={`relative overflow-hidden flex items-center gap-1.5 bg-brand-green text-black px-5 py-2 rounded-full text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] active:scale-95 ${className}`}
        >
            {/* Holographic Shimmer Layer */}
            <motion.div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={false}
                whileHover={{ opacity: 1 }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    animate={{
                        x: ['-200%', '200%'],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                {/* Iridescent Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 via-purple-400/20 via-pink-400/20 to-transparent mix-blend-overlay opacity-50" />
            </motion.div>

            {children}

            {/* Standard Shine (keeping existing logic for extra flair) */}
            <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                initial={{ x: '-150%' }}
                whileHover={{ x: '150%' }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
        </motion.button>
    );
};

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isPro, isElite, loading } = useAuth();
    const { isLoading } = useSkeleton();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isLibrary = location.pathname.startsWith('/library');
    const [globalSearch, setGlobalSearch] = useState('');
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (globalSearch.trim()) {
            navigate(`/library?q=${encodeURIComponent(globalSearch.trim())}`);
        }
    };

    // Welcome Toast Logic
    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const prevUserRef = useRef<any>(undefined);

    React.useEffect(() => {
        // 1. Show Welcome Toast IF we are logged in AND the auth pages set the welcome flag
        const shouldWelcome = sessionStorage.getItem('ui-hub-show-welcome');
        const isNewUser = sessionStorage.getItem('ui-hub-is-new-user');

        if (user && shouldWelcome === 'true') {
            if (isNewUser === 'true') {
                setToastMsg('WELCOME TO UI HUB');
            } else {
                setToastMsg(`WELCOME BACK, ${user.displayName?.split(' ')[0].toUpperCase() || 'AGENT'}`);
            }
            setShowToast(true);
            
            // Cleanup all flags
            sessionStorage.removeItem('ui-hub-show-welcome');
            sessionStorage.removeItem('ui-hub-is-new-user');
        }

        // 2. Show Logout Toast when transitioning from user -> null
        if (prevUserRef.current && !user) {
            setToastMsg('LOGGED OUT');
            setShowToast(true);
        }

        prevUserRef.current = user;
    }, [user, loading]);

    // Determine plan tier for badge
    const planTier: PlanTier = isElite ? 'elite' : isPro ? 'pro' : 'free';

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="navbar-skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full"
                >
                    <NavbarSkeleton />
                </motion.div>
            ) : (
                <motion.nav
                    key="navbar-real"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-0"
                >
            {/* Floating pill navbar */}
            <div className="relative overflow-hidden max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                {/* Glossy Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] to-transparent pointer-events-none" />

                {/* Animated Liquid Glow */}
                <motion.div
                    animate={{
                        x: [-20, 20],
                        y: [-10, 10],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        repeatType: "reverse",
                        ease: "easeInOut"
                    }}
                    className="absolute -top-1/2 -left-1/4 w-full h-[200%] bg-brand-green/10 blur-[100px] rounded-full pointer-events-none opacity-40"
                />

                {/* ── Logo ── */}
                <Link to="/" className="relative z-10 flex items-center gap-2.5 group shrink-0">
                    <div className="relative">
                        <div className={`absolute inset-0 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${theme === 'dark' ? 'bg-brand-green/40' : 'bg-[#5FA3D6]/40'}`} />
                        <Logo />
                    </div>
                    <span className={`font-heading font-black text-lg tracking-tight transition-colors duration-300 ${
                        theme === 'dark' ? 'text-white group-hover:text-brand-green' : 'text-[#0A0F14] group-hover:text-[#2C5C85]'
                    }`}>
                        UI HUB
                    </span>
                </Link>

                {/* ── Desktop nav links (pill switcher) ── */}
                <div className={`relative z-10 hidden md:flex items-center gap-0.5 border rounded-full px-1.5 py-1 ${
                    theme === 'dark' ? 'bg-white/[0.05] border-white/10' : 'bg-black/[0.05] border-black/10'
                }`}>
                    {[
                        { to: '/', label: 'Home', active: location.pathname === '/' },
                        { to: '/library', label: 'Component Library', active: isLibrary },
                        { to: '/pricing', label: 'Pricing', active: location.pathname === '/pricing' },
                        { to: '/favorites', label: 'Favorites', active: location.pathname === '/favorites' },
                    ].map(({ to, label, active }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                active 
                                ? 'text-black' 
                                : theme === 'dark' ? 'text-white/50 hover:text-white' : 'text-black/50 hover:text-black'
                            }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="nav-active-pill"
                                    className={`absolute inset-0 rounded-full shadow-[0_0_18px_rgba(0,255,0,0.5)] ${theme === 'dark' ? 'bg-brand-green' : 'bg-[#5FA3D6]'}`}
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10" style={{ display: 'inline-block' }}>{label}</span>
                        </Link>
                    ))}
                </div>

                {/* ── Right Actions ── */}
                <div className="relative z-10 flex items-center gap-2.5">
                    {/* Global Search */}
                    <form onSubmit={handleSearchSubmit} className="hidden lg:flex relative mr-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={14} className={theme === 'dark' ? 'text-white/40' : 'text-black/40'} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search components..."
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            className={`w-48 xl:w-64 border rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none transition-all ${
                                theme === 'dark' 
                                ? 'bg-white/[0.03] border-white/[0.08] text-white placeholder-white/30 focus:border-brand-green/40 focus:bg-white/[0.05]' 
                                : 'bg-black/[0.03] border-black/[0.08] text-black placeholder-black/30 focus:border-[#5FA3D6]/40 focus:bg-black/[0.05]'
                            }`}
                        />
                    </form>



                    {/* Get Started / User Menu */}
                    {user ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`relative flex items-center gap-1 md:gap-1.5 p-1 rounded-2xl bg-white/[0.03] border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:bg-white/[0.05] transition-all duration-300 group/capsule overflow-hidden ${
                                isElite
                                    ? 'border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                                    : isPro
                                    ? 'border-brand-green/40 shadow-[0_0_20px_rgba(0,255,159,0.2)]'
                                    : ''
                            }`}
                        >
                            {/* Desktop Click-to-Profile Overlay (excludes logout area) */}
                            <Link 
                                to="/favorites" 
                                className="absolute inset-y-0 left-0 right-10 z-0 bg-transparent group-hover/capsule:bg-white/[0.02] transition-colors"
                                title="View Profile"
                            />

                            {/* Background Effects */}
                            {isElite ? (
                                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_100deg,#3b82f6_180deg,transparent_260deg,transparent_360deg)] opacity-70 blur-lg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-blue-500/10 opacity-70" />
                                </div>
                            ) : isPro ? (
                                <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_120deg,#00ff9f_180deg,transparent_240deg,transparent_360deg)] opacity-60 blur-lg"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-green/20 via-transparent to-brand-green/10 opacity-70" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 -z-10 bg-white/[0.01] blur-xl opacity-30 pointer-events-none group-hover/capsule:bg-brand-green/5 transition-colors" />
                            )}

                            {/* Avatar with tier ring */}
                            <div className={`relative flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-[11px] overflow-hidden transition-transform duration-300 group-hover/capsule:scale-105 ${
                                isElite
                                    ? 'border-2 border-blue-500/70 shadow-[0_0_16px_rgba(59,130,246,0.5)]'
                                    : isPro
                                    ? 'border-2 border-brand-green/50 shadow-[0_0_16px_rgba(0,255,159,0.4)]'
                                    : 'border border-white/10'
                            } ${
                                isElite
                                    ? 'bg-gradient-to-br from-blue-500/30 to-blue-900/20'
                                    : isPro
                                    ? 'bg-gradient-to-br from-brand-green/40 to-brand-green/10'
                                    : 'bg-gradient-to-br from-white/10 to-white/5'
                            }`}>
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={12} className={`md:w-3.5 md:h-3.5 ${
                                        isElite ? 'text-blue-400' : isPro ? 'text-brand-green' : 'text-white/50'
                                    }`} />
                                )}
                                {/* Shimmer for Pro/Elite */}
                                {(isPro || isElite) && (
                                    <motion.div
                                        animate={{ x: ['-200%', '200%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none"
                                    />
                                )}
                            </div>

                            {/* User Info + Badge */}
                            <div className="relative z-10 flex flex-col pr-1 md:pr-2 pl-0.5 md:pl-1 pointer-events-none">
                                <span className={`text-[10px] md:text-[11px] font-black tracking-tight leading-tight truncate max-w-[50px] sm:max-w-[60px] md:max-w-[80px] ${
                                    isElite ? 'text-blue-400' : isPro ? 'text-brand-green' : 'text-white'
                                }`}>
                                    {user.displayName?.split(' ')[0] || 'Member'}
                                </span>
                                <PlanBadge tier={planTier} size="sm" showIcon animated />
                            </div>

                            {/* Logout Action */}
                            <button
                                onClick={() => signOut(auth)}
                                className="relative z-10 flex items-center justify-center w-7 h-7 rounded-[10px] bg-white/[0.06] border border-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-300"
                                title="Sign Out"
                            >
                                <LogOut size={13} />
                            </button>
                        </motion.div>
                    ) : (
                        <Link to="/login">
                            <MagneticButton className="hidden sm:flex group">
                                <Sparkles size={12} className="shrink-0 relative z-10" />
                                <span className="relative z-10">Sign In</span>
                            </MagneticButton>
                        </Link>
                    )}

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isOpen
                                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.span>
                                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={18} /></motion.span>
                            }
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* ── Mobile Dropdown ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="mt-2 max-w-7xl mx-auto rounded-2xl bg-[#080808]/95 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                    >
                        {/* ── User Profile (Mobile) ── */}
                        {user && (
                            <Link 
                                to="/favorites" 
                                onClick={() => setIsOpen(false)}
                                className={`block p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] relative overflow-hidden transition-all duration-500 mb-2 group/mobile-profile ${
                                isElite ? 'border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 
                                isPro ? 'border-brand-green/20 shadow-[0_0_20px_rgba(0,255,0,0.1)]' : ''
                            }`}>
                                {/* Animated Glow backgrounds */}
                                {isElite ? (
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-blue-500/10 via-transparent to-blue-500/5 opacity-50" />
                                ) : isPro ? (
                                    <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-brand-green/10 via-transparent to-brand-green/5 opacity-50" />
                                ) : null}

                                <div className="flex items-center gap-4 relative z-10 w-full">
                                    {/* Avatar */}
                                    <div className={`shrink-0 w-12 h-12 rounded-xl overflow-hidden border ${
                                        isElite ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                                        isPro ? 'border-brand-green/40 shadow-[0_0_15px_rgba(0,255,0,0.2)]' : 'border-white/10'
                                    }`}>
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-white/[0.05]">
                                                <UserIcon size={20} className="text-white/30" />
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Name & Plan info */}
                                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-sm font-black tracking-tight truncate ${
                                                isElite ? 'text-blue-400' : isPro ? 'text-brand-green' : 'text-white'
                                            }`}>
                                                {user.displayName || 'Authorized Member'}
                                            </span>
                                            <PlanBadge tier={planTier} size="sm" showIcon animated className="shrink-0" />
                                        </div>
                                        <span className="text-[10px] text-white/40 font-medium break-all">{user.email}</span>
                                    </div>
                                    
                                    <div className="shrink-0 pl-1 text-[9px] font-bold text-white/30 group-hover/mobile-profile:text-white/70 uppercase tracking-wider flex items-center justify-center transition-colors">
                                        Profile
                                    </div>
                                </div>
                            </Link>
                        )}

                        <div className="flex flex-col gap-1.5">
                            {[
                                { to: '/', label: 'Home', active: location.pathname === '/' },
                                { to: '/library', label: 'Component Library', active: isLibrary },
                                { to: '/pricing', label: 'Pricing', active: location.pathname === '/pricing' },
                                { to: '/favorites', label: 'Favorites', active: location.pathname === '/favorites' },
                            ].map(({ to, label, active }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                        ? 'bg-brand-green/10 text-brand-green border border-brand-green/25 shadow-[0_0_12px_rgba(0,255,0,0.1)]'
                                        : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/[0.07]">
                            {user ? (
                                <button
                                    onClick={() => {
                                        signOut(auth);
                                        setIsOpen(false);
                                    }}
                                    className="flex items-center justify-center gap-1.5 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2.5 rounded-xl text-sm font-bold flex-1"
                                >
                                    <LogOut size={13} /> Sign Out
                                </button>
                            ) : (
                                <Link 
                                    to="/login" 
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-brand-green text-black px-4 py-2.5 rounded-xl text-sm font-bold active:scale-[0.98] transition-all shadow-[0_4_12px_rgba(0,255,0,0.2)]"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Sparkles size={13} /> Sign In
                                </Link>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Global Welcome/Logout Toast */}
            <Toast 
                isVisible={showToast} 
                message={toastMsg} 
                onClose={() => setShowToast(false)} 
            />
                </motion.nav>
            )}
        </AnimatePresence>
    );
};

export default Navbar;
