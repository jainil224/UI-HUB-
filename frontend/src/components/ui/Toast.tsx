import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check } from 'lucide-react';

interface ToastProps {
    message: string;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
    image?: string;
    imageAlt?: string;
    logo?: React.ReactNode;
    position?: 'bottom-center' | 'bottom-right';
}

const Toast = ({ 
    message, 
    isVisible, 
    onClose, 
    duration = 3000, 
    image, 
    imageAlt, 
    logo,
    position = 'bottom-right'
}: ToastProps) => {
    React.useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose, duration]);

    const hasRichContent = Boolean(image || logo);
    const isCenter = position === 'bottom-center';

    return (
        <AnimatePresence>
            {isVisible && (
                <div 
                    className={
                        isCenter 
                            ? "fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none flex justify-center items-center w-auto max-w-[92vw]"
                            : "fixed bottom-6 inset-x-4 sm:inset-x-auto sm:right-8 z-[9999] pointer-events-none flex sm:justify-end justify-center"
                    }
                >
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
                        {hasRichContent ? (
                            <div className="relative flex items-center gap-3 pr-5 py-2 pl-2.5 bg-brand-surface border-2 border-white rounded-lg brutal-shadow-blue max-w-full sm:max-w-sm">
                                {image && (
                                    <img
                                        src={image}
                                        alt={imageAlt || 'preview'}
                                        className="w-11 h-11 rounded-md border-2 border-black object-cover shrink-0"
                                    />
                                )}
                                <div className="flex flex-col gap-1 min-w-0">
                                    {logo && <div className="flex items-center">{logo}</div>}
                                    <span className="text-[11px] font-black text-white uppercase tracking-widest font-heading break-words min-w-0">
                                        {message}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-3 pl-2.5 pr-5 py-2.5 bg-brand-surface border-2 border-white rounded-lg brutal-shadow-blue max-w-full sm:max-w-sm">
                                <div className="w-6 h-6 rounded-md bg-brand-yellow border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000000] shrink-0">
                                    <Check size={12} strokeWidth={4} className="text-black" />
                                </div>

                                <span className="text-[11px] font-black text-white uppercase tracking-widest font-heading break-words min-w-0">
                                    {message}
                                </span>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
