"use client";

import * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";

export type FontStyle = React.CSSProperties;

export type TransitionValue = {
    type?: string;
    duration?: number;
    delay?: number;
    ease?: string | number[];
    staggerChildren?: number;
};

export type StaggerFrom = "start" | "center" | "end" | "random";
export type StartFrom = "top" | "bottom";
export type TextTag =
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "p"
    | "span"
    | "div"
    | "section";

export interface RollingLettersProps {
    text?: string;
    font?: FontStyle;
    color?: string;
    startFrom?: StartFrom;
    staggerFrom?: StaggerFrom;
    tag?: TextTag;
    transition?: TransitionValue;
    className?: string;
    style?: React.CSSProperties;
    triggerOnHover?: boolean;
}

const startYPercentMap: Record<StartFrom, number> = {
    top: -500,
    bottom: 500,
};

const mapEase = (ease: TransitionValue["ease"]): string => {
    if (typeof ease !== "string") return "power4.out";

    const easeMap: Record<string, string> = {
        linear: "none",
        easeIn: "power2.in",
        easeOut: "power4.out",
        easeInOut: "power2.inOut",
        circIn: "circ.in",
        circOut: "circ.out",
        circInOut: "circ.inOut",
        backIn: "back.in",
        backOut: "back.out(1.7)",
        backInOut: "back.inOut",
        anticipate: "back.out(1.7)",
    };

    return easeMap[ease] ?? ease;
};

export const RollingLetters = ({
    text = "UI HUB",
    font = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "clamp(2.5rem, 8vw, 6.5rem)",
        fontWeight: 700,
        letterSpacing: "-0.025em",
        lineHeight: "1.1em",
        textAlign: "center",
    },
    color = "#ffffff",
    startFrom = "bottom",
    staggerFrom = "center",
    tag = "h1",
    transition = {
        type: "tween",
        duration: 0.6,
        delay: 0,
        ease: "easeOut",
        staggerChildren: 0.08,
    },
    className,
    style,
    triggerOnHover = true,
}: RollingLettersProps) => {
    const containerRef = useRef<HTMLElement>(null);

    const playAnimation = useCallback(() => {
        if (!containerRef.current) return;

        const chars = containerRef.current.querySelectorAll(".char");

        gsap.killTweensOf(chars);

        gsap.set(chars, {
            clearProps: "transform",
        });

        gsap.from(chars, {
            yPercent: startYPercentMap[startFrom],
            duration: transition.duration ?? 0.6,
            delay: transition.delay ?? 0,
            stagger: {
                each: transition.staggerChildren ?? 0.08,
                from: staggerFrom,
            },
            ease: mapEase(transition.ease),
        });
    }, [startFrom, staggerFrom, transition]);

    useEffect(() => {
        playAnimation();
    }, [text, playAnimation]);

    const handleMouseEnter = () => {
        if (triggerOnHover) {
            playAnimation();
        }
    };

    return (
        <div
            className={`w-full h-full flex items-center justify-center select-none py-10 px-4 cursor-pointer ${className || ""}`}
            style={{ width: "100%", height: "100%", ...style }}
            onMouseEnter={handleMouseEnter}
            onClick={playAnimation}
        >
            {React.createElement(
                tag,
                {
                    ref: containerRef,
                    style: {
                        margin: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "center",
                        overflow: "hidden",
                        whiteSpace: "pre-wrap",
                        color,
                        ...font,
                    },
                },
                (text || "").split("").map((char, index) => (
                    <span
                        key={index}
                        className="char"
                        style={{
                            display: "inline-block",
                            willChange: "transform",
                        }}
                    >
                        {char === " " ? "\u00A0" : char}
                    </span>
                ))
            )}
        </div>
    );
};

export const SlotMachine = RollingLetters;
export default RollingLetters;
