import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Loader2, X } from 'lucide-react';

interface CheckoutOverlayProps {
    isOpen: boolean;
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    onClose?: () => void;
}

const CheckoutOverlay: React.FC<CheckoutOverlayProps> = ({ isOpen, status, message, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 20, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.4, duration: 0.6 }}
                        className="relative w-full max-w-sm glass rounded-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        {/* Glow Behind */}
                        <div className={`absolute inset-0 opacity-20 blur-3xl rounded-full transition-colors duration-500 pointer-events-none ${
                            status === 'success' ? 'bg-brand-green' : status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                        }`} />

                        {status === 'error' && onClose && (
                            <button 
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={20} className="text-white/50 hover:text-white" />
                            </button>
                        )}

                        <div className="relative z-10 flex flex-col items-center text-center">
                            {status === 'loading' && (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                        className="mb-6"
                                    >
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
                                            <Loader2 size={64} className="text-blue-400 relative z-10" />
                                        </div>
                                    </motion.div>
                                    <h3 className="text-2xl font-display font-black text-white mb-2 tracking-tight">Initializing Checkout</h3>
                                    <p className="text-white/50 text-sm">{message || 'Please wait while we secure your connection.'}</p>
                                </>
                            )}

                            {status === 'success' && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', bounce: 0.5, duration: 0.6 }}
                                        className="mb-6 relative"
                                    >
                                        <div className="absolute inset-0 bg-brand-green/30 blur-2xl rounded-full" />
                                        <CheckCircle2 size={72} className="text-brand-green relative z-10 drop-shadow-[0_0_15px_rgba(0,255,0,0.5)]" />
                                    </motion.div>
                                    <h3 className="text-3xl font-display font-black bg-gradient-to-r from-[#00FF1A] to-[#008A0E] bg-clip-text text-transparent mb-2">Payment Successful!</h3>
                                    <p className="text-white/70 text-sm mb-6">{message || 'You now have premium access.'}</p>
                                    
                                    <button 
                                        onClick={onClose}
                                        className="w-full py-3 rounded-full bg-brand-green text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform"
                                    >
                                        Start Exploring
                                    </button>
                                </>
                            )}

                            {status === 'error' && (
                                <>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="mb-6 relative"
                                    >
                                        <div className="absolute inset-0 bg-red-500/30 blur-2xl rounded-full" />
                                        <X size={72} className="text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(255,0,0,0.5)]" />
                                    </motion.div>
                                    <h3 className="text-2xl font-display font-black text-red-400 mb-2">Payment Failed</h3>
                                    <p className="text-white/50 text-sm mb-6">{message || 'Something went wrong. Please try again.'}</p>
                                    
                                    <button 
                                        onClick={onClose}
                                        className="w-full py-3 rounded-full bg-white/10 text-white font-black uppercase text-xs tracking-widest hover:bg-white/20 transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default CheckoutOverlay;
