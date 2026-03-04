import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, X } from 'lucide-react';
import Logo from './Logo';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isLibrary = location.pathname.startsWith('/library');

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-brand-black/80 backdrop-blur-md border-b border-white/5">
            <Link to="/" className="flex items-center gap-2">
                <Logo />
                <span className="font-heading font-bold text-xl tracking-tighter">UI HUB</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                <Link to="/" className={`transition-colors hover:text-brand-green ${!isLibrary ? 'text-white' : 'text-white/60'}`}>Home</Link>
                <Link to="/library" className={`transition-colors hover:text-brand-green ${isLibrary ? 'text-white' : 'text-white/60'}`}>Component Library</Link>
            </div>

            <div className="flex items-center gap-4">
                <button className="hidden sm:block p-2 hover:bg-white/5 rounded-full transition-colors">
                    <Github size={20} />
                </button>
                <button className="hidden sm:block bg-brand-green text-black px-4 py-1.5 rounded-full text-sm font-bold hover:bg-white hover:text-black transition-all">
                    Get Started
                </button>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-white hover:text-brand-green transition-colors"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute top-full left-0 right-0 bg-brand-black border-b border-white/10 p-6 flex flex-col gap-6 md:hidden z-40"
                    >
                        <div className="flex flex-col gap-4 text-lg font-medium text-white/60">
                            <Link to="/" onClick={() => setIsOpen(false)} className="hover:text-brand-green transition-colors">Home</Link>
                            <Link to="/library" onClick={() => setIsOpen(false)} className="hover:text-brand-green transition-colors">Component Library</Link>
                        </div>
                        <div className="flex flex-col gap-4 pt-4 border-t border-white/5">
                            <button className="flex items-center gap-2 text-white/60">
                                <Github size={20} /> GitHub
                            </button>
                            <button className="bg-brand-green text-black px-4 py-3 rounded-xl text-center font-bold">
                                Get Started
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
