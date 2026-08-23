"use client";

import * as React from "react";
import { useId, useLayoutEffect, useRef, useState } from "react";

export type TextPathFontValue = {
    fontFamily?: string;
    fontWeight?: number | string;
    fontStyle?: string;
    fontSize?: number | string;
    letterSpacing?: number | string;
    lineHeight?: number | string;
    variant?: string;
};

export interface TextPathProps {
    text?: string;
    speed?: number;
    reversed?: boolean;
    textFont?: TextPathFontValue;
    textColor?: string;
    waveFrequency?: number;
    waveHeight?: number;
    separator?: string;
    gap?: number;
    className?: string;
    width?: string | number;
    height?: string | number;
    style?: React.CSSProperties;
}

export const COMPONENT_DEFAULTS: TextPathProps = {
    text: "TEXT PATH",
    separator: "   •   ",
    gap: 0,
    textFont: {
        fontSize: 18,
        variant: "Regular",
        letterSpacing: 0,
        lineHeight: 1.2,
    },
    textColor: "#FFFFFF",
    speed: 30,
    reversed: true,
    waveFrequency: 3,
    waveHeight: 100,
    className: "",
    width: "100%",
    height: 200,
};

export const TextPath: React.FC<TextPathProps> = (props) => {
    const merged = { ...COMPONENT_DEFAULTS, ...props };
    const {
        text = "TEXT PATH",
        speed = 30,
        reversed = true,
        textFont = COMPONENT_DEFAULTS.textFont,
        textColor = "#FFFFFF",
        waveFrequency = 3,
        waveHeight = 100,
        separator = "   •   ",
        gap = 0,
        className,
        width,
        height,
        style,
    } = merged;

    const toPx = (v: string | number | undefined, fallback: number): number => {
        if (typeof v === "number") return isFinite(v) ? v : fallback;
        if (typeof v === "string") {
            const n = parseFloat(v);
            return isFinite(n) ? n : fallback;
        }
        return fallback;
    };
    const fontSizePx = toPx(textFont?.fontSize, 18);
    const letterSpacingPx = toPx(textFont?.letterSpacing, 0);
    const fontSize = `${fontSizePx}px`;
    const letterSpacing = `${letterSpacingPx}px`;

    const systemFontStack =
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
    const fontFamily = textFont?.fontFamily || systemFontStack;
    const fontWeight = textFont?.fontWeight;
    const fontStyle = textFont?.fontStyle;

    const containerRef = useRef<HTMLDivElement | null>(null);
    const pathDefRef = useRef<SVGPathElement | null>(null);
    const measureTextRef = useRef<SVGTextElement | null>(null);
    const measureText2Ref = useRef<SVGTextElement | null>(null);

    const [containerSize, setContainerSize] = useState<{
        w: number;
        h: number;
    }>({
        w: 800,
        h: 200,
    });

    useLayoutEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const apply = (rawW: number, rawH: number) => {
            const w = Math.round(rawW);
            const h = Math.round(rawH);
            if (w <= 0 || h <= 0) return;
            setContainerSize((prev) =>
                Math.abs(prev.w - w) <= 1 && Math.abs(prev.h - h) <= 1
                    ? prev
                    : { w, h }
            );
        };

        const rect = el.getBoundingClientRect();
        apply(rect.width, rect.height);

        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                apply(entry.contentRect.width, entry.contentRect.height);
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const reactId = useId();
    const pathId = `tp-${reactId.replace(/[:]/g, "")}-path`;

    const w = containerSize.w > 0 ? containerSize.w : 800;
    const h = containerSize.h > 0 ? containerSize.h : 200;

    const [unitWidthPx, setUnitWidthPx] = useState(0);
    const safeText = text && text.length > 0 ? text : " ";
    const gapStr = "\u00A0".repeat(Math.max(0, Math.min(20, Math.round(gap ?? 0))));
    const unitText = safeText + gapStr + (separator ?? "") + gapStr;
    const estUnitWidthPx = Math.max(1, unitText.length * fontSizePx * 0.6);
    const effUnitWidthPx = unitWidthPx > 0 ? unitWidthPx : estUnitWidthPx;

    const cy = h / 2;
    const amplitude = Math.max(0, Math.min(waveHeight / 2, h / 2 - fontSizePx));
    const ctrlAmp = amplitude * (4 / 3);
    const halfCyclesVisible = Math.max(1, Math.round(waveFrequency * 2));
    const halfWidth = w / halfCyclesVisible;
    const overflow = Math.max(100, w * 0.3);

    const leftSteps = Math.ceil(overflow / halfWidth);
    const rightSteps = Math.ceil(overflow / halfWidth);
    const totalSteps = halfCyclesVisible + leftSteps + rightSteps;
    const xStart = -leftSteps * halfWidth;
    const startSign = leftSteps % 2 === 0 ? -1 : 1;

    let d = `M ${xStart},${cy}`;
    for (let i = 0; i < totalSteps; i++) {
        const xa = xStart + i * halfWidth;
        const xb = xStart + (i + 1) * halfWidth;
        const peakY =
            cy + (i % 2 === 0 ? startSign * ctrlAmp : -startSign * ctrlAmp);
        d +=
            ` C ${xa + halfWidth / 3},${peakY}` +
            ` ${xb - halfWidth / 3},${peakY}` +
            ` ${xb},${cy}`;
    }
    const effectivePath = d;

    const [pathLengthPx, setPathLengthPx] = useState(0);

    useLayoutEffect(() => {
        const el = pathDefRef.current;
        if (!el) return;
        let len = 0;
        try {
            len = el.getTotalLength();
        } catch {
            len = 0;
        }
        if (!isFinite(len) || len <= 0) return;
        setPathLengthPx((prev) => (prev === len ? prev : len));
    }, [effectivePath, w, h]);

    useLayoutEffect(() => {
        const a = measureTextRef.current;
        const b = measureText2Ref.current;
        if (!a || !b) return;
        let la = 0;
        let lb = 0;
        try {
            la = a.getComputedTextLength();
            lb = b.getComputedTextLength();
        } catch {
            la = 0;
            lb = 0;
        }
        const period = (lb - la) / 2;
        if (!isFinite(period) || period <= 0) return;
        setUnitWidthPx((prev) => (prev === period ? prev : period));
    }, [unitText, fontSize, letterSpacing, fontFamily, fontWeight, fontStyle]);

    const segArc = 2 * Math.hypot(halfWidth / 2, ctrlAmp) * 1.15;
    const estPathLengthPx = totalSteps * Math.max(halfWidth, segArc);
    const effPathLengthPx = Math.max(pathLengthPx, estPathLengthPx);
    const repeatCount = Math.min(
        256,
        Math.max(2, Math.ceil(effPathLengthPx / effUnitWidthPx) + 3)
    );
    const repeatedText = unitText.repeat(repeatCount);

    const offsetRef = useRef(0);
    const lastTRef = useRef<number | null>(null);
    const speedRef = useRef(0);
    const reversedRef = useRef(false);
    const unitWidthRef = useRef(0);
    const textPathRef = useRef<SVGTextPathElement | null>(null);

    speedRef.current = Math.max(0, speed ?? 0) * 5;
    reversedRef.current = !!reversed;
    unitWidthRef.current = unitWidthPx > 0 ? unitWidthPx : 0;

    useLayoutEffect(() => {
        const el = textPathRef.current;
        if (!el) return;
        lastTRef.current = null;
        let raf = 0;
        const loop = (t: number) => {
            if (lastTRef.current == null) lastTRef.current = t;
            const dt = Math.min((t - lastTRef.current) / 1000, 1 / 30);
            lastTRef.current = t;
            const unit = unitWidthRef.current;
            const pps = speedRef.current;
            if (unit > 0 && pps > 0) {
                const dir = reversedRef.current ? 1 : -1;
                let off = offsetRef.current + dir * pps * dt;
                off -= Math.floor(off / unit) * unit;
                offsetRef.current = off;
                el.setAttribute("startOffset", `${off}px`);
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(raf);
    }, []);

    const resolveDim = (
        v: string | number | undefined,
        fallback: string
    ): string => {
        if (v == null) return fallback;
        if (typeof v === "number") return `${v}px`;
        return v;
    };

    return (
        <div
            ref={containerRef}
            className={className}
            style={{
                position: "relative",
                width: resolveDim(width, "100%"),
                height: resolveDim(height, "100%"),
                overflow: "hidden",
                userSelect: "none",
                ...style,
            }}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox={`0 0 ${w} ${h}`}
                width="100%"
                height="100%"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                }}
            >
                <defs>
                    <path
                        ref={pathDefRef}
                        id={pathId}
                        d={effectivePath}
                        fill="none"
                    />
                </defs>
                <text
                    ref={measureTextRef}
                    x={0}
                    y={-9999}
                    style={{
                        fontSize,
                        letterSpacing,
                        fontFamily,
                        fontWeight,
                        fontStyle,
                        visibility: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    {unitText.repeat(2)}
                </text>
                <text
                    ref={measureText2Ref}
                    x={0}
                    y={-9999}
                    style={{
                        fontSize,
                        letterSpacing,
                        fontFamily,
                        fontWeight,
                        fontStyle,
                        visibility: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    {unitText.repeat(4)}
                </text>
                <text
                    fill={textColor}
                    style={{
                        fontSize,
                        letterSpacing,
                        fontFamily,
                        fontWeight,
                        fontStyle,
                    }}
                >
                    <textPath
                        ref={textPathRef}
                        href={`#${pathId}`}
                        xlinkHref={`#${pathId}`}
                    >
                        {repeatedText}
                    </textPath>
                </text>
            </svg>
        </div>
    );
};

export default TextPath;
