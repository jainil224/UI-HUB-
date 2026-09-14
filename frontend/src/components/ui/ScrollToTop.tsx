import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ScrollToTop: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const { theme } = useTheme();

    const frameRef = useRef<number>(0);
    const progressRef = useRef(0);

    const size = 46;
    const strokeWidth = 3;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;

    const handleScroll = useCallback(() => {
        if (frameRef.current) return;

        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = 0;

            const scrollY = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            const docHeight = document.documentElement.scrollHeight;
            const totalHeight = docHeight - windowHeight;

            setIsVisible(scrollY > 100);
            setIsAtBottom(totalHeight > 0 && scrollY >= totalHeight - 10);

            const scrollPercentage = totalHeight > 0
                ? Math.min(100, Math.max(0, (scrollY / totalHeight) * 100))
                : 0;

            progressRef.current = scrollPercentage;
            setProgress(scrollPercentage);
        });
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll, { passive: true });
        handleScroll();
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const primaryColor = theme === 'dark' ? '#00FF88' : '#3B82F6';
    const textColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)';
    const surfaceColor = theme === 'dark' ? 'rgba(20, 20, 20, 0.85)' : 'rgba(255, 255, 255, 0.9)';
    const trackColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)';

    const dashOffset = circumference * (1 - progress / 100);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    role="button"
                    aria-label="Back to top"
                    initial={{ opacity: 0, y: 16, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 16, scale: 0.8 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    className="fixed bottom-6 right-6 z-[9999] cursor-pointer select-none"
                    style={{ transformOrigin: 'bottom right' }}
                    onClick={scrollToTop}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onFocus={() => setIsHovered(true)}
                    onBlur={() => setIsHovered(false)}
                >
                    <span className="relative flex items-center gap-0 overflow-visible">
                        {/* Tooltip Label */}
                        <AnimatePresence mode="wait">
                            {isHovered && (
                                <motion.span
                                    key="tooltip"
                                    initial={{ opacity: 0, x: 8, scale: 0.9 }}
                                    animate={{ opacity: 1, x: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: 8, scale: 0.9 }}
                                    transition={{ duration: 0.15 }}
                                    className="mr-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest shadow-lg backdrop-blur"
                                    style={{
                                        color: textColor,
                                        backgroundColor: surfaceColor,
                                        border: `1px solid ${trackColor}`,
                                    }}
                                >
                                    Top
                                </motion.span>
                            )}
                        </AnimatePresence>

                        {/** Circular Progress Button */}
                        <span
                            className="relative flex items-center justify-center rounded-full"
                            style={{
                                width: size,
                                height: size,
                                backgroundColor: surfaceColor,
                                backdropFilter: 'blur(8px)',
                                border: `1px solid ${trackColor}`,
                                boxShadow: `0 8px 24px -6px rgba(0, 0, 0, ${theme === 'dark' ? 0.6 : 0.2})`,
                            }}
                        >
                            <svg
                                width={size}
                                height={size}
                                className="absolute inset-0 -rotate-90"
                                aria-hidden="true"
                            >
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={trackColor}
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                />
                                <circle
                                    cx={size / 2}
                                    cy={size / 2}
                                    r={radius}
                                    stroke={primaryColor}
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={dashOffset}
                                    style={{
                                        filter: `drop-shadow(0 0 ${isAtBottom ? 6 : 3}px ${primaryColor})`,
                                        transition: 'filter 0.3s ease',
                                    }}
                                />
                            </svg>

                            {/* Center Content */}
                            <span className="absolute inset-0 flex items-center justify-center">
                                <AnimatePresence mode="wait">
                                    {isHovered ? (
                                        <motion.span
                                            key="arrow"
                                            initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                            exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
                                            style={{ color: primaryColor }}
                                        >
                                            <ArrowUp size={18} strokeWidth={3} />
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="percent"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="text-[9px] font-bold tabular-nums tracking-tight"
                                            style={{ color: textColor }}
                                        >
                                            {Math.round(progress)}%
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </span>

                            {/* Hover Halo */}
                            <span
                                className={`absolute -inset-1 rounded-full transition-all duration-300 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}`}
                                style={{
                                    background:
                                        theme === 'dark'
                                            ? `radial-gradient(circle, ${primaryColor}22, transparent 70%)`
                                            : `radial-gradient(circle, ${primaryColor}18, transparent 70%)`,
                                }}
                            />
                        </span>
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
};

export default ScrollToTop;