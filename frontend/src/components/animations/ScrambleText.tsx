"use client";

import React, { useState, useEffect, useRef, useLayoutEffect, Fragment } from "react";

const GLITCH_CHARS_UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const GLITCH_CHARS_LOWER = "abcdefghijklmnopqrstuvwxyz";
const WAVE_CURSOR_CHARS = "░▒▓█";

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
    const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
    const sampleDX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
    return (x: number) => {
        let t = x;
        for (let i = 0; i < 8; i++) {
            const dx = sampleX(t) - x;
            const d = sampleDX(t);
            if (Math.abs(dx) < 1e-6) break;
            if (d === 0) break;
            t -= dx / d;
        }
        return sampleY(Math.max(0, Math.min(1, t)));
    };
}

function makeEaseFn(ease: any): (t: number) => number {
    if (Array.isArray(ease) && ease.length === 4)
        return cubicBezier(ease[0], ease[1], ease[2], ease[3]);
    switch (ease) {
        case "linear":
            return (t) => t;
        case "easeIn":
            return (t) => t * t;
        case "easeOut":
            return (t) => 1 - (1 - t) * (1 - t);
        case "easeInOut":
            return (t) => (t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t));
        case "circIn":
            return (t) => 1 - Math.sqrt(1 - t * t);
        case "circOut":
            return (t) => Math.sqrt(1 - (t - 1) * (t - 1));
        case "circInOut":
            return (t) =>
                t < 0.5
                    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
                    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
        case "backIn":
            return (t) => 2.70158 * t * t * t - 1.70158 * t * t;
        case "backOut":
            return (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
        default:
            return (t) => 1 - (1 - t) * (1 - t);
    }
}

export type EnterMode = "none" | "oneLine" | "multiLine" | "random";
export type HoverMode =
    | "none"
    | "diffusionOneLine"
    | "diffusionMultiLine"
    | "waveOneLine"
    | "waveMultiLine";
type CharState = { char: string; locked: boolean; flickering: boolean };
type WordEntry = {
    text: string;
    gap: string;
    pi: number;
    wiInPara: number;
    globalWi: number;
};
type CharInfo = { id: string; cx: number; lineTop: number };

export interface ScrambleTextProps {
    words?: string;
    enterAnimation?: {
        mode?: EnterMode;
        restState?: "solid" | "transparent";
        replay?: boolean;
        position?: "above" | "middle" | "below";
        scrambleIntensity?: number;
        ease?: { type?: string; duration?: number; ease?: string };
        flickerEnabled?: boolean;
        flickerColor?: string;
        flickerIntensity?: number;
        flickerSpeed?: number;
    };
    hoverAnimation?: {
        type?: "diffusion" | "wave" | "none";
        lines?: "oneLine" | "multiLine";
        radius?: number;
        collapse?: boolean;
        collapseTime?: number;
        glitchChars?: string;
        glitchShuffle?: boolean;
        flickerEnabled?: boolean;
        flickerColor?: string;
        flickerIntensity?: number;
        flickerSpeed?: number;
        waveEase?: { type?: string; duration?: number; ease?: string };
        waveShuffleLimitEnabled?: boolean;
        waveShuffleLimitValue?: number;
    };
    color?: string;
    font?: React.CSSProperties;
    tag?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "div" | "span";
    className?: string;
    style?: React.CSSProperties;
}

export const COMPONENT_DEFAULTS: ScrambleTextProps = {
    words: "UI HUB SCRAMBLE",
    enterAnimation: {
        mode: "oneLine",
        restState: "solid",
        replay: true,
        position: "above",
        scrambleIntensity: 100,
        ease: { type: "tween", duration: 1.8, ease: "linear" },
        flickerEnabled: true,
        flickerColor: "#3D5CFF",
        flickerIntensity: 75,
        flickerSpeed: 10,
    },
    hoverAnimation: {
        type: "diffusion",
        lines: "oneLine",
        radius: 3,
        collapse: false,
        collapseTime: 1,
        glitchChars: "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*",
        glitchShuffle: true,
        flickerEnabled: true,
        flickerColor: "#3D5CFF",
        flickerIntensity: 50,
        flickerSpeed: 10,
        waveEase: { type: "tween", duration: 1.5, ease: "linear" },
        waveShuffleLimitEnabled: false,
        waveShuffleLimitValue: 10,
    },
    color: "#ffffff",
    font: {
        fontFamily: "Inter, system-ui, sans-serif",
        fontSize: "clamp(2rem, 6vw, 4.5rem)",
        fontWeight: 800,
        lineHeight: "1.1em",
        letterSpacing: "0.05em",
        textAlign: "center",
    },
    tag: "p",
};

export const ScrambleText: React.FC<ScrambleTextProps> = (props) => {
    const merged = { ...COMPONENT_DEFAULTS, ...props };
    const { words = "UI HUB SCRAMBLE", enterAnimation, hoverAnimation, color = "#ffffff", font, tag = "p", className, style } = merged;
    const Tag = (tag ?? "p") as any;

    const glitchColor = color;

    // ── Enter props ───────────────────────────────────────────────────────────
    const enterMode: EnterMode = enterAnimation?.mode ?? "oneLine";
    const enterEase: any = enterAnimation?.ease ?? {
        type: "tween",
        duration: 1.8,
        ease: "linear",
    };
    const enterDuration: number = enterEase?.duration ?? 1.8;
    const enterEaseCurve: any = enterEase?.ease ?? "linear";
    const enterScrambleIntensity: number =
        enterAnimation?.scrambleIntensity ?? 100;
    const enterReplay: boolean = enterAnimation?.replay ?? true;
    const enterPosition: string = enterAnimation?.position ?? "above";
    const enterRestState: string = enterAnimation?.restState ?? "solid";
    const enterFlickerEnabled: boolean = enterAnimation?.flickerEnabled ?? true;
    const enterFlickerColor: string = enterAnimation?.flickerColor ?? "#3D5CFF";
    const enterFlickerIntensity: number = enterAnimation?.flickerIntensity ?? 75;
    const enterFlickerSpeed: number = enterAnimation?.flickerSpeed ?? 10;

    // ── Hover props ───────────────────────────────────────────────────────────
    const hoverType: string = hoverAnimation?.type ?? "diffusion";
    const hoverLines: string = hoverAnimation?.lines ?? "oneLine";
    const hoverMode: HoverMode =
        hoverType === "diffusion"
            ? hoverLines === "oneLine"
                ? "diffusionOneLine"
                : "diffusionMultiLine"
            : hoverType === "wave"
              ? hoverLines === "oneLine"
                  ? "waveOneLine"
                  : "waveMultiLine"
              : "none";

    const hoverRadius: number = hoverAnimation?.radius ?? 3;
    const hoverCollapse: boolean = hoverAnimation?.collapse ?? false;
    const hoverCollapseTime: number = hoverAnimation?.collapseTime ?? 1;
    const hoverGlitchChars: string =
        hoverAnimation?.glitchChars ?? "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    const hoverGlitchShuffle: boolean = hoverAnimation?.glitchShuffle ?? true;
    const hoverFlickerEnabled: boolean = hoverAnimation?.flickerEnabled ?? true;
    const hoverFlickerColor: string = hoverAnimation?.flickerColor ?? "#3D5CFF";
    const hoverFlickerIntensity: number = hoverAnimation?.flickerIntensity ?? 50;
    const hoverFlickerSpeed: number = hoverAnimation?.flickerSpeed ?? 10;
    const waveEase: any = hoverAnimation?.waveEase ?? {
        type: "tween",
        duration: 1.5,
        ease: "linear",
    };
    const waveDuration: number = waveEase?.duration ?? 1.5;
    const waveEaseCurve: any = waveEase?.ease ?? "linear";
    const waveShuffleLimitEnabled: boolean =
        hoverAnimation?.waveShuffleLimitEnabled ?? false;
    const waveShuffleLimitValue: number =
        hoverAnimation?.waveShuffleLimitValue ?? 10;

    // ── Font ──────────────────────────────────────────────────────────────────
    const typeface = font;
    const textAlign: string = (typeface as any)?.textAlign ?? "center";

    const spanStyle = typeface
        ? Object.fromEntries(
              Object.entries(typeface).filter(([k]) => k !== "textAlign")
          )
        : {};

    const paragraphs: { text: string; gap: string }[][] = (words as string)
        .split("\n")
        .map((line) => {
            const tokens = line.match(/\s+|\S+/g) ?? [];
            const out: { text: string; gap: string }[] = [];
            let pendingGap = "";
            for (const tok of tokens) {
                if (/^\s+$/.test(tok)) pendingGap += tok;
                else {
                    out.push({ text: tok, gap: pendingGap });
                    pendingGap = "";
                }
            }
            return out;
        })
        .filter((p) => p.length > 0);

    const allWords: WordEntry[] = [];
    paragraphs.forEach((paraWords, pi) => {
        paraWords.forEach(({ text, gap }, wiInPara) => {
            allWords.push({
                text,
                gap,
                pi,
                wiInPara,
                globalWi: allWords.length,
            });
        });
    });

    // ── Refs ──────────────────────────────────────────────────────────────────
    const containerRef = useRef<HTMLDivElement | null>(null);
    const ghostRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const charRefs = useRef<Record<string, HTMLSpanElement | null>>({});

    const hoverModeRef = useRef(hoverMode);
    const hoverRadiusRef = useRef(hoverRadius);
    const hoverCollapseRef = useRef(hoverCollapse);
    const hoverCollapseTimeRef = useRef(hoverCollapseTime);
    const hoverFlickerEnabledRef = useRef(hoverFlickerEnabled);
    const hoverFlickerIntensityRef = useRef(hoverFlickerIntensity);
    const hoverFlickerSpeedRef = useRef(hoverFlickerSpeed);
    const hoverGlitchCharsRef = useRef(hoverGlitchChars);
    const hoverGlitchShuffleRef = useRef(hoverGlitchShuffle);
    const waveDurationRef = useRef(waveDuration);
    const waveEaseCurveRef = useRef(waveEaseCurve);
    const waveShuffleLimitEnabledRef = useRef(waveShuffleLimitEnabled);
    const waveShuffleLimitValueRef = useRef(waveShuffleLimitValue);

    useEffect(() => {
        hoverModeRef.current = hoverMode;
    }, [hoverMode]);
    useEffect(() => {
        hoverRadiusRef.current = hoverRadius;
    }, [hoverRadius]);
    useEffect(() => {
        hoverCollapseRef.current = hoverCollapse;
    }, [hoverCollapse]);
    useEffect(() => {
        hoverCollapseTimeRef.current = hoverCollapseTime;
    }, [hoverCollapseTime]);
    useEffect(() => {
        hoverFlickerEnabledRef.current = hoverFlickerEnabled;
    }, [hoverFlickerEnabled]);
    useEffect(() => {
        hoverFlickerIntensityRef.current = hoverFlickerIntensity;
    }, [hoverFlickerIntensity]);
    useEffect(() => {
        hoverFlickerSpeedRef.current = hoverFlickerSpeed;
    }, [hoverFlickerSpeed]);
    useEffect(() => {
        hoverGlitchCharsRef.current = hoverGlitchChars;
    }, [hoverGlitchChars]);
    useEffect(() => {
        hoverGlitchShuffleRef.current = hoverGlitchShuffle;
    }, [hoverGlitchShuffle]);
    useEffect(() => {
        waveDurationRef.current = waveDuration;
    }, [waveDuration]);
    useEffect(() => {
        waveEaseCurveRef.current = waveEaseCurve;
    }, [waveEaseCurve]);
    useEffect(() => {
        waveShuffleLimitEnabledRef.current = waveShuffleLimitEnabled;
    }, [waveShuffleLimitEnabled]);
    useEffect(() => {
        waveShuffleLimitValueRef.current = waveShuffleLimitValue;
    }, [waveShuffleLimitValue]);

    // ── State ─────────────────────────────────────────────────────────────────
    const [lineGroups, setLineGroups] = useState<number[][]>([]);
    const [displays, setDisplays] = useState<Record<string, CharState>>({});
    const [placedChars, setPlacedChars] = useState<Record<number, number[]>>({});
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [enterAnimComplete, setEnterAnimComplete] = useState(false);
    const [hoverDisplays, setHoverDisplays] = useState<Record<string, string>>({});
    const [hoverFlickerSet, setHoverFlickerSet] = useState<Set<string>>(new Set());

    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverFlickerTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const lastMidIdRef = useRef<string>("");
    const multiWaveTriggeredRef = useRef(false);
    const oneWaveTriggeredLinesRef = useRef<Set<number>>(new Set());
    const lastOneWaveLineRef = useRef<number | null>(null);
    const hasPlayedRef = useRef(false);
    const hoverRandomCharsRef = useRef<Record<string, string>>({});
    const hoverSceneRef = useRef<{
        lineMap: Map<number, CharInfo[]>;
        lineTopValues: number[];
        closestLineIdx: number;
        midCx: number;
        closestLineTop: number;
    } | null>(null);

    const waveRafRef = useRef<number | null>(null);
    const waveCancelRef = useRef(false);

    const lineWaveRafsRef = useRef<Map<number, number>>(new Map());
    const lineWavePlayingRef = useRef<Set<number>>(new Set());

    // ── Line detection ────────────────────────────────────────────────────────
    const detectLines = () => {
        const allLines: number[][] = [];
        paragraphs.forEach((_, pi) => {
            const paraEntries = allWords.filter((w) => w.pi === pi);
            const measured = paraEntries
                .map((w) => ({
                    globalWi: w.globalWi,
                    top: ghostRefs.current[w.globalWi]
                        ? Math.round(
                              ghostRefs.current[
                                  w.globalWi
                              ]!.getBoundingClientRect().top
                          )
                        : -1,
                }))
                .filter((m) => m.top >= 0);
            const tops = [...new Set(measured.map((m) => m.top))].sort(
                (a, b) => a - b
            );
            tops.forEach((top) =>
                allLines.push(
                    measured.filter((m) => m.top === top).map((m) => m.globalWi)
                )
            );
        });
        setLineGroups(allLines);
    };

    useLayoutEffect(() => {
        detectLines();
    }, [words, font]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const obs = new ResizeObserver(() => detectLines());
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        setShouldAnimate(false);
        setDisplays({});
        setPlacedChars({});
        setEnterAnimComplete(false);
    }, [enterMode, words]);

    useEffect(() => {
        waveCancelRef.current = true;
        if (waveRafRef.current) {
            cancelAnimationFrame(waveRafRef.current);
            waveRafRef.current = null;
        }
        lineWaveRafsRef.current.forEach((id) => cancelAnimationFrame(id));
        lineWaveRafsRef.current.clear();
        lineWavePlayingRef.current.clear();
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        hoverFlickerTimersRef.current.forEach(clearTimeout);
        hoverFlickerTimersRef.current = [];
        lastMidIdRef.current = "";
        hoverRandomCharsRef.current = {};
        hoverSceneRef.current = null;
        setHoverDisplays({});
        setHoverFlickerSet(new Set());
    }, [hoverMode, words]);

    // ── IntersectionObserver ──────────────────────────────────────────────────
    useEffect(() => {
        if (enterMode === "none") return;
        const el = containerRef.current;
        if (!el) return;
        let threshold = 0;
        if (enterPosition === "middle") threshold = 0.5;
        else if (enterPosition === "below") threshold = 1.0;
        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (!hasPlayedRef.current) {
                        hasPlayedRef.current = true;
                        setShouldAnimate(true);
                        if (!enterReplay) obs.disconnect();
                    }
                } else if (enterReplay) {
                    hasPlayedRef.current = false;
                    setShouldAnimate(false);
                    setDisplays({});
                    setPlacedChars({});
                    setEnterAnimComplete(false);
                }
            },
            { threshold }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [enterMode, lineGroups, enterReplay, enterPosition, enterRestState]);

    // ── Enter animation ───────────────────────────────────────────────────────
    useEffect(() => {
        if (enterMode === "none" || !shouldAnimate || lineGroups.length === 0)
            return;
        let cancelled = false;
        setDisplays({});
        setPlacedChars({});
        setEnterAnimComplete(false);

        const durationMs = enterDuration * 1000;
        const sequentialSteps: number = Math.max(
            1,
            allWords.reduce((s, w) => s + w.text.length, 0)
        );
        const animStart = performance.now();
        const animEndTime = animStart + durationMs;
        const easeFn = makeEaseFn(enterEaseCurve);
        const targetAt = (step: number) =>
            animStart + durationMs * easeFn(step / sequentialSteps);
        const targetAtScaled = (step: number, total: number) =>
            animStart + durationMs * easeFn(step / Math.max(1, total));
        const speedMult = 10 / Math.max(1, Math.min(20, enterFlickerSpeed));

        const wordToLine = new Map<number, number>();
        lineGroups.forEach((g, li) =>
            g.forEach((gWi) => wordToLine.set(gWi, li))
        );
        const lineEndTimes: number[] = [];
        if (enterMode === "oneLine") {
            let cum = 0;
            for (const group of lineGroups) {
                cum += group.reduce(
                    (s, gWi) => s + allWords[gWi].text.length,
                    0
                );
                lineEndTimes.push(targetAt(cum));
            }
        }
        const lineEndForChar = (gWi: number): number =>
            enterMode === "oneLine"
                ? (lineEndTimes[wordToLine.get(gWi) ?? 0] ?? animEndTime)
                : animEndTime;
        const sleep = (ms: number) =>
            new Promise<void>((r) => setTimeout(r, Math.max(0, ms)));

        const nextGlitchChar = (char: string): string => {
            const isLower =
                char === char.toLowerCase() && char !== char.toUpperCase();
            const pool = isLower ? GLITCH_CHARS_LOWER : GLITCH_CHARS_UPPER;
            return pool[Math.floor(Math.random() * pool.length)];
        };

        const maybeFlicker = async (id: string, endTime: number) => {
            const intensity = Math.max(0, Math.min(100, enterFlickerIntensity));
            if (!enterFlickerEnabled || intensity === 0) return;
            if (Math.random() > intensity / 100) return;
            if (performance.now() >= endTime) return;
            const maxFlickers = Math.max(1, Math.round(intensity / 8));
            const flickers = Math.max(
                1,
                Math.round(maxFlickers / 2) +
                    Math.floor(Math.random() * (maxFlickers / 2 + 1))
            );
            for (let i = 0; i < flickers; i++) {
                await sleep((40 + Math.random() * 80) * speedMult);
                if (cancelled) return;
                if (performance.now() >= endTime) {
                    setDisplays((p) =>
                        p[id]
                            ? { ...p, [id]: { ...p[id], flickering: false } }
                            : p
                    );
                    return;
                }
                setDisplays((p) =>
                    p[id] ? { ...p, [id]: { ...p[id], flickering: true } } : p
                );
                await sleep((30 + Math.random() * 60) * speedMult);
                if (cancelled) return;
                setDisplays((p) =>
                    p[id] ? { ...p, [id]: { ...p[id], flickering: false } } : p
                );
            }
        };

        const animateChar = async (
            globalWi: number,
            ci: number,
            char: string,
            targetEnd: number
        ) => {
            if (cancelled) return;
            const id = `${globalWi}-${ci}`;
            const flickerEndTime = lineEndForChar(globalWi);
            if (char === "." || char === " ") {
                setDisplays((p) => ({
                    ...p,
                    [id]: { char, locked: true, flickering: false },
                }));
                await sleep(targetEnd - performance.now());
                maybeFlicker(id, flickerEndTime);
                return;
            }
            const scrambleIntensity = Math.max(
                0,
                Math.min(100, enterScrambleIntensity)
            );
            const desiredFrames =
                scrambleIntensity === 0
                    ? 0
                    : 1 +
                      Math.floor(
                          Math.random() * Math.round(scrambleIntensity / 7)
                      );
            const window = targetEnd - performance.now();
            const minDelay = 15;
            const maxFitFrames = Math.max(
                1,
                Math.floor((window * 0.8) / minDelay)
            );
            const glitchFrames = Math.min(desiredFrames, maxFitFrames);
            const glitchDelay =
                glitchFrames > 0
                    ? Math.max(
                          minDelay,
                          Math.floor((window * 0.8) / glitchFrames)
                      )
                    : minDelay;
            if (glitchFrames > 0) {
                for (let i = 0; i < glitchFrames; i++) {
                    if (cancelled) return;
                    setDisplays((p) => ({
                        ...p,
                        [id]: {
                            char: nextGlitchChar(char),
                            locked: false,
                            flickering: false,
                        },
                    }));
                    await sleep(glitchDelay);
                    if (cancelled) return;
                }
            }
            setDisplays((p) => ({
                ...p,
                [id]: { char, locked: true, flickering: false },
            }));
            await sleep(targetEnd - performance.now());
            maybeFlicker(id, flickerEndTime);
        };

        const shuffle = (arr: number[]) => {
            const a = [...arr];
            for (let i = a.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [a[i], a[j]] = [a[j], a[i]];
            }
            return a;
        };

        const animateWordInsert = async (
            gWi: number,
            getTargetEnd: () => number
        ) => {
            const word = allWords[gWi].text;
            for (const ci of shuffle(word.split("").map((_, ci) => ci))) {
                if (cancelled) return;
                setPlacedChars((p) => {
                    const cur = p[gWi] ?? [];
                    return { ...p, [gWi]: [...cur, ci].sort((a, b) => a - b) };
                });
                await animateChar(gWi, ci, word[ci], getTargetEnd());
            }
        };

        const run = async () => {
            if (enterMode === "oneLine") {
                let idx = 0;
                for (const group of lineGroups)
                    for (const gWi of group) {
                        if (cancelled) return;
                        await animateWordInsert(gWi, () => targetAt(++idx));
                    }
            } else if (enterMode === "multiLine") {
                await Promise.all(
                    lineGroups.map(async (group) => {
                        const lineSteps = group.reduce(
                            (s, gWi) => s + allWords[gWi].text.length,
                            0
                        );
                        let li = 0;
                        for (const gWi of group) {
                            if (cancelled) return;
                            await animateWordInsert(gWi, () =>
                                targetAtScaled(++li, lineSteps)
                            );
                        }
                    })
                );
            } else {
                const all: { globalWi: number; ci: number; char: string }[] = [];
                allWords.forEach((w) =>
                    w.text
                        .split("")
                        .forEach((char, ci) =>
                            all.push({ globalWi: w.globalWi, ci, char })
                        )
                );
                for (let i = all.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [all[i], all[j]] = [all[j], all[i]];
                }
                let idx = 0;
                for (const { globalWi, ci, char } of all) {
                    if (cancelled) return;
                    await animateChar(globalWi, ci, char, targetAt(++idx));
                }
            }
        };

        (async () => {
            await run();
            if (!cancelled) setEnterAnimComplete(true);
        })();
        return () => {
            cancelled = true;
        };
    }, [
        lineGroups,
        enterMode,
        enterFlickerEnabled,
        enterFlickerIntensity,
        enterFlickerSpeed,
        enterScrambleIntensity,
        enterDuration,
        enterEaseCurve,
        shouldAnimate,
    ]);

    useEffect(
        () => () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (waveRafRef.current) cancelAnimationFrame(waveRafRef.current);
            lineWaveRafsRef.current.forEach((id) => cancelAnimationFrame(id));
            hoverFlickerTimersRef.current.forEach(clearTimeout);
        },
        []
    );

    // ── Diffusion helpers ─────────────────────────────────────────────────────
    const getOrSetHoverChar = (id: string, offset: number): string => {
        if (hoverRandomCharsRef.current[id] === undefined) {
            const pool = hoverGlitchCharsRef.current.trim();
            if (pool.length === 0) {
                hoverRandomCharsRef.current[id] =
                    Math.random() < 0.5 ? "0" : "1";
            } else if (hoverGlitchShuffleRef.current) {
                hoverRandomCharsRef.current[id] =
                    pool[Math.floor(Math.random() * pool.length)];
            } else {
                const len = pool.length;
                hoverRandomCharsRef.current[id] =
                    pool[((offset % len) + len) % len];
            }
        }
        return hoverRandomCharsRef.current[id];
    };

    const buildHoverDisplays = (radius: number): Record<string, string> => {
        const scene = hoverSceneRef.current;
        if (!scene) return {};
        const {
            lineMap,
            lineTopValues,
            closestLineIdx,
            midCx,
            closestLineTop,
        } = scene;
        const out: Record<string, string> = {};
        const applyLine = (lineTop: number, r: number) => {
            const chars = lineMap.get(lineTop);
            if (!chars || chars.length === 0 || r < 0) return;
            const firstChar = chars[0];
            const lastChar = chars[chars.length - 1];
            const avgSpacing =
                chars.length > 1
                    ? (lastChar.cx - firstChar.cx) / (chars.length - 1)
                    : 20;

            let pivotIdx = 0,
                minD = Infinity;
            chars.forEach((c, i) => {
                const d = Math.abs(c.cx - midCx);
                if (d < minD) {
                    minD = d;
                    pivotIdx = i;
                }
            });

            if (minD > (r + 0.5) * avgSpacing) return;

            for (
                let idx = Math.max(0, pivotIdx - r);
                idx <= Math.min(chars.length - 1, pivotIdx + r);
                idx++
            )
                out[chars[idx].id] = getOrSetHoverChar(
                    chars[idx].id,
                    idx - pivotIdx
                );
        };
        if (hoverModeRef.current === "diffusionOneLine") {
            applyLine(closestLineTop, radius);
        } else {
            lineTopValues.forEach((lt, li) =>
                applyLine(lt, radius - Math.abs(li - closestLineIdx))
            );
        }
        return out;
    };

    const clearFlickerTimers = () => {
        hoverFlickerTimersRef.current.forEach(clearTimeout);
        hoverFlickerTimersRef.current = [];
    };

    const clearHoverState = () => {
        waveCancelRef.current = true;
        if (waveRafRef.current) {
            cancelAnimationFrame(waveRafRef.current);
            waveRafRef.current = null;
        }
        lineWaveRafsRef.current.forEach((id) => cancelAnimationFrame(id));
        lineWaveRafsRef.current.clear();
        lineWavePlayingRef.current.clear();
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        clearFlickerTimers();
        lastMidIdRef.current = "";
        hoverRandomCharsRef.current = {};
        hoverSceneRef.current = null;
        setHoverDisplays({});
        setHoverFlickerSet(new Set());
    };

    const flickerChar = (id: string) => {
        const intensity = Math.max(
            0,
            Math.min(100, hoverFlickerIntensityRef.current)
        );
        const speedMult =
            10 / Math.max(1, Math.min(20, hoverFlickerSpeedRef.current));
        const maxFlickers = Math.max(1, Math.round(intensity / 8));
        const flickers = Math.max(
            1,
            Math.round(maxFlickers / 2) +
                Math.floor(Math.random() * (maxFlickers / 2 + 1))
        );
        let delay = 0;
        for (let i = 0; i < flickers; i++) {
            const onAt =
                delay + Math.floor((15 + Math.random() * 50) * speedMult);
            const offAt =
                onAt + Math.floor((25 + Math.random() * 55) * speedMult);
            hoverFlickerTimersRef.current.push(
                setTimeout(
                    () =>
                        setHoverFlickerSet((p) => {
                            const s = new Set(p);
                            s.add(id);
                            return s;
                        }),
                    onAt
                )
            );
            hoverFlickerTimersRef.current.push(
                setTimeout(
                    () =>
                        setHoverFlickerSet((p) => {
                            const s = new Set(p);
                            s.delete(id);
                            return s;
                        }),
                    offAt
                )
            );
            delay = offAt;
        }
    };

    const applyDiffusion = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        clearFlickerTimers();
        const newDisplays = buildHoverDisplays(hoverRadiusRef.current);
        setHoverDisplays(newDisplays);
        setHoverFlickerSet(new Set());
        if (hoverFlickerEnabledRef.current) {
            const intensity = Math.max(
                0,
                Math.min(100, hoverFlickerIntensityRef.current)
            );
            if (intensity > 0) {
                Object.keys(newDisplays).forEach((id) => {
                    if (Math.random() > intensity / 100) return;
                    hoverFlickerTimersRef.current.push(
                        setTimeout(
                            () => flickerChar(id),
                            Math.floor(Math.random() * 60)
                        )
                    );
                });
            }
        }
        if (hoverCollapseRef.current) {
            let r = hoverRadiusRef.current;
            const stepMs =
                (hoverCollapseTimeRef.current * 1000) / Math.max(1, r);
            const collapseStep = () => {
                r--;
                setHoverDisplays(buildHoverDisplays(r));
                if (r > 0) {
                    hoverTimerRef.current = setTimeout(collapseStep, stepMs);
                } else {
                    setHoverDisplays({});
                    setHoverFlickerSet(new Set());
                    clearFlickerTimers();
                    hoverRandomCharsRef.current = {};
                    lastMidIdRef.current = "";
                }
            };
            hoverTimerRef.current = setTimeout(collapseStep, stepMs);
        }
    };

    // ── Wave helpers ──────────────────────────────────────────────────────────
    const buildWaveTick = (
        orderedChars: CharInfo[],
        fi: number,
        glitchState: Record<string, string>,
        GLITCH_RATE: number
    ): { toAdd: Record<string, string>; toRemove: string[] } => {
        const limitEnabled = waveShuffleLimitEnabledRef.current;
        const limitValue = waveShuffleLimitValueRef.current;
        const frontierIdx = Math.floor(fi);
        const frac = fi - frontierIdx;
        const n = orderedChars.length;

        const rndGlitch = () =>
            GLITCH_CHARS_UPPER[
                Math.floor(Math.random() * GLITCH_CHARS_UPPER.length)
            ];
        const rndCursor = () =>
            WAVE_CURSOR_CHARS[
                Math.floor(Math.random() * WAVE_CURSOR_CHARS.length)
            ];

        const toAdd: Record<string, string> = {};
        const toRemove: string[] = [];

        for (let i = 0; i < n; i++) {
            const { id } = orderedChars[i];

            if (i === frontierIdx) {
                glitchState[id] = rndCursor();
                toAdd[id] = glitchState[id];
            } else if (i === frontierIdx + 1 && i < n && Math.random() < frac) {
                toAdd[id] = rndCursor();
            } else if (i > fi) {
                delete glitchState[id];
                toRemove.push(id);
            } else if (limitEnabled && fi - i > limitValue) {
                delete glitchState[id];
                toRemove.push(id);
            } else {
                if (!glitchState[id] || Math.random() < GLITCH_RATE) {
                    glitchState[id] = rndGlitch();
                }
                toAdd[id] = glitchState[id];
            }
        }

        return { toAdd, toRemove };
    };

    const startLineWave = (lineTop: number, orderedChars: CharInfo[]) => {
        if (lineWaveRafsRef.current.has(lineTop)) {
            cancelAnimationFrame(lineWaveRafsRef.current.get(lineTop)!);
            lineWaveRafsRef.current.delete(lineTop);
        }
        lineWavePlayingRef.current.add(lineTop);

        const n = orderedChars.length;
        if (n === 0) {
            lineWavePlayingRef.current.delete(lineTop);
            return;
        }

        const durMs = waveDurationRef.current * 1000;
        const limitEnabled = waveShuffleLimitEnabledRef.current;
        const limitValue = waveShuffleLimitValueRef.current;
        const totalSteps = limitEnabled ? n + limitValue : n;
        const GLITCH_RATE = 0.4;
        const glitchState: Record<string, string> = {};
        const waveStart = performance.now();
        const easeFn = makeEaseFn(waveEaseCurveRef.current);

        const tick = () => {
            if (!lineWavePlayingRef.current.has(lineTop)) return;

            const t = Math.min(1, (performance.now() - waveStart) / durMs);
            const fi = easeFn(t) * totalSteps;
            const { toAdd, toRemove } = buildWaveTick(
                orderedChars,
                fi,
                glitchState,
                GLITCH_RATE
            );

            setHoverDisplays((prev) => {
                const u = { ...prev };
                toRemove.forEach((id) => delete u[id]);
                return Object.assign(u, toAdd);
            });

            if (fi < totalSteps) {
                const rafId = requestAnimationFrame(tick);
                lineWaveRafsRef.current.set(lineTop, rafId);
            } else {
                lineWavePlayingRef.current.delete(lineTop);
                lineWaveRafsRef.current.delete(lineTop);
                setHoverDisplays((prev) => {
                    const u = { ...prev };
                    orderedChars.forEach(({ id }) => delete u[id]);
                    return u;
                });
            }
        };

        const rafId = requestAnimationFrame(tick);
        lineWaveRafsRef.current.set(lineTop, rafId);
    };

    // ── Mouse handlers ────────────────────────────────────────────────────────
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (hoverMode === "none") return;
        if (
            hoverMode === "waveMultiLine" &&
            (lineWavePlayingRef.current.size > 0 ||
                multiWaveTriggeredRef.current)
        )
            return;

        const chars: CharInfo[] = [];
        for (const [id, el] of Object.entries(charRefs.current)) {
            if (!el) continue;
            const rect = el.getBoundingClientRect();
            if (rect.width === 0 && rect.height === 0) continue;
            chars.push({
                id,
                cx: rect.left + rect.width / 2,
                lineTop: Math.round(rect.top),
            });
        }
        if (chars.length === 0) return;

        const lineTopValues = [...new Set(chars.map((c) => c.lineTop))].sort(
            (a, b) => a - b
        );
        const lineMap = new Map<number, CharInfo[]>();
        for (const lt of lineTopValues)
            lineMap.set(
                lt,
                chars
                    .filter((c) => c.lineTop === lt)
                    .sort((a, b) => a.cx - b.cx)
            );

        const { clientX, clientY } = e;

        let targetLineTop: number | null = null;
        for (const lt of lineTopValues) {
            const lc = lineMap.get(lt)!;
            const sampleEl = charRefs.current[lc[0].id];
            if (!sampleEl) continue;
            const rect = sampleEl.getBoundingClientRect();
            if (clientY >= rect.top && clientY <= rect.bottom) {
                targetLineTop = lt;
                break;
            }
        }

        if (hoverMode === "waveOneLine") {
            if (
                lastOneWaveLineRef.current !== null &&
                lastOneWaveLineRef.current !== targetLineTop
            ) {
                oneWaveTriggeredLinesRef.current.delete(
                    lastOneWaveLineRef.current
                );
            }
            lastOneWaveLineRef.current = targetLineTop;
            if (targetLineTop === null) return;
            if (lineWavePlayingRef.current.has(targetLineTop)) return;
            if (oneWaveTriggeredLinesRef.current.has(targetLineTop)) return;
            oneWaveTriggeredLinesRef.current.add(targetLineTop);
            const lineChars = (lineMap.get(targetLineTop) ?? [])
                .slice()
                .sort((a, b) => a.cx - b.cx);
            startLineWave(targetLineTop, lineChars);
            return;
        }

        if (hoverMode === "waveMultiLine") {
            if (targetLineTop === null) return;
            multiWaveTriggeredRef.current = true;
            for (const lt of lineTopValues) {
                const lineChars = (lineMap.get(lt) ?? [])
                    .slice()
                    .sort((a, b) => a.cx - b.cx);
                startLineWave(lt, lineChars);
            }
            return;
        }

        if (targetLineTop === null) {
            if (lastMidIdRef.current !== "") clearHoverState();
            return;
        }

        const closestLineChars = lineMap.get(targetLineTop)!;
        const closestLineIdx = lineTopValues.indexOf(targetLineTop);
        let midIdx = 0,
            minXDist = Infinity;
        closestLineChars.forEach((c, i) => {
            const d = Math.abs(c.cx - clientX);
            if (d < minXDist) {
                minXDist = d;
                midIdx = i;
            }
        });
        const midId = closestLineChars[midIdx].id;
        if (midId === lastMidIdRef.current) return;
        lastMidIdRef.current = midId;
        hoverRandomCharsRef.current = {};

        hoverSceneRef.current = {
            lineMap,
            lineTopValues,
            closestLineIdx,
            midCx: closestLineChars[midIdx].cx,
            closestLineTop: targetLineTop,
        };
        applyDiffusion();
    };

    const handleMouseLeave = () => {
        multiWaveTriggeredRef.current = false;
        oneWaveTriggeredLinesRef.current.clear();
        lastOneWaveLineRef.current = null;
        if (
            (hoverMode === "waveMultiLine" || hoverMode === "waveOneLine") &&
            lineWavePlayingRef.current.size > 0
        )
            return;
        clearHoverState();
    };

    // ── Render ────────────────────────────────────────────────────────────────
    const isInsertEnter = enterMode === "oneLine" || enterMode === "multiLine";

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start",
                gap: "0.1em",
                background: "transparent",
                overflow: "hidden",
                userSelect: "none",
                ...style,
            }}
        >
            {paragraphs.map((_, pi) => {
                const paraEntries = allWords.filter((w) => w.pi === pi);
                return (
                    <Tag
                        key={pi}
                        onMouseLeave={() => {
                            multiWaveTriggeredRef.current = false;
                        }}
                        style={{
                            position: "relative",
                            width: "100%",
                            margin: 0,
                            padding: 0,
                            fontWeight: "inherit",
                            fontSize: "inherit",
                            lineHeight: "inherit",
                        }}
                    >
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                width: "100%",
                                visibility: "hidden",
                                pointerEvents: "none",
                                textAlign: textAlign as any,
                            }}
                        >
                            {paraEntries.map((wordEntry) => (
                                <Fragment key={wordEntry.globalWi}>
                                    {wordEntry.gap && (
                                        <span
                                            style={{
                                                ...spanStyle,
                                                letterSpacing: "0.05em",
                                                whiteSpace: "pre",
                                            }}
                                        >
                                            {wordEntry.gap}
                                        </span>
                                    )}
                                    <span
                                        ref={(el) => {
                                            ghostRefs.current[
                                                wordEntry.globalWi
                                            ] = el;
                                        }}
                                        style={{
                                            ...spanStyle,
                                            letterSpacing: "0.05em",
                                            display: "inline-block",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {wordEntry.text}
                                    </span>
                                </Fragment>
                            ))}
                        </div>

                        <div
                            style={{
                                width: "100%",
                                textAlign: textAlign as any,
                            }}
                        >
                            {paraEntries.map((wordEntry) => {
                                return (
                                    <Fragment key={wordEntry.globalWi}>
                                        {wordEntry.gap && (
                                            <span
                                                style={{
                                                    ...spanStyle,
                                                    letterSpacing: "0.05em",
                                                    color,
                                                    whiteSpace: "pre",
                                                }}
                                            >
                                                {wordEntry.gap}
                                            </span>
                                        )}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                whiteSpace: "nowrap",
                                            }}
                                        >
                                            {wordEntry.text
                                                .split("")
                                                .map((char, ci) => {
                                                    const id = `${wordEntry.globalWi}-${ci}`;
                                                    const hoverChar =
                                                        hoverDisplays[id];
                                                    const enterState =
                                                        displays[id];
                                                    const isHF =
                                                        hoverFlickerSet.has(id);

                                                    let displayChar = char,
                                                        charColor = color;

                                                    if (
                                                        hoverChar !== undefined
                                                    ) {
                                                        displayChar = hoverChar;
                                                        charColor =
                                                            isHF &&
                                                            hoverFlickerEnabled
                                                                ? hoverFlickerColor
                                                                : glitchColor;
                                                    } else if (
                                                        isHF &&
                                                        hoverFlickerEnabled
                                                    ) {
                                                        charColor =
                                                            hoverFlickerColor;
                                                    } else if (
                                                        enterMode !== "none"
                                                    ) {
                                                        if (!enterState) {
                                                            charColor =
                                                                !shouldAnimate &&
                                                                enterRestState ===
                                                                    "solid"
                                                                    ? color
                                                                    : "transparent";
                                                        } else {
                                                            displayChar =
                                                                enterState.char;
                                                            charColor =
                                                                enterState.flickering
                                                                    ? enterFlickerEnabled
                                                                        ? enterFlickerColor
                                                                        : color
                                                                    : enterState.locked
                                                                      ? color
                                                                      : glitchColor;
                                                        }
                                                    }

                                                    const hideChar =
                                                        isInsertEnter &&
                                                        shouldAnimate &&
                                                        !enterAnimComplete &&
                                                        !enterState &&
                                                        hoverChar === undefined;

                                                    return (
                                                        <span
                                                            key={ci}
                                                            ref={(el) => {
                                                                charRefs.current[
                                                                    id
                                                                ] = el;
                                                            }}
                                                            style={{
                                                                ...spanStyle,
                                                                letterSpacing:
                                                                    "0.05em",
                                                                color: charColor,
                                                                display:
                                                                    hideChar
                                                                        ? "none"
                                                                        : undefined,
                                                            }}
                                                        >
                                                            {displayChar}
                                                        </span>
                                                    );
                                                })}
                                        </span>
                                    </Fragment>
                                );
                            })}
                        </div>
                    </Tag>
                );
            })}
        </div>
    );
};

export const GlitchCharReveal = ScrambleText;
export default ScrambleText;
