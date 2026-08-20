import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, LogIn, UserPlus, Sparkles, Shield } from 'lucide-react';
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
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 15 }}
                        className="relative w-full max-w-md overflow-hidden"
                    >
                        <div className="rounded-lg border-2 border-white bg-brand-surface brutal-shadow-black p-7 md:p-8 relative">
                            {/* Header */}
                            <div className="relative z-10 flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-lg bg-brand-yellow border-2 border-black flex items-center justify-center shadow-[3px_3px_0px_0px_#000000]">
                                    <Shield className="text-black" size={22} />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-1.5 rounded border border-neutral-700 hover:border-white text-neutral-400 hover:text-white transition-colors bg-brand-bg"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-neutral-700 bg-brand-bg text-neutral-300 text-[10px] font-black uppercase tracking-widest mb-3">
                                    <span className="w-2 h-2 rounded-full bg-brand-blue" />
                                    <span>VAULT SECURITY</span>
                                </div>

                                <h2 className="text-2xl font-black text-white mb-2 tracking-tight leading-tight uppercase font-heading">
                                    {title}
                                </h2>
                                <p className="text-neutral-400 font-medium text-xs leading-relaxed mb-6 font-sans">
                                    {description}
                                </p>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/login');
                                        }}
                                        className="brutal-btn-primary py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <LogIn size={15} />
                                        <span>Log In</span>
                                    </button>
                                    <button
                                        onClick={() => {
                                            onClose();
                                            navigate('/signup');
                                        }}
                                        className="brutal-btn-outline py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2"
                                    >
                                        <UserPlus size={15} />
                                        <span>Sign Up</span>
                                    </button>
                                </div>
                            </div>

                            {/* Footer Note */}
                            <div className="relative z-10 mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500">
                                <span>UI-HUB NETWORK</span>
                                <span>100% FREE ACCESS</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AuthRequiredModal;
