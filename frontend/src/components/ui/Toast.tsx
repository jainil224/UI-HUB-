import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, Zap } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

const Toast = ({ message, isVisible, onClose, duration = 3000 }: ToastProps) => {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed bottom-8 right-8 z-[9999] pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, x: 50, scale: 0.9, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 20, scale: 0.9, filter: 'blur(8px)' }}
                        transition={{ 
                            type: 'spring', 
                            stiffness: 400, 
                            damping: 30
                        }}
                        className="relative group pointer-events-auto"
                    >
                        {/* Subtle Minimal Glow */}
                        <div className="absolute -inset-1 bg-white/5 blur-lg rounded-xl opacity-40" />
                        
                        <div className="relative flex items-center gap-3 px-4 py-2.5 bg-[#0D0D0D] backdrop-blur-3xl border border-white/10 rounded-xl shadow-2xl">
                            <div className="w-5 h-5 rounded-md bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                <Check size={10} className="text-white/80" />
                            </div>
                            
                            <span className="text-[10px] font-bold text-white/90 uppercase tracking-[0.1em]">
                                {message}
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
