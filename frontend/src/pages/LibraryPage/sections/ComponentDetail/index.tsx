import React from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft, RotateCcw, Eye, Code,
    Check, Copy, Zap, ChevronDown, Brain, Cpu, Heart, ExternalLink, Download, Lock,
    Maximize2, Minimize2
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import CodeHighlighter from '../../../../components/ui/CodeHighlighter';
import * as Animations from '../../../../components/animations/TextAnimations';
import * as VisualEffects from '../../../../components/animations/VisualEffects';
import { getComponentCode } from '../../../../utils/codeUtils';
import { downloadComponentZip } from '../../../../utils/zipUtils';
import { fetchVibePrompt, fetchComponentSource, AISystem, VibeMeta } from '../../../../utils/promptUtils';
import { useAuth } from '../../../../context/AuthContext';
import { saveToFavorites, removeFromFavorites, getUserFavorites } from '../../../../services/favorites';
import AuthRequiredModal from '../../../../components/ui/AuthRequiredModal';
import { COMPONENT_CONFIG, PropDefinition } from '../../../../data/componentMetadata';
import Toast from '../../../../components/ui/Toast';

const preloadComponent = (id: string) => {
    if (id === '3d-rubiks-cube') {
        import('../../../../components/ui/RubiksCube');
    } else if (id === '3d-scroll-animation') {
        import('../../../Components/Scroll3DAnimationPage');
    } else if (id === '3d-slider') {
        import('../../../Components/ThreeDSliderPage');
    }
};


const PropsTable = ({ props, theme }: { props: PropDefinition[]; theme: string }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className={`border-b text-[10px] uppercase tracking-[0.2em] ${theme === 'dark' ? 'border-white/5 text-white/40' : 'border-black/10 text-black/40'}`}>
                    <th className="py-6 px-4 font-bold">Prop</th>
                    <th className="py-6 px-4 font-bold">Type</th>
                    <th className="py-6 px-4 font-bold">Default</th>
                    <th className="py-6 px-4 font-bold">Description</th>
                </tr>
            </thead>
            <tbody className="text-sm">
                {props.map((p, i) => (
                    <tr key={i} className={`border-b group transition-colors ${theme === 'dark' ? 'border-white/5 hover:bg-white/[0.02]' : 'border-black/5 hover:bg-black/[0.02]'}`}>
                        <td className="py-6 px-4 font-mono">
                            <span className={`px-2 py-1 rounded-md border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-brand-green' : 'bg-[#00AEEF]/10 border-[#00AEEF]/20 text-[#00AEEF]'}`}>{p.name}</span>
                        </td>
                        <td className="py-6 px-4 font-mono">
                            <span className={`px-2 py-1 rounded-md border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-blue-400' : 'bg-black/5 border-black/10 text-blue-600'}`}>{p.type}</span>
                        </td>
                        <td className={`py-6 px-4 font-mono ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>
                            <span className={`px-2 py-1 rounded-md border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white/40' : 'bg-black/5 border-black/10 text-black/40'}`}>{p.default}</span>
                        </td>
                        <td className={`py-6 px-4 leading-relaxed ${theme === 'dark' ? 'text-white/60' : 'text-black/60'}`}>{p.description}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const CustomSelect = ({
    value,
    onChange,
    options,
    label
}: {
    value: string;
    onChange: (val: any) => void;
    options: { id: string; name: string }[];
    label: string;
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(o => o.id === value);

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-4 px-6 py-3 rounded-2xl bg-white/5 border transition-all text-xs font-bold uppercase tracking-widest ${isOpen ? 'border-brand-green/50 bg-white/10' : 'border-white/10 hover:border-white/20'}`}
            >
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[10px] text-white/40">{label}</span>
                    <span>{selectedOption?.name}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-green' : 'text-white/40'}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute bottom-full mb-2 left-0 w-full min-w-[160px] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-6 py-4 text-left text-xs font-bold uppercase tracking-widest transition-all ${value === opt.id ? 'bg-brand-green text-black' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                            >
                                {opt.name}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

import { ComponentItem } from '../../../../data/componentData';

const PremiumGate = ({ message = "Unlock Premium Components" }: { message?: string }) => (
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-black/50 backdrop-blur-[4px] rounded-[inherit] border border-brand-green/20 p-8 text-center overflow-hidden">
        {/* Animated Background Ambience */}
        <motion.div 
            animate={{ 
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-br from-brand-green/5 via-transparent to-brand-green/5 pointer-events-none" 
        />

        <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-6">
                <motion.div 
                    animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-brand-green/30 blur-2xl rounded-full"
                />
                <div className="w-20 h-20 rounded-[2rem] bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,159,0.2)]">
                    <Lock className="w-10 h-10 text-brand-green" />
                </div>
                
                {/* PRO Badge on corner of icon */}
                <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-md bg-brand-green text-black text-[8px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(0,255,159,0.5)]">
                    PRO
                </span>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Premium Feature</h3>
            <p className="text-white/50 text-sm max-w-xs mb-8">{message}</p>
            
            <Link to="/pricing">
                <button className="group relative px-10 py-4 rounded-2xl bg-brand-green text-black text-[11px] font-black uppercase tracking-[0.25em] shadow-[0_0_30px_rgba(0,255,159,0.3)] hover:shadow-[0_0_50px_rgba(0,255,159,0.5)] transition-all duration-500 hover:scale-105 active:scale-[0.98] overflow-hidden">
                    <span className="relative z-10">Upgrade to Pro</span>
                    <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                </button>
            </Link>
        </div>
    </div>
);

const PRO_ONLY_TOOLS: AISystem[] = ['advance', 'antigravity', 'claude'];

const ToolCard = React.memo(({ 
    tool, 
    isActive, 
    onClick, 
    itemId,
    isLocked 
}: { 
    tool: AISystem; 
    isActive: boolean; 
    onClick: (t: AISystem) => void;
    itemId: string;
    isLocked?: boolean;
}) => {
    return (
        <button
            onClick={() => !isLocked && onClick(tool)}
            className={`p-5 md:p-6 rounded-[2rem] md:rounded-[2.5rem] border transition-all text-left relative overflow-hidden group min-h-[130px] md:min-h-[160px] flex flex-col justify-between ${isLocked ? 'opacity-50 cursor-not-allowed bg-white/[0.01] border-white/5' : isActive ? 'bg-[#050505] border-brand-green/50 shadow-[0_0_40px_rgba(0,255,0,0.1)] ring-1 ring-brand-green/30' : 'bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/10 hover:scale-[1.01] duration-500'}`}
        >
            {/* Lock Overlay for non-Pro users */}
            {isLocked && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-[inherit] bg-black/40 backdrop-blur-[2px] transition-all duration-500 overflow-hidden">
                    <div className="flex flex-col items-center gap-3 relative z-10 scale-90 md:scale-100 translate-y-2">
                        <div className="relative">
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    opacity: [0.5, 0.8, 0.5]
                                }}
                                transition={{
                                    duration: 3,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-0 bg-brand-green/20 blur-xl rounded-full"
                            />
                            <div className="w-12 h-12 rounded-2xl bg-brand-green/10 border border-brand-green/30 flex items-center justify-center shadow-[0_0_20px_rgba(0,255,159,0.15)] group-hover:border-brand-green/50 group-hover:shadow-[0_0_30px_rgba(0,255,159,0.3)] transition-all duration-500">
                                <Lock size={20} className="text-brand-green" />
                            </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <span className="px-3 py-1 rounded-full bg-brand-green text-black text-[8px] font-black uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(0,255,159,0.4)] transition-transform duration-500">
                                PRO
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Scanline/Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] mix-blend-overlay" />

            {/* Animated Border for Active Tool */}
            {isActive && !isLocked && (
                <div className="absolute inset-0 z-20 pointer-events-none rounded-[inherit] overflow-hidden">
                    <div className="absolute inset-0 border border-brand-green/60 rounded-[inherit]" />
                    <motion.div
                        className="absolute inset-0 bg-brand-green/10 blur-xl rounded-[inherit]"
                        animate={{
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </div>
            )}

            {/* Shine Effect */}
            {!isLocked && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none">
                    <div className="absolute inset-x-[-150%] top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
                </div>
            )}

            <div className="relative z-10 w-full flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <p className={`text-[8px] md:text-[9px] uppercase tracking-[0.25em] font-black transition-colors duration-500 ${isLocked ? 'text-white/30' : isActive ? 'text-brand-green' : 'text-white/20'}`}>
                        {itemId === 'robot-3d-background' ? (
                            tool === 'antigravity' ? 'NEON ENGINE' :
                                tool === 'lovable' ? 'ROBOTIC HUB' :
                                    tool === 'cursor' ? 'CYBER CORE' :
                                        tool === 'claude' ? 'PHANTOM MODEL' : 'ADVANCED SYSTEM'
                        ) : (
                            tool === 'antigravity' ? 'VIBE ENGINE' :
                                tool === 'lovable' ? 'PLATFORM HUB' :
                                    tool === 'cursor' ? 'SMART LDE' :
                                        tool === 'claude' ? 'INTELLIGENT MODEL' : 'ADVANCED SYSTEM'
                        )}
                    </p>
                    <div className={`transition-all duration-700 ease-out ${isLocked ? 'text-white/5' : isActive ? 'text-brand-green scale-110' : 'text-white/10 group-hover:text-white/30'}`}>
                        {tool === 'antigravity' ? (
                            <Zap size={20} className="md:w-6 md:h-6" />
                        ) : tool === 'lovable' ? (
                            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        ) : tool === 'cursor' ? (
                            <div className="relative w-5 h-5 md:w-6 md:h-6">
                                <div className="absolute inset-0 border-2 border-current rounded-sm flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 border-r border-b border-current" />
                                </div>
                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#0A0A0A] flex items-center justify-center">
                                    <div className="text-[10px] font-bold">+</div>
                                </div>
                            </div>
                        ) : tool === 'claude' ? (
                            <Cpu size={20} className="md:w-6 md:h-6" />
                        ) : (
                            <Brain size={20} className="md:w-6 md:h-6" />
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between w-full">
                    <h4 className={`text-lg md:text-xl lg:text-2xl font-display uppercase tracking-[-0.05em] transition-all duration-500 leading-none whitespace-nowrap ${isLocked ? 'text-white/40' : isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}`}>
                        {tool === 'advance' ? 'Advance' : tool}
                    </h4>
                </div>
            </div>

            {!isLocked && (
                <div className={`flex items-center gap-2 mt-4 transition-all duration-700 ${isActive ? 'opacity-100' : 'opacity-0 translate-y-1'}`}>
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.6)]" />
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-brand-green/90">
                        Active
                    </span>
                </div>
            )}

            {isActive && !isLocked && (
                <motion.div
                    layoutId="active-tool-glow"
                    className="absolute inset-0 bg-gradient-to-br from-brand-green/[0.08] via-transparent to-transparent pointer-events-none"
                />
            )}
        </button>
    );
});

const VibeSystemSection = React.memo(({ 
    item, 
    user, 
    isProUser, 
    advanceTrialsUsed, 
    setAdvanceTrialsUsed,
    lang,
    styling,
    componentConfig,
    vanillaCode,
    setShowAuthModal
}: { 
    item: ComponentItem; 
    user: any;
    isProUser: boolean;
    advanceTrialsUsed: number;
    setAdvanceTrialsUsed: React.Dispatch<React.SetStateAction<number>>;
    lang: 'js' | 'ts' | 'html';
    styling: 'tailwind' | 'css';
    componentConfig: any;
    vanillaCode: string;
    setShowAuthModal: (v: boolean) => void;
}) => {
    // Normal users default to 'lovable', Pro users default to 'advance'
    const defaultSystem: AISystem = isProUser ? 'advance' : 'lovable';
    const [activeTool, setActiveTool] = React.useState<AISystem>(defaultSystem);
    const [aiSystem, setAiSystemState] = React.useState<AISystem>(defaultSystem);
    const [isPending, startTransition] = React.useTransition();
    const [copied, setCopied] = React.useState<string | null>(null);
    const [fetchedPrompt, setFetchedPrompt] = React.useState<string>('');
    const [isLoadingPrompt, setIsLoadingPrompt] = React.useState(false);
    const [prevProStatus, setPrevProStatus] = React.useState(isProUser);

    // Toast state
    const [showToast, setShowToast] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');

    const setAiSystem = React.useCallback((system: AISystem) => {
        setActiveTool(system);
        startTransition(() => {
            setAiSystemState(system);
        });
    }, []);

    // Sync state when Pro status changes (e.g. after login fetch finishes)
    React.useEffect(() => {
        if (isProUser && !prevProStatus) {
            console.log(`[VibeSystem] Pro status detected, upgrading default tool to Advance`);
            setAiSystem('advance');
        } else if (!isProUser && prevProStatus) {
            setAiSystem('lovable');
        }
        setPrevProStatus(isProUser);
    }, [isProUser, prevProStatus, setAiSystem]);

    const loadPrompt = React.useCallback(async () => {
        // Allow public viewing for lovable and cursor ONLY on non-premium components
        const isPublicSystem = !item.isPremium && ['lovable', 'cursor'].includes(aiSystem);
        
        if (!user && !isPublicSystem) {
            // We don't clear the prompt here anymore. 
            // The UI overlay handles the "Authentication Required" state.
            // Keeping the existing prompt avoids flickering during account switches.
            return;
        }

        setIsLoadingPrompt(true);
        try {
            const token = user ? await user.getIdToken() : undefined;
            console.log(`[VibeSystem] Fetching prompt for ${item.id} (${aiSystem})...`);
            const prompt = await fetchVibePrompt(item.id, aiSystem, token);
            setFetchedPrompt(prompt);
        } catch (error) {
            console.error('[VibeSystem] Failed to load prompt:', error);
            setFetchedPrompt('Failed to load blueprint from secure terminal. Check console for details.');
        } finally {
            setIsLoadingPrompt(false);
        }
    }, [aiSystem, item.id, user]);

    React.useEffect(() => {
        loadPrompt();
    }, [loadPrompt]);

    const deferredVibePrompt = React.useDeferredValue(fetchedPrompt);

    // Copy to clipboard with authentication check
    const handleCopyBlueprint = async () => {
        if (!user || user.isAnonymous) {
            setShowAuthModal(true);
            return;
        }
        
        await navigator.clipboard.writeText(deferredVibePrompt);
        setCopied('blueprint');
        setToastMessage(`PROMPT COPIED`);
        setShowToast(true);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <motion.div
            key="vibe-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
        >
            {/* Tool Selector */}
            <section className="space-y-6 md:space-y-10">
                <h3 className="text-2xl md:text-3xl font-display uppercase tracking-widest text-[var(--text-primary)] px-2 lg:px-4">Select AI Tool</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 lg:px-4">
                    {(['advance', 'antigravity', 'claude', 'lovable', 'cursor'] as const).map(tool => (
                        <ToolCard
                            key={tool}
                            tool={tool}
                            isActive={activeTool === tool}
                            onClick={setAiSystem}
                            itemId={item.id}
                            isLocked={!isProUser && (item.isPremium ? true : PRO_ONLY_TOOLS.includes(tool))}
                        />
                    ))}
                </div>
            </section>

            {/* Vibe Prompt Section - AI Terminal UI */}
            <section className="space-y-6 md:space-y-8">
                <div className="flex items-end justify-between px-2">
                    <div className="space-y-1">
                        <h3 className="text-2xl md:text-3xl font-display uppercase tracking-tight text-[var(--text-primary)] line-clamp-1">Master Blueprint</h3>
                        <div className="flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-brand-green/50'}`} />
                            <p className={`text-[10px] uppercase tracking-[0.3em] font-black transition-colors ${isPending ? 'text-amber-400' : 'text-brand-green/30'}`}>
                                {isPending ? 'RECALIBRATING...' : 'AI GENERATION BLUEPRINT'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group/terminal">
                    <div className={`rounded-[2rem] md:rounded-[3rem] overflow-hidden border transition-all duration-500 relative ${isPending ? 'border-amber-400/20 shadow-[0_0_40px_rgba(255,189,46,0.06)] opacity-80' : 'border-[rgba(0,255,150,0.2)] hover:border-[rgba(0,255,150,0.35)] shadow-[0_0_40px_rgba(0,255,150,0.08)] hover:shadow-[0_0_60px_rgba(0,255,150,0.15)]'}`} style={{ background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
                        {/* Scanline/Texture Overlay */}
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/noise.svg')] mix-blend-overlay z-10" />

                        {/* Terminal Header / Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 bg-white/[0.02] relative z-20 gap-3 sm:gap-0">
                            <div className="flex items-center justify-between w-full sm:w-auto">
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="flex gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
                                    </div>
                                    <div className="h-4 w-px bg-white/10 mx-1 sm:mx-2" />
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-brand-green uppercase tracking-widest">{aiSystem}</span>
                                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">//</span>
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">MASTER_{aiSystem === 'advance' ? 'PRO' : aiSystem.toUpperCase()}_v1.0.tsx</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center sm:absolute sm:left-1/2 sm:-translate-x-1/2 items-center gap-1 pointer-events-none" />

                            {/* Copy Button */}
                            <div className="relative group/copybtn">
                                <div className={`absolute -inset-[1px] rounded-lg blur-sm transition-all duration-300 ${copied === 'blueprint' ? 'bg-[#00FF00]/60' : 'bg-[#00FF00]/0 group-hover/copybtn:bg-[#00FF00]/20'}`} />
                                <button
                                    disabled={isLoadingPrompt}
                                    onClick={handleCopyBlueprint}
                                    className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest transition-all duration-200 ${copied === 'blueprint'
                                        ? 'bg-[#00FF00] text-black border border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.4)]'
                                        : 'bg-black/60 border border-[#00FF00]/30 text-[#00FF00]/70 hover:text-[#00FF00] hover:border-[#00FF00]/70 hover:bg-[#00FF00]/5'
                                        }`}
                                >
                                    {copied === 'blueprint' ? <Check size={11} strokeWidth={3} /> : <Copy size={11} />}
                                    <span className="hidden sm:inline">{copied === 'blueprint' ? 'Saved to Buffer' : 'Copy Blueprint'}</span>
                                    <span className="sm:hidden">{copied === 'blueprint' ? 'Saved' : 'Copy'}</span>
                                    {!isProUser && ['antigravity', 'claude', 'advance'].includes(aiSystem) && advanceTrialsUsed < 2 && (
                                        <span className="ml-1 px-1 py-0.5 rounded-sm bg-brand-green/20 text-brand-green text-[7px] font-bold">
                                            {2 - advanceTrialsUsed} Trial LEFT
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Terminal Content */}
                        <div className="p-6 md:p-10 text-[10px] md:text-sm leading-relaxed max-h-[500px] md:max-h-[700px] overflow-auto custom-scrollbar relative z-20 min-h-[300px]">
                            {(!user || user.isAnonymous) && !['lovable', 'cursor'].includes(aiSystem) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505] z-30">
                                    <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,0,0.15)]">
                                        <Lock className="text-brand-green" size={28} />
                                    </div>
                                    <h4 className="text-2xl font-heading font-black tracking-tight text-white mb-3 uppercase">Authentication Required</h4>
                                    <p className="text-white/50 max-w-sm mb-8 font-sans">
                                        Please log in to your account to establish a secure link and access the UI HUB generation blueprints.
                                    </p>
                                    <button 
                                        onClick={() => setShowAuthModal(true)}
                                        className="px-8 py-3 rounded-xl bg-brand-green text-black text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] active:scale-[0.98] transition-all"
                                    >
                                        Log In to Access
                                    </button>
                                </div>
                            ) : (!isProUser && (item.isPremium ? true : (PRO_ONLY_TOOLS.includes(aiSystem) && advanceTrialsUsed >= 2))) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#050505] z-30">
                                    <div className="w-16 h-16 rounded-full bg-brand-green/10 border border-brand-green/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,0,0.15)]">
                                        <Lock className="text-brand-green" size={28} />
                                    </div>
                                    <h4 className="text-2xl font-heading font-black tracking-tight text-white mb-3 uppercase">Pro Access Required</h4>
                                    <p className="text-white/50 max-w-sm mb-8 font-sans">
                                        {item.isPremium 
                                            ? "The specialized AI prompts for this premium component are available only to Pro members."
                                            : advanceTrialsUsed >= 2 
                                                ? `${aiSystem === 'antigravity' ? 'Antigravity' : aiSystem === 'claude' ? 'Claude' : 'Advanced AI'} trial has ended. Upgrade to Pro for unlimited elite prompts.`
                                                : `${aiSystem === 'antigravity' ? 'Antigravity' : aiSystem === 'claude' ? 'Claude' : 'Advanced AI'} prompts require a Pro subscription. Free members can use Lovable and Cursor prompts.`
                                        }
                                    </p>
                                    <Link to="/pricing">
                                        <button className="px-8 py-3 rounded-xl bg-brand-green text-black text-xs font-black uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,0,0.3)] hover:shadow-[0_0_30px_rgba(0,255,0,0.5)] active:scale-[0.98] transition-all">Upgrade for Pro Access</button>
                                    </Link>
                                </div>
                            ) : (
                                <pre 
                                    className={`font-mono whitespace-pre-wrap ${(!user) ? 'select-none' : ''}`}
                                    onCopy={(e) => {
                                        if (!user) {
                                            e.preventDefault();
                                            setShowAuthModal(true);
                                        }
                                    }}
                                >
                                    {isLoadingPrompt ? (
                                        <div className="flex flex-col items-center justify-center h-full py-20 text-brand-green/40">
                                            <div className="w-8 h-8 rounded-full border-2 border-brand-green/20 border-t-brand-green animate-spin mb-4" />
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-black animate-pulse">Establishing Secure Link...</p>
                                        </div>
                                    ) : (
                                        <CodeHighlighter code={deferredVibePrompt} />
                                    )}
                                </pre>
                            )}
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01] flex items-center justify-between relative z-20">
                            <div className="flex items-center gap-2">
                                <div className={`w-1 h-1 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : 'bg-brand-green animate-pulse'}`} />
                                <span className="text-[8px] uppercase tracking-widest text-white/20 font-bold">{isPending ? 'Processing...' : 'Terminal Active'}</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                <img src="/logo.png" alt="UI HUB" className="w-3 h-3 object-contain opacity-40" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                                <span className="text-[8px] uppercase tracking-widest font-bold animate-terminal-green-blink">UI HUB</span>
                            </div>
                            <span className="text-[8px] uppercase tracking-widest text-white/10 font-bold whitespace-nowrap">UTF-8 // LN: {deferredVibePrompt.split('\n').length}</span>
                        </div>
                    </div>
                    <div className="absolute -inset-4 bg-brand-green/5 blur-3xl rounded-[4rem] group-hover/terminal:bg-brand-green/10 transition-colors duration-1000 -z-10" />
                </div>
            </section>
            
            {/* Holographic Toast Notification */}
            <Toast 
                isVisible={showToast} 
                message={toastMessage} 
                onClose={() => setShowToast(false)} 
            />
        </motion.div>
    );
});

const ComponentDetail = ({ item, onBack }: { item: ComponentItem; onBack: () => void }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tab, setTab] = React.useState<'preview' | 'code' | 'vibe'>('preview');
    const [copied, setCopied] = React.useState<string | null>(null);
    const [resetKey, setResetKey] = React.useState(0);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const previewRef = React.useRef<HTMLDivElement>(null);

    const toggleFullscreen = () => {
        if (!previewRef.current) return;

        if (!document.fullscreenElement) {
            previewRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Dynamic states
    const [fetchedSource, setFetchedSource] = React.useState<string>('');
    const [isLoadingSource, setIsLoadingSource] = React.useState(false);
    const [installMethod, setInstallMethod] = React.useState<'cli' | 'manual'>('cli');
    const [pkgManager, setPkgManager] = React.useState<'npm' | 'pnpm' | 'yarn' | 'bun'>('npm');
    const [lang, setLang] = React.useState<'js' | 'ts' | 'html'>('ts');
    const [styling, setStyling] = React.useState<'tailwind' | 'css'>('tailwind');

    const { user, isPro: isProUser } = useAuth();
    const [advanceTrialsUsed, setAdvanceTrialsUsed] = React.useState<number>(() => {
        const used = localStorage.getItem('advanceTrialsUsed');
        return used ? parseInt(used, 10) : 0;
    });
    const [isFavorited, setIsFavorited] = React.useState(false);
    const [showAuthModal, setShowAuthModal] = React.useState(false);
    const [favoritesCount, setFavoritesCount] = React.useState(0);

    // Toast state for code copy
    const [showToast, setShowToast] = React.useState(false);
    const [toastMessage, setToastMessage] = React.useState('');

    React.useEffect(() => {
        if (!user) {
            setIsFavorited(false);
            setFavoritesCount(0);
            return;
        }
        const unsubscribe = getUserFavorites(user.uid, (favorites) => {
            setFavoritesCount(favorites.length);
            const found = favorites.find(f => f.componentId === item.id);
            setIsFavorited(!!found);
        });
        return unsubscribe;
    }, [user, item.id]);

    const toggleFavorite = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }
        if (isFavorited) {
            await removeFromFavorites(user.uid, item.id);
        } else {
            if (!isProUser && favoritesCount >= 5) {
                alert("Vault Limit Reached: Free members can save up to 5 components. Upgrade to Pro for unlimited storage in your vault!");
                navigate('/pricing');
                return;
            }
            await saveToFavorites(user.uid, item);
        }
    };
    React.useEffect(() => {
        const loadSource = async () => {
            if (tab !== 'code' || !user || (item.isPremium && !isProUser)) return;
            
            setIsLoadingSource(true);
            try {
                const token = await user.getIdToken();
                const source = await fetchComponentSource(item.id, token);
                setFetchedSource(source);
            } catch (error) {
                console.error('Failed to load source from backend:', error);
                setFetchedSource('// Failed to load source code from secure vault.');
            } finally {
                setIsLoadingSource(false);
            }
        };

        loadSource();
    }, [tab, item.id, user, isProUser]);

    const handleDownloadZip = async () => {
        if (!isProUser) {
            alert("Pro Feature: ZIP downloads are reserved for our Pro members. Upgrade your plan to download the full asset package.");
            navigate('/pricing');
            return;
        }
        if (!item) return;
        
        // Specialized handling for SVG Page Transition to download pre-packaged zip
        if (item.id === 'svg-page-transition') {
            const link = document.createElement('a');
            link.href = '/assets/svg-page-transition/svg-stroke-page-transition.zip';
            link.download = 'svg-stroke-page-transition.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        // Specialized handling for Rubiks Cube to include pre-packaged original images
        if (item.id === '3d-rubiks-cube') {
            const link = document.createElement('a');
            link.href = '/assets/3d-rubiks-cube/Rubiks-Cube-UI-HUB-bundle.zip';
            link.download = '3D-Rubiks-Cube-UI-HUB.zip';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }

        const reactCode = getComponentCode(item.id, { lang: 'ts', styling: 'tailwind' });
        const htmlCode = getComponentCode(item.id, { lang: 'html', styling: 'css' });
        
        let assets: { url: string; fileName: string }[] = [];

        if (item.id === '3d-scroll-animation') {
            for (let i = 1; i <= 300; i++) {
                const frameNum = i.toString().padStart(4, '0');
                assets.push({
                    url: `/assets/3d-scroll-animation/male${frameNum}.png`,
                    fileName: `assets/male${frameNum}.png`
                });
            }
        } else if (item.id === '3d-slider') {
            const sliderImages = [
                "https://4kwallpapers.com/images/walls/thumbs_3t/24686.jpg",
                "https://4kwallpapers.com/images/walls/thumbs_3t/24719.jpg",
                "https://4kwallpapers.com/images/walls/thumbs_3t/24534.jpg",
                "https://4kwallpapers.com/images/walls/thumbs_3t/24204.jpg"
            ];
            sliderImages.forEach((url, i) => {
                assets.push({ url, fileName: `assets/slide${i + 1}.jpg` });
            });
        }

        await downloadComponentZip(item.id, item.title, assets, reactCode, htmlCode);
    };

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setToastMessage(`CODE COPIED`);
        setShowToast(true);
        setTimeout(() => setCopied(null), 2000);
    };

    const installCommand = React.useMemo(() => {
        if (installMethod === 'cli') return `npx ui-hub add ${item.id}`;
        const cmd: Record<string, string> = {
            npm: "npm install framer-motion clsx tailwind-merge lucide-react",
            yarn: "yarn add framer-motion clsx tailwind-merge lucide-react",
            pnpm: "pnpm add framer-motion clsx tailwind-merge lucide-react",
            bun: "bun add framer-motion clsx tailwind-merge lucide-react"
        };
        return cmd[pkgManager];
    }, [installMethod, item.id, pkgManager]);

    const componentConfig = React.useMemo(() => COMPONENT_CONFIG[item.id] || {
        props: [],
        vibeMeta: { behavior: item.vibePrompt, states: { from: "default", to: "animated" }, cssProperties: ["transition", "transform", "opacity"] }
    }, [item.id, item.vibePrompt]);

    const vanillaCode = React.useMemo(() => getComponentCode(item.id, { lang: 'html', styling: 'css' }), [item.id]);

    const usageCode = React.useMemo(() => `// Usage for ${item.title}
<${item.title.replace(/\s+/g, '')} />`, [item.title]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="flex flex-col gap-8 pb-24"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <button
                    onClick={onBack}
                    className={`flex items-center gap-2 transition-colors text-sm font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-white/40 hover:text-brand-green' : 'text-[#00AEEF]/60 hover:text-[#00AEEF]'}`}
                >
                    <ChevronLeft size={16} />
                    Back to Library
                </button>
            </div>

            <div className="flex flex-col">
                <div className="flex items-center justify-between gap-4 mb-5 md:mb-8">
                    <h2 className={`text-2xl sm:text-4xl md:text-7xl lg:text-8xl font-display uppercase tracking-tighter leading-none ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 30px rgba(0,174,239,0.3), 0 0 60px rgba(0,174,239,0.15)' } : undefined}>
                        {item.title}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="relative group/heart">
                            {/* Persistent Glow Aura */}
                            <div className={`absolute -inset-4 rounded-full blur-2xl transition-opacity duration-700 ${isFavorited ? 'bg-red-500/20 opacity-100' : 'bg-white/5 opacity-0 group-hover/heart:opacity-100'}`} />

                            <motion.button
                                onClick={toggleFavorite}
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className={`relative z-10 p-5 rounded-full border-2 transition-all duration-300 ${isFavorited
                                    ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]'
                                    : theme === 'dark' ? 'bg-white/5 border-white/20 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/10 shadow-2xl' : 'bg-[#00AEEF]/5 border-[#00AEEF]/20 text-[#00AEEF]/40 hover:text-[#00AEEF] hover:border-[#00AEEF]/40 hover:bg-[#00AEEF]/10 shadow-2xl'
                                    }`}
                            >
                                <motion.div
                                    animate={isFavorited ? {
                                        scale: [1, 1.15, 1],
                                        transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" }
                                    } : {}}
                                >
                                    <Heart
                                        size={28}
                                        fill={isFavorited ? "currentColor" : "transparent"}
                                        className={isFavorited ? 'drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'transition-colors'}
                                    />
                                </motion.div>
                            </motion.button>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1 space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
                            <div className="flex flex-wrap gap-2 md:gap-4">
                                <button
                                    onClick={() => setTab('preview')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'preview' ? (theme === 'dark' ? 'bg-white/10 text-white border border-white/20' : 'bg-[#00AEEF]/15 text-[#00AEEF] border border-[#00AEEF]/30 shadow-[0_0_15px_rgba(0,174,239,0.15)]') : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-[#00AEEF]/40 hover:text-[#00AEEF]')}`}
                                >
                                    <Eye size={13} className="md:w-4 md:h-4" />
                                    Preview
                                </button>
                                <button
                                    onClick={() => setTab('code')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'code' ? (theme === 'dark' ? 'bg-white/10 text-white border border-white/20' : 'bg-[#00AEEF]/15 text-[#00AEEF] border border-[#00AEEF]/30 shadow-[0_0_15px_rgba(0,174,239,0.15)]') : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-[#00AEEF]/40 hover:text-[#00AEEF]')}`}
                                >
                                    <Code size={13} className="md:w-4 md:h-4" />
                                    Code
                                </button>
                                <button
                                    onClick={() => setTab('vibe')}
                                    className={`flex items-center gap-1.5 md:gap-2 px-4 md:px-8 py-2.5 md:py-3 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all ${tab === 'vibe' ? 'bg-brand-green text-black border border-brand-green shadow-[0_0_20px_rgba(0,255,0,0.3)]' : 'bg-brand-green/10 text-brand-green border border-brand-green/30 hover:bg-brand-green/20 hover:border-brand-green/60 hover:shadow-[0_0_15px_rgba(0,255,0,0.2)]'}`}
                                >
                                    <Zap size={13} className={`${tab === 'vibe' ? 'fill-black' : ''} md:w-4 md:h-4`} />
                                    Vibe Prompt
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {tab === 'preview' && (
                                    <div className="flex items-center gap-3">
                                        {(item.category === 'portfolios' || item.category === '3d' || item.category === '3d-chatbot' || item.id.startsWith('3d-') || item.category === 'scroll') && (
                                            <Link
                                                to={item.id === '3d-scroll-animation' ? '/demo/3d-scroll-animation' : 
                                                    item.id === '3d-slider' ? '/demo/3d-slider' : 
                                                    `/demo/${item.id}`}
                                                target="_blank"
                                                className="no-underline"
                                            >
                                                <motion.button
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    onMouseEnter={() => preloadComponent(item.id)}
                                                    className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#09090b] text-white border border-white/20 hover:bg-white/5 hover:border-white/30 transition-all text-[10px] md:text-sm font-bold uppercase tracking-widest shadow-2xl shrink-0 group"
                                                >
                                                    <ExternalLink size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                                    VIEW FULL DEMO
                                                </motion.button>

                                            </Link>
                                        )}
                                            {(item.id === '3d-scroll-animation' || item.id === '3d-slider' || item.id === '3d-rubiks-cube' || item.id === 'svg-page-transition') && (
                                                <motion.button
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    onClick={handleDownloadZip}
                                                    className={`flex items-center justify-center gap-2 px-8 py-3 rounded-full border transition-all text-sm font-bold uppercase tracking-widest shadow-2xl shrink-0 group ${
                                                        !isProUser 
                                                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-500/70 hover:bg-amber-500/20 hover:border-amber-500/40' 
                                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    {!isProUser ? (
                                                        <Lock size={14} className="group-hover:scale-110 transition-transform" />
                                                    ) : (
                                                        <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
                                                    )}
                                                    Download ZIP
                                                </motion.button>
                                            )}

                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                onClick={() => setResetKey(prev => prev + 1)}
                                                className="flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-brand-green/10 border border-brand-green/30 text-brand-green hover:bg-brand-green hover:text-black transition-all text-sm font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(0,255,0,0.15)] hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] shrink-0 group"
                                            >
                                                <RotateCcw key={resetKey} size={14} className={`${resetKey > 0 ? 'animate-spin-once' : ''} transition-transform group-hover:-rotate-90 md:w-4 md:h-4`} />
                                                Replay
                                            </motion.button>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {tab === 'preview' ? (
                    <motion.div
                        key="preview-content"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-12"
                    >
                        <div className="flex flex-wrap items-center gap-6 px-2 mb-8">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green font-bold text-[10px]">
                                    <Check size={10} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-brand-green font-bold">Verified Asset</p>
                                    <p className={`text-[11px] font-bold leading-tight ${theme === 'dark' ? 'text-white/40' : 'text-black/40'}`}>UI Hub Curated</p>
                                </div>
                            </div>

                            <div className={`w-px h-8 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/10'}`} />

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Build Stack</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${theme === 'dark' ? 'bg-white/[0.03] border-white/10 text-white/60' : 'bg-black/[0.03] border-black/10 text-black/60'}`}>React 18</span>
                                        <span className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${theme === 'dark' ? 'bg-white/[0.03] border-white/10 text-white/60' : 'bg-black/[0.03] border-black/10 text-black/60'}`}>Tailwind CSS</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`w-px h-8 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/10'}`} />

                            <div className="flex flex-col">
                                <p className={`text-[10px] uppercase tracking-widest font-bold mb-1 ${theme === 'dark' ? 'text-white/30' : 'text-black/30'}`}>Category</p>
                                <span className={`text-[11px] font-bold uppercase tracking-wider ${theme === 'dark' ? 'text-brand-green' : 'text-[#00AEEF]'}`}>{item.category}</span>
                            </div>
                        </div>

                        {item.imageUrl && (
                            <div className="mb-12">
                                <h3 className={`text-2xl md:text-3xl font-display uppercase tracking-tight px-2 mb-6 ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 20px rgba(0,174,239,0.2)' } : undefined}>Preview Image</h3>
                                <div className={`aspect-video w-full glass rounded-[2rem] md:rounded-[3rem] overflow-hidden border ${theme === 'dark' ? 'border-white/5 bg-black/40' : 'border-black/5 bg-white/40'}`}>
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        <div 
                            ref={previewRef}
                            className={`min-h-[320px] sm:min-h-[280px] md:min-h-0 ${item.category === '3d-chatbot' ? 'aspect-square md:aspect-video' : 'aspect-[4/3] md:aspect-video'} w-full glass rounded-2xl md:rounded-[3rem] relative overflow-hidden flex items-center justify-center ${theme === 'dark' ? 'bg-black/20 border border-white/5' : 'bg-white/30 border border-black/5'} ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none bg-black' : ''}`}
                        >
                            {(item.category === '3d' || item.category === 'portfolios' || item.category === '3d-chatbot') && (
                                <button
                                    onClick={toggleFullscreen}
                                    className={`absolute top-6 right-6 p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/60 transition-all z-50 group ${isFullscreen ? 'opacity-40 hover:opacity-100' : ''}`}
                                    title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                                </button>
                            )}
                            <div
                                className={`text-center w-full ${item.category === 'background' || item.category === 'cursor' || item.category === '3d' || item.category === 'portfolios' || item.category === '3d-chatbot' ? 'h-full' : 'px-2 md:px-8'}`}
                            >
                                <div className={`flex justify-center ${item.category === 'background' || item.category === 'cursor' || item.category === '3d' || item.category === 'portfolios' || item.category === '3d-chatbot' ? 'h-full w-full' : 'scale-[0.65] sm:scale-75 md:scale-100'}`} key={resetKey}>
                                    <React.Suspense fallback={
                                        <div className="flex flex-col items-center justify-center p-12 text-white/20">
                                            <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-brand-green animate-spin mb-4" />
                                            <p className="text-[10px] uppercase tracking-widest font-bold animate-pulse">Initializing Preview...</p>
                                        </div>
                                    }>
                                        {item.preview({ showDemoButton: true })}
                                    </React.Suspense>
                                </div>
                            </div>
                        </div>

                        {/* Props Table */}
                        {componentConfig.props.length > 0 && (
                            <section className="space-y-6 md:space-y-8">
                                <h3 className={`text-2xl md:text-3xl font-display uppercase tracking-tight px-2 ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 20px rgba(0,174,239,0.2)' } : undefined}>Props</h3>
                                <div className={`rounded-[1.5rem] md:rounded-[2rem] border overflow-hidden p-2 md:p-4 shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-[#09090b]' : 'border-black/10 bg-white'}`}>
                                    <PropsTable props={componentConfig.props} theme={theme} />
                                </div>
                            </section>
                        )}
                    </motion.div>
                ) : tab === 'code' ? (
                    <motion.div
                        key="code-content"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-16"
                    >
                        {/* Install Section */}
                        <section>
                            <h3 className={`text-2xl md:text-3xl font-display uppercase tracking-tight mb-6 md:mb-8 ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 20px rgba(0,174,239,0.2)' } : undefined}>Install</h3>
                            <div className={`inline-flex glass p-1.5 rounded-full mb-6 md:mb-8 border ${theme === 'dark' ? 'border-white/5 bg-black/20' : 'border-black/5 bg-white/50'}`}>
                                <button
                                    onClick={() => setInstallMethod('cli')}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all border ${installMethod === 'cli' ? (theme === 'dark' ? 'bg-[#09090b] text-white border-white/20 shadow-lg' : 'bg-white text-[#00AEEF] border-[#00AEEF]/30 shadow-[0_0_12px_rgba(0,174,239,0.15)]') : (theme === 'dark' ? 'bg-transparent text-white/40 border-transparent hover:text-white' : 'bg-transparent text-[#00AEEF]/40 border-transparent hover:text-[#00AEEF]')}`}
                                >CLI</button>
                                <button
                                    onClick={() => setInstallMethod('manual')}
                                    className={`px-6 md:px-8 py-2 md:py-2.5 rounded-full text-[10px] md:text-sm font-bold uppercase tracking-widest transition-all border ${installMethod === 'manual' ? (theme === 'dark' ? 'bg-[#09090b] text-white border-white/20 shadow-lg' : 'bg-white text-[#00AEEF] border-[#00AEEF]/30 shadow-[0_0_12px_rgba(0,174,239,0.15)]') : (theme === 'dark' ? 'bg-transparent text-white/40 border-transparent hover:text-white' : 'bg-transparent text-[#00AEEF]/40 border-transparent hover:text-[#00AEEF]')}`}
                                >Manual</button>
                            </div>

                            <div className={`rounded-2xl md:rounded-3xl overflow-hidden border shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-[#09090b]' : 'border-black/10 bg-white'}`}>
                                <AnimatePresence mode="wait">
                                    {installMethod === 'manual' && (
                                        <motion.div
                                            key="manual-tabs"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex border-b border-white/5"
                                        >
                                            {(['npm', 'pnpm', 'yarn', 'bun'] as const).map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPkgManager(m)}
                                                    className={`px-8 py-4 text-xs font-bold uppercase tracking-widest relative ${pkgManager === m ? (theme === 'dark' ? 'text-white' : 'text-[#00AEEF]') : (theme === 'dark' ? 'text-white/40 hover:text-white' : 'text-[#00AEEF]/40 hover:text-[#00AEEF]')}`}
                                                >
                                                    {m}
                                                    {pkgManager === m && (
                                                        <motion.div layoutId="pkg-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-green" />
                                                    )}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="p-8 flex items-center justify-between">
                                    <code className="text-brand-green font-mono text-sm">{installCommand}</code>
                                    <button
                                        onClick={() => handleCopy(installCommand, 'install')}
                                        className={`flex items-center gap-2 p-3 rounded-xl transition-all ${copied === 'install' ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-[#00AEEF]/40 hover:text-[#00AEEF] hover:bg-[#00AEEF]/5')}`}
                                    >
                                        {copied === 'install' ? <Check size={18} /> : <Copy size={18} />}
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Usage Section */}
                        <section>
                            <h3 className={`text-3xl font-display uppercase tracking-tight mb-2 ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 20px rgba(0,174,239,0.2)' } : undefined}>Usage <span className={`text-sm font-sans tracking-normal lowercase ${theme === 'dark' ? 'text-white/30' : 'text-[#00AEEF]/40'}`}>(with your settings)</span></h3>
                            <div className={`rounded-3xl overflow-hidden border relative shadow-2xl ${theme === 'dark' ? 'border-white/10 bg-[#09090b]' : 'border-black/10 bg-white'}`}>
                                <button
                                    onClick={() => handleCopy(usageCode, 'usage')}
                                    className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'usage' ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-[#00AEEF]/40 hover:text-[#00AEEF] hover:bg-[#00AEEF]/5')}`}
                                >
                                    {copied === 'usage' ? <Check size={18} /> : <Copy size={18} />}
                                </button>
                                <div className="p-6 md:p-8 leading-relaxed overflow-auto custom-scrollbar">
                                    <pre className="font-sans text-xs md:text-sm"><CodeHighlighter code={usageCode} /></pre>
                                </div>
                            </div>
                        </section>

                        {/* Code Section */}
                        <section>
                            <h3 className={`text-3xl font-display uppercase tracking-tight mb-8 ${theme === 'dark' ? 'text-white' : 'text-[#00AEEF]'}`} style={theme === 'light' ? { textShadow: '0 0 20px rgba(0,174,239,0.2)' } : undefined}>Code</h3>
                            <div className="flex flex-wrap gap-4 mb-8">
                                <CustomSelect
                                    label="Language"
                                    value={lang}
                                    onChange={setLang}
                                    options={[
                                        { id: 'ts', name: 'TypeScript' },
                                        { id: 'js', name: 'JavaScript' },
                                        { id: 'html', name: 'HTML' }
                                    ]}
                                />

                                <CustomSelect
                                    label="Styling"
                                    value={styling}
                                    onChange={setStyling}
                                    options={[
                                        { id: 'tailwind', name: 'Tailwind' },
                                        { id: 'css', name: 'CSS' }
                                    ]}
                                />
                            </div>

                            <div className={`rounded-[2.5rem] overflow-hidden border relative shadow-2xl min-h-[400px] ${theme === 'dark' ? 'border-white/10 bg-[#09090b]' : 'border-black/10 bg-white'}`}>
                                {item.isPremium && !isProUser ? (
                                    <PremiumGate message="This premium component requires a Pro subscription to view and copy the source code." />
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleCopy(fetchedSource || getComponentCode(item.id, { lang, styling }), 'source')}
                                            className={`absolute top-6 right-6 p-3 rounded-lg transition-all z-10 ${copied === 'source' ? 'bg-brand-green/20 text-brand-green' : (theme === 'dark' ? 'text-white/40 hover:text-white hover:bg-white/5' : 'text-[#00AEEF]/40 hover:text-[#00AEEF] hover:bg-[#00AEEF]/5')}`}
                                        >
                                            {copied === 'source' ? <Check size={18} /> : <Copy size={18} />}
                                        </button>
                                        <div className="p-6 md:p-8 text-xs leading-relaxed max-h-[600px] overflow-auto custom-scrollbar">
                                            {isLoadingSource ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-white/20">
                                                    <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin mb-4" />
                                                    <p className="text-[10px] uppercase tracking-widest font-bold">Decrypting Source...</p>
                                                </div>
                                            ) : (
                                                <pre className="font-sans"><code><CodeHighlighter code={fetchedSource || getComponentCode(item.id, { lang, styling })} /></code></pre>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </motion.div>
                ) : (
                    <VibeSystemSection
                        item={item}
                        lang={lang}
                        styling={styling}
                        user={user}
                        isProUser={isProUser}
                        advanceTrialsUsed={advanceTrialsUsed}
                        setAdvanceTrialsUsed={setAdvanceTrialsUsed}
                        componentConfig={componentConfig}
                        vanillaCode={vanillaCode}
                        setShowAuthModal={setShowAuthModal}
                    />
                )}
            </AnimatePresence>

            <AuthRequiredModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                title="Save to Vault"
                description="Sign in to your account to save this elite component to your personal collection."
            />
            {/* Holographic Toast Notification */}
            <Toast 
                isVisible={showToast} 
                message={toastMessage} 
                onClose={() => setShowToast(false)} 
            />
        </motion.div>
    );
};

export default ComponentDetail;
