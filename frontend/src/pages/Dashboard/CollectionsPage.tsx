import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
    listCollections, createCollection, updateCollection, deleteCollection,
    addToCollection, removeFromCollection, getCollection,
    Collection, CollectionItem, CollectionsError
} from '../../services/collections';
import { fetchCommunityComponents } from '../../services/community';
import { componentList, ComponentItem } from '../../data/componentData';
import ComponentPreviewTile from './components/ComponentPreviewTile';
import {
    Folder, FolderPlus, Trash2, Search, ArrowUpRight, Pencil, Check, X,
    Sparkles, Library, Plus, AlertTriangle, Code2, Globe, Copy, ClipboardCheck, Lock, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const shadowVariants = [
    'brutal-shadow-blue',
    'brutal-shadow-red',
    'brutal-shadow-yellow',
    'brutal-shadow-white',
];

const ICONS = ['🗂️', '⭐', '🚀', '🎨', '🧩', '💎', '🔥', '📦'];

const FREE_LIMIT = 5;

async function copyText(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch { /* fall through to legacy path */ }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
    } catch {
        return false;
    }
}

const CollectionsPage = () => {
    const { user, isPro } = useAuth();
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Create form
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newIcon, setNewIcon] = useState('🗂️');
    const [createBusy, setCreateBusy] = useState(false);

    // Active collection detail
    const [activeId, setActiveId] = useState<string | null>(null);
    const [active, setActive] = useState<Collection | null>(null);
    const [renaming, setRenaming] = useState(false);
    const [renameValue, setRenameValue] = useState('');
    const [addOpen, setAddOpen] = useState(false);
    const [addQuery, setAddQuery] = useState('');
    const [addingBusy, setAddingBusy] = useState<string | null>(null);
    const navigate = useNavigate();
    const [collectionFilter, setCollectionFilter] = useState('');
    const [copiedAll, setCopiedAll] = useState(false);

    const [firebaseComponents, setFirebaseComponents] = useState<ComponentItem[]>([]);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const load = useCallback(async () => {
        try {
            const data = await listCollections();
            setCollections(data);
            setError(null);
        } catch (e: any) {
            if ((e as CollectionsError)?.status === 503 || (e as CollectionsError)?.code === 'DATABASE_UNAVAILABLE') {
                setError('Storage service is temporarily unavailable. Please try again.');
            } else {
                setError(e?.message || 'Failed to load collections');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const loadActive = useCallback(async () => {
        if (!activeId) { setActive(null); return; }
        try {
            const data = await getCollection(activeId);
            setActive(data);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Failed to load collection');
        }
    }, [activeId]);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        setLoading(true);
        void load();

        // Mirror favorites.ts pattern: poll for updates
        pollRef.current = setInterval(() => {
            void load();
            if (activeId) void loadActive();
        }, 30000);

        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [user, load, loadActive, activeId]);

    useEffect(() => {
        let cancelled = false;
        const fetchComps = async () => {
            try {
                const fetched = await fetchCommunityComponents();
                if (!cancelled) setFirebaseComponents(fetched);
            } catch (err) {
                console.error("Error loading community components:", err);
            }
        };
        fetchComps();
        return () => { cancelled = true; };
    }, []);

    const allAvailable: ComponentItem[] = useMemo(() => [...componentList, ...firebaseComponents], [firebaseComponents]);

    const searchResults = useMemo(() => {
        const q = addQuery.trim().toLowerCase();
        if (!q) return allAvailable.slice(0, 12);
        return allAvailable
            .filter(c => c.title?.toLowerCase().includes(q) || c.id?.toLowerCase().includes(q) || c.category?.toLowerCase().includes(q))
            .slice(0, 12);
    }, [addQuery, allAvailable]);

    const totalAcrossSystem = useMemo(() => {
        return collections.reduce((sum, c) => sum + c.itemCount, 0);
    }, [collections]);

    const componentById = useMemo(() => {
        const map = new Map<string, ComponentItem>();
        for (const c of componentList) map.set(c.id, c);
        for (const c of firebaseComponents) if (!map.has(c.id)) map.set(c.id, c);
        return map;
    }, [firebaseComponents]);

    const filteredItems = useMemo(() => {
        if (!active) return [];
        const q = collectionFilter.trim().toLowerCase();
        if (!q) return active.items;
        return active.items.filter(it =>
            (it.title || '').toLowerCase().includes(q) ||
            (it.componentId || '').toLowerCase().includes(q)
        );
    }, [active, collectionFilter]);

    const resolveItem = (componentId: string): ComponentItem | undefined => componentById.get(componentId);

    const openComponent = (id: string) => {
        navigate(`/library?id=${encodeURIComponent(id)}`);
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setCreateBusy(true);
        setError(null);
        try {
            const created = await createCollection({ name: newName.trim(), description: newDesc.trim(), icon: newIcon });
            setCollections(prev => [created, ...prev]);
            setNewName(''); setNewDesc(''); setIconDefault();
            setCreating(false);
        } catch (e: any) {
            setError(e?.message || 'Failed to create collection');
        } finally {
            setCreateBusy(false);
        }
    };

    const setIconDefault = () => setNewIcon('🗂️');

    const handleSelect = async (id: string) => {
        setActiveId(id);
        setAddOpen(false);
        try {
            const data = await getCollection(id);
            setActive(data);
            setError(null);
        } catch (e: any) {
            setError(e?.message || 'Failed to open collection');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!window.confirm('Delete this collection? Components inside are only removed from this folder. They stay in the library.')) return;
        try {
            await deleteCollection(id);
            setCollections(prev => prev.filter(c => c.id !== id));
            if (activeId === id) { setActiveId(null); setActive(null); }
        } catch (err: any) {
            setError(err?.message || 'Failed to delete collection');
        }
    };

    const handleRename = async () => {
        if (!activeId || !renameValue.trim()) return;
        try {
            await updateCollection(activeId, { name: renameValue.trim() });
            if (active) setActive({ ...active, name: renameValue.trim() });
            setCollections(prev => prev.map(c => c.id === activeId ? { ...c, name: renameValue.trim() } : c));
            setRenaming(false);
        } catch (err: any) {
            setError(err?.message || 'Failed to rename collection');
        }
    };

    const handleAdd = async (comp: ComponentItem) => {
        if (!activeId) return;
        setAddingBusy(comp.id);
        setError(null);
        try {
            const updated = await addToCollection(activeId, {
                id: comp.id,
                title: comp.title || 'Untitled',
                category: comp.category || 'custom',
                code: typeof comp.code === 'string' ? comp.code : '',
            });
            setActive(updated);
            setCollections(prev => prev.map(c => c.id === activeId ? { ...c, itemCount: updated.itemCount } : c));
            setAddOpen(false);
            setAddQuery('');
        } catch (e: any) {
            const err = e as CollectionsError;
            if (err.code === 'VAULT_LIMIT') {
                setError('Free plan cap reached: up to 5 total saved items (favorites + collections). Upgrade to Pro for unlimited saving.');
            } else {
                setError(err?.message || 'Failed to add component');
            }
        } finally {
            setAddingBusy(null);
        }
    };

    const handleRemoveItem = async (componentId: string) => {
        if (!activeId) return;
        try {
            const updated = await removeFromCollection(activeId, componentId);
            setActive(updated);
            setCollections(prev => prev.map(c => c.id === activeId ? { ...c, itemCount: updated.itemCount } : c));
        } catch (e: any) {
            setError(e?.message || 'Failed to remove component');
        }
    };

    const handleCopyAll = async () => {
        if (!active) return;
        const parts = active.items
            .filter(it => !!it.code)
            .map(it => `// ── ${it.title || it.componentId} ──\n${it.code}`);
        if (parts.length === 0) return;
        const ok = await copyText(parts.join('\n\n'));
        if (ok) {
            setCopiedAll(true);
            window.setTimeout(() => setCopiedAll(false), 2000);
        }
    };

    /* ── Not signed in ── */
    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center p-4 pt-28 pb-20 bg-brand-bg">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full max-w-lg border-2 border-white bg-brand-surface rounded-xl brutal-shadow-blue p-8 sm:p-12 text-center overflow-hidden"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-lg border-2 border-white bg-black brutal-shadow-blue flex items-center justify-center">
                        <Folder size={28} className="text-brand-blue" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 border-2 border-white bg-black rounded-md text-[10px] font-black uppercase tracking-widest text-neutral-300">
                        <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black" />
                        COLLECTIONS
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white leading-none mb-4 font-heading">
                        SIGN IN <span className="text-brand-blue">REQUIRED</span>
                    </h1>
                    <p className="text-neutral-400 font-medium text-sm sm:text-base leading-relaxed mb-8">
                        Sign in to organize saved components into collections.
                    </p>
                    <Link to="/login" className="brutal-btn-primary w-full sm:w-auto px-8 py-3.5 text-xs tracking-widest flex items-center justify-center gap-2 no-underline cursor-pointer">
                        Sign In
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* ── Error / limit banner ── */}
            {error && (
                <div className="flex items-start gap-3 border-2 border-brand-red bg-brand-red/10 rounded-lg p-4">
                    <AlertTriangle size={20} className="text-brand-red shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-neutral-400 hover:text-white transition-colors cursor-pointer"><X size={16} /></button>
                </div>
            )}

            {/* ── Header ── */}
            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative border-2 border-white bg-brand-surface rounded-lg brutal-shadow-blue overflow-hidden"
            >
                <div className="absolute top-0 inset-x-0 h-1 bg-brand-yellow" />
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff04_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

                <div className="relative p-6 md:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-white bg-black rounded-md font-black text-[10px] uppercase tracking-widest text-white">
                            <Folder size={12} className="text-brand-yellow" />
                            <span>My Collections</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-white bg-black rounded-md">
                                <span className="w-2 h-2 rounded-full bg-brand-yellow border border-black animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                                    {user && !user ? 'Total Saved' : `Saved in Folders`}
                                </span>
                                <span className="text-sm font-black text-brand-yellow font-mono">{totalAcrossSystem}</span>
                            </span>
                            <button
                                onClick={() => setCreating(o => !o)}
                                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-brand-yellow text-black text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#000] hover:brightness-110 transition-colors cursor-pointer"
                            >
                                {creating ? <X size={15} /> : <FolderPlus size={15} />} {creating ? 'Cancel' : 'New Collection'}
                            </button>
                        </div>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white font-heading mb-3">
                        Organize your <span className="text-brand-yellow">saved components</span>
                    </h1>
                    <p className="max-w-2xl text-neutral-400 font-medium text-sm sm:text-base leading-relaxed">
                        Group components into folders. Free accounts get {FREE_LIMIT} saved items total across favorites and collections.
                    </p>

                    {/* Create form */}
                    <AnimatePresence>
                        {creating && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-6 border-2 border-brand-yellow/60 bg-black rounded-lg p-5">
                                    <div className="grid sm:grid-cols-[auto_1fr_1fr] gap-3">
                                        <div className="flex items-center gap-1.5">
                                            {ICONS.map(ic => (
                                                <button
                                                    key={ic}
                                                    onClick={() => setNewIcon(ic)}
                                                    className={`w-10 h-10 rounded-md border-2 flex items-center justify-center text-lg transition-colors cursor-pointer ${newIcon === ic ? 'border-brand-yellow bg-brand-yellow/20' : 'border-neutral-700 hover:border-neutral-500'}`}
                                                >
                                                    {ic}
                                                </button>
                                            ))}
                                        </div>
                                        <input
                                            value={newName}
                                            onChange={e => setNewName(e.target.value)}
                                            placeholder="Collection name"
                                            className="px-4 py-3 bg-neutral-900 border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-yellow"
                                        />
                                        <input
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            placeholder="Short description (optional)"
                                            className="px-4 py-3 bg-neutral-900 border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-yellow"
                                        />
                                    </div>
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            onClick={() => void handleCreate()}
                                            disabled={createBusy || !newName.trim()}
                                            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-brand-yellow text-black text-[11px] font-black uppercase tracking-widest border-2 border-black shadow-[3px_3px_0_0_#fff] disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            {createBusy ? 'Creating...' : (<><Plus size={14} /> Create</>)}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.header>

            {/* ── Collections grid ── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <div key={i} className="skeleton-glass skeleton-pulse h-44 rounded-lg" />)}
                </div>
            ) : collections.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-2 border-white bg-brand-surface rounded-lg brutal-shadow-yellow p-12 sm:p-16 text-center relative overflow-hidden"
                >
                    <div className="w-16 h-16 mx-auto mb-6 rounded-lg border-2 border-white bg-black brutal-shadow-white flex items-center justify-center">
                        <FolderPlus size={28} className="text-brand-yellow" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-3 text-white font-heading">
                        NO COLLECTIONS <span className="text-brand-yellow">YET</span>
                    </h3>
                    <p className="text-neutral-400 mb-8 max-w-md mx-auto font-medium text-sm sm:text-base leading-relaxed">
                        Create a folder to start grouping components, or drop saved favorites into it.
                    </p>
                    <button
                        onClick={() => setCreating(true)}
                        className="brutal-btn-primary inline-flex px-8 py-3.5 text-xs tracking-widest items-center gap-2 no-underline cursor-pointer"
                    >
                        <FolderPlus size={15} /> New Collection
                    </button>
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {collections.map((c, index) => {
                        const shadow = shadowVariants[index % shadowVariants.length];
                        const isActive = activeId === c.id;
                        return (
                            <motion.button
                                key={c.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onClick={() => void handleSelect(c.id)}
                                className={`text-left relative bg-brand-surface border-2 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer select-none transition-all duration-150 hover:translate-x-0.5 hover:translate-y-0.5 hover:brightness-110 ${shadow} ${isActive ? 'ring-2 ring-brand-yellow' : ''}`}
                            >
                                <div className="absolute top-0 inset-x-0 h-1 bg-brand-yellow" />
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <span className="w-12 h-12 rounded-lg border-2 border-white bg-black flex items-center justify-center text-2xl">
                                            {c.icon || '🗂️'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-brand-yellow/40 bg-brand-yellow/10 text-brand-yellow text-[10px] font-black uppercase tracking-widest">
                                                {c.itemCount} saved
                                            </span>
                                            <button
                                                onClick={(e) => handleDelete(e, c.id)}
                                                className="p-2 rounded-md border-2 border-transparent text-neutral-500 hover:text-brand-red hover:border-brand-red transition-all cursor-pointer"
                                                title="Delete collection"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="mt-4 text-lg font-black uppercase tracking-tight text-white font-heading truncate">{c.name}</h3>
                                    {c.description && <p className="mt-1 text-xs text-neutral-400 line-clamp-2">{c.description}</p>}
                                </div>
                                <div className="flex items-center justify-between px-5 py-3 bg-[#0A0A0E] border-t-2 border-white">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">
                                        {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : 'New'}
                                    </span>
                                    <ArrowUpRight size={14} className="text-white" />
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            )}

            {/* ── Active collection detail ── */}
            <AnimatePresence>
                {active && (
                    <motion.section
                        key={active.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="border-2 border-white bg-brand-surface rounded-lg overflow-hidden"
                    >
                        <div className="border-b-2 border-white bg-brand-bg px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="w-9 h-9 rounded-md border-2 border-white bg-black flex items-center justify-center text-lg">{active.icon || '🗂️'}</span>
                                {renaming ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') void handleRename(); if (e.key === 'Escape') setRenaming(false); }}
                                            className="px-3 py-2 bg-neutral-900 border-2 border-brand-yellow rounded-md text-sm text-white outline-none"
                                        />
                                        <button onClick={() => void handleRename()} className="p-2 rounded border-2 border-brand-green text-brand-green cursor-pointer hover:bg-brand-green/10"><Check size={14} /></button>
                                        <button onClick={() => setRenaming(false)} className="p-2 rounded border-2 border-neutral-700 text-neutral-400 cursor-pointer hover:text-white"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white font-heading truncate">{active.name}</h2>
                                        <button
                                            onClick={() => { setRenameValue(active.name); setRenaming(true); }}
                                            className="p-1.5 rounded border-2 border-neutral-700 text-neutral-400 hover:text-white hover:border-brand-yellow transition-colors cursor-pointer"
                                            title="Rename"
                                        >
                                            <Pencil size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setAddOpen(o => !o)}
                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-brand-blue text-white text-[10px] font-black uppercase tracking-widest border-2 border-black shadow-[2px_2px_0_0_#000] cursor-pointer hover:bg-brand-blue-dark transition-colors"
                                >
                                    <Plus size={13} /> Add Component
                                </button>
                                <button
                                    onClick={() => { setActiveId(null); setActive(null); }}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border-2 border-neutral-700 text-neutral-400 hover:text-white text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                >
                                    <X size={13} /> Close
                                </button>
                            </div>
                        </div>

                        {/* Filter & actions toolbar */}
                        <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b-2 border-neutral-800 bg-black/40">
                            <div className="relative flex-1 min-w-40">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                <input
                                    value={collectionFilter}
                                    onChange={e => setCollectionFilter(e.target.value)}
                                    placeholder="Filter components in this collection…"
                                    className="w-full pl-9 pr-8 py-2 bg-neutral-900 border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-blue"
                                />
                                {collectionFilter && (
                                    <button onClick={() => setCollectionFilter('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white cursor-pointer" aria-label="Clear filter" title="Clear filter">
                                        <X size={13} />
                                    </button>
                                )}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 shrink-0">
                                {filteredItems.length} of {active.items.length}
                            </span>
                            <button
                                onClick={() => void handleCopyAll()}
                                disabled={!active.items.some(it => !!it.code)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-brand-blue bg-brand-blue/15 text-brand-blue text-[10px] font-black uppercase tracking-widest hover:bg-brand-blue/25 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                title={active.items.some(it => !!it.code) ? 'Copy all component code to clipboard' : 'No copyable code in this collection'}
                            >
                                {copiedAll ? <ClipboardCheck size={13} /> : <Copy size={13} />}
                                {copiedAll ? 'Copied!' : 'Copy All Code'}
                            </button>
                        </div>

                        {/* Add component picker */}
                        <AnimatePresence>
                            {addOpen && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden border-b-2 border-neutral-800 bg-black/60"
                                >
                                    <div className="p-5">
                                        <div className="flex items-center gap-3 mb-3">
                                            <Search size={16} className="text-neutral-400 shrink-0" />
                                            <input
                                                value={addQuery}
                                                onChange={e => setAddQuery(e.target.value)}
                                                placeholder="Search library components to add…"
                                                className="flex-1 px-4 py-2.5 bg-neutral-900 border-2 border-neutral-700 rounded-md text-sm text-white placeholder-neutral-600 outline-none focus:border-brand-blue"
                                            />
                                        </div>
                                        <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                                            {searchResults.length === 0 ? (
                                                <p className="text-xs text-neutral-500 text-center py-6">No components match.</p>
                                            ) : (
                                                searchResults.map(comp => (
                                                    <button
                                                        key={comp.id}
                                                        onClick={() => void handleAdd(comp)}
                                                        disabled={addingBusy === comp.id}
                                                        className="flex items-center justify-between gap-3 px-4 py-3 rounded-md border-2 border-neutral-800 bg-brand-surface text-left hover:border-brand-blue transition-colors cursor-pointer disabled:opacity-50"
                                                    >
                                                        <span className="flex items-center gap-3 min-w-0">
                                                            <span className="w-8 h-8 shrink-0 rounded-md border border-white/30 bg-black flex items-center justify-center">
                                                                {comp.category === 'custom' ? <Globe size={14} className="text-brand-yellow" /> : <Code2 size={14} className="text-brand-blue" />}
                                                            </span>
                                                            <span className="min-w-0">
                                                                <span className="block text-xs font-black uppercase tracking-wider text-white truncate">{comp.title}</span>
                                                                <span className="block text-[10px] text-neutral-500 uppercase font-mono truncate">{(comp.category || 'ui') + ' · ' + comp.id}</span>
                                                            </span>
                                                        </span>
                                                        {addingBusy === comp.id ? (
                                                            <span className="text-[10px] font-black uppercase text-brand-blue">Adding…</span>
                                                        ) : (
                                                            <Plus size={15} className="text-brand-blue shrink-0" />
                                                        )}
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Items */}
                        {active.items.length === 0 ? (
                            <div className="p-12 text-center">
                                <Folder size={30} className="mx-auto mb-3 text-neutral-500" />
                                <p className="text-neutral-400 font-medium text-sm">This collection is empty. Add components from the library.</p>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="p-12 text-center">
                                <Search size={30} className="mx-auto mb-3 text-neutral-500" />
                                <p className="text-neutral-400 font-medium text-sm">No saved components match "{collectionFilter}".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 p-5">
                                {filteredItems.map(item => {
                                    const resolved = resolveItem(item.componentId);
                                    const hasCode = typeof item.code === 'string' && item.code.trim().length > 0;
                                    const isPremiumLocked = !!resolved?.isPremium && !hasCode && !isPro;
                                    const canOpen = !!resolved && typeof resolved.preview === 'function';
                                    return (
                                        <div key={item.componentId} className="flex flex-col bg-brand-surface border-2 border-white rounded-lg overflow-hidden transition-transform duration-150 hover:-translate-y-0.5">
                                            {/* Preview / cover */}
                                            <div className="relative">
                                                {canOpen ? (
                                                    <button
                                                        onClick={() => openComponent(item.componentId)}
                                                        className="group block w-full text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
                                                        title={`Open ${item.title || item.componentId} in the library`}
                                                        aria-label={`Open ${item.title || item.componentId}`}
                                                    >
                                                        <div className="h-40 sm:h-44 overflow-hidden border-b-2 border-neutral-800 bg-neutral-950">
                                                            <ComponentPreviewTile item={resolved} className="w-full h-full" />
                                                        </div>
                                                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-black/80 border border-white/30 text-white text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                                                            Open <ExternalLink size={10} />
                                                        </span>
                                                    </button>
                                                ) : (
                                                    <div className="h-40 sm:h-44 flex items-center justify-center bg-neutral-950 border-b-2 border-neutral-800">
                                                        <Globe size={26} className="text-brand-yellow" />
                                                    </div>
                                                )}
                                                {isPremiumLocked && (
                                                    <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-1 rounded bg-brand-blue/90 border border-black text-white text-[9px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000]">
                                                        <Lock size={10} /> Pro
                                                    </span>
                                                )}
                                            </div>

                                            {/* Meta */}
                                            <div className="px-4 py-3 flex-1 flex flex-col gap-2.5">
                                                <div className="flex items-start justify-between gap-2 min-w-0">
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black uppercase tracking-wider text-white truncate">{item.title || item.componentId}</p>
                                                        <p className="text-[10px] font-mono text-neutral-500 truncate mt-0.5">{item.componentId}</p>
                                                    </div>
                                                    <span className="shrink-0 px-2 py-0.5 rounded border border-neutral-700 text-[9px] font-black uppercase tracking-wider text-neutral-400">{item.category}</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-2">
                                                    <button
                                                        onClick={() => void handleRemoveItem(item.componentId)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border-2 border-brand-red/50 text-brand-red hover:bg-brand-red/10 ml-auto text-[10px] font-black uppercase tracking-widest cursor-pointer"
                                                    >
                                                        <Trash2 size={12} /> Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ── Free tier note ── */}
            <div className="flex items-start gap-3 border-2 border-brand-yellow/40 bg-brand-yellow/5 rounded-lg p-4">
                <Sparkles size={18} className="text-brand-yellow shrink-0 mt-0.5" />
                <p className="text-xs text-neutral-300 leading-relaxed">
                    Free accounts can save up to <strong className="text-white">{FREE_LIMIT} components</strong> total across favorites and collections. Pro members get unlimited saving, folders, and version history.
                </p>
                <Link to="/pricing" className="shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-md border-2 border-brand-yellow bg-brand-yellow text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all cursor-pointer">
                    Upgrade <ArrowUpRight size={12} />
                </Link>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                <Library size={13} className="text-brand-blue" />
                Tip: favorites and collections share one vault. Deleting a collection never deletes the component itself.
            </div>
        </div>
    );
};

export default CollectionsPage;