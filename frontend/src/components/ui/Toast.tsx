import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

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
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{
                            type: 'spring',
                            stiffness: 500,
                            damping: 30
                        }}
                        className="relative pointer-events-auto"
                    >
                        <div className="relative flex items-center gap-3 pl-2.5 pr-5 py-2.5 bg-brand-surface border-2 border-white rounded-lg brutal-shadow-blue">
                            <div className="w-6 h-6 rounded-md bg-brand-yellow border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] shrink-0">
                                <Check size={12} strokeWidth={4} className="text-black" />
                            </div>

                            <span className="text-[11px] font-black text-white uppercase tracking-widest font-heading whitespace-nowrap">
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
