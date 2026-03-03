import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const DockText = () => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-6xl md:text-8xl font-display font-bold text-brand-green tracking-tighter"
    >
        DOCK TEXT
    </motion.div>
);

export const FadeText = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="text-6xl md:text-8xl font-display font-bold text-white tracking-tighter"
    >
        FADE TEXT
    </motion.div>
);

export const FontWeightText = () => {
    const [weight, setWeight] = useState(400);

    useEffect(() => {
        const interval = setInterval(() => {
            setWeight(prev => (prev === 400 ? 900 : 400));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            animate={{ fontWeight: weight }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="text-6xl md:text-8xl font-display text-white tracking-tighter"
            style={{ fontWeight: weight }}
        >
            VARIABLE WEIGHT
        </motion.div>
    );
};

export const BlurText = ({ text = "BLUR IN TEXT" }) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
        >
            {text}
        </motion.div>
    );
};

export const GradualSpacingText = ({ text = "GRADUAL SPACING" }) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className="text-6xl md:text-8xl font-display text-white tracking-tighter"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export const LetterPullUpText = ({ text = "LETTER PULL UP" }) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export const MultiDirectionSlideText = ({ text = "MULTI DIRECTION" }) => {
    const directions = ["top", "bottom", "left", "right"];
    return (
        <div className="flex justify-center flex-wrap overflow-hidden">
            {text.split("").map((char, i) => {
                const direction = directions[i % 4];
                const initial = {
                    opacity: 0,
                    x: direction === "left" ? -100 : direction === "right" ? 100 : 0,
                    y: direction === "top" ? -100 : direction === "bottom" ? 100 : 0,
                };
                return (
                    <motion.span
                        key={i}
                        initial={initial}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                        className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                );
            })}
        </div>
    );
};

export const ScaleLetterText = ({ text = "SCALE LETTER" }) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export const SeparateAwayText = ({ text = "SEPARATE AWAY" }) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i, arr) => {
                const mid = arr.length / 2;
                const offset = (i - mid) * 20;
                return (
                    <motion.span
                        key={i}
                        initial={{ x: offset, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                        className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                    >
                        {char === " " ? "\u00A0" : char}
                    </motion.span>
                );
            })}
        </div>
    );
};

export const WavyText = ({ text = "WAVY TEXT" }) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    animate={{ y: [0, -20, 0] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.1
                    }}
                    className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export const WordPullUpText = ({ text = "WORD PULL UP" }) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className="text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

interface SplitTextProps {
    text: string;
    className?: string;
    delay?: number;
    duration?: number;
    ease?: string;
    onLetterAnimationComplete?: () => void;
}

export const SplitText: React.FC<SplitTextProps> = ({
    text,
    className = '',
    delay = 50,
    duration = 0.8,
    ease = 'power3.out',
    onLetterAnimationComplete
}) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const chars = containerRef.current.querySelectorAll('.char');

        gsap.from(chars, {
            y: 40,
            opacity: 0,
            duration: duration,
            stagger: 0.1,
            delay: delay / 1000,
            ease: ease,
            onComplete: onLetterAnimationComplete,
            scrollTrigger: {
                trigger: containerRef.current,
                start: 'top 85%',
            }
        });
    }, []);

    return (
        <div ref={containerRef} className={className}>
            {text.split('').map((char, i) => (
                <span key={i} className="char inline-block">
                    {char === ' ' ? '\u00A0' : char}
                </span>
            ))}
        </div>
    );
};
