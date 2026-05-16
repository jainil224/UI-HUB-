import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronRight, ChevronDown, Home, Lock, Zap, Sparkles, ArrowRight, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import ComponentDetail from './sections/ComponentDetail/index';
import { componentList, ComponentItem } from '../../data/componentData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface Category {
    name: string;
    items: ComponentItem[];
}

const CATEGORY_META: Record<string, { icon: string; color: string; glow: string; bg: string; border: string }> = {
    "Buttons/hover effects":  { icon: "⚡", color: "text-yellow-400",  glow: "shadow-[0_0_12px_rgba(250,204,21,0.5)]",  bg: "bg-yellow-400/10",  border: "border-yellow-400/20" },
    "Text Animations":        { icon: "✦",  color: "text-pink-400",    glow: "shadow-[0_0_12px_rgba(244,114,182,0.5)]", bg: "bg-pink-400/10",    border: "border-pink-400/20" },
    "Visual Effects":         { icon: "◈",  color: "text-purple-400",  glow: "shadow-[0_0_12px_rgba(192,132,252,0.5)]", bg: "bg-purple-400/10",  border: "border-purple-400/20" },
    "3D Design":              { icon: "⬡",  color: "text-cyan-400",    glow: "shadow-[0_0_12px_rgba(34,211,238,0.5)]",  bg: "bg-cyan-400/10",    border: "border-cyan-400/20" },
    "Backgrounds":            { icon: "◉",  color: "text-orange-400",  glow: "shadow-[0_0_12px_rgba(251,146,60,0.5)]",  bg: "bg-orange-400/10",  border: "border-orange-400/20" },
    "Cursor Effects":         { icon: "⊕",  color: "text-brand-green", glow: "shadow-[0_0_12px_rgba(0,255,159,0.5)]",   bg: "bg-brand-green/10", border: "border-brand-green/20" },
    "Portfolios":             { icon: "▣",  color: "text-blue-400",    glow: "shadow-[0_0_12px_rgba(96,165,250,0.5)]",  bg: "bg-blue-400/10",    border: "border-blue-400/20" },
    "Community Uploads":      { icon: "✿",  color: "text-rose-400",    glow: "shadow-[0_0_12px_rgba(251,113,133,0.5)]", bg: "bg-rose-400/10",    border: "border-rose-400/20" },
    "3D CHATBOT":             { icon: "🤖", color: "text-lime-400",    glow: "shadow-[0_0_12px_rgba(163,230,53,0.5)]", bg: "bg-lime-400/10",    border: "border-lime-400/20" },
};
const DEFAULT_META = { icon: "◆", color: "text-white/50", glow: "", bg: "bg-white/5", border: "border-white/10" };

const LibraryPage = () => {
    const { theme, toggleTheme } = useTheme();
    const { user, isPro } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');
    const qFromUrl = queryParams.get('q') || '';

    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);

    const allComponents = [...componentList, ...firebaseComponents];

    const defaultComponent = allComponents.find(c => c.id === idFromUrl) || allComponents.find(c => c.id === 'corner-border-button') || allComponents[0];
    const [activeComponent, setActiveComponent] = useState<ComponentItem>(defaultComponent);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState(qFromUrl);

    useEffect(() => {
        setSearchQuery(qFromUrl);
    }, [qFromUrl]);

    useEffect(() => {
        const q = query(collection(db, 'components'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    title: data.componentName,
                    description: data.description,
                    category: 'custom',
                    code: data.code,
                    vibePrompt: "Community generated layout",
                    preview: () => (
                        <div className="text-4xl md:text-6xl font-display font-bold uppercase tracking-tight opacity-20 px-8 text-center animate-pulse">
                            {data.componentName}
                        </div>
                    ),
                    uploader: data.uploaderName || 'Anonymous'
                } as ComponentItem;
            });
            setFirebaseComponents(fetched);
        });
        return unsubscribe;
    }, []);

    useEffect(() => {
        const found = allComponents.find(c => c.id === idFromUrl);
        if (found) {
            setActiveComponent(found);
        }
    }, [idFromUrl, firebaseComponents]);

    useEffect(() => {
        if (!idFromUrl && allComponents.length > 0) {
            navigate(`/library?id=${defaultComponent.id}`, { replace: true });
        }
    }, [idFromUrl, navigate, defaultComponent.id, allComponents.length]);

    const baseCategories: Category[] = [
        { name: "3D Design", items: allComponents.filter(item => item.category === '3d') },
        { name: "Backgrounds", items: allComponents.filter(item => item.category === 'background') },
        { name: "Cursor Effects", items: allComponents.filter(item => item.category === 'cursor') },
        { name: "Buttons/hover effects", items: allComponents.filter(item => item.category === 'button') },
        { name: "3D CHATBOT", items: allComponents.filter(item => item.category === '3d-chatbot') },
        { name: "Text Animations", items: allComponents.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: allComponents.filter(item => item.category === 'effect') },
        { name: "Portfolios", items: allComponents.filter(item => item.category === 'portfolios') },
        { name: "Community Uploads", items: allComponents.filter(item => item.category === 'custom') },
    ];

    const categories = baseCategories
        .map(cat => {
            const isCatMatch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
            return {
                ...cat,
                items: cat.items.filter(item =>
                    searchQuery === '' ||
                    isCatMatch ||
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                )
            };
        })
        .filter(cat => cat.items.length > 0 || (searchQuery === '' && cat.name === "3D CHATBOT"));

    // Initial expansion: expand the active component's category
    useEffect(() => {
        if (activeComponent) {
            const activeCat = baseCategories.find(cat => cat.items.some(item => item.id === activeComponent.id));
            if (activeCat) {
                setExpandedCategories(prev => {
                    if (!prev.includes(activeCat.name)) {
                        return [...prev, activeCat.name];
                    }
                    return prev;
                });
            }
        }
    }, [activeComponent.id, allComponents.length]);

    // Expand categories when searching
    useEffect(() => {
        if (searchQuery.trim() !== '') {
            // Re-derive matches to avoid dependency loop with `categories`
            const matchedCategories = baseCategories
                .map(cat => {
                    const isCatMatch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
                    return {
                        ...cat,
                        items: cat.items.filter(item =>
                            isCatMatch ||
                            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()))
                        )
                    };
                })
                .filter(cat => cat.items.length > 0);

            const matchingCatNames = matchedCategories.map(cat => cat.name);
            setExpandedCategories(prev => Array.from(new Set([...prev, ...matchingCatNames])));

            const allMatched = matchedCategories.flatMap(cat => cat.items);
            if (allMatched.length > 0) {
                const isCurrentMatched = allMatched.some(item => item.id === activeComponent.id);
                if (!isCurrentMatched) {
                    const firstMatch = allMatched[0];
                    setActiveComponent(firstMatch);
                    navigate(`/library?id=${firstMatch.id}&q=${encodeURIComponent(searchQuery)}`, { replace: true });
                }
            }
        }
    }, [searchQuery, allComponents.length, activeComponent.id, navigate]);

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev =>
            prev.includes(name)
                ? prev.filter(c => c !== name)
                : [...prev, name]
        );
    };

    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
    };

    const totalComponents = allComponents.length;



    return (
        <>
            <style>{`
                .sidebar-scroll::-webkit-scrollbar {
                    width: 3px;
                }
                .sidebar-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sidebar-scroll::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? 'linear-gradient(to bottom, #00ff9f, #00cc7a, #00ff9f)' : 'linear-gradient(to bottom, #5FA3D6, #2C5C85, #5FA3D6)'};
                    border-radius: 99px;
                    box-shadow: 0 0 8px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.6)' : 'rgba(95, 163, 214, 0.4)'};
                }
                .sidebar-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? 'linear-gradient(to bottom, #00ff9f, #00e68a)' : 'linear-gradient(to bottom, #5FA3D6, #4A8CBF)'};
                    box-shadow: 0 0 12px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.9)' : 'rgba(95, 163, 214, 0.6)'};
                }
                .sidebar-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${theme === 'dark' ? '#00ff9f' : '#5FA3D6'} transparent;
                }
                .main-scroll::-webkit-scrollbar {
                    width: 4px;
                }
                .main-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .main-scroll::-webkit-scrollbar-thumb {
                    background: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'};
                    border-radius: 99px;
                }
                .main-scroll::-webkit-scrollbar-thumb:hover {
                    background: ${theme === 'dark' ? 'rgba(0, 255, 159, 0.3)' : 'rgba(95, 163, 214, 0.3)'};
                }
                .main-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'} transparent;
                }
                .nav-item-glow {
                    box-shadow: 0 0 20px ${theme === 'dark' ? 'rgba(0, 255, 159, 0.15)' : 'rgba(95, 163, 214, 0.15)'}, inset 0 1px 0 ${theme === 'dark' ? 'rgba(0, 255, 159, 0.1)' : 'rgba(95, 163, 214, 0.1)'};
                }
            `}</style>

            <div className={`h-dvh flex flex-col md:flex-row overflow-hidden relative pt-[73px] transition-colors duration-300 ${theme === 'dark' ? 'bg-brand-black text-white' : 'bg-[#CFE6F7] text-[#0A0F14]'}`}>

                {/* ── Mobile top nav bar ── */}
                <div className={`md:hidden flex items-center justify-between px-4 py-3 border-b shrink-0 z-30 backdrop-blur-xl ${theme === 'dark' ? 'bg-[#050505]/90 border-white/[0.06]' : 'bg-white/70 border-black/[0.06]'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/" className={`shrink-0 p-2 rounded-xl border transition-all ${
                            theme === 'dark' 
                            ? 'bg-white/[0.04] border-white/[0.06] text-white/40 hover:text-brand-green hover:border-brand-green/30' 
                            : 'bg-black/[0.04] border-black/[0.06] text-black/40 hover:text-[#5FA3D6] hover:border-[#5FA3D6]/30'
                        }`}>
                            <Home size={14} />
                        </Link>

                        <div className="flex flex-col min-w-0">
                            <span className={`text-[8px] uppercase tracking-[0.2em] font-black ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Now Viewing</span>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-sm font-bold truncate ${theme === 'dark' ? 'text-brand-green' : 'text-[#2C5C85]'}`}>{activeComponent.title}</span>
                                {activeComponent.isPremium && !isPro && <Lock size={9} className="text-amber-400 shrink-0" />}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-brand-green/10 border border-brand-green/20 rounded-full text-brand-green text-[10px] font-black uppercase tracking-widest shrink-0 ml-2"
                    >
                        <MenuIcon size={12} />
                        Browse
                    </button>
                </div>

                {/* ── Mobile full-screen menu overlay ── */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            data-lenis-prevent
                            className="fixed inset-0 bg-[#030303]/98 backdrop-blur-2xl z-[999] md:hidden overflow-y-auto sidebar-scroll p-6 pt-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/"
                                        className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 hover:text-brand-green hover:border-brand-green/30 transition-all"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Home size={16} />
                                    </Link>
                                    <div>
                                        <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-black">UI HUB</p>
                                        <h3 className="text-xl font-display uppercase tracking-tight text-white">Component Library</h3>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2.5 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 hover:text-white hover:border-white/10 transition-all"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="flex items-center gap-2 mb-6 px-3 py-2 rounded-xl bg-brand-green/5 border border-brand-green/10">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_6px_rgba(0,255,159,0.8)]" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/60">{totalComponents} Components Available</span>
                            </div>


                            {categories.map((cat, idx) => {
                                const isExpanded = expandedCategories.includes(cat.name);
                                const meta = CATEGORY_META[cat.name] || DEFAULT_META;
                                return (
                                    <div key={idx} className="mb-2">
                                        <button
                                            onClick={() => toggleCategory(cat.name)}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border ${
                                                isExpanded
                                                    ? `${meta.bg} ${meta.border}`
                                                    : 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.10]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg shrink-0 transition-all ${
                                                    isExpanded ? `${meta.bg} ${meta.border} ${meta.glow}` : 'bg-white/[0.04] border-white/[0.06]'
                                                }`}>{meta.icon}</div>
                                                <div>
                                                    <h4 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                        isExpanded ? 'text-white' : 'text-white/60'
                                                    }`}>{cat.name}</h4>
                                                    <p className={`text-[8px] font-bold transition-colors ${isExpanded ? meta.color : 'text-white/25'}`}>{cat.items.length} items</p>
                                                </div>
                                            </div>
                                            <motion.div animate={{ rotate: isExpanded ? 0 : -90 }} transition={{ duration: 0.2 }} className={`transition-colors ${isExpanded ? 'text-white/50' : 'text-white/15'}`}>
                                                <ChevronDown size={14} />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isExpanded && (
                                                <motion.ul
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    className="space-y-1 overflow-hidden mt-1 pl-2"
                                                >
                                                    {cat.items.map((item, itemIdx) => {
                                                        const isActive = activeComponent.id === item.id;
                                                        return (
                                                            <motion.li
                                                                key={item.id}
                                                                initial={{ opacity: 0, x: -8 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: itemIdx * 0.025 }}
                                                                onClick={() => handleComponentSelect(item)}
                                                                className={`p-3 pl-4 rounded-xl flex items-center justify-between transition-all border cursor-pointer ${
                                                                    isActive
                                                                        ? `${meta.bg} ${meta.border} ${meta.glow}`
                                                                        : 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/[0.08]'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                                                        isActive
                                                                            ? `${meta.color.replace('text-', 'bg-')} ${meta.glow}`
                                                                            : 'bg-white/15'
                                                                    }`} />
                                                                    <span className={`text-sm truncate transition-colors ${
                                                                        isActive ? `${meta.color} font-bold` : 'text-white/65 font-medium'
                                                                    }`}>{item.title}</span>
                                                                    {item.isPremium && !isPro && !isActive && (
                                                                        <Lock size={9} className="text-amber-400/70 shrink-0" />
                                                                    )}
                                                                </div>
                                                                {isActive && (
                                                                    <ChevronRight size={12} className={`${meta.color} shrink-0`} />
                                                                )}
                                                            </motion.li>
                                                        );
                                                    })}
                                                </motion.ul>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Desktop sidebar ── */}
                <aside
                    data-lenis-prevent
                    className="hidden md:flex flex-col w-72 shrink-0 h-full border-r border-white/[0.06] backdrop-blur-xl relative bg-[#050505]/80"
                >
                    {/* Animated top glow line */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-green/60 to-transparent" />
                    <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-brand-green/[0.05] via-transparent to-transparent pointer-events-none" />

                    {/* Sidebar Header */}
                    <div className="shrink-0 px-5 pt-6 pb-5 border-b border-white/[0.05]">
                        {/* Title row */}
                        <div className="flex items-center justify-between mb-4">
                            <Link to="/" className="group flex items-center gap-2.5 transition-all duration-300 text-white/40 hover:text-brand-green">
                                <div className="w-7 h-7 rounded-lg border bg-white/[0.03] border-white/[0.08] flex items-center justify-center transition-all group-hover:border-brand-green/40 group-hover:bg-brand-green/8 group-hover:shadow-[0_0_12px_rgba(0,255,159,0.2)]">
                                    <Home size={13} />
                                </div>
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Home</span>
                            </Link>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-green/10 border border-brand-green/20">
                                <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_6px_rgba(0,255,159,0.9)]" />
                                <span className="text-[9px] font-black text-brand-green tracking-wider">LIVE</span>
                            </div>
                        </div>

                        {/* Stats card */}
                        <div className="relative overflow-hidden rounded-xl border border-brand-green/15 bg-gradient-to-br from-brand-green/[0.06] to-transparent px-4 py-3 mb-4">
                            <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-green/10 rounded-full blur-2xl" />
                            <p className="text-[8px] text-white/30 uppercase tracking-[0.2em] font-black mb-0.5">Total Available</p>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-black text-brand-green leading-none tabular-nums">{totalComponents}</span>
                                <span className="text-[10px] text-white/40 font-bold mb-1">components</span>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar scrollable nav */}
                    <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-1">
                        <p className="text-[8px] uppercase tracking-[0.25em] text-white/20 font-black px-3 mb-3">Browse Categories</p>
                        {categories.map((cat, idx) => {
                            const isExpanded = expandedCategories.includes(cat.name);
                            const meta = CATEGORY_META[cat.name] || DEFAULT_META;
                            const hasActiveItem = cat.items.some(item => item.id === activeComponent.id);
                            const isHighlighted = isExpanded || hasActiveItem;

                            return (
                                <div key={idx}>
                                    <motion.button
                                        onClick={() => toggleCategory(cat.name)}
                                        whileHover={{ x: 2 }}
                                        transition={{ duration: 0.15 }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group text-left relative overflow-hidden ${
                                            isHighlighted
                                                ? 'bg-white/[0.04] border border-white/[0.08]'
                                                : 'border border-transparent hover:bg-white/[0.03] hover:border-white/[0.05]'
                                        }`}
                                    >
                                        {/* Active left border indicator */}
                                        {isHighlighted && (
                                            <div className={`absolute left-0 top-2 bottom-2 w-0.5 rounded-full ${meta.color.replace('text-', 'bg-')} opacity-80`} />
                                        )}
                                        <div className="flex items-center gap-3">
                                            {/* Colored icon chip */}
                                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 text-base transition-all duration-200 ${
                                                isHighlighted
                                                    ? `${meta.bg} ${meta.border} ${meta.glow}`
                                                    : 'bg-white/[0.03] border-white/[0.06] group-hover:bg-white/[0.06]'
                                            }`}>
                                                {meta.icon}
                                            </div>
                                            <div>
                                                <h4 className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                                                    isHighlighted ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                                                }`}>
                                                    {cat.name}
                                                </h4>
                                                <p className={`text-[8px] tabular-nums font-bold transition-colors ${
                                                    isHighlighted ? meta.color : 'text-white/20 group-hover:text-white/35'
                                                }`}>{cat.items.length} items</p>
                                            </div>
                                        </div>
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 0 : -90 }}
                                            transition={{ duration: 0.2 }}
                                            className={`shrink-0 transition-colors ${isExpanded ? 'text-white/50' : 'text-white/15 group-hover:text-white/35'}`}
                                        >
                                            <ChevronDown size={13} />
                                        </motion.div>
                                    </motion.button>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.ul
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: 'easeOut' }}
                                                className="overflow-hidden py-1"
                                            >
                                                <div className={`ml-4 pl-3 border-l space-y-0.5 ${meta.border} opacity-80`}>
                                                    {cat.items.map((item, itemIdx) => {
                                                        const isActive = activeComponent.id === item.id;
                                                        return (
                                                            <motion.li
                                                                key={item.id}
                                                                initial={{ opacity: 0, x: -6 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: itemIdx * 0.03 }}
                                                                onClick={() => handleComponentSelect(item)}
                                                                whileHover={{ x: 3 }}
                                                                className={`cursor-pointer flex items-center justify-between gap-2 px-3 py-2 rounded-lg transition-all duration-150 ${
                                                                    isActive
                                                                        ? `${meta.bg} border ${meta.border}`
                                                                        : 'hover:bg-white/[0.04] border border-transparent'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-2 min-w-0">
                                                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                                                        isActive
                                                                            ? `${meta.color.replace('text-', 'bg-')} ${meta.glow}`
                                                                            : 'bg-white/10'
                                                                    }`} />
                                                                    <span className={`text-[11px] truncate transition-colors ${
                                                                        isActive ? `${meta.color} font-bold` : 'text-white/55 font-medium hover:text-white/90'
                                                                    }`}>{item.title}</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    {item.isPremium && !isPro && (
                                                                        <Lock size={8} className="text-amber-400/70" />
                                                                    )}
                                                                    {isActive && (
                                                                        <ChevronRight size={10} className={meta.color} />
                                                                    )}
                                                                </div>
                                                            </motion.li>
                                                        );
                                                    })}
                                                </div>
                                            </motion.ul>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                        <div className="h-4" />
                    </nav>

                    {/* ── Pro Upgrade CTA ── */}
                    {!isPro && (
                        <div className="shrink-0 px-4 pb-5">
                            <Link to="/pricing" className="group relative block overflow-hidden rounded-2xl border border-brand-green/20 bg-gradient-to-br from-brand-green/10 via-brand-green/5 to-transparent p-4 hover:border-brand-green/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,255,159,0.15)]">
                                <div className="absolute -top-6 -right-6 w-20 h-20 bg-brand-green/20 rounded-full blur-2xl group-hover:bg-brand-green/30 transition-colors" />
                                <div className="flex items-start gap-3 relative z-10">
                                    <div className="w-8 h-8 rounded-xl bg-brand-green/20 border border-brand-green/30 flex items-center justify-center shrink-0 group-hover:shadow-[0_0_12px_rgba(0,255,159,0.4)] transition-shadow">
                                        <Sparkles size={14} className="text-brand-green" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black text-brand-green uppercase tracking-widest">Unlock Pro</p>
                                        <p className="text-[9px] text-white/40 leading-tight mt-0.5">Access premium components &amp; AI models</p>
                                    </div>
                                    <ArrowRight size={14} className="text-brand-green/50 shrink-0 mt-1 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </Link>
                        </div>
                    )}

                    {/* Bottom glow accent */}
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-green/20 to-transparent" />
                </aside>

                {/* ── Main content ── */}
                <main data-lenis-prevent className="flex-1 min-h-0 overflow-y-auto main-scroll p-4 pt-5 md:p-12 md:pt-12">
                    <div className="max-w-6xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeComponent.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.25, ease: 'easeOut' }}
                            >
                                <ComponentDetail
                                    item={activeComponent}
                                    onBack={() => { }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </>
    );
};

export default LibraryPage;
