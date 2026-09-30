import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, X, LogOut, User as UserIcon, Heart, Trash2,
    ArrowUpRight, ChevronDown, Grid2X2, PanelsTopLeft,
    LayoutTemplate, Sparkles,
} from 'lucide-react';
import logo from '../../Assets/webiste logo.svg';
import PlanBadge, { PlanTier } from './PlanBadge';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import Toast from './Toast';
import { useSkeleton } from '../../context/SkeletonContext';
import { NavbarSkeleton } from './Skeleton';
import { getUserFavorites, removeFromFavorites, FavoriteItem } from '../../services/favorites';

const SECTIONS_ANCHOR = '/build-with-ui-hub';

const Navbar = () => {
    const { user, isPro, loading, planType } = useAuth();
    const { isLoading } = useSkeleton();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isLibrary = location.pathname.startsWith('/library');
    const isHomePage = location.pathname === '/';
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [showFavDropdown, setShowFavDropdown] = useState(false);
    const favDropdownRef = useRef<HTMLDivElement>(null);
    const [showLibrariesDropdown, setShowLibrariesDropdown] = useState(false);
    const librariesDropdownRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => {
        const unsub = getUserFavorites(user?.uid, (data) => { setFavorites(data || []); });
        return () => { if (typeof unsub === 'function') unsub(); };
    }, [user?.uid]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (favDropdownRef.current && !favDropdownRef.current.contains(e.target as Node)) setShowFavDropdown(false);
        };
        if (showFavDropdown) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFavDropdown]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (librariesDropdownRef.current && !librariesDropdownRef.current.contains(e.target as Node)) setShowLibrariesDropdown(false);
        };
        if (showLibrariesDropdown) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLibrariesDropdown]);

    const isTemplates = location.pathname.startsWith('/templates');
    const isBuildWithUIHub = location.pathname.startsWith('/build-with-ui-hub');
    const isLibraryMenuActive = isLibrary || isTemplates || isBuildWithUIHub;
    const isMcp = location.pathname.startsWith('/dashboard/mcp') || location.pathname === '/mcp';
    const isPricing = location.pathname === '/pricing';

    const [showToast, setShowToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('');
    const prevUserRef = useRef<any>(undefined);

    useEffect(() => {
        const shouldWelcome = sessionStorage.getItem('ui-hub-show-welcome');
        if (user && shouldWelcome === 'true') {
            setToastMsg(`Welcome back, ${user.displayName?.split(' ')[0] || 'Agent'}`);
            setShowToast(true);
            sessionStorage.removeItem('ui-hub-show-welcome');
        }
        if (prevUserRef.current && !user) { setToastMsg('Signed out'); setShowToast(true); }
        prevUserRef.current = user;
    }, [user, loading]);

    const planTier: PlanTier = planType === 'custom' ? 'custom' : (isPro ? 'pro' : 'free');

    const glassBase = scrolled
        ? 'bg-[rgba(8,8,14,0.88)] backdrop-blur-2xl border-b border-white/[0.07]'
        : 'bg-[rgba(8,8,14,0.55)] backdrop-blur-xl border-b border-white/[0.04]';

    const linkCls = (active: boolean) =>
        `relative flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-semibold tracking-wide transition-all duration-200 rounded-full select-none cursor-pointer ${active ? 'text-white bg-white/[0.10] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.10)]' : 'text-white/55 hover:text-white hover:bg-white/[0.06]'}`;

    const LogoMark = ({ size = 'w-5 h-5' }: { size?: string }) => (
        <Link to="/" className="flex items-center shrink-0 select-none group" aria-label="UI HUB Home">
            <span className="relative flex items-center justify-center bg-[#1F4BFF] rounded-xl p-1.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(31,75,255,0.55)]">
                <img src={logo} alt="UI HUB Logo" className={`${size} object-contain`} />
            </span>
        </Link>
    );

    const ComponentsDropdown = () => (
        <div className="relative" ref={librariesDropdownRef}
            onMouseEnter={() => setShowLibrariesDropdown(true)}
            onMouseLeave={() => setShowLibrariesDropdown(false)}>
            <button type="button" onClick={() => setShowLibrariesDropdown(o => !o)}
                aria-haspopup="menu" aria-expanded={showLibrariesDropdown}
                className={linkCls(isLibraryMenuActive)}>
                {isLibraryMenuActive && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4BFF] shadow-[0_0_6px_#1F4BFF] shrink-0" />}
                Components
                <ChevronDown size={13} className={`opacity-40 transition-transform duration-200 ${showLibrariesDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {showLibrariesDropdown && (
                    <motion.div role="menu"
                        initial={{ opacity: 0, y: 8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.97 }} transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 top-full z-[80] mt-3 w-[285px] rounded-2xl border border-white/[0.08] bg-[rgba(10,10,18,0.97)] backdrop-blur-2xl p-2 shadow-[0_24px_60px_rgba(0,0,0,0.7)]">
                        <p className="px-3 pb-2 pt-2 text-[10px] font-semibold text-white/25 uppercase tracking-widest">Libraries</p>
                        {[
                            { to: '/library', label: 'Components', description: 'Ready-made UI building blocks', Icon: Grid2X2, color: '#1F4BFF' },
                            { to: '/templates', label: 'Templates', description: 'Complete pages to customize', Icon: LayoutTemplate, color: '#8B5CF6' },
                            { to: SECTIONS_ANCHOR, label: 'Build with UI HUB', description: 'Section-level layouts', Icon: PanelsTopLeft, color: '#06B6D4' },
                        ].map(({ to, label, description, Icon, color }) => (
                            <Link key={label} to={to} role="menuitem" onClick={() => setShowLibrariesDropdown(false)}
                                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.05] transition-colors">
                                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${color}1a`, color }}>
                                    <Icon size={16} />
                                </span>
                                <span className="min-w-0">
                                    <span className="block text-[13px] font-medium text-white/80 group-hover:text-white transition-colors">{label}</span>
                                    <span className="block truncate text-[11px] text-white/30">{description}</span>
                                </span>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );

    const FavoritesBlock = () =>
        isLibrary ? (
            <div className="relative" ref={favDropdownRef}>
                <button onClick={() => setShowFavDropdown(prev => !prev)} title="Saved Components" aria-label="Saved Components"
                    className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border cursor-pointer ${showFavDropdown ? 'bg-rose-500/15 border-rose-500/25 text-rose-400' : 'bg-white/[0.06] border-white/[0.07] text-white/40 hover:text-white hover:bg-white/[0.10]'}`}>
                    <Heart size={14} className={favorites.length > 0 ? 'fill-rose-400 text-rose-400' : ''} />
                    {favorites.length > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-0.5 bg-rose-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{favorites.length}</span>
                    )}
                </button>
                <AnimatePresence>
                    {showFavDropdown && (
                        <motion.div initial={{ opacity: 0, y: 8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }} transition={{ duration: 0.15 }}
                            className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-white/[0.07] bg-[rgba(10,10,18,0.97)] backdrop-blur-2xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] z-50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Heart size={12} className="fill-rose-400 text-rose-400" />
                                    <span className="text-[12px] font-semibold text-white/70">Saved</span>
                                    <span className="px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-mono text-white/35">{favorites.length}</span>
                                </div>
                                <button onClick={() => setShowFavDropdown(false)} className="text-white/25 hover:text-white/60 transition-colors cursor-pointer"><X size={13} /></button>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                                {favorites.length === 0 ? (
                                    <div className="py-8 flex flex-col items-center text-center">
                                        <Heart size={20} className="text-white/12 mb-2" />
                                        <p className="text-[12px] text-white/25">No favorites yet</p>
                                        <p className="text-[11px] text-white/15 mt-0.5">Click the heart on any component</p>
                                    </div>
                                ) : (
                                    favorites.map((fav) => (
                                        <div key={fav.componentId}
                                            onClick={() => { navigate(`/library?id=${fav.componentId}`); setShowFavDropdown(false); }}
                                            className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer group">
                                            <div className="min-w-0 flex-1 pr-2">
                                                <p className="text-[12px] font-medium text-white/70 group-hover:text-white truncate">{fav.componentName}</p>
                                                {fav.category && <span className="text-[10px] text-white/25 uppercase">{fav.category}</span>}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button onClick={(e) => { e.stopPropagation(); removeFromFavorites(user?.uid, fav.componentId); }}
                                                    className="p-1.5 text-white/15 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer">
                                                    <Trash2 size={11} />
                                                </button>
                                                <ArrowUpRight size={12} className="text-white/15 group-hover:text-white/45 transition-colors" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="px-3 py-2.5 border-t border-white/[0.06]">
                                <Link to="/favorites" onClick={() => setShowFavDropdown(false)}
                                    className="block w-full py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.09] text-center text-[11px] font-medium text-white/50 hover:text-white transition-all">
                                    View all saved →
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        ) : null;

    const ProfileBlock = () =>
        user ? (
            <div className="flex items-center gap-1">
                <Link to="/favorites" title="Profile" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 rounded-full border border-white/[0.12] overflow-hidden transition-all duration-200 group-hover:border-white/25 group-hover:shadow-[0_0_10px_rgba(255,255,255,0.08)]">
                        {user.photoURL
                            ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                            : <div className="w-full h-full bg-[#1F4BFF] flex items-center justify-center"><UserIcon size={13} className="text-white" /></div>
                        }
                    </div>
                    {isPro && (
                        <span className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1F4BFF]/15 border border-[#1F4BFF]/25 text-[10px] font-semibold text-[#7CA3FF] uppercase tracking-wider">
                            <Sparkles size={8} />Pro
                        </span>
                    )}
                </Link>
                <button onClick={() => signOut(auth)} aria-label="Sign out" title="Sign Out"
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white/25 hover:text-white/70 hover:bg-white/[0.07] transition-all duration-200 cursor-pointer">
                    <LogOut size={13} />
                </button>
            </div>
        ) : (
            <div className="flex items-center gap-1.5">
                <Link to="/login">
                    <button className="px-4 py-2 rounded-full text-[13px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-200 cursor-pointer">Sign in</button>
                </Link>
                <Link to="/signup">
                    <button className="px-4 py-2 rounded-full text-[13px] font-semibold text-white bg-[#1F4BFF] hover:bg-[#2855FF] shadow-[0_0_22px_rgba(31,75,255,0.4)] hover:shadow-[0_0_30px_rgba(31,75,255,0.6)] transition-all duration-200 cursor-pointer">
                        Get started
                    </button>
                </Link>
            </div>
        );

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div key="navbar-skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="w-full fixed top-0 left-0 right-0 z-50">
                    <NavbarSkeleton />
                </motion.div>
            ) : (
                <motion.header key="navbar-real" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }}
                    className={`fixed top-0 left-0 right-0 z-50 select-none transition-all duration-300 ${glassBase} [padding-top:env(safe-area-inset-top)]`}>                    {/* Desktop bar */}
                    <div className="hidden lg:flex items-center justify-between h-[60px] px-6 xl:px-10 max-w-screen-2xl mx-auto">
                        <LogoMark size="w-[22px] h-[22px]" />
                        <nav className="flex items-center gap-1.5">
                            {isLibraryMenuActive ? (
                                <div className="flex items-center gap-2 mr-1">
                                    <Link
                                        to="/library"
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                            isLibrary
                                                ? 'border-[#2952FF] bg-[#1F4BFF]/20 text-[#5584FF] shadow-[0_0_14px_rgba(41,82,255,0.45)]'
                                                : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08]'
                                        }`}
                                    >
                                        <Menu size={13} className="shrink-0" />
                                        <span>COMPONENTS</span>
                                    </Link>
                                    <Link
                                        to="/templates"
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                            isTemplates
                                                ? 'border-[#FFC700] bg-[#FFC700]/25 text-white shadow-[0_0_14px_rgba(255,199,0,0.45)]'
                                                : 'border-[#FFC700]/80 bg-[#FFC700]/10 text-white hover:bg-[#FFC700]/20 shadow-[0_0_8px_rgba(255,199,0,0.2)]'
                                        }`}
                                    >
                                        <span>TEMPLATES</span>
                                        <span className="px-1.5 py-0.5 bg-[#FFC700] text-black text-[9px] font-black rounded-sm leading-none shrink-0">
                                            NEW
                                        </span>
                                    </Link>
                                </div>
                            ) : (
                                <ComponentsDropdown />
                            )}
                            <Link to="/dashboard/mcp" className={linkCls(isMcp)}>
                                {isMcp && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4BFF] shadow-[0_0_6px_#1F4BFF] shrink-0" />}
                                MCP
                            </Link>
                            <Link to="/pricing" className={linkCls(isPricing)}>
                                {isPricing && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4BFF] shadow-[0_0_6px_#1F4BFF] shrink-0" />}
                                Pricing
                            </Link>
                        </nav>
                        <div className="flex items-center gap-2">
                            <FavoritesBlock />
                            <div className="w-px h-5 bg-white/[0.07] mx-0.5" />
                            <ProfileBlock />
                        </div>
                    </div>

                    {/* Mobile bar */}
                    <div className="lg:hidden flex items-center justify-between h-[56px] px-3 sm:px-4">
                        <div className="flex items-center gap-2 shrink-0">
                            <LogoMark size="w-5 h-5" />
                        </div>

                        {/* Quick tabs: Library/Templates section vs Home/Hero quick links */}
                        {isLibraryMenuActive ? (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (isLibrary) {
                                            window.dispatchEvent(new CustomEvent('ui-hub-toggle-library-menu'));
                                        } else {
                                            navigate('/library');
                                        }
                                    }}
                                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        isLibrary
                                            ? 'border-[#2952FF] bg-[#1F4BFF]/25 text-[#5580FF] shadow-[0_0_12px_rgba(41,82,255,0.4)]'
                                            : 'border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
                                    }`}
                                    title="Components"
                                >
                                    <Menu size={13} className="shrink-0" />
                                    <span>COMPONENTS</span>
                                </button>
                                <Link
                                    to="/templates"
                                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                        isTemplates
                                            ? 'border-[#FFC700] bg-[#FFC700]/25 text-white shadow-[0_0_12px_rgba(255,199,0,0.4)]'
                                            : 'border-[#FFC700]/80 bg-[#FFC700]/12 text-white hover:bg-[#FFC700]/20 shadow-[0_0_8px_rgba(255,199,0,0.2)]'
                                    }`}
                                >
                                    <span>TEMPLATES</span>
                                    <span className="px-1 py-0.5 bg-[#FFC700] text-black text-[8px] font-black rounded-sm leading-none shrink-0">
                                        NEW
                                    </span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                                <Link
                                    to="/library"
                                    className="px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold text-white/80 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.09] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                >
                                    Components
                                </Link>
                                <Link
                                    to="/templates"
                                    className="px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold text-white/80 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.09] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)] flex items-center gap-1"
                                >
                                    <span>Templates</span>
                                    <span className="px-1 py-0.2 bg-[#FFC700] text-black text-[7.5px] font-black rounded-sm leading-none shrink-0">
                                        NEW
                                    </span>
                                </Link>
                                <Link
                                    to="/pricing"
                                    className="px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[12px] font-semibold text-white/80 hover:text-white bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.09] transition-all shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                >
                                    Pricing
                                </Link>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5 shrink-0">
                            {user ? (
                                <Link to="/favorites" aria-label="Profile" className="w-8 h-8 rounded-full border border-white/[0.12] overflow-hidden">
                                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1F4BFF] flex items-center justify-center"><UserIcon size={13} className="text-white" /></div>}
                                </Link>
                            ) : (
                                <Link to="/login" className="px-2.5 py-1.5 rounded-full text-[11px] font-medium text-white/55 bg-white/[0.05] border border-white/[0.07]">Sign in</Link>
                            )}
                            <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white/45 hover:text-white bg-white/[0.06] border border-white/[0.07] hover:bg-white/[0.10] transition-all cursor-pointer">
                                <AnimatePresence mode="wait" initial={false}>
                                    {isOpen ? (
                                        <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}><X size={15} /></motion.span>
                                    ) : (
                                        <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.12 }}><Menu size={15} /></motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        </div>
                    </div>

                    {/* Mobile drawer */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22, ease: 'easeInOut' }}
                                className="lg:hidden border-t border-white/[0.05] bg-[rgba(8,8,14,0.97)] backdrop-blur-2xl overflow-hidden">
                                <div className="px-4 py-4 flex flex-col gap-1">
                                    {user && (
                                        <Link to="/favorites" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] mb-1.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full border border-white/[0.12] overflow-hidden shrink-0">
                                                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1F4BFF] flex items-center justify-center"><UserIcon size={15} className="text-white" /></div>}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-white/90">{user.displayName || 'User'}</p>
                                                    <p className="text-[11px] text-white/30">{user.email}</p>
                                                </div>
                                            </div>
                                            <PlanBadge tier={planTier} size="sm" showIcon className="shrink-0" />
                                        </Link>
                                    )}
                                    {[
                                        { to: '/', label: 'Home', active: isHomePage },
                                        { to: '/library', label: 'Components', active: isLibrary },
                                        { to: '/templates', label: 'Templates', active: isTemplates },
                                        { to: SECTIONS_ANCHOR, label: 'Build with UI HUB', active: isBuildWithUIHub },
                                        { to: '/dashboard/mcp', label: 'MCP', active: isMcp },
                                        { to: '/pricing', label: 'Pricing', active: isPricing },
                                    ].map(({ to, label, active }) => (
                                        <Link key={to + label} to={to} onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-medium transition-all ${active ? 'bg-[#1F4BFF]/12 text-white border border-[#1F4BFF]/18' : 'text-white/45 hover:text-white hover:bg-white/[0.05]'}`}>
                                            {active && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4BFF] shadow-[0_0_5px_#1F4BFF] shrink-0" />}
                                            {label}
                                        </Link>
                                    ))}
                                    {isLibrary && (
                                        <Link to="/favorites" onClick={() => setIsOpen(false)}
                                            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-white/45 hover:text-white hover:bg-white/[0.05] transition-all">
                                            <div className="flex items-center gap-3">
                                                <Heart size={14} className={favorites.length > 0 ? 'fill-rose-400 text-rose-400' : ''} />
                                                <span>Saved components</span>
                                            </div>
                                            {favorites.length > 0 && (
                                                <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/20">{favorites.length}</span>
                                            )}
                                        </Link>
                                    )}
                                    <div className="mt-2 pt-3 border-t border-white/[0.05]">
                                        {user ? (
                                            <button onClick={() => { signOut(auth); setIsOpen(false); }}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/08 border border-rose-500/15 transition-all cursor-pointer">
                                                <LogOut size={13} />Sign out
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1">
                                                    <button className="w-full py-3 rounded-xl text-[13px] font-medium text-white/55 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] transition-all cursor-pointer">Sign in</button>
                                                </Link>
                                                <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1">
                                                    <button className="w-full py-3 rounded-xl text-[13px] font-semibold text-white bg-[#1F4BFF] hover:bg-[#2855FF] shadow-[0_0_20px_rgba(31,75,255,0.3)] transition-all cursor-pointer">Get started</button>
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Toast isVisible={showToast} message={toastMsg} onClose={() => setShowToast(false)} />
                </motion.header>
            )}
        </AnimatePresence>
    );
};

export default Navbar;
