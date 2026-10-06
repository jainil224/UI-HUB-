import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown, Home, ArrowRight, Search, Lock, Crown, Check, Sparkles, Bot, Grid2X2, Layers, Zap, Code2 } from 'lucide-react';
import ComponentDetail from './sections/ComponentDetail/index';
import GetStartedPage from './sections/GetStarted/GetStartedPage';
import HoverPreviewPopover from './HoverPreviewPopover';
import { GET_STARTED_PAGES } from './sections/GetStarted/getStartedData';
import { componentList, ComponentItem } from '../../data/componentData';
import { useAuth } from '../../context/AuthContext';
import { prefetchComponentChunk } from '../../utils/prefetchUtils';
import { isNewComponent } from '../../utils/componentUtils';
import uiHubLogo from '../../Assets/webiste logo.svg';

interface Category {
    name: string;
    items: ComponentItem[];
}

const CATEGORY_META: Record<string, { icon: string; color: string; bg: string; border: string }> = {
    "Buttons/hover effects": { icon: "⚡", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Text Animations": { icon: "✦", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Visual Effects": { icon: "◈", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "3D Design": { icon: "⬡", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Backgrounds": { icon: "◉", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Interactive Background": { icon: "◍", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Cursor Effects": { icon: "⊕", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "3D CHATBOT": { icon: "🤖", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Scroll Animation": { icon: "↕", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Loaders": { icon: "⏳", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Navbars": { icon: "➤", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Footers": { icon: "⌂", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
};

const LibraryPage = () => {
    const { isPro, purchasedComponents } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');
    const docFromUrl = queryParams.get('get-started') || '';
    const qFromUrl = queryParams.get('q') || '';

    const [optimisticId, setOptimisticId] = useState<string | null>(null);
    const [activeDocId, setActiveDocId] = useState<string | null>(idFromUrl ? null : docFromUrl || 'introduction');
    const allComponents = useMemo(() => componentList, []);
    const activeDoc = GET_STARTED_PAGES.find(p => p.id === activeDocId) || null;

    const activeId = optimisticId || idFromUrl || '3d-hero';

    const activeComponent = useMemo(() => {
        const found = allComponents.find(c => c.id === activeId);
        if (found) return found;
        return allComponents.find(c => c.id === '3d-hero') || allComponents[0];
    }, [activeId, allComponents]);

    const highlightedComponentId = activeDoc ? null : (optimisticId || activeComponent?.id);

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState(qFromUrl);
    const [mobileSearch, setMobileSearch] = useState('');

    useEffect(() => {
        const handleToggle = () => setIsMobileMenuOpen(prev => !prev);
        window.addEventListener('ui-hub-toggle-library-menu', handleToggle);
        return () => window.removeEventListener('ui-hub-toggle-library-menu', handleToggle);
    }, []);

    const [showUpdates, setShowUpdates] = useState(false);

    const [showGetStarted, setShowGetStarted] = useState(true);

    const [hoverPreview, setHoverPreview] = useState<{ item: ComponentItem; rect: DOMRect } | null>(null);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const mainContainerRef = useRef<HTMLElement>(null);
    const leftAsideRef = useRef<HTMLElement>(null);

    // Scroll the active component into view in the left pane whenever it
    // changes, since that pane now scrolls independently of the rest of the page.
    useEffect(() => {
        const activeButton = leftAsideRef.current?.querySelector<HTMLElement>('[data-active-component]');
        activeButton?.scrollIntoView({ block: 'nearest' });
    }, [highlightedComponentId]);

    useEffect(() => {
        setOptimisticId(null);
    }, [idFromUrl]);

    useEffect(() => {
        setActiveDocId(idFromUrl ? null : docFromUrl || 'introduction');
    }, [idFromUrl, docFromUrl]);

    useEffect(() => {
        setSearchQuery(qFromUrl);
    }, [qFromUrl]);

    useEffect(() => {
        if (!hoverPreview) return;
        const onResize = () => closePreview();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [hoverPreview]);

    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        };
    }, []);

    const baseCategories: Category[] = useMemo(() => [
        { name: "Buttons/hover effects", items: allComponents.filter(item => item.category === 'button') },
        { name: "Text Animations", items: allComponents.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: allComponents.filter(item => item.category === 'effect') },
        { name: "Image Interaction", items: allComponents.filter(item => item.category === 'image-interaction') },
        { name: "3D Design", items: allComponents.filter(item => item.category === '3d' || item.id.startsWith('3d-')) },
        { name: "Backgrounds", items: allComponents.filter(item => item.category === 'background') },
        { name: "Interactive Background", items: allComponents.filter(item => item.category === 'interactive-background') },
        { name: "Cursor Effects", items: allComponents.filter(item => item.category === 'cursor') },
        { name: "Scroll Animation", items: allComponents.filter(item => item.category === 'scroll') },
        { name: "Loaders", items: allComponents.filter(item => item.category === 'loader') },
        { name: "Navbars", items: allComponents.filter(item => item.category === 'navbar') },
        { name: "Footers", items: allComponents.filter(item => item.category === 'footer') },
        { name: "Forms & Inputs", items: allComponents.filter(item => item.category === 'form') },
    ], [allComponents]);

    const categories = useMemo(() => baseCategories
        .map(cat => {
            return {
                ...cat,
                items: cat.items.filter(item =>
                    searchQuery === '' ||
                    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
            };
        })
        .filter(cat => cat.items.length > 0), [baseCategories, searchQuery]);

    useEffect(() => {
        if (activeDoc) return;
        if (activeComponent) {
            const activeCat = baseCategories.find(cat => cat.items.some(item => item.id === activeComponent.id));
            if (activeCat) {
                setExpandedCategories(prev => prev.includes(activeCat.name) ? prev : [...prev, activeCat.name]);
            }
        }
    }, [activeComponent?.id, activeDoc, baseCategories]);

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
    };

    // Lock body scroll + close on Escape while the mobile drawer is open
    useEffect(() => {
        if (!isMobileMenuOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsMobileMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [isMobileMenuOpen]);

    const drawerQuery = mobileSearch.trim().toLowerCase();
    const drawerCategories = useMemo(() => baseCategories
        .map(cat => ({
            ...cat,
            items: cat.items.filter(item => drawerQuery === '' || item.title.toLowerCase().includes(drawerQuery))
        }))
        .filter(cat => cat.items.length > 0), [baseCategories, drawerQuery]);

    const drawerSearchResults = useMemo(() => (
        drawerQuery === ''
            ? []
            : allComponents.filter(item => item.title.toLowerCase().includes(drawerQuery))
    ), [allComponents, drawerQuery]);

    const handleComponentSelect = (item: ComponentItem) => {
        closePreview();
        setOptimisticId(item.id);
        setActiveDocId(null);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
        if (mainContainerRef.current) mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const handleDocSelect = (docId: string) => {
        setActiveDocId(docId);
        setOptimisticId(null);
        setIsMobileMenuOpen(false);
        navigate(`/library?get-started=${docId}`, { replace: true });
        if (mainContainerRef.current) mainContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        window.scrollTo({ top: 0, behavior: 'auto' });
    };

    const clearHoverTimer = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
    };

    const handlePreviewEnter = (item: ComponentItem, e: React.MouseEvent) => {
        prefetchComponentChunk(item.id);
        clearHoverTimer();
        if (hoverPreview?.item.id === item.id) return;
        const target = e.currentTarget as HTMLElement;
        hoverTimerRef.current = setTimeout(() => {
            setHoverPreview({ item, rect: target.getBoundingClientRect() });
        }, 200);
    };

    const handlePreviewLeave = () => {
        clearHoverTimer();
        hoverTimerRef.current = setTimeout(() => setHoverPreview(null), 150);
    };

    const closePreview = () => {
        clearHoverTimer();
        setHoverPreview(null);
    };

    const totalComponents = allComponents.length;

    return (
        <>
            <style>{`
                .sidebar-scroll::-webkit-scrollbar { width: 4px; }
                .sidebar-scroll::-webkit-scrollbar-track { background: #0A0A0A; }
                .sidebar-scroll::-webkit-scrollbar-thumb { background: #3D5CFF; }
                .main-scroll::-webkit-scrollbar { width: 4px; }
                .main-scroll::-webkit-scrollbar-track { background: #0A0A0A; }
                .main-scroll::-webkit-scrollbar-thumb { background: #262626; }
            `}</style>

            <div className="flex flex-col md:flex-row relative pt-14 md:pt-16 bg-brand-bg text-white md:h-[100dvh] md:overflow-hidden">

                {/* ── Mobile Menu Drawer ── */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            key="drawer-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            aria-hidden="true"
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[998] md:hidden"
                        />
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.aside
                            key="drawer-panel"
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'tween', duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
                            role="dialog"
                            aria-modal="true"
                            aria-label="Components menu"
                            className="fixed inset-y-0 left-0 z-[999] md:hidden flex flex-col w-[85vw] max-w-sm bg-brand-bg border-r-4 border-black shadow-[8px_0_0_0_rgba(0,0,0,0.6)]"
                        >
                            {/* Drawer Header */}
                            <div className="shrink-0 px-4 pt-4 pb-3 space-y-3 bg-brand-surface border-b-2 border-neutral-800">
                                <div className="flex items-center justify-between">
                                    <span className="font-black text-sm uppercase tracking-wider">UI HUB</span>
                                    <button
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        aria-label="Close menu"
                                        className="w-11 h-11 -mr-2 flex items-center justify-center rounded-lg border-2 border-white bg-brand-surface text-white active:translate-y-0.5"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="rounded-lg border-2 border-white bg-brand-bg px-4 py-2 brutal-shadow-black flex items-center justify-between">
                                    <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">Total Available</p>
                                    <span className="text-xl font-black text-brand-blue">{totalComponents}</span>
                                </div>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                    <input
                                        type="text"
                                        value={mobileSearch}
                                        onChange={(e) => setMobileSearch(e.target.value)}
                                        placeholder="SEARCH COMPONENTS..."
                                        aria-label="Search components"
                                        className="w-full pl-9 pr-9 py-2.5 bg-black border-2 border-neutral-700 rounded-lg text-xs font-bold uppercase tracking-wider text-white placeholder:text-neutral-600 focus:outline-none focus:border-brand-blue transition-colors"
                                    />
                                    {mobileSearch && (
                                        <button
                                            onClick={() => setMobileSearch('')}
                                            aria-label="Clear search"
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded text-neutral-500 hover:text-white"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 pt-1">
                                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white text-[10px] font-black uppercase tracking-wider">
                                        <Home size={11} /> <span>Home</span>
                                    </Link>
                                    <Link to="/templates" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border-2 border-[#FFC700] bg-[#FFC700]/15 text-white hover:bg-[#FFC700] hover:text-black transition-colors text-[10px] font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000]">
                                        <span>🎨 Templates</span>
                                        <span className="px-1 py-0.2 bg-[#FFC700] text-black text-[8px] font-black uppercase rounded-sm">NEW</span>
                                    </Link>
                                    <Link to="/dashboard/mcp" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-neutral-700 bg-neutral-900 text-neutral-300 hover:text-white text-[10px] font-black uppercase tracking-wider">
                                        <span>MCP</span>
                                    </Link>
                                </div>
                            </div>

                            {/* Drawer Nav */}
                            <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4">
                                {drawerQuery !== '' ? (
                                    <div className="space-y-1">
                                        <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black px-2 mb-2">
                                            {drawerSearchResults.length} RESULT{drawerSearchResults.length === 1 ? '' : 'S'}
                                        </p>
                                        {drawerSearchResults.map(item => {
                                            const isActive = highlightedComponentId === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => handleComponentSelect(item)}
                                                    onMouseEnter={() => prefetchComponentChunk(item.id)}
                                                    onFocus={() => prefetchComponentChunk(item.id)}
                                                    className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                        isActive
                                                            ? 'bg-brand-blue text-white border-2 border-white shadow-[3px_3px_0px_0px_#000000]'
                                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                                                    }`}
                                                >
                                                    <span className="truncate flex items-center gap-1.5">
                                                        {item.title}
                                                        {item.isPremium && !isPro && !purchasedComponents.includes(item.id) && (
                                                            <span className="inline-flex shrink-0" title="Premium — buy this component ($1.99) or upgrade to Pro"><Lock size={10} className="text-brand-blue shrink-0" aria-label="Premium" /></span>
                                                        )}
                                                    </span>
                                                    <span className="flex shrink-0 items-center gap-2">
                                                        <span className="text-[9px] text-neutral-500 uppercase">{item.category}</span>
                                                    </span>
                                                </button>
                                            );
                                        })}
                                        {drawerSearchResults.length === 0 && (
                                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider text-center py-8">
                                                No components found
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-1.5 rounded border border-neutral-800 bg-neutral-900/40">
                                            <button
                                                onClick={() => setShowGetStarted(!showGetStarted)}
                                                aria-expanded={showGetStarted}
                                                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg"
                                            >
                                                <span className="text-[11px] font-black uppercase tracking-wider !text-brand-yellow">Get Started</span>
                                                <ChevronDown size={12} className={`transition-transform duration-200 ${showGetStarted ? 'rotate-180 text-brand-blue' : 'text-neutral-500'}`} />
                                            </button>
                                            {showGetStarted && (
                                                <div className="pl-2.5 pb-1.5 border-l-2 border-neutral-800/80 ml-3.5 space-y-1">
                                                    {GET_STARTED_PAGES.map(doc => {
                                                        const isActive = activeDocId === doc.id;
                                                        return (
                                                            <button
                                                                key={doc.id}
                                                                onClick={() => handleDocSelect(doc.id)}
                                                                className={`w-full flex items-center gap-2 text-left px-2.5 py-2 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all duration-150 ${
                                                                    isActive
                                                                        ? 'bg-brand-blue text-white border-2 border-white shadow-[3px_3px_0px_0px_#000000] translate-x-1'
                                                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70 hover:translate-x-1'
                                                                }`}
                                                            >
                                                                <span className="text-xs">{doc.icon}</span>
                                                                <span className="truncate">{doc.title}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    {drawerCategories.map((cat, idx) => {
                                        const hasActive = cat.items.some(item => highlightedComponentId === item.id);
                                        const isExpanded = expandedCategories.includes(cat.name);
                                        return (
                                            <div key={idx} className="mb-1.5">
                                                <button
                                                    onClick={() => toggleCategory(cat.name)}
                                                    aria-expanded={isExpanded}
                                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                                                        hasActive
                                                            ? 'bg-neutral-900/90 border-brand-blue/60 text-white'
                                                            : 'border-transparent text-neutral-300 hover:bg-neutral-900/60 hover:text-white hover:border-neutral-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />}
                                                        <span className="text-[11px] font-black uppercase tracking-wider !text-brand-yellow">
                                                            {cat.name}
                                                        </span>
                                                    </div>
                                                    <ChevronDown size={12} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-blue' : 'text-neutral-500'}`} />
                                                </button>
                                                {isExpanded && (
                                                    <div className="pl-2.5 py-1 border-l-2 border-neutral-800/80 ml-3.5 space-y-1 mt-1">
                                                        {cat.items.map(item => {
                                                            const isActive = highlightedComponentId === item.id;
                                                            return (
                                                                <button
                                                                    key={item.id}
                                                                    onClick={() => handleComponentSelect(item)}
                                                                    onMouseEnter={() => prefetchComponentChunk(item.id)}
                                                                    onFocus={() => prefetchComponentChunk(item.id)}
                                                                    className={`w-full flex items-center justify-between text-left px-2.5 py-2 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all duration-150 ${
                                                                        isActive
                                                                            ? 'bg-brand-blue text-white border-2 border-white shadow-[3px_3px_0px_0px_#000000] translate-x-1'
                                                                            : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70 hover:translate-x-1'
                                                                    }`}
                                                                >
                                                                    <span className="min-w-0 truncate pr-2 flex items-center gap-1.5">
                                                                        {item.title}
                                                                        {item.isPremium && !isPro && !purchasedComponents.includes(item.id) && (
                                                                            <span className="inline-flex shrink-0" title="Premium — buy this component ($1.99) or upgrade to Pro"><Lock size={10} className="text-brand-blue shrink-0" aria-label="Premium" /></span>
                                                                        )}
                                                                        {isNewComponent(item) && (
                                                                            <span className="px-1 py-px bg-[#FFC700] text-black text-[8px] font-black uppercase leading-none rounded-sm border border-black shadow-[1px_1px_0px_0px_#000000] shrink-0">
                                                                                New
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    </>
                                )}
                            </nav>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* ── Left Column: Categories & Available Components ── */}
                <aside ref={leftAsideRef} onScroll={closePreview} className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 md:h-full overflow-y-auto sidebar-scroll border-r-4 border-black bg-brand-surface relative z-30">
                    <div className="shrink-0 px-5 pt-5 pb-4 border-b-2 border-neutral-800 space-y-3">
                        <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white">
                            <Home size={12} /> <span className="text-[10px] font-black uppercase tracking-widest">HOME</span>
                        </Link>
                        <div className="rounded-lg border-2 border-white bg-brand-bg px-4 py-2.5 brutal-shadow-black">
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">TOTAL AVAILABLE</p>
                            <span className="text-2xl font-black text-brand-blue">{totalComponents}</span>
                        </div>
                    </div>
                    <nav className="shrink-0 px-3 py-4 space-y-3" onMouseLeave={closePreview}>
                        <div className="border border-neutral-800 rounded bg-brand-bg p-2.5">
                            <button onClick={() => setShowUpdates(!showUpdates)} className="w-full flex items-center justify-between text-[10px] uppercase font-black">
                                <span>Follow Updates</span>
                                <ChevronDown size={12} />
                            </button>
                            {showUpdates && (
                                <div className="mt-2 pt-2 border-t border-neutral-800 flex flex-col gap-1 text-[10px] font-mono">
                                    <a href="https://www.instagram.com/jainilll_2208/" target="_blank" rel="noreferrer" className="text-brand-blue hover:underline">
                                        Instagram @jainilll_2208
                                    </a>
                                    <a href="https://github.com/jainil224" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white">
                                        GitHub @jainil224
                                    </a>
                                </div>
                            )}
                        </div>
                        <div className="border border-neutral-800 rounded bg-brand-bg p-2.5">
                            <button onClick={() => setShowGetStarted(!showGetStarted)} className="w-full flex items-center justify-between text-[10px] uppercase font-black">
                                <span className="!text-brand-yellow">Get Started</span>
                                <ChevronDown size={12} className={`transition-transform duration-200 ${showGetStarted ? 'rotate-180 text-brand-blue' : 'text-neutral-500'}`} />
                            </button>
                            {showGetStarted && (
                                <div className="mt-2 pt-2 border-t border-neutral-800 flex flex-col gap-0.5">
                                    {GET_STARTED_PAGES.map(doc => {
                                        const isActive = activeDocId === doc.id;
                                        return (
                                            <button
                                                key={doc.id}
                                                onClick={() => handleDocSelect(doc.id)}
                                                className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all duration-150 ${
                                                    isActive
                                                        ? 'bg-brand-blue text-white border-2 border-white shadow-[3px_3px_0px_0px_#000000] translate-x-1'
                                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70 hover:translate-x-1'
                                                }`}
                                            >
                                                <span className="text-xs">{doc.icon}</span>
                                                <span className="truncate">{doc.title}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <div className="pt-2">
                            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black px-2 mb-2">COMPONENTS</p>
                            <div className="space-y-1.5">
                                {categories.map((cat, idx) => {
                                    const hasActive = cat.items.some(item => highlightedComponentId === item.id);
                                    const isExpanded = expandedCategories.includes(cat.name);
                                    
                                    return (
                                        <div key={idx} className="rounded-lg transition-colors">
                                            <button 
                                                onClick={() => toggleCategory(cat.name)} 
                                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
                                                    hasActive 
                                                        ? 'bg-neutral-900/90 border-brand-blue/60 text-white shadow-sm' 
                                                        : 'border-transparent text-neutral-300 hover:bg-neutral-900/60 hover:text-white hover:border-neutral-800'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />}
                                                    <span className="text-[10px] font-black uppercase tracking-wider !text-brand-yellow">
                                                        {cat.name}
                                                    </span>
                                                </div>
                                                <ChevronDown size={11} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-brand-blue' : 'text-neutral-500'}`} />
                                            </button>
                                            
                                            {isExpanded && (
                                                <div className="pl-2.5 py-1.5 border-l-2 border-neutral-800/80 ml-3.5 space-y-1 mt-1">
                                                    {cat.items.map(item => {
                                                        const isActive = highlightedComponentId === item.id;
                                                        return (
                                                            <button 
                                                                key={item.id} 
                                                                data-active-component={isActive ? 'true' : undefined}
                                                                onClick={() => handleComponentSelect(item)} 
                                                                onMouseEnter={(e) => handlePreviewEnter(item, e)}
                                                                onMouseLeave={handlePreviewLeave}
                                                                onFocus={() => prefetchComponentChunk(item.id)}
                                                                className={`w-full flex items-center justify-between text-left px-2.5 py-1.5 rounded-md text-[11px] uppercase tracking-wider font-bold transition-all duration-150 group ${
                                                                    isActive 
                                                                        ? 'bg-brand-blue text-white border-2 border-white shadow-[3px_3px_0px_0px_#000000] translate-x-1 z-10' 
                                                                        : 'text-neutral-400 hover:text-white hover:bg-neutral-800/70 hover:translate-x-1 hover:border-l-2 hover:border-brand-blue'
                                                                }`}
                                                            >
                                                                <span className="min-w-0 truncate pr-2 flex items-center gap-1.5">
                                                                    {item.title}
                                                                    {item.isPremium && !isPro && !purchasedComponents.includes(item.id) && (
                                                                        <span className="inline-flex shrink-0" title="Premium — buy this component ($1.99) or upgrade to Pro"><Lock size={10} className="text-brand-blue shrink-0" aria-label="Premium" /></span>
                                                                    )}
                                                                    {isNewComponent(item) && (
                                                                        <span className="px-1 py-px bg-[#FFC700] text-black text-[8px] font-black uppercase leading-none rounded-sm border border-black shadow-[1px_1px_0px_0px_#000000] shrink-0">
                                                                            New
                                                                        </span>
                                                                    )}
                                                                </span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* ── Middle Column: Playground & Documentation ── */}
                <main ref={mainContainerRef} className="flex-1 min-w-0 main-scroll p-4 sm:p-6 lg:p-8 md:h-full md:overflow-y-auto">
                    <div className="w-full">
                        {/* ── Mobile "All Components" Top Bar / Button ── */}
                        <div className="md:hidden mb-4 p-2.5 sm:p-3 rounded-xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xl flex items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <span className="w-8 h-8 rounded-lg bg-[#1F4BFF]/20 border border-[#1F4BFF]/40 text-[#1F4BFF] flex items-center justify-center shrink-0">
                                    <Grid2X2 size={16} />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest leading-none mb-1">
                                        Component Library
                                    </p>
                                    <p className="text-xs font-black text-white uppercase truncate leading-none">
                                        {activeDoc ? activeDoc.title : activeComponent.title}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMobileMenuOpen(true)}
                                className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1F4BFF] hover:bg-[#2855FF] text-white text-[11px] font-black uppercase tracking-wider shadow-[0_0_15px_rgba(31,75,255,0.45)] active:scale-95 transition-all cursor-pointer"
                            >
                                <Layers size={13} />
                                <span>All ({totalComponents})</span>
                                <ChevronDown size={13} />
                            </button>
                        </div>

                        <motion.div 
                            key={activeDoc ? activeDoc.id : activeComponent.id} 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            transition={{ duration: 0.15 }}
                        >
                            {activeDoc ? (
                                <GetStartedPage
                                    page={activeDoc}
                                    onBackToIntro={() => handleDocSelect('introduction')}
                                    onBrowseLibrary={() => handleComponentSelect(allComponents[0])}
                                    onOpenMcp={() => navigate('/dashboard/mcp')}
                                />
                            ) : (
                                <ComponentDetail item={activeComponent} onBack={() => {}} />
                            )}
                        </motion.div>
                    </div>
                </main>

                {/* ── Right Column: Pro Card at Top + MCP Card at Bottom ── */}
                <aside className="hidden xl:flex flex-col w-64 2xl:w-72 shrink-0 xl:h-full border-l-4 border-black bg-brand-surface/60 p-5 overflow-y-auto sidebar-scroll gap-5 z-30">
                    {/* Pro Promotional Card at Top */}
                    <div className="w-full shrink-0">
                        <div className="rounded-xl border-2 border-white bg-brand-surface p-3.5 text-white brutal-shadow-black relative overflow-hidden group">
                            {/* Ambient brand blue accent */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-blue/15 blur-xl pointer-events-none" />
                            <div className="absolute -bottom-12 -left-12 w-28 h-28 rounded-full bg-emerald-400/10 blur-xl pointer-events-none" />

                            {/* PRO Badge */}
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-black bg-brand-blue text-white text-[9px] font-black uppercase tracking-wider mb-2 font-mono shadow-[2px_2px_0px_0px_#000000]">
                                <Crown size={9} strokeWidth={2.5} />
                                PRO
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug mb-1 font-heading">
                                Unlock Everything
                            </h4>

                            {/* Hook */}
                            <p className="text-[11px] text-neutral-300 leading-relaxed mb-2">
                                Some components are locked. Go Pro to download full source code, generate with premium AI, and get every new drop first.
                            </p>

                            {/* Feature Checklist */}
                            <ul className="space-y-1 mb-2.5">
                                {[
                                    'Full component source code',
                                    'Premium AI — Antigravity + Claude',
                                    'Early access to new components',
                                    'Unlimited storage & 24/7 support',
                                ].map(f => (
                                    <li key={f} className="flex items-start gap-1.5 text-[10.5px] text-neutral-200 font-medium leading-snug">
                                        <Check size={11} strokeWidth={3} className="text-emerald-400 mt-0.5 shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Explore Pro CTA Button */}
                            <Link
                                to="/pricing"
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-brand-blue hover:bg-[#324FE0] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all mb-2 no-underline cursor-pointer font-heading"
                            >
                                <Sparkles size={13} strokeWidth={2.5} />
                                <span>Go Pro</span>
                                <ArrowRight size={13} strokeWidth={2.5} />
                            </Link>

                            {/* Discount Code Pill */}
                            <div
                                onClick={() => {
                                    navigator.clipboard.writeText('UIHUB30');
                                    alert("Coupon code 'UIHUB30' copied to clipboard! 30% discount applied.");
                                }}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-neutral-950 border border-emerald-400/40 text-[10px] text-neutral-300 font-medium cursor-pointer hover:border-emerald-400 hover:text-white transition-colors"
                                title="Click to copy code UIHUB30"
                            >
                                <span>⚡</span>
                                <span>Pro Access - 30% off: <strong className="text-emerald-400 font-bold font-mono">UIHUB30</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* UI HUB Component Library Branding Card */}
                    <div className="w-full shrink-0 rounded-xl border-2 border-white bg-brand-surface p-3.5 text-white brutal-shadow-black relative overflow-hidden">
                        {/* Ambient glow */}
                        <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-blue/15 blur-xl pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-24 h-24 rounded-full bg-[#FFC700]/8 blur-xl pointer-events-none" />

                        {/* Header: Logo + version badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <img
                                    src={uiHubLogo}
                                    alt="UI HUB"
                                    className="w-7 h-7 rounded-sm object-contain border border-white/20"
                                />
                                <div>
                                    <p className="text-[8px] font-mono uppercase tracking-widest text-neutral-500 leading-none">Component</p>
                                    <h4 className="text-[11px] font-black text-white uppercase tracking-tight leading-tight font-heading">
                                        UI HUB
                                    </h4>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-black bg-brand-blue text-white text-[9px] font-black uppercase tracking-wider font-mono shadow-[2px_2px_0px_0px_#000000]">
                                <Sparkles size={8} strokeWidth={2.5} />
                                LIBRARY
                            </div>
                        </div>

                        {/* Tagline */}
                        <p className="text-[11px] text-neutral-300 leading-relaxed mb-2">
                            Every component, template &amp; animation — searchable straight from your AI client.
                        </p>

                        {/* Kicker */}
                        <p className="text-[9px] font-mono uppercase tracking-widest text-brand-blue mb-1.5">
                            Everything your AI can do
                        </p>

                        {/* Capability stats — tool count mirrors
                            mcp-server/src/tools/index.ts (TOOLS registry). Keep in sync. */}
                        <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                            {[
                                { value: '14', label: 'AI Tools', color: 'text-brand-blue' },
                                { value: String(totalComponents), label: 'Components', color: 'text-white' },
                                { value: '5', label: 'AI Clients', color: 'text-emerald-400' },
                                { value: '13', label: 'Categories', color: 'text-brand-yellow' },
                            ].map(s => (
                                <div key={s.label} className="flex flex-col items-start p-2 rounded-lg border-2 border-black bg-black shadow-[2px_2px_0px_0px_#3D5CFF]">
                                    <span className={`text-xs font-black font-mono leading-none ${s.color}`}>{s.value}</span>
                                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-wide mt-0.5">{s.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* CTA Button — matches site's brutal primary style */}
                        <Link
                            to="/dashboard/mcp"
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-brand-blue hover:bg-[#324FE0] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all no-underline cursor-pointer font-heading"
                        >
                            <Bot size={13} strokeWidth={2.5} />
                            <span>Connect AI</span>
                            <ArrowRight size={13} strokeWidth={2.5} />
                        </Link>
                    </div>
                </aside>
            </div>

            {/* ── Mobile Floating "All Components" Action Button ── */}
            <button
                type="button"
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden fixed bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#1F4BFF] hover:bg-[#2855FF] text-white text-xs font-black uppercase tracking-wider shadow-[0_8px_25px_rgba(31,75,255,0.7)] border-2 border-white/20 active:scale-95 transition-all cursor-pointer"
                aria-label="Open all components menu"
            >
                <Grid2X2 size={15} />
                <span>All Components ({totalComponents})</span>
            </button>

            <AnimatePresence>
                {hoverPreview && (
                    <HoverPreviewPopover
                        key={hoverPreview.item.id}
                        item={hoverPreview.item}
                        rect={hoverPreview.rect}
                        onClose={closePreview}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default LibraryPage;
