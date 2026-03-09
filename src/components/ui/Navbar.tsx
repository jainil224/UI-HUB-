import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { Github, Menu, X, Sparkles } from 'lucide-react';
import Logo from './Logo';
import GitHubStarButton from './GitHubStarButton';

const MagneticButton = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        const center = { x: left + width / 2, y: top + height / 2 };
        const distance = { x: clientX - center.x, y: clientY - center.y };

        // Only pull if mouse is close enough
        const pullFactor = 0.4;
        x.set(distance.x * pullFactor);
        y.set(distance.y * pullFactor);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ x: mouseX, y: mouseY }}
            className={`relative overflow-hidden flex items-center gap-1.5 bg-brand-green text-black px-5 py-2 rounded-full text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition-shadow duration-300 hover:shadow-[0_0_30px_rgba(0,255,0,0.4)] active:scale-95 ${className}`}
        >
            {/* Holographic Shimmer Layer */}
            <motion.div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 pointer-events-none"
                initial={false}
                whileHover={{ opacity: 1 }}
            >
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12"
                    animate={{
                        x: ['-200%', '200%'],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
                {/* Iridescent Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/20 via-purple-400/20 via-pink-400/20 to-transparent mix-blend-overlay opacity-50" />
            </motion.div>

            {children}

            {/* Standard Shine (keeping existing logic for extra flair) */}
            <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent -skew-x-12 pointer-events-none"
                initial={{ x: '-150%' }}
                whileHover={{ x: '150%' }}
                transition={{ duration: 0.55, ease: 'easeInOut' }}
            />
        </motion.button>
    );
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const isLibrary = location.pathname.startsWith('/library');

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-3 pb-0">
            {/* Floating pill navbar */}
            <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-[0_4px_40px_rgba(0,0,0,0.5)]">

                {/* ── Logo ── */}
                <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                    <div className="relative">
                        <div className="absolute inset-0 bg-brand-green/40 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <Logo />
                    </div>
                    <span className="font-heading font-black text-lg tracking-tight text-white group-hover:text-brand-green transition-colors duration-300">
                        UI HUB
                    </span>
                </Link>

                {/* ── Desktop nav links (pill switcher) ── */}
                <div className="hidden md:flex items-center gap-0.5 bg-white/[0.05] border border-white/10 rounded-full px-1.5 py-1">
                    {[
                        { to: '/', label: 'Home', active: !isLibrary },
                        { to: '/library', label: 'Component Library', active: isLibrary },
                    ].map(({ to, label, active }) => (
                        <Link
                            key={to}
                            to={to}
                            className={`relative px-4 py-1.5 rounded-full text-sm font-semibold transition-colors duration-200 ${active ? 'text-black' : 'text-white/50 hover:text-white'}`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="nav-active-pill"
                                    className="absolute inset-0 rounded-full bg-brand-green shadow-[0_0_18px_rgba(0,255,0,0.5)]"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10" style={{ display: 'inline-block' }}>{label}</span>
                        </Link>
                    ))}
                </div>

                {/* ── Right Actions ── */}
                <div className="flex items-center gap-2.5">
                    {/* GitHub */}
                    <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hidden sm:flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:border-brand-green/40 hover:shadow-[0_0_12px_rgba(0,255,0,0.2)] transition-all duration-300 group"
                    >
                        <Github size={16} className="text-white/50 group-hover:text-white transition-colors" />
                    </a>

                    <GitHubStarButton className="hidden md:flex" />

                    {/* Get Started */}
                    <MagneticButton className="hidden sm:flex group">
                        <Sparkles size={12} className="shrink-0 relative z-10" />
                        <span className="relative z-10">Get Started</span>
                    </MagneticButton>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.06] border border-white/10 text-white hover:bg-white/10 transition-colors"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {isOpen
                                ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.span>
                                : <motion.span key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><Menu size={18} /></motion.span>
                            }
                        </AnimatePresence>
                    </button>
                </div>
            </div>

            {/* ── Mobile Dropdown ── */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="mt-2 max-w-7xl mx-auto rounded-2xl bg-[#080808]/95 backdrop-blur-xl border border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
                    >
                        <div className="flex flex-col gap-1.5">
                            {[
                                { to: '/', label: 'Home', active: !isLibrary },
                                { to: '/library', label: 'Component Library', active: isLibrary },
                            ].map(({ to, label, active }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    onClick={() => setIsOpen(false)}
                                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all ${active
                                        ? 'bg-brand-green/10 text-brand-green border border-brand-green/25 shadow-[0_0_12px_rgba(0,255,0,0.1)]'
                                        : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                                        }`}
                                >
                                    {label}
                                </Link>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-white/[0.07]">
                            <GitHubStarButton className="flex-1 justify-center" />
                            <a
                                href="https://github.com/jainil224/UI-HUB-"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 text-white/55 text-sm font-medium flex-1"
                            >
                                <Github size={15} /> GitHub
                            </a>
                            <button className="flex items-center justify-center gap-1.5 bg-brand-green text-black px-4 py-2.5 rounded-xl text-sm font-bold flex-1">
                                <Sparkles size={13} /> Get Started
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
