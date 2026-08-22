"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useAnimate, type AnimationOptions } from "framer-motion";
import { cn } from "../../lib/utils";

export interface RandomLetterSwapProps {
    label?: string;
    mode?: "forward" | "pingpong";
    reverse?: boolean;
    staggerDuration?: number;
    /** Per-letter swap transition (framer-motion AnimationOptions) */
    ease?: AnimationOptions;
    /** Font control value — a CSS-ready typeface object or custom font config */
    font?: Record<string, any>;
    color?: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

const COMPONENT_DEFAULTS: Required<Omit<RandomLetterSwapProps, "onClick" | "className" | "style">> = {
    label: "LETTER SWAP",
    mode: "pingpong",
    reverse: false,
    staggerDuration: 0.08,
    font: {
        fontFamily: "Inter, sans-serif",
        fontWeight: 800,
        fontSize: "clamp(2rem, 8vw, 6rem)",
        lineHeight: "1.1em",
        letterSpacing: "-0.02em",
        textAlign: "center",
    },
    color: "#FFFFFF",
    ease: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        duration: 0.8,
    },
};

/**
 * RandomLetterSwap — text whose letters swap vertically on hover in a
 * randomized stagger order.
 *
 *   • forward  — plays the swap once on hover-enter with debouncing (100ms)
 *     and a `blocked` latch that prevents overlapping runs until completed.
 *   • pingpong — plays forward on hover-enter, reverse on hover-leave,
 *     both debounced leading + trailing (100ms).
 */
export function RandomLetterSwap(props: RandomLetterSwapProps) {
    const merged = { ...COMPONENT_DEFAULTS, ...props };
    const {
        label = "LETTER SWAP",
        mode = "pingpong",
        reverse = false,
        staggerDuration = 0.08,
        ease,
        font,
        color = "#FFFFFF",
        onClick,
        className,
        style,
    } = merged;

    const [scope, animate] = useAnimate();
    // forward-mode latch: ignore additional hovers until active animation finishes
    const [blocked, setBlocked] = useState(false);

    const transition: AnimationOptions = useMemo(
        () => (ease ?? { type: "spring", stiffness: 400, damping: 28, duration: 0.8 }) as AnimationOptions,
        [ease]
    );

    const shuffleArray = (arr: number[]): number[] => {
        const a = [...arr];
        a.sort(() => Math.random() - 0.5);
        return a;
    };

    const mergeDelay = (base: AnimationOptions, i: number): AnimationOptions =>
        ({
            ...base,
            delay: i * staggerDuration,
        }) as AnimationOptions;

    const debouncedHoverStartRef = useRef<(() => void) | null>(null);
    const debouncedHoverEndRef = useRef<(() => void) | null>(null);
    const timerRefs = useRef<{
        startTimer: ReturnType<typeof setTimeout> | null;
        startTrailing: boolean;
        endTimer: ReturnType<typeof setTimeout> | null;
        endTrailing: boolean;
    }>({
        startTimer: null,
        startTrailing: false,
        endTimer: null,
        endTrailing: false,
    });

    useEffect(() => {
        const letterIdxs: number[] = [];
        const len = label ? label.length : 0;
        for (let k = 0; k < len; k++) {
            if (label[k] !== " ") letterIdxs.push(k);
        }
        const count = letterIdxs.length;

        // ---- Forward mode ------------------------------------------------
        const runForward = () => {
            if (blocked || count === 0) return;
            setBlocked(true);
            const order = shuffleArray(letterIdxs);
            for (let i = 0; i < order.length; i++) {
                const idx = order[i];
                const isLast = i === order.length - 1;
                animate(
                    `.letter-${idx}`,
                    { y: reverse ? "100%" : "-100%" },
                    mergeDelay(transition, i)
                ).then(() => {
                    animate(`.letter-${idx}`, { y: 0 }, { duration: 0 });
                });
                animate(
                    `.letter-secondary-${idx}`,
                    { top: "0%" },
                    mergeDelay(transition, i)
                ).then(() => {
                    animate(
                        `.letter-secondary-${idx}`,
                        { top: reverse ? "-100%" : "100%" },
                        { duration: 0 }
                    ).then(() => {
                        if (isLast) setBlocked(false);
                    });
                });
            }
        };

        // ---- Ping-pong mode ----------------------------------------------
        const runPingStart = () => {
            if (count === 0) return;
            const order = shuffleArray(letterIdxs);
            for (let i = 0; i < order.length; i++) {
                const idx = order[i];
                animate(
                    `.letter-${idx}`,
                    { y: reverse ? "100%" : "-100%" },
                    mergeDelay(transition, i)
                );
                animate(
                    `.letter-secondary-${idx}`,
                    { top: "0%" },
                    mergeDelay(transition, i)
                );
            }
        };

        const runPingEnd = () => {
            if (count === 0) return;
            const order = shuffleArray(letterIdxs);
            for (let i = 0; i < order.length; i++) {
                const idx = order[i];
                animate(`.letter-${idx}`, { y: 0 }, mergeDelay(transition, i));
                animate(
                    `.letter-secondary-${idx}`,
                    { top: reverse ? "-100%" : "100%" },
                    mergeDelay(transition, i)
                );
            }
        };

        const wait = 100;
        const t = timerRefs.current;
        const startBody = mode === "pingpong" ? runPingStart : runForward;
        const endBody = runPingEnd;

        debouncedHoverStartRef.current = () => {
            if (!t.startTimer) {
                startBody();
                t.startTimer = setTimeout(() => {
                    if (t.startTrailing) startBody();
                    t.startTrailing = false;
                    t.startTimer = null;
                }, wait);
            } else {
                t.startTrailing = true;
            }
        };

        debouncedHoverEndRef.current = () => {
            if (!t.endTimer) {
                endBody();
                t.endTimer = setTimeout(() => {
                    if (t.endTrailing) endBody();
                    t.endTrailing = false;
                    t.endTimer = null;
                }, wait);
            } else {
                t.endTrailing = true;
            }
        };

        return () => {
            if (t.startTimer) clearTimeout(t.startTimer);
            if (t.endTimer) clearTimeout(t.endTimer);
            t.startTimer = null;
            t.endTimer = null;
            t.startTrailing = false;
            t.endTrailing = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        mode,
        reverse,
        staggerDuration,
        transition,
        animate,
        label,
        blocked,
    ]);

    const hoverStart = () => {
        debouncedHoverStartRef.current?.();
    };
    const hoverEnd = () => {
        debouncedHoverEndRef.current?.();
    };

    const srOnlyStyle: React.CSSProperties = {
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
    };

    const typeface = (font ?? {}) as Record<string, any>;
    const fontCss = Object.fromEntries(
        Object.entries(typeface).filter(([k]) => k !== "textAlign")
    );

    const innerSpanStyle: React.CSSProperties = {
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...fontCss,
        color,
    };

    const letters = label ? label.split("") : [];
    const secondaryRestingTop = reverse ? "-100%" : "100%";

    const handlers =
        mode === "pingpong"
            ? {
                  onMouseEnter: hoverStart,
                  onMouseLeave: hoverEnd,
                  onClick,
              }
            : {
                  onMouseEnter: hoverStart,
                  onClick,
              };

    return (
        <div
            className={cn(
                "w-full h-full flex items-center justify-center select-none py-10 px-4",
                className
            )}
            style={style}
        >
            {letters.length === 0 ? null : (
                <span ref={scope} style={innerSpanStyle} {...handlers}>
                    <span style={srOnlyStyle}>{label}</span>
                    {letters.map((letter, i) => (
                        <span
                            key={i}
                            aria-hidden
                            style={{
                                whiteSpace: "pre",
                                position: "relative",
                                display: "flex",
                            }}
                        >
                            <motion.span
                                className={`letter-${i}`}
                                style={{
                                    position: "relative",
                                    top: 0,
                                    paddingBottom: "0.25rem",
                                }}
                            >
                                {letter}
                            </motion.span>
                            <motion.span
                                className={`letter-secondary-${i}`}
                                style={{
                                    position: "absolute",
                                    left: 0,
                                    right: 0,
                                    top: secondaryRestingTop,
                                }}
                            >
                                {letter}
                            </motion.span>
                        </span>
                    ))}
                </span>
            )}
        </div>
    );
}

export default RandomLetterSwap;
