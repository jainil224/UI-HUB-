import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { searchEverything, COMPONENT_CATEGORY_COLORS } from '../../utils/searchIndex';
import type { ComponentItem } from '../../data/componentData';
import type { TemplateItem } from '../../data/templatesData';

type SuggestionBadge = 'PRO' | 'FREE' | 'NEW' | null;

interface Suggestion {
    type: 'component' | 'template';
    id: string;
    title: string;
    category: string;
    color: string;
    badge: SuggestionBadge;
    route: string;
}

interface SearchBoxProps {
    value: string;
    onChange: (value: string) => void;
    /** Called on Enter when no suggestion is highlighted (fallback = navigate to /library?q=...) */
    onSubmit: () => void;
    placeholder?: string;
    containerClassName?: string;
    inputWrapperClassName?: string;
    inputClassName?: string;
    iconClassName?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
    dropdownClassName?: string;
}

interface LiveResults {
    components: ComponentItem[];
    templates: TemplateItem[];
    total: number;
}

const SectionHeader: React.FC<{ label: string; count: number; tint: string }> = ({ label, count, tint }) => (
    <div className="flex items-center justify-between px-3 py-1.5 bg-black">
        <span className="text-[9px] font-black uppercase tracking-widest text-white">{label}</span>
        <span className={`px-1.5 py-0.5 text-[9px] font-mono font-black text-white ${tint}`}>{count}</span>
    </div>
);

const SearchBox: React.FC<SearchBoxProps> = ({
    value,
    onChange,
    onSubmit,
    placeholder = 'SEARCH...',
    containerClassName = '',
    inputWrapperClassName = '',
    inputClassName = '',
    iconClassName = '',
    icon,
    action,
    dropdownClassName = 'w-full',
}) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [debounced, setDebounced] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [live, setLive] = useState<LiveResults>({ components: [], templates: [], total: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    // Debounce the query slightly so rapid typing doesn't spam the (cheap) search.
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), 150);
        return () => clearTimeout(t);
    }, [value]);

    // Run the search on the debounced value (async-lazy loads the component data once).
    useEffect(() => {
        if (!debounced.trim()) {
            setLive({ components: [], templates: [], total: 0 });
            setIsLoading(false);
            return;
        }
        let cancelled = false;
        setIsLoading(true);
        searchEverything(debounced).then((res) => {
            if (cancelled) return;
            setLive(res);
            setIsLoading(false);
        });
        return () => {
            cancelled = true;
        };
    }, [debounced]);

    useEffect(() => {
        setActiveIndex(-1);
    }, [debounced]);

    // Flatten components + templates into one row list (components first).
    const flat = useMemo<Suggestion[]>(() => {
        const items: Suggestion[] = [];
        for (const c of live.components) {
            items.push({
                type: 'component',
                id: c.id,
                title: c.title,
                category: c.category,
                color: COMPONENT_CATEGORY_COLORS[c.category] || '#1F4BFF',
                badge: c.isPremium ? 'PRO' : null,
                route: `/library?id=${c.id}`,
            });
        }
        for (const t of live.templates) {
            items.push({
                type: 'template',
                id: t.id,
                title: t.title,
                category: t.category,
                color: t.accentColor,
                badge: t.isPro ? 'PRO' : t.badge ? 'NEW' : 'FREE',
                route: `/templates/${t.id}`,
            });
        }
        return items;
    }, [live]);

    const compCount = live.components.length;

    const close = useCallback(() => {
        setIsOpen(false);
        setActiveIndex(-1);
    }, []);

    // Click outside closes the dropdown.
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) close();
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [close]);

    const goTo = (s: Suggestion) => {
        close();
        navigate(s.route);
    };

    const goToAllResults = () => {
        close();
        navigate(`/library?q=${encodeURIComponent(value.trim())}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!value.trim()) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex((prev) => (flat.length ? (prev + 1) % flat.length : -1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setIsOpen(true);
            setActiveIndex((prev) => (flat.length ? (prev - 1 + flat.length) % flat.length : -1));
        } else if (e.key === 'Escape') {
            e.preventDefault();
            close();
        } else if (e.key === 'Enter') {
            // Intercept Enter: select the highlighted suggestion, else fall back to submit.
            e.preventDefault();
            if (flat.length && activeIndex >= 0) {
                goTo(flat[activeIndex]);
            } else {
                onSubmit();
            }
        }
    };

    const showDropdown = isOpen && value.trim() !== '';

    return (
        <div
            ref={containerRef}
            className={`relative ${containerClassName}`}
            onKeyDown={handleKeyDown}
        >
            <div className={`flex items-center ${inputWrapperClassName}`}>
                <div className={`flex items-center pointer-events-none ${iconClassName}`}>
                    {icon ?? <Search size={13} className="text-neutral-500" />}
                </div>
                <input
                    type="text"
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => {
                        onChange(e.target.value);
                        if (!e.target.value.trim()) close();
                        else setIsOpen(true);
                    }}
                    onFocus={() => {
                        if (value.trim()) setIsOpen(true);
                    }}
                    className={`${inputClassName}`}
                />
                {action}
            </div>

            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute top-full mt-2 left-0 z-[70] bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000000] origin-top ${dropdownClassName}`}
                    >
                        <div className="max-h-[70vh] overflow-y-auto divide-y divide-neutral-100">
                            {isLoading && (
                                <div className="px-4 py-4 flex items-center gap-2.5">
                                    <span className="w-3 h-3 border-2 border-[#1F4BFF] border-t-transparent rounded-full animate-spin shrink-0" />
                                    <span className="text-[10px] font-mono font-black uppercase tracking-widest text-neutral-500">
                                        Searching...
                                    </span>
                                </div>
                            )}

                            {!isLoading && live.total === 0 && (
                                <div className="px-4 py-6 text-center">
                                    <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                                        No matches found
                                    </p>
                                    <p className="text-[10px] font-mono text-neutral-400 mt-1">
                                        Press Enter to search the full library
                                    </p>
                                </div>
                            )}

                            {!isLoading && live.total > 0 && (
                                <>
                                    {compCount > 0 && (
                                        <SectionHeader label="Components" count={compCount} tint="bg-[#1F4BFF]" />
                                    )}
                                    {compCount > 0 &&
                                        flat.slice(0, compCount).map((s, i) => (
                                            <ResultRow
                                                key={`${s.type}-${s.id}`}
                                                s={s}
                                                isActive={i === activeIndex}
                                                onMouseEnter={() => setActiveIndex(i)}
                                                onClick={() => goTo(s)}
                                            />
                                        ))}
                                    {live.templates.length > 0 && (
                                        <SectionHeader label="Templates" count={live.templates.length} tint="bg-[#00E599]" />
                                    )}
                                    {live.templates.length > 0 &&
                                        flat.slice(compCount).map((s, i) => (
                                            <ResultRow
                                                key={`${s.type}-${s.id}`}
                                                s={s}
                                                isActive={compCount + i === activeIndex}
                                                onMouseEnter={() => setActiveIndex(compCount + i)}
                                                onClick={() => goTo(s)}
                                            />
                                        ))}
                                </>
                            )}
                        </div>

                        {!isLoading && live.total > 0 && (
                            <button
                                onClick={goToAllResults}
                                className="w-full px-3.5 py-2 bg-neutral-100 border-t-4 border-black flex items-center justify-between gap-2 text-[10px] font-black uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
                            >
                                <span className="truncate">See all results for "{value.trim()}"</span>
                                <ArrowRight size={12} className="shrink-0" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ResultRow: React.FC<{
    s: Suggestion;
    isActive: boolean;
    onMouseEnter: () => void;
    onClick: () => void;
}> = ({ s, isActive, onMouseEnter, onClick }) => {
    const badgeClass =
        s.badge === 'PRO'
            ? 'bg-[#1F4BFF] text-white'
            : s.badge === 'NEW'
              ? 'bg-[#FFC700] text-black'
              : 'bg-[#00E599] text-black';

    return (
        <button
            onMouseEnter={onMouseEnter}
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors cursor-pointer ${
                isActive ? 'bg-[#1F4BFF]' : 'hover:bg-neutral-100'
            }`}
        >
            <span className="w-2 h-2 shrink-0 -skew-x-12 border border-black shadow-[1.5px_1.5px_0px_0px_#000000]" style={{ background: s.color }} />
            <span className="min-w-0 flex-1">
                <span
                    className={`block text-xs font-black uppercase tracking-wide truncate ${
                        isActive ? 'text-white' : 'text-black'
                    }`}
                >
                    {s.title}
                </span>
                <span
                    className={`block text-[9px] font-mono uppercase tracking-wider truncate ${
                        isActive ? 'text-white/70' : 'text-neutral-500'
                    }`}
                >
                    {s.category}
                </span>
            </span>
            {s.badge && (
                <span
                    className={`shrink-0 px-1.5 py-0.5 text-[8px] font-black uppercase border ${
                        isActive ? 'border-white/50' : 'border-black'
                    } ${badgeClass}`}
                >
                    {s.badge}
                </span>
            )}
            <ArrowRight
                size={12}
                className={`shrink-0 ${isActive ? 'text-white' : 'text-neutral-300'}`}
            />
        </button>
    );
};

export default SearchBox;