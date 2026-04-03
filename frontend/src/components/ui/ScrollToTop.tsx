import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();

    // Configuration - Smaller & Thinner for Minimalism
    const size = 44;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    
    const handleScroll = useCallback(() => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const totalHeight = scrollHeight - clientHeight;
        
        // Appear sooner (100px) for better UX
        setIsVisible(scrollY > 100);
        
        if (totalHeight > 0) {
            const scrollPercentage = Math.min(100, (scrollY / totalHeight) * 100);
            setProgress(scrollPercentage);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const primaryColor = theme === 'dark' ? '#00FF88' : '#3B82F6';
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)';

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.9 }}
                    className="fixed bottom-6 right-6 z-[9999] cursor-pointer"
                    onClick={scrollToTop}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="relative flex items-center justify-center group overflow-visible">
                        {/* Minimal Ring Container */}
                        <svg width={size} height={size} className="transform -rotate-90">
                            {/* Static Track (Very subtle) */}
                            <circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke="currentColor"
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                className={theme === 'dark' ? 'text-white/5' : 'text-black/5'}
                            />
                            {/* Live Progress Path */}
                            <motion.circle
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                stroke={primaryColor}
                                strokeWidth={strokeWidth}
                                fill="transparent"
                                strokeLinecap="round"
                                animate={{ pathLength: progress / 100 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                                className="drop-shadow-[0_0_4px_rgba(0,255,136,0.2)]"
                            />
                        </svg>

                        {/* Centered Content */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {isHovered ? (
                                    <motion.div
                                        key="arrow"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                    >
                                        <ArrowUp size={16} strokeWidth={3} className={theme === 'dark' ? 'text-[#00FF88]' : 'text-[#3B82F6]'} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="percent"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[9px] font-bold tracking-tight"
                                        style={{ color: textColor }}
                                    >
                                        {Math.round(progress)}%
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Hover Background Halo (Minimal) */}
                        <div 
                            className={`absolute -inset-1 rounded-full transition-all duration-300 ${isHovered ? 'bg-white/5 scale-110 opacity-100' : 'bg-transparent scale-100 opacity-0'}`}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;
