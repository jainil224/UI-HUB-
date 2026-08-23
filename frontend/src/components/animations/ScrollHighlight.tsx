"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export type FontStyle = React.CSSProperties;

export type SplitBy = "characters" | "words";

export type ScrollPosition =
    | "top top"
    | "top center"
    | "top bottom"
    | "center top"
    | "center center"
    | "center bottom"
    | "bottom top"
    | "bottom center"
    | "bottom bottom"
    | string;

export interface ScrollHighlightProps {
    text?: string;
    font?: FontStyle;
    dimColor?: string;
    highlightColor?: string;
    splitBy?: SplitBy;
    scrollStart?: ScrollPosition;
    scrollEnd?: ScrollPosition;
    scrub?: boolean | number;
    scroller?: HTMLElement | string | null;
    paddingTop?: string;
    paddingBottom?: string;
    className?: string;
    style?: React.CSSProperties;
    containerStyle?: React.CSSProperties;
}

const CHAR_STAGGER = 0.03;
const WORD_STAGGER = 0.1;

export const ScrollHighlight: React.FC<ScrollHighlightProps> = ({
    text = "Every detail matters. Small interactions shape perception, build trust, and transform ordinary experiences into memorable ones.",
    font = {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "clamp(1.8rem, 4.5vw, 3.75rem)",
        fontWeight: 600,
        letterSpacing: "-0.025em",
        lineHeight: "1.2em",
        textAlign: "left",
    },
    dimColor = "rgba(255, 255, 255, 0.15)",
    highlightColor = "#FFFFFF",
    splitBy = "words",
    scrollStart = "top center",
    scrollEnd = "bottom center",
    scrub = true,
    scroller,
    paddingTop = "100dvh",
    paddingBottom = "100dvh",
    className,
    style,
    containerStyle,
}) => {
    const containerRef = useRef<HTMLParagraphElement>(null);
    const words = text.trim().split(/\s+/).filter(Boolean);
    const chars = Array.from(text);
    const stagger = splitBy === "characters" ? CHAR_STAGGER : WORD_STAGGER;

    useEffect(() => {
        const paragraph = containerRef.current;
        if (!paragraph) return;

        const targets = paragraph.querySelectorAll(
            splitBy === "characters" ? ".char" : ".word"
        );

        const ctx = gsap.context(() => {
            gsap.set(targets, {
                color: dimColor,
            });

            gsap.to(targets, {
                color: highlightColor,
                stagger,
                scrollTrigger: {
                    trigger: paragraph,
                    start: scrollStart,
                    end: scrollEnd,
                    scrub,
                    scroller: scroller || undefined,
                },
            });
        }, paragraph);

        return () => ctx.revert();
    }, [
        text,
        dimColor,
        highlightColor,
        splitBy,
        stagger,
        scrollStart,
        scrollEnd,
        scrub,
        scroller,
    ]);

    return (
        <div
            className={className}
            style={{
                paddingTop,
                paddingBottom,
                width: "100%",
                ...containerStyle,
            }}
        >
            <p
                ref={containerRef}
                style={{
                    margin: 0,
                    display: "inline-block",
                    whiteSpace: "pre-wrap",
                    color: dimColor,
                    ...font,
                    ...style,
                }}
            >
                {splitBy === "characters"
                    ? chars.map((char, index) => (
                          <span
                              key={`${char}-${index}`}
                              className="char"
                              style={{
                                  display: "inline-block",
                                  color: dimColor,
                                  willChange: "color",
                              }}
                          >
                              {char === " " ? "\u00A0" : char}
                          </span>
                      ))
                    : words.map((word, index) => (
                          <React.Fragment key={`${word}-${index}`}>
                              <span
                                  className="word"
                                  style={{
                                      display: "inline-block",
                                      color: dimColor,
                                      willChange: "color",
                                  }}
                              >
                                  {word}
                              </span>
                              {index < words.length - 1 ? " " : null}
                          </React.Fragment>
                      ))}
            </p>
        </div>
    );
};

export const ScrollTextHighlight = ScrollHighlight;
export default ScrollHighlight;
