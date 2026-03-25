import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Sparkles, Heart, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthRequiredModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

const AuthRequiredModal = ({
    isOpen,
    onClose,
    title = "Authentication Required",
    description = "Please sign in to your UI Hub account to save this component to your personal vault and access premium features."
}: AuthRequiredModalProps) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        <div className="glass rounded-[2.5rem] border border-white/10 bg-[#080808]/90 backdrop-blur-2xl shadow-[0_40px_100px_rgba(0,0,0,0.7)] p-8">
                            {/* Decorative elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green/10 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 blur-[50px] rounded-full translate-y-1/2 -translate-x-1/2" />

                            {/* Header */}
                            <div className="relative z-10 flex justify-between items-start mb-8">
                                <div className="p-3 rounded-2xl bg-brand-green/10 border border-brand-green/20">
                                    <Shield className="text-brand-green" size={24} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative z-10 text-center sm:text-left">
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/5 border border-brand-green/10 text-brand-green text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                                >
                                    <Sparkles size={12} />
                                    <span>Vault Security Protocol</span>
                                </motion.div>

                                <h2 className="text-3xl font-display font-black text-white mb-4 tracking-tight leading-tight uppercase">
                                    {title}
                                </h2>
                                <p className="text-white/40 font-medium text-sm leading-relaxed mb-8">
                                    {description}
                                </p>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/login')}
                                        className="flex items-center justify-center gap-2 bg-brand-green text-black font-black py-4 rounded-2xl text-xs uppercase tracking-widest hover:shadow-[0_0_30px_rgba(0,255,0,0.3)] transition-all"
                                    >
                                        <LogIn size={18} />
                                        Login
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/signup')}
                                        className="flex items-center justify-center gap-2 bg-transparent border border-white/10 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
                                    >
                                        <UserPlus size={18} />
                                        Sign Up
                                    </motion.button>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="relative z-10 mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/20">
                                <Heart size={12} className="text-red-500/50" />
                                <span>Curate your workspace</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthRequiredModal;
