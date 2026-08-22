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
import { fetchVibePrompt, fetchComponentSource, getFallbackVibePrompt, AISystem, VibeMeta } from '../../../../utils/promptUtils';
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
    } else if (id === 'cloud-scroll') {
        import('../../../Components/CloudScrollPage');
    }
};


const PropsTable = ({ props }: { props: PropDefinition[]; theme?: string }) => (
    <div className="w-full overflow-x-auto">
        <table className="w-full text-left border-collapse">
            <thead>
                <tr className="border-b-2 border-white text-xs font-black uppercase tracking-wider text-neutral-400">
                    <th className="py-4 px-4 font-black">PROP</th>
                    <th className="py-4 px-4 font-black">TYPE</th>
                    <th className="py-4 px-4 font-black">DEFAULT</th>
                    <th className="py-4 px-4 font-black">DESCRIPTION</th>
                </tr>
            </thead>
            <tbody className="text-xs">
                {props.map((p, i) => (
                    <tr key={i} className="border-b border-neutral-800 transition-colors hover:bg-neutral-900/50">
                        <td className="py-4 px-4 font-mono">
                            <span className="px-2 py-0.5 rounded border-2 border-white bg-brand-bg text-white font-bold">{p.name}</span>
                        </td>
                        <td className="py-4 px-4 font-mono">
                            <span className="px-2 py-0.5 rounded border-2 border-brand-blue bg-brand-bg text-brand-blue font-bold">{p.type}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-neutral-400">
                            <span className="px-2 py-0.5 rounded border border-neutral-700 bg-brand-bg text-neutral-300">{p.default}</span>
                        </td>
                        <td className="py-4 px-4 leading-relaxed text-neutral-300 font-medium">{p.description}</td>
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
                className={`flex items-center justify-between gap-4 px-4 py-2.5 rounded-lg bg-brand-surface border-2 transition-all text-xs font-black uppercase tracking-wider brutal-shadow-black ${
                    isOpen ? 'border-brand-blue bg-neutral-900' : 'border-white hover:border-neutral-200'
                }`}
            >
                <div className="flex flex-col items-start gap-0.5">
                    <span className="text-[9px] text-neutral-400 font-bold">{label}</span>
                    <span className="text-white font-black">{selectedOption?.name}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform duration-200 text-neutral-400 ${isOpen ? 'rotate-180 text-brand-blue' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute bottom-full mb-2 left-0 w-full min-w-[160px] bg-brand-surface border-2 border-white rounded-lg overflow-hidden z-[100] brutal-shadow-black"
                    >
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-4 py-2.5 text-left text-xs font-black uppercase tracking-wider transition-colors ${
                                    value === opt.id ? 'bg-brand-blue text-white' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
                                }`}
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
    <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-brand-surface/95 rounded-[inherit] border-2 border-white p-8 text-center">
        <div className="relative mb-4">
            <div className="w-14 h-14 rounded-lg bg-brand-bg border-2 border-white flex items-center justify-center brutal-shadow-black text-brand-yellow">
                <Lock className="w-7 h-7" />
            </div>
            {/* PRO Badge */}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded bg-brand-yellow text-black border border-black text-[8px] font-black uppercase tracking-wider">
                PRO
            </span>
        </div>

        <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Premium Feature</h3>
        <p className="text-neutral-400 text-xs max-w-sm mb-6 font-medium">{message}</p>

        <Link to="/pricing">
            <button className="brutal-btn-primary px-8 py-2.5 text-xs font-black uppercase tracking-wider">
                Upgrade to Pro
            </button>
        </Link>
    </div>
);

const PRO_ONLY_TOOLS: AISystem[] = ['advance', 'antigravity', 'claude'];

interface ToolTheme {
    name: string;
    sublabel: string;
    bgDefault: string;
    bgHover: string;
    bgActive: string;
    borderDefault: string;
    borderHover: string;
    borderActive: string;
    shadowActive: string;
    shadowHover: string;
    accentColor: string;
    indicatorDot: string;
    glowGradients: string;
}

const TOOL_THEMES: Record<AISystem, ToolTheme> = {
    cursor: {
        name: 'Cursor',
        sublabel: 'SMART IDE',
        bgDefault: 'bg-[#0D1117]',
        bgHover: 'hover:bg-[#161B22]',
        bgActive: 'bg-[#161B22]',
        borderDefault: 'border-[#30363D]',
        borderHover: 'hover:border-[#58A6FF]',
        borderActive: 'border-[#58A6FF]',
        shadowActive: 'shadow-[4px_4px_0px_0px_#58A6FF]',
        shadowHover: 'hover:shadow-[4px_4px_0px_0px_#58A6FF]',
        accentColor: 'text-[#58A6FF]',
        indicatorDot: 'bg-[#58A6FF]',
        glowGradients: 'from-[#58A6FF]/10 to-transparent'
    },
    lovable: {
        name: 'Lovable',
        sublabel: 'PLATFORM HUB',
        bgDefault: 'bg-[#160E0E]',
        bgHover: 'hover:bg-[#251515]',
        bgActive: 'bg-[#251515]',
        borderDefault: 'border-[#4A2624]',
        borderHover: 'hover:border-[#FF5A5F]',
        borderActive: 'border-[#FF5A5F]',
        shadowActive: 'shadow-[4px_4px_0px_0px_#FF5A5F]',
        shadowHover: 'hover:shadow-[4px_4px_0px_0px_#FF5A5F]',
        accentColor: 'text-[#FF7E67]',
        indicatorDot: 'bg-[#FF5A5F]',
        glowGradients: 'from-[#FF5A5F]/10 to-transparent'
    },
    antigravity: {
        name: 'Antigravity',
        sublabel: 'VIBE ENGINE',
        bgDefault: 'bg-[#121317]',
        bgHover: 'hover:bg-[#1B1D24]',
        bgActive: 'bg-[#1B1D24]',
        borderDefault: 'border-neutral-700',
        borderHover: 'hover:border-white',
        borderActive: 'border-white',
        shadowActive: 'shadow-[4px_4px_0px_0px_#FFFFFF]',
        shadowHover: 'hover:shadow-[4px_4px_0px_0px_#FFFFFF]',
        accentColor: 'text-white',
        indicatorDot: 'bg-white',
        glowGradients: 'from-white/10 to-transparent'
    },
    claude: {
        name: 'Claude',
        sublabel: 'INTELLIGENT MODEL',
        bgDefault: 'bg-[#18110D]',
        bgHover: 'hover:bg-[#261812]',
        bgActive: 'bg-[#261812]',
        borderDefault: 'border-[#42261C]',
        borderHover: 'hover:border-[#C15F3C]',
        borderActive: 'border-[#C15F3C]',
        shadowActive: 'shadow-[4px_4px_0px_0px_#C15F3C]',
        shadowHover: 'hover:shadow-[4px_4px_0px_0px_#C15F3C]',
        accentColor: 'text-[#F4F3EE]',
        indicatorDot: 'bg-[#C15F3C]',
        glowGradients: 'from-[#C15F3C]/10 to-transparent'
    },
    advance: {
        name: 'Advance',
        sublabel: 'ADVANCED SYSTEM',
        bgDefault: 'bg-[#0E1020]',
        bgHover: 'hover:bg-[#141833]',
        bgActive: 'bg-[#141833]',
        borderDefault: 'border-[#1E2555]',
        borderHover: 'hover:border-brand-blue',
        borderActive: 'border-brand-blue',
        shadowActive: 'shadow-[4px_4px_0px_0px_#3D5CFF]',
        shadowHover: 'hover:shadow-[4px_4px_0px_0px_#3D5CFF]',
        accentColor: 'text-brand-blue',
        indicatorDot: 'bg-brand-blue',
        glowGradients: 'from-[#3D5CFF]/10 to-transparent'
    }
};

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
    const theme = TOOL_THEMES[tool];

    return (
        <button
            onClick={() => !isLocked && onClick(tool)}
            className={`p-5 rounded-lg border-2 transition-all duration-200 text-left relative overflow-hidden flex flex-col justify-between min-h-[130px] group ${
                isLocked
                    ? 'bg-neutral-900 border-neutral-700 opacity-60 cursor-not-allowed'
                    : isActive
                    ? `${theme.bgActive} ${theme.borderActive} ${theme.shadowActive} translate-x-0.5 translate-y-0.5`
                    : `${theme.bgDefault} ${theme.borderDefault} ${theme.bgHover} ${theme.borderHover} ${theme.shadowHover} hover:translate-x-0.5 hover:translate-y-0.5`
            }`}
        >
            {/* Ambient Background Gradient */}
            <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full bg-gradient-to-br ${theme.glowGradients} blur-xl pointer-events-none transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

            {/* Lock Badge for non-Pro users */}
            {isLocked && (
                <div className="absolute top-2 right-2 z-30">
                    <span className="px-2 py-0.5 rounded bg-brand-surface border border-neutral-600 text-neutral-400 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Lock size={10} /> PRO
                    </span>
                </div>
            )}

            <div className="relative z-10 w-full flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <p className={`text-[9px] uppercase tracking-widest font-black transition-colors ${isLocked ? 'text-neutral-500' : isActive ? theme.accentColor : 'text-neutral-400 group-hover:' + theme.accentColor}`}>
                        {itemId === 'robot-3d-background' ? (
                            tool === 'antigravity' ? 'NEON ENGINE' :
                                tool === 'lovable' ? 'ROBOTIC HUB' :
                                    tool === 'cursor' ? 'CYBER CORE' :
                                        tool === 'claude' ? 'PHANTOM MODEL' : 'ADVANCED SYSTEM'
                        ) : (
                            theme.sublabel
                        )}
                    </p>
                    <div className={`transition-all duration-200 ${isActive ? `scale-110 ${theme.accentColor}` : 'text-neutral-400 group-hover:' + theme.accentColor}`}>
                        {tool === 'antigravity' ? (
                            <Zap size={20} className={isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'} />
                        ) : tool === 'lovable' ? (
                            <svg className={`w-5 h-5 ${isActive ? 'text-[#FF7E67]' : 'text-neutral-400 group-hover:text-[#FF7E67]'}`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        ) : tool === 'cursor' ? (
                            <div className={`relative w-5 h-5 ${isActive ? 'text-[#58A6FF]' : 'text-neutral-400 group-hover:text-[#58A6FF]'}`}>
                                <div className="absolute inset-0 border-2 border-current rounded-sm flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 border-r border-b border-current" />
                                </div>
                            </div>
                        ) : tool === 'claude' ? (
                            <Cpu size={20} className={isActive ? 'text-[#C15F3C]' : 'text-neutral-400 group-hover:text-[#C15F3C]'} />
                        ) : (
                            <Brain size={20} className={isActive ? 'text-brand-blue' : 'text-neutral-400 group-hover:text-brand-blue'} />
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-between w-full">
                    <h4 className={`text-lg font-black uppercase tracking-tight transition-colors ${isLocked ? 'text-neutral-500' : isActive ? 'text-white' : 'text-white group-hover:text-white'}`}>
                        {tool === 'advance' ? 'Advance' : tool}
                    </h4>
                </div>
            </div>

            {!isLocked && (
                <div className={`flex items-center gap-1.5 mt-3 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${theme.indicatorDot}`} />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${theme.accentColor}`}>
                        {isActive ? 'Active' : 'Select'}
                    </span>
                </div>
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
    const [fetchedPrompt, setFetchedPrompt] = React.useState<string>(() => getFallbackVibePrompt(item.id, defaultSystem, item));
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
        setIsLoadingPrompt(true);
        try {
            const token = user ? await user.getIdToken() : undefined;
            console.log(`[VibeSystem] Fetching prompt for ${item.id} (${aiSystem})...`);
            const prompt = await fetchVibePrompt(item.id, aiSystem, token, item);
            setFetchedPrompt(prompt || getFallbackVibePrompt(item.id, aiSystem, item));
        } catch (error) {
            console.warn('[VibeSystem] Falling back to local blueprint for:', item.id);
            setFetchedPrompt(getFallbackVibePrompt(item.id, aiSystem, item));
        } finally {
            setIsLoadingPrompt(false);
        }
    }, [aiSystem, item, user]);

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
                        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white line-clamp-1">Master Blueprint</h3>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-brand-yellow" />
                            <p className="text-[10px] uppercase tracking-widest font-black text-brand-yellow">
                                AI GENERATION BLUEPRINT
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative group/terminal">
                    <div className="rounded-lg overflow-hidden border-2 border-white bg-brand-surface brutal-shadow-black">
                        {/* Terminal Header / Toolbar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-white bg-black relative z-20 gap-3 sm:gap-0">
                            <div className="flex items-center justify-between w-full sm:w-auto">
                                <div className="flex items-center gap-3">
                                    {/* Traffic Light Dots in Red, Yellow, Blue */}
                                    <div className="flex gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-brand-red border border-black" />
                                        <div className="w-3 h-3 rounded-full bg-brand-yellow border border-black" />
                                        <div className="w-3 h-3 rounded-full bg-brand-blue border border-black" />
                                    </div>
                                    <div className="h-4 w-px bg-neutral-700 mx-1 sm:mx-2" />
                                    <div className="flex items-center gap-2 font-mono">
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${TOOL_THEMES[aiSystem]?.accentColor || 'text-brand-blue'}`}>{aiSystem}</span>
                                        <span className="text-[10px] font-black text-neutral-500 uppercase">//</span>
                                        <span className="text-[10px] font-bold text-neutral-300 uppercase tracking-wider">MASTER_{aiSystem === 'advance' ? 'PRO' : aiSystem.toUpperCase()}_v1.0.tsx</span>
                                    </div>
                                </div>
                            </div>

                            {/* Copy Button */}
                            <div>
                                <button
                                    disabled={isLoadingPrompt}
                                    onClick={handleCopyBlueprint}
                                    className="brutal-btn-primary px-4 py-1.5 text-xs font-black tracking-wider flex items-center gap-2"
                                >
                                    {copied === 'blueprint' ? <Check size={12} strokeWidth={3} /> : <Copy size={12} />}
                                    <span>{copied === 'blueprint' ? 'COPIED' : 'COPY BLUEPRINT'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Terminal Content */}
                        <div className="p-6 md:p-10 text-[10px] md:text-sm leading-relaxed max-h-[500px] md:max-h-[700px] overflow-auto custom-scrollbar relative z-20 min-h-[300px]">
                            {(!user || user.isAnonymous) && !['lovable', 'cursor'].includes(aiSystem) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0E] z-30">
                                    <div className="w-14 h-14 rounded-lg bg-brand-yellow border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000000]">
                                        <Lock className="text-black" size={26} />
                                    </div>
                                    <h4 className="text-2xl font-heading font-black tracking-tight text-white mb-3 uppercase">Authentication Required</h4>
                                    <p className="text-neutral-400 max-w-sm mb-8 font-sans text-sm font-medium">
                                        Please log in to your account to establish a secure link and access the UI HUB generation blueprints.
                                    </p>
                                    <button
                                        onClick={() => setShowAuthModal(true)}
                                        className="brutal-btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest"
                                    >
                                        Log In to Access
                                    </button>
                                </div>
                            ) : (!isProUser && (item.isPremium ? true : (PRO_ONLY_TOOLS.includes(aiSystem) && advanceTrialsUsed >= 2))) ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-[#0A0A0E] z-30">
                                    <div className="w-14 h-14 rounded-lg bg-brand-yellow border-2 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#000000]">
                                        <Lock className="text-black" size={26} />
                                    </div>
                                    <h4 className="text-2xl font-heading font-black tracking-tight text-white mb-3 uppercase">Pro Access Required</h4>
                                    <p className="text-neutral-400 max-w-sm mb-8 font-sans text-sm font-medium">
                                        {item.isPremium
                                            ? "The specialized AI prompts for this premium component are available only to Pro members."
                                            : advanceTrialsUsed >= 2
                                                ? `${aiSystem === 'antigravity' ? 'Antigravity' : aiSystem === 'claude' ? 'Claude' : 'Advanced AI'} trial has ended. Upgrade to Pro for unlimited elite prompts.`
                                                : `${aiSystem === 'antigravity' ? 'Antigravity' : aiSystem === 'claude' ? 'Claude' : 'Advanced AI'} prompts require a Pro subscription. Free members can use Lovable and Cursor prompts.`
                                        }
                                    </p>
                                    <Link to="/pricing">
                                        <button className="brutal-btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest">
                                            Upgrade for Pro Access
                                        </button>
                                    </Link>
                                </div>
                            ) : (
                                <pre
                                    className="font-mono whitespace-pre-wrap select-text selection:bg-brand-blue selection:text-white"
                                >
                                    {isLoadingPrompt ? (
                                        <div className="flex flex-col items-center justify-center h-full py-20 text-brand-blue">
                                            <div className="w-8 h-8 rounded-full border-2 border-brand-blue/20 border-t-brand-blue animate-spin mb-4" />
                                            <p className="text-[10px] uppercase tracking-[0.2em] font-black animate-pulse text-neutral-400">Establishing Secure Link...</p>
                                        </div>
                                    ) : (
                                        <CodeHighlighter code={deferredVibePrompt} />
                                    )}
                                </pre>
                            )}
                        </div>

                        {/* Bottom Status Bar */}
                        <div className="px-6 py-3 border-t-2 border-neutral-800 bg-[#0A0A0E] flex items-center justify-between relative z-20">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isPending ? 'bg-amber-400 animate-pulse' : (TOOL_THEMES[aiSystem]?.indicatorDot || 'bg-brand-blue') + ' animate-pulse'}`} />
                                <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">{isPending ? 'Processing...' : 'Terminal Active'}</span>
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                                <span className={`text-[9px] uppercase tracking-widest font-black ${TOOL_THEMES[aiSystem]?.accentColor || 'text-brand-blue'}`}>UI HUB</span>
                            </div>
                            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-mono whitespace-nowrap">UTF-8 // LN: {(deferredVibePrompt || '').split('\n').length}</span>
                        </div>
                    </div>
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

class PreviewErrorBoundary extends React.Component<
    { children: React.ReactNode; onReset?: () => void; componentId?: string },
    { hasError: boolean; error: Error | null }
> {
    constructor(props: { children: React.ReactNode; onReset?: () => void; componentId?: string }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("[UI-HUB Preview Error]:", error, errorInfo);
    }

    componentDidUpdate(prevProps: { componentId?: string }) {
        if (prevProps.componentId !== this.props.componentId && this.state.hasError) {
            this.setState({ hasError: false, error: null });
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 text-center text-neutral-300 w-full h-full min-h-[360px] bg-neutral-950/80 rounded-2xl border border-white/10 m-4">
                    <div className="w-12 h-12 rounded-full bg-brand-blue/10 border border-brand-blue/30 flex items-center justify-center text-brand-blue mb-3">
                        <RotateCcw size={20} />
                    </div>
                    <p className="text-sm font-bold uppercase tracking-wider text-white mb-1 font-heading">
                        Interactive Preview Reload
                    </p>
                    <p className="text-xs text-neutral-400 max-w-sm mb-5 leading-relaxed">
                        WebGL canvas state or runtime resources reset during component switch. Click below to load fresh.
                    </p>
                    <button
                        type="button"
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            this.props.onReset?.();
                        }}
                        className="px-5 py-2 rounded-xl bg-brand-blue hover:bg-brand-blue/90 text-white font-mono text-xs font-bold uppercase tracking-wider border border-white/20 transition-all shadow-[3px_3px_0px_0px_#000000] cursor-pointer hover:scale-105 active:scale-95"
                    >
                        ↻ Reload Component
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

const ComponentDetail = ({ item, onBack }: { item: ComponentItem; onBack: () => void }) => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [tab, setTab] = React.useState<'preview' | 'code' | 'vibe'>('preview');
    const [copied, setCopied] = React.useState<string | null>(null);
    const [resetKey, setResetKey] = React.useState(0);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const previewRef = React.useRef<HTMLDivElement>(null);

    const handleOpenFullscreen = () => {
        let demoUrl = `/demo/${item.id}`;
        if (item.id === '3d-scroll-animation') demoUrl = '/demo/3d-scroll-animation';
        else if (item.id === '3d-slider') demoUrl = '/demo/3d-slider';
        else if (item.id === 'section-scroll') demoUrl = '/demo/section-scroll';
        else if (item.id === 'cloud-scroll') demoUrl = '/demo/cloud-scroll';

        window.open(demoUrl, '_blank');
    };

    React.useEffect(() => {
        setResetKey(0);
        setFetchedSource('');
    }, [item.id]);

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
        const unsubscribe = getUserFavorites(user?.uid, (favorites) => {
            setFavoritesCount(favorites.length);
            const found = favorites.find(f => f.componentId === item.id);
            setIsFavorited(!!found);
        });
        return unsubscribe;
    }, [user?.uid, item.id]);

    const toggleFavorite = async () => {
        if (isFavorited) {
            setIsFavorited(false);
            await removeFromFavorites(user?.uid, item.id);
            setToastMessage("REMOVED FROM FAVORITES");
            setShowToast(true);
        } else {
            if (user && !isProUser && favoritesCount >= 5) {
                alert("Vault Limit Reached: Free members can save up to 5 components. Upgrade to Pro for unlimited storage in your vault!");
                navigate('/pricing');
                return;
            }
            setIsFavorited(true);
            await saveToFavorites(user?.uid, item);
            setToastMessage("SAVED TO FAVORITES ❤️");
            setShowToast(true);
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
        } else if (item.id === 'cloud-scroll') {
            assets.push(
                { url: '/models/dalithe_persistence_of_memory.glb', fileName: 'models/dalithe_persistence_of_memory.glb' },
                { url: '/models/wanderer_above_the_sea_of_fog.glb', fileName: 'models/wanderer_above_the_sea_of_fog.glb' },
                { url: '/models/window.glb', fileName: 'models/window.glb' },
                { url: '/soria-font.ttf', fileName: 'soria-font.ttf' }
            );
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
            className="flex flex-col gap-10 pb-24"
        >
            {/* ── Section: Overview & Header ── */}
            <div id="overview" className="flex flex-col space-y-4 pt-2">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    <Link to="/library" className="hover:text-white transition-colors">Components</Link>
                    <span>/</span>
                    <span className="text-brand-blue font-bold">{item.category}</span>
                    <span>/</span>
                    <span className="text-white font-bold">{item.title}</span>
                </div>

                {/* Main Title & Action Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight font-heading">
                            {item.title}
                        </h1>
                        <p className="text-neutral-400 text-sm font-medium leading-relaxed mt-2 max-w-2xl">
                            {item.description || "Production-ready UI component with interactive animations, customizable parameters, and full TypeScript support."}
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={toggleFavorite}
                            title={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
                            aria-label={isFavorited ? "Remove from Favorites" : "Save to Favorites"}
                            className={`p-2.5 rounded-lg border-2 border-white transition-all cursor-pointer select-none active:scale-90 ${
                                isFavorited
                                    ? 'bg-brand-red text-white brutal-shadow-black scale-105'
                                    : 'bg-brand-surface text-neutral-400 hover:text-white hover:border-brand-red brutal-shadow-black hover:translate-x-0.5 hover:translate-y-0.5'
                            }`}
                        >
                            <Heart
                                size={18}
                                className={`transition-all duration-200 ${isFavorited ? 'text-white fill-white scale-110' : 'text-neutral-400 hover:text-brand-red'}`}
                                fill={isFavorited ? "currentColor" : "none"}
                            />
                        </button>
                    </div>
                </div>

                {/* ── Action Toolbar: Tabs + Quick CLI snippet ── */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t-2 border-neutral-800">
                    <div className="flex items-center gap-2 p-1 bg-black border-2 border-white rounded-lg brutal-shadow-black">
                        <button
                            onClick={() => setTab('preview')}
                            className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                tab === 'preview'
                                    ? 'bg-white text-black font-black'
                                    : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            <Eye size={13} />
                            <span>Preview</span>
                        </button>
                        <button
                            onClick={() => setTab('code')}
                            className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                tab === 'code'
                                    ? 'bg-white text-black font-black'
                                    : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            <Code size={13} />
                            <span>Code</span>
                        </button>
                        <button
                            onClick={() => setTab('vibe')}
                            className={`px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                tab === 'vibe'
                                    ? 'bg-brand-yellow text-black font-black'
                                    : 'text-neutral-400 hover:text-white'
                            }`}
                        >
                            <Zap size={13} />
                            <span>Vibe Prompt</span>
                        </button>
                    </div>

                    <button
                        onClick={handleOpenFullscreen}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-white bg-brand-surface text-xs font-black uppercase tracking-wider text-neutral-300 hover:text-white hover:border-brand-yellow transition-all brutal-shadow-black cursor-pointer"
                        title="Open Preview in Full Screen Page"
                    >
                        <ExternalLink size={13} />
                        <span>Fullscreen</span>
                    </button>
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
                        {/* Meta Tags Row */}
                        <div className="flex flex-wrap items-center gap-6 px-2 mb-6">
                            <div className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-brand-blue border border-black flex items-center justify-center text-white font-bold text-[10px]">
                                    <Check size={10} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-brand-blue font-black">VERIFIED ASSET</p>
                                    <p className="text-xs font-bold text-neutral-400">UI Hub Curated</p>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-neutral-800" />

                            <div className="flex items-center gap-3">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1">BUILD STACK</p>
                                    <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 rounded border-2 border-white bg-brand-surface text-[10px] font-black uppercase text-white">React 18</span>
                                        <span className="px-2 py-0.5 rounded border-2 border-white bg-brand-surface text-[10px] font-black uppercase text-white">Tailwind CSS</span>
                                    </div>
                                </div>
                            </div>

                            <div className="w-px h-8 bg-neutral-800" />

                            <div className="flex flex-col">
                                <p className="text-[10px] uppercase tracking-widest font-black text-neutral-400 mb-1">CATEGORY</p>
                                <span className="text-xs font-black uppercase tracking-wider text-brand-yellow">{item.category}</span>
                            </div>
                        </div>

                        {item.imageUrl && (
                            <div className="mb-8">
                                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-4">Preview Image</h3>
                                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-white bg-brand-surface brutal-shadow-black">
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                        )}

                        {/* Interactive Demo Frame with Browser Mockup Chrome */}
                        <div
                            id="preview"
                            ref={previewRef}
                            className={`min-h-[380px] sm:min-h-[460px] md:min-h-[520px] w-full rounded-xl relative overflow-hidden flex flex-col bg-brand-surface border-2 border-white brutal-shadow-black ${isFullscreen ? 'fixed inset-0 z-[9999] rounded-none bg-black min-h-screen' : ''}`}
                        >
                            {/* Browser Mockup Top Bar */}
                            <div className="w-full px-4 py-2.5 bg-black border-b-2 border-white flex items-center justify-between z-40 shrink-0 select-none">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-red border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-yellow border border-black" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-brand-blue border border-black" />
                                    <span className="text-[9px] font-mono text-neutral-400 font-bold uppercase tracking-wider ml-2">PREVIEW // {item.id.toUpperCase()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setResetKey(prev => prev + 1)}
                                        className="p-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                        title="Replay Animation"
                                    >
                                        <RotateCcw size={13} className={resetKey > 0 ? 'animate-spin-once' : ''} />
                                    </button>
                                    <button
                                        onClick={handleOpenFullscreen}
                                        className="p-1 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                                        title="Open in Full Screen Page"
                                    >
                                        <ExternalLink size={13} />
                                    </button>
                                </div>
                            </div>

                            <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center justify-center overflow-hidden">
                                <PreviewErrorBoundary 
                                    key={`${item.id}-${resetKey}`} 
                                    componentId={item.id}
                                    onReset={() => setResetKey(k => k + 1)}
                                >
                                    <div className={`w-full h-full min-h-[380px] sm:min-h-[460px] md:min-h-[500px] flex items-center justify-center ${item.category === 'button' || item.category === 'text' || item.category === 'effect' || item.category === 'image-interaction' ? 'p-6 md:p-12' : ''}`}>
                                        <React.Suspense fallback={
                                            <div className="flex flex-col items-center justify-center p-12 text-neutral-400">
                                                <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
                                                <p className="text-[10px] uppercase tracking-widest font-black">INITIALIZING PREVIEW...</p>
                                            </div>
                                        }>
                                            {item.preview({ showDemoButton: true })}
                                        </React.Suspense>
                                    </div>
                                </PreviewErrorBoundary>
                            </div>
                        </div>

                        {/* Props Table */}
                        {componentConfig.props.length > 0 && (
                            <section id="props" className="space-y-4">
                                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white px-2">Props</h3>
                                <div className="rounded-lg border-2 border-white bg-brand-surface brutal-shadow-black p-4">
                                    <PropsTable props={componentConfig.props} />
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
                        className="space-y-12"
                    >
                        {/* Install Section */}
                        <section id="installation">
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">Install</h3>
                            <div className="inline-flex p-1 rounded-lg border-2 border-white bg-brand-surface mb-6 brutal-shadow-black">
                                <button
                                    onClick={() => setInstallMethod('cli')}
                                    className={`px-6 py-2 rounded text-xs font-black uppercase tracking-wider transition-all ${
                                        installMethod === 'cli'
                                            ? 'bg-brand-blue text-white border-2 border-black'
                                            : 'text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    CLI
                                </button>
                                <button
                                    onClick={() => setInstallMethod('manual')}
                                    className={`px-6 py-2 rounded text-xs font-black uppercase tracking-wider transition-all ${
                                        installMethod === 'manual'
                                            ? 'bg-brand-blue text-white border-2 border-black'
                                            : 'text-neutral-400 hover:text-white'
                                    }`}
                                >
                                    Manual
                                </button>
                            </div>

                            <div className="rounded-lg overflow-hidden border-2 border-white bg-brand-surface brutal-shadow-black">
                                <AnimatePresence mode="wait">
                                    {installMethod === 'manual' && (
                                        <motion.div
                                            key="manual-tabs"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="flex border-b-2 border-white bg-black"
                                        >
                                            {(['npm', 'pnpm', 'yarn', 'bun'] as const).map(m => (
                                                <button
                                                    key={m}
                                                    onClick={() => setPkgManager(m)}
                                                    className={`px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors ${
                                                        pkgManager === m
                                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-neutral-900'
                                                            : 'text-neutral-400 hover:text-white'
                                                    }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="p-6 flex items-center justify-between bg-brand-surface">
                                    <code className="text-white font-mono text-sm font-bold">{installCommand}</code>
                                    <button
                                        onClick={() => handleCopy(installCommand, 'install')}
                                        className="brutal-btn-primary px-3 py-1.5 text-xs font-black tracking-wider flex items-center gap-1.5"
                                    >
                                        {copied === 'install' ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                        <span>{copied === 'install' ? 'COPIED' : 'COPY'}</span>
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Usage Section */}
                        <section id="usage">
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-4">
                                Usage <span className="text-xs font-mono lowercase text-neutral-400 font-normal ml-2">(with your settings)</span>
                            </h3>
                            <div className="rounded-lg overflow-hidden border-2 border-white bg-brand-surface brutal-shadow-black relative">
                                <button
                                    onClick={() => handleCopy(usageCode, 'usage')}
                                    className="brutal-btn-primary absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-black tracking-wider flex items-center gap-1.5"
                                >
                                    {copied === 'usage' ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                    <span>{copied === 'usage' ? 'COPIED' : 'COPY'}</span>
                                </button>
                                <div className="p-6 md:p-8 bg-brand-surface leading-relaxed overflow-auto custom-scrollbar">
                                    <pre className="font-sans text-xs md:text-sm"><CodeHighlighter code={usageCode} /></pre>
                                </div>
                            </div>
                        </section>

                        {/* Code Section */}
                        <section>
                            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-6">Code</h3>
                            <div className="flex flex-wrap gap-4 mb-6">
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

                            <div className="rounded-lg overflow-hidden border-2 border-white bg-brand-surface brutal-shadow-black relative min-h-[400px]">
                                {item.isPremium && !isProUser ? (
                                    <PremiumGate message="This premium component requires a Pro subscription to view and copy the source code." />
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleCopy(fetchedSource || getComponentCode(item.id, { lang, styling }), 'source')}
                                            className="brutal-btn-primary absolute top-4 right-4 z-10 px-3 py-1.5 text-xs font-black tracking-wider flex items-center gap-1.5"
                                        >
                                            {copied === 'source' ? <Check size={14} strokeWidth={3} /> : <Copy size={14} />}
                                            <span>{copied === 'source' ? 'COPIED' : 'COPY'}</span>
                                        </button>
                                        <div className="p-6 md:p-8 text-xs leading-relaxed max-h-[600px] overflow-auto custom-scrollbar bg-brand-surface">
                                            {isLoadingSource ? (
                                                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                                                    <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent rounded-full animate-spin mb-3" />
                                                    <p className="text-[10px] uppercase tracking-widest font-black">DECRYPTING SOURCE...</p>
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
