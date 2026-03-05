import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface DockTextProps {
    text?: string;
    className?: string;
}

export const DockText = ({ text = "DOCK TEXT", className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter" }: DockTextProps) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FadeTextProps {
    text?: string;
    className?: string;
    duration?: number;
}

export const FadeText = ({
    text = "FADE TEXT",
    className = "text-6xl md:text-8xl font-display font-bold text-white tracking-tighter",
    duration = 1.5
}: FadeTextProps) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration }}
        className={className}
    >
        {text}
    </motion.div>
);

export interface FontWeightTextProps {
    text?: string;
    className?: string;
}

export const FontWeightText = ({
    text = "VARIABLE WEIGHT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: FontWeightTextProps) => {
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
            className={className}
            style={{ fontWeight: weight }}
        >
            {text}
        </motion.div>
    );
};

export interface BlurTextProps {
    text?: string;
    className?: string;
}

export const BlurText = ({
    text = "BLUR IN TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter text-center"
}: BlurTextProps) => {
    return (
        <motion.div
            initial={{ filter: "blur(10px)", opacity: 0 }}
            whileInView={{ filter: "blur(0px)", opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={className}
        >
            {text}
        </motion.div>
    );
};

export interface GradualSpacingTextProps {
    text?: string;
    className?: string;
}

export const GradualSpacingText = ({
    text = "GRADUAL SPACING",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter"
}: GradualSpacingTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ letterSpacing: "1em", opacity: 0 }}
                    animate={{ letterSpacing: "0.1em", opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface LetterPullUpTextProps {
    text?: string;
    className?: string;
}

export const LetterPullUpText = ({
    text = "LETTER PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: LetterPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface MultiDirectionSlideTextProps {
    text?: string;
    className?: string;
}

export const MultiDirectionSlideText = ({
    text = "MULTI DIRECTION",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: MultiDirectionSlideTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, x: -50, y: i % 2 === 0 ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface ScaleLetterTextProps {
    text?: string;
    className?: string;
}

export const ScaleLetterText = ({
    text = "SCALE LETTER",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: ScaleLetterTextProps) => {
    return (
        <div className="flex justify-center flex-wrap">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1], delay: i * 0.05 }}
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface SeparateAwayTextProps {
    text?: string;
    className?: string;
}

export const SeparateAwayText = ({
    text = "SEPARATE AWAY",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: SeparateAwayTextProps) => {
    return (
        <div className="flex justify-center flex-wrap px-4">
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.08 }}
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WavyTextProps {
    text?: string;
    className?: string;
}

export const WavyText = ({
    text = "WAVY TEXT",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WavyTextProps) => {
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
                    className={className}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </div>
    );
};

export interface WordPullUpTextProps {
    text?: string;
    className?: string;
}

export const WordPullUpText = ({
    text = "WORD PULL UP",
    className = "text-6xl md:text-8xl font-display text-white tracking-tighter inline-block"
}: WordPullUpTextProps) => {
    return (
        <div className="flex justify-center flex-wrap overflow-hidden py-4 gap-x-6">
            {text.split(" ").map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.2 }}
                    className={className}
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
