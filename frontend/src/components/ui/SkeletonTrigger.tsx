import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { useSkeleton } from '../../context/SkeletonContext';
import { useTheme } from '../../context/ThemeContext';

export const SkeletonTrigger: React.FC = () => {
    const { isLoading, triggerLoading } = useSkeleton();
    const { theme } = useTheme();

    return (
        <AnimatePresence>
            <motion.button
                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => !isLoading && triggerLoading(1800)}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full backdrop-blur-xl border shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 pointer-events-auto ${
                    isLoading 
                        ? 'cursor-not-allowed border-brand-green/20 bg-brand-green/5 text-brand-green/60 shadow-[0_0_20px_rgba(0,255,0,0.1)]'
                        : theme === 'dark'
                        ? 'cursor-pointer border-white/10 bg-white/[0.03] text-white hover:border-brand-green/30 hover:bg-brand-green/5 hover:text-brand-green hover:shadow-[0_0_25px_rgba(0,255,0,0.25)]'
                        : 'cursor-pointer border-black/10 bg-black/[0.03] text-black hover:border-[#5FA3D6]/30 hover:bg-[#5FA3D6]/5 hover:text-[#5FA3D6] hover:shadow-[0_0_25px_rgba(95,163,214,0.25)]'
                }`}
                title="Trigger Skeleton Loading Demo"
            >
                {/* Micro-dot status */}
                <span className={`relative flex h-2 w-2`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isLoading ? 'bg-brand-green' : theme === 'dark' ? 'bg-brand-green/50' : 'bg-[#5FA3D6]/50'
                    }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        isLoading ? 'bg-brand-green shadow-[0_0_8px_#00FF00]' : theme === 'dark' ? 'bg-brand-green' : 'bg-[#5FA3D6]'
                    }`} />
                </span>

                <motion.div
                    animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                    transition={isLoading ? { duration: 1.5, repeat: Infinity, ease: "linear" } : { duration: 0.5 }}
                >
                    <RefreshCw size={14} className="shrink-0" />
                </motion.div>

                <span className="text-[10px] font-black uppercase tracking-wider select-none">
                    {isLoading ? "Loading System..." : "Demo Loader"}
                </span>

                {/* Shimmer Sweep overlay when ready */}
                {!isLoading && (
                    <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 3, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                    />
                )}
            </motion.button>
        </AnimatePresence>
    );
};

export default SkeletonTrigger;
