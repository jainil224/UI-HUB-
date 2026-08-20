import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Search } from 'lucide-react';
import logo from '../../Assets/logo.png';
import PlanBadge, { PlanTier } from './PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import Toast from './Toast';
import { useSkeleton } from '../../context/SkeletonContext';
import { NavbarSkeleton } from './Skeleton';

const Navbar = () => {
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
        const shouldWelcome = sessionStorage.getItem('ui-hub-show-welcome');
        const isNewUser = sessionStorage.getItem('ui-hub-is-new-user');

        if (user && shouldWelcome === 'true') {
            if (isNewUser === 'true') {
                setToastMsg('WELCOME TO UI HUB');
            } else {
                setToastMsg(`WELCOME BACK, ${user.displayName?.split(' ')[0].toUpperCase() || 'AGENT'}`);
            }
            setShowToast(true);
            
            sessionStorage.removeItem('ui-hub-show-welcome');
            sessionStorage.removeItem('ui-hub-is-new-user');
        }

        if (prevUserRef.current && !user) {
            setToastMsg('LOGGED OUT');
            setShowToast(true);
        }

        prevUserRef.current = user;
    }, [user, loading]);

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
                    className="w-full fixed top-0 left-0 right-0 z-50"
                >
                    <NavbarSkeleton />
                </motion.div>
            ) : (
                <motion.header
                    key="navbar-real"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-black select-none"
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                        
                        {/* ── Brand Logo ── */}
                        <Link to="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="relative">
                                <img
                                    src={logo}
                                    alt="UI HUB Logo"
                                    className="w-8 h-8 rounded-sm object-contain"
                                />
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFC700] border-2 border-black shadow-[1px_1px_0px_0px_#000]" />
                            </div>
                            <span className="font-heading font-black text-2xl tracking-tight text-black uppercase">
                                UI HUB
                            </span>
                        </Link>

                        {/* ── Center Navigation Links ── */}
                        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
                            {[
                                { to: '/library', label: 'COMPONENTS', active: isLibrary },
                                { to: '/', label: 'HOW IT WORKS', active: location.pathname === '/' },
                                { to: '/pricing', label: 'PRICING', active: location.pathname === '/pricing' },
                                { to: '/favorites', label: 'FAVORITES', active: location.pathname === '/favorites' },
                            ].map(({ to, label, active }) => (
                                <Link
                                    key={to + label}
                                    to={to}
                                    className={`text-xs lg:text-sm font-black uppercase tracking-wider transition-colors ${
                                        active 
                                            ? 'text-[#1F4BFF]' 
                                            : 'text-black hover:text-[#1F4BFF]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </nav>

                        {/* ── Right Actions ── */}
                        <div className="flex items-center gap-3">
                            {/* Search (Desktop) */}
                            <form onSubmit={handleSearchSubmit} className="hidden xl:flex relative mr-1">
                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                    <Search size={13} className="text-neutral-500" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="SEARCH..."
                                    value={globalSearch}
                                    onChange={(e) => setGlobalSearch(e.target.value)}
                                    className="w-36 lg:w-44 bg-[#F5F5F5] border-2 border-black rounded-none py-1.5 pl-8 pr-2.5 text-xs font-mono font-bold text-black placeholder:text-neutral-400 focus:outline-none focus:bg-white focus:shadow-[2px_2px_0px_0px_#000000] transition-all uppercase"
                                />
                            </form>

                            {/* User Profile / Auth Action Buttons */}
                            {user ? (
                                <div className="flex items-center gap-2">
                                    <Link 
                                        to="/favorites"
                                        className="flex items-center gap-2 bg-white border-2 border-black py-1.5 px-2.5 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000000] transition-all"
                                    >
                                        <div className="w-6 h-6 rounded-none border border-black bg-[#1F4BFF] flex items-center justify-center overflow-hidden shrink-0">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="text-xs font-black uppercase tracking-tight text-black max-w-[80px] truncate">
                                            {user.displayName?.split(' ')[0] || 'USER'}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-[#FFC700] text-black border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                                            {planTier.toUpperCase()}
                                        </span>
                                    </Link>

                                    <button
                                        onClick={() => signOut(auth)}
                                        className="w-8 h-8 bg-white border-2 border-black flex items-center justify-center text-black hover:bg-[#E52520] hover:text-white shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                                        title="Sign Out"
                                    >
                                        <LogOut size={13} />
                                    </button>
                                </div>
                            ) : (
                                <div className="hidden sm:flex items-center gap-3">
                                    {/* SIGN IN Button */}
                                    <Link to="/login">
                                        <button className="bg-white hover:bg-neutral-50 text-black border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all">
                                            SIGN IN
                                        </button>
                                    </Link>

                                    {/* GET STARTED Button */}
                                    <Link to="/signup">
                                        <button className="bg-[#E52520] hover:bg-[#CC1E1A] text-white border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all">
                                            GET STARTED
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="md:hidden flex items-center justify-center w-9 h-9 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all"
                            >
                                <AnimatePresence mode="wait" initial={false}>
                                    {isOpen ? (
                                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <X size={18} />
                                        </motion.span>
                                    ) : (
                                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                                            <Menu size={18} />
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>

                    {/* ── Mobile Drawer ── */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="border-t-2 border-black bg-white px-6 py-5 flex flex-col gap-3 md:hidden shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]"
                            >
                                {/* Mobile User Info */}
                                {user && (
                                    <Link 
                                        to="/favorites" 
                                        onClick={() => setIsOpen(false)}
                                        className="p-3 border-2 border-black bg-[#FFFDF0] flex items-center justify-between shadow-[3px_3px_0px_0px_#000000] mb-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-black bg-[#1F4BFF] flex items-center justify-center overflow-hidden">
                                                {user.photoURL ? (
                                                    <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={16} className="text-white" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase text-black">{user.displayName || 'USER'}</p>
                                                <p className="text-[10px] text-neutral-500 font-mono">{user.email}</p>
                                            </div>
                                        </div>
                                        <PlanBadge tier={planTier} size="sm" showIcon className="shrink-0" />
                                    </Link>
                                )}

                                {/* Links */}
                                <div className="flex flex-col gap-2">
                                    {[
                                        { to: '/library', label: 'COMPONENTS', active: isLibrary },
                                        { to: '/', label: 'HOW IT WORKS', active: location.pathname === '/' },
                                        { to: '/pricing', label: 'PRICING', active: location.pathname === '/pricing' },
                                        { to: '/favorites', label: 'FAVORITES', active: location.pathname === '/favorites' },
                                    ].map(({ to, label, active }) => (
                                        <Link
                                            key={'m-' + to + label}
                                            to={to}
                                            onClick={() => setIsOpen(false)}
                                            className={`py-2.5 px-3 border-2 text-xs font-black uppercase tracking-wider transition-all ${
                                                active
                                                    ? 'bg-[#1F4BFF] text-white border-black shadow-[3px_3px_0px_0px_#000000]'
                                                    : 'bg-white text-black border-neutral-300 hover:border-black'
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    ))}
                                </div>

                                {/* Bottom Auth Action */}
                                <div className="pt-3 border-t-2 border-black flex gap-3">
                                    {user ? (
                                        <button
                                            onClick={() => {
                                                signOut(auth);
                                                setIsOpen(false);
                                            }}
                                            className="w-full bg-[#E52520] hover:bg-[#CC1E1A] text-white border-2 border-black py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={14} />
                                            <span>SIGN OUT</span>
                                        </button>
                                    ) : (
                                        <>
                                            <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1">
                                                <button className="w-full bg-white hover:bg-neutral-50 text-black border-2 border-black py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]">
                                                    SIGN IN
                                                </button>
                                            </Link>
                                            <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1">
                                                <button className="w-full bg-[#E52520] hover:bg-[#CC1E1A] text-white border-2 border-black py-2.5 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000]">
                                                    GET STARTED
                                                </button>
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Global Toast */}
                    <Toast 
                        isVisible={showToast} 
                        message={toastMsg} 
                        onClose={() => setShowToast(false)} 
                    />
                </motion.header>
            )}
        </AnimatePresence>
    );
};

export default Navbar;
