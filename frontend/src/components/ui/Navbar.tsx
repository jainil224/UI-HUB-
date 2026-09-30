import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    Menu, X, LogOut, User as UserIcon, Heart, Trash2,
    ArrowUpRight, ChevronDown, Grid2X2, PanelsTopLeft,
    LayoutTemplate, Sparkles, Search,
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
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchVal, setSearchVal] = useState('');

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

    const librariesDropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleLibrariesMouseEnter = () => {
        if (librariesDropdownTimeoutRef.current) {
            clearTimeout(librariesDropdownTimeoutRef.current);
            librariesDropdownTimeoutRef.current = null;
        }
        setShowLibrariesDropdown(true);
    };

    const handleLibrariesMouseLeave = () => {
        if (librariesDropdownTimeoutRef.current) {
            clearTimeout(librariesDropdownTimeoutRef.current);
        }
        librariesDropdownTimeoutRef.current = setTimeout(() => {
            setShowLibrariesDropdown(false);
        }, 220);
    };

    useEffect(() => {
        return () => {
            if (librariesDropdownTimeoutRef.current) clearTimeout(librariesDropdownTimeoutRef.current);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (librariesDropdownRef.current && !librariesDropdownRef.current.contains(e.target as Node)) {
                if (librariesDropdownTimeoutRef.current) clearTimeout(librariesDropdownTimeoutRef.current);
                setShowLibrariesDropdown(false);
            }
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
        ? 'bg-[#09090f] border-b border-white/[0.07]'
        : 'bg-[#0a0a10]/95 border-b border-white/[0.05]';

    /**
     * Unified desktop nav button:
     * - ACTIVE   → solid #1F4BFF rectangle + white text (matches HOME in the image)
     * - INACTIVE → dim text, animated underline on hover
     */
    const navBtn = (active: boolean) =>
        active
            ? 'relative flex items-center px-4 py-1.5 rounded-sm text-[13px] font-extrabold tracking-widest uppercase cursor-pointer select-none bg-[#1F4BFF] text-white transition-all duration-150'
            : 'relative flex items-center px-4 py-1.5 text-[13px] font-extrabold tracking-widest uppercase cursor-pointer select-none text-white/40 hover:text-white transition-colors duration-150' +
              ' after:absolute after:bottom-0 after:left-4 after:right-4 after:h-[2px] after:rounded-full after:bg-[#1F4BFF]' +
              ' after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100';

    /* keep desktopLink as alias (used by ComponentsDropdown trigger) */
    const desktopLink = navBtn;

    /* Mobile pill */
    const mobilePill = (active: boolean, accent: 'blue' | 'yellow' = 'blue') => {
        if (active && accent === 'blue') return 'bg-[#1F4BFF] text-white shadow-[0_0_14px_rgba(31,75,255,0.5)] border-[#1F4BFF]';
        if (active && accent === 'yellow') return 'bg-[#FFC700]/20 text-white border-[#FFC700]/60 shadow-[0_0_12px_rgba(255,199,0,0.3)]';
        return 'bg-white/[0.07] text-white/70 border-white/[0.10] hover:text-white hover:bg-white/[0.12]';
    };

    const LogoMark = ({ size = 'w-5 h-5' }: { size?: string }) => (
        <Link to="/" className="flex items-center gap-2 shrink-0 select-none group" aria-label="UI HUB Home">
            <span className="relative flex items-center justify-center bg-[#1F4BFF] rounded-xl p-1.5 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_18px_rgba(31,75,255,0.55)]">
                <img src={logo} alt="UI HUB Logo" className={`${size} object-contain`} />
            </span>
            <span className="hidden sm:block text-[15px] font-black tracking-widest text-white uppercase leading-none">UI HUB</span>
        </Link>
    );

    const ComponentsDropdown = () => (
        <div className="relative" ref={librariesDropdownRef}
            onMouseEnter={handleLibrariesMouseEnter}
            onMouseLeave={handleLibrariesMouseLeave}>
            <button type="button" onClick={() => setShowLibrariesDropdown(o => !o)}
                aria-haspopup="menu" aria-expanded={showLibrariesDropdown}
                className={desktopLink(isLibrary || isBuildWithUIHub || showLibrariesDropdown)}>
                COMPONENTS
                <ChevronDown size={13} className={`ml-1 transition-transform duration-200 ${showLibrariesDropdown ? 'rotate-180 text-white' : 'opacity-40'}`} />
            </button>
            <AnimatePresence>
                {showLibrariesDropdown && (
                    <motion.div role="menu"
                        initial={{ opacity: 0, y: 6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }} transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-0 top-full z-[80] pt-2 w-[295px]">
                        <div className="rounded-2xl border border-white/[0.08] bg-[rgba(10,10,18,0.98)] backdrop-blur-2xl p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.85)]">
                            <p className="px-3 pb-2 pt-1.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Libraries</p>
                            {[
                                { to: '/library', label: 'Components', description: 'Ready-made UI building blocks', Icon: Grid2X2, color: '#1F4BFF' },
                                { to: '/templates', label: 'Templates', description: 'Complete pages to customize', Icon: LayoutTemplate, color: '#8B5CF6' },
                                { to: SECTIONS_ANCHOR, label: 'Build with UI HUB', description: 'Section-level layouts', Icon: PanelsTopLeft, color: '#06B6D4' },
                            ].map(({ to, label, description, Icon, color }) => (
                                <Link key={label} to={to} role="menuitem"
                                    onClick={() => {
                                        if (librariesDropdownTimeoutRef.current) clearTimeout(librariesDropdownTimeoutRef.current);
                                        setShowLibrariesDropdown(false);
                                    }}
                                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-white/[0.06] transition-all duration-150 cursor-pointer">
                                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105"
                                        style={{ background: `${color}1a`, color }}>
                                        <Icon size={16} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors">{label}</span>
                                        <span className="block truncate text-[11px] text-white/35 group-hover:text-white/60 transition-colors">{description}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
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
            /* avatar | NAME | PRO pill | [→] */
            <div className="flex items-center gap-2">
                <Link to="/favorites" title="Profile"
                    className="flex items-center gap-2.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 group">

                    {/* Avatar — blue ring glow + green online dot ALWAYS visible */}
                    <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full border-2 border-[#1F4BFF] shadow-[0_0_12px_rgba(31,75,255,0.45)] overflow-hidden transition-all duration-200 group-hover:shadow-[0_0_16px_rgba(31,75,255,0.7)]">
                            {user.photoURL
                                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full bg-[#1F4BFF] flex items-center justify-center"><UserIcon size={13} className="text-white" /></div>
                            }
                        </div>
                        {/* Green online dot badge */}
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#09090f] shadow-[0_0_6px_rgba(34,197,94,0.8)]" />
                    </div>

                    {/* Name — prominent and crisp */}
                    <span className="hidden lg:block text-[13px] font-black text-white uppercase tracking-wider">
                        {user.displayName?.split(' ')[0] || 'User'}
                    </span>

                    {/* Badge — ALWAYS visible directly without hover */}
                    <span className={`flex items-center gap-0.5 px-2.5 py-0.5 rounded-md text-[11px] font-black tracking-wider shrink-0 transition-shadow duration-200 ${
                        isPro
                            ? 'bg-[#1F4BFF] text-white shadow-[0_0_12px_rgba(31,75,255,0.5)] group-hover:shadow-[0_0_16px_rgba(31,75,255,0.75)]'
                            : planTier === 'custom'
                            ? 'bg-[#06B6D4] text-white shadow-[0_0_12px_rgba(6,182,212,0.5)]'
                            : 'bg-white/[0.12] text-white/90 border border-white/20'
                    }`}>
                        {isPro ? 'PRO' : (planTier === 'custom' ? 'CUSTOM' : 'FREE')}
                    </span>
                </Link>

                {/* Square logout [→] */}
                <button onClick={() => signOut(auth)} aria-label="Sign out" title="Sign Out"
                    className="w-8 h-8 rounded-lg flex items-center justify-center
                        text-white/50 hover:text-white
                        bg-white/[0.04] hover:bg-white/[0.10]
                        border border-white/[0.08] hover:border-white/20
                        hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]
                        transition-all duration-200 cursor-pointer">
                    <LogOut size={14} />
                </button>
            </div>
        ) : (
            <div className="flex items-center gap-1.5">
                <Link to="/login">
                    <button className="px-4 py-1.5 text-[12px] font-bold text-white/50 hover:text-white uppercase tracking-wider transition-colors cursor-pointer">Sign in</button>
                </Link>
                <Link to="/signup">
                    <button className="px-4 py-1.5 rounded text-[12px] font-bold text-white bg-[#1F4BFF] hover:bg-[#2855FF]
                        hover:shadow-[0_0_18px_rgba(31,75,255,0.5)] uppercase tracking-wider transition-all duration-200 cursor-pointer">
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
                    {/* ═══ DESKTOP BAR — matches provided image ═══ */}
                    <div className="hidden lg:flex items-center justify-between h-[58px] px-5 xl:px-8 max-w-screen-2xl mx-auto gap-6">

                        {/* Logo */}
                        <LogoMark size="w-[22px] h-[22px]" />

                        {/* ── Nav links: every active page → solid blue rect (same as HOME in image) ── */}
                        <nav className="flex items-center gap-1 flex-1 ml-3">

                            {/* HOME — always has the orange dot badge */}
                            <Link to="/" className="relative">
                                <span className={navBtn(isHomePage)}>HOME</span>
                                {/* Orange dot */}
                                <span className="absolute -top-1 -right-0.5 w-3 h-3 rounded-full bg-[#FF6B2B] border-2 border-[#09090f] flex items-center justify-center pointer-events-none">
                                    <span className="w-1 h-1 rounded-full bg-white" />
                                </span>
                            </Link>

                            <ComponentsDropdown />
                            <Link to="/templates"><span className={navBtn(isTemplates)}>TEMPLATES</span></Link>
                            <Link to="/dashboard/mcp"><span className={navBtn(isMcp)}>MCP</span></Link>
                            <Link to="/pricing"><span className={navBtn(isPricing)}>PRICING</span></Link>
                        </nav>

                        {/* Right side: Search + avatar/name/PRO + logout */}
                        <div className="flex items-center gap-2 shrink-0">
                            {/* Search — matches image: wide box with border, SEARCH... placeholder */}
                            <div className={`flex items-center gap-2 px-3 py-[7px] border transition-all duration-200 ${
                                searchFocused
                                    ? 'bg-white/[0.06] border-white/20 w-52'
                                    : 'bg-white/[0.03] border-white/[0.12] w-44 hover:border-white/20'
                            }`}>
                                <Search size={12} className="text-white/30 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="SEARCH..."
                                    value={searchVal}
                                    onChange={e => setSearchVal(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    onBlur={() => setSearchFocused(false)}
                                    className="bg-transparent outline-none border-none text-[11px] font-bold text-white/70 placeholder:text-white/30 placeholder:tracking-widest placeholder:font-bold w-full uppercase tracking-wider"
                                />
                            </div>
                            <FavoritesBlock />
                            <ProfileBlock />
                        </div>
                    </div>

                    {/* ═══ MOBILE BAR ═══ */}
                    <div className="lg:hidden flex items-center justify-between h-[56px] px-3 sm:px-4">
                        <LogoMark size="w-5 h-5" />

                        {/* 3-pill context bar */}
                        <div className="flex items-center gap-1.5">
                            {isLibraryMenuActive ? (
                                /* On library/components → HOME | TEMPLATES | MCP */
                                <>
                                    <Link to="/"
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isHomePage)}`}>
                                        HOME
                                    </Link>
                                    <Link to="/templates"
                                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isTemplates, 'yellow')}`}>
                                        TEMPLATES
                                        <span className="px-1 py-0.5 bg-[#FFC700] text-black text-[7px] font-black rounded-sm leading-none">NEW</span>
                                    </Link>
                                    <Link to="/dashboard/mcp"
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isMcp)}`}>
                                        MCP
                                    </Link>
                                </>
                            ) : (
                                /* Default → COMPONENTS | MCP | PRICING */
                                <>
                                    <Link to="/library"
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isLibrary)}`}>
                                        COMPONENTS
                                    </Link>
                                    <Link to="/dashboard/mcp"
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isMcp)}`}>
                                        MCP
                                    </Link>
                                    <Link to="/pricing"
                                        className={`px-2.5 py-1.5 rounded-md text-[11px] font-black uppercase tracking-wider transition-all border ${mobilePill(isPricing)}`}>
                                        PRICING
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Avatar + hamburger */}
                        <div className="flex items-center gap-1.5 shrink-0">
                            {user ? (
                                <Link to="/favorites" aria-label="Profile" className="w-8 h-8 rounded-full border-2 border-[#1F4BFF] shadow-[0_0_10px_rgba(31,75,255,0.45)] overflow-hidden">
                                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#1F4BFF] flex items-center justify-center"><UserIcon size={13} className="text-white" /></div>}
                                </Link>
                            ) : (
                                <Link to="/login" className="px-2.5 py-1.5 rounded-md text-[11px] font-semibold text-white/55 bg-white/[0.05] border border-white/[0.07]">Sign in</Link>
                            )}
                            <button onClick={() => setIsOpen(!isOpen)} aria-label={isOpen ? 'Close menu' : 'Open menu'} aria-expanded={isOpen}
                                className="w-8 h-8 rounded-md flex items-center justify-center text-white/45 hover:text-white bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.12] transition-all cursor-pointer">
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
                                                    <p className="text-[13px] font-black text-white/90 uppercase tracking-wider">{user.displayName || 'User'}</p>
                                                    <p className="text-[11px] text-white/30">{user.email}</p>
                                                </div>
                                            </div>
                                            <PlanBadge tier={planTier} size="sm" showIcon className="shrink-0" />
                                        </Link>
                                    )}
                                    {/* Drawer search */}
                                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] mb-1">
                                        <Search size={13} className="text-white/30 shrink-0" />
                                        <input type="text" placeholder="Search components..." className="bg-transparent outline-none text-[13px] text-white/75 placeholder:text-white/25 flex-1" />
                                    </div>
                                    {[
                                        { to: '/', label: 'Home', active: isHomePage },
                                        { to: '/library', label: 'Components', active: isLibrary },
                                        { to: '/templates', label: 'Templates', active: isTemplates },
                                        { to: SECTIONS_ANCHOR, label: 'Build with UI HUB', active: isBuildWithUIHub },
                                        { to: '/dashboard/mcp', label: 'MCP', active: isMcp },
                                        { to: '/pricing', label: 'Pricing', active: isPricing },
                                    ].map(({ to, label, active }) => (
                                        <Link key={to + label} to={to} onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all ${active ? 'bg-[#1F4BFF]/15 text-white border border-[#1F4BFF]/20' : 'text-white/40 hover:text-white hover:bg-white/[0.05]'}`}>
                                            {active && <span className="w-1.5 h-1.5 rounded-full bg-[#1F4BFF] shadow-[0_0_5px_#1F4BFF] shrink-0" />}
                                            {label}
                                        </Link>
                                    ))}
                                    {isLibrary && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsOpen(false);
                                                    window.dispatchEvent(new CustomEvent('ui-hub-toggle-library-menu'));
                                                }}
                                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[13px] font-bold text-white bg-[#1F4BFF]/20 hover:bg-[#1F4BFF]/30 border border-[#1F4BFF]/50 uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_15px_rgba(31,75,255,0.25)]">
                                                <div className="flex items-center gap-3">
                                                    <Grid2X2 size={16} className="text-[#1F4BFF]" />
                                                    <span>Browse All Components</span>
                                                </div>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-[#1F4BFF] text-white font-mono font-bold">228+</span>
                                            </button>
                                            <Link to="/favorites" onClick={() => setIsOpen(false)}
                                                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-[13px] font-medium text-white/40 hover:text-white hover:bg-white/[0.05] transition-all">
                                                <div className="flex items-center gap-3">
                                                    <Heart size={14} className={favorites.length > 0 ? 'fill-rose-400 text-rose-400' : ''} />
                                                    <span>Saved components</span>
                                                </div>
                                                {favorites.length > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-semibold border border-rose-500/20">{favorites.length}</span>
                                                )}
                                            </Link>
                                        </>
                                    )}
                                    <div className="mt-2 pt-3 border-t border-white/[0.05]">
                                        {user ? (
                                            <button onClick={() => { signOut(auth); setIsOpen(false); }}
                                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-rose-400/80 hover:text-rose-400 hover:bg-rose-500/[0.08] border border-rose-500/15 uppercase tracking-wider transition-all cursor-pointer">
                                                <LogOut size={13} />Sign out
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1">
                                                    <button className="w-full py-3 rounded-xl text-[13px] font-bold text-white/55 bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.09] uppercase tracking-wider transition-all cursor-pointer">Sign in</button>
                                                </Link>
                                                <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1">
                                                    <button className="w-full py-3 rounded-xl text-[13px] font-bold text-white bg-[#1F4BFF] hover:bg-[#2855FF] shadow-[0_0_20px_rgba(31,75,255,0.3)] uppercase tracking-wider transition-all cursor-pointer">Get started</button>
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
