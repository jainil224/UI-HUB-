import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu as MenuIcon, X, ChevronDown, Home, ArrowRight } from 'lucide-react';
import ComponentDetail from './sections/ComponentDetail/index';
import { componentList, ComponentItem } from '../../data/componentData';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

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
    "Cursor Effects": { icon: "⊕", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Community Uploads": { icon: "✿", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "3D CHATBOT": { icon: "🤖", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
    "Scroll Animation": { icon: "↕", color: "text-brand-blue", bg: "bg-brand-surface", border: "border-brand-blue" },
};

const LibraryPage = () => {
    const { isPro } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const idFromUrl = queryParams.get('id');
    const qFromUrl = queryParams.get('q') || '';

    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);
    const allComponents = [...componentList, ...firebaseComponents];

    const defaultComponent = allComponents.find(c => c.id === idFromUrl) || allComponents.find(c => c.id === '3d-hero') || allComponents[0];
    const [activeComponent, setActiveComponent] = useState<ComponentItem>(defaultComponent);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState(qFromUrl);

    const [showUpdates, setShowUpdates] = useState(false);

    const mainContainerRef = useRef<HTMLElement>(null);

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
                    description: data.description || "Community contributed component",
                    category: data.category || "Community Uploads",
                    preview: () => (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <h3 className="text-xl font-bold text-white mb-2">{data.componentName}</h3>
                            <p className="text-xs text-neutral-400 max-w-sm mb-4">{data.description}</p>
                        </div>
                    ),
                    code: data.code || "// No code available",
                    isPremium: false,
                    vibePrompt: data.vibePrompt || data.description || ""
                } as ComponentItem;
            });
            setFirebaseComponents(fetched);
        }, (error) => {
            console.error("Failed to load Firebase components:", error);
        });
        return () => unsubscribe();
    }, []);

    const baseCategories: Category[] = [
        { name: "Buttons/hover effects", items: allComponents.filter(item => item.category === 'button') },
        { name: "Text Animations", items: allComponents.filter(item => item.category === 'text') },
        { name: "Visual Effects", items: allComponents.filter(item => item.category === 'effect') },
        { name: "3D Design", items: allComponents.filter(item => item.category === '3d' || item.id.startsWith('3d-')) },
        { name: "Backgrounds", items: allComponents.filter(item => item.category === 'background') },
        { name: "Cursor Effects", items: allComponents.filter(item => item.category === 'cursor') },
        { name: "3D CHATBOT", items: allComponents.filter(item => item.category === '3d-chatbot') },
        { name: "Scroll Animation", items: allComponents.filter(item => item.category === 'scroll') },
        { name: "Community Uploads", items: allComponents.filter(item => item.category === 'custom') },
    ];

    const categories = baseCategories
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
        .filter(cat => cat.items.length > 0);

    useEffect(() => {
        if (activeComponent) {
            const activeCat = baseCategories.find(cat => cat.items.some(item => item.id === activeComponent.id));
            if (activeCat) {
                setExpandedCategories(prev => prev.includes(activeCat.name) ? prev : [...prev, activeCat.name]);
            }
        }
    }, [activeComponent.id, allComponents.length]);

    const toggleCategory = (name: string) => {
        setExpandedCategories(prev => prev.includes(name) ? prev.filter(c => c !== name) : [...prev, name]);
    };

    const handleComponentSelect = (item: ComponentItem) => {
        setActiveComponent(item);
        setIsMobileMenuOpen(false);
        navigate(`/library?id=${item.id}`, { replace: true });
        if (mainContainerRef.current) mainContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
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

            <div className="h-dvh flex flex-col md:flex-row overflow-hidden relative pt-16 bg-brand-bg text-white select-none">
                {/* ── Mobile top nav ── */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b-2 border-white shrink-0 z-30 bg-brand-surface">
                    <span className="font-bold text-sm uppercase">UI HUB</span>
                    <button onClick={() => setIsMobileMenuOpen(true)}><MenuIcon size={20} /></button>
                </div>

                {/* ── Mobile Menu Overlay ── */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="fixed inset-0 bg-brand-bg z-[999] md:hidden overflow-y-auto sidebar-scroll p-6 pt-8 border-r-2 border-white"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-bold">UI HUB</span>
                                <button onClick={() => setIsMobileMenuOpen(false)}><X size={18} /></button>
                            </div>
                            {categories.map((cat, idx) => (
                                <div key={idx} className="mb-4">
                                    <h4 className="text-xs font-black uppercase text-neutral-500 mb-2">{cat.name}</h4>
                                    {cat.items.map(item => (
                                        <button key={item.id} onClick={() => handleComponentSelect(item)} className="block py-1 text-xs">{item.title}</button>
                                    ))}
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Left Column: Categories & Available Components ── */}
                <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 h-full border-r-4 border-black bg-brand-surface relative select-none">
                    <div className="shrink-0 px-5 pt-5 pb-4 border-b-2 border-neutral-800 space-y-3">
                        <Link to="/" className="flex items-center gap-2 text-neutral-400 hover:text-white">
                            <Home size={12} /> <span className="text-[10px] font-black uppercase tracking-widest">HOME</span>
                        </Link>
                        <div className="rounded-lg border-2 border-white bg-brand-bg px-4 py-2.5 brutal-shadow-black">
                            <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">TOTAL AVAILABLE</p>
                            <span className="text-2xl font-black text-brand-blue">{totalComponents}</span>
                        </div>
                    </div>
                    <nav className="flex-1 overflow-y-auto sidebar-scroll px-3 py-4 space-y-3">
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
                        <div className="pt-2">
                            <p className="text-[9px] uppercase tracking-widest text-neutral-500 font-black px-2 mb-2">COMPONENTS</p>
                            <div className="space-y-1.5">
                                {categories.map((cat, idx) => (
                                    <div key={idx}>
                                        <button onClick={() => toggleCategory(cat.name)} className="w-full flex items-center justify-between px-3 py-2 rounded border border-transparent hover:border-neutral-800">
                                            <span className="text-[10px] font-black uppercase">{cat.name}</span>
                                            <ChevronDown size={11} />
                                        </button>
                                        {expandedCategories.includes(cat.name) && (
                                            <div className="pl-3 py-1 border-l-2 border-neutral-800 ml-3">
                                                {cat.items.map(item => (
                                                    <button key={item.id} onClick={() => handleComponentSelect(item)} className="block text-left py-1.5 text-[11px] uppercase tracking-wider text-neutral-400 hover:text-white">
                                                        {item.title}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </nav>
                </aside>

                {/* ── Middle Column: Playground & Documentation ── */}
                <main ref={mainContainerRef} className="flex-1 min-h-0 overflow-y-auto main-scroll p-6 lg:p-10">
                    <div className="max-w-4xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeComponent.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                                <ComponentDetail item={activeComponent} onBack={() => {}} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* ── Right Column: Pro Card at Top + On This Page Stepper + Buy Me Coffee at Bottom ── */}
                <aside className="hidden xl:flex flex-col w-64 2xl:w-72 shrink-0 h-full border-l-4 border-black bg-brand-surface/60 p-5 sticky top-0 overflow-y-auto select-none gap-5">
                    {/* Pro Promotional Card at Top */}
                    <div className="w-full">
                        <div className="rounded-xl border-2 border-white bg-brand-surface p-4 text-white brutal-shadow-black relative overflow-hidden group">
                            {/* Ambient brand blue accent */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-brand-blue/15 blur-xl pointer-events-none" />

                            {/* PRO Badge */}
                            <div className="inline-flex items-center px-2 py-0.5 rounded border border-black bg-brand-blue text-white text-[9px] font-black uppercase tracking-wider mb-2.5 font-mono shadow-[2px_2px_0px_0px_#000000]">
                                PRO
                            </div>

                            {/* Title */}
                            <h4 className="text-sm font-black text-white uppercase tracking-tight leading-snug mb-1 font-heading">
                                Get UI Hub Pro
                            </h4>

                            {/* Description */}
                            <p className="text-[11px] text-neutral-300 leading-relaxed mb-3.5">
                                134 components, 238 blocks, 300 app UI blocks, 11 templates and 19 agent skills.
                            </p>

                            {/* Explore Pro CTA Button */}
                            <Link 
                                to="/pricing" 
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-brand-blue hover:bg-[#324FE0] text-white text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] hover:-translate-y-0.5 active:translate-y-0 transition-all mb-2.5 no-underline cursor-pointer font-heading"
                            >
                                <span>Explore Pro</span>
                                <ArrowRight size={13} strokeWidth={2.5} />
                            </Link>

                            {/* Discount Code Pill */}
                            <div 
                                onClick={() => {
                                    navigator.clipboard.writeText('UIHUB30');
                                    alert("Coupon code 'UIHUB30' copied to clipboard! 30% discount applied.");
                                }}
                                className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-neutral-950 border border-neutral-700 text-[10px] text-neutral-300 font-medium cursor-pointer hover:border-brand-blue hover:text-white transition-colors select-none"
                                title="Click to copy code UIHUB30"
                            >
                                <span>⚡</span>
                                <span>Pro Access - 30% off: <strong className="text-brand-blue font-bold font-mono">UIHUB30</strong></span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </>
    );
};

export default LibraryPage;
