"use client";

import React, { useMemo, useEffect, useRef, useState, useCallback, useId } from "react";

export type SmokyPosition = "bottomLeft" | "topLeft";
export type SmokyAnimationMode = "singleLine" | "multiLine" | "inPlace";
export type SmokyPhase = "hidden" | "appearing" | "visible";
export type SmokyAppearTrigger = "default" | "hover" | "scroll";

export interface CharEntry {
    char: string;
    globalIdx: number;
    posInLine: number;
    lineIdx: number;
}

export interface Group {
    type: "word" | "space" | "newline";
    chars: CharEntry[];
    lineIdx: number;
    gi: number;
}

export interface VLI {
    charVL: Map<number, number>;
    charVLPos: Map<number, number>;
    vlLen: Map<number, number>;
}

export interface SmokyTextProps {
    text?: string;
    font?: React.CSSProperties;
    color?: string;
    appearTrigger?: SmokyAppearTrigger;
    scrollConfig?: {
        position?: "top" | "bottom";
        distance?: number;
    };
    appearTransition?: {
        type?: "tween" | "spring";
        ease?: string | number[];
        duration?: number;
        delay?: number;
    };
    intensity?: number;
    position?: SmokyPosition;
    animationMode?: SmokyAnimationMode;
    className?: string;
    style?: React.CSSProperties;
}

function buildGroups(text: string) {
    const lines = text.split("\n");
    const groups: Group[] = [];
    let globalIdx = 0;
    let gi = 0;
    lines.forEach((line, lineIdx) => {
        let posInLine = 0;
        (line.match(/\S+|\s+/g) ?? []).forEach((seg) => {
            groups.push({
                type: /^\s/.test(seg) ? "space" : "word",
                chars: seg.split("").map((c) => ({
                    char: c,
                    globalIdx: globalIdx++,
                    posInLine: posInLine++,
                    lineIdx,
                })),
                lineIdx,
                gi: gi++,
            });
        });
        if (lineIdx < lines.length - 1) {
            groups.push({ type: "newline", chars: [], lineIdx, gi: gi++ });
        }
    });
    return { groups, totalVisible: globalIdx };
}

function rawDelay(
    c: CharEntry,
    _total: number,
    _pos: SmokyPosition,
    mode: SmokyAnimationMode,
    vli: VLI | null
): number {
    const S = 0.1;
    if (mode === "inPlace") return 0;
    if (mode === "multiLine" && vli) {
        const p = vli.charVLPos.get(c.globalIdx) ?? 0;
        return p * S;
    }
    return c.globalIdx * S;
}

function rawAppearDelay(
    c: CharEntry,
    total: number,
    pos: SmokyPosition,
    mode: SmokyAnimationMode,
    vli: VLI | null,
    _maxRaw: number
): number {
    return rawDelay(c, total, pos, mode, vli);
}

function scaledTiming(
    rawD: number,
    maxRaw: number,
    duration: number
): { delay: number; charDur: number } {
    if (maxRaw <= 0) return { delay: 0, charDur: duration };
    return {
        charDur: duration * 0.5,
        delay: (rawD * (duration * 0.5)) / maxRaw,
    };
}

function getAppear(
    c: CharEntry,
    _total: number,
    pos: SmokyPosition,
    mode: SmokyAnimationMode,
    _vli: VLI | null,
    scopePrefix: string = "smt"
): string {
    const e = c.globalIdx % 2 === 0;
    if (mode === "inPlace") return e ? `${scopePrefix}-ap-c-a` : `${scopePrefix}-ap-c-b`;
    if (pos === "topLeft") return e ? `${scopePrefix}-ap-tl-a` : `${scopePrefix}-ap-tl-b`;
    return e ? `${scopePrefix}-ap-bl-a` : `${scopePrefix}-ap-bl-b`;
}

function parseT(t: any, def: { duration: number; delay: number }) {
    const EASES: Record<string, string> = {
        linear: "linear",
        easeIn: "cubic-bezier(0.42,0,1,1)",
        easeOut: "cubic-bezier(0,0,0.58,1)",
        easeInOut: "cubic-bezier(0.42,0,0.58,1)",
    };
    if (!t) {
        return {
            duration: def.duration,
            delay: def.delay,
            timing: "cubic-bezier(0,0,0.58,1)",
        };
    }
    if (t.type === "spring") {
        return {
            duration: 1.5,
            delay: t.delay ?? def.delay,
            timing: "cubic-bezier(0.175,0.885,0.32,1.275)",
        };
    }
    return {
        duration: typeof t.duration === "number" ? t.duration : def.duration,
        delay: typeof t.delay === "number" ? t.delay : def.delay,
        timing: Array.isArray(t.ease)
            ? `cubic-bezier(${(t.ease as number[]).map((v) => +v.toFixed(4)).join(",")})`
            : (EASES[String(t.ease)] ?? "cubic-bezier(0,0,0.58,1)"),
    };
}

function buildKF(color: string, intensity: number, scopePrefix: string = "smt") {
    const n = (Math.max(1, Math.min(20, intensity)) - 1) / 19;
    const r = (v: number) => +v.toFixed(2);

    const peakB = Math.round(6 + n * 200);
    const initB = Math.round(2 + n * 70);

    const layers = 1 + Math.round(n * 3);
    const stack = (blur: number) =>
        Array.from(
            { length: layers },
            (_, i) => `0 0 ${Math.round((blur * (i + 1)) / layers)}px ${color}`
        ).join(",");
    const peak = stack(peakB);
    const init = stack(initB);

    const d = 0.7 + n * 0.8;
    const ic = r(1.3 + n * 0.5);
    const ic2 = r(1.15 + n * 0.35);

    return `
@keyframes ${scopePrefix}-ap-c-a{from{opacity:0;text-shadow:${init};transform:scale(${ic})}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes ${scopePrefix}-ap-c-b{from{opacity:0;text-shadow:${init};transform:scale(${ic2})}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes ${scopePrefix}-ap-bl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-15 * d)}rem,${r(8 * d)}rem,0) rotate(40deg) skewX(-70deg) scale(0.7)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes ${scopePrefix}-ap-bl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-18 * d)}rem,${r(8 * d)}rem,0) rotate(40deg) skewX(70deg) scale(0.5)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes ${scopePrefix}-ap-tl-a{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-15 * d)}rem,${r(-8 * d)}rem,0) rotate(-40deg) skewX(70deg) scale(0.7)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
@keyframes ${scopePrefix}-ap-tl-b{from{opacity:0;text-shadow:${init};transform:translate3d(${r(-18 * d)}rem,${r(-8 * d)}rem,0) rotate(-40deg) skewX(-70deg) scale(0.5)}40%{text-shadow:${peak}}to{opacity:1;text-shadow:0 0 0 ${color};transform:none}}
`;
}

export const COMPONENT_DEFAULTS: SmokyTextProps = {
    text: "SMOKY\nTEXT",
    font: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontWeight: 800,
        fontSize: "clamp(2.5rem, 7vw, 5.5rem)",
        lineHeight: "1.05em",
        letterSpacing: "0.02em",
        textAlign: "center",
    },
    color: "#f5f5f5",
    appearTrigger: "default",
    scrollConfig: {
        position: "bottom",
        distance: 20,
    },
    appearTransition: { type: "tween", ease: "easeOut", duration: 2, delay: 0 },
    intensity: 10,
    animationMode: "singleLine",
    position: "bottomLeft",
};

export const SmokyText: React.FC<SmokyTextProps> = (props) => {
    const merged = { ...COMPONENT_DEFAULTS, ...props };
    const {
        text = "SMOKY\nTEXT",
        font = {},
        color = "#f5f5f5",
        appearTrigger = "default",
        scrollConfig = {},
        appearTransition,
        intensity = 10,
        position = "bottomLeft",
        animationMode = "singleLine",
        className,
        style,
    } = merged;

    const rawId = useId();
    const scopePrefix = `smt-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const kfEl = useRef<HTMLStyleElement | null>(null);
    useEffect(() => {
        const el = document.createElement("style");
        kfEl.current = el;
        document.head.appendChild(el);
        return () => {
            el.remove();
            kfEl.current = null;
        };
    }, []);

    useEffect(() => {
        if (kfEl.current) {
            kfEl.current.textContent = buildKF(color, intensity, scopePrefix);
        }
    }, [color, intensity, scopePrefix]);

    const { groups, totalVisible } = useMemo(() => buildGroups(text), [text]);
    const appearT = useMemo(
        () => parseT(appearTransition, { duration: 2, delay: 0 }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [JSON.stringify(appearTransition)]
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const wordRefs = useRef(new Map<number, HTMLElement>());
    const [vli, setVli] = useState<VLI | null>(null);

    const measureVL = useCallback(() => {
        if (animationMode !== "multiLine") {
            setVli(null);
            return;
        }
        const items: { top: number; gi: number; chars: CharEntry[] }[] = [];
        groups.forEach((g) => {
            if (g.type === "newline" || !g.chars.length) return;
            const el = wordRefs.current.get(g.gi);
            if (el) items.push({ top: el.offsetTop, gi: g.gi, chars: g.chars });
        })
        items.sort((a, b) => a.gi - b.gi);
        const tops = [...new Set(items.map((i) => i.top))].sort((a, b) => a - b);
        const topToVL = new Map(tops.map((t, i) => [t, i]));
        const charVL = new Map<number, number>();
        const charVLPos = new Map<number, number>();
        const vlLen = new Map<number, number>();
        const vlPos = new Map<number, number>();
        items.forEach(({ top, chars }) => {
            const vl = topToVL.get(top) ?? 0;
            chars.forEach((c) => {
                const p = vlPos.get(vl) ?? 0;
                charVL.set(c.globalIdx, vl);
                charVLPos.set(c.globalIdx, p);
                vlPos.set(vl, p + 1);
                vlLen.set(vl, p + 1);
            });
        });
        setVli({ charVL, charVLPos, vlLen });
    }, [groups, animationMode]);

    useEffect(() => {
        measureVL();
        if (!containerRef.current) return;
        const ro = new ResizeObserver(measureVL);
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [measureVL]);

    const maxRaw = useMemo(() => {
        let m = 0;
        groups.forEach((g) =>
            g.chars.forEach((c) => {
                const d = rawDelay(
                    c,
                    totalVisible,
                    position,
                    animationMode,
                    vli
                );
                if (d > m) m = d;
            })
        );
        return m;
    }, [groups, totalVisible, position, animationMode, vli]);

    const [phase, setPhase] = useState<SmokyPhase>("hidden");
    const tRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const clear = () => {
        tRef.current.forEach(clearTimeout);
        tRef.current = [];
    };
    const later = (fn: () => void, ms: number) =>
        tRef.current.push(setTimeout(fn, ms));

    const apRef = useRef(appearT);
    apRef.current = appearT;
    const hoverFiredRef = useRef(false);
    const scrollPos = (scrollConfig?.position ?? "bottom") as "top" | "bottom";
    const scrollDist = Math.max(0, Math.min(100, scrollConfig?.distance ?? 20));

    const runAppear = useCallback(() => {
        clear();
        const ap = apRef.current;
        setPhase("hidden");
        later(
            () => {
                setPhase("appearing");
                later(() => setPhase("visible"), ap.duration * 1000 + 200);
            },
            Math.max(ap.delay * 1000, 80)
        );
    }, []);

    useEffect(() => {
        clear();
        if (appearTrigger === "default") {
            runAppear();
            return clear;
        }
        hoverFiredRef.current = false;
        setPhase("hidden");
        if (appearTrigger === "scroll") {
            const el = containerRef.current;
            if (!el) return clear;
            const check = () => {
                const vh =
                    window.innerHeight || document.documentElement.clientHeight;
                const rect = el.getBoundingClientRect();
                if (scrollPos === "top") {
                    return rect.top <= vh * (scrollDist / 100);
                }
                return rect.bottom <= vh * (1 - scrollDist / 100);
            };
            if (check()) {
                runAppear();
                return clear;
            }
            const onScroll = () => {
                if (check()) {
                    runAppear();
                    window.removeEventListener("scroll", onScroll, true);
                    window.removeEventListener("resize", onScroll);
                }
            };
            window.addEventListener("scroll", onScroll, true);
            window.addEventListener("resize", onScroll);
            return () => {
                window.removeEventListener("scroll", onScroll, true);
                window.removeEventListener("resize", onScroll);
                clear();
            };
        }
        return clear;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        text,
        color,
        intensity,
        position,
        animationMode,
        appearTrigger,
        scrollPos,
        scrollDist,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        JSON.stringify(appearT),
        runAppear,
    ]);

    const fontAny = (font ?? {}) as any;
    const textAlign = (fontAny?.textAlign ?? "center") as string;
    const justify =
        textAlign === "right"
            ? "flex-end"
            : textAlign === "center"
              ? "center"
              : "flex-start";

    return (
        <div
            ref={containerRef}
            className={className}
            onMouseEnter={() => {
                if (appearTrigger === "hover" && !hoverFiredRef.current) {
                    hoverFiredRef.current = true;
                    runAppear();
                }
            }}
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: justify,
                userSelect: "none",
                ...style,
            }}
        >
            <div
                style={{
                    ...fontAny,
                    color: "transparent",
                    backfaceVisibility: "hidden",
                    userSelect: "none",
                    textAlign: textAlign as any,
                    wordBreak: "keep-all",
                    overflowWrap: "normal",
                }}
            >
                {groups.map((group) => {
                    if (group.type === "newline") return <br key={group.gi} />;
                    if (group.type === "space")
                        return (
                            <span
                                key={group.gi}
                                ref={(el) => {
                                    if (el) wordRefs.current.set(group.gi, el);
                                }}
                                style={{ display: "inline", whiteSpace: "pre" }}
                            >
                                {" "}
                            </span>
                        );

                    return (
                        <span
                            key={group.gi}
                            ref={(el) => {
                                if (el) wordRefs.current.set(group.gi, el);
                            }}
                            style={{
                                display: "inline-block",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {group.chars.map((c) => {
                                const base: React.CSSProperties = {
                                    display: "inline-block",
                                    textShadow: `0 0 0 ${color}`,
                                };

                                if (phase === "hidden")
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{ ...base, opacity: 0 }}
                                        >
                                            {c.char}
                                        </span>
                                    );

                                if (phase === "visible")
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{ ...base, opacity: 1 }}
                                        >
                                            {c.char}
                                        </span>
                                    );

                                if (phase === "appearing") {
                                    const rd = rawAppearDelay(
                                        c,
                                        totalVisible,
                                        position,
                                        animationMode,
                                        vli,
                                        maxRaw
                                    );
                                    const { delay, charDur } = scaledTiming(
                                        rd,
                                        maxRaw,
                                        appearT.duration
                                    );
                                    const anim = getAppear(
                                        c,
                                        totalVisible,
                                        position,
                                        animationMode,
                                        vli,
                                        scopePrefix
                                    );
                                    return (
                                        <span
                                            key={c.globalIdx}
                                            style={{
                                                ...base,
                                                animation: `${anim} ${charDur}s ${delay}s ${appearT.timing} both`,
                                            }}
                                        >
                                            {c.char}
                                        </span>
                                    );
                                }

                                return null;
                            })}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default SmokyText;
