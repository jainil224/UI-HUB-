import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, Heart, Trash2, ArrowUpRight } from 'lucide-react';
import logo from '../../Assets/webiste logo.svg';
import PlanBadge, { PlanTier } from './PlanBadge';
import SearchBox from './SearchBox';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import Toast from './Toast';
import { useSkeleton } from '../../context/SkeletonContext';
import { NavbarSkeleton } from './Skeleton';
import { getUserFavorites, removeFromFavorites, FavoriteItem } from '../../services/favorites';

const Navbar = () => {
    const { user, isPro, loading } = useAuth();
    const { isLoading } = useSkeleton();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const isLibrary = location.pathname.startsWith('/library');
    const isHomePage = location.pathname === '/';
    const [globalSearch, setGlobalSearch] = useState('');
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [showFavDropdown, setShowFavDropdown] = useState(false);
    const favDropdownRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const unsub = getUserFavorites(user?.uid, (data) => {
            setFavorites(data || []);
        });
        return () => {
            if (typeof unsub === 'function') unsub();
        };
    }, [user?.uid]);

    // Close favorites popover on click outside
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (favDropdownRef.current && !favDropdownRef.current.contains(e.target as Node)) {
                setShowFavDropdown(false);
            }
        };
        if (showFavDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showFavDropdown]);

    const isTemplates = location.pathname.startsWith('/templates');
    const isMcp = location.pathname.startsWith('/dashboard/mcp') || location.pathname === '/mcp';
    const isPricing = location.pathname === '/pricing';

    const navLinks = [
        { to: '/', label: 'HOME', active: isHomePage },
        { to: '/library', label: 'COMPONENTS', active: isLibrary },
        { to: '/templates', label: 'TEMPLATES', active: isTemplates },
        { to: '/dashboard/mcp', label: 'MCP', active: isMcp },
        { to: '/pricing', label: 'PRICING', active: isPricing },
    ];
    
    const submitSearch = () => {
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

        if (user && shouldWelcome === 'true') {
            setToastMsg(`WELCOME BACK, ${user.displayName?.split(' ')[0].toUpperCase() || 'AGENT'}`);
            setShowToast(true);

            sessionStorage.removeItem('ui-hub-show-welcome');
        }

        if (prevUserRef.current && !user) {
            setToastMsg('LOGGED OUT');
            setShowToast(true);
        }

        prevUserRef.current = user;
    }, [user, loading]);

    const planTier: PlanTier = isPro ? 'pro' : 'free';

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
                    {/* Accent strip */}
                    <div className="h-1 w-full bg-gradient-to-r from-[#1F4BFF] via-[#FFC700] to-[#E52520]" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

                        {/* ── Brand Logo ── */}
                        <Link to="/" className="flex items-center gap-3 shrink-0 group">
                            <div className="relative transition-transform duration-200 group-hover:-rotate-6 group-hover:scale-110">
                                <img
                                    src={logo}
                                    alt="UI HUB Logo"
                                    className="w-8 h-8 rounded-sm object-contain"
                                />
                                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#FFC700] border-2 border-black shadow-[1px_1px_0px_0px_#000] animate-pulse" />
                            </div>
                            <span className="font-heading font-black text-2xl tracking-tight text-black uppercase group-hover:text-[#1F4BFF] transition-colors">
                                UI HUB
                            </span>
                        </Link>

                        {/* ── Center Navigation Links ── */}
                        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
                            {navLinks.map(({ to, label, active }) => (
                                <Link
                                    key={to + label}
                                    to={to}
                                    className={`relative px-3 py-1.5 text-xs lg:text-[13px] font-black uppercase tracking-wider border-2 transition-all ${
                                        active
                                            ? 'bg-[#1F4BFF] text-white border-black shadow-[3px_3px_0px_0px_#000000]'
                                            : 'bg-transparent text-black border-transparent hover:border-black hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000000]'
                                    }`}
                                >
                                    {label}
                                    {active && (
                                        <span className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#FFC700] border-2 border-black" />
                                    )}
                                </Link>
                            ))}

                            {/* ── Heart Symbol (Visible on Components / Library Page) ── */}
                            {isLibrary && (
                                <div className="relative" ref={favDropdownRef}>
                                    <button
                                        onClick={() => setShowFavDropdown(prev => !prev)}
                                        title="View Favorite Components"
                                        aria-label="Favorite Components"
                                        className={`relative p-2 border-2 border-black transition-all flex items-center justify-center cursor-pointer ${
                                            showFavDropdown
                                                ? 'bg-[#FF3B30] text-white shadow-[3px_3px_0px_0px_#000000] -translate-y-0.5'
                                                : 'bg-white text-black hover:bg-neutral-100 hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#000000]'
                                        }`}
                                    >
                                        <Heart 
                                            size={17} 
                                            className={favorites.length > 0 ? "fill-[#FF3B30] text-[#FF3B30]" : "text-black"} 
                                        />
                                        {favorites.length > 0 && (
                                            <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#FF3B30] text-white text-[10px] font-mono font-black rounded-full border border-black flex items-center justify-center shadow-[1px_1px_0px_#000]">
                                                {favorites.length}
                                            </span>
                                        )}
                                    </button>

                                    {/* Favorites Popover Dropdown */}
                                    <AnimatePresence>
                                        {showFavDropdown && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                transition={{ duration: 0.15 }}
                                                className="absolute left-1/2 -translate-x-1/2 mt-2 w-80 bg-white border-4 border-black rounded-none shadow-[8px_8px_0px_0px_#000000] z-50 overflow-hidden"
                                            >
                                                {/* Dropdown Header */}
                                                <div className="p-3 bg-[#1F4BFF] border-b-2 border-black flex items-center justify-between text-white">
                                                    <div className="flex items-center gap-2 font-heading font-black text-xs uppercase tracking-wider">
                                                        <Heart size={14} className="fill-[#FF3B30] text-white" />
                                                        <span>FAVORITE ICONS & COMPS</span>
                                                        <span className="px-1.5 py-0.2 bg-black text-white text-[10px] font-mono border border-white/40">
                                                            {favorites.length}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => setShowFavDropdown(false)}
                                                        className="text-white hover:bg-black/20 p-1 cursor-pointer"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>

                                                {/* Dropdown List */}
                                                <div className="max-h-64 overflow-y-auto divide-y divide-neutral-200">
                                                    {favorites.length === 0 ? (
                                                        <div className="p-6 text-center text-neutral-500">
                                                            <Heart size={28} className="mx-auto mb-2 text-neutral-300 stroke-[1.5]" />
                                                            <p className="text-xs font-bold font-mono uppercase text-black">NO FAVORITES YET</p>
                                                            <p className="text-[11px] text-neutral-500 mt-1 font-sans">
                                                                Click the heart icon on any component to save it here.
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        favorites.map((fav) => (
                                                            <div 
                                                                key={fav.componentId}
                                                                onClick={() => {
                                                                    navigate(`/library?id=${fav.componentId}`);
                                                                    setShowFavDropdown(false);
                                                                }}
                                                                className="p-3 flex items-center justify-between hover:bg-neutral-50 transition-colors cursor-pointer group"
                                                            >
                                                                <div className="min-w-0 flex-1 pr-2">
                                                                    <p className="text-xs font-black uppercase text-black group-hover:text-[#1F4BFF] truncate">
                                                                        {fav.componentName}
                                                                    </p>
                                                                    {fav.category && (
                                                                        <span className="text-[10px] font-mono text-neutral-500 uppercase">
                                                                            {fav.category}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1.5">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            removeFromFavorites(user?.uid, fav.componentId);
                                                                        }}
                                                                        title="Remove from favorites"
                                                                        className="p-1 text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                                    >
                                                                        <Trash2 size={13} />
                                                                    </button>
                                                                    <ArrowUpRight size={14} className="text-neutral-400 group-hover:text-black transition-colors" />
                                                                </div>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>

                                                {/* Dropdown Footer */}
                                                <div className="p-2.5 bg-neutral-100 border-t-2 border-black flex items-center justify-between">
                                                    <Link
                                                        to="/favorites"
                                                        onClick={() => setShowFavDropdown(false)}
                                                        className="w-full py-1.5 bg-black text-white text-center text-xs font-black uppercase tracking-wider hover:bg-[#1F4BFF] transition-colors"
                                                    >
                                                        VIEW ALL IN FAVORITES PAGE
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}
                        </nav>

                        {/* ── Right Actions ── */}
                        <div className="flex items-center gap-3">
                            {/* Search (Desktop) with live suggestions */}
                            <SearchBox
                                value={globalSearch}
                                onChange={setGlobalSearch}
                                onSubmit={submitSearch}
                                placeholder="SEARCH..."
                                containerClassName="hidden xl:flex relative mr-1"
                                inputWrapperClassName="group flex items-center w-40 lg:w-52 bg-[#F5F5F5] border-2 border-black rounded-none transition-all focus-within:bg-white focus-within:border-[#1F4BFF] focus-within:shadow-[3px_3px_0px_0px_#1F4BFF]"
                                iconClassName="pl-2.5 pr-1.5 flex items-center text-neutral-500 group-focus-within:text-[#1F4BFF] transition-colors"
                                inputClassName="flex-1 w-full bg-transparent py-1.5 pr-2.5 text-xs font-mono font-bold text-black placeholder:text-neutral-400 focus:outline-none uppercase"
                                dropdownClassName="w-full min-w-[380px] right-0 left-auto"
                            />

                            {/* User Profile / Auth Action Buttons */}
                            {user ? (
                                <div className="flex items-center gap-1.5 sm:gap-2">
                                    <Link 
                                        to="/favorites"
                                        title="Favorites & Profile"
                                        className="flex items-center gap-1.5 sm:gap-2 bg-white border-2 border-black py-1.5 px-2 sm:px-2.5 shadow-[2px_2px_0px_0px_#000000] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[1px_1px_0px_0px_#000000] transition-all shrink-0"
                                    >
                                        <div className="w-6 h-6 rounded-none border border-black bg-[#1F4BFF] flex items-center justify-center overflow-hidden shrink-0">
                                            {user.photoURL ? (
                                                <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon size={12} className="text-white" />
                                            )}
                                        </div>
                                        <span className="hidden sm:inline text-xs font-black uppercase tracking-tight text-black max-w-[80px] truncate">
                                            {user.displayName?.split(' ')[0] || 'USER'}
                                        </span>
                                        <span
                                            className={`hidden sm:inline px-1.5 py-0.5 border border-black text-[9px] font-black uppercase shadow-[1px_1px_0px_0px_#000] ${
                                                planTier === 'pro'
                                                    ? 'bg-[#1F4BFF] text-white'
                                                    : 'bg-neutral-200 text-black'
                                            }`}
                                        >
                                            {planTier.toUpperCase()}
                                        </span>
                                    </Link>

                                    <button
                                        onClick={() => signOut(auth)}
                                        aria-label="Sign out"
                                        className="hidden sm:flex w-11 h-11 bg-white border-2 border-black items-center justify-center text-black hover:bg-[#E52520] hover:text-white shadow-[2px_2px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 transition-all shrink-0"
                                        title="Sign Out"
                                    >
                                        <LogOut size={15} />
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
                                        <button className="bg-[#1F4BFF] hover:bg-[#1638CC] text-white border-2 border-black px-4 py-2 text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000000] transition-all">
                                            GET STARTED
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Heart Button (Visible on Components / Library Page) */}
                            {isLibrary && (
                                <button
                                    onClick={() => navigate('/favorites')}
                                    title="View Favorites"
                                    aria-label="View Favorites"
                                    className="md:hidden flex items-center justify-center w-11 h-11 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] relative cursor-pointer"
                                >
                                    <Heart 
                                        size={18} 
                                        className={favorites.length > 0 ? "fill-[#FF3B30] text-[#FF3B30]" : "text-black"} 
                                    />
                                    {favorites.length > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-[#FF3B30] text-white text-[9px] font-mono font-black rounded-full border border-black flex items-center justify-center">
                                            {favorites.length}
                                        </span>
                                    )}
                                </button>
                            )}

                            {/* Mobile Hamburger */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label={isOpen ? 'Close menu' : 'Open menu'}
                                aria-expanded={isOpen}
                                className="md:hidden flex items-center justify-center w-11 h-11 bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_#000000] hover:bg-black hover:text-white active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
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
                                    {navLinks.map(({ to, label, active }) => (
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

                                    {/* Mobile Favorites Link (When on Library page) */}
                                    {isLibrary && (
                                        <Link
                                            to="/favorites"
                                            onClick={() => setIsOpen(false)}
                                            className="py-2.5 px-3 border-2 border-black text-xs font-black uppercase tracking-wider bg-rose-50 text-black flex items-center justify-between shadow-[2px_2px_0px_0px_#000000]"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Heart size={14} className="fill-[#FF3B30] text-[#FF3B30]" />
                                                <span>FAVORITE COMPONENTS</span>
                                            </div>
                                            {favorites.length > 0 && (
                                                <span className="px-1.5 py-0.5 bg-[#FF3B30] text-white text-[10px] font-mono font-black border border-black">
                                                    {favorites.length}
                                                </span>
                                            )}
                                        </Link>
                                    )}
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
